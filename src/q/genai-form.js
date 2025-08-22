/**
 * CUESTIONARIO GENAI MULTIEAREA MX/LATAM
 * =====================================
 * 
 * Sistema de cuestionarios basado en el CSV GenAI con:
 * - Preguntas de Adopción (escala Likert)
 * - Preguntas de Conocimiento (opción múltiple)
 * - Scoring automático
 * - Integración con radar de estadísticas
 */

class GenAIQuestionnaire {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.genaiArea = null;
        this.questions = [];
        this.responses = {};
        this.sessionId = null;
        this.totalQuestions = 0;
        this.answeredQuestions = 0;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🎯 Inicializando cuestionario GenAI...');
            
            // Inicializar Supabase
            await this.initializeSupabase();
            
            // Obtener información del usuario
            await this.loadUserInfo();
            
            // Cargar preguntas del área
            await this.loadQuestions();
            
            // Renderizar interfaz
            this.renderQuestionnaire();
            
            // Configurar eventos
            this.setupEventListeners();
            
            console.log('✅ Cuestionario GenAI inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando cuestionario GenAI:', error);
            this.showError('Error cargando el cuestionario. Por favor recarga la página.');
        }
    }
    
    async initializeSupabase() {
        // Obtener configuración desde meta tags
        const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.getAttribute('content');
        const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.getAttribute('content');
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Configuración de Supabase no encontrada');
        }
        
        if (typeof window.supabase !== 'undefined') {
            this.supabase = window.supabase;
        } else {
            throw new Error('Cliente de Supabase no disponible');
        }
        
        console.log('✅ Cliente Supabase inicializado');
    }
    
    async loadUserInfo() {
        // Intentar obtener usuario desde múltiples fuentes
        let userId = null;
        let userArea = null;
        
        // 1. Desde localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                userId = user.id;
                userArea = user.type_rol;
                console.log('👤 Usuario desde localStorage:', { userId, userArea });
            } catch (e) {
                console.warn('Error parseando currentUser:', e);
            }
        }
        
        // 2. Desde parámetros URL
        const urlParams = new URLSearchParams(window.location.search);
        const areaParam = urlParams.get('area') || urlParams.get('perfil');
        if (areaParam) {
            userArea = areaParam;
            console.log('🔗 Área desde URL:', userArea);
        }
        
        // 3. Usuario por defecto para desarrollo
        if (!userId) {
            userId = 'dev-user-' + Date.now();
            console.log('⚠️ Usando userId de desarrollo:', userId);
        }
        
        this.currentUser = { id: userId, area: userArea };
        
        // Mapear área a GenAI área
        this.genaiArea = this.mapToGenAIArea(userArea);
        
        // Actualizar UI
        this.updateAreaBadge();
        
        console.log('✅ Usuario cargado:', {
            userId: this.currentUser.id,
            originalArea: userArea,
            genaiArea: this.genaiArea
        });
    }
    
    mapToGenAIArea(userArea) {
        const areaMap = {
            'CEO': 'CEO/Alta Dirección',
            'Dirección General': 'CEO/Alta Dirección',
            'CTO/CIO': 'Tecnología/Desarrollo de Software',
            'Tecnología/TI': 'Tecnología/Desarrollo de Software',
            'Dirección de Marketing': 'Marketing y Comunicación',
            'Miembros de Marketing': 'Marketing y Comunicación',
            'Marketing': 'Marketing y Comunicación',
            'Dirección de Ventas': 'Marketing y Comunicación',
            'Miembros de Ventas': 'Marketing y Comunicación',
            'Ventas': 'Marketing y Comunicación',
            'Dirección de Finanzas (CFO)': 'Finanzas/Contabilidad',
            'Miembros de Finanzas': 'Finanzas/Contabilidad',
            'Finanzas': 'Finanzas/Contabilidad',
            'Dirección/Jefatura de Contabilidad': 'Finanzas/Contabilidad',
            'Miembros de Contabilidad': 'Finanzas/Contabilidad',
            'Contabilidad': 'Finanzas/Contabilidad',
            'Freelancer': 'Diseño/Industrias Creativas',
            'Consultor': 'Administración Pública/Gobierno'
        };
        
        return areaMap[userArea] || 'CEO/Alta Dirección';
    }
    
    updateAreaBadge() {
        const areaBadge = document.getElementById('areaBadge');
        if (areaBadge) {
            areaBadge.innerHTML = `<i class='bx bx-user-circle'></i> ${this.genaiArea}`;
        }
    }
    
    async loadQuestions() {
        try {
            console.log(`🔍 Cargando preguntas para área: ${this.genaiArea}`);
            
            const { data, error } = await this.supabase
                .from('genai_questions')
                .select('*')
                .eq('area', this.genaiArea)
                .eq('active', true)
                .order('block, question_id');
            
            if (error) {
                throw error;
            }
            
            if (!data || data.length === 0) {
                throw new Error(`No se encontraron preguntas para el área: ${this.genaiArea}`);
            }
            
            this.questions = data;
            this.totalQuestions = data.length;
            
            console.log(`✅ ${this.totalQuestions} preguntas cargadas:`, {
                adopcion: data.filter(q => q.block === 'Adopción').length,
                conocimiento: data.filter(q => q.block === 'Conocimiento').length
            });
            
        } catch (error) {
            console.error('❌ Error cargando preguntas:', error);
            throw new Error(`Error cargando preguntas: ${error.message}`);
        }
    }
    
    renderQuestionnaire() {
        const container = document.getElementById('questionsContainer');
        if (!container) return;
        
        // Agrupar preguntas por bloque
        const questionsByBlock = this.questions.reduce((acc, question) => {
            if (!acc[question.block]) acc[question.block] = [];
            acc[question.block].push(question);
            return acc;
        }, {});
        
        let html = '';
        
        // Renderizar cada bloque
        Object.entries(questionsByBlock).forEach(([blockName, blockQuestions]) => {
            html += this.renderQuestionBlock(blockName, blockQuestions);
        });
        
        container.innerHTML = html;
        
        // Actualizar barra de progreso
        this.updateProgress();
        
        console.log('✅ Interfaz del cuestionario renderizada');
    }
    
    renderQuestionBlock(blockName, questions) {
        const blockConfig = {
            'Adopción': {
                icon: 'bx-trending-up',
                title: 'Adopción de IA',
                description: 'Frecuencia de uso de herramientas y técnicas de IA'
            },
            'Conocimiento': {
                icon: 'bx-brain',
                title: 'Conocimiento Técnico',
                description: 'Comprensión de conceptos y mejores prácticas'
            }
        };
        
        const config = blockConfig[blockName] || {
            icon: 'bx-help-circle',
            title: blockName,
            description: 'Preguntas del cuestionario'
        };
        
        let html = `
            <div class="question-block block-${blockName.toLowerCase()}">
                <div class="block-header">
                    <div class="block-icon">
                        <i class='bx ${config.icon}'></i>
                    </div>
                    <div class="block-title">
                        <h3>${config.title}</h3>
                        <p>${config.description} (${questions.length} preguntas)</p>
                    </div>
                </div>
        `;
        
        questions.forEach((question, index) => {
            html += this.renderQuestion(question, index + 1);
        });
        
        html += '</div>';
        return html;
    }
    
    renderQuestion(question, questionNumber) {
        let optionsHtml = '';
        
        if (question.type === 'Multiple Choice (escala Likert A–E)') {
            // Escala Likert A-E
            const options = [
                { key: 'A', text: question.option_a },
                { key: 'B', text: question.option_b },
                { key: 'C', text: question.option_c },
                { key: 'D', text: question.option_d },
                { key: 'E', text: question.option_e }
            ].filter(opt => opt.text);
            
            options.forEach(option => {
                optionsHtml += `
                    <div class="option-item" onclick="this.querySelector('input').click()">
                        <input type="radio" 
                               name="question_${question.id}" 
                               value="${option.key}" 
                               id="q${question.id}_${option.key}">
                        <label for="q${question.id}_${option.key}">${option.text}</label>
                    </div>
                `;
            });
        } else if (question.type === 'Multiple Choice (una respuesta)') {
            // Opción múltiple con respuesta correcta
            const options = [
                { key: 'A', text: question.option_a },
                { key: 'B', text: question.option_b },
                { key: 'C', text: question.option_c },
                { key: 'D', text: question.option_d }
            ].filter(opt => opt.text);
            
            options.forEach(option => {
                optionsHtml += `
                    <div class="option-item" onclick="this.querySelector('input').click()">
                        <input type="radio" 
                               name="question_${question.id}" 
                               value="${option.key}" 
                               id="q${question.id}_${option.key}">
                        <label for="q${question.id}_${option.key}">${option.text}</label>
                    </div>
                `;
            });
        }
        
        return `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-number">${questionNumber}</div>
                    <div class="question-text">${question.question_text}</div>
                </div>
                <div class="question-options">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Eventos de formulario
        const form = document.getElementById('genaiQuizForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Eventos de opciones
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                this.handleAnswerChange(e);
            }
        });
        
        // Eventos de click en opciones
        document.addEventListener('click', (e) => {
            const optionItem = e.target.closest('.option-item');
            if (optionItem) {
                // Remover selección previa del grupo
                const questionItem = optionItem.closest('.question-item');
                if (questionItem) {
                    questionItem.querySelectorAll('.option-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                }
                
                // Marcar como seleccionado
                optionItem.classList.add('selected');
            }
        });
        
        console.log('✅ Event listeners configurados');
    }
    
    handleAnswerChange(e) {
        const questionId = e.target.name.replace('question_', '');
        const answer = e.target.value;
        
        // Guardar respuesta
        this.responses[questionId] = {
            questionId: questionId,
            answer: answer,
            timestamp: Date.now()
        };
        
        // Actualizar progreso
        this.answeredQuestions = Object.keys(this.responses).length;
        this.updateProgress();
        
        // Habilitar botón de envío si todas las preguntas están respondidas
        this.updateSubmitButton();
        
        console.log('📝 Respuesta guardada:', { questionId, answer });
    }
    
    updateProgress() {
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        if (progressText) {
            progressText.textContent = `Pregunta ${this.answeredQuestions} de ${this.totalQuestions}`;
        }
        
        if (progressFill) {
            const percentage = this.totalQuestions > 0 ? (this.answeredQuestions / this.totalQuestions) * 100 : 0;
            progressFill.style.width = `${percentage}%`;
        }
    }
    
    updateSubmitButton() {
        const submitBtn = document.getElementById('submitBtn');
        const allAnswered = this.answeredQuestions === this.totalQuestions;
        
        if (submitBtn) {
            submitBtn.disabled = !allAnswered;
            
            if (allAnswered) {
                document.getElementById('submitText').textContent = 'Completar Cuestionario';
                submitBtn.classList.add('ready');
            } else {
                const remaining = this.totalQuestions - this.answeredQuestions;
                document.getElementById('submitText').textContent = `Faltan ${remaining} preguntas`;
            }
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            console.log('🚀 Enviando cuestionario...');
            
            // Mostrar loading
            this.setLoading(true);
            
            // Crear sesión de cuestionario
            const sessionId = await this.createQuestionnaireSession();
            
            // Guardar respuestas
            await this.saveResponses(sessionId);
            
            // Calcular scores
            const scores = this.calculateScores();
            
            // Actualizar sesión con scores
            await this.updateSessionScores(sessionId, scores);
            
            // Crear radar scores
            await this.createRadarScores(sessionId, scores);
            
            // Mostrar éxito y redirigir
            this.showSuccess('Cuestionario completado exitosamente');
            
            setTimeout(() => {
                window.location.href = '../estadisticas.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error enviando cuestionario:', error);
            this.showError(`Error enviando cuestionario: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    }
    
    async createQuestionnaireSession() {
        const { data, error } = await this.supabase
            .from('genai_questionnaire_sessions')
            .insert([{
                user_id: this.currentUser.id,
                genai_area: this.genaiArea,
                started_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) {
            throw new Error(`Error creando sesión: ${error.message}`);
        }
        
        this.sessionId = data.id;
        console.log('✅ Sesión creada:', this.sessionId);
        
        return data.id;
    }
    
    async saveResponses(sessionId) {
        const responses = Object.values(this.responses).map(response => {
            const question = this.questions.find(q => q.id === response.questionId);
            const score = this.calculateQuestionScore(question, response.answer);
            const isCorrect = this.checkAnswer(question, response.answer);
            
            return {
                session_id: sessionId,
                user_id: this.currentUser.id,
                question_id: response.questionId,
                answer_option: response.answer,
                score_obtained: score,
                is_correct: isCorrect,
                response_time_seconds: Math.floor((Date.now() - response.timestamp) / 1000)
            };
        });
        
        const { error } = await this.supabase
            .from('genai_user_responses')
            .insert(responses);
        
        if (error) {
            throw new Error(`Error guardando respuestas: ${error.message}`);
        }
        
        console.log(`✅ ${responses.length} respuestas guardadas`);
    }
    
    calculateScores() {
        let adoptionTotal = 0;
        let adoptionCount = 0;
        let knowledgeTotal = 0;
        let knowledgeCount = 0;
        
        Object.values(this.responses).forEach(response => {
            const question = this.questions.find(q => q.id === response.questionId);
            const score = this.calculateQuestionScore(question, response.answer);
            
            if (question.block === 'Adopción') {
                adoptionTotal += score;
                adoptionCount++;
            } else if (question.block === 'Conocimiento') {
                knowledgeTotal += score;
                knowledgeCount++;
            }
        });
        
        const adoptionScore = adoptionCount > 0 ? (adoptionTotal / adoptionCount) : 0;
        const knowledgeScore = knowledgeCount > 0 ? (knowledgeTotal / knowledgeCount) : 0;
        const totalScore = (adoptionScore + knowledgeScore) / 2;
        
        console.log('📊 Scores calculados:', {
            adoption: adoptionScore,
            knowledge: knowledgeScore,
            total: totalScore
        });
        
        return {
            adoption_score: Math.round(adoptionScore * 100) / 100,
            knowledge_score: Math.round(knowledgeScore * 100) / 100,
            total_score: Math.round(totalScore * 100) / 100
        };
    }
    
    calculateQuestionScore(question, answer) {
        if (!question.scoring_mapping) {
            return 0;
        }
        
        const scoring = question.scoring_mapping;
        
        if (typeof scoring === 'object') {
            return scoring[answer] || 0;
        }
        
        return 0;
    }
    
    checkAnswer(question, answer) {
        if (question.type === 'Multiple Choice (una respuesta)' && question.correct_option) {
            return answer === question.correct_option;
        }
        
        return null; // No aplica para preguntas de adopción
    }
    
    async updateSessionScores(sessionId, scores) {
        const classification = this.getClassification(scores.total_score);
        
        const { error } = await this.supabase
            .from('genai_questionnaire_sessions')
            .update({
                completed_at: new Date().toISOString(),
                total_score: scores.total_score,
                adoption_score: scores.adoption_score,
                knowledge_score: scores.knowledge_score,
                classification: classification
            })
            .eq('id', sessionId);
        
        if (error) {
            throw new Error(`Error actualizando sesión: ${error.message}`);
        }
        
        console.log('✅ Sesión actualizada con scores');
    }
    
    async createRadarScores(sessionId, scores) {
        const radarScores = [
            {
                session_id: sessionId,
                user_id: this.currentUser.id,
                genai_area: this.genaiArea,
                dimension: 'Adopción',
                score: scores.adoption_score
            },
            {
                session_id: sessionId,
                user_id: this.currentUser.id,
                genai_area: this.genaiArea,
                dimension: 'Conocimiento',
                score: scores.knowledge_score
            }
        ];
        
        const { error } = await this.supabase
            .from('genai_radar_scores')
            .insert(radarScores);
        
        if (error) {
            throw new Error(`Error creando radar scores: ${error.message}`);
        }
        
        console.log('✅ Radar scores creados');
    }
    
    getClassification(score) {
        if (score >= 0 && score <= 39) {
            return 'Básico';
        } else if (score >= 40 && score <= 69) {
            return 'Intermedio';
        } else if (score >= 70 && score <= 100) {
            return 'Avanzado';
        }
        return 'Sin clasificar';
    }
    
    setLoading(loading) {
        const submitBtn = document.getElementById('submitBtn');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const submitText = document.getElementById('submitText');
        
        if (submitBtn && loadingSpinner && submitText) {
            submitBtn.disabled = loading;
            loadingSpinner.style.display = loading ? 'inline-block' : 'none';
            submitText.textContent = loading ? 'Procesando...' : 'Completar Cuestionario';
        }
    }
    
    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
        console.error('❌ Error mostrado al usuario:', message);
    }
    
    showSuccess(message) {
        const successEl = document.getElementById('successMessage');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
        console.log('✅ Éxito mostrado al usuario:', message);
    }
}

// ====================================================================
// INICIALIZACIÓN
// ====================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Inicializando aplicación GenAI Questionnaire...');
    
    // Verificar requisitos
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase client no está disponible');
        return;
    }
    
    // Inicializar cuestionario
    window.genaiQuestionnaire = new GenAIQuestionnaire();
});

// Funciones globales de utilidad
window.goToStats = function() {
    window.location.href = '../estadisticas.html';
};

window.restartQuestionnaire = function() {
    if (confirm('¿Estás seguro de que quieres reiniciar el cuestionario? Se perderán todas las respuestas actuales.')) {
        window.location.reload();
    }
};