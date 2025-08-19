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

        document.querySelectorAll('.animate-on-scroll, .grafana-container').forEach(el => {
            observer.observe(el);
        });

        // Pequeño tilt interactivo sobre los paneles
        document.querySelectorAll('.grafana-container').forEach(panel => {
            panel.classList.add('tilt');
            const handleMove = (e) => {
                const rect = panel.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                panel.style.transform = `rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg) translateY(-6px)`;
            };
            const reset = () => { panel.style.transform = ''; };
            panel.addEventListener('mousemove', handleMove);
            panel.addEventListener('mouseleave', reset);
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
        
        // Añadir orbes decorativos a cada panel
        document.querySelectorAll('.grafana-container').forEach(panel => {
            for (let i=0;i<3;i++){
                const orb = document.createElement('div');
                orb.className = 'orb' + (i===0 ? ' large' : (i===1 ? '' : ' small'));
                orb.style.left = `${10 + Math.random()*70}%`;
                orb.style.top = `${10 + Math.random()*70}%`;
                panel.appendChild(orb);
            }
        });

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
