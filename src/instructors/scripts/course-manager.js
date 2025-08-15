/* ===== GESTIÓN DE CURSOS ===== */

class CourseManager {
    constructor() {
        this.currentCourse = null;
        this.currentModule = null;
        this.courses = [];
        this.modules = [];
        this.activities = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCourses();
        this.initChatIA();
    }

    bindEvents() {
        // Botones principales
        document.getElementById('createCourseBtn').addEventListener('click', () => this.showCourseForm());
        document.getElementById('viewCoursesBtn').addEventListener('click', () => this.showAdminPanel());
        document.getElementById('addCourseBtn').addEventListener('click', () => this.showCourseForm());
        document.getElementById('closeFormBtn').addEventListener('click', () => this.hideCourseForm());
        
        // Formulario de curso
        document.getElementById('courseForm').addEventListener('submit', (e) => this.saveCourse(e));
        document.getElementById('cancelCourseBtn').addEventListener('click', () => this.hideCourseForm());
        
        // Panel de administración
        document.getElementById('adminSearch').addEventListener('input', (e) => this.searchCourses(e.target.value));
        document.getElementById('statusFilter').addEventListener('change', () => this.filterCourses());
        document.getElementById('modalityFilter').addEventListener('change', () => this.filterCourses());
        document.getElementById('sortBy').addEventListener('change', () => this.sortCourses());
        
        // Chat IA
        document.getElementById('sendIaBtn').addEventListener('click', () => this.sendIAMessage());
        document.getElementById('iaInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendIAMessage();
            }
        });

        // Navegación
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfile());
    }

    async loadCourses() {
        try {
            // Simular carga de cursos desde API
        this.courses = [
            {
                    id_ai_courses: '1',
                    name: 'Curso de JavaScript Avanzado',
                    price: '99.99',
                currency: 'USD',
                    modality: 'async',
                status: 'published',
                session_count: 12,
                    short_description: 'Aprende JavaScript desde cero hasta nivel avanzado',
                    created_at: '2024-01-15'
                },
                {
                    id_ai_courses: '2',
                    name: 'React para Principiantes',
                    price: '149.99',
                currency: 'USD',
                    modality: 'mixed',
                status: 'draft',
                    session_count: 8,
                    short_description: 'Introducción completa a React y sus conceptos fundamentales',
                    created_at: '2024-01-20'
                },
                {
                    id_ai_courses: '3',
                    name: 'Node.js Backend Development',
                    price: '199.99',
                currency: 'USD',
                modality: 'sync',
                    status: 'published',
                    session_count: 15,
                    short_description: 'Desarrollo de APIs y aplicaciones backend con Node.js',
                    created_at: '2024-01-25'
                }
            ];
            
            this.renderCoursesTable();
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showNotification('Error al cargar cursos', 'error');
        }
    }

    renderCoursesTable() {
        const tbody = document.getElementById('coursesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="course-name">
                        <strong>${course.name}</strong>
                        <p class="course-description">${course.short_description}</p>
                    </div>
                </td>
                <td>${course.currency} ${course.price}</td>
                <td>
                    <span class="modality-badge ${course.modality}">
                        ${this.getModalityText(course.modality)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${course.status}">
                        ${this.getStatusText(course.status)}
                    </span>
                </td>
                <td>${course.session_count || 0}</td>
                <td>${new Date(course.created_at).toLocaleDateString()}</td>
                <td>
                    <div class="course-actions">
                        <button class="action-btn" onclick="courseManager.editCourse('${course.id_ai_courses}')" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="action-btn" onclick="courseManager.manageModules('${course.id_ai_courses}')" title="Módulos">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 10V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V10C3.1 10 4 10.9 4 12C4 13.1 3.1 14 2 14V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V14C20.9 14 20 13.1 20 12C20 10.9 20.9 10 22 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6 6H18V10H6V6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6 14H18V18H6V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="action-btn" onclick="courseManager.previewCourse('${course.id_ai_courses}')" title="Vista Previa">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="action-btn" onclick="courseManager.duplicateCourse('${course.id_ai_courses}')" title="Duplicar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" onclick="courseManager.deleteCourse('${course.id_ai_courses}')" title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                    </button>
                </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    searchCourses(query) {
        // Implementar búsqueda de cursos
        console.log('Buscando cursos:', query);
        // Filtrar cursos basado en la consulta
        const filteredCourses = this.courses.filter(course =>
            course.name.toLowerCase().includes(query.toLowerCase()) ||
            course.short_description.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderFilteredCourses(filteredCourses);
    }

    renderFilteredCourses(courses) {
        const tbody = document.getElementById('coursesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        courses.forEach(course => {
            // Mismo código de renderizado que renderCoursesTable
            // ... (código duplicado para simplicidad)
        });
    }

    filterCourses() {
        // Implementar filtrado de cursos
        console.log('Filtrando cursos');
        const statusFilter = document.getElementById('statusFilter').value;
        const modalityFilter = document.getElementById('modalityFilter').value;
        
        let filteredCourses = this.courses;
        
        if (statusFilter) {
            filteredCourses = filteredCourses.filter(course => course.status === statusFilter);
        }
        
        if (modalityFilter) {
            filteredCourses = filteredCourses.filter(course => course.modality === modalityFilter);
        }
        
        this.renderFilteredCourses(filteredCourses);
    }

    sortCourses() {
        // Implementar ordenamiento de cursos
        console.log('Ordenando cursos');
        const sortBy = document.getElementById('sortBy').value;
        
        const sortedCourses = [...this.courses].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'created_at':
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });
        
        this.renderFilteredCourses(sortedCourses);
    }

    showCourseForm(courseId = null) {
        const formSection = document.getElementById('courseFormSection');
        const formTitle = document.getElementById('formTitle');
        
        if (courseId) {
            this.currentCourse = this.courses.find(c => c.id_ai_courses === courseId);
            formTitle.textContent = 'Editar Curso';
            this.populateForm(this.currentCourse);
        } else {
            this.currentCourse = null;
            formTitle.textContent = 'Crear Nuevo Curso';
            this.clearForm();
        }
        
        formSection.style.display = 'flex';
        document.getElementById('courseName').focus();
    }

    hideCourseForm() {
        document.getElementById('courseFormSection').style.display = 'none';
        this.currentCourse = null;
    }

    showAdminPanel() {
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('mainContent').style.display = 'none';
    }

    async saveCourse(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const courseData = Object.fromEntries(formData.entries());
        
        try {
            // Simular guardado en API
            console.log('Guardando curso:', courseData);
                
                if (this.currentCourse) {
                    // Actualizar curso existente
                Object.assign(this.currentCourse, courseData);
                } else {
                // Crear nuevo curso
                const newCourse = {
                    id_ai_courses: Date.now().toString(),
                    ...courseData,
                    created_at: new Date().toISOString()
                };
                this.courses.push(newCourse);
            }
            
            this.showNotification('Curso guardado exitosamente', 'success');
            this.hideCourseForm();
            this.renderCoursesTable();
        } catch (error) {
            console.error('Error saving course:', error);
            this.showNotification('Error al guardar el curso', 'error');
        }
    }

    async deleteCourse(courseId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) {
            return;
        }
        
        try {
            // Simular eliminación en API
            console.log('Eliminando curso:', courseId);
            
            this.courses = this.courses.filter(course => course.id_ai_courses !== courseId);
            
                this.showNotification('Curso eliminado exitosamente', 'success');
            this.renderCoursesTable();
        } catch (error) {
            console.error('Error deleting course:', error);
            this.showNotification('Error al eliminar el curso', 'error');
        }
    }

    editCourse(courseId) {
        this.showCourseForm(courseId);
    }

    manageModules(courseId) {
        const course = this.courses.find(c => c.id_ai_courses === courseId);
        if (course) {
            document.getElementById('currentCourseName').textContent = course.name;
            document.getElementById('modulesSection').style.display = 'block';
            document.getElementById('adminPanel').style.display = 'none';
            
            // Cargar módulos del curso
            this.loadModules(courseId);
        }
    }

    async loadModules(courseId) {
        // Simular carga de módulos
        this.modules = [
            {
                id: '1',
                title: 'Introducción al Curso',
                description: 'Conceptos básicos y configuración del entorno',
                position: 1,
                session_id: 1
            },
            {
                id: '2',
                title: 'Fundamentos',
                description: 'Principios fundamentales y teoría',
                position: 2,
                session_id: 2
            }
        ];
        
        this.renderModules();
    }

    renderModules() {
        const modulesList = document.getElementById('modulesList');
        if (!modulesList) return;

        modulesList.innerHTML = '';

        this.modules.forEach(module => {
            const moduleCard = document.createElement('div');
            moduleCard.className = 'module-card';
            moduleCard.innerHTML = `
                <div class="module-header">
                    <div>
                        <h3 class="module-title">${module.title}</h3>
                        <p class="module-description">${module.description}</p>
                    </div>
                </div>
                <div class="module-meta">
                    <span>Sesión ${module.session_id}</span>
                    <span>Posición ${module.position}</span>
                </div>
            `;
            modulesList.appendChild(moduleCard);
        });
    }

    previewCourse(courseId) {
        const course = this.courses.find(c => c.id_ai_courses === courseId);
        if (course) {
            // Mostrar vista previa del curso
            console.log('Vista previa del curso:', course.name);
            this.showNotification('Vista previa del curso', 'info');
        }
    }

    duplicateCourse(courseId) {
        const course = this.courses.find(c => c.id_ai_courses === courseId);
        if (course) {
            // Duplicar curso
            const duplicatedCourse = {
                ...course,
                id_ai_courses: Date.now().toString(),
                name: `${course.name} (Copia)`,
                status: 'draft',
                created_at: new Date().toISOString()
            };
            
            this.courses.push(duplicatedCourse);
            this.showNotification('Curso duplicado exitosamente', 'success');
            this.renderCoursesTable();
        }
    }

    populateForm(course) {
        // Llenar formulario con datos del curso
        document.getElementById('courseName').value = course.name || '';
        document.getElementById('coursePrice').value = course.price || '';
        document.getElementById('courseCurrency').value = course.currency || 'USD';
        document.getElementById('courseModality').value = course.modality || 'async';
        document.getElementById('courseShortDescription').value = course.short_description || '';
        document.getElementById('courseSessions').value = course.session_count || '';
        // ... llenar otros campos
    }

    clearForm() {
        document.getElementById('courseForm').reset();
    }

    getModalityText(modality) {
        const modalities = {
            'async': 'Asíncrona',
            'sync': 'Síncrona',
            'mixed': 'Mixta'
        };
        return modalities[modality] || modality;
    }

    getStatusText(status) {
        const statuses = {
            'draft': 'Borrador',
            'published': 'Publicado',
            'archived': 'Archivado'
        };
        return statuses[status] || status;
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        // Agregar estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--course-success)' : type === 'error' ? 'var(--course-error)' : 'var(--course-primary)'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Botón de cerrar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    initChatIA() {
        console.log('Chat IA initialized');
    }

    async sendIAMessage() {
        const input = document.getElementById('iaInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Agregar mensaje del usuario
        this.addIAMessage(message, 'user');
        input.value = '';
        
        try {
            // Simular respuesta de IA
            const response = await this.getIAResponse(message);
            this.addIAMessage(response, 'ai');
        } catch (error) {
            this.addIAMessage('Lo siento, no pude procesar tu mensaje.', 'ai');
        }
    }

    addIAMessage(message, sender) {
        const messagesContainer = document.getElementById('iaMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ia-message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async getIAResponse(message) {
        // Simular respuesta de IA
        return new Promise(resolve => {
        setTimeout(() => {
                resolve('Gracias por tu mensaje. Te ayudo con la gestión de cursos. ¿En qué puedo asistirte específicamente?');
            }, 1000);
        });
    }

    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Implementar logout
            console.log('Logout');
            window.location.href = '../index.html';
        }
    }

    showProfile() {
        // Implementar mostrar perfil
        console.log('Mostrar perfil');
        this.showNotification('Funcionalidad de perfil en desarrollo', 'info');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.courseManager = new CourseManager();
});
