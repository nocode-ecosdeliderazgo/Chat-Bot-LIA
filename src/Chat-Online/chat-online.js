// ===== CHAT ONLINE - JAVASCRIPT PRINCIPAL =====

// ===== FUNCIONES GLOBALES INMEDIATAS =====
// Definir funciones globales antes de la clase para que estén disponibles inmediatamente
window.openQuestionModal = function() {
    console.log('🔘 Función global de fallback ejecutada');
    if (window.chatOnline && window.chatOnline.showQuestionModal) {
        window.chatOnline.showQuestionModal();
    } else {
        console.error('❌ ChatOnline no está disponible');
        // Fallback directo
        const modal = document.getElementById('questionModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            console.log('✅ Modal abierto con fallback directo');
        } else {
            console.error('❌ Modal no encontrado');
        }
    }
};

// También definir una función más simple como respaldo
window.showQuestionModal = function() {
    console.log('🔘 Función de respaldo ejecutada');
    const modal = document.getElementById('questionModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal abierto con función de respaldo');
    } else {
        console.error('❌ Modal no encontrado');
    }
};

class ChatOnline {
    constructor() {
        this.currentModule = 1;
        this.currentTab = 'video';
        this.isLiaTyping = false;
        this.notes = [];
        this.isSearchMode = false;
        this.progressManager = null;
        this.courseProgress = null;
        
        // IDs para la base de datos
        this.currentCourseId = '550e8400-e29b-41d4-a716-446655440001';
        this.currentUser = {
            id: '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0',
            username: 'Estudiante',
            email: 'estudiante@ejemplo.com',
            name: 'Estudiante IA'
        };
        
        // ===== ESTADO DEL QUIZ =====
        this.quizData = this.getQuizData();
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        
        // ===== CRONÓMETRO DEL QUIZ =====
        this.quizTimer = null;
        this.quizTimeLimit = 3 * 60; // 3 minutos en segundos
        this.quizTimeRemaining = this.quizTimeLimit;
        this.quizStartTime = null;
        
        // ===== ACCESO GLOBAL INMEDIATO =====
        window.courseManager = this;
        console.log('✅ window.courseManager asignado en constructor');
        
        // Función global de backup para onclick
        window.switchTab = (contentType) => {
            console.log(`🔄 switchTab global llamado: ${contentType}`);
            this.switchContentTab(contentType);
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Chat Online...');
        this.setupEventListeners();
        await this.initializeProgressManager();
        await this.initializeYouTubeTracker();
        await this.initializeCommunitySystem();
        this.loadInitialData();
        this.setupResponsive();
        console.log('✅ Chat Online inicializado correctamente');
    }
    
    setupEventListeners() {
        // Navegación superior
        this.setupNavigation();
        
        // Módulos del curso
        this.setupModules();
        
        // Chat de LIA
        this.setupLiaChat();
        
        // Sistema de comunidad
        this.setupCommunityEvents();
        
        // Pestañas de contenido
        this.debugTabsImmediately();
        this.setupContentTabs();
        
        // Notas
        this.setupNotes();
        
        // Materiales
        this.setupMaterials();
        
        // Responsive
        this.setupResponsiveListeners();
        
        // Progress Manager Events
        this.setupProgressEvents();
    }
    
    // ===== NAVEGACIÓN SUPERIOR =====
    setupNavigation() {
        const backBtn = document.querySelector('.back-btn');
        const navTabs = document.querySelectorAll('.nav-tab');
        
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('🔙 Navegando hacia atrás...');
                this.goBack();
            });
        }

        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                console.log(`📑 Cambiando a pestaña: ${tabName}`);
                this.switchTab(tabName);
            });
        });
    }
    
    goBack() {
        // Simular navegación hacia atrás
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '../index.html';
        }
    }
    
    switchTab(tabName) {
        // Remover clase active de todas las pestañas
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Agregar clase active a la pestaña seleccionada
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        this.currentTab = tabName;
        
        // Aquí puedes agregar lógica específica para cada pestaña
        switch(tabName) {
            case 'video':
                this.showVideoContent();
                break;
            case 'materials':
                this.showMaterialsContent();
                break;
            case 'quiz':
                this.showQuizContent();
                break;
        }
    }
    
    // ===== MÓDULOS DEL CURSO =====
    setupModules() {
        // Configurar progress dots
        this.setupProgressDots();
        
        // Configurar módulos
        const moduleItems = document.querySelectorAll('.module-item');
        moduleItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const moduleId = parseInt(e.currentTarget.dataset.module);
                console.log(`📚 Seleccionando módulo: ${moduleId}`);
                this.selectModule(moduleId);
            });
        });
    }

    // ===== PROGRESS DOTS =====
    setupProgressDots() {
        const progressDots = document.querySelectorAll('.progress-dot');
        
        progressDots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                const moduleId = index + 1;
                console.log(`🎯 Seleccionando módulo desde progress dot: ${moduleId}`);
                this.selectModuleFromDot(moduleId, dot);
            });
            
            // Agregar efecto de hover con delay
            dot.addEventListener('mouseenter', () => {
                dot.style.animationDelay = '0s';
            });
            
            dot.addEventListener('mouseleave', () => {
                dot.style.animationDelay = `${index * 0.2}s`;
            });
        });
    }
    
    selectModuleFromDot(moduleId, clickedDot) {
        // Remover selección anterior
        document.querySelectorAll('.progress-dot').forEach(dot => {
            dot.classList.remove('selected');
        });
        
        // Agregar efecto de selección
        clickedDot.classList.add('selected');
        
        // Remover efecto después de la animación
        setTimeout(() => {
            clickedDot.classList.remove('selected');
        }, 600);
        
        // Actualizar módulo actual
        this.selectModule(moduleId);
    }
    
    selectModule(moduleId) {
        // Si hay progress manager, usar el método con progreso
        if (this.progressManager) {
            this.selectModuleWithProgress(moduleId);
            return;
        }
        
        // Fallback sin progress manager
        this.selectModuleBasic(moduleId);
    }
    
    selectModuleBasic(moduleId) {
        // Método original sin progress manager
        document.querySelectorAll('.module-item').forEach(item => {
            item.classList.remove('current');
        });
        
        const selectedModule = document.querySelector(`[data-module="${moduleId}"]`);
        if (selectedModule) {
            selectedModule.classList.add('current');
        }
        
        this.currentModule = moduleId;
        this.changeVideoByModule(moduleId);
        this.updateModuleInfo(moduleId);
        this.loadModuleContent(moduleId);
    }
    
    updateModuleInfo(moduleId) {
        const moduleData = this.getModuleData(moduleId);
        if (moduleData) {
            // Actualizar título del video
            const videoTitle = document.querySelector('.video-info h3');
            if (videoTitle) {
                videoTitle.textContent = moduleData.title;
            }
            
            // Actualizar información del módulo actual
            const currentModuleInfo = document.querySelector('.current-module-info');
            if (currentModuleInfo) {
                currentModuleInfo.textContent = moduleData.title;
            }
        }
        
        console.log(`📊 Módulo actualizado: ${moduleData?.title || 'Módulo ' + moduleId}`);
    }
    

    
    getModuleData(moduleId) {
        const modules = {
            1: { title: 'Módulo 1: ¿Qué es la IA?', duration: '15:30', progress: 0 },
            2: { title: 'Módulo 2: Historia de la IA', duration: '22:00', progress: 0 },
            3: { title: 'Módulo 3: Fundamentos del ML', duration: '18:30', progress: 0 },
            4: { title: 'Módulo 4: Redes Neuronales', duration: '25:00', progress: 0 },
            5: { title: 'Módulo 5: IA en el Futuro', duration: '20:00', progress: 0 }
        };
        
        return modules[moduleId];
    }
    
    loadModuleContent(moduleId) {
        // Aquí puedes cargar contenido específico del módulo
        console.log(`📖 Cargando contenido del módulo ${moduleId}...`);
        
        // Simular carga de transcripción
        const transcriptContent = document.querySelector('.transcript-content');
        if (transcriptContent) {
            const transcript = this.getModuleTranscript(moduleId);
            transcriptContent.innerHTML = transcript;
        }
    }
    
    getModuleTranscript(moduleId) {
        const transcripts = {
            1: `
                <p>La Inteligencia Artificial (IA) es una rama de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana.</p>
                <p>Estas tareas incluyen el aprendizaje, el razonamiento, la percepción y la resolución de problemas.</p>
                <p>La IA se puede clasificar en dos tipos principales: IA débil (narrow AI) e IA fuerte (general AI).</p>
            `,
            2: `
                <p>La historia de la IA se remonta a la década de 1950, cuando Alan Turing propuso el Test de Turing.</p>
                <p>En 1956, el término "Inteligencia Artificial" fue acuñado en la Conferencia de Dartmouth.</p>
                <p>Los años 60 y 70 vieron el desarrollo de los primeros sistemas expertos y redes neuronales.</p>
            `,
            3: `
                <p>En este módulo vamos a explorar los conceptos fundamentales de las redes neuronales. Comenzaremos con una introducción a los perceptrones simples...</p>
                <p>Las redes neuronales artificiales están inspiradas en el funcionamiento del cerebro humano. Cada neurona artificial recibe señales de entrada...</p>
                <p>La función de activación es crucial para determinar si una neurona se activa o no. Las funciones más comunes son sigmoid, tanh y ReLU...</p>
            `,
            4: `
                <p>Las redes neuronales profundas son la base del aprendizaje profundo moderno.</p>
                <p>Estas redes pueden tener múltiples capas ocultas que permiten el aprendizaje de características complejas.</p>
                <p>El backpropagation es el algoritmo fundamental para entrenar redes neuronales.</p>
            `,
            5: `
                <p>El futuro de la IA promete avances revolucionarios en todos los campos.</p>
                <p>La IA general (AGI) podría ser el próximo gran hito en la historia de la humanidad.</p>
                <p>Es importante considerar las implicaciones éticas y sociales de estos avances.</p>
            `
        };
        
        return transcripts[moduleId] || transcripts[1];
    }
    
    // ===== CHAT DE LIA =====
    setupLiaChat() {
        const sendBtn = document.getElementById('sendLiaMessage');
        const input = document.getElementById('liaMessageInput');
        const messagesContainer = document.getElementById('liaMessages');
        
        if (sendBtn && input && messagesContainer) {
            // Envío con botón
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendLiaMessage();
            });
            
            // Envío con Enter
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendLiaMessage();
                }
            });
            
            // Auto-resize del input
            input.addEventListener('input', () => {
                this.autoResizeInput(input);
            });
        }
        
        // Configurar botones de acción de LIA
        this.setupLiaActions();
        
        // Configurar editor de notas
        this.setupNotesEditor();
    }
    
    // ===== ACCIONES DE LIA =====
    setupLiaActions() {
        const newChatBtn = document.getElementById('newChatBtn');
        const collapseLiaBtn = document.getElementById('collapseLiaBtn');
        
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                console.log('🆕 Iniciando nuevo chat con LIA...');
                this.startNewChat();
            });
        }
        
        if (collapseLiaBtn) {
            collapseLiaBtn.addEventListener('click', () => {
                console.log('📦 Colapsando chat de LIA...');
                this.toggleLiaCollapse();
            });
        }
    }
    
    startNewChat() {
        const messagesContainer = document.getElementById('liaMessages');
        const input = document.getElementById('liaMessageInput');
        
        // Limpiar mensajes
        messagesContainer.innerHTML = `
            <div class="lia-message">
                <div class="lia-avatar">
                    <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
                </div>
                <div class="message-content">
                    <div class="message-text">
                        ¡Hola! Soy LIA, tu asistente de aprendizaje. Puedo ayudarte con:
                        • Conceptos del video
                        • Ejercicios prácticos
                        • Resúmenes de temas
                        ¿En qué puedo ayudarte?
                    </div>
                    <div class="message-time">ahora</div>
                </div>
            </div>
        `;
        
        // Limpiar input
        if (input) {
            input.value = '';
            this.autoResizeInput(input);
        }
        
        console.log('✅ Nuevo chat iniciado');
    }
    
    toggleLiaCollapse() {
        const liaChat = document.querySelector('.lia-chat');
        const liaSection = document.querySelector('.lia-assistant-section');
        const notesSection = document.querySelector('.notes-section');
        const collapseBtn = document.getElementById('collapseLiaBtn');
        const icon = collapseBtn.querySelector('svg');
        
        if (liaChat && liaSection && notesSection) {
            const isCollapsed = liaChat.style.opacity === '0' || liaChat.style.visibility === 'hidden';
            
            if (isCollapsed) {
                // Expandir
                liaChat.style.opacity = '1';
                liaChat.style.visibility = 'visible';
                liaChat.style.display = 'flex';
                liaSection.style.flex = '1';
                liaSection.style.minHeight = '350px';
                notesSection.style.flex = '1';
                notesSection.style.minHeight = '200px';
                icon.innerHTML = '<polyline points="6,9 12,15 18,9"/>';
                collapseBtn.title = 'Colapsar Chat';
                console.log('📤 Chat de LIA expandido');
            } else {
                // Colapsar
                liaChat.style.opacity = '0';
                liaChat.style.visibility = 'hidden';
                setTimeout(() => {
                    liaChat.style.display = 'none';
                }, 300);
                liaSection.style.flex = '0 0 auto';
                liaSection.style.minHeight = 'auto';
                notesSection.style.flex = '1';
                notesSection.style.minHeight = '400px';
                icon.innerHTML = '<polyline points="6,15 12,9 18,15"/>';
                collapseBtn.title = 'Expandir Chat';
                console.log('📦 Chat de LIA colapsado - Notas expandidas');
            }
        }
    }
    
    async sendLiaMessage() {
        const input = document.getElementById('liaMessageInput');
        const messagesContainer = document.getElementById('liaMessages');
        const message = input.value.trim();
        const replyArea = document.getElementById('replyArea');
        
        if (!message || this.isLiaTyping) return;
        
        console.log('📤 Enviando mensaje a LIA:', message);

        // Limpiar input
        input.value = '';
        this.autoResizeInput(input);
        
        // Agregar mensaje del usuario (con respuesta si existe)
        this.addUserMessage(message, replyArea.dataset.replyingTo);
        
        // Ocultar área de respuesta
        if (replyArea.style.display === 'block') {
            this.cancelReply();
        }

        // Mostrar indicador de escritura
        this.showTypingIndicator();

        try {
            // Simular respuesta de LIA (aquí puedes integrar con tu API real)
            const response = await this.getLiaResponse(message);
            this.hideTypingIndicator();
            this.addLiaMessage(response);
        } catch (error) {
            console.error('❌ Error al obtener respuesta de LIA:', error);
            this.hideTypingIndicator();
            this.addLiaMessage('Lo siento, no pude procesar tu mensaje. ¿Podrías intentarlo de nuevo?');
        }
    }
    
    addUserMessage(message, replyTo = null) {
        const messagesContainer = document.getElementById('liaMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'lia-message user-message';
        
        let replyHtml = '';
        if (replyTo) {
            replyHtml = `
                <div class="reply-preview">
                    <div class="reply-preview-text">${this.escapeHtml(replyTo.length > 40 ? replyTo.substring(0, 40) + '...' : replyTo)}</div>
                </div>
            `;
        }
        
        messageElement.innerHTML = `
            <div class="message-content user-content">
                ${replyHtml}
                <div class="message-text">${this.escapeHtml(message)}</div>
                <div class="message-time">ahora</div>
                <div class="message-actions">
                    <button class="action-btn-small" onclick="window.chatOnline.copyMessage(this)" title="Copiar mensaje">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                    <button class="action-btn-small" onclick="window.chatOnline.replyToMessage(this)" title="Responder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,11 12,14 22,4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                    </button>
                    <button class="action-btn-small" onclick="window.chatOnline.createNoteFromMessage(this)" title="Crear nota">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom(messagesContainer);
    }
    
    addLiaMessage(message) {
        const messagesContainer = document.getElementById('liaMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'lia-message';
        messageElement.innerHTML = `
            <div class="lia-avatar">
                <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
            </div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(message)}</div>
                <div class="message-time">ahora</div>
                <div class="message-actions">
                    <button class="action-btn-small" onclick="window.chatOnline.copyMessage(this)" title="Copiar mensaje">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                    <button class="action-btn-small" onclick="window.chatOnline.replyToMessage(this)" title="Responder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,11 12,14 22,4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                    </button>
                    <button class="action-btn-small" onclick="window.chatOnline.createNoteFromMessage(this)" title="Crear nota">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom(messagesContainer);
    }
    
    showTypingIndicator() {
        this.isLiaTyping = true;
        const messagesContainer = document.getElementById('liaMessages');
        const typingElement = document.createElement('div');
        typingElement.className = 'lia-message typing-indicator';
        typingElement.innerHTML = `
            <div class="lia-avatar">
                <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
            </div>
            <div class="typing-dots-only">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        messagesContainer.appendChild(typingElement);
        this.scrollToBottom(messagesContainer);
    }
    
    hideTypingIndicator() {
        this.isLiaTyping = false;
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    async getLiaResponse(message) {
        try {
            console.log('[LIA] 🚀 Generando respuesta para:', message);
            
            // Obtener información del usuario actual
            const currentUser = this.obtenerUsuarioActual();
            console.log('[LIA] 👤 Usuario actual:', currentUser);
            
            // Obtener contexto del taller actual usando la función hardcodeada
            const context = typeof obtenerContextoCurso === 'function' ? obtenerContextoCurso() : this.obtenerContextoFallback();
            console.log('[LIA] 📚 Contexto del taller:', context);
            
            // Preparar prompt con contexto específico del taller
            const prompt = `Usuario: ${message}\n\nContexto del Taller: ${context}`;
            console.log('[LIA] 📝 Prompt preparado:', prompt);
            
            console.log('[LIA] 🔄 Enviando solicitud a API...');
            
            // Determinar URL de API según el entorno
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const currentPort = window.location.port;
            let apiUrl;
            
            if (isLocalhost && (currentPort === '3000' || window.location.href.includes(':3000'))) {
                apiUrl = '/api/openai';
            } else if (isLocalhost && currentPort === '8888') {
                apiUrl = '/.netlify/functions/openai';
            } else if (isLocalhost) {
                apiUrl = '/api/openai';
            } else {
                apiUrl = '/.netlify/functions/openai';
            }
            
            console.log('[LIA] 🎯 URL de API:', apiUrl);
            
            // Llamar a la API de OpenAI
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.obtenerTokenAuth()}`,
                    'X-User-Id': currentUser?.id || 'taller-ia-user'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    context: `Información del usuario: ${JSON.stringify(currentUser || {})}`
                })
            });
            
            console.log('[LIA] 📡 Respuesta del servidor:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('[LIA] ✅ Datos recibidos:', data);
                
                if (data.response) {
                    console.log('[LIA] 🎯 Respuesta de API obtenida exitosamente');
                    return data.response;
                } else {
                    console.log('[LIA] ⚠️ Respuesta vacía de la API');
                    return '❌ Lo siento, hubo un problema técnico. Verifica la configuración de OpenAI.';
                }
            } else {
                const errorText = await response.text();
                console.log('[LIA] ❌ Error de API:', response.status, response.statusText);
                console.log('[LIA] 📄 Texto del error:', errorText);
                
                if (response.status === 404) {
                    return `❌ Error de configuración: No se encuentra la API en ${apiUrl}. Verifica que tu servidor esté corriendo correctamente.`;
                } else if (response.status === 401) {
                    return `🔐 Error de autenticación: Token inválido. Verifica la configuración de autenticación.`;
                } else if (response.status === 500) {
                    return `⚙️ Error del servidor: ${errorText}. Verifica tu configuración de OPENAI_API_KEY.`;
                } else {
                    return `❌ Error HTTP ${response.status}: ${errorText}. Verifica la configuración del servidor.`;
                }
            }
            
        } catch (error) {
            console.error('[LIA] 💥 Error al conectar con API:', error);
            return `❌ Error de conexión: No se pudo conectar con la API. Error: ${error.message}`;
        }
    }
    
    // Función auxiliar para obtener contexto de fallback si la función global no existe
    obtenerContextoFallback() {
        return `
            Taller: Taller de fundamentos de Inteligencia Artificial con tutor personalizado
            Tipo: Taller interactivo  
            Módulo actual: 1 - Fundamentos de Inteligencia Artificial
            Descripción: Conceptos básicos de IA, Machine Learning y aplicaciones prácticas con acompañamiento personalizado
            Tutor: LIA - Tutor Personalizado de IA
            Modalidad: 100% online con tutor personalizado IA
            Documento de apoyo: Doc de apoyo - Fundamentos de IA.pdf
            Objetivos del módulo: Comprender los conceptos fundamentales de IA, Identificar tipos de Machine Learning, Reconocer aplicaciones prácticas de IA, Desarrollar pensamiento crítico sobre IA
        `;
    }
    
    // Función auxiliar para obtener usuario actual
    obtenerUsuarioActual() {
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsed = JSON.parse(userData);
                console.log('[LIA] 👤 Usuario desde localStorage:', parsed);
                return parsed;
            }
            
            // Usuario por defecto con los IDs correctos
            const defaultUser = {
                id: '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0',
                username: 'Estudiante',
                email: 'estudiante@ejemplo.com',
                name: 'Estudiante IA'
            };
            
            console.log('[LIA] 👤 Usuario por defecto:', defaultUser);
            return defaultUser;
        } catch (error) {
            console.log('[LIA] Error obteniendo usuario:', error);
            const fallbackUser = {
                id: '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0',
                username: 'Estudiante',
                email: 'estudiante@ejemplo.com',
                name: 'Estudiante IA'
            };
            console.log('[LIA] 👤 Usuario fallback:', fallbackUser);
            return fallbackUser;
        }
    }
    
    // Función auxiliar para obtener el ID del curso actual
    getCurrentCourseId() {
        try {
            // Intentar obtener desde el progreso del curso
            if (this.courseProgress && this.courseProgress.course_id) {
                console.log('📚 Curso desde courseProgress:', this.courseProgress.course_id);
                return this.courseProgress.course_id;
            }
            
            // Intentar obtener desde localStorage
            const courseData = localStorage.getItem('currentCourse');
            if (courseData) {
                const parsed = JSON.parse(courseData);
                console.log('📚 Curso desde localStorage:', parsed.id);
                return parsed.id;
            }
            
            // Usar el ID por defecto
            console.log('📚 Usando curso por defecto:', this.currentCourseId);
            return this.currentCourseId;
        } catch (error) {
            console.log('📚 Error obteniendo curso:', error);
            return this.currentCourseId;
        }
    }
    
    // Función auxiliar para obtener el ID del módulo actual
    getCurrentModuleId() {
        try {
            // Intentar obtener desde el progreso del curso
            if (this.courseProgress && this.courseProgress.modules) {
                const currentModule = this.courseProgress.modules.find(m => m.module_number === this.currentModule);
                if (currentModule && currentModule.id) {
                    console.log('📖 Módulo desde courseProgress:', currentModule.id);
                    return currentModule.id;
                }
            }
            
            // Intentar obtener desde localStorage
            const moduleData = localStorage.getItem('currentModule');
            if (moduleData) {
                const parsed = JSON.parse(moduleData);
                console.log('📖 Módulo desde localStorage:', parsed.id);
                return parsed.id;
            }
            
            // Usar el formato por defecto
            const defaultModuleId = `module-${this.currentModule}`;
            console.log('📖 Usando módulo por defecto:', defaultModuleId);
            return defaultModuleId;
        } catch (error) {
            console.log('📖 Error obteniendo módulo:', error);
            return `module-${this.currentModule}`;
        }
    }
    
    // Función auxiliar para obtener token de autenticación
    obtenerTokenAuth() {
        const token = localStorage.getItem('authToken');
        if (token) {
            console.log('[LIA] 🔑 Usando token real del localStorage');
            return token;
        }
        
        const devToken = 'dev-token-taller-ia-user-' + Date.now();
        console.log('[LIA] 🔧 Usando token de desarrollo:', devToken);
        return devToken;
    }
    
    // ===== PESTAÑAS DE CONTENIDO =====
    
    debugTabsImmediately() {
        console.log('🔍 === DEBUG INMEDIATO DE TABS ===');
        
        // Verificar contenedor de tabs
        const contentTabs = document.querySelector('.content-tabs');
        console.log('📦 .content-tabs encontrado:', !!contentTabs);
        
        // Verificar botones
        const allButtons = document.querySelectorAll('.tab-btn');
        console.log(`🔘 Total .tab-btn encontrados: ${allButtons.length}`);
        
        const tabButtons = document.querySelectorAll('.content-tabs .tab-btn');
        console.log(`🎯 .content-tabs .tab-btn encontrados: ${tabButtons.length}`);
        
        // Listar cada botón
        tabButtons.forEach((btn, i) => {
            console.log(`  ${i}: data-content="${btn.dataset.content}" text="${btn.textContent.trim()}"`);
        });
        
        // Verificar contenidos
        const transcriptContent = document.querySelector('[data-content="transcript"]');
        const summaryContent = document.querySelector('[data-content="summary"]');
        const communityContent = document.querySelector('[data-content="community"]');
        
        console.log('📄 Contenidos encontrados:');
        console.log(`  transcript: ${!!transcriptContent}`);
        console.log(`  summary: ${!!summaryContent}`);
        console.log(`  community: ${!!communityContent}`);
        
        // Verificar acceso a window.courseManager
        console.log('🌍 window.courseManager:', typeof window.courseManager);
        console.log('🔧 switchContentTab disponible:', typeof this.switchContentTab);
    }
    
    setupContentTabs() {
        console.log('🔧 Configurando tabs de contenido...');
        
        // Método 1: Event listeners directos
        this.configureTabButtons();
        
        // Método 2: Event delegation como backup
        this.setupTabDelegation();
        
        // Retry después de un momento si no se encontraron todos los botones
        setTimeout(() => {
            const currentButtons = document.querySelectorAll('.content-tabs .tab-btn');
            if (currentButtons.length < 3) {
                console.log('🔄 Retry: configurando tabs nuevamente...');
                this.configureTabButtons();
            }
        }, 100);
    }
    
    setupTabDelegation() {
        const contentTabs = document.querySelector('.content-tabs');
        if (!contentTabs) {
            console.error('❌ No se encontró .content-tabs para delegation');
            return;
        }
        
        console.log('🎯 Configurando event delegation para tabs...');
        
        contentTabs.addEventListener('click', (e) => {
            // Buscar el botón más cercano
            let button = e.target;
            while (button && !button.classList.contains('tab-btn')) {
                button = button.parentElement;
                if (button === contentTabs) break;
            }
            
            if (button && button.classList.contains('tab-btn')) {
                const contentType = button.dataset.content;
                console.log(`🎯 DELEGATION CLICK: ${contentType}`);
                e.preventDefault();
                e.stopPropagation();
                this.switchContentTab(contentType);
            }
        });
        
        console.log('✅ Event delegation configurado');
    }
    
    configureTabButtons() {
        const tabButtons = document.querySelectorAll('.content-tabs .tab-btn');
        console.log(`📋 Configurando ${tabButtons.length} botones de tabs`);
        
        if (tabButtons.length === 0) {
            console.error('❌ No se encontraron botones de tabs');
            return;
        }
        
        tabButtons.forEach((button, index) => {
            const contentType = button.dataset.content;
            console.log(`🔗 Configurando: ${contentType}`);
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const clickedContentType = e.currentTarget.dataset.content;
                console.log(`🔘 CLICK: ${clickedContentType}`);
                this.switchContentTab(clickedContentType);
            });
        });
        
        console.log('✅ Event listeners configurados');
    }
    
    switchContentTab(contentType) {
        console.log(`🔄 SWITCH TAB: ${contentType}`);
        
        // Remover clase active de todas las pestañas
        document.querySelectorAll('.content-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Agregar clase active a la pestaña seleccionada
        const activeTab = document.querySelector(`.content-tabs .tab-btn[data-content="${contentType}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            console.log(`✅ Tab activado: ${contentType}`);
        } else {
            console.error(`❌ No se encontró tab: ${contentType}`);
        }
        
        // Cambiar contenido
        this.updateContentArea(contentType);
    }
    
    updateContentArea(contentType) {
        console.log(`🔄 Cambiando contenido a: ${contentType}`);
        
        // Ocultar todos los contenidos (solo dentro del content-area, no los tabs)
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) {
            console.error('❌ No se encontró .content-area');
            return;
        }
        
        // Primero verificar que el contenido objetivo existe
        const targetContent = contentArea.querySelector(`[data-content="${contentType}"]`);
        if (!targetContent) {
            console.error(`❌ No se encontró contenido para: ${contentType}`);
            return;
        }
        
        // Ocultar todos los contenidos EXCEPTO el objetivo
        contentArea.querySelectorAll('[data-content]').forEach(content => {
            if (content.getAttribute('data-content') !== contentType) {
                content.style.display = 'none';
                console.log(`🔒 Ocultando: ${content.getAttribute('data-content')}`);
            }
        });
        
        // Mostrar el contenido seleccionado
        console.log(`🔍 Buscando contenido: [data-content="${contentType}"]`);
        console.log(`📍 Contenido encontrado:`, targetContent);
        
        if (targetContent) {
            const displayType = contentType === 'community' ? 'flex' : 'block';
            targetContent.style.display = displayType;
            console.log(`✅ Mostrando ${contentType} con display: ${displayType}`);
            
            // Configurar event listeners específicos si es necesario
            if (contentType === 'community') {
                console.log('🏘️ Configurando event listeners de comunidad');
                this.setupCommunityEventListeners();
                
                // Asegurar que el contenido sea completamente visible
                setTimeout(() => {
                    targetContent.style.display = 'flex';
                    targetContent.style.visibility = 'visible';
                    targetContent.style.opacity = '1';
                    
                    console.log('✅ Comunidad configurada correctamente');
                }, 10);
            }
        } else {
            console.error(`❌ No se encontró contenido para: ${contentType}`);
            
            // Debug adicional: mostrar todos los elementos con data-content
            const allDataContent = contentArea.querySelectorAll('[data-content]');
            console.log('📋 Todos los elementos con data-content:');
            allDataContent.forEach(el => {
                console.log(`  - ${el.getAttribute('data-content')}: ${el.className}`);
            });
        }
        
        console.log(`📄 Contenido cambiado a: ${contentType}`);
    }
    
    // ===== FUNCIONES DE COMUNIDAD =====
    
    debugCommunitySetup() {
        console.log('🔍 Debug: Verificando elementos de comunidad...');
        
        // Verificar botón de hacer pregunta
        const askBtn = document.getElementById('askQuestionBtn');
        console.log('🔍 Botón "Hacer Pregunta":', !!askBtn);
        
        // Verificar modal
        const modal = document.getElementById('questionModal');
        console.log('🔍 Modal de pregunta:', !!modal);
        
        // Verificar formulario
        const form = document.getElementById('questionForm');
        console.log('🔍 Formulario de pregunta:', !!form);
        
        // Verificar inputs
        const titleInput = document.getElementById('questionTitle');
        const contentInput = document.getElementById('questionContent');
        console.log('🔍 Input de título:', !!titleInput);
        console.log('🔍 Input de contenido:', !!contentInput);
        
        // Verificar botón de submit
        const submitBtn = document.getElementById('submitQuestionBtn');
        console.log('🔍 Botón de submit:', !!submitBtn);
        
        // Verificar si window.chatOnline está disponible
        console.log('🔍 window.chatOnline disponible:', !!window.chatOnline);
        console.log('🔍 showQuestionModal disponible:', !!(window.chatOnline && window.chatOnline.showQuestionModal));
    }
    
    setupCommunityEventListeners() {
        // Configurar usuario actual en la API
        if (window.communityAPI && this.currentUser) {
            window.communityAPI.setCurrentUser(this.currentUser);
        }
        
        // Botón para hacer pregunta - con múltiples intentos
        this.setupAskQuestionButton();
        
        // Filtros de preguntas
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.getAttribute('data-filter');
                this.filterQuestions(filter);
            });
        });
        
        // Selector de ordenamiento
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortQuestions(e.target.value);
            });
        }
        
        // Modal de pregunta
        this.setupQuestionModal();
        
        // Cargar preguntas iniciales
        this.loadQuestions();
        
        // Debug: verificar que todo esté configurado correctamente
        this.debugCommunitySetup();
        
        console.log('🔧 Event listeners de comunidad configurados');
    }

    setupAskQuestionButton() {
        // Intentar configurar el botón con retry
        const setupButton = () => {
            const askQuestionBtn = document.getElementById('askQuestionBtn');
            if (askQuestionBtn) {
                // Remover listeners existentes para evitar duplicados
                askQuestionBtn.removeEventListener('click', this.handleAskQuestionClick);
                
                // Agregar nuevo listener
                this.handleAskQuestionClick = () => {
                    console.log('🔘 Botón "Hacer Pregunta" clickeado');
                    this.showQuestionModal();
                };
                
                askQuestionBtn.addEventListener('click', this.handleAskQuestionClick);
                console.log('✅ Event listener del botón "Hacer Pregunta" configurado');
                return true;
            }
            return false;
        };

        // Intentar inmediatamente
        if (!setupButton()) {
            // Si no funciona, intentar después de un delay
            setTimeout(() => {
                if (!setupButton()) {
                    console.warn('⚠️ No se pudo configurar el botón "Hacer Pregunta"');
                }
            }, 100);
        }
    }
    
    showQuestionModal() {
        console.log('🔍 Intentando abrir modal de pregunta...');
        
        const modal = document.getElementById('questionModal');
        console.log('🔍 Modal encontrado:', !!modal);
        
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus en el título
            const titleInput = document.getElementById('questionTitle');
            console.log('🔍 Input de título encontrado:', !!titleInput);
            
            if (titleInput) {
                setTimeout(() => {
                    titleInput.focus();
                    console.log('✅ Focus aplicado al input de título');
                }, 100);
            }
            
            console.log('✅ Modal de pregunta abierto exitosamente');
        } else {
            console.error('❌ No se encontró el modal de pregunta');
        }
    }
    
    hideQuestionModal() {
        const modal = document.getElementById('questionModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Limpiar formulario
            this.clearQuestionForm();
        }
        
        console.log('❌ Modal de pregunta cerrado');
    }
    
    setupQuestionModal() {
        // Cerrar modal
        const closeBtn = document.getElementById('closeQuestionModal');
        const cancelBtn = document.getElementById('cancelQuestionBtn');
        const overlay = document.querySelector('.modal-overlay');
        
        [closeBtn, cancelBtn, overlay].forEach(element => {
            if (element) {
                element.addEventListener('click', () => this.hideQuestionModal());
            }
        });
        
        // Formulario de pregunta
        const questionForm = document.getElementById('questionForm');
        if (questionForm) {
            questionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitQuestion();
            });
        }
        
        // Contador de caracteres
        const titleInput = document.getElementById('questionTitle');
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                const count = titleInput.value.length;
                const counter = document.getElementById('titleCharCount');
                if (counter) {
                    counter.textContent = count;
                }
            });
        }
        
        // Manejo de tags
        const tagsInput = document.getElementById('questionTags');
        if (tagsInput) {
            tagsInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addQuestionTag(tagsInput.value.trim());
                    tagsInput.value = '';
                }
            });
        }
    }
    
    async loadQuestions(filter = 'all', sort = 'recent') {
        try {
            console.log(`📋 Cargando preguntas - Filtro: ${filter}, Orden: ${sort}`);
            
            // Mostrar estado de carga
            this.showQuestionsLoading();
            
            // Preguntas de demostración hardcodeadas
            const demoQuestions = [
                {
                    id: 'demo-1',
                    title: '¿Cómo implementar ChatGPT en mi empresa?',
                    content: 'Estoy buscando las mejores prácticas para integrar ChatGPT en los procesos empresariales de mi compañía. ¿Qué herramientas recomiendan y cuáles son los aspectos de seguridad más importantes a considerar?',
                    tags: ['ChatGPT', 'Empresa', 'Implementación'],
                    votes_count: 15,
                    answers_count: 8,
                    views_count: 147,
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
                    users: {
                        name: 'María González',
                        avatar_url: '/assets/images/avatars/maria.jpg'
                    }
                },
                {
                    id: 'demo-2', 
                    title: '¿Cuáles son las diferencias entre GPT-4 y Claude?',
                    content: 'He estado probando diferentes modelos de IA y me gustaría entender las principales diferencias entre GPT-4 y Claude. ¿En qué casos es mejor usar uno u otro?',
                    tags: ['GPT-4', 'Claude', 'Comparación'],
                    votes_count: 23,
                    answers_count: 12,
                    views_count: 289,
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
                    users: {
                        name: 'Carlos Martínez',
                        avatar_url: '/assets/images/avatars/carlos.jpg'
                    }
                },
                {
                    id: 'demo-3',
                    title: 'Automatización de emails con IA - ¿Es ético?',
                    content: 'Quiero implementar IA para automatizar respuestas de email, pero me preocupan las implicaciones éticas. ¿Cómo manejan ustedes la transparencia con los clientes?',
                    tags: ['Ética', 'Email', 'Automatización'],
                    votes_count: 7,
                    answers_count: 5,
                    views_count: 95,
                    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
                    users: {
                        name: 'Ana Rodríguez',
                        avatar_url: '/assets/images/avatars/ana.jpg'
                    }
                }
            ];
            
            let allQuestions = [...demoQuestions];
            
            // Asegurar que el usuario esté configurado en la API
            if (window.communityAPI) {
                const currentUser = this.obtenerUsuarioActual() || this.currentUser;
                if (currentUser) {
                    window.communityAPI.setCurrentUser(currentUser);
                    console.log('👤 Usuario configurado en communityAPI:', currentUser);
                }
            }
            
            // Intentar cargar preguntas reales de la API
            try {
                if (window.communityAPI) {
                    const response = await window.communityAPI.getQuestions({
                        filter,
                        sort,
                        course_id: this.currentCourseId,
                        module_id: this.currentModule
                    });
                    
                    if (response.success && response.data && response.data.length > 0) {
                        console.log(`✅ ${response.data.length} preguntas reales cargadas de la base de datos`);
                        // Agregar preguntas reales al inicio del array
                        allQuestions = [...response.data, ...demoQuestions];
                    } else {
                        console.log('ℹ️ API response:', response);
                    }
                } else {
                    console.warn('⚠️ window.communityAPI no disponible');
                }
            } catch (apiError) {
                console.warn('⚠️ Error al cargar preguntas de la API, usando solo preguntas de demostración:', apiError);
            }
            
            // Aplicar filtrado
            let filteredQuestions = allQuestions;
            if (filter === 'unanswered') {
                filteredQuestions = allQuestions.filter(q => (q.answers_count || 0) === 0);
            } else if (filter === 'answered') {
                filteredQuestions = allQuestions.filter(q => (q.answers_count || 0) > 0);
            }
            
            // Aplicar ordenamiento
            if (sort === 'votes') {
                filteredQuestions.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
            } else if (sort === 'answers') {
                filteredQuestions.sort((a, b) => (b.answers_count || 0) - (a.answers_count || 0));
            } else { // recent
                filteredQuestions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
            
            this.displayQuestions(filteredQuestions);
            console.log(`✅ ${filteredQuestions.length} preguntas mostradas (${allQuestions.length - demoQuestions.length} reales + ${demoQuestions.length} demo)`);
            
        } catch (error) {
            console.error('❌ Error al cargar preguntas:', error);
            this.showNotification('Error al cargar las preguntas', 'error');
            this.showQuestionsError();
        }
    }

    async filterQuestions(filter) {
        console.log(`🔍 Filtrando preguntas por: ${filter}`);
        
        // Actualizar pestañas activas
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
        
        // Cargar preguntas con el filtro
        await this.loadQuestions(filter, this.currentSort || 'recent');
    }
    
    async sortQuestions(sortBy) {
        console.log(`📊 Ordenando preguntas por: ${sortBy}`);
        this.currentSort = sortBy;
        
        // Cargar preguntas con el ordenamiento
        const currentFilter = document.querySelector('.filter-tab.active')?.getAttribute('data-filter') || 'all';
        await this.loadQuestions(currentFilter, sortBy);
    }

    showQuestionsLoading() {
        const questionsContainer = document.getElementById('questionsList');
        if (questionsContainer) {
            questionsContainer.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Cargando preguntas...</p>
                </div>
            `;
        }
    }

    showQuestionsError() {
        const questionsContainer = document.getElementById('questionsList');
        if (questionsContainer) {
            questionsContainer.innerHTML = `
                <div class="error-state">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <p>Error al cargar las preguntas</p>
                    <button class="btn-secondary" onclick="window.chatOnline.loadQuestions()">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    displayQuestions(questions) {
        const questionsContainer = document.getElementById('questionsList');
        if (!questionsContainer) return;

        if (questions.length === 0) {
            questionsContainer.innerHTML = `
                <div class="empty-state">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>No hay preguntas aún</h3>
                    <p>Sé el primero en hacer una pregunta sobre este tema</p>
                    <button class="btn-primary" onclick="window.chatOnline.showQuestionModal()">
                        Hacer Primera Pregunta
                    </button>
                </div>
            `;
            return;
        }

        const questionsHTML = questions.map(question => this.createQuestionHTML(question)).join('');
        questionsContainer.innerHTML = questionsHTML;

        // Reconfigurar event listeners para los nuevos elementos
        this.setupQuestionEventListeners();
    }

    createQuestionHTML(question) {
        const timeAgo = this.getTimeAgo(question.created_at);
        const tagsHTML = question.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || '';
        
        return `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-votes">
                    <button class="vote-btn upvote" title="Votar positivamente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="18,15 12,9 6,15"/>
                        </svg>
                    </button>
                    <span class="vote-count">${question.votes_count || 0}</span>
                    <button class="vote-btn downvote" title="Votar negativamente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6,9 12,15 18,9"/>
                        </svg>
                    </button>
                </div>
                
                <div class="question-content">
                    <div class="question-header">
                        <h4 class="question-title">${this.escapeHtml(question.title)}</h4>
                        <div class="question-meta">
                            <span class="question-author">
                                <img src="${question.users?.avatar_url || '/assets/images/default-avatar.svg'}" 
                                     alt="${question.users?.name || 'Usuario'}" class="author-avatar">
                                ${question.users?.name || 'Usuario'}
                            </span>
                            <span class="question-time">${timeAgo}</span>
                        </div>
                    </div>
                    
                    <div class="question-body">
                        <p>${this.escapeHtml(question.content.substring(0, 200))}${question.content.length > 200 ? '...' : ''}</p>
                    </div>
                    
                    <div class="question-footer">
                        <div class="question-tags">
                            ${tagsHTML}
                        </div>
                        <div class="question-stats">
                            <span class="stat">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                ${question.answers_count || 0} respuestas
                            </span>
                            <span class="stat">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                ${question.views_count || 0} vistas
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupQuestionEventListeners() {
        // Votos en preguntas
        document.querySelectorAll('.question-item .vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleVote(e.target.closest('.vote-btn'));
            });
        });

        // Click en pregunta para ver detalles
        document.querySelectorAll('.question-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.vote-btn')) {
                    const questionId = item.getAttribute('data-question-id');
                    this.showQuestionDetails(questionId);
                }
            });
        });
    }

    showQuestionDetails(questionId) {
        console.log(`📖 Mostrando detalles de pregunta: ${questionId}`);
        // Aquí se implementará la vista de detalles de la pregunta
        this.showNotification('Funcionalidad de detalles próximamente', 'info');
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'hace un momento';
        if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async handleVote(voteBtn) {
        if (!voteBtn) return;
        
        const isUpvote = voteBtn.classList.contains('upvote');
        const questionItem = voteBtn.closest('.question-item');
        const voteCount = voteBtn.parentElement.querySelector('.vote-count');
        const questionId = questionItem?.getAttribute('data-question-id');
        
        if (!questionId) {
            console.error('❌ No se encontró ID de pregunta');
            return;
        }

        try {
            // Mostrar estado de carga
            voteBtn.disabled = true;
            voteBtn.classList.add('loading');

            // Determinar tipo de voto
            const voteType = isUpvote ? 'upvote' : 'downvote';
            
            // Llamar a la API
            const response = await window.communityAPI.vote('question', questionId, voteType);
            
            if (response.success) {
                // Actualizar UI basado en la respuesta
                this.updateVoteUI(voteBtn, response.data, voteCount);
                console.log(`✅ Voto ${response.data.action} exitosamente`);
            }
            
        } catch (error) {
            console.error('❌ Error al votar:', error);
            this.showNotification('Error al procesar el voto', 'error');
        } finally {
            // Restaurar estado del botón
            voteBtn.disabled = false;
            voteBtn.classList.remove('loading');
        }
    }

    updateVoteUI(voteBtn, voteData, voteCount) {
        const isUpvote = voteBtn.classList.contains('upvote');
        const oppositeBtn = isUpvote ? 
            voteBtn.parentElement.querySelector('.downvote') : 
            voteBtn.parentElement.querySelector('.upvote');
        
        // Limpiar estados previos
        voteBtn.classList.remove('voted');
        if (oppositeBtn) oppositeBtn.classList.remove('voted');
        
        // Aplicar nuevo estado
        if (voteData.action === 'created' || voteData.action === 'updated') {
            voteBtn.classList.add('voted');
            
            // Actualizar contador (simplificado - en producción deberías obtener el contador real)
            const currentCount = parseInt(voteCount.textContent) || 0;
            if (voteData.vote_type === 'upvote') {
                voteCount.textContent = currentCount + 1;
            } else {
                voteCount.textContent = currentCount - 1;
            }
        } else if (voteData.action === 'removed') {
            // Restaurar contador original
            const currentCount = parseInt(voteCount.textContent) || 0;
            if (isUpvote) {
                voteCount.textContent = currentCount - 1;
            } else {
                voteCount.textContent = currentCount + 1;
            }
        }
    }
    
    
    clearQuestionForm() {
        const titleInput = document.getElementById('questionTitle');
        const contentInput = document.getElementById('questionContent');
        const tagsInput = document.getElementById('questionTags');
        const selectedTags = document.getElementById('selectedTags');
        const charCounter = document.getElementById('titleCharCount');
        
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';
        if (tagsInput) tagsInput.value = '';
        if (selectedTags) selectedTags.innerHTML = '';
        if (charCounter) charCounter.textContent = '0';
        
        this.questionTags = [];
    }
    
    addQuestionTag(tag) {
        if (!tag || this.questionTags.includes(tag)) return;
        
        this.questionTags = this.questionTags || [];
        this.questionTags.push(tag);
        
        const tagsContainer = document.getElementById('selectedTags');
        if (tagsContainer) {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag}
                <button class="tag-remove" onclick="window.chatOnline.removeQuestionTag('${tag}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;
            tagsContainer.appendChild(tagElement);
        }
    }
    
    removeQuestionTag(tag) {
        this.questionTags = this.questionTags.filter(t => t !== tag);
        
        // Actualizar UI
        const tagsContainer = document.getElementById('selectedTags');
        if (tagsContainer) {
            const tagElements = tagsContainer.querySelectorAll('.tag-item');
            tagElements.forEach(element => {
                if (element.textContent.trim().startsWith(tag)) {
                    element.remove();
                }
            });
        }
    }
    
    getSelectedTags() {
        return this.questionTags || [];
    }
    
    showNotification(message, type = 'info') {
        // Crear notificación toast
        const notification = document.createElement('div');
        notification.className = `notification toast ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
        
        // Cerrar manualmente
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => notification.remove());
        }
    }

    // ===== NOTAS =====
    setupNotes() {
        const addNoteBtn = document.getElementById('addNoteBtn');
        const searchNotesBtn = document.getElementById('searchNotesBtn');
        const collapseNotesBtn = document.getElementById('collapseNotes');
        
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => {
                this.addNewNote();
            });
        }
        
        if (searchNotesBtn) {
            searchNotesBtn.addEventListener('click', () => {
                this.searchNotes();
            });
        }
        
        if (collapseNotesBtn) {
            collapseNotesBtn.addEventListener('click', () => {
                this.toggleNotesCollapse();
            });
        }
    }
    
    addNewNote() {
        console.log('📝 Abriendo editor de notas...');
        this.showNotesCreator();
    }
    
    showNotesCreator() {
        const notesCreator = document.getElementById('notesCreatorSection');
        const titleInput = document.getElementById('noteTitleInput');
        const contentEditor = document.getElementById('noteContentEditor');
        const tagsInput = document.getElementById('tagsInput');
        
        // Mostrar el editor y agregar clase active
        notesCreator.style.display = 'block';
        notesCreator.classList.add('active');
        
        // Limpiar campos solo si no estamos editando una nota existente
        if (!this.currentEditingNoteId) {
            titleInput.value = '';
            contentEditor.innerHTML = '';
            tagsInput.value = '';
            this.clearTags();
        }
        
        // Enfocar el título
        titleInput.focus();
        
        console.log('✅ Editor de notas abierto');
    }
    
    hideNotesCreator() {
        const notesCreator = document.getElementById('notesCreatorSection');
        notesCreator.style.display = 'none';
        notesCreator.classList.remove('active');
        
        // Limpiar ID de edición
        this.currentEditingNoteId = null;
        
        console.log('❌ Editor de notas cerrado');
    }
    

    
    saveNote() {
        const titleInput = document.getElementById('noteTitleInput');
        const contentEditor = document.getElementById('noteContentEditor');
        
        const title = titleInput.value.trim();
        const content = contentEditor.innerHTML.trim();
        const tags = this.getTags();
        
        if (!title && !content) {
            alert('Por favor, agrega un título o contenido a la nota antes de guardar.');
            return; // No guardar si no hay contenido
        }
        
        // Crear o actualizar nota
        const note = {
            id: this.currentEditingNoteId || Date.now(),
            title: title || 'Nota sin título',
            content: content || '',
            tags: tags,
            createdAt: this.currentEditingNoteId ? this.getNoteById(this.currentEditingNoteId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Guardar en localStorage
        this.saveNoteToStorage(note);
        
        // Actualizar la lista de notas
        this.loadNotesList();
        
        console.log('💾 Nota guardada:', note);
        
        // NO limpiar ID de edición aquí - solo se limpia cuando se cierra el editor
    }
    
    saveNoteToStorage(note) {
        let notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        
        // Buscar si ya existe una nota con el mismo ID
        const existingIndex = notes.findIndex(n => n.id === note.id);
        
        if (existingIndex >= 0) {
            notes[existingIndex] = note;
            console.log(`📝 Actualizando nota existente ID: ${note.id}`);
        } else {
            notes.push(note);
            console.log(`📝 Creando nueva nota ID: ${note.id}`);
        }
        
        localStorage.setItem('lia_notes', JSON.stringify(notes));
    }
    
    getTags() {
        const tagsList = document.getElementById('tagsList');
        const tagItems = tagsList.querySelectorAll('.tag-item');
        return Array.from(tagItems).map(tag => tag.textContent.replace('×', '').trim());
    }
    
    addTag(tagText) {
        if (!tagText.trim()) return;
        
        const tagsList = document.getElementById('tagsList');
        const existingTags = Array.from(tagsList.querySelectorAll('.tag-item'))
            .map(tag => tag.textContent.replace('×', '').trim());
        
        if (existingTags.includes(tagText.trim())) {
            return; // Evitar duplicados
        }
        
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            ${tagText.trim()}
            <button class="tag-remove" onclick="window.chatOnline.removeTag(this)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        
        tagsList.appendChild(tagElement);
    }
    
    removeTag(button) {
        button.closest('.tag-item').remove();
    }
    
    clearTags() {
        const tagsList = document.getElementById('tagsList');
        tagsList.innerHTML = '';
    }
    
    // ===== CONFIGURACIÓN DEL EDITOR DE NOTAS =====
    setupNotesEditor() {
        // Configurar barra de herramientas
        this.setupToolbar();
        
        // Configurar input de etiquetas
        this.setupTagsInput();
        
        // Configurar botones del editor
        this.setupEditorButtons();
    }
    
    setupToolbar() {
        const boldBtn = document.getElementById('boldBtn');
        const italicBtn = document.getElementById('italicBtn');
        const underlineBtn = document.getElementById('underlineBtn');
        const listBtn = document.getElementById('listBtn');
        const linkBtn = document.getElementById('linkBtn');
        
        // Negrita
        boldBtn.addEventListener('click', () => {
            document.execCommand('bold', false, null);
            this.updateToolbarState();
        });
        
        // Cursiva
        italicBtn.addEventListener('click', () => {
            document.execCommand('italic', false, null);
            this.updateToolbarState();
        });
        
        // Subrayado
        underlineBtn.addEventListener('click', () => {
            document.execCommand('underline', false, null);
            this.updateToolbarState();
        });
        
        // Lista
        listBtn.addEventListener('click', () => {
            document.execCommand('insertUnorderedList', false, null);
            this.updateToolbarState();
        });
        
        // Enlace
        linkBtn.addEventListener('click', () => {
            const url = prompt('Ingresa la URL del enlace:');
            if (url) {
                document.execCommand('createLink', false, url);
            }
            this.updateToolbarState();
        });
        
        // Actualizar estado de la barra de herramientas cuando se selecciona texto
        const contentEditor = document.getElementById('noteContentEditor');
        contentEditor.addEventListener('keyup', () => this.updateToolbarState());
        contentEditor.addEventListener('mouseup', () => this.updateToolbarState());
        contentEditor.addEventListener('input', () => this.updateToolbarState());
    }
    
    updateToolbarState() {
        const boldBtn = document.getElementById('boldBtn');
        const italicBtn = document.getElementById('italicBtn');
        const underlineBtn = document.getElementById('underlineBtn');
        
        // Actualizar estado de los botones
        boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
    }
    
    setupTagsInput() {
        const tagsInput = document.getElementById('tagsInput');
        
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tagText = tagsInput.value.trim();
                if (tagText) {
                    this.addTag(tagText);
                    tagsInput.value = '';
                }
            }
        });
        
        // Permitir agregar etiquetas con coma
        tagsInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.includes(',')) {
                const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                tags.forEach(tag => this.addTag(tag));
                tagsInput.value = '';
            }
        });
    }
    
    setupEditorButtons() {
        const saveBtn = document.getElementById('saveNoteBtn');
        const cancelBtn = document.getElementById('cancelNoteBtn');
         const exportPdfBtn = document.getElementById('exportPdfBtn');
        
        // Guardar nota
        saveBtn.addEventListener('click', () => {
            this.saveNote();
            this.hideNotesCreator();
        });
        
        // Cancelar
        cancelBtn.addEventListener('click', () => {
            this.hideNotesCreator();
        });
        
        // Exportar a PDF
        exportPdfBtn.addEventListener('click', () => {
            this.exportNoteToPDF();
        });
        
        // Configurar selector de tamaño de fuente
        this.setupFontSizeSelector();
    }
    
    setupFontSizeSelector() {
        const fontSizeBtn = document.getElementById('fontSizeBtn');
        const fontSizeDropdown = document.getElementById('fontSizeDropdown');
        const fontSizeOptions = document.querySelectorAll('.font-size-option');
        const fontSizeText = document.querySelector('.font-size-text');
        const editor = document.getElementById('noteContentEditor');
        
        // Toggle dropdown
        fontSizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Actualizar el tamaño mostrado basado en la selección actual o cursor
            this.updateFontSizeDisplay();
            
            fontSizeDropdown.classList.toggle('show');
        });
        
        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', () => {
            fontSizeDropdown.classList.remove('show');
        });
        
        // Manejar selección de tamaño
        fontSizeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const size = option.dataset.size;
                this.changeFontSize(size);
                
                // No actualizar el display aquí, se hará en changeFontSize si es exitoso
                fontSizeDropdown.classList.remove('show');
            });
        });
        
        // Actualizar display cuando cambie la selección
        editor.addEventListener('mouseup', () => {
            setTimeout(() => this.updateFontSizeDisplay(), 10);
        });
        
        editor.addEventListener('keyup', () => {
            setTimeout(() => this.updateFontSizeDisplay(), 10);
        });
    }
    
    updateFontSizeDisplay() {
        const selection = window.getSelection();
        const fontSizeText = document.querySelector('.font-size-text');
        const fontSizeOptions = document.querySelectorAll('.font-size-option');
        const editor = document.getElementById('noteContentEditor');
        
        let fontSize = 14; // Tamaño por defecto
        
        try {
            if (selection.rangeCount > 0 && !selection.isCollapsed) {
                // Hay texto seleccionado - obtener su tamaño
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
                const computedStyle = window.getComputedStyle(element);
                fontSize = parseInt(computedStyle.fontSize);
            } else {
                // No hay selección - obtener tamaño en la posición del cursor
                const currentFontSize = this.getCurrentCursorFontSize();
                fontSize = currentFontSize || 14;
            }
            
            // Actualizar display
            fontSizeText.textContent = fontSize.toString();
            
            // Actualizar estado activo de las opciones
            fontSizeOptions.forEach(opt => {
                opt.classList.toggle('active', opt.dataset.size === fontSize.toString());
            });
            
        } catch (error) {
            // En caso de error, mostrar tamaño por defecto
            fontSizeText.textContent = '14';
            fontSizeOptions.forEach(opt => opt.classList.remove('active'));
        }
    }
    
    getCurrentCursorFontSize() {
        const selection = window.getSelection();
        const editor = document.getElementById('noteContentEditor');
        
        if (!selection.rangeCount) return 14;
        
        try {
            const range = selection.getRangeAt(0);
            let element = range.startContainer;
            
            // Si es un nodo de texto, obtener su elemento padre
            if (element.nodeType === Node.TEXT_NODE) {
                element = element.parentElement;
            }
            
            // Asegurar que estamos dentro del editor
            if (!editor.contains(element)) {
                element = editor;
            }
            
            // Obtener el tamaño de fuente computado
            const computedStyle = window.getComputedStyle(element);
            return parseInt(computedStyle.fontSize);
            
        } catch (error) {
            return 14;
        }
    }
    
    changeFontSize(size) {
        const editor = document.getElementById('noteContentEditor');
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            // CASO 1: Hay texto seleccionado - cambiar tamaño de la selección
            this.changeFontSizeForSelection(size);
        } else {
            // CASO 2: No hay selección - cambiar tamaño para texto nuevo
            this.setFontSizeForNewText(size);
        }
        
        // Actualizar el display del tamaño
        setTimeout(() => this.updateFontSizeDisplay(), 10);
        
        // Mantener el foco en el editor
        editor.focus();
    }
    
    changeFontSizeForSelection(size) {
        const editor = document.getElementById('noteContentEditor');
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Verificar que la selección está dentro del editor
        if (!editor.contains(range.commonAncestorContainer)) {
            this.showNotification('Selecciona texto dentro del editor de notas', 'warning');
            return;
        }
        
        try {
            // Método más robusto para aplicar tamaño de fuente
            const selectedText = range.extractContents();
            const span = document.createElement('span');
            span.style.fontSize = size + 'px';
            span.style.display = 'inline';
            span.appendChild(selectedText);
            range.insertNode(span);
            
            // Restaurar la selección en el nuevo span
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            console.log(`✅ Tamaño de selección cambiado a ${size}px`);
            this.showNotification(`Tamaño de selección cambiado a ${size}px`, 'success');
            
        } catch (error) {
            console.error('❌ Error al cambiar tamaño de selección:', error);
            
            // Método alternativo usando execCommand
            try {
                const tempSize = Math.floor(Math.random() * 1000) + 1000;
                document.execCommand('fontSize', false, tempSize);
                
                const fontElements = editor.querySelectorAll(`font[size="${tempSize}"]`);
                fontElements.forEach(font => {
                    const span = document.createElement('span');
                    span.style.fontSize = size + 'px';
                    span.style.display = 'inline';
                    span.innerHTML = font.innerHTML;
                    font.parentNode.replaceChild(span, font);
                });
                
                console.log(`✅ Tamaño de selección cambiado a ${size}px (método alternativo)`);
                this.showNotification(`Tamaño de selección cambiado a ${size}px`, 'success');
                
            } catch (fallbackError) {
                console.error('❌ Error en método alternativo:', fallbackError);
                this.showNotification('Error al cambiar el tamaño de fuente', 'error');
            }
        }
    }
    
    setFontSizeForNewText(size) {
        const editor = document.getElementById('noteContentEditor');
        const selection = window.getSelection();
        
        try {
            // Crear un span invisible en la posición del cursor para establecer el tamaño
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : document.createRange();
            
            // Si no hay rango, crear uno al final del editor
            if (!selection.rangeCount) {
                range.selectNodeContents(editor);
                range.collapse(false);
            }
            
            // Insertar un span con el nuevo tamaño de fuente
            const span = document.createElement('span');
            span.style.fontSize = size + 'px';
            span.style.display = 'inline';
            span.appendChild(document.createTextNode('\u200B')); // Carácter de ancho cero
            
            range.insertNode(span);
            
            // Posicionar el cursor después del span
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Configurar el estilo para el próximo texto
            this.setNextTextStyle(size);
            
            console.log(`✅ Tamaño para texto nuevo establecido a ${size}px`);
            this.showNotification(`Tamaño para texto nuevo: ${size}px`, 'success');
            
        } catch (error) {
            console.error('❌ Error al establecer tamaño para texto nuevo:', error);
            this.showNotification('Error al establecer el tamaño de fuente', 'error');
        }
    }
    
    setNextTextStyle(size) {
        const editor = document.getElementById('noteContentEditor');
        
        // Usar execCommand para establecer el tamaño para el próximo texto
        try {
            // Crear un estilo temporal
            const tempSize = '7'; // Tamaño temporal para execCommand
            document.execCommand('fontSize', false, tempSize);
            
            // Buscar y actualizar inmediatamente
            setTimeout(() => {
                const fontElements = editor.querySelectorAll(`font[size="${tempSize}"]`);
                fontElements.forEach(font => {
                    const span = document.createElement('span');
                    span.style.fontSize = size + 'px';
                    span.style.display = 'inline';
                    span.innerHTML = font.innerHTML;
                    font.parentNode.replaceChild(span, font);
                });
            }, 10);
            
        } catch (error) {
            console.error('❌ Error al establecer estilo para próximo texto:', error);
        }
    }
    
    async exportNoteToPDF() {
        const titleInput = document.getElementById('noteTitleInput');
        const contentEditor = document.getElementById('noteContentEditor');
        
        const title = titleInput.value || 'Nota sin título';
        const content = contentEditor.innerHTML;
        
        if (!content.trim()) {
            alert('No hay contenido para exportar');
            return;
        }
        
        try {
            // Crear un elemento temporal para el PDF
            const printContent = document.createElement('div');
            printContent.innerHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #44E5FF; border-bottom: 2px solid #44E5FF; padding-bottom: 10px;">${title}</h1>
                    <div style="margin-top: 20px; line-height: 1.6;">${content}</div>
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
                        <p>Generado por Aprende y Aplica - ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            `;
            
            // Abrir ventana de impresión
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // Esperar un momento y luego mostrar diálogo de impresión
            setTimeout(() => {
                printWindow.print();
            }, 250);
            
            console.log('✅ PDF exportado correctamente');
            
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
            alert('Error al exportar a PDF. Por favor, intenta de nuevo.');
        }
    }
    
    searchNotes() {
        console.log('🔍 Activando búsqueda de notas...');
        this.toggleSearchMode();
    }
    
    toggleSearchMode() {
        const notesList = document.getElementById('notesList');
        const searchBtn = document.getElementById('searchNotesBtn');
        
        if (this.isSearchMode) {
            // Desactivar modo búsqueda
            this.isSearchMode = false;
            this.loadNotesList(); // Cargar todas las notas
            searchBtn.title = 'Buscar Notas';
            console.log('🔍 Modo búsqueda desactivado');
        } else {
            // Activar modo búsqueda
            this.isSearchMode = true;
            this.showSearchInput();
            searchBtn.title = 'Cancelar Búsqueda';
            console.log('🔍 Modo búsqueda activado');
        }
    }
    
    showSearchInput() {
        const notesList = document.getElementById('notesList');
        
        // Crear el input de búsqueda
        const searchHTML = `
            <div class="search-container">
                <div class="search-input-wrapper">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input type="text" id="noteSearchInput" placeholder="Buscar en notas..." class="search-input">
                    <button class="search-clear-btn" id="searchClearBtn" style="display: none;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="search-results" id="searchResults"></div>
            </div>
        `;
        
        notesList.innerHTML = searchHTML;
        
        // Configurar el input de búsqueda
        this.setupSearchInput();
    }
    
    setupSearchInput() {
        const searchInput = document.getElementById('noteSearchInput');
        const clearBtn = document.getElementById('searchClearBtn');
        
        // Event listener para búsqueda en tiempo real
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            this.performSearch(query);
            
            // Mostrar/ocultar botón de limpiar
            if (query.length > 0) {
                clearBtn.style.display = 'flex';
            } else {
                clearBtn.style.display = 'none';
            }
        });
        
        // Event listener para botón de limpiar
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            this.performSearch('');
        });
        
        // Enfocar el input
        searchInput.focus();
    }
    
    performSearch(query) {
        const searchResults = document.getElementById('searchResults');
        const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        
        if (!query) {
            // Si no hay query, mostrar todas las notas
            this.displaySearchResults(notes);
            return;
        }
        
        // Filtrar notas que coincidan con la búsqueda
        const filteredNotes = notes.filter(note => {
            const title = note.title.toLowerCase();
            const content = this.stripHTML(note.content).toLowerCase();
            const tags = note.tags.join(' ').toLowerCase();
            
            return title.includes(query) || 
                   content.includes(query) || 
                   tags.includes(query);
        });
        
        this.displaySearchResults(filteredNotes);
        
        console.log(`🔍 Búsqueda: "${query}" - ${filteredNotes.length} resultados`);
    }
    
    displaySearchResults(notes) {
        const searchResults = document.getElementById('searchResults');
        
        if (notes.length === 0) {
            searchResults.innerHTML = `
                <div class="no-search-results">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <p>No se encontraron notas</p>
                    <span>Intenta con otros términos de búsqueda</span>
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha de actualización (más recientes primero)
        const sortedNotes = notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        searchResults.innerHTML = sortedNotes.map(note => this.createNoteHTML(note)).join('');
        
        // Agregar event listeners a las notas encontradas
        this.setupNoteClickListeners();
    }
    
    toggleNotesCollapse() {
        const notesList = document.getElementById('notesList');
        const collapseBtn = document.getElementById('collapseNotes');
        const icon = collapseBtn.querySelector('i');
        
        if (notesList) {
            notesList.style.display = notesList.style.display === 'none' ? 'block' : 'none';
            icon.className = notesList.style.display === 'none' ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
        }
    }
    
    // ===== MATERIALES =====
    setupMaterials() {
        const collapseMaterialsBtn = document.getElementById('collapseMaterialsBtn');
        
        if (collapseMaterialsBtn) {
            collapseMaterialsBtn.addEventListener('click', () => {
                console.log('📦 Colapsando materiales del curso...');
                this.toggleMaterialsCollapse();
            });
        }
    }
    
    toggleMaterialsCollapse() {
        const materialsSection = document.querySelector('.course-materials-section');
        const modulesList = document.querySelector('.modules-list');
        const collapseBtn = document.getElementById('collapseMaterialsBtn');
        const icon = collapseBtn.querySelector('svg');
        
        if (materialsSection && modulesList) {
            const isCollapsed = modulesList.style.opacity === '0' || modulesList.style.visibility === 'hidden';
            
            if (isCollapsed) {
                // Expandir
                modulesList.style.opacity = '1';
                modulesList.style.visibility = 'visible';
                modulesList.style.display = 'flex';
                materialsSection.style.flex = '1';
                icon.innerHTML = '<polyline points="6,9 12,15 18,9"/>';
                collapseBtn.title = 'Colapsar Materiales';
                console.log('📤 Materiales expandidos');
        } else {
                // Colapsar
                modulesList.style.opacity = '0';
                modulesList.style.visibility = 'hidden';
                setTimeout(() => {
                    modulesList.style.display = 'none';
                }, 300);
                materialsSection.style.flex = '0 0 auto';
                icon.innerHTML = '<polyline points="6,15 12,9 18,15"/>';
                collapseBtn.title = 'Expandir Materiales';
                console.log('📦 Materiales colapsados');
            }
        }
    }
    
    // ===== RESPONSIVE =====
    setupResponsive() {
        this.checkScreenSize();
    }
    
    setupResponsiveListeners() {
        window.addEventListener('resize', () => {
            this.checkScreenSize();
        });
    }
    
    // ===== PROGRESS MANAGER =====
    async initializeProgressManager() {
        try {
            console.log('📊 Inicializando Progress Manager...');
            
            // Intentar múltiples estrategias para obtener el progress manager
            let manager = null;
            
            // Estrategia 1: Verificar si ya está disponible
            if (window.courseProgressManager && typeof window.courseProgressManager.getCourseProgress === 'function') {
                console.log('✅ CourseProgressManager ya disponible');
                manager = window.courseProgressManager;
            } 
            // Estrategia 2: Esperar con timeout
            else {
                console.log('⏳ Esperando CourseProgressManager...');
                manager = await this.waitForProgressManager();
            }
            
            // Estrategia 3: Si aún no está disponible, crear uno básico
            if (!manager || typeof manager.getCourseProgress !== 'function') {
                console.warn('⚠️ CreatingFallback Progress Manager');
                manager = this.createFallbackProgressManager();
            }
            
            this.progressManager = manager;
            
            // Validar que el manager es funcional antes de usarlo
            if (this.progressManager && typeof this.progressManager.getCourseProgress === 'function') {
                // Obtener progreso inicial
                console.log('📊 Obteniendo progreso inicial...');
                this.courseProgress = await this.progressManager.getCourseProgress();
                console.log('📊 Progreso obtenido:', this.courseProgress);
                
                // Actualizar UI con el progreso actual
                this.updateProgressUI();
                
                console.log('✅ Progress Manager inicializado exitosamente');
            } else {
                throw new Error('Progress Manager no es funcional');
            }
            
        } catch (error) {
            console.error('❌ Error inicializando Progress Manager:', error);
            console.error('📊 Stack trace:', error.stack);
            
            // Crear un manager de fallback que no cause errores
            this.progressManager = this.createFallbackProgressManager();
            this.courseProgress = {
                overall_progress_percentage: 0,
                modules: [],
                status: 'fallback'
            };
            
            console.log('🔄 Usando Progress Manager de fallback');
        }
    }
    
    waitForProgressManager() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 segundos con intervalos de 100ms
            
            const checkInterval = setInterval(() => {
                attempts++;
                
                // Verificar múltiples condiciones
                if (window.courseProgressManager && typeof window.courseProgressManager.getCourseProgress === 'function') {
                    console.log(`✅ Progress Manager encontrado después de ${attempts} intentos`);
                    clearInterval(checkInterval);
                    resolve(window.courseProgressManager);
                    return;
                }
                
                // También escuchar el evento de inicialización
                const onReady = (event) => {
                    console.log('📡 Evento courseProgressManagerReady recibido');
                    window.removeEventListener('courseProgressManagerReady', onReady);
                    clearInterval(checkInterval);
                    resolve(event.detail.manager);
                };
                
                if (attempts === 1) { // Solo agregar el listener una vez
                    window.addEventListener('courseProgressManagerReady', onReady);
                }
                
                // Timeout después de maxAttempts
                if (attempts >= maxAttempts) {
                    console.warn(`⚠️ Timeout esperando CourseProgressManager después de ${attempts} intentos`);
                    clearInterval(checkInterval);
                    window.removeEventListener('courseProgressManagerReady', onReady);
                    resolve(null); // Devolver null para que se cree un fallback
                }
            }, 100);
        });
    }
    
    createFallbackProgressManager() {
        console.log('🔄 Creando Progress Manager de fallback...');
        
        // Crear manager básico que no cause errores
        return {
            getCourseProgress: async (forceRefresh = false) => {
                console.log('📦 Usando progreso de fallback local');
                return {
                    course_progress_id: 'fallback-progress',
                    user_id: 'demo-user',
                    course_identifier: 'intro-to-ai',
                    overall_progress_percentage: 0,
                    status: 'in_progress',
                    started_at: new Date().toISOString(),
                    current_module: 1,
                    modules: [
                        {
                            module_number: 1,
                            module_name: '¿Qué es la IA?',
                            status: 'in_progress',
                            progress_percentage: 0,
                            video_id: 'Yy_eZ65jzmo'
                        },
                        {
                            module_number: 2,
                            module_name: 'Historia de la IA',
                            status: 'locked',
                            progress_percentage: 0,
                            video_id: 'dhsy6epaJGs'
                        },
                        {
                            module_number: 3,
                            module_name: 'Fundamentos del ML',
                            status: 'locked',
                            progress_percentage: 0,
                            video_id: 'DvyOm9HeT-k'
                        },
                        {
                            module_number: 4,
                            module_name: 'Redes Neuronales',
                            status: 'locked',
                            progress_percentage: 0,
                            video_id: 'oiKj0Z_Xnjc'
                        },
                        {
                            module_number: 5,
                            module_name: 'Aplicaciones Prácticas',
                            status: 'locked',
                            progress_percentage: 0,
                            video_id: 'HMoaRIbOaN0'
                        }
                    ],
                    total_modules: 5,
                    completed_modules: 0,
                    current_module: 1,
                    total_time_spent: 0
                };
            },
            
            updateModuleProgress: async (moduleNumber, updates = {}) => {
                console.log(`📝 Fallback: Actualizando módulo ${moduleNumber}`, updates);
                return Promise.resolve({ success: true });
            },
            
            updateVideoProgress: async (moduleNumber, videoUpdates = {}) => {
                console.log(`🎥 Fallback: Actualizando video ${moduleNumber}`, videoUpdates);
                return Promise.resolve({ success: true });
            },
            
            completeModule: async (moduleNumber) => {
                console.log(`🎯 Fallback: Completando módulo ${moduleNumber}`);
                return Promise.resolve({ success: true });
            },
            
            startModule: async (moduleNumber) => {
                console.log(`▶️ Fallback: Iniciando módulo ${moduleNumber}`);
                return Promise.resolve({ success: true });
            },
            
            getModuleProgress: (moduleNumber) => {
                return null;
            },
            
            isModuleCompleted: (moduleNumber) => false,
            isModuleLocked: (moduleNumber) => moduleNumber > 1
        };
    }
    
    // ===== YOUTUBE PROGRESS TRACKER =====
    async initializeYouTubeTracker() {
        try {
            console.log('🎥 Inicializando YouTube Progress Tracker...');
            
            // Esperar a que ambos componentes estén listos
            await this.waitForComponents();
            
            // Verificar si YouTube Progress Tracker está disponible
            if (typeof window.YouTubeProgressTracker === 'undefined') {
                console.warn('⚠️ YouTubeProgressTracker no disponible, saltando inicialización');
                return;
            }
            
            // Verificar que tenemos un progress manager
            if (!this.progressManager) {
                console.warn('⚠️ Progress Manager no disponible, usando tracker básico');
                this.youtubeTracker = new window.YouTubeProgressTracker(null);
            } else {
                this.youtubeTracker = new window.YouTubeProgressTracker(this.progressManager);
            }
            
            // Configurar eventos del tracker
            this.setupYouTubeEvents();
            
            // Inicializar con el video actual si hay datos de progreso
            if (this.courseProgress && this.courseProgress.modules && this.courseProgress.current_module) {
                const currentModule = this.courseProgress.modules.find(m => m.module_number === this.courseProgress.current_module);
                if (currentModule && currentModule.video_id) {
                    console.log(`🎥 Inicializando player con video: ${currentModule.video_id} (Módulo ${currentModule.module_number})`);
                    
                    // Esperar un momento para que el DOM esté listo
                    setTimeout(() => {
                        this.youtubeTracker.initializePlayer(
                            'youtubePlayer',
                            currentModule.video_id,
                            currentModule.module_number
                        );
                    }, 1000);
                }
            }
            
            console.log('✅ YouTube Progress Tracker inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando YouTube Progress Tracker:', error);
            this.youtubeTracker = null;
        }
    }

    // =====================================================
    // SISTEMA DE COMUNIDAD
    // =====================================================

    async initializeCommunitySystem() {
        try {
            console.log('🏘️ Inicializando sistema de comunidad...');
            
            // Esperar a que el progress manager esté listo
            if (this.progressManager && this.courseProgress) {
                console.log('📊 Progress manager ya está listo, usando datos reales');
            } else {
                console.log('⏳ Esperando a que el progress manager esté listo...');
                // Esperar un poco más para que el progress manager se inicialice
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Inicializar CommunityDatabase si está disponible
            if (window.CommunityDatabase) {
                this.communityDB = new window.CommunityDatabase();
                await this.communityDB.initialize();
                console.log('✅ CommunityDatabase inicializado');
            } else {
                console.warn('⚠️ CommunityDatabase no disponible, usando API directa');
            }
            
            // Cargar preguntas existentes
            await this.loadCommunityQuestions();
            
            console.log('✅ Sistema de comunidad inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de comunidad:', error);
        }
    }

    setupCommunityEvents() {
        console.log('🔧 Configurando eventos de comunidad...');
        
        // Botón para hacer pregunta
        const askQuestionBtn = document.getElementById('askQuestionBtn');
        if (askQuestionBtn) {
            askQuestionBtn.addEventListener('click', () => {
                this.showQuestionModal();
            });
        }

        // Modal de pregunta
        const questionModal = document.getElementById('questionModal');
        if (questionModal) {
            // Botón cerrar modal
            const closeBtn = document.getElementById('closeQuestionModal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideQuestionModal();
                });
            }

            // Botón cancelar
            const cancelBtn = document.getElementById('cancelQuestionBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.hideQuestionModal();
                });
            }

            // Formulario de pregunta
            const questionForm = document.getElementById('questionForm');
            if (questionForm) {
                questionForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.submitQuestion();
                });
            }

            // Contador de caracteres para el título
            const titleInput = document.getElementById('questionTitle');
            const charCount = document.getElementById('titleCharCount');
            if (titleInput && charCount) {
                titleInput.addEventListener('input', () => {
                    charCount.textContent = titleInput.value.length;
                });
            }
        }

        // Filtros de comunidad
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.dataset.filter;
                this.filterQuestions(filter);
            });
        });

        // Ordenamiento
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortQuestions(sortSelect.value);
            });
        }

        console.log('✅ Eventos de comunidad configurados');
    }

    showQuestionModal() {
        console.log('📝 Mostrando modal de pregunta...');
        const modal = document.getElementById('questionModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Limpiar formulario
            const form = document.getElementById('questionForm');
            if (form) {
                form.reset();
                document.getElementById('titleCharCount').textContent = '0';
            }
            
            console.log('✅ Modal de pregunta mostrado');
        } else {
            console.error('❌ Modal de pregunta no encontrado');
        }
    }

    hideQuestionModal() {
        console.log('❌ Ocultando modal de pregunta...');
        const modal = document.getElementById('questionModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            console.log('✅ Modal de pregunta ocultado');
        }
    }

    async submitQuestion() {
        try {
            console.log('📤 Enviando pregunta...');
            
            const titleInput = document.getElementById('questionTitle');
            const contentInput = document.getElementById('questionContent');
            const tagsInput = document.getElementById('questionTags');
            
            if (!titleInput || !contentInput) {
                console.error('❌ Campos de formulario no encontrados');
                this.showNotification('Error: Campos de formulario no encontrados', 'error');
                return;
            }
            
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();
            const tags = this.getSelectedTags() || [];
            
            // Validación más específica
            if (!title || title.length < 5) {
                this.showNotification('El título debe tener al menos 5 caracteres', 'error');
                return;
            }
            
            if (!content || content.length < 10) {
                this.showNotification('El contenido debe tener al menos 10 caracteres', 'error');
                return;
            }
            
            // Mostrar indicador de carga
            const submitBtn = document.getElementById('submitQuestionBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loading-spinner"></div> Enviando...';
            submitBtn.disabled = true;
            
            // Obtener datos reales de la sesión
            const currentUser = this.obtenerUsuarioActual();
            const currentCourseId = this.getCurrentCourseId();
            const currentModuleId = this.getCurrentModuleId();
            
            console.log('👤 Usuario actual:', currentUser);
            console.log('📚 Curso actual:', currentCourseId);
            console.log('📖 Módulo actual:', currentModuleId);
            
            // Validar datos críticos
            if (!currentUser || !currentUser.id) {
                throw new Error('Usuario no identificado. Por favor recarga la página.');
            }
            
            if (!currentCourseId) {
                throw new Error('Curso no identificado. Por favor recarga la página.');
            }
            
            // Preparar datos de la pregunta con validación
            const questionData = {
                title: title,
                content: content,
                tags: tags && tags.length > 0 ? tags : [],
                course_id: currentCourseId,
                module_id: currentModuleId || `module-${this.currentModule}`,
                user_id: currentUser.id
            };
            
            console.log('📝 Datos de la pregunta:', questionData);
            
            // Usar siempre la API directa para mayor control
            const result = await this.createQuestionViaAPI(questionData);
            
            if (result) {
                console.log('✅ Pregunta creada exitosamente:', result);
                
                // Limpiar formulario
                this.clearQuestionForm();
                
                // Cerrar modal
                this.hideQuestionModal();
                
                // Recargar preguntas
                await this.loadCommunityQuestions();
                
                // Mostrar mensaje de éxito
                this.showNotification('Pregunta publicada exitosamente', 'success');
                
            } else {
                throw new Error('No se pudo crear la pregunta');
            }
            
        } catch (error) {
            console.error('❌ Error enviando pregunta:', error);
            const errorMessage = error.message || 'Error al publicar la pregunta. Inténtalo de nuevo.';
            this.showNotification(errorMessage, 'error');
        } finally {
            // Restaurar botón
            const submitBtn = document.getElementById('submitQuestionBtn');
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    async createQuestionViaAPI(questionData) {
        try {
            console.log('🌐 Enviando pregunta vía API...');
            console.log('📊 Datos enviados:', questionData);
            
            const response = await fetch('/api/community/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'X-User-Id': questionData.user_id
                },
                body: JSON.stringify(questionData)
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
            
            // Obtener el texto de la respuesta primero
            const responseText = await response.text();
            console.log('📄 Response text:', responseText);
            
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    // Si no es JSON válido, usar el mensaje HTTP por defecto
                }
                throw new Error(errorMessage);
            }
            
            // Intentar parsear como JSON
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('❌ Error parseando JSON:', e);
                throw new Error('Respuesta del servidor no válida');
            }
            
            console.log('✅ Pregunta creada vía API:', result);
            return result.data || result;
            
        } catch (error) {
            console.error('❌ Error en API:', error);
            throw error;
        }
    }

    async loadCommunityQuestions() {
        try {
            console.log('📋 Cargando preguntas de la comunidad...');
            
            // Mostrar indicador de carga
            const questionsList = document.getElementById('questionsList');
            if (questionsList) {
                questionsList.innerHTML = '<div class="loading-questions"><div class="loading-spinner"></div><span>Cargando preguntas...</span></div>';
            }
            
            // Obtener preguntas
            let questions = [];
            if (this.communityDB) {
                questions = await this.communityDB.getQuestions({
                    course_id: this.currentCourseId,
                    module_id: `module-${this.currentModule}`
                });
            } else {
                questions = await this.getQuestionsViaAPI();
            }
            
            console.log(`✅ ${questions.length} preguntas cargadas`);
            
            // Renderizar preguntas
            this.renderQuestions(questions);
            
        } catch (error) {
            console.error('❌ Error cargando preguntas:', error);
            const questionsList = document.getElementById('questionsList');
            if (questionsList) {
                questionsList.innerHTML = '<div class="error-message">Error al cargar las preguntas. Inténtalo de nuevo.</div>';
            }
        }
    }

    async getQuestionsViaAPI() {
        try {
            const response = await fetch(`/api/community/questions?course_id=${this.currentCourseId}&module_id=module-${this.currentModule}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.data || [];
            
        } catch (error) {
            console.error('❌ Error obteniendo preguntas vía API:', error);
            return [];
        }
    }

    renderQuestions(questions) {
        const questionsList = document.getElementById('questionsList');
        if (!questionsList) {
            console.error('❌ Lista de preguntas no encontrada');
            return;
        }
        
        if (!questions || questions.length === 0) {
            questionsList.innerHTML = `
                <div class="empty-questions">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                    <h3>No hay preguntas aún</h3>
                    <p>Sé el primero en hacer una pregunta sobre este módulo</p>
                    <button class="btn-primary" onclick="window.showQuestionModal()">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Hacer Primera Pregunta
                    </button>
                </div>
            `;
            return;
        }
        
        const questionsHTML = questions.map(question => this.renderQuestionItem(question)).join('');
        questionsList.innerHTML = questionsHTML;
        
        console.log(`✅ ${questions.length} preguntas renderizadas`);
    }

    renderQuestionItem(question) {
        const timeAgo = this.formatTimeAgo(question.created_at);
        const tags = question.tags || [];
        const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        return `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-votes">
                    <button class="vote-btn upvote" onclick="window.chatOnline.voteQuestion('${question.id}', 'upvote')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 15l-6-6-6 6"/>
                        </svg>
                    </button>
                    <span class="vote-count">${question.votes_count || 0}</span>
                    <button class="vote-btn downvote" onclick="window.chatOnline.voteQuestion('${question.id}', 'downvote')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </button>
                </div>
                <div class="question-content">
                    <div class="question-header">
                        <h4 class="question-title">${this.escapeHtml(question.title)}</h4>
                        <div class="question-meta">
                            <span class="question-author">
                                <img src="${question.users?.avatar_url || '../../assets/images/default-avatar.svg'}" alt="Usuario" class="author-avatar">
                                ${this.escapeHtml(question.users?.name || 'Usuario')}
                            </span>
                            <span class="question-time">${timeAgo}</span>
                            <span class="question-module">Módulo ${this.currentModule}</span>
                        </div>
                    </div>
                    <div class="question-preview">
                        <p>${this.escapeHtml(question.content.substring(0, 200))}${question.content.length > 200 ? '...' : ''}</p>
                    </div>
                    <div class="question-tags">
                        ${tagsHTML}
                        <span class="tag module-tag">módulo-${this.currentModule}</span>
                    </div>
                    <div class="question-stats">
                        <span class="stat">
                            <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            ${question.answers_count || 0} respuesta${(question.answers_count || 0) !== 1 ? 's' : ''}
                        </span>
                        <span class="stat">
                            <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            ${question.views_count || 0} vista${(question.views_count || 0) !== 1 ? 's' : ''}
                        </span>
                        ${question.is_answered ? '<span class="stat answered"><svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>Respondida</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    async voteQuestion(questionId, voteType) {
        try {
            console.log(`🗳️ Votando ${voteType} en pregunta ${questionId}`);
            
            const voteData = {
                user_id: this.currentUser.id,
                target_type: 'question',
                target_id: questionId,
                vote_type: voteType
            };
            
            const response = await fetch('/api/community/votes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(voteData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ Voto procesado:', result);
            
            // Recargar preguntas para actualizar contadores
            await this.loadCommunityQuestions();
            
        } catch (error) {
            console.error('❌ Error votando:', error);
            this.showNotification('Error al procesar el voto', 'error');
        }
    }

    filterQuestions(filter) {
        console.log(`🔍 Filtrando preguntas por: ${filter}`);
        
        // Actualizar botones activos
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
        
        // TODO: Implementar filtrado real cuando se conecte con la API
        // Por ahora solo recargamos todas las preguntas
        this.loadCommunityQuestions();
    }

    sortQuestions(sort) {
        console.log(`📊 Ordenando preguntas por: ${sort}`);
        
        // TODO: Implementar ordenamiento real cuando se conecte con la API
        // Por ahora solo recargamos todas las preguntas
        this.loadCommunityQuestions();
    }

    formatTimeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'hace un momento';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `hace ${days} día${days > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getAuthToken() {
        // Intentar obtener token real
        const token = localStorage.getItem('authToken');
        if (token && token !== 'null' && token !== 'undefined') {
            console.log('🔑 Usando token real:', token.substring(0, 20) + '...');
            return token;
        }
        
        // Obtener usuario actual para generar token consistente
        const currentUser = this.obtenerUsuarioActual();
        const userId = currentUser?.id || 'anonymous';
        
        // Token de desarrollo para testing con ID de usuario
        const devToken = `dev-token-${userId}-${Date.now()}`;
        console.log('🔧 Usando token de desarrollo:', devToken);
        return devToken;
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Agregar estilos si no existen
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    padding: 12px 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    max-width: 400px;
                    animation: slideIn 0.3s ease-out;
                }
                .notification-success { background: #10b981; color: white; }
                .notification-error { background: #ef4444; color: white; }
                .notification-info { background: #3b82f6; color: white; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Esperar a que los componentes estén listos
    async waitForComponents() {
        return new Promise((resolve) => {
            const checkComponents = () => {
                if (typeof window.YouTubeProgressTracker !== 'undefined' && 
                    typeof window.CourseProgressManager !== 'undefined') {
                    console.log('✅ Todos los componentes están disponibles');
                    resolve();
                    return;
                }
                
                console.log('⏳ Esperando componentes...', {
                    YouTubeProgressTracker: typeof window.YouTubeProgressTracker,
                    CourseProgressManager: typeof window.CourseProgressManager
                });
                
                setTimeout(checkComponents, 100);
            };
            
            checkComponents();
        });
    }
    
    setupYouTubeEvents() {
        // Escuchar eventos del tracker
        window.addEventListener('moduleCompleted', (event) => {
            console.log('🎯 Módulo completado:', event.detail);
            this.handleModuleCompleted(event.detail.moduleNumber);
        });
        
        window.addEventListener('moduleUnlocked', (event) => {
            console.log('🔓 Módulo desbloqueado:', event.detail);
            this.handleModuleUnlocked(event.detail.unlockedModule);
        });
    }
    
    handleModuleCompleted(moduleNumber) {
        console.log(`🎉 Manejando completación del módulo ${moduleNumber}`);
        
        // Actualizar UI de progreso
        this.updateProgressUI();
        
        // Actualizar estado del módulo en la lista
        this.updateModuleStatus(moduleNumber, 'completed');
        
        // Auto-seleccionar siguiente módulo si está disponible
        const nextModule = moduleNumber + 1;
        if (this.courseProgress && this.courseProgress.modules) {
            const nextModuleData = this.courseProgress.modules.find(m => m.module_number === nextModule);
            if (nextModuleData && nextModuleData.status !== 'locked') {
                setTimeout(() => {
                    console.log(`🔄 Auto-seleccionando módulo ${nextModule}`);
                    this.selectModule(nextModule);
                }, 2000);
            }
        }
    }
    
    handleModuleUnlocked(moduleNumber) {
        console.log(`🔓 Manejando desbloqueo del módulo ${moduleNumber}`);
        
        // Actualizar estado del módulo desbloqueado
        this.updateModuleStatus(moduleNumber, 'not_started');
        
        // Actualizar UI
        this.updateProgressUI();
    }
    
    updateModuleStatus(moduleNumber, status) {
        // Actualizar en los datos locales
        if (this.courseProgress && this.courseProgress.modules) {
            const module = this.courseProgress.modules.find(m => m.module_number === moduleNumber);
            if (module) {
                module.status = status;
                if (status === 'completed') {
                    module.progress_percentage = 100;
                    module.video_completed = true;
                    module.video_progress_percentage = 100;
                }
            }
        }
        
        // Actualizar en la UI
        const moduleElement = document.querySelector(`[data-module="${moduleNumber}"]`);
        if (moduleElement) {
            moduleElement.classList.remove('locked', 'not_started', 'in_progress', 'completed');
            moduleElement.classList.add(status);
            
            // Actualizar el círculo de progreso
            const progressCircle = moduleElement.querySelector('.progress-circle');
            if (progressCircle) {
                if (status === 'completed') {
                    progressCircle.style.background = 'var(--glass-primary)';
                    progressCircle.innerHTML = '<i class="fas fa-check"></i>';
                } else if (status === 'locked') {
                    progressCircle.style.background = 'var(--glass-border)';
                    progressCircle.innerHTML = '<i class="fas fa-lock"></i>';
                } else {
                    progressCircle.style.background = 'var(--glass-secondary)';
                    progressCircle.innerHTML = moduleNumber;
                }
            }
        }
    }
    
    setupProgressEvents() {
        // Escuchar eventos de actualización de progreso
        window.addEventListener('courseProgressUpdated', (event) => {
            console.log('📡 Progreso actualizado:', event.detail);
            this.courseProgress = event.detail.progress;
            this.updateProgressUI();
        });
        
        window.addEventListener('videoProgressUpdated', (event) => {
            console.log('📡 Progreso de video actualizado:', event.detail);
            this.courseProgress = event.detail.progress;
            this.updateProgressUI();
            
            if (event.detail.moduleCompleted) {
                this.showModuleCompletedNotification(event.detail.moduleNumber);
            }
        });
    }
    
    // ===== ACTUALIZAR UI DEL PROGRESO =====
    updateProgressUI() {
        if (!this.courseProgress) return;
        
        console.log('🎨 Actualizando UI del progreso...');
        
        // Actualizar progreso general
        this.updateOverallProgress();
        
        // Actualizar progress dots
        this.updateProgressDots();
        
        // Actualizar estados de módulos
        this.updateModuleStates();
        
        // Actualizar información del módulo actual
        this.updateCurrentModuleInfo();
    }
    
    updateOverallProgress() {
        const progressPercentage = document.querySelector('.progress-percentage');
        const progressFill = document.querySelector('.progress-fill');
        
        const percentage = this.courseProgress.overall_progress_percentage || 0;
        
        if (progressPercentage) {
            progressPercentage.textContent = `${percentage}%`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        console.log(`📊 Progreso general actualizado: ${percentage}%`);
    }
    
    updateProgressDots() {
        const progressDots = document.querySelectorAll('.progress-dot');
        const modules = this.courseProgress.modules || [];
        
        progressDots.forEach((dot, index) => {
            const moduleNumber = index + 1;
            const moduleData = modules.find(m => m.module_number === moduleNumber);
            
            if (moduleData) {
                // Limpiar clases existentes
                dot.classList.remove('completed', 'current', 'pending');
                
                // Aplicar clase según el estado
                if (moduleData.status === 'completed') {
                    dot.classList.add('completed');
                } else if (moduleData.status === 'in_progress') {
                    dot.classList.add('current');
                } else {
                    dot.classList.add('pending');
                }
                
                // Actualizar tooltip
                const statusText = {
                    'completed': 'Completado',
                    'in_progress': 'En Progreso', 
                    'not_started': 'Pendiente',
                    'locked': 'Bloqueado'
                };
                
                dot.title = `Módulo ${moduleNumber} ${statusText[moduleData.status]}`;
            }
        });
        
        console.log('🔵 Progress dots actualizados');
    }
    
    updateModuleStates() {
        const moduleItems = document.querySelectorAll('.module-item');
        const modules = this.courseProgress.modules || [];
        
        moduleItems.forEach(item => {
            const moduleNumber = parseInt(item.dataset.module);
            const moduleData = modules.find(m => m.module_number === moduleNumber);
            
            if (moduleData) {
                // Limpiar clases existentes
                item.classList.remove('completed', 'current', 'pending', 'locked');
                
                // Aplicar clase según el estado
                item.classList.add(moduleData.status === 'in_progress' ? 'current' : moduleData.status);
                
                // Deshabilitar si está bloqueado
                if (moduleData.status === 'locked') {
                    item.style.opacity = '0.5';
                    item.style.pointerEvents = 'none';
                } else {
                    item.style.opacity = '1';
                    item.style.pointerEvents = 'auto';
                }
            }
        });
        
        console.log('📚 Estados de módulos actualizados');
    }
    
    updateCurrentModuleInfo() {
        const currentModuleInfo = document.querySelector('.current-module-info span');
        const currentModule = this.courseProgress.current_module || 1;
        const modules = this.courseProgress.modules || [];
        const moduleData = modules.find(m => m.module_number === currentModule);
        
        if (currentModuleInfo && moduleData) {
            currentModuleInfo.textContent = `Módulo ${currentModule}: ${moduleData.module_name}`;
        }
        
        console.log(`📍 Módulo actual: ${currentModule}`);
    }
    
    // ===== MÉTODOS CON PROGRESO =====
    async selectModuleWithProgress(moduleId) {
        console.log(`📚 Seleccionando módulo ${moduleId} con progreso...`);
        
        // Verificar si el módulo está disponible
        if (this.progressManager && this.progressManager.isModuleLocked(moduleId)) {
            console.warn(`🔒 Módulo ${moduleId} está bloqueado`);
            this.showLockedModuleMessage(moduleId);
            return;
        }
        
        // Ejecutar selección básica (evitar recursión)
        this.selectModuleBasic(moduleId);
        
        // Obtener datos del módulo para el video
        let moduleVideoId = null;
        if (this.courseProgress && this.courseProgress.modules) {
            const moduleData = this.courseProgress.modules.find(m => m.module_number === moduleId);
            if (moduleData && moduleData.video_id) {
                moduleVideoId = moduleData.video_id;
            }
        }
        
        // Si no tenemos el video ID desde progreso, usar datos estáticos
        if (!moduleVideoId) {
            const moduleVideos = {
                1: 'Yy_eZ65jzmo',  // ¿Qué es la IA?
                2: 'dhsy6epaJGs',  // Historia de la IA
                3: 'DvyOm9HeT-k',  // Fundamentos del ML
                4: 'oiKj0Z_Xnjc',  // Redes Neuronales
                5: 'HMoaRIbOaN0'   // Aplicaciones Prácticas
            };
            moduleVideoId = moduleVideos[moduleId];
        }
        
        // Cambiar video usando YouTube Tracker si está disponible
        if (this.youtubeTracker && moduleVideoId) {
            console.log(`🎥 Cambiando video a: ${moduleVideoId} (Módulo ${moduleId})`);
            this.youtubeTracker.changeVideo(moduleVideoId, moduleId);
        } else {
            // Fallback al método tradicional
            this.changeVideoByModule(moduleId);
        }
        
        // Marcar como iniciado si no ha comenzado
        if (this.progressManager) {
            const moduleData = this.progressManager.getModuleProgress(moduleId);
            
            if (moduleData && moduleData.status === 'not_started') {
                try {
                    await this.progressManager.startModule(moduleId);
                    console.log(`▶️ Módulo ${moduleId} iniciado`);
                } catch (error) {
                    console.error('❌ Error iniciando módulo:', error);
                }
            }
        }
        
        // Emitir evento de cambio de módulo para el tracker
        const event = new CustomEvent('moduleChanged', {
            detail: {
                moduleNumber: moduleId,
                videoId: moduleVideoId,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }
    
    async markVideoSectionCompleted(sectionNumber) {
        if (!this.progressManager) return;
        
        try {
            console.log(`✅ Marcando sección ${sectionNumber} como completada...`);
            
            await this.progressManager.markVideoSectionCompleted(
                this.currentModule,
                sectionNumber,
                0, // start time - se puede mejorar con datos reales del video
                0  // end time - se puede mejorar con datos reales del video
            );
            
        } catch (error) {
            console.error('❌ Error marcando sección completada:', error);
        }
    }
    
    async updateVideoPosition(currentTime, duration, percentageComplete) {
        if (!this.progressManager || !currentTime || !duration) return;
        
        try {
            // Actualizar cada 30 segundos o cada 10% de progreso
            const shouldUpdate = (
                currentTime % 30 < 1 || 
                Math.floor(percentageComplete) % 10 === 0
            );
            
            if (shouldUpdate) {
                await this.progressManager.updateVideoProgress(this.currentModule, {
                    last_video_position: Math.floor(currentTime),
                    video_progress_percentage: Math.floor(percentageComplete),
                    video_completed: percentageComplete >= 95, // Considerar completo al 95%
                    time_watched_seconds: 30 // Asumiendo actualización cada 30 segundos
                });
                
                console.log(`🎥 Posición del video actualizada: ${Math.floor(percentageComplete)}%`);
            }
            
        } catch (error) {
            console.error('❌ Error actualizando posición del video:', error);
        }
    }
    
    showLockedModuleMessage(moduleId) {
        const message = `🔒 El Módulo ${moduleId} está bloqueado. Completa los módulos anteriores para desbloquearlo.`;
        
        // Mostrar notificación temporal
        this.showTemporaryNotification(message, 'warning');
    }
    
    showModuleCompletedNotification(moduleNumber) {
        const message = `🎉 ¡Felicitaciones! Has completado el Módulo ${moduleNumber}`;
        
        // Mostrar notificación de éxito
        this.showTemporaryNotification(message, 'success');
        
        // Si no es el último módulo, sugerir continuar
        if (moduleNumber < 5) {
            setTimeout(() => {
                const continueMessage = `¿Quieres continuar con el Módulo ${moduleNumber + 1}?`;
                this.showTemporaryNotification(continueMessage, 'info');
            }, 3000);
        }
    }
    
    showTemporaryNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `progress-notification progress-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Estilos inline para asegurar visibilidad
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-surface);
            border: var(--glass-border);
            border-radius: 12px;
            padding: 1rem;
            box-shadow: var(--glass-shadow);
            backdrop-filter: blur(10px);
            z-index: 10000;
            max-width: 350px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    checkScreenSize() {
        const width = window.innerWidth;
        
        if (width <= 992) {
            this.enableMobileMode();
        } else {
            this.disableMobileMode();
        }
    }
    
    enableMobileMode() {
        console.log('📱 Modo móvil activado');
        // Aquí puedes agregar lógica específica para móvil
    }
    
    disableMobileMode() {
        console.log('🖥️ Modo desktop activado');
        // Aquí puedes agregar lógica específica para desktop
    }
    
    // ===== FUNCIONES DE MENSAJES =====
    copyMessage(button) {
        const messageElement = button.closest('.message-content');
        const messageText = messageElement.querySelector('.message-text').textContent;
        
        navigator.clipboard.writeText(messageText).then(() => {
            // Mostrar feedback visual
            const originalText = button.title;
            button.title = '¡Copiado!';
            button.style.background = 'var(--glass-success)';
            
        setTimeout(() => {
                button.title = originalText;
                button.style.background = '';
            }, 1500);
            
            console.log('📋 Mensaje copiado al portapapeles');
        }).catch(err => {
            console.error('❌ Error al copiar mensaje:', err);
        });
    }
    
    replyToMessage(button) {
        const messageElement = button.closest('.lia-message');
        const messageText = messageElement.querySelector('.message-text').textContent;
        const isUserMessage = messageElement.classList.contains('user-message');
        
        // Mostrar área de respuesta
        const replyArea = document.getElementById('replyArea');
        const replyText = document.getElementById('replyText');
        const input = document.getElementById('liaMessageInput');
        
        replyText.textContent = messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText;
        replyArea.style.display = 'block';
        replyArea.dataset.replyingTo = messageText;
        replyArea.dataset.isUserMessage = isUserMessage;
        
        // Cambiar placeholder del input
        input.placeholder = 'Escribe tu respuesta...';
        input.focus();
        
        console.log('💬 Respondiendo a mensaje');
    }
    
    cancelReply() {
        const replyArea = document.getElementById('replyArea');
        const input = document.getElementById('liaMessageInput');
        
        replyArea.style.display = 'none';
        replyArea.removeAttribute('data-replying-to');
        replyArea.removeAttribute('data-is-user-message');
        
        input.placeholder = 'Pregunta a LIA...';
        input.focus();
        
        console.log('❌ Respuesta cancelada');
    }
    
    createNoteFromMessage(button) {
        console.log('📝 Creando nota desde mensaje...');
        
        // Obtener el mensaje completo
        const messageElement = button.closest('.lia-message, .user-message');
        const messageText = messageElement.querySelector('.message-text').textContent;
        const isUserMessage = messageElement.classList.contains('user-message');
        
        // Crear título automático para la nota
        const noteTitle = this.generateNoteTitle(messageText, isUserMessage);
        
        // Crear contenido de la nota
        const noteContent = this.formatNoteContent(messageText, isUserMessage);
        
        // Crear la nota usando el sistema existente
        this.createNoteFromMessageData(noteTitle, noteContent);
        
        // Mostrar feedback visual
        this.showNoteCreatedFeedback(button);
    }
    
    generateNoteTitle(messageText, isUserMessage) {
        const prefix = isUserMessage ? 'Pregunta: ' : 'Respuesta de LIA: ';
        const maxLength = 50;
        
        if (messageText.length <= maxLength) {
            return prefix + messageText;
        }
        
        // Truncar y agregar puntos suspensivos
        return prefix + messageText.substring(0, maxLength) + '...';
    }
    
    formatNoteContent(messageText, isUserMessage) {
        const timestamp = new Date().toLocaleString('es-ES');
        const header = isUserMessage ? '💬 Pregunta del Usuario' : '🤖 Respuesta de LIA';
        
        return `
            <div class="note-header">
                <h3>${header}</h3>
                <p class="note-timestamp">📅 ${timestamp}</p>
            </div>
            <div class="note-content">
                <p>${messageText}</p>
            </div>
            <div class="note-footer">
                <p><em>Nota creada automáticamente desde el chat</em></p>
            </div>
        `;
    }
    
    createNoteFromMessageData(title, content) {
        // Crear objeto de nota
        const note = {
            id: Date.now(),
            title: title,
            content: content,
            tags: ['chat', 'automático'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Guardar en localStorage usando el sistema existente
        this.saveNoteToStorage(note);
        
        // Actualizar la lista de notas si está visible
        this.loadNotesList();
        
        console.log('📝 Nota creada automáticamente:', note);
    }
    
    showNoteCreatedFeedback(button) {
        // Cambiar temporalmente el botón para mostrar feedback
        const originalTitle = button.title;
        const originalHTML = button.innerHTML;
        
        button.title = '¡Nota creada!';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
            </svg>
        `;
        button.style.background = 'var(--glass-success)';
        button.style.color = 'white';
        
        // Restaurar después de 2 segundos
        setTimeout(() => {
            button.title = originalTitle;
            button.innerHTML = originalHTML;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
        
        console.log('✅ Nota creada exitosamente');
    }
    
    // ===== UTILIDADES =====
    autoResizeInput(input) {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
    }
    
    scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    stripHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }
    
    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'ahora';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `hace ${minutes} min`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `hace ${hours}h`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `hace ${days}d`;
        }
    }
    
    // loadInitialData() - Reemplazado por versión de Supabase más abajo
    
    cleanDuplicateNotes() {
        const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        const uniqueNotes = [];
        const seenIds = new Set();
        
        // Filtrar notas duplicadas por ID
        notes.forEach(note => {
            if (!seenIds.has(note.id)) {
                seenIds.add(note.id);
                uniqueNotes.push(note);
            }
        });
        
        // Guardar solo las notas únicas
        localStorage.setItem('lia_notes', JSON.stringify(uniqueNotes));
        
        console.log(`🧹 Limpiadas ${notes.length - uniqueNotes.length} notas duplicadas`);
        console.log(`📊 Total de notas únicas: ${uniqueNotes.length}`);
    }
    
    // Función temporal para debuggear - puedes llamarla desde la consola
    debugNotes() {
        const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        console.log('📊 Estado actual de las notas:');
        console.log(`Total de notas: ${notes.length}`);
        console.log('Notas:', notes);
        
        // Verificar duplicados
        const ids = notes.map(note => note.id);
        const uniqueIds = [...new Set(ids)];
        console.log(`IDs únicos: ${uniqueIds.length}`);
        console.log(`Duplicados: ${ids.length - uniqueIds.length}`);
    }
    
    // Función temporal para limpiar todas las notas (solo para emergencias)
    clearAllNotes() {
        if (confirm('¿Estás seguro de que quieres eliminar TODAS las notas? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('lia_notes');
            this.loadNotesList();
            console.log('🗑️ Todas las notas eliminadas');
        }
    }
    
    updateProgress(percentage) {
        const progressFill = document.querySelector('.progress-fill-modern');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    }
    
    loadSampleNotes() {
        // Cargar notas desde localStorage
        this.loadNotesList();
        console.log('📝 Notas cargadas desde localStorage');
    }
    
    loadNotesList() {
        const notesList = document.getElementById('notesList');
        const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        
        if (notes.length === 0) {
            notesList.innerHTML = `
                <div class="no-notes">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <p>No hay notas aún</p>
                    <span>Crea tu primera nota para comenzar</span>
                </div>
            `;
            return;
        }
        
        // Ordenar notas por fecha de actualización (más recientes primero)
        const sortedNotes = notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        notesList.innerHTML = sortedNotes.map(note => this.createNoteHTML(note)).join('');
        
        // Agregar event listeners a las notas
        this.setupNoteClickListeners();
    }
    
    setupNoteClickListeners() {
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const noteId = parseInt(item.dataset.noteId);
                console.log('📝 Abriendo nota:', noteId);
                this.openNoteForEditing(noteId);
            });
        });
    }
    
    openNoteForEditing(noteId) {
        const note = this.getNoteById(noteId);
        if (!note) {
            console.error('❌ Nota no encontrada:', noteId);
            return;
        }
        
        // Guardar ID de la nota que se está editando
        this.currentEditingNoteId = noteId;
        
        // Mostrar el editor
        this.showNotesCreator();
        
        // Llenar los campos con los datos de la nota
        const titleInput = document.getElementById('noteTitleInput');
        const contentEditor = document.getElementById('noteContentEditor');
        const tagsInput = document.getElementById('tagsInput');
        
        titleInput.value = note.title;
        contentEditor.innerHTML = note.content;
        
        // Limpiar y agregar las etiquetas
        this.clearTags();
        note.tags.forEach(tag => this.addTag(tag));
        
        console.log('✅ Nota cargada para edición:', note);
    }
    
    getNoteById(noteId) {
        const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        return notes.find(note => note.id === noteId);
    }
    
    deleteNote(noteId) {
        let notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        
        // Filtrar la nota a eliminar
        notes = notes.filter(note => note.id !== noteId);
        
        // Guardar la lista actualizada
        localStorage.setItem('lia_notes', JSON.stringify(notes));
        
        // Actualizar la lista en la interfaz
        this.loadNotesList();
        
        console.log('🗑️ Nota eliminada:', noteId);
    }
    
    createNoteHTML(note) {
        const tagsHTML = note.tags.map(tag => `
            <span class="tag">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                </svg>
                ${this.escapeHtml(tag)}
            </span>
        `).join('');
        
        const timeAgo = this.getTimeAgo(note.updatedAt);
        const contentPreview = this.stripHTML(note.content).substring(0, 100);
        
        return `
            <div class="note-item" data-note-id="${note.id}">
                <div class="note-header">
                    <span class="note-title">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        ${this.escapeHtml(note.title)}
                    </span>
                    <span class="note-time">${timeAgo}</span>
                </div>
                <div class="note-content">
                    <p>${this.escapeHtml(contentPreview)}${contentPreview.length >= 100 ? '...' : ''}</p>
                </div>
                <div class="note-tags">
                    ${tagsHTML}
                </div>
                    <div class="note-actions">
                    <button class="note-delete-btn" onclick="window.chatOnline.deleteNote(${note.id})" title="Eliminar nota">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        </button>
                    </div>
                </div>
        `;
    }
    
    // ===== CONTENIDO DE PESTAÑAS =====
    showVideoContent() {
        console.log('🎥 Mostrando contenido de video');
        
        // Ocultar contenido de materiales y quiz
        this.hideMaterialsContent();
        this.hideQuizContent();
        
        // Mostrar contenido de video
        const videoContent = document.querySelector('.main-video-player');
        const contentTabs = document.querySelector('.content-tabs');
        const contentArea = document.querySelector('.content-area');
        
        if (videoContent) videoContent.style.display = 'block';
        if (contentTabs) contentTabs.style.display = 'flex';
        if (contentArea) contentArea.style.display = 'block';
        
        // Agregar clase para animación
        if (videoContent) videoContent.classList.add('content-visible');
    }
    
    showMaterialsContent() {
        console.log('📚 Mostrando materiales');
        
        // Ocultar contenido de video y quiz
        this.hideVideoContent();
        this.hideQuizContent();
        
        // Crear y mostrar contenido de materiales
        this.createMaterialsContent();
        
        // Agregar clase para animación
        const materialsContent = document.querySelector('.materials-content');
        if (materialsContent) materialsContent.classList.add('content-visible');
    }
    
    showQuizContent() {
        console.log('❓ Mostrando quiz');
        
        // Ocultar contenido de video y materiales
        this.hideVideoContent();
        this.hideMaterialsContent();
        
        // Crear y mostrar contenido de quiz
        this.createQuizContent();
        
        // Agregar clase para animación
        const quizContent = document.querySelector('.quiz-content');
        if (quizContent) quizContent.classList.add('content-visible');
    }
    
    // ===== FUNCIONES DE OCULTAR CONTENIDO =====
    hideVideoContent() {
        const videoContent = document.querySelector('.main-video-player');
        const contentTabs = document.querySelector('.content-tabs');
        const contentArea = document.querySelector('.content-area');
        
        if (videoContent) {
            videoContent.style.display = 'none';
            videoContent.classList.remove('content-visible');
        }
        if (contentTabs) contentTabs.style.display = 'none';
        if (contentArea) contentArea.style.display = 'none';
    }
    
    hideMaterialsContent() {
        const materialsContent = document.querySelector('.materials-content');
        if (materialsContent) {
            materialsContent.style.display = 'none';
            materialsContent.classList.remove('content-visible');
        }
    }
    
    hideQuizContent() {
        const quizContent = document.querySelector('.quiz-content');
        if (quizContent) {
            quizContent.style.display = 'none';
            quizContent.classList.remove('content-visible');
        }
    }
    
    // ===== CREAR CONTENIDO DE MATERIALES =====
    createMaterialsContent() {
        const centerPanel = document.querySelector('.center-panel .course-content');
        if (!centerPanel) return;
        
        // Remover contenido existente de materiales si existe
        const existingMaterials = document.querySelector('.materials-content');
        if (existingMaterials) {
            existingMaterials.remove();
        }
        
        // Crear nuevo contenido de materiales
        const materialsHTML = `
            <div class="materials-content">
                <div class="materials-header">
                    <h2>
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                        </svg>
                        Materiales del Curso
                    </h2>
                    <p>Recursos adicionales para complementar tu aprendizaje</p>
                </div>
                
                <div class="materials-grid">
                    <div class="material-card">
                        <div class="material-icon">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                            </svg>
                        </div>
                        <div class="material-info">
                            <h3>Introducción a la IA - PDF</h3>
                            <p>Documento completo del módulo con ejemplos prácticos</p>
                            <span class="material-size">2.5 MB</span>
                        </div>
                        <button class="download-btn" onclick="window.chatOnline.downloadMaterial('ia-intro.pdf')">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Descargar
                        </button>
                    </div>
                    
                    <div class="material-card">
                        <div class="material-icon">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                            </svg>
                        </div>
                        <div class="material-info">
                            <h3>Ejercicios Prácticos</h3>
                            <p>Actividades para reforzar los conceptos aprendidos</p>
                            <span class="material-size">1.8 MB</span>
                        </div>
                        <button class="download-btn" onclick="window.chatOnline.downloadMaterial('ejercicios-ia.pdf')">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Descargar
                        </button>
                    </div>
                    
                    <div class="material-card">
                        <div class="material-icon">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15,3 21,3 21,9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                        </div>
                        <div class="material-info">
                            <h3>Enlaces de Referencia</h3>
                            <p>Recursos web adicionales para profundizar en el tema</p>
                            <span class="material-type">Enlaces</span>
                        </div>
                        <button class="link-btn" onclick="window.chatOnline.openLinks()">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15,3 21,3 21,9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Ver Enlaces
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        centerPanel.insertAdjacentHTML('beforeend', materialsHTML);
    }
    
    // ===== CREAR CONTENIDO DE QUIZ =====
    createQuizContent() {
        const centerPanel = document.querySelector('.center-panel .course-content');
        if (!centerPanel) return;
        
        // Remover contenido existente de quiz si existe
        const existingQuiz = document.querySelector('.quiz-content');
        if (existingQuiz) {
            existingQuiz.remove();
        }
        
        // Crear nuevo contenido de quiz
        const quizHTML = `
            <div class="quiz-content">
                <div class="quiz-header">
                    <h2>
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Quiz del Módulo ${this.currentModule}
                    </h2>
                    <p>Pon a prueba tus conocimientos con estas preguntas</p>
                    
                    <!-- Cronómetro -->
                    <div class="quiz-timer-container">
                        <div class="timer-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                        </div>
                        <div class="timer-display">
                            <span class="timer-text">Tiempo restante:</span>
                            <span class="timer-value" id="quizTimer">3:00</span>
                        </div>
                        <div class="timer-progress">
                            <div class="timer-progress-bar" id="timerProgressBar"></div>
                        </div>
                    </div>
                </div>
                
                <div class="quiz-container">
                    <div class="question-card">
                        <div class="question-header">
                            <span class="question-number">Pregunta 1 de 5</span>
                        </div>
                        
                        <h3 class="question-text">¿Qué es la Inteligencia Artificial?</h3>
                        
                        <div class="answer-options">
                            <label class="answer-option">
                                <input type="radio" name="q1" value="a">
                                <span class="answer-text">A) Una tecnología que permite a las máquinas pensar como humanos</span>
                            </label>
                            
                            <label class="answer-option">
                                <input type="radio" name="q1" value="b">
                                <span class="answer-text">B) Un programa de computadora que puede jugar ajedrez</span>
                            </label>
                            
                            <label class="answer-option">
                                <input type="radio" name="q1" value="c">
                                <span class="answer-text">C) Un sistema que puede realizar tareas que normalmente requieren inteligencia humana</span>
                            </label>
                            
                            <label class="answer-option">
                                <input type="radio" name="q1" value="d">
                                <span class="answer-text">D) Solo robots humanoides</span>
                            </label>
                        </div>
                        
                        <div class="question-actions">
                            <button class="btn-secondary" onclick="window.chatOnline.previousQuestion()">Anterior</button>
                            <button class="btn-primary" onclick="window.chatOnline.nextQuestion()">Siguiente</button>
                        </div>
                    </div>
                    
                    <div class="quiz-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 20%"></div>
                        </div>
                        <span class="progress-text">1 de 5 preguntas</span>
                    </div>
                </div>
            </div>
        `;
        
        centerPanel.insertAdjacentHTML('beforeend', quizHTML);
        
        // Iniciar el cronómetro del quiz
        this.startQuizTimer();
    }
    
    // ===== FUNCIONES AUXILIARES =====
    downloadMaterial(filename) {
        console.log(`📥 Descargando material: ${filename}`);
        // Aquí implementarías la lógica real de descarga
        alert(`Descargando ${filename}...`);
    }
    
    openLinks() {
        console.log('🔗 Abriendo enlaces de referencia');
        // Aquí implementarías la lógica para mostrar enlaces
        alert('Enlaces de referencia:\n• https://example.com/ia-basics\n• https://example.com/ml-intro');
    }
    
    previousQuestion() {
        console.log('⬅️ Pregunta anterior');
        // Implementar navegación entre preguntas
    }
    
    nextQuestion() {
        console.log('🚀 nextQuestion() llamado');
        console.log('🔍 Current question index:', this.currentQuestionIndex);
        console.log('🔍 Quiz data length:', this.quizData?.length);
        
        const qData = this.quizData[this.currentQuestionIndex];
        console.log('🔍 Question data:', qData);
        
        let answer;

        switch (qData.type) {
            case 'single':
            case 'boolean':
                const sel = document.querySelector('.answer-options input:checked');
                console.log('🔍 Selected input:', sel);
                if (!sel) { 
                    console.log('❌ No hay respuesta seleccionada');
                    alert('Selecciona una respuesta.'); 
                    return; 
                }
                answer = sel.value;
                console.log('✅ Respuesta capturada:', answer);
                break;
            case 'multiple':
                const checks = Array.from(document.querySelectorAll('.answer-options input[type="checkbox"]:checked'));
                console.log('🔍 Checkboxes seleccionados:', checks);
                if (checks.length === 0) { alert('Selecciona al menos una opción.'); return; }
                answer = checks.map(c => c.value);
                break;
            case 'text':
                const txt = document.querySelector('.answer-textarea').value.trim();
                console.log('🔍 Texto ingresado:', txt);
                if (!txt) { alert('Por favor escribe tu respuesta.'); return; }
                answer = txt;
                break;
            case 'match':
                const selects = Array.from(document.querySelectorAll('.match-select'));
                const pairAns = {};
                let incomplete = false;
                selects.forEach((s, idx)=>{
                    if (!s.value) incomplete = true; else pairAns[idx] = s.value;
                });
                if (incomplete) { alert('Completa todas las correspondencias.'); return; }
                answer = pairAns;
                break;
        }

        this.userAnswers[this.currentQuestionIndex] = answer;
        console.log('✅ Respuesta guardada:', answer);
        console.log('🔍 Todas las respuestas:', this.userAnswers);

        if (this.currentQuestionIndex < this.quizData.length - 1) {
            console.log('➡️ Avanzando a siguiente pregunta');
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
        } else {
            console.log('🏁 Quiz terminado, mostrando resultados');
            this.finishQuiz();
        }
    }
    
    /**
     * Devuelve las preguntas del quiz para el módulo actual.
     */
    getQuizData() {
        return [
            {
                type: 'single',
                question: '¿Cuál de los siguientes elementos del prompt garantiza la fiabilidad de la investigación solicitada a Gemini?',
                options: [
                    { value: 'a', text: 'Incluir casos de uso en finanzas y banca.' },
                    { value: 'b', text: 'Pedir que actúe "como un analista experto en IA generativa".' },
                    { value: 'c', text: 'Exigir la cita numerada de cada dato o afirmación.' },
                    { value: 'd', text: 'Solicitar un resumen de audio al final.' }
                ],
                correct: 'c',
                feedbackCorrect: '¡Exacto! Exigir citas numeradas asegura la trazabilidad y credibilidad de la información.',
                feedbackIncorrect: 'La opción correcta era exigir la cita numerada; esto permite verificar cada afirmación.'
            },
            {
                type: 'multiple',
                question: 'El prompt define un ____ profesional ("analista experto") y proporciona una estructura ____ de puntos numerados, lo que facilita a Gemini generar salidas reutilizables como infografías.',
                options: [
                    { value: 'clara', text: 'Clara' },
                    { value: 'rol', text: 'Rol' },
                    { value: 'fuerte', text: 'Fuerte' },
                    { value: 'lugar', text: 'Lugar' }
                ],
                correct: ['rol', 'clara'],
                feedbackCorrect: 'Correcto: el prompt establece claramente el rol y una estructura clara.',
                feedbackIncorrect: 'La respuesta correcta era "Rol" y "Clara": define quién habla y una estructura legible.'
            },
            {
                type: 'boolean',
                question: 'El flujo de trabajo indica que, después de crear la infografía, el usuario debe cerrar la pestaña de Canvas para volver al proyecto de investigación principal.',
                options: [
                    { value: 'true', text: 'Verdadero' },
                    { value: 'false', text: 'Falso' }
                ],
                correct: 'true',
                feedbackCorrect: '¡Bien! Seguir ese paso asegura volver al flujo principal sin perder contexto.',
                feedbackIncorrect: 'Incorrecto: El paso correcto es cerrar Canvas para regresar al proyecto principal.'
            },
            {
                type: 'text',
                question: 'En 1-2 frases, explica por qué el prompt reserva una sección específica para "Desafíos y consideraciones estratégicas para líderes" en la adopción de IA generativa.',
                options: [],
                correct: null,
                feedbackCorrect: 'Gracias por tu reflexión. Un evaluador revisará tu respuesta.',
                feedbackIncorrect: 'Respuesta registrada. Un evaluador proporcionará comentarios específicos.'
            },
            {
                type: 'match',
                question: 'Relaciona cada salida del flujo de trabajo con su objetivo principal:',
                pairs: {
                    '1. Reporte web interactivo.': ['A', 'B', 'C', 'D'],
                    '2. Infografía visual.': ['A', 'B', 'C', 'D'],
                    '3. Cuestionario': ['A', 'B', 'C', 'D'],
                    '4. Resumen de audio': ['A', 'B', 'C', 'D']
                },
                legend: {
                    A: 'Validar conocimientos adquiridos',
                    B: 'Repaso auditivo en multitarea',
                    C: 'Exploración profunda y compartible',
                    D: 'Impacto rápido y sintético'
                },
                correct: {
                    0: 'C',
                    1: 'D',
                    2: 'A',
                    3: 'B'
                },
                feedbackCorrect: '¡Perfecto! Has emparejado correctamente cada salida con su objetivo.',
                feedbackIncorrect: 'Algunas correspondencias eran distintas. Revisa la leyenda para entender cada objetivo.'
            }
        ];
    }
    
    /**
     * Renderiza la pregunta actual del quiz
     */
    renderCurrentQuestion() {
        console.log('🎨 Renderizando pregunta:', this.currentQuestionIndex);
        const questionData = this.quizData[this.currentQuestionIndex];
        if (!questionData) return;

        const questionCard = document.querySelector('.quiz-container .question-card');
        if (!questionCard) {
            console.error('❌ No se encontró .question-card');
            return;
        }

        // Construir HTML según el tipo
        let inputHTML = '';
        switch (questionData.type) {
            case 'single':
            case 'boolean':
                questionData.options.forEach(opt => {
                    const checked = this.userAnswers[this.currentQuestionIndex] === opt.value;
                    inputHTML += `
                        <label class="answer-option">
                            <input type="radio" name="q${this.currentQuestionIndex}" value="${opt.value}" ${checked ? 'checked' : ''}>
                            <span class="answer-text">${opt.text}</span>
                        </label>`;
                });
                break;
            case 'multiple':
                questionData.options.forEach(opt => {
                    const checked = Array.isArray(this.userAnswers[this.currentQuestionIndex]) && this.userAnswers[this.currentQuestionIndex].includes(opt.value);
                    inputHTML += `
                        <label class="answer-option">
                            <input type="checkbox" name="q${this.currentQuestionIndex}" value="${opt.value}" ${checked ? 'checked' : ''}>
                            <span class="answer-text">${opt.text}</span>
                        </label>`;
                });
                break;
            case 'text':
                const savedText = this.userAnswers[this.currentQuestionIndex] || '';
                inputHTML = `<textarea name="q${this.currentQuestionIndex}" rows="4" class="answer-textarea" placeholder="Escribe tu respuesta aquí...">${savedText}</textarea>`;
                break;
            case 'match':
                // mostrar leyenda
                let legendHTML = '<ul class="match-legend">';
                Object.entries(questionData.legend).forEach(([key, val]) => {
                    legendHTML += `<li><strong>${key}</strong>: ${val}</li>`;
                });
                legendHTML += '</ul>';

                let pairsHTML = '';
                const stored = this.userAnswers[this.currentQuestionIndex] || {};
                Object.keys(questionData.pairs).forEach((key, idx) => {
                    const options = questionData.pairs[key];
                    pairsHTML += `
                        <div class="match-row">
                            <span class="match-prompt">${key}</span>
                            <select name="q${this.currentQuestionIndex}_${idx}" class="match-select">
                                <option value="">---</option>
                                ${options.map(opt => `<option value="${opt}" ${stored[idx]===opt?'selected':''}>${opt}</option>`).join('')}
                            </select>
                        </div>`;
                });
                inputHTML = legendHTML + pairsHTML;
                break;
        }

        questionCard.innerHTML = `
            <div class="question-header">
                <span class="question-number">Pregunta ${this.currentQuestionIndex + 1} de ${this.quizData.length}</span>
            </div>
            <h3 class="question-text">${questionData.question}</h3>
            <div class="answer-options">${inputHTML}</div>
            <div class="question-actions">
                <button class="btn-secondary" ${this.currentQuestionIndex === 0 ? 'disabled' : ''} onclick="window.chatOnline.previousQuestion()">Anterior</button>
                <button class="btn-primary" onclick="window.chatOnline.nextQuestion()">${this.currentQuestionIndex === this.quizData.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
            </div>`;
    }
    
    /**
     * Finaliza el quiz y muestra resultados
     */
    finishQuiz() {
        console.log('🏁 Quiz finalizado');
        
        // Detener el cronómetro si está activo
        this.stopQuizTimer();
        
        let correctCount = 0;
        
        // Calcular respuestas correctas (excluyendo preguntas abiertas)
        this.quizData.forEach((q, idx) => {
            const userAns = this.userAnswers[idx];
            let isCorrect = false;
            
            if (q.type === 'text') {
                // Pregunta abierta - no se evalúa automáticamente
                return;
            } else if (q.type === 'multiple') {
                isCorrect = Array.isArray(userAns) && Array.isArray(q.correct) && 
                           userAns.sort().join(',') === q.correct.sort().join(',');
            } else if (q.type === 'match') {
                isCorrect = JSON.stringify(userAns) === JSON.stringify(q.correct);
            } else {
                isCorrect = userAns === q.correct;
            }
            
            if (isCorrect) correctCount++;
        });

        this.showQuizResults(correctCount);
    }
    
    /**
     * Muestra pantalla de resultados detallados
     */
    showQuizResults(correctCount) {
        const centerPanel = document.querySelector('.center-panel .course-content');
        if (!centerPanel) return;

        // Remover quiz anterior
        centerPanel.querySelectorAll('.quiz-content, .quiz-results').forEach(el => el.remove());

        // Calcular total de preguntas evaluables (excluyendo abiertas)
        const evaluableQuestions = this.quizData.filter(q => q.type !== 'text').length;
        
        let resultsHTML = `
            <div class="quiz-results">
                <h2>Resultados del Quiz</h2>
                <p>Respuestas correctas: <strong>${correctCount}</strong> de ${evaluableQuestions} preguntas evaluables</p>
        `;

        this.quizData.forEach((q, idx) => {
            const userAns = this.userAnswers[idx];
            let isCorrect = false;
            let cardClass = '';
            let feedback = '';
            
            if (q.type === 'text') {
                // Pregunta abierta - sin evaluación automática
                cardClass = 'open-question';
                feedback = q.feedbackCorrect; // Mensaje neutral para pregunta abierta
            } else {
                if (q.type === 'multiple') {
                    isCorrect = Array.isArray(userAns) && Array.isArray(q.correct) && 
                               userAns.sort().join(',') === q.correct.sort().join(',');
                } else if (q.type === 'match') {
                    isCorrect = JSON.stringify(userAns) === JSON.stringify(q.correct);
                } else {
                    isCorrect = userAns === q.correct;
                }
                cardClass = isCorrect ? 'correct' : 'incorrect';
                feedback = isCorrect ? q.feedbackCorrect : q.feedbackIncorrect;
            }

            let iconSVG = '';
            if (q.type === 'text') {
                iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                </svg>`;
            } else if (isCorrect) {
                iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                </svg>`;
            } else {
                iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"/>
                    <path d="M6 6l12 12"/>
                </svg>`;
            }

            resultsHTML += `
                <div class="result-card ${cardClass}">
                    <h3>${iconSVG}Pregunta ${idx + 1}</h3>
                    <p class="question">${q.question}</p>
                    <p><strong>Tu respuesta:</strong> ${this.formatAnswer(q, userAns)}</p>
                    ${q.correct !== null && q.type !== 'text' ? `<p><strong>Respuesta correcta:</strong> ${this.formatAnswer(q, q.correct)}</p>` : ''}
                    <p class="feedback">${feedback}</p>
                </div>`;
        });

        resultsHTML += `
                <div class="quiz-actions">
                    <button class="btn-primary" onclick="window.chatOnline.submitQuizResults()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m22 2-7 20-4-9-9-4Z"/>
                            <path d="M22 2 11 13"/>
                        </svg>
                        Enviar Respuestas
                    </button>
                    <button class="btn-secondary" onclick="window.chatOnline.restartQuiz()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                            <path d="M21 3v5h-5"/>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                            <path d="M3 21v-5h5"/>
                        </svg>
                        Repetir Cuestionario
                    </button>
                </div>
            </div>`;
        centerPanel.insertAdjacentHTML('beforeend', resultsHTML);
    }
    
    /**
     * Formatea respuestas para mostrar
     */
    formatAnswer(question, answer) {
        if (answer === undefined || answer === null) return '-';
        
        switch (question.type) {
            case 'single':
            case 'boolean':
                const opt = question.options.find(o => o.value === answer);
                return opt ? opt.text : answer;
            case 'multiple':
                return answer.map(val => {
                    const o = question.options.find(x => x.value === val);
                    return o ? o.text : val;
                }).join(', ');
            case 'text':
                return answer;
            case 'match':
                return Object.entries(answer).map(([k,v]) => `${parseInt(k)+1}→${v}`).join(', ');
            default:
                return String(answer);
        }
    }
    
    /**
     * Envía las respuestas del quiz al servidor/instructor
     */
    submitQuizResults() {
        console.log('📤 Enviando respuestas del quiz...');
        
        // Preparar datos para enviar
        const quizSubmission = {
            userId: this.getCurrentUserId(), // Implementar según tu sistema de auth
            moduleId: this.currentModule,
            timestamp: new Date().toISOString(),
            answers: this.userAnswers,
            questions: this.quizData,
            score: this.calculateScore()
        };
        
        console.log('Datos del quiz:', quizSubmission);
        
        // Aquí puedes implementar el envío al servidor
        // Por ahora mostraremos confirmación
        alert('✅ Respuestas enviadas correctamente al instructor.\n\nLa pregunta abierta será revisada manualmente.');
        
        // Opcional: deshabilitar el botón después del envío
        const submitBtn = document.querySelector('.quiz-actions .btn-primary');
        if (submitBtn) {
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                </svg>
                Enviado`;
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
        }
    }
    
    /**
     * Reinicia el quiz para repetirlo
     */
    restartQuiz() {
        console.log('🔄 Reiniciando quiz...');
        
        // Confirmar si realmente quiere repetir
        if (confirm('¿Estás seguro de que quieres repetir el cuestionario? Se perderán las respuestas actuales.')) {
            // Detener cronómetro actual si existe
            this.stopQuizTimer();
            
            // Resetear estado del quiz
            this.currentQuestionIndex = 0;
            this.userAnswers = {};
            this.quizTimeRemaining = this.quizTimeLimit;
            
            // Limpiar el contenido actual del panel central
            const centerPanel = document.querySelector('.center-panel');
            if (centerPanel) {
                centerPanel.innerHTML = '';
            }
            
            // Mostrar el quiz desde el inicio
            this.createQuizContent();
            
            console.log('✅ Quiz reiniciado');
        }
    }
    
    /**
     * Calcula el puntaje del quiz
     */
    calculateScore() {
        let correctCount = 0;
        let totalEvaluable = 0;
        
        this.quizData.forEach((q, idx) => {
            if (q.type === 'text') return; // Saltar preguntas abiertas
            
            totalEvaluable++;
            const userAns = this.userAnswers[idx];
            let isCorrect = false;
            
            if (q.type === 'multiple') {
                isCorrect = Array.isArray(userAns) && Array.isArray(q.correct) && 
                           userAns.sort().join(',') === q.correct.sort().join(',');
            } else if (q.type === 'match') {
                isCorrect = JSON.stringify(userAns) === JSON.stringify(q.correct);
            } else {
                isCorrect = userAns === q.correct;
            }
            
            if (isCorrect) correctCount++;
        });
        
        return {
            correct: correctCount,
            total: totalEvaluable,
            percentage: Math.round((correctCount / totalEvaluable) * 100)
        };
    }
    
    /**
     * Obtiene el ID del usuario actual (implementar según tu sistema)
     */
    getCurrentUserId() {
        // Implementar según tu sistema de autenticación
        // Por ahora retornamos un placeholder
        return 'user_' + Date.now();
    }
    
    // ===== FUNCIONES DEL CRONÓMETRO =====
    
    /**
     * Inicia el cronómetro del quiz
     */
    startQuizTimer() {
        console.log('⏱️ Iniciando cronómetro del quiz');
        
        // Resetear valores
        this.quizTimeRemaining = this.quizTimeLimit;
        this.quizStartTime = Date.now();
        
        // Actualizar display inicial
        this.updateTimerDisplay();
        
        // Iniciar el intervalo del cronómetro
        this.quizTimer = setInterval(() => {
            this.quizTimeRemaining--;
            this.updateTimerDisplay();
            
            // Verificar advertencias de tiempo
            this.checkTimeWarnings();
            
            // Verificar si se acabó el tiempo
            if (this.quizTimeRemaining <= 0) {
                this.timeUpQuiz();
            }
        }, 1000);
    }
    
    /**
     * Actualiza la visualización del cronómetro
     */
    updateTimerDisplay() {
        const timerElement = document.getElementById('quizTimer');
        const progressBar = document.getElementById('timerProgressBar');
        
        if (!timerElement || !progressBar) return;
        
        // Formatear tiempo
        const minutes = Math.floor(this.quizTimeRemaining / 60);
        const seconds = this.quizTimeRemaining % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        timerElement.textContent = timeString;
        
        // Actualizar barra de progreso
        const progress = ((this.quizTimeLimit - this.quizTimeRemaining) / this.quizTimeLimit) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Cambiar colores según el tiempo restante
        const container = document.querySelector('.quiz-timer-container');
        if (container) {
            container.classList.remove('warning', 'critical');
            
            if (this.quizTimeRemaining <= 60) { // Último minuto
                container.classList.add('critical');
            } else if (this.quizTimeRemaining <= 120) { // Últimos 2 minutos
                container.classList.add('warning');
            }
        }
    }
    
    /**
     * Verifica y muestra advertencias de tiempo
     */
    checkTimeWarnings() {
        if (this.quizTimeRemaining === 120) { // 2 minutos restantes
            this.showTimeWarning('⚠️ Quedan 2 minutos para completar el quiz');
        } else if (this.quizTimeRemaining === 60) { // 1 minuto restante
            this.showTimeWarning('🚨 ¡Último minuto! Termina las preguntas que puedas');
        } else if (this.quizTimeRemaining === 30) { // 30 segundos restantes
            this.showTimeWarning('🚨 ¡Solo quedan 30 segundos!');
        }
    }
    
    /**
     * Muestra advertencia de tiempo
     */
    showTimeWarning(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'quiz-time-warning';
        notification.innerHTML = `
            <div class="warning-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    /**
     * Termina el quiz cuando se acaba el tiempo
     */
    timeUpQuiz() {
        console.log('⏰ Tiempo agotado - Terminando quiz automáticamente');
        
        // Detener el cronómetro
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
        }
        
        // Mostrar mensaje de tiempo agotado
        alert('⏰ ¡Tiempo agotado! El quiz se ha terminado automáticamente con las respuestas que completaste.');
        
        // Finalizar quiz con respuestas actuales
        this.finishQuiz();
    }
    
    /**
     * Detiene el cronómetro (cuando se termina el quiz manualmente)
     */
    stopQuizTimer() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
            console.log('⏱️ Cronómetro detenido');
        }
    }
    
    // ===== YOUTUBE VIDEO PLAYER =====
    
    /**
     * Videos asignados a cada módulo (DEPRECATED - usar Supabase)
     * Mantenido solo para funciones de testing
     */
    getModuleVideos() {
        return {
            1: {
                id: 'Yy_eZ65jzmo',
                title: '¿Qué es la IA? - Introducción',
                duration: '15:00'
            },
            2: {
                id: 'dhsy6epaJGs', 
                title: 'Historia de la IA - Evolución',
                duration: '22:00'
            },
            3: {
                id: 'DvyOm9HeT-k',
                title: 'Fundamentos del ML - Conceptos básicos',
                duration: '18:00'
            },
            4: {
                id: 'oiKj0Z_Xnjc',
                title: 'Redes Neuronales - Arquitectura',
                duration: '25:00'
            },
            5: {
                id: 'HMoaRIbOaN0',
                title: 'Aplicaciones Prácticas de IA',
                duration: '20:00'
            }
        };
    }
    
    /**
     * Cambia el video de YouTube actual
     * @param {string} videoId - ID del video de YouTube
     * @param {string} title - Título del video
     * @param {string} duration - Duración del video (opcional)
     */
    changeYouTubeVideo(videoId, title, duration = '00:00') {
        console.log(`🎥 Cambiando video: ${title} (${videoId})`);
        
        const iframe = document.getElementById('youtubePlayer');
        const videoTitle = document.querySelector('.video-info h3');
        const videoDuration = document.querySelector('.video-stats span:first-child');
        
        if (iframe) {
            // Construir URL con parámetros optimizados
            const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`;
            iframe.src = embedUrl;
            iframe.title = title;
        }
        
        if (videoTitle) {
            // Mantener el ícono SVG y actualizar solo el texto
            const icon = videoTitle.querySelector('svg');
            videoTitle.innerHTML = '';
            if (icon) {
                videoTitle.appendChild(icon);
            }
            videoTitle.innerHTML += title;
        }
        
        if (videoDuration && duration !== '00:00') {
            const timeIcon = videoDuration.querySelector('svg');
            videoDuration.innerHTML = '';
            if (timeIcon) {
                videoDuration.appendChild(timeIcon);
            }
            videoDuration.innerHTML += `Duración: ${duration}`;
        }
        
        console.log(`✅ Video actualizado: ${title}`);
    }
    
    /**
     * Cambia el video según el módulo seleccionado
     * @param {number} moduleNumber - Número del módulo (1-5)
     */
    changeVideoByModule(moduleNumber) {
        const moduleVideos = this.getModuleVideos();
        const videoData = moduleVideos[moduleNumber];
        
        if (videoData) {
            console.log(`🎯 Cargando video del Módulo ${moduleNumber}`);
            this.changeYouTubeVideo(videoData.id, videoData.title, videoData.duration);
            
            // Información del módulo actual se actualiza ahora desde Supabase en renderModules()
        } else {
            console.error(`❌ No hay video configurado para el módulo ${moduleNumber}`);
        }
    }
    
    /**
     * Extrae el ID de video desde una URL de YouTube
     * @param {string} url - URL completa de YouTube
     * @returns {string|null} - ID del video o null si no es válida
     */
    extractYouTubeId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
            /youtube\.com\/.*[?&]v=([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }
    
    /**
     * Carga un video desde una URL completa de YouTube
     * @param {string} youtubeUrl - URL completa de YouTube
     * @param {string} title - Título del video
     * @param {string} duration - Duración del video
     */
    loadYouTubeVideo(youtubeUrl, title, duration = '00:00') {
        const videoId = this.extractYouTubeId(youtubeUrl);
        if (videoId) {
            this.changeYouTubeVideo(videoId, title, duration);
        } else {
            console.error('❌ URL de YouTube no válida:', youtubeUrl);
            alert('Error: URL de YouTube no válida');
        }
    }
    
    /**
     * Verifica si un video puede ser embebido y muestra mensaje de error si no
     * @param {string} videoId - ID del video de YouTube
     */
    checkVideoAvailability(videoId) {
        const iframe = document.getElementById('youtubePlayer');
        if (iframe) {
            // Agregar listener para detectar errores de embedding
            iframe.addEventListener('load', () => {
                console.log(`✅ Video ${videoId} cargado correctamente`);
            });
            
            iframe.addEventListener('error', (e) => {
                console.error(`❌ Error cargando video ${videoId}:`, e);
                this.showVideoError(videoId);
            });
            
            // Timeout para detectar videos con restricciones
            setTimeout(() => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc) {
                        console.warn(`⚠️ Video ${videoId} puede tener restricciones de embedding`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Video ${videoId} con restricciones detectadas:`, error.message);
                }
            }, 3000);
        }
    }
    
    /**
     * Muestra mensaje de error cuando un video no puede ser embebido
     * @param {string} videoId - ID del video con problema
     */
    showVideoError(videoId) {
        const container = document.querySelector('.youtube-player-wrapper');
        if (container) {
            container.innerHTML = `
                <div class="video-error-message" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: var(--glass-surface-dark);
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    color: var(--glass-text-secondary);
                ">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.6;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <h4 style="color: var(--glass-text-primary); margin-bottom: 0.5rem;">Video no disponible</h4>
                    <p style="margin-bottom: 1.5rem; opacity: 0.8;">Este video tiene restricciones de embedding.</p>
                    <a href="https://www.youtube.com/watch?v=${videoId}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       style="
                        color: var(--glass-primary);
                        text-decoration: none;
                        padding: 0.75rem 1.5rem;
                        background: var(--glass-surface);
                        border-radius: 8px;
                        border: var(--glass-border);
                        transition: all 0.3s ease;
                        display: inline-block;
                       "
                       onmouseover="this.style.background='var(--glass-surface-hover)'; this.style.transform='translateY(-2px)'"
                       onmouseout="this.style.background='var(--glass-surface)'; this.style.transform='translateY(0)'">
                        Ver en YouTube
                    </a>
                </div>
            `;
        }
    }
    
    /**
     * Playlist de videos de ejemplo para testing
     */
    loadTestVideos() {
        const testVideos = [
            {
                id: 'aircAruvnKk',
                title: 'Redes Neuronales - Introducción práctica',
                duration: '19:13'
            },
            {
                id: 'dQw4w9WgXcQ',
                title: 'Rick Astley - Never Gonna Give You Up',
                duration: '3:32'
            },
            {
                id: 'bEQTO7FO_P4',
                title: 'Machine Learning Explained',
                duration: '15:06'
            },
            {
                id: 'QNJL6nfu__Q',
                title: 'Michael Jackson - Billie Jean (con restricciones)',
                duration: '4:54'
            }
        ];
        
        console.log('🎬 Videos de prueba disponibles:', testVideos);
        return testVideos;
    }
}


// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Chat Online...');
    
    // Crear instancia de ChatOnline
    window.chatOnline = new ChatOnline();
    
    // Configurar tema global
    if (typeof setupGlobalTheme === 'function') {
        setupGlobalTheme();
    }
    
    console.log('✅ Chat Online iniciado correctamente');
});

// ===== FUNCIONES GLOBALES =====
function goBack() {
    if (window.chatOnline) {
        window.chatOnline.goBack();
    }
}

// Funciones globales para control de YouTube
function changeVideo(videoId, title, duration) {
    if (window.chatOnline) {
        window.chatOnline.changeYouTubeVideo(videoId, title, duration);
    }
}

function loadVideo(youtubeUrl, title, duration) {
    if (window.chatOnline) {
        window.chatOnline.loadYouTubeVideo(youtubeUrl, title, duration);
    }
}

// Función de prueba para cambiar videos rápidamente
function testVideos() {
    if (window.chatOnline) {
        const videos = window.chatOnline.loadTestVideos();
        console.log('🎬 Para cambiar videos usa:');
        videos.forEach((video, index) => {
            console.log(`${index + 1}. changeVideo('${video.id}', '${video.title}', '${video.duration}')`);
        });
        return videos;
    }
}

// Función para cambiar a un módulo específico
function selectModule(moduleNumber) {
    if (window.chatOnline) {
        window.chatOnline.selectModule(moduleNumber);
        console.log(`🎯 Módulo ${moduleNumber} seleccionado`);
    }
}

// Función para ver todos los videos de módulos
function showModuleVideos() {
    if (window.chatOnline) {
        const moduleVideos = window.chatOnline.getModuleVideos();
        console.log('🎬 Videos por módulo:');
        Object.keys(moduleVideos).forEach(moduleId => {
            const video = moduleVideos[moduleId];
            console.log(`Módulo ${moduleId}: ${video.title} (${video.duration}) - ID: ${video.id}`);
        });
        console.log('\n🎯 Para cambiar usa: selectModule(1), selectModule(2), etc.');
        return moduleVideos;
    }
}

// ===== FUNCIONES DE PROGRESO PARA TESTING =====

// Obtener progreso del curso
async function getProgress() {
    if (window.courseProgressManager) {
        const progress = await window.courseProgressManager.getCourseProgress(true);
        console.log('📊 Progreso actual:', progress);
        return progress;
    } else {
        console.warn('⚠️ Course Progress Manager no disponible');
    }
}

// Marcar módulo como completado (para testing)
async function completeModule(moduleNumber) {
    if (window.courseProgressManager) {
        try {
            const result = await window.courseProgressManager.completeModule(moduleNumber);
            console.log(`✅ Módulo ${moduleNumber} completado:`, result);
            return result;
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
}

// Iniciar un módulo (para testing)
async function startModule(moduleNumber) {
    if (window.courseProgressManager) {
        try {
            const result = await window.courseProgressManager.startModule(moduleNumber);
            console.log(`▶️ Módulo ${moduleNumber} iniciado:`, result);
            return result;
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
}

// Actualizar progreso del video (para testing)
async function updateVideoProgress(moduleNumber, percentage, position = 0) {
    if (window.courseProgressManager) {
        try {
            const result = await window.courseProgressManager.updateVideoProgress(moduleNumber, {
                video_progress_percentage: percentage,
                last_video_position: position,
                video_completed: percentage >= 95
            });
            console.log(`🎥 Video del módulo ${moduleNumber} actualizado:`, result);
            return result;
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
}

// Reset del progreso (para testing - USAR CON CUIDADO)
async function resetProgress() {
    if (confirm('⚠️ ¿Estás seguro de que quieres resetear el progreso? Esta acción no se puede deshacer.')) {
        console.log('🔄 Resetting progress no implementado por seguridad');
        console.log('Para resetear manualmente, limpia las tablas de progreso en la base de datos');
    }
}

// Mostrar comandos disponibles
function showProgressCommands() {
    console.log('📋 Comandos de progreso disponibles:');
    console.log('• getProgress() - Obtener progreso actual');
    console.log('• startModule(n) - Iniciar módulo n (1-5)');
    console.log('• completeModule(n) - Completar módulo n (1-5)');
    console.log('• updateVideoProgress(module, percentage, position) - Actualizar video');
    console.log('• selectModule(n) - Cambiar a módulo n');
    console.log('• showModuleVideos() - Ver videos disponibles');
    console.log('• resetProgress() - Reset completo (usar con cuidado)');
}

// Auto-mostrar comandos disponibles
console.log('🚀 Course Progress System cargado');
console.log('💡 Escribe showProgressCommands() para ver comandos disponibles');

// Debug del sistema de progreso
async function debugProgressSystem() {
    console.log('🔧 === DEBUG PROGRESS SYSTEM ===');
    
    // 1. Verificar Progress Manager
    console.log('1. Progress Manager:', window.courseProgressManager ? '✅ Disponible' : '❌ No disponible');
    
    if (!window.courseProgressManager) {
        console.log('⚠️ CourseProgressManager no está disponible');
        return;
    }
    
    // 2. Verificar Chat Online
    console.log('2. Chat Online:', window.chatOnline ? '✅ Disponible' : '❌ No disponible');
    
    // 3. Obtener progreso
    try {
        console.log('3. Obteniendo progreso...');
        const progress = await window.courseProgressManager.getCourseProgress(true);
        console.log('✅ Progreso obtenido:', progress);
        
        // 4. Verificar elementos DOM
        console.log('4. Verificando elementos DOM...');
        const progressPercentage = document.querySelector('.progress-percentage');
        const progressFill = document.querySelector('.progress-fill');
        const progressDots = document.querySelectorAll('.progress-dot');
        
        console.log('• Progress percentage element:', progressPercentage ? '✅' : '❌');
        console.log('• Progress fill element:', progressFill ? '✅' : '❌'); 
        console.log('• Progress dots count:', progressDots.length);
        
        // 5. Forzar actualización UI
        if (window.chatOnline) {
            console.log('5. Forzando actualización UI...');
            window.chatOnline.courseProgress = progress;
            window.chatOnline.updateProgressUI();
            console.log('✅ UI actualizada');
        }
        
        // 6. Verificar clases aplicadas
        console.log('6. Verificando clases de progress dots:');
        progressDots.forEach((dot, index) => {
            const classes = Array.from(dot.classList);
            console.log(`• Dot ${index + 1}:`, classes);
        });
        
    } catch (error) {
        console.error('❌ Error en debug:', error);
    }
}

// Función para inicializar manualmente si no funciona automáticamente  
async function forceInitializeProgress() {
    console.log('🚀 Forzando inicialización del progreso...');
    
    if (!window.courseProgressManager) {
        console.error('❌ CourseProgressManager no disponible');
        return;
    }
    
    try {
        // Forzar obtención de progreso
        const progress = await window.courseProgressManager.getCourseProgress(true);
        console.log('✅ Progreso inicializado:', progress);
        
        if (window.chatOnline) {
            window.chatOnline.courseProgress = progress;
            window.chatOnline.updateProgressUI();
            console.log('✅ UI actualizada manualmente');
        }
        
        return progress;
    } catch (error) {
        console.error('❌ Error forzando inicialización:', error);
    }
}

console.log('🔧 Funciones de debug disponibles:');
console.log('• debugProgressSystem() - Debug completo del sistema');
console.log('• forceInitializeProgress() - Forzar inicialización');

// ===== FUNCIÓN GLOBAL INMEDIATA =====
window.switchTab = function(contentType) {
    console.log(`🔄 switchTab global inmediato llamado: ${contentType}`);
    
    if (window.courseManager && typeof window.courseManager.switchContentTab === 'function') {
        window.courseManager.switchContentTab(contentType);
    } else {
        console.log('⏳ courseManager no disponible aún, guardando para después...');
        // Guardar la acción para ejecutar cuando esté disponible
        window.pendingTabSwitch = contentType;
    }
};

console.log('✅ window.switchTab definido globalmente');

// ===== INSTANCIACIÓN AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, instanciando ChatOnline...');
    window.chatOnlineInstance = new ChatOnline();
    
    // Ejecutar acción pendiente si existe
    if (window.pendingTabSwitch) {
        console.log(`🔄 Ejecutando acción pendiente: ${window.pendingTabSwitch}`);
        setTimeout(() => {
            window.switchTab(window.pendingTabSwitch);
            window.pendingTabSwitch = null;
        }, 100);
    }
});

// ===== EXPORTAR PARA USO EXTERNO =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatOnline;
}

