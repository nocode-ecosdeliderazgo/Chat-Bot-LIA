// netlify/functions/debug-register.js
// Función para diagnosticar el registro
const { createCorsResponse } = require('./cors-utils');

const json = (status, data, event = null) => createCorsResponse(status, data, event);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' }, event);

  const debugInfo = {
    // Variables de entorno SMTP
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ? '***SET***' : 'NOT_SET'
    },

    // Otras variables importantes
    database: {
      url: process.env.DATABASE_URL ? '***SET***' : 'NOT_SET'
    },

    // Estado del sistema
    nodejs: process.version,

    // Test de configuración SMTP
    smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),

    timestamp: new Date().toISOString()
  };

  console.log('🔍 Debug Register Info:', JSON.stringify(debugInfo, null, 2));

  return json(200, {
    message: 'Debug Register Response',
    debug: debugInfo
  }, event);
};