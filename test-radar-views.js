// Test script para verificar las vistas de radar
const { Pool } = require('pg');

// Configuración de la base de datos (ajustar según tu configuración)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/your_database',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testRadarViews() {
    try {
        console.log('🔍 Iniciando test de vistas de radar...');
        
        // 1. Verificar conexión a la base de datos
        console.log('📡 Probando conexión a la base de datos...');
        const connectionTest = await pool.query('SELECT NOW() as current_time');
        console.log('✅ Conexión exitosa:', connectionTest.rows[0].current_time);
        
        // 2. Verificar si las vistas existen
        console.log('🔍 Verificando si las vistas existen...');
        const viewCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public' 
            AND table_name IN ('v_radar_latest_by_user', 'v_radar_by_session', 'v_radar_stats')
        `);
        
        console.log('📊 Vistas encontradas:', viewCheck.rows.map(r => r.table_name));
        
        // 3. Si las vistas no existen, crearlas
        if (viewCheck.rows.length === 0) {
            console.log('🔧 Creando vistas de radar...');
            const fs = require('fs');
            const path = require('path');
            const sqlPath = path.join(__dirname, 'create_radar_views.sql');
            
            if (!fs.existsSync(sqlPath)) {
                console.error('❌ Archivo create_radar_views.sql no encontrado');
                return;
            }
            
            const sqlContent = fs.readFileSync(sqlPath, 'utf8');
            await pool.query(sqlContent);
            console.log('✅ Vistas creadas exitosamente');
        }
        
        // 4. Verificar que las vistas funcionan
        console.log('🔍 Probando consulta a v_radar_latest_by_user...');
        const testQuery = await pool.query('SELECT COUNT(*) as total FROM v_radar_latest_by_user');
        console.log('📊 Total de registros en v_radar_latest_by_user:', testQuery.rows[0].total);
        
        // 5. Verificar estructura de la vista
        console.log('🔍 Verificando estructura de la vista...');
        const structureQuery = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'v_radar_latest_by_user' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        
        console.log('📊 Estructura de v_radar_latest_by_user:');
        structureQuery.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
        
        // 6. Verificar si hay datos de prueba
        console.log('🔍 Verificando datos de prueba...');
        const testUserQuery = await pool.query(`
            SELECT * FROM v_radar_latest_by_user 
            WHERE user_id IN ('test-user-uuid', '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0')
            LIMIT 5
        `);
        
        console.log('📊 Datos de prueba encontrados:', testUserQuery.rows.length);
        if (testUserQuery.rows.length > 0) {
            console.log('📊 Ejemplo de datos:', testUserQuery.rows[0]);
        }
        
        console.log('✅ Test completado exitosamente');
        
    } catch (error) {
        console.error('❌ Error en test:', error);
        console.error('❌ Stack trace:', error.stack);
    } finally {
        await pool.end();
    }
}

// Ejecutar el test
testRadarViews();
