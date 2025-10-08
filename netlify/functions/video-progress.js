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
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT',
  },
  body: JSON.stringify(data),
});

// Función para actualizar progreso del video
async function updateVideoProgress(userId, courseIdentifier, moduleNumber, videoUpdates) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`🎥 Actualizando progreso del video módulo ${moduleNumber} para usuario ${userId}`);
    console.log('Video updates:', videoUpdates);

    // 1. Obtener course_progress_id y module_progress_id
    const { rows: courseRows } = await client.query(
      'SELECT id FROM course_progress WHERE user_id = $1 AND course_identifier = $2',
      [userId, courseIdentifier]
    );

    if (courseRows.length === 0) {
      throw new Error('Curso no encontrado. Inicializa el curso primero.');
    }

    const courseProgressId = courseRows[0].id;

    const { rows: moduleRows } = await client.query(
      'SELECT * FROM module_progress WHERE user_id = $1 AND course_progress_id = $2 AND module_number = $3',
      [userId, courseProgressId, moduleNumber]
    );

    if (moduleRows.length === 0) {
      throw new Error(`Módulo ${moduleNumber} no encontrado`);
    }

    const moduleProgressId = moduleRows[0].id;
    let currentModule = moduleRows[0];

    // 2. Actualizar progreso del video en module_progress
    const updateFields = [];
    const updateValues = [];
    let paramCount = 3;

    if (videoUpdates.video_progress_percentage !== undefined) {
      updateFields.push(`video_progress_percentage = $${++paramCount}`);
      updateValues.push(videoUpdates.video_progress_percentage);
    }

    if (videoUpdates.last_video_position !== undefined) {
      updateFields.push(`last_video_position = $${++paramCount}`);
      updateValues.push(videoUpdates.last_video_position);
    }

    if (videoUpdates.video_completed !== undefined) {
      updateFields.push(`video_completed = $${++paramCount}`);
      updateValues.push(videoUpdates.video_completed);
    }

    if (videoUpdates.time_spent_minutes !== undefined) {
      updateFields.push(`time_spent_minutes = time_spent_minutes + $${++paramCount}`);
      updateValues.push(videoUpdates.time_spent_minutes);
    }

    // Siempre actualizar timestamps
    updateFields.push(`last_accessed_at = now()`);
    updateFields.push(`updated_at = now()`);

    // Calcular progreso del módulo basado en el video
    if (videoUpdates.video_progress_percentage !== undefined) {
      // Si el video está al 100%, el módulo también
      if (videoUpdates.video_progress_percentage >= 100) {
        updateFields.push(`progress_percentage = 100`);
        updateFields.push(`status = 'completed'`);
        updateFields.push(`completed_at = COALESCE(completed_at, now())`);
      } else if (videoUpdates.video_progress_percentage > 0) {
        // Progreso del módulo = progreso del video
        updateFields.push(`progress_percentage = $${++paramCount}`);
        updateValues.push(videoUpdates.video_progress_percentage);
        updateFields.push(`status = 'in_progress'`);
        updateFields.push(`started_at = COALESCE(started_at, now())`);
      }
    }

    if (updateFields.length > 2) { // Más que solo los timestamps
      const updateQuery = `
        UPDATE module_progress 
        SET ${updateFields.join(', ')}
        WHERE user_id = $1 AND course_progress_id = $2 AND module_number = $3
        RETURNING *
      `;

      const { rows } = await client.query(
        updateQuery,
        [userId, courseProgressId, moduleNumber, ...updateValues]
      );

      currentModule = rows[0];
      console.log('✅ Módulo actualizado con progreso de video:', currentModule);
    }

    // 3. Procesar secciones del video si se proporcionan
    let videoSections = [];
    if (videoUpdates.sections_completed && Array.isArray(videoUpdates.sections_completed)) {
      for (const section of videoUpdates.sections_completed) {
        const { section_number, completed, start_time_seconds, end_time_seconds, section_name } = section;
        
        if (completed) {
          // Insertar o actualizar sección del video
          await client.query(`
            INSERT INTO video_section_progress (
              module_progress_id, user_id, section_number, section_name, 
              start_time_seconds, end_time_seconds, completed, viewed_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, now())
            ON CONFLICT (user_id, module_progress_id, section_number) 
            DO UPDATE SET 
              completed = $7,
              viewed_at = now(),
              updated_at = now()
          `, [
            moduleProgressId, userId, section_number, section_name || `Sección ${section_number}`,
            start_time_seconds || 0, end_time_seconds || 0, completed
          ]);
        }
      }

      // Obtener todas las secciones actualizadas
      const { rows: sectionRows } = await client.query(
        'SELECT * FROM video_section_progress WHERE module_progress_id = $1 ORDER BY section_number',
        [moduleProgressId]
      );
      
      videoSections = sectionRows;
    }

    // 4. Verificar si el módulo se completó y desbloquear el siguiente
    let moduleUnlocked = null;
    if (currentModule.status === 'completed' && moduleNumber < 5) {
      const nextModule = moduleNumber + 1;
      console.log(`🔓 Desbloqueando módulo ${nextModule}...`);
      
      const { rows: unlockRows } = await client.query(`
        UPDATE module_progress 
        SET status = 'not_started', updated_at = now()
        WHERE user_id = $1 AND course_progress_id = $2 AND module_number = $3 AND status = 'locked'
        RETURNING module_number
      `, [userId, courseProgressId, nextModule]);
      
      if (unlockRows.length > 0) {
        moduleUnlocked = nextModule;
        console.log(`✅ Módulo ${nextModule} desbloqueado`);
      }
    }

    // 5. Obtener progreso completo actualizado
    const { rows: progressRows } = await client.query(`
      SELECT * FROM user_course_progress_view 
      WHERE user_id = $1 AND course_identifier = $2
    `, [userId, courseIdentifier]);

    await client.query('COMMIT');

    // 6. Formatear respuesta
    const courseProgress = progressRows[0];
    const formattedProgress = {
      course_progress_id: courseProgress.course_progress_id,
      user_id: courseProgress.user_id,
      course_identifier: courseProgress.course_identifier,
      overall_progress_percentage: courseProgress.overall_progress_percentage || 0,
      status: courseProgress.course_status,
      started_at: courseProgress.course_started_at,
      last_accessed_at: courseProgress.last_accessed_at,
      completed_at: courseProgress.course_completed_at,
      modules: courseProgress.modules || [],
      current_module: courseProgress.modules?.find(m => m.status === 'in_progress')?.module_number || moduleNumber,
      total_modules: courseProgress.modules?.length || 5,
      completed_modules: courseProgress.modules?.filter(m => m.status === 'completed')?.length || 0
    };

    return {
      success: true,
      module: currentModule,
      course_progress: formattedProgress,
      video_sections: videoSections,
      module_completed: currentModule.status === 'completed',
      module_unlocked: moduleUnlocked
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  try {
    const userId = event.headers['x-user-id'];
    
    if (!userId) {
      return json(400, { 
        success: false, 
        error: 'X-User-Id header es requerido' 
      });
    }

    if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { 
        course_identifier = 'intro-to-ai', 
        module_number,
        ...videoUpdates 
      } = body;

      if (!module_number) {
        return json(400, { 
          success: false, 
          error: 'module_number es requerido' 
        });
      }

      console.log(`🎬 Actualizando progreso del video módulo ${module_number} para usuario ${userId}`);
      
      const result = await updateVideoProgress(userId, course_identifier, module_number, videoUpdates);
      
      console.log('✅ Progreso del video actualizado exitosamente');
      
      return json(200, result);
    }

    return json(405, { success: false, error: 'Método no permitido' });

  } catch (error) {
    console.error('❌ Error en video-progress API:', error);
    return json(500, { 
      success: false, 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};