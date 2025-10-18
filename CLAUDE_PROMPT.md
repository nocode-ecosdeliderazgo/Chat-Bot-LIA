# Prompt para Claude: Análisis y Unificación de Navbar con Funcionalidad Sticky

## Objetivo
Analizar profundamente la navbar de `notices.html` y unificar todas las navbars de las páginas principales del proyecto para mantener consistencia visual y funcional, implementando una solución global que preserve la funcionalidad sticky/fixed.

## Tarea Paso a Paso

### PASO 1: Análisis Profundo de la Navbar de notices.html

**Analiza detalladamente la navbar de `src/Notices/notices.html` (líneas 23-72) y documenta:**

#### 1.1 Estructura HTML
- **Elementos principales**: Identifica cada componente de la navbar
- **Jerarquía**: Documenta la estructura de anidación
- **Atributos**: Analiza todos los atributos (class, id, data-*, onclick, etc.)
- **Iconografía**: Documenta los iconos utilizados (BoxIcons)
- **Rutas**: Analiza las rutas de navegación y referencias

#### 1.2 Funcionalidad
- **Navegación**: Cómo funciona el sistema de pestañas
- **Estado activo**: Cómo se maneja la pestaña activa
- **Perfil**: Funcionalidad del botón de perfil y menú desplegable
- **Tema**: Sistema de cambio de tema
- **Interactividad**: Eventos y comportamientos

#### 1.3 Estilos Visuales
- **Clases CSS**: Identifica todas las clases utilizadas
- **Layout**: Estructura visual y posicionamiento
- **Funcionalidad Sticky/Fixed**: Analiza cómo se mantiene fija la navbar
- **Z-index y posicionamiento**: Documenta los valores de position, top, z-index
- **Responsive**: Comportamiento en diferentes tamaños
- **Estados**: Estilos para hover, active, etc.

### PASO 2: Análisis de Impacto en Layout

**ANTES de eliminar, analiza el impacto visual:**

#### 2.1 Verificación de Layout
- **Identifica** si las navbars actuales son `position: fixed` o `position: sticky`
- **Documenta** el espacio que ocupan las navbars (height, padding, margin)
- **Verifica** si el contenido principal tiene `padding-top` o `margin-top` para compensar la navbar fija
- **Identifica** posibles problemas de solapamiento o espacios en blanco

#### 2.2 Páginas a Analizar
- `community.html` - Verificar si la navbar es fija y cómo afecta el layout
- `cursos.html` - Verificar si la navbar es fija y cómo afecta el layout  
- `apps-directory.html` - Verificar si la navbar es fija y cómo afecta el layout

### PASO 3: Eliminación Segura de Navbars Existentes

**Elimina completamente las navbars de estas páginas CON PRECAUCIÓN:**

#### 3.1 community.html
- **PRECAUCIÓN**: Verificar que el contenido principal no se vea afectado
- Eliminar el elemento `<div class="course-tabs">` (líneas 257-275)
- Eliminar el botón `<button class="header-profile">` (líneas 276-278)
- Eliminar el menú `<div id="profileMenu" class="profile-menu">` (líneas 279-306)
- **Verificar**: Que no queden espacios en blanco o solapamientos

#### 3.2 cursos.html
- **PRECAUCIÓN**: Verificar que el contenido principal no se vea afectado
- Eliminar el elemento `<div class="course-tabs">` (líneas 38-55)
- Eliminar el botón `<button class="header-profile">` (líneas 59-61)
- Eliminar el menú `<div id="profileMenu" class="profile-menu">` (líneas 62-87)
- **Verificar**: Que no queden espacios en blanco o solapamientos

#### 3.3 apps-directory.html
- **PRECAUCIÓN**: Verificar que el contenido principal no se vea afectado
- Eliminar el elemento `<div class="course-tabs">` (líneas 45-62)
- Eliminar el botón `<button class="header-profile">` (líneas 66-68)
- Eliminar el menú `<div id="profileMenu" class="profile-menu">` (líneas 69-95)
- **Verificar**: Que no queden espacios en blanco o solapamientos

#### 3.4 notices.html
- **PRECAUCIÓN**: Verificar que el contenido principal no se vea afectado
- Eliminar el elemento `<div class="course-tabs">` (líneas 23-41)
- Eliminar el botón `<button class="header-profile">` (líneas 42-44)
- Eliminar el menú `<div id="profileMenu" class="profile-menu">` (líneas 45-72)
- **Verificar**: Que no queden espacios en blanco o solapamientos

### PASO 4: Creación del Componente Navbar Global

**Crea un archivo `navbar-global.js` con la funcionalidad sticky preservada:**

#### 4.1 Estructura del Componente
```javascript
// navbar-global.js
const NavbarGlobal = {
    // Configuración de rutas base por página
    basePaths: {
        'community': '../',
        'cursos': '',
        'apps-directory': '',
        'notices': '../'
    },
    
    // Generar navbar con funcionalidad sticky
    create: function(activeTab, currentPage) {
        const basePath = this.basePaths[currentPage] || '../';
        
        return `
            <!-- Navigation Bar con funcionalidad sticky -->
            <div class="course-tabs">
                <button class="tab-button ${activeTab === 'cursos' ? 'active' : ''}" 
                        data-tab="mis-cursos" 
                        onclick="location.href='${basePath}cursos.html'">
                    <i class='bx bx-collection'></i>
                    Talleres
                </button>
                <button class="tab-button ${activeTab === 'directorio' ? 'active' : ''}" 
                        data-tab="directorio" 
                        onclick="location.href='${basePath}apps-directory.html'">
                    <i class='bx bx-grid-alt'></i>
                    Directorio IA
                </button>
                <button class="tab-button ${activeTab === 'comunidad' ? 'active' : ''}" 
                        data-tab="comunidad" 
                        onclick="location.href='${basePath}Community/community.html'">
                    <i class='bx bx-group'></i>
                    Comunidad
                </button>
                <button class="tab-button ${activeTab === 'noticias' ? 'active' : ''}" 
                        data-tab="noticias" 
                        onclick="location.href='${basePath}Notices/notices.html'">
                    <i class='bx bx-news'></i>
                    Noticias
                </button>
            </div>
            
            <!-- Botón de perfil -->
            <button class="header-profile">
                <img id="headerProfileImg" src="${basePath}assets/images/default-avatar.svg" alt="Perfil" 
                     onerror="this.onerror=null; this.src='${basePath}assets/images/default-avatar.svg';" />
            </button>
            
            <!-- Menú de perfil completo -->
            <div id="profileMenu" class="profile-menu">
                <div class="pm-header">
                    <div class="pm-avatar">
                        <img id="menuProfileImg" src="${basePath}assets/images/default-avatar.svg" alt="Perfil" 
                             onerror="this.onerror=null; this.src='${basePath}assets/images/default-avatar.svg';"/>
                    </div>
                    <div>
                        <div class="pm-name" id="pmName">Usuario</div>
                        <div class="pm-email" id="pmEmail">user@example.com</div>
                    </div>
                </div>
                <div class="pm-section">
                    <div class="pm-item" onclick="location.href='${basePath}estadisticas.html'">
                        <i class='bx bx-bar-chart-alt-2'></i> Mis Estadísticas
                    </div>
                    <div class="pm-item" onclick="location.href='${basePath}courses.html'">
                        <i class='bx bx-book'></i> Mi aprendizaje
                    </div>
                </div>
                <div class="pm-section">
                    <div class="pm-item" onclick="location.href='${basePath}profile.html'">
                        <i class='bx bx-user'></i> Editar perfil
                    </div>
                </div>
                <div class="pm-section">
                    <div class="pm-item" id="themeToggle" onclick="toggleTheme()">
                        <div class="theme-icon-container">
                            <i class='bx bx-sun theme-icon-sun'></i>
                            <i class='bx bx-moon theme-icon-moon'></i>
                        </div>
                        Cambiar tema
                    </div>
                </div>
                <div class="pm-section">
                    <div class="pm-item" onclick="location.href='${basePath}index.html'">
                        <i class='bx bx-log-out'></i> Cerrar sesión
                    </div>
                </div>
            </div>
        `;
    },
    
    // Inicializar navbar en una página específica
    init: function(activeTab, currentPage) {
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.innerHTML = this.create(activeTab, currentPage);
        }
    }
};
```

### PASO 5: Implementación de Navbar Global en las Páginas

**Implementa el sistema global en las tres páginas objetivo:**

#### 5.1 Modificaciones en community.html
- **Agregar contenedor**: Insertar `<div id="navbar-container"></div>` después de la línea 255
- **Incluir script**: Agregar `<script src="../scripts/navbar-global.js"></script>` antes del cierre de `</body>`
- **Inicializar**: Agregar script de inicialización:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    NavbarGlobal.init('comunidad', 'community');
});
```

#### 5.2 Modificaciones en cursos.html
- **Agregar contenedor**: Insertar `<div id="navbar-container"></div>` después de la línea 33
- **Incluir script**: Agregar `<script src="scripts/navbar-global.js"></script>` antes del cierre de `</body>`
- **Inicializar**: Agregar script de inicialización:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    NavbarGlobal.init('cursos', 'cursos');
});
```

#### 5.3 Modificaciones en apps-directory.html
- **Agregar contenedor**: Insertar `<div id="navbar-container"></div>` después de la línea 40
- **Incluir script**: Agregar `<script src="scripts/navbar-global.js"></script>` antes del cierre de `</body>`
- **Inicializar**: Agregar script de inicialización:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    NavbarGlobal.init('directorio', 'apps-directory');
});
```

#### 5.4 Modificaciones en notices.html
- **Agregar contenedor**: Insertar `<div id="navbar-container"></div>` después de la línea 22
- **Incluir script**: Agregar `<script src="../scripts/navbar-global.js"></script>` antes del cierre de `</body>`
- **Inicializar**: Agregar script de inicialización:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    NavbarGlobal.init('noticias', 'notices');
});
```

### PASO 6: Verificación de Funcionalidad Sticky

**Verificar que la funcionalidad sticky se mantenga:**

#### 6.1 Verificación de Estilos CSS
- **Confirmar** que las clases `.course-tabs` mantengan `position: fixed` o `position: sticky`
- **Verificar** que el `z-index` sea suficiente para mantenerse sobre el contenido
- **Comprobar** que el `top: 0` esté aplicado correctamente

#### 6.2 Verificación de Layout
- **Confirmar** que el contenido principal no se solape con la navbar
- **Verificar** que no haya espacios en blanco inesperados
- **Comprobar** que el scroll funcione correctamente

#### 6.3 Pruebas de Funcionalidad
- **Probar** que la navbar se mantenga fija al hacer scroll
- **Verificar** que los enlaces de navegación funcionen
- **Comprobar** que el menú de perfil se abra y cierre correctamente
- **Verificar** que el sistema de cambio de tema funcione

### PASO 7: Verificación y Validación Final

#### 7.1 Verificación de Rutas
- Comprobar que todas las rutas de navegación funcionen correctamente
- Verificar que las rutas de imágenes y recursos sean correctas
- Asegurar que los enlaces del menú de perfil apunten a las páginas correctas

#### 7.2 Verificación de Funcionalidad
- Confirmar que el sistema de pestañas activas funcione
- Verificar que el menú de perfil se abra y cierre correctamente
- Comprobar que el sistema de cambio de tema funcione
- **CRÍTICO**: Verificar que la funcionalidad sticky se mantenga

#### 7.3 Verificación Visual
- Asegurar que la navbar se vea idéntica en todas las páginas
- Verificar que los estilos se apliquen correctamente
- Comprobar que la responsividad funcione
- **CRÍTICO**: Confirmar que no haya problemas de layout tras la eliminación

## Criterios de Éxito

1. **Consistencia Visual**: Todas las navbars deben verse idénticas
2. **Funcionalidad Completa**: Todas las características deben funcionar
3. **Navegación Correcta**: Los enlaces deben llevar a las páginas correctas
4. **Pestaña Activa**: Cada página debe mostrar su pestaña como activa
5. **Rutas Correctas**: Todas las rutas deben ser válidas según la estructura del proyecto
6. **Funcionalidad Sticky**: La navbar debe mantenerse fija al hacer scroll
7. **Layout Preservado**: No debe haber problemas visuales tras la eliminación
8. **Sistema Global**: El componente debe ser reutilizable y mantenible

## Notas Importantes

- **Preservar**: Mantener toda la funcionalidad existente de cada página
- **No Duplicar**: Evitar duplicar elementos o funcionalidades
- **Orden**: Mantener el orden lógico de los elementos
- **Compatibilidad**: Asegurar que los scripts existentes sigan funcionando
- **Estilos**: Verificar que los estilos CSS existentes no se vean afectados
- **Funcionalidad Sticky**: CRÍTICO - La navbar debe mantenerse fija al hacer scroll
- **Layout**: CRÍTICO - No debe haber problemas visuales tras eliminar navbars existentes
- **Rutas**: Ajustar correctamente las rutas según la ubicación de cada página

## Archivos a Modificar

1. `src/Notices/notices.html` (actualizar para usar sistema global)
2. `src/Community/community.html`
3. `src/cursos.html`
4. `src/apps-directory.html`
5. `src/scripts/navbar-global.js` (NUEVO - crear)

## Archivo de Referencia

- `src/Notices/notices.html` (líneas 23-72) - Navbar modelo a implementar

## Flujo de Implementación Recomendado

1. **Crear** `navbar-global.js` primero
2. **Analizar** el impacto en layout de cada página (4 páginas)
3. **Eliminar** navbars existentes una por una (4 páginas)
4. **Implementar** el sistema global en cada página (4 páginas)
5. **Verificar** funcionalidad sticky en cada página
6. **Probar** navegación entre páginas
7. **Validar** que no haya problemas visuales
