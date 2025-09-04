# Contexto del Chat Lia - Configuración y Cambios

## Cambios de Temperatura OpenAI - 3 de septiembre 2025

### Modificación Realizada
Se cambió la variable `temperature` de `0.7` a `0.5` en todo el proyecto para hacer las respuestas de Lia más consistentes y menos creativas.

### Archivos Modificados

#### 1. `server.js`
**Línea 975:**
```javascript
// Antes:
temperature: process.env.CHATBOT_TEMPERATURE || 0.7,

// Después:
temperature: process.env.CHATBOT_TEMPERATURE || 0.5,
```

**Línea 3541:**
```javascript
// Antes:
temperature: parseFloat(process.env.CHATBOT_TEMPERATURE || '0.7'),

// Después:
temperature: parseFloat(process.env.CHATBOT_TEMPERATURE || '0.5'),
```

#### 2. `src/chat.html`
**Línea 1748:**
```javascript
// Antes:
temperature: 0.7

// Después:
temperature: 0.5
```

#### 3. `src/scripts/main.js`
**Línea 26:**
```javascript
// Antes:
temperature: 0.7

// Después:
temperature: 0.5
```

**Línea 1491:**
```javascript
// Antes:
CHATBOT_CONFIG.openai.temperature = config.temperature || 0.7;

// Después:
CHATBOT_CONFIG.openai.temperature = config.temperature || 0.5;
```

### Impacto del Cambio
- **Temperature 0.5**: Respuestas más consistentes y predecibles
- **Temperature 0.7**: Respuestas más creativas y variadas
- El cambio afecta a todas las instancias del chatbot Lia en el proyecto

### Contexto del Sistema de Chat Lia

#### Fuentes del Contexto
El chatbot Lia obtiene contexto de múltiples fuentes para generar respuestas contextualizadas:

1. **Base de datos Supabase:**
   - Curso actual (`courses.title`)
   - Módulo actual (`course_modules.title`) 
   - Video actual (`module_videos.video_title`)
   - Duración del video (`module_videos.duration_seconds`)
   - Transcripción del video (`module_videos.transcript_text`)

2. **Función de contexto completo** (`chat-debug-fix.js:92-116`):
```javascript
async function obtenerContextoCompleto(mensaje) {
    const response = await fetch('/api/courses/introduccion-ia/current-module/9562a449-4ade-4d4b-a3e4-b66dddb7e6f0');
    const data = await response.json();
    
    const contexto = `Usuario está en: ${data.current_module?.courses?.title} - ${data.current_module?.title}. Video actual: ${data.current_video.video_title}. Duración del video: ${data.current_video.duration_seconds}s. Transcripción: ${data.current_video.transcript_text?.substring(0, 500)}. Pregunta del usuario: ${mensaje}`;
    
    return contexto;
}
```

#### Formato del Contexto Enviado a OpenAI
```
"Usuario está en: Introducción a la IA - ¿Qué es la IA?. Video actual: Bienvenida al curso de Inteligencia Artificial. Duración del video: 187s. Transcripción: Bienvenidos al curso completo de Inteligencia Artificial... Pregunta del usuario: [mensaje del usuario]"
```

### Archivos Principales del Sistema de Chat

#### Scripts de Chat
- `src/Chat-Online/chat-debug-fix.js` - Sistema principal de chat con contexto enriquecido
- `src/Chat-Online/chat-online.js` - Interface del chat integrado
- `src/scripts/main.js` - Configuración principal del chatbot
- `src/chat.html` - Página principal de chat

#### APIs Relacionadas
- `/api/openai` - Endpoint principal para comunicación con OpenAI
- `/api/courses/:courseId/current-module/:userId` - Obtiene contexto del curso actual
- `server.js` - Configuración del servidor y endpoints

### Variables de Entorno Relacionadas
```bash
CHATBOT_TEMPERATURE=0.5          # Nueva configuración
CHATBOT_MODEL=gpt-4o-mini
CHATBOT_MAX_TOKENS=700
OPENAI_API_KEY=your_key_here
```

### Sistema de Video Integrado
El chat Lia está integrado con el sistema de videos dinámicos que:
- Carga videos desde Supabase
- Proporciona transcripciones como contexto
- Rastrea progreso del usuario
- Genera URLs de YouTube automáticamente

### Estado Actual del Sistema
- ✅ Chat funcional con contexto enriquecido
- ✅ Temperature ajustada a 0.5 para mayor consistencia
- ✅ Integración con sistema de cursos y videos
- ✅ API endpoints funcionando correctamente
- ✅ Contexto basado en contenido actual del curso

---

*Última actualización: 3 de septiembre 2025*
*Sistema: Coach Lia IA - Chatbot Educativo*