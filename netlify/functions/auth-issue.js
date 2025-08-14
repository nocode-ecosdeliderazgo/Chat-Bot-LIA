// netlify/functions/auth-issue.js
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { createCorsResponse } = require('./_cors-utils');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const json = (status, data, event = null) => createCorsResponse(status, data, event);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  try {
    const apiKey = event.headers['x-api-key'] || event.headers['X-API-Key'];
    if (!apiKey || String(apiKey).length < 12) return json(401, { error: 'X-API-Key inválida' }, event);

    const { username } = JSON.parse(event.body || '{}');
    if (!username) return json(400, { error: 'username requerido' }, event);

    const { rows } = await pool.query(
      `SELECT id, username FROM users WHERE lower(username) = lower($1) LIMIT 1`,
      [username]
    );
    const user = rows[0];
    if (!user) return json(400, { error: 'Usuario no encontrado' }, event);

    const secret = process.env.JWT_SECRET;
    if (!secret) return json(500, { error: 'JWT_SECRET no configurado' }, event);

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      secret,
      { expiresIn: '7d' }
    );

    return json(200, { userId: user.id, token }, event);
  } catch (e) {
    console.error('auth-issue error', e);
    return json(500, { error: 'Error interno' }, event);
  }
};


