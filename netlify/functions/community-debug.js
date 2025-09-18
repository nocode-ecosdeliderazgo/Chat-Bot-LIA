/**
 * Netlify Function para debugging de Community API
 * Endpoint: GET /api/community/debug
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Headers CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

exports.handler = async (event, context) => {
    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        const { httpMethod, path, headers, queryStringParameters } = event;

        console.log('🔍 Community Debug API Called');
        console.log('Method:', httpMethod);
        console.log('Path:', path);
        console.log('Headers:', headers);
        console.log('Query:', queryStringParameters);

        // Verificar variables de entorno
        const envCheck = {
            SUPABASE_URL: !!supabaseUrl,
            SUPABASE_SERVICE_KEY: !!supabaseServiceKey,
            supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT_SET',
            serviceKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
        };

        // Verificar conexión a Supabase
        let supabaseCheck = { connected: false, error: null };
        try {
            if (supabaseUrl && supabaseServiceKey) {
                const supabase = createClient(supabaseUrl, supabaseServiceKey);
                const { data, error } = await supabase
                    .from('community_questions')
                    .select('count(*)', { count: 'exact' })
                    .limit(1);

                supabaseCheck = {
                    connected: !error,
                    error: error?.message || null,
                    questionsCount: data ? 'accessible' : 'not_accessible'
                };
            }
        } catch (error) {
            supabaseCheck = {
                connected: false,
                error: error.message
            };
        }

        // Verificar funciones disponibles
        const availableFunctions = {
            'community-vote': 'Available',
            'community-answers': 'Available',
            'community-questions': 'Available',
            'community-debug': 'Available (current)'
        };

        const debugInfo = {
            timestamp: new Date().toISOString(),
            netlify: {
                context: context,
                region: process.env.AWS_REGION || 'unknown'
            },
            environment: envCheck,
            supabase: supabaseCheck,
            functions: availableFunctions,
            request: {
                method: httpMethod,
                path: path,
                userAgent: headers['user-agent'] || 'unknown',
                origin: headers.origin || 'unknown'
            }
        };

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Community API Debug Information',
                debug: debugInfo
            }, null, 2)
        };

    } catch (error) {
        console.error('❌ Error en community-debug:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor: ' + error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};