/* ===== API ENDPOINTS PARA PANEL DE MAESTROS ===== */

// Configuración base de la API
const API_CONFIG = {
    baseURL: '/api',
    timeout: 30000,
    retries: 3,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

class APIClient {
    constructor(config = API_CONFIG) {
        this.config = config;
        this.requestQueue = new Map();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    async request(endpoint, options = {}) {
        const url = `${this.config.baseURL}${endpoint}`;
        const requestId = this.generateRequestId(url, options);
        
        // Verificar cache
        if (options.method === 'GET' || !options.method) {
            const cached = this.getFromCache(requestId);
            if (cached) {
                return cached;
            }
        }

        // Verificar si ya hay una petición en curso
        if (this.requestQueue.has(requestId)) {
            return this.requestQueue.get(requestId);
        }

        const requestPromise = this.executeRequest(url, options);
        this.requestQueue.set(requestId, requestPromise);

        try {
            const result = await requestPromise;
            
            // Guardar en cache si es GET
            if (options.method === 'GET' || !options.method) {
                this.setCache(requestId, result);
            }
            
            return result;
        } finally {
            this.requestQueue.delete(requestId);
        }
    }

    async executeRequest(url, options) {
        const config = {
            ...options,
            headers: {
                ...this.config.headers,
                ...options.headers
            }
        };

        // Agregar token de autenticación si está disponible
        const token = this.getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        let lastError;
        for (let attempt = 0; attempt < this.config.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                } else {
                    return await response.text();
                }
                
            } catch (error) {
                lastError = error;
                
                // No reintentar errores 4xx
                if (error.message.includes('HTTP 4')) {
                    throw error;
                }
                
                // Esperar antes del próximo intento
                if (attempt < this.config.retries - 1) {
                    await this.delay(Math.pow(2, attempt) * 1000);
                }
            }
        }
        
        throw lastError;
    }

    generateRequestId(url, options) {
        const key = `${options.method || 'GET'}_${url}_${JSON.stringify(options.body || {})}`;
        return btoa(key).replace(/[/+=]/g, '');
    }

    getFromCache(key) {
        const item = this.cache.get(key);
        if (item && Date.now() - item.timestamp < this.cacheTimeout) {
            return item.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    getAuthToken() {
        return localStorage.getItem('instructor_token') || sessionStorage.getItem('instructor_token');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    clearCache() {
        this.cache.clear();
    }
}

// Instancia global del cliente API
const apiClient = new APIClient();

/* ===== ENDPOINTS DE CURSOS ===== */

const CoursesAPI = {
    // Obtener todos los cursos
    async getAll(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/courses?${params}` : '/courses';
        return apiClient.request(endpoint);
    },

    // Obtener curso por ID
    async getById(id) {
        return apiClient.request(`/courses/${id}`);
    },

    // Crear nuevo curso
    async create(courseData) {
        return apiClient.request('/courses', {
            method: 'POST',
            body: JSON.stringify(courseData)
        });
    },

    // Actualizar curso
    async update(id, courseData) {
        return apiClient.request(`/courses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(courseData)
        });
    },

    // Eliminar curso
    async delete(id) {
        return apiClient.request(`/courses/${id}`, {
            method: 'DELETE'
        });
    },

    // Duplicar curso
    async duplicate(id) {
        return apiClient.request(`/courses/${id}/duplicate`, {
            method: 'POST'
        });
    },

    // Obtener estadísticas de cursos
    async getStats() {
        return apiClient.request('/courses/stats');
    },

    // Exportar cursos
    async export(format = 'json', courseIds = []) {
        return apiClient.request('/courses/export', {
            method: 'POST',
            body: JSON.stringify({ format, courseIds })
        });
    },

    // Importar cursos
    async import(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        return apiClient.request('/courses/import', {
            method: 'POST',
            headers: {}, // Remover Content-Type para FormData
            body: formData
        });
    }
};

/* ===== ENDPOINTS DE MÓDULOS ===== */

const ModulesAPI = {
    // Obtener módulos de un curso
    async getByCourse(courseId) {
        return apiClient.request(`/courses/${courseId}/modules`);
    },

    // Obtener módulo por ID
    async getById(moduleId) {
        return apiClient.request(`/modules/${moduleId}`);
    },

    // Crear nuevo módulo
    async create(courseId, moduleData) {
        return apiClient.request(`/courses/${courseId}/modules`, {
            method: 'POST',
            body: JSON.stringify(moduleData)
        });
    },

    // Actualizar módulo
    async update(moduleId, moduleData) {
        return apiClient.request(`/modules/${moduleId}`, {
            method: 'PUT',
            body: JSON.stringify(moduleData)
        });
    },

    // Eliminar módulo
    async delete(moduleId) {
        return apiClient.request(`/modules/${moduleId}`, {
            method: 'DELETE'
        });
    },

    // Reordenar módulos
    async reorder(courseId, moduleOrder) {
        return apiClient.request(`/courses/${courseId}/modules/reorder`, {
            method: 'PUT',
            body: JSON.stringify({ order: moduleOrder })
        });
    }
};

/* ===== ENDPOINTS DE ACTIVIDADES ===== */

const ActivitiesAPI = {
    // Obtener actividades de un módulo
    async getByModule(moduleId) {
        return apiClient.request(`/modules/${moduleId}/activities`);
    },

    // Obtener actividad por ID
    async getById(activityId) {
        return apiClient.request(`/activities/${activityId}`);
    },

    // Crear nueva actividad
    async create(moduleId, activityData) {
        return apiClient.request(`/modules/${moduleId}/activities`, {
            method: 'POST',
            body: JSON.stringify(activityData)
        });
    },

    // Actualizar actividad
    async update(activityId, activityData) {
        return apiClient.request(`/activities/${activityId}`, {
            method: 'PUT',
            body: JSON.stringify(activityData)
        });
    },

    // Eliminar actividad
    async delete(activityId) {
        return apiClient.request(`/activities/${activityId}`, {
            method: 'DELETE'
        });
    },

    // Reordenar actividades
    async reorder(moduleId, activityOrder) {
        return apiClient.request(`/modules/${moduleId}/activities/reorder`, {
            method: 'PUT',
            body: JSON.stringify({ order: activityOrder })
        });
    }
};

/* ===== ENDPOINTS DE SERIES ===== */

const SeriesAPI = {
    // Obtener todas las series
    async getAll() {
        return apiClient.request('/series');
    },

    // Obtener serie por ID
    async getById(id) {
        return apiClient.request(`/series/${id}`);
    },

    // Crear nueva serie
    async create(seriesData) {
        return apiClient.request('/series', {
            method: 'POST',
            body: JSON.stringify(seriesData)
        });
    },

    // Actualizar serie
    async update(id, seriesData) {
        return apiClient.request(`/series/${id}`, {
            method: 'PUT',
            body: JSON.stringify(seriesData)
        });
    },

    // Eliminar serie
    async delete(id) {
        return apiClient.request(`/series/${id}`, {
            method: 'DELETE'
        });
    }
};

/* ===== ENDPOINTS DE CHAT IA ===== */

const ChatAPI = {
    // Enviar mensaje al chat IA
    async sendMessage(messageData) {
        return apiClient.request('/chat-ia', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    },

    // Obtener historial de chat
    async getHistory(sessionId) {
        return apiClient.request(`/chat-sessions/${sessionId}`);
    },

    // Guardar sesión de chat
    async saveSession(sessionData) {
        return apiClient.request('/chat-sessions', {
            method: 'POST',
            body: JSON.stringify(sessionData)
        });
    },

    // Obtener sesiones de chat del usuario
    async getUserSessions() {
        return apiClient.request('/chat-sessions');
    },

    // Eliminar sesión de chat
    async deleteSession(sessionId) {
        return apiClient.request(`/chat-sessions/${sessionId}`, {
            method: 'DELETE'
        });
    }
};

/* ===== ENDPOINTS DE ARCHIVOS ===== */

const FilesAPI = {
    // Subir archivo
    async upload(file, type = 'general') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        return apiClient.request('/files/upload', {
            method: 'POST',
            headers: {}, // Remover Content-Type para FormData
            body: formData
        });
    },

    // Obtener archivo
    async get(fileId) {
        return apiClient.request(`/files/${fileId}`);
    },

    // Eliminar archivo
    async delete(fileId) {
        return apiClient.request(`/files/${fileId}`, {
            method: 'DELETE'
        });
    },

    // Obtener archivos del usuario
    async getUserFiles(type = null) {
        const params = type ? `?type=${type}` : '';
        return apiClient.request(`/files${params}`);
    }
};

/* ===== ENDPOINTS DE USUARIO ===== */

const UserAPI = {
    // Obtener perfil del usuario
    async getProfile() {
        return apiClient.request('/user/profile');
    },

    // Actualizar perfil
    async updateProfile(profileData) {
        return apiClient.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // Obtener configuraciones del usuario
    async getSettings() {
        return apiClient.request('/user/settings');
    },

    // Actualizar configuraciones
    async updateSettings(settings) {
        return apiClient.request('/user/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    },

    // Obtener estadísticas del usuario
    async getStats() {
        return apiClient.request('/user/stats');
    }
};

/* ===== ENDPOINTS DE ANALYTICS ===== */

const AnalyticsAPI = {
    // Obtener dashboard de analytics
    async getDashboard(dateRange = 'last_30_days') {
        return apiClient.request(`/analytics/dashboard?range=${dateRange}`);
    },

    // Obtener métricas de cursos
    async getCourseMetrics(courseId, dateRange = 'last_30_days') {
        return apiClient.request(`/analytics/courses/${courseId}?range=${dateRange}`);
    },

    // Obtener engagement de estudiantes
    async getStudentEngagement(courseId) {
        return apiClient.request(`/analytics/courses/${courseId}/engagement`);
    },

    // Enviar evento de tracking
    async track(eventData) {
        return apiClient.request('/analytics/track', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }
};

/* ===== ENDPOINTS DE REPORTES ===== */

const ReportsAPI = {
    // Generar reporte de curso
    async generateCourseReport(courseId, options = {}) {
        return apiClient.request(`/reports/course/${courseId}`, {
            method: 'POST',
            body: JSON.stringify(options)
        });
    },

    // Obtener reportes del usuario
    async getUserReports() {
        return apiClient.request('/reports');
    },

    // Descargar reporte
    async downloadReport(reportId) {
        return apiClient.request(`/reports/${reportId}/download`);
    },

    // Eliminar reporte
    async deleteReport(reportId) {
        return apiClient.request(`/reports/${reportId}`, {
            method: 'DELETE'
        });
    }
};

/* ===== WRAPPER INTEGRADO ===== */

class InstructorAPI {
    constructor() {
        this.courses = CoursesAPI;
        this.modules = ModulesAPI;
        this.activities = ActivitiesAPI;
        this.series = SeriesAPI;
        this.chat = ChatAPI;
        this.files = FilesAPI;
        this.user = UserAPI;
        this.analytics = AnalyticsAPI;
        this.reports = ReportsAPI;
        this.client = apiClient;
    }

    // Método para configurar el cliente
    configure(config) {
        Object.assign(apiClient.config, config);
    }

    // Método para setear token de autenticación
    setAuthToken(token, persistent = false) {
        if (persistent) {
            localStorage.setItem('instructor_token', token);
        } else {
            sessionStorage.setItem('instructor_token', token);
        }
    }

    // Método para limpiar autenticación
    clearAuth() {
        localStorage.removeItem('instructor_token');
        sessionStorage.removeItem('instructor_token');
        apiClient.clearCache();
    }

    // Método para verificar conectividad
    async ping() {
        try {
            return await apiClient.request('/ping');
        } catch (error) {
            return false;
        }
    }

    // Método para manejar errores globalmente
    onError(callback) {
        this.errorHandler = callback;
    }

    // Método para obtener estado de la API
    getStatus() {
        return {
            requestsInProgress: apiClient.requestQueue.size,
            cacheSize: apiClient.cache.size,
            isOnline: navigator.onLine
        };
    }
}

// Crear instancia global
const instructorAPI = new InstructorAPI();

// Manejar errores de red
window.addEventListener('online', () => {
    console.log('🟢 Conexión restaurada');
});

window.addEventListener('offline', () => {
    console.log('🔴 Sin conexión a internet');
});

// Exportar para uso global
window.InstructorAPI = InstructorAPI;
window.instructorAPI = instructorAPI;

// Para compatibilidad con módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InstructorAPI, instructorAPI };
}