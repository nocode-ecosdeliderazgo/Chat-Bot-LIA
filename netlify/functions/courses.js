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
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
  console.log('🎬 Netlify Function: courses llamada');
  console.log('🔍 Method:', event.httpMethod);
  console.log('🔍 Path:', event.path);
  console.log('🔍 Query params:', event.queryStringParameters);

  // Manejar solicitudes OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Determinar qué endpoint se está solicitando basado en la ruta
    const path = event.path || '';
    const urlParts = path.split('/');
    
    // Buscar 'module1-videos' en las partes de la URL
    if (path.includes('module1-videos')) {
      return await handleModule1Videos(event);
    } else if (path.includes('module1-info')) {
      return await handleModule1Info(event);
    } else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Endpoint no encontrado',
          path: path,
          availableEndpoints: [
            'module1-videos',
            'module1-info'
          ]
        })
      };
    }

  } catch (error) {
    console.error('❌ Error en función courses:', error);
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

// Manejar solicitud de videos del módulo 1
async function handleModule1Videos(event) {
  try {
    console.log('📚 Buscando videos del módulo 1...');

    // Consulta para obtener videos del módulo 1
    const { data: videos, error } = await supabase
      .from('ai_course_sessions')
      .select(`
        id,
        session_title as video_title,
        duration_seconds,
        youtube_video_id,
        description,
        session_order as video_order,
        descripcion_actividad,
        prompts_actividad,
        transcript_text
      `)
      .eq('module_number', 1)
      .order('session_order', { ascending: true });

    if (error) {
      console.error('❌ Error consultando base de datos:', error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Error consultando base de datos',
          details: error.message
        })
      };
    }

    console.log(`✅ ${videos ? videos.length : 0} videos encontrados`);

    // Agregar progreso del usuario (simulado por ahora)
    const videosWithProgress = videos?.map(video => ({
      ...video,
      user_progress: {
        current_time_seconds: 0,
        completion_percentage: 0,
        is_completed: false
      }
    })) || [];

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        videos: videosWithProgress,
        count: videosWithProgress.length,
        module: 1
      })
    };

  } catch (error) {
    console.error('❌ Error obteniendo videos del módulo 1:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Error obteniendo videos del módulo 1',
        message: error.message
      })
    };
  }
}

// Manejar solicitud de información del módulo 1
async function handleModule1Info(event) {
  try {
    console.log('📋 Buscando información del módulo 1...');

    // Consulta para obtener información del módulo 1
    const { data: modules, error } = await supabase
      .from('ai_courses')
      .select('id, module_title, module_number')
      .eq('module_number', 1)
      .limit(1);

    if (error) {
      console.error('❌ Error consultando base de datos:', error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Error consultando base de datos',
          details: error.message
        })
      };
    }

    if (!modules || modules.length === 0) {
      console.log('⚠️ Módulo 1 no encontrado');
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Módulo 1 no encontrado'
        })
      };
    }

    console.log('✅ Información del módulo 1 encontrada');

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        module_id: modules[0].id,
        module_title: modules[0].module_title,
        module_number: modules[0].module_number
      })
    };

  } catch (error) {
    console.error('❌ Error obteniendo información del módulo 1:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Error obteniendo información del módulo 1',
        message: error.message
      })
    };
  }
}