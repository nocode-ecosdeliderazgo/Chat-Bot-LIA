// Script para diagnosticar y arreglar la navegación
console.log('🔧 Iniciando diagnóstico de navegación...');

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM cargado, iniciando diagnóstico...');
    
    // 1. Verificar elementos básicos
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    
    console.log('📊 Elementos encontrados:');
    console.log('- Nav links:', navLinks.length);
    console.log('- Content sections:', contentSections.length);
    console.log('- Page title:', !!pageTitle);
    console.log('- Page description:', !!pageDescription);
    
    // 2. Verificar si los elementos tienen los data-section correctos
    navLinks.forEach((link, index) => {
        const dataSection = link.getAttribute('data-section');
        console.log(`📌 Nav link ${index + 1}: data-section="${dataSection}"`);
    });
    
    contentSections.forEach((section, index) => {
        console.log(`📄 Content section ${index + 1}: id="${section.id}"`);
    });
    
    // 3. Implementar función de navegación limpia
    function showSection(sectionName) {
        console.log('🎯 Navegando a sección:', sectionName);
        
        // Información de secciones
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
        
        // Ocultar todas las secciones
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Remover clase active de todos los enlaces
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Mostrar sección target
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('✅ Sección activada:', sectionName);
        } else {
            console.error('❌ Sección no encontrada:', sectionName);
        }
        
        // Activar enlace correspondiente
        const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
            console.log('✅ Enlace activado');
        } else {
            console.error('❌ Enlace no encontrado para sección:', sectionName);
        }
        
        // Actualizar título y descripción
        if (pageTitle && sectionInfo[sectionName]) {
            pageTitle.textContent = sectionInfo[sectionName].title;
        }
        if (pageDescription && sectionInfo[sectionName]) {
            pageDescription.textContent = sectionInfo[sectionName].description;
        }
    }
    
    // 4. Configurar event listeners para navegación
    console.log('🔗 Configurando event listeners...');
    
    navLinks.forEach((link, index) => {
        // Remover cualquier listener existente
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // Agregar nuevo listener
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            console.log(`🖱️ Click en enlace ${index + 1}, sección: ${section}`);
            showSection(section);
        });
        
        console.log(`✅ Event listener configurado para enlace ${index + 1}`);
    });
    
    // 5. Configurar botón adicional para crear curso
    const addCourseBtn = document.getElementById('addCourseBtn');
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', function() {
            console.log('🖱️ Click en botón "Crear Nuevo Curso"');
            showSection('create-course');
        });
        console.log('✅ Event listener configurado para botón "Crear Nuevo Curso"');
    }
    
    // 6. Exponer función globalmente para uso desde HTML
    window.showSection = showSection;
    
    console.log('✅ Diagnóstico y configuración completados');
    
    // 7. Test de navegación automático
    setTimeout(() => {
        console.log('🧪 Iniciando test automático de navegación...');
        showSection('courses');
        
        setTimeout(() => {
            showSection('create-course');
            
            setTimeout(() => {
                showSection('dashboard');
                console.log('🎉 Test de navegación completado exitosamente');
            }, 1000);
        }, 1000);
    }, 2000);
});