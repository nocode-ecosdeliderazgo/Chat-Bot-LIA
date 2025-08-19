const corsUtils = require('./cors-utils');

// Configuración de Grafana
const GRAFANA_URL = "https://nocode1.grafana.net";
const DASH_UID = "057abaf9-2e0f-4aa4-99b0-3b0e2990c5aa";
const GRAFANA_TOKEN = process.env.GRAFANA_SA_TOKEN;

exports.handler = async (event, context) => {
    // Aplicar CORS
    const corsHeaders = corsUtils.getCorsHeaders(event);
    
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        console.log('📋 Grafana Health Check solicitado (Netlify)');

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'OK',
                timestamp: new Date().toISOString(),
                grafana_configured: !!GRAFANA_TOKEN,
                grafana_url: GRAFANA_URL,
                dashboard_uid: DASH_UID,
                environment: 'netlify',
                grafana_token_preview: GRAFANA_TOKEN ? GRAFANA_TOKEN.substring(0, 10) + '...' : 'No configurado'
            })
        };

    } catch (error) {
        console.error('💥 Error en health check Grafana:', error.message);
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Error en health check',
                details: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};