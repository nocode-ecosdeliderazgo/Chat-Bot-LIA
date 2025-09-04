Quiero que transformes mi vista de curso para que el panel izquierdo “Material del Curso” muestre un menú desplegable por módulos (acordeón). Cada módulo debe listar exactamente 2 videos (los 2 primeros por video_order). Al hacer clic en un video, se debe actualizar el reproductor de YouTube del panel central, el título, la duración y la transcripción. Todo debe venir de Supabase (course_modules, module_videos) y no debe haber datos hardcodeados.

Contexto y puntos de integración

El contenedor donde debes renderizar los módulos ya existe: #modulesList. Úsalo para pintar el acordeón. 

El iframe del reproductor también existe: #youtubePlayer. Es el que debes actualizar al seleccionar video. 

El JS actual inicia en class ChatOnline, corre loadInitialData() y maneja pestañas, notas, etc. Debes reemplazar la carga inicial para leer de Supabase y poblar el panel izquierdo. 

Hoy hay títulos y lógica de módulos “de ejemplo” (hardcode) que debes eliminar/sustituir. Ej.: moduleNames dentro de changeVideoByModule y la playlist de pruebas loadTestVideos(). 
 

Esquema relevante de BD (Supabase)

course_modules: id (uuid), course_id (uuid), module_number (int), title (varchar), order_index (int)… Úsalo para construir el acordeón (1 item por módulo, ordenado por order_index o module_number). 

module_videos: id (uuid), module_id (uuid), video_title, youtube_video_id, duration_seconds, transcript_text, video_order… Saca los 2 primeros por video_order ASC. 

Nota: transcript_text debe mostrarse en la pestaña “Transcripción” cuando cambie el video. 

Requerimientos funcionales

Resolver el curso usando (en este orden):

data-course-id o data-course-slug en el elemento #modulesList,

o ?course_id=/?course_slug= en URL,

o localStorage.currentCourseId/currentCourseSlug.
No hardcodear un curso por defecto.

Fetch de módulos:

Query a course_modules filtrando por course_id (o por courses.slug si recibimos slug), ordenado por order_index (fallback module_number).

Por cada módulo, fetch de videos a module_videos filtrando module_id, ordenado por video_order ASC, y tomar 2.

Render:

Acordeón:

Header del módulo (número + título + duración total opcional).

Sublista con 2 videos (mostrar título y duración mm:ss).

Al hacer clic en un video:

Actualiza #youtubePlayer con https://www.youtube.com/embed/${youtube_video_id}?enablejsapi=1&modestbranding=1&rel=0 (respeta el patrón que ya usa la app). 

Actualiza título y duración visibles bajo el player. 

Rellena la pestaña Transcripción con transcript_text.

Si un módulo tiene <2 videos, muestra sólo los existentes; si tiene >2, muestra sólo los 2 primeros.

Nada hardcodeado: eliminar/ignorar moduleNames y loadTestVideos en el flujo principal. 
 

No romper lo demás: mantener navegación superior, notas, progreso y estilos existentes.

Cambios concretos (parches)
1) HTML — insertar Supabase (si no existe)

Antes de </body> agrega:

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  window.SUPABASE_URL = '<TU_URL>';
  window.SUPABASE_ANON_KEY = '<TU_ANON_KEY>';
</script>


(El iframe#youtubePlayer y #modulesList ya existen; no los toques. 
 
)

2) CSS — agrega estilos mínimos del submenú (al final de chat-online.css)
/* ===== Acordeón de módulos (panel izquierdo) ===== */
.module-accordion { border: 1px solid rgba(68,229,255,.12); border-radius: 10px; overflow: hidden; }
.module-accordion + .module-accordion { margin-top: .5rem; }

.module-header {
  width: 100%; background: rgba(255,255,255,.05); color: var(--glass-text-primary);
  border: 0; text-align: left; padding: .75rem 1rem; display:flex; align-items:center; justify-content:space-between;
  cursor: pointer; transition: .2s ease;
}
.module-header:hover { background: rgba(68,229,255,.10); }

.video-sublist { list-style: none; margin: 0; padding: .5rem 0; background: rgba(255,255,255,.03); }
.video-item { padding: .5rem 1rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer; }
.video-item:hover { background: rgba(68,229,255,.08); }

.video-item .v-title { color: var(--glass-text-primary); font-size: .92rem; }
.video-item .v-time  { color: var(--glass-text-muted); font-size: .82rem; }

3) JS — insertar utilidades Supabase y la nueva carga de datos

En chat-online.js, dentro de la clase ChatOnline, añade estos métodos y úsalo en init() en lugar de la carga hardcodeada. (El archivo ya expone funciones para cambiar el video y título; reúsalas). 
 

// === SUPABASE CLIENT ===
initSupabase() {
  if (!window.supabase) { console.error('Supabase SDK no está cargado'); return null; }
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) { console.error('Faltan credenciales Supabase'); return null; }
  this.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  return this.sb;
},

// === RESOLVER CONTEXTO DE CURSO ===
resolveCourseContext() {
  const modulesEl = document.getElementById('modulesList');
  const url = new URL(window.location.href);
  const ctx = {
    course_id: modulesEl?.dataset?.courseId || localStorage.getItem('currentCourseId') || url.searchParams.get('course_id') || null,
    course_slug: modulesEl?.dataset?.courseSlug || localStorage.getItem('currentCourseSlug') || url.searchParams.get('course_slug') || null,
  };
  return ctx;
},

// === CARGA INICIAL: módulos + 2 videos/módulo ===
async loadInitialData() {
  // 1) Supabase
  if (!this.initSupabase()) return;

  // 2) Resolver curso
  const ctx = this.resolveCourseContext();

  let courseId = ctx.course_id;
  if (!courseId && ctx.course_slug) {
    // lookup por slug en courses.slug
    const { data: course, error: eCourse } = await this.sb
      .from('courses').select('id').eq('slug', ctx.course_slug).maybeSingle();
    if (eCourse) { console.error(eCourse); return; }
    courseId = course?.id || null;
  }
  if (!courseId) { console.error('No hay course_id/course_slug'); return; }

  // 3) Traer módulos
  const { data: modules, error: eModules } = await this.sb
    .from('course_modules')
    .select('id, module_number, title, description, order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  if (eModules) { console.error(eModules); return; }
  if (!modules?.length) { this.renderModules([]); return; }

  // 4) Traer videos de todos los módulos (y quedarnos con los 2 primeros por módulo)
  const moduleIds = modules.map(m => m.id);
  const { data: videos, error: eVideos } = await this.sb
    .from('module_videos')
    .select('id, module_id, video_title, youtube_video_id, duration_seconds, transcript_text, video_order')
    .in('module_id', moduleIds)
    .order('video_order', { ascending: true });
  if (eVideos) { console.error(eVideos); return; }

  const vidsByModule = moduleIds.reduce((acc, mid) => {
    acc[mid] = [];
    return acc;
  }, {});
  (videos || []).forEach(v => { if (vidsByModule[v.module_id]) vidsByModule[v.module_id].push(v); });

  // 5) Pintar acordeón (2 videos por módulo)
  this.renderModules(modules, vidsByModule);

  // 6) Autoplay: primer video del primer módulo (si existe)
  const firstModule = modules[0];
  const firstTwo = (vidsByModule[firstModule.id] || []).slice(0, 2);
  if (firstTwo[0]) this.playDbVideo(firstTwo[0]);
},

renderModules(modules = [], vidsByModule = {}) {
  const host = document.getElementById('modulesList');
  if (!host) return;
  host.innerHTML = '';

  modules.forEach(m => {
    const two = (vidsByModule[m.id] || []).slice(0, 2);
    const acc = document.createElement('div');
    acc.className = 'module-accordion';
    acc.innerHTML = `
      <button class="module-header" aria-expanded="false">
        <span> Módulo ${m.module_number || ''}: ${m.title || ''}</span>
        <svg class="icon" viewBox="0 0 24 24" width="16" height="16"><polyline points="6,9 12,15 18,9"/></svg>
      </button>
      <ul class="video-sublist" hidden>
        ${two.map(v => `
          <li class="video-item" data-video-id="${v.id}">
            <span class="v-title">${v.video_title}</span>
            <span class="v-time">${this.formatSeconds(v.duration_seconds)}</span>
          </li>
        `).join('')}
      </ul>
    `;
    host.appendChild(acc);
  });

  // toggle acordeón
  host.querySelectorAll('.module-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const list = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      list.hidden = open;
    });
  });

  // click de video
  host.querySelectorAll('.video-item').forEach(li => {
    li.addEventListener('click', () => {
      const id = li.dataset.videoId;
      // buscar video en cache vidsByModule
      const found = Object.values(vidsByModule).flat().find(v => v.id === id);
      if (found) this.playDbVideo(found);
    });
  });
},

playDbVideo(v) {
  // 1) Player
  this.changeYouTubeVideo(v.youtube_video_id, v.video_title, this.formatSeconds(v.duration_seconds));
  // 2) Transcripción
  const transcript = document.querySelector('.transcript-content');
  if (transcript) transcript.textContent = v.transcript_text || 'Sin transcripción.';
},

formatSeconds(s = 0) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
},


Importante: Reusar la función existente changeYouTubeVideo(videoId, title, duration) para no duplicar lógica de UI del player. 

Eliminar del flujo cualquier uso de loadTestVideos() y la asignación de moduleNames en changeVideoByModule, porque ahora el menú y los títulos vienen de BD. 
 

Criterios de aceptación (QA)

Panel izquierdo muestra N módulos en acordeón, tomados de course_modules del curso activo. 

Cada módulo lista exactamente 2 videos (si existen) desde module_videos ordenados por video_order. 

Al hacer clic en un video:

Cambia el iframe#youtubePlayer al ID correcto,

Se actualiza el título y la duración visibles bajo el video,

La pestaña Transcripción muestra transcript_text. 
 

No quedan restos de contenido hardcodeado (nombres de módulos, playlist de prueba). 
 

Si un módulo no tiene 2 videos, no rompe la UI; muestra 0, 1 o 2 según disponibilidad.