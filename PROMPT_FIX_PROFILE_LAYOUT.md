# PROMPT: Corrección de Layout de Página de Perfil

## PROBLEMA CRÍTICO
La página `src/profile.html` no se está distribuyendo correctamente por toda la pantalla. Las tarjetas del perfil se ven centradas y limitadas en lugar de ocupar todo el ancho disponible como debería ser.

## ESTADO ACTUAL
- Las tarjetas del perfil (columna izquierda con información del usuario y columna derecha con formularios) se ven centradas
- El contenido no se distribuye por toda la página
- Parece que hay un contenedor invisible limitando el ancho

## ANÁLISIS REALIZADO
1. **Estructura HTML**: El archivo `src/profile.html` tiene la estructura correcta:
   ```html
   <div class="auth-container">
       <main class="main-content">
           <div class="content-wrapper">
               <div class="profile-card"><!-- Columna izquierda --></div>
               <div class="form-container"><!-- Columna derecha --></div>
           </div>
       </main>
   </div>
   ```

2. **Estilos CSS identificados**:
   - En `src/styles/profile.css` se modificó `.content-wrapper` para usar `max-width: 100%` y `margin: 0`
   - Se agregaron `!important` a los estilos del body y html en `profile.css`
   - **PROBLEMA ENCONTRADO**: En `src/styles/main.css` líneas 90-105 hay estilos globales que limitan el ancho:
     ```css
     html, body {
         min-width: 1280px;
         overflow-x: auto;
     }
     body {
         width: 1280px; /* ← ESTE ES EL PROBLEMA PRINCIPAL */
     }
     ```

## TAREAS REQUERIDAS

### 1. INVESTIGACIÓN ADICIONAL
- Verificar si hay otros archivos CSS que puedan estar afectando el layout
- Revisar si hay estilos inline o JavaScript que modifiquen el ancho
- Comprobar si hay media queries que estén sobrescribiendo los estilos

### 2. CORRECCIÓN DEL PROBLEMA
- **Opción A**: Crear estilos específicos para la página de perfil que sobrescriban completamente los estilos globales
- **Opción B**: Modificar los estilos globales de manera condicional solo para la página de perfil
- **Opción C**: Agregar una clase específica al body en profile.html y crear estilos específicos

### 3. VERIFICACIÓN
- Asegurar que las tarjetas se distribuyan por toda la página
- Verificar que el diseño responsive funcione correctamente
- Confirmar que no se rompan otras páginas del sistema

## ARCHIVOS INVOLUCRADOS
- `src/profile.html` - Estructura HTML
- `src/styles/profile.css` - Estilos específicos del perfil
- `src/styles/main.css` - Estilos globales (líneas 90-105 problemáticas)
- `src/styles/apps-directory.css` - Posibles conflictos adicionales

## RESULTADO ESPERADO
Las tarjetas del perfil deben:
1. Ocupar todo el ancho de la pantalla
2. La columna izquierda (profile-card) debe estar pegada al borde izquierdo
3. La columna derecha (form-container) debe ocupar el resto del espacio
4. No debe haber espacios vacíos a los lados
5. El diseño debe ser responsive y funcionar en diferentes tamaños de pantalla

## NOTAS IMPORTANTES
- **NO** modificar estilos globales que puedan afectar otras páginas
- **SÍ** usar especificidad CSS alta o `!important` si es necesario
- **SÍ** mantener la funcionalidad existente
- **SÍ** probar en diferentes tamaños de pantalla

## COMANDOS ÚTILES PARA DEBUGGING
```bash
# Buscar estilos que limiten el ancho
grep -r "max-width.*[0-9]+px" src/styles/
grep -r "width.*[0-9]+px" src/styles/
grep -r "min-width.*[0-9]+px" src/styles/

# Buscar estilos del body
grep -r "body.*{" src/styles/
grep -r "^body" src/styles/
```

## PRIORIDAD
**ALTA** - Este es un problema crítico de UI/UX que afecta la experiencia del usuario en la página de perfil.

---

**INSTRUCCIONES PARA CLAUDE:**
1. Analiza todos los archivos CSS mencionados
2. Identifica todos los estilos que puedan estar limitando el ancho
3. Implementa una solución que sobrescriba estos estilos específicamente para la página de perfil
4. Verifica que la solución funcione sin afectar otras páginas
5. Documenta los cambios realizados
