/**
 * Video Player Component
 * Reproductor de video especializado para cursos asincrónicos
 */

class VideoPlayer {
    constructor(videoElementId) {
        this.videoElement = document.getElementById(videoElementId);
        this.videoId = videoElementId;
        this.isInitialized = false;
        this.bookmarks = [];
        this.watchTime = 0;
        this.lastPosition = 0;
        this.playbackSpeed = 1.0;
        this.qualitySettings = ['1080p', '720p', '480p', '360p'];
        this.currentQuality = '720p';
        this.isFullscreen = false;
        this.subtitles = [];
        this.currentSubtitle = null;
        
        this.init();
    }

    /**
     * Inicializar reproductor
     */
    init() {
        if (!this.videoElement) {
            console.error('Elemento de video no encontrado');
            return;
        }

        this.setupEventListeners();
        this.createCustomControls();
        this.loadVideoProgress();
        this.loadBookmarks();
        this.setupKeyboardShortcuts();
        this.initializeSubtitles();
        
        this.isInitialized = true;
        console.log('🎥 Video Player inicializado');
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Eventos básicos del video
        this.videoElement.addEventListener('loadedmetadata', () => {
            this.onVideoLoaded();
        });

        this.videoElement.addEventListener('timeupdate', () => {
            this.onTimeUpdate();
        });

        this.videoElement.addEventListener('play', () => {
            this.onPlay();
        });

        this.videoElement.addEventListener('pause', () => {
            this.onPause();
        });

        this.videoElement.addEventListener('ended', () => {
            this.onVideoEnded();
        });

        this.videoElement.addEventListener('progress', () => {
            this.updateBufferProgress();
        });

        this.videoElement.addEventListener('waiting', () => {
            this.showBuffering(true);
        });

        this.videoElement.addEventListener('canplay', () => {
            this.showBuffering(false);
        });

        // Eventos de pantalla completa
        document.addEventListener('fullscreenchange', () => {
            this.onFullscreenChange();
        });

        // Eventos de teclado
        this.videoElement.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Crear controles personalizados
     */
    createCustomControls() {
        const videoContainer = this.videoElement.parentElement;
        
        // Ocultar controles nativos
        this.videoElement.controls = false;
        
        // Crear overlay de controles
        const controlsOverlay = document.createElement('div');
        controlsOverlay.className = 'video-controls-overlay';
        controlsOverlay.innerHTML = this.getControlsHTML();
        
        videoContainer.appendChild(controlsOverlay);
        
        // Configurar eventos de controles
        this.setupControlsEvents(controlsOverlay);
        
        // Auto-ocultar controles
        this.setupAutoHideControls(videoContainer, controlsOverlay);
    }

    /**
     * Obtener HTML de controles personalizados
     */
    getControlsHTML() {
        return `
            <div class="video-controls">
                <div class="progress-container">
                    <div class="buffer-progress"></div>
                    <div class="play-progress"></div>
                    <div class="progress-handle"></div>
                    <div class="bookmarks-container"></div>
                </div>
                
                <div class="controls-bottom">
                    <div class="controls-left">
                        <button class="control-btn play-pause-btn" title="Reproducir/Pausar (Espacio)">
                            <i class="fas fa-play"></i>
                        </button>
                        
                        <button class="control-btn skip-backward" title="Retroceder 10s (←)">
                            <i class="fas fa-backward"></i>
                        </button>
                        
                        <button class="control-btn skip-forward" title="Avanzar 10s (→)">
                            <i class="fas fa-forward"></i>
                        </button>
                        
                        <div class="volume-container">
                            <button class="control-btn volume-btn" title="Silenciar (M)">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <div class="volume-slider">
                                <input type="range" min="0" max="100" value="100" class="volume-range">
                            </div>
                        </div>
                        
                        <div class="time-display">
                            <span class="current-time">00:00</span> / 
                            <span class="total-time">00:00</span>
                        </div>
                    </div>
                    
                    <div class="controls-right">
                        <button class="control-btn bookmark-btn" title="Añadir marcador (B)">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        
                        <div class="speed-container">
                            <button class="control-btn speed-btn" title="Velocidad de reproducción">
                                <span class="speed-text">1x</span>
                            </button>
                            <div class="speed-menu">
                                <button data-speed="0.5">0.5x</button>
                                <button data-speed="0.75">0.75x</button>
                                <button data-speed="1" class="active">1x</button>
                                <button data-speed="1.25">1.25x</button>
                                <button data-speed="1.5">1.5x</button>
                                <button data-speed="2">2x</button>
                            </div>
                        </div>
                        
                        <button class="control-btn quality-btn" title="Calidad de video">
                            <i class="fas fa-cog"></i>
                            <span class="quality-text">720p</span>
                        </button>
                        
                        <button class="control-btn subtitles-btn" title="Subtítulos (C)">
                            <i class="fas fa-closed-captioning"></i>
                        </button>
                        
                        <button class="control-btn picture-in-picture-btn" title="Picture in Picture (P)">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        
                        <button class="control-btn fullscreen-btn" title="Pantalla completa (F)">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="video-overlay-center">
                <button class="big-play-btn">
                    <i class="fas fa-play"></i>
                </button>
                
                <div class="buffering-indicator" style="display: none;">
                    <div class="spinner"></div>
                </div>
            </div>
            
            <div class="video-info-overlay">
                <div class="chapter-info"></div>
                <div class="subtitle-container"></div>
            </div>
        `;
    }

    /**
     * Configurar eventos de controles
     */
    setupControlsEvents(controlsOverlay) {
        // Play/Pause
        const playPauseBtn = controlsOverlay.querySelector('.play-pause-btn');
        const bigPlayBtn = controlsOverlay.querySelector('.big-play-btn');
        
        [playPauseBtn, bigPlayBtn].forEach(btn => {
            btn.addEventListener('click', () => this.togglePlayPause());
        });

        // Skip buttons
        controlsOverlay.querySelector('.skip-backward').addEventListener('click', () => {
            this.skipBackward(10);
        });

        controlsOverlay.querySelector('.skip-forward').addEventListener('click', () => {
            this.skipForward(10);
        });

        // Volume
        this.setupVolumeControls(controlsOverlay);

        // Progress bar
        this.setupProgressBar(controlsOverlay);

        // Bookmark
        controlsOverlay.querySelector('.bookmark-btn').addEventListener('click', () => {
            this.addBookmark();
        });

        // Speed control
        this.setupSpeedControl(controlsOverlay);

        // Quality
        this.setupQualityControl(controlsOverlay);

        // Subtitles
        controlsOverlay.querySelector('.subtitles-btn').addEventListener('click', () => {
            this.toggleSubtitles();
        });

        // Picture in Picture
        controlsOverlay.querySelector('.picture-in-picture-btn').addEventListener('click', () => {
            this.togglePictureInPicture();
        });

        // Fullscreen
        controlsOverlay.querySelector('.fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    /**
     * Configurar controles de volumen
     */
    setupVolumeControls(controlsOverlay) {
        const volumeBtn = controlsOverlay.querySelector('.volume-btn');
        const volumeSlider = controlsOverlay.querySelector('.volume-range');
        const volumeContainer = controlsOverlay.querySelector('.volume-container');

        volumeBtn.addEventListener('click', () => {
            this.toggleMute();
        });

        volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });

        // Mostrar slider al hacer hover
        volumeContainer.addEventListener('mouseenter', () => {
            volumeContainer.classList.add('show-slider');
        });

        volumeContainer.addEventListener('mouseleave', () => {
            volumeContainer.classList.remove('show-slider');
        });
    }

    /**
     * Configurar barra de progreso
     */
    setupProgressBar(controlsOverlay) {
        const progressContainer = controlsOverlay.querySelector('.progress-container');
        const progressHandle = controlsOverlay.querySelector('.progress-handle');
        let isDragging = false;

        progressContainer.addEventListener('click', (e) => {
            if (e.target === progressHandle) return;
            this.seekToPercentage(this.getClickPercentage(e, progressContainer));
        });

        progressHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            this.seekToPercentage(this.getClickPercentage(e, progressContainer));
        };

        const handleMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        // Mostrar preview al hacer hover
        progressContainer.addEventListener('mousemove', (e) => {
            this.showProgressPreview(e, progressContainer);
        });

        progressContainer.addEventListener('mouseleave', () => {
            this.hideProgressPreview();
        });
    }

    /**
     * Configurar control de velocidad
     */
    setupSpeedControl(controlsOverlay) {
        const speedBtn = controlsOverlay.querySelector('.speed-btn');
        const speedMenu = controlsOverlay.querySelector('.speed-menu');
        const speedButtons = speedMenu.querySelectorAll('button');

        speedBtn.addEventListener('click', () => {
            speedMenu.classList.toggle('show');
        });

        speedButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const speed = parseFloat(btn.getAttribute('data-speed'));
                this.setPlaybackSpeed(speed);
                
                speedButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                speedMenu.classList.remove('show');
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!speedBtn.contains(e.target) && !speedMenu.contains(e.target)) {
                speedMenu.classList.remove('show');
            }
        });
    }

    /**
     * Configurar control de calidad
     */
    setupQualityControl(controlsOverlay) {
        const qualityBtn = controlsOverlay.querySelector('.quality-btn');
        
        qualityBtn.addEventListener('click', () => {
            this.showQualityMenu();
        });
    }

    /**
     * Configurar auto-ocultar controles
     */
    setupAutoHideControls(container, overlay) {
        let hideTimeout;

        const showControls = () => {
            overlay.classList.add('show');
            clearTimeout(hideTimeout);
            
            hideTimeout = setTimeout(() => {
                if (!this.videoElement.paused) {
                    overlay.classList.remove('show');
                }
            }, 3000);
        };

        const hideControls = () => {
            if (!this.videoElement.paused) {
                overlay.classList.remove('show');
            }
        };

        container.addEventListener('mousemove', showControls);
        container.addEventListener('mouseenter', showControls);
        container.addEventListener('mouseleave', hideControls);
        
        // Mostrar controles cuando esté pausado
        this.videoElement.addEventListener('pause', () => {
            overlay.classList.add('show');
            clearTimeout(hideTimeout);
        });

        this.videoElement.addEventListener('play', () => {
            hideTimeout = setTimeout(() => {
                overlay.classList.remove('show');
            }, 3000);
        });
    }

    /**
     * Configurar atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (document.activeElement.tagName === 'INPUT') return;
            
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Manejar atajos de teclado
     */
    handleKeyboardShortcuts(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                this.skipBackward(5);
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                this.skipForward(5);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.adjustVolume(0.1);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.adjustVolume(-0.1);
                break;
                
            case 'KeyM':
                this.toggleMute();
                break;
                
            case 'KeyF':
                this.toggleFullscreen();
                break;
                
            case 'KeyB':
                this.addBookmark();
                break;
                
            case 'KeyC':
                this.toggleSubtitles();
                break;
                
            case 'KeyP':
                this.togglePictureInPicture();
                break;
        }
    }

    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (this.videoElement.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    /**
     * Reproducir video
     */
    play() {
        this.videoElement.play().then(() => {
            this.updatePlayButton(false);
            this.trackWatchTime();
        }).catch(error => {
            console.error('Error reproduciendo video:', error);
        });
    }

    /**
     * Pausar video
     */
    pause() {
        this.videoElement.pause();
        this.updatePlayButton(true);
        this.saveProgress();
    }

    /**
     * Saltar hacia atrás
     */
    skipBackward(seconds) {
        this.videoElement.currentTime = Math.max(0, this.videoElement.currentTime - seconds);
        this.showSkipFeedback(`-${seconds}s`);
    }

    /**
     * Saltar hacia adelante
     */
    skipForward(seconds) {
        this.videoElement.currentTime = Math.min(
            this.videoElement.duration, 
            this.videoElement.currentTime + seconds
        );
        this.showSkipFeedback(`+${seconds}s`);
    }

    /**
     * Buscar a un tiempo específico
     */
    seekTo(time) {
        this.videoElement.currentTime = Math.max(0, Math.min(this.videoElement.duration, time));
    }

    /**
     * Buscar a un porcentaje específico
     */
    seekToPercentage(percentage) {
        const time = (percentage / 100) * this.videoElement.duration;
        this.seekTo(time);
    }

    /**
     * Establecer velocidad de reproducción
     */
    setPlaybackSpeed(speed) {
        this.videoElement.playbackRate = speed;
        this.playbackSpeed = speed;
        
        const speedText = document.querySelector('.speed-text');
        if (speedText) {
            speedText.textContent = `${speed}x`;
        }
        
        this.savePreferences();
    }

    /**
     * Establecer volumen
     */
    setVolume(volume) {
        this.videoElement.volume = Math.max(0, Math.min(1, volume));
        this.updateVolumeDisplay();
        this.savePreferences();
    }

    /**
     * Ajustar volumen
     */
    adjustVolume(delta) {
        this.setVolume(this.videoElement.volume + delta);
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.videoElement.muted = !this.videoElement.muted;
        this.updateVolumeDisplay();
    }

    /**
     * Toggle pantalla completa
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.videoElement.closest('.video-player').requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Toggle Picture in Picture
     */
    togglePictureInPicture() {
        if ('pictureInPictureEnabled' in document) {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            } else {
                this.videoElement.requestPictureInPicture();
            }
        }
    }

    /**
     * Añadir marcador
     */
    addBookmark(title = null) {
        const time = this.videoElement.currentTime;
        const bookmark = {
            time: time,
            title: title || `Marcador ${this.formatTime(time)}`,
            timestamp: new Date()
        };
        
        this.bookmarks.push(bookmark);
        this.saveBookmarks();
        this.updateBookmarksDisplay();
        this.showBookmarkFeedback();
        
        // Notificar a otros componentes
        const event = new CustomEvent('bookmarkAdded', {
            detail: bookmark
        });
        document.dispatchEvent(event);
    }

    /**
     * Cargar marcadores
     */
    loadBookmarks() {
        try {
            const stored = localStorage.getItem(`videoBookmarks_${this.videoId}`);
            if (stored) {
                this.bookmarks = JSON.parse(stored);
                this.updateBookmarksDisplay();
            }
        } catch (error) {
            console.error('Error cargando marcadores:', error);
        }
    }

    /**
     * Guardar marcadores
     */
    saveBookmarks() {
        try {
            localStorage.setItem(`videoBookmarks_${this.videoId}`, JSON.stringify(this.bookmarks));
        } catch (error) {
            console.error('Error guardando marcadores:', error);
        }
    }

    /**
     * Actualizar visualización de marcadores
     */
    updateBookmarksDisplay() {
        const container = document.querySelector('.bookmarks-container');
        if (!container) return;

        container.innerHTML = '';
        
        this.bookmarks.forEach((bookmark, index) => {
            const bookmarkEl = document.createElement('div');
            bookmarkEl.className = 'bookmark-marker';
            bookmarkEl.style.left = `${(bookmark.time / this.videoElement.duration) * 100}%`;
            bookmarkEl.title = bookmark.title;
            
            bookmarkEl.addEventListener('click', () => {
                this.seekTo(bookmark.time);
            });
            
            container.appendChild(bookmarkEl);
        });
    }

    /**
     * Inicializar subtítulos
     */
    initializeSubtitles() {
        // Cargar subtítulos disponibles
        this.loadAvailableSubtitles();
    }

    /**
     * Toggle subtítulos
     */
    toggleSubtitles() {
        // Implementar toggle de subtítulos
        console.log('Toggle subtítulos');
    }

    /**
     * Eventos del video
     */
    onVideoLoaded() {
        this.updateTimeDisplay();
        this.updateProgressBar();
        this.restoreProgress();
    }

    onTimeUpdate() {
        this.updateTimeDisplay();
        this.updateProgressBar();
        this.updateSubtitles();
        this.trackProgress();
    }

    onPlay() {
        this.updatePlayButton(false);
        this.hideBigPlayButton();
    }

    onPause() {
        this.updatePlayButton(true);
        this.saveProgress();
    }

    onVideoEnded() {
        this.updatePlayButton(true);
        this.showBigPlayButton();
        this.markAsCompleted();
        this.saveProgress();
    }

    onFullscreenChange() {
        this.isFullscreen = !!document.fullscreenElement;
        this.updateFullscreenButton();
    }

    /**
     * Actualizar botón de play
     */
    updatePlayButton(isPaused) {
        const playBtn = document.querySelector('.play-pause-btn i');
        if (playBtn) {
            playBtn.className = isPaused ? 'fas fa-play' : 'fas fa-pause';
        }
    }

    /**
     * Actualizar visualización de tiempo
     */
    updateTimeDisplay() {
        const currentTimeEl = document.querySelector('.current-time');
        const totalTimeEl = document.querySelector('.total-time');
        
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(this.videoElement.currentTime);
        }
        
        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(this.videoElement.duration);
        }
    }

    /**
     * Actualizar barra de progreso
     */
    updateProgressBar() {
        const playProgress = document.querySelector('.play-progress');
        const progressHandle = document.querySelector('.progress-handle');
        
        if (playProgress && this.videoElement.duration) {
            const percentage = (this.videoElement.currentTime / this.videoElement.duration) * 100;
            playProgress.style.width = `${percentage}%`;
            
            if (progressHandle) {
                progressHandle.style.left = `${percentage}%`;
            }
        }
    }

    /**
     * Formatear tiempo
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Mostrar feedback de salto
     */
    showSkipFeedback(text) {
        // Implementar feedback visual
        console.log(`Skip: ${text}`);
    }

    /**
     * Mostrar feedback de marcador
     */
    showBookmarkFeedback() {
        // Implementar feedback visual
        console.log('Marcador añadido');
    }

    /**
     * Cargar progreso guardado
     */
    loadVideoProgress() {
        try {
            const stored = localStorage.getItem(`videoProgress_${this.videoId}`);
            if (stored) {
                const progress = JSON.parse(stored);
                this.lastPosition = progress.position || 0;
                this.watchTime = progress.watchTime || 0;
            }
        } catch (error) {
            console.error('Error cargando progreso:', error);
        }
    }

    /**
     * Restaurar progreso
     */
    restoreProgress() {
        if (this.lastPosition > 10) { // Solo si han pasado más de 10 segundos
            this.seekTo(this.lastPosition);
        }
    }

    /**
     * Guardar progreso
     */
    saveProgress() {
        try {
            const progress = {
                position: this.videoElement.currentTime,
                watchTime: this.watchTime,
                duration: this.videoElement.duration,
                completed: this.videoElement.currentTime >= this.videoElement.duration * 0.9,
                lastUpdate: new Date()
            };
            
            localStorage.setItem(`videoProgress_${this.videoId}`, JSON.stringify(progress));
        } catch (error) {
            console.error('Error guardando progreso:', error);
        }
    }

    /**
     * Marcar como completado
     */
    markAsCompleted() {
        const event = new CustomEvent('videoCompleted', {
            detail: {
                videoId: this.videoId,
                watchTime: this.watchTime,
                completedAt: new Date()
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Rastrear tiempo de visualización
     */
    trackWatchTime() {
        this.watchTimeInterval = setInterval(() => {
            if (!this.videoElement.paused) {
                this.watchTime += 1;
            }
        }, 1000);
    }

    /**
     * Obtener estadísticas del video
     */
    getStatistics() {
        return {
            watchTime: this.watchTime,
            totalDuration: this.videoElement.duration,
            currentPosition: this.videoElement.currentTime,
            completionPercentage: (this.videoElement.currentTime / this.videoElement.duration) * 100,
            bookmarksCount: this.bookmarks.length,
            playbackSpeed: this.playbackSpeed,
            volume: this.videoElement.volume
        };
    }

    /**
     * Destruir reproductor
     */
    destroy() {
        if (this.watchTimeInterval) {
            clearInterval(this.watchTimeInterval);
        }
        
        this.saveProgress();
        this.saveBookmarks();
        this.savePreferences();
    }
}

// Exportar para uso global
window.VideoPlayer = VideoPlayer;
