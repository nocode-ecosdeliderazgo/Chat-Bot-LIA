// =====================================================
// NETLIFY FUNCTION: TEST
// Función simple para probar si las Netlify Functions funcionan
// =====================================================

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar peticiones OPTIONS (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const response = {
            success: true,
            message: 'Netlify Functions funcionan correctamente',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'production',
            headers: event.headers,
            path: event.path,
            method: event.httpMethod
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('💥 Error en test function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false,
                error: 'Error interno del servidor',
                details: error.message 
            })
        };
    }
};