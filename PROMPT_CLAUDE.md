# PROMPT PARA ARREGLAR TARJETAS DEL MÓDULO DE MATERIALES DEL CURSO

## PROBLEMA ACTUAL
Las tarjetas del módulo "Material del Curso" se ven vacías, solo muestran iconos del libro pero NO aparece el texto, títulos, descripciones, duración ni estados de las lecciones. Las tarjetas están completamente vacías de información útil.

## ARCHIVOS A MODIFICAR
- `src/Chat-Online/chat-online.js` - Función `createMaterialsContent()`
- `src/Chat-Online/chat-online.css` - Estilos para las tarjetas

## REQUISITOS ESPECÍFICOS

### 1. ESTRUCTURA DE LAS TARJETAS
Cada tarjeta debe mostrar:
- **Número de lección** (01, 02, 03, etc.) en la esquina superior derecha
- **Icono de video** (botón de play) a la izquierda
- **Título de la lección** (ej: "Introducción a la IA")
- **Descripción detallada** de la lección
- **Duración** (ej: "15 min") con icono de reloj
- **Estado** (Completado/En Progreso/Bloqueado) con colores distintivos
- **Botón de reproducción** funcional a la derecha

### 2. CONTENIDO DE LAS 11 LECCIONES
```
1. Introducción a la IA (15 min) - Completado
2. Historia de la IA (22 min) - En Progreso
3. Machine Learning Básico (18 min) - Bloqueado
4. Redes Neuronales (25 min) - Bloqueado
5. Procesamiento de Lenguaje Natural (20 min) - Bloqueado
6. Visión por Computadora (28 min) - Bloqueado
7. Ética en IA (16 min) - Bloqueado
8. IA Generativa (24 min) - Bloqueado
9. Automatización con IA (30 min) - Bloqueado
10. Futuro de la IA (19 min) - Bloqueado
11. Proyecto Final (45 min) - Bloqueado
```

### 3. DISEÑO VISUAL REQUERIDO
- **Fondo**: Gradiente azul translúcido `rgba(0, 102, 204, 0.08)` a `rgba(0, 102, 204, 0.05)`
- **Bordes**: `2px solid rgba(0, 102, 204, 0.2)`
- **Texto principal**: Blanco `#FFFFFF`
- **Texto secundario**: Gris claro `rgba(255, 255, 255, 0.8)`
- **Estados**: Verde (completado), Naranja (en progreso), Gris (bloqueado)
- **Botones**: Azul `#0066CC` con gradiente
- **Números de lección**: Círculos azules con texto blanco

### 4. FUNCIONALIDAD REQUERIDA
- **Botones de reproducción** deben ser funcionales
- **Estados visuales** deben ser claros y distintivos
- **Hover effects** en las tarjetas
- **Responsive design** que se adapte a diferentes tamaños
- **Grid layout** con `minmax(400px, 1fr)`

### 5. PROBLEMAS A SOLUCIONAR
- ❌ **TEXTO NO APARECE**: Las tarjetas solo muestran iconos, sin títulos ni descripciones
- ❌ **INFORMACIÓN FALTANTE**: No se ve duración, estado ni metadatos
- ❌ **DISEÑO INCOMPLETO**: Las tarjetas se ven vacías y sin información útil
- ❌ **FUNCIONALIDAD ROTA**: Los botones no funcionan correctamente

### 6. SOLUCIÓN ESPERADA
- ✅ **TEXTO VISIBLE**: Títulos, descripciones y metadatos claramente visibles
- ✅ **INFORMACIÓN COMPLETA**: Duración, estado y detalles de cada lección
- ✅ **DISEÑO PROFESIONAL**: Tarjetas con información completa y bien organizada
- ✅ **FUNCIONALIDAD COMPLETA**: Botones de reproducción y navegación funcionando

## INSTRUCCIONES TÉCNICAS

### Para el archivo JavaScript:
1. Revisar la función `createMaterialsContent()` en `src/Chat-Online/chat-online.js`
2. Asegurar que el HTML generado incluya TODOS los elementos de texto
3. Verificar que los estilos inline estén correctamente aplicados
4. Implementar la función `playLesson()` para los botones de reproducción

### Para el archivo CSS:
1. Revisar los estilos de `.material-card`, `.lesson-card`, `.material-info`
2. Asegurar que las variables CSS estén definidas correctamente
3. Verificar que los colores y tipografías se apliquen correctamente
4. Implementar hover effects y transiciones suaves

## CRITERIOS DE ÉXITO
- Las tarjetas muestran **TODA** la información de texto claramente
- Los títulos y descripciones son **VISIBLES** y legibles
- Los estados y duraciones se muestran **CORRECTAMENTE**
- El diseño es **PROFESIONAL** y consistente
- La funcionalidad de los botones **FUNCIONA** correctamente

## NOTAS IMPORTANTES
- NO modificar el layout del panel izquierdo
- NO cambiar la posición del módulo de materiales
- Mantener la paleta de colores azul `#0066CC`
- Asegurar que el texto sea completamente visible
- Las tarjetas deben verse completas y profesionales

## PRIORIDAD
**ALTA** - Este es un problema crítico que impide el uso del módulo de materiales. Las tarjetas deben mostrar información completa y ser funcionales.
