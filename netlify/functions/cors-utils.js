// netlify/functions/_cors-utils.js
// Utilidades compartidas para CORS en funciones de Netlify

// Configuración de CORS - debe coincidir con server.js
const allowedOriginsFromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

const hostnameWhitelist = [
    'ecosdeliderazgo.com',
    'www.ecosdeliderazgo.com'
];

const tldsWhitelist = [
    'netlify.app',
    'netlify.live',
    'herokuapp.com'
];

function isHostAllowed(hostname) {
    if (!hostname) return false;
    if (hostnameWhitelist.includes(hostname)) return true;
    return tldsWhitelist.some(tld => hostname.endsWith(`.${tld}`));
}

function isOriginAllowed(origin) {
    console.log('[CORS Debug] Origin:', origin);
    console.log('[CORS Debug] ALLOWED_ORIGINS env:', process.env.ALLOWED_ORIGINS);
    console.log('[CORS Debug] allowedOriginsFromEnv:', allowedOriginsFromEnv);
    
    if (!origin) return true; // Permitir requests sin Origin (same-origin)
    
    // Si se configuró ALLOWED_ORIGINS, aceptar coincidencia exacta o por hostname
    if (allowedOriginsFromEnv.length > 0) {
        console.log('[CORS Debug] Using ALLOWED_ORIGINS from env');
        if (allowedOriginsFromEnv.includes(origin)) {
            console.log('[CORS Debug] Origin found in exact match');
            return true;
        }
        try {
            const host = new URL(origin).hostname;
            console.log('[CORS Debug] Origin hostname:', host);
            const hostMatch = allowedOriginsFromEnv.some(value => {
                try {
                    const valHost = new URL(value).hostname;
                    console.log('[CORS Debug] Comparing with:', valHost);
                    return valHost === host;
                } catch { return false; }
            });
            console.log('[CORS Debug] Host match result:', hostMatch);
            return hostMatch;
        } catch {
            console.log('[CORS Debug] Error parsing origin URL');
            return false;
        }
    }
    
    // Sin ALLOWED_ORIGINS, usar whitelist por hostname/TLD
    console.log('[CORS Debug] Using fallback hostname whitelist');
    try {
        const host = new URL(origin).hostname;
        const allowed = isHostAllowed(host);
        console.log('[CORS Debug] Hostname whitelist result:', allowed);
        return allowed;
    } catch {
        console.log('[CORS Debug] Error parsing origin URL for fallback');
        return false;
    }
}

function createCorsResponse(status, data, event = null, includeCredentials = false) {
    const origin = event && (event.headers['origin'] || event.headers['Origin']);
    const originAllowed = isOriginAllowed(origin);
    
    // Si el origen no está permitido, devolver error 403
    if (!originAllowed) {
        return {
            statusCode: 403,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Origin not allowed' })
        };
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '*',
        'Vary': 'Origin',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization, X-User-Id, X-API-Key',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    };

    if (includeCredentials) {
        headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    return {
        statusCode: status,
        headers,
        body: JSON.stringify(data)
    };
}

function getCorsHeaders(event) {
    const origin = event && (event.headers['origin'] || event.headers['Origin']);
    const originAllowed = isOriginAllowed(origin);
    
    if (!originAllowed) {
        return {
            'Content-Type': 'application/json'
        };
    }
    
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Vary': 'Origin',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization, X-User-Id, X-API-Key',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
    };
}

module.exports = {
    isOriginAllowed,
    createCorsResponse,
    getCorsHeaders
};