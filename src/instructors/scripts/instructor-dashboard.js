// Panel de Maestros - Lógica Principal
class InstructorDashboard {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.charts = {};
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Panel de Maestros...');
        
        // Verificar autenticación
        await this.checkAuth();
        
        // Inicializar componentes
        this.initSidebar();
        this.initNavigation();
        this.initCharts();
        this.loadDashboardData();
        this.initFormHandlers();
        
        console.log('✅ Panel de Maestros inicializado correctamente');
    }

    async checkAuth() {
        const userDataStr = localStorage.getItem('userData') || localStorage.getItem('currentUser');
        const userToken = localStorage.getItem('userToken') || localStorage.getItem('authToken');
        
        if (!userDataStr || !userToken) {
            console.log('No hay datos de autenticación, redirigiendo al login');
            window.location.href = '../login/new-auth.html';
            return;
        }

        try {
            const userData = JSON.parse(userDataStr);
            if (userData.cargo_rol !== 'Instructor' && userData.cargo_rol !== 'instructor') {
                console.log('Usuario no es instructor, redirigiendo');
                window.location.href = '../cursos.html';
                return;
            }
            
            this.currentUser = userData;
            this.updateUserInfo();
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            window.location.href = '../login/new-auth.html';
        }
    }

    updateUserInfo() {
        const userNameElement = document.getElementById('userName');
        const userAvatarElement = document.getElementById('userAvatar');
        
        if (userNameElement) {
            const displayName = this.currentUser.display_name || 
                              this.currentUser.first_name + ' ' + this.currentUser.last_name ||
                              this.currentUser.username || 
                              this.currentUser.email?.split('@')[0] || 
                              'Maestro';
            userNameElement.textContent = displayName;
        }
        
        if (userAvatarElement && this.currentUser.profile_picture_url) {
            userAvatarElement.src = this.currentUser.profile_picture_url;
        }
    }

    initSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const dashboardContainer = document.querySelector('.dashboard-container');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                dashboardContainer.classList.toggle('sidebar-collapsed');
            });
        }
    }

    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const contentSections = document.querySelectorAll('.content-section');
        const pageTitle = document.getElementById('pageTitle');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const section = link.getAttribute('data-section');
                this.switchSection(section);
                
                // Actualizar navegación activa
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Actualizar título de la página
                if (pageTitle) {
                    const titles = {
                        'dashboard': 'Dashboard',
                        'courses': 'Mis Cursos',
                        'create-course': 'Crear Curso'
                    };
                    pageTitle.textContent = titles[section] || 'Dashboard';
                }
            });
        });
    }

    switchSection(sectionName) {
        const sections = document.querySelectorAll('.content-section');
        const targetSection = document.getElementById(sectionName);
        
        // Ocultar todas las secciones
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar la sección seleccionada
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Cargar datos específicos de la sección
            switch(sectionName) {
                case 'dashboard':
                    this.loadDashboardData();
                    break;
                case 'courses':
                    this.loadCourses();
                    break;
                case 'create-course':
                    this.initCreateCourseForm();
                    break;
            }
        }
    }

    async loadDashboardData() {
        console.log('📊 Cargando datos del dashboard...');
        
        // Simular datos del dashboard (en producción esto vendría de la API)
        const dashboardData = {
            stats: {
                totalCourses: 12,
                totalStudents: 847,
                totalLessons: 156,
                completionRate: 78
            },
            recentCourses: [
                {
                    id: 1,
                    title: 'JavaScript Avanzado',
                    students: 45,
                    progress: 85,
                    image: '../assets/images/course-1.jpg'
                },
                {
                    id: 2,
                    title: 'React Fundamentals',
                    students: 32,
                    progress: 92,
                    image: '../assets/images/course-2.jpg'
                },
                {
                    id: 3,
                    title: 'Node.js Backend',
                    students: 28,
                    progress: 67,
                    image: '../assets/images/course-3.jpg'
                }
            ]
        };

        this.updateStats(dashboardData.stats);
        this.updateRecentCourses(dashboardData.recentCourses);
        this.initCharts();
    }

    updateStats(stats) {
        // Actualizar contadores con animación
        this.animateCounter('totalCourses', stats.totalCourses);
        this.animateCounter('totalStudents', stats.totalStudents);
        this.animateCounter('totalLessons', stats.totalLessons);
        this.animateCounter('completionRate', stats.completionRate, '%');
    }

    animateCounter(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateRecentCourses(courses) {
        const coursesList = document.getElementById('recentCoursesList');
        if (!coursesList) return;

        coursesList.innerHTML = courses.map(course => `
            <div class="course-card">
                <div class="course-image">
                    <img src="${course.image}" alt="${course.title}" onerror="this.src='../assets/images/default-course.jpg'">
                </div>
                <div class="course-info">
                    <h4>${course.title}</h4>
                    <p>${course.students} estudiantes</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                    <span class="progress-text">${course.progress}% completado</span>
                </div>
            </div>
        `).join('');
    }

    initCharts() {
        // Gráfico de actividad reciente
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx && !this.charts.activity) {
            this.charts.activity = new Chart(activityCtx, {
                type: 'line',
                data: {
                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Estudiantes Activos',
                        data: [65, 78, 90, 85, 95, 88, 92],
                        borderColor: '#44E5FF',
                        backgroundColor: 'rgba(68, 229, 255, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }

        // Gráfico de distribución de cursos
        const coursesCtx = document.getElementById('coursesChart');
        if (coursesCtx && !this.charts.courses) {
            this.charts.courses = new Chart(coursesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Programación', 'Diseño', 'Marketing', 'Negocios', 'Tecnología'],
                    datasets: [{
                        data: [35, 25, 20, 15, 5],
                        backgroundColor: [
                            '#44E5FF',
                            '#FF6B6B',
                            '#4ECDC4',
                            '#45B7D1',
                            '#96CEB4'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                padding: 20
                            }
                        }
                    }
                }
            });
        }
    }

    async loadCourses() {
        console.log('📚 Cargando cursos...');
        
        // Simular datos de cursos (en producción esto vendría de la API)
        const courses = [
            {
                id: 1,
                title: 'JavaScript Avanzado',
                description: 'Aprende JavaScript moderno con ES6+, async/await, y patrones avanzados',
                category: 'Programación',
                level: 'Avanzado',
                students: 45,
                lessons: 24,
                image: '../assets/images/course-1.jpg',
                status: 'published'
            },
            {
                id: 2,
                title: 'React Fundamentals',
                description: 'Domina React desde cero con hooks, context y routing',
                category: 'Programación',
                level: 'Intermedio',
                students: 32,
                lessons: 18,
                image: '../assets/images/course-2.jpg',
                status: 'published'
            },
            {
                id: 3,
                title: 'Node.js Backend',
                description: 'Construye APIs robustas con Node.js, Express y MongoDB',
                category: 'Programación',
                level: 'Avanzado',
                students: 28,
                lessons: 22,
                image: '../assets/images/course-3.jpg',
                status: 'draft'
            }
        ];

        this.displayCourses(courses);
    }

    displayCourses(courses) {
        const coursesGrid = document.getElementById('coursesGrid');
        if (!coursesGrid) return;

        coursesGrid.innerHTML = courses.map(course => `
            <div class="course-card">
                <div class="course-header">
                    <img src="${course.image}" alt="${course.title}" onerror="this.src='../assets/images/default-course.jpg'">
                    <div class="course-status ${course.status}">
                        ${course.status === 'published' ? 'Publicado' : 'Borrador'}
                    </div>
                </div>
                <div class="course-content">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <div class="course-meta">
                        <span class="category">${course.category}</span>
                        <span class="level">${course.level}</span>
                    </div>
                    <div class="course-stats">
                        <span>${course.students} estudiantes</span>
                        <span>${course.lessons} lecciones</span>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn-secondary" onclick="editCourse(${course.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editar
                    </button>
                    <button class="btn-danger" onclick="deleteCourse(${course.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                        </svg>
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    initCreateCourseForm() {
        const form = document.getElementById('createCourseForm');
        const fileUpload = document.getElementById('courseImage');
        const uploadArea = document.querySelector('.upload-area');

        if (fileUpload && uploadArea) {
            // Drag and drop para imágenes
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileUpload.files = files;
                    this.handleFileSelect(files[0]);
                }
            });

            fileUpload.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateCourse(form);
            });
        }
    }

    handleFileSelect(file) {
        const uploadArea = document.querySelector('.upload-area');
        if (!uploadArea) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadArea.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
                    <p>${file.name}</p>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            alert('Por favor selecciona un archivo de imagen válido.');
        }
    }

    async handleCreateCourse(form) {
        const formData = new FormData(form);
        const courseData = {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            level: formData.get('level'),
            duration: parseInt(formData.get('duration')),
            instructor_id: this.currentUser.id || this.currentUser.user_id
        };

        console.log('📝 Creando curso:', courseData);

        try {
            // Aquí iría la llamada a la API para crear el curso
            // Por ahora simulamos la creación
            await this.simulateApiCall();
            
            alert('✅ Curso creado exitosamente');
            form.reset();
            this.switchSection('courses');
        } catch (error) {
            console.error('Error creando curso:', error);
            alert('❌ Error al crear el curso. Inténtalo de nuevo.');
        }
    }

    simulateApiCall() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }

    initFormHandlers() {
        // Botón de notificaciones
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                alert('🔔 Sistema de notificaciones en desarrollo');
            });
        }
    }
}

// Funciones globales para los botones del HTML
function showCreateCourse() {
    const dashboard = window.instructorDashboard;
    if (dashboard) {
        dashboard.switchSection('create-course');
        
        // Actualizar navegación
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector('[data-section="create-course"]').classList.add('active');
    }
}

function cancelCreate() {
    const dashboard = window.instructorDashboard;
    if (dashboard) {
        dashboard.switchSection('courses');
        
        // Limpiar formulario
        const form = document.getElementById('createCourseForm');
        if (form) form.reset();
        
        // Restaurar área de upload
        const uploadArea = document.querySelector('.upload-area');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <p>Arrastra una imagen o haz clic para seleccionar</p>
            `;
        }
    }
}

function editCourse(courseId) {
    console.log('✏️ Editando curso:', courseId);
    alert(`📝 Editando curso ${courseId} - Funcionalidad en desarrollo`);
}

function deleteCourse(courseId) {
    if (confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
        console.log('🗑️ Eliminando curso:', courseId);
        alert(`✅ Curso ${courseId} eliminado exitosamente`);
        // Aquí iría la lógica para eliminar el curso
    }
}

async function logout() {
    try {
        localStorage.removeItem('userData');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userSession');
        window.location.href = '../login/new-auth.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

// Función global para cambiar tema
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.instructorDashboard = new InstructorDashboard();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error en el panel de maestros:', e.error);
});

console.log('📚 Panel de Maestros - Script cargado');
