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
    if (!process.env.DATABASE_URL) return json(500, { error: 'Base de datos no configurada' }, event);

    const { userId, username, email } = event.queryStringParameters || {};

    if (!userId && !username && !email) {
      return json(400, { error: 'Se requiere userId, username o email' }, event);
    }

    console.log('Obteniendo perfil para:', { userId, username, email });

    // Construir query según el parámetro disponible
    let query, params;
    if (userId) {
      query = 'SELECT id, username, email, first_name, last_name, company_role, phone, location, bio, linkedin_url, portfolio_url, github_url, type_rol, cargo_rol, avatar_url FROM users WHERE id = $1';
      params = [userId];
    } else if (username) {
      query = 'SELECT id, username, email, first_name, last_name, company_role, phone, location, bio, linkedin_url, portfolio_url, github_url, type_rol, cargo_rol, avatar_url FROM users WHERE username = $1';
      params = [username];
    } else if (email) {
      query = 'SELECT id, username, email, first_name, last_name, company_role, phone, location, bio, linkedin_url, portfolio_url, github_url, type_rol, cargo_rol, avatar_url FROM users WHERE email = $1';
      params = [email];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return json(404, { error: 'Usuario no encontrado' }, event);
    }

    const user = result.rows[0];
    console.log('Perfil encontrado para usuario:', user.username);

    return json(200, { user }, event);

  } catch (error) {
    console.error('Error en GET /api/profile:', error);
    return json(500, {
      error: 'Error obteniendo perfil',
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

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE ${whereClause}
      RETURNING id, username, email, first_name, last_name, company_role, phone, location, bio, linkedin_url, portfolio_url, github_url, type_rol, cargo_rol, avatar_url
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