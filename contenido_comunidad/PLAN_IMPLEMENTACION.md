# Plan de Implementación: Sistema de Contenido Dinámico en Comunidad

## 📋 Resumen Ejecutivo

Este documento detalla la implementación de funcionalidad interactiva en la pestaña "Acerca de" del archivo `src/Community/community-view.html`, específicamente para las tarjetas de contenido informativo.

### Objetivos Principales
1. **"Comienza aquí"**: Al hacer click, mostrar un video de introducción desde la base de datos en un modal
2. **"Mejora"**: Al hacer click, redireccionar automáticamente a la pestaña de Ligas
3. **Escalabilidad**: Sistema preparado para contenido dinámico adicional en el futuro

---

## 🗄️ Fase 1: Base de Datos

### 1.1 Tabla `community_videos`

**Propósito**: Almacenar videos de introducción y tutoriales para cada comunidad.

**Estructura de la Tabla**:
```sql
CREATE TABLE community_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    video_type VARCHAR(20) NOT NULL, -- 'intro', 'tutorial', 'welcome'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    video_provider VARCHAR(20) DEFAULT 'youtube', -- 'youtube', 'vimeo', 'direct'
    thumbnail_url TEXT,
    duration INTEGER, -- en segundos
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Índices**:
- `idx_community_videos_community_id` en `community_id`
- `idx_community_videos_type` en `video_type`
- `idx_community_videos_active` en `is_active`

**Políticas RLS**:
- SELECT: Público para videos activos
- INSERT/UPDATE/DELETE: Solo admins

### 1.2 Datos de Ejemplo

Insertar videos de ejemplo para las comunidades existentes (ver archivo SQL adjunto).

---

## 🎨 Fase 2: Modificaciones Frontend

### 2.1 HTML - Estructura del Modal

**Ubicación**: `src/Community/community-view.html`

**Agregar antes del cierre de `</body>`**:
```html
<!-- Modal de Video de Introducción -->
<div class="video-modal" id="introVideoModal">
    <div class="video-modal-overlay" id="videoModalOverlay"></div>
    <div class="video-modal-content">
        <div class="video-modal-header">
            <h3 id="videoModalTitle">Video de Introducción</h3>
            <button class="video-modal-close" id="closeVideoModal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="video-modal-body">
            <div class="video-player-wrapper" id="videoPlayerWrapper">
                <!-- El iframe del video se insertará aquí dinámicamente -->
                <div class="video-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando video...</p>
                </div>
            </div>
            <div class="video-description" id="videoDescription"></div>
        </div>
    </div>
</div>
```

**Modificar guideline-cards (líneas 1007-1021)**:
```html
<div class="guidelines-grid">
    <!-- Card "Comienza aquí" -->
    <div class="guideline-card clickable" data-action="show-intro-video">
        <div class="guideline-icon"><i class="fas fa-play"></i></div>
        <h3 class="guideline-title">Comienza aquí</h3>
        <p class="guideline-description">Mira el video de introducción y conoce las reglas básicas.</p>
        <div class="card-click-hint">
            <i class="fas fa-hand-pointer"></i> Click para ver
        </div>
    </div>

    <!-- Card "Recursos" -->
    <div class="guideline-card">
        <div class="guideline-icon"><i class="fas fa-bolt"></i></div>
        <h3 class="guideline-title">Recursos</h3>
        <p class="guideline-description">Plantillas, guías y descuentos para acelerar tu aprendizaje.</p>
    </div>

    <!-- Card "Mejora" -->
    <div class="guideline-card clickable" data-action="redirect-leagues">
        <div class="guideline-icon"><i class="fas fa-arrow-trend-up"></i></div>
        <h3 class="guideline-title">Mejora</h3>
        <p class="guideline-description">Sube de nivel participando y compartiendo aportes de calidad.</p>
        <div class="card-click-hint">
            <i class="fas fa-hand-pointer"></i> Click para ir a Ligas
        </div>
    </div>
</div>
```

### 2.2 JavaScript - Funcionalidad

**Agregar después del código de tabs (línea ~1457)**:

```javascript
// ===== SISTEMA DE CONTENIDO INTERACTIVO - ACERCA DE =====

// Función para obtener el slug de la comunidad actual
function getCurrentCommunitySlug() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug') || 'profesionales';
}

// Función para cargar video de introducción desde la base de datos
async function loadCommunityIntroVideo() {
    const communitySlug = getCurrentCommunitySlug();

    try {
        console.log('📹 Cargando video de introducción para:', communitySlug);

        // Intentar cargar desde Supabase
        if (window.supabase) {
            const { data: community, error: communityError } = await window.supabase
                .from('communities')
                .select('id')
                .eq('slug', communitySlug)
                .single();

            if (communityError) throw communityError;

            const { data: video, error: videoError } = await window.supabase
                .from('community_videos')
                .select('*')
                .eq('community_id', community.id)
                .eq('video_type', 'intro')
                .eq('is_active', true)
                .order('order_index', { ascending: true })
                .limit(1)
                .single();

            if (videoError) throw videoError;

            return video;
        }
    } catch (error) {
        console.warn('⚠️ Error cargando video desde BD, usando fallback:', error);
    }

    // Fallback: Video demo de YouTube
    return {
        title: 'Video de Introducción a la Comunidad',
        description: 'Conoce cómo funciona nuestra comunidad y cómo puedes aprovechar al máximo tu experiencia.',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        video_provider: 'youtube',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    };
}

// Función para construir URL de embed según el proveedor
function buildEmbedUrl(videoUrl, provider) {
    if (provider === 'youtube') {
        // Extraer video ID de diferentes formatos de URL de YouTube
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = videoUrl.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        }
    } else if (provider === 'vimeo') {
        const videoId = videoUrl.split('/').pop();
        return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }

    // Para videos directos, retornar la URL tal cual
    return videoUrl;
}

// Función para mostrar el modal de video
async function showVideoModal() {
    const modal = document.getElementById('introVideoModal');
    const playerWrapper = document.getElementById('videoPlayerWrapper');
    const titleElement = document.getElementById('videoModalTitle');
    const descriptionElement = document.getElementById('videoDescription');

    // Mostrar el modal con loading
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    try {
        // Cargar datos del video
        const videoData = await loadCommunityIntroVideo();

        // Actualizar título y descripción
        titleElement.textContent = videoData.title;
        descriptionElement.textContent = videoData.description || '';

        // Construir URL de embed
        const embedUrl = buildEmbedUrl(videoData.video_url, videoData.video_provider);

        // Crear iframe del video
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.style.width = '100%';
        iframe.style.height = '100%';

        // Limpiar wrapper e insertar iframe
        playerWrapper.innerHTML = '';
        playerWrapper.appendChild(iframe);

        console.log('✅ Video modal mostrado correctamente');

    } catch (error) {
        console.error('❌ Error mostrando video modal:', error);
        playerWrapper.innerHTML = `
            <div class="video-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error cargando el video. Por favor, intenta de nuevo más tarde.</p>
            </div>
        `;
    }
}

// Función para cerrar el modal de video
function closeVideoModal() {
    const modal = document.getElementById('introVideoModal');
    const playerWrapper = document.getElementById('videoPlayerWrapper');

    // Ocultar modal
    modal.style.display = 'none';
    document.body.style.overflow = '';

    // Limpiar contenido del player para detener el video
    playerWrapper.innerHTML = `
        <div class="video-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando video...</p>
        </div>
    `;

    console.log('ℹ️ Video modal cerrado');
}

// Función para redireccionar a la pestaña de Ligas
function redirectToLeaguesTab() {
    console.log('🏆 Redireccionando a pestaña de Ligas...');

    // Remover clase active de todos los tabs
    document.querySelectorAll('.subnav-link').forEach(btn => btn.classList.remove('active'));

    // Activar tab de Ligas
    const leaguesTab = document.querySelector('[data-tab="leagues"]');
    if (leaguesTab) {
        leaguesTab.classList.add('active');
    }

    // Ocultar todas las secciones
    document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');

    // Mostrar sección de Ligas
    const leaguesSection = document.getElementById('tab-leagues');
    if (leaguesSection) {
        leaguesSection.style.display = 'block';

        // Scroll suave a la parte superior
        window.scrollTo({ top: 0, behavior: 'smooth' });

        console.log('✅ Redireccionado a Ligas exitosamente');
    } else {
        console.error('❌ Sección de Ligas no encontrada');
    }
}

// Event Listeners para las guideline-cards
document.addEventListener('DOMContentLoaded', () => {
    // Listener para cards clickeables
    document.querySelectorAll('.guideline-card.clickable').forEach(card => {
        card.addEventListener('click', () => {
            const action = card.getAttribute('data-action');

            if (action === 'show-intro-video') {
                showVideoModal();
            } else if (action === 'redirect-leagues') {
                redirectToLeaguesTab();
            }
        });

        // Agregar efecto hover
        card.style.cursor = 'pointer';
    });

    // Listener para cerrar modal de video
    document.getElementById('closeVideoModal')?.addEventListener('click', closeVideoModal);
    document.getElementById('videoModalOverlay')?.addEventListener('click', closeVideoModal);

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('introVideoModal');
            if (modal && modal.style.display === 'flex') {
                closeVideoModal();
            }
        }
    });
});
```

### 2.3 CSS - Estilos

**Agregar al final del bloque `<style>` en community-view.html**:

```css
/* ===== MODAL DE VIDEO ===== */
.video-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10000;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
}

.video-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(5px);
}

.video-modal-content {
    position: relative;
    background: var(--surface);
    border-radius: 16px;
    width: 90%;
    max-width: 1000px;
    max-height: 90vh;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    animation: slideUp 0.4s ease;
}

.video-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
}

.video-modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
}

.video-modal-close {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.video-modal-close:hover {
    background: var(--surface-hover);
    color: var(--text-primary);
    transform: rotate(90deg);
}

.video-modal-body {
    padding: 24px;
}

.video-player-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    background: #000;
    border-radius: 12px;
    overflow: hidden;
}

.video-player-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.video-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #fff;
}

.video-loading i {
    font-size: 3rem;
    margin-bottom: 16px;
}

.video-loading p {
    font-size: 1.1rem;
    margin: 0;
}

.video-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #fff;
}

.video-error i {
    font-size: 3rem;
    color: #ff6b6b;
    margin-bottom: 16px;
}

.video-error p {
    font-size: 1.1rem;
    margin: 0;
}

.video-description {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
    color: var(--text-secondary);
    line-height: 1.6;
}

/* ===== GUIDELINE CARDS CLICKEABLES ===== */
.guideline-card.clickable {
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
}

.guideline-card.clickable:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 40px rgba(68, 229, 255, 0.3);
    border-color: var(--primary-color);
}

.guideline-card.clickable::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(68, 229, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.guideline-card.clickable:hover::after {
    opacity: 1;
}

.card-click-hint {
    margin-top: 12px;
    font-size: 0.85rem;
    color: var(--primary-color);
    font-weight: 600;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.guideline-card.clickable:hover .card-click-hint {
    opacity: 1;
    transform: translateY(0);
}

.card-click-hint i {
    margin-right: 6px;
    animation: bounce 2s infinite;
}

/* ===== ANIMACIONES ===== */
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-5px);
    }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
    .video-modal-content {
        width: 95%;
        max-height: 85vh;
    }

    .video-modal-header {
        padding: 16px;
    }

    .video-modal-header h3 {
        font-size: 1.2rem;
    }

    .video-modal-body {
        padding: 16px;
    }

    .video-player-wrapper {
        padding-bottom: 75%; /* Más cuadrado en móvil */
    }
}
```

---

## 🔌 Fase 3: Backend (Opcional - Netlify Functions)

### 3.1 API Endpoint

**Archivo**: `netlify/functions/community-intro-video.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Extraer community_slug de la URL
        const pathParts = event.path.split('/');
        const communitySlug = pathParts[pathParts.length - 2];

        if (!communitySlug) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Community slug is required' })
            };
        }

        // Obtener community_id
        const { data: community, error: communityError } = await supabase
            .from('communities')
            .select('id')
            .eq('slug', communitySlug)
            .single();

        if (communityError) throw communityError;

        // Obtener video de introducción
        const { data: video, error: videoError } = await supabase
            .from('community_videos')
            .select('*')
            .eq('community_id', community.id)
            .eq('video_type', 'intro')
            .eq('is_active', true)
            .order('order_index', { ascending: true })
            .limit(1)
            .single();

        if (videoError) {
            // Si no hay video, retornar video de fallback
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    fallback: true,
                    data: {
                        title: 'Video de Introducción',
                        description: 'Bienvenido a la comunidad',
                        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        video_provider: 'youtube'
                    }
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: video
            })
        };

    } catch (error) {
        console.error('Error fetching intro video:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
```

### 3.2 Configuración en netlify.toml

**Agregar redirect** (si se usa Netlify Functions):

```toml
[[redirects]]
  from = "/api/community/:slug/intro-video"
  to = "/.netlify/functions/community-intro-video"
  status = 200
```

---

## 🧪 Fase 4: Testing

### 4.1 Checklist de Testing

**Funcionalidad**:
- [ ] Click en "Comienza aquí" → Modal aparece
- [ ] Video se carga correctamente desde DB
- [ ] Fallback funciona si no hay DB
- [ ] Click en cerrar (X) → Modal se cierra
- [ ] Click en overlay → Modal se cierra
- [ ] Tecla ESC → Modal se cierra
- [ ] Click en "Mejora" → Redirige a tab Ligas
- [ ] Scroll automático al cambiar de tab

**Responsive**:
- [ ] Modal responsive en mobile
- [ ] Aspect ratio 16:9 se mantiene
- [ ] Cards clickeables funcionan en touch
- [ ] Hover states funcionan correctamente

**Performance**:
- [ ] Video no se carga hasta hacer click
- [ ] Video se detiene al cerrar modal
- [ ] Sin memory leaks
- [ ] Sin errores de consola

**Accesibilidad**:
- [ ] Tab navigation funciona
- [ ] Screen reader compatible
- [ ] Keyboard shortcuts funcionan
- [ ] Contraste adecuado

### 4.2 Escenarios de Prueba

**Escenario 1: Usuario nuevo**
1. Navegar a community-view.html
2. Ir a pestaña "Acerca de"
3. Click en "Comienza aquí"
4. Verificar que el video se muestra
5. Cerrar modal con X
6. Click en "Mejora"
7. Verificar redirección a Ligas

**Escenario 2: Sin conexión a DB**
1. Desactivar Supabase
2. Click en "Comienza aquí"
3. Verificar que se muestra video de fallback
4. Verificar que no hay errores críticos

**Escenario 3: Mobile**
1. Abrir en dispositivo móvil
2. Repetir escenario 1
3. Verificar touch interactions
4. Verificar responsive layout

---

## 📊 Fase 5: Métricas de Éxito

### KPIs a Monitorear

**Engagement**:
- Número de clicks en "Comienza aquí"
- Tiempo promedio de visualización del video
- Tasa de finalización del video
- Clicks en "Mejora" → redirección a Ligas

**Técnicas**:
- Tiempo de carga del modal
- Tasa de error en carga de videos
- Performance score (Lighthouse)

**UX**:
- Tasa de rebote después de ver video
- Interacciones con tab de Ligas después de redirección

### Herramientas de Medición

- Google Analytics: Eventos personalizados
- Console logs: Debugging
- Supabase: Queries de video más visto
- User feedback: Encuestas

---

## 🔄 Fase 6: Mantenimiento

### Actualizaciones Futuras

**Corto plazo** (1-2 semanas):
- Agregar analytics de visualización
- Implementar sistema de comentarios en videos
- Agregar subtítulos/captions

**Mediano plazo** (1-2 meses):
- Playlist de videos tutoriales
- Sistema de favoritos
- Compartir en redes sociales

**Largo plazo** (3+ meses):
- Videos interactivos con quizzes
- Gamificación por videos vistos
- Recomendaciones personalizadas

### Troubleshooting Común

**Problema**: Video no se carga
- **Causa**: URL inválida o proveedor no soportado
- **Solución**: Validar URL, verificar proveedor en BD

**Problema**: Modal no aparece
- **Causa**: Conflicto de z-index o display
- **Solución**: Verificar CSS, inspeccionar estilos

**Problema**: Redirección a Ligas falla
- **Causa**: Selector incorrecto o tab no existe
- **Solución**: Verificar DOM, console logs

---

## ✅ Checklist Final de Implementación

### Base de Datos
- [ ] Ejecutar `community_videos_schema.sql` en Supabase
- [ ] Verificar creación de tabla
- [ ] Verificar políticas RLS
- [ ] Insertar datos de ejemplo
- [ ] Probar queries manualmente

### Frontend - HTML
- [ ] Agregar modal de video al HTML
- [ ] Modificar guideline-cards con data-action
- [ ] Agregar hint de click
- [ ] Verificar estructura del modal

### Frontend - JavaScript
- [ ] Copiar funciones al archivo
- [ ] Verificar event listeners
- [ ] Probar carga de video desde DB
- [ ] Probar fallback
- [ ] Probar redirección a Ligas
- [ ] Verificar cierre de modal (X, overlay, ESC)

### Frontend - CSS
- [ ] Agregar estilos del modal
- [ ] Agregar estilos de cards clickeables
- [ ] Agregar animaciones
- [ ] Verificar responsive
- [ ] Probar hover states

### Backend (Opcional)
- [ ] Crear Netlify Function
- [ ] Configurar netlify.toml
- [ ] Probar endpoint
- [ ] Verificar CORS
- [ ] Verificar manejo de errores

### Testing
- [ ] Testing funcional completo
- [ ] Testing responsive
- [ ] Testing de performance
- [ ] Testing de accesibilidad
- [ ] User acceptance testing

### Deployment
- [ ] Deploy a staging
- [ ] Smoke testing en staging
- [ ] Deploy a producción
- [ ] Monitoring post-deploy
- [ ] Documentar cualquier issue

---

## 📚 Recursos Adicionales

### Documentación de Referencia
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [YouTube Embed API](https://developers.google.com/youtube/iframe_api_reference)
- [Vimeo Player API](https://developer.vimeo.com/player/sdk)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Código de Ejemplo
- Ver `community-view.html` líneas 1403-1457 para sistema de tabs
- Ver `community.css` para estilos de referencia
- Ver `community-view.html` para estructura de modales existentes

---

## 🤝 Contribuciones

Este plan fue generado para facilitar la implementación del sistema de contenido dinámico. Para modificaciones o mejoras, consultar con el equipo de desarrollo.

**Autor**: Claude Code
**Fecha**: 2025-01-10
**Versión**: 1.0.0

---

## 📝 Notas Finales

- Este plan asume familiaridad con el codebase existente de Chat-Bot-LIA
- Se recomienda crear un branch separado para esta implementación
- Hacer commits granulares para facilitar rollback si es necesario
- Documentar cualquier desviación del plan original
- Mantener este documento actualizado con cambios realizados

**¡Éxito en la implementación! 🚀**
