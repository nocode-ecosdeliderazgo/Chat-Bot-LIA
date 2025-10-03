// netlify/functions/get-profile.js
const { createClient } = require('@supabase/supabase-js');
const { createCorsResponse } = require('./cors-utils');

// Inicializar Supabase con service role para acceso completo
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

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
    if (!supabase) {
      console.error('❌ Supabase no está configurado');
      return json(500, { error: 'Base de datos no configurada' }, event);
    }

    const { userId, username, email } = event.queryStringParameters || {};

    if (!userId && !username && !email) {
      console.error('❌ No se proporcionó userId, username o email');
      return json(400, { error: 'Se requiere userId, username o email' }, event);
    }

    console.log('🔍 Obteniendo perfil para:', { userId, username, email });

    // Campos a seleccionar (todos los disponibles)
    const selectFields = `
      id, username, email, first_name, last_name, display_name,
      company_role, phone, location, bio,
      linkedin_url, portfolio_url, github_url, website_url,
      type_rol, cargo_rol,
      avatar_url, profile_picture_url, curriculum_url,
      created_at, last_login_at
    `.replace(/\s+/g, ' ').trim();

    // Construir query de Supabase
    let query = supabase.from('users').select(selectFields);

    if (userId) {
      query = query.eq('id', userId);
    } else if (username) {
      query = query.eq('username', username);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el usuario
        console.warn('⚠️ Usuario no encontrado en la base de datos');
        return json(404, { error: 'Usuario no encontrado' }, event);
      }
      throw error;
    }

    const user = data;

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
      details: error.details
    });

    // Determinar el tipo de error
    let statusCode = 500;
    let errorMessage = 'Error obteniendo perfil';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'No se pudo conectar a la base de datos';
    } else if (error.message?.includes('relation') || error.message?.includes('table')) {
      errorMessage = 'Tabla de usuarios no encontrada';
      statusCode = 500;
    } else if (error.message?.includes('column')) {
      errorMessage = 'Error en la estructura de datos';
      statusCode = 500;
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
    if (!supabase) {
      console.error('❌ Supabase no está configurado');
      return json(500, { error: 'Base de datos no configurada' }, event);
    }

    const body = JSON.parse(event.body || '{}');
    const { id, username, email, first_name, last_name, company_role, type_rol, phone, location, bio, linkedin_url, portfolio_url, github_url, website_url } = body;

    if (!id && !username) {
      return json(400, { error: 'Se requiere id o username para actualizar' }, event);
    }

    console.log('🔄 Actualizando perfil para:', { id, username });

    // Construir objeto de actualización
    const updates = {};
    if (email) updates.email = email;
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (company_role) updates.company_role = company_role;
    if (type_rol) updates.type_rol = type_rol;
    if (phone) updates.phone = phone;
    if (location) updates.location = location;
    if (bio) updates.bio = bio;
    if (linkedin_url) updates.linkedin_url = linkedin_url;
    if (portfolio_url) updates.portfolio_url = portfolio_url;
    if (github_url) updates.github_url = github_url;
    if (website_url) updates.website_url = website_url;

    if (Object.keys(updates).length === 0) {
      return json(400, { error: 'No hay campos para actualizar' }, event);
    }

    // Construir query de actualización
    let query = supabase.from('users').update(updates);

    if (id) {
      query = query.eq('id', id);
    } else if (username) {
      query = query.eq('username', username);
    }

    // Seleccionar todos los campos después de actualizar
    const selectFields = `
      id, username, email, first_name, last_name, display_name,
      company_role, phone, location, bio,
      linkedin_url, portfolio_url, github_url, website_url,
      type_rol, cargo_rol,
      avatar_url, profile_picture_url, curriculum_url,
      created_at, last_login_at
    `.replace(/\s+/g, ' ').trim();

    query = query.select(selectFields).single();

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('⚠️ Usuario no encontrado');
        return json(404, { error: 'Usuario no encontrado' }, event);
      }
      throw error;
    }

    console.log('✅ Perfil actualizado para usuario:', data.username);

    return json(200, { user: data }, event);

  } catch (error) {
    console.error('❌ Error en PUT /api/profile:', error);
    return json(500, {
      error: 'Error actualizando perfil',
      details: process.env.NODE_ENV !== 'production' ? String(error.message || error) : undefined
    }, event);
  }
}