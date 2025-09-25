# PROMPT PARA CLAUDE: Implementación de Animaciones de Fondo en notices.html

## CONTEXTO
Necesito implementar las animaciones de fondo del archivo `cursos.css` en la página `notices.html` sin afectar su funcionamiento actual. La página `notices.html` ya tiene la clase `bg-glow-global` y el contenedor `particles-container`, pero necesita las animaciones específicas de fondo.

## ANÁLISIS DEL SISTEMA ACTUAL

### 1. ESTRUCTURA DE FONDO EN CURSOS.CSS

#### Variables CSS principales:
```css
:root {
  --turq: #44e5ff;
  --turq-2: #3dd4eb;
  --bg-1: #06182A;
  --bg-2: #0B1220;
}
```

#### Gradientes de fondo:
- **Modo oscuro**: `linear-gradient(160deg, var(--bg-1) 0%, var(--bg-2) 100%)`
- **Modo claro**: `linear-gradient(160deg, #E6F3FF 0%, #D4E6F1 100%)`

#### Efectos de partículas:
- **Modo oscuro**: `mix-blend-mode: normal`
- **Modo claro**: `mix-blend-mode: multiply`

#### Efectos de glow:
- **Modo oscuro**: `radial-gradient(circle, rgba(68, 229, 255, 0.1) 0%, transparent 70%)`
- **Modo claro**: `radial-gradient(circle, rgba(68, 229, 255, 0.15) 0%, transparent 70%)`

### 2. ESTRUCTURA ACTUAL EN NOTICES.HTML

La página ya tiene:
- `<body class="bg-glow-global">`
- `<div class="particles-container"></div>`
- Scripts: `particles.js`, `theme-manager.js`, `global-theme-setup.js`

### 3. SCRIPT DE PARTÍCULAS EXISTENTE

El archivo `particles.js` ya está implementado con:
- Configuración de partículas con color `#44e5ff`
- Efectos de hover y click
- Función de respaldo para navegadores sin particles.js
- Canvas con ID `particles-js`

## TAREAS ESPECÍFICAS

### PASO 1: Análisis de compatibilidad
1. Verificar que `notices.css` tenga las variables CSS necesarias
2. Confirmar que el sistema de temas funcione correctamente
3. Validar que no haya conflictos con estilos existentes

### PASO 2: Implementación de estilos de fondo
1. **Agregar variables CSS faltantes** en `notices.css`:
   ```css
   :root {
     --turq: #44e5ff;
     --turq-2: #3dd4eb;
     --bg-1: #06182A;
     --bg-2: #0B1220;
   }
   ```

2. **Implementar gradientes de fondo**:
   ```css
   body.bg-glow-global {
     background: linear-gradient(160deg, var(--bg-1) 0%, var(--bg-2) 100%);
   }
   
   [data-theme="light"] body.bg-glow-global {
     background: linear-gradient(160deg, #E6F3FF 0%, #D4E6F1 100%);
   }
   ```

3. **Agregar efectos de glow**:
   ```css
   .bg-glow-global .bg-glow {
     background: radial-gradient(circle, rgba(68, 229, 255, 0.1) 0%, transparent 70%);
   }
   
   [data-theme="light"] .bg-glow-global .bg-glow {
     background: radial-gradient(circle, rgba(68, 229, 255, 0.15) 0%, transparent 70%);
   }
   ```

### PASO 3: Configuración de partículas
1. **Verificar que el canvas tenga el ID correcto**:
   ```html
   <canvas id="particles-js"></canvas>
   ```

2. **Ajustar mix-blend-mode**:
   ```css
   #bgParticles {
     mix-blend-mode: normal;
   }
   
   [data-theme="light"] #bgParticles {
     mix-blend-mode: multiply;
   }
   ```

### PASO 4: Transiciones suaves
1. **Agregar transiciones para cambio de tema**:
   ```css
   * {
     transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
   }
   ```

### PASO 5: Validación y testing
1. **Verificar funcionamiento en ambos temas** (claro/oscuro)
2. **Confirmar que las partículas se muestren correctamente**
3. **Validar que no se rompan estilos existentes**
4. **Probar responsividad en diferentes tamaños de pantalla**

## RESTRICCIONES IMPORTANTES

1. **NO modificar** la estructura HTML existente de `notices.html`
2. **NO afectar** el funcionamiento actual de la página
3. **Mantener** todos los estilos existentes de `notices.css`
4. **Preservar** la funcionalidad del sistema de temas
5. **No romper** la navegación ni los componentes existentes

## RESULTADO ESPERADO

Al finalizar, `notices.html` debe tener:
- Fondo con gradiente animado igual al de `cursos.css`
- Partículas flotantes con efectos de hover/click
- Transiciones suaves entre temas claro/oscuro
- Efectos de glow sutil en el fondo
- Funcionamiento idéntico al actual, pero con animaciones de fondo

## ARCHIVOS A MODIFICAR

1. `src/Notices/notices.css` - Agregar estilos de fondo y partículas
2. `src/Notices/notices.html` - Verificar estructura del canvas (si es necesario)

## ARCHIVOS DE REFERENCIA

1. `src/styles/cursos.css` - Estilos de fondo a copiar
2. `src/scripts/particles.js` - Script de partículas existente
3. `src/Notices/notices.html` - Página objetivo
4. `src/Notices/notices.css` - Estilos actuales

---

**IMPORTANTE**: Implementar paso a paso, validando cada cambio antes de continuar con el siguiente.
