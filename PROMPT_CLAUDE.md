# PROMPT PARA CLAUDE - ANÁLISIS Y REDISEÑO DE NAVBAR

## CONTEXTO
Necesito que analices las características de la navbar de `community.css` y `community.html` para luego rediseñar completamente la navbar de `apps-directory.css` y `apps-directory.html` con una estética exactamente igual, sin afectar el funcionamiento.

## ANÁLISIS DETALLADO DE LA NAVBAR DE COMMUNITY

### 1. ESTRUCTURA HTML
```html
<!-- Navigation Bar -->
<div class="course-tabs">
    <button class="tab-button" onclick="location.href='../cursos.html'">
        <i class='bx bx-collection'></i>
        Talleres
    </button>
    <button class="tab-button" onclick="location.href='../apps-directory.html'">
        <i class='bx bx-grid-alt'></i>
        Directorio IA
    </button>
    <button class="tab-button active">
        <i class='bx bx-group'></i>
        Comunidad
    </button>
    <button class="tab-button" onclick="location.href='../Notices/notices.html'">
        <i class='bx bx-news'></i>
        Noticias
    </button>
</div>
<button class="header-profile">
    <img src="../assets/images/icono.png" alt="Perfil" />
</button>
```

### 2. CARACTERÍSTICAS DEL CONTENEDOR `.course-tabs`

#### Posicionamiento y Layout:
- `display: flex`
- `background: rgba(255, 255, 255, 0.04)` - Fondo semi-transparente
- `backdrop-filter: blur(10px)` y `backdrop-filter: blur(20px)` - Efecto de desenfoque
- `border-radius: 20px` - Bordes redondeados
- `padding: 12px` - Espaciado interno
- `gap: 10px` - Espacio entre botones
- `overflow-x: auto` - Scroll horizontal si es necesario
- `border: 1px solid rgba(68, 229, 255, 0.18)` - Borde turquesa sutil
- `box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35)` - Sombra profunda
- `position: relative`
- `margin: 20px auto` - Centrado con margen superior
- `width: min(600px, 90vw)` - Ancho responsivo
- `scrollbar-width: none` y `-ms-overflow-style: none` - Ocultar scrollbar

#### Responsive:
- En móvil: `margin: 10px auto`, `padding: 6px`, `gap: 4px`, `width: min(430px, 92vw)`

### 3. CARACTERÍSTICAS DE LOS BOTONES `.tab-button`

#### Estructura Base:
- `display: flex`
- `align-items: center`
- `justify-content: center`
- `gap: 10px` - Espacio entre icono y texto
- `padding: 16px 24px` - Espaciado interno generoso
- `background: rgba(68, 229, 255, 0.03)` - Fondo turquesa muy sutil
- `border: 1px solid rgba(68, 229, 255, 0.08)` - Borde turquesa sutil
- `border-radius: 16px` - Bordes redondeados
- `color: var(--text-secondary)` - Color de texto secundario
- `font-family: var(--font-primary)` - Fuente Montserrat
- `font-weight: 600` - Peso de fuente semi-bold
- `font-size: 0.95rem` - Tamaño de fuente
- `cursor: pointer`
- `transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)` - Transición suave
- `position: relative`
- `overflow: hidden`

#### Efecto de Relleno Deslizante (::before):
- `content: ''`
- `position: absolute`
- `top: 0`
- `left: -100%`
- `width: 100%`
- `height: 100%`
- `background: linear-gradient(90deg, transparent, rgba(68, 229, 255, 0.1), transparent)`
- `transition: left 0.5s`

#### Estados Hover:
- `background: rgba(68, 229, 255, 0.08)`
- `border-color: rgba(68, 229, 255, 0.15)`
- `color: var(--text-primary)`
- `box-shadow: 0 8px 25px rgba(68, 229, 255, 0.15), 0 0 0 1px rgba(68, 229, 255, 0.15)`
- `transform: translateY(-2px)` - Elevación sutil

#### Estado Active:
- `background: linear-gradient(135deg, rgba(68, 229, 255, 0.2) 0%, rgba(68, 229, 255, 0.1) 100%)`
- `border-color: rgba(68, 229, 255, 0.25)`
- `color: var(--text-primary)`
- `box-shadow: 0 8px 25px rgba(68, 229, 255, 0.25), 0 0 0 1px rgba(68, 229, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)`
- `transform: translateY(-2px)`

#### Iconos:
- `font-size: 18px`
- `transition: transform 0.3s ease`
- En hover: `transform: scale(1.1)`
- En active: `transform: scale(1.1)` y `color: var(--primary-color)`

#### Responsive:
- En móvil: `padding: 10px 16px`, `font-size: 0.85rem`, `gap: 8px`
- Iconos: `font-size: 18px`

### 4. CARACTERÍSTICAS DEL BOTÓN DE PERFIL `.header-profile`

#### Posicionamiento:
- `position: fixed !important`
- `top: 12px !important`
- `right: 16px !important`
- `left: auto !important`
- `z-index: 1001`

#### Dimensiones y Estilo:
- `width: 56px`
- `height: 56px`
- `border-radius: 50%` - Circular
- `overflow: hidden`
- `border: 2px solid rgba(68,229,255,.55)` - Borde turquesa más visible
- `padding: 0`
- `background: rgba(7,17,36,.5)` - Fondo oscuro semi-transparente
- `cursor: pointer`
- `display: block`
- `transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`

#### Efecto de Relleno Deslizante (::before):
- `content: ''`
- `position: absolute`
- `top: 0`
- `left: -100%`
- `width: 100%`
- `height: 100%`
- `background: rgba(68,229,255,.15)`
- `transition: left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- `z-index: -1`
- `border-radius: 50%`

#### Estados:
- **Hover**: `border-color: var(--turq)`, `transform: scale(1.05)`, `box-shadow: 0 6px 20px rgba(68,229,255,.3)`
- **Active**: `transform: translateY(-1px) scale(0.98)`, `transition: all 0.1s ease`
- **Focus**: `outline: none`, `box-shadow: 0 0 0 3px rgba(68, 229, 255, 0.3), 0 8px 25px rgba(68, 229, 255, 0.4)`

#### Imagen:
- `width: 100%`
- `height: 100%`
- `object-fit: cover`
- `display: block`

#### Mejora Específica para bg-glow-global:
- `box-shadow: 0 0 0 3px rgba(68,229,255,.22), 0 10px 24px rgba(0,0,0,.45)`

### 5. TEMA CLARO (data-theme="light")

#### Contenedor course-tabs:
- `background: rgba(255, 255, 255, 0.95) !important`
- `border: 1px solid rgba(0, 102, 204, 0.15) !important`
- `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important`

#### Botones tab-button:
- **Base**: `color: #4A5568 !important`, `background: transparent !important`
- **Hover**: `background: rgba(0, 102, 204, 0.1) !important`, `color: #0066CC !important`
- **Active**: `background: #0066CC !important`, `color: white !important`, `box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3) !important`

### 6. VARIABLES CSS UTILIZADAS

```css
:root {
    --turq: #44e5ff;
    --turq-2: #3dd4eb;
    --text-primary: #FFFFFF;
    --text-secondary: #CCCCCC;
    --font-primary: 'Montserrat', sans-serif;
    --font-body: Inter, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial;
}
```

## INSTRUCCIONES PARA EL REDISEÑO

1. **Copiar exactamente** todos los estilos de `.course-tabs`, `.tab-button`, y `.header-profile` de community.css
2. **Mantener** la funcionalidad existente de apps-directory.html
3. **Aplicar** todos los efectos de hover, active, y transiciones
4. **Incluir** soporte completo para tema claro y oscuro
5. **Asegurar** que el responsive funcione correctamente
6. **Preservar** la estructura HTML existente pero aplicar los nuevos estilos

## RESULTADO ESPERADO
La navbar de apps-directory debe verse y comportarse exactamente igual que la de community, con los mismos efectos visuales, animaciones, colores, y responsividad.
