// Función global para cambiar el tema desde el menú
function toggleTheme() {
    // Usar la función global si está disponible
    if (window.toggleGlobalTheme) {
        const newTheme = window.toggleGlobalTheme();
        
        // Agregar efecto de click
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.classList.add('clicked');
            setTimeout(() => {
                themeToggle.classList.remove('clicked');
            }, 200);
        }
        
        // console.log('🎨 Tema cambiado a:', newTheme);
        return;
    }
    
    // Fallback para páginas sin el script global
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Aplicar el nuevo tema
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Agregar efecto de click
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.classList.add('clicked');
        setTimeout(() => {
            themeToggle.classList.remove('clicked');
        }, 200);
    }
    
    // console.log('🎨 Tema cambiado a:', newTheme);
}

// Hacer la función disponible globalmente
window.toggleTheme = toggleTheme;
