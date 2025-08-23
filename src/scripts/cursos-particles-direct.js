// Sistema de partículas directo para cursos.html
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de partículas para cursos.html');
    
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

// Partículas de Canvas
function initCanvasParticles(canvas) {
    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Configuración ajustada para menos conexiones y mejor interacción
    const config = {
        particleCount: window.innerWidth < 768 ? 20 : 50, // Reducido para menos conexiones
        connectionDistance: 100, // Reducido para menos conexiones
        mouseInfluence: 80, // Reducido para interacción más precisa
        maxConnections: 3 // Máximo de conexiones por partícula
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
            this.vx = (Math.random() - 0.5) * 0.5; // Velocidad reducida
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1; // Tamaño reducido
            this.opacity = Math.random() * 0.4 + 0.2; // Opacidad reducida
            this.color = this.getRandomColor();
            this.originalSize = this.size;
            this.originalOpacity = this.opacity;
            this.connections = 0; // Contador de conexiones
        }
        
        getRandomColor() {
            const colors = [
                'rgba(68, 229, 255, ',
                'rgba(0, 119, 166, ',
                'rgba(138, 43, 226, '
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            // Movimiento
            this.x += this.vx;
            this.y += this.vy;
            
            // Rebote en bordes
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            // Interacción con mouse mejorada
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.mouseInfluence && mouseActive) {
                const force = (config.mouseInfluence - distance) / config.mouseInfluence;
                // Repulsión más suave
                this.x -= dx * force * 0.01;
                this.y -= dy * force * 0.01;
                // Efecto de iluminación más pronunciado
                this.size = this.originalSize * (1 + force * 1.5);
                this.opacity = Math.min(1, this.originalOpacity + force * 0.8);
            } else {
                // Retorno gradual a estado normal
                this.size = this.originalSize + (this.size - this.originalSize) * 0.95;
                this.opacity = this.originalOpacity + (this.opacity - this.originalOpacity) * 0.95;
            }
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Efecto de resplandor mejorado cuando está cerca del mouse
            if (this.size > this.originalSize * 1.2) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.color + '0.9)';
                ctx.fill();
            }
            
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
    
    // Dibujar conexiones limitadas
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            if (particles[i].connections >= config.maxConnections) continue;
            
            for (let j = i + 1; j < particles.length; j++) {
                if (particles[j].connections >= config.maxConnections) continue;
                
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectionDistance) {
                    const opacity = (config.connectionDistance - distance) / config.connectionDistance * 0.2; // Opacidad reducida
                    ctx.strokeStyle = `rgba(68, 229, 255, ${opacity})`;
                    ctx.lineWidth = 0.5; // Líneas más finas
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    
                    // Incrementar contador de conexiones
                    particles[i].connections++;
                    particles[j].connections++;
                    
                    // Limitar conexiones
                    if (particles[i].connections >= config.maxConnections) break;
                }
            }
        }
        
        // Resetear contadores para el siguiente frame
        particles.forEach(p => p.connections = 0);
    }
    
    // Función de animación
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        drawConnections();
        animationId = requestAnimationFrame(animate);
    }
    
    // Event listeners mejorados - usar document para capturar todos los eventos
    function handleMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouseActive = true;
    }
    
    function handleMouseLeave() {
        mouseActive = false;
    }
    
    function handleResize() {
        resizeCanvas();
        createParticles();
    }
    
    // Inicializar
    resizeCanvas();
    createParticles();
    animate();
    
    // Event listeners en document para capturar todos los eventos del mouse
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    
    console.log('✅ Partículas de canvas inicializadas con interacción mejorada');
}

// Partículas DOM
function initDOMParticles(container) {
    const particleCount = window.innerWidth < 768 ? 10 : 15; // Reducido
    
    function createFloatingParticle() {
        const particle = document.createElement('div');
        particle.className = 'floating-particle cursos-particle';
        
        // Posición aleatoria
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Tamaño aleatorio más pequeño
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Color aleatorio
        const colors = [
            'rgba(68, 229, 255, 0.6)',
            'rgba(0, 119, 166, 0.4)',
            'rgba(138, 43, 226, 0.5)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Animación más lenta
        const duration = Math.random() * 25 + 20;
        const delay = Math.random() * 15;
        particle.style.animation = `cursosOrbitalMotion ${duration}s infinite linear ${delay}s`;
        
        // Efecto de resplandor más sutil
        particle.style.boxShadow = '0 0 6px currentColor';
        particle.style.willChange = 'transform';
        
        return particle;
    }
    
    // Crear partículas iniciales
    for (let i = 0; i < particleCount; i++) {
        const particle = createFloatingParticle();
        container.appendChild(particle);
    }
    
    // Regenerar partículas cuando terminen su animación
    setInterval(() => {
        const particles = container.querySelectorAll('.cursos-particle');
        particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            if (rect.top < -50 || rect.top > window.innerHeight + 50) {
                particle.remove();
                const newParticle = createFloatingParticle();
                container.appendChild(newParticle);
            }
        });
    }, 8000); // Intervalo más largo
    
    console.log('✅ Partículas DOM inicializadas');
}

// Agregar estilos CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    .auth-container {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
    }
    
    .auth-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }
    
    .bg-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(68, 229, 255, 0.08) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        animation: rotate 25s linear infinite;
    }
    
    #bgParticles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none; /* Permitir que los eventos pasen al documento */
    }
    
    .particles-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
    }
    
    .particle {
        position: absolute;
        width: 3px;
        height: 3px;
        background: rgba(68, 229, 255, 0.5);
        border-radius: 50%;
        animation: particleFloat 10s infinite ease-in-out;
    }
    
    .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
    .particle:nth-child(2) { left: 20%; animation-delay: 1.5s; }
    .particle:nth-child(3) { left: 30%; animation-delay: 3s; }
    .particle:nth-child(4) { left: 40%; animation-delay: 4.5s; }
    .particle:nth-child(5) { left: 60%; animation-delay: 6s; }
    .particle:nth-child(6) { left: 70%; animation-delay: 7.5s; }
    .particle:nth-child(7) { left: 80%; animation-delay: 9s; }
    .particle:nth-child(8) { left: 90%; animation-delay: 10.5s; }
    
    .floating-particle {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        z-index: 2;
    }
    
    @keyframes rotate {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    @keyframes particleFloat {
        0%, 100% { transform: translateY(0px) scale(1); opacity: 0.5; }
        50% { transform: translateY(-15px) scale(1.1); opacity: 0.8; }
    }
    
    @keyframes cursosOrbitalMotion {
        0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
        }
        25% {
            transform: translate(30px, -20px) rotate(90deg);
            opacity: 0.6;
        }
        50% {
            transform: translate(0, -40px) rotate(180deg);
            opacity: 0.4;
        }
        75% {
            transform: translate(-30px, -20px) rotate(270deg);
            opacity: 0.7;
        }
        100% {
            transform: translate(0, 0) rotate(360deg);
            opacity: 0.3;
        }
    }
`;

document.head.appendChild(style);
console.log('✅ Estilos CSS agregados dinámicamente');
