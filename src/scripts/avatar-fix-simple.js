// Script simple para arreglar el avatar - SIN DEPENDENCIAS EXTERNAS
console.log('🔧 AVATAR-FIX-SIMPLE.JS INICIADO');

// Función para crear avatar
function createAvatar() {
    console.log('🎨 Creando avatar...');
    
    try {
        // Crear canvas
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Fondo circular con gradiente
        const gradient = ctx.createRadialGradient(50, 50, 0, 50, 50, 50);
        gradient.addColorStop(0, '#44E5FF');
        gradient.addColorStop(1, '#0077A6');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, 2 * Math.PI);
        ctx.fill();
        
        // Borde blanco
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Letra F en blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 40px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('F', 50, 50);
        
        // Convertir a data URL
        const dataURL = canvas.toDataURL('image/png');
        console.log('✅ Avatar creado exitosamente');
        
        return dataURL;
    } catch (error) {
        console.error('❌ Error creando avatar:', error);
        return null;
    }
}

// Función para aplicar avatar
function applyAvatar() {
    console.log('📍 Buscando elemento avatar...');
    
    const avatarImage = document.getElementById('avatarImage');
    
    if (avatarImage) {
        console.log('✅ Elemento avatar encontrado');
        
        const avatarDataURL = createAvatar();
        if (avatarDataURL) {
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
            console.error('❌ No se pudo crear el avatar');
            return false;
        }
    } else {
        console.error('❌ Elemento avatar no encontrado');
        return false;
    }
}

// Ejecutar automáticamente
console.log('⚡ Ejecutando avatar automáticamente...');
applyAvatar();

// También ejecutar después de un retraso
setTimeout(() => {
    console.log('⏰ Ejecutando avatar con retraso...');
    applyAvatar();
}, 1000);

// Y después de que se cargue todo
window.addEventListener('load', () => {
    console.log('📄 Ejecutando avatar después de load...');
    setTimeout(() => {
        applyAvatar();
    }, 2000);
});

// Función global para uso manual
window.fixAvatar = function() {
    console.log('🧪 FIX AVATAR MANUAL');
    return applyAvatar();
};

console.log('✅ AVATAR-FIX-SIMPLE.JS CARGADO');
