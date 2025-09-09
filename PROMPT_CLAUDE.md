# PROMPT PARA CLAUDE - SOLUCIÓN DE PROBLEMA DE ACTIVIDADES

## CONTEXTO DEL PROBLEMA
Como Ingenieros Senior en Desarrollo, necesitamos solucionar un problema crítico en la página `CHAT-ONLINE.html`. El problema específico es que **las actividades y prompts no se muestran en el botón de actividades**, aunque los datos SÍ existen en la base de datos.

## EVIDENCIA DEL PROBLEMA
- ✅ **Base de datos**: Los datos están presentes en la tabla `module_videos` con campos `descripcion_actividad` y `prompts_actividad`
- ✅ **Videos funcionan**: Los links de videos de la misma tabla SÍ aparecen correctamente en la página
- ❌ **Actividades no aparecen**: El contenido de actividades y prompts no se renderiza en la interfaz
- ❌ **Prompts no aparecen**: Los ejercicios y prompts no se muestran al usuario

## DIAGNÓSTICO COMPLETADO
**PROBLEMA IDENTIFICADO**: La función `updateContentArea` en `chat-online.js` **NO maneja el caso específico de `activity`**. Solo maneja el caso de `community`, pero cuando se hace clic en el botón de "Actividad", simplemente muestra/oculta el contenido sin cargar los datos de actividades.

**FUNCIONALIDAD EXISTENTE**: En el archivo `module1-videos-loader.js` ya existe la función `updateActivityContent` (líneas 712-803) que **SÍ carga correctamente las actividades y prompts desde la base de datos**.

## SOLUCIÓN A IMPLEMENTAR

### PASO 1: MODIFICAR LA FUNCIÓN `updateContentArea`
**Archivo**: `src/Chat-Online/chat-online.js`
**Ubicación**: Líneas 1222-1242 (aproximadamente)

**Código a agregar** después del bloque `if (contentType === 'community')`:

```javascript
} else if (contentType === 'activity') {
    console.log('📋 Configurando contenido de actividades');
    
    // Cargar actividades del video actual cuando se accede a la pestaña
    setTimeout(() => {
        this.loadActivityContent();
    }, 10);
}
```

### PASO 2: CREAR LA FUNCIÓN `loadActivityContent`
**Archivo**: `src/Chat-Online/chat-online.js`
**Ubicación**: Al final de la clase ChatOnline, antes del cierre `}`

**Código completo a agregar**:

```javascript
// ===== FUNCIÓN PARA CARGAR CONTENIDO DE ACTIVIDADES =====

loadActivityContent() {
    try {
        console.log('📋 Cargando contenido de actividades...');
        
        // Verificar si el Module1VideosLoader está disponible
        if (window.module1VideosLoader && window.module1VideosLoader.videos) {
            console.log('✅ Module1VideosLoader encontrado');
            
            // Obtener el video actual
            const currentVideo = window.module1VideosLoader.videos.find(video => 
                video.id === window.module1VideosLoader.currentVideoId
            );
            
            if (currentVideo) {
                console.log('🎬 Video actual encontrado:', currentVideo.video_title);
                console.log('📝 Descripción de actividad:', currentVideo.descripcion_actividad ? 'EXISTE' : 'NO EXISTE');
                console.log('💡 Prompts de actividad:', currentVideo.prompts_actividad ? 'EXISTE' : 'NO EXISTE');
                
                // Llamar a la función updateActivityContent del Module1VideosLoader
                window.module1VideosLoader.updateActivityContent(currentVideo);
                console.log('✅ Contenido de actividades cargado correctamente');
            } else {
                console.warn('⚠️ No se encontró video actual, usando el primer video disponible');
                if (window.module1VideosLoader.videos.length > 0) {
                    const firstVideo = window.module1VideosLoader.videos[0];
                    window.module1VideosLoader.updateActivityContent(firstVideo);
                    console.log('✅ Contenido de actividades cargado con el primer video');
                }
            }
        } else {
            console.warn('⚠️ Module1VideosLoader no está disponible');
            
            // Fallback: mostrar mensaje de que no hay actividades disponibles
            const activityContent = document.querySelector('.activity-content');
            if (activityContent) {
                const activityDescription = activityContent.querySelector('.activity-description');
                const activityPrompts = activityContent.querySelector('.activity-prompts');
                
                if (activityDescription) {
                    activityDescription.innerHTML = `
                        <p class="no-activity">No hay descripción de actividad disponible para este video.</p>
                    `;
                }
                
                if (activityPrompts) {
                    activityPrompts.innerHTML = `
                        <p class="no-activity">No hay prompts de actividad disponibles para este video.</p>
                    `;
                }
                
                console.log('✅ Mensajes de fallback mostrados');
            }
        }
    } catch (error) {
        console.error('❌ Error cargando contenido de actividades:', error);
    }
}
```

## ARCHIVOS A MODIFICAR
- `src/Chat-Online/chat-online.js` - Agregar lógica para manejar el tab de actividades

## ARCHIVOS QUE YA FUNCIONAN CORRECTAMENTE
- `src/Chat-Online/module1-videos-loader.js` - Función `updateActivityContent` ya implementada
- `src/Chat-Online/chat-online.html` - Estructura HTML correcta
- `src/Chat-Online/chat-online.css` - Estilos CSS correctos

## RESULTADO ESPERADO
Después de implementar estos cambios:
- ✅ Las actividades se mostrarán correctamente en el botón de actividades
- ✅ Los prompts y ejercicios aparecerán en la interfaz
- ✅ El contenido se cargará dinámicamente desde la base de datos
- ✅ La funcionalidad será consistente con el resto de la aplicación
- ✅ No se romperá ninguna funcionalidad existente

## INSTRUCCIONES ESPECÍFICAS
1. **Localizar** la función `updateContentArea` en `chat-online.js`
2. **Agregar** el bloque `else if (contentType === 'activity')` después del bloque de `community`
3. **Crear** la función `loadActivityContent` al final de la clase ChatOnline
4. **Verificar** que no haya errores de sintaxis
5. **Probar** que el botón de actividades funcione correctamente

## PRIORIDAD
**ALTA** - Este es un problema crítico que afecta la funcionalidad principal de la plataforma de aprendizaje.

## NOTAS TÉCNICAS
- La solución reutiliza código existente que ya funciona correctamente
- Se implementa manejo de errores y fallbacks apropiados
- Se mantiene la consistencia con el patrón de código existente
- La solución es escalable y mantenible