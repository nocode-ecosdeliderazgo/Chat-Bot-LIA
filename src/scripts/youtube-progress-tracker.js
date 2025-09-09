// ===== YOUTUBE PROGRESS TRACKER =====
// Sistema integrado para rastrear progreso de videos de YouTube y sincronizar con backend

class YouTubeProgressTracker {
    constructor(courseProgressManager) {
        this.courseProgressManager = courseProgressManager;
        this.player = null;
        this.currentVideoId = null;
        this.currentModuleNumber = null;
        this.progressUpdateInterval = null;
        this.lastUpdateTime = 0;
        this.updateFrequency = 10000; // Actualizar cada 10 segundos
        this.completionThreshold = 0.95; // 95% para considerar completo
        
        this.init();
    }
    
    async init() {
        console.log('🎥 Inicializando YouTube Progress Tracker...');
        
        try {
            // Cargar YouTube IFrame API
            await this.loadYouTubeAPI();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            console.log('✅ YouTube Progress Tracker listo');
        } catch (error) {
            console.error('❌ Error inicializando YouTube Progress Tracker:', error);
            // Continuar sin la API de YouTube, pero marcar como disponible
            this.setupEventListeners();
        }
    }
    
    loadYouTubeAPI() {
        return new Promise((resolve, reject) => {
            // Si ya está cargada la API
            if (window.YT && window.YT.Player) {
                console.log('✅ YouTube API ya está disponible');
                resolve();
                return;
            }
            
            // Si ya está en proceso de carga
            if (window.onYouTubeIframeAPIReady) {
                const originalCallback = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = () => {
                    if (originalCallback) originalCallback();
                    console.log('✅ YouTube API cargada (callback existente)');
                    resolve();
                };
                return;
            }
            
            // Cargar API
            try {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                
                // Callback cuando la API esté lista
                window.onYouTubeIframeAPIReady = () => {
                    console.log('✅ YouTube IFrame API cargada');
                    resolve();
                };
                
                // Timeout de seguridad
                setTimeout(() => {
                    if (!window.YT || !window.YT.Player) {
                        console.warn('⚠️ Timeout cargando YouTube API, continuando sin ella');
                        resolve();
                    }
                }, 10000);
                
            } catch (error) {
                console.error('❌ Error cargando YouTube API:', error);
                reject(error);
            }
        });
    }
    
    setupEventListeners() {
        // Escuchar eventos de progreso del curso
        window.addEventListener('courseProgressUpdated', (event) => {
            this.handleProgressUpdate(event.detail);
        });
        
        // Escuchar cambios de módulo
        window.addEventListener('moduleChanged', (event) => {
            this.handleModuleChange(event.detail);
        });
    }
    
    // Inicializar player para un video específico
    initializePlayer(containerId, videoId, moduleNumber, options = {}) {
        console.log(`🎥 Inicializando player: ${videoId} para módulo ${moduleNumber}`);
        
        this.currentVideoId = videoId;
        this.currentModuleNumber = moduleNumber;
        
        // Buscar y establecer el currentVideo en dynamicVideoLoader
        this.setCurrentVideoInGlobalScope(videoId, moduleNumber);
        
        // Verificar si la API de YouTube está disponible
        if (!window.YT || !window.YT.Player) {
            console.warn('⚠️ YouTube API no disponible, creando player básico');
            this.createBasicPlayer(containerId, videoId);
            return;
        }
        
        // Configuración por defecto del player
        const defaultOptions = {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                autoplay: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                fs: 1,
                cc_load_policy: 0,
                iv_load_policy: 3,
                disablekb: 0,
                enablejsapi: 1,
                origin: window.location.origin
            },
            events: {
                'onReady': (event) => this.onPlayerReady(event),
                'onStateChange': (event) => this.onPlayerStateChange(event),
                'onError': (event) => this.onPlayerError(event)
            }
        };
        
        const playerOptions = { ...defaultOptions, ...options };
        
        try {
            // Destruir player existente si existe
            if (this.player && typeof this.player.destroy === 'function') {
                this.player.destroy();
            }
            
            // Crear nuevo player
            this.player = new YT.Player(containerId, playerOptions);
            
            console.log('✅ YouTube Player inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando YouTube Player:', error);
            this.createBasicPlayer(containerId, videoId);
        }
    }
    
    // Crear player básico cuando YouTube API no esté disponible
    createBasicPlayer(containerId, videoId) {
        console.log('🔧 Creando player básico para:', videoId);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Contenedor no encontrado:', containerId);
            return;
        }
        
        // Crear iframe básico
        container.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${videoId}?enablejsapi=0" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
        
        // Simular eventos básicos para mantener compatibilidad
        this.player = {
            getCurrentTime: () => 0,
            getDuration: () => 0,
            getPlayerState: () => -1,
            destroy: () => {
                container.innerHTML = '';
            }
        };
        
        console.log('✅ Player básico creado');
    }
    
    onPlayerReady(event) {
        console.log('✅ YouTube Player listo');
        
        // Obtener información del video
        const duration = this.player.getDuration();
        const videoUrl = this.player.getVideoUrl();
        
        console.log(`📊 Video info: ${duration}s, ${videoUrl}`);
        
        // Actualizar la duración del video en currentVideo si es un objeto básico
        if (window.dynamicVideoLoader && window.dynamicVideoLoader.currentVideo) {
            if (window.dynamicVideoLoader.currentVideo.duration_seconds === 0) {
                window.dynamicVideoLoader.currentVideo.duration_seconds = duration;
                console.log(`📊 Duración actualizada en currentVideo: ${duration}s`);
            }
        }
        
        // Iniciar seguimiento de progreso
        this.startProgressTracking();
    }
    
    onPlayerStateChange(event) {
        const states = {
            [-1]: 'unstarted',
            [0]: 'ended',
            [1]: 'playing',
            [2]: 'paused',
            [3]: 'buffering',
            [5]: 'video cued'
        };
        
        const stateName = states[event.data] || 'unknown';
        console.log(`🎥 Player state: ${stateName} (${event.data})`);
        
        switch (event.data) {
            case YT.PlayerState.PLAYING:
                this.handleVideoPlay();
                break;
            case YT.PlayerState.PAUSED:
                this.handleVideoPause();
                break;
            case YT.PlayerState.ENDED:
                this.handleVideoEnd();
                break;
        }
    }
    
    onPlayerError(event) {
        console.error('❌ YouTube Player error:', event.data);
        this.handlePlayerError(event);
    }
    
    startProgressTracking() {
        // Limpiar intervalo existente
        if (this.progressUpdateInterval) {
            clearInterval(this.progressUpdateInterval);
        }
        
        // Iniciar nuevo intervalo de seguimiento
        this.progressUpdateInterval = setInterval(() => {
            this.trackProgress();
        }, this.updateFrequency);
        
        console.log(`⏱️ Seguimiento de progreso iniciado (cada ${this.updateFrequency/1000}s)`);
    }
    
    stopProgressTracking() {
        if (this.progressUpdateInterval) {
            clearInterval(this.progressUpdateInterval);
            this.progressUpdateInterval = null;
            console.log('⏹️ Seguimiento de progreso detenido');
        }
    }
    
    async trackProgress() {
        if (!this.player || !this.player.getCurrentTime) {
            return;
        }
        
        try {
            const currentTime = this.player.getCurrentTime();
            const duration = this.player.getDuration();
            
            if (duration <= 0) return;
            
            const progressPercentage = Math.round((currentTime / duration) * 100);
            const isCompleted = progressPercentage >= (this.completionThreshold * 100);
            
            // Solo actualizar si ha pasado tiempo suficiente
            const now = Date.now();
            if (now - this.lastUpdateTime < this.updateFrequency) {
                return;
            }
            
            console.log(`📊 Video progress: ${progressPercentage}% (${Math.floor(currentTime)}/${Math.floor(duration)}s)`);
            
            // Actualizar progreso en backend
            if (this.courseProgressManager && this.currentModuleNumber) {
                await this.updateVideoProgress(progressPercentage, currentTime, isCompleted);
            }
            
            // Actualizar UI local
            this.updateProgressUI(progressPercentage, isCompleted);
            
            this.lastUpdateTime = now;
            
        } catch (error) {
            console.error('❌ Error tracking progress:', error);
        }
    }
    
    async updateVideoProgress(progressPercentage, currentTime, isCompleted) {
        try {
            const videoUpdates = {
                video_progress_percentage: progressPercentage,
                last_video_position: Math.floor(currentTime),
                video_completed: isCompleted,
                time_watched_seconds: Math.floor(currentTime)
            };
            
            console.log(`📡 Actualizando progreso video módulo ${this.currentModuleNumber}:`, videoUpdates);
            
            const result = await this.courseProgressManager.updateVideoProgress(
                this.currentModuleNumber, 
                videoUpdates
            );
            
            if (result && result.success) {
                console.log('✅ Progreso de video actualizado en backend');
                
                // Si el video se completó, verificar si el módulo también se completó
                if (isCompleted && result.module_completed) {
                    console.log(`🎯 ¡Módulo ${this.currentModuleNumber} completado!`);
                    this.handleModuleCompletion(this.currentModuleNumber);
                }
            }
            
        } catch (error) {
            console.error('❌ Error actualizando progreso de video:', error);
        }
    }
    
    updateProgressUI(progressPercentage, isCompleted) {
        // Actualizar barra de progreso si existe
        const progressBar = document.querySelector('.video-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }
        
        // Actualizar dots de progreso
        const progressDots = document.querySelectorAll('.video-progress-dots .progress-dot');
        progressDots.forEach((dot, index) => {
            const sectionStart = (index / progressDots.length) * 100;
            const sectionEnd = ((index + 1) / progressDots.length) * 100;
            
            if (progressPercentage >= sectionEnd) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
        
        // Actualizar indicador de video completado
        if (isCompleted) {
            const videoContainer = document.querySelector('.video-container');
            if (videoContainer && !videoContainer.classList.contains('completed')) {
                videoContainer.classList.add('completed');
                this.showCompletionNotification();
                
                // Emitir evento de video completado por progreso
                this.emitVideoCompletedEvent();
            }
        }
    }
    
    showCompletionNotification() {
        console.log('🎉 Video completado - Mostrando notificación');
        
        // Crear notificación de completación
        const notification = document.createElement('div');
        notification.className = 'video-completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="completion-icon">✅</span>
                <span class="completion-text">¡Video completado!</span>
            </div>
        `;
        
        // Estilos inline para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    handleVideoPlay() {
        console.log('▶️ Video iniciado');
        this.startProgressTracking();
        
        // Marcar módulo como iniciado si no lo está
        if (this.courseProgressManager && this.currentModuleNumber) {
            this.courseProgressManager.startModule(this.currentModuleNumber).catch(error => {
                console.error('❌ Error iniciando módulo:', error);
            });
        }
    }
    
    handleVideoPause() {
        console.log('⏸️ Video pausado');
        // Mantener seguimiento pero menos frecuente cuando está pausado
    }
    
    handleVideoEnd() {
        console.log('🎬 Video terminado');
        this.stopProgressTracking();
        
        // Forzar actualización final al 100%
        this.trackProgress();
        
        // Marcar como completado
        if (this.courseProgressManager && this.currentModuleNumber) {
            this.updateVideoProgress(100, this.player.getDuration(), true);
        }
        
        // Emitir evento de video completado
        this.emitVideoCompletedEvent();
    }

    emitVideoCompletedEvent() {
        console.log('📡 Emitiendo evento de video completado');
        
        const eventDetail = {
            videoId: this.currentVideoId,
            moduleNumber: this.currentModuleNumber,
            timestamp: Date.now(),
            duration: this.player && this.player.getDuration ? this.player.getDuration() : 0
        };
        
        console.log('📡 Detalle del evento:', eventDetail);
        
        const event = new CustomEvent('videoCompleted', {
            detail: eventDetail
        });
        
        window.dispatchEvent(event);
        
        // También verificar si chat-online-v2 está inicializado
        if (window.chatOnlineV2) {
            console.log('✅ chat-online-v2 encontrado, llamando directamente a handleVideoCompleted');
            window.chatOnlineV2.handleVideoCompleted(eventDetail);
        } else if (window.chatOnline) {
            console.log('✅ chatOnline encontrado, llamando directamente a handleVideoCompleted');
            if (typeof window.chatOnline.handleVideoCompleted === 'function') {
                window.chatOnline.handleVideoCompleted(eventDetail);
            }
        } else {
            console.warn('⚠️ No se encontró instancia de chat-online para llamar directamente');
        }
    }
    
    // Establecer el currentVideo en el scope global para que otros sistemas puedan accederlo
    setCurrentVideoInGlobalScope(videoId, moduleNumber) {
        try {
            // Inicializar dynamicVideoLoader si no existe
            if (!window.dynamicVideoLoader) {
                window.dynamicVideoLoader = {};
            }
            
            // Buscar el video en los datos del curso
            let currentVideo = null;
            
            // Primero intentar buscar en chatOnlineV2 si existe
            if (window.chatOnlineV2 && window.chatOnlineV2.courseData) {
                const module = window.chatOnlineV2.courseData.modules?.find(m => m.module_number === moduleNumber);
                if (module) {
                    currentVideo = module.videos?.find(v => v.id === videoId);
                }
            }
            
            // Si no se encontró, intentar buscar en otros lugares
            if (!currentVideo && window.dynamicVideoLoader.courseData) {
                const module = window.dynamicVideoLoader.courseData.modules?.find(m => m.module_number === moduleNumber);
                if (module) {
                    currentVideo = module.videos?.find(v => v.id === videoId);
                }
            }
            
            // Si encontramos el video, establecerlo como currentVideo
            if (currentVideo) {
                window.dynamicVideoLoader.currentVideo = currentVideo;
                console.log(`✅ CurrentVideo establecido:`, currentVideo.video_title || videoId);
            } else {
                // Si no podemos encontrar el video completo, buscar al menos el módulo para obtener su ID real
                console.warn(`⚠️ Video completo no encontrado, buscando información del módulo ${moduleNumber}`);
                
                let realModuleId = null;
                
                // Buscar el módulo en cualquier estructura de datos disponible
                if (window.chatOnlineV2 && window.chatOnlineV2.courseData) {
                    const module = window.chatOnlineV2.courseData.modules?.find(m => m.module_number === moduleNumber);
                    realModuleId = module?.id;
                } else if (window.dynamicVideoLoader.courseData) {
                    const module = window.dynamicVideoLoader.courseData.modules?.find(m => m.module_number === moduleNumber);
                    realModuleId = module?.id;
                }
                
                // Si no encontramos el ID real del módulo, no crear el objeto falso
                if (!realModuleId) {
                    console.error(`❌ No se pudo encontrar el ID real del módulo ${moduleNumber}. No se puede crear currentVideo.`);
                    return;
                }
                
                // Crear objeto básico con el ID real del módulo
                window.dynamicVideoLoader.currentVideo = {
                    id: videoId,
                    module_id: realModuleId,
                    video_title: `Video ${videoId}`,
                    duration_seconds: this.player && this.player.getDuration ? this.player.getDuration() : 0
                };
                
                console.log(`✅ CurrentVideo básico creado con module_id real:`, realModuleId);
            }
            
        } catch (error) {
            console.error('❌ Error estableciendo currentVideo:', error);
        }
    }
    
    handleModuleCompletion(moduleNumber) {
        console.log(`🎯 Manejando completación del módulo ${moduleNumber}`);
        
        // Emitir evento de módulo completado
        const event = new CustomEvent('moduleCompleted', {
            detail: {
                moduleNumber,
                videoId: this.currentVideoId,
                timestamp: Date.now()
            }
        });
        
        window.dispatchEvent(event);
        
        // Mostrar notificación de módulo completado
        this.showModuleCompletionNotification(moduleNumber);
        
        // Auto-desbloquear siguiente módulo
        this.unlockNextModule(moduleNumber);
    }
    
    showModuleCompletionNotification(moduleNumber) {
        const notification = document.createElement('div');
        notification.className = 'module-completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="completion-header">
                    <span class="completion-icon">🎉</span>
                    <h3>¡Módulo Completado!</h3>
                </div>
                <p>Has completado el Módulo ${moduleNumber}</p>
                <p>El siguiente módulo ya está disponible</p>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 10001;
            text-align: center;
            min-width: 300px;
            animation: popIn 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.5s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 5000);
    }
    
    unlockNextModule(completedModule) {
        console.log(`🔓 Desbloqueando módulo ${completedModule + 1}`);
        
        // Emitir evento para actualizar UI
        const event = new CustomEvent('moduleUnlocked', {
            detail: {
                unlockedModule: completedModule + 1,
                completedModule: completedModule,
                timestamp: Date.now()
            }
        });
        
        window.dispatchEvent(event);
    }
    
    handlePlayerError(error) {
        console.error('❌ Error del player:', error);
        
        // Intentar recuperación básica
        setTimeout(() => {
            console.log('🔄 Intentando recuperar player...');
            if (this.currentVideoId && this.currentModuleNumber) {
                this.initializePlayer('youtubePlayer', this.currentVideoId, this.currentModuleNumber);
            }
        }, 5000);
    }
    
    handleProgressUpdate(progressData) {
        console.log('📊 Progress update received:', progressData);
        // Actualizar UI basado en datos del backend
    }
    
    handleModuleChange(moduleData) {
        console.log('🔄 Module change:', moduleData);
        
        if (moduleData.videoId && moduleData.moduleNumber) {
            // Cambiar a nuevo video
            this.initializePlayer('youtubePlayer', moduleData.videoId, moduleData.moduleNumber);
        }
    }
    
    // Método público para cambiar video manualmente
    changeVideo(videoId, moduleNumber) {
        console.log(`🎥 Cambiando a video: ${videoId} (Módulo ${moduleNumber})`);
        this.initializePlayer('youtubePlayer', videoId, moduleNumber);
    }
    
    // Método público para obtener estado actual
    getCurrentState() {
        if (!this.player) return null;
        
        return {
            videoId: this.currentVideoId,
            moduleNumber: this.currentModuleNumber,
            currentTime: this.player.getCurrentTime ? this.player.getCurrentTime() : 0,
            duration: this.player.getDuration ? this.player.getDuration() : 0,
            state: this.player.getPlayerState ? this.player.getPlayerState() : -1
        };
    }
    
    // Limpieza
    destroy() {
        console.log('🧹 Destruyendo YouTube Progress Tracker...');
        
        this.stopProgressTracking();
        
        if (this.player && typeof this.player.destroy === 'function') {
            this.player.destroy();
        }
        
        this.player = null;
        this.currentVideoId = null;
        this.currentModuleNumber = null;
    }
}

// CSS para animaciones (agregar al head si no existen)
if (!document.querySelector('#youtube-tracker-styles')) {
    const styles = document.createElement('style');
    styles.id = 'youtube-tracker-styles';
    styles.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes popIn {
            from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .video-container.completed {
            border: 2px solid #4CAF50 !important;
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.3) !important;
        }
        
        .video-progress-bar {
            background: #4CAF50;
            height: 4px;
            border-radius: 2px;
            transition: width 0.3s ease;
        }
    `;
    document.head.appendChild(styles);
}

// Crear instancia global
window.YouTubeProgressTracker = YouTubeProgressTracker;

// Emitir evento cuando esté disponible
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (window.YouTubeProgressTracker) {
            console.log('🎯 YouTubeProgressTracker listo en window.load');
            window.dispatchEvent(new CustomEvent('youtubeProgressTrackerReady', {
                detail: { tracker: window.YouTubeProgressTracker }
            }));
        }
    });
}

// export default YouTubeProgressTracker; // Removido para compatibilidad con navegador