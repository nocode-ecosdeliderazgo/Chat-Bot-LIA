# Guía de Despliegue en Netlify - Aprende y Aplica

## 🚀 Configuración Completa para Netlify

### 1. Configuración del Repositorio

Asegúrate de que la rama `Deploy-produccion` contenga todos los cambios más recientes:

```bash
git checkout Deploy-produccion
git pull origin Deploy-produccion
```

### 2. Configuración en Netlify Dashboard

#### 2.1 Configuración de Build
- **Build command**: `npm run build`
- **Publish directory**: `src`
- **Base directory**: `.` (raíz del proyecto)
- **Node version**: `18`

#### 2.2 Variables de Entorno Requeridas

En el panel de Netlify (Site Settings > Environment Variables), configura las siguientes variables:

##### Base de Datos y Supabase
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://user:pass@host:port/database
```

##### Autenticación y Seguridad
```bash
JWT_SECRET=tu-jwt-secret-muy-seguro
USER_JWT_SECRET=tu-user-jwt-secret-muy-seguro
API_SECRET_KEY=tu-api-secret-key-muy-seguro
SESSION_SECRET=tu-session-secret-muy-seguro
```

##### APIs de IA
```bash
OPENAI_API_KEY=sk-tu-openai-api-key
GEMINI_API_KEY=tu-gemini-api-key
CHATBOT_MODEL=gpt-4o-mini
CHATBOT_MAX_TOKENS=1000
CHATBOT_TEMPERATURE=0.7
```

##### Configuración de Email (SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

##### Google OAuth (Opcional)
```bash
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

##### Configuración General
```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-dominio.netlify.app
ALLOWED_ORIGINS=https://tu-dominio.netlify.app,https://tu-dominio-personalizado.com
```

### 3. Configuración de Dominios

#### 3.1 Dominio Personalizado
Si tienes un dominio personalizado:
1. Ve a Site Settings > Domain Management
2. Agrega tu dominio personalizado
3. Configura los DNS records según las instrucciones de Netlify
4. Actualiza `ALLOWED_ORIGINS` para incluir tu dominio

#### 3.2 SSL/HTTPS
Netlify proporciona SSL automáticamente. Asegúrate de:
- Forzar HTTPS en Site Settings > Domain Management
- Actualizar todas las URLs en variables de entorno para usar HTTPS

### 4. Verificación de Funciones Netlify

Las funciones serverless están configuradas en `/netlify/functions/`. Verifica que todas las funciones necesarias estén presentes:

- ✅ Autenticación: `login.js`, `register.js`, `verify-email.js`
- ✅ Perfil de usuario: `get-profile.js`, `update-profile.js`, `profile-upload.js`
- ✅ Cursos: `courses.js`, `course-data.js`, `user-progress.js`
- ✅ Comunidad: `community.js`, `community-questions.js`, `community-answers.js`
- ✅ Chat IA: `openai.js`, `context.js`
- ✅ Administración: `genai-radar.js`, `adopcion-genai.js`

### 5. Configuración de Redirects y Headers

El archivo `netlify.toml` ya está configurado con:
- ✅ Redirects para todas las rutas API
- ✅ Headers de seguridad optimizados
- ✅ CSP (Content Security Policy) para YouTube y recursos externos
- ✅ Configuración de CORS

### 6. Testing Pre-Deployment

Antes de desplegar, verifica localmente:

```bash
# Instalar dependencias
npm install

# Verificar que no hay errores de sintaxis
npm run lint

# Ejecutar tests si están disponibles
npm test

# Verificar build
npm run build
```

### 7. Despliegue

#### 7.1 Despliegue Automático
1. Conecta tu repositorio GitHub a Netlify
2. Selecciona la rama `Deploy-produccion`
3. Netlify desplegará automáticamente en cada push

#### 7.2 Despliegue Manual
1. Sube tu código a GitHub en la rama `Deploy-produccion`
2. En Netlify Dashboard, ve a Deploys
3. Haz clic en "Trigger deploy" > "Deploy site"

### 8. Post-Deployment Verification

#### 8.1 Verificaciones Esenciales
- [ ] Página principal carga correctamente
- [ ] Login/registro funcionan
- [ ] APIs responden correctamente
- [ ] Chat con IA funciona
- [ ] Videos se reproducen correctamente
- [ ] Comunidad es accesible
- [ ] Perfil de usuario funciona

#### 8.2 URLs de Testing
```bash
# Frontend
https://tu-sitio.netlify.app

# APIs (deben responder con datos JSON o redireccionar correctamente)
https://tu-sitio.netlify.app/api/supabase-config
https://tu-sitio.netlify.app/api/courses/module1-info
https://tu-sitio.netlify.app/api/community/questions
```

### 9. Monitoreo y Logs

#### 9.1 Netlify Functions Logs
- Ve a Functions tab en tu dashboard de Netlify
- Revisa los logs de las funciones para errores
- Monitorea el uso y performance

#### 9.2 Métricas Importantes
- Tiempo de respuesta de las funciones
- Errores 500/404
- Uso de ancho de banda
- Invocaciones de funciones por mes

### 10. Troubleshooting Común

#### 10.1 Errores de Build
```bash
# Error: Cannot find module
npm install --save [module-name]

# Error: Node version
# Asegurar que node_version = "18" en netlify.toml
```

#### 10.2 Errores de API
```bash
# Error 500 en funciones
# Revisar logs en Netlify Dashboard > Functions
# Verificar variables de entorno

# Error CORS
# Verificar ALLOWED_ORIGINS en variables de entorno
```

#### 10.3 Problemas de Supabase
```bash
# Error de conexión a Supabase
# Verificar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
# Verificar que las tablas existen en Supabase
```

### 11. Optimizaciones de Performance

#### 11.1 Caching
- Las funciones Netlify tienen caching automático
- Assets estáticos se cachean por defecto
- Configurar headers de cache si es necesario

#### 11.2 CDN
- Netlify usa CDN global automáticamente
- Optimizar imágenes antes de subir
- Minificar CSS/JS si es necesario

### 12. Seguridad

#### 12.1 Variables de Entorno
- ✅ Nunca commitear archivos `.env` al repositorio
- ✅ Usar variables de entorno de Netlify para secretos
- ✅ Rotar claves regularmente

#### 12.2 Headers de Seguridad
- ✅ CSP configurado en `netlify.toml`
- ✅ HTTPS forzado
- ✅ Headers de seguridad aplicados

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs de build en Netlify
2. Verifica que todas las variables de entorno están configuradas
3. Comprueba que la rama `Deploy-produccion` tiene los últimos cambios
4. Revisa los logs de las funciones Netlify

---

**¡Tu aplicación está lista para producción en Netlify! 🎉**