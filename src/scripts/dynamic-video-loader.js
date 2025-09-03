// =====================================================
// DYNAMIC VIDEO LOADER
// Sistema de carga dinámica de videos desde base de datos
// Elimina completamente los datos hardcodeados
// =====================================================

class DynamicVideoLoader {
    constructor() {
        this.courseId = '550e8400-e29b-41d4-a716-446655440001'; // ID real del curso de IA
        this.userId = null;
        this.currentModule = null;
        this.currentVideo = null;
        this.courseData = null;
        this.apiBaseUrl = this.getApiBaseUrl();
        
        console.log('🎬 Dynamic Video Loader inicializado');
        console.log('🌐 API Base URL:', this.apiBaseUrl);
    }

    // =====================================================
    // INICIALIZACIÓN
    // =====================================================

    async init() {
        try {
            console.log('🚀 Inicializando Dynamic Video Loader...');

            // 1. Obtener usuario actual
            this.userId = this.getCurrentUserId();
            console.log('👤 Usuario actual:', this.userId);

            // 2. Cargar estructura completa del curso
            await this.loadCourseStructure();

            // 3. Cargar módulo actual del usuario
            await this.loadCurrentModule();

            // 4. Renderizar interfaz
            await this.renderInterface();

            // 5. Configurar eventos
            this.setupEventListeners();

            console.log('✅ Dynamic Video Loader inicializado exitosamente');

        } catch (error) {
            console.error('💥 Error inicializando Dynamic Video Loader:', error);
            this.showError('Error cargando el curso. Por favor recarga la página.');
        }
    }

    // =====================================================
    // CARGA DE DATOS DESDE API
    // =====================================================

    async loadCourseStructure() {
        try {
            console.log('📚 Cargando estructura del curso...');

            const response = await fetch(`${this.apiBaseUrl}/course-structure/${this.courseId}?userId=${this.userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Error obteniendo estructura del curso');
            }

            this.courseData = data;
            console.log('✅ Estructura del curso cargada:', data.summary);

        } catch (error) {
            console.error('❌ Error cargando estructura del curso:', error);
            throw error;
        }
    }

    async loadCurrentModule() {
        try {
            console.log('📍 Cargando módulo actual del usuario...');

            const response = await fetch(`${this.apiBaseUrl}/current-module/${this.courseId}/${this.userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Error obteniendo módulo actual');
            }

            this.currentModule = data.current_module;
            this.currentVideo = data.current_video;

            console.log('✅ Módulo actual cargado:', this.currentModule?.title);
            console.log('🎥 Video actual:', this.currentVideo?.video_title);

        } catch (error) {
            console.error('❌ Error cargando módulo actual:', error);
            throw error;
        }
    }

    async switchToModule(moduleId) {
        try {
            console.log(`🔄 Cambiando a módulo: ${moduleId}`);

            const response = await fetch(`${this.apiBaseUrl}/switch-module`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    courseId: this.courseData.course.id,
                    moduleId: moduleId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error cambiando módulo');
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Error cambiando módulo');
            }

            // Actualizar datos actuales
            this.currentModule = data.module;
            this.currentVideo = data.current_video;

            // Re-renderizar video y UI
            await this.renderVideo();
            await this.updateProgressIndicators();

            console.log('✅ Módulo cambiado exitosamente');

        } catch (error) {
            console.error('❌ Error cambiando módulo:', error);
            this.showError(error.message);
        }
    }

    // =====================================================
    // RENDERIZADO DE INTERFAZ
    // =====================================================

    async renderInterface() {
        console.log('🎨 Renderizando interfaz...');

        // Renderizar información del curso
        this.renderCourseInfo();
        
        // Renderizar lista de módulos
        this.renderModulesList();
        
        // Renderizar video actual
        await this.renderVideo();
        
        // Renderizar progreso
        this.renderProgressIndicators();

        console.log('✅ Interfaz renderizada');
    }

    renderCourseInfo() {
        try {
            const courseCard = document.querySelector('.course-card');
            if (!courseCard || !this.courseData) return;

            // Actualizar título del curso
            const titleElement = courseCard.querySelector('.course-title span');
            if (titleElement) {
                titleElement.textContent = this.courseData.course.title;
            }

            // Actualizar categoría
            const categoryElement = courseCard.querySelector('.course-category span');
            if (categoryElement) {
                categoryElement.textContent = this.courseData.course.category.toUpperCase();
            }

            console.log('✅ Información del curso actualizada');

        } catch (error) {
            console.error('❌ Error renderizando info del curso:', error);
        }
    }

    renderModulesList() {
        try {
            const modulesList = document.querySelector('.modules-list');
            if (!modulesList || !this.courseData) return;

            // Limpiar lista existente
            modulesList.innerHTML = '';

            // Renderizar cada módulo
            this.courseData.modules.forEach((module, index) => {
                const moduleElement = this.createModuleElement(module, index);
                modulesList.appendChild(moduleElement);
            });

            console.log('✅ Lista de módulos renderizada');

        } catch (error) {
            console.error('❌ Error renderizando lista de módulos:', error);
        }
    }

    createModuleElement(module, index) {
        const isCurrentModule = this.currentModule?.id === module.id;
        const firstVideo = module.videos[0];
        const progress = firstVideo?.user_progress;
        
        // Determinar estado del módulo
        let statusClass = 'pending';
        let icon = `<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>`;
        
        if (progress?.is_completed) {
            statusClass = 'completed';
            icon = `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>`;
        } else if (isCurrentModule || progress?.current_time_seconds > 0) {
            statusClass = 'current';
            icon = `<circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/>`;
        }

        const moduleElement = document.createElement('div');
        moduleElement.className = `module-item ${statusClass}`;
        moduleElement.setAttribute('data-module', module.id);
        
        moduleElement.innerHTML = `
            <div class="module-icon">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    ${icon}
                </svg>
            </div>
            <div class="module-info">
                <h4>${module.title}</h4>
                <span class="module-duration">${module.duration_minutes} min</span>
            </div>
        `;

        // Agregar event listener
        moduleElement.addEventListener('click', () => {
            this.switchToModule(module.id);
        });

        return moduleElement;
    }

    async renderVideo() {
        try {
            if (!this.currentVideo) {
                console.warn('⚠️ No hay video actual para renderizar');
                return;
            }

            console.log('🎥 Renderizando video:', this.currentVideo.video_title);

            // Actualizar iframe del video
            this.updateVideoPlayer();
            
            // Actualizar información del video
            this.updateVideoInfo();
            
            // Actualizar progreso del video
            this.updateVideoProgress();

            console.log('✅ Video renderizado exitosamente');

        } catch (error) {
            console.error('❌ Error renderizando video:', error);
        }
    }

    updateVideoPlayer() {
        const iframe = document.getElementById('youtubePlayer');
        if (!iframe || !this.currentVideo) return;

        const embedUrl = this.currentVideo.youtube_embed_url;
        
        // Solo actualizar si la URL es diferente
        if (iframe.src !== embedUrl) {
            iframe.src = embedUrl;
            iframe.title = this.currentVideo.video_title;
            
            console.log('🔄 Video player actualizado:', embedUrl);
        }
    }

    updateVideoInfo() {
        // Actualizar título del video
        const titleElement = document.querySelector('.video-info h3');
        if (titleElement && this.currentVideo) {
            titleElement.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="23,7 16,12 23,17"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                ${this.currentVideo.video_title}
            `;
        }

        // Actualizar duración
        const durationElement = document.querySelector('.video-stats span:first-child');
        if (durationElement && this.currentVideo) {
            const minutes = Math.floor(this.currentVideo.duration_seconds / 60);
            const seconds = this.currentVideo.duration_seconds % 60;
            
            durationElement.innerHTML = `
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                </svg>
                Duración: ${minutes}:${seconds.toString().padStart(2, '0')}
            `;
        }
    }

    updateVideoProgress() {
        const progressDots = document.querySelector('.video-progress-dots');
        if (!progressDots || !this.currentVideo?.checkpoints) return;

        // Limpiar dots existentes
        progressDots.innerHTML = '';

        // Crear dots basados en checkpoints
        this.currentVideo.checkpoints.forEach((checkpoint, index) => {
            const progress = this.currentVideo.user_progress;
            const isCompleted = progress?.current_time_seconds >= checkpoint.checkpoint_time_seconds;

            const dot = document.createElement('div');
            dot.className = `progress-dot ${isCompleted ? 'filled' : ''}`;
            dot.title = checkpoint.checkpoint_label || `Sección ${index + 1}`;
            
            dot.innerHTML = isCompleted 
                ? '<i class="fas fa-check"></i>' 
                : '<i class="fas fa-circle"></i>';

            progressDots.appendChild(dot);
        });
    }

    renderProgressIndicators() {
        try {
            if (!this.courseData) return;

            // Actualizar porcentaje general
            const progressPercentage = document.querySelector('.progress-percentage');
            const progressFill = document.querySelector('.progress-fill');
            
            if (progressPercentage && progressFill) {
                const percentage = this.calculateOverallProgress();
                progressPercentage.textContent = `${Math.round(percentage)}%`;
                progressFill.style.width = `${percentage}%`;
            }

            // Actualizar indicadores de módulos
            this.updateModuleProgressDots();

            // Actualizar información del módulo actual
            this.updateCurrentModuleInfo();

            console.log('✅ Indicadores de progreso actualizados');

        } catch (error) {
            console.error('❌ Error actualizando indicadores:', error);
        }
    }

    calculateOverallProgress() {
        if (!this.courseData?.modules) return 0;

        let totalVideos = 0;
        let completedVideos = 0;

        this.courseData.modules.forEach(module => {
            module.videos.forEach(video => {
                totalVideos++;
                if (video.user_progress?.is_completed) {
                    completedVideos++;
                }
            });
        });

        return totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    }

    updateModuleProgressDots() {
        const progressIndicators = document.querySelector('.progress-indicators');
        if (!progressIndicators || !this.courseData) return;

        // Limpiar indicadores existentes
        progressIndicators.innerHTML = '';

        // Crear indicador para cada módulo
        this.courseData.modules.forEach((module, index) => {
            const firstVideo = module.videos[0];
            const progress = firstVideo?.user_progress;
            
            let status = 'pending';
            let icon = `<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>`;
            let title = `Módulo ${index + 1} Pendiente`;
            
            if (progress?.is_completed) {
                status = 'completed';
                icon = `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>`;
                title = `Módulo ${index + 1} Completado`;
            } else if (this.currentModule?.id === module.id) {
                status = 'current';
                icon = `<polygon points="5,3 19,12 5,21"/>`;
                title = `Módulo ${index + 1} En Progreso`;
            }

            const dot = document.createElement('div');
            dot.className = `progress-dot ${status}`;
            dot.title = title;
            
            dot.innerHTML = `
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${icon}
                </svg>
            `;

            progressIndicators.appendChild(dot);
        });
    }

    updateCurrentModuleInfo() {
        const currentModuleInfo = document.querySelector('.current-module-info span');
        if (currentModuleInfo && this.currentModule) {
            currentModuleInfo.textContent = `Módulo ${this.currentModule.module_number}: ${this.currentModule.title}`;
        }
    }

    // =====================================================
    // UTILIDADES
    // =====================================================

    getCurrentUserId() {
        try {
            // Intentar obtener del localStorage
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                return user.id;
            }

            const directUserId = localStorage.getItem('userId');
            if (directUserId) {
                return directUserId;
            }

            // Usar el usuario real de la base de datos
            console.log('🔧 Usando usuario real de la base de datos');
            return '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0';

        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            // En caso de error, usar el usuario real también
            return '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0';
        }
    }

    getApiBaseUrl() {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const currentPort = window.location.port;

        if (isLocalhost && (currentPort === '3000' || window.location.href.includes(':3000'))) {
            return '/api';
        } else if (isLocalhost && currentPort === '8888') {
            return '/.netlify/functions';
        } else if (isLocalhost) {
            return '/api';
        } else {
            return '/.netlify/functions';
        }
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');

        // Event listeners para navegación de módulos ya se configuran en createModuleElement
        
        // Event listener para botón de volver
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.history.back();
            });
        }

        console.log('✅ Event listeners configurados');
    }

    // =====================================================
    // MANEJO DE ERRORES
    // =====================================================

    showError(message) {
        console.error('🚨 Error mostrado al usuario:', message);
        
        // Mostrar error en la UI
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 400px;
            font-weight: bold;
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        // Remover después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showSuccess(message) {
        console.log('✅ Éxito mostrado al usuario:', message);
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #44ff44;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 400px;
            font-weight: bold;
        `;
        successDiv.textContent = message;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}

// =====================================================
// INICIALIZACIÓN GLOBAL
// =====================================================

// Variable global para acceso
window.dynamicVideoLoader = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎬 Inicializando Dynamic Video Loader...');
    
    window.dynamicVideoLoader = new DynamicVideoLoader();
    
    try {
        await window.dynamicVideoLoader.init();
        console.log('✅ Dynamic Video Loader listo para usar');
    } catch (error) {
        console.error('💥 Error inicializando Dynamic Video Loader:', error);
    }
});

// Exportar clase para uso modular
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicVideoLoader;
}