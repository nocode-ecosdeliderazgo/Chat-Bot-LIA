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
     * Configurar análisis contextual - HARDCODEADO para Taller de IA con tutor personalizado
     */
    setupContextualAnalysis() {
        this.currentContext = {
            taller: 'Taller de fundamentos de Inteligencia Artificial con tutor personalizado',
            tipo: 'Taller interactivo',
            tutor: 'LIA - Tutor Personalizado de IA',
            modalidad: '100% online con tutor personalizado IA',
            module: 1,
            moduleTitle: 'Fundamentos de Inteligencia Artificial',
            moduleDescription: 'Conceptos básicos de IA, Machine Learning y aplicaciones prácticas con acompañamiento personalizado',
            documentoApoyo: 'Doc de apoyo - Fundamentos de IA.pdf',
            videoTimestamp: 0,
            userProgress: 25, // Módulo 1 - Fundamentos
            totalModules: 4,
            objetivos: [
                'Comprender los conceptos fundamentales de IA',
                'Identificar tipos de Machine Learning',
                'Reconocer aplicaciones prácticas de IA',
                'Desarrollar pensamiento crítico sobre IA'
            ],
            contextoEducativo: 'Taller práctico con tutor personalizado para aprender IA desde cero con acompañamiento individualizado',
            nivelDificultad: 'Principiante',
            enfoque: 'Fundamentos teóricos y aplicaciones prácticas',
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
     * Preparar contexto para LIA - HARDCODEADO para Taller de IA con tutor personalizado
     */
    prepareContext(additionalContext = null) {
        const context = {
            // Contexto del taller hardcodeado
            taller: this.currentContext.taller,
            tipo: this.currentContext.tipo,
            tutor: this.currentContext.tutor,
            modalidad: this.currentContext.modalidad,
            module: this.currentContext.module,
            moduleTitle: this.currentContext.moduleTitle,
            moduleDescription: this.currentContext.moduleDescription,
            documentoApoyo: this.currentContext.documentoApoyo,
            
            // Contexto del video
            videoTimestamp: this.getCurrentVideoTime(),
            videoTitle: this.currentContext.moduleTitle,
            
            // Contexto del usuario y taller
            userProgress: this.currentContext.userProgress,
            totalModules: this.currentContext.totalModules,
            objetivos: this.currentContext.objetivos,
            contextoEducativo: this.currentContext.contextoEducativo,
            nivelDificultad: this.currentContext.nivelDificultad,
            enfoque: this.currentContext.enfoque,
            conversationHistory: this.conversationHistory.slice(-5), // Últimos 5 mensajes
            
            // Contexto adicional
            ...additionalContext,
            
            // Prompt específico para el taller de IA
            systemPrompt: this.getSystemPrompt()
        };

        return context;
    }

    /**
     * Obtener prompt del sistema - HARDCODEADO para Taller de IA con tutor personalizado
     */
    getSystemPrompt() {
        return `Eres LIA, un tutor personalizado especializado en enseñar fundamentos de Inteligencia Artificial.
        
        CONTEXTO ACTUAL DEL TALLER:
        - Taller: ${this.currentContext.taller}
        - Tipo: ${this.currentContext.tipo}
        - Tutor: ${this.currentContext.tutor}
        - Modalidad: ${this.currentContext.modalidad}
        - Módulo actual: ${this.currentContext.module} - ${this.currentContext.moduleTitle}
        - Descripción: ${this.currentContext.moduleDescription}
        - Nivel: ${this.currentContext.nivelDificultad}
        - Enfoque: ${this.currentContext.enfoque}
        - Progreso del estudiante: ${this.currentContext.userProgress}% del taller completo
        - Documento de apoyo: ${this.currentContext.documentoApoyo}
        
        OBJETIVOS DE ESTE MÓDULO:
        ${this.currentContext.objetivos.map(obj => `• ${obj}`).join('\n')}
        
        ESPECIALIZACIÓN COMO TUTOR:
        Te especializas específicamente en:
        - Conceptos fundamentales de Inteligencia Artificial
        - Machine Learning básico y sus tipos
        - Aplicaciones prácticas de IA en diferentes sectores
        - Historia y evolución de la IA
        - Ética y consideraciones en IA
        - Introducción a algoritmos de IA
        
        METODOLOGÍA DE ENSEÑANZA:
        1. Explica conceptos de forma CLARA y GRADUAL para principiantes
        2. Usa ANALOGÍAS y EJEMPLOS de la vida cotidiana
        3. Proporciona EJERCICIOS prácticos y actividades de refuerzo
        4. Adapta el ritmo según las preguntas del estudiante
        5. Fomenta el PENSAMIENTO CRÍTICO sobre la IA
        6. Conecta conceptos teóricos con APLICACIONES REALES
        7. Proporciona RETROALIMENTACIÓN constructiva y motivadora
        
        CAPACIDADES COMO TUTOR PERSONALIZADO:
        - Explicar conceptos complejos de forma simple
        - Crear ejercicios y actividades adaptadas al nivel
        - Evaluar comprensión con preguntas dirigidas
        - Proporcionar ejemplos relevantes y actuales
        - Guiar el aprendizaje paso a paso
        - Resolver dudas específicas con paciencia
        - Motivar y acompañar el proceso de aprendizaje
        
        CONTEXTO EDUCATIVO: ${this.currentContext.contextoEducativo}
        
        PERSONALIDAD:
        - Paciente y comprensivo
        - Motivador y alentador
        - Claro en las explicaciones
        - Adaptable al ritmo del estudiante
        - Enfoque en el aprendizaje práctico
        
        Responde siempre en español, con un tono amigable y educativo, adaptándote al nivel principiante y asegurándote de que cada concepto sea bien comprendido antes de avanzar.`;
    }

    /**
     * Llamar a la API de LIA - CON REFERENCIA AL DOCUMENTO PDF del taller
     */
    async callLiaAPI(message, context) {
        // Preparar payload para la API existente con contexto del taller
        const payload = {
            message: message,
            context: context,
            mode: 'ai_fundamentals_tutor',
            taller_data: {
                id: 'taller-fundamentos-ia-tutor-personalizado',
                tipo: context.tipo,
                module: context.module,
                moduleTitle: context.moduleTitle,
                moduleDescription: context.moduleDescription,
                documento_apoyo: context.documentoApoyo,
                tutor: context.tutor,
                nivel: context.nivelDificultad,
                enfoque: context.enfoque,
                objetivos: context.objetivos,
                timestamp: context.videoTimestamp
            },
            // Referencia específica al documento PDF del taller
            document_reference: {
                name: 'Doc de apoyo - Fundamentos de IA.pdf',
                path: '/Doc de apoyo - Fundamentos de IA.pdf',
                type: 'workshop_support_document',
                description: 'Documento oficial del taller con fundamentos teóricos y ejercicios prácticos de IA'
            },
            // Contexto educativo específico
            educational_context: {
                level: 'principiante',
                approach: 'tutor_personalizado',
                methodology: 'gradual_con_ejemplos',
                focus: 'fundamentos_teoricos_y_practicos'
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
     * Generar sugerencias de seguimiento dinámicas
     */
    generateFollowUpSuggestions(content, message) {
        const suggestions = [];
        const msg = message.toLowerCase();
        const resp = content.toLowerCase();

        // Análisis del contenido de la respuesta para generar sugerencias más relevantes
        if (resp.includes('algoritmo') || resp.includes('modelo')) {
            suggestions.push(
                '¿Puedes mostrarme cómo funciona en la práctica?',
                '¿Qué ventajas tiene este enfoque?',
                '¿En qué situaciones es más efectivo?'
            );
        } else if (resp.includes('aplicación') || resp.includes('uso')) {
            suggestions.push(
                '¿Hay otros casos de uso interesantes?',
                '¿Cómo implementaría esto en mi área?',
                '¿Qué empresas lo están usando actualmente?'
            );
        } else if (resp.includes('historia') || resp.includes('evolución')) {
            suggestions.push(
                '¿Qué avances recientes han sido más importantes?',
                '¿Hacia dónde se dirige la tecnología?',
                '¿Cómo ha impactado en diferentes industrias?'
            );
        } else if (msg.includes('machine learning') || msg.includes('ml')) {
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
            // Sugerencias adaptativas basadas en el tema del módulo actual
            const moduleTopics = {
                1: ['¿Qué es realmente la inteligencia artificial?', '¿Cuáles son los mitos más comunes sobre IA?', '¿Cómo afecta la IA a mi trabajo diario?'],
                2: ['¿Quiénes fueron los pioneros de la IA?', '¿Qué eventos marcaron la historia de la IA?', '¿Cómo ha evolucionado la percepción de la IA?'],
                3: ['¿Cuáles son las diferencias clave entre los tipos de ML?', '¿Qué tipo de problemas resuelve cada uno?', '¿Cómo elegir el enfoque correcto?'],
                4: ['¿Cómo funcionan realmente las redes neuronales?', '¿En qué se parecen al cerebro humano?', '¿Qué limitaciones tienen?'],
                5: ['¿Dónde puedo ver IA en acción hoy?', '¿Cómo puedo empezar a aplicar IA?', '¿Qué herramientas necesito para comenzar?']
            };
            
            const currentModule = this.currentContext?.module || 1;
            const moduleSuggestions = moduleTopics[currentModule] || [
                '¿Puedes darme más detalles?',
                'Explícalo con un ejemplo',
                '¿Cómo se relaciona con lo anterior?'
            ];
            
            suggestions.push(...moduleSuggestions);
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
     * Añadir mensaje al historial - CON CONTEXTO HARDCODEADO del taller
     */
    addToHistory(role, content) {
        this.conversationHistory.push({
            role: role,
            content: content,
            timestamp: new Date(),
            context: this.currentContext.moduleTitle,
            module: this.currentContext.module,
            taller: this.currentContext.taller,
            documento: this.currentContext.documentoApoyo
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
     * Exportar conversación - CON CONTEXTO HARDCODEADO del taller
     */
    exportConversation() {
        const exportData = {
            taller: this.currentContext.taller,
            tipo: this.currentContext.tipo,
            tutor: this.currentContext.tutor,
            module: this.currentContext.module,
            moduleTitle: this.currentContext.moduleTitle,
            nivelDificultad: this.currentContext.nivelDificultad,
            documentoApoyo: this.currentContext.documentoApoyo,
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
