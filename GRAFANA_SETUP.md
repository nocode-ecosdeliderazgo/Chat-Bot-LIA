# 📊 Configuración de Grafana para Panel de Estadísticas

## 🚨 Problema Actual

El error que estás viendo indica un problema de permisos:
```
"User "API" cannot get resource "dashboards/dto" in API group "dashboard.grafana.app"
```

## 🔧 Solución: Configurar Service Account con Permisos Correctos

### 1. **Crear Service Account en Grafana**

1. Ve a **Administration** → **Service Accounts** en tu Grafana
2. Haz clic en **"New service account"**
3. Configura:
   - **Name**: `chat-bot-lia-renderer`
   - **Display name**: `Chat Bot LIA Dashboard Renderer`
   - **Role**: `Viewer` (mínimo) o `Editor` (recomendado)

### 2. **Generar Token**

1. Después de crear el Service Account, haz clic en él
2. En la sección **"Tokens"**, haz clic **"Add service account token"**
3. Configura:
   - **Name**: `rendering-token`
   - **Expiration**: Sin expiración o fecha lejana
4. **Copia el token generado** (solo se muestra una vez)

### 3. **Verificar Permisos del Dashboard**

1. Ve a tu dashboard `cuestionario-ia2`
2. Haz clic en **⚙️ Dashboard settings**
3. Ve a la pestaña **"Permissions"**
4. Asegúrate de que el Service Account o su rol tenga permisos de **"View"**

### 4. **Configurar Variables de Entorno**

Añade el token a tu archivo `.env`:
```bash
GRAFANA_SA_TOKEN=glsa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. **Verificar Configuración**

1. Reinicia el servidor: `npm start`
2. Verifica el health check: `http://localhost:3000/grafana/health`
3. Debe mostrar `"grafana_configured": true`

## 🔍 Troubleshooting

### Si sigue sin funcionar:

1. **Verifica la URL del dashboard**:
   - Asegúrate de que el UID `057abaf9-2e0f-4aa4-99b0-3b0e2990c5aa` es correcto
   - Ve al dashboard en Grafana y verifica la URL

2. **Prueba permisos manualmente**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        "https://nocode1.grafana.net/api/dashboards/uid/057abaf9-2e0f-4aa4-99b0-3b0e2990c5aa"
   ```

3. **Verifica que los panels existen**:
   - Panel ID 1, 6, y 8 deben existir en el dashboard
   - Puedes cambiar los IDs en `server.js` si son diferentes

## 🎯 Alternativa: Usar Snapshots Públicos

Si los permisos son complicados, puedes:

1. Crear snapshots públicos de cada panel
2. Usar las URLs directas de los snapshots
3. Modificar `estadisticas.html` para usar esas URLs

## 📝 Estados Actuales

- ✅ **Fallback funcionando**: Si Grafana falla, verás placeholders SVG
- ✅ **Health check**: `/grafana/health` para verificar configuración  
- ✅ **Manejo de errores**: El sistema no se rompe si Grafana no responde
- ⏳ **Permisos**: Necesita configuración correcta del Service Account

## 🚀 Una vez configurado correctamente

Las imágenes se cargarán automáticamente desde Grafana con:
- Datos reales de tu dashboard
- Tema oscuro
- Resolución 800x400
- Cache de 5 minutos
- Variables de sesión dinámicas (cuando integres Supabase)