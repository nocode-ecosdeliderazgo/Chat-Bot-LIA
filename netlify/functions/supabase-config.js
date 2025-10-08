// =====================================================
// SUPABASE CONFIGURATION API
// Proporciona configuración de Supabase para el frontend
// =====================================================

export async function handler(event, context) {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar OPTIONS (preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Solo permitir método GET
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ 
                    error: 'Método no permitido',
                    allowed: ['GET']
                })
            };
        }

        // Verificar que las variables de entorno estén disponibles
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('❌ Variables de entorno de Supabase no configuradas');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Configuración de Supabase no disponible',
                    success: false
                })
            };
        }

        // Responder con la configuración (estructura corregida para el frontend)
        const config = {
            success: true,
            url: supabaseUrl,
            anon_key: supabaseAnonKey,
            timestamp: new Date().toISOString()
        };

        console.log('✅ Configuración de Supabase enviada exitosamente');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(config)
        };

    } catch (error) {
        console.error('❌ Error en supabase-config:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error interno del servidor',
                success: false,
                timestamp: new Date().toISOString()
            })
        };
    }
}