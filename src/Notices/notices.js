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
        this.updateStats();
        this.setupAnimations();
        this.fillUserHeader();
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
                this.filterByCategory(category);
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
            if(!raw) return;
            const user = JSON.parse(raw);
            const nameEl = document.getElementById('pmName');
            const emailEl = document.getElementById('pmEmail');
            if(nameEl && user.display_name) nameEl.textContent = user.display_name;
            if(emailEl) emailEl.textContent = user.email || user.user?.email || user.data?.email || '';
            if(user.avatar_url){
                document.querySelectorAll('.header-profile img, #profileMenu .pm-avatar img').forEach(img=>{img.src=user.avatar_url;});
            }
        }catch(e){}
        const avatarBtn = document.querySelector('.header-profile');
        const menu = document.getElementById('profileMenu');
        if(avatarBtn && menu){
            avatarBtn.addEventListener('click', (e)=>{ e.preventDefault(); menu.classList.toggle('show');});
            document.addEventListener('click', (e)=>{ if(!menu.contains(e.target) && !avatarBtn.contains(e.target)) menu.classList.remove('show');});
        }
    }

    // ===== DATA LOADING =====
    loadNewsData() {
        this.showLoading();
        
        // Simulate API call delay
        setTimeout(() => {
            this.allNews = this.getMockNewsData();
            this.filteredNews = [...this.allNews];
            this.renderNews();
            this.hideLoading();
        }, 1000);
    }

    getMockNewsData() {
        return [
            {
                id: 1,
                title: 'Nueva actualización de Chat-Bot-LIA con IA avanzada',
                excerpt: 'Hemos implementado las últimas tecnologías de inteligencia artificial para mejorar significativamente la experiencia de aprendizaje.',
                category: 'actualizaciones',
                categoryLabel: 'Actualizaciones',
                date: '2024-01-15',
                author: 'Equipo Chat-Bot-LIA',
                views: 1247,
                comments: 23,
                featured: true,
                image: 'fas fa-robot'
            },
            {
                id: 2,
                title: 'Revolución en la educación con Machine Learning',
                excerpt: 'Descubre cómo el machine learning está transformando la forma en que aprendemos y enseñamos en el siglo XXI.',
                category: 'ia',
                categoryLabel: 'Inteligencia Artificial',
                date: '2024-01-14',
                author: 'Dr. Ana Martínez',
                views: 892,
                comments: 15,
                featured: true,
                image: 'fas fa-brain'
            },
            {
                id: 3,
                title: 'Webinar: Introducción a Deep Learning',
                excerpt: 'Únete a nuestro próximo webinar gratuito donde exploraremos los fundamentos del deep learning y sus aplicaciones.',
                category: 'eventos',
                categoryLabel: 'Eventos',
                date: '2024-01-13',
                author: 'Prof. Carlos López',
                views: 567,
                comments: 8,
                featured: true,
                image: 'fas fa-calendar-alt'
            },
            {
                id: 4,
                title: 'Nuevas herramientas educativas disponibles',
                excerpt: 'Hemos agregado nuevas herramientas interactivas que harán tu experiencia de aprendizaje más dinámica y efectiva.',
                category: 'educacion',
                categoryLabel: 'Educación',
                date: '2024-01-12',
                author: 'Equipo de Desarrollo',
                views: 445,
                comments: 12,
                featured: false,
                image: 'fas fa-graduation-cap'
            },
            {
                id: 5,
                title: 'El futuro de la tecnología educativa',
                excerpt: 'Exploramos las tendencias emergentes que están dando forma al futuro de la educación digital.',
                category: 'tecnologia',
                categoryLabel: 'Tecnología',
                date: '2024-01-11',
                author: 'María González',
                views: 678,
                comments: 19,
                featured: false,
                image: 'fas fa-microchip'
            },
            {
                id: 6,
                title: 'ChatGPT y su impacto en la educación',
                excerpt: 'Analizamos cómo ChatGPT y otras IAs conversacionales están cambiando el panorama educativo.',
                category: 'ia',
                categoryLabel: 'Inteligencia Artificial',
                date: '2024-01-10',
                author: 'Dr. Roberto Silva',
                views: 1123,
                comments: 31,
                featured: false,
                image: 'fas fa-comments'
            },
            {
                id: 7,
                title: 'Conferencia anual de tecnología educativa',
                excerpt: 'Resumen de los momentos más destacados de nuestra conferencia anual sobre tecnología educativa.',
                category: 'eventos',
                categoryLabel: 'Eventos',
                date: '2024-01-09',
                author: 'Equipo de Eventos',
                views: 789,
                comments: 14,
                featured: false,
                image: 'fas fa-users'
            },
            {
                id: 8,
                title: 'Mejoras en la interfaz de usuario',
                excerpt: 'Hemos rediseñado completamente la interfaz para ofrecer una experiencia más intuitiva y moderna.',
                category: 'actualizaciones',
                categoryLabel: 'Actualizaciones',
                date: '2024-01-08',
                author: 'Equipo de UX',
                views: 456,
                comments: 7,
                featured: false,
                image: 'fas fa-paint-brush'
            },
            {
                id: 9,
                title: 'Nuevos cursos de programación disponibles',
                excerpt: 'Ampliamos nuestra oferta educativa con cursos especializados en programación y desarrollo.',
                category: 'educacion',
                categoryLabel: 'Educación',
                date: '2024-01-07',
                author: 'Departamento Académico',
                views: 634,
                comments: 18,
                featured: false,
                image: 'fas fa-code'
            },
            {
                id: 10,
                title: 'Innovaciones en realidad virtual educativa',
                excerpt: 'Descubre cómo la realidad virtual está revolucionando la forma en que aprendemos y experimentamos.',
                category: 'tecnologia',
                categoryLabel: 'Tecnología',
                date: '2024-01-06',
                author: 'Ing. Laura Fernández',
                views: 523,
                comments: 11,
                featured: false,
                image: 'fas fa-vr-cardboard'
            }
        ];
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
                        <a href="#" class="read-more" onclick="noticesPage.readNews(${news.id})">
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
                        <a href="#" class="read-more-btn" onclick="noticesPage.readNews(${news.id})">
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
                        <a href="#" class="read-more-btn" onclick="noticesPage.readNews(${news.id})">
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
        // Simulate reading a news article
        const news = this.allNews.find(n => n.id === newsId);
        if (news) {
            this.showToast(`Leyendo: ${news.title}`, 'info');
            // Here you would typically navigate to a news detail page
            // or open a modal with the full article
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
        
        // Handle different tabs
        switch(tab) {
            case 'mis-cursos':
                // Navigate directly to courses page without showing toast
                window.location.href = '../cursos.html';
                break;
            case 'noticias':
                // Already on news page, just update active state
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                clickedBtn.classList.add('active');
                break;
            case 'comunidad':
                // Navigate directly to community page without showing toast
                window.location.href = '../Community/community.html';
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
    console.log('DOM loaded - notices page initializing...');
    noticesPage = new NoticesPage();
    
    // Configuración inmediata del menú de perfil
    setupProfileMenuImmediate();
});

// Función para configurar el menú de perfil
function setupProfileMenuDirect() {
    const avatarBtn = document.querySelector('.header-profile');
    const menu = document.getElementById('profileMenu');
    
    if(avatarBtn && menu) {
        console.log('Setting up profile menu in notices');
        
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
            console.log('Error loading user data:', e);
        }
        
        avatarBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Profile button clicked in notices');
            menu.classList.toggle('show');
        };
        
        document.onclick = function(e) {
            if(!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
                menu.classList.remove('show');
            }
        };
    } else {
        console.log('Profile elements not found in notices');
    }
}

// Función inmediata para configurar el menú de perfil
function setupProfileMenuImmediate() {
    console.log('Setting up profile menu immediately...');
    
    const avatarBtn = document.getElementById('headerProfileBtn');
    const menu = document.getElementById('profileMenu');
    
    console.log('Avatar button found:', avatarBtn);
    console.log('Profile menu found:', menu);
    
    if(avatarBtn && menu) {
        console.log('Both elements found, setting up click handler...');
        
        // Remover eventos previos
        avatarBtn.onclick = null;
        
        // Configurar evento de click
        avatarBtn.addEventListener('click', function(e) {
            console.log('Profile button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            // Método directo - forzar estilos inline
            if(menu.style.display === 'block') {
                menu.style.display = 'none';
                console.log('Menu hidden');
            } else {
                menu.style.cssText = `
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
                console.log('Menu shown with forced styles');
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
        
        console.log('Profile menu setup completed successfully!');
    } else {
        console.error('Profile elements not found!', {avatarBtn, menu});
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
        console.log('Error loading user data:', e);
    }
}

// Función global para toggle del menú (backup)
function toggleProfileMenu(event) {
    console.log('toggleProfileMenu backup called');
    const menu = document.getElementById('profileMenu');
    if(menu) {
        menu.classList.toggle('show');
    }
}

// ===== GLOBAL FUNCTIONS =====
window.noticesPage = noticesPage;
window.setupProfileMenuDirect = setupProfileMenuDirect;
window.setupProfileMenuImmediate = setupProfileMenuImmediate;
window.toggleProfileMenu = toggleProfileMenu;
window.loadUserDataIntoMenu = loadUserDataIntoMenu;
