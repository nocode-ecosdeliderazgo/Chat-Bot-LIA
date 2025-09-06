# PROMPT PARA CLAUDE - REDISEÑO DEL MENÚ DE MATERIAL DE CURSO

## OBJETIVO
Transformar el menú desplegable de "Material de Curso" para que los elementos aparezcan directamente en el fondo del sidebar (como en Coursera) en lugar de mostrar "burbujas" individuales, mejorando la legibilidad y experiencia de usuario.

## CONTEXTO ACTUAL
El menú actual en `src/Chat-Online/chat-online.html` y `src/Chat-Online/chat-online.css` tiene:
- Una sección `.course-materials-section` con header y botón de colapso
- Una lista `.modules-list` que contiene elementos `.module-item` con estilo de "burbujas" glassmorphism
- Cada `.module-item` tiene padding, bordes redondeados, sombras y efectos de hover

## ESTILO OBJETIVO (Basado en Coursera)
Los elementos del menú deben aparecer como:
- **Lista vertical integrada** directamente en el fondo del sidebar
- **Sin bordes redondeados** ni efectos de "burbuja"
- **Fondo transparente** o con muy poca opacidad
- **Separación sutil** entre elementos
- **Hover states** más sutiles
- **Tipografía clara** y legible
- **Iconos pequeños** al lado del texto (play, documento, etc.)

## INSTRUCCIONES ESPECÍFICAS

### 1. MODIFICAR CSS - Clase `.module-item`
```css
.module-item {
    /* ELIMINAR: */
    /* padding: 20px; */
    /* border-radius: 16px; */
    /* backdrop-filter: blur(10px); */
    /* box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25); */
    
    /* AGREGAR: */
    padding: 12px 16px;
    border-radius: 0;
    background: transparent;
    border: none;
    box-shadow: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0;
    transition: background-color 0.2s ease;
}
```

### 2. MODIFICAR CSS - Estados de hover
```css
.module-item:hover {
    /* ELIMINAR: */
    /* transform: translateY(-2px); */
    /* box-shadow: 0 8px 32px rgba(0, 102, 204, 0.2); */
    
    /* AGREGAR: */
    background: rgba(0, 102, 204, 0.08);
    transform: none;
    box-shadow: none;
}
```

### 3. MODIFICAR CSS - Estados completado y actual
```css
.module-item.completed {
    background: rgba(34, 197, 94, 0.05);
    border-left: 3px solid rgba(34, 197, 94, 0.6);
}

.module-item.current {
    background: rgba(0, 102, 204, 0.12);
    border-left: 3px solid #0066CC;
    font-weight: 600;
}
```

### 4. AGREGAR ICONOS A LOS ELEMENTOS
Modificar el HTML para incluir iconos pequeños:
```html
<div class="module-item" data-module="1">
    <div class="module-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
        </svg>
    </div>
    <div class="module-info">
        <h4>Introducción a Fundamentos de IA</h4>
        <p class="module-description">Vídeo • 2 min</p>
    </div>
</div>
```

### 5. ESTILOS PARA ICONOS
```css
.module-icon {
    width: 20px;
    height: 20px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
}

.module-item:hover .module-icon {
    color: #0066CC;
}

.module-item.completed .module-icon {
    color: rgba(34, 197, 94, 0.8);
}

.module-item.current .module-icon {
    color: #0066CC;
}
```

### 6. AJUSTAR LAYOUT DEL MÓDULO
```css
.module-item {
    display: flex;
    align-items: center;
    justify-content: flex-start; /* Cambiar de center a flex-start */
}

.module-info {
    flex: 1;
    text-align: left; /* Cambiar de center a left */
}
```

### 7. MEJORAR TIPOGRAFÍA
```css
.module-info h4 {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
    color: rgba(255, 255, 255, 0.9);
}

.module-description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
}
```

## ESTRUCTURA FINAL ESPERADA
- **Header**: "Material del Curso" con botón de colapso
- **Lista**: Elementos de módulo como lista vertical integrada
- **Elementos**: Icono + Título + Descripción (tipo de contenido y duración)
- **Estados**: Hover sutil, completado con borde verde, actual con borde azul
- **Scroll**: Mantener scrollbar personalizado si es necesario

## CONSIDERACIONES DE UX
1. **Legibilidad**: Texto claro sobre fondo oscuro
2. **Jerarquía visual**: Títulos más prominentes que descripciones
3. **Feedback visual**: Estados claros para hover, completado y actual
4. **Consistencia**: Mantener colores del proyecto (#0066CC, #22C55E)
5. **Responsive**: Asegurar que funcione en diferentes tamaños de pantalla

## ARCHIVOS A MODIFICAR
- `src/Chat-Online/chat-online.css` (estilos principales)
- `src/Chat-Online/chat-online.html` (estructura HTML si es necesario)
- `src/Chat-Online/chat-online.js` (lógica de generación de módulos si es necesario)

## RESULTADO ESPERADO
Un menú de materiales que se vea como el de Coursera: limpio, integrado, legible y con una experiencia de usuario fluida, manteniendo la identidad visual del proyecto pero con un diseño más moderno y funcional.
