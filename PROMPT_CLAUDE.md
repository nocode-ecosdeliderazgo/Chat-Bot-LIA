# PROMPT PARA INTEGRAR MODO CLARO EN PÁGINA DE NOTICIAS

## CONTEXTO
Necesito integrar un modo claro en la página de noticias (`src/Notices/notices.html` y `src/Notices/notices.css`) tomando como referencia la implementación existente en otras páginas como `community.html` y `cursos.html`. La página de noticias actualmente solo tiene modo oscuro y necesita mantener la misma estructura de tarjetas, imágenes y navbar.

## ANÁLISIS DE LA IMPLEMENTACIÓN ACTUAL

### Estructura de la página de noticias:
- **HTML**: `src/Notices/notices.html` - Página completa con navbar, hero section, secciones de noticias destacadas, categorías, últimas noticias y newsletter
- **CSS**: `src/Notices/notices.css` - Estilos completos con variables CSS, glassmorphism, partículas de fondo
- **Elementos clave**: 
  - Navbar con pestañas (course-tabs)
  - Perfil de usuario (header-profile, profile-menu)
  - Hero section con estadísticas
  - Tarjetas de noticias destacadas (featured-card)
  - Categorías (category-card)
  - Grid de noticias (news-item)
  - Newsletter section
  - Overlays de búsqueda y loading

### Implementación de tema en otras páginas:
- **Sistema de variables**: Uso de `[data-theme="light"]` y `[data-theme="dark"]` para definir estilos
- **Colores del modo claro**:
  - `--text-primary: #2D3748` (texto principal)
  - `--text-secondary: rgba(45, 55, 72, 0.8)` (texto secundario)
  - `--text-muted: rgba(45, 55, 72, 0.6)` (texto atenuado)
  - `--bg-primary: #E6F3FF` (fondo principal)
  - `--bg-secondary: #D4E6F1` (fondo secundario)
  - `--card-bg: rgba(255,255,255,.85)` (fondo de tarjetas)
  - `--card-border: rgba(68,229,255,.15)` (bordes de tarjetas)
- **Scripts necesarios**: `theme-manager.js`, `theme-toggle.js`, `global-theme-setup.js`

## TAREAS A REALIZAR

### 1. MODIFICAR `notices.html`
- [ ] Agregar el botón de toggle de tema en el menú de perfil (igual que en community.html)
- [ ] Incluir los scripts necesarios para el manejo de temas
- [ ] Asegurar que el HTML tenga la estructura correcta para el sistema de temas

### 2. MODIFICAR `notices.css`
- [ ] Agregar variables CSS para modo claro siguiendo el patrón de otras páginas
- [ ] Implementar estilos específicos para `[data-theme="light"]` para todos los elementos:
  - **Fondo general**: Cambiar gradiente de fondo oscuro a claro
  - **Navbar (course-tabs)**: Fondo blanco con bordes azules
  - **Perfil de usuario**: Menú con fondo blanco y texto oscuro
  - **Hero section**: Fondo claro con texto oscuro
  - **Tarjetas de noticias**: Fondo blanco con bordes sutiles
  - **Categorías**: Mismo estilo de tarjetas claras
  - **Newsletter**: Fondo claro con formulario visible
  - **Overlays**: Búsqueda y loading con fondos claros
  - **Partículas**: Reducir opacidad en modo claro

### 3. ELEMENTOS ESPECÍFICOS A ADAPTAR

#### Navbar y navegación:
```css
[data-theme="light"] .course-tabs {
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(0, 102, 204, 0.15) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}
```

#### Tarjetas de noticias:
```css
[data-theme="light"] .featured-card,
[data-theme="light"] .category-card,
[data-theme="light"] .news-item {
    background: rgba(255, 255, 255, 0.85) !important;
    border: 1px solid rgba(68, 229, 255, 0.15) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
}
```

#### Títulos y texto:
```css
[data-theme="light"] .hero-title,
[data-theme="light"] .section-title {
    color: #2D3748 !important;
    background: linear-gradient(135deg, #0066CC, #0052A3) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
}
```

### 4. CONSIDERACIONES TÉCNICAS
- **Especificidad CSS**: Usar `!important` donde sea necesario para sobrescribir estilos existentes
- **Transiciones**: Mantener las transiciones suaves entre temas
- **Consistencia**: Seguir exactamente el patrón de colores y estilos de las otras páginas
- **Responsive**: Asegurar que el modo claro funcione en todas las resoluciones
- **Accesibilidad**: Mantener contraste adecuado en modo claro

### 5. ESTRUCTURA DE IMPLEMENTACIÓN
1. **Variables CSS**: Definir todas las variables para modo claro al inicio del archivo
2. **Estilos base**: Aplicar estilos generales (body, fondo, partículas)
3. **Componentes**: Estilos específicos para cada componente (navbar, tarjetas, etc.)
4. **Estados**: Hover, active, focus para modo claro
5. **Responsive**: Media queries para modo claro

## RESULTADO ESPERADO
Una página de noticias que mantenga exactamente la misma estructura y funcionalidad, pero con un modo claro que sea consistente con el resto de la aplicación, permitiendo a los usuarios alternar entre modo oscuro y claro usando el botón en el menú de perfil.

## ARCHIVOS A MODIFICAR
- `src/Notices/notices.html` - Agregar botón de tema y scripts
- `src/Notices/notices.css` - Implementar estilos de modo claro

## REFERENCIAS
- `src/Community/community.css` - Líneas 2706-3500+ (implementación completa de modo claro)
- `src/styles/cursos.css` - Líneas 21-100 (variables y estilos de modo claro)
- `src/Community/community.html` - Líneas 62-66 (botón de toggle de tema)
