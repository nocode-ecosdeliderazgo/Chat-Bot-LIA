/* ===== SISTEMA DE ANIMACIONES DE SCROLL ===== */

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.counters = [];
        this.progressBar = null;
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollProgress();
        this.setupSmoothScroll();
        this.setupParallaxEffects();
        this.bindScrollEvents();
    }

    setupIntersectionObserver() {
        // Verificar soporte
        if (!('IntersectionObserver' in window)) {
            this.fallbackAnimations();
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Manejar animaciones especiales
                    this.handleSpecialAnimations(entry.target);
                }
            });
        }, this.observerOptions);

        // Observar elementos con animaciones
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            this.observer.observe(el);
        });
    }

    handleSpecialAnimations(element) {
        // Contadores animados
        if (element.hasAttribute('data-target')) {
            this.animateCounter(element);
        }

        // Efectos de typing
        if (element.classList.contains('typewriter')) {
            this.startTypewriterEffect(element);
        }

        // Efectos stagger para contenedores
        if (element.classList.contains('stagger-container')) {
            this.animateStaggerChildren(element);
        }
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
                element.classList.add('count-animation');
            }
        };

        updateCounter();
    }

    startTypewriterEffect(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '3px solid var(--course-primary)';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            
            if (i > text.length) {
                clearInterval(typeInterval);
                // Mantener el cursor parpadeando
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 1000);
            }
        }, 50);
    }

    animateStaggerChildren(container) {
        const children = container.querySelectorAll('.animate-on-scroll');
        children.forEach((child, index) => {
            setTimeout(() => {
                child.classList.add('animate-in');
            }, index * 100);
        });
    }

    setupScrollProgress() {
        // Crear barra de progreso
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-bar';
        document.body.appendChild(this.progressBar);
    }

    updateScrollProgress() {
        const scrolled = window.pageYOffset;
        const maxHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (scrolled / maxHeight) * 100;
        
        if (this.progressBar) {
            this.progressBar.style.width = progress + '%';
        }
    }

    setupSmoothScroll() {
        // Smooth scroll para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupParallaxEffects() {
        this.parallaxElements = document.querySelectorAll('[data-parallax]');
    }

    updateParallaxEffects() {
        const scrolled = window.pageYOffset;
        
        this.parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-parallax') || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    bindScrollEvents() {
        let ticking = false;

        const updateOnScroll = () => {
            this.updateScrollProgress();
            this.updateParallaxEffects();
            this.handleNavbarScroll();
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateOnScroll);
                ticking = true;
            }
        });
    }

    handleNavbarScroll() {
        const navbar = document.querySelector('.hero-nav');
        if (!navbar) return;

        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    fallbackAnimations() {
        // Fallback para navegadores sin IntersectionObserver
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.add('animate-in');
        });
    }

    // Método público para agregar nuevos elementos observables
    observeElement(element) {
        if (this.observer) {
            this.observer.observe(element);
        }
    }

    // Método para detener observaciones
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

/* ===== CLASE PARA CONTADORES ANIMADOS ===== */
class AnimatedCounters {
    constructor() {
        this.counters = document.querySelectorAll('[data-target]');
        this.init();
    }

    init() {
        this.counters.forEach(counter => {
            this.setupCounter(counter);
        });
    }

    setupCounter(counter) {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = parseInt(counter.getAttribute('data-duration')) || 2000;
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(counter, target, duration, prefix, suffix);
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(counter);
    }

    animateCounter(element, target, duration, prefix = '', suffix = '') {
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * easeOut);
            
            element.textContent = prefix + current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.classList.add('count-completed');
            }
        };

        requestAnimationFrame(updateCounter);
    }
}

/* ===== CLASE PARA EFECTOS DE REVEAL ===== */
class RevealEffects {
    constructor() {
        this.revealElements = document.querySelectorAll('[data-reveal]');
        this.init();
    }

    init() {
        this.revealElements.forEach(element => {
            this.setupReveal(element);
        });
    }

    setupReveal(element) {
        const revealType = element.getAttribute('data-reveal') || 'fade';
        const delay = parseInt(element.getAttribute('data-delay')) || 0;
        
        element.style.opacity = '0';
        this.setInitialTransform(element, revealType);
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        this.reveal(element, revealType);
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(element);
    }

    setInitialTransform(element, type) {
        switch (type) {
            case 'slide-up':
                element.style.transform = 'translateY(50px)';
                break;
            case 'slide-down':
                element.style.transform = 'translateY(-50px)';
                break;
            case 'slide-left':
                element.style.transform = 'translateX(50px)';
                break;
            case 'slide-right':
                element.style.transform = 'translateX(-50px)';
                break;
            case 'scale':
                element.style.transform = 'scale(0.8)';
                break;
            case 'rotate':
                element.style.transform = 'rotate(10deg) scale(0.8)';
                break;
        }
    }

    reveal(element, type) {
        element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.opacity = '1';
        element.style.transform = 'none';
        
        element.addEventListener('transitionend', () => {
            element.classList.add('revealed');
        }, { once: true });
    }
}

/* ===== CLASE PARA EFECTOS DE TEXTO ===== */
class TextEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupSplitText();
        this.setupGlitchText();
        this.setupGradientText();
    }

    setupSplitText() {
        document.querySelectorAll('[data-split]').forEach(element => {
            this.splitText(element);
        });
    }

    splitText(element) {
        const text = element.textContent;
        const splitType = element.getAttribute('data-split') || 'chars';
        
        element.innerHTML = '';
        
        if (splitType === 'chars') {
            text.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.style.animationDelay = `${index * 0.05}s`;
                element.appendChild(span);
            });
        } else if (splitType === 'words') {
            text.split(' ').forEach((word, index) => {
                const span = document.createElement('span');
                span.textContent = word;
                span.style.display = 'inline-block';
                span.style.marginRight = '0.25em';
                span.style.animationDelay = `${index * 0.1}s`;
                element.appendChild(span);
            });
        }
    }

    setupGlitchText() {
        document.querySelectorAll('.glitch-text').forEach(element => {
            this.createGlitchEffect(element);
        });
    }

    createGlitchEffect(element) {
        const text = element.textContent;
        
        setInterval(() => {
            if (Math.random() > 0.95) {
                element.textContent = this.glitchText(text);
                setTimeout(() => {
                    element.textContent = text;
                }, 100);
            }
        }, 2000);
    }

    glitchText(text) {
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        return text.split('').map(char => {
            if (Math.random() > 0.8 && char !== ' ') {
                return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }
            return char;
        }).join('');
    }

    setupGradientText() {
        document.querySelectorAll('.gradient-text').forEach(element => {
            element.style.background = 'var(--gradient-primary)';
            element.style.webkitBackgroundClip = 'text';
            element.style.webkitTextFillColor = 'transparent';
            element.style.backgroundClip = 'text';
        });
    }
}

// Inicialización automática cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar preferencias de animación
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
        return;
    }

    // Inicializar sistemas de animación
    window.scrollAnimations = new ScrollAnimations();
    window.animatedCounters = new AnimatedCounters();
    window.revealEffects = new RevealEffects();
    window.textEffects = new TextEffects();
});

// Exportar clases para uso global
window.ScrollAnimations = ScrollAnimations;
window.AnimatedCounters = AnimatedCounters;
window.RevealEffects = RevealEffects;
window.TextEffects = TextEffects;