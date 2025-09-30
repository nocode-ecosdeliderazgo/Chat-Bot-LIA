# ✅ Checklist de Despliegue Netlify - Aprende y Aplica

## 📋 Pre-Despliegue

### 1. Verificaciones de Código
- [x] Rama `Deploy-produccion` actualizada con todos los cambios
- [x] Archivo `netlify.toml` configurado correctamente
- [x] Funciones Netlify en `/netlify/functions/` funcionando
- [x] Dependencias instaladas en `/netlify/functions/`
- [x] Build script configurado en `package.json`
- [x] Archivos estáticos en directorio `/src/`

### 2. Configuración de Archivos
- [x] `netlify.toml` - Configuración de build y redirects
- [x] `_redirects` - Redirects adicionales (si es necesario)
- [x] `package.json` - Scripts de build configurados
- [x] Funciones serverless en `/netlify/functions/`

### 3. Documentación Creada
- [x] `NETLIFY_DEPLOYMENT_GUIDE.md` - Guía completa de despliegue
- [x] `.env.netlify.example` - Template de variables de entorno
- [x] `NETLIFY_DEPLOYMENT_CHECKLIST.md` - Este checklist

## 🚀 Configuración en Netlify

### 1. Configuración de Site
- [ ] Conectar repositorio GitHub
- [ ] Seleccionar rama: `Deploy-produccion`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `src`
- [ ] Node version: `18`

### 2. Variables de Entorno (Site Settings > Environment Variables)

#### Base de Datos y Supabase
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`

#### Seguridad y Autenticación
- [ ] `JWT_SECRET`
- [ ] `USER_JWT_SECRET`
- [ ] `API_SECRET_KEY`
- [ ] `SESSION_SECRET`

#### APIs de IA
- [ ] `OPENAI_API_KEY`
- [ ] `GEMINI_API_KEY` (opcional)
- [ ] `CHATBOT_MODEL`
- [ ] `CHATBOT_MAX_TOKENS`
- [ ] `CHATBOT_TEMPERATURE`

#### Configuración de Email
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`

#### Google OAuth (Opcional)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

#### Configuración General
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` (URL de tu sitio Netlify)
- [ ] `ALLOWED_ORIGINS` (URLs permitidas para CORS)

### 3. Configuración de Dominio
- [ ] Configurar dominio personalizado (si aplica)
- [ ] Habilitar HTTPS/SSL automático
- [ ] Configurar DNS records (si usas dominio personalizado)

## 🔍 Post-Despliegue - Testing

### 1. Verificaciones Básicas
- [ ] Sitio web carga correctamente
- [ ] Página principal (`/`) funciona
- [ ] Páginas principales accesibles:
  - [ ] `/login/`
  - [ ] `/courses.html`
  - [ ] `/chat.html`
  - [ ] `/Community/community.html`
  - [ ] `/profile.html`

### 2. Verificaciones de API
Probar estas URLs (deben responder con JSON o redireccionar):
- [ ] `/api/supabase-config`
- [ ] `/api/courses/module1-info`
- [ ] `/api/community/questions`
- [ ] `/api/user/session`

### 3. Verificaciones de Funcionalidad
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Chat con IA responde
- [ ] Videos se reproducen
- [ ] Comunidad carga preguntas
- [ ] Perfil de usuario editable
- [ ] Subida de archivos funciona

### 4. Verificaciones de Rendimiento
- [ ] Tiempo de carga < 3 segundos
- [ ] Funciones Netlify responden < 10 segundos
- [ ] Imágenes cargan correctamente
- [ ] CSS y JS se aplican correctamente

## 🐛 Troubleshooting

### Problemas Comunes y Soluciones

#### Build Failures
```bash
# Error: Cannot find module
# Solución: Verificar que todas las dependencias estén en package.json

# Error: Build command failed
# Solución: Verificar que npm run build funcione localmente
```

#### Funciones 500 Error
```bash
# Verificar logs en Netlify Dashboard > Functions
# Verificar variables de entorno
# Verificar que las dependencias estén en netlify/functions/package.json
```

#### CORS Errors
```bash
# Verificar ALLOWED_ORIGINS en variables de entorno
# Verificar que incluya la URL de Netlify
# Verificar headers en netlify.toml
```

#### Database Connection Errors
```bash
# Verificar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
# Verificar que Supabase esté accesible desde Netlify
# Verificar configuración RLS en Supabase
```

## 📊 Monitoreo Post-Despliegue

### 1. Métricas a Monitorear
- [ ] Uptime del sitio
- [ ] Tiempo de respuesta de funciones
- [ ] Errores 4xx/5xx
- [ ] Uso de ancho de banda
- [ ] Invocaciones de funciones por mes

### 2. Logs a Revisar
- [ ] Build logs (Deploys tab)
- [ ] Function logs (Functions tab)
- [ ] Site analytics (Analytics tab)

### 3. Alertas a Configurar
- [ ] Deploy failures
- [ ] Function errors
- [ ] Uptime monitoring

## 🔧 Mantenimiento

### 1. Actualizaciones Regulares
- [ ] Actualizar dependencias npm
- [ ] Revisar logs de seguridad
- [ ] Verificar certificados SSL

### 2. Backups
- [ ] Backup de variables de entorno
- [ ] Backup de configuración de Netlify
- [ ] Backup de base de datos Supabase

### 3. Optimizaciones
- [ ] Revisar performance metrics
- [ ] Optimizar imágenes si es necesario
- [ ] Revisar uso de funciones Netlify

---

## 🎉 ¡Despliegue Completado!

Una vez que hayas completado todos los elementos de este checklist, tu aplicación estará completamente desplegada y funcionando en Netlify.

### Enlaces Útiles
- [Netlify Dashboard](https://app.netlify.com/)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Supabase Dashboard](https://app.supabase.com/)

### Contacto de Soporte
Si necesitas ayuda adicional, revisa:
1. Los logs de Netlify
2. La documentación en `NETLIFY_DEPLOYMENT_GUIDE.md`
3. Los archivos de configuración del proyecto