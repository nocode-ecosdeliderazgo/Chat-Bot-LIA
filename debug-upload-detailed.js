/**
 * DIAGNÓSTICO COMPLETO DE UPLOAD A SUPABASE STORAGE
 * 
 * Instrucciones:
 * 1. Abrir la consola del navegador en profile.html
 * 2. Copiar y pegar este script completo
 * 3. Ejecutar y revisar los resultados detallados
 */

console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DE STORAGE');
console.log('='.repeat(50));

async function runCompleteStorageDiagnostic() {
    const results = {
        supabaseClient: false,
        credentials: false,
        bucketExists: false,
        bucketPublic: false,
        bucketAccess: false,
        uploadTest: false,
        urlGeneration: false,
        error: null
    };

    try {
        // 1. VERIFICAR CLIENTE SUPABASE
        console.log('\n1️⃣ VERIFICANDO CLIENTE SUPABASE');
        console.log('-'.repeat(30));
        
        if (!window.supabase) {
            console.error('❌ window.supabase no existe');
            console.log('💡 Verificar que src/scripts/supabase-client.js está cargado');
            results.error = 'Supabase client no disponible';
            return results;
        }
        
        console.log('✅ Cliente Supabase disponible');
        console.log('📍 URL:', window.supabase.supabaseUrl || 'No configurada');
        console.log('🔑 Key:', window.supabase.supabaseKey ? 'Configurada' : 'No configurada');
        results.supabaseClient = true;

        // 2. VERIFICAR CREDENCIALES
        console.log('\n2️⃣ VERIFICANDO CREDENCIALES');
        console.log('-'.repeat(30));
        
        const url = window.supabase.supabaseUrl || 
                   localStorage.getItem('supabaseUrl') ||
                   document.querySelector('meta[name="supabase-url"]')?.content;
        const key = window.supabase.supabaseKey ||
                   localStorage.getItem('supabaseAnonKey') ||
                   document.querySelector('meta[name="supabase-key"]')?.content;

        if (!url || !key) {
            console.error('❌ Credenciales incompletas');
            console.log('URL:', url ? 'OK' : '❌ Faltante');
            console.log('Key:', key ? 'OK' : '❌ Faltante');
            results.error = 'Credenciales incompletas';
            return results;
        }

        console.log('✅ Credenciales completas');
        console.log('📍 URL:', url.substring(0, 30) + '...');
        console.log('🔑 Key:', key.substring(0, 20) + '...');
        results.credentials = true;

        // 3. VERIFICAR BUCKET EXISTE
        console.log('\n3️⃣ VERIFICANDO BUCKET "AVATARS"');
        console.log('-'.repeat(30));
        
        const { data: buckets, error: listError } = await window.supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Error listando buckets:', listError.message);
            console.log('Status:', listError.statusCode || listError.status || 'N/A');
            results.error = `Error listando buckets: ${listError.message}`;
            return results;
        }

        console.log('✅ Listado de buckets exitoso');
        console.log('📁 Total buckets:', buckets.length);
        
        const avatarBucket = buckets.find(b => b.name === 'avatars');
        if (!avatarBucket) {
            console.error('❌ Bucket "avatars" no existe');
            console.log('🗂️ Buckets disponibles:', buckets.map(b => b.name).join(', '));
            results.error = 'Bucket "avatars" no existe';
            return results;
        }

        console.log('✅ Bucket "avatars" existe');
        console.log('🔓 Público:', avatarBucket.public ? 'SÍ' : 'NO');
        console.log('📏 Límite tamaño:', avatarBucket.file_size_limit || 'Sin límite');
        results.bucketExists = true;
        results.bucketPublic = avatarBucket.public;

        // 4. VERIFICAR ACCESO AL BUCKET
        console.log('\n4️⃣ VERIFICANDO ACCESO AL BUCKET');
        console.log('-'.repeat(30));
        
        const { data: listFiles, error: accessError } = await window.supabase.storage
            .from('avatars')
            .list('', { limit: 1 });

        if (accessError) {
            console.error('❌ Error accediendo al bucket:', accessError.message);
            console.log('💡 Posibles causas:');
            console.log('   - Políticas RLS muy restrictivas');
            console.log('   - Bucket no público');
            console.log('   - Permisos insuficientes');
            results.error = `Error accediendo bucket: ${accessError.message}`;
            return results;
        }

        console.log('✅ Acceso al bucket exitoso');
        console.log('📄 Archivos en bucket:', listFiles ? listFiles.length : 0);
        results.bucketAccess = true;

        // 5. TEST DE UPLOAD CON ARCHIVO FAKE
        console.log('\n5️⃣ TEST DE UPLOAD (ARCHIVO SIMULADO)');
        console.log('-'.repeat(30));
        
        // Crear un archivo de prueba muy pequeño
        const testContent = 'test-upload-' + Date.now();
        const testBlob = new Blob([testContent], { type: 'text/plain' });
        const testFileName = `test-upload-${Date.now()}.txt`;
        
        console.log('📤 Subiendo archivo de prueba:', testFileName);
        console.log('📏 Tamaño:', testBlob.size, 'bytes');
        
        const { data: uploadData, error: uploadError } = await window.supabase.storage
            .from('avatars')
            .upload(testFileName, testBlob, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('❌ Error en upload:', uploadError.message);
            console.log('Status:', uploadError.statusCode || uploadError.status || 'N/A');
            console.log('💡 Diagnóstico del error:');
            
            if (uploadError.message.includes('policy')) {
                console.log('   🔒 ERROR RLS: Políticas muy restrictivas');
                console.log('   🔧 SOLUCIÓN: Verificar políticas RLS o hacer bucket completamente público');
            } else if (uploadError.message.includes('bucket')) {
                console.log('   🗂️ ERROR BUCKET: Problema con el bucket');
                console.log('   🔧 SOLUCIÓN: Recrear bucket como público');
            } else if (uploadError.message.includes('auth') || uploadError.message.includes('401')) {
                console.log('   🔑 ERROR AUTH: Problema de autenticación');
                console.log('   🔧 SOLUCIÓN: Verificar que el bucket es público');
            } else if (uploadError.message.includes('403')) {
                console.log('   🚫 ERROR PERMISOS: Sin permisos para subir');
                console.log('   🔧 SOLUCIÓN: Verificar políticas INSERT en storage.objects');
            }
            
            results.error = `Error upload: ${uploadError.message}`;
            return results;
        }

        console.log('✅ Upload exitoso!');
        console.log('📁 Path:', uploadData.path);
        console.log('🆔 ID:', uploadData.id);
        results.uploadTest = true;

        // 6. TEST DE URL PÚBLICA
        console.log('\n6️⃣ TEST DE URL PÚBLICA');
        console.log('-'.repeat(30));
        
        const { data: urlData } = window.supabase.storage
            .from('avatars')
            .getPublicUrl(testFileName);

        if (!urlData?.publicUrl) {
            console.error('❌ No se pudo obtener URL pública');
            results.error = 'No se pudo generar URL pública';
            return results;
        }

        console.log('✅ URL pública generada');
        console.log('🔗 URL:', urlData.publicUrl);
        results.urlGeneration = true;

        // 7. TEST DE ACCESO A LA URL
        console.log('\n7️⃣ TEST DE ACCESO A URL');
        console.log('-'.repeat(30));
        
        try {
            const response = await fetch(urlData.publicUrl);
            if (response.ok) {
                const content = await response.text();
                console.log('✅ URL accesible públicamente');
                console.log('📄 Contenido:', content === testContent ? 'Correcto' : 'Incorrecto');
            } else {
                console.error('❌ URL no accesible:', response.status, response.statusText);
                results.error = `URL no accesible: ${response.status}`;
            }
        } catch (fetchError) {
            console.error('❌ Error accediendo a URL:', fetchError.message);
            results.error = `Error fetch URL: ${fetchError.message}`;
        }

        // 8. LIMPIEZA - Eliminar archivo de prueba
        console.log('\n8️⃣ LIMPIEZA');
        console.log('-'.repeat(30));
        
        try {
            const { error: deleteError } = await window.supabase.storage
                .from('avatars')
                .remove([testFileName]);
            
            if (deleteError) {
                console.warn('⚠️ No se pudo eliminar archivo de prueba:', deleteError.message);
            } else {
                console.log('✅ Archivo de prueba eliminado');
            }
        } catch (deleteErr) {
            console.warn('⚠️ Error eliminando archivo de prueba:', deleteErr.message);
        }

    } catch (error) {
        console.error('💥 Error inesperado:', error);
        results.error = `Error inesperado: ${error.message}`;
    }

    return results;
}

// Función para mostrar resumen final
function showDiagnosticSummary(results) {
    console.log('\n🎯 RESUMEN DIAGNÓSTICO');
    console.log('='.repeat(50));
    
    const checks = [
        { name: 'Cliente Supabase', status: results.supabaseClient },
        { name: 'Credenciales', status: results.credentials },
        { name: 'Bucket existe', status: results.bucketExists },
        { name: 'Bucket público', status: results.bucketPublic },
        { name: 'Acceso bucket', status: results.bucketAccess },
        { name: 'Test upload', status: results.uploadTest },
        { name: 'URL pública', status: results.urlGeneration }
    ];
    
    checks.forEach(check => {
        const icon = check.status ? '✅' : '❌';
        console.log(`${icon} ${check.name}`);
    });
    
    if (results.error) {
        console.log('\n🚨 ERROR PRINCIPAL:', results.error);
    }
    
    // Recomendaciones específicas
    if (!results.bucketExists) {
        console.log('\n💡 SOLUCIÓN: Crear bucket "avatars" en Supabase Dashboard');
    } else if (!results.bucketPublic) {
        console.log('\n💡 SOLUCIÓN: Marcar bucket "avatars" como público');
    } else if (!results.bucketAccess) {
        console.log('\n💡 SOLUCIÓN: Configurar políticas RLS para acceso público');
    } else if (!results.uploadTest) {
        console.log('\n💡 SOLUCIÓN: Configurar política INSERT para uploads públicos');
    } else if (results.uploadTest && results.urlGeneration) {
        console.log('\n🎉 ¡TODO FUNCIONA! El problema puede estar en el código de la aplicación.');
        console.log('🔍 Revisar logs en profile.html al subir imagen real');
    }
}

// Ejecutar diagnóstico completo
runCompleteStorageDiagnostic()
    .then(results => {
        showDiagnosticSummary(results);
        
        // Exponer resultados globalmente para inspección
        window.storage診agnosticResults = results;
        console.log('\n📊 Resultados disponibles en: window.storageDiagnosticResults');
    })
    .catch(error => {
        console.error('💥 Error ejecutando diagnóstico:', error);
    });

// Funciones adicionales útiles
window.debugStorage = {
    // Test rápido de upload
    testQuickUpload: async function() {
        const testFile = new Blob(['test'], { type: 'text/plain' });
        const fileName = `quick-test-${Date.now()}.txt`;
        
        const { data, error } = await window.supabase.storage
            .from('avatars')
            .upload(fileName, testFile);
            
        if (error) {
            console.error('❌ Quick upload failed:', error.message);
        } else {
            console.log('✅ Quick upload success:', data);
            
            // Obtener URL
            const { data: url } = window.supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
            console.log('🔗 URL:', url.publicUrl);
            
            return url.publicUrl;
        }
    },
    
    // Verificar políticas actuales
    checkPolicies: async function() {
        try {
            const { data, error } = await window.supabase
                .from('pg_policies')
                .select('*')
                .ilike('tablename', 'objects');
                
            if (error) {
                console.log('No se pueden consultar políticas directamente');
            } else {
                console.log('Políticas encontradas:', data);
            }
        } catch (err) {
            console.log('Políticas no accesibles desde client');
        }
    }
};

console.log('\n🛠️ FUNCIONES DEBUG DISPONIBLES:');
console.log('- window.debugStorage.testQuickUpload()');
console.log('- window.debugStorage.checkPolicies()');