const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { createCorsResponse } = require('./cors-utils');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

function json(status, data, event = null) {
    return createCorsResponse(status, data, event, true); // true para incluir credentials
}

function verifyUser(event) {
    console.log('[CONTEXT VERIFY] Starting verification');
    try {
        const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
        const userId = event.headers['x-user-id'] || event.headers['X-User-Id'];
        console.log('[CONTEXT VERIFY] Auth header exists:', !!authHeader);
        console.log('[CONTEXT VERIFY] User ID:', userId);
        
        if (!authHeader.startsWith('Bearer ') || !userId) {
            console.log('[CONTEXT VERIFY] Missing auth header or user ID');
            return null;
        }
        const token = authHeader.slice(7);
        console.log('[CONTEXT VERIFY] Token preview:', token.substring(0, 30) + '...');
        
        // MODO DESARROLLO: Aceptar tokens de desarrollo
        if (token.includes('fake-signature-for-dev-testing-only')) {
            console.log('[CONTEXT DEV AUTH] Aceptando token de desarrollo');
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    console.log('[CONTEXT DEV AUTH] Payload:', payload);
                    if (payload.sub && payload.username) {
                        const result = { 
                            userId: String(payload.sub), 
                            username: payload.username || 'dev-user' 
                        };
                        console.log('[CONTEXT DEV AUTH] Success:', result);
                        return result;
                    }
                }
            } catch (decodeError) {
                console.log('[CONTEXT DEV AUTH] Decode error:', decodeError.message);
            }
            console.log('[CONTEXT DEV AUTH] Using fallback');
            return { userId: String(userId), username: 'dev-user' };
        }
        
        // MODO PRODUCCIÓN: Verificar JWT normal
        const secret = process.env.JWT_SECRET;
        console.log('[CONTEXT VERIFY] JWT_SECRET exists:', !!secret);
        if (!secret) {
            console.log('[CONTEXT VERIFY] No JWT_SECRET found');
            return null;
        }
        const payload = jwt.verify(token, secret);
        if (String(payload.sub) !== String(userId)) return null;
        return { userId: String(userId), username: payload.username || 'user' };
    } catch (error) { 
        console.log('[CONTEXT VERIFY] Exception:', error.message);
        return null; 
    }
}

exports.handler = async (event) => {
    console.log('[CONTEXT HANDLER] Request method:', event.httpMethod);
    console.log('[CONTEXT HANDLER] Headers:', JSON.stringify(event.headers, null, 2));
    
    if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

    try {
        const user = verifyUser(event);
        console.log('[CONTEXT HANDLER] User verification result:', user);
        if (!user) return json(401, { error: 'Sesión requerida' }, event);

        if (!process.env.DATABASE_URL) return json(200, { data: [] }, event);

        const { userQuestion } = JSON.parse(event.body || '{}');
        if (!userQuestion || typeof userQuestion !== 'string') {
            return json(400, { error: 'userQuestion requerido como string' }, event);
        }

        const searchTerm = `%${userQuestion.toLowerCase().trim()}%`;
        const contextQuery = `
            SELECT 'glossary' as source, g.id, null as session_id, null as session_title,
                   g.term, g.definition, null as question, null as answer,
                   null as title, null as description, null as text,
                   length(g.term) as relevance_score
            FROM public.glossary_term g
            WHERE LOWER(g.term) ILIKE $1 OR LOWER(g.definition) ILIKE $1
            UNION ALL
            SELECT 'faq' as source, f.id, f.session_id, cs.title as session_title,
                   null, null, f.question, f.answer, null, null, null,
                   length(f.question) + length(f.answer) as relevance_score
            FROM public.session_faq f
            JOIN public.course_session cs ON f.session_id = cs.id
            WHERE LOWER(f.question) ILIKE $1 OR LOWER(f.answer) ILIKE $1
            UNION ALL
            SELECT 'activity' as source, a.id, a.session_id, cs.title, null, null,
                   null, null, a.title, a.description, null,
                   length(a.title) + COALESCE(length(a.description), 0) as relevance_score
            FROM public.session_activity a
            JOIN public.course_session cs ON a.session_id = cs.id
            WHERE LOWER(a.title) ILIKE $1 OR LOWER(a.description) ILIKE $1
            UNION ALL
            SELECT 'question' as source, q.id, q.session_id, cs.title, null, null,
                   null, null, null, null, q.text, length(q.text) as relevance_score
            FROM public.session_question q
            JOIN public.course_session cs ON q.session_id = cs.id
            WHERE LOWER(q.text) ILIKE $1
            ORDER BY relevance_score DESC, source
            LIMIT 8
        `;

        const { rows } = await pool.query(contextQuery, [searchTerm]);
        const formatted = rows.map(row => {
            const base = { source: row.source, id: row.id, session_id: row.session_id, session_title: row.session_title };
            switch (row.source) {
                case 'glossary':
                    return { ...base, term: row.term, definition: row.definition };
                case 'faq':
                    return { ...base, question: row.question, answer: row.answer };
                case 'activity':
                    return { ...base, title: row.title, description: row.description };
                case 'question':
                    return { ...base, text: row.text };
                default:
                    return base;
            }
        });

        return json(200, { data: formatted }, event);
    } catch (e) {
        console.error('context fn error', e);
        return json(500, { error: 'Error consultando contexto' }, event);
    }
};


