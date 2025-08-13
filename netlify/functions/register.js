// netlify/functions/register.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const json = (status, data) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, X-API-Key',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
  },
  body: JSON.stringify(data),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  try {
    if (!process.env.DATABASE_URL) return json(500, { error: 'Base de datos no configurada' });

    const { full_name, username, email, password } = JSON.parse(event.body || '{}');
    if (!full_name || !username || !password) {
      return json(400, { error: 'full_name, username y password son requeridos' });
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
      query = `INSERT INTO users (full_name, username, email, password_hash)
               VALUES ($1,$2,$3,$4)
               RETURNING id, username, full_name, email`;
      params = [full_name, username, email || null, hash];
    } else {
      query = `INSERT INTO users (full_name, username, email)
               VALUES ($1,$2,$3)
               RETURNING id, username, full_name, email`;
      params = [full_name, username, email || null];
    }

    try {
      const result = await pool.query(query, params);
      return json(201, { user: result.rows[0] });
    } catch (error) {
      const msg = String(error && error.message || '').toLowerCase();
      if (msg.includes('duplicate') || msg.includes('unique constraint')) {
        return json(409, { error: 'El usuario ya existe' });
      }
      console.error('register insert error', error);
      return json(500, { error: 'Error registrando usuario' });
    }
  } catch (e) {
    console.error('register error', e);
    return json(500, { error: 'Error interno' });
  }
};


