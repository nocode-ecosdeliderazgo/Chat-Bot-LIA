## Plan de diagnóstico y corrección — APR-264 (CHAT-ONLINE faltantes)

Este documento resume por qué fallan los items bajo APR-264 y cómo corregirlos en `@Chat-Online/`, sin aplicar todavía los cambios.

### Alcance
- **APR-265**: Botón de avanzar/retroceder video no responde después de completar video
- **APR-266**: En la barra de scroll izquierda, el último video se ve cortado
- **APR-267**: Quitar botón legacy de “copiar actividad” (ya sustituido por copia por prompt)
- **APR-268**: Filtros de la comunidad no operan de forma consistente

---

## APR-265 — Bug: Botón de avanzar video

### Por qué falla
- Posible pérdida de listeners tras marcar “completar video”: acciones de finalización recrean/ocultan nodos del DOM y los botones quedan sin handlers.
- Conflicto en `src/Chat-Online/components/video-player.js`: existe doble definición/llamado de `markAsCompleted`, lo que puede dejar estados inconsistentes después del final del video.
- Superposición visual: overlays/transform en `.nav-btn` podrían tapar los botones (z-index o `pointer-events`) post-estado “completado”.
- Integración con loaders: al cambiar de video/módulo, la navegación prev/next no se re-enlaza si depende de `dynamicVideoLoader`/`Module1VideosLoader`.

### Cómo arreglarlo
- Unificar la ruta de finalización del video: consolidar `markAsCompleted` en una sola implementación idempotente y sin efectos secundarios duplicados.
- Centralizar el wiring de botones prev/next en una función única que se ejecute en:
  - Inicialización del reproductor
  - Evento de finalización del video
  - Cualquier re-render del contenedor del player
- Verificar estilos de superposición: asegurar `z-index`/`pointer-events` correctos para `.nav-btn` y el overlay de controles.
- Recalcular fuente de verdad del índice actual usando la lista de videos del módulo y rebind tras completar.

### Pruebas de aceptación
- Tras completar un video, los botones prev/next funcionan sin recargar la página.
- No hay errores en consola.
- Botones permanecen clicables en desktop y mobile.

---

## APR-266 — Barra de scroll izquierda: último video cortado

### Por qué falla
- El contenedor scrollable lateral (`.modules-list` / `.module-videos-list`) carece de `padding-bottom`/`scroll-padding-bottom` y tiene altura exacta, recortando el último ítem.
- Posible colapso de márgenes o pseudo-elementos que interfieren con el área visible inferior.

### Cómo arreglarlo
- Añadir `padding-bottom` suficiente o `scroll-padding-bottom` al contenedor con `overflow-y: auto`.
- Garantizar `margin-bottom` del último `.video-item` y que no sea sobrescrito.
- Evitar `height` fijo que recorte; preferir `max-height` con overflow donde aplique.

### Pruebas de aceptación
- El último video se visualiza completamente en todos los breakpoints (>=1200px, 992px, 768px, 480px).

---

## APR-267 — Quitar botón de “copiar actividad” (legacy)

### Por qué falla
- Coexistencia del botón global antiguo con los nuevos botones de copia por prompt genera redundancia/confusión.
- Persisten listeners/estilos del botón legacy.

### Cómo arreglarlo
- Eliminar el HTML del botón global en `src/Chat-Online/chat-online.html`.
- Retirar listeners asociados en JS (`chat-online.js`/`module1-videos-loader.js`).
- Mantener exclusivamente los botones de copia por prompt ya implementados.
- Limpiar estilos específicos de ese botón si no son reutilizados.

### Pruebas de aceptación
- Solo se muestran botones de copia por prompt.
- Copia individual funciona y no quedan referencias al botón global.

---

## APR-268 — Filtros de la comunidad

### Por qué falla
- Desalineación entre parámetros frontend y API: la doc requiere `filter`, `sort`, `search`, `module_id`, `course_id`, paginación, etc., pero el cliente no siempre los construye o los mezcla.
- Multiplicidad de puntos de entrada: llamadas directas conviven con `CommunityAPI`, causando respuestas no normalizadas.
- Estado de UI: tabs/selects no re-aplican parámetros correctos ni muestran estado activo consistente; `search` sin debounce.

### Cómo arreglarlo
- Estandarizar todas las cargas a través de `src/Chat-Online/api/community-api.js` para normalizar respuestas (usar `mapResponse`).
- Construir un objeto `params` coherente en cada interacción de filtros/tabs:
  - `filter` ∈ {`all`,`unanswered`,`answered`,`mine`}
  - `sort` ∈ {`recent`,`votes`,`answers`,`views`}
  - `search`, `module_id`, `course_id`, `page`, `limit`
- Añadir debounce (300–500ms) a `search`.
- Actualizar estados activos de UI y persistir los últimos parámetros para reintentos.
- Manejo de errores/vacíos con patrones de `community-endpoints.md` (loading/empty/error consistentes).

### Pruebas de aceptación
- Cada filtro/tab aplica y re-renderiza la lista acorde al backend.
- Paginación y sort funcionan combinados con filtros.
- Respuestas mapeadas y mostradas sin errores en consola.

---

## Coordinación del padre — APR-264

### Orden recomendado
1. APR-265 (navegación del video)
2. APR-266 (scroll lateral)
3. APR-267 (limpieza de UI de actividad)
4. APR-268 (filtros de comunidad)

### Hooks/Eventos a asegurar
- Re-inicializar wiring tras: `video-ended`, `moduleChanged`, `courseStructureLoaded`.

### Contratos entre módulos
- Documentar quién emite/escucha eventos y qué wiring requiere:
  - `ChatOnlineV2` ↔ `VideoPlayer` ↔ `dynamicVideoLoader` ↔ `CommunityAPI`.

### Checklist de regresión
- Prev/next operativos después de completar video.
- Sidebar no corta últimos ítems.
- UI sin botón legacy de “copiar actividad”.
- Filtros alineados con API y estados visibles consistentes.


