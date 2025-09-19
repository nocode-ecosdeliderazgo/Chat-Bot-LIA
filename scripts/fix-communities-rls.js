// =====================================================
// SCRIPT: Corregir Políticas RLS de Comunidades
// Configurar acceso público para lectura de comunidades
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables de entorno de Supabase no configuradas');
    console.error('SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ Faltante');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentPolicies() {
    console.log('🔍 Verificando políticas RLS actuales...');

    try {
        // Verificar si RLS está habilitado
        const { data: rlsStatus, error: rlsError } = await supabase
            .rpc('check_rls_enabled', { table_name: 'communities' });

        if (rlsError) {
            console.log('ℹ️  No se pudo verificar RLS status (función personalizada no existe)');
        } else {
            console.log('📊 RLS Status:', rlsStatus);
        }

        // Intentar consulta básica para ver comportamiento actual
        const { data: testData, error: testError } = await supabase
            .from('communities')
            .select('id, name, is_active')
            .limit(5);

        console.log('📊 Consulta de prueba con service key:');
        console.log('   - Registros encontrados:', testData?.length || 0);
        console.log('   - Error:', testError?.message || 'Ninguno');

        if (testData && testData.length > 0) {
            console.log('📋 Comunidades existentes:');
            testData.forEach(community => {
                console.log(`   • ${community.name} (${community.id}) - Activa: ${community.is_active}`);
            });
        }

    } catch (error) {
        console.error('❌ Error verificando políticas:', error.message);
    }
}

async function updateRLSPolicies() {
    console.log('🛠️ Configurando políticas RLS para acceso público...');

    const policies = [
        {
            name: 'Allow public read access to communities',
            sql: `
                DROP POLICY IF EXISTS "Communities are viewable by everyone" ON communities;
                CREATE POLICY "Communities are viewable by everyone" ON communities
                    FOR SELECT USING (true);
            `
        },
        {
            name: 'Allow authenticated users to insert communities',
            sql: `
                DROP POLICY IF EXISTS "Communities can be inserted by authenticated users" ON communities;
                CREATE POLICY "Communities can be inserted by authenticated users" ON communities
                    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
            `
        },
        {
            name: 'Allow authenticated users to update communities',
            sql: `
                DROP POLICY IF EXISTS "Communities can be updated by authenticated users" ON communities;
                CREATE POLICY "Communities can be updated by authenticated users" ON communities
                    FOR UPDATE USING (auth.uid() IS NOT NULL);
            `
        }
    ];

    for (const policy of policies) {
        try {
            console.log(`⚙️ Aplicando: ${policy.name}`);

            // Ejecutar el SQL de la política
            const { error } = await supabase.rpc('execute_sql', {
                sql_query: policy.sql
            });

            if (error) {
                console.warn(`⚠️ Error aplicando política '${policy.name}':`, error.message);
                console.log('📝 SQL que se intentó ejecutar:');
                console.log(policy.sql);
                console.log('');
            } else {
                console.log(`✅ Política '${policy.name}' aplicada correctamente`);
            }
        } catch (error) {
            console.warn(`⚠️ Error ejecutando '${policy.name}':`, error.message);
        }
    }
}

async function enableRLS() {
    console.log('🔐 Verificando que RLS esté habilitado...');

    try {
        const { error } = await supabase.rpc('execute_sql', {
            sql_query: 'ALTER TABLE communities ENABLE ROW LEVEL SECURITY;'
        });

        if (error && !error.message.includes('already enabled')) {
            console.warn('⚠️ Error habilitando RLS:', error.message);
        } else {
            console.log('✅ RLS habilitado en tabla communities');
        }
    } catch (error) {
        console.warn('⚠️ Error configurando RLS:', error.message);
    }
}

async function testPublicAccess() {
    console.log('🧪 Probando acceso público con clave anon...');

    // Crear cliente con clave anon para simular frontend
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd2J6b3RjdWF5d3BkYmlkcHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTEyMjksImV4cCI6MjA3MDE4NzIyOX0.IKXYAe1JBFc_pcaS6OjxKUVJePwnfHgc0sRO6WpJSBY';
    const anonClient = createClient(supabaseUrl, anonKey);

    try {
        const { data: publicData, error: publicError } = await anonClient
            .from('communities')
            .select('*')
            .eq('is_active', true)
            .order('name');

        console.log('📊 Resultado con clave anon:');
        console.log('   - Registros encontrados:', publicData?.length || 0);
        console.log('   - Error:', publicError?.message || 'Ninguno');

        if (publicData && publicData.length > 0) {
            console.log('✅ ¡Acceso público funciona correctamente!');
            console.log('📋 Comunidades visibles públicamente:');
            publicData.forEach(community => {
                console.log(`   • ${community.name} (${community.slug})`);
            });
            return true;
        } else {
            console.log('❌ El acceso público aún no funciona');
            return false;
        }

    } catch (error) {
        console.error('❌ Error en prueba de acceso público:', error.message);
        return false;
    }
}

async function manualPolicyInstructions() {
    console.log('\n📋 === INSTRUCCIONES MANUALES ===');
    console.log('Si las políticas automáticas no funcionaron, ejecuta estos comandos en el SQL Editor de Supabase:');
    console.log('');

    const manualSQL = `
-- 1. Habilitar RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON communities;
DROP POLICY IF EXISTS "Communities can be inserted by authenticated users" ON communities;
DROP POLICY IF EXISTS "Communities can be updated by authenticated users" ON communities;

-- 3. Crear nueva política de lectura pública
CREATE POLICY "Communities are viewable by everyone" ON communities
    FOR SELECT USING (true);

-- 4. Crear política de inserción para usuarios autenticados
CREATE POLICY "Communities can be inserted by authenticated users" ON communities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Crear política de actualización para usuarios autenticados
CREATE POLICY "Communities can be updated by authenticated users" ON communities
    FOR UPDATE USING (auth.uid() IS NOT NULL);
    `.trim();

    console.log(manualSQL);
    console.log('\n🌐 Ve a: https://miwbzotcuaywpdbidpwo.supabase.co/project/miwbzotcuaywpdbidpwo/sql');
    console.log('📝 Copia y pega el SQL de arriba');
    console.log('▶️ Ejecuta el comando');
}

async function main() {
    console.log('🚀 Iniciando corrección de políticas RLS...\n');

    try {
        // Paso 1: Verificar estado actual
        await checkCurrentPolicies();
        console.log('');

        // Paso 2: Habilitar RLS
        await enableRLS();
        console.log('');

        // Paso 3: Configurar políticas
        await updateRLSPolicies();
        console.log('');

        // Paso 4: Probar acceso público
        const publicAccessWorks = await testPublicAccess();
        console.log('');

        if (publicAccessWorks) {
            console.log('🎉 ¡Políticas RLS configuradas correctamente!');
            console.log('✅ Las comunidades ahora deberían aparecer en el frontend');
        } else {
            console.log('⚠️ Las políticas automáticas no funcionaron completamente');
            await manualPolicyInstructions();
        }

    } catch (error) {
        console.error('❌ Error general:', error.message);
        await manualPolicyInstructions();
    }
}

// Ejecutar script si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { main, testPublicAccess };