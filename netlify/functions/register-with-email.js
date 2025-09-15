// netlify/functions/register-with-email.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { createCorsResponse } = require('./cors-utils');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const json = (status, data, event = null) => createCorsResponse(status, data, event);

// Servicio de email simplificado para Netlify Functions
class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Email service initialization error:', error);
      this.transporter = null;
    }
  }

  isConfigured() {
    return !!(this.transporter && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(email, otp, displayName) {
    if (!this.isConfigured()) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: '🔐 Verificación de Email - Coach Lia IA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verificación de Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Coach Lia IA</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Tu plataforma de aprendizaje personalizada</p>
            </div>

            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">¡Hola ${displayName}! 👋</h2>

                <p>¡Bienvenido/a a Coach Lia IA! Estamos emocionados de tenerte en nuestra comunidad de aprendizaje.</p>

                <p>Para completar tu registro, por favor verifica tu dirección de email ingresando el siguiente código:</p>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</span>
                </div>

                <p><strong>⏰ Este código expira en 15 minutos.</strong></p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">

                <h3 style="color: #667eea;">¿Qué puedes hacer después de verificar tu email?</h3>
                <ul style="padding-left: 20px;">
                    <li>Acceder a cursos personalizados de IA</li>
                    <li>Chatear con Coach Lia, tu asistente personal</li>
                    <li>Participar en la comunidad</li>
                    <li>Recibir actualizaciones y contenido exclusivo</li>
                    <li>Completar tu perfil profesional</li>
                </ul>

                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'https://aprendeyaplica.ai'}" class="button">
                        Ir a la plataforma
                    </a>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                    Si no solicitaste esta verificación, puedes ignorar este email de forma segura.
                </p>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
                <p>Coach Lia IA - Tu compañero en el aprendizaje</p>
            </div>
        </body>
        </html>
      `
    };

    await this.transporter.sendMail(mailOptions);
    console.log('📧 Verification email sent to:', email);
  }
}

// Servicio OTP simplificado
async function createOTP(pool, userId, type = 'verify_email') {
  const emailService = new EmailService();
  const otp = emailService.generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  try {
    const result = await pool.query(`
      INSERT INTO otps (user_id, type, otp_hash, expires_at, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `, [userId, type, hashedOtp, expiresAt]);

    return {
      success: true,
      otp: otp,
      otpId: result.rows[0].id
    };
  } catch (error) {
    console.error('Error creating OTP:', error);
    return { success: false, error: error.message };
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' }, event);

  try {
    if (!process.env.DATABASE_URL) return json(500, { error: 'Base de datos no configurada' }, event);

    const { full_name, username, email, password, type_rol } = JSON.parse(event.body || '{}');

    // Validaciones obligatorias
    if (!full_name || !username || !email || !password) {
      return json(400, {
        error: 'Nombre completo, usuario, email y contraseña son requeridos'
      }, event);
    }

    // Validación de contraseña (mínimo 8 caracteres)
    if (String(password).length < 8) {
      return json(400, {
        error: 'La contraseña debe tener al menos 8 caracteres'
      }, event);
    }

    // Validación de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return json(400, {
        error: 'El email debe tener un formato válido'
      }, event);
    }

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return json(409, { error: 'El email o nombre de usuario ya están en uso' }, event);
    }

    // Hash de la contraseña
    const hash = await bcrypt.hash(String(password), 10);

    // Verificar configuración de email
    const emailService = new EmailService();
    if (!emailService.isConfigured()) {
      console.warn('⚠️ Email service not configured, creating user without verification');

      // Crear usuario sin verificación si el email no está configurado
      const result = await pool.query(`
        INSERT INTO users (username, email, password_hash, display_name, email_verified, email_verified_at)
        VALUES ($1, $2, $3, $4, true, NOW())
        RETURNING id, username, email, display_name, email_verified
      `, [username, email, hash, full_name]);

      return json(201, {
        user: { ...result.rows[0], isNewUser: true },
        message: 'Usuario creado sin verificación de email (servicio no configurado)'
      }, event);
    }

    // Verificar si la tabla users tiene las columnas necesarias
    let hasEmailVerified = false;
    try {
      const cols = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'users' AND column_name IN ('email_verified', 'email_verified_at')
      `);
      hasEmailVerified = cols.rows.some(row => row.column_name === 'email_verified');
    } catch (_) {}

    // Crear usuario con email no verificado (si la columna existe)
    let query, params;
    if (hasEmailVerified) {
      query = `
        INSERT INTO users (username, email, password_hash, display_name, email_verified)
        VALUES ($1, $2, $3, $4, false)
        RETURNING id, username, email, display_name, email_verified
      `;
      params = [username, email, hash, full_name];
    } else {
      query = `
        INSERT INTO users (username, email, password_hash, display_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, display_name
      `;
      params = [username, email, hash, full_name];
    }

    const result = await pool.query(query, params);

    const newUser = {
      ...result.rows[0],
      email_verified: result.rows[0].email_verified || false
    };

    // Generar y enviar código OTP
    try {
      const otpResult = await createOTP(pool, newUser.id, 'verify_email');

      if (otpResult.success) {
        await emailService.sendVerificationEmail(email, otpResult.otp, full_name);

        console.log('📧 Verification email sent for new user:', {
          userId: newUser.id,
          email: email,
          otpId: otpResult.otpId
        });

        return json(201, {
          user: { ...newUser, isNewUser: true },
          message: 'Usuario creado. Revisa tu email para verificar tu cuenta.',
          requiresVerification: true
        }, event);
      } else {
        throw new Error('Error generando código de verificación');
      }
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError);

      // En caso de error de email, crear usuario sin verificar pero notificar
      return json(201, {
        user: { ...newUser, isNewUser: true },
        message: 'Usuario creado, pero hubo un problema enviando el email de verificación. Contacta soporte.',
        requiresVerification: true,
        emailError: true
      }, event);
    }

  } catch (e) {
    console.error('register error', e);
    return json(500, { error: 'Error interno del servidor' }, event);
  }
};