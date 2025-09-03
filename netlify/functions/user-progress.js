// =====================================================
// NETLIFY FUNCTION: PROGRESO DE USUARIOS
// Función serverless para manejar progreso de usuarios
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables de entorno de Supabase no configuradas');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// HANDLER PRINCIPAL
// =====================================================

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const path = event.path;
        const method = event.httpMethod;
        const queryParams = event.queryStringParameters || {};
        const body = event.body ? JSON.parse(event.body) : {};

        console.log(`📡 ${method} ${path}`);

        if (method === 'GET' && path.includes('/progress/')) {
            // GET /progress/{userId}/{courseId}
            const pathParts = path.split('/');
            const courseId = pathParts.pop();
            const userId = pathParts.pop();
            return await getUserProgress(userId, courseId, headers);
            
        } else if (method === 'POST' && path.includes('/video-progress')) {
            // POST /video-progress
            return await updateVideoProgress(body, headers);
            
        } else if (method === 'POST' && path.includes('/switch-module')) {
            // POST /switch-module
            return await switchModule(body, headers);
            
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Endpoint no encontrado' })
            };
        }

    } catch (error) {
        console.error('💥 Error en user-progress function:', error);
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

// =====================================================
// FUNCIONES ESPECÍFICAS
// =====================================================

async function getUserProgress(userId, courseId, headers) {
    try {
        console.log(`📊 Obteniendo progreso del usuario ${userId} en curso ${courseId}`);

        // 1. Progreso general del curso
        const { data: courseProgress, error: courseError } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        // 2. Progreso detallado por video
        const { data: videoProgress, error: videoError } = await supabase
            .from('user_progress')
            .select(`
                *,
                module_videos (
                    *,
                    course_modules (*)
                )
            `)
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .order('last_watched_at', { ascending: false });

        if (videoError) {
            console.error('❌ Error obteniendo progreso de videos:', videoError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Error obteniendo progreso',
                    details: videoError.message 
                })
            };
        }

        // 3. Obtener módulo actual (último video visto)
        let currentModule = null;
        if (videoProgress && videoProgress.length > 0) {
            const lastVideo = videoProgress[0];
            currentModule = lastVideo.module_videos.course_modules;
        }

        const response = {
            success: true,
            course_progress: courseProgress || {
                overall_percentage: 0,
                completed_modules: 0,
                completed_videos: 0,
                current_module_id: null
            },
            video_progress: videoProgress || [],
            current_module: currentModule,
            summary: {
                total_videos_watched: videoProgress?.length || 0,
                completed_videos: videoProgress?.filter(p => p.is_completed)?.length || 0,
                last_activity: videoProgress?.[0]?.last_watched_at || null
            }
        };

        console.log(`✅ Progreso obtenido exitosamente`);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('💥 Error en getUserProgress:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Error interno del servidor',
                details: error.message 
            })
        };
    }
}

async function updateVideoProgress(requestBody, headers) {
    try {
        const { 
            userId,
            courseId, 
            moduleId, 
            videoId, 
            currentTimeSeconds, 
            completionPercentage,
            isCompleted,
            actionType = 'progress_update'
        } = requestBody;

        console.log(`🔄 Actualizando progreso de video: ${videoId} para usuario: ${userId}`);

        // Validaciones
        if (!userId || !courseId || !moduleId || !videoId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Datos requeridos faltantes',
                    required: ['userId', 'courseId', 'moduleId', 'videoId']
                })
            };
        }

        // 1. Actualizar/insertar progreso de video
        const progressData = {
            user_id: userId,
            course_id: courseId,
            module_id: moduleId,
            video_id: videoId,
            current_time_seconds: currentTimeSeconds || 0,
            completion_percentage: completionPercentage || 0,
            is_completed: isCompleted || false,
            last_watched_at: new Date().toISOString()
        };

        // Si no es la primera vez, mantener first_watched_at
        const { data: existingProgress } = await supabase
            .from('user_progress')
            .select('first_watched_at')
            .eq('user_id', userId)
            .eq('video_id', videoId)
            .single();

        if (existingProgress) {
            progressData.first_watched_at = existingProgress.first_watched_at;
        }

        const { data: updatedProgress, error: progressError } = await supabase
            .from('user_progress')
            .upsert(progressData, {
                onConflict: 'user_id,video_id'
            })
            .select()
            .single();

        if (progressError) {
            console.error('❌ Error actualizando progreso:', progressError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Error actualizando progreso',
                    details: progressError.message 
                })
            };
        }

        // 2. Registrar actividad en log
        const { error: logError } = await supabase
            .from('user_activity_log')
            .insert({
                user_id: userId,
                video_id: videoId,
                action_type: actionType,
                video_time_seconds: currentTimeSeconds,
                timestamp: new Date().toISOString()
            });

        if (logError) {
            console.warn('⚠️ Error registrando actividad en log:', logError);
            // No fallar por error en log
        }

        // 3. Obtener progreso del curso actualizado
        const { data: courseProgress } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        const response = {
            success: true,
            video_progress: updatedProgress,
            course_progress: courseProgress,
            timestamp: new Date().toISOString()
        };

        console.log(`✅ Progreso actualizado exitosamente`);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('💥 Error en updateVideoProgress:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Error interno del servidor',
                details: error.message 
            })
        };
    }
}

async function switchModule(requestBody, headers) {
    try {
        const { userId, courseId, moduleId } = requestBody;

        console.log(`🔄 Cambiando a módulo ${moduleId} para usuario ${userId}`);

        // Validaciones
        if (!userId || !courseId || !moduleId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Datos requeridos faltantes',
                    required: ['userId', 'courseId', 'moduleId']
                })
            };
        }

        // 1. Obtener información del módulo
        const { data: moduleData, error: moduleError } = await supabase
            .from('course_modules')
            .select(`
                *,
                module_videos (*),
                courses (*)
            `)
            .eq('id', moduleId)
            .eq('course_id', courseId)
            .single();

        if (moduleError || !moduleData) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    error: 'Módulo no encontrado',
                    details: moduleError?.message 
                })
            };
        }

        // 2. Validar prerequisitos si es necesario
        if (moduleData.unlock_previous_required && moduleData.order_index > 1) {
            // Obtener módulo anterior
            const { data: previousModule } = await supabase
                .from('course_modules')
                .select('id')
                .eq('course_id', courseId)
                .eq('order_index', moduleData.order_index - 1)
                .single();

            if (previousModule) {
                // Verificar que al menos un video del módulo anterior esté completado
                const { data: previousProgress } = await supabase
                    .from('user_progress')
                    .select('is_completed')
                    .eq('user_id', userId)
                    .eq('course_id', courseId)
                    .eq('module_id', previousModule.id);

                const hasCompletedPrevious = previousProgress?.some(p => p.is_completed);
                if (!hasCompletedPrevious) {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({ 
                            error: 'Módulo bloqueado',
                            message: 'Debes completar el módulo anterior primero'
                        })
                    };
                }
            }
        }

        // 3. Actualizar módulo actual en progreso del curso
        const { data: updatedProgress, error: updateError } = await supabase
            .from('user_course_progress')
            .upsert({
                user_id: userId,
                course_id: courseId,
                current_module_id: moduleId,
                last_activity_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,course_id'
            })
            .select()
            .single();

        if (updateError) {
            console.error('❌ Error actualizando módulo actual:', updateError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Error actualizando progreso',
                    details: updateError.message 
                })
            };
        }

        // 4. Obtener datos del primer video del módulo
        const firstVideo = moduleData.module_videos[0];
        
        const response = {
            success: true,
            module: moduleData,
            current_video: firstVideo ? {
                ...firstVideo,
                youtube_embed_url: `https://www.youtube.com/embed/${firstVideo.youtube_video_id}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`,
                youtube_thumbnail_url: `https://img.youtube.com/vi/${firstVideo.youtube_video_id}/maxresdefault.jpg`
            } : null,
            course_progress: updatedProgress
        };

        console.log(`✅ Módulo cambiado exitosamente`);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('💥 Error en switchModule:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Error interno del servidor',
                details: error.message 
            })
        };
    }
}