# Prompt para Rediseño de Navbar - Chat-Bot-LIA

## Contexto del Proyecto
Este es un sistema de chatbot educativo con múltiples páginas (Talleres, Directorio IA, Comunidad, Noticias) que actualmente utiliza una navbar flotante centrada. Se requiere transformar el diseño para que la navbar abarque todo el ancho de la pantalla superior, similar a un diseño de navbar tradicional.

## Estado Actual de la Navbar

### Estructura Actual:
- **Archivo principal**: `src/scripts/navbar-global.js`
- **Estilos**: `src/styles/navbar-global.css`
- **Diseño actual**: Navbar flotante centrada con bordes redondeados
- **Posicionamiento**: Fixed con padding lateral y ancho limitado (750px máximo)
- **Icono de usuario**: Posicionado de forma independiente (fixed) en la esquina superior derecha

### Componentes Actuales:
1. **Contenedor principal**: `#navbar-container` con `position: fixed`
2. **Barra de navegación**: `.course-tabs` con ancho limitado y centrado
3. **Botones de navegación**: 4 botones (Talleres, Directorio IA, Comunidad, Noticias)
4. **Icono de usuario**: `.header-profile` posicionado independientemente
5. **Menú de perfil**: `.profile-menu` desplegable

## Objetivo del Rediseño

### Cambios Requeridos:
1. **Navbar de ancho completo**: La navbar debe abarcar todo el ancho de la pantalla (100vw)
2. **Integración del icono de usuario**: El icono debe estar dentro de la navbar, no flotante
3. **Diseño horizontal**: Distribución horizontal con logo/icono a la izquierda, navegación al centro, y usuario a la derecha
4. **Mantener funcionalidad**: Preservar toda la funcionalidad existente (sticky, menú de perfil, etc.)

### Estructura Deseada:
```
[LOGO/BRAND] [NAVEGACIÓN CENTRAL] [ICONO USUARIO]
```

## Especificaciones Técnicas

### Archivos a Modificar:
1. **`src/styles/navbar-global.css`**: Actualizar estilos para navbar de ancho completo
2. **`src/scripts/navbar-global.js`**: Modificar estructura HTML si es necesario
3. **Posibles ajustes en páginas individuales** si requieren cambios en el contenedor

### Cambios de CSS Requeridos:

#### 1. Contenedor Principal:
```css
#navbar-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100vw; /* Cambiar de padding lateral a ancho completo */
    z-index: 9999;
    background: [color de fondo]; /* Agregar fondo sólido */
    border-bottom: [borde inferior]; /* Agregar separación visual */
}
```

#### 2. Barra de Navegación:
```css
#navbar-container .course-tabs {
    display: flex;
    align-items: center;
    justify-content: space-between; /* Cambiar de center a space-between */
    width: 100%; /* Ancho completo */
    max-width: 1200px; /* Ancho máximo para contenido */
    margin: 0 auto; /* Centrar contenido */
    padding: 0 20px; /* Padding horizontal */
    background: transparent; /* Remover fondo de la barra interna */
    border-radius: 0; /* Remover bordes redondeados */
    /* Remover sombras y efectos de la barra flotante */
}
```

#### 3. Sección de Navegación:
```css
.navbar-navigation {
    display: flex;
    align-items: center;
    gap: 8px;
    /* Estilos para los botones de navegación */
}
```

#### 4. Icono de Usuario:
```css
#navbar-container .header-profile {
    position: relative; /* Cambiar de fixed a relative */
    /* Remover posicionamiento absoluto */
    /* Integrar dentro del flujo de la navbar */
}
```

### Estructura HTML Sugerida:
```html
<div id="navbar-container">
    <div class="course-tabs">
        <!-- Logo/Brand (izquierda) -->
        <div class="navbar-brand">
            <img src="logo.svg" alt="Logo" />
            <span>Chat-Bot-LIA</span>
        </div>
        
        <!-- Navegación (centro) -->
        <div class="navbar-navigation">
            <button class="tab-button active">Talleres</button>
            <button class="tab-button">Directorio IA</button>
            <button class="tab-button">Comunidad</button>
            <button class="tab-button">Noticias</button>
        </div>
        
        <!-- Usuario (derecha) -->
        <div class="navbar-user">
            <button class="header-profile">
                <img src="avatar.svg" alt="Perfil" />
            </button>
        </div>
    </div>
    
    <!-- Menú de perfil (mantener estructura actual) -->
    <div id="profileMenu" class="profile-menu">
        <!-- Contenido del menú existente -->
    </div>
</div>
```

## Consideraciones de Diseño

### Responsive Design:
- **Desktop**: Navbar completa con todas las secciones visibles
- **Tablet**: Mantener estructura pero ajustar espaciado
- **Mobile**: Considerar menú hamburguesa o navegación colapsada

### Temas (Dark/Light):
- Mantener soporte para ambos temas
- Ajustar colores de fondo y texto según el tema activo
- Preservar contraste y legibilidad

### Funcionalidad a Preservar:
1. **Navegación entre páginas**: Todos los enlaces deben funcionar
2. **Menú de perfil**: Desplegable con opciones de usuario
3. **Sticky behavior**: Navbar debe mantenerse fija al hacer scroll
4. **Carga de avatar**: Sistema de carga de imagen de perfil
5. **Tema toggle**: Cambio entre modo claro y oscuro

## Colores y Estilos Sugeridos

### Modo Oscuro:
- **Fondo navbar**: `rgba(10, 16, 28, 0.95)` con `backdrop-filter: blur(10px)`
- **Borde inferior**: `1px solid rgba(68, 229, 255, 0.2)`
- **Texto**: `rgba(255, 255, 255, 0.9)`
- **Botones activos**: `linear-gradient(135deg, #0066CC, #4A90E2)`

### Modo Claro:
- **Fondo navbar**: `rgba(255, 255, 255, 0.95)` con `backdrop-filter: blur(10px)`
- **Borde inferior**: `1px solid rgba(0, 102, 204, 0.15)`
- **Texto**: `#1a202c`
- **Botones activos**: `#0066CC`

## Instrucciones de Implementación

### Paso 1: Backup
- Crear copia de seguridad de `navbar-global.css` y `navbar-global.js`

### Paso 2: Modificar CSS
- Actualizar `#navbar-container` para ancho completo
- Modificar `.course-tabs` para layout horizontal
- Reposicionar `.header-profile` dentro del flujo
- Ajustar responsive design

### Paso 3: Actualizar HTML (si necesario)
- Modificar estructura en `navbar-global.js` si se requiere
- Agregar sección de brand/logo
- Reorganizar elementos en layout horizontal

### Paso 4: Testing
- Verificar en todas las páginas (Talleres, Directorio, Comunidad, Noticias)
- Probar responsive design en diferentes tamaños
- Validar funcionalidad del menú de perfil
- Confirmar que los temas funcionan correctamente

### Paso 5: Ajustes Finales
- Refinar espaciado y alineación
- Optimizar para diferentes resoluciones
- Asegurar accesibilidad

## Notas Importantes

1. **Preservar funcionalidad existente**: No romper ninguna característica actual
2. **Mantener compatibilidad**: Asegurar que funcione en todas las páginas
3. **Performance**: No agregar elementos que afecten la velocidad
4. **Accesibilidad**: Mantener navegación por teclado y lectores de pantalla
5. **Consistencia**: Asegurar que el diseño sea coherente con el resto de la aplicación

## Resultado Esperado

Una navbar moderna que:
- Abarca todo el ancho de la pantalla
- Tiene distribución horizontal clara (logo - navegación - usuario)
- Mantiene toda la funcionalidad existente
- Es responsive y accesible
- Se integra perfectamente con el diseño actual de la aplicación
- Soporta ambos temas (claro/oscuro)

---

**Fecha de creación**: $(date)
**Versión**: 1.0
**Estado**: Pendiente de implementación

---

# Prompt para División del Menú Derecho Colapsable - Chat-Online

## Contexto del Proyecto
El archivo `src/Chat-Online/chat-online.html` actualmente tiene un panel derecho colapsable que contiene tanto la sección de LIA Assistant como la sección de Notas en un solo menú. Se requiere dividir este menú en dos menús separados e independientes.

## Estado Actual del Panel Derecho

### Estructura Actual:
- **Archivo principal**: `src/Chat-Online/chat-online.html`
- **Panel derecho**: `#sidebarRight` con clase `right-panel`
- **Botón de colapso**: `#collapseRight` que controla todo el panel
- **Contenido actual**: 
  - Sección LIA Assistant (`.lia-assistant-section`)
  - Sección de Notas (`.notes-section`)
  - Editor de Notas (`.notes-creator-section`)

### Funcionalidad Actual:
1. **Un solo botón de colapso** que oculta/muestra todo el panel
2. **Hover para expandir** cuando está colapsado
3. **Estado persistente** en localStorage
4. **Animaciones suaves** de entrada y salida

## Objetivo del Rediseño

### Cambios Requeridos:
1. **Dos menús separados**: Crear menús independientes para LIA y Notas
2. **Dos botones de colapso**: Botones separados cuando están colapsados
3. **Exclusividad mutua**: Solo un menú puede estar abierto a la vez
4. **Mantener funcionalidad**: Preservar todas las características existentes

### Estructura Deseada:
```
Panel Derecho Colapsado:
[Botón LIA] [Botón Notas]

Panel Derecho Expandido (LIA):
[Botón Colapsar LIA]
[Contenido LIA Assistant]

Panel Derecho Expandido (Notas):
[Botón Colapsar Notas]
[Contenido Notas + Editor]
```

## Especificaciones Técnicas

### Archivos a Modificar:
1. **`src/Chat-Online/chat-online.html`**: Modificar estructura HTML y JavaScript
2. **Posibles ajustes en CSS**: Agregar estilos para los nuevos botones

### Cambios de HTML Requeridos:

#### 1. Estructura del Panel Derecho:
```html
<!-- Panel Derecho - LIA Assistant y Notas -->
<aside class="right-panel" id="sidebarRight">
    <!-- Estado Colapsado: Dos botones separados -->
    <div class="collapsed-menu" id="collapsedMenu">
        <button class="menu-toggle-btn lia-toggle" id="liaToggleBtn" title="Abrir LIA Assistant">
            <div class="toggle-icon">
                <img src="/assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
            </div>
            <span>LIA</span>
        </button>
        
        <button class="menu-toggle-btn notes-toggle" id="notesToggleBtn" title="Abrir Notas">
            <div class="toggle-icon">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                </svg>
            </div>
            <span>Notas</span>
        </button>
    </div>
    
    <!-- Estado Expandido: Menú LIA -->
    <div class="expanded-menu lia-menu" id="liaMenu" style="display: none;">
        <button class="collapse-btn collapse-btn-left" id="collapseLia" title="Cerrar LIA">
            <span class="collapse-icon">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M11 18l6-6-6-6M5 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
        </button>
        
        <!-- Contenido LIA Assistant (mantener estructura actual) -->
        <div class="lia-assistant-section">
            <!-- ... contenido existente ... -->
        </div>
    </div>
    
    <!-- Estado Expandido: Menú Notas -->
    <div class="expanded-menu notes-menu" id="notesMenu" style="display: none;">
        <button class="collapse-btn collapse-btn-left" id="collapseNotes" title="Cerrar Notas">
            <span class="collapse-icon">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M11 18l6-6-6-6M5 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
        </button>
        
        <!-- Contenido Notas (mantener estructura actual) -->
        <div class="notes-section">
            <!-- ... contenido existente ... -->
        </div>
        
        <div class="notes-creator-section" id="notesCreatorSection" style="display: none;">
            <!-- ... contenido existente ... -->
        </div>
    </div>
</aside>
```

### Cambios de CSS Requeridos:

#### 1. Estado Colapsado:
```css
.collapsed-menu {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    height: 100%;
    justify-content: center;
    align-items: center;
}

.menu-toggle-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px;
    background: linear-gradient(135deg, rgba(0, 102, 204, 0.1), rgba(0, 102, 204, 0.05));
    border: 1px solid rgba(0, 102, 204, 0.2);
    border-radius: 12px;
    color: var(--glass-text-primary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 80px;
    text-align: center;
}

.menu-toggle-btn:hover {
    background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1));
    border-color: rgba(0, 102, 204, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 102, 204, 0.15);
}

.toggle-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-icon img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
}

.toggle-icon svg {
    width: 24px;
    height: 24px;
}

.menu-toggle-btn span {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
```

#### 2. Estado Expandido:
```css
.expanded-menu {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
}

.expanded-menu .collapse-btn {
    align-self: flex-start;
    margin: 16px 16px 0 16px;
}

.lia-menu .lia-assistant-section,
.notes-menu .notes-section,
.notes-menu .notes-creator-section {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px 16px 16px;
}
```

#### 3. Estados de Visibilidad:
```css
/* Estado inicial: colapsado */
.right-panel.collapsed .collapsed-menu {
    display: flex;
}

.right-panel.collapsed .expanded-menu {
    display: none;
}

/* Estado LIA expandido */
.right-panel.lia-expanded .collapsed-menu {
    display: none;
}

.right-panel.lia-expanded .lia-menu {
    display: flex;
}

.right-panel.lia-expanded .notes-menu {
    display: none;
}

/* Estado Notas expandido */
.right-panel.notes-expanded .collapsed-menu {
    display: none;
}

.right-panel.notes-expanded .lia-menu {
    display: none;
}

.right-panel.notes-expanded .notes-menu {
    display: flex;
}
```

### Cambios de JavaScript Requeridos:

#### 1. Variables de Estado:
```javascript
// Reemplazar la variable existente
let rightPanelPinned = false;
let currentRightMenu = 'collapsed'; // 'collapsed', 'lia', 'notes'
```

#### 2. Funciones de Control:
```javascript
// Función para mostrar menú colapsado
function showCollapsedMenu() {
    const sidebarRight = document.getElementById('sidebarRight');
    sidebarRight.className = 'right-panel collapsed';
    currentRightMenu = 'collapsed';
    localStorage.setItem('rightPanelState', 'collapsed');
}

// Función para mostrar menú LIA
function showLiaMenu() {
    const sidebarRight = document.getElementById('sidebarRight');
    sidebarRight.className = 'right-panel lia-expanded';
    currentRightMenu = 'lia';
    localStorage.setItem('rightPanelState', 'lia');
    
    // Animar entrada del contenido
    setTimeout(() => {
        const liaSection = document.querySelector('.lia-assistant-section');
        if (liaSection) {
            liaSection.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)';
            liaSection.style.opacity = '1';
            liaSection.style.transform = 'translateX(0)';
        }
    }, 50);
}

// Función para mostrar menú Notas
function showNotesMenu() {
    const sidebarRight = document.getElementById('sidebarRight');
    sidebarRight.className = 'right-panel notes-expanded';
    currentRightMenu = 'notes';
    localStorage.setItem('rightPanelState', 'notes');
    
    // Animar entrada del contenido
    setTimeout(() => {
        const notesSection = document.querySelector('.notes-section');
        if (notesSection) {
            notesSection.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)';
            notesSection.style.opacity = '1';
            notesSection.style.transform = 'translateX(0)';
        }
    }, 50);
}
```

#### 3. Event Listeners:
```javascript
// Event listeners para los botones de toggle
document.addEventListener('DOMContentLoaded', function() {
    const liaToggleBtn = document.getElementById('liaToggleBtn');
    const notesToggleBtn = document.getElementById('notesToggleBtn');
    const collapseLia = document.getElementById('collapseLia');
    const collapseNotes = document.getElementById('collapseNotes');
    
    // Botón para abrir LIA
    if (liaToggleBtn) {
        liaToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLiaMenu();
        });
    }
    
    // Botón para abrir Notas
    if (notesToggleBtn) {
        notesToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotesMenu();
        });
    }
    
    // Botón para cerrar LIA
    if (collapseLia) {
        collapseLia.addEventListener('click', function(e) {
            e.preventDefault();
            showCollapsedMenu();
        });
    }
    
    // Botón para cerrar Notas
    if (collapseNotes) {
        collapseNotes.addEventListener('click', function(e) {
            e.preventDefault();
            showCollapsedMenu();
        });
    }
    
    // Restaurar estado desde localStorage
    const savedState = localStorage.getItem('rightPanelState') || 'collapsed';
    if (savedState === 'lia') {
        showLiaMenu();
    } else if (savedState === 'notes') {
        showNotesMenu();
    } else {
        showCollapsedMenu();
    }
});
```

## Consideraciones de Diseño

### Responsive Design:
- **Desktop**: Botones de toggle apilados verticalmente en estado colapsado
- **Tablet**: Mantener estructura pero ajustar tamaños
- **Mobile**: Considerar botones más grandes para mejor usabilidad

### Animaciones:
- **Transición suave** entre estados
- **Animación de entrada** del contenido al expandir
- **Animación de salida** del contenido al colapsar
- **Hover effects** en los botones de toggle

### Accesibilidad:
- **Tooltips descriptivos** en todos los botones
- **Navegación por teclado** funcional
- **Estados de foco** visibles
- **Lectores de pantalla** compatibles

## Funcionalidad a Preservar

1. **Sistema de notas**: Crear, editar, buscar y eliminar notas
2. **Chat con LIA**: Envío y recepción de mensajes
3. **Estado persistente**: Recordar qué menú estaba abierto
4. **Animaciones**: Transiciones suaves entre estados
5. **Responsive**: Funcionamiento en todos los dispositivos

## Instrucciones de Implementación

### Paso 1: Backup
- Crear copia de seguridad del archivo `chat-online.html`

### Paso 2: Modificar HTML
- Reemplazar la estructura del panel derecho
- Mantener todo el contenido existente de LIA y Notas
- Agregar los nuevos botones de toggle

### Paso 3: Actualizar CSS
- Agregar estilos para los nuevos estados
- Mantener estilos existentes para el contenido
- Asegurar transiciones suaves

### Paso 4: Modificar JavaScript
- Reemplazar la lógica de colapso existente
- Implementar las nuevas funciones de control
- Actualizar event listeners

### Paso 5: Testing
- Verificar transiciones entre estados
- Probar funcionalidad de LIA y Notas
- Validar responsive design
- Confirmar persistencia de estado

### Paso 6: Ajustes Finales
- Refinar animaciones
- Optimizar para diferentes resoluciones
- Asegurar accesibilidad

## Notas Importantes

1. **Preservar funcionalidad existente**: No romper ninguna característica actual
2. **Mantener compatibilidad**: Asegurar que funcione en todos los dispositivos
3. **Performance**: No agregar elementos que afecten la velocidad
4. **Accesibilidad**: Mantener navegación por teclado y lectores de pantalla
5. **Consistencia**: Asegurar que el diseño sea coherente con el resto de la aplicación

## Resultado Esperado

Un sistema de menús que:
- Permite alternar entre LIA y Notas de forma independiente
- Mantiene un estado colapsado con dos botones de acceso
- Preserva toda la funcionalidad existente
- Es responsive y accesible
- Tiene transiciones suaves y profesionales
- Recuerda el último estado seleccionado

---

**Fecha de creación**: $(date)
**Versión**: 1.0
**Estado**: Pendiente de implementación