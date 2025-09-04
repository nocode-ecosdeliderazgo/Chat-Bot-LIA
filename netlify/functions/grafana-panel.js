// netlify/functions/grafana-panel.js
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
        // Extract panel ID from path if needed
        const path = event.path;
        console.log('Grafana panel request for path:', path);

        // For now, return a placeholder response
        // This would normally integrate with actual Grafana API
        return createCorsResponse(event, {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=300'
            },
            body: '',
            isBase64Encoded: false
        });
    } catch (error) {
        console.error('Grafana panel error:', error);
        
        return createCorsResponse(event, {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Panel generation failed'
            })
        });
    }
};