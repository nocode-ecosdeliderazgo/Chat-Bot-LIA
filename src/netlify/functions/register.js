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

    // NUEVO FLUJO: type_rol se mantiene NULL para usuarios nuevos
    // Solo se llenará cuando el usuario complete el perfil-cuestionario
    let query, params;
    
    // Construir query dinámicamente según columnas disponibles
    const selectCols = ['id', 'username', 'email', 'display_name'];
    const insertCols = ['username', 'email', 'password_hash', 'display_name'];
    const insertValues = ['$1', '$2', '$3', '$4'];
    
    if (hasCargoRol) {
      insertCols.push('cargo_rol');
      insertValues.push("'usuario'"); // Solo cargo_rol tiene valor por defecto
      selectCols.push('cargo_rol');
    }
    
    if (hasTypeRol) {
      insertCols.push('type_rol');
      insertValues.push('NULL'); // type_rol debe estar NULL para usuarios nuevos
      selectCols.push('type_rol');
    }
    
    query = `INSERT INTO users (${insertCols.join(', ')}) 
             VALUES (${insertValues.join(', ')}) 
             RETURNING ${selectCols.join(', ')}`;
    params = [username, email, hash, full_name];
    
    try {
      const result = await pool.query(query, params);
      const userData = { 
        ...result.rows[0], 
        isNewUser: true,
        // Asegurar que type_rol esté explícitamente como null para usuarios nuevos
        type_rol: null
      };
      return json(201, { user: userData }, event);
    } catch (insertError) {
      console.log('Error en insert principal, intentando fallback:', insertError.message);
      
      // Fallback: insertar solo campos básicos
      query = `INSERT INTO users (username, email, password_hash, display_name) 
               VALUES ($1, $2, $3, $4) 
               RETURNING id, username, email, display_name`;
      params = [username, email, hash, full_name];
    }

    try {
      const result = await pool.query(query, params);
      // Asignar valores por defecto para fallback
      const userData = { 
        ...result.rows[0], 
        cargo_rol: result.rows[0].cargo_rol || 'usuario',
        type_rol: null, // CRUCIAL: type_rol debe ser null para usuarios nuevos
        isNewUser: true 
      };
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


