// =====================================================
// NETLIFY COMPATIBILITY FIXES
// Maneja problemas específicos de despliegue en Netlify
// =====================================================

console.log('🌐 Inicializando Netlify Compatibility Layer...');

// Detectar entorno de Netlify
const isNetlify = window.location.hostname.includes('netlify.app') || 
                 window.location.hostname.includes('netlify.com') ||
                 document.querySelector('meta[name="generator"][content*="Netlify"]');

if (isNetlify) {
    console.log('🌐 Entorno Netlify detectado - aplicando correcciones...');
}

// Función para cargar scripts con fallback
window.loadScriptWithFallback = function(src, callback, errorCallback) {
    console.log(`📦 Intentando cargar script: ${src}`);
    
    const script = document.createElement('script');
    script.src = src;
    
    script.onload = () => {
        console.log(`✅ Script cargado exitosamente: ${src}`);
        if (callback) callback();
    };
    
    script.onerror = () => {
        console.warn(`⚠️ Error cargando script: ${src}`);
        
        // Intentar rutas alternativas para Netlify
        const alternatePaths = [
            src.replace('../', './'),  // Ruta relativa directa
            src.replace('../scripts/', './scripts/'), // Ruta con scripts
            `/src${src.replace('../', '/')}`  // Ruta absoluta
        ];
        
        let attemptIndex = 0;
        
        function tryAlternate() {
            if (attemptIndex >= alternatePaths.length) {
                console.error(`❌ Todas las rutas fallaron para: ${src}`);
                if (errorCallback) errorCallback();
                return;
            }
            
            const altSrc = alternatePaths[attemptIndex++];
            console.log(`🔄 Intentando ruta alternativa: ${altSrc}`);
            
            const altScript = document.createElement('script');
            altScript.src = altSrc;
            
            altScript.onload = () => {
                console.log(`✅ Script cargado con ruta alternativa: ${altSrc}`);
                if (callback) callback();
            };
            
            altScript.onerror = tryAlternate;
            document.head.appendChild(altScript);
        }
        
        tryAlternate();
    };
    
    document.head.appendChild(script);
};

// Verificador de componentes
window.verifyComponents = function() {
    const components = {
        'CourseProgressManagerV2': window.CourseProgressManagerV2,
        'YouTubeProgressTracker': window.YouTubeProgressTracker,
        'ChatOnlineV2': window.ChatOnlineV2
    };
    
    const results = {};
    let allLoaded = true;
    
    for (const [name, component] of Object.entries(components)) {
        const isLoaded = typeof component !== 'undefined';
        results[name] = isLoaded;
        if (!isLoaded) allLoaded = false;
        
        console.log(`${isLoaded ? '✅' : '❌'} ${name}: ${typeof component}`);
    }
    
    return { results, allLoaded };
};

// Monitor de carga de componentes
window.waitForComponents = function(components, maxAttempts = 10, interval = 500) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const checkComponents = () => {
            attempts++;
            console.log(`🔍 Verificación ${attempts}/${maxAttempts} de componentes...`);
            
            const missing = components.filter(name => typeof window[name] === 'undefined');
            
            if (missing.length === 0) {
                console.log('✅ Todos los componentes están disponibles');
                resolve(true);
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.warn(`⚠️ Timeout: Componentes faltantes: ${missing.join(', ')}`);
                resolve(false);
                return;
            }
            
            console.log(`⏳ Esperando componentes: ${missing.join(', ')}`);
            setTimeout(checkComponents, interval);
        };
        
        checkComponents();
    });
};

// Función de inicialización robusta para Netlify
window.initializeWithNetlifyFallback = async function() {
    console.log('🚀 Inicializando con fallbacks para Netlify...');
    
    // Esperar componentes críticos
    const criticalComponents = ['CourseProgressManagerV2', 'YouTubeProgressTracker'];
    const componentsReady = await window.waitForComponents(criticalComponents, 15, 300);
    
    if (!componentsReady) {
        console.warn('⚠️ Algunos componentes no se cargaron - usando fallbacks');
        
        // Mostrar mensaje al usuario
        const videoContainer = document.querySelector('.main-video-player');
        if (videoContainer && !videoContainer.querySelector('.netlify-warning')) {
            const warning = document.createElement('div');
            warning.className = 'netlify-warning';
            warning.innerHTML = `
                <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; margin: 15px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="font-size: 1.2em; margin-bottom: 10px;">🔄 Optimizando carga...</div>
                    <div style="margin-bottom: 15px;">El sistema de videos se está inicializando. Esto puede tomar unos momentos en la primera carga.</div>
                    <button onclick="location.reload()" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        Recargar página
                    </button>
                </div>
            `;
            videoContainer.appendChild(warning);
        }
    }
    
    return componentsReady;
};

// Función para probar conectividad de API
window.testApiConnectivity = async function() {
    console.log('🔬 Probando conectividad de APIs...');
    
    const testEndpoints = [
        '/api/users/demo-user/progress/550e8400-e29b-41d4-a716-446655440001',
        '/api/courses/550e8400-e29b-41d4-a716-446655440001/full-structure'
    ];
    
    const results = {};
    
    for (const endpoint of testEndpoints) {
        try {
            console.log(`🔍 Probando: ${endpoint}`);
            const response = await fetch(endpoint, { method: 'GET' });
            
            results[endpoint] = {
                status: response.status,
                ok: response.ok,
                contentType: response.headers.get('content-type')
            };
            
            if (!response.ok) {
                const text = await response.text();
                results[endpoint].isHtml = text.includes('<!DOCTYPE') || text.includes('<html');
                results[endpoint].preview = text.substring(0, 100) + '...';
            }
            
            console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status}`);
            
        } catch (error) {
            results[endpoint] = {
                error: error.message,
                status: 'network_error'
            };
            console.error(`❌ Error probando ${endpoint}:`, error.message);
        }
    }
    
    return results;
};

// Auto-ejecutar prueba en entorno de desarrollo o cuando se detectan problemas
if (window.location.hostname.includes('netlify') || window.location.hostname === 'localhost') {
    setTimeout(() => {
        window.testApiConnectivity().then(results => {
            const hasErrors = Object.values(results).some(r => !r.ok || r.error);
            if (hasErrors) {
                console.warn('⚠️ Detectados problemas de conectividad de API:', results);
            } else {
                console.log('✅ Todas las APIs responden correctamente');
            }
        });
    }, 1000);
}

console.log('✅ Netlify Compatibility Layer inicializado');