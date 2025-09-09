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
            const response = await fetch(`${this.apiBaseUrl}/courses/module1-info`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
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

            // Si no está disponible, hacer consulta directa a la API
            console.log('🔄 Haciendo consulta directa a la API...');
            console.log('🌐 URL completa:', `${this.apiBaseUrl}/courses/module1-videos`);
            
            const response = await fetch(`${this.apiBaseUrl}/courses/module1-videos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
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
        console.log('🔧 Creando videos de ejemplo para desarrollo...');
        console.log('⚠️ ATENCIÓN: Estos son videos de ejemplo con IDs de YouTube de prueba');
        console.log('🎯 Preparado para 11 videos del módulo 1 (actualizable cuando agregues videos reales a la base de datos)');
        
        this.videos = [
            {
                id: 'module1-video-1',
                video_title: '1. Introducción a la Inteligencia Artificial',
                duration_seconds: 180,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'Conceptos básicos y definición de IA',
                video_order: 1,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-2',
                video_title: '2. Historia y Evolución de la IA',
                duration_seconds: 240,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'Desde los primeros algoritmos hasta la actualidad',
                video_order: 2,
                user_progress: { current_time_seconds: 45, completion_percentage: 18, is_completed: false }
            },
            {
                id: 'module1-video-3',
                video_title: '3. Tipos de Inteligencia Artificial',
                duration_seconds: 200,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'IA débil vs IA fuerte, Machine Learning, Deep Learning',
                video_order: 3,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-4',
                video_title: '4. Machine Learning: Conceptos Fundamentales',
                duration_seconds: 300,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'Aprendizaje supervisado, no supervisado y por refuerzo',
                video_order: 4,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-5',
                video_title: '5. Aplicaciones Prácticas de la IA',
                duration_seconds: 220,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'Casos de uso en diferentes industrias',
                video_order: 5,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-6',
                video_title: '6. Redes Neuronales Básicas',
                duration_seconds: 280,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'Introducción a perceptrones y redes simples',
                video_order: 6,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-7',
                video_title: '7. Ética en la Inteligencia Artificial',
                duration_seconds: 260,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'Sesgos, privacidad y responsabilidad',
                video_order: 7,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-8',
                video_title: '8. Herramientas y Frameworks de IA',
                duration_seconds: 320,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'TensorFlow, PyTorch, scikit-learn',
                video_order: 8,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-9',
                video_title: '9. Procesamiento del Lenguaje Natural',
                duration_seconds: 240,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'Chatbots, análisis de sentimientos, traducción',
                video_order: 9,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-10',
                video_title: '10. Visión por Computadora',
                duration_seconds: 200,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'Reconocimiento de imágenes y objetos',
                video_order: 10,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            },
            {
                id: 'module1-video-11',
                video_title: '11. Proyecto Final: Implementación de IA',
                duration_seconds: 300,
                youtube_video_id: 'dQw4w9WgXcQ',
                description: 'Proyecto práctico integrando todos los conceptos',
                video_order: 11,
                user_progress: { current_time_seconds: 0, completion_percentage: 0, is_completed: false }
            }
        ];

        console.log('✅ Videos de ejemplo creados:', this.videos.length);
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

        } catch (error) {
            console.error('❌ Error renderizando lista de videos:', error);
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
                
                // Actualizar descripción de la actividad
                const activityDescription = activityContent.querySelector('.activity-description');
                console.log('🔍 [DEBUG] activityDescription encontrado:', !!activityDescription);
                
                if (activityDescription) {
                    if (video.descripcion_actividad && video.descripcion_actividad.trim()) {
                        console.log('📝 Actualizando descripción de actividad');
                        console.log('📝 [DEBUG] Contenido descripción (primeros 100 chars):', video.descripcion_actividad.substring(0, 100));
                        
                        const htmlContent = `
                            <div class="activity-description-content">
                                ${video.descripcion_actividad.split('\n').map(paragraph => 
                                    paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
                                ).join('')}
                            </div>
                        `;
                        
                        activityDescription.innerHTML = htmlContent;
                        console.log('✅ [DEBUG] Descripción HTML actualizado');
                    } else {
                        console.log('⚠️ [DEBUG] No hay descripción, mostrando mensaje de no disponible');
                        activityDescription.innerHTML = `
                            <p class="no-activity">No hay descripción de actividad disponible para este video.</p>
                        `;
                    }
                } else {
                    console.log('❌ [DEBUG] No se encontró .activity-description en el DOM');
                }
                
                // Actualizar prompts de actividad
                const activityPrompts = activityContent.querySelector('.activity-prompts');
                console.log('🔍 [DEBUG] activityPrompts encontrado:', !!activityPrompts);
                
                if (activityPrompts) {
                    if (video.prompts_actividad && video.prompts_actividad.trim()) {
                        console.log('💡 Actualizando prompts de actividad');
                        console.log('💡 [DEBUG] Contenido prompts (primeros 100 chars):', video.prompts_actividad.substring(0, 100));
                        
                        const promptsHtml = `
                            <div class="activity-prompts-content">
                                ${video.prompts_actividad.split('\n').map(prompt => {
                                    const trimmedPrompt = prompt.trim();
                                    if (trimmedPrompt) {
                                        // Si el prompt parece ser una pregunta o ejercicio, agregamos numeración
                                        if (trimmedPrompt.startsWith('-') || trimmedPrompt.startsWith('•') || trimmedPrompt.match(/^\d+\./)) {
                                            return `<div class="activity-item">${trimmedPrompt}</div>`;
                                        } else {
                                            return `<p>${trimmedPrompt}</p>`;
                                        }
                                    }
                                    return '';
                                }).join('')}
                            </div>
                        `;
                        
                        activityPrompts.innerHTML = promptsHtml;
                        console.log('✅ [DEBUG] Prompts HTML actualizado');
                    } else {
                        console.log('⚠️ [DEBUG] No hay prompts, mostrando mensaje de no disponible');
                        activityPrompts.innerHTML = `
                            <p class="no-activity">No hay prompts de actividad disponibles para este video.</p>
                        `;
                    }
                } else {
                    console.log('❌ [DEBUG] No se encontró .activity-prompts en el DOM');
                }
                
                console.log('✅ Actividades actualizadas correctamente');
            }
        } catch (error) {
            console.error('❌ Error actualizando actividades:', error);
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

    getApiBaseUrl() {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const currentPort = window.location.port;
        const isNetlify = window.location.hostname.includes('netlify') || window.location.hostname.includes('app');
        
        if (isLocalhost && currentPort === '8888') {
            // Desarrollo local con Netlify Dev
            return '/.netlify/functions';
        } else if (isLocalhost && (currentPort === '3000' || window.location.href.includes(':3000'))) {
            // Desarrollo local con servidor Node.js
            return '/api';
        } else if (isNetlify) {
            // Producción en Netlify
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

