/**
 * COURSES.JS - Funcionalidad para la página de Mis Cursos
 */

// Configuración
const COURSES_CONFIG = {
    animationDuration: 300,
    searchDebounceDelay: 300,
};

// Datos de cursos
const COURSES_DATA = {
    enrolled: [
        {
            id: 'chatgpt-gemini-productividad',
            title: 'Dominando ChatGPT y Gemini para la Productividad',
            instructor: 'Lia IA',
            image: 'assets/images/brain-icon.jpg',
            progress: 0,
            totalLessons: 10,
            completedLessons: 0,
            lastAccessed: null,
            estimatedTime: '15 horas',
            category: 'Inteligencia Artificial',
            difficulty: 'Intermedio',
            rating: 4.9,
            isActive: true
        },
        {
            id: 'curso-ia-completo',
            title: 'Aprende y Aplica IA — Curso Completo',
            instructor: 'Lia IA',
            image: 'assets/images/brain-icon.jpg',
            progress: 0,
            totalLessons: 8,
            completedLessons: 0,
            lastAccessed: null,
            estimatedTime: '12 horas',
            category: 'Inteligencia Artificial',
            difficulty: 'Intermedio',
            rating: 4.8,
            isActive: true
        },
        {
            id: 'ml-fundamentos',
            title: 'Fundamentos de Machine Learning',
            instructor: 'Lia IA',
            image: 'assets/images/brain-icon.jpg',
            progress: 0,
            totalLessons: 12,
            completedLessons: 0,
            lastAccessed: null,
            estimatedTime: '20 horas',
            category: 'Machine Learning',
            difficulty: 'Principiante',
            rating: 4.9,
            isActive: false
        }
    ],
    wishlist: [],
    archived: [],
    lists: []
};

// Sistema de datos del usuario
class UserLearningData {
    constructor() {
        this.storageKey = 'userLearningData';
        this.data = this.loadData();
        this.initializeData();
    }

    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : this.getDefaultData();
    }

    getDefaultData() {
        return {
            streak: {
                currentStreak: 0,
                longestStreak: 0,
                weeklyGoal: 30,
                weeklyProgress: 0,
                totalVisits: 0,
                startDate: new Date().toISOString().split('T')[0],
                lastVisitDate: null,
                weeklyStartDate: this.getWeekStartDate()
            },
            sessions: [],
            courseProgress: {},
            preferences: {
                remindersEnabled: true,
                darkMode: true,
                autoPlay: false,
                dailyGoal: 30,
                studyDays: ['1', '2', '3', '4', '5']
            }
        };
    }

    getWeekStartDate() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - daysToSubtract);
        return monday.toISOString().split('T')[0];
    }

    initializeData() {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.data.streak.lastVisitDate || this.data.streak.lastVisitDate !== today) {
            this.recordVisit(today);
        }

        this.checkWeeklyReset();
        this.saveData();
    }

    recordVisit(date) {
        const today = new Date(date);
        const lastVisit = this.data.streak.lastVisitDate ? new Date(this.data.streak.lastVisitDate) : null;
        
        this.data.streak.totalVisits++;
        
        if (!lastVisit) {
            this.data.streak.currentStreak = 1;
        } else {
            const daysDiff = Math.floor((today - lastVisit) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                this.data.streak.currentStreak++;
            } else if (daysDiff > 1) {
                this.data.streak.currentStreak = 1;
            }
        }
        
        if (this.data.streak.currentStreak > this.data.streak.longestStreak) {
            this.data.streak.longestStreak = this.data.streak.currentStreak;
        }
        
        this.data.streak.lastVisitDate = date;
    }

    checkWeeklyReset() {
        const currentWeekStart = this.getWeekStartDate();
        
        if (this.data.streak.weeklyStartDate !== currentWeekStart) {
            this.data.streak.weeklyProgress = 0;
            this.data.streak.weeklyStartDate = currentWeekStart;
        }
    }

    addStudySession(minutes, courseId = null) {
        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            minutes: minutes,
            courseId: courseId
        };
        
        this.data.sessions.push(session);
        
        this.data.streak.weeklyProgress = Math.min(
            this.data.streak.weeklyProgress + minutes,
            this.data.streak.weeklyGoal
        );
        
        if (courseId) {
            if (!this.data.courseProgress[courseId]) {
                this.data.courseProgress[courseId] = {
                    totalMinutes: 0,
                    sessions: 0,
                    lastSession: null
                };
            }
            
            this.data.courseProgress[courseId].totalMinutes += minutes;
            this.data.courseProgress[courseId].sessions++;
            this.data.courseProgress[courseId].lastSession = session.date;
        }
        
        this.saveData();
    }

    getTotalCourseMinutes() {
        let totalMinutes = 0;
        for (const courseId in this.data.courseProgress) {
            totalMinutes += this.data.courseProgress[courseId].totalMinutes;
        }
        return totalMinutes;
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
}

// Instancia global de datos del usuario
const userData = new UserLearningData();

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('[COURSES] Inicializando página de cursos...');
    
    try {
        hydrateUserHeader();
        setupProfileMenu();
        initializeCoursesPage();
        setupEventListeners();
        updateLearningStreak();
        
        console.log('[COURSES] Página de cursos inicializada correctamente');
    } catch (error) {
        console.error('[COURSES] Error al inicializar:', error);
    }
});

function initializeCoursesPage() {
    document.body.classList.add('dark-theme');
    
    const initialTab = getUrlParameter('tab') || 'all-courses';
    switchTab(initialTab);
    
    renderCourses();
    updateProgressBars();
    
    console.log('[COURSES] Configuración inicial completada');
}

// Mostrar mensaje de bienvenida con el display_name del usuario
function hydrateUserHeader() {
    try {
        const titleEl = document.getElementById('welcomeTitle');
        if (!titleEl) return;
        const raw = localStorage.getItem('currentUser');
        if (!raw) return;
        const user = JSON.parse(raw);
        const name = user.display_name || user.full_name || user.name || user.username || user.email || '';
        if (!name) return;
        titleEl.textContent = `Bienvenido ${name}`;
        // Solo aplicar estilos inline si no está en modo claro
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme !== 'light') {
        titleEl.style.color = 'var(--course-title)';
        titleEl.style.fontWeight = '800';
        } else {
            // En modo claro, remover estilos inline para que funcionen los CSS
            titleEl.style.removeProperty('color');
            titleEl.style.removeProperty('font-weight');
        }
    } catch (_) {}
}

// ===== MANEJO DE PESTAÑAS =====
function setupEventListeners() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        if (button.disabled) return;
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    const getStartedBtn = document.getElementById('getStartedBtn');
    const dismissBtn = document.getElementById('dismissBtn');
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', openLearningScheduler);
    }
    
    if (dismissBtn) {
        dismissBtn.addEventListener('click', dismissReminder);
    }
    
    setupCourseButtons();
    setupCourseMenus();
    
    console.log('[COURSES] Event listeners configurados');
}

// Menú de perfil en el header (avatar)
function setupProfileMenu() {
    const avatarBtn = document.querySelector('.header-profile');
    const menu = document.getElementById('profileMenu');
    if (!avatarBtn || !menu) return;
    
    // Rellenar datos del usuario si existen en localStorage
    try {
        const raw = localStorage.getItem('currentUser');
        if (raw) {
            const user = JSON.parse(raw);
            const nameEl = document.getElementById('pmName');
            const emailEl = document.getElementById('pmEmail');
            if (nameEl) nameEl.textContent = user.display_name || user.username || 'Usuario';
            if (emailEl) emailEl.textContent = user.email || user.user?.email || '';
        }
    } catch (_) {}
    
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

function switchTab(tabId) {
    // Handle navigation to other pages
    if (tabId === 'noticias') {
        window.location.href = 'Notices/notices.html';
        return;
    }
    
    if (tabId === 'comunidad') {
        window.location.href = 'Community/community.html';
        return;
    }
    
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.classList.add('active');
        animateTabContent(activeContent);
    }
    
    console.log(`[COURSES] Cambiado a pestaña: ${tabId}`);
}

function animateTabContent(content) {
    content.style.opacity = '0';
    content.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        content.style.transition = 'all 0.4s ease-out';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
    }, 50);
}

// ===== FUNCIONALIDAD DE CURSOS =====
function setupCourseButtons() {
    const courseButtons = document.querySelectorAll('.btn-course-primary');
    
    courseButtons.forEach((button, index) => {
        button.addEventListener('click', function(event) {
            if (this.disabled) return;
            
            const card = this.closest('.course-card');
            const courseTitle = card.querySelector('h3').textContent;
            
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            let courseId = this.getAttribute('data-course-id');
            
            if (!courseId) {
                if (index === 0 || courseTitle.includes('Dominando ChatGPT')) {
                    courseId = 'chatgpt-gemini-productividad';
                } else if (index === 1 || courseTitle.includes('Aprende y Aplica IA')) {
                    courseId = 'curso-ia-completo';
                } else if (index === 2 || courseTitle.includes('Machine Learning')) {
                    courseId = 'ml-fundamentos';
                } else {
                    courseId = 'chatgpt-gemini-productividad';
                }
            }
            
            console.log(`[COURSES] Iniciando curso: ${courseTitle} (${courseId})`);
            continueCourse(courseId, this);
        });
    });
}

function continueCourse(courseId, buttonElement = null) {
    console.log(`[COURSES] Continuando curso: ${courseId}`);
    
    if (!buttonElement) {
        buttonElement = document.querySelector(`[data-course-id="${courseId}"]`) || 
                      document.querySelector('.btn-course-primary');
    }
    
    if (buttonElement) {
        const originalHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>Cargando...';
        buttonElement.disabled = true;
        
        setTimeout(async () => {
            try {
                // Quitar incremento artificial: el cómputo real lo hace el tracking por minuto
                localStorage.setItem('selectedCourse', JSON.stringify({
                    id: courseId,
                    timestamp: Date.now()
                }));
                
                console.log(`[COURSES] Redirigiendo al chat con curso: ${courseId}`);
                // Iniciar tracking en background (contador por minuto)
                try { await startMinuteTracking(courseId); } catch (e) { console.warn('Minute tracking init failed', e); }
                window.location.href = `chat.html?course=${courseId}`;
            } catch (error) {
                console.error('[COURSES] Error al procesar el curso:', error);
                
                buttonElement.innerHTML = originalHTML;
                buttonElement.disabled = false;
                alert('Error al iniciar el curso. Por favor, inténtalo de nuevo.');
            }
        }, 1000);
    } else {
        console.error('[COURSES] No se encontró el botón del curso');
        setTimeout(() => {
            window.location.href = `chat.html?course=${courseId}`;
        }, 500);
    }
}

// ===== Tracking por minuto (Supabase)
async function startMinuteTracking(courseId) {
    try {
        const supabaseUrl = localStorage.getItem('supabaseUrl');
        const supabaseKey = localStorage.getItem('supabaseAnonKey');
        const token = localStorage.getItem('userToken') || localStorage.getItem('authToken');
        const userDataStr = localStorage.getItem('userData') || localStorage.getItem('currentUser');
        if (!supabaseUrl || !supabaseKey || !userDataStr) return;
        const user = JSON.parse(userDataStr);
        const userId = user.id || user.user?.id || user.sub || user.user_id;
        if (!userId) return;

        // Registrar visita (upsert del día actual)
        try {
            await fetch(`${supabaseUrl}/rest/v1/course_visit?on_conflict=unique`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({ user_id: userId, course_id: courseId, visited_on: new Date().toISOString().slice(0,10), visits: 1 })
            });
        } catch (_) {}

        // Contador por minuto (max 60 min por sesión)
        let minutes = 0;
        const maxMinutes = 180; // seguridad
        const intervalId = setInterval(async () => {
            minutes += 1;
            try {
                await fetch(`${supabaseUrl}/rest/v1/study_session`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_id: userId, course_id: courseId, duration_minutes: 1 })
                });
            } catch (e) { console.warn('Failed to insert minute', e); }
            if (minutes >= maxMinutes) clearInterval(intervalId);
        }, 60 * 1000);

        // Guardar para cancelar si sale del curso
        window.addEventListener('beforeunload', () => clearInterval(intervalId));
    } catch (error) {
        console.error('[TRACKING] Error iniciando tracking minuto a minuto:', error);
    }
}

function setupCourseMenus() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    
    menuButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            showCourseMenu(this);
        });
    });
}

function showCourseMenu(button) {
    const menu = createCourseMenu();
    const rect = button.getBoundingClientRect();
    
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
        document.addEventListener('click', function removeMenu() {
            menu.remove();
            document.removeEventListener('click', removeMenu);
        });
    }, 100);
}

function createCourseMenu() {
    const menu = document.createElement('div');
    menu.className = 'course-context-menu';
    menu.innerHTML = `
        <button class="menu-item" onclick="addToWishlist()">
            <i class='bx bx-heart'></i>
            Agregar a favoritos
        </button>
        <button class="menu-item" onclick="addToList()">
            <i class='bx bx-list-ul'></i>
            Agregar a lista
        </button>
        <button class="menu-item" onclick="archiveCourse()">
            <i class='bx bx-archive'></i>
            Archivar
        </button>
        <button class="menu-item" onclick="shareCourse()">
            <i class='bx bx-share'></i>
            Compartir
        </button>
    `;
    
    Object.assign(menu.style, {
        background: 'var(--course-card-bg)',
        border: '1px solid var(--course-border)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: '1000',
        minWidth: '180px',
        padding: '8px',
        backdropFilter: 'blur(10px)'
    });
    
    return menu;
}

// ===== RACHA DE APRENDIZAJE =====
function updateLearningStreak() {
    updateStreakUI();
}

function updateStreakUI() {
    const streakInfo = userData.data.streak;
    // Evitar valores basura al inicio de perfil
    if (!streakInfo || streakInfo.totalVisits == null) {
        return;
    }
    const weekProgress = Math.max(0, userData.data.streak.weeklyProgress || 0);
    const weekGoal = Math.max(1, userData.data.streak.weeklyGoal || 30);
    const percentage = Math.round((weekProgress / weekGoal) * 100);
    
    const streakNumber = document.querySelector('.streak-number');
    if (streakNumber) {
        animateNumber(streakNumber, 0, streakInfo.currentStreak, 1000);
    }
    
    const progressCircle = document.querySelector('.progress-circle');
    if (progressCircle) {
        const circumference = 2 * Math.PI * 42;
        const offset = circumference - (percentage / 100) * circumference;
        
        setTimeout(() => {
            progressCircle.style.strokeDashoffset = offset;
        }, 500);
    }
    
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 3) {
        // Semanas reales de racha (currentStreak representa días continuos)
        const weeks = Math.max(0, Math.floor(streakInfo.currentStreak / 7));
        statValues[0].textContent = weeks;

        // Minuto a minuto acumulado real
        const totalCourseMinutes = userData.getTotalCourseMinutes();
        statValues[1].textContent = `${totalCourseMinutes}/30`;

        // Visitas reales (al menos 1 por día si hubo sesión)
        statValues[2].textContent = `${streakInfo.totalVisits}/1`;
    }
}

// ===== PROGRAMADOR DE APRENDIZAJE =====
function openLearningScheduler() {
    console.log('[COURSES] Abriendo programador de aprendizaje...');
    
    const modal = createSchedulerModal();
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.scheduler-content').style.transform = 'scale(1)';
    }, 50);
}

function createSchedulerModal() {
    const modal = document.createElement('div');
    modal.className = 'scheduler-modal';
    
    const currentPrefs = userData.data.preferences;
    
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeScheduler()"></div>
        <div class="scheduler-content">
            <div class="scheduler-header">
                <h3><svg class="header-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                </svg> Programa tu tiempo de aprendizaje</h3>
                <button onclick="closeScheduler()" class="close-btn" aria-label="Cerrar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="scheduler-body">
                <div class="time-selector">
                    <label><svg class="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                    </svg> ¿Cuánto tiempo quieres estudiar por día?</label>
                    <div class="time-options">
                        <button class="time-option ${currentPrefs.dailyGoal === 15 ? 'active' : ''}" data-minutes="15">
                            <span class="time-value">15</span>
                            <span class="time-unit">min</span>
                        </button>
                        <button class="time-option ${currentPrefs.dailyGoal === 30 ? 'active' : ''}" data-minutes="30">
                            <span class="time-value">30</span>
                            <span class="time-unit">min</span>
                        </button>
                        <button class="time-option ${currentPrefs.dailyGoal === 60 ? 'active' : ''}" data-minutes="60">
                            <span class="time-value">1</span>
                            <span class="time-unit">hora</span>
                        </button>
                        <button class="time-option ${currentPrefs.dailyGoal === 120 ? 'active' : ''}" data-minutes="120">
                            <span class="time-value">2</span>
                            <span class="time-unit">horas</span>
                        </button>
                    </div>
                </div>
                <div class="days-selector">
                    <label><svg class="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg> ¿Qué días quieres estudiar?</label>
                    <div class="days-grid">
                        <button class="day-option ${currentPrefs.studyDays.includes('1') ? 'active' : ''}" data-day="1" title="Lunes">L</button>
                        <button class="day-option ${currentPrefs.studyDays.includes('2') ? 'active' : ''}" data-day="2" title="Martes">M</button>
                        <button class="day-option ${currentPrefs.studyDays.includes('3') ? 'active' : ''}" data-day="3" title="Miércoles">X</button>
                        <button class="day-option ${currentPrefs.studyDays.includes('4') ? 'active' : ''}" data-day="4" title="Jueves">J</button>
                        <button class="day-option ${currentPrefs.studyDays.includes('5') ? 'active' : ''}" data-day="5" title="Viernes">V</button>
                        <button class="day-option ${currentPrefs.studyDays.includes('6') ? 'active' : ''}" data-day="6" title="Sábado">S</button>
                        <button class="day-option ${currentPrefs.studyDays.includes('0') ? 'active' : ''}" data-day="0" title="Domingo">D</button>
                    </div>
                </div>
                <div class="notification-toggle">
                    <label>
                        <input type="checkbox" ${currentPrefs.remindersEnabled ? 'checked' : ''}>
                        <span class="toggle-text"><svg class="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg> Enviar recordatorios por notificación</span>
                    </label>
                </div>
                <div class="schedule-summary">
                    <h4><svg class="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                    </svg> Resumen de tu horario</h4>
                    <div class="summary-content">
                        <div class="summary-item">
                            <span class="summary-label">Tiempo diario:</span>
                            <span class="summary-value" id="summaryTime">${currentPrefs.dailyGoal} min</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Días por semana:</span>
                            <span class="summary-value" id="summaryDays">${currentPrefs.studyDays.length}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Tiempo semanal:</span>
                            <span class="summary-value" id="summaryWeekly">${currentPrefs.dailyGoal * currentPrefs.studyDays.length} min</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="scheduler-footer">
                <button class="btn-primary" onclick="saveSchedule()">
                    <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17,21 17,13 7,13 7,21"></polyline>
                        <polyline points="7,3 7,8 15,8"></polyline>
                    </svg> Guardar horario
                </button>
            </div>
        </div>
    `;
    
    setupSchedulerEventListeners(modal);
    
    return modal;
}

function setupSchedulerEventListeners(modal) {
    const timeOptions = modal.querySelectorAll('.time-option');
    timeOptions.forEach(option => {
        option.addEventListener('click', function() {
            timeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            updateScheduleSummary();
        });
    });

    const dayOptions = modal.querySelectorAll('.day-option');
    dayOptions.forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('active');
            updateScheduleSummary();
        });
    });

    const notificationCheckbox = modal.querySelector('.notification-toggle input');
    notificationCheckbox.addEventListener('change', function() {
        updateScheduleSummary();
    });

    console.log('[COURSES] Event listeners del programador configurados');
}

function updateScheduleSummary() {
    const modal = document.querySelector('.scheduler-modal');
    if (!modal) return;

    const selectedTime = parseInt(modal.querySelector('.time-option.active')?.dataset.minutes) || 30;
    const selectedDays = Array.from(modal.querySelectorAll('.day-option.active')).map(btn => btn.dataset.day);
    const totalWeeklyMinutes = selectedTime * selectedDays.length;

    const summaryTime = modal.querySelector('#summaryTime');
    const summaryDays = modal.querySelector('#summaryDays');
    const summaryWeekly = modal.querySelector('#summaryWeekly');

    if (summaryTime) {
        summaryTime.textContent = selectedTime >= 60 ? 
            `${selectedTime / 60} ${selectedTime === 60 ? 'hora' : 'horas'}` : 
            `${selectedTime} min`;
    }

    if (summaryDays) {
        summaryDays.textContent = selectedDays.length;
    }

    if (summaryWeekly) {
        summaryWeekly.textContent = totalWeeklyMinutes >= 60 ? 
            `${totalWeeklyMinutes / 60} ${totalWeeklyMinutes === 60 ? 'hora' : 'horas'}` : 
            `${totalWeeklyMinutes} min`;
    }

    [summaryTime, summaryDays, summaryWeekly].forEach(element => {
        if (element) {
            element.style.transform = 'scale(1.1)';
            element.style.color = 'var(--course-accent)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 200);
        }
    });
}

function dismissReminder() {
    const reminderCard = document.querySelector('.learning-reminder-card');
    if (reminderCard) {
        reminderCard.style.transform = 'translateX(100%)';
        reminderCard.style.opacity = '0';
        
        setTimeout(() => {
            reminderCard.remove();
        }, 300);
    }
    
    localStorage.setItem('reminderDismissed', 'true');
    console.log('[COURSES] Recordatorio descartado');
}

// ===== RENDERIZADO DE CURSOS =====
function renderCourses() {
    const coursesGrid = document.querySelector('.courses-grid');
    if (!coursesGrid) return;
    
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach((card, index) => {
        const courseData = COURSES_DATA.enrolled[index];
        if (courseData) {
            enhanceCourseCard(card, courseData);
        }
        
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    console.log('[COURSES] Cursos renderizados');
}

function enhanceCourseCard(card, courseData) {
    const courseProgress = userData.data.courseProgress[courseData.id];
    const realProgress = courseProgress ? Math.min(Math.round((courseProgress.totalMinutes / 720) * 100), 100) : 0;
    
    const progressFill = card.querySelector('.progress-fill');
    const progressText = card.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        setTimeout(() => {
            progressFill.style.width = `${realProgress}%`;
        }, 500);
        
        progressText.textContent = `${realProgress}% completado`;
    }
    
    const actionButton = card.querySelector('.btn-course-primary');
    if (actionButton) {
        const icon = actionButton.querySelector('i');
        const buttonText = realProgress > 0 ? 'Continuar curso' : 'Iniciar curso';
        
        if (icon) {
            actionButton.innerHTML = `<i class='${icon.className}'></i>${buttonText}`;
        } else {
            actionButton.innerHTML = `<i class='bx bx-play-circle'></i>${buttonText}`;
        }
        
        actionButton.setAttribute('data-course-id', courseData.id);
    }
    
    const totalMinutes = courseProgress ? courseProgress.totalMinutes : 0;
    card.title = `${courseData.category} • ${courseData.difficulty} • ${totalMinutes} min estudiados`;
}

function updateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach((bar, index) => {
        const targetWidth = bar.style.width || '0%';
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-out';
            bar.style.width = targetWidth;
        }, index * 200);
    });
}

// ===== UTILIDADES =====
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOutCubic);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// ===== FUNCIONES GLOBALES =====
window.closeScheduler = function() {
    const modal = document.querySelector('.scheduler-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
};

window.saveSchedule = function() {
    console.log('[COURSES] Guardando horario de aprendizaje...');
    
    const modal = document.querySelector('.scheduler-modal');
    if (!modal) return;
    
    const selectedTime = parseInt(modal.querySelector('.time-option.active')?.dataset.minutes) || 30;
    const selectedDays = Array.from(modal.querySelectorAll('.day-option.active')).map(btn => btn.dataset.day);
    const notificationsEnabled = modal.querySelector('.notification-toggle input').checked;
    
    if (selectedDays.length === 0) {
        showSchedulerError('Por favor, selecciona al menos un día para estudiar.');
        return;
    }
    
    userData.data.preferences.dailyGoal = selectedTime;
    userData.data.preferences.studyDays = selectedDays;
    userData.data.preferences.remindersEnabled = notificationsEnabled;
    
    userData.saveData();
    
    const button = event.target;
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    
    button.innerHTML = '<svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg> ¡Guardado!';
    button.style.background = 'linear-gradient(135deg, var(--course-success), #16a34a)';
    button.style.transform = 'scale(1.05)';
    button.disabled = true;
    
    createConfettiEffect(modal);
    
    setTimeout(() => {
        closeScheduler();
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = originalBackground;
            button.style.transform = '';
            button.disabled = false;
        }, 500);
    }, 1500);
};

function showSchedulerError(message) {
    const modal = document.querySelector('.scheduler-modal');
    if (!modal) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'scheduler-error';
    errorDiv.innerHTML = `
        <div class="error-content">
            <span class="error-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg></span>
            <span class="error-text">${message}</span>
        </div>
    `;
    
    const header = modal.querySelector('.scheduler-header');
    header.parentNode.insertBefore(errorDiv, header.nextSibling);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 3000);
}

function createConfettiEffect(modal) {
    const confettiCount = 20;
    const colors = ['#44e5ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10001;
            left: ${Math.random() * 100}%;
            top: 50%;
            animation: confettiFall 2s ease-out forwards;
        `;
        
        modal.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 2000);
    }
}

// Funciones del menú contextual
window.addToWishlist = function() {
    console.log('[COURSES] Agregando a lista de deseos...');
};

window.addToList = function() {
    console.log('[COURSES] Agregando a lista personalizada...');
};

window.archiveCourse = function() {
    console.log('[COURSES] Archivando curso...');
};

window.shareCourse = function() {
    console.log('[COURSES] Compartiendo curso...');
};

// Clase de búsqueda
class CourseSearch {
    constructor() {
        this.searchInput = document.getElementById('courseSearchInput');
        this.searchClearBtn = document.getElementById('searchClearBtn');
        this.searchResults = document.getElementById('searchResults');
        this.searchResultsList = document.getElementById('searchResultsList');
        this.clearSearchBtn = document.getElementById('clearSearchBtn');
        this.resultsCount = document.querySelector('.results-count');
        this.debounceTimer = null;
        this.allCourses = [];
        
        this.initializeSearch();
    }

    initializeSearch() {
        if (!this.searchInput) return;
        
        this.allCourses = this.getAllCourses();
        
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchInput.addEventListener('focus', () => this.handleFocus());
        this.searchInput.addEventListener('blur', () => this.handleBlur());
        
        if (this.searchClearBtn) {
            this.searchClearBtn.addEventListener('click', () => this.clearSearch());
        }
        
        if (this.clearSearchBtn) {
            this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
        }
        
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
                this.searchInput.blur();
            }
        });
    }

    getAllCourses() {
        const courses = [
            ...COURSES_DATA.enrolled.map(course => ({ ...course, type: 'enrolled' })),
            ...COURSES_DATA.wishlist.map(course => ({ ...course, type: 'wishlist' })),
            ...COURSES_DATA.archived.map(course => ({ ...course, type: 'archived' }))
        ];
        
        COURSES_DATA.lists.forEach(list => {
            list.courses.forEach(course => {
                courses.push({ ...course, type: 'list', listName: list.name });
            });
        });
        
        return courses;
    }

    handleSearch(query) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.toggleClearButton(query.length > 0);
        
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query.trim());
        }, COURSES_CONFIG.searchDebounceDelay);
    }

    performSearch(query) {
        if (!query) {
            this.hideResults();
            return;
        }
        
        const results = this.searchCourses(query);
        this.displayResults(results, query);
    }

    searchCourses(query) {
        const searchTerm = query.toLowerCase();
        const results = [];
        
        this.allCourses.forEach(course => {
            const titleMatch = course.title.toLowerCase().includes(searchTerm);
            const instructorMatch = course.instructor.toLowerCase().includes(searchTerm);
            const categoryMatch = course.category.toLowerCase().includes(searchTerm);
            const difficultyMatch = course.difficulty.toLowerCase().includes(searchTerm);
            
            if (titleMatch || instructorMatch || categoryMatch || difficultyMatch) {
                results.push({
                    ...course,
                    relevance: this.calculateRelevance(course, searchTerm)
                });
            }
        });
        
        return results.sort((a, b) => b.relevance - a.relevance);
    }

    calculateRelevance(course, searchTerm) {
        let relevance = 0;
        const title = course.title.toLowerCase();
        const instructor = course.instructor.toLowerCase();
        const category = course.category.toLowerCase();
        
        if (title.includes(searchTerm)) {
            relevance += 10;
            if (title.startsWith(searchTerm)) relevance += 5;
        }
        
        if (instructor.includes(searchTerm)) {
            relevance += 5;
        }
        
        if (category.includes(searchTerm)) {
            relevance += 3;
        }
        
        if (course.isActive) relevance += 2;
        
        return relevance;
    }

    displayResults(results, query) {
        if (results.length === 0) {
            this.showNoResults(query);
            return;
        }
        
        this.resultsCount.textContent = `${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`;
        
        this.searchResultsList.innerHTML = '';
        
        results.forEach(course => {
            const resultItem = this.createResultItem(course);
            this.searchResultsList.appendChild(resultItem);
        });
        
        this.showResults();
    }

    createResultItem(course) {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
            <div class="search-result-icon">
                <i class='bx bx-book-open'></i>
            </div>
            <div class="search-result-content">
                <div class="search-result-title">${this.highlightMatch(course.title)}</div>
                <div class="search-result-subtitle">${course.instructor} • ${course.category}</div>
                <div class="search-result-progress">
                    <div class="progress-mini">
                        <div class="progress-mini-fill" style="width: ${course.progress}%"></div>
                    </div>
                    <span class="progress-text-mini">${course.progress}% completado</span>
                </div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.selectCourse(course);
        });
        
        return item;
    }

    highlightMatch(text) {
        const searchTerm = this.searchInput.value.toLowerCase();
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark style="background: rgba(68, 229, 255, 0.3); color: var(--course-accent); padding: 0 2px; border-radius: 2px;">$1</mark>');
    }

    showNoResults(query) {
        this.resultsCount.textContent = `No se encontraron resultados para "${query}"`;
        this.searchResultsList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--course-text-muted);">
                <i class='bx bx-search' style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                <p>No hay cursos que coincidan con tu búsqueda</p>
                <small>Intenta con otros términos o revisa la ortografía</small>
            </div>
        `;
        this.showResults();
    }

    showResults() {
        this.searchResults.style.display = 'block';
        this.searchResults.style.animation = 'searchResultsSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    hideResults() {
        this.searchResults.style.display = 'none';
    }

    toggleClearButton(show) {
        if (!this.searchClearBtn) return;
        
        if (show) {
            this.searchClearBtn.style.display = 'flex';
            setTimeout(() => {
                this.searchClearBtn.classList.add('visible');
            }, 10);
        } else {
            this.searchClearBtn.classList.remove('visible');
            setTimeout(() => {
                this.searchClearBtn.style.display = 'none';
            }, 300);
        }
    }

    handleFocus() {
        this.searchInput.parentElement.style.transform = 'translateY(-2px)';
    }

    handleBlur() {
        setTimeout(() => {
            this.searchInput.parentElement.style.transform = 'translateY(0)';
        }, 200);
    }

    clearSearch() {
        this.searchInput.value = '';
        this.hideResultsWithAnimation();
        this.toggleClearButton(false);
        this.searchInput.focus();
    }

    hideResultsWithAnimation() {
        if (this.searchResults && this.searchResults.style.display === 'block') {
            this.searchResults.classList.add('sliding-out');
            
            setTimeout(() => {
                this.searchResults.style.display = 'none';
                this.searchResults.classList.remove('sliding-out');
            }, 300);
        } else {
            this.hideResults();
        }
    }

    selectCourse(course) {
        console.log('[SEARCH] Curso seleccionado:', course);
        
        this.hideResultsWithAnimation();
        this.searchInput.blur();
        
        this.showSelectionNotification(course.title);
    }

    showSelectionNotification(courseTitle) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(68, 229, 255, 0.95), rgba(68, 229, 255, 0.9));
            color: #000;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 8px 25px rgba(68, 229, 255, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = `Abriendo: ${courseTitle}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }
}

// Inicializar búsqueda cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CourseSearch();
});

console.log('[COURSES] Script de cursos cargado correctamente');
