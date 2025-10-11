/**
 * MODULES VIDEOS MANAGER
 * Sistema de gestión de módulos y videos con menús desplegables
 * Integración con la API de cursos y sistema de progreso
 */

class ModulesVideosManager {
    constructor() {
        this.currentCourse = this.getCurrentCourseId(); // Obtener dinámicamente
        this.currentUser = this.getUserId();
        this.modules = [];
        this.currentVideoData = null;
        this.isInitialized = false;
        
        // Elementos del DOM
        this.modulesList = null;
        this.youtubePlayer = null;
        this.videoInfo = null;
        
        // console.log('[ModulesVideosManager] ✨ Inicializando gestor de módulos y videos');
    }

    /**
     * Inicializar el sistema
     */
    async init() {
        try {
            // Obtener elementos del DOM
            this.modulesList = document.getElementById('modulesList');
            this.youtubePlayer = document.getElementById('youtubePlayer');
            this.videoInfo = document.querySelector('.video-info');

            if (!this.modulesList) {
                console.error('[ModulesVideosManager] ❌ Elemento modulesList no encontrado');
                return false;
            }

            // console.log('[ModulesVideosManager] 🎯 Elementos del DOM encontrados');

            // Cargar estructura completa del curso
            await this.loadCourseStructure();

            // Renderizar módulos
            this.renderModules();

            // Configurar event listeners
            this.setupEventListeners();

            this.isInitialized = true;
            // console.log('[ModulesVideosManager] ✅ Sistema inicializado correctamente');
            return true;

        } catch (error) {
            console.error('[ModulesVideosManager] 💥 Error durante la inicialización:', error);
            this.showError('Error inicializando sistema de videos');
            return false;
        }
    }

    /**
     * Obtener estructura completa del curso desde la API
     */
    async loadCourseStructure() {
        try {
            // console.log('[ModulesVideosManager] 📡 Cargando estructura del curso...');

            const response = await fetch(`/api/courses/${this.currentCourse}/full-structure?userId=${this.currentUser}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success || !data.modules) {
                throw new Error('Respuesta inválida de la API');
            }

            this.modules = data.modules;
            this.courseData = data.course;

            // console.log('[ModulesVideosManager] ✅ Estructura del curso cargada:', {
                modules: this.modules.length,
                totalVideos: data.summary.total_videos
            });

            // Obtener video actual
            if (data.modules.length > 0 && data.modules[0].videos.length > 0) {
                this.currentVideoData = data.modules[0].videos[0];
            }

            return data;

        } catch (error) {
            console.error('[ModulesVideosManager] 💥 Error cargando estructura del curso:', error);
            throw error;
        }
    }

    /**
     * Renderizar lista de módulos
     */
    renderModules() {
        if (!this.modulesList || !this.modules) {
            console.error('[ModulesVideosManager] ❌ No se pueden renderizar módulos - datos faltantes');
            return;
        }

        // console.log('[ModulesVideosManager] 🎨 Renderizando módulos...');

        let modulesHTML = '';

        this.modules.forEach((module, index) => {
            const isFirst = index === 0;
            const videoCount = module.videos ? module.videos.length : 0;
            
            // Calcular progreso del módulo
            const completedVideos = module.videos ? 
                module.videos.filter(v => v.user_progress?.is_completed).length : 0;
            const progressPercent = videoCount > 0 ? Math.round((completedVideos / videoCount) * 100) : 0;

            modulesHTML += `
                <div class="module-item ${isFirst ? 'current' : ''}" data-module-id="${module.id}">
                    <div class="module-header" onclick="window.modulesVideosManager.toggleModule('${module.id}')">
                        <div class="module-info">
                            <h4>
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                </svg>
                                Módulo ${module.module_number}: ${module.title}
                            </h4>
                            <div class="module-meta">
                                <span class="module-video-count">
                                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polygon points="10,8 16,12 10,16"/>
                                    </svg>
                                    ${videoCount} videos
                                </span>
                                <span class="module-progress">
                                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                                    </svg>
                                    ${progressPercent}%
                                </span>
                            </div>
                        </div>
                        <button class="module-toggle ${isFirst ? 'expanded' : ''}" data-module-id="${module.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6,9 12,15 18,9"/>
                            </svg>
                        </button>
                    </div>
                    <div class="module-videos ${isFirst ? 'expanded' : ''}" data-module-id="${module.id}">
                        <div class="videos-list">
                            ${this.renderVideos(module.videos, module.id)}
                        </div>
                    </div>
                </div>
            `;
        });

        this.modulesList.innerHTML = modulesHTML;
        // console.log('[ModulesVideosManager] ✅ Módulos renderizados correctamente');
    }

    /**
     * Renderizar lista de videos de un módulo
     */
    renderVideos(videos, moduleId) {
        if (!videos || videos.length === 0) {
            return `
                <div class="no-videos">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    <span>No hay videos disponibles</span>
                </div>
            `;
        }

        return videos.map((video, index) => {
            const isFirst = index === 0;
            const progress = video.user_progress || { completion_percentage: 0, is_completed: false };
            const duration = this.formatDuration(video.duration_seconds);
            
            let statusClass = 'not-started';
            let statusIcon = '<circle cx="12" cy="12" r="3"/>';
            
            if (progress.is_completed) {
                statusClass = 'completed';
                statusIcon = '<path d="M20 6L9 17l-5-5"/>';
            } else if (progress.completion_percentage > 0) {
                statusClass = 'in-progress';
                statusIcon = '<polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>';
            }

            return `
                <div class="video-item ${isFirst ? 'current' : ''} ${progress.is_completed ? 'completed' : ''}" 
                     data-video-id="${video.id}" 
                     data-module-id="${moduleId}"
                     onclick="window.modulesVideosManager.switchToVideo('${video.id}', '${moduleId}')">
                    <div class="video-thumbnail">
                        ${video.youtube_thumbnail_url ? 
                            `<img src="${video.youtube_thumbnail_url}" alt="${video.video_title}" onerror="this.style.display='none';">` :
                            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polygon points="10,8 16,12 10,16"/>
                            </svg>`
                        }
                    </div>
                    <div class="video-info">
                        <h5 class="video-title">${video.video_title}</h5>
                        <div class="video-meta">
                            <span class="video-duration">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12,6 12,12 16,14"/>
                                </svg>
                                ${duration}
                            </span>
                            <span class="video-status">
                                <div class="status-icon ${statusClass}">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        ${statusIcon}
                                    </svg>
                                </div>
                                ${progress.is_completed ? 'Completado' : progress.completion_percentage > 0 ? 'En progreso' : 'Pendiente'}
                            </span>
                        </div>
                        ${progress.completion_percentage > 0 ? `
                            <div class="video-progress">
                                <div class="progress-fill" style="width: ${progress.completion_percentage}%"></div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Toggle módulo (expandir/colapsar)
     */
    toggleModule(moduleId) {
        // console.log('[ModulesVideosManager] 🔄 Toggle módulo:', moduleId);

        const moduleItem = document.querySelector(`.module-item[data-module-id="${moduleId}"]`);
        const moduleToggle = document.querySelector(`.module-toggle[data-module-id="${moduleId}"]`);
        const moduleVideos = document.querySelector(`.module-videos[data-module-id="${moduleId}"]`);

        if (!moduleItem || !moduleToggle || !moduleVideos) {
            console.error('[ModulesVideosManager] ❌ Elementos del módulo no encontrados');
            return;
        }

        const isExpanded = moduleToggle.classList.contains('expanded');

        if (isExpanded) {
            // Colapsar
            moduleToggle.classList.remove('expanded');
            moduleVideos.classList.remove('expanded');
        } else {
            // Expandir
            moduleToggle.classList.add('expanded');
            moduleVideos.classList.add('expanded');
            
            // Cargar videos si no están cargados
            this.loadModuleVideos(moduleId);
        }
    }

    /**
     * Cargar videos de un módulo específico
     */
    async loadModuleVideos(moduleId) {
        try {
            // console.log('[ModulesVideosManager] 📡 Cargando videos del módulo:', moduleId);

            const response = await fetch(`/api/modules/${moduleId}/videos?userId=${this.currentUser}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success || !data.videos) {
                throw new Error('Respuesta inválida de la API');
            }

            // Actualizar datos del módulo en memoria
            const moduleIndex = this.modules.findIndex(m => m.id === moduleId);
            if (moduleIndex !== -1) {
                this.modules[moduleIndex].videos = data.videos;
            }

            // Re-renderizar videos del módulo
            const videosContainer = document.querySelector(`.module-videos[data-module-id="${moduleId}"] .videos-list`);
            if (videosContainer) {
                videosContainer.innerHTML = this.renderVideos(data.videos, moduleId);
            }

            // console.log('[ModulesVideosManager] ✅ Videos del módulo cargados:', data.videos.length);

        } catch (error) {
            console.error('[ModulesVideosManager] 💥 Error cargando videos del módulo:', error);
        }
    }

    /**
     * Cambiar a un video específico
     */
    async switchToVideo(videoId, moduleId) {
        try {
            // console.log('[ModulesVideosManager] 🎥 Cambiando a video:', { videoId, moduleId });

            // Mostrar loading en el reproductor
            this.showVideoLoading();

            // Llamar a la API para cambiar video
            const response = await fetch(`/api/users/${this.currentUser}/switch-video`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courseId: this.courseData.id,
                    moduleId: moduleId,
                    videoId: videoId
                })
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error('Error en respuesta de la API');
            }

            // Actualizar video actual
            this.currentVideoData = data.video;

            // Actualizar player de YouTube
            if (this.youtubePlayer && data.video.youtube_embed_url) {
                this.youtubePlayer.src = data.video.youtube_embed_url;
                this.youtubePlayer.title = data.video.video_title;
            }

            // Actualizar información del video
            this.updateVideoInfo(data.video);

            // Actualizar estados visuales
            this.updateVideoStates(videoId, moduleId);

            // console.log('[ModulesVideosManager] ✅ Video cambiado exitosamente');

        } catch (error) {
            console.error('[ModulesVideosManager] 💥 Error cambiando video:', error);
            this.showVideoError('Error cargando video');
        }
    }

    /**
     * Actualizar información del video en la interfaz
     */
    updateVideoInfo(videoData) {
        if (!this.videoInfo || !videoData) return;

        const titleElement = this.videoInfo.querySelector('h3');
        const durationElement = this.videoInfo.querySelector('.video-stats span:first-child');
        const infoElement = this.videoInfo.querySelector('.video-stats span:last-child');

        if (titleElement) {
            titleElement.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="23,7 16,12 23,17"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                ${videoData.video_title}
            `;
        }

        if (durationElement) {
            const duration = this.formatDuration(videoData.duration_seconds);
            durationElement.innerHTML = `
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                </svg>
                Duración: ${duration}
            `;
        }

        if (infoElement) {
            const progress = videoData.user_progress;
            let statusText = 'No iniciado';
            
            if (progress?.is_completed) {
                statusText = 'Completado';
            } else if (progress?.completion_percentage > 0) {
                statusText = `En progreso (${progress.completion_percentage}%)`;
            }

            infoElement.innerHTML = `
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                ${statusText}
            `;
        }
    }

    /**
     * Actualizar estados visuales de videos
     */
    updateVideoStates(currentVideoId, currentModuleId) {
        // Remover estado 'current' de todos los videos
        document.querySelectorAll('.video-item.current').forEach(item => {
            item.classList.remove('current');
        });

        // Remover estado 'current' de todos los módulos
        document.querySelectorAll('.module-item.current').forEach(item => {
            item.classList.remove('current');
        });

        // Agregar estado 'current' al video seleccionado
        const currentVideo = document.querySelector(`.video-item[data-video-id="${currentVideoId}"]`);
        if (currentVideo) {
            currentVideo.classList.add('current');
        }

        // Agregar estado 'current' al módulo seleccionado
        const currentModule = document.querySelector(`.module-item[data-module-id="${currentModuleId}"]`);
        if (currentModule) {
            currentModule.classList.add('current');
        }
    }

    /**
     * Mostrar loading en el reproductor de video
     */
    showVideoLoading() {
        if (this.youtubePlayer) {
            this.youtubePlayer.srcdoc = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(10, 15, 25, 0.9); color: #44E5FF; font-family: 'Segoe UI', sans-serif;">
                    <div style="text-align: center;">
                        <div style="width: 40px; height: 40px; border: 3px solid rgba(68, 229, 255, 0.3); border-top: 3px solid #44E5FF; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                        <p>Cargando video...</p>
                    </div>
                    <style>
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    </style>
                </div>
            `;
        }
    }

    /**
     * Mostrar error en el reproductor de video
     */
    showVideoError(message) {
        if (this.youtubePlayer) {
            this.youtubePlayer.srcdoc = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(10, 15, 25, 0.9); color: #ef4444; font-family: 'Segoe UI', sans-serif;">
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                        <p>${message}</p>
                        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #44E5FF; color: #0A0A0A; border: none; border-radius: 6px; cursor: pointer;">Recargar</button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Mostrar error general
     */
    showError(message) {
        if (this.modulesList) {
            this.modulesList.innerHTML = `
                <div class="error-message">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>${message}</span>
                </div>
            `;
        }
    }

    /**
     * Configurar event listeners globales
     */
    setupEventListeners() {
        // Event listener para clicks en módulos y videos
        if (this.modulesList) {
            this.modulesList.addEventListener('click', (e) => {
                e.preventDefault();
            });
        }

        // console.log('[ModulesVideosManager] 👂 Event listeners configurados');
    }

    /**
     * Formatear duración en segundos a mm:ss
     */
    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Obtener ID del usuario
     */
    getUserId() {
        // Intentar obtener desde localStorage
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                return user.id;
            }
        } catch (e) {
            console.warn('[ModulesVideosManager] No se pudo obtener userData de localStorage');
        }

        // Fallback: obtener desde URL o contexto global
        const urlParams = new URLSearchParams(window.location.search);
        const userIdFromUrl = urlParams.get('userId');
        if (userIdFromUrl) return userIdFromUrl;

        // Último recurso: obtener desde contexto global si existe
        if (window.currentUser && window.currentUser.id) {
            return window.currentUser.id;
        }

        console.error('[ModulesVideosManager] ❌ No se pudo obtener ID de usuario válido');
        return null;
    }

    /**
     * Obtener ID del curso actual dinámicamente
     */
    getCurrentCourseId() {
        // Intentar obtener desde contexto global
        if (window.currentCourse && window.currentCourse.id) {
            return window.currentCourse.id;
        }

        // Obtener desde localStorage
        try {
            const courseData = localStorage.getItem('currentCourse');
            if (courseData) {
                const course = JSON.parse(courseData);
                return course.id || course.identifier;
            }
        } catch (e) {
            console.warn('[ModulesVideosManager] No se pudo obtener curso de localStorage');
        }

        // Obtener desde URL
        const urlParams = new URLSearchParams(window.location.search);
        const courseIdFromUrl = urlParams.get('courseId');
        if (courseIdFromUrl) return courseIdFromUrl;

        // Por defecto, usar el identificador estándar del curso de IA
        return 'intro-to-ai';
    }

    /**
     * Obtener datos del curso actual
     */
    getCurrentCourseData() {
        return this.courseData;
    }

    /**
     * Obtener datos del video actual
     */
    getCurrentVideoData() {
        return this.currentVideoData;
    }

    /**
     * Verificar si está inicializado
     */
    isReady() {
        return this.isInitialized;
    }
}

// Exponer la clase globalmente
window.ModulesVideosManager = ModulesVideosManager;

// console.log('[ModulesVideosManager] 📦 Clase ModulesVideosManager cargada correctamente');