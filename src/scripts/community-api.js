/**
 * Community API - RESTful API client for community questions and answers
 * Handles communication with Netlify Functions and Supabase backend
 */

class CommunityAPI {
    constructor() {
        this.baseURL = '/api/community';
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Set authorization token for authenticated requests
     * @param {string} token - JWT token
     */
    setAuthToken(token) {
        if (token) {
            this.headers['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.headers['Authorization'];
        }
    }

    /**
     * Set user ID for requests
     * @param {string} userId - User ID
     */
    setUserId(userId) {
        if (userId) {
            this.headers['X-User-Id'] = userId;
        } else {
            delete this.headers['X-User-Id'];
        }
    }

    /**
     * Set current user information for requests
     * @param {Object} user - User object
     */
    setCurrentUser(user) {
        if (user && user.id) {
            this.setUserId(user.id);
            this.currentUser = user;
        } else {
            this.currentUser = null;
            delete this.headers['X-User-Id'];
        }
    }

    /**
     * Generic API request method
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} - API response
     */
    async request(endpoint, options = {}) {
        const config = {
            headers: { ...this.headers, ...options.headers },
            ...options
        };

        try {
            // console.log(`🌐 API Request: ${options.method || 'GET'} ${this.baseURL}${endpoint}`);
            
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorData}`);
            }

            const data = await response.json();
            // console.log(`✅ API Response:`, data);
            
            return data;
            
        } catch (error) {
            console.error(`❌ API Error:`, error);
            
            // Return error structure for consistent handling
            return {
                success: false,
                error: error.message || 'Unknown API error',
                data: null
            };
        }
    }

    /**
     * Get questions with optional filters
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} - Questions response
     */
    async getQuestions(filters = {}) {
        const params = new URLSearchParams();
        
        // Add filters to query parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        const queryString = params.toString();
        const endpoint = `/questions${queryString ? `?${queryString}` : ''}`;

        return this.request(endpoint);
    }

    /**
     * Get a specific question by ID
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} - Question response
     */
    async getQuestion(questionId) {
        return this.request(`/questions/${questionId}`);
    }

    /**
     * Create a new question
     * @param {Object} questionData - Question data
     * @returns {Promise<Object>} - Create response
     */
    async createQuestion(questionData) {
        return this.request('/questions', {
            method: 'POST',
            body: JSON.stringify(questionData)
        });
    }

    /**
     * Update a question
     * @param {string} questionId - Question ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} - Update response
     */
    async updateQuestion(questionId, updateData) {
        return this.request(`/questions/${questionId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    /**
     * Delete a question
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} - Delete response
     */
    async deleteQuestion(questionId) {
        return this.request(`/questions/${questionId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Vote on a question
     * @param {string} questionId - Question ID
     * @param {string} voteType - 'up' or 'down'
     * @returns {Promise<Object>} - Vote response
     */
    async voteQuestion(questionId, voteType) {
        return this.request(`/questions/${questionId}/vote`, {
            method: 'POST',
            body: JSON.stringify({ vote_type: voteType })
        });
    }

    /**
     * Get answers for a question
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} - Answers response
     */
    async getAnswers(questionId) {
        return this.request(`/questions/${questionId}/answers`);
    }

    /**
     * Get answers for a question with sorting (alias)
     * @param {string} questionId - Question ID
     * @param {string} sort - Sort order ('votes', 'recent', 'oldest')
     * @returns {Promise<Object>} - Answers response
     */
    async getQuestionAnswers(questionId, sort = 'votes') {
        const params = sort ? `?sort=${sort}` : '';
        return this.request(`/questions/${questionId}/answers${params}`);
    }

    /**
     * Create an answer for a question
     * @param {string} questionId - Question ID
     * @param {Object} answerData - Answer data
     * @returns {Promise<Object>} - Answer response
     */
    async createAnswer(questionId, answerData) {
        return this.request(`/questions/${questionId}/answers`, {
            method: 'POST',
            body: JSON.stringify(answerData)
        });
    }

    /**
     * Vote on an answer
     * @param {string} answerId - Answer ID
     * @param {string} voteType - 'up' or 'down'
     * @returns {Promise<Object>} - Vote response
     */
    async voteAnswer(answerId, voteType) {
        return this.request(`/answers/${answerId}/vote`, {
            method: 'POST',
            body: JSON.stringify({ vote_type: voteType })
        });
    }

    /**
     * Get comments for a question or answer
     * @param {string} targetType - 'question' or 'answer'
     * @param {string} targetId - Target ID
     * @returns {Promise<Object>} - Comments response
     */
    async getComments(targetType, targetId) {
        return this.request(`/${targetType}s/${targetId}/comments`);
    }

    /**
     * Create a comment
     * @param {string} targetType - 'question' or 'answer'
     * @param {string} targetId - Target ID
     * @param {Object} commentData - Comment data
     * @returns {Promise<Object>} - Comment response
     */
    async createComment(targetType, targetId, commentData) {
        return this.request(`/${targetType}s/${targetId}/comments`, {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    }

    /**
     * Bookmark a question
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} - Bookmark response
     */
    async toggleBookmark(questionId) {
        return this.request(`/questions/${questionId}/bookmark`, {
            method: 'POST'
        });
    }

    /**
     * Get user's bookmarked questions
     * @returns {Promise<Object>} - Bookmarks response
     */
    async getBookmarks() {
        return this.request('/bookmarks');
    }

    /**
     * Search questions
     * @param {string} query - Search query
     * @param {Object} filters - Additional filters
     * @returns {Promise<Object>} - Search response
     */
    async searchQuestions(query, filters = {}) {
        const params = new URLSearchParams({ q: query });
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        return this.request(`/search?${params.toString()}`);
    }

    /**
     * Get community statistics
     * @returns {Promise<Object>} - Statistics response
     */
    async getStatistics() {
        return this.request('/statistics');
    }

    /**
     * Mark question as viewed
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} - View response
     */
    async markAsViewed(questionId) {
        return this.request(`/questions/${questionId}/view`, {
            method: 'POST'
        });
    }

    /**
     * Get trending questions
     * @param {number} limit - Limit number of questions
     * @returns {Promise<Object>} - Trending response
     */
    async getTrendingQuestions(limit = 10) {
        return this.request(`/trending?limit=${limit}`);
    }

    /**
     * Get questions by module
     * @param {string} moduleId - Module ID
     * @param {Object} filters - Additional filters
     * @returns {Promise<Object>} - Module questions response
     */
    async getModuleQuestions(moduleId, filters = {}) {
        const params = new URLSearchParams({ module_id: moduleId });
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        return this.request(`/modules/${moduleId}/questions?${params.toString()}`);
    }

    /**
     * Report a question or answer
     * @param {string} targetType - 'question' or 'answer'
     * @param {string} targetId - Target ID
     * @param {Object} reportData - Report data
     * @returns {Promise<Object>} - Report response
     */
    async reportContent(targetType, targetId, reportData) {
        return this.request(`/${targetType}s/${targetId}/report`, {
            method: 'POST',
            body: JSON.stringify(reportData)
        });
    }
}

// Create global instance
window.communityAPI = new CommunityAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommunityAPI;
}