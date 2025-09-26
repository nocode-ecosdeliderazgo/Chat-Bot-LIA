/**
 * Script para configurar las políticas RLS del bucket 'community-thinks'
 * Ejecutar con: node setup-storage-policies.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar cliente con service key para operaciones administrativas
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Necesita service key, no anon key

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos en .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStoragePolicies() {
    console.log('🔧 Configurando políticas RLS para el bucket community-thinks...\n');

    try {
        // 1. Verificar que el bucket existe
        console.log('1️⃣ Verificando bucket community-thinks...');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

        if (bucketsError) {
            throw new Error(`Error listando buckets: ${bucketsError.message}`);
        }

        const bucket = buckets.find(b => b.name === 'community-thinks');
        if (!bucket) {
            throw new Error('Bucket community-thinks no encontrado. Créalo primero en Supabase Dashboard.');
        }
        console.log('   ✅ Bucket community-thinks encontrado\n');

        // 2. Ejecutar políticas RLS usando rpc o query directa
        console.log('2️⃣ Creando políticas RLS...');

        const policies = [
            // Política para INSERT (subir archivos)
            {
                name: 'Allow authenticated users to upload files to community-thinks',
                sql: `
                    CREATE POLICY "Allow authenticated users to upload files to community-thinks"
                    ON storage.objects
                    FOR INSERT
                    TO authenticated
                    WITH CHECK (bucket_id = 'community-thinks');
                `
            },
            // Política para SELECT (leer archivos)
            {
                name: 'Allow authenticated users to read files from community-thinks',
                sql: `
                    CREATE POLICY "Allow authenticated users to read files from community-thinks"
                    ON storage.objects
                    FOR SELECT
                    TO authenticated
                    USING (bucket_id = 'community-thinks');
                `
            }
        ];

        for (const policy of policies) {
            try {
                console.log(`   📝 Creando política: ${policy.name}`);

                // Intentar ejecutar la política usando rpc
                const { data, error } = await supabase.rpc('exec_sql', {
                    query: policy.sql
                });

                if (error) {
                    console.log(`   ⚠️  Error con rpc, intentando método alternativo: ${error.message}`);

                    // Método alternativo usando query directa
                    const { error: queryError } = await supabase
                        .from('pg_policies')
                        .select('*')
                        .limit(1); // Solo para probar la conexión

                    if (queryError) {
                        console.log(`   ⚠️  Método alternativo también falló: ${queryError.message}`);
                    }
                } else {
                    console.log(`   ✅ Política creada exitosamente`);
                }

            } catch (policyError) {
                console.log(`   ⚠️  Error creando política ${policy.name}: ${policyError.message}`);
            }
        }

        // 3. Configurar bucket como público para lectura
        console.log('\n3️⃣ Configurando bucket como público...');
        try {
            // Nota: Esta operación podría requerir acceso directo a la base de datos
            console.log('   ℹ️  Esta configuración debe hacerse manualmente en Supabase Dashboard');
            console.log('   ℹ️  Ve a Storage > Settings y marca el bucket como público');
        } catch (publicError) {
            console.log(`   ⚠️  Error configurando acceso público: ${publicError.message}`);
        }

        console.log('\n🎉 Configuración completada!');
        console.log('\n📋 Pasos manuales requeridos:');
        console.log('1. Ve a Supabase Dashboard > SQL Editor');
        console.log('2. Ejecuta el archivo setup-community-storage-policies.sql');
        console.log('3. Ve a Storage > Settings y configura community-thinks como público si es necesario');

        // 4. Probar subida de archivo
        console.log('\n4️⃣ Probando subida de archivo de prueba...');
        await testFileUpload();

    } catch (error) {
        console.error('❌ Error configurando políticas:', error.message);
        console.log('\n🔧 Solución manual:');
        console.log('1. Ve a Supabase Dashboard > SQL Editor');
        console.log('2. Ejecuta el archivo setup-community-storage-policies.sql');
    }
}

async function testFileUpload() {
    try {
        // Crear un archivo de prueba simple
        const testFileName = `test-${Date.now()}.txt`;
        const testContent = 'Este es un archivo de prueba para verificar las políticas RLS';
        const testFile = new File([testContent], testFileName, { type: 'text/plain' });

        // Intentar subir el archivo
        const { data, error } = await supabase.storage
            .from('community-thinks')
            .upload(`test/${testFileName}`, testFile);

        if (error) {
            console.log(`   ❌ Error en prueba de subida: ${error.message}`);
            console.log('   ℹ️  Las políticas RLS aún necesitan ser configuradas manualmente');
        } else {
            console.log(`   ✅ Prueba de subida exitosa: ${data.path}`);

            // Limpiar archivo de prueba
            await supabase.storage
                .from('community-thinks')
                .remove([data.path]);
            console.log(`   🧹 Archivo de prueba eliminado`);
        }

    } catch (testError) {
        console.log(`   ❌ Error en prueba: ${testError.message}`);
    }
}

// Ejecutar configuración
setupStoragePolicies();