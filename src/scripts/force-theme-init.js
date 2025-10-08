// Script para forzar la inicialización del tema
document.addEventListener('DOMContentLoaded', () => {
    // console.log('🚀 Forzando inicialización del tema...');
    
    // Obtener tema guardado o usar dark por defecto
    const savedTheme = localStorage.getItem('theme') || 'dark';
    // console.log('🎨 Tema guardado:', savedTheme);
    
    // Aplicar tema inmediatamente
    document.documentElement.setAttribute('data-theme', savedTheme);
    // console.log('🎨 Tema aplicado:', document.documentElement.getAttribute('data-theme'));
    
    // Verificar variables CSS
    const rootStyles = getComputedStyle(document.documentElement);
    // console.log('🎨 Variables CSS después de aplicar tema:');
    // console.log('- --bg-1:', rootStyles.getPropertyValue('--bg-1'));
    // console.log('- --bg-2:', rootStyles.getPropertyValue('--bg-2'));
    
    // Forzar actualización del fondo del body
    document.body.style.background = `linear-gradient(160deg, ${rootStyles.getPropertyValue('--bg-1')} 0%, ${rootStyles.getPropertyValue('--bg-2')} 100%)`;
    // console.log('🎨 Fondo del body actualizado');
});
