// ===== CHAT ONLINE - JAVASCRIPT PRINCIPAL =====

class ChatOnline {
    constructor() {
        this.currentModule = 3;
        this.currentTab = 'video';
        this.isLiaTyping = false;
        this.notes = [];
        this.isSearchMode = false;
        
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Chat Online...');
        this.setupEventListeners();
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
        // Remover clase current de todos los módulos
        document.querySelectorAll('.module-item').forEach(item => {
            item.classList.remove('current');
        });
        
        // Agregar clase current al módulo seleccionado
        const selectedModule = document.querySelector(`[data-module="${moduleId}"]`);
        if (selectedModule) {
            selectedModule.classList.add('current');
        }
        
        this.currentModule = moduleId;
        
        // 🎥 CAMBIAR VIDEO POR MÓDULO
        this.changeVideoByModule(moduleId);
        
        // Actualizar información del módulo
        this.updateModuleInfo(moduleId);
        
        // Cargar contenido del módulo
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
                </div>
                
                <div class="quiz-container">
                    <div class="question-card">
                        <div class="question-header">
                            <span class="question-number">Pregunta 1 de 5</span>
                            <span class="question-timer">⏱️ 02:30</span>
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

// ===== EXPORTAR PARA USO EXTERNO =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatOnline;
}
