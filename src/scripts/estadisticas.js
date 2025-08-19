// ===== SISTEMA DE ESTADÍSTICAS - INTEGRACIÓN CON GRAFANA SNAPSHOTS =====

class GrafanaStatisticsManager {
    constructor() {
        this.iframes = {
            grafanaIndice: null,
            grafanaRadar: null,
            grafanaSubdominios: null
        };
        this.init();
    }

    init() {
        this.initializeParticles();
        this.setupAnimations();
        this.bindEvents();
        this.prepareGrafanaContainers();
        this.setupIframeLoading();
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
            if (menu) {
                menu.style.display = (menu.style.display === 'block' ? 'none' : 'block');
            }
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
        // Añadir orbes decorativos a cada panel
        document.querySelectorAll('.grafana-container').forEach(panel => {
            for (let i = 0; i < 3; i++) {
                const orb = document.createElement('div');
                orb.className = 'orb' + (i === 0 ? ' large' : (i === 1 ? '' : ' small'));
                orb.style.left = `${10 + Math.random() * 70}%`;
                orb.style.top = `${10 + Math.random() * 70}%`;
                panel.appendChild(orb);
            }
        });

        console.log('Contenedores de Grafana preparados con snapshots');
    }

    setupIframeLoading() {
        // Configurar cada iframe con manejo de carga
        Object.keys(this.iframes).forEach(iframeId => {
            const iframe = document.getElementById(iframeId);
            const container = iframe?.closest('.grafana-frame-container');
            
            if (iframe && container) {
                this.iframes[iframeId] = iframe;
                
                // Añadir clase de carga
                container.classList.add('loading');
                
                // Manejar evento de carga exitosa
                iframe.addEventListener('load', () => {
                    container.classList.remove('loading');
                    console.log(`Panel ${iframeId} cargado exitosamente`);
                });
                
                // Manejar errores de carga
                iframe.addEventListener('error', () => {
                    container.classList.remove('loading');
                    this.showErrorMessage(container, `Error al cargar ${iframeId}`);
                    console.error(`Error al cargar panel ${iframeId}`);
                });
                
                // Timeout para detectar carga lenta
                setTimeout(() => {
                    if (container.classList.contains('loading')) {
                        console.warn(`Panel ${iframeId} está tardando en cargar`);
                    }
                }, 10000); // 10 segundos
            }
        });
    }

    showErrorMessage(container, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'grafana-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class='bx bx-error-circle'></i>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">Intentar de nuevo</button>
            </div>
        `;
        container.appendChild(errorDiv);
    }

    // Método para recargar un panel específico
    reloadPanel(iframeId) {
        const iframe = this.iframes[iframeId];
        if (iframe) {
            const container = iframe.closest('.grafana-frame-container');
            container.classList.add('loading');
            iframe.src = iframe.src; // Forzar recarga
        }
    }

    // Método para recargar todos los paneles
    reloadAllPanels() {
        Object.keys(this.iframes).forEach(iframeId => {
            this.reloadPanel(iframeId);
        });
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    new GrafanaStatisticsManager();
});
