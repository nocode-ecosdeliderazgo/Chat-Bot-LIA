/**
 * Script para forzar que el sidebar permanezca completamente fijo
 * Elimina cualquier movimiento o animación del sidebar
 */

(function() {
    'use strict';
    
    // Función para forzar la inmovilidad del sidebar
    function forceSidebarFixed() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        // Aplicar estilos directamente al elemento
        sidebar.style.position = 'fixed';
        sidebar.style.top = '0';
        sidebar.style.left = '0';
        sidebar.style.bottom = '0';
        sidebar.style.width = '256px';
        sidebar.style.height = '100vh';
        sidebar.style.overflow = 'hidden';
        sidebar.style.zIndex = '50';
        sidebar.style.transform = 'none';
        sidebar.style.transition = 'none';
        sidebar.style.animation = 'none';
        sidebar.style.translate = 'none';
        sidebar.style.rotate = 'none';
        sidebar.style.scale = 'none';
        sidebar.style.backfaceVisibility = 'hidden';
        sidebar.style.perspective = '1000px';
        
        // Forzar el contenido principal
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.marginLeft = '256px';
            mainContent.style.position = 'relative';
            mainContent.style.zIndex = '1';
        }
        
        console.log('Sidebar fijado completamente');
    }
    
    // Aplicar inmediatamente cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceSidebarFixed);
    } else {
        forceSidebarFixed();
    }
    
    // Aplicar también después de un pequeño delay para asegurar que se aplique
    setTimeout(forceSidebarFixed, 100);
    setTimeout(forceSidebarFixed, 500);
    setTimeout(forceSidebarFixed, 1000);
    
    // Observar cambios en el DOM para mantener la fijación
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    // Re-aplicar estilos si se modifican
                    sidebar.style.position = 'fixed';
                    sidebar.style.top = '0';
                    sidebar.style.left = '0';
                    sidebar.style.transform = 'none';
                    sidebar.style.transition = 'none';
                    sidebar.style.animation = 'none';
                }
            }
        });
    });
    
    // Iniciar observación cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
            }
        });
    } else {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
        }
    }
    
    // Prevenir scroll en el sidebar
    document.addEventListener('scroll', function() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.transform = 'none';
            sidebar.style.top = '0';
            sidebar.style.left = '0';
        }
    }, { passive: false });
    
})();
