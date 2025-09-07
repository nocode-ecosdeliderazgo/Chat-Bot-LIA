# Prompt para Claude: Implementar Panel Derecho Colapsable en Chat-Online

## Objetivo
Modificar el panel derecho de `src/Chat-Online/chat-online.html` y `src/Chat-Online/chat-online.css` para agregar funcionalidad de colapso similar a la implementada en `src/chat.html` y `src/styles/chat.css`. El panel derecho debe poder colapsarse completamente y expandirse, adaptando el tamaño del panel central automáticamente.

## Contexto Actual
El panel derecho actualmente contiene:
- Sección LIA Assistant (chat con LIA)
- Sección de Notas (creador de notas)
- Sección de Comunidad (preguntas y respuestas)

## Requisitos Específicos

### 1. HTML - Agregar Botón de Colapso
En `src/Chat-Online/chat-online.html`, modificar el panel derecho (`<aside class="right-panel" id="sidebarRight">`) para incluir:

```html
<aside class="right-panel" id="sidebarRight">
    <div class="right-panel-header">
        <h3>Panel Derecho</h3>
        <button class="collapse-btn" id="collapseRight" title="Ocultar/mostrar">⟨⟩</button>
    </div>
    
    <!-- Contenido existente del panel -->
    <!-- LIA Assistant -->
    <div class="lia-assistant-section">
        <!-- ... contenido existente ... -->
    </div>
    
    <!-- Resto del contenido existente -->
</aside>
```

### 2. CSS - Estilos de Colapso
En `src/Chat-Online/chat-online.css`, agregar los siguientes estilos:

#### Header del Panel Derecho
```css
.right-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0, 102, 204, 0.15);
    margin-bottom: 1rem;
}

.right-panel-header h3 {
    margin: 0;
    color: var(--glass-primary);
    font-size: 1rem;
    font-weight: 600;
}

.collapse-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: var(--text-on-dark);
    border-radius: 10px;
    padding: 4px 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.collapse-btn:hover {
    background: rgba(0, 102, 204, 0.2);
    border-color: rgba(0, 102, 204, 0.4);
    color: #0066CC;
}
```

#### Estado Colapsado
```css
.right-panel.collapsed {
    width: 60px;
    min-width: 60px;
    max-width: 60px;
    padding: 0.5rem;
}

.right-panel.collapsed .right-panel-header {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    justify-content: center;
}

.right-panel.collapsed .right-panel-header h3 {
    display: none;
}

.right-panel.collapsed .collapse-btn {
    font-size: 0.8rem;
    padding: 2px 4px;
}

/* Ocultar todo el contenido cuando está colapsado */
.right-panel.collapsed .lia-assistant-section,
.right-panel.collapsed .notes-creator-section,
.right-panel.collapsed .community-content {
    display: none !important;
}
```

#### Adaptación del Panel Central
```css
/* Cuando el panel derecho está colapsado, expandir el panel central */
.right-panel.collapsed ~ .center-panel {
    grid-column: 2 / 4; /* Extender hasta el final */
}

/* Ajustar el grid layout cuando está colapsado */
.layout-3panels:has(.right-panel.collapsed) {
    grid-template-columns: 280px 1fr 60px;
}
```

#### Modo Claro y Oscuro
```css
/* Modo claro */
[data-theme="light"] .right-panel-header {
    border-bottom-color: rgba(0, 102, 204, 0.1);
}

[data-theme="light"] .right-panel-header h3 {
    color: var(--glass-primary);
}

[data-theme="light"] .collapse-btn {
    border-color: rgba(0, 102, 204, 0.2);
    color: var(--text-on-light);
}

[data-theme="light"] .collapse-btn:hover {
    background: rgba(0, 102, 204, 0.1);
    border-color: rgba(0, 102, 204, 0.3);
    color: #0066CC;
}
```

### 3. JavaScript - Funcionalidad de Colapso
Agregar el siguiente JavaScript al final del archivo HTML (antes del cierre de `</body>`):

```javascript
// Funcionalidad de colapso del panel derecho
document.addEventListener('DOMContentLoaded', function() {
    const collapseRight = document.getElementById('collapseRight');
    const sidebarRight = document.getElementById('sidebarRight');
    
    if (collapseRight && sidebarRight) {
        collapseRight.addEventListener('click', function() {
            sidebarRight.classList.toggle('collapsed');
            console.log('📱 Panel derecho:', sidebarRight.classList.contains('collapsed') ? 'colapsado' : 'expandido');
            
            // Opcional: Guardar estado en localStorage
            localStorage.setItem('rightPanelCollapsed', sidebarRight.classList.contains('collapsed'));
        });
        
        // Restaurar estado desde localStorage
        const isCollapsed = localStorage.getItem('rightPanelCollapsed') === 'true';
        if (isCollapsed) {
            sidebarRight.classList.add('collapsed');
        }
    }
});
```

### 4. Responsive Design
Agregar estilos responsive para móviles:

```css
@media (max-width: 768px) {
    .right-panel.collapsed {
        width: 50px;
        min-width: 50px;
        max-width: 50px;
    }
    
    .right-panel.collapsed .right-panel-header {
        padding: 0.25rem;
    }
    
    .right-panel.collapsed .collapse-btn {
        font-size: 0.7rem;
        padding: 1px 2px;
    }
}

@media (max-width: 480px) {
    .right-panel.collapsed {
        width: 40px;
        min-width: 40px;
        max-width: 40px;
    }
}
```

## Consideraciones Importantes

1. **Preservar Funcionalidad**: No afectar la funcionalidad existente del chat LIA, notas o comunidad
2. **Transiciones Suaves**: Usar transiciones CSS para animaciones fluidas
3. **Accesibilidad**: Mantener el atributo `title` en el botón para tooltips
4. **Consistencia Visual**: Usar los mismos colores y estilos que el resto de la aplicación
5. **Estado Persistente**: Guardar el estado de colapso en localStorage
6. **Responsive**: Asegurar que funcione correctamente en dispositivos móviles

## Estructura Final Esperada

El panel derecho debe tener esta estructura:
```
.right-panel
├── .right-panel-header
│   ├── h3 (título)
│   └── .collapse-btn (botón de colapso)
├── .lia-assistant-section
├── .notes-creator-section
└── .community-content
```

Cuando esté colapsado, solo debe mostrar el botón de colapso en el header, ocultando todo el contenido del panel.

## Referencias
- Basarse en la implementación existente en `src/chat.html` y `src/styles/chat.css`
- Usar los mismos patrones de colapso que el panel izquierdo en `chat.html`
- Mantener consistencia con el sistema de temas (claro/oscuro) existente
