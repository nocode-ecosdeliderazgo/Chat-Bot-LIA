// Script de debug para verificar el funcionamiento del tema
console.log('🔍 Debug del tema iniciado...');

// Verificar si el theme-manager está cargado
if (window.ThemeManager) {
    console.log('✅ ThemeManager está disponible');
} else {
    console.log('❌ ThemeManager NO está disponible');
}

// Verificar el tema actual
const currentTheme = document.documentElement.getAttribute('data-theme');
console.log('🎨 Tema actual:', currentTheme);

// Verificar las variables CSS
const rootStyles = getComputedStyle(document.documentElement);
console.log('🎨 Variables CSS del tema:');
console.log('- --bg-1:', rootStyles.getPropertyValue('--bg-1'));
console.log('- --bg-2:', rootStyles.getPropertyValue('--bg-2'));
console.log('- --text-primary:', rootStyles.getPropertyValue('--text-primary'));

// Verificar si el botón existe
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    console.log('✅ Botón de tema encontrado');
    
    // Agregar listener para debug
    themeToggle.addEventListener('click', () => {
        console.log('🔄 Botón de tema clickeado');
        setTimeout(() => {
            const newTheme = document.documentElement.getAttribute('data-theme');
            console.log('🎨 Nuevo tema:', newTheme);
            console.log('- --bg-1:', getComputedStyle(document.documentElement).getPropertyValue('--bg-1'));
            console.log('- --bg-2:', getComputedStyle(document.documentElement).getPropertyValue('--bg-2'));
        }, 100);
    });
} else {
    console.log('❌ Botón de tema NO encontrado');
}

// Verificar el fondo del body
const bodyStyles = getComputedStyle(document.body);
console.log('🎨 Fondo del body:', bodyStyles.background);
