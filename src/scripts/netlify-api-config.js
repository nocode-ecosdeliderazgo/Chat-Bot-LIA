// =====================================================
// NETLIFY API CONFIGURATION
// Configuración automática de endpoints para Netlify Functions
// =====================================================

/**
 * Detecta el entorno y configura las URLs de API correctas
 */
class NetlifyApiConfig {
    constructor() {
        this.isNetlify = this.detectNetlifyEnvironment();
        this.apiBasePath = this.getApiBasePath();
        this.init();
    }

    /**
     * Detecta si estamos en un entorno de Netlify
     */
    detectNetlifyEnvironment() {
        // Verificar si estamos en Netlify
        const hostname = window.location.hostname;
        const isNetlifyDomain = hostname.includes('.netlify.app') || 
                               hostname.includes('.netlify.com') ||
                               hostname.includes('netlify');
        
        // También verificar variables de entorno específicas de Netlify
        const hasNetlifyEnv = window.location.pathname.includes('/.netlify/') ||
                             document.querySelector('meta[name="netlify"]');

        return isNetlifyDomain || hasNetlifyEnv || this.isProduction();
    }

    /**
     * Detecta si estamos en producción (no localhost)
     */
    isProduction() {
        const hostname = window.location.hostname;
        return hostname !== 'localhost' && 
               hostname !== '127.0.0.1' && 
               !hostname.includes('192.168.') &&
               !hostname.includes('10.0.') &&
               hostname !== 'local.test';
    }

    /**
     * Obtiene la ruta base para las APIs
     */
    getApiBasePath() {
        if (this.isNetlify || this.isProduction()) {
            return '/.netlify/functions';
        } else {
            // Desarrollo local
            const port = window.location.port;
            if (port === '8888') {
                // Netlify Dev
                return '/.netlify/functions';
            } else {
                // Servidor local tradicional
                return '/api';
            }
        }
    }

    /**
     * Inicializa la configuración global
     */
    init() {
        // Configurar variables globales para uso en otros scripts
        window.API_BASE_PATH = this.apiBasePath;
        window.IS_NETLIFY = this.isNetlify;
        window.IS_PRODUCTION = this.isProduction();

        console.log('🔧 Netlify API Config inicializada:', {
            isNetlify: this.isNetlify,
            isProduction: this.isProduction(),
            apiBasePath: this.apiBasePath,
            hostname: window.location.hostname
        });

        // Exponer función helper global
        window.getApiUrl = this.getApiUrl.bind(this);
    }

    /**
     * Obtiene la URL completa para un endpoint específico
     * @param {string} endpoint - El nombre del endpoint (sin /api/ ni /.netlify/functions/)
     * @returns {string} - URL completa del endpoint
     */
    getApiUrl(endpoint) {
        // Limpiar el endpoint de prefijos
        const cleanEndpoint = endpoint
            .replace(/^\/api\//, '')
            .replace(/^\/\.netlify\/functions\//, '')
            .replace(/^api\//, '')
            .replace(/^functions\//, '');

        return `${this.apiBasePath}/${cleanEndpoint}`;
    }

    /**
     * Mapeo de endpoints legacy a nuevos nombres
     */
    static ENDPOINT_MAPPING = {
        'profile': 'get-profile',
        'sync-user': 'sync-user',
        'supabase-config': 'supabase-config',
        'update-profile': 'update-profile',
        'save-responses': 'save-responses',
        'profile-upload': 'profile-upload'
    };

    /**
     * Obtiene la URL de un endpoint con mapeo automático
     * @param {string} legacyEndpoint - Nombre del endpoint legacy
     * @returns {string} - URL completa del endpoint mapeado
     */
    getMappedApiUrl(legacyEndpoint) {
        const mapped = NetlifyApiConfig.ENDPOINT_MAPPING[legacyEndpoint] || legacyEndpoint;
        return this.getApiUrl(mapped);
    }
}

// Inicializar automáticamente cuando se carga el script
const netlifyApiConfig = new NetlifyApiConfig();

// Exportar para uso en otros módulos
window.NetlifyApiConfig = NetlifyApiConfig;
window.netlifyApiConfig = netlifyApiConfig;

// Función helper global para obtener URLs de API
window.apiUrl = (endpoint) => netlifyApiConfig.getMappedApiUrl(endpoint);

console.log('✅ Netlify API Configuration cargada correctamente');
