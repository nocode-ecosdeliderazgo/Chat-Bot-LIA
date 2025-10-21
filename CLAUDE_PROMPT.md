# Prompt para Solución del Menú LIA No Visible - Chat-Online

## Contexto del Problema
El sistema de menús divididos en `src/Chat-Online/chat-online.html` está funcionando correctamente, pero el contenido de LIA no se muestra porque el localStorage tiene un estado guardado como 'collapsed' que está sobrescribiendo el valor por defecto de 'lia'.

## Estado Actual del Problema

### Logs de Debugging:
```
chat-online.html:9175 🔧 [DEBUG] Estado guardado: collapsed
chat-online.html:9183 🔧 [DEBUG] Mostrando menú colapsado
```

### Problema Identificado:
1. **localStorage override**: El localStorage tiene un valor 'collapsed' guardado
2. **Valor por defecto ignorado**: El valor por defecto 'lia' se está ignorando
3. **Menú colapsado mostrado**: Se muestra el menú colapsado en lugar del menú de LIA

## Objetivo de la Solución

### Cambios Requeridos:
1. **Limpiar localStorage**: Eliminar el estado guardado 'collapsed' del localStorage
2. **Forzar estado LIA**: Asegurar que el menú se abra en LIA por defecto
3. **Mantener funcionalidad**: Preservar la capacidad de guardar estados futuros

## Especificaciones Técnicas

### Archivos a Modificar:
1. **`src/Chat-Online/chat-online.html`**: Modificar la lógica de restauración de estado

### Cambios de JavaScript Requeridos:

#### 1. Limpiar localStorage y Forzar Estado LIA:
```javascript
// Restaurar estado desde localStorage (por defecto abrir LIA)
const savedState = localStorage.getItem('rightPanelState');

// Limpiar estado 'collapsed' si existe y forzar LIA
if (savedState === 'collapsed') {
    console.log('🔧 [DEBUG] Limpiando estado colapsado del localStorage');
    localStorage.removeItem('rightPanelState');
    console.log('🔧 [DEBUG] Forzando apertura del menú LIA');
    showLiaMenu();
} else {
    const defaultState = 'lia'; // Valor por defecto
    console.log('🔧 [DEBUG] Estado guardado:', savedState || defaultState);
    
    if (savedState === 'lia') {
        console.log('🔧 [DEBUG] Abriendo menú LIA');
        showLiaMenu();
    } else if (savedState === 'notes') {
        console.log('🔧 [DEBUG] Abriendo menú Notas');
        showNotesMenu();
    } else {
        console.log('🔧 [DEBUG] Abriendo menú LIA por defecto');
        showLiaMenu();
    }
}
```

#### 2. Función de Limpieza de Estado:
```javascript
// Función para limpiar el estado del menú
window.clearMenuState = function() {
    console.log('🔧 [DEBUG] Limpiando estado del menú...');
    localStorage.removeItem('rightPanelState');
    console.log('🔧 [DEBUG] Estado limpiado, forzando menú LIA');
    showLiaMenu();
};

// Función para resetear a estado por defecto
window.resetMenuToDefault = function() {
    console.log('🔧 [DEBUG] Reseteando menú a estado por defecto...');
    localStorage.removeItem('rightPanelState');
    showLiaMenu();
    console.log('✅ [DEBUG] Menú reseteado a LIA');
};
```

#### 3. Verificación de Estado Inicial:
```javascript
// Verificar estado inicial del menú
window.checkMenuState = function() {
    const savedState = localStorage.getItem('rightPanelState');
    const currentClass = document.getElementById('sidebarRight')?.className;
    
    console.log('🔧 [DEBUG] Estado del menú:');
    console.log('  - localStorage:', savedState);
    console.log('  - Clase actual:', currentClass);
    console.log('  - Menú visible:', currentClass?.includes('lia-expanded') ? 'LIA' : 'No LIA');
    
    return {
        savedState: savedState,
        currentClass: currentClass,
        isLiaVisible: currentClass?.includes('lia-expanded') || false
    };
};
```

## Consideraciones de Implementación

### Estrategia de Solución:
1. **Detección automática**: Detectar si el estado es 'collapsed' y limpiarlo
2. **Forzar LIA**: Asegurar que LIA se abra por defecto
3. **Funciones de utilidad**: Proporcionar funciones para limpiar y verificar el estado

### Funcionalidad a Preservar:
1. **Guardado de estado**: Mantener la capacidad de guardar estados futuros
2. **Navegación entre menús**: Preservar la funcionalidad de cambio entre LIA y Notas
3. **Persistencia**: Mantener el estado seleccionado por el usuario

## Instrucciones de Implementación

### Paso 1: Modificar Lógica de Restauración
- Reemplazar la lógica actual de restauración de estado
- Agregar detección de estado 'collapsed'
- Forzar apertura de LIA cuando se detecte estado colapsado

### Paso 2: Agregar Funciones de Utilidad
- Implementar `clearMenuState()`
- Implementar `resetMenuToDefault()`
- Implementar `checkMenuState()`

### Paso 3: Testing
- Verificar que LIA se abra por defecto
- Probar que el estado se guarde correctamente
- Confirmar que las funciones de utilidad funcionen

## Resultado Esperado

Un sistema que:
- Abre LIA por defecto al cargar la página
- Limpia automáticamente estados 'colapsados' problemáticos
- Proporciona funciones de utilidad para debugging
- Mantiene toda la funcionalidad existente

---

**Fecha de creación**: $(date)
**Versión**: 1.0
**Estado**: Pendiente de implementación
