/* ===== SISTEMA DE CARRUSEL DE TESTIMONIOS ===== */

class TestimonialsCarousel {
    constructor(container) {
        this.container = container || document.querySelector('.testimonials-carousel');
        if (!this.container) return;
        
        this.currentSlide = 0;
        this.slides = this.container.querySelectorAll('.testimonial-card');
        this.totalSlides = this.slides.length;
        this.isPlaying = true;
        this.autoPlayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.config = {
            autoPlay: true,
            autoPlayDelay: 5000,
            transitionDuration: 500,
            swipeThreshold: 50
        };
        
        this.init();
    }

    init() {
        if (this.totalSlides === 0) return;
        
        this.createIndicators();
        this.bindEvents();
        this.showSlide(0);
        
        if (this.config.autoPlay) {
            this.startAutoPlay();
        }
    }

    createIndicators() {
        // Crear contenedor de indicadores
        this.indicatorsContainer = document.createElement('div');
        this.indicatorsContainer.className = 'carousel-indicators';
        
        // Crear indicadores
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('aria-label', `Ir a testimonial ${i + 1}`);
            indicator.addEventListener('click', () => {
                this.goToSlide(i);
            });
            
            this.indicatorsContainer.appendChild(indicator);
        }
        
        // Agregar indicadores al DOM
        this.container.appendChild(this.indicatorsContainer);
        
        // Agregar estilos CSS dinámicamente
        this.addIndicatorStyles();
    }

    addIndicatorStyles() {
        if (document.querySelector('#carousel-indicators-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'carousel-indicators-styles';
        style.textContent = `
            .carousel-indicators {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-top: 2rem;
            }
            
            .carousel-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid rgba(68, 229, 255, 0.3);
                background: transparent;
                cursor: pointer;
                transition: all 0.3s ease;
                padding: 0;
            }
            
            .carousel-indicator:hover {
                border-color: var(--course-primary);
                background: rgba(68, 229, 255, 0.2);
            }
            
            .carousel-indicator.active {
                background: var(--course-primary);
                border-color: var(--course-primary);
                box-shadow: 0 0 12px rgba(68, 229, 255, 0.5);
            }
        `;
        
        document.head.appendChild(style);
    }

    bindEvents() {
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Eventos táctiles
        this.container.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        });

        this.container.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        });

        // Pausar en hover
        this.container.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });

        this.container.addEventListener('mouseleave', () => {
            if (this.config.autoPlay) {
                this.startAutoPlay();
            }
        });

        // Pausar cuando la pestaña no está visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else if (this.config.autoPlay && this.isPlaying) {
                this.startAutoPlay();
            }
        });

        // Redimensionar ventana
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.pauseAutoPlay();
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
        
        if (this.config.autoPlay) {
            this.startAutoPlay();
        }
    }

    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;
        
        if (Math.abs(swipeDistance) > this.config.swipeThreshold) {
            if (swipeDistance > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
        }
    }

    showSlide(index) {
        // Validar índice
        if (index < 0) index = this.totalSlides - 1;
        if (index >= this.totalSlides) index = 0;
        
        this.currentSlide = index;
        
        // Ocultar todas las slides
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active');
            slide.style.opacity = '0';
            slide.style.transform = 'translateY(20px)';
            slide.setAttribute('aria-hidden', 'true');
            
            // Remover de la navegación por teclado
            const focusableElements = slide.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            focusableElements.forEach(el => {
                el.setAttribute('tabindex', '-1');
            });
        });
        
        // Mostrar slide actual
        const activeSlide = this.slides[index];
        activeSlide.classList.add('active');
        activeSlide.style.opacity = '1';
        activeSlide.style.transform = 'translateY(0)';
        activeSlide.setAttribute('aria-hidden', 'false');
        
        // Habilitar navegación por teclado en slide activa
        const focusableElements = activeSlide.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusableElements.forEach(el => {
            el.removeAttribute('tabindex');
        });
        
        // Actualizar indicadores
        this.updateIndicators();
        
        // Lazy loading de imágenes
        this.loadSlideImages(activeSlide);
        
        // Trigger evento personalizado
        this.container.dispatchEvent(new CustomEvent('slideChange', {
            detail: { currentSlide: index, totalSlides: this.totalSlides }
        }));
    }

    updateIndicators() {
        const indicators = this.indicatorsContainer?.querySelectorAll('.carousel-indicator');
        if (!indicators) return;
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
            indicator.setAttribute('aria-pressed', index === this.currentSlide);
        });
    }

    loadSlideImages(slide) {
        const lazyImages = slide.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        });
    }

    nextSlide() {
        this.goToSlide(this.currentSlide + 1);
    }

    previousSlide() {
        this.goToSlide(this.currentSlide - 1);
    }

    goToSlide(index) {
        this.showSlide(index);
        
        // Reiniciar autoplay
        if (this.config.autoPlay && this.isPlaying) {
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.isPlaying = true;
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.config.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    pauseAutoPlay() {
        this.isPlaying = false;
        this.stopAutoPlay();
    }

    resumeAutoPlay() {
        if (this.config.autoPlay) {
            this.startAutoPlay();
        }
    }

    handleResize() {
        // Reajustar cualquier cálculo dependiente del tamaño
        // En este caso, no es necesario, pero se deja para extensibilidad
    }

    // Métodos públicos para control externo
    play() {
        this.config.autoPlay = true;
        this.startAutoPlay();
    }

    pause() {
        this.config.autoPlay = false;
        this.pauseAutoPlay();
    }

    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.totalSlides;
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.config.autoPlay && !this.isPlaying) {
            this.startAutoPlay();
        } else if (!this.config.autoPlay && this.isPlaying) {
            this.pauseAutoPlay();
        }
    }

    destroy() {
        this.stopAutoPlay();
        
        // Remover indicadores
        if (this.indicatorsContainer) {
            this.indicatorsContainer.remove();
        }
        
        // Limpiar estilos
        const style = document.querySelector('#carousel-indicators-styles');
        if (style) {
            style.remove();
        }
        
        // Mostrar todas las slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.opacity = '';
            slide.style.transform = '';
            slide.removeAttribute('aria-hidden');
        });
        
        // Remover eventos (esto es simplificado, en una implementación real
        // deberías guardar referencias a los event listeners)
    }
}

/* ===== CARRUSEL GENÉRICO REUTILIZABLE ===== */
class GenericCarousel {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) return;
        
        this.config = {
            itemsPerView: 1,
            itemsPerViewTablet: 2,
            itemsPerViewDesktop: 3,
            spaceBetween: 20,
            autoPlay: false,
            autoPlayDelay: 3000,
            loop: true,
            navigation: true,
            pagination: true,
            breakpoints: {
                768: { itemsPerView: 2 },
                1024: { itemsPerView: 3 }
            },
            ...options
        };
        
        this.init();
    }

    init() {
        this.setupCarousel();
        this.createNavigation();
        this.createPagination();
        this.bindEvents();
        this.updateView();
    }

    setupCarousel() {
        this.slides = Array.from(this.container.children);
        this.currentIndex = 0;
        this.itemsPerView = this.getItemsPerView();
        
        // Envolver slides en un contenedor
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'carousel-wrapper';
        this.wrapper.style.cssText = `
            display: flex;
            transition: transform 0.3s ease;
            gap: ${this.config.spaceBetween}px;
        `;
        
        this.slides.forEach(slide => {
            this.wrapper.appendChild(slide);
        });
        
        this.container.appendChild(this.wrapper);
    }

    createNavigation() {
        if (!this.config.navigation) return;
        
        this.prevButton = document.createElement('button');
        this.prevButton.className = 'carousel-prev';
        this.prevButton.innerHTML = '‹';
        this.prevButton.addEventListener('click', () => this.prev());
        
        this.nextButton = document.createElement('button');
        this.nextButton.className = 'carousel-next';
        this.nextButton.innerHTML = '›';
        this.nextButton.addEventListener('click', () => this.next());
        
        this.container.appendChild(this.prevButton);
        this.container.appendChild(this.nextButton);
    }

    createPagination() {
        if (!this.config.pagination) return;
        
        this.pagination = document.createElement('div');
        this.pagination.className = 'carousel-pagination';
        
        const totalPages = Math.ceil(this.slides.length / this.itemsPerView);
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.addEventListener('click', () => this.goToSlide(i * this.itemsPerView));
            this.pagination.appendChild(dot);
        }
        
        this.container.appendChild(this.pagination);
    }

    getItemsPerView() {
        const width = window.innerWidth;
        
        for (const [breakpoint, config] of Object.entries(this.config.breakpoints)) {
            if (width >= parseInt(breakpoint)) {
                return config.itemsPerView || this.config.itemsPerView;
            }
        }
        
        return this.config.itemsPerView;
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex -= this.itemsPerView;
        } else if (this.config.loop) {
            this.currentIndex = Math.max(0, this.slides.length - this.itemsPerView);
        }
        this.updateView();
    }

    next() {
        if (this.currentIndex < this.slides.length - this.itemsPerView) {
            this.currentIndex += this.itemsPerView;
        } else if (this.config.loop) {
            this.currentIndex = 0;
        }
        this.updateView();
    }

    goToSlide(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.slides.length - this.itemsPerView));
        this.updateView();
    }

    updateView() {
        const slideWidth = (this.container.offsetWidth / this.itemsPerView) - 
                          (this.config.spaceBetween * (this.itemsPerView - 1) / this.itemsPerView);
        
        this.slides.forEach((slide, index) => {
            slide.style.minWidth = slideWidth + 'px';
            slide.style.flex = '0 0 auto';
        });
        
        const translateX = -this.currentIndex * (slideWidth + this.config.spaceBetween);
        this.wrapper.style.transform = `translateX(${translateX}px)`;
        
        this.updatePagination();
        this.updateNavigation();
    }

    updatePagination() {
        if (!this.pagination) return;
        
        const dots = this.pagination.querySelectorAll('.carousel-dot');
        const currentPage = Math.floor(this.currentIndex / this.itemsPerView);
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });
    }

    updateNavigation() {
        if (this.prevButton) {
            this.prevButton.disabled = !this.config.loop && this.currentIndex === 0;
        }
        
        if (this.nextButton) {
            this.nextButton.disabled = !this.config.loop && 
                this.currentIndex >= this.slides.length - this.itemsPerView;
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.itemsPerView = this.getItemsPerView();
            this.updateView();
        });
    }
}

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar carrusel de testimonios
    const testimonialsCarousel = document.querySelector('.testimonials-carousel');
    if (testimonialsCarousel) {
        window.testimonialsCarousel = new TestimonialsCarousel(testimonialsCarousel);
    }
    
    // Inicializar carruseles genéricos
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
        const options = JSON.parse(carousel.getAttribute('data-carousel') || '{}');
        new GenericCarousel(carousel, options);
    });
});

// Exportar para uso global
window.TestimonialsCarousel = TestimonialsCarousel;
window.GenericCarousel = GenericCarousel;