// netlify/functions/profile-upload.js
const { createCorsResponse } = require('./cors-utils');
const { createClient } = require('@supabase/supabase-js');

const json = (status, data, event = null) => createCorsResponse(status, data, event);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' }, event);

  try {
    // Inicializar Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return json(500, { error: 'Configuración de Supabase no disponible' }, event);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parsear el archivo del form-data
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return json(400, { error: 'Se requiere multipart/form-data' }, event);
    }

    // Para simplificar, vamos a retornar una respuesta que indique usar update-avatar
    // ya que el manejo de multipart/form-data en Netlify Functions es complejo
    return json(400, {
      error: 'Use /api/update-avatar para subir avatares',
      redirect: '/api/update-avatar'
    }, event);

  } catch (error) {
    console.error('Error en profile upload:', error);
    return json(500, { error: 'Error interno del servidor' }, event);
  }
};