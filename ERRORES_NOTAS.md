# Implementación de Manejo de Errores para Sistema de Notas

## Contexto del Sistema Actual

El sistema de notas de Chat-Bot-LIA actualmente funciona con:
- **Archivo principal**: `Chat-Online/chat-online.html` (script inline para carga de notas)
- **Almacenamiento**: localStorage con clave `lia_notes`
- **Funciones clave**:
  - `cargarNotasInmediatamente()` - Carga notas desde localStorage
  - `limpiarNotasLocalStorage()` - Limpia todas las notas
  - Sistema de validación de autenticación integrado

## Tipos de Errores a Implementar

### 1. Errores de localStorage

#### QuotaExceededError (Almacenamiento lleno)
- **Causa**: localStorage excede límite (~5-10MB)
- **Síntomas**: Fallo al guardar nuevas notas
- **Solución**:
  - Limpiar notas más antiguas automáticamente
  - Comprimir datos existentes
  - Ofrecer exportación antes de limpiar

#### SecurityError (Acceso denegado)
- **Causa**: localStorage deshabilitado (modo incógnito, políticas de privacidad)
- **Síntomas**: Error al acceder a localStorage
- **Solución**:
  - Fallback a almacenamiento en memoria temporal
  - Advertir al usuario sobre pérdida de datos
  - Ofrecer descargar notas como archivo

#### JSON Parse Errors (Datos corruptos)
- **Causa**: localStorage contiene JSON malformado
- **Síntomas**: Error al cargar notas existentes
- **Solución**:
  - Intentar recuperar datos parciales
  - Crear backup de datos corruptos
  - Reinicializar con array vacío

### 2. Errores de Validación

#### Contenido Inválido
- **Validaciones necesarias**:
  - Longitud máxima de título (100 caracteres)
  - Longitud máxima de contenido (10,000 caracteres)
  - Caracteres especiales problemáticos
  - Campos requeridos (título, contenido)

#### Estructura de Datos Incorrecta
- **Validar campos obligatorios**:
  ```javascript
  {
    id: number,
    title: string,
    content: string,
    timestamp: string,
    module: string,
    updatedAt?: string
  }
  ```

#### IDs Duplicados
- **Verificar unicidad** antes de agregar
- **Regenerar ID** en caso de conflicto

### 3. Errores de Concurrencia

#### Múltiples Pestañas
- **Detectar cambios externos** en localStorage
- **Sincronizar entre pestañas** usando `storage` event
- **Resolver conflictos** con timestamp más reciente

### 4. Errores de Red (Futuras implementaciones)
- **Timeout de sincronización**
- **Fallo de conexión**
- **Respuestas inválidas del servidor**

## Implementación Técnica Requerida

### 1. Wrapper de localStorage con Manejo de Errores

```javascript
class NotesStorageManager {
    constructor() {
        this.storageKey = 'lia_notes';
        this.maxNotesCount = 100;
        this.maxNoteSize = 10000;
    }

    saveNotes(notes) {
        try {
            // Validaciones antes de guardar
            this.validateNotes(notes);

            const serialized = JSON.stringify(notes);
            localStorage.setItem(this.storageKey, serialized);

            this.showSuccess('Notas guardadas correctamente');
            return true;
        } catch (error) {
            return this.handleSaveError(error);
        }
    }

    loadNotes() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return [];

            const notes = JSON.parse(data);
            this.validateNotesStructure(notes);

            return notes;
        } catch (error) {
            return this.handleLoadError(error);
        }
    }

    handleSaveError(error) {
        if (error.name === 'QuotaExceededError') {
            return this.handleQuotaExceeded();
        } else if (error.name === 'SecurityError') {
            return this.handleSecurityError();
        } else {
            this.showError(`Error al guardar: ${error.message}`);
            return false;
        }
    }

    handleLoadError(error) {
        if (error instanceof SyntaxError) {
            return this.handleCorruptedData();
        } else {
            this.showError(`Error al cargar notas: ${error.message}`);
            return [];
        }
    }
}
```

### 2. Sistema de Notificaciones de Error

```javascript
class NotesErrorNotifier {
    showError(message, options = {}) {
        // Mostrar notificación de error roja
        // Incluir botones de acción si es necesario
    }

    showWarning(message, options = {}) {
        // Mostrar notificación de advertencia amarilla
    }

    showSuccess(message) {
        // Mostrar notificación de éxito verde
    }

    showRecoveryOptions(errorType) {
        // Mostrar modal con opciones de recuperación
    }
}
```

### 3. Sistema de Backup y Recuperación

```javascript
class NotesBackupManager {
    createBackup(notes) {
        // Crear backup antes de operaciones riesgosas
    }

    exportNotes(notes, format = 'json') {
        // Exportar notas como archivo descargable
    }

    importNotes(file) {
        // Importar notas desde archivo
    }

    autoCleanup() {
        // Limpiar notas antiguas cuando se excede cuota
    }
}
```

### 4. Monitoreo de Salud del Sistema

```javascript
class NotesHealthMonitor {
    checkStorageHealth() {
        // Verificar disponibilidad y espacio de localStorage
    }

    validateDataIntegrity() {
        // Verificar integridad de datos existentes
    }

    setupStorageListener() {
        // Escuchar cambios de storage entre pestañas
    }
}
```

## Indicadores Visuales Requeridos

### Estados de Guardado
- **🔄 Guardando...** - Indicador durante guardado
- **✅ Guardado** - Confirmación exitosa
- **❌ Error al guardar** - Indicación de fallo
- **⚠️ Almacenamiento lleno** - Advertencia de cuota

### Feedback al Usuario
- **Notificaciones toast** no intrusivas
- **Modales de recuperación** para errores críticos
- **Indicadores de estado** en tiempo real
- **Opciones de acción** claras (reintentar, exportar, limpiar)

## Casos de Prueba Sugeridos

### Simulación de Errores
1. **Llenar localStorage** hasta límite
2. **Corromper datos JSON** manualmente
3. **Deshabilitar localStorage** en DevTools
4. **Simular múltiples pestañas** modificando notas
5. **Interrumpir guardado** durante proceso

### Validación de Recuperación
1. **Verificar backup automático** antes de limpiar
2. **Comprobar fallback** a memoria temporal
3. **Validar exportación** de datos críticos
4. **Probar importación** desde archivo
5. **Confirmar sincronización** entre pestañas

## Archivos a Modificar

1. **`src/Chat-Online/chat-online.html`**
   - Reemplazar script inline actual
   - Integrar nuevas clases de manejo de errores

2. **`src/Chat-Online/chat-online.js`**
   - Agregar funciones de manejo de errores a clase principal
   - Integrar con sistema existente

3. **Estilos CSS**
   - Agregar estilos para notificaciones de error
   - Indicadores visuales de estado

## Objetivo de la Implementación

Crear un sistema robusto de manejo de errores que:
- **Previene pérdida de datos** del usuario
- **Proporciona feedback claro** sobre el estado del sistema
- **Ofrece opciones de recuperación** en casos de fallo
- **Mantiene la funcionalidad** incluso en condiciones adversas
- **Es transparente** para el usuario en operaciones normales

## Prioridades de Implementación

1. **Alta**: localStorage errors y data corruption
2. **Media**: Validación de datos y feedback visual
3. **Baja**: Concurrencia entre pestañas y features avanzadas

---

**Nota**: Este documento debe ser usado como referencia completa para implementar el manejo de errores en el sistema de notas del Chat-Bot-LIA. El sistema actual ya funciona correctamente para casos de uso normales.