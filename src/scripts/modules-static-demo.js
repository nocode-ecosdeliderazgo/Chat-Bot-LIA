/**
 * MODULES STATIC DEMO
 * Sistema de demostración con datos estáticos para mostrar menús desplegables
 */

class ModulesStaticDemo {
    constructor() {
        this.currentVideoId = 'video-1-1';
        this.currentModuleId = 'modulo-1';
        
        // Datos estáticos de ejemplo
        this.modulesData = [
            {
                id: 'modulo-1',
                number: 1,
                title: '¿Qué es la IA?',
                description: 'Introducción fundamental a la Inteligencia Artificial',
                videos: [
                    {
                        id: 'video-1-1',
                        title: 'Bienvenida al curso de Inteligencia Artificial',
                        duration: '5:30',
                        youtube_id: 'MRIv2IwFTPg',
                        completed: false,
                        progress: 0
                    },
                    {
                        id: 'video-1-2',
                        title: 'Historia y evolución de la IA',
                        duration: '8:15',
                        youtube_id: 'NCTDfjtDN1c',
                        completed: false,
                        progress: 0
                    }
                ]
            },
            {
                id: 'modulo-2',
                number: 2,
                title: 'Machine Learning Basics',
                description: 'Conceptos fundamentales del aprendizaje automático',
                videos: [
                    {
                        id: 'video-2-1',
                        title: 'Introducción al Machine Learning',
                        duration: '12:45',
                        youtube_id: 'example2-1',
                        completed: false,
                        progress: 0
                    },
                    {
                        id: 'video-2-2',
                        title: 'Tipos de Machine Learning',
                        duration: '9:30',
                        youtube_id: 'example2-2',
                        completed: false,
                        progress: 0
                    }
                ]
            },
            {
                id: 'modulo-3',
                number: 3,
                title: 'Redes Neuronales',
                description: 'Fundamentos de las redes neuronales artificiales',
                videos: [
                    {
                        id: 'video-3-1',
                        title: 'Qué son las redes neuronales',
                        duration: '15:20',
                        youtube_id: 'example3-1',
                        completed: false,
                        progress: 0
                    },
                    {
                        id: 'video-3-2',
                        title: 'Estructura de una neurona artificial',
                        duration: '11:45',
                        youtube_id: 'example3-2',
                        completed: false,
                        progress: 0
                    }
                ]
            },
            {
                id: 'modulo-4',
                number: 4,
                title: 'Deep Learning',
                description: 'Aprendizaje profundo y sus aplicaciones',
                videos: [
                    {
                        id: 'video-4-1',
                        title: 'Introducción al Deep Learning',
                        duration: '18:30',
                        youtube_id: 'example4-1',
                        completed: false,
                        progress: 0
                    },
                    {
                        id: 'video-4-2',
                        title: 'Redes neuronales convolucionales',
                        duration: '22:15',
                        youtube_id: 'example4-2',
                        completed: false,
                        progress: 0
                    }
                ]
            },
            {
                id: 'modulo-5',
                number: 5,
                title: 'IA en la Práctica',
                description: 'Aplicaciones reales y herramientas de IA',
                videos: [
                    {
                        id: 'video-5-1',
                        title: 'Herramientas de IA más populares',
                        duration: '16:45',
                        youtube_id: 'example5-1',
                        completed: false,
                        progress: 0
                    },
                    {
                        id: 'video-5-2',
                        title: 'Casos de uso reales de IA',
                        duration: '20:30',
                        youtube_id: 'example5-2',
                        completed: false,
                        progress: 0
                    }
                ]
            }
        ];

        // console.log('[ModulesStaticDemo] ✨ Inicializando demo con datos estáticos');
    }

    /**
     * Inicializar el sistema
     */
    async init() {
        try {
            const modulesList = document.getElementById('modulesList');
            
            if (!modulesList) {
                console.error('[ModulesStaticDemo] ❌ Elemento modulesList no encontrado');
                return false;
            }

            // console.log('[ModulesStaticDemo] 🎯 Elemento encontrado, renderizando módulos...');

            // Renderizar módulos inmediatamente
            this.renderModules();

            // Configurar event listeners
            this.setupEventListeners();

            // Cargar primer video por defecto
            this.loadVideo('video-1-1', 'modulo-1');

            // console.log('[ModulesStaticDemo] ✅ Demo inicializada correctamente');
            return true;

        } catch (error) {
            console.error('[ModulesStaticDemo] 💥 Error durante la inicialización:', error);
            return false;
        }
    }

    /**
     * Renderizar todos los módulos
     */
    renderModules() {
        const modulesList = document.getElementById('modulesList');
        
        let html = '';

        this.modulesData.forEach((module, index) => {
            const isFirstModule = index === 0;
            const completedVideos = module.videos.filter(v => v.completed).length;
            const totalVideos = module.videos.length;
            const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

            html += `
                <div class="module-item ${isFirstModule ? 'current' : ''}" data-module-id="${module.id}">
                    <div class="module-header" onclick="window.modulesStaticDemo.toggleModule('${module.id}')">
                        <div class="module-info">
                            <h4>
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                </svg>
                                Módulo ${module.number}: ${module.title}
                            </h4>
                            <div class="module-meta">
                                <span class="module-video-count">
                                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polygon points="10,8 16,12 10,16"/>
                                    </svg>
                                    ${totalVideos} videos
                                </span>
                                <span class="module-progress">
                                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                                    </svg>
                                    ${progressPercent}%
                                </span>
                            </div>
                        </div>
                        <button class="module-toggle ${isFirstModule ? 'expanded' : ''}" data-module-id="${module.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6,9 12,15 18,9"/>
                            </svg>
                        </button>
                    </div>
                    <div class="module-videos ${isFirstModule ? 'expanded' : ''}" data-module-id="${module.id}">
                        <div class="videos-list">
                            ${this.renderVideos(module.videos, module.id)}
                        </div>
                    </div>
                </div>
            `;
        });

        modulesList.innerHTML = html;
        // console.log('[ModulesStaticDemo] ✅ Módulos renderizados correctamente');
    }

    /**
     * Renderizar videos de un módulo
     */
    renderVideos(videos, moduleId) {
        return videos.map((video, index) => {
            const isFirstVideo = (moduleId === 'modulo-1' && index === 0);
            let statusClass = 'not-started';
            let statusIcon = '<circle cx="12" cy="12" r="3"/>';
            let statusText = 'Pendiente';

            if (video.completed) {
                statusClass = 'completed';
                statusIcon = '<path d="M20 6L9 17l-5-5"/>';
                statusText = 'Completado';
            } else if (video.progress > 0) {
                statusClass = 'in-progress';
                statusIcon = '<polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>';
                statusText = `En progreso (${video.progress}%)`;
            }

            return `
                <div class="video-item ${isFirstVideo ? 'current' : ''} ${video.completed ? 'completed' : ''}" 
                     data-video-id="${video.id}" 
                     data-module-id="${moduleId}"
                     onclick="window.modulesStaticDemo.switchToVideo('${video.id}', '${moduleId}')">
                    <div class="video-thumbnail">
                        ${video.youtube_id && video.youtube_id !== 'example' ? 
                            `<img src="https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg" 
                                 alt="${video.title}" 
                                 onerror="this.style.display='none';">` :
                            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polygon points="10,8 16,12 10,16"/>
                            </svg>`
                        }
                    </div>
                    <div class="video-info">
                        <h5 class="video-title">${video.title}</h5>
                        <div class="video-meta">
                            <span class="video-duration">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12,6 12,12 16,14"/>
                                </svg>
                                ${video.duration}
                            </span>
                            <span class="video-status">
                                <div class="status-icon ${statusClass}">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        ${statusIcon}
                                    </svg>
                                </div>
                                ${statusText}
                            </span>
                        </div>
                        ${video.progress > 0 ? `
                            <div class="video-progress">
                                <div class="progress-fill" style="width: ${video.progress}%"></div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Toggle expandir/colapsar módulo
     */
    toggleModule(moduleId) {
        // console.log('[ModulesStaticDemo] 🔄 Toggle módulo:', moduleId);

        const moduleToggle = document.querySelector(`.module-toggle[data-module-id="${moduleId}"]`);
        const moduleVideos = document.querySelector(`.module-videos[data-module-id="${moduleId}"]`);

        if (!moduleToggle || !moduleVideos) {
            console.error('[ModulesStaticDemo] ❌ Elementos del módulo no encontrados');
            return;
        }

        const isExpanded = moduleToggle.classList.contains('expanded');

        if (isExpanded) {
            // Colapsar
            moduleToggle.classList.remove('expanded');
            moduleVideos.classList.remove('expanded');
            // console.log('[ModulesStaticDemo] ➖ Módulo colapsado:', moduleId);
        } else {
            // Expandir
            moduleToggle.classList.add('expanded');
            moduleVideos.classList.add('expanded');
            // console.log('[ModulesStaticDemo] ➕ Módulo expandido:', moduleId);
        }
    }

    /**
     * Cambiar a un video específico
     */
    switchToVideo(videoId, moduleId) {
        // console.log('[ModulesStaticDemo] 🎥 Cambiando a video:', { videoId, moduleId });

        // Encontrar datos del video
        const module = this.modulesData.find(m => m.id === moduleId);
        const video = module ? module.videos.find(v => v.id === videoId) : null;

        if (!video) {
            console.error('[ModulesStaticDemo] ❌ Video no encontrado');
            return;
        }

        // Actualizar estados visuales
        this.updateVideoStates(videoId, moduleId);

        // Actualizar reproductor de YouTube
        this.updateYouTubePlayer(video);

        // Actualizar información del video
        this.updateVideoInfo(video);

        // Actualizar variables de estado
        this.currentVideoId = videoId;
        this.currentModuleId = moduleId;

        // console.log('[ModulesStaticDemo] ✅ Video cambiado exitosamente');
    }

    /**
     * Actualizar reproductor de YouTube
     */
    updateYouTubePlayer(video) {
        const youtubePlayer = document.getElementById('youtubePlayer');
        
        if (!youtubePlayer) {
            console.warn('[ModulesStaticDemo] ⚠️ Reproductor de YouTube no encontrado');
            return;
        }

        if (video.youtube_id && video.youtube_id.startsWith('example')) {
            // Video de ejemplo - mostrar mensaje
            youtubePlayer.srcdoc = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(10, 15, 25, 0.9); color: #44E5FF; font-family: 'Segoe UI', sans-serif;">
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🎥</div>
                        <h3 style="color: #44E5FF; margin-bottom: 1rem;">${video.title}</h3>
                        <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">Duración: ${video.duration}</p>
                        <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">Video de demostración</p>
                        <div style="margin-top: 2rem; padding: 1rem; background: rgba(68, 229, 255, 0.1); border-radius: 8px; border: 1px solid rgba(68, 229, 255, 0.3);">
                            <p style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">En la versión final, aquí se reproducirá el video real desde YouTube</p>
                        </div>
                    </div>
                </div>
            `;
        } else if (video.youtube_id) {
            // Video real de YouTube
            const embedUrl = `https://www.youtube.com/embed/${video.youtube_id}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`;
            youtubePlayer.src = embedUrl;
            youtubePlayer.title = video.title;
        }
    }

    /**
     * Actualizar información del video en la interfaz
     */
    updateVideoInfo(video) {
        const videoInfo = document.querySelector('.video-info');
        if (!videoInfo) return;

        const titleElement = videoInfo.querySelector('h3');
        const durationElement = videoInfo.querySelector('.video-stats span:first-child');
        const infoElement = videoInfo.querySelector('.video-stats span:last-child');

        if (titleElement) {
            titleElement.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="23,7 16,12 23,17"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                ${video.title}
            `;
        }

        if (durationElement) {
            durationElement.innerHTML = `
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                </svg>
                Duración: ${video.duration}
            `;
        }

        if (infoElement) {
            let statusText = 'Video de demostración';
            if (video.completed) {
                statusText = 'Completado';
            } else if (video.progress > 0) {
                statusText = `En progreso (${video.progress}%)`;
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
     * Actualizar estados visuales
     */
    updateVideoStates(videoId, moduleId) {
        // Remover estado 'current' de todos los videos
        document.querySelectorAll('.video-item.current').forEach(item => {
            item.classList.remove('current');
        });

        // Remover estado 'current' de todos los módulos
        document.querySelectorAll('.module-item.current').forEach(item => {
            item.classList.remove('current');
        });

        // Agregar estado 'current' al video seleccionado
        const currentVideo = document.querySelector(`.video-item[data-video-id="${videoId}"]`);
        if (currentVideo) {
            currentVideo.classList.add('current');
        }

        // Agregar estado 'current' al módulo seleccionado
        const currentModule = document.querySelector(`.module-item[data-module-id="${moduleId}"]`);
        if (currentModule) {
            currentModule.classList.add('current');
        }
    }

    /**
     * Cargar video inicial
     */
    loadVideo(videoId, moduleId) {
        // console.log('[ModulesStaticDemo] 📺 Cargando video inicial:', { videoId, moduleId });
        
        // Buscar el video en los datos
        const module = this.modulesData.find(m => m.id === moduleId);
        const video = module ? module.videos.find(v => v.id === videoId) : null;
        
        if (video) {
            this.updateYouTubePlayer(video);
            this.updateVideoInfo(video);
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // console.log('[ModulesStaticDemo] 👂 Event listeners configurados');
    }

    /**
     * Marcar video como completado (para testing)
     */
    markVideoCompleted(videoId, moduleId) {
        const module = this.modulesData.find(m => m.id === moduleId);
        const video = module ? module.videos.find(v => v.id === videoId) : null;
        
        if (video) {
            video.completed = true;
            video.progress = 100;
            // console.log('[ModulesStaticDemo] ✅ Video marcado como completado:', videoId);
            
            // Re-renderizar módulos para actualizar el estado
            this.renderModules();
        }
    }
}

// Auto-inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', async () => {
    // console.log('[ModulesStaticDemo] 🚀 DOM cargado, inicializando demo...');
    
    window.modulesStaticDemo = new ModulesStaticDemo();
    await window.modulesStaticDemo.init();
    
    // Mostrar mensaje de demo en consola
    setTimeout(() => {
        // console.log('%c🎯 DEMO INTERACTIVA LISTA!', 'font-size: 16px; font-weight: bold; color: #44E5FF;');
        // console.log('%cPrueba hacer click en:', 'font-size: 14px; color: #22C55E;');
        // console.log('  • Los títulos de módulos para expandir/colapsar');
        // console.log('  • Los videos para cambiar el reproductor');
        // console.log('  • window.modulesStaticDemo.markVideoCompleted("video-1-1", "modulo-1") para marcar como completado');
    }, 1000);
});

// Exponer globalmente
window.ModulesStaticDemo = ModulesStaticDemo;

// console.log('[ModulesStaticDemo] 📦 Script cargado correctamente');