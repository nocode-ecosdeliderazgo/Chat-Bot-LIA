// =====================================================
// MODULE 1 VIDEOS LOADER
// Carga y muestra los videos del módulo 1 desde la base de datos
// =====================================================

class Module1VideosLoader {
    constructor() {
        this.moduleId = null;
        this.videos = [];
        this.currentVideoId = null;
        this.apiBaseUrl = this.getApiBaseUrl();
        this.retryInProgress = false; // Flag para prevenir bucles infinitos
        
        console.log('🎬 Module 1 Videos Loader inicializado');
        console.log('🌐 API Base URL:', this.apiBaseUrl);
    }

    // =====================================================
    // INICIALIZACIÓN
    // =====================================================

    async init() {
        try {
            console.log('🚀 Inicializando Module 1 Videos Loader...');

            // 1. Obtener ID del módulo 1
            await this.getModule1Id();

            // 2. Cargar videos del módulo 1
            await this.loadModule1Videos();

            // 3. Renderizar lista de videos
            this.renderVideosList();

            // 4. Configurar eventos
            this.setupEventListeners();

            console.log('✅ Module 1 Videos Loader inicializado exitosamente');

        } catch (error) {
            console.error('💥 Error inicializando Module 1 Videos Loader:', error);
            this.showError('Error cargando los videos del módulo 1.');
        }
    }

    // =====================================================
    // OBTENER ID DEL MÓDULO 1
    // =====================================================

    async getModule1Id() {
        try {
            console.log('🔍 Obteniendo ID del módulo 1...');

            // Buscar el módulo 1 en la estructura del curso
            if (window.dynamicVideoLoader && window.dynamicVideoLoader.courseData) {
                const module1 = window.dynamicVideoLoader.courseData.modules.find(m => m.module_number === 1);
                if (module1) {
                    this.moduleId = module1.id;
                    console.log('✅ ID del módulo 1 obtenido:', this.moduleId);
                    return;
                }
            }

            // Si no está disponible, usar un ID por defecto o hacer una consulta directa
            console.log('⚠️ Módulo 1 no encontrado en dynamicVideoLoader, usando consulta directa...');
            
            // Hacer consulta directa a la API
            const cacheBuster = new Date().getTime();
            const response = await fetch(`${this.apiBaseUrl}/courses/module1-info?t=${cacheBuster}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.moduleId = data.module_id;
                console.log('✅ ID del módulo 1 obtenido por API:', this.moduleId);
            } else {
                throw new Error('No se pudo obtener el ID del módulo 1');
            }

        } catch (error) {
            console.error('❌ Error obteniendo ID del módulo 1:', error);
            // Usar ID por defecto para desarrollo
            this.moduleId = 'default-module-1-id';
            console.log('🔧 Usando ID por defecto para desarrollo:', this.moduleId);
        }
    }

    // =====================================================
    // PROBAR NETLIFY FUNCTIONS
    // =====================================================

    async testNetlifyFunctions() {
        try {
            console.log('🧪 Probando si Netlify Functions funcionan...');
            
            // Timeout rápido para no hacer esperar al usuario
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos
            
            const testResponse = await fetch(`${this.apiBaseUrl}/test`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (testResponse.ok) {
                const data = await testResponse.json();
                console.log('✅ Netlify Functions funcionan correctamente:', data.message);
                return true;
            } else {
                console.warn('⚠️ Netlify Functions responden con error:', testResponse.status);
                return false;
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('⚠️ Timeout: Netlify Functions tardan demasiado en responder');
            } else {
                console.warn('⚠️ Netlify Functions no disponibles:', error.message);
            }
            return false;
        }
    }

    // =====================================================
    // CARGAR VIDEOS DEL MÓDULO 1
    // =====================================================

    async loadModule1Videos() {
        try {
            console.log('📚 Cargando videos del módulo 1...');

            // Si tenemos el dynamicVideoLoader, usar sus datos
            if (window.dynamicVideoLoader && window.dynamicVideoLoader.courseData) {
                const module1 = window.dynamicVideoLoader.courseData.modules.find(m => m.module_number === 1);
                if (module1 && module1.module_videos && module1.module_videos.length > 0) {
                    this.videos = module1.module_videos;
                    console.log('✅ Videos cargados desde dynamicVideoLoader:', this.videos.length);
                    console.log('📹 Primer video:', this.videos[0]);
                    return;
                }
            }

            // Primero verificar si las Netlify Functions están funcionando
            const functionsWorking = await this.testNetlifyFunctions();
            
            if (!functionsWorking) {
                console.log('📚 Netlify Functions no disponibles, mostrando contenido de demostración');
                this.createSampleVideos();
                return;
            }

            // Si funcionan, hacer consulta directa a la API
            console.log('🔄 Haciendo consulta directa a la API...');
            console.log('🌐 URL completa:', `${this.apiBaseUrl}/courses/module1-videos`);
            
            // Agregar cache busting para evitar problemas de cache
            const cacheBuster = new Date().getTime();
            const response = await fetch(`${this.apiBaseUrl}/courses/module1-videos?t=${cacheBuster}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            console.log('📡 Respuesta HTTP recibida:');
            console.log('   - Status:', response.status);
            console.log('   - Status Text:', response.statusText);
            console.log('   - OK:', response.ok);
            console.log('   - Headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Respuesta de error del servidor:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📋 Datos JSON recibidos del servidor:');
            console.log('   - Respuesta completa:', JSON.stringify(data, null, 2));
            console.log('   - Success:', data.success);
            console.log('   - Videos length:', data.videos ? data.videos.length : 'undefined');
            console.log('   - Error field:', data.error || 'none');
            
            if (data.success && data.videos && data.videos.length > 0) {
                this.videos = data.videos;
                console.log('✅ Videos cargados desde API:', this.videos.length);
                console.log('📹 Primer video:', this.videos[0]);
            } else {
                throw new Error(data.error || 'Error obteniendo videos del módulo 1');
            }

        } catch (error) {
            console.error('❌ Error cargando videos del módulo 1:', error);
            console.error('🔍 Detalles del error:');
            console.error('   - Tipo de error:', error.constructor.name);
            console.error('   - Mensaje:', error.message);
            console.error('   - Stack trace:', error.stack);
            console.error('   - API Base URL utilizada:', this.apiBaseUrl);
            console.error('   - Videos actuales length:', this.videos.length);
            
            // Información adicional del entorno
            console.error('🌍 Información del entorno:');
            console.error('   - Location:', window.location.href);
            console.error('   - Protocol:', window.location.protocol);
            console.error('   - Hostname:', window.location.hostname);
            console.error('   - Port:', window.location.port || 'default');
            console.error('   - User Agent:', navigator.userAgent);
            
            // Solo crear videos de ejemplo si realmente no hay datos
            if (this.videos.length === 0) {
                console.warn('⚠️ No se pudieron cargar videos de la base de datos, usando datos de ejemplo');
                console.warn('🎯 Razón del fallback: Error en la consulta a la API');
                this.createSampleVideos();
            }
        }
    }

    // =====================================================
    // CREAR VIDEOS DE EJEMPLO PARA DESARROLLO
    // =====================================================

    createSampleVideos() {
        console.log('🔧 Creando videos de ejemplo...');
        console.log('📚 Mostrando contenido de demostración del curso de IA');
        console.log('🎯 11 videos de demostración del Módulo 1: Fundamentos de IA');
        
        this.videos = [
            {
                id: 'module1-video-1',
                video_title: '1. Introducción a la Inteligencia Artificial',
                duration_seconds: 180,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'Conceptos básicos y definición de IA',
                video_order: 1,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-2',
                video_title: '2. Historia y Evolución de la IA',
                duration_seconds: 240,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'Desde los primeros algoritmos hasta la actualidad',
                video_order: 2,
                user_progress: { current_time_seconds: 45, completion_percentage: 18, is_completed: false }
            },
            {
                id: 'module1-video-3',
                video_title: '3. Tipos de Inteligencia Artificial',
                duration_seconds: 200,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'IA débil vs IA fuerte, Machine Learning, Deep Learning',
                video_order: 3,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-4',
                video_title: '4. Machine Learning: Conceptos Fundamentales',
                duration_seconds: 300,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'Aprendizaje supervisado, no supervisado y por refuerzo',
                video_order: 4,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-5',
                video_title: '5. Aplicaciones Prácticas de la IA',
                duration_seconds: 220,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'Casos de uso en diferentes industrias',
                video_order: 5,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-6',
                video_title: '6. Redes Neuronales Básicas',
                duration_seconds: 280,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'Introducción a perceptrones y redes simples',
                video_order: 6,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-7',
                video_title: '7. Ética en la Inteligencia Artificial',
                duration_seconds: 260,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'Sesgos, privacidad y responsabilidad',
                video_order: 7,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-8',
                video_title: '8. Herramientas y Frameworks de IA',
                duration_seconds: 320,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'TensorFlow, PyTorch, scikit-learn',
                video_order: 8,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-9',
                video_title: '9. Procesamiento del Lenguaje Natural',
                duration_seconds: 240,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'Chatbots, análisis de sentimientos, traducción',
                video_order: 9,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-10',
                video_title: '10. Visión por Computadora',
                duration_seconds: 200,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'Reconocimiento de imágenes y objetos',
                video_order: 10,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-11',
                video_title: '11. Proyecto Final: Implementación de IA',
                duration_seconds: 300,
                youtube_video_id: 'ScMzIvxBSi4',
                description: 'Proyecto práctico integrando todos los conceptos',
                video_order: 11,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            }
        ];

        console.log('✅ Videos de ejemplo creados:', this.videos.length);
        
        // Mostrar notificación al usuario
        this.showDemoModeNotification();
        
        // Cargar inmediatamente el primer video en el reproductor
        this.loadFirstVideoAutomatically();
    }

    // =====================================================
    // MOSTRAR NOTIFICACIÓN DE MODO DEMO
    // =====================================================

    showDemoModeNotification() {
        // Agregar banner informativo discreto
        const videoContainer = document.querySelector('.module-videos-header, .videos-list-container');
        if (videoContainer) {
            const banner = document.createElement('div');
            banner.className = 'demo-mode-banner';
            banner.style.cssText = `
                background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
                border: 1px solid #2196f3;
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 16px;
                color: #1565c0;
                font-size: 14px;
                text-align: center;
                box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
            `;
            banner.innerHTML = `
                <strong>📚 Modo Demostración</strong><br>
                <small>Contenido de ejemplo del curso "Fundamentos de IA"</small>
            `;
            
            videoContainer.parentNode.insertBefore(banner, videoContainer);
            
            // Auto-hide después de 10 segundos
            setTimeout(() => {
                if (banner.parentNode) {
                    banner.style.transition = 'opacity 0.5s ease';
                    banner.style.opacity = '0';
                    setTimeout(() => banner.remove(), 500);
                }
            }, 10000);
        }
    }

    // =====================================================
    // CARGAR PRIMER VIDEO AUTOMÁTICAMENTE
    // =====================================================

    loadFirstVideoAutomatically() {
        if (this.videos.length > 0) {
            console.log('🎬 Cargando primer video automáticamente...');
            this.currentVideoIndex = 0;
            this.currentVideo = this.videos[0];
            
            // Cargar el video en el reproductor si hay instancia disponible
            if (window.chatOnline && typeof window.chatOnline.changeYouTubeVideo === 'function') {
                const video = this.videos[0];
                window.chatOnline.changeYouTubeVideo(
                    video.youtube_video_id, 
                    video.video_title, 
                    this.formatDuration(video.duration_seconds)
                );
                console.log('✅ Primer video cargado automáticamente');
            } else {
                console.log('⚠️ chatOnline no disponible para cargar video automáticamente');
            }
        }
    }

    // =====================================================
    // RENDERIZAR LISTA DE VIDEOS
    // =====================================================

    renderVideosList() {
        try {
            const videosList = document.getElementById('module1VideosList');
            if (!videosList) {
                console.error('❌ Elemento module1VideosList no encontrado');
                return;
            }

            // Limpiar lista existente
            videosList.innerHTML = '';

            // Verificar si estamos usando videos de ejemplo
            this.checkIfUsingSampleVideos();

            // Actualizar contador de videos y estadísticas
            const videoCount = document.querySelector('.module-video-count');
            if (videoCount) {
                videoCount.textContent = `${this.videos.length} videos`;
            }

            // Actualizar título del módulo si tenemos datos reales
            if (this.videos.length > 0 && this.videos[0].module_id) {
                const moduleHeader = document.querySelector('.module-videos-header h4');
                if (moduleHeader) {
                    // Mantener el ícono SVG y actualizar solo el texto
                    const icon = moduleHeader.querySelector('svg');
                    const iconHTML = icon ? icon.outerHTML : '';
                    moduleHeader.innerHTML = `
                        ${iconHTML}
                        Módulo 1: Fundamentos de IA (${this.videos.length} videos)
                    `;
                }
            }

            // Renderizar cada video
            this.videos.forEach((video, index) => {
                const videoElement = this.createVideoElement(video, index);
                videosList.appendChild(videoElement);
                console.log(`📹 Video ${index + 1} renderizado:`, {
                    title: video.video_title,
                    id: video.id,
                    duration: this.formatDuration(video.duration_seconds)
                });
            });

            console.log('✅ Lista de videos renderizada:', this.videos.length);
            console.log('🔍 Verificando elementos en DOM:', {
                container: !!videosList,
                children: videosList.children.length,
                firstChild: videosList.firstElementChild?.className
            });

            // Cargar automáticamente el primer video si hay videos disponibles
            if (this.videos.length > 0 && !this.currentVideoId) {
                console.log('🎬 Cargando automáticamente el primer video...');
                this.selectVideo(this.videos[0]);
            }
            
            // Asegurar que el video se muestre en el reproductor central
            this.ensureVideoPlayerLoaded();

        } catch (error) {
            console.error('❌ Error renderizando lista de videos:', error);
        }
    }

    // =====================================================
    // ASEGURAR QUE EL REPRODUCTOR DE VIDEO ESTÉ CARGADO
    // =====================================================

    ensureVideoPlayerLoaded() {
        if (this.videos.length === 0) return;

        // Intentar múltiples formas de cargar el video en el reproductor
        const video = this.currentVideo || this.videos[0];
        
        console.log('🎯 Asegurando que el video esté cargado en el reproductor:', video.video_title);

        // Método 1: Usar window.chatOnline si está disponible
        if (window.chatOnline && typeof window.chatOnline.changeYouTubeVideo === 'function') {
            console.log('📺 Método 1: Usando window.chatOnline.changeYouTubeVideo');
            window.chatOnline.changeYouTubeVideo(
                video.youtube_video_id, 
                video.video_title, 
                this.formatDuration(video.duration_seconds)
            );
            return;
        }

        // Método 2: Usar window.chatOnlineV2 si está disponible
        if (window.chatOnlineV2 && typeof window.chatOnlineV2.loadVideo === 'function') {
            console.log('📺 Método 2: Usando window.chatOnlineV2.loadVideo');
            window.chatOnlineV2.loadVideo(video);
            return;
        }

        // Método 3: Manipulación directa del iframe de YouTube si existe
        const youtubeIframe = document.querySelector('#youtube-player-iframe, iframe[src*="youtube.com"]');
        if (youtubeIframe && video.youtube_video_id) {
            console.log('📺 Método 3: Manipulación directa del iframe de YouTube');
            const newSrc = `https://www.youtube.com/embed/${video.youtube_video_id}?autoplay=0&controls=1&rel=0`;
            youtubeIframe.src = newSrc;
            
            // Actualizar título si existe elemento de título
            const titleElement = document.querySelector('.video-title, .current-video-title');
            if (titleElement) {
                titleElement.textContent = video.video_title;
            }
            return;
        }

        // Método 4: Crear reproductor si no existe
        this.createFallbackVideoPlayer(video);
    }

    createFallbackVideoPlayer(video) {
        console.log('📺 Método 4: Creando reproductor de fallback');
        
        const videoContainer = document.querySelector('.video-container, .youtube-player-container, .main-video-area');
        if (videoContainer) {
            videoContainer.innerHTML = `
                <div class="fallback-video-player">
                    <iframe 
                        src="https://www.youtube.com/embed/${video.youtube_video_id}?autoplay=0&controls=1&rel=0"
                        frameborder="0" 
                        allowfullscreen
                        style="width: 100%; height: 400px; border-radius: 8px;">
                    </iframe>
                    <div class="video-info" style="margin-top: 10px;">
                        <h3 style="margin: 0; color: var(--text-primary);">${video.video_title}</h3>
                        <p style="margin: 5px 0 0 0; color: var(--text-secondary);">
                            Duración: ${this.formatDuration(video.duration_seconds)}
                        </p>
                    </div>
                </div>
            `;
            console.log('✅ Reproductor de fallback creado exitosamente');
        } else {
            console.warn('⚠️ No se encontró contenedor para el reproductor de video');
        }
    }

    // =====================================================
    // VERIFICAR SI SE ESTÁN USANDO VIDEOS DE EJEMPLO
    // =====================================================

    checkIfUsingSampleVideos() {
        if (this.videos.length > 0) {
            const firstVideo = this.videos[0];
            
            // Verificar si son videos de ejemplo (IDs que empiecen con 'sample-video-' o 'module1-video-')
            const isUsingExampleVideos = firstVideo.id && (
                firstVideo.id.startsWith('sample-video-') || 
                firstVideo.id.startsWith('module1-video-') ||
                firstVideo.youtube_video_id === 'dQw4w9WgXcQ' // YouTube ID de ejemplo
            );

            if (isUsingExampleVideos) {
                console.warn('⚠️ ATENCIÓN: Se están usando videos de ejemplo en lugar de datos de la base de datos');
                console.warn('🔍 Esto puede indicar un problema con la conexión a la base de datos');
                console.warn('📊 Videos disponibles:', this.videos.length);
                
                // NO reintentar aquí para evitar bucle infinito
                console.warn('💡 Para usar videos reales, configure correctamente la base de datos y el servidor API');
            } else {
                console.log('✅ Usando videos reales de la base de datos');
                console.log('📊 Videos disponibles:', this.videos.length);
                console.log('🎬 Títulos de videos:');
                this.videos.forEach((video, index) => {
                    console.log(`   ${index + 1}. ${video.video_title} (${this.formatDuration(video.duration_seconds)})`);
                });
            }
        }
    }

    // =====================================================
    // REINTENTAR CARGA DESDE BASE DE DATOS
    // =====================================================

    async retryLoadFromDatabase() {
        console.log('🔄 Reintentando cargar videos desde la base de datos...');
        
        // Prevenir múltiples reintentos concurrentes
        if (this.retryInProgress) {
            console.log('⚠️ Reintento ya en progreso, ignorando solicitud duplicada');
            return;
        }

        this.retryInProgress = true;
        
        try {
            // Limpiar videos actuales
            this.videos = [];
            
            // Intentar cargar nuevamente
            await this.loadModule1Videos();
            
            // Si se cargaron videos reales, re-renderizar (pero sin volver a verificar)
            if (this.videos.length > 0 && !this.videos[0].id.startsWith('sample-video-') && !this.videos[0].id.startsWith('module1-video-')) {
                console.log('✅ Videos reales cargados exitosamente, re-renderizando...');
                // Renderizar directamente sin volver a llamar checkIfUsingSampleVideos
                this.renderVideosListDirect();
            } else {
                console.log('⚠️ Aún usando videos de ejemplo tras reintento');
            }
        } catch (error) {
            console.error('❌ Error en reintento de carga:', error);
        } finally {
            this.retryInProgress = false;
        }
    }

    // Renderizar lista directamente sin verificaciones adicionales
    renderVideosListDirect() {
        try {
            const videosList = document.getElementById('module1VideosList');
            if (!videosList) {
                console.error('❌ Elemento module1VideosList no encontrado');
                return;
            }

            // Limpiar lista existente
            videosList.innerHTML = '';

            // Actualizar contador de videos y estadísticas
            const videoCount = document.querySelector('.module-video-count');
            if (videoCount) {
                videoCount.textContent = `${this.videos.length} videos`;
            }

            // Renderizar cada video
            this.videos.forEach((video, index) => {
                const videoElement = this.createVideoElement(video, index);
                videosList.appendChild(videoElement);
            });

            console.log('✅ Lista de videos renderizada directamente:', this.videos.length);

            // Cargar automáticamente el primer video si hay videos disponibles
            if (this.videos.length > 0 && !this.currentVideoId) {
                console.log('🎬 Cargando automáticamente el primer video...');
                this.selectVideo(this.videos[0]);
            }

        } catch (error) {
            console.error('❌ Error renderizando lista de videos directamente:', error);
        }
    }

    // =====================================================
    // INFORMACIÓN DE DEBUG
    // =====================================================

    debugInfo() {
        console.log('🔍 === INFORMACIÓN DE DEBUG ===');
        console.log('📊 Estado actual del loader:');
        console.log('   - Módulo ID:', this.moduleId);
        console.log('   - Videos cargados:', this.videos.length);
        console.log('   - Video activo:', this.currentVideoId);
        
        if (this.videos.length > 0) {
            console.log('📹 Primer video:', this.videos[0]);
            console.log('🎯 Usando videos de ejemplo:', this.videos[0].id.startsWith('sample-video-'));
        }
        
        console.log('🌐 API Base URL:', this.apiBaseUrl);
        console.log('🔗 dynamicVideoLoader disponible:', !!window.dynamicVideoLoader);
        
        if (window.dynamicVideoLoader) {
            console.log('📚 Course data disponible:', !!window.dynamicVideoLoader.courseData);
            if (window.dynamicVideoLoader.courseData) {
                console.log('   - Módulos:', window.dynamicVideoLoader.courseData.modules?.length || 0);
                const module1 = window.dynamicVideoLoader.courseData.modules?.find(m => m.module_number === 1);
                console.log('   - Módulo 1 encontrado:', !!module1);
                if (module1) {
                    console.log('   - Videos del módulo 1:', module1.module_videos?.length || 0);
                }
            }
        }
        
        console.log('🎬 Función loadVideo disponible:', typeof loadVideo === 'function');
        console.log('=====================================');
    }

    // =====================================================
    // CREAR ELEMENTO DE VIDEO
    // =====================================================

    createVideoElement(video, index) {
        const progress = video.user_progress || { current_time_seconds: 0, completion_percentage: 0, is_completed: false };
        const isActive = this.currentVideoId === video.id;
        const isCompleted = progress.is_completed;
        
        // Determinar estado del video
        let statusClass = 'pending';
        let icon = `<polygon points="5,3 19,12 5,21"/>`;
        
        if (isCompleted) {
            statusClass = 'completed';
            icon = `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>`;
        } else if (isActive || progress.current_time_seconds > 0) {
            statusClass = 'active';
            icon = `<polygon points="5,3 19,12 5,21"/>`;
        }

        // Formatear duración
        const duration = this.formatDuration(video.duration_seconds);
        
        // Calcular porcentaje de progreso
        const progressPercent = Math.min(progress.completion_percentage || 0, 100);

        const videoElement = document.createElement('div');
        videoElement.className = `video-item ${statusClass}`;
        videoElement.setAttribute('data-video-id', video.id);
        videoElement.setAttribute('data-youtube-id', video.youtube_video_id);
        videoElement.setAttribute('data-video-title', video.video_title);
        videoElement.setAttribute('data-duration-seconds', video.duration_seconds);
        
        videoElement.innerHTML = `
            <div class="video-icon">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    ${icon}
                </svg>
            </div>
            <div class="video-info">
                <h5 class="video-title">${video.video_title}</h5>
                <div class="video-meta">
                    <span class="video-duration">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        ${duration}
                    </span>
                    <span class="video-progress">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                        </svg>
                        <div class="progress-bar-mini">
                            <div class="progress-fill-mini" style="width: ${progressPercent}%"></div>
                        </div>
                    </span>
                </div>
            </div>
        `;

        // Event listener se maneja por event delegation en setupEventListeners
        return videoElement;
    }

    // =====================================================
    // SELECCIONAR VIDEO
    // =====================================================

    selectVideo(video) {
        try {
            console.log('🎬 Seleccionando video:', video.video_title);
            console.log('🔍 Datos completos del video:', video);
            console.log('🎯 YouTube ID que se usará:', video.youtube_video_id);

            // Actualizar video activo
            this.currentVideoId = video.id;

            // Actualizar clases CSS
            document.querySelectorAll('.video-item').forEach(item => {
                item.classList.remove('active');
            });
            
            const selectedElement = document.querySelector(`[data-video-id="${video.id}"]`);
            if (selectedElement) {
                selectedElement.classList.add('active');
            }

            // Cargar video en el reproductor principal
            this.loadVideoInPlayer(video);

            // Actualizar información del video
            this.updateVideoInfo(video);

            console.log('✅ Video seleccionado:', video.video_title);

        } catch (error) {
            console.error('❌ Error seleccionando video:', error);
        }
    }

    // =====================================================
    // CARGAR VIDEO EN REPRODUCTOR PRINCIPAL
    // =====================================================

    loadVideoInPlayer(video) {
        try {
            console.log('🎬 Cargando video en reproductor:', video.video_title);
            console.log('🔗 YouTube ID:', video.youtube_video_id);

            // Método 1: Usar la función global changeVideo (preferido)
            if (typeof changeVideo === 'function') {
                const formattedDuration = this.formatDuration(video.duration_seconds);
                console.log('🎥 DEBUG - Video data:', {
                    id: video.youtube_video_id,
                    title: video.video_title,
                    duration_seconds: video.duration_seconds,
                    formatted_duration: formattedDuration
                });
                changeVideo(video.youtube_video_id, video.video_title, formattedDuration);
                console.log('✅ Video cargado usando función global changeVideo');
                return;
            }

            // Método 2: Usar chatOnline directamente
            if (window.chatOnline && typeof window.chatOnline.changeYouTubeVideo === 'function') {
                window.chatOnline.changeYouTubeVideo(video.youtube_video_id, video.video_title, this.formatDuration(video.duration_seconds));
                console.log('✅ Video cargado usando window.chatOnline.changeYouTubeVideo');
                return;
            }

            // Método 3: Usar loadVideo como fallback
            if (typeof loadVideo === 'function') {
                const videoUrl = `https://www.youtube.com/watch?v=${video.youtube_video_id}`;
                loadVideo(videoUrl, video.video_title, this.formatDuration(video.duration_seconds));
                console.log('✅ Video cargado usando función global loadVideo (URL completa)');
                return;
            }

            // Fallback final: actualizar iframe directamente
            const youtubePlayer = document.getElementById('youtubePlayer');
            if (youtubePlayer) {
                const videoUrl = `https://www.youtube.com/embed/${video.youtube_video_id}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`;
                youtubePlayer.src = videoUrl;
                youtubePlayer.title = video.video_title;
                console.log('✅ Video cargado en reproductor (fallback directo):', videoUrl);
                
                // Actualizar información manualmente
                this.updateVideoInfoManually(video);
            } else {
                console.warn('⚠️ Elemento youtubePlayer no encontrado');
            }

        } catch (error) {
            console.error('❌ Error cargando video en reproductor:', error);
        }
    }

    // Función auxiliar para actualizar información cuando usamos fallback directo
    updateVideoInfoManually(video) {
        try {
            // Actualizar título del video
            const videoTitle = document.querySelector('.video-info h3');
            if (videoTitle) {
                videoTitle.innerHTML = `
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="23,7 16,12 23,17"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                    ${video.video_title}
                `;
            }

            // Actualizar duración
            const videoDuration = document.querySelector('.video-stats span:first-child');
            if (videoDuration) {
                videoDuration.innerHTML = `
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    Duración: ${this.formatDuration(video.duration_seconds)}
                `;
            }

            // Actualizar descripción del video desde BD
            const videoDescription = document.querySelector('.video-stats span:last-child');
            if (videoDescription) {
                console.log('📝 DEBUG - Video description from DB (manual):', video.description);
                videoDescription.innerHTML = `
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    ${video.description || 'Sin descripción disponible'}
                `;
                console.log('✅ Descripción del video actualizada manualmente:', video.description || 'Sin descripción disponible');
            }

            console.log('✅ Información del video actualizada manualmente');
        } catch (error) {
            console.error('❌ Error actualizando información manualmente:', error);
        }
    }

    // =====================================================
    // HELPERS PARA RENDERIZADO DESDE ACTIVIDAD_DETALLE
    // =====================================================

    buildDescriptionHTMLFromDetalle(items) {
        if (!items || items.length === 0) {
            return '<p class="no-activity">No hay descripción de actividad disponible.</p>';
        }

        const filteredItems = items.filter(item => item.seccion === 'descripcion');
        if (filteredItems.length === 0) {
            return '<p class="no-activity">No hay descripción de actividad disponible.</p>';
        }

        let html = '';
        filteredItems.forEach(item => {
            switch (item.tipo) {
                case 'titulo':
                    html += `<p><strong>${this.escapeHtml(item.contenido)}</strong></p>`;
                    break;
                case 'parrafo':
                    html += `<p>${this.escapeHtml(item.contenido)}</p>`;
                    break;
                case 'lista':
                    html += `<div class="activity-list-item">• ${this.escapeHtml(item.contenido)}</div>`;
                    break;
                case 'nota':
                    html += `<p class="activity-note">${this.escapeHtml(item.contenido)}</p>`;
                    break;
                default:
                    html += `<p>${this.escapeHtml(item.contenido)}</p>`;
            }
        });

        return html;
    }

    buildPromptsHTMLFromDetalle(items) {
        if (!items || items.length === 0) {
            return '<p class="no-activity">No hay prompts de actividad disponibles.</p>';
        }

        const filteredItems = items.filter(item => item.seccion === 'prompts');
        if (filteredItems.length === 0) {
            return '<p class="no-activity">No hay prompts de actividad disponibles.</p>';
        }

        let html = '';
        filteredItems.forEach(item => {
            switch (item.tipo) {
                case 'titulo':
                    html += `<p><strong>${this.escapeHtml(item.contenido)}</strong></p>`;
                    break;
                case 'parrafo':
                    html += `<p>${this.escapeHtml(item.contenido)}</p>`;
                    break;
                case 'lista':
                    html += `<div class="activity-list-item">• ${this.escapeHtml(item.contenido)}</div>`;
                    break;
                case 'nota':
                    html += `<p class="activity-note">${this.escapeHtml(item.contenido)}</p>`;
                    break;
                case 'prompt':
                    html += `<div class="activity-prompt-item" data-prompt-id="${item.id}">
                        <span class="prompt-text">${this.escapeHtml(item.contenido)}</span>
                        <button class="btn-copy" data-copy="${this.escapeHtml(item.contenido)}">Copiar</button>
                    </div>`;
                    break;
                default:
                    html += `<p>${this.escapeHtml(item.contenido)}</p>`;
            }
        });

        return html;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =====================================================
    // ACTUALIZAR INFORMACIÓN DEL VIDEO
    // =====================================================

    updateVideoInfo(video) {
        try {
            // Actualizar título del video
            const videoTitle = document.querySelector('.video-info h3');
            if (videoTitle) {
                videoTitle.innerHTML = `
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="23,7 16,12 23,17"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                    ${video.video_title}
                `;
            }

            // Actualizar duración
            const videoDuration = document.querySelector('.video-stats span:first-child');
            if (videoDuration) {
                videoDuration.innerHTML = `
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    Duración: ${this.formatDuration(video.duration_seconds)}
                `;
            }

            // Actualizar descripción del video desde BD
            const videoDescription = document.querySelector('.video-stats span:last-child');
            if (videoDescription) {
                console.log('📝 DEBUG - Video description from DB:', video.description);
                videoDescription.innerHTML = `
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    ${video.description || 'Sin descripción disponible'}
                `;
                console.log('✅ Descripción del video actualizada:', video.description || 'Sin descripción disponible');
            }

            console.log('✅ Información del video actualizada');

            // Actualizar transcripción en el área correcta
            this.updateTranscriptContent(video);

            // Actualizar actividades en el área correcta
            this.updateActivityContent(video);

            // Actualizar resumen en el área correcta
            this.updateSummaryContent(video);

        } catch (error) {
            console.error('❌ Error actualizando información del video:', error);
        }
    }

    // =====================================================
    // ACTUALIZAR TRANSCRIPCIÓN EN ÁREA CORRECTA
    // =====================================================

    updateTranscriptContent(video) {
        try {
            const transcriptContent = document.querySelector('.transcript-content');
            if (transcriptContent && video.transcript_text) {
                console.log('📝 Actualizando transcripción para:', video.video_title);
                
                transcriptContent.innerHTML = `
                    <h4>Transcripción del Video - ${video.video_title}</h4>
                    <div class="transcript-text">
                        ${video.transcript_text.split('\n').map(paragraph => 
                            paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
                        ).join('')}
                    </div>
                `;
                
                console.log('✅ Transcripción actualizada correctamente');
            } else if (transcriptContent) {
                console.log('⚠️ No hay transcripción disponible para:', video.video_title);
                transcriptContent.innerHTML = `
                    <h4>Transcripción del Video - ${video.video_title}</h4>
                    <p class="no-transcript">No hay transcripción disponible para este video.</p>
                `;
            }
        } catch (error) {
            console.error('❌ Error actualizando transcripción:', error);
        }
    }

    updateActivityContent(video) {
        try {
            console.log('🔍 [DEBUG] updateActivityContent llamado para:', video.video_title);
            console.log('🔍 [DEBUG] Video object keys:', Object.keys(video));
            console.log('🔍 [DEBUG] actividad_detalle length:', video.actividad_detalle?.length || 0);
            console.log('🔍 [DEBUG] descripcion_actividad:', video.descripcion_actividad ? 'EXISTE' : 'NO EXISTE');
            console.log('🔍 [DEBUG] prompts_actividad:', video.prompts_actividad ? 'EXISTE' : 'NO EXISTE');
            
            const activityContent = document.querySelector('.activity-content');
            console.log('🔍 [DEBUG] activity-content encontrado:', !!activityContent);
            
            if (activityContent) {
                console.log('📋 Actualizando actividades para:', video.video_title);
                
                // Actualizar el título de la actividad
                const activityTitle = activityContent.querySelector('h4');
                if (activityTitle) {
                    activityTitle.textContent = `Actividades del Video - ${video.video_title}`;
                }
                
                const activityDescription = activityContent.querySelector('.activity-description');
                const activityPrompts = activityContent.querySelector('.activity-prompts');
                
                // NUEVA LÓGICA DUAL: usar actividad_detalle si está disponible
                if (video.actividad_detalle && video.actividad_detalle.length > 0) {
                    console.log('✨ Usando actividad_detalle (nuevo formato)');
                    console.log('📊 Actividades encontradas:', video.actividad_detalle.length);
                    
                    // Filtrar por secciones
                    const descripcionItems = video.actividad_detalle.filter(item => item.seccion === 'descripcion');
                    const promptsItems = video.actividad_detalle.filter(item => item.seccion === 'prompts');
                    
                    console.log('📝 Items descripción:', descripcionItems.length);
                    console.log('💡 Items prompts:', promptsItems.length);
                    
                    // Actualizar descripción usando helper
                    if (activityDescription) {
                        const descriptionHTML = this.buildDescriptionHTMLFromDetalle(descripcionItems);
                        activityDescription.innerHTML = descriptionHTML;
                        console.log('✅ Descripción actualizada con actividad_detalle');
                    }
                    
                    // Actualizar prompts usando helper
                    if (activityPrompts) {
                        const promptsHTML = this.buildPromptsHTMLFromDetalle(promptsItems);
                        activityPrompts.innerHTML = promptsHTML;
                        console.log('✅ Prompts actualizados con actividad_detalle');
                    }
                    
                } else {
                    console.log('📜 Usando modo legacy (descripcion_actividad + prompts_actividad)');
                    
                    // MODO LEGACY: usar campos de texto plano
                    if (activityDescription) {
                        if (video.descripcion_actividad && video.descripcion_actividad.trim()) {
                            console.log('📝 Actualizando descripción legacy');
                            
                            // Aplicar formato especial para encabezados reconocibles
                            const formattedDescription = this.formatLegacyContent(video.descripcion_actividad);
                            
                            const htmlContent = `
                                <div class="activity-description-content">
                                    ${this.replaceEmojisWithIcons(formattedDescription).split('\n').map(paragraph => 
                                        paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
                                    ).join('')}
                                </div>
                            `;
                            
                            activityDescription.innerHTML = htmlContent;
                            console.log('✅ Descripción legacy actualizada');
                        } else {
                            activityDescription.innerHTML = `
                                <p class="no-activity">No hay descripción de actividad disponible para este video.</p>
                            `;
                        }
                    }
                    
                    if (activityPrompts) {
                        if (video.prompts_actividad && video.prompts_actividad.trim()) {
                            console.log('💡 Actualizando prompts legacy');
                            
                            // Aplicar formato especial para encabezados reconocibles
                            const formattedPrompts = this.formatLegacyContent(video.prompts_actividad);
                            
                            const promptsHtml = `
                                <div class="activity-prompts-content">
                                    ${this.replaceEmojisWithIcons(formattedPrompts).split('\n').map(prompt => {
                                        const trimmedPrompt = prompt.trim();
                                        if (trimmedPrompt) {
                                            // Detectar bullets y numerados
                                            if (trimmedPrompt.match(/^[\-\•]\s/) || trimmedPrompt.match(/^\d+\.\s/)) {
                                                return `<div class="activity-prompt-item">${trimmedPrompt}</div>`;
                                            } else {
                                                return `<p>${trimmedPrompt}</p>`;
                                            }
                                        }
                                        return '';
                                    }).join('')}
                                </div>
                            `;
                            
                            activityPrompts.innerHTML = promptsHtml;
                            console.log('✅ Prompts legacy actualizados');
                        } else {
                            activityPrompts.innerHTML = `
                                <p class="no-activity">No hay prompts de actividad disponibles para este video.</p>
                            `;
                        }
                    }
                }
                
                console.log('✅ Actividades actualizadas correctamente');
            }
        } catch (error) {
            console.error('❌ Error actualizando actividades:', error);
        }
    }

    // Helper para formatear contenido legacy con encabezados en negrita
    formatLegacyContent(content) {
        if (!content) return content;
        
        return content
            // Poner en negritas los encabezados reconocibles
            .replace(/^(Contexto[:.]?)\s*/gm, '<strong>$1</strong> ')
            .replace(/^(Pautas de la actividad[:.]?)\s*/gm, '<strong>$1</strong> ')
            .replace(/^(Objetivo\(?s?\)?[:.]?)\s*/gm, '<strong>$1</strong> ')
            .replace(/^(Paso \d+[:.]?)\s*/gm, '<strong>$1</strong> ')
            .replace(/^(Instrucciones[:.]?)\s*/gm, '<strong>$1</strong> ')
            .replace(/^(Requerimientos[:.]?)\s*/gm, '<strong>$1</strong> ');
    }

    // =====================================================
    // FUNCIÓN PARA ACTUALIZAR CONTENIDO DE RESUMEN
    // =====================================================

    updateSummaryContent(video) {
        try {
            console.log('🔍 [DEBUG] updateSummaryContent llamado para:', video.video_title);
            console.log('🔍 [DEBUG] Video object keys:', Object.keys(video));
            console.log('🔍 [DEBUG] resumen:', video.resumen ? 'EXISTE' : 'NO EXISTE');
            
            const summaryContent = document.querySelector('.summary-content');
            console.log('🔍 [DEBUG] summary-content encontrado:', !!summaryContent);
            
            if (summaryContent) {
                console.log('📄 Actualizando resumen para:', video.video_title);
                
                // Actualizar el título del resumen
                const summaryTitle = summaryContent.querySelector('h4');
                if (summaryTitle) {
                    summaryTitle.textContent = `Resumen del Video - ${video.video_title}`;
                }
                
                // Verificar si existe el contenedor para el resumen
                let summaryBody = summaryContent.querySelector('.summary-text');
                if (!summaryBody) {
                    // Si no existe, crear la estructura
                    summaryContent.innerHTML = '<div class="summary-text"></div>';
                    summaryBody = summaryContent.querySelector('.summary-text');
                }
                
                if (summaryBody) {
                    if (video.resumen && video.resumen.trim()) {
                        console.log('📄 Actualizando contenido de resumen');
                        console.log('📄 [DEBUG] Contenido resumen (primeros 100 chars):', video.resumen.substring(0, 100));
                        
                        const htmlContent = `
                            <div class="summary-text-content">
                                <h3>Resumen del Video</h3>
                                <div class="summary-body">
                                    ${this.replaceEmojisWithIcons(video.resumen).split('\n').map(paragraph => 
                                        paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
                                    ).join('')}
                                </div>
                            </div>
                        `;
                        
                        summaryBody.innerHTML = htmlContent;
                        console.log('✅ [DEBUG] Resumen HTML actualizado');
                    } else {
                        console.log('⚠️ [DEBUG] No hay resumen, mostrando mensaje de no disponible');
                        summaryBody.innerHTML = `
                            <div class="no-summary">
                                <p>No hay resumen disponible para este video.</p>
                            </div>
                        `;
                    }
                } else {
                    console.log('❌ [DEBUG] No se pudo crear o encontrar .summary-text en el DOM');
                }
                
                console.log('✅ Resumen actualizado correctamente');
            }
        } catch (error) {
            console.error('❌ Error actualizando resumen:', error);
        }
    }

    // =====================================================
    // CONFIGURAR EVENT LISTENERS
    // =====================================================

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');

        // Configurar event delegation en el contenedor de videos
        const videosContainer = document.getElementById('module1VideosList');
        if (videosContainer) {
            videosContainer.addEventListener('click', (event) => {
                console.log('👆 Click detectado en contenedor de videos');
                console.log('🎯 Target del click:', event.target.tagName, event.target.className);
                
                // Encontrar el elemento .video-item más cercano
                const videoItem = event.target.closest('.video-item');
                if (videoItem) {
                    const videoId = videoItem.getAttribute('data-video-id');
                    const youtubeId = videoItem.getAttribute('data-youtube-id');
                    const videoTitle = videoItem.getAttribute('data-video-title');
                    
                    console.log('🎬 Click detectado en video:', {
                        id: videoId,
                        youtubeId: youtubeId,
                        title: videoTitle
                    });
                    
                    // Encontrar el video en nuestros datos
                    const video = this.videos.find(v => v.id === videoId);
                    if (video) {
                        console.log('✅ Video encontrado, seleccionando...');
                        this.selectVideo(video);
                    } else {
                        console.warn('⚠️ Video no encontrado en datos locales:', videoId);
                        console.warn('📋 Videos disponibles:', this.videos.map(v => v.id));
                    }
                } else {
                    console.log('⚠️ Click no fue en un video-item, ignorando');
                }
            });
            console.log('✅ Event delegation configurado en videosContainer');
        } else {
            console.warn('⚠️ Contenedor de videos no encontrado');
        }

        // Event listener para cambio de tema
        const themeToggle = document.querySelector('.theme-toggle-btn');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                // Los videos se actualizarán automáticamente por el sistema de temas
                console.log('🎨 Tema cambiado, actualizando estilos de videos...');
            });
        }

        // Event delegation para botones de copiar
        document.addEventListener('click', (event) => {
            const btn = event.target.closest('button[data-copy]');
            if (!btn) return;
            
            const text = btn.getAttribute('data-copy') || '';
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    console.log('📋 Texto copiado al portapapeles:', text.substring(0, 50) + '...');
                    
                    // Mostrar feedback visual
                    const originalText = btn.textContent;
                    btn.textContent = 'Copiado!';
                    btn.style.backgroundColor = '#4CAF50';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = '';
                    }, 2000);
                    
                }).catch(err => {
                    console.error('❌ Error copiando al portapapeles:', err);
                    
                    // Fallback - crear un textarea temporal
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    
                    // Feedback visual
                    const originalText = btn.textContent;
                    btn.textContent = 'Copiado!';
                    btn.style.backgroundColor = '#4CAF50';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = '';
                    }, 2000);
                });
            }
        });

        console.log('✅ Event listeners configurados');
    }

    // =====================================================
    // FUNCIONES AUXILIARES
    // =====================================================

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Función para reemplazar emojis por iconos SVG profesionales
    replaceEmojisWithIcons(content) {
        if (!content) return content;
        
        return content
            // Reemplazar emoji de documento 📝 por icono SVG
            .replace(/📝/g, `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 4px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
            </svg>`)
            // Reemplazar emoji de bombilla 💡 por icono SVG
            .replace(/💡/g, `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 4px;">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`)
            // Reemplazar emoji de graduación 🎓 por icono SVG
            .replace(/🎓/g, `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 4px;">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>`)
            // Reemplazar emoji de robot 🤖 por icono SVG
            .replace(/🤖/g, `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 4px;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
                <line x1="8" y1="16" x2="8" y2="16"/>
                <line x1="16" y1="16" x2="16" y2="16"/>
            </svg>`)
            // Reemplazar emoji de estrella ✨ por icono SVG
            .replace(/✨/g, `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 4px;">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>`)
            // Reemplazar emoji de símbolo de género ⚧️ por icono SVG
            .replace(/⚧️/g, `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 4px;">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2v20"/>
                <path d="M2 12h20"/>
                <path d="M12 2l8 8-8 8-8-8"/>
            </svg>`);
    }

    getApiBaseUrl() {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const currentPort = window.location.port;
        const isNetlify = window.location.hostname.includes('netlify') || 
                          window.location.hostname.includes('app') ||
                          window.location.hostname === 'ecosdeliderazgo.com' ||
                          window.location.protocol === 'https:' && !isLocalhost;
        
        if (isLocalhost && currentPort === '8888') {
            // Desarrollo local con Netlify Dev
            return '/.netlify/functions';
        } else if (isLocalhost && (currentPort === '3000' || window.location.href.includes(':3000'))) {
            // Desarrollo local con servidor Node.js
            return '/api';
        } else if (isNetlify) {
            // Producción en Netlify (incluye dominios personalizados)
            return '/.netlify/functions';
        } else {
            // Servidor personalizado en producción
            return '/api';
        }
    }

    showError(message) {
        const videosList = document.getElementById('module1VideosList');
        if (videosList) {
            videosList.innerHTML = `
                <div class="error-message">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <span>${message}</span>
                </div>
            `;
        }
    }
}

// =====================================================
// INICIALIZACIÓN AUTOMÁTICA
// =====================================================

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando Module 1 Videos Loader...');
    
    try {
        window.module1VideosLoader = new Module1VideosLoader();
        await window.module1VideosLoader.init();
        console.log('✅ Module 1 Videos Loader inicializado correctamente');
        
    } catch (error) {
        console.error('💥 Error inicializando Module 1 Videos Loader:', error);
    }
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Module1VideosLoader;
}

