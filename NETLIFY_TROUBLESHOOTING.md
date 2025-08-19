# 🚨 Troubleshooting Netlify - Grafana Functions

## Problema Actual
Error 404 en `https://ecosdeliderazgo.com/grafana/panel/1.png`

## ✅ Verificaciones Completadas
- Funciones existen en `netlify/functions/`
- `package.json` tiene dependencias correctas
- Redirects reordenados por prioridad en `netlify.toml`

## 🔧 Pasos de Solución

### 1. **CRÍTICO: Configurar Variables de Entorno**
En Netlify Dashboard → Site Settings → Environment variables:
```env
GRAFANA_SA_TOKEN=tu_token_grafana_actual
DATABASE_URL=tu_database_url_actual
```

### 2. **Test Health Check**
```bash
curl https://ecosdeliderazgo.com/grafana/health
```
**Esperado**: `{"status": "OK", "grafana_configured": true}`

### 3. **Test Función Directa**
```bash
curl https://ecosdeliderazgo.com/.netlify/functions/grafana-health
```

### 4. **Force Redeploy**
Netlify Dashboard → Deploys → "Clear cache and deploy site"

## 🚨 Soluciones de Emergencia

### Opción A: Usar URLs Directas de Funciones
Modificar `src/estadisticas.html`:
```javascript
// En lugar de:
const imageUrl = `/grafana/panel/${panelId}.png`;

// Usar:
const imageUrl = `/.netlify/functions/grafana-panel?panelId=${panelId}`;
```

### Opción B: Crear Función Proxy Alternativa
```javascript
// netlify/functions/grafana-proxy.js
exports.handler = async (event, context) => {
    const panelId = event.queryStringParameters?.panelId || '1';
    // Redirigir a función principal
    return {
        statusCode: 302,
        headers: {
            'Location': `/.netlify/functions/grafana-panel?panelId=${panelId}`
        }
    };
};
```

## 📋 Checklist de Verificación

- [ ] Variables de entorno configuradas en Netlify
- [ ] Health check funciona: `/grafana/health`
- [ ] Función directa funciona: `/.netlify/functions/grafana-health`
- [ ] Redeploy con cache limpio completado
- [ ] Build logs sin errores de funciones
- [ ] Panel individual funciona: `/grafana/panel/1.png`

## 🎯 Próximos Pasos

1. **Configura las variables de entorno**
2. **Haz un force redeploy**
3. **Prueba los endpoints en orden**
4. **Si sigue fallando, usa solución de emergencia**