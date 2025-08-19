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

    const { full_name, username, email, password, type_rol } = JSON.parse(event.body || '{}');
    
    // Validaciones obligatorias
    if (!full_name || !username || !email || !password) {
      return json(400, { 
        error: 'Nombre completo, usuario, email y contraseña son requeridos' 
      }, event);
    }

    // Validación de contraseña (mínimo 8 caracteres)
    if (String(password).length < 8) {
      return json(400, { 
        error: 'La contraseña debe tener al menos 8 caracteres' 
      }, event);
    }

    // Validación de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return json(400, { 
        error: 'El email debe tener un formato válido' 
      }, event);
    }

    // type_rol ahora es opcional - se configura en el perfil después del registro
    // Si no se proporciona, asignamos un valor por defecto
    const userTypeRol = type_rol && String(type_rol).trim().length > 0 ? type_rol : 'estudiante';

    // Verificar si existen las columnas necesarias
    let hasPassword = false;
    let hasCargoRol = false;
    let hasTypeRol = false;
    
    try {
      const cols = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('password_hash', 'cargo_rol', 'type_rol')
      `);
      const columnNames = cols.rows.map(row => row.column_name);
      hasPassword = columnNames.includes('password_hash');
      hasCargoRol = columnNames.includes('cargo_rol');
      hasTypeRol = columnNames.includes('type_rol');
    } catch (_) {}

    if (!hasPassword) {
      return json(500, { error: 'La tabla users no tiene columna password_hash' }, event);
    }

    // Hash de la contraseña
    const hash = await bcrypt.hash(String(password), 10);

    // Usar el mismo esquema que server.js con cargo_rol por defecto
    let query, params;
    if (hasPassword) {
      if (hasCargoRol) {
        query = `INSERT INTO users (username, email, password_hash, first_name, last_name, display_name, cargo_rol) 
                 VALUES ($1,$2,$3, NULL, NULL, $4, 'Usuario') 
                 RETURNING id, username, email, display_name, cargo_rol`;
        params = [username, email, hash, full_name];
      } else {
        query = `INSERT INTO users (username, email, password_hash, first_name, last_name, display_name) 
                 VALUES ($1,$2,$3, NULL, NULL, $4) 
                 RETURNING id, username, email, display_name`;
        params = [username, email, hash, full_name];
      }
    } else {
      if (hasCargoRol) {
        query = `INSERT INTO users (username, email, first_name, last_name, display_name, cargo_rol) 
                 VALUES ($1,$2, NULL, NULL, $3, 'Usuario') 
                 RETURNING id, username, email, display_name, cargo_rol`;
        params = [username, email, full_name];
      } else {
        query = `INSERT INTO users (username, email, first_name, last_name, display_name) 
                 VALUES ($1,$2, NULL, NULL, $3) 
                 RETURNING id, username, email, display_name`;
        params = [username, email, full_name];
      }
    }

    try {
      const result = await pool.query(query, params);
      const userData = { ...result.rows[0], isNewUser: true };
      return json(201, { user: userData }, event);
    } catch (error) {
      console.error('register insert error', error);
      
      // Manejar errores específicos
      const errorMsg = String(error.message || '').toLowerCase();
      if (errorMsg.includes('duplicate') || errorMsg.includes('unique')) {
        if (errorMsg.includes('username')) {
          return json(409, { error: 'El nombre de usuario ya está en uso' }, event);
        } else if (errorMsg.includes('email')) {
          return json(409, { error: 'El email ya está registrado' }, event);
        } else {
          return json(409, { error: 'El usuario ya existe' }, event);
        }
      }
      
      return json(500, { error: 'Error registrando usuario' }, event);
    }
  } catch (e) {
    console.error('register error', e);
    return json(500, { error: 'Error interno' }, event);
  }
};


