Eres un ingeniero front‑end senior. Aplica los siguientes cambios en el proyecto para rediseñar la UI tipo NotebookLM, limpiar secciones y añadir exportación a PDF de notas. Haz ediciones mínimas, limpias y accesibles, sin romper estilos ni eventos. Mantén los textos en español y pasa pruebas/build.

Objetivos
- Quitar completamente “Videos” y “Glosario” del panel izquierdo y su lógica asociada.
- Eliminar cualquier render por defecto de “Módulo 1: Introducción a IA”. Solo deben quedar los botones “Notas” y “Módulo 1–4”.
- Rediseñar el panel Studio para que:
  - Tenga secciones colapsables estilo NotebookLM.
  - El bloque de “Módulos” sea colapsable como los del panel izquierdo.
  - Al presionar “Módulo 1”, se muestre exclusivamente el video “Actividad colaborativa” (un único video). No mostrar ningún otro video.
  - El contenido del módulo se muestre “bonito” (cards, headers, spacing) y también sea colapsable.
  - Las “Notas” estén colapsadas por defecto y, al abrir, muestren una vista de edición tipo la captura (editor grande con barra superior). Añadir botón “Exportar a PDF”.

Cambios precisos por archivo

1) `src/chat.html`
- Dentro de `<nav class="tool-list">` elimina por completo:
  - `<div class="tool-group collapsible" id="videosSection">…</div>`
  - `<div class="tool-group collapsible" id="glossarySection">…</div>`
  - El contenedor del reproductor de video de la izquierda: `<div class="tool-group"><div id="leftVideoPlayerContainer" …></div></div>`
- No dejes contenedores vacíos.

2) `src/scripts/main.js`
- Inicio: elimina la llamada a `setupVideoPicker()`.
- Elimina la implementación completa de `setupVideoPicker()` y toda la lógica de video/glosario conectada a la izquierda, incluyendo:
  - Listeners/DOM de `#videosSection`, `#videosToggle`, `.video-select`.
  - Listeners/DOM de `#glossarySection`, `#glossaryToggle`.
  - Wiring de `#videoSummaryTile` y `EventBus.on('ui:openVideo', …)` y la función `UI.openVideoSummary()`.

- Rediseño de Studio (en `showModulesStudioPanel()`):
  - Mantén la grid de botones pero envuélvela en un bloque colapsable con esta estructura accesible (reutiliza las clases existentes del panel izquierdo):
    - Contenedor: `<div class="collapsible studio-collapsible" id="modulesSection">`
      - Header: `<div class="collapsible-header"><h4>Módulos</h4><button class="collapsible-toggle" id="modulesToggle" aria-expanded="false" aria-controls="modulesGrid"><i class='bx bx-chevron-down'></i></button></div>`
      - Contenido: `<div class="collapsible-content" id="modulesGrid">[grid de botones]</div>`
  - La grid debe tener SOLO:
    - Botón `data-action="open-notes"` con label “Notas”.
    - Botones `data-module="1"`, `data-module="2"`, `data-module="3"`, `data-module="4"`.
  - Quita render por defecto de “Módulo 1: Introducción a IA”. En `#moduleView` deja un placeholder: “Selecciona un módulo para ver el contenido”.
  - Añade el toggle del colapsable: al hacer click en `#modulesToggle` alterna `.open` en `#modulesSection` y actualiza `aria-expanded`.

- Render de Módulo 1 (solo “Actividad colaborativa”):
  - En el handler de `card.querySelectorAll('.studio-btn[data-module]')…` cuando `moduleId==='1'`, renderiza en `#moduleView` un ÚNICO card colapsable con título “Actividad colaborativa” que, al expandirse, muestra un iframe de YouTube con el video de la actividad.
  - Proporciona una constante `const ACTIVIDAD_COLABORATIVA_VIDEO_ID = '<REEMPLAZA_CON_ID>'` y embebe con `https://www.youtube.com/embed/${ACTIVIDAD_COLABORATIVA_VIDEO_ID}`. No muestres más videos ni controles de “resumen de video”.
  - Los módulos 2–4 pueden seguir mostrando su contenido actual cuando se pulse (sin cambios de datos), pero deben reusarse como cards colapsables.

- Notas colapsables + editor tipo captura:
  - Cambia `window.UI.openNotes()` para que al pulsar el botón “Notas” se inserte una card colapsable “Notas” con resumen (p. ej., primeras líneas) y acciones: “Abrir editor” y “Exportar a PDF”.
  - Implementa `openNotesEditor()` para mostrar un overlay/panel a pantalla completa (reutiliza el patrón de `showPromptOverlay` o `showGlossary`):
    - Header con migas “Studio > Nota”, título editable, acciones Guardar, Exportar a PDF y Cerrar.
    - Área de edición grande (contenteditable o `<textarea>` mejorado) similar a la captura compartida.
  - El botón “Exportar a PDF” llama a `exportNotesToPDF()`.

- Exportar notas a PDF (cliente):
  - Añade soporte con `html2pdf.js` (recomendado por simplicidad) o `jspdf` + `html2canvas`.
  - Implementación sugerida con `html2pdf.js` (lazy import para no cargar de más):
    ```js
    async function exportNotesToPDF(element) {
      const [{ default: html2pdf }] = await Promise.all([
        import(/* webpackChunkName: "html2pdf" */ 'html2pdf.js')
      ]);
      const opt = { margin: 10, filename: 'notas.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
      html2pdf().set(opt).from(element).save();
    }
    ```
  - Pásale el contenedor del contenido de la nota (no toda la página) para generar un PDF limpio.

3) `src/styles/main.css`
- Elimina reglas ya no usadas del glosario y del reproductor de video izquierdo: `.glossary-left`, `.glossary-overlay`, `.glossary-panel`, `#leftVideoPlayerContainer`, etc.
- Añade estilos mínimos para el look NotebookLM:
  - `.studio-collapsible` ajusta paddings/bordes como en los colapsables de la izquierda.
  - Cards del módulo con borde sutil, radio 12px, sombras ligeras, `gap` generoso y tipografías consistentes.
  - Vista del editor de notas a pantalla completa: header sticky, toolbar simple y área de edición amplia.

4) `package.json`
- Añade dependencia: `"html2pdf.js": "^0.10.1"` (o versión estable más reciente). Si prefieres `jspdf` + `html2canvas`, incluye ambas.

Validaciones
- Panel izquierdo: no existen ya “Videos” ni “Glosario”.
- Tarjeta “Studio”: contiene un bloque colapsable “Módulos” con botones “Notas” y “Módulo 1–4”.
- Al cargar Studio, `#moduleView` muestra “Selecciona un módulo…”.
- Al pulsar “Módulo 1”: aparece un card colapsable “Actividad colaborativa” con un solo iframe de YouTube. No hay otros videos ni resúmenes de video.
- Botón “Notas”: aparece card colapsable. Al abrir editor, se ve vista tipo captura con botón “Exportar a PDF” que descarga correctamente el PDF de la nota.
- Sin errores en consola; build y tests en verde.

Notas de implementación
- Reutiliza clases `.collapsible`, `.collapsible-header`, `.collapsible-toggle`, `.collapsible-content` para mantener consistencia y funcionalidad con mínima lógica adicional. Usa `aria-expanded` y `aria-controls`.
- No cambies datos del curso; solo la presentación y wiring.
- Mantén CSP: ya está permitido YouTube en `server.js (frameSrc)`. El iframe solo se usa dentro del módulo 1.

Entrega
- Sube los cambios con mensajes claros: "feat(ui): eliminar videos/glosario y rediseñar Studio colapsable tipo NotebookLM", "feat(notes): overlay editor + exportar a PDF", etc.

