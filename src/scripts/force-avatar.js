// Script simple para forzar la creación del avatar
console.log('🚀 INICIANDO FORCE-AVATAR.JS');

// Función simple para crear avatar
function createSimpleAvatar() {
    console.log('🎨 Creando avatar simple...');
    
    // Crear canvas
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Fondo circular azul
    ctx.fillStyle = '#44E5FF';
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, 2 * Math.PI);
    ctx.fill();
    
    // Borde blanco
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Letra F en blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('F', 50, 50);
    
    // Convertir a data URL
    const dataURL = canvas.toDataURL();
    console.log('✅ Avatar creado:', dataURL.substring(0, 50) + '...');
    
    return dataURL;
}

// Función para aplicar el avatar
function applyAvatarToPage() {
    console.log('📍 Buscando elemento avatar...');
    
    // Buscar el elemento avatar
    const avatarImage = document.getElementById('avatarImage');
    
    if (avatarImage) {
        console.log('✅ Elemento avatar encontrado');
        console.log('📍 Src actual:', avatarImage.src);
        
        // Crear y aplicar avatar
        const avatarDataURL = createSimpleAvatar();
        avatarImage.src = avatarDataURL;
        avatarImage.style.display = 'block';
        avatarImage.style.visibility = 'visible';
        avatarImage.style.opacity = '1';
        
        console.log('✅ Avatar aplicado correctamente');
        
        // Guardar en localStorage
        try {
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                const userData = JSON.parse(currentUser);
                userData.profile_picture_url = avatarDataURL;
                localStorage.setItem('currentUser', JSON.stringify(userData));
                console.log('✅ Avatar guardado en localStorage');
            }
        } catch (error) {
            console.error('❌ Error guardando en localStorage:', error);
        }
        
        return true;
    } else {
        console.error('❌ Elemento avatar no encontrado');
        console.log('🔍 Elementos con "avatar" en el nombre:');
        document.querySelectorAll('*').forEach(el => {
            if (el.id && el.id.toLowerCase().includes('avatar')) {
                console.log('-', el.id, el.tagName);
            }
        });
        return false;
    }
}

// Ejecutar inmediatamente
console.log('⚡ Ejecutando force-avatar inmediatamente...');
applyAvatarToPage();

// También ejecutar después de un pequeño retraso
setTimeout(() => {
    console.log('⏰ Ejecutando force-avatar con retraso...');
    applyAvatarToPage();
}, 100);

// Y después de que se cargue todo
window.addEventListener('load', () => {
    console.log('📄 Ejecutando force-avatar después de load...');
    setTimeout(() => {
        applyAvatarToPage();
    }, 200);
});

// Función global para probar manualmente
window.forceAvatar = function() {
    console.log('🧪 FORZANDO AVATAR MANUALMENTE');
    return applyAvatarToPage();
};

console.log('✅ FORCE-AVATAR.JS CARGADO');
