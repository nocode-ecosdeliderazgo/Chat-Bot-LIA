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
    console.log('🚀 community-questions function invoked');

    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        console.log('✅ Responding to OPTIONS preflight request');
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
        console.log('📋 Query Parameters:', queryStringParameters);

        // Verificar configuración de Supabase
        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ CRITICAL: Supabase credentials missing');
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: 'Supabase configuration error',
                    data: null
                })
            };
        }

        console.log('✅ Supabase client configured');

        // GET /questions - Obtener preguntas
        if (httpMethod === 'GET') {
            const filters = queryStringParameters || {};
            console.log('📊 Building query with filters:', filters);
            console.log('👤 Requesting user votes for userId:', userId);

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

            console.log('🔍 Executing Supabase query...');
            const { data, error } = await query;

            if (error) {
                console.error('❌ Supabase query error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
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

            console.log(`✅ Query successful - Found ${data?.length || 0} questions`);

            // Si hay un usuario autenticado, obtener sus votos
            if (userId && data && data.length > 0) {
                console.log('🗳️ Fetching user votes...');
                const questionIds = data.map(q => q.id);

                const { data: userVotes, error: votesError } = await supabase
                    .from('community_votes')
                    .select('target_id, vote_type')
                    .eq('user_id', userId)
                    .eq('target_type', 'question')
                    .in('target_id', questionIds);

                if (votesError) {
                    console.error('⚠️ Error obteniendo votos del usuario:', votesError);
                } else {
                    console.log(`✅ Found ${userVotes?.length || 0} user votes`);
                    // Crear un mapa de votos para acceso rápido
                    const votesMap = {};
                    if (userVotes) {
                        userVotes.forEach(vote => {
                            votesMap[vote.target_id] = vote.vote_type;
                        });
                    }

                    // Enriquecer preguntas con información de votos del usuario
                    data.forEach(question => {
                        question.user_vote = votesMap[question.id] || null;
                    });
                }
            }

            console.log('📦 Sample data:', data?.[0] ? {
                id: data[0].id,
                title: data[0].title?.substring(0, 50),
                hasUser: !!data[0].users,
                userVote: data[0].user_vote || 'none'
            } : 'No questions');

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