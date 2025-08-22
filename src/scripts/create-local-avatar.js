// Script para crear automáticamente una imagen de avatar local
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 CREANDO AVATAR LOCAL AUTOMÁTICAMENTE');
    
    // Función para crear avatar con iniciales
    function createAvatarWithInitials(initials = 'F') {
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
        
        // Borde
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Texto (iniciales)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 50, 50);
        
        return canvas.toDataURL('image/png');
    }
    
    // Función para aplicar el avatar
    function applyAvatar(dataURL) {
        const avatarImage = document.getElementById('avatarImage');
        if (avatarImage) {
            // VERIFICAR SI ESTÁ PROTEGIDO POR FOTO REAL
            if (avatarImage.hasAttribute('data-real-photo') || avatarImage.hasAttribute('data-protected')) {
                console.log('⚠️ AVATAR PROTEGIDO DETECTADO, NO APLICANDO INICIALES');
                return false;
            }
            avatarImage.src = dataURL;
            avatarImage.style.display = 'block';
            avatarImage.style.visibility = 'visible';
            avatarImage.style.opacity = '1';
            
            console.log('✅ Avatar local aplicado correctamente');
            
            // Guardar en localStorage
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                const userData = JSON.parse(currentUser);
                userData.profile_picture_url = dataURL;
                localStorage.setItem('currentUser', JSON.stringify(userData));
                console.log('✅ Avatar guardado en localStorage');
            }
            
            return true;
        } else {
            console.error('❌ Elemento avatar no encontrado');
            return false;
        }
    }
    
    // Verificar si ya hay una imagen de perfil VÁLIDA
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        
        // VERIFICACIÓN ESTRICTA: NO sobrescribir fotos reales
        if (!userData.profile_picture_url || 
            userData.profile_picture_url === '' ||
            userData.profile_picture_url.includes('createAvatar') ||
            (userData.profile_picture_url.includes('F') && userData.profile_picture_url.length < 100)) {
            
            console.log('⚠️ No hay imagen de perfil válida, creando una local...');
            
            // Obtener iniciales del nombre del usuario
            let initials = 'F'; // Por defecto
            if (userData.first_name) {
                initials = userData.first_name.charAt(0).toUpperCase();
            } else if (userData.username) {
                initials = userData.username.charAt(0).toUpperCase();
            }
            
            // Crear y aplicar el avatar
            const avatarDataURL = createAvatarWithInitials(initials);
            applyAvatar(avatarDataURL);
            
        } else {
            console.log('✅ Ya existe una imagen de perfil válida, NO sobrescribiendo:', userData.profile_picture_url);
            
            // NO verificar errores de carga para evitar sobrescribir fotos reales
            console.log('ℹ️ Respetando foto de perfil existente');
        }
    } else {
        console.log('ℹ️ No hay datos de usuario, creando avatar por defecto...');
        const avatarDataURL = createAvatarWithInitials('F');
        applyAvatar(avatarDataURL);
    }
});

// Función global para crear avatar personalizado
window.createCustomAvatar = function(initials = 'F', color1 = '#44E5FF', color2 = '#0077A6') {
    console.log('🎨 CREANDO AVATAR PERSONALIZADO:', { initials, color1, color2 });
    
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Fondo circular con gradiente personalizado
    const gradient = ctx.createRadialGradient(50, 50, 0, 50, 50, 50);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, 2 * Math.PI);
    ctx.fill();
    
    // Borde
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Texto
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials.toUpperCase(), 50, 50);
    
    const dataURL = canvas.toDataURL('image/png');
    
    // Aplicar el avatar
    const avatarImage = document.getElementById('avatarImage');
    if (avatarImage) {
        avatarImage.src = dataURL;
        avatarImage.style.display = 'block';
        avatarImage.style.visibility = 'visible';
        
        // Guardar en localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            userData.profile_picture_url = dataURL;
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        
        console.log('✅ Avatar personalizado creado y aplicado');
        return dataURL;
    } else {
        console.error('❌ Elemento avatar no encontrado');
        return null;
    }
};
