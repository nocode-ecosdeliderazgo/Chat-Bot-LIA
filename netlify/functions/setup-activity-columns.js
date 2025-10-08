// =====================================================
// NETLIFY FUNCTION: SETUP ACTIVITY COLUMNS
// Función para configurar las columnas de actividad en la base de datos
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Inicializar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables de entorno de Supabase no configuradas');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
  console.log('🔧 Netlify Function: setup-activity-columns llamada');
  console.log('🔍 Method:', event.httpMethod);
  console.log('🔍 Path:', event.path);

  // Manejar solicitudes OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Solo permitir GET y POST
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Método no permitido',
        allowedMethods: ['GET', 'POST']
      })
    };
  }

  try {
    // GET: Verificar estado actual de las columnas
    if (event.httpMethod === 'GET') {
      return await checkActivityColumns();
    }
    
    // POST: Configurar las columnas de actividad
    if (event.httpMethod === 'POST') {
      return await setupActivityColumns();
    }

  } catch (error) {
    console.error('❌ Error en función setup-activity-columns:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      })
    };
  }
};

// Verificar estado actual de las columnas
async function checkActivityColumns() {
  try {
    console.log('🔍 Verificando estado actual de las columnas de actividad...');

    // Consultar información de las columnas
    const { data: columnInfo, error: columnError } = await supabase
      .rpc('get_column_info', {
        table_name: 'module_videos',
        column_names: ['descripcion_actividad', 'prompts_actividad']
      })
      .catch(() => {
        // Si la función RPC no existe, usar una consulta directa
        return supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', 'module_videos')
          .in('column_name', ['descripcion_actividad', 'prompts_actividad']);
      });

    // Consultar algunos videos para ver el estado de los datos
    const { data: sampleVideos, error: videosError } = await supabase
      .from('module_videos')
      .select(`
        id,
        video_title,
        descripcion_actividad,
        prompts_actividad
      `)
      .limit(3);

    if (videosError) {
      console.error('❌ Error consultando videos:', videosError);
    }

    const columnsExist = sampleVideos && sampleVideos.length > 0 && 
                        sampleVideos[0].hasOwnProperty('descripcion_actividad') &&
                        sampleVideos[0].hasOwnProperty('prompts_actividad');

    const hasData = columnsExist && sampleVideos.some(video => 
      video.descripcion_actividad && video.prompts_actividad
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        status: {
          columns_exist: columnsExist,
          has_sample_data: hasData,
          sample_count: sampleVideos ? sampleVideos.length : 0
        },
        sample_videos: sampleVideos ? sampleVideos.map(video => ({
          id: video.id,
          title: video.video_title,
          has_description: !!video.descripcion_actividad,
          has_prompts: !!video.prompts_actividad,
          description_preview: video.descripcion_actividad ? 
            video.descripcion_actividad.substring(0, 100) + '...' : null,
          prompts_preview: video.prompts_actividad ? 
            video.prompts_actividad.substring(0, 100) + '...' : null
        })) : [],
        column_info: columnInfo,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Error verificando columnas:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Error verificando estado de columnas',
        message: error.message
      })
    };
  }
}

// Configurar las columnas de actividad
async function setupActivityColumns() {
  try {
    console.log('🔧 Configurando columnas de actividad...');

    // Primero, intentar agregar las columnas (si no existen)
    console.log('📝 Intentando agregar columnas de actividad...');

    // Nota: En Supabase, no podemos ejecutar ALTER TABLE directamente desde el cliente
    // Necesitamos usar una función RPC o hacerlo manualmente en el dashboard
    
    // En su lugar, intentemos actualizar algunos registros para probar
    const { data: videos, error: videosError } = await supabase
      .from('module_videos')
      .select('id, video_title, descripcion_actividad, prompts_actividad')
      .limit(5);

    if (videosError) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Las columnas no existen en la base de datos',
          details: videosError.message,
          instruction: 'Ejecute el script add-activity-columns.sql en el dashboard de Supabase primero'
        })
      };
    }

    // Si llegamos aquí, las columnas existen. Actualizar datos de ejemplo
    const updates = [];
    
    for (const video of videos) {
      if (!video.descripcion_actividad || !video.prompts_actividad) {
        const { data: updated, error: updateError } = await supabase
          .from('module_videos')
          .update({
            descripcion_actividad: video.descripcion_actividad || generateActivityDescription(video.video_title),
            prompts_actividad: video.prompts_actividad || generateActivityPrompts(video.video_title)
          })
          .eq('id', video.id)
          .select();

        if (updateError) {
          console.error(`❌ Error actualizando video ${video.id}:`, updateError);
          updates.push({ id: video.id, status: 'error', error: updateError.message });
        } else {
          console.log(`✅ Video ${video.id} actualizado correctamente`);
          updates.push({ id: video.id, status: 'success' });
        }
      } else {
        updates.push({ id: video.id, status: 'already_has_data' });
      }
    }

    // Verificar el resultado final
    const { data: finalCheck, error: finalError } = await supabase
      .from('module_videos')
      .select('id, video_title, descripcion_actividad, prompts_actividad')
      .limit(3);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Configuración de columnas de actividad completada',
        updates: updates,
        sample_data: finalCheck ? finalCheck.map(video => ({
          id: video.id,
          title: video.video_title,
          has_description: !!video.descripcion_actividad,
          has_prompts: !!video.prompts_actividad
        })) : [],
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Error configurando columnas:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Error configurando columnas de actividad',
        message: error.message
      })
    };
  }
}

// Generar descripción de actividad
function generateActivityDescription(videoTitle) {
  return `📝 **Actividad Práctica: ${videoTitle}**
      
En esta actividad, aplicarás los conceptos aprendidos en el video para consolidar tu comprensión.

**Objetivos:**
- Reforzar los conceptos clave del video
- Aplicar el conocimiento de forma práctica  
- Desarrollar habilidades de análisis crítico

**Instrucciones:**
1. Revisa el contenido del video si es necesario
2. Lee cuidadosamente cada prompt de actividad
3. Desarrolla tus respuestas de forma clara y concisa
4. Reflexiona sobre lo aprendido y toma notas

💡 **Tip:** Tómate tu tiempo para pensar profundamente en cada pregunta antes de responder.`;
}

// Generar prompts de actividad
function generateActivityPrompts(videoTitle) {
  return `🎯 **Prompts de Reflexión y Práctica:**

1. Explica con tus propias palabras los 3 conceptos más importantes que aprendiste en este video.

2. ¿Cómo podrías aplicar estos conocimientos en tu trabajo o proyectos actuales?

3. Identifica al menos 2 preguntas que te surgieron después de ver el video y busca las respuestas.

4. Crea un ejemplo práctico que demuestre tu comprensión del tema principal.

5. Reflexiona sobre cómo este contenido se conecta con lo que ya sabías anteriormente.

✨ **Desafío Extra:** Investiga un caso de estudio real que ejemplifique los conceptos del video y prepara un resumen de 2-3 párrafos.`;
}