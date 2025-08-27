// Debug script para el chat - Ejecutar en la consola del navegador

console.log('🔍 INICIANDO DEBUG DEL CHAT');

// Verificar elementos principales
const livestreamContent = document.getElementById('livestreamContent');
const liaMessageInput = document.getElementById('livestreamMessageInput');
const liaSendBtn = document.getElementById('livestreamSendBtn');
const typeBtns = document.querySelectorAll('.type-btn');

console.log('📋 VERIFICACIÓN DE ELEMENTOS:');
console.log('- livestreamContent:', livestreamContent ? '✅ Encontrado' : '❌ No encontrado');
console.log('- liaMessageInput:', liaMessageInput ? '✅ Encontrado' : '❌ No encontrado');
console.log('- liaSendBtn:', liaSendBtn ? '✅ Encontrado' : '❌ No encontrado');
console.log('- typeBtns cantidad:', typeBtns.length);

// Verificar estilos de visibilidad
if (livestreamContent) {
    const computedStyle = window.getComputedStyle(livestreamContent);
    console.log('📊 ESTILOS DE VISIBILIDAD:');
    console.log('- display:', computedStyle.display);
    console.log('- visibility:', computedStyle.visibility);
    console.log('- opacity:', computedStyle.opacity);
}

// Verificar estado inicial de input y botón
if (liaMessageInput) {
    console.log('💬 ESTADO DEL INPUT:');
    console.log('- disabled:', liaMessageInput.disabled);
    console.log('- placeholder:', liaMessageInput.placeholder);
    console.log('- value:', liaMessageInput.value);
}

if (liaSendBtn) {
    console.log('🔘 ESTADO DEL BOTÓN:');
    console.log('- disabled:', liaSendBtn.disabled);
}

// Verificar event listeners de los botones
console.log('🎯 BOTONES DE TIPO:');
typeBtns.forEach((btn, index) => {
    console.log(`- Botón ${index + 1}:`, btn.dataset.type, btn.classList.contains('active') ? '(ACTIVO)' : '');
});

// Función para simular click en un botón
window.testButtonClick = function(type) {
    const btn = document.querySelector(`.type-btn[data-type="${type}"]`);
    if (btn) {
        console.log(`🖱️ Simulando click en botón ${type}...`);
        btn.click();
        
        setTimeout(() => {
            console.log('📊 ESTADO DESPUÉS DEL CLICK:');
            console.log('- Input disabled:', liaMessageInput ? liaMessageInput.disabled : 'N/A');
            console.log('- Button disabled:', liaSendBtn ? liaSendBtn.disabled : 'N/A');
            console.log('- Placeholder:', liaMessageInput ? liaMessageInput.placeholder : 'N/A');
        }, 100);
    } else {
        console.log(`❌ No se encontró botón con tipo: ${type}`);
    }
};

// Función para mostrar la sección si está oculta
window.showLivestreamSection = function() {
    if (livestreamContent) {
        livestreamContent.style.display = 'block';
        const toggle = document.getElementById('livestreamToggle');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.className = 'bx bx-chevron-up';
            }
        }
        console.log('✅ Sección livestream expandida');
    }
};

console.log('🎯 COMANDOS DISPONIBLES:');
console.log('- testButtonClick("lia") - Simular click en botón LIA');
console.log('- testButtonClick("live") - Simular click en botón Chat en Vivo');
console.log('- showLivestreamSection() - Mostrar sección si está oculta');

// Auto-expandir sección si está oculta
if (livestreamContent && window.getComputedStyle(livestreamContent).display === 'none') {
    console.log('🔧 Auto-expandiendo sección oculta...');
    window.showLivestreamSection();
}

console.log('✅ DEBUG COMPLETADO');