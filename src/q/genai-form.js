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
        // Supabase ya debería estar disponible en este punto
        if (typeof window.supabase !== 'undefined' && window.supabase) {
            this.supabase = window.supabase;
            console.log('✅ Cliente Supabase inicializado');
            return;
        }
        
        throw new Error('Cliente de Supabase no disponible');
    }
    
    async loadUserInfo() {
        // Intentar obtener usuario desde múltiples fuentes
        let userId = null;
        let userArea = null;
        
        // 1. Desde localStorage (usando userData que es la clave correcta)
        const userData = localStorage.getItem('userData');
        const currentUser = localStorage.getItem('currentUser');
        
        let user = null;
        if (userData) {
            try {
                user = JSON.parse(userData);
                userId = user.id;
                userArea = user.type_rol || user.cargo_rol;
                console.log('👤 Usuario desde userData:', { userId, userArea });
            } catch (e) {
                console.warn('Error parseando userData:', e);
            }
        } else if (currentUser) {
            try {
                user = JSON.parse(currentUser);
                userId = user.id;
                userArea = user.type_rol || user.cargo_rol;
                console.log('👤 Usuario desde currentUser:', { userId, userArea });
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
        
        // 3. Verificar si el usuario está autenticado
        if (!userId || userId.includes('dev-user-')) {
            console.warn('⚠️ Usuario no autenticado o usando ID de desarrollo');
            
            // Intentar obtener usuario autenticado
            if (window.AuthGuard && window.AuthGuard.getCurrentUser) {
                const authUser = window.AuthGuard.getCurrentUser();
                if (authUser && authUser.id) {
                    userId = authUser.id;
                    userArea = authUser.type_rol || authUser.cargo_rol;
                    user = authUser;
                    console.log('👤 Usuario autenticado encontrado:', { userId, userArea });
                }
            }
            
            // Si aún no hay usuario válido, mostrar error
            if (!userId || userId.includes('dev-user-')) {
                console.error('❌ No se pudo obtener un usuario válido');
                this.showError('Error: No se pudo obtener información del usuario. Por favor inicia sesión nuevamente.');
                return;
            }
        }
        
        this.currentUser = { id: userId, area: userArea, ...user };
        
        // Mapear área a GenAI área y rol
        const areaMapping = this.mapToGenAIArea(userArea);
        this.genaiArea = areaMapping.area_id;
        this.genaiRol = areaMapping.exclusivo_rol_id;
        
        // Actualizar UI
        await this.updateAreaBadge();
        
        console.log('✅ Usuario cargado:', {
            userId: this.currentUser.id,
            originalArea: userArea,
            genaiArea: this.genaiArea,
            genaiRol: this.genaiRol
        });
    }
    
    mapToGenAIArea(userArea) {
        // Mapeo de áreas antiguas a IDs de áreas y roles en la tabla areas
        // Formato: { area_id, exclusivo_rol_id }
        const areaMap = {
            'CEO': { area_id: 2, exclusivo_rol_id: 1 }, // Ventas
            'Dirección General': { area_id: 2, exclusivo_rol_id: 1 },
            'CTO/CIO': { area_id: 9, exclusivo_rol_id: 8 }, // Tecnología/TI
            'Tecnología/TI': { area_id: 9, exclusivo_rol_id: 8 },
            'Tecnología/Desarrollo de Software': { area_id: 9, exclusivo_rol_id: 8 },
            'Desarrollo': { area_id: 9, exclusivo_rol_id: 8 },
            'Dirección de Marketing': { area_id: 3, exclusivo_rol_id: 2 }, // Marketing
            'Miembros de Marketing': { area_id: 3, exclusivo_rol_id: 2 },
            'Marketing': { area_id: 3, exclusivo_rol_id: 2 },
            'Marketing y Comunicación': { area_id: 3, exclusivo_rol_id: 2 },
            'Dirección de Ventas': { area_id: 2, exclusivo_rol_id: 1 }, // Ventas
            'Miembros de Ventas': { area_id: 2, exclusivo_rol_id: 1 },
            'Ventas': { area_id: 2, exclusivo_rol_id: 1 },
            'Dirección de Finanzas (CFO)': { area_id: 5, exclusivo_rol_id: 4 }, // Finanzas
            'Miembros de Finanzas': { area_id: 5, exclusivo_rol_id: 4 },
            'Finanzas': { area_id: 5, exclusivo_rol_id: 4 },
            'Finanzas/Contabilidad': { area_id: 5, exclusivo_rol_id: 4 },
            'Dirección/Jefatura de Contabilidad': { area_id: 7, exclusivo_rol_id: 6 }, // Contabilidad
            'Miembros de Contabilidad': { area_id: 7, exclusivo_rol_id: 6 },
            'Contabilidad': { area_id: 7, exclusivo_rol_id: 6 },
            'Freelancer': { area_id: 11, exclusivo_rol_id: 10 }, // Diseño/Industrias Creativas
            'Consultor': { area_id: 4, exclusivo_rol_id: 3 }, // Operaciones
            'Administración Pública/Gobierno': { area_id: 4, exclusivo_rol_id: 3 },
            'Administración Pública': { area_id: 4, exclusivo_rol_id: 3 },
            'Gobierno': { area_id: 4, exclusivo_rol_id: 3 },
            'Salud': { area_id: 4, exclusivo_rol_id: 3 },
            'Medicina': { area_id: 4, exclusivo_rol_id: 3 },
            'Médico': { area_id: 4, exclusivo_rol_id: 3 },
            'Derecho': { area_id: 4, exclusivo_rol_id: 3 },
            'Legal': { area_id: 4, exclusivo_rol_id: 3 },
            'Abogado': { area_id: 4, exclusivo_rol_id: 3 },
            'Academia': { area_id: 10, exclusivo_rol_id: 9 }, // Otra
            'Investigación': { area_id: 10, exclusivo_rol_id: 9 },
            'Investigador': { area_id: 10, exclusivo_rol_id: 9 },
            'Educación': { area_id: 10, exclusivo_rol_id: 9 },
            'Docentes': { area_id: 10, exclusivo_rol_id: 9 },
            'Profesor': { area_id: 10, exclusivo_rol_id: 9 },
            'Gerencia Media': { area_id: 2, exclusivo_rol_id: 1 }, // Por defecto Ventas
            'Usuario': { area_id: 2, exclusivo_rol_id: 1 }, // Por defecto Ventas
            'Administrador': { area_id: 2, exclusivo_rol_id: 1 } // Por defecto Ventas
        };
        
        const mapping = areaMap[userArea] || { area_id: 2, exclusivo_rol_id: 1 }; // Por defecto Ventas
        console.log('🔍 Mapeando área:', userArea, '→', mapping);
        
        // Debug: mostrar todas las claves disponibles
        if (!areaMap[userArea]) {
            console.warn('⚠️ Área no encontrada en el mapeo:', userArea);
            console.log('📋 Áreas disponibles en el mapeo:', Object.keys(areaMap));
        }
        
        return mapping;
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
            console.log(`🔍 Cargando preguntas para área ID: ${this.genaiArea}, rol ID: ${this.genaiRol}`);
            
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
            
            // Cargar preguntas de la tabla preguntas usando exclusivo_rol_id
            console.log('🔍 Ejecutando consulta de preguntas...');
            const { data, error } = await this.supabase
                .from('preguntas')
                .select(`
                    id,
                    codigo,
                    section,
                    bloque,
                    area_id,
                    exclusivo_rol_id,
                    texto,
                    tipo,
                    opciones,
                    peso,
                    escala,
                    scoring,
                    created_at
                `)
                .eq('exclusivo_rol_id', this.genaiRol)
                .eq('section', 'Cuestionario')
                .order('bloque, codigo');
            
            console.log('📊 Resultado de la consulta:', { data, error });
            
            if (error) {
                console.error('❌ Error en consulta:', error);
                throw error;
            }
            
            if (!data || data.length === 0) {
                console.error('❌ No se encontraron preguntas para el rol:', this.genaiRol);
                throw new Error(`No se encontraron preguntas para el rol: ${this.genaiRol} en área: ${areaName}`);
            }
            
            // Transformar los datos para que sean compatibles con el código existente
            this.questions = data.map(q => ({
                id: q.id,
                question_id: q.codigo,
                section: q.section,
                block: q.bloque,
                area_id: q.area_id,
                exclusivo_rol_id: q.exclusivo_rol_id,
                question_text: q.texto,
                type: q.tipo,
                options: q.opciones,
                weight_to_100: q.peso,
                scale_mapping: q.escala,
                scoring_mapping: q.scoring,
                created_at: q.created_at
            }));
            
            this.totalQuestions = this.questions.length;
            
            console.log(`✅ ${this.totalQuestions} preguntas cargadas para ${areaName} (rol ${this.genaiRol}):`, {
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
        
        console.log('💾 Intentando guardar respuestas:', {
            userId: this.currentUser.id,
            responseCount: responses.length,
            hasSupabase: !!this.supabase
        });
        
        // Intentar guardar usando el servidor backend en lugar de Supabase directo
        try {
            console.log('🔄 Intentando guardar a través del servidor backend...');
            
            const response = await fetch('/api/save-responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    responses: responses
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ Respuestas guardadas a través del servidor:', result);
            
        } catch (serverError) {
            console.warn('⚠️ Error con servidor backend, intentando Supabase directo...', serverError);
            
            // Fallback a Supabase directo
            try {
                // Verificar si tenemos autenticación
                const { data: { session } } = await this.supabase.auth.getSession();
                if (!session) {
                    console.warn('⚠️ No hay sesión de Supabase, intentando autenticación...');
                    
                    // Intentar obtener token del localStorage
                    const userToken = localStorage.getItem('userToken');
                    if (userToken) {
                        console.log('🔑 Token encontrado en localStorage, configurando sesión...');
                        // Configurar el token en Supabase
                        await this.supabase.auth.setSession({
                            access_token: userToken,
                            refresh_token: userToken
                        });
                    } else {
                        throw new Error('No se pudo obtener token de autenticación. Por favor inicia sesión nuevamente.');
                    }
                }
                
                const { error } = await this.supabase
                    .from('respuestas')
                    .insert(responses);
                
                if (error) {
                    console.error('❌ Error detallado al guardar respuestas:', error);
                    throw new Error(`Error guardando respuestas: ${error.message}`);
                }
                
                console.log(`✅ ${responses.length} respuestas guardadas en tabla respuestas`);
                
            } catch (supabaseError) {
                console.error('❌ Error con Supabase directo:', supabaseError);
                throw new Error(`Error guardando respuestas: ${supabaseError.message}`);
            }
        }
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

// Función para esperar a que Supabase esté disponible
async function waitForSupabase() {
    let attempts = 0;
    const maxAttempts = 100; // 10 segundos máximo
    
    while (attempts < maxAttempts) {
        if (typeof window.supabase !== 'undefined' && window.supabase) {
            console.log('✅ Supabase detectado, inicializando cuestionario...');
            return true;
        }
        
        console.log(`⏳ Esperando Supabase... (intento ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    console.error('❌ Supabase no disponible después de 10 segundos');
    return false;
}

// Inicialización principal
async function initializeQuestionnaire() {
    console.log('🎯 Inicializando aplicación GenAI Questionnaire...');
    
    // Esperar a que Supabase esté disponible
    const supabaseReady = await waitForSupabase();
    
    if (!supabaseReady) {
        console.error('❌ No se pudo inicializar Supabase');
        document.getElementById('errorMessage').textContent = 'Error: No se pudo conectar a la base de datos. Por favor recarga la página.';
        document.getElementById('errorMessage').style.display = 'block';
        return;
    }
    
    // Inicializar cuestionario
    try {
        window.genaiQuestionnaire = new GenAIQuestionnaire();
    } catch (error) {
        console.error('❌ Error inicializando cuestionario:', error);
        document.getElementById('errorMessage').textContent = 'Error inicializando el cuestionario. Por favor recarga la página.';
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeQuestionnaire);

// Funciones globales de utilidad
window.goToStats = function() {
    window.location.href = '../estadisticas.html';
};

window.restartQuestionnaire = function() {
    if (confirm('¿Estás seguro de que quieres reiniciar el cuestionario? Se perderán todas las respuestas actuales.')) {
        window.location.reload();
    }
};