// =====================================================
// API ENDPOINTS PARA SISTEMA DE COMUNIDAD
// Manejo completo de preguntas, respuestas, votos y comentarios
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// 1. OBTENER PREGUNTAS DE LA COMUNIDAD
// =====================================================

/**
 * GET /api/community/questions
 * Retorna lista de preguntas con filtros y paginación
 */
async function getQuestions(req, res) {
    try {
        const { 
            course_id, 
            module_id, 
            filter = 'all', 
            sort = 'recent', 
            page = 1, 
            limit = 20, 
            search 
        } = req.query;

        console.log(`📋 Obteniendo preguntas - Filtro: ${filter}, Orden: ${sort}`);

        // Construir query base
        let query = supabase
            .from('community_questions')
            .select(`
                *,
                users:user_id (
                    id,
                    username,
                    display_name,
                    profile_picture_url
                )
            `);

        // Aplicar filtros
        if (course_id) {
            query = query.eq('course_id', course_id);
        }
        if (module_id) {
            query = query.eq('module_id', module_id);
        }
        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        // Aplicar filtros específicos
        switch (filter) {
            case 'unanswered':
                query = query.eq('is_answered', false);
                break;
            case 'answered':
                query = query.eq('is_answered', true);
                break;
            case 'featured':
                query = query.eq('is_featured', true);
                break;
        }

        // Aplicar ordenamiento
        switch (sort) {
            case 'votes':
                query = query.order('votes_count', { ascending: false });
                break;
            case 'answers':
                query = query.order('answers_count', { ascending: false });
                break;
            case 'views':
                query = query.order('views_count', { ascending: false });
                break;
            case 'recent':
            default:
                query = query.order('created_at', { ascending: false });
                break;
        }

        // Aplicar paginación
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query = query.range(offset, offset + parseInt(limit) - 1);

        const { data: questions, error } = await query;

        if (error) {
            console.error('❌ Error obteniendo preguntas:', error);
            return res.status(500).json({ 
                error: 'Error obteniendo preguntas',
                details: error.message 
            });
        }

        // Obtener conteo total para paginación
        const { count } = await supabase
            .from('community_questions')
            .select('*', { count: 'exact', head: true });

        const response = {
            success: true,
            data: questions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / parseInt(limit))
            }
        };

        console.log(`✅ ${questions.length} preguntas obtenidas`);
        res.json(response);

    } catch (error) {
        console.error('💥 Error en getQuestions:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// 2. CREAR NUEVA PREGUNTA
// =====================================================

/**
 * POST /api/community/questions
 * Crea una nueva pregunta en la comunidad
 */
async function createQuestion(req, res) {
    try {
        const { title, content, tags, course_id, module_id, user_id } = req.body;

        console.log(`📝 Creando nueva pregunta: "${title}"`);

        // Validar datos requeridos
        if (!title || !content || !user_id) {
            return res.status(400).json({ 
                error: 'Datos requeridos faltantes',
                message: 'Título, contenido y usuario son requeridos'
            });
        }

        // Crear la pregunta
        const { data: question, error } = await supabase
            .from('community_questions')
            .insert({
                title: title.trim(),
                content: content.trim(),
                tags: tags || [],
                course_id: course_id || null,
                module_id: module_id || null,
                user_id: user_id
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
            return res.status(500).json({ 
                error: 'Error creando pregunta',
                details: error.message 
            });
        }

        console.log(`✅ Pregunta creada exitosamente: ${question.id}`);
        res.status(201).json({
            success: true,
            data: question,
            message: 'Pregunta creada exitosamente'
        });

    } catch (error) {
        console.error('💥 Error en createQuestion:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// 3. MANEJAR VOTOS
// =====================================================

/**
 * POST /api/community/votes
 * Crea o actualiza un voto (upvote/downvote)
 */
async function handleVote(req, res) {
    try {
        const { user_id, target_type, target_id, vote_type } = req.body;

        console.log(`🗳️ Procesando voto: ${vote_type} en ${target_type} ${target_id}`);

        // Validar datos
        if (!user_id || !target_type || !target_id || !vote_type) {
            return res.status(400).json({ 
                error: 'Datos requeridos faltantes',
                message: 'user_id, target_type, target_id y vote_type son requeridos'
            });
        }

        if (!['question', 'answer', 'comment'].includes(target_type)) {
            return res.status(400).json({ 
                error: 'Tipo de objetivo inválido',
                message: 'target_type debe ser: question, answer o comment'
            });
        }

        if (!['upvote', 'downvote'].includes(vote_type)) {
            return res.status(400).json({ 
                error: 'Tipo de voto inválido',
                message: 'vote_type debe ser: upvote o downvote'
            });
        }

        // Verificar si ya existe un voto
        const { data: existingVote } = await supabase
            .from('community_votes')
            .select('*')
            .eq('user_id', user_id)
            .eq('target_type', target_type)
            .eq('target_id', target_id)
            .single();

        let result;

        if (existingVote) {
            // Si el voto es el mismo, eliminarlo (toggle)
            if (existingVote.vote_type === vote_type) {
                const { error: deleteError } = await supabase
                    .from('community_votes')
                    .delete()
                    .eq('id', existingVote.id);

                if (deleteError) {
                    console.error('❌ Error eliminando voto:', deleteError);
                    return res.status(500).json({ 
                        error: 'Error eliminando voto',
                        details: deleteError.message 
                    });
                }

                result = { action: 'removed', vote_type: null };
            } else {
                // Si es diferente, actualizarlo
                const { data: updatedVote, error: updateError } = await supabase
                    .from('community_votes')
                    .update({ vote_type })
                    .eq('id', existingVote.id)
                    .select()
                    .single();

                if (updateError) {
                    console.error('❌ Error actualizando voto:', updateError);
                    return res.status(500).json({ 
                        error: 'Error actualizando voto',
                        details: updateError.message 
                    });
                }

                result = { action: 'updated', vote_type, data: updatedVote };
            }
        } else {
            // Crear nuevo voto
            const { data: newVote, error: insertError } = await supabase
                .from('community_votes')
                .insert({
                    user_id,
                    target_type,
                    target_id,
                    vote_type
                })
                .select()
                .single();

            if (insertError) {
                console.error('❌ Error creando voto:', insertError);
                return res.status(500).json({ 
                    error: 'Error creando voto',
                    details: insertError.message 
                });
            }

            result = { action: 'created', vote_type, data: newVote };
        }

        console.log(`✅ Voto procesado: ${result.action}`);
        res.json({
            success: true,
            data: result,
            message: `Voto ${result.action} exitosamente`
        });

    } catch (error) {
        console.error('💥 Error en handleVote:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// 4. CREAR RESPUESTA
// =====================================================

/**
 * POST /api/community/answers
 * Crea una nueva respuesta a una pregunta
 */
async function createAnswer(req, res) {
    try {
        const { question_id, content, user_id, is_instructor_answer = false } = req.body;

        console.log(`💬 Creando respuesta para pregunta: ${question_id}`);

        // Validar datos
        if (!question_id || !content || !user_id) {
            return res.status(400).json({ 
                error: 'Datos requeridos faltantes',
                message: 'question_id, content y user_id son requeridos'
            });
        }

        // Verificar que la pregunta existe
        const { data: question, error: questionError } = await supabase
            .from('community_questions')
            .select('id')
            .eq('id', question_id)
            .single();

        if (questionError || !question) {
            return res.status(404).json({ 
                error: 'Pregunta no encontrada',
                details: questionError?.message 
            });
        }

        // Crear la respuesta
        const { data: answer, error } = await supabase
            .from('community_answers')
            .insert({
                question_id,
                content: content.trim(),
                user_id,
                is_instructor_answer
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
            return res.status(500).json({ 
                error: 'Error creando respuesta',
                details: error.message 
            });
        }

        console.log(`✅ Respuesta creada exitosamente: ${answer.id}`);
        res.status(201).json({
            success: true,
            data: answer,
            message: 'Respuesta creada exitosamente'
        });

    } catch (error) {
        console.error('💥 Error en createAnswer:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// 5. OBTENER RESPUESTAS DE UNA PREGUNTA
// =====================================================

/**
 * GET /api/community/questions/:questionId/answers
 * Obtiene todas las respuestas de una pregunta específica
 */
async function getQuestionAnswers(req, res) {
    try {
        const { questionId } = req.params;
        const { sort = 'votes' } = req.query;

        console.log(`📋 Obteniendo respuestas para pregunta: ${questionId}`);

        let query = supabase
            .from('community_answers')
            .select(`
                *,
                users:user_id (
                    id,
                    username,
                    display_name,
                    profile_picture_url
                )
            `)
            .eq('question_id', questionId);

        // Aplicar ordenamiento
        switch (sort) {
            case 'recent':
                query = query.order('created_at', { ascending: false });
                break;
            case 'votes':
            default:
                query = query.order('votes_count', { ascending: false });
                break;
        }

        const { data: answers, error } = await query;

        if (error) {
            console.error('❌ Error obteniendo respuestas:', error);
            return res.status(500).json({ 
                error: 'Error obteniendo respuestas',
                details: error.message 
            });
        }

        console.log(`✅ ${answers.length} respuestas obtenidas`);
        res.json({
            success: true,
            data: answers
        });

    } catch (error) {
        console.error('💥 Error en getQuestionAnswers:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// 6. MANEJAR MARCADORES/FAVORITOS
// =====================================================

/**
 * POST /api/community/bookmarks
 * Agrega o elimina un marcador de pregunta
 */
async function toggleBookmark(req, res) {
    try {
        const { user_id, question_id } = req.body;

        console.log(`🔖 Toggle bookmark para pregunta: ${question_id}`);

        // Verificar si ya existe el marcador
        const { data: existingBookmark } = await supabase
            .from('community_bookmarks')
            .select('*')
            .eq('user_id', user_id)
            .eq('question_id', question_id)
            .single();

        let result;

        if (existingBookmark) {
            // Eliminar marcador
            const { error: deleteError } = await supabase
                .from('community_bookmarks')
                .delete()
                .eq('id', existingBookmark.id);

            if (deleteError) {
                console.error('❌ Error eliminando marcador:', deleteError);
                return res.status(500).json({ 
                    error: 'Error eliminando marcador',
                    details: deleteError.message 
                });
            }

            result = { action: 'removed' };
        } else {
            // Crear marcador
            const { data: newBookmark, error: insertError } = await supabase
                .from('community_bookmarks')
                .insert({
                    user_id,
                    question_id
                })
                .select()
                .single();

            if (insertError) {
                console.error('❌ Error creando marcador:', insertError);
                return res.status(500).json({ 
                    error: 'Error creando marcador',
                    details: insertError.message 
                });
            }

            result = { action: 'added', data: newBookmark };
        }

        console.log(`✅ Marcador ${result.action} exitosamente`);
        res.json({
            success: true,
            data: result,
            message: `Marcador ${result.action} exitosamente`
        });

    } catch (error) {
        console.error('💥 Error en toggleBookmark:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// ROUTER PRINCIPAL
// =====================================================

exports.handler = async (event, context) => {
    // Configurar CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // Parsear el body si existe
        let body = {};
        if (event.body) {
            body = JSON.parse(event.body);
        }

        // Crear objetos req y res simulados
        const req = {
            method: event.httpMethod,
            path: event.path,
            query: event.queryStringParameters || {},
            body: body,
            params: event.pathParameters || {}
        };

        const res = {
            status: (code) => ({ json: (data) => ({ statusCode: code, headers, body: JSON.stringify(data) }) }),
            json: (data) => ({ statusCode: 200, headers, body: JSON.stringify(data) }),
            statusCode: 200,
            headers: headers
        };

        // Router de endpoints
        const path = event.path;
        const method = event.httpMethod;

        console.log(`🌐 ${method} ${path}`);

        // GET /api/community/questions
        if (path === '/api/community/questions' && method === 'GET') {
            return await getQuestions(req, res);
        }

        // POST /api/community/questions
        if (path === '/api/community/questions' && method === 'POST') {
            return await createQuestion(req, res);
        }

        // GET /api/community/questions/:questionId/answers
        if (path.match(/^\/api\/community\/questions\/[^\/]+\/answers$/) && method === 'GET') {
            const questionId = path.split('/')[4];
            req.params = { questionId };
            return await getQuestionAnswers(req, res);
        }

        // POST /api/community/answers
        if (path === '/api/community/answers' && method === 'POST') {
            return await createAnswer(req, res);
        }

        // POST /api/community/votes
        if (path === '/api/community/votes' && method === 'POST') {
            return await handleVote(req, res);
        }

        // POST /api/community/bookmarks
        if (path === '/api/community/bookmarks' && method === 'POST') {
            return await toggleBookmark(req, res);
        }

        // Endpoint no encontrado
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                error: 'Endpoint no encontrado',
                message: `No se encontró el endpoint ${method} ${path}`
            })
        };

    } catch (error) {
        console.error('💥 Error en handler principal:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error interno del servidor',
                details: error.message
            })
        };
    }
};
