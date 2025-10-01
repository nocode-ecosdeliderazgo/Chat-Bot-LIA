/* ===== GESTOR DE AVATAR DE PERFIL GLOBAL ===== */
class ProfileAvatarManager {
    constructor() {
        this.profilePictureUrl = null;
        this.isLoadingFromSupabase = false;
        this.init();
    }

    /**
     * Obtener URL de avatar desde Supabase Storage
     */
    async loadAvatarFromSupabase() {
        if (this.isLoadingFromSupabase) {
            console.log('⏳ Ya hay una carga de avatar en progreso desde Supabase');
            return this.profilePictureUrl;
        }

        try {
            this.isLoadingFromSupabase = true;
            console.log('🔍 Intentando cargar avatar desde Supabase...');

            // Verificar que Supabase esté disponible
            if (!window.supabase) {
                console.warn('⚠️ Supabase no está disponible, usando localStorage');
                return null;
            }

            // Obtener usuario actual
            const currentUserRaw = localStorage.getItem('currentUser');
            if (!currentUserRaw) {
                console.warn('⚠️ No hay usuario en localStorage');
                return null;
            }

            const currentUser = JSON.parse(currentUserRaw);
            const userId = currentUser.id;

            if (!userId) {
                console.warn('⚠️ No hay userId disponible');
                return null;
            }

            console.log('🔍 Consultando perfil del usuario en Supabase:', userId);

            // Consultar tabla users para obtener profile_picture_url
            const { data, error } = await window.supabase
                .from('users')
                .select('profile_picture_url')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('❌ Error consultando Supabase:', error);
                return null;
            }

            if (data && data.profile_picture_url) {
                console.log('✅ Avatar encontrado en Supabase:', data.profile_picture_url.substring(0, 80) + '...');
                this.profilePictureUrl = data.profile_picture_url;

                // Actualizar localStorage con la URL correcta
                currentUser.profile_picture_url = data.profile_picture_url;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                return data.profile_picture_url;
            } else {
                console.log('ℹ️ No hay foto de perfil en Supabase para este usuario');
                return null;
            }

        } catch (error) {
            console.error('❌ Error en loadAvatarFromSupabase:', error);
            return null;
        } finally {
            this.isLoadingFromSupabase = false;
        }
    }

    async init() {
        console.log('🎯 ProfileAvatarManager.init() - Iniciando...');

        // PRIORIDAD 1: Intentar cargar desde Supabase primero
        await this.loadAvatarFromSupabase();

        // Primera actualización inmediata con datos de Supabase o localStorage
        this.updateProfileAvatars();

        // Función específica para profile.html con retraso para asegurar DOM
        if (window.location.pathname.includes('profile.html')) {
            console.log('🎯 Página de perfil detectada - actualizando avatar específicamente');
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

        // Función específica para Community y Notices con múltiples intentos
        if (window.location.pathname.includes('/Community/') || window.location.pathname.includes('/Notices/')) {
            console.log('🎯 Página de Community/Notices detectada - configurando actualizaciones periódicas');

            // Múltiples intentos para asegurar que los avatares se actualicen
            // IMPORTANTE: Ahora espera a que Supabase responda antes del primer intento
            const updateIntervals = [500, 1000, 2000];
            updateIntervals.forEach(delay => {
                setTimeout(async () => {
                    console.log(`🔄 Actualizando avatares (intento después de ${delay}ms)`);
                    // Refrescar desde Supabase en cada intento
                    await this.loadAvatarFromSupabase();
                    this.updateProfileAvatars();
                }, delay);
            });

            // También después del evento load
            window.addEventListener('load', () => {
                console.log('🔄 Window load event - actualizando avatares');
                setTimeout(async () => {
                    await this.loadAvatarFromSupabase();
                    this.updateProfileAvatars();
                }, 300);
            });
        }

        // Escuchar cambios en localStorage para actualizar en tiempo real
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser') {
                console.log('🔄 currentUser cambió en localStorage - recargando desde Supabase');
                this.loadAvatarFromSupabase().then(() => {
                    this.updateProfileAvatars();
                });
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
            
            console.log('🔍 Datos del avatar en profile.html (PRIORITARIO):', {
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
            // PRIORIDAD 1: Usar URL de Supabase si ya la cargamos
            let profilePictureUrl = this.profilePictureUrl;

            // PRIORIDAD 2: Obtener desde localStorage como fallback
            const raw = localStorage.getItem('currentUser');
            if (!raw) {
                console.log('ℹ️ No hay datos de usuario en localStorage');
                return;
            }

            const currentUser = JSON.parse(raw);

            // Si no tenemos URL de Supabase, usar la de localStorage
            if (!profilePictureUrl) {
                profilePictureUrl = currentUser.profile_picture_url;
            }
            // Determinar la ruta por defecto basada en la ubicación actual
            const currentPath = window.location.pathname;
            let defaultAvatarUrl = '/assets/images/default-avatar.svg';

            // Ajustar ruta según la ubicación de la página
            if (currentPath.includes('/Community/') || currentPath.includes('/Notices/') || currentPath.includes('/q/')) {
                defaultAvatarUrl = '../assets/images/default-avatar.svg';
            } else if (currentPath.includes('/src/')) {
                defaultAvatarUrl = 'assets/images/default-avatar.svg';
            }

            console.log('🔍 ProfileAvatarManager - Datos del usuario:', {
                username: currentUser.username,
                profilePictureUrl: profilePictureUrl ? profilePictureUrl.substring(0, 80) + '...' : 'ninguno',
                hasProfilePicture: !!profilePictureUrl,
                source: this.profilePictureUrl ? '✅ Supabase' : (currentUser.profile_picture_url ? '📦 localStorage' : '❌ ninguno'),
                currentPath: window.location.pathname,
                defaultAvatarUrl: defaultAvatarUrl
            });

            // Buscar todos los elementos de avatar en la página
            const avatarSelectors = [
                '#avatarImage',                  // profile.html - PRIORIDAD ALTA
                '#headerProfileImg',             // Header avatar (Community, Notices)
                '#menuProfileImg',               // Menu avatar (Community, Notices)
                '.header-profile img',           // cursos.html, courses.html
                '.profile-menu .pm-avatar img',  // Menú de perfil
                '.catalog-header .header-profile img', // Header de catálogo
                '.pm-avatar img',                // Otros avatares
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
                            console.log(`✅ Actualizando avatar: ${selector}`);
                            console.log(`   De: ${currentSrc.substring(0, 50)}...`);
                            console.log(`   A: ${targetUrl.substring(0, 50)}...`);
                            img.src = targetUrl;
                            img.style.display = 'block';
                            totalImagesUpdated++;
                        }
                    }
                });
            });

            console.log(`📊 Avatares encontrados: ${totalImagesFound}, actualizados: ${totalImagesUpdated}`);
            
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

// Inicializar inmediatamente si el DOM ya está listo, o esperar al evento
if (document.readyState === 'loading') {
    // DOM aún no está listo, esperar al evento
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Inicializando ProfileAvatarManager (DOMContentLoaded)...');
        window.profileAvatarManager = new ProfileAvatarManager();
    });
} else {
    // DOM ya está listo, ejecutar inmediatamente
    console.log('🚀 Inicializando ProfileAvatarManager (inmediato)...');
    window.profileAvatarManager = new ProfileAvatarManager();
}

// Función global para actualizar avatares desde otros scripts
window.updateProfileAvatars = function() {
    if (window.profileAvatarManager) {
        window.profileAvatarManager.refreshAvatars();
    } else {
        // console.log('⚠️ ProfileAvatarManager no está disponible');
    }
};
