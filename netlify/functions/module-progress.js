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

// Función para actualizar progreso del módulo
async function updateModuleProgress(userId, courseIdentifier, moduleNumber, updates) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`📝 Actualizando módulo ${moduleNumber} para usuario ${userId}`);
    console.log('Updates:', updates);

    // 1. Obtener course_progress_id
    let { rows: courseRows } = await client.query(
      'SELECT id FROM course_progress WHERE user_id = $1 AND course_identifier = $2',
      [userId, courseIdentifier]
    );

    if (courseRows.length === 0) {
      // Si no existe el curso, inicializarlo
      console.log('⚠️ Curso no existe, inicializando...');
      const { rows } = await client.query(
        'SELECT initialize_course_progress($1, $2) as course_progress_id',
        [userId, courseIdentifier]
      );
      
      const courseProgressId = rows[0].course_progress_id;
      courseRows = [{ id: courseProgressId }];
    }

    const courseProgressId = courseRows[0].id;

    // 2. Construir la query de update dinámicamente
    const updateFields = [];
    const updateValues = [];
    let paramCount = 3; // user_id, course_progress_id, module_number ya ocupan 1,2,3

    if (updates.status) {
      updateFields.push(`status = $${++paramCount}`);
      updateValues.push(updates.status);
    }

    if (updates.progress_percentage !== undefined) {
      updateFields.push(`progress_percentage = $${++paramCount}`);
      updateValues.push(updates.progress_percentage);
    }

    if (updates.video_progress_percentage !== undefined) {
      updateFields.push(`video_progress_percentage = $${++paramCount}`);
      updateValues.push(updates.video_progress_percentage);
    }

    if (updates.video_completed !== undefined) {
      updateFields.push(`video_completed = $${++paramCount}`);
      updateValues.push(updates.video_completed);
    }

    if (updates.last_video_position !== undefined) {
      updateFields.push(`last_video_position = $${++paramCount}`);
      updateValues.push(updates.last_video_position);
    }

    if (updates.time_spent_minutes !== undefined) {
      updateFields.push(`time_spent_minutes = $${++paramCount}`);
      updateValues.push(updates.time_spent_minutes);
    }

    // Siempre actualizar timestamps
    updateFields.push(`last_accessed_at = now()`);
    updateFields.push(`updated_at = now()`);

    // Si está marcando como completado, establecer completed_at
    if (updates.status === 'completed') {
      updateFields.push(`completed_at = COALESCE(completed_at, now())`);
    }

    // Si está iniciando el módulo, establecer started_at si no existe
    if (updates.status === 'in_progress') {
      updateFields.push(`started_at = COALESCE(started_at, now())`);
    }

    // 3. Ejecutar el update
    const updateQuery = `
      UPDATE module_progress 
      SET ${updateFields.join(', ')}
      WHERE user_id = $1 AND course_progress_id = $2 AND module_number = $3
      RETURNING *
    `;

    const { rows: moduleRows } = await client.query(
      updateQuery,
      [userId, courseProgressId, moduleNumber, ...updateValues]
    );

    if (moduleRows.length === 0) {
      throw new Error(`Módulo ${moduleNumber} no encontrado para el usuario`);
    }

    const updatedModule = moduleRows[0];
    console.log('✅ Módulo actualizado:', updatedModule);

    // 4. Si completó el módulo, desbloquear el siguiente
    if (updates.status === 'completed' && moduleNumber < 5) {
      const nextModule = moduleNumber + 1;
      console.log(`🔓 Desbloqueando módulo ${nextModule}...`);
      
      await client.query(`
        UPDATE module_progress 
        SET status = 'not_started'
        WHERE user_id = $1 AND course_progress_id = $2 AND module_number = $3 AND status = 'locked'
      `, [userId, courseProgressId, nextModule]);
      
      console.log(`✅ Módulo ${nextModule} desbloqueado`);
    }

    // 5. Obtener el progreso actualizado del curso completo
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
      module: updatedModule,
      course_progress: formattedProgress,
      module_unlocked: updates.status === 'completed' && moduleNumber < 5 ? moduleNumber + 1 : null
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
        ...updates 
      } = body;

      if (!module_number) {
        return json(400, { 
          success: false, 
          error: 'module_number es requerido' 
        });
      }

      console.log(`🔄 Actualizando progreso del módulo ${module_number} para usuario ${userId}`);
      
      const result = await updateModuleProgress(userId, course_identifier, module_number, updates);
      
      console.log('✅ Progreso del módulo actualizado exitosamente');
      
      return json(200, result);
    }

    return json(405, { success: false, error: 'Método no permitido' });

  } catch (error) {
    console.error('❌ Error en module-progress API:', error);
    return json(500, { 
      success: false, 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};