# ✅ Checklist de Despliegue Netlify - Personalización Grafana

Lista de verificación completa para asegurar que las gráficas personalizadas funcionen correctamente en Netlify.

## 🗂️ Archivos Netlify Functions Requeridos

### ✅ Funciones Implementadas
- `netlify/functions/get-user-session.js` - Obtener session_id del usuario
- `netlify/functions/grafana-panel.js` - Servir paneles personalizados
- `netlify/functions/grafana-health.js` - Health check de Grafana
- `netlify/functions/cors-utils.js` - Utilidades CORS compartidas
- `netlify/functions/package.json` - Dependencias con node-fetch

### ✅ Funciones de Respaldo (src/netlify/functions/)
- `src/netlify/functions/get-user-session.js` - Backup idéntico
- `src/netlify/functions/grafana-panel.js` - Backup idéntico
- `src/netlify/functions/cors-utils.js` - Backup idéntico

## 🔧 Configuración netlify.toml

### ✅ Redirects Configurados
```toml
[[redirects]]
  from = "/grafana/health"
  to   = "/.netlify/functions/grafana-health"
  status = 200

[[redirects]]
  from = "/grafana/panel/*.png"
  to   = "/.netlify/functions/grafana-panel"
  status = 200

[[redirects]]
  from = "/api/user/session"
  to   = "/.netlify/functions/get-user-session"
  status = 200
```

## 🌍 Variables de Entorno Netlify

### ✅ Variables Requeridas para Grafana
```env
# Variables ya configuradas
DATABASE_URL=postgresql://...
GRAFANA_SA_TOKEN=...

# Variables adicionales verificar
GRAFANA_URL=https://nocode1.grafana.net
NODE_ENV=production
ALLOWED_ORIGINS=https://tu-dominio.netlify.app
```

## 📦 Dependencias package.json

### ✅ Dependencias Agregadas
```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2", 
    "bcryptjs": "^2.4.3",
    "node-fetch": "^3.3.2"  // ← AGREGADO PARA GRAFANA
  }
}
```

## 🧪 Testing Post-Despliegue

### 1. Test Health Check
```bash
curl https://tu-dominio.netlify.app/grafana/health
```
**Respuesta esperada**: `{"status": "OK", "timestamp": "...", "grafana_configured": true}`

### 2. Test Session Endpoint
```bash
curl "https://tu-dominio.netlify.app/api/user/session?user_id=USER_UUID"
```
**Respuestas esperadas**:
- Usuario con cuestionario: `{"session_id": "...", "grafana_ready": true}`
- Usuario sin cuestionario: `{"error": "No se encontró cuestionario"}`

### 3. Test Panel Personalizado
```bash
curl "https://tu-dominio.netlify.app/grafana/panel/1.png?session_id=SESSION_UUID"
```
**Respuesta esperada**: Imagen PNG con datos del usuario específico

### 4. Test Panel General (sin session_id)
```bash
curl "https://tu-dominio.netlify.app/grafana/panel/1.png"
```
**Respuesta esperada**: Imagen PNG con datos generales

## 🚨 Problemas Comunes y Soluciones

### Error: "Module not found: node-fetch"
**Causa**: node-fetch no instalado en Netlify
**Solución**: ✅ Ya agregado a `netlify/functions/package.json`

### Error: "getCorsHeaders is not a function" 
**Causa**: Función faltante en cors-utils.js
**Solución**: ✅ Ya agregada la función getCorsHeaders

### Error 403: "Origin not allowed"
**Causa**: CORS mal configurado
**Solución**: 
1. Verificar `ALLOWED_ORIGINS` en variables de entorno Netlify
2. Agregar dominio de producción: `https://tu-dominio.netlify.app`

### Error 500: "GRAFANA_SA_TOKEN no configurado"
**Causa**: Variable de entorno faltante
**Solución**: 
1. Ir a Netlify Dashboard → Site Settings → Environment variables
2. Agregar `GRAFANA_SA_TOKEN=tu_token_grafana`

### Error: Timeout en requests a Grafana
**Causa**: Timeout muy bajo o Grafana lento
**Solución**: Las funciones usan 15s timeout (adecuado)

### Paneles vacíos o con error
**Causa**: Panel ID inexistente en Grafana
**Solución**: Verificar que los panel IDs existen en el dashboard de Grafana

## 🔄 Flujo de Despliegue Recomendado

### 1. Pre-despliegue
```bash
# Verificar que todas las funciones tengan las dependencias
ls netlify/functions/
cat netlify/functions/package.json

# Verificar redirects en netlify.toml
grep -A 3 "grafana\|user/session" netlify.toml
```

### 2. Despliegue
1. Push a repositorio Git
2. Netlify auto-despliega
3. Verificar que se instalaron las dependencias en el build log

### 3. Post-despliegue
1. **Health Check**: `/grafana/health`
2. **Test Session**: `/api/user/session?user_id=test`
3. **Test Panel**: `/grafana/panel/1.png`
4. **Test Personalizado**: `/grafana/panel/1.png?session_id=test`

## 📋 Variables de Entorno Netlify Necesarias

### ✅ Variables Existentes (de login)
- `DATABASE_URL`
- `USER_JWT_SECRET` 
- `SESSION_SECRET`
- `API_SECRET_KEY`
- `ALLOWED_ORIGINS`

### ✅ Variables Nuevas (para Grafana)
- `GRAFANA_SA_TOKEN` - Token de servicio de Grafana
- `GRAFANA_URL` - URL base de Grafana (opcional, hardcoded por defecto)

## 🎯 URLs de Prueba Final

Una vez desplegado, estas URLs deben funcionar:

1. **Health**: `https://tu-dominio.netlify.app/grafana/health`
2. **Session**: `https://tu-dominio.netlify.app/api/user/session?user_id=UUID`
3. **Panel General**: `https://tu-dominio.netlify.app/grafana/panel/1.png`
4. **Panel Personalizado**: `https://tu-dominio.netlify.app/grafana/panel/1.png?session_id=UUID`

## 💡 Diferencias vs Local

| Aspecto | Local (Express) | Netlify (Functions) |
|---------|----------------|---------------------|
| **Endpoint base** | `http://localhost:3002` | `https://dominio.netlify.app` |
| **Cache** | En memoria (Map) | En memoria por función |
| **Logs** | Console directo | Netlify Function logs |
| **Dependencias** | `package.json` raíz | `netlify/functions/package.json` |
| **CORS** | Express middleware | cors-utils.js manual |
| **Timeout** | Configurable | 15s por función |

---

## ✅ Status Final

**TODO LISTO PARA NETLIFY** 🚀

- ✅ Funciones implementadas
- ✅ Dependencias agregadas  
- ✅ CORS configurado
- ✅ Redirects configurados
- ✅ Variables documentadas
- ✅ Testing preparado

Solo falta configurar `GRAFANA_SA_TOKEN` en las variables de entorno de Netlify y las gráficas personalizadas funcionarán en producción.