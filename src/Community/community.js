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
                if(emailEl && user.email) emailEl.textContent = user.email;
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
        // Intentar varias veces para asegurar que los elementos existan
        let attempts = 0;
        const maxAttempts = 10;
        
        const trySetup = () => {
            const avatarBtn = document.querySelector('.header-profile');
            const menu = document.getElementById('profileMenu');
            
            if(avatarBtn && menu) {
                console.log('Setting up profile menu');
                
                // Remover listeners previos para evitar duplicados
                avatarBtn.removeEventListener('click', this.handleProfileClick);
                
                // Crear función bound para poder removerla después
                this.handleProfileClick = (e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    console.log('Profile button clicked');
                    menu.classList.toggle('show');
                };
                
                avatarBtn.addEventListener('click', this.handleProfileClick);
                
                // Click fuera para cerrar
                document.addEventListener('click', (e) => { 
                    if(!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
                        menu.classList.remove('show');
                    }
                });
                
                return true;
            } else {
                attempts++;
                console.log(`Profile elements not found, attempt ${attempts}/${maxAttempts}`);
                if(attempts < maxAttempts) {
                    setTimeout(trySetup, 100);
                }
                return false;
            }
        };
        
        trySetup();
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
                // Already on community page, just update active state
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                clickedBtn.classList.add('active');
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
        this.communityStats = { totalMembers: 1247, totalPosts: 0 };

        // Grid Discover (categorías solicitadas)
        this.communities = [
            { id:1, rank:1, title:'Skoolers', category:'negocios', members:'74.3k', price:'Free', desc:"Private club for skool owners. Let's build communities together.", thumb:'', icon:'fas fa-users' },
            { id:2, rank:2, title:'AI Automation Agency Hub', category:'ia', members:'225.4k', price:'Free', desc:'Start Your AI Automation Agency — plantillas y recursos.', thumb:'', icon:'fas fa-robot' },
            { id:3, rank:3, title:'AI Automation (A-Z)', category:'ia', members:'87.4k', price:'Free', desc:'Learn to build and scale your agency.', thumb:'', icon:'fas fa-microchip' },
            { id:4, rank:4, title:'AI Automation Society', category:'ia', members:'116.8k', price:'Free', desc:'Mastering AI-driven automation and agents.', thumb:'', icon:'fas fa-brain' },
            { id:5, rank:5, title:'UDNIA', category:'negocios', members:'2.1k', price:'$49/month', desc:'Comunidad hispana para ganar dinero con IA.', thumb:'', icon:'fas fa-briefcase' },
            { id:6, rank:6, title:'KubeCraft Career Accelerator', category:'it', members:'783', price:'Paid', desc:'Upskill with job‑ready projects.', thumb:'', icon:'fas fa-gear' },
            { id:7, rank:7, title:'Data Wizards', category:'datos', members:'12.4k', price:'Free', desc:'Ingeniería de datos, analytics y BI.', thumb:'', icon:'fas fa-database' },
            { id:8, rank:8, title:'Dev Builders', category:'desarrollo', members:'32.1k', price:'Free', desc:'Full‑stack, APIs y automatización.', thumb:'', icon:'fas fa-code' },
            { id:9, rank:9, title:'Creative Design Hub', category:'diseno', members:'9.8k', price:'Free', desc:'UI/UX, motion y branding.', thumb:'', icon:'fas fa-pen-nib' },
            { id:10, rank:10, title:'Growth Marketers', category:'marketing', members:'18.6k', price:'Free', desc:'Ads, SEO y growth.', thumb:'', icon:'fas fa-bullhorn' }
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
                <div class="discover-thumb"></div>
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

// ===== INITIALIZATION =====
let communityPage;

document.addEventListener('DOMContentLoaded', () => {
    communityPage = new CommunityPage();
    
    // Configuración adicional del perfil como backup
    setTimeout(() => {
        setupProfileMenuDirect();
    }, 500);
});

// Función directa para configurar el menú de perfil
function setupProfileMenuDirect() {
    const avatarBtn = document.querySelector('.header-profile');
    const menu = document.getElementById('profileMenu');
    
    if(avatarBtn && menu) {
        console.log('Direct profile menu setup');
        
        avatarBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Direct profile click handler');
            menu.classList.toggle('show');
        };
        
        document.onclick = function(e) {
            if(!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
                menu.classList.remove('show');
            }
        };
    } else {
        console.log('Profile elements still not found in direct setup');
    }
}

// Función global para toggle del menú (inline handler)
function toggleProfileMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Inline toggle profile menu');
    const menu = document.getElementById('profileMenu');
    if(menu) {
        menu.classList.toggle('show');
    }
}

// Click fuera para cerrar (configurar una sola vez)
document.addEventListener('click', function(e) {
    const menu = document.getElementById('profileMenu');
    const avatarBtn = document.querySelector('.header-profile');
    if(menu && avatarBtn && !menu.contains(e.target) && !avatarBtn.contains(e.target)) {
        menu.classList.remove('show');
    }
});

// ===== GLOBAL FUNCTIONS =====
window.communityPage = communityPage;
window.setupProfileMenuDirect = setupProfileMenuDirect;
window.toggleProfileMenu = toggleProfileMenu;
