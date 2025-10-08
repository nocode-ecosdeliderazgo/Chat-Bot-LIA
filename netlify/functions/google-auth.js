// netlify/functions/google-auth.js
const { OAuth2Client } = require('google-auth-library');
const { createCorsResponse } = require('./cors-utils');

const json = (status, data, event = null) => createCorsResponse(status, data, event);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' }, event);

  try {
    const { idToken } = JSON.parse(event.body || '{}');
    
    if (!idToken) {
      return json(400, { error: 'ID Token requerido' }, event);
    }

    // Verificar que las variables de entorno estén configuradas
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID no está configurado');
      return json(500, { error: 'Configuración de Google OAuth incompleta' }, event);
    }

    // Crear cliente OAuth
    const client = new OAuth2Client(clientId);
    
    // Verificar el token ID
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    
    // Extraer información del usuario de Google
    const googleUser = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      givenName: payload.given_name,
      familyName: payload.family_name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    };

    console.log('Google user verified:', { 
      email: googleUser.email, 
      name: googleUser.name,
      googleId: googleUser.googleId 
    });

    return json(200, { 
      success: true, 
      user: googleUser,
      message: 'Token verificado exitosamente'
    }, event);

  } catch (error) {
    console.error('Error en verificación de Google token:', error);
    
    if (error.message.includes('Token used too early') || 
        error.message.includes('Token expired') ||
        error.message.includes('Invalid token')) {
      return json(401, { error: 'Token inválido o expirado' }, event);
    }
    
    return json(500, { error: 'Error interno del servidor' }, event);
  }
};