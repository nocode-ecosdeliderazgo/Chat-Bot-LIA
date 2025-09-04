# 🚀 Sistema de Módulos Expandibles - Chat Online

## 📋 Descripción

El **Sistema de Módulos Expandibles** es una nueva funcionalidad implementada en `chat-online.html` que permite a los usuarios contraer y expandir cada módulo del curso, mostrando los videos correspondientes de cada uno. Este sistema mantiene el frontend y estilo actual, pero agrega la funcionalidad de navegación por módulos.

## ✨ Características Principales

### 🔄 Módulos Expandibles/Contraíbles
- **Expansión**: Click en el encabezado del módulo para expandir y ver sus videos
- **Contracción**: Click nuevamente para contraer el módulo
- **Estado visual**: Indicadores claros del estado expandido/contraído

### 🎬 Gestión de Videos
- **2 videos por módulo**: Cada módulo muestra exactamente 2 videos correspondientes
- **Selección de video**: Click en cualquier video para reproducirlo
- **Estado activo**: El video actualmente reproducido se marca visualmente
- **Información detallada**: Título, duración y estado de cada video

### 🎨 Diseño y UX
- **Estilo consistente**: Mantiene el diseño glassmorphism actual
- **Animaciones suaves**: Transiciones fluidas al expandir/contraer
- **Responsive**: Funciona perfectamente en dispositivos móviles
- **Iconografía clara**: Iconos intuitivos para cada acción

## 🏗️ Arquitectura del Sistema

### 📁 Archivos Principales

1. **`src/scripts/modules-expandable-system.js`**
   - Clase principal `ModulesExpandableSystem`
   - Lógica de renderizado y gestión de estado
   - Manejo de eventos y interacciones

2. **`src/Chat-Online/chat-online.css`**
   - Estilos específicos para módulos expandibles
   - Animaciones y transiciones
   - Diseño responsive

3. **`src/Chat-Online/chat-online.html`**
   - Integración del sistema en la interfaz principal
   - Contenedor `#modulesList` para los módulos

### 🔧 Clase ModulesExpandableSystem

```javascript
class ModulesExpandableSystem {
    constructor() {
        this.currentVideoId = null;
        this.currentModuleId = null;
        this.modulesData = [];
        this.isInitialized = false;
    }
    
    // Métodos principales
    async init()                    // Inicialización del sistema
    async loadModulesFromDatabase() // Carga datos desde la base de datos
    renderModules()                 // Renderiza los módulos en la interfaz
    toggleModule(moduleId)          // Expande/contrae un módulo
    playVideo(videoId, youtubeId, videoTitle) // Reproduce un video
}
```

## 🚀 Instalación y Configuración

### 1. Incluir el Script

```html
<!-- En chat-online.html -->
<script src="../scripts/modules-expandable-system.js"></script>
```

### 2. Verificar el Contenedor

```html
<!-- El contenedor debe existir en el HTML -->
<div class="modules-list" id="modulesList">
    <!-- Los módulos se cargarán dinámicamente aquí -->
</div>
```

### 3. Inicialización Automática

El sistema se inicializa automáticamente cuando el DOM esté listo:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    if (!window.modulesExpandableSystem) {
        window.modulesExpandableSystem = new ModulesExpandableSystem();
        window.modulesExpandableSystem.init();
    }
});
```

## 📊 Estructura de Datos

### Módulo
```javascript
{
    id: 'modulo-1',
    module_number: 1,
    title: '¿Qué es la IA?',
    description: 'Introducción fundamental a la Inteligencia Artificial',
    module_videos: [...]
}
```

### Video
```javascript
{
    id: 'video-1-1',
    video_title: 'Bienvenida al curso de Inteligencia Artificial',
    duration_seconds: 330,
    youtube_video_id: 'MRIv2IwFTPg',
    video_order: 1
}
```

## 🔄 Flujo de Funcionamiento

### 1. **Inicialización**
   - Carga datos desde la base de datos (o fallback a datos locales)
   - Renderiza los módulos en la interfaz
   - Establece el primer módulo como activo

### 2. **Interacción del Usuario**
   - Click en encabezado del módulo → Expande/contrae
   - Click en video → Reproduce el video seleccionado
   - Navegación entre módulos y videos

### 3. **Actualización de Estado**
   - Video activo se marca visualmente
   - Información del video se actualiza en el reproductor
   - Estado del módulo se mantiene consistente

## 🎯 Funcionalidades Clave

### ✅ Expandir/Contraer Módulos
```javascript
// Expande o contrae un módulo específico
modulesExpandableSystem.toggleModule('modulo-1');
```

### ✅ Reproducir Videos
```javascript
// Reproduce un video específico
modulesExpandableSystem.playVideo('video-1-1', 'MRIv2IwFTPg', 'Título del Video');
```

### ✅ Obtener Estado Actual
```javascript
// Obtiene el video actualmente reproducido
const currentVideo = modulesExpandableSystem.getCurrentVideo();

// Obtiene el módulo actual
const currentModule = modulesExpandableSystem.getCurrentModule();
```

## 🧪 Testing

### Archivo de Prueba
Se incluye `test-modules-expandable.html` para verificar el funcionamiento:

1. **Inicialización**: Verifica que el sistema se inicialice correctamente
2. **Renderizado**: Comprueba que los módulos se rendericen
3. **Expansión**: Prueba la funcionalidad de expandir/contraer
4. **Reproducción**: Verifica la selección de videos
5. **Estado**: Muestra el estado actual del sistema

### Ejecutar Tests
```bash
# Abrir en el navegador
open test-modules-expandable.html
```

## 🔧 Personalización

### Cambiar Estilos
Los estilos están en `chat-online.css` bajo la sección:
```css
/* ===== SISTEMA DE MÓDULOS EXPANDIBLES ===== */
```

### Modificar Comportamiento
Editar `modules-expandable-system.js` para:
- Cambiar la lógica de expansión
- Modificar el renderizado de módulos
- Agregar nuevas funcionalidades

## 🌐 Integración con Base de Datos

### API Endpoint
El sistema intenta cargar datos desde:
```
GET /api/courses/ia-fundamentos/full-structure
```

### Fallback
Si la API no está disponible, usa datos locales hardcodeados como respaldo.

### Estructura Esperada
```javascript
{
    success: true,
    data: {
        modules: [
            {
                id: 'modulo-1',
                module_number: 1,
                title: 'Título del módulo',
                description: 'Descripción del módulo',
                module_videos: [...]
            }
        ]
    }
}
```

## 📱 Responsive Design

### Breakpoints
- **Desktop**: Layout horizontal completo
- **Tablet**: Ajustes menores en espaciado
- **Mobile**: Layout vertical optimizado

### Adaptaciones Móviles
- Módulos se apilan verticalmente
- Videos se muestran en columna
- Botones y controles optimizados para touch

## 🚨 Solución de Problemas

### Problema: Módulos no se cargan
```javascript
// Verificar en consola
console.log(window.modulesExpandableSystem);
console.log(window.modulesExpandableSystem.modulesData);
```

### Problema: Videos no se reproducen
```javascript
// Verificar reproductor
const player = document.getElementById('youtubePlayer');
console.log('Player encontrado:', !!player);
```

### Problema: Estilos no se aplican
- Verificar que `chat-online.css` esté incluido
- Comprobar que no haya conflictos CSS

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas
- [ ] Progreso de videos por usuario
- [ ] Marcadores y favoritos
- [ ] Búsqueda en módulos
- [ ] Filtros por categoría
- [ ] Exportación de progreso

### Optimizaciones Técnicas
- [ ] Lazy loading de módulos
- [ ] Cache de datos
- [ ] Compresión de assets
- [ ] Service Worker para offline

## 📞 Soporte

### Logs de Consola
El sistema genera logs detallados en la consola del navegador:
- 🚀 Inicialización
- 📚 Carga de datos
- ✅ Operaciones exitosas
- ❌ Errores y fallos

### Debugging
```javascript
// Acceder al sistema desde consola
window.modulesExpandableSystem

// Ver estado actual
window.modulesExpandableSystem.getCurrentVideo()
window.modulesExpandableSystem.getCurrentModule()
```

---

## 🎉 ¡Sistema Listo!

El **Sistema de Módulos Expandibles** está completamente implementado y listo para usar. Proporciona una experiencia de usuario moderna y intuitiva para navegar por el contenido del curso, manteniendo la estética y funcionalidad existentes.

**Características implementadas:**
- ✅ Módulos expandibles/contraíbles
- ✅ 2 videos por módulo
- ✅ Reproducción de videos
- ✅ Diseño responsive
- ✅ Integración con base de datos
- ✅ Fallback a datos locales
- ✅ Sistema de testing completo
- ✅ Documentación detallada

¡Disfruta explorando el nuevo sistema de navegación por módulos! 🚀
