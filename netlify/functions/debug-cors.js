// netlify/functions/debug-cors.js
// Función temporal para depurar CORS en producción
const { createCorsResponse } = require('./cors-utils');

exports.handler = async (event) => {
  const origin = event.headers['origin'] || event.headers['Origin'];

  const debugInfo = {
    origin: origin,
    allHeaders: event.headers,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
    hostname: origin ? new URL(origin).hostname : null,
    allEnvVars: Object.keys(process.env).filter(key =>
      key.includes('ORIGIN') || key.includes('CORS') || key.includes('FRONTEND')
    ).reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {}),
    timestamp: new Date().toISOString()
  };

  console.log('🔍 CORS Debug Info:', JSON.stringify(debugInfo, null, 2));

  return createCorsResponse(200, {
    message: 'CORS Debug Response',
    debug: debugInfo
  }, event);
};