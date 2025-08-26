/**
 * Test script para verificar el endpoint JWT de Video SDK
 * Ejecutar con: node test-videosdk-jwt.js
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
    console.log('🔐 Iniciando tests de Video SDK JWT Endpoint...\n');
    
    const testSessionName = 'test-session-123';
    const testUserName = 'Test User';
    
    // Test 1: Generar JWT para usuario normal (roleType: 0)
    console.log('👤 Test 1: Generar JWT para usuario normal');
    const userResult = await makeRequest('/api/videosdk/jwt', 'POST', {
        sessionName: testSessionName,
        userName: testUserName,
        roleType: 0
    });
    
    // Test 2: Generar JWT para host (roleType: 1)
    console.log('\n👑 Test 2: Generar JWT para host');
    const hostResult = await makeRequest('/api/videosdk/jwt', 'POST', {
        sessionName: testSessionName,
        userName: testUserName,
        roleType: 1
    });
    
    // Test 3: Validación - Sin sessionName
    console.log('\n❌ Test 3: Validación - Sin sessionName');
    await makeRequest('/api/videosdk/jwt', 'POST', {
        userName: testUserName,
        roleType: 0
    });
    
    // Test 4: Validación - Sin userName
    console.log('\n❌ Test 4: Validación - Sin userName');
    await makeRequest('/api/videosdk/jwt', 'POST', {
        sessionName: testSessionName,
        roleType: 0
    });
    
    // Test 5: Validación - roleType inválido
    console.log('\n❌ Test 5: Validación - roleType inválido');
    await makeRequest('/api/videosdk/jwt', 'POST', {
        sessionName: testSessionName,
        userName: testUserName,
        roleType: 2
    });
    
    // Test 6: Validación - Sin autenticación
    console.log('\n❌ Test 6: Validación - Sin autenticación');
    try {
        const response = await fetch(`${BASE_URL}/api/videosdk/jwt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionName: testSessionName,
                userName: testUserName,
                roleType: 0
            })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    // Test 7: Verificar estructura del JWT (si se generó exitosamente)
    if (userResult.data && userResult.data.jwt) {
        console.log('\n🔍 Test 7: Verificar estructura del JWT');
        const jwt = userResult.data.jwt;
        console.log('JWT generado:', jwt.substring(0, 50) + '...');
        console.log('Session Name:', userResult.data.sessionName);
        console.log('User Name:', userResult.data.userName);
        console.log('Session Passcode:', userResult.data.sessionPasscode);
        console.log('Role Type:', userResult.data.roleType);
        console.log('Expires At:', userResult.data.expiresAt);
    }
    
    console.log('\n✅ Tests completados');
}

// Ejecutar tests si el archivo se ejecuta directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { makeRequest, runTests };
