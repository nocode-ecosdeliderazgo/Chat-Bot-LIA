// Script de debugging para el sistema de puntos
// Ejecutar en la consola del navegador en community-view.html

console.log('🔍 DEBUG: Sistema de Puntos - Iniciando diagnóstico...');

// 1. Verificar si Supabase está disponible
console.log('1. Verificando Supabase...');
console.log('window.supabase disponible:', !!window.supabase);
if (window.supabase) {
    console.log('Supabase URL:', window.supabase.supabaseUrl);
    console.log('Supabase Key presente:', !!window.supabase.supabaseKey);
}

// 2. Verificar si el sistema de puntos está inicializado
console.log('2. Verificando sistema de puntos...');
console.log('window.pointsSystem disponible:', !!window.pointsSystem);
if (window.pointsSystem) {
    console.log('Usuarios en el sistema:', window.pointsSystem.users);
    console.log('Usuario actual:', window.pointsSystem.currentUser);
}

// 3. Verificar localStorage
console.log('3. Verificando localStorage...');
const communityUsers = localStorage.getItem('communityUsers');
const communityUsersStats = localStorage.getItem('communityUsersStats');
console.log('communityUsers en localStorage:', communityUsers ? JSON.parse(communityUsers) : 'No encontrado');
console.log('communityUsersStats en localStorage:', communityUsersStats ? JSON.parse(communityUsersStats) : 'No encontrado');

// 4. Función para probar la conexión con Supabase
async function testSupabaseConnection() {
    console.log('4. Probando conexión con Supabase...');
    
    if (!window.supabase) {
        console.error('❌ Supabase no está disponible');
        return;
    }
    
    try {
        // Probar lectura
        const { data: users, error } = await window.supabase
            .from('users')
            .select('id, username, display_name, first_name, points')
            .limit(3);
        
        if (error) {
            console.error('❌ Error al leer usuarios:', error);
        } else {
            console.log('✅ Lectura exitosa:', users);
            
            // Probar actualización si hay usuarios
            if (users && users.length > 0) {
                const testUser = users[0];
                console.log('📝 Probando actualización para usuario:', testUser.id);
                
                const { data: updateData, error: updateError } = await window.supabase
                    .from('users')
                    .update({ points: testUser.points || 0 })
                    .eq('id', testUser.id)
                    .select();
                
                if (updateError) {
                    console.error('❌ Error al actualizar:', updateError);
                } else {
                    console.log('✅ Actualización exitosa:', updateData);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error en prueba de conexión:', error);
    }
}

// 5. Función para probar el sistema de puntos
async function testPointsSystem() {
    console.log('5. Probando sistema de puntos...');
    
    if (!window.pointsSystem) {
        console.error('❌ Sistema de puntos no disponible');
        return;
    }
    
    try {
        // Probar agregar puntos
        console.log('🎯 Probando addPoints...');
        const result = await window.pointsSystem.addPoints('Tú', 'publish');
        console.log('✅ Puntos agregados:', result);
        
        // Verificar estado después
        console.log('Estado después de agregar puntos:');
        console.log('- Usuario actual:', window.pointsSystem.currentUser);
        console.log('- Todos los usuarios:', window.pointsSystem.users);
        
    } catch (error) {
        console.error('❌ Error en prueba del sistema de puntos:', error);
    }
}

// 6. Función para verificar autenticación
async function checkAuthentication() {
    console.log('6. Verificando autenticación...');
    
    if (!window.supabase) {
        console.log('⚠️ Supabase no disponible para verificar autenticación');
        return;
    }
    
    try {
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        if (error) {
            console.error('❌ Error al obtener usuario:', error);
        } else if (user) {
            console.log('✅ Usuario autenticado:', user);
        } else {
            console.log('⚠️ No hay usuario autenticado');
        }
    } catch (error) {
        console.error('❌ Error en verificación de autenticación:', error);
    }
}

// Ejecutar todas las pruebas
async function runAllTests() {
    console.log('🚀 Iniciando todas las pruebas...');
    
    await testSupabaseConnection();
    await checkAuthentication();
    await testPointsSystem();
    
    console.log('✅ Diagnóstico completado');
}

// Ejecutar automáticamente
runAllTests();

// Exportar funciones para uso manual
window.debugPointsSystem = {
    testSupabaseConnection,
    testPointsSystem,
    checkAuthentication,
    runAllTests
};

console.log('💡 Funciones de debugging disponibles en window.debugPointsSystem');
