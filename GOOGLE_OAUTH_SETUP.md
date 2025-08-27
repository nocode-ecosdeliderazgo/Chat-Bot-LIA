# Configuración de Google OAuth

Esta guía te ayudará a configurar la autenticación con Google OAuth en el proyecto.

## 1. Configurar Google Cloud Console

### Paso 1: Crear un Proyecto de Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el ID del proyecto

### Paso 2: Habilitar la API de Google Identity
1. En el menu lateral, ve a **APIs y servicios** > **Biblioteca**
2. Busca "Google Identity Toolkit API" o "Google+ API"
3. Haz clic en **Habilitar**

### Paso 3: Configurar la Pantalla de Consentimiento OAuth
1. Ve a **APIs y servicios** > **Pantalla de consentimiento de OAuth**
2. Selecciona **Externo** como tipo de usuario
3. Completa la información requerida:
   - **Nombre de la aplicación**: Coach Lia IA
   - **Correo electrónico de soporte**: tu email
   - **Dominio de la aplicación**: tu dominio o localhost para desarrollo
   - **Correo de contacto del desarrollador**: tu email
4. Agrega los scopes necesarios:
   - `email`
   - `profile`
   - `openid`

### Paso 4: Crear Credenciales OAuth 2.0
1. Ve a **APIs y servicios** > **Credenciales**
2. Haz clic en **+ CREAR CREDENCIALES** > **ID de cliente de OAuth 2.0**
3. Selecciona **Aplicación web**
4. Configura los URI:
   
   **Para Desarrollo:**
   - **JavaScript origins autorizados**: `http://localhost:3000`
   - **URI de redirección autorizados**: `http://localhost:3000/login/new-auth.html`
   
   **Para Producción:**
   - **JavaScript origins autorizados**: `https://tudominio.com`
   - **URI de redirección autorizados**: `https://tudominio.com/login/new-auth.html`

5. Copia el **Client ID** y **Client Secret**

## 2. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales de Google:
   ```env
   GOOGLE_CLIENT_ID=tu_client_id_aqui
   GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
   USER_JWT_SECRET=tu_jwt_secret_muy_seguro
   ```

## 3. Actualizar Base de Datos (Opcional)

Si quieres almacenar información específica de Google, puedes agregar estas columnas a tu tabla `users`:

```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'email';
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
```

## 4. Actualizar el Cliente ID en el Frontend

El archivo `google-auth.js` tiene un placeholder para el CLIENT_ID. En producción, deberías:

1. **Opción 1 (Recomendada)**: Crear un endpoint para obtener el CLIENT_ID de forma segura
2. **Opción 2**: Reemplazar el placeholder con tu CLIENT_ID real (menos seguro)

## 5. Probar la Integración

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a `http://localhost:3000/login/new-auth.html`

3. Verifica que aparezcan los botones "Continuar con Google"

4. Haz clic en el botón y verifica que funcione el flujo OAuth

## 6. Configuración para Producción

### Netlify Functions
Las funciones de Netlify ya están configuradas. Solo necesitas:
1. Configurar las variables de entorno en Netlify:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `USER_JWT_SECRET`

### Supabase (Alternativo)
Si prefieres usar Supabase Auth con Google:
1. Ve a la configuración de Authentication en Supabase
2. Habilita Google como provider
3. Agrega tu GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET

## Flujo de Autenticación

1. **Usuario hace clic** en "Continuar con Google"
2. **Google muestra** la pantalla de consentimiento
3. **Usuario autoriza** la aplicación
4. **Google retorna** un ID Token
5. **Frontend envía** el token a `/.netlify/functions/google-login`
6. **Backend verifica** el token con Google
7. **Backend busca/crea** usuario en la base de datos
8. **Backend retorna** JWT token y datos del usuario
9. **Frontend almacena** los datos y redirige al usuario

## Resolución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que las URLs en Google Cloud Console coincidan exactamente
- Asegúrate de incluir el protocolo (http/https)
- No olvides la página específica en la ruta

### Error: "Client ID no encontrado"
- Verifica que `GOOGLE_CLIENT_ID` esté configurado en las variables de entorno
- Asegúrate de que el CLIENT_ID sea correcto

### Error: "Token inválido"
- Verifica que la hora del servidor sea correcta
- Asegúrate de que el CLIENT_ID coincida con el del token

### Error: "CORS"
- Verifica los JavaScript origins en Google Cloud Console
- Asegúrate de que coincidan con tu dominio actual

## Seguridad

- **Nunca** expongas el `GOOGLE_CLIENT_SECRET` en el frontend
- **Siempre** valida los tokens en el backend
- **Usa HTTPS** en producción
- **Mantén actualizadas** las dependencias de seguridad