// netlify/functions/google-login.js
const { Pool } = require('pg');
const { OAuth2Client } = require('google-auth-library');
const { createCorsResponse } = require('./cors-utils');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const json = (status, data, event = null) => createCorsResponse(status, data, event);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' }, event);

  try {
    const { idToken } = JSON.parse(event.body || '{}');
    
    if (!idToken) {
      return json(400, { error: 'ID Token requerido' }, event);
    }

    // Verificar configuración
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const jwtSecret = process.env.USER_JWT_SECRET || 'default-secret';
    
    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID no está configurado');
      return json(500, { error: 'Configuración de Google OAuth incompleta' }, event);
    }

    // Verificar el token con Google
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    
    // Extraer información del usuario
    const googleUser = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      givenName: payload.given_name || '',
      familyName: payload.family_name || '',
      picture: payload.picture,
      emailVerified: payload.email_verified
    };

    console.log('Processing Google login for:', googleUser.email);

    // Detectar columnas opcionales de roles
    let hasCargoRol = false;
    let hasTypeRol = false;
    let hasGoogleId = false;
    let hasAuthProvider = false;

    try {
      const cols = await pool.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'users' 
         AND column_name IN ('cargo_rol','type_rol','google_id','auth_provider')`
      );
      const names = (cols.rows || []).map(r => String(r.column_name || '').toLowerCase());
      hasCargoRol = names.includes('cargo_rol');
      hasTypeRol = names.includes('type_rol');
      hasGoogleId = names.includes('google_id');
      hasAuthProvider = names.includes('auth_provider');
    } catch (e) {
      console.log('Error detectando columnas:', e.message);
    }

    // Buscar usuario existente por email o google_id
    const selectCols = [
      'id',
      'username',
      'email',
      'display_name',
      'created_at',
      'last_login_at',
      ...(hasCargoRol ? ['cargo_rol'] : []),
      ...(hasTypeRol ? ['type_rol'] : []),
      ...(hasGoogleId ? ['google_id'] : []),
      ...(hasAuthProvider ? ['auth_provider'] : [])
    ].join(', ');

    let searchQuery = `SELECT ${selectCols} FROM users WHERE lower(email) = lower($1)`;
    let searchParams = [googleUser.email];
    
    if (hasGoogleId) {
      searchQuery += ` OR google_id = $2`;
      searchParams.push(googleUser.googleId);
    }
    
    searchQuery += ` LIMIT 1`;

    const { rows: existingUsers } = await pool.query(searchQuery, searchParams);
    let user = existingUsers[0];
    let isNewUser = false;

    if (!user) {
      // Crear nuevo usuario
      console.log('Creando nuevo usuario desde Google:', googleUser.email);
      
      // Generar username único
      let username = googleUser.email.split('@')[0].toLowerCase();
      let counter = 1;
      let finalUsername = username;
      
      // Verificar disponibilidad del username
      while (true) {
        const { rows: usernameCheck } = await pool.query(
          'SELECT id FROM users WHERE lower(username) = lower($1) LIMIT 1',
          [finalUsername]
        );
        
        if (usernameCheck.length === 0) break;
        finalUsername = `${username}${counter}`;
        counter++;
      }

      // Construir query de inserción dinámicamente
      const insertCols = [
        'username',
        'email',
        'display_name',
        'password_hash',
        'created_at'
      ];
      const insertValues = [
        finalUsername,
        googleUser.email,
        googleUser.name,
        '', // Sin password para usuarios de Google
        'CURRENT_TIMESTAMP'
      ];
      let paramIndex = insertValues.length;

      if (hasGoogleId) {
        insertCols.push('google_id');
        insertValues.push(`$${++paramIndex}`);
      }
      if (hasAuthProvider) {
        insertCols.push('auth_provider');
        insertValues.push(`$${++paramIndex}`);
      }
      if (hasCargoRol) {
        insertCols.push('cargo_rol');
        insertValues.push(`$${++paramIndex}`);
      }
      if (hasTypeRol) {
        insertCols.push('type_rol');
        insertValues.push(`$${++paramIndex}`);
      }

      const insertQuery = `
        INSERT INTO users (${insertCols.join(', ')})
        VALUES (${insertValues.map((val, idx) => typeof val === 'string' && val.startsWith('$') ? val : `$${idx + 1}`).join(', ')})
        RETURNING ${selectCols}
      `;

      const queryParams = [
        finalUsername,
        googleUser.email,
        googleUser.name,
        '' // password_hash vacío
      ];

      if (hasGoogleId) queryParams.push(googleUser.googleId);
      if (hasAuthProvider) queryParams.push('google');
      if (hasCargoRol) queryParams.push('Usuario');
      if (hasTypeRol) queryParams.push(null); // type_rol null para que vaya al cuestionario

      const { rows: newUsers } = await pool.query(insertQuery, queryParams);
      user = newUsers[0];
      isNewUser = true;
      
      console.log('Usuario creado exitosamente:', user.id);
      
    } else {
      // Usuario existente - actualizar google_id si no lo tiene
      if (hasGoogleId && !user.google_id) {
        await pool.query(
          'UPDATE users SET google_id = $1 WHERE id = $2',
          [googleUser.googleId, user.id]
        );
        user.google_id = googleUser.googleId;
      }
      
      console.log('Usuario existente encontrado:', user.id);
    }

    // Actualizar last_login_at
    try {
      await pool.query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      console.log('Error actualizando last_login_at:', updateError.message);
    }

    // Generar JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 días
    };

    const token = jwt.sign(tokenPayload, jwtSecret);

    // Preparar respuesta del usuario
    const responseUser = { 
      id: user.id, 
      username: user.username,
      email: user.email,
      display_name: user.display_name || user.username,
      isNewUser: isNewUser,
      authProvider: 'google',
      picture: googleUser.picture
    };
    
    if (hasCargoRol) responseUser.cargo_rol = user.cargo_rol || 'Usuario';
    if (hasTypeRol) responseUser.type_rol = user.type_rol || null;
    if (hasGoogleId) responseUser.google_id = user.google_id;

    console.log('Login con Google exitoso:', {
      userId: user.id,
      email: user.email,
      isNewUser: isNewUser,
      type_rol: responseUser.type_rol
    });

    return json(200, { 
      ok: true, 
      user: responseUser,
      token: token,
      message: isNewUser ? 'Cuenta creada exitosamente' : 'Inicio de sesión exitoso'
    }, event);

  } catch (error) {
    console.error('Error en Google login:', error);
    
    if (error.message.includes('Token used too early') || 
        error.message.includes('Token expired') ||
        error.message.includes('Invalid token')) {
      return json(401, { error: 'Token de Google inválido o expirado' }, event);
    }
    
    return json(500, { error: 'Error interno del servidor' }, event);
  }
};