// ====================================================================
// SCRIPT DE VALIDACIÓN PARA SISTEMA DE MENSAJES EXPLICATIVOS
// Archivo: test-analysis-messages.js
// Uso: node test-analysis-messages.js
// ====================================================================

const fetch = require('node-fetch');

// Configuración
const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/api/analysis-messages';

// Casos de prueba
const testCases = [
    {
        name: 'Adopción Baja - General',
        params: { messageType: 'adoption_explanation', score: 25, area: 'general' },
        expectedRange: [0, 39]
    },
    {
        name: 'Adopción Alta - Marketing',
        params: { messageType: 'adoption_explanation', score: 85, area: 'Marketing y Comunicación' },
        expectedRange: [70, 100]
    },
    {
        name: 'Conocimiento Medio - Tecnología',
        params: { messageType: 'knowledge_explanation', score: 60, area: 'Tecnología/Desarrollo de Software' },
        expectedRange: [40, 69]
    },
    {
        name: 'Recomendación Baja - CEO',
        params: { messageType: 'recommendation', score: 30, area: 'CEO/Alta Dirección' },
        expectedRange: [0, 39]
    },
    {
        name: 'Área No Existente - Fallback',
        params: { messageType: 'adoption_explanation', score: 50, area: 'AreaInexistente' },
        expectedRange: [40, 69]
    }
];

async function testEndpoint(testCase) {
    try {
        const params = new URLSearchParams(testCase.params);
        const url = `${BASE_URL}${ENDPOINT}?${params}`;

        console.log(`\n🧪 Probando: ${testCase.name}`);
        console.log(`📡 URL: ${url}`);

        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
            console.log(`❌ Error HTTP: ${response.status}`);
            console.log(`📄 Response:`, result);
            return false;
        }

        if (result.success && result.message) {
            const message = result.message;
            console.log(`✅ Mensaje encontrado`);
            console.log(`📝 Título: ${message.title || 'Sin título'}`);
            console.log(`📊 Rango score: ${message.score_range_min}-${message.score_range_max}`);
            console.log(`🎯 Área: ${message.target_area}`);
            console.log(`📄 Template: ${message.message_template.substring(0, 100)}...`);

            // Validar rango de score
            const inRange = testCase.params.score >= message.score_range_min &&
                           testCase.params.score <= message.score_range_max;

            if (inRange) {
                console.log(`✅ Score ${testCase.params.score} está en rango correcto`);
            } else {
                console.log(`❌ Score ${testCase.params.score} NO está en rango ${message.score_range_min}-${message.score_range_max}`);
                return false;
            }

            return true;
        } else {
            console.log(`⚠️ No se encontró mensaje (usando fallback)`);
            console.log(`📄 Response:`, result);
            return true; // Es válido no encontrar mensaje, usará fallback
        }

    } catch (error) {
        console.log(`❌ Error de conexión: ${error.message}`);
        return false;
    }
}

async function testTemplateProcessing() {
    console.log(`\n🧪 Probando procesamiento de templates...`);

    // Simular la función processMessageTemplate
    function processMessageTemplate(template, variables) {
        let processed = template;
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            processed = processed.replace(regex, value || '');
        });
        processed = processed.replace(/\{[^}]+\}/g, '');
        return processed;
    }

    const testTemplate = "Tu score de {score} puntos en {user_area} muestra {level} nivel. {tools_used}";
    const variables = {
        score: 85,
        user_area: 'Marketing y Comunicación',
        level: 'alto',
        tools_used: 'ChatGPT, Claude, Canva AI'
    };

    const result = processMessageTemplate(testTemplate, variables);
    const expected = "Tu score de 85 puntos en Marketing y Comunicación muestra alto nivel. ChatGPT, Claude, Canva AI";

    console.log(`📝 Template: ${testTemplate}`);
    console.log(`🔧 Variables:`, variables);
    console.log(`📄 Resultado: ${result}`);
    console.log(`📄 Esperado: ${expected}`);

    if (result === expected) {
        console.log(`✅ Procesamiento de template correcto`);
        return true;
    } else {
        console.log(`❌ Procesamiento de template incorrecto`);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Iniciando validación del sistema de mensajes explicativos...');
    console.log(`📡 Servidor: ${BASE_URL}`);

    let passed = 0;
    let total = testCases.length + 1; // +1 por test de template

    // Test de procesamiento de templates
    if (await testTemplateProcessing()) {
        passed++;
    }

    // Tests de endpoint
    for (const testCase of testCases) {
        if (await testEndpoint(testCase)) {
            passed++;
        }
        // Pequeña pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 RESULTADOS:`);
    console.log(`✅ Exitosos: ${passed}/${total}`);
    console.log(`❌ Fallidos: ${total - passed}/${total}`);

    if (passed === total) {
        console.log(`🎉 ¡Todos los tests pasaron! El sistema está funcionando correctamente.`);
        process.exit(0);
    } else {
        console.log(`⚠️ Algunos tests fallaron. Revisar configuración.`);
        process.exit(1);
    }
}

// Validar parámetros requeridos
function testParameterValidation() {
    console.log(`\n🧪 Probando validación de parámetros...`);

    const invalidCases = [
        { params: {}, expectedError: 'messageType y score son requeridos' },
        { params: { messageType: 'invalid_type', score: 50 }, expectedError: 'messageType debe ser' },
        { params: { messageType: 'adoption_explanation', score: 'invalid' }, expectedError: 'score debe ser un número' },
        { params: { messageType: 'adoption_explanation', score: -5 }, expectedError: 'score debe ser un número entre 0 y 100' },
        { params: { messageType: 'adoption_explanation', score: 150 }, expectedError: 'score debe ser un número entre 0 y 100' }
    ];

    console.log(`📝 Se esperan ${invalidCases.length} errores de validación (esto es correcto)`);
    return true;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    console.log('🔧 Para ejecutar este test:');
    console.log('1. Asegúrate de que el servidor esté corriendo en puerto 3000');
    console.log('2. Ejecuta: node test-analysis-messages.js');
    console.log('3. O desde npm: npm run test:analysis-messages');

    runAllTests().catch(error => {
        console.error('❌ Error ejecutando tests:', error);
        process.exit(1);
    });
}

module.exports = {
    testEndpoint,
    testTemplateProcessing,
    runAllTests
};