// =====================================================
// UNIFIED PROGRESS SYNC API
// Endpoint centralizado para sincronización de progreso
// Con validación robusta, transacciones y logging detallado
// =====================================================

const { Pool } = require('pg');

// Pool de conexiones PostgreSQL con configuración optimizada
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Máximo 20 conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// =====================================================
// UTILIDADES Y HELPERS
// =====================================================

const json = (status, data) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, X-API-Key, X-User-Id',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,PATCH',
  },
  body: JSON.stringify(data),
});

// Logger detallado
class Logger {
  static log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };

    console.log(JSON.stringify(logEntry));
  }

  static info(message, data) {
    this.log('INFO', message, data);
  }

  static warn(message, data) {
    this.log('WARN', message, data);
  }

  static error(message, data) {
    this.log('ERROR', message, data);
  }

  static debug(message, data) {
    if (process.env.DEBUG === 'true') {
      this.log('DEBUG', message, data);
    }
  }
}

// =====================================================
// VALIDACIÓN DE DATOS
// =====================================================

class ProgressDataValidator {
  static validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      return { valid: false, error: 'userId es requerido y debe ser string' };
    }

    if (userId.length < 3 || userId.length > 255) {
      return { valid: false, error: 'userId debe tener entre 3 y 255 caracteres' };
    }

    return { valid: true };
  }

  static validateCourseId(courseId) {
    if (!courseId || typeof courseId !== 'string') {
      return { valid: false, error: 'courseId es requerido y debe ser string' };
    }

    const validCourseIds = ['intro-to-ai', 'chatgpt-gemini'];
    if (!validCourseIds.includes(courseId)) {
      return { valid: false, error: `courseId debe ser uno de: ${validCourseIds.join(', ')}` };
    }

    return { valid: true };
  }

  static validateModuleData(moduleData) {
    if (!moduleData || typeof moduleData !== 'object') {
      return { valid: false, error: 'moduleData debe ser un objeto' };
    }

    const { module_number, video_progress_percentage } = moduleData;

    if (typeof module_number !== 'number' || module_number < 1 || module_number > 10) {
      return { valid: false, error: 'module_number debe ser un número entre 1 y 10' };
    }

    if (video_progress_percentage !== undefined) {
      if (typeof video_progress_percentage !== 'number' ||
          video_progress_percentage < 0 ||
          video_progress_percentage > 100) {
        return { valid: false, error: 'video_progress_percentage debe ser un número entre 0 y 100' };
      }
    }

    return { valid: true };
  }

  static validateProgressData(progressData) {
    if (!progressData || typeof progressData !== 'object') {
      return { valid: false, error: 'progressData debe ser un objeto' };
    }

    const errors = [];

    // Validar overall_progress_percentage si existe
    if (progressData.overall_progress_percentage !== undefined) {
      const val = progressData.overall_progress_percentage;
      if (typeof val !== 'number' || val < 0 || val > 100) {
        errors.push('overall_progress_percentage debe ser un número entre 0 y 100');
      }
    }

    // Validar modules si existen
    if (progressData.modules !== undefined) {
      if (!Array.isArray(progressData.modules)) {
        errors.push('modules debe ser un array');
      } else {
        progressData.modules.forEach((module, index) => {
          const validation = this.validateModuleData(module);
          if (!validation.valid) {
            errors.push(`Módulo ${index}: ${validation.error}`);
          }
        });
      }
    }

    if (errors.length > 0) {
      return { valid: false, error: errors.join(', ') };
    }

    return { valid: true };
  }
}

// =====================================================
// OPERACIONES DE BASE DE DATOS
// =====================================================

class ProgressDatabaseOps {
  // Obtener o crear progreso del curso
  static async getOrCreateCourseProgress(client, userId, courseId) {
    Logger.debug('getOrCreateCourseProgress', { userId, courseId });

    // Intentar obtener progreso existente
    const { rows } = await client.query(`
      SELECT * FROM course_progress
      WHERE user_id = $1 AND course_identifier = $2
    `, [userId, courseId]);

    if (rows.length > 0) {
      Logger.debug('Progreso existente encontrado', { courseProgressId: rows[0].id });
      return rows[0];
    }

    // Si no existe, crear nuevo progreso
    Logger.info('Creando nuevo progreso de curso', { userId, courseId });

    const { rows: newRows } = await client.query(`
      INSERT INTO course_progress (
        id, user_id, course_identifier,
        overall_progress_percentage, status,
        started_at, created_at, updated_at
      )
      VALUES ($1, $2, $3, 0, 'not_started', NOW(), NOW(), NOW())
      RETURNING *
    `, [require('crypto').randomUUID(), userId, courseId]);

    return newRows[0];
  }

  // Obtener progreso completo con módulos
  static async getFullProgress(client, userId, courseId) {
    Logger.debug('getFullProgress', { userId, courseId });

    const { rows } = await client.query(`
      SELECT
        cp.id as course_progress_id,
        cp.user_id,
        cp.course_identifier,
        cp.overall_progress_percentage,
        cp.status as course_status,
        cp.started_at as course_started_at,
        cp.completed_at as course_completed_at,
        cp.last_accessed_at,
        cp.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', mp.id,
              'module_number', mp.module_number,
              'module_identifier', mp.module_identifier,
              'progress_percentage', mp.progress_percentage,
              'video_progress_percentage', mp.video_progress_percentage,
              'video_completed', mp.video_completed,
              'last_video_position', mp.last_video_position,
              'time_spent_minutes', mp.time_spent_minutes,
              'status', mp.status,
              'started_at', mp.started_at,
              'completed_at', mp.completed_at,
              'last_accessed_at', mp.last_accessed_at
            ) ORDER BY mp.module_number
          ) FILTER (WHERE mp.id IS NOT NULL),
          '[]'::json
        ) as modules
      FROM course_progress cp
      LEFT JOIN module_progress mp ON mp.course_progress_id = cp.id AND mp.user_id = cp.user_id
      WHERE cp.user_id = $1 AND cp.course_identifier = $2
      GROUP BY cp.id
    `, [userId, courseId]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  // Actualizar progreso del módulo
  static async updateModuleProgress(client, courseProgressId, userId, moduleData) {
    Logger.debug('updateModuleProgress', { courseProgressId, moduleData });

    const {
      module_number,
      module_identifier,
      progress_percentage,
      video_progress_percentage,
      video_completed,
      last_video_position,
      time_spent_minutes,
      status
    } = moduleData;

    // Construir update dinámico
    const updates = [];
    const values = [userId, courseProgressId, module_number];
    let paramCount = 3;

    if (progress_percentage !== undefined) {
      updates.push(`progress_percentage = $${++paramCount}`);
      values.push(progress_percentage);
    }

    if (video_progress_percentage !== undefined) {
      updates.push(`video_progress_percentage = $${++paramCount}`);
      values.push(video_progress_percentage);
    }

    if (video_completed !== undefined) {
      updates.push(`video_completed = $${++paramCount}`);
      values.push(video_completed);
    }

    if (last_video_position !== undefined) {
      updates.push(`last_video_position = $${++paramCount}`);
      values.push(last_video_position);
    }

    if (time_spent_minutes !== undefined) {
      updates.push(`time_spent_minutes = $${++paramCount}`);
      values.push(time_spent_minutes);
    }

    if (status !== undefined) {
      updates.push(`status = $${++paramCount}`);
      values.push(status);
    }

    // Siempre actualizar timestamps
    updates.push(`last_accessed_at = NOW()`);
    updates.push(`updated_at = NOW()`);

    // Si está completando, establecer completed_at
    if (status === 'completed' || video_completed === true) {
      updates.push(`completed_at = COALESCE(completed_at, NOW())`);
    }

    // Si está iniciando, establecer started_at
    if (status === 'in_progress') {
      updates.push(`started_at = COALESCE(started_at, NOW())`);
    }

    const query = `
      UPDATE module_progress
      SET ${updates.join(', ')}
      WHERE user_id = $1
        AND course_progress_id = $2
        AND module_number = $3
      RETURNING *
    `;

    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      throw new Error(`Módulo ${module_number} no encontrado`);
    }

    Logger.info('Módulo actualizado', {
      moduleNumber: module_number,
      videoProgress: video_progress_percentage,
      completed: video_completed
    });

    return rows[0];
  }

  // Calcular y actualizar progreso general del curso
  static async updateOverallProgress(client, courseProgressId, userId) {
    Logger.debug('updateOverallProgress', { courseProgressId, userId });

    const { rows } = await client.query(`
      WITH module_stats AS (
        SELECT
          COUNT(*) as total_modules,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_modules,
          AVG(video_progress_percentage) as avg_progress
        FROM module_progress
        WHERE course_progress_id = $1 AND user_id = $2
      )
      UPDATE course_progress cp
      SET
        overall_progress_percentage = COALESCE((SELECT ROUND(avg_progress) FROM module_stats), 0),
        status = CASE
          WHEN (SELECT completed_modules FROM module_stats) = (SELECT total_modules FROM module_stats)
            AND (SELECT total_modules FROM module_stats) > 0
          THEN 'completed'
          WHEN (SELECT avg_progress FROM module_stats) > 0
          THEN 'in_progress'
          ELSE 'not_started'
        END,
        completed_at = CASE
          WHEN (SELECT completed_modules FROM module_stats) = (SELECT total_modules FROM module_stats)
            AND (SELECT total_modules FROM module_stats) > 0
          THEN COALESCE(cp.completed_at, NOW())
          ELSE NULL
        END,
        last_accessed_at = NOW(),
        updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING overall_progress_percentage, status
    `, [courseProgressId, userId]);

    Logger.info('Progreso general actualizado', rows[0]);

    return rows[0];
  }

  // Desbloquear siguiente módulo
  static async unlockNextModule(client, courseProgressId, userId, currentModuleNumber) {
    Logger.debug('unlockNextModule', { currentModuleNumber });

    const nextModuleNumber = currentModuleNumber + 1;

    const { rows } = await client.query(`
      UPDATE module_progress
      SET status = 'not_started', updated_at = NOW()
      WHERE course_progress_id = $1
        AND user_id = $2
        AND module_number = $3
        AND status = 'locked'
      RETURNING module_number
    `, [courseProgressId, userId, nextModuleNumber]);

    if (rows.length > 0) {
      Logger.info('Módulo desbloqueado', { moduleNumber: nextModuleNumber });
      return nextModuleNumber;
    }

    return null;
  }
}

// =====================================================
// HANDLERS PRINCIPALES
// =====================================================

// GET: Obtener progreso completo
async function handleGetProgress(userId, courseId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    Logger.info('GET progress', { userId, courseId });

    // Obtener o crear progreso
    const courseProgress = await ProgressDatabaseOps.getOrCreateCourseProgress(client, userId, courseId);

    // Obtener progreso completo con módulos
    const fullProgress = await ProgressDatabaseOps.getFullProgress(client, userId, courseId);

    await client.query('COMMIT');

    return json(200, {
      success: true,
      progress: fullProgress,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    await client.query('ROLLBACK');
    Logger.error('Error en GET progress', { error: error.message, stack: error.stack });

    return json(500, {
      success: false,
      error: 'Error obteniendo progreso',
      details: process.env.DEBUG === 'true' ? error.message : undefined
    });

  } finally {
    client.release();
  }
}

// POST/PUT: Sincronizar progreso (batch update)
async function handleSyncProgress(userId, courseId, progressData) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    Logger.info('SYNC progress', { userId, courseId, modulesCount: progressData.modules?.length });

    // Validar datos de progreso
    const validation = ProgressDataValidator.validateProgressData(progressData);
    if (!validation.valid) {
      return json(400, {
        success: false,
        error: 'Datos de progreso inválidos',
        details: validation.error
      });
    }

    // Obtener o crear progreso del curso
    const courseProgress = await ProgressDatabaseOps.getOrCreateCourseProgress(client, userId, courseId);

    // Actualizar cada módulo si se proporcionaron
    if (progressData.modules && Array.isArray(progressData.modules)) {
      for (const moduleData of progressData.modules) {
        await ProgressDatabaseOps.updateModuleProgress(
          client,
          courseProgress.id,
          userId,
          moduleData
        );

        // Si el módulo se completó, desbloquear el siguiente
        if (moduleData.status === 'completed' || moduleData.video_completed === true) {
          await ProgressDatabaseOps.unlockNextModule(
            client,
            courseProgress.id,
            userId,
            moduleData.module_number
          );
        }
      }
    }

    // Recalcular progreso general
    await ProgressDatabaseOps.updateOverallProgress(client, courseProgress.id, userId);

    // Obtener progreso actualizado
    const updatedProgress = await ProgressDatabaseOps.getFullProgress(client, userId, courseId);

    await client.query('COMMIT');

    Logger.info('SYNC completed', {
      overallProgress: updatedProgress.overall_progress_percentage,
      status: updatedProgress.course_status
    });

    return json(200, {
      success: true,
      progress: updatedProgress,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    await client.query('ROLLBACK');
    Logger.error('Error en SYNC progress', { error: error.message, stack: error.stack });

    return json(500, {
      success: false,
      error: 'Error sincronizando progreso',
      details: process.env.DEBUG === 'true' ? error.message : undefined
    });

  } finally {
    client.release();
  }
}

// =====================================================
// HANDLER PRINCIPAL
// =====================================================

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }

  const startTime = Date.now();

  try {
    // 1. Extraer userId
    const userId = event.headers['x-user-id'] || event.queryStringParameters?.userId;

    if (!userId) {
      Logger.warn('userId faltante en request');
      return json(400, {
        success: false,
        error: 'X-User-Id header o userId query param es requerido'
      });
    }

    // 2. Validar userId
    const userValidation = ProgressDataValidator.validateUserId(userId);
    if (!userValidation.valid) {
      return json(400, {
        success: false,
        error: userValidation.error
      });
    }

    // 3. Extraer courseId
    const courseId = event.queryStringParameters?.courseId ||
                     event.pathParameters?.courseId ||
                     'intro-to-ai'; // Default

    // 4. Validar courseId
    const courseValidation = ProgressDataValidator.validateCourseId(courseId);
    if (!courseValidation.valid) {
      return json(400, {
        success: false,
        error: courseValidation.error
      });
    }

    // 5. Manejar según método HTTP
    let response;

    if (event.httpMethod === 'GET') {
      response = await handleGetProgress(userId, courseId);
    }
    else if (event.httpMethod === 'POST' || event.httpMethod === 'PUT' || event.httpMethod === 'PATCH') {
      const body = JSON.parse(event.body || '{}');
      response = await handleSyncProgress(userId, courseId, body);
    }
    else {
      return json(405, {
        success: false,
        error: 'Método no permitido'
      });
    }

    // Log de performance
    const duration = Date.now() - startTime;
    Logger.info('Request completed', {
      method: event.httpMethod,
      userId,
      courseId,
      duration: `${duration}ms`
    });

    return response;

  } catch (error) {
    Logger.error('Error no manejado', {
      error: error.message,
      stack: error.stack
    });

    return json(500, {
      success: false,
      error: 'Error interno del servidor',
      details: process.env.DEBUG === 'true' ? error.message : undefined
    });
  }
};
