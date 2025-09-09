// =====================================================
// SCRIPT: INSERTAR DATOS DE EJEMPLO PARA ACTIVIDADES
// Agregar contenido a descripcion_actividad y prompts_actividad
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

async function insertSampleActivities() {
    console.log('🚀 Insertando datos de ejemplo para actividades...');
    
    try {
        // Primero obtener algunos videos existentes
        const { data: videos, error: videosError } = await supabase
            .from('module_videos')
            .select('id, video_title')
            .limit(5);
        
        if (videosError) {
            console.error('❌ Error obteniendo videos:', videosError);
            return;
        }
        
        console.log(`📹 Encontrados ${videos.length} videos para actualizar`);
        
        // Datos de ejemplo para actividades
        const sampleActivities = [
            {
                descripcion: `Esta actividad te permitirá poner en práctica los conceptos fundamentales de redes neuronales. 

                Aprenderás a:
                - Identificar los componentes básicos de una neurona artificial
                - Comprender el flujo de datos en una red neuronal
                - Analizar el proceso de entrenamiento y aprendizaje

                La actividad incluye ejercicios prácticos y ejemplos del mundo real para consolidar tu comprensión.`,
                
                prompts: `💡 Ejercicios Prácticos:

1. **Análisis de Arquitectura**
   - Dibuja una red neuronal simple con 3 capas
   - Identifica las funciones de activación más comunes

2. **Preguntas de Reflexión**
   - ¿Qué ventajas tienen las redes neuronales sobre los algoritmos tradicionales?
   - ¿En qué casos NO utilizarías una red neuronal?

3. **Experimento Práctico**
   - Investiga un caso de uso real de redes neuronales en tu industria
   - Explica cómo mejoraría un proceso existente

4. **Desafío Extra**
   - Crea un pequeño dataset de ejemplo con 10 datos
   - Describe cómo entrenarías una red para clasificarlos`
            },
            {
                descripcion: `Actividad práctica para dominar los conceptos avanzados de inteligencia artificial.

                En esta sección trabajaremos en:
                - Implementación de algoritmos de aprendizaje
                - Optimización de hiperparámetros
                - Evaluación de modelos y métricas de rendimiento
                
                Incluye casos de estudio reales y proyectos hands-on para aplicar lo aprendido inmediatamente.`,
                
                prompts: `🎯 Actividades Interactivas:

1. **Caso de Estudio: E-commerce**
   - Analiza cómo implementar un sistema de recomendaciones
   - Identifica los datos necesarios y el flujo de procesamiento

2. **Optimización de Modelos**
   - ¿Qué métricas usarías para evaluar un modelo de clasificación?
   - Describe tres técnicas para mejorar la precisión

3. **Proyecto Mini**
   - Diseña un chatbot simple para atención al cliente
   - Define las intenciones y respuestas básicas

4. **Reflexión Estratégica**
   - ¿Cómo impactará la IA en tu industria en los próximos 5 años?
   - Identifica 3 oportunidades de automatización en tu trabajo actual`
            }
        ];
        
        // Actualizar los videos con datos de actividad
        for (let i = 0; i < Math.min(videos.length, sampleActivities.length); i++) {
            const video = videos[i];
            const activity = sampleActivities[i % sampleActivities.length];
            
            console.log(`🔄 Actualizando video: ${video.video_title.substring(0, 50)}...`);
            
            const { data, error } = await supabase
                .from('module_videos')
                .update({
                    descripcion_actividad: activity.descripcion,
                    prompts_actividad: activity.prompts
                })
                .eq('id', video.id);
            
            if (error) {
                console.error(`❌ Error actualizando video ${video.id}:`, error);
            } else {
                console.log(`✅ Video ${video.video_title.substring(0, 30)} actualizado correctamente`);
            }
        }
        
        // Verificar la actualización
        console.log('🔍 Verificando datos insertados...');
        
        const { data: updatedVideos, error: checkError } = await supabase
            .from('module_videos')
            .select('id, video_title, descripcion_actividad, prompts_actividad')
            .not('descripcion_actividad', 'is', null)
            .limit(3);
        
        if (checkError) {
            console.error('❌ Error verificando datos:', checkError);
        } else {
            console.log('✅ Datos insertados correctamente:');
            updatedVideos.forEach(video => {
                console.log(`📋 ${video.video_title}`);
                console.log(`   - Descripción: ${video.descripcion_actividad ? video.descripcion_actividad.substring(0, 80) + '...' : 'N/A'}`);
                console.log(`   - Prompts: ${video.prompts_actividad ? video.prompts_actividad.substring(0, 80) + '...' : 'N/A'}`);
            });
        }
        
        console.log('🎉 ¡Datos de ejemplo insertados exitosamente!');
        
    } catch (error) {
        console.error('💥 Error durante la inserción:', error);
        process.exit(1);
    }
}

// Ejecutar la inserción
insertSampleActivities();