// ===== COMMUNITY PAGE JAVASCRIPT =====

class CommunityPage {
    constructor() {
        this.currentChat = null;
        this.currentUser = {
            id: 1,
            name: 'Usuario',
            role: 'Estudiante',
            avatar: 'fas fa-user'
        };
        this.db = null;
        this.inviteOnlySlugs = new Set(['openminder', 'sif-icap', 'ecos-de-liderazgo']);
        this.slugCategoryMap = {
            profesionales: 'general',
            openminder: 'negocios',
            'sif-icap': 'negocios',
            'ecos-de-liderazgo': 'negocios'
        };
        this.slugIconMap = {
            profesionales: 'fas fa-globe',
            openminder: 'fas fa-lightbulb'
        };
        this.slugBannerMap = {
            profesionales: './images/comunidad-general.png',
            openminder: './images/openminder.png'
        };
        // Datos de Discover
        this.communities = [];
        this.communityStats = { totalMembers: 0, totalPosts: 0 };
        this.posts = [];
        this.leaderboard = [];
        
        this.init();
    }

    async init() {
        try {
            console.log('[COMMUNITY] 🚀 Iniciando sistema de comunidades...');

            // NUEVO: Debug completo de autenticación
            this.debugUserAuthentication();

            // Verificar que CommunityDatabase esté disponible
            if (typeof CommunityDatabase === 'undefined') {
                console.error('[COMMUNITY] ❌ CommunityDatabase no está definido');
                console.error('[COMMUNITY] 🔍 Verificar que community-database.js se cargue antes que community.js');
                throw new Error('CommunityDatabase no está disponible - Verificar orden de scripts');
            }

            // Verificar que main.js no tenga errores
            if (typeof window === 'undefined') {
                throw new Error('Entorno de JavaScript no disponible');
            }

            // Intentar inicializar Supabase UNA SOLA VEZ
            console.log('[COMMUNITY] 🔄 Verificando Supabase...');
            const supabaseOk = await this.ensureSupabaseClient();

            if (!supabaseOk) {
                console.error('[COMMUNITY] ❌ Supabase no disponible - Mostrando error al usuario');
                this.showSupabaseError();
                return;
            }

            // Continuar con inicialización normal
            console.log('[COMMUNITY] 🔄 Inicializando CommunityDatabase...');
            this.db = new CommunityDatabase();
            await this.db.initialize();
            await this.loadCommunityData();

            console.log('[COMMUNITY] ✅ Sistema de comunidades inicializado');

        } catch (error) {
            console.error('[COMMUNITY] ❌ Error crítico en init:', error);

            // Mostrar error específico según el tipo
            if (error.message.includes('CommunityDatabase')) {
                this.showScriptError('CommunityDatabase no disponible', 'Verificar que community-database.js se cargue correctamente');
            } else {
                this.showSupabaseError();
            }
        }

        this.setupEventListeners();
        this.setupAnimations();
        this.fillUserHeader();
    }

    // NUEVA función para debug completo de autenticación
    debugUserAuthentication() {
        console.log('🔍 === DEBUG AUTENTICACIÓN DE USUARIO (COMMUNITY) ===');

        // Verificar localStorage (donde funciona el menú de perfil)
        console.log('📊 LocalStorage:');
        const localStorageKeys = ['currentUser', 'userData', 'user', 'authToken', 'userSession', 'profile'];
        localStorageKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value && value !== 'null' && value !== 'undefined') {
                console.log(`  ✅ ${key}: Presente (${value.length} chars)`, value.substring(0, 100) + '...');

                // Intentar parsear para ver contenido
                try {
                    const parsed = JSON.parse(value);
                    if (parsed && (parsed.email || parsed.id)) {
                        console.log(`    📧 Email: ${parsed.email || 'No definido'}`);
                        console.log(`    🆔 ID: ${parsed.id || parsed.user_id || 'No definido'}`);
                    }
                } catch (e) {
                    console.log(`    ⚠️ No es JSON válido`);
                }
            } else {
                console.log(`  ❌ ${key}: Ausente o null`);
            }
        });

        // Verificar sessionStorage
        console.log('📊 SessionStorage:');
        localStorageKeys.forEach(key => {
            const value = sessionStorage.getItem(key);
            if (value && value !== 'null') {
                console.log(`  ✅ ${key}: Presente (${value.length} chars)`);
            } else {
                console.log(`  ❌ ${key}: Ausente`);
            }
        });

        // Verificar variables globales
        console.log('📊 Variables globales:');
        console.log('  window.currentUser:', window.currentUser ? '✅ Presente' : '❌ Ausente');
        console.log('  window.user:', window.user ? '✅ Presente' : '❌ Ausente');
        console.log('  window.userData:', window.userData ? '✅ Presente' : '❌ Ausente');

        // Verificar AuthUtils
        console.log('📊 AuthUtils:');
        if (window.AuthUtils) {
            console.log('  ✅ AuthUtils disponible');
            // Usar AuthUtils para debug completo
            window.AuthUtils.debugAuthenticationState();
        } else {
            console.log('  ❌ AuthUtils NO disponible - Verificar carga de script');
        }

        // Verificar estado de Supabase
        console.log('📊 Estado Supabase:');
        console.log('  window.supabase:', window.supabase ? '✅ Disponible' : '❌ No disponible');
        console.log('  window.supabaseInitialized:', window.supabaseInitialized);

        if (window.supabase && window.supabase.auth) {
            console.log('  ✅ Supabase auth disponible - Verificando sesión...');
            window.supabase.auth.getSession().then(({ data: { session }, error }) => {
                console.log('  📊 Supabase session:', session ? '✅ Presente' : '❌ Ausente');
                console.log('  📊 Supabase session error:', error);
                if (session?.user) {
                    console.log('  📧 Supabase user email:', session.user.email);
                }
            }).catch(err => {
                console.log('  ❌ Error obteniendo sesión Supabase:', err);
            });
        } else {
            console.log('  ❌ Supabase auth NO disponible');
        }

        console.log('🔍 === FIN DEBUG AUTENTICACIÓN (COMMUNITY) ===');
    }

    async ensureSupabaseClient() {
        console.log('[COMMUNITY] 🔍 Verificando cliente Supabase...');

        // UNA SOLA VERIFICACIÓN - NO REINTENTOS
        if (window.supabase && window.supabaseInitialized) {
            console.log('[COMMUNITY] ✅ Supabase ya disponible');
            return true;
        }

        // UN SOLO INTENTO DE INICIALIZACIÓN
        try {
            console.log('[COMMUNITY] 🔄 Intentando inicializar Supabase (una sola vez)...');
            await initializeSupabaseClient();

            if (window.supabase && window.supabaseInitialized) {
                console.log('[COMMUNITY] ✅ Supabase inicializado exitosamente');
                return true;
            } else {
                console.error('[COMMUNITY] ❌ Supabase no se inicializó correctamente');
                return false;
            }
        } catch (error) {
            console.error('[COMMUNITY] ❌ Error inicializando Supabase:', error);
            return false;
        }
    }
    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Navigation bar functionality
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            if(btn.dataset && btn.dataset.tab){
                btn.addEventListener('click', () => { this.handleTabClick(btn); });
            }
        });

        // Filtros Discover
        document.querySelectorAll('.discover-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.discover-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.renderDiscover(chip.dataset.category, (document.getElementById('discoverSearch')?.value || ''));
            });
        });

        // BÃºsqueda Discover
        const search = document.getElementById('discoverSearch');
        const clearBtn = document.getElementById('discoverClear');
        if(search){
            const trigger = () => {
                const active = document.querySelector('.discover-chip.active');
                const cat = active ? active.dataset.category : 'all';
                const q = search.value.trim();
                if(clearBtn){ clearBtn.style.display = q ? 'inline-flex' : 'none'; }
                this.renderDiscover(cat, q);
            };
            search.addEventListener('input', trigger);
            search.addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ trigger(); }});
        }
        if(clearBtn){
            clearBtn.addEventListener('click', ()=>{
                const searchEl = document.getElementById('discoverSearch');
                if(searchEl){ searchEl.value=''; }
                clearBtn.style.display='none';
                const active = document.querySelector('.discover-chip.active');
                const cat = active ? active.dataset.category : 'all';
                this.renderDiscover(cat, '');
                searchEl?.focus();
            });
        }

        // (Feed removido)
    }

    fillUserHeader(){
        try{
            const raw = localStorage.getItem('currentUser');
            if(raw) {
                const user = JSON.parse(raw);
                const nameEl = document.getElementById('pmName');
                const emailEl = document.getElementById('pmEmail');
                if(nameEl && user.display_name) nameEl.textContent = user.display_name;
                if(emailEl) emailEl.textContent = user.email || user.user?.email || user.data?.email || '';
                if(user.avatar_url){
                    document.querySelectorAll('.header-profile img, #profileMenu .pm-avatar img').forEach(img=>{img.src=user.avatar_url;});
                }
            }
        }catch(e){
            console.log('Error loading user data:', e);
        }
        
        // Setup profile menu functionality
        this.setupProfileMenu();
    }

    setupProfileMenu() {
        const avatarBtn = document.querySelector('.header-profile');
        const menu = document.getElementById('profileMenu');
        if (!avatarBtn || !menu) {
            console.error('[PROFILE] âŒ Elementos del menÃº de perfil no encontrados');
            return;
        }
        console.log('[PROFILE] ✅ Menú de perfil configurado correctamente');
        
        avatarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            menu.classList.toggle('show');
        });
        
        // Cerrar menÃº al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
        
        // Llenar datos del usuario
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const nameEl = document.getElementById('pmName');
            const emailEl = document.getElementById('pmEmail');
            if (nameEl) nameEl.textContent = currentUser.display_name || currentUser.username || 'Usuario';
            if (emailEl) emailEl.textContent = currentUser.email || currentUser.user?.email || currentUser.data?.email || '';
            // avatar
            if (currentUser.avatar_url) {
                document.querySelectorAll('.header-profile img, #profileMenu .pm-avatar img').forEach(img => {
                    img.src = currentUser.avatar_url;
                });
            }
        } catch (e) { /* noop */ }
    }

    // ===== NAVIGATION HANDLING =====
    handleTabClick(clickedBtn) {
        // Get the tab from data attribute
        const tab = clickedBtn.dataset.tab;
        
        // Handle different tabs
        switch(tab) {
            case 'mis-cursos':
                // Navegar a la versiÃ³n ES de cursos
                window.location.href = '../cursos.html';
                break;
            case 'noticias':
                // Navigate directly to news page without showing toast
                window.location.href = '../Notices/notices.html';
                break;
            case 'comunidad':
                // Reload the current page to restart the community page
                window.location.reload();
                break;
            default:
                this.showToast('SecciÃ³n no disponible', 'warning');
        }
    }

    // ===== DATA LOADING =====
    async loadCommunityData() {
        console.log('📊 ULTRATHINK: Cargando datos de comunidad con autenticación mejorada...');
        this.showLoading();

        try {
            if (!this.db) {
                console.warn('[COMMUNITY] Base de datos no inicializada');
                this.communities = [];
                this.communityStats = { totalMembers: 0, totalPosts: 0 };
                this.renderDiscover('all', '');
                this.updateStats();
                return;
            }

            // ULTRATHINK: Verificar estado de autenticación antes de cargar comunidades
            console.log('🔍 ULTRATHINK: Verificando autenticación antes de cargar comunidades...');
            const currentUser = await this.db.getCurrentUser();
            console.log('👤 ULTRATHINK: Estado de autenticación:', currentUser ? currentUser.email : 'No autenticado');

            // Obtener comunidades usando método ULTRATHINK híbrido
            console.log('🏘️ ULTRATHINK: Cargando comunidades con método híbrido...');
            this.communities = await this.db.getCommunities();
            console.log('🏘️ ULTRATHINK: Comunidades cargadas:', this.communities);
            console.log('📊 ULTRATHINK: Número de comunidades encontradas:', this.communities.length);

            if (this.communities.length === 0) {
                console.warn('⚠️ ULTRATHINK: No se encontraron comunidades - DIAGNÓSTICO COMPLETO:');
                console.warn('  1. 📊 Estado autenticación:', currentUser ? '✅ Usuario autenticado' : '❌ Sin autenticación');
                console.warn('  2. 🏗️ Datos en tabla communities');
                console.warn('  3. 🔍 Filtros aplicados (is_active, etc.)');
                console.warn('  4. 🔐 Permisos Row Level Security (RLS)');
                console.warn('  5. 🔑 Políticas de acceso en Supabase');
                console.warn('  📋 ACCIÓN: Revisar console log del método getCommunities() para detalles específicos');
            }

            const baseCommunities = this.communities;

            if (!Array.isArray(baseCommunities) || baseCommunities.length === 0) {
                this.communities = [];
                this.communityStats = { totalMembers: 0, totalPosts: 0 };
                this.renderDiscover('all', '');
                this.updateStats();
                return;
            }

            const hydrated = await Promise.all(baseCommunities.map(async (community) => {
                let memberCount = 0;
                let postCount = 0;

                try {
                    if (typeof this.db.countCommunityMembers === 'function') {
                        memberCount = await this.db.countCommunityMembers(community.id);
                    } else if (typeof this.db.getCommunityMembers === 'function') {
                        const members = await this.db.getCommunityMembers(community.id);
                        memberCount = Array.isArray(members) ? members.length : 0;
                    }
                } catch (memberError) {
                    console.warn('[COMMUNITY] Error obteniendo miembros:', memberError);
                }

                try {
                    if (typeof this.db.countCommunityPosts === 'function') {
                        postCount = await this.db.countCommunityPosts(community.id);
                    }
                } catch (postError) {
                    console.warn('[COMMUNITY] Error obteniendo publicaciones:', postError);
                }

                return this.mapCommunityRecord(community, memberCount, postCount);
            }));

            this.communities = hydrated;
            this.communityStats.totalMembers = hydrated.reduce((sum, item) => sum + (item.memberCount || 0), 0);
            this.communityStats.totalPosts = hydrated.reduce((sum, item) => sum + (item.postCount || 0), 0);

            // Obtener estadísticas
            console.log('📈 Estadísticas:', this.communityStats);

            const activeChip = document.querySelector('.discover-chip.active');
            const category = activeChip ? activeChip.dataset.category : 'all';
            const query = (document.getElementById('discoverSearch')?.value || '').trim();

            // Renderizar
            this.renderDiscover(category, query);
            this.updateStats();
        } catch (error) {
            console.error('[COMMUNITY] Error cargando comunidades:', error);
            this.communities = [];
            this.communityStats = { totalMembers: 0, totalPosts: 0 };
            this.renderDiscover('all', '');
            this.updateStats();
            this.showToast('No se pudieron cargar tus comunidades. Intenta nuevamente.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    mapCommunityRecord(record, memberCount = 0, postCount = 0) {
        const slug = record.slug || String(record.id);
        const category = this.getCategoryForCommunity(record);
        const icon = this.getIconForCommunity(record);
        const banner = record.banner_url || record.cover_image_url || record.hero_image_url || record.image_url || this.defaultBannerForSlug(slug);
        const accessLabel = this.getAccessLabel(record, slug);

        return {
            id: record.id,
            slug,
            title: record.name || record.title || 'Comunidad',
            description: record.description || '',
            category,
            icon,
            thumb: banner,
            memberCount,
            postCount,
            membersLabel: memberCount ? this.formatMemberCount(memberCount) + ' Members' : '0 Members',
            accessLabel,
            inviteOnly: this.inviteOnlySlugs.has(slug) || accessLabel.toLowerCase() !== 'free'
        };
    }

    formatMemberCount(value) {
        if (!value) return '0';
        if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
        return String(value);
    }

    defaultBannerForSlug(slug) {
        return this.slugBannerMap[slug] || '';
    }

    getIconForCommunity(record) {
        const slug = record.slug || '';
        if (this.slugIconMap[slug]) {
            return this.slugIconMap[slug];
        }
        return record.icon_class || record.icon || 'fas fa-users';
    }

    getCategoryForCommunity(record) {
        const slug = record.slug || '';
        if (record.category) {
            return String(record.category).toLowerCase();
        }
        if (this.slugCategoryMap[slug]) {
            return this.slugCategoryMap[slug];
        }
        return 'general';
    }

    getAccessLabel(record, slug) {
        if (record.access_label) {
            return record.access_label;
        }
        if (record.access_type === 'invite_only' || record.visibility === 'invite_only') {
            return 'Invitación';
        }
        if (this.inviteOnlySlugs.has(slug)) {
            return 'Invitación';
        }
        return 'Free';
    }

    escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ===== DISCOVER GRID =====
    renderDiscover(category = 'all', query = '') {
        const grid = document.getElementById('discoverGrid');
        if (!grid) return;

        const normalizedCategory = category || 'all';
        const normalizedQuery = (query || '').toLowerCase();

        const filteredByCategory = normalizedCategory === 'all'
            ? this.communities
            : this.communities.filter(c => (c.category || 'general') === normalizedCategory);

        const list = normalizedQuery
            ? filteredByCategory.filter(c => `${c.title} ${c.description}`.toLowerCase().includes(normalizedQuery))
            : filteredByCategory;

        if (!list.length) {
            grid.innerHTML = `
                <div class="discover-empty">
                    <i class="fas fa-users-slash"></i>
                    <h3>No tienes comunidades disponibles</h3>
                    <p>Cuando recibas acceso a una comunidad aparecerá en este panel.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = list.map(c => {
            const title = this.escapeHtml(c.title);
            const desc = this.escapeHtml(c.description) || 'Pronto tendrás más detalles.';
            const membersLabel = this.escapeHtml(c.membersLabel || '0 Members');
            const accessLabel = this.escapeHtml(c.accessLabel || 'Free');
            const cardSlug = this.escapeHtml(c.slug);
            const iconClass = this.escapeHtml(c.icon || 'fas fa-users');

            return `
                <div class="discover-card" data-slug="${cardSlug}">
                    <div class="discover-thumb">
                        ${c.thumb ? `<img src="${c.thumb}" alt="${title}" class="discover-image">` : ''}
                    </div>
                    <div class="discover-body">
                        <div class="discover-icon"><i class="${iconClass}"></i></div>
                        <div class="discover-main">
                            <div class="discover-title">${title}</div>
                            <div class="discover-desc">${desc}</div>
                            <div class="discover-meta"><span>${membersLabel}</span><span class="dot"></span><span>${accessLabel}</span></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        grid.querySelectorAll('.discover-card').forEach(card => {
            card.addEventListener('click', () => {
                const slug = card.getAttribute('data-slug');
                if (!slug) return;
                window.location.href = `./community-view.html?slug=${encodeURIComponent(slug)}`;
            });
        });
    }

    // (Se elimina el mÃ³dulo de feed)

    // ===== ACTIVITY FEED =====
    renderActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        
        activityFeed.innerHTML = this.activityData.map(activity => `
            <div class="activity-item">
                <div class="activity-avatar">
                    <i class="${activity.avatar}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${activity.user}</strong> ${activity.action}
                    </div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    loadMoreActivity() {
        // Simulate loading more activity
        this.showToast('Cargando mÃ¡s actividad...', 'info');
        
        setTimeout(() => {
            // Add more mock activity
            const newActivity = [
                {
                    id: this.activityData.length + 1,
                    user: 'Laura FernÃ¡ndez',
                    avatar: 'fas fa-user',
                    action: 'completÃ³ el curso de ChatGPT',
                    time: 'Hace 3 horas'
                },
                {
                    id: this.activityData.length + 2,
                    user: 'Diego RamÃ­rez',
                    avatar: 'fas fa-user',
                    action: 'se uniÃ³ a la comunidad',
                    time: 'Hace 4 horas'
                }
            ];

            this.activityData.push(...newActivity);
            this.renderActivityFeed();
            this.showToast('Actividad actualizada', 'success');
        }, 1000);
    }

    // ===== STATISTICS =====
    updateStats() {
        // EstadÃ­sticas del hero
        const totalMembersElement = document.getElementById('totalMembers');
        const totalPostsElement = document.getElementById('totalPosts');
        if (totalMembersElement) this.animateNumber(totalMembersElement, 0, this.communityStats.totalMembers, 2000);
        if (totalPostsElement) this.animateNumber(totalPostsElement, 0, this.communityStats.totalPosts, 2000);
    }

    // (Se elimina updateChatStats)

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easeOutCubic);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        requestAnimationFrame(updateNumber);
    }

    // ===== ANIMATIONS =====
    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.guideline-card, .discover-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ===== UTILITIES =====
    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    showSupabaseError() {
        console.log('[COMMUNITY] 📊 Mostrando error de Supabase al usuario...');
        this.communities = [];
        this.communityStats = { totalMembers: 0, totalPosts: 0 };
        this.renderDiscover('all', '');
        this.updateStats();
        this.showToast('No se pudieron cargar tus comunidades. Base de datos no disponible.', 'error');
        this.hideLoading();
    }

    showScriptError(title, message) {
        console.log('🚨 Mostrando error de script al usuario');

        const discoverGrid = document.getElementById('discoverGrid');
        if (discoverGrid) {
            discoverGrid.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <p>Revisar consola del navegador para más detalles.</p>
                    <button onclick="location.reload()" class="retry-button">Recargar Página</button>
                </div>
            `;
        }

        this.updateStatsWithError();
    }

    updateStatsWithError() {
        this.communities = [];
        this.communityStats = { totalMembers: 0, totalPosts: 0 };
        this.updateStats();
        this.hideLoading();
    }
}

// ===== THEME TOGGLE FUNCTIONS =====
window.toggleTheme = function() {
    console.log('ðŸŽ¨ Theme toggle called from community');

    // Agregar efecto de click al botÃ³n
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.classList.add('clicked');
        setTimeout(() => {
            themeToggle.classList.remove('clicked');
        }, 400);
    }

    // Obtener tema actual antes del cambio
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Usar la funciÃ³n global de cambio de tema
    if (window.toggleGlobalTheme) {
        window.toggleGlobalTheme();
        console.log('ðŸŽ¨ Theme toggled via global function to:', newTheme);
    } else {
        // Fallback manual si el script global no estÃ¡ disponible
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
        console.log('ðŸŽ¨ Theme toggled via fallback to:', newTheme);
    }

    // Activar animaciÃ³n de transformaciÃ³n
    const iconContainer = document.querySelector('.theme-icon-container');
    if (iconContainer) {
        // Limpiar clases previas
        iconContainer.classList.remove('theme-transforming', 'theme-transforming-reverse');

        // Aplicar la animaciÃ³n correcta
        if (newTheme === 'light') {
            iconContainer.classList.add('theme-transforming');
        } else {
            iconContainer.classList.add('theme-transforming-reverse');
        }

        // Remover clase despuÃ©s de la animaciÃ³n
        setTimeout(() => {
            iconContainer.classList.remove('theme-transforming', 'theme-transforming-reverse');
        }, 800);
    }
};

window.updateThemeIcons = function(theme) {
    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');
    const themeToggle = document.getElementById('themeToggle');
    const iconContainer = document.querySelector('.theme-icon-container');

    if (sunIcon && moonIcon && themeToggle && iconContainer) {
        // Agregar clases de animaciÃ³n
        themeToggle.classList.add('theme-changing');

        // Determinar la direcciÃ³n de la animaciÃ³n
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const isTransitioningToLight = theme === 'light' && currentTheme === 'dark';
        const isTransitioningToDark = theme === 'dark' && currentTheme === 'light';

        if (isTransitioningToLight) {
            // De oscuro a claro: sol se transforma en luna
            iconContainer.classList.add('theme-transforming');
            iconContainer.classList.remove('theme-transforming-reverse');
        } else if (isTransitioningToDark) {
            // De claro a oscuro: luna se transforma en sol
            iconContainer.classList.add('theme-transforming-reverse');
            iconContainer.classList.remove('theme-transforming');
        }

        // Remover clases de animaciÃ³n despuÃ©s de completar
        setTimeout(() => {
            themeToggle.classList.remove('theme-changing');
            iconContainer.classList.remove('theme-transforming', 'theme-transforming-reverse');
        }, 800);
    }
};

// ===== INITIALIZATION =====
let communityPage;

document.addEventListener('DOMContentLoaded', () => {
    communityPage = new CommunityPage();
});

// ===== GLOBAL FUNCTIONS =====
window.communityPage = communityPage;


















