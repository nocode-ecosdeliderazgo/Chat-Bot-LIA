/**
 * Netlify Function para manejar votación en preguntas y respuestas
 * Endpoints: POST /api/community/questions/:id/vote, POST /api/community/answers/:id/vote
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
        const { httpMethod, path, body, headers } = event;
        const userId = headers['x-user-id'] || null;

        console.log(`🌐 Community Vote API: ${httpMethod} ${path}`);
        console.log('👤 User ID:', userId);

        if (httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: `Método ${httpMethod} no permitido`,
                    data: null
                })
            };
        }

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

        const requestData = JSON.parse(body);
        const { vote_type } = requestData;

        if (!vote_type || !['up', 'down', 'upvote', 'downvote'].includes(vote_type)) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: 'Tipo de voto inválido. Usar: up, down, upvote, downvote',
                    data: null
                })
            };
        }

        // Normalizar tipo de voto
        const normalizedVoteType = vote_type === 'upvote' ? 'up' :
                                 vote_type === 'downvote' ? 'down' : vote_type;

        // Extraer ID del path
        const pathParts = path.split('/');
        const targetId = pathParts[pathParts.length - 2]; // El ID está antes de '/vote'
        const targetType = path.includes('/questions/') ? 'question' : 'answer';

        console.log(`🗳️ Votando en ${targetType} ${targetId} con tipo: ${normalizedVoteType}`);

        // Verificar si ya existe un voto del usuario
        const { data: existingVote, error: voteCheckError } = await supabase
            .from('community_votes')
            .select('*')
            .eq('user_id', userId)
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .single();

        if (voteCheckError && voteCheckError.code !== 'PGRST116') {
            console.error('❌ Error verificando voto existente:', voteCheckError);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: 'Error verificando voto existente',
                    data: null
                })
            };
        }

        let voteAction = 'created';
        let newVoteCount = 0;

        if (existingVote) {
            if (existingVote.vote_type === normalizedVoteType) {
                // Eliminar voto si es el mismo tipo
                const { error: deleteError } = await supabase
                    .from('community_votes')
                    .delete()
                    .eq('id', existingVote.id);

                if (deleteError) {
                    console.error('❌ Error eliminando voto:', deleteError);
                    return {
                        statusCode: 500,
                        headers: corsHeaders,
                        body: JSON.stringify({
                            success: false,
                            error: 'Error eliminando voto',
                            data: null
                        })
                    };
                }

                voteAction = 'removed';
            } else {
                // Actualizar tipo de voto
                const { error: updateError } = await supabase
                    .from('community_votes')
                    .update({ vote_type: normalizedVoteType })
                    .eq('id', existingVote.id);

                if (updateError) {
                    console.error('❌ Error actualizando voto:', updateError);
                    return {
                        statusCode: 500,
                        headers: corsHeaders,
                        body: JSON.stringify({
                            success: false,
                            error: 'Error actualizando voto',
                            data: null
                        })
                    };
                }

                voteAction = 'updated';
            }
        } else {
            // Crear nuevo voto
            const { error: insertError } = await supabase
                .from('community_votes')
                .insert({
                    user_id: userId,
                    target_type: targetType,
                    target_id: targetId,
                    vote_type: normalizedVoteType
                });

            if (insertError) {
                console.error('❌ Error creando voto:', insertError);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Error creando voto',
                        data: null
                    })
                };
            }

            voteAction = 'created';
        }

        // Actualizar contador de votos en la tabla correspondiente
        const tableName = targetType === 'question' ? 'community_questions' : 'community_answers';

        // Contar votos actuales
        const { data: upVotes } = await supabase
            .from('community_votes')
            .select('id', { count: 'exact' })
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .eq('vote_type', 'up');

        const { data: downVotes } = await supabase
            .from('community_votes')
            .select('id', { count: 'exact' })
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .eq('vote_type', 'down');

        const upCount = upVotes?.length || 0;
        const downCount = downVotes?.length || 0;
        newVoteCount = upCount - downCount;

        // Actualizar contador en la tabla principal
        const { error: updateCountError } = await supabase
            .from(tableName)
            .update({ votes_count: newVoteCount })
            .eq('id', targetId);

        if (updateCountError) {
            console.error('❌ Error actualizando contador de votos:', updateCountError);
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    action: voteAction,
                    vote_type: normalizedVoteType,
                    total_votes: newVoteCount,
                    up_votes: upCount,
                    down_votes: downCount
                },
                message: `Voto ${voteAction === 'removed' ? 'eliminado' : voteAction === 'updated' ? 'actualizado' : 'registrado'} exitosamente`
            })
        };

    } catch (error) {
        console.error('❌ Error en community-vote:', error);
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