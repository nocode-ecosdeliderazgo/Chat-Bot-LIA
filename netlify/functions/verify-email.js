// netlify/functions/verify-email.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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
    const { email, otp } = JSON.parse(event.body || '{}');

    if (!email || !otp) {
      return json(400, { error: 'Email y código OTP son requeridos' }, event);
    }

    // Buscar el usuario por email
    const userResult = await pool.query(
      'SELECT id, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return json(404, { error: 'Usuario no encontrado' }, event);
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      return json(400, { error: 'El email ya está verificado' }, event);
    }

    // Buscar OTP válido y no usado
    const otpResult = await pool.query(`
      SELECT id, otp_hash, expires_at, used
      FROM otps
      WHERE user_id = $1
        AND type = 'verify_email'
        AND used = FALSE
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [user.id]);

    if (otpResult.rows.length === 0) {
      return json(400, {
        error: 'Código OTP inválido o expirado. Solicita un nuevo código.'
      }, event);
    }

    const otpRecord = otpResult.rows[0];

    // Verificar el código OTP
    const isValidOTP = await bcrypt.compare(otp, otpRecord.otp_hash);

    if (!isValidOTP) {
      return json(400, { error: 'Código OTP incorrecto' }, event);
    }

    // Marcar OTP como usado
    await pool.query(`
      UPDATE otps
      SET used = TRUE, used_at = NOW()
      WHERE id = $1
    `, [otpRecord.id]);

    // Marcar email como verificado
    await pool.query(`
      UPDATE users
      SET email_verified = TRUE, email_verified_at = NOW()
      WHERE id = $1
    `, [user.id]);

    console.log('✅ Email verified successfully for user:', user.id);

    return json(200, {
      success: true,
      message: 'Email verificado exitosamente'
    }, event);

  } catch (error) {
    console.error('❌ Error verifying email:', error);
    return json(500, { error: 'Error interno del servidor' }, event);
  }
};