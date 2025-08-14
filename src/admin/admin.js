// ===== ADMIN PANEL JAVASCRIPT =====

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.loadDashboardData();
        this.setupNotifications();
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                await this.navigateToSection(section);
            });
        });

        // Menú móvil
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.querySelector('.sidebar');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Búsqueda global
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Notificaciones
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationsPanel = document.getElementById('notificationsPanel');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                notificationsPanel.classList.toggle('active');
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Botones de acción
        this.setupActionButtons();
        
        // Filtros
        this.setupFilters();
        
        // Modales
        this.setupModals();
    }

    // ===== NAVEGACIÓN =====
    async navigateToSection(section) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });

        // Remover clase active de todos los enlaces
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(`${section}Content`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Activar enlace correspondiente
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Actualizar breadcrumb
        const currentSectionEl = document.getElementById('currentSection');
        if (currentSectionEl) {
            currentSectionEl.textContent = this.getSectionTitle(section);
        }

        this.currentSection = section;
        await this.loadSectionData(section);
    }

    getSectionTitle(section) {
        const titles = {
            dashboard: 'Dashboard',
            courses: 'Cursos',
            users: 'Usuarios',
            community: 'Comunidad',
            news: 'Noticias',
            analytics: 'Analíticas',
            settings: 'Configuraciones'
        };
        return titles[section] || 'Dashboard';
    }

    // ===== CARGA DE DATOS =====
    async loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'courses':
                this.loadCoursesData();
                break;
            case 'users':
                await this.loadUsersData();
                break;
            case 'community':
                this.loadCommunityData();
                break;
            case 'news':
                this.loadNewsData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    async loadDashboardData() {
        // Simular carga de datos del dashboard
        console.log('Cargando datos del dashboard...');
        
        // Actualizar estadísticas
        await this.updateDashboardStats();
        
        // Cargar gráficos (simulado)
        this.loadDashboardCharts();
    }

    async updateDashboardStats() {
        try {
            const response = await fetch('/api/admin/dashboard/stats');
            if (!response.ok) {
                throw new Error('Error obteniendo estadísticas');
            }
            
            const stats = await response.json();
            
            // Actualizar elementos del dashboard con datos reales
            const elements = {
                totalUsers: stats.totalUsers?.toLocaleString() || '0',
                totalCourses: stats.totalCourses?.toLocaleString() || '0',
                totalMessages: stats.totalMessages?.toLocaleString() || '0',
                totalNews: stats.totalNews?.toLocaleString() || '0'
            };

            Object.keys(elements).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.textContent = elements[key];
                }
            });

            // Actualizar gráficos si existen
            if (stats.userActivity) {
                this.updateActivityChart(stats.userActivity);
            }

            if (stats.roleDistribution) {
                this.updateRoleChart(stats.roleDistribution);
            }

        } catch (error) {
            console.error('Error actualizando estadísticas:', error);
            this.showToast('Error cargando estadísticas', 'error');
        }
    }

    loadDashboardCharts() {
        // Simular gráficos con Chart.js (si estuviera disponible)
        console.log('Cargando gráficos del dashboard...');
        
        // Placeholder para gráficos
        const chartElements = document.querySelectorAll('canvas');
        chartElements.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Aquí se implementarían los gráficos reales
                ctx.fillStyle = 'rgba(68, 229, 255, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#44E5FF';
                ctx.font = '14px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('Gráfico de datos', canvas.width / 2, canvas.height / 2);
            }
        });
    }

    updateActivityChart(activityData) {
        const canvas = document.getElementById('activityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar gráfico de actividad
        const maxValue = Math.max(...activityData.data);
        const barWidth = canvas.width / activityData.labels.length;
        const barHeight = canvas.height - 40;

        activityData.labels.forEach((label, index) => {
            const value = activityData.data[index];
            const height = maxValue > 0 ? (value / maxValue) * barHeight : 0;
            const x = index * barWidth + 10;
            const y = canvas.height - height - 30;

            // Barra
            ctx.fillStyle = '#44E5FF';
            ctx.fillRect(x, y, barWidth - 20, height);

            // Etiqueta
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + (barWidth - 20) / 2, canvas.height - 10);
            ctx.fillText(value, x + (barWidth - 20) / 2, y - 5);
        });
    }

    updateRoleChart(roleData) {
        const canvas = document.getElementById('roleChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar gráfico de roles
        const total = Object.values(roleData).reduce((sum, value) => sum + value, 0);
        const colors = ['#44E5FF', '#0077A6', '#FF6B6B', '#4ECDC4'];
        
        let currentAngle = 0;
        let colorIndex = 0;

        Object.entries(roleData).forEach(([role, count]) => {
            if (count === 0) return;

            const sliceAngle = (count / total) * 2 * Math.PI;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 20;

            // Dibujar sector
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[colorIndex % colors.length];
            ctx.fill();

            // Etiqueta
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${role}: ${count}`, labelX, labelY);

            currentAngle += sliceAngle;
            colorIndex++;
        });
    }

    loadCoursesData() {
        const coursesGrid = document.getElementById('coursesGrid');
        if (!coursesGrid) return;

        const courses = [
            {
                id: 1,
                title: 'Introducción a la Inteligencia Artificial',
                description: 'Curso básico sobre conceptos fundamentales de IA',
                category: 'Inteligencia Artificial',
                students: 1234,
                rating: 4.8,
                status: 'published'
            },
            {
                id: 2,
                title: 'Machine Learning Práctico',
                description: 'Aprende a implementar algoritmos de ML',
                category: 'Machine Learning',
                students: 987,
                rating: 4.6,
                status: 'published'
            },
            {
                id: 3,
                title: 'Deep Learning Avanzado',
                description: 'Técnicas avanzadas de deep learning',
                category: 'Deep Learning',
                students: 654,
                rating: 4.9,
                status: 'draft'
            }
        ];

        coursesGrid.innerHTML = courses.map(course => `
            <div class="course-card">
                <div class="course-header">
                    <h3>${course.title}</h3>
                    <span class="course-status ${course.status}">${course.status}</span>
                </div>
                <p class="course-description">${course.description}</p>
                <div class="course-meta">
                    <span class="course-category">${course.category}</span>
                    <span class="course-students">${course.students} estudiantes</span>
                    <span class="course-rating">⭐ ${course.rating}</span>
                </div>
                <div class="course-actions">
                    <button class="btn-secondary" onclick="adminPanel.editCourse(${course.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-secondary" onclick="adminPanel.deleteCourse(${course.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadUsersData() {
        try {
            const response = await fetch('/api/admin/users');
            if (!response.ok) {
                throw new Error('Error obteniendo usuarios');
            }
            
            const users = await response.json();
            const usersTableBody = document.getElementById('usersTableBody');
            if (!usersTableBody) return;

            usersTableBody.innerHTML = users.map(user => {
                const lastLogin = user.last_login_at ? 
                    new Date(user.last_login_at).toLocaleString('es-ES') : 
                    'Nunca';
                
                const status = user.last_login_at && 
                    new Date(user.last_login_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) ? 
                    'Activo' : 'Inactivo';

                return `
                    <tr>
                        <td>
                            <div class="user-info">
                                <strong>${user.full_name || 'Sin nombre'}</strong>
                            </div>
                        </td>
                        <td>${user.email}</td>
                        <td><span class="role-badge ${(user.cargo_rol || 'Usuario').toLowerCase()}">${user.cargo_rol || 'Usuario'}</span></td>
                        <td><span class="status-badge ${status.toLowerCase()}">${status}</span></td>
                        <td>${lastLogin}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon" onclick="adminPanel.editUser(${user.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" onclick="adminPanel.deleteUser(${user.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.showToast('Error cargando usuarios', 'error');
        }
    }

    loadCommunityData() {
        // Cargar datos de foros
        const forumsList = document.getElementById('forumsList');
        if (forumsList) {
            const forums = [
                { name: 'General', topics: 45, posts: 234 },
                { name: 'Machine Learning', topics: 23, posts: 156 },
                { name: 'Deep Learning', topics: 18, posts: 89 }
            ];

            forumsList.innerHTML = forums.map(forum => `
                <div class="forum-item">
                    <div class="forum-info">
                        <h4>${forum.name}</h4>
                        <p>${forum.topics} temas • ${forum.posts} mensajes</p>
                    </div>
                    <button class="btn-secondary">Gestionar</button>
                </div>
            `).join('');
        }

        // Cargar debates recientes
        const debatesList = document.getElementById('debatesList');
        if (debatesList) {
            const debates = [
                { title: '¿Cuál es el mejor framework para ML?', author: 'Ana', replies: 12 },
                { title: 'Tutorial: Implementando transformers', author: 'Luis', replies: 8 },
                { title: 'Discusión sobre ética en IA', author: 'Sofia', replies: 15 }
            ];

            debatesList.innerHTML = debates.map(debate => `
                <div class="debate-item">
                    <div class="debate-info">
                        <h4>${debate.title}</h4>
                        <p>por ${debate.author} • ${debate.replies} respuestas</p>
                    </div>
                    <button class="btn-secondary">Ver</button>
                </div>
            `).join('');
        }
    }

    loadNewsData() {
        const newsGrid = document.getElementById('newsGrid');
        if (!newsGrid) return;

        const news = [
            {
                id: 1,
                title: 'Nueva actualización del sistema',
                summary: 'Hemos implementado nuevas características para mejorar la experiencia de usuario',
                category: 'Anuncios',
                status: 'Publicado',
                date: '2024-01-15'
            },
            {
                id: 2,
                title: 'Nuevo curso: Deep Learning Avanzado',
                summary: 'Ya está disponible nuestro curso más avanzado sobre deep learning',
                category: 'Cursos',
                status: 'Borrador',
                date: '2024-01-14'
            }
        ];

        newsGrid.innerHTML = news.map(article => `
            <div class="news-card">
                <div class="news-header">
                    <h3>${article.title}</h3>
                    <span class="news-status ${article.status.toLowerCase()}">${article.status}</span>
                </div>
                <p class="news-summary">${article.summary}</p>
                <div class="news-meta">
                    <span class="news-category">${article.category}</span>
                    <span class="news-date">${article.date}</span>
                </div>
                <div class="news-actions">
                    <button class="btn-secondary" onclick="adminPanel.editNews(${article.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-secondary" onclick="adminPanel.deleteNews(${article.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadAnalyticsData() {
        console.log('Cargando datos de analíticas...');
        // Aquí se implementarían los gráficos reales de analíticas
    }

    loadSettingsData() {
        console.log('Cargando configuraciones...');
        // Las configuraciones ya están en el HTML
    }

    // ===== BOTONES DE ACCIÓN =====
    setupActionButtons() {
        // Botón agregar curso
        const addCourseBtn = document.getElementById('addCourseBtn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', () => {
                this.showAddCourseModal();
            });
        }

        // Botón agregar usuario
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showAddUserModal();
            });
        }

        // Botón agregar noticia
        const addNewsBtn = document.getElementById('addNewsBtn');
        if (addNewsBtn) {
            addNewsBtn.addEventListener('click', () => {
                this.showAddNewsModal();
            });
        }
    }

    // ===== FILTROS =====
    setupFilters() {
        // Filtros de cursos
        const courseSearch = document.getElementById('courseSearch');
        const courseCategory = document.getElementById('courseCategory');
        const courseStatus = document.getElementById('courseStatus');

        if (courseSearch) {
            courseSearch.addEventListener('input', () => this.filterCourses());
        }
        if (courseCategory) {
            courseCategory.addEventListener('change', () => this.filterCourses());
        }
        if (courseStatus) {
            courseStatus.addEventListener('change', () => this.filterCourses());
        }

        // Filtros de usuarios
        const userSearch = document.getElementById('userSearch');
        const userRole = document.getElementById('userRole');
        const userStatus = document.getElementById('userStatus');

        if (userSearch) {
            userSearch.addEventListener('input', () => this.filterUsers());
        }
        if (userRole) {
            userRole.addEventListener('change', () => this.filterUsers());
        }
        if (userStatus) {
            userStatus.addEventListener('change', () => this.filterUsers());
        }
    }

    filterCourses() {
        console.log('Filtrando cursos...');
        // Implementar lógica de filtrado
    }

    filterUsers() {
        console.log('Filtrando usuarios...');
        // Implementar lógica de filtrado
    }

    // ===== BÚSQUEDA GLOBAL =====
    handleGlobalSearch(query) {
        if (query.length < 2) return;
        
        console.log('Búsqueda global:', query);
        // Implementar búsqueda global
    }

    // ===== MODALES =====
    setupModals() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');

        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }
    }

    showModal(title, content) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = content;
        if (modalOverlay) modalOverlay.classList.add('active');
    }

    closeModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.classList.remove('active');
    }

    // ===== MODALES ESPECÍFICOS =====
    showAddCourseModal() {
        const content = `
            <form class="modal-form" id="addCourseForm">
                <div class="form-group">
                    <label>Título del Curso</label>
                    <input type="text" name="title" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea name="description" class="form-textarea" required></textarea>
                </div>
                <div class="form-group">
                    <label>Categoría</label>
                    <select name="category" class="form-select" required>
                        <option value="">Seleccionar categoría</option>
                        <option value="ai">Inteligencia Artificial</option>
                        <option value="ml">Machine Learning</option>
                        <option value="dl">Deep Learning</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select name="status" class="form-select" required>
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="adminPanel.closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Crear Curso</button>
                </div>
            </form>
        `;

        this.showModal('Nuevo Curso', content);
        this.setupFormSubmission('addCourseForm', this.handleAddCourse.bind(this));
    }

    showAddUserModal() {
        const content = `
            <form class="modal-form" id="addUserForm">
                <div class="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" name="fullName" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Rol</label>
                    <select name="role" class="form-select" required>
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                        <option value="moderator">Moderador</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="adminPanel.closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Crear Usuario</button>
                </div>
            </form>
        `;

        this.showModal('Nuevo Usuario', content);
        this.setupFormSubmission('addUserForm', this.handleAddUser.bind(this));
    }

    showAddNewsModal() {
        const content = `
            <form class="modal-form" id="addNewsForm">
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" name="title" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Resumen</label>
                    <textarea name="summary" class="form-textarea" required></textarea>
                </div>
                <div class="form-group">
                    <label>Categoría</label>
                    <select name="category" class="form-select" required>
                        <option value="">Seleccionar categoría</option>
                        <option value="announcements">Anuncios</option>
                        <option value="courses">Cursos</option>
                        <option value="updates">Actualizaciones</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="adminPanel.closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Crear Noticia</button>
                </div>
            </form>
        `;

        this.showModal('Nueva Noticia', content);
        this.setupFormSubmission('addNewsForm', this.handleAddNews.bind(this));
    }

    setupFormSubmission(formId, handler) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                handler(data);
            });
        }
    }

    // ===== MANEJADORES DE FORMULARIOS =====
    handleAddCourse(data) {
        console.log('Agregando curso:', data);
        this.showToast('Curso creado exitosamente', 'success');
        this.closeModal();
        this.loadCoursesData();
    }

    handleAddUser(data) {
        console.log('Agregando usuario:', data);
        this.showToast('Usuario creado exitosamente', 'success');
        this.closeModal();
        this.loadUsersData();
    }

    handleAddNews(data) {
        console.log('Agregando noticia:', data);
        this.showToast('Noticia creada exitosamente', 'success');
        this.closeModal();
        this.loadNewsData();
    }

    // ===== ACCIONES CRUD =====
    editCourse(id) {
        console.log('Editando curso:', id);
        this.showToast('Funcionalidad de edición en desarrollo', 'info');
    }

    deleteCourse(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
            console.log('Eliminando curso:', id);
            this.showToast('Curso eliminado exitosamente', 'success');
            this.loadCoursesData();
        }
    }

    editUser(id) {
        console.log('Editando usuario:', id);
        this.showToast('Funcionalidad de edición en desarrollo', 'info');
    }

    deleteUser(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            console.log('Eliminando usuario:', id);
            this.showToast('Usuario eliminado exitosamente', 'success');
            this.loadUsersData();
        }
    }

    editNews(id) {
        console.log('Editando noticia:', id);
        this.showToast('Funcionalidad de edición en desarrollo', 'info');
    }

    deleteNews(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
            console.log('Eliminando noticia:', id);
            this.showToast('Noticia eliminada exitosamente', 'success');
            this.loadNewsData();
        }
    }

    // ===== NOTIFICACIONES =====
    setupNotifications() {
        const notifications = [
            {
                title: 'Nuevo usuario registrado',
                message: 'María González se ha unido a la plataforma',
                time: 'Hace 5 minutos',
                type: 'info'
            },
            {
                title: 'Curso completado',
                message: 'Juan Pérez completó "Introducción a la IA"',
                time: 'Hace 15 minutos',
                type: 'success'
            },
            {
                title: 'Sistema actualizado',
                message: 'Nueva versión disponible',
                time: 'Hace 1 hora',
                type: 'warning'
            }
        ];

        const notificationsList = document.getElementById('notificationsList');
        if (notificationsList) {
            notificationsList.innerHTML = notifications.map(notification => `
                <div class="notification-item ${notification.type}">
                <div class="notification-content">
                        <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                        <span class="notification-time">${notification.time}</span>
                </div>
            </div>
        `).join('');
    }

        // Marcar como leídas
        const markAllRead = document.getElementById('markAllRead');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllNotificationsAsRead();
            });
        }
    }

    markAllNotificationsAsRead() {
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            notificationBadge.style.display = 'none';
        }
        this.showToast('Todas las notificaciones marcadas como leídas', 'success');
    }

    // ===== TOAST NOTIFICATIONS =====
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Agregar estilos CSS para toast
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(68, 229, 255, 0.1);
                    border: 1px solid rgba(68, 229, 255, 0.2);
                    border-radius: 8px;
                    padding: 1rem;
                    color: white;
                    z-index: 3000;
                    animation: slideIn 0.3s ease;
                }
                .toast-success {
                    background: rgba(0, 212, 170, 0.1);
                    border-color: rgba(0, 212, 170, 0.3);
                }
                .toast-error {
                    background: rgba(255, 71, 87, 0.1);
                    border-color: rgba(255, 71, 87, 0.3);
                }
                .toast-warning {
                    background: rgba(255, 184, 0, 0.1);
                    border-color: rgba(255, 184, 0, 0.3);
                }
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .toast-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 0.25rem;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // ===== LOGOUT =====
    async logout() {
        try {
            console.log('Cerrando sesión...');
            
            // Llamar al endpoint de logout
            const response = await fetch('/api/admin/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                // Redirigir directamente sin confirmación
                window.location.href = '/';
            } else {
                // Si hay error, redirigir de todas formas
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error en logout:', error);
            // Redirigir de todas formas
            window.location.href = '/';
        }
    }

    // ===== CARGA INICIAL =====
    async loadInitialData() {
        console.log('Cargando datos iniciales...');
        
        // Cargar información del administrador
        await this.loadAdminInfo();
    }

    // ===== CARGA DE INFORMACIÓN DEL ADMINISTRADOR =====
    async loadAdminInfo() {
        try {
            const response = await fetch('/api/admin/auth/check');
            if (!response.ok) {
                throw new Error('Error obteniendo información del administrador');
            }
            
            const admin = await response.json();
            
            // Actualizar información en el sidebar
            const userNameElement = document.querySelector('.user-name');
            const userRoleElement = document.querySelector('.user-role');
            
            if (userNameElement) {
                userNameElement.textContent = admin.fullName || 'Administrador';
            }
            
            if (userRoleElement) {
                userRoleElement.textContent = admin.role || 'Administrador';
            }
            
        } catch (error) {
            console.error('Error cargando información del administrador:', error);
            // Mantener valores por defecto si hay error
        }
    }
}

// ===== INICIALIZACIÓN =====
let adminPanel;

document.addEventListener('DOMContentLoaded', async () => {
    adminPanel = new AdminPanel();
    await adminPanel.init();
});

// ===== ESTILOS ADICIONALES PARA COMPONENTES =====
const additionalStyles = `
    .course-card, .news-card {
        background: rgba(68, 229, 255, 0.05);
        border: 1px solid rgba(68, 229, 255, 0.1);
        border-radius: 16px;
        padding: 1.5rem;
        transition: 0.3s ease;
    }
    
    .course-card:hover, .news-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(68, 229, 255, 0.2);
        border-color: rgba(68, 229, 255, 0.3);
    }
    
    .course-header, .news-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .course-header h3, .news-header h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: white;
    }
    
    .course-status, .news-status {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .course-status.published, .news-status.publicado {
        background: rgba(0, 212, 170, 0.2);
        color: #00D4AA;
    }
    
    .course-status.draft, .news-status.borrador {
        background: rgba(255, 184, 0, 0.2);
        color: #FFB800;
    }
    
    .course-description, .news-summary {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    
    .course-meta, .news-meta {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
    }
    
    .course-actions, .news-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .role-badge, .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .role-badge.administrador {
        background: rgba(68, 229, 255, 0.2);
        color: #44E5FF;
    }
    
    .role-badge.usuario {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
    }
    
    .status-badge.activo {
        background: rgba(0, 212, 170, 0.2);
        color: #00D4AA;
    }
    
    .status-badge.inactivo {
        background: rgba(255, 71, 87, 0.2);
        color: #FF4757;
    }
    
    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }
    
    .btn-icon {
        background: rgba(68, 229, 255, 0.1);
        border: 1px solid rgba(68, 229, 255, 0.2);
        border-radius: 8px;
        padding: 0.5rem;
        color: #44E5FF;
        cursor: pointer;
        transition: 0.2s ease;
    }
    
    .btn-icon:hover {
        background: rgba(68, 229, 255, 0.2);
        transform: translateY(-1px);
    }
    
    .forum-item, .debate-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: rgba(68, 229, 255, 0.03);
        border-radius: 8px;
        margin-bottom: 0.5rem;
        transition: 0.2s ease;
    }
    
    .forum-item:hover, .debate-item:hover {
        background: rgba(68, 229, 255, 0.08);
    }
    
    .forum-info h4, .debate-info h4 {
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: white;
    }
    
    .forum-info p, .debate-info p {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
    }
    
    .modal-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1rem;
    }
    
    .notification-item {
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        border-left: 4px solid #44E5FF;
    }
    
    .notification-item.success {
        background: rgba(0, 212, 170, 0.1);
        border-left-color: #00D4AA;
    }
    
    .notification-item.warning {
        background: rgba(255, 184, 0, 0.1);
        border-left-color: #FFB800;
    }
    
    .notification-item.info {
        background: rgba(68, 229, 255, 0.1);
        border-left-color: #44E5FF;
    }
    
    .notification-content h4 {
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: white;
    }
    
    .notification-content p {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 0.25rem;
    }
    
    .notification-time {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.5);
    }
`;

// Agregar estilos adicionales al documento
if (!document.getElementById('admin-additional-styles')) {
    const style = document.createElement('style');
    style.id = 'admin-additional-styles';
    style.textContent = additionalStyles;
    document.head.appendChild(style);
}
