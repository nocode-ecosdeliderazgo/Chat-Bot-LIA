/**
 * TALLER-INFO.JS - Funcionalidad para la página de información del taller
 */

// Configuración
const TALLER_INFO_CONFIG = {
    animationDuration: 300,
    redirectDelay: 1000,
};

// Datos del taller
const TALLER_DATA = {
    id: 'chatgpt-gemini-productividad',
    title: 'Dominando ChatGPT y Gemini para la Productividad',
    instructor: 'Lia IA',
    duration: '15 horas',
    level: 'Intermedio',
    videoUrl: 'https://www.youtube.com/embed/y7xsTTRmk88'
};

// Función de prueba para verificar elementos
function testElements() {
    console.log('🧪 Probando elementos...');
    
    const startButton = document.querySelector('.btn-start-taller');
    const previewButton = document.querySelector('.btn-preview');
    const backButton = document.querySelector('.back-button');
    const navItems = document.querySelectorAll('.nav-item');
    
    console.log('Elementos encontrados:', {
        startButton: startButton ? '✅' : '❌',
        previewButton: previewButton ? '✅' : '❌',
        backButton: backButton ? '✅' : '❌',
        navItems: navItems.length
    });
    
    return {
        startButton,
        previewButton,
        backButton,
        navItems
    };
}

// Función principal de inicialización
function initializeTallerInfoPage() {
    console.log('🚀 Inicializando página de información del taller...');
    
    // Probar elementos primero
    const elements = testElements();
    
    // Configurar navegación lateral
    setupSidebarNavigation(elements.navItems);
    
    // Configurar botones de acción
    setupActionButtons(elements);
    
    // Configurar efectos visuales
    setupVisualEffects();
    
    console.log('✅ Página de taller inicializada correctamente');
}

// Configurar navegación lateral
function setupSidebarNavigation(navItems) {
    console.log('🔧 Configurando navegación lateral...');
    console.log(`Encontrados ${navItems.length} elementos de navegación`);
    
    navItems.forEach((item) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionId = this.getAttribute('data-section');
            console.log(`🖱️ Click en navegación: ${sectionId}`);
            
            // Remover clase active de todos los elementos
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            
            // Agregar clase active al elemento seleccionado
            this.classList.add('active');
            const selectedSection = document.getElementById(sectionId);
            
            if (selectedSection) {
                selectedSection.classList.add('active');
                console.log(`✅ Sección cambiada a: ${sectionId}`);
            } else {
                console.error(`❌ No se encontró la sección: ${sectionId}`);
            }
        });
    });
}

// Configurar botones de acción
function setupActionButtons(elements) {
    console.log('🔧 Configurando botones de acción...');
    
    // Botón de comenzar taller
    if (elements.startButton) {
        console.log('✅ Botón de comenzar taller encontrado');
        elements.startButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Click en comenzar taller');
            startTaller();
        });
    } else {
        console.error('❌ Botón de comenzar taller no encontrado');
    }
    
    // Botón de vista previa
    if (elements.previewButton) {
        console.log('✅ Botón de vista previa encontrado');
        elements.previewButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Click en vista previa');
            previewTaller();
        });
    } else {
        console.error('❌ Botón de vista previa no encontrado');
    }
    
    // Botón de regreso
    if (elements.backButton) {
        console.log('✅ Botón de regreso encontrado');
        elements.backButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Click en botón de regreso');
            goBack();
        });
    } else {
        console.error('❌ Botón de regreso no encontrado');
    }
}

// Configurar efectos visuales
function setupVisualEffects() {
    console.log('🔧 Configurando efectos visuales...');
    
    // Efectos de hover para las tarjetas
    const cards = document.querySelectorAll('.taller-info-card, .module-item, .objective-item, .step-item, .stat-item');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });
    
    // Animaciones de entrada
    const elements = document.querySelectorAll('.taller-info-card, .sidebar-navigation');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Función para comenzar el taller
function startTaller() {
    console.log('🎯 Iniciando taller...');
    
    // Mostrar indicador de carga
    const startButton = document.querySelector('.btn-start-taller');
    if (startButton) {
        const originalText = startButton.innerHTML;
        startButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Iniciando...';
        startButton.disabled = true;
        
        // Simular carga y redirigir
        setTimeout(() => {
            // Guardar progreso inicial
            saveInitialProgress();
            
            // Redirigir al contenido del taller
            redirectToTallerContent();
            
            // Restaurar botón
            startButton.innerHTML = originalText;
            startButton.disabled = false;
        }, TALLER_INFO_CONFIG.redirectDelay);
    }
}

// Función para vista previa
function previewTaller() {
    console.log('👁️ Mostrando vista previa del taller...');
    
    // Cambiar a la sección de video
    const navItem = document.querySelector('[data-section="en-vivo"]');
    if (navItem) {
        navItem.click();
    }
}

// Función para regresar
function goBack() {
    console.log('⬅️ Regresando...');
    
    if (document.referrer && document.referrer.includes(window.location.origin)) {
        history.back();
    } else {
        window.location.href = 'courses.html';
    }
}

// Guardar progreso inicial
function saveInitialProgress() {
    const urlParams = new URLSearchParams(window.location.search);
    const tallerId = urlParams.get('taller') || TALLER_DATA.id;
    
    const userData = getUserData();
    
    if (!userData.courseProgress) {
        userData.courseProgress = {};
    }
    
    userData.courseProgress[tallerId] = {
        started: true,
        startDate: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        percentage: 0,
        completedModules: [],
        currentModule: 1
    };
    
    saveUserData(userData);
}

// Redirigir al contenido del taller
function redirectToTallerContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const tallerId = urlParams.get('taller') || TALLER_DATA.id;
    
    console.log(`🔄 Redirigiendo a chat.html con taller: ${tallerId}`);
    window.location.href = 'chat.html?course=' + tallerId;
}

// Obtener datos del usuario
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : {};
}

// Guardar datos del usuario
function saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#44e5ff'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, inicializando página de taller...');
    initializeTallerInfoPage();
});

// Estilos CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
