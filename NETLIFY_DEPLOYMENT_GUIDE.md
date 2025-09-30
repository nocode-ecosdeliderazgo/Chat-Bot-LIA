# 🚀 Guía Completa de Deployment en Netlify

## ⚠️ **PROBLEMA IDENTIFICADO**

Tu aplicación funciona perfectamente en **localhost** pero falla en **Netlify** debido a:

1. ❌ **Variables de entorno faltantes** (especialmente `SUPABASE_ANON_KEY`)
2. ✅ Rutas absolutas correctas (ya implementadas)
3. ✅ netlify.toml configurado correctamente

---

## 📋 **PASO 1: Configurar Variables de Entorno en Netlify**

### Variables CRÍTICAS (sin estas, la app NO funcionará)

Ve a tu dashboard de Netlify:
1. Abre tu sitio en Netlify Dashboard
2. Ve a **Site settings** → **Environment variables**
3. Click en **"Add a variable"** o **"Edit variables"**

### Lista Completa de Variables Requeridas

```bash
# ========================================
# 🔴 CRÍTICO - SUPABASE (Sin esto, comunidades y base de datos fallan)
# ========================================
SUPABASE_URL=https://miwbzotcuaywpdbidpwo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd2J6b3RjdWF5d3BkYmlkcHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTEyMjksImV4cCI6MjA3MDE4NzIyOX0.IKXYAe1JBFc_pcaS6OjxKUVJePwnfHgc0sRO6WpJSBY
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# ========================================
# 🔴 CRÍTICO - OPENAI (Sin esto, el chat de LIA no funciona)
# ========================================
OPENAI_API_KEY=sk-proj-tu_key_aqui
CHATBOT_MODEL=gpt-4o-mini
CHATBOT_MAX_TOKENS=1000
CHATBOT_TEMPERATURE=0.7
CHATBOT_NAME=LIA

# ========================================
# 🟠 IMPORTANTE - SEGURIDAD Y JWT
# ========================================
JWT_SECRET=tu-jwt-secret-key-muy-seguro-y-largo
USER_JWT_SECRET=tu-user-jwt-secret-key-muy-seguro-y-largo
API_SECRET_KEY=tu-api-secret-key-muy-seguro-y-largo
SESSION_SECRET=tu-session-secret-muy-seguro

# ========================================
# 🟠 IMPORTANTE - CONFIGURACIÓN DEL SERVIDOR
# ========================================
NODE_ENV=production
FRONTEND_URL=https://tu-sitio.netlify.app
ALLOWED_ORIGINS=https://tu-sitio.netlify.app,https://www.aprendeyaplica.ai

# ========================================
# 🟡 OPCIONAL - BASE DE DATOS DIRECTA
# ========================================
DATABASE_URL=postgresql://user:pass@host:port/database

# ========================================
# 🟡 OPCIONAL - EMAIL (Para verificación OTP)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# ========================================
# 🟢 OPCIONAL - GOOGLE OAUTH
# ========================================
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret

# ========================================
# 🟢 OPCIONAL - OTRAS CONFIGURACIONES
# ========================================
AUDIO_ENABLED=true
AUDIO_VOLUME=0.7
GEMINI_API_KEY=AI...
```

---

## 🔍 **PASO 2: Verificar Funciones que Necesitan Variables**

### Funciones que REQUIEREN `SUPABASE_ANON_KEY`:
- ✅ `netlify/functions/community-public.js` (línea 47)
- ✅ `netlify/functions/news.js` (línea 5)
- ✅ `netlify/functions/supabase-config.js` (línea 39)

### Funciones que REQUIEREN `SUPABASE_SERVICE_ROLE_KEY`:
- ✅ Todas las funciones de comunidad, progreso, cursos y usuarios

### Funciones que REQUIEREN `OPENAI_API_KEY`:
- ✅ `netlify/functions/openai.js` (Chat de LIA)

---

## 📊 **PASO 3: Testing Post-Deployment**

### 1. Test de Comunidades (API Pública)
Abre la consola del navegador (F12) en tu sitio de Netlify y ejecuta:

```javascript
fetch('https://tu-sitio.netlify.app/api/community-public?limit=5')
  .then(r => r.json())
  .then(data => console.log('✅ Respuesta:', data))
  .catch(error => console.error('❌ Error:', error));
```

**Resultado esperado**: Array de comunidades
**Error común**: `"Configuration missing"` → Variables no configuradas

### 2. Test de Chat LIA (OpenAI)
```javascript
fetch('https://tu-sitio.netlify.app/api/openai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token',
    'X-User-Id': 'test-user'
  },
  body: JSON.stringify({ prompt: 'Hola', context: 'test' })
})
.then(r => r.json())
.then(data => console.log('✅ Respuesta:', data))
.catch(error => console.error('❌ Error:', error));
```

### 3. Test de Assets (CSS, JS, Imágenes)
Abre el **Network tab** (F12) y verifica:
```
✅ /Community/community.css → Status 200
✅ /assets/images/icono.png → Status 200
✅ /scripts/main.js → Status 200
```

---

## 📋 **Prerrequisitos (Original)

- Cuenta en Netlify
- Cuenta en Supabase (para la base de datos)
- API Keys de OpenAI y Gemini
- Configuración de Google OAuth (opcional)
- Configuración de SMTP para emails

## 🔧 Configuración de Netlify

### 1. Conectar Repositorio

1. Ve a [Netlify](https://app.netlify.com/)
2. Click en "Add new site" → "Import an existing project"
3. Conecta tu repositorio de GitHub/GitLab
4. Selecciona la rama `Deploy-produccion`

### 2. Configuración de Build

La configuración de build ya está incluida en `netlify.toml`:

```toml
[build]
  base = "."
  publish = "src"
  command = "npm install && npm run setup"
  node_version = "18"
```

### 3. Variables de Entorno

Configura las siguientes variables de entorno en Netlify (Site settings → Environment variables):

#### Base de Datos (Requerido)
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Autenticación (Requerido)
```
JWT_SECRET=tu-jwt-secret-key-muy-seguro
USER_JWT_SECRET=tu-user-jwt-secret-key-muy-seguro
API_SECRET_KEY=tu-api-secret-key-muy-seguro
```

#### APIs de IA (Requerido)
```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...
CHATBOT_MODEL=gpt-4o-mini
```

#### Configuración General (Requerido)
```
NODE_ENV=production
FRONTEND_URL=https://tu-sitio.netlify.app
ALLOWED_ORIGINS=https://tu-sitio.netlify.app,https://www.aprendeyaplica.ai
```

#### Email (Opcional pero recomendado)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

#### Google OAuth (Opcional)
```
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
```

## 🏗️ Estructura del Proyecto

```
/
├── src/                    # Frontend (HTML, CSS, JS)
├── netlify/functions/      # Backend (Serverless functions)
├── netlify.toml           # Configuración de Netlify
├── package.json           # Dependencias principales
└── server.js             # Servidor local (no se usa en Netlify)
```

## 🔄 Funcionamiento en Netlify

### Frontend
- Los archivos estáticos se sirven desde `/src`
- HTML, CSS, JS se cargan directamente
- Las imágenes y assets están en `/src/assets`

### Backend
- Las funciones serverless están en `/netlify/functions`
- Cada función maneja diferentes endpoints de la API
- Los redirects en `netlify.toml` enrutan `/api/*` a las funciones

### API Endpoints
Todos los endpoints `/api/*` se redirigen automáticamente a las funciones correspondientes:

- `/api/login` → `/.netlify/functions/login`
- `/api/register` → `/.netlify/functions/register-with-email`
- `/api/openai` → `/.netlify/functions/openai`
- `/api/community/*` → `/.netlify/functions/community`
- Y muchos más...

## 🚨 Problemas Comunes y Soluciones

### 1. Error 404 en APIs
**Problema**: Las llamadas a `/api/*` devuelven 404
**Solución**: Verificar que `netlify.toml` esté en la raíz y los redirects estén configurados

### 2. Variables de Entorno No Encontradas
**Problema**: Funciones fallan por variables faltantes
**Solución**: Verificar que todas las variables estén configuradas en Netlify

### 3. Error de CORS
**Problema**: Frontend no puede conectar con las APIs
**Solución**: Configurar `ALLOWED_ORIGINS` con la URL de Netlify

### 4. Error de Base de Datos
**Problema**: No se puede conectar a Supabase
**Solución**: Verificar `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`

## 🧪 Testing del Despliegue

### 1. Verificar Frontend
- Acceder a la URL de Netlify
- Verificar que la página principal carga
- Probar navegación entre secciones

### 2. Verificar Backend
- Probar login/registro
- Verificar que el chat con IA funciona
- Probar la comunidad y cursos

### 3. Verificar Funciones
Puedes probar las funciones directamente:
- `https://tu-sitio.netlify.app/.netlify/functions/test`
- `https://tu-sitio.netlify.app/api/supabase-config`

## 📝 Logs y Debugging

### Ver Logs de Netlify
1. Ve a tu sitio en Netlify
2. Functions → View logs
3. Revisar errores en tiempo real

### Debug Local
Para probar localmente antes de desplegar:
```bash
npm install -g netlify-cli
netlify dev
```

## 🔄 Actualizaciones

### Despliegue Automático
Netlify se actualiza automáticamente cuando:
- Haces push a la rama `Deploy-produccion`
- Las funciones se recompilan automáticamente

### Despliegue Manual
Si necesitas redesplegar:
1. Ve a Deploys en Netlify
2. Click en "Trigger deploy"
3. Selecciona "Deploy site"

## ✅ Checklist de Despliegue

- [ ] Repositorio conectado a Netlify
- [ ] Rama `Deploy-produccion` seleccionada
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Frontend carga correctamente
- [ ] APIs responden correctamente
- [ ] Autenticación funciona
- [ ] Chat con IA funciona
- [ ] Sistema de comunidad funciona
- [ ] Emails se envían (si configurado)

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs de Netlify
2. Verifica las variables de entorno
3. Comprueba que `netlify.toml` esté actualizado
4. Asegúrate de estar en la rama `Deploy-produccion`

¡Tu aplicación debería estar funcionando perfectamente en Netlify! 🎉