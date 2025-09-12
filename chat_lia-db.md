# Datos de Base de Datos Extraídos por Chat LIA

## Descripción General

El sistema de Chat LIA extrae y utiliza diversos datos de la base de datos **Supabase** para proporcionar asistencia contextualizada y personalizada durante las sesiones de aprendizaje. Este documento detalla qué información se obtiene y cómo se utiliza.

## Fuentes de Datos Principales

### 1. Base de Datos Supabase
**Configuración**:
- URL: `process.env.SUPABASE_URL`
- Service Key: `process.env.SUPABASE_SERVICE_ROLE_KEY`
- Cliente: `@supabase/supabase-js`

## Tablas y Datos Extraídos

### 1. Tabla `module_videos`
**Propósito**: Información completa de videos educativos

**Campos Utilizados por LIA**:
```sql
SELECT 
    id,                          -- UUID único del video
    video_title,                 -- Título del video para contexto
    description,                 -- Descripción del contenido
    youtube_video_id,           -- ID para reproductor de YouTube
    duration_minutes,           -- Duración para gestión de tiempo
    transcript_text,            -- Transcripción completa del video
    summary,                    -- Resumen del contenido
    key_concepts,              -- Conceptos clave del video
    learning_objectives,        -- Objetivos de aprendizaje
    tags,                      -- Etiquetas temáticas
    difficulty_level,          -- Nivel de dificultad
    video_order,               -- Orden en el módulo
    is_active,                 -- Estado activo/inactivo
    created_at,                -- Fecha de creación
    updated_at,                -- Última actualización
    
    -- CAMPOS ESPECÍFICOS DE ACTIVIDADES
    descripcion_actividad,      -- Descripción de actividades prácticas
    prompts_actividad          -- Prompts y ejercicios para el video
FROM module_videos
WHERE module_id = ? AND is_active = true
ORDER BY video_order ASC;
```

### 2. Tabla `course_modules`
**Propósito**: Información de módulos del curso

**Campos Utilizados**:
```sql
SELECT 
    id,                        -- UUID del módulo
    module_title,              -- Título del módulo
    description,               -- Descripción del módulo
    module_order,              -- Orden en el curso
    estimated_duration,        -- Duración estimada
    objectives,               -- Objetivos del módulo
    prerequisites,            -- Prerrequisitos
    course_id                 -- Relación con el curso
FROM course_modules
WHERE course_id = ? AND is_active = true;
```

### 3. Tabla `courses`
**Propósito**: Información general del curso

**Campos Utilizados**:
```sql
SELECT 
    id,                       -- UUID del curso
    title,                    -- Título del curso
    description,              -- Descripción general
    category,                 -- Categoría del curso
    difficulty_level,         -- Nivel de dificultad
    estimated_hours,          -- Horas estimadas totales
    instructor_name,          -- Nombre del instructor
    learning_path,            -- Ruta de aprendizaje
    tags,                     -- Etiquetas del curso
    is_active                 -- Estado del curso
FROM courses
WHERE slug = ? AND is_active = true;
```

### 4. Tabla `user_progress`
**Propósito**: Seguimiento del progreso individual

**Campos Utilizados**:
```sql
SELECT 
    user_id,                  -- UUID del usuario
    video_id,                 -- UUID del video
    current_time_seconds,     -- Tiempo actual de reproducción
    completion_percentage,    -- Porcentaje de completado
    is_completed,             -- Estado de completado
    last_accessed,           -- Último acceso
    total_watch_time,        -- Tiempo total visto
    notes,                   -- Notas del usuario
    bookmarks                -- Marcadores temporales
FROM user_progress
WHERE user_id = ? AND video_id = ?;
```

### 5. Tabla `video_checkpoints`
**Propósito**: Puntos de verificación en videos

**Campos Utilizados**:
```sql
SELECT 
    video_id,                 -- UUID del video
    checkpoint_time,          -- Tiempo del checkpoint
    checkpoint_title,         -- Título del checkpoint
    checkpoint_description,   -- Descripción
    checkpoint_type          -- Tipo (quiz, activity, review)
FROM video_checkpoints
WHERE video_id = ?
ORDER BY checkpoint_time ASC;
```

## APIs y Endpoints

### 1. API Principal: `/api/courses/module1-videos`
**Archivo**: `api/courses.js`
**Función**: `getModule1Videos()`

**Datos Extraídos**:
```javascript
{
    success: true,
    count: number,
    videos: [
        {
            // Datos básicos del video
            id: "uuid",
            video_title: "string",
            description: "string", 
            youtube_video_id: "string",
            duration_minutes: number,
            
            // Contenido educativo
            transcript_text: "string",
            summary: "string",
            key_concepts: ["array"],
            learning_objectives: ["array"],
            
            // Actividades específicas para LIA
            descripcion_actividad: "string",
            prompts_actividad: "string",
            
            // Metadatos
            tags: ["array"],
            difficulty_level: "string",
            video_order: number,
            is_active: boolean
        }
    ]
}
```

### 2. Función de Obtención de Estructura Completa
**Endpoint**: `/api/courses/:courseId/full-structure`
**Función**: `getCourseFullStructure()`

**Datos Contextuales para LIA**:
```javascript
{
    course: {
        id: "uuid",
        title: "string",
        description: "string",
        instructor_name: "string",
        learning_path: "string"
    },
    modules: [
        {
            id: "uuid",
            module_title: "string",
            description: "string",
            objectives: ["array"],
            videos: [/* videos con actividades */]
        }
    ],
    userProgress: {
        completedVideos: number,
        totalVideos: number,
        overallProgress: percentage
    }
}
```

## Utilización de Datos por LIA Chat

### 1. Contexto de Conversación
**Archivo**: `src/Chat-Online/components/lia-chat.js`

**Contexto Construido**:
```javascript
prepareContext(additionalContext) {
    return {
        // Datos del módulo actual
        moduleId: this.currentContext.moduleId,
        moduleTitle: this.currentContext.moduleTitle,
        moduleDescription: this.currentContext.moduleDescription,
        
        // Datos del video actual  
        videoTitle: getCurrentVideoTitle(),
        videoTimestamp: this.getCurrentVideoTime(),
        
        // Progreso del usuario
        userProgress: this.currentContext.userProgress,
        totalModules: this.currentContext.totalModules,
        
        // Contenido educativo
        objetivos: this.currentContext.objetivos,
        documentoApoyo: this.currentContext.documentoApoyo,
        
        // Actividades del video actual
        descripcion_actividad: video.descripcion_actividad,
        prompts_actividad: video.prompts_actividad,
        
        // Contexto adicional
        ...additionalContext
    };
}
```

### 2. Prompt de Sistema Enriquecido
**Ubicación**: Función `sendMessage()` en `lia-chat.js`

**Información Contextual Enviada a OpenAI**:
```javascript
const contextualPrompt = `
CONTEXTO EDUCATIVO ACTUAL:
- Módulo: ${this.currentContext.moduleTitle}
- Descripción: ${this.currentContext.moduleDescription}
- Progreso del estudiante: ${this.currentContext.userProgress}% del taller completo
- Video actual: ${videoTitle}
- Timestamp: ${videoTimestamp} segundos
- Documento de apoyo: ${this.currentContext.documentoApoyo}

OBJETIVOS DE ESTE MÓDULO:
${this.currentContext.objetivos.map(obj => `- ${obj}`).join('\n')}

ACTIVIDADES ESPECÍFICAS DEL VIDEO:
${video.descripcion_actividad || 'No disponibles'}

PROMPTS Y EJERCICIOS:
${video.prompts_actividad || 'No disponibles'}

TRANSCRIPCIÓN DEL VIDEO (para referencia):
${video.transcript_text || 'No disponible'}

USUARIO: ${message}
`;
```

### 3. Datos de Usuario y Sesión
**Fuente**: Headers de autenticación y sesión

**Información Extraída**:
```javascript
// Desde el token JWT
{
    userId: "uuid",              // ID único del usuario
    username: "string",          // Nombre de usuario
    sessionId: "string",         // ID de sesión actual
    
    // Desde base de datos
    userProgress: {
        currentModule: number,    // Módulo actual
        completedVideos: [],     // Videos completados
        totalWatchTime: number,  // Tiempo total visto
        lastAccessed: "date",    // Último acceso
        preferences: {}          // Preferencias del usuario
    }
}
```

## Flujo de Datos en Tiempo Real

### 1. Inicialización del Chat
```javascript
// 1. Cargar datos del curso desde API
const courseData = await fetch('/api/courses/module1-videos');

// 2. Extraer información contextual
const contextualData = {
    videos: courseData.videos,
    currentVideo: getSelectedVideo(),
    userSession: getUserSession()
};

// 3. Inicializar LIA con contexto
liaChat.initialize(contextualData);
```

### 2. Actualización Dinámica
```javascript
// Cuando cambia el video actual
selectVideo(video) {
    // Actualizar contexto de LIA
    liaChat.updateContext({
        currentVideo: video,
        videoActivities: {
            description: video.descripcion_actividad,
            prompts: video.prompts_actividad
        },
        transcript: video.transcript_text
    });
}
```

### 3. Sincronización de Progreso
```javascript
// Guardar progreso en tiempo real
updateUserProgress(videoId, currentTime, completionPercentage) {
    // Actualizar en base de datos
    await supabase
        .from('user_progress')
        .upsert({
            user_id: userId,
            video_id: videoId,
            current_time_seconds: currentTime,
            completion_percentage: completionPercentage,
            last_accessed: new Date().toISOString()
        });
    
    // Actualizar contexto de LIA
    liaChat.updateUserProgress(completionPercentage);
}
```

## Optimizaciones y Caching

### 1. Cache de Datos
- **Videos**: Se almacenan en memoria durante la sesión
- **Contexto**: Se actualiza solo cuando cambia el video
- **Progreso**: Se sincroniza cada 30 segundos

### 2. Consultas Optimizadas
- **Joins eficientes**: Una sola consulta para obtener video + módulo + curso
- **Filtros por estado**: Solo datos activos (is_active = true)
- **Límites de resultado**: Paginación cuando es necesaria

### 3. Fallbacks
- **Datos locales**: Fallback a datos estáticos si la API falla
- **Contexto mínimo**: LIA funciona incluso sin todos los datos
- **Reintentos**: Sistema de reintentos para consultas fallidas

## Seguridad y Privacidad

### 1. Autenticación
- **JWT Tokens**: Verificación de usuario válido
- **Service Keys**: Acceso seguro a Supabase
- **Headers de sesión**: Validación de sesión activa

### 2. Filtros de Datos
- **Por usuario**: Solo datos del usuario autenticado
- **Por curso**: Solo datos del curso actual
- **Por estado**: Solo contenido activo y público

### 3. Logs y Monitoreo
- **Consultas registradas**: Para debug y optimización
- **Errores capturados**: Para mantenimiento proactivo
- **Métricas de uso**: Para análisis de rendimiento