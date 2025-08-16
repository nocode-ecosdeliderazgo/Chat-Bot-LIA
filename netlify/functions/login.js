// netlify/functions/login.js
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
    const { username, password } = JSON.parse(event.body || '{}');
    if (!username || !password) return json(400, { error: 'Email/username y password son requeridos' }, event);

    // Detectar columnas opcionales de roles
    let hasCargoRol = false;
    let hasTypeRol = false;
    try {
      const cols = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('cargo_rol','type_rol')"
      );
      const names = (cols.rows || []).map(r => String(r.column_name || '').toLowerCase());
      hasCargoRol = names.includes('cargo_rol');
      hasTypeRol = names.includes('type_rol');
    } catch (_) {}

    const selectCols = [
      'id',
      'username',
      'email',
      'display_name',
      'password_hash',
      ...(hasCargoRol ? ['cargo_rol'] : []),
      ...(hasTypeRol ? ['type_rol'] : [])
    ].join(', ');

    // Buscar por email O username
    const { rows } = await pool.query(
      `SELECT ${selectCols}
       FROM users
       WHERE lower(username) = lower($1) OR lower(email) = lower($1)
       LIMIT 1`,
      [username]
    );

    const user = rows[0];
    if (!user) return json(401, { error: 'Credenciales inválidas' }, event);

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return json(401, { error: 'Credenciales inválidas' }, event);

    const responseUser = { 
      id: user.id, 
      username: user.username,
      email: user.email,
      display_name: user.display_name
    };
    if (hasCargoRol) responseUser.cargo_rol = user.cargo_rol || null;
    if (hasTypeRol) responseUser.type_rol = user.type_rol || null;

    return json(200, { ok: true, user: responseUser }, event);
  } catch (e) {
    console.error('login error', e);
    return json(500, { error: 'Error interno' }, event);
  }
};


