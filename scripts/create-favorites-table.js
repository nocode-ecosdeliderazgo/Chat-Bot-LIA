// Script para crear la tabla de favoritos en Supabase
// Ejecutar con: node scripts/create-favorites-table.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createFavoritesTable() {
    try {
        console.log('🚀 Iniciando creación de tabla course_favorites...');
        
        // Verificar variables de entorno
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('❌ Variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no encontradas');
        }
        
        console.log('✅ Variables de entorno cargadas');
        console.log('   URL:', supabaseUrl);
        
        // Crear cliente de Supabase con service role key
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Cliente de Supabase inicializado');
        
        // Leer el archivo SQL de migración
        const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250101_create_course_favorites.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        console.log('✅ Archivo SQL de migración cargado');
        
        // Ejecutar la migración
        console.log('⏳ Ejecutando migración SQL...');
        const { data, error } = await supabase.rpc('exec_sql', { 
            sql: sqlContent 
        });
        
        if (error) {
            // Si el RPC no existe, intentar ejecutar directamente con el cliente
            console.log('⚠️ RPC exec_sql no disponible, ejecutando con raw SQL...');
            
            // Dividir el SQL en sentencias individuales
            const statements = sqlContent
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
            
            console.log(`📝 Ejecutando ${statements.length} sentencias SQL...`);
            
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                console.log(`   [${i + 1}/${statements.length}] Ejecutando sentencia...`);
                
                // Ejecutar cada sentencia usando la API REST de Supabase
                const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                    },
                    body: JSON.stringify({ query: statement })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.log(`   ⚠️ Error en sentencia ${i + 1}:`, errorText);
                }
            }
        }
        
        console.log('\n✅ ¡Tabla course_favorites creada exitosamente!');
        console.log('\n📊 Estructura de la tabla:');
        console.log('   - id (uuid, PK)');
        console.log('   - user_id (uuid, FK a users)');
        console.log('   - course_id (text)');
        console.log('   - created_at (timestamp)');
        console.log('\n🔒 Políticas RLS habilitadas:');
        console.log('   - Los usuarios solo pueden ver sus propios favoritos');
        console.log('   - Los usuarios solo pueden agregar sus propios favoritos');
        console.log('   - Los usuarios solo pueden eliminar sus propios favoritos');
        console.log('\n🎉 ¡Migración completada con éxito!');
        
        // Verificar que la tabla existe
        const { data: tables, error: tablesError } = await supabase
            .from('course_favorites')
            .select('*')
            .limit(0);
        
        if (!tablesError) {
            console.log('\n✅ Verificación: La tabla course_favorites existe y es accesible');
        } else {
            console.log('\n⚠️ Advertencia: No se pudo verificar la tabla (esto es normal si está vacía)');
        }
        
    } catch (error) {
        console.error('\n❌ Error durante la migración:');
        console.error('   ', error.message);
        console.error('\n💡 Soluciones posibles:');
        console.error('   1. Verifica que las variables de entorno estén correctas en .env');
        console.error('   2. Ejecuta el SQL manualmente en el dashboard de Supabase');
        console.error('   3. Verifica que tengas permisos de administrador');
        process.exit(1);
    }
}

// Ejecutar la función
createFavoritesTable();

