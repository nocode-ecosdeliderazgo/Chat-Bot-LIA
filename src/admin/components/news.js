// News Component
// Handles CRUD operations for news management

class News {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.news = [];
        this.currentNews = null;
        this.filters = {
            status: '',
            category: '',
            author: '',
            search: ''
        };
        this.pagination = {
            page: 1,
            limit: 10,
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
        // Add news button
        const addNewsBtn = document.getElementById('addNewsBtn');
        if (addNewsBtn) {
            addNewsBtn.addEventListener('click', () => {
                this.showNewsModal();
            });
        }

        // Filter handlers
        this.setupFilters();

        // Modal handlers
        this.setupModalHandlers();
    }

    setupFilters() {
        const filters = ['status', 'category', 'author'];
        
        filters.forEach(filterType => {
            const element = document.getElementById(`news${filterType.charAt(0).toUpperCase() + filterType.slice(1)}Filter`);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.filters[filterType] = e.target.value;
                    this.pagination.page = 1;
                    this.loadNews();
                });
            }
        });

        // Search input
        const searchInput = document.getElementById('newsSearch');
        if (searchInput) {
            const debouncedSearch = this.adminPanel.debounce((value) => {
                this.filters.search = value;
                this.pagination.page = 1;
                this.loadNews();
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    setupModalHandlers() {
        const newsForm = document.getElementById('newsForm');
        if (newsForm) {
            newsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNews();
            });
        }
    }

    async loadRichEditor() {
        // Load TinyMCE for rich text editing
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
            selector: '#newsContent',
            height: 500,
            menubar: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | removeformat | help',
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
            await this.loadNews();
        } catch (error) {
            console.error('Error loading news:', error);
            this.adminPanel.showToast('Error al cargar las noticias', 'error');
        }
    }

    async loadNews() {
        try {
            this.adminPanel.showLoading('Cargando noticias...');
            
            const params = new URLSearchParams({
                page: this.pagination.page,
                limit: this.pagination.limit,
                ...this.filters
            });

            const response = await this.adminPanel.apiCall(`/api/admin/news?${params}`);
            
            this.news = response.news;
            this.pagination.total = response.total;
            
            this.renderNews();
            this.renderPagination();
            
            this.adminPanel.hideLoading();
        } catch (error) {
            console.error('Error loading news:', error);
            this.adminPanel.hideLoading();
            throw error;
        }
    }

    renderNews() {
        const tableBody = document.getElementById('newsTableBody');
        if (!tableBody) return;

        if (this.news.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="no-data">
                            <i class="fas fa-newspaper"></i>
                            <h3>No hay noticias disponibles</h3>
                            <p>Crea tu primera noticia para comenzar</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.news.map(article => `
            <tr data-news-id="${article.id}">
                <td>
                    <div class="news-title-cell">
                        <div class="news-title">${article.title}</div>
                        ${article.featured ? '<span class="featured-badge">Destacada</span>' : ''}
                    </div>
                </td>
                <td>
                    <div class="author-cell">
                        <div class="author-name">${article.author.name}</div>
                        <div class="author-email">${article.author.email}</div>
                    </div>
                </td>
                <td>
                    <span class="category-badge">${article.category}</span>
                </td>
                <td>
                    <span class="status-badge status-${article.status}">
                        ${this.getStatusText(article.status)}
                    </span>
                </td>
                <td>
                    <div class="date-cell">
                        <div class="publish-date">${this.adminPanel.formatDate(article.publishedAt || article.createdAt)}</div>
                        <div class="last-updated">Actualizada: ${this.adminPanel.formatDate(article.updatedAt)}</div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-secondary" onclick="news.previewNews('${article.id}')" title="Vista Previa">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-small btn-primary" onclick="news.editNews('${article.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="news.deleteNews('${article.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPagination() {
        const container = document.getElementById('newsPagination');
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
                    onclick="news.changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                            onclick="news.changePage(${i})">
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
                    onclick="news.changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = paginationHTML;
    }

    changePage(page) {
        if (page < 1 || page > Math.ceil(this.pagination.total / this.pagination.limit)) return;
        
        this.pagination.page = page;
        this.loadNews();
    }

    showNewsModal(newsId = null) {
        this.currentNews = newsId;
        
        const modal = document.getElementById('newsModal');
        const modalTitle = document.getElementById('newsModalTitle');
        const form = document.getElementById('newsForm');
        
        if (newsId) {
            modalTitle.textContent = 'Editar Noticia';
            this.loadNewsData(newsId);
        } else {
            modalTitle.textContent = 'Crear Noticia';
            form.reset();
            if (this.editor) {
                this.editor.setContent('');
            }
        }
        
        this.renderNewsForm();
        this.adminPanel.showModal('news');
    }

    renderNewsForm() {
        const formBody = document.querySelector('#newsModal .modal-body');
        if (!formBody) return;

        formBody.innerHTML = `
            <form id="newsForm">
                <div class="form-group">
                    <label class="form-label">Título de la Noticia *</label>
                    <input type="text" class="form-input" id="newsTitle" name="title" required maxlength="150">
                </div>

                <div class="form-group">
                    <label class="form-label">Resumen *</label>
                    <textarea class="form-textarea" id="newsSummary" name="summary" required maxlength="300" placeholder="Breve descripción de la noticia"></textarea>
                </div>

                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Categoría *</label>
                        <select class="form-select" id="newsCategory" name="category" required>
                            <option value="">Seleccionar categoría</option>
                            <option value="general">General</option>
                            <option value="technology">Tecnología</option>
                            <option value="education">Educación</option>
                            <option value="business">Negocios</option>
                            <option value="announcements">Anuncios</option>
                            <option value="updates">Actualizaciones</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Estado *</label>
                        <select class="form-select" id="newsStatus" name="status" required>
                            <option value="draft">Borrador</option>
                            <option value="published">Publicado</option>
                            <option value="archived">Archivado</option>
                            <option value="scheduled">Programado</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Imagen Destacada</label>
                    <input type="file" class="form-input" id="newsImage" name="image" accept="image/*">
                    <div class="image-preview" id="newsImagePreview" style="display: none;">
                        <img src="" alt="Preview" style="max-width: 200px; border-radius: 8px;">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Tags (separados por comas)</label>
                    <input type="text" class="form-input" id="newsTags" name="tags" placeholder="tecnología, educación, innovación">
                </div>

                <div class="form-group">
                    <label class="form-label">Fecha de Publicación</label>
                    <input type="datetime-local" class="form-input" id="newsPublishDate" name="publishDate">
                    <small class="form-help">Si no se especifica, se publicará inmediatamente</small>
                </div>

                <div class="form-group">
                    <label class="form-label">Contenido de la Noticia *</label>
                    <textarea id="newsContent" name="content" required></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Meta Descripción (SEO)</label>
                    <textarea class="form-textarea" id="newsMetaDescription" name="metaDescription" maxlength="160" placeholder="Descripción para motores de búsqueda"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Configuración</label>
                    <div class="checkbox-group">
                        <label class="form-label">
                            <input type="checkbox" id="newsFeatured" name="featured">
                            Noticia destacada
                        </label>
                        <label class="form-label">
                            <input type="checkbox" id="newsComments" name="allowComments" checked>
                            Permitir comentarios
                        </label>
                        <label class="form-label">
                            <input type="checkbox" id="newsNotifications" name="sendNotifications" checked>
                            Enviar notificaciones
                        </label>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="adminPanel.closeModal('news')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        ${this.currentNews ? 'Actualizar' : 'Crear'} Noticia
                    </button>
                </div>
            </form>
        `;

        // Setup image preview
        const imageInput = document.getElementById('newsImage');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleImagePreview(e);
            });
        }

        // Reinitialize editor
        setTimeout(() => {
            this.initializeEditor();
        }, 100);
    }

    handleImagePreview(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('newsImagePreview');
        
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

    async loadNewsData(newsId) {
        try {
            const response = await this.adminPanel.apiCall(`/api/admin/news/${newsId}`);
            const article = response.article;
            
            // Fill form fields
            document.getElementById('newsTitle').value = article.title || '';
            document.getElementById('newsSummary').value = article.summary || '';
            document.getElementById('newsCategory').value = article.category || '';
            document.getElementById('newsStatus').value = article.status || '';
            document.getElementById('newsTags').value = article.tags ? article.tags.join(', ') : '';
            document.getElementById('newsMetaDescription').value = article.metaDescription || '';
            document.getElementById('newsFeatured').checked = article.featured || false;
            document.getElementById('newsComments').checked = article.allowComments !== false;
            document.getElementById('newsNotifications').checked = article.sendNotifications !== false;
            
            // Set publish date if exists
            if (article.publishedAt) {
                const date = new Date(article.publishedAt);
                document.getElementById('newsPublishDate').value = date.toISOString().slice(0, 16);
            }
            
            // Set editor content
            if (this.editor) {
                this.editor.setContent(article.content || '');
            }
            
            // Show image preview if exists
            if (article.imageUrl) {
                const preview = document.getElementById('newsImagePreview');
                const img = preview.querySelector('img');
                img.src = article.imageUrl;
                preview.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading news data:', error);
            this.adminPanel.showToast('Error al cargar los datos de la noticia', 'error');
        }
    }

    async saveNews() {
        try {
            const form = document.getElementById('newsForm');
            const validation = this.adminPanel.validateForm(form);
            
            if (!validation.isValid) {
                validation.errors.forEach(error => {
                    this.adminPanel.showToast(error, 'error');
                });
                return;
            }

            this.adminPanel.showLoading('Guardando noticia...');

            const formData = new FormData();
            
            // Get form data
            formData.append('title', document.getElementById('newsTitle').value);
            formData.append('summary', document.getElementById('newsSummary').value);
            formData.append('category', document.getElementById('newsCategory').value);
            formData.append('status', document.getElementById('newsStatus').value);
            formData.append('tags', document.getElementById('newsTags').value);
            formData.append('metaDescription', document.getElementById('newsMetaDescription').value);
            formData.append('featured', document.getElementById('newsFeatured').checked);
            formData.append('allowComments', document.getElementById('newsComments').checked);
            formData.append('sendNotifications', document.getElementById('newsNotifications').checked);
            
            const publishDate = document.getElementById('newsPublishDate').value;
            if (publishDate) {
                formData.append('publishDate', publishDate);
            }
            
            // Get editor content
            if (this.editor) {
                formData.append('content', this.editor.getContent());
            }
            
            // Handle image upload
            const imageFile = document.getElementById('newsImage').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const url = this.currentNews ? 
                `/api/admin/news/${this.currentNews}` : 
                '/api/admin/news';
            
            const method = this.currentNews ? 'PUT' : 'POST';

            await this.adminPanel.apiCall(url, {
                method,
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            this.adminPanel.hideLoading();
            this.adminPanel.closeModal('news');
            this.adminPanel.showToast(
                this.currentNews ? 'Noticia actualizada exitosamente' : 'Noticia creada exitosamente', 
                'success'
            );
            
            this.loadNews();
        } catch (error) {
            console.error('Error saving news:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al guardar la noticia', 'error');
        }
    }

    editNews(newsId) {
        this.showNewsModal(newsId);
    }

    deleteNews(newsId) {
        const article = this.news.find(n => n.id === newsId);
        if (!article) return;

        this.adminPanel.showConfirmModal(
            `¿Estás seguro de que deseas eliminar la noticia "${article.title}"? Esta acción no se puede deshacer.`,
            () => this.confirmDeleteNews(newsId)
        );
    }

    async confirmDeleteNews(newsId) {
        try {
            this.adminPanel.showLoading('Eliminando noticia...');
            
            await this.adminPanel.apiCall(`/api/admin/news/${newsId}`, {
                method: 'DELETE'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Noticia eliminada exitosamente', 'success');
            
            this.loadNews();
        } catch (error) {
            console.error('Error deleting news:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al eliminar la noticia', 'error');
        }
    }

    async previewNews(newsId) {
        try {
            const response = await this.adminPanel.apiCall(`/api/admin/news/${newsId}/preview`);
            
            // Open preview in new window
            const previewWindow = window.open('', '_blank', 'width=800,height=600');
            previewWindow.document.write(response.html);
            previewWindow.document.close();
        } catch (error) {
            console.error('Error previewing news:', error);
            this.adminPanel.showToast('Error al previsualizar la noticia', 'error');
        }
    }

    async publishNews(newsId) {
        try {
            this.adminPanel.showLoading('Publicando noticia...');
            
            await this.adminPanel.apiCall(`/api/admin/news/${newsId}/publish`, {
                method: 'POST'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Noticia publicada exitosamente', 'success');
            
            this.loadNews();
        } catch (error) {
            console.error('Error publishing news:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al publicar la noticia', 'error');
        }
    }

    async duplicateNews(newsId) {
        try {
            this.adminPanel.showLoading('Duplicando noticia...');
            
            await this.adminPanel.apiCall(`/api/admin/news/${newsId}/duplicate`, {
                method: 'POST'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Noticia duplicada exitosamente', 'success');
            
            this.loadNews();
        } catch (error) {
            console.error('Error duplicating news:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al duplicar la noticia', 'error');
        }
    }

    async exportNews() {
        try {
            this.adminPanel.showLoading('Exportando noticias...');
            
            const response = await this.adminPanel.apiCall('/api/admin/news/export', {
                method: 'POST'
            });
            
            // Create download link
            const blob = new Blob([response.data], { type: 'application/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `news-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Noticias exportadas exitosamente', 'success');
        } catch (error) {
            console.error('Error exporting news:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al exportar las noticias', 'error');
        }
    }

    getStatusText(status) {
        const statusTexts = {
            draft: 'Borrador',
            published: 'Publicado',
            archived: 'Archivado',
            scheduled: 'Programado'
        };
        return statusTexts[status] || status;
    }

    handleSearchResults(results) {
        const newsResults = results.filter(result => result.type === 'news');
        
        if (newsResults.length === 0) {
            this.adminPanel.showToast('No se encontraron noticias', 'info');
            return;
        }

        // Filter news to show only matching results
        this.news = this.news.filter(article => 
            newsResults.some(result => result.id === article.id)
        );
        
        this.renderNews();
        this.highlightSearchResults(newsResults);
    }

    highlightSearchResults(results) {
        results.forEach(result => {
            const element = document.querySelector(`[data-news-id="${result.id}"]`);
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
    async bulkOperation(operation, newsIds) {
        try {
            this.adminPanel.showLoading(`Ejecutando operación: ${operation}...`);
            
            await this.adminPanel.apiCall('/api/admin/news/bulk', {
                method: 'POST',
                body: JSON.stringify({
                    operation,
                    newsIds
                })
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Operación ejecutada exitosamente', 'success');
            
            this.loadNews();
        } catch (error) {
            console.error('Bulk operation error:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al ejecutar la operación', 'error');
        }
    }

    // Social sharing
    async shareToSocial(newsId, platform) {
        try {
            this.adminPanel.showLoading('Compartiendo en redes sociales...');
            
            await this.adminPanel.apiCall(`/api/admin/news/${newsId}/share`, {
                method: 'POST',
                body: JSON.stringify({ platform })
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Noticia compartida exitosamente', 'success');
        } catch (error) {
            console.error('Error sharing news:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al compartir la noticia', 'error');
        }
    }

    // Analytics
    async getNewsAnalytics(newsId) {
        try {
            const response = await this.adminPanel.apiCall(`/api/admin/news/${newsId}/analytics`);
            this.showAnalyticsModal(response.analytics);
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.adminPanel.showToast('Error al cargar las métricas', 'error');
        }
    }

    showAnalyticsModal(analytics) {
        // Implementation for showing analytics modal
        const modalHTML = `
            <div class="analytics-modal">
                <h3>Métricas de la Noticia</h3>
                <div class="analytics-grid">
                    <div class="metric">
                        <div class="metric-value">${analytics.views}</div>
                        <div class="metric-label">Visualizaciones</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${analytics.shares}</div>
                        <div class="metric-label">Compartidos</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${analytics.comments}</div>
                        <div class="metric-label">Comentarios</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${analytics.readTime}min</div>
                        <div class="metric-label">Tiempo de Lectura</div>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal with analytics data
        this.adminPanel.showToast('Métricas cargadas', 'info');
    }

    destroy() {
        // Clean up editor
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }
}

export default News;