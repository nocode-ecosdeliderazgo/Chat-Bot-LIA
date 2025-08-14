/* ===== SISTEMA DE INICIALIZACIÓN DE LA PÁGINA DE BIENVENIDA ===== */

class WelcomePageManager {
    constructor() {
        this.particleSystem = null;
        this.scrollAnimations = null;
        this.testimonialsCarousel = null;
        this.animatedCounters = null;
        this.revealEffects = null;
        this.textEffects = null;
        
        this.isInitialized = false;
        this.components = {};
        
        this.init();
    }

    async init() {
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Verificar preferencias de animación antes de inicializar
            this.checkAnimationPreferences();
            
            // Inicializar componentes principales
            this.initializeParticleSystem();
            this.initializeScrollAnimations();
            this.initializeCarousel();
            this.initializeCounters();
            this.initializeRevealEffects();
            this.initializeTextEffects();
            
            // Configurar eventos globales
            this.bindGlobalEvents();
            
            // Inicializar funcionalidades adicionales
            this.initializeAdditionalFeatures();
            
            this.isInitialized = true;
            
            // Emitir evento de inicialización completa
            this.dispatchInitCompleteEvent();
            
            console.log('💫 Welcome Page initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Welcome Page:', error);
            this.handleInitializationError(error);
        }
    }

    checkAnimationPreferences() {
        // Verificar preferencias de movimiento reducido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
            console.log('🔄 Reduced motion enabled');
        }

        // Verificar soporte para animaciones web
        if (!window.requestAnimationFrame) {
            console.warn('⚠️ RequestAnimationFrame not supported, using fallbacks');
            document.body.classList.add('no-animations');
        }
    }

    initializeParticleSystem() {
        try {
            if (typeof initializeParticleSystem === 'function') {
                initializeParticleSystem();
                this.components.particles = true;
                console.log('✨ Particle system initialized');
            } else {
                console.warn('⚠️ Particle system not available');
            }
        } catch (error) {
            console.error('❌ Error initializing particle system:', error);
        }
    }

    initializeScrollAnimations() {
        try {
            if (typeof ScrollAnimations === 'function') {
                this.scrollAnimations = new ScrollAnimations();
                this.components.scrollAnimations = this.scrollAnimations;
                console.log('📜 Scroll animations initialized');
            } else {
                console.warn('⚠️ ScrollAnimations class not available');
            }
        } catch (error) {
            console.error('❌ Error initializing scroll animations:', error);
        }
    }

    initializeCarousel() {
        try {
            const testimonialsCarousel = document.querySelector('.testimonials-carousel');
            if (testimonialsCarousel && typeof TestimonialsCarousel === 'function') {
                this.testimonialsCarousel = new TestimonialsCarousel(testimonialsCarousel);
                this.components.carousel = this.testimonialsCarousel;
                console.log('🎠 Testimonials carousel initialized');
            } else {
                console.warn('⚠️ Testimonials carousel not found or class not available');
            }
        } catch (error) {
            console.error('❌ Error initializing carousel:', error);
        }
    }

    initializeCounters() {
        try {
            if (typeof AnimatedCounters === 'function') {
                this.animatedCounters = new AnimatedCounters();
                this.components.counters = this.animatedCounters;
                console.log('🔢 Animated counters initialized');
            } else {
                console.warn('⚠️ AnimatedCounters class not available');
            }
        } catch (error) {
            console.error('❌ Error initializing counters:', error);
        }
    }

    initializeRevealEffects() {
        try {
            if (typeof RevealEffects === 'function') {
                this.revealEffects = new RevealEffects();
                this.components.reveals = this.revealEffects;
                console.log('🎭 Reveal effects initialized');
            } else {
                console.warn('⚠️ RevealEffects class not available');
            }
        } catch (error) {
            console.error('❌ Error initializing reveal effects:', error);
        }
    }

    initializeTextEffects() {
        try {
            if (typeof TextEffects === 'function') {
                this.textEffects = new TextEffects();
                this.components.textEffects = this.textEffects;
                console.log('✍️ Text effects initialized');
            } else {
                console.warn('⚠️ TextEffects class not available');
            }
        } catch (error) {
            console.error('❌ Error initializing text effects:', error);
        }
    }

    bindGlobalEvents() {
        // Manejo de errores globales
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });

        // Manejo de cambios de visibilidad
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Manejo de redimensionamiento
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Navegación suave para enlaces internos
        this.initializeSmoothScroll();

        // Teclado para accesibilidad
        this.initializeKeyboardNavigation();
    }

    initializeSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initializeKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape para cerrar modales o detener animaciones
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
            
            // Tab para navegación accesible
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        // Remover indicador de navegación por teclado en click
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    initializeAdditionalFeatures() {
        // Lazy loading de imágenes
        this.initializeLazyLoading();
        
        // Preload de recursos críticos
        this.preloadCriticalResources();
        
        // Analytics y tracking (si es necesario)
        this.initializeAnalytics();
        
        // Service Worker (si está disponible)
        this.initializeServiceWorker();
    }

    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    preloadCriticalResources() {
        // Preload de fuentes críticas
        const criticalFonts = [
            'Inter-Regular.woff2',
            'Inter-Bold.woff2'
        ];

        criticalFonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = `/fonts/${font}`;
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    initializeAnalytics() {
        // Tracking básico de eventos de usuario (sin datos personales)
        const events = ['click', 'scroll', 'resize'];
        let eventCounts = {};

        events.forEach(eventType => {
            eventCounts[eventType] = 0;
            document.addEventListener(eventType, () => {
                eventCounts[eventType]++;
            }, { passive: true });
        });

        // Log estadísticas cada 30 segundos (solo para desarrollo)
        if (process.env.NODE_ENV === 'development') {
            setInterval(() => {
                console.log('📊 User interaction stats:', eventCounts);
            }, 30000);
        }
    }

    initializeServiceWorker() {
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('🔧 Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Pausar animaciones y componentes cuando la página no es visible
            this.pauseComponents();
        } else {
            // Reanudar componentes cuando la página vuelve a ser visible
            this.resumeComponents();
        }
    }

    handleResize() {
        // Notificar a los componentes sobre el cambio de tamaño
        Object.values(this.components).forEach(component => {
            if (component && typeof component.handleResize === 'function') {
                component.handleResize();
            }
        });

        console.log('📐 Window resized, components updated');
    }

    handleEscapeKey() {
        // Pausar carrusel si está activo
        if (this.testimonialsCarousel && typeof this.testimonialsCarousel.pause === 'function') {
            this.testimonialsCarousel.pause();
        }
    }

    pauseComponents() {
        Object.values(this.components).forEach(component => {
            if (component && typeof component.pause === 'function') {
                component.pause();
            }
        });
    }

    resumeComponents() {
        Object.values(this.components).forEach(component => {
            if (component && typeof component.resume === 'function') {
                component.resume();
            }
        });
    }

    handleInitializationError(error) {
        // Mostrar fallback básico sin animaciones
        document.body.classList.add('initialization-error');
        
        // Crear mensaje de error para desarrolladores
        if (process.env.NODE_ENV === 'development') {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                padding: 10px;
                border-radius: 5px;
                z-index: 9999;
                font-family: monospace;
                font-size: 12px;
                max-width: 300px;
            `;
            errorDiv.textContent = `Initialization Error: ${error.message}`;
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }

    dispatchInitCompleteEvent() {
        const event = new CustomEvent('welcomePageInitialized', {
            detail: {
                components: Object.keys(this.components),
                timestamp: Date.now(),
                manager: this
            }
        });
        
        document.dispatchEvent(event);
    }

    // API pública para control externo
    getComponent(name) {
        return this.components[name] || null;
    }

    isComponentActive(name) {
        return !!this.components[name];
    }

    reinitializeComponent(name) {
        switch (name) {
            case 'particles':
                this.initializeParticleSystem();
                break;
            case 'carousel':
                this.initializeCarousel();
                break;
            case 'scrollAnimations':
                this.initializeScrollAnimations();
                break;
            case 'counters':
                this.initializeCounters();
                break;
            case 'reveals':
                this.initializeRevealEffects();
                break;
            case 'textEffects':
                this.initializeTextEffects();
                break;
            default:
                console.warn(`Unknown component: ${name}`);
        }
    }

    destroy() {
        // Limpiar todos los componentes
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        this.components = {};
        this.isInitialized = false;
        
        console.log('🗑️ Welcome Page Manager destroyed');
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    window.welcomePageManager = new WelcomePageManager();
});

// Exportar para uso global
window.WelcomePageManager = WelcomePageManager;

// Exponer API global para control desde consola (desarrollo)
if (typeof window !== 'undefined') {
    window.WelcomeAPI = {
        manager: null,
        
        init() {
            if (!this.manager) {
                this.manager = new WelcomePageManager();
            }
            return this.manager;
        },
        
        getComponent(name) {
            return this.manager ? this.manager.getComponent(name) : null;
        },
        
        reinit(component) {
            if (this.manager) {
                if (component) {
                    this.manager.reinitializeComponent(component);
                } else {
                    this.manager.destroy();
                    this.manager = new WelcomePageManager();
                }
            }
        },
        
        status() {
            if (!this.manager) {
                console.log('❌ Welcome Page Manager not initialized');
                return;
            }
            
            console.log('📊 Welcome Page Status:');
            console.log('Initialized:', this.manager.isInitialized);
            console.log('Components:', Object.keys(this.manager.components));
            console.log('Manager:', this.manager);
        }
    };
}