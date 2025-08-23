// Navegación limpia para el panel de instructores
(function() {
    'use strict';
    
    console.log('🚀 Inicializando navegación limpia...');
    
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }
    
    function initNavigation() {
        console.log('📋 Inicializando navegación...');
        
        // Obtener elementos del DOM
        const navLinks = document.querySelectorAll('.nav-link');
        const contentSections = document.querySelectorAll('.content-section');
        const pageTitle = document.getElementById('pageTitle');
        const pageDescription = document.getElementById('pageDescription');
        const addCourseBtn = document.getElementById('addCourseBtn');
        
        console.log('📊 Elementos encontrados:', {
            navLinks: navLinks.length,
            contentSections: contentSections.length,
            pageTitle: !!pageTitle,
            pageDescription: !!pageDescription,
            addCourseBtn: !!addCourseBtn
        });
        
        // Información de las secciones
        const sectionInfo = {
            'dashboard': {
                title: 'Dashboard',
                description: 'Bienvenido al panel de maestros'
            },
            'courses': {
                title: 'Mis Cursos',
                description: 'Gestiona tus cursos existentes'
            },
            'create-course': {
                title: 'Crear Curso',
                description: 'Completa la información de tu curso'
            }
        };
        
        // Función para mostrar una sección específica
        function showSection(sectionName) {
            console.log('🎯 Navegando a sección:', sectionName);
            
            // Ocultar todas las secciones
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Remover clase active de todos los enlaces
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // Mostrar la sección objetivo
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('✅ Sección activada:', sectionName);
            } else {
                console.error('❌ Sección no encontrada:', sectionName);
                return;
            }
            
            // Activar el enlace correspondiente
            const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
            if (targetLink) {
                targetLink.classList.add('active');
            }
            
            // Actualizar título y descripción de la página
            if (sectionInfo[sectionName]) {
                if (pageTitle) {
                    pageTitle.textContent = sectionInfo[sectionName].title;
                }
                if (pageDescription) {
                    pageDescription.textContent = sectionInfo[sectionName].description;
                }
            }
        }
        
        // Configurar event listeners para los enlaces de navegación
        navLinks.forEach((link, index) => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionName = this.getAttribute('data-section');
                console.log(`🖱️ Click en enlace ${index + 1}: ${sectionName}`);
                
                if (sectionName) {
                    showSection(sectionName);
                } else {
                    console.error('❌ Enlace sin data-section:', this);
                }
            });
            
            console.log(`✅ Event listener configurado para: ${link.getAttribute('data-section')}`);
        });
        
        // Configurar botón "Crear Nuevo Curso"
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', function() {
                console.log('🖱️ Click en "Crear Nuevo Curso"');
                showSection('create-course');
            });
            console.log('✅ Event listener configurado para botón "Crear Nuevo Curso"');
        }
        
        // Exponer funciones globalmente
        window.showSection = showSection;
        
        console.log('✅ Navegación inicializada correctamente');
        
        // Mostrar la sección activa inicial (dashboard por defecto)
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            const initialSection = activeLink.getAttribute('data-section');
            showSection(initialSection);
        } else {
            showSection('dashboard');
        }
    }
    
})();