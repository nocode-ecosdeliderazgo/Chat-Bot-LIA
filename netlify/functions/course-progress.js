const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const json = (status, data) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, X-API-Key, X-User-Id',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
  },
  body: JSON.stringify(data),
});

// Función para inicializar progreso del curso si no existe
async function initializeCourseProgress(userId, courseIdentifier) {
  try {
    console.log(`🚀 Inicializando progreso para usuario ${userId}, curso ${courseIdentifier}`);
    
    // Definir módulos del curso de IA
    const courseModules = [
      {
        number: 1,
        name: '¿Qué es la IA?',
        identifier: 'module-1-intro-ia',
        video_id: 'Yy_eZ65jzmo'
      },
      {
        number: 2,
        name: 'Historia de la IA',
        identifier: 'module-2-history-ia',
        video_id: 'dhsy6epaJGs'
      },
      {
        number: 3,
        name: 'Fundamentos del ML',
        identifier: 'module-3-ml-fundamentals',
        video_id: 'DvyOm9HeT-k'
      },
      {
        number: 4,
        name: 'Redes Neuronales',
        identifier: 'module-4-neural-networks',
        video_id: 'oiKj0Z_Xnjc'
      },
      {
        number: 5,
        name: 'Aplicaciones Prácticas',
        identifier: 'module-5-applications',
        video_id: 'HMoaRIbOaN0'
      }
    ];

    // Usar la función PostgreSQL para inicializar
    const { rows } = await pool.query(
      'SELECT initialize_course_progress($1, $2, $3) as course_progress_id',
      [userId, courseIdentifier, JSON.stringify(courseModules)]
    );

    console.log(`✅ Progreso inicializado con ID: ${rows[0].course_progress_id}`);
    return rows[0].course_progress_id;
    
  } catch (error) {
    console.error('❌ Error inicializando progreso:', error);
    throw error;
  }
}

// Función para obtener progreso completo del curso
async function getCourseProgressData(userId, courseIdentifier) {
  try {
    // Usar la vista para obtener datos completos
    const { rows } = await pool.query(`
      SELECT * FROM user_course_progress_view 
      WHERE user_id = $1 AND course_identifier = $2
    `, [userId, courseIdentifier]);

    if (rows.length === 0) {
      // Si no existe, inicializar y obtener de nuevo
      await initializeCourseProgress(userId, courseIdentifier);
      
      // Intentar de nuevo
      const { rows: newRows } = await pool.query(`
        SELECT * FROM user_course_progress_view 
        WHERE user_id = $1 AND course_identifier = $2
      `, [userId, courseIdentifier]);
      
      return newRows[0] || null;
    }

    return rows[0];
    
  } catch (error) {
    console.error('❌ Error obteniendo progreso:', error);
    throw error;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  try {
    const userId = event.headers['x-user-id'] || event.queryStringParameters?.user_id;
    const courseIdentifier = event.queryStringParameters?.course_identifier || 'intro-to-ai';

    if (!userId) {
      return json(400, { 
        success: false, 
        error: 'user_id es requerido en headers o query parameters' 
      });
    }

    if (event.httpMethod === 'GET') {
      // Obtener progreso del curso
      console.log(`📊 Obteniendo progreso para usuario: ${userId}, curso: ${courseIdentifier}`);
      
      const progress = await getCourseProgressData(userId, courseIdentifier);
      
      if (!progress) {
        return json(404, { 
          success: false, 
          error: 'No se pudo obtener el progreso del curso' 
        });
      }

      // Formatear la respuesta para el frontend
      const formattedProgress = {
        course_progress_id: progress.course_progress_id,
        user_id: progress.user_id,
        course_identifier: progress.course_identifier,
        overall_progress_percentage: progress.overall_progress_percentage || 0,
        status: progress.course_status,
        started_at: progress.course_started_at,
        last_accessed_at: progress.last_accessed_at,
        completed_at: progress.course_completed_at,
        modules: progress.modules || [],
        current_module: progress.modules?.find(m => m.status === 'in_progress')?.module_number || 1,
        total_modules: progress.modules?.length || 5,
        completed_modules: progress.modules?.filter(m => m.status === 'completed')?.length || 0
      };

      console.log('✅ Progreso obtenido exitosamente');
      
      return json(200, { 
        success: true, 
        progress: formattedProgress 
      });
    }

    if (event.httpMethod === 'POST') {
      // Inicializar progreso del curso
      console.log(`🚀 Inicializando progreso para usuario: ${userId}, curso: ${courseIdentifier}`);
      
      const courseProgressId = await initializeCourseProgress(userId, courseIdentifier);
      const progress = await getCourseProgressData(userId, courseIdentifier);
      
      return json(200, { 
        success: true, 
        course_progress_id: courseProgressId,
        progress: progress 
      });
    }

    return json(405, { success: false, error: 'Método no permitido' });

  } catch (error) {
    console.error('❌ Error en course-progress API:', error);
    return json(500, { 
      success: false, 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};