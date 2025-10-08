/**
 * SCRIPT PARA CONFIGURAR BUCKETS DE SUPABASE STORAGE
 * 
 * Instrucciones de uso:
 * 1. Abrir la consola del navegador en cualquier página de la aplicación
 * 2. Copiar y pegar este script completo
 * 3. Presionar Enter
 * 4. Seguir las instrucciones que aparecen en consola
 * 
 * O alternativemente:
 * 1. Abrir Supabase Dashboard: https://app.supabase.com
 * 2. Ir a tu proyecto → Storage → Buckets
 * 3. Crear los buckets manualmente según las instrucciones de abajo
 */

console.log('🚀 CONFIGURADOR DE BUCKETS PARA SUPABASE STORAGE');
console.log('================================================');

async function setupSupabaseBuckets() {
    try {
        // Verificar que Supabase esté disponible
        if (!window.supabase) {
            console.error('❌ Supabase client no está disponible');
            console.log('💡 Asegúrate de estar en una página de la aplicación con Supabase cargado');
            return;
        }

        console.log('✅ Cliente Supabase disponible');
        console.log('🔍 Verificando buckets actuales...');

        // Listar buckets existentes
        const { data: buckets, error: listError } = await window.supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Error listando buckets:', listError.message);
            showManualInstructions();
            return;
        }

        console.log('📁 Buckets existentes:', buckets.map(b => `${b.name} (${b.public ? 'público' : 'privado'})`));

        // Verificar buckets necesarios
        const hasAvatars = buckets.find(b => b.name === 'avatars');
        const hasCurriculums = buckets.find(b => b.name === 'curriculums');

        if (hasAvatars && hasCurriculums) {
            console.log('✅ ¡Todos los buckets necesarios ya existen!');
            console.log('✅ avatars:', hasAvatars.public ? 'público' : 'privado');
            console.log('✅ curriculums:', hasCurriculums.public ? 'público' : 'privado');
            console.log('🎉 La configuración está completa. Las imágenes de perfil deberían funcionar.');
            return;
        }

        // Intentar crear buckets faltantes
        console.log('🔧 Intentando crear buckets faltantes...');

        // Crear bucket avatars si no existe
        if (!hasAvatars) {
            console.log('📁 Creando bucket "avatars"...');
            const { error } = await window.supabase.storage.createBucket('avatars', {
                public: true,
                fileSizeLimit: 5 * 1024 * 1024, // 5MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
            });

            if (error) {
                if (error.message.includes('already exists')) {
                    console.log('✅ Bucket "avatars" ya existía');
                } else {
                    console.error('❌ Error creando bucket "avatars":', error.message);
                }
            } else {
                console.log('✅ Bucket "avatars" creado exitosamente');
            }
        }

        // Crear bucket curriculums si no existe  
        if (!hasCurriculums) {
            console.log('📁 Creando bucket "curriculums"...');
            const { error } = await window.supabase.storage.createBucket('curriculums', {
                public: true,
                fileSizeLimit: 10 * 1024 * 1024, // 10MB
                allowedMimeTypes: [
                    'application/pdf', 
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ]
            });

            if (error) {
                if (error.message.includes('already exists')) {
                    console.log('✅ Bucket "curriculums" ya existía');
                } else {
                    console.error('❌ Error creando bucket "curriculums":', error.message);
                }
            } else {
                console.log('✅ Bucket "curriculums" creado exitosamente');
            }
        }

        // Verificar resultado final
        console.log('🔄 Verificando configuración final...');
        const { data: finalBuckets } = await window.supabase.storage.listBuckets();
        const finalAvatars = finalBuckets.find(b => b.name === 'avatars');
        const finalCurriculums = finalBuckets.find(b => b.name === 'curriculums');

        if (finalAvatars && finalCurriculums) {
            console.log('🎉 ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!');
            console.log('✅ Bucket "avatars": configurado y listo');
            console.log('✅ Bucket "curriculums": configurado y listo');
            console.log('📸 Las imágenes de perfil ya deberían funcionar correctamente');
        } else {
            console.log('⚠️ Algunos buckets no se pudieron crear automáticamente');
            showManualInstructions();
        }

    } catch (error) {
        console.error('💥 Error en configuración automática:', error);
        showManualInstructions();
    }
}

function showManualInstructions() {
    console.log('');
    console.log('📋 INSTRUCCIONES MANUALES:');
    console.log('===========================');
    console.log('');
    console.log('1️⃣ Abrir Supabase Dashboard:');
    console.log('   https://app.supabase.com');
    console.log('');
    console.log('2️⃣ Navegar a tu proyecto → Storage → Buckets');
    console.log('');
    console.log('3️⃣ Crear bucket "avatars":');
    console.log('   • Nombre: avatars');
    console.log('   • ✅ Marcar "Public bucket"');
    console.log('   • File size limit: 5MB');
    console.log('   • Allowed MIME types: image/png, image/jpeg, image/jpg, image/gif');
    console.log('');
    console.log('4️⃣ Crear bucket "curriculums":');
    console.log('   • Nombre: curriculums');
    console.log('   • ✅ Marcar "Public bucket"');
    console.log('   • File size limit: 10MB');
    console.log('   • Allowed MIME types: application/pdf, application/msword, etc.');
    console.log('');
    console.log('5️⃣ (Opcional) Configurar políticas RLS si necesitas restricciones específicas');
    console.log('');
    console.log('Una vez creados manualmente, recarga la página y prueba subir una imagen.');
}

// Función para testing rápido
function testBucketsAccess() {
    console.log('🧪 Testing acceso a buckets...');
    
    if (!window.supabase) {
        console.error('❌ Supabase no disponible');
        return;
    }

    Promise.all([
        window.supabase.storage.from('avatars').list('', { limit: 1 }),
        window.supabase.storage.from('curriculums').list('', { limit: 1 })
    ]).then(([avatarsResult, curriculumsResult]) => {
        console.log('📊 Resultados del test:');
        console.log('  avatars:', avatarsResult.error ? `❌ ${avatarsResult.error.message}` : '✅ Accesible');
        console.log('  curriculums:', curriculumsResult.error ? `❌ ${curriculumsResult.error.message}` : '✅ Accesible');
    });
}

// Ejecutar configuración automática
console.log('🔄 Iniciando configuración automática...');
setupSupabaseBuckets();

// Exponer funciones globalmente para uso manual
window.setupSupabaseBuckets = setupSupabaseBuckets;
window.testBucketsAccess = testBucketsAccess;

console.log('');
console.log('💡 FUNCIONES DISPONIBLES EN CONSOLA:');
console.log('  setupSupabaseBuckets() - Ejecutar configuración nuevamente');  
console.log('  testBucketsAccess() - Probar acceso a buckets');
console.log('');