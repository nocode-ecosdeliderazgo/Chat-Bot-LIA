/**
 * Auth Guard - Sistema de protección de rutas
 * Previene acceso no autorizado a páginas protegidas
 */

// Configuración del Auth Guard
const AUTH_GUARD_CONFIG = {
    tokenKey: 'userToken',
    userDataKey: 'userData',
    sessionKey: 'userSession',
    loginPath: '/src/login/new-auth.html',
    publicPaths: [
        '/src/index.html',
        '/src/login/new-auth.html',
        '/src/login/test-credentials.html',
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
        if (!token) return false;

        // Verificar datos de usuario
        const userData = localStorage.getItem(AUTH_GUARD_CONFIG.userDataKey);
        if (!userData) return false;

        // Verificar sesión activa
        const session = localStorage.getItem(AUTH_GUARD_CONFIG.sessionKey);
        if (!session) return false;

        // Verificar que el token no esté expirado (básico)
        try {
            const parsedToken = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            if (parsedToken.exp && parsedToken.exp < currentTime) {
                clearAuthData();
                return false;
            }
        } catch (e) {
            // Si no se puede parsear el token, considerarlo inválido
            clearAuthData();
            return false;
        }

        return true;
    } catch (error) {
        console.warn('Error checking authentication:', error);
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
        console.warn('Error clearing auth data:', error);
    }
}

/**
 * Verifica si la ruta actual es pública
 * @returns {boolean} True si es una ruta pública
 */
function isPublicRoute() {
    const currentPath = window.location.pathname;
    const currentFile = window.location.pathname.split('/').pop();
    
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
    
    // Verificar si está en la carpeta de login
    if (currentPath.includes('/login/')) {
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
            const loginUrl = `${baseUrl}/src/login/new-auth.html`;
            window.location.href = loginUrl;
        }, AUTH_GUARD_CONFIG.redirectDelay);
        
    } catch (error) {
        console.error('Error redirecting to login:', error);
        // Fallback directo
        window.location.href = '/src/login/new-auth.html';
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
    // Verificar si estamos en una ruta pública
    if (isPublicRoute()) {
        return; // Permitir acceso a rutas públicas
    }
    
    // Verificar autenticación para rutas protegidas
    if (!isAuthenticated()) {
        redirectToLogin();
        return;
    }
    
    // Si llegamos aquí, el usuario está autenticado
    console.log('✅ Usuario autenticado - Acceso permitido');
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
        console.warn('Error validating token with server:', error);
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
        console.warn('Error getting current user:', error);
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