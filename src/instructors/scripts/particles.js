/* ===== SISTEMA DE PARTÍCULAS ===== */

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    createParticles() {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    animate() {
        this.particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = this.mouse.x - centerX;
            const deltaY = this.mouse.y - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.style.transform = `translate(${deltaX * force * 0.1}px, ${deltaY * force * 0.1}px)`;
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Inicializar sistema de partículas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.particles-container');
    if (container) {
        new ParticleSystem(container);
    }
});