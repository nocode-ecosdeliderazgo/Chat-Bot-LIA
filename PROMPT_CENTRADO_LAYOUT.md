# PROMPT PARA CLAUDE CODE - CORRECCIÓN DE CENTRADO EN DESKTOP

## **PROBLEMA IDENTIFICADO:**
Las páginas `courses.html`, `cursos.html` y `notices.html` tienen el contenido corrido hacia la izquierda en desktop, dejando un gran espacio vacío en el lado derecho. El sitio ya está configurado como NO RESPONSIVO con ancho fijo de 1280px, pero el contenido no está centrado correctamente.

## **ARCHIVOS A MODIFICAR:**
1. `src/styles/courses.css`
2. `src/styles/cursos.css` 
3. `src/Notices/notices.css`

## **INSTRUCCIONES CRÍTICAS:**
- ❌ **NO MODIFIQUES** la lógica de "no responsive" ni el viewport
- ❌ **NO CAMBIES** el ancho fijo de 1280px
- ❌ **NO APLIQUES** reglas para móvil
- ✅ **SOLO CORRIGE** el corrimiento lateral en desktop

## **TAREAS ESPECÍFICAS:**

### **1. Revisar y corregir elementos con `width: 100vw`:**
- Cambiar `width: 100vw` por `width: 100%` dentro del contenedor de 1280px
- Buscar elementos que se extiendan más allá del contenedor principal

### **2. Corregir elementos `fixed` o `absolute` anclados a `left: 0`:**
- Si hay elementos con `position: fixed` o `position: absolute` y `left: 0` con `width: 100vw`
- Cambiar por: `left: 50%; transform: translateX(-50%); width: 1280px;`

### **3. Asegurar contenedor principal centrado:**
- Verificar que todo el contenido principal esté envuelto en un contenedor:
```css
.page {
    width: 1280px;
    margin: 0 auto;
}
```

### **4. Revisar imágenes, videos y canvases:**
- Asegurar que no ensanchen más de 1280px
- Aplicar: `max-width: 100%; height: auto;`

### **5. Evitar desbordes:**
- Revisar márgenes negativos que causen desbordes
- Verificar sombras que se extiendan fuera del contenedor

## **CÓDIGO ESPECÍFICO A BUSCAR Y CORREGIR:**

### **Elementos problemáticos comunes:**
```css
/* PROBLEMÁTICO - Cambiar por: */
width: 100vw; → width: 100%;
left: 0; width: 100vw; → left: 50%; transform: translateX(-50%); width: 1280px;
position: fixed; left: 0; → position: fixed; left: 50%; transform: translateX(-50%);
```

### **Contenedor principal requerido:**
```css
.page {
    width: 1280px;
    margin: 0 auto;
    position: relative;
}
```

### **Elementos multimedia:**
```css
img, video, canvas {
    max-width: 100%;
    height: auto;
}
```

## **OBJETIVO:**
En desktop: todo debe estar centrado en un lienzo de 1280px, sin correrse a la izquierda.
En móvil: NO CAMBIAR NADA - debe seguir viéndose reducido como ya está.

## **VERIFICACIÓN POST-IMPLEMENTACIÓN:**
1. **Desktop**: Contenido centrado en 1280px sin espacios vacíos laterales
2. **Móvil**: Sin cambios - sigue viéndose reducido
3. **No responsive**: Mantiene la configuración actual
4. **Centrado**: Todo el contenido principal está centrado

## **INSTRUCCIONES DE IMPLEMENTACIÓN:**

1. **Paso 1**: Buscar elementos con `width: 100vw` y cambiarlos por `width: 100%`
2. **Paso 2**: Localizar elementos `fixed/absolute` con `left: 0` y centrarlos
3. **Paso 3**: Verificar que existe contenedor `.page` con `width: 1280px; margin: 0 auto;`
4. **Paso 4**: Revisar imágenes/videos para `max-width: 100%`
5. **Paso 5**: Eliminar márgenes negativos problemáticos
6. **Paso 6**: Probar SOLO en desktop - móvil no debe cambiar

## **NOTAS CRÍTICAS:**
- ❌ **NO TOCAR** configuración responsive existente
- ❌ **NO MODIFICAR** viewport ni breakpoints
- ❌ **NO CAMBIAR** comportamiento en móvil
- ✅ **SOLO CENTRAR** contenido en desktop de 1280px

---

**RESULTADO ESPERADO**: En desktop, todo el contenido centrado en un lienzo de 1280px sin corrimiento lateral. En móvil, sin cambios - sigue reducido como está actualmente.
