const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3003; // Usar un puerto diferente

// Servir archivos estáticos
app.use(express.static(__dirname));

// Variables de entorno de Grafana
const GRAFANA_URL = "https://nocode1.grafana.net";
const GRAFANA_TOKEN = process.env.GRAFANA_SA_TOKEN;

console.log('🔍 Grafana Debug Server');
console.log('📡 GRAFANA_URL:', GRAFANA_URL);
console.log('🔑 GRAFANA_SA_TOKEN:', GRAFANA_TOKEN ? '✅ Configurado' : '❌ No configurado');
console.log('🗂️ Variables de entorno cargadas:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - PORT:', process.env.PORT);
console.log('   - DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurado' : '❌ No configurado');

// Health check simplificado
app.get('/grafana/health', (req, res) => {
    console.log('📋 Health check solicitado');
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        grafana_configured: !!GRAFANA_TOKEN,
        grafana_url: GRAFANA_URL,
        grafana_token_preview: GRAFANA_TOKEN ? GRAFANA_TOKEN.substring(0, 10) + '...' : 'No configurado'
    });
});

// Ruta simplificada para paneles de Grafana
app.get('/grafana/panel/:panelId.png', async (req, res) => {
    const panelId = req.params.panelId;
    console.log(`🖼️ Solicitando panel ${panelId}`);
    
    if (!GRAFANA_TOKEN) {
        console.log('❌ Token de Grafana no configurado');
        return res.status(500).json({ error: 'GRAFANA_SA_TOKEN no configurado' });
    }
    
    try {
        const fetch = (await import('node-fetch')).default;
        
        // URL simplificada para testing
        const url = `${GRAFANA_URL}/render/d-solo/057abaf9-2e0f-4aa4-99b0-3b0e2990c5aa/cuestionario-ia2?orgId=1&panelId=${panelId}&from=now-30d&to=now&theme=dark&width=800&height=400`;
        
        console.log(`🌐 Fetching: ${url}`);
        
        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${GRAFANA_TOKEN}`,
                'User-Agent': 'Debug-Bot/1.0'
            },
            timeout: 15000
        });
        
        console.log(`📡 Grafana response: ${response.status} ${response.statusText}`);
        console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Grafana error (${response.status}):`, errorText);
            return res.status(response.status).json({ 
                error: `Grafana error: ${response.status}`,
                details: errorText
            });
        }
        
        // Verificar tipo de contenido
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('image')) {
            console.warn(`⚠️ Tipo de contenido inesperado: ${contentType}`);
        }
        
        res.setHeader("Content-Type", contentType || "image/png");
        res.setHeader("Cache-Control", "private, max-age=300");
        
        const buffer = Buffer.from(await response.arrayBuffer());
        console.log(`✅ Serving panel ${panelId}: ${buffer.length} bytes`);
        res.send(buffer);
        
    } catch (error) {
        console.error('💥 Error conectando a Grafana:', error.message);
        res.status(500).json({ 
            error: 'Error de conexión a Grafana',
            details: error.message
        });
    }
});

// Ruta para probar múltiples paneles
app.get('/test-panels', async (req, res) => {
    const results = [];
    const panelsToTest = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
    });
    
    res.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test All Panels</title>
        <style>
            body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; padding: 20px; }
            .panel-test { margin: 20px 0; padding: 20px; background: #2a2a2a; border-radius: 8px; }
            .success { color: #4CAF50; }
            .error { color: #f44336; }
            img { max-width: 300px; max-height: 200px; border: 1px solid #444; margin: 10px; }
        </style>
    </head>
    <body>
        <h1>🔍 Test All Panel IDs</h1>
    `);
    
    for (const panelId of panelsToTest) {
        try {
            const fetch = (await import('node-fetch')).default;
            const url = `${GRAFANA_URL}/render/d-solo/057abaf9-2e0f-4aa4-99b0-3b0e2990c5aa/cuestionario-ia2?orgId=1&panelId=${panelId}&from=now-30d&to=now&theme=dark&width=400&height=300`;
            
            console.log(`🧪 Testing panel ${panelId}`);
            
            const response = await fetch(url, {
                headers: { 
                    'Authorization': `Bearer ${GRAFANA_TOKEN}`,
                    'User-Agent': 'Panel-Tester/1.0'
                },
                timeout: 10000
            });
            
            const contentType = response.headers.get('content-type');
            const buffer = Buffer.from(await response.arrayBuffer());
            const size = buffer.length;
            
            let status = 'error';
            let message = '';
            
            if (response.ok && size > 10000) {
                status = 'success';
                message = `✅ Panel ${panelId}: ${size} bytes (${contentType}) - REAL DATA`;
            } else if (response.ok && size < 10000) {
                status = 'error';
                message = `⚠️ Panel ${panelId}: ${size} bytes (${contentType}) - Probably placeholder`;
            } else {
                status = 'error';
                message = `❌ Panel ${panelId}: ${response.status} ${response.statusText}`;
            }
            
            res.write(`
                <div class="panel-test">
                    <p class="${status}">${message}</p>
                    <img src="/grafana/panel/${panelId}.png" alt="Panel ${panelId}" onerror="this.style.display='none'">
                </div>
            `);
            
            console.log(message);
            
        } catch (error) {
            const errorMsg = `💥 Panel ${panelId}: ${error.message}`;
            res.write(`
                <div class="panel-test">
                    <p class="error">${errorMsg}</p>
                </div>
            `);
            console.log(errorMsg);
        }
    }
    
    res.write(`
        </body>
        </html>
    `);
    res.end();
});

// Ruta para la página de debug
app.get('/debug', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-grafana-debug.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Debug server running on http://localhost:${PORT}`);
    console.log(`🔍 Debug page: http://localhost:${PORT}/debug`);
    console.log(`🏥 Health check: http://localhost:${PORT}/grafana/health`);
    console.log(`🖼️ Panel test: http://localhost:${PORT}/grafana/panel/1.png`);
});