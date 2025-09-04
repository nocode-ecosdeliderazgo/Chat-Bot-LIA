// Quick fix para cargar videos en chat-online.html
console.log('🚀 Quick Video Fix iniciando...');

// Función para cargar el primer video del curso
async function loadFirstVideo() {
    const iframe = document.getElementById('youtubePlayer');
    if (!iframe) {
        console.error('❌ No se encontró el iframe youtubePlayer');
        return;
    }

    try {
        console.log('📡 Obteniendo datos del video...');
        
        const apiUrl = '/api/courses/introduccion-ia/current-module/9562a449-4ade-4d4b-a3e4-b66dddb7e6f0';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Error en la respuesta de la API');
        }
        
        const video = data.current_video;
        if (!video) {
            throw new Error('No se encontró video actual');
        }
        
        console.log('🎥 Video encontrado:', video.video_title);
        console.log('🔗 URL de embed:', video.youtube_embed_url);
        
        // Cargar el video en el iframe
        iframe.src = video.youtube_embed_url;
        iframe.title = video.video_title;
        
        // Actualizar la información del video en la interfaz
        updateVideoInfo(video);
        
        console.log('✅ Video cargado exitosamente');
        
    } catch (error) {
        console.error('❌ Error cargando video:', error);
        
        // Mostrar mensaje de error en el iframe
        iframe.srcdoc = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; font-family: Arial, sans-serif;">
                <div style="text-align: center;">
                    <h3>Error cargando video</h3>
                    <p>${error.message}</p>
                    <button onclick="window.parent.location.reload()">Recargar página</button>
                </div>
            </div>
        `;
    }
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
        
        console.log('✅ Información del video actualizada');
        
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