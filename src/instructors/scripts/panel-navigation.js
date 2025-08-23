// ===== NAVEGACIÓN BÁSICA DEL PANEL =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Panel de navegación inicializado');
    
    // Configurar navegación básica
    setupNavigation();
    
    // Mostrar sección por defecto
    showSection('dashboard');
});

// Función para configurar la navegación
function setupNavigation() {
    console.log('🔧 Configurando navegación...');
    
    // Obtener todos los enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            console.log('📱 Navegando a:', targetSection);
            
            // Remover clase activa de todos los enlaces
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase activa al enlace clickeado
            this.classList.add('active');
            
            // Mostrar la sección correspondiente
            showSection(targetSection);
        });
    });
    
    console.log('✅ Navegación configurada');
}

// Función para mostrar secciones
function showSection(sectionName) {
    console.log('🎯 Mostrando sección:', sectionName);
    
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.style.display = 'block';
        console.log('✅ Sección mostrada:', sectionName);
    } else {
        console.warn('⚠️ Sección no encontrada:', sectionName);
    }
}

// Función para alternar sidebar en móviles
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        console.log('📱 Sidebar alternado');
    }
}

// Hacer funciones globales
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
