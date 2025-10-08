/* ===== SISTEMA DE PARTÍCULAS DINÁMICAS PARA INDEX.HTML ===== */

// Sistema de partículas avanzado con Canvas para index.html
function initializeIndexParticleSystem() {
    const canvas = document.getElementById('bgParticles');
    const particleContainer = document.querySelector('.particles-container');
    
    if (canvas) {
        initIndexCanvasParticles(canvas);
    }
    
    if (particleContainer) {
        initIndexDOMParticles(particleContainer);
    }
}

// Partículas optimizadas con Canvas para index
function initIndexCanvasParticles(canvas) {
    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Configuración optimizada para index (menos partículas para mejor rendimiento)
    const config = {
        particleCount: window.innerWidth < 768 ? 20 : 50,
        connectionDistance: 150,
        mouseInfluence: 120
    };
    
    let particles = [];
    let mouse = { x: 0, y: 0 };
    
    // Redimensionar canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Clase Partícula para index
    class IndexParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.size = Math.random() * 4 + 1;
            this.opacity = Math.random() * 0.7 + 0.3;
            this.color = this.getRandomColor();
            this.originalSize = this.size;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }
        
        getRandomColor() {
            const colors = [
                'rgba(68, 229, 255, ', // Turquesa
                'rgba(0, 119, 166, ',  // Azul profundo
                'rgba(138, 43, 226, ', // Púrpura
                'rgba(255, 255, 255, ' // Blanco para contraste
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
            
            // Efecto de pulso
            this.pulsePhase += 0.02;
            const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
            
            // Interacción con mouse
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.mouseInfluence) {
                const force = (config.mouseInfluence - distance) / config.mouseInfluence;
                this.x -= dx * force * 0.03;
                this.y -= dy * force * 0.03;
                this.size = this.originalSize * (1 + force * 0.8);
                this.opacity = Math.min(1, this.opacity + force * 0.4);
            } else {
                this.size = this.originalSize * pulse;
                this.opacity *= 0.995;
                if (this.opacity < 0.2) this.opacity = Math.random() * 0.7 + 0.3;
            }
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Efecto de resplandor mejorado
            if (this.size > this.originalSize) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.color + '0.9)';
                ctx.fill();
                
                // Resplandor adicional
                ctx.shadowBlur = 10;
                ctx.globalAlpha = this.opacity * 0.5;
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    // Inicializar partículas
    function createParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new IndexParticle());
        }
    }
    
    // Dibujar conexiones mejoradas
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectionDistance) {
                    const opacity = (1 - distance / config.connectionDistance) * 0.4;
                    const connectionColors = [
                        `rgba(68, 229, 255, ${opacity})`,
                        `rgba(138, 43, 226, ${opacity * 0.8})`,
                        `rgba(255, 255, 255, ${opacity * 0.6})`
                    ];
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.strokeStyle = connectionColors[Math.floor(Math.random() * connectionColors.length)];
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }
    
    // Bucle de animación
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Actualizar y dibujar partículas
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Dibujar conexiones
        drawConnections();
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Event listeners
    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
    });
    
    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    
    // Pausar cuando no esté visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
    
    // Inicializar
    resizeCanvas();
    createParticles();
    animate();
}

// Partículas DOM adicionales para index (reducidas para mejor rendimiento)
function initIndexDOMParticles(container) {
    const config = {
        particleCount: window.innerWidth < 768 ? 10 : 20,
        colors: ['#44E5FF', '#0077A6', '#8A2BE2']
    };
    
    // Crear partículas DOM flotantes
    for (let i = 0; i < config.particleCount; i++) {
        createIndexFloatingParticle(container, config);
    }
}

function createIndexFloatingParticle(container, config) {
    const particle = document.createElement('div');
    particle.className = 'particle floating-particle index-particle';
    
    const size = Math.random() * 8 + 3;
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const duration = Math.random() * 25 + 20;
    const delay = Math.random() * 15;
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        opacity: ${Math.random() * 0.5 + 0.2};
        animation: indexOrbitalMotion ${duration}s linear infinite, indexQuantumFlicker ${Math.random() * 4 + 3}s ease-in-out infinite;
        animation-delay: ${delay}s, ${Math.random() * 3}s;
        pointer-events: none;
        box-shadow: 0 0 ${size * 3}px ${color};
        will-change: transform, opacity;
        z-index: 1;
    `;
    
    container.appendChild(particle);
    
    // Remover después de la animación para evitar acumulación
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            // Crear nueva partícula para mantener el efecto continuo
            createIndexFloatingParticle(container, config);
        }
    }, (duration + delay) * 1000);
}

// Agregar estilos de animación específicos para index
const indexStyle = document.createElement('style');
indexStyle.textContent = `
    @keyframes indexOrbitalMotion {
        0% {
            transform: translateX(0) translateY(0) rotate(0deg);
        }
        25% {
            transform: translateX(100px) translateY(-50px) rotate(90deg);
        }
        50% {
            transform: translateX(0) translateY(-100px) rotate(180deg);
        }
        75% {
            transform: translateX(-100px) translateY(-50px) rotate(270deg);
        }
        100% {
            transform: translateX(0) translateY(0) rotate(360deg);
        }
    }
    
    @keyframes indexQuantumFlicker {
        0%, 100% {
            opacity: 0.3;
            transform: scale(1);
        }
        25% {
            opacity: 0.8;
            transform: scale(1.2);
        }
        50% {
            opacity: 0.5;
            transform: scale(0.8);
        }
        75% {
            opacity: 1;
            transform: scale(1.1);
        }
    }
    
    .index-particle {
        mix-blend-mode: screen;
    }
    
    /* Estilos para el contenedor principal */
    .main-container {
        position: relative;
        width: 100%;
        min-height: 100vh;
        z-index: 2;
    }
    
    .main-bg {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    }
    
    .bg-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(68, 229, 255, 0.12) 0%, transparent 70%);
        animation: glowRotate 25s linear infinite;
    }
    
    @keyframes glowRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    #bgParticles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        mix-blend-mode: screen;
    }
    
    /* Partículas estáticas CSS para index (simplificadas) */
    .particles-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    }
    
    .particle {
        position: absolute;
        width: 3px;
        height: 3px;
        background: #44E5FF;
        border-radius: 50%;
        animation: indexFloat 10s ease-in-out infinite;
        opacity: 0.4;
    }
    
    .particle:nth-child(1) { top: 20%; left: 20%; animation-delay: 0s; }
    .particle:nth-child(2) { top: 60%; left: 80%; animation-delay: 2s; }
    .particle:nth-child(3) { top: 40%; left: 60%; animation-delay: 4s; }
    .particle:nth-child(4) { top: 80%; left: 30%; animation-delay: 6s; }
    .particle:nth-child(5) { top: 30%; left: 70%; animation-delay: 8s; }
    .particle:nth-child(6) { top: 70%; left: 50%; animation-delay: 10s; }
    .particle:nth-child(7) { top: 50%; left: 90%; animation-delay: 12s; }
    .particle:nth-child(8) { top: 90%; left: 40%; animation-delay: 14s; }
    
    @keyframes indexFloat {
        0%, 100% { 
            transform: translateY(0px) scale(1); 
            opacity: 0.4; 
        }
        50% { 
            transform: translateY(-20px) scale(1.2); 
            opacity: 0.8; 
        }
    }
`;
document.head.appendChild(indexStyle);

// Optimización de rendimiento específica para index
function optimizeIndexPerformance() {
    // Reducir partículas en dispositivos de baja potencia
    const isLowPerformance = window.navigator.hardwareConcurrency < 4 || 
                            window.innerWidth < 768 || 
                            /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isLowPerformance) {
        // Reducir efectos visuales en dispositivos móviles o de bajo rendimiento
        document.documentElement.style.setProperty('--animation-speed', '0.6');
        const bgGlow = document.querySelector('.bg-glow');
        if (bgGlow) {
            bgGlow.style.filter = 'blur(40px)';
            bgGlow.style.opacity = '0.3';
        }
        
        // Reducir partículas DOM
        const particles = document.querySelectorAll('.floating-particle');
        particles.forEach((particle, index) => {
            if (index > 10) {
                particle.style.display = 'none';
            }
        });
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initializeIndexParticleSystem();
    optimizeIndexPerformance();
});

// Reinicializar en cambios de tema
document.addEventListener('themeChanged', () => {
    // Reinicializar partículas para adaptarse al nuevo tema
    setTimeout(() => {
        initializeIndexParticleSystem();
    }, 100);
});

// Exportar para uso global
window.initializeIndexParticleSystem = initializeIndexParticleSystem;
