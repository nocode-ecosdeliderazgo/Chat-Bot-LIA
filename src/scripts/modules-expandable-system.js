/**
 * MODULES EXPANDABLE SYSTEM
 * Sistema de módulos expandibles/contraíbles que se conecta con la base de datos
 * y muestra los videos correspondientes de cada módulo
 */

class ModulesExpandableSystem {
    constructor() {
        this.currentVideoId = null;
        this.currentModuleId = null;
        this.modulesData = [];
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadModulesFromDatabase = this.loadModulesFromDatabase.bind(this);
        this.renderModules = this.renderModules.bind(this);
        this.toggleModule = this.toggleModule.bind(this);
        this.playVideo = this.playVideo.bind(this);
        this.updateVideoInfo = this.updateVideoInfo.bind(this);
    }

    async init() {
        console.log('🚀 Inicializando sistema de módulos expandibles...');
        
        try {
            // Cargar módulos desde la base de datos
            await this.loadModulesFromDatabase();
            
            // Renderizar módulos
            this.renderModules();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Sistema de módulos expandibles inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de módulos:', error);
            // Fallback a datos estáticos si falla la base de datos
            this.loadFallbackData();
            this.renderModules();
        }
    }

    async loadModulesFromDatabase() {
        try {
            console.log('📚 Cargando módulos desde la base de datos...');
            
            // Intentar obtener datos del curso desde la API
            const response = await fetch('/api/courses/ia-fundamentos/full-structure');
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    this.modulesData = data.data.modules || [];
                    console.log('✅ Módulos cargados desde la base de datos:', this.modulesData);
                    return;
                }
            }
            
            // Si falla la API, intentar con datos locales
            console.log('⚠️ API no disponible, usando datos locales...');
            this.loadLocalData();
            
        } catch (error) {
            console.error('❌ Error cargando desde base de datos:', error);
            this.loadLocalData();
        }
    }

    loadLocalData() {
        // Datos locales como fallback
        this.modulesData = [
            {
                id: 'modulo-1',
                module_number: 1,
                title: '¿Qué es la IA?',
                description: 'Introducción fundamental a la Inteligencia Artificial',
                module_videos: [
                    {
                        id: 'video-1-1',
                        video_title: 'Bienvenida al curso de Inteligencia Artificial',
                        duration_seconds: 330,
                        youtube_video_id: 'MRIv2IwFTPg',
                        video_order: 1
                    },
                    {
                        id: 'video-1-2',
                        video_title: 'Historia y evolución de la IA',
                        duration_seconds: 495,
                        youtube_video_id: 'NCTDfjtDN1c',
                        video_order: 2
                    }
                ]
            },
            {
                id: 'modulo-2',
                module_number: 2,
                title: 'Machine Learning',
                description: 'Conceptos fundamentales del aprendizaje automático',
                module_videos: [
                    {
                        id: 'video-2-1',
                        video_title: 'Introducción al Machine Learning',
                        duration_seconds: 765,
                        youtube_video_id: 'example2-1',
                        video_order: 1
                    },
                    {
                        id: 'video-2-2',
                        video_title: 'Tipos de Machine Learning',
                        duration_seconds: 570,
                        youtube_video_id: 'example2-2',
                        video_order: 2
                    }
                ]
            },
            {
                id: 'modulo-3',
                module_number: 3,
                title: 'Redes Neuronales',
                description: 'Fundamentos de las redes neuronales artificiales',
                module_videos: [
                    {
                        id: 'video-3-1',
                        video_title: 'Qué son las redes neuronales',
                        duration_seconds: 920,
                        youtube_video_id: 'example3-1',
                        video_order: 1
                    },
                    {
                        id: 'video-3-2',
                        video_title: 'Estructura de una neurona artificial',
                        duration_seconds: 705,
                        youtube_video_id: 'example3-2',
                        video_order: 2
                    }
                ]
            },
            {
                id: 'modulo-4',
                module_number: 4,
                title: 'Deep Learning',
                description: 'Aprendizaje profundo y sus aplicaciones',
                module_videos: [
                    {
                        id: 'video-4-1',
                        video_title: 'Introducción al Deep Learning',
                        duration_seconds: 1110,
                        youtube_video_id: 'example4-1',
                        video_order: 1
                    },
                    {
                        id: 'video-4-2',
                        video_title: 'Aplicaciones del Deep Learning',
                        duration_seconds: 840,
                        youtube_video_id: 'example4-2',
                        video_order: 2
                    }
                ]
            },
            {
                id: 'modulo-5',
                module_number: 5,
                title: 'IA en la Práctica',
                description: 'Aplicaciones reales y casos de uso',
                module_videos: [
                    {
                        id: 'video-5-1',
                        video_title: 'Casos de uso en empresas',
                        duration_seconds: 900,
                        youtube_video_id: 'example5-1',
                        video_order: 1
                    },
                    {
                        id: 'video-5-2',
                        video_title: 'Implementación de IA',
                        duration_seconds: 720,
                        youtube_video_id: 'example5-2',
                        video_order: 2
                    }
                ]
            }
        ];
        
        console.log('📚 Módulos cargados desde datos locales:', this.modulesData);
    }

    renderModules() {
        const modulesContainer = document.getElementById('modulesList');
        if (!modulesContainer) {
            console.error('❌ Contenedor de módulos no encontrado');
            return;
        }

        // Limpiar contenedor
        modulesContainer.innerHTML = '';

        // Renderizar cada módulo
        this.modulesData.forEach((module, index) => {
            const moduleElement = this.createModuleElement(module, index);
            modulesContainer.appendChild(moduleElement);
        });

        // Establecer el primer módulo como activo por defecto
        if (this.modulesData.length > 0) {
            this.setActiveModule(this.modulesData[0].id);
        }

        console.log('✅ Módulos renderizados correctamente');
    }

    createModuleElement(module, index) {
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'module-item';
        moduleDiv.id = `module-${module.id}`;
        moduleDiv.dataset.moduleId = module.id;
        
        // Determinar si es el primer módulo (activo por defecto)
        const isFirstModule = index === 0;
        const isExpanded = isFirstModule;
        
        if (isFirstModule) {
            moduleDiv.classList.add('current', 'expanded');
        }

        // Crear contenido del módulo
        moduleDiv.innerHTML = `
            <div class="module-header" onclick="window.modulesExpandableSystem.toggleModule('${module.id}')">
                <div class="module-info">
                    <div class="module-icon">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                    </div>
                    <div class="module-details">
                        <h4>${module.module_number}: ${module.title}</h4>
                        <p>${module.description}</p>
                    </div>
                </div>
                <div class="module-actions">
                    <div class="module-stats">
                        <span class="video-count">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                            ${module.module_videos.length} videos
                        </span>
                        <span class="progress-indicator">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                            </svg>
                            0%
                        </span>
                    </div>
                    <div class="module-toggle">
                        <svg class="toggle-icon ${isExpanded ? 'expanded' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6,9 12,15 18,9"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="module-content ${isExpanded ? 'expanded' : ''}" style="display: ${isExpanded ? 'block' : 'none'};">
                <div class="videos-list">
                    ${this.createVideosList(module.module_videos, module.id)}
                </div>
            </div>
        `;

        return moduleDiv;
    }

    createVideosList(videos, moduleId) {
        return videos.map((video, index) => {
            const isFirstVideo = index === 0;
            const isActive = isFirstVideo && moduleId === this.modulesData[0]?.id;
            
            return `
                <div class="video-item ${isActive ? 'active' : ''}" 
                     data-video-id="${video.id}" 
                     data-youtube-id="${video.youtube_video_id}"
                     onclick="window.modulesExpandableSystem.playVideo('${video.id}', '${video.youtube_video_id}', '${video.video_title}')">
                    <div class="video-info">
                        <div class="video-icon">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="video-details">
                            <h5>${video.video_title}</h5>
                            <span class="video-duration">${this.formatDuration(video.duration_seconds)}</span>
                        </div>
                    </div>
                    <div class="video-status">
                        ${isActive ? '<span class="status-active">Reproduciendo</span>' : '<span class="status-pending">Pendiente</span>'}
                    </div>
                </div>
            `;
        }).join('');
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    toggleModule(moduleId) {
        const moduleElement = document.getElementById(`module-${moduleId}`);
        if (!moduleElement) return;

        const isExpanded = moduleElement.classList.contains('expanded');
        const contentElement = moduleElement.querySelector('.module-content');
        const toggleIcon = moduleElement.querySelector('.toggle-icon');

        if (isExpanded) {
            // Contraer módulo
            moduleElement.classList.remove('expanded');
            contentElement.style.display = 'none';
            toggleIcon.classList.remove('expanded');
        } else {
            // Expandir módulo
            moduleElement.classList.add('expanded');
            contentElement.style.display = 'block';
            toggleIcon.classList.add('expanded');
        }

        console.log(`🔄 Módulo ${moduleId} ${isExpanded ? 'contraído' : 'expandido'}`);
    }

    playVideo(videoId, youtubeId, videoTitle) {
        console.log(`🎬 Reproduciendo video: ${videoId} - ${videoTitle}`);
        
        // Actualizar video activo
        this.currentVideoId = videoId;
        
        // Actualizar estado visual
        this.updateVideoActiveState(videoId);
        
        // Cargar video en el reproductor
        this.loadVideoInPlayer(youtubeId, videoTitle);
        
        // Actualizar información del video
        this.updateVideoInfo(videoTitle);
    }

    updateVideoActiveState(videoId) {
        // Remover estado activo de todos los videos
        document.querySelectorAll('.video-item').forEach(item => {
            item.classList.remove('active');
        });

        // Agregar estado activo al video seleccionado
        const activeVideo = document.querySelector(`[data-video-id="${videoId}"]`);
        if (activeVideo) {
            activeVideo.classList.add('active');
            
            // Buscar elemento de estado y actualizar si existe
            const statusElement = activeVideo.querySelector('.status-active, .video-status, .status');
            if (statusElement) {
                statusElement.textContent = 'Reproduciendo';
            } else {
                console.log('⚠️ Elemento de estado no encontrado para video:', videoId);
            }
        }
    }

    loadVideoInPlayer(youtubeId, videoTitle) {
        const player = document.getElementById('youtubePlayer');
        if (!player) {
            console.error('❌ Reproductor de YouTube no encontrado');
            return;
        }

        // Construir URL del video
        const videoUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
        
        // Cargar video
        player.src = videoUrl;
        player.title = videoTitle;
        
        console.log(`✅ Video cargado en reproductor: ${videoTitle}`);
    }

    updateVideoInfo(videoTitle) {
        // Actualizar título del video
        const videoTitleElement = document.querySelector('.video-info h3');
        if (videoTitleElement) {
            videoTitleElement.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="23,7 16,12 23,17"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                ${videoTitle}
            `;
        }

        // Actualizar estadísticas del video
        const videoStatsElement = document.querySelector('.video-stats span:first-child');
        if (videoStatsElement) {
            videoStatsElement.innerHTML = `
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                </svg>
                Duración: Cargando...
            `;
        }
    }

    setActiveModule(moduleId) {
        // Remover estado activo de todos los módulos
        document.querySelectorAll('.module-item').forEach(item => {
            item.classList.remove('current');
        });

        // Agregar estado activo al módulo seleccionado
        const activeModule = document.getElementById(`module-${moduleId}`);
        if (activeModule) {
            activeModule.classList.add('current');
        }

        this.currentModuleId = moduleId;
    }

    setupEventListeners() {
        // Event listeners ya están configurados en los elementos HTML
        console.log('✅ Event listeners configurados');
    }

    // Método público para obtener el video actual
    getCurrentVideo() {
        if (!this.currentVideoId) return null;
        
        for (const module of this.modulesData) {
            const video = module.module_videos.find(v => v.id === this.currentVideoId);
            if (video) return { ...video, module: module };
        }
        return null;
    }

    // Método público para obtener el módulo actual
    getCurrentModule() {
        if (!this.currentModuleId) return null;
        return this.modulesData.find(m => m.id === this.currentModuleId);
    }
}

// Exportar para uso global
window.ModulesExpandableSystem = ModulesExpandableSystem;

// Auto-inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM listo - Inicializando sistema de módulos expandibles');
    
    if (!window.modulesExpandableSystem) {
        window.modulesExpandableSystem = new ModulesExpandableSystem();
        window.modulesExpandableSystem.init();
    }
});
