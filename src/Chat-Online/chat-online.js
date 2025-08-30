/**
 * Chat Online - Funcionalidad Principal
 * Sistema de chat asíncrono con LIA para cursos pregrabados
 */

class ChatOnline {
    constructor() {
        this.currentModule = 3;
        this.chatHistory = [];
        this.isTyping = false;
        this.videoPlayer = null;
        this.courseViewer = null;
        this.liaChat = null;
        
        this.init();
    }

    /**
     * Inicialización del sistema
     */
    init() {
        this.initializeComponents();
        this.setupEventListeners();
        this.loadUserData();
        this.loadCourseProgress();
        this.setupKeyboardShortcuts();
        this.initializeChat();
        
        console.log('🚀 Chat Online inicializado correctamente');
    }

    /**
     * Inicializar componentes
     */
    initializeComponents() {
        // Inicializar reproductor de video
        if (typeof VideoPlayer !== 'undefined') {
            this.videoPlayer = new VideoPlayer('courseVideo');
        }

        // Inicializar visor de curso
        if (typeof CourseViewer !== 'undefined') {
            this.courseViewer = new CourseViewer();
        }

        // Inicializar chat con LIA
        if (typeof LiaChat !== 'undefined') {
            this.liaChat = new LiaChat();
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Header buttons
        this.setupHeaderButtons();
        
        // Panel collapse/expand
        this.setupPanelControls();
        
        // Module navigation
        this.setupModuleNavigation();
        
        // Chat functionality
        this.setupChatControls();
        
        // Tools tabs
        this.setupToolsTabs();
        
        // Notes functionality
        this.setupNotesControls();
        
        // Quiz functionality
        this.setupQuizControls();
        
        // Window events
        this.setupWindowEvents();
    }

    /**
     * Configurar botones del header
     */
    setupHeaderButtons() {
        // Botón de regreso
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.goBack();
            });
        }

        // Botón de configuración
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        // Botón de pantalla completa
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
    }

    /**
     * Configurar controles de paneles
     */
    setupPanelControls() {
        const collapseButtons = document.querySelectorAll('.collapse-panel');
        
        collapseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.getAttribute('data-panel');
                this.togglePanel(panel);
            });
        });
    }

    /**
     * Configurar navegación de módulos
     */
    setupModuleNavigation() {
        const moduleItems = document.querySelectorAll('.module-item');
        
        moduleItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const moduleId = parseInt(e.currentTarget.getAttribute('data-module'));
                this.loadModule(moduleId);
            });
        });
    }

    /**
     * Configurar controles del chat
     */
    setupChatControls() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessage');
        const clearButton = document.getElementById('clearChat');
        const voiceButton = document.getElementById('voiceInput');
        const attachButton = document.getElementById('attachFile');

        // Input del mensaje
        if (messageInput) {
            messageInput.addEventListener('input', (e) => {
                this.handleInputChange(e);
            });

            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-resize
            messageInput.addEventListener('input', () => {
                this.autoResizeTextarea(messageInput);
            });
        }

        // Botón de envío
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Limpiar chat
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearChat();
            });
        }

        // Entrada de voz
        if (voiceButton) {
            voiceButton.addEventListener('click', () => {
                this.toggleVoiceInput();
            });
        }

        // Adjuntar archivo
        if (attachButton) {
            attachButton.addEventListener('click', () => {
                this.openFileDialog();
            });
        }

        // Sugerencias rápidas
        const suggestions = document.querySelectorAll('.suggestion');
        suggestions.forEach(suggestion => {
            suggestion.addEventListener('click', (e) => {
                const text = e.currentTarget.getAttribute('data-text');
                this.selectSuggestion(text);
            });
        });

        // Botones de acción en mensajes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('action-btn')) {
                const action = e.target.getAttribute('data-action');
                this.handleMessageAction(action);
            }
        });
    }

    /**
     * Configurar pestañas de herramientas
     */
    setupToolsTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    /**
     * Configurar controles de notas
     */
    setupNotesControls() {
        const addNoteBtn = document.getElementById('addNote');
        const saveNoteBtn = document.getElementById('saveNote');
        const cancelNoteBtn = document.getElementById('cancelNote');

        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => {
                this.openNoteEditor();
            });
        }

        if (saveNoteBtn) {
            saveNoteBtn.addEventListener('click', () => {
                this.saveNote();
            });
        }

        if (cancelNoteBtn) {
            cancelNoteBtn.addEventListener('click', () => {
                this.cancelNoteEdit();
            });
        }

        // Eliminar notas
        document.addEventListener('click', (e) => {
            if (e.target.closest('.note-actions .fa-trash')) {
                const noteItem = e.target.closest('.note-item');
                this.deleteNote(noteItem);
            }
        });
    }

    /**
     * Configurar controles del quiz
     */
    setupQuizControls() {
        const newQuestionBtn = document.getElementById('newQuestion');
        const quizHelpBtn = document.getElementById('quizHelp');
        const submitButtons = document.querySelectorAll('.quiz-submit');

        if (newQuestionBtn) {
            newQuestionBtn.addEventListener('click', () => {
                this.generateNewQuestion();
            });
        }

        if (quizHelpBtn) {
            quizHelpBtn.addEventListener('click', () => {
                this.showQuizHelp();
            });
        }

        submitButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.submitQuizAnswer(e.target.closest('.quiz-question'));
            });
        });
    }

    /**
     * Configurar eventos de ventana
     */
    setupWindowEvents() {
        // Redimensionar ventana
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // Visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseActivities();
            } else {
                this.resumeActivities();
            }
        });

        // Prevenir salida accidental
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    /**
     * Configurar atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: Enviar mensaje
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.sendMessage();
            }
            
            // Escape: Cancelar acciones
            if (e.key === 'Escape') {
                this.cancelCurrentAction();
            }
            
            // F11: Pantalla completa
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
            
            // Ctrl/Cmd + /: Mostrar atajos
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    }

    /**
     * Inicializar chat con mensaje de bienvenida
     */
    initializeChat() {
        // El mensaje de bienvenida ya está en el HTML
        // Aquí podemos añadir lógica adicional si es necesario
        this.updateChatStatus();
    }

    /**
     * Cargar datos del usuario
     */
    loadUserData() {
        try {
            const userData = localStorage.getItem('chatOnlineUserData');
            if (userData) {
                this.userData = JSON.parse(userData);
            } else {
                this.userData = {
                    name: 'Usuario',
                    email: '',
                    preferences: {
                        autoplay: false,
                        notifications: true,
                        theme: 'auto'
                    }
                };
            }
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
            this.userData = { name: 'Usuario' };
        }
    }

    /**
     * Cargar progreso del curso
     */
    loadCourseProgress() {
        try {
            const progress = localStorage.getItem('courseProgress');
            if (progress) {
                this.courseProgress = JSON.parse(progress);
            } else {
                this.courseProgress = {
                    currentModule: 3,
                    completedModules: [1, 2],
                    totalTime: 2520, // segundos
                    notes: [],
                    bookmarks: [],
                    quiz: { correct: 8, total: 10 }
                };
            }
            this.updateProgressDisplay();
        } catch (error) {
            console.error('Error cargando progreso del curso:', error);
        }
    }

    /**
     * Manejar cambios en el input del mensaje
     */
    handleInputChange(e) {
        const input = e.target;
        const sendBtn = document.getElementById('sendMessage');
        
        if (sendBtn) {
            sendBtn.disabled = input.value.trim().length === 0;
            
            // Añadir/quitar clase para animaciones
            const container = input.closest('.input-wrapper');
            if (input.value.trim().length > 0) {
                container.classList.add('has-content');
            } else {
                container.classList.remove('has-content');
            }
        }
    }

    /**
     * Auto-redimensionar textarea
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    /**
     * Enviar mensaje
     */
    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        const message = messageInput.value.trim();
        if (!message) return;

        // Limpiar input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        this.handleInputChange({ target: messageInput });

        // Añadir mensaje del usuario
        this.addUserMessage(message);

        // Mostrar indicador de escritura
        this.showTypingIndicator();

        try {
            // Simular respuesta de LIA (aquí se integraría con la API real)
            const response = await this.getLiaResponse(message);
            
            // Ocultar indicador de escritura
            this.hideTypingIndicator();
            
            // Añadir respuesta de LIA
            this.addLiaMessage(response);
            
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            this.hideTypingIndicator();
            this.addLiaMessage('Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.');
        }

        // Scroll al final
        this.scrollToBottom();
    }

    /**
     * Añadir mensaje del usuario
     */
    addUserMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageEl = this.createMessageElement({
            type: 'user',
            author: this.userData.name || 'Usuario',
            content: message,
            time: new Date()
        });

        chatMessages.appendChild(messageEl);
        this.chatHistory.push({ type: 'user', content: message, time: new Date() });
    }

    /**
     * Añadir mensaje de LIA
     */
    addLiaMessage(message, actions = null) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageEl = this.createMessageElement({
            type: 'lia',
            author: 'LIA',
            content: message,
            time: new Date(),
            actions: actions
        });

        chatMessages.appendChild(messageEl);
        this.chatHistory.push({ type: 'lia', content: message, time: new Date() });
    }

    /**
     * Crear elemento de mensaje
     */
    createMessageElement(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${data.type}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar neo-circle';
        
        if (data.type === 'lia') {
            avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
        } else {
            avatarDiv.innerHTML = `<div class="avatar-fallback">${data.author.charAt(0)}</div>`;
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content neo-card';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        headerDiv.innerHTML = `
            <span class="message-author">${data.author}</span>
            <span class="message-time">${this.formatTime(data.time)}</span>
        `;
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = data.content;
        
        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(textDiv);
        
        // Añadir acciones si existen
        if (data.actions) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            data.actions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'neo-btn neo-btn-small action-btn';
                btn.setAttribute('data-action', action.id);
                btn.innerHTML = `<i class="${action.icon}"></i> ${action.label}`;
                actionsDiv.appendChild(btn);
            });
            
            contentDiv.appendChild(actionsDiv);
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }

    /**
     * Obtener respuesta de LIA (simulada)
     */
    async getLiaResponse(message) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Respuestas basadas en contexto
        const responses = this.generateContextualResponse(message);
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Generar respuesta contextual
     */
    generateContextualResponse(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('machine learning') || msg.includes('ml')) {
            return [
                'El Machine Learning es un subcampo de la inteligencia artificial que permite a las máquinas aprender y mejorar automáticamente a través de la experiencia sin ser programadas explícitamente.',
                'En el video actual estamos cubriendo los fundamentos del ML. ¿Te gustaría que profundice en algún tipo específico de aprendizaje?'
            ];
        }
        
        if (msg.includes('ejemplo') || msg.includes('práctica')) {
            return [
                'Aquí tienes algunos ejemplos prácticos de Machine Learning:\n\n• Sistemas de recomendación (Netflix, Spotify)\n• Reconocimiento de imágenes\n• Procesamiento de lenguaje natural\n• Detección de fraudes\n\n¿Te interesa alguno en particular?'
            ];
        }
        
        if (msg.includes('diferencia') && msg.includes('ia')) {
            return [
                'La IA es el campo más amplio que busca crear máquinas inteligentes, mientras que ML es un método específico para lograr IA mediante el aprendizaje automático a partir de datos.'
            ];
        }
        
        if (msg.includes('resumen') || msg.includes('video')) {
            return [
                'Resumen del módulo actual "Fundamentos del ML":\n\n• Definición de Machine Learning\n• Tipos de aprendizaje (supervisado, no supervisado, refuerzo)\n• Algoritmos básicos\n• Aplicaciones prácticas\n\n¿Quieres que profundice en algún punto?'
            ];
        }
        
        // Respuestas generales
        return [
            'Interesante pregunta. Basándome en el contenido del curso, puedo ayudarte a entender mejor este concepto. ¿Podrías ser más específico?',
            'Perfecto, esa es una excelente pregunta sobre el tema que estamos viendo. Te explico...',
            'Me alegra que preguntes sobre esto. Es un concepto fundamental en el curso. Déjame explicártelo paso a paso.'
        ];
    }

    /**
     * Mostrar indicador de escritura
     */
    showTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'block';
            this.isTyping = true;
            this.scrollToBottom();
        }
    }

    /**
     * Ocultar indicador de escritura
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
            this.isTyping = false;
        }
    }

    /**
     * Scroll al final del chat
     */
    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    }

    /**
     * Formatear tiempo
     */
    formatTime(date) {
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
     * Seleccionar sugerencia rápida
     */
    selectSuggestion(text) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = text;
            messageInput.focus();
            this.handleInputChange({ target: messageInput });
        }
    }

    /**
     * Manejar acciones de mensaje
     */
    handleMessageAction(action) {
        switch (action) {
            case 'explicar-ml':
                this.addUserMessage('¿Puedes explicarme qué es el machine learning?');
                this.getLiaResponse('explicar machine learning').then(response => {
                    this.addLiaMessage(response);
                    this.scrollToBottom();
                });
                break;
                
            case 'ejercicios':
                this.addUserMessage('Dame ejercicios prácticos de machine learning');
                this.getLiaResponse('ejercicios prácticos').then(response => {
                    this.addLiaMessage(response);
                    this.scrollToBottom();
                });
                break;
                
            case 'resumen':
                this.addUserMessage('Hazme un resumen del video actual');
                this.getLiaResponse('resumen video').then(response => {
                    this.addLiaMessage(response);
                    this.scrollToBottom();
                });
                break;
        }
    }

    /**
     * Cambiar pestaña de herramientas
     */
    switchTab(tabId) {
        // Desactivar todas las pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Activar pestaña seleccionada
        const selectedBtn = document.querySelector(`[data-tab="${tabId}"]`);
        const selectedContent = document.getElementById(`${tabId}Tab`);
        
        if (selectedBtn && selectedContent) {
            selectedBtn.classList.add('active');
            selectedContent.classList.add('active');
        }
    }

    /**
     * Cargar módulo
     */
    loadModule(moduleId) {
        if (moduleId > this.courseProgress.completedModules.length + 1) {
            this.showNotification('Este módulo aún no está disponible', 'warning');
            return;
        }

        // Actualizar UI
        document.querySelectorAll('.module-item').forEach(item => {
            item.classList.remove('current');
        });
        
        const moduleItem = document.querySelector(`[data-module="${moduleId}"]`);
        if (moduleItem) {
            moduleItem.classList.add('current');
        }

        this.currentModule = moduleId;
        this.updateProgressDisplay();
        
        // Cargar contenido del módulo
        this.loadModuleContent(moduleId);
        
        this.showNotification(`Módulo ${moduleId} cargado`, 'success');
    }

    /**
     * Cargar contenido del módulo
     */
    loadModuleContent(moduleId) {
        // Aquí se cargaría el contenido específico del módulo
        // Videos, documentos, etc.
        console.log(`Cargando contenido del módulo ${moduleId}`);
    }

    /**
     * Actualizar visualización del progreso
     */
    updateProgressDisplay() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const statNumber = document.querySelector('.stat-number');
        
        const totalModules = 5;
        const completedModules = this.courseProgress.completedModules.length;
        const currentProgress = Math.round((completedModules / totalModules) * 100);
        
        if (progressFill) {
            progressFill.style.width = `${currentProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Módulo ${this.currentModule} de ${totalModules} • ${currentProgress}% completado`;
        }
        
        if (statNumber) {
            statNumber.textContent = `${currentProgress}%`;
        }
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Añadir estilos si no existen
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--neo-gradient);
                    border-radius: var(--neo-radius-medium);
                    box-shadow: var(--neo-shadow-large);
                    padding: 16px;
                    z-index: 10000;
                    max-width: 400px;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .notification.show { transform: translateX(0); }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--neo-text-dark);
                }
                .notification-close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: none;
                    border: none;
                    color: var(--neo-text-dark);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 50%;
                }
                .notification-success { border-left: 4px solid #22c55e; }
                .notification-warning { border-left: 4px solid #f59e0b; }
                .notification-error { border-left: 4px solid #ef4444; }
                .notification-info { border-left: 4px solid var(--neo-primary); }
            `;
            document.head.appendChild(styles);
        }
        
        // Añadir al DOM
        document.body.appendChild(notification);
        
        // Mostrar notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
        
        // Cerrar manualmente
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
    }

    /**
     * Remover notificación
     */
    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Obtener icono de notificación
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Limpiar chat
     */
    clearChat() {
        if (confirm('¿Estás seguro de que quieres limpiar el historial del chat?')) {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                // Mantener solo el mensaje de bienvenida
                const welcomeMessage = chatMessages.querySelector('.message.lia-message');
                chatMessages.innerHTML = '';
                if (welcomeMessage) {
                    chatMessages.appendChild(welcomeMessage);
                }
            }
            
            this.chatHistory = [];
            this.showNotification('Chat limpiado', 'success');
        }
    }

    /**
     * Ir atrás
     */
    goBack() {
        if (confirm('¿Seguro que quieres salir? El progreso se guardará automáticamente.')) {
            this.saveProgress();
            window.location.href = '../cursos.html';
        }
    }

    /**
     * Guardar progreso
     */
    saveProgress() {
        try {
            localStorage.setItem('courseProgress', JSON.stringify(this.courseProgress));
            localStorage.setItem('chatOnlineUserData', JSON.stringify(this.userData));
            console.log('Progreso guardado correctamente');
        } catch (error) {
            console.error('Error guardando progreso:', error);
        }
    }

    /**
     * Verificar cambios sin guardar
     */
    hasUnsavedChanges() {
        // Verificar si hay notas sin guardar, etc.
        const noteEditor = document.getElementById('noteEditor');
        return noteEditor && noteEditor.style.display !== 'none';
    }

    /**
     * Abrir configuración
     */
    openSettings() {
        this.showNotification('Funcionalidad en desarrollo', 'info');
    }

    /**
     * Toggle pantalla completa
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Toggle panel
     */
    togglePanel(panel) {
        const panelElement = document.querySelector(`.${panel}-panel`);
        if (panelElement) {
            panelElement.classList.toggle('collapsed');
        }
    }

    /**
     * Manejar redimensionado de ventana
     */
    handleWindowResize() {
        // Ajustar layout responsivo si es necesario
        this.updateLayout();
    }

    /**
     * Actualizar layout
     */
    updateLayout() {
        const width = window.innerWidth;
        
        if (width <= 968) {
            document.body.classList.add('mobile-layout');
        } else {
            document.body.classList.remove('mobile-layout');
        }
    }

    /**
     * Pausar actividades
     */
    pauseActivities() {
        if (this.videoPlayer) {
            this.videoPlayer.pause();
        }
    }

    /**
     * Reanudar actividades
     */
    resumeActivities() {
        // Reanudar actividades si es necesario
    }

    /**
     * Cancelar acción actual
     */
    cancelCurrentAction() {
        this.cancelNoteEdit();
        this.hideTypingIndicator();
    }

    /**
     * Mostrar atajos de teclado
     */
    showKeyboardShortcuts() {
        this.showNotification('Atajos: Ctrl+Enter (enviar), Esc (cancelar), F11 (pantalla completa)', 'info');
    }

    /**
     * Abrir editor de notas
     */
    openNoteEditor() {
        const noteEditor = document.getElementById('noteEditor');
        if (noteEditor) {
            noteEditor.style.display = 'block';
            const textarea = noteEditor.querySelector('textarea');
            if (textarea) {
                textarea.focus();
            }
        }
    }

    /**
     * Guardar nota
     */
    saveNote() {
        const noteText = document.getElementById('noteText');
        if (noteText && noteText.value.trim()) {
            const note = {
                content: noteText.value.trim(),
                time: this.getCurrentVideoTime(),
                timestamp: new Date()
            };
            
            this.courseProgress.notes.push(note);
            this.saveProgress();
            this.addNoteToList(note);
            this.cancelNoteEdit();
            this.showNotification('Nota guardada', 'success');
        }
    }

    /**
     * Cancelar edición de nota
     */
    cancelNoteEdit() {
        const noteEditor = document.getElementById('noteEditor');
        const noteText = document.getElementById('noteText');
        
        if (noteEditor) {
            noteEditor.style.display = 'none';
        }
        
        if (noteText) {
            noteText.value = '';
        }
    }

    /**
     * Obtener tiempo actual del video
     */
    getCurrentVideoTime() {
        const video = document.getElementById('courseVideo');
        if (video) {
            const currentTime = video.currentTime;
            const minutes = Math.floor(currentTime / 60);
            const seconds = Math.floor(currentTime % 60);
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return '00:00';
    }

    /**
     * Añadir nota a la lista
     */
    addNoteToList(note) {
        const notesList = document.querySelector('.notes-list');
        if (notesList) {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item neo-card';
            noteElement.innerHTML = `
                <div class="note-header">
                    <span class="note-time">${note.time}</span>
                    <div class="note-actions">
                        <button class="neo-btn neo-btn-micro">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="neo-btn neo-btn-micro">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">${note.content}</div>
            `;
            
            notesList.insertBefore(noteElement, notesList.firstChild);
        }
    }

    /**
     * Eliminar nota
     */
    deleteNote(noteElement) {
        if (confirm('¿Eliminar esta nota?')) {
            noteElement.remove();
            this.showNotification('Nota eliminada', 'success');
        }
    }

    /**
     * Generar nueva pregunta de quiz
     */
    generateNewQuestion() {
        this.showNotification('Generando nueva pregunta...', 'info');
        // Aquí se generaría una nueva pregunta basada en el contenido
    }

    /**
     * Mostrar ayuda del quiz
     */
    showQuizHelp() {
        this.showNotification('Las preguntas se basan en el contenido del módulo actual', 'info');
    }

    /**
     * Enviar respuesta del quiz
     */
    submitQuizAnswer(questionElement) {
        const selectedOption = questionElement.querySelector('input[type="radio"]:checked');
        if (selectedOption) {
            const isCorrect = selectedOption.value === 'supervisado'; // Respuesta correcta hardcodeada
            this.showNotification(
                isCorrect ? '¡Correcto! Excelente trabajo.' : 'Incorrecto. La respuesta correcta es "Aprendizaje Supervisado".',
                isCorrect ? 'success' : 'error'
            );
        } else {
            this.showNotification('Por favor selecciona una opción', 'warning');
        }
    }

    /**
     * Actualizar estado del chat
     */
    updateChatStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.lia-status span');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = 'En línea • Listo para ayudar';
        }
    }

    /**
     * Toggle entrada de voz
     */
    toggleVoiceInput() {
        this.showNotification('Función de voz en desarrollo', 'info');
    }

    /**
     * Abrir diálogo de archivo
     */
    openFileDialog() {
        this.showNotification('Función de archivos en desarrollo', 'info');
    }
}

// Función global para ir atrás (llamada desde el HTML)
function goBack() {
    if (window.chatOnline) {
        window.chatOnline.goBack();
    } else {
        window.history.back();
    }
}

// Función global para buscar tiempo específico en video
function seekToTime(seconds) {
    const video = document.getElementById('courseVideo');
    if (video) {
        video.currentTime = seconds;
        video.play();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.chatOnline = new ChatOnline();
});
