const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initTransporter();
    }

    /**
     * Inicializa el transportador de email
     */
    initTransporter() {
        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: false, // true para 465, false para otros puertos
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            console.log('✅ Servicio de email inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando servicio de email:', error);
            this.transporter = null;
        }
    }

    /**
     * Genera un código OTP seguro de 6 dígitos
     * @returns {string} Código OTP de 6 dígitos
     */
    generateOTP() {
        // Generar número aleatorio entre 100000 y 999999
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Genera hash seguro del código OTP
     * @param {string} otp - Código OTP en texto plano
     * @returns {Promise<string>} Hash del código
     */
    async hashOTP(otp) {
        const saltRounds = 12;
        return await bcrypt.hash(otp, saltRounds);
    }

    /**
     * Verifica si un código OTP coincide con su hash
     * @param {string} otp - Código OTP en texto plano
     * @param {string} hash - Hash almacenado
     * @returns {Promise<boolean>} True si coincide
     */
    async verifyOTP(otp, hash) {
        return await bcrypt.compare(otp, hash);
    }

    /**
     * Envía email de verificación con OTP
     * @param {string} to - Email del destinatario
     * @param {string} otp - Código OTP
     * @param {string} username - Nombre del usuario
     * @returns {Promise<Object>} Resultado del envío
     */
    async sendVerificationEmail(to, otp, username) {
        if (!this.transporter) {
            throw new Error('Servicio de email no configurado');
        }

        const subject = 'Verifica tu cuenta - Aprende y Aplica IA';
        const htmlContent = this.generateVerificationEmailHTML(otp, username);

        try {
            const info = await this.transporter.sendMail({
                from: `"Aprende y Aplica IA" <${process.env.SMTP_USER}>`,
                to: to,
                subject: subject,
                html: htmlContent,
                text: this.generateVerificationEmailText(otp, username)
            });

            console.log('📧 Email de verificación enviado:', {
                to: to,
                messageId: info.messageId,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                messageId: info.messageId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error enviando email de verificación:', error);
            throw new Error('Error enviando email de verificación');
        }
    }

    /**
     * Genera el HTML del email de verificación
     * @param {string} otp - Código OTP
     * @param {string} username - Nombre del usuario
     * @returns {string} HTML del email
     */
    generateVerificationEmailHTML(otp, username) {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verifica tu cuenta</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: #ffffff;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    color: #44E5FF;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .otp-code {
                    background: linear-gradient(135deg, #44E5FF, #0077A6);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    margin: 30px 0;
                    box-shadow: 0 4px 15px rgba(68, 229, 255, 0.3);
                }
                .warning {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 20px 0;
                    color: #856404;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #44E5FF, #0077A6);
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    margin: 20px 0;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">Aprende y Aplica IA</div>
                    <h1>¡Bienvenido a la comunidad!</h1>
                </div>
                
                <p>Hola <strong>${username}</strong>,</p>
                
                <p>Gracias por registrarte en <strong>Aprende y Aplica IA</strong>. Para completar tu registro y acceder a todos nuestros recursos, necesitamos verificar tu dirección de correo electrónico.</p>
                
                <div class="otp-code">
                    ${otp}
                </div>
                
                <p><strong>Tu código de verificación es: ${otp}</strong></p>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>Este código expira en 15 minutos</li>
                        <li>No compartas este código con nadie</li>
                        <li>Si no solicitaste este código, ignora este email</li>
                    </ul>
                </div>
                
                <p>Una vez verificado tu email, podrás:</p>
                <ul>
                    <li>Acceder a todos nuestros cursos de IA</li>
                    <li>Participar en la comunidad</li>
                    <li>Recibir actualizaciones y contenido exclusivo</li>
                    <li>Completar tu perfil profesional</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'https://aprendeyaplica.ai'}" class="button">
                        Ir a la plataforma
                    </a>
                </div>
                
                <div class="footer">
                    <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                    <p>Si tienes problemas, contacta a nuestro equipo de soporte.</p>
                    <p>&copy; 2024 Aprende y Aplica IA. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Genera la versión de texto plano del email
     * @param {string} otp - Código OTP
     * @param {string} username - Nombre del usuario
     * @returns {string} Texto plano del email
     */
    generateVerificationEmailText(otp, username) {
        return `
¡Bienvenido a Aprende y Aplica IA!

Hola ${username},

Gracias por registrarte en Aprende y Aplica IA. Para completar tu registro, necesitamos verificar tu dirección de correo electrónico.

Tu código de verificación es: ${otp}

IMPORTANTE:
- Este código expira en 15 minutos
- No compartas este código con nadie
- Si no solicitaste este código, ignora este email

Una vez verificado tu email, podrás acceder a todos nuestros cursos de IA, participar en la comunidad y recibir contenido exclusivo.

Si tienes problemas, contacta a nuestro equipo de soporte.

Saludos,
El equipo de Aprende y Aplica IA
        `;
    }


    /**
     * Envía email de recuperación de contraseña
     * @param {string} to - Email del destinatario
     * @param {string} resetToken - Token de recuperación
     * @param {string} username - Nombre del usuario
     * @returns {Promise<Object>} Resultado del envío
     */
    async sendPasswordResetEmail(to, resetToken, username) {
        if (!this.transporter) {
            throw new Error('Servicio de email no configurado');
        }

        // URL corregida: ahora apunta a reset-password.html en producción
        const frontendUrl = process.env.FRONTEND_URL || 'https://coach-lia-ia.netlify.app';
        const resetUrl = `${frontendUrl}/src/login/reset-password.html?token=${resetToken}`;
        const subject = 'Recuperación de Contraseña - Aprende y Aplica IA';
        const htmlContent = this.generatePasswordResetEmailHTML(resetUrl, resetToken, username);

        try {
            const info = await this.transporter.sendMail({
                from: `"Aprende y Aplica IA" <${process.env.SMTP_USER}>`,
                to: to,
                subject: subject,
                html: htmlContent,
                text: this.generatePasswordResetEmailText(resetUrl, resetToken, username)
            });

            console.log('📧 Email de recuperación enviado:', {
                to: to,
                messageId: info.messageId,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                messageId: info.messageId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error enviando email de recuperación:', error);
            throw new Error('Error enviando email de recuperación');
        }
    }

    /**
     * Genera el HTML del email de recuperación de contraseña
     * @param {string} resetUrl - URL de recuperación
     * @param {string} resetToken - Token de recuperación
     * @param {string} username - Nombre del usuario
     * @returns {string} HTML del email
     */
    generatePasswordResetEmailHTML(resetUrl, resetToken, username) {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperación de Contraseña</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: #ffffff;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    color: #44E5FF;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #44E5FF, #0077A6);
                    color: white !important;
                    padding: 15px 35px;
                    text-decoration: none;
                    border-radius: 25px;
                    margin: 20px 0;
                    font-weight: bold;
                    font-size: 16px;
                }
                .token-code {
                    background: #f8f9fa;
                    border: 2px dashed #44E5FF;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    margin: 20px 0;
                    word-break: break-all;
                    color: #0077A6;
                }
                .warning {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 20px 0;
                    color: #856404;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🔐 Aprende y Aplica IA</div>
                    <h1>Recuperación de Contraseña</h1>
                </div>

                <p>Hola <strong>${username}</strong>,</p>

                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Aprende y Aplica IA</strong>.</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" class="button">
                        🔓 Restablecer mi contraseña
                    </a>
                </div>

                <p style="text-align: center; color: #666; font-size: 14px;">
                    O copia y pega este enlace en tu navegador:
                </p>

                <div class="token-code">
                    ${resetUrl}
                </div>

                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>Este enlace expira en <strong>1 hora</strong></li>
                        <li>Solo puedes usar este enlace una vez</li>
                        <li>Si no solicitaste este cambio, ignora este email</li>
                        <li>Tu contraseña actual permanece segura hasta que la cambies</li>
                    </ul>
                </div>

                <p style="margin-top: 30px;">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. Tu cuenta permanece segura.</p>

                <div class="footer">
                    <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                    <p>Si tienes problemas con el enlace, contacta a nuestro equipo de soporte.</p>
                    <p>&copy; 2024 Aprende y Aplica IA. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Genera la versión de texto plano del email de recuperación
     * @param {string} resetUrl - URL de recuperación
     * @param {string} resetToken - Token de recuperación
     * @param {string} username - Nombre del usuario
     * @returns {string} Texto plano del email
     */
    generatePasswordResetEmailText(resetUrl, resetToken, username) {
        return `
Recuperación de Contraseña - Aprende y Aplica IA

Hola ${username},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Aprende y Aplica IA.

Para restablecer tu contraseña, haz clic en el siguiente enlace:
${resetUrl}

IMPORTANTE:
- Este enlace expira en 1 hora
- Solo puedes usar este enlace una vez
- Si no solicitaste este cambio, ignora este email
- Tu contraseña actual permanece segura hasta que la cambies

Si tienes problemas con el enlace, contacta a nuestro equipo de soporte.

Saludos,
El equipo de Aprende y Aplica IA
        `;
    }

    /**
     * Verifica la configuración del servicio de email
     * @returns {boolean} True si está configurado correctamente
     */
    isConfigured() {
        return !!(
            process.env.SMTP_HOST &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS &&
            this.transporter
        );
    }
}

module.exports = new EmailService();
