/**
 * COURSES.JS - Funcionalidad para la página de Mis Cursos
 * Maneja pestañas, progreso, animaciones y datos de cursos
 */

// ===== CONFIGURACIÓN Y DATOS =====
const COURSES_CONFIG = {
    animationDuration: 300,
    progressAnimationDelay: 500,
    streakUpdateInterval: 24 * 60 * 60 * 1000, // 24 horas
    autoSaveInterval: 30 * 1000, // 30 segundos
};

// Datos de ejemplo de cursos (en producción vendría de una API)
const COURSES_DATA = {
    enrolled: [
        {
            id: 'curso-ia-completo',
            title: 'Aprende y Aplica IA — Curso Completo',
            instructor: 'Lia IA',
            image: 'assets/images/brain-icon.jpg',
            progress: 25,
            totalLessons: 8,
            completedLessons: 2,
            lastAccessed: '2024-01-15',
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

// Estado de la aplicación
let appState = {
    currentTab: 'all-courses',
    learningStreak: {
        currentStreak: 0,
        weeklyGoal: 30, // minutos
        weeklyProgress: 0,
        visits: 1,
        startDate: new Date().toISOString().split('T')[0]
    },
    userPreferences: {
        remindersEnabled: true,
        darkMode: true,
        autoPlay: false
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('[COURSES] Inicializando página de cursos...');
    console.log('[COURSES] URL actual:', window.location.href);
    console.log('[COURSES] LocalStorage selectedCourse:', localStorage.getItem('selectedCourse'));
    
    try {
        initializeCoursesPage();
        setupEventListeners();
        loadUserData();
        updateLearningStreak();
        animatePageLoad();
        
        console.log('[COURSES] Página de cursos inicializada correctamente');
        console.log('[COURSES] Botones encontrados:', document.querySelectorAll('.btn-course-primary').length);
    } catch (error) {
        console.error('[COURSES] Error al inicializar:', error);
    }
});

function initializeCoursesPage() {
    // Configurar tema oscuro por defecto
    document.body.classList.add('dark-theme');
    
    // Establecer pestaña activa inicial
    const initialTab = getUrlParameter('tab') || 'all-courses';
    switchTab(initialTab);
    
    // Renderizar contenido inicial
    renderCourses();
    updateProgressBars();
    
    console.log('[COURSES] Configuración inicial completada');
}

// ===== MANEJO DE PESTAÑAS =====
function setupEventListeners() {
    // Pestañas de navegación
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        if (button.disabled) return; // ignorar deshabilitados
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Botones de acción
    const getStartedBtn = document.getElementById('getStartedBtn');
    const dismissBtn = document.getElementById('dismissBtn');
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', openLearningScheduler);
    }
    
    if (dismissBtn) {
        dismissBtn.addEventListener('click', dismissReminder);
    }
    
    // Botones de cursos
    setupCourseButtons();
    
    // Menús de cursos
    setupCourseMenus();
    
    // Navegación responsive
    setupResponsiveNavigation();
    
    console.log('[COURSES] Event listeners configurados');
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
    
    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.classList.add('active');
        
        // Animar entrada del contenido
        animateTabContent(activeContent);
    }
    
    // Actualizar estado
    appState.currentTab = tabId;
    
    // Guardar en URL
    updateUrlParameter('tab', tabId);
    
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

// ===== RENDERIZADO DE CURSOS =====
function renderCourses() {
    const coursesGrid = document.querySelector('.courses-grid');
    if (!coursesGrid) return;
    
    // Limpiar contenido existente (mantener los cursos de ejemplo del HTML)
    // Solo agregamos funcionalidad a los cursos existentes
    
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach((card, index) => {
        // Agregar datos del curso al card
        const courseData = COURSES_DATA.enrolled[index];
        if (courseData) {
            enhanceCourseCard(card, courseData);
        }
        
        // Animación de entrada escalonada
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    console.log('[COURSES] Cursos renderizados');
}

function enhanceCourseCard(card, courseData) {
    // Actualizar barra de progreso
    const progressFill = card.querySelector('.progress-fill');
    const progressText = card.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        // Animar progreso
        setTimeout(() => {
            progressFill.style.width = `${courseData.progress}%`;
        }, COURSES_CONFIG.progressAnimationDelay);
        
        progressText.textContent = `${courseData.progress}% completado`;
    }
    
    // Actualizar solo el texto del botón, manteniendo el ícono
    const actionButton = card.querySelector('.btn-course-primary');
    if (actionButton) {
        const icon = actionButton.querySelector('i');
        const buttonText = courseData.progress > 0 ? 'Continuar curso' : 'Iniciar curso';
        
        if (icon) {
            // Mantener ícono existente
            actionButton.innerHTML = `<i class='${icon.className}'></i>${buttonText}`;
        } else {
            // Agregar ícono si no existe
            actionButton.innerHTML = `<i class='bx bx-play-circle'></i>${buttonText}`;
        }
        
        // Agregar el courseId como atributo de datos para usar en setupCourseButtons
        actionButton.setAttribute('data-course-id', courseData.id);
    }
    
    // Agregar tooltip con información adicional
    card.title = `${courseData.category} • ${courseData.difficulty} • ${courseData.estimatedTime}`;
}

// ===== FUNCIONALIDAD DE CURSOS =====
function continueCourse(courseId, buttonElement = null) {
    console.log(`[COURSES] Continuando curso: ${courseId}`);
    
    // Buscar el botón si no se proporciona
    if (!buttonElement) {
        buttonElement = document.querySelector(`[data-course-id="${courseId}"]`) || 
                      document.querySelector('.btn-course-primary');
    }
    
    if (buttonElement) {
        // Mostrar indicador de carga
        const originalHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>Cargando...';
        buttonElement.disabled = true;
        
        // Simular carga y redirigir al chat
        setTimeout(() => {
            try {
                // Actualizar progreso de la racha
                updateStreakProgress();
                
                // Guardar el curso seleccionado en localStorage para el chat
                localStorage.setItem('selectedCourse', JSON.stringify({
                    id: courseId,
                    timestamp: Date.now()
                }));
                
                console.log(`[COURSES] Redirigiendo al chat con curso: ${courseId}`);
                
                // Redirigir al chat con el curso seleccionado
                window.location.href = `chat.html?course=${courseId}`;
            } catch (error) {
                console.error('[COURSES] Error al procesar el curso:', error);
                
                // Restaurar botón en caso de error
                buttonElement.innerHTML = originalHTML;
                buttonElement.disabled = false;
                
                // Mostrar mensaje de error
                alert('Error al iniciar el curso. Por favor, inténtalo de nuevo.');
            }
        }, 1000);
    } else {
        console.error('[COURSES] No se encontró el botón del curso');
        
        // Redirigir directamente si no hay botón
        setTimeout(() => {
            window.location.href = `chat.html?course=${courseId}`;
        }, 500);
    }
}

function setupCourseButtons() {
    const courseButtons = document.querySelectorAll('.btn-course-primary');
    
    courseButtons.forEach((button, index) => {
        button.addEventListener('click', function(event) {
            // Prevenir múltiples clicks
            if (this.disabled) return;
            
            const card = this.closest('.course-card');
            const courseTitle = card.querySelector('h3').textContent;
            
            // Efecto visual de click
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Obtener courseId del atributo de datos o determinar por índice/título
            let courseId = this.getAttribute('data-course-id');
            
            if (!courseId) {
                // Fallback: determinar por índice o título
                if (index === 0 || courseTitle.includes('Aprende y Aplica IA')) {
                    courseId = 'curso-ia-completo';
                } else if (index === 1 || courseTitle.includes('Machine Learning')) {
                    courseId = 'ml-fundamentos';
                } else {
                    courseId = 'curso-ia-completo'; // Por defecto
                }
            }
            
            console.log(`[COURSES] Iniciando curso: ${courseTitle} (${courseId})`);
            
            // Llamar a la función de continuar curso pasando el botón
            continueCourse(courseId, this);
        });
    });
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
    // Implementar menú contextual del curso
    const menu = createCourseMenu();
    const rect = button.getBoundingClientRect();
    
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;
    
    document.body.appendChild(menu);
    
    // Remover menú al hacer click fuera
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
    
    // Estilos del menú
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
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem('lastVisitDate');
    
    if (lastVisit !== today) {
        // Nueva visita del día
        appState.learningStreak.visits += 1;
        localStorage.setItem('lastVisitDate', today);
        
        // Actualizar racha si es consecutiva
        if (isConsecutiveDay(lastVisit, today)) {
            appState.learningStreak.currentStreak += 1;
        } else if (lastVisit && !isConsecutiveDay(lastVisit, today)) {
            // Racha rota
            appState.learningStreak.currentStreak = 1;
        }
        
        saveUserData();
    }
    
    // Actualizar UI de la racha
    updateStreakUI();
}

function updateStreakUI() {
    const streakNumber = document.querySelector('.streak-number');
    const progressCircle = document.querySelector('.progress-circle');
    const statValues = document.querySelectorAll('.stat-value');
    
    if (streakNumber) {
        animateNumber(streakNumber, 0, appState.learningStreak.currentStreak, 1000);
    }
    
    if (progressCircle) {
        const progressPercent = (appState.learningStreak.weeklyProgress / appState.learningStreak.weeklyGoal) * 100;
        const circumference = 2 * Math.PI * 36; // radio = 36
        const offset = circumference - (progressPercent / 100) * circumference;
        
        setTimeout(() => {
            progressCircle.style.strokeDashoffset = offset;
        }, 500);
    }
    
    // Actualizar estadísticas
    if (statValues.length >= 3) {
        statValues[0].textContent = appState.learningStreak.currentStreak;
        statValues[1].textContent = `${appState.learningStreak.weeklyProgress}/30`;
        statValues[2].textContent = `${appState.learningStreak.visits}/1`;
    }
}

function updateStreakProgress() {
    // Incrementar progreso semanal (simular 5 minutos de estudio)
    appState.learningStreak.weeklyProgress = Math.min(
        appState.learningStreak.weeklyProgress + 5,
        appState.learningStreak.weeklyGoal
    );
    
    saveUserData();
    updateStreakUI();
    
    // Mostrar celebración si se alcanza la meta
    if (appState.learningStreak.weeklyProgress >= appState.learningStreak.weeklyGoal) {
        showStreakCelebration();
    }
}

function showStreakCelebration() {
    // Crear modal de celebración
    const celebration = document.createElement('div');
    celebration.className = 'streak-celebration';
    celebration.innerHTML = `
        <div class="celebration-content">
            <i class='bx bx-trophy'></i>
            <h3>¡Meta Semanal Alcanzada!</h3>
            <p>Has completado tu objetivo de 30 minutos esta semana.</p>
            <button onclick="this.parentElement.parentElement.remove()">Continuar</button>
        </div>
    `;
    
    // Estilos
    Object.assign(celebration.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000',
        animation: 'fadeIn 0.5s ease-out'
    });
    
    document.body.appendChild(celebration);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (celebration.parentElement) {
            celebration.remove();
        }
    }, 5000);
}

// ===== RECORDATORIOS Y PROGRAMACIÓN =====
function openLearningScheduler() {
    console.log('[COURSES] Abriendo programador de aprendizaje...');
    
    // Crear modal de programación
    const modal = createSchedulerModal();
    document.body.appendChild(modal);
    
    // Animar entrada
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.scheduler-content').style.transform = 'scale(1)';
    }, 50);
}

function createSchedulerModal() {
    const modal = document.createElement('div');
    modal.className = 'scheduler-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeScheduler()"></div>
        <div class="scheduler-content">
            <div class="scheduler-header">
                <h3>Programa tu tiempo de aprendizaje</h3>
                <button onclick="closeScheduler()" class="close-btn">×</button>
            </div>
            <div class="scheduler-body">
                <div class="time-selector">
                    <label>¿Cuánto tiempo quieres estudiar por día?</label>
                    <div class="time-options">
                        <button class="time-option" data-minutes="15">15 min</button>
                        <button class="time-option active" data-minutes="30">30 min</button>
                        <button class="time-option" data-minutes="60">1 hora</button>
                        <button class="time-option" data-minutes="120">2 horas</button>
                    </div>
                </div>
                <div class="days-selector">
                    <label>¿Qué días quieres estudiar?</label>
                    <div class="days-grid">
                        <button class="day-option active" data-day="1">L</button>
                        <button class="day-option active" data-day="2">M</button>
                        <button class="day-option active" data-day="3">X</button>
                        <button class="day-option active" data-day="4">J</button>
                        <button class="day-option active" data-day="5">V</button>
                        <button class="day-option" data-day="6">S</button>
                        <button class="day-option" data-day="0">D</button>
                    </div>
                </div>
                <div class="notification-toggle">
                    <label>
                        <input type="checkbox" checked>
                        Enviar recordatorios por notificación
                    </label>
                </div>
            </div>
            <div class="scheduler-footer">
                <button class="btn-secondary" onclick="closeScheduler()">Cancelar</button>
                <button class="btn-primary" onclick="saveSchedule()">Guardar horario</button>
            </div>
        </div>
    `;
    
    // Estilos del modal
    Object.assign(modal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    
    return modal;
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
    
    // Guardar preferencia
    localStorage.setItem('reminderDismissed', 'true');
    console.log('[COURSES] Recordatorio descartado');
}

// ===== NAVEGACIÓN RESPONSIVE =====
function setupResponsiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Agregar indicadores de navegación en móvil
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Efecto de ripple
            createRippleEffect(this);
        });
    });
}

function createRippleEffect(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
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

function animatePageLoad() {
    // Animar elementos de la página al cargar
    const animatedElements = document.querySelectorAll('.learning-streak-card, .learning-reminder-card, .course-card');
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function isConsecutiveDay(lastDate, currentDate) {
    if (!lastDate) return true;
    
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = current - last;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays === 1;
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function updateUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
}

function saveUserData() {
    localStorage.setItem('coursesAppState', JSON.stringify(appState));
}

function loadUserData() {
    const saved = localStorage.getItem('coursesAppState');
    if (saved) {
        appState = { ...appState, ...JSON.parse(saved) };
    }
}

// ===== FUNCIONES GLOBALES PARA EVENTOS HTML =====
window.closeScheduler = function() {
    const modal = document.querySelector('.scheduler-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
};

window.saveSchedule = function() {
    console.log('[COURSES] Guardando horario de aprendizaje...');
    
    // Obtener configuración seleccionada
    const selectedTime = document.querySelector('.time-option.active')?.dataset.minutes || 30;
    const selectedDays = Array.from(document.querySelectorAll('.day-option.active')).map(btn => btn.dataset.day);
    const notificationsEnabled = document.querySelector('.notification-toggle input').checked;
    
    // Guardar preferencias
    appState.userPreferences.dailyGoal = parseInt(selectedTime);
    appState.userPreferences.studyDays = selectedDays;
    appState.userPreferences.remindersEnabled = notificationsEnabled;
    
    saveUserData();
    
    // Mostrar confirmación
    const button = event.target;
    button.textContent = '¡Guardado!';
    button.style.background = 'var(--course-success)';
    
    setTimeout(() => {
        closeScheduler();
    }, 1000);
};

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

console.log('[COURSES] Script de cursos cargado correctamente');
