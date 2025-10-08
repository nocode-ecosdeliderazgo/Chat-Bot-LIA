// Animaciones ligeras para la tarjeta y badges
document.addEventListener('DOMContentLoaded', () => {
	// Inicializar partículas si existe el contenedor
	if (typeof window.initializeParticleSystem === 'function') {
		window.initializeParticleSystem();
	}
	const card = document.querySelector('.coming-card');
	if (card) {
		card.style.opacity = '0';
		card.style.transform = 'translateY(20px)';
		setTimeout(() => {
			card.style.transition = 'all .6s ease';
			card.style.opacity = '1';
			card.style.transform = 'translateY(0)';
		}, 60);
	}

	const badges = document.querySelectorAll('.status-badge');
	badges.forEach((b, i) => {
		b.style.opacity = '0';
		b.style.transform = 'translateY(6px)';
		setTimeout(() => {
			b.style.transition = 'all .4s ease';
			b.style.opacity = '1';
			b.style.transform = 'translateY(0)';
		}, 250 + i * 100);
	});
});


