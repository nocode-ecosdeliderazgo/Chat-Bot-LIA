/**
 * Netlify Function para manejar respuestas de comunidad
 * Endpoints: GET, POST /api/community/questions/:id/answers
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

        console.log(`🌐 Community Answers API: ${httpMethod} ${path}`);
        console.log('👤 User ID:', userId);

        // Extraer questionId del path
        const pathParts = path.split('/');
        const questionIdIndex = pathParts.findIndex(part => part === 'questions') + 1;
        const questionId = pathParts[questionIdIndex];

        if (!questionId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: 'ID de pregunta no encontrado en la URL',
                    data: null
                })
            };
        }

        console.log('❓ Question ID:', questionId);

        // GET /questions/:id/answers - Obtener respuestas
        if (httpMethod === 'GET') {
            const filters = queryStringParameters || {};

            let query = supabase
                .from('community_answers')
                .select(`
                    *,
                    users:user_id (
                        id,
                        username,
                        email,
                        display_name,
                        profile_picture_url
                    )
                `)
                .eq('question_id', questionId);

            // Aplicar ordenamiento
            if (filters.sort === 'votes') {
                query = query.order('votes_count', { ascending: false });
            } else if (filters.sort === 'oldest') {
                query = query.order('created_at', { ascending: true });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (error) {
                console.error('❌ Error obteniendo respuestas:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Error obteniendo respuestas: ' + error.message,
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

        // POST /questions/:id/answers - Crear nueva respuesta
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

            const answerData = JSON.parse(body);

            // Validar campos obligatorios
            if (!answerData.content) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Faltan campos obligatorios: content',
                        data: null
                    })
                };
            }

            // Verificar que la pregunta existe
            const { data: question, error: questionError } = await supabase
                .from('community_questions')
                .select('id')
                .eq('id', questionId)
                .single();

            if (questionError || !question) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Pregunta no encontrada',
                        data: null
                    })
                };
            }

            // Crear la respuesta
            const { data, error } = await supabase
                .from('community_answers')
                .insert({
                    question_id: questionId,
                    user_id: userId,
                    content: answerData.content,
                    is_instructor_answer: answerData.is_instructor_answer || false
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
                console.error('❌ Error creando respuesta:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Error creando respuesta: ' + error.message,
                        data: null
                    })
                };
            }

            // Actualizar contador de respuestas en la pregunta
            const { data: answers } = await supabase
                .from('community_answers')
                .select('id', { count: 'exact' })
                .eq('question_id', questionId);

            const answerCount = answers?.length || 0;

            await supabase
                .from('community_questions')
                .update({
                    answers_count: answerCount,
                    is_answered: answerCount > 0
                })
                .eq('id', questionId);

            return {
                statusCode: 201,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    data: data,
                    message: 'Respuesta creada exitosamente'
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
        console.error('❌ Error en community-answers:', error);
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