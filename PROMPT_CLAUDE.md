Rol
Eres un(a) Frontend Engineer experto(a) en HTML/CSS/JS con foco en layouts tipo ecommerce (Udemy), carruseles accesibles, y cross‑browser rendering.

Contexto del proyecto
- Repo: Chat-Bot-LIA
- Página principal del catálogo: `src/cursos.html`
- Estilos: `src/styles/cursos.css`
- Lógica del catálogo: `src/scripts/cursos.js`
- El modo “Todos” genera secciones por categoría como carruseles. Clases actuales del carrusel: `.ud-row` (sección), `.ud-row-title` (título), `.ud-track` (cinta deslizante), `.ud-card` (tarjeta), `.ud-thumb` (imagen), `.ud-info` (contenido), `.ud-arrow.prev/.next` (flechas).

Problema a resolver (bugs visuales)
- Los cursos se ven desalineados verticalmente dentro del carrusel; algunas tarjetas quedan “más arriba/abajo” o cortadas.
- Las primeras/últimas tarjetas pueden verse pegadas a los bordes o truncadas.
- Flechas no siempre quedan centradas verticalmente o se superponen.
- Diferencias de altura por títulos largos, badges y variación de imágenes.

Objetivo
Hacer que cada fila de cursos funcione y se vea exactamente como en Udemy:
- Todas las tarjetas alineadas en la parte superior, con altura uniforme.
- Imágenes con la misma proporción y altura.
- Títulos clamp a 2 líneas, precio y rating alineados.
- Carrusel con scroll suave y flechas izquierda/derecha que habilitan/deshabilitan según posición.
- Sin barras de scroll visibles en desktop; navegación solo por flechas/drag horizontal.
- Mantener los títulos ocultos en categorías: `it`, `negocios`, `datos`, `ia`.

Requerimientos técnicos (qué editar)
1) CSS en `src/styles/cursos.css`
   - Asegurar un solo renglón sin wrapping:
     - `.ud-track { display:flex; flex-wrap:nowrap; align-items:stretch; gap:16px; overflow-x:auto; scroll-behavior:smooth; scroll-snap-type:x proximity; padding: 2px 48px; }`
     - Ocultar scrollbars cross-browser.
   - Tarjetas con tamaño consistente:
     - `.ud-card { box-sizing:border-box; min-width:260px; max-width:260px; height:100%; display:flex; flex-direction:column; scroll-snap-align:start; }`
     - `.ud-thumb { aspect-ratio:16/9; width:100%; object-fit:cover; }` (si no existe soporte, usar altura fija y fallback).
     - `.ud-info { display:flex; flex-direction:column; gap:6px; margin-top:8px; }`
     - `.ud-course-title { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; line-height:1.25; min-height: calc(1.25em * 2 + 4px); }`
     - Alinear precio y rating al fondo de la tarjeta con `margin-top:auto` si es necesario en el bloque inferior.
   - Flechas:
     - `.ud-row { position:relative; overflow:hidden; }`
     - `.ud-arrow { position:absolute; top:50%; transform:translateY(-50%); width:38px; height:38px; display:grid; place-items:center; border-radius:50%; backdrop-filter:blur(6px); box-shadow:0 6px 18px rgba(0,0,0,.35); }`
     - `.ud-arrow.prev { left:4px; } .ud-arrow.next { right:4px; }`
     - Estado `.disabled { opacity:.35; pointer-events:none; }`
   - Evitar que estilos antiguos (grid de `.courses-grid` o `.course-card`) afecten:
     - Asegurar que reglas de `.course-card` y grid no apliquen dentro de `.ud-row`. Si hay colisión, namespacear reglas o aumentar especificidad en `.ud-row .ud-card ...`.

2) JS en `src/scripts/cursos.js`
   - Mantener la generación por categorías pero garantizar que el contenedor por fila sea:
     ```
     <section class="ud-row">
       [título opcional]
       <button class="ud-arrow prev" ...>‹</button>
       <div class="ud-track" id="row-<cat>">[.ud-card …]</div>
       <button class="ud-arrow next" ...>›</button>
     </section>
     ```
   - Scroll por tramo: `const delta = Math.max(300, Math.floor(track.clientWidth * 0.9));`
   - Habilitar/deshabilitar flechas al cargar, al hacer scroll y en `resize`:
     ```
     const update = () => {
       const max = track.scrollWidth - track.clientWidth - 2;
       prev.classList.toggle('disabled', track.scrollLeft <= 2);
       next.classList.toggle('disabled', track.scrollLeft >= max);
     };
     ```
   - Asegurar títulos ocultos en `it`, `negocios`, `datos`, `ia` (no renderizar `<h3>` en esas filas).
   - Evitar alturas dinámicas por contenido:
     - Si existe `badge`, que no cambie la altura total (reservar espacio o usar `min-height`).

Criterios de aceptación (QA)
- En cada fila, el borde superior de todas las `.ud-card` queda perfectamente alineado; ningún card aparece “más arriba/abajo”.
- Las imágenes ocupan la misma altura; no se distorsionan.
- Títulos largos no empujan el resto del contenido: 2 líneas máximas.
- Precio, rating y badge se muestran sin romper la altura total; no mueven la tarjeta.
- Las flechas se ven centradas verticalmente y se desactivan al inicio/fin.
- No hay barras de scroll visibles en desktop; el drag horizontal sigue funcionando.
- Responsive:
  - ≥1280px: 5–6 cards visibles según ancho.
  - 1024–1279px: 4–5 cards.
  - 768–1023px: 3–4 cards.
  - ≤767px: 2–3 cards (flechas mantienen comportamiento).
- Ningún estilo heredado viejo (grid/`.course-card`) interfiere con `.ud-row`/`.ud-card`.

Entregables
- Edits en `src/styles/cursos.css` y `src/scripts/cursos.js` aplicando los ajustes.
- Explicación breve de qué colisiones de estilos se encontraron y cómo se aislaron.
- Sin cambiar otros layouts del sitio.

Notas
- Si `aspect-ratio` no es suficiente para mantener consistencia, usar una altura fija para `.ud-thumb` (p. ej., 150–170px) y `object-fit:cover`.
- Cualquier animación/transición debe ser sutil (<=200ms) y no afectar el layout.