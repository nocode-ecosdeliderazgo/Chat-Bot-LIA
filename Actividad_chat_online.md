# Estructura del Elemento de Actividad - Chat Online

## Descripción General

El elemento de actividad en el panel central de Chat Online (`src/Chat-Online/chat-online.html`) proporciona una interfaz para mostrar actividades educativas específicas de cada video. Este elemento se actualiza dinámicamente cuando el usuario selecciona diferentes videos desde la lista de contenido.

## Estructura HTML del Elemento

### Contenedor Principal
```html
<div class="activity-content" data-content="activity" style="display: none;">
    <h4>Actividades del Video - [Título del Video]</h4>
    
    <!-- Sección de Descripción -->
    <div class="activity-section">
        <h5>📋 Descripción de la Actividad</h5>
        <div class="activity-description">
            <!-- Contenido dinámico se inserta aquí -->
        </div>
    </div>
    
    <!-- Sección de Prompts -->
    <div class="activity-section">
        <h5>💭 Prompts y Ejercicios</h5>
        <div class="activity-prompts">
            <!-- Contenido dinámico se inserta aquí -->
        </div>
    </div>
    
    <!-- Botones de Acción -->
    <div class="activity-actions">
        <button class="btn-primary activity-btn" onclick="copyActivityToClipboard()">
            <svg class="icon-sm" viewBox="0 0 24 24">...</svg>
            Copiar Actividad
        </button>
    </div>
</div>
```

## Flujo de Obtención de Datos

### 1. Fuente de Datos
Los datos de actividades se obtienen desde la base de datos **Supabase** a través de la API endpoint:
- **Endpoint**: `/api/courses/module1-videos`
- **Archivo responsable**: `module1-videos-loader.js`

### 2. Campos de la Base de Datos
Para cada video, se extraen los siguientes campos relacionados con actividades:

```javascript
{
    id: "uuid",
    video_title: "string",
    descripcion_actividad: "string",    // Texto descriptivo de la actividad
    prompts_actividad: "string",        // Lista de prompts y ejercicios
    // ... otros campos del video
}
```

### 3. Proceso de Actualización

#### Clase Responsable: `Module1VideosLoader`
**Archivo**: `src/Chat-Online/module1-videos-loader.js`

**Método Principal**: `updateActivityContent(video)`

```javascript
updateActivityContent(video) {
    const activityContent = document.querySelector('.activity-content');
    
    if (activityContent) {
        // 1. Actualizar título de la actividad
        const activityTitle = activityContent.querySelector('h4');
        activityTitle.textContent = `Actividades del Video - ${video.video_title}`;
        
        // 2. Actualizar descripción
        const activityDescription = activityContent.querySelector('.activity-description');
        if (video.descripcion_actividad) {
            const htmlContent = `
                <div class="activity-description-content">
                    ${this.replaceEmojisWithIcons(video.descripcion_actividad)
                        .split('\\n')
                        .map(paragraph => paragraph.trim() ? `<p>${paragraph.trim()}</p>` : '')
                        .join('')}
                </div>
            `;
            activityDescription.innerHTML = htmlContent;
        }
        
        // 3. Actualizar prompts
        const activityPrompts = activityContent.querySelector('.activity-prompts');
        if (video.prompts_actividad) {
            const promptsHtml = `
                <div class="activity-prompts-content">
                    ${this.replaceEmojisWithIcons(video.prompts_actividad)
                        .split('\\n')
                        .map(prompt => {
                            const trimmedPrompt = prompt.trim();
                            if (trimmedPrompt) {
                                // Detectar si es un prompt (empieza con número o bullet)
                                if (/^\\d+\\./.test(trimmedPrompt) || /^[•\\-\\*]/.test(trimmedPrompt)) {
                                    return `<div class="activity-prompt-item">${trimmedPrompt}</div>`;
                                } else {
                                    return `<p>${trimmedPrompt}</p>`;
                                }
                            }
                            return '';
                        }).join('')}
                </div>
            `;
            activityPrompts.innerHTML = promptsHtml;
        }
    }
}
```

## Funciones de Interacción

### Copiar Actividad al Portapapeles
**Función**: `copyActivityToClipboard()`
**Ubicación**: Definida en `chat-online.html`

```javascript
function copyActivityToClipboard() {
    const activityContent = document.querySelector('.activity-content');
    
    // Extrae texto de descripción
    const descriptionElement = activityContent.querySelector('.activity-description-content');
    const description = descriptionElement ? descriptionElement.innerText : 'Sin descripción disponible';
    
    // Extrae texto de prompts  
    const promptsElement = activityContent.querySelector('.activity-prompts-content');
    const prompts = promptsElement ? promptsElement.innerText : 'Sin prompts disponibles';
    
    // Construye texto completo
    const fullText = `
=== ACTIVIDAD: ${videoTitle} ===

📋 DESCRIPCIÓN:
${description}

💭 PROMPTS Y EJERCICIOS:
${prompts}

---
Generado desde Coach LIA IA - ${new Date().toLocaleDateString()}
    `;
    
    // Copia al portapapeles
    navigator.clipboard.writeText(fullText.trim());
}
```

## Estilos CSS Relevantes

### Clases Principales
- `.activity-content`: Contenedor principal del elemento
- `.activity-section`: Secciones individuales (descripción y prompts)
- `.activity-description-content`: Contenedor dinámico para descripción
- `.activity-prompts-content`: Contenedor dinámico para prompts
- `.activity-prompt-item`: Elementos individuales de prompt
- `.activity-actions`: Contenedor de botones de acción
- `.activity-btn`: Estilo para botones de acción

### Características de Diseño
- **Tema Dual**: Soporte para modo claro y oscuro
- **Glass Effect**: Efectos de cristal con transparencias
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Animaciones**: Transiciones suaves entre estados

## Procesamiento de Contenido

### Conversión de Emojis
La función `replaceEmojisWithIcons()` convierte emojis de texto en iconos SVG para mejor renderizado:

```javascript
replaceEmojisWithIcons(text) {
    return text
        .replace(/📋/g, '<svg class="emoji-icon">...</svg>')
        .replace(/💭/g, '<svg class="emoji-icon">...</svg>')
        .replace(/🎯/g, '<svg class="emoji-icon">...</svg>');
}
```

### Formato de Prompts
Los prompts se procesan para:
1. **Detectar numeración**: `1.`, `2.`, etc.
2. **Detectar bullets**: `•`, `-`, `*`
3. **Aplicar styling específico**: Cada prompt se envuelve en `.activity-prompt-item`

## Estados del Elemento

1. **Inicial**: Muestra mensajes de "Cargando..."
2. **Cargado**: Muestra contenido real desde la base de datos
3. **Error**: Muestra mensajes de error si no se pueden cargar los datos
4. **Sin Datos**: Muestra mensajes informativos cuando no hay actividades disponibles

## Integración con el Sistema

El elemento de actividad se integra con:
- **Module1VideosLoader**: Para obtener y procesar datos
- **VideoPlayer**: Para sincronizarse con el video actual
- **Chat LIA**: Para proporcionar contexto a las conversaciones
- **Sistema de Temas**: Para mantener consistencia visual
- **Sistema de Notificaciones**: Para feedback al usuario