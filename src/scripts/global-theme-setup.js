/* ===== CONFIGURACIÓN GLOBAL DE TEMA ===== */
// Este script configura el tema globalmente para todas las páginas

(function() {
    'use strict';
    
    // Función para aplicar tema global
    function setupGlobalTheme() {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Usar tema guardado o preferencia del sistema
        const themeToApply = storedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        // Aplicar tema al documento
        if (document.documentElement) {
            document.documentElement.setAttribute('data-theme', themeToApply);
        }
        
        // Agregar clase al body para transiciones
        if (document.body) {
            document.body.classList.add('theme-loaded');
        }
        
        // Debug
        console.log('🎨 Global theme setup:', themeToApply);
    }
    
    // Función para cambiar tema globalmente
    window.changeGlobalTheme = function(newTheme) {
        localStorage.setItem('theme', newTheme);
        if (document.documentElement) {
            document.documentElement.setAttribute('data-theme', newTheme);
        }
        
        // Disparar evento para que otras páginas sepan del cambio
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
        
        console.log('🎨 Global theme changed to:', newTheme);
    };
    
    // Función para obtener tema actual
    window.getCurrentTheme = function() {
        return localStorage.getItem('theme') || 'dark';
    };
    
    // Función para alternar tema
    window.toggleGlobalTheme = function() {
        const currentTheme = window.getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        window.changeGlobalTheme(newTheme);
        return newTheme;
    };
    
    // Aplicar tema inmediatamente
    setupGlobalTheme();
    
    // Escuchar cambios en localStorage (sincronización entre pestañas)
    window.addEventListener('storage', function(e) {
        if (e.key === 'theme') {
            setupGlobalTheme();
        }
    });
    
    // Escuchar eventos de cambio de tema
    window.addEventListener('themeChanged', function(e) {
        if (document.documentElement) {
            document.documentElement.setAttribute('data-theme', e.detail.theme);
        }
    });
    
    // Aplicar también cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupGlobalTheme);
    }
    
})();
