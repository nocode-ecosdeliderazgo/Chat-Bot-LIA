// Configuración del sistema de login
const API_BASE = (() => {
    try {
        if (window.API_BASE) return window.API_BASE;
        const loc = window.location;
        // Si servimos todo desde Node (puerto 3000) o mismo host, usar relativo
        if (!loc.port || loc.port === '3000') return '';
        // Si el login se sirve desde un host estático (Netlify), apunta al backend local/dev
        return `${loc.protocol}//localhost:3000`;
    } catch (_) { return ''; }
})();

const LOGIN_CONFIG = {
    minUsernameLength: 3,
    minPasswordLength: 6,
    maxAttempts: 3,
    lockoutDuration: 300000, // 5 minutos en milisegundos
    animationDelay: 1000,
    redirectDelay: 1500
};

// Estado del login
const loginState = {
    attempts: 0,
    isLocked: false,
    lockoutEndTime: null,
    isLoading: false
};

// Elementos del DOM
const elements = {
    form: null,
    username: null,
    password: null,
    remember: null,
    submitBtn: null,
    togglePassword: null,
    btnText: null,
    btnLoader: null
};

// Credenciales de prueba
const TEST_CREDENTIALS = [
    { username: 'admin', password: 'admin123' },
    { username: 'usuario', password: '123456' },
    { username: 'test', password: 'test123' }
];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeLogin();
    setupEventListeners();
    checkRememberedUser();
    animateElements();
});

function initializeLogin() {
    // Obtener referencias a elementos
    elements.form = document.getElementById('loginForm');
    elements.username = document.getElementById('username');
    elements.password = document.getElementById('password');
    elements.remember = document.getElementById('remember');
    elements.submitBtn = document.querySelector('.btn');
    elements.togglePassword = document.querySelector('.toggle-password');
    elements.btnText = document.querySelector('.btn-text');
    elements.btnLoader = document.querySelector('.btn-loader');

    // Verificar si el usuario está bloqueado
    const lockoutEndTime = localStorage.getItem('lockoutEndTime');
    if (lockoutEndTime && Date.now() < parseInt(lockoutEndTime)) {
        lockUser(parseInt(lockoutEndTime));
    }
}

function setupEventListeners() {
    // Evento de envío del formulario
    elements.form.addEventListener('submit', handleLogin);

    // Eventos de focus y blur para inputs
    elements.username.addEventListener('focus', handleInputFocus);
    elements.username.addEventListener('blur', handleInputBlur);
    elements.password.addEventListener('focus', handleInputFocus);
    elements.password.addEventListener('blur', handleInputBlur);

    // Validación en tiempo real
    elements.username.addEventListener('input', () => validateUsername());
    elements.password.addEventListener('input', () => validatePassword());

    // Toggle de visibilidad de contraseña
    elements.togglePassword.addEventListener('click', togglePasswordVisibility);

    // Eventos de teclado
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !loginState.isLoading) {
            elements.form.dispatchEvent(new Event('submit'));
        }
    });
    // Registro: abrir modal
    const openRegister = document.getElementById('openRegister');
    const registerModal = document.getElementById('registerModal');
    const cancelRegister = document.getElementById('cancelRegister');
    const registerForm = document.getElementById('registerForm');
    if (openRegister && registerModal && cancelRegister && registerForm) {
        openRegister.addEventListener('click', (e) => { e.preventDefault(); registerModal.classList.remove('hidden'); });
        cancelRegister.addEventListener('click', () => registerModal.classList.add('hidden'));
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const full_name = document.getElementById('reg_fullname')?.value.trim();
    const username = document.getElementById('reg_username')?.value.trim();
    const email = document.getElementById('reg_email')?.value.trim();
    const password = document.getElementById('reg_password')?.value;

    if (!full_name || !username || !password) {
        showError('Completa nombre, usuario y contraseña.');
        return;
    }

    // Intentar registro real si el backend tiene BD; en DEV, cae a local
    try {
        const res = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ full_name, username, email, password })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        showSuccess('Cuenta creada. Inicia sesión.');
        document.getElementById('registerModal')?.classList.add('hidden');
        // Autocompleta usuario en login
        elements.username.value = username;
        elements.password.value = '';
        elements.username.focus();
        return;
    } catch (_) {
        // Modo desarrollo: persistencia local
        try {
            const users = JSON.parse(localStorage.getItem('dev_users') || '[]');
            if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                showError('Ese usuario ya existe (local).');
                return;
            }
            users.push({ full_name, username, email: email || null, password });
            localStorage.setItem('dev_users', JSON.stringify(users));
            showSuccess('Cuenta creada en modo desarrollo. Inicia sesión.');
            document.getElementById('registerModal')?.classList.add('hidden');
            elements.username.value = username;
            elements.password.value = '';
            elements.username.focus();
            return;
        } catch (err) {
            showError('No se pudo registrar.');
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();

    if (loginState.isLoading) {
        return;
    }

    const username = elements.username.value.trim();
    const password = elements.password.value;
    const remember = elements.remember.checked;

    // Validación básica
    if (!validateForm(username, password)) {
        return;
    }

    setLoadingState(true);

    try {
        // Validación de credenciales (intenta backend primero)
        const result = await validateCredentials(username, password);
        const isValid = typeof result === 'boolean' ? result : !!(result && result.success);
        const userInfo = (result && result.user) ? result.user : undefined;

        if (isValid) {
            if (loginState.isLocked) {
                // Si estaba bloqueado pero el servidor validó, desbloquear y continuar
                unlockUser();
            }
            await handleSuccessfulLogin(username, remember, userInfo);
        } else {
            await handleFailedLogin();
        }
    } catch (error) {
        console.error('Error durante el login:', error);
        showError('Error inesperado. Inténtalo de nuevo.');
        setLoadingState(false);
    }
}

async function validateCredentials(username, password) {
    // 0) Intentar validar en backend si está disponible
    try {
        const res = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            try {
                const data = await res.json();
                return { success: true, user: data && data.user ? data.user : undefined };
            } catch (_) {
                return { success: true };
            }
        }
        // si la BD no está configurada o endpoint no disponible, seguimos flujo local
    } catch(_) {}

    // 1) Intentar validar con usuarios locales (si existen)
    try {
        const users = JSON.parse(localStorage.getItem('dev_users') || '[]');
        const found = users.find(u => u.username?.toLowerCase() === username.toLowerCase());
        if (found) return { success: found.password === password };
    } catch(_) {}

    // 2) Fallback a credenciales de prueba
    const ok = TEST_CREDENTIALS.some(cred => 
        cred.username.toLowerCase() === username.toLowerCase() && 
        cred.password === password
    );
    return { success: ok };
}

async function handleSuccessfulLogin(username, remember, userInfo = undefined) {
    // Guardar siempre el usuario en la sesión actual para que el chat pueda leerlo
    try {
        sessionStorage.setItem('loggedUser', username);
    } catch (_) {}

    // Guardar siempre los estados de roles en la sesión (vacío si no vienen)
    try {
        const cargoRol = userInfo && Object.prototype.hasOwnProperty.call(userInfo, 'cargo_rol') ? (userInfo.cargo_rol || '') : '';
        const typeRol = userInfo && Object.prototype.hasOwnProperty.call(userInfo, 'type_rol') ? (userInfo.type_rol || '') : '';
        sessionStorage.setItem('cargo_rol', String(cargoRol));
        sessionStorage.setItem('type_rol', String(typeRol));
        if (remember) {
            localStorage.setItem('cargo_rol', String(cargoRol));
            localStorage.setItem('type_rol', String(typeRol));
        } else {
            localStorage.removeItem('cargo_rol');
            localStorage.removeItem('type_rol');
        }
    } catch (_) {}

    // Guardar información del usuario si "recordarme" está marcado
    if (remember) {
        localStorage.setItem('rememberedUser', username);
        localStorage.setItem('rememberedTime', Date.now().toString());
    } else {
        localStorage.removeItem('rememberedUser');
        localStorage.removeItem('rememberedTime');
    }

    // Limpiar intentos fallidos
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutEndTime');

    // Mostrar mensaje de éxito
    showSuccess('¡Inicio de sesión exitoso!');
    
    // Animar éxito
    await animateSuccess();

    // Emitir sesión segura en backend (ID único + token ligado a dispositivo)
    try {
        const { userId, token } = await issueUserSession(username);
        if (!userId || !token) throw new Error('Respuesta incompleta');
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('authToken', token);
        if (remember) {
            localStorage.setItem('userId', userId);
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('userId');
            localStorage.removeItem('authToken');
        }

        // Redirigir a cursos después del login exitoso
        setTimeout(() => {
            window.location.href = '../courses.html';
        }, LOGIN_CONFIG.redirectDelay);
    } catch (err) {
        console.warn('No se pudo emitir sesión segura:', err);
        // Fallback de desarrollo: permitir acceso local sin token real
        const hn = (window.location && window.location.hostname) || '';
        const isLocal = ['localhost', '127.0.0.1', ''].includes(hn) || !hn.includes('.');
        if (isLocal) {
            const userId = `dev-${Date.now()}`;
            const token = btoa(`dev-token-${userId}`);
            sessionStorage.setItem('userId', userId);
            sessionStorage.setItem('authToken', token);
            if (remember) {
                localStorage.setItem('userId', userId);
                localStorage.setItem('authToken', token);
            } else {
                localStorage.removeItem('userId');
                localStorage.removeItem('authToken');
            }
            // Asegurar persistencia de roles en dev
            try {
                if (remember) {
                    localStorage.setItem('cargo_rol', String(sessionStorage.getItem('cargo_rol') || ''));
                    localStorage.setItem('type_rol', String(sessionStorage.getItem('type_rol') || ''));
                } else {
                    localStorage.removeItem('cargo_rol');
                    localStorage.removeItem('type_rol');
                }
            } catch (_) {}
            // Redirigir aunque no haya token real (solo dev)
            setTimeout(() => {
                window.location.href = '../courses.html';
            }, LOGIN_CONFIG.redirectDelay);
            return;
        }
        let detail = 'No se pudo establecer una sesión segura. Inténtalo de nuevo.';
        if (err && err.status) {
            if (err.status === 401) {
                detail = 'No autorizado para emitir sesión. Verifica la clave de acceso (X-API-Key) o vuelve a iniciar sesión. Código: 401';
            } else if (err.status === 429) {
                detail = 'Demasiadas solicitudes. Espera un momento y vuelve a intentarlo. Código: 429';
            } else if (err.status === 400) {
                detail = 'Usuario inválido para emitir sesión. Revisa el nombre de usuario. Código: 400';
            } else if (err.status >= 500) {
                detail = 'Servidor no disponible en este momento. Inténtalo más tarde. Código: ' + err.status;
            }
        }
        showError(detail);
        setLoadingState(false);
        return;
    }
}

// ---------- Sesión segura (sin BD) ----------
function getApiKeyForLogin() {
    try {
        let key = sessionStorage.getItem('apiKey');
        if (!key) {
            key = generateSessionKey();
            sessionStorage.setItem('apiKey', key);
        }
        return key;
    } catch (_) {
        return generateSessionKey();
    }
}

function generateSessionKey() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return btoa(`${timestamp}-${random}`).replace(/[^a-zA-Z0-9]/g, '');
}

async function issueUserSession(username) {
    const res = await fetch(`${API_BASE}/api/auth/issue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': getApiKeyForLogin(),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ username })
    });
    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        try { err.body = await res.text(); } catch(_) {}
        throw err;
    }
    return res.json();
}

async function handleFailedLogin() {
    loginState.attempts++;
    localStorage.setItem('loginAttempts', loginState.attempts.toString());

    if (loginState.attempts >= LOGIN_CONFIG.maxAttempts) {
        await lockUser();
        showError(`Demasiados intentos fallidos. Cuenta bloqueada por ${LOGIN_CONFIG.lockoutDuration / 60000} minutos.`);
    } else {
        const remainingAttempts = LOGIN_CONFIG.maxAttempts - loginState.attempts;
        showError(`Credenciales incorrectas. Intentos restantes: ${remainingAttempts}`);
        await animateError();
    }

    setLoadingState(false);
}

function lockUser(endTime = null) {
    loginState.isLocked = true;
    const lockoutEndTime = endTime || Date.now() + LOGIN_CONFIG.lockoutDuration;
    loginState.lockoutEndTime = lockoutEndTime;
    
    localStorage.setItem('lockoutEndTime', lockoutEndTime.toString());
    
    elements.submitBtn.disabled = true;
    elements.username.disabled = true;
    elements.password.disabled = true;
    
    showLockoutCountdown();
}

function showLockoutCountdown() {
    const countdown = setInterval(() => {
        const remaining = Math.max(0, loginState.lockoutEndTime - Date.now());
        
        if (remaining <= 0) {
            clearInterval(countdown);
            unlockUser();
        } else {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            elements.btnText.textContent = `Bloqueado (${minutes}:${seconds.toString().padStart(2, '0')})`;
        }
    }, 1000);
}

function unlockUser() {
    loginState.isLocked = false;
    loginState.attempts = 0;
    loginState.lockoutEndTime = null;
    
    localStorage.removeItem('lockoutEndTime');
    localStorage.removeItem('loginAttempts');
    
    elements.submitBtn.disabled = false;
    elements.username.disabled = false;
    elements.password.disabled = false;
    elements.btnText.textContent = 'Iniciar Sesión';
}

function validateForm(username, password) {
    if (!validateUsername(username)) {
        return false;
    }
    
    if (!validatePassword(password)) {
        return false;
    }
    
    return true;
}

function validateUsername(username = null) {
    const value = username || elements.username.value.trim();
    const isValid = value.length >= LOGIN_CONFIG.minUsernameLength;
    
    if (value.length > 0) {
        elements.username.style.borderColor = isValid ? 'var(--success)' : 'var(--error)';
    } else {
        elements.username.style.borderColor = 'rgba(4, 194, 209, 0.3)';
    }
    
    return isValid;
}

function validatePassword(password = null) {
    const value = password || elements.password.value;
    const isValid = value.length >= LOGIN_CONFIG.minPasswordLength;
    
    if (value.length > 0) {
        elements.password.style.borderColor = isValid ? 'var(--success)' : 'var(--error)';
    } else {
        elements.password.style.borderColor = 'rgba(4, 194, 209, 0.3)';
    }
    
    return isValid;
}

function handleInputFocus(e) {
    const input = e.target;
    const inputBox = input.closest('.input-box');
    inputBox.style.transform = 'translateY(-2px)';
}

function handleInputBlur(e) {
    const input = e.target;
    const inputBox = input.closest('.input-box');
    inputBox.style.transform = 'translateY(0)';
}

function togglePasswordVisibility() {
    const type = elements.password.type === 'password' ? 'text' : 'password';
    elements.password.type = type;
    
    const icon = elements.togglePassword;
    icon.classList.toggle('bxs-show');
    icon.classList.toggle('bxs-hide');
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

function setLoadingState(loading) {
    loginState.isLoading = loading;
    
    if (loading) {
        elements.submitBtn.classList.add('loading');
        elements.btnText.textContent = 'Iniciando sesión...';
    } else {
        elements.submitBtn.classList.remove('loading');
        elements.btnText.textContent = 'Iniciar Sesión';
    }
}

async function animateSuccess() {
    elements.submitBtn.style.animation = 'successPulse 0.6s ease-in-out';
    await new Promise(resolve => setTimeout(resolve, 600));
    elements.submitBtn.style.animation = '';
}

async function animateError() {
    elements.form.style.animation = 'errorShake 0.6s ease-in-out';
    await new Promise(resolve => setTimeout(resolve, 600));
    elements.form.style.animation = '';
}

function animateElements() {
    // Animar elementos con delays escalonados
    const elementsToAnimate = [
        { element: document.querySelector('.logo-container'), delay: 200 },
        { element: document.querySelector('.login-form'), delay: 400 },
        { element: document.querySelector('.welcome-message'), delay: 600 }
    ];

    elementsToAnimate.forEach(({ element, delay }) => {
        if (element) {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, delay);
        }
    });
}

function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const rememberedTime = localStorage.getItem('rememberedTime');
    
    if (rememberedUser && rememberedTime) {
        const timeDiff = Date.now() - parseInt(rememberedTime);
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        // Si han pasado más de 30 días, limpiar datos
        if (daysDiff > 30) {
            localStorage.removeItem('rememberedUser');
            localStorage.removeItem('rememberedTime');
        } else {
            elements.username.value = rememberedUser;
            elements.remember.checked = true;
        }
    }
}

// Agregar estilos dinámicos para animaciones
const style = document.createElement('style');
style.textContent = `
    .error-message, .success-message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: var(--white);
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    }

    .error-message {
        background: var(--error);
        border-left: 4px solid #ff6b7a;
    }

    .success-message {
        background: var(--success);
        border-left: 4px solid #7bed9f;
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }

    @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
