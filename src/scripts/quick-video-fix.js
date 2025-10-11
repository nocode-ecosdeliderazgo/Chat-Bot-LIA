// Quick fix para cargar videos en chat-online.html
// console.log('🚫 Quick Video Fix DESACTIVADO - usando Module1 Videos Loader');
// console.log('⚠️ Sistema desactivado para evitar conflictos con module1-videos-loader.js');
return; // Salir temprano para evitar conflictos

// Función para cargar el primer video del curso con retry logic
async function loadFirstVideo() {
    const iframe = document.getElementById('youtubePlayer');
    if (!iframe) {
        console.error('❌ No se encontró el iframe youtubePlayer');
        return;
    }

    try {
        // console.log('📡 Iniciando carga de video con retry logic...');
        await tryLoadVideoWithRetry(iframe);
        
    } catch (error) {
        console.error('❌ Error final cargando video después de todos los reintentos:', error);
        showVideoErrorFallback(iframe, error.message);
    }
}

async function tryLoadVideoWithRetry(iframe, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 1500 * Math.pow(2, retryCount); // 1.5s, 3s, 6s
    
    try {
        // console.log(`🔄 Intento ${retryCount + 1}/${maxRetries + 1} cargando video...`);
        
        const apiUrl = '/api/courses/introduccion-ia/current-module/9562a449-4ade-4d4b-a3e4-b66dddb7e6f0';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // console.log(`📡 Respuesta API: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // console.log('📦 Datos recibidos:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'Error en la respuesta de la API');
        }
        
        const video = data.current_video;
        if (!video) {
            throw new Error('No se encontró video actual');
        }
        
        // console.log('🎥 Video encontrado:', video.video_title);
        // console.log('🔗 URL de embed:', video.youtube_embed_url);
        
        // Cargar el video en el iframe
        iframe.src = video.youtube_embed_url;
        iframe.title = video.video_title;
        
        // Configurar atributos adicionales para evitar bloqueos
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        
        // Actualizar la información del video en la interfaz
        updateVideoInfo(video);
        
        // Si es fallback, mostrar notificación
        if (data._fallback) {
            showTemporaryNotification('Usando datos temporales - algunos datos pueden no estar actualizados');
        }
        
        // console.log('✅ Video cargado exitosamente');
        return; // Éxito, salir
        
    } catch (error) {
        console.error(`❌ Error en intento ${retryCount + 1}:`, error);
        
        if (retryCount < maxRetries) {
            // console.log(`⏰ Reintentando en ${retryDelay}ms...`);
            showRetryNotification(retryCount + 1, maxRetries + 1);
            await delay(retryDelay);
            return await tryLoadVideoWithRetry(iframe, retryCount + 1);
        }
        
        // Si todos los reintentos fallaron, lanzar error
        throw error;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showRetryNotification(currentAttempt, totalAttempts) {
    // Remover notificación anterior si existe
    const existingNotification = document.querySelector('.retry-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'retry-notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #FF9800;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(255,152,0,0.3);
        min-width: 200px;
    `;
    notification.innerHTML = `🔄 Reintentando... (${currentAttempt}/${totalAttempts})`;

    document.body.appendChild(notification);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function showTemporaryNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'api-fallback-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #FFA500;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(255,165,0,0.3);
        max-width: 400px;
        text-align: center;
    `;
    notification.innerHTML = `⚠️ ${message}`;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function showVideoErrorFallback(iframe, errorMessage) {
    // console.log('🔧 Mostrando fallback de error de video');
    
    // Mostrar mensaje de error en el iframe
    iframe.srcdoc = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--glass-bg, #f5f5f5); font-family: Arial, sans-serif;">
                <div style="text-align: center; padding: 2rem; max-width: 400px;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="color: #FF6B6B; margin-bottom: 1rem;">Error cargando video</h3>
                    <p style="color: #666; margin-bottom: 1.5rem;">${errorMessage}</p>
                    <p style="color: #999; font-size: 0.9rem; margin-bottom: 1.5rem;">
                        Se intentó cargar el video múltiples veces sin éxito.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.location.reload()" 
                                style="padding: 0.5rem 1rem; background: #0066CC; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            🔄 Recargar Página
                        </button>
                        <button onclick="loadFirstVideo()" 
                                style="padding: 0.5rem 1rem; background: #FF9800; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            🎥 Reintentar Video
                        </button>
                    </div>
                </div>
            </div>`;
}

// Función para actualizar la información del video en la interfaz
function updateVideoInfo(video) {
    try {
        // Actualizar título del video si existe el elemento
        const videoTitleElement = document.querySelector('.video-info h3');
        if (videoTitleElement) {
            videoTitleElement.textContent = video.video_title;
        }
        
        // Actualizar duración si existe el elemento
        const videoDurationElement = document.querySelector('.video-stats');
        if (videoDurationElement) {
            const minutes = Math.floor(video.duration_seconds / 60);
            const seconds = video.duration_seconds % 60;
            videoDurationElement.textContent = `Duración: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Actualizar transcripción si existe
        const transcriptElement = document.querySelector('.transcript-content');
        if (transcriptElement && video.transcript_text) {
            transcriptElement.textContent = video.transcript_text;
        }
        
        // console.log('✅ Información del video actualizada');
        
    } catch (error) {
        console.error('⚠️ Error actualizando información del video:', error);
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFirstVideo);
} else {
    // Si el DOM ya está listo, ejecutar inmediatamente
    loadFirstVideo();
}

// Función global para recargar video (puede ser útil para debugging)
window.reloadVideo = loadFirstVideo;