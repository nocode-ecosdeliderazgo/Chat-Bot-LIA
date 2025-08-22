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
    videoUrl: 'https://www.youtube.com/embed/y7xsTTRmk88',
    modules: [
        {
            id: 1,
            title: 'Fundamentos de ChatGPT',
            duration: '3 horas',
            description: 'Introducción a ChatGPT, configuración y primeros pasos para maximizar su potencial.'
        },
        {
            id: 2,
            title: 'Gemini Avanzado',
            duration: '4 horas',
            description: 'Exploración profunda de Gemini para análisis, investigación y generación de contenido.'
        },
        {
            id: 3,
            title: 'Automatización y Flujos',
            duration: '5 horas',
            description: 'Creación de flujos de trabajo automatizados y integración de herramientas.'
        },
        {
            id: 4,
            title: 'Proyecto Final',
            duration: '3 horas',
            description: 'Aplicación práctica de todo lo aprendido en un proyecto real.'
        }
    ]
};

// Clase principal para la página de información del taller
class TallerInfoPage {
    constructor() {
        this.initializePage();
        this.setupEventListeners();
        this.loadUserData();
    }

    initializePage() {
        console.log('🚀 Inicializando página de información del taller...');
        
        // Inicializar efectos visuales
        this.initializeVisualEffects();
        
        // Cargar datos del taller
        this.loadTallerData();
        
        // Configurar navegación
        this.setupNavigation();
    }

    initializeVisualEffects() {
        // Efectos de hover para las tarjetas
        this.setupCardHoverEffects();
        
        // Animaciones de entrada
        this.setupEntranceAnimations();
        
        // Efectos de partículas (si están disponibles)
        this.setupParticleEffects();
    }

    setupCardHoverEffects() {
        const cards = document.querySelectorAll('.taller-info-card, .what-next-section, .module-item, .objective-item');
        
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
    }

    setupEntranceAnimations() {
        const elements = document.querySelectorAll('.taller-info-card, .what-next-section');
        
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

    setupParticleEffects() {
        // Verificar si el script de partículas está disponible
        if (typeof window.initParticles === 'function') {
            window.initParticles();
        }
    }

    loadTallerData() {
        // Obtener el ID del taller desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        const tallerId = urlParams.get('taller') || TALLER_DATA.id;
        
        // Cargar datos específicos del taller
        this.loadTallerById(tallerId);
        
        // Cargar progreso guardado
        const savedProgress = this.getTallerProgress(tallerId);
        
        if (savedProgress) {
            this.updateProgressDisplay(savedProgress);
        }
    }

    loadTallerById(tallerId) {
        // Mapear IDs de taller a datos específicos
        const tallerMap = {
            'chatgpt-gemini-productividad': {
                title: 'Dominando ChatGPT y Gemini para la Productividad',
                instructor: 'Lia IA',
                duration: '15 horas',
                level: 'Intermedio',
                videoUrl: 'https://www.youtube.com/embed/y7xsTTRmk88'
            },
            'curso-ia-completo': {
                title: 'Aprende y Aplica IA — Taller Completo',
                instructor: 'Lia IA',
                duration: '12 horas',
                level: 'Intermedio',
                videoUrl: 'https://www.youtube.com/embed/y7xsTTRmk88'
            },
            'ml-fundamentos': {
                title: 'Fundamentos de Machine Learning',
                instructor: 'Lia IA',
                duration: '20 horas',
                level: 'Principiante',
                videoUrl: 'https://www.youtube.com/embed/y7xsTTRmk88'
            }
        };
        
        const tallerData = tallerMap[tallerId] || tallerMap['chatgpt-gemini-productividad'];
        
        // Actualizar la interfaz con los datos del taller
        this.updateTallerInterface(tallerData);
    }

    updateTallerInterface(tallerData) {
        // Actualizar título
        const titleElement = document.querySelector('.taller-title-section h1');
        if (titleElement) {
            titleElement.textContent = tallerData.title;
        }
        
        // Actualizar instructor
        const instructorElement = document.querySelector('.meta-item i[class*="bx-user"]');
        if (instructorElement) {
            instructorElement.parentElement.innerHTML = `
                <i class='bx bx-user'></i>
                Instructor: ${tallerData.instructor}
            `;
        }
        
        // Actualizar duración
        const durationElement = document.querySelector('.meta-item i[class*="bx-time"]');
        if (durationElement) {
            durationElement.parentElement.innerHTML = `
                <i class='bx bx-time'></i>
                Duración: ${tallerData.duration}
            `;
        }
        
        // Actualizar nivel
        const levelElement = document.querySelector('.meta-item i[class*="bx-star"]');
        if (levelElement) {
            levelElement.parentElement.innerHTML = `
                <i class='bx bx-star'></i>
                Nivel: ${tallerData.level}
            `;
        }
        
        // Actualizar video
        const videoElement = document.querySelector('.video-container iframe');
        if (videoElement) {
            videoElement.src = tallerData.videoUrl;
        }
    }

    getTallerProgress(tallerId = TALLER_DATA.id) {
        const userData = localStorage.getItem('userLearningData');
        if (userData) {
            const data = JSON.parse(userData);
            return data.courseProgress?.[tallerId] || null;
        }
        return null;
    }

    updateProgressDisplay(progress) {
        // Actualizar indicadores de progreso si existen
        const progressElements = document.querySelectorAll('.progress-indicator');
        progressElements.forEach(element => {
            if (progress.percentage) {
                element.style.width = `${progress.percentage}%`;
            }
        });
    }

    setupEventListeners() {
        // Botón de comenzar taller
        const startButton = document.querySelector('.btn-start-taller');
        if (startButton) {
            startButton.addEventListener('click', () => this.startTaller());
        }

        // Botón de vista previa
        const previewButton = document.querySelector('.btn-preview');
        if (previewButton) {
            previewButton.addEventListener('click', () => this.previewTaller());
        }

        // Botón de regreso
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => this.goBack());
        }

        // Efectos de hover para módulos
        this.setupModuleHoverEffects();
    }

    setupModuleHoverEffects() {
        const modules = document.querySelectorAll('.module-item');
        
        modules.forEach(module => {
            module.addEventListener('click', () => {
                this.showModuleDetails(module);
            });
        });
    }

    showModuleDetails(module) {
        // Mostrar detalles del módulo en un modal o expandir la información
        const moduleTitle = module.querySelector('h3').textContent;
        console.log(`📚 Mostrando detalles del módulo: ${moduleTitle}`);
        
        // Aquí se podría implementar un modal o expandir la información
        this.showNotification(`Módulo: ${moduleTitle}`, 'info');
    }

    startTaller() {
        console.log('🎯 Iniciando taller...');
        
        // Mostrar indicador de carga
        this.showLoadingState();
        
        // Simular carga
        setTimeout(() => {
            // Guardar progreso inicial
            this.saveInitialProgress();
            
            // Redirigir al contenido del taller
            this.redirectToTallerContent();
        }, TALLER_INFO_CONFIG.redirectDelay);
    }

    showLoadingState() {
        const startButton = document.querySelector('.btn-start-taller');
        if (startButton) {
            const originalText = startButton.innerHTML;
            startButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Iniciando...';
            startButton.disabled = true;
            
            // Restaurar después de un tiempo
            setTimeout(() => {
                startButton.innerHTML = originalText;
                startButton.disabled = false;
            }, TALLER_INFO_CONFIG.redirectDelay + 500);
        }
    }

    saveInitialProgress() {
        const urlParams = new URLSearchParams(window.location.search);
        const tallerId = urlParams.get('taller') || TALLER_DATA.id;
        
        const userData = this.getUserData();
        
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
        
        this.saveUserData(userData);
    }

    redirectToTallerContent() {
        // Obtener el ID del taller desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        const tallerId = urlParams.get('taller') || TALLER_DATA.id;
        
        // Redirigir al contenido del taller (chat.html)
        window.location.href = 'chat.html?course=' + tallerId;
    }

    previewTaller() {
        console.log('👁️ Mostrando vista previa del taller...');
        
        // Mostrar modal o página de vista previa
        this.showPreviewModal();
    }

    showPreviewModal() {
        // Crear modal de vista previa
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="preview-content">
                <div class="preview-header">
                    <h3>Vista Previa del Taller</h3>
                    <button class="close-preview" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class='bx bx-x'></i>
                    </button>
                </div>
                <div class="preview-body">
                    <p>Esta es una vista previa del contenido del taller. Para acceder al contenido completo, inicia el taller.</p>
                    <div class="preview-video">
                        <iframe 
                            width="100%" 
                            height="300" 
                            src="${TALLER_DATA.videoUrl}" 
                            title="Vista previa del taller" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar estilos al modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(modal);
    }

    goBack() {
        // Navegar hacia atrás
        if (document.referrer && document.referrer.includes(window.location.origin)) {
            history.back();
        } else {
            // Si no hay página anterior, ir a la página de talleres
            window.location.href = 'courses.html';
        }
    }

    loadUserData() {
        // Cargar datos del usuario
        const userData = this.getUserData();
        
        // Actualizar información del usuario en la interfaz
        this.updateUserInterface(userData);
    }

    getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : {};
    }

    saveUserData(userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    updateUserInterface(userData) {
        // Actualizar nombre del usuario
        const nameElement = document.getElementById('pmName');
        if (nameElement && userData.name) {
            nameElement.textContent = userData.name;
        }
        
        // Actualizar email del usuario
        const emailElement = document.getElementById('pmEmail');
        if (emailElement && userData.email) {
            emailElement.textContent = userData.email;
        }
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos de la notificación
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
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Funciones globales para los botones
function startTaller() {
    if (window.tallerInfoPage) {
        window.tallerInfoPage.startTaller();
    }
}

function previewTaller() {
    if (window.tallerInfoPage) {
        window.tallerInfoPage.previewTaller();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.tallerInfoPage = new TallerInfoPage();
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
    
    .preview-content {
        background: var(--taller-card-bg);
        border: 1px solid var(--taller-card-border);
        border-radius: 20px;
        padding: 24px;
        max-width: 600px;
        width: 90%;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
    }
    
    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .preview-header h3 {
        color: var(--text-on-dark);
        margin: 0;
    }
    
    .close-preview {
        background: none;
        border: none;
        color: var(--text-on-dark);
        font-size: 24px;
        cursor: pointer;
        padding: 4px;
    }
    
    .preview-body p {
        color: var(--text-muted);
        margin-bottom: 20px;
    }
    
    .preview-video {
        border-radius: 12px;
        overflow: hidden;
    }
`;
document.head.appendChild(style);