/* ===== SISTEMA DE PARTÍCULAS ===== */

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        this.isActive = true;
        
        // Configuración
        this.config = {
            particleCount: 50,
            particleSpeed: 0.5,
            particleSize: { min: 2, max: 6 },
            colors: ['#44E5FF', '#0077A6', '#22C55E'],
            mouseInfluence: 100,
            maxDistance: 150
        };
        
        this.init();
    }

    init() {
        // Verificar si hay soporte para animaciones
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.config.particleCount = 10;
            this.config.particleSpeed = 0.1;
        }
        
        this.createParticles();
        this.bindEvents();
        this.animate();
        this.handleVisibilityChange();
    }

    createParticles() {
        // Limpiar partículas existentes
        this.container.innerHTML = '';
        this.particles = [];
        
        for (let i = 0; i < this.config.particleCount; i++) {
            const particle = this.createParticle();
            this.container.appendChild(particle.element);
            this.particles.push(particle);
        }
    }

    createParticle() {
        const element = document.createElement('div');
        element.className = 'particle';
        
        // Propiedades aleatorias
        const size = this.random(this.config.particleSize.min, this.config.particleSize.max);
        const color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
        const x = this.random(0, this.container.clientWidth);
        const y = this.random(0, this.container.clientHeight);
        
        // Estilos
        element.style.width = size + 'px';
        element.style.height = size + 'px';
        element.style.backgroundColor = color;
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.position = 'absolute';
        element.style.borderRadius = '50%';
        element.style.pointerEvents = 'none';
        element.style.opacity = this.random(0.3, 0.8);
        
        // Agregar animación CSS personalizada
        const animationDuration = this.random(10, 30) + 's';
        const animationDelay = this.random(0, 5) + 's';
        element.style.animationDelay = animationDelay;
        element.style.animationDuration = animationDuration;
        
        return {
            element,
            x,
            y,
            size,
            color,
            vx: this.random(-this.config.particleSpeed, this.config.particleSpeed),
            vy: this.random(-this.config.particleSpeed, this.config.particleSpeed),
            originalX: x,
            originalY: y
        };
    }

    bindEvents() {
        // Eventos del mouse
        document.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        // Redimensionar ventana
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Cambio de visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Eventos táctiles para móviles
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = e.touches[0].clientX - rect.left;
                this.mouse.y = e.touches[0].clientY - rect.top;
            }
        });
    }

    animate() {
        if (!this.isActive) return;
        
        this.particles.forEach(particle => {
            this.updateParticle(particle);
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateParticle(particle) {
        // Movimiento básico
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Rebote en los bordes
        if (particle.x <= 0 || particle.x >= this.container.clientWidth) {
            particle.vx *= -1;
        }
        if (particle.y <= 0 || particle.y >= this.container.clientHeight) {
            particle.vy *= -1;
        }
        
        // Mantener dentro de los límites
        particle.x = Math.max(0, Math.min(this.container.clientWidth, particle.x));
        particle.y = Math.max(0, Math.min(this.container.clientHeight, particle.y));
        
        // Interacción con el mouse
        const deltaX = this.mouse.x - particle.x;
        const deltaY = this.mouse.y - particle.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < this.config.mouseInfluence) {
            const force = (this.config.mouseInfluence - distance) / this.config.mouseInfluence;
            const angle = Math.atan2(deltaY, deltaX);
            
            particle.x -= Math.cos(angle) * force * 2;
            particle.y -= Math.sin(angle) * force * 2;
        } else {
            // Regreso suave a la posición original
            const returnForce = 0.01;
            particle.x += (particle.originalX - particle.x) * returnForce;
            particle.y += (particle.originalY - particle.y) * returnForce;
        }
        
        // Actualizar posición del elemento
        particle.element.style.transform = `translate(${particle.x - particle.originalX}px, ${particle.y - particle.originalY}px)`;
        
        // Conexiones entre partículas cercanas
        this.drawConnections(particle);
    }

    drawConnections(particle) {
        this.particles.forEach(otherParticle => {
            if (particle === otherParticle) return;
            
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.config.maxDistance) {
                this.createConnection(particle, otherParticle, distance);
            }
        });
    }

    createConnection(particle1, particle2, distance) {
        // Crear línea de conexión temporal (usando canvas sería más eficiente)
        const line = document.createElement('div');
        line.className = 'particle-connection';
        line.style.position = 'absolute';
        line.style.background = `rgba(68, 229, 255, ${0.3 * (1 - distance / this.config.maxDistance)})`;
        line.style.height = '1px';
        line.style.pointerEvents = 'none';
        line.style.zIndex = '0';
        
        const angle = Math.atan2(particle2.y - particle1.y, particle2.x - particle1.x);
        line.style.width = distance + 'px';
        line.style.left = particle1.x + 'px';
        line.style.top = particle1.y + 'px';
        line.style.transform = `rotate(${angle}rad)`;
        line.style.transformOrigin = '0 0';
        
        this.container.appendChild(line);
        
        // Eliminar la línea después de un frame
        requestAnimationFrame(() => {
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        });
    }

    handleResize() {
        // Reposicionar partículas si la ventana cambia de tamaño
        this.particles.forEach(particle => {
            particle.x = Math.min(particle.x, this.container.clientWidth);
            particle.y = Math.min(particle.y, this.container.clientHeight);
            particle.originalX = Math.min(particle.originalX, this.container.clientWidth);
            particle.originalY = Math.min(particle.originalY, this.container.clientHeight);
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.pause();
        } else {
            this.resume();
        }
    }

    pause() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    resume() {
        this.isActive = true;
        this.animate();
    }

    destroy() {
        this.pause();
        this.container.innerHTML = '';
        this.particles = [];
        
        // Remover eventos
        document.removeEventListener('mousemove', this.bindEvents);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    // Utilidades
    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Configuración dinámica
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.createParticles();
    }

    // Métodos públicos para control
    setParticleCount(count) {
        this.config.particleCount = count;
        this.createParticles();
    }

    setSpeed(speed) {
        this.config.particleSpeed = speed;
        this.particles.forEach(particle => {
            particle.vx = this.random(-speed, speed);
            particle.vy = this.random(-speed, speed);
        });
    }
}

// Clase para partículas optimizada para móviles
class MobileParticleSystem extends ParticleSystem {
    constructor(container) {
        super(container);
        
        // Configuración optimizada para móviles
        this.config = {
            ...this.config,
            particleCount: 20,
            particleSpeed: 0.3,
            mouseInfluence: 80,
            maxDistance: 100
        };
        
        this.init();
    }

    // Desactivar conexiones en móviles para mejor performance
    drawConnections() {
        // No hacer nada - desactivado para móviles
    }
}

// Detección de dispositivo y inicialización automática
function initializeParticleSystem() {
    const particleContainers = document.querySelectorAll('.particles-container');
    
    particleContainers.forEach(container => {
        const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            new MobileParticleSystem(container);
        } else {
            new ParticleSystem(container);
        }
    });
}

// Exportar para uso global
window.ParticleSystem = ParticleSystem;
window.MobileParticleSystem = MobileParticleSystem;
window.initializeParticleSystem = initializeParticleSystem;