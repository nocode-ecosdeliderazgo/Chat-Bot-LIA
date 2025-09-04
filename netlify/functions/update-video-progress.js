// ===== UPDATE VIDEO PROGRESS NETLIFY FUNCTION =====
// Actualiza el progreso específico del video (posición, secciones completadas)

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
            video_progress_percentage,
            last_video_position,
            video_duration,
            sections_completed,
            video_completed,
            time_watched_seconds
        } = requestBody;

        console.log('🎥 Actualizando progreso del video:', {
            userId,
            module_number,
            video_progress_percentage,
            last_video_position,
            video_completed
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
                    error: 'Número de módulo requerido'
                })
            };
        }

        // Obtener el module_progress_id
        const { data: moduleProgress, error: moduleError } = await supabase
            .from('module_progress')
            .select('id, course_progress_id, time_spent_minutes')
            .eq('user_id', userId)
            .eq('module_number', module_number)
            .single();

        if (moduleError) {
            console.error('❌ Error obteniendo module_progress:', moduleError);
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'Progreso del módulo no encontrado',
                    details: 'Primero inicializa el progreso del curso'
                })
            };
        }

        // Preparar datos para actualizar el módulo
        const moduleUpdateData = {
            last_accessed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Actualizar progreso del video
        if (video_progress_percentage !== undefined) {
            moduleUpdateData.video_progress_percentage = Math.min(100, Math.max(0, video_progress_percentage));
        }

        if (last_video_position !== undefined) {
            moduleUpdateData.last_video_position = Math.max(0, last_video_position);
        }

        if (video_completed !== undefined) {
            moduleUpdateData.video_completed = video_completed;
            if (video_completed) {
                moduleUpdateData.video_progress_percentage = 100;
            }
        }

        // Calcular tiempo gastado si se proporciona
        if (time_watched_seconds) {
            const additionalMinutes = Math.round(time_watched_seconds / 60);
            moduleUpdateData.time_spent_minutes = (moduleProgress.time_spent_minutes || 0) + additionalMinutes;
        }

        // Actualizar el progreso del módulo
        const { data: updatedModule, error: updateError } = await supabase
            .from('module_progress')
            .update(moduleUpdateData)
            .eq('id', moduleProgress.id)
            .select('*')
            .single();

        if (updateError) {
            console.error('❌ Error actualizando progreso del video:', updateError);
            throw updateError;
        }

        console.log('✅ Progreso del video actualizado');

        // Actualizar secciones completadas si se proporcionan
        const sectionsUpdated = [];
        if (sections_completed && Array.isArray(sections_completed)) {
            console.log('📊 Actualizando secciones del video...');
            
            for (const section of sections_completed) {
                const {
                    section_number,
                    completed = true,
                    start_time_seconds = 0,
                    end_time_seconds = 0,
                    section_name
                } = section;
                
                if (section_number) {
                    const { data: sectionData, error: sectionError } = await supabase
                        .from('video_section_progress')
                        .upsert({
                            module_progress_id: moduleProgress.id,
                            user_id: userId,
                            section_number,
                            section_name: section_name || `Sección ${section_number}`,
                            start_time_seconds,
                            end_time_seconds,
                            completed,
                            viewed_at: completed ? new Date().toISOString() : null,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id,module_progress_id,section_number',
                            ignoreDuplicates: false
                        })
                        .select('*')
                        .single();

                    if (sectionError) {
                        console.warn(`⚠️ Error actualizando sección ${section_number}:`, sectionError);
                    } else {
                        sectionsUpdated.push(sectionData);
                    }
                }
            }
            
            console.log(`✅ ${sectionsUpdated.length} secciones actualizadas`);
        }

        // Auto-completar el módulo si el video está 100% completado
        let moduleCompleted = false;
        if (video_completed && updatedModule.video_progress_percentage >= 100) {
            console.log('🎯 Video completado al 100%, marcando módulo como completado...');
            
            const { data: completedModule, error: completeError } = await supabase
                .from('module_progress')
                .update({
                    status: 'completed',
                    progress_percentage: 100,
                    completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', moduleProgress.id)
                .select('*')
                .single();

            if (completeError) {
                console.warn('⚠️ Error marcando módulo como completado:', completeError);
            } else {
                moduleCompleted = true;
                console.log('✅ Módulo marcado como completado');
                
                // Desbloquear siguiente módulo si existe
                if (module_number < 5) {
                    await supabase
                        .from('module_progress')
                        .update({ 
                            status: 'not_started',
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', userId)
                        .eq('course_progress_id', moduleProgress.course_progress_id)
                        .eq('module_number', module_number + 1)
                        .eq('status', 'locked');
                    
                    console.log(`🔓 Módulo ${module_number + 1} desbloqueado`);
                }
            }
        }

        // Obtener progreso completo actualizado
        const { data: fullProgress, error: progressError } = await supabase
            .from('user_course_progress_view')
            .select('*')
            .eq('user_id', userId)
            .eq('course_identifier', course_identifier)
            .single();

        if (progressError) {
            console.warn('⚠️ Error obteniendo progreso completo:', progressError);
        }

        // Obtener secciones del video
        const { data: videoSections, error: sectionsError } = await supabase
            .from('video_section_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('module_progress_id', moduleProgress.id)
            .order('section_number');

        if (sectionsError) {
            console.warn('⚠️ Error obteniendo secciones del video:', sectionsError);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                module: updatedModule,
                video_sections: videoSections || [],
                course_progress: fullProgress,
                module_completed: moduleCompleted,
                sections_updated: sectionsUpdated.length,
                message: 'Progreso del video actualizado correctamente',
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('💥 Error en update-video-progress:', error);
        
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