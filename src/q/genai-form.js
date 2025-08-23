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
        
        // Esperar a que Supabase esté disponible
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo
        
        while (attempts < maxAttempts) {
            if (typeof window.supabase !== 'undefined' && window.supabase) {
                this.supabase = window.supabase;
                console.log('✅ Cliente Supabase inicializado');
                return;
            }
            
            console.log(`⏳ Esperando Supabase... (intento ${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Cliente de Supabase no disponible después de 5 segundos');
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
        await this.updateAreaBadge();
        
        console.log('✅ Usuario cargado:', {
            userId: this.currentUser.id,
            originalArea: userArea,
            genaiArea: this.genaiArea
        });
    }
    
    mapToGenAIArea(userArea) {
        // Mapeo de áreas antiguas a IDs de áreas en la tabla areas (actualizado con áreas reales)
        const areaMap = {
            'CEO': 2, // Ventas (más cercano a CEO)
            'Dirección General': 2,
            'CTO/CIO': 9, // Tecnología/TI
            'Tecnología/TI': 9,
            'Tecnología/Desarrollo de Software': 9,
            'Dirección de Marketing': 3, // Marketing
            'Miembros de Marketing': 3,
            'Marketing': 3,
            'Marketing y Comunicación': 3,
            'Dirección de Ventas': 2, // Ventas
            'Miembros de Ventas': 2,
            'Ventas': 2,
            'Dirección de Finanzas (CFO)': 5, // Finanzas
            'Miembros de Finanzas': 5,
            'Finanzas': 5,
            'Finanzas/Contabilidad': 5,
            'Dirección/Jefatura de Contabilidad': 7, // Contabilidad
            'Miembros de Contabilidad': 7,
            'Contabilidad': 7,
            'Freelancer': 11, // Diseño/Industrias Creativas
            'Consultor': 4, // Operaciones (más cercano a consultoría)
            'Administración Pública/Gobierno': 4, // Mapeado a Operaciones
            'Administración Pública': 4,
            'Gobierno': 4,
            'Salud': 4, // Operaciones (más cercano)
            'Medicina': 4,
            'Médico': 4,
            'Derecho': 4, // Operaciones (más cercano)
            'Legal': 4,
            'Abogado': 4,
            'Academia': 10, // Otra
            'Investigación': 10,
            'Investigador': 10,
            'Educación': 10, // Otra
            'Docentes': 10,
            'Profesor': 10
        };
        
        console.log('🔍 Mapeando área:', userArea, '→', areaMap[userArea] || 2);
        return areaMap[userArea] || 2; // Por defecto Ventas
    }
    
    async updateAreaBadge() {
        const areaBadge = document.getElementById('areaBadge');
        if (areaBadge) {
            try {
                // Obtener el nombre del área
                const { data: areaData, error: areaError } = await this.supabase
                    .from('areas')
                    .select('nombre')
                    .eq('id', this.genaiArea)
                    .single();
                
                if (areaError) {
                    console.warn('⚠️ No se pudo obtener el nombre del área:', areaError);
                    areaBadge.innerHTML = `<i class='bx bx-user-circle'></i> Área ID ${this.genaiArea}`;
                } else {
                    areaBadge.innerHTML = `<i class='bx bx-user-circle'></i> ${areaData.nombre}`;
                }
            } catch (error) {
                console.error('❌ Error actualizando badge de área:', error);
                areaBadge.innerHTML = `<i class='bx bx-user-circle'></i> Área ID ${this.genaiArea}`;
            }
        }
    }
    
    async loadQuestions() {
        try {
            console.log(`🔍 Cargando preguntas para área ID: ${this.genaiArea}`);
            
            // Primero obtener el nombre del área para mostrar
            const { data: areaData, error: areaError } = await this.supabase
                .from('areas')
                .select('nombre')
                .eq('id', this.genaiArea)
                .single();
            
            if (areaError) {
                console.warn('⚠️ No se pudo obtener el nombre del área:', areaError);
            }
            
            const areaName = areaData?.nombre || `Área ID ${this.genaiArea}`;
            console.log(`📍 Área encontrada: ${areaName}`);
            
            // Cargar preguntas de la tabla preguntas
            console.log('🔍 Ejecutando consulta de preguntas...');
            const { data, error } = await this.supabase
                .from('preguntas')
                .select(`
                    id,
                    codigo,
                    section,
                    bloque,
                    area_id,
                    texto,
                    tipo,
                    opciones,
                    peso,
                    escala,
                    scoring,
                    created_at
                `)
                .eq('area_id', this.genaiArea)
                .eq('section', 'Cuestionario')
                .order('bloque, codigo');
            
            console.log('📊 Resultado de la consulta:', { data, error });
            
            if (error) {
                console.error('❌ Error en consulta:', error);
                throw error;
            }
            
            if (!data || data.length === 0) {
                console.error('❌ No se encontraron preguntas para el área:', this.genaiArea);
                throw new Error(`No se encontraron preguntas para el área: ${areaName}`);
            }
            
            // Transformar los datos para que sean compatibles con el código existente
            this.questions = data.map(q => ({
                id: q.id,
                question_id: q.codigo,
                section: q.section,
                block: q.bloque,
                area_id: q.area_id,
                question_text: q.texto,
                type: q.tipo,
                options: q.opciones,
                weight_to_100: q.peso,
                scale_mapping: q.escala,
                scoring_mapping: q.scoring,
                created_at: q.created_at
            }));
            
            this.totalQuestions = this.questions.length;
            
            console.log(`✅ ${this.totalQuestions} preguntas cargadas para ${areaName}:`, {
                adopcion: this.questions.filter(q => q.block === 'Adopción').length,
                conocimiento: this.questions.filter(q => q.block === 'Conocimiento').length
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
        
        // Parsear las opciones desde el campo (puede ser JSON o string separado por comas)
        let options = [];
        try {
            if (question.options && typeof question.options === 'string') {
                // Intentar parsear como JSON primero
                try {
                    options = JSON.parse(question.options);
                } catch (jsonError) {
                    // Si no es JSON, intentar parsear como string separado por comas
                    if (question.options.includes(',')) {
                        options = question.options.split(',').map(opt => opt.trim());
                    } else {
                        // Si no hay comas, usar el string completo
                        options = [question.options];
                    }
                }
            } else if (Array.isArray(question.options)) {
                options = question.options;
            }
        } catch (error) {
            console.error('❌ Error parseando opciones:', error);
            options = [];
        }
        
        if (question.type === 'Multiple Choice (escala Likert A–E)' || question.type === 'Multiple Choice (una respuesta)') {
            // Generar opciones A, B, C, D, E basadas en el array de opciones
            const optionKeys = ['A', 'B', 'C', 'D', 'E'];
            
            options.forEach((optionText, index) => {
                if (optionText && index < optionKeys.length) {
                    const optionKey = optionKeys[index];
                    optionsHtml += `
                        <div class="option-item" onclick="this.querySelector('input').click()">
                            <input type="radio" 
                                   name="question_${question.id}" 
                                   value="${optionKey}" 
                                   id="q${question.id}_${optionKey}">
                            <label for="q${question.id}_${optionKey}">${optionText}</label>
                        </div>
                    `;
                }
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
            
            // Guardar respuestas en la tabla respuestas
            await this.saveResponses();
            
            // Calcular scores
            const scores = this.calculateScores();
            
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
    

    
    async saveResponses() {
        const responses = Object.values(this.responses).map(response => {
            return {
                user_id: this.currentUser.id,
                pregunta_id: response.questionId,
                valor: { answer: response.answer, timestamp: response.timestamp }
            };
        });
        
        const { error } = await this.supabase
            .from('respuestas')
            .insert(responses);
        
        if (error) {
            throw new Error(`Error guardando respuestas: ${error.message}`);
        }
        
        console.log(`✅ ${responses.length} respuestas guardadas en tabla respuestas`);
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
        
        let scoring;
        try {
            if (typeof question.scoring_mapping === 'string') {
                scoring = JSON.parse(question.scoring_mapping);
            } else {
                scoring = question.scoring_mapping;
            }
        } catch (error) {
            console.error('❌ Error parseando scoring_mapping:', error);
            return 0;
        }
        
        if (typeof scoring === 'object') {
            return scoring[answer] || 0;
        }
        
        return 0;
    }
    
    checkAnswer(question, answer) {
        // Para preguntas de conocimiento, verificar si la respuesta es correcta
        if (question.type === 'Multiple Choice (una respuesta)') {
            // Buscar la respuesta correcta en las opciones
            // Por ahora, asumimos que la respuesta correcta es 'B' para la mayoría
            // Esto se puede mejorar analizando el contenido de las preguntas
            return answer === 'B'; // Respuesta correcta por defecto
        }
        
        return null; // No aplica para preguntas de adopción
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