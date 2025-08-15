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

    // Construir query dinámicamente según columnas disponibles
    const columns = ['full_name', 'username', 'email', 'password_hash'];
    const values = [full_name, username, email, hash];

    // Siempre asignar cargo_rol como 'Usuario'
    if (hasCargoRol) {
      columns.push('cargo_rol');
      values.push('Usuario');
    }

    // Asignar type_rol si la columna existe
    if (hasTypeRol) {
      columns.push('type_rol');
      values.push(String(userTypeRol).trim().toLowerCase());
    }

    const placeholders = values.map((_, index) => `$${index + 1}`).join(',');
    const returnColumns = hasCargoRol && hasTypeRol ? 
      'id, username, full_name, email, cargo_rol, type_rol' : 
      'id, username, full_name, email';

    const query = `
      INSERT INTO users (${columns.join(', ')}) 
      VALUES (${placeholders}) 
      RETURNING ${returnColumns}
    `;

    try {
      const result = await pool.query(query, values);
      return json(201, { user: result.rows[0] }, event);
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


