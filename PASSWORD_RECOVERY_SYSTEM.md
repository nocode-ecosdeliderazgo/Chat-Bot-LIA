# 🔐 Sistema de Recuperación de Contraseña - Coach LIA IA

Sistema completo y seguro de recuperación de contraseña implementado para la plataforma Coach LIA IA.

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Flujo Completo](#flujo-completo)
4. [Componentes Implementados](#componentes-implementados)
5. [Configuración Requerida](#configuración-requerida)
6. [Seguridad](#seguridad)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 📝 Descripción General

Sistema empresarial de recuperación de contraseña con las siguientes características:

- ✅ **Tokens únicos** generados con criptografía segura (32 bytes hex)
- ✅ **Expiración automática** de tokens (1 hora)
- ✅ **Rate limiting** para prevenir abuso
- ✅ **Emails HTML** profesionales con templates responsivos
- ✅ **Validaciones robustas** de fortaleza de contraseña
- ✅ **UX moderna** con indicadores de fortaleza en tiempo real
- ✅ **Seguridad empresarial** con bcrypt (12 rounds) y validaciones múltiples

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  new-auth.html  │ ───> │ forgot-password  │ ───> │  Email Service  │
│  (Modal Form)   │      │ Netlify Function │      │  (SMTP/Nodemailer)│
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                   │                         │
                                   v                         │
                         ┌──────────────────┐               │
                         │ Supabase DB      │               │
                         │ password_reset_  │               │
                         │ tokens table     │               │
                         └──────────────────┘               │
                                                             │
                                                             v
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│ reset-password  │ <─── │ Usuario recibe   │ <─── │  Email con link │
│ .html (Página)  │      │ email y click    │      │  + token único  │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         │
         v
┌──────────────────┐      ┌──────────────────┐
│  reset-password  │ ───> │  Supabase DB     │
│ Netlify Function │      │  (Actualización) │
└──────────────────┘      └──────────────────┘
         │
         v
┌─────────────────┐
│  new-auth.html  │
│  (Login)        │
└─────────────────┘
```

---

## 🔄 Flujo Completo

### 1️⃣ Solicitud de Recuperación

**Usuario**: Hace clic en "¿Olvidaste tu contraseña?" en `new-auth.html`

**Frontend** (`new-auth.html` línea 507-559):
```javascript
// Modal se abre automáticamente
function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgotPasswordEmail').value;

    // POST a /api/forgot-password
    fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
}
```

**Backend** (`netlify/functions/forgot-password.js`):
1. Valida formato de email
2. Verifica rate limiting (max 3 intentos / 15 minutos)
3. Busca usuario en base de datos
4. Genera token criptográfico único (32 bytes)
5. Guarda token en tabla `password_reset_tokens` con expiración de 1 hora
6. Envía email con link personalizado

**Resultado**: Usuario recibe email profesional con link único

---

### 2️⃣ Email de Recuperación

**Email Service** (`src/utils/email-service.js` línea 275-308):

**Template HTML Enviado**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Recuperación de Contraseña</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="color: #44E5FF; font-size: 24px; font-weight: bold;">
                🔐 Aprende y Aplica IA
            </div>
            <h1>Recuperación de Contraseña</h1>
        </div>

        <p>Hola <strong>[nombre_usuario]</strong>,</p>

        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="[FRONTEND_URL]/src/login/reset-password.html?token=[TOKEN]"
               style="background: linear-gradient(135deg, #44E5FF, #0077A6);
                      color: white; padding: 15px 35px; text-decoration: none;
                      border-radius: 25px; display: inline-block;">
                🔓 Restablecer mi contraseña
            </a>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7;
                    border-radius: 5px; padding: 15px; margin: 20px 0;">
            <strong>⚠️ Importante:</strong>
            <ul>
                <li>Este enlace expira en <strong>1 hora</strong></li>
                <li>Solo puedes usar este enlace una vez</li>
                <li>Si no solicitaste este cambio, ignora este email</li>
            </ul>
        </div>
    </div>
</body>
</html>
```

**URL Generada**:
```
https://aprendeyaplica.ai/login/reset-password.html?token=abc123def456...
```
**Nota**: La ruta NO incluye `/src/` porque en Netlify el directorio `src` se publica como raíz del sitio.

---

### 3️⃣ Página de Reset

**Usuario**: Hace clic en el link del email

**Página** (`src/login/reset-password.html`):

**Estados de la UI**:

1. **Loading** (por defecto durante 800ms):
```html
<div class="loading-message show">
    <div class="reset-icon">⏳</div>
    <h2>Verificando enlace...</h2>
    <p>Por favor espera mientras validamos tu solicitud</p>
</div>
```

2. **Formulario de Reset** (si token válido):
```html
<form id="resetForm">
    <!-- Input de nueva contraseña -->
    <input type="password" id="newPassword"
           minlength="8"
           placeholder="Mínimo 8 caracteres">

    <!-- Indicador de fortaleza en tiempo real -->
    <div class="password-strength">
        <div class="strength-bar">
            <div class="strength-fill"></div>
        </div>
        <span class="strength-text">Fortaleza: Débil/Media/Fuerte</span>
    </div>

    <!-- Requisitos visuales -->
    <div class="strength-requirements">
        <div class="requirement" id="req-length">
            <span class="requirement-icon">○/✓</span>
            <span>Al menos 8 caracteres</span>
        </div>
        <div class="requirement" id="req-upper">
            <span class="requirement-icon">○/✓</span>
            <span>Una letra mayúscula</span>
        </div>
        <div class="requirement" id="req-lower">
            <span class="requirement-icon">○/✓</span>
            <span>Una letra minúscula</span>
        </div>
        <div class="requirement" id="req-number">
            <span class="requirement-icon">○/✓</span>
            <span>Un número</span>
        </div>
    </div>

    <!-- Input de confirmación -->
    <input type="password" id="confirmPassword"
           placeholder="Repite la contraseña">
    <div class="error-message">Las contraseñas no coinciden</div>

    <!-- Botón (deshabilitado hasta cumplir requisitos) -->
    <button type="submit" disabled>Actualizar Contraseña</button>
</form>
```

3. **Success** (después de actualización exitosa):
```html
<div class="success-message">
    <div class="success-icon">✓</div>
    <h2>¡Contraseña Actualizada!</h2>
    <p>Tu contraseña ha sido restablecida exitosamente</p>
    <a href="new-auth.html">Iniciar Sesión</a>
</div>
```

4. **Error** (token inválido/expirado):
```html
<div class="error-container">
    <div class="error-icon">✕</div>
    <h2>Enlace Inválido</h2>
    <p>Este enlace ha expirado o no es válido</p>
    <a href="new-auth.html">Volver al Login</a>
</div>
```

**Validaciones Frontend**:
```javascript
function checkPasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password)
    };

    // Actualiza indicadores en tiempo real
    // Habilita botón solo si todos los requisitos se cumplen
    return Object.values(requirements).every(Boolean);
}
```

---

### 4️⃣ Actualización de Contraseña

**Frontend** (`reset-password.html` línea 574-611):
```javascript
const response = await fetch('/api/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        token: urlParams.get('token'),
        newPassword: document.getElementById('newPassword').value
    })
});
```

**Backend** (`netlify/functions/reset-password.js`):

**Flujo de Validación**:
```javascript
// 1. Rate limiting
if (isRateLimited(clientIP)) {
    return error(429, 'Demasiados intentos');
}

// 2. Validar input
if (!token || !newPassword) {
    return error(400, 'Token y contraseña requeridos');
}

if (newPassword.length < 8) {
    return error(400, 'Mínimo 8 caracteres');
}

// 3. Validar fortaleza
const hasUpperCase = /[A-Z]/.test(newPassword);
const hasLowerCase = /[a-z]/.test(newPassword);
const hasNumbers = /\d/.test(newPassword);

if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return error(400, 'Contraseña debe tener mayúscula, minúscula y número');
}

// 4. Buscar token en DB
const tokenData = await supabase
    .from('password_reset_tokens')
    .select('email, expires_at')
    .eq('token', token)
    .single();

if (!tokenData) {
    return error(400, 'Token inválido');
}

// 5. Verificar expiración
if (new Date(tokenData.expires_at) < new Date()) {
    await deleteToken(token);
    return error(400, 'Token expirado');
}

// 6. Verificar usuario existe
const userData = await supabase
    .from('users')
    .select('id, email')
    .eq('email', tokenData.email)
    .single();

if (!userData) {
    return error(400, 'Usuario no encontrado');
}

// 7. Hash de contraseña con bcrypt (12 rounds)
const passwordHash = await bcrypt.hash(newPassword, 12);

// 8. Actualizar contraseña
await supabase
    .from('users')
    .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
    })
    .eq('email', tokenData.email);

// 9. Eliminar token usado (un solo uso)
await supabase
    .from('password_reset_tokens')
    .delete()
    .eq('token', token);

// 10. Invalidar sesiones activas (opcional)
await supabase
    .from('user_sessions')
    .delete()
    .eq('user_id', userData.id);

return success(200, {
    success: true,
    message: 'Contraseña actualizada correctamente'
});
```

---

## 🛠️ Componentes Implementados

### 1. Netlify Functions

#### `netlify/functions/forgot-password.js`
- ✅ Genera y almacena tokens de recuperación
- ✅ Rate limiting (3 intentos / 15 minutos)
- ✅ Envía emails con templates HTML profesionales
- ✅ Validación de formato de email
- ✅ Seguridad: no revela si email existe

#### `netlify/functions/reset-password.js` ⭐ **NUEVO**
- ✅ Valida tokens y expiración
- ✅ Validaciones robustas de contraseña
- ✅ Hash bcrypt con 12 rounds
- ✅ Eliminación de token tras uso
- ✅ Invalidación de sesiones activas
- ✅ Rate limiting (5 intentos / 15 minutos)

### 2. Frontend

#### `src/login/reset-password.html` ⭐ **MEJORADO**
- ✅ UX moderna con animaciones suaves
- ✅ Indicadores de fortaleza en tiempo real
- ✅ Validación de coincidencia de contraseñas
- ✅ Estados: loading, form, success, error
- ✅ Toggle de visibilidad de contraseña
- ✅ Diseño responsive (mobile-first)
- ✅ Botón deshabilitado hasta cumplir requisitos

#### `src/login/new-auth.html`
- ✅ Modal de "Forgot Password" integrado
- ✅ Función `handleForgotPassword()` funcional

### 3. Backend Services

#### `src/utils/email-service.js` ⭐ **CORREGIDO**
- ✅ Template HTML profesional
- ✅ URL corregida: ahora apunta a `reset-password.html`
- ✅ Configuración SMTP con Nodemailer
- ✅ Fallback a URL de producción si FRONTEND_URL no está configurada

### 4. Base de Datos

#### Tabla `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Nota**: Esta tabla se crea automáticamente en `forgot-password.js` si no existe.

### 5. Routing

#### `netlify.toml` ⭐ **CONFIGURADO**
```toml
[[redirects]]
  from = "/api/forgot-password"
  to   = "/.netlify/functions/forgot-password"
  status = 200

[[redirects]]
  from = "/api/reset-password"
  to   = "/.netlify/functions/reset-password"
  status = 200
```

---

## ⚙️ Configuración Requerida

### Variables de Entorno (Netlify)

Ir a **Netlify Dashboard** → **Site settings** → **Environment variables**

#### 1. Frontend URL ⭐ **CRÍTICO**
```bash
FRONTEND_URL=https://aprendeyaplica.ai
```
**Uso**: Genera URLs correctas en los emails de recuperación.

#### 2. Supabase Credentials
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

#### 3. SMTP Configuration
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-gmail-app-password-here
```

**Nota para Gmail**:
1. Ir a [Google Account Security](https://myaccount.google.com/security)
2. Habilitar "2-Step Verification"
3. Crear "App Password" para Nodemailer
4. Usar esa contraseña en `SMTP_PASS`

### Archivo `.env` (Desarrollo Local)
```bash
# Frontend
FRONTEND_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# SMTP (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # App Password de Gmail (16 caracteres)

# Node
NODE_ENV=development
```

---

## 🔒 Seguridad

### Características de Seguridad Implementadas

#### 1. Tokens Criptográficos
```javascript
const resetToken = crypto.randomBytes(32).toString('hex');
// Genera: "a1b2c3d4e5f6..."; 64 caracteres hexadecimales
```
- **Longitud**: 64 caracteres
- **Entropía**: 256 bits
- **Unicidad**: Prácticamente imposible de colisionar

#### 2. Expiración de Tokens
```javascript
const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
```
- **Tiempo de vida**: 60 minutos
- **Eliminación automática**: Tokens expirados se eliminan al verificar

#### 3. Rate Limiting
```javascript
// forgot-password.js
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos

// reset-password.js
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
```

#### 4. Hash de Contraseñas
```javascript
const passwordHash = await bcrypt.hash(newPassword, 12);
```
- **Algoritmo**: bcrypt
- **Rounds**: 12 (2^12 = 4096 iteraciones)
- **Resistencia**: Protección contra rainbow tables y fuerza bruta

#### 5. Validaciones de Contraseña
```javascript
// Frontend + Backend
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
```

#### 6. Un Solo Uso de Token
```javascript
// Después de actualizar contraseña
await supabase
    .from('password_reset_tokens')
    .delete()
    .eq('token', token);
```

#### 7. Invalidación de Sesiones
```javascript
// Opcional: Fuerza logout en todos los dispositivos
await supabase
    .from('user_sessions')
    .delete()
    .eq('user_id', userData.id);
```

#### 8. No Revelación de Información
```javascript
// Siempre el mismo mensaje, exista o no el email
return {
    message: 'Si el correo está registrado, recibirás un enlace de recuperación'
};
```

---

## 🧪 Testing

### Manual Testing Completo

#### Test 1: Flujo Completo Exitoso ✅

1. **Abrir página de login**:
   ```
   https://aprendeyaplica.ai/login/new-auth.html
   ```

2. **Hacer clic en "¿Olvidaste tu contraseña?"**
   - ✓ Modal se abre
   - ✓ Input de email visible

3. **Ingresar email registrado**:
   ```
   test@example.com
   ```
   - ✓ Click "Enviar enlace de recuperación"
   - ✓ Mensaje de éxito aparece

4. **Revisar email**:
   - ✓ Email recibido (revisar spam si no aparece)
   - ✓ Template HTML renderiza correctamente
   - ✓ Botón "Restablecer mi contraseña" visible
   - ✓ URL del link es correcta: `https://aprendeyaplica.ai/login/reset-password.html?token=...`

5. **Hacer clic en el link del email**:
   - ✓ Página `reset-password.html` se carga
   - ✓ Estado "Verificando enlace..." aparece por 0.8s
   - ✓ Formulario de reset aparece

6. **Ingresar nueva contraseña**:
   ```
   Contraseña débil: "test123"
   - ✗ Botón deshabilitado
   - ✗ Indicador muestra "Débil" (rojo)
   - ✗ Requisito de mayúscula no cumplido

   Contraseña fuerte: "Test1234"
   - ✓ Botón habilitado
   - ✓ Indicador muestra "Fuerte" (verde)
   - ✓ Todos los requisitos cumplidos (✓)
   ```

7. **Confirmar contraseña**:
   ```
   Confirmación incorrecta: "Test123"
   - ✗ Mensaje "Las contraseñas no coinciden"
   - ✗ Botón deshabilitado

   Confirmación correcta: "Test1234"
   - ✓ Sin errores
   - ✓ Botón habilitado
   ```

8. **Hacer clic en "Actualizar Contraseña"**:
   - ✓ Loading spinner aparece
   - ✓ Botón se deshabilita
   - ✓ Request POST a `/api/reset-password` exitoso (200)
   - ✓ Pantalla de éxito aparece: "¡Contraseña Actualizada!"

9. **Hacer clic en "Iniciar Sesión"**:
   - ✓ Redirige a `new-auth.html`

10. **Login con nueva contraseña**:
    ```
    Email: test@example.com
    Password: Test1234
    ```
    - ✓ Login exitoso
    - ✓ Redirige a dashboard

---

#### Test 2: Token Expirado ⏱️

1. **Solicitar recuperación de contraseña**
2. **Esperar 1 hora y 1 minuto**
3. **Hacer clic en el link del email**:
   - ✓ Página carga
   - ✓ Mensaje de error: "Token expirado"
   - ✓ Botón "Volver al Login" funciona

---

#### Test 3: Token Inválido 🚫

1. **Modificar token en la URL manualmente**:
   ```
   https://aprendeyaplica.ai/login/reset-password.html?token=invalid123
   ```
2. **Intentar ingresar nueva contraseña**:
   - ✓ Formulario permite input
   - ✓ Al hacer submit, error 400: "Token inválido"

---

#### Test 4: Rate Limiting 🔒

1. **Solicitar 4 recuperaciones de contraseña en 5 minutos**:
   - ✓ Primera solicitud: ✅ Exitosa
   - ✓ Segunda solicitud: ✅ Exitosa
   - ✓ Tercera solicitud: ✅ Exitosa
   - ✓ Cuarta solicitud: ❌ Error 429: "Demasiados intentos"

2. **Esperar 15 minutos**:
   - ✓ Nueva solicitud: ✅ Exitosa

---

#### Test 5: Contraseña Débil 💪

1. **Intentar contraseñas débiles**:
   ```
   "test" - ✗ Mínimo 8 caracteres
   "testtest" - ✗ Sin mayúscula ni número
   "Testtest" - ✗ Sin número
   "test1234" - ✗ Sin mayúscula
   "TEST1234" - ✗ Sin minúscula
   ```

2. **Intentar contraseña fuerte**:
   ```
   "Test1234" - ✓ Todos los requisitos
   ```

---

#### Test 6: Sesiones Invalidadas 🔓

1. **Login en múltiples dispositivos/navegadores**
2. **Restablecer contraseña desde uno**
3. **Verificar otros dispositivos**:
   - ✓ Sesiones invalidadas (forzadas a logout)

---

### Automated Testing (Opcional)

#### Playwright E2E Test
```javascript
// tests/password-recovery.spec.js
import { test, expect } from '@playwright/test';

test('Complete password recovery flow', async ({ page }) => {
    // 1. Navigate to login
    await page.goto('/src/login/new-auth.html');

    // 2. Open forgot password modal
    await page.click('text=¿Olvidaste tu contraseña?');

    // 3. Enter email
    await page.fill('#forgotPasswordEmail', 'test@example.com');
    await page.click('button[type="submit"]');

    // 4. Wait for success message
    await expect(page.locator('text=Se ha enviado')).toBeVisible();

    // 5. Simulate clicking email link (you'd need to fetch from email)
    const token = 'simulated-token-from-db';
    await page.goto(`/src/login/reset-password.html?token=${token}`);

    // 6. Wait for form to load
    await expect(page.locator('#resetForm')).toBeVisible();

    // 7. Enter new password
    await page.fill('#newPassword', 'Test1234');
    await page.fill('#confirmPassword', 'Test1234');

    // 8. Submit
    await page.click('button[type="submit"]');

    // 9. Verify success
    await expect(page.locator('text=¡Contraseña Actualizada!')).toBeVisible();

    // 10. Go to login
    await page.click('text=Iniciar Sesión');

    // 11. Login with new password
    await page.fill('#loginEmailOrUsername', 'test@example.com');
    await page.fill('#loginPassword', 'Test1234');
    await page.click('#loginSubmit');

    // 12. Verify logged in
    await expect(page).toHaveURL(/\/cursos\.html/);
});
```

---

## 🐛 Troubleshooting

### Problema 1: No recibo emails

**Síntomas**:
- Usuario solicita recuperación
- Mensaje de éxito aparece
- Email nunca llega

**Diagnóstico**:
```bash
# Ver logs en Netlify Functions
netlify functions:log forgot-password

# Buscar errores SMTP
grep "Error enviando email" netlify-functions.log
```

**Soluciones**:

1. **Verificar variables SMTP**:
   ```bash
   # Netlify Dashboard → Environment Variables
   SMTP_HOST = smtp.gmail.com
   SMTP_PORT = 587
   SMTP_USER = your-email@example.com
   SMTP_PASS = your-gmail-app-password-here
   ```

2. **Gmail App Password**:
   - Ir a [Google Account Security](https://myaccount.google.com/security)
   - Habilitar 2FA si no está activa
   - Crear App Password específica para Nodemailer
   - Usar esa contraseña en `SMTP_PASS`

3. **Revisar carpeta de Spam**:
   - Emails pueden ir a Spam la primera vez

4. **Testing local**:
   ```javascript
   // Agregar logging en email-service.js
   console.log('📧 Configuración SMTP:', {
       host: process.env.SMTP_HOST,
       port: process.env.SMTP_PORT,
       user: process.env.SMTP_USER,
       hasPassword: !!process.env.SMTP_PASS
   });
   ```

---

### Problema 2: Link del email apunta a localhost

**Síntomas**:
- Email recibido correctamente
- Link dice `http://localhost:3000/src/login/reset-password.html?token=...`

**Causa**:
Variable `FRONTEND_URL` no configurada en Netlify.

**Solución**:
```bash
# Netlify Dashboard → Environment Variables → Add new variable
FRONTEND_URL = https://aprendeyaplica.ai
```

**Verificar**:
```bash
# Solicitar nuevo email de recuperación
# El link debe ser:
https://aprendeyaplica.ai/login/reset-password.html?token=...
```

---

### Problema 3: Error 404 en /api/reset-password

**Síntomas**:
- Página de reset carga correctamente
- Al hacer submit, error 404

**Causa**:
Redirect no configurado en `netlify.toml` o deployment no actualizado.

**Solución**:
```bash
# 1. Verificar netlify.toml tiene los redirects
[[redirects]]
  from = "/api/reset-password"
  to   = "/.netlify/functions/reset-password"
  status = 200

# 2. Hacer commit y push
git add netlify.toml
git commit -m "Add reset-password redirect"
git push

# 3. Esperar deployment en Netlify
# Netlify Dashboard → Deploys → Wait for "Published"
```

---

### Problema 4: Token siempre inválido

**Síntomas**:
- Email recibido
- Link correcto
- Siempre muestra "Token inválido"

**Diagnóstico**:
```javascript
// Agregar logging en reset-password.js
console.log('🔍 Token recibido:', token);
console.log('🔍 Token en DB:', tokenData);
```

**Causas posibles**:

1. **Token no se guardó en DB**:
   ```sql
   -- Verificar en Supabase
   SELECT * FROM password_reset_tokens
   WHERE email = 'test@example.com'
   ORDER BY created_at DESC;
   ```

2. **Tabla no existe**:
   ```javascript
   // forgot-password.js crea la tabla automáticamente
   // Pero verifica permisos de Supabase
   ```

3. **Email case-sensitive**:
   ```javascript
   // Ambos usan .toLowerCase()
   // Verificar que sea consistente
   ```

---

### Problema 5: "Demasiados intentos" inmediatamente

**Síntomas**:
- Primera solicitud de recuperación da error 429

**Causa**:
Rate limiting en memoria se resetea con cada deployment, pero puede tener estado residual.

**Solución temporal**:
```javascript
// Limpiar manualmente el Map
// En forgot-password.js o reset-password.js
attempts.clear();
```

**Solución permanente** (usar Redis o DB):
```javascript
// En lugar de Map en memoria
const { createClient } = require('redis');
const redis = createClient({ url: process.env.REDIS_URL });

async function isRateLimited(ip) {
    const key = `rate_limit:${ip}`;
    const count = await redis.incr(key);

    if (count === 1) {
        await redis.expire(key, 900); // 15 minutos
    }

    return count > MAX_ATTEMPTS;
}
```

---

### Problema 6: Contraseña no se actualiza

**Síntomas**:
- Flujo completo exitoso
- Mensaje "¡Contraseña Actualizada!"
- Login con nueva contraseña falla

**Diagnóstico**:
```javascript
// Agregar logging en reset-password.js
console.log('📝 Actualizando contraseña para:', tokenData.email);
console.log('🔐 Hash generado:', passwordHash.substring(0, 20) + '...');

const result = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('email', tokenData.email);

console.log('✅ Update result:', result);
```

**Causas posibles**:

1. **Campo incorrecto en DB**:
   ```sql
   -- Verificar nombre de columna
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'users' AND column_name LIKE '%password%';
   ```

2. **RLS Policies bloqueando update**:
   ```sql
   -- Verificar políticas en Supabase
   -- Dashboard → Authentication → Policies
   -- Debe permitir UPDATE con service role key
   ```

---

## 📊 Monitoreo y Logs

### Logs en Netlify

```bash
# Ver logs de función específica
netlify functions:log forgot-password
netlify functions:log reset-password

# Ver últimos 100 logs
netlify functions:log --limit 100

# Filtrar por nivel de error
netlify functions:log | grep "ERROR"
```

### Logs Útiles Implementados

```javascript
// forgot-password.js
console.log(`📧 Intentando enviar email de recuperación a ${email}...`);
console.log(`✅ Email de recuperación enviado exitosamente a ${email}`);
console.log(`⚠️ Servicio de email no configurado`);
console.log(`🔐 [DEV MODE] Token de recuperación: ${resetToken}`);

// reset-password.js
console.log(`✅ Contraseña actualizada exitosamente para ${tokenData.email}`);
console.log(`❌ Error en reset-password:`, error);
```

---

## 🎯 Mejoras Futuras (Opcional)

### 1. Notificación de Cambio de Contraseña
```javascript
// Enviar email confirmando el cambio
await emailService.sendPasswordChangedNotification(
    userData.email,
    userData.username
);
```

### 2. Historial de Cambios de Contraseña
```sql
CREATE TABLE password_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(50),
    user_agent TEXT
);
```

### 3. Autenticación de 2 Factores (2FA)
```javascript
// Requerir código 2FA además de contraseña
// Para cambios de contraseña críticos
```

### 4. SMS Recovery (alternativa a email)
```javascript
// Usar Twilio para enviar código por SMS
const twilioClient = require('twilio')(accountSid, authToken);
```

### 5. Preguntas de Seguridad
```javascript
// Backup recovery method
// "¿Cuál es tu mascota favorita?"
```

---

## 📚 Referencias

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Bcrypt Best Practices](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)

---

## ✅ Checklist de Implementación

### Para el Desarrollador:

- [x] ✅ Crear Netlify Function `forgot-password.js`
- [x] ✅ Crear Netlify Function `reset-password.js`
- [x] ✅ Actualizar `email-service.js` con URL correcta
- [x] ✅ Mejorar `reset-password.html` con validaciones robustas
- [x] ✅ Agregar redirects en `netlify.toml`
- [x] ✅ Documentar sistema completo

### Para el Usuario (Deployment):

- [ ] 🔲 Configurar variable `FRONTEND_URL` en Netlify
- [ ] 🔲 Configurar variables SMTP en Netlify
- [ ] 🔲 Crear App Password de Gmail
- [ ] 🔲 Deploy del código a Netlify
- [ ] 🔲 Testing manual completo
- [ ] 🔲 Verificar recepción de emails
- [ ] 🔲 Verificar funcionamiento en producción

---

## 🎉 Conclusión

Has implementado un sistema empresarial de recuperación de contraseña con:

- ✅ **Seguridad**: Tokens criptográficos, bcrypt, rate limiting
- ✅ **UX**: Indicadores de fortaleza, validaciones en tiempo real
- ✅ **Escalabilidad**: Netlify Functions serverless
- ✅ **Profesionalismo**: Emails HTML, mensajes claros, manejo de errores

El sistema está **production-ready** y solo requiere configuración de variables de entorno para funcionar completamente.

---

**Autor**: Sistema de Recuperación de Contraseña - Coach LIA IA
**Fecha**: Julio 2025
**Versión**: 1.0.0
