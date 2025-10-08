#!/usr/bin/env node

/**
 * Script para diagnosticar y configurar roles Zoom en la BD existente
 * Compatible con Supabase UUID y estructura actual
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configuración compatible con Supabase
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeZoomDatabase() {
    let client;
    try {
        client = await pool.connect();
        console.log('🔗 Conectado a la base de datos');

        // 1. Verificar usuarios existentes y sus roles actuales
        console.log('\n📊 DIAGNÓSTICO ACTUAL:');
        const currentUsers = await client.query(`
            SELECT id, username, email, cargo_rol, role_zoom, first_name, last_name 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        console.log(`📋 Total usuarios encontrados: ${currentUsers.rows.length}`);
        currentUsers.rows.forEach((user, index) => {
            console.log(`${index + 1}. Usuario: ${user.username || 'Sin username'}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email || 'Sin email'}`);
            console.log(`   Cargo: ${user.cargo_rol || 'Sin cargo'}`);
            console.log(`   Role Zoom: ${user.role_zoom || 'NULL'}`);
            console.log(`   Nombre: ${user.first_name || 'Sin nombre'} ${user.last_name || ''}`);
            console.log('   ---');
        });

        // 2. Actualizar roles de zoom basados en cargo_rol
        console.log('\n🔧 ACTUALIZANDO ROLES DE ZOOM:');
        
        // Configurar administradores e instructores como hosts
        const hostsResult = await client.query(`
            UPDATE users 
            SET role_zoom = 'host' 
            WHERE (cargo_rol = 'administrador' OR cargo_rol = 'instructor') 
            AND role_zoom IS DISTINCT FROM 'host'
            RETURNING id, username, cargo_rol, role_zoom
        `);
        
        console.log(`👑 Usuarios configurados como HOST: ${hostsResult.rows.length}`);
        hostsResult.rows.forEach(user => {
            console.log(`   - ${user.username} (${user.cargo_rol}) → HOST`);
        });

        // Configurar usuarios normales como participants
        const participantsResult = await client.query(`
            UPDATE users 
            SET role_zoom = 'participant' 
            WHERE cargo_rol = 'usuario' OR role_zoom IS NULL
            RETURNING id, username, cargo_rol, role_zoom
        `);
        
        console.log(`👥 Usuarios configurados como PARTICIPANT: ${participantsResult.rows.length}`);
        
        // 3. Crear tabla de sesiones de video
        console.log('📝 Creando tabla zoom_sessions...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS zoom_sessions (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(50) UNIQUE NOT NULL,
                host_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                start_time TIMESTAMP WITH TIME ZONE,
                end_time TIMESTAMP WITH TIME ZONE,
                status VARCHAR(20) DEFAULT 'scheduled',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // 4. Crear tabla de participantes
        console.log('📝 Creando tabla zoom_participants...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS zoom_participants (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(50) REFERENCES zoom_sessions(session_id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                join_time TIMESTAMP DEFAULT NOW(),
                leave_time TIMESTAMP,
                UNIQUE(session_id, user_id)
            )
        `);
        
        // 5. Crear tabla de grabaciones
        console.log('📝 Creando tabla zoom_recordings...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS zoom_recordings (
                id SERIAL PRIMARY KEY,
                recording_id VARCHAR(100) UNIQUE NOT NULL,
                session_id VARCHAR(50) REFERENCES zoom_sessions(session_id) ON DELETE CASCADE,
                host_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                file_path VARCHAR(500),
                file_size BIGINT,
                start_time TIMESTAMP DEFAULT NOW(),
                end_time TIMESTAMP,
                status VARCHAR(20) DEFAULT 'recording',
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // 6. Crear índices para optimización
        console.log('📝 Creando índices para optimización...');
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_role_zoom ON users(role_zoom);
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_zoom_sessions_host_id ON zoom_sessions(host_id);
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_zoom_sessions_status ON zoom_sessions(status);
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_zoom_participants_session_id ON zoom_participants(session_id);
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_zoom_participants_user_id ON zoom_participants(user_id);
        `);
        
        // 7. Verificar estructura creada
        console.log('🔍 Verificando estructura creada...');
        
        // Verificar campo role_zoom
        const roleZoomCheck = await pool.query(`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'role_zoom'
        `);
        
        if (roleZoomCheck.rows.length > 0) {
            console.log('   ✅ Campo role_zoom creado correctamente');
            console.log(`      Tipo: ${roleZoomCheck.rows[0].data_type}`);
            console.log(`      Default: ${roleZoomCheck.rows[0].column_default}`);
        } else {
            console.warn('   ⚠️ Campo role_zoom no encontrado');
        }
        
        // Verificar tablas
        const tables = ['zoom_sessions', 'zoom_participants', 'zoom_recordings'];
        for (const tableName of tables) {
            const tableCheck = await pool.query(`
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = $1
            `, [tableName]);
            
            if (tableCheck.rows.length > 0) {
                console.log(`   ✅ Tabla ${tableName} creada correctamente`);
            } else {
                console.warn(`   ⚠️ Tabla ${tableName} no encontrada`);
            }
        }
        
        // 8. Mostrar estadísticas
        console.log('📊 Estadísticas actuales:');
        
        const userStats = await pool.query(`
            SELECT 
                COUNT(*) as total_usuarios,
                COUNT(CASE WHEN role_zoom = 'host' THEN 1 END) as hosts,
                COUNT(CASE WHEN role_zoom = 'participant' THEN 1 END) as participants
            FROM users
        `);
        
        if (userStats.rows.length > 0) {
            const stats = userStats.rows[0];
            console.log(`   👥 Total usuarios: ${stats.total_usuarios}`);
            console.log(`   🎤 Hosts: ${stats.hosts}`);
            console.log(`   👂 Participants: ${stats.participants}`);
        }
        
        const sessionStats = await pool.query(`SELECT COUNT(*) as total_sessions FROM zoom_sessions`);
        console.log(`   📺 Sesiones de video: ${sessionStats.rows[0].total_sessions}`);
        
        console.log('\n✅ Base de datos para Zoom Video SDK inicializada correctamente');
        console.log('📋 Estructura creada:');
        console.log('   • Campo users.role_zoom (host/participant)');
        console.log('   • Tabla zoom_sessions (sesiones de video)');
        console.log('   • Tabla zoom_participants (participantes)');
        console.log('   • Tabla zoom_recordings (grabaciones)');
        console.log('   • Índices de optimización');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        throw error;
    }
}

// Función para asignar rol de host a un usuario específico
async function assignHostRole(userId) {
    try {
        console.log(`🎤 Asignando rol de host al usuario ${userId}...`);
        
        const result = await pool.query(`
            UPDATE users 
            SET role_zoom = 'host' 
            WHERE id = $1 
            RETURNING id, username, role_zoom
        `, [userId]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log(`✅ Usuario ${user.username || user.id} ahora es HOST`);
            return true;
        } else {
            console.warn(`⚠️ Usuario ${userId} no encontrado`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error asignando rol de host:`, error);
        return false;
    }
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    
    try {
        console.log('🚀 Coach LIA - Zoom Video SDK Database Initialization');
        console.log('🔗 Conectando a la base de datos...');
        
        // Probar conexión
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa a la base de datos\n');
        
        if (args.includes('--init') || args.length === 0) {
            await initializeZoomDatabase();
        }
        
        if (args.includes('--assign-host') && args.length > 1) {
            const userIdIndex = args.indexOf('--assign-host') + 1;
            if (userIdIndex < args.length) {
                const userId = parseInt(args[userIdIndex]);
                if (!isNaN(userId)) {
                    await assignHostRole(userId);
                } else {
                    console.error('❌ ID de usuario debe ser un número');
                }
            } else {
                console.error('❌ Falta ID de usuario después de --assign-host');
            }
        }
        
        if (args.includes('--help') || args.includes('-h')) {
            console.log('\n📖 Uso:');
            console.log('   node scripts/init-zoom-db.js              # Inicializar BD');
            console.log('   node scripts/init-zoom-db.js --init       # Inicializar BD');
            console.log('   node scripts/init-zoom-db.js --assign-host 1  # Asignar host a usuario ID 1');
            console.log('   node scripts/init-zoom-db.js --help       # Mostrar esta ayuda');
        }
        
    } catch (error) {
        console.error('💥 Error fatal:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('\n🔌 Conexión a BD cerrada');
    }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = {
    initializeZoomDatabase,
    assignHostRole
};