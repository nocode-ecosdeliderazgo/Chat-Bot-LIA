// Script de diagnóstico para la navegación
console.log('🔧 === DIAGNÓSTICO DE NAVEGACIÓN ===');

// Función para verificar elementos del DOM
function diagnoseNavigation() {
    console.log('📋 Verificando elementos de navegación...');
    
    // Verificar enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('🔗 Enlaces de navegación encontrados:', navLinks.length);
    
    navLinks.forEach((link, index) => {
        const sectionName = link.getAttribute('data-section');
        const isActive = link.classList.contains('active');
        console.log(`  ${index + 1}. "${sectionName}" - Activo: ${isActive}`);
        
        // Verificar si el enlace tiene event listeners
        const hasListeners = link.onclick !== null || 
                           link.getAttribute('onclick') !== null ||
                           link._listeners !== undefined;
        console.log(`     Event listeners: ${hasListeners ? 'Sí' : 'No'}`);
    });
    
    // Verificar secciones de contenido
    const contentSections = document.querySelectorAll('.content-section');
    console.log('📄 Secciones de contenido encontradas:', contentSections.length);
    
    contentSections.forEach((section, index) => {
        const isVisible = section.style.display !== 'none' && 
                         !section.classList.contains('hidden') &&
                         section.offsetParent !== null;
        console.log(`  ${index + 1}. "${section.id}" - Visible: ${isVisible}`);
    });
    
    // Verificar función showSection
    console.log('🔍 Función showSection disponible:', typeof window.showSection);
    
    // Verificar si hay errores en la consola
    console.log('⚠️ Verificando errores de JavaScript...');
    
    // Simular click en cada enlace para verificar funcionamiento
    console.log('🧪 Probando clicks en enlaces...');
    navLinks.forEach((link, index) => {
        console.log(`  Probando click en enlace ${index + 1}...`);
        try {
            // Simular click
            link.click();
            console.log(`    ✅ Click exitoso`);
        } catch (error) {
            console.log(`    ❌ Error en click:`, error.message);
        }
    });
}

// Función para verificar la inicialización
function checkInitialization() {
    console.log('🚀 Verificando inicialización...');
    
    // Verificar si el DOM está cargado
    console.log('📄 DOM cargado:', document.readyState);
    
    // Verificar scripts cargados
    const scripts = document.querySelectorAll('script');
    console.log('📜 Scripts cargados:', scripts.length);
    
    // Verificar si el script de navegación está cargado
    const navScript = Array.from(scripts).find(script => 
        script.src && script.src.includes('panel-navigation.js')
    );
    console.log('🎯 Script de navegación cargado:', !!navScript);
    
    // Verificar variables globales
    console.log('🌐 Variables globales:');
    console.log('  - window.showSection:', typeof window.showSection);
    console.log('  - window.navLinks:', typeof window.navLinks);
    console.log('  - window.contentSections:', typeof window.contentSections);
}

// Función para forzar la navegación
function forceNavigation(sectionName) {
    console.log(`🔧 Forzando navegación a: ${sectionName}`);
    
    // Ocultar todas las secciones
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Mostrar la sección objetivo
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        console.log(`✅ Sección "${sectionName}" mostrada`);
    } else {
        console.log(`❌ Sección "${sectionName}" no encontrada`);
    }
    
    // Actualizar enlaces activos
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
            console.log(`✅ Enlace "${sectionName}" activado`);
        }
    });
}

// Función para agregar event listeners manualmente
function addManualEventListeners() {
    console.log('🔧 Agregando event listeners manualmente...');
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        // Remover listeners existentes
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // Agregar nuevo listener
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionName = this.getAttribute('data-section');
            console.log(`🖱️ Click manual en: ${sectionName}`);
            forceNavigation(sectionName);
        });
        
        console.log(`✅ Event listener agregado a "${newLink.getAttribute('data-section')}"`);
    });
}

// Función para verificar CSS
function checkCSS() {
    console.log('🎨 Verificando estilos CSS...');
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link, index) => {
        const styles = window.getComputedStyle(link);
        console.log(`  Enlace ${index + 1}:`);
        console.log(`    - Display: ${styles.display}`);
        console.log(`    - Visibility: ${styles.visibility}`);
        console.log(`    - Opacity: ${styles.opacity}`);
        console.log(`    - Cursor: ${styles.cursor}`);
        console.log(`    - Pointer-events: ${styles.pointerEvents}`);
    });
}

// Ejecutar diagnóstico cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM cargado, ejecutando diagnóstico...');
        checkInitialization();
        diagnoseNavigation();
        checkCSS();
    });
} else {
    console.log('📄 DOM ya cargado, ejecutando diagnóstico inmediatamente...');
    checkInitialization();
    diagnoseNavigation();
    checkCSS();
}

// Exponer funciones globalmente para debugging
window.diagnoseNav = {
    diagnose: diagnoseNavigation,
    checkInit: checkInitialization,
    forceNav: forceNavigation,
    addListeners: addManualEventListeners,
    checkCSS: checkCSS
};

console.log('🔧 Funciones de diagnóstico disponibles en window.diagnoseNav');
console.log('🔧 === FIN DIAGNÓSTICO ===');
