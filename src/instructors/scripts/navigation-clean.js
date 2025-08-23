/**
 * Navegación del Panel de Instructores
 * Maneja la navegación entre secciones y la funcionalidad del sidebar
 */

class InstructorNavigation {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserData();
        this.updateStats();
    }

    bindEvents() {
        // Navegación del sidebar
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Botón de crear curso
        const addCourseBtn = document.getElementById('addCourseBtn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection('create-course');
            });
        }
    }

    navigateToSection(section) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });

        // Remover clase active de todos los links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Activar link correspondiente
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Actualizar título y descripción
        this.updatePageTitle(section);
        
        this.currentSection = section;
    }

    updatePageTitle(section) {
        const pageTitle = document.getElementById('pageTitle');
        const pageDescription = document.getElementById('pageDescription');

        const titles = {
            'dashboard': {
                title: 'Dashboard',
                description: 'Bienvenido al panel de maestros'
            },
            'courses': {
                title: 'Mis Cursos',
                description: 'Gestiona tus cursos y contenido'
            },
            'create-course': {
                title: 'Crear Curso',
                description: 'Crea un nuevo curso para tus estudiantes'
            }
        };

        if (titles[section]) {
            if (pageTitle) pageTitle.textContent = titles[section].title;
            if (pageDescription) pageDescription.textContent = titles[section].description;
        }
    }

    async loadUserData() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                this.displayUserInfo(user);
            }
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
        }
    }

    displayUserInfo(user) {
        // Actualizar información del usuario en el sidebar si existe
        const userInfoElements = document.querySelectorAll('.user-info h4, .user-info span');
        if (userInfoElements.length > 0) {
            const email = user.email || 'Usuario';
            const name = user.user_metadata?.full_name || email.split('@')[0];
            
            userInfoElements.forEach(element => {
                if (element.tagName === 'H4') {
                    element.textContent = name;
                } else if (element.tagName === 'SPAN') {
                    element.textContent = email;
                }
            });
        }
    }

    async updateStats() {
        try {
            // Aquí puedes cargar estadísticas reales desde Supabase
            // Por ahora usamos datos de ejemplo
            const stats = {
                totalCourses: 0,
                totalSeries: 0,
                publishedCourses: 0,
                draftCourses: 0
            };

            // Actualizar elementos de estadísticas
            document.getElementById('totalCourses').textContent = stats.totalCourses;
            document.getElementById('totalSeries').textContent = stats.totalSeries;
            document.getElementById('publishedCourses').textContent = stats.publishedCourses;
            document.getElementById('draftCourses').textContent = stats.draftCourses;

        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }

    async handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error al cerrar sesión:', error);
                return;
            }
            
            // Redirigir al login
            window.location.href = '../login/index.html';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
}

// Inicializar navegación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.instructorNavigation = new InstructorNavigation();
});
