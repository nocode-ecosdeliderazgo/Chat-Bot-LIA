# 🔐 Variables de Entorno Requeridas para Netlify

## Variables Críticas Faltantes

### ⚠️ SUPABASE_ANON_KEY (CRÍTICO)
**Variable name**: `SUPABASE_ANON_KEY`
**Value**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd2J6b3RjdWF5d3BkYmlkcHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTEyMjksImV4cCI6MjA3MDE4NzIyOX0.IKXYAe1JBFc_pcaS6OjxKUVJePwnfHgc0sRO6WpJSBY
```
**Ubicación**: `netlify/functions/community-public.js:48`
**Impacto**: Sin esta variable, las comunidades no cargarán en producción

---

## ✅ Variables Completas Requeridas

Configura TODAS estas variables en Netlify Dashboard:

### 1. Supabase Configuration (CRÍTICO)
```bash
SUPABASE_URL=https://miwbzotcuaywpdbidpwo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd2J6b3RjdWF5d3BkYmlkcHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTEyMjksImV4cCI6MjA3MDE4NzIyOX0.IKXYAe1JBFc_pcaS6OjxKUVJePwnfHgc0sRO6WpJSBY
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
SUPABASE_SERVICE_KEY=<tu-service-role-key>  # Alias usado por algunas funciones
SUPABASE_KEY=<tu-anon-key>  # Fallback usado por algunas funciones
```

### 2. OpenAI Configuration (CRÍTICO)
```bash
OPENAI_API_KEY=<tu-api-key-openai>
```

### 3. Security Configuration (CRÍTICO)
```bash
JWT_SECRET=<tu-secret-jwt>
NODE_ENV=production
```

### 4. CORS Configuration (IMPORTANTE)
```bash
ALLOWED_ORIGINS=https://tu-sitio.netlify.app,https://www.aprendeyaplica.ai
```

### 5. Database Configuration (OPCIONAL - si usas PostgreSQL directo)
```bash
DATABASE_URL=postgresql://user:pass@host:port/database
```

---

## 📋 Pasos para Configurar en Netlify

### Opción A: Netlify Dashboard (Recomendado)

1. Ve a: https://app.netlify.com/sites/[tu-sitio]/settings/deploys#environment
2. Click en **"Edit variables"** o **"Add variable"**
3. Para cada variable:
   - **Variable name**: Copia exactamente el nombre
   - **Value**: Pega el valor correspondiente
   - Click en **"Add"**
4. Después de agregar todas, click en **"Save"**
5. Netlify hará **auto-redeploy** automáticamente (~2 min)

### Opción B: Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link al sitio
netlify link

# Configurar variables
netlify env:set SUPABASE_URL "https://miwbzotcuaywpdbidpwo.supabase.co"
netlify env:set SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
netlify env:set SUPABASE_SERVICE_ROLE_KEY "tu-service-role-key"
netlify env:set OPENAI_API_KEY "tu-openai-key"
netlify env:set JWT_SECRET "tu-jwt-secret"
netlify env:set NODE_ENV "production"

# Trigger nuevo deploy
netlify deploy --prod
```

---

## 🧪 Verificación Post-Configuración

### Test 1: Verificar Variables en Netlify Functions
```javascript
// En la consola del navegador (F12):
fetch('https://[tu-sitio].netlify.app/api/community-public?limit=5')
  .then(r => r.json())
  .then(console.log)

// ✅ Esperado: Array de comunidades con datos
// ❌ Error: "Configuration missing" o "undefined" → Variables no configuradas
```

### Test 2: Verificar Supabase Connection
```javascript
// En la consola del navegador:
console.log('SUPABASE_URL:', window.supabase?.supabaseUrl);
console.log('SUPABASE_KEY:', window.supabase?.supabaseKey ? 'Configurado' : 'Faltante');

// ✅ Esperado: URLs y confirmación de key configurada
```

### Test 3: Network Tab Verification
1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Recarga la página
4. Busca requests a `/api/community-public` o `/.netlify/functions/community-public`
5. Verifica que respondan con status **200** y datos válidos

---

## 🚨 Troubleshooting

### Problema: Variables no se aplican después de configurar
**Solución**:
1. Verifica que no haya espacios extra en nombres o valores
2. Espera 2-3 minutos para que el auto-redeploy se complete
3. Si no funciona, trigger manual deploy:
   ```bash
   # En la terminal local
   git commit --allow-empty -m "Trigger Netlify redeploy"
   git push origin Deploy-produccion
   ```

### Problema: "Configuration missing" en las funciones
**Solución**:
1. Verifica que `SUPABASE_ANON_KEY` esté exactamente como aparece arriba
2. No uses comillas dentro del valor en Netlify UI
3. Revisa los logs de la función: Netlify Dashboard → Functions → Ver logs

### Problema: CORS errors
**Solución**: Las variables de entorno NO solucionan CORS. Verifica `netlify.toml` headers.

---

## 📚 Recursos Adicionales

- [Netlify Environment Variables Documentation](https://docs.netlify.com/configure-builds/environment-variables/)
- [Supabase Keys Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Netlify Functions Environment](https://docs.netlify.com/functions/build-with-javascript/#environment-variables)

---

_Última actualización: 2025-09-30_