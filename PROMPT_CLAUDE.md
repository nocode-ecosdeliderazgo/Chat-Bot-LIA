# Prompt para Análisis y Replicación del Botón de Colapso del Panel Derecho

## Objetivo
Analizar el botón de colapso del panel izquierdo en `chat-online.css` y recrear completamente el botón de colapso del panel derecho para que tenga exactamente el mismo tamaño, diseño y ubicación. El botón derecho actual es más pequeño y necesita ser eliminado y recreado desde cero.

## Contexto Visual
- **Estado Actual**: El botón de colapso del panel derecho es más pequeño que el del panel izquierdo
- **Estado Deseado**: Ambos botones deben tener exactamente el mismo tamaño y diseño
- **Acción Requerida**: Eliminar completamente el botón derecho existente y recrearlo desde cero

## Análisis Requerido del CSS

### 1. Identificar el Botón de Colapso del Panel Izquierdo
- Buscar la clase `.collapse-btn-left` en el archivo CSS
- Analizar todas sus propiedades de posicionamiento, tamaño y estilo

### 2. Propiedades Específicas a Analizar

#### Posicionamiento:
- `position: absolute`
- `right: 1.5rem` (ubicado a la derecha del panel)
- `top: 8px`
- `z-index: 10`

#### Dimensiones:
- `width: auto`
- `height: 32px`
- `min-width: 48px`
- `padding: 8px 12px`

#### Estilo Visual:
- `background: rgba(255, 255, 255, 0.05)`
- `border: 1px solid rgba(0, 102, 204, 0.3)`
- `border-radius: 8px`
- `backdrop-filter: blur(10px)`
- `box-shadow` específico con múltiples capas

#### Tipografía:
- `font-size: 0.875rem`
- `font-weight: 500`
- `color: var(--glass-text-primary)`

#### Efectos de Hover:
- Cambio de background a `rgba(0, 102, 204, 0.15)`
- Transformación `scale(1.05)`
- Efecto de brillo con `::before` pseudo-elemento

#### Transiciones:
- `transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)`

### 3. Estados Específicos a Replicar

#### Estado Normal (Panel Expandido):
- Aplicar todas las propiedades base del `.collapse-btn-left`
- Asegurar que sea visible cuando el panel izquierdo NO está colapsado

#### Estado Hover:
- Replicar el efecto de hover con cambio de color y escala
- Mantener el efecto de brillo deslizante

#### Estado Active:
- Aplicar `transform: scale(1.02)` al hacer clic

### 4. Tema Claro (Light Theme)
- Analizar las variantes para `[data-theme="light"] .collapse-btn-left`
- Replicar los colores y efectos específicos del tema claro

## Pasos de Implementación

### Paso 1: ELIMINAR el Botón Derecho Existente
- Buscar y eliminar TODAS las reglas CSS relacionadas con `.collapse-btn`
- Eliminar también las variantes de tema claro `[data-theme="light"] .collapse-btn`
- Eliminar efectos hover, active y pseudo-elementos del botón derecho actual

### Paso 2: Crear el Nuevo Botón Derecho (Réplica Exacta del Izquierdo)
```css
.collapse-btn {
    /* COPIAR EXACTAMENTE todas las propiedades de .collapse-btn-left */
    /* Cambiar solo la posición: left: 1.5rem en lugar de right: 1.5rem */
}
```

### Paso 3: Aplicar Efectos de Hover (Idénticos al Izquierdo)
```css
.collapse-btn:hover {
    /* Replicar EXACTAMENTE los efectos de hover de .collapse-btn-left:hover */
}
```

### Paso 4: Aplicar Efectos de Active (Idénticos al Izquierdo)
```css
.collapse-btn:active {
    /* Replicar EXACTAMENTE los efectos de active de .collapse-btn-left:active */
}
```

### Paso 5: Implementar Pseudo-elemento de Brillo (Idéntico al Izquierdo)
```css
.collapse-btn::before {
    /* Replicar EXACTAMENTE el efecto de brillo de .collapse-btn-left::before */
}
```

### Paso 6: Aplicar Variantes del Tema Claro (Idénticas al Izquierdo)
```css
[data-theme="light"] .collapse-btn {
    /* Replicar EXACTAMENTE los estilos de [data-theme="light"] .collapse-btn-left */
}
```

## Criterios de Éxito
1. **Eliminación Completa**: El botón derecho actual debe ser completamente eliminado
2. **Dimensiones Idénticas**: El nuevo botón derecho debe tener exactamente las mismas dimensiones que el izquierdo (32px altura, 48px ancho mínimo)
3. **Posicionamiento Correcto**: Debe estar posicionado a 1.5rem de la izquierda y 8px del top (espejo del botón izquierdo)
4. **Efectos Visuales Idénticos**: Mismo efecto de vidrio esmerilado (backdrop-filter), hover, active y brillo
5. **Temas Consistentes**: Debe funcionar correctamente en tema claro y oscuro con los mismos colores
6. **Visibilidad**: Solo debe ser visible cuando el panel derecho NO está colapsado

## Diferencias Clave entre Botones
- **Botón Izquierdo (`.collapse-btn-left`)**: `right: 1.5rem` (posicionado a la derecha del panel)
- **Botón Derecho (`.collapse-btn`)**: `left: 1.5rem` (posicionado a la izquierda del panel)
- **Todo lo demás debe ser IDÉNTICO**: dimensiones, colores, efectos, transiciones

## Nota Importante
- **ELIMINAR COMPLETAMENTE** el botón derecho actual antes de crear el nuevo
- **NO modificar** el comportamiento cuando el panel está colapsado
- **Solo implementar** el botón para el estado expandido del panel derecho
- **Mantener** la consistencia visual con el botón izquierdo existente
- **Resultado Final**: Ambos botones deben verse exactamente iguales en tamaño y diseño
