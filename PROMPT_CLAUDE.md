# Prompt para Claude: Eliminación de Noticias Hardcodeadas

## Objetivo
Analizar la página de noticias (`src/Notices/notices.css`, `src/Notices/notices.html`, `src/Notices/notices.js`) para identificar y eliminar TODAS las noticias hardcodeadas, manteniendo intactos los estilos de las ventanas/tarjetas y el funcionamiento de la página.

## Análisis de Archivos

### 1. Archivo `notices.js` - Noticias Hardcodeadas Identificadas

#### A. Función `getMockNewsData()` (líneas 323-561)
**CONTENIDO A ELIMINAR COMPLETAMENTE:**
- Array completo de 10 noticias hardcodeadas con IDs del 1 al 10
- Cada noticia incluye: id, title, excerpt, category, categoryLabel, date, author, views, comments, featured, image, hasDetailedView, detailedData
- Las noticias tienen datos detallados con: tldr, suggestedSteps, risks, whyMatters, whatChanged, impact, resources, cta

#### B. Función `loadNewsData()` (líneas 311-321)
**MODIFICAR:**
- Eliminar la llamada a `this.getMockNewsData()`
- Cambiar para cargar desde BD (placeholder para implementación futura)
- Mantener la estructura de loading y rendering

#### C. Datos de muestra `sampleNews` (líneas 1396-1423)
**CONTENIDO A ELIMINAR COMPLETAMENTE:**
- Objeto con noticia de muestra hardcodeada
- Incluye datos detallados de ejemplo

### 2. Archivo `notices.html` - Contenido Hardcodeado Identificado

#### A. Modal de noticias (líneas 270-367)
**CONTENIDO A ELIMINAR:**
- Título hardcodeado: "Online RL para Cursor Tab: 28% más aceptación con 21% menos sugerencias"
- Sección TL;DR hardcodeada con datos específicos
- Contenido detallado del modal con datos específicos de Cursor
- Pasos sugeridos, riesgos, recursos, etc. hardcodeados

#### B. Estadísticas hardcodeadas (líneas 114-125)
**MANTENER ESTRUCTURA, ELIMINAR VALORES:**
- `totalNews`: cambiar de "0" a valor dinámico
- `totalCategories`: cambiar de "5" a valor dinámico  
- `totalViews`: cambiar de "0" a valor dinámico

### 3. Archivo `notices.css` - Mantener Intacto
**NO MODIFICAR:** Todos los estilos están correctos y deben mantenerse para el funcionamiento futuro.

## Instrucciones Específicas de Eliminación

### Paso 1: Limpiar `notices.js`

1. **Eliminar función `getMockNewsData()` completa** (líneas 323-561)
2. **Modificar función `loadNewsData()`** para:
   ```javascript
   loadNewsData() {
       this.showLoading();
       
       // TODO: Implementar carga desde BD
       // Por ahora, inicializar con arrays vacíos
       this.allNews = [];
       this.filteredNews = [];
       this.renderNews();
       this.hideLoading();
   }
   ```

3. **Eliminar objeto `sampleNews`** (líneas 1396-1423)
4. **Mantener todas las funciones de rendering** (`renderNews()`, `renderFeaturedNews()`, `renderLatestNews()`) - deben funcionar con arrays vacíos
5. **Mantener funciones de filtrado y búsqueda** - deben funcionar con arrays vacíos
6. **Mantener funciones del modal** - deben funcionar sin datos

### Paso 2: Limpiar `notices.html`

1. **Eliminar contenido hardcodeado del modal** (líneas 288-364):
   - Mantener la estructura HTML del modal
   - Eliminar el título específico
   - Eliminar el contenido TL;DR específico
   - Eliminar el contenido detallado específico
   - Dejar placeholders vacíos o con texto genérico

2. **Actualizar estadísticas** para mostrar valores dinámicos:
   ```html
   <span class="stat-number" id="totalNews">0</span>
   <span class="stat-number" id="totalCategories">0</span>
   <span class="stat-number" id="totalViews">0</span>
   ```

### Paso 3: Verificar Funcionalidad

1. **Asegurar que la página cargue sin errores** con arrays vacíos
2. **Verificar que los filtros funcionen** (aunque no haya noticias)
3. **Verificar que el modal se abra** (aunque esté vacío)
4. **Verificar que las categorías se muestren** con contadores en 0
5. **Verificar que la búsqueda funcione** (aunque no devuelva resultados)

## Resultado Esperado

- Página de noticias completamente funcional pero sin contenido hardcodeado
- Estilos y funcionalidad intactos
- Arrays de noticias vacíos listos para cargar desde BD
- Modal funcional pero sin contenido específico
- Estadísticas mostrando valores en 0
- Categorías mostrando "0 noticias" cada una

## Notas Importantes

- **NO eliminar** ninguna función de JavaScript que no sea específicamente de datos hardcodeados
- **NO modificar** el archivo CSS
- **Mantener** toda la lógica de UI, filtros, búsqueda, modales, etc.
- **Preservar** la estructura HTML del modal y las tarjetas
- **Asegurar** que la página sea completamente funcional sin contenido

## Archivos a Modificar

1. `src/Notices/notices.js` - Eliminar datos hardcodeados, mantener funcionalidad
2. `src/Notices/notices.html` - Limpiar contenido específico del modal y estadísticas

## Archivos a NO Modificar

1. `src/Notices/notices.css` - Mantener intacto
