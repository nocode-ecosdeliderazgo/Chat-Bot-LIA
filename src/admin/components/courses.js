// Courses Component
// Handles CRUD operations for courses with rich editor functionality

class Courses {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.courses = [];
        this.currentCourse = null;
        this.filters = {
            status: '',
            category: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 12,
            total: 0
        };
        this.editor = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRichEditor();
    }

    setupEventListeners() {
        // Add course button
        const addCourseBtn = document.getElementById('addCourseBtn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', () => {
                this.showCourseModal();
            });
        }

        // Filter handlers
        const statusFilter = document.getElementById('courseStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.loadCourses();
            });
        }

        const categoryFilter = document.getElementById('courseCategoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.loadCourses();
            });
        }

        const searchInput = document.getElementById('courseSearch');
        if (searchInput) {
            const debouncedSearch = this.adminPanel.debounce((value) => {
                this.filters.search = value;
                this.loadCourses();
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Modal handlers
        this.setupModalHandlers();
    }

    setupModalHandlers() {
        const courseForm = document.getElementById('courseForm');
        if (courseForm) {
            courseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCourse();
            });
        }
    }

    async loadRichEditor() {
        // Load TinyMCE or similar rich text editor
        if (typeof tinymce === 'undefined') {
            await this.loadTinyMCE();
        }
        
        this.initializeEditor();
    }

    async loadTinyMCE() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    initializeEditor() {
        if (typeof tinymce === 'undefined') return;

        tinymce.init({
            selector: '#courseContent',
            height: 400,
            menubar: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
            content_style: 'body { font-family: Inter, sans-serif; font-size: 14px }',
            setup: (editor) => {
                this.editor = editor;
                editor.on('change', () => {
                    editor.save();
                });
            }
        });
    }

    async load() {
        try {
            await this.loadCourses();
        } catch (error) {
            console.error('Error loading courses:', error);
            this.adminPanel.showToast('Error al cargar los cursos', 'error');
        }
    }

    async loadCourses() {
        try {
            this.adminPanel.showLoading('Cargando cursos...');
            
            const params = new URLSearchParams({
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.filters
            });

            const response = await this.adminPanel.apiCall(`/api/admin/courses?${params}`);
            
            this.courses = response.courses;
            this.pagination.total = response.total;
            
            this.renderCourses();
            this.renderPagination();
            
            this.adminPanel.hideLoading();
        } catch (error) {
            console.error('Error loading courses:', error);
            this.adminPanel.hideLoading();
            throw error;
        }
    }

    renderCourses() {
        const container = document.getElementById('coursesGrid');
        if (!container) return;

        if (this.courses.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-graduation-cap"></i>
                    <h3>No hay cursos disponibles</h3>
                    <p>Crea tu primer curso para comenzar</p>
                    <button class="btn btn-primary" onclick="courses.showCourseModal()">
                        <i class="fas fa-plus"></i>
                        Crear Curso
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.courses.map(course => `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-image">
                    ${course.imageUrl ? 
                        `<img src="${course.imageUrl}" alt="${course.title}" />` : 
                        `<i class="fas fa-graduation-cap"></i>`
                    }
                </div>
                <div class="course-content">
                    <h3 class="course-title">${course.title}</h3>
                    <div class="course-meta">
                        <span class="category">${course.category}</span>
                        <span class="difficulty">${course.difficulty}</span>
                        <span class="status status-${course.status}">${this.getStatusText(course.status)}</span>
                    </div>
                    <p class="course-description">${course.description}</p>
                    <div class="course-stats">
                        <span class="students">
                            <i class="fas fa-users"></i>
                            ${course.studentsCount || 0} estudiantes
                        </span>
                        <span class="duration">
                            <i class="fas fa-clock"></i>
                            ${course.duration} min
                        </span>
                    </div>
                    <div class="course-actions">
                        <button class="btn btn-small btn-secondary" onclick="courses.previewCourse('${course.id}')">
                            <i class="fas fa-eye"></i>
                            Vista Previa
                        </button>
                        <button class="btn btn-small btn-primary" onclick="courses.editCourse('${course.id}')">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn btn-small btn-danger" onclick="courses.deleteCourse('${course.id}')">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPagination() {
        const container = document.getElementById('coursesPagination');
        if (!container) return;

        const totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const currentPage = this.pagination.page;
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="courses.changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="courses.changePage(${i})">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="courses.changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = paginationHTML;
    }

    changePage(page) {
        if (page < 1 || page > Math.ceil(this.pagination.total / this.pagination.limit)) return;
        
        this.pagination.page = page;
        this.loadCourses();
    }

    showCourseModal(courseId = null) {
        this.currentCourse = courseId;
        
        const modal = document.getElementById('courseModal');
        const modalTitle = document.getElementById('courseModalTitle');
        const form = document.getElementById('courseForm');
        
        if (courseId) {
            modalTitle.textContent = 'Editar Curso';
            this.loadCourseData(courseId);
        } else {
            modalTitle.textContent = 'Crear Curso';
            form.reset();
            if (this.editor) {
                this.editor.setContent('');
            }
        }
        
        this.renderCourseForm();
        this.adminPanel.showModal('course');
    }

    renderCourseForm() {
        const formBody = document.querySelector('#courseModal .modal-body');
        if (!formBody) return;

        formBody.innerHTML = `
            <form id="courseForm">
                <div class="form-group">
                    <label class="form-label">Título del Curso *</label>
                    <input type="text" class="form-input" id="courseTitle" name="title" required maxlength="100">
                </div>

                <div class="form-group">
                    <label class="form-label">Descripción *</label>
                    <textarea class="form-textarea" id="courseDescription" name="description" required maxlength="500"></textarea>
                </div>

                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Categoría *</label>
                        <select class="form-select" id="courseCategory" name="category" required>
                            <option value="">Seleccionar categoría</option>
                            <option value="programming">Programación</option>
                            <option value="data-science">Ciencia de Datos</option>
                            <option value="design">Diseño</option>
                            <option value="business">Negocios</option>
                            <option value="marketing">Marketing</option>
                            <option value="other">Otros</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Nivel de Dificultad *</label>
                        <select class="form-select" id="courseDifficulty" name="difficulty" required>
                            <option value="">Seleccionar nivel</option>
                            <option value="beginner">Principiante</option>
                            <option value="intermediate">Intermedio</option>
                            <option value="advanced">Avanzado</option>
                            <option value="expert">Experto</option>
                        </select>
                    </div>
                </div>

                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Duración (minutos) *</label>
                        <input type="number" class="form-input" id="courseDuration" name="duration" required min="1" max="10000">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Estado *</label>
                        <select class="form-select" id="courseStatus" name="status" required>
                            <option value="draft">Borrador</option>
                            <option value="published">Publicado</option>
                            <option value="archived">Archivado</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Imagen de Portada</label>
                    <input type="file" class="form-input" id="courseImage" name="image" accept="image/*">
                    <div class="image-preview" id="imagePreview" style="display: none;">
                        <img src="" alt="Preview" style="max-width: 200px; border-radius: 8px;">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Tags (separados por comas)</label>
                    <input type="text" class="form-input" id="courseTags" name="tags" placeholder="javascript, web development, frontend">
                </div>

                <div class="form-group">
                    <label class="form-label">Contenido del Curso *</label>
                    <textarea id="courseContent" name="content" required></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        <input type="checkbox" id="courseIsActive" name="isActive" checked>
                        Curso activo
                    </label>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="adminPanel.closeModal('course')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        ${this.currentCourse ? 'Actualizar' : 'Crear'} Curso
                    </button>
                </div>
            </form>
        `;

        // Setup image preview
        const imageInput = document.getElementById('courseImage');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleImagePreview(e);
            });
        }

        // Reinitialize editor for the new textarea
        setTimeout(() => {
            this.initializeEditor();
        }, 100);
    }

    handleImagePreview(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('imagePreview');
        
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

    async loadCourseData(courseId) {
        try {
            const response = await this.adminPanel.apiCall(`/api/admin/courses/${courseId}`);
            const course = response.course;
            
            // Fill form fields
            document.getElementById('courseTitle').value = course.title || '';
            document.getElementById('courseDescription').value = course.description || '';
            document.getElementById('courseCategory').value = course.category || '';
            document.getElementById('courseDifficulty').value = course.difficulty || '';
            document.getElementById('courseDuration').value = course.duration || '';
            document.getElementById('courseStatus').value = course.status || '';
            document.getElementById('courseTags').value = course.tags ? course.tags.join(', ') : '';
            document.getElementById('courseIsActive').checked = course.isActive !== false;
            
            // Set editor content
            if (this.editor) {
                this.editor.setContent(course.content || '');
            }
            
            // Show image preview if exists
            if (course.imageUrl) {
                const preview = document.getElementById('imagePreview');
                const img = preview.querySelector('img');
                img.src = course.imageUrl;
                preview.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading course data:', error);
            this.adminPanel.showToast('Error al cargar los datos del curso', 'error');
        }
    }

    async saveCourse() {
        try {
            const form = document.getElementById('courseForm');
            const validation = this.adminPanel.validateForm(form);
            
            if (!validation.isValid) {
                validation.errors.forEach(error => {
                    this.adminPanel.showToast(error, 'error');
                });
                return;
            }

            this.adminPanel.showLoading('Guardando curso...');

            const formData = new FormData();
            
            // Get form data
            formData.append('title', document.getElementById('courseTitle').value);
            formData.append('description', document.getElementById('courseDescription').value);
            formData.append('category', document.getElementById('courseCategory').value);
            formData.append('difficulty', document.getElementById('courseDifficulty').value);
            formData.append('duration', document.getElementById('courseDuration').value);
            formData.append('status', document.getElementById('courseStatus').value);
            formData.append('tags', document.getElementById('courseTags').value);
            formData.append('isActive', document.getElementById('courseIsActive').checked);
            
            // Get editor content
            if (this.editor) {
                formData.append('content', this.editor.getContent());
            }
            
            // Handle image upload
            const imageFile = document.getElementById('courseImage').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const url = this.currentCourse ? 
                `/api/admin/courses/${this.currentCourse}` : 
                '/api/admin/courses';
            
            const method = this.currentCourse ? 'PUT' : 'POST';

            await this.adminPanel.apiCall(url, {
                method,
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            this.adminPanel.hideLoading();
            this.adminPanel.closeModal('course');
            this.adminPanel.showToast(
                this.currentCourse ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente', 
                'success'
            );
            
            this.loadCourses();
        } catch (error) {
            console.error('Error saving course:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al guardar el curso', 'error');
        }
    }

    editCourse(courseId) {
        this.showCourseModal(courseId);
    }

    deleteCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        this.adminPanel.showConfirmModal(
            `¿Estás seguro de que deseas eliminar el curso "${course.title}"? Esta acción no se puede deshacer.`,
            () => this.confirmDeleteCourse(courseId)
        );
    }

    async confirmDeleteCourse(courseId) {
        try {
            this.adminPanel.showLoading('Eliminando curso...');
            
            await this.adminPanel.apiCall(`/api/admin/courses/${courseId}`, {
                method: 'DELETE'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Curso eliminado exitosamente', 'success');
            
            this.loadCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al eliminar el curso', 'error');
        }
    }

    async previewCourse(courseId) {
        try {
            const response = await this.adminPanel.apiCall(`/api/admin/courses/${courseId}/preview`);
            
            // Open preview in new window
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(response.html);
            previewWindow.document.close();
        } catch (error) {
            console.error('Error previewing course:', error);
            this.adminPanel.showToast('Error al previsualizar el curso', 'error');
        }
    }

    async duplicateCourse(courseId) {
        try {
            this.adminPanel.showLoading('Duplicando curso...');
            
            await this.adminPanel.apiCall(`/api/admin/courses/${courseId}/duplicate`, {
                method: 'POST'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Curso duplicado exitosamente', 'success');
            
            this.loadCourses();
        } catch (error) {
            console.error('Error duplicating course:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al duplicar el curso', 'error');
        }
    }

    async exportCourses() {
        try {
            this.adminPanel.showLoading('Exportando cursos...');
            
            const response = await this.adminPanel.apiCall('/api/admin/courses/export', {
                method: 'POST'
            });
            
            // Create download link
            const blob = new Blob([response.data], { type: 'application/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `courses-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Cursos exportados exitosamente', 'success');
        } catch (error) {
            console.error('Error exporting courses:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al exportar los cursos', 'error');
        }
    }

    getStatusText(status) {
        const statusTexts = {
            draft: 'Borrador',
            published: 'Publicado',
            archived: 'Archivado'
        };
        return statusTexts[status] || status;
    }

    handleSearchResults(results) {
        const courseResults = results.filter(result => result.type === 'course');
        
        if (courseResults.length === 0) {
            this.adminPanel.showToast('No se encontraron cursos', 'info');
            return;
        }

        // Filter courses to show only matching results
        this.courses = this.courses.filter(course => 
            courseResults.some(result => result.id === course.id)
        );
        
        this.renderCourses();
        this.highlightSearchResults(courseResults);
    }

    highlightSearchResults(results) {
        results.forEach(result => {
            const element = document.querySelector(`[data-course-id="${result.id}"]`);
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

    // Bulk operations
    async bulkOperation(operation, courseIds) {
        try {
            this.adminPanel.showLoading(`Ejecutando operación: ${operation}...`);
            
            await this.adminPanel.apiCall('/api/admin/courses/bulk', {
                method: 'POST',
                body: JSON.stringify({
                    operation,
                    courseIds
                })
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Operación ejecutada exitosamente', 'success');
            
            this.loadCourses();
        } catch (error) {
            console.error('Bulk operation error:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al ejecutar la operación', 'error');
        }
    }

    destroy() {
        // Clean up editor
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }
}

export default Courses;