# PROMPT PARA SOLUCIONAR CONFLICTOS DE CARGA DE VIDEOS EN NETLIFY

## CONTEXTO DEL PROBLEMA
El proyecto funciona parcialmente en Netlify. Los videos SÍ se cargan correctamente desde la base de datos (como se ve en el log), pero hay **conflictos entre múltiples sistemas** que intentan cargar el mismo video simultáneamente, causando errores 404 y fallos en la visualización.

## ANÁLISIS DEL LOG COMPLETO

### ✅ LO QUE FUNCIONA CORRECTAMENTE:
1. **Module1 Videos Loader** - Carga exitosamente 11 videos desde la API
2. **Base de datos** - Responde correctamente con datos completos
3. **Video renderizado** - El primer video se carga y muestra correctamente
4. **YouTube embed** - El iframe se crea con la URL correcta

### ❌ PROBLEMAS IDENTIFICADOS:

#### 1. **CONFLICTO DE SISTEMAS MÚLTIPLES:**
```
- quick-video-fix.js (líneas 14, 30, 40, 46, 78, 84, 160)
- modules-expandable-system.js (líneas 52, 64, 68, 70, 91, 97, 188, 194, 264, 270)
- module1-videos-loader.js (funciona correctamente)
```

#### 2. **APIs QUE FALLAN:**
```
GET /api/courses/ia-fundamentos/full-structure → 404
GET /api/courses/introduccion-ia/current-module/{id} → 404
GET /api/community/questions?sort=recent → 500
```

#### 3. **ERRORES DE JAVASCRIPT:**
```
- SyntaxError: Unexpected identifier 'getFirstVideoIdFromDatabase' (chat-online.js:7896)
- SyntaxError: await is only valid in async functions (chat-online:3894)
- CSP violations para Supabase
```

#### 4. **BLOQUEOS DE YOUTUBE:**
```
- net::ERR_BLOCKED_BY_CLIENT (múltiples requests a YouTube)
- POST requests a youtubei/v1/log_event bloqueados
```

## DIAGNÓSTICO PASO A PASO

### PASO 1: IDENTIFICAR CONFLICTOS DE CARGA
**Problema principal:** Múltiples scripts intentan cargar el mismo video:
- `quick-video-fix.js` intenta cargar desde API que falla
- `module1-videos-loader.js` carga exitosamente desde base de datos
- `modules-expandable-system.js` intenta cargar estructura de curso

### PASO 2: SOLUCIONAR CONFLICTOS
1. **Desactivar sistemas conflictivos** que usan APIs que fallan
2. **Priorizar el sistema que funciona** (module1-videos-loader.js)
3. **Corregir errores de sintaxis** en JavaScript
4. **Configurar CSP** para permitir Supabase

### PASO 3: IMPLEMENTAR SOLUCIONES

#### 3.1 Desactivar quick-video-fix.js
```javascript
// Comentar o desactivar la carga automática
// document.addEventListener('DOMContentLoaded', loadFirstVideo);
```

#### 3.2 Corregir errores de sintaxis en chat-online.js
- Línea 7896: Corregir función `getFirstVideoIdFromDatabase`
- Línea 3894: Hacer función async o mover await

#### 3.3 Configurar CSP para Supabase
```toml
# En netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://www.gstatic.com https://apis.google.com https://esm.sh https://cdn.jsdelivr.net;"
```

#### 3.4 Mejorar manejo de errores en modules-expandable-system.js
- Implementar fallback más robusto cuando API falla
- Evitar conflictos con module1-videos-loader.js

## ARCHIVOS A MODIFICAR (EN ORDEN DE PRIORIDAD)

### PRIORIDAD ALTA (Crítico):
1. **src/scripts/quick-video-fix.js** - Desactivar o corregir
2. **src/Chat-Online/chat-online.js** - Corregir errores de sintaxis
3. **netlify.toml** - Configurar CSP para Supabase

### PRIORIDAD MEDIA:
4. **src/scripts/modules-expandable-system.js** - Mejorar fallbacks
5. **src/scripts/supabase-client.js** - Verificar configuración

### PRIORIDAD BAJA:
6. **Variables de entorno** - Verificar configuración en Netlify

## SOLUCIONES ESPECÍFICAS

### 1. Desactivar quick-video-fix.js
```javascript
// Al inicio del archivo, agregar:
console.log('🚫 Quick Video Fix desactivado - usando Module1 Videos Loader');
return; // Salir temprano
```

### 2. Corregir chat-online.js línea 7896
```javascript
// Buscar y corregir la función problemática
async function getFirstVideoIdFromDatabase() {
    // Implementación correcta
}
```

### 3. Corregir chat-online.js línea 3894
```javascript
// Hacer la función async o mover el await
async function functionName() {
    await someAsyncOperation();
}
```

### 4. Configurar CSP en netlify.toml
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://www.gstatic.com https://apis.google.com https://esm.sh https://cdn.jsdelivr.net https://*.supabase.co; frame-src 'self' https://www.youtube.com;"
```

## CRITERIOS DE ÉXITO
- ✅ Module1 Videos Loader funciona sin conflictos
- ✅ No hay errores de sintaxis en JavaScript
- ✅ Supabase se carga correctamente (sin CSP violations)
- ✅ Videos se muestran sin errores 404
- ✅ No hay conflictos entre sistemas de carga
- ✅ YouTube embeds funcionan correctamente

## INSTRUCCIONES ESPECÍFICAS
1. **NO modifiques module1-videos-loader.js** - está funcionando correctamente
2. **Desactiva quick-video-fix.js** - está causando conflictos
3. **Corrige errores de sintaxis** antes de hacer otros cambios
4. **Configura CSP** para permitir Supabase
5. **Prueba cada cambio** individualmente

## COMANDOS DE PRUEBA
```bash
# Probar localmente
npm start

# Verificar en Netlify
netlify deploy --prod

# Verificar logs en Netlify
netlify functions:log
```

## REFERENCIAS TÉCNICAS
- Netlify CSP Configuration: https://docs.netlify.com/routing/headers/
- YouTube Embed API: https://developers.google.com/youtube/iframe_api_reference
- Supabase CSP Requirements: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

---

**IMPORTANTE:** El problema NO es que los videos no se carguen - SÍ se cargan correctamente. El problema es que hay **múltiples sistemas compitiendo** por cargar el mismo video. La solución es **desactivar los sistemas conflictivos** y **mantener solo el que funciona** (module1-videos-loader.js).