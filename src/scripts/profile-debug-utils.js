// =====================================================
// PROFILE DEBUG UTILITIES
// Herramientas de diagnóstico para problemas de perfil
// =====================================================

/**
 * Utilidades de debug para diagnosticar problemas de carga de perfil
 */
class ProfileDebugUtils {
    static async runDiagnostics() {
        console.log('🔍 ===== DIAGNÓSTICO DE PERFIL - INICIO =====');
        
        // 1. Verificar entorno
        await this.checkEnvironment();
        
        // 2. Verificar datos de usuario
        await this.checkUserData();
        
        // 3. Verificar APIs
        await this.checkApiEndpoints();
        
        // 4. Verificar Supabase
        await this.checkSupabaseConnection();
        
        // 5. Verificar base de datos
        await this.checkDatabaseConnection();
        
        console.log('🔍 ===== DIAGNÓSTICO DE PERFIL - FIN =====');
    }

    static checkEnvironment() {
        console.log('🌍 === VERIFICACIÓN DE ENTORNO ===');
        console.log('URL actual:', window.location.href);
        console.log('Hostname:', window.location.hostname);
        console.log('Puerto:', window.location.port);
        console.log('Protocolo:', window.location.protocol);
        console.log('Es Netlify:', window.IS_NETLIFY || 'No detectado');
        console.log('Es Producción:', window.IS_PRODUCTION || 'No detectado');
        console.log('API Base Path:', window.API_BASE_PATH || 'No configurado');
        console.log('');
    }

    static checkUserData() {
        console.log('👤 === VERIFICACIÓN DE DATOS DE USUARIO ===');
        
        // Verificar localStorage
        const currentUser = localStorage.getItem('currentUser');
        const userData = localStorage.getItem('userData');
        const userToken = localStorage.getItem('userToken');
        const userSession = localStorage.getItem('userSession');
        
        console.log('currentUser en localStorage:', currentUser ? '✅ Presente' : '❌ Ausente');
        if (currentUser) {
            try {
                const parsed = JSON.parse(currentUser);
                console.log('  - ID:', parsed.id || 'No disponible');
                console.log('  - Username:', parsed.username || 'No disponible');
                console.log('  - Email:', parsed.email || 'No disponible');
                console.log('  - Nombre:', parsed.first_name || 'No disponible');
                console.log('  - Apellido:', parsed.last_name || 'No disponible');
            } catch (e) {
                console.error('  - Error parseando currentUser:', e);
            }
        }
        
        console.log('userData en localStorage:', userData ? '✅ Presente' : '❌ Ausente');
        console.log('userToken en localStorage:', userToken ? '✅ Presente' : '❌ Ausente');
        console.log('userSession en localStorage:', userSession ? '✅ Presente' : '❌ Ausente');
        console.log('');
    }

    static async checkApiEndpoints() {
        console.log('🌐 === VERIFICACIÓN DE ENDPOINTS DE API ===');
        
        const endpoints = [
            'get-profile',
            'supabase-config',
            'sync-user',
            'update-profile'
        ];

        for (const endpoint of endpoints) {
            try {
                const url = window.apiUrl ? window.apiUrl(endpoint) : `/.netlify/functions/${endpoint}`;
                console.log(`Probando ${endpoint}: ${url}`);
                
                const response = await fetch(url, {
                    method: 'OPTIONS', // Usar OPTIONS para no interferir con datos
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    console.log(`  ✅ ${endpoint}: Accesible (${response.status})`);
                } else {
                    console.log(`  ⚠️ ${endpoint}: ${response.status} - ${response.statusText}`);
                }
            } catch (error) {
                console.log(`  ❌ ${endpoint}: Error - ${error.message}`);
            }
        }
        console.log('');
    }

    static checkSupabaseConnection() {
        console.log('🔗 === VERIFICACIÓN DE SUPABASE ===');
        console.log('window.supabase:', window.supabase ? '✅ Presente' : '❌ Ausente');
        console.log('window.supabaseInitialized:', window.supabaseInitialized || false);
        console.log('window.supabaseLoading:', window.supabaseLoading || false);
        
        // Verificar credenciales
        const supabaseUrl = localStorage.getItem('supabaseUrl');
        const supabaseKey = localStorage.getItem('supabaseAnonKey');
        console.log('Supabase URL en localStorage:', supabaseUrl ? '✅ Presente' : '❌ Ausente');
        console.log('Supabase Key en localStorage:', supabaseKey ? '✅ Presente' : '❌ Ausente');
        
        if (supabaseUrl) {
            console.log('  - URL válida:', supabaseUrl.includes('supabase.co') ? '✅ Sí' : '⚠️ Sospechosa');
        }
        
        console.log('');
    }

    static async checkDatabaseConnection() {
        console.log('🗄️ === VERIFICACIÓN DE CONEXIÓN A BASE DE DATOS ===');
        
        try {
            // Intentar obtener perfil de usuario actual
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                console.log('❌ No hay usuario actual para probar la conexión');
                return;
            }

            const parsed = JSON.parse(currentUser);
            const testParams = [];
            
            if (parsed.id && !String(parsed.id).startsWith('dev-')) {
                testParams.push(`userId=${encodeURIComponent(parsed.id)}`);
            }
            if (parsed.username) {
                testParams.push(`username=${encodeURIComponent(parsed.username)}`);
            }
            if (parsed.email) {
                testParams.push(`email=${encodeURIComponent(parsed.email)}`);
            }

            if (testParams.length === 0) {
                console.log('❌ No hay parámetros válidos para probar la conexión');
                return;
            }

            const url = window.apiUrl ? window.apiUrl('get-profile') : '/.netlify/functions/get-profile';
            const testUrl = `${url}?${testParams[0]}`;
            
            console.log(`Probando conexión con: ${testUrl}`);
            
            const response = await fetch(testUrl);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Conexión a base de datos exitosa');
                console.log('  - Usuario encontrado:', data.user ? '✅ Sí' : '❌ No');
                if (data.user) {
                    console.log('  - Campos disponibles:', Object.keys(data.user).join(', '));
                    console.log('  - first_name:', data.user.first_name || 'No disponible');
                    console.log('  - last_name:', data.user.last_name || 'No disponible');
                    console.log('  - email:', data.user.email || 'No disponible');
                    console.log('  - phone:', data.user.phone || 'No disponible');
                    console.log('  - bio:', data.user.bio || 'No disponible');
                }
            } else {
                console.log(`❌ Error en conexión: ${response.status} - ${response.statusText}`);
                const text = await response.text();
                console.log('  - Respuesta:', text.substring(0, 200));
            }
        } catch (error) {
            console.log(`❌ Error probando conexión: ${error.message}`);
        }
        
        console.log('');
    }

    /**
     * Verifica específicamente por qué los campos del formulario están vacíos
     */
    static checkFormFields() {
        console.log('📝 === VERIFICACIÓN DE CAMPOS DEL FORMULARIO ===');
        
        const fields = [
            'firstName', 'lastName', 'username', 'email', 
            'companyRole', 'phone', 'location', 'bio',
            'linkedinUrl', 'githubUrl', 'portfolioUrl'
        ];

        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                console.log(`✅ ${fieldId}:`, {
                    existe: true,
                    valor: element.value || '(vacío)',
                    placeholder: element.placeholder || '(sin placeholder)'
                });
            } else {
                console.log(`❌ ${fieldId}: NO ENCONTRADO en el DOM`);
            }
        });

        // Verificar ProfileManager
        if (window.profileManager) {
            console.log('📊 Estado de ProfileManager:', {
                currentUser: window.profileManager.currentUser ? '✅ Presente' : '❌ Ausente',
                profileData: window.profileManager.profileData ? '✅ Presente' : '❌ Ausente'
            });

            if (window.profileManager.currentUser) {
                console.log('  - currentUser keys:', Object.keys(window.profileManager.currentUser));
            }
            if (window.profileManager.profileData) {
                console.log('  - profileData keys:', Object.keys(window.profileManager.profileData));
            }
        } else {
            console.log('❌ ProfileManager no está disponible');
        }
        
        console.log('');
    }

    /**
     * Función de debug rápido para la consola
     */
    static quickDebug() {
        console.log('🚀 === DEBUG RÁPIDO DE PERFIL ===');
        this.checkUserData();
        this.checkFormFields();
    }
}

// Exponer globalmente para uso en consola
window.ProfileDebugUtils = ProfileDebugUtils;
window.debugProfile = () => ProfileDebugUtils.runDiagnostics();
window.debugProfileQuick = () => ProfileDebugUtils.quickDebug();
window.debugFormFields = () => ProfileDebugUtils.checkFormFields();

console.log('🔧 Profile Debug Utils cargado. Usa debugProfile() en la consola para diagnóstico completo.');
