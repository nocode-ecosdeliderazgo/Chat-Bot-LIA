// =====================================================
// SCRIPT: ACTUALIZAR ACTIVIDADES ESPECÍFICAS POR VIDEO
// Agregar contenido específico para cada video del curso
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

async function updateSpecificActivities() {
    console.log('🚀 Actualizando actividades específicas por video...');
    
    try {
        // Obtener todos los videos con sus títulos para identificarlos
        const { data: videos, error: videosError } = await supabase
            .from('module_videos')
            .select('id, video_title')
            .order('video_order');
        
        if (videosError) {
            console.error('❌ Error obteniendo videos:', videosError);
            return;
        }
        
        console.log(`📹 Encontrados ${videos.length} videos:`);
        videos.forEach((video, index) => {
            console.log(`   ${index + 1}. ${video.video_title}`);
        });
        
        // Definir actividades específicas para cada tipo de video
        const activityTemplates = {
            // Para videos de redes neuronales
            'redes neuronales': {
                descripcion: `🧠 **Actividad Práctica: Fundamentos de Redes Neuronales**

Esta actividad te guiará a través de los conceptos fundamentales de las redes neuronales artificiales, ayudándote a comprender cómo funcionan estos sistemas inteligentes.

**Objetivos de Aprendizaje:**
- Comprender la estructura básica de una neurona artificial
- Identificar los diferentes tipos de funciones de activación
- Analizar el proceso de propagación hacia adelante
- Evaluar el impacto de los pesos y sesgos en el aprendizaje

**Duración estimada:** 45-60 minutos
**Nivel:** Principiante a Intermedio`,

                prompts: `💡 **Ejercicios Interactivos**

**1. Análisis Conceptual**
- ¿Qué similitudes y diferencias existen entre una neurona biológica y una artificial?
- Explica con tus propias palabras qué es la "función de activación"

**2. Ejercicio Práctico**
- Diseña en papel una red neuronal simple de 3 capas (entrada, oculta, salida)
- Para un problema de clasificación binaria (ej: spam vs no-spam), ¿cuántas neuronas necesitarías en cada capa?

**3. Investigación Aplicada**
- Busca un ejemplo real de aplicación de redes neuronales en tu industria
- Describe cómo mejoraría un proceso existente en tu trabajo

**4. Reflexión Estratégica**
- ¿Qué desafíos técnicos identificas para implementar redes neuronales?
- ¿Qué datos necesitarías para entrenar un modelo en tu contexto profesional?`
            },

            // Para videos de IA general
            'inteligencia artificial': {
                descripcion: `🤖 **Actividad de Exploración: Introducción a la Inteligencia Artificial**

Una actividad completa para explorar el fascinante mundo de la IA, sus aplicaciones actuales y su potencial futuro.

**Lo que aprenderás:**
- Diferentes tipos de IA y sus aplicaciones
- Ventajas y limitaciones de los sistemas inteligentes
- Impacto de la IA en diferentes industrias
- Consideraciones éticas y sociales

**Metodología:** Aprendizaje activo con casos reales
**Tiempo necesario:** 30-45 minutos`,

                prompts: `🎯 **Actividades de Descubrimiento**

**1. Inventario Personal de IA**
- Lista 5 aplicaciones de IA que usas diariamente (ej: asistentes virtuales, recomendaciones)
- ¿Cuáles conocías que eran IA y cuáles no?

**2. Caso de Estudio**
- Elige una empresa que conozcas bien
- Identifica 3 procesos que podrían mejorarse con IA
- Describe el "antes y después" de cada proceso

**3. Análisis Crítico**
- ¿Qué trabajos crees que la IA NO debería reemplazar? ¿Por qué?
- ¿Qué habilidades humanas seguirán siendo irreemplazables?

**4. Visión Futura**
- Describe cómo imaginas que la IA cambiará tu industria en 10 años
- ¿Qué nuevas oportunidades profesionales surgirán?`
            },

            // Para videos de historia/evolución
            'historia': {
                descripcion: `📚 **Actividad de Contexto: Evolución Histórica de la IA**

Explora el fascinante viaje de la inteligencia artificial desde sus orígenes conceptuales hasta las innovaciones actuales.

**Exploraremos:**
- Hitos históricos clave en el desarrollo de la IA
- Evolución de las técnicas y enfoques
- Personalidades influyentes y sus contribuciones
- Conexión entre avances históricos y aplicaciones actuales

**Formato:** Línea de tiempo interactiva y análisis reflexivo
**Duración:** 25-35 minutos`,

                prompts: `🕰️ **Viaje en el Tiempo de la IA**

**1. Línea de Tiempo Personal**
- Crea tu propia línea de tiempo con los 5 hitos más importantes de la IA
- Para cada hito, explica por qué lo consideras relevante

**2. Conexiones Históricas**
- ¿Qué tecnología actual de IA tiene sus raíces en los trabajos de Alan Turing?
- Relaciona un avance histórico con una aplicación que uses hoy

**3. Análisis de Impacto**
- ¿Qué momento histórico crees que fue el más transformador? ¿Por qué?
- Si pudieras viajar al pasado, ¿qué le preguntarías a uno de los pioneros de la IA?

**4. Predicción Histórica**
- Basándote en los patrones históricos, ¿qué predices para los próximos 20 años?
- ¿Qué tecnologías actuales crees que serán recordadas como revolucionarias?`
            },

            // Template por defecto
            'default': {
                descripcion: `🎓 **Actividad de Aprendizaje Activo**

Una actividad diseñada para reforzar los conceptos clave del video y aplicar el conocimiento en contextos prácticos.

**Componentes:**
- Reflexión sobre conceptos principales
- Aplicación práctica de los conocimientos
- Conexión con experiencias profesionales
- Planificación de próximos pasos

**Metodología:** Learning by doing
**Tiempo estimado:** 30-40 minutos`,

                prompts: `✨ **Ejercicios de Aplicación**

**1. Síntesis Personal**
- Resume los 3 puntos más importantes del video en tus propias palabras
- ¿Qué concepto te resultó más desafiante de entender?

**2. Aplicación Práctica**
- Identifica una situación en tu trabajo donde podrías aplicar lo aprendido
- Describe paso a paso cómo lo implementarías

**3. Investigación Complementaria**
- Busca un artículo o video adicional sobre el tema
- Comparte una idea nueva que no se mencionó en la lección

**4. Plan de Acción**
- Define una acción concreta que realizarás esta semana basada en lo aprendido
- ¿Cómo medirás el éxito de esta implementación?`
            }
        };
        
        // Actualizar cada video con la actividad apropiada
        for (const video of videos) {
            const title = video.video_title.toLowerCase();
            let selectedTemplate = activityTemplates.default;
            
            // Seleccionar template basado en el título del video
            if (title.includes('red') && title.includes('neural')) {
                selectedTemplate = activityTemplates['redes neuronales'];
            } else if (title.includes('inteligencia') || title.includes('ia') || title.includes('ai')) {
                selectedTemplate = activityTemplates['inteligencia artificial'];
            } else if (title.includes('historia') || title.includes('evolución') || title.includes('turing')) {
                selectedTemplate = activityTemplates['historia'];
            }
            
            console.log(`🔄 Actualizando: ${video.video_title}`);
            
            const { data, error } = await supabase
                .from('module_videos')
                .update({
                    descripcion_actividad: selectedTemplate.descripcion,
                    prompts_actividad: selectedTemplate.prompts
                })
                .eq('id', video.id);
            
            if (error) {
                console.error(`❌ Error actualizando ${video.id}:`, error);
            } else {
                console.log(`✅ ${video.video_title.substring(0, 40)}... actualizado`);
            }
        }
        
        console.log('\n🔍 Verificando resultados...');
        
        // Verificar algunos videos actualizados
        const { data: sampleResults, error: sampleError } = await supabase
            .from('module_videos')
            .select('video_title, descripcion_actividad, prompts_actividad')
            .not('descripcion_actividad', 'is', null)
            .limit(3);
        
        if (sampleError) {
            console.error('❌ Error verificando:', sampleError);
        } else {
            console.log('\n📋 Ejemplos de actividades creadas:');
            sampleResults.forEach((video, index) => {
                console.log(`\n${index + 1}. ${video.video_title}`);
                console.log(`   📝 Descripción: ${video.descripcion_actividad.substring(0, 100)}...`);
                console.log(`   💡 Prompts: ${video.prompts_actividad.substring(0, 100)}...`);
            });
        }
        
        console.log('\n🎉 ¡Todas las actividades han sido actualizadas exitosamente!');
        
    } catch (error) {
        console.error('💥 Error durante la actualización:', error);
    }
}

// Ejecutar la actualización
updateSpecificActivities();