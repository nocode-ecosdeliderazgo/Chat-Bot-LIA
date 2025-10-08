// ===== UPDATE MODULE PROGRESS NETLIFY FUNCTION =====
// Actualiza el progreso de un módulo específico

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configurar headers CORS
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Solo permitir POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        // Extraer datos del request
        const userId = event.headers['x-user-id'];
        const requestBody = JSON.parse(event.body || '{}');

        const {
            course_identifier = 'intro-to-ai',
            module_number,
            progress_percentage,
            status,
            video_progress_percentage,
            video_completed,
            last_video_position,
            time_spent_minutes,
            video_section_progress
        } = requestBody;

        console.log('📊 Actualizando progreso del módulo:', {
            userId,
            course_identifier,
            module_number,
            progress_percentage,
            status
        });

        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'User ID requerido',
                    details: 'Proporciona X-User-Id en headers'
                })
            };
        }

        if (!module_number) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Número de módulo requerido',
                    details: 'Proporciona module_number en el body'
                })
            };
        }

        // Validar valores
        if (progress_percentage !== undefined && (progress_percentage < 0 || progress_percentage > 100)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'progress_percentage debe estar entre 0 y 100'
                })
            };
        }

        if (status && !['not_started', 'in_progress', 'completed', 'locked'].includes(status)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Status inválido',
                    details: 'Debe ser: not_started, in_progress, completed, locked'
                })
            };
        }

        // Obtener el course_progress_id
        const { data: courseProgress, error: courseError } = await supabase
            .from('course_progress')
            .select('id')
            .eq('user_id', userId)
            .eq('course_identifier', course_identifier)
            .single();

        if (courseError) {
            console.error('❌ Error obteniendo course_progress:', courseError);
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'Progreso del curso no encontrado',
                    details: 'Primero obtén el progreso del curso con get-course-progress'
                })
            };
        }

        // Preparar datos para actualizar
        const updateData = {
            last_accessed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Agregar campos opcionales si están presentes
        if (progress_percentage !== undefined) {
            updateData.progress_percentage = progress_percentage;
        }

        if (status) {
            updateData.status = status;
            
            // Actualizar timestamps según el estado
            if (status === 'in_progress' && !updateData.started_at) {
                updateData.started_at = new Date().toISOString();
            } else if (status === 'completed') {
                updateData.completed_at = new Date().toISOString();
                updateData.progress_percentage = 100; // Asegurar que esté al 100%
            }
        }

        if (video_progress_percentage !== undefined) {
            updateData.video_progress_percentage = video_progress_percentage;
        }

        if (video_completed !== undefined) {
            updateData.video_completed = video_completed;
        }

        if (last_video_position !== undefined) {
            updateData.last_video_position = last_video_position;
        }

        if (time_spent_minutes !== undefined) {
            updateData.time_spent_minutes = time_spent_minutes;
        }

        console.log('📝 Datos a actualizar:', updateData);

        // Actualizar progreso del módulo
        const { data: updatedModule, error: updateError } = await supabase
            .from('module_progress')
            .update(updateData)
            .eq('user_id', userId)
            .eq('course_progress_id', courseProgress.id)
            .eq('module_number', module_number)
            .select('*')
            .single();

        if (updateError) {
            console.error('❌ Error actualizando módulo:', updateError);
            throw updateError;
        }

        console.log('✅ Módulo actualizado:', updatedModule);

        // Actualizar progreso de secciones del video si se proporciona
        if (video_section_progress && Array.isArray(video_section_progress)) {
            console.log('🎥 Actualizando progreso de secciones de video...');
            
            for (const section of video_section_progress) {
                const { section_number, completed, start_time_seconds, end_time_seconds } = section;
                
                if (section_number && completed !== undefined) {
                    await supabase
                        .from('video_section_progress')
                        .upsert({
                            module_progress_id: updatedModule.id,
                            user_id: userId,
                            section_number,
                            start_time_seconds: start_time_seconds || 0,
                            end_time_seconds: end_time_seconds || 0,
                            completed,
                            viewed_at: completed ? new Date().toISOString() : null,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id,module_progress_id,section_number'
                        });
                }
            }
            
            console.log('✅ Secciones de video actualizadas');
        }

        // Si el módulo se completó, desbloquear el siguiente
        if (status === 'completed' && module_number < 5) {
            console.log(`🔓 Desbloqueando módulo ${module_number + 1}...`);
            
            const { error: unlockError } = await supabase
                .from('module_progress')
                .update({ 
                    status: 'not_started',
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('course_progress_id', courseProgress.id)
                .eq('module_number', module_number + 1)
                .eq('status', 'locked');

            if (unlockError) {
                console.warn('⚠️ Error desbloqueando siguiente módulo:', unlockError);
            } else {
                console.log(`✅ Módulo ${module_number + 1} desbloqueado`);
            }
        }

        // Obtener progreso actualizado del curso
        const { data: updatedProgress, error: progressError } = await supabase
            .from('user_course_progress_view')
            .select('*')
            .eq('user_id', userId)
            .eq('course_identifier', course_identifier)
            .single();

        if (progressError) {
            console.warn('⚠️ Error obteniendo progreso actualizado:', progressError);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                module: updatedModule,
                course_progress: updatedProgress,
                message: 'Progreso del módulo actualizado correctamente',
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('💥 Error en update-module-progress:', error);
        
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