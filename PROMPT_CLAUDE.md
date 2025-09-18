# Prompt para Claude: Análisis y Solución del Modal de Recuperación de Contraseña

## Contexto del Problema

En el archivo `src/login/new-auth.html` y `src/login/new-auth.css`, existe un modal de recuperación de contraseña que se activa al hacer clic en "¿Olvidaste tu contraseña?". Sin embargo, el campo de entrada de email (textbox) no es visible en este modal, lo que impide su funcionalidad.

## Archivos Involucrados

- **HTML**: `src/login/new-auth.html` (líneas 507-559)
- **CSS**: `src/login/new-auth.css` (líneas 52-426)

## Estructura del Modal en HTML

El modal se encuentra en las líneas 507-559 del archivo HTML:

   ```html
<div id="forgotPasswordModal" class="terms-card-overlay">
    <div class="terms-card forgot-password-modal">
        <div class="terms-card-header">
            <!-- Header con título y botón de cerrar -->
        </div>
        <div class="terms-card-content forgot-password-content">
            <form id="forgotPasswordForm">
                <div class="forgot-password-info">
                    <p>Ingresa tu correo electrónico...</p>
                </div>
                <div class="form-group">
                    <label for="forgotPasswordEmail">Correo electrónico</label>
                    <div class="input-wrapper">
                        <input type="email" id="forgotPasswordEmail" name="email" required placeholder="tu@email.com">
                        <svg class="input-icon">...</svg>
                    </div>
                </div>
                <button type="submit" class="btn-primary">Enviar enlace de recuperación</button>
            </form>
        </div>
        <div class="terms-card-footer">
            <button class="btn-terms-close">Cancelar</button>
        </div>
    </div>
</div>
```

## Estilos CSS del Modal

Los estilos se encuentran en las líneas 52-426 del archivo CSS, incluyendo:

- `.forgot-password-modal` (líneas 75-90)
- `.forgot-password-content` (líneas 168-174)
- `.forgot-password-modal .form-group` (líneas 197-201)
- `.forgot-password-modal .input-wrapper` (líneas 214-225)
- `.forgot-password-modal .input-wrapper input` (líneas 235-247)

## Tarea a Realizar

### Paso 1: Análisis del Problema
1. **Revisar la estructura HTML** del modal de recuperación de contraseña
2. **Identificar los estilos CSS** que afectan al campo de entrada
3. **Detectar conflictos** entre estilos del modal y estilos generales
4. **Verificar la especificidad** de los selectores CSS
5. **Comprobar la herencia** de estilos del modal de términos

### Paso 2: Diagnóstico
1. **Identificar por qué el input no es visible**:
   - ¿Está oculto por `display: none`?
   - ¿Tiene `opacity: 0`?
   - ¿Está fuera del viewport?
   - ¿Tiene colores que lo hacen invisible?
   - ¿Hay conflictos de z-index?

2. **Verificar la estructura del DOM**:
   - ¿El input está correctamente anidado?
   - ¿Los contenedores tienen las dimensiones correctas?
   - ¿Hay elementos que lo estén ocultando?

### Paso 3: Solución
1. **Corregir los estilos CSS** para que el input sea visible
2. **Asegurar que el input tenga**:
   - Dimensiones apropiadas (width, height)
   - Colores visibles (background, border, text)
   - Posicionamiento correcto
   - Z-index apropiado

3. **Mantener la consistencia** con el diseño del resto del formulario
4. **Asegurar la funcionalidad** del campo de entrada

### Paso 4: Verificación
1. **Probar que el input sea visible** en el modal
2. **Verificar que sea funcional** (se pueda escribir en él)
3. **Comprobar que mantenga el estilo** consistente con el resto del formulario
4. **Asegurar que funcione** en diferentes tamaños de pantalla

## Criterios de Éxito

- ✅ El campo de entrada de email es visible en el modal
- ✅ El campo es funcional (se puede escribir en él)
- ✅ Mantiene la consistencia visual con el resto del formulario
- ✅ No interfiere con otros elementos del modal
- ✅ Funciona correctamente en modo oscuro y claro

## Notas Importantes

- El modal reutiliza estilos del modal de términos y condiciones
- Debe mantener la consistencia con el diseño general de la aplicación
- Los estilos deben ser específicos para evitar conflictos
- Considerar la responsividad del modal

## Resultado Esperado

Al finalizar, el modal de recuperación de contraseña debe mostrar claramente el campo de entrada de email, permitiendo al usuario escribir su correo electrónico para recibir el enlace de recuperación.
