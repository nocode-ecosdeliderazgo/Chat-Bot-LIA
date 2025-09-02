// ===== CHAT ONLINE - JAVASCRIPT PRINCIPAL =====

class ChatOnline {
    constructor() {
        this.currentModule = 3;
        this.currentTab = 'video';
        this.isLiaTyping = false;
        this.notes = [];
        this.isSearchMode = false;
        this.progressManager = null;
        this.courseProgress = null;
        
        // ===== ESTADO DEL QUIZ =====
        /**
         * Array con las preguntas del quiz del módulo actual.
         * Cada elemento: {
         *   question: string,
         *   options: { value: string, text: string }[],
         *   correct: string
         * }
         */
        this.quizData = this.getQuizData();
        
        // Índice de la pregunta que se está mostrando (0-based)
        this.currentQuestionIndex = 0;
        
        // Respuestas elegidas por el usuario: { [index:number]: value:string }
        this.userAnswers = {};
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Chat Online...');
        this.setupEventListeners();
        await this.initializeProgressManager();
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
        
        // Pestañas de contenido
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
            1: { title: 'Módulo 1: ¿Qué es la IA?', duration: '15:30', progress: 100 },
            2: { title: 'Módulo 2: Historia de la IA', duration: '22:00', progress: 100 },
            3: { title: 'Módulo 3: Fundamentos del ML', duration: '18:30', progress: 65 },
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
        
        return transcripts[moduleId] || transcripts[3];
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
        // Simular delay de respuesta
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Respuestas contextuales basadas en el mensaje
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hola') || lowerMessage.includes('buenos')) {
            return '¡Hola! ¿En qué puedo ayudarte hoy con el curso de IA?';
        }
        
        if (lowerMessage.includes('redes neuronales') || lowerMessage.includes('neural')) {
            return 'Las redes neuronales son sistemas de aprendizaje automático inspirados en el cerebro humano. Están compuestas por capas de neuronas artificiales que procesan información de manera similar a las neuronas biológicas. ¿Te gustaría que profundice en algún aspecto específico?';
        }
        
        if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) {
            return 'Machine Learning es un subcampo de la IA que permite a las computadoras aprender y mejorar automáticamente a partir de la experiencia sin ser programadas explícitamente. ¿Hay algún algoritmo específico que te interese?';
        }
        
        if (lowerMessage.includes('ayuda') || lowerMessage.includes('ayudar')) {
            return '¡Por supuesto! Puedo ayudarte con:\n• Explicar conceptos del video\n• Resolver dudas sobre IA\n• Proporcionar ejemplos prácticos\n• Crear resúmenes de temas\n\n¿Qué te gustaría saber?';
        }
        
        // Respuesta por defecto
        return 'Interesante pregunta. Basándome en el contexto del curso actual, puedo ayudarte a entender mejor los conceptos de IA. ¿Podrías ser más específico sobre lo que te gustaría aprender?';
    }
    
    // ===== PESTAÑAS DE CONTENIDO =====
    setupContentTabs() {
        const tabButtons = document.querySelectorAll('.content-tabs .tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const contentType = e.currentTarget.dataset.content;
                console.log(`📄 Cambiando contenido a: ${contentType}`);
                this.switchContentTab(contentType);
            });
        });
    }
    
    switchContentTab(contentType) {
        // Remover clase active de todas las pestañas
        document.querySelectorAll('.content-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Agregar clase active a la pestaña seleccionada
        const activeTab = document.querySelector(`[data-content="${contentType}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Cambiar contenido
        this.updateContentArea(contentType);
    }
    
    updateContentArea(contentType) {
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;
        
        switch(contentType) {
            case 'transcript':
                contentArea.innerHTML = `
                    <div class="transcript-content">
                        ${this.getModuleTranscript(this.currentModule)}
                    </div>
                `;
                break;
            case 'summary':
                contentArea.innerHTML = `
                    <div class="summary-content">
                        <h4>Resumen del Módulo</h4>
                        <ul>
                            <li>Conceptos fundamentales de redes neuronales</li>
                            <li>Perceptrones simples y su funcionamiento</li>
                            <li>Funciones de activación (sigmoid, tanh, ReLU)</li>
                            <li>Aplicaciones prácticas en IA</li>
                        </ul>
                    </div>
                `;
                break;
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
        
        // Guardar nota
        saveBtn.addEventListener('click', () => {
            this.saveNote();
            this.hideNotesCreator();
        });
        
        // Cancelar
        cancelBtn.addEventListener('click', () => {
            this.hideNotesCreator();
        });
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
            
            // Esperar a que esté disponible CourseProgressManager
            if (typeof window.courseProgressManager === 'undefined') {
                console.log('⏳ Esperando CourseProgressManager...');
                await this.waitForProgressManager();
            }
            
            this.progressManager = window.courseProgressManager;
            
            // Obtener progreso inicial
            this.courseProgress = await this.progressManager.getCourseProgress();
            
            // Actualizar UI con el progreso actual
            this.updateProgressUI();
            
            console.log('✅ Progress Manager inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando Progress Manager:', error);
            // Continuar sin progress manager en modo fallback
            this.progressManager = null;
        }
    }
    
    waitForProgressManager() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof window.courseProgressManager !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout después de 5 segundos
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(); // Continuar sin progress manager
            }, 5000);
        });
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
    
    loadInitialData() {
        // Cargar datos iniciales
        console.log('📊 Cargando datos iniciales...');
        
        // Cargar video del módulo actual (3)
        console.log('🎥 Cargando video del módulo inicial...');
        this.changeVideoByModule(this.currentModule);
        
        // Simular carga de progreso
        this.updateProgress(65);
        
        // Cargar notas de ejemplo
        this.loadSampleNotes();
    }
    
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
        
        // Crear el contenido del quiz
        this.createQuizContent();
        
        // Añadir animación de entrada
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
        document.querySelectorAll('.quiz-content, .quiz-results').forEach(el => el.remove());
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
        console.log('➡️ Siguiente pregunta');
        // Implementar navegación entre preguntas
    }
    
    // ===== YOUTUBE VIDEO PLAYER =====
    
    /**
     * Videos asignados a cada módulo
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
            
            // Actualizar la información del módulo actual si existe
            const currentModuleInfo = document.querySelector('.current-module-info span');
            if (currentModuleInfo) {
                const moduleNames = {
                    1: 'Módulo 1: ¿Qué es la IA?',
                    2: 'Módulo 2: Historia de la IA', 
                    3: 'Módulo 3: Fundamentos del ML',
                    4: 'Módulo 4: Redes Neuronales',
                    5: 'Módulo 5: Aplicaciones Prácticas'
                };
                currentModuleInfo.textContent = moduleNames[moduleNumber] || `Módulo ${moduleNumber}`;
            }
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
    
    // ===== FUNCIONES DEL TEMARIO =====
    showCourseSyllabus() {
        console.log('📋 Mostrando temario del curso');
        
        // Crear modal con el temario completo
        const modalHTML = `
            <div id="syllabusModal" class="modal-overlay">
                <div class="modal-content neo-panel">
                    <div class="modal-header">
                        <h2>
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 1.946 1.946 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-1.946 1.946 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-1.946-1.946 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 1.946-1.946z"/>
                            </svg>
                            Temario Completo del Curso
                        </h2>
                        <button class="modal-close" onclick="window.chatOnline.closeSyllabusModal()">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="syllabus-overview">
                            <h3>Dominando ChatGPT y Gemini para la Productividad</h3>
                            <p class="course-description">
                                <strong>Objetivo General:</strong> Capacitar a profesionales para optimizar su productividad diaria mediante el uso estratégico de ChatGPT y Gemini, a través de técnicas de prompting efectivo, diseño de agentes personalizados y desarrollo de soluciones integradoras.
                            </p>
                        </div>
                        
                        <div class="modules-syllabus">
                            <h4>Estructura del Curso - 4 Sesiones</h4>
                            
                            <div class="module-syllabus-item">
                                <div class="module-header">
                                    <span class="module-number">Sesión 1</span>
                                    <h5>Descubriendo la IA para Profesionales</h5>
                                    <span class="module-duration">Importancia y Primeros Pasos</span>
                                </div>
                                <div class="module-content">
                                    <p class="session-objective"><strong>Objetivo:</strong> Comprender la relevancia de la IA en el ámbito profesional, configurar y explorar las funciones básicas de ChatGPT y Gemini, y aplicar prompting inicial para optimizar su perfil profesional.</p>
                                    
                                    <div class="session-blocks">
                                        <h6>Bloque 1: El "Por Qué" de la IA para el Profesional Moderno</h6>
                                        <ul>
                                            <li>IA sin tecnicismos: qué es y por qué importa hoy</li>
                                            <li>La IA ya está aquí: ejemplos reales en lo cotidiano y lo profesional</li>
                                            <li>Impacto en el trabajo y en los negocios</li>
                                            <li>Casos prácticos de alto impacto</li>
                                        </ul>
                                        
                                        <h6>Bloque 2: Introducción a los Modelos de Lenguaje Grande (LLMs)</h6>
                                        <ul>
                                            <li>El "Nuevo Lenguaje de Programación": Entender el prompt</li>
                                            <li>ChatGPT: Tu Asistente Inteligente (Práctica Guiada)</li>
                                            <li>Google Gemini: El Poder de Google con IA (Práctica Guiada)</li>
                                            <li>Comparación Directa: ChatGPT vs. Gemini</li>
                                        </ul>
                                        
                                        <h6>Bloque 3: Primeros Pasos Prácticos</h6>
                                        <ul>
                                            <li>Introducción al Prompt: Conceptos clave</li>
                                            <li>Mentalidad IA-Oriented: Enfoque efectivo</li>
                                            <li>Ejercicio Práctico: Tu Nuevo CV para Liderar el Cambio</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="module-syllabus-item">
                                <div class="module-header">
                                    <span class="module-number">Sesión 2</span>
                                    <h5>Dominando la Comunicación con IA</h5>
                                    <span class="module-duration">Prompt Designing Avanzado</span>
                                </div>
                                <div class="module-content">
                                    <p class="session-objective"><strong>Objetivo:</strong> Aplicar técnicas avanzadas de diseño de prompts y crear agentes GPT personalizados y Gems básicos para automatizar tareas específicas.</p>
                                    
                                    <div class="session-blocks">
                                        <h6>Bloque 1: Técnicas Avanzadas de Prompt Designing</h6>
                                        <ul>
                                            <li>Metaprompt: Usar la IA para mejorar tus propios prompts</li>
                                            <li>Prompt Progresivo: Iteración y refinamiento paso a paso</li>
                                            <li>Megaprompt: Construir prompts complejos para tareas multifacéticas</li>
                                            <li>Ejercicios prácticos de generación de contenido y copywriting</li>
                                        </ul>
                                        
                                        <h6>Bloque 2: Agentes GPT Personalizados (Custom GPTs)</h6>
                                        <ul>
                                            <li>Funcionalidades avanzadas de ChatGPT</li>
                                            <li>Creación de Custom GPTs desde cero</li>
                                            <li>Asistente de Marketing para Redes Sociales</li>
                                            <li>Generador de Informes Ejecutivos</li>
                                        </ul>
                                        
                                        <h6>Bloque 3: Creación de Gems en Gemini</h6>
                                        <ul>
                                            <li>Introducción a los Gems de Gemini</li>
                                            <li>Desarrollo de un Gem Básico</li>
                                            <li>Integración en flujos de trabajo</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="module-syllabus-item">
                                <div class="module-header">
                                    <span class="module-number">Sesión 3</span>
                                    <h5>IMPULSO con ChatGPT</h5>
                                    <span class="module-duration">Productividad para PYMES</span>
                                </div>
                                <div class="module-content">
                                    <p class="session-objective"><strong>Objetivo:</strong> Identificar y mapear desafíos de negocio usando el modelo IMPULSO, diseñar prompts eficaces para ChatGPT orientados a casos PYME, y definir KPIs con ciclo de mejora quincenal.</p>
                                    
                                    <div class="session-blocks">
                                        <h6>Marco Conceptual IMPULSO</h6>
                                        <ul>
                                            <li><strong>I</strong>dentificar: Redacción del desafío en una frase clara</li>
                                            <li><strong>M</strong>apear: Creación del mapa de datos compartibles vs. sensibles</li>
                                            <li><strong>P</strong>reguntar: Anatomía de un prompt eficaz</li>
                                            <li><strong>U</strong>nificar: Revisión crítica y integración de hallazgos</li>
                                            <li><strong>L</strong>imitar: Verificación de fuentes y detección de sesgos</li>
                                            <li><strong>S</strong>upervisar: Definición de KPIs y calendario de seguimiento</li>
                                            <li><strong>O</strong>ptimizar: Ciclo de mejora quincenal</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="module-syllabus-item">
                                <div class="module-header">
                                    <span class="module-number">Sesión 4</span>
                                    <h5>Desbloqueando el Potencial de la IA</h5>
                                    <span class="module-duration">Estrategia y Proyecto</span>
                                </div>
                                <div class="module-content">
                                    <p class="session-objective"><strong>Objetivo:</strong> Diseñar e implementar un proyecto integrador de IA generativa adaptado a su entorno real, elaborar un plan de integración diaria y establecer métricas SMART.</p>
                                    
                                    <div class="session-blocks">
                                        <h6>Bloque 1: IA como Ventaja Estratégica</h6>
                                        <ul>
                                            <li>Casos de negocio y aplicación personalizada</li>
                                            <li>Ejercicio práctico grupal: diseñar soluciones con ChatGPT</li>
                                        </ul>
                                        
                                        <h6>Bloque 2: Proyecto Integrador</h6>
                                        <ul>
                                            <li>Definición del problema y establecimiento de metas SMART</li>
                                            <li>Esbozo de la solución y mini-pitch de 5 minutos</li>
                                        </ul>
                                        
                                        <h6>Bloque 3: Plan de Integración Diaria</h6>
                                        <ul>
                                            <li>Identificación de casos de uso y diseño de workflows</li>
                                            <li>Métricas y KPIs para medir eficiencia y ahorro de tiempo</li>
                                            <li>Ejercicio individual: bosquejo del plan paso a paso</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="course-outcomes">
                            <h4>Resultados Esperados</h4>
                            <p>Al finalizar las cuatro sesiones del curso, los participantes habrán implementado flujos de trabajo prácticos y medibles que incorporen estas herramientas en su rutina profesional.</p>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="neo-btn neo-btn-primary" onclick="window.chatOnline.downloadSyllabus()">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Descargar Temario
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar modal en el body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar modal con animación
        setTimeout(() => {
            const modal = document.getElementById('syllabusModal');
            if (modal) modal.classList.add('active');
        }, 10);
    }
    
    closeSyllabusModal() {
        const modal = document.getElementById('syllabusModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }
    
    downloadSyllabus() {
        console.log('📥 Descargando temario del curso');
        // Aquí implementarías la lógica real de descarga
        alert('Descargando temario completo del curso...');
        this.closeSyllabusModal();
    }

    /**
     * Devuelve las preguntas del quiz para el módulo actual.
     * En el futuro podría obtenerse de una API o base de datos.
     */
    getQuizData() {
        // Ejemplo simple con 2 preguntas; se puede ampliar a 5
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
                correct: ['rol', 'clara'], // ejemplo
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
                correct: null, // evaluación manual
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
                    1: 'C',
                    2: 'D',
                    3: 'A',
                    4: 'B'
                },
                feedbackCorrect: '¡Perfecto! Has emparejado correctamente cada salida con su objetivo.',
                feedbackIncorrect: 'Algunas correspondencias eran distintas. Revisa la leyenda para entender cada objetivo.'
            }
        ];
    }

    // ===== RENDERIZAR PREGUNTA ACTUAL =====
    renderCurrentQuestion() {
        const questionData = this.quizData[this.currentQuestionIndex];
        if (!questionData) return;

        const questionCard = document.querySelector('.quiz-container .question-card');
        const progressFill = document.querySelector('.quiz-container .progress-fill');
        const progressText = document.querySelector('.quiz-container .progress-text');

        if (!questionCard) return;

        // Determinar representación según type
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
                inputHTML = `<textarea name="q${this.currentQuestionIndex}" rows="4" class="answer-textarea">${savedText}</textarea>`;
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
            <div class="question-header"><span class="question-number">Pregunta ${this.currentQuestionIndex + 1} de ${this.quizData.length}</span></div>
            <h3 class="question-text">${questionData.question}</h3>
            <div class="answer-options">${inputHTML}</div>
            <div class="question-actions">
                <button class="btn-secondary" ${this.currentQuestionIndex === 0 ? 'disabled' : ''} onclick="window.chatOnline.previousQuestion()">Anterior</button>
                <button class="btn-primary" onclick="window.chatOnline.nextQuestion()">${this.currentQuestionIndex === this.quizData.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
            </div>`;
         
         // Actualizar barra y texto de progreso
         const progressPercent = ((this.currentQuestionIndex) / this.quizData.length) * 100;
         if (progressFill) progressFill.style.width = `${progressPercent}%`;
         if (progressText) progressText.textContent = `${this.currentQuestionIndex} de ${this.quizData.length} preguntas respondidas`;
     }
 
     // ===== NAVEGAR A SIGUIENTE PREGUNTA =====
     nextQuestion() {
        const qData = this.quizData[this.currentQuestionIndex];
        let answer;

        switch (qData.type) {
            case 'single':
            case 'boolean':
                const sel = document.querySelector('.answer-options input:checked');
                if (!sel) { alert('Selecciona una respuesta.'); return; }
                answer = sel.value;
                break;
            case 'multiple':
                const checks = Array.from(document.querySelectorAll('.answer-options input[type="checkbox"]:checked'));
                if (checks.length === 0) { alert('Selecciona al menos una opción.'); return; }
                answer = checks.map(c => c.value);
                break;
            case 'text':
                const txt = document.querySelector('.answer-textarea').value.trim();
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

        if (this.currentQuestionIndex < this.quizData.length - 1) {
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
        } else {
            this.finishQuiz();
        }
    }

    // ===== NAVEGAR A PREGUNTA ANTERIOR =====
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderCurrentQuestion();
        }
    }

    // ===== FINALIZAR QUIZ =====
    finishQuiz() {
        let correct = 0;
        this.quizData.forEach((q, idx) => {
            const userAns = this.userAnswers[idx];
            let isCorrect = false;
            if (q.type === 'multiple') {
                isCorrect = Array.isArray(userAns) && Array.isArray(q.correct) && userAns.sort().join(',') === q.correct.sort().join(',');
            } else if (q.type === 'match') {
                isCorrect = JSON.stringify(userAns) === JSON.stringify(q.correct);
            } else if (q.type === 'text') {
                isCorrect = false; // texto requiere evaluación manual
            } else {
                isCorrect = userAns === q.correct;
            }
            if (isCorrect) correct++;
        });

        this.showQuizResults(correct);
    }

    /**
     * Muestra pantalla de resultados detallados
     * @param {number} correctCount
     */
    showQuizResults(correctCount) {
        const centerPanel = document.querySelector('.center-panel .course-content');
        if (!centerPanel) return;

        // Remover posibles contenidos de quiz previos
        centerPanel.querySelectorAll('.quiz-content, .quiz-results').forEach(el => el.remove());

        let resultsHTML = `
            <div class="quiz-results">
                <h2>Resultados del Quiz</h2>
                <p>Respuestas correctas: <strong>${correctCount}</strong> de ${this.quizData.length}</p>
        `;

        this.quizData.forEach((q, idx) => {
            const userAns = this.userAnswers[idx];
            let isCorrect = false;
            if (q.type === 'multiple') {
                isCorrect = Array.isArray(userAns) && Array.isArray(q.correct) && userAns.sort().join(',') === q.correct.sort().join(',');
            } else if (q.type === 'match') {
                isCorrect = JSON.stringify(userAns) === JSON.stringify(q.correct);
            } else if (q.type === 'text') {
                isCorrect = false;
            } else {
                isCorrect = userAns === q.correct;
            }

            const feedback = isCorrect ? q.feedbackCorrect : q.feedbackIncorrect;

            resultsHTML += `
                <div class="result-card ${isCorrect ? 'correct' : 'incorrect'}">
                    <h3>Pregunta ${idx + 1}</h3>
                    <p class="question">${q.question}</p>
                    <p><strong>Tu respuesta:</strong> ${this.formatAnswer(q, userAns)}</p>
                    ${q.correct !== null && q.type !== 'text' ? `<p><strong>Respuesta correcta:</strong> ${this.formatAnswer(q, q.correct)}</p>` : ''}
                    <p class="feedback">${feedback}</p>
                </div>`;
        });

        resultsHTML += '</div>';

        centerPanel.insertAdjacentHTML('beforeend', resultsHTML);
    }

    /**
     * Devuelve un string legible de una respuesta según tipo
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
     * Crea el contenedor base del quiz dentro del panel central y prepara la primera pregunta
     */
    createQuizContent() {
        const centerPanel = document.querySelector('.center-panel .course-content');
        if (!centerPanel) {
            console.warn('⚠️ center-panel no encontrado');
            return;
        }

        // Eliminar quiz existente si lo hubiera
        const existingQuiz = centerPanel.querySelector('.quiz-content');
        if (existingQuiz) existingQuiz.remove();

        const quizHTML = `
            <div class="quiz-content">
                <div class="quiz-header">
                    <h2>
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Quiz del Módulo ${this.currentModule}
                    </h2>
                    <p>Pon a prueba tus conocimientos con estas preguntas</p>
                </div>
                <div class="quiz-container">
                    <div class="question-card"></div>
                    <div class="quiz-progress">
                        <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
                        <span class="progress-text"></span>
                    </div>
                </div>
            </div>`;

        centerPanel.insertAdjacentHTML('beforeend', quizHTML);

        // Reiniciar estado y mostrar primera pregunta
        this.currentQuestionIndex = 0;
        this.renderCurrentQuestion();
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
            console.log('Progreso de video actualizado:', result);
            return result;
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
}
