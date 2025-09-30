/**
 * Netlify Function para manejar preguntas de comunidad
 * Endpoints: GET, POST /api/community/questions
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables de entorno de Supabase no configuradas');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Headers CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

exports.handler = async (event, context) => {
    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        const { httpMethod, path, queryStringParameters, body, headers } = event;
        const userId = headers['x-user-id'] || null;

        console.log(`🌐 Community Questions API: ${httpMethod} ${path}`);
        console.log('👤 User ID:', userId);

        // GET /questions - Obtener preguntas
        if (httpMethod === 'GET') {
            const filters = queryStringParameters || {};

            let query = supabase
                .from('community_questions')
                .select(`
                    *,
                    users:user_id (
                        id,
                        username,
                        email,
                        display_name,
                        profile_picture_url
                    )
                `);

            // Aplicar filtros
            if (filters.course_id) {
                query = query.eq('course_id', filters.course_id);
            }
            if (filters.module_id) {
                query = query.eq('module_id', filters.module_id);
            }
            if (filters.filter === 'unanswered') {
                query = query.eq('is_answered', false);
            } else if (filters.filter === 'answered') {
                query = query.eq('is_answered', true);
            }

            // Aplicar ordenamiento
            if (filters.sort === 'votes') {
                query = query.order('votes_count', { ascending: false });
            } else if (filters.sort === 'answers') {
                query = query.order('answers_count', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            // Aplicar paginación
            const limit = parseInt(filters.limit) || 20;
            const offset = parseInt(filters.offset) || 0;
            query = query.range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) {
                console.error('❌ Error obteniendo preguntas:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Error obteniendo preguntas: ' + error.message,
                        data: null
                    })
                };
            }

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    data: data || [],
                    count: data?.length || 0
                })
            };
        }

        // POST /questions - Crear nueva pregunta
        if (httpMethod === 'POST') {
            if (!userId) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Usuario no autenticado',
                        data: null
                    })
                };
            }

            const questionData = JSON.parse(body);

            // Validar campos obligatorios
            if (!questionData.title || !questionData.content) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Faltan campos obligatorios: title, content',
                        data: null
                    })
                };
            }

            const { data, error } = await supabase
                .from('community_questions')
                .insert({
                    title: questionData.title,
                    content: questionData.content,
                    tags: questionData.tags || [],
                    course_id: questionData.course_id,
                    module_id: questionData.module_id,
                    user_id: userId
                })
                .select(`
                    *,
                    users:user_id (
                        id,
                        username,
                        display_name,
                        profile_picture_url
                    )
                `)
                .single();

            if (error) {
                console.error('❌ Error creando pregunta:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Error creando pregunta: ' + error.message,
                        data: null
                    })
                };
            }

            return {
                statusCode: 201,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    data: data,
                    message: 'Pregunta creada exitosamente'
                })
            };
        }

        // Método no permitido
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: `Método ${httpMethod} no permitido`,
                data: null
            })
        };

    } catch (error) {
        console.error('❌ Error en community-questions:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor: ' + error.message,
                data: null
            })
        };
    }
};