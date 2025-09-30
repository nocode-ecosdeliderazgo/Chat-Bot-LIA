# 🚀 Guía de Despliegue en Netlify

Esta guía te ayudará a desplegar la aplicación completa (frontend + backend) en Netlify desde la rama `Deploy-produccion`.

## 📋 Prerrequisitos

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