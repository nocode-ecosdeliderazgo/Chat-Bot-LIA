// Users Component
// Handles user management, profiles, and user-related operations

class Users {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.users = [];
        this.currentUser = null;
        this.filters = {
            role: '',
            status: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 15,
            total: 0
        };
        this.selectedUsers = new Set();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showUserModal();
            });
        }

        // Filter handlers
        this.setupFilters();

        // Modal handlers
        this.setupModalHandlers();

        // Bulk operations
        this.setupBulkOperations();
    }

    setupFilters() {
        const filters = ['role', 'status'];
        
        filters.forEach(filterType => {
            const element = document.getElementById(`user${filterType.charAt(0).toUpperCase() + filterType.slice(1)}Filter`);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.filters[filterType] = e.target.value;
                    this.pagination.page = 1;
                    this.loadUsers();
                });
            }
        });

        // Search input
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            const debouncedSearch = this.adminPanel.debounce((value) => {
                this.filters.search = value;
                this.pagination.page = 1;
                this.loadUsers();
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    setupModalHandlers() {
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveUser();
            });
        }
    }

    setupBulkOperations() {
        // Select all checkbox
        const selectAllBtn = document.getElementById('selectAllUsers');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }

        // Bulk action buttons
        const bulkActions = ['activate', 'deactivate', 'delete', 'export'];
        bulkActions.forEach(action => {
            const btn = document.getElementById(`bulk${action.charAt(0).toUpperCase() + action.slice(1)}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.handleBulkAction(action);
                });
            }
        });
    }

    async load() {
        try {
            await this.loadUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            this.adminPanel.showToast('Error al cargar los usuarios', 'error');
        }
    }

    async loadUsers() {
        try {
            this.adminPanel.showLoading('Cargando usuarios...');
            
            const params = new URLSearchParams({
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.filters
            });

            const response = await this.adminPanel.apiCall(`/api/admin/users?${params}`);
            
            this.users = response.users;
            this.pagination.total = response.total;
            
            this.renderUsers();
            this.renderPagination();
            this.updateBulkActions();
            
            this.adminPanel.hideLoading();
        } catch (error) {
            console.error('Error loading users:', error);
            this.adminPanel.hideLoading();
            throw error;
        }
    }

    renderUsers() {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return;

        if (this.users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="no-data">
                            <i class="fas fa-users"></i>
                            <h3>No hay usuarios disponibles</h3>
                            <p>Los usuarios aparecerán aquí cuando se registren</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.users.map(user => `
            <tr data-user-id="${user.id}" class="${this.selectedUsers.has(user.id) ? 'selected' : ''}">
                <td>
                    <input type="checkbox" class="user-checkbox" value="${user.id}" 
                           ${this.selectedUsers.has(user.id) ? 'checked' : ''}
                           onchange="users.toggleUserSelection('${user.id}', this.checked)">
                </td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            ${user.avatar ? 
                                `<img src="${user.avatar}" alt="${user.name}">` : 
                                `<div class="avatar-placeholder">${user.name.charAt(0)}</div>`
                            }
                        </div>
                        <div class="user-details">
                            <div class="user-name">${user.name}</div>
                            <div class="user-username">@${user.username || user.email.split('@')[0]}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="email-cell">
                        ${user.email}
                        ${user.emailVerified ? 
                            '<i class="fas fa-check-circle verified" title="Email verificado"></i>' : 
                            '<i class="fas fa-exclamation-triangle unverified" title="Email no verificado"></i>'
                        }
                    </div>
                </td>
                <td>
                    <span class="role-badge role-${user.role.toLowerCase().replace(' ', '-')}">
                        ${user.role}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${user.status}">
                        ${this.getStatusText(user.status)}
                    </span>
                </td>
                <td>
                    <div class="date-cell">
                        ${user.lastLogin ? 
                            `<div class="last-login">${this.adminPanel.formatTime(user.lastLogin)}</div>` : 
                            '<div class="never-logged">Nunca</div>'
                        }
                        <div class="registration-date">Registro: ${this.adminPanel.formatDate(user.createdAt)}</div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-secondary" onclick="users.viewUserProfile('${user.id}')" title="Ver Perfil">
                            <i class="fas fa-user"></i>
                        </button>
                        <button class="btn btn-small btn-primary" onclick="users.editUser('${user.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small ${user.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                                onclick="users.toggleUserStatus('${user.id}')" 
                                title="${user.status === 'active' ? 'Suspender' : 'Activar'}">
                            <i class="fas fa-${user.status === 'active' ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="btn btn-small btn-info" onclick="users.sendPasswordReset('${user.id}')" title="Restablecer Contraseña">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="users.deleteUser('${user.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Update select all checkbox
        this.updateSelectAllCheckbox();
    }

    renderPagination() {
        const container = document.getElementById('usersPagination');
        if (!container) return;

        const totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const currentPage = this.pagination.page;
        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="users.changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                            onclick="users.changePage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Next button
        paginationHTML += `
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="users.changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = paginationHTML;
    }

    changePage(page) {
        if (page < 1 || page > Math.ceil(this.pagination.total / this.pagination.limit)) return;
        
        this.pagination.page = page;
        this.loadUsers();
    }

    showUserModal(userId = null) {
        this.currentUser = userId;
        
        const modal = document.getElementById('userModal');
        const modalTitle = document.getElementById('userModalTitle');
        const form = document.getElementById('userForm');
        
        if (userId) {
            modalTitle.textContent = 'Editar Usuario';
            this.loadUserData(userId);
        } else {
            modalTitle.textContent = 'Agregar Usuario';
            form.reset();
        }
        
        this.renderUserForm();
        this.adminPanel.showModal('user');
    }

    renderUserForm() {
        const formBody = document.querySelector('#userModal .modal-body');
        if (!formBody) return;

        formBody.innerHTML = `
            <form id="userForm">
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Nombre Completo *</label>
                        <input type="text" class="form-input" id="userName" name="name" required maxlength="100">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Nombre de Usuario</label>
                        <input type="text" class="form-input" id="userUsername" name="username" maxlength="50">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-input" id="userEmail" name="email" required maxlength="100">
                </div>

                ${!this.currentUser ? `
                    <div class="form-group">
                        <label class="form-label">Contraseña *</label>
                        <input type="password" class="form-input" id="userPassword" name="password" required minlength="8">
                        <small class="form-help">Mínimo 8 caracteres</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Confirmar Contraseña *</label>
                        <input type="password" class="form-input" id="userPasswordConfirm" name="passwordConfirm" required>
                    </div>
                ` : ''}

                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Rol *</label>
                        <select class="form-select" id="userRole" name="role" required>
                            <option value="">Seleccionar rol</option>
                            <option value="User">Usuario</option>
                            <option value="Premium">Premium</option>
                            <option value="Moderator">Moderador</option>
                            <option value="Admin">Administrador</option>
                            ${this.adminPanel.user?.role === 'Super Admin' ? '<option value="Super Admin">Super Admin</option>' : ''}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Estado *</label>
                        <select class="form-select" id="userStatus" name="status" required>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                            <option value="suspended">Suspendido</option>
                            <option value="banned">Baneado</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Teléfono</label>
                    <input type="tel" class="form-input" id="userPhone" name="phone" maxlength="20">
                </div>

                <div class="form-group">
                    <label class="form-label">Bio/Descripción</label>
                    <textarea class="form-textarea" id="userBio" name="bio" maxlength="500" rows="3"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Avatar</label>
                    <input type="file" class="form-input" id="userAvatar" name="avatar" accept="image/*">
                    <div class="image-preview" id="avatarPreview" style="display: none;">
                        <img src="" alt="Avatar Preview" style="max-width: 100px; border-radius: 50%;">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Configuración</label>
                    <div class="checkbox-group">
                        <label class="form-label">
                            <input type="checkbox" id="userEmailVerified" name="emailVerified">
                            Email verificado
                        </label>
                        <label class="form-label">
                            <input type="checkbox" id="userNotifications" name="notifications" checked>
                            Recibir notificaciones
                        </label>
                        <label class="form-label">
                            <input type="checkbox" id="userNewsletter" name="newsletter" checked>
                            Suscrito al newsletter
                        </label>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="adminPanel.closeModal('user')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        ${this.currentUser ? 'Actualizar' : 'Crear'} Usuario
                    </button>
                </div>
            </form>
        `;

        // Setup avatar preview
        const avatarInput = document.getElementById('userAvatar');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                this.handleAvatarPreview(e);
            });
        }

        // Password confirmation validation
        if (!this.currentUser) {
            const passwordConfirm = document.getElementById('userPasswordConfirm');
            if (passwordConfirm) {
                passwordConfirm.addEventListener('blur', () => {
                    this.validatePasswordMatch();
                });
            }
        }
    }

    handleAvatarPreview(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('avatarPreview');
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = preview.querySelector('img');
                img.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('userPassword');
        const passwordConfirm = document.getElementById('userPasswordConfirm');
        
        if (password && passwordConfirm) {
            if (password.value !== passwordConfirm.value) {
                passwordConfirm.setCustomValidity('Las contraseñas no coinciden');
                passwordConfirm.classList.add('error');
            } else {
                passwordConfirm.setCustomValidity('');
                passwordConfirm.classList.remove('error');
            }
        }
    }

    async loadUserData(userId) {
        try {
            const response = await this.adminPanel.apiCall(`/api/admin/users/${userId}`);
            const user = response.user;
            
            // Fill form fields
            document.getElementById('userName').value = user.name || '';
            document.getElementById('userUsername').value = user.username || '';
            document.getElementById('userEmail').value = user.email || '';
            document.getElementById('userRole').value = user.role || '';
            document.getElementById('userStatus').value = user.status || '';
            document.getElementById('userPhone').value = user.phone || '';
            document.getElementById('userBio').value = user.bio || '';
            document.getElementById('userEmailVerified').checked = user.emailVerified || false;
            document.getElementById('userNotifications').checked = user.notifications !== false;
            document.getElementById('userNewsletter').checked = user.newsletter !== false;
            
            // Show avatar preview if exists
            if (user.avatar) {
                const preview = document.getElementById('avatarPreview');
                const img = preview.querySelector('img');
                img.src = user.avatar;
                preview.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.adminPanel.showToast('Error al cargar los datos del usuario', 'error');
        }
    }

    async saveUser() {
        try {
            const form = document.getElementById('userForm');
            const validation = this.adminPanel.validateForm(form);
            
            if (!validation.isValid) {
                validation.errors.forEach(error => {
                    this.adminPanel.showToast(error, 'error');
                });
                return;
            }

            // Validate password match for new users
            if (!this.currentUser) {
                this.validatePasswordMatch();
                const passwordConfirm = document.getElementById('userPasswordConfirm');
                if (passwordConfirm.validationMessage) {
                    this.adminPanel.showToast('Las contraseñas no coinciden', 'error');
                    return;
                }
            }

            this.adminPanel.showLoading('Guardando usuario...');

            const formData = new FormData();
            
            // Get form data
            formData.append('name', document.getElementById('userName').value);
            formData.append('username', document.getElementById('userUsername').value);
            formData.append('email', document.getElementById('userEmail').value);
            formData.append('role', document.getElementById('userRole').value);
            formData.append('status', document.getElementById('userStatus').value);
            formData.append('phone', document.getElementById('userPhone').value);
            formData.append('bio', document.getElementById('userBio').value);
            formData.append('emailVerified', document.getElementById('userEmailVerified').checked);
            formData.append('notifications', document.getElementById('userNotifications').checked);
            formData.append('newsletter', document.getElementById('userNewsletter').checked);
            
            // Add password for new users
            if (!this.currentUser) {
                formData.append('password', document.getElementById('userPassword').value);
            }
            
            // Handle avatar upload
            const avatarFile = document.getElementById('userAvatar').files[0];
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const url = this.currentUser ? 
                `/api/admin/users/${this.currentUser}` : 
                '/api/admin/users';
            
            const method = this.currentUser ? 'PUT' : 'POST';

            await this.adminPanel.apiCall(url, {
                method,
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            this.adminPanel.hideLoading();
            this.adminPanel.closeModal('user');
            this.adminPanel.showToast(
                this.currentUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente', 
                'success'
            );
            
            this.loadUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al guardar el usuario', 'error');
        }
    }

    editUser(userId) {
        this.showUserModal(userId);
    }

    async viewUserProfile(userId) {
        try {
            const response = await this.adminPanel.apiCall(`/api/admin/users/${userId}/profile`);
            this.showUserProfileModal(response.user);
        } catch (error) {
            console.error('Error loading user profile:', error);
            this.adminPanel.showToast('Error al cargar el perfil del usuario', 'error');
        }
    }

    showUserProfileModal(user) {
        // Create and show user profile modal
        const modalHTML = `
            <div class="user-profile-modal">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${user.avatar ? 
                            `<img src="${user.avatar}" alt="${user.name}">` : 
                            `<div class="avatar-placeholder">${user.name.charAt(0)}</div>`
                        }
                    </div>
                    <div class="profile-info">
                        <h2>${user.name}</h2>
                        <p class="role">${user.role}</p>
                        <p class="email">${user.email}</p>
                    </div>
                </div>
                
                <div class="profile-stats">
                    <div class="stat">
                        <div class="stat-value">${user.stats.coursesEnrolled || 0}</div>
                        <div class="stat-label">Cursos Inscritos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${user.stats.coursesCompleted || 0}</div>
                        <div class="stat-label">Cursos Completados</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${user.stats.totalHours || 0}</div>
                        <div class="stat-label">Horas de Estudio</div>
                    </div>
                </div>

                <div class="profile-details">
                    <div class="detail-section">
                        <h4>Información Personal</h4>
                        <p><strong>Registro:</strong> ${this.adminPanel.formatDate(user.createdAt)}</p>
                        <p><strong>Último Acceso:</strong> ${user.lastLogin ? this.adminPanel.formatTime(user.lastLogin) : 'Nunca'}</p>
                        <p><strong>Estado:</strong> ${this.getStatusText(user.status)}</p>
                        ${user.bio ? `<p><strong>Bio:</strong> ${user.bio}</p>` : ''}
                    </div>
                    
                    <div class="detail-section">
                        <h4>Actividad Reciente</h4>
                        <div class="activity-list">
                            ${user.recentActivity?.map(activity => `
                                <div class="activity-item">
                                    <i class="fas fa-${activity.icon}"></i>
                                    <span>${activity.description}</span>
                                    <small>${this.adminPanel.formatTime(activity.timestamp)}</small>
                                </div>
                            `).join('') || '<p>No hay actividad reciente</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Show in a custom modal or existing modal system
        this.adminPanel.showToast('Perfil del usuario cargado', 'info');
    }

    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        this.adminPanel.showConfirmModal(
            `¿Estás seguro de que deseas eliminar al usuario "${user.name}"? Esta acción no se puede deshacer y eliminará todos sus datos.`,
            () => this.confirmDeleteUser(userId)
        );
    }

    async confirmDeleteUser(userId) {
        try {
            this.adminPanel.showLoading('Eliminando usuario...');
            
            await this.adminPanel.apiCall(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Usuario eliminado exitosamente', 'success');
            
            this.loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al eliminar el usuario', 'error');
        }
    }

    async toggleUserStatus(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        
        try {
            this.adminPanel.showLoading('Actualizando estado...');
            
            await this.adminPanel.apiCall(`/api/admin/users/${userId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Estado del usuario actualizado', 'success');
            
            this.loadUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al actualizar el estado', 'error');
        }
    }

    async sendPasswordReset(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        this.adminPanel.showConfirmModal(
            `¿Enviar email de restablecimiento de contraseña a ${user.email}?`,
            () => this.confirmPasswordReset(userId)
        );
    }

    async confirmPasswordReset(userId) {
        try {
            this.adminPanel.showLoading('Enviando email...');
            
            await this.adminPanel.apiCall(`/api/admin/users/${userId}/password-reset`, {
                method: 'POST'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Email de restablecimiento enviado', 'success');
        } catch (error) {
            console.error('Error sending password reset:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al enviar el email', 'error');
        }
    }

    // Selection and Bulk Operations
    toggleUserSelection(userId, isSelected) {
        if (isSelected) {
            this.selectedUsers.add(userId);
        } else {
            this.selectedUsers.delete(userId);
        }
        
        this.updateBulkActions();
        this.updateSelectAllCheckbox();
        
        // Update row styling
        const row = document.querySelector(`[data-user-id="${userId}"]`);
        if (row) {
            row.classList.toggle('selected', isSelected);
        }
    }

    toggleSelectAll(selectAll) {
        this.selectedUsers.clear();
        
        if (selectAll) {
            this.users.forEach(user => {
                this.selectedUsers.add(user.id);
            });
        }
        
        // Update checkboxes
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
        
        // Update row styling
        const rows = document.querySelectorAll('[data-user-id]');
        rows.forEach(row => {
            row.classList.toggle('selected', selectAll);
        });
        
        this.updateBulkActions();
    }

    updateSelectAllCheckbox() {
        const selectAllBtn = document.getElementById('selectAllUsers');
        if (!selectAllBtn) return;
        
        const totalUsers = this.users.length;
        const selectedCount = this.selectedUsers.size;
        
        selectAllBtn.checked = totalUsers > 0 && selectedCount === totalUsers;
        selectAllBtn.indeterminate = selectedCount > 0 && selectedCount < totalUsers;
    }

    updateBulkActions() {
        const bulkContainer = document.getElementById('bulkActions');
        if (!bulkContainer) return;
        
        const selectedCount = this.selectedUsers.size;
        bulkContainer.style.display = selectedCount > 0 ? 'block' : 'none';
        
        const countSpan = document.getElementById('selectedCount');
        if (countSpan) {
            countSpan.textContent = selectedCount;
        }
    }

    async handleBulkAction(action) {
        const selectedIds = Array.from(this.selectedUsers);
        if (selectedIds.length === 0) {
            this.adminPanel.showToast('No hay usuarios seleccionados', 'warning');
            return;
        }

        const actionMessages = {
            activate: 'activar',
            deactivate: 'desactivar',
            delete: 'eliminar',
            export: 'exportar'
        };

        if (action === 'delete') {
            this.adminPanel.showConfirmModal(
                `¿Estás seguro de que deseas eliminar ${selectedIds.length} usuarios? Esta acción no se puede deshacer.`,
                () => this.executeBulkAction(action, selectedIds)
            );
        } else {
            this.executeBulkAction(action, selectedIds);
        }
    }

    async executeBulkAction(action, userIds) {
        try {
            this.adminPanel.showLoading(`Procesando ${userIds.length} usuarios...`);
            
            if (action === 'export') {
                await this.exportSelectedUsers(userIds);
            } else {
                await this.adminPanel.apiCall('/api/admin/users/bulk', {
                    method: 'POST',
                    body: JSON.stringify({
                        action,
                        userIds
                    })
                });
                
                this.loadUsers();
            }
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Operación completada exitosamente', 'success');
            
            // Clear selection
            this.selectedUsers.clear();
            this.updateBulkActions();
            this.updateSelectAllCheckbox();
            
        } catch (error) {
            console.error('Bulk action error:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al procesar la operación', 'error');
        }
    }

    async exportSelectedUsers(userIds) {
        const response = await this.adminPanel.apiCall('/api/admin/users/export', {
            method: 'POST',
            body: JSON.stringify({ userIds })
        });
        
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    getStatusText(status) {
        const statusTexts = {
            active: 'Activo',
            inactive: 'Inactivo',
            suspended: 'Suspendido',
            banned: 'Baneado'
        };
        return statusTexts[status] || status;
    }

    handleSearchResults(results) {
        const userResults = results.filter(result => result.type === 'user');
        
        if (userResults.length === 0) {
            this.adminPanel.showToast('No se encontraron usuarios', 'info');
            return;
        }

        // Filter users to show only matching results
        this.users = this.users.filter(user => 
            userResults.some(result => result.id === user.id)
        );
        
        this.renderUsers();
        this.highlightSearchResults(userResults);
    }

    highlightSearchResults(results) {
        results.forEach(result => {
            const element = document.querySelector(`[data-user-id="${result.id}"]`);
            if (element) {
                element.classList.add('search-highlight');
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        setTimeout(() => {
            document.querySelectorAll('.search-highlight').forEach(el => {
                el.classList.remove('search-highlight');
            });
        }, 3000);
    }

    destroy() {
        // Cleanup any event listeners or resources
        this.selectedUsers.clear();
    }
}

export default Users;