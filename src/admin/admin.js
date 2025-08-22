// Admin Panel JavaScript
const AdminPanel = {
    // API endpoints
    endpoints: {
        users: '/api/admin/users',
        dashboard: '/api/admin/dashboard/stats',
        courses: '/api/admin/courses',
        community: '/api/admin/community',
        settings: '/api/admin/settings',
        database: '/api/database'
    },

    // Current state
    state: {
        currentSection: 'dashboard',
        users: [],
        courses: [],
        posts: [],
        filters: {
            userSearch: '',
            roleFilter: '',
            statusFilter: ''
        },
        pagination: {
            currentPage: 1,
            itemsPerPage: 10
        }
    },

    // Initialize admin panel
    init() {
        this.setupEventListeners();
        this.loadDashboard();
        this.checkDatabaseConnection();
    },

    // Setup event listeners
    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Sidebar toggle for mobile
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            document.querySelector('.admin-sidebar').classList.toggle('show');
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                localStorage.removeItem('adminToken');
                window.location.href = '/login/login.html';
            }
        });

        // User management
        document.getElementById('userSearch')?.addEventListener('input', (e) => {
            this.state.filters.userSearch = e.target.value;
            this.filterUsers();
        });

        document.getElementById('roleFilter')?.addEventListener('change', (e) => {
            this.state.filters.roleFilter = e.target.value;
            this.filterUsers();
        });

        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.state.filters.statusFilter = e.target.value;
            this.filterUsers();
        });

        document.getElementById('refreshUsers')?.addEventListener('click', () => {
            this.loadUsers();
        });

        // Add user modal
        document.getElementById('saveNewUser')?.addEventListener('click', () => {
            this.saveNewUser();
        });

        // Update user modal
        document.getElementById('updateUser')?.addEventListener('click', () => {
            this.updateUser();
        });

        // Database connection test
        document.getElementById('testDbConnection')?.addEventListener('click', () => {
            this.testDatabaseConnection();
        });

        // Community view toggle
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const view = e.target.dataset.view;
                this.loadCommunityContent(view);
            });
        });
    },

    // Switch between sections
    switchSection(section) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

        // Update section title
        document.querySelector('.section-title').textContent = 
            section.charAt(0).toUpperCase() + section.slice(1);

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Show selected section
        document.getElementById(section)?.classList.add('active');

        // Load section data
        this.state.currentSection = section;
        switch(section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'courses':
                this.loadCourses();
                break;
            case 'community':
                this.loadCommunityContent('posts');
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    },

    // Load dashboard data
    async loadDashboard() {
        try {
            const response = await fetch(this.endpoints.dashboard, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'x-api-key': this.getApiKey()
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load dashboard stats');
            }

            const stats = await response.json();
            this.updateDashboardStats(stats);
            this.loadRecentActivity();
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError('Error al cargar el dashboard');
        }
    },

    // Update dashboard statistics
    updateDashboardStats(stats) {
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
        document.getElementById('totalCourses').textContent = stats.totalCourses || 0;
        document.getElementById('totalPosts').textContent = stats.totalPosts || 0;

        // Update user distribution chart
        this.updateUserDistributionChart(stats.userDistribution);
    },

    // Load recent activity
    async loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        activityContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

        try {
            const response = await fetch('/api/admin/activity', {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'x-api-key': this.getApiKey()
                }
            });

            if (!response.ok) throw new Error('Failed to load activity');

            const activities = await response.json();
            this.renderRecentActivity(activities);
        } catch (error) {
            console.error('Error loading activity:', error);
            activityContainer.innerHTML = '<div class="text-muted text-center">No hay actividad reciente</div>';
        }
    },

    // Render recent activity
    renderRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        
        if (!activities || activities.length === 0) {
            container.innerHTML = '<div class="text-muted text-center">No hay actividad reciente</div>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon bg-${this.getActivityColor(activity.type)}">
                    <i class="bi bi-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <strong>${activity.user}</strong> ${activity.action}
                    <div class="activity-time">${this.formatRelativeTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    },

    // Load users
    async loadUsers() {
        const tableBody = document.getElementById('usersTableBody');
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="spinner-border" role="status"></div></td></tr>';

        try {
            const response = await fetch(this.endpoints.users, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'x-api-key': this.getApiKey()
                }
            });

            if (!response.ok) throw new Error('Failed to load users');

            const users = await response.json();
            this.state.users = users;
            this.renderUsersTable(users);
        } catch (error) {
            console.error('Error loading users:', error);
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error al cargar usuarios</td></tr>';
        }
    },

    // Render users table
    renderUsersTable(users) {
        const tableBody = document.getElementById('usersTableBody');
        const filteredUsers = this.getFilteredUsers(users);
        const paginatedUsers = this.paginateUsers(filteredUsers);

        if (paginatedUsers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No se encontraron usuarios</td></tr>';
            return;
        }

        tableBody.innerHTML = paginatedUsers.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.full_name || 'Sin nombre'}</td>
                <td>${user.username}</td>
                <td>${user.email || 'Sin email'}</td>
                <td><span class="badge-role badge-role-${user.role || 'usuario'}">${user.role || 'usuario'}</span></td>
                <td><span class="badge-${user.status === 'active' ? 'active' : 'inactive'}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                <td>${this.formatDate(user.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="AdminPanel.editUser(${user.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="AdminPanel.deleteUser(${user.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        this.renderPagination(filteredUsers.length);
    },

    // Filter users
    getFilteredUsers(users) {
        return users.filter(user => {
            const matchesSearch = !this.state.filters.userSearch || 
                user.full_name?.toLowerCase().includes(this.state.filters.userSearch.toLowerCase()) ||
                user.username?.toLowerCase().includes(this.state.filters.userSearch.toLowerCase()) ||
                user.email?.toLowerCase().includes(this.state.filters.userSearch.toLowerCase());

            const matchesRole = !this.state.filters.roleFilter || 
                user.role === this.state.filters.roleFilter;

            const matchesStatus = !this.state.filters.statusFilter || 
                user.status === this.state.filters.statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    },

    // Filter users (triggered by filters)
    filterUsers() {
        this.renderUsersTable(this.state.users);
    },

    // Paginate users
    paginateUsers(users) {
        const start = (this.state.pagination.currentPage - 1) * this.state.pagination.itemsPerPage;
        const end = start + this.state.pagination.itemsPerPage;
        return users.slice(start, end);
    },

    // Render pagination
    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.state.pagination.itemsPerPage);
        const pagination = document.getElementById('usersPagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === this.state.pagination.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="AdminPanel.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        pagination.innerHTML = html;
    },

    // Go to page
    goToPage(page) {
        this.state.pagination.currentPage = page;
        this.renderUsersTable(this.state.users);
    },

    // Edit user
    async editUser(userId) {
        const user = this.state.users.find(u => u.id === userId);
        if (!user) return;

        const form = document.getElementById('editUserForm');
        form.elements.id.value = user.id;
        form.elements.full_name.value = user.full_name || '';
        form.elements.username.value = user.username;
        form.elements.email.value = user.email || '';
        form.elements.role.value = user.role || 'usuario';
        form.elements.status.value = user.status || 'active';

        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();
    },

    // Update user
    async updateUser() {
        const form = document.getElementById('editUserForm');
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData);

        try {
            const response = await fetch(`${this.endpoints.users}/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'x-api-key': this.getApiKey()
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) throw new Error('Failed to update user');

            this.showSuccess('Usuario actualizado correctamente');
            bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
            this.loadUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            this.showError('Error al actualizar usuario');
        }
    },

    // Delete user
    async deleteUser(userId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

        try {
            const response = await fetch(`${this.endpoints.users}/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'x-api-key': this.getApiKey()
                }
            });

            if (!response.ok) throw new Error('Failed to delete user');

            this.showSuccess('Usuario eliminado correctamente');
            this.loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showError('Error al eliminar usuario');
        }
    },

    // Save new user
    async saveNewUser() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData);

        try {
            const response = await fetch(this.endpoints.users, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'x-api-key': this.getApiKey()
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) throw new Error('Failed to create user');

            this.showSuccess('Usuario creado correctamente');
            bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
            form.reset();
            this.loadUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            this.showError('Error al crear usuario');
        }
    },

    // Load courses
    async loadCourses() {
        const coursesGrid = document.getElementById('coursesGrid');
        coursesGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"></div></div>';

        try {
            const response = await fetch(this.endpoints.courses, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'x-api-key': this.getApiKey()
                }
            });

            if (!response.ok) throw new Error('Failed to load courses');

            const courses = await response.json();
            this.state.courses = courses;
            this.renderCourses(courses);
        } catch (error) {
            console.error('Error loading courses:', error);
            coursesGrid.innerHTML = '<div class="col-12 text-center text-danger">Error al cargar cursos</div>';
        }
    },

    // Render courses
    renderCourses(courses) {
        const coursesGrid = document.getElementById('coursesGrid');
        
        if (!courses || courses.length === 0) {
            coursesGrid.innerHTML = '<div class="col-12 text-center">No hay cursos disponibles</div>';
            return;
        }

        coursesGrid.innerHTML = courses.map(course => `
            <div class="col-md-4 mb-4">
                <div class="course-card">
                    <div class="course-header">
                        <h5 class="course-title">${course.title}</h5>
                        <span class="course-category">${course.category || 'General'}</span>
                    </div>
                    <p class="text-muted">${course.description || 'Sin descripción'}</p>
                    <div class="course-stats">
                        <div class="course-stat">
                            <i class="bi bi-people"></i>
                            <span>${course.enrollments || 0} estudiantes</span>
                        </div>
                        <div class="course-stat">
                            <i class="bi bi-clock"></i>
                            <span>${course.duration || 0} horas</span>
                        </div>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-primary" onclick="AdminPanel.editCourse(${course.id})">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="AdminPanel.deleteCourse(${course.id})">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Load community content
    async loadCommunityContent(view) {
        const container = document.getElementById('communityContent');
        container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

        try {
            const endpoint = view === 'posts' ? '/api/admin/community/posts' : '/api/admin/community/comments';
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'x-api-key': this.getApiKey()
                }
            });

            if (!response.ok) throw new Error(`Failed to load ${view}`);

            const data = await response.json();
            
            if (view === 'posts') {
                this.renderPosts(data);
            } else {
                this.renderComments(data);
            }
        } catch (error) {
            console.error(`Error loading ${view}:`, error);
            container.innerHTML = `<div class="text-center text-danger">Error al cargar ${view === 'posts' ? 'publicaciones' : 'comentarios'}</div>`;
        }
    },

    // Render posts
    renderPosts(posts) {
        const container = document.getElementById('communityContent');
        
        if (!posts || posts.length === 0) {
            container.innerHTML = '<div class="text-center">No hay publicaciones</div>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="post-item">
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar">${this.getInitials(post.author_name)}</div>
                        <div class="author-info">
                            <h6>${post.author_name}</h6>
                            <small>${this.formatDate(post.created_at)}</small>
                        </div>
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-sm btn-outline-danger" onclick="AdminPanel.deletePost(${post.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="post-content">
                    <h5>${post.title}</h5>
                    <p>${post.content}</p>
                </div>
                <div class="post-stats">
                    <div class="post-stat">
                        <i class="bi bi-hand-thumbs-up"></i>
                        <span>${post.likes || 0} Me gusta</span>
                    </div>
                    <div class="post-stat">
                        <i class="bi bi-chat"></i>
                        <span>${post.comments_count || 0} Comentarios</span>
                    </div>
                    <div class="post-stat">
                        <i class="bi bi-eye"></i>
                        <span>${post.views || 0} Vistas</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Load analytics
    async loadAnalytics() {
        try {
            // Set date range to last 30 days
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
            document.getElementById('endDate').value = endDate.toISOString().split('T')[0];

            // Load analytics data
            const response = await fetch('/api/admin/analytics', {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'x-api-key': this.getApiKey()
                }
            });

            if (!response.ok) throw new Error('Failed to load analytics');

            const analytics = await response.json();
            this.renderAnalyticsCharts(analytics);
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showError('Error al cargar analíticas');
        }
    },

    // Render analytics charts
    renderAnalyticsCharts(data) {
        // User activity chart
        const userActivityCtx = document.getElementById('userActivityChart')?.getContext('2d');
        if (userActivityCtx) {
            new Chart(userActivityCtx, {
                type: 'line',
                data: {
                    labels: data.userActivity?.labels || [],
                    datasets: [{
                        label: 'Usuarios Activos',
                        data: data.userActivity?.data || [],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Course progress chart
        const courseProgressCtx = document.getElementById('courseProgressChart')?.getContext('2d');
        if (courseProgressCtx) {
            new Chart(courseProgressCtx, {
                type: 'bar',
                data: {
                    labels: data.courseProgress?.labels || [],
                    datasets: [{
                        label: 'Progreso Promedio',
                        data: data.courseProgress?.data || [],
                        backgroundColor: '#48bb78'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    },

    // Update user distribution chart
    updateUserDistributionChart(data) {
        const ctx = document.getElementById('userDistributionChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Usuarios', 'Instructores', 'Administradores'],
                datasets: [{
                    data: [
                        data?.usuarios || 0,
                        data?.instructores || 0,
                        data?.administradores || 0
                    ],
                    backgroundColor: ['#e2e8f0', '#bee3f8', '#fbb6ce']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    // Check database connection
    async checkDatabaseConnection() {
        try {
            const response = await fetch('/api/health', {
                headers: {
                    'x-api-key': this.getApiKey()
                }
            });

            const health = await response.json();
            const dbStatus = document.getElementById('dbStatus');
            
            if (dbStatus) {
                if (health.database) {
                    dbStatus.textContent = 'Conectado';
                    dbStatus.className = 'text-success';
                } else {
                    dbStatus.textContent = 'Desconectado';
                    dbStatus.className = 'text-danger';
                }
            }
        } catch (error) {
            console.error('Error checking database:', error);
            const dbStatus = document.getElementById('dbStatus');
            if (dbStatus) {
                dbStatus.textContent = 'Error';
                dbStatus.className = 'text-danger';
            }
        }
    },

    // Test database connection
    async testDatabaseConnection() {
        const btn = document.getElementById('testDbConnection');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Probando...';
        btn.disabled = true;

        try {
            const response = await fetch('/api/admin/test-db', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'x-api-key': this.getApiKey()
                }
            });

            if (response.ok) {
                this.showSuccess('Conexión a base de datos exitosa');
                this.checkDatabaseConnection();
            } else {
                this.showError('Error al conectar con la base de datos');
            }
        } catch (error) {
            console.error('Error testing database:', error);
            this.showError('Error al probar conexión');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    // Utility functions
    getAuthToken() {
        return localStorage.getItem('adminToken') || '';
    },

    getApiKey() {
        // In browser environment, we need to get this from the server or use a default
        // For development, using 'dev' as default
        return localStorage.getItem('apiKey') || 'dev';
    },

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatRelativeTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Hace un momento';
        if (minutes < 60) return `Hace ${minutes} minutos`;
        if (hours < 24) return `Hace ${hours} horas`;
        return `Hace ${days} días`;
    },

    getInitials(name) {
        if (!name) return '?';
        const parts = name.split(' ');
        return parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
    },

    getActivityIcon(type) {
        const icons = {
            'user_register': 'person-plus',
            'user_login': 'box-arrow-in-right',
            'course_enroll': 'book',
            'post_create': 'file-post',
            'comment_create': 'chat'
        };
        return icons[type] || 'activity';
    },

    getActivityColor(type) {
        const colors = {
            'user_register': 'primary',
            'user_login': 'info',
            'course_enroll': 'success',
            'post_create': 'warning',
            'comment_create': 'secondary'
        };
        return colors[type] || 'secondary';
    },

    showSuccess(message) {
        // You can implement a toast notification here
        alert(message);
    },

    showError(message) {
        // You can implement a toast notification here
        alert('Error: ' + message);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AdminPanel.init();
});