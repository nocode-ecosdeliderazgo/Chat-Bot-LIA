// Sistema de partículas específico para email-verification.html
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de partículas para email-verification.html');
    
    const canvas = document.getElementById('bgParticles');
    const particleContainer = document.querySelector('.particles-container');
    
    if (canvas) {
        console.log('✅ Canvas encontrado, inicializando partículas de canvas');
        initCanvasParticles(canvas);
    } else {
        console.error('❌ Canvas no encontrado');
    }
    
    if (particleContainer) {
        console.log('✅ Contenedor de partículas encontrado, inicializando partículas DOM');
        initDOMParticles(particleContainer);
    } else {
        console.error('❌ Contenedor de partículas no encontrado');
    }
});

// Partículas de Canvas optimizadas para verificación
function initCanvasParticles(canvas) {
    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Configuración específica para página de verificación
    const config = {
        particleCount: window.innerWidth < 768 ? 15 : 30, // Menos partículas para no distraer
        connectionDistance: 120,
        mouseInfluence: 100,
        maxConnections: 2 // Menos conexiones para un efecto más sutil
    };
    
    let particles = [];
    let mouse = { x: 0, y: 0 };
    let mouseActive = false;
    
    // Redimensionar canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Clase Partícula
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.3; // Velocidad muy suave
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 1.5 + 0.5; // Partículas más pequeñas
            this.opacity = Math.random() * 0.3 + 0.1; // Más sutiles
            this.color = this.getRandomColor();
            this.originalSize = this.size;
            this.originalOpacity = this.opacity;
            this.connections = 0;
        }
        
        getRandomColor() {
            const colors = [
                'rgba(68, 229, 255, ', // Turquesa principal
                'rgba(0, 119, 166, ',  // Azul profundo
                'rgba(255, 255, 255, ' // Blanco sutil
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            // Movimiento suave
            this.x += this.vx;
            this.y += this.vy;
            
            // Rebote en bordes
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            // Interacción con mouse muy sutil
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.mouseInfluence && mouseActive) {
                const force = (config.mouseInfluence - distance) / config.mouseInfluence;
                // Repulsión muy suave
                this.x -= dx * force * 0.005;
                this.y -= dy * force * 0.005;
                // Efecto de iluminación sutil
                this.size = this.originalSize * (1 + force * 0.8);
                this.opacity = Math.min(0.6, this.originalOpacity + force * 0.4);
            } else {
                // Retorno gradual a estado normal
                this.size = this.originalSize + (this.size - this.originalSize) * 0.98;
                this.opacity = this.originalOpacity + (this.opacity - this.originalOpacity) * 0.98;
            }
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Crear partículas
    function createParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Función de animación
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Actualizar y dibujar partículas
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Dibujar conexiones (más sutiles)
        particles.forEach((particle, i) => {
            particle.connections = 0;
            particles.slice(i + 1).forEach(otherParticle => {
                if (particle.connections >= config.maxConnections) return;
                
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectionDistance) {
                    particle.connections++;
                    otherParticle.connections++;
                    
                    if (otherParticle.connections <= config.maxConnections) {
                        ctx.save();
                        ctx.globalAlpha = 0.2 * (1 - distance / config.connectionDistance);
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = 'rgba(68, 229, 255, 0.3)';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            });
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Event listeners para mouse
    function handleMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouseActive = true;
    }
    
    function handleMouseLeave() {
        mouseActive = false;
    }
    
    // Inicializar
    function init() {
        resizeCanvas();
        createParticles();
        animate();
        
        // Event listeners
        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticles();
        });
        
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
    }
    
    init();
    
    // Limpiar al salir
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
}

// Partículas DOM para efectos adicionales
function initDOMParticles(container) {
    const particleCount = 8;
    
    // Crear partículas DOM
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Estilos aleatorios
        const size = Math.random() * 4 + 2;
        const opacity = Math.random() * 0.3 + 0.1;
        const animationDuration = Math.random() * 10 + 10;
        const animationDelay = Math.random() * 5;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: rgba(68, 229, 255, ${opacity});
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: orbitalMotion ${animationDuration}s linear infinite;
            animation-delay: ${animationDelay}s;
        `;
        
        container.appendChild(particle);
    }
    
    // Agregar partículas adicionales con efectos de flicker
    for (let i = 0; i < 5; i++) {
        const flickerParticle = document.createElement('div');
        flickerParticle.className = 'floating-particle';
        
        const size = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.2 + 0.05;
        const animationDuration = Math.random() * 3 + 2;
        const animationDelay = Math.random() * 2;
        
        flickerParticle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, ${opacity});
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: quantumFlicker ${animationDuration}s ease-in-out infinite;
            animation-delay: ${animationDelay}s;
        `;
        
        container.appendChild(flickerParticle);
    }
}

// Hacer disponible globalmente
window.initEmailVerificationParticles = function() {
    const canvas = document.getElementById('bgParticles');
    const particleContainer = document.querySelector('.particles-container');
    
    if (canvas) initCanvasParticles(canvas);
    if (particleContainer) initDOMParticles(particleContainer);
};
