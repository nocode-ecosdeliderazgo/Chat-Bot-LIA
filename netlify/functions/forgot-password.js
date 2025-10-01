// Netlify Function para recuperación de contraseña
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const emailService = require('../../src/utils/email-service');

// Configuración de CORS
const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Función de respuesta JSON con CORS
function json(statusCode, body, event) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...cors
        },
        body: JSON.stringify(body)
    };
}

// Rate limiting básico (en memoria)
const attempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 3;

function isRateLimited(ip) {
    const now = Date.now();
    const userAttempts = attempts.get(ip) || [];

    // Limpiar intentos antiguos
    const recentAttempts = userAttempts.filter(time => now - time < RATE_LIMIT_WINDOW);
    attempts.set(ip, recentAttempts);

    return recentAttempts.length >= MAX_ATTEMPTS;
}

function recordAttempt(ip) {
    const now = Date.now();
    const userAttempts = attempts.get(ip) || [];
    userAttempts.push(now);
    attempts.set(ip, userAttempts);
}

exports.handler = async (event, context) => {
    // Manejar OPTIONS para CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: cors,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return json(405, { error: 'Método no permitido' }, event);
    }

    try {
        // Rate limiting
        const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';

        if (isRateLimited(clientIP)) {
            return json(429, {
                error: 'Demasiados intentos de recuperación de contraseña. Inténtalo más tarde.'
            }, event);
        }

        const { email } = JSON.parse(event.body || '{}');

        if (!email) {
            recordAttempt(clientIP);
            return json(400, { error: 'Email es requerido' }, event);
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            recordAttempt(clientIP);
            return json(400, { error: 'Formato de email inválido' }, event);
        }

        // Configurar Supabase
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Configuración de Supabase faltante');
            return json(500, { error: 'Error de configuración del servidor' }, event);
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verificar si el usuario existe
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, username')
            .eq('email', email.toLowerCase())
            .single();

        if (userError && userError.code !== 'PGRST116') {
            console.error('Error verificando usuario:', userError);
            recordAttempt(clientIP);
            return json(500, { error: 'Error del servidor' }, event);
        }

        // Por seguridad, siempre devolvemos el mismo mensaje
        const successMessage = 'Si el correo está registrado, recibirás un enlace de recuperación';

        if (!userData) {
            // Usuario no existe, pero no lo revelamos
            recordAttempt(clientIP);
            return json(200, { message: successMessage }, event);
        }

        // Intentar enviar email de recuperación con Supabase Auth
        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${event.headers.origin || 'https://coach-lia-ia.netlify.app'}/src/login/reset-password.html`
            });

            if (!resetError) {
                recordAttempt(clientIP);
                return json(200, {
                    message: 'Se ha enviado un enlace de recuperación a tu correo electrónico'
                }, event);
            } else {
                // Detectar si el error es porque Email logins está deshabilitado
                const isEmailLoginsDisabled = resetError.message && (
                    resetError.message.includes('Email logins are disabled') ||
                    resetError.message.includes('Email login is disabled') ||
                    resetError.message.includes('email provider is disabled')
                );

                if (isEmailLoginsDisabled) {
                    console.log('ℹ️ Supabase Email Provider no habilitado, usando sistema de tokens propio...');
                } else {
                    console.warn('Error Supabase reset password:', resetError.message);
                }
            }
        } catch (supabaseError) {
            // Solo registrar como advertencia si no es el error esperado
            const isExpectedError = supabaseError.message && (
                supabaseError.message.includes('Email logins are disabled') ||
                supabaseError.message.includes('Email login is disabled') ||
                supabaseError.message.includes('email provider is disabled')
            );

            if (isExpectedError) {
                console.log('ℹ️ Supabase Email Provider no configurado, usando sistema de tokens propio...');
            } else {
                console.warn('Error con Supabase Auth:', supabaseError.message);
            }
        }

        // Generar token de recuperación
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

        try {
            // Crear tabla si no existe
            const { error: tableError } = await supabase.rpc('exec_sql', {
                sql: `
                    CREATE TABLE IF NOT EXISTS password_reset_tokens (
                        email VARCHAR(255) PRIMARY KEY,
                        token VARCHAR(255) NOT NULL,
                        expires_at TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                `
            });

            if (tableError) {
                console.warn('No se pudo crear tabla password_reset_tokens:', tableError.message);
            }

            // Guardar token
            const { error: insertError } = await supabase
                .from('password_reset_tokens')
                .upsert({
                    email: email.toLowerCase(),
                    token: resetToken,
                    expires_at: resetTokenExpiry.toISOString(),
                    created_at: new Date().toISOString()
                });

            if (insertError) {
                console.warn('Error guardando token:', insertError.message);
            }
        } catch (tokenError) {
            console.warn('Error con tokens de recuperación:', tokenError.message);
        }

        // 🚨 ENVIAR EMAIL REAL CON EL TOKEN
        try {
            if (emailService.isConfigured()) {
                console.log(`📧 Intentando enviar email de recuperación a ${email}...`);

                await emailService.sendPasswordResetEmail(
                    email,
                    resetToken,
                    userData.username || email.split('@')[0]
                );

                console.log(`✅ Email de recuperación enviado exitosamente a ${email}`);
                recordAttempt(clientIP);
                return json(200, {
                    message: 'Se ha enviado un enlace de recuperación a tu correo electrónico'
                }, event);
            } else {
                console.error('⚠️ Servicio de email no configurado - Verifica variables SMTP_*');

                // En modo desarrollo, log del token
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`🔐 [DEV MODE] Token de recuperación para ${email}: ${resetToken}`);
                    console.log(`🔗 [DEV MODE] URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/src/login/new-auth.html?token=${resetToken}`);
                }

                recordAttempt(clientIP);
                return json(200, {
                    message: 'Se ha enviado un enlace de recuperación a tu correo electrónico'
                }, event);
            }
        } catch (emailError) {
            console.error('❌ Error enviando email de recuperación:', emailError);

            // En modo desarrollo, mostrar el token
            if (process.env.NODE_ENV !== 'production') {
                console.log(`🔐 [DEV MODE] Token de recuperación para ${email}: ${resetToken}`);
                console.log(`🔗 [DEV MODE] URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/src/login/new-auth.html?token=${resetToken}`);
            }

            // No revelar el error al usuario por seguridad
            recordAttempt(clientIP);
            return json(200, {
                message: 'Se ha enviado un enlace de recuperación a tu correo electrónico'
            }, event);
        }

    } catch (error) {
        console.error('Error en forgot-password:', error);
        return json(500, { error: 'Error interno del servidor' }, event);
    }
};