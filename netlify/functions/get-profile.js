// netlify/functions/get-profile.js
const { Pool } = require('pg');
const { createCorsResponse } = require('./cors-utils');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const json = (status, data, event = null) => createCorsResponse(status, data, event);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);

  if (event.httpMethod === 'GET') {
    return await handleGetProfile(event);
  } else if (event.httpMethod === 'PUT') {
    return await handleUpdateProfile(event);
  } else {
    return json(405, { error: 'Method Not Allowed' }, event);
  }
};

async function handleGetProfile(event) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL no está configurada');
      return json(500, { error: 'Base de datos no configurada' }, event);
    }

    const { userId, username, email } = event.queryStringParameters || {};

    if (!userId && !username && !email) {
      console.error('❌ No se proporcionó userId, username o email');
      return json(400, { error: 'Se requiere userId, username o email' }, event);
    }

    console.log('🔍 Obteniendo perfil para:', { userId, username, email });

    // Determinar WHERE clause y valor
    const where = userId ? 'id = $1' : (username ? 'LOWER(username) = LOWER($1)' : 'LOWER(email) = LOWER($1)');
    const value = userId || username || email;

    // Detectar esquema que contiene la tabla users
    const tblInfo = await pool.query(`
      SELECT schemaname FROM pg_catalog.pg_tables
      WHERE tablename = 'users'
      ORDER BY (schemaname = 'public') DESC
      LIMIT 1
    `);
    const schema = tblInfo.rows?.[0]?.schemaname || 'public';
    const qualified = `${schema}.users`;

    console.log('📊 Usando esquema:', schema);

    // Detectar columnas existentes
    const colsRes = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'users'
    `, [schema]);

    const cols = new Set(colsRes.rows.map(r => r.column_name));
    console.log('📊 Columnas disponibles:', Array.from(cols).join(', '));

    // Columnas deseadas (intentar obtener todas)
    const want = [
      'id', 'username', 'email', 'display_name', 'first_name', 'last_name',
      'cargo_rol', 'company_role', 'type_rol', 'phone', 'bio', 'location',
      'profile_picture_url', 'avatar_url', 'curriculum_url',
      'linkedin_url', 'github_url', 'website_url', 'portfolio_url',
      'created_at', 'updated_at', 'last_login_at'
    ];

    // Seleccionar solo las que existen
    const selected = want.filter(c => cols.has(c));

    // Asegurar que id, username, email estén incluidos
    if (!selected.includes('id') && cols.has('id')) selected.unshift('id');
    if (!selected.includes('username') && cols.has('username')) selected.unshift('username');
    if (!selected.includes('email') && cols.has('email')) selected.unshift('email');

    console.log('📝 Columnas seleccionadas:', selected.join(', '));

    // Construir y ejecutar query
    const query = `SELECT ${selected.join(', ')} FROM ${qualified} WHERE ${where} LIMIT 1`;
    console.log('🔄 Ejecutando query...');

    const result = await pool.query(query, [String(value)]);

    if (result.rows.length === 0) {
      console.warn('⚠️ Usuario no encontrado en la base de datos');
      return json(404, { error: 'Usuario no encontrado' }, event);
    }

    const user = result.rows[0];

    // Normalizar campos para compatibilidad
    // Asegurar que profile_picture_url tiene valor si avatar_url existe
    if (!user.profile_picture_url && user.avatar_url) {
      user.profile_picture_url = user.avatar_url;
    }
    if (!user.avatar_url && user.profile_picture_url) {
      user.avatar_url = user.profile_picture_url;
    }

    console.log('✅ Perfil encontrado para usuario:', user.username, '| Campos:', Object.keys(user).join(', '));

    return json(200, { user }, event);

  } catch (error) {
    console.error('❌ Error en GET /api/profile:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n')[0]
    });

    // Determinar el tipo de error
    let statusCode = 500;
    let errorMessage = 'Error obteniendo perfil';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'No se pudo conectar a la base de datos';
    } else if (error.code === '42P01') {
      errorMessage = 'Tabla de usuarios no encontrada en la base de datos';
      console.error('💡 Verifica que la tabla "users" existe en la base de datos');
    } else if (error.code === '42703') {
      errorMessage = 'Columna no encontrada en la tabla de usuarios';
      console.error('💡 Verifica que las columnas existen en la tabla "users"');
    }

    return json(statusCode, {
      error: errorMessage,
      code: error.code,
      details: process.env.NODE_ENV !== 'production' ? String(error.message || error) : undefined
    }, event);
  }
}

async function handleUpdateProfile(event) {
  try {
    if (!process.env.DATABASE_URL) return json(500, { error: 'Base de datos no configurada' }, event);

    const body = JSON.parse(event.body || '{}');
    const { id, username, email, first_name, last_name, company_role, phone, location, bio, linkedin_url, portfolio_url, github_url } = body;

    if (!id && !username) {
      return json(400, { error: 'Se requiere id o username para actualizar' }, event);
    }

    console.log('Actualizando perfil para:', { id, username });

    // Construir query de actualización
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (email) { fields.push(`email = $${paramIndex++}`); values.push(email); }
    if (first_name) { fields.push(`first_name = $${paramIndex++}`); values.push(first_name); }
    if (last_name) { fields.push(`last_name = $${paramIndex++}`); values.push(last_name); }
    if (company_role) { fields.push(`company_role = $${paramIndex++}`); values.push(company_role); }
    if (phone) { fields.push(`phone = $${paramIndex++}`); values.push(phone); }
    if (location) { fields.push(`location = $${paramIndex++}`); values.push(location); }
    if (bio) { fields.push(`bio = $${paramIndex++}`); values.push(bio); }
    if (linkedin_url) { fields.push(`linkedin_url = $${paramIndex++}`); values.push(linkedin_url); }
    if (portfolio_url) { fields.push(`portfolio_url = $${paramIndex++}`); values.push(portfolio_url); }
    if (github_url) { fields.push(`github_url = $${paramIndex++}`); values.push(github_url); }

    if (fields.length === 0) {
      return json(400, { error: 'No hay campos para actualizar' }, event);
    }

    let whereClause = id ? `id = $${paramIndex}` : `username = $${paramIndex}`;
    values.push(id || username);

    // IMPORTANTE: Retornar los mismos campos que en GET para consistencia
    const returningFields = `
      id, username, email, first_name, last_name, display_name,
      company_role, phone, location, bio,
      linkedin_url, portfolio_url, github_url, website_url,
      type_rol, cargo_rol,
      avatar_url, profile_picture_url, curriculum_url,
      created_at, last_login_at
    `.replace(/\s+/g, ' ').trim();

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE ${whereClause}
      RETURNING ${returningFields}
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return json(404, { error: 'Usuario no encontrado' }, event);
    }

    const user = result.rows[0];
    console.log('Perfil actualizado para usuario:', user.username);

    return json(200, { user }, event);

  } catch (error) {
    console.error('Error en PUT /api/profile:', error);
    return json(500, {
      error: 'Error actualizando perfil',
      details: process.env.NODE_ENV !== 'production' ? String(error.message || error) : undefined
    }, event);
  }
}