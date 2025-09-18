// =====================================================
// API CLIENT PARA SISTEMA DE COMUNIDAD
// Cliente JavaScript para interactuar con los endpoints de comunidad
// =====================================================

class CommunityAPI {
    constructor() {
        this.baseUrl = '/api/community';
        this.currentUser = null;
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
    async createAnswer(answerData) {
        const data = {
            ...answerData,
            user_id: this.currentUser?.id || 'demo-user'
        };

        return await this.makeRequest('/answers', {
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
}

// Crear instancia global
window.communityAPI = new CommunityAPI();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommunityAPI;
}
