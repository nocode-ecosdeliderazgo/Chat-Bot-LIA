// ===== GET COURSE PROGRESS NETLIFY FUNCTION =====
// Obtiene el progreso completo de un curso para un usuario

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configurar headers CORS
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
    // Manejar preflight CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Solo permitir GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        // Extraer parámetros
        const userId = event.headers['x-user-id'] || event.queryStringParameters?.user_id;
        const courseId = event.queryStringParameters?.course_id;
        const courseIdentifier = event.queryStringParameters?.course_identifier || 'intro-to-ai';

        console.log('📊 Obteniendo progreso del curso:', { userId, courseId, courseIdentifier });

        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'User ID requerido',
                    details: 'Proporciona user_id en headers o query params'
                })
            };
        }

        // Obtener progreso del curso usando la vista personalizada
        const { data: progressData, error: progressError } = await supabase
            .from('user_course_progress_view')
            .select('*')
            .eq('user_id', userId)
            .eq('course_identifier', courseIdentifier)
            .single();

        if (progressError && progressError.code !== 'PGRST116') { // PGRST116 = not found
            console.error('❌ Error obteniendo progreso:', progressError);
            throw progressError;
        }

        // Si no existe progreso, inicializar curso
        if (!progressData) {
            console.log('🚀 Inicializando progreso del curso para usuario:', userId);
            
            // Definir módulos del curso de IA
            const courseModules = [
                {
                    number: 1,
                    name: '¿Qué es la IA?',
                    identifier: 'module-1-intro-ia',
                    video_id: 'Yy_eZ65jzmo'
                },
                {
                    number: 2,
                    name: 'Historia de la IA',
                    identifier: 'module-2-history-ia',
                    video_id: 'dhsy6epaJGs'
                },
                {
                    number: 3,
                    name: 'Fundamentos del ML',
                    identifier: 'module-3-ml-fundamentals',
                    video_id: 'DvyOm9HeT-k'
                },
                {
                    number: 4,
                    name: 'Redes Neuronales',
                    identifier: 'module-4-neural-networks',
                    video_id: 'oiKj0Z_Xnjc'
                },
                {
                    number: 5,
                    name: 'Aplicaciones Prácticas',
                    identifier: 'module-5-applications',
                    video_id: 'HMoaRIbOaN0'
                }
            ];

            // Llamar función de inicialización
            const { data: initResult, error: initError } = await supabase
                .rpc('initialize_course_progress', {
                    p_user_id: userId,
                    p_course_identifier: courseIdentifier,
                    p_course_modules: courseModules
                });

            if (initError) {
                console.error('❌ Error inicializando progreso:', initError);
                throw initError;
            }

            console.log('✅ Curso inicializado, obteniendo datos...');

            // Obtener datos recién creados
            const { data: newProgressData, error: newError } = await supabase
                .from('user_course_progress_view')
                .select('*')
                .eq('user_id', userId)
                .eq('course_identifier', courseIdentifier)
                .single();

            if (newError) {
                console.error('❌ Error obteniendo progreso inicial:', newError);
                throw newError;
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    progress: newProgressData,
                    initialized: true,
                    message: 'Progreso del curso inicializado correctamente'
                })
            };
        }

        console.log('✅ Progreso obtenido correctamente');

        // Procesar datos para el frontend
        const processedProgress = {
            course_progress_id: progressData.course_progress_id,
            user_id: progressData.user_id,
            course_identifier: progressData.course_identifier,
            overall_progress_percentage: progressData.overall_progress_percentage || 0,
            status: progressData.course_status,
            started_at: progressData.course_started_at,
            last_accessed_at: progressData.last_accessed_at,
            completed_at: progressData.course_completed_at,
            modules: progressData.modules || [],
            
            // Estadísticas calculadas
            total_modules: (progressData.modules || []).length,
            completed_modules: (progressData.modules || []).filter(m => m.status === 'completed').length,
            current_module: (progressData.modules || []).find(m => m.status === 'in_progress')?.module_number || 1,
            
            // Tiempo total estimado
            total_time_spent: (progressData.modules || []).reduce((total, module) => {
                return total + (module.time_spent_minutes || 0);
            }, 0)
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                progress: processedProgress,
                initialized: false,
                message: 'Progreso obtenido correctamente'
            })
        };

    } catch (error) {
        console.error('💥 Error en get-course-progress:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error interno del servidor',
                details: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};