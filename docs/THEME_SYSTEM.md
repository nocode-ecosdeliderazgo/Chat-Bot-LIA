# 🌓 Sistema de Temas Claro/Oscuro

## 📋 **Descripción**

Se ha implementado un sistema completo de cambio de tema claro/oscuro en el `index.html` que mantiene todo el diseño, formato, animaciones y colores existentes.

## ✨ **Características**

### **🎨 Temas Disponibles**
- **Modo Oscuro** (por defecto): Fondo oscuro con texto claro
- **Modo Claro**: Fondo claro con texto oscuro

### **🔄 Funcionalidades**
- ✅ Cambio instantáneo entre temas
- ✅ Persistencia en localStorage
- ✅ Detección automática de preferencia del sistema
- ✅ Transiciones suaves
- ✅ Animaciones de iconos
- ✅ Efectos hover y click

## 🎯 **Implementación**

### **1. Botón de Cambio de Tema**

**Ubicación:** En la navegación del `index.html`

```html
<button class="theme-toggle-btn" id="themeToggle" aria-label="Cambiar modo claro/oscuro">
    <svg class="theme-icon sun-icon">...</svg>
    <svg class="theme-icon moon-icon">...</svg>
</button>
```

### **2. Variables CSS**

**Archivo:** `src/styles/welcome.css`

```css
:root {
    /* Modo Oscuro (por defecto) */
    --bg-primary: #0a0f19;
    --bg-secondary: #1a2332;
    --bg-tertiary: rgba(255, 255, 255, 0.05);
    --text-primary: #FFFFFF;
    --text-secondary: rgba(255, 255, 255, 0.8);
    --text-muted: rgba(255, 255, 255, 0.6);
}

[data-theme="light"] {
    /* Modo Claro (ajustado para mejor contraste) */
    --bg-primary: #F0F4F8;
    --bg-secondary: #E2E8F0;
    --bg-tertiary: rgba(0, 0, 0, 0.08);
    --text-primary: #1E293B;
    --text-secondary: rgba(30, 41, 59, 0.9);
    --text-muted: rgba(30, 41, 59, 0.7);
}
```

### **3. JavaScript**

**Archivo:** `src/scripts/theme-manager.js`

```javascript
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = this.getStoredTheme() || 'dark';
        this.init();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
}
```

## 🎨 **Elementos Adaptados**

### **✅ Elementos que se adaptan automáticamente:**
- Fondo de página
- Texto principal y secundario
- Botones (primario y secundario)
- Tarjetas glassmorphism
- Navegación
- Iconos del botón de tema
- Sombras y efectos

### **🎯 Colores Principales Mantenidos:**
- `--course-primary: #44E5FF` (Turquesa IA)
- `--course-secondary: #0077A6` (Azul Oscuro)
- `--course-success: #22C55E` (Verde Éxito)
- `--course-warning: #F59E0B` (Amarillo Advertencia)
- `--course-error: #EF4444` (Rojo Error)

## 🔧 **Uso**

### **Para el Usuario:**
1. Haz clic en el botón de tema en la navegación
2. El tema cambia instantáneamente
3. La preferencia se guarda automáticamente
4. Al recargar la página, se mantiene el tema elegido

### **Para Desarrolladores:**

**Agregar a una nueva página:**
```html
<!-- En el head -->
<link rel="stylesheet" href="styles/welcome.css">
<link rel="stylesheet" href="styles/components.css">

<!-- En la navegación -->
<button class="theme-toggle-btn" id="themeToggle">
    <!-- Iconos SVG -->
</button>

<!-- Al final del body -->
<script src="scripts/theme-manager.js"></script>
```

**Usar variables CSS en nuevos elementos:**
```css
.mi-elemento {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--bg-tertiary);
}
```

## 🧪 **Pruebas**

### **Página de Test:**
- **Archivo:** `test-theme-toggle.html`
- **Uso:** Abrir en el navegador para probar el cambio de tema

### **Verificación:**
1. ✅ El botón cambia de sol a luna
2. ✅ Los colores se adaptan correctamente
3. ✅ Las transiciones son suaves
4. ✅ El tema se guarda en localStorage
5. ✅ Funciona en todas las secciones

## 📱 **Responsive**

El sistema de temas es completamente responsive y funciona en:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🔮 **Futuras Mejoras**

### **Posibles Extensiones:**
- 🌈 Modo automático basado en hora del día
- 🎨 Temas personalizados
- 🔧 Panel de configuración de temas
- 📊 Analytics de preferencias de tema

## 🐛 **Solución de Problemas**

### **El tema no cambia:**
1. Verificar que `theme-manager.js` esté incluido
2. Verificar que el botón tenga `id="themeToggle"`
3. Revisar la consola del navegador para errores

### **Los colores no se adaptan:**
1. Verificar que el elemento use variables CSS
2. Asegurar que las variables estén definidas
3. Verificar que no haya estilos inline que sobrescriban

### **Las transiciones no funcionan:**
1. Verificar que el CSS tenga las transiciones definidas
2. Asegurar que no haya conflictos con otros estilos

## 📞 **Soporte**

Para problemas o mejoras:
1. Revisar la documentación
2. Probar con `test-theme-toggle.html`
3. Verificar la consola del navegador
4. Revisar el localStorage para el tema guardado
