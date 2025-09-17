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
        // Datos de Discover
        this.communities = [];
        this.communityStats = { totalMembers: 0, totalPosts: 0 };
        this.posts = [];
        this.leaderboard = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCommunityData();
        this.updateStats();
        this.setupAnimations();
        this.fillUserHeader();
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

        // Búsqueda Discover
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
            console.error('[PROFILE] ❌ Elementos del menú de perfil no encontrados');
            return;
        }
        console.log('[PROFILE] ✅ Menú de perfil configurado correctamente');
        
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

    // ===== NAVIGATION HANDLING =====
    handleTabClick(clickedBtn) {
        // Get the tab from data attribute
        const tab = clickedBtn.dataset.tab;
        
        // Handle different tabs
        switch(tab) {
            case 'mis-cursos':
                // Navegar a la versión ES de cursos
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
                this.showToast('Sección no disponible', 'warning');
        }
    }

    // ===== DATA LOADING =====
    loadCommunityData() {
        this.showLoading();
        
        // Simula llamada a API
        setTimeout(() => {
            this.loadMockData();
            this.renderDiscover('all', '');
            // (Sin feed)
            this.updateStats();
            this.hideLoading();
        }, 1000);
    }

    loadMockData() {
        // Estadísticas
        this.communityStats = { totalMembers: 2103, totalPosts: 0 };

        // Grid Discover (solo las dos comunidades principales)
        this.communities = [
            { id:0, rank:0, title:'Comunidad de Profesionales', category:'general', members:'1.2k', price:'Free', desc:'Comunidad principal para todos los miembros. Comparte experiencias, haz preguntas y conecta con otros estudiantes.', thumb:'./images/comunidad-general.png', icon:'fas fa-globe' },
            { id:-1, rank:-1, title:'Comunidad SIF ICAP', category:'negocios', members:'856', price:'Free', desc:'Comunidad para mentes abiertas. Explora nuevas ideas, comparte perspectivas únicas y expande tu horizonte mental.', thumb:'./images/openminder.png', icon:'fas fa-lightbulb' },
            { id:-2, rank:-2, title:'Comunidad RBA', category:'general', members:'432', price:'Free', desc:'Comunidad especializada en RBA. Conecta con profesionales que comparten tu interés en esta área específica.', thumb:'./images/comunidad-RBA.png', icon:'fas fa-users' }
        ];

        // (sin posts/leaderboard)
    }

    // ===== DISCOVER GRID =====
    renderDiscover(category='all', query=''){
        const grid = document.getElementById('discoverGrid');
        if(!grid) return;
        const byCat = category==='all' ? this.communities : this.communities.filter(c=> c.category===category);
        const q = (query||'').toLowerCase();
        const list = q ? byCat.filter(c => `${c.title} ${c.desc}`.toLowerCase().includes(q)) : byCat;
        grid.innerHTML = list.map(c => `
            <div class="discover-card" data-id="${c.id}">
                <div class="discover-thumb">
                    ${c.thumb ? `<img src="${c.thumb}" alt="${c.title}" class="discover-image">` : ''}
                </div>
                <div class="discover-body">
                    <div class="discover-icon"><i class="${c.icon}"></i></div>
                    <div class="discover-main">
                        <div class="discover-title">${c.title}</div>
                        <div class="discover-desc">${c.desc}</div>
                        <div class="discover-meta"><span>${c.members} Members</span><span class="dot"></span><span>${c.price}</span></div>
                    </div>
                </div>
            </div>
        `).join('');

        // Asignar click -> abrir vista
        grid.querySelectorAll('.discover-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                const item = this.communities.find(x => String(x.id) === String(id));
                if(item){
                    localStorage.setItem('community.view.item', JSON.stringify(item));
                    window.location.href = './community-view.html';
                }
            });
        });
    }

    // (Se elimina el módulo de feed)

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
        this.showToast('Cargando más actividad...', 'info');
        
        setTimeout(() => {
            // Add more mock activity
            const newActivity = [
                {
                    id: this.activityData.length + 1,
                    user: 'Laura Fernández',
                    avatar: 'fas fa-user',
                    action: 'completó el curso de ChatGPT',
                    time: 'Hace 3 horas'
                },
                {
                    id: this.activityData.length + 2,
                    user: 'Diego Ramírez',
                    avatar: 'fas fa-user',
                    action: 'se unió a la comunidad',
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
        // Estadísticas del hero
        const totalMembersElement = document.getElementById('totalMembers');
        const totalPostsElement = document.getElementById('totalPosts');
        if (totalMembersElement) this.animateNumber(totalMembersElement, 0, this.communityStats.totalMembers, 2000);
        if (totalPostsElement) this.animateNumber(totalPostsElement, 0, (this.communities?.length || this.communityStats.totalPosts), 2000);
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
}

// ===== THEME TOGGLE FUNCTIONS =====
window.toggleTheme = function() {
    console.log('🎨 Theme toggle called from community');

    // Agregar efecto de click al botón
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

    // Usar la función global de cambio de tema
    if (window.toggleGlobalTheme) {
        window.toggleGlobalTheme();
        console.log('🎨 Theme toggled via global function to:', newTheme);
    } else {
        // Fallback manual si el script global no está disponible
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
        console.log('🎨 Theme toggled via fallback to:', newTheme);
    }

    // Activar animación de transformación
    const iconContainer = document.querySelector('.theme-icon-container');
    if (iconContainer) {
        // Limpiar clases previas
        iconContainer.classList.remove('theme-transforming', 'theme-transforming-reverse');

        // Aplicar la animación correcta
        if (newTheme === 'light') {
            iconContainer.classList.add('theme-transforming');
        } else {
            iconContainer.classList.add('theme-transforming-reverse');
        }

        // Remover clase después de la animación
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
};

// ===== INITIALIZATION =====
let communityPage;

document.addEventListener('DOMContentLoaded', () => {
    communityPage = new CommunityPage();
});

// ===== GLOBAL FUNCTIONS =====
window.communityPage = communityPage;
