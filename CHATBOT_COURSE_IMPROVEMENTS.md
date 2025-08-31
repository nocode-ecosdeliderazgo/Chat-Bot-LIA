# Mejoras del Chatbot para Respuestas Específicas del Curso

## Problema Identificado

El chatbot LIA estaba inventando información sobre ejercicios prácticos que no existían en el contenido real del curso "Experto en IA para Profesionales". Por ejemplo, mencionaba ejercicios de Machine Learning, Python, y análisis de datos que no están en el PDF proporcionado.

**PROBLEMA ESPECÍFICO:** El chatbot seguía inventando que la "Actividad Colaborativa" era grupal (equipos de 3-6 personas, roles de piloto/copiloto) cuando según el PDF es un **ejercicio completamente individual** con Gemini.

## Soluciones Implementadas

### 1. **Archivo `prompts/system.es.md` - Mejoras en el Sistema Principal**

#### Cambios Realizados:
- **Enfoque específico del curso**: Cambió de ser un asistente general de IA a ser específico del curso "Experto en IA para Profesionales"
- **Restricciones críticas**: Agregadas al inicio del archivo
- **Áreas de experticia**: Limitadas únicamente al contenido del curso
- **Metodología**: Actualizada para reflejar la metodología real del curso
- **Validación obligatoria**: Agregada sección de verificación antes de responder

#### Restricciones Agregadas:
```
## IMPORTANTE - RESTRICCIONES CRÍTICAS:
- **SOLO puedes responder con información del PDF del curso**
- **NO inventes contenido, ejercicios, o actividades que no estén en el PDF**
- **NO menciones tecnologías, herramientas o metodologías no cubiertas en el curso real**
- **Las únicas tecnologías del curso son ChatGPT y Gemini**
- **Si la información no está en el PDF, debes indicarlo claramente**
```

### 2. **Archivo `prompts/course-specific.es.md` - Nuevo Archivo Específico del Curso**

#### Contenido Incluido:
- **Información completa del curso** basada en el PDF
- **Contenido detallado de la Sesión 1** con todos los módulos
- **Restricciones absolutas** sobre qué NO puede mencionar
- **Estructura de respuesta obligatoria** para información encontrada y no encontrada
- **Validación antes de responder** con preguntas específicas

#### Restricciones Absolutas:
```
### NO PUEDES MENCIONAR:
- Ejercicios de Machine Learning, Python, análisis de datos
- Proyectos de programación o desarrollo
- Herramientas como TensorFlow, PyTorch, scikit-learn
- Metodologías de análisis de datos
- Casos de uso no documentados en el PDF
- Tecnologías diferentes a ChatGPT y Gemini
```

### 3. **Archivo `netlify/functions/openai.js` - Integración del Nuevo Prompt**

#### Cambios Realizados:
- **Lectura del nuevo archivo**: Agregado `course-specific.es.md` a la función `getPrompts()`
- **Inclusión en el prompt combinado**: El nuevo contenido se incluye en el prompt que se envía a OpenAI

```javascript
const courseSpecific = safeRead(path.join(base, 'course-specific.es.md'));
const combined = [system, style, safety, tools, useCases, courseSpecific]
    .filter(Boolean)
    .join('\n\n')
    .trim();
```

## Contenido Real del Curso (Sesión 1)

### Módulos Transversales Documentados:
1. **Gen-AI: El Despertar de una Nueva Era Humana** (Sesión completa)
2. **Actividad Colaborativa con Gemini** (40 minutos)
3. **Metodología y Evaluación** (Sesión completa)

### Ejercicios Prácticos Reales:
- **Actividad Colaborativa con Gemini (40 minutos):**
  - **Ejercicio individual** con Gemini (no grupal)
  - Prompt de investigación sobre "Gen AI El Despertar de una Nueva Era Humana"
  - Creación de formatos interactivos (reporte web, infografía, cuestionario, audio)
  - **Concepto del "cerebro central"**: Una investigación base que se transforma en múltiples formatos
  - **Proceso individual**: El estudiante trabaja solo con Gemini

- **Actividades Individuales:**
  - Videos de orientación
  - Instrucciones escritas claras
  - Audios de apoyo
  - Entregables sencillos (captura + descripción)
  - Cuestionarios de refuerzo

## Estructura de Respuesta Implementada

### Para Información Encontrada:
```
🤖 **CHAT LIA - Asistente del Curso "Experto en IA para Profesionales"**

📚 **INFORMACIÓN DEL CURSO**
- Módulo: [Módulo específico del PDF]
- Tema: [Tema específico del PDF]
- Contenido: [Información exacta del PDF]

💡 **DETALLES ADICIONALES**
- [Información complementaria del PDF]

🔗 **RELACIÓN CON EL CURSO**
- [Cómo se conecta con otros temas del PDF]
```

### Para Información NO Encontrada:
```
🤖 **CHAT LIA - Asistente del Curso "Experto en IA para Profesionales"**

❌ **Información no encontrada en el contenido del curso**

Lo siento, pero esa información específica no está incluida en el contenido oficial del curso "Experto en IA para Profesionales: Dominando ChatGPT y Gemini para la Productividad".

📚 **Contenido real del curso incluye:**
- Módulo "Gen-AI: El Despertar de una Nueva Era Humana"
- Actividad colaborativa con Gemini (40 minutos)
- Metodología 100% online con actividades en equipos
- Evaluación mediante entregables y cuestionarios

💡 **Recomendación:**
- Consulta directamente con el instructor Ernesto Hernández
- Revisa los materiales específicos del curso
- Considera que el contenido se enfoca únicamente en ChatGPT y Gemini
```

## Validación Implementada

### Preguntas Obligatorias Antes de Responder:
1. ¿Está esta información específicamente en el PDF que me proporcionaste?
2. ¿Son estos ejercicios/actividades los documentados en el PDF?
3. ¿Las tecnologías mencionadas son ChatGPT y Gemini (las únicas del curso)?
4. ¿Estoy inventando contenido que no está en el PDF?

**Si la respuesta es "NO" a cualquiera de estas preguntas, debe usar la respuesta de "INFORMACIÓN NO ENCONTRADA".**

## Resultado Esperado

Ahora cuando alguien pregunte "¿qué ejercicios prácticos se ven en este curso?", LIA:

✅ **SÍ mencionará:**
- La Actividad Colaborativa con Gemini (40 minutos)
- Las actividades individuales documentadas
- Los 3 módulos transversales de la Sesión 1
- ChatGPT y Gemini como únicas tecnologías

❌ **NO mencionará:**
- Ejercicios de Machine Learning, Python, o análisis de datos
- Proyectos de programación
- Herramientas como TensorFlow, PyTorch, scikit-learn
- **Trabajo en equipos de 3-6 personas** (la actividad es individual)
- **Roles de piloto y copiloto** (no existen en la actividad real)
- **Actividades grupales** (la actividad es individual con Gemini)
- **Formar equipos** (la actividad es individual)
- **Asignar roles** (no hay roles en la actividad)
- **Trabajo en equipo** (es un ejercicio individual)
- **Colaboración entre personas** (es individual con Gemini)
- Cualquier contenido no documentado en el PDF

## Archivos Modificados

1. `prompts/system.es.md` - Sistema principal mejorado
2. `prompts/course-specific.es.md` - Nuevo archivo específico del curso
3. `netlify/functions/openai.js` - Integración del nuevo prompt

## Próximos Pasos

1. **Probar el chatbot** con preguntas sobre ejercicios prácticos
2. **Verificar** que no mencione contenido inventado
3. **Validar** que use la estructura de respuesta correcta
4. **Monitorear** respuestas para asegurar cumplimiento de restricciones

---

**Fecha de implementación:** Diciembre 2024
**Responsable:** Sistema de Prompts - Chat LIA
**Objetivo:** Respuestas precisas basadas únicamente en el contenido del PDF del curso
