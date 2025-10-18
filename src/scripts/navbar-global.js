/**
 * NAVBAR GLOBAL UNIFICADA
 * Sistema de navbar sticky/fixed unificado para todas las páginas principales
 * Preserva funcionalidad sticky y consistencia visual en toda la aplicación
 */

const NavbarGlobal = {
    // Configuración de rutas base por página
    basePaths: {
        'community': '../',
        'cursos': '',
        'apps-directory': '',
        'notices': '../'
    },

    /**
     * Genera el HTML de la navbar con funcionalidad sticky/fixed preservada
     * @param {string} activeTab - Pestaña activa ('cursos', 'directorio', 'comunidad', 'noticias')
     * @param {string} currentPage - Página actual ('community', 'cursos', 'apps-directory', 'notices')
     * @returns {string} HTML de la navbar completa
     */
    create: function(activeTab, currentPage) {
        const basePath = this.basePaths[currentPage] || '../';

        return `
            <!-- Navigation Bar con funcionalidad sticky -->
            <div class="course-tabs">
                <!-- Logo/Brand (izquierda) -->
                <div class="navbar-brand">
                    <img src="${basePath}assets/images/icono.png" alt="Logo" />
                </div>
                
                <!-- Navegación (centro) -->
                <div class="navbar-navigation">
                    <button class="tab-button ${activeTab === 'cursos' ? 'active' : ''}"
                            data-tab="mis-cursos"
                            onclick="location.href='${basePath}cursos.html'">
                        <i class='bx bx-collection'></i>
                        Talleres
                    </button>
                    <button class="tab-button ${activeTab === 'directorio' ? 'active' : ''}"
                            data-tab="directorio"
                            onclick="location.href='${basePath}apps-directory.html'">
                        <i class='bx bx-grid-alt'></i>
                        Directorio IA
                    </button>
                    <button class="tab-button ${activeTab === 'comunidad' ? 'active' : ''}"
                            data-tab="comunidad"
                            onclick="location.href='${basePath}Community/community.html'">
                        <i class='bx bx-group'></i>
                        Comunidad
                    </button>
                    <button class="tab-button ${activeTab === 'noticias' ? 'active' : ''}"
                            data-tab="noticias"
                            onclick="location.href='${basePath}Notices/notices.html'">
                        <i class='bx bx-news'></i>
                        Noticias
                    </button>
                </div>
                
                <!-- Usuario (derecha) -->
                <div class="navbar-user">
                    <button class="header-profile">
                        <img id="headerProfileImg" src="${basePath}assets/images/default-avatar.svg" alt="Perfil"
                             onerror="this.onerror=null; this.src='${basePath}assets/images/default-avatar.svg';" />
                    </button>
                </div>
            </div>

            <!-- Menú de perfil completo -->
            <div id="profileMenu" class="profile-menu">
                <div class="pm-header">
                    <div class="pm-avatar">
                        <img id="menuProfileImg" src="${basePath}assets/images/default-avatar.svg" alt="Perfil"
                             onerror="this.onerror=null; this.src='${basePath}assets/images/default-avatar.svg';"/>
                    </div>
                    <div>
                        <div class="pm-name" id="pmName">Usuario</div>
                        <div class="pm-email" id="pmEmail">user@example.com</div>
                    </div>
                </div>
                <div class="pm-section">
                    <div class="pm-item" onclick="location.href='${basePath}estadisticas.html'">
                        <i class='bx bx-bar-chart-alt-2'></i> Mis Estadísticas
                    </div>
                    <div class="pm-item" onclick="location.href='${basePath}courses.html'">
                        <i class='bx bx-book'></i> Mi aprendizaje
                    </div>
                </div>
                <div class="pm-section">
                    <div class="pm-item" onclick="location.href='${basePath}profile.html'">
                        <i class='bx bx-user'></i> Editar perfil
                    </div>
                </div>
                <div class="pm-section">
                    <div class="pm-item" id="themeToggle" onclick="toggleTheme()">
                        <div class="theme-icon-container">
                            <i class='bx bx-sun theme-icon-sun'></i>
                            <i class='bx bx-moon theme-icon-moon'></i>
                        </div>
                        Cambiar tema
                    </div>
                </div>
                <div class="pm-section">
                    <div class="pm-item" onclick="location.href='${basePath}index.html'">
                        <i class='bx bx-log-out'></i> Cerrar sesión
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Inicializa la navbar en una página específica
     * @param {string} activeTab - Pestaña activa
     * @param {string} currentPage - Página actual
     */
    init: function(activeTab, currentPage) {
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.innerHTML = this.create(activeTab, currentPage);

            // Agregar clase al body para ajustar padding del contenido
            document.body.classList.add('has-global-navbar');

            // Inicializar funcionalidad del menú de perfil
            this.initProfileMenu();

            // Cargar datos del usuario
            this.loadUserData();

            // Sistema de reintentos para asegurar que el avatar se cargue
            // Similar a ProfileAvatarManager
            console.log('🎯 NavbarGlobal: Configurando reintentos para cargar avatar');
            const retryIntervals = [500, 1000, 2000];
            retryIntervals.forEach(delay => {
                setTimeout(async () => {
                    console.log(`🔄 NavbarGlobal: Reintento de carga de avatar (después de ${delay}ms)`);
                    await this.loadUserAvatar();
                }, delay);
            });

            // También después del evento load
            window.addEventListener('load', async () => {
                console.log('🔄 NavbarGlobal: Window load event - reintentando carga de avatar');
                setTimeout(async () => {
                    await this.loadUserAvatar();
                }, 300);
            });

            console.log(`✅ Navbar global inicializada - Página: ${currentPage}, Tab activa: ${activeTab}`);
        } else {
            console.error('❌ No se encontró el contenedor #navbar-container');
        }
    },

    /**
     * Inicializa los event listeners del menú de perfil
     */
    initProfileMenu: function() {
        const profileButton = document.querySelector('#navbar-container .header-profile');
        const profileMenu = document.getElementById('profileMenu');

        if (!profileButton || !profileMenu) {
            console.warn('⚠️ No se encontraron elementos del menú de perfil');
            return;
        }

        // Limpiar event listeners previos si existen
        const newProfileButton = profileButton.cloneNode(true);
        profileButton.parentNode.replaceChild(newProfileButton, profileButton);

        // Toggle del menú al hacer click en el botón de perfil
        newProfileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            profileMenu.classList.toggle('show');
            console.log('🔘 Toggle del menú de perfil');
        });

        // Cerrar menú al hacer click fuera (solo una vez)
        if (!document.body.hasAttribute('data-profile-menu-initialized')) {
            document.addEventListener('click', function(e) {
                const currentProfileButton = document.querySelector('#navbar-container .header-profile');
                const currentProfileMenu = document.getElementById('profileMenu');

                if (currentProfileButton && currentProfileMenu) {
                    if (!currentProfileButton.contains(e.target) && !currentProfileMenu.contains(e.target)) {
                        currentProfileMenu.classList.remove('show');
                    }
                }
            });

            // Prevenir que el menú se cierre al hacer click dentro de él
            profileMenu.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            document.body.setAttribute('data-profile-menu-initialized', 'true');
        }

        console.log('✅ Menú de perfil inicializado correctamente');
    },

    /**
     * Carga los datos del usuario desde localStorage y Supabase
     */
    loadUserData: async function() {
        try {
            // Intentar obtener datos del usuario desde diferentes fuentes
            let userData = null;
            let userId = null;

            // 1. Intentar desde 'currentUser' (usado por profile-avatar-manager)
            const currentUserRaw = localStorage.getItem('currentUser');
            if (currentUserRaw) {
                userData = JSON.parse(currentUserRaw);
                userId = userData.id || userData.user_id;
            }

            // 2. Si no existe, intentar desde 'user'
            if (!userData) {
                const userRaw = localStorage.getItem('user');
                if (userRaw) {
                    userData = JSON.parse(userRaw);
                    userId = userData.id || userData.user_id;
                }
            }

            if (!userData) {
                console.warn('⚠️ No se encontraron datos de usuario en localStorage');
                return;
            }

            // 3. Intentar cargar datos completos desde Supabase si está disponible
            if (window.supabase && userId) {
                console.log('🔍 Intentando cargar datos completos desde Supabase...');
                try {
                    const { data: userFromDB, error } = await window.supabase
                        .from('users')
                        .select('nombre, apellido, email, username, profile_picture_url')
                        .eq('id', userId)
                        .single();

                    if (!error && userFromDB) {
                        console.log('✅ Datos del usuario obtenidos de Supabase:', userFromDB);
                        // Combinar datos de Supabase con los de localStorage
                        userData = { ...userData, ...userFromDB };
                    }
                } catch (supabaseError) {
                    console.warn('⚠️ Error consultando Supabase:', supabaseError);
                }
            }

            // Actualizar nombre y email en el UI
            const pmName = document.getElementById('pmName');
            const pmEmail = document.getElementById('pmEmail');

            // Construir nombre completo si tenemos nombre y apellido
            let displayName = 'Usuario';
            if (userData.nombre && userData.apellido) {
                displayName = `${userData.nombre} ${userData.apellido}`;
            } else if (userData.nombre) {
                displayName = userData.nombre;
            } else if (userData.display_name) {
                displayName = userData.display_name;
            } else if (userData.name) {
                displayName = userData.name;
            } else if (userData.full_name) {
                displayName = userData.full_name;
            } else if (userData.username) {
                displayName = userData.username;
            }

            const displayEmail = userData.email || userData.correo || userData.user_email || 'user@example.com';

            if (pmName) {
                pmName.textContent = displayName;
                console.log('✅ Nombre de usuario actualizado:', displayName);
            }

            if (pmEmail) {
                pmEmail.textContent = displayEmail;
                console.log('✅ Email de usuario actualizado:', displayEmail);
            }

            // Cargar avatar si existe (await para esperar a Supabase)
            await this.loadUserAvatar();

        } catch (error) {
            console.warn('⚠️ Error cargando datos del usuario:', error);
        }
    },

    /**
     * Carga el avatar del usuario (async para esperar a Supabase)
     */
    loadUserAvatar: async function() {
        try {
            // Obtener datos del usuario desde múltiples fuentes
            let userData = null;

            const currentUserRaw = localStorage.getItem('currentUser');
            if (currentUserRaw) {
                userData = JSON.parse(currentUserRaw);
            } else {
                const userRaw = localStorage.getItem('user');
                if (userRaw) {
                    userData = JSON.parse(userRaw);
                }
            }

            // Intentar cargar avatar actualizado desde Supabase
            if (window.supabase && userData && userData.id) {
                try {
                    console.log('🔍 NavbarGlobal: Consultando avatar desde Supabase...');
                    const { data: userFromDB, error } = await window.supabase
                        .from('users')
                        .select('profile_picture_url')
                        .eq('id', userData.id)
                        .single();

                    if (!error && userFromDB && userFromDB.profile_picture_url) {
                        console.log('✅ NavbarGlobal: Avatar encontrado en Supabase');
                        // Actualizar userData con el avatar de Supabase
                        userData.profile_picture_url = userFromDB.profile_picture_url;

                        // Actualizar localStorage para futuros usos
                        localStorage.setItem('currentUser', JSON.stringify(userData));
                    }
                } catch (supabaseError) {
                    console.warn('⚠️ NavbarGlobal: Error consultando Supabase para avatar:', supabaseError);
                }
            }

            const headerProfileImg = document.querySelector('#navbar-container #headerProfileImg');
            const menuProfileImg = document.querySelector('#navbar-container #menuProfileImg');

            // Intentar cargar avatar desde diferentes fuentes con fallback dual
            // SOPORTE DUAL: profile_picture_url (nuevo) y avatar_url (legacy)
            let avatarUrl = null;

            if (userData) {
                // Usar fallback para ambos campos: profile_picture_url (Supabase) y avatar_url (legacy)
                avatarUrl = userData.profile_picture_url || userData.avatar_url;
            }

            // 3. Desde localStorage directo
            if (!avatarUrl && localStorage.getItem('userAvatar')) {
                avatarUrl = localStorage.getItem('userAvatar');
            }

            // 4. Desde sessionStorage
            if (!avatarUrl && sessionStorage.getItem('userAvatar')) {
                avatarUrl = sessionStorage.getItem('userAvatar');
            }

            // Aplicar avatar si se encontró
            if (avatarUrl) {
                if (headerProfileImg) {
                    headerProfileImg.src = avatarUrl;
                    console.log('✅ Avatar del header actualizado');
                }

                if (menuProfileImg) {
                    menuProfileImg.src = avatarUrl;
                    console.log('✅ Avatar del menú actualizado');
                }
            } else {
                console.log('ℹ️ No se encontró avatar personalizado, usando default');
            }

        } catch (error) {
            console.warn('⚠️ Error cargando avatar del usuario:', error);
        }
    }
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarGlobal;
}

// Hacer disponible globalmente en el navegador
if (typeof window !== 'undefined') {
    window.NavbarGlobal = NavbarGlobal;

    // Función global para re-inicializar el menú de perfil
    // Útil cuando otros scripts actualizan los avatares
    window.reinitProfileMenu = function() {
        if (NavbarGlobal && typeof NavbarGlobal.initProfileMenu === 'function') {
            console.log('🔄 Re-inicializando menú de perfil desde función global');
            NavbarGlobal.initProfileMenu();
        }
    };
}