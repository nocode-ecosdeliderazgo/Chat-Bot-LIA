// Inicializar partículas globales si existe el contenedor
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof window.initializeParticleSystem === 'function') {
    window.initializeParticleSystem();
  }
  
  // Cargar estructura del curso desde la base de datos
  await loadCourseSessions();
});

// Configuración del chatbot según PROMPT_CLAUDE.md
const CHATBOT_CONFIG = {
    name: 'Lia',
    typingSpeed: 50,
    responseDelay: 1000,
    audioEnabled: true,
    welcomeAudio: {
        src: 'assets/audio/welcome.mp3',
        volume: 0.7
    },
    // Configuración de OpenAI (se cargará desde variables de entorno)
    openai: {
        apiKey: null, // Se cargará dinámicamente
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.7
    },
    // Configuración de base de datos (se cargará desde variables de entorno)
    database: {
        url: null // Se cargará dinámicamente
    }
};



// Estado del chatbot
let chatState = {
    isTyping: false,
    conversationHistory: [],
    currentTopic: null,
    audioContext: null,
    audioEnabled: true,
    userName: '',
    currentState: 'start',
    dbConnection: null,
    // Token para cancelar escritura simulada en curso
    typingToken: 0,
    // Referencia a audio en reproducción (bienvenida u otros)
    currentAudio: null
};

// Elementos del DOM
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const actionButton = document.getElementById('actionButton');
const audioToggle = document.getElementById('audioToggle');
const inputContainer = document.getElementById('inputContainer');

// HTML helpers para avatares estilo Messenger
function getBotAvatarHTML() {
    return `
        <div class="msg-avatar bot">
            <div class="avatar-circle">
                <img src="assets/images/AprendeIA.png" alt="Lia" onerror="this.onerror=null;this.src='assets/images/AprendeIA.jpg'" />
            </div>
        </div>
    `;
}

function getUserAvatarHTML() {
    // Obtener la foto de perfil del usuario actual
    const userProfilePicture = getCurrentUserProfilePicture();
    
    if (userProfilePicture && userProfilePicture !== 'assets/images/icono.png') {
        // Si el usuario tiene una foto personalizada, mostrarla
    return `
        <div class="msg-avatar user">
                <div class="avatar-circle">
                    <img src="${userProfilePicture}" alt="Usuario" onerror="this.onerror=null;this.src='assets/images/icono.png';" />
                </div>
            </div>
        `;
    } else {
        // Si no tiene foto personalizada, usar el ícono por defecto
        return `
            <div class="msg-avatar user">
                <div class="avatar-circle">
                    <img src="assets/images/icono.png" alt="Usuario" />
                </div>
        </div>
    `;
    }
}

// Función para obtener la foto de perfil del usuario actual
function getCurrentUserProfilePicture() {
    try {
        const currentUserData = localStorage.getItem('currentUser');
        if (!currentUserData) {
            return 'assets/images/icono.png';
        }
        
        const userData = JSON.parse(currentUserData);
        const profilePictureUrl = userData.profile_picture_url;
        
        // Verificar que sea una foto real (no un placeholder)
        if (profilePictureUrl && 
            profilePictureUrl !== '' &&
            !profilePictureUrl.includes('createSimpleAvatar') &&
            !profilePictureUrl.includes('createAvatar') &&
            profilePictureUrl.length > 100) { // Fotos reales son URLs largas
            
            return profilePictureUrl;
        }
        
        return 'assets/images/icono.png';
    } catch (error) {
        console.error('❌ Error obteniendo foto de perfil del usuario:', error);
        return 'assets/images/icono.png';
    }
}

// ===== FUNCIONES DE BASE DE DATOS MEJORADAS SEGÚN PROMPT_CLAUDE.md =====

// PASO 1: Función para probar la conexión a la base de datos
async function testDatabaseConnection() {
    try {
        if (!window.supabase) {
            console.error('❌ Supabase no está disponible');
            return { error: 'Supabase no disponible' };
        }
        
        const { data: faqData, error: faqError } = await window.supabase
            .from('chatbot_faq')
            .select('*')
            .limit(1);
        
        const { data: glossaryData, error: glossaryError } = await window.supabase
            .from('glossary_term')
            .select('*')
            .limit(1);
        
        const { data: coursesData, error: coursesError } = await window.supabase
            .from('ai_courses')
            .select('*')
            .limit(1);
        
        const { data: usersData, error: usersError } = await window.supabase
            .from('users')
            .select('*')
            .limit(1);
        
        return { 
            faqData, glossaryData, coursesData, usersData,
            faqError, glossaryError, coursesError, usersError 
        };
        
    } catch (error) {
        console.error('❌ Error testing database:', error);
        return { error };
    }
}

// Función para obtener información del usuario actual
async function getCurrentUserInfo() {
    try {
        const currentUserData = localStorage.getItem('currentUser');
        if (!currentUserData) {
            return { display_name: 'Usuario', first_name: 'Usuario' };
        }
        
        const userData = JSON.parse(currentUserData);
        
        // Si tenemos Supabase disponible, intentar obtener info completa
        if (window.supabase && userData.id) {
            const { data, error } = await window.supabase
                .from('users')
                .select('first_name, last_name, display_name, username')
                .eq('id', userData.id)
                .single();
                
            if (data && !error) {
                return {
                    display_name: data.display_name || data.first_name || data.username || 'Usuario',
                    first_name: data.first_name || data.username || 'Usuario',
                    username: data.username,
                    full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim()
                };
            }
        }
        
        // Fallback a datos locales
        return {
            display_name: userData.display_name || userData.first_name || userData.username || 'Usuario',
            first_name: userData.first_name || userData.username || 'Usuario',
            username: userData.username,
            full_name: userData.full_name || userData.display_name || userData.first_name || 'Usuario'
        };
    } catch (error) {
        console.error('❌ Error obteniendo información del usuario:', error);
        return { display_name: 'Usuario', first_name: 'Usuario' };
    }
}

// OBLIGATORIO: Consultar base de datos ANTES de responder (CORREGIDO según PROMPT)
async function getGeneralAnswer(question) {
    if (!window.supabase) {
        console.error('❌ Supabase no está disponible');
        return getFallbackAnswer(question);
    }
    
    try {
        // Prioridad 1: Consultar chatbot_faq con múltiples estrategias de búsqueda
        const searchTerms = extractKeyTerms(question);
        
        let faqData = null, faqError = null;
        
        // Estrategia 1: Búsqueda exacta por términos clave
        for (const term of searchTerms) {
            const { data: termFaqData, error: termFaqError } = await window.supabase
                .from('chatbot_faq')
                .select('answer, category, question, priority')
                .or(`question.ilike.%${term}%,answer.ilike.%${term}%`)
                .order('priority', { ascending: false })
                .limit(3);
            
            if (termFaqData && termFaqData.length > 0) {
                faqData = termFaqData;
                faqError = termFaqError;
                break;
            }
        }
        
        // Estrategia 2: Búsqueda general si no hay resultados específicos
        if (!faqData || faqData.length === 0) {
            const { data: generalFaqData, error: generalFaqError } = await window.supabase
                .from('chatbot_faq')
                .select('answer, category, question, priority')
                .or(`question.ilike.%${question.toLowerCase()}%,question.ilike.%${question}%`)
                .order('priority', { ascending: false })
                .limit(5);
            
            faqData = generalFaqData;
            faqError = generalFaqError;
        }
        
        if (faqData && faqData.length > 0) {
            return faqData[0].answer;
        }
        
        // Prioridad 2: Consultar glossary_term con múltiples estrategias
        let glossaryData = null, glossaryError = null;
        
        // Estrategia 1: Búsqueda exacta por términos clave
        for (const term of searchTerms) {
            const { data: termGlossaryData, error: termGlossaryError } = await window.supabase
                .from('glossary_term')
                .select('definition, category, term')
                .or(`term.ilike.%${term}%,definition.ilike.%${term}%`)
                .limit(3);
            
            if (termGlossaryData && termGlossaryData.length > 0) {
                glossaryData = termGlossaryData;
                glossaryError = termGlossaryError;
                break;
            }
        }
        
        // Estrategia 2: Búsqueda general
        if (!glossaryData || glossaryData.length === 0) {
            const { data: generalGlossaryData, error: generalGlossaryError } = await window.supabase
                .from('glossary_term')
                .select('definition, category, term')
                .or(`term.ilike.%${question.toLowerCase()}%,term.ilike.%${question}%`)
                .limit(5);
            
            glossaryData = generalGlossaryData;
            glossaryError = generalGlossaryError;
        }
        
        console.log('[DB_QUERY] Glossary Result:', glossaryData?.length || 0, 'resultados, Error:', glossaryError);
        
        if (glossaryData && glossaryData.length > 0) {
            console.log('✔ [DB_QUERY] Respuesta encontrada en Glossary:', glossaryData[0].term);
            return glossaryData[0].definition;
        }
        
    } catch (error) {
        console.error('❌ [DB_QUERY] Error consultando base de datos:', error);
    }
    
    // Fallback solo si las consultas a BD no funcionan
    console.log('⚠️ [DB_QUERY] No se encontró respuesta en BD, usando fallback');
    return getFallbackAnswer(question);
}

// Función auxiliar para extraer términos clave de la pregunta
function extractKeyTerms(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Limpiar palabras de conexión
    const stopWords = ['que', 'qué', 'es', 'son', 'como', 'cómo', 'para', 'por', 'un', 'una', 'el', 'la', 'los', 'las', 'de', 'del', 'y', 'o'];
    const words = lowerQuestion.split(/\s+/).filter(word => 
        word.length > 2 && !stopWords.includes(word)
    );
    
    // Términos técnicos específicos
    const techTerms = {
        'chatgpt': ['chatgpt', 'chat gpt', 'gpt'],
        'llm': ['llm', 'large language model', 'modelo de lenguaje'],
        'ia': ['ia', 'inteligencia artificial', 'artificial intelligence'],
        'deepseek': ['deepseek', 'deep seek'],
        'prompt': ['prompt', 'prompts'],
        'machine learning': ['machine learning', 'ml', 'aprendizaje automático'],
        'deep learning': ['deep learning', 'aprendizaje profundo']
    };
    
    const extractedTerms = [];
    
    // Buscar términos técnicos
    for (const [mainTerm, variations] of Object.entries(techTerms)) {
        if (variations.some(variation => lowerQuestion.includes(variation))) {
            extractedTerms.push(mainTerm);
            extractedTerms.push(...variations.filter(v => lowerQuestion.includes(v)));
        }
    }
    
    // Agregar palabras clave individuales
    extractedTerms.push(...words);
    
    return [...new Set(extractedTerms)]; // Remover duplicados
}

// Función de fallback mejorada (solo para casos donde la BD no tiene datos)
function getFallbackAnswer(question) {
    console.log('🔄 [FALLBACK] Generando respuesta de fallback para:', question);
    
    const lowerQuestion = question.toLowerCase();
    
    // Solo respuestas muy básicas como último recurso
    const basicTerms = {
        'chatgpt': 'ChatGPT es un modelo de lenguaje desarrollado por OpenAI que utiliza inteligencia artificial para generar texto similar al humano.',
        'llm': 'LLM (Large Language Model) es un modelo de inteligencia artificial entrenado para procesar y generar texto humano.',
        'ia': 'La Inteligencia Artificial (IA) es la simulación de procesos de inteligencia humana en máquinas.',
        'deepseek': 'DeepSeek es un modelo de inteligencia artificial desarrollado por DeepSeek AI.',
        'prompt': 'Un prompt es una instrucción o pregunta que se le da a un modelo de inteligencia artificial para obtener una respuesta específica.'
    };
    
    for (const [term, answer] of Object.entries(basicTerms)) {
        if (lowerQuestion.includes(term)) {
            console.log('✔ [FALLBACK] Respuesta básica encontrada para:', term);
            return answer;
        }
    }
    
    console.log('❌ [FALLBACK] No hay respuesta disponible');
    return `No encontré información específica sobre "${question}" en nuestra base de datos. Te recomiendo consultar nuestros cursos donde cubrimos estos temas en detalle.`;
}

// FUNCIONES DE CHAT_SESSION SEGÚN PROMPT_CLAUDE.md

// Función para crear/actualizar sesión de chat
async function createOrUpdateChatSession(userId, courseId = null) {
    console.log('🔧 Creando/actualizando sesión de chat para usuario:', userId);
    
    try {
        if (!window.supabase) {
            console.warn('⚠️ Supabase no disponible para crear chat_session');
            return null;
        }

        // Verificar si ya existe una sesión activa
        const { data: existingSession, error: existingError } = await window.supabase
            .from('chat_session')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (existingSession) {
            console.log('✔ Sesión existente encontrada:', existingSession);
            return existingSession;
        }

        // Si no hay sesión activa, crear una nueva
        const { data: newSession, error: newError } = await window.supabase
            .from('chat_session')
            .insert({
                user_id: userId,
                course_id: courseId,
                is_active: true
            })
            .select()
            .single();

        console.log('✔ Nueva sesión creada:', newSession);
        return newSession;
    } catch (error) {
        console.error('❌ Error creando chat_session:', error);
        return null;
    }
}

// Función para obtener contexto del usuario
async function getUserChatContext(userId) {
    console.log('🔍 Obteniendo contexto de chat para usuario:', userId);
    
    try {
        if (!window.supabase) {
            console.warn('⚠️ Supabase no disponible para getUserChatContext');
            return null;
        }

        // Obtener sesión activa
        const { data: session, error: sessionError } = await window.supabase
            .from('chat_session')
            .select(`
                *,
                ai_courses!inner(
                    id_ai_courses,
                    name,
                    short_description,
                    long_description,
                    session_count,
                    total_duration,
                    price,
                    currency
                ),
                course_module!inner(
                    id,
                    title,
                    description,
                    position,
                    session_id
                )
            `)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        console.log('Session Context:', session, sessionError);
        return session;
    } catch (error) {
        console.error('❌ Error obteniendo contexto de chat:', error);
        return null;
    }
}

// Ahora se usan getGeneralAnswer(), getCurrentUserCourse() y getCourseDetails() que son más específicas

// OBLIGATORIO: Consultar información específica del usuario y curso (según PROMPT)
async function getCurrentUserCourse(userId) {
    try {
        console.log('🎓 Consultando cursos del usuario:', userId);
        
        if (!window.supabase || !userId) {
            console.warn('⚠️ Supabase no disponible o userId faltante');
            return null;
        }
        
        // PRIMERO: Intentar obtener contexto de chat_session (MÉTODO MEJORADO según PROMPT)
        const chatContext = await getUserChatContext(userId);
        
        if (chatContext && chatContext.ai_courses) {
            console.log('✔ Usuario tiene sesión activa con curso:', chatContext.ai_courses.name);
            return [chatContext.ai_courses];
        }
        
        // SEGUNDO: Si no hay sesión, intentar enrollment (MÉTODO ORIGINAL)
        console.log('🔍 No hay sesión activa, intentando enrollment...');
        const { data: enrollmentData, error: enrollmentError } = await window.supabase
            .from('enrollment')
            .select('*')
            .eq('user_id', userId);
        
        console.log('📋 Enrollment Data:', enrollmentData, enrollmentError);
        
        if (enrollmentData && enrollmentData.length > 0) {
            console.log('✔ Usuario tiene inscripciones:', enrollmentData.length);
            
            // 2. Obtener información del curso actual
            const courseIds = enrollmentData.map(enrollment => enrollment.course_id);
            console.log('Course IDs:', courseIds);
            
            const { data: courseData, error: courseError } = await window.supabase
                .from('ai_courses')
                .select('id_ai_courses, name, short_description, long_description, course_url, session_count, total_duration, price, currency')
                .in('id_ai_courses', courseIds);
            
            console.log('Course Data:', courseData, courseError);
            return courseData;
        } else {
            console.log('❌ Usuario no tiene inscripciones');
            // Intentar método alternativo si enrollment no funciona
            console.log('🔄 Intentando método alternativo...');
            return await getCurrentUserCourseAlternative(userId);
        }
    } catch (error) {
        console.error('❌ Error en getCurrentUserCourse:', error);
        return null;
    }
}

async function getCourseDetails(courseId) {
    try {
        if (!window.supabase || !courseId) {
            return null;
        }
        
        console.log('📚 Consultando detalles del curso:', courseId);
        
        // Consultar información específica del curso
        const { data: courseInfo, error: courseError } = await window.supabase
            .from('ai_courses')
            .select('name, short_description, long_description, course_url, session_count, total_duration, price, currency')
            .eq('id_ai_courses', courseId)
            .single();
        
        // Consultar módulos del curso
        const { data: courseModules, error: modulesError } = await window.supabase
            .from('course_module')
            .select('title, description, position, session_id')
            .eq('course_id', courseId)
            .order('position', { ascending: true });
        
        console.log('📚 Course Details:', { courseInfo, courseModules });
        return { courseInfo, courseModules };
    } catch (error) {
        console.error('❌ Error en getCourseDetails:', error);
        return null;
    }
}

// FUNCIÓN PARA VERIFICAR SI EL USUARIO ESTÁ INSCRITO (según PROMPT)
async function checkUserEnrollment(userId) {
  console.log('🔍 Verificando inscripción del usuario:', userId);
  
  // Probar tabla enrollment
  const { data: enrollmentData, error: enrollmentError } = await window.supabase
    .from('enrollment')
    .select('*')
    .eq('user_id', userId);
  
  console.log('Enrollment check:', enrollmentData, enrollmentError);
  
  // Probar tabla study_session como alternativa
  const { data: sessionData, error: sessionError } = await window.supabase
    .from('study_session')
    .select('*')
    .eq('user_id', userId);
  
  console.log('Session check:', sessionData, sessionError);
  
  return { enrollmentData, sessionData, enrollmentError, sessionError };
}

// FUNCIÓN ALTERNATIVA: Si enrollment no funciona, probar otras tablas (según PROMPT)
async function getCurrentUserCourseAlternative(userId) {
  console.log('🔍 Intentando método alternativo para usuario:', userId);
  
  // Probar con study_session si existe
  const { data: sessionData, error: sessionError } = await window.supabase
    .from('study_session')
    .select('course_id')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1);

  console.log('Session Data:', sessionData, sessionError);

  if (sessionData && sessionData.length > 0) {
    const courseId = sessionData[0].course_id;
    const { data: courseData, error: courseError } = await window.supabase
      .from('ai_courses')
      .select('*')
      .eq('id_ai_courses', courseId);

    console.log('Course Data (Alternative):', courseData, courseError);
    return courseData;
  }

  return null;
}

// ===== SISTEMA DE MEMORIA CONVERSACIONAL PERSISTENTE =====

// Estado avanzado de la conversación
let conversationMemory = {
    // Contexto inmediato (1-2 mensajes)
    lastBotAction: null,
    lastUserIntent: null,
    awaitingConfirmation: null,
    
    // Historial completo de la conversación
    fullHistory: [],
    
    // Memoria de largo plazo
    userPreferences: {},
    mentionedTopics: new Set(),
    previousQuestions: [],
    
    // Estado de la conversación
    conversationStarted: null,
    lastActivity: null,
    sessionId: null
};

// Inicializar memoria conversacional desde localStorage
function initializeConversationMemory() {
    try {
        const savedMemory = localStorage.getItem('conversationMemory');
        if (savedMemory) {
            const parsed = JSON.parse(savedMemory);
            // Restaurar datos básicos pero reiniciar contexto inmediato
            conversationMemory.fullHistory = parsed.fullHistory || [];
            conversationMemory.userPreferences = parsed.userPreferences || {};
            conversationMemory.mentionedTopics = new Set(parsed.mentionedTopics || []);
            conversationMemory.previousQuestions = parsed.previousQuestions || [];
            conversationMemory.sessionId = parsed.sessionId;
            
            console.log('💾 [MEMORY] Memoria conversacional restaurada:', conversationMemory.fullHistory.length, 'mensajes');
        } else {
            conversationMemory.sessionId = generateSessionId();
            conversationMemory.conversationStarted = new Date().toISOString();
            console.log('🆕 [MEMORY] Nueva sesión conversacional iniciada:', conversationMemory.sessionId);
        }
    } catch (error) {
        console.error('❌ Error inicializando memoria conversacional:', error);
        conversationMemory.sessionId = generateSessionId();
        conversationMemory.conversationStarted = new Date().toISOString();
    }
}

// Generar ID único para la sesión
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Guardar memoria en localStorage
function saveConversationMemory() {
    try {
        const toSave = {
            fullHistory: conversationMemory.fullHistory,
            userPreferences: conversationMemory.userPreferences,
            mentionedTopics: Array.from(conversationMemory.mentionedTopics),
            previousQuestions: conversationMemory.previousQuestions,
            sessionId: conversationMemory.sessionId,
            conversationStarted: conversationMemory.conversationStarted,
            lastActivity: new Date().toISOString()
        };
        localStorage.setItem('conversationMemory', JSON.stringify(toSave));
        console.log('💾 [MEMORY] Memoria guardada exitosamente');
    } catch (error) {
        console.error('❌ Error guardando memoria conversacional:', error);
    }
}

// Agregar mensaje al historial completo
function addToConversationHistory(sender, message, messageType = null, context = null) {
    const historyEntry = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        sender: sender, // 'user' or 'bot'
        message: message,
        messageType: messageType,
        context: context ? { ...context } : null
    };
    
    conversationMemory.fullHistory.push(historyEntry);
    conversationMemory.lastActivity = historyEntry.timestamp;
    
    // Mantener solo los últimos 50 mensajes para no saturar localStorage
    if (conversationMemory.fullHistory.length > 50) {
        conversationMemory.fullHistory = conversationMemory.fullHistory.slice(-50);
    }
    
    // Actualizar memoria de temas mencionados
    if (sender === 'user') {
        updateMentionedTopics(message);
        conversationMemory.previousQuestions.push({
            question: message,
            timestamp: historyEntry.timestamp
        });
        
        // Mantener solo las últimas 20 preguntas
        if (conversationMemory.previousQuestions.length > 20) {
            conversationMemory.previousQuestions = conversationMemory.previousQuestions.slice(-20);
        }
    }
    
    saveConversationMemory();
    console.log('📝 [MEMORY] Mensaje agregado al historial:', sender, message.substring(0, 50) + '...');
}

// Actualizar temas mencionados
function updateMentionedTopics(message) {
    const topics = [
        'chatgpt', 'llm', 'ia', 'inteligencia artificial', 'machine learning', 
        'deep learning', 'prompt', 'deepseek', 'curso', 'taller', 'modulo'
    ];
    
    const lowerMessage = message.toLowerCase();
    topics.forEach(topic => {
        if (lowerMessage.includes(topic)) {
            conversationMemory.mentionedTopics.add(topic);
        }
    });
}

// Analizar contexto conversacional completo
function analyzeConversationContext(currentMessage) {
    console.log('🧠 [CONTEXT] Analizando contexto conversacional completo...');
    
    // Obtener últimos N mensajes para análisis
    const recentHistory = conversationMemory.fullHistory.slice(-10); // Últimos 10 mensajes
    console.log('🧠 [CONTEXT] Analizando últimos', recentHistory.length, 'mensajes');
    
    const analysis = {
        // Contexto inmediato (último intercambio)
        lastBotAction: conversationMemory.lastBotAction,
        awaitingConfirmation: conversationMemory.awaitingConfirmation,
        
        // Análisis de patrones
        recentUserQuestions: [],
        recentBotActions: [],
        topicsDiscussed: [],
        
        // Estado conversacional
        conversationFlow: null,
        needsContext: false,
        suggestedContext: null
    };
    
    // Analizar mensajes recientes
    recentHistory.forEach(entry => {
        if (entry.sender === 'user') {
            analysis.recentUserQuestions.push({
                question: entry.message,
                timestamp: entry.timestamp,
                messageType: entry.messageType
            });
        } else if (entry.sender === 'bot') {
            analysis.recentBotActions.push({
                action: entry.context?.botAction || 'unknown',
                timestamp: entry.timestamp
            });
        }
    });
    
    // Detectar si necesita contexto de mensajes anteriores
    analysis.needsContext = detectIfNeedsContext(currentMessage, analysis);
    
    // Sugerir contexto relevante
    if (analysis.needsContext) {
        analysis.suggestedContext = findRelevantContext(currentMessage, recentHistory);
    }
    
    console.log('🧠 [CONTEXT] Análisis completado:', {
        recentQuestions: analysis.recentUserQuestions.length,
        recentActions: analysis.recentBotActions.length,
        needsContext: analysis.needsContext,
        hasContext: !!analysis.suggestedContext
    });
    
    return analysis;
}

// Detectar si el mensaje actual necesita contexto de mensajes anteriores
function detectIfNeedsContext(message, analysis) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Palabras/frases que indican continuidad conversacional
    const contextualClues = [
        'si', 'sí', 'si por favor', 'sí por favor', 'claro', 'perfecto', 'dale',
        'no', 'no gracias', 'mejor no',
        'y', 'también', 'además', 'pero', 'sin embargo',
        'eso', 'esto', 'lo anterior', 'lo que dijiste', 'como mencionaste',
        'más información', 'cuéntame más', 'explica mejor',
        'ese', 'esa', 'esos', 'esas', 'el que', 'la que'
    ];
    
    // Referencias pronominales o contextuales
    const hasContextualClues = contextualClues.some(clue => lowerMessage.includes(clue));
    
    // Mensajes muy cortos probablemente necesiten contexto
    const isShortResponse = message.length < 15;
    
    // Si hay una confirmación pendiente y el mensaje es corto
    const hasPendingConfirmation = conversationMemory.awaitingConfirmation !== null;
    
    return hasContextualClues || (isShortResponse && hasPendingConfirmation);
}

// Encontrar contexto relevante de la conversación
function findRelevantContext(currentMessage, recentHistory) {
    console.log('🔍 [CONTEXT] Buscando contexto relevante para:', currentMessage);
    
    // Buscar el último mensaje del bot que hizo una pregunta o ofreció algo
    const lastBotQuestion = [...recentHistory]
        .reverse()
        .find(entry => 
            entry.sender === 'bot' && 
            (entry.message.includes('?') || entry.message.includes('gustaría') || entry.message.includes('quieres'))
        );
    
    // Buscar mensajes relacionados por temas
    const currentTopics = extractTopicsFromMessage(currentMessage);
    const relatedMessages = recentHistory.filter(entry => {
        const entryTopics = extractTopicsFromMessage(entry.message);
        return currentTopics.some(topic => entryTopics.includes(topic));
    });
    
    return {
        lastBotQuestion: lastBotQuestion,
        relatedMessages: relatedMessages.slice(-3), // Últimos 3 mensajes relacionados
        conversationFlow: determineConversationFlow(recentHistory)
    };
}

// Extraer temas de un mensaje
function extractTopicsFromMessage(message) {
    const topics = [];
    const lowerMessage = message.toLowerCase();
    
    const topicKeywords = {
        'cursos': ['curso', 'cursos', 'taller', 'talleres'],
        'ia': ['ia', 'inteligencia artificial', 'ai'],
        'contenido': ['temas', 'contenido', 'modulo', 'módulos', 'sesion', 'sesiones'],
        'definiciones': ['que es', 'qué es', 'significa', 'definicion']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            topics.push(topic);
        }
    });
    
    return topics;
}

// Determinar el flujo de conversación
function determineConversationFlow(recentHistory) {
    if (recentHistory.length < 2) return 'initial';
    
    const lastFewMessages = recentHistory.slice(-4);
    const patterns = [];
    
    lastFewMessages.forEach(entry => {
        if (entry.messageType) {
            patterns.push(entry.messageType);
        }
    });
    
    // Detectar patrones comunes
    if (patterns.includes('course') && patterns.includes('confirmation_yes')) {
        return 'course_exploration';
    }
    
    if (patterns.includes('general') && patterns.includes('general')) {
        return 'learning_session';
    }
    
    return 'normal_conversation';
}

// ===== SISTEMA DE CLASIFICACIÓN DE PREGUNTAS MEJORADO =====

// Clasificación mejorada de preguntas con análisis completo de contexto
function classifyQuestion(question) {
    console.log('📋 [CLASSIFY] Clasificando pregunta:', question);
    
    // Analizar contexto completo de la conversación
    const contextAnalysis = analyzeConversationContext(question);
    console.log('📋 [CLASSIFY] Contexto analizado:', contextAnalysis.needsContext, contextAnalysis.conversationFlow);
    
    const lowerQuestion = question.toLowerCase().trim();
    
    // 0. RESPUESTAS DE CONFIRMACIÓN (NUEVA CATEGORÍA CON CONTEXTO)
    const confirmationTerms = [
        'si', 'sí', 'si por favor', 'sí por favor', 'si porfavor', 'sí porfavor',
        'claro', 'por supuesto', 'perfecto', 'dale', 'ok', 'okay', 'vale', 'adelante',
        'me interesa', 'quiero', 'quiero saber', 'dime', 'muéstrame', 'enséñame'
    ];
    
    const negationTerms = ['no', 'no gracias', 'nah', 'para nada', 'mejor no'];
    
    // Si hay confirmación pendiente Y el contexto indica continuidad conversacional
    if (conversationMemory.awaitingConfirmation && 
        (confirmationTerms.some(term => lowerQuestion.includes(term)) || contextAnalysis.needsContext)) {
        console.log('✔ [CLASSIFY] Clasificada como: confirmation_yes (con contexto)');
        return 'confirmation_yes';
    }
    
    // Si hay confirmación pendiente y el usuario responde negativamente
    if (conversationMemory.awaitingConfirmation && negationTerms.some(term => lowerQuestion === term)) {
        console.log('✔ [CLASSIFY] Clasificada como: confirmation_no (con contexto)');
        return 'confirmation_no';
    }
    
    // 1. Preguntas sobre TEMAS/CONTENIDO de cursos (NUEVA CATEGORÍA ESPECÍFICA)
    const courseContentTerms = [
        'que temas tiene', 'qué temas tiene', 'temas del curso', 'contenido del curso',
        'que incluye el curso', 'qué incluye el curso', 'temario', 'programa',
        'que voy a aprender', 'qué voy a aprender', 'que aprenderé', 'qué aprenderé',
        'modulos', 'módulos', 'sesiones', 'lecciones'
    ];
    
    if (courseContentTerms.some(term => lowerQuestion.includes(term))) {
        console.log('✔ [CLASSIFY] Clasificada como: course_content');
        return 'course_content';
    }
    
    // 2. Preguntas sobre el curso actual del usuario (MÁXIMA PRIORIDAD)
    const currentCourseTerms = [
        'curso en el que estoy', 'curso actual', 'en el que estoy', 'actualmente', 
        'inscrito en', 'mi curso', 'como se llama el curso', 'cuál es mi curso',
        'curso que estoy tomando', 'curso al que pertenezco'
    ];
    if (currentCourseTerms.some(term => lowerQuestion.includes(term))) {
        console.log('✔ [CLASSIFY] Clasificada como: current_course');
        return 'current_course';
    }
    
    // 3. Preguntas generales de definición (ALTA PRIORIDAD) - TÉRMINOS ESPECÍFICOS DEL PROMPT
    const generalTerms = ['que es', 'qué es', 'que significa', 'qué significa', 'definición', 'definir', 'explica', 'explicame'];
    const techTerms = [
        // Términos específicos mencionados en PROMPT_CLAUDE.md
        'chatgpt', 'chat gpt', 'gpt',
        'llm', 'large language model', 'modelo de lenguaje',
        'ia', 'inteligencia artificial', 'artificial intelligence',
        'deepseek', 'deep seek',
        'prompt', 'prompts',
        'machine learning', 'ml', 'aprendizaje automático',
        'deep learning', 'aprendizaje profundo',
        'neural network', 'redes neuronales', 'red neuronal'
    ];
    
    const hasGeneralTerm = generalTerms.some(term => lowerQuestion.includes(term));
    const hasTechTerm = techTerms.some(term => lowerQuestion.includes(term));
    
    if (hasGeneralTerm && hasTechTerm) {
        console.log('✔ [CLASSIFY] Clasificada como: general (definición técnica)');
        return 'general';
    }
    
    // 4. Preguntas técnicas sin palabras de definición explícitas
    if (hasTechTerm && !hasGeneralTerm) {
        console.log('✔ [CLASSIFY] Clasificada como: general (término técnico directo)');
        return 'general';
    }
    
    // 5. Preguntas sobre cursos en general (SOLICITAR INFORMACIÓN DE CURSOS)
    const courseTerms = [
        'curso', 'cursos', 'taller', 'talleres', 'aprender', 'inscribir', 'precio', 'precios',
        'duración', 'horas', 'cursos disponibles', 'que cursos hay', 'qué cursos hay'
    ];
    if (courseTerms.some(term => lowerQuestion.includes(term))) {
        console.log('✔ [CLASSIFY] Clasificada como: course');
        return 'course';
    }
    
    // 6. Preguntas sobre información específica del usuario
    const userTerms = [
        'mi', 'mis', 'yo', 'estoy', 'tengo', 'inscrito', 'mis cursos',
        'mi progreso', 'mi avance', 'cuántos cursos tengo'
    ];
    if (userTerms.some(term => lowerQuestion.includes(term))) {
        console.log('✔ [CLASSIFY] Clasificada como: user_specific');
        return 'user_specific';
    }
    
    // 7. Saludos básicos
    const greetingTerms = ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos', 'hi', 'hello'];
    if (greetingTerms.some(term => lowerQuestion.includes(term))) {
        console.log('✔ [CLASSIFY] Clasificada como: greeting');
        return 'greeting';
    }
    
    // 8. Si no se puede clasificar específicamente, tratar como pregunta general
    console.log('⚠️ [CLASSIFY] Clasificada como: mixed (intentará consulta general)');
    return 'mixed';
}

// Función para obtener todos los cursos disponibles
async function getAvailableCourses() {
    console.log('🎓 [COURSES] Consultando cursos disponibles...');
    
    if (!window.supabase) {
        console.error('❌ Supabase no está disponible');
        return null;
    }
    
    try {
        const { data: coursesData, error: coursesError } = await window.supabase
            .from('ai_courses')
            .select('id_ai_courses, name, short_description, long_description, session_count, total_duration, price, currency')
            .order('name', { ascending: true });
        
        console.log('🎓 [COURSES] Cursos encontrados:', coursesData?.length || 0);
        console.log('🎓 [COURSES] Error:', coursesError);
        
        return coursesData;
    } catch (error) {
        console.error('❌ Error consultando cursos disponibles:', error);
        return null;
    }
}

// Función para obtener contenido/temas de un curso específico
async function getCourseContent(courseId) {
    console.log('📚 [CONTENT] Consultando contenido del curso:', courseId);
    
    if (!window.supabase) {
        console.error('❌ Supabase no está disponible');
        return null;
    }
    
    try {
        const { data: moduleData, error: moduleError } = await window.supabase
            .from('course_module')
            .select('title, description, position, session_id')
            .eq('course_id', courseId)
            .order('position', { ascending: true });
        
        console.log('📚 [CONTENT] Módulos encontrados:', moduleData?.length || 0);
        return moduleData;
    } catch (error) {
        console.error('❌ Error consultando contenido del curso:', error);
        return null;
    }
}

// Función para actualizar el contexto de la conversación con memoria persistente
function updateConversationContext(botAction, userIntent, awaitingConfirmation = null) {
    conversationMemory.lastBotAction = botAction;
    conversationMemory.lastUserIntent = userIntent;
    conversationMemory.awaitingConfirmation = awaitingConfirmation;
    
    // Actualizar preferencias del usuario basadas en el contexto
    if (userIntent) {
        conversationMemory.userPreferences[userIntent] = (conversationMemory.userPreferences[userIntent] || 0) + 1;
    }
    
    saveConversationMemory();
    console.log('📝 [CONTEXT] Contexto actualizado con memoria persistente:', {
        botAction,
        userIntent,
        awaitingConfirmation,
        historyLength: conversationMemory.fullHistory.length
    });
}

// Generación de respuestas personalizada con memoria conversacional persistente
async function generatePersonalizedResponse(userQuestion, userId, courseId) {
    try {
        console.log('🤖 [RESPONSE] Generando respuesta personalizada para:', userQuestion);
        console.log('👤 [RESPONSE] Usuario ID:', userId);
        
        // Registrar pregunta del usuario en el historial
        addToConversationHistory('user', userQuestion);
        
        // Analizar contexto completo antes de clasificar
        const contextAnalysis = analyzeConversationContext(userQuestion);
        const questionType = classifyQuestion(userQuestion);
        console.log('📋 [RESPONSE] Tipo de pregunta clasificada:', questionType);
        console.log('🧠 [RESPONSE] Análisis de contexto:', contextAnalysis.needsContext, contextAnalysis.suggestedContext?.lastBotQuestion?.message?.substring(0, 50));
        
        const userInfo = await getCurrentUserInfo();
        
        let response = '';
        let responseContext = {
            questionType: questionType,
            userId: userId,
            contextUsed: contextAnalysis.needsContext,
            suggestedContext: contextAnalysis.suggestedContext
        };
        
        switch (questionType) {
            case 'confirmation_yes':
                // Usuario respondió afirmativamente a una pregunta anterior
                console.log('✅ [RESPONSE] Procesando confirmación positiva...');
                
                if (conversationContext.awaitingConfirmation === 'show_courses') {
                    // Mostrar cursos disponibles
                    const availableCourses = await getAvailableCourses();
                    
                    if (availableCourses && availableCourses.length > 0) {
                        response = `¡Perfecto ${userInfo.display_name || userInfo.first_name}! Aquí tienes nuestros cursos disponibles:\n\n`;
                        
                        availableCourses.forEach((course, index) => {
                            response += `📚 **${course.name}**\n`;
                            response += `${course.short_description}\n`;
                            if (course.session_count) response += `• ${course.session_count} sesiones\n`;
                            if (course.total_duration) response += `• ${course.total_duration} horas de contenido\n`;
                            if (course.price && course.currency) response += `• Precio: ${course.price} ${course.currency}\n`;
                            response += `\n`;
                        });
                        
                        response += `¿Te interesa algún curso en particular o quieres más información sobre alguno?`;
                    } else {
                        response = `${userInfo.display_name || userInfo.first_name}, tenemos un excelente curso de Inteligencia Artificial que cubre desde fundamentos hasta aplicaciones prácticas. ¿Te gustaría más información?`;
                    }
                    updateConversationContext('showed_courses', 'wants_course_info', null);
                } else {
                    response = `¡Perfecto ${userInfo.display_name || userInfo.first_name}! ¿En qué más puedo ayudarte?`;
                    updateConversationContext(null, null, null);
                }
                break;
                
            case 'confirmation_no':
                // Usuario respondió negativamente
                console.log('❌ [RESPONSE] Procesando confirmación negativa...');
                response = `Entiendo ${userInfo.display_name || userInfo.first_name}. ¿Hay algo más en lo que pueda ayudarte?`;
                updateConversationContext(null, null, null);
                break;
                
            case 'course_content':
                // Usuario pregunta sobre temas/contenido de un curso
                console.log('📚 [RESPONSE] Procesando pregunta sobre contenido del curso...');
                const userCourses = await getCurrentUserCourse(userId);
                
                if (userCourses && userCourses.length > 0) {
                    const currentCourse = userCourses[0];
                    const courseContent = await getCourseContent(currentCourse.id_ai_courses);
                    
                    if (courseContent && courseContent.length > 0) {
                        response = `${userInfo.display_name || userInfo.first_name}, el curso "${currentCourse.name}" incluye los siguientes temas:\n\n`;
                        
                        courseContent.forEach((module, index) => {
                            response += `${index + 1}. **${module.title}**\n`;
                            if (module.description) {
                                response += `   ${module.description}\n`;
                            }
                            response += `\n`;
                        });
                        
                        response += `¿Te gustaría profundizar en algún tema específico?`;
                    } else {
                        response = `${userInfo.display_name || userInfo.first_name}, tu curso "${currentCourse.name}" cubre temas fundamentales de Inteligencia Artificial, incluyendo conceptos básicos, aplicaciones prácticas y herramientas modernas. ¿Hay algún tema específico que te interese?`;
                    }
                } else {
                    response = `${userInfo.display_name || userInfo.first_name}, actualmente no tienes cursos inscritos. ¿Te gustaría conocer nuestros cursos disponibles para ver los temas que cubren?`;
                    updateConversationContext('offered_courses', 'asked_course_content', 'show_courses');
                }
                break;
                
            case 'general':
                // OBLIGATORIO: Consultar base de datos para definiciones
                console.log('📚 [RESPONSE] Procesando pregunta general...');
                const generalAnswer = await getGeneralAnswer(userQuestion);
                response = `Hola ${userInfo.display_name || userInfo.first_name}, ${generalAnswer}`;
                updateConversationContext('answered_general', 'asked_general', null);
                break;
                
            case 'course':
                // OBLIGATORIO: Consultar cursos específicos del usuario
                console.log('🎓 [RESPONSE] Procesando pregunta sobre cursos...');
                const userCourseList = await getCurrentUserCourse(userId);
                
                if (userCourseList && userCourseList.length > 0) {
                    const currentCourse = userCourseList[0];
                    response = `${userInfo.display_name || userInfo.first_name}, actualmente estás inscrito en el curso "${currentCourse.name}". ${currentCourse.short_description}`;
                    updateConversationContext('showed_user_course', 'asked_about_courses', null);
                } else {
                    response = `${userInfo.display_name || userInfo.first_name}, no tienes cursos inscritos actualmente. ¿Te gustaría conocer nuestros cursos disponibles?`;
                    updateConversationContext('offered_courses', 'asked_about_courses', 'show_courses');
                }
                break;
                
            case 'current_course':
                // Para preguntas específicas sobre el curso actual
                console.log('📚 [RESPONSE] Procesando pregunta sobre curso actual...');
                const userCurrentCourses = await getCurrentUserCourse(userId);
                
                if (userCurrentCourses && userCurrentCourses.length > 0) {
                    const currentCourse = userCurrentCourses[0];
                    const courseDetails = await getCourseDetails(currentCourse.id_ai_courses);
                    
                    if (courseDetails && courseDetails.courseInfo) {
                        response = `${userInfo.display_name || userInfo.first_name}, tu curso actual es "${currentCourse.name}". Incluye ${courseDetails.courseInfo.session_count} sesiones con un total de ${courseDetails.courseInfo.total_duration} horas de contenido.`;
                    } else {
                        response = `${userInfo.display_name || userInfo.first_name}, tu curso actual es "${currentCourse.name}".`;
                    }
                    updateConversationContext('showed_current_course', 'asked_current_course', null);
                } else {
                    response = `${userInfo.display_name || userInfo.first_name}, no tienes cursos inscritos actualmente. ¿Te gustaría conocer nuestros cursos disponibles?`;
                    updateConversationContext('offered_courses', 'asked_current_course', 'show_courses');
                }
                break;
                
            case 'user_specific':
                // Consultar información específica del usuario
                console.log('👤 [RESPONSE] Procesando pregunta específica del usuario...');
                const userSpecificCourses = await getCurrentUserCourse(userId);
                if (userSpecificCourses && userSpecificCourses.length > 0) {
                    response = `${userInfo.display_name || userInfo.first_name}, tienes ${userSpecificCourses.length} curso(s) inscrito(s).`;
                } else {
                    response = `${userInfo.display_name || userInfo.first_name}, no tienes cursos inscritos actualmente.`;
                }
                updateConversationContext('showed_user_info', 'asked_user_specific', null);
                break;
                
            case 'greeting':
                response = `¡Hola ${userInfo.display_name || userInfo.first_name}! ¿En qué puedo ayudarte hoy?`;
                updateConversationContext('greeted', 'greeted', null);
                break;
                
            default:
                // Intentar consultar base de datos para cualquier pregunta
                console.log('🔍 [RESPONSE] Procesando pregunta mixta...');
                const mixedAnswer = await getGeneralAnswer(userQuestion);
                response = `Hola ${userInfo.display_name || userInfo.first_name}, ${mixedAnswer}`;
                updateConversationContext('answered_mixed', 'asked_mixed', null);
                break;
        }
        
        // Registrar respuesta del bot en el historial
        addToConversationHistory('bot', response, questionType, {
            botAction: conversationMemory.lastBotAction,
            awaitingConfirmation: conversationMemory.awaitingConfirmation,
            contextUsed: responseContext.contextUsed
        });
        
        console.log('✅ [RESPONSE] Respuesta generada y guardada en historial:', response.substring(0, 100) + '...');
        console.log('📊 [MEMORY] Historial actual:', conversationMemory.fullHistory.length, 'mensajes');
        
        return response;
        
    } catch (error) {
        console.error('❌ Error generando respuesta personalizada:', error);
        const userInfo = await getCurrentUserInfo();
        const errorResponse = `Hola ${userInfo.display_name || userInfo.first_name}, disculpa, tuve un problema técnico. ¿Podrías repetir tu pregunta?`;
        
        // Registrar error también
        addToConversationHistory('bot', errorResponse, 'error', { error: error.message });
        
        return errorResponse;
    }
}

// Ahora se usa generatePersonalizedResponse() que maneja todos los casos

// Función de inicialización principal consolidada
function init() {
    console.log('[CHAT_INIT] Iniciando aplicación...');
    
    try {
        // Inicializar memoria conversacional persistente
        initializeConversationMemory();
        console.log('[CHAT_INIT] Memoria conversacional inicializada');
        
    // EventBus y UI API para el nuevo layout tipo NotebookLM
    setupEventBusAndUI();
        console.log('[CHAT_INIT] EventBus y UI configurados');
        
        // Seguridad e inicializaciones básicas
    initializeSecurity();
        console.log('[CHAT_INIT] Seguridad inicializada');
        
        // Audio (opcional, no debe romper si falla)
        try {
    initializeAudio();
    loadAudioPreference();
            console.log('[CHAT_INIT] Audio inicializado');
        } catch (error) {
            console.warn('[CHAT_INIT] Error inicializando audio:', error);
        }
        
        // Base de datos (opcional)
        try {
    initializeDatabase();
            console.log('[CHAT_INIT] Base de datos inicializada');
        } catch (error) {
            console.warn('[CHAT_INIT] Error inicializando base de datos:', error);
        }
        
        // Animación de apertura y chat principal
    playChatOpenAnimation().then(() => {
    initializeChat();
            console.log('[CHAT_INIT] Chat inicializado');
    });
        
        // Event listeners del chat
    setupEventListeners();
        console.log('[CHAT_INIT] Event listeners configurados');
        
        // Paneles redimensionables
    setupResizableLeft();
        setupResizableRight();
        console.log('[CHAT_INIT] Paneles redimensionables configurados');
        
        // Gestión de sesiones
        try {
            initializeSessionManager();
            console.log('[CHAT_INIT] Gestor de sesiones inicializado');
        } catch (error) {
            console.warn('[CHAT_INIT] Error inicializando gestor de sesiones:', error);
        }
        
        // Componentes UI
    setupLivestreamToggle();
    setupAvatarLightbox();
        console.log('[CHAT_INIT] Componentes UI configurados');
        
        // Livestream (con delay para Socket.IO, no debe romper si falla)
        try {
            setTimeout(() => {
                if (typeof io !== 'undefined') {
                    initializeLivestreamChat();
                    console.log('[CHAT_INIT] Chat del livestream inicializado');
                } else {
                    console.warn('[CHAT_INIT] Socket.IO no disponible, livestream deshabilitado');
                }
            }, 1000);
        } catch (error) {
            console.warn('[CHAT_INIT] Error inicializando livestream:', error);
        }
        
        // Sincronizar estado inicial del botón de acción con guardas null-safe
        try {
            if (messageInput && inputContainer) {
    if (messageInput.value.trim().length > 0) {
        inputContainer.classList.add('input-has-text');
    } else {
        inputContainer.classList.remove('input-has-text');
    }
            }
        } catch (error) {
            console.warn('[CHAT_INIT] Error sincronizando estado del botón:', error);
        }
        
        // Remover cualquier clase loading que pueda estar bloqueando la UI
        try {
            const containers = [
                document.querySelector('.telegram-container'),
                document.querySelector('.chat-main'),
                document.body
            ];
            containers.forEach(container => {
                if (container) {
                    container.classList.remove('loading');
                }
            });
            console.log('[CHAT_INIT] Estados de loading removidos');
        } catch (error) {
            console.warn('[CHAT_INIT] Error removiendo estados loading:', error);
        }
        
        console.log('[CHAT_INIT] Inicialización completada exitosamente');
        
        // Manejar redirección desde cursos (debe ser al final)
        setTimeout(() => {
            handleCourseRedirect();
        }, 500);
        
    } catch (error) {
        console.error('[CHAT_INIT] Error crítico durante la inicialización:', error);
    }
}

// Inicialización principal
document.addEventListener('DOMContentLoaded', () => {
  const hasChat = document.getElementById('chatMessages') || document.querySelector('.telegram-container');
  if (!hasChat) {
    console.log('[CHAT_INIT] Página sin chat; se omite inicialización de main.js');
    return;
  }
  init();
});

// Función para manejar la llegada desde cursos
function handleCourseRedirect() {
    // Verificar si venimos desde un curso específico
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course');
    const selectedCourse = localStorage.getItem('selectedCourse');
    
    if (courseId || selectedCourse) {
        let courseData = null;
        
        if (selectedCourse) {
            try {
                courseData = JSON.parse(selectedCourse);
                // Verificar que no sea muy antiguo (más de 5 minutos)
                if (Date.now() - courseData.timestamp > 5 * 60 * 1000) {
                    localStorage.removeItem('selectedCourse');
                    courseData = null;
                }
            } catch (e) {
                localStorage.removeItem('selectedCourse');
            }
        }
        
        const finalCourseId = courseId || (courseData ? courseData.id : null);
        
        if (finalCourseId) {
            console.log(`[CHAT] Iniciando desde curso: ${finalCourseId}`);
            showCourseWelcomeMessage(finalCourseId);
            
            // Limpiar el localStorage después de usar
            localStorage.removeItem('selectedCourse');
        }
    }
}

// Función para mostrar mensaje de bienvenida del curso
function showCourseWelcomeMessage(courseId) {
    const courseNames = {
        'curso-ia-completo': 'Aprende y Aplica IA — Curso Completo',
        'ml-fundamentos': 'Fundamentos de Machine Learning'
    };
    
    const courseName = courseNames[courseId] || 'el curso seleccionado';
    
    // Esperar a que el chat esté inicializado
    setTimeout(() => {
        const welcomeMessage = `¡Hola! Veo que has comenzado "${courseName}". Estoy aquí para ayudarte en tu aprendizaje. ¿En qué puedo asistirte hoy?`;
        
        // Mostrar mensaje del bot
        addBotMessage(welcomeMessage, null, false, true);
        
                // Ahora el usuario puede preguntar directamente y el sistema responderá personalizadamente
        if (courseId === 'curso-ia-completo') {
            // Sin sugerencias plantilla
        } else if (courseId === 'ml-fundamentos') {
            setTimeout(() => {
                const suggestions = `En este curso aprenderás:
• Tipos de aprendizaje: supervisado y no supervisado
• Algoritmos fundamentales de ML
• Evaluación de modelos
• Preprocesamiento de datos
• Implementación práctica

¿Qué tema te interesa más?`;
                addBotMessage(suggestions, null, false, false);
            }, 1500);
        }
    }, 2000); // Esperar 2 segundos para que el chat esté listo
}

// Animación de apertura del contenedor de chat
function playChatOpenAnimation() {
    return new Promise((resolve) => {
        try {
            const container = document.querySelector('.telegram-container');
            if (!container) return resolve();

            // Respetar preferencias de accesibilidad
            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReducedMotion) return resolve();

            // Animación simple y limpia: fade + scale del contenedor
            container.classList.add('chat-open-start');
            // forzar reflow
            void container.offsetWidth;
            container.classList.add('chat-open-animate');

            const onEnd = () => {
                container.removeEventListener('animationend', onEnd);
                container.classList.remove('chat-open-start', 'chat-open-animate');
                resolve();
            };

            container.addEventListener('animationend', onEnd);
            setTimeout(onEnd, 1200);
        } catch (_) {
            resolve();
        }
    });
}

// Inicializar configuración de seguridad
async function initializeSecurity() {
    try {
        // Cargar configuración desde el servidor de forma segura
        const configResponse = await fetch('/api/config', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': getApiKey(),
                ...getUserAuthHeaders(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        });

        if (configResponse.ok) {
            const config = await configResponse.json();
            CHATBOT_CONFIG.openai.model = config.openaiModel || 'gpt-4';
            CHATBOT_CONFIG.openai.maxTokens = config.maxTokens || 1000;
            CHATBOT_CONFIG.openai.temperature = config.temperature || 0.7;
            CHATBOT_CONFIG.audioEnabled = config.audioEnabled !== false;
            console.log('Configuración cargada de forma segura');
        } else {
            console.warn('No se pudo cargar la configuración del servidor');
        }
    } catch (error) {
        console.warn('Error cargando configuración:', error);
    }
}

// Inicializar sistema de audio
function initializeAudio() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            chatState.audioContext = new AudioContext();
        }
    } catch (error) {
        console.warn('Audio no soportado:', error);
        chatState.audioEnabled = false;
    }
}

// Cargar preferencia de audio tempranamente para que afecte la bienvenida
function loadAudioPreference() {
    try {
        const saved = localStorage.getItem('chat_audio_enabled');
        if (saved !== null) {
            const enabled = JSON.parse(saved);
            chatState.audioEnabled = !!enabled;
            if (!enabled && audioToggle) audioToggle.classList.add('muted');
        }
    } catch(_) {}
}

// Inicializar conexión a base de datos
async function initializeDatabase() {
    try {
        if (!CHATBOT_CONFIG.database.url) {
            console.warn('URL de base de datos no configurada');
            return;
        }
        console.log('Configuración de base de datos cargada');
    } catch (error) {
        console.warn('Error inicializando base de datos:', error);
    }
}

// Inicializar el chat
function initializeChat() {
    // Secuencia con escritura simulada
    (async () => {
        // Obtener nombre del usuario desde session/local storage
        try {
            const storedName = sessionStorage.getItem('loggedUser') || localStorage.getItem('rememberedUser');
            if (storedName) {
                chatState.userName = storedName;
            }
        } catch (_) {}

                // Mensaje de bienvenida y instrucciones
        const welcomeMessage = `¡Hola! Soy Lia, tu asistente de IA. Estoy aquí para ayudarte a explorar y aprender sobre inteligencia artificial.`;
        
        const instructionsMessage = `**📋 Instrucciones para usar el chat:**

**1. Hacer preguntas:**
   Escribe tus preguntas o temas de interés en el campo de texto inferior

**2. Tipos de consultas:**
   • Conceptos de IA y machine learning
   • Ejemplos prácticos y casos de uso
   • Explicaciones técnicas detalladas
   • Recursos y materiales de aprendizaje

**3. Herramientas disponibles:**
   • Panel izquierdo: Acceso a funciones adicionales
   • Historial: Conversaciones guardadas automáticamente
   • Configuración: Personaliza tu experiencia

**4. Consejos:**
   • Sé específico en tus preguntas para obtener mejores respuestas
   • Puedes hacer preguntas de seguimiento para profundizar en temas
   • El chat recuerda el contexto de la conversación`;

                const greeting = chatState.userName
            ? `¿Qué tema de IA te gustaría explorar o practicar?`
            : `¿Qué tema de IA te gustaría explorar o practicar?`;

        // Enviar mensaje de bienvenida
        await sendBotMessage(welcomeMessage, null, false, false);
        
        // Enviar instrucciones
        await sendBotMessage(instructionsMessage, null, false, false);
        
        // Enviar mensaje principal
        await sendBotMessage(greeting, null, false, false);
        // await showWelcomeInstructions(); // Mensajes plantilla deshabilitados
        // Menú inline eliminado: ahora el panel izquierdo contiene las herramientas
    })();
}

// Reproducir audio de bienvenida (DESHABILITADO)
function playWelcomeAudio() {
    // Función deshabilitada - no reproduce audio automáticamente
    return;
    
    if (!chatState.audioEnabled || !CHATBOT_CONFIG.audioEnabled) return;

    if ('speechSynthesis' in window) {
        playWelcomeSpeech();
    } else {
        playWelcomeAudioFile();
    }
}

// Reproducir audio usando Web Speech API
function playWelcomeSpeech() {
    try {
        const welcomeText = "¿Qué tema de IA te gustaría explorar o practicar?";
        const utterance = new SpeechSynthesisUtterance(welcomeText);
        utterance.lang = 'es-ES';
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = chatState.audioEnabled ? CHATBOT_CONFIG.welcomeAudio.volume : 0;
        
        const voices = speechSynthesis.getVoices();
        const spanishVoice = voices.find(voice => voice.lang.includes('es'));
        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }
        
        // Guardar referencia para poder cancelar o silenciar dinámicamente
        chatState.currentAudio = utterance;
        speechSynthesis.cancel(); // asegurar que no haya colas
        speechSynthesis.speak(utterance);
        console.log('Audio de bienvenida reproducido con Web Speech API');
    } catch (error) {
        console.warn('Error reproduciendo audio con Web Speech API:', error);
        playWelcomeAudioFile();
    }
}

// Reproducir archivo de audio de bienvenida
function playWelcomeAudioFile() {
    try {
        const audio = new Audio(CHATBOT_CONFIG.welcomeAudio.src);
        audio.volume = chatState.audioEnabled ? CHATBOT_CONFIG.welcomeAudio.volume : 0;
        chatState.currentAudio = audio;
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Audio de bienvenida reproducido exitosamente');
                })
                .catch(error => {
                    console.warn('Error reproduciendo audio de bienvenida:', error);
                });
        }
    } catch (error) {
        console.warn('Error inicializando audio de bienvenida:', error);
    }
}

// Configurar event listeners
function setupEventListeners() {
    console.log('[CHAT_INIT] Configurando event listeners...');
    
    // Guard para messageInput
    if (!messageInput) {
        console.error('[CHAT_INIT] messageInput no encontrado');
        return;
    }
    
    // Guard para inputContainer
    if (!inputContainer) {
        console.error('[CHAT_INIT] inputContainer no encontrado');
        return;
    }
    
    // Guard para actionButton
    if (!actionButton) {
        console.error('[CHAT_INIT] actionButton no encontrado');
        return;
    }
    
    // Envío por Enter
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            console.log('[CHAT_INIT] Enter presionado, enviando mensaje');
            sendMessage();
        }
    });

    // Mostrar botón enviar si hay texto; micrófono si está vacío
    const updateActionState = () => {
        try {
        if (messageInput.value.trim().length > 0) {
            inputContainer.classList.add('input-has-text');
        } else {
            inputContainer.classList.remove('input-has-text');
            }
        } catch (error) {
            console.warn('[CHAT_INIT] Error actualizando estado del botón:', error);
        }
    };
    
    // Listeners para cambios en el input
    messageInput.addEventListener('input', updateActionState);
    messageInput.addEventListener('keyup', updateActionState);
    messageInput.addEventListener('change', updateActionState);

    // Toggle de audio y persistencia
    if (audioToggle) {
        audioToggle.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const newState = toggleAudio();
            if (!newState) audioToggle.classList.add('muted'); else audioToggle.classList.remove('muted');
            try { localStorage.setItem('chat_audio_enabled', JSON.stringify(newState)); } catch(_){ }
        });
    }

    // Cargar preferencia de audio (sin forzar toggle de lógica)
    try {
        const saved = localStorage.getItem('chat_audio_enabled');
        if (saved !== null) {
            const enabled = JSON.parse(saved);
            chatState.audioEnabled = !!enabled;
            if (audioToggle) { if (!enabled) audioToggle.classList.add('muted'); else audioToggle.classList.remove('muted'); }
        }
    } catch(_){ }

    // Micrófono: placeholder para reconocimiento de voz
    // Acción dual: enviar cuando hay texto; grabar voz cuando está vacío
    actionButton.addEventListener('mousedown', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        // Cancelar cualquier escritura simulada pendiente del bot
        chatState.typingToken++;
        hideTypingIndicator();
        setHeaderTyping(false);
        chatState.isTyping = false;
        if (messageInput.value.trim().length === 0) {
            document.getElementById('inputContainer')?.classList.add('recording');
            startVoiceInputUI();
        }
    });

    actionButton.addEventListener('mouseup', () => {
        // Si está grabando, detener
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    });

    actionButton.addEventListener('click', (ev) => {
        try {
            console.log('[CHAT_INIT] actionButton clicked, text length:', messageInput.value.trim().length);
        // Con texto: enviar (click estándar)
        if (messageInput.value.trim().length > 0) {
            ev.preventDefault();
                console.log('[CHAT_INIT] Enviando mensaje via click');
            sendMessage();
            } else {
                console.log('[CHAT_INIT] Sin texto, no se envía mensaje');
            }
        } catch (error) {
            console.error('[CHAT_INIT] Error en click del actionButton:', error);
        }
    });

    // Conectar botones del panel izquierdo (tool-list)
    try {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                switch(action) {
                    case 'open-notes': EventBus.emit('ui:openNotes'); break;
                    case 'open-glossary': EventBus.emit('ui:openGlossary'); break;
                    case 'open-audio': EventBus.emit('ui:openAudio'); break;
                    case 'open-video': EventBus.emit('ui:openVideo'); break;
                    case 'open-report': EventBus.emit('ui:openReport'); break;
                    case 'copy-prompts': EventBus.emit('ui:copyPrompts'); break;
                    case 'open-quizzes': EventBus.emit('ui:openQuizzes'); break;
                    case 'open-faq': EventBus.emit('ui:openFAQ'); break;
                    case 'open-zoom': EventBus.emit('ui:openZoom'); break;
                    case 'open-teachers': EventBus.emit('ui:openTeachers'); break;
                }
            });
        });
        // Toggles de colapso
        const root = document.body;
        document.getElementById('collapseLeft')?.addEventListener('click', () => {
            root.classList.toggle('left-collapsed');
        });
        document.getElementById('collapseRight')?.addEventListener('click', () => {
            root.classList.toggle('right-collapsed');
        });
        // Acciones del rail (si visible)
        const railButtons = document.querySelectorAll('.studio-rail .rail-btn');
        if (railButtons && railButtons.length) {
            railButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.getAttribute('data-action');
                    switch(action) {
                        case 'open-audio': EventBus.emit('ui:openAudio'); break;
                        case 'open-video': EventBus.emit('ui:openVideo'); break;
                        case 'open-report': EventBus.emit('ui:openReport'); break;
                        case 'open-notes': EventBus.emit('ui:openNotes'); break;
                        case 'open-zoom': EventBus.emit('ui:openZoom'); break;
                        case 'open-teachers': EventBus.emit('ui:openTeachers'); break;
                    }
                });
            });
        }
        // Asegurar eventos para tiles del panel derecho (aún cuando colapsa/expande)
        document.querySelectorAll('.studio-tiles .tile').forEach(tile => {
            tile.addEventListener('click', () => {
                const action = tile.getAttribute('data-action');
                switch(action) {
                    case 'open-audio': EventBus.emit('ui:openAudio'); break;
                    case 'open-video': EventBus.emit('ui:openVideo'); break;
                    case 'open-report': EventBus.emit('ui:openReport'); break;
                    case 'open-notes': EventBus.emit('ui:openNotes'); break;
                    case 'open-zoom': EventBus.emit('ui:openZoom'); break;
                    case 'open-teachers': EventBus.emit('ui:openTeachers'); break;
                }
            });
        });
    } catch(_){}

    // Forzar primer estado
    if (messageInput.value.trim().length > 0) {
        inputContainer.classList.add('input-has-text');
    } else {
        inputContainer.classList.remove('input-has-text');
    }

    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Botón de menú global (estilo ChatGPT)
    const sessionBtn = document.getElementById('sessionMenuButton');
    if (sessionBtn) {
        sessionBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const gm = document.getElementById('globalMenu');
            if (!gm) return;
            gm.classList.toggle('show');
        });
        document.addEventListener('mousedown', (e) => {
            const gm = document.getElementById('globalMenu');
            if (gm && !gm.contains(e.target) && e.target !== sessionBtn) gm.classList.remove('show');
        });
        const gm = document.getElementById('globalMenu');
        if (gm) {
            const sessionsBtn = gm.querySelector('[data-toggle="sessions"]');
            const reportsBtn = gm.querySelector('[data-toggle="reports"]');
            const sessionsMenu = gm.querySelector('#gmSessions');
            const reportsMenu = gm.querySelector('#gmReports');
            if (sessionsBtn && sessionsMenu) {
                const toggleSessions = (show) => sessionsMenu.style.display = show ? 'block' : 'none';
                const sesGroup = sessionsBtn.closest('.gm-group');
                const adjustSide = () => {
                    const gmRect = gm.getBoundingClientRect();
                    const subRect = sessionsMenu.getBoundingClientRect();
                    // si se corta a la derecha, abrir hacia la izquierda
                    const overRight = gmRect.right + 220 > window.innerWidth;
                    sessionsMenu.classList.toggle('left', overRight);
                };
                sesGroup?.addEventListener('mouseenter', () => { adjustSide(); toggleSessions(true); });
                sesGroup?.addEventListener('mouseleave', () => toggleSessions(false));
                sessionsBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleSessions(sessionsMenu.style.display !== 'block'); });
            }
            if (reportsBtn && reportsMenu) {
                const toggleReports = (show) => reportsMenu.style.display = show ? 'block' : 'none';
                const repGroup = reportsBtn.closest('.gm-group');
                const adjustSideR = () => {
                    const gmRect = gm.getBoundingClientRect();
                    const overRight = gmRect.right + 220 > window.innerWidth;
                    reportsMenu.classList.toggle('left', overRight);
                };
                repGroup?.addEventListener('mouseenter', () => { adjustSideR(); toggleReports(true); });
                repGroup?.addEventListener('mouseleave', () => toggleReports(false));
                reportsBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleReports(reportsMenu.style.display !== 'block'); });
            }
            // Acciones
            gm.querySelectorAll('#gmSessions .gm-subitem').forEach(b => b.addEventListener('mousedown', (ev) => {
                ev.preventDefault(); ev.stopPropagation();
                const ses = b.getAttribute('data-session') || '1';
                showModulesStudioPanel(String(ses));
                gm.classList.remove('show');
            }));
            const docsBtn = gm.querySelector('#gmReports [data-report="docs"]');
            const bonusBtn = gm.querySelector('#gmReports [data-report="bonos"]');
            docsBtn?.addEventListener('mousedown', (ev) => { ev.preventDefault(); ev.stopPropagation(); addCard('Documentos', '<div style="color:var(--text-muted)">Sin documentos aún</div>'); gm.classList.remove('show'); });
            bonusBtn?.addEventListener('mousedown', (ev) => { ev.preventDefault(); ev.stopPropagation(); addCard('Bonos', '<div style="color:var(--text-muted)">Sin bonos aún</div>'); gm.classList.remove('show'); });
        }
    }
}

// ===== Nuevo: EventBus y UI API =====
function setupEventBusAndUI() {
    if (window.EventBus) return;
    const listeners = {};
    window.EventBus = {
        on: (evt, cb) => { (listeners[evt] ||= []).push(cb); },
        off: (evt, cb) => { listeners[evt] = (listeners[evt]||[]).filter(f => f!==cb); },
        emit: (evt, payload) => { (listeners[evt]||[]).forEach(f => { try { f(payload); } catch(_){} }); }
    };

    // Studio helpers
    const cardsEl = () => document.getElementById('studioCards');
    const addCard = (title, contentHTML) => {
        const el = document.createElement('div');
        el.className = 'studio-card';
        el.innerHTML = `<h4 style="margin:0 0 8px 0">${title}</h4>` + contentHTML;
        cardsEl()?.prepend(el);
        return el;
    };

    // ===== Notas minimalistas estilo NotebookLM =====
    const notesStore = (() => {
        const KEY = 'lia_notes_v1';
        const read = () => {
            try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; }
        };
        const write = (arr) => { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch(_) {} };
        const now = () => new Date().toISOString();
        const uid = () => Math.random().toString(36).slice(2, 10);
        return {
            all() { return read(); },
            get(id) { return read().find(n => n.id === id) || null; },
            create({ title = 'Nueva nota', content = '' } = {}) {
                const note = { id: uid(), title, content, updatedAt: now() };
                const arr = read(); arr.unshift(note); write(arr); return note;
            },
            update(id, data) {
                const arr = read();
                const idx = arr.findIndex(n => n.id === id);
                if (idx >= 0) { arr[idx] = { ...arr[idx], ...data, updatedAt: now() }; write(arr); return arr[idx]; }
                return null;
            },
            remove(id) { write(read().filter(n => n.id !== id)); }
        };
    })();

    function formatDate(ts) {
        try { const d = new Date(ts); return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0,5); } catch(_) { return ''; }
    }

    async function exportElementToPDF(element, filename = 'notas.pdf') {
        try {
            let html2pdf;
            try {
                const mod = await import(/* webpackChunkName: "html2pdf" */ 'html2pdf.js');
                html2pdf = mod?.default || mod;
            } catch (e) {
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';
                    s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
                });
                html2pdf = window.html2pdf;
            }
            const opt = { margin: 10, filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
            html2pdf().set(opt).from(element).save();
        } catch (err) { console.error('Exportación PDF falló', err); }
    }

    function openNoteEditor(note) {
        // Overlay reutilizando estilos del panel de prompt
        const existing = document.getElementById('noteEditorOverlay');
        if (existing) existing.remove();
        const overlay = document.createElement('div');
        overlay.id = 'noteEditorOverlay';
        overlay.className = 'prompt-overlay open';
        overlay.innerHTML = `
            <div class="prompt-panel" role="dialog" aria-modal="true" style="height: 90vh; max-height: 90vh;">
                <div class="prompt-header" style="gap:8px">
                    <div style="display:flex;align-items:center;gap:8px;color:var(--text-muted)">Studio <span>›</span> <strong>Nota</strong></div>
                    <div style="display:flex;gap:6px;margin-left:auto">
                        <button id="closeNoteBtn" class="prompt-close" aria-label="Cerrar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="prompt-body" style="display:flex;flex-direction:column;gap:10px;height: calc(90vh - 60px); overflow: hidden;">
                    <div style="display:flex;align-items:center;gap:8px">
                        <input id="noteTitle" value="${note.title || ''}" placeholder="Título" style="background:rgba(10,10,10,0.85);border:1px solid rgba(68,229,255,0.2);border-radius:10px;padding:10px 12px;color:var(--text-on-dark);font-weight:700;flex:1" />
                        <button id="deleteNoteBtn" class="session-btn" style="border-color:rgba(255,99,71,.45);color:rgba(255,99,71,.8);min-width:40px;height:40px;padding:8px;font-size:16px;display:flex;align-items:center;justify-content:center" title="Eliminar nota">🗑️</button>
                    </div>
                    <div class="editor-toolbar" style="display:flex;gap:6px;padding:8px;background:rgba(10,10,10,0.5);border-radius:8px;border:1px solid rgba(68,229,255,0.15);justify-content:flex-start;">
                        <button class="session-btn" data-cmd="undo" title="Deshacer" style="font-weight:bold;">↶</button>
                        <button class="session-btn" data-cmd="redo" title="Rehacer" style="font-weight:bold;">↷</button>
                        <span style="width:8px;border-left:1px solid rgba(68,229,255,0.2);"></span>
                        <button class="session-btn" data-cmd="bold" title="Negritas" style="font-weight:bold;">B</button>
                        <button class="session-btn" data-cmd="italic" title="Cursiva" style="font-style:italic;"><em>I</em></button>
                        <button class="session-btn" data-cmd="insertUnorderedList" title="Lista" style="font-weight:bold;">• Lista</button>
                    </div>
                    <div id="noteContent" contenteditable="true" style="flex:1;min-height:0;background:rgba(10,10,10,0.85);border:1px solid rgba(68,229,255,0.2);border-radius:10px;padding:12px;overflow-y:auto;word-wrap:break-word;line-height:1.6;scrollbar-width:none;-ms-overflow-style:none;">${note.content || ''}</div>
                    <div style="display:flex;justify-content:center;align-items:center;margin-top:12px;padding:8px;">
                        <button id="exportPdfBtn" class="keyboard-button" style="background:linear-gradient(135deg, rgba(68,229,255,0.2), rgba(0,119,166,0.2));border:1px solid rgba(68,229,255,0.4);color:rgba(68,229,255,0.95);padding:8px 16px;border-radius:8px;font-weight:600;font-size:12px;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(68,229,255,0.15);display:flex;align-items:center;gap:6px;min-width:120px;justify-content:center;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            PDF
                        </button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const titleEl = overlay.querySelector('#noteTitle');
        const contentEl = overlay.querySelector('#noteContent');
        
        // Mejorar la funcionalidad de los botones de edición
        overlay.querySelectorAll('.editor-toolbar .session-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const cmd = btn.getAttribute('data-cmd');
                
                // Asegurar que el contenido tenga foco
                contentEl?.focus();
                
                // Ejecutar comando con mejor manejo
                if (cmd === 'insertUnorderedList') {
                    // Manejo especial para listas para evitar que se salgan del área
                    document.execCommand(cmd, false, null);
                    
                    // Aplicar estilos CSS para las listas
                    const lists = contentEl.querySelectorAll('ul');
                    lists.forEach(list => {
                        list.style.marginLeft = '20px';
                        list.style.paddingLeft = '0';
                        list.style.listStyleType = 'disc';
                    });
                } else {
                    document.execCommand(cmd, false, null);
                }
                
                // Actualizar estado visual del botón
                btn.style.background = 'rgba(68,229,255,0.2)';
                setTimeout(() => {
                    btn.style.background = '';
                }, 200);
            });
        });
        // Auto-save functionality
        let autoSaveTimeout;
        const updateStatus = overlay.querySelector('#noteUpdateStatus');
        
        const autoSave = () => {
            clearTimeout(autoSaveTimeout);
            
            autoSaveTimeout = setTimeout(() => {
                const updatedNote = notesStore.update(note.id, { 
                    title: titleEl.value.trim() || 'Sin título', 
                    content: contentEl.innerHTML 
                });
                
                if (updatedNote && updateStatus) {
                    updateStatus.textContent = `Actualizado: ${formatDate(updatedNote.updatedAt)}`;
                    updateStatus.style.color = 'rgba(68,229,255,0.8)';
                    
                    setTimeout(() => {
                        updateStatus.style.color = 'var(--text-muted)';
                    }, 2000);
                }
                
                // Re-render lista en el background
            window.UI.openNotes();
            }, 1000); // Auto-save después de 1 segundo de inactividad
        };

        // Event listeners para auto-save
        titleEl?.addEventListener('input', autoSave);
        contentEl?.addEventListener('input', autoSave);
        contentEl?.addEventListener('paste', () => setTimeout(autoSave, 100));
        
        // Event listener para manejar cambios en el contenido y aplicar estilos a listas
        contentEl?.addEventListener('input', () => {
            // Aplicar estilos a listas existentes
            const lists = contentEl.querySelectorAll('ul, ol');
            lists.forEach(list => {
                list.style.marginLeft = '20px';
                list.style.paddingLeft = '0';
                if (list.tagName === 'UL') {
                    list.style.listStyleType = 'disc';
                } else if (list.tagName === 'OL') {
                    list.style.listStyleType = 'decimal';
                }
            });
        });

        // Event listeners para botones
        overlay.querySelector('#closeNoteBtn')?.addEventListener('click', () => {
            // Guardar antes de cerrar
            clearTimeout(autoSaveTimeout);
            notesStore.update(note.id, { 
                title: titleEl.value.trim() || 'Sin título', 
                content: contentEl.innerHTML 
            });
            overlay.remove();
        });
        
        overlay.querySelector('#deleteNoteBtn')?.addEventListener('click', () => {
            notesStore.remove(note.id); 
            overlay.remove(); 
            window.UI.openNotes();
        });
        
        overlay.querySelector('#exportPdfBtn')?.addEventListener('click', () => {
            // Mejorar la experiencia de exportación
            const btn = overlay.querySelector('#exportPdfBtn');
            const originalHTML = btn.innerHTML;
                                    btn.innerHTML = `
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Exportando...`;
            btn.style.opacity = '0.7';
            btn.disabled = true;
            
            try {
                exportElementToPDF(contentEl, (titleEl.value || 'notas') + '.pdf');
            } catch (error) {
                console.error('Error al exportar PDF:', error);
            } finally {
                                        // Restaurar el botón después de un breve delay
                        setTimeout(() => {
                            btn.innerHTML = `
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                PDF`;
                            btn.style.opacity = '1';
                            btn.disabled = false;
                        }, 1000);
            }
        });
    }

    window.UI = {
        openNotes() {
            const renderList = () => {
                const notes = notesStore.all();
                if (notes.length === 0) {
                    return `
                        <div style="color:var(--text-muted);padding:8px;text-align:center">
                            Sin notas aún
                        </div>`;
                }
                const list = notes.map(n => `
                    <button class="session-item" data-id="${n.id}" title="${n.title}">
                        <span class="module-index"><i class='bx bx-file-blank'></i></span>
                        <span class="module-title">${n.title}</span>
                        <span style="font-size:11px;color:var(--text-muted)">${formatDate(n.updatedAt)}</span>
                    </button>`).join('');
                return `<div class="module-list">${list}</div>`;
            };

            // Si ya existe la card de notas, solo re-renderizamos su contenido
            const existing = document.querySelector('.studio-card[data-card="notes"]');
            const content = `
                <div class="collapsible studio-collapsible" id="notesCard">
                    <div class="collapsible-header">
                        <h4 style="margin:0">Notas</h4>
                        <div style="display:flex;gap:6px">
                            <button id="notesRemove" class="collapsible-toggle" title="Quitar" aria-label="Quitar">🗑</button>
                            <button id="notesToggle" class="collapsible-toggle" aria-expanded="true" aria-controls="notesCardBody" title="Mostrar/Ocultar">
                                <i class='bx bx-chevron-down'></i>
                            </button>
                        </div>
                    </div>
                    <div class="collapsible-content" id="notesCardBody" style="display:block;border-top:1px solid rgba(68,229,255,.18);padding-top:10px">
                        ${renderList()}
                        <div style="display:flex;justify-content:center;margin-top:12px">
                            <button id="addNoteBtn" class="keyboard-button" style="width:220px">+ Nota</button>
                        </div>
                    </div>
                </div>`;
            let el = existing;
            if (el) {
                // Solo actualizar el contenido, sin agregar encabezado duplicado
                el.innerHTML = content;
            } else {
                el = addCard('', content);
                el.dataset.card = 'notes';
            }

            // Toggle/Eliminar card
            const section = el.querySelector('#notesCard');
            const body = el.querySelector('#notesCardBody');
            const toggle = el.querySelector('#notesToggle');
            if (section && toggle) {
                toggle.addEventListener('click', () => {
                const isOpen = section.classList.toggle('open');
                if (body) body.style.display = isOpen ? 'block' : 'none';
                toggle.setAttribute('aria-expanded', String(isOpen));
            });
            }
            // Quitar card completa de notas
            el.querySelector('#notesRemove')?.addEventListener('click', () => el.remove());

            // Abrir existente
            el.querySelectorAll('.session-item')?.forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const note = notesStore.get(id);
                    if (note) openNoteEditor(note);
                });
            });
            // Crear nueva
            el.querySelector('#addNoteBtn')?.addEventListener('click', () => {
                const note = notesStore.create({});
                openNoteEditor(note);
            });
        },
        openGlossary() { addCard('Glosario', `<div id="glossaryPanelMount">Usa las letras para explorar términos.</div>`); showGlossary(); },
        openAudioSummary() { addCard('Resumen de audio', '<div>Sube audio desde el botón de micrófono y lo resumiré aquí.</div>'); },
        openZoomSessions() { 
            addCard('Sesiones Zoom', `
                <div style="display:grid;gap:12px">
                    <div style="background:rgba(68,229,255,.1);padding:12px;border-radius:8px">
                        <h5 style="margin:0 0 8px">📅 Próximas sesiones</h5>
                        <p style="margin:0;font-size:14px;color:var(--text-muted)">Miércoles 14/08 - 19:00 hrs<br/>Tema: Fundamentos de IA</p>
                        <button class="keyboard-button" style="margin-top:8px;padding:6px 12px;font-size:14px">Unirse a Zoom</button>
                    </div>
                    <div style="border:1px solid rgba(68,229,255,.15);padding:12px;border-radius:8px">
                        <h5 style="margin:0 0 8px">🔗 Enlaces permanentes</h5>
                        <input type="url" placeholder="https://zoom.us/j/..." style="width:100%;padding:6px;margin:4px 0;border-radius:6px;border:1px solid rgba(68,229,255,.25);background:rgba(255,255,255,.04);color:var(--text-on-dark)">
                        <button class="keyboard-button" style="padding:6px 12px;font-size:14px">Agregar enlace</button>
                    </div>
                </div>
            `); 
        },
        openTeachers() { 
            addCard('Docentes del curso', `
                <div class="teacher-profile">
                    <div class="teacher-photo" style="background-image:url('assets/images/Ernesto.jpg')"></div>
                    <div class="teacher-head">
                        <h3 class="teacher-name">Ernesto Hernández Martínez | Renato Verum, "El Pastor Cibernético"</h3>
                        <p class="teacher-title">Ingeniero en Comunicaciones y Electrónica | Líder en IA Generativa y Transformación Digital | "El Pastor Cibernético"</p>
                        <div class="teacher-section">
                            <h4 class="section-title">Perfil Profesional</h4>
                            <p class="section-text">Soy un líder visionario dedicado a transformar organizaciones mediante la integración ética y estratégica de la inteligencia artificial generativa con principios profundamente humanos como el amor, la sabiduría y el servicio.</p>
                        </div>
                    </div>
                </div>

                <div class="teacher-section">
                    <p class="section-text">A través del Liderazgo Áureo, mi enfoque promueve decisiones conscientes y colaborativas, fortaleciendo la productividad e innovación desde una perspectiva ágil y práctica. Creo firmemente en una tecnología centrada en las personas, potenciando su talento y creatividad para construir empresas humanas y altamente competitivas en la era digital.</p>
                </div>

                <div class="teacher-section">
                    <h4 class="section-title">Experiencia Destacada</h4>
                    <h5 class="role">Cofundador | Aprende y Aplica IA</h5>
                    <ul class="section-list">
                        <li>Lidero formaciones ágiles y prácticas en inteligencia artificial generativa, capacitando a líderes empresariales para aplicar IA de inmediato en sus organizaciones.</li>
                        <li>Incremento promedio del 40% en productividad y eficiencia operativa en empresas participantes desde el primer día.</li>
                        <li>Desarrollo de metodologías exclusivas que permiten resultados visibles en toma de decisiones y ventaja competitiva.</li>
                        <li>Establecimiento de hábitos de aprendizaje continuo con impacto real en proyectos.</li>
                    </ul>
                    <h5 class="role">Fundador | Ecos de Liderazgo & Fundación Ecos de Liderazgo</h5>
                    <ul class="section-list">
                        <li>Diseño e implementación de ecosistemas inteligentes de colaboración digital impulsados por IA generativa.</li>
                        <li>Más de 50 empresas impactadas positivamente, transformando la cultura organizacional hacia un liderazgo humanista.</li>
                        <li>Establecimiento de programas que convierten conocimiento tácito en explícito, optimizando procesos clave hasta en un 35%.</li>
                        <li>Mentoría a equipos directivos para decisiones éticas y efectivas en transformación digital.</li>
                    </ul>
                    <h5 class="role">Creador y Líder | PulseHub</h5>
                    <ul class="section-list">
                        <li>Desarrollo de una plataforma innovadora que utiliza IA predictiva para anticipar desafíos organizacionales y mejorar la toma de decisiones.</li>
                        <li>Incremento del compromiso del equipo en más del 60%, optimizando procesos críticos y reduciendo tiempos operativos.</li>
                        <li>Reconocimiento por la creación de entornos laborales altamente productivos y emocionalmente saludables.</li>
                    </ul>
                    <h5 class="role">Cofundador | Alfasoluciones & Mercadata | Mentor Estratégico</h5>
                    <ul class="section-list">
                        <li>Implementación exitosa de soluciones tecnológicas avanzadas (ERP, análisis de datos) en más de 200 proyectos empresariales.</li>
                        <li>Mentoría personalizada a más de 100 líderes ejecutivos en transformación digital y liderazgo consciente.</li>
                        <li>Mejora del rendimiento comercial en promedio del 50% mediante estrategias digitales y automatización inteligente.</li>
                    </ul>
                </div>

                <div class="teacher-section">
                    <h4 class="section-title">Habilidades Estratégicas</h4>
                    <ul class="section-list">
                        <li><strong>Inteligencia Artificial Generativa:</strong> Aplicación inmediata y práctica en contextos empresariales.</li>
                        <li><strong>Liderazgo Áureo:</strong> Integración efectiva del amor, sabiduría y servicio en la gestión empresarial.</li>
                        <li><strong>Gestión del Cambio:</strong> Facilitación ágil y humanista en procesos de transformación digital.</li>
                        <li><strong>Diseño de Ecosistemas Inteligentes:</strong> Creación de plataformas colaborativas predictivas.</li>
                        <li><strong>Pensamiento Innovador y Ético:</strong> Decisiones conscientes y estratégicamente disruptivas.</li>
                        <li><strong>Resiliencia y Adaptabilidad:</strong> Competencia clave para liderar en entornos altamente dinámicos.</li>
                    </ul>
                </div>

                <div class="teacher-section">
                    <h4 class="section-title">Metas y Visión</h4>
                    <ul class="section-list">
                        <li>Expandir Aprende y Aplica IA en Latinoamérica, consolidándolo como referente global en formación ágil y práctica en IA generativa.</li>
                        <li>Desarrollar nuevas herramientas tecnológicas que potencien aún más PulseHub y Mente Convergente.</li>
                        <li>Creación de un comunidad internacional de líderes conscientes capaces de transformar organizaciones a través de IA ética y efectiva.</li>
                    </ul>
                </div>

                <div class="teacher-section">
                    <h4 class="section-title">Más Allá de lo Profesional</h4>
                    <ul class="section-list">
                        <li>Apasionado del crecimiento espiritual y personal.</li>
                        <li>Deportista comprometido: running, natación y fitness.</li>
                        <li>Orador motivacional enfocado en inspirar transformaciones positivas y liderazgo auténtico.</li>
                    </ul>
                </div>

                <div class="teacher-section">
                    <h4 class="section-title">Datos Personales</h4>
                    <p class="section-text">Email: <a href="mailto:ernesto@aprendeyaplica.ai">ernesto@aprendeyaplica.ai</a><br/>LinkedIn: <a href="#" target="_blank" rel="noopener noreferrer">[Insertar enlace aquí]</a></p>
                </div>

                <hr style="border-color: rgba(68,229,255,0.2); margin:16px 0"/>

                <div class="teacher-profile">
                    <div class="teacher-photo" style="background-image:url('assets/images/Alejandra.jpg')"></div>
                    <div class="teacher-head">
                        <h3 class="teacher-name">Alejandra Rodríguez Escobar | "La Arquitecta Audiovisual"</h3>
                        <p class="teacher-title">Licenciada en Ciencias de la Comunicación | Maestría en Diseño Multimedia (en curso) | Especialización en Creación de Contenido Audiovisual | Estrategia Digital | Certificación en Social Media Management</p>
                        <div class="teacher-section">
                            <h4 class="section-title">Perfil Profesional</h4>
                            <p class="section-text">Soy Licenciada en Ciencias de la Comunicación y actualmente curso una Maestría en Diseño Multimedia, especializándome en integrar técnicas avanzadas de inteligencia artificial en proyectos audiovisuales.</p>
                        </div>
                    </div>
                </div>

                <div class="teacher-section">
                    <p class="section-text">Mi pasión por la innovación digital me impulsa a explorar nuevas herramientas que potencien la creatividad y permitan ofrecer contenidos interactivos, inmersivos y relevantes para diferentes audiencias. Combino pensamiento estratégico con dominio tecnológico para crear experiencias visuales y narrativas digitales únicas, optimizando el engagement y fortaleciendo la identidad corporativa en plataformas digitales.</p>
                </div>

                <div class="teacher-section">
                    <h4 class="section-title">Experiencia Destacada</h4>
                    <h5 class="role">Diseñadora Gráfica y Community Manager | CAM Centro de Artes y Música</h5>
                    <ul class="section-list">
                        <li>Lideró la creación integral de contenido gráfico y multimedia, potenciando la presencia digital de la organización en diversas plataformas.</li>
                        <li>Implementó campañas de social media que aumentaron en 45% el alcance orgánico y 30% la interacción.</li>
                        <li>Optimizó procesos de producción y postproducción audiovisual con herramientas avanzadas, reduciendo 25% tiempos de entrega.</li>
                    </ul>
                    <h5 class="role">Editora de Contenido Audiovisual | Latin Media Group</h5>
                    <ul class="section-list">
                        <li>Gestión integral de edición profesional de videos y fotografía, asegurando calidad visual y coherencia narrativa.</li>
                        <li>Desarrolló estrategias digitales que incrementaron la visibilidad en un 40% durante el primer año.</li>
                        <li>Eficiencia operativa: reducción del 20% en tiempos de publicación en plataformas digitales.</li>
                    </ul>
                    <h5 class="role">Gestora de Contenido Multimedia (Servicio Social) | Grupo Fórmula</h5>
                    <ul class="section-list">
                        <li>Identificación estratégica de contenidos noticiosos y producción audiovisual para maximizar atención en YouTube.</li>
                        <li>Supervisión de edición y postproducción, incrementando 35% la retención promedio de espectadores.</li>
                        <li>Optimización del alcance mediante contenidos enfocados en relevancia y valor para la audiencia.</li>
                    </ul>
                </div>

                <div class="teacher-section">
                    <h4 class="section-title">Habilidades Estratégicas</h4>
                    <ul class="section-list">
                        <li>Creación y edición avanzada de contenido multimedia.</li>
                        <li>Gestión efectiva de redes sociales y estrategias de engagement.</li>
                        <li>Diseño gráfico, fotografía, retoque y postproducción.</li>
                        <li>Redacción creativa de guiones y storytelling.</li>
                        <li>Adaptabilidad, trabajo en equipo y empatía.</li>
                    </ul>
                </div>

                <div class="teacher-section">
                    <h4 class="section-title">Metas y Visión</h4>
                    <p class="section-text">A corto y mediano plazo, posicionarme como referente en diseño multimedia y comunicación digital, integrando IA en narrativas visuales impactantes con tecnologías emergentes. A largo plazo, liderar iniciativas que fortalezcan la comunicación de las marcas y transformen positivamente la experiencia de audiencias diversas.</p>
                </div>

                <div class="teacher-section">
                    <h4 class="section-title">Más Allá de lo Profesional</h4>
                    <ul class="section-list">
                        <li>Apasionada por la fotografía creativa y el retoque como medio de expresión.</li>
                        <li>Exploradora constante de tendencias audiovisuales.</li>
                        <li>Promotora del trabajo colaborativo y la innovación multidisciplinaria.</li>
                    </ul>
                </div>
            `); 
        },
        openReport(opts={}) { 
            addCard('Informes y Resúmenes', `
                <div style="display:grid;gap:16px">
                    <div style="display:flex;flex-direction:column;gap:8px">
                        <h5 style="margin:0">📝 Generar informe con IA</h5>
                        <div style="display:grid;gap:8px">
                            <textarea placeholder="Pega aquí el texto a resumir o analizar..." style="width:100%;height:100px;padding:10px;border-radius:8px;border:1px solid rgba(68,229,255,.25);background:rgba(255,255,255,.04);color:var(--text-on-dark);font-family:inherit;resize:vertical"></textarea>
                            <input type="file" accept=".txt,.md,.pdf" style="padding:8px;border-radius:8px;border:1px solid rgba(68,229,255,.25);background:rgba(255,255,255,.04);color:var(--text-on-dark)" placeholder="O sube un archivo">
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:8px">
                        <h5 style="margin:0">🎯 Tipo de informe</h5>
                        <select style="padding:8px;border-radius:8px;border:1px solid rgba(68,229,255,.25);background:rgba(255,255,255,.04);color:var(--text-on-dark)">
                            <option>Resumen ejecutivo</option>
                            <option>Informe técnico</option>
                            <option>Minuta de reunión</option>
                            <option>Plan de estudio</option>
                            <option>Análisis de contenido</option>
                        </select>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                        <button class="keyboard-button" style="padding:10px;font-size:14px">📄 Generar PDF</button>
                        <button class="keyboard-button" style="padding:10px;font-size:14px">📝 Generar Markdown</button>
                    </div>
                </div>
            `); 
        },
        copyPrompts() { copyPrompts('fundamentos', 1); },
        openFAQ() { addCard('FAQ', '<div>Preguntas frecuentes disponibles por sesión.</div>'); },
        openQuizzes() { addCard('Cuestionarios', '<div>Selecciona una sesión y responde.</div>'); }
    };

    // Wiring: eventos -> UI
    EventBus.on('ui:openNotes', () => UI.openNotes());
    EventBus.on('ui:openGlossary', () => UI.openGlossary());
    EventBus.on('ui:openAudio', () => UI.openAudioSummary());
    EventBus.on('ui:openReport', () => UI.openReport());
    EventBus.on('ui:copyPrompts', () => UI.copyPrompts());
    EventBus.on('ui:openFAQ', () => UI.openFAQ());
    EventBus.on('ui:openQuizzes', () => UI.openQuizzes());
    EventBus.on('ui:openZoom', () => UI.openZoomSessions());
    EventBus.on('ui:openTeachers', () => UI.openTeachers());
}

// Reconocimiento de voz básico (si disponible)
function startVoiceInput() {
    try {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.lang = 'es-ES';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = (e) => {
            const text = e.results[0][0].transcript;
            messageInput.value = text;
            inputContainer.classList.add('input-has-text');
            stopVoiceInputUI();
            document.getElementById('inputContainer')?.classList.remove('recording');
        };
        rec.onerror = () => { stopVoiceInputUI(); document.getElementById('inputContainer')?.classList.remove('recording'); };
        rec.onend = () => { stopVoiceInputUI(); document.getElementById('inputContainer')?.classList.remove('recording'); };
        rec.start();
    } catch (err) {
        console.warn('Reconocimiento de voz no disponible:', err);
    }
}

// UI de grabación estilo WhatsApp (simple barra/estado)
let recordingOverlayEl = null;
let mediaRecorder = null;
let recordedChunks = [];
let recProgressTimer = null;
let recSeconds = 0;
function startVoiceInputUI() {
    // Crear overlay visual si no existe
    if (!recordingOverlayEl) {
        recordingOverlayEl = document.createElement('div');
        recordingOverlayEl.className = 'recording-overlay';
        recordingOverlayEl.innerHTML = `
            <div class="recording-bar">
                <div class="recording-pulse"></div>
                <div class="recording-text">Grabando… Mantén presionado para hablar</div>
                <div class="recording-timer" id="recordingTimer">0:00</div>
            </div>
        `;
        document.body.appendChild(recordingOverlayEl);
    }
    recordingOverlayEl.classList.add('show');

    // Iniciar grabación con MediaRecorder (push-to-talk)
    startRecording();

    // Timer simple
    const timerEl = document.getElementById('recordingTimer');
    recSeconds = 0;
    recordingOverlayEl.dataset.timer = setInterval(() => {
        recSeconds += 1;
        const m = Math.floor(recSeconds / 60);
        const s = (recSeconds % 60).toString().padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
    }, 1000);

    // Progreso visual en el anillo del botón
    const container = document.getElementById('inputContainer');
    const setProgress = () => {
        const max = 60; // 60s máx por defecto
        const progress = Math.min(recSeconds / max, 1);
        container?.style.setProperty('--rec-progress', `${progress * 100}%`);
        container?.style.setProperty('--rec-visible', `1`);
    };
    recProgressTimer = setInterval(setProgress, 200);
}

function stopVoiceInputUI() {
    if (!recordingOverlayEl) return;
    recordingOverlayEl.classList.remove('show');
    const t = recordingOverlayEl.dataset.timer;
    if (t) { clearInterval(t); delete recordingOverlayEl.dataset.timer; }
    if (recProgressTimer) { clearInterval(recProgressTimer); recProgressTimer = null; }
    const container = document.getElementById('inputContainer');
    container?.style.removeProperty('--rec-visible');
    container?.style.removeProperty('--rec-progress');
}

// Iniciar grabación con MediaRecorder
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = async () => {
            try {
                const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                await uploadAudio(blob);
            } finally {
                stopVoiceInputUI();
                document.getElementById('inputContainer')?.classList.remove('recording');
                stream.getTracks().forEach(t => t.stop());
            }
        };
        mediaRecorder.start();
        // Auto-stop a los 60s
        setTimeout(() => { if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 60000);
    } catch (err) {
        console.warn('No se pudo iniciar grabación:', err);
        stopVoiceInputUI();
        document.getElementById('inputContainer')?.classList.remove('recording');
    }
}

// Subir audio al backend
async function uploadAudio(blob) {
    try {
        const form = new FormData();
        form.append('audio', blob, 'voz.webm');
        const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'X-API-Key': getApiKey(), ...getUserAuthHeaders(), 'X-Requested-With': 'XMLHttpRequest' },
            body: form
        });
        if (!res.ok) throw new Error('No se pudo transcribir el audio');
        const data = await res.json();
        const text = data.text || '(Transcripción en proceso)';
        // Mostrar como tarjeta en el panel derecho
        const card = document.createElement('div');
        card.className = 'studio-card';
        card.innerHTML = `<h4 style="margin:0 0 8px 0">Transcripción (AssemblyAI)</h4><div style="white-space:pre-wrap">${text}</div>`;
        document.getElementById('studioCards')?.prepend(card);
        // También enviar al chat como mensaje del usuario para poder continuar el flujo
        if (text && text !== '(Transcripción en proceso)') {
            addUserMessage(text);
        }
    } catch (e) {
        console.warn('Error subiendo audio:', e);
    }
}

// Utilidades de mensajería con escritura simulada
function sanitizeBotText(text) {
    return String(text || '').replace(/\*\*/g, '');
}

function setHeaderTyping(isTyping) {
    try {
        const statusEl = document.querySelector('.chat-info p');
        if (statusEl) statusEl.textContent = isTyping ? 'Escribiendo...' : 'En línea';
    } catch (_) {}
}

function computeTypingDelay(text) {
    const length = (text || '').length;
    if (length <= 60) return 3000;         // Corto: 3s
    if (length <= 220) return 4500;       // Mediano: 4.5s
    return 7000;                           // Largo: 7s
}

async function sendBotMessage(text, keyboard = null, needsUserInput = false, playAudio = false) {
    const clean = sanitizeBotText(text);
    // Generar token de escritura y respetarlo para poder cancelar
    const myToken = ++chatState.typingToken;
    showTypingIndicator();
    setHeaderTyping(true);
    const delay = computeTypingDelay(clean);
    await new Promise(r => setTimeout(r, delay));
    // Si otro evento (p.ej., clic en enviar) canceló esta escritura, abortar
    if (myToken !== chatState.typingToken) {
        hideTypingIndicator();
        setHeaderTyping(false);
        return;
    }
    hideTypingIndicator();
    setHeaderTyping(false);
    // Si el último mensaje es del bot y estamos mostrando opciones, edítalo
    if (keyboard && chatMessages.querySelectorAll('.message.bot-message:not(.typing-indicator)').length > 0) {
        replaceLastBotMessage(clean, keyboard);
    } else {
        addBotMessage(clean, keyboard, needsUserInput, playAudio);
    }
}

// Agregar mensaje del bot
function addBotMessage(text, keyboard = null, needsUserInput = false, playAudio = false) {
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';

    const avatarHTML = getBotAvatarHTML();
    let messageContent = `
        ${avatarHTML}
        <div class="message-bubble">
            ${String(text).replace(/\*\*/g, '')}
            ${keyboard ? keyboard : ''}
        </div>
    `;

    messageDiv.innerHTML = messageContent;
    chatMessages.appendChild(messageDiv);
    
    // Reproducir audio solo si está habilitado y se solicita específicamente
    if (playAudio && chatState.audioEnabled) {
        playBotResponseAudio(text);
    }
    
    scrollToBottom();
    
    // Agregar al historial
    chatState.conversationHistory.push({
        type: 'bot',
        content: text,
        timestamp: new Date()
    });

    // Evitar mostrar automáticamente el menú principal aquí.
    // El menú se mostrará explícitamente al final del flujo de bienvenida
    // o después de capturar el nombre del usuario.
}

// Reemplazar el último mensaje del bot para no saturar el chat
function replaceLastBotMessage(text, keyboard = null) {
    if (!chatMessages) return;
    // Mantener glosario abierto si está visible
    const hasGlossary = document.getElementById('glossaryOverlay')?.classList.contains('open');
    const botMessages = Array.from(chatMessages.querySelectorAll('.message.bot-message'))
        .filter(el => !el.classList.contains('typing-indicator'));
    const last = botMessages[botMessages.length - 1];
    if (!last) {
        addBotMessage(text, keyboard, false, false);
        return;
    }
    const avatarHTML = getBotAvatarHTML();
    last.innerHTML = `
        ${avatarHTML}
        <div class="message-bubble">
            ${String(text).replace(/\*\*/g, '')}
            ${keyboard ? keyboard : ''}
        </div>
    `;
    scrollToBottom();
    // Actualizar último registro en historial
    for (let i = chatState.conversationHistory.length - 1; i >= 0; i--) {
        if (chatState.conversationHistory[i].type === 'bot') {
            chatState.conversationHistory[i].content = text;
            break;
        }
    }
}

// Agregar mensaje del usuario
function addUserMessage(text) {
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    const avatarHTML = getUserAvatarHTML();
    messageDiv.innerHTML = `
        <div class="message-bubble">${text}</div>
        ${avatarHTML}
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Agregar al historial
    chatState.conversationHistory.push({
        type: 'user',
        content: text,
        timestamp: new Date()
    });
}

// Reproducir audio para respuestas del bot (DESHABILITADO)
function playBotResponseAudio(text) {
    // Función deshabilitada - no reproduce audio automáticamente
    return;
    
    if (!chatState.audioEnabled) return;

    if ('speechSynthesis' in window) {
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.5;
            
            const voices = speechSynthesis.getVoices();
            const spanishVoice = voices.find(voice => voice.lang.includes('es'));
            if (spanishVoice) {
                utterance.voice = spanishVoice;
            }
            
            speechSynthesis.speak(utterance);
        } catch (error) {
            console.warn('Error reproduciendo audio de respuesta:', error);
        }
    }
}

// Mostrar menú principal
// showMainMenu eliminado; navegación ahora desde el panel izquierdo/Studio

// Mostrar instrucciones de bienvenida divididas
// async function showWelcomeInstructions() {
//     await sendBotMessage("📝 ESCRIBE EN EL CHAT\n\nHaz tus preguntas y presiona Enter. Las herramientas ahora están en los paneles laterales (Notas, Glosario, Resumen de audio/video, Informes).");
//     await sendBotMessage("🎯 SUGERENCIAS\n\nCuando corresponda, te propondré acciones como 'Enviar a Notas' o 'Crear Informe'; el panel Studio de la derecha las mostrará como tarjetas.");
// }

// Mensaje guía para dirigir a sesiones del curso
async function showSessionGuide() {
    const guide = `
        <div class="inline-keyboard">
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="Chatbot.showSessionsForTopic('fundamentos')">🤖 Fundamentos</button>
                <button class="keyboard-button" onclick="Chatbot.showSessionsForTopic('ml')">📊 ML</button>
            </div>
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="Chatbot.showSessionsForTopic('deep')">🧠 Deep</button>
                <button class="keyboard-button" onclick="Chatbot.showSessionsForTopic('aplicaciones')">🎯 Aplicaciones</button>
            </div>
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="Chatbot.openTopicSession('fundamentos', 1)">📘 Sesión 1</button>
                <button class="keyboard-button" onclick="Chatbot.openTopicSession('fundamentos', 2)">📗 Sesión 2</button>
            </div>
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="Chatbot.openTopicSession('fundamentos', 3)">📙 Sesión 3</button>
                <button class="keyboard-button" onclick="Chatbot.openTopicSession('fundamentos', 4)">📕 Sesión 4</button>
            </div>
        </div>
    `;
    await sendBotMessage("🏁 Elige un tema o entra directo por sesión (Fundamentos):", guide, false, false);
}

// Mostrar temas
function showTopics() {
    // Saltar directamente al selector de sesiones del tema por defecto
    showSessionsForTopic('fundamentos');
}

// Mostrar tema específico
function showTopic(topic) {
    showSessionsForTopic(topic);
}

// Mostrar selector de sesiones 1..4 para un tema
function showSessionsForTopic(topic) {
    const topicTitles = {
        'fundamentos': '🤖 Fundamentos de IA',
        'ml': '📊 Machine Learning',
        'deep': '🧠 Deep Learning',
        'aplicaciones': '🎯 Aplicaciones Prácticas'
    };

    const keyboard = `
        <div class="inline-keyboard">
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="Chatbot.openTopicSession('${topic}', 1)">📘 Sesión 1</button>
                <button class="keyboard-button" onclick="Chatbot.openTopicSession('${topic}', 2)">📗 Sesión 2</button>
            </div>
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="Chatbot.openTopicSession('${topic}', 3)">📙 Sesión 3</button>
                <button class="keyboard-button" onclick="Chatbot.openTopicSession('${topic}', 4)">📕 Sesión 4</button>
            </div>
            ${getBackButton()}
        </div>
    `;

    replaceLastBotMessage(`${topicTitles[topic] || '📚 Tema'}\n\nSelecciona la sesión a la que quieres ir:`, keyboard);
}

// Acción al seleccionar una sesión
function openTopicSession(topic, session) {
    const titles = {
        'fundamentos': '🤖 Fundamentos de IA',
        'ml': '📊 Machine Learning',
        'deep': '🧠 Deep Learning',
        'aplicaciones': '🎯 Aplicaciones Prácticas'
    };
    const title = titles[topic] || '📚 Tema';

    const keyboard = getSessionActionsKeyboard(topic, session);

    replaceLastBotMessage(`${title} — Sesión ${session}\n\nSelecciona una acción:`, keyboard);
}

function getSessionActionsKeyboard(topic, session) {
    return `
        <div class="inline-keyboard">
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="Chatbot.showCollaborativeActivities('${topic}', ${session})">🤝 Actividades Colaborativas</button>
                <button class="keyboard-button" onclick="Chatbot.startQuiz('${topic}', ${session})">📝 Cuestionario</button>
            </div>
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="Chatbot.showFAQ('${topic}', ${session})">❓ FAQ</button>
                <button class="keyboard-button" onclick="Chatbot.copyPrompts('${topic}', ${session})">📋 Copiar Prompts</button>
            </div>
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="Chatbot.showSessionsForTopic('${topic}')">⬅️ Volver a Sesiones</button>
            </div>
            ${getBackButton()}
        </div>
    `;
}

function showCollaborativeActivities(topic, session) {
    const activities = `
• Debate guiado: Ventajas y límites de ${topic} (Sesión ${session})
• Parejas: Explica el concepto y comparte ejemplo real
• Mini-proyecto: Diseña un caso de uso y métricas de éxito
`; 
    sendBotMessage(`🤝 ACTIVIDADES COLABORATIVAS — Sesión ${session}\n\n${activities}`, getSessionActionsKeyboard(topic, session), false, false);
}

function startQuiz(topic, session) {
    const quizIntro = `📝 CUESTIONARIO — Sesión ${session}\n\nResponde brevemente (1–2 líneas).`;
    const q = `
1) Define en tus palabras el objetivo principal de esta sesión.
2) Pon un ejemplo práctico del concepto clave visto.
3) ¿Qué métrica usarías para evaluar el éxito?
`;
    sendBotMessage(`${quizIntro}\n\n${q}`, getSessionActionsKeyboard(topic, session), false, false);
}

function showFAQ(topic, session) {
    const faq = `
• ¿Cuándo usar ${topic}?\n• ¿Qué errores comunes debo evitar?\n• ¿Qué recursos recomiendas para profundizar?`;
    sendBotMessage(`❓ FAQ — Sesión ${session}\n\n${faq}`, getSessionActionsKeyboard(topic, session), false, false);
}

async function copyPrompts(topic, session) {
    // Si es la primera sesión, mostrar panel lateral con instrucciones y botón copiar
    if (session === 1) {
        const promptText = `Actúa como un analista experto en inteligencia artificial generativa. Realiza una investigación exhaustiva con el título "Gen AI El Despertar de una Nueva Era Humana del miedo al entusiasmo" para identificar y analizar los siguientes puntos clave:\n\n- Evolución de la percepción: Describe el cambio en la percepción de la IA generativa desde su aparición masiva, incluyendo la reacción inicial y la mentalidad actual en la alta dirección.\n\n- Impacto transformador y ejemplos de uso actuales: Identifica cómo la IA generativa está redefiniendo la productividad humana y transformando modelos de negocio en diversas industrias. Proporciona ejemplos específicos de empresas y sectores que ya están utilizando la IA generativa, detallando las aplicaciones y los beneficios obtenidos.\n\n- Avances tecnológicos y ecosistema: Detalla las nuevas generaciones de modelos de IA generativa (Finales 2024-2025) y sus capacidades mejoradas. Describe el ecosistema de proveedores líderes y sus herramientas para entornos corporativos. Explica las estrategias de adopción de la IA generativa por parte de las empresas, incluyendo la elección entre modelos públicos y la construcción de IP propia.\n\n- Implicaciones humanas y sociales: Analiza cómo la IA generativa está democratizando el conocimiento, amplificando la creatividad y reimaginando el trabajo, destacando el valor humano en este nuevo escenario.\n\n- Casos de uso en finanzas y banca: Desglosa los casos de uso recientes de la IA generativa en el sector financiero y bancario, incluyendo asistentes virtuales, optimización de riesgos y cumplimiento, y personalización/eficiencia. Menciona las proyecciones de McKinsey para el futuro del trabajo en relación con la IA generativa.\n\n- Desafíos y consideraciones estratégicas para líderes: Extrae las recomendaciones clave para los CEOs y C-levels en la adopción e integración de la IA generativa, incluyendo la necesidad de ética, visión, valentía e inversión en talento.\n\nAsegúrate de citar cada dato o afirmación con el número de fuente correspondiente. Organiza tu respuesta de manera clara y concisa, utilizando un formato de investigación formal.`;
        showPromptOverlay({
            title: `Paso 1: Prompt de Investigación — Sesión ${session}`,
            htmlIntro: `1. Abre <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer">Gemini</a> y, en la caja de chat, copia y pega el siguiente prompt en su totalidad.<br/>2. Activa la herramienta <strong>deep research</strong> y ejecuta.`,
            promptText,
        });
        return;
    }

    const prompts = [
        `Explícame el concepto central de la sesión ${session} de ${topic} con un ejemplo simple`,
        `Dame 3 ejercicios prácticos breves sobre la sesión ${session} de ${topic}`,
        `Propón un mini‑proyecto aplicando lo visto en la sesión ${session} de ${topic}`
    ].join('\n');
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(prompts);
            sendBotMessage('📋 Prompts copiados al portapapeles.', getSessionActionsKeyboard(topic, session), false, false);
        } else {
            const ta = document.createElement('textarea');
            ta.value = prompts; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            sendBotMessage('📋 Prompts copiados al portapapeles.', getSessionActionsKeyboard(topic, session), false, false);
        }
    } catch (e) {
        sendBotMessage('⚠️ No se pudo copiar automáticamente. Aquí tienes los prompts:\n\n' + prompts, getSessionActionsKeyboard(topic, session), false, false);
    }
}

// Panel lateral para prompts (similar al glosario)
function showPromptOverlay({ title, htmlIntro, promptText }) {
    let overlay = document.getElementById('promptOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'promptOverlay';
        overlay.className = 'prompt-overlay';
        overlay.innerHTML = `
            <div class="prompt-panel">
                <div class="prompt-header">
                    <h3>📑 <span id="promptTitle"></span></h3>
                    <button class="prompt-close" aria-label="Cerrar">×</button>
                </div>
                <div class="prompt-body">
                    <div id="promptIntro" class="prompt-intro"></div>
                    <div class="prompt-actions">
                        <button id="copyPromptBtn" class="keyboard-button" style="max-width:200px">📋 Copiar Prompt</button>
                    </div>
                    <pre id="promptText" class="prompt-text"></pre>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.prompt-close').addEventListener('click', () => hidePromptOverlay());
        overlay.querySelector('#copyPromptBtn').addEventListener('click', async () => {
            const text = overlay.querySelector('#promptText').textContent;
            try {
                await navigator.clipboard.writeText(text);
                overlay.querySelector('#copyPromptBtn').textContent = '✅ Copiado';
                setTimeout(() => overlay.querySelector('#copyPromptBtn').textContent = '📋 Copiar Prompt', 1200);
            } catch (_) {}
        });
    }
    overlay.querySelector('#promptTitle').textContent = title || 'Prompt';
    overlay.querySelector('#promptIntro').innerHTML = htmlIntro || '';
    overlay.querySelector('#promptText').textContent = promptText || '';

    const container = document.querySelector('.telegram-container');
    const glossary = document.getElementById('glossaryOverlay');
    const panel = overlay.querySelector('.prompt-panel');
    if (glossary && glossary.classList.contains('open')) {
        // si el prompt estaba a la derecha, animarlo hacia la izquierda suavemente
        panel.classList.add('left');
        if (container) {
            container.classList.remove('shift-left');
            container.style.transform = 'translateX(0) scale(0.975)';
        }
    } else {
        panel.classList.remove('left');
        if (container) {
            container.classList.add('shift-left');
            container.style.removeProperty('transform');
        }
    }
    setTimeout(() => overlay.classList.add('open'), 80);
}

function hidePromptOverlay() {
    const overlay = document.getElementById('promptOverlay');
    const container = document.querySelector('.telegram-container');
    if (overlay) overlay.classList.remove('open');
    setTimeout(() => {
        const glossary = document.getElementById('glossaryOverlay');
        if (glossary && glossary.classList.contains('open')) {
            if (container) {
                container.classList.add('shift-left');
                container.style.removeProperty('transform');
            }
        } else {
            container?.classList.remove('shift-left');
            container?.style.removeProperty('transform');
        }
    }, 150);
}

// Mostrar ejercicios
function showExercises() {
    const keyboard = `
        <div class="inline-keyboard">
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="showExerciseLevel('basicos')">🔰 Ejercicios Básicos</button>
            </div>
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="showExerciseLevel('intermedios')">⚡ Ejercicios Intermedios</button>
            </div>
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="showExerciseLevel('proyectos')">🚀 Proyectos Prácticos</button>
            </div>
            <div class="keyboard-row">
                <button class="keyboard-button" onclick="showExerciseLevel('desafios')">🏆 Desafíos Avanzados</button>
            </div>
            ${getBackButton()}
        </div>
    `;
    
    sendBotMessage("🧠 EJERCICIOS DISPONIBLES\n\nSelecciona el nivel de dificultad:", keyboard, false, false);
}

// Mostrar nivel de ejercicios
function showExerciseLevel(level) {
    const exercises = {
        'basicos': {
            title: '🔰 Ejercicios Básicos',
            content: '• Implementar un algoritmo de clasificación simple\n• Crear un modelo de regresión lineal\n• Análisis exploratorio de datos\n• Visualización de datos básica'
        },
        'intermedios': {
            title: '⚡ Ejercicios Intermedios',
            content: '• Construir una red neuronal básica\n• Implementar un sistema de recomendación\n• Procesamiento de texto con NLP\n• Optimización de hiperparámetros'
        },
        'proyectos': {
            title: '🚀 Proyectos Prácticos',
            content: '• Clasificador de imágenes\n• Sistema de análisis de sentimientos\n• Chatbot simple\n• Sistema de recomendación completo'
        },
        'desafios': {
            title: '🏆 Desafíos Avanzados',
            content: '• Optimización de hiperparámetros\n• Implementación de algoritmos complejos\n• Análisis de datos en tiempo real\n• Modelos de ensemble'
        }
    };
    
    const selectedExercise = exercises[level];
    sendBotMessage(`${selectedExercise.title}\n\n${selectedExercise.content}`, getBackButton(), false, false);
}

// Mostrar ayuda
function showHelp() {
    sendBotMessage("❓ AYUDA Y SOPORTE\n\nAquí tienes las instrucciones de uso completas:", null, false, false);
    
    setTimeout(() => {
        sendBotMessage("📝 ESCRIBIR MENSAJES\n\nEscribe cualquier pregunta y presiona Enter o haz clic en enviar.", null, false, false);
    }, 1500);
    
        // El sistema ahora responde dinámicamente según la base de datos
    
    setTimeout(() => {
        sendBotMessage("⌨️ COMANDOS ESPECIALES\n\n• 'ayuda' - Para ver estas instrucciones\n• 'temas' - Para ver los temas disponibles\n• 'ejercicios' - Para solicitar ejercicios prácticos", null, false, false);
    }, 4500);
    
    setTimeout(() => {
        sendBotMessage("🎧 AUDIO\n\nEl chatbot reproduce audio automáticamente solo en el mensaje de bienvenida.", null, false, false);
    }, 6000);
    
    setTimeout(() => {
        sendBotMessage("📊 HISTORIAL\n\nTodas las conversaciones se guardan automáticamente.", getBackButton(), false, false);
    }, 7500);
}

// Mostrar glosario
// Mostrar glosario como panel lateral (no dentro del chat)
function showGlossary() {
    // Crear overlay si no existe
    let overlay = document.getElementById('glossaryOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'glossaryOverlay';
        overlay.className = 'glossary-overlay';
        overlay.innerHTML = `
            <div class="glossary-panel">
                <div class="glossary-header">
                    <h3>📖 Glosario de Términos de IA</h3>
                    <button class="glossary-close" aria-label="Cerrar">×</button>
                </div>
                <p class="glossary-subtitle" id="glossarySubtitle">Selecciona una letra para ver los términos disponibles:</p>
                <div class="glossary-back" id="glossaryBack" style="display:none">
                    <button class="back-btn" aria-label="Volver al glosario">⬅️ Volver al glosario</button>
                </div>
                <div class="alphabet-grid" id="alphabetGrid"></div>
                <div class="glossary-results" id="glossaryResults">
                    <div class="glossary-empty">Selecciona una letra</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Eventos
        overlay.querySelector('.glossary-close').addEventListener('click', hideGlossary);
        overlay.querySelector('#glossaryBack').addEventListener('click', glossaryBackToMenu);

        // Construir alfabeto
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const grid = overlay.querySelector('#alphabetGrid');
        alphabet.forEach((letter) => {
            const btn = document.createElement('button');
            btn.className = 'alpha-btn';
            btn.textContent = letter;
            btn.addEventListener('click', () => renderGlossaryLetter(letter));
            grid.appendChild(btn);
        });
    }

    // Animación: si el panel de prompts está abierto, centrar chat; si no, mover a la izquierda
    const container = document.querySelector('.telegram-container');
    const promptOverlay = document.getElementById('promptOverlay');
    if (container) {
        if (promptOverlay && promptOverlay.classList.contains('open')) {
            container.classList.remove('shift-left');
            container.style.transform = 'translateX(0) scale(0.975)';
        } else {
            container.classList.add('shift-left');
            container.style.removeProperty('transform');
        }
    }
    setTimeout(() => overlay.classList.add('open'), 120);
}

function hideGlossary() {
    const overlay = document.getElementById('glossaryOverlay');
    const container = document.querySelector('.telegram-container');
    if (overlay) overlay.classList.remove('open');
    // Ajustar posición del chat según si el panel de prompts sigue abierto
    setTimeout(() => {
        const promptOverlay = document.getElementById('promptOverlay');
        if (promptOverlay && promptOverlay.classList.contains('open')) {
            if (container) {
                container.classList.remove('shift-left');
                container.style.transform = 'translateX(0) scale(0.975)';
            }
        } else {
            if (container) {
                container.classList.remove('shift-left');
                container.style.removeProperty('transform');
            }
        }
    }, 150);
}

// Diccionario simple de términos
const GLOSSARY = {
    A: [ { term: 'Algoritmo', def: 'Conjunto de reglas o instrucciones para resolver un problema.' } ],
    B: [ { term: 'Big Data', def: 'Conjuntos de datos muy grandes y complejos.' } ],
    C: [ { term: 'CNN', def: 'Red neuronal convolucional.' } ],
    D: [ { term: 'Deep Learning', def: 'Aprendizaje profundo con redes neuronales.' } ],
    M: [ { term: 'Machine Learning', def: 'Aprendizaje automático de máquinas.' } ],
    N: [ { term: 'NLP', def: 'Procesamiento de lenguaje natural.' } ]
};

function renderGlossaryLetter(letter) {
    const overlay = document.getElementById('glossaryOverlay');
    if (!overlay) return;
    const results = overlay.querySelector('#glossaryResults');
    const grid = overlay.querySelector('#alphabetGrid');
    const back = overlay.querySelector('#glossaryBack');
    const subtitle = overlay.querySelector('#glossarySubtitle');
    if (grid) grid.style.display = 'none';
    if (back) back.style.display = 'block';
    if (subtitle) subtitle.textContent = `Términos disponibles — Letra ${letter}`;
    const entries = GLOSSARY[letter] || [];
    if (entries.length === 0) {
        results.innerHTML = `<h4 class=\"glossary-letter\">Letra ${letter}</h4><div class=\"glossary-empty\">No hay términos para la letra ${letter}</div>`;
        return;
    }
    const items = entries
        .map(e => `<div class="glossary-item"><div class="term">${e.term}</div><div class="def">${e.def}</div></div>`)
        .join('');
    results.innerHTML = `<h4 class=\"glossary-letter\">Letra ${letter}</h4>${items}`;
}

function glossaryBackToMenu() {
    const overlay = document.getElementById('glossaryOverlay');
    if (!overlay) return;
    const grid = overlay.querySelector('#alphabetGrid');
    const back = overlay.querySelector('#glossaryBack');
    const results = overlay.querySelector('#glossaryResults');
    const subtitle = overlay.querySelector('#glossarySubtitle');
    if (grid) grid.style.display = 'grid';
    if (back) back.style.display = 'none';
    if (subtitle) subtitle.textContent = 'Selecciona una letra para ver los términos disponibles:';
    if (results) results.innerHTML = '<div class="glossary-empty">Selecciona una letra</div>';
}

// Función para hacer llamadas a OpenAI de forma segura
async function callOpenAI(prompt, context = '') {
    try {
        const base = (typeof window !== 'undefined' && (window.API_BASE || localStorage.getItem('API_BASE'))) || '';
        
        console.log('[OPENAI CALL] Enviando request a:', `${base}/api/openai`);
        console.log('[OPENAI CALL] Prompt:', prompt.substring(0, 100) + '...');
        
        const response = await fetch(`${base}/api/openai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': getApiKey(),
                ...getUserAuthHeaders(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ prompt, context })
        });

        console.log('[OPENAI CALL] Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[OPENAI CALL] Error response:', errorText);
            
            // Si es error de autenticación (401), devolver respuesta de fallback
            if (response.status === 401) {
                console.log('[OPENAI CALL] Error de autenticación, usando respuesta de fallback');
                return await getFallbackResponse(prompt);
            }
            
            throw new Error(`Error en la API: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[OPENAI CALL] Response data:', data);
        return data.response;
    } catch (error) {
        console.error('Error llamando a OpenAI:', error);
        
        // Fallback: respuesta básica de desarrollo
        console.log('[OPENAI CALL] Usando respuesta de fallback por error');
        return await getFallbackResponse(prompt);
    }
}

// Función de respuesta de fallback para desarrollo
async function getFallbackResponse(prompt) {
    const promptLower = prompt.toLowerCase();
    
        // Ahora se usa el sistema de respuestas personalizadas con base de datos
    
    try {
        // Usar el nuevo sistema de respuestas personalizadas
        const personalizedResponse = await generatePersonalizedResponse(prompt);
        if (personalizedResponse) {
            return personalizedResponse;
        }
    } catch (error) {
        console.error('❌ Error generando respuesta personalizada en getFallbackResponse:', error);
    }
    
    // Fallback mínimo si todo falla
    const userInfo = await getCurrentUserInfo();
    return `${userInfo.display_name}, disculpa, tuve un problema técnico. ¿Podrías repetir tu pregunta?`;
}


// Función para consultar la base de datos de forma segura
async function queryDatabase(query, params = []) {
    try {
        const base = (typeof window !== 'undefined' && (window.API_BASE || localStorage.getItem('API_BASE'))) || '';
        const response = await fetch(`${base}/api/database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': getApiKey(),
                ...getUserAuthHeaders(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ query, params })
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error consultando base de datos:', error);
        return [];
    }
}

// Función para obtener contexto de la base de datos de forma segura
async function getDatabaseContext(userQuestion) {
    try {
        const base = (typeof window !== 'undefined' && (window.API_BASE || localStorage.getItem('API_BASE'))) || '';
        
        const response = await fetch(`${base}/api/context`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': getApiKey(),
                ...getUserAuthHeaders(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ userQuestion })
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error obteniendo contexto de BD:', error);
        return [];
    }
}

// Función para obtener la API key de forma segura
function getApiKey() {
    // Para desarrollo, retorna una clave fija
    return 'dev-api-key';
}

// Encabezados de autenticación de usuario
function getUserAuthHeaders() {
    try {
        // Priorizar 'userToken' que es lo que usa el auth-guard
        const token = localStorage.getItem('userToken') || 
                     sessionStorage.getItem('authToken') || 
                     localStorage.getItem('authToken') || '';
        
        // Obtener userId del userData o fallback
        let userId = '';
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                userId = user.id || user.username || '';
            }
        } catch (_) {
            userId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || '';
        }
        
        // Logging para debug
        console.log('[AUTH DEBUG] Token found:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
        console.log('[AUTH DEBUG] Token completo:', token);
        console.log('[AUTH DEBUG] UserId:', userId || 'NO USER ID');
        console.log('[AUTH DEBUG] Token source:', localStorage.getItem('userToken') ? 'userToken' : 
                   sessionStorage.getItem('authToken') ? 'authToken(session)' : 
                   localStorage.getItem('authToken') ? 'authToken(local)' : 'none');
        
        // Verificar si el token contiene la firma de desarrollo
        if (token) {
            console.log('[AUTH DEBUG] Token contiene fake-signature:', token.includes('fake-signature-for-dev-testing-only'));
            if (token.includes('.')) {
                const parts = token.split('.');
                console.log('[AUTH DEBUG] Token parts:', parts.length);
                if (parts.length >= 2) {
                    try {
                        const payload = JSON.parse(atob(parts[1]));
                        console.log('[AUTH DEBUG] Token payload:', payload);
                    } catch (e) {
                        console.log('[AUTH DEBUG] Error decodificando payload:', e.message);
                    }
                }
            }
        }
        
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (userId) headers['X-User-Id'] = userId;
        return headers;
    } catch (_) {
    return {};
    }
}

// Cargar datos del curso hardcodeados
async function loadCourseData() {
    try {
        const response = await fetch('/data/course-data.js');
        if (response.ok) {
            const text = await response.text();
            // Evaluar el módulo para obtener los datos
            const moduleText = text.replace('module.exports = COURSE_DATA;', 'COURSE_DATA');
            return eval(`(${moduleText})`);
        }
    } catch (error) {
        console.log('Usando datos de curso embebidos como fallback');
    }
    return null;
}

// Buscar información relevante en los datos del curso
function searchCourseData(courseData, query) {
    if (!courseData) return '';
    
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

// Procesar mensaje del usuario con IA - ACTUALIZADO SEGÚN PROMPT_CLAUDE.md
async function processUserMessageWithAI(message) {
    try {
        console.log('🤖 Procesando mensaje con IA mejorada:', message);
        
        // Obtener usuario actual
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.error('❌ No se pudo obtener usuario actual en processUserMessageWithAI');
            return 'Error: No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.';
        }
        
        // NUEVA LÓGICA: Usar sistema de respuestas personalizadas con userId
        const personalizedResponse = await generatePersonalizedResponse(message, currentUser.id);
        
        if (personalizedResponse) {
            console.log('✅ Respuesta personalizada generada exitosamente');
            return personalizedResponse;
        }
        
        console.log('⚠️ No se pudo generar respuesta personalizada, usando fallback');
        
        // Fallback: mantener algo del sistema anterior como respaldo
        const courseData = await loadCourseData();
        const dbContext = await getDatabaseContext(message);
        
        // Construir contexto de BD de forma más legible
        let contextInfo = '';
        if (dbContext.length > 0) {
            contextInfo = '\n\nInformación relevante de la base de datos:\n';
            dbContext.forEach(item => {
                switch (item.source) {
                    case 'glossary':
                        contextInfo += `📖 Glosario: ${item.term} - ${item.definition}\n`;
                        break;
                    case 'faq':
                        contextInfo += `❓ FAQ (${item.session_title}): ${item.question} - ${item.answer}\n`;
                        break;
                    case 'activity':
                        contextInfo += `🎯 Actividad (${item.session_title}): ${item.title} - ${item.description || ''}\n`;
                        break;
                    case 'question':
                        contextInfo += `🤔 Pregunta (${item.session_title}): ${item.text}\n`;
                        break;
                }
            });
        }
        
        // Agregar contexto de datos del curso hardcodeados
        if (courseData) {
            const courseInfo = searchCourseData(courseData, message);
            if (courseInfo.length > 0) {
                contextInfo += '\n\nInformación del curso "Aprende y Aplica IA":\n';
                courseInfo.forEach(info => {
                    contextInfo += `${info}\n`;
                });
                
                // Agregar información general del curso
                contextInfo += `\n📚 Curso: ${courseData.info.title} (${courseData.info.duration})\n`;
                contextInfo += `🎯 Descripción: ${courseData.info.description}\n`;
            }
        }
        
        // Prompt completo siguiendo PROMPT_CLAUDE.md al pie de la letra
        const systemPrompt = `Sistema — Claude (ES)

Rol y alcance
- Eres "Asistente de Aprende y Aplica IA": experto en IA que guía a estudiantes en español con tono profesional, cercano y nada robotizado.
- Límite estricto: céntrate en contenidos del curso de IA, ejercicios, glosario y actividades. Si algo está fuera de alcance, redirige amablemente con 2–4 opciones del temario.

CURSO "APRENDE Y APLICA IA" - CONTENIDO DISPONIBLE:
- Sesiones estructuradas con contenido práctico y aplicado
- Temas principales: Fundamentos de IA, comunicación con IA, aplicaciones prácticas, estrategias empresariales

GLOSARIO COMPLETO: Términos especializados con definiciones precisas
EJERCICIOS PRÁCTICOS: Proyectos hands-on y actividades aplicadas
RECURSOS: Libros recomendados, cursos online, herramientas, datasets

CURSO "APRENDE Y APLICA IA" - CONTENIDO DISPONIBLE:
- Sesiones estructuradas con contenido práctico y aplicado
- Temas principales: Fundamentos de IA, comunicación con IA, aplicaciones prácticas, estrategias empresariales

GLOSARIO COMPLETO: Términos especializados con definiciones precisas
EJERCICIOS PRÁCTICOS: Proyectos hands-on y actividades aplicadas
RECURSOS: Libros recomendados, cursos online, herramientas, datasets

Objetivo general
- Entregar respuestas claras, accionables y verificables basadas en el contenido específico del curso
- Generar casos de uso y prompts listos para copiar cuando aporten valor
- Entregar respuestas claras, accionables y verificables basadas en el contenido específico del curso
- Generar casos de uso y prompts listos para copiar cuando aporten valor

Manejo de preguntas largas
- Acepta entradas extensas sin recortar contenido. Resume el objetivo en 1–2 líneas, divide en sub‑tareas y responde por secciones. Si la consulta es muy amplia, propone un plan paso a paso y entrega un primer bloque útil; ofrece continuar con "¿sigo con la parte B/C…?)".

Detección de ánimo (obligatoria)
- Clasifica el ánimo del usuario en: entusiasta | neutral | confundido | frustrado | molesto | troll/"pregunta tonta".
- Adapta el tono en consecuencia: breve‑enérgico (entusiasta), calmado y paso a paso (confundido/frustrado), firme y respetuoso (molesto). Si detectas troll/pregunta tonta, usa sarcasmo ligero y pertinente al curso sin atacar a la persona.

Política de sarcasmo (seguro y útil)
- Solo cuando la intención sea claramente trivial/troll y manteniendo el foco educativo.
- Hazlo en una línea, ingenioso y relacionado con IA/curso. Evita insultos, estereotipos o humillaciones.

Desambiguación y complejidad
- Si la consulta es ambigua o falta contexto, formula 1–2 preguntas de aclaración o continúa bajo supuestos explícitos.
- Para preguntas complejas, divide en secciones con pasos y ejemplos; termina con una mini‑conclusión.
- Si hay cifras o estado del arte cambiante, márcalo como aproximado/sujeto a cambios.

Casos de uso (cuando aplique)
- Entrega 3–5 casos con: propósito, pasos clave, herramientas/recursos, métrica de éxito y riesgo/consideración.

Prompts (cuando aplique)
- Ofrece 2–4 prompts listos para copiar orientados a estudio/práctica o evaluación, alineados al temario específico del curso.
- Ofrece 2–4 prompts listos para copiar orientados a estudio/práctica o evaluación, alineados al temario específico del curso.

Formato de respuesta
- 1 línea inicial que responda directo a la intención.
- 3–6 viñetas con lo esencial (usa **negritas** para conceptos clave del curso).
- Cierra con una pregunta breve que proponga el siguiente paso u opciones específicas del curso.
- 3–6 viñetas con lo esencial (usa **negritas** para conceptos clave del curso).
- Cierra con una pregunta breve que proponga el siguiente paso u opciones específicas del curso.
- Español neutro, claro y preciso. Evita párrafos largos; usa listas.

Límites y seguridad
- No inventes enlaces ni bibliografía. No des instrucciones peligrosas.
- Si no sabes algo, admítelo y sugiere cómo investigarlo dentro del marco del curso.

Nunca pidas el nombre/apellido del usuario ni bloquees la conversación por identificación.

${contextInfo}

Responde siguiendo exactamente el formato especificado y utilizando la información específica del curso "Aprende y Aplica IA":`;
        
        const fullPrompt = `${systemPrompt}\n\nUsuario: ${message}\n\nAsistente:`;
        
        // Llamar a OpenAI
        const aiResponse = await callOpenAI(fullPrompt, contextInfo);
        
        // Si no hay respuesta de OpenAI, usar fallback
        if (!aiResponse || aiResponse.trim() === '') {
            console.log('[PROCESS MESSAGE] No hay respuesta de OpenAI, usando fallback');
            return await getFallbackResponse(message);
        }
        
        return aiResponse;
    } catch (error) {
        console.error('Error procesando mensaje con IA:', error);
        
        console.error('❌ Error completo:', error);
        
        // Mostrar detalles del error en consola para debugging
        if (error.response) {
            try {
                const errorData = await error.response.json();
                console.error('📋 Error details:', errorData);
            } catch (e) {
                console.error('📋 Error text:', await error.response.text());
            }
        }
        
        // En caso de error, usar respuesta de fallback
        console.log('[PROCESS MESSAGE] Error en procesamiento, usando fallback');
        return await getFallbackResponse(message);
    }
}

// Enviar mensaje
// REEMPLAZAR completamente la función sendMessage según PROMPT_CLAUDE.md
async function sendMessage() {
    console.log('[CHAT] 🚀 Iniciando envío de mensaje mejorado...');
    const message = messageInput.value.trim();
    
    if (!message) {
        console.log('[CHAT] Mensaje vacío, cancelando envío');
        return;
    }
    
    // Obtener usuario actual
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('❌ No se pudo obtener usuario actual');
        addBotMessage('Error: No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.');
        return;
    }
    
    console.log('[CHAT] 👤 Usuario identificado:', currentUser.username || currentUser.email);
    
    // Cancelar cualquier escritura del bot en curso
    try {
        chatState.typingToken++;
        hideTypingIndicator();
        setHeaderTyping(false);
        chatState.isTyping = false;
    } catch (_) {}

    console.log('[CHAT] Enviando mensaje:', message);
    addUserMessage(message);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Actualizar estado del botón después de limpiar el input
    try {
        if (inputContainer) {
            inputContainer.classList.remove('input-has-text');
        }
    } catch (error) {
        console.warn('[CHAT] Error actualizando estado del botón después de enviar:', error);
    }

    // Mostrar indicador de escritura
    showTypingIndicator();

    // Probar conexión a base de datos
    await testDatabaseConnection();
    
    // PRIMERO: Crear/actualizar sesión de chat (según PROMPT)
    await createOrUpdateChatSession(currentUser.id);
    
    // SEGUNDO: Verificar inscripción del usuario (según PROMPT)
    await checkUserEnrollment(currentUser.id);
    
    // Clasificar pregunta
    const questionType = classifyQuestion(message);
    console.log('[CHAT] 📋 Tipo de pregunta clasificada:', questionType);
    
    try {
        // Generar respuesta personalizada
        console.log('[CHAT] 🤖 Generando respuesta personalizada...');
        const response = await generatePersonalizedResponse(message, currentUser.id);
        
        hideTypingIndicator();
        console.log('[CHAT] ✅ Respuesta personalizada generada exitosamente');
        
        // Mostrar respuesta
        await addBotMessage(response);
        
    } catch (error) {
        hideTypingIndicator();
        console.error('[CHAT] ❌ Error generando respuesta:', error);
        
        const userInfo = await getCurrentUserInfo();
        await addBotMessage(`Hola ${userInfo.display_name || userInfo.first_name}, disculpa, tuve un problema técnico. ¿Podrías repetir tu pregunta?`);
    }
}

// Función auxiliar para obtener el usuario actual
function getCurrentUser() {
    try {
        const currentUserData = localStorage.getItem('currentUser');
        if (!currentUserData) {
            return null;
        }
        return JSON.parse(currentUserData);
    } catch (error) {
        console.error('❌ Error obteniendo usuario actual:', error);
        return null;
    }
}

// Procesar mensaje del usuario
async function handleUserMessage(message) {
    if (chatState.currentState === 'start' && !chatState.userName) {
        // Ya no se requiere capturar nombre; ir directo al procesamiento IA
        chatState.currentState = 'main_menu';
        // Evitar error si showMainMenu fue eliminado
        try { if (typeof showMainMenu === 'function') { showMainMenu(); } } catch (_) {}
        const response = await processUserMessageWithAI(message);
        await sendBotMessage(response, null, false, false);
    } else {
        // Procesar otros mensajes con IA
        const response = await processUserMessageWithAI(message);
        await sendBotMessage(response, null, false, false);
    }
}

// Las respuestas ahora se generan dinámicamente con generatePersonalizedResponse()
// Esta función quedó obsoleta con el nuevo sistema inteligente

// Funciones de utilidad para botones
function getBackButton() { return ``; }

// Scroll al final del chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Controlar audio
function toggleAudio() {
    chatState.audioEnabled = !chatState.audioEnabled;
    // Si se desactiva durante una reproducción, detenerla inmediatamente
    try {
        if (!chatState.audioEnabled) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (chatState.currentAudio && typeof chatState.currentAudio.pause === 'function') {
                chatState.currentAudio.pause();
                chatState.currentAudio.currentTime = 0;
            }
        }
    } catch(_) {}
    console.log('Audio ' + (chatState.audioEnabled ? 'activado' : 'desactivado'));
    return chatState.audioEnabled;
}

// Obtener estado del audio
function getAudioStatus() {
    return chatState.audioEnabled;
}

// Configurar volumen
function setAudioVolume(volume) {
    if (volume >= 0 && volume <= 1) {
        CHATBOT_CONFIG.welcomeAudio.volume = volume;
        console.log('Volumen configurado a:', volume);
    }
}

// Mostrar indicador de escritura
function showTypingIndicator() {
    if (!chatMessages) return;
    if (chatState.isTyping) return;
    
    chatState.isTyping = true;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="typing-avatar">
            <div class="avatar-circle"><span class="avatar-emoji">🤖</span></div>
            <div class="typing-dots">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

// Ocultar indicador de escritura
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    chatState.isTyping = false;
}

// ===== Sistema de gestión de sesiones =====
let sessionManager = {
    sessions: new Map(),
    currentSession: null,
    nextId: 1
};

function initializeSessionManager() {
    // Cargar sesiones desde localStorage
    try {
        const saved = localStorage.getItem('chat_sessions');
        if (saved) {
            const data = JSON.parse(saved);
            sessionManager.sessions = new Map(data.sessions || []);
            sessionManager.currentSession = data.currentSession || null;
            sessionManager.nextId = data.nextId || 1;
        }
    } catch (_) {}
    
    // Crear sesión inicial si no existe
    if (sessionManager.sessions.size === 0) {
        createNewSession();
    }
    
    updateSessionUI();
}

function saveSessions() {
    try {
        const data = {
            sessions: Array.from(sessionManager.sessions.entries()),
            currentSession: sessionManager.currentSession,
            nextId: sessionManager.nextId
        };
        localStorage.setItem('chat_sessions', JSON.stringify(data));
    } catch (_) {}
}

function createNewSession() {
    const sessionId = `sess_${sessionManager.nextId++}`;
    const session = {
        id: sessionId,
        title: `Nueva sesión ${sessionManager.sessions.size + 1}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
    };
    
    sessionManager.sessions.set(sessionId, session);
    sessionManager.currentSession = sessionId;
    
    // Limpiar chat actual
    chatState.conversationHistory = [];
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) chatMessages.innerHTML = '';
    
    saveSessions();
    updateSessionUI();
    initializeChat(); // Reiniciar chat con mensaje de bienvenida
}

function switchToSession(sessionId) {
    if (!sessionManager.sessions.has(sessionId)) return;
    
    // Guardar mensajes de sesión actual
    if (sessionManager.currentSession) {
        const currentSession = sessionManager.sessions.get(sessionManager.currentSession);
        if (currentSession) {
            currentSession.messages = [...chatState.conversationHistory];
            currentSession.updatedAt = Date.now();
        }
    }
    
    // Cambiar a nueva sesión
    sessionManager.currentSession = sessionId;
    const session = sessionManager.sessions.get(sessionId);
    
    // Restaurar mensajes
    chatState.conversationHistory = [...(session.messages || [])];
    
    // Actualizar UI del chat
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        chatState.conversationHistory.forEach(msg => {
            if (msg.type === 'bot') {
                addBotMessage(msg.content, null, false, false);
            } else {
                addUserMessage(msg.content);
            }
        });
    }
    
    saveSessions();
    updateSessionUI();
    hideSessionMenu();
}

function renameSession(sessionId, newTitle) {
    const session = sessionManager.sessions.get(sessionId);
    if (session) {
        session.title = newTitle;
        session.updatedAt = Date.now();
        saveSessions();
        updateSessionUI();
    }
}

function duplicateSession(sessionId) {
    const originalSession = sessionManager.sessions.get(sessionId);
    if (!originalSession) return;
    
    const newSessionId = `sess_${sessionManager.nextId++}`;
    const duplicatedSession = {
        id: newSessionId,
        title: `${originalSession.title} (copia)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [...originalSession.messages]
    };
    
    sessionManager.sessions.set(newSessionId, duplicatedSession);
    saveSessions();
    updateSessionUI();
}

function archiveSession(sessionId) {
    if (sessionManager.sessions.size <= 1) {
        alert('No puedes archivar la última sesión');
        return;
    }
    
    sessionManager.sessions.delete(sessionId);
    
    // Si era la sesión actual, cambiar a otra
    if (sessionManager.currentSession === sessionId) {
        const firstSession = sessionManager.sessions.keys().next().value;
        if (firstSession) {
            switchToSession(firstSession);
        } else {
            createNewSession();
        }
    }
    
    saveSessions();
    updateSessionUI();
}

function updateSessionUI() {
    const currentSessionTitle = document.getElementById('currentSessionTitle');
    const sessionList = document.getElementById('sessionList');
    
    if (currentSessionTitle && sessionManager.currentSession) {
        const currentSession = sessionManager.sessions.get(sessionManager.currentSession);
        currentSessionTitle.textContent = currentSession?.title || 'Nueva sesión';
    }
    
    if (sessionList) {
        sessionList.innerHTML = '';
        sessionManager.sessions.forEach((session, id) => {
            const item = document.createElement('div');
            item.className = `session-item ${id === sessionManager.currentSession ? 'active' : ''}`;
            item.innerHTML = `
                <div class="session-item-title">${session.title}</div>
                <div class="session-item-meta">
                    <span>${new Date(session.updatedAt).toLocaleDateString()}</span>
                    <span>${session.messages.length} mensajes</span>
                </div>
            `;
            item.addEventListener('click', () => switchToSession(id));
            sessionList.appendChild(item);
        });
    }
}

function toggleSessionMenu() {
    const sessionMenu = document.getElementById('sessionMenu');
    const sessionMenuButton = document.getElementById('sessionMenuButton');
    
    if (sessionMenu && sessionMenuButton) {
        const isOpen = sessionMenu.classList.contains('show');
        
        if (isOpen) {
            hideSessionMenu();
        } else {
            showSessionMenu();
        }
    }
}

function showSessionMenu() {
    const sessionMenu = document.getElementById('sessionMenu');
    const sessionMenuButton = document.getElementById('sessionMenuButton');
    
    if (sessionMenu && sessionMenuButton) {
        sessionMenu.classList.add('show');
        sessionMenuButton.classList.add('active');
        updateSessionUI();
    }
}

function hideSessionMenu() {
    const sessionMenu = document.getElementById('sessionMenu');
    const sessionMenuButton = document.getElementById('sessionMenuButton');
    
    if (sessionMenu && sessionMenuButton) {
        sessionMenu.classList.remove('show');
        sessionMenuButton.classList.remove('active');
    }
}

function handleSessionAction(action) {
    const currentSessionId = sessionManager.currentSession;
    
    switch (action) {
        case 'new':
            createNewSession();
            hideSessionMenu();
            break;
            
        case 'rename':
            if (currentSessionId) {
                const currentSession = sessionManager.sessions.get(currentSessionId);
                const newTitle = prompt('Nuevo título para la sesión:', currentSession?.title || '');
                if (newTitle && newTitle.trim()) {
                    renameSession(currentSessionId, newTitle.trim());
                }
            }
            break;
            
        case 'duplicate':
            if (currentSessionId) {
                duplicateSession(currentSessionId);
            }
            break;
            
        case 'archive':
            if (currentSessionId && confirm('¿Estás seguro de que quieres archivar esta sesión?')) {
                archiveSession(currentSessionId);
                hideSessionMenu();
            }
            break;
    }
}

// Inicializar sistema de sesiones al cargar


// Exportar funciones para uso externo
window.Chatbot = {
    sendMessage,
    addBotMessage,
    addUserMessage,
    getConversationHistory: () => chatState.conversationHistory,
    toggleAudio,
    getAudioStatus,
    setAudioVolume,
    playWelcomeAudio,

}; 

// Render del selector de sesiones/módulos dentro del menú
function renderSessionPicker() {
    const picker = document.getElementById('sessionPicker');
    if (!picker) return;
    const html = Object.entries(COURSE_SESSIONS).map(([num, s]) => `
        <button class=\"session-item\" data-session=\"${num}\" data-module=\"0\">\n            <span class=\"module-index\">S${num}</span>\n            <span class=\"module-title\">${s.title}</span>\n        </button>
    `).join('');
    picker.innerHTML = `<div class=\"module-list\">${html}</div>`;

    // Al seleccionar una sesión, cerrar menú y mostrar panel de módulos para esa sesión
    picker.querySelectorAll('.session-item').forEach(btn => {
        btn.addEventListener('click', () => {
            try { hideSessionMenu(); } catch(_) {}
            const ses = btn.getAttribute('data-session') || '1';
            try { showModulesStudioPanel(String(ses)); } catch(_) {}
        });
    });
}

// ===== Studio: Panel de Módulos y Contenido =====
function showModulesStudioPanel(activeSession = '1') {
    const cardsRoot = document.getElementById('studioCards');
    if (!cardsRoot) return;
    // eliminar tarjetas previas de módulos
    Array.from(cardsRoot.querySelectorAll('[data-card="modules"]')).forEach(el => el.remove());

    const card = document.createElement('div');
    card.className = 'studio-card';
    card.dataset.card = 'modules';
    card.innerHTML = `
        <div class="studio-modules">
            <div class="collapsible studio-collapsible" id="modulesSection">
                <div class="collapsible-header">
                    <h4 style="margin:0">Módulos</h4>
                    <div style="display:flex;gap:6px">
                        <button id="modulesRemove" class="collapsible-toggle" title="Quitar" aria-label="Quitar">🗑</button>
                        <button id="modulesToggle" class="collapsible-toggle" aria-expanded="false" aria-controls="modulesGrid" title="Mostrar/Ocultar">
                            <i class='bx bx-chevron-down'></i>
                        </button>
                    </div>
                </div>
                <div class="collapsible-content" id="modulesGrid">
            <div class="modules-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px">
                        <button class="studio-btn" data-module="1"><i class='bx bx-book-content'></i><span>Módulo 1</span></button>
                        <button class="studio-btn" data-module="2"><i class='bx bx-book-content'></i><span>Módulo 2</span></button>
                        <button class="studio-btn" data-module="3"><i class='bx bx-book-content'></i><span>Módulo 3</span></button>
                        <button class="studio-btn" data-module="4"><i class='bx bx-book-content'></i><span>Módulo 4</span></button>
            </div>
                </div>
            </div>
            <div class="module-view" id="moduleView" style="border-top:1px solid rgba(68,229,255,.18);padding-top:10px;color:var(--text-muted)">Selecciona un módulo para ver el contenido</div>
        </div>
    `;
    cardsRoot.prepend(card);

    // Acciones
    const modulesSection = card.querySelector('#modulesSection');
    const modulesToggle = card.querySelector('#modulesToggle');
    if (modulesSection && modulesToggle) {
        modulesToggle.addEventListener('click', () => {
            const isOpen = modulesSection.classList.toggle('open');
            modulesToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }
    // Quitar card completa de módulos
    card.querySelector('#modulesRemove')?.addEventListener('click', () => card.remove());
    // Botón de notas ya no está en la grilla; se agrega como footer global
    card.querySelectorAll('.studio-btn[data-module]').forEach(b => b.addEventListener('click', () => {
        const mod = b.getAttribute('data-module');
        // marcar activo
        card.querySelectorAll('.studio-btn[data-module]').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        renderModule(mod);
    }));

    function renderModule(moduleId) {
        const view = card.querySelector('#moduleView');
        if (!view) return;
        // Solo módulo 1 para sesión 1
        if (moduleId === '1' && String(activeSession) === '1') {
            const ACTIVIDAD_COLABORATIVA_VIDEO_ID = (window.APP?.videos?.actividadColaborativaId) || '';
        view.innerHTML = `
                <div class="collapsible" id="mod1Content">
                    <div class="collapsible-header" style="margin-bottom:8px">
                        <h5 style="margin:0">Actividad Colaborativa #1 — Investigación Profunda</h5>
                        <div style="display:flex;gap:6px">
                            <button class="collapsible-toggle" id="mod1Remove" title="Quitar" aria-label="Quitar">🗑</button>
                            <button class="collapsible-toggle" id="mod1Toggle" aria-expanded="true" aria-controls="mod1Body"><i class='bx bx-chevron-down'></i></button>
            </div>
            </div>
                    <div class="collapsible-content" id="mod1Body" style="display:block">
                        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px">
                            <button class="keyboard-button" id="btnVideo">Ver video</button>
                        </div>
                        <div class="collapsible" id="step1">
                            <div class="collapsible-header" style="margin-bottom:6px">
                                <h5 style="margin:0">Paso 1: El Prompt de Investigación</h5>
                                <button class="collapsible-toggle" data-toggle="#step1Body" aria-expanded="false"><i class='bx bx-chevron-down'></i></button>
                            </div>
                            <div class="collapsible-content" id="step1Body" style="display:none">
                                <ol style="margin:0 0 8px 18px">
                    <li>Abre <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer">Gemini</a> y, en la caja de chat, copia y pega el siguiente prompt en su totalidad.</li>
                                    <li>Activa la herramienta <strong>deep research</strong> y ejecuta.</li>
                </ol>
                                <p><strong>Prompt detallado</strong> <button class="micro-btn" id="copyPrompt">Copiar prompt</button></p>
                            </div>
                        </div>

                        <div class="collapsible" id="step2">
                            <div class="collapsible-header" style="margin-bottom:6px">
                                <h5 style="margin:0">Paso 2: Explorando tu Proyecto de Investigación</h5>
                                <button class="collapsible-toggle" data-toggle="#step2Body" aria-expanded="false"><i class='bx bx-chevron-down'></i></button>
                            </div>
                            <div class="collapsible-content" id="step2Body" style="display:none">
                                <ol style="margin:0 0 8px 18px">
                    <li>Revisa la respuesta estructurada que creó Gemini (con fuentes numeradas).</li>
                                    <li>Familiarízate con la interfaz y la estructura de tu proyecto base.</li>
                </ol>
                            </div>
                        </div>

                <div class="collapsible" id="step3">
                            <div class="collapsible-header" style="margin-bottom:6px">
                                <h5 style="margin:0">Paso 3: Creación de Formatos Interactivos</h5>
                                <button class="collapsible-toggle" data-toggle="#step3Body" aria-expanded="false"><i class='bx bx-chevron-down'></i></button>
                            </div>
                            <div class="collapsible-content" id="step3Body" style="display:none">
                                <p style="color:var(--text-muted);margin:0 0 6px">Asegúrate de volver siempre a la vista principal antes de cada creación.</p>
                                <ol type="A" style="margin:0 0 8px 18px">
                                    <li><strong>Reporte Interactivo (Canvas)</strong>
                        <ol>
                            <li>Haz clic en Crear.</li>
                            <li>Selecciona Página Web o Reporte en Canvas.</li>
                                            <li>Explora la página y ciérrala para volver al proyecto.</li>
                        </ol>
                    </li>
                                    <li><strong>Infografía Visual</strong>
                        <ol>
                            <li>Vuelve a la vista de tu investigación.</li>
                            <li>Haz clic en Crear.</li>
                                            <li>Selecciona Infografía y descarga la imagen.</li>
                        </ol>
                    </li>
                                    <li><strong>Cuestionario</strong>
                        <ol>
                            <li>Regresa a la pantalla de investigación.</li>
                            <li>Haz clic en Crear.</li>
                                            <li>Selecciona Cuestionario/Quiz y revisa las preguntas.</li>
                        </ol>
                    </li>
                                    <li><strong>Resumen de audio</strong>
                                        <ol>
                                            <li>Elige la voz neuronal.</li>
                                            <li>Descarga o reproduce el .mp3.</li>
                        </ol>
                    </li>
                </ol>
                                <div style="margin-top:10px;display:flex;justify-content:flex-start">
                                    <button class="keyboard-button" id="openQuizBottom">Abrir cuestionario</button>
                </div>
            </div>
                        </div>
                    </div>
                </div>`;

            const t = view.querySelector('#mod1Toggle');
            const sec = view.querySelector('#mod1Content');
            if (t && sec) {
                t.addEventListener('click', () => {
                    const isOpen = sec.classList.toggle('open');
                    // Forzar mostrar/ocultar manualmente el contenido para consistencia
                    const body = view.querySelector('#mod1Body');
                    if (body) body.style.display = isOpen ? 'block' : 'none';
                    t.setAttribute('aria-expanded', String(isOpen));
                });
                // Open initially
                sec.classList.add('open');
            }
            // Quitar actividad (limpiar módulo)
            view.querySelector('#mod1Remove')?.addEventListener('click', () => {
                view.innerHTML = `<div style="color:var(--text-muted)">Selecciona un módulo para ver el contenido</div>`;
            });
            // Toggles de secciones
            view.querySelectorAll('.collapsible-toggle[data-toggle]')?.forEach(btn => {
                const sel = btn.getAttribute('data-toggle');
                const target = sel ? view.querySelector(sel) : null;
                btn.addEventListener('click', () => {
                    if (!target) return;
                    const isOpen = target.style.display === 'block';
                    target.style.display = isOpen ? 'none' : 'block';
                    btn.setAttribute('aria-expanded', String(!isOpen));
                    btn.closest('.collapsible')?.classList.toggle('open', !isOpen);
                });
            });

            // Acciones: abrir en panel izquierdo
            view.querySelector('#btnVideo')?.addEventListener('click', () => {
                const url = 'https://www.youtube.com/embed/DPyJmxgUGk8';
                openLeftEmbed({ title: 'Actividad colaborativa', src: url, groupId: 'leftVideoEmbed' });
            });
            view.querySelector('#copyPrompt')?.addEventListener('click', async () => {
                const text = `Actúa como un analista experto en inteligencia artificial generativa. Realiza una investigación exhaustiva con el título "Gen AI El Despertar de una Nueva Era Humana del miedo al entusiasmo" para identificar y analizar los siguientes puntos clave:  Evolución de la percepción: Describe el cambio en la percepción de la IA generativa desde su aparición masiva, incluyendo la reacción inicial y la mentalidad actual en la alta dirección.  Impacto transformador y ejemplos de uso actuales:  Identifica cómo la IA generativa está redefiniendo la productividad humana y transformando modelos de negocio en diversas industrias.  Proporciona ejemplos específicos de empresas y sectores que ya están utilizando la IA generativa, detallando las aplicaciones y los beneficios obtenidos.  Avances tecnológicos y ecosistema:  Detalla las nuevas generaciones de modelos de IA generativa (Finales 2024-2025) y sus capacidades mejoradas.  Describe el ecosistema de proveedores líderes y sus herramientas para entornos corporativos.  Explica las estrategias de adopción de la IA generativa por parte de las empresas, incluyendo la elección entre modelos públicos y la construcción de IP propia.  Implicaciones humanas y sociales: Analiza cómo la IA generativa está democratizando el conocimiento, amplificando la creatividad y reimaginando el trabajo, destacando el valor humano en este nuevo escenario.  Casos de uso en finanzas y banca:  Desglosa los casos de uso recientes de la IA generativa en el sector financiero y bancario, incluyendo asistentes virtuales, optimización de riesgos y cumplimiento, y personalización/eficiencia.  Menciona las proyecciones de McKinsey para el futuro del trabajo en relación con la IA generativa.  Desafíos y consideraciones estratégicas para líderes: Extrae las recomendaciones clave para los CEOs y C - levels en la adopción e integración de la IA generativa, incluyendo la necesidad de ética, visión, valentía e inversión en talento.  Asegúrate de citar cada dato o afirmación con el número de fuente correspondiente. Organiza tu respuesta de manera clara y concisa, utilizando un formato de investigación formal.`;
                try { await navigator.clipboard.writeText(text); } catch(_) {}
            });
            // Abrir cuestionario desde el Paso 3 (botón inferior)
            const openQuiz = () => {
                openLeftEmbed({ title: 'Cuestionario', src: 'https://forms.gle/GxwqVJhHW7ahj4NF7', groupId: 'leftQuizEmbed' });
            };
            view.querySelector('#openQuizBottom')?.addEventListener('click', openQuiz);
            return;
        }
        // Para sesiones distintas a 1 no desplegar módulos
        const modulesSectionEl = card.querySelector('#modulesSection');
        modulesSectionEl?.classList.remove('open');
        view.textContent = 'Selecciona un módulo para ver el contenido';
    }
    // Asegurar footer global de notas
    try { renderStudioFooter(); } catch(_) {}
}

// Footer inferior del panel derecho con botón "+ Nota"
function renderStudioFooter() {
    const cards = document.getElementById('studioCards');
    if (!cards) return;
    if (document.getElementById('studioFooter')) return; // evitar duplicado
    const footer = document.createElement('div');
    footer.id = 'studioFooter';
    footer.className = 'studio-footer';
    footer.innerHTML = `<button id="addNoteFab" class="add-note-fab">+ Nota</button>`;
    cards.appendChild(footer);
    footer.querySelector('#addNoteFab')?.addEventListener('click', () => {
        try {
            // Verificar si hay otros módulos desplegados para posicionar las notas debajo
            const existingCards = document.querySelectorAll('.studio-card');
            const notesCard = document.querySelector('.studio-card[data-card="notes"]');
            
            // Si no existe la tarjeta de notas, crearla
            if (!notesCard) {
                window.UI?.openNotes();
                
                // Si hay otras tarjetas, mover la de notas al final (debajo de las demás)
                const newNotesCard = document.querySelector('.studio-card[data-card="notes"]');
                if (newNotesCard && existingCards.length > 0) {
                    const cardsContainer = document.getElementById('studioCards');
                    cardsContainer.appendChild(newNotesCard);
                }
            } else {
                // Si ya existe, crear una nueva nota directamente
            const note = (typeof notesStore !== 'undefined') ? notesStore.create({}) : null;
            if (note) {
                openNoteEditor(note);
                }
            }
        } catch(_) {
            window.UI?.openNotes?.();
        }
    });
}

// Abrir un iframe embebido en el panel izquierdo (video/cuestionario)
function openLeftEmbed({ title, src, groupId = 'leftDynamicGroup' }) {
    const toolList = document.querySelector('.sidebar-left .tool-list');
    if (!toolList) return;
    let group = document.getElementById(groupId);
    if (!group) {
        group = document.createElement('div');
        group.className = 'tool-group collapsible';
        group.id = groupId;
        group.innerHTML = `
            <div class="collapsible-header">
                <h4 style="margin:0" id="leftDynamicTitle"></h4>
                <div style="display:flex;gap:6px">
                    <button class="collapsible-toggle" data-action="remove" title="Quitar" aria-label="Quitar">🗑</button>
                    <button class="collapsible-toggle" data-action="toggle" aria-expanded="true" aria-controls="${groupId}Content" title="Mostrar/Ocultar"><i class='bx bx-chevron-down'></i></button>
                </div>
            </div>
            <div class="collapsible-content" id="${groupId}Content" style="display:block"></div>
        `;
        toolList.prepend(group);
        const toggle = group.querySelector('[data-action="toggle"]');
        toggle?.addEventListener('click', () => {
            const isOpen = group.classList.toggle('open');
            const body = group.querySelector(`#${groupId}Content`);
            if (body) body.style.display = isOpen ? 'block' : 'none';
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
        group.querySelector('[data-action="remove"]')?.addEventListener('click', () => group.remove());
    }
    const titleEl = group.querySelector('#leftDynamicTitle');
    const mount = group.querySelector(`#${groupId}Content`);
    if (titleEl) titleEl.textContent = title;
    if (mount) {
        mount.innerHTML = `<div class="left-video-player active" style="display:block"><iframe src="${src}" allowfullscreen title="${title}"></iframe></div>`;
    }
    // Asegurar abierto
    group.classList.add('open');
}

// Barra de redimensionado del panel izquierdo
function setupResizableLeft() {
    const resizer = document.getElementById('leftResizer');
    if (!resizer) return;
    let startX = 0;
    let startWidth = 0;
    const onMove = (e) => {
        const delta = (e.clientX || (e.touches && e.touches[0].clientX) || 0) - startX;
        // Evitar solaparse con el panel derecho: ancho total minus right-col mín.
        const rightCol = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--right-col') || '360', 10);
        const maxByLayout = Math.max(220, Math.min(520, startWidth + delta));
        const maxAllowed = Math.min(maxByLayout, window.innerWidth - rightCol - 400); // deja espacio mínimo para el chat
        const newWidth = Math.max(220, maxAllowed);
        document.documentElement.style.setProperty('--left-col', newWidth + 'px');
        try { localStorage.setItem('ui_left_col', String(newWidth)); } catch(_) {}
    };
    const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
    };
    const onDown = (e) => {
        e.preventDefault();
        startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const leftCol = getComputedStyle(document.documentElement).getPropertyValue('--left-col').trim();
        startWidth = parseInt(leftCol || '300', 10);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
    };
    resizer.addEventListener('mousedown', onDown);
    resizer.addEventListener('touchstart', onDown, { passive: false });

    // Restaurar último ancho
    try {
        const saved = parseInt(localStorage.getItem('ui_left_col') || '0', 10);
        if (saved) document.documentElement.style.setProperty('--left-col', saved + 'px');
    } catch(_) {}
}

// Barra de redimensionado del panel derecho
function setupResizableRight() {
    const resizer = document.getElementById('rightResizer');
    if (!resizer) return;
    let startX = 0;
    let startWidth = 0;
    const onMove = (e) => {
        const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        // Como el resizer está en el borde interno, mover a la izquierda (x menor) debe AUMENTAR el ancho
        const delta = startX - x;
        const newWidth = Math.max(260, Math.min(520, startWidth + delta));
        document.documentElement.style.setProperty('--right-col', newWidth + 'px');
        try { localStorage.setItem('ui_right_col', String(newWidth)); } catch(_) {}
    };
    const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
    };
    const onDown = (e) => {
        e.preventDefault();
        startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const rightCol = getComputedStyle(document.documentElement).getPropertyValue('--right-col').trim();
        startWidth = parseInt(rightCol || '360', 10);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
    };
    resizer.addEventListener('mousedown', onDown);
    resizer.addEventListener('touchstart', onDown, { passive: false });

    // Restaurar último ancho
    try {
        const saved = parseInt(localStorage.getItem('ui_right_col') || '0', 10);
        if (saved) document.documentElement.style.setProperty('--right-col', saved + 'px');
    } catch(_) {}
}

// ===== Livestream en panel izquierdo =====
function setupLivestreamToggle() {
    try {
        // Livestream: Meet incrustado (si el navegador lo permite)
        const lsec = document.getElementById('livestreamSection');
        const ltoggle = document.getElementById('livestreamToggle');
        if (lsec && ltoggle) {
            ltoggle.addEventListener('click', () => {
                const isOpen = lsec.classList.toggle('open');
                ltoggle.setAttribute('aria-expanded', String(isOpen));
                if (isOpen) {
                    const liveMount = document.getElementById('leftLivestreamPlayer');
                    const notice = document.getElementById('livestreamNotice');
                    if (notice) notice.style.display = 'none';
                    if (notice) notice.style.display = 'none';
                    if (liveMount) {
                        // Dejamos el placeholder visual. Si hay Zoom configurado, lo embebemos.
                        // Dejamos el placeholder visual. Si hay Zoom configurado, lo embebemos.
                        const meetingId = (window.ZOOM_MEETING_ID || '').replaceAll('-', '');
                        const pwd = window.ZOOM_MEETING_PWD || '';
                        if (!meetingId) return; // sin player, solo placeholder bonito
                        liveMount.innerHTML = '';
                        if (!meetingId) return; // sin player, solo placeholder bonito
                        liveMount.innerHTML = '';
                        const zoomUrl = `https://zoom.us/wc/${meetingId}/join?pwd=${encodeURIComponent(pwd)}`;
                        const iframe = document.createElement('iframe');
                        iframe.src = zoomUrl;
                        iframe.allow = 'camera; microphone; display-capture; clipboard-write; autoplay; fullscreen;';
                        iframe.referrerPolicy = 'no-referrer';
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.style.border = '0';
                        // Intento cargar; si falla por X-Frame-Options, aviso
                        const timer = setTimeout(() => {
                            if (notice) {
                                notice.style.display = 'block';
                                notice.textContent = 'No se pudo cargar el cliente Web de Zoom embebido. Haz clic aquí para abrirlo en esta misma pestaña.';
                                notice.onclick = () => { window.location.href = zoomUrl; };
                            }
                        }, 2000);
                        iframe.onload = () => { clearTimeout(timer); if (notice) notice.style.display = 'none'; };
                        liveMount.appendChild(iframe);
                    }
                }
            });
        }
    } catch (_) {}
}

function setupAvatarLightbox() {
    const img = document.getElementById('botAvatarImg');
    const lightbox = document.getElementById('avatarLightbox');
    const lbImg = document.getElementById('avatarLightboxImg');
    const lbClose = document.getElementById('avatarLightboxClose');
    if (!img || !lightbox || !lbImg) return;
    const open = () => { lightbox.classList.add('show'); };
    const close = () => { lightbox.classList.remove('show'); };
    img.addEventListener('click', open);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target === lbClose) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// ===== Chat del Livestream en Tiempo Real =====
let livestreamSocket = null;
let livestreamChatState = {
    isConnected: false,
    username: '',
    messageType: 'lia', // Tipo por defecto: 'lia' o 'users'
    messages: [],
    connectedUsers: [],
    pendingMessages: []
};

function initializeLivestreamChat() {
    console.log('[LIVESTREAM] Inicializando chat del livestream...');
    
    // Verificar que Socket.IO está disponible
    if (typeof io === 'undefined') {
        console.error('[LIVESTREAM] Socket.IO no está disponible');
        return;
    }

    // Configurar elementos del DOM con guardas null-safe
    const messageInput = document.getElementById('livestreamMessageInput');
    const sendBtn = document.getElementById('livestreamSendBtn');
    const messagesContainer = document.getElementById('livestreamChatMessages');
    const connectionStatus = document.getElementById('livestreamConnectionStatus');
    const usersCount = document.getElementById('livestreamUsersCount');

    if (!messageInput || !sendBtn || !messagesContainer) {
        console.error('[LIVESTREAM] Elementos del chat del livestream no encontrados');
        return;
    }

    // Inicializar conexión Socket.IO
    // Si el HTML se sirve fuera del servidor Node (p.ej. Netlify estático),
    // define window.SOCKET_IO_ORIGIN = 'https://TU_DOMINIO_NODE' para conectar.
    const ioOrigin = (typeof window !== 'undefined' && window.SOCKET_IO_ORIGIN) ? window.SOCKET_IO_ORIGIN : '';
    livestreamSocket = io(ioOrigin || undefined, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        withCredentials: false
    });

    // Determinar nombre de usuario desde la sesión o fallback aleatorio
    try {
        let username = '';
        
        // 1. Intentar obtener desde userData (sistema de auth principal)
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                username = user.username || user.display_name || user.full_name || user.email || '';
            }
        } catch (_) {}
        
        // 2. Fallback a currentUser
        if (!username) {
            try {
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                    const user = JSON.parse(currentUser);
                    username = user.username || user.display_name || user.full_name || user.email || '';
                }
            } catch (_) {}
        }
        
        // 3. Fallback a chatState y otras fuentes
        if (!username) {
            username = (chatState && chatState.userName ? String(chatState.userName) : '')
                || (sessionStorage.getItem('loggedUser') || '')
                || (localStorage.getItem('rememberedUser') || '');
        }
        
        const clean = String(username).trim();
        livestreamChatState.username = clean && clean.length >= 2
            ? clean
            : `Usuario_${Math.floor(Math.random() * 1000)}`;
            
        console.log('[LIVESTREAM] Username configurado:', livestreamChatState.username);
    } catch (_) {
    livestreamChatState.username = `Usuario_${Math.floor(Math.random() * 1000)}`;
        console.log('[LIVESTREAM] Username fallback:', livestreamChatState.username);
    }

    // Eventos de conexión
    livestreamSocket.on('connect', () => {
        console.log('[LIVESTREAM] Conectado al chat del livestream');
        livestreamChatState.isConnected = true;
        updateConnectionStatus('Conectado', true);
        
        // Unirse al chat del livestream
        livestreamSocket.emit('join-livestream-chat', {
            username: livestreamChatState.username
        });

        // Habilitar interfaz con guardas null-safe
        if (messageInput) {
            updateInputPlaceholder();
            messageInput.disabled = false;
        }
        if (sendBtn) {
        sendBtn.disabled = false;
        }
        if (messageInput && document.activeElement !== messageInput) {
            messageInput.focus();
        }

        // Actualizar contador de usuarios con guarda null-safe
        if (usersCount) {
            usersCount.textContent = `${livestreamChatState.connectedUsers.length} usuarios`;
        }

        // Reintentar envío de pendientes
        if (livestreamChatState.pendingMessages.length > 0) {
            livestreamChatState.pendingMessages.forEach(p => {
                if (p.messageType === 'lia') {
                    sendMessageToLIA(p.message, p.id);
                } else {
                    livestreamSocket.emit('livestream-message', { 
                        message: p.message, 
                        clientMessageId: p.id,
                        messageType: p.messageType 
                    });
                }
            });
        }
    });

    livestreamSocket.on('disconnect', () => {
        console.log('[LIVESTREAM] Desconectado del chat del livestream');
        livestreamChatState.isConnected = false;
        updateConnectionStatus('Desconectado', false);
        
        // UX de reconexión con guardas null-safe
        if (messageInput) {
        messageInput.placeholder = 'Reconectando…';
            messageInput.disabled = true;
        }
        if (sendBtn) {
            sendBtn.disabled = true;
        }
    });

    // Eventos del chat
    livestreamSocket.on('new-livestream-message', (messageData) => {
        // Reconciliar mensajes pendientes por clientMessageId
        if (messageData.clientMessageId) {
            const existing = document.querySelector(`.livestream-message[data-client-message-id="${messageData.clientMessageId}"]`);
            if (existing) {
                const time = new Date(messageData.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const isOwn = messageData.username === livestreamChatState.username;
                const replacement = document.createElement('div');
                replacement.className = `livestream-message ${messageData.type}`;
                replacement.dataset.clientMessageId = messageData.clientMessageId;
                replacement.innerHTML = `
                    <div class="message-content user ${isOwn ? 'own' : ''}">
                        <div class="message-header">
                            <span class="username">${messageData.username}</span>
                            <span class="timestamp">${time}</span>
                        </div>
                        <div class="message-text">${messageData.message}</div>
                    </div>
                `;
                existing.replaceWith(replacement);
                livestreamChatState.pendingMessages = livestreamChatState.pendingMessages.filter(p => p.id !== messageData.clientMessageId);
                return;
            }
        }
        addLivestreamMessage(messageData);
    });

    livestreamSocket.on('user-joined', (data) => {
        addLivestreamMessage(data);
    });

    livestreamSocket.on('user-left', (data) => {
        addLivestreamMessage(data);
    });

    livestreamSocket.on('users-list', (users) => {
        livestreamChatState.connectedUsers = users;
        updateUsersCount(users.length);
        try {
            if (usersCount) {
                usersCount.title = users && users.length ? users.join(', ') : 'Sin usuarios conectados';
            }
        } catch (_) {}
    });

    // Inicializar selector de tipo de mensaje
    initializeMessageTypeSelector();
    
    // Eventos de la interfaz con guardas null-safe
    if (sendBtn) {
        sendBtn.addEventListener('click', sendLivestreamMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendLivestreamMessage();
            }
        });
    }

    function initializeMessageTypeSelector() {
        const typeSelector = document.getElementById('messageTypeSelector');
        if (!typeSelector) return;

        const typeBtns = typeSelector.querySelectorAll('.type-btn');
        typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover clase active de todos los botones
                typeBtns.forEach(b => b.classList.remove('active'));
                // Agregar clase active al botón clickeado
                btn.classList.add('active');
                
                // Actualizar el estado del tipo de mensaje
                livestreamChatState.messageType = btn.dataset.type;
                
                // Actualizar placeholder del input
                updateInputPlaceholder();
                
                console.log('[LIVESTREAM] Tipo de mensaje cambiado a:', livestreamChatState.messageType);
            });
        });
        
        // Establecer tipo por defecto
        livestreamChatState.messageType = 'lia';
        updateInputPlaceholder();
    }

    function updateInputPlaceholder() {
        if (!messageInput) return;
        
        const placeholders = {
            'lia': 'Pregunta algo a LIA...',
            'users': 'Escribe un mensaje para los usuarios...'
        };
        
        messageInput.placeholder = placeholders[livestreamChatState.messageType] || 'Escribe un mensaje...';
    }

    function sendLivestreamMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        const messageType = livestreamChatState.messageType || 'lia';
        const clientMessageId = `c_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

        // Render inmediato
        addLivestreamMessage({
            username: livestreamChatState.username,
            message,
            timestamp: new Date().toISOString(),
            type: 'user',
            messageType: messageType,
            clientMessageId,
            pending: !livestreamChatState.isConnected
        });

        if (!livestreamChatState.isConnected) {
            livestreamChatState.pendingMessages.push({ 
                id: clientMessageId, 
                message, 
                messageType 
            });
        } else {
            // Enviar mensaje según el tipo
            if (messageType === 'lia') {
                // Enviar a LIA (chatbot)
                sendMessageToLIA(message, clientMessageId);
            } else {
                // Enviar a usuarios del chat
                livestreamSocket.emit('livestream-message', { 
                    message, 
                    clientMessageId,
                    messageType 
                });
            }
        }

        messageInput.value = '';
    }

    async function sendMessageToLIA(message, clientMessageId) {
        try {
            console.log('[LIVESTREAM] Enviando mensaje a LIA:', message);
            
            // Mostrar indicador de que LIA está pensando
            addLivestreamMessage({
                username: 'LIA',
                message: 'Pensando...',
                timestamp: new Date().toISOString(),
                type: 'lia-thinking',
                clientMessageId: `lia_${clientMessageId}`
            });

            // Obtener respuesta de LIA usando la función existente
            const response = await getGeneralAnswer(message);
            
            // Remover mensaje de "pensando"
            const thinkingMessage = document.querySelector(`[data-client-message-id="lia_${clientMessageId}"]`);
            if (thinkingMessage) {
                thinkingMessage.remove();
            }

            // Mostrar respuesta de LIA
            addLivestreamMessage({
                username: 'LIA',
                message: response,
                timestamp: new Date().toISOString(),
                type: 'lia-response',
                clientMessageId: `lia_response_${clientMessageId}`
            });

        } catch (error) {
            console.error('[LIVESTREAM] Error al obtener respuesta de LIA:', error);
            
            // Remover mensaje de "pensando"
            const thinkingMessage = document.querySelector(`[data-client-message-id="lia_${clientMessageId}"]`);
            if (thinkingMessage) {
                thinkingMessage.remove();
            }

            // Mostrar mensaje de error
            addLivestreamMessage({
                username: 'LIA',
                message: 'Lo siento, no pude procesar tu pregunta en este momento. ¿Podrías intentarlo de nuevo?',
                timestamp: new Date().toISOString(),
                type: 'lia-error',
                clientMessageId: `lia_error_${clientMessageId}`
            });
        }
    }

    function addLivestreamMessage(messageData) {
        const messagesContainer = document.getElementById('livestreamChatMessages');
        if (!messagesContainer) return;

        // Remover mensaje de bienvenida si existe
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `livestream-message ${messageData.type}`;
        if (messageData.clientMessageId) {
            messageElement.dataset.clientMessageId = messageData.clientMessageId;
        }
        
        const time = new Date(messageData.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Determinar el tipo de mensaje y aplicar estilos correspondientes
        let messageTypeClass = '';
        let messageTypeIcon = '';
        
        if (messageData.type === 'system') {
            messageTypeClass = 'system';
            messageTypeIcon = 'bx-info-circle';
        } else if (messageData.type === 'lia-thinking') {
            messageTypeClass = 'lia-thinking';
            messageTypeIcon = 'bx-loader-alt';
        } else if (messageData.type === 'lia-response') {
            messageTypeClass = 'lia-response';
            messageTypeIcon = 'bx-brain';
        } else if (messageData.type === 'lia-error') {
            messageTypeClass = 'lia-error';
            messageTypeIcon = 'bx-error-circle';
        } else if (messageData.type === 'user') {
            // Verificar si es mensaje para LIA o para usuarios
            if (messageData.messageType === 'lia') {
                messageTypeClass = 'user-to-lia';
                messageTypeIcon = 'bx-brain';
            } else {
                messageTypeClass = 'user-to-users';
                messageTypeIcon = 'bx-group';
            }
        }

        const isOwnMessage = messageData.username === livestreamChatState.username;

        if (messageData.type === 'system') {
            messageElement.innerHTML = `
                <div class="message-content system">
                    <i class='bx ${messageTypeIcon}'></i>
                    <span>${messageData.message}</span>
                    <span class="timestamp">${time}</span>
                </div>
            `;
        } else if (messageData.type === 'lia-thinking') {
            messageElement.innerHTML = `
                <div class="message-content lia-thinking">
                    <div class="message-header">
                        <span class="username">${messageData.username}</span>
                        <span class="timestamp">${time}</span>
                    </div>
                    <div class="message-text">
                        <i class='bx bx-loader-alt'></i>
                        <span>${messageData.message}</span>
                    </div>
                </div>
            `;
        } else if (messageData.type === 'lia-response') {
            messageElement.innerHTML = `
                <div class="message-content lia-response">
                    <div class="message-header">
                        <span class="username">${messageData.username}</span>
                        <span class="timestamp">${time}</span>
                        <span class="message-type-badge">LIA</span>
                    </div>
                    <div class="message-text">${messageData.message}</div>
                </div>
            `;
        } else if (messageData.type === 'lia-error') {
            messageElement.innerHTML = `
                <div class="message-content lia-error">
                    <div class="message-header">
                        <span class="username">${messageData.username}</span>
                        <span class="timestamp">${time}</span>
                        <span class="message-type-badge error">Error</span>
                    </div>
                    <div class="message-text">${messageData.message}</div>
                </div>
            `;
        } else {
            // Mensajes de usuario
            const typeBadge = messageData.messageType === 'lia' ? 
                '<span class="message-type-badge lia">LIA</span>' : 
                '<span class="message-type-badge users">Usuarios</span>';
            
            messageElement.innerHTML = `
                <div class="message-content user ${isOwnMessage ? 'own' : ''} ${messageData.pending ? 'pending' : ''} ${messageTypeClass}">
                    <div class="message-header">
                        <span class="username">${messageData.username}</span>
                        <span class="timestamp">${time}</span>
                        ${typeBadge}
                    </div>
                    <div class="message-text">${messageData.message}</div>
                    ${messageData.pending ? '<div class="message-status">Pendiente…</div>' : ''}
                </div>
            `;
        }

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Mantener solo los últimos 50 mensajes
        const messages = messagesContainer.querySelectorAll('.livestream-message');
        if (messages.length > 50) {
            messages[0].remove();
        }
    }

    function updateConnectionStatus(status, isConnected) {
        const statusIndicator = connectionStatus.querySelector('.status-indicator');
        const statusText = connectionStatus.querySelector('.status-text');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = `status-indicator ${isConnected ? 'online' : 'offline'}`;
            statusText.textContent = status;
        }
    }

    function updateUsersCount(count) {
        if (usersCount) {
            usersCount.textContent = `${count} usuario${count !== 1 ? 's' : ''}`;
        }
    }
}

// ===== SISTEMA DE ACTUALIZACIÓN DE AVATARES EN CHAT =====

// Función para actualizar todos los avatares de usuario en el chat cuando cambie el perfil
function refreshUserAvatarsInChat() {
    console.log('🔄 Actualizando avatares de usuario en el chat...');
    const userAvatars = document.querySelectorAll('.msg-avatar.user .avatar-circle img');
    const newProfilePicture = getCurrentUserProfilePicture();
    
    userAvatars.forEach(img => {
        img.src = newProfilePicture;
    });
    
    console.log(`✅ Actualizados ${userAvatars.length} avatares de usuario en el chat`);
}

// Escuchar cambios en localStorage para actualizar avatares automáticamente
window.addEventListener('storage', function(e) {
    if (e.key === 'currentUser') {
        console.log('👤 Datos de usuario actualizados, refrescando avatares...');
        setTimeout(refreshUserAvatarsInChat, 500); // Pequeño delay para asegurar que los datos estén actualizados
    }
});

// También escuchar cambios internos en la misma pestaña
let lastUserData = localStorage.getItem('currentUser');
setInterval(function() {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData !== lastUserData) {
        console.log('👤 Cambio en datos de usuario detectado, refrescando avatares...');
        refreshUserAvatarsInChat();
        lastUserData = currentUserData;
    }
}, 2000); // Verificar cada 2 segundos

// Exportar funciones para uso global
window.refreshUserAvatarsInChat = refreshUserAvatarsInChat;
window.getCurrentUserProfilePicture = getCurrentUserProfilePicture;

// Inicializar chat del livestream cuando se carga la página

// ===== SISTEMA DE GRABACIÓN =====

// Estado de grabación
let recordingState = {
    isRecording: false,
    isPaused: false,
    startTime: null,
    pauseTime: null,
    totalPausedTime: 0,
    timer: null,
    recordingClient: null,
    isHost: false // Se determinará dinámicamente
};

// Elementos del DOM para live stream y grabación
const liveStreamToggleBtn = document.getElementById('liveStreamMainToggleBtn');
const liveStreamIcon = document.getElementById('liveStreamIcon');
const recordingControls = document.getElementById('recordingControls');
const recordingStartBtn = document.getElementById('recordingStartBtn');
const recordingPauseBtn = document.getElementById('recordingPauseBtn');
const recordingResumeBtn = document.getElementById('recordingResumeBtn');
const recordingStopBtn = document.getElementById('recordingStopBtn');
const recordingStatusBanner = document.getElementById('recordingStatusBanner');
const recordingStatusText = document.getElementById('recordingStatusText');
const recordingTimer = document.getElementById('recordingTimer');
const recordingDot = document.getElementById('recordingDot');

// Estado del live stream
let liveStreamState = {
    isConnected: false
};

// Inicializar controles de live stream y grabación
function initializeStreamAndRecordingControls() {
    console.log('🎥 Inicializando controles de live stream y grabación...');
    
    // Inicializar botón de live stream fusionado
    if (liveStreamToggleBtn) {
        liveStreamToggleBtn.addEventListener('click', toggleLiveStream);
        console.log('✅ Botón de live stream fusionado inicializado');
    }
    
    // Verificar si el usuario es host (esto se puede determinar por el rol o permisos)
    recordingState.isHost = checkIfUserIsHost();
    
    if (recordingState.isHost) {
        console.log('✅ Usuario es host, mostrando controles de grabación');
        recordingControls.style.display = 'flex';
        
        // Agregar event listeners para grabación
        recordingStartBtn.addEventListener('click', startRecording);
        recordingPauseBtn.addEventListener('click', pauseRecording);
        recordingResumeBtn.addEventListener('click', resumeRecording);
        recordingStopBtn.addEventListener('click', stopRecording);
        
        // Verificar si ya hay una grabación en curso
        checkExistingRecording();
    } else {
        console.log('❌ Usuario no es host, ocultando controles de grabación');
        recordingControls.style.display = 'none';
    }
}

// Función para alternar el estado del live stream
async function toggleLiveStream() {
    try {
        if (liveStreamState.isConnected) {
            // Desconectar stream
            await disconnectLiveStream();
        } else {
            // Conectar stream
            await connectLiveStream();
        }
    } catch (error) {
        console.error('❌ Error al alternar live stream:', error);
    }
}

// Conectar live stream
async function connectLiveStream() {
    try {
        console.log('📡 Conectando live stream...');
        
        // Aquí iría la lógica real de conexión
        // Por ahora simulamos la conexión
        
        liveStreamState.isConnected = true;
        updateLiveStreamUI();
        
        console.log('✅ Live stream conectado');
        
    } catch (error) {
        console.error('❌ Error al conectar live stream:', error);
    }
}

// Desconectar live stream
async function disconnectLiveStream() {
    try {
        console.log('📡 Desconectando live stream...');
        
        // Aquí iría la lógica real de desconexión
        // Por ahora simulamos la desconexión
        
        liveStreamState.isConnected = false;
        updateLiveStreamUI();
        
        console.log('✅ Live stream desconectado');
        
    } catch (error) {
        console.error('❌ Error al desconectar live stream:', error);
    }
}

// Actualizar UI del live stream
function updateLiveStreamUI() {
    if (liveStreamState.isConnected) {
        // Estado conectado - mostrar icono de stop
        liveStreamIcon.className = 'bx bx-stop-circle';
        liveStreamToggleBtn.className = 'live-stream-main-control-btn connected';
        liveStreamToggleBtn.title = 'Detener Stream';
    } else {
        // Estado desconectado - mostrar icono de broadcast
        liveStreamIcon.className = 'bx bx-broadcast';
        liveStreamToggleBtn.className = 'live-stream-main-control-btn';
        liveStreamToggleBtn.title = 'Iniciar Stream';
    }
}

// Verificar si el usuario es host
function checkIfUserIsHost() {
    // Esta función debe implementarse según la lógica de tu aplicación
    // Por ahora, asumimos que todos los usuarios son host para testing
    return true;
    
    // Ejemplo de implementación real:
    // const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // return currentUser.role === 'host' || currentUser.isHost === true;
}

// Verificar si ya hay una grabación en curso
async function checkExistingRecording() {
    try {
        // Aquí deberías verificar con tu RecordingClient si hay una grabación activa
        // Por ahora, asumimos que no hay grabación activa
        console.log('🔍 Verificando grabación existente...');
        
        // Si hay grabación activa, actualizar el estado
        // recordingState.isRecording = true;
        // updateRecordingUI();
    } catch (error) {
        console.error('❌ Error al verificar grabación existente:', error);
    }
}

// Iniciar grabación
async function startRecording() {
    try {
        console.log('🎬 Iniciando grabación...');
        
        // Verificar permisos
        if (!await checkRecordingPermissions()) {
            showRecordingError('No tienes permisos para grabar');
            return;
        }
        
        // Inicializar RecordingClient si no existe
        if (!recordingState.recordingClient) {
            recordingState.recordingClient = await initializeRecordingClient();
        }
        
        // Iniciar grabación
        await recordingState.recordingClient.start();
        
        // Actualizar estado
        recordingState.isRecording = true;
        recordingState.isPaused = false;
        recordingState.startTime = Date.now();
        recordingState.totalPausedTime = 0;
        
        // Actualizar UI
        updateRecordingUI();
        
        // Iniciar timer
        startRecordingTimer();
        
        console.log('✅ Grabación iniciada correctamente');
        
    } catch (error) {
        console.error('❌ Error al iniciar grabación:', error);
        showRecordingError('Error al iniciar grabación: ' + error.message);
    }
}

// Pausar grabación
async function pauseRecording() {
    try {
        console.log('⏸️ Pausando grabación...');
        
        if (recordingState.recordingClient) {
            await recordingState.recordingClient.pause();
        }
        
        recordingState.isPaused = true;
        recordingState.pauseTime = Date.now();
        
        updateRecordingUI();
        pauseRecordingTimer();
        
        console.log('✅ Grabación pausada');
        
    } catch (error) {
        console.error('❌ Error al pausar grabación:', error);
        showRecordingError('Error al pausar grabación: ' + error.message);
    }
}

// Reanudar grabación
async function resumeRecording() {
    try {
        console.log('▶️ Reanudando grabación...');
        
        if (recordingState.recordingClient) {
            await recordingState.recordingClient.resume();
        }
        
        recordingState.isPaused = false;
        recordingState.totalPausedTime += Date.now() - recordingState.pauseTime;
        
        updateRecordingUI();
        resumeRecordingTimer();
        
        console.log('✅ Grabación reanudada');
        
    } catch (error) {
        console.error('❌ Error al reanudar grabación:', error);
        showRecordingError('Error al reanudar grabación: ' + error.message);
    }
}

// Detener grabación
async function stopRecording() {
    try {
        console.log('⏹️ Deteniendo grabación...');
        
        if (recordingState.recordingClient) {
            await recordingState.recordingClient.stop();
        }
        
        // Resetear estado
        recordingState.isRecording = false;
        recordingState.isPaused = false;
        recordingState.startTime = null;
        recordingState.pauseTime = null;
        recordingState.totalPausedTime = 0;
        
        // Detener timer
        stopRecordingTimer();
        
        // Actualizar UI
        updateRecordingUI();
        
        console.log('✅ Grabación detenida');
        
    } catch (error) {
        console.error('❌ Error al detener grabación:', error);
        showRecordingError('Error al detener grabación: ' + error.message);
    }
}

// Verificar permisos de grabación
async function checkRecordingPermissions() {
    try {
        // Verificar permisos de pantalla
        const screenPermission = await navigator.permissions.query({ name: 'display-capture' });
        if (screenPermission.state === 'denied') {
            return false;
        }
        
        // Verificar permisos de micrófono
        const micPermission = await navigator.permissions.query({ name: 'microphone' });
        if (micPermission.state === 'denied') {
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error al verificar permisos:', error);
        return false;
    }
}

// Inicializar RecordingClient
async function initializeRecordingClient() {
    // Esta función debe implementarse según tu RecordingClient
    // Por ahora, retornamos un mock
    console.log('🔧 Inicializando RecordingClient...');
    
    return {
        start: async () => {
            console.log('🎬 Mock: Iniciando grabación...');
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        },
        pause: async () => {
            console.log('⏸️ Mock: Pausando grabación...');
            await new Promise(resolve => setTimeout(resolve, 500));
        },
        resume: async () => {
            console.log('▶️ Mock: Reanudando grabación...');
            await new Promise(resolve => setTimeout(resolve, 500));
        },
        stop: async () => {
            console.log('⏹️ Mock: Deteniendo grabación...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };
}

// Actualizar UI de grabación
function updateRecordingUI() {
    if (recordingState.isRecording) {
        // Mostrar banner de estado
        recordingStatusBanner.style.display = 'block';
        
        // Actualizar botones
        recordingStartBtn.style.display = 'none';
        recordingPauseBtn.style.display = recordingState.isPaused ? 'none' : 'flex';
        recordingResumeBtn.style.display = recordingState.isPaused ? 'flex' : 'none';
        recordingStopBtn.style.display = 'flex';
        
        // Actualizar estado del banner
        if (recordingState.isPaused) {
            recordingStatusBanner.className = 'recording-status-banner paused';
            recordingStatusText.textContent = 'Grabación pausada';
        } else {
            recordingStatusBanner.className = 'recording-status-banner';
            recordingStatusText.textContent = 'Grabando...';
        }
        
    } else {
        // Ocultar banner de estado
        recordingStatusBanner.style.display = 'none';
        
        // Resetear botones
        recordingStartBtn.style.display = 'flex';
        recordingPauseBtn.style.display = 'none';
        recordingResumeBtn.style.display = 'none';
        recordingStopBtn.style.display = 'none';
    }
}

// Timer de grabación
function startRecordingTimer() {
    stopRecordingTimer(); // Detener timer anterior si existe
    
    recordingState.timer = setInterval(() => {
        if (recordingState.startTime) {
            const elapsed = Date.now() - recordingState.startTime - recordingState.totalPausedTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            recordingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function pauseRecordingTimer() {
    if (recordingState.timer) {
        clearInterval(recordingState.timer);
        recordingState.timer = null;
    }
}

function resumeRecordingTimer() {
    startRecordingTimer();
}

function stopRecordingTimer() {
    if (recordingState.timer) {
        clearInterval(recordingState.timer);
        recordingState.timer = null;
    }
    recordingTimer.textContent = '00:00';
}

// Mostrar error de grabación
function showRecordingError(message) {
    console.error('❌ Error de grabación:', message);
    
    // Actualizar banner con estado de error
    recordingStatusBanner.className = 'recording-status-banner error';
    recordingStatusText.textContent = 'Error: ' + message;
    recordingStatusBanner.style.display = 'block';
    
    // Ocultar error después de 5 segundos
    setTimeout(() => {
        if (recordingStatusBanner.classList.contains('error')) {
            recordingStatusBanner.style.display = 'none';
        }
    }, 5000);
}

// Inicializar controles de live stream y grabación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que todos los elementos estén cargados
    setTimeout(initializeStreamAndRecordingControls, 1000);
});

// Exportar funciones para uso global
window.recordingControls = {
    start: startRecording,
    pause: pauseRecording,
    resume: resumeRecording,
    stop: stopRecording,
    getState: () => recordingState
};

window.liveStreamControls = {
    connect: connectLiveStream,
    disconnect: disconnectLiveStream,
    toggle: toggleLiveStream,
    getState: () => liveStreamState
};
