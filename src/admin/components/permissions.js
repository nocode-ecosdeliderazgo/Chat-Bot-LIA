// Permissions Component
// Handles roles and permissions system management

class Permissions {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.roles = [];
        this.permissions = [];
        this.currentRole = null;
        this.permissionMatrix = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add role button
        const addRoleBtn = document.getElementById('addRoleBtn');
        if (addRoleBtn) {
            addRoleBtn.addEventListener('click', () => {
                this.showRoleModal();
            });
        }

        // Permission matrix handlers
        this.setupPermissionMatrix();
    }

    setupPermissionMatrix() {
        // This will be called after rendering the permission matrix
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('permission-checkbox')) {
                this.handlePermissionChange(e.target);
            }
        });
    }

    async load() {
        try {
            await Promise.all([
                this.loadRoles(),
                this.loadPermissions()
            ]);
            this.renderPermissionsInterface();
        } catch (error) {
            console.error('Error loading permissions:', error);
            this.adminPanel.showToast('Error al cargar los permisos', 'error');
        }
    }

    async loadRoles() {
        try {
            const response = await this.adminPanel.apiCall('/api/admin/roles');
            this.roles = response.roles;
        } catch (error) {
            console.error('Error loading roles:', error);
            throw error;
        }
    }

    async loadPermissions() {
        try {
            const response = await this.adminPanel.apiCall('/api/admin/permissions');
            this.permissions = response.permissions;
            this.permissionMatrix = response.matrix || {};
        } catch (error) {
            console.error('Error loading permissions:', error);
            throw error;
        }
    }

    renderPermissionsInterface() {
        this.renderRolesList();
        this.renderPermissionMatrix();
    }

    renderRolesList() {
        const container = document.getElementById('rolesList');
        if (!container) return;

        if (this.roles.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-shield-alt"></i>
                    <h4>No hay roles definidos</h4>
                    <p>Crea el primer rol para comenzar</p>
                    <button class="btn btn-primary btn-small" onclick="permissions.showRoleModal()">
                        <i class="fas fa-plus"></i>
                        Crear Rol
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.roles.map(role => `
            <div class="role-item ${role.isDefault ? 'default-role' : ''}" data-role-id="${role.id}">
                <div class="role-header">
                    <div class="role-info">
                        <h4 class="role-name">${role.name}</h4>
                        <p class="role-description">${role.description || 'Sin descripción'}</p>
                        ${role.isDefault ? '<span class="default-badge">Por defecto</span>' : ''}
                    </div>
                    <div class="role-stats">
                        <span class="users-count">${role.usersCount || 0} usuarios</span>
                        <span class="permissions-count">${role.permissionsCount || 0} permisos</span>
                    </div>
                </div>
                
                <div class="role-actions">
                    <button class="btn btn-small btn-secondary" onclick="permissions.viewRoleDetails('${role.id}')" title="Ver Detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-small btn-primary" onclick="permissions.editRole('${role.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-info" onclick="permissions.duplicateRole('${role.id}')" title="Duplicar">
                        <i class="fas fa-copy"></i>
                    </button>
                    ${!role.isSystem ? `
                        <button class="btn btn-small btn-danger" onclick="permissions.deleteRole('${role.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderPermissionMatrix() {
        const container = document.getElementById('permissionsList');
        if (!container) return;

        if (this.permissions.length === 0 || this.roles.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-table"></i>
                    <h4>No se puede mostrar la matriz de permisos</h4>
                    <p>Necesitas tener roles y permisos definidos</p>
                </div>
            `;
            return;
        }

        // Group permissions by category
        const permissionsByCategory = this.groupPermissionsByCategory();

        let matrixHTML = `
            <div class="permission-matrix">
                <div class="matrix-header">
                    <div class="permission-label">Permisos</div>
                    ${this.roles.map(role => `
                        <div class="role-header-item">
                            <span class="role-name">${role.name}</span>
                            <span class="role-users">${role.usersCount || 0} usuarios</span>
                        </div>
                    `).join('')}
                </div>
        `;

        Object.keys(permissionsByCategory).forEach(category => {
            matrixHTML += `
                <div class="permission-category">
                    <div class="category-header">
                        <h4>${this.getCategoryDisplayName(category)}</h4>
                    </div>
                    
                    ${permissionsByCategory[category].map(permission => `
                        <div class="permission-row">
                            <div class="permission-info">
                                <div class="permission-name">${permission.displayName}</div>
                                <div class="permission-description">${permission.description || ''}</div>
                            </div>
                            
                            ${this.roles.map(role => `
                                <div class="permission-cell">
                                    <label class="permission-toggle">
                                        <input type="checkbox" 
                                               class="permission-checkbox"
                                               data-role-id="${role.id}"
                                               data-permission-id="${permission.id}"
                                               ${this.hasRolePermission(role.id, permission.id) ? 'checked' : ''}
                                               ${role.isSystem ? 'disabled' : ''}>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            `;
        });

        matrixHTML += '</div>';

        // Add bulk actions
        matrixHTML += `
            <div class="matrix-actions">
                <div class="bulk-actions">
                    <h4>Acciones Masivas</h4>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="permissions.selectAllPermissions()">
                            <i class="fas fa-check-square"></i>
                            Seleccionar Todo
                        </button>
                        <button class="btn btn-secondary" onclick="permissions.clearAllPermissions()">
                            <i class="fas fa-square"></i>
                            Limpiar Todo
                        </button>
                        <button class="btn btn-primary" onclick="permissions.savePermissionMatrix()">
                            <i class="fas fa-save"></i>
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = matrixHTML;
    }

    groupPermissionsByCategory() {
        const grouped = {};
        
        this.permissions.forEach(permission => {
            const category = permission.category || 'general';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(permission);
        });

        return grouped;
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            general: 'General',
            users: 'Usuarios',
            courses: 'Cursos',
            news: 'Noticias',
            dashboard: 'Dashboard',
            settings: 'Configuraciones',
            admin: 'Administración'
        };
        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    hasRolePermission(roleId, permissionId) {
        return this.permissionMatrix[roleId]?.includes(permissionId) || false;
    }

    handlePermissionChange(checkbox) {
        const roleId = checkbox.dataset.roleId;
        const permissionId = checkbox.dataset.permissionId;
        const isGranted = checkbox.checked;

        if (!this.permissionMatrix[roleId]) {
            this.permissionMatrix[roleId] = [];
        }

        if (isGranted) {
            if (!this.permissionMatrix[roleId].includes(permissionId)) {
                this.permissionMatrix[roleId].push(permissionId);
            }
        } else {
            this.permissionMatrix[roleId] = this.permissionMatrix[roleId].filter(id => id !== permissionId);
        }

        // Visual feedback
        checkbox.closest('.permission-row').classList.add('modified');
        
        // Show save indicator
        this.showSaveIndicator();
    }

    showSaveIndicator() {
        const saveBtn = document.querySelector('.matrix-actions .btn-primary');
        if (saveBtn) {
            saveBtn.classList.add('has-changes');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios *';
        }
    }

    async savePermissionMatrix() {
        try {
            this.adminPanel.showLoading('Guardando permisos...');
            
            await this.adminPanel.apiCall('/api/admin/permissions/matrix', {
                method: 'PUT',
                body: JSON.stringify({
                    matrix: this.permissionMatrix
                })
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Permisos guardados exitosamente', 'success');
            
            // Remove visual indicators
            document.querySelectorAll('.permission-row.modified').forEach(row => {
                row.classList.remove('modified');
            });
            
            const saveBtn = document.querySelector('.matrix-actions .btn-primary');
            if (saveBtn) {
                saveBtn.classList.remove('has-changes');
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            }
            
            // Reload data
            this.loadRoles();
            
        } catch (error) {
            console.error('Error saving permissions:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al guardar los permisos', 'error');
        }
    }

    selectAllPermissions() {
        const checkboxes = document.querySelectorAll('.permission-checkbox:not([disabled])');
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                checkbox.checked = true;
                this.handlePermissionChange(checkbox);
            }
        });
    }

    clearAllPermissions() {
        const checkboxes = document.querySelectorAll('.permission-checkbox:not([disabled])');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkbox.checked = false;
                this.handlePermissionChange(checkbox);
            }
        });
    }

    showRoleModal(roleId = null) {
        this.currentRole = roleId;
        
        const modalHTML = `
            <div class="role-modal">
                <div class="modal-header">
                    <h2>${roleId ? 'Editar Rol' : 'Crear Rol'}</h2>
                    <button class="modal-close" onclick="permissions.closeRoleModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="roleForm">
                        <div class="form-group">
                            <label class="form-label">Nombre del Rol *</label>
                            <input type="text" class="form-input" id="roleName" name="name" required maxlength="50">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Descripción</label>
                            <textarea class="form-textarea" id="roleDescription" name="description" rows="3" maxlength="200"></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Color del Rol</label>
                            <input type="color" class="form-input" id="roleColor" name="color" value="#44E5FF">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Configuración</label>
                            <div class="checkbox-group">
                                <label class="form-label">
                                    <input type="checkbox" id="roleIsDefault" name="isDefault">
                                    Rol por defecto para nuevos usuarios
                                </label>
                                <label class="form-label">
                                    <input type="checkbox" id="roleIsActive" name="isActive" checked>
                                    Rol activo
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Permisos Base</label>
                            <div class="permissions-checklist" id="rolePermissions">
                                <!-- Permissions will be loaded here -->
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="permissions.closeRoleModal()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                ${roleId ? 'Actualizar' : 'Crear'} Rol
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = modalHTML;
        document.body.appendChild(modalOverlay);

        // Show modal
        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);

        // Load role data if editing
        if (roleId) {
            this.loadRoleData(roleId);
        }

        // Render permissions checklist
        this.renderRolePermissions();

        // Setup form handler
        const form = document.getElementById('roleForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRole();
        });
    }

    renderRolePermissions() {
        const container = document.getElementById('rolePermissions');
        if (!container) return;

        const permissionsByCategory = this.groupPermissionsByCategory();
        
        let html = '';
        Object.keys(permissionsByCategory).forEach(category => {
            html += `
                <div class="permission-category-group">
                    <h5>${this.getCategoryDisplayName(category)}</h5>
                    <div class="permissions-grid">
                        ${permissionsByCategory[category].map(permission => `
                            <label class="permission-item">
                                <input type="checkbox" 
                                       class="role-permission-checkbox"
                                       value="${permission.id}"
                                       data-category="${category}">
                                <span class="permission-label">
                                    <strong>${permission.displayName}</strong>
                                    ${permission.description ? `<small>${permission.description}</small>` : ''}
                                </span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    async loadRoleData(roleId) {
        try {
            const response = await this.adminPanel.apiCall(`/api/admin/roles/${roleId}`);
            const role = response.role;
            
            document.getElementById('roleName').value = role.name || '';
            document.getElementById('roleDescription').value = role.description || '';
            document.getElementById('roleColor').value = role.color || '#44E5FF';
            document.getElementById('roleIsDefault').checked = role.isDefault || false;
            document.getElementById('roleIsActive').checked = role.isActive !== false;
            
            // Check permissions
            const permissionCheckboxes = document.querySelectorAll('.role-permission-checkbox');
            permissionCheckboxes.forEach(checkbox => {
                checkbox.checked = role.permissions?.includes(checkbox.value) || false;
            });
            
        } catch (error) {
            console.error('Error loading role data:', error);
            this.adminPanel.showToast('Error al cargar los datos del rol', 'error');
        }
    }

    async saveRole() {
        try {
            const form = document.getElementById('roleForm');
            const validation = this.adminPanel.validateForm(form);
            
            if (!validation.isValid) {
                validation.errors.forEach(error => {
                    this.adminPanel.showToast(error, 'error');
                });
                return;
            }

            this.adminPanel.showLoading('Guardando rol...');

            // Get selected permissions
            const selectedPermissions = Array.from(document.querySelectorAll('.role-permission-checkbox:checked'))
                .map(checkbox => checkbox.value);

            const roleData = {
                name: document.getElementById('roleName').value,
                description: document.getElementById('roleDescription').value,
                color: document.getElementById('roleColor').value,
                isDefault: document.getElementById('roleIsDefault').checked,
                isActive: document.getElementById('roleIsActive').checked,
                permissions: selectedPermissions
            };

            const url = this.currentRole ? 
                `/api/admin/roles/${this.currentRole}` : 
                '/api/admin/roles';
            
            const method = this.currentRole ? 'PUT' : 'POST';

            await this.adminPanel.apiCall(url, {
                method,
                body: JSON.stringify(roleData)
            });

            this.adminPanel.hideLoading();
            this.closeRoleModal();
            this.adminPanel.showToast(
                this.currentRole ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente', 
                'success'
            );
            
            this.load();
        } catch (error) {
            console.error('Error saving role:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al guardar el rol', 'error');
        }
    }

    closeRoleModal() {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
            }, 300);
        }
    }

    editRole(roleId) {
        this.showRoleModal(roleId);
    }

    deleteRole(roleId) {
        const role = this.roles.find(r => r.id === roleId);
        if (!role) return;

        if (role.usersCount > 0) {
            this.adminPanel.showToast('No se puede eliminar un rol que tiene usuarios asignados', 'error');
            return;
        }

        this.adminPanel.showConfirmModal(
            `¿Estás seguro de que deseas eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`,
            () => this.confirmDeleteRole(roleId)
        );
    }

    async confirmDeleteRole(roleId) {
        try {
            this.adminPanel.showLoading('Eliminando rol...');
            
            await this.adminPanel.apiCall(`/api/admin/roles/${roleId}`, {
                method: 'DELETE'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Rol eliminado exitosamente', 'success');
            
            this.load();
        } catch (error) {
            console.error('Error deleting role:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al eliminar el rol', 'error');
        }
    }

    async duplicateRole(roleId) {
        try {
            this.adminPanel.showLoading('Duplicando rol...');
            
            await this.adminPanel.apiCall(`/api/admin/roles/${roleId}/duplicate`, {
                method: 'POST'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Rol duplicado exitosamente', 'success');
            
            this.load();
        } catch (error) {
            console.error('Error duplicating role:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al duplicar el rol', 'error');
        }
    }

    async viewRoleDetails(roleId) {
        try {
            const response = await this.adminPanel.apiCall(`/api/admin/roles/${roleId}/details`);
            this.showRoleDetailsModal(response.role);
        } catch (error) {
            console.error('Error loading role details:', error);
            this.adminPanel.showToast('Error al cargar los detalles del rol', 'error');
        }
    }

    showRoleDetailsModal(role) {
        const modalHTML = `
            <div class="role-details-modal">
                <div class="modal-header">
                    <h2>Detalles del Rol: ${role.name}</h2>
                    <button class="modal-close" onclick="permissions.closeRoleDetailsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="role-info-grid">
                        <div class="info-section">
                            <h4>Información General</h4>
                            <div class="info-item">
                                <strong>Nombre:</strong> ${role.name}
                            </div>
                            <div class="info-item">
                                <strong>Descripción:</strong> ${role.description || 'Sin descripción'}
                            </div>
                            <div class="info-item">
                                <strong>Estado:</strong> 
                                <span class="status-badge status-${role.isActive ? 'active' : 'inactive'}">
                                    ${role.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div class="info-item">
                                <strong>Por defecto:</strong> ${role.isDefault ? 'Sí' : 'No'}
                            </div>
                            <div class="info-item">
                                <strong>Usuarios asignados:</strong> ${role.usersCount || 0}
                            </div>
                        </div>

                        <div class="permissions-section">
                            <h4>Permisos Asignados (${role.permissions?.length || 0})</h4>
                            <div class="permissions-list">
                                ${role.permissions?.map(permission => `
                                    <div class="permission-item">
                                        <i class="fas fa-check-circle"></i>
                                        <span>${permission.displayName}</span>
                                    </div>
                                `).join('') || '<p>No hay permisos asignados</p>'}
                            </div>
                        </div>

                        <div class="users-section">
                            <h4>Usuarios con este Rol</h4>
                            <div class="users-list">
                                ${role.users?.map(user => `
                                    <div class="user-item">
                                        <div class="user-avatar">
                                            ${user.avatar ? 
                                                `<img src="${user.avatar}" alt="${user.name}">` : 
                                                `<div class="avatar-placeholder">${user.name.charAt(0)}</div>`
                                            }
                                        </div>
                                        <div class="user-info">
                                            <div class="user-name">${user.name}</div>
                                            <div class="user-email">${user.email}</div>
                                        </div>
                                    </div>
                                `).join('') || '<p>No hay usuarios con este rol</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create and show modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay role-details-overlay';
        modalOverlay.innerHTML = modalHTML;
        document.body.appendChild(modalOverlay);

        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);
    }

    closeRoleDetailsModal() {
        const modalOverlay = document.querySelector('.role-details-overlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
            }, 300);
        }
    }

    // Permission audit and management
    async auditPermissions() {
        try {
            this.adminPanel.showLoading('Ejecutando auditoría de permisos...');
            
            const response = await this.adminPanel.apiCall('/api/admin/permissions/audit');
            this.showAuditResults(response.audit);
            
            this.adminPanel.hideLoading();
        } catch (error) {
            console.error('Error running permission audit:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al ejecutar la auditoría', 'error');
        }
    }

    showAuditResults(auditResults) {
        // Implementation for showing audit results
        console.log('Audit Results:', auditResults);
        this.adminPanel.showToast('Auditoría completada', 'success');
    }

    // Import/Export functionality
    async exportRolesAndPermissions() {
        try {
            this.adminPanel.showLoading('Exportando roles y permisos...');
            
            const response = await this.adminPanel.apiCall('/api/admin/permissions/export');
            
            // Create download link
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `roles-permissions-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Datos exportados exitosamente', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al exportar los datos', 'error');
        }
    }

    handleSearchResults(results) {
        const permissionResults = results.filter(result => 
            result.type === 'role' || result.type === 'permission'
        );
        
        if (permissionResults.length === 0) {
            this.adminPanel.showToast('No se encontraron roles o permisos', 'info');
            return;
        }

        // Highlight matching roles
        permissionResults.forEach(result => {
            if (result.type === 'role') {
                const element = document.querySelector(`[data-role-id="${result.id}"]`);
                if (element) {
                    element.classList.add('search-highlight');
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
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
        this.permissionMatrix = {};
        this.roles = [];
        this.permissions = [];
    }
}

export default Permissions;