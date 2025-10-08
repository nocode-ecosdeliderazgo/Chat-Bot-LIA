// =====================================================
// NETLIFY FUNCTION: VIDEO DEBUG
// Función específica para diagnosticar problemas con videos de YouTube
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
  console.log('🔧 Netlify Function: video-debug llamada');
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

  try {
    return await debugVideoData();
  } catch (error) {
    console.error('❌ Error en función video-debug:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
        stack: error.stack
      })
    };
  }
};

async function debugVideoData() {
  try {
    console.log('🔍 Iniciando debug de datos de video...');
    console.log('🔍 Supabase URL:', supabaseUrl ? 'CONFIGURADA' : 'NO CONFIGURADA');
    console.log('🔍 Service Key:', supabaseServiceKey ? `CONFIGURADA (${supabaseServiceKey.length} chars)` : 'NO CONFIGURADA');

    const debug = {
      timestamp: new Date().toISOString(),
      environment: {
        supabase_url: !!supabaseUrl,
        supabase_key: !!supabaseServiceKey,
        nodejs_version: process.version,
        netlify_function: true
      },
      database_tests: {}
    };

    // Test 1: Verificar conexión a Supabase
    console.log('🔄 Test 1: Verificar conexión a Supabase...');
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from('courses')
        .select('id')
        .limit(1);
      
      debug.database_tests.connection = {
        success: !connectionError,
        error: connectionError?.message || null
      };
      console.log('✅ Test 1 completado:', debug.database_tests.connection);
    } catch (error) {
      debug.database_tests.connection = {
        success: false,
        error: error.message
      };
    }

    // Test 2: Verificar estructura de tablas
    console.log('🔄 Test 2: Verificar estructura de tablas...');
    try {
      const { data: tableStructure, error: tableError } = await supabase
        .rpc('get_table_columns', { table_name: 'module_videos' })
        .catch(async () => {
          // Fallback query si la función RPC no existe
          return await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'module_videos')
            .eq('table_schema', 'public');
        });

      debug.database_tests.table_structure = {
        success: !tableError,
        columns: tableStructure || [],
        error: tableError?.message || null
      };
      console.log('✅ Test 2 completado:', debug.database_tests.table_structure.success);
    } catch (error) {
      debug.database_tests.table_structure = {
        success: false,
        error: error.message
      };
    }

    // Test 3: Obtener datos de video reales
    console.log('🔄 Test 3: Obtener datos de video reales...');
    try {
      // Primero obtener cursos
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('is_active', true)
        .limit(1);

      if (coursesError) throw coursesError;

      debug.database_tests.course_data = {
        success: true,
        courses_found: courses?.length || 0,
        first_course: courses?.[0] || null
      };

      if (courses && courses.length > 0) {
        const courseId = courses[0].id;

        // Obtener módulos
        const { data: modules, error: modulesError } = await supabase
          .from('course_modules')
          .select('id, title, module_number')
          .eq('course_id', courseId)
          .eq('module_number', 1)
          .limit(1);

        if (modulesError) throw modulesError;

        debug.database_tests.module_data = {
          success: true,
          modules_found: modules?.length || 0,
          first_module: modules?.[0] || null
        };

        if (modules && modules.length > 0) {
          const moduleId = modules[0].id;

          // Obtener videos
          const { data: videos, error: videosError } = await supabase
            .from('module_videos')
            .select(`
              id,
              video_title,
              youtube_video_id,
              duration_seconds,
              video_order,
              description,
              thumbnail_url
            `)
            .eq('module_id', moduleId)
            .order('video_order', { ascending: true })
            .limit(5);

          if (videosError) throw videosError;

          debug.database_tests.video_data = {
            success: true,
            videos_found: videos?.length || 0,
            videos: videos?.map(video => ({
              id: video.id,
              title: video.video_title,
              youtube_id: video.youtube_video_id,
              youtube_url: `https://www.youtube.com/embed/${video.youtube_video_id}`,
              youtube_id_length: video.youtube_video_id?.length || 0,
              youtube_id_valid: video.youtube_video_id && video.youtube_video_id.length >= 10,
              duration: video.duration_seconds,
              order: video.video_order
            })) || []
          };

          console.log('✅ Test 3 completado - Videos encontrados:', videos?.length || 0);
        }
      }
    } catch (error) {
      debug.database_tests.video_data = {
        success: false,
        error: error.message
      };
    }

    // Test 4: Validar URLs de YouTube
    console.log('🔄 Test 4: Validar URLs de YouTube...');
    if (debug.database_tests.video_data?.videos) {
      debug.youtube_validation = {
        total_videos: debug.database_tests.video_data.videos.length,
        valid_ids: 0,
        invalid_ids: 0,
        examples: []
      };

      debug.database_tests.video_data.videos.forEach(video => {
        if (video.youtube_id_valid) {
          debug.youtube_validation.valid_ids++;
        } else {
          debug.youtube_validation.invalid_ids++;
        }

        if (debug.youtube_validation.examples.length < 3) {
          debug.youtube_validation.examples.push({
            title: video.title,
            youtube_id: video.youtube_id,
            is_valid: video.youtube_id_valid,
            embed_url: video.youtube_url
          });
        }
      });
    }

    // Test 5: Simular la respuesta que devolvería courses.js
    console.log('🔄 Test 5: Simular respuesta courses.js...');
    if (debug.database_tests.video_data?.success) {
      debug.simulated_api_response = {
        success: true,
        videos: debug.database_tests.video_data.videos.map(video => ({
          id: video.id,
          video_title: video.title,
          youtube_video_id: video.youtube_id,
          duration_seconds: video.duration,
          video_order: video.order,
          user_progress: {
            current_time_seconds: 0,
            completion_percentage: 0,
            is_completed: false
          }
        })),
        count: debug.database_tests.video_data.videos.length
      };
    }

    console.log('✅ Debug completo - Devolviendo resultados...');

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Debug de video completado',
        debug: debug,
        recommendations: generateRecommendations(debug),
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Error en debugVideoData:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Error en debug de video',
        message: error.message,
        stack: error.stack
      })
    };
  }
}

function generateRecommendations(debug) {
  const recommendations = [];

  // Check connection
  if (!debug.database_tests?.connection?.success) {
    recommendations.push('❌ CRÍTICO: No se puede conectar a Supabase. Verificar variables de entorno.');
  }

  // Check table structure
  if (!debug.database_tests?.table_structure?.success) {
    recommendations.push('❌ ERROR: No se puede verificar estructura de tabla module_videos.');
  }

  // Check video data
  if (!debug.database_tests?.video_data?.success) {
    recommendations.push('❌ ERROR: No se pueden obtener datos de video de la base de datos.');
  } else if (debug.database_tests.video_data.videos_found === 0) {
    recommendations.push('⚠️ ADVERTENCIA: No se encontraron videos en la base de datos.');
  }

  // Check YouTube IDs
  if (debug.youtube_validation?.invalid_ids > 0) {
    recommendations.push(`⚠️ ADVERTENCIA: ${debug.youtube_validation.invalid_ids} videos tienen IDs de YouTube inválidos.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ TODO OK: Configuración de video parece estar correcta.');
  }

  return recommendations;
}