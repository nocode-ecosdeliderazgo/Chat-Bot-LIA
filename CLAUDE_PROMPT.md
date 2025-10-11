# Prompt para Claude: Sistema de Progreso de Cursos con Base de Datos

## Contexto del Problema

El sistema actual de progreso de cursos en el Chat-Bot-LIA tiene los siguientes problemas identificados:

### 1. **Problemas de Conexión a Base de Datos**
- Las conexiones a la BD fallan frecuentemente
- Inconsistencias entre localStorage y datos de la BD
- Múltiples sistemas de progreso que no están sincronizados
- APIs que no responden correctamente en producción

### 2. **Sistema Actual de Progreso**
- **chat-online.html**: Usa `CourseProgressManagerV2` y `YouTubeProgressTracker`
- **courses.html**: Carga progreso desde localStorage con `loadCourseProgress()`
- **Base de datos**: Tiene esquema completo en `BDStructureBackup.sql` con tablas:
  - `course_progress` - Progreso general del curso
  - `module_progress` - Progreso por módulos
  - `video_section_progress` - Progreso por secciones de video
  - `user_progress` - Progreso detallado por video

### 3. **APIs Existentes**
- `/api/users/:userId/course/:courseId/progress` - Obtener progreso
- `/api/users/:userId/course/:courseId/module/:moduleNumber/progress` - Actualizar módulo
- Netlify Functions: `course-progress.js`, `module-progress.js`, `video-progress.js`

## Objetivo

Desarrollar un sistema robusto y eficiente que:
1. **Sincronice correctamente** el progreso entre localStorage y base de datos
2. **Maneje fallos de conexión** de forma elegante
3. **Mantenga consistencia** entre todas las páginas
4. **Optimice las consultas** a la base de datos
5. **Implemente retry logic** para conexiones fallidas

## Análisis Técnico Detallado

### Estructura Actual del Sistema

#### Frontend (chat-online.html)
```javascript
// CourseProgressManagerV2 - Gestión principal
class CourseProgressManagerV2 {
    constructor() {
        this.userId = null;
        this.courseId = '550e8400-e29b-41d4-a716-446655440001';
        this.currentProgress = null;
        this.apiBaseUrl = this.getApiBaseUrl();
    }
    
    // Métodos principales:
    // - loadInitialProgress()
    // - loadModulesProgress()
    // - updateProgressImmediate()
    // - setupAutoSave()
}
```

#### Frontend (courses.html)
```javascript
// Carga progreso desde localStorage
function loadCourseProgress() {
    const savedProgress = localStorage.getItem('courseProgress_chatgpt-gemini');
    if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        // Actualiza UI con datos locales
    }
}
```

#### Base de Datos (PostgreSQL)
```sql
-- Tabla principal de progreso
CREATE TABLE course_progress (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    course_identifier TEXT NOT NULL,
    overall_progress_percentage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'not_started',
    -- ... más campos
);

-- Tabla de progreso por módulos
CREATE TABLE module_progress (
    id UUID PRIMARY KEY,
    course_progress_id UUID NOT NULL,
    user_id UUID NOT NULL,
    module_number INTEGER NOT NULL,
    video_progress_percentage INTEGER DEFAULT 0,
    video_completed BOOLEAN DEFAULT FALSE,
    -- ... más campos
);
```

### Problemas Identificados

1. **Doble Sistema de Almacenamiento**
   - localStorage para persistencia local
   - Base de datos para persistencia global
   - No hay sincronización automática entre ambos

2. **Manejo de Errores Insuficiente**
   - No hay retry logic para conexiones fallidas
   - Fallback a localStorage no está implementado correctamente
   - Errores de API no se manejan de forma elegante

3. **Inconsistencias en APIs**
   - Múltiples endpoints para la misma funcionalidad
   - Diferentes formatos de respuesta
   - Falta de validación de datos

4. **Problemas de Performance**
   - Consultas frecuentes sin cache
   - No hay debouncing en actualizaciones
   - Múltiples llamadas simultáneas

## Solución Propuesta

### 1. **Sistema de Sincronización Híbrido**

```javascript
class HybridProgressManager {
    constructor() {
        this.localStorage = new LocalStorageManager();
        this.database = new DatabaseManager();
        this.syncQueue = new SyncQueue();
        this.isOnline = navigator.onLine;
    }
    
    async saveProgress(progressData) {
        // 1. Guardar en localStorage inmediatamente
        await this.localStorage.save(progressData);
        
        // 2. Intentar guardar en BD
        try {
            await this.database.save(progressData);
            // Marcar como sincronizado
            await this.localStorage.markAsSynced(progressData.id);
        } catch (error) {
            // Agregar a cola de sincronización
            this.syncQueue.add(progressData);
        }
    }
    
    async loadProgress() {
        // 1. Cargar desde localStorage (rápido)
        const localData = await this.localStorage.load();
        
        // 2. Intentar sincronizar con BD en background
        if (this.isOnline) {
            this.syncInBackground();
        }
        
        return localData;
    }
}
```

### 2. **Manejo Robusto de Conexiones**

```javascript
class DatabaseManager {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.timeout = 10000;
    }
    
    async makeRequest(endpoint, options = {}) {
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(endpoint, {
                    ...options,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
                
            } catch (error) {
                console.warn(`Intento ${attempt}/${this.maxRetries} falló:`, error.message);
                
                if (attempt === this.maxRetries) {
                    throw new Error(`Falló después de ${this.maxRetries} intentos: ${error.message}`);
                }
                
                // Esperar antes del siguiente intento
                await this.delay(this.retryDelay * attempt);
            }
        }
    }
}
```

### 3. **Sistema de Cache Inteligente**

```javascript
class ProgressCache {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.maxCacheSize = 100;
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }
    
    set(key, data) {
        // Limpiar cache si está lleno
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
}
```

### 4. **API Unificada y Optimizada**

```javascript
// Endpoint unificado para progreso
app.post('/api/progress/sync', async (req, res) => {
    try {
        const { userId, courseId, progressData } = req.body;
        
        // Validar datos
        const validation = validateProgressData(progressData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Datos inválidos',
                details: validation.errors
            });
        }
        
        // Procesar en transacción
        const result = await db.transaction(async (trx) => {
            // Actualizar progreso del curso
            await trx('course_progress')
                .where({ user_id: userId, course_identifier: courseId })
                .update({
                    overall_progress_percentage: progressData.overallPercentage,
                    last_accessed_at: new Date(),
                    updated_at: new Date()
                });
            
            // Actualizar progreso de módulos
            for (const module of progressData.modules) {
                await trx('module_progress')
                    .where({ 
                        user_id: userId, 
                        course_progress_id: progressData.courseProgressId,
                        module_number: module.number 
                    })
                    .update({
                        progress_percentage: module.progressPercentage,
                        video_progress_percentage: module.videoProgressPercentage,
                        video_completed: module.videoCompleted,
                        last_video_position: module.lastVideoPosition,
                        updated_at: new Date()
                    });
            }
            
            return { success: true };
        });
        
        res.json(result);
        
    } catch (error) {
        console.error('Error sincronizando progreso:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});
```

## Implementación Paso a Paso

### Paso 1: Crear el Sistema Híbrido
1. Implementar `HybridProgressManager`
2. Crear `LocalStorageManager` con versionado
3. Implementar `DatabaseManager` con retry logic
4. Crear `SyncQueue` para sincronización diferida

### Paso 2: Optimizar las APIs
1. Unificar endpoints de progreso
2. Implementar validación de datos
3. Agregar logging detallado
4. Optimizar consultas SQL

### Paso 3: Mejorar el Frontend
1. Actualizar `CourseProgressManagerV2`
2. Implementar cache inteligente
3. Agregar indicadores de sincronización
4. Mejorar manejo de errores

### Paso 4: Testing y Validación
1. Probar con conexión intermitente
2. Validar sincronización entre páginas
3. Verificar performance
4. Probar casos edge

## Consideraciones Especiales

### 1. **Compatibilidad con Sistema Existente**
- Mantener compatibilidad con localStorage actual
- Migrar datos existentes gradualmente
- No romper funcionalidad actual

### 2. **Performance**
- Implementar debouncing en actualizaciones
- Usar Web Workers para sincronización
- Optimizar consultas SQL

### 3. **Experiencia de Usuario**
- Mostrar estado de sincronización
- Permitir trabajo offline
- Recuperación automática de errores

### 4. **Monitoreo**
- Logging detallado de errores
- Métricas de performance
- Alertas de fallos de sincronización

## Archivos a Modificar

### Frontend
- `src/scripts/course-progress-manager-v2.js` - Actualizar con sistema híbrido
- `src/scripts/youtube-progress-tracker.js` - Mejorar manejo de errores
- `src/Chat-Online/chat-online.html` - Integrar nuevo sistema
- `src/courses.html` - Sincronizar con BD

### Backend
- `netlify/functions/course-progress.js` - Optimizar
- `netlify/functions/module-progress.js` - Unificar
- `server.js` - Agregar endpoints unificados
- `api/courses.js` - Mejorar validación

### Base de Datos
- `BDStructureBackup.sql` - Optimizar índices
- Agregar triggers para sincronización automática
- Implementar funciones de limpieza

## Métricas de Éxito

1. **Confiabilidad**: 99%+ de sincronización exitosa
2. **Performance**: <500ms para cargar progreso
3. **Disponibilidad**: Funcionar offline por 24h+
4. **Consistencia**: 0% de pérdida de datos

## Conclusión

Este sistema híbrido resolverá los problemas actuales de conexión a BD mientras mantiene una experiencia de usuario fluida. La implementación debe ser gradual para no interrumpir el servicio actual.

**Prioridad de implementación:**
1. Sistema híbrido básico
2. Manejo robusto de errores
3. Optimización de APIs
4. Mejoras de UX
5. Monitoreo y métricas

¿Estás listo para comenzar con la implementación del Paso 1?
