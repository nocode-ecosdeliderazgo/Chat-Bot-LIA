// netlify/functions/register.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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

    const { full_name, username, email, password } = JSON.parse(event.body || '{}');
    
    // Validaciones obligatorias
    if (!full_name || !username || !email || !password) {
      return json(400, { error: 'Nombre completo, usuario, email y contraseña son requeridos' }, event);
    }

    // Validación de contraseña (mínimo 8 caracteres)
    if (String(password).length < 8) {
      return json(400, { error: 'La contraseña debe tener al menos 8 caracteres' }, event);
    }

    // Validación de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return json(400, { error: 'El email debe tener un formato válido' }, event);
    }

    // Verificar existencia de columna password_hash en users
    let hasPassword = false;
    try {
      const col = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash' LIMIT 1"
      );
      hasPassword = col.rows.length > 0;
    } catch (_) {}

    let query, params;
    if (hasPassword) {
      const hash = await bcrypt.hash(String(password), 10);
      query = `INSERT INTO users (username, email, password_hash, first_name, last_name, display_name) 
               VALUES ($1,$2,$3, NULL, NULL, $4) 
               RETURNING id, username, email, display_name`;
      params = [username, email, hash, full_name];
    } else {
      query = `INSERT INTO users (username, email, first_name, last_name, display_name) 
               VALUES ($1,$2, NULL, NULL, $3) 
               RETURNING id, username, email, display_name`;
      params = [username, email, full_name];
    }

    try {
      const result = await pool.query(query, params);
      return json(201, { user: result.rows[0] }, event);
    } catch (error) {
      const msg = String(error && error.message || '').toLowerCase();
      if (msg.includes('duplicate') || msg.includes('unique constraint')) {
        return json(409, { error: 'El usuario ya existe' }, event);
      }
      console.error('register insert error', error);
      return json(500, { error: 'Error registrando usuario' }, event);
    }
  } catch (e) {
    console.error('register error', e);
    return json(500, { error: 'Error interno' }, event);
  }
};


