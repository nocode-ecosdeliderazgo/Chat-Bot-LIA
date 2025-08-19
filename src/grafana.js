// server/grafana-proxy.js (Node/Express)
const express = require('express');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const GRAFANA_URL = "https://nocode1.grafana.net";
const DASH_UID = "057abaf9-2e0f-4aa4-99b0-3b0e2990c5aa"; // Tu UID real
const DASH_SLUG = "cuestionario-ia2";
const GRAFANA_TOKEN = process.env.GRAFANA_SA_TOKEN; // Service Account (Bearer)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // para consultar sesiones

// Inicializar Supabase solo si las credenciales están disponibles
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        supabase: !!supabase,
        grafana_token: !!GRAFANA_TOKEN
    });
});

// Ej: /grafana/panel/1.png -> devuelve PNG del panelId=1 para el usuario autenticado
app.get("/grafana/panel/:panelId.png", async (req, res) => {
  try {
    console.log(`Solicitando panel ${req.params.panelId}`);

    // Verificar configuración básica
    if (!GRAFANA_TOKEN) {
      return res.status(500).json({ error: 'GRAFANA_SA_TOKEN no configurado' });
    }

    // Por ahora usar un session_id fijo para testing
    // En producción usar el código de Supabase comentado abajo
    const sessionId = "test-session-123";

    /* Código para producción con Supabase:
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase no configurado' });
    }

    // 1) Identifica usuario de tu app (según tu auth; aquí un ejemplo simple con header)
    const userId = req.headers["x-user-id"]; 
    if (!userId) return res.status(401).send("No auth");

    // 2) Última sesión de ese usuario
    const { data, error } = await supabase
      .from("user_questionnaire_sessions")
      .select("id")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false, nullsFirst: false })
      .order("started_at", { ascending: false })
      .limit(1);

    if (error || !data?.[0]) return res.status(404).send("Sin sesión");
    const sessionId = data[0].id;
    */

    // 3) Render del panel con var-session_id fijo en servidor
    const url = new URL(`${GRAFANA_URL}/render/d-solo/${DASH_UID}/${DASH_SLUG}`);
    url.searchParams.set("orgId", "1");
    url.searchParams.set("panelId", req.params.panelId);
    url.searchParams.set("var-session_id", sessionId);
    url.searchParams.set("from", "now-30d");
    url.searchParams.set("to", "now");
    url.searchParams.set("theme", "dark");
    url.searchParams.set("width", "800");
    url.searchParams.set("height", "400");

    console.log(`Fetching: ${url.toString()}`);

    const r = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${GRAFANA_TOKEN}`,
        'User-Agent': 'Grafana-Proxy/1.0'
      }
    });

    console.log(`Grafana response: ${r.status} ${r.statusText}`);

    if (!r.ok) {
      const errorText = await r.text();
      console.error('Grafana error:', errorText);
      return res.status(r.status).json({ 
        error: 'Error from Grafana', 
        status: r.status,
        details: errorText.slice(0, 200)
      });
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "private, max-age=60");
    
    const buffer = Buffer.from(await r.arrayBuffer());
    console.log(`Serving image buffer of ${buffer.length} bytes`);
    res.send(buffer);

  } catch (e) {
    console.error('Server error:', e);
    res.status(500).json({ error: 'Internal server error', details: String(e) });
  }
});

app.listen(3001, () => console.log("Grafana proxy on :3001"));