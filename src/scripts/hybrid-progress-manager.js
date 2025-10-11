// =====================================================
// HYBRID PROGRESS MANAGER
// Sistema híbrido de sincronización de progreso
// Compatible con courses.html y chat-online.html
// =====================================================

class HybridProgressManager {
    constructor(courseId = 'intro-to-ai') {
        this.courseId = courseId;
        this.storagePrefix = 'courseProgress_';
        this.syncInProgress = false;
        this.isOnline = navigator.onLine;
        this.lastSyncTime = null;
        this.syncInterval = 10 * 60 * 1000; // 10 minutos
        this.eventListeners = new Map();

        // Monitorear conexión
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.emit('connectionChanged', { online: true });
            if (this.shouldSync()) {
                this.syncWithDatabase();
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.emit('connectionChanged', { online: false });
        });
    }

    // Sistema de eventos
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error en listener de ${event}:`, error);
                }
            });
        }
    }

    // Verificar si debe sincronizar
    shouldSync() {
        if (!this.lastSyncTime) return true;
        const timeSinceLastSync = Date.now() - this.lastSyncTime;
        return timeSinceLastSync >= this.syncInterval;
    }

    // Cargar desde localStorage
    loadFromLocalStorage() {
        try {
            // Buscar en múltiples claves posibles
            const possibleKeys = [
                this.storagePrefix + this.courseId, // courseProgress_intro-to-ai
                'courseProgress_chatgpt-gemini',    // Clave usada en chat-online
                'courseProgress_chatgpt-gemini-course', // Variante
                'lessonProgress'                    // Clave usada en module1-videos-loader
            ];

            let stored = null;
            let usedKey = null;

            // Buscar en todas las claves posibles
            for (const key of possibleKeys) {
                stored = localStorage.getItem(key);
                if (stored) {
                    usedKey = key;
                    console.log(`✅ Progreso encontrado en key: "${key}"`);
                    break;
                }
            }

            if (!stored) {
                console.warn('⚠️ No hay progreso guardado en localStorage');
                return null;
            }

            const parsed = JSON.parse(stored);
            console.log('✅ Progreso encontrado en localStorage:', parsed);

            // Soportar ambos formatos (nuevo con version y viejo sin version)
            if (parsed.version) {
                console.log(`📦 Formato nuevo (v${parsed.version})`);
                return parsed.data;
            }

            // Formato viejo (compatibilidad)
            console.log('📦 Formato legacy');
            return parsed;

        } catch (error) {
            console.error('❌ Error cargando progreso local:', error);
            return null;
        }
    }

    // Calcular progreso general
    calculateOverallProgress(progressData) {
        if (!progressData) return 0;

        console.log('📊 Calculando progreso desde:', progressData);

        // Formato de chat-online.html (courseProgress_chatgpt-gemini)
        if (progressData.percentage !== undefined) {
            console.log(`📊 Progreso directo: ${progressData.percentage}%`);
            return progressData.percentage;
        }

        // Si ya tiene overall_progress_percentage, usarlo
        if (progressData.overall_progress_percentage !== undefined) {
            console.log(`📊 Progreso overall: ${progressData.overall_progress_percentage}%`);
            return progressData.overall_progress_percentage;
        }

        // Si tiene modules, calcular promedio
        if (progressData.modules && Array.isArray(progressData.modules)) {
            const totalModules = progressData.modules.length;
            if (totalModules === 0) return 0;

            const totalProgress = progressData.modules.reduce((sum, module) => {
                return sum + (module.video_progress_percentage || 0);
            }, 0);

            const average = Math.round(totalProgress / totalModules);
            console.log(`📊 Progreso promedio de módulos: ${average}%`);
            return average;
        }

        // Formato de lessonProgress (module1-videos-loader)
        if (typeof progressData === 'object' && !Array.isArray(progressData)) {
            const lessons = Object.values(progressData);
            if (lessons.length > 0) {
                const completedLessons = lessons.filter(lesson => lesson.completed).length;
                const percentage = Math.round((completedLessons / lessons.length) * 100);
                console.log(`📊 Progreso de lecciones: ${percentage}% (${completedLessons}/${lessons.length})`);
                return percentage;
            }
        }

        console.log('📊 No se pudo calcular progreso, retornando 0%');
        return 0;
    }

    // Guardar progreso en localStorage
    saveProgress(progressData) {
        try {
            const storageData = {
                version: '2.0',
                data: progressData,
                timestamp: Date.now(),
                synced: false,
                lastSyncTime: null
            };

            localStorage.setItem(this.storagePrefix + this.courseId, JSON.stringify(storageData));
            console.log('💾 Progreso guardado en localStorage');

            // Emitir evento de progreso actualizado
            this.emit('progressUpdated', {
                courseId: this.courseId,
                progress: progressData,
                source: 'local'
            });

            // Intentar sincronizar con BD en background
            if (this.isOnline && this.shouldSync()) {
                this.syncWithDatabase();
            }

            return true;
        } catch (error) {
            console.error('❌ Error guardando progreso:', error);
            return false;
        }
    }

    // Sincronizar con base de datos
    async syncWithDatabase() {
        if (this.syncInProgress || !this.isOnline) return;

        this.syncInProgress = true;
        console.log('🔄 Iniciando sincronización con BD...');

        // Emitir evento de inicio de sincronización
        this.emit('syncStarted', { courseId: this.courseId });

        try {
            const userId = this.getUserId();
            if (!userId) {
                console.log('⚠️ No se pudo obtener userId, saltando sincronización');
                this.emit('syncError', { error: 'Usuario no identificado' });
                return;
            }

            console.log(`👤 Sincronizando para usuario: ${userId}`);
            
            const response = await fetch(`/api/progress/sync?courseId=${this.courseId}`, {
                method: 'GET',
                headers: {
                    'X-User-Id': userId
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📡 Respuesta de BD recibida:', data);

                if (data.success && data.progress) {
                    console.log('✅ Datos de BD válidos, actualizando localStorage...');
                    
                    // Actualizar localStorage con datos de BD
                    const storageData = {
                        version: '2.0',
                        data: data.progress,
                        timestamp: Date.now(),
                        synced: true,
                        lastSyncTime: Date.now()
                    };

                    localStorage.setItem(this.storagePrefix + this.courseId, JSON.stringify(storageData));
                    console.log('💾 localStorage actualizado con datos de BD');

                    // Actualizar tiempo de última sincronización
                    this.lastSyncTime = Date.now();

                    // Emitir evento de sincronización exitosa
                    this.emit('syncCompleted', {
                        courseId: this.courseId,
                        progress: data.progress,
                        source: 'database'
                    });

                    console.log('✅ Sincronización completada exitosamente');
                } else {
                    console.log('⚠️ BD no devolvió datos válidos');
                    this.emit('syncError', { error: 'Datos no válidos' });
                }
            } else {
                console.log(`❌ Error en respuesta de BD: ${response.status} ${response.statusText}`);
                this.emit('syncError', { error: `Error del servidor: ${response.status}` });
            }

        } catch (error) {
            console.log('❌ Error en sincronización con BD:', error.message);
            this.emit('syncError', { error: 'Error de conexión' });
        } finally {
            this.syncInProgress = false;
            console.log('🏁 Sincronización finalizada');
        }
    }

    // Obtener ID del usuario
    getUserId() {
        try {
            // 1. Del localStorage
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                return user.id;
            }

            // 2. UserId directo
            const directUserId = localStorage.getItem('userId');
            if (directUserId) {
                return directUserId;
            }

            // 3. Del sessionStorage
            const sessionData = sessionStorage.getItem('userData');
            if (sessionData) {
                const user = JSON.parse(sessionData);
                return user.id;
            }

            return null;

        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    }

    // Cargar progreso (estrategia híbrida)
    load() {
        console.log('🚀 Iniciando carga de progreso...');

        // 1. SIEMPRE cargar desde localStorage primero (para velocidad)
        console.log('📱 === FASE 1: CARGANDO LOCALSTORAGE ===');
        const localProgress = this.loadFromLocalStorage();

        if (localProgress) {
            console.log('✅ Progreso encontrado en localStorage, actualizando UI...');
            this.emit('progressLoaded', {
                courseId: this.courseId,
                progress: localProgress,
                source: 'localStorage'
            });
            console.log('📊 UI actualizada con datos locales');
        } else {
            console.log('⚠️ No hay progreso en localStorage');
        }

        // 2. Sincronizar con BD solo si es necesario
        if (this.isOnline && this.shouldSync()) {
            console.log('🌐 === FASE 2: SINCRONIZANDO CON BD ===');
            this.syncWithDatabase();
        } else if (this.isOnline) {
            console.log('⏰ Sincronización reciente, saltando BD');
        } else {
            console.log('📴 Sin conexión - usando solo datos locales');
        }
    }

    // Obtener estado de sincronización
    getSyncStatus() {
        const now = Date.now();
        const lastSync = this.lastSyncTime;
        const nextSync = lastSync ? lastSync + this.syncInterval : null;
        
        return {
            lastSyncTime: lastSync,
            nextSyncTime: nextSync,
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress,
            syncInterval: this.syncInterval,
            timeSinceLastSync: lastSync ? now - lastSync : null
        };
    }
}

// Exportar para uso global
window.HybridProgressManager = HybridProgressManager;
