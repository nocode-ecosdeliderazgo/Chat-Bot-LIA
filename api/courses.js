// =====================================================
// API ENDPOINTS PARA SISTEMA DE CURSOS DINÁMICOS
// Manejo completo de cursos, módulos, videos y progreso
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// 1. OBTENER ESTRUCTURA COMPLETA DEL CURSO
// =====================================================

/**
 * GET /api/courses/:courseId/full-structure
 * Retorna curso completo con módulos, videos y checkpoints
 */
async function getCourseFullStructure(req, res) {
    try {
        const { courseId } = req.params;
        const { userId } = req.query; // Opcional para incluir progreso

        console.log(`📚 Obteniendo estructura completa del curso: ${courseId}`);

        // 1. Obtener datos del curso
        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .eq('is_active', true)
            .single();

        if (courseError || !courseData) {
            console.error('❌ Error obteniendo curso:', courseError);
            return res.status(404).json({ 
                error: 'Curso no encontrado',
                details: courseError?.message 
            });
        }

        // 2. Obtener módulos con videos y checkpoints
        const { data: modulesData, error: modulesError } = await supabase
            .from('course_modules')
            .select(`
                *,
                module_videos (
                    *,
                    video_checkpoints (*)
                ),
                module_materials (*)
            `)
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });

        if (modulesError) {
            console.error('❌ Error obteniendo módulos:', modulesError);
            return res.status(500).json({ 
                error: 'Error obteniendo módulos',
                details: modulesError.message 
            });
        }

        // 3. Obtener progreso del usuario (si se proporciona userId)
        let userProgress = null;
        if (userId) {
            const { data: progressData, error: progressError } = await supabase
                .from('user_course_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .single();

            if (!progressError && progressData) {
                userProgress = progressData;
            }

            // También obtener progreso detallado por video
            const { data: videoProgressData } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('course_id', courseId);

            if (videoProgressData) {
                // Agregar progreso a cada video
                modulesData.forEach(module => {
                    module.module_videos.forEach(video => {
                        const progress = videoProgressData.find(p => p.video_id === video.id);
                        video.user_progress = progress || {
                            current_time_seconds: 0,
                            completion_percentage: 0,
                            is_completed: false
                        };
                    });
                });
            }
        }

        // 4. Estructurar respuesta
        const response = {
            course: courseData,
            modules: modulesData.map(module => ({
                ...module,
                videos: module.module_videos.map(video => ({
                    ...video,
                    checkpoints: video.video_checkpoints
                })),
                materials: module.module_materials
            })),
            user_progress: userProgress,
            summary: {
                total_modules: modulesData.length,
                total_videos: modulesData.reduce((sum, m) => sum + m.module_videos.length, 0),
                total_duration_minutes: courseData.duration_total_minutes
            }
        };

        console.log(`✅ Estructura del curso obtenida exitosamente`);
        res.json(response);

    } catch (error) {
        console.error('💥 Error en getCourseFullStructure:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// 2. OBTENER DATOS ESPECÍFICOS DE UN VIDEO
// =====================================================

/**
 * GET /api/modules/:moduleId/video-data
 * Retorna datos completos de un video específico
 */
async function getModuleVideoData(req, res) {
    try {
        const { moduleId } = req.params;
        const { userId } = req.query;

        console.log(`🎥 Obteniendo datos de video del módulo: ${moduleId}`);

        // Obtener video con todos sus datos
        const { data: videoData, error: videoError } = await supabase
            .from('module_videos')
            .select(`
                *,
                video_checkpoints (*),
                course_modules (
                    *,
                    courses (*)
                )
            `)
            .eq('module_id', moduleId)
            .order('video_order', { ascending: true })
            .limit(1)
            .single();

        if (videoError || !videoData) {
            console.error('❌ Error obteniendo video:', videoError);
            return res.status(404).json({ 
                error: 'Video no encontrado',
                details: videoError?.message 
            });
        }

        // Obtener progreso del usuario si se proporciona
        let userProgress = null;
        if (userId) {
            const { data: progressData } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('video_id', videoData.id)
                .single();

            userProgress = progressData || {
                current_time_seconds: 0,
                completion_percentage: 0,
                is_completed: false
            };
        }

        // Estructurar respuesta
        const response = {
            video: {
                ...videoData,
                checkpoints: videoData.video_checkpoints,
                youtube_embed_url: `https://www.youtube.com/embed/${videoData.youtube_video_id}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`,
                youtube_thumbnail_url: `https://img.youtube.com/vi/${videoData.youtube_video_id}/maxresdefault.jpg`
            },
            module: videoData.course_modules,
            course: videoData.course_modules.courses,
            user_progress: userProgress
        };

        console.log(`✅ Datos de video obtenidos exitosamente`);
        res.json(response);

    } catch (error) {
        console.error('💥 Error en getModuleVideoData:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// 3. OBTENER PROGRESO DEL USUARIO
// =====================================================

/**
 * GET /api/users/:userId/progress/:courseId
 * Retorna progreso completo del usuario en un curso
 */
async function getUserProgress(req, res) {
    try {
        const { userId, courseId } = req.params;

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
            return res.status(500).json({ 
                error: 'Error obteniendo progreso',
                details: videoError.message 
            });
        }

        // 3. Obtener módulo actual (último video visto)
        let currentModule = null;
        if (videoProgress && videoProgress.length > 0) {
            const lastVideo = videoProgress[0];
            currentModule = lastVideo.module_videos.course_modules;
        }

        const response = {
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
        res.json(response);

    } catch (error) {
        console.error('💥 Error en getUserProgress:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// 4. ACTUALIZAR PROGRESO DEL USUARIO
// =====================================================

/**
 * POST /api/users/:userId/video-progress
 * Actualiza progreso de un video específico
 */
async function updateVideoProgress(req, res) {
    try {
        const { userId } = req.params;
        const { 
            courseId, 
            moduleId, 
            videoId, 
            currentTimeSeconds, 
            completionPercentage,
            isCompleted,
            actionType = 'progress_update'
        } = req.body;

        console.log(`🔄 Actualizando progreso de video: ${videoId} para usuario: ${userId}`);

        // Validaciones
        if (!courseId || !moduleId || !videoId) {
            return res.status(400).json({ 
                error: 'Datos requeridos faltantes',
                required: ['courseId', 'moduleId', 'videoId']
            });
        }

        // 1. Actualizar/insertar progreso de video
        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .upsert({
                user_id: userId,
                course_id: courseId,
                module_id: moduleId,
                video_id: videoId,
                current_time_seconds: currentTimeSeconds || 0,
                completion_percentage: completionPercentage || 0,
                is_completed: isCompleted || false,
                last_watched_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,video_id'
            })
            .select()
            .single();

        if (progressError) {
            console.error('❌ Error actualizando progreso:', progressError);
            return res.status(500).json({ 
                error: 'Error actualizando progreso',
                details: progressError.message 
            });
        }

        // 2. Registrar actividad en log
        await supabase
            .from('user_activity_log')
            .insert({
                user_id: userId,
                video_id: videoId,
                action_type: actionType,
                video_time_seconds: currentTimeSeconds,
                timestamp: new Date().toISOString()
            });

        // 3. La función trigger actualizará automáticamente user_course_progress
        // Pero también podemos obtener el progreso actualizado del curso
        const { data: courseProgress } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        const response = {
            success: true,
            video_progress: progressData,
            course_progress: courseProgress,
            timestamp: new Date().toISOString()
        };

        console.log(`✅ Progreso actualizado exitosamente`);
        res.json(response);

    } catch (error) {
        console.error('💥 Error en updateVideoProgress:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// 5. CAMBIAR MÓDULO ACTUAL
// =====================================================

/**
 * POST /api/users/:userId/switch-module
 * Cambia al módulo especificado y valida prerequisitos
 */
async function switchModule(req, res) {
    try {
        const { userId } = req.params;
        const { courseId, moduleId } = req.body;

        console.log(`🔄 Cambiando a módulo ${moduleId} para usuario ${userId}`);

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
            return res.status(404).json({ 
                error: 'Módulo no encontrado',
                details: moduleError?.message 
            });
        }

        // 2. Validar prerequisitos si es necesario
        if (moduleData.unlock_previous_required && moduleData.order_index > 1) {
            // Verificar que el módulo anterior esté completado
            const { data: previousProgress } = await supabase
                .from('user_progress')
                .select('is_completed')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .eq('module_id', moduleData.order_index - 1);

            const previousCompleted = previousProgress?.some(p => p.is_completed);
            if (!previousCompleted) {
                return res.status(403).json({ 
                    error: 'Módulo bloqueado',
                    message: 'Debes completar el módulo anterior primero'
                });
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
            return res.status(500).json({ 
                error: 'Error actualizando progreso',
                details: updateError.message 
            });
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
        res.json(response);

    } catch (error) {
        console.error('💥 Error en switchModule:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// 6. OBTENER MÓDULO ACTUAL DEL USUARIO
// =====================================================

/**
 * GET /api/courses/:courseId/current-module/:userId
 * Obtiene el módulo actual del usuario y datos del video
 */
async function getCurrentModule(req, res) {
    try {
        const { courseId, userId } = req.params;

        console.log(`📍 Obteniendo módulo actual para usuario ${userId} en curso ${courseId}`);

        // 1. Obtener progreso del curso
        let { data: courseProgress } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        // Si no existe progreso, crear uno inicial con el primer módulo
        if (!courseProgress) {
            const { data: firstModule } = await supabase
                .from('course_modules')
                .select('id')
                .eq('course_id', courseId)
                .order('order_index', { ascending: true })
                .limit(1)
                .single();

            if (firstModule) {
                const { data: newProgress } = await supabase
                    .from('user_course_progress')
                    .insert({
                        user_id: userId,
                        course_id: courseId,
                        current_module_id: firstModule.id,
                        total_modules: 0, // Se actualizará con trigger
                        total_videos: 0   // Se actualizará con trigger
                    })
                    .select()
                    .single();

                courseProgress = newProgress;
            }
        }

        // 2. Obtener datos del módulo actual
        const { data: currentModule, error: moduleError } = await supabase
            .from('course_modules')
            .select(`
                *,
                module_videos (
                    *,
                    video_checkpoints (*)
                ),
                module_materials (*),
                courses (*)
            `)
            .eq('id', courseProgress?.current_module_id)
            .single();

        if (moduleError && courseProgress?.current_module_id) {
            console.error('❌ Error obteniendo módulo actual:', moduleError);
            return res.status(500).json({ 
                error: 'Error obteniendo módulo actual',
                details: moduleError.message 
            });
        }

        // 3. Obtener progreso del video actual
        let videoProgress = null;
        const currentVideo = currentModule?.module_videos?.[0];
        
        if (currentVideo) {
            const { data: progress } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('video_id', currentVideo.id)
                .single();

            videoProgress = progress;
        }

        const response = {
            course_progress: courseProgress,
            current_module: currentModule,
            current_video: currentVideo ? {
                ...currentVideo,
                checkpoints: currentVideo.video_checkpoints,
                youtube_embed_url: `https://www.youtube.com/embed/${currentVideo.youtube_video_id}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`,
                youtube_thumbnail_url: `https://img.youtube.com/vi/${currentVideo.youtube_video_id}/maxresdefault.jpg`,
                user_progress: videoProgress
            } : null,
            materials: currentModule?.module_materials || []
        };

        console.log(`✅ Módulo actual obtenido exitosamente`);
        res.json(response);

    } catch (error) {
        console.error('💥 Error en getCurrentModule:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================

module.exports = {
    getCourseFullStructure,
    getModuleVideoData,
    getUserProgress,
    updateVideoProgress,
    switchModule,
    getCurrentModule
};