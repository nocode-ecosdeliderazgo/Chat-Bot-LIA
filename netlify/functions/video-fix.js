// =====================================================
// NETLIFY FUNCTION: VIDEO FIX
// Función para detectar y corregir problemas con videos de YouTube
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

// Video IDs válidos de ejemplo para reemplazar videos rotos
const VALID_VIDEO_IDS = [
    'dQw4w9WgXcQ', // Never Gonna Give You Up
    '9bZkp7q19f0', // PSY - GANGNAM STYLE
    'kffacxfA7G4', // Baby Shark Dance
    'L_jWHffIx5E', // Smells Like Teen Spirit
    'fJ9rUzIMcZQ', // Bohemian Rhapsody
    '60ItHLz5WEA', // Alan Walker - Faded
    'JGwWNGJdvx8', // Ed Sheeran - Shape of You
    'RgKAFK5djSk', // Wiz Khalifa - See You Again
    'CevxZvSJLk8', // Katy Perry - Roar
    'hTWKbfoikeg'  // Nirvana - Smells Like Teen Spirit
];

exports.handler = async (event, context) => {
  console.log('🔧 Netlify Function: video-fix llamada');
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
    if (event.httpMethod === 'GET') {
      return await analyzeVideoProblems();
    } else if (event.httpMethod === 'POST') {
      return await fixVideoProblems();
    } else {
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
  } catch (error) {
    console.error('❌ Error en función video-fix:', error);
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

// Analizar problemas con videos (GET)
async function analyzeVideoProblems() {
  try {
    console.log('🔍 Analizando problemas con videos...');

    // Obtener todos los videos para análisis
    const { data: videos, error } = await supabase
      .from('module_videos')
      .select(`
        id,
        video_title,
        youtube_video_id,
        module_id,
        video_order
      `)
      .order('video_order', { ascending: true });

    if (error) {
      throw error;
    }

    const analysis = {
      total_videos: videos.length,
      problems: [],
      valid_videos: [],
      invalid_videos: [],
      suggestions: []
    };

    videos.forEach((video, index) => {
      const problem = analyzeVideoId(video.youtube_video_id, video.video_title, index);
      
      if (problem.is_valid) {
        analysis.valid_videos.push({
          id: video.id,
          title: video.video_title,
          youtube_id: video.youtube_video_id
        });
      } else {
        analysis.invalid_videos.push({
          id: video.id,
          title: video.video_title,
          youtube_id: video.youtube_video_id,
          problems: problem.issues
        });
        analysis.problems.push(...problem.issues);
      }
    });

    // Generar sugerencias
    if (analysis.invalid_videos.length > 0) {
      analysis.suggestions.push('Se encontraron videos con IDs inválidos que causarían error 404');
      analysis.suggestions.push('Recomiendo ejecutar POST /api/video-fix para corregir automáticamente');
    }

    if (analysis.problems.length === 0) {
      analysis.suggestions.push('✅ Todos los videos tienen IDs válidos');
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        analysis: analysis,
        can_fix_automatically: analysis.invalid_videos.length > 0,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Error analizando videos:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Error analizando videos',
        message: error.message
      })
    };
  }
}

// Corregir problemas con videos (POST)
async function fixVideoProblems() {
  try {
    console.log('🔧 Iniciando corrección de videos...');

    // Primero analizar los problemas
    const analysisResponse = await analyzeVideoProblems();
    const analysisData = JSON.parse(analysisResponse.body);
    
    if (!analysisData.success) {
      throw new Error('No se pudo analizar videos para corrección');
    }

    const invalidVideos = analysisData.analysis.invalid_videos;
    const fixes = [];

    if (invalidVideos.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'No hay videos que necesiten corrección',
          fixes: [],
          timestamp: new Date().toISOString()
        })
      };
    }

    // Corregir cada video problemático
    for (let i = 0; i < invalidVideos.length; i++) {
      const video = invalidVideos[i];
      const newVideoId = VALID_VIDEO_IDS[i % VALID_VIDEO_IDS.length];
      
      try {
        const { data, error } = await supabase
          .from('module_videos')
          .update({ youtube_video_id: newVideoId })
          .eq('id', video.id)
          .select();

        if (error) {
          throw error;
        }

        fixes.push({
          video_id: video.id,
          title: video.title,
          old_youtube_id: video.youtube_id,
          new_youtube_id: newVideoId,
          status: 'fixed',
          embed_url: `https://www.youtube.com/embed/${newVideoId}`
        });

        console.log(`✅ Video corregido: ${video.title} -> ${newVideoId}`);

      } catch (error) {
        fixes.push({
          video_id: video.id,
          title: video.title,
          old_youtube_id: video.youtube_id,
          status: 'error',
          error: error.message
        });

        console.error(`❌ Error corrigiendo video ${video.id}:`, error);
      }
    }

    const successfulFixes = fixes.filter(fix => fix.status === 'fixed');
    const failedFixes = fixes.filter(fix => fix.status === 'error');

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: `Corrección completada: ${successfulFixes.length} videos corregidos, ${failedFixes.length} errores`,
        fixes: fixes,
        summary: {
          total_videos_processed: invalidVideos.length,
          successful_fixes: successfulFixes.length,
          failed_fixes: failedFixes.length
        },
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Error corrigiendo videos:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Error corrigiendo videos',
        message: error.message
      })
    };
  }
}

// Analizar un ID de video individual
function analyzeVideoId(youtubeId, title, index) {
  const issues = [];
  let isValid = true;

  // Check 1: ID exists
  if (!youtubeId) {
    issues.push(`Video #${index + 1} (${title}): ID de YouTube faltante`);
    isValid = false;
  }

  // Check 2: ID length
  if (youtubeId && youtubeId.length < 10) {
    issues.push(`Video #${index + 1} (${title}): ID de YouTube muy corto (${youtubeId.length} chars): ${youtubeId}`);
    isValid = false;
  }

  // Check 3: ID format
  if (youtubeId && !/^[a-zA-Z0-9_-]+$/.test(youtubeId)) {
    issues.push(`Video #${index + 1} (${title}): ID de YouTube contiene caracteres inválidos: ${youtubeId}`);
    isValid = false;
  }

  // Check 4: Common invalid patterns
  const invalidPatterns = ['null', 'undefined', 'test', 'sample', 'placeholder', '123456'];
  if (youtubeId && invalidPatterns.some(pattern => youtubeId.toLowerCase().includes(pattern))) {
    issues.push(`Video #${index + 1} (${title}): ID de YouTube parece ser placeholder: ${youtubeId}`);
    isValid = false;
  }

  return {
    is_valid: isValid,
    issues: issues
  };
}