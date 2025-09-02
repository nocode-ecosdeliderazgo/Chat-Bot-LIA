/**
 * LIA Chat Component
 * Maneja la lógica específica del chat con LIA
 */

class LiaChat {
    constructor() {
        this.apiEndpoint = '/api/openai'; // Endpoint de la API existente
        this.conversationHistory = [];
        this.currentContext = null;
        this.isConnected = true;
        
        this.init();
    }

    /**
     * Inicializar componente
     */
    init() {
        this.loadConversationHistory();
        this.setupContextualAnalysis();
        this.initializeWebSocket();
        
        console.log('🤖 LIA Chat Component inicializado');
    }

    /**
     * Cargar historial de conversación
     */
    loadConversationHistory() {
        try {
            const stored = localStorage.getItem('liaConversationHistory');
            if (stored) {
                this.conversationHistory = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error cargando historial:', error);
            this.conversationHistory = [];
        }
    }

    /**
     * Guardar historial de conversación
     */
    saveConversationHistory() {
        try {
            localStorage.setItem('liaConversationHistory', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    }

    /**
     * Configurar análisis contextual
     */
    setupContextualAnalysis() {
        this.currentContext = {
            course: 'Introducción a la IA',
            module: 1,
            moduleTitle: '¿Qué es la IA?',
            videoTimestamp: 0,
            userProgress: 0,
            lastActivity: new Date()
        };
    }

    /**
     * Inicializar WebSocket para comunicación en tiempo real
     */
    initializeWebSocket() {
        // En un entorno real, aquí se conectaría a un WebSocket
        // Por ahora, simulamos la conexión
        this.connectionStatus = 'connected';
        this.updateConnectionStatus();
    }

    /**
     * Enviar mensaje a LIA
     */
    async sendMessage(message, context = null) {
        try {
            // Añadir mensaje al historial
            this.addToHistory('user', message);

            // Preparar contexto
            const fullContext = this.prepareContext(context);

            // Enviar a la API
            const response = await this.callLiaAPI(message, fullContext);

            // Añadir respuesta al historial
            this.addToHistory('assistant', response.content);

            // Guardar historial
            this.saveConversationHistory();

            return {
                success: true,
                content: response.content,
                suggestions: response.suggestions || [],
                actions: response.actions || []
            };

        } catch (error) {
            console.error('Error enviando mensaje a LIA:', error);
            return {
                success: false,
                content: 'Lo siento, hay un problema de conexión. Por favor, inténtalo de nuevo.',
                error: error.message
            };
        }
    }

    /**
     * Preparar contexto para LIA
     */
    prepareContext(additionalContext = null) {
        const context = {
            // Contexto del curso
            course: this.currentContext.course,
            module: this.currentContext.module,
            moduleTitle: this.currentContext.moduleTitle,
            
            // Contexto del video
            videoTimestamp: this.getCurrentVideoTime(),
            videoTitle: 'Fundamentos del Machine Learning',
            
            // Contexto del usuario
            userProgress: this.currentContext.userProgress,
            conversationHistory: this.conversationHistory.slice(-5), // Últimos 5 mensajes
            
            // Contexto adicional
            ...additionalContext,
            
            // Prompt específico para cursos asincrónicos
            systemPrompt: this.getSystemPrompt()
        };

        return context;
    }

    /**
     * Obtener prompt del sistema
     */
    getSystemPrompt() {
        return `Eres LIA, un asistente inteligente especializado en educación online.
        
        CONTEXTO ACTUAL:
        - Curso: ${this.currentContext.course}
        - Módulo: ${this.currentContext.moduleTitle}
        - Progreso del estudiante: ${this.currentContext.userProgress}%
        
        INSTRUCCIONES:
        1. Responde de forma clara y educativa
        2. Relaciona tus respuestas con el contenido del curso actual
        3. Ofrece ejemplos prácticos cuando sea posible
        4. Sugiere acciones concretas (ver video específico, hacer ejercicio, etc.)
        5. Mantén un tono amigable y motivador
        6. Si mencionan un timestamp del video, haz referencia específica a ese momento
        
        CAPACIDADES:
        - Explicar conceptos del curso
        - Generar ejercicios y ejemplos
        - Crear resúmenes del contenido
        - Responder preguntas específicas sobre el material
        - Sugerir recursos adicionales
        - Evaluar comprensión con preguntas
        
        Responde siempre en español y enfócate en el aprendizaje efectivo.`;
    }

    /**
     * Llamar a la API de LIA
     */
    async callLiaAPI(message, context) {
        // Preparar payload para la API existente
        const payload = {
            message: message,
            context: context,
            mode: 'course_assistant',
            course_data: {
                id: 'intro-ia',
                module: context.module,
                timestamp: context.videoTimestamp
            }
        };

        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Procesar respuesta para incluir acciones sugeridas
        return this.processLiaResponse(data, message, context);
    }

    /**
     * Procesar respuesta de LIA
     */
    processLiaResponse(apiResponse, originalMessage, context) {
        const content = apiResponse.content || apiResponse.message || '';
        
        // Generar acciones sugeridas basadas en el contenido
        const actions = this.generateSuggestedActions(content, originalMessage, context);
        
        // Generar sugerencias de seguimiento
        const suggestions = this.generateFollowUpSuggestions(content, originalMessage);

        return {
            content: content,
            actions: actions,
            suggestions: suggestions,
            metadata: {
                timestamp: new Date(),
                context: context.moduleTitle,
                confidence: apiResponse.confidence || 0.95
            }
        };
    }

    /**
     * Generar acciones sugeridas
     */
    generateSuggestedActions(content, message, context) {
        const actions = [];
        const msg = message.toLowerCase();
        const resp = content.toLowerCase();

        // Acción: Ver momento específico del video
        if (resp.includes('video') || resp.includes('minuto')) {
            actions.push({
                id: 'watch_video',
                label: 'Ver en video',
                icon: 'fas fa-play',
                data: { timestamp: context.videoTimestamp }
            });
        }

        // Acción: Hacer ejercicio
        if (resp.includes('ejercicio') || resp.includes('práctica')) {
            actions.push({
                id: 'practice_exercise',
                label: 'Hacer ejercicio',
                icon: 'fas fa-dumbbell',
                data: { topic: this.extractTopic(msg) }
            });
        }

        // Acción: Tomar nota
        if (resp.includes('importante') || resp.includes('recuerda')) {
            actions.push({
                id: 'take_note',
                label: 'Tomar nota',
                icon: 'fas fa-sticky-note',
                data: { content: content.substring(0, 100) }
            });
        }

        // Acción: Ver recursos adicionales
        if (resp.includes('documento') || resp.includes('recurso')) {
            actions.push({
                id: 'view_resources',
                label: 'Ver recursos',
                icon: 'fas fa-file-alt',
                data: { topic: this.extractTopic(msg) }
            });
        }

        // Acción: Hacer quiz
        if (resp.includes('quiz') || resp.includes('evalúa') || resp.includes('pregunta')) {
            actions.push({
                id: 'take_quiz',
                label: 'Hacer quiz',
                icon: 'fas fa-question-circle',
                data: { topic: this.extractTopic(msg) }
            });
        }

        return actions.slice(0, 3); // Máximo 3 acciones
    }

    /**
     * Generar sugerencias de seguimiento
     */
    generateFollowUpSuggestions(content, message) {
        const suggestions = [];
        const msg = message.toLowerCase();

        if (msg.includes('machine learning') || msg.includes('ml')) {
            suggestions.push(
                '¿Qué tipos de Machine Learning existen?',
                'Dame ejemplos de algoritmos de ML',
                '¿Cuándo usar cada tipo de aprendizaje?'
            );
        } else if (msg.includes('ejemplo')) {
            suggestions.push(
                'Explícame este ejemplo paso a paso',
                '¿Hay más ejemplos similares?',
                '¿Cómo implementaría esto en código?'
            );
        } else if (msg.includes('diferencia')) {
            suggestions.push(
                'Explícame las ventajas y desventajas',
                '¿En qué casos usar cada uno?',
                'Dame un ejemplo comparativo'
            );
        } else {
            // Sugerencias generales
            suggestions.push(
                '¿Puedes darme más detalles?',
                'Explícalo con un ejemplo',
                '¿Cómo se relaciona con lo anterior?'
            );
        }

        return suggestions.slice(0, 3);
    }

    /**
     * Extraer tema principal del mensaje
     */
    extractTopic(message) {
        const topics = {
            'machine learning': 'machine-learning',
            'redes neuronales': 'neural-networks',
            'algoritmos': 'algorithms',
            'supervisado': 'supervised-learning',
            'no supervisado': 'unsupervised-learning',
            'refuerzo': 'reinforcement-learning'
        };

        for (const [key, value] of Object.entries(topics)) {
            if (message.includes(key)) {
                return value;
            }
        }

        return 'general';
    }

    /**
     * Añadir mensaje al historial
     */
    addToHistory(role, content) {
        this.conversationHistory.push({
            role: role,
            content: content,
            timestamp: new Date(),
            context: this.currentContext.moduleTitle
        });

        // Mantener solo los últimos 50 mensajes
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
    }

    /**
     * Obtener tiempo actual del video
     */
    getCurrentVideoTime() {
        const video = document.getElementById('courseVideo');
        return video ? Math.floor(video.currentTime) : 0;
    }

    /**
     * Actualizar contexto del curso
     */
    updateContext(newContext) {
        this.currentContext = {
            ...this.currentContext,
            ...newContext,
            lastActivity: new Date()
        };
    }

    /**
     * Actualizar estado de conexión
     */
    updateConnectionStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.lia-status span');

        if (statusIndicator && statusText) {
            if (this.isConnected) {
                statusIndicator.className = 'status-indicator online';
                statusText.textContent = 'En línea • Listo para ayudar';
            } else {
                statusIndicator.className = 'status-indicator offline';
                statusText.textContent = 'Desconectado • Reintentando...';
            }
        }
    }

    /**
     * Manejar acciones ejecutadas por el usuario
     */
    async handleAction(action, data = null) {
        switch (action.id) {
            case 'watch_video':
                this.seekToVideoTime(data.timestamp);
                break;
                
            case 'practice_exercise':
                await this.generateExercise(data.topic);
                break;
                
            case 'take_note':
                this.createNote(data.content);
                break;
                
            case 'view_resources':
                this.showResources(data.topic);
                break;
                
            case 'take_quiz':
                await this.generateQuiz(data.topic);
                break;
                
            default:
                console.log('Acción no reconocida:', action.id);
        }
    }

    /**
     * Buscar timestamp en video
     */
    seekToVideoTime(timestamp) {
        const video = document.getElementById('courseVideo');
        if (video) {
            video.currentTime = timestamp;
            video.play();
            
            // Notificar al usuario
            this.showActionFeedback('Video posicionado en el momento específico');
        }
    }

    /**
     * Generar ejercicio práctico
     */
    async generateExercise(topic) {
        const exercise = await this.sendMessage(`Genera un ejercicio práctico sobre ${topic} basado en el contenido actual del curso`);
        
        if (exercise.success) {
            this.showActionFeedback('Ejercicio generado');
            return exercise.content;
        }
    }

    /**
     * Crear nota automática
     */
    createNote(content) {
        const event = new CustomEvent('createNote', {
            detail: {
                content: content,
                timestamp: this.getCurrentVideoTime(),
                source: 'lia_suggestion'
            }
        });
        
        document.dispatchEvent(event);
        this.showActionFeedback('Nota creada automáticamente');
    }

    /**
     * Mostrar recursos relacionados
     */
    showResources(topic) {
        const event = new CustomEvent('showResources', {
            detail: { topic: topic }
        });
        
        document.dispatchEvent(event);
        this.showActionFeedback('Recursos relacionados mostrados');
    }

    /**
     * Generar quiz personalizado
     */
    async generateQuiz(topic) {
        const quiz = await this.sendMessage(`Crea una pregunta de quiz sobre ${topic} con múltiples opciones basada en el contenido del módulo actual`);
        
        if (quiz.success) {
            const event = new CustomEvent('showQuiz', {
                detail: { content: quiz.content }
            });
            
            document.dispatchEvent(event);
            this.showActionFeedback('Quiz personalizado generado');
        }
    }

    /**
     * Mostrar feedback de acción
     */
    showActionFeedback(message) {
        // Crear notificación temporal
        const feedback = document.createElement('div');
        feedback.className = 'action-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: var(--neo-gradient);
            color: var(--neo-text-dark);
            padding: 12px 16px;
            border-radius: var(--neo-radius-medium);
            box-shadow: var(--neo-shadow-small);
            z-index: 9999;
            font-size: 0.9rem;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        // Mostrar
        setTimeout(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        }, 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Limpiar historial de conversación
     */
    clearHistory() {
        this.conversationHistory = [];
        this.saveConversationHistory();
    }

    /**
     * Obtener estadísticas del chat
     */
    getStatistics() {
        return {
            totalMessages: this.conversationHistory.length,
            userMessages: this.conversationHistory.filter(m => m.role === 'user').length,
            assistantMessages: this.conversationHistory.filter(m => m.role === 'assistant').length,
            sessionDuration: Date.now() - (this.conversationHistory[0]?.timestamp || Date.now()),
            currentContext: this.currentContext
        };
    }

    /**
     * Exportar conversación
     */
    exportConversation() {
        const exportData = {
            course: this.currentContext.course,
            module: this.currentContext.moduleTitle,
            conversation: this.conversationHistory,
            exportDate: new Date(),
            statistics: this.getStatistics()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `lia-conversation-${Date.now()}.json`;
        link.click();
    }

    /**
     * Configurar respuestas offline
     */
    setupOfflineResponses() {
        const offlineResponses = {
            greeting: 'Hola, aunque estoy en modo offline, puedo ayudarte con información básica sobre el curso.',
            explanation: 'Te ayudo con conceptos básicos. La conexión se restablecerá pronto para respuestas más detalladas.',
            error: 'Sin conexión. Tus mensajes se guardarán y procesarán cuando vuelva la conectividad.'
        };

        return offlineResponses;
    }

    /**
     * Procesar mensajes en cola (offline)
     */
    processQueuedMessages() {
        const queued = localStorage.getItem('liaQueuedMessages');
        if (queued) {
            const messages = JSON.parse(queued);
            messages.forEach(async (message) => {
                await this.sendMessage(message.content, message.context);
            });
            localStorage.removeItem('liaQueuedMessages');
        }
    }
}

// Exportar para uso global
window.LiaChat = LiaChat;
