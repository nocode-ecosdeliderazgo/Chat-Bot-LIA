// ===== SISTEMA DE ESTADÍSTICAS - PREPARADO PARA GRAFANA =====

class GrafanaStatisticsManager {
    constructor() {
        this.init();
    }

    init() {
        this.initializeParticles();
        this.setupAnimations();
        this.bindEvents();
        this.prepareGrafanaContainers();
    }

    initializeParticles() {
        const particlesContainer = document.querySelector('.particles-container');
        if (particlesContainer && typeof ParticleSystem !== 'undefined') {
            new ParticleSystem(particlesContainer);
        }
    }

    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    bindEvents() {
        // Menú de perfil
        window.toggleProfileMenu = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const menu = document.getElementById('profileMenu');
            menu.style.display = (menu.style.display === 'block' ? 'none' : 'block');
        };

        document.addEventListener('click', (e) => {
            const menu = document.getElementById('profileMenu');
            const btn = document.querySelector('.profile-btn');
            if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
                menu.style.display = 'none';
            }
        });
    }

    prepareGrafanaContainers() {
        // TODO: Preparar contenedores para iframes de Grafana
        // - Configurar URLs de Grafana
        // - Manejar autenticación
        // - Configurar variables de usuario
        // - Implementar carga dinámica de paneles
        
        console.log('Contenedores de Grafana preparados');
        console.log('IDs disponibles: grafanaIndice, grafanaRadar, grafanaSubdominios');
    }

    // TODO: Implementar métodos para Grafana
    // - loadGrafanaPanel(panelId, url, variables)
    // - updateGrafanaVariables(userId, profile)
    // - handleGrafanaAuthentication()
    // - refreshGrafanaPanels()
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    new GrafanaStatisticsManager();
});
