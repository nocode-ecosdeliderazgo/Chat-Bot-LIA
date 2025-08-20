/* ===== GESTOR DE TEMA CLARO/OSCURO ===== */
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = this.getStoredTheme() || 'dark';
        this.init();
    }

    init() {
        // Aplicar tema guardado al cargar
        this.applyTheme(this.currentTheme);
        
        // Configurar event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Detectar preferencia del sistema
        this.detectSystemPreference();
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    setStoredTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    applyTheme(theme) {
        // Aplicar tema al documento
        document.documentElement.setAttribute('data-theme', theme);
        
        // Guardar en localStorage
        this.setStoredTheme(theme);
        
        // Actualizar estado interno
        this.currentTheme = theme;
        
        // Agregar clase para animación
        document.body.classList.add('theme-transitioning');
        
        // Remover clase después de la transición
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        // Agregar efecto de click
        this.themeToggle.classList.add('clicked');
        setTimeout(() => {
            this.themeToggle.classList.remove('clicked');
        }, 200);
    }

    detectSystemPreference() {
        // Solo aplicar si no hay tema guardado
        if (!this.getStoredTheme()) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? 'dark' : 'light';
            
            // Escuchar cambios en la preferencia del sistema
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.getStoredTheme()) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(newTheme);
                }
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});

// Exportar para uso en otros scripts si es necesario
window.ThemeManager = ThemeManager;
