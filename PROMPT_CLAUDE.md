Quiero que hagas una migración no disruptiva del componente de “Actividades del Video” en el módulo Chat Online para dejar de depender de las columnas de texto plano descripcion_actividad y prompts_actividad de module_videos, y pasar a consumir la nueva tabla normalizada public.actividad_detalle. Debes mantener retrocompatibilidad: si una actividad aún no tiene filas en actividad_detalle, sigue usando las columnas antiguas.

Contexto del repo y comportamiento actual (IMPORTANTE)

El elemento se renderiza en src/Chat-Online/chat-online.html con dos contenedores:

.activity-description (Descripción)

.activity-prompts (Prompts)

La clase que carga y pinta el contenido está en src/Chat-Online/module1-videos-loader.js.
Su método clave es updateActivityContent(video), que hoy:

toma video.video_title para el título,

“trocea” video.descripcion_actividad por saltos de línea y lo envuelve en <p>…</p>,

“trocea” video.prompts_actividad y, si detecta ^\d+\. o bullets, envuelve cada ítem en .activity-prompt-item.

Existe copyActivityToClipboard() en chat-online.html que arma un texto consolidado con descripción y prompts (hoy lee del DOM).
Referencia exacta de esta arquitectura y flujos: “Estructura del Elemento de Actividad - Chat Online”【

Actividad_chat_online

】.

Nuevo origen de datos

Ya existe la tabla public.actividad_detalle con este contrato (léelo, no lo crees de nuevo):

id uuid PK,
actividad_id uuid (FK -> module_videos.id),
seccion text check in ('descripcion','prompts'),
orden integer,
tipo enum('titulo','parrafo','lista','prompt','nota'),
contenido text


Habrá múltiples filas por actividad. La sección “descripcion” tendrá títulos y párrafos/listas; la sección “prompts” tendrá títulos, párrafos/listas y elementos tipo='prompt'.

Cambios que debes implementar
1) Backend / Loader de datos

Revisa el endpoint que hoy alimenta el front: /api/courses/module1-videos.
Objetivo: no romperlo. Mantén el objeto video como hoy, pero añade un campo opcional actividad_detalle con esta forma:

interface ActividadDetalleItem {
  id: string
  seccion: 'descripcion' | 'prompts'
  orden: number
  tipo: 'titulo' | 'parrafo' | 'lista' | 'prompt' | 'nota'
  contenido: string
}
interface Video {
  id: string
  video_title: string
  // legacy:
  descripcion_actividad?: string | null
  prompts_actividad?: string | null
  // nuevo:
  actividad_detalle?: ActividadDetalleItem[] // agrupados por actividad_id
}


Si usas Supabase JS, agrega una consulta adicional (por lote o al seleccionar un video) para traer:

select id, seccion, orden, tipo, contenido
from public.actividad_detalle
where actividad_id = :videoId
order by seccion, orden;


Estrategia de compatibilidad:

Si actividad_detalle trae ≥1 fila, ignoramos las cadenas legacy en el render.

Si viene vacío, usamos descripcion_actividad y prompts_actividad como hoy.

2) Render en updateActivityContent(video) (frontend)

Crea dos helpers nuevos en module1-videos-loader.js:

buildDescriptionHTMLFromDetalle(items /* actividad_detalle filtrado a seccion='descripcion' */)
buildPromptsHTMLFromDetalle(items /* actividad_detalle filtrado a seccion='prompts' */)


Reglas de render:

tipo='titulo' → <p><strong>${contenido}</strong></p>

tipo='parrafo' → <p>${contenido}</p>

tipo='lista' → <div class="activity-list-item">• ${contenido}</div>

tipo='nota' → <p class="activity-note">${contenido}</p>

tipo='prompt' → bloque con botón copiar por ítem:

<div class="activity-prompt-item" data-prompt-id="{id}">
  <span class="prompt-text">{contenido}</span>
  <button class="btn-copy" data-copy="{contenido}">Copiar</button>
</div>


Mantén replaceEmojisWithIcons(text) para los textos que vengan del modelo legacy (solo cuando no haya actividad_detalle).
Cuando uses actividad_detalle, no apliques esa sustitución a contenido (se asume limpio).

Actualiza updateActivityContent(video) así:

Si video.actividad_detalle?.length:

const desc = items.filter(i => i.seccion==='descripcion')

const prom = items.filter(i => i.seccion==='prompts')

activityDescription.innerHTML = buildDescriptionHTMLFromDetalle(desc)

activityPrompts.innerHTML = buildPromptsHTMLFromDetalle(prom)

Else (legacy): conserva el flujo actual (split por \n), pero pon en negritas los encabezados reconocibles (Contexto, Pautas de la actividad, Objetivo(s), Paso X) antes de envolver en <p>…</p>.

3) Comportamiento del botón “Copiar”

Implementa delegación de eventos en chat-online.html o en el loader para que cualquier botón con [data-copy] copie su payload:

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-copy]');
  if (!btn) return;
  const text = btn.getAttribute('data-copy') || '';
  navigator.clipboard.writeText(text);
  // opcional: notificación “Copiado”
});


Conserva copyActivityToClipboard() para el botón general “Copiar Actividad”.
Cuando actividad_detalle esté presente, construye el texto recorriendo los arrays (no dependas del innerText del DOM) para preservar separadores:

=== ACTIVIDAD: {video_title} ===
📋 DESCRIPCIÓN:
[Titulos en mayúsculas/strong + párrafos/listas, en orden]
💭 PROMPTS Y EJERCICIOS:
[cada prompt en su línea]
---
Generado desde Coach LIA IA - {fecha}


Si no hay actividad_detalle, usa el comportamiento legacy que ya existe.

4) Estilos mínimos

Añade estilos básicos si no existen:

.btn-copy { margin-left: .5rem; }
.activity-list-item { margin-left: .75rem; }
.activity-note { opacity: .85; font-style: italic; }


Mantén el tema dual y el “glass effect” del módulo (no cambies clases globales).
Referencia de clases existentes: .activity-content, .activity-section, .activity-prompts-content, .activity-prompt-item, etc.【

Actividad_chat_online

】

Qué archivos tocar

src/Chat-Online/module1-videos-loader.js

Añadir fetch/inyectar actividad_detalle (si el endpoint ya lo entrega, solo úsalo).

Implementar buildDescriptionHTMLFromDetalle y buildPromptsHTMLFromDetalle.

Actualizar updateActivityContent(video) con la lógica dual (detalle vs legacy).

src/Chat-Online/chat-online.html

Añadir el listener de delegación para [data-copy] (o colócalo en el loader si ya centralizas ahí).

Mantener copyActivityToClipboard() pero adaptarlo para usar arrays cuando actividad_detalle exista.

Si el endpoint /api/courses/module1-videos está en el repo, actualízalo para incluir actividad_detalle (LEFT JOIN o segunda consulta por actividad_id).

Criterios de aceptación

 Para un video que sí tiene filas en actividad_detalle, la UI:

Muestra títulos en negritas (por venir como tipo='titulo').

Renderiza bullets de tipo='lista'.

Renderiza cada tipo='prompt' con un botón Copiar independiente.

El botón Copiar Actividad compone correctamente descripción + prompts con saltos adecuados.

 Para un video sin filas en actividad_detalle, se usa el modo legacy exactamente como hoy, con negritas aplicadas por regex a Contexto, Pautas de la actividad, Objetivo(s) y Paso X.

 No se rompe el endpoint ni la forma del objeto video consumido por otras vistas.

 Modo oscuro/Claro sin regresiones.

Pruebas manuales

Caso detalle: usa un video.id que ya tenga entradas en actividad_detalle.

Verifica títulos en bold y botones “Copiar” por prompt.

Haz clic en cada botón y pega en un editor para confirmar el contenido.

Usa “Copiar Actividad” y confirma el bloque completo.

Caso legacy: un video.id sin detalle.

Verifica que los encabezados “Contexto” y “Pautas de la actividad” salen en bold.

Verifica que los prompts se renderizan como hasta ahora.

Resiliencia: texto con líneas vacías, bullets *, -, • y numerados 1..

Notas de implementación

Evita XSS: al interpolar contenido, usa textContent cuando insertes nodos, o sanear si construyes HTML. Para tipo='titulo' en <strong>, crea elementos vía DOM:

const p = document.createElement('p');
const b = document.createElement('strong');
b.textContent = item.contenido;
p.appendChild(b);


Mantén funciones existentes como replaceEmojisWithIcons() solo para el flujo legacy, según la doc base【

Actividad_chat_online

】.

Entrega cambios con mensajes de commit claros:
feat(activity): render from actividad_detalle with per-prompt copy and legacy fallback

Si necesitas datos de ejemplo, dímelo y te paso un SELECT de muestra para un actividad_id con ambas secciones.