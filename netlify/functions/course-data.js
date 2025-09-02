// =====================================================
// NETLIFY FUNCTION: DATOS DE CURSOS
// Función serverless para obtener datos de cursos
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
// HELPER FUNCTION: Resolver courseId (slug o UUID) a UUID
// =====================================================
async function resolveCourseId(courseId) {
    // Si ya es un UUID, devolverlo directamente
    if (courseId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return courseId;
    }
    
    // Si es un slug, buscar el UUID correspondiente
    const { data: courseData } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', courseId)
        .eq('is_active', true)
        .single();
    
    return courseData?.id || null;
}

// =====================================================
// HANDLER PRINCIPAL
// =====================================================

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

        // Routing basado en path
        if (path.includes('/course-structure/')) {
            // GET /course-structure/{courseId}
            const courseId = path.split('/').pop();
            return await getCourseFullStructure(courseId, queryParams, headers);
            
        } else if (path.includes('/current-module/')) {
            // GET /current-module/{courseId}/{userId}
            const pathParts = path.split('/');
            const userId = pathParts.pop();
            const courseId = pathParts.pop();
            return await getCurrentModule(courseId, userId, headers);
            
        } else if (path.includes('/video-data/')) {
            // GET /video-data/{moduleId}
            const moduleId = path.split('/').pop();
            return await getModuleVideoData(moduleId, queryParams, headers);
            
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Endpoint no encontrado' })
            };
        }

    } catch (error) {
        console.error('💥 Error en course-data function:', error);
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

async function getCourseFullStructure(courseId, queryParams, headers) {
    try {
        const { userId } = queryParams;

        console.log(`📚 Obteniendo estructura completa del curso: ${courseId}`);

        // 1. Obtener datos del curso (buscar por slug o UUID)
        let courseQuery = supabase.from('courses').select('*').eq('is_active', true);
        
        // Verificar si courseId es un UUID o un slug
        if (courseId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            courseQuery = courseQuery.eq('id', courseId);
        } else {
            courseQuery = courseQuery.eq('slug', courseId);
        }
        
        const { data: courseData, error: courseError } = await courseQuery.single();

        if (courseError || !courseData) {
            console.error('❌ Error obteniendo curso:', courseError);
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    error: 'Curso no encontrado',
                    details: courseError?.message 
                })
            };
        }

        // 2. Obtener módulos con videos y checkpoints (usar el UUID real del curso)
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
            .eq('course_id', courseData.id)
            .order('order_index', { ascending: true });

        if (modulesError) {
            console.error('❌ Error obteniendo módulos:', modulesError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Error obteniendo módulos',
                    details: modulesError.message 
                })
            };
        }

        // 3. Obtener progreso del usuario (si se proporciona userId)
        let userProgress = null;
        let videoProgressMap = new Map();

        if (userId) {
            // Progreso general del curso (usar el UUID real del curso)
            const { data: courseProgressData, error: courseProgressError } = await supabase
                .from('user_course_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('course_id', courseData.id)
                .single();

            if (!courseProgressError && courseProgressData) {
                userProgress = courseProgressData;
            }

            // Progreso detallado por video (usar el UUID real del curso)
            const { data: videoProgressData } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('course_id', courseData.id);

            if (videoProgressData) {
                videoProgressData.forEach(progress => {
                    videoProgressMap.set(progress.video_id, progress);
                });
            }
        }

        // 4. Estructurar respuesta
        const structuredModules = modulesData.map(module => ({
            ...module,
            videos: module.module_videos.map(video => ({
                ...video,
                checkpoints: video.video_checkpoints,
                youtube_embed_url: `https://www.youtube.com/embed/${video.youtube_video_id}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`,
                youtube_thumbnail_url: `https://img.youtube.com/vi/${video.youtube_video_id}/maxresdefault.jpg`,
                user_progress: videoProgressMap.get(video.id) || {
                    current_time_seconds: 0,
                    completion_percentage: 0,
                    is_completed: false
                }
            })),
            materials: module.module_materials
        }));

        const response = {
            success: true,
            course: courseData,
            modules: structuredModules,
            user_progress: userProgress,
            summary: {
                total_modules: modulesData.length,
                total_videos: modulesData.reduce((sum, m) => sum + m.module_videos.length, 0),
                total_duration_minutes: courseData.duration_total_minutes
            }
        };

        console.log(`✅ Estructura del curso obtenida exitosamente`);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('💥 Error en getCourseFullStructure:', error);
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

async function getCurrentModule(courseId, userId, headers) {
    try {
        console.log(`📍 Obteniendo módulo actual para usuario ${userId} en curso ${courseId}`);

        // Resolver courseId a UUID si es necesario
        const resolvedCourseId = await resolveCourseId(courseId);
        if (!resolvedCourseId) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Curso no encontrado' })
            };
        }

        // 1. Obtener progreso del curso
        let { data: courseProgress } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', resolvedCourseId)
            .single();

        // Si no existe progreso, crear uno inicial con el primer módulo
        if (!courseProgress) {
            const { data: firstModule } = await supabase
                .from('course_modules')
                .select('id')
                .eq('course_id', resolvedCourseId)
                .order('order_index', { ascending: true })
                .limit(1)
                .single();

            if (firstModule) {
                const { data: newProgress } = await supabase
                    .from('user_course_progress')
                    .insert({
                        user_id: userId,
                        course_id: resolvedCourseId,
                        current_module_id: firstModule.id,
                        total_modules: 0,
                        total_videos: 0
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
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Error obteniendo módulo actual',
                    details: moduleError.message 
                })
            };
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
            success: true,
            course_progress: courseProgress,
            current_module: currentModule,
            current_video: currentVideo ? {
                ...currentVideo,
                checkpoints: currentVideo.video_checkpoints,
                youtube_embed_url: `https://www.youtube.com/embed/${currentVideo.youtube_video_id}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`,
                youtube_thumbnail_url: `https://img.youtube.com/vi/${currentVideo.youtube_video_id}/maxresdefault.jpg`,
                user_progress: videoProgress || {
                    current_time_seconds: 0,
                    completion_percentage: 0,
                    is_completed: false
                }
            } : null,
            materials: currentModule?.module_materials || []
        };

        console.log(`✅ Módulo actual obtenido exitosamente`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('💥 Error en getCurrentModule:', error);
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

async function getModuleVideoData(moduleId, queryParams, headers) {
    try {
        const { userId } = queryParams;

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
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    error: 'Video no encontrado',
                    details: videoError?.message 
                })
            };
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
            success: true,
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
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('💥 Error en getModuleVideoData:', error);
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