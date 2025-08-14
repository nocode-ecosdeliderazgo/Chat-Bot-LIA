/**
 * TEST-COURSES-DATA.JS
 * Archivo de prueba para verificar el sistema de datos reales de cursos
 */

// Función para limpiar datos de prueba
function clearTestData() {
    localStorage.removeItem('userLearningData');
    console.log('✅ Datos de prueba limpiados');
}

// Función para simular visitas en días consecutivos
function simulateConsecutiveVisits(days = 5) {
    clearTestData();
    
    const today = new Date();
    const userData = new UserLearningData();
    
    for (let i = days - 1; i >= 0; i--) {
        const visitDate = new Date(today);
        visitDate.setDate(today.getDate() - i);
        const dateString = visitDate.toISOString().split('T')[0];
        
        // Simular visita
        userData.recordVisit(dateString);
        
        // Simular sesión de estudio (5-15 minutos aleatorios)
        const minutes = Math.floor(Math.random() * 10) + 5;
        userData.addStudySession(minutes, 'curso-ia-completo');
        
        console.log(`📅 Día ${i + 1}: ${dateString} - ${minutes} min estudiados`);
    }
    
    userData.saveData();
    console.log('✅ Visitas consecutivas simuladas');
    console.log('📊 Datos actuales:', userData.data);
}

// Función para simular progreso de curso
function simulateCourseProgress() {
    const userData = new UserLearningData();
    
    // Simular múltiples sesiones de estudio
    const sessions = [
        { minutes: 15, courseId: 'curso-ia-completo' },
        { minutes: 20, courseId: 'curso-ia-completo' },
        { minutes: 10, courseId: 'curso-ia-completo' },
        { minutes: 25, courseId: 'curso-ia-completo' },
        { minutes: 30, courseId: 'curso-ia-completo' }
    ];
    
    sessions.forEach((session, index) => {
        userData.addStudySession(session.minutes, session.courseId);
        console.log(`📚 Sesión ${index + 1}: ${session.minutes} min`);
    });
    
    userData.saveData();
    console.log('✅ Progreso de curso simulado');
    console.log('📊 Progreso del curso:', userData.data.courseProgress);
}

// Función para mostrar estadísticas actuales
function showCurrentStats() {
    const userData = new UserLearningData();
    
    console.log('📊 ESTADÍSTICAS ACTUALES:');
    console.log('========================');
    console.log('🎯 Racha actual:', userData.getStreakInfo().current, 'días');
    console.log('🏆 Racha más larga:', userData.getStreakInfo().longest, 'días');
    console.log('👥 Visitas totales:', userData.getStreakInfo().totalVisits);
    console.log('⏱️ Progreso semanal:', userData.getCurrentWeekProgress().current, '/', userData.getCurrentWeekProgress().goal, 'min');
    console.log('📅 Rango de semana:', userData.getWeekRange().start, '-', userData.getWeekRange().end);
    console.log('📚 Sesiones totales:', userData.data.sessions.length);
    console.log('🎓 Progreso de cursos:', userData.data.courseProgress);
}

// Función para simular una semana completa de estudio
function simulateFullWeek() {
    clearTestData();
    
    const userData = new UserLearningData();
    const today = new Date();
    
    // Simular 7 días de estudio
    for (let i = 6; i >= 0; i--) {
        const studyDate = new Date(today);
        studyDate.setDate(today.getDate() - i);
        const dateString = studyDate.toISOString().split('T')[0];
        
        // Registrar visita
        userData.recordVisit(dateString);
        
        // Simular 1-3 sesiones por día
        const sessionsPerDay = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < sessionsPerDay; j++) {
            const minutes = Math.floor(Math.random() * 20) + 10; // 10-30 min por sesión
            userData.addStudySession(minutes, 'curso-ia-completo');
        }
        
        console.log(`📅 Día ${7-i}: ${dateString} - ${sessionsPerDay} sesiones`);
    }
    
    userData.saveData();
    console.log('✅ Semana completa simulada');
    showCurrentStats();
}

// Función para probar el reinicio semanal
function testWeeklyReset() {
    const userData = new UserLearningData();
    
    console.log('🔄 Probando reinicio semanal...');
    console.log('📅 Fecha de inicio de semana actual:', userData.data.streak.weeklyStartDate);
    
    // Forzar reinicio semanal
    userData.checkWeeklyReset();
    
    console.log('✅ Reinicio semanal completado');
    console.log('📊 Progreso semanal después del reinicio:', userData.getCurrentWeekProgress());
}

// Función para mostrar todas las funciones disponibles
function showHelp() {
    console.log('🛠️ FUNCIONES DE PRUEBA DISPONIBLES:');
    console.log('==================================');
    console.log('clearTestData() - Limpia todos los datos de prueba');
    console.log('simulateConsecutiveVisits(days) - Simula visitas consecutivas');
    console.log('simulateCourseProgress() - Simula progreso de curso');
    console.log('showCurrentStats() - Muestra estadísticas actuales');
    console.log('simulateFullWeek() - Simula una semana completa de estudio');
    console.log('testWeeklyReset() - Prueba el reinicio semanal');
    console.log('showHelp() - Muestra esta ayuda');
}

// Ejecutar automáticamente al cargar
console.log('🧪 SISTEMA DE PRUEBA DE DATOS DE CURSOS CARGADO');
console.log('💡 Ejecuta showHelp() para ver las funciones disponibles');

// Hacer funciones disponibles globalmente
window.clearTestData = clearTestData;
window.simulateConsecutiveVisits = simulateConsecutiveVisits;
window.simulateCourseProgress = simulateCourseProgress;
window.showCurrentStats = showCurrentStats;
window.simulateFullWeek = simulateFullWeek;
window.testWeeklyReset = testWeeklyReset;
window.showHelp = showHelp;
