/**
 * Course Viewer Component
 * Maneja la visualización y navegación del contenido del curso
 */

class CourseViewer {
    constructor() {
        this.currentCourse = null;
        this.currentModule = 3;
        this.modules = [];
        this.resources = [];
        this.notes = [];
        this.progress = {
            completedModules: [1, 2],
            currentModule: 3,
            totalModules: 5,
            overallProgress: 65
        };
        
        this.init();
    }

    /**
     * Inicializar componente
     */
    init() {
        this.loadCourseData();
        this.setupEventListeners();
        this.initializeModules();
        this.loadResources();
        this.loadNotes();
        
        console.log('📚 Course Viewer inicializado');
    }

    /**
     * Cargar datos del curso
     */
    loadCourseData() {
        // Datos simulados del curso - en producción vendrían de la API
        this.currentCourse = {
            id: 'intro-ia',
            title: 'Introducción a la IA',
            instructor: 'Dr. Google AI',
            description: 'Curso completo sobre fundamentos de Inteligencia Artificial',
            totalDuration: 180, // minutos
            difficulty: 'Principiante',
            category: 'Tecnología'
        };

        this.modules = [
            {
                id: 1,
                title: '¿Qué es la IA?',
                duration: 15,
                status: 'completed',
                description: 'Introducción básica a los conceptos de Inteligencia Artificial',
                videoUrl: 'https://example.com/video1.mp4',
                resources: ['intro-ia.pdf', 'conceptos-basicos.md'],
                quiz: { questions: 5, passingScore: 80 }
            },
            {
                id: 2,
                title: 'Historia de la IA',
                duration: 22,
                status: 'completed',
                description: 'Evolución histórica de la Inteligencia Artificial',
                videoUrl: 'https://example.com/video2.mp4',
                resources: ['historia-ia.pdf', 'timeline.png'],
                quiz: { questions: 8, passingScore: 80 }
            },
            {
                id: 3,
                title: 'Fundamentos del ML',
                duration: 18,
                status: 'current',
                progress: 60,
                description: 'Conceptos fundamentales del Machine Learning',
                videoUrl: 'https://example.com/video3.mp4',
                resources: ['ml-basics.pdf', 'algorithms-guide.md', 'code-examples.zip'],
                quiz: { questions: 10, passingScore: 85 }
            },
            {
                id: 4,
                title: 'Redes Neuronales',
                duration: 25,
                status: 'locked',
                description: 'Introducción a las redes neuronales artificiales',
                videoUrl: 'https://example.com/video4.mp4',
                resources: ['neural-networks.pdf', 'tensorflow-intro.md'],
                quiz: { questions: 12, passingScore: 85 }
            },
            {
                id: 5,
                title: 'IA en el Futuro',
                duration: 20,
                status: 'locked',
                description: 'Tendencias y futuro de la Inteligencia Artificial',
                videoUrl: 'https://example.com/video5.mp4',
                resources: ['future-ai.pdf', 'ethics-ai.md'],
                quiz: { questions: 7, passingScore: 80 }
            }
        ];
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Navegación de módulos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.module-item')) {
                const moduleId = parseInt(e.target.closest('.module-item').getAttribute('data-module'));
                this.selectModule(moduleId);
            }
        });

        // Recursos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.resource-item')) {
                const resourceName = e.target.closest('.resource-item').querySelector('.resource-info h5').textContent;
                this.openResource(resourceName);
            }
        });

        // Eventos personalizados
        document.addEventListener('videoCompleted', (e) => {
            this.onVideoCompleted(e.detail);
        });

        document.addEventListener('bookmarkAdded', (e) => {
            this.onBookmarkAdded(e.detail);
        });

        document.addEventListener('createNote', (e) => {
            this.createNote(e.detail);
        });

        document.addEventListener('showResources', (e) => {
            this.showResourcesByTopic(e.detail.topic);
        });

        document.addEventListener('showQuiz', (e) => {
            this.showCustomQuiz(e.detail.content);
        });
    }

    /**
     * Inicializar módulos
     */
    initializeModules() {
        this.updateModulesDisplay();
        this.updateProgressDisplay();
    }

    /**
     * Seleccionar módulo
     */
    selectModule(moduleId) {
        const module = this.modules.find(m => m.id === moduleId);
        if (!module) return;

        // Verificar si el módulo está disponible
        if (module.status === 'locked') {
            this.showModuleLockedMessage(moduleId);
            return;
        }

        // Actualizar módulo actual
        this.currentModule = moduleId;
        this.updateCurrentModuleDisplay();
        
        // Cargar contenido del módulo
        this.loadModuleContent(module);
        
        // Guardar progreso
        this.saveProgress();
        
        // Notificar cambio
        const event = new CustomEvent('moduleChanged', {
            detail: { moduleId, module }
        });
        document.dispatchEvent(event);
        
        console.log(`Módulo ${moduleId} seleccionado`);
    }

    /**
     * Cargar contenido del módulo
     */
    loadModuleContent(module) {
        // Actualizar información del video
        this.updateVideoInfo(module);
        
        // Actualizar recursos
        this.updateModuleResources(module);
        
        // Actualizar descripción
        this.updateModuleDescription(module);
        
        // Cargar video si es necesario
        if (module.videoUrl) {
            this.loadModuleVideo(module);
        }
    }

    /**
     * Actualizar información del video
     */
    updateVideoInfo(module) {
        // Video header title removed - no longer needed
        // const videoHeader = document.querySelector('.video-header h4');
        // if (videoHeader) {
        //     videoHeader.textContent = module.title;
        // }

        const courseTitleElement = document.querySelector('.course-title');
        if (courseTitleElement) {
            courseTitleElement.textContent = this.currentCourse.title;
        }
    }

    /**
     * Actualizar recursos del módulo
     */
    updateModuleResources(module) {
        const resourcesList = document.querySelector('.resources-list');
        if (!resourcesList) return;

        resourcesList.innerHTML = '';

        module.resources.forEach(resource => {
            const resourceItem = this.createResourceElement(resource);
            resourcesList.appendChild(resourceItem);
        });
    }

    /**
     * Crear elemento de recurso
     */
    createResourceElement(resourceName) {
        const resourceItem = document.createElement('div');
        resourceItem.className = 'resource-item neo-card';
        
        const extension = resourceName.split('.').pop().toLowerCase();
        const icon = this.getResourceIcon(extension);
        const size = this.getResourceSize(resourceName);
        
        resourceItem.innerHTML = `
            <div class="resource-icon">
                <i class="${icon}"></i>
            </div>
            <div class="resource-info">
                <h5>${resourceName}</h5>
                <span>${extension.toUpperCase()} • ${size}</span>
            </div>
            <button class="neo-btn neo-btn-small" onclick="downloadResource('${resourceName}')">
                <i class="fas fa-download"></i>
            </button>
        `;
        
        return resourceItem;
    }

    /**
     * Obtener icono según tipo de recurso
     */
    getResourceIcon(extension) {
        const icons = {
            'pdf': 'fas fa-file-pdf',
            'md': 'fas fa-file-alt',
            'zip': 'fas fa-file-archive',
            'mp4': 'fas fa-file-video',
            'png': 'fas fa-file-image',
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image',
            'doc': 'fas fa-file-word',
            'docx': 'fas fa-file-word',
            'xls': 'fas fa-file-excel',
            'xlsx': 'fas fa-file-excel',
            'ppt': 'fas fa-file-powerpoint',
            'pptx': 'fas fa-file-powerpoint'
        };
        
        return icons[extension] || 'fas fa-file';
    }

    /**
     * Obtener tamaño simulado del recurso
     */
    getResourceSize(resourceName) {
        const sizes = {
            'intro-ia.pdf': '2.5 MB',
            'conceptos-basicos.md': '15 KB',
            'historia-ia.pdf': '3.2 MB',
            'timeline.png': '1.8 MB',
            'ml-basics.pdf': '4.1 MB',
            'algorithms-guide.md': '25 KB',
            'code-examples.zip': '1.2 MB',
            'neural-networks.pdf': '5.5 MB',
            'tensorflow-intro.md': '35 KB',
            'future-ai.pdf': '2.8 MB',
            'ethics-ai.md': '18 KB'
        };
        
        return sizes[resourceName] || '1.0 MB';
    }

    /**
     * Cargar video del módulo
     */
    loadModuleVideo(module) {
        const video = document.getElementById('courseVideo');
        if (video) {
            // En producción, aquí se cambiaría la fuente del video
            video.src = module.videoUrl;
            video.load();
        }
    }

    /**
     * Actualizar visualización de módulos
     */
    updateModulesDisplay() {
        const moduleItems = document.querySelectorAll('.module-item');
        
        moduleItems.forEach((item, index) => {
            const moduleId = index + 1;
            const module = this.modules.find(m => m.id === moduleId);
            if (!module) return;
            
            // Actualizar estado visual
            item.classList.remove('current', 'active', 'locked');
            
            if (module.status === 'completed') {
                item.classList.add('active');
            } else if (module.status === 'current') {
                item.classList.add('current');
            } else if (module.status === 'locked') {
                item.classList.add('locked');
            }
            
            // Actualizar progreso para módulo actual
            if (module.status === 'current' && module.progress) {
                this.updateModuleProgress(item, module.progress);
            }
        });
    }

    /**
     * Actualizar progreso del módulo actual
     */
    updateModuleProgress(moduleItem, progress) {
        const progressRing = moduleItem.querySelector('.progress-ring-circle');
        if (progressRing) {
            const circumference = 2 * Math.PI * 8; // radio = 8
            const offset = circumference - (progress / 100) * circumference;
            progressRing.style.strokeDashoffset = offset;
        }
    }

    /**
     * Actualizar visualización del módulo actual
     */
    updateCurrentModuleDisplay() {
        const moduleItems = document.querySelectorAll('.module-item');
        
        moduleItems.forEach(item => {
            item.classList.remove('current');
        });
        
        const currentItem = document.querySelector(`[data-module="${this.currentModule}"]`);
        if (currentItem) {
            currentItem.classList.add('current');
        }
    }

    /**
     * Actualizar visualización del progreso general
     */
    updateProgressDisplay() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const statNumber = document.querySelector('.stat-number');
        
        if (progressFill) {
            progressFill.style.width = `${this.progress.overallProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Módulo ${this.currentModule} de ${this.progress.totalModules} • ${this.progress.overallProgress}% completado`;
        }
        
        if (statNumber) {
            statNumber.textContent = `${this.progress.overallProgress}%`;
        }
        
        // Actualizar otros stats
        this.updateStatistics();
    }

    /**
     * Actualizar estadísticas
     */
    updateStatistics() {
        const totalMinutesElement = document.querySelector('.stat-item:nth-child(2) .stat-number');
        const notesCountElement = document.querySelector('.stat-item:nth-child(3) .stat-number');
        
        if (totalMinutesElement) {
            const completedMinutes = this.calculateCompletedMinutes();
            totalMinutesElement.textContent = completedMinutes;
        }
        
        if (notesCountElement) {
            notesCountElement.textContent = this.notes.length;
        }
    }

    /**
     * Calcular minutos completados
     */
    calculateCompletedMinutes() {
        let totalMinutes = 0;
        
        this.modules.forEach(module => {
            if (module.status === 'completed') {
                totalMinutes += module.duration;
            } else if (module.status === 'current' && module.progress) {
                totalMinutes += Math.floor((module.duration * module.progress) / 100);
            }
        });
        
        return totalMinutes;
    }

    /**
     * Manejar video completado
     */
    onVideoCompleted(data) {
        const currentModule = this.modules.find(m => m.id === this.currentModule);
        if (currentModule) {
            currentModule.status = 'completed';
            currentModule.progress = 100;
            
            // Desbloquear siguiente módulo
            const nextModule = this.modules.find(m => m.id === this.currentModule + 1);
            if (nextModule && nextModule.status === 'locked') {
                nextModule.status = 'available';
            }
            
            // Actualizar progreso general
            this.updateGeneralProgress();
            
            // Actualizar visualización
            this.updateModulesDisplay();
            this.updateProgressDisplay();
            
            // Mostrar celebración
            this.showCompletionCelebration(currentModule);
            
            // Guardar progreso
            this.saveProgress();
        }
    }

    /**
     * Actualizar progreso general
     */
    updateGeneralProgress() {
        const completedModules = this.modules.filter(m => m.status === 'completed').length;
        this.progress.overallProgress = Math.round((completedModules / this.progress.totalModules) * 100);
        this.progress.completedModules = this.modules.filter(m => m.status === 'completed').map(m => m.id);
    }

    /**
     * Mostrar celebración de completado
     */
    showCompletionCelebration(module) {
        // Crear elemento de celebración
        const celebration = document.createElement('div');
        celebration.className = 'completion-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h3>¡Módulo Completado!</h3>
                <p>Has terminado "${module.title}"</p>
                <div class="celebration-actions">
                    <button class="neo-btn neo-btn-primary" onclick="this.closest('.completion-celebration').remove()">
                        Continuar
                    </button>
                </div>
            </div>
        `;
        
        // Añadir estilos
        celebration.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(celebration);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.remove();
            }
        }, 5000);
    }

    /**
     * Manejar marcador añadido
     */
    onBookmarkAdded(bookmark) {
        // Añadir a la lista de marcadores del módulo actual
        const currentModule = this.modules.find(m => m.id === this.currentModule);
        if (currentModule) {
            if (!currentModule.bookmarks) {
                currentModule.bookmarks = [];
            }
            
            currentModule.bookmarks.push({
                ...bookmark,
                moduleId: this.currentModule,
                moduleTitle: currentModule.title
            });
            
            this.saveProgress();
        }
    }

    /**
     * Crear nota
     */
    createNote(noteData) {
        const note = {
            id: Date.now(),
            content: noteData.content,
            timestamp: noteData.timestamp || this.getCurrentVideoTime(),
            moduleId: this.currentModule,
            moduleTitle: this.modules.find(m => m.id === this.currentModule)?.title,
            createdAt: new Date(),
            source: noteData.source || 'manual'
        };
        
        this.notes.push(note);
        this.saveNotes();
        this.addNoteToDisplay(note);
        
        // Actualizar estadísticas
        this.updateStatistics();
    }

    /**
     * Añadir nota a la visualización
     */
    addNoteToDisplay(note) {
        const notesList = document.querySelector('.notes-list');
        if (!notesList) return;
        
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item neo-card';
        noteElement.setAttribute('data-note-id', note.id);
        
        noteElement.innerHTML = `
            <div class="note-header">
                <span class="note-time">${note.timestamp}</span>
                <div class="note-actions">
                    <button class="neo-btn neo-btn-micro" onclick="editNote(${note.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="neo-btn neo-btn-micro" onclick="deleteNote(${note.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="note-content">${note.content}</div>
        `;
        
        // Insertar al principio de la lista
        notesList.insertBefore(noteElement, notesList.firstChild);
    }

    /**
     * Abrir recurso
     */
    openResource(resourceName) {
        // Simular descarga o apertura de recurso
        console.log(`Abriendo recurso: ${resourceName}`);
        
        // En producción, aquí se abriría/descargaría el recurso real
        this.showNotification(`Abriendo ${resourceName}...`, 'info');
    }

    /**
     * Mostrar recursos por tema
     */
    showResourcesByTopic(topic) {
        const resourcesList = document.querySelector('.resources-list');
        if (!resourcesList) return;
        
        // Filtrar recursos relacionados con el tema
        const relatedResources = this.getResourcesByTopic(topic);
        
        if (relatedResources.length > 0) {
            // Highlight recursos relacionados
            const resourceItems = resourcesList.querySelectorAll('.resource-item');
            resourceItems.forEach(item => {
                const resourceName = item.querySelector('.resource-info h5').textContent;
                if (relatedResources.includes(resourceName)) {
                    item.style.border = '2px solid var(--neo-primary)';
                    item.style.backgroundColor = 'rgba(68, 229, 255, 0.1)';
                }
            });
            
            // Remover highlight después de 3 segundos
            setTimeout(() => {
                resourceItems.forEach(item => {
                    item.style.border = '';
                    item.style.backgroundColor = '';
                });
            }, 3000);
        }
    }

    /**
     * Obtener recursos por tema
     */
    getResourcesByTopic(topic) {
        const topicResources = {
            'machine-learning': ['ml-basics.pdf', 'algorithms-guide.md', 'code-examples.zip'],
            'neural-networks': ['neural-networks.pdf', 'tensorflow-intro.md'],
            'algorithms': ['algorithms-guide.md', 'code-examples.zip'],
            'general': ['intro-ia.pdf', 'conceptos-basicos.md']
        };
        
        return topicResources[topic] || [];
    }

    /**
     * Mostrar quiz personalizado
     */
    showCustomQuiz(content) {
        // Cambiar a la pestaña de quiz
        const quizTab = document.querySelector('[data-tab="quiz"]');
        if (quizTab) {
            quizTab.click();
        }
        
        // Actualizar contenido del quiz
        const quizQuestion = document.querySelector('.quiz-question h5');
        if (quizQuestion) {
            quizQuestion.textContent = content;
        }
        
        // Highlight la sección de quiz
        const quizSection = document.getElementById('quizTab');
        if (quizSection) {
            quizSection.style.border = '2px solid var(--neo-primary)';
            setTimeout(() => {
                quizSection.style.border = '';
            }, 2000);
        }
    }

    /**
     * Mostrar mensaje de módulo bloqueado
     */
    showModuleLockedMessage(moduleId) {
        this.showNotification(
            `Completa el módulo anterior para desbloquear el Módulo ${moduleId}`,
            'warning'
        );
    }

    /**
     * Obtener tiempo actual del video
     */
    getCurrentVideoTime() {
        const video = document.getElementById('courseVideo');
        if (video) {
            const currentTime = video.currentTime;
            const minutes = Math.floor(currentTime / 60);
            const seconds = Math.floor(currentTime % 60);
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return '00:00';
    }

    /**
     * Cargar recursos
     */
    loadResources() {
        try {
            const stored = localStorage.getItem('courseResources');
            if (stored) {
                this.resources = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error cargando recursos:', error);
        }
    }

    /**
     * Cargar notas
     */
    loadNotes() {
        try {
            const stored = localStorage.getItem('courseNotes');
            if (stored) {
                this.notes = JSON.parse(stored);
                this.displayExistingNotes();
            }
        } catch (error) {
            console.error('Error cargando notas:', error);
        }
    }

    /**
     * Mostrar notas existentes
     */
    displayExistingNotes() {
        const notesList = document.querySelector('.notes-list');
        if (!notesList) return;
        
        // Limpiar notas existentes (excepto las hardcodeadas)
        const existingNotes = notesList.querySelectorAll('[data-note-id]');
        existingNotes.forEach(note => note.remove());
        
        // Añadir notas guardadas
        this.notes.forEach(note => {
            this.addNoteToDisplay(note);
        });
    }

    /**
     * Guardar notas
     */
    saveNotes() {
        try {
            localStorage.setItem('courseNotes', JSON.stringify(this.notes));
        } catch (error) {
            console.error('Error guardando notas:', error);
        }
    }

    /**
     * Guardar progreso
     */
    saveProgress() {
        try {
            const progressData = {
                currentModule: this.currentModule,
                modules: this.modules,
                progress: this.progress,
                lastUpdate: new Date()
            };
            
            localStorage.setItem('courseViewerProgress', JSON.stringify(progressData));
        } catch (error) {
            console.error('Error guardando progreso:', error);
        }
    }

    /**
     * Cargar progreso guardado
     */
    loadProgress() {
        try {
            const stored = localStorage.getItem('courseViewerProgress');
            if (stored) {
                const progressData = JSON.parse(stored);
                this.currentModule = progressData.currentModule;
                this.modules = progressData.modules;
                this.progress = progressData.progress;
                
                this.updateModulesDisplay();
                this.updateProgressDisplay();
            }
        } catch (error) {
            console.error('Error cargando progreso:', error);
        }
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info') {
        // Reutilizar sistema de notificaciones existente
        if (window.chatOnline && typeof window.chatOnline.showNotification === 'function') {
            window.chatOnline.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Obtener estadísticas del curso
     */
    getStatistics() {
        return {
            currentModule: this.currentModule,
            completedModules: this.progress.completedModules.length,
            totalModules: this.progress.totalModules,
            overallProgress: this.progress.overallProgress,
            totalNotes: this.notes.length,
            totalBookmarks: this.modules.reduce((total, module) => {
                return total + (module.bookmarks ? module.bookmarks.length : 0);
            }, 0),
            timeSpent: this.calculateCompletedMinutes(),
            lastActivity: new Date()
        };
    }

    /**
     * Exportar progreso del curso
     */
    exportProgress() {
        const exportData = {
            course: this.currentCourse,
            progress: this.getStatistics(),
            modules: this.modules,
            notes: this.notes,
            exportDate: new Date()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `course-progress-${Date.now()}.json`;
        link.click();
    }
}

// Funciones globales para el HTML
window.downloadResource = function(resourceName) {
    console.log(`Descargando: ${resourceName}`);
    // Implementar descarga real aquí
};

window.editNote = function(noteId) {
    console.log(`Editando nota: ${noteId}`);
    // Implementar edición de nota
};

window.deleteNote = function(noteId) {
    if (confirm('¿Eliminar esta nota?')) {
        const courseViewer = window.chatOnline?.courseViewer;
        if (courseViewer) {
            courseViewer.notes = courseViewer.notes.filter(note => note.id !== noteId);
            courseViewer.saveNotes();
            
            // Remover del DOM
            const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
            if (noteElement) {
                noteElement.remove();
            }
            
            courseViewer.updateStatistics();
        }
    }
};

// Exportar para uso global
window.CourseViewer = CourseViewer;
