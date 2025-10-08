/**
 * Auth Guard - Sistema de protección de rutas
 * Previene acceso no autorizado a páginas protegidas
 */

// Configuración del Auth Guard
const AUTH_GUARD_CONFIG = {
    tokenKey: 'userToken',
    userDataKey: 'userData',
    sessionKey: 'userSession',
    loginPath: '/login/new-auth.html',
    publicPaths: [
        '/src/index.html',
        '/src/login/new-auth.html',
        '/src/login/test-credentials.html',
        '/login/new-auth.html',
        '/login/test-credentials.html',
        '/index.html',
        '/'
    ],
    publicFiles: [
        'index.html',
        'new-auth.html', 
        'test-credentials.html'
    ],
    redirectDelay: 500
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si está autenticado
 */
function isAuthenticated() {
    try {
        // Verificar token en localStorage
        const token = localStorage.getItem(AUTH_GUARD_CONFIG.tokenKey);
        const userData = localStorage.getItem(AUTH_GUARD_CONFIG.userDataKey);
        const session = localStorage.getItem(AUTH_GUARD_CONFIG.sessionKey);
        
        // Verificar si hay datos de usuario en formato legacy que necesiten sincronización
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser && (!token || !userData || !session)) {
            // console.log('🔄 Detectados datos desincronizados, intentando corrección automática...');
            try {
                const user = JSON.parse(currentUser);
                
                if (!userData) {
                    localStorage.setItem('userData', currentUser);
                    // console.log('✅ userData sincronizado');
                }
                
                if (!token) {
                    const mockToken = btoa(JSON.stringify({
                        exp: Math.floor(Date.now() / 1000) + 3600,
                        user: user.email || user.username,
                        role: user.cargo_rol || 'user',
                        id: user.id
                    }));
                    localStorage.setItem('userToken', mockToken);
                    // console.log('✅ userToken creado');
                }
                
                if (!session) {
                    const sessionData = {
                        sessionId: 'session-' + Date.now(),
                        created: new Date().toISOString(),
                        userId: user.id || user.username || user.email
                    };
                    localStorage.setItem('userSession', JSON.stringify(sessionData));
                    // console.log('✅ userSession creado');
                }
                
                // Re-verificar después de la sincronización
                return isAuthenticated();
                
            } catch (e) {
                // console.warn('Error en sincronización automática:', e);
            }
        }
        
        // console.log('🔍 Verificando autenticación:', {
        //     hasToken: !!localStorage.getItem(AUTH_GUARD_CONFIG.tokenKey),
        //     hasUserData: !!localStorage.getItem(AUTH_GUARD_CONFIG.userDataKey),
        //     hasSession: !!localStorage.getItem(AUTH_GUARD_CONFIG.sessionKey),
        //     tokenKey: AUTH_GUARD_CONFIG.tokenKey,
        //     userDataKey: AUTH_GUARD_CONFIG.userDataKey,
        //     sessionKey: AUTH_GUARD_CONFIG.sessionKey
        // });
        
        const finalToken = localStorage.getItem(AUTH_GUARD_CONFIG.tokenKey);
        const finalUserData = localStorage.getItem(AUTH_GUARD_CONFIG.userDataKey);
        const finalSession = localStorage.getItem(AUTH_GUARD_CONFIG.sessionKey);
        
        if (!finalToken) {
            // console.log('❌ No hay token');
            return false;
        }

        if (!finalUserData) {
            // console.log('❌ No hay datos de usuario');
            return false;
        }

        if (!finalSession) {
            // console.log('❌ No hay sesión activa');
            return false;
        }

        // Verificar que el token no esté expirado (básico)
        try {
            // Intentar parsear como JWT estándar
            if (token.includes('.')) {
                const parsedToken = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                if (parsedToken.exp && parsedToken.exp < currentTime) {
                    // console.log('🔒 Token expirado, limpiando datos...');
                    clearAuthData();
                    return false;
                }
            } else {
                // Token en formato base64 simple (desarrollo)
                const parsedToken = JSON.parse(atob(token));
                const currentTime = Math.floor(Date.now() / 1000);
                if (parsedToken.exp && parsedToken.exp < currentTime) {
                    // console.log('🔒 Token de desarrollo expirado, limpiando datos...');
                    clearAuthData();
                    return false;
                }
            }
        } catch (e) {
            // Si no se puede parsear el token, considerarlo inválido
            // console.warn('🔒 Token inválido:', e.message);
            clearAuthData();
            return false;
        }

        return true;
    } catch (error) {
        // console.warn('Error checking authentication:', error);
        clearAuthData();
        return false;
    }
}

/**
 * Limpia todos los datos de autenticación
 */
function clearAuthData() {
    try {
        localStorage.removeItem(AUTH_GUARD_CONFIG.tokenKey);
        localStorage.removeItem(AUTH_GUARD_CONFIG.userDataKey);
        localStorage.removeItem(AUTH_GUARD_CONFIG.sessionKey);
        sessionStorage.clear();
    } catch (error) {
        // console.warn('Error clearing auth data:', error);
    }
}

/**
 * Verifica si la ruta actual es pública
 * @returns {boolean} True si es una ruta pública
 */
function isPublicRoute() {
    const currentPath = window.location.pathname;
    const currentFile = window.location.pathname.split('/').pop();
    
    // console.log('🔍 Verificando ruta:', { currentPath, currentFile });
    
    // Verificar rutas exactas
    if (AUTH_GUARD_CONFIG.publicPaths.includes(currentPath)) {
        return true;
    }
    
    // Verificar archivos específicos
    if (AUTH_GUARD_CONFIG.publicFiles.includes(currentFile)) {
        return true;
    }
    
    // Si está en la raíz, permitir acceso
    if (currentPath === '/' || currentPath === '/index.html' || currentPath === '') {
        return true;
    }
    
    // Verificar si está en la carpeta de login (cualquier nivel)
    if (currentPath.includes('/login/') || currentPath.includes('login.html') || currentPath.includes('new-auth.html')) {
        return true;
    }
    
    // Verificar si está en src/login/ (desarrollo)
    if (currentPath.includes('/src/login/')) {
        return true;
    }
    
    return false;
}

/**
 * Redirige al usuario a la página de login
 */
function redirectToLogin() {
    try {
        // Mostrar mensaje de advertencia
        showAuthWarning();
        
        // Limpiar datos de autenticación
        clearAuthData();
        
        // Redirigir después del delay
        setTimeout(() => {
            const baseUrl = window.location.origin;
            
            // Detectar estructura del sitio automáticamente
            let loginUrl;
            if (window.location.pathname.includes('/src/')) {
                // Estructura de desarrollo (con /src/)
                loginUrl = `${baseUrl}/src/login/new-auth.html`;
            } else {
                // Estructura de producción (sin /src/)
                loginUrl = `${baseUrl}/login/new-auth.html`;
            }
            
            // console.log('🔄 Redirigiendo a:', loginUrl);
            window.location.href = loginUrl;
        }, AUTH_GUARD_CONFIG.redirectDelay);
        
    } catch (error) {
        // console.error('Error redirecting to login:', error);
        // Fallback directo - intentar primero producción, luego desarrollo
        try {
            window.location.href = '/index.html';
        } catch (e) {
            window.location.href = '/src/index.html';
        }
    }
}

/**
 * Muestra un mensaje de advertencia de autenticación
 */
function showAuthWarning() {
    // Crear modal de advertencia si no existe
    if (!document.getElementById('auth-warning-modal')) {
        const modal = document.createElement('div');
        modal.id = 'auth-warning-modal';
        modal.innerHTML = `
            <div class="auth-modal-overlay">
                <div class="auth-modal-content">
                    <div class="auth-modal-icon">🔒</div>
                    <h3>Acceso Restringido</h3>
                    <p>Debes iniciar sesión para acceder a esta página.</p>
                    <div class="auth-modal-spinner"></div>
                    <p class="auth-modal-redirect">Redirigiendo al login...</p>
                </div>
            </div>
        `;
        
        // Agregar estilos inline para garantizar visualización
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Inter', Arial, sans-serif;
        `;
        
        const overlay = modal.querySelector('.auth-modal-overlay');
        overlay.style.cssText = `
            background: rgba(10, 10, 10, 0.95);
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const content = modal.querySelector('.auth-modal-content');
        content.style.cssText = `
            background: #ffffff;
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            max-width: 400px;
            margin: 1rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
        
        const icon = modal.querySelector('.auth-modal-icon');
        icon.style.cssText = `
            font-size: 3rem;
            margin-bottom: 1rem;
        `;
        
        const spinner = modal.querySelector('.auth-modal-spinner');
        spinner.style.cssText = `
            width: 24px;
            height: 24px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #44E5FF;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 1rem auto;
        `;
        
        // Agregar animación de spinner
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
    }
}

/**
 * Inicializa la protección de autenticación
 */
function initAuthGuard() {
    const currentPath = window.location.pathname;
    // console.log('🔒 AuthGuard iniciado para:', currentPath);
    
    // Verificar si estamos en una ruta pública
    if (isPublicRoute()) {
        // console.log('✅ Ruta pública detectada - Acceso permitido');
        return; // Permitir acceso a rutas públicas
    }
    
    // console.log('🔐 Ruta protegida detectada - Verificando autenticación...');
    
    // Verificar autenticación para rutas protegidas
    if (!isAuthenticated()) {
        // console.log('❌ Usuario NO autenticado - Redirigiendo al login');
        redirectToLogin();
        return;
    }
    
    // Si llegamos aquí, el usuario está autenticado
    const user = getCurrentUser();
    // console.log('✅ Usuario autenticado - Acceso permitido', {
    //     user: user?.username || user?.email,
    //     role: user?.cargo_rol || user?.role
    // });
}

/**
 * Valida token con el servidor (opcional, para mayor seguridad)
 * @param {string} token - Token a validar
 * @returns {Promise<boolean>} True si el token es válido
 */
async function validateTokenWithServer(token) {
    try {
        const response = await fetch('/api/validate-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        return response.ok;
    } catch (error) {
        // console.warn('Error validating token with server:', error);
        return false; // En caso de error de red, asumir token inválido
    }
}

/**
 * Obtiene información del usuario autenticado
 * @returns {Object|null} Datos del usuario o null
 */
function getCurrentUser() {
    try {
        if (!isAuthenticated()) return null;
        
        const userData = localStorage.getItem(AUTH_GUARD_CONFIG.userDataKey);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        // console.warn('Error getting current user:', error);
        return null;
    }
}

/**
 * Cierra sesión del usuario
 */
function logout() {
    clearAuthData();
    redirectToLogin();
}

// Exportar funciones para uso global
window.AuthGuard = {
    init: initAuthGuard,
    isAuthenticated,
    getCurrentUser,
    logout,
    redirectToLogin,
    clearAuthData
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initAuthGuard);

// También ejecutar inmediatamente para páginas que ya están cargadas
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthGuard);
} else {
    initAuthGuard();
}
