// =====================================================
// API CLIENT PARA SISTEMA DE COMUNIDAD
// Cliente JavaScript para interactuar con los endpoints de comunidad
// =====================================================

class CommunityAPI {
    constructor() {
        this.baseUrl = '/api/community';
        this.currentUser = null;
        this.debounceTimers = new Map(); // APR-268: Para debounce de search
        this.lastParams = {}; // APR-268: Cache de últimos parámetros
    }

    /**
     * Establecer usuario actual
     */
    setCurrentUser(user) {
        this.currentUser = user;
    }

    /**
     * Obtener token de autenticación
     */
    getAuthToken() {
        // Implementar según tu sistema de autenticación
        return localStorage.getItem('auth_token') || 'demo-token';
    }

    /**
     * Mapear datos de usuario para compatibilidad entre localhost y Netlify
     */
    mapUserData(userData) {
        if (!userData) return userData;

        // Si es un objeto con información de usuario
        if (userData.profile_picture_url && !userData.avatar_url) {
            userData.avatar_url = userData.profile_picture_url;
        }

        return userData;
    }

    /**
     * Mapear respuesta de pregunta para compatibilidad
     */
    mapQuestionData(questionData) {
        if (!questionData) return questionData;

        // Mapear datos de usuario en la pregunta
        if (questionData.users) {
            questionData.users = this.mapUserData(questionData.users);
        }

        // Si la pregunta tiene respuestas, mapear sus usuarios también
        if (questionData.answers && Array.isArray(questionData.answers)) {
            questionData.answers = questionData.answers.map(answer => {
                if (answer.users) {
                    answer.users = this.mapUserData(answer.users);
                }
                return answer;
            });
        }

        return questionData;
    }

    /**
     * Mapear respuesta de la API para compatibilidad
     */
    mapResponse(data) {
        if (!data) return data;

        // Si es una respuesta con array de preguntas
        if (data.data && Array.isArray(data.data)) {
            data.data = data.data.map(item => this.mapQuestionData(item));
        }
        // Si es una pregunta individual
        else if (data.data && data.data.users) {
            data.data = this.mapQuestionData(data.data);
        }
        // Si es directamente un array de preguntas
        else if (Array.isArray(data)) {
            data = data.map(item => this.mapQuestionData(item));
        }
        // Si es una pregunta individual sin wrapper
        else if (data.users) {
            data = this.mapQuestionData(data);
        }

        return data;
    }

    /**
     * Realizar petición HTTP
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            console.log(`🌐 API Request: ${finalOptions.method || 'GET'} ${url}`);
            const response = await fetch(url, finalOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${data.details || ''}`);
            }

            // Mapear respuesta para compatibilidad
            const mappedData = this.mapResponse(data);
            return mappedData;
        } catch (error) {
            console.error(`❌ API Error: ${error.message}`);
            throw error;
        }
    }

    // =====================================================
    // PREGUNTAS
    // =====================================================

    /**
     * Obtener lista de preguntas
     */
    async getQuestions(params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = `/questions${queryParams ? `?${queryParams}` : ''}`;
        
        return await this.makeRequest(endpoint);
    }

    /**
     * Crear nueva pregunta
     */
    async createQuestion(questionData) {
        const data = {
            ...questionData,
            user_id: this.currentUser?.id || 'demo-user'
        };

        return await this.makeRequest('/questions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Obtener pregunta específica
     */
    async getQuestion(questionId) {
        return await this.makeRequest(`/questions/${questionId}`);
    }

    // =====================================================
    // RESPUESTAS
    // =====================================================

    /**
     * Obtener respuestas de una pregunta
     */
    async getQuestionAnswers(questionId, sort = 'votes') {
        return await this.makeRequest(`/questions/${questionId}/answers?sort=${sort}`);
    }

    /**
     * Crear nueva respuesta
     */
    async createAnswer(questionId, answerData) {
        // Si questionId es un objeto, significa que se llamó con el patrón viejo
        if (typeof questionId === 'object') {
            answerData = questionId;
            questionId = answerData.question_id;
        }

        const data = {
            ...answerData,
            user_id: this.currentUser?.id || 'demo-user'
        };

        // Usar el endpoint que espera el frontend: POST /questions/{id}/answers
        return await this.makeRequest(`/questions/${questionId}/answers`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // =====================================================
    // COMENTARIOS
    // =====================================================

    /**
     * Crear nuevo comentario
     */
    async createComment(commentData) {
        const data = {
            ...commentData,
            user_id: this.currentUser?.id || 'demo-user'
        };

        return await this.makeRequest('/comments', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Obtener comentarios de una pregunta o respuesta
     */
    async getComments(parentType, parentId) {
        return await this.makeRequest(`/comments?parent_type=${parentType}&parent_id=${parentId}`);
    }

    // =====================================================
    // VOTOS
    // =====================================================

    /**
     * Votar en una pregunta, respuesta o comentario
     */
    async vote(targetType, targetId, voteType) {
        const data = {
            user_id: this.currentUser?.id || 'demo-user',
            target_type: targetType,
            target_id: targetId,
            vote_type: voteType
        };

        return await this.makeRequest('/votes', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Upvote
     */
    async upvote(targetType, targetId) {
        return await this.vote(targetType, targetId, 'upvote');
    }

    /**
     * Downvote
     */
    async downvote(targetType, targetId) {
        return await this.vote(targetType, targetId, 'downvote');
    }

    /**
     * Votar en una pregunta específica (función simplificada)
     */
    async voteQuestion(questionId, voteType) {
        const mappedVoteType = voteType === 'up' ? 'upvote' : voteType === 'down' ? 'downvote' : voteType;
        return await this.vote('question', questionId, mappedVoteType);
    }

    /**
     * Votar en una respuesta específica
     */
    async voteAnswer(answerId, voteType) {
        const mappedVoteType = voteType === 'up' ? 'upvote' : voteType === 'down' ? 'downvote' : voteType;
        return await this.vote('answer', answerId, mappedVoteType);
    }

    // =====================================================
    // MARCADORES/FAVORITOS
    // =====================================================

    /**
     * Agregar o quitar marcador de pregunta
     */
    async toggleBookmark(questionId) {
        const data = {
            user_id: this.currentUser?.id || 'demo-user',
            question_id: questionId
        };

        return await this.makeRequest('/bookmarks', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Obtener marcadores del usuario
     */
    async getUserBookmarks() {
        return await this.makeRequest(`/bookmarks?user_id=${this.currentUser?.id || 'demo-user'}`);
    }

    // =====================================================
    // UTILIDADES
    // =====================================================

    /**
     * Incrementar contador de visualizaciones
     */
    async incrementViews(questionId) {
        // Esta funcionalidad se puede implementar como un endpoint separado
        // Por ahora, solo registramos en consola
        console.log(`👁️ Incrementando visualizaciones para pregunta: ${questionId}`);
    }

    /**
     * Buscar preguntas
     */
    async searchQuestions(query, filters = {}) {
        const params = {
            search: query,
            ...filters
        };

        return await this.getQuestions(params);
    }

    /**
     * Obtener preguntas por filtro
     */
    async getQuestionsByFilter(filter, params = {}) {
        return await this.getQuestions({
            filter,
            ...params
        });
    }

    /**
     * Obtener preguntas sin responder
     */
    async getUnansweredQuestions(params = {}) {
        return await this.getQuestionsByFilter('unanswered', params);
    }

    /**
     * Obtener preguntas respondidas
     */
    async getAnsweredQuestions(params = {}) {
        return await this.getQuestionsByFilter('answered', params);
    }

    /**
     * Obtener mis preguntas
     */
    async getMyQuestions(params = {}) {
        return await this.getQuestionsByFilter('mine', params);
    }

    // ===== APR-268: FUNCIONES DE NORMALIZACIÓN Y DEBOUNCE =====

    /**
     * Normalizar parámetros de filtros para consistencia
     */
    normalizeParams(params = {}) {
        const validFilters = ['all', 'unanswered', 'answered', 'mine'];
        const validSorts = ['recent', 'votes', 'answers', 'views'];

        const normalized = {
            filter: validFilters.includes(params.filter) ? params.filter : 'all',
            sort: validSorts.includes(params.sort) ? params.sort : 'recent',
            search: params.search ? params.search.trim() : '',
            module_id: params.module_id || null,
            course_id: params.course_id || null,
            page: parseInt(params.page) || 1,
            limit: parseInt(params.limit) || 10
        };

        // Almacenar como últimos parámetros válidos
        this.lastParams = { ...normalized };

        console.log('[COMMUNITY-API] Parámetros normalizados:', normalized);
        return normalized;
    }

    /**
     * Implementar debounce para búsquedas
     */
    debounce(key, func, delay = 300) {
        return (...args) => {
            // Cancelar timer anterior si existe
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }

            // Establecer nuevo timer
            const timer = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);

            this.debounceTimers.set(key, timer);
        };
    }

    /**
     * Búsqueda con debounce - APR-268
     */
    searchWithDebounce(searchTerm, additionalParams = {}, callback = null) {
        const debouncedSearch = this.debounce('search', async (term, params, cb) => {
            try {
                console.log('[COMMUNITY-API] Ejecutando búsqueda debounced:', term);

                const searchParams = this.normalizeParams({
                    search: term,
                    ...params
                });

                const results = await this.getQuestions(searchParams);

                if (cb && typeof cb === 'function') {
                    cb(results);
                }

                return results;

            } catch (error) {
                console.error('[COMMUNITY-API] Error en búsqueda debounced:', error);
                if (cb && typeof cb === 'function') {
                    cb({ questions: [], error: error.message });
                }
            }
        }, 500); // 500ms debounce para search

        return debouncedSearch(searchTerm, additionalParams, callback);
    }

    /**
     * Obtener preguntas con parámetros normalizados - APR-268
     */
    async getQuestionsNormalized(params = {}) {
        const normalizedParams = this.normalizeParams(params);

        try {
            // Construir query string
            const queryParams = new URLSearchParams();

            if (normalizedParams.filter && normalizedParams.filter !== 'all') {
                queryParams.set('filter', normalizedParams.filter);
            }
            if (normalizedParams.sort) {
                queryParams.set('sort', normalizedParams.sort);
            }
            if (normalizedParams.search) {
                queryParams.set('search', normalizedParams.search);
            }
            if (normalizedParams.module_id) {
                queryParams.set('module_id', normalizedParams.module_id);
            }
            if (normalizedParams.course_id) {
                queryParams.set('course_id', normalizedParams.course_id);
            }
            queryParams.set('page', normalizedParams.page);
            queryParams.set('limit', normalizedParams.limit);

            const url = `${this.baseUrl}/questions?${queryParams.toString()}`;
            console.log('[COMMUNITY-API] Solicitud normalizada:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return this.mapResponse(data);

        } catch (error) {
            console.error('[COMMUNITY-API] Error en getQuestionsNormalized:', error);
            throw error;
        }
    }

    /**
     * Reintentar con últimos parámetros válidos
     */
    async retryWithLastParams() {
        if (Object.keys(this.lastParams).length === 0) {
            console.warn('[COMMUNITY-API] No hay parámetros previos para reintentar');
            return { questions: [] };
        }

        console.log('[COMMUNITY-API] Reintentando con últimos parámetros:', this.lastParams);
        return await this.getQuestionsNormalized(this.lastParams);
    }

    /**
     * Limpiar todos los timers de debounce
     */
    clearDebounceTimers() {
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        console.log('[COMMUNITY-API] Timers de debounce limpiados');
    }
}

// Crear instancia global
window.communityAPI = new CommunityAPI();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommunityAPI;
}
