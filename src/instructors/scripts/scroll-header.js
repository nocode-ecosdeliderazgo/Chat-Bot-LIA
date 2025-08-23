/**
 * Control de Header Sticky con Detección de Dirección de Scroll
 * 
 * Funcionalidades:
 * - Header se oculta al hacer scroll hacia abajo (después de 80px)
 * - Header reaparece al hacer scroll hacia arriba
 * - Transiciones suaves sin saltos de layout
 * - Prevención de parpadeos
 */

class ScrollHeaderController {
    constructor() {
        this.header = document.querySelector('.content-header');
        this.lastScrollY = window.scrollY;
        this.scrollThreshold = 80; // Píxeles antes de ocultar
        this.isHeaderHidden = false;
        this.scrollDirection = 'up';
        this.ticking = false;
        
        this.init();
    }
    
    init() {
        if (!this.header) {
            console.warn('Header no encontrado');
            return;
        }
        
        // Event listeners
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
        
        // Inicializar estado
        this.updateHeaderState();
    }
    
    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateHeaderState();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }
    
    handleResize() {
        // Recalcular en resize si es necesario
        this.updateHeaderState();
    }
    
    updateHeaderState() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - this.lastScrollY;
        
        // Determinar dirección del scroll
        if (Math.abs(scrollDelta) > 5) { // Umbral para evitar micro-movimientos
            this.scrollDirection = scrollDelta > 0 ? 'down' : 'up';
        }
        
        // Lógica de visibilidad del header
        if (currentScrollY > this.scrollThreshold) {
            if (this.scrollDirection === 'down' && !this.isHeaderHidden) {
                this.hideHeader();
            } else if (this.scrollDirection === 'up' && this.isHeaderHidden) {
                this.showHeader();
            }
        } else {
            // Siempre mostrar si estamos cerca del top
            if (this.isHeaderHidden) {
                this.showHeader();
            }
        }
        
        this.lastScrollY = currentScrollY;
    }
    
    hideHeader() {
        if (!this.isHeaderHidden) {
            this.header.classList.add('hide');
            this.isHeaderHidden = true;
        }
    }
    
    showHeader() {
        if (this.isHeaderHidden) {
            this.header.classList.remove('hide');
            this.isHeaderHidden = false;
        }
    }
    
    // Método público para forzar mostrar/ocultar
    setHeaderVisibility(visible) {
        if (visible) {
            this.showHeader();
        } else {
            this.hideHeader();
        }
    }
    
    // Método para limpiar event listeners
    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global para acceso desde consola si es necesario
    window.scrollHeaderController = new ScrollHeaderController();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollHeaderController;
}
