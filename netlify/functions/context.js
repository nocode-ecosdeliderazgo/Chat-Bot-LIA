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
    try {
        const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
        const userId = event.headers['x-user-id'] || event.headers['X-User-Id'];
        if (!authHeader.startsWith('Bearer ') || !userId) return null;
        const token = authHeader.slice(7);
        
        // MODO DESARROLLO: Aceptar tokens de desarrollo
        if (token.includes('fake-signature-for-dev-testing-only')) {
            console.log('[DEV AUTH] Aceptando token de desarrollo para context');
            try {
                // Decodificar payload del token JWT de desarrollo
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    if (payload.sub && payload.username) {
                        return { 
                            userId: String(payload.sub), 
                            username: payload.username || 'dev-user' 
                        };
                    }
                }
            } catch (_) {}
            return { userId: String(userId), username: 'dev-user' };
        }
        
        // MODO PRODUCCIÓN: Verificar JWT normal
        const secret = process.env.JWT_SECRET;
        if (!secret) return null;
        const payload = jwt.verify(token, secret);
        if (String(payload.sub) !== String(userId)) return null;
        return { userId: String(userId), username: payload.username || 'user' };
    } catch (_) { 
        // Fallback para desarrollo si el JWT falla
        const userId = event.headers['x-user-id'] || event.headers['X-User-Id'];
        if (userId && (userId.includes('test') || userId.includes('demo') || userId.includes('dev'))) {
            console.log('[DEV AUTH] Fallback de desarrollo para context:', userId);
            return { userId: String(userId), username: 'dev-user' };
        }
        return null; 
    }
}

exports.handler = async (event) => {
    console.log('[CONTEXT DEBUG] Method:', event.httpMethod);
    console.log('[CONTEXT DEBUG] Headers:', JSON.stringify(event.headers, null, 2));
    
    if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

    try {
        const user = verifyUser(event);
        console.log('[CONTEXT DEBUG] User verification result:', user);
        if (!user) return json(401, { error: 'Sesión requerida' }, event);

        if (!process.env.DATABASE_URL) return json(200, { data: [] }, event);

        const { userQuestion } = JSON.parse(event.body || '{}');
        if (!userQuestion || typeof userQuestion !== 'string') {
            return json(400, { error: 'userQuestion requerido como string' }, event);
        }

        const searchTerm = `%${userQuestion.toLowerCase().trim()}%`;
        const contextQuery = `
            -- Términos del glosario (mantenido)
            SELECT 'glossary' as source, g.id::text, null as course_id, null as module_id,
                   g.term, g.definition, null as question, null as answer,
                   null as title, null as description, null as content, g.category,
                   length(g.term) as relevance_score
            FROM public.glossary_term g
            WHERE LOWER(g.term) ILIKE $1 OR LOWER(g.definition) ILIKE $1
            
            UNION ALL
            
            -- FAQs específicas del chatbot (NUEVA TABLA)
            SELECT 'chatbot_faq' as source, cf.id::text, null as course_id, null as module_id,
                   null as term, null as definition, cf.question, cf.answer,
                   null as title, null as description, null as content, cf.category,
                   (length(cf.question) + length(cf.answer)) * cf.priority as relevance_score
            FROM public.chatbot_faq cf
            WHERE LOWER(cf.question) ILIKE $1 OR LOWER(cf.answer) ILIKE $1
            
            UNION ALL
            
            -- Información de cursos (NUEVA TABLA)
            SELECT 'course' as source, ac.id_ai_courses::text, ac.id_ai_courses::text, null as module_id,
                   null as term, null as definition, null as question, null as answer,
                   ac.name as title, ac.long_description as description, ac.short_description as content, 
                   COALESCE(ac.modality, 'general') as category,
                   length(ac.name) + length(ac.long_description) as relevance_score
            FROM public.ai_courses ac
            WHERE LOWER(ac.name) ILIKE $1 
               OR LOWER(ac.long_description) ILIKE $1 
               OR LOWER(ac.short_description) ILIKE $1
            
            UNION ALL
            
            -- Módulos del curso (NUEVA TABLA)
            SELECT 'module' as source, cm.id::text, cm.course_id::text, cm.id::text,
                   null as term, null as definition, null as question, null as answer,
                   cm.title, cm.description, cm.ai_feedback as content, 'modulo' as category,
                   length(cm.title) + COALESCE(length(cm.description), 0) as relevance_score
            FROM public.course_module cm
            JOIN public.ai_courses ac ON cm.course_id = ac.id_ai_courses
            WHERE LOWER(cm.title) ILIKE $1 
               OR LOWER(cm.description) ILIKE $1
               OR LOWER(cm.ai_feedback) ILIKE $1
            
            UNION ALL
            
            -- Actividades de módulos (NUEVA TABLA)
            SELECT 'activity' as source, ma.id::text, cm.course_id::text, ma.module_id::text,
                   null as term, null as definition, null as question, null as answer,
                   CONCAT(ma.type, ' - ', ma.content_type) as title, 
                   ma.resource_url as description, ma.ai_feedback as content, 
                   COALESCE(ma.type, 'actividad') as category,
                   length(COALESCE(ma.ai_feedback, '')) + length(COALESCE(ma.resource_url, '')) as relevance_score
            FROM public.module_activity ma
            JOIN public.course_module cm ON ma.module_id = cm.id
            WHERE LOWER(ma.ai_feedback) ILIKE $1 
               OR LOWER(ma.resource_url) ILIKE $1
               OR LOWER(ma.type) ILIKE $1
               OR LOWER(ma.content_type) ILIKE $1
            
            UNION ALL
            
            -- Preguntas de cuestionarios (NUEVA TABLA)
            SELECT 'quiz_question' as source, qq.id::text, q.course_id::text, null as module_id,
                   null as term, null as definition, qq.question_text as question, qq.correct_answer as answer,
                   q.title, q.description, qq.options::text as content, 'cuestionario' as category,
                   length(qq.question_text) + COALESCE(length(qq.correct_answer), 0) as relevance_score
            FROM public.quiz_question qq
            JOIN public.quiz q ON qq.quiz_id = q.id
            WHERE LOWER(qq.question_text) ILIKE $1 
               OR LOWER(qq.correct_answer) ILIKE $1
               OR LOWER(qq.options::text) ILIKE $1
            
            ORDER BY relevance_score DESC, source
            LIMIT 12
        `;

        const { rows } = await pool.query(contextQuery, [searchTerm]);
        const formatted = rows.map(row => {
            const base = { 
                source: row.source, 
                id: row.id, 
                course_id: row.course_id, 
                module_id: row.module_id,
                category: row.category 
            };
            switch (row.source) {
                case 'glossary':
                    return { ...base, term: row.term, definition: row.definition };
                case 'chatbot_faq':
                    return { ...base, question: row.question, answer: row.answer };
                case 'course':
                    return { ...base, title: row.title, description: row.description, content: row.content };
                case 'module':
                    return { ...base, title: row.title, description: row.description, content: row.content };
                case 'activity':
                    return { ...base, title: row.title, description: row.description, content: row.content };
                case 'quiz_question':
                    return { ...base, question: row.question, answer: row.answer, title: row.title, content: row.content };
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


