/**
 * Script para diagnosticar y configurar roles Zoom en Supabase
 * Ejecutar: node scripts/init-zoom-supabase.js
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configuración de Supabase
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    let client;
    try {
        client = await pool.connect();
        console.log('🔗 Conectado a Supabase');

        // 1. DIAGNÓSTICO: Verificar usuarios actuales
        console.log('\n📊 DIAGNÓSTICO DE USUARIOS:');
        const users = await client.query(`
            SELECT 
                id, 
                username, 
                email, 
                cargo_rol, 
                role_zoom,
                first_name,
                last_name
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        console.log(`Total usuarios: ${users.rows.length}\n`);
        users.rows.forEach((user, i) => {
            console.log(`${i+1}. ${user.username || user.email || 'Sin nombre'}`);
            console.log(`   UUID: ${user.id}`);
            console.log(`   Cargo: ${user.cargo_rol || 'NULL'}`);
            console.log(`   Zoom Role: ${user.role_zoom || 'NULL'}`);
            console.log('');
        });

        // 2. CONFIGURACIÓN: Asignar roles según cargo
        console.log('🔧 CONFIGURANDO ROLES ZOOM:');

        // Hosts: administradores e instructores
        const hostUpdate = await client.query(`
            UPDATE users 
            SET role_zoom = 'host' 
            WHERE cargo_rol IN ('administrador', 'instructor')
            RETURNING username, cargo_rol
        `);

        console.log(`👑 HOSTS configurados: ${hostUpdate.rows.length}`);
        hostUpdate.rows.forEach(user => {
            console.log(`   - ${user.username} (${user.cargo_rol})`);
        });

        // Participants: usuarios normales y NULL
        const participantUpdate = await client.query(`
            UPDATE users 
            SET role_zoom = 'participant' 
            WHERE cargo_rol = 'usuario' OR cargo_rol IS NULL OR role_zoom IS NULL
            RETURNING username, cargo_rol
        `);

        console.log(`👥 PARTICIPANTS configurados: ${participantUpdate.rows.length}`);
        participantUpdate.rows.forEach(user => {
            console.log(`   - ${user.username} (${user.cargo_rol || 'usuario'})`);
        });

        // 3. VERIFICACIÓN FINAL
        console.log('\n✅ CONFIGURACIÓN FINAL:');
        const finalCheck = await client.query(`
            SELECT 
                role_zoom,
                COUNT(*) as count,
                STRING_AGG(username, ', ') as examples
            FROM users 
            GROUP BY role_zoom
            ORDER BY role_zoom
        `);

        finalCheck.rows.forEach(row => {
            console.log(`${row.role_zoom || 'NULL'}: ${row.count} usuarios`);
            if (row.examples) {
                const names = row.examples.split(', ').slice(0, 3);
                console.log(`   Ejemplos: ${names.join(', ')}`);
            }
        });

        // 4. PRUEBA DE FUNCIÓN DEL SERVIDOR
        console.log('\n🧪 PRUEBA DE getUserZoomRole():');
        
        // Tomar primer usuario de cada tipo para probar
        const testUsers = await client.query(`
            (SELECT id, username, role_zoom FROM users WHERE role_zoom = 'host' LIMIT 1)
            UNION ALL
            (SELECT id, username, role_zoom FROM users WHERE role_zoom = 'participant' LIMIT 1)
        `);

        for (const testUser of testUsers.rows) {
            // Simular la función del servidor
            const result = await client.query('SELECT role_zoom FROM users WHERE id = $1', [testUser.id]);
            const returnedRole = result.rows[0]?.role_zoom || 'participant';
            
            const status = returnedRole === testUser.role_zoom ? '✅' : '❌';
            console.log(`${status} Usuario: ${testUser.username}`);
            console.log(`   ID: ${testUser.id}`);
            console.log(`   Esperado: ${testUser.role_zoom}`);
            console.log(`   Obtenido: ${returnedRole}`);
            console.log('');
        }

        // 5. INSTRUCCIONES FINALES
        console.log('🎯 PRÓXIMOS PASOS:');
        console.log('1. Reinicia el servidor: npm run dev');
        console.log('2. Inicia sesión con usuario ADMINISTRADOR o INSTRUCTOR');
        console.log('3. Ve a la página de chat');
        console.log('4. Haz clic en "Unirse a Video Sesión"');
        console.log('5. Deberías ver los controles de HOST (cámara, micrófono, grabación)');
        console.log('');
        console.log('🐛 DEBUG:');
        console.log('- Abre DevTools (F12) en el navegador');
        console.log('- Ve a la consola');
        console.log('- Busca mensajes como:');
        console.log('  "👤 Rol de usuario configurado: host"');
        console.log('  "🎛️ Controles configurados para rol: HOST"');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

// Función adicional para debug
async function debugSpecificUser(userId) {
    let client;
    try {
        client = await pool.connect();
        
        console.log(`🔍 DEBUG para usuario ID: ${userId}`);
        const user = await client.query(`
            SELECT id, username, email, cargo_rol, role_zoom 
            FROM users 
            WHERE id = $1
        `, [userId]);

        if (user.rows.length === 0) {
            console.log('❌ Usuario no encontrado');
            return;
        }

        const userData = user.rows[0];
        console.log('Datos del usuario:');
        console.log(`   ID: ${userData.id}`);
        console.log(`   Username: ${userData.username}`);
        console.log(`   Email: ${userData.email}`);
        console.log(`   Cargo: ${userData.cargo_rol}`);
        console.log(`   Zoom Role: ${userData.role_zoom}`);

        // Simular llamada a getUserZoomRole
        const roleResult = await client.query('SELECT role_zoom FROM users WHERE id = $1', [userId]);
        const role = roleResult.rows[0]?.role_zoom || 'participant';
        console.log(`   getUserZoomRole() retornaría: ${role}`);

    } catch (error) {
        console.error('❌ Error en debug:', error);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args[0] === '--debug' && args[1]) {
    debugSpecificUser(args[1]);
} else if (args[0] === '--help') {
    console.log(`
🔧 Script de Zoom Roles para Supabase

Uso:
  node scripts/init-zoom-supabase.js              # Configurar todos los roles
  node scripts/init-zoom-supabase.js --debug ID   # Debug de usuario específico
  node scripts/init-zoom-supabase.js --help       # Mostrar ayuda

Descripción:
  Configura roles de Zoom basándose en cargo_rol:
  - administrador/instructor → host
  - usuario/null → participant
    `);
} else {
    main();
}