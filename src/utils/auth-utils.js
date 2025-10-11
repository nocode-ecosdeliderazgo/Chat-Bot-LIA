// ===== AUTH UTILS - SISTEMA UNIFICADO DE AUTENTICACIÓN =====
// Utilidad para obtener usuario autenticado desde múltiples fuentes
// Sincroniza autenticación entre menú de perfil y sistema de comunidades

class AuthUtils {

    static async getCurrentAuthenticatedUser() {
        // console.log('🔍 AuthUtils: Buscando usuario autenticado desde múltiples fuentes...');

        // 1. Verificar localStorage (donde funciona el menú de perfil)
        const localUser = this.getUserFromLocalStorage();
        if (localUser) {
            // console.log('✅ Usuario encontrado en localStorage:', localUser.email || localUser.id);
            return localUser;
        }

        // 2. Verificar sessionStorage
        const sessionUser = this.getUserFromSessionStorage();
        if (sessionUser) {
            // console.log('✅ Usuario encontrado en sessionStorage:', sessionUser.email || sessionUser.id);
            return sessionUser;
        }

        // 3. Verificar variables globales
        const globalUser = this.getUserFromGlobalVariables();
        if (globalUser) {
            // console.log('✅ Usuario encontrado en variables globales:', globalUser.email || globalUser.id);
            return globalUser;
        }

        // 4. Verificar Supabase directamente
        const supabaseUser = await this.getUserFromSupabase();
        if (supabaseUser) {
            // console.log('✅ Usuario encontrado en Supabase:', supabaseUser.email);
            return supabaseUser;
        }

        // 5. Verificar endpoint de sesión (futuro)
        const endpointUser = await this.getUserFromEndpoint();
        if (endpointUser) {
            // console.log('✅ Usuario encontrado desde endpoint:', endpointUser.email);
            return endpointUser;
        }

        // console.log('❌ No se encontró usuario autenticado por ningún método');
        return null;
    }

    static getUserFromLocalStorage() {
        // console.log('🔄 AuthUtils: Verificando localStorage...');

        // Fuentes conocidas de datos de usuario en localStorage
        const sources = [
            'currentUser',    // Usado por el menú de perfil (FUNCIONA)
            'userData',
            'user',
            'authUser',
            'userProfile',
            'userSession',
            'profile'
        ];

        for (const source of sources) {
            try {
                const data = localStorage.getItem(source);
                if (data && data !== 'null' && data !== 'undefined' && data.trim() !== '') {
                    // console.log(`📊 Encontrado localStorage.${source}:`, data.substring(0, 100) + '...');

                    const user = JSON.parse(data);
                    if (user && (user.id || user.user_id || user.email)) {
                        // console.log(`✅ Usuario válido desde localStorage.${source}:`, user);

                        // Normalizar estructura de usuario
                        return this.normalizeUserObject(user);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Error parseando localStorage.${source}:`, error.message);
                continue;
            }
        }

        // console.log('❌ No se encontró usuario válido en localStorage');
        return null;
    }

    static getUserFromSessionStorage() {
        // console.log('🔄 AuthUtils: Verificando sessionStorage...');

        const sources = ['currentUser', 'userData', 'user', 'authUser', 'userSession'];

        for (const source of sources) {
            try {
                const data = sessionStorage.getItem(source);
                if (data && data !== 'null' && data !== 'undefined' && data.trim() !== '') {
                    const user = JSON.parse(data);
                    if (user && (user.id || user.user_id || user.email)) {
                        // console.log(`✅ Usuario encontrado en sessionStorage.${source}:`, user);
                        return this.normalizeUserObject(user);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Error parseando sessionStorage.${source}:`, error.message);
                continue;
            }
        }

        // console.log('❌ No se encontró usuario válido en sessionStorage');
        return null;
    }

    static getUserFromGlobalVariables() {
        // console.log('🔄 AuthUtils: Verificando variables globales...');

        const globalSources = [
            'currentUser',
            'user',
            'authUser',
            'userData'
        ];

        for (const source of globalSources) {
            try {
                const user = window[source];
                if (user && typeof user === 'object' && (user.id || user.user_id || user.email)) {
                    // console.log(`✅ Usuario encontrado en window.${source}:`, user);
                    return this.normalizeUserObject(user);
                }
            } catch (error) {
                console.warn(`⚠️ Error accediendo window.${source}:`, error.message);
                continue;
            }
        }

        // console.log('❌ No se encontró usuario válido en variables globales');
        return null;
    }

    static async getUserFromSupabase() {
        // console.log('🔄 AuthUtils: Verificando Supabase auth...');

        try {
            if (window.supabase && window.supabase.auth) {
                // console.log('✅ Supabase auth disponible');

                // Intentar getSession primero
                const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();

                if (session?.user && !sessionError) {
                    // console.log('✅ Usuario desde Supabase session:', session.user.email);
                    return this.normalizeUserObject(session.user);
                }

                // Fallback a getUser
                const { data: { user }, error: userError } = await window.supabase.auth.getUser();

                if (user && !userError) {
                    // console.log('✅ Usuario desde Supabase getUser:', user.email);
                    return this.normalizeUserObject(user);
                }

                // console.log('⚠️ Supabase auth no devolvió usuario válido');
            } else {
                // console.log('⚠️ Supabase auth no disponible');
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo usuario desde Supabase:', error.message);
        }

        return null;
    }

    static async getUserFromEndpoint() {
        // console.log('🔄 AuthUtils: Verificando endpoint de autenticación...');

        try {
            const response = await fetch('/api/user/auth-session', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    // console.log('✅ Usuario desde endpoint:', data.user.email);
                    return this.normalizeUserObject(data.user);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo usuario desde endpoint:', error.message);
        }

        return null;
    }

    // Normalizar objeto de usuario para tener estructura consistente
    static normalizeUserObject(user) {
        if (!user) return null;

        // Estructura consistente para todos los usuarios
        const normalizedUser = {
            id: user.id || user.user_id || user.uid,
            email: user.email || user.user?.email || user.data?.email,
            display_name: user.display_name || user.name || user.full_name || user.user_metadata?.full_name,
            user_metadata: user.user_metadata || {},
            app_metadata: user.app_metadata || {},
            created_at: user.created_at || new Date().toISOString(),

            // Mantener datos originales para compatibilidad
            originalData: user
        };

        // Validar que tenga al menos ID o email
        if (!normalizedUser.id && !normalizedUser.email) {
            console.warn('⚠️ Usuario sin ID ni email válido:', user);
            return null;
        }

        return normalizedUser;
    }

    // Sincronizar usuario encontrado con todas las fuentes
    static syncUserToAllSources(user) {
        if (!user) return;

        // console.log('🔄 AuthUtils: Sincronizando usuario con todas las fuentes...');

        try {
            // Guardar en localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('userData', JSON.stringify(user));

            // Guardar en sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(user));

            // Establecer variables globales
            window.currentUser = user;
            window.userData = user;

            // console.log('✅ Usuario sincronizado en todas las fuentes');
        } catch (error) {
            console.error('❌ Error sincronizando usuario:', error);
        }
    }

    // Debug completo del estado de autenticación
    static debugAuthenticationState() {
        // console.log('🔍 === DEBUG COMPLETO AUTENTICACIÓN ===');

        // localStorage
        // console.log('📊 LocalStorage:');
        const localStorageKeys = ['currentUser', 'userData', 'user', 'authToken', 'userSession'];
        localStorageKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value && value !== 'null') {
                // console.log(`  ${key}: Presente (${value.length} chars)`, value.substring(0, 100) + '...');
            } else {
                // console.log(`  ${key}: Ausente`);
            }
        });

        // sessionStorage
        // console.log('📊 SessionStorage:');
        localStorageKeys.forEach(key => {
            const value = sessionStorage.getItem(key);
            // console.log(`  ${key}:`, value ? `Presente (${value.length} chars)` : 'Ausente');
        });

        // Variables globales
        // console.log('📊 Variables globales:');
        // console.log('  window.currentUser:', window.currentUser ? 'Presente' : 'Ausente');
        // console.log('  window.user:', window.user ? 'Presente' : 'Ausente');
        // console.log('  window.userData:', window.userData ? 'Presente' : 'Ausente');

        // Estado Supabase
        // console.log('📊 Estado Supabase:');
        // console.log('  window.supabase:', !!window.supabase);
        // console.log('  window.supabaseInitialized:', window.supabaseInitialized);

        if (window.supabase && window.supabase.auth) {
            window.supabase.auth.getSession().then(({ data: { session }, error }) => {
                // console.log('  Supabase session:', session ? 'Presente' : 'Ausente');
                // console.log('  Supabase session error:', error);
                if (session?.user) {
                    // console.log('  Supabase user email:', session.user.email);
                }
            });
        }

        // console.log('🔍 === FIN DEBUG AUTENTICACIÓN ===');
    }
}

// Hacer disponible globalmente
window.AuthUtils = AuthUtils;

// console.log('✅ AuthUtils cargado y disponible globalmente');