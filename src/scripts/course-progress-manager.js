// ===== COURSE PROGRESS MANAGER =====
// Gestiona el progreso del curso con integración backend

class CourseProgressManager {
    constructor() {
        this.userId = null;
        this.courseId = 'intro-to-ai';
        this.currentProgress = null;
        this.progressCache = null;
        this.cacheTimestamp = null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutos
        this.isUpdating = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Course Progress Manager...');
        
        // Obtener información del usuario
        this.userId = this.getCurrentUserId();
        
        if (!this.userId) {
            console.warn('⚠️ No se pudo obtener user ID, usando modo demo');
            this.userId = 'demo-user-' + Date.now();
        }

        console.log('👤 User ID:', this.userId);
    }

    // ===== OBTENER USUARIO ACTUAL =====
    getCurrentUserId() {
        try {
            // Intentar obtener del localStorage
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                return user.id;
            }

            // Intentar obtener de sessionStorage
            const sessionData = sessionStorage.getItem('userData');
            if (sessionData) {
                const user = JSON.parse(sessionData);
                return user.id;
            }

            // Generar ID temporal para demo
            const demoId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
            console.log('🎭 Usando ID demo:', demoId);
            return demoId;
            
        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            return 'demo-user-fallback';
        }
    }

    // ===== API CALLS =====
    async makeApiCall(endpoint, options = {}) {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalhost ? '' : '';
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': this.userId,
                ...options.headers
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            console.log(`🌐 API Call: ${endpoint}`, mergedOptions);
            
            const response = await fetch(`${baseUrl}${endpoint}`, mergedOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ API Response: ${endpoint}`, data);
            
            return data;
            
        } catch (error) {
            console.error(`❌ API Error: ${endpoint}`, error);
            throw error;
        }
    }

    // ===== OBTENER PROGRESO DEL CURSO =====
    async getCourseProgress(forceRefresh = false) {
        // Usar caché si está disponible y no está vencido
        if (!forceRefresh && this.progressCache && this.cacheTimestamp) {
            const cacheAge = Date.now() - this.cacheTimestamp;
            if (cacheAge < this.cacheDuration) {
                console.log('📦 Usando progreso desde caché');
                return this.progressCache;
            }
        }

        try {
            console.log('📊 Obteniendo progreso del curso...');
            
            const response = await this.makeApiCall(
                `/api/course-progress?course_identifier=${this.courseId}&user_id=${this.userId}`
            );

            if (response.success) {
                this.currentProgress = response.progress;
                this.progressCache = response.progress;
                this.cacheTimestamp = Date.now();
                
                console.log('✅ Progreso obtenido:', this.currentProgress);
                return this.currentProgress;
            } else {
                throw new Error(response.error || 'Error desconocido');
            }

        } catch (error) {
            console.error('❌ Error obteniendo progreso:', error);
            
            // Fallback con datos locales o por defecto
            const fallbackProgress = this.generateFallbackProgress();
            console.log('🔄 Usando progreso de fallback:', fallbackProgress);
            return fallbackProgress;
        }
    }

    // ===== ACTUALIZAR PROGRESO DEL MÓDULO =====
    async updateModuleProgress(moduleNumber, updates = {}) {
        if (this.isUpdating) {
            console.log('⏳ Actualización ya en progreso, saltando...');
            return this.currentProgress;
        }

        this.isUpdating = true;

        try {
            console.log(`📝 Actualizando progreso del módulo ${moduleNumber}:`, updates);

            const requestBody = {
                course_identifier: this.courseId,
                module_number: moduleNumber,
                ...updates
            };

            const response = await this.makeApiCall('/api/module-progress', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            if (response.success) {
                // Actualizar caché local
                this.currentProgress = response.course_progress;
                this.progressCache = response.course_progress;
                this.cacheTimestamp = Date.now();

                console.log('✅ Progreso del módulo actualizado');
                
                // Notificar cambios al UI
                this.notifyProgressUpdate(moduleNumber, response);
                
                return response;
            } else {
                throw new Error(response.error || 'Error actualizando progreso');
            }

        } catch (error) {
            console.error('❌ Error actualizando progreso del módulo:', error);
            throw error;
        } finally {
            this.isUpdating = false;
        }
    }

    // ===== ACTUALIZAR PROGRESO DEL VIDEO =====
    async updateVideoProgress(moduleNumber, videoUpdates = {}) {
        try {
            console.log(`🎥 Actualizando progreso del video módulo ${moduleNumber}:`, videoUpdates);

            const requestBody = {
                course_identifier: this.courseId,
                module_number: moduleNumber,
                ...videoUpdates
            };

            const response = await this.makeApiCall('/api/video-progress', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            if (response.success) {
                // Actualizar caché local
                this.currentProgress = response.course_progress;
                this.progressCache = response.course_progress;
                this.cacheTimestamp = Date.now();

                console.log('✅ Progreso del video actualizado');
                
                // Notificar cambios
                this.notifyVideoProgressUpdate(moduleNumber, response);
                
                return response;
            } else {
                throw new Error(response.error || 'Error actualizando progreso del video');
            }

        } catch (error) {
            console.error('❌ Error actualizando progreso del video:', error);
            throw error;
        }
    }

    // ===== MARCAR SECCIÓN COMO COMPLETADA =====
    async markVideoSectionCompleted(moduleNumber, sectionNumber, startTime = 0, endTime = 0) {
        try {
            const videoUpdates = {
                sections_completed: [{
                    section_number: sectionNumber,
                    completed: true,
                    start_time_seconds: startTime,
                    end_time_seconds: endTime,
                    section_name: `Sección ${sectionNumber}`
                }]
            };

            return await this.updateVideoProgress(moduleNumber, videoUpdates);
            
        } catch (error) {
            console.error('❌ Error marcando sección como completada:', error);
            throw error;
        }
    }

    // ===== COMPLETAR MÓDULO =====
    async completeModule(moduleNumber) {
        try {
            console.log(`🎯 Completando módulo ${moduleNumber}...`);

            const updates = {
                status: 'completed',
                progress_percentage: 100,
                video_completed: true,
                video_progress_percentage: 100
            };

            const response = await this.updateModuleProgress(moduleNumber, updates);
            
            console.log(`✅ Módulo ${moduleNumber} completado`);
            return response;
            
        } catch (error) {
            console.error(`❌ Error completando módulo ${moduleNumber}:`, error);
            throw error;
        }
    }

    // ===== INICIAR MÓDULO =====
    async startModule(moduleNumber) {
        try {
            console.log(`▶️ Iniciando módulo ${moduleNumber}...`);

            const updates = {
                status: 'in_progress',
                progress_percentage: 1
            };

            const response = await this.updateModuleProgress(moduleNumber, updates);
            
            console.log(`✅ Módulo ${moduleNumber} iniciado`);
            return response;
            
        } catch (error) {
            console.error(`❌ Error iniciando módulo ${moduleNumber}:`, error);
            throw error;
        }
    }

    // ===== GENERAR DATOS DE FALLBACK =====
    generateFallbackProgress() {
        return {
            course_progress_id: 'fallback-progress-id',
            user_id: this.userId,
            course_identifier: this.courseId,
            overall_progress_percentage: 0,
            status: 'not_started',
            started_at: null,
            last_accessed_at: new Date().toISOString(),
            completed_at: null,
            modules: [
                {
                    module_number: 1,
                    module_name: '¿Qué es la IA?',
                    status: 'not_started',
                    progress_percentage: 0,
                    video_id: 'Yy_eZ65jzmo',
                    video_progress: 0,
                    video_completed: false
                },
                {
                    module_number: 2,
                    module_name: 'Historia de la IA',
                    status: 'locked',
                    progress_percentage: 0,
                    video_id: 'dhsy6epaJGs',
                    video_progress: 0,
                    video_completed: false
                },
                {
                    module_number: 3,
                    module_name: 'Fundamentos del ML',
                    status: 'locked',
                    progress_percentage: 0,
                    video_id: 'DvyOm9HeT-k',
                    video_progress: 0,
                    video_completed: false
                },
                {
                    module_number: 4,
                    module_name: 'Redes Neuronales',
                    status: 'locked',
                    progress_percentage: 0,
                    video_id: 'oiKj0Z_Xnjc',
                    video_progress: 0,
                    video_completed: false
                },
                {
                    module_number: 5,
                    module_name: 'Aplicaciones Prácticas',
                    status: 'locked',
                    progress_percentage: 0,
                    video_id: 'HMoaRIbOaN0',
                    video_progress: 0,
                    video_completed: false
                }
            ],
            total_modules: 5,
            completed_modules: 0,
            current_module: 1,
            total_time_spent: 0
        };
    }

    // ===== NOTIFICACIONES DE CAMBIOS =====
    notifyProgressUpdate(moduleNumber, response) {
        // Emitir evento personalizado para que el UI se actualice
        const event = new CustomEvent('courseProgressUpdated', {
            detail: {
                moduleNumber,
                progress: response.course_progress,
                module: response.module,
                timestamp: Date.now()
            }
        });
        
        window.dispatchEvent(event);
        console.log('📡 Evento courseProgressUpdated emitido');
    }

    notifyVideoProgressUpdate(moduleNumber, response) {
        const event = new CustomEvent('videoProgressUpdated', {
            detail: {
                moduleNumber,
                progress: response.course_progress,
                module: response.module,
                videoSections: response.video_sections,
                moduleCompleted: response.module_completed,
                timestamp: Date.now()
            }
        });
        
        window.dispatchEvent(event);
        console.log('📡 Evento videoProgressUpdated emitido');
    }

    // ===== UTILIDADES =====
    getModuleProgress(moduleNumber) {
        if (!this.currentProgress || !this.currentProgress.modules) {
            return null;
        }
        
        return this.currentProgress.modules.find(m => m.module_number === moduleNumber);
    }

    getOverallProgress() {
        return this.currentProgress?.overall_progress_percentage || 0;
    }

    getCurrentModule() {
        return this.currentProgress?.current_module || 1;
    }

    isModuleCompleted(moduleNumber) {
        const module = this.getModuleProgress(moduleNumber);
        return module?.status === 'completed';
    }

    isModuleLocked(moduleNumber) {
        const module = this.getModuleProgress(moduleNumber);
        return module?.status === 'locked';
    }

    // ===== MÉTODOS PÚBLICOS PARA UI =====
    async refreshProgress() {
        console.log('🔄 Refrescando progreso...');
        return await this.getCourseProgress(true);
    }

    async initializeForUser(userId) {
        this.userId = userId;
        console.log('🔄 Reinicializando para usuario:', userId);
        
        // Limpiar caché
        this.progressCache = null;
        this.cacheTimestamp = null;
        
        return await this.getCourseProgress(true);
    }
}

// Crear instancia global
window.CourseProgressManager = CourseProgressManager;

// Auto-inicializar si no existe
if (typeof window !== 'undefined' && !window.courseProgressManager) {
    window.courseProgressManager = new CourseProgressManager();
}

export default CourseProgressManager;