// Netlify Function para restablecer contraseña
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuración de CORS
const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Función de respuesta JSON con CORS
function json(statusCode, body) {
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
const MAX_ATTEMPTS = 5;

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
        return json(405, { error: 'Método no permitido' });
    }

    try {
        // Rate limiting
        const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';

        if (isRateLimited(clientIP)) {
            return json(429, {
                error: 'Demasiados intentos. Inténtalo más tarde.'
            });
        }

        const { token, newPassword } = JSON.parse(event.body || '{}');

        // Validaciones
        if (!token || !newPassword) {
            recordAttempt(clientIP);
            return json(400, { error: 'Token y nueva contraseña son requeridos' });
        }

        if (newPassword.length < 8) {
            recordAttempt(clientIP);
            return json(400, { error: 'La contraseña debe tener al menos 8 caracteres' });
        }

        // Validación de fortaleza de contraseña
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            recordAttempt(clientIP);
            return json(400, {
                error: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
            });
        }

        // Configurar Supabase
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Configuración de Supabase faltante');
            return json(500, { error: 'Error de configuración del servidor' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verificar token en la base de datos
        const { data: tokenData, error: tokenError } = await supabase
            .from('password_reset_tokens')
            .select('email, expires_at, created_at')
            .eq('token', token)
            .single();

        if (tokenError || !tokenData) {
            console.warn('Token no encontrado o error:', tokenError?.message);
            recordAttempt(clientIP);
            return json(400, { error: 'Token inválido o expirado' });
        }

        // Verificar expiración del token
        const now = new Date();
        const expiresAt = new Date(tokenData.expires_at);

        if (expiresAt < now) {
            // Eliminar token expirado
            await supabase
                .from('password_reset_tokens')
                .delete()
                .eq('token', token);

            recordAttempt(clientIP);
            return json(400, { error: 'Token expirado. Solicita un nuevo enlace de recuperación.' });
        }

        // Verificar que el usuario existe
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', tokenData.email.toLowerCase())
            .single();

        if (userError || !userData) {
            console.error('Usuario no encontrado:', tokenData.email);
            recordAttempt(clientIP);
            return json(400, { error: 'Usuario no encontrado' });
        }

        // Generar hash de la nueva contraseña
        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Actualizar contraseña del usuario
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password_hash: passwordHash,
                updated_at: new Date().toISOString()
            })
            .eq('email', tokenData.email.toLowerCase());

        if (updateError) {
            console.error('Error actualizando contraseña:', updateError);
            recordAttempt(clientIP);
            return json(500, { error: 'Error actualizando contraseña' });
        }

        // Eliminar token usado (seguridad: un token solo se usa una vez)
        await supabase
            .from('password_reset_tokens')
            .delete()
            .eq('token', token);

        // Opcional: Invalidar todas las sesiones activas del usuario
        // Esto fuerza al usuario a iniciar sesión nuevamente con la nueva contraseña
        try {
            await supabase
                .from('user_sessions')
                .delete()
                .eq('user_id', userData.id);
        } catch (sessionError) {
            // No es crítico si falla, solo log
            console.warn('No se pudieron invalidar sesiones:', sessionError.message);
        }

        console.log(`✅ Contraseña actualizada exitosamente para ${tokenData.email}`);

        recordAttempt(clientIP);
        return json(200, {
            success: true,
            message: 'Contraseña actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.'
        });

    } catch (error) {
        console.error('❌ Error en reset-password:', error);
        return json(500, {
            error: 'Error interno del servidor. Inténtalo más tarde.'
        });
    }
};
