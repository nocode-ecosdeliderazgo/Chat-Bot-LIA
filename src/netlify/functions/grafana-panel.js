const corsUtils = require('./cors-utils');

// Configuración de Grafana
const GRAFANA_URL = "https://nocode1.grafana.net";
const DASH_UID = "057abaf9-2e0f-4aa4-99b0-3b0e2990c5aa";
const DASH_SLUG = "cuestionario-ia2";
const GRAFANA_TOKEN = process.env.GRAFANA_SA_TOKEN;

// Cache simple para Netlify Functions (en memoria de la función)
let grafanaCache = new Map();

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
        // Extraer panelId de la URL
        const pathParts = event.path.split('/');
        const panelFileName = pathParts[pathParts.length - 1];
        const panelId = panelFileName.replace('.png', '');

        console.log(`📊 Netlify Function: Solicitando panel ${panelId}`);

        // Verificar token de Grafana
        if (!GRAFANA_TOKEN) {
            console.error('❌ GRAFANA_SA_TOKEN no configurado en Netlify');
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'GRAFANA_SA_TOKEN no configurado',
                    debug: 'Variables de entorno no disponibles en Netlify'
                })
            };
        }

        // Obtener session_id del query parameter (para personalización por usuario)
        const sessionId = event.queryStringParameters?.session_id;
        
        // Verificar cache (válido por 5 minutos) - incluir session_id en la clave
        const cacheKey = `panel_${panelId}_${sessionId || 'general'}`;
        const cached = grafanaCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 300000) {
            console.log(`💾 Cache hit for panel ${panelId}: ${cached.buffer.length} bytes`);
            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'image/png',
                    'Cache-Control': 'private, max-age=300',
                    'Content-Length': cached.buffer.length.toString()
                },
                body: cached.buffer.toString('base64'),
                isBase64Encoded: true
            };
        }

        // Configurar URL de Grafana
        const url = new URL(`${GRAFANA_URL}/render/d-solo/${DASH_UID}/${DASH_SLUG}`);
        url.searchParams.set("orgId", "1");
        url.searchParams.set("panelId", panelId);
        url.searchParams.set("from", "now-30d");
        url.searchParams.set("to", "now");
        url.searchParams.set("theme", "dark");
        url.searchParams.set("width", "800");
        url.searchParams.set("height", "400");
        
        // Si se proporciona session_id, agregarlo como variable de Grafana
        if (sessionId) {
            url.searchParams.set("var-session_id", sessionId);
            console.log(`👤 Usando session_id personalizado: ${sessionId}`);
        } else {
            console.log(`⚠️ No se proporcionó session_id, usando datos generales`);
        }

        console.log(`🌐 Fetching: ${url.toString()}`);

        // Realizar request a Grafana con timeout optimizado
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url.toString(), {
            headers: { 
                'Authorization': `Bearer ${GRAFANA_TOKEN}`,
                'User-Agent': 'Chat-Bot-LIA-Netlify/1.0'
            },
            timeout: 15000 // 15 segundos
        });

        console.log(`📡 Grafana response: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Grafana error (${response.status}):`, errorText);
            
            // Retornar placeholder en caso de error
            return {
                statusCode: 503,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: `Grafana error: ${response.status}`,
                    details: errorText.substring(0, 200),
                    panelId: panelId
                })
            };
        }

        // Obtener imagen como buffer
        const buffer = Buffer.from(await response.arrayBuffer());
        console.log(`✅ Serving Grafana panel ${panelId}: ${buffer.length} bytes`);
        
        // Guardar en cache
        grafanaCache.set(cacheKey, {
            buffer: buffer,
            timestamp: Date.now()
        });

        // Limpiar cache antiguo (mantener solo últimos 10 items)
        if (grafanaCache.size > 10) {
            const oldestKey = grafanaCache.keys().next().value;
            grafanaCache.delete(oldestKey);
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'image/png',
                'Cache-Control': 'private, max-age=300',
                'Content-Length': buffer.length.toString()
            },
            body: buffer.toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('💥 Error en función Grafana:', error.message);
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Error conectando a Grafana',
                details: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};