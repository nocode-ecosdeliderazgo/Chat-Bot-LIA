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

    // PASO 1: Usar un enfoque simple y robusto
    // Intentar primero con campos básicos que deberían existir siempre
    const basicFields = ['id', 'username', 'email', 'created_at'];
    
    // Construir query inicial con campos básicos
    let query = supabase.from('users').select(basicFields.join(', '));

    if (userId) {
      query = query.eq('id', userId);
    } else if (username) {
      query = query.eq('username', username);
    } else if (email) {
      query = query.eq('email', email);
    }

    console.log('🔄 Probando conexión con campos básicos...');
    const { data: basicData, error: basicError } = await query.single();

    if (basicError) {
      if (basicError.code === 'PGRST116') {
        console.warn('⚠️ Usuario no encontrado en la base de datos');
        return json(404, { error: 'Usuario no encontrado' }, event);
      }
      console.error('❌ Error en query básica:', basicError);
      throw basicError;
    }

    console.log('✅ Usuario encontrado, obteniendo campos adicionales...');

    // PASO 2: Ahora intentar obtener todos los campos disponibles
    let extendedQuery = supabase.from('users').select('*');
    
    if (userId) {
      extendedQuery = extendedQuery.eq('id', userId);
    } else if (username) {
      extendedQuery = extendedQuery.eq('username', username);
    } else if (email) {
      extendedQuery = extendedQuery.eq('email', email);
    }

    const { data: fullData, error: fullError } = await extendedQuery.single();

    let user;
    if (fullError) {
      console.warn('⚠️ No se pudieron obtener todos los campos, usando datos básicos:', fullError.message);
      user = basicData;
    } else {
      user = fullData;
      console.log('✅ Datos completos obtenidos, columnas disponibles:', Object.keys(user).join(', '));
    }

    // PASO 4: Normalizar campos para compatibilidad
    if (!user.profile_picture_url && user.avatar_url) {
      user.profile_picture_url = user.avatar_url;
    }
    if (!user.avatar_url && user.profile_picture_url) {
      user.avatar_url = user.profile_picture_url;
    }

    // Asegurar campos mínimos
    if (!user.display_name && (user.first_name || user.last_name)) {
      user.display_name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }

    console.log('✅ Perfil encontrado para usuario:', user.username, '| Campos disponibles:', Object.keys(user).join(', '));

    return json(200, { user }, event);

  } catch (error) {
    console.error('❌ Error en GET /.netlify/functions/get-profile:', {
      message: error.message,
      code: error.code,
      details: error.details
    });

    // Determinar el tipo de error más específico
    let statusCode = 500;
    let errorMessage = 'Error obteniendo perfil';

    if (error.code === '42703') {
      errorMessage = 'Error en la estructura de datos';
      console.error('💡 Algunas columnas esperadas no existen en la tabla users');
    } else if (error.code === '42P01') {
      errorMessage = 'Tabla de usuarios no encontrada';
      console.error('💡 Verifica que la tabla "users" existe en la base de datos');
    } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      errorMessage = 'Tabla de usuarios no encontrada en la base de datos';
    }

    return json(statusCode, {
      error: errorMessage,
      code: error.code,
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
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

    // Seleccionar campos básicos después de actualizar (solo los que sabemos que existen)
    query = query.select('id, username, email, first_name, last_name, created_at').single();

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
    console.error('❌ Error en PUT /.netlify/functions/get-profile:', error);
    return json(500, {
      error: 'Error actualizando perfil',
      details: process.env.NODE_ENV !== 'production' ? String(error.message || error) : undefined
    }, event);
  }
}