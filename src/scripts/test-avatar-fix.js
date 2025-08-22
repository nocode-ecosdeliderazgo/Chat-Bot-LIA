// Script de prueba para solucionar el problema del avatar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 SCRIPT DE PRUEBA PARA SOLUCIONAR AVATAR');
    
    // Verificar localStorage
    const currentUser = localStorage.getItem('currentUser');
    console.log('📋 Datos en localStorage:', currentUser ? JSON.parse(currentUser) : 'No hay datos');
    
    // Verificar si hay una imagen de perfil guardada
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        console.log('🖼️ URL de imagen de perfil:', userData.profile_picture_url);
        
        // NO SOBRESCRIBIR - solo crear si realmente no hay nada
        if (!userData.profile_picture_url || 
            userData.profile_picture_url === '' ||
            userData.profile_picture_url.includes('00000000000000')) { // Solo si es placeholder vacío
            console.log('⚠️ No hay imagen de perfil válida, PERO NO SOBRESCRIBIENDO automáticamente');
            console.log('ℹ️ Para crear una foto de prueba, usar testAvatar() manualmente');
            // NO crear automáticamente
        } else {
            console.log('✅ Ya hay imagen de perfil válida, respetando:', userData.profile_picture_url.substring(0, 50) + '...');
        }
    }
    
    // Verificar el elemento del avatar
    const avatarImage = document.getElementById('avatarImage');
    if (avatarImage) {
        console.log('✅ Elemento avatar encontrado');
        console.log('📍 Src actual:', avatarImage.src);
        console.log('📍 Display:', avatarImage.style.display);
        console.log('📍 Visibility:', avatarImage.style.visibility);
        
        // Forzar la actualización del avatar
        setTimeout(() => {
            if (currentUser) {
                const userData = JSON.parse(currentUser);
                if (userData.profile_picture_url) {
                    console.log('🔄 Forzando actualización del avatar...');
                    avatarImage.src = userData.profile_picture_url;
                    avatarImage.style.display = 'block';
                    avatarImage.style.visibility = 'visible';
                    avatarImage.style.opacity = '1';
                    
                    // Verificar que la imagen se cargue
                    avatarImage.onload = function() {
                        console.log('✅ Imagen cargada correctamente:', this.src);
                    };
                    
                    avatarImage.onerror = function() {
                        console.error('❌ Error cargando imagen:', this.src);
                        // Fallback a imagen local
                        this.src = 'assets/images/icono.png';
                        console.log('🔄 Usando imagen local como fallback');
                    };
                }
            }
        }, 500);
    } else {
        console.error('❌ Elemento avatar no encontrado');
    }
    
    // Mostrar información adicional
    console.log('📊 Información adicional:');
    console.log('- URL actual:', window.location.href);
    console.log('- Pathname:', window.location.pathname);
    console.log('- Protocolo:', window.location.protocol);
    console.log('- Host:', window.location.host);
});

// Función para probar manualmente con imagen local
window.testAvatar = function() {
    console.log('🧪 PRUEBA MANUAL DEL AVATAR');
    
    const avatarImage = document.getElementById('avatarImage');
    if (avatarImage) {
        // Cambiar a una imagen de prueba local
        avatarImage.src = 'assets/images/icono.png';
        avatarImage.style.display = 'block';
        avatarImage.style.visibility = 'visible';
        console.log('✅ Avatar cambiado manualmente a imagen local');
    } else {
        console.error('❌ No se encontró el elemento avatar');
    }
};

// Función para probar con imagen de internet
window.testAvatarInternet = function() {
    console.log('🌐 PRUEBA CON IMAGEN DE INTERNET');
    
    const avatarImage = document.getElementById('avatarImage');
    if (avatarImage) {
        // Usar una imagen de internet confiable
        avatarImage.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=100';
        avatarImage.style.display = 'block';
        avatarImage.style.visibility = 'visible';
        console.log('✅ Avatar cambiado a imagen de internet');
    } else {
        console.error('❌ No se encontró el elemento avatar');
    }
};

// Función para crear una imagen de prueba con canvas
window.createTestImage = function() {
    console.log('🎨 CREANDO IMAGEN DE PRUEBA CON CANVAS');
    
    const avatarImage = document.getElementById('avatarImage');
    if (avatarImage) {
        // Crear un canvas para generar una imagen de prueba
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Dibujar un fondo circular con la inicial
        ctx.fillStyle = '#44E5FF';
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, 2 * Math.PI);
        ctx.fill();
        
        // Agregar texto
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('F', 50, 50);
        
        // Convertir a data URL
        const dataURL = canvas.toDataURL();
        avatarImage.src = dataURL;
        avatarImage.style.display = 'block';
        avatarImage.style.visibility = 'visible';
        
        console.log('✅ Imagen de prueba creada con canvas');
        
        // Guardar en localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            userData.profile_picture_url = dataURL;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            console.log('✅ Imagen guardada en localStorage');
        }
    } else {
        console.error('❌ No se encontró el elemento avatar');
    }
};

// Función para limpiar y resetear
window.resetAvatar = function() {
    console.log('🔄 RESETEANDO AVATAR');
    
    const avatarImage = document.getElementById('avatarImage');
    if (avatarImage) {
        avatarImage.src = 'assets/images/icono.png';
        avatarImage.style.display = 'block';
        avatarImage.style.visibility = 'visible';
        console.log('✅ Avatar reseteado');
    }
    
    // Limpiar localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        delete userData.profile_picture_url;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('✅ localStorage limpiado');
    }
};
