/**
 * Script para limpiar OTPs expirados automáticamente
 */

const { Pool } = require('pg');

class OTPCleanupService {
    constructor() {
        this.pool = null;
        this.cleanupInterval = null;
        this.initPool();
    }

    /**
     * Inicializa la conexión a la base de datos
     */
    initPool() {
        try {
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                }
            });

            console.log('✅ Servicio de limpieza de OTPs inicializado');
        } catch (error) {
            console.error('❌ Error inicializando pool de conexión:', error);
        }
    }

    /**
     * Limpia todos los OTPs expirados
     */
    async cleanupExpiredOTPs() {
        if (!this.pool) {
            console.warn('⚠️ Pool de conexión no disponible para limpieza');
            return;
        }

        try {
            const query = `
                DELETE FROM email_otp 
                WHERE expires_at <= NOW() 
                OR (used_at IS NOT NULL AND created_at < NOW() - INTERVAL '24 hours')
                OR attempts >= 5
            `;

            const result = await this.pool.query(query);
            
            if (result.rowCount > 0) {
                console.log(`🧹 Limpieza completada: ${result.rowCount} OTPs expirados eliminados`);
            } else {
                console.log('🧹 No se encontraron OTPs para limpiar');
            }

        } catch (error) {
            console.error('❌ Error en limpieza de OTPs:', error);
        }
    }

    /**
     * Inicia el servicio de limpieza automática
     * @param {number} intervalMinutes - Intervalo en minutos (default: 15)
     */
    startAutoCleanup(intervalMinutes = 15) {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        // Ejecutar limpieza inmediatamente
        this.cleanupExpiredOTPs();

        // Programar limpieza periódica
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredOTPs();
        }, intervalMinutes * 60 * 1000);

        console.log(`🔄 Servicio de limpieza automática iniciado (cada ${intervalMinutes} minutos)`);
    }

    /**
     * Detiene el servicio de limpieza automática
     */
    stopAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            console.log('🛑 Servicio de limpieza automática detenido');
        }
    }

    /**
     * Obtiene estadísticas de OTPs
     */
    async getOTPStats() {
        if (!this.pool) {
            return null;
        }

        try {
            const query = `
                SELECT 
                    COUNT(*) as total_otps,
                    COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END) as used_otps,
                    COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_otps,
                    COUNT(CASE WHEN attempts >= 5 THEN 1 END) as blocked_otps,
                    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as recent_otps
                FROM email_otp
            `;

            const result = await this.pool.query(query);
            return result.rows[0];

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de OTPs:', error);
            return null;
        }
    }

    /**
     * Cierra la conexión a la base de datos
     */
    async close() {
        this.stopAutoCleanup();
        
        if (this.pool) {
            await this.pool.end();
            console.log('🔌 Conexión a la base de datos cerrada');
        }
    }
}

// Crear instancia global
const otpCleanupService = new OTPCleanupService();

// Manejar señales de terminación
process.on('SIGINT', async () => {
    console.log('\n🛑 Recibida señal SIGINT, cerrando servicio...');
    await otpCleanupService.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Recibida señal SIGTERM, cerrando servicio...');
    await otpCleanupService.close();
    process.exit(0);
});

module.exports = otpCleanupService;
