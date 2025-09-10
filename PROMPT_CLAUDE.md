# PROMPT PARA SOLUCIONAR VIDEOS DE YOUTUBE NO VISIBLES EN NETLIFY

## CONTEXTO DEL PROBLEMA
Tengo un proyecto web que funciona correctamente en localhost:3000, pero al desplegarlo en Netlify, los videos embebidos de YouTube no se muestran y aparece un error 404.

## ANÁLISIS INICIAL REQUERIDO
Antes de realizar cambios, necesito que identifiques:

1. **Archivos principales que manejan videos de YouTube:**
   - `src/scripts/dynamic-video-loader.js` - Carga dinámica de videos
   - `src/scripts/youtube-progress-tracker.js` - Seguimiento de progreso
   - `src/Chat-Online/chat-online.js` - Funciones de carga de video
   - `src/scripts/main.js` - Funciones de iframe embebido

2. **Configuración actual de Netlify:**
   - `netlify.toml` - Configuración de redirects y build
   - `_redirects` - Reglas de redirección
   - Headers de seguridad y CSP

3. **Patrones de URLs de YouTube encontrados:**
   - `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`
   - `https://www.youtube.com/iframe_api`
   - URLs de videos con parámetros específicos

## DIAGNÓSTICO PASO A PASO

### PASO 1: IDENTIFICAR LA CAUSA RAÍZ
Analiza estos posibles problemas:

1. **Headers de Seguridad (CSP):**
   - Verificar si Content Security Policy bloquea iframes de YouTube
   - Revisar headers X-Frame-Options
   - Comprobar referrer policy

2. **Configuración de Netlify:**
   - Verificar si hay redirects que interfieren con iframes
   - Revisar configuración de build y publish directory
   - Comprobar variables de entorno

3. **Código JavaScript:**
   - Verificar si las URLs se construyen correctamente en producción
   - Revisar si hay diferencias entre localhost y Netlify
   - Comprobar manejo de errores en iframes

### PASO 2: IMPLEMENTAR SOLUCIONES

#### 2.1 Configurar Headers de Seguridad
```toml
# En netlify.toml, agregar:
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "frame-src 'self' https://www.youtube.com https://youtube.com; script-src 'self' 'unsafe-inline' https://www.youtube.com;"
    X-Frame-Options = "SAMEORIGIN"
```

#### 2.2 Verificar URLs de YouTube
- Asegurar que las URLs usen HTTPS
- Verificar que los parámetros de embedding sean correctos
- Implementar fallbacks para videos no disponibles

#### 2.3 Configurar Redirects Específicos
```toml
# En netlify.toml, agregar redirects para iframes:
[[redirects]]
  from = "/youtube-embed/*"
  to = "https://www.youtube.com/embed/:splat"
  status = 200
  force = true
```

### PASO 3: IMPLEMENTAR DETECCIÓN DE ERRORES
Agregar logging y manejo de errores para:
- Detectar cuando un iframe falla al cargar
- Mostrar mensajes de error informativos
- Implementar retry logic para videos problemáticos

### PASO 4: OPTIMIZACIONES ADICIONALES
1. **Lazy Loading:** Implementar carga diferida de videos
2. **Preconnect:** Agregar preconnect a YouTube para mejorar rendimiento
3. **Error Boundaries:** Implementar manejo de errores en componentes de video

## ARCHIVOS A MODIFICAR (EN ORDEN DE PRIORIDAD)

1. **netlify.toml** - Configuración de headers y redirects
2. **src/scripts/dynamic-video-loader.js** - Mejorar manejo de errores
3. **src/scripts/youtube-progress-tracker.js** - Verificar configuración de API
4. **src/Chat-Online/chat-online.js** - Actualizar funciones de carga
5. **src/scripts/main.js** - Mejorar funciones de iframe

## CRITERIOS DE ÉXITO
- Videos de YouTube se cargan correctamente en Netlify
- No aparecen errores 404 en consola
- Funcionalidad de progreso de videos funciona
- API de YouTube se carga correctamente
- No hay errores de CSP o headers de seguridad

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
- YouTube Embed API: https://developers.google.com/youtube/iframe_api_reference
- Netlify Headers: https://docs.netlify.com/routing/headers/
- CSP para YouTube: https://developers.google.com/youtube/player_parameters

---

**IMPORTANTE:** Trabaja paso a paso, identifica primero la causa exacta del problema antes de implementar soluciones. Prioriza la eficiencia y mantén la funcionalidad existente.
