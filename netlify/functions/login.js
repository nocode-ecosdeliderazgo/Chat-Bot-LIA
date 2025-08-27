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
    const { username, password, googleId } = JSON.parse(event.body || '{}');
    
    // Validación: para login tradicional necesitamos username y password
    // Para login con Google necesitamos googleId
    if (!googleId && (!username || !password)) {
      return json(400, { error: 'Email/username y password son requeridos' }, event);
    }

    // Detectar columnas opcionales de roles y Google
    let hasCargoRol = false;
    let hasTypeRol = false;
    let hasGoogleId = false;
    let hasAuthProvider = false;
    try {
      const cols = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('cargo_rol','type_rol','google_id','auth_provider')"
      );
      const names = (cols.rows || []).map(r => String(r.column_name || '').toLowerCase());
      hasCargoRol = names.includes('cargo_rol');
      hasTypeRol = names.includes('type_rol');
      hasGoogleId = names.includes('google_id');
      hasAuthProvider = names.includes('auth_provider');
    } catch (_) {}

    const selectCols = [
      'id',
      'username',
      'email',
      'display_name',
      'password_hash',
      'created_at',
      'last_login_at',
      ...(hasCargoRol ? ['cargo_rol'] : []),
      ...(hasTypeRol ? ['type_rol'] : []),
      ...(hasGoogleId ? ['google_id'] : []),
      ...(hasAuthProvider ? ['auth_provider'] : [])
    ].join(', ');

    let user;
    
    if (googleId) {
      // Login con Google ID
      if (!hasGoogleId) {
        return json(400, { error: 'Login con Google no soportado en esta base de datos' }, event);
      }
      
      const { rows } = await pool.query(
        `SELECT ${selectCols}
         FROM users
         WHERE google_id = $1
         LIMIT 1`,
        [googleId]
      );
      user = rows[0];
      
      if (!user) {
        return json(401, { error: 'Usuario de Google no encontrado' }, event);
      }
    } else {
      // Login tradicional con email/username y password
      const { rows } = await pool.query(
        `SELECT ${selectCols}
         FROM users
         WHERE lower(username) = lower($1) OR lower(email) = lower($1)
         LIMIT 1`,
        [username]
      );
      user = rows[0];
      
      if (!user) return json(401, { error: 'Credenciales inválidas' }, event);

      const ok = await bcrypt.compare(password, user.password_hash || '');
      if (!ok) return json(401, { error: 'Credenciales inválidas' }, event);
    }

    // Detectar si es un usuario nuevo (primer login)
    const isNewUser = !user.last_login_at;
    
    // Actualizar last_login_at
    try {
      await pool.query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      console.log('Error actualizando last_login_at:', updateError.message);
    }

    const responseUser = { 
      id: user.id, 
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      isNewUser: isNewUser,
      authProvider: user.auth_provider || 'email'
    };
    if (hasCargoRol) responseUser.cargo_rol = user.cargo_rol || 'usuario';
    if (hasTypeRol) responseUser.type_rol = user.type_rol || null;
    if (hasGoogleId) responseUser.google_id = user.google_id;
    if (hasAuthProvider) responseUser.auth_provider = user.auth_provider;

    return json(200, { ok: true, user: responseUser }, event);
  } catch (e) {
    console.error('login error', e);
    return json(500, { error: 'Error interno' }, event);
  }
};


