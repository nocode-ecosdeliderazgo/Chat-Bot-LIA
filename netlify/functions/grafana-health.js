// netlify/functions/grafana-health.js
const { createCorsResponse } = require('./cors-utils');

exports.handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return createCorsResponse(event, {
            statusCode: 200,
            body: ''
        });
    }

    try {
        // Simple health check for Grafana integration
        const healthStatus = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'grafana-integration'
        };

        return createCorsResponse(event, {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(healthStatus)
        });
    } catch (error) {
        console.error('Grafana health check error:', error);
        
        return createCorsResponse(event, {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'error',
                message: 'Health check failed'
            })
        });
    }
};