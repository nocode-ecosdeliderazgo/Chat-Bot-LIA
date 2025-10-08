// netlify/functions/test-profile.js
const { createCorsResponse } = require('./cors-utils');

const json = (status, data, event = null) => createCorsResponse(status, data, event);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);

  try {
    return json(200, {
      ok: true,
      message: 'Función test-profile funcionando correctamente',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path,
      queryParams: event.queryStringParameters || {},
      headers: {
        origin: event.headers['origin'] || event.headers['Origin'],
        host: event.headers['host'] || event.headers['Host'],
        userAgent: event.headers['user-agent'] || event.headers['User-Agent']
      }
    }, event);

  } catch (error) {
    console.error('Error en test-profile:', error);
    return json(500, { error: 'Error interno del servidor', details: error.message }, event);
  }
};