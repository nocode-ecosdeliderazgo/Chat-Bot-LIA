// Inicializar partículas globales si existe el contenedor
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof window.initializeParticleSystem === 'function') {
    window.initializeParticleSystem();
  }
  
  // Cargar sesiones del curso desde la base de datos
  await loadCourseSessions();
});

// Configuración del chatbot según PROMPT_CLAUDE.md
const CHATBOT_CONFIG = {
    name: 'Lia IA',
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

// Estructura del curso: se carga dinámicamente desde la base de datos
let COURSE_SESSIONS = {};

// Cargar sesiones desde la API
async function loadCourseSessions() {
    try {
        const response = await fetch('/api/courses', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'X-User-Id': localStorage.getItem('userId')
            }
        });
        
        if (response.ok) {
            const { courses } = await response.json();
            if (courses && courses.length > 0) {
                // Tomar el primer curso activo o crear estructura por defecto
                const activeCourse = courses.find(c => c.status === 'activo') || courses[0];
                
                // Cargar módulos del curso
                const modulesResponse = await fetch(`/api/courses/${activeCourse.id}/modules`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'X-User-Id': localStorage.getItem('userId')
                    }
                });
                
                if (modulesResponse.ok) {
                    const { modules } = await modulesResponse.json();
                    COURSE_SESSIONS = {};
                    
                    // Organizar módulos por sesión
                    modules.forEach(module => {
                        const sessionId = module.session_id || 1;
                        if (!COURSE_SESSIONS[sessionId]) {
                            COURSE_SESSIONS[sessionId] = { title: `Sesión ${sessionId}` };
                        }
                        if (module.title && sessionId <= 4) {
                            COURSE_SESSIONS[sessionId].title = module.title;
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.warn('Error cargando sesiones del curso, usando fallback:', error);
        // Fallback en caso de error
        COURSE_SESSIONS = {
            '1': { title: 'Sesión 1: Descubriendo la IA para Profesionales' },
            '2': { title: 'Sesión 2: Fundamentos de Machine Learning' },
            '3': { title: 'Sesión 3: Deep Learning y Casos Prácticos' },
            '4': { title: 'Sesión 4: Aplicaciones, Ética y Proyecto Final' }
        };
    }
}

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
                <img src="assets/images/AprendeIA.png" alt="Lia IA" onerror="this.onerror=null;this.src='assets/images/AprendeIA.jpg'" />
            </div>
        </div>
    `;
}

function getUserAvatarHTML() {
    return `
        <div class="msg-avatar user">
            <div class="avatar-circle"><i class='bx bx-user'></i></div>
        </div>
    `;
}

// Función de inicialización principal consolidada
function init() {
    console.log('[CHAT_INIT] Iniciando aplicación...');
    
    try {
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
document.addEventListener('DOMContentLoaded', init);

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
        
        // También mostrar sugerencias específicas del curso
        if (courseId === 'curso-ia-completo') {
            setTimeout(() => {
                const suggestions = `Puedes preguntarme sobre:
• Conceptos básicos de Inteligencia Artificial
• Fundamentos de Machine Learning
• Redes Neuronales y Deep Learning
• Procesamiento de Lenguaje Natural
• IA Generativa y aplicaciones prácticas

¿Por dónde te gustaría empezar?`;
                addBotMessage(suggestions, null, false, false);
            }, 1500);
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

        const greeting = chatState.userName
            ? `¡Hola, ${chatState.userName}!  Bienvenido a Lia IA.\n\nSoy tu asistente virtual y estaré aquí para acompañarte durante tu aprendizaje en IA.`
            : `¡Hola!  Bienvenido a Lia IA.\n\nSoy tu asistente virtual y estaré aquí para acompañarte durante tu aprendizaje en IA.`;

        await sendBotMessage(greeting, null, false, true);
        await showWelcomeInstructions();
        // Menú inline eliminado: ahora el panel izquierdo contiene las herramientas
    })();
}

// Reproducir audio de bienvenida
function playWelcomeAudio() {
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
        const welcomeText = "¡Hola! Bienvenido a Lia IA. Soy tu asistente virtual y estaré aquí para acompañarte durante tu aprendizaje en IA.";
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
            <div class="prompt-panel" role="dialog" aria-modal="true">
                <div class="prompt-header" style="gap:8px">
                    <div style="display:flex;align-items:center;gap:8px;color:var(--text-muted)">Studio <span>›</span> <strong>Nota</strong></div>
                    <div style="display:flex;gap:6px;margin-left:auto">
                        <button id="exportPdfBtn" class="keyboard-button" style="max-width:160px">Exportar a PDF</button>
                        <button id="closeNoteBtn" class="prompt-close" aria-label="Cerrar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="prompt-body" style="display:flex;flex-direction:column;gap:10px">
                    <div style="display:flex;align-items:center;gap:8px">
                        <input id="noteTitle" value="${note.title || ''}" placeholder="Título" style="background:rgba(10,10,10,0.85);border:1px solid rgba(68,229,255,0.2);border-radius:10px;padding:10px 12px;color:var(--text-on-dark);font-weight:700;flex:1" />
                        <button id="deleteNoteBtn" class="session-btn" style="border-color:rgba(255,99,71,.45);color:rgba(255,99,71,.8);min-width:40px;height:40px;padding:8px;font-size:16px;display:flex;align-items:center;justify-content:center" title="Eliminar nota">🗑️</button>
                    </div>
                    <div class="editor-toolbar" style="display:flex;gap:6px">
                        <button class="session-btn" data-cmd="undo" title="Deshacer">↶</button>
                        <button class="session-btn" data-cmd="redo" title="Rehacer">↷</button>
                        <span style="width:8px"></span>
                        <button class="session-btn" data-cmd="bold" title="Negritas">B</button>
                        <button class="session-btn" data-cmd="italic" title="Cursiva"><em>I</em></button>
                        <button class="session-btn" data-cmd="insertUnorderedList" title="Lista">• Lista</button>
                    </div>
                    <div id="noteContent" contenteditable="true" style="min-height:70vh;background:rgba(10,10,10,0.85);border:1px solid rgba(68,229,255,0.2);border-radius:10px;padding:12px;flex:1;">${note.content || ''}</div>
                    <div style="display:flex;justify-content:flex-start;align-items:center;color:var(--text-muted);font-size:12px;margin-top:8px">
                        <div id="noteUpdateStatus">Actualizado: ${formatDate(note.updatedAt)}</div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const titleEl = overlay.querySelector('#noteTitle');
        const contentEl = overlay.querySelector('#noteContent');
        overlay.querySelectorAll('.editor-toolbar .session-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
                document.execCommand(cmd, false, null);
                contentEl?.focus();
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
        
        overlay.querySelector('#exportPdfBtn')?.addEventListener('click', () => exportElementToPDF(contentEl, (titleEl.value || 'notas') + '.pdf'));
    }

    window.UI = {
        openNotes() {
            const renderList = () => {
                const notes = notesStore.all();
                const list = notes.map(n => `
                    <button class="session-item" data-id="${n.id}" title="${n.title}">
                        <span class="module-index"><i class='bx bx-file-blank'></i></span>
                        <span class="module-title">${n.title}</span>
                        <span style="font-size:11px;color:var(--text-muted)">${formatDate(n.updatedAt)}</span>
                    </button>`).join('');
                return `<div class="module-list">${list || '<div style="color:var(--text-muted);padding:8px">Sin notas aún</div>'}</div>`;
            };

            // Si ya existe la card de notas, solo re-renderizamos su contenido
            const existing = document.querySelector('.studio-card[data-card="notes"]');
            const content = `
                <div class="collapsible" id="notesCard">
                    <div class="collapsible-header" style="margin-bottom:8px">
                        <h4 style="margin:0">Notas</h4>
                        <div style="display:flex;gap:6px">
                            <button class="collapsible-toggle" id="removeNotesCard" title="Eliminar" aria-label="Eliminar">🗑</button>
                            <button class="collapsible-toggle" id="notesCardToggle" aria-expanded="true" aria-controls="notesCardBody"><i class='bx bx-chevron-down'></i></button>
                        </div>
                    </div>
                    <div class="collapsible-content" id="notesCardBody" style="display:block">
                        ${renderList()}
                        <div style="position:sticky;bottom:0;margin-top:8px;padding-top:8px;border-top:1px solid rgba(68,229,255,.12);display:flex;justify-content:center">
                            <button id="addNoteBtn" class="keyboard-button" style="width:220px">+ Nota</button>
                        </div>
                    </div>
                </div>`;
            let el = existing;
            if (el) {
                el.innerHTML = `<h4 style="margin:0 0 8px 0">Notas</h4>` + content;
            } else {
                el = addCard('Notas', content);
                el.dataset.card = 'notes';
            }

            // Toggle/Eliminar card
            const section = el.querySelector('#notesCard');
            const body = el.querySelector('#notesCardBody');
            const toggle = el.querySelector('#notesCardToggle');
            toggle?.addEventListener('click', () => {
                const isOpen = section.classList.toggle('open');
                if (body) body.style.display = isOpen ? 'block' : 'none';
                toggle.setAttribute('aria-expanded', String(isOpen));
            });
            el.querySelector('#removeNotesCard')?.addEventListener('click', () => el.remove());

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

// Reproducir audio para respuestas del bot (solo cuando se solicita específicamente)
function playBotResponseAudio(text) {
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
async function showWelcomeInstructions() {
    await sendBotMessage("📝 ESCRIBE EN EL CHAT\n\nHaz tus preguntas y presiona Enter. Las herramientas ahora están en los paneles laterales (Notas, Glosario, Resumen de audio/video, Informes).");
    await sendBotMessage("🎯 SUGERENCIAS\n\nCuando corresponda, te propondré acciones como 'Enviar a Notas' o 'Crear Informe'; el panel Studio de la derecha las mostrará como tarjetas.");
}

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
    
    setTimeout(() => {
        sendBotMessage("🎯 TIPOS DE PREGUNTAS\n\nPuedes preguntarme sobre:\n• Temas del curso (IA, machine learning, deep learning)\n• Explicaciones de conceptos\n• Ejercicios prácticos\n• Dudas específicas sobre el contenido", null, false, false);
    }, 3000);
    
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

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error llamando a OpenAI:', error);
        return null;
    }
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

// Procesar mensaje del usuario con IA
async function processUserMessageWithAI(message) {
    try {
        // Cargar datos del curso hardcodeados
        const courseData = await loadCourseData();
        
        // Obtener contexto de la base de datos (si está disponible)
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
- 8 Sesiones completas: desde fundamentos hasta implementación en producción
- Sesión 1: Introducción a la IA (conceptos básicos, historia, tipos de IA)
- Sesión 2: Fundamentos de Machine Learning (supervisado, no supervisado, algoritmos)
- Sesión 3: Redes Neuronales y Deep Learning (CNN, RNN, backpropagation)
- Sesión 4: Procesamiento de Lenguaje Natural (tokenización, transformers, LLMs)
- Sesión 5: Visión por Computadora (CNN, detección de objetos, transfer learning)
- Sesión 6: IA Generativa y Modelos de Lenguaje (prompt engineering, fine-tuning)
- Sesión 7: Ética y Responsabilidad en IA (sesgo algorítmico, explicabilidad)
- Sesión 8: Implementación y Despliegue (MLOps, producción, monitoreo)

GLOSARIO COMPLETO: +50 términos con definiciones (desde conceptos básicos hasta avanzados)
EJERCICIOS PRÁCTICOS: 5 proyectos hands-on (clasificación, redes neuronales, NLP, visión, chatbots)
RECURSOS: Libros recomendados, cursos online, herramientas, datasets

CURSO "APRENDE Y APLICA IA" - CONTENIDO DISPONIBLE:
- 8 Sesiones completas: desde fundamentos hasta implementación en producción
- Sesión 1: Introducción a la IA (conceptos básicos, historia, tipos de IA)
- Sesión 2: Fundamentos de Machine Learning (supervisado, no supervisado, algoritmos)
- Sesión 3: Redes Neuronales y Deep Learning (CNN, RNN, backpropagation)
- Sesión 4: Procesamiento de Lenguaje Natural (tokenización, transformers, LLMs)
- Sesión 5: Visión por Computadora (CNN, detección de objetos, transfer learning)
- Sesión 6: IA Generativa y Modelos de Lenguaje (prompt engineering, fine-tuning)
- Sesión 7: Ética y Responsabilidad en IA (sesgo algorítmico, explicabilidad)
- Sesión 8: Implementación y Despliegue (MLOps, producción, monitoreo)

GLOSARIO COMPLETO: +50 términos con definiciones (desde conceptos básicos hasta avanzados)
EJERCICIOS PRÁCTICOS: 5 proyectos hands-on (clasificación, redes neuronales, NLP, visión, chatbots)
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
        
        // Mensaje de error siguiendo formato PROMPT_CLAUDE.md
        return `Hubo un problema temporal con el servicio, pero sigo disponible para ayudarte.

• **Problema técnico**: Conexión temporalmente interrumpida
• **Alternativas**: Puedo ayudarte con conceptos básicos de IA como **prompts**, **LLMs** o **tokens**
• **Ejercicios**: Disponibles algoritmos de clasificación, redes neuronales básicas
• **Navegación**: Usa el menú principal para acceder a temas organizados

¿Prefieres explorar fundamentos de IA, ejercicios prácticos o consultar el glosario?`;
    }
}

// Enviar mensaje
function sendMessage() {
    console.log('[CHAT] Iniciando envío de mensaje...');
    const message = messageInput.value.trim();
    
    if (!message) {
        console.log('[CHAT] Mensaje vacío, cancelando envío');
        return;
    }

    // Cancelar cualquier escritura del bot en curso para no bloquear el primer envío
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

    setTimeout(async () => {
        hideTypingIndicator();
        await handleUserMessage(message);
    }, 300);
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

// Generar respuesta
function generateResponse(message) {
    const responses = {
        'hola': '¡Hola! Me alegra verte. ¿Cómo estás hoy?',
        'buenos días': '¡Buenos días! Espero que tengas un excelente día. ¿En qué puedo ayudarte?',
        'buenas tardes': '¡Buenas tardes! ¿Cómo va tu día?',
        'buenas noches': '¡Buenas noches! ¿Listo para aprender algo nuevo?',
        'ayuda': 'Usa los botones del menú principal para navegar o escribe "ayuda" para ver las instrucciones completas.',
        'temas': 'Usa el botón "📚 Temas del Curso" en el menú principal para explorar todos los temas disponibles.',
        'ejercicios': 'Usa el botón "🧠 Ejercicios Prácticos" en el menú principal para ver todos los ejercicios disponibles.',
        'adiós': '¡Hasta luego! Ha sido un placer ayudarte. ¡Que tengas un excelente día!',
        'gracias': '¡De nada! Me alegra haber podido ayudarte. ¿Hay algo más en lo que pueda asistirte?',
        'chao': '¡Chao! Espero verte pronto. ¡Sigue aprendiendo!'
    };

    for (const [key, response] of Object.entries(responses)) {
        if (message.includes(key)) {
            return response;
        }
    }

    const defaultResponses = [
        'Interesante pregunta. Déjame pensar en la mejor manera de explicártelo...',
        'Esa es una excelente pregunta. Te ayudo a entenderlo mejor.',
        'Me gusta tu curiosidad. Vamos a explorar ese tema juntos.',
        'Excelente pregunta. Te explico de manera clara y sencilla.',
        '¡Buena pregunta! Te ayudo a comprender este concepto.'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

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
    // Navegación de sesiones
    showSessionsForTopic,
    openTopicSession,
    // Gestión de sesiones
    sessionManager,
    createNewSession,
    switchToSession,
    renameSession,
    duplicateSession,
    archiveSession
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
            const note = (typeof notesStore !== 'undefined') ? notesStore.create({}) : null;
            if (note) {
                openNoteEditor(note);
            } else if (window.UI?.openNotes) {
                window.UI.openNotes();
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
        messageInput.placeholder = 'Escribe un mensaje...';
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
                livestreamSocket.emit('livestream-message', { message: p.message, clientMessageId: p.id });
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

    function sendLivestreamMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        const clientMessageId = `c_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

        // Render inmediato
        addLivestreamMessage({
            username: livestreamChatState.username,
            message,
            timestamp: new Date().toISOString(),
            type: 'user',
            clientMessageId,
            pending: !livestreamChatState.isConnected
        });

        if (!livestreamChatState.isConnected) {
            livestreamChatState.pendingMessages.push({ id: clientMessageId, message });
        } else {
            livestreamSocket.emit('livestream-message', { message, clientMessageId });
        }

        messageInput.value = '';
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

        if (messageData.type === 'system') {
            messageElement.innerHTML = `
                <div class="message-content system">
                    <i class='bx bx-info-circle'></i>
                    <span>${messageData.message}</span>
                    <span class="timestamp">${time}</span>
                </div>
            `;
        } else {
            const isOwnMessage = messageData.username === livestreamChatState.username;
            messageElement.innerHTML = `
                <div class="message-content user ${isOwnMessage ? 'own' : ''} ${messageData.pending ? 'pending' : ''}">
                    <div class="message-header">
                        <span class="username">${messageData.username}</span>
                        <span class="timestamp">${time}</span>
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

// Inicializar chat del livestream cuando se carga la página
