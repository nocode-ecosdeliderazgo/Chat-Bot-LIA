// Admin Panel Main JavaScript File
// ES6 Modules and State Management

import Dashboard from './components/dashboard.js';
import Courses from './components/courses.js';
import News from './components/news.js';
import Users from './components/users.js';
import Permissions from './components/permissions.js';
import Settings from './components/settings.js';

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.user = null;
        this.permissions = [];
        this.components = {};
        this.modals = {};
        this.notifications = [];
        
        this.init();
    }

    async init() {
        try {
            await this.checkAuthentication();
            this.initializeComponents();
            this.setupEventListeners();
            this.loadInitialData();
            this.showSection('dashboard');
        } catch (error) {
            console.error('Error initializing admin panel:', error);
            this.redirectToLogin();
        }
    }

    // Authentication
    async checkAuthentication() {
        try {
            const response = await fetch('/api/admin/auth/check', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();
            this.user = data.user;
            this.permissions = data.permissions;
            
            this.updateUserInfo();
        } catch (error) {
            throw error;
        }
    }

    updateUserInfo() {
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        
        if (userNameEl && this.user) {
            userNameEl.textContent = this.user.name;
        }
        
        if (userRoleEl && this.user) {
            userRoleEl.textContent = this.user.role;
        }
    }

    redirectToLogin() {
        localStorage.removeItem('token');
        window.location.href = '/src/login/';
    }

    // Component Initialization
    initializeComponents() {
        this.components = {
            dashboard: new Dashboard(this),
            courses: new Courses(this),
            news: new News(this),
            users: new Users(this),
            permissions: new Permissions(this),
            settings: new Settings(this)
        };

        this.initializeModals();
        this.initializeToasts();
    }

    initializeModals() {
        this.modals = {
            course: document.getElementById('courseModal'),
            news: document.getElementById('newsModal'),
            user: document.getElementById('userModal'),
            confirm: document.getElementById('confirmModal')
        };

        // Modal close handlers
        Object.keys(this.modals).forEach(modalKey => {
            const modal = this.modals[modalKey];
            if (modal) {
                const closeBtn = modal.querySelector('.modal-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => this.closeModal(modalKey));
                }

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modalKey);
                    }
                });
            }
        });
    }

    initializeToasts() {
        this.toastContainer = document.getElementById('toastContainer');
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Mobile menu
        this.setupMobileMenu();
        
        // Search
        this.setupSearch();
        
        // Notifications
        this.setupNotifications();
        
        // Logout
        this.setupLogout();

        // Global keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });
    }

    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
            
            // Close sidebar when clicking outside
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            });
        }
    }

    setupSearch() {
        const globalSearch = document.getElementById('globalSearch');
        
        if (globalSearch) {
            let searchTimeout;
            
            globalSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performGlobalSearch(e.target.value);
                }, 300);
            });
        }
    }

    setupNotifications() {
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        
        if (notificationBtn && notificationDropdown) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('show');
            });
            
            document.addEventListener('click', () => {
                notificationDropdown.classList.remove('show');
            });
            
            // Mark all as read
            const markAllRead = notificationDropdown.querySelector('.mark-all-read');
            if (markAllRead) {
                markAllRead.addEventListener('click', () => {
                    this.markAllNotificationsRead();
                });
            }
        }
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.showConfirmModal(
                    '¿Estás seguro de que deseas cerrar sesión?',
                    () => this.logout()
                );
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for global search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const globalSearch = document.getElementById('globalSearch');
                if (globalSearch) {
                    globalSearch.focus();
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Navigation
    showSection(sectionName) {
        if (!this.hasPermission(`view_${sectionName}`)) {
            this.showToast('No tienes permisos para acceder a esta sección', 'error');
            return;
        }

        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        const navLinks = document.querySelectorAll('.nav-link');
        
        navItems.forEach(item => item.classList.remove('active'));
        navLinks.forEach(link => {
            if (link.dataset.section === sectionName) {
                link.closest('.nav-item').classList.add('active');
            }
        });

        // Update breadcrumb
        const currentSectionEl = document.getElementById('currentSection');
        if (currentSectionEl) {
            const sectionTitles = {
                dashboard: 'Dashboard',
                courses: 'Cursos',
                news: 'Noticias',
                users: 'Usuarios',
                permissions: 'Permisos',
                settings: 'Configuraciones'
            };
            currentSectionEl.textContent = sectionTitles[sectionName] || sectionName;
        }

        // Show/hide sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.classList.add('fade-in');
        }

        this.currentSection = sectionName;
        
        // Load section data
        if (this.components[sectionName]) {
            this.components[sectionName].load();
        }

        // Close mobile menu if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('show');
        }
    }

    // Modal Management
    showModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    closeModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }

    closeAllModals() {
        Object.keys(this.modals).forEach(modalName => {
            this.closeModal(modalName);
        });
    }

    showConfirmModal(message, onConfirm, onCancel = null) {
        const confirmModal = this.modals.confirm;
        if (confirmModal) {
            const messageEl = document.getElementById('confirmMessage');
            const confirmBtn = document.getElementById('confirmAction');
            const cancelBtn = document.getElementById('cancelAction');
            
            if (messageEl) {
                messageEl.textContent = message;
            }
            
            // Remove previous event listeners
            const newConfirmBtn = confirmBtn.cloneNode(true);
            const newCancelBtn = cancelBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            
            // Add new event listeners
            newConfirmBtn.addEventListener('click', () => {
                this.closeModal('confirm');
                if (onConfirm) onConfirm();
            });
            
            newCancelBtn.addEventListener('click', () => {
                this.closeModal('confirm');
                if (onCancel) onCancel();
            });
            
            this.showModal('confirm');
        }
    }

    // Toast Notifications
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        this.toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Loading Management
    showLoading(message = 'Cargando...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = loadingOverlay.querySelector('p');
        
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        loadingOverlay.classList.add('show');
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.remove('show');
    }

    // Search
    async performGlobalSearch(query) {
        if (!query.trim()) return;

        try {
            const response = await this.apiCall('/api/admin/search', {
                method: 'POST',
                body: JSON.stringify({ query })
            });

            // Handle search results based on current section
            if (this.components[this.currentSection] && this.components[this.currentSection].handleSearchResults) {
                this.components[this.currentSection].handleSearchResults(response.results);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    // Notifications
    async loadNotifications() {
        try {
            const response = await this.apiCall('/api/admin/notifications');
            this.notifications = response.notifications;
            this.renderNotifications();
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;

        if (this.notifications.length === 0) {
            notificationList.innerHTML = '<div class="no-notifications">No hay notificaciones</div>';
            return;
        }

        notificationList.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                <div class="notification-icon">
                    <i class="fas fa-${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <h5>${notification.title}</h5>
                    <p>${notification.message}</p>
                    <span class="notification-time">${this.formatTime(notification.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    async markAllNotificationsRead() {
        try {
            await this.apiCall('/api/admin/notifications/mark-all-read', {
                method: 'POST'
            });
            
            this.notifications = this.notifications.map(n => ({ ...n, read: true }));
            this.renderNotifications();
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            this.showToast('Error al marcar notificaciones como leídas', 'error');
        }
    }

    // Utility Functions
    async apiCall(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, finalOptions);

            if (response.status === 401) {
                this.redirectToLogin();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    hasPermission(permission) {
        if (!this.user || !this.permissions) return false;
        if (this.user.role === 'Super Admin') return true;
        return this.permissions.includes(permission);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) {
            return 'Hace un momento';
        } else if (diff < 3600000) {
            return `Hace ${Math.floor(diff / 60000)} minutos`;
        } else if (diff < 86400000) {
            return `Hace ${Math.floor(diff / 3600000)} horas`;
        } else {
            return date.toLocaleDateString();
        }
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Data Loading
    async loadInitialData() {
        try {
            this.showLoading('Cargando datos iniciales...');
            
            // Load notifications
            await this.loadNotifications();
            
            // Load dashboard stats if on dashboard
            if (this.currentSection === 'dashboard') {
                await this.components.dashboard.loadStats();
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.hideLoading();
            this.showToast('Error al cargar los datos iniciales', 'error');
        }
    }

    // Logout
    async logout() {
        try {
            await this.apiCall('/api/admin/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            this.redirectToLogin();
        }
    }

    // File Upload Helper
    async uploadFile(file, type = 'image') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Form Validation Helper
    validateForm(form) {
        const inputs = form.querySelectorAll('[required]');
        let isValid = true;
        const errors = [];

        inputs.forEach(input => {
            const value = input.value.trim();
            const fieldName = input.getAttribute('name') || input.id;

            if (!value) {
                isValid = false;
                errors.push(`${fieldName} es requerido`);
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }

            // Email validation
            if (input.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errors.push(`${fieldName} debe ser un email válido`);
                    input.classList.add('error');
                }
            }

            // URL validation
            if (input.type === 'url' && value) {
                try {
                    new URL(value);
                    input.classList.remove('error');
                } catch {
                    isValid = false;
                    errors.push(`${fieldName} debe ser una URL válida`);
                    input.classList.add('error');
                }
            }
        });

        return { isValid, errors };
    }
}

// Initialize Admin Panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Export for modules
export default AdminPanel;