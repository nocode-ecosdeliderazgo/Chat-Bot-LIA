# PROMPT PARA SOLUCIONAR ERRORES 404 DE APIs EN NETLIFY

## CONTEXTO DEL PROBLEMA
Tengo un proyecto web que funciona correctamente en localhost:3000, pero al desplegarlo en Netlify, las APIs no responden correctamente y aparecen errores 404. Los videos no se cargan porque las APIs que proporcionan los datos de los cursos fallan.

## ERRORES ESPECÍFICOS IDENTIFICADOS
```
GET https://ecosdeliderazgo.com/api/courses/ia-fundamentos/full-structure 404 (Not Found)
GET https://ecosdeliderazgo.com/api/courses/introduccion-ia/current-module/9562a449-4ade-4d4b-a3e4-b66dddb7e6f0 404 (Not Found)
modules-expandable-system.js:52 
 GET https://ecosdeliderazgo.com/api/courses/ia-fundamentos/full-structure 404 (Not Found)
modules-expandable-system.js:64 ⚠️ API no disponible, usando datos locales...
modules-expandable-system.js:188 📚 Módulos cargados desde datos locales: 
(5) [{…}, {…}, {…}, {…}, {…}]
modules-expandable-system.js:194 ❌ Contenedor de módulos no encontrado
modules-expandable-system.js:431 ✅ Event listeners configurados
modules-expandable-system.js:37 ✅ Sistema de módulos expandibles inicializado correctamente
quick-video-fix.js:16 
 GET https://ecosdeliderazgo.com/api/courses/introduccion-ia/current-module/9562a449-4ade-4d4b-a3e4-b66dddb7e6f0 404 (Not Found)
quick-video-fix.js:46 ❌ Error cargando video: Error: HTTP 404: 
    at HTMLDocument.loadFirstVideo (quick-video-fix.js:19:19)
loadFirstVideo	@	quick-video-fix.js:46
```

## ANÁLISIS INICIAL REQUERIDO
Antes de realizar cambios, necesito que identifiques:

1. **Archivos principales que manejan las APIs:**
   - `src/scripts/modules-expandable-system.js` - Sistema de módulos (línea 52, 64, 188, 194)
   - `src/scripts/quick-video-fix.js` - Carga rápida de videos (línea 16, 46)
   - `netlify/functions/course-data.js` - Función de Netlify para datos de cursos
   - `netlify.toml` - Configuración de redirects de APIs

2. **Configuración actual de Netlify:**
   - `netlify.toml` - Redirects de APIs de cursos
   - `netlify/functions/` - Funciones serverless
   - Variables de entorno y configuración de build

3. **Rutas de API que fallan:**
   - `/api/courses/ia-fundamentos/full-structure`
   - `/api/courses/introduccion-ia/current-module/{id}`
   - Posiblemente otras rutas de `/api/courses/*`

## DIAGNÓSTICO PASO A PASO

### PASO 1: IDENTIFICAR LA CAUSA RAÍZ
Analiza estos posibles problemas:

1. **Redirects de Netlify:**
   - Verificar si los redirects en `netlify.toml` coinciden con las rutas de API
   - Comprobar si las funciones serverless están correctamente configuradas
   - Revisar si hay conflictos entre redirects específicos y wildcards

2. **Funciones Serverless:**
   - Verificar que `netlify/functions/course-data.js` existe y funciona
   - Comprobar que las funciones manejan correctamente los parámetros de ruta
   - Revisar logs de Netlify para errores en las funciones

3. **Configuración de Build:**
   - Verificar que las funciones se compilan correctamente
   - Comprobar variables de entorno en Netlify
   - Revisar configuración de Node.js y dependencias

### PASO 2: IMPLEMENTAR SOLUCIONES

#### 2.1 Verificar y Corregir Redirects de API
```toml
# En netlify.toml, verificar que estos redirects existan y sean correctos:
[[redirects]]
  from = "/api/courses/*/full-structure"
  to = "/.netlify/functions/course-data"
  status = 200

[[redirects]]
  from = "/api/courses/*/current-module/*"
  to = "/.netlify/functions/course-data"
  status = 200
```

#### 2.2 Verificar Función course-data.js
- Asegurar que la función maneja correctamente los parámetros de ruta
- Verificar que responde a las rutas específicas que fallan
- Comprobar que retorna datos en el formato esperado

#### 2.3 Implementar Fallbacks en JavaScript
- Mejorar el manejo de errores en `modules-expandable-system.js`
- Implementar retry logic para APIs que fallan
- Asegurar que los datos locales se usen correctamente cuando las APIs fallan

### PASO 3: IMPLEMENTAR DETECCIÓN DE ERRORES
Agregar logging y manejo de errores para:
- Detectar cuando las APIs fallan (404, 500, etc.)
- Mostrar mensajes de error informativos al usuario
- Implementar retry logic para APIs problemáticas
- Asegurar que los fallbacks a datos locales funcionen correctamente

### PASO 4: OPTIMIZACIONES ADICIONALES
1. **Caching:** Implementar cache para respuestas de API
2. **Error Boundaries:** Implementar manejo de errores en componentes de curso
3. **Loading States:** Mejorar estados de carga mientras se obtienen datos

## ARCHIVOS A MODIFICAR (EN ORDEN DE PRIORIDAD)

1. **netlify.toml** - Verificar y corregir redirects de API
2. **netlify/functions/course-data.js** - Verificar función serverless
3. **src/scripts/modules-expandable-system.js** - Mejorar manejo de errores de API
4. **src/scripts/quick-video-fix.js** - Mejorar manejo de errores de carga
5. **Variables de entorno** - Verificar configuración en Netlify

## CRITERIOS DE ÉXITO
- APIs de cursos responden correctamente (no más errores 404)
- Videos de YouTube se cargan correctamente en Netlify
- No aparecen errores 404 en consola del navegador
- Funcionalidad de progreso de videos funciona
- Fallbacks a datos locales funcionan cuando las APIs fallan
- Sistema de módulos expandibles funciona correctamente

## INSTRUCCIONES ESPECÍFICAS
1. **NO modifiques múltiples archivos simultáneamente**
2. **Implementa cambios paso a paso y prueba cada uno**
3. **Mantén compatibilidad con localhost:3000**
4. **Documenta cada cambio realizado**
5. **Usa el color primario #0066CC para elementos de UI**

## COMANDOS DE PRUEBA
Después de cada cambio:
```bash
# Probar localmente
npm start

# Verificar en Netlify
netlify deploy --prod
```

## REFERENCIAS TÉCNICAS
- Netlify Functions: https://docs.netlify.com/functions/overview/
- Netlify Redirects: https://docs.netlify.com/routing/redirects/
- Netlify Environment Variables: https://docs.netlify.com/environment-variables/overview/
- Serverless Functions Debugging: https://docs.netlify.com/functions/troubleshooting/

---

**IMPORTANTE:** Trabaja paso a paso, identifica primero la causa exacta del problema antes de implementar soluciones. Prioriza la eficiencia y mantén la funcionalidad existente.
