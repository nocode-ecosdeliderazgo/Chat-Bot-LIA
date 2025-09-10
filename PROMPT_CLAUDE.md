# PROMPT PARA CLAUDE - SOLUCIÓN DE PROBLEMA DE RESUMEN

## CONTEXTO DEL PROBLEMA
Como Ingenieros Senior en Desarrollo, necesitamos solucionar un problema crítico en la página `CHAT-ONLINE.html`. El problema específico es que **el resumen no se muestra en el botón de resumen**, aunque los datos SÍ existen en la base de datos.

## EVIDENCIA DEL PROBLEMA
- ✅ **Base de datos**: Los datos están presentes en la tabla `module_videos` con campo `resumen`
- ✅ **Videos funcionan**: Los links de videos de la misma tabla SÍ aparecen correctamente en la página
- ❌ **Resumen no aparece**: El contenido del resumen no se renderiza en la interfaz
- ❌ **Botón resumen vacío**: El botón de resumen no muestra información al usuario

## DIAGNÓSTICO COMPLETADO
**PROBLEMA IDENTIFICADO**: La función `updateContentArea` en `chat-online.js` **NO maneja el caso específico de `summary`**. Solo maneja el caso de `community`, pero cuando se hace clic en el botón de "Resumen", simplemente muestra/oculta el contenido sin cargar los datos del resumen.

**FUNCIONALIDAD EXISTENTE**: En el archivo `module1-videos-loader.js` ya existe la función `updateActivityContent` (líneas 712-803) que **SÍ carga correctamente las actividades y prompts desde la base de datos**, pero necesitamos crear una función similar para el resumen.

## SOLUCIÓN A IMPLEMENTAR

### PASO 1: MODIFICAR LA FUNCIÓN `updateContentArea`
**Archivo**: `src/Chat-Online/chat-online.js`
**Ubicación**: Líneas 1222-1242 (aproximadamente)

**Código a agregar** después del bloque `if (contentType === 'community')`:

```javascript
} else if (contentType === 'summary') {
    console.log('📄 Configurando contenido de resumen');
    
    // Cargar resumen del video actual cuando se accede a la pestaña
    setTimeout(() => {
        this.loadSummaryContent();
    }, 10);
}
```

### PASO 2: CREAR LA FUNCIÓN `loadSummaryContent`
**Archivo**: `src/Chat-Online/chat-online.js`
**Ubicación**: Al final de la clase ChatOnline, antes del cierre `}`

**Código completo a agregar**:

```javascript
// ===== FUNCIÓN PARA CARGAR CONTENIDO DE RESUMEN =====

loadSummaryContent() {
    try {
        console.log('📄 Cargando contenido de resumen...');
        
        // Verificar si el Module1VideosLoader está disponible
        if (window.module1VideosLoader && window.module1VideosLoader.videos) {
            console.log('✅ Module1VideosLoader encontrado');
            
            // Obtener el video actual
            const currentVideo = window.module1VideosLoader.videos.find(video => 
                video.id === window.module1VideosLoader.currentVideoId
            );
            
            if (currentVideo) {
                console.log('🎬 Video actual encontrado:', currentVideo.video_title);
                console.log('📄 Resumen:', currentVideo.resumen ? 'EXISTE' : 'NO EXISTE');
                
                // Actualizar el contenido del resumen
                this.updateSummaryContent(currentVideo);
                console.log('✅ Contenido de resumen cargado correctamente');
            } else {
                console.warn('⚠️ No se encontró video actual, usando el primer video disponible');
                if (window.module1VideosLoader.videos.length > 0) {
                    const firstVideo = window.module1VideosLoader.videos[0];
                    this.updateSummaryContent(firstVideo);
                    console.log('✅ Contenido de resumen cargado con el primer video');
                }
            }
        } else {
            console.warn('⚠️ Module1VideosLoader no está disponible');
            
            // Fallback: mostrar mensaje de que no hay resumen disponible
            const summaryContent = document.querySelector('.summary-content');
            if (summaryContent) {
                summaryContent.innerHTML = `
                    <p class="no-summary">No hay resumen disponible para este video.</p>
                `;
                console.log('✅ Mensaje de fallback mostrado');
            }
        }
    } catch (error) {
        console.error('❌ Error cargando contenido de resumen:', error);
    }
}

// ===== FUNCIÓN PARA ACTUALIZAR EL CONTENIDO DEL RESUMEN =====

updateSummaryContent(video) {
    try {
        const summaryContent = document.querySelector('.summary-content');
        
        if (summaryContent) {
            if (video.resumen && video.resumen.trim() !== '') {
                // Mostrar el resumen del video
                summaryContent.innerHTML = `
                    <div class="summary-text">
                        <h3>Resumen del Video</h3>
                        <div class="summary-body">
                            ${video.resumen.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `;
                console.log('✅ Resumen actualizado con contenido del video');
            } else {
                // Mostrar mensaje de que no hay resumen
                summaryContent.innerHTML = `
                    <div class="no-summary">
                        <p>No hay resumen disponible para este video.</p>
                    </div>
                `;
                console.log('✅ Mensaje de "sin resumen" mostrado');
            }
        } else {
            console.warn('⚠️ No se encontró el elemento .summary-content');
        }
    } catch (error) {
        console.error('❌ Error actualizando contenido de resumen:', error);
    }
}
```

## ARCHIVOS A MODIFICAR
- `src/Chat-Online/chat-online.js` - Agregar lógica para manejar el tab de resumen

## ARCHIVOS QUE YA FUNCIONAN CORRECTAMENTE
- `src/Chat-Online/module1-videos-loader.js` - Carga de videos desde base de datos
- `src/Chat-Online/chat-online.html` - Estructura HTML correcta
- `src/Chat-Online/chat-online.css` - Estilos CSS correctos

## RESULTADO ESPERADO
Después de implementar estos cambios:
- ✅ El resumen se mostrará correctamente en el botón de resumen
- ✅ El contenido del resumen aparecerá en la interfaz
- ✅ El contenido se cargará dinámicamente desde la base de datos
- ✅ La funcionalidad será consistente con el resto de la aplicación
- ✅ No se romperá ninguna funcionalidad existente

## INSTRUCCIONES ESPECÍFICAS
1. **Localizar** la función `updateContentArea` en `chat-online.js`
2. **Agregar** el bloque `else if (contentType === 'summary')` después del bloque de `community`
3. **Crear** la función `loadSummaryContent` al final de la clase ChatOnline
4. **Crear** la función `updateSummaryContent` para renderizar el contenido
5. **Verificar** que no haya errores de sintaxis
6. **Probar** que el botón de resumen funcione correctamente

## PRIORIDAD
**ALTA** - Este es un problema crítico que afecta la funcionalidad principal de la plataforma de aprendizaje.

## NOTAS TÉCNICAS
- La solución reutiliza la estructura existente del Module1VideosLoader
- Se implementa manejo de errores y fallbacks apropiados
- Se mantiene la consistencia con el patrón de código existente
- La solución es escalable y mantenible
- El resumen se formatea correctamente con saltos de línea convertidos a HTML
- Se incluye validación para contenido vacío o nulo

## CONSIDERACIONES PARA DESPLIEGUE EN NETLIFY
**IMPORTANTE**: Todo el código debe estar optimizado para funcionar correctamente cuando se despliegue en Netlify en el dominio `ecosdeliderazgo.com`.

### Requisitos específicos para Netlify:
- ✅ **Variables de entorno**: Asegurar que las variables de entorno (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) estén configuradas correctamente en Netlify
- ✅ **Rutas relativas**: Usar rutas relativas en lugar de absolutas para evitar problemas de CORS
- ✅ **HTTPS**: El código debe funcionar correctamente bajo HTTPS (Netlify usa HTTPS por defecto)
- ✅ **CORS**: Configurar correctamente las políticas CORS para Supabase
- ✅ **Build optimizado**: El código debe ser compatible con el proceso de build de Netlify
- ✅ **Cache headers**: Considerar headers de cache apropiados para recursos estáticos
- ✅ **Error handling**: Implementar manejo robusto de errores para conexiones de red
- ✅ **Fallbacks**: Incluir fallbacks para cuando la conexión a Supabase falle

### Configuración de Netlify:
```javascript
// Ejemplo de configuración para variables de entorno en Netlify
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
```

### Validaciones adicionales:
- Verificar que las URLs de Supabase sean accesibles desde el dominio ecosdeliderazgo.com
- Asegurar que no haya dependencias de localhost o IPs locales
- Probar la funcionalidad en un entorno de staging antes del despliegue final

### Manejo de errores de red para Netlify:
```javascript
// Ejemplo de manejo robusto de errores de conexión
try {
    // Código de carga de datos
} catch (error) {
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        console.warn('⚠️ Error de red detectado, usando datos en caché o fallback');
        // Implementar fallback o mostrar mensaje de error amigable
    } else {
        console.error('❌ Error inesperado:', error);
    }
}
```

### Consideraciones de rendimiento para Netlify:
- Implementar lazy loading para contenido pesado
- Usar debouncing en funciones que se ejecutan frecuentemente
- Optimizar las consultas a Supabase para reducir latencia
- Implementar retry logic para conexiones fallidas