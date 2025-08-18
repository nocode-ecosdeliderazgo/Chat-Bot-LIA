const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { createCorsResponse } = require('./cors-utils');

function json(status, data, event = null) {
    return createCorsResponse(status, data, event);
}

function safeRead(filePath) {
    try { return fs.readFileSync(filePath, 'utf8'); } catch (_) { return ''; }
}

function getPrompts() {
    const base = path.join(process.cwd(), 'prompts');
    const system = safeRead(path.join(base, 'system.es.md'));
    const style = safeRead(path.join(base, 'style.es.md'));
    const tools = safeRead(path.join(base, 'tools.es.md'));
    const safety = safeRead(path.join(base, 'safety.es.md'));
    const useCases = safeRead(path.join(base, 'use_cases.es.md'));
    const examples = safeRead(path.join(base, 'examples.es.md'));
    const combined = [system, style, safety, tools, useCases]
        .filter(Boolean)
        .join('\n\n')
        .trim();
    return { system, style, tools, safety, useCases, examples, combined };
}

function verifyUser(event) {
    console.log('[VERIFY USER] Starting verification');
    try {
        const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
        const userId = event.headers['x-user-id'] || event.headers['X-User-Id'];
        console.log('[VERIFY USER] Auth header exists:', !!authHeader);
        console.log('[VERIFY USER] User ID:', userId);
        
        if (!authHeader.startsWith('Bearer ') || !userId) {
            console.log('[VERIFY USER] Missing auth header or user ID');
            return null;
        }
        const token = authHeader.slice(7);
        console.log('[VERIFY USER] Token preview:', token.substring(0, 30) + '...');
        
        // MODO DESARROLLO: Aceptar tokens de desarrollo
        if (token.includes('fake-signature-for-dev-testing-only')) {
            console.log('[DEV AUTH] Aceptando token de desarrollo');
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    console.log('[DEV AUTH] Payload decoded:', payload);
                    if (payload.sub && payload.username) {
                        const result = { 
                            userId: String(payload.sub), 
                            username: payload.username || 'dev-user' 
                        };
                        console.log('[DEV AUTH] Success:', result);
                        return result;
                    }
                }
            } catch (decodeError) {
                console.log('[DEV AUTH] Decode error:', decodeError.message);
            }
            console.log('[DEV AUTH] Using fallback');
            return { userId: String(userId), username: 'dev-user' };
        }
        
        // MODO PRODUCCIÓN: Verificar JWT normal
        const secret = process.env.JWT_SECRET;
        console.log('[VERIFY USER] JWT_SECRET exists:', !!secret);
        if (!secret) {
            console.log('[VERIFY USER] No JWT_SECRET found');
            return null;
        }
        const payload = jwt.verify(token, secret);
        if (String(payload.sub) !== String(userId)) return null;
        return { userId: String(userId), username: payload.username || 'user' };
    } catch (error) { 
        console.log('[VERIFY USER] Exception:', error.message);
        return null; 
    }
}

exports.handler = async (event) => {
    console.log('[OPENAI HANDLER] Request method:', event.httpMethod);
    console.log('[OPENAI HANDLER] Headers:', JSON.stringify(event.headers, null, 2));
    
    if (event.httpMethod === 'OPTIONS') return json(200, { ok: true }, event);
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

    try {
        // MODO DESARROLLO: Omitir verificación de usuario para testing
        const apiKey = event.headers['x-api-key'] || event.headers['X-API-Key'];
        console.log('[OPENAI HANDLER] API Key:', apiKey);
        
        if (apiKey === 'dev-api-key') {
            console.log('[OPENAI HANDLER] Modo desarrollo - omitiendo verificación de usuario');
            // En modo desarrollo, crear un usuario ficticio
            var user = { userId: 'dev-user', username: 'dev-user' };
        } else {
            const user = verifyUser(event);
            console.log('[OPENAI HANDLER] User verification result:', user);
            if (!user) return json(401, { error: 'Sesión requerida' }, event);
        }

        if (!process.env.OPENAI_API_KEY) {
            return json(500, { error: 'Configuración de OpenAI faltante' }, event);
        }

        const { prompt, context } = JSON.parse(event.body || '{}');
        if (!prompt) return json(400, { error: 'Prompt requerido' }, event);

        const { combined, examples } = getPrompts();

        let systemContent = combined || 'Eres un asistente educativo especializado en IA.';
        if (context && String(context).trim()) {
            systemContent += `\n\nContexto adicional de la base de datos:\n${context}`;
        }

        const messages = [
            { role: 'system', content: systemContent }
        ];
        if (examples && examples.trim()) {
            messages.push({ role: 'system', content: `Ejemplos de estilo y formato:\n\n${examples.substring(0, 4000)}` });
        }
        messages.push({ role: 'user', content: prompt });

        const body = {
            model: process.env.CHATBOT_MODEL || 'gpt-4o-mini',
            messages,
            max_tokens: parseInt(process.env.CHATBOT_MAX_TOKENS || '900', 10),
            temperature: parseFloat(process.env.CHATBOT_TEMPERATURE || '0.5'),
            top_p: 0.9
        };

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const t = await res.text();
            return json(500, { error: 'Error en la API de OpenAI', details: `Status ${res.status}: ${t.substring(0, 200)}` }, event);
        }
        const data = await res.json();
        const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!content || !String(content).trim()) {
            return json(200, { response: 'Lo siento, hubo un problema técnico con la respuesta.' }, event);
        }
        return json(200, { response: String(content).trim() }, event);
    } catch (e) {
        console.error('openai fn error', e);
        return json(500, { error: 'Error procesando la solicitud' }, event);
    }
};


