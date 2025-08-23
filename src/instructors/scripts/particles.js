// SISTEMA DE PARTÍCULAS PARA EL PANEL DE INSTRUCTORES
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('bgParticles');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.animate();
        
        // Escuchar cambios de tamaño de ventana
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                color: Math.random() > 0.5 ? '#44E5FF' : '#0077A6',
                pulse: Math.random() * Math.PI * 2
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((particle, index) => {
            // Actualizar posición
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.pulse += 0.02;
            
            // Efecto de pulso
            const pulseSize = Math.sin(particle.pulse) * 0.5 + 1;
            
            // Rebotar en los bordes
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }
            
            // Mantener partículas dentro del canvas
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            
            // Dibujar partícula
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();
            
            // Efecto de glow
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Conectar partículas cercanas
            this.connectParticles(particle, index);
        });
        
        this.ctx.globalAlpha = 1;
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    connectParticles(currentParticle, currentIndex) {
        this.particles.forEach((particle, index) => {
            if (index === currentIndex) return;
            
            const distance = Math.sqrt(
                Math.pow(currentParticle.x - particle.x, 2) + 
                Math.pow(currentParticle.y - particle.y, 2)
            );
            
            if (distance < 150) {
                const opacity = (150 - distance) / 150 * 0.3;
                this.ctx.beginPath();
                this.ctx.moveTo(currentParticle.x, currentParticle.y);
                this.ctx.lineTo(particle.x, particle.y);
                this.ctx.strokeStyle = '#44E5FF';
                this.ctx.globalAlpha = opacity;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        });
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Inicializar sistema de partículas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const particleSystem = new ParticleSystem();
    
    // Limpiar al salir de la página
    window.addEventListener('beforeunload', () => {
        particleSystem.destroy();
    });
});

// Efectos adicionales para las partículas CSS
document.addEventListener('DOMContentLoaded', () => {
    // Animar partículas CSS existentes
    const cssParticles = document.querySelectorAll('.particle');
    
    cssParticles.forEach((particle, index) => {
        // Añadir efectos de hover
        particle.addEventListener('mouseenter', () => {
            particle.style.transform = 'scale(2) rotate(180deg)';
            particle.style.filter = 'brightness(1.5)';
        });
        
        particle.addEventListener('mouseleave', () => {
            particle.style.transform = '';
            particle.style.filter = '';
        });
        
        // Efecto de clic
        particle.addEventListener('click', () => {
            particle.style.animation = 'none';
            particle.offsetHeight; // Trigger reflow
            particle.style.animation = 'float 6s ease-in-out infinite';
            
            // Crear efecto de explosión
            createExplosion(particle);
        });
    });
});

function createExplosion(particle) {
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.left = particle.offsetLeft + 'px';
    explosion.style.top = particle.offsetTop + 'px';
    explosion.style.width = '20px';
    explosion.style.height = '20px';
    explosion.style.background = 'radial-gradient(circle, #44E5FF, transparent)';
    explosion.style.borderRadius = '50%';
    explosion.style.pointerEvents = 'none';
    explosion.style.zIndex = '1000';
    explosion.style.animation = 'explosion 0.6s ease-out forwards';
    
    document.body.appendChild(explosion);
    
    setTimeout(() => {
        document.body.removeChild(explosion);
    }, 600);
}

// Añadir keyframe para explosión
const style = document.createElement('style');
style.textContent = `
    @keyframes explosion {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        50% {
            transform: scale(3);
            opacity: 0.8;
        }
        100% {
            transform: scale(5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);