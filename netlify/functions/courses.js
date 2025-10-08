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
    console.log('🔍 URL de Supabase configurada:', supabaseUrl ? 'SÍ' : 'NO');
    console.log('🔍 Service key configurada:', supabaseServiceKey ? 'SÍ (longitud: ' + supabaseServiceKey.length + ')' : 'NO');

    // Verificar configuración de Supabase
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Configuración de Supabase faltante');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Configuración de Supabase no disponible',
          debug: {
            supabaseUrl: !!supabaseUrl,
            supabaseKey: !!supabaseServiceKey
          }
        })
      };
    }

    // Consulta para obtener videos del módulo 1 usando las tablas correctas
    console.log('🔄 Ejecutando consulta SQL para obtener videos del módulo 1...');
    
    // Primero obtener los cursos activos
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_active', true)
      .limit(1);

    if (coursesError) {
      console.error('❌ Error consultando cursos:', coursesError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Error consultando cursos',
          details: coursesError.message
        })
      };
    }

    if (!courses || courses.length === 0) {
      console.log('⚠️ No se encontraron cursos activos');
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'No hay cursos activos disponibles'
        })
      };
    }

    const courseId = courses[0].id;
    console.log('📚 Curso encontrado:', courses[0].title, 'ID:', courseId);

    // Ahora obtener los módulos del curso
    const { data: modules, error: modulesError } = await supabase
      .from('course_modules')
      .select('id, title, module_number')
      .eq('course_id', courseId)
      .eq('module_number', 1)
      .limit(1);

    if (modulesError) {
      console.error('❌ Error consultando módulos:', modulesError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Error consultando módulos',
          details: modulesError.message
        })
      };
    }

    if (!modules || modules.length === 0) {
      console.log('⚠️ No se encontró el módulo 1');
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Módulo 1 no encontrado'
        })
      };
    }

    const moduleId = modules[0].id;
    console.log('📖 Módulo 1 encontrado:', modules[0].title, 'ID:', moduleId);

    // Finalmente obtener los videos del módulo
    const { data: videos, error } = await supabase
      .from('module_videos')
      .select(`
        id,
        video_title,
        duration_seconds,
        youtube_video_id,
        description,
        video_order,
        transcript_text,
        thumbnail_url,
        descripcion_actividad,
        prompts_actividad,
        resumen
      `)
      .eq('module_id', moduleId)
      .order('video_order', { ascending: true });

    console.log('📊 Resultado de consulta:', {
      error: error ? 'ERROR' : 'OK',
      videosLength: videos ? videos.length : 0,
      firstVideo: videos && videos[0] ? videos[0].session_title || videos[0].video_title : 'N/A'
    });

    if (error) {
      console.error('❌ Error consultando base de datos:', error);
      console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Error consultando base de datos',
          details: error.message,
          code: error.code,
          hint: error.hint
        })
      };
    }

    console.log(`✅ ${videos ? videos.length : 0} videos encontrados`);
    
    // Log detallado de los primeros videos encontrados
    if (videos && videos.length > 0) {
      console.log('🎬 Primeros 3 videos:');
      videos.slice(0, 3).forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.video_title} (${video.youtube_video_id})`);
      });
    }

    // Obtener actividad_detalle para todos los videos
    console.log('📋 Consultando actividad_detalle para los videos...');
    let actividadDetalleData = null;
    
    if (videos && videos.length > 0) {
      const videoIds = videos.map(video => video.id);
      
      const { data: actividadDetalle, error: actividadError } = await supabase
        .from('actividad_detalle')
        .select('id, actividad_id, seccion, orden, tipo, contenido')
        .in('actividad_id', videoIds)
        .order('actividad_id')
        .order('seccion')
        .order('orden');

      if (actividadError) {
        console.warn('⚠️ Error consultando actividad_detalle (continuando con legacy):', actividadError.message);
      } else {
        actividadDetalleData = actividadDetalle || [];
        console.log(`📊 ${actividadDetalleData.length} registros de actividad_detalle encontrados`);
      }
    }

    // Agregar progreso del usuario y actividad_detalle
    const videosWithProgress = videos?.map(video => {
      // Encontrar actividad_detalle para este video
      const videoActividades = actividadDetalleData ? 
        actividadDetalleData.filter(detalle => detalle.actividad_id === video.id) : [];

      return {
        ...video,
        user_progress: {
          current_time_seconds: 0,
          completion_percentage: 0,
          is_completed: false
        },
        actividad_detalle: videoActividades
      };
    }) || [];

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        videos: videosWithProgress,
        count: videosWithProgress.length,
        module: 1,
        debug: {
          timestamp: new Date().toISOString(),
          supabaseConfigured: true
        }
      })
    };

  } catch (error) {
    console.error('❌ Error obteniendo videos del módulo 1:', error);
    console.error('🔍 Stack trace:', error.stack);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Error obteniendo videos del módulo 1',
        message: error.message,
        stack: error.stack
      })
    };
  }
}

// Manejar solicitud de información del módulo 1
async function handleModule1Info(event) {
  try {
    console.log('📋 Buscando información del módulo 1...');

    // Primero obtener los cursos activos
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_active', true)
      .limit(1);

    if (coursesError) {
      console.error('❌ Error consultando cursos:', coursesError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Error consultando cursos',
          details: coursesError.message
        })
      };
    }

    if (!courses || courses.length === 0) {
      console.log('⚠️ No se encontraron cursos activos');
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'No hay cursos activos disponibles'
        })
      };
    }

    const courseId = courses[0].id;
    console.log('📚 Curso encontrado para módulo info:', courses[0].title);

    // Consulta para obtener información del módulo 1
    const { data: modules, error } = await supabase
      .from('course_modules')
      .select('id, title, module_number, description, duration_minutes')
      .eq('course_id', courseId)
      .eq('module_number', 1)
      .limit(1);

    if (error) {
      console.error('❌ Error consultando módulos:', error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: 'Error consultando módulos',
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
        module_title: modules[0].title,
        module_number: modules[0].module_number,
        description: modules[0].description,
        duration_minutes: modules[0].duration_minutes,
        course_id: courseId,
        course_title: courses[0].title
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