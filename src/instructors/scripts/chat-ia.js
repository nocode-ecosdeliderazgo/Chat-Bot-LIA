/* ===== CHAT IA INTEGRADO PARA PANEL DE MAESTROS ===== */

class ChatIA {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.apiEndpoint = '/api/chat-ia';
        this.context = 'instructor-panel';
        this.currentCourse = null;
        this.sessionId = this.generateSessionId();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadChatHistory();
        this.setupAutoSave();
        this.initializeWelcomeMessage();
    }

    bindEvents() {
        // Eventos del chat
        const sendButton = document.getElementById('sendIaBtn');
        const chatInput = document.getElementById('iaInput');
        
        sendButton?.addEventListener('click', () => this.sendMessage());
        chatInput?.addEventListener('keydown', (e) => this.handleKeyDown(e));
        chatInput?.addEventListener('input', (e) => this.handleInput(e));
        
        // Eventos de gestión de chat
        document.getElementById('clearChatBtn')?.addEventListener('click', () => this.clearChat());
        document.getElementById('exportChatBtn')?.addEventListener('click', () => this.exportChat());
        document.getElementById('saveChatBtn')?.addEventListener('click', () => this.saveChat());
        
        // Eventos de contexto
        document.addEventListener('courseChanged', (e) => this.setCourseContext(e.detail));
        document.addEventListener('moduleChanged', (e) => this.setModuleContext(e.detail));
    }

    handleKeyDown(event) {
        const chatInput = event.target;
        
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                // Permitir nueva línea con Shift+Enter
                return;
            } else {
                // Enviar mensaje con Enter
                event.preventDefault();
                this.sendMessage();
            }
        }
        
        // Auto-resize del textarea
        this.autoResizeTextarea(chatInput);
    }

    handleInput(event) {
        const chatInput = event.target;
        this.autoResizeTextarea(chatInput);
        
        // Indicar que el usuario está escribiendo
        this.showTypingIndicator(false);
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }

    async sendMessage() {
        const chatInput = document.getElementById('iaInput');
        const message = chatInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Limpiar input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        
        // Mostrar indicador de escritura
        this.showTypingIndicator(true);
        
        try {
            const response = await this.sendToAI(message);
            this.addMessage(response, 'assistant');
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.', 'assistant', true);
        } finally {
            this.showTypingIndicator(false);
        }
    }

    async sendToAI(message) {
        const context = this.buildContext();
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': this.sessionId
                },
                body: JSON.stringify({
                    message: message,
                    context: context,
                    messages: this.messages.slice(-10), // Últimos 10 mensajes para contexto
                    timestamp: Date.now()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.response || data.message;
            
        } catch (error) {
            console.error('AI API Error:', error);
            
            // Respuesta de demostración si falla la API
            return this.generateDemoResponse(message);
        }
    }

    generateDemoResponse(message) {
        const responses = [
            "Como tu asistente de IA para la gestión de cursos, puedo ayudarte con la creación de contenido, organización de módulos y estrategias pedagógicas.",
            "Estoy aquí para apoyarte en el desarrollo de tu curso. ¿Te gustaría que revise el contenido actual o sugieres mejoras?",
            "Puedo ayudarte a estructurar mejor tus módulos y actividades. ¿En qué aspecto específico te gustaría que me enfoque?",
            "Como asistente educativo, puedo sugerirte actividades interactivas y métodos de evaluación para tu curso.",
            "Estoy preparado para ayudarte con la planificación pedagógica y la optimización del contenido educativo."
        ];
        
        const contextResponses = {
            'crear': 'Te ayudo a crear contenido educativo efectivo. ¿Qué tipo de material necesitas desarrollar?',
            'módulo': 'Para estructurar módulos efectivos, considera dividir el contenido en unidades temáticas claras con objetivos específicos.',
            'actividad': 'Las actividades más efectivas combinan teoría y práctica. ¿Qué habilidades quieres que desarrollen tus estudiantes?',
            'evaluación': 'Para evaluar eficazmente, considera usar múltiples métodos: cuestionarios, proyectos prácticos y evaluación entre pares.',
            'curso': 'Un buen curso debe tener objetivos claros, contenido bien estructurado y evaluaciones alineadas con los objetivos de aprendizaje.'
        };
        
        // Buscar respuesta contextual
        for (const [key, response] of Object.entries(contextResponses)) {
            if (message.toLowerCase().includes(key)) {
                return response;
            }
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    buildContext() {
        const context = {
            type: this.context,
            timestamp: Date.now(),
            user_role: 'instructor'
        };
        
        if (this.currentCourse) {
            context.course = {
                id: this.currentCourse.id_ai_courses,
                name: this.currentCourse.name,
                modality: this.currentCourse.modality,
                status: this.currentCourse.status
            };
        }
        
        // Agregar contexto de la página actual
        const currentSection = this.getCurrentSection();
        if (currentSection) {
            context.current_section = currentSection;
        }
        
        return context;
    }

    getCurrentSection() {
        // Detectar en qué sección del panel está el usuario
        if (document.getElementById('courseFormSection')?.style.display !== 'none') {
            return 'course_form';
        } else if (document.getElementById('chatLayout')?.style.display !== 'none') {
            return 'course_management';
        } else {
            return 'dashboard';
        }
    }

    addMessage(content, sender, isError = false) {
        const message = {
            id: this.generateMessageId(),
            content: content,
            sender: sender,
            timestamp: Date.now(),
            isError: isError
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
        this.saveToStorage();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('iaMessages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `ia-message ${message.sender}`;
        messageElement.setAttribute('data-message-id', message.id);
        
        if (message.isError) {
            messageElement.classList.add('error');
        }
        
        const timeString = new Date(message.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${this.formatMessageContent(message.content)}</p>
                <div class="message-meta">
                    <span class="message-time">${timeString}</span>
                    ${message.sender === 'assistant' ? '<button class="copy-btn" onclick="chatIA.copyMessage(\'' + message.id + '\')">📋</button>' : ''}
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        
        // Animar entrada del mensaje
        requestAnimationFrame(() => {
            messageElement.classList.add('message-enter');
        });
    }

    formatMessageContent(content) {
        // Convertir markdown básico a HTML
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        
        // Convertir URLs en enlaces
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        return formatted;
    }

    showTypingIndicator(show) {
        this.isTyping = show;
        const indicator = document.getElementById('typingIndicator');
        const sendButton = document.getElementById('sendChatBtn');
        
        if (show) {
            if (!indicator) {
                this.createTypingIndicator();
            } else {
                indicator.style.display = 'flex';
            }
            sendButton?.classList.add('disabled');
        } else {
            if (indicator) {
                indicator.style.display = 'none';
            }
            sendButton?.classList.remove('disabled');
        }
    }

    createTypingIndicator() {
        const messagesContainer = document.getElementById('iaMessages');
        if (!messagesContainer) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'ia-message assistant typing';
        indicator.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('iaMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    copyMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            navigator.clipboard.writeText(message.content).then(() => {
                this.showNotification('Mensaje copiado al portapapeles', 'success');
            }).catch(() => {
                this.showNotification('Error al copiar mensaje', 'error');
            });
        }
    }

    clearChat() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el historial del chat?')) {
            this.messages = [];
            const messagesContainer = document.getElementById('iaMessages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }
            this.saveToStorage();
            this.initializeWelcomeMessage();
        }
    }

    async exportChat() {
        const chatData = {
            session_id: this.sessionId,
            course_context: this.currentCourse,
            messages: this.messages,
            export_date: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-ia-${this.sessionId}-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Chat exportado exitosamente', 'success');
    }

    async saveChat() {
        try {
            const response = await fetch('/api/chat-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    course_id: this.currentCourse?.id_ai_courses,
                    messages: this.messages,
                    context: this.buildContext()
                })
            });
            
            if (response.ok) {
                this.showNotification('Chat guardado exitosamente', 'success');
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            console.error('Error saving chat:', error);
            this.showNotification('Error al guardar el chat', 'error');
        }
    }

    loadChatHistory() {
        const saved = localStorage.getItem(`chat-ia-${this.sessionId}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.messages = data.messages || [];
                
                // Renderizar mensajes guardados
                this.messages.forEach(message => {
                    this.renderMessage(message);
                });
                
                this.scrollToBottom();
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
        }
    }

    saveToStorage() {
        const data = {
            session_id: this.sessionId,
            messages: this.messages,
            last_updated: Date.now()
        };
        
        localStorage.setItem(`chat-ia-${this.sessionId}`, JSON.stringify(data));
    }

    setupAutoSave() {
        // Guardar automáticamente cada 30 segundos
        setInterval(() => {
            if (this.messages.length > 0) {
                this.saveToStorage();
            }
        }, 30000);
    }

    initializeWelcomeMessage() {
        if (this.messages.length === 0) {
            const welcomeMessage = `¡Hola! Soy tu asistente de IA para la gestión de cursos. 

Puedo ayudarte con:
• **Creación de contenido** educativo
• **Estructuración de módulos** y lecciones
• **Diseño de actividades** interactivas
• **Estrategias pedagógicas** efectivas
• **Evaluación y retroalimentación**

¿En qué puedo ayudarte hoy?`;

            setTimeout(() => {
                this.addMessage(welcomeMessage, 'assistant');
            }, 1000);
        }
    }

    setCourseContext(course) {
        this.currentCourse = course;
        
        if (course) {
            const contextMessage = `Ahora estoy ayudándote con el curso: **${course.name}**
            
Modalidad: ${this.getModalityText(course.modality)}
Estado: ${this.getStatusText(course.status)}

¿Qué aspecto del curso te gustaría trabajar?`;
            
            this.addMessage(contextMessage, 'assistant');
        }
    }

    setModuleContext(module) {
        if (module) {
            const contextMessage = `Enfocándonos en el módulo: **${module.name}**
            
¿Te gustaría que revise el contenido, sugiera actividades o ayude con la estructura?`;
            
            this.addMessage(contextMessage, 'assistant');
        }
    }

    getModalityText(modality) {
        const modalityMap = {
            'async': 'Asíncrona',
            'sync': 'Síncrona', 
            'mixed': 'Mixta'
        };
        return modalityMap[modality] || modality;
    }

    getStatusText(status) {
        const statusMap = {
            'draft': 'Borrador',
            'published': 'Publicado',
            'archived': 'Archivado'
        };
        return statusMap[status] || status;
    }

    generateSessionId() {
        return 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    generateMessageId() {
        return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    showNotification(message, type) {
        // Usar el sistema de notificaciones del courseManager si está disponible
        if (window.courseManager && window.courseManager.showNotification) {
            window.courseManager.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Métodos públicos para integración
    sendContextualMessage(message, context) {
        const oldContext = this.context;
        this.context = context;
        this.sendMessage(message);
        this.context = oldContext;
    }

    addSystemMessage(message) {
        this.addMessage(message, 'system');
    }

    getMessageHistory() {
        return this.messages;
    }

    resetSession() {
        this.sessionId = this.generateSessionId();
        this.messages = [];
        this.currentCourse = null;
        this.clearChat();
    }
}

// Funciones de utilidad para interacciones específicas
class ChatIAHelpers {
    static suggestCourseStructure(course) {
        const suggestions = [
            "Para una estructura efectiva, considera estos elementos:",
            "• **Introducción**: Objetivos y prerrequisitos",
            "• **Módulos temáticos**: 3-5 módulos principales",
            "• **Actividades prácticas**: 2-3 por módulo",
            "• **Evaluaciones**: Formativa y sumativa",
            "• **Recursos adicionales**: Lecturas y enlaces"
        ];
        
        return suggestions.join('\n');
    }

    static generateActivitySuggestions(moduleType) {
        const activities = {
            'theoretical': [
                'Foros de discusión',
                'Análisis de casos',
                'Mapas conceptuales',
                'Ensayos reflexivos'
            ],
            'practical': [
                'Proyectos hands-on',
                'Simulaciones',
                'Laboratorios virtuales',
                'Ejercicios de programación'
            ],
            'mixed': [
                'Estudios de caso prácticos',
                'Proyectos colaborativos',
                'Presentaciones interactivas',
                'Talleres en línea'
            ]
        };
        
        return activities[moduleType] || activities['mixed'];
    }

    static getAssessmentStrategies() {
        return [
            "**Evaluación Diagnóstica**: Pre-tests para conocer nivel inicial",
            "**Evaluación Formativa**: Quizzes y actividades durante el módulo",
            "**Evaluación Sumativa**: Proyectos finales y exámenes",
            "**Autoevaluación**: Reflexiones y rúbricas",
            "**Evaluación entre pares**: Revisión colaborativa"
        ];
    }
}

// Inicialización automática
let chatIA;
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en el panel de instructores
    if (document.querySelector('.chat-ia')) {
        chatIA = new ChatIA();
        window.chatIA = chatIA;
        window.ChatIAHelpers = ChatIAHelpers;
    }
});

// Exportar para uso global
window.ChatIA = ChatIA;