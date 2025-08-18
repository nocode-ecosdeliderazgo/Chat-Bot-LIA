// Script de debugging para localStorage
// Pega esto en la consola del navegador después del login

console.log('🔍 DEBUGGING localStorage después del login:');
console.log('================================================');

const authKeys = ['userToken', 'userData', 'userSession', 'authToken', 'currentUser'];
const allKeys = Object.keys(localStorage);

// Verificar claves de autenticación
console.log('📋 CLAVES DE AUTENTICACIÓN:');
authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value ? '✅ EXISTS' : '❌ NULL');
    
    if (value) {
        try {
            if (key.includes('Token')) {
                console.log(`  📄 Preview: ${value.substring(0, 50)}...`);
                // Intentar decodificar si es JWT
                if (value.includes('.')) {
                    try {
                        const decoded = JSON.parse(atob(value.split('.')[1]));
                        console.log(`  🔓 Decoded JWT:`, decoded);
                    } catch (e) {
                        console.log(`  ⚠️  No es JWT válido`);
                    }
                }
            } else {
                const parsed = JSON.parse(value);
                console.log(`  📄 Content:`, parsed);
            }
        } catch (e) {
            console.log(`  📄 Raw value:`, value);
        }
    }
    console.log('');
});

// Verificar todas las otras claves
console.log('📋 OTRAS CLAVES EN localStorage:');
allKeys.filter(key => !authKeys.includes(key)).forEach(key => {
    console.log(`${key}: ${localStorage.getItem(key) ? '✅ EXISTS' : '❌ NULL'}`);
});

// Test AuthGuard simulation
console.log('🔒 SIMULACIÓN AuthGuard:');
const hasToken = !!localStorage.getItem('userToken');
const hasUserData = !!localStorage.getItem('userData');
const hasSession = !!localStorage.getItem('userSession');

console.log(`Token: ${hasToken ? '✅' : '❌'}`);
console.log(`UserData: ${hasUserData ? '✅' : '❌'}`);
console.log(`Session: ${hasSession ? '✅' : '❌'}`);

if (hasToken && hasUserData && hasSession) {
    console.log('🎉 AuthGuard debería PERMITIR acceso');
} else {
    console.log('🚫 AuthGuard va a DENEGAR acceso');
    console.log('   Faltan:', [
        !hasToken && 'userToken',
        !hasUserData && 'userData', 
        !hasSession && 'userSession'
    ].filter(Boolean).join(', '));
}

console.log('================================================');