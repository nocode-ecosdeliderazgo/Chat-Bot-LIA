const { Pool } = require('pg');
const corsUtils = require('./cors-utils');

// Configuración de la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.handler = async (event, context) => {
    // Aplicar CORS
    const corsHeaders = corsUtils.getCorsHeaders(event);
    
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        // Obtener user_id de los query parameters o headers
        const userId = event.queryStringParameters?.user_id || 
                      event.headers['x-user-id'] || 
                      event.headers['authorization']?.replace('Bearer ', '');

        if (!userId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'user_id requerido',
                    message: 'Proporciona user_id como query parameter o en el header x-user-id'
                })
            };
        }

        console.log(`🔍 Buscando session_id para usuario: ${userId}`);

        // Buscar la sesión de cuestionario más reciente del usuario
        const query = `
            SELECT 
                uqs.id as session_id,
                uqs.user_id,
                uqs.perfil,
                uqs.area,
                uqs.started_at,
                uqs.completed_at,
                COUNT(uqr.id) as responses_count
            FROM user_questionnaire_sessions uqs
            LEFT JOIN user_question_responses uqr ON uqs.id = uqr.session_id
            WHERE uqs.user_id = $1
            GROUP BY uqs.id, uqs.user_id, uqs.perfil, uqs.area, uqs.started_at, uqs.completed_at
            ORDER BY uqs.started_at DESC
            LIMIT 1
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'No se encontró cuestionario para este usuario',
                    user_id: userId,
                    suggestion: 'El usuario debe completar el cuestionario primero'
                })
            };
        }

        const sessionData = result.rows[0];

        // Verificar si el cuestionario está completo
        const isCompleted = sessionData.completed_at !== null;
        const hasResponses = parseInt(sessionData.responses_count) > 0;

        console.log(`✅ Sesión encontrada: ${sessionData.session_id}`);
        console.log(`📊 Cuestionario completo: ${isCompleted ? 'Sí' : 'No'}`);
        console.log(`📝 Respuestas: ${sessionData.responses_count}`);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                session_id: sessionData.session_id,
                user_id: sessionData.user_id,
                perfil: sessionData.perfil,
                area: sessionData.area,
                started_at: sessionData.started_at,
                completed_at: sessionData.completed_at,
                is_completed: isCompleted,
                responses_count: parseInt(sessionData.responses_count),
                has_data: hasResponses,

                debug: {
                    query_executed: true,
                    timestamp: new Date().toISOString()
                }
            })
        };

    } catch (error) {
        console.error('💥 Error obteniendo session_id:', error);
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Error interno del servidor',
                details: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};