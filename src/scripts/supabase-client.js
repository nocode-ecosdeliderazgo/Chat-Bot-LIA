// Inicialización robusta del cliente de Supabase para uso en el navegador
// Implementa verificaciones, reintentos y fallbacks según PROMPT_CLAUDE.md

// Variables globales para control de estado
window.supabaseInitialized = false;
window.supabaseLoading = false;
window.supabaseRetries = 0;
const MAX_RETRIES = 3;

// Función de inicialización robusta
async function initializeSupabaseClient() {
    // console.log('🔧 Inicializando cliente de Supabase...');
    
    // Evitar múltiples inicializaciones simultáneas
    if (window.supabaseLoading) {
        // console.log('⏳ Supabase ya se está inicializando...');
        return window.supabase;
    }
    
    if (window.supabaseInitialized && window.supabase) {
        // console.log('✅ Supabase ya está inicializado');
        return window.supabase;
    }
    
    window.supabaseLoading = true;
    
    try {
        // Obtener credenciales desde múltiples fuentes
        const credentials = await getSupabaseCredentials();
        
        if (!credentials.url || !credentials.key) {
            // console.warn('⚠️ Credenciales de Supabase no disponibles, obteniendo desde API...');
            const apiCredentials = await fetchCredentialsFromAPI();
            if (apiCredentials.url && apiCredentials.key) {
                credentials.url = apiCredentials.url;
                credentials.key = apiCredentials.key;
            } else {
                throw new Error('No se pudieron obtener credenciales de Supabase');
            }
        }
        
        // Verificar si la librería está disponible
        if (typeof supabase === 'undefined') {
            // console.log('📚 Cargando librería de Supabase...');
            
            // Intentar cargar desde CDN
            await loadSupabaseLibrary();
            
            // Verificar nuevamente
            if (typeof supabase === 'undefined') {
                throw new Error('No se pudo cargar la librería de Supabase');
            }
        }
        
        // VERIFICACIÓN SIMPLIFICADA Y DIRECTA
        console.log('🔍 Verificando disponibilidad de Supabase...');

        // Verificar window.supabase primero
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            console.log('✅ window.supabase.createClient está disponible');
        } else {
            console.error('❌ window.supabase.createClient NO está disponible');
            console.log('📊 window.supabase:', window.supabase);
            console.log('📊 typeof window.supabase:', typeof window.supabase);

            if (window.supabase) {
                console.log('📊 window.supabase.createClient:', window.supabase.createClient);
                console.log('📊 typeof window.supabase.createClient:', typeof window.supabase.createClient);
            }

            console.error('🗄️ Sin acceso a las tablas: communities, community_members, community_posts, community_reactions');
            throw new Error('window.supabase.createClient no está disponible');
        }

        // Crear cliente con configuración optimizada
        const client = window.supabase.createClient(credentials.url, credentials.key, {
            auth: { 
                storageKey: 'sb-lia',
                autoRefreshToken: true,
                persistSession: true
            },
            global: {
                headers: {
                    'X-Client-Info': 'supabase-js-web'
                }
            }
        });
        
        // Verificar conexión
        await testSupabaseConnection(client);

        // Verificar conexión específica a tablas de comunidad
        await testCommunityTablesConnection(client);

        // Verificar estado de autenticación
        try {
            const { data: { session }, error: sessionError } = await client.auth.getSession();
            if (sessionError) {
                console.warn('⚠️ Error obteniendo sesión:', sessionError.message);
            } else if (session?.user) {
                console.log('✅ Usuario autenticado encontrado:', session.user.email || session.user.id);
            } else {
                console.log('ℹ️ No hay sesión activa - usuario anónimo');
            }
        } catch (authError) {
            console.warn('⚠️ Error verificando autenticación:', authError.message);
        }
        
        // Exponer globalmente
        window.supabase = client;
        window.supabase.supabaseUrl = credentials.url;
        window.supabase.supabaseKey = credentials.key;
        window.supabaseInitialized = true;
        window.supabaseRetries = 0;
        
        // console.log('✅ Cliente de Supabase inicializado correctamente');
        
        // Disparar evento para notificar a otros componentes
        window.dispatchEvent(new CustomEvent('supabaseReady', { detail: client }));
        
        return client;
        
    } catch (error) {
        // console.error('❌ Error inicializando cliente de Supabase:', error);
        
        // Implementar retry con backoff LIMITADO
        if (window.supabaseRetries < MAX_RETRIES) {
            window.supabaseRetries++;
            const delay = Math.pow(2, window.supabaseRetries) * 1000; // Exponential backoff
            
            console.log(`🔄 Reintentando inicialización en ${delay/1000}s (intento ${window.supabaseRetries}/${MAX_RETRIES})`);
            
            setTimeout(() => {
                window.supabaseLoading = false;
                initializeSupabaseClient();
            }, delay);
        } else {
            console.error('❌ Se agotaron los reintentos de inicialización de Supabase');
            console.error('🛑 DETENIENDO BUCLE INFINITO - No más reintentos');
            window.supabase = null;
            window.supabaseInitialized = false;
            window.supabaseLoading = false;
            // NO REINTENTAR MÁS
            window.dispatchEvent(new CustomEvent('supabaseFallback', { detail: error }));
        }
        
        return null;
    } finally {
        window.supabaseLoading = false;
    }
}

// Función para obtener credenciales desde múltiples fuentes
async function getSupabaseCredentials() {
    function getMeta(name) {
        const el = document.querySelector(`meta[name="${name}"]`);
        return el && el.content ? el.content.trim() : '';
    }

    const fallback = {
        url: (window.SUPABASE_URL || localStorage.getItem('supabaseUrl') || '').trim(),
        key: (window.SUPABASE_ANON_KEY || localStorage.getItem('supabaseAnonKey') || '').trim()
    };

    const SUPABASE_URL = getMeta('supabase-url') || fallback.url;
    const SUPABASE_ANON_KEY = getMeta('supabase-key') || fallback.key;

    const looksLikePlaceholder = (key) => {
        if (!key) return true;
        if (key.includes('your-anon-key') || key.includes('TU_CLAVE_ANON_AQUI')) return true;
        if (/someGeneratedSignatureHere/i.test(key)) return true;
        const parts = key.split('.');
        return parts.length !== 3;
    };

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'https://your-project.supabase.co' || looksLikePlaceholder(SUPABASE_ANON_KEY)) {
        return { url: null, key: null };
    }

    return { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };
}

// Función para obtener credenciales desde la API
async function fetchCredentialsFromAPI() {
    try {
        // console.log('📡 Obteniendo credenciales desde /api/supabase-config...');
        
        const response = await fetch('/api/supabase-config');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        
        if (config.success && config.url && config.anon_key) {
            // console.log('✅ Credenciales obtenidas desde API');
            
            // Guardar en variables globales para uso futuro
            window.SUPABASE_URL = config.url;
            window.SUPABASE_ANON_KEY = config.anon_key;
            
            return { url: config.url, key: config.anon_key };
        } else {
            throw new Error('Respuesta de API inválida');
        }
    } catch (error) {
        // console.error('❌ Error obteniendo credenciales desde API:', error);
        return { url: null, key: null };
    }
}

// Función para cargar la librería de Supabase
async function loadSupabaseLibrary() {
    console.log('🔄 NUEVA CARGA DE SUPABASE - Método directo');

    try {
        // MÉTODO DIRECTO: Cargar script y esperar
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js';
        script.crossOrigin = 'anonymous';

        // Promesa que espera a que el script se cargue
        await new Promise((resolve, reject) => {
            script.onload = () => {
                console.log('✅ Script de Supabase cargado');

                // Verificar inmediatamente
                if (window.supabase && typeof window.supabase.createClient === 'function') {
                    console.log('✅ window.supabase.createClient disponible');
                    resolve();
                } else if (typeof createClient === 'function') {
                    // Si createClient está disponible globalmente
                    window.supabase = { createClient };
                    console.log('✅ createClient global asignado a window.supabase');
                    resolve();
                } else {
                    console.error('❌ Supabase cargado pero createClient no disponible');
                    reject(new Error('createClient no encontrado después de cargar script'));
                }
            };

            script.onerror = (error) => {
                console.error('❌ Error cargando script de Supabase:', error);
                reject(error);
            };

            // Timeout de 15 segundos
            setTimeout(() => {
                reject(new Error('Timeout cargando Supabase'));
            }, 15000);

            document.head.appendChild(script);
        });

        console.log('✅ Supabase cargado exitosamente');

    } catch (error) {
        console.error('❌ Error crítico en loadSupabaseLibrary:', error);
        throw error;
    }
}


// Función para probar la conexión de Supabase
async function testSupabaseConnection(client) {
    try {
        // console.log('🔍 Probando conexión de Supabase...');
        
        // Test básico de conexión
        const { data, error } = await client
            .from('community_questions')
            .select('count', { count: 'exact', head: true });
            
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        // console.log('✅ Conexión de Supabase verificada');
    } catch (error) {
        // console.warn('⚠️ Advertencia en test de conexión:', error);
        // No fallar completamente por problemas de conexión
    }
}

// Función para verificar conexión específica a tablas de comunidad
async function testCommunityTablesConnection(client) {
    try {
        console.log('🔍 Probando conexión a tablas de comunidad...');
        
        // Test específico para tabla communities
        const { data: communitiesTest, error: communitiesError } = await client
            .from('communities')
            .select('count', { count: 'exact', head: true });
            
        if (communitiesError && communitiesError.code !== 'PGRST116') {
            throw new Error(`Error en tabla communities: ${communitiesError.message}`);
        }
        
        // Test específico para tabla community_members  
        const { data: membersTest, error: membersError } = await client
            .from('community_members')
            .select('count', { count: 'exact', head: true });
            
        if (membersError && membersError.code !== 'PGRST116') {
            throw new Error(`Error en tabla community_members: ${membersError.message}`);
        }
        
        // Test específico para tabla community_posts
        const { data: postsTest, error: postsError } = await client
            .from('community_posts')
            .select('count', { count: 'exact', head: true });
            
        if (postsError && postsError.code !== 'PGRST116') {
            throw new Error(`Error en tabla community_posts: ${postsError.message}`);
        }
        
        console.log('✅ Conexión a tablas de comunidad verificada');
    } catch (error) {
        console.error('⚠️ Error en test de tablas de comunidad:', error);
        throw error;
    }
}

// Función pública para forzar reinicialización
window.reinitializeSupabase = async function() {
    // console.log('🔄 Forzando reinicialización de Supabase...');
    window.supabaseInitialized = false;
    window.supabaseLoading = false;
    window.supabaseRetries = 0;
    window.supabase = null;
    return await initializeSupabaseClient();
};

// IIFE para inicialización automática
(async function() {
    // console.log('🚀 Iniciando configuración de Supabase...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeSupabaseClient, 100);
        });
    } else {
        setTimeout(initializeSupabaseClient, 100);
    }
})();
