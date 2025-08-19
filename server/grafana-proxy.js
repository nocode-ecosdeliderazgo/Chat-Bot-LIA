// server/grafana-proxy.js
const express = require("express");
const router = express.Router();

const {
  GRAFANA_URL,
  GRAFANA_API_KEY,
  GRAFANA_DASHBOARD_UID,
  GRAFANA_DASHBOARD_SLUG,
  GRAFANA_ORG_ID
} = process.env;

// Log de env (enmascara la key)
console.log("[grafana] URL:", GRAFANA_URL);
console.log("[grafana] UID:", GRAFANA_DASHBOARD_UID, "SLUG:", GRAFANA_DASHBOARD_SLUG, "ORG:", GRAFANA_ORG_ID || 1);

router.get("/panel.png", async (req, res) => {
  try {
    const {
      panelId = "1",
      session_id = "",
      from = "now-30d",
      to = "now",
      tz = "browser",
      width = "1000",
      height = "450"
    } = req.query;

    const url = new URL(`${GRAFANA_URL}/render/d-solo/${GRAFANA_DASHBOARD_UID}/${GRAFANA_DASHBOARD_SLUG}`);
    url.searchParams.set("panelId", String(panelId));
    url.searchParams.set("from", String(from));
    url.searchParams.set("to", String(to));
    url.searchParams.set("tz", String(tz));
    url.searchParams.set("width", String(width));
    url.searchParams.set("height", String(height));
    url.searchParams.set("orgId", String(GRAFANA_ORG_ID || 1));
    if (session_id) url.searchParams.set("var-session_id", String(session_id));

    console.log("[grafana] render GET:", url.toString());

    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GRAFANA_API_KEY}`,
        Accept: "image/png"
      }
    });

    const ct = r.headers.get("content-type") || "";
    const buf = Buffer.from(await r.arrayBuffer());
    console.log("[grafana] status:", r.status, "ct:", ct);

    // Si devuelve HTML, es un error de ruta/permiso/renderer y necesitamos ver el cuerpo
    res.status(r.status)
      .set("Content-Type", ct.includes("image") ? "image/png" : "text/html; charset=utf-8")
      .end(buf);
  } catch (e) {
    console.error("[grafana] proxy error:", e);
    res.status(500).send("Grafana proxy error");
  }
});

// Endpoint de depuración para ver exactamente qué devuelve
router.get("/panel.debug", async (req, res) => {
  try {
    const u = new URL(req.protocol + "://" + req.get("host") + req.originalUrl.replace("/panel.debug", "/panel.png"));
    const r = await fetch(u, { headers: {} });
    const ct = r.headers.get("content-type") || "";
    const text = await r.text();
    res.json({ requested: u.toString(), status: r.status, contentType: ct, bodyPreview: text.slice(0, 400) });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

module.exports = router;
