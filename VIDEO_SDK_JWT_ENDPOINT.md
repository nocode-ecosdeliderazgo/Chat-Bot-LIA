# Video SDK JWT Endpoint - APR-28

## Descripción
Endpoint para generar JWT (JSON Web Tokens) para el Video SDK con control de roles (host/user) y verificación de permisos.

## Configuración

### Variables de Entorno
Asegúrate de tener configuradas las siguientes variables en tu archivo `.env`:

```env
VIDEO_SDK_API_KEY=tu_api_key_aqui
VIDEO_SDK_SECRET_KEY=tu_secret_key_aqui
```

### Dependencias
Las dependencias necesarias ya están incluidas en el proyecto:
- `jsonwebtoken` (para generar JWT)
- `express` (para el endpoint)

## Endpoint

### Generar JWT de Video SDK
**POST** `/api/videosdk/jwt`

Genera un JWT válido para el Video SDK con control de roles y permisos.

#### Request Body
```json
{
  "sessionName": "string (requerido)",
  "userName": "string (requerido)",
  "roleType": "number (opcional, default: 0)"
}
```

#### Parámetros
- `sessionName`: Nombre de la sesión de video
- `userName`: Nombre del usuario que se unirá a la sesión
- `roleType`: Tipo de rol (0 = usuario, 1 = host)

#### Response
```json
{
  "success": true,
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionName": "mi-sesion-123",
  "userName": "Juan Pérez",
  "sessionPasscode": "123456",
  "roleType": 0,
  "expiresAt": "2024-01-01T11:00:00.000Z"
}
```

#### Códigos de Error
- `400` - `MISSING_PARAMETERS`: sessionName y userName son requeridos
- `400` - `INVALID_ROLE_TYPE`: roleType debe ser 0 (user) o 1 (host)
- `401` - `UNAUTHORIZED`: Usuario no autenticado
- `403` - `INSUFFICIENT_PERMISSIONS`: No tienes permisos para ser host
- `500` - `JWT_GENERATION_ERROR`: Error al generar el JWT

## Autenticación

El endpoint requiere autenticación usando el middleware `authenticateRequest`. El token debe incluirse en el header:

```
Authorization: Bearer <token>
```

## Control de Roles

### Role Type 0 (Usuario)
- Cualquier usuario autenticado puede obtener este rol
- Permite unirse a sesiones como participante
- No puede iniciar grabaciones ni controlar la sesión

### Role Type 1 (Host)
- Requiere permisos especiales
- Solo usuarios con roles `instructor`, `administrador` o `admin` pueden obtener este rol
- Permite controlar la sesión, iniciar/detener grabaciones
- Puede gestionar participantes

## Estructura del JWT

El JWT generado contiene los siguientes claims según la especificación del Video SDK:

```json
{
  "app_key": "tu_api_key",
  "tpc": "nombre_sesion",
  "role_type": 0,
  "iat": 1704110400,
  "exp": 1704114000,
  "version": 2
}
```

### Claims
- `app_key`: API key del Video SDK
- `tpc`: Nombre de la sesión (topic)
- `role_type`: Tipo de rol (0 = user, 1 = host)
- `iat`: Timestamp de emisión
- `exp`: Timestamp de expiración (1 hora después)
- `version`: Versión del JWT (2)

## Seguridad

### Verificación de Permisos
- Los permisos de host se verifican contra la base de datos
- Solo usuarios con roles autorizados pueden obtener `role_type:1`
- En modo desarrollo, se permite host por defecto si la BD no está disponible

### Expiración
- Los JWT expiran en 1 hora (3600 segundos)
- Se incluye tolerancia de reloj estándar
- Algoritmo de firma: HS256

### Passcode de Sesión
- Se genera automáticamente un passcode de 6 dígitos
- Único para cada solicitud de JWT
- Se incluye en la respuesta para uso del cliente

## Ejemplos de Uso

### Generar JWT para Usuario Normal
```bash
curl -X POST http://localhost:3000/api/videosdk/jwt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionName": "taller-ia-2024",
    "userName": "María García",
    "roleType": 0
  }'
```

### Generar JWT para Host
```bash
curl -X POST http://localhost:3000/api/videosdk/jwt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionName": "taller-ia-2024",
    "userName": "Profesor López",
    "roleType": 1
  }'
```

### Uso en Frontend
```javascript
// Ejemplo de uso en JavaScript
async function getVideoSDKToken(sessionName, userName, roleType = 0) {
    const response = await fetch('/api/videosdk/jwt', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionName,
            userName,
            roleType
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        return {
            jwt: data.jwt,
            sessionName: data.sessionName,
            userName: data.userName,
            sessionPasscode: data.sessionPasscode
        };
    } else {
        throw new Error(data.error);
    }
}

// Uso
const tokenData = await getVideoSDKToken('mi-sesion', 'Mi Nombre', 0);
console.log('JWT:', tokenData.jwt);
```

## Testing

### Script de Pruebas
Se incluye un script de pruebas completo: `test-videosdk-jwt.js`

```bash
# Ejecutar pruebas
node test-videosdk-jwt.js
```

### Casos de Prueba
1. ✅ Generar JWT para usuario normal
2. ✅ Generar JWT para host (con permisos)
3. ✅ Validación de parámetros requeridos
4. ✅ Validación de roleType inválido
5. ✅ Validación de autenticación
6. ✅ Verificación de estructura del JWT

## Integración con Video SDK

### Flujo Típico
1. **Autenticación**: El usuario se autentica en tu aplicación
2. **Solicitar JWT**: Llamar al endpoint `/api/videosdk/jwt` con los datos de la sesión
3. **Unirse a Sesión**: Usar el JWT para unirse a la sesión del Video SDK
4. **Usar Passcode**: El passcode se puede usar para control de acceso adicional

### Compatibilidad
- Compatible con Video SDK v2
- Soporta roles de host y usuario
- Integración con sistema de autenticación existente
- Verificación de permisos basada en roles de usuario

## Logs y Monitoreo

### Logs de Auditoría
Todos los eventos de generación de JWT se registran automáticamente:

```
🔐 Generando JWT para sesión: taller-ia-2024, usuario: Profesor López, rol: 1
✅ JWT generado exitosamente para usuario: user_123, sesión: taller-ia-2024
```

### Métricas Recomendadas
- Número de JWT generados por rol
- Tiempo de respuesta del endpoint
- Errores de permisos insuficientes
- Uso por sesión

## Estado del Issue

✅ **APR-28 Completado**
- [x] Endpoint `/api/videosdk/jwt` implementado
- [x] Control de roles (host/user) con verificación de permisos
- [x] JWT con claims correctos según especificación del Video SDK
- [x] Validación de parámetros y autenticación
- [x] Script de pruebas completo
- [x] Documentación detallada
- [x] Manejo de errores robusto
- [x] Logs de auditoría
- [x] Generación automática de passcode de sesión
- [x] Expiración configurada (1 hora)
- [x] Algoritmo de firma HS256
