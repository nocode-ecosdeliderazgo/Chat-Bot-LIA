// ===== SISTEMA DE ESTADÍSTICAS - INTEGRACIÓN CON GRAFANA SNAPSHOTS =====

class GrafanaStatisticsManager {
    constructor() {
        this.iframes = {
            grafanaIndice: null,
            grafanaRadar: null,
            grafanaSubdominios: null
        };
        this.supabase = null;
        this.currentUser = null;
        this.userResponses = [];
        this.userQuestions = [];
        this.init();
    }

    async init() {
        this.initializeParticles();
        this.setupAnimations();
        this.bindEvents();
        this.prepareGrafanaContainers();
        this.setupIframeLoading();

        // Inicializar análisis personalizado
        await this.initializeSupabase();
        await this.loadUserData();
        await this.generatePersonalizedAnalysis();
    }

    initializeParticles() {
        const particlesContainer = document.querySelector('.particles-container');
        if (particlesContainer && typeof ParticleSystem !== 'undefined') {
            new ParticleSystem(particlesContainer);
        }
    }

    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll, .grafana-container').forEach(el => {
            observer.observe(el);
        });

        // Pequeño tilt interactivo sobre los paneles
        document.querySelectorAll('.grafana-container').forEach(panel => {
            panel.classList.add('tilt');
            const handleMove = (e) => {
                const rect = panel.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                panel.style.transform = `rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg) translateY(-6px)`;
            };
            const reset = () => { panel.style.transform = ''; };
            panel.addEventListener('mousemove', handleMove);
            panel.addEventListener('mouseleave', reset);
        });
    }

    bindEvents() {
        // Menú de perfil
        window.toggleProfileMenu = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const menu = document.getElementById('profileMenu');
            if (menu) {
                menu.style.display = (menu.style.display === 'block' ? 'none' : 'block');
            }
        };

        document.addEventListener('click', (e) => {
            const menu = document.getElementById('profileMenu');
            const btn = document.querySelector('.profile-btn');
            if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
                menu.style.display = 'none';
            }
        });
    }

    prepareGrafanaContainers() {
        // Añadir orbes decorativos a cada panel
        document.querySelectorAll('.grafana-container').forEach(panel => {
            for (let i = 0; i < 3; i++) {
                const orb = document.createElement('div');
                orb.className = 'orb' + (i === 0 ? ' large' : (i === 1 ? '' : ' small'));
                orb.style.left = `${10 + Math.random() * 70}%`;
                orb.style.top = `${10 + Math.random() * 70}%`;
                panel.appendChild(orb);
            }
        });

        console.log('Contenedores de Grafana preparados con snapshots');
    }

    setupIframeLoading() {
        // Configurar cada iframe con manejo de carga
        Object.keys(this.iframes).forEach(iframeId => {
            const iframe = document.getElementById(iframeId);
            const container = iframe?.closest('.grafana-frame-container');
            
            if (iframe && container) {
                this.iframes[iframeId] = iframe;
                
                // Añadir clase de carga
                container.classList.add('loading');
                
                // Manejar evento de carga exitosa
                iframe.addEventListener('load', () => {
                    container.classList.remove('loading');
                    console.log(`Panel ${iframeId} cargado exitosamente`);
                });
                
                // Manejar errores de carga
                iframe.addEventListener('error', () => {
                    container.classList.remove('loading');
                    this.showErrorMessage(container, `Error al cargar ${iframeId}`);
                    console.error(`Error al cargar panel ${iframeId}`);
                });
                
                // Timeout para detectar carga lenta
                setTimeout(() => {
                    if (container.classList.contains('loading')) {
                        console.warn(`Panel ${iframeId} está tardando en cargar`);
                    }
                }, 10000); // 10 segundos
            }
        });
    }

    showErrorMessage(container, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'grafana-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class='bx bx-error-circle'></i>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">Intentar de nuevo</button>
            </div>
        `;
        container.appendChild(errorDiv);
    }

    // Método para recargar un panel específico
    reloadPanel(iframeId) {
        const iframe = this.iframes[iframeId];
        if (iframe) {
            const container = iframe.closest('.grafana-frame-container');
            container.classList.add('loading');
            iframe.src = iframe.src; // Forzar recarga
        }
    }

    // Método para recargar todos los paneles
    reloadAllPanels() {
        Object.keys(this.iframes).forEach(iframeId => {
            this.reloadPanel(iframeId);
        });
    }

    // ===== MÉTODOS PARA ANÁLISIS PERSONALIZADO =====

    async initializeSupabase() {
        try {
            // Esperar a que Supabase esté disponible
            let attempts = 0;
            const maxAttempts = 50;

            while (attempts < maxAttempts && (!window.supabase || typeof window.supabase.from !== 'function')) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (window.supabase && typeof window.supabase.from === 'function') {
                this.supabase = window.supabase;
                console.log('✅ Supabase inicializado para análisis personalizado');
                return true;
            } else {
                console.warn('⚠️ Supabase no disponible para análisis personalizado');
                return false;
            }
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error);
            return false;
        }
    }

    async loadUserData() {
        try {
            // Obtener información del usuario actual
            const userData = localStorage.getItem('userData');
            const currentUser = localStorage.getItem('currentUser');

            let user = null;
            if (userData) {
                try {
                    user = JSON.parse(userData);
                } catch (e) {
                    console.warn('Error parseando userData:', e);
                }
            } else if (currentUser) {
                try {
                    user = JSON.parse(currentUser);
                } catch (e) {
                    console.warn('Error parseando currentUser:', e);
                }
            }

            if (!user || !user.id) {
                console.warn('⚠️ No se encontró usuario para análisis personalizado');
                this.showAnalysisError('No se pudo cargar la información del usuario');
                return false;
            }

            this.currentUser = user;
            console.log('👤 Usuario cargado para análisis:', this.currentUser.id);

            // Cargar respuestas del usuario
            await this.loadUserResponses();
            await this.loadUserQuestions();

            return true;
        } catch (error) {
            console.error('❌ Error cargando datos del usuario:', error);
            this.showAnalysisError('Error cargando datos del usuario');
            return false;
        }
    }

    async loadUserResponses() {
        if (!this.supabase || !this.currentUser) return;

        try {
            console.log('📊 Cargando respuestas del usuario...');
            const { data, error } = await this.supabase
                .from('respuestas')
                .select('*')
                .eq('user_id', this.currentUser.id);

            if (error) {
                console.error('❌ Error cargando respuestas:', error);
                return;
            }

            this.userResponses = data || [];
            console.log(`✅ ${this.userResponses.length} respuestas cargadas`);
        } catch (error) {
            console.error('❌ Error en loadUserResponses:', error);
        }
    }

    async loadUserQuestions() {
        if (!this.supabase || this.userResponses.length === 0) return;

        try {
            console.log('❓ Cargando preguntas...');
            const questionIds = this.userResponses.map(r => r.pregunta_id);

            const { data, error } = await this.supabase
                .from('preguntas')
                .select('*')
                .in('id', questionIds);

            if (error) {
                console.error('❌ Error cargando preguntas:', error);
                return;
            }

            this.userQuestions = data || [];
            console.log(`✅ ${this.userQuestions.length} preguntas cargadas`);
        } catch (error) {
            console.error('❌ Error en loadUserQuestions:', error);
        }
    }

    async generatePersonalizedAnalysis() {
        try {
            if (this.userResponses.length === 0 || this.userQuestions.length === 0) {
                this.showNoDataMessage();
                return;
            }

            console.log('🧠 Generando análisis personalizado...');

            // Calcular scores
            const scores = this.calculateUserScores();

            // Analizar respuestas por bloque
            const adoptionAnalysis = this.analyzeAdoptionResponses();
            const knowledgeAnalysis = this.analyzeKnowledgeResponses();

            // Generar explicaciones (ahora asíncrono)
            const analysis = await this.generateAnalysisExplanation(scores, adoptionAnalysis, knowledgeAnalysis);
            const recommendations = this.generateRecommendations(scores, adoptionAnalysis, knowledgeAnalysis);

            // Mostrar resultados
            this.displayAnalysis(analysis);
            this.displayRecommendations(recommendations);

        } catch (error) {
            console.error('❌ Error generando análisis:', error);
            this.showAnalysisError('Error generando el análisis personalizado');
        }
    }

    calculateUserScores() {
        let adoptionTotal = 0, adoptionCount = 0;
        let knowledgeTotal = 0, knowledgeCount = 0, knowledgeCorrect = 0;

        this.userResponses.forEach(response => {
            const question = this.userQuestions.find(q => q.id == response.pregunta_id);
            if (!question) return;

            const answer = response.valor?.answer || response.valor;
            const score = this.calculateQuestionScore(question, answer);

            if (question.bloque === 'Adopción') {
                adoptionTotal += score;
                adoptionCount++;
            } else if (question.bloque === 'Conocimiento') {
                knowledgeTotal += score;
                knowledgeCount++;
                if (score === 100) knowledgeCorrect++;
            }
        });

        return {
            adoption: adoptionCount > 0 ? Math.round((adoptionTotal / adoptionCount) * 100) / 100 : 0,
            knowledge: knowledgeCount > 0 ? Math.round((knowledgeTotal / knowledgeCount) * 100) / 100 : 0,
            knowledgeCorrect,
            knowledgeTotal: knowledgeCount,
            adoptionTotal: adoptionCount
        };
    }

    calculateQuestionScore(question, answer) {
        // Para preguntas de conocimiento con respuesta_correcta
        if (question.bloque === 'Conocimiento' && question.respuesta_correcta) {
            return answer === question.respuesta_correcta ? 100 : 0;
        }

        // Para preguntas de adopción usar scoring
        if (question.scoring) {
            try {
                const scoring = typeof question.scoring === 'string' ?
                    JSON.parse(question.scoring) : question.scoring;
                return scoring[answer] || 0;
            } catch (e) {
                console.warn('Error parseando scoring:', e);
                return 0;
            }
        }

        return 0;
    }

    analyzeAdoptionResponses() {
        const adoptionResponses = this.userResponses.filter(r => {
            const q = this.userQuestions.find(q => q.id == r.pregunta_id);
            return q && q.bloque === 'Adopción';
        });

        let lowUsage = 0, mediumUsage = 0, highUsage = 0;
        const toolsUsed = [];

        // Obtener umbrales dinámicamente basados en la distribución de scores
        const thresholds = this.calculateDynamicThresholds(adoptionResponses);

        adoptionResponses.forEach(response => {
            const question = this.userQuestions.find(q => q.id == response.pregunta_id);
            const answer = response.valor?.answer || response.valor;
            const score = this.calculateQuestionScore(question, answer);

            if (score < thresholds.low) lowUsage++;
            else if (score < thresholds.high) mediumUsage++;
            else highUsage++;

            // Extraer herramientas dinámicamente del texto de las preguntas
            if (score >= thresholds.toolThreshold) {
                const extractedTools = this.extractToolsFromQuestion(question.texto);
                toolsUsed.push(...extractedTools);
            }
        });

        return {
            total: adoptionResponses.length,
            lowUsage,
            mediumUsage,
            highUsage,
            toolsUsed: [...new Set(toolsUsed)],
            adoptionLevel: highUsage > mediumUsage + lowUsage ? 'Alto' :
                          mediumUsage > lowUsage ? 'Medio' : 'Bajo',
            thresholds
        };
    }

    calculateDynamicThresholds(responses) {
        if (responses.length === 0) {
            return { low: 40, high: 80, toolThreshold: 60 };
        }

        // Calcular todos los scores para determinar umbrales dinámicos
        const scores = responses.map(response => {
            const question = this.userQuestions.find(q => q.id == response.pregunta_id);
            const answer = response.valor?.answer || response.valor;
            return this.calculateQuestionScore(question, answer);
        });

        scores.sort((a, b) => a - b);
        const percentile33 = scores[Math.floor(scores.length * 0.33)] || 40;
        const percentile66 = scores[Math.floor(scores.length * 0.66)] || 80;

        return {
            low: Math.max(percentile33, 20), // Mínimo 20
            high: Math.max(percentile66, 60), // Mínimo 60
            toolThreshold: Math.max(percentile33, 50) // Umbral para extraer herramientas
        };
    }

    extractToolsFromQuestion(questionText) {
        // Extraer herramientas de IA mencionadas en el texto de la pregunta
        const commonAITools = [
            'ChatGPT', 'GPT-4', 'GPT-3', 'GPT',
            'Claude', 'Anthropic',
            'Gemini', 'Bard',
            'Copilot', 'GitHub Copilot',
            'Midjourney', 'DALL-E', 'DALL·E',
            'Stable Diffusion', 'Stable-Diffusion',
            'Perplexity', 'Jasper', 'Copy.ai',
            'Notion AI', 'Grammarly',
            'Bing Chat', 'Microsoft Copilot'
        ];

        const foundTools = [];
        const text = questionText.toLowerCase();

        commonAITools.forEach(tool => {
            if (text.includes(tool.toLowerCase())) {
                foundTools.push(tool);
            }
        });

        // También buscar patrones más generales
        const genericPatterns = [
            /\b(IA generativa|inteligencia artificial|AI|artificial intelligence)\b/gi,
            /\b(asistente\s+de\s+IA|AI\s+assistant)\b/gi,
            /\b(modelo\s+de\s+lenguaje|language\s+model|LLM)\b/gi
        ];

        genericPatterns.forEach(pattern => {
            const matches = questionText.match(pattern);
            if (matches) {
                foundTools.push(...matches);
            }
        });

        return foundTools;
    }

    analyzeKnowledgeResponses() {
        const knowledgeResponses = this.userResponses.filter(r => {
            const q = this.userQuestions.find(q => q.id == r.pregunta_id);
            return q && q.bloque === 'Conocimiento';
        });

        let correct = 0, total = knowledgeResponses.length;
        const topicsCorrect = [];
        const topicsIncorrect = [];
        const topicAnalysis = {};

        knowledgeResponses.forEach(response => {
            const question = this.userQuestions.find(q => q.id == response.pregunta_id);
            const answer = response.valor?.answer || response.valor;
            const isCorrect = question.respuesta_correcta ? answer === question.respuesta_correcta : false;
            const topic = this.extractTopic(question.texto);

            if (topic) {
                if (!topicAnalysis[topic]) {
                    topicAnalysis[topic] = { correct: 0, total: 0 };
                }
                topicAnalysis[topic].total++;
                if (isCorrect) {
                    topicAnalysis[topic].correct++;
                }
            }

            if (isCorrect) {
                correct++;
                if (topic) topicsCorrect.push(topic);
            } else {
                if (topic) topicsIncorrect.push(topic);
            }
        });

        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

        // Calcular umbrales dinámicos basados en la distribución de conocimiento
        const knowledgeThresholds = this.calculateKnowledgeThresholds(percentage, total);

        return {
            correct,
            total,
            percentage,
            topicsCorrect: [...new Set(topicsCorrect.filter(Boolean))],
            topicsIncorrect: [...new Set(topicsIncorrect.filter(Boolean))],
            topicAnalysis,
            knowledgeLevel: this.getKnowledgeLevel(percentage, knowledgeThresholds),
            thresholds: knowledgeThresholds
        };
    }

    calculateKnowledgeThresholds(userPercentage, totalQuestions) {
        // Umbrales dinámicos basados en el número de preguntas y contexto
        let advanced = 80;
        let intermediate = 60;

        // Ajustar umbrales según el número de preguntas
        if (totalQuestions <= 5) {
            // Para pocas preguntas, ser más flexible
            advanced = 75;
            intermediate = 50;
        } else if (totalQuestions >= 15) {
            // Para muchas preguntas, ser más estricto
            advanced = 85;
            intermediate = 65;
        }

        return {
            advanced,
            intermediate,
            basic: 0
        };
    }

    getKnowledgeLevel(percentage, thresholds) {
        if (percentage >= thresholds.advanced) return 'Avanzado';
        if (percentage >= thresholds.intermediate) return 'Intermedio';
        return 'Básico';
    }

    extractTopic(questionText) {
        // Extraer temas dinámicamente del contenido real de la pregunta
        const text = questionText.toLowerCase();

        // Patrones de temas basados en análisis semántico del texto
        const topicPatterns = {
            'prompting': [
                /\b(prompt|prompting|instrucción|comando|directriz)\b/gi,
                /\b(cómo\s+preguntar|cómo\s+solicitar|mejores\s+prácticas\s+para\s+preguntar)\b/gi
            ],
            'modelos_ia': [
                /\b(modelo|GPT|LLM|lenguaje|transformer|neural)\b/gi,
                /\b(ChatGPT|Claude|Gemini|inteligencia\s+artificial)\b/gi
            ],
            'etica_responsabilidad': [
                /\b(ética|sesgo|bias|responsable|privacidad|transparencia)\b/gi,
                /\b(discriminación|fairness|explicabilidad|confianza)\b/gi
            ],
            'tecnicas_metodos': [
                /\b(técnica|método|estrategia|enfoque|práctica)\b/gi,
                /\b(fine-tuning|retrieval|embeddings|vectores)\b/gi
            ],
            'aplicaciones_casos_uso': [
                /\b(aplicación|uso|implementación|caso\s+de\s+uso|ejemplo)\b/gi,
                /\b(automatización|productividad|eficiencia|negocio)\b/gi
            ],
            'evaluacion_calidad': [
                /\b(evaluar|calidad|precisión|exactitud|métricas)\b/gi,
                /\b(validation|testing|benchmark|performance)\b/gi
            ]
        };

        // Buscar el tema más relevante basado en coincidencias
        for (const [topic, patterns] of Object.entries(topicPatterns)) {
            for (const pattern of patterns) {
                if (pattern.test(text)) {
                    return topic;
                }
            }
        }

        // Si no encuentra un patrón específico, usar análisis de palabras clave
        return this.analyzeQuestionKeywords(text);
    }

    analyzeQuestionKeywords(text) {
        // Análisis secundario basado en palabras clave contextuales
        const keywordWeights = {
            'prompting': ['prompt', 'instrucción', 'comando', 'directriz'],
            'modelos_ia': ['modelo', 'gpt', 'llm', 'ia', 'inteligencia'],
            'etica_responsabilidad': ['ética', 'sesgo', 'responsable', 'privacidad'],
            'tecnicas_metodos': ['técnica', 'método', 'estrategia', 'enfoque'],
            'aplicaciones_casos_uso': ['aplicación', 'uso', 'implementación', 'ejemplo'],
            'evaluacion_calidad': ['evaluar', 'calidad', 'precisión', 'métricas']
        };

        let maxScore = 0;
        let bestTopic = null;

        for (const [topic, keywords] of Object.entries(keywordWeights)) {
            const score = keywords.reduce((acc, keyword) => {
                return acc + (text.includes(keyword) ? 1 : 0);
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                bestTopic = topic;
            }
        }

        return bestTopic;
    }

    async generateAnalysisExplanation(scores, adoptionAnalysis, knowledgeAnalysis) {
        return {
            adoption: {
                score: scores.adoption,
                level: adoptionAnalysis.adoptionLevel,
                explanation: await this.getAdoptionExplanation(scores.adoption, adoptionAnalysis),
                tools: adoptionAnalysis.toolsUsed,
                thresholds: adoptionAnalysis.thresholds
            },
            knowledge: {
                score: scores.knowledge,
                level: knowledgeAnalysis.knowledgeLevel,
                explanation: await this.getKnowledgeExplanation(scores.knowledge, knowledgeAnalysis),
                correct: knowledgeAnalysis.correct,
                total: knowledgeAnalysis.total,
                percentage: knowledgeAnalysis.percentage,
                thresholds: knowledgeAnalysis.thresholds
            }
        };
    }

    async getAdoptionExplanation(score, analysis) {
        try {
            // Obtener área del usuario si está disponible
            const userArea = this.getCurrentUserArea();

            // Intentar obtener mensaje de la base de datos
            const explanation = await this.getExplanationFromDatabase(
                'adoption_explanation',
                score,
                userArea,
                {
                    tools_used: analysis.toolsUsed.length > 0 ? analysis.toolsUsed.join(', ') : 'herramientas de IA',
                    tools_context: this.getToolsContext(analysis.toolsUsed),
                    level: analysis.adoptionLevel
                }
            );

            if (explanation) {
                return explanation;
            }

            // Fallback a lógica original si no hay mensaje en BD
            return this.getFallbackAdoptionExplanation(score, analysis);

        } catch (error) {
            console.warn('Error obteniendo explicación de adopción de BD, usando fallback:', error);
            return this.getFallbackAdoptionExplanation(score, analysis);
        }
    }

    getFallbackAdoptionExplanation(score, analysis) {
        const thresholds = analysis.thresholds;
        const toolsText = analysis.toolsUsed.length > 0 ?
            analysis.toolsUsed.join(', ') : 'herramientas de IA';

        if (score >= thresholds.high) {
            return `Excelente nivel de adopción de IA (score: ${Math.round(score)}). Usas regularmente ${toolsText} en tus actividades. Esto te posiciona como un usuario avanzado que aprovecha efectivamente las capacidades de la IA generativa.`;
        } else if (score >= thresholds.low) {
            return `Buen nivel de adopción de IA (score: ${Math.round(score)}). Has comenzado a integrar herramientas de IA en algunos aspectos de tu trabajo. Hay oportunidades para expandir tu uso hacia más áreas de tu actividad profesional.`;
        } else {
            return `Nivel inicial de adopción de IA (score: ${Math.round(score)}). Estás en las primeras etapas de exploración de herramientas de IA. Hay una gran oportunidad para comenzar a integrar estas tecnologías en tu trabajo diario.`;
        }
    }

    async getKnowledgeExplanation(score, analysis) {
        try {
            // Obtener área del usuario si está disponible
            const userArea = this.getCurrentUserArea();

            // Crear análisis de temas específicos
            let topicDetails = '';
            if (analysis.topicAnalysis && Object.keys(analysis.topicAnalysis).length > 0) {
                const topicSummary = Object.entries(analysis.topicAnalysis)
                    .map(([topic, data]) => {
                        const pct = Math.round((data.correct / data.total) * 100);
                        return `${topic}: ${data.correct}/${data.total} (${pct}%)`;
                    })
                    .join(', ');
                topicDetails = ` Desglose por temas: ${topicSummary}.`;
            }

            // Intentar obtener mensaje de la base de datos
            const explanation = await this.getExplanationFromDatabase(
                'knowledge_explanation',
                analysis.percentage, // Usar porcentaje para conocimiento
                userArea,
                {
                    correct_answers: analysis.correct,
                    total_questions: analysis.total,
                    percentage: analysis.percentage,
                    topic_details: topicDetails,
                    level: analysis.knowledgeLevel
                }
            );

            if (explanation) {
                return explanation;
            }

            // Fallback a lógica original si no hay mensaje en BD
            return this.getFallbackKnowledgeExplanation(score, analysis);

        } catch (error) {
            console.warn('Error obteniendo explicación de conocimiento de BD, usando fallback:', error);
            return this.getFallbackKnowledgeExplanation(score, analysis);
        }
    }

    getFallbackKnowledgeExplanation(score, analysis) {
        const correctPercentage = analysis.percentage;
        const thresholds = analysis.thresholds;

        // Crear análisis de temas específicos
        let topicDetails = '';
        if (analysis.topicAnalysis && Object.keys(analysis.topicAnalysis).length > 0) {
            const topicSummary = Object.entries(analysis.topicAnalysis)
                .map(([topic, data]) => {
                    const pct = Math.round((data.correct / data.total) * 100);
                    return `${topic}: ${data.correct}/${data.total} (${pct}%)`;
                })
                .join(', ');
            topicDetails = ` Desglose por temas: ${topicSummary}.`;
        }

        if (correctPercentage >= thresholds.advanced) {
            return `Excelente comprensión técnica de IA. Respondiste correctamente ${analysis.correct} de ${analysis.total} preguntas (${correctPercentage}%). Demuestras un sólido entendimiento de conceptos, mejores prácticas y consideraciones éticas.${topicDetails}`;
        } else if (correctPercentage >= thresholds.intermediate) {
            return `Buena comprensión técnica de IA. Respondiste correctamente ${analysis.correct} de ${analysis.total} preguntas (${correctPercentage}%). Tienes una base sólida, con algunas áreas específicas que podrían beneficiarse de mayor profundización.${topicDetails}`;
        } else {
            return `Comprensión básica de IA. Respondiste correctamente ${analysis.correct} de ${analysis.total} preguntas (${correctPercentage}%). Hay oportunidades significativas para expandir tu entendimiento técnico.${topicDetails}`;
        }
    }

    generateRecommendations(scores, adoptionAnalysis, knowledgeAnalysis) {
        const recommendations = [];
        const adoptionThresholds = adoptionAnalysis.thresholds;
        const knowledgeThresholds = knowledgeAnalysis.thresholds;

        // Recomendaciones basadas en adopción (usando umbrales dinámicos)
        if (scores.adoption < adoptionThresholds.low) {
            recommendations.push({
                title: 'Aumenta tu uso práctico de IA',
                description: `Tu score de adopción (${Math.round(scores.adoption)}) indica que hay gran oportunidad de integrar herramientas de IA en tareas específicas de tu trabajo diario, como redacción de emails, análisis de datos o generación de ideas.`,
                priority: 'high'
            });
        }

        // Recomendaciones basadas en conocimiento (usando umbrales dinámicos)
        if (knowledgeAnalysis.percentage < knowledgeThresholds.intermediate) {
            recommendations.push({
                title: 'Profundiza tus conocimientos técnicos',
                description: `Con ${knowledgeAnalysis.correct}/${knowledgeAnalysis.total} respuestas correctas (${knowledgeAnalysis.percentage}%), enfócate en entender mejor los fundamentos de la IA y las mejores prácticas.`,
                priority: 'high'
            });
        }

        // Recomendaciones específicas por temas (basadas en análisis real)
        if (knowledgeAnalysis.topicAnalysis) {
            Object.entries(knowledgeAnalysis.topicAnalysis).forEach(([topic, data]) => {
                const percentage = Math.round((data.correct / data.total) * 100);
                if (percentage < 50 && data.total >= 2) { // Solo si hay suficientes preguntas del tema
                    const topicRecommendations = this.getTopicSpecificRecommendation(topic, percentage, data);
                    if (topicRecommendations) {
                        recommendations.push(topicRecommendations);
                    }
                }
            });
        }

        // Recomendaciones para usuarios avanzados
        if (scores.adoption >= adoptionThresholds.high && knowledgeAnalysis.percentage >= knowledgeThresholds.advanced) {
            recommendations.push({
                title: 'Conviértete en un líder en IA',
                description: `Con tu excelente nivel de adopción (${Math.round(scores.adoption)}) y conocimiento (${knowledgeAnalysis.percentage}%), considera compartir tu experiencia con colegas y explorar aplicaciones más avanzadas de IA.`,
                priority: 'low'
            });
        }

        // Recomendación de balance entre adopción y conocimiento
        const adoptionLevel = scores.adoption >= adoptionThresholds.high ? 'alto' : scores.adoption >= adoptionThresholds.low ? 'medio' : 'bajo';
        const knowledgeLevel = knowledgeAnalysis.percentage >= knowledgeThresholds.advanced ? 'alto' : knowledgeAnalysis.percentage >= knowledgeThresholds.intermediate ? 'medio' : 'bajo';

        if (adoptionLevel !== knowledgeLevel) {
            if (adoptionLevel === 'alto' && knowledgeLevel === 'bajo') {
                recommendations.push({
                    title: 'Balancea tu práctica con conocimiento teórico',
                    description: 'Tienes buena experiencia práctica con IA, pero fortalecer tus conocimientos técnicos te permitirá aprovechar mejor estas herramientas.',
                    priority: 'medium'
                });
            } else if (knowledgeLevel === 'alto' && adoptionLevel === 'bajo') {
                recommendations.push({
                    title: 'Aplica tus conocimientos en la práctica',
                    description: 'Tienes sólidos conocimientos técnicos. Es hora de ponerlos en práctica integrando más herramientas de IA en tu trabajo diario.',
                    priority: 'medium'
                });
            }
        }

        return recommendations;
    }

    getTopicSpecificRecommendation(topic, percentage, data) {
        const topicNames = {
            'prompting': 'Prompting',
            'modelos_ia': 'Modelos de IA',
            'etica_responsabilidad': 'Ética y Responsabilidad',
            'tecnicas_metodos': 'Técnicas y Métodos',
            'aplicaciones_casos_uso': 'Aplicaciones y Casos de Uso',
            'evaluacion_calidad': 'Evaluación y Calidad'
        };

        const topicDescriptions = {
            'prompting': 'Aprende técnicas avanzadas de creación de prompts para obtener mejores resultados de las herramientas de IA.',
            'modelos_ia': 'Profundiza en cómo funcionan los diferentes modelos de IA y sus capacidades específicas.',
            'etica_responsabilidad': 'Familiarízate con las consideraciones éticas, sesgos potenciales y uso responsable de la IA.',
            'tecnicas_metodos': 'Explora diferentes técnicas y metodologías para implementar IA de manera efectiva.',
            'aplicaciones_casos_uso': 'Conoce más casos de uso prácticos y aplicaciones reales de IA en diferentes industrias.',
            'evaluacion_calidad': 'Aprende a evaluar la calidad y precisión de las respuestas de IA.'
        };

        const topicName = topicNames[topic] || topic;
        const description = topicDescriptions[topic] || `Mejora tus conocimientos en ${topic}.`;

        return {
            title: `Mejora en: ${topicName}`,
            description: `Respondiste correctamente ${data.correct}/${data.total} preguntas de este tema (${percentage}%). ${description}`,
            priority: 'medium'
        };
    }

    displayAnalysis(analysis) {
        const analysisContent = document.getElementById('analysisContent');
        if (!analysisContent) return;

        // Obtener umbrales dinámicos para la visualización
        const adoptionThresholds = analysis.adoption.thresholds || { high: 80, low: 60 };
        const knowledgeThresholds = analysis.knowledge.thresholds || { advanced: 80, intermediate: 60 };

        const adoptionScoreClass = this.getScoreClass(analysis.adoption.score, adoptionThresholds);
        const knowledgeScoreClass = this.getScoreClass(analysis.knowledge.score, knowledgeThresholds);

        analysisContent.innerHTML = `
            <div class="analysis-block">
                <h4><i class='bx bx-trending-up'></i> Adopción de IA</h4>
                <div class="score-indicator ${adoptionScoreClass}">
                    <i class='bx bx-bar-chart-alt-2'></i>
                    ${Math.round(analysis.adoption.score)} puntos - Nivel ${analysis.adoption.level}
                </div>
                <p>${analysis.adoption.explanation}</p>
                ${analysis.adoption.tools.length > 0 ? `
                    <p><strong>Herramientas que usas:</strong> ${analysis.adoption.tools.join(', ')}</p>
                ` : ''}
            </div>

            <div class="analysis-block">
                <h4><i class='bx bx-brain'></i> Conocimiento Técnico</h4>
                <div class="score-indicator ${knowledgeScoreClass}">
                    <i class='bx bx-check-circle'></i>
                    ${analysis.knowledge.correct}/${analysis.knowledge.total} correctas (${analysis.knowledge.percentage}%) - Nivel ${analysis.knowledge.level}
                </div>
                <p>${analysis.knowledge.explanation}</p>
            </div>
        `;
    }

    displayRecommendations(recommendations) {
        const recommendationsContent = document.getElementById('recommendationsContent');
        const recommendationsSection = document.getElementById('recommendationsSection');

        if (!recommendationsContent || !recommendationsSection) return;

        if (recommendations.length === 0) {
            recommendationsSection.style.display = 'none';
            return;
        }

        recommendationsContent.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <h5>
                    <i class='bx ${this.getRecommendationIcon(rec.priority)}'></i>
                    ${rec.title}
                </h5>
                <p>${rec.description}</p>
            </div>
        `).join('');

        recommendationsSection.style.display = 'block';
    }

    getScoreClass(score, thresholds = null) {
        if (thresholds) {
            if (score >= thresholds.high || score >= thresholds.advanced) return 'score-high';
            if (score >= thresholds.low || score >= thresholds.intermediate) return 'score-medium';
            return 'score-low';
        }

        // Fallback a umbrales estáticos si no se proporcionan umbrales dinámicos
        if (score >= 80) return 'score-high';
        if (score >= 60) return 'score-medium';
        return 'score-low';
    }

    getRecommendationIcon(priority) {
        switch (priority) {
            case 'high': return 'bx-error-circle';
            case 'medium': return 'bx-info-circle';
            case 'low': return 'bx-check-circle';
            default: return 'bx-bulb';
        }
    }

    showNoDataMessage() {
        const analysisContent = document.getElementById('analysisContent');
        if (!analysisContent) return;

        analysisContent.innerHTML = `
            <div class="loading-analysis">
                <i class='bx bx-data' style="animation: none;"></i>
                <div>
                    <h4 style="color: #44e5ff; margin: 0 0 8px 0;">Sin datos de cuestionario</h4>
                    <p style="margin: 0; color: #888;">Completa el cuestionario GenAI para ver tu análisis personalizado</p>
                    <button onclick="window.location.href='q/genai-form.html'" class="btn-primary" style="margin-top: 16px; padding: 8px 16px; background: #44e5ff; color: #000; border: none; border-radius: 8px; cursor: pointer;">
                        Completar Cuestionario
                    </button>
                </div>
            </div>
        `;
    }

    showAnalysisError(message) {
        const analysisContent = document.getElementById('analysisContent');
        if (!analysisContent) return;

        analysisContent.innerHTML = `
            <div class="loading-analysis">
                <i class='bx bx-error-circle' style="animation: none; color: #dc3545;"></i>
                <div>
                    <h4 style="color: #dc3545; margin: 0 0 8px 0;">Error en el análisis</h4>
                    <p style="margin: 0; color: #888;">${message}</p>
                    <button onclick="location.reload()" class="btn-primary" style="margin-top: 16px; padding: 8px 16px; background: #44e5ff; color: #000; border: none; border-radius: 8px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>
            </div>
        `;
    }

    // ===== MÉTODOS PARA INTEGRACIÓN CON BASE DE DATOS =====

    /**
     * Obtiene explicación personalizada desde la base de datos
     */
    async getExplanationFromDatabase(messageType, score, area, additionalData = {}) {
        try {
            const params = new URLSearchParams({
                messageType,
                score: Math.round(score),
                area: area || 'general'
            });

            console.log(`🔍 Consultando BD: ${messageType}, score=${score}, área=${area}`);

            const response = await fetch(`/api/analysis-messages?${params}`);
            const result = await response.json();

            if (result.success && result.message) {
                console.log(`✅ Mensaje encontrado en BD: ${result.message.title}`);

                // Procesar template con variables
                const processedMessage = this.processMessageTemplate(
                    result.message.message_template,
                    {
                        score: Math.round(score),
                        user_area: area || 'general',
                        ...additionalData
                    }
                );

                return processedMessage;
            }

            console.log(`⚠️ No se encontró mensaje en BD para ${messageType}`);
            return null;

        } catch (error) {
            console.warn('Error consultando BD para explicación:', error);
            return null;
        }
    }

    /**
     * Procesa templates con variables dinámicas
     */
    processMessageTemplate(template, variables) {
        if (!template) return '';

        let processed = template;

        // Reemplazar variables del formato {variable_name}
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            processed = processed.replace(regex, value || '');
        });

        // Limpiar variables no reemplazadas (opcional)
        processed = processed.replace(/\{[^}]+\}/g, '');

        return processed;
    }

    /**
     * Obtiene el área profesional del usuario actual
     */
    getCurrentUserArea() {
        try {
            // Intentar obtener área desde diferentes fuentes

            // 1. Desde datos del cuestionario de perfil
            const profileData = localStorage.getItem('profileQuestionnaireData');
            if (profileData) {
                const data = JSON.parse(profileData);
                if (data.perfilFinal) {
                    // Mapear perfil a área GenAI
                    return this.mapProfileToGenAIArea(data.perfilFinal);
                }
            }

            // 2. Desde datos del usuario
            const userData = localStorage.getItem('userData') || localStorage.getItem('currentUser');
            if (userData) {
                const user = JSON.parse(userData);
                if (user.type_rol) {
                    return this.mapProfileToGenAIArea(user.type_rol);
                }
            }

            // 3. Desde parámetros URL (si viene del cuestionario)
            const urlParams = new URLSearchParams(window.location.search);
            const areaParam = urlParams.get('area');
            if (areaParam) {
                return areaParam;
            }

            return 'general';

        } catch (error) {
            console.warn('Error obteniendo área del usuario:', error);
            return 'general';
        }
    }

    /**
     * Mapea perfil profesional a área GenAI
     */
    mapProfileToGenAIArea(profile) {
        const mapping = {
            'CEO': 'CEO/Alta Dirección',
            'CTO/CIO': 'Tecnología/Desarrollo de Software',
            'Dirección de Marketing': 'Marketing y Comunicación',
            'Miembros de Marketing': 'Marketing y Comunicación',
            'Dirección de Finanzas (CFO)': 'Finanzas/Contabilidad',
            'Miembros de Finanzas': 'Finanzas/Contabilidad',
            'Dirección/Jefatura de Contabilidad': 'Finanzas/Contabilidad',
            'Miembros de Contabilidad': 'Finanzas/Contabilidad',
            'Dirección de RRHH': 'Salud/Bienestar',
            'Miembros de RRHH': 'Salud/Bienestar',
            'Consultor': 'Administración Pública/Gobierno',
            'Dirección de Operaciones': 'Administración Pública/Gobierno',
            'Miembros de Operaciones': 'Administración Pública/Gobierno',
            'Gerencia Media': 'Administración Pública/Gobierno',
            'Freelancer': 'Diseño/Industrias Creativas',
            'Dirección de Ventas': 'Marketing y Comunicación',
            'Miembros de Ventas': 'Marketing y Comunicación',
            'Dirección de Compras / Supply': 'Marketing y Comunicación',
            'Miembros de Compras': 'Marketing y Comunicación'
        };

        return mapping[profile] || 'general';
    }

    /**
     * Genera contexto específico de herramientas para mensajes
     */
    getToolsContext(toolsUsed) {
        if (!toolsUsed || toolsUsed.length === 0) {
            return 'Considera explorar herramientas como ChatGPT, Gemini o Claude para comenzar.';
        }

        const toolCategories = {
            'conversational': ['ChatGPT', 'Claude', 'Gemini', 'Bard'],
            'coding': ['GitHub Copilot', 'Copilot'],
            'design': ['Midjourney', 'DALL-E', 'DALL·E', 'Stable Diffusion'],
            'business': ['Notion AI', 'Jasper', 'Copy.ai']
        };

        const detectedCategories = [];
        for (const [category, tools] of Object.entries(toolCategories)) {
            if (tools.some(tool => toolsUsed.some(used => used.toLowerCase().includes(tool.toLowerCase())))) {
                detectedCategories.push(category);
            }
        }

        if (detectedCategories.length > 1) {
            return 'Tu uso diversificado de herramientas de IA muestra una adopción integral.';
        } else if (detectedCategories.includes('conversational')) {
            return 'Tu enfoque en asistentes conversacionales es un excelente punto de partida.';
        } else if (detectedCategories.includes('coding')) {
            return 'Tu uso de herramientas de programación asistida muestra una adopción técnica avanzada.';
        } else if (detectedCategories.includes('design')) {
            return 'Tu experiencia con herramientas de diseño visual demuestra creatividad con IA.';
        }

        return `Tu experiencia con ${toolsUsed.join(', ')} te da una base sólida para expandir.`;
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    new GrafanaStatisticsManager();
});
