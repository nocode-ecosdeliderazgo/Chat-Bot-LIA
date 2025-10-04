// =====================================================
// SCRIPT DE VERIFICACIÓN RÁPIDA - PERFIL
// Ejecuta este script en la consola para verificar las correcciones
// =====================================================

(async function testProfileFixes() {
    console.log('🧪 ===== INICIANDO TESTS DE VERIFICACIÓN =====');
    
    let allTestsPassed = true;
    
    // Test 1: Verificar que las APIs usan endpoints correctos
    console.log('\n📡 TEST 1: Verificando endpoints de API...');
    
    const expectedEndpoints = [
        '/.netlify/functions/get-profile',
        '/.netlify/functions/supabase-config',
        '/.netlify/functions/sync-user'
    ];
    
    for (const endpoint of expectedEndpoints) {
        try {
            const response = await fetch(endpoint, { method: 'OPTIONS' });
            if (response.ok || response.status === 405) {
                console.log(`✅ ${endpoint}: Accesible`);
            } else {
                console.log(`⚠️ ${endpoint}: ${response.status} - ${response.statusText}`);
                allTestsPassed = false;
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: Error - ${error.message}`);
            allTestsPassed = false;
        }
    }
    
    // Test 2: Verificar Supabase
    console.log('\n🔗 TEST 2: Verificando Supabase...');
    
    if (window.supabase && typeof window.supabase.from === 'function') {
        console.log('✅ Supabase: Cliente válido disponible');
    } else if (window.supabase && typeof window.supabase.createClient === 'function') {
        console.log('✅ Supabase: Función createClient disponible');
    } else {
        console.log('⚠️ Supabase: No disponible o no válido');
        allTestsPassed = false;
    }
    
    // Test 3: Verificar credenciales
    console.log('\n🔑 TEST 3: Verificando credenciales...');
    
    const supabaseUrl = localStorage.getItem('supabaseUrl') || window.SUPABASE_URL;
    const supabaseKey = localStorage.getItem('supabaseAnonKey') || window.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
        console.log('✅ Credenciales: Disponibles');
        if (supabaseUrl.includes('supabase.co')) {
            console.log('✅ URL: Formato válido');
        } else {
            console.log('⚠️ URL: Formato sospechoso');
        }
    } else {
        console.log('❌ Credenciales: No encontradas');
        allTestsPassed = false;
    }
    
    // Test 4: Verificar usuario actual
    console.log('\n👤 TEST 4: Verificando datos de usuario...');
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            console.log('✅ Usuario: Datos disponibles');
            console.log(`   - ID: ${user.id || 'No disponible'}`);
            console.log(`   - Username: ${user.username || 'No disponible'}`);
            console.log(`   - Email: ${user.email || 'No disponible'}`);
        } catch (e) {
            console.log('❌ Usuario: Datos corruptos');
            allTestsPassed = false;
        }
    } else {
        console.log('❌ Usuario: No hay datos en localStorage');
        allTestsPassed = false;
    }
    
    // Test 5: Probar API de perfil
    console.log('\n🔍 TEST 5: Probando API de perfil...');
    
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            if (user.id || user.username || user.email) {
                const params = [];
                if (user.id && !String(user.id).startsWith('dev-')) {
                    params.push(`userId=${encodeURIComponent(user.id)}`);
                }
                if (user.username) {
                    params.push(`username=${encodeURIComponent(user.username)}`);
                }
                if (user.email) {
                    params.push(`email=${encodeURIComponent(user.email)}`);
                }
                
                if (params.length > 0) {
                    const testUrl = `/.netlify/functions/get-profile?${params[0]}`;
                    console.log(`🔄 Probando: ${testUrl}`);
                    
                    const response = await fetch(testUrl);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ API de perfil: Funcionando');
                        if (data.user) {
                            console.log(`   - Campos disponibles: ${Object.keys(data.user).join(', ')}`);
                        }
                    } else {
                        const errorText = await response.text();
                        console.log(`❌ API de perfil: ${response.status} - ${errorText}`);
                        allTestsPassed = false;
                    }
                } else {
                    console.log('⚠️ API de perfil: No hay parámetros válidos para probar');
                }
            }
        } catch (error) {
            console.log(`❌ API de perfil: Error - ${error.message}`);
            allTestsPassed = false;
        }
    }
    
    // Test 6: Verificar campos del formulario
    console.log('\n📝 TEST 6: Verificando campos del formulario...');
    
    const formFields = ['firstName', 'lastName', 'username', 'email', 'companyRole', 'phone', 'location', 'bio'];
    let fieldsFound = 0;
    
    formFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            fieldsFound++;
        }
    });
    
    if (fieldsFound === formFields.length) {
        console.log(`✅ Formulario: Todos los campos encontrados (${fieldsFound}/${formFields.length})`);
    } else {
        console.log(`⚠️ Formulario: ${fieldsFound}/${formFields.length} campos encontrados`);
    }
    
    // Resultado final
    console.log('\n🏁 ===== RESULTADO DE LOS TESTS =====');
    
    if (allTestsPassed) {
        console.log('🎉 ¡TODOS LOS TESTS PASARON! El sistema debería funcionar correctamente.');
        console.log('💡 Si aún hay problemas, ejecuta debugProfile() para más detalles.');
    } else {
        console.log('⚠️ ALGUNOS TESTS FALLARON. Revisa los errores arriba.');
        console.log('🔧 Posibles soluciones:');
        console.log('   1. Verificar variables de entorno en Netlify');
        console.log('   2. Asegurar que las funciones Netlify estén desplegadas');
        console.log('   3. Verificar que el usuario esté autenticado correctamente');
        console.log('   4. Ejecutar debugProfile() para diagnóstico detallado');
    }
    
    console.log('\n📚 Comandos útiles:');
    console.log('   - debugProfile(): Diagnóstico completo');
    console.log('   - debugFormFields(): Verificar campos del formulario');
    console.log('   - debugProfileQuick(): Debug rápido');
    
})().catch(error => {
    console.error('❌ Error ejecutando tests:', error);
    console.log('💡 Intenta ejecutar los tests individuales o debugProfile()');
});
