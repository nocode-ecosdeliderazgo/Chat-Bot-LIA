/* ===== GESTOR DE AVATAR DE PERFIL GLOBAL ===== */
class ProfileAvatarManager {
    constructor() {
        this.init();
    }

    init() {
        this.updateProfileAvatars();
        
        // Función específica para profile.html con retraso para asegurar DOM
        if (window.location.pathname.includes('profile.html')) {
            // console.log('🎯 Página de perfil detectada - actualizando avatar específicamente');
            // Retraso para asegurar que el DOM esté completamente cargado
            setTimeout(() => {
                this.updateProfileAvatarImmediately();
            }, 100);
            
            // También intentar después de que se carguen las imágenes
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.updateProfileAvatarImmediately();
                }, 200);
            });
        }
        
        // Escuchar cambios en localStorage para actualizar en tiempo real
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser') {
                this.updateProfileAvatars();
            }
        });
    }
    
    updateProfileAvatarImmediately() {
        try {
            const avatarImage = document.getElementById('avatarImage');
            if (!avatarImage) {
                // console.error('❌ Elemento #avatarImage no encontrado en profile.html');
                return;
            }
            
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                // console.log('ℹ️ No hay datos de usuario en localStorage');
                return;
            }
            
            const userData = JSON.parse(currentUser);
            const profilePictureUrl = userData.profile_picture_url;
            
            // console.log('🔍 Datos del avatar en profile.html (PRIORITARIO):', {
                hasProfilePicture: !!profilePictureUrl,
                profilePictureUrl: profilePictureUrl ? profilePictureUrl.substring(0, 50) + '...' : 'ninguna',
                currentSrc: avatarImage.src ? avatarImage.src.substring(0, 50) + '...' : 'ninguna'
            });
            
            // VERIFICACIÓN ESTRICTA: Solo usar fotos reales, no placeholders
            if (profilePictureUrl && 
                profilePictureUrl !== '' &&
                !profilePictureUrl.includes('createSimpleAvatar') &&
                !profilePictureUrl.includes('createAvatar') &&
                profilePictureUrl.length > 100) { // Fotos reales son URLs largas
                
                // console.log('✅ FOTO REAL DETECTADA, aplicando con PRIORIDAD ALTA');
                avatarImage.src = profilePictureUrl;
                avatarImage.style.display = 'block';
                avatarImage.style.visibility = 'visible';
                
                // MARCAR COMO PROTEGIDO para evitar sobrescritura
                avatarImage.setAttribute('data-real-photo', 'true');
                avatarImage.setAttribute('data-protected', 'true');
                
                // Verificar que la imagen se cargue correctamente
                avatarImage.onload = () => {
                    // console.log('✅ FOTO REAL cargada correctamente en profile.html');
                    // Reconfirmar protección
                    avatarImage.setAttribute('data-real-photo', 'true');
                };
                
                avatarImage.onerror = () => {
                    console.error('❌ Error cargando foto real:', profilePictureUrl.substring(0, 50) + '...');
                    // Solo usar fallback si realmente no se puede cargar
                    avatarImage.src = 'assets/images/icono.png';
                    avatarImage.removeAttribute('data-real-photo');
                };
            } else {
                // console.log('ℹ️ No hay foto real válida, usando imagen por defecto');
                avatarImage.src = 'assets/images/icono.png';
                avatarImage.style.display = 'block';
                avatarImage.style.visibility = 'visible';
                avatarImage.removeAttribute('data-real-photo');
                avatarImage.removeAttribute('data-protected');
            }
        } catch (error) {
            // console.error('❌ Error en updateProfileAvatarImmediately:', error);
        }
    }

    updateProfileAvatars() {
        try {
            // Obtener datos del usuario desde localStorage
            const raw = localStorage.getItem('currentUser');
            if (!raw) {
                // console.log('No hay datos de usuario en localStorage');
                return;
            }

            const currentUser = JSON.parse(raw);
            const profilePictureUrl = currentUser.profile_picture_url;
            // Determinar la ruta por defecto basada en la ubicación actual
            const currentPath = window.location.pathname;
            let defaultAvatarUrl = 'assets/images/icono.png';
            
            // Ajustar ruta según la ubicación de la página
            if (currentPath.includes('/Community/') || currentPath.includes('/Notices/') || currentPath.includes('/q/')) {
                defaultAvatarUrl = '../assets/images/icono.png';
            } else if (currentPath.includes('/src/')) {
                defaultAvatarUrl = 'assets/images/icono.png';
            }

            // console.log('Datos del usuario:', {
            //     username: currentUser.username,
            //     profilePictureUrl: profilePictureUrl,
            //     hasProfilePicture: !!profilePictureUrl,
            //     currentPath: window.location.pathname,
            //     defaultAvatarUrl: defaultAvatarUrl
            // });

            // Buscar todos los elementos de avatar en la página
            const avatarSelectors = [
                '#avatarImage',                  // profile.html - PRIORIDAD ALTA
                '.header-profile img',           // cursos.html, courses.html
                '.profile-menu .pm-avatar img',  // Menú de perfil
                '.catalog-header .header-profile img', // Header de catálogo
                '.pm-avatar img',                // Otros avatares
                '.header-profile img',           // Community, Notices, form.html
                '.quiz-header .header-profile img' // Quiz form
            ];

            let totalImagesFound = 0;
            let totalImagesUpdated = 0;

            avatarSelectors.forEach(selector => {
                const avatarImages = document.querySelectorAll(selector);
                totalImagesFound += avatarImages.length;
                
                avatarImages.forEach(img => {
                    if (img) {
                        const targetUrl = profilePictureUrl || defaultAvatarUrl;
                        const currentSrc = img.src;
                        
                        // Normalizar URLs para comparación
                        const normalizeUrl = (url) => {
                            if (url.startsWith('data:')) return url;
                            if (url.startsWith('http')) return url;
                            // Remover parámetros de query y fragmentos
                            return url.split('?')[0].split('#')[0];
                        };
                        
                        const normalizedCurrent = normalizeUrl(currentSrc);
                        const normalizedTarget = normalizeUrl(targetUrl);
                        
                        if (normalizedCurrent !== normalizedTarget) {
                            // console.log(`Actualizando avatar: ${currentSrc} -> ${targetUrl}`);
                            img.src = targetUrl;
                            img.style.display = 'block';
                            totalImagesUpdated++;
                        }
                    }
                });
            });

            // console.log(`Avatares encontrados: ${totalImagesFound}, actualizados: ${totalImagesUpdated}`);
            
            if (profilePictureUrl) {
                // console.log('✅ Avatares de perfil actualizados con foto personalizada:', profilePictureUrl);
            } else {
                // console.log('ℹ️ Avatares de perfil actualizados con imagen por defecto');
            }
        } catch (error) {
            // console.error('❌ Error actualizando avatares de perfil:', error);
        }
    }

    // Método para actualizar manualmente (útil después de cambiar la foto)
    refreshAvatars() {
        // console.log('🔄 Actualizando avatares manualmente...');
        this.updateProfileAvatars();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // console.log('🚀 Inicializando ProfileAvatarManager...');
    window.profileAvatarManager = new ProfileAvatarManager();
});

// Función global para actualizar avatares desde otros scripts
window.updateProfileAvatars = function() {
    if (window.profileAvatarManager) {
        window.profileAvatarManager.refreshAvatars();
    } else {
        // console.log('⚠️ ProfileAvatarManager no está disponible');
    }
};
