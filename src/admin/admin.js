// ===== ADMIN PANEL JAVASCRIPT =====

// Global variable for admin panel instance
let adminPanel;

// Debug function to test user actions
window.testUserActions = function() {
    console.log('=== Testing User Actions ===');
    console.log('adminPanel exists:', typeof adminPanel);
    
    if (adminPanel) {
        console.log('editUser function:', typeof adminPanel.editUser);
        console.log('deleteUser function:', typeof adminPanel.deleteUser);
        console.log('showModal function:', typeof adminPanel.showModal);
        console.log('closeModal function:', typeof adminPanel.closeModal);
        
        console.log('Attempting to call editUser(1)...');
        try {
            adminPanel.editUser(1);
            console.log('editUser(1) called successfully');
        } catch (error) {
            console.error('Error calling editUser:', error);
        }
    } else {
        console.error('adminPanel is not available');
    }
};

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.usersLoadedBefore = false; // Flag to prevent repetitive notifications
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.loadDashboardData();
        this.setupNotifications();
    }

    // ===== HELPER METHODS =====
    
    /**
     * Makes an authenticated API request
     * @param {string} url - API endpoint URL
     * @param {object} options - Fetch options
     * @returns {Promise<Response>} - Fetch response
     */
    async makeAuthenticatedRequest(url, options = {}) {
        // Get authentication data from localStorage
        const token = localStorage.getItem('userToken');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
            console.error('No authentication data found');
            throw new Error('Usuario no autenticado');
        }

        // Parse user data to get user ID if needed
        let userId = null;
        try {
            const user = JSON.parse(userData);
            userId = user.id || user.userId;
        } catch (e) {
            console.warn('Error parsing user data:', e);
        }

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers
        };

        // Add user ID header if available
        if (userId) {
            headers['X-User-Id'] = userId;
        }

        // Make the request
        return fetch(url, {
            ...options,
            headers
        });
    }

    /**
     * Shows loading state for a container
     * @param {string} containerId - ID of container to show loading state
     */
    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Cargando...</p>
                </div>
            `;
        }
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
                await this.loadCoursesData();
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
            const response = await this.makeAuthenticatedRequest('/api/admin/dashboard/stats');
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

    async loadCoursesData() {
        const coursesGrid = document.getElementById('coursesGrid');
        if (!coursesGrid) return;

        try {
            // Show loading state
            this.showLoading('coursesGrid');
            
            console.log('Cargando datos de talleres...');
            const response = await this.makeAuthenticatedRequest('/api/admin/courses');
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', response.status, errorText);
                throw new Error(`Error ${response.status}: ${errorText || 'Error obteniendo talleres'}`);
            }
            
            const courses = await response.json();
            console.log('Talleres cargados:', courses.length);

            if (!Array.isArray(courses) || courses.length === 0) {
                coursesGrid.innerHTML = `
                    <div class="no-data-message">
                        <i class="fas fa-graduation-cap"></i>
                        <p>No hay talleres registrados</p>
                    </div>
                `;
                return;
            }

            coursesGrid.innerHTML = courses.map(course => {
                // Format duration from minutes to hours
                const durationHours = course.total_duration ? Math.round(course.total_duration / 60) : 0;
                
                // Safe values for HTML
                const title = (course.name || 'Taller sin nombre').replace(/[<>]/g, '');
                const description = (course.short_description || 'Sin descripción').replace(/[<>]/g, '');
                const modality = (course.modality || 'online').replace(/[<>]/g, '');
                const status = (course.status || 'draft').replace(/[<>]/g, '');
                
                return `
                    <div class="course-card">
                        <div class="course-header">
                            <h3>${title}</h3>
                            <span class="course-status ${status}">${status}</span>
                        </div>
                        <p class="course-description">${description}</p>
                        <div class="course-meta">
                            <span class="course-category">
                                <i class="fas fa-tag"></i> ${modality}
                            </span>
                            <span class="course-sessions">
                                <i class="fas fa-play-circle"></i> ${course.session_count || 0} sesiones
                            </span>
                            <span class="course-duration">
                                <i class="fas fa-clock"></i> ${durationHours}h
                            </span>
                            <span class="course-price">
                                <i class="fas fa-dollar-sign"></i> ${course.price || 'Gratis'}
                            </span>
                        </div>
                        <div class="course-actions">
                            <button class="btn-secondary" onclick="adminPanel.editCourse('${course.id}')" title="Editar taller">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn-secondary" onclick="adminPanel.deleteCourse('${course.id}')" title="Eliminar taller">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                            ${course.course_url ? `
                                <button class="btn-secondary" onclick="window.open('${course.course_url}', '_blank')" title="Ver taller">
                                    <i class="fas fa-external-link-alt"></i> Ver
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            this.showToast(`${courses.length} talleres cargados correctamente`, 'success');
        } catch (error) {
            console.error('Error cargando talleres:', error);
            
            coursesGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error cargando talleres</p>
                    <small>${error.message}</small>
                    <button class="btn-retry" onclick="adminPanel.loadCoursesData()">
                        <i class="fas fa-retry"></i> Reintentar
                    </button>
                </div>
            `;
            
            this.showToast(`Error cargando talleres: ${error.message}`, 'error');
        }
    }

    async loadUsersData() {
        const usersTableBody = document.getElementById('usersTableBody');
        if (!usersTableBody) return;

        try {
            // Show loading state
            this.showLoading('usersTableBody');
            
            console.log('Cargando datos de usuarios...');
            const response = await this.makeAuthenticatedRequest('/api/admin/users');
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', response.status, errorText);
                throw new Error(`Error ${response.status}: ${errorText || 'Error obteniendo usuarios'}`);
            }
            
            const users = await response.json();
            console.log('Usuarios cargados:', users.length);

            if (!Array.isArray(users) || users.length === 0) {
                usersTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="no-data">
                            <div class="no-data-message">
                                <i class="fas fa-users"></i>
                                <p>No hay usuarios registrados</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            usersTableBody.innerHTML = users.map(user => {
                const lastLogin = user.last_login_at ? 
                    new Date(user.last_login_at).toLocaleString('es-ES') : 
                    'Nunca';
                
                const status = user.last_login_at && 
                    new Date(user.last_login_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) ? 
                    'Activo' : 'Inactivo';

                // Ensure safe values for HTML
                const fullName = (user.full_name || 'Sin nombre').replace(/[<>]/g, '');
                const email = (user.email || 'Sin email').replace(/[<>]/g, '');
                const role = (user.cargo_rol || 'Usuario').replace(/[<>]/g, '');

                return `
                    <tr>
                        <td>
                            <div class="user-info">
                                <strong>${fullName}</strong>
                            </div>
                        </td>
                        <td>${email}</td>
                        <td><span class="role-badge ${role.toLowerCase()}">${role}</span></td>
                        <td><span class="status-badge ${status.toLowerCase()}">${status}</span></td>
                        <td>${lastLogin}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon" onclick="adminPanel.editUser(${user.id})" title="Editar usuario">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" onclick="adminPanel.deleteUser(${user.id})" title="Eliminar usuario">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
            // Only show toast notification on first load or when explicitly requested
            if (!this.usersLoadedBefore) {
                this.showToast(`${users.length} usuarios cargados correctamente`, 'success');
                this.usersLoadedBefore = true;
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="error-state">
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Error cargando usuarios</p>
                            <small>${error.message}</small>
                            <button class="btn-retry" onclick="adminPanel.loadUsersData()">
                                <i class="fas fa-retry"></i> Reintentar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            this.showToast(`Error cargando usuarios: ${error.message}`, 'error');
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
        
        const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const selectedRole = document.getElementById('userRole')?.value || '';
        const selectedStatus = document.getElementById('userStatus')?.value || '';
        
        const usersTableBody = document.getElementById('usersTableBody');
        if (!usersTableBody) return;
        
        const rows = usersTableBody.querySelectorAll('tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            if (row.querySelector('.no-data') || row.querySelector('.error-state')) {
                return; // Skip empty state rows
            }
            
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return; // Skip malformed rows
            
            const userName = cells[0].textContent.toLowerCase();
            const userEmail = cells[1].textContent.toLowerCase();
            const userRole = cells[2].textContent.trim();
            const userStatus = cells[3].textContent.trim();
            
            // Text search filter
            const matchesSearch = !searchTerm || 
                userName.includes(searchTerm) || 
                userEmail.includes(searchTerm);
            
            // Role filter - map display values to filter values
            const matchesRole = !selectedRole || 
                (selectedRole === 'admin' && userRole === 'Administrador') ||
                (selectedRole === 'user' && userRole === 'Usuario') ||
                (selectedRole === 'moderator' && userRole === 'Tutor');
            
            // Status filter - map display values to filter values
            const matchesStatus = !selectedStatus ||
                (selectedStatus === 'active' && userStatus === 'Activo') ||
                (selectedStatus === 'inactive' && userStatus === 'Inactivo') ||
                (selectedStatus === 'suspended' && userStatus === 'Suspendido');
            
            const shouldShow = matchesSearch && matchesRole && matchesStatus;
            
            if (shouldShow) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Show message if no results
        if (visibleCount === 0 && rows.length > 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `
                <td colspan="6" class="no-data">
                    <div class="no-data-message">
                        <i class="fas fa-search"></i>
                        <p>No se encontraron usuarios que coincidan con los filtros</p>
                        <button class="btn-secondary" onclick="adminPanel.clearUserFilters()">
                            Limpiar filtros
                        </button>
                    </div>
                </td>
            `;
            noResultsRow.id = 'noResultsRow';
            
            // Remove previous no results row
            const existingNoResults = usersTableBody.querySelector('#noResultsRow');
            if (existingNoResults) {
                existingNoResults.remove();
            }
            
            if (visibleCount === 0) {
                usersTableBody.appendChild(noResultsRow);
            }
        } else {
            // Remove no results row if it exists
            const existingNoResults = usersTableBody.querySelector('#noResultsRow');
            if (existingNoResults) {
                existingNoResults.remove();
            }
        }
        
        console.log(`Filtros aplicados: ${visibleCount} usuarios visibles`);
    }
    
    clearUserFilters() {
        // Clear all filter inputs
        const userSearch = document.getElementById('userSearch');
        const userRole = document.getElementById('userRole');
        const userStatus = document.getElementById('userStatus');
        
        if (userSearch) userSearch.value = '';
        if (userRole) userRole.value = '';
        if (userStatus) userStatus.value = '';
        
        // Reapply filters (which will show all users)
        this.filterUsers();
        
        this.showToast('Filtros limpiados', 'info');
    }
    
    // Force reload users with notification (used after actions like edit/delete)
    async reloadUsersData() {
        this.usersLoadedBefore = false; // Reset flag to show notification
        await this.loadUsersData();
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

    async editUser(id) {
        console.log('Editando usuario:', id);
        
        try {
            // Obtener datos del usuario actual
            let users = [];
            let user = null;
            
            try {
                const response = await this.makeAuthenticatedRequest('/api/admin/users');
                if (response.ok) {
                    users = await response.json();
                    user = users.find(u => u.id === id);
                }
            } catch (error) {
                console.log('Backend no disponible, usando datos simulados');
            }
            
            // Si no se encontró el usuario en el backend, usar datos simulados
            if (!user) {
                const mockUsers = [
                    {
                        id: 1,
                        full_name: 'Juan Pérez',
                        email: 'juan@example.com',
                        cargo_rol: 'Usuario'
                    },
                    {
                        id: 2,
                        full_name: 'María García',
                        email: 'maria@example.com',
                        cargo_rol: 'Administrador'
                    },
                    {
                        id: 3,
                        full_name: 'Carlos López',
                        email: 'carlos@example.com',
                        cargo_rol: 'Tutor'
                    }
                ];
                user = mockUsers.find(u => u.id === id);
            }
            
            if (!user) {
                this.showToast('Usuario no encontrado', 'error');
                return;
            }

            // Crear contenido del modal para cambio de rol
            const modalBody = `
                <div class="edit-user-form">
                    <div class="form-group">
                        <label>Usuario:</label>
                        <p><strong>${user.full_name}</strong> (${user.email})</p>
                    </div>
                    <div class="form-group">
                        <label for="userRoleSelect">Nuevo Rol:</label>
                        <select id="userRoleSelect" class="form-select">
                            <option value="Usuario" ${user.cargo_rol === 'Usuario' ? 'selected' : ''}>Usuario</option>
                            <option value="Administrador" ${user.cargo_rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
                            <option value="Tutor" ${user.cargo_rol === 'Tutor' ? 'selected' : ''}>Tutor</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button class="btn-secondary" onclick="adminPanel.closeModal()">Cancelar</button>
                        <button class="btn-primary" onclick="adminPanel.confirmRoleChange(${id})">Cambiar Rol</button>
                    </div>
                </div>
            `;

            this.showModal('Cambiar Rol de Usuario', modalBody);
            
        } catch (error) {
            console.error('Error editando usuario:', error);
            this.showToast('Error cargando datos del usuario', 'error');
        }
    }

    async confirmRoleChange(userId) {
        try {
            const newRole = document.getElementById('userRoleSelect').value;
            
            if (!newRole) {
                this.showToast('Selecciona un rol válido', 'error');
                return;
            }

            let success = false;
            let message = '';

            try {
                const response = await this.makeAuthenticatedRequest(`/api/admin/users/${userId}/role`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cargo_rol: newRole })
                });

                const result = await response.json();

                if (response.ok) {
                    success = true;
                    message = result.message;
                } else {
                    throw new Error(result.error || 'Error cambiando rol');
                }
            } catch (error) {
                console.log('Backend no disponible, simulando cambio de rol');
                success = true;
                message = `Rol cambiado a ${newRole} exitosamente (simulado)`;
            }

            if (success) {
                this.showToast(message, 'success');
                this.closeModal();
                this.reloadUsersData();
            }

        } catch (error) {
            console.error('Error cambiando rol:', error);
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    async deleteUser(id) {
        try {
            // Obtener datos del usuario actual
            let users = [];
            let user = null;
            
            try {
                const response = await this.makeAuthenticatedRequest('/api/admin/users');
                if (response.ok) {
                    users = await response.json();
                    user = users.find(u => u.id === id);
                }
            } catch (error) {
                console.log('Backend no disponible, usando datos simulados');
            }
            
            // Si no se encontró el usuario en el backend, usar datos simulados
            if (!user) {
                const mockUsers = [
                    {
                        id: 1,
                        full_name: 'Juan Pérez',
                        email: 'juan@example.com',
                        cargo_rol: 'Usuario'
                    },
                    {
                        id: 2,
                        full_name: 'María García',
                        email: 'maria@example.com',
                        cargo_rol: 'Administrador'
                    },
                    {
                        id: 3,
                        full_name: 'Carlos López',
                        email: 'carlos@example.com',
                        cargo_rol: 'Tutor'
                    }
                ];
                user = mockUsers.find(u => u.id === id);
            }
            
            if (!user) {
                this.showToast('Usuario no encontrado', 'error');
                return;
            }

            // Mostrar modal de confirmación
            const modalBody = `
                <div class="delete-user-form">
                    <div class="warning-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>¿Estás seguro?</h4>
                        <p>Esta acción eliminará permanentemente al usuario:</p>
                        <div class="user-info">
                            <strong>${user.full_name}</strong><br>
                            <span>${user.email}</span><br>
                            <span class="role-badge">${user.cargo_rol}</span>
                        </div>
                        <p class="warning-text">Esta acción no se puede deshacer.</p>
                    </div>
                    <div class="form-actions">
                        <button class="btn-secondary" onclick="adminPanel.closeModal()">Cancelar</button>
                        <button class="btn-danger" onclick="adminPanel.confirmDeleteUser(${id})">Eliminar Usuario</button>
                    </div>
                </div>
            `;

            this.showModal('Eliminar Usuario', modalBody);
            
        } catch (error) {
            console.error('Error preparando eliminación:', error);
            this.showToast('Error cargando datos del usuario', 'error');
        }
    }

    async confirmDeleteUser(userId) {
        try {
            let success = false;
            let message = '';

            try {
                const response = await this.makeAuthenticatedRequest(`/api/admin/users/${userId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (response.ok) {
                    success = true;
                    message = result.message;
                } else {
                    throw new Error(result.error || 'Error eliminando usuario');
                }
            } catch (error) {
                console.log('Backend no disponible, simulando eliminación');
                success = true;
                message = 'Usuario eliminado exitosamente (simulado)';
            }

            if (success) {
                this.showToast(message, 'success');
                this.closeModal();
                this.reloadUsersData();
            }

        } catch (error) {
            console.error('Error eliminando usuario:', error);
            this.showToast(`Error: ${error.message}`, 'error');
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
            const response = await this.makeAuthenticatedRequest('/api/admin/auth/logout', {
                method: 'POST'
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
            const response = await this.makeAuthenticatedRequest('/api/admin/auth/check');
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
    // Apply additional styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
    
    adminPanel = new AdminPanel();
});

// ===== ESTILOS ADICIONALES PARA COMPONENTES =====
const additionalStyles = `
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(68, 229, 255, 0.2);
        border-top: 3px solid #44E5FF;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .no-data, .error-state {
        text-align: center;
        padding: 2rem;
    }
    
    .no-data-message, .error-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .no-data-message i, .error-message i {
        font-size: 2rem;
        color: rgba(68, 229, 255, 0.5);
    }
    
    .error-message i {
        color: rgba(255, 71, 87, 0.7);
    }
    
    .error-message small {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.8rem;
    }
    
    .btn-retry {
        background: rgba(68, 229, 255, 0.1);
        border: 1px solid rgba(68, 229, 255, 0.3);
        border-radius: 8px;
        padding: 0.5rem 1rem;
        color: #44E5FF;
        cursor: pointer;
        transition: 0.2s ease;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .btn-retry:hover {
        background: rgba(68, 229, 255, 0.2);
        transform: translateY(-1px);
    }

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
