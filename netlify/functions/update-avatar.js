/**
 * NETLIFY FUNCTION: UPDATE AVATAR
 * ===============================
 * 
 * Función para actualizar la foto de perfil del usuario en la base de datos
 * Maneja tanto URLs de Supabase Storage como datos base64
 */

const { Pool } = require('pg');
const { createCorsResponse } = require('./cors-utils');

// Configuración de base de datos PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const json = (status, data, event = null) => createCorsResponse(status, data, event);

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
    if (event.httpMethod !== 'POST') return json(405, { error: 'Método no permitido' }, event);

    try {
        if (!process.env.DATABASE_URL) {
            return json(500, { error: 'Base de datos no configurada' }, event);
        }

        const { user_id, username, email, profile_picture_url } = JSON.parse(event.body || '{}');
        
        // Validaciones
        if (!profile_picture_url) {
            return json(400, { error: 'profile_picture_url es requerido' }, event);
        }

        if (!user_id && !username && !email) {
            return json(400, { error: 'Se requiere user_id, username o email para identificar al usuario' }, event);
        }

        console.log('🖼️ Actualizando avatar:', { 
            user_id: user_id ? user_id.substring(0, 8) + '...' : null, 
            username, 
            email,
            profile_picture_type: profile_picture_url.startsWith('data:') ? 'base64' : 'url',
            profile_picture_size: profile_picture_url.length
        });

        // Verificar que existe la columna profile_picture_url
        let hasProfilePictureUrl = false;
        try {
            const cols = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name = 'profile_picture_url'
            `);
            hasProfilePictureUrl = cols.rows.length > 0;
        } catch (e) {
            console.error('Error verificando columna profile_picture_url:', e);
        }

        if (!hasProfilePictureUrl) {
            // La columna no existe, necesitamos crearla
            try {
                await pool.query(`
                    ALTER TABLE users 
                    ADD COLUMN profile_picture_url TEXT
                `);
                console.log('✅ Columna profile_picture_url creada');
            } catch (alterError) {
                console.error('❌ Error creando columna profile_picture_url:', alterError);
                return json(500, { error: 'Error configurando base de datos para avatares' }, event);
            }
        }

        // Construir query de actualización usando múltiples identificadores
        let query, params;
        if (user_id) {
            query = 'UPDATE users SET profile_picture_url = $1 WHERE id = $2 RETURNING id, username, email, profile_picture_url';
            params = [profile_picture_url, user_id];
        } else if (username) {
            query = 'UPDATE users SET profile_picture_url = $1 WHERE username = $2 RETURNING id, username, email, profile_picture_url';
            params = [profile_picture_url, username];
        } else if (email) {
            query = 'UPDATE users SET profile_picture_url = $1 WHERE email = $2 RETURNING id, username, email, profile_picture_url';
            params = [profile_picture_url, email];
        }

        const result = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            return json(404, { error: 'Usuario no encontrado' }, event);
        }

        const updatedUser = result.rows[0];
        
        console.log('✅ Avatar actualizado correctamente:', {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            has_avatar: !!updatedUser.profile_picture_url,
            avatar_type: updatedUser.profile_picture_url?.startsWith('data:') ? 'base64' : 'url'
        });

        return json(200, { 
            ok: true, 
            message: 'Foto de perfil actualizada correctamente',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                profile_picture_url: updatedUser.profile_picture_url
            }
        }, event);

    } catch (error) {
        console.error('❌ Error actualizando avatar:', error);
        return json(500, { error: 'Error interno del servidor: ' + error.message }, event);
    }
};