// netlify/functions/setup-otps-table.js
// Función para crear la tabla OTPs si no existe
const { Pool } = require('pg');
const { createCorsResponse } = require('./cors-utils');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const json = (status, data, event = null) => createCorsResponse(status, data, event);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' }, event);

  try {
    // Verificar si la tabla otps existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'otps'
      );
    `);

    if (tableExists.rows[0].exists) {
      return json(200, {
        message: 'La tabla otps ya existe',
        exists: true
      }, event);
    }

    // Crear la tabla otps
    await pool.query(`
      CREATE TABLE otps (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL DEFAULT 'verify_email',
        otp_hash TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        used_at TIMESTAMP WITH TIME ZONE NULL
      );
    `);

    // Crear índices para optimizar consultas
    await pool.query(`
      CREATE INDEX idx_otps_user_id ON otps(user_id);
      CREATE INDEX idx_otps_expires_at ON otps(expires_at);
      CREATE INDEX idx_otps_type ON otps(type);
    `);

    console.log('✅ Tabla otps creada exitosamente');

    return json(200, {
      message: 'Tabla otps creada exitosamente',
      created: true
    }, event);

  } catch (error) {
    console.error('❌ Error creando tabla otps:', error);
    return json(500, {
      error: 'Error creando tabla otps',
      details: error.message
    }, event);
  }
};