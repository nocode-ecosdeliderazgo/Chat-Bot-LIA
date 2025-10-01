// netlify/functions/sync-user.js
// Sincronizar usuario de Supabase Auth a tabla users de PostgreSQL
const { Pool } = require('pg');
const { createCorsResponse } = require('./cors-utils');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const json = (status, data, event = null) => createCorsResponse(status, data, event);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' }, event);

  try {
    if (!process.env.DATABASE_URL) {
      return json(500, { error: 'Base de datos no configurada' }, event);
    }

    const body = JSON.parse(event.body || '{}');
    const { id, username, email, first_name, last_name, display_name, cargo_rol, type_rol, avatar_url } = body;

    if (!id || !username || !email) {
      return json(400, { error: 'Se requiere id, username y email' }, event);
    }

    console.log('🔄 Sincronizando usuario:', { id, username, email });

    // Primero, verificar qué columnas existen en la tabla
    let availableColumns = ['id', 'username', 'email', 'created_at'];
    try {
      const columnsCheck = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'users'
      `);
      availableColumns = columnsCheck.rows.map(row => row.column_name);
      console.log('📊 Columnas disponibles en tabla users:', availableColumns.join(', '));
    } catch (err) {
      console.warn('⚠️ No se pudo verificar columnas, usando básicas:', err.message);
    }

    // Construir query dinámicamente basado en columnas disponibles
    const columnsToInsert = ['id', 'username', 'email'];
    const valuesToInsert = [id, username, email];
    let paramIndex = 4;

    // Agregar columnas opcionales si existen
    const optionalColumns = {
      'first_name': first_name || '',
      'last_name': last_name || '',
      'display_name': display_name || username,
      'cargo_rol': cargo_rol || 'Usuario',
      'company_role': cargo_rol || 'Usuario',
      'type_rol': type_rol || 'usuario',
      'avatar_url': avatar_url,
      'profile_picture_url': avatar_url
    };

    const updateFields = ['username = EXCLUDED.username', 'email = EXCLUDED.email'];

    for (const [col, val] of Object.entries(optionalColumns)) {
      if (availableColumns.includes(col)) {
        columnsToInsert.push(col);
        valuesToInsert.push(val);
        updateFields.push(`${col} = COALESCE(EXCLUDED.${col}, users.${col})`);
      }
    }

    // Agregar created_at y last_login_at si existen
    if (availableColumns.includes('created_at')) {
      columnsToInsert.push('created_at');
    }
    if (availableColumns.includes('last_login_at')) {
      columnsToInsert.push('last_login_at');
      updateFields.push('last_login_at = NOW()');
    }

    const placeholders = valuesToInsert.map((_, i) => `$${i + 1}`);
    if (availableColumns.includes('created_at')) {
      placeholders.push('NOW()');
    }
    if (availableColumns.includes('last_login_at')) {
      placeholders.push('NOW()');
    }

    const query = `
      INSERT INTO users (${columnsToInsert.join(', ')})
      VALUES (${placeholders.join(', ')})
      ON CONFLICT (id) DO UPDATE SET ${updateFields.join(', ')}
      RETURNING id, username, email${availableColumns.includes('first_name') ? ', first_name' : ''}${availableColumns.includes('last_name') ? ', last_name' : ''}${availableColumns.includes('created_at') ? ', created_at' : ''}
    `;

    console.log('📝 Query a ejecutar:', query);
    console.log('📝 Valores:', valuesToInsert);

    const result = await pool.query(query, valuesToInsert);
    const user = result.rows[0];

    console.log('✅ Usuario sincronizado:', user.username);

    return json(200, {
      success: true,
      message: 'Usuario sincronizado correctamente',
      user
    }, event);

  } catch (error) {
    console.error('❌ Error sincronizando usuario:', error);
    return json(500, {
      error: 'Error sincronizando usuario',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    }, event);
  }
};
