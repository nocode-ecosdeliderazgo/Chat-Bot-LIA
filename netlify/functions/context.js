const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

function json(status, data) {
    return {
        statusCode: status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization, X-User-Id',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
        },
        body: JSON.stringify(data)
    };
}

function verifyUser(event) {
    try {
        const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
        const userId = event.headers['x-user-id'] || event.headers['X-User-Id'];
        if (!authHeader.startsWith('Bearer ') || !userId) return null;
        const token = authHeader.slice(7);
        const secret = process.env.JWT_SECRET;
        if (!secret) return null;
        const payload = jwt.verify(token, secret);
        if (String(payload.sub) !== String(userId)) return null;
        return { userId: String(userId), username: payload.username || 'user' };
    } catch (_) { return null; }
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

    try {
        const user = verifyUser(event);
        if (!user) return json(401, { error: 'Sesión requerida' });

        if (!process.env.DATABASE_URL) return json(200, { data: [] });

        const { userQuestion } = JSON.parse(event.body || '{}');
        if (!userQuestion || typeof userQuestion !== 'string') {
            return json(400, { error: 'userQuestion requerido como string' });
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

        return json(200, { data: formatted });
    } catch (e) {
        console.error('context fn error', e);
        return json(500, { error: 'Error consultando contexto' });
    }
};


