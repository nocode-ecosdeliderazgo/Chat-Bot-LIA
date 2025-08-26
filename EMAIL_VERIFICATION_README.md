# Sistema de Verificación de Email con OTP

## 📋 Resumen

Se ha implementado un sistema completo de verificación de email con códigos OTP de 6 dígitos que expiran en 15 minutos. El sistema incluye medidas de seguridad robustas y no registra los códigos en texto plano.

## 🔧 Componentes Implementados

### 1. **Servicios Backend**

#### `src/utils/email-service.js`
- Servicio de envío de emails usando Nodemailer
- Generación de emails HTML y texto plano
- Configuración automática desde variables de entorno
- Manejo de errores y logging seguro

#### `src/utils/otp-service.js`
- Generación segura de códigos OTP de 6 dígitos
- Hash de códigos con bcrypt (salt rounds: 12)
- Rate limiting (máximo 3 reenvíos por 15 minutos)
- Validación de intentos (máximo 5 intentos fallidos)
- Limpieza automática de OTPs expirados

#### `src/utils/cleanup-otps.js`
- Servicio de limpieza automática de OTPs expirados
- Ejecución cada 15 minutos
- Estadísticas de OTPs para administradores

### 2. **Endpoints API**

#### `POST /api/register`
- Registro con verificación de email obligatoria
- Envío automático de código OTP
- Fallback para modo desarrollo sin email

#### `POST /api/login`
- Verificación de email antes del login
- Redirección a verificación si email no verificado

#### `POST /api/verify-email`
- Verificación de códigos OTP
- Actualización de estado de verificación
- Validación de formato y expiración

#### `POST /api/resend-verification`
- Reenvío de códigos con rate limiting
- Validación de usuario no verificado

#### `GET /api/otp-stats` (Admin)
- Estadísticas de OTPs para administradores
- Requiere header `x-admin-key`

### 3. **Frontend**

#### `src/email-verification.html`
- Página de verificación con diseño moderno
- Inputs de OTP con navegación automática
- Soporte para pegar código completo
- Countdown para reenvío (60 segundos)

#### `src/scripts/email-verification.js`
- Manejo completo de verificación
- Validación de formato OTP
- Manejo de errores y notificaciones
- Integración con localStorage

#### `src/styles/email-verification.css`
- Diseño responsive y moderno
- Soporte para tema oscuro
- Animaciones y efectos visuales
- Notificaciones tipo toast

### 4. **Base de Datos**

#### Tabla `email_otp`
```sql
CREATE TABLE email_otp (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    purpose VARCHAR(50) NOT NULL DEFAULT 'verify_email',
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Campos agregados a `users`
```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL;
```

## 🔒 Medidas de Seguridad

### 1. **Protección de Códigos OTP**
- ✅ Códigos hasheados con bcrypt (salt rounds: 12)
- ✅ No se registran en logs en texto plano
- ✅ Expiración automática en 15 minutos
- ✅ Rate limiting para prevenir spam

### 2. **Validaciones**
- ✅ Formato de código (6 dígitos numéricos)
- ✅ Máximo 5 intentos fallidos por código
- ✅ Máximo 3 reenvíos por ventana de 15 minutos
- ✅ Verificación de usuario existente

### 3. **Limpieza Automática**
- ✅ Eliminación de OTPs expirados
- ✅ Limpieza de códigos usados (24 horas)
- ✅ Limpieza de códigos bloqueados

## 🚀 Configuración

### 1. **Variables de Entorno**

Agregar al archivo `.env`:
```env
# Configuración SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación

# URL del Frontend
FRONTEND_URL=http://localhost:3000
```

### 2. **Dependencias**

Instalar dependencias:
```bash
npm install nodemailer bcryptjs
```

### 3. **Base de Datos**

Ejecutar las consultas SQL en `querys_para_autentificacion.sql`:
```sql
-- Agregar campos de verificación
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL;

-- Crear tabla de OTPs
CREATE TABLE email_otp (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    purpose VARCHAR(50) NOT NULL DEFAULT 'verify_email',
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_email_otp_user_id ON email_otp(user_id);
CREATE INDEX idx_email_otp_expires_at ON email_otp(expires_at);
CREATE INDEX idx_email_otp_purpose ON email_otp(purpose);
```

## 📱 Flujo de Usuario

### 1. **Registro**
1. Usuario completa formulario de registro
2. Sistema crea cuenta con `email_verified = false`
3. Se genera y envía código OTP por email
4. Usuario es redirigido a página de verificación

### 2. **Verificación**
1. Usuario ingresa código de 6 dígitos
2. Sistema valida código y formato
3. Si es correcto, marca email como verificado
4. Usuario es redirigido al login

### 3. **Login**
1. Usuario intenta iniciar sesión
2. Sistema verifica si email está verificado
3. Si no está verificado, redirige a verificación
4. Si está verificado, permite login normal

### 4. **Reenvío**
1. Usuario puede solicitar nuevo código
2. Rate limiting previene spam
3. Countdown de 60 segundos entre reenvíos

## 🛠️ Uso del Sistema

### 1. **Registro de Usuario**
```javascript
// El registro automáticamente envía email de verificación
const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        full_name: 'Juan Pérez',
        username: 'juanperez',
        email: 'juan@ejemplo.com',
        password: 'contraseña123'
    })
});

const result = await response.json();
if (result.requiresVerification) {
    // Redirigir a página de verificación
    window.location.href = '/email-verification.html';
}
```

### 2. **Verificación de Código**
```javascript
const response = await fetch('/api/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: 'user-id',
        otp: '123456'
    })
});
```

### 3. **Reenvío de Código**
```javascript
const response = await fetch('/api/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: 'user-id',
        email: 'juan@ejemplo.com'
    })
});
```

## 📊 Monitoreo

### 1. **Estadísticas de OTPs**
```bash
curl -H "x-admin-key: dev-key-12345" http://localhost:3000/api/otp-stats
```

### 2. **Logs del Sistema**
- Creación de OTPs: `🔐 OTP creado: {userId, purpose, expiresAt, otpId}`
- Verificación exitosa: `✅ OTP verificado exitosamente: {userId, purpose, otpId}`
- Envío de emails: `📧 Email de verificación enviado: {to, messageId, timestamp}`
- Limpieza automática: `🧹 Limpieza completada: X OTPs expirados eliminados`

## 🔧 Modo Desarrollo

Si el servicio de email no está configurado:
- Los usuarios se crean automáticamente con `email_verified = true`
- Se muestra mensaje de advertencia en logs
- El sistema funciona normalmente sin verificación

## 🚨 Troubleshooting

### 1. **Emails no se envían**
- Verificar configuración SMTP en `.env`
- Revisar logs de Nodemailer
- Verificar credenciales de Gmail

### 2. **Códigos no funcionan**
- Verificar que la tabla `email_otp` existe
- Revisar logs de creación de OTPs
- Verificar configuración de zona horaria

### 3. **Rate limiting muy estricto**
- Ajustar parámetros en `otp-service.js`
- `maxResends`: número de reenvíos permitidos
- `rateLimitWindow`: ventana de tiempo en milisegundos

## 📈 Próximas Mejoras

1. **Autenticación de dos factores (2FA)**
2. **Verificación por SMS**
3. **Códigos QR para verificación**
4. **Dashboard de administración**
5. **Métricas avanzadas de uso**

## 🔐 Consideraciones de Seguridad

1. **Nunca loggear códigos OTP en texto plano**
2. **Usar HTTPS en producción**
3. **Configurar rate limiting apropiado**
4. **Monitorear intentos fallidos**
5. **Implementar alertas de seguridad**

---

**Implementado por:** Sistema de Verificación de Email
**Fecha:** Diciembre 2024
**Versión:** 1.0.0
