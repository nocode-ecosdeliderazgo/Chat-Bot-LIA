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
        this.syncInterval = 30 * 1000; // 30 segundos
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
                'courseProgress_intro-to-ai',    // Clave usada en chat-online
                'courseProgress_intro-to-ai', // Variante
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

        // Formato de chat-online.html (courseProgress_intro-to-ai)
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
            if (this.isOnline) {
                // Sincronizar inmediatamente si es la primera vez o si han pasado 30 segundos
                if (this.shouldSync()) {
                    this.syncWithDatabase(progressData);
                }
            }

            return true;
        } catch (error) {
            console.error('❌ Error guardando progreso:', error);
            return false;
        }
    }

    // Sincronizar con base de datos
    async syncWithDatabase(localProgressData = null) {
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
            
            // Obtener datos locales para enviar
            const progressToSync = localProgressData || this.loadFromLocalStorage();
            
            if (!progressToSync) {
                console.log('⚠️ No hay datos locales para sincronizar');
                this.emit('syncError', { error: 'No hay datos para sincronizar' });
                return;
            }

            // Preparar datos para enviar a BD
            const syncData = this.prepareDataForSync(progressToSync);
            console.log('📤 Enviando datos a BD:', syncData);

            // Usar POST para enviar datos actualizados
            const response = await fetch(`/api/progress/sync?courseId=${this.courseId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId
                },
                body: JSON.stringify(syncData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📡 Respuesta de BD recibida:', data);

                if (data.success && data.progress) {
                    console.log('✅ Datos sincronizados exitosamente con BD');
                    
                    // Actualizar localStorage con datos de BD (por si hay cambios)
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

    // Preparar datos para sincronización con BD
    prepareDataForSync(progressData) {
        console.log('🔄 Preparando datos para sincronización:', progressData);

        // Formato de chat-online.html (courseProgress_intro-to-ai)
        if (progressData.percentage !== undefined) {
            console.log('📊 Formato chat-online detectado');
            
            // Convertir a formato de módulos para BD
            const modules = [];
            const totalVideos = progressData.totalVideos || 18;
            const completedVideos = progressData.completedVideos || 0;
            
            // Crear módulos basados en el progreso (6 módulos para el curso de IA)
            const moduleNames = [
                '¿Qué es la IA?',
                'Historia de la IA',
                'Tipos de IA',
                'Aplicaciones de la IA',
                'Ética en la IA',
                'Futuro de la IA'
            ];
            
            for (let i = 1; i <= 6; i++) {
                const moduleStart = (i - 1) * 3 + 1;
                const moduleEnd = Math.min(i * 3, totalVideos);
                const moduleCompleted = completedVideos >= moduleEnd;
                const moduleProgress = moduleCompleted ? 100 : Math.max(0, Math.min(100, ((completedVideos - moduleStart + 1) / (moduleEnd - moduleStart + 1)) * 100));
                
                modules.push({
                    module_number: i,
                    module_name: moduleNames[i - 1] || `Módulo ${i}`,
                    module_identifier: `module-${i}-intro-ia`,
                    progress_percentage: Math.round(moduleProgress),
                    video_progress_percentage: Math.round(moduleProgress),
                    video_completed: moduleCompleted,
                    last_video_position: moduleCompleted ? 0 : Math.max(0, (completedVideos - moduleStart + 1) * 100),
                    status: moduleCompleted ? 'completed' : (moduleProgress > 0 ? 'in_progress' : 'not_started')
                });
            }
            
            return {
                overall_progress_percentage: progressData.percentage,
                modules: modules
            };
        }

        // Formato de lessonProgress (module1-videos-loader)
        if (typeof progressData === 'object' && !Array.isArray(progressData)) {
            console.log('📊 Formato lessonProgress detectado');
            
            const lessons = Object.values(progressData);
            const completedLessons = lessons.filter(lesson => lesson.completed).length;
            const totalLessons = lessons.length;
            const percentage = Math.round((completedLessons / totalLessons) * 100);
            
            // Agrupar lecciones en módulos (6 módulos para el curso de IA)
            const modules = [];
            const moduleNames = [
                '¿Qué es la IA?',
                'Historia de la IA',
                'Tipos de IA',
                'Aplicaciones de la IA',
                'Ética en la IA',
                'Futuro de la IA'
            ];
            const lessonsPerModule = Math.ceil(totalLessons / 6);
            
            for (let i = 0; i < 6; i++) {
                const moduleStart = i * lessonsPerModule;
                const moduleEnd = Math.min((i + 1) * lessonsPerModule, totalLessons);
                const moduleLessons = lessons.slice(moduleStart, moduleEnd);
                const moduleCompleted = moduleLessons.every(lesson => lesson.completed);
                const moduleProgress = moduleCompleted ? 100 : Math.round((moduleLessons.filter(l => l.completed).length / moduleLessons.length) * 100);
                
                modules.push({
                    module_number: i + 1,
                    module_name: moduleNames[i] || `Módulo ${i + 1}`,
                    module_identifier: `module-${i + 1}-intro-ia`,
                    progress_percentage: moduleProgress,
                    video_progress_percentage: moduleProgress,
                    video_completed: moduleCompleted,
                    last_video_position: moduleCompleted ? 0 : Math.max(0, (moduleLessons.filter(l => l.completed).length) * 100),
                    status: moduleCompleted ? 'completed' : (moduleProgress > 0 ? 'in_progress' : 'not_started')
                });
            }
            
            return {
                overall_progress_percentage: percentage,
                modules: modules
            };
        }

        // Formato con modules array
        if (progressData.modules && Array.isArray(progressData.modules)) {
            console.log('📊 Formato modules detectado');
            return {
                overall_progress_percentage: progressData.overall_progress_percentage || 0,
                modules: progressData.modules
            };
        }

        // Formato por defecto
        console.log('📊 Formato por defecto');
        return {
            overall_progress_percentage: 0,
            modules: []
        };
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

    // Sincronización inmediata (para eventos como clicks en checkboxes)
    async forceSync(progressData = null) {
        console.log('🚀 Forzando sincronización inmediata...');
        
        // Resetear tiempo de última sincronización para forzar sync
        this.lastSyncTime = null;
        
        // Sincronizar inmediatamente
        await this.syncWithDatabase(progressData);
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
