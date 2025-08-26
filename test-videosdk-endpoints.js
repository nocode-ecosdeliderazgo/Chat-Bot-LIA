/**
 * Test script para verificar los endpoints del Video SDK
 * Ejecutar con: node test-videosdk-endpoints.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'test-token'; // Reemplazar con un token válido para pruebas

// Función helper para hacer requests
async function makeRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        
        console.log(`\n${method} ${endpoint}`);
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        return { status: response.status, data };
    } catch (error) {
        console.error(`Error en ${method} ${endpoint}:`, error.message);
        return { status: 'ERROR', data: { error: error.message } };
    }
}

// Tests
async function runTests() {
    console.log('🧪 Iniciando tests de Video SDK Endpoints...\n');
    
    const testSessionId = 'test-session-123';
    const testRecordingId = 'test-recording-456';
    
    // Test 1: Iniciar grabación
    console.log('📹 Test 1: Iniciar grabación');
    const startResult = await makeRequest('/api/videosdk/recording/start', 'POST', {
        sessionId: testSessionId
    });
    
    // Test 2: Obtener estado de grabación (si tenemos un recordingId)
    if (startResult.data && startResult.data.recordingId) {
        console.log('\n📊 Test 2: Obtener estado de grabación');
        await makeRequest(`/api/videosdk/recording/status/${startResult.data.recordingId}`);
    } else {
        console.log('\n📊 Test 2: Obtener estado de grabación (con ID de prueba)');
        await makeRequest(`/api/videosdk/recording/status/${testRecordingId}`);
    }
    
    // Test 3: Listar grabaciones de sesión
    console.log('\n📋 Test 3: Listar grabaciones de sesión');
    await makeRequest(`/api/videosdk/recordings/${testSessionId}`);
    
    // Test 4: Detener grabación (si tenemos un recordingId)
    if (startResult.data && startResult.data.recordingId) {
        console.log('\n⏹️ Test 4: Detener grabación');
        await makeRequest('/api/videosdk/recording/stop', 'POST', {
            sessionId: testSessionId,
            recordingId: startResult.data.recordingId
        });
    } else {
        console.log('\n⏹️ Test 4: Detener grabación (con IDs de prueba)');
        await makeRequest('/api/videosdk/recording/stop', 'POST', {
            sessionId: testSessionId,
            recordingId: testRecordingId
        });
    }
    
    // Test 5: Validación de errores - Sin sessionId
    console.log('\n❌ Test 5: Validación - Sin sessionId');
    await makeRequest('/api/videosdk/recording/start', 'POST', {});
    
    // Test 6: Validación de errores - Sin autenticación
    console.log('\n❌ Test 6: Validación - Sin autenticación');
    try {
        const response = await fetch(`${BASE_URL}/api/videosdk/recording/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: testSessionId })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    console.log('\n✅ Tests completados');
}

// Ejecutar tests si el archivo se ejecuta directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { makeRequest, runTests };
