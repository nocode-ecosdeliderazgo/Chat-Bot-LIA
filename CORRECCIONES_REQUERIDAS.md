# Correcciones Requeridas para Cuestionario GenAI

## Problemas Identificados

### 1. Mapeo Incorrecto de Roles en genai-form.js

**Archivo:** `src/q/genai-form.js:143-198`

**Problema:** El mapeo actual asigna preguntas incorrectas a los perfiles:
- Marketing → preguntas de desarrollo de código (rol 2)
- Finanzas → preguntas de medicina/salud (rol 4)
- CTO/CIO → preguntas de academia/investigación (rol 8)

**Evidencia de la BD:**
```
Rol 1 (Ventas): Preguntas sobre "impulsar iniciativas de Gen-AI", "OKRs", "presupuesto" ✅ CORRECTO
Rol 2 (Marketing): Preguntas sobre "asistentes de código", "refactoring", "code reviews" ❌ INCORRECTO
Rol 3 (Operaciones): Preguntas sobre "ideación y copy", "posts", "emails", "ads" ✅ PODRÍA SER MARKETING
Rol 4 (Finanzas): Preguntas sobre "evidencia clínica", "notas clínicas", "guías médicas" ❌ INCORRECTO
Rol 8 (Tecnología): Preguntas sobre "literatura académica", "síntesis de investigación" ❌ PODRÍA SER CÓDIGO
```

### 2. Mapeo Correcto Propuesto

Basado en el análisis de contenido de preguntas, el mapeo correcto sería:

```javascript
const areaMap = {
    // Liderazgo/Alta Dirección - Rol 1 (Preguntas estratégicas)
    'CEO': { area_id: 2, exclusivo_rol_id: 1 },
    'Dirección General': { area_id: 2, exclusivo_rol_id: 1 },
    'Dirección de Ventas': { area_id: 2, exclusivo_rol_id: 1 },
    'Miembros de Ventas': { area_id: 2, exclusivo_rol_id: 1 },
    
    // Marketing/Comunicación - Rol 3 (Preguntas de copy, ads, posts)
    'Dirección de Marketing': { area_id: 3, exclusivo_rol_id: 3 },
    'Miembros de Marketing': { area_id: 3, exclusivo_rol_id: 3 },
    
    // Tecnología/Desarrollo - Rol 2 (Preguntas de código, desarrollo)
    'CTO/CIO': { area_id: 4, exclusivo_rol_id: 2 },
    'Tecnología/TI': { area_id: 4, exclusivo_rol_id: 2 },
    'Desarrollo': { area_id: 4, exclusivo_rol_id: 2 },
    
    // Finanzas - Rol 5 (Preguntas específicas de finanzas)
    'Dirección de Finanzas (CFO)': { area_id: 5, exclusivo_rol_id: 5 },
    'Miembros de Finanzas': { area_id: 5, exclusivo_rol_id: 5 },
    
    // Salud/Medicina - Rol 4 (Preguntas médicas/clínicas)
    'Dirección de RRHH': { area_id: 4, exclusivo_rol_id: 4 }, // Cambiar a salud si aplica
    'Miembros de RRHH': { area_id: 4, exclusivo_rol_id: 4 },
    
    // Academia/Investigación - Rol 8 (Preguntas de literatura/investigación)  
    'Academia': { area_id: 4, exclusivo_rol_id: 8 },
    'Investigación': { area_id: 4, exclusivo_rol_id: 8 },
    'Investigador': { area_id: 4, exclusivo_rol_id: 8 },
    'Profesor': { area_id: 4, exclusivo_rol_id: 8 },
    
    // Diseño/Creativos - Rol 10 (Preguntas de diseño)
    'Freelancer': { area_id: 4, exclusivo_rol_id: 10 },
    'Consultor': { area_id: 4, exclusivo_rol_id: 10 },
    
    // Fallback
    'Gerencia Media': { area_id: 2, exclusivo_rol_id: 1 }
};
```

## Correcciones a Implementar

### 1. Actualizar genai-form.js

Reemplazar la función `mapToGenAIArea()` líneas 143-198 con el mapeo correcto.

### 2. Verificar Contenido de Base de Datos

Es necesario revisar si las preguntas en la BD están asignadas correctamente a cada rol, o si necesitamos:
- Crear nuevas preguntas específicas para cada área
- Reasignar preguntas existentes a roles más apropiados

### 3. Actualizar Página de Estadísticas

El radar chart actual espera 5 dimensiones pero solo tenemos 2 bloques (Adopción/Conocimiento).
Opciones:
1. Simplificar radar a 2 dimensiones
2. Crear sub-categorías dentro de Adopción/Conocimiento
3. Añadir más bloques de preguntas

## Pasos Siguientes

1. ✅ **COMPLETADO** - Diagnosticar problemas
2. **PENDIENTE** - Implementar mapeo corregido
3. **PENDIENTE** - Verificar/actualizar preguntas de BD si necesario
4. **PENDIENTE** - Actualizar cálculo de radar chart
5. **PENDIENTE** - Testing con diferentes perfiles

## Archivos a Modificar

- `src/q/genai-form.js` - Función mapToGenAIArea() 
- `src/estadisticas.html` - Posible actualización de radar
- Posible script de migración de BD si necesario