/**
 * Video Navigation Manager
 * Maneja la navegación entre videos y event listeners de forma centralizada
 */

class VideoNavigationManager {
    constructor() {
        this.currentVideoIndex = 0;
        this.videoList = [];
        this.isInitialized = false;
        this.eventListeners = new Map(); // Para tracking de event listeners

        this.init();
    }

    init() {
        console.log('[NAV] Inicializando VideoNavigationManager...');

        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    /**
     * Configurar todos los event listeners de navegación
     */
    setupEventListeners() {
        try {
            console.log('[NAV] Configurando event listeners...');

            // Limpiar listeners existentes para evitar duplicaciones
            this.removeAllEventListeners();

            // Escuchar eventos de video completado
            this.addEventListenerTracked('videoCompleted', this.handleVideoCompleted.bind(this), window);

            // Escuchar cambios de módulo
            this.addEventListenerTracked('moduleChanged', this.handleModuleChanged.bind(this), window);

            // Escuchar cuando se carga la estructura del curso
            this.addEventListenerTracked('courseStructureLoaded', this.handleCourseStructureLoaded.bind(this), window);

            // Inicializar botones de navegación
            this.initializeNavigationButtons();

            this.isInitialized = true;
            console.log('[NAV] Event listeners configurados correctamente');

        } catch (error) {
            console.error('[NAV] Error configurando event listeners:', error);
        }
    }

    /**
     * Añadir event listener con tracking para posterior limpieza
     */
    addEventListenerTracked(event, handler, target = window) {
        try {
            const listenerId = `${event}_${Date.now()}_${Math.random()}`;

            target.addEventListener(event, handler);

            // Guardar referencia para limpieza posterior
            this.eventListeners.set(listenerId, {
                event,
                handler,
                target
            });

            console.log(`[NAV] Event listener añadido: ${event} (ID: ${listenerId})`);
            return listenerId;

        } catch (error) {
            console.error(`[NAV] Error añadiendo event listener ${event}:`, error);
            return null;
        }
    }

    /**
     * Remover todos los event listeners registrados
     */
    removeAllEventListeners() {
        try {
            console.log('[NAV] Limpiando event listeners existentes...');

            this.eventListeners.forEach((listener, listenerId) => {
                try {
                    listener.target.removeEventListener(listener.event, listener.handler);
                    console.log(`[NAV] Event listener removido: ${listener.event} (ID: ${listenerId})`);
                } catch (error) {
                    console.warn(`[NAV] Error removiendo listener ${listenerId}:`, error);
                }
            });

            this.eventListeners.clear();
            console.log('[NAV] Limpieza de event listeners completada');

        } catch (error) {
            console.error('[NAV] Error en limpieza de event listeners:', error);
        }
    }

    /**
     * Inicializar botones de navegación
     */
    initializeNavigationButtons() {
        try {
            const prevBtn = document.getElementById('prevVideoBtn');
            const nextBtn = document.getElementById('nextVideoBtn');

            if (!prevBtn || !nextBtn) {
                console.warn('[NAV] Botones de navegación no encontrados en DOM');
                return;
            }

            // Remover listeners existentes
            prevBtn.replaceWith(prevBtn.cloneNode(true));
            nextBtn.replaceWith(nextBtn.cloneNode(true));

            // Obtener referencias nuevas después del reemplazo
            const newPrevBtn = document.getElementById('prevVideoBtn');
            const newNextBtn = document.getElementById('nextVideoBtn');

            // Añadir nuevos event listeners
            this.addEventListenerTracked('click', this.goToPreviousVideo.bind(this), newPrevBtn);
            this.addEventListenerTracked('click', this.goToNextVideo.bind(this), newNextBtn);

            // Verificar estado inicial de botones
            this.updateNavigationButtons();

            console.log('[NAV] Botones de navegación inicializados');

        } catch (error) {
            console.error('[NAV] Error inicializando botones de navegación:', error);
        }
    }

    /**
     * Manejar video completado
     */
    handleVideoCompleted(event) {
        try {
            console.log('[NAV] Video completado detectado:', event.detail);

            // Re-inicializar botones después de completar video
            setTimeout(() => {
                this.updateNavigationButtons();
                this.ensureButtonsAreClickable();
            }, 100);

        } catch (error) {
            console.error('[NAV] Error manejando video completado:', error);
        }
    }

    /**
     * Manejar cambio de módulo
     */
    handleModuleChanged(event) {
        try {
            console.log('[NAV] Cambio de módulo detectado:', event.detail);

            // Re-inicializar navegación después de cambio de módulo
            setTimeout(() => {
                this.reinitializeNavigation();
            }, 200);

        } catch (error) {
            console.error('[NAV] Error manejando cambio de módulo:', error);
        }
    }

    /**
     * Manejar carga de estructura de curso
     */
    handleCourseStructureLoaded(event) {
        try {
            console.log('[NAV] Estructura de curso cargada:', event.detail);

            // Actualizar lista de videos disponibles
            this.updateVideoList();
            this.updateNavigationButtons();

        } catch (error) {
            console.error('[NAV] Error manejando carga de estructura:', error);
        }
    }

    /**
     * Ir al video anterior
     */
    goToPreviousVideo() {
        try {
            console.log('[NAV] Navegando al video anterior...');

            if (this.currentVideoIndex > 0) {
                this.currentVideoIndex--;
                this.navigateToVideo(this.currentVideoIndex);
            } else {
                console.log('[NAV] Ya estás en el primer video');
                window.showNotification?.('Ya estás en el primer video', 'info', 2000);
            }

        } catch (error) {
            console.error('[NAV] Error navegando al video anterior:', error);
        }
    }

    /**
     * Ir al video siguiente
     */
    goToNextVideo() {
        try {
            console.log('[NAV] Navegando al siguiente video...');

            if (this.currentVideoIndex < this.videoList.length - 1) {
                this.currentVideoIndex++;
                this.navigateToVideo(this.currentVideoIndex);
            } else {
                console.log('[NAV] Ya estás en el último video');
                window.showNotification?.('Has completado todos los videos de este módulo', 'success', 3000);
            }

        } catch (error) {
            console.error('[NAV] Error navegando al siguiente video:', error);
        }
    }

    /**
     * Navegar a un video específico
     */
    navigateToVideo(index) {
        try {
            if (index < 0 || index >= this.videoList.length) {
                console.warn('[NAV] Índice de video inválido:', index);
                return;
            }

            const videoData = this.videoList[index];
            console.log('[NAV] Navegando a video:', videoData);

            // Emitir evento de cambio de video
            const event = new CustomEvent('videoChanged', {
                detail: {
                    videoIndex: index,
                    videoData: videoData,
                    previousIndex: this.currentVideoIndex
                },
                bubbles: true
            });

            window.dispatchEvent(event);

            // Actualizar estado actual
            this.currentVideoIndex = index;
            this.updateNavigationButtons();

        } catch (error) {
            console.error('[NAV] Error navegando a video:', error);
        }
    }

    /**
     * Actualizar estado de botones de navegación
     */
    updateNavigationButtons() {
        try {
            const prevBtn = document.getElementById('prevVideoBtn');
            const nextBtn = document.getElementById('nextVideoBtn');

            if (!prevBtn || !nextBtn) {
                console.warn('[NAV] Botones de navegación no encontrados para actualización');
                return;
            }

            // Actualizar estado del botón anterior
            prevBtn.disabled = this.currentVideoIndex <= 0;
            prevBtn.style.opacity = this.currentVideoIndex <= 0 ? '0.5' : '1';

            // Actualizar estado del botón siguiente
            nextBtn.disabled = this.currentVideoIndex >= this.videoList.length - 1;
            nextBtn.style.opacity = this.currentVideoIndex >= this.videoList.length - 1 ? '0.5' : '1';

            console.log(`[NAV] Botones actualizados - Anterior: ${!prevBtn.disabled}, Siguiente: ${!nextBtn.disabled}`);

        } catch (error) {
            console.error('[NAV] Error actualizando botones de navegación:', error);
        }
    }

    /**
     * Asegurar que los botones sean clickeables (fix z-index issues)
     */
    ensureButtonsAreClickable() {
        try {
            const prevBtn = document.getElementById('prevVideoBtn');
            const nextBtn = document.getElementById('nextVideoBtn');

            if (prevBtn && nextBtn) {
                // Asegurar z-index y pointer-events
                prevBtn.style.zIndex = '1000';
                nextBtn.style.zIndex = '1000';
                prevBtn.style.pointerEvents = 'auto';
                nextBtn.style.pointerEvents = 'auto';

                console.log('[NAV] Z-index y pointer-events verificados para botones');
            }

        } catch (error) {
            console.error('[NAV] Error asegurando clickeabilidad de botones:', error);
        }
    }

    /**
     * Actualizar lista de videos disponibles
     */
    updateVideoList() {
        try {
            // Intentar obtener la lista de videos desde el loader de módulo
            if (window.module1VideosLoader && typeof window.module1VideosLoader.getVideoList === 'function') {
                this.videoList = window.module1VideosLoader.getVideoList();
            } else {
                // Fallback: buscar videos en el DOM
                const videoItems = document.querySelectorAll('.video-item');
                this.videoList = Array.from(videoItems).map((item, index) => ({
                    index,
                    title: item.querySelector('.video-title')?.textContent || `Video ${index + 1}`,
                    element: item
                }));
            }

            console.log('[NAV] Lista de videos actualizada:', this.videoList.length);

        } catch (error) {
            console.error('[NAV] Error actualizando lista de videos:', error);
            this.videoList = [];
        }
    }

    /**
     * Re-inicializar navegación completa
     */
    reinitializeNavigation() {
        try {
            console.log('[NAV] Re-inicializando navegación completa...');

            this.removeAllEventListeners();
            this.updateVideoList();
            this.setupEventListeners();

            console.log('[NAV] Re-inicialización completada');

        } catch (error) {
            console.error('[NAV] Error en re-inicialización:', error);
        }
    }

    /**
     * Obtener información del estado actual
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            currentVideoIndex: this.currentVideoIndex,
            totalVideos: this.videoList.length,
            activeListeners: this.eventListeners.size
        };
    }

    /**
     * Destruir el manager y limpiar recursos
     */
    destroy() {
        try {
            console.log('[NAV] Destruyendo VideoNavigationManager...');

            this.removeAllEventListeners();
            this.videoList = [];
            this.currentVideoIndex = 0;
            this.isInitialized = false;

            console.log('[NAV] VideoNavigationManager destruído');

        } catch (error) {
            console.error('[NAV] Error destruyendo manager:', error);
        }
    }
}

// Crear instancia global
window.videoNavigationManager = new VideoNavigationManager();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoNavigationManager;
}