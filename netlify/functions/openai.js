const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

function json(status, data) {
    return {
        statusCode: status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization, X-User-Id',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
        },
        body: JSON.stringify(data)
    };
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
    try {
        const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
        const userId = event.headers['x-user-id'] || event.headers['X-User-Id'];
        if (!authHeader.startsWith('Bearer ') || !userId) return null;
        const token = authHeader.slice(7);
        const secret = process.env.JWT_SECRET;
        if (!secret) return null;
        const payload = jwt.verify(token, secret);
        if (String(payload.sub) !== String(userId)) return null;
        return { userId: String(userId), username: payload.username || 'user' };
    } catch (_) { return null; }
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

    try {
        const user = verifyUser(event);
        if (!user) return json(401, { error: 'Sesión requerida' });

        if (!process.env.OPENAI_API_KEY) {
            return json(500, { error: 'Configuración de OpenAI faltante' });
        }

        const { prompt, context } = JSON.parse(event.body || '{}');
        if (!prompt) return json(400, { error: 'Prompt requerido' });

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
            return json(500, { error: 'Error en la API de OpenAI', details: `Status ${res.status}: ${t.substring(0, 200)}` });
        }
        const data = await res.json();
        const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!content || !String(content).trim()) {
            return json(200, { response: 'Lo siento, hubo un problema técnico con la respuesta.' });
        }
        return json(200, { response: String(content).trim() });
    } catch (e) {
        console.error('openai fn error', e);
        return json(500, { error: 'Error procesando la solicitud' });
    }
};


