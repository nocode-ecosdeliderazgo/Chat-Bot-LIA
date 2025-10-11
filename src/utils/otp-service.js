const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class OTPService {
    constructor() {
        this.rateLimitWindow = 15 * 60 * 1000; // 15 minutos
        this.maxAttempts = 5; // Máximo 5 intentos por ventana
        this.maxResends = 3; // Máximo 3 reenvíos por ventana
        this.otpExpiration = 15 * 60 * 1000; // 15 minutos
    }

    /**
     * Genera un código OTP seguro de 6 dígitos
     * @returns {string} Código OTP de 6 dígitos
     */
    generateOTP() {
        // Usar crypto.randomInt para mayor seguridad
        return crypto.randomInt(100000, 999999).toString();
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
     * Crea un nuevo OTP en la base de datos
     * @param {Object} pool - Pool de conexión a la BD
     * @param {string} userId - ID del usuario
     * @param {string} purpose - Propósito del OTP ('verify_email')
     * @returns {Promise<Object>} Información del OTP creado
     */
    async createOTP(pool, userId, purpose = 'verify_email') {
        const otp = this.generateOTP();
        const hash = await this.hashOTP(otp);
        const expiresAt = new Date(Date.now() + this.otpExpiration);

        try {
            // Limpiar OTPs expirados del usuario
            await this.cleanExpiredOTPs(pool, userId, purpose);

            // Verificar rate limiting
            const canCreate = await this.checkRateLimit(pool, userId, purpose);
            if (!canCreate) {
                throw new Error('Demasiados intentos. Espera 15 minutos antes de solicitar otro código.');
            }

            // Insertar nuevo OTP
            const query = `
                INSERT INTO email_otp (user_id, purpose, code_hash, expires_at, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING id, created_at, expires_at
            `;

            const result = await pool.query(query, [userId, purpose, hash, expiresAt]);

            // console.log('🔐 OTP creado:', {
                userId: userId,
                purpose: purpose,
                expiresAt: expiresAt,
                otpId: result.rows[0].id
            });

            // NO loggear el código en claro por seguridad
            return {
                success: true,
                otpId: result.rows[0].id,
                expiresAt: expiresAt,
                otp: otp // Solo retornar para envío inmediato
            };
        } catch (error) {
            console.error('❌ Error creando OTP:', error);
            throw error;
        }
    }

    /**
     * Verifica un código OTP
     * @param {Object} pool - Pool de conexión a la BD
     * @param {string} userId - ID del usuario
     * @param {string} otp - Código OTP a verificar
     * @param {string} purpose - Propósito del OTP
     * @returns {Promise<Object>} Resultado de la verificación
     */
    async verifyOTP(pool, userId, otp, purpose = 'verify_email') {
        try {
            // Buscar OTP válido y no usado
            const query = `
                SELECT id, code_hash, expires_at, used_at, attempts
                FROM email_otp
                WHERE user_id = $1 
                AND purpose = $2 
                AND used_at IS NULL 
                AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1
            `;

            const result = await pool.query(query, [userId, purpose]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Código no encontrado o expirado'
                };
            }

            const otpRecord = result.rows[0];

            // Verificar intentos máximos
            if (otpRecord.attempts >= this.maxAttempts) {
                return {
                    success: false,
                    error: 'Demasiados intentos fallidos. Solicita un nuevo código.'
                };
            }

            // Verificar si el código coincide
            const isValid = await this.verifyOTP(otp, otpRecord.code_hash);

            if (!isValid) {
                // Incrementar contador de intentos
                await this.incrementAttempts(pool, otpRecord.id);
                return {
                    success: false,
                    error: 'Código incorrecto'
                };
            }

            // Marcar como usado
            await this.markAsUsed(pool, otpRecord.id);

            // console.log('✅ OTP verificado exitosamente:', {
                userId: userId,
                purpose: purpose,
                otpId: otpRecord.id
            });

            return {
                success: true,
                message: 'Código verificado correctamente'
            };

        } catch (error) {
            console.error('❌ Error verificando OTP:', error);
            return {
                success: false,
                error: 'Error interno verificando código'
            };
        }
    }

    /**
     * Incrementa el contador de intentos fallidos
     * @param {Object} pool - Pool de conexión
     * @param {string} otpId - ID del OTP
     */
    async incrementAttempts(pool, otpId) {
        const query = `
            UPDATE email_otp 
            SET attempts = attempts + 1 
            WHERE id = $1
        `;
        await pool.query(query, [otpId]);
    }

    /**
     * Marca un OTP como usado
     * @param {Object} pool - Pool de conexión
     * @param {string} otpId - ID del OTP
     */
    async markAsUsed(pool, otpId) {
        const query = `
            UPDATE email_otp 
            SET used_at = NOW() 
            WHERE id = $1
        `;
        await pool.query(query, [otpId]);
    }

    /**
     * Limpia OTPs expirados
     * @param {Object} pool - Pool de conexión
     * @param {string} userId - ID del usuario
     * @param {string} purpose - Propósito del OTP
     */
    async cleanExpiredOTPs(pool, userId, purpose) {
        const query = `
            DELETE FROM email_otp 
            WHERE user_id = $1 
            AND purpose = $2 
            AND expires_at <= NOW()
        `;
        await pool.query(query, [userId, purpose]);
    }

    /**
     * Verifica rate limiting para creación de OTPs
     * @param {Object} pool - Pool de conexión
     * @param {string} userId - ID del usuario
     * @param {string} purpose - Propósito del OTP
     * @returns {Promise<boolean>} True si puede crear nuevo OTP
     */
    async checkRateLimit(pool, userId, purpose) {
        const windowStart = new Date(Date.now() - this.rateLimitWindow);

        // Verificar OTPs creados en la ventana de tiempo
        const createQuery = `
            SELECT COUNT(*) as count
            FROM email_otp
            WHERE user_id = $1 
            AND purpose = $2 
            AND created_at >= $3
        `;

        const createResult = await pool.query(createQuery, [userId, purpose, windowStart]);
        const createCount = parseInt(createResult.rows[0].count);

        if (createCount >= this.maxResends) {
            return false;
        }

        return true;
    }

    /**
     * Obtiene estadísticas de OTPs para un usuario
     * @param {Object} pool - Pool de conexión
     * @param {string} userId - ID del usuario
     * @param {string} purpose - Propósito del OTP
     * @returns {Promise<Object>} Estadísticas
     */
    async getOTPStats(pool, userId, purpose) {
        const query = `
            SELECT 
                COUNT(*) as total_otps,
                COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END) as used_otps,
                COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_otps,
                COUNT(CASE WHEN attempts >= $3 THEN 1 END) as blocked_otps,
                MAX(created_at) as last_created
            FROM email_otp
            WHERE user_id = $1 AND purpose = $2
        `;

        const result = await pool.query(query, [userId, purpose, this.maxAttempts]);
        return result.rows[0];
    }

    /**
     * Valida formato de OTP
     * @param {string} otp - Código OTP a validar
     * @returns {boolean} True si el formato es válido
     */
    validateOTPFormat(otp) {
        return /^\d{6}$/.test(otp);
    }

    /**
     * Genera un token de sesión temporal para verificación
     * @param {string} userId - ID del usuario
     * @param {string} purpose - Propósito
     * @returns {string} Token temporal
     */
    generateTempToken(userId, purpose) {
        const data = {
            userId: userId,
            purpose: purpose,
            timestamp: Date.now(),
            random: crypto.randomBytes(16).toString('hex')
        };
        return Buffer.from(JSON.stringify(data)).toString('base64');
    }

    /**
     * Decodifica un token temporal
     * @param {string} token - Token a decodificar
     * @returns {Object|null} Datos del token o null si es inválido
     */
    decodeTempToken(token) {
        try {
            const decoded = Buffer.from(token, 'base64').toString();
            return JSON.parse(decoded);
        } catch (error) {
            return null;
        }
    }
}

module.exports = new OTPService();
