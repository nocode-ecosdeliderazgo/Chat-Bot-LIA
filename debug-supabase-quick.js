// 🔍 Debug Script Rápido para Supabase Storage
// Copia y pega este código en la consola del navegador en profile.html

console.log('🚀 Iniciando debug de Supabase Storage...');

// 1. Verificar credenciales
const supabaseUrl = localStorage.getItem('supabaseUrl') || 
                   document.querySelector('meta[name="supabase-url"]')?.content;
const supabaseKey = localStorage.getItem('supabaseAnonKey') || 
                   localStorage.getItem('supabaseKey') ||
                   document.querySelector('meta[name="supabase-key"]')?.content;

console.log('📋 Credenciales:', {
    url: supabaseUrl ? '✅ ENCONTRADA' : '❌ FALTA',
    key: supabaseKey ? '✅ ENCONTRADA' : '❌ FALTA',
    urlValue: supabaseUrl,
    keyLength: supabaseKey ? supabaseKey.length : 0
});

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltan credenciales de Supabase');
    console.log('💡 Solución: Verificar que las credenciales estén en localStorage o meta tags');
} else {
    console.log('✅ Credenciales disponibles, procediendo con tests...');
    
    // 2. Test de conexión básica
    import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
    .then(({ createClient }) => {
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Cliente Supabase creado');
        
        // Test de autenticación
        return supabase.auth.getSession();
    })
    .then(({ data: { session }, error }) => {
        if (error) {
            console.error('❌ Error obteniendo sesión:', error);
        } else if (session) {
            console.log('✅ Usuario autenticado:', {
                email: session.user.email,
                id: session.user.id,
                confirmado: !!session.user.email_confirmed_at
            });
        } else {
            console.warn('⚠️ No hay sesión activa');
        }
        
        // Continuamos con el test independientemente del estado de auth
        return import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    })
    .then(({ createClient }) => {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test de buckets
        console.log('🗂️ Listando buckets...');
        return supabase.storage.listBuckets();
    })
    .then(({ data: buckets, error }) => {
        if (error) {
            console.error('❌ Error listando buckets:', error);
        } else {
            console.log('📁 Buckets encontrados:', buckets.map(b => ({
                name: b.name,
                public: b.public,
                allowedMimeTypes: b.allowed_mime_types
            })));
            
            const hasAvatars = buckets.some(b => b.name === 'AVATARS' || b.name === 'avatars');
            if (!hasAvatars) {
                console.warn('⚠️ Bucket AVATARS no encontrado');
                console.log('💡 El sistema intentará crearlo automáticamente en el próximo upload');
            } else {
                console.log('✅ Bucket AVATARS disponible');
            }
        }
    })
    .catch(error => {
        console.error('💥 Error en test:', error);
    });
}

// 3. Función de test manual de upload
window.testManualUpload = async function() {
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Faltan credenciales');
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        console.log('📤 Iniciando test de upload manual:', {
            name: file.name,
            size: file.size,
            type: file.type
        });
        
        try {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const supabase = createClient(supabaseUrl, supabaseKey);
            
            // Intentar crear bucket si no existe
            const { data: buckets } = await supabase.storage.listBuckets();
            const hasAvatars = buckets?.some(b => b.name === 'AVATARS');
            
            if (!hasAvatars) {
                console.log('📁 Creando bucket AVATARS...');
                const { error: createError } = await supabase.storage.createBucket('AVATARS', {
                    public: true,
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
                });
                
                if (createError) {
                    console.error('❌ Error creando bucket:', createError);
                } else {
                    console.log('✅ Bucket AVATARS creado');
                }
            }
            
            // Upload del archivo
            const fileName = `test_manual_${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage
                .from('AVATARS')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (error) {
                console.error('❌ Error en upload manual:', error);
            } else {
                console.log('✅ Upload manual exitoso:', data);
                
                // Obtener URL pública
                const { data: urlData } = supabase.storage
                    .from('AVATARS')
                    .getPublicUrl(fileName);
                
                if (urlData?.publicUrl) {
                    console.log('✅ URL pública:', urlData.publicUrl);
                    
                    // Crear imagen de preview
                    const img = document.createElement('img');
                    img.src = urlData.publicUrl;
                    img.style.maxWidth = '200px';
                    img.style.border = '2px solid #44E5FF';
                    img.style.borderRadius = '8px';
                    img.style.margin = '10px';
                    document.body.appendChild(img);
                    
                    console.log('🖼️ Imagen añadida al DOM para verificar');
                }
            }
            
        } catch (error) {
            console.error('💥 Error en test manual:', error);
        }
    };
    
    input.click();
};

console.log('🛠️ Debug completado. Usa testManualUpload() para probar upload manual');