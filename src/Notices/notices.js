// ===== NOTICES PAGE JAVASCRIPT =====

class NoticesPage {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.currentView = 'grid';
        this.currentCategory = '';
        this.currentDateFilter = '';
        this.searchQuery = '';
        this.allNews = [];
        this.filteredNews = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNewsData();
        this.setupAnimations();
        this.fillUserHeader();
        this.setupThemeListener();
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Navigation bar functionality
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleTabClick(btn);
            });
        });

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchOverlay = document.getElementById('searchOverlay');
        const closeSearch = document.getElementById('closeSearch');
        const searchInput = document.getElementById('searchInput');
        const searchSubmit = document.querySelector('.search-submit');
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                searchOverlay.classList.add('active');
                searchInput.focus();
            });
        }

        if (closeSearch) {
            closeSearch.addEventListener('click', () => {
                searchOverlay.classList.remove('active');
            });
        }

        if (searchOverlay) {
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) {
                    searchOverlay.classList.remove('active');
                }
            });
        }

        if (searchSubmit) {
            searchSubmit.addEventListener('click', () => {
                this.performSearch();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.currentCategory = categoryFilter.value;
                this.filterNews();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                this.currentDateFilter = dateFilter.value;
                this.filterNews();
            });
        }

        // View toggles
        const viewToggles = document.querySelectorAll('.view-toggle');
        viewToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const view = toggle.dataset.view;
                this.switchView(view);
            });
        });

        // Category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                
                // If clicking on the same category, clear the filter
                if (this.currentCategory === category) {
                    this.clearCategoryFilter();
                } else {
                    this.filterByCategory(category);
                }
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreNews();
            });
        }

        // Newsletter subscription
        const newsletterBtn = document.getElementById('newsletterBtn');
        const newsletterEmail = document.getElementById('newsletterEmail');
        
        if (newsletterBtn && newsletterEmail) {
            newsletterBtn.addEventListener('click', () => {
                this.subscribeNewsletter();
            });

            newsletterEmail.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.subscribeNewsletter();
                }
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
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
            // console.log('Error loading user data:', e);
        }

        // Setup profile menu functionality
        this.setupProfileMenu();
    }

    setupProfileMenu() {
        const avatarBtn = document.querySelector('.header-profile');
        const menu = document.getElementById('profileMenu');
        if (!avatarBtn || !menu) {
            // console.error('[PROFILE] ❌ Elementos del menú de perfil no encontrados');
            return;
        }
        // console.log('[PROFILE] ✅ Menú de perfil configurado correctamente');

        avatarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        // Cerrar menú al hacer click fuera
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

    // ===== THEME MANAGEMENT =====
    setupThemeListener() {
        // Escuchar cambios en el atributo data-theme
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    this.handleThemeChange();
                }
            });
        });

        // Observar cambios en el documentElement
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Escuchar eventos globales de cambio de tema
        window.addEventListener('themeChanged', (e) => {
            this.handleThemeChange();
        });

        // Verificar tema inicial
        this.handleThemeChange();
    }

    handleThemeChange() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        // console.log('🎨 Notice page theme changed to:', currentTheme);
        
        // Forzar re-aplicación de estilos del body
        this.forceBackgroundUpdate();
        
        // Actualizar iconos de tema
        this.updateThemeIcons(currentTheme);
    }

    forceBackgroundUpdate() {
        const body = document.body;
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        // Agregar clase de transición
        body.classList.add('theme-transitioning');
        
        // Forzar re-renderizado
        if (currentTheme === 'light') {
            // Aplicar fondo claro manualmente
            body.style.background = 'linear-gradient(160deg, #E6F3FF 0%, #D4E6F1 100%)';
            // console.log('🎨 Forced light background application');
        } else {
            // Remover estilo inline para que use el CSS por defecto
            body.style.background = '';
            // console.log('🎨 Restored dark background');
        }
        
        // Remover clase de transición después de un tiempo
        setTimeout(() => {
            body.classList.remove('theme-transitioning');
        }, 300);
    }

    updateThemeIcons(theme) {
        const sunIcon = document.querySelector('.theme-icon-sun');
        const moonIcon = document.querySelector('.theme-icon-moon');
        const themeToggle = document.getElementById('themeToggle');
        const iconContainer = document.querySelector('.theme-icon-container');
        
        if (sunIcon && moonIcon && themeToggle && iconContainer) {
            // Agregar clases de animación
            themeToggle.classList.add('theme-changing');
            
            // Determinar la dirección de la animación
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
            
            // Remover clases de animación después de completar
            setTimeout(() => {
                themeToggle.classList.remove('theme-changing');
                iconContainer.classList.remove('theme-transforming', 'theme-transforming-reverse');
            }, 800);
        }
    }

    // ===== DATA LOADING =====
    async loadNewsData() {
        console.log('📡 Loading news data...');
        this.showLoading();

        try {
            // Intentar cargar desde API
            const response = await fetch('/api/news');

            if (response.ok) {
                const data = await response.json();
                console.log('✅ API Response:', data);
                this.allNews = data.news || [];
                this.filteredNews = [...this.allNews];
                console.log('📰 Loaded news:', this.allNews.length, 'articles');
            } else {
                console.warn('Error cargando noticias desde API:', response.status);
                this.allNews = [];
                this.filteredNews = [];
            }
        } catch (error) {
            console.error('Error conectando con API de noticias:', error);
            // Fallback: inicializar con arrays vacíos
            this.allNews = [];
            this.filteredNews = [];
        }

        this.renderNews();
        this.updateStats();
        this.hideLoading();
    }


    // ===== RENDERING =====
    renderNews() {
        this.renderFeaturedNews();
        this.renderLatestNews();
        this.updateCategoryCounts();
    }

    renderFeaturedNews() {
        const featuredGrid = document.getElementById('featuredGrid');
        if (!featuredGrid) return;

        const featuredNews = this.filteredNews.filter(news => news.featured).slice(0, 3);
        
        featuredGrid.innerHTML = featuredNews.map(news => `
            <article class="featured-card">
                <div class="featured-image">
                    <i class="${news.image}"></i>
                    <span class="featured-badge">Destacado</span>
                </div>
                <div class="featured-content">
                    <div class="featured-meta">
                        <span class="featured-category">${news.categoryLabel}</span>
                        <span>${this.formatDate(news.date)}</span>
                        <span>por ${news.author}</span>
                    </div>
                    <h3 class="featured-title">${news.title}</h3>
                    <p class="featured-excerpt">${news.excerpt}</p>
                    <div class="featured-actions">
                        <a href="#" class="read-more" onclick="noticesPage.readNews('${news.id}')">
                            Leer más <i class="fas fa-arrow-right"></i>
                        </a>
                        <div class="featured-stats">
                            <span><i class="fas fa-eye"></i> ${news.views}</span>
                            <span><i class="fas fa-comment"></i> ${news.comments}</span>
                        </div>
                    </div>
                </div>
            </article>
        `).join('');
    }

    renderLatestNews() {
        const newsGrid = document.getElementById('newsGrid');
        const newsList = document.getElementById('newsList');
        
        if (!newsGrid || !newsList) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const newsToShow = this.filteredNews.slice(startIndex, endIndex);

        // Grid view
        newsGrid.innerHTML = newsToShow.map(news => `
            <article class="news-item">
                <div class="news-image">
                    <i class="${news.image}"></i>
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-category">${news.categoryLabel}</span>
                        <span>${this.formatDate(news.date)}</span>
                    </div>
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <div class="news-actions">
                        <a href="#" class="read-more-btn" onclick="noticesPage.readNews('${news.id}')">
                            Leer más
                        </a>
                        <div class="news-stats">
                            <span><i class="fas fa-eye"></i> ${news.views}</span>
                            <span><i class="fas fa-comment"></i> ${news.comments}</span>
                        </div>
                    </div>
                </div>
            </article>
        `).join('');

        // List view
        newsList.innerHTML = newsToShow.map(news => `
            <article class="news-item">
                <div class="news-image">
                    <i class="${news.image}"></i>
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-category">${news.categoryLabel}</span>
                        <span>${this.formatDate(news.date)}</span>
                    </div>
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <div class="news-actions">
                        <a href="#" class="read-more-btn" onclick="noticesPage.readNews('${news.id}')">
                            Leer más
                        </a>
                        <div class="news-stats">
                            <span><i class="fas fa-eye"></i> ${news.views}</span>
                            <span><i class="fas fa-comment"></i> ${news.comments}</span>
                        </div>
                    </div>
                </div>
            </article>
        `).join('');

        // Update load more button
        this.updateLoadMoreButton();
    }

    // ===== FILTERING AND SEARCH =====
    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            this.searchQuery = searchInput.value.toLowerCase().trim();
            this.currentPage = 1;
            this.filterNews();
            this.closeSearchOverlay();
        }
    }

    filterNews() {
        this.filteredNews = this.allNews.filter(news => {
            // Search query filter
            const matchesSearch = !this.searchQuery || 
                news.title.toLowerCase().includes(this.searchQuery) ||
                news.excerpt.toLowerCase().includes(this.searchQuery) ||
                news.author.toLowerCase().includes(this.searchQuery);

            // Category filter
            const matchesCategory = !this.currentCategory || news.category === this.currentCategory;

            // Date filter
            const matchesDate = this.matchesDateFilter(news.date);

            return matchesSearch && matchesCategory && matchesDate;
        });

        this.currentPage = 1;
        this.renderNews();
        this.updateStats();
    }

    matchesDateFilter(newsDate) {
        if (!this.currentDateFilter) return true;

        const newsDateTime = new Date(newsDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

        switch (this.currentDateFilter) {
            case 'hoy':
                return newsDateTime >= today;
            case 'semana':
                return newsDateTime >= weekAgo;
            case 'mes':
                return newsDateTime >= monthAgo;
            case 'año':
                return newsDateTime >= yearAgo;
            default:
                return true;
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        this.filterNews();
        
        // Update category filter dropdown
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category;
        }
        
        // Update visual state of category cards
        this.updateCategoryCardsState(category);
        
        // Show feedback to user
        this.showToast(`Filtrado por: ${this.getCategoryLabel(category)}`, 'info');
    }

    updateCategoryCardsState(activeCategory) {
        document.querySelectorAll('.category-card').forEach(card => {
            const cardCategory = card.dataset.category;
            if (cardCategory === activeCategory) {
                card.classList.add('active');
                card.style.transform = 'scale(1.05)';
                card.style.boxShadow = '0 15px 40px rgba(0, 102, 204, 0.3)';
            } else {
                card.classList.remove('active');
                card.style.transform = 'scale(1)';
                card.style.boxShadow = '0 8px 22px rgba(0, 0, 0, 0.35)';
            }
        });
    }

    getCategoryLabel(category) {
        const labels = {
            'tecnologia': 'Tecnología',
            'ia': 'Inteligencia Artificial',
            'educacion': 'Educación',
            'eventos': 'Eventos',
            'actualizaciones': 'Actualizaciones'
        };
        return labels[category] || category;
    }

    clearCategoryFilter() {
        this.currentCategory = '';
        this.currentPage = 1;
        this.filterNews();
        
        // Update category filter dropdown
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = '';
        }
        
        // Reset visual state of category cards
        this.resetCategoryCardsState();
        
        // Show feedback to user
        this.showToast('Mostrando todas las noticias', 'success');
    }

    resetCategoryCardsState() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '0 8px 22px rgba(0, 0, 0, 0.35)';
        });
    }

    // ===== VIEW MANAGEMENT =====
    switchView(view) {
        this.currentView = view;
        
        // Update toggle buttons
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.classList.toggle('active', toggle.dataset.view === view);
        });

        // Show/hide appropriate containers
        const newsGrid = document.getElementById('newsGrid');
        const newsList = document.getElementById('newsList');
        
        if (newsGrid && newsList) {
            if (view === 'grid') {
                newsGrid.classList.remove('hidden');
                newsList.classList.add('hidden');
            } else {
                newsGrid.classList.add('hidden');
                newsList.classList.remove('hidden');
            }
        }
    }

    // ===== PAGINATION =====
    loadMoreNews() {
        this.currentPage++;
        this.renderLatestNews();
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        const totalPages = Math.ceil(this.filteredNews.length / this.itemsPerPage);
        const hasMorePages = this.currentPage < totalPages;

        loadMoreBtn.disabled = !hasMorePages;
        loadMoreBtn.innerHTML = hasMorePages ? 
            '<span>Cargar más noticias</span><i class="fas fa-chevron-down"></i>' :
            '<span>No hay más noticias</span><i class="fas fa-check"></i>';
    }

    // ===== STATISTICS =====
    updateStats() {
        const totalNewsElement = document.getElementById('totalNews');
        const totalViewsElement = document.getElementById('totalViews');
        
        if (totalNewsElement) {
            totalNewsElement.textContent = this.allNews.length;
        }
        
        if (totalViewsElement) {
            const totalViews = this.allNews.reduce((sum, news) => sum + news.views, 0);
            totalViewsElement.textContent = totalViews.toLocaleString();
        }
    }

    updateCategoryCounts() {
        const categoryCounts = {};
        this.allNews.forEach(news => {
            categoryCounts[news.category] = (categoryCounts[news.category] || 0) + 1;
        });

        // Update category cards
        document.querySelectorAll('.category-card').forEach(card => {
            const category = card.dataset.category;
            const countElement = card.querySelector('.category-count');
            if (countElement) {
                const count = categoryCounts[category] || 0;
                countElement.textContent = `${count} noticias`;
            }
        });
    }

    // ===== NEWSLETTER =====
    subscribeNewsletter() {
        const emailInput = document.getElementById('newsletterEmail');
        if (!emailInput) return;

        const email = emailInput.value.trim();
        
        if (!this.isValidEmail(email)) {
            this.showToast('Por favor, ingresa un email válido', 'error');
            return;
        }

        // Simulate subscription
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showToast('¡Te has suscrito exitosamente al boletín!', 'success');
            emailInput.value = '';
        }, 1500);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ===== UTILITIES =====
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Hoy';
        } else if (diffDays === 2) {
            return 'Ayer';
        } else if (diffDays <= 7) {
            return `Hace ${diffDays - 1} días`;
        } else {
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    readNews(newsId) {
        console.log('🗞️ readNews called with ID:', newsId);
        const news = this.allNews.find(n => n.id === newsId);
        console.log('📰 Found news:', news);
        if (news) {
            // Si la noticia tiene vista detallada, abrir el modal
            if (news.hasDetailedView && news.detailedData) {
                console.log('✅ Opening detailed modal for:', news.title);
                this.openDetailedNewsModal(news);
            } else {
                console.log('⚠️ No detailed view for news:', news.title);
                this.showToast(`Leyendo: ${news.title}`, 'info');
                // Here you would typically navigate to a news detail page
                // or open a modal with the full article
            }
        } else {
            console.error('❌ News not found with ID:', newsId);
        }
    }

    openDetailedNewsModal(news) {
        console.log('🗞️ Abriendo modal detallado para:', news.title);

        const modal = document.getElementById('newsModal');
        if (!modal) {
            console.error('❌ Modal no encontrado');
            return;
        }

        console.log('📋 Modal found, updating content...');
        // Actualizar el contenido del modal con los datos de la noticia
        this.updateModalContent(news);

        // Mostrar el modal
        console.log('👁️ Making modal visible...');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        console.log('✅ Modal detallado abierto exitosamente');
    }

    updateModalContent(news) {
        const modal = document.getElementById('newsModal');
        if (!modal || !news.detailedData) return;

        const data = news.detailedData;
        
        // Actualizar título
        const titleElement = modal.querySelector('.news-main-title');
        if (titleElement) {
            titleElement.textContent = news.title;
        }

        // Actualizar TL;DR
        const tldrItems = modal.querySelectorAll('.tldr-items li');
        if (tldrItems.length > 0) {
            tldrItems.forEach((item, index) => {
                if (data.tldr && data.tldr[index]) {
                    item.textContent = data.tldr[index];
                }
            });
        }

        // Actualizar pasos sugeridos
        const suggestedSteps = modal.querySelector('.suggested-steps .numbered-list');
        if (suggestedSteps && data.suggestedSteps) {
            suggestedSteps.innerHTML = data.suggestedSteps.map(step => `<li>${step}</li>`).join('');
        }

        // Actualizar riesgos
        const risksSection = modal.querySelector('.risks-limits');
        if (risksSection && data.risks) {
            const risksList = risksSection.querySelector('.section-list');
            if (risksList) {
                risksList.innerHTML = data.risks.map(risk => `<li>${risk}</li>`).join('');
            }
        }

        // Actualizar recursos
        const resourcesList = modal.querySelector('.resources-list');
        if (resourcesList && data.resources) {
            resourcesList.innerHTML = data.resources.map(resource => {
                // Si el recurso es un objeto con url y label, usarlo
                if (typeof resource === 'object' && resource.url && resource.label) {
                    return `<li><a href="${resource.url}" target="_blank">${resource.label}</a></li>`;
                }
                // Si es string (fallback), usar un enlace genérico
                else if (typeof resource === 'string') {
                    return `<li><a href="#" target="_blank">${resource}</a></li>`;
                }
                return '';
            }).join('');
        }

        // Actualizar "Por qué importa"
        const whyMattersSection = modal.querySelector('.why-matters-section .section-list');
        if (whyMattersSection && data.whyMatters) {
            whyMattersSection.innerHTML = data.whyMatters.map(item => `<li>${item}</li>`).join('');
        }

        // Actualizar "Qué cambió"
        const whatChangedSection = modal.querySelector('.what-changed-section .section-list');
        if (whatChangedSection && data.whatChanged) {
            whatChangedSection.innerHTML = data.whatChanged.map(item => `<li>${item}</li>`).join('');
        }

        // Actualizar "Impacto"
        const impactSection = modal.querySelector('.impact-section .section-list');
        if (impactSection && data.impact) {
            impactSection.innerHTML = data.impact.map(item => `<li>${item}</li>`).join('');
        }

        // Actualizar CTA
        const ctaButton = modal.querySelector('.cta-button');
        if (ctaButton && data.cta) {
            ctaButton.textContent = data.cta;
        }

        // Actualizar contenido detallado si existe
        const detailedContent = modal.querySelector('.modal-detailed-content p');
        if (detailedContent) {
            detailedContent.innerHTML = `<strong>Por qué importa para desarrolladores:</strong><br>En Cursor, nuestro objetivo es hacer que los desarrolladores sean un orden de magnitud más productivos. Una parte importante de ese objetivo es Cursor Tab, nuestro sistema que predice tu próxima acción en tu base de código. El nuevo modelo utiliza aprendizaje por refuerzo online para hacer 21% menos sugerencias mientras tiene una tasa de aceptación 28% mayor.`;
        }
    }

    closeSearchOverlay() {
        const searchOverlay = document.getElementById('searchOverlay');
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
        }
    }

    // ===== LOADING STATES =====
    showLoading() {
        // Loading overlay removido - no hacer nada
    }

    hideLoading() {
        // Loading overlay removido - no hacer nada
    }

    // ===== TOAST NOTIFICATIONS =====
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

    // ===== NAVIGATION HANDLING =====
    handleTabClick(clickedBtn) {
        // Get the tab from data attribute
        const tab = clickedBtn.dataset.tab;
        
        // Only handle tabs that have data-tab attribute
        if (!tab) {
            return; // Let the onclick handler take care of it
        }
        
        // Handle different tabs
        switch(tab) {
            case 'mis-cursos':
                // Navigate directly to courses page without showing toast
                window.location.href = '../cursos.html';
                break;
            case 'noticias':
                // Reload the current page to restart the news page
                window.location.reload();
                break;
            case 'comunidad':
                // Navigate directly to community page without showing toast
                window.location.href = '../Community/community.html';
                break;
            case 'directorio':
                // Navigate directly to apps directory page without showing toast
                window.location.href = '../apps-directory.html';
                break;
            default:
                this.showToast('Sección no disponible', 'warning');
        }
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
        document.querySelectorAll('.featured-card, .category-card, .news-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
}

// ===== INITIALIZATION =====
let noticesPage;

document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM loaded - notices page initializing...');
    noticesPage = new NoticesPage();
    
    // Configuración inmediata del menú de perfil
    setupProfileMenuImmediate();
});

// Función para configurar el menú de perfil
function setupProfileMenuDirect() {
    const avatarBtn = document.querySelector('.header-profile');
    const menu = document.getElementById('profileMenu');
    
    if(avatarBtn && menu) {
        // console.log('Setting up profile menu in notices');
        
        // Cargar datos del usuario
        try {
            const raw = localStorage.getItem('currentUser');
            if(raw) {
                const user = JSON.parse(raw);
                const nameEl = document.getElementById('pmName');
                const emailEl = document.getElementById('pmEmail');
                if(nameEl && user.display_name) nameEl.textContent = user.display_name;
                if(emailEl) emailEl.textContent = user.email || user.user?.email || user.data?.email || '';
                if(user.avatar_url) {
                    document.querySelectorAll('.header-profile img, #profileMenu .pm-avatar img').forEach(img => {
                        img.src = user.avatar_url;
                    });
                }
            }
        } catch(e) {
            // console.log('Error loading user data:', e);
        }
        
        avatarBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            // console.log('Profile button clicked in notices');
            menu.classList.toggle('show');
        };
        
        document.onclick = function(e) {
            if(!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
                menu.classList.remove('show');
            }
        };
    } else {
        // console.log('Profile elements not found in notices');
    }
}

// Función inmediata para configurar el menú de perfil
function setupProfileMenuImmediate() {
    // console.log('Setting up profile menu immediately...');
    
    const avatarBtn = document.getElementById('headerProfileBtn');
    const menu = document.getElementById('profileMenu');
    
    // console.log('Avatar button found:', avatarBtn);
    // console.log('Profile menu found:', menu);
    
    if(avatarBtn && menu) {
        // console.log('Both elements found, setting up click handler...');
        
        // Remover eventos previos
        avatarBtn.onclick = null;
        
        // Configurar evento de click
        avatarBtn.addEventListener('click', function(e) {
            // console.log('Profile button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            // Método directo - aplicar estilos según el tema actual
            if(menu.style.display === 'block') {
                menu.style.display = 'none';
                // console.log('Menu hidden');
            } else {
                // Detectar el tema actual
                const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light' || 
                                   document.body.getAttribute('data-theme') === 'light';
                
                // Aplicar estilos según el tema
                const lightStyles = `
                    position: fixed !important;
                    top: 76px !important;
                    right: 20px !important;
                    width: 260px !important;
                    background: rgba(255, 255, 255, 0.96) !important;
                    border: 1px solid rgba(0, 102, 204, 0.18) !important;
                    border-radius: 14px !important;
                    box-shadow: 0 18px 46px rgba(0, 0, 0, 0.1) !important;
                    backdrop-filter: blur(10px) !important;
                    z-index: 99999 !important;
                    display: block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                `;
                
                const darkStyles = `
                    position: fixed !important;
                    top: 76px !important;
                    right: 20px !important;
                    width: 260px !important;
                    background: rgba(10,16,28,0.96) !important;
                    border: 1px solid rgba(68,229,255,0.18) !important;
                    border-radius: 14px !important;
                    box-shadow: 0 18px 46px rgba(0,0,0,0.45) !important;
                    backdrop-filter: blur(10px) !important;
                    z-index: 99999 !important;
                    display: block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                `;
                
                menu.style.cssText = isLightTheme ? lightStyles : darkStyles;
                // console.log('Menu shown with theme-aware styles:', isLightTheme ? 'light' : 'dark');
            }
        });
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', function(e) {
            if(!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
                menu.style.display = 'none';
            }
        });
        
        // Cargar datos del usuario
        loadUserDataIntoMenu();
        
        // Escuchar cambios de tema para actualizar el menú si está abierto
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    // Si el menú está abierto, actualizar sus estilos
                    if (menu.style.display === 'block') {
                        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light' || 
                                           document.body.getAttribute('data-theme') === 'light';
                        
                        const lightStyles = `
                            position: fixed !important;
                            top: 76px !important;
                            right: 20px !important;
                            width: 260px !important;
                            background: rgba(255, 255, 255, 0.96) !important;
                            border: 1px solid rgba(0, 102, 204, 0.18) !important;
                            border-radius: 14px !important;
                            box-shadow: 0 18px 46px rgba(0, 0, 0, 0.1) !important;
                            backdrop-filter: blur(10px) !important;
                            z-index: 99999 !important;
                            display: block !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                        `;
                        
                        const darkStyles = `
                            position: fixed !important;
                            top: 76px !important;
                            right: 20px !important;
                            width: 260px !important;
                            background: rgba(10,16,28,0.96) !important;
                            border: 1px solid rgba(68,229,255,0.18) !important;
                            border-radius: 14px !important;
                            box-shadow: 0 18px 46px rgba(0,0,0,0.45) !important;
                            backdrop-filter: blur(10px) !important;
                            z-index: 99999 !important;
                            display: block !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                        `;
                        
                        menu.style.cssText = isLightTheme ? lightStyles : darkStyles;
                        // console.log('Menu styles updated for theme:', isLightTheme ? 'light' : 'dark');
                    }
                }
            });
        });
        
        // Observar cambios en el atributo data-theme del documentElement
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        // console.log('Profile menu setup completed successfully!');
    } else {
        // console.error('Profile elements not found!', {avatarBtn, menu});
    }
}

// Cargar datos del usuario en el menú
function loadUserDataIntoMenu() {
    try {
        const raw = localStorage.getItem('currentUser');
        if(raw) {
            const user = JSON.parse(raw);
            const nameEl = document.getElementById('pmName');
            const emailEl = document.getElementById('pmEmail');
            
            if(nameEl && user.display_name) nameEl.textContent = user.display_name;
            if(emailEl) emailEl.textContent = user.email || user.user?.email || user.data?.email || '';
            
            if(user.avatar_url) {
                document.querySelectorAll('.header-profile img, #profileMenu .pm-avatar img').forEach(img => {
                    img.src = user.avatar_url;
                });
            }
        }
    } catch(e) {
        // console.log('Error loading user data:', e);
    }
}

// Función global para toggle del menú (backup)
function toggleProfileMenu(event) {
    // console.log('toggleProfileMenu backup called');
    const menu = document.getElementById('profileMenu');
    if(menu) {
        menu.classList.toggle('show');
    }
}

// Función global para toggle del tema - conectada con el botón del menú
window.toggleTheme = function() {
    // console.log('🎨 Theme toggle called from notices');
    
    // Usar la función global de cambio de tema
    if (window.toggleGlobalTheme) {
        const newTheme = window.toggleGlobalTheme();
        // console.log('🎨 Theme toggled via global function to:', newTheme);
    } else {
        // Fallback manual si el script global no está disponible
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Aplicar tema
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
        
        // console.log('🎨 Theme toggled via fallback to:', newTheme);
    }
};

// ===== AI NEWS MODAL FUNCTIONALITY =====


// Función para abrir el modal con el diseño exacto
function openNewsModal(newsId) {
    // console.log('🗞️ Abriendo modal de noticia ID:', newsId);

    const news = sampleNews[newsId];
    const modal = document.getElementById('newsModal');

    if (!news || !modal) {
        // console.error('❌ Noticia o modal no encontrado');
        return;
    }

    // Agregar clase activa al modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // console.log('✅ Modal de noticia abierto exitosamente');
}

// Función para cerrar el modal
function closeNewsModal() {
    // console.log('❌ Cerrando modal de noticia');

    const modal = document.getElementById('newsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        // console.log('✅ Modal de noticia cerrado exitosamente');
    }
}

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('newsModal');
    const backdrop = modal?.querySelector('.modal-backdrop');
    const modalContent = modal?.querySelector('.modal-content');

    // Cerrar modal al hacer clic en el backdrop
    if (backdrop) {
        backdrop.addEventListener('click', closeNewsModal);
    }

    // Cerrar modal al hacer clic fuera de la tarjeta (área de modal no cubierta)
    if (modal) {
        modal.addEventListener('click', function(e) {
            // si el clic fue exactamente en el backdrop o fuera de .modal-content
            if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                closeNewsModal();
            } else if (modalContent && !modalContent.contains(e.target)) {
                closeNewsModal();
            }
        });
    }

    // Evitar que los clics dentro del contenido cierren el modal
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeNewsModal();
        }
    });

    // console.log('🎬 Event listeners del modal de noticias configurados');
});

// Función para crear el header gráfico dinámicamente
function createHeaderGraphic() {
    return `
        <div class="brain-icon">
            <i class="fas fa-brain"></i>
            <i class="fas fa-search"></i>
        </div>
        <div class="neural-lines"></div>
        <div class="gear-icon">
            <i class="fas fa-cog"></i>
        </div>
    `;
}

// ===== GLOBAL FUNCTIONS =====
window.noticesPage = noticesPage;
window.setupProfileMenuDirect = setupProfileMenuDirect;
window.setupProfileMenuImmediate = setupProfileMenuImmediate;
window.toggleProfileMenu = toggleProfileMenu;
window.loadUserDataIntoMenu = loadUserDataIntoMenu;
window.openNewsModal = openNewsModal;
window.closeNewsModal = closeNewsModal;
