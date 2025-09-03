// Script de prueba para la API de video-progress
const fetch = require('node-fetch');

async function testVideoProgressAPI() {
    console.log('🧪 Probando API de video-progress...');
    
    const userId = '00000000-0000-0000-0000-000000000001';
    const testData = {
        course_identifier: 'intro-to-ai',
        module_number: 1,
        video_progress_percentage: 50,
        last_video_position: 120,
        video_completed: false
    };
    
    try {
        const response = await fetch('http://localhost:8888/.netlify/functions/video-progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId
            },
            body: JSON.stringify(testData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ API funcionando correctamente:');
            console.log('   - Status:', result.success);
            console.log('   - Módulo actualizado:', result.module);
            console.log('   - Progreso del curso:', result.course_progress);
        } else {
            const error = await response.text();
            console.error('❌ Error en la API:', response.status, error);
        }
        
    } catch (error) {
        console.error('❌ Error conectando a la API:', error.message);
    }
}

// Ejecutar prueba
testVideoProgressAPI();
