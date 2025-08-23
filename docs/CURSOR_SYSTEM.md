# 🖱️ Sistema de Cursor Personalizado

## 📋 **Descripción**

Se ha implementado un sistema completo de cursor personalizado que reemplaza el cursor por defecto del navegador con un diseño moderno y efectos interactivos que se adaptan al tema claro/oscuro.

## ✨ **Características**

### **🎨 Diseño del Cursor**
- **Cursor Principal**: Círculo con borde y punto interno
- **Colores**: Se adaptan automáticamente al tema (claro/oscuro)
- **Tamaño**: Configurable (20px por defecto)
- **Efectos**: Múltiples estados y animaciones

### **🔄 Estados del Cursor**
- **Normal**: Círculo con punto interno
- **Hover**: Escala y cambio de color
- **Click**: Escala reducida y color rojo
- **Botones**: Verde con sombra
- **Enlaces**: Amarillo con escala
- **Texto**: Línea vertical parpadeante
- **Arrastrable**: Rojo con escala grande

### **🌟 Efectos Especiales**
- **Partículas**: Efecto de pulso alrededor del cursor
- **Trail**: Rastro al mover el cursor
- **Magnético**: Transiciones suaves
- **Glassmorphism**: Se adapta al diseño del proyecto

## 🎯 **Implementación**

### **1. Archivos CSS**

**Archivo:** `src/styles/cursor.css`

```css
/* Cursor principal personalizado */
.custom-cursor {
    width: 20px;
    height: 20px;
    background: var(--course-primary);
    border: 2px solid var(--course-secondary);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    transition: all 0.1s ease;
    mix-blend-mode: difference;
    opacity: 0.8;
}

/* Cursor secundario (punto interno) */
.cursor-dot {
    width: 4px;
    height: 4px;
    background: var(--course-secondary);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 10000;
    transition: all 0.15s ease;
}
```

### **2. Archivo JavaScript**

**Archivo:** `src/scripts/cursor-manager.js`

```javascript
class CustomCursor {
    constructor() {
        this.cursor = null;
        this.cursorDot = null;
        this.isVisible = false;
        this.isMobile = this.checkMobile();
        
        this.init();
    }

    init() {
        if (this.isMobile) return; // No mostrar en móviles
        this.createCursor();
        this.bindEvents();
        this.hideDefaultCursor();
    }
}
```

### **3. Integración en HTML**

**En el `<head>`:**
```html
<link rel="stylesheet" href="styles/cursor.css">
```

**Al final del `<body>`:**
```html
<script src="scripts/cursor-manager.js"></script>
```

## 🎨 **Estados y Efectos**

### **Cursor Normal**
- Círculo con borde
- Punto interno
- Opacidad 0.8
- Transiciones suaves

### **Cursor Hover**
```css
.cursor-hover {
    transform: scale(1.5);
    background: var(--course-secondary);
    border-color: var(--course-primary);
    opacity: 0.9;
}
```

### **Cursor Click**
```css
.cursor-click {
    transform: scale(0.8);
    background: var(--course-error);
    border-color: var(--course-error);
}
```

### **Cursor para Botones**
```css
.cursor-button {
    transform: scale(1.2);
    background: var(--course-success);
    border-color: var(--course-success);
    box-shadow: 0 0 10px var(--course-success);
}
```

### **Cursor para Enlaces**
```css
.cursor-link {
    transform: scale(1.3);
    background: var(--course-warning);
    border-color: var(--course-warning);
}
```

### **Cursor para Texto**
```css
.cursor-text {
    width: 2px;
    height: 20px;
    background: var(--course-primary);
    border: none;
    border-radius: 0;
    animation: cursorBlink 1s infinite;
}
```

## 🔧 **Uso**

### **Para el Usuario:**
1. El cursor se activa automáticamente en desktop
2. Se adapta automáticamente al tema
3. Diferentes efectos según el tipo de elemento
4. Se oculta automáticamente en móviles

### **Para Desarrolladores:**

**Agregar a una nueva página:**
```html
<!-- En el head -->
<link rel="stylesheet" href="styles/cursor.css">

<!-- Al final del body -->
<script src="scripts/cursor-manager.js"></script>
```

**Control programático:**
```javascript
// Activar efectos
window.customCursor.enableParticleEffect();
window.customCursor.enableTrailEffect();
window.customCursor.enableMagneticEffect();

// Desactivar efectos
window.customCursor.disableParticleEffect();
window.customCursor.disableTrailEffect();
window.customCursor.disableMagneticEffect();

// Cambiar tamaño
window.customCursor.setSize(30);

// Cambiar color
window.customCursor.setColor('#ff0000');
```

## 🧪 **Pruebas**

### **Página de Test:**
- **Archivo:** `test-cursor.html`
- **Uso:** Abrir en el navegador para probar todos los efectos

### **Verificación:**
1. ✅ El cursor aparece en desktop
2. ✅ Se oculta en móviles
3. ✅ Efectos específicos por elemento
4. ✅ Adaptación al tema
5. ✅ Animaciones suaves
6. ✅ Control programático funciona

## 📱 **Responsive**

El sistema de cursor es completamente responsive:
- ✅ **Desktop**: Cursor personalizado completo
- ✅ **Tablet**: Cursor personalizado (si no es táctil)
- ✅ **Mobile**: Se oculta automáticamente
- ✅ **Táctil**: Se oculta automáticamente

## 🎨 **Adaptación al Tema**

### **Modo Oscuro:**
```css
[data-theme="dark"] .custom-cursor {
    background: var(--course-primary);
    border-color: var(--course-secondary);
    box-shadow: 0 0 10px rgba(68, 229, 255, 0.5);
}
```

### **Modo Claro:**
```css
[data-theme="light"] .custom-cursor {
    background: var(--course-secondary);
    border-color: var(--course-primary);
    box-shadow: 0 0 10px rgba(68, 229, 255, 0.3);
}
```

## 🔮 **Futuras Mejoras**

### **Posibles Extensiones:**
- 🎯 Cursor con animaciones más complejas
- 🌈 Cursor con gradientes personalizados
- 🎨 Cursor con formas personalizadas
- 🔧 Panel de configuración del cursor
- 📊 Analytics de interacción del cursor

## 🐛 **Solución de Problemas**

### **El cursor no aparece:**
1. Verificar que `cursor-manager.js` esté incluido
2. Verificar que `cursor.css` esté incluido
3. Revisar la consola del navegador para errores
4. Verificar que no esté en un dispositivo móvil

### **Los efectos no funcionan:**
1. Verificar que los elementos tengan las clases correctas
2. Asegurar que los eventos estén bien vinculados
3. Verificar que no haya conflictos con otros scripts

### **El cursor no se adapta al tema:**
1. Verificar que el tema esté correctamente aplicado
2. Asegurar que las variables CSS estén definidas
3. Verificar que los selectores CSS sean correctos

## 📞 **Soporte**

Para problemas o mejoras:
1. Revisar la documentación
2. Probar con `test-cursor.html`
3. Verificar la consola del navegador
4. Comprobar la detección de dispositivo

## 🎯 **Ejemplos de Uso**

### **Cursor con Efecto de Partículas:**
```javascript
// Activar efecto de partículas
window.customCursor.enableParticleEffect();

// Desactivar después de 5 segundos
setTimeout(() => {
    window.customCursor.disableParticleEffect();
}, 5000);
```

### **Cursor con Trail:**
```javascript
// Activar efecto trail
window.customCursor.enableTrailEffect();

// Desactivar al hacer click
document.addEventListener('click', () => {
    window.customCursor.disableTrailEffect();
});
```

### **Cursor Magnético:**
```javascript
// Activar efecto magnético
window.customCursor.enableMagneticEffect();

// Desactivar al salir de la página
document.addEventListener('mouseleave', () => {
    window.customCursor.disableMagneticEffect();
});
```

---

**¡El cursor personalizado está listo para usar!** 🎉
