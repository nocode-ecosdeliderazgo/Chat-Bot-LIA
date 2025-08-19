// netlify/functions/update-profile.js
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
    if (!process.env.DATABASE_URL) return json(500, { error: 'Base de datos no configurada' }, event);

    const { user_id, username, email, type_rol } = JSON.parse(event.body || '{}');
    
    // Validaciones básicas
    if (!type_rol) {
      return json(400, { error: 'type_rol es requerido' }, event);
    }

    if (!user_id && !username && !email) {
      return json(400, { error: 'Se requiere user_id, username o email para identificar al usuario' }, event);
    }

    console.log('Actualizando perfil:', { user_id, username, email, type_rol });

    // Verificar si existe la columna type_rol
    let hasTypeRol = false;
    try {
      const cols = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'type_rol'
      `);
      hasTypeRol = cols.rows.length > 0;
    } catch (_) {}

    if (!hasTypeRol) {
      return json(400, { error: 'La tabla users no tiene columna type_rol' }, event);
    }

    // Construir query de actualización
    let query, params;
    if (user_id) {
      query = 'UPDATE users SET type_rol = $1 WHERE id = $2 RETURNING id, username, email, type_rol, cargo_rol';
      params = [type_rol, user_id];
    } else if (username) {
      query = 'UPDATE users SET type_rol = $1 WHERE username = $2 RETURNING id, username, email, type_rol, cargo_rol';
      params = [type_rol, username];
    } else if (email) {
      query = 'UPDATE users SET type_rol = $1 WHERE email = $2 RETURNING id, username, email, type_rol, cargo_rol';
      params = [type_rol, email];
    }

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return json(404, { error: 'Usuario no encontrado' }, event);
    }

    console.log('Perfil actualizado correctamente:', result.rows[0]);

    return json(200, { 
      ok: true, 
      message: 'Perfil actualizado correctamente',
      user: result.rows[0] 
    }, event);

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    return json(500, { error: 'Error interno del servidor' }, event);
  }
};