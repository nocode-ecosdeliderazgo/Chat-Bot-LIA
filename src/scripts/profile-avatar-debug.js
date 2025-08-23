// Script de depuración para el avatar en profile.html
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DEPURACIÓN DE AVATAR EN PROFILE.HTML');
    
    // Verificar elementos del DOM
    const avatarImage = document.getElementById('avatarImage');
    const currentAvatar = document.getElementById('currentAvatar');
    
    console.log('Elementos encontrados:', {
        avatarImage: !!avatarImage,
        currentAvatar: !!currentAvatar,
        avatarImageSrc: avatarImage ? avatarImage.src : 'No encontrado',
        avatarImageDisplay: avatarImage ? avatarImage.style.display : 'No encontrado'
    });
    
    // Verificar localStorage
    const currentUser = localStorage.getItem('currentUser');
    console.log('Datos de localStorage:', {
        hasCurrentUser: !!currentUser,
        currentUserData: currentUser ? JSON.parse(currentUser) : null
    });
    
    // Verificar si hay URL de imagen de perfil
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        console.log('URL de imagen de perfil:', userData.profile_picture_url);
        
        // Intentar actualizar manualmente
        if (avatarImage && userData.profile_picture_url) {
            console.log('🔄 Actualizando avatar manualmente...');
            avatarImage.src = userData.profile_picture_url;
            avatarImage.style.display = 'block';
            console.log('✅ Avatar actualizado manualmente');
        }
    }
    
    // Verificar si la imagen se carga correctamente
    if (avatarImage) {
        avatarImage.onload = function() {
            console.log('✅ Imagen cargada correctamente:', this.src);
        };
        
        avatarImage.onerror = function() {
            console.error('❌ Error cargando imagen:', this.src);
        };
    }
    
    // Verificar estilos CSS
    const computedStyle = avatarImage ? window.getComputedStyle(avatarImage) : null;
    console.log('Estilos CSS del avatar:', {
        display: computedStyle ? computedStyle.display : 'No disponible',
        width: computedStyle ? computedStyle.width : 'No disponible',
        height: computedStyle ? computedStyle.height : 'No disponible',
        visibility: computedStyle ? computedStyle.visibility : 'No disponible'
    });
});
