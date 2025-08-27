# Implementación del Sistema de Conocimiento del Curso para Chat LIA

## 📋 Resumen

Este sistema permite que **Chat LIA** pueda responder preguntas específicas sobre el curso **"APRENDE Y APLICA IA®"** basándose en la información del documento **TEMARIO.docx**.

## 🎯 Objetivo

Crear un asistente inteligente que:
- ✅ Lea y extraiga información del TEMARIO.docx
- ✅ Responda preguntas específicas sobre el curso
- ✅ Proporcione respuestas estructuradas y precisas
- ✅ Se integre perfectamente con el sistema Chat LIA existente

## 📁 Archivos Creados

### 1. `prompts/course-knowledge-prompt.md`
- **Propósito:** Prompt principal para configurar Chat LIA
- **Contenido:** Instrucciones detalladas para el comportamiento del asistente
- **Uso:** Se carga en el sistema de prompts de Chat LIA

### 2. `src/scripts/course-knowledge-integration.js`
- **Propósito:** Script de integración con el sistema Chat LIA
- **Contenido:** Lógica para procesar preguntas y generar respuestas
- **Uso:** Se incluye en las páginas donde está Chat LIA

## 🚀 Implementación Paso a Paso

### Paso 1: Preparar el Documento TEMARIO.docx

1. **Ubicación:** El archivo debe estar en la raíz del proyecto
2. **Formato:** Documento Word (.docx) con el temario completo del curso
3. **Estructura:** Organizado por módulos, temas y contenido

### Paso 2: Integrar el Script en Chat LIA

Agregar el script a la página donde está Chat LIA:

```html
<!-- En el HTML donde está Chat LIA -->
<script src="scripts/course-knowledge-integration.js"></script>
```

### Paso 3: Configurar el Sistema

El sistema se inicializa automáticamente, pero puedes configurarlo manualmente:

```javascript
// Inicializar manualmente
await initializeCourseKnowledge();

// Probar el sistema
testCourseKnowledge();

// Ver información del sistema
showSystemInfo();
```

## 🔧 Configuración del Sistema

### Variables de Configuración

```javascript
const COURSE_KNOWLEDGE_CONFIG = {
    courseName: "APRENDE Y APLICA IA®",
    instructor: "Ernesto",
    courseType: "Taller de Inteligencia Artificial",
    focus: "Aplicación práctica de IA en la productividad",
    sourceDocument: "TEMARIO.docx",
    version: "1.0"
};
```

### Categorías de Preguntas Soportadas

1. **COURSE_CONTENT** - Contenido del curso
2. **TECHNICAL_CONCEPTS** - Conceptos técnicos
3. **PRACTICAL_APPLICATIONS** - Aplicaciones prácticas
4. **STRUCTURE_ORGANIZATION** - Estructura y organización

## 📝 Estructura de Respuestas

### Formato de Respuesta Estándar

```
🤖 **CHAT LIA - Asistente del Curso APRENDE Y APLICA IA®**

📚 **INFORMACIÓN DEL CURSO**
- Módulo: [Módulo específico]
- Tema: [Tema específico]
- Contenido: [Información del temario]

💡 **DETALLES ADICIONALES**
- [Información complementaria]
- [Ejemplos si están incluidos]

🔗 **RELACIÓN CON EL CURSO**
- [Conexión con otros temas]

---
💡 **Nota:** Esta información está basada en el temario oficial del curso.
```

### Ejemplo de Respuesta

**Pregunta:** "¿Qué se aprende en el curso?"

**Respuesta:**
```
🤖 **CHAT LIA - Asistente del Curso APRENDE Y APLICA IA®**

📚 **INFORMACIÓN DEL CURSO**
- Módulo: Introducción al curso
- Tema: Objetivos y alcance
- Contenido: Este curso te enseñará a dominar ChatGPT y Gemini para mejorar tu productividad personal y profesional.

💡 **DETALLES ADICIONALES**
- El curso incluye aplicaciones prácticas de IA
- Se enfoca en herramientas específicas: ChatGPT y Gemini
- Metodología hands-on con ejercicios prácticos

🔗 **RELACIÓN CON EL CURSO**
- Este es el fundamento que conecta con todos los módulos posteriores

---
💡 **Nota:** Esta información está basada en el temario oficial del curso. Para detalles específicos o consultas adicionales, te recomiendo contactar al instructor Ernesto.
```

## 🧪 Pruebas del Sistema

### Función de Prueba Automática

```javascript
// Ejecutar pruebas
testCourseKnowledge();
```

### Preguntas de Prueba

1. "¿Qué se aprende en el curso?"
2. "¿Qué herramientas se enseñan?"
3. "¿Cómo está organizado el curso?"
4. "¿Cuál es el objetivo del curso?"

### Verificación de Funcionamiento

```javascript
// Ver información del sistema
showSystemInfo();

// Procesar pregunta manual
const response = processCourseQuestion("¿Qué herramientas se enseñan?");
console.log(response);
```

## 🔍 Detección de Preguntas

### Palabras Clave del Curso

El sistema detecta automáticamente preguntas relacionadas con el curso usando estas palabras clave:

```javascript
const courseKeywords = [
    'curso', 'taller', 'aprender', 'enseñar', 'módulo', 'tema',
    'chatgpt', 'gemini', 'ia', 'inteligencia artificial', 'productividad',
    'herramienta', 'práctica', 'ejercicio', 'concepto'
];
```

### Tipos de Preguntas Detectadas

- **Contenido del curso:** "qué temas se cubren", "qué se aprende"
- **Conceptos técnicos:** "qué es", "cómo funciona"
- **Aplicaciones prácticas:** "cómo se aplica", "ejemplos"
- **Estructura:** "cómo está organizado", "cuántos módulos"

## 🚨 Manejo de Errores

### Preguntas No Cubiertas

Cuando se hace una pregunta que no está en el temario:

```
🤖 **CHAT LIA - Asistente del Curso APRENDE Y APLICA IA®**

❓ **Pregunta no cubierta en el temario**

Lo siento, pero esa información específica no está incluida en el temario del curso "APRENDE Y APLICA IA®".

💡 **Recomendación:**
- Consulta directamente con el instructor Ernesto
- Revisa los materiales adicionales del curso
- Considera que el temario puede actualizarse

---
📚 **¿Qué SÍ puedo responder?**
- Contenido específico de los módulos del curso
- Conceptos técnicos cubiertos en el temario
- Estructura y organización del curso
- Objetivos y metodología del curso
```

## 🔄 Integración con Chat LIA

### Método 1: Integración Automática

```javascript
// El sistema se integra automáticamente si detecta Chat LIA
if (typeof window !== 'undefined' && window.ChatLIA) {
    window.ChatLIA.addCourseKnowledgeHandler(processCourseQuestion);
}
```

### Método 2: Integración Manual

```javascript
// Configurar manualmente
window.CourseKnowledgeHandler = {
    processQuestion: processCourseQuestion,
    config: COURSE_KNOWLEDGE_CONFIG
};
```

## 📊 Monitoreo y Debugging

### Logs del Sistema

El sistema genera logs detallados en la consola:

```javascript
console.log('🤖 Chat LIA procesando pregunta: "¿Qué se aprende?"');
console.log('📋 Tipo de pregunta detectado: COURSE_CONTENT');
console.log('✅ Respuesta generada para pregunta del curso');
```

### Información del Sistema

```javascript
// Mostrar información del sistema
showSystemInfo();

// Salida:
// 📊 Información del Sistema de Conocimiento del Curso:
// Curso: APRENDE Y APLICA IA®
// Instructor: Ernesto
// Versión: 1.0
// Documento fuente: TEMARIO.docx
```

## 🔧 Personalización

### Modificar Configuración

```javascript
// Cambiar configuración del curso
COURSE_KNOWLEDGE_CONFIG.courseName = "Nuevo Nombre del Curso";
COURSE_KNOWLEDGE_CONFIG.instructor = "Nuevo Instructor";
```

### Agregar Nuevas Categorías

```javascript
// Agregar nueva categoría de preguntas
QUESTION_CATEGORIES.NEW_CATEGORY = [
    "nueva palabra clave",
    "otra palabra clave"
];
```

### Personalizar Respuestas

```javascript
// Modificar formato de respuesta
class CustomCourseKnowledgeResponse extends CourseKnowledgeResponse {
    formatResponse() {
        // Personalizar formato aquí
    }
}
```

## 📈 Mantenimiento

### Actualizaciones del Temario

1. **Actualizar TEMARIO.docx** con nuevo contenido
2. **Revisar categorías** de preguntas si es necesario
3. **Probar el sistema** con nuevas preguntas
4. **Actualizar documentación** si hay cambios

### Monitoreo de Uso

```javascript
// Agregar analytics si es necesario
function trackQuestionUsage(question, response) {
    // Implementar tracking aquí
}
```

## 🎯 Casos de Uso

### 1. Preguntas Frecuentes del Curso
- "¿Qué se aprende en el curso?"
- "¿Qué herramientas se enseñan?"
- "¿Cuál es la metodología?"

### 2. Consultas Técnicas
- "¿Qué es ChatGPT?"
- "¿Cómo funciona Gemini?"
- "¿Cuáles son las mejores prácticas?"

### 3. Información Estructural
- "¿Cómo está organizado el curso?"
- "¿Cuántos módulos tiene?"
- "¿Cuál es la duración?"

### 4. Aplicaciones Prácticas
- "¿Cómo se aplica la IA en el trabajo?"
- "¿Qué ejemplos se proporcionan?"
- "¿Cuáles son los casos de uso?"

## 🔐 Seguridad y Límites

### Límites del Sistema

- ✅ Solo responde basándose en el TEMARIO.docx
- ✅ No inventa información no contenida en el temario
- ✅ Sugiere consultar al instructor para temas específicos
- ✅ Mantiene el enfoque en el contenido del curso

### Validaciones

```javascript
// Validar que la información viene del temario
function validateTemarioSource(info) {
    // Implementar validaciones aquí
}
```

## 📞 Soporte

### Para Problemas Técnicos

1. **Verificar logs** en la consola del navegador
2. **Probar funciones** de debugging
3. **Revisar integración** con Chat LIA
4. **Validar archivo** TEMARIO.docx

### Para Actualizaciones

1. **Modificar TEMARIO.docx** según sea necesario
2. **Actualizar configuración** del sistema
3. **Probar nuevas funcionalidades**
4. **Documentar cambios**

---

**Versión:** 1.0  
**Última actualización:** [Fecha]  
**Responsable:** Sistema de Conocimiento del Curso - Chat LIA
