# Prompt para Claude: Implementación de Sistema de Autocheck en Chat Online

## Contexto del Proyecto
Estás trabajando en el archivo `src/Chat-Online/chat-online.html` que contiene un sistema de cursos online con videos y actividades. El sistema actual tiene:

- **Sistema de navegación con flechas**: `VideoNavigationSystem` con botones de navegación anterior/siguiente
- **Sistema de progreso**: `HybridProgressManager` que sincroniza con base de datos
- **Videos con clases CSS**: `.video-item.completed` para marcar videos completados
- **Función de conteo**: `countCompletedVideos()` que cuenta videos completados

## Objetivo
Implementar un sistema de "autocheck" que marque automáticamente los videos como completados y sincronice el progreso con la base de datos, siguiendo estas reglas específicas:

## Reglas del Sistema de Autocheck

### 1. Navegación con Flechas (Automático)
**Cuando el usuario navega hacia adelante usando las flechas:**
- Al hacer clic en la flecha "siguiente" (botón `nextVideoBtn`), el video actual debe marcarse como completado
- Esto debe incluir:
  - Agregar la clase `.completed` al elemento `.video-item` correspondiente
  - Llamar a `updateHeaderProgressBar()` para actualizar la barra de progreso
  - Sincronizar con la base de datos usando `HybridProgressManager`

**Cuando el usuario navega hacia atrás:**
- Al hacer clic en la flecha "anterior" (botón `prevVideoBtn`), NO debe marcar ningún video como completado
- Solo debe cambiar el video activo

### 2. Checkboxes Manuales (Con Restricciones)
**Implementar checkboxes en cada video/actividad con estas reglas:**
- El usuario puede marcar manualmente un video como completado SOLO si se encuentra en ese módulo
- El usuario NO puede marcar videos posteriores (futuros) como completados
- El usuario SÍ puede marcar videos anteriores como completados (en caso de que no estén marcados)
- Al marcar manualmente, debe sincronizar inmediatamente con la base de datos

### 3. Navegación desde Menú Desplegable
**Al cambiar de video/actividad desde el menú desplegable izquierdo:**
- Si se navega a la **siguiente actividad/video inmediata**, el video anterior debe marcarse como completado automáticamente
- Si se navega a actividades **superiores (no inmediatas)** o **anteriores**, NO debe marcar ningún video como completado
- La lógica debe determinar si es una navegación "hacia adelante" secuencial

## Implementación Técnica Requerida

### 1. Modificar VideoNavigationSystem
```javascript
// En la función navigateToNext()
navigateToNext() {
    // ... código existente ...
    
    // NUEVO: Marcar video actual como completado antes de navegar
    this.markCurrentVideoAsCompleted();
    
    // ... resto del código existente ...
}

// NUEVA FUNCIÓN
markCurrentVideoAsCompleted() {
    // Implementar lógica para marcar video actual como completado
    // Incluir sincronización con BD
}
```

### 2. Implementar Sistema de Checkboxes
```javascript
// NUEVA CLASE: ManualCheckboxManager
class ManualCheckboxManager {
    constructor() {
        this.currentModule = null;
        this.currentVideoIndex = -1;
    }
    
    // Implementar lógica de restricciones para checkboxes manuales
    canMarkAsCompleted(videoId) {
        // Verificar si el video está en el módulo actual
        // Verificar si no es un video futuro
    }
    
    markVideoCompleted(videoId, isManual = true) {
        // Marcar video como completado
        // Sincronizar con BD
    }
}
```

### 3. Modificar Sistema de Navegación del Menú
```javascript
// Modificar la función que maneja la selección desde el menú desplegable
function handleVideoSelectionFromMenu(selectedVideo) {
    // Determinar si es navegación hacia adelante secuencial
    const isSequentialForward = this.isSequentialForwardNavigation(selectedVideo);
    
    if (isSequentialForward) {
        // Marcar video anterior como completado
        this.markPreviousVideoAsCompleted();
    }
    
    // Cambiar al video seleccionado
    this.selectVideo(selectedVideo);
}
```

### 4. Función de Sincronización Unificada
```javascript
// NUEVA FUNCIÓN: Sincronización unificada
function syncVideoCompletion(videoId, completionMethod = 'auto') {
    try {
        // 1. Marcar visualmente como completado
        const videoElement = document.querySelector(`[data-video-id="${videoId}"]`);
        if (videoElement) {
            videoElement.classList.add('completed');
        }
        
        // 2. Actualizar contadores
        const videoCounts = countCompletedVideos();
        updateHeaderProgressBar(videoCounts.completed, videoCounts.total);
        
        // 3. Sincronizar con base de datos
        if (window.hybridProgressManager) {
            const progressData = {
                courseId: 'intro-to-ai',
                completedVideos: videoCounts.completed,
                totalVideos: videoCounts.total,
                percentage: Math.round((videoCounts.completed / videoCounts.total) * 100),
                lastUpdated: new Date().toISOString()
            };
            
            window.hybridProgressManager.saveProgress(progressData);
            
            // Forzar sincronización inmediata
            setTimeout(() => {
                window.hybridProgressManager.forceSync(progressData);
            }, 1000);
        }
        
        // 4. Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('videoCompleted', {
            detail: { videoId, completionMethod }
        }));
        
        console.log(`✅ Video ${videoId} marcado como completado (${completionMethod})`);
        
    } catch (error) {
        console.error('❌ Error sincronizando completado de video:', error);
    }
}
```

## Estructura de Datos Requerida

### 1. Estado del Sistema
```javascript
const AutoCheckSystem = {
    state: {
        currentVideoId: null,
        currentVideoIndex: -1,
        totalVideos: 0,
        videosArray: [],
        currentModule: null,
        isManualMode: false
    },
    
    // Métodos principales
    init() { /* Inicialización */ },
    markVideoCompleted(videoId, method) { /* Marcar como completado */ },
    canMarkVideo(videoId) { /* Verificar permisos */ },
    syncWithDatabase() { /* Sincronizar con BD */ }
};
```

### 2. Configuración de Checkboxes
```html
<!-- Ejemplo de estructura HTML para checkboxes -->
<div class="video-item" data-video-id="video-1">
    <input type="checkbox" 
           class="video-completion-checkbox" 
           data-video-id="video-1"
           onchange="handleManualCheckbox(this)">
    <span class="video-title">Título del Video</span>
</div>
```

## Consideraciones de UX/UI

### 1. Feedback Visual
- Mostrar notificación cuando se marca automáticamente
- Indicar visualmente qué videos pueden ser marcados manualmente
- Deshabilitar checkboxes de videos futuros

### 2. Estados de Checkbox
```css
.video-completion-checkbox {
    /* Estilo normal */
}

.video-completion-checkbox:disabled {
    /* Estilo para videos futuros */
    opacity: 0.5;
    cursor: not-allowed;
}

.video-completion-checkbox.auto-completed {
    /* Estilo para videos marcados automáticamente */
    background-color: #28a745;
}
```

## Validaciones y Edge Cases

### 1. Validaciones
- Verificar que el video existe antes de marcarlo
- Validar que no se marquen videos futuros manualmente
- Asegurar sincronización con BD antes de marcar visualmente

### 2. Edge Cases
- Usuario navega muy rápido entre videos
- Pérdida de conexión durante sincronización
- Videos que ya están marcados como completados
- Cambio de módulo durante navegación

## Testing y Debugging

### 1. Funciones de Testing
```javascript
// Función para probar el sistema
window.testAutoCheck = function() {
    console.log('🧪 Probando sistema de autocheck...');
    // Implementar pruebas
};

// Función para resetear estado
window.resetAutoCheck = function() {
    // Limpiar estado y reinicializar
};
```

### 2. Logging
- Log detallado de todas las acciones de autocheck
- Tracking de métodos de completado (auto/manual)
- Monitoreo de sincronización con BD

## Instrucciones de Implementación

1. **Paso 1**: Modificar `VideoNavigationSystem.navigateToNext()` para incluir autocheck
2. **Paso 2**: Implementar `ManualCheckboxManager` para checkboxes manuales
3. **Paso 3**: Modificar sistema de selección del menú desplegable
4. **Paso 4**: Crear función unificada de sincronización
5. **Paso 5**: Agregar validaciones y manejo de errores
6. **Paso 6**: Implementar feedback visual y notificaciones
7. **Paso 7**: Agregar funciones de testing y debugging

## Notas Importantes

- **NO romper funcionalidad existente**: Mantener toda la funcionalidad actual intacta
- **Sincronización robusta**: Asegurar que los cambios se guarden en BD
- **Performance**: Evitar múltiples llamadas innecesarias a la BD
- **UX consistente**: Mantener la experiencia de usuario fluida
- **Fallbacks**: Implementar fallbacks en caso de errores de BD

Implementa este sistema paso a paso, asegurándote de que cada componente funcione correctamente antes de pasar al siguiente. Usa el sistema existente como base y extiéndelo con la nueva funcionalidad de autocheck.
