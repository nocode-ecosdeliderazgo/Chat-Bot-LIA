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
