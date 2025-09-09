// =====================================================
// SCRIPT: EJECUTAR MIGRACIÓN DE COLUMNAS DE ACTIVIDAD
// Agregar descripcion_actividad y prompts_actividad a module_videos
// =====================================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables de entorno de Supabase no configuradas');
    console.log('Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu archivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Iniciando migración para agregar columnas de actividad...');
    
    try {
        // Leer el archivo de migración SQL
        const migrationPath = path.join(__dirname, '..', 'database', 'add_activity_columns_migration.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📄 Archivo de migración cargado');
        
        // Ejecutar migración usando múltiples comandos
        console.log('🔧 Ejecutando ALTER TABLE para agregar descripcion_actividad...');
        
        const { data: result1, error: error1 } = await supabase
            .rpc('exec_sql', {
                query: 'ALTER TABLE public.module_videos ADD COLUMN IF NOT EXISTS descripcion_actividad TEXT;'
            });
        
        if (error1 && !error1.message.includes('already exists')) {
            console.error('❌ Error agregando descripcion_actividad:', error1);
        } else {
            console.log('✅ Columna descripcion_actividad agregada/verificada');
        }
        
        console.log('🔧 Ejecutando ALTER TABLE para agregar prompts_actividad...');
        
        const { data: result2, error: error2 } = await supabase
            .rpc('exec_sql', {
                query: 'ALTER TABLE public.module_videos ADD COLUMN IF NOT EXISTS prompts_actividad TEXT;'
            });
        
        if (error2 && !error2.message.includes('already exists')) {
            console.error('❌ Error agregando prompts_actividad:', error2);
        } else {
            console.log('✅ Columna prompts_actividad agregada/verificada');
        }
        
        // Verificar que las columnas se agregaron correctamente
        console.log('🔍 Verificando estructura de la tabla module_videos...');
        
        const { data: tableInfo, error: infoError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_name', 'module_videos')
            .in('column_name', ['descripcion_actividad', 'prompts_actividad']);
        
        if (infoError) {
            console.warn('⚠️  No se pudo verificar la estructura de la tabla:', infoError);
        } else {
            console.log('📊 Columnas encontradas:', tableInfo);
        }
        
        // Intentar hacer una consulta de prueba
        const { data: testData, error: testError } = await supabase
            .from('module_videos')
            .select('id, video_title, descripcion_actividad, prompts_actividad')
            .limit(1);
        
        if (testError) {
            console.error('❌ Error en consulta de prueba:', testError);
            throw testError;
        }
        
        console.log('✅ ¡Migración completada exitosamente!');
        console.log('📋 Consulta de prueba funcionando correctamente');
        
        if (testData && testData.length > 0) {
            console.log('📝 Datos de prueba:', testData[0]);
        }
        
    } catch (error) {
        console.error('💥 Error durante la migración:', error);
        process.exit(1);
    }
}

// Ejecutar la migración
runMigration();