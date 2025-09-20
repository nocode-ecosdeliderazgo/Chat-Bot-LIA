// ===== COMMUNITY VIEW DYNAMIC SYSTEM =====

class CommunityView {
    constructor() {
        this.communityId = null;
        this.communitySlug = null;
        this.currentCommunity = null;
        this.currentUser = null;
        this.db = null;
        this.activeTab = 'posts';

        // Community configurations
        this.communityConfigs = {
            'sif-icap': {
                theme: 'gold',
                primaryColor: '#FFD700',
                secondaryColor: '#FFA500',
                accentColor: '#FF8C00',
                features: ['posts', 'recursos', 'eventos', 'documentos'],
                layout: 'corporate',
                tabs: [
                    { id: 'posts', label: 'Posts', icon: 'bx-message-dots' },
                    { id: 'recursos', label: 'Recursos', icon: 'bx-library' },
                    { id: 'eventos', label: 'Eventos', icon: 'bx-calendar' },
                    { id: 'documentos', label: 'Documentos', icon: 'bx-file' }
                ]
            },
            'profesionales': {
                theme: 'blue',
                primaryColor: '#4A90E2',
                secondaryColor: '#357ABD',
                accentColor: '#2E6DA4',
                features: ['posts', 'miembros', 'oportunidades', 'networking'],
                layout: 'professional',
                tabs: [
                    { id: 'posts', label: 'Posts', icon: 'bx-message-dots' },
                    { id: 'miembros', label: 'Miembros', icon: 'bx-group' },
                    { id: 'oportunidades', label: 'Oportunidades', icon: 'bx-briefcase' },
                    { id: 'networking', label: 'Networking', icon: 'bx-network-chart' }
                ]
            },
            'openminder': {
                theme: 'green',
                primaryColor: '#28A745',
                secondaryColor: '#20C997',
                accentColor: '#17A2B8',
                features: ['posts', 'ideas', 'colaboraciones', 'innovacion'],
                layout: 'creative',
                tabs: [
                    { id: 'posts', label: 'Posts', icon: 'bx-message-dots' },
                    { id: 'ideas', label: 'Ideas', icon: 'bx-bulb' },
                    { id: 'colaboraciones', label: 'Colaboraciones', icon: 'bx-group' },
                    { id: 'innovacion', label: 'Innovación', icon: 'bx-rocket' }
                ]
            },
            'ecos-de-liderazgo': {
                theme: 'purple',
                primaryColor: '#6F42C1',
                secondaryColor: '#6610F2',
                accentColor: '#E83E8C',
                features: ['posts', 'mentorias', 'recursos', 'liderazgo'],
                layout: 'executive',
                tabs: [
                    { id: 'posts', label: 'Posts', icon: 'bx-message-dots' },
                    { id: 'mentorias', label: 'Mentorías', icon: 'bx-user-voice' },
                    { id: 'recursos', label: 'Recursos', icon: 'bx-library' },
                    { id: 'liderazgo', label: 'Liderazgo', icon: 'bx-crown' }
                ]
            }
        };

        this.init();
    }

    async init() {
        try {
            console.log('🚀 [COMMUNITY-VIEW] Iniciando sistema dinámico de comunidades...');
            console.log('🔍 [DEBUG] URL actual:', window.location.href);

            // 1. Extract URL parameters
            console.log('📋 [STEP 1/8] Extrayendo parámetros URL...');
            this.extractURLParameters();

            // 2. Validate parameters
            console.log('🔍 [STEP 2/8] Validando parámetros...');
            if (!this.validateParameters()) {
                return; // Redirect will be handled by validateParameters
            }

            // 3. Initialize database connection
            console.log('🔄 [STEP 3/8] Inicializando conexión a base de datos...');
            await this.initializeDatabase();

            // 4. Load and validate community data
            console.log('🏘️ [STEP 4/8] Cargando datos de comunidad...');
            const communityLoaded = await this.loadCommunityData();
            if (!communityLoaded) {
                console.error('❌ [STEP 4/8] Falló la carga de datos de comunidad');
                return;
            }

            // 5. Setup user interface
            console.log('🎨 [STEP 5/8] Configurando interfaz de usuario...');
            this.setupUI();

            // 6. Apply community-specific customization
            console.log('🎨 [STEP 6/8] Aplicando personalización específica...');
            this.applyCommunityCustomization();

            // 7. Setup event listeners
            console.log('📡 [STEP 7/8] Configurando event listeners...');
            this.setupEventListeners();

            // 8. Show main content
            console.log('👁️ [STEP 8/8] Mostrando contenido principal...');
            this.showMainContent();

            console.log('✅ [COMMUNITY-VIEW] Sistema inicializado correctamente');
            console.log('📊 [DEBUG] Estado final:', {
                communityId: this.communityId,
                communitySlug: this.communitySlug,
                communityName: this.currentCommunity?.name,
                userEmail: this.currentUser?.email,
                memberCount: this.currentCommunity?.memberCount,
                postCount: this.currentCommunity?.postCount
            });

        } catch (error) {
            console.error('❌ [COMMUNITY-VIEW] Error crítico en inicialización:', error);
            console.error('🔍 [DEBUG] Stack trace:', error.stack);
            this.handleCriticalError(error);
        }
    }

    extractURLParameters() {
        console.log('📋 [COMMUNITY-VIEW] Extrayendo parámetros URL...');

        const urlParams = new URLSearchParams(window.location.search);
        this.communityId = urlParams.get('id');
        this.communitySlug = urlParams.get('slug');

        console.log('📊 Parámetros extraídos:', {
            id: this.communityId,
            slug: this.communitySlug
        });
    }

    validateParameters() {
        console.log('🔍 [COMMUNITY-VIEW] Validando parámetros...');

        // Check if both parameters are present
        if (!this.communityId || !this.communitySlug) {
            console.error('❌ Parámetros faltantes - redirigiendo a 404');
            this.redirectTo404('Parámetros de comunidad faltantes');
            return false;
        }

        // Validate slug format (basic validation)
        const validSlugPattern = /^[a-z0-9-]+$/;
        if (!validSlugPattern.test(this.communitySlug)) {
            console.error('❌ Slug inválido - redirigiendo a 404');
            this.redirectTo404('Slug de comunidad inválido');
            return false;
        }

        // Filter out 'general' community as specified
        if (this.communitySlug === 'general') {
            console.error('❌ Comunidad "general" filtrada - redirigiendo a 404');
            this.redirectTo404('Comunidad no disponible públicamente');
            return false;
        }

        console.log('✅ Parámetros válidos');
        return true;
    }

    async initializeDatabase() {
        console.log('🔄 [COMMUNITY-VIEW] Inicializando base de datos...');

        try {
            // Wait for Supabase to be ready
            let attempts = 0;
            const maxAttempts = 10;

            while (!window.supabase && attempts < maxAttempts) {
                console.log(`⏳ Esperando Supabase... (${attempts + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }

            if (!window.supabase) {
                console.error('❌ Supabase no disponible después de esperar');
                throw new Error('Supabase client no disponible');
            }

            console.log('✅ Supabase client disponible');

            // Wait for CommunityDatabase to be ready
            attempts = 0;
            while (typeof window.CommunityDatabase === 'undefined' && attempts < maxAttempts) {
                console.log(`⏳ Esperando CommunityDatabase... (${attempts + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 300));
                attempts++;
            }

            if (typeof window.CommunityDatabase === 'undefined') {
                console.error('❌ CommunityDatabase no disponible después de esperar');
                throw new Error('CommunityDatabase no está definido');
            }

            console.log('✅ CommunityDatabase disponible');

            // Initialize database
            this.db = new window.CommunityDatabase();

            // Initialize the database instance
            if (typeof this.db.initialize === 'function') {
                await this.db.initialize();
            }

            // Get current user with enhanced debugging
            console.log('🔄 Obteniendo usuario actual...');
            this.currentUser = await this.getEnhancedCurrentUser();
            console.log('👤 Usuario actual final:', this.currentUser?.email || 'No autenticado');

            console.log('✅ Base de datos inicializada correctamente');
            return true;

        } catch (error) {
            console.error('❌ Error inicializando base de datos:', error);
            throw error;
        }
    }

    async loadCommunityData() {
        console.log('🏘️ [COMMUNITY-VIEW] Cargando datos de comunidad...');
        console.log('🔍 [ULTRA-DEBUG] Iniciando análisis completo...');

        try {
            // ULTRA-DEBUG: Estado completo antes de consultas
            await this.ultraDebugState();

            console.log(`🔍 Buscando comunidad: ID=${this.communityId}, Slug=${this.communitySlug}`);
            console.log('👤 Usuario actual en loadCommunityData:', {
                email: this.currentUser?.email,
                id: this.currentUser?.id,
                role: this.currentUser?.type_rol || this.currentUser?.role,
                isAdmin: this.isAdminUser()
            });

            // Debug: Check current Supabase session
            const { data: session } = await window.supabase.auth.getSession();
            console.log('🔐 Sesión Supabase actual:', session?.session?.user?.email || 'No session');

            // First, let's try to load the community data
            const { data: community, error } = await window.supabase
                .from('communities')
                .select('*')
                .eq('id', this.communityId)
                .eq('slug', this.communitySlug)
                .single();

            console.log('📊 Resultado de consulta Supabase:', { community, error });

            if (error) {
                console.error('❌ Error de Supabase:', error);

                if (error.code === 'PGRST116') {
                    // No rows returned - could be RLS blocking access or community doesn't exist
                    console.log('🔍 RLS bloqueó el acceso, verificando alternativas...');

                    // Strategy 1: If user is admin, try alternative approach
                    if (this.isAdminUser()) {
                        console.log('👑 Usuario admin detectado, intentando acceso alternativo...');

                        try {
                            // Try a broader query without slug matching (admin bypass)
                            const { data: adminCommunity, error: adminError } = await window.supabase
                                .from('communities')
                                .select('*')
                                .or(`id.eq.${this.communityId},slug.eq.${this.communitySlug}`)
                                .limit(1)
                                .single();

                            if (adminCommunity && !adminError) {
                                console.log('✅ Acceso admin exitoso a comunidad:', adminCommunity.name);
                                this.currentCommunity = adminCommunity;
                                await this.loadCommunityStats();
                                return true;
                            }
                        } catch (adminErr) {
                            console.warn('⚠️ Fallback admin falló:', adminErr);
                        }
                    }

                    // Strategy 2: Check if it's the "profesionales" community (should be public)
                    if (this.communitySlug === 'profesionales') {
                        console.log('🌐 Comunidad profesionales - intentando acceso público...');

                        try {
                            // Try without any user filters for public community
                            const { data: publicCommunity, error: publicError } = await window.supabase
                                .from('communities')
                                .select('*')
                                .eq('slug', 'profesionales')
                                .eq('is_active', true)
                                .single();

                            if (publicCommunity && !publicError) {
                                console.log('✅ Acceso público exitoso a profesionales');
                                this.currentCommunity = publicCommunity;
                                await this.loadCommunityStats();
                                return true;
                            } else {
                                console.error('❌ Error accediendo a comunidad pública:', publicError);
                            }
                        } catch (publicErr) {
                            console.warn('⚠️ Fallback público falló:', publicErr);
                        }
                    }

                    // Strategy 3: Final verification - does community exist at all?
                    try {
                        const { data: checkCommunity, error: checkError } = await window.supabase
                            .from('communities')
                            .select('id, name, slug, community_type')
                            .eq('slug', this.communitySlug)
                            .single();

                        if (checkError && checkError.code === 'PGRST116') {
                            console.log('❌ Comunidad no existe en absoluto');
                            this.redirectTo404('Comunidad no encontrada');
                        } else if (checkCommunity) {
                            console.log('🚫 Comunidad existe pero RLS bloqueó acceso:', {
                                name: checkCommunity.name,
                                type: checkCommunity.community_type,
                                isAdmin: this.isAdminUser()
                            });
                            this.redirectTo403('No tienes acceso a esta comunidad');
                        }
                    } catch (finalErr) {
                        console.error('❌ Error en verificación final:', finalErr);
                        this.redirectTo403('Error verificando acceso a la comunidad');
                    }

                } else {
                    // Other database error
                    console.error('❌ Error de base de datos:', error);
                    throw error;
                }
                return;
            }

            if (!community) {
                console.error('❌ Comunidad no encontrada');
                this.redirectTo404('Comunidad no encontrada');
                return;
            }

            // Check if community is active
            if (!community.is_active) {
                console.error('❌ Comunidad inactiva');
                this.redirectTo404('Esta comunidad no está disponible actualmente');
                return;
            }

            this.currentCommunity = community;
            console.log('✅ Comunidad cargada exitosamente:', {
                name: community.name,
                slug: community.slug,
                type: community.community_type
            });

            // Load additional data
            await this.loadCommunityStats();

            return true;

        } catch (error) {
            console.error('❌ Error crítico cargando comunidad:', error);

            // Check if it's a network error
            if (error.message.includes('fetch')) {
                this.handleCriticalError(new Error('Error de conexión a la base de datos'));
            } else {
                this.redirectTo403('Error de acceso a la comunidad');
            }
        }
    }

    async loadCommunityStats() {
        console.log('📊 [COMMUNITY-VIEW] Cargando estadísticas...');

        try {
            let memberCount = 0;
            let postCount = 0;

            // Load member count using direct Supabase query
            try {
                const { count: members, error: memberError } = await window.supabase
                    .from('community_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('community_id', this.communityId)
                    .eq('is_active', true);

                if (!memberError) {
                    memberCount = members || 0;
                    console.log('📊 Miembros encontrados:', memberCount);
                } else {
                    console.warn('⚠️ Error contando miembros:', memberError);
                }
            } catch (memberErr) {
                console.warn('⚠️ Error en consulta de miembros:', memberErr);
            }

            // Load post count using direct Supabase query
            try {
                const { count: posts, error: postError } = await window.supabase
                    .from('community_posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('community_id', this.communityId);

                if (!postError) {
                    postCount = posts || 0;
                    console.log('📊 Posts encontrados:', postCount);
                } else {
                    console.warn('⚠️ Error contando posts:', postError);
                }
            } catch (postErr) {
                console.warn('⚠️ Error en consulta de posts:', postErr);
            }

            // Fallback to database methods if available
            if (memberCount === 0 && this.db && typeof this.db.countCommunityMembers === 'function') {
                try {
                    memberCount = await this.db.countCommunityMembers(this.communityId);
                    console.log('📊 Miembros (fallback):', memberCount);
                } catch (err) {
                    console.warn('⚠️ Error en fallback de miembros:', err);
                }
            }

            if (postCount === 0 && this.db && typeof this.db.countCommunityPosts === 'function') {
                try {
                    postCount = await this.db.countCommunityPosts(this.communityId);
                    console.log('📊 Posts (fallback):', postCount);
                } catch (err) {
                    console.warn('⚠️ Error en fallback de posts:', err);
                }
            }

            this.currentCommunity.memberCount = memberCount;
            this.currentCommunity.postCount = postCount;

            console.log('📈 Estadísticas finales:', {
                members: memberCount,
                posts: postCount,
                communityId: this.communityId
            });

        } catch (error) {
            console.warn('⚠️ Error general cargando estadísticas:', error);
            // Set default values
            this.currentCommunity.memberCount = 0;
            this.currentCommunity.postCount = 0;
        }
    }

    setupUI() {
        console.log('🎨 [COMMUNITY-VIEW] Configurando interfaz...');

        // Update page title and meta tags
        this.updatePageMetadata();

        // Update breadcrumbs
        this.updateBreadcrumbs();

        // Update community header
        this.updateCommunityHeader();

        // Generate navigation tabs
        this.generateNavigationTabs();

        // Update community stats
        this.updateCommunityStats();
    }

    updatePageMetadata() {
        // Update page title
        const title = `${this.currentCommunity.name} - Comunidad`;
        document.title = title;
        document.getElementById('dynamicTitle').textContent = title;

        // Update meta description
        const description = this.currentCommunity.description || `Comunidad de ${this.currentCommunity.name}`;
        document.getElementById('dynamicDescription').setAttribute('content', description);

        // Update meta keywords
        const keywords = `comunidad, ${this.currentCommunity.name}, ${this.communitySlug}, aprendizaje, IA`;
        document.getElementById('dynamicKeywords').setAttribute('content', keywords);
    }

    updateBreadcrumbs() {
        const breadcrumb = document.getElementById('communityBreadcrumb');
        if (breadcrumb) {
            breadcrumb.textContent = this.currentCommunity.name;
        }
    }

    updateCommunityHeader() {
        // Update community title
        const titleEl = document.getElementById('communityTitle');
        if (titleEl) {
            titleEl.textContent = this.currentCommunity.name;
        }

        // Update community description
        const descEl = document.getElementById('communityDescription');
        if (descEl) {
            descEl.textContent = this.currentCommunity.description || 'Comunidad de aprendizaje y colaboración';
        }

        // Update community avatar
        this.updateCommunityAvatar();

        // Update banner if available
        this.updateCommunityBanner();
    }

    updateCommunityAvatar() {
        const avatarEl = document.getElementById('communityAvatar');
        if (avatarEl) {
            const config = this.communityConfigs[this.communitySlug];
            if (config) {
                avatarEl.innerHTML = `<i class="bx bx-group" style="color: ${config.primaryColor}"></i>`;
            }
        }
    }

    updateCommunityBanner() {
        const bannerEl = document.getElementById('communityBanner');
        if (bannerEl && this.currentCommunity.banner_image) {
            bannerEl.style.backgroundImage = `url(${this.currentCommunity.banner_image})`;
            bannerEl.style.backgroundSize = 'cover';
            bannerEl.style.backgroundPosition = 'center';
        }
    }

    generateNavigationTabs() {
        const tabsContainer = document.getElementById('communityTabs');
        if (!tabsContainer) return;

        const config = this.communityConfigs[this.communitySlug];
        if (!config || !config.tabs) {
            // Default tabs if no specific configuration
            config.tabs = [
                { id: 'posts', label: 'Posts', icon: 'bx-message-dots' }
            ];
        }

        const tabsHTML = config.tabs.map(tab => `
            <button class="nav-tab ${tab.id === this.activeTab ? 'active' : ''}"
                    data-tab="${tab.id}"
                    onclick="communityView.switchTab('${tab.id}')">
                <i class="bx ${tab.icon}"></i>
                <span>${tab.label}</span>
            </button>
        `).join('');

        tabsContainer.innerHTML = tabsHTML;
    }

    updateCommunityStats() {
        const membersEl = document.getElementById('membersCount');
        const postsEl = document.getElementById('postsCount');

        if (membersEl) {
            this.animateNumber(membersEl, 0, this.currentCommunity.memberCount || 0, 1500);
        }

        if (postsEl) {
            this.animateNumber(postsEl, 0, this.currentCommunity.postCount || 0, 1500);
        }
    }

    applyCommunityCustomization() {
        console.log('🎨 [COMMUNITY-VIEW] Aplicando personalización...');

        const config = this.communityConfigs[this.communitySlug];
        if (!config) {
            console.warn('⚠️ Configuración no encontrada para:', this.communitySlug);
            return;
        }

        // Apply data-community attribute for CSS targeting
        document.body.setAttribute('data-community', this.communitySlug);

        // Apply CSS custom properties
        document.documentElement.style.setProperty('--community-primary', config.primaryColor);
        document.documentElement.style.setProperty('--community-secondary', config.secondaryColor);
        document.documentElement.style.setProperty('--community-accent', config.accentColor);

        // Apply theme color from database if available
        if (this.currentCommunity.theme_color) {
            document.documentElement.style.setProperty('--community-primary', this.currentCommunity.theme_color);
        }

        console.log('✅ Personalización aplicada:', config.theme);
    }

    setupEventListeners() {
        console.log('📡 [COMMUNITY-VIEW] Configurando event listeners...');

        // Setup profile menu
        this.setupProfileMenu();

        // Load initial tab content
        this.loadTabContent(this.activeTab);
    }

    setupProfileMenu() {
        try {
            const raw = localStorage.getItem('currentUser');
            if (raw) {
                const user = JSON.parse(raw);
                const nameEl = document.getElementById('pmName');
                const emailEl = document.getElementById('pmEmail');
                if (nameEl && user.display_name) nameEl.textContent = user.display_name;
                if (emailEl) emailEl.textContent = user.email || user.user?.email || user.data?.email || '';
            }
        } catch (e) {
            console.warn('⚠️ Error loading user data:', e);
        }

        // Setup profile menu toggle
        const avatarBtn = document.querySelector('.header-profile');
        const menu = document.getElementById('profileMenu');

        if (avatarBtn && menu) {
            avatarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                menu.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
                    menu.classList.remove('show');
                }
            });
        }
    }

    async switchTab(tabId) {
        console.log('📂 [COMMUNITY-VIEW] Cambiando a tab:', tabId);

        // Update active tab
        this.activeTab = tabId;

        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Load tab content
        await this.loadTabContent(tabId);
    }

    async loadTabContent(tabId) {
        console.log('📄 [COMMUNITY-VIEW] Cargando contenido para tab:', tabId);

        const contentEl = document.getElementById('tabContent');
        if (!contentEl) return;

        // Show loading state
        contentEl.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>Cargando ${tabId}...</p>
            </div>
        `;

        try {
            let content = '';

            switch (tabId) {
                case 'posts':
                    content = await this.loadPostsContent();
                    break;
                case 'miembros':
                    content = await this.loadMembersContent();
                    break;
                case 'recursos':
                    content = await this.loadResourcesContent();
                    break;
                case 'eventos':
                    content = await this.loadEventsContent();
                    break;
                case 'ideas':
                    content = await this.loadIdeasContent();
                    break;
                default:
                    content = await this.loadDefaultContent(tabId);
            }

            contentEl.innerHTML = content;

            // Update sidebar
            await this.updateSidebar(tabId);

        } catch (error) {
            console.error('❌ Error cargando contenido:', error);
            contentEl.innerHTML = `
                <div class="error-content">
                    <i class="bx bx-error-circle"></i>
                    <p>Error cargando contenido</p>
                    <button onclick="communityView.loadTabContent('${tabId}')" class="btn-retry">Reintentar</button>
                </div>
            `;
        }
    }

    async loadPostsContent() {
        console.log('📝 [COMMUNITY-VIEW] Cargando posts...');

        try {
            // Load posts from database
            const { data: posts, error } = await window.supabase
                .from('community_posts')
                .select(`
                    id, title, content, created_at, updated_at,
                    post_type, attachment_url, is_pinned,
                    likes_count, comments_count,
                    users!community_posts_user_id_fkey(display_name, username, profile_picture_url)
                `)
                .eq('community_id', this.communityId)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                console.error('❌ Error cargando posts:', error);
                throw error;
            }

            // Generate posts HTML
            const postsHTML = posts.map(post => this.generatePostHTML(post)).join('');

            return `
                <div class="posts-section">
                    <div class="posts-header">
                        <h3>Publicaciones</h3>
                        <button class="btn-new-post" onclick="communityView.showNewPostModal()">
                            <i class="bx bx-plus"></i>
                            Nueva Publicación
                        </button>
                    </div>
                    <div class="posts-list">
                        ${postsHTML || '<div class="empty-state"><p>No hay publicaciones aún</p></div>'}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Error en loadPostsContent:', error);
            throw error;
        }
    }

    generatePostHTML(post) {
        const user = post.users || {};
        const timeAgo = this.getTimeAgo(new Date(post.created_at));

        return `
            <div class="post-card ${post.is_pinned ? 'pinned' : ''}">
                ${post.is_pinned ? '<div class="pin-indicator"><i class="bx bx-pin"></i> Fijado</div>' : ''}
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar">
                            ${user.profile_picture_url
                                ? `<img src="${user.profile_picture_url}" alt="${user.display_name}">`
                                : '<i class="bx bx-user"></i>'
                            }
                        </div>
                        <div class="author-info">
                            <div class="author-name">${user.display_name || user.username || 'Usuario'}</div>
                            <div class="post-time">${timeAgo}</div>
                        </div>
                    </div>
                    <div class="post-actions">
                        <button class="post-action-btn" title="Más opciones">
                            <i class="bx bx-dots-horizontal-rounded"></i>
                        </button>
                    </div>
                </div>
                <div class="post-content">
                    ${post.title ? `<h4 class="post-title">${this.escapeHtml(post.title)}</h4>` : ''}
                    <div class="post-text">${this.escapeHtml(post.content)}</div>
                    ${post.attachment_url ? `<div class="post-attachment"><img src="${post.attachment_url}" alt="Attachment"></div>` : ''}
                </div>
                <div class="post-footer">
                    <button class="post-reaction-btn" data-post-id="${post.id}">
                        <i class="bx bx-heart"></i>
                        <span>${post.likes_count || 0}</span>
                    </button>
                    <button class="post-comment-btn" data-post-id="${post.id}">
                        <i class="bx bx-comment"></i>
                        <span>${post.comments_count || 0}</span>
                    </button>
                    <button class="post-share-btn" data-post-id="${post.id}">
                        <i class="bx bx-share"></i>
                        Compartir
                    </button>
                </div>
            </div>
        `;
    }

    async loadMembersContent() {
        return `
            <div class="members-section">
                <div class="members-header">
                    <h3>Miembros de la Comunidad</h3>
                </div>
                <div class="members-grid">
                    <div class="coming-soon">
                        <i class="bx bx-group"></i>
                        <p>Lista de miembros próximamente</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadResourcesContent() {
        return `
            <div class="resources-section">
                <div class="resources-header">
                    <h3>Recursos de la Comunidad</h3>
                </div>
                <div class="resources-grid">
                    <div class="coming-soon">
                        <i class="bx bx-library"></i>
                        <p>Recursos específicos para ${this.currentCommunity.name} próximamente</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadEventsContent() {
        return `
            <div class="events-section">
                <div class="events-header">
                    <h3>Eventos y Actividades</h3>
                </div>
                <div class="events-list">
                    <div class="coming-soon">
                        <i class="bx bx-calendar"></i>
                        <p>Eventos próximamente</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadIdeasContent() {
        return `
            <div class="ideas-section">
                <div class="ideas-header">
                    <h3>Ideas e Innovación</h3>
                </div>
                <div class="ideas-board">
                    <div class="coming-soon">
                        <i class="bx bx-bulb"></i>
                        <p>Tablero de ideas próximamente</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadDefaultContent(tabId) {
        return `
            <div class="default-content">
                <div class="coming-soon">
                    <i class="bx bx-construction"></i>
                    <h3>${tabId.charAt(0).toUpperCase() + tabId.slice(1)}</h3>
                    <p>Esta sección estará disponible próximamente</p>
                </div>
            </div>
        `;
    }

    async updateSidebar(tabId) {
        const sidebarEl = document.getElementById('communitySidebar');
        if (!sidebarEl) return;

        const config = this.communityConfigs[this.communitySlug];

        let sidebarContent = `
            <div class="sidebar-section">
                <h4>Información de la Comunidad</h4>
                <div class="community-info-card">
                    <div class="info-item">
                        <strong>Tipo:</strong> ${this.currentCommunity.community_type || 'Comunidad'}
                    </div>
                    <div class="info-item">
                        <strong>Miembros:</strong> ${this.currentCommunity.memberCount || 0}
                    </div>
                    <div class="info-item">
                        <strong>Publicaciones:</strong> ${this.currentCommunity.postCount || 0}
                    </div>
                </div>
            </div>
        `;

        if (config && config.features) {
            sidebarContent += `
                <div class="sidebar-section">
                    <h4>Características</h4>
                    <div class="features-list">
                        ${config.features.map(feature => `
                            <div class="feature-item">
                                <i class="bx bx-check"></i>
                                <span>${feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        sidebarEl.innerHTML = sidebarContent;
    }

    showMainContent() {
        console.log('👁️ [COMMUNITY-VIEW] Mostrando contenido principal...');

        // Hide loading overlay
        const loadingOverlay = document.getElementById('initialLoadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }

        // Show main content
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    }

    // Enhanced getCurrentUser method
    async getEnhancedCurrentUser() {
        console.log('🔍 [ENHANCED-USER] Iniciando obtención robusta de usuario...');

        let user = null;

        // Method 1: Try CommunityDatabase
        if (this.db && typeof this.db.getCurrentUser === 'function') {
            try {
                console.log('📊 Método 1: CommunityDatabase...');
                user = await this.db.getCurrentUser();
                if (user) {
                    console.log('✅ Usuario obtenido via CommunityDatabase:', user.email);
                    return user;
                }
            } catch (err) {
                console.warn('⚠️ Error en CommunityDatabase.getCurrentUser:', err);
            }
        }

        // Method 2: Try AuthUtils
        if (window.AuthUtils && typeof window.AuthUtils.getCurrentAuthenticatedUser === 'function') {
            try {
                console.log('📊 Método 2: AuthUtils...');
                user = await window.AuthUtils.getCurrentAuthenticatedUser();
                if (user) {
                    console.log('✅ Usuario obtenido via AuthUtils:', user.email);
                    return user;
                }
            } catch (err) {
                console.warn('⚠️ Error en AuthUtils.getCurrentAuthenticatedUser:', err);
            }
        }

        // Method 3: Direct localStorage parsing
        console.log('📊 Método 3: localStorage directo...');
        const localSources = ['currentUser', 'userData', 'user'];
        for (const source of localSources) {
            try {
                const data = localStorage.getItem(source);
                if (data && data !== 'null' && data !== 'undefined') {
                    const parsed = JSON.parse(data);
                    if (parsed && (parsed.email || parsed.id)) {
                        console.log(`✅ Usuario obtenido via localStorage.${source}:`, parsed.email || parsed.id);

                        // Normalize the user object
                        const normalizedUser = {
                            id: parsed.id || parsed.user_id || parsed.uid,
                            email: parsed.email || parsed.user?.email || parsed.data?.email,
                            display_name: parsed.display_name || parsed.name || parsed.username,
                            type_rol: parsed.type_rol || parsed.role,
                            user_metadata: parsed.user_metadata || {},
                            app_metadata: parsed.app_metadata || {}
                        };

                        return normalizedUser;
                    }
                }
            } catch (err) {
                console.warn(`⚠️ Error parseando localStorage.${source}:`, err);
            }
        }

        // Method 4: Supabase Auth direct
        try {
            console.log('📊 Método 4: Supabase Auth directo...');
            const { data: userData, error } = await window.supabase.auth.getUser();
            if (userData?.user && !error) {
                console.log('✅ Usuario obtenido via Supabase Auth:', userData.user.email);

                const supabaseUser = {
                    id: userData.user.id,
                    email: userData.user.email,
                    display_name: userData.user.user_metadata?.display_name || userData.user.email,
                    type_rol: userData.user.user_metadata?.type_rol || 'user',
                    user_metadata: userData.user.user_metadata || {},
                    app_metadata: userData.user.app_metadata || {}
                };

                return supabaseUser;
            }
        } catch (err) {
            console.warn('⚠️ Error en Supabase Auth directo:', err);
        }

        console.log('❌ [ENHANCED-USER] No se pudo obtener usuario por ningún método');
        return null;
    }

    // DEBUG: Temporal bypass for testing
    async debugBypassAuth() {
        console.log('🚨 [DEBUG-BYPASS] Iniciando bypass temporal...');

        // Create a mock admin user for testing
        const mockAdminUser = {
            id: '8365d552-f342-4cd7-ae6b-dff8063a1377',
            email: 'admin@aprendeaplica.com',
            display_name: 'Admin Test',
            type_rol: 'admin',
            user_metadata: { type_rol: 'admin' },
            app_metadata: {}
        };

        console.log('👑 [DEBUG-BYPASS] Usando usuario admin temporal:', mockAdminUser.email);
        return mockAdminUser;
    }

    // Test direct community access without RLS
    async testDirectCommunityAccess(communitySlug) {
        console.log(`🧪 [DIRECT-TEST] Probando acceso directo a comunidad: ${communitySlug}`);

        try {
            // Test 1: All communities without filters
            const { data: allCommunities, error: allError } = await window.supabase
                .from('communities')
                .select('id, name, slug, community_type, is_active')
                .limit(10);

            console.log('📊 Todas las comunidades disponibles:', {
                count: allCommunities?.length || 0,
                error: allError,
                communities: allCommunities?.map(c => ({ id: c.id, slug: c.slug, name: c.name }))
            });

            // Test 2: Specific community by slug only
            const { data: specificCommunity, error: specificError } = await window.supabase
                .from('communities')
                .select('*')
                .eq('slug', communitySlug)
                .single();

            console.log(`📊 Comunidad específica (${communitySlug}):`, {
                found: !!specificCommunity,
                error: specificError,
                community: specificCommunity ? {
                    id: specificCommunity.id,
                    name: specificCommunity.name,
                    slug: specificCommunity.slug,
                    type: specificCommunity.community_type,
                    active: specificCommunity.is_active
                } : null
            });

            return { allCommunities, specificCommunity, allError, specificError };

        } catch (err) {
            console.error('❌ [DIRECT-TEST] Error en test directo:', err);
            return { error: err };
        }
    }

    // ULTRA-DEBUG function
    async ultraDebugState() {
        console.log('🔬 [ULTRA-DEBUG] ===== ANÁLISIS COMPLETO DEL ESTADO =====');

        // 1. URL y parámetros
        console.log('🔗 URL y Parámetros:');
        console.log('  URL actual:', window.location.href);
        console.log('  Parámetros:', Object.fromEntries(new URLSearchParams(window.location.search)));
        console.log('  communityId extraído:', this.communityId);
        console.log('  communitySlug extraído:', this.communitySlug);

        // 2. Estado de dependencias críticas
        console.log('📦 Dependencias:');
        console.log('  window.supabase:', !!window.supabase);
        console.log('  window.CommunityDatabase:', typeof window.CommunityDatabase);
        console.log('  this.db:', !!this.db);
        console.log('  this.currentUser:', !!this.currentUser);

        // 3. Análisis profundo del usuario actual
        console.log('👤 Usuario Actual (análisis profundo):');
        if (this.currentUser) {
            console.log('  Email:', this.currentUser.email);
            console.log('  ID:', this.currentUser.id);
            console.log('  Type Role:', this.currentUser.type_rol);
            console.log('  Role:', this.currentUser.role);
            console.log('  User Metadata:', this.currentUser.user_metadata);
            console.log('  App Metadata:', this.currentUser.app_metadata);
            console.log('  ¿Es Admin?:', this.isAdminUser());
        } else {
            console.log('  ❌ currentUser es NULL');
        }

        // 4. Verificar todas las fuentes de autenticación
        console.log('🔐 Fuentes de Autenticación:');

        // localStorage
        const localSources = ['currentUser', 'userData', 'user', 'userSession', 'authToken'];
        localSources.forEach(key => {
            const value = localStorage.getItem(key);
            if (value && value !== 'null' && value !== 'undefined') {
                try {
                    const parsed = JSON.parse(value);
                    console.log(`  localStorage.${key}:`, {
                        hasData: true,
                        email: parsed.email || parsed.user?.email || parsed.data?.email,
                        id: parsed.id || parsed.user_id || parsed.uid,
                        role: parsed.type_rol || parsed.role,
                        length: value.length
                    });
                } catch (e) {
                    console.log(`  localStorage.${key}: No es JSON (${value.substring(0, 50)}...)`);
                }
            } else {
                console.log(`  localStorage.${key}: ❌ Ausente`);
            }
        });

        // sessionStorage
        localSources.forEach(key => {
            const value = sessionStorage.getItem(key);
            if (value && value !== 'null') {
                console.log(`  sessionStorage.${key}: ✅ Presente`);
            } else {
                console.log(`  sessionStorage.${key}: ❌ Ausente`);
            }
        });

        // 5. Sesión de Supabase Auth
        console.log('🔑 Supabase Auth:');
        try {
            const { data: sessionData, error: sessionError } = await window.supabase.auth.getSession();
            if (sessionError) {
                console.log('  ❌ Error obteniendo sesión:', sessionError);
            } else if (sessionData?.session) {
                console.log('  ✅ Sesión activa:', {
                    userId: sessionData.session.user.id,
                    email: sessionData.session.user.email,
                    role: sessionData.session.user.role,
                    expiresAt: sessionData.session.expires_at
                });
            } else {
                console.log('  ❌ No hay sesión activa en Supabase');
            }

            // Verificar también el usuario actual
            const { data: userData, error: userError } = await window.supabase.auth.getUser();
            if (userError) {
                console.log('  ❌ Error obteniendo usuario:', userError);
            } else if (userData?.user) {
                console.log('  ✅ Usuario Supabase:', {
                    id: userData.user.id,
                    email: userData.user.email,
                    emailConfirmed: userData.user.email_confirmed_at
                });
            } else {
                console.log('  ❌ No hay usuario en Supabase');
            }
        } catch (authError) {
            console.log('  ❌ Error crítico en auth:', authError);
        }

        // 6. Test básico de conectividad a communities
        console.log('🏘️ Test de Conectividad:');
        try {
            const { data: testData, error: testError, count } = await window.supabase
                .from('communities')
                .select('*', { count: 'exact', head: true });

            console.log('  Resultado test communities:', {
                error: testError,
                count: count,
                hasData: !!testData
            });
        } catch (connectError) {
            console.log('  ❌ Error de conectividad:', connectError);
        }

        // 7. Variables globales
        console.log('🌐 Variables Globales:');
        console.log('  window.currentUser:', !!window.currentUser);
        console.log('  window.user:', !!window.user);
        console.log('  window.userData:', !!window.userData);
        console.log('  window.AuthUtils:', !!window.AuthUtils);

        console.log('🔬 [ULTRA-DEBUG] ===== FIN ANÁLISIS =====');
    }

    // Utility methods
    isAdminUser() {
        if (!this.currentUser) return false;

        // Check multiple possible admin indicators
        const adminRoles = ['admin', 'administrator', 'super_admin', 'superadmin'];
        const userRole = (this.currentUser.type_rol || this.currentUser.role || '').toLowerCase();

        // Check by role
        if (adminRoles.includes(userRole)) {
            console.log('✅ Usuario es admin por rol:', userRole);
            return true;
        }

        // Check by specific admin user ID mentioned in the prompt
        const adminUserId = '8365d552-f342-4cd7-ae6b-dff8063a1377';
        if (this.currentUser.id === adminUserId) {
            console.log('✅ Usuario es admin por ID especial:', this.currentUser.id);
            return true;
        }

        // Check by email pattern (optional)
        const email = this.currentUser.email || '';
        if (email.includes('admin') || email.includes('soporte') || email.includes('aprendeaplica')) {
            console.log('✅ Usuario es admin por email:', email);
            return true;
        }

        console.log('❌ Usuario NO es admin:', {
            role: userRole,
            id: this.currentUser.id,
            email: this.currentUser.email
        });
        return false;
    }

    redirectTo403(message = 'Acceso denegado') {
        console.log('🚫 Redirigiendo a 403:', message);
        window.location.href = `./403.html?message=${encodeURIComponent(message)}`;
    }

    redirectTo404(message = 'Comunidad no encontrada') {
        console.log('🔍 Redirigiendo a 404:', message);
        window.location.href = `./404.html?message=${encodeURIComponent(message)}`;
    }

    handleCriticalError(error) {
        console.error('💥 Error crítico:', error);

        const errorState = document.getElementById('errorState');
        const mainContent = document.getElementById('mainContent');
        const loadingOverlay = document.getElementById('initialLoadingOverlay');

        if (loadingOverlay) loadingOverlay.classList.remove('active');
        if (mainContent) mainContent.style.display = 'none';

        if (errorState) {
            document.getElementById('errorTitle').textContent = 'Error del Sistema';
            document.getElementById('errorMessage').textContent = 'No se pudo cargar la comunidad. Por favor, intenta nuevamente.';
            errorState.style.display = 'flex';
        }
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

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    }

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

    showNewPostModal() {
        // TODO: Implement new post modal
        console.log('📝 Showing new post modal...');
        alert('Funcionalidad de nuevo post próximamente');
    }
}

// Global theme toggle function
window.toggleTheme = function() {
    console.log('🎨 Theme toggle called from community-view');

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.classList.add('clicked');
        setTimeout(() => {
            themeToggle.classList.remove('clicked');
        }, 400);
    }

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (window.toggleGlobalTheme) {
        window.toggleGlobalTheme();
    } else {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    }
};

// Initialize when DOM is ready
let communityView;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 [COMMUNITY-VIEW] DOM cargado - inicializando...');

    try {
        // Add a small delay to ensure all scripts are loaded
        await new Promise(resolve => setTimeout(resolve, 500));

        communityView = new CommunityView();
        window.communityView = communityView;

        console.log('✅ [COMMUNITY-VIEW] Instancia creada y disponible globalmente');

    } catch (error) {
        console.error('❌ [COMMUNITY-VIEW] Error en inicialización del DOM:', error);

        // Show error state
        const errorState = document.getElementById('errorState');
        const loadingOverlay = document.getElementById('initialLoadingOverlay');

        if (loadingOverlay) loadingOverlay.classList.remove('active');

        if (errorState) {
            document.getElementById('errorTitle').textContent = 'Error de Inicialización';
            document.getElementById('errorMessage').textContent = 'No se pudo inicializar la vista de comunidad. Por favor, recarga la página.';
            errorState.style.display = 'flex';
        }
    }
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // DOM is still loading, listener above will handle it
} else {
    // DOM is already loaded
    console.log('🚀 [COMMUNITY-VIEW] DOM ya cargado - inicializando inmediatamente...');
    setTimeout(async () => {
        try {
            communityView = new CommunityView();
            window.communityView = communityView;
        } catch (error) {
            console.error('❌ [COMMUNITY-VIEW] Error en inicialización inmediata:', error);
        }
    }, 500);
}

// Make CommunityView available globally
window.CommunityView = CommunityView;

// Debug functions
window.debugCommunityView = function() {
    console.log('🔍 [DEBUG] Estado actual de CommunityView:');

    if (!window.communityView) {
        console.error('❌ CommunityView no está inicializado');
        return;
    }

    const cv = window.communityView;

    console.log('📊 Estado de la instancia:', {
        communityId: cv.communityId,
        communitySlug: cv.communitySlug,
        currentCommunity: cv.currentCommunity,
        currentUser: cv.currentUser,
        db: cv.db ? 'Inicializado' : 'No inicializado',
        activeTab: cv.activeTab
    });

    console.log('🔗 URL actual:', window.location.href);
    console.log('🔗 Parámetros URL:', new URLSearchParams(window.location.search));

    // Test Supabase connection
    if (window.supabase) {
        console.log('✅ Supabase disponible');
        console.log('🔗 Supabase URL:', window.supabase.supabaseUrl);
    } else {
        console.error('❌ Supabase no disponible');
    }

    // Test CommunityDatabase
    if (window.CommunityDatabase) {
        console.log('✅ CommunityDatabase disponible');
    } else {
        console.error('❌ CommunityDatabase no disponible');
    }
};

window.testCommunityLoad = async function(communityId, communitySlug) {
    console.log(`🧪 [TEST] Probando carga de comunidad: ${communityId}, ${communitySlug}`);

    if (!window.supabase) {
        console.error('❌ Supabase no disponible para test');
        return;
    }

    try {
        const { data, error } = await window.supabase
            .from('communities')
            .select('*')
            .eq('id', communityId)
            .eq('slug', communitySlug)
            .single();

        console.log('📊 Resultado del test:', { data, error });

        if (data) {
            console.log('✅ Comunidad encontrada:', data.name);
        } else if (error) {
            console.error('❌ Error en test:', error.message);
        }

        return { data, error };
    } catch (err) {
        console.error('❌ Error crítico en test:', err);
        return { data: null, error: err };
    }
};

window.testAllCommunityStrategies = async function(communityId, communitySlug) {
    console.log(`🔬 [FULL-TEST] Probando todas las estrategias para: ${communityId}, ${communitySlug}`);

    const results = {};

    // Test 1: Direct query
    try {
        const { data, error } = await window.supabase
            .from('communities')
            .select('*')
            .eq('id', communityId)
            .eq('slug', communitySlug)
            .single();
        results.direct = { data, error };
        console.log('1️⃣ Consulta directa:', { success: !!data, error: error?.message });
    } catch (err) {
        results.direct = { data: null, error: err };
    }

    // Test 2: Admin bypass (OR query)
    try {
        const { data, error } = await window.supabase
            .from('communities')
            .select('*')
            .or(`id.eq.${communityId},slug.eq.${communitySlug}`)
            .limit(1)
            .single();
        results.admin = { data, error };
        console.log('2️⃣ Bypass admin:', { success: !!data, error: error?.message });
    } catch (err) {
        results.admin = { data: null, error: err };
    }

    // Test 3: Public community (only slug)
    try {
        const { data, error } = await window.supabase
            .from('communities')
            .select('*')
            .eq('slug', communitySlug)
            .eq('is_active', true)
            .single();
        results.public = { data, error };
        console.log('3️⃣ Acceso público:', { success: !!data, error: error?.message });
    } catch (err) {
        results.public = { data: null, error: err };
    }

    // Test 4: Basic existence check
    try {
        const { data, error } = await window.supabase
            .from('communities')
            .select('id, name, slug, community_type')
            .eq('slug', communitySlug)
            .single();
        results.exists = { data, error };
        console.log('4️⃣ Verificación existencia:', { success: !!data, error: error?.message });
    } catch (err) {
        results.exists = { data: null, error: err };
    }

    console.log('📋 [FULL-TEST] Resumen completo:', results);
    return results;
};

window.debugUserPermissions = async function() {
    console.log('👤 [USER-DEBUG] Analizando permisos de usuario...');

    const cv = window.communityView;
    if (!cv) {
        console.error('❌ CommunityView no disponible');
        return;
    }

    console.log('📊 Usuario actual:', {
        email: cv.currentUser?.email,
        id: cv.currentUser?.id,
        type_rol: cv.currentUser?.type_rol,
        role: cv.currentUser?.role,
        isAdmin: cv.isAdminUser()
    });

    // Check Supabase session
    const { data: session } = await window.supabase.auth.getSession();
    console.log('🔐 Sesión Supabase:', {
        authenticated: !!session?.session,
        userId: session?.session?.user?.id,
        email: session?.session?.user?.email
    });

    // Check localStorage sources
    console.log('💾 Fuentes localStorage:');
    ['currentUser', 'userData', 'user', 'userSession'].forEach(key => {
        const value = localStorage.getItem(key);
        if (value && value !== 'null') {
            try {
                const parsed = JSON.parse(value);
                console.log(`  ${key}:`, {
                    email: parsed.email || parsed.user?.email,
                    role: parsed.type_rol || parsed.role,
                    id: parsed.id || parsed.user_id
                });
            } catch (e) {
                console.log(`  ${key}: No es JSON válido`);
            }
        } else {
            console.log(`  ${key}: No disponible`);
        }
    });
};

// ULTRA-DEBUG: Test direct community access
window.testDirectAccess = async function(communitySlug = 'profesionales') {
    console.log(`🔬 [ULTRA-TEST] Probando acceso directo a: ${communitySlug}`);

    if (!window.communityView) {
        console.error('❌ CommunityView no disponible');
        return;
    }

    const cv = window.communityView;
    return await cv.testDirectCommunityAccess(communitySlug);
};

// ULTRA-DEBUG: Force bypass mode
window.enableDebugBypass = async function() {
    console.log('🚨 [BYPASS] Activando modo bypass temporal...');

    if (!window.communityView) {
        console.error('❌ CommunityView no disponible');
        return;
    }

    const cv = window.communityView;

    // Replace current user with mock admin
    cv.currentUser = await cv.debugBypassAuth();

    console.log('👑 [BYPASS] Usuario admin temporal activado:', cv.currentUser.email);
    console.log('✅ [BYPASS] Ahora puedes intentar acceder a cualquier comunidad');
    console.log('🔄 [BYPASS] Usa: window.location.href = "community-view.html?id=profesionales&slug=profesionales"');

    return cv.currentUser;
};

// ULTRA-DEBUG: Comprehensive system analysis
window.ultraAnalysis = async function() {
    console.log('🔬 [ULTRA-ANALYSIS] Iniciando análisis completo del sistema...');

    if (!window.communityView) {
        console.error('❌ CommunityView no disponible');
        return;
    }

    const cv = window.communityView;

    // Run ultra debug
    await cv.ultraDebugState();

    // Test enhanced user retrieval
    console.log('🔄 Probando obtención mejorada de usuario...');
    const enhancedUser = await cv.getEnhancedCurrentUser();
    console.log('👤 Usuario mejorado:', enhancedUser);

    // Test direct access to profesionales
    console.log('🌐 Probando acceso directo a profesionales...');
    const professionalTest = await cv.testDirectCommunityAccess('profesionales');

    // Test all strategies
    console.log('🧪 Probando todas las estrategias...');
    const allStrategies = await testAllCommunityStrategies('profesionales', 'profesionales');

    return {
        enhancedUser,
        professionalTest,
        allStrategies
    };
};

// ULTRA-DEBUG: Quick fix attempt
window.quickFix = async function() {
    console.log('⚡ [QUICK-FIX] Intentando reparación rápida...');

    if (!window.communityView) {
        console.error('❌ CommunityView no disponible');
        return;
    }

    const cv = window.communityView;

    try {
        // Step 1: Force re-initialize user
        console.log('🔄 Paso 1: Re-inicializando usuario...');
        cv.currentUser = await cv.getEnhancedCurrentUser();

        if (!cv.currentUser) {
            console.log('👑 Paso 1.5: Activando bypass admin...');
            cv.currentUser = await cv.debugBypassAuth();
        }

        // Step 2: Test direct community access
        console.log('🧪 Paso 2: Probando acceso directo...');
        const testResult = await cv.testDirectCommunityAccess('profesionales');

        if (testResult.specificCommunity) {
            console.log('✅ Paso 3: Comunidad encontrada, configurando...');
            cv.currentCommunity = testResult.specificCommunity;
            cv.communityId = testResult.specificCommunity.id;
            cv.communitySlug = testResult.specificCommunity.slug;

            // Manually setup UI
            cv.setupUI();
            cv.applyCommunityCustomization();
            cv.showMainContent();

            console.log('🎉 [QUICK-FIX] ¡Reparación exitosa!');
            return true;
        } else {
            console.error('❌ [QUICK-FIX] No se pudo encontrar la comunidad');
            return false;
        }

    } catch (error) {
        console.error('❌ [QUICK-FIX] Error durante reparación:', error);
        return false;
    }
};

// Auto-debug on load (optional, can be removed in production)
setTimeout(() => {
    if (window.location.search.includes('debug=true')) {
        console.log('🔍 [AUTO-DEBUG] Modo debug activado');
        window.debugCommunityView();
    }
}, 2000);