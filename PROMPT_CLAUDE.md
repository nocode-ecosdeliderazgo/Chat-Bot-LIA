# Prompt para Integración de Modo Claro en Chat Online

## Contexto del Proyecto
Necesito integrar un modo claro en el sistema de chat online (`src/Chat-Online/chat-online.html` y `src/Chat-Online/chat-online.css`) manteniendo la misma estructura y funcionalidad del modo oscuro actual, pero adaptando los colores y estilos para una experiencia visual clara.

## Referencias de Modo Claro
He analizado los modos claros implementados en:
- `src/Community/community.html` y `src/Community/community.css`
- `src/cursos.html` y `src/styles/cursos.css`

## Estructura Actual del Chat Online
El chat online tiene una estructura de 3 paneles:
- **Left Panel**: Información del curso, progreso, materiales
- **Center Panel**: Contenido principal (video, transcripciones, quiz)
- **Right Panel**: Asistente LIA, notas, comunidad

## Elementos Principales a Adaptar

### 1. Variables CSS Base
El archivo actual tiene variables en `:root` que necesitan ser extendidas con modo claro:

```css
:root {
    --glass-primary: #0066CC;
    --glass-primary-dark: #0077A6;
    --glass-secondary: #22C55E;
    --glass-accent: #F59E0B;
    --glass-bg-main: linear-gradient(135deg, #0a0f19 0%, #1a2332 50%, #0a0f19 100%);
    --glass-surface: rgba(0, 102, 204, 0.08);
    --glass-text-primary: #FFFFFF;
    --glass-text-secondary: rgba(255, 255, 255, 0.8);
    --glass-text-muted: rgba(255, 255, 255, 0.6);
}
```

### 2. Elementos Específicos a Adaptar

#### A. Paneles y Contenedores
- `.layout-3panels`
- `.left-panel`, `.center-panel`, `.right-panel`
- `.neo-panel`
- `.course-card`
- `.course-info-section`

#### B. Navegación
- `.top-navigation`
- `.nav-tabs`
- `.nav-tab`
- `.back-btn`

#### C. Contenido del Curso
- `.course-progress-section`
- `.progress-bar`
- `.progress-dot`
- `.module-item`
- `.video-container`
- `.content-tabs`
- `.tab-btn`

#### D. Asistente LIA
- `.lia-assistant-section`
- `.lia-chat`
- `.lia-messages`
- `.lia-input`
- `.message-content`

#### E. Notas y Comunidad
- `.notes-creator-section`
- `.community-content`
- `.question-item`
- `.modal-content`

#### F. Elementos de UI
- `.btn-primary`, `.btn-secondary`
- `.modal-overlay`
- `.toast-container`
- `.loading-overlay`

## Especificaciones del Modo Claro

### Colores Base para Modo Claro
```css
[data-theme="light"] {
    /* Fondos principales */
    --glass-bg-main: linear-gradient(160deg, #E6F3FF 0%, #D4E6F1 100%);
    --glass-bg-alt: linear-gradient(160deg, #E8F2F8 0%, #D1E7DD 100%);
    
    /* Superficies y contenedores */
    --glass-surface: rgba(255, 255, 255, 0.95);
    --glass-surface-light: rgba(255, 255, 255, 0.9);
    --glass-surface-hover: rgba(0, 102, 204, 0.1);
    --glass-surface-active: rgba(0, 102, 204, 0.15);
    
    /* Textos */
    --glass-text-primary: #2D3748;
    --glass-text-secondary: rgba(45, 55, 72, 0.8);
    --glass-text-muted: rgba(45, 55, 72, 0.6);
    --glass-text-white: #FFFFFF;
    
    /* Bordes */
    --glass-border: 1px solid rgba(0, 102, 204, 0.15);
    --glass-border-strong: 1px solid rgba(0, 102, 204, 0.25);
    --glass-border-subtle: 1px solid rgba(0, 102, 204, 0.08);
    
    /* Sombras */
    --glass-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    --glass-shadow-hover: 0 8px 32px rgba(0, 0, 0, 0.12);
    --glass-shadow-strong: 0 8px 32px rgba(0, 0, 0, 0.15);
}
```

### Características del Modo Claro
1. **Fondo**: Gradiente azul claro (#E6F3FF a #D4E6F1) o (#E8F2F8 a #D1E7DD)
2. **Texto**: Gris oscuro (#2D3748) para contraste
3. **Superficies**: Blancas semitransparentes con blur
4. **Bordes**: Azul translúcido sutil
5. **Sombras**: Suaves y claras
6. **Botones**: Mantener el azul #0066CC como color principal

### Colores Específicos de Referencia
Basándome en las páginas de referencia, estos son los colores exactos que se usan:

#### Textos
- **Primario**: `#2D3748` (gris oscuro)
- **Secundario**: `rgba(45, 55, 72, 0.8)` (gris medio)
- **Muted**: `rgba(45, 55, 72, 0.6)` (gris claro)
- **Nombres de usuario**: `#2D3748`
- **Emails**: `#4A5568`

#### Fondos
- **Principal**: `linear-gradient(160deg, #E6F3FF 0%, #D4E6F1 100%)`
- **Alternativo**: `linear-gradient(160deg, #E8F2F8 0%, #D1E7DD 100%)`
- **Tarjetas**: `rgba(255, 255, 255, 0.95)`
- **Navbar**: `rgba(255, 255, 255, 0.9)`
- **Menús**: `rgba(255, 255, 255, 0.95)`

#### Bordes
- **Sutiles**: `rgba(0, 102, 204, 0.15)`
- **Normales**: `rgba(0, 102, 204, 0.2)`
- **Fuertes**: `rgba(0, 102, 204, 0.25)`

#### Sombras
- **Suaves**: `0 4px 20px rgba(0, 0, 0, 0.08)`
- **Hover**: `0 8px 32px rgba(0, 0, 0, 0.12)`
- **Fuertes**: `0 8px 32px rgba(0, 0, 0, 0.15)`

#### Estados Hover
- **Fondos**: `rgba(0, 102, 204, 0.1)`
- **Bordes**: `rgba(0, 102, 204, 0.3)`
- **Textos**: `#0066CC`

### Ejemplos de Implementación en Chat Online

#### Paneles y Contenedores
```css
[data-theme="light"] .left-panel,
[data-theme="light"] .center-panel,
[data-theme="light"] .right-panel {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 102, 204, 0.15);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .course-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 102, 204, 0.15);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
```

#### Navegación
```css
[data-theme="light"] .nav-tab {
    color: #4A5568;
    background: transparent;
}

[data-theme="light"] .nav-tab:hover {
    background: rgba(0, 102, 204, 0.1);
    color: #0066CC;
}

[data-theme="light"] .nav-tab.active {
    background: #0066CC;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}
```

#### Asistente LIA
```css
[data-theme="light"] .lia-assistant-section {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 102, 204, 0.15);
}

[data-theme="light"] .message-content {
    background: rgba(255, 255, 255, 0.9);
    color: #2D3748;
    border: 1px solid rgba(0, 102, 204, 0.1);
}

[data-theme="light"] .lia-input input {
    background: rgba(255, 255, 255, 0.9);
    color: #2D3748;
    border: 1px solid rgba(0, 102, 204, 0.15);
}
```

#### Modales y Formularios
```css
[data-theme="light"] .modal-content {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(0, 102, 204, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    color: #2D3748;
}

[data-theme="light"] .modal-overlay {
    background: rgba(0, 0, 0, 0.3);
}
```

## Tareas Específicas

### 1. Extender Variables CSS
- Agregar variables para modo claro usando `[data-theme="light"]`
- Mantener compatibilidad con modo oscuro existente
- Asegurar transiciones suaves entre temas

### 2. Adaptar Elementos de Paneles
- **Left Panel**: Tarjetas de curso con fondo blanco semitransparente
- **Center Panel**: Contenido con fondo claro y texto oscuro
- **Right Panel**: Asistente LIA con interfaz clara

### 3. Navegación y Botones
- Mantener el azul #0066CC como color principal
- Adaptar estados hover y active para modo claro
- Asegurar contraste adecuado en todos los estados

### 4. Elementos Interactivos
- Modales con fondo blanco y sombras suaves
- Botones con efectos de hover adaptados
- Inputs y formularios con estilos claros

### 5. Asistente LIA
- Chat con burbujas claras
- Input con fondo blanco
- Mensajes con texto oscuro legible

### 6. Elementos de Progreso
- Barras de progreso con colores adaptados
- Dots de progreso con estados claros
- Indicadores visuales consistentes

## Consideraciones Técnicas

### 1. Transiciones
- Implementar transiciones suaves (0.3s ease) para todos los elementos
- Usar `transition: all 0.3s ease` para cambios de tema

### 2. Compatibilidad
- Mantener funcionalidad existente
- No romper JavaScript existente
- Asegurar que el toggle de tema funcione correctamente

### 3. Responsive Design
- Adaptar estilos para móviles en modo claro
- Mantener legibilidad en todas las resoluciones

### 4. Accesibilidad
- Contraste adecuado en modo claro
- Estados de focus visibles
- Texto legible en todos los elementos

## Estructura de Implementación

### 1. Variables CSS
```css
/* Modo Claro */
[data-theme="light"] {
    /* Variables de color */
    /* Variables de superficie */
    /* Variables de texto */
    /* Variables de bordes */
}
```

### 2. Estilos Específicos
```css
/* Elementos específicos para modo claro */
[data-theme="light"] .elemento {
    /* Estilos adaptados */
}
```

### 3. Transiciones Globales
```css
/* Transiciones para cambio de tema */
* {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

## Resultado Esperado
Un modo claro completamente funcional que:
- Mantenga la misma estructura y funcionalidad del modo oscuro
- Use colores claros y legibles
- Tenga transiciones suaves entre temas
- Sea consistente con el diseño del resto de la plataforma
- Mantenga el azul #0066CC como color principal de la marca

## Archivos a Modificar
1. `src/Chat-Online/chat-online.css` - Agregar estilos de modo claro
2. Verificar que `src/Chat-Online/chat-online.html` tenga el toggle de tema implementado

¿Estás listo para implementar el modo claro siguiendo estas especificaciones?
    