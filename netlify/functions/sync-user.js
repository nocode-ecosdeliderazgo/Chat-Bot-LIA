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

    // Insertar o actualizar usuario en PostgreSQL
    const query = `
      INSERT INTO users (
        id, username, email, first_name, last_name, display_name,
        cargo_rol, type_rol, avatar_url, created_at, last_login_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, users.first_name),
        last_name = COALESCE(EXCLUDED.last_name, users.last_name),
        display_name = COALESCE(EXCLUDED.display_name, users.display_name),
        cargo_rol = COALESCE(EXCLUDED.cargo_rol, users.cargo_rol),
        type_rol = COALESCE(EXCLUDED.type_rol, users.type_rol),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        last_login_at = NOW()
      RETURNING id, username, email, first_name, last_name, created_at
    `;

    const values = [
      id,
      username,
      email,
      first_name || '',
      last_name || '',
      display_name || username,
      cargo_rol || 'Usuario',
      type_rol || 'usuario',
      avatar_url || null
    ];

    const result = await pool.query(query, values);
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
