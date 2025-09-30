const { createClient } = require('@supabase/supabase-js');
const corsUtils = require('./cors-utils');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase;
if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
}

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

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        console.log('🔍 Verificando autenticación del usuario...');

        // Obtener headers de autenticación
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const cookies = event.headers.cookie;
        const userAgent = event.headers['user-agent'];

        console.log('📊 Headers recibidos:', {
            authHeader: authHeader ? 'Presente' : 'Ausente',
            cookies: cookies ? 'Presente' : 'Ausente',
            userAgent: userAgent ? userAgent.substring(0, 50) + '...' : 'Ausente'
        });

        // MÉTODO 1: Verificar token en header Authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            console.log('🔑 Token encontrado en Authorization header');

            if (supabase) {
                try {
                    const { data: { user }, error } = await supabase.auth.getUser(token);

                    if (user && !error) {
                        console.log('✅ Usuario verificado via token:', user.email);

                        return {
                            statusCode: 200,
                            headers: corsHeaders,
                            body: JSON.stringify({
                                success: true,
                                user: {
                                    id: user.id,
                                    email: user.email,
                                    display_name: user.user_metadata?.full_name || user.email,
                                    user_metadata: user.user_metadata || {},
                                    app_metadata: user.app_metadata || {},
                                    created_at: user.created_at
                                },
                                authenticated: true,
                                method: 'token'
                            })
                        };
                    }
                } catch (tokenError) {
                    console.warn('⚠️ Error verificando token:', tokenError.message);
                }
            }
        }

        // MÉTODO 2: Verificar cookies de sesión de Supabase
        if (cookies) {
            console.log('🍪 Verificando cookies de sesión...');

            // Buscar cookies de Supabase
            const cookieArray = cookies.split(';');
            let supabaseCookie = null;

            for (const cookie of cookieArray) {
                const trimmedCookie = cookie.trim();
                if (trimmedCookie.startsWith('sb-') ||
                    trimmedCookie.startsWith('supabase-auth-token') ||
                    trimmedCookie.includes('supabase')) {

                    supabaseCookie = trimmedCookie;
                    console.log('🍪 Cookie de Supabase encontrada:', trimmedCookie.substring(0, 50) + '...');
                    break;
                }
            }

            if (supabaseCookie) {
                // Aquí se podría procesar la cookie de sesión de Supabase
                // Por ahora, indicamos que hay cookie pero no podemos validarla
                console.log('🍪 Cookie de sesión encontrada pero requiere validación en el cliente');
            }
        }

        // MÉTODO 3: Verificar parámetros de query
        const queryParams = event.queryStringParameters || {};

        if (queryParams.user_id) {
            console.log('🔍 user_id proporcionado en query params:', queryParams.user_id);

            // En un escenario real, aquí validaríamos el user_id contra la base de datos
            // Por ahora, devolvemos información básica
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    user: {
                        id: queryParams.user_id,
                        email: queryParams.email || 'user@example.com',
                        display_name: queryParams.display_name || 'Usuario',
                        method: 'query_params'
                    },
                    authenticated: true,
                    method: 'query_params',
                    note: 'Autenticación básica via query params'
                })
            };
        }

        // MÉTODO 4: Verificar si hay información en headers personalizados
        const customUserId = event.headers['x-user-id'];
        const customUserEmail = event.headers['x-user-email'];

        if (customUserId || customUserEmail) {
            console.log('🔍 Headers personalizados encontrados');

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    user: {
                        id: customUserId || 'custom-user',
                        email: customUserEmail || 'user@example.com',
                        display_name: customUserEmail || 'Usuario',
                        method: 'custom_headers'
                    },
                    authenticated: true,
                    method: 'custom_headers'
                })
            };
        }

        // No hay usuario autenticado por ningún método
        console.log('❌ No se encontró usuario autenticado por ningún método');

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                user: null,
                authenticated: false,
                message: 'No authenticated user found',
                methods_tried: [
                    'authorization_header',
                    'supabase_cookies',
                    'query_parameters',
                    'custom_headers'
                ],
                debug: {
                    supabase_available: !!supabase,
                    timestamp: new Date().toISOString()
                }
            })
        };

    } catch (error) {
        console.error('💥 Error verificando sesión:', error);

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor',
                details: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};