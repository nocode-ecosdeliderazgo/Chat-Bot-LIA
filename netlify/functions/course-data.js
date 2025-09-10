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
        console.log(`🔍 Path parts: ${JSON.stringify(path.split('/'))}`);
        console.log(`🔍 Query params: ${JSON.stringify(queryParams)}`);

        // Routing basado en path - compatible con nuevos redirects
        if (path.includes('/full-structure')) {
            // GET /api/courses/{courseId}/full-structure
            const pathParts = path.split('/');
            const courseIndex = pathParts.indexOf('courses');
            const courseId = pathParts[courseIndex + 1];
            return await getCourseFullStructure(courseId, queryParams, headers);
            
        } else if (path.includes('/current-module/')) {
            // GET /api/courses/{courseId}/current-module/{userId} o legacy
            const pathParts = path.split('/');
            const courseIndex = pathParts.indexOf('courses');
            const moduleIndex = pathParts.indexOf('current-module');
            
            let courseId, userId;
            if (courseIndex !== -1) {
                // Nueva ruta: /api/courses/{courseId}/current-module/{userId}
                courseId = pathParts[courseIndex + 1];
                userId = pathParts[moduleIndex + 1];
            } else {
                // Ruta legacy: /current-module/{courseId}/{userId}
                userId = pathParts.pop();
                courseId = pathParts.pop();
            }
            return await getCurrentModule(courseId, userId, headers);
            
        } else if (path.includes('/video-data')) {
            // GET /api/modules/{moduleId}/video-data
            const pathParts = path.split('/');
            const moduleIndex = pathParts.indexOf('modules');
            const moduleId = moduleIndex !== -1 ? pathParts[moduleIndex + 1] : path.split('/').pop();
            return await getModuleVideoData(moduleId, queryParams, headers);
            
        } else if (path.includes('/videos')) {
            // GET /api/modules/{moduleId}/videos
            const pathParts = path.split('/');
            const moduleIndex = pathParts.indexOf('modules');
            const moduleId = moduleIndex !== -1 ? pathParts[moduleIndex + 1] : path.split('/').slice(-2)[0];
            return await getModuleVideos(moduleId, queryParams, headers);
            
        } else {
            console.warn(`⚠️ Ruta no reconocida: ${path}`);
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    error: 'Endpoint no encontrado',
                    path: path,
                    availableEndpoints: [
                        '/api/courses/{courseId}/full-structure',
                        '/api/courses/{courseId}/current-module/{userId}',
                        '/api/modules/{moduleId}/video-data',
                        '/api/modules/{moduleId}/videos'
                    ]
                })
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
            console.error('🔍 Course ID buscado:', courseId);
            console.error('🔍 Es UUID?:', courseId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? 'Sí' : 'No');
            
            // Listar cursos disponibles para debugging
            const { data: availableCourses } = await supabase
                .from('courses')
                .select('id, title, slug')
                .eq('is_active', true);
                
            console.log('📋 Cursos disponibles:', availableCourses);
            
            // FALLBACK TEMPORAL: Si el courseId coincide con slugs conocidos, usar datos mockeados
            if (courseId === 'ia-fundamentos' || courseId === 'introduccion-ia') {
                console.log('🔧 Usando fallback para courseId conocido:', courseId);
                return await getFallbackCourseData(courseId, queryParams, headers);
            }
            
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    error: 'Curso no encontrado',
                    requestedCourseId: courseId,
                    availableCourses: availableCourses?.map(c => ({ id: c.id, slug: c.slug, title: c.title })),
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
                    video_checkpoints (*),
                    descripcion_actividad,
                    prompts_actividad
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
            console.error('❌ getCurrentModule - Curso no encontrado:', courseId);
            
            // FALLBACK TEMPORAL: Si el courseId coincide con slugs conocidos, usar datos mockeados
            if (courseId === 'ia-fundamentos' || courseId === 'introduccion-ia') {
                console.log('🔧 getCurrentModule - Usando fallback para courseId conocido:', courseId);
                return await getFallbackCurrentModule(courseId, userId, headers);
            }
            
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    error: 'Curso no encontrado',
                    requestedCourseId: courseId
                })
            };
        }

        // 1. Obtener progreso del curso
        let { data: courseProgress } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', resolvedCourseId)
            .single();

        // Si no existe progreso, buscar el primer módulo del curso y crear progreso inicial
        if (!courseProgress) {
            console.log('⚠️ No se encontró progreso del usuario, buscando primer módulo...');
            
            // Buscar el primer módulo del curso actual usando las tablas correctas
            const { data: firstModule, error: moduleError } = await supabase
                .from('course_modules')
                .select('id, title, module_number, description')
                .eq('course_id', resolvedCourseId)
                .order('order_index', { ascending: true })
                .limit(1)
                .single();

            if (moduleError) {
                console.error('❌ Error buscando primer módulo:', moduleError);
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ 
                        error: 'No se encontraron módulos para este curso',
                        details: moduleError.message 
                    })
                };
            }

            if (firstModule) {
                console.log('✅ Primer módulo encontrado:', firstModule.title);
                
                // Intentar crear progreso inicial en user_course_progress
                try {
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
                    console.log('✅ Progreso inicial creado');
                } catch (insertError) {
                    console.warn('⚠️ No se pudo crear progreso inicial, usando fallback:', insertError.message);
                    
                    // Fallback: devolver datos del primer módulo sin crear progreso
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            current_module: {
                                id: firstModule.id,
                                title: firstModule.title,
                                module_number: firstModule.module_number,
                                description: firstModule.description,
                                progress_percentage: 0,
                                is_completed: false
                            },
                            message: 'Usando primer módulo como fallback (sin progreso persistente)'
                        })
                    };
                }
            } else {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'No se encontraron módulos para este curso' })
                };
            }
        }

        // 2. Obtener datos del módulo actual
        const { data: currentModule, error: moduleError } = await supabase
            .from('course_modules')
            .select(`
                *,
                module_videos (
                    *,
                    video_checkpoints (*),
                    descripcion_actividad,
                    prompts_actividad
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
                descripcion_actividad,
                prompts_actividad,
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

// =====================================================
// FUNCIÓN: OBTENER TODOS LOS VIDEOS DE UN MÓDULO
// =====================================================

async function getModuleVideos(moduleId, queryParams, headers) {
    try {
        console.log(`🎬 Obteniendo videos del módulo: ${moduleId}`);

        // Obtener videos del módulo
        const { data: videosData, error: videosError } = await supabase
            .from('module_videos')
            .select(`
                *,
                video_checkpoints (*),
                descripcion_actividad,
                prompts_actividad,
                course_modules!inner (
                    id, title, slug, order_index,
                    courses!inner (
                        id, title, slug, is_active
                    )
                )
            `)
            .eq('module_id', moduleId)
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (videosError) {
            console.error('❌ Error obteniendo videos:', videosError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Error obteniendo videos del módulo',
                    details: videosError.message 
                })
            };
        }

        if (!videosData || videosData.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    error: 'No se encontraron videos para este módulo',
                    moduleId: moduleId 
                })
            };
        }

        // Obtener progreso del usuario si se proporciona userId
        const { userId } = queryParams;
        if (userId) {
            // Obtener progreso para todos los videos del módulo
            const { data: progressData } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .in('video_id', videosData.map(v => v.id));

            // Agregar progreso a cada video
            videosData.forEach(video => {
                const progress = progressData?.find(p => p.video_id === video.id);
                video.user_progress = progress || {
                    current_time_seconds: 0,
                    completion_percentage: 0,
                    is_completed: false
                };
            });
        }

        // Estructurar videos con URLs de YouTube
        const structuredVideos = videosData.map(video => ({
            ...video,
            checkpoints: video.video_checkpoints,
            youtube_embed_url: `https://www.youtube.com/embed/${video.youtube_video_id}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`,
            youtube_thumbnail_url: `https://img.youtube.com/vi/${video.youtube_video_id}/maxresdefault.jpg`,
            youtube_watch_url: `https://www.youtube.com/watch?v=${video.youtube_video_id}`
        }));

        const response = {
            success: true,
            module: videosData[0]?.course_modules,
            course: videosData[0]?.course_modules?.courses,
            videos: structuredVideos,
            summary: {
                total_videos: structuredVideos.length,
                total_duration_minutes: structuredVideos.reduce((sum, v) => sum + (v.duration_minutes || 0), 0)
            }
        };

        console.log(`✅ Videos del módulo obtenidos exitosamente (${structuredVideos.length} videos)`);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('💥 Error en getModuleVideos:', error);
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

// =====================================================
// FUNCIÓN DE FALLBACK TEMPORAL
// =====================================================

async function getFallbackCourseData(courseId, queryParams, headers) {
    console.log(`🔧 Generando datos de fallback para courseId: ${courseId}`);
    
    const { userId } = queryParams;
    
    // Datos mockeados basados en los datos locales del modules-expandable-system.js
    const fallbackData = {
        success: true,
        data: {
            course: {
                id: courseId === 'ia-fundamentos' ? '550e8400-e29b-41d4-a716-446655440001' : '550e8400-e29b-41d4-a716-446655440002',
                title: courseId === 'ia-fundamentos' ? 'Fundamentos de IA' : 'Introducción a la IA',
                slug: courseId,
                category: 'Inteligencia Artificial',
                description: 'Curso completo de Inteligencia Artificial'
            },
            modules: [
                {
                    id: 'modulo-1',
                    module_number: 1,
                    title: '¿Qué es la IA?',
                    description: 'Introducción fundamental a la Inteligencia Artificial',
                    duration_minutes: 25,
                    order_index: 1,
                    videos: [
                        {
                            id: 'video-1-1',
                            video_title: 'Bienvenida al curso de Inteligencia Artificial',
                            duration_seconds: 330,
                            youtube_video_id: 'MRIv2IwFTPg',
                            youtube_embed_url: 'https://www.youtube.com/embed/MRIv2IwFTPg?enablejsapi=1&modestbranding=1&rel=0&showinfo=0',
                            video_order: 1,
                            checkpoints: [],
                            user_progress: userId ? {
                                current_time_seconds: 0,
                                is_completed: false,
                                progress_percentage: 0
                            } : null
                        }
                    ]
                },
                {
                    id: 'modulo-2',
                    module_number: 2,
                    title: 'Tipos de IA',
                    description: 'Diferentes categorías y aplicaciones de la IA',
                    duration_minutes: 30,
                    order_index: 2,
                    videos: [
                        {
                            id: 'video-2-1',
                            video_title: 'IA Débil vs IA Fuerte',
                            duration_seconds: 420,
                            youtube_video_id: 'NCTDfjtDN1c',
                            youtube_embed_url: 'https://www.youtube.com/embed/NCTDfjtDN1c?enablejsapi=1&modestbranding=1&rel=0&showinfo=0',
                            video_order: 1,
                            checkpoints: [],
                            user_progress: userId ? {
                                current_time_seconds: 0,
                                is_completed: false,
                                progress_percentage: 0
                            } : null
                        }
                    ]
                }
            ],
            summary: {
                total_modules: 2,
                total_videos: 2,
                total_duration_minutes: 55
            }
        },
        _fallback: true,
        message: 'Datos de fallback temporal - curso no encontrado en BD'
    };

    console.log('✅ Datos de fallback generados exitosamente');
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(fallbackData)
    };
}

async function getFallbackCurrentModule(courseId, userId, headers) {
    console.log(`🔧 Generando módulo actual de fallback para courseId: ${courseId}, userId: ${userId}`);
    
    const fallbackData = {
        success: true,
        current_module: {
            id: 'modulo-1',
            module_number: 1,
            title: '¿Qué es la IA?',
            description: 'Introducción fundamental a la Inteligencia Artificial'
        },
        current_video: {
            id: 'video-1-1',
            video_title: 'Bienvenida al curso de Inteligencia Artificial',
            duration_seconds: 330,
            youtube_video_id: 'MRIv2IwFTPg',
            youtube_embed_url: 'https://www.youtube.com/embed/MRIv2IwFTPg?enablejsapi=1&modestbranding=1&rel=0&showinfo=0',
            checkpoints: [],
            user_progress: {
                current_time_seconds: 0,
                is_completed: false,
                progress_percentage: 0
            }
        },
        _fallback: true,
        message: 'Módulo actual de fallback temporal - curso no encontrado en BD'
    };

    console.log('✅ Módulo actual de fallback generado exitosamente');
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(fallbackData)
    };
}