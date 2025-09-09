// =====================================================
// COURSE PROGRESS MANAGER V2
// Gestión completa de progreso con APIs dinámicas
// Integrado con sistema de base de datos
// =====================================================

class CourseProgressManagerV2 {
    constructor() {
        this.userId = null;
        this.courseId = '550e8400-e29b-41d4-a716-446655440001'; // UUID real del curso
        this.currentProgress = null;
        this.videoTracker = null;
        this.progressCache = new Map();
        this.cacheTimestamp = null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutos
        this.isUpdating = false;
        this.apiBaseUrl = this.getApiBaseUrl();
        this.updateInterval = null;
        this.lastVideoTime = 0;
        
        console.log('📈 Course Progress Manager V2 creado');
        this.init();
    }

    // =====================================================
    // INICIALIZACIÓN
    // =====================================================

    async init() {
        try {
            console.log('🚀 Inicializando Course Progress Manager V2...');
            
            // 1. Obtener usuario actual
            this.userId = this.getCurrentUserId();
            console.log('👤 Usuario:', this.userId);

            // 2. Cargar progreso inicial
            await this.loadInitialProgress();

            // 3. Configurar tracking de video
            this.setupVideoTracking();

            // 4. Configurar auto-guardado
            this.setupAutoSave();

            console.log('✅ Course Progress Manager V2 inicializado exitosamente');

        } catch (error) {
            console.error('💥 Error inicializando Progress Manager:', error);
        }
    }

    async loadInitialProgress() {
        try {
            console.log('📊 Cargando progreso inicial...');

            const response = await this.apiCall(`/users/${this.userId}/progress/${this.courseId}`, {
                method: 'GET'
            });

            if (response.success) {
                this.currentProgress = response;
                console.log('✅ Progreso inicial cargado:', response.summary);
            } else {
                console.warn('⚠️ No se pudo cargar progreso inicial');
                this.currentProgress = this.getDefaultProgress();
            }

        } catch (error) {
            console.error('❌ Error cargando progreso inicial:', error);
            this.currentProgress = this.getDefaultProgress();
        }
    }

    // =====================================================
    // CONFIGURACIÓN Y UTILIDADES
    // =====================================================

    getCurrentUserId() {
        try {
            // 1. Del localStorage
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                return user.id;
            }

            // 2. UserId directo
            const directUserId = localStorage.getItem('userId');
            if (directUserId) {
                return directUserId;
            }

            // 3. Del sessionStorage
            const sessionData = sessionStorage.getItem('userData');
            if (sessionData) {
                const user = JSON.parse(sessionData);
                return user.id;
            }

            // 4. De la URL
            const urlParams = new URLSearchParams(window.location.search);
            const urlUserId = urlParams.get('userId');
            if (urlUserId) {
                return urlUserId;
            }

            // 5. Demo user persistente
            let demoId = localStorage.getItem('demoUserId');
            if (!demoId) {
                demoId = 'demo-user-123';
                localStorage.setItem('demoUserId', demoId);
            }
            return demoId;
            
        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            return 'demo-user-fallback';
        }
    }

    getApiBaseUrl() {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isNetlify = window.location.hostname.includes('netlify.app') || 
                         window.location.hostname.includes('netlify.com');
        const currentPort = window.location.port;

        console.log(`🔍 Detectando entorno - localhost: ${isLocalhost}, netlify: ${isNetlify}, port: ${currentPort}`);

        if (isLocalhost && (currentPort === '3000' || window.location.href.includes(':3000'))) {
            console.log('🏠 Entorno: Node.js local puerto 3000');
            return '/api';
        } else if (isLocalhost && (currentPort === '3001' || window.location.href.includes(':3001'))) {
            console.log('🏠 Entorno: Node.js local puerto 3001');
            return '/api';
        } else if (isLocalhost && currentPort === '8888') {
            console.log('🏠 Entorno: Netlify Dev local');
            return '/.netlify/functions';
        } else if (isLocalhost) {
            console.log('🏠 Entorno: Servidor local genérico');
            return '/api';
        } else {
            console.log('🌐 Entorno: Netlify producción - usando rutas con redirects');
            return '/api'; // Cambiar a /api para usar los redirects de Netlify
        }
    }

    async apiCall(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': this.userId
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };

        // Construir URL completa
        const fullUrl = `${this.apiBaseUrl}${endpoint}`;

        try {
            console.log(`🌐 API Call: ${mergedOptions.method || 'GET'} ${fullUrl}`);
            
            const response = await fetch(fullUrl, mergedOptions);
            
            if (!response.ok) {
                const errorText = await response.text();
                
                // Detectar si recibimos HTML en lugar de JSON (error 404 de Netlify)
                if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
                    console.warn('⚠️ Recibido HTML en lugar de JSON - posible problema de routing');
                    throw new Error(`Endpoint no encontrado: ${fullUrl} (Status: ${response.status})`);
                }
                
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Verificar que la respuesta es JSON válida
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                    console.warn('⚠️ Respuesta HTML recibida en lugar de JSON');
                    throw new Error(`Respuesta inválida del servidor: ${fullUrl} - recibido HTML en lugar de JSON`);
                }
                throw new Error(`Respuesta no es JSON: ${contentType}`);
            }

            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error(`❌ API Error: ${fullUrl}`, error);
            
            // Si es un error de parsing JSON y el mensaje incluye 'DOCTYPE', es un error 404/routing
            if (error.message.includes('Unexpected token') && error.message.includes('DOCTYPE')) {
                throw new Error(`Endpoint no disponible en Netlify: ${fullUrl}. Verifica la configuración de redirects.`);
            }
            
            throw error;
        }
    }

    getDefaultProgress() {
        return {
            success: false,
            course_progress: {
                overall_percentage: 0,
                completed_modules: 0,
                completed_videos: 0,
                current_module_id: null
            },
            video_progress: [],
            summary: {
                total_videos_watched: 0,
                completed_videos: 0,
                last_activity: null
            }
        };
    }

    // =====================================================
    // TRACKING DE VIDEO
    // =====================================================

    setupVideoTracking() {
        console.log('🎥 Configurando tracking de video...');

        // Buscar el iframe de YouTube
        const iframe = document.getElementById('youtubePlayer');
        if (!iframe) {
            console.warn('⚠️ No se encontró iframe de YouTube');
            return;
        }

        // Configurar tracking usando postMessage API
        this.setupYouTubeTracking(iframe);
    }

    setupYouTubeTracking(iframe) {
        // YouTube Player API via postMessage
        window.addEventListener('message', (event) => {
            if (event.origin !== 'https://www.youtube.com') return;

            try {
                const data = JSON.parse(event.data);
                this.handleYouTubeEvent(data);
            } catch (error) {
                // Ignorar mensajes que no son JSON válido
            }
        });

        // También intentar obtener tiempo actual periódicamente
        this.videoTimeInterval = setInterval(() => {
            this.trackVideoTime();
        }, 5000); // Cada 5 segundos
    }

    handleYouTubeEvent(data) {
        if (data.event === 'video-progress') {
            this.onVideoTimeUpdate(data.info);
        } else if (data.event === 'video-play') {
            this.onVideoPlay();
        } else if (data.event === 'video-pause') {
            this.onVideoPause();
        }
    }

    trackVideoTime() {
        // Obtener tiempo del video desde el iframe si es posible
        const iframe = document.getElementById('youtubePlayer');
        if (iframe && iframe.contentWindow) {
            try {
                // Intentar obtener currentTime del video
                // Nota: Esto puede requerir YouTube Player API
                this.getCurrentVideoTime();
            } catch (error) {
                // Silencioso - es esperado en cross-origin
            }
        }
    }

    getCurrentVideoTime() {
        // Esta función necesitaría YouTube Player API para funcionar completamente
        // Por ahora, usar tracking manual o estimación
        return this.lastVideoTime || 0;
    }

    onVideoTimeUpdate(currentTime) {
        if (typeof currentTime === 'number') {
            this.lastVideoTime = currentTime;
            this.scheduleProgressUpdate(currentTime);
        }
    }

    onVideoPlay() {
        console.log('▶️ Video iniciado/reanudado');
        this.startProgressTracking();
    }

    onVideoPause() {
        console.log('⏸️ Video pausado');
        this.updateProgressImmediate();
    }

    // =====================================================
    // ACTUALIZACIÓN DE PROGRESO
    // =====================================================

    scheduleProgressUpdate(currentTime) {
        // Actualizar progreso cada 30 segundos o cuando hay cambios significativos
        const now = Date.now();
        const timeSinceLastUpdate = now - (this.lastProgressUpdate || 0);
        
        if (timeSinceLastUpdate >= 30000 || this.shouldForceUpdate(currentTime)) {
            this.updateProgressImmediate(currentTime);
        }
    }

    shouldForceUpdate(currentTime) {
        // Forzar actualización en puntos importantes (cada 10% del video)
        const videoElement = document.getElementById('youtubePlayer');
        if (!videoElement) return false;

        // Estimación basada en duración típica de videos (15-25 min)
        const estimatedDuration = 20 * 60; // 20 minutos promedio
        const progressPercentage = (currentTime / estimatedDuration) * 100;
        
        // Forzar en múltiplos de 10%
        return Math.floor(progressPercentage) % 10 === 0;
    }

    async updateProgressImmediate(currentTime) {
        if (this.isUpdating) {
            console.log('⏳ Actualización ya en progreso...');
            return;
        }

        this.isUpdating = true;
        const time = currentTime || this.getCurrentVideoTime();

        try {
            // Obtener datos del video actual desde dynamic video loader
            const currentVideo = window.dynamicVideoLoader?.currentVideo;
            if (!currentVideo) {
                console.warn('⚠️ No hay video actual para actualizar progreso');
                return;
            }

            const videoDuration = currentVideo.duration_seconds;
            const completionPercentage = videoDuration > 0 ? (time / videoDuration) * 100 : 0;
            const isCompleted = completionPercentage >= 90; // Considerar completado al 90%

            console.log(`📊 Actualizando progreso: ${Math.round(completionPercentage)}% (${time}s/${videoDuration}s)`);

            const response = await this.apiCall(`/users/${this.userId}/video-progress`, {
                method: 'POST',
                body: JSON.stringify({
                    userId: this.userId,
                    courseId: this.courseId,
                    moduleId: currentVideo.module_id,
                    videoId: currentVideo.id,
                    currentTimeSeconds: Math.round(time),
                    completionPercentage: Math.round(completionPercentage * 100) / 100,
                    isCompleted: isCompleted,
                    actionType: 'progress_update'
                })
            });

            if (response.success) {
                this.currentProgress.video_progress = response.video_progress;
                this.lastProgressUpdate = Date.now();
                
                // Actualizar UI si es necesario
                this.updateProgressUI(response);
                
                // Si el video se completó, emitir evento
                if (isCompleted) {
                    this.emitVideoCompletedEvent(currentVideo);
                }
                
                console.log('✅ Progreso actualizado exitosamente');
            }

        } catch (error) {
            console.error('❌ Error actualizando progreso:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    updateProgressUI(progressData) {
        // Actualizar indicadores visuales
        const progressPercentage = progressData.video_progress?.completion_percentage || 0;
        
        // Actualizar barra de progreso del video
        const videoProgressBar = document.querySelector('.video-progress-bar');
        if (videoProgressBar) {
            videoProgressBar.style.width = `${progressPercentage}%`;
        }

        // Disparar evento personalizado para que otros componentes se actualicen
        window.dispatchEvent(new CustomEvent('progressUpdated', {
            detail: progressData
        }));
    }

    emitVideoCompletedEvent(videoData) {
        console.log('📡 Emitiendo evento de video completado desde CourseProgressManager');
        
        const event = new CustomEvent('videoCompleted', {
            detail: {
                videoId: videoData.id,
                moduleId: videoData.module_id,
                videoTitle: videoData.video_title,
                timestamp: Date.now()
            }
        });
        
        window.dispatchEvent(event);
    }

    // =====================================================
    // AUTO-GUARDADO
    // =====================================================

    setupAutoSave() {
        console.log('💾 Configurando auto-guardado...');

        // Guardar progreso cada 2 minutos
        this.autoSaveInterval = setInterval(() => {
            if (this.lastVideoTime > 0) {
                this.updateProgressImmediate();
            }
        }, 120000); // 2 minutos

        // Guardar al cambiar de página/cerrar ventana
        window.addEventListener('beforeunload', () => {
            this.updateProgressImmediate();
        });

        // Guardar cuando la página pierde el foco
        window.addEventListener('blur', () => {
            this.updateProgressImmediate();
        });
    }

    startProgressTracking() {
        // Iniciar tracking activo cuando el video está reproduciéndose
        if (this.progressTrackingInterval) {
            clearInterval(this.progressTrackingInterval);
        }

        this.progressTrackingInterval = setInterval(() => {
            this.lastVideoTime += 1; // Incrementar tiempo estimado
            this.scheduleProgressUpdate(this.lastVideoTime);
        }, 1000); // Cada segundo
    }

    stopProgressTracking() {
        if (this.progressTrackingInterval) {
            clearInterval(this.progressTrackingInterval);
            this.progressTrackingInterval = null;
        }
    }

    // =====================================================
    // MÉTODOS PÚBLICOS PARA INTEGRACIÓN
    // =====================================================

    async switchToModule(moduleId) {
        try {
            console.log(`🔄 Cambiando progreso a módulo: ${moduleId}`);

            const response = await this.apiCall('/users/switch-module', {
                method: 'POST',
                body: JSON.stringify({
                    userId: this.userId,
                    courseId: this.courseId,
                    moduleId: moduleId
                })
            });

            if (response.success) {
                // Actualizar progreso local
                this.currentProgress.course_progress.current_module_id = moduleId;
                console.log('✅ Progreso de módulo actualizado');
                return response;
            } else {
                throw new Error(response.error);
            }

        } catch (error) {
            console.error('❌ Error cambiando módulo:', error);
            throw error;
        }
    }

    async markVideoCompleted(videoId) {
        try {
            const currentVideo = window.dynamicVideoLoader?.currentVideo;
            if (!currentVideo) return;

            await this.apiCall(`/users/${this.userId}/video-progress`, {
                method: 'POST',
                body: JSON.stringify({
                    userId: this.userId,
                    courseId: this.courseId,
                    moduleId: currentVideo.module_id,
                    videoId: videoId,
                    currentTimeSeconds: currentVideo.duration_seconds,
                    completionPercentage: 100,
                    isCompleted: true,
                    actionType: 'complete'
                })
            });

            console.log('✅ Video marcado como completado');

        } catch (error) {
            console.error('❌ Error marcando video como completado:', error);
        }
    }

    async getProgressSummary() {
        try {
            const response = await this.apiCall(`/users/${this.userId}/progress/${this.courseId}`, {
                method: 'GET'
            });

            return response.success ? response : this.getDefaultProgress();

        } catch (error) {
            console.error('❌ Error obteniendo resumen de progreso:', error);
            return this.getDefaultProgress();
        }
    }

    // =====================================================
    // LIMPIEZA
    // =====================================================

    destroy() {
        console.log('🧹 Limpiando Course Progress Manager V2...');

        // Actualizar progreso final
        this.updateProgressImmediate();

        // Limpiar intervalos
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        if (this.videoTimeInterval) {
            clearInterval(this.videoTimeInterval);
        }

        if (this.progressTrackingInterval) {
            clearInterval(this.progressTrackingInterval);
        }

        // Limpiar event listeners
        window.removeEventListener('beforeunload', this.updateProgressImmediate);
        window.removeEventListener('blur', this.updateProgressImmediate);

        console.log('✅ Course Progress Manager V2 limpiado');
    }
}

// =====================================================
// INICIALIZACIÓN GLOBAL
// =====================================================

// Variable global para acceso
window.courseProgressManager = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📈 Inicializando Course Progress Manager V2...');
    
    // Esperar un poco para que otros componentes se inicialicen
    setTimeout(() => {
        window.courseProgressManager = new CourseProgressManagerV2();
    }, 1000);
});

// Limpiar al cerrar la página
window.addEventListener('beforeunload', () => {
    if (window.courseProgressManager) {
        window.courseProgressManager.destroy();
    }
});

// Exportar clase para uso modular
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CourseProgressManagerV2;
}