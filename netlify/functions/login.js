// netlify/functions/login.js
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
    const { username, password } = JSON.parse(event.body || '{}');
    if (!username || !password) return json(400, { error: 'username y password son requeridos' });

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
      'password_hash',
      ...(hasCargoRol ? ['cargo_rol'] : []),
      ...(hasTypeRol ? ['type_rol'] : [])
    ].join(', ');

    const { rows } = await pool.query(
      `SELECT ${selectCols}
       FROM users
       WHERE lower(username) = lower($1)
       LIMIT 1`,
      [username]
    );

    const user = rows[0];
    if (!user) return json(401, { error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return json(401, { error: 'Credenciales inválidas' });

    const responseUser = { id: user.id, username: user.username };
    if (hasCargoRol) responseUser.cargo_rol = user.cargo_rol || null;
    if (hasTypeRol) responseUser.type_rol = user.type_rol || null;

    return json(200, { ok: true, user: responseUser });
  } catch (e) {
    console.error('login error', e);
    return json(500, { error: 'Error interno' });
  }
};


