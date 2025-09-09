// =====================================================
// SCRIPT: PROBAR CARGA DE ACTIVIDADES
// Verificar que los datos se carguen correctamente desde la API
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno desde .env
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables de entorno de Supabase no configuradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testActivityLoad() {
    console.log('🧪 Probando carga de actividades...');
    
    try {
        // Simular la misma consulta que hace la aplicación
        console.log('📡 Simulando consulta de course-data...');
        
        const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .eq('is_active', true)
            .limit(1);
        
        if (coursesError || !coursesData || coursesData.length === 0) {
            console.error('❌ Error obteniendo curso:', coursesError);
            return;
        }
        
        const course = coursesData[0];
        console.log(`📚 Curso encontrado: ${course.title}`);
        
        // Obtener módulos con videos (simulando la misma consulta que course-data.js)
        const { data: modulesData, error: modulesError } = await supabase
            .from('course_modules')
            .select(`
                *,
                module_videos (
                    id,
                    video_title,
                    transcript_text,
                    descripcion_actividad,
                    prompts_actividad,
                    video_order
                )
            `)
            .eq('course_id', course.id)
            .order('order_index', { ascending: true });
        
        if (modulesError) {
            console.error('❌ Error obteniendo módulos:', modulesError);
            return;
        }
        
        console.log(`📦 Módulos encontrados: ${modulesData.length}`);
        
        // Verificar los primeros videos con actividades
        const firstModule = modulesData[0];
        if (firstModule && firstModule.module_videos) {
            console.log(`\n🎬 Videos del primer módulo: ${firstModule.module_videos.length}`);
            
            const videosWithActivities = firstModule.module_videos.filter(v => 
                v.descripcion_actividad || v.prompts_actividad
            );
            
            console.log(`📋 Videos con actividades: ${videosWithActivities.length}`);
            
            // Mostrar detalles de algunos videos
            videosWithActivities.slice(0, 3).forEach((video, index) => {
                console.log(`\n📹 Video ${index + 1}: ${video.video_title}`);
                console.log(`   ✅ Transcripción: ${video.transcript_text ? 'SÍ' : 'NO'}`);
                console.log(`   📝 Descripción actividad: ${video.descripcion_actividad ? 'SÍ (' + video.descripcion_actividad.length + ' chars)' : 'NO'}`);
                console.log(`   💡 Prompts actividad: ${video.prompts_actividad ? 'SÍ (' + video.prompts_actividad.length + ' chars)' : 'NO'}`);
                
                if (video.descripcion_actividad) {
                    console.log(`   📄 Descripción preview: ${video.descripcion_actividad.substring(0, 80)}...`);
                }
            });
            
            // Test específico: buscar un video con actividades
            const videoWithActivity = videosWithActivities[0];
            if (videoWithActivity) {
                console.log(`\n🔬 TEST DETALLADO para: ${videoWithActivity.video_title}`);
                console.log('📋 Simulando updateActivityContent...');
                
                // Simular lo que hace updateActivityContent
                const hasDescription = videoWithActivity.descripcion_actividad && videoWithActivity.descripcion_actividad.trim();
                const hasPrompts = videoWithActivity.prompts_actividad && videoWithActivity.prompts_actividad.trim();
                
                console.log(`   ✅ Descripción válida: ${hasDescription ? 'SÍ' : 'NO'}`);
                console.log(`   ✅ Prompts válidos: ${hasPrompts ? 'SÍ' : 'NO'}`);
                
                if (hasDescription) {
                    console.log(`   📄 Descripción completa disponible (${videoWithActivity.descripcion_actividad.length} caracteres)`);
                }
                
                if (hasPrompts) {
                    console.log(`   💡 Prompts completos disponibles (${videoWithActivity.prompts_actividad.length} caracteres)`);
                }
                
                console.log('\n🎯 RESULTADO: El frontend debería mostrar las actividades correctamente');
            }
        } else {
            console.log('⚠️  No se encontraron videos en el primer módulo');
        }
        
        console.log('\n✅ Test completado. Los datos están listos para el frontend.');
        
    } catch (error) {
        console.error('💥 Error durante el test:', error);
    }
}

// Ejecutar el test
testActivityLoad();