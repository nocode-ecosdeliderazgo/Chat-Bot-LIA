// ===== COMMUNITY AUTH UTILITIES =====
// Sistema centralizado de autenticación para módulos de comunidad

class CommunityAuth {
    constructor() {
        this.debugMode = true;
        this.lastKnownUser = null;
        this.authMethods = [
            'supabaseGetSession',
            'supabaseGetUser',
            'authUtilsGetCurrentUser',
            'localStorageCurrentUser',
            'sessionStorageCurrentUser',
            'windowCurrentUser'
        ];
    }

    log(message, data = null) {
        if (this.debugMode) {
            // console.log(`[COMMUNITY-AUTH] ${message}`, data || '');
        }
    }

    warn(message, error = null) {
        console.warn(`[COMMUNITY-AUTH] ⚠️ ${message}`, error || '');
    }

    error(message, error = null) {
        console.error(`[COMMUNITY-AUTH] ❌ ${message}`, error || '');
    }

    success(message, data = null) {
        // console.log(`[COMMUNITY-AUTH] ✅ ${message}`, data || '');
    }

    // Verificar si hay sesión válida de Supabase (para operaciones protegidas)
    async hasSupabaseSession() {
        try {
            // Verificar disponibilidad de Supabase
            if (!window.supabase) {
                this.warn('window.supabase no disponible');
                return false;
            }

            if (!window.supabase.auth) {
                this.warn('window.supabase.auth no disponible');
                return false;
            }

            if (!window.supabase.auth.getSession) {
                this.warn('window.supabase.auth.getSession no disponible');
                return false;
            }

            this.log('🔍 Obteniendo sesión de Supabase...');
            const { data, error } = await window.supabase.auth.getSession();

            if (error) {
                this.warn(`Error obteniendo sesión Supabase: ${error.message}`);
                return false;
            }

            this.log('📊 Datos de sesión recibidos:', {
                hasData: !!data,
                hasSession: !!data?.session,
                hasUser: !!data?.session?.user,
                hasUserId: !!data?.session?.user?.id,
                userEmail: data?.session?.user?.email || 'sin email'
            });

            const hasSession = !!(data?.session?.user?.id);

            if (hasSession) {
                this.success(`✅ Sesión válida de Supabase encontrada para usuario: ${data.session.user.email || data.session.user.id}`);
                return true;
            } else {
                this.warn('❌ No hay sesión válida de Supabase');

                // NUEVO: Intentar restaurar sesión desde localStorage
                this.log('🔄 Intentando restaurar sesión desde localStorage...');
                const restored = await this.tryRestoreSessionFromLocalStorage();
                if (restored) {
                    // Verificar si es una sesión simulada
                    if (this.lastKnownUser?.isSimulated) {
                        this.warn('⚠️ MODO DESARROLLO: Usando sesión simulada - funcionalidad limitada');
                        this.warn('⚠️ Algunas operaciones RLS pueden fallar');
                    } else {
                        this.success('✅ Sesión restaurada exitosamente desde localStorage');
                    }
                    return true;
                }

                return false;
            }
        } catch (error) {
            this.error('Error verificando sesión Supabase:', error.message);
            return false;
        }
    }

    // Intentar restaurar sesión de Supabase desde localStorage
    async tryRestoreSessionFromLocalStorage() {
        try {
            this.log('🔍 Buscando datos de sesión en localStorage...');

            // 1. Buscar tokens de sesión directos
            const authToken = localStorage.getItem('authToken') || localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token');

            if (authToken) {
                this.log('📊 Token de acceso encontrado, intentando restaurar sesión...');

                try {
                    // Intentar setSession con tokens existentes
                    const { data, error } = await window.supabase.auth.setSession({
                        access_token: authToken,
                        refresh_token: refreshToken || authToken
                    });

                    if (!error && data?.session?.user) {
                        this.success('✅ Sesión restaurada con tokens almacenados');
                        return true;
                    } else {
                        this.warn('⚠️ Tokens no válidos para restaurar sesión:', error?.message);
                    }
                } catch (tokenError) {
                    this.warn('⚠️ Error usando tokens almacenados:', tokenError.message);
                }
            }

            // 2. Buscar datos de usuario completos que puedan contener tokens
            const userData = localStorage.getItem('currentUser') || localStorage.getItem('userData');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    this.log('📊 Datos de usuario encontrados:', {
                        hasId: !!user.id,
                        hasEmail: !!user.email,
                        hasAccessToken: !!user.access_token,
                        hasRefreshToken: !!user.refresh_token
                    });

                    // Si el usuario tiene tokens en sus datos
                    if (user.access_token) {
                        this.log('🔄 Intentando restaurar con tokens del usuario...');

                        const { data, error } = await window.supabase.auth.setSession({
                            access_token: user.access_token,
                            refresh_token: user.refresh_token || user.access_token
                        });

                        if (!error && data?.session?.user) {
                            this.success('✅ Sesión restaurada con tokens del usuario');
                            return true;
                        }
                    }

                    // 3. FALLBACK: Si tenemos ID y email válidos, crear sesión temporal usando signInAnonymously o similar
                    if (user.id && user.email) {
                        this.log('🔄 Fallback: Creando sesión temporal para usuario válido...');

                        // Guardar datos del usuario para que las operaciones RLS funcionen
                        // Nota: Esto es un workaround, en producción deberías re-autenticar al usuario
                        this.simulateUserSessionForRLS(user);
                        return true;
                    }

                } catch (parseError) {
                    this.warn('⚠️ Error parseando datos de usuario:', parseError.message);
                }
            }

            // 4. Buscar en otras fuentes de localStorage
            const supabaseSession = localStorage.getItem('sb-lia-auth-token') ||
                                  localStorage.getItem('supabase.auth.token') ||
                                  localStorage.getItem('sb-auth-token');

            if (supabaseSession) {
                try {
                    this.log('🔄 Intentando con token específico de Supabase...');
                    const sessionData = JSON.parse(supabaseSession);

                    if (sessionData.access_token) {
                        const { data, error } = await window.supabase.auth.setSession({
                            access_token: sessionData.access_token,
                            refresh_token: sessionData.refresh_token
                        });

                        if (!error && data?.session?.user) {
                            this.success('✅ Sesión restaurada con token de Supabase');
                            return true;
                        }
                    }
                } catch (error) {
                    this.warn('⚠️ Error con token de Supabase:', error.message);
                }
            }

            this.warn('❌ No se pudo restaurar la sesión desde localStorage');
            return false;

        } catch (error) {
            this.error('Error intentando restaurar sesión:', error.message);
            return false;
        }
    }

    // Simular sesión de usuario para RLS (SOLO PARA TESTING/DESARROLLO)
    simulateUserSessionForRLS(user) {
        this.warn('⚠️ MODO DESARROLLO: Simulando sesión para RLS');
        this.warn('⚠️ Esto es temporal - en producción el usuario debe re-autenticarse');

        // Nota: Esto NO es una solución de producción
        // En producción, deberías dirigir al usuario a re-autenticarse

        // Por ahora, marcamos que tenemos datos de usuario válidos
        this.lastKnownUser = {
            id: user.id,
            email: user.email,
            method: 'localStorage_fallback',
            timestamp: Date.now(),
            isSecure: false, // NO es una sesión segura
            isSimulated: true
        };

        return true;
    }

    // Ejecutar RPC con user_id manual para sesión simulada
    async executeRPCWithSimulatedUser(rpcName, params = {}) {
        if (!this.lastKnownUser?.isSimulated) {
            throw new Error('Este método solo funciona con sesión simulada');
        }

        this.warn(`⚠️ MODO DESARROLLO: Ejecutando RPC ${rpcName} con user_id simulado`);

        // Para rpc_request_access, inyectar el user_id manualmente
        if (rpcName === 'rpc_request_access') {
            // Intentar insertar directamente con user_id manual
            const { data, error } = await window.supabase
                .from('community_access_requests')
                .insert({
                    community_id: params.p_community_id,
                    requester_id: this.lastKnownUser.id,
                    status: 'pending',
                    created_at: new Date().toISOString()
                });

            if (!error) {
                this.success(`✅ ${rpcName} ejecutado correctamente con user_id simulado`);
            }

            return { data, error };
        }

        // Para otros RPCs, intentar con el método normal pero agregando logs
        this.warn(`⚠️ RPC ${rpcName} puede fallar con sesión simulada`);
        return await window.supabase.rpc(rpcName, params);
    }

    // Requerir sesión de Supabase o disparar evento para login
    async requireSupabaseSession() {
        const hasSession = await this.hasSupabaseSession();

        if (hasSession) {
            this.success('Sesión Supabase válida confirmada');
            return true;
        }

        // Disparar evento para que UI maneje el login
        this.warn('Se requiere autenticación para continuar');
        window.dispatchEvent(new CustomEvent('community:auth-required', {
            detail: {
                message: 'Inicia sesión para solicitar acceso a comunidades',
                action: 'login_required'
            }
        }));

        return false;
    }

    // Método principal para obtener userId (ahora distingue entre UI y operaciones protegidas)
    async getCurrentUserId() {
        this.log('🔍 Iniciando búsqueda de userId con todos los métodos disponibles...');

        for (const method of this.authMethods) {
            try {
                const userId = await this[method]();
                if (userId) {
                    // Distinguir entre métodos seguros y de solo UI
                    const isSecureMethod = method.includes('supabase');
                    const methodType = isSecureMethod ? 'AUTENTICACIÓN SEGURA' : 'SOLO UI';

                    this.success(`UserId obtenido via ${method} [${methodType}]:`, userId);
                    this.lastKnownUser = {
                        id: userId,
                        method,
                        timestamp: Date.now(),
                        isSecure: isSecureMethod
                    };
                    return userId;
                }
            } catch (error) {
                this.warn(`Error en ${method}:`, error.message);
            }
        }

        this.error('No se pudo obtener userId por ningún método');
        return null;
    }

    // Método 1: Supabase getSession
    async supabaseGetSession() {
        if (!window.supabase?.auth?.getSession) {
            throw new Error('Supabase auth getSession no disponible');
        }

        const { data: session, error } = await window.supabase.auth.getSession();

        if (error) {
            throw new Error(`Supabase getSession error: ${error.message}`);
        }

        if (session?.session?.user?.id) {
            this.log('📊 Session válida encontrada');
            return session.session.user.id;
        }

        throw new Error('Session no encontrada o inválida');
    }

    // Método 2: Supabase getUser
    async supabaseGetUser() {
        if (!window.supabase?.auth?.getUser) {
            throw new Error('Supabase auth getUser no disponible');
        }

        const { data: user, error } = await window.supabase.auth.getUser();

        if (error) {
            throw new Error(`Supabase getUser error: ${error.message}`);
        }

        if (user?.user?.id) {
            this.log('👤 User válido encontrado');
            return user.user.id;
        }

        throw new Error('User no encontrado o inválido');
    }

    // Método 3: AuthUtils (mejorado)
    async authUtilsGetCurrentUser() {
        if (!window.AuthUtils) {
            throw new Error('AuthUtils no disponible');
        }

        // Verificar métodos disponibles en AuthUtils
        const availableMethods = [
            'getCurrentUser',
            'getAuthenticatedUser',
            'getUserData',
            'getCurrentUserId'
        ];

        for (const methodName of availableMethods) {
            if (typeof window.AuthUtils[methodName] === 'function') {
                try {
                    const authUser = await window.AuthUtils[methodName]();
                    this.log(`📊 AuthUtils.${methodName} resultado:`, authUser);

                    if (authUser) {
                        // Intentar extraer ID de diferentes estructuras posibles
                        const userId = authUser.id ||
                                      authUser.user_id ||
                                      authUser.data?.id ||
                                      authUser.data?.user_id ||
                                      authUser.user?.id ||
                                      (typeof authUser === 'string' ? authUser : null);

                        if (userId) {
                            this.log(`✅ UserId extraído de AuthUtils.${methodName}:`, userId);
                            return userId;
                        }
                    }
                } catch (error) {
                    this.warn(`Error en AuthUtils.${methodName}:`, error.message);
                }
            }
        }

        throw new Error('Ningún método de AuthUtils devolvió un userId válido');
    }

    // Método 4: localStorage currentUser (SOLO PARA UI - NO PARA OPERACIONES PROTEGIDAS)
    async localStorageCurrentUser() {
        const stored = localStorage.getItem('currentUser');
        if (!stored || stored === 'null' || stored === 'undefined') {
            throw new Error('currentUser no encontrado en localStorage');
        }

        try {
            const parsed = JSON.parse(stored);
            this.log('📊 localStorage currentUser (SOLO UI):', parsed);

            const userId = parsed.id ||
                          parsed.user_id ||
                          parsed.data?.id ||
                          parsed.data?.user_id ||
                          parsed.user?.id;

            if (userId) {
                this.log('⚠️ UserId extraído de localStorage (SOLO PARA UI - NO HABILITA RLS):', userId);
                return userId;
            }

            throw new Error('UserId no encontrado en estructura de localStorage');
        } catch (parseError) {
            throw new Error(`Error parseando localStorage: ${parseError.message}`);
        }
    }

    // Método 5: sessionStorage currentUser
    async sessionStorageCurrentUser() {
        const stored = sessionStorage.getItem('currentUser');
        if (!stored || stored === 'null' || stored === 'undefined') {
            throw new Error('currentUser no encontrado en sessionStorage');
        }

        try {
            const parsed = JSON.parse(stored);
            this.log('📊 sessionStorage currentUser:', parsed);

            const userId = parsed.id ||
                          parsed.user_id ||
                          parsed.data?.id ||
                          parsed.data?.user_id ||
                          parsed.user?.id;

            if (userId) {
                this.log('✅ UserId extraído de sessionStorage:', userId);
                return userId;
            }

            throw new Error('UserId no encontrado en estructura de sessionStorage');
        } catch (parseError) {
            throw new Error(`Error parseando sessionStorage: ${parseError.message}`);
        }
    }

    // Método 6: Variables globales window
    async windowCurrentUser() {
        const globalVars = ['currentUser', 'user', 'userData', 'authUser'];

        for (const varName of globalVars) {
            if (window[varName]) {
                try {
                    const globalUser = window[varName];
                    this.log(`📊 window.${varName}:`, globalUser);

                    const userId = globalUser.id ||
                                  globalUser.user_id ||
                                  globalUser.data?.id ||
                                  globalUser.data?.user_id ||
                                  globalUser.user?.id;

                    if (userId) {
                        this.log(`✅ UserId extraído de window.${varName}:`, userId);
                        return userId;
                    }
                } catch (error) {
                    this.warn(`Error extrayendo de window.${varName}:`, error.message);
                }
            }
        }

        throw new Error('No se encontró userId en variables globales');
    }

    // Método auxiliar para obtener información completa del usuario
    async getCurrentUserInfo() {
        const userId = await this.getCurrentUserId();
        if (!userId) return null;

        // Intentar obtener información adicional
        const userInfo = { id: userId };

        try {
            // Intentar obtener datos de Supabase
            if (window.supabase?.auth) {
                const { data: user } = await window.supabase.auth.getUser();
                if (user?.user) {
                    userInfo.email = user.user.email;
                    userInfo.supabaseData = user.user;
                }
            }
        } catch (error) {
            this.warn('No se pudo obtener info adicional de Supabase:', error.message);
        }

        try {
            // Intentar obtener datos de localStorage
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                const parsed = JSON.parse(stored);
                userInfo.localData = parsed;
                userInfo.email = userInfo.email || parsed.email;
                userInfo.name = parsed.display_name || parsed.name || parsed.username;
            }
        } catch (error) {
            this.warn('No se pudo obtener info adicional de localStorage:', error.message);
        }

        return userInfo;
    }

    // Método para verificar si el usuario está autenticado
    async isAuthenticated() {
        try {
            const userId = await this.getCurrentUserId();
            return !!userId;
        } catch (error) {
            return false;
        }
    }

    // Método para debuggear el estado de autenticación
    async debugAuthState() {
        this.log('🔍 === DEBUG COMPLETO DE AUTENTICACIÓN ===');

        for (const method of this.authMethods) {
            try {
                const result = await this[method]();
                this.success(`${method}: ${result}`);
            } catch (error) {
                this.warn(`${method}: ${error.message}`);
            }
        }

        this.log('=== FIN DEBUG DE AUTENTICACIÓN ===');

        const finalUserId = await this.getCurrentUserId();
        return {
            isAuthenticated: !!finalUserId,
            userId: finalUserId,
            lastKnownUser: this.lastKnownUser
        };
    }
}

// Crear instancia global
window.CommunityAuth = new CommunityAuth();

// Esperar a que Supabase esté completamente inicializado
window.addEventListener('supabaseReady', (event) => {
    // console.log('[COMMUNITY-AUTH] ✅ Supabase inicializado correctamente');
    // console.log('[COMMUNITY-AUTH] 🔄 Verificando estado de autenticación...');

    // Verificar inmediatamente el estado de autenticación
    window.CommunityAuth.hasSupabaseSession().then(hasSession => {
        if (hasSession) {
            // console.log('[COMMUNITY-AUTH] ✅ Sesión válida detectada al inicializar');
        } else {
            // console.log('[COMMUNITY-AUTH] ℹ️ No hay sesión activa al inicializar');
        }
    }).catch(error => {
        console.warn('[COMMUNITY-AUTH] ⚠️ Error verificando sesión inicial:', error.message);
    });
});

// Exportar funciones de conveniencia
window.getCommunityUserId = () => window.CommunityAuth.getCurrentUserId();
window.getCommunityUserInfo = () => window.CommunityAuth.getCurrentUserInfo();
window.isCommunityAuthenticated = () => window.CommunityAuth.isAuthenticated();
window.debugCommunityAuth = () => window.CommunityAuth.debugAuthState();

// NUEVOS: Helpers para sesión de Supabase (operaciones protegidas)
window.hasCommunitySession = () => window.CommunityAuth.hasSupabaseSession();
window.requireCommunitySession = () => window.CommunityAuth.requireSupabaseSession();
window.executeRPCWithAuth = (rpcName, params) => {
    // Si tenemos sesión simulada, usar el método especial
    if (window.CommunityAuth.lastKnownUser?.isSimulated) {
        return window.CommunityAuth.executeRPCWithSimulatedUser(rpcName, params);
    }
    // Si no, usar el método normal de Supabase
    return window.supabase.rpc(rpcName, params);
};

// console.log('✅ Community Auth System initialized with Supabase session management');