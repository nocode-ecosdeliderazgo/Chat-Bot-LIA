/* ===== ANIMACIONES DE SCROLL Y EFECTOS ===== */

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, this.observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            this.observer.observe(el);
        });
    }
}

class AnimatedCounters {
    constructor() {
        this.counters = document.querySelectorAll('[data-target]');
        this.init();
    }

    init() {
        this.counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter);
        });
    }
}

// Efectos de hover avanzados
class HoverEffects {
    constructor() {
        this.init();
    }

    init() {
        // Efecto glow en botones
        document.querySelectorAll('.glow-hover').forEach(element => {
            element.addEventListener('mouseenter', this.addGlowEffect.bind(this));
            element.addEventListener('mouseleave', this.removeGlowEffect.bind(this));
        });

        // Efecto lift en cards
        document.querySelectorAll('.lift-hover').forEach(element => {
            element.addEventListener('mouseenter', this.addLiftEffect.bind(this));
            element.addEventListener('mouseleave', this.removeLiftEffect.bind(this));
        });

        // Efecto magnético
        document.querySelectorAll('.magnetic').forEach(element => {
            element.addEventListener('mouseenter', this.addMagneticEffect.bind(this));
            element.addEventListener('mouseleave', this.removeMagneticEffect.bind(this));
        });
    }

    addGlowEffect(event) {
        const element = event.target;
        element.style.boxShadow = '0 0 20px rgba(68, 229, 255, 0.5)';
    }

    removeGlowEffect(event) {
        const element = event.target;
        element.style.boxShadow = '';
    }

    addLiftEffect(event) {
        const element = event.target;
        element.style.transform = 'translateY(-8px)';
        element.style.boxShadow = '0 20px 40px rgba(68, 229, 255, 0.3)';
    }

    removeLiftEffect(event) {
        const element = event.target;
        element.style.transform = '';
        element.style.boxShadow = '';
    }

    addMagneticEffect(event) {
        const element = event.target;
        element.style.transform = 'scale(1.05)';
    }

    removeMagneticEffect(event) {
        const element = event.target;
        element.style.transform = '';
    }
}

// Animaciones de entrada
class EntranceAnimations {
    constructor() {
        this.init();
    }

    init() {
        // Animación de entrada para el header
        const header = document.querySelector('.instructor-header');
        if (header) {
            header.style.opacity = '0';
            header.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                header.style.transition = 'all 0.8s ease';
                header.style.opacity = '1';
                header.style.transform = 'translateY(0)';
            }, 100);
        }

        // Animación de entrada para botones
        const buttons = document.querySelectorAll('.header-actions button');
        buttons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                button.style.transition = 'all 0.6s ease';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 300 + (index * 100));
        });
    }
}

// Efectos de partículas interactivas
class InteractiveParticles {
    constructor() {
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    createParticles() {
        const container = document.querySelector('.particles-container');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'interactive-particle';
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: var(--course-primary);
                border-radius: 50%;
                opacity: 0.6;
                pointer-events: none;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            
            container.appendChild(particle);
            this.particles.push({
                element: particle,
                x: Math.random() * container.clientWidth,
                y: Math.random() * container.clientHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    animate() {
        this.particles.forEach(particle => {
            // Movimiento básico
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Rebote en bordes
            const container = document.querySelector('.particles-container');
            if (container) {
                if (particle.x <= 0 || particle.x >= container.clientWidth) {
                    particle.vx *= -1;
                }
                if (particle.y <= 0 || particle.y >= container.clientHeight) {
                    particle.vy *= -1;
                }
            }

            // Interacción con mouse
            const deltaX = this.mouse.x - particle.x;
            const deltaY = this.mouse.y - particle.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.x -= deltaX * force * 0.02;
                particle.y -= deltaY * force * 0.02;
            }

            // Actualizar posición
            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Inicializar todas las animaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();
    new AnimatedCounters();
    new HoverEffects();
    new EntranceAnimations();
    new InteractiveParticles();
});

// Optimizaciones de performance
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Lazy loading para imágenes
        this.initLazyLoading();
        
        // Optimizar animaciones para dispositivos con preferencia de movimiento reducido
        this.handleReducedMotion();
        
        // Optimizar para dispositivos móviles
        this.handleMobileOptimization();
    }

    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    handleReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Desactivar animaciones para usuarios que prefieren movimiento reducido
            document.documentElement.style.setProperty('--transition-normal', '0.01s');
            document.documentElement.style.setProperty('--transition-slow', '0.01s');
            
            // Desactivar animaciones CSS
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    handleMobileOptimization() {
        if (window.innerWidth < 768) {
            // Reducir número de partículas en móviles
            const particleContainers = document.querySelectorAll('.particles-container');
            particleContainers.forEach(container => {
                const particles = container.querySelectorAll('.particle');
                particles.forEach((particle, index) => {
                    if (index > 15) {
                        particle.style.display = 'none';
                    }
                });
            });
        }
    }
}

// Inicializar optimizaciones
document.addEventListener('DOMContentLoaded', () => {
    new PerformanceOptimizer();
});