// src/login/google-auth.js - Manejo de autenticación con Google OAuth
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const devLog = (...args) => {
    if (isDev) {
        console.log('[GOOGLE AUTH]', ...args);
    }
};

// Configuración de Google OAuth
let googleInitialized = false;
let googleClient = null;

// Función para obtener la configuración de Google OAuth
function getGoogleConfig() {
    // En desarrollo, usar client ID de desarrollo
    // En producción, esto debería venir de variables de entorno
    const config = {
        client_id: '657950828045-aol41jbq5p1lj6eqlu9a4c04m7bv8sqn.apps.googleusercontent.com', // Placeholder - debe ser configurado
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
    };
    
    devLog('Google config:', { client_id: config.client_id ? config.client_id.substring(0, 20) + '...' : 'no configurado' });
    return config;
}

// Inicializar Google OAuth cuando la página esté lista
function initializeGoogleAuth() {
    if (typeof google === 'undefined') {
        devLog('Google SDK no está cargado, reintentando...');
        setTimeout(initializeGoogleAuth, 1000);
        return;
    }

    if (googleInitialized) {
        devLog('Google Auth ya está inicializado');
        return;
    }

    try {
        const config = getGoogleConfig();
        
        // Inicializar Google Identity Services
        google.accounts.id.initialize(config);
        
        // Configurar los botones personalizados
        setupGoogleButtons();
        
        googleInitialized = true;
        devLog('Google Auth inicializado exitosamente');
        
    } catch (error) {
        console.error('Error inicializando Google Auth:', error);
    }
}

// Configurar los botones de Google
function setupGoogleButtons() {
    const loginBtn = document.getElementById('googleLoginBtn');
    const registerBtn = document.getElementById('googleRegisterBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => handleGoogleSignIn('login'));
        devLog('Botón de Google login configurado');
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => handleGoogleSignIn('register'));
        devLog('Botón de Google registro configurado');
    }
}

// Manejar el clic en el botón de Google
function handleGoogleSignIn(mode = 'login') {
    devLog('Iniciando Google Sign-In, modo:', mode);
    
    if (!googleInitialized) {
        showNotification('Inicializando Google Auth...', 'info');
        initializeGoogleAuth();
        return;
    }

    try {
        // Usar el popup para la autenticación
        google.accounts.id.prompt((notification) => {
            devLog('Google prompt notification:', notification);
            if (notification.isNotDisplayed()) {
                // Si no se puede mostrar el prompt, usar el método alternativo
                devLog('Prompt no mostrado, intentando método alternativo...');
                fallbackGoogleAuth(mode);
            }
        });
        
    } catch (error) {
        console.error('Error en Google Sign-In:', error);
        showNotification('Error conectando con Google', 'error');
    }
}

// Método alternativo de autenticación
function fallbackGoogleAuth(mode) {
    // Si el prompt no funciona, intentar con OAuth2 directo
    const config = getGoogleConfig();
    const redirectUri = window.location.origin + window.location.pathname;
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `response_type=code&` +
        `client_id=${config.client_id}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=openid email profile&` +
        `state=${mode}&` +
        `access_type=offline&` +
        `prompt=select_account`;
    
    devLog('Redirigiendo a Google OAuth:', googleAuthUrl);
    window.location.href = googleAuthUrl;
}

// Manejar el callback de Google
async function handleGoogleCallback(response) {
    devLog('Google callback recibido:', { credential: response.credential ? 'presente' : 'ausente' });
    
    if (!response.credential) {
        showNotification('Error: No se recibió credencial de Google', 'error');
        return;
    }

    try {
        // Mostrar loading
        setGoogleButtonLoading(true);
        showNotification('Procesando autenticación con Google...', 'info');

        // Enviar el token a nuestro backend
        const result = await fetch('/.netlify/functions/google-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idToken: response.credential
            })
        });

        devLog('Respuesta del backend:', { status: result.status, ok: result.ok });

        if (!result.ok) {
            const errorData = await result.json();
            throw new Error(errorData.error || 'Error en autenticación con Google');
        }

        const data = await result.json();
        devLog('Login exitoso:', { 
            userId: data.user?.id, 
            email: data.user?.email, 
            isNewUser: data.user?.isNewUser 
        });

        // Guardar los datos del usuario
        if (data.token) {
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('authToken', data.token);
        }
        
        if (data.user) {
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('currentUser', JSON.stringify(data.user));
        }

        // Asegurar sincronización de datos
        if (typeof ensureAuthDataSync === 'function') {
            await ensureAuthDataSync();
        }

        // Mostrar mensaje de éxito
        const message = data.user?.isNewUser ? 
            '¡Cuenta creada con Google exitosamente!' : 
            '¡Inicio de sesión con Google exitoso!';
        showNotification(message, 'success');

        // Determinar página de destino
        let targetPage = '../cursos.html'; // Fallback por defecto
        
        if (typeof getRedirectPageByTypeRol === 'function') {
            targetPage = getRedirectPageByTypeRol(data.user);
        }

        devLog('Redirigiendo a:', targetPage);

        // Redirigir después de un breve delay
        setTimeout(() => {
            window.location.href = targetPage;
        }, 1500);

    } catch (error) {
        console.error('Error procesando Google login:', error);
        showNotification(error.message || 'Error en autenticación con Google', 'error');
    } finally {
        setGoogleButtonLoading(false);
    }
}

// Manejar estados de loading de los botones de Google
function setGoogleButtonLoading(loading) {
    const buttons = ['googleLoginBtn', 'googleRegisterBtn'];
    
    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = loading;
            const span = button.querySelector('span');
            if (span) {
                span.textContent = loading ? 'Procesando...' : 
                    (buttonId === 'googleLoginBtn' ? 'Continuar con Google' : 'Registrarse with Google');
            }
        }
    });
}

// Manejar parámetros de URL (para OAuth redirect callback)
function handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
        devLog('Error en OAuth redirect:', error);
        showNotification('Error en autenticación con Google: ' + error, 'error');
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }

    if (code && state) {
        devLog('OAuth code recibido:', { code: code.substring(0, 20) + '...', state });
        
        // Procesar el código de autorización
        processOAuthCode(code, state);
        
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Procesar código de OAuth
async function processOAuthCode(code, state) {
    try {
        setGoogleButtonLoading(true);
        showNotification('Completando autenticación con Google...', 'info');

        // Aquí normalmente enviarías el código al backend para intercambiarlo por tokens
        // Por ahora, mostrar mensaje de que este flujo necesita implementación completa
        showNotification('OAuth code recibido. Implementación completa pendiente.', 'warning');
        
        devLog('OAuth code processing - implementation needed for production');

    } catch (error) {
        console.error('Error procesando OAuth code:', error);
        showNotification('Error procesando autenticación', 'error');
    } finally {
        setGoogleButtonLoading(false);
    }
}

// Función auxiliar para mostrar notificaciones (fallback si no existe)
function showNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback simple
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    devLog('DOM cargado, inicializando Google Auth...');
    
    // Verificar parámetros de URL primero
    handleURLParams();
    
    // Inicializar Google Auth con un pequeño delay para asegurar que el SDK esté cargado
    setTimeout(initializeGoogleAuth, 500);
});

// Exponer funciones globalmente para uso en otros scripts
window.initializeGoogleAuth = initializeGoogleAuth;
window.handleGoogleCallback = handleGoogleCallback;
window.handleGoogleSignIn = handleGoogleSignIn;