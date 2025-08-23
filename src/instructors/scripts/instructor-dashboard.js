// PANEL DE MAESTROS - FUNCIONALIDAD COMPLETA
class InstructorDashboard {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.charts = {};
        this.init();
    }

    async init() {
        try {
            await this.initializeSupabase();
            await this.checkAuth();
            this.setupEventListeners();
            this.initializeCharts();
            await this.loadDashboardData();
            this.setupTheme();
        } catch (error) {
            console.error('Error inicializando el dashboard:', error);
            this.showError('Error al cargar el panel');
        }
    }

    async initializeSupabase() {
        const supabaseUrl = document.querySelector('meta[name="supabase-url"]').content;
        const supabaseKey = document.querySelector('meta[name="supabase-key"]').content;
        
        this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    }

    async checkAuth() {
        // Verificar autenticación usando el sistema local
        const userDataStr = localStorage.getItem('userData') || localStorage.getItem('currentUser');
        const userToken = localStorage.getItem('userToken') || localStorage.getItem('authToken');
        
        if (!userDataStr || !userToken) {
            console.log('No hay datos de autenticación, redirigiendo al login');
            window.location.href = '../login/new-auth.html';
            return;
        }

        try {
            const userData = JSON.parse(userDataStr);
            
            // Verificar que el usuario sea instructor
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
        
        if (this.currentUser) {
            const displayName = this.currentUser.display_name || 
                              this.currentUser.first_name + ' ' + this.currentUser.last_name ||
                              this.currentUser.username || 
                              this.currentUser.email?.split('@')[0] || 
                              'Maestro';
            
            userNameElement.textContent = displayName;
            
            if (this.currentUser.profile_picture_url) {
                userAvatarElement.src = this.currentUser.profile_picture_url;
            }
        }
    }

    setupEventListeners() {
        // Navegación del sidebar
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Toggle del sidebar
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });

        // Formulario de crear curso
        const createCourseForm = document.getElementById('createCourseForm');
        createCourseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCourse();
        });

        // File upload
        const fileInput = document.getElementById('courseImage');
        const uploadArea = document.querySelector('.upload-area');
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-primary)';
            uploadArea.style.background = 'rgba(68, 229, 255, 0.05)';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.handleFileUpload(files[0]);
            }
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
        });

        // Notificaciones
        const notificationBtn = document.getElementById('notificationBtn');
        notificationBtn.addEventListener('click', () => {
            this.showNotifications();
        });
    }

    setupTheme() {
        // Verificar tema guardado
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    navigateToSection(section) {
        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(section);
        targetSection.classList.add('active');

        // Actualizar título de la página
        const pageTitle = document.getElementById('pageTitle');
        const titles = {
            'dashboard': 'Dashboard',
            'courses': 'Mis Cursos',
            'create-course': 'Crear Curso'
        };
        pageTitle.textContent = titles[section] || 'Dashboard';

        // Cargar datos específicos de la sección
        this.loadSectionData(section);
    }

    async loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'courses':
                await this.loadCourses();
                break;
            case 'create-course':
                this.resetCreateCourseForm();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // Cargar estadísticas
            await this.loadStats();
            
            // Cargar gráficos
            this.updateCharts();
            
            // Cargar cursos recientes
            await this.loadRecentCourses();
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
        }
    }

    async loadStats() {
        try {
            // Simular datos de estadísticas (en producción, estos vendrían de la base de datos)
            const stats = {
                totalCourses: 12,
                totalStudents: 156,
                totalLessons: 89,
                completionRate: 78
            };

            // Animar contadores
            this.animateCounter('totalCourses', stats.totalCourses);
            this.animateCounter('totalStudents', stats.totalStudents);
            this.animateCounter('totalLessons', stats.totalLessons);
            this.animateCounter('completionRate', stats.completionRate, '%');

        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }

    animateCounter(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Función de easing
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    }

    initializeCharts() {
        // Gráfico de actividad reciente
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx) {
            this.charts.activity = new Chart(activityCtx, {
                type: 'line',
                data: {
                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Estudiantes Activos',
                        data: [65, 78, 90, 85, 95, 88, 92],
                        borderColor: '#44E5FF',
                        backgroundColor: 'rgba(68, 229, 255, 0.1)',
                        tension: 0.4,
                        fill: true
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
        if (coursesCtx) {
            this.charts.courses = new Chart(coursesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Programación', 'Diseño', 'Marketing', 'Negocios', 'Tecnología'],
                    datasets: [{
                        data: [30, 25, 20, 15, 10],
                        backgroundColor: [
                            '#44E5FF',
                            '#0077A6',
                            '#FF6B6B',
                            '#4ECDC4',
                            '#45B7D1'
                        ],
                        borderWidth: 0
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
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }
    }

    updateCharts() {
        // Actualizar datos de los gráficos si es necesario
        if (this.charts.activity) {
            // Simular actualización de datos
            const newData = Array.from({length: 7}, () => Math.floor(Math.random() * 50) + 50);
            this.charts.activity.data.datasets[0].data = newData;
            this.charts.activity.update();
        }
    }

    async loadRecentCourses() {
        try {
            // Simular datos de cursos recientes
            const recentCourses = [
                {
                    id: 1,
                    title: 'JavaScript Avanzado',
                    students: 45,
                    progress: 85,
                    image: '../assets/images/course-js.jpg'
                },
                {
                    id: 2,
                    title: 'React Fundamentals',
                    students: 32,
                    progress: 92,
                    image: '../assets/images/course-react.jpg'
                },
                {
                    id: 3,
                    title: 'Node.js Backend',
                    students: 28,
                    progress: 78,
                    image: '../assets/images/course-node.jpg'
                }
            ];

            const coursesList = document.getElementById('recentCoursesList');
            coursesList.innerHTML = '';

            recentCourses.forEach(course => {
                const courseElement = this.createCourseCard(course);
                coursesList.appendChild(courseElement);
            });

        } catch (error) {
            console.error('Error cargando cursos recientes:', error);
        }
    }

    createCourseCard(course) {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
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
        `;
        return card;
    }

    async loadCourses() {
        try {
            const coursesGrid = document.getElementById('coursesGrid');
            coursesGrid.innerHTML = '<div class="loading">Cargando cursos...</div>';

            // Simular carga de cursos
            const courses = [
                {
                    id: 1,
                    title: 'JavaScript Avanzado',
                    description: 'Aprende JavaScript moderno y técnicas avanzadas',
                    category: 'Programación',
                    level: 'Avanzado',
                    students: 45,
                    rating: 4.8,
                    image: '../assets/images/course-js.jpg'
                },
                {
                    id: 2,
                    title: 'React Fundamentals',
                    description: 'Construye aplicaciones web modernas con React',
                    category: 'Programación',
                    level: 'Intermedio',
                    students: 32,
                    rating: 4.9,
                    image: '../assets/images/course-react.jpg'
                },
                {
                    id: 3,
                    title: 'Node.js Backend',
                    description: 'Desarrollo de APIs y servidores con Node.js',
                    category: 'Programación',
                    level: 'Intermedio',
                    students: 28,
                    rating: 4.7,
                    image: '../assets/images/course-node.jpg'
                }
            ];

            coursesGrid.innerHTML = '';
            courses.forEach(course => {
                const courseElement = this.createCourseGridCard(course);
                coursesGrid.appendChild(courseElement);
            });

        } catch (error) {
            console.error('Error cargando cursos:', error);
            document.getElementById('coursesGrid').innerHTML = '<div class="error">Error al cargar los cursos</div>';
        }
    }

    createCourseGridCard(course) {
        const card = document.createElement('div');
        card.className = 'course-grid-card';
        card.innerHTML = `
            <div class="course-header">
                <img src="${course.image}" alt="${course.title}" onerror="this.src='../assets/images/default-course.jpg'">
                <div class="course-overlay">
                    <button class="btn-edit" onclick="editCourse(${course.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-delete" onclick="deleteCourse(${course.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                        </svg>
                    </button>
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
                    <span>★ ${course.rating}</span>
                </div>
            </div>
        `;
        return card;
    }

    async createCourse() {
        try {
            const form = document.getElementById('createCourseForm');
            const formData = new FormData(form);
            
            // Validar formulario
            if (!this.validateCourseForm(formData)) {
                return;
            }

            // Mostrar loading
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creando...';
            submitBtn.disabled = true;

            // Simular creación de curso (en producción, esto se guardaría en la base de datos)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mostrar éxito
            this.showSuccess('Curso creado exitosamente');
            
            // Resetear formulario
            this.resetCreateCourseForm();
            
            // Navegar a la sección de cursos
            this.navigateToSection('courses');

        } catch (error) {
            console.error('Error creando curso:', error);
            this.showError('Error al crear el curso');
        } finally {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateCourseForm(formData) {
        const requiredFields = ['title', 'category', 'description', 'level', 'duration'];
        
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                this.showError(`El campo ${field} es requerido`);
                return false;
            }
        }

        return true;
    }

    resetCreateCourseForm() {
        const form = document.getElementById('createCourseForm');
        form.reset();
        
        // Resetear área de upload
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <p>Arrastra una imagen o haz clic para seleccionar</p>
        `;
    }

    handleFileUpload(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showError('Por favor selecciona una imagen válida');
            return;
        }

        const uploadArea = document.querySelector('.upload-area');
        const reader = new FileReader();

        reader.onload = (e) => {
            uploadArea.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 100px; max-height: 100px; border-radius: 8px;">
                <p>${file.name}</p>
            `;
        };

        reader.readAsDataURL(file);
    }

    showCreateCourse() {
        this.navigateToSection('create-course');
    }

    cancelCreate() {
        this.navigateToSection('courses');
    }

    showNotifications() {
        // Simular notificaciones
        const notifications = [
            'Nuevo estudiante inscrito en JavaScript Avanzado',
            'Curso React Fundamentals completado por 5 estudiantes',
            'Nueva pregunta en el foro de Node.js Backend'
        ];

        // Crear modal de notificaciones
        const modal = document.createElement('div');
        modal.className = 'notification-modal';
        modal.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <h3>Notificaciones</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="notification-list">
                    ${notifications.map(notification => `
                        <div class="notification-item">
                            <span>${notification}</span>
                            <small>Hace 2 horas</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    async logout() {
        try {
            // Limpiar datos de autenticación local
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
}

// Funciones globales
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function logout() {
    if (window.dashboard) {
        window.dashboard.logout();
    }
}

function showCreateCourse() {
    if (window.dashboard) {
        window.dashboard.showCreateCourse();
    }
}

function cancelCreate() {
    if (window.dashboard) {
        window.dashboard.cancelCreate();
    }
}

function editCourse(courseId) {
    // Implementar edición de curso
    console.log('Editando curso:', courseId);
}

function deleteCourse(courseId) {
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
        // Implementar eliminación de curso
        console.log('Eliminando curso:', courseId);
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new InstructorDashboard();
});

// Agregar estilos para notificaciones
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--glass);
    backdrop-filter: blur(20px);
    border: var(--border-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    color: var(--text-on-dark);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    animation: slideInRight 0.3s ease;
    max-width: 300px;
}

.notification-success {
    border-left: 4px solid #28a745;
}

.notification-error {
    border-left: 4px solid #dc3545;
}

.notification button {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    margin-left: auto;
}

.notification-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.notification-content {
    background: var(--glass);
    backdrop-filter: blur(20px);
    border: var(--border-light);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
}

.notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border-bottom: var(--border-light);
}

.notification-header h3 {
    margin: 0;
    color: var(--text-on-dark);
}

.close-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 24px;
    padding: 0;
}

.notification-list {
    padding: var(--spacing-lg);
}

.notification-item {
    padding: var(--spacing-md);
    border-bottom: var(--border-light);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.notification-item:last-child {
    border-bottom: none;
}

.notification-item span {
    color: var(--text-on-dark);
}

.notification-item small {
    color: var(--text-muted);
    font-size: 12px;
}

.course-card {
    background: var(--glass-strong);
    border: var(--border-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    display: flex;
    gap: var(--spacing-md);
    transition: all var(--transition-speed) ease;
}

.course-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.course-image {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;
}

.course-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.course-info {
    flex: 1;
}

.course-info h4 {
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--text-on-dark);
    font-size: var(--font-size-base);
}

.course-info p {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
}

.progress-bar {
    width: 100%;
    height: 4px;
    background: var(--glass);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: var(--spacing-xs);
}

.progress-fill {
    height: 100%;
    background: var(--color-primary);
    transition: width 0.3s ease;
}

.progress-text {
    color: var(--text-muted);
    font-size: 12px;
}

.course-grid-card {
    background: var(--glass);
    backdrop-filter: blur(20px);
    border: var(--border-light);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all var(--transition-speed) ease;
    position: relative;
}

.course-grid-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.course-header {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.course-header img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.course-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    opacity: 0;
    transition: opacity var(--transition-speed) ease;
}

.course-grid-card:hover .course-overlay {
    opacity: 1;
}

.btn-edit,
.btn-delete {
    background: var(--glass);
    border: none;
    color: var(--text-on-dark);
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-speed) ease;
}

.btn-edit:hover {
    background: var(--color-primary);
    color: var(--color-bg-dark);
}

.btn-delete:hover {
    background: #dc3545;
    color: white;
}

.course-content {
    padding: var(--spacing-lg);
}

.course-content h3 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-on-dark);
    font-size: var(--font-size-lg);
}

.course-content p {
    margin: 0 0 var(--spacing-md) 0;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    line-height: 1.5;
}

.course-meta {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.category,
.level {
    background: var(--color-primary);
    color: var(--color-bg-dark);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: var(--body-weight-medium);
}

.level {
    background: var(--color-accent);
}

.course-stats {
    display: flex;
    justify-content: space-between;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.loading {
    text-align: center;
    padding: var(--spacing-lg);
    color: var(--text-muted);
}

.error {
    text-align: center;
    padding: var(--spacing-lg);
    color: #dc3545;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);
