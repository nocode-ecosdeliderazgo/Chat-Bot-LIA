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
    if (!origin) return true; // Permitir requests sin Origin (same-origin)
    
    // Si se configuró ALLOWED_ORIGINS, aceptar coincidencia exacta o por hostname
    if (allowedOriginsFromEnv.length > 0) {
        if (allowedOriginsFromEnv.includes(origin)) return true;
        try {
            const host = new URL(origin).hostname;
            return allowedOriginsFromEnv.some(value => {
                try {
                    const valHost = new URL(value).hostname;
                    return valHost === host;
                } catch { return false; }
            });
        } catch {
            return false;
        }
    }
    
    // Sin ALLOWED_ORIGINS, usar whitelist por hostname/TLD
    try {
        const host = new URL(origin).hostname;
        return isHostAllowed(host);
    } catch {
        return false;
    }
}

function createCorsResponse(status, data, event = null, includeCredentials = false) {
    const origin = event && (event.headers['origin'] || event.headers['Origin']);
    const allowedOrigin = isOriginAllowed(origin) ? (origin || '*') : null;
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin || 'null',
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
        body: JSON.stringify(allowedOrigin ? data : { error: 'Origin not allowed' })
    };
}

module.exports = {
    isOriginAllowed,
    createCorsResponse
};