/**
 * TEST DEL SISTEMA GENAI COMPLETO
 * ===============================
 * 
 * Script para verificar que todo el flujo del sistema GenAI funciona correctamente:
 * 1. Estructura de base de datos
 * 2. Endpoint de radar
 * 3. Conexión entre componentes
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de base de datos
const DB_CONFIG = {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/chat_bot_lia',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

async function testGenAISystem() {
    const client = new Client(DB_CONFIG);
    
    try {
        console.log('🔄 Conectando a la base de datos...');
        await client.connect();
        console.log('✅ Conectado a PostgreSQL');
        
        // 1. Verificar que existen las tablas GenAI
        console.log('\n📋 Verificando estructura de tablas GenAI...');
        
        const tables = ['genai_questions', 'genai_questionnaire_sessions', 'genai_user_responses', 'genai_radar_scores'];
        for (const table of tables) {
            const result = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                )
            `, [table]);
            
            if (result.rows[0].exists) {
                console.log(`✅ Tabla ${table} existe`);
            } else {
                console.log(`❌ Tabla ${table} NO existe`);
            }
        }
        
        // 2. Verificar ENUM genai_area y sus valores
        console.log('\n🏷️ Verificando ENUM genai_area...');
        
        const enumResult = await client.query(`
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (
                SELECT oid FROM pg_type WHERE typname = 'genai_area'
            )
            ORDER BY enumlabel
        `);
        
        if (enumResult.rows.length > 0) {
            console.log('✅ ENUM genai_area existe con valores:');
            enumResult.rows.forEach(row => {
                console.log(`   - ${row.enumlabel}`);
            });
        } else {
            console.log('❌ ENUM genai_area NO existe o no tiene valores');
        }
        
        // 3. Verificar si hay preguntas cargadas
        console.log('\n❓ Verificando preguntas cargadas...');
        
        const questionsCount = await client.query('SELECT COUNT(*) as total FROM genai_questions');
        console.log(`📊 Total de preguntas: ${questionsCount.rows[0].total}`);
        
        if (parseInt(questionsCount.rows[0].total) > 0) {
            // Mostrar resumen por área
            const areasSummary = await client.query(`
                SELECT area, block, COUNT(*) as count
                FROM genai_questions
                WHERE active = true
                GROUP BY area, block
                ORDER BY area, block
            `);
            
            console.log('📈 Resumen por área y bloque:');
            areasSummary.rows.forEach(row => {
                console.log(`   ${row.area} - ${row.block}: ${row.count} preguntas`);
            });
        }
        
        // 4. Verificar si existen usuarios y sesiones de prueba
        console.log('\n👥 Verificando sesiones GenAI...');
        
        const sessionsCount = await client.query('SELECT COUNT(*) as total FROM genai_questionnaire_sessions');
        console.log(`📊 Total de sesiones: ${sessionsCount.rows[0].total}`);
        
        const completedSessions = await client.query(`
            SELECT COUNT(*) as total 
            FROM genai_questionnaire_sessions 
            WHERE completed_at IS NOT NULL
        `);
        console.log(`✅ Sesiones completadas: ${completedSessions.rows[0].total}`);
        
        // 5. Verificar endpoint de radar (simular llamada)
        console.log('\n🎯 Verificando funcionalidad de radar...');
        
        if (parseInt(completedSessions.rows[0].total) > 0) {
            // Probar query del radar con una sesión existente
            const testRadar = await client.query(`
                SELECT 
                    gqs.id as session_id,
                    gqs.user_id,
                    gqs.genai_area,
                    gqs.total_score,
                    gqs.adoption_score,
                    gqs.knowledge_score,
                    gqs.classification,
                    gqs.completed_at,
                    COALESCE(
                        (SELECT score FROM genai_radar_scores 
                         WHERE session_id = gqs.id AND dimension = 'Adopción' 
                         ORDER BY created_at DESC LIMIT 1), 0
                    ) as adopcion_score,
                    COALESCE(
                        (SELECT score FROM genai_radar_scores 
                         WHERE session_id = gqs.id AND dimension = 'Conocimiento' 
                         ORDER BY created_at DESC LIMIT 1), 0
                    ) as conocimiento_score
                FROM genai_questionnaire_sessions gqs
                WHERE gqs.completed_at IS NOT NULL
                ORDER BY gqs.completed_at DESC
                LIMIT 1
            `);
            
            if (testRadar.rows.length > 0) {
                console.log('✅ Query de radar funciona correctamente');
                console.log('📊 Ejemplo de datos de radar:');
                console.log(`   Usuario: ${testRadar.rows[0].user_id}`);
                console.log(`   Área: ${testRadar.rows[0].genai_area}`);
                console.log(`   Score total: ${testRadar.rows[0].total_score}`);
                console.log(`   Clasificación: ${testRadar.rows[0].classification}`);
            } else {
                console.log('❌ No se pudieron obtener datos de radar');
            }
        } else {
            console.log('ℹ️ No hay sesiones completadas para probar el radar');
        }
        
        // 6. Verificar archivos frontend
        console.log('\n🌐 Verificando archivos frontend...');
        
        const frontendFiles = [
            'src/estadisticas.html',
            'src/q/genai-form.html',
            'src/q/genai-form.js',
            'src/perfil-cuestionario.js'
        ];
        
        frontendFiles.forEach(filePath => {
            const fullPath = path.join(__dirname, filePath);
            if (fs.existsSync(fullPath)) {
                console.log(`✅ ${filePath} existe`);
            } else {
                console.log(`❌ ${filePath} NO existe`);
            }
        });
        
        // 7. Verificar server endpoints
        console.log('\n🚀 Verificando configuración del servidor...');
        
        const serverPath = path.join(__dirname, 'server.js');
        if (fs.existsSync(serverPath)) {
            const serverContent = fs.readFileSync(serverPath, 'utf8');
            
            if (serverContent.includes('/api/genai-radar')) {
                console.log('✅ Endpoint /api/genai-radar configurado en server.js');
            } else {
                console.log('❌ Endpoint /api/genai-radar NO encontrado en server.js');
            }
            
            if (serverContent.includes('genai_questionnaire_sessions')) {
                console.log('✅ Referencias a tablas GenAI encontradas en server.js');
            } else {
                console.log('❌ Referencias a tablas GenAI NO encontradas en server.js');
            }
        }
        
        console.log('\n🎉 Verificación del sistema GenAI completada');
        
    } catch (error) {
        console.error('❌ Error durante la verificación:', error.message);
        console.error('🔍 Stack trace:', error.stack);
    } finally {
        await client.end();
        console.log('🔐 Conexión a base de datos cerrada');
    }
}

// Función para crear datos de prueba si no existen
async function createTestData() {
    const client = new Client(DB_CONFIG);
    
    try {
        await client.connect();
        console.log('🧪 Creando datos de prueba...');
        
        // Verificar si ya hay un usuario de prueba
        const testUser = await client.query(`
            SELECT id FROM users WHERE email = 'test.genai@example.com' LIMIT 1
        `);
        
        let userId;
        if (testUser.rows.length === 0) {
            // Crear usuario de prueba
            const newUser = await client.query(`
                INSERT INTO users (username, email, password_hash, display_name, created_at)
                VALUES ('test_genai', 'test.genai@example.com', '$2b$10$dummy.hash.for.testing', 'Usuario GenAI Test', NOW())
                RETURNING id
            `);
            userId = newUser.rows[0].id;
            console.log(`✅ Usuario de prueba creado con ID: ${userId}`);
        } else {
            userId = testUser.rows[0].id;
            console.log(`✅ Usuario de prueba existente con ID: ${userId}`);
        }
        
        // Crear sesión de prueba con datos realistas
        const testSession = await client.query(`
            INSERT INTO genai_questionnaire_sessions 
            (user_id, genai_area, total_score, adoption_score, knowledge_score, classification, started_at, completed_at)
            VALUES ($1, 'CEO/Alta Dirección', 67.5, 70.0, 65.0, 'Intermedio', NOW() - INTERVAL '1 hour', NOW())
            RETURNING id
        `, [userId]);
        
        const sessionId = testSession.rows[0].id;
        console.log(`✅ Sesión de prueba creada con ID: ${sessionId}`);
        
        // Crear radar scores de prueba
        await client.query(`
            INSERT INTO genai_radar_scores (session_id, user_id, genai_area, dimension, score, created_at)
            VALUES 
                ($1, $2, 'CEO/Alta Dirección', 'Adopción', 70.0, NOW()),
                ($1, $2, 'CEO/Alta Dirección', 'Conocimiento', 65.0, NOW())
        `, [sessionId, userId]);
        
        console.log('✅ Radar scores de prueba creados');
        console.log(`🎯 Puedes probar el radar en: http://localhost:3000/src/estadisticas.html`);
        console.log(`🔗 Endpoint de prueba: http://localhost:3000/api/genai-radar/${userId}`);
        
    } catch (error) {
        console.error('❌ Error creando datos de prueba:', error.message);
    } finally {
        await client.end();
    }
}

// Ejecutar el script
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'test-data') {
        createTestData();
    } else {
        testGenAISystem();
    }
}

module.exports = {
    testGenAISystem,
    createTestData
};