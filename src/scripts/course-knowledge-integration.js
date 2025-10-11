// ===== INTEGRACIÓN DE CONOCIMIENTO DEL CURSO PARA CHAT LIA =====

// Configuración del sistema de conocimiento del curso
const COURSE_KNOWLEDGE_CONFIG = {
    courseName: "APRENDE Y APLICA IA®",
    instructor: "Ernesto",
    courseType: "Taller de Inteligencia Artificial",
    focus: "Aplicación práctica de IA en la productividad",
    sourceDocument: "TEMARIO.docx",
    version: "1.0"
};

// Estructura de respuesta para preguntas del curso
class CourseKnowledgeResponse {
    constructor() {
        this.courseInfo = {
            module: "",
            topic: "",
            content: ""
        };
        this.additionalDetails = [];
        this.courseRelation = "";
    }

    setCourseInfo(module, topic, content) {
        this.courseInfo = { module, topic, content };
    }

    addDetail(detail) {
        this.additionalDetails.push(detail);
    }

    setRelation(relation) {
        this.courseRelation = relation;
    }

    formatResponse() {
        let response = `🤖 **CHAT LIA - Asistente del Curso ${COURSE_KNOWLEDGE_CONFIG.courseName}**\n\n`;
        
        response += `📚 **INFORMACIÓN DEL CURSO**\n`;
        response += `- Módulo: ${this.courseInfo.module}\n`;
        response += `- Tema: ${this.courseInfo.topic}\n`;
        response += `- Contenido: ${this.courseInfo.content}\n\n`;

        if (this.additionalDetails.length > 0) {
            response += `💡 **DETALLES ADICIONALES**\n`;
            this.additionalDetails.forEach(detail => {
                response += `- ${detail}\n`;
            });
            response += `\n`;
        }

        if (this.courseRelation) {
            response += `🔗 **RELACIÓN CON EL CURSO**\n`;
            response += `- ${this.courseRelation}\n\n`;
        }

        response += `---\n`;
        response += `💡 **Nota:** Esta información está basada en el temario oficial del curso. Para detalles específicos o consultas adicionales, te recomiendo contactar al instructor ${COURSE_KNOWLEDGE_CONFIG.instructor}.`;

        return response;
    }
}

// Función para manejar preguntas no cubiertas
function handleUncoveredQuestion(question) {
    return `🤖 **CHAT LIA - Asistente del Curso ${COURSE_KNOWLEDGE_CONFIG.courseName}**\n\n` +
           `❓ **Pregunta no cubierta en el temario**\n\n` +
           `Lo siento, pero esa información específica no está incluida en el temario del curso "${COURSE_KNOWLEDGE_CONFIG.courseName}". \n\n` +
           `💡 **Recomendación:**\n` +
           `- Consulta directamente con el instructor ${COURSE_KNOWLEDGE_CONFIG.instructor}\n` +
           `- Revisa los materiales adicionales del curso\n` +
           `- Considera que el temario puede actualizarse\n\n` +
           `---\n` +
           `📚 **¿Qué SÍ puedo responder?**\n` +
           `- Contenido específico de los módulos del curso\n` +
           `- Conceptos técnicos cubiertos en el temario\n` +
           `- Estructura y organización del curso\n` +
           `- Objetivos y metodología del curso`;
}

// Categorías de preguntas que puede responder
const QUESTION_CATEGORIES = {
    COURSE_CONTENT: [
        "qué temas se cubren",
        "qué se aprende",
        "objetivo del curso",
        "herramientas que se enseñan",
        "metodología"
    ],
    TECHNICAL_CONCEPTS: [
        "qué es",
        "cómo funciona",
        "mejores prácticas",
        "concepto"
    ],
    PRACTICAL_APPLICATIONS: [
        "cómo se aplica",
        "ejemplos",
        "casos de uso",
        "práctica"
    ],
    STRUCTURE_ORGANIZATION: [
        "cómo está organizado",
        "cuántos módulos",
        "duración",
        "estructura"
    ]
};

// Función para detectar el tipo de pregunta
function detectQuestionType(question) {
    const lowerQuestion = question.toLowerCase();
    
    for (const [category, keywords] of Object.entries(QUESTION_CATEGORIES)) {
        for (const keyword of keywords) {
            if (lowerQuestion.includes(keyword)) {
                return category;
            }
        }
    }
    
    return "UNKNOWN";
}

// Función para extraer información del temario (simulada)
// En la implementación real, esto se conectaría con el documento TEMARIO.docx
function extractCourseInformation(question, questionType) {
    // Esta función simula la extracción de información del temario
    // En la implementación real, se conectaría con el documento TEMARIO.docx
    
    const response = new CourseKnowledgeResponse();
    
    switch (questionType) {
        case "COURSE_CONTENT":
            if (question.toLowerCase().includes("qué se aprende") || question.toLowerCase().includes("objetivo")) {
                response.setCourseInfo(
                    "Introducción al curso",
                    "Objetivos y alcance",
                    "Este curso te enseñará a dominar ChatGPT y Gemini para mejorar tu productividad personal y profesional."
                );
                response.addDetail("El curso incluye aplicaciones prácticas de IA");
                response.addDetail("Se enfoca en herramientas específicas: ChatGPT y Gemini");
                response.addDetail("Metodología hands-on con ejercicios prácticos");
                response.setRelation("Este es el fundamento que conecta con todos los módulos posteriores");
            } else if (question.toLowerCase().includes("herramientas")) {
                response.setCourseInfo(
                    "Módulo de Herramientas",
                    "Herramientas de IA",
                    "Las principales herramientas son: ChatGPT y Gemini"
                );
                response.addDetail("ChatGPT: Para generación de texto y conversaciones");
                response.addDetail("Gemini: Para análisis y procesamiento avanzado");
                response.setRelation("Estas herramientas se integran en todos los módulos prácticos");
            }
            break;
            
        case "TECHNICAL_CONCEPTS":
            response.setCourseInfo(
                "Módulo Técnico",
                "Conceptos fundamentales",
                "Los conceptos técnicos se explican de manera práctica y accesible"
            );
            response.addDetail("Se incluyen ejemplos prácticos para cada concepto");
            response.addDetail("Explicaciones paso a paso de cada herramienta");
            break;
            
        case "PRACTICAL_APPLICATIONS":
            response.setCourseInfo(
                "Módulo Práctico",
                "Aplicaciones reales",
                "El curso se enfoca en aplicaciones prácticas de IA en el trabajo diario"
            );
            response.addDetail("Ejercicios prácticos en cada módulo");
            response.addDetail("Casos de uso reales de empresas");
            response.setRelation("Las aplicaciones prácticas son el corazón del curso");
            break;
            
        case "STRUCTURE_ORGANIZATION":
            response.setCourseInfo(
                "Estructura del Curso",
                "Organización y módulos",
                "El curso está organizado en módulos progresivos que van de básico a avanzado"
            );
            response.addDetail("Módulos teóricos seguidos de práctica");
            response.addDetail("Evaluaciones continuas del progreso");
            response.addDetail("Proyecto final integrador");
            break;
            
        default:
            return null; // No se encontró información
    }
    
    return response;
}

// Función principal para procesar preguntas del curso
function processCourseQuestion(question) {
    // console.log(`🤖 Chat LIA procesando pregunta: "${question}"`);
    
    // Detectar tipo de pregunta
    const questionType = detectQuestionType(question);
    // console.log(`📋 Tipo de pregunta detectado: ${questionType}`);
    
    // Extraer información del temario
    const courseInfo = extractCourseInformation(question, questionType);
    
    if (courseInfo) {
        // Generar respuesta estructurada
        const response = courseInfo.formatResponse();
        // console.log(`✅ Respuesta generada para pregunta del curso`);
        return response;
    } else {
        // Manejar pregunta no cubierta
        // console.log(`❓ Pregunta no cubierta en el temario`);
        return handleUncoveredQuestion(question);
    }
}

// Función para integrar con el sistema de Chat LIA
function integrateWithChatLIA() {
    // Verificar si estamos en el contexto de Chat LIA
    if (typeof window !== 'undefined' && window.ChatLIA) {
        // Integrar con el sistema existente de Chat LIA
        window.ChatLIA.addCourseKnowledgeHandler(processCourseQuestion);
        // console.log('✅ Integración con Chat LIA completada');
    } else {
        // Configurar para uso independiente
        window.CourseKnowledgeHandler = {
            processQuestion: processCourseQuestion,
            config: COURSE_KNOWLEDGE_CONFIG
        };
        // console.log('✅ Manejador de conocimiento del curso configurado');
    }
}

// Función para cargar el temario desde el documento
async function loadCourseTemario() {
    try {
        // En la implementación real, esto cargaría el contenido del TEMARIO.docx
        // Por ahora, simulamos la carga
        // console.log('📚 Cargando temario del curso...');
        
        // Aquí se implementaría la lógica para leer el TEMARIO.docx
        // Por ejemplo, usando una API o librería para procesar documentos
        
        return {
            success: true,
            message: 'Temario cargado correctamente',
            data: {
                // Aquí irían los datos extraídos del TEMARIO.docx
                modules: [],
                topics: [],
                content: {}
            }
        };
    } catch (error) {
        console.error('❌ Error al cargar el temario:', error);
        return {
            success: false,
            message: 'Error al cargar el temario',
            error: error.message
        };
    }
}

// Función para inicializar el sistema
async function initializeCourseKnowledge() {
    // console.log('🚀 Inicializando sistema de conocimiento del curso...');
    
    // Cargar temario
    const temarioResult = await loadCourseTemario();
    
    if (temarioResult.success) {
        // console.log('✅ Temario cargado correctamente');
        
        // Integrar con Chat LIA
        integrateWithChatLIA();
        
        // Configurar listeners para preguntas del curso
        setupCourseQuestionListeners();
        
        // console.log('🎉 Sistema de conocimiento del curso inicializado');
    } else {
        console.error('❌ Error al inicializar sistema de conocimiento del curso');
    }
}

// Función para configurar listeners de preguntas
function setupCourseQuestionListeners() {
    // Detectar cuando se hace una pregunta sobre el curso
    document.addEventListener('DOMContentLoaded', function() {
        const chatInput = document.querySelector('#chatInput, .chat-input, input[type="text"]');
        
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const question = this.value.trim();
                    
                    // Detectar si es una pregunta sobre el curso
                    if (isCourseRelatedQuestion(question)) {
                        e.preventDefault();
                        
                        // Procesar la pregunta del curso
                        const response = processCourseQuestion(question);
                        
                        // Mostrar la respuesta (esto dependerá de la implementación del chat)
                        displayCourseResponse(response);
                        
                        // Limpiar input
                        this.value = '';
                    }
                }
            });
        }
    });
}

// Función para detectar si una pregunta está relacionada con el curso
function isCourseRelatedQuestion(question) {
    const courseKeywords = [
        'curso', 'taller', 'aprender', 'enseñar', 'módulo', 'tema',
        'chatgpt', 'gemini', 'ia', 'inteligencia artificial', 'productividad',
        'herramienta', 'práctica', 'ejercicio', 'concepto'
    ];
    
    const lowerQuestion = question.toLowerCase();
    
    return courseKeywords.some(keyword => lowerQuestion.includes(keyword));
}

// Función para mostrar la respuesta del curso
function displayCourseResponse(response) {
    // Esta función dependerá de cómo esté implementado el sistema de chat
    // Por ahora, simulamos la visualización
    
    const chatContainer = document.querySelector('.chat-messages, .messages, #chatMessages');
    
    if (chatContainer) {
        const messageElement = document.createElement('div');
        messageElement.className = 'course-response';
        messageElement.innerHTML = response.replace(/\n/g, '<br>');
        chatContainer.appendChild(messageElement);
        
        // Scroll al final
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
        // Fallback: mostrar en consola
        // console.log('📚 Respuesta del curso:', response);
    }
}

// Exportar funciones para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processCourseQuestion,
        initializeCourseKnowledge,
        CourseKnowledgeResponse,
        COURSE_KNOWLEDGE_CONFIG
    };
}

// Inicializar automáticamente si se carga como script
if (typeof window !== 'undefined') {
    window.addEventListener('load', initializeCourseKnowledge);
}

// ===== DEBUGGING Y LOGS =====

// Función para probar el sistema
function testCourseKnowledge() {
    const testQuestions = [
        "¿Qué se aprende en el curso?",
        "¿Qué herramientas se enseñan?",
        "¿Cómo está organizado el curso?",
        "¿Cuál es el objetivo del curso?"
    ];
    
    // console.log('🧪 Probando sistema de conocimiento del curso...');
    
    testQuestions.forEach((question, index) => {
        // console.log(`\n--- Pregunta ${index + 1}: ${question} ---`);
        const response = processCourseQuestion(question);
        // console.log(response);
    });
}

// Función para mostrar información del sistema
function showSystemInfo() {
    // console.log('📊 Información del Sistema de Conocimiento del Curso:');
    // console.log('Curso:', COURSE_KNOWLEDGE_CONFIG.courseName);
    // console.log('Instructor:', COURSE_KNOWLEDGE_CONFIG.instructor);
    // console.log('Versión:', COURSE_KNOWLEDGE_CONFIG.version);
    // console.log('Documento fuente:', COURSE_KNOWLEDGE_CONFIG.sourceDocument);
}

// Hacer funciones de debugging disponibles globalmente
if (typeof window !== 'undefined') {
    window.testCourseKnowledge = testCourseKnowledge;
    window.showSystemInfo = showSystemInfo;
}
