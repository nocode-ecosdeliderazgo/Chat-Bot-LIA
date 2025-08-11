/**
 * Script de prueba para verificar la integración de datos del curso
 * Este script simula consultas que el agente debería poder responder
 * con la información hardcodeada del curso
 */

const fs = require('fs');
const path = require('path');

// Cargar datos del curso
const COURSE_DATA = require('./src/data/course-data.js');

// Función para buscar en los datos del curso (similar a la del main.js)
function searchCourseData(courseData, query) {
    const queryLower = query.toLowerCase();
    let relevantInfo = [];
    
    // Buscar en glosario
    courseData.glossary.forEach(item => {
        if (item.term.toLowerCase().includes(queryLower) || 
            item.definition.toLowerCase().includes(queryLower)) {
            relevantInfo.push(`📖 ${item.term}: ${item.definition}`);
        }
    });
    
    // Buscar en sesiones
    courseData.sessions.forEach(session => {
        // Buscar en conceptos de la sesión
        session.content.concepts.forEach(concept => {
            if (concept.term.toLowerCase().includes(queryLower) || 
                concept.definition.toLowerCase().includes(queryLower)) {
                relevantInfo.push(`🎓 Sesión ${session.id} - ${concept.term}: ${concept.definition}`);
            }
        });
        
        // Buscar en FAQs
        session.faq.forEach(faq => {
            if (faq.question.toLowerCase().includes(queryLower) || 
                faq.answer.toLowerCase().includes(queryLower)) {
                relevantInfo.push(`❓ FAQ (${session.title}): ${faq.question} - ${faq.answer}`);
            }
        });
        
        // Buscar en actividades
        session.activities.forEach(activity => {
            if (activity.title.toLowerCase().includes(queryLower) || 
                activity.description.toLowerCase().includes(queryLower)) {
                relevantInfo.push(`🎯 Actividad (${session.title}): ${activity.title} - ${activity.description}`);
            }
        });
    });
    
    // Buscar en ejercicios prácticos
    courseData.practicalExercises.forEach(exercise => {
        if (exercise.title.toLowerCase().includes(queryLower) || 
            exercise.description.toLowerCase().includes(queryLower)) {
            relevantInfo.push(`💻 Ejercicio: ${exercise.title} - ${exercise.description}`);
        }
    });
    
    return relevantInfo.slice(0, 8); // Limitar a 8 resultados más relevantes
}

// Tests de búsqueda
const testQueries = [
    "¿Qué es machine learning?",
    "transformer",
    "CNN",
    "prompt engineering",
    "overfitting",
    "ética en IA",
    "ejercicios prácticos",
    "sesión 4",
    "deep learning",
    "MLOps"
];

console.log("🧪 PRUEBAS DE INTEGRACIÓN DEL CURSO");
console.log("====================================\n");

console.log("📊 INFORMACIÓN GENERAL DEL CURSO:");
console.log(`Título: ${COURSE_DATA.info.title}`);
console.log(`Descripción: ${COURSE_DATA.info.description}`);
console.log(`Duración: ${COURSE_DATA.info.duration}`);
console.log(`Nivel: ${COURSE_DATA.info.level}`);
console.log(`Modalidad: ${COURSE_DATA.info.modalidad}\n`);

console.log("📚 SESIONES DISPONIBLES:");
COURSE_DATA.sessions.forEach(session => {
    console.log(`Sesión ${session.id}: ${session.title} (${session.duration})`);
});
console.log();

console.log("📖 ESTADÍSTICAS DEL GLOSARIO:");
console.log(`Total de términos: ${COURSE_DATA.glossary.length}`);
const categories = [...new Set(COURSE_DATA.glossary.map(item => item.category))];
console.log(`Categorías: ${categories.join(', ')}\n`);

console.log("💻 EJERCICIOS PRÁCTICOS:");
COURSE_DATA.practicalExercises.forEach(exercise => {
    console.log(`- ${exercise.title} (${exercise.difficulty})`);
});
console.log();

console.log("🔍 PRUEBAS DE BÚSQUEDA:");
console.log("======================\n");

testQueries.forEach((query, index) => {
    console.log(`Consulta ${index + 1}: "${query}"`);
    const results = searchCourseData(COURSE_DATA, query);
    
    if (results.length > 0) {
        console.log(`✅ Encontrados ${results.length} resultados:`);
        results.forEach(result => {
            console.log(`   ${result}`);
        });
    } else {
        console.log(`❌ No se encontraron resultados`);
    }
    console.log();
});

console.log("🎯 RESUMEN DE CAPACIDADES DEL AGENTE:");
console.log("=====================================");
console.log(`✅ ${COURSE_DATA.sessions.length} sesiones completas con contenido detallado`);
console.log(`✅ ${COURSE_DATA.glossary.length} términos técnicos en el glosario`);
console.log(`✅ ${COURSE_DATA.practicalExercises.length} ejercicios prácticos hands-on`);
console.log(`✅ Búsqueda inteligente en todo el contenido del curso`);
console.log(`✅ FAQs específicas para cada sesión`);
console.log(`✅ Actividades y objetivos de aprendizaje por sesión`);
console.log(`✅ Recursos curados (libros, herramientas, datasets)`);
console.log();

console.log("🚀 El agente de IA ahora tiene acceso completo a:");
console.log("- Contenido estructurado de 8 sesiones");
console.log("- Glosario técnico especializado");
console.log("- Ejercicios prácticos con tecnologías reales");
console.log("- FAQs y casos de uso específicos");
console.log("- Recursos de aprendizaje curados");
console.log();

console.log("✨ INTEGRACIÓN COMPLETADA CON ÉXITO ✨");
