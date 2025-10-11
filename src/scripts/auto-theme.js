/* ===== APLICACIÓN AUTOMÁTICA DE TEMA ===== */
// Este script se ejecuta inmediatamente para aplicar el tema antes de que se cargue el contenido

(function() {
    'use strict';
    
    // Función para aplicar tema inmediatamente
    function applyStoredTheme() {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Usar tema guardado o preferencia del sistema
        const themeToApply = storedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        // Aplicar tema al documento
        document.documentElement.setAttribute('data-theme', themeToApply);
        
        // Debug
        // console.log('🎨 Auto-theme aplicado:', themeToApply);
        // console.log('🎨 Tema guardado:', storedTheme);
        // console.log('🎨 Preferencia del sistema:', systemPrefersDark ? 'dark' : 'light');
    }
    
    // Aplicar tema inmediatamente
    applyStoredTheme();
    
    // También aplicar cuando el DOM esté listo (por si acaso)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyStoredTheme);
    } else {
        applyStoredTheme();
    }
    
    // Escuchar cambios en localStorage (si se cambia el tema en otra pestaña)
    window.addEventListener('storage', function(e) {
        if (e.key === 'theme') {
            applyStoredTheme();
        }
    });
    
})();
