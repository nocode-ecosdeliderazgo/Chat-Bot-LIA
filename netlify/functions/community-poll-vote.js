const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno de Supabase no encontradas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
    console.log('🗳️ [Community Poll Vote] Iniciando función...');

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        // Parsear datos del cuerpo de la petición
        const { postId, userId, optionIndex } = JSON.parse(event.body);

        console.log('📊 Datos de votación:', { postId, userId, optionIndex });

        // Validar datos requeridos
        if (!postId || !userId || optionIndex === undefined || optionIndex === null) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Faltan datos requeridos: postId, userId, optionIndex'
                })
            };
        }

        // Validar que optionIndex sea un número
        const optionIndexNum = parseInt(optionIndex);
        if (isNaN(optionIndexNum) || optionIndexNum < 0) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'optionIndex debe ser un número válido >= 0'
                })
            };
        }

        // Verificar que el post existe y es una encuesta
        console.log('🔍 Verificando post existe y es encuesta...');
        const { data: post, error: postError } = await supabase
            .from('community_posts')
            .select('id, attachment_type, attachment_data')
            .eq('id', postId)
            .eq('attachment_type', 'poll')
            .single();

        if (postError || !post) {
            console.error('❌ Error verificando post:', postError);
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Post no encontrado o no es una encuesta'
                })
            };
        }

        // Verificar que optionIndex es válido para esta encuesta
        const pollData = post.attachment_data;
        if (!pollData || !pollData.options || optionIndexNum >= pollData.options.length) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Índice de opción inválido'
                })
            };
        }

        // Llamar a la función de la base de datos para votar
        console.log('🗳️ Llamando función cast_poll_vote...');
        const { data: voteResult, error: voteError } = await supabase
            .rpc('cast_poll_vote', {
                post_id_param: postId,
                user_id_param: userId,
                option_index_param: optionIndexNum
            });

        if (voteError) {
            console.error('❌ Error votando:', voteError);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Error al procesar el voto',
                    details: voteError.message
                })
            };
        }

        console.log('✅ Voto registrado exitosamente');

        // Obtener los resultados actualizados de la encuesta
        const { data: pollResults, error: resultsError } = await supabase
            .rpc('get_poll_results', {
                post_id_param: postId
            });

        if (resultsError) {
            console.warn('⚠️ Error obteniendo resultados:', resultsError);
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Voto registrado exitosamente',
                votes: voteResult,
                results: pollResults || null
            })
        };

    } catch (error) {
        console.error('❌ Error en función de votación:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Error interno del servidor',
                details: error.message
            })
        };
    }
};