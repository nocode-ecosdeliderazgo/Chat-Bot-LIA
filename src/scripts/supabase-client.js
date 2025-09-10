// Inicialización robusta del cliente de Supabase para uso en el navegador
// Implementa verificaciones, reintentos y fallbacks según PROMPT_CLAUDE.md

// Variables globales para control de estado
window.supabaseInitialized = false;
window.supabaseLoading = false;
window.supabaseRetries = 0;
const MAX_RETRIES = 3;

// Función de inicialización robusta
async function initializeSupabaseClient() {
    console.log('🔧 Inicializando cliente de Supabase...');
    
    // Evitar múltiples inicializaciones simultáneas
    if (window.supabaseLoading) {
        console.log('⏳ Supabase ya se está inicializando...');
        return window.supabase;
    }
    
    if (window.supabaseInitialized && window.supabase) {
        console.log('✅ Supabase ya está inicializado');
        return window.supabase;
    }
    
    window.supabaseLoading = true;
    
    try {
        // Obtener credenciales desde múltiples fuentes
        const credentials = await getSupabaseCredentials();
        
        if (!credentials.url || !credentials.key) {
            console.warn('⚠️ Credenciales de Supabase no disponibles, obteniendo desde API...');
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
            console.log('📚 Cargando librería de Supabase...');
            
            // Intentar cargar desde CDN
            await loadSupabaseLibrary();
            
            // Verificar nuevamente
            if (typeof supabase === 'undefined') {
                throw new Error('No se pudo cargar la librería de Supabase');
            }
        }
        
        // Verificar si createClient existe
        if (typeof supabase.createClient !== 'function') {
            console.error('❌ supabase.createClient no es una función');
            throw new Error('supabase.createClient no está disponible');
        }
        
        // Crear cliente con configuración optimizada
        const client = supabase.createClient(credentials.url, credentials.key, {
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
        
        // Exponer globalmente
        window.supabase = client;
        window.supabase.supabaseUrl = credentials.url;
        window.supabase.supabaseKey = credentials.key;
        window.supabaseInitialized = true;
        window.supabaseRetries = 0;
        
        console.log('✅ Cliente de Supabase inicializado correctamente');
        
        // Disparar evento para notificar a otros componentes
        window.dispatchEvent(new CustomEvent('supabaseReady', { detail: client }));
        
        return client;
        
    } catch (error) {
        console.error('❌ Error inicializando cliente de Supabase:', error);
        
        // Implementar retry con backoff
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
            window.supabase = null;
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
        console.log('📡 Obteniendo credenciales desde /api/supabase-config...');
        
        const response = await fetch('/api/supabase-config');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        
        if (config.success && config.url && config.anon_key) {
            console.log('✅ Credenciales obtenidas desde API');
            
            // Guardar en variables globales para uso futuro
            window.SUPABASE_URL = config.url;
            window.SUPABASE_ANON_KEY = config.anon_key;
            
            return { url: config.url, key: config.anon_key };
        } else {
            throw new Error('Respuesta de API inválida');
        }
    } catch (error) {
        console.error('❌ Error obteniendo credenciales desde API:', error);
        return { url: null, key: null };
    }
}

// Función para cargar la librería de Supabase
async function loadSupabaseLibrary() {
    try {
        // Verificar si ya está disponible globalmente
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            return;
        }
        
        // Intentar importación dinámica ES modules
        try {
            const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
            window.supabase = { createClient };
            console.log('✅ Librería cargada vía ES modules');
            return;
        } catch (esError) {
            console.warn('⚠️ Error cargando vía ES modules:', esError);
        }
        
        // Fallback: cargar desde CDN usando script tag
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                console.log('✅ Librería cargada vía CDN script tag');
                resolve();
            };
            script.onerror = (error) => {
                console.error('❌ Error cargando desde CDN:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
        
    } catch (error) {
        console.error('❌ Error cargando librería de Supabase:', error);
        throw error;
    }
}

// Función para probar la conexión de Supabase
async function testSupabaseConnection(client) {
    try {
        console.log('🔍 Probando conexión de Supabase...');
        
        // Test básico de conexión
        const { data, error } = await client
            .from('community_questions')
            .select('count', { count: 'exact', head: true });
            
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        console.log('✅ Conexión de Supabase verificada');
    } catch (error) {
        console.warn('⚠️ Advertencia en test de conexión:', error);
        // No fallar completamente por problemas de conexión
    }
}

// Función pública para forzar reinicialización
window.reinitializeSupabase = async function() {
    console.log('🔄 Forzando reinicialización de Supabase...');
    window.supabaseInitialized = false;
    window.supabaseLoading = false;
    window.supabaseRetries = 0;
    window.supabase = null;
    return await initializeSupabaseClient();
};

// IIFE para inicialización automática
(async function() {
    console.log('🚀 Iniciando configuración de Supabase...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeSupabaseClient, 100);
        });
    } else {
        setTimeout(initializeSupabaseClient, 100);
    }
})();


