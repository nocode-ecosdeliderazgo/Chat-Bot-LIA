# Video SDK Endpoints - APR-31

## Descripción
Endpoints opcionales para iniciar/detener grabación usando la API REST del Video SDK. Estos endpoints permiten orquestar la grabación sin intervención del cliente.

## Configuración

### Variables de Entorno
Agregar al archivo `.env`:

```env
VIDEO_SDK_API_KEY=tu_api_key_aqui
VIDEO_SDK_SECRET_KEY=tu_secret_key_aqui
```

### Dependencias
Las dependencias necesarias ya están incluidas en el proyecto:
- `node-fetch` (para hacer requests HTTP)
- `jsonwebtoken` (para autenticación)

## Endpoints Disponibles

### 1. Iniciar Grabación
**POST** `/api/videosdk/recording/start`

Inicia una nueva grabación para una sesión específica.

#### Request Body
```json
{
  "sessionId": "string (requerido)",
  "userId": "string (opcional)"
}
```

#### Response
```json
{
  "success": true,
  "message": "Grabación iniciada exitosamente",
  "recordingId": "rec_123456789",
  "status": "recording",
  "sessionId": "ses_123456789"
}
```

#### Códigos de Error
- `400` - `MISSING_SESSION_ID`: sessionId es requerido
- `401` - `UNAUTHORIZED`: Usuario no autenticado
- `500` - `RECORDING_START_ERROR`: Error al iniciar la grabación

### 2. Detener Grabación
**POST** `/api/videosdk/recording/stop`

Detiene una grabación en curso.

#### Request Body
```json
{
  "sessionId": "string (requerido)",
  "recordingId": "string (requerido)",
  "userId": "string (opcional)"
}
```

#### Response
```json
{
  "success": true,
  "message": "Grabación detenida exitosamente",
  "recordingId": "rec_123456789",
  "status": "stopped",
  "downloadUrl": "https://example.com/recording.mp4",
  "sessionId": "ses_123456789"
}
```

#### Códigos de Error
- `400` - `MISSING_PARAMETERS`: sessionId y recordingId son requeridos
- `401` - `UNAUTHORIZED`: Usuario no autenticado
- `500` - `RECORDING_STOP_ERROR`: Error al detener la grabación

### 3. Obtener Estado de Grabación
**GET** `/api/videosdk/recording/status/:recordingId`

Obtiene el estado actual de una grabación específica.

#### Parámetros de URL
- `recordingId`: ID de la grabación

#### Response
```json
{
  "success": true,
  "recordingId": "rec_123456789",
  "status": "recording",
  "downloadUrl": "https://example.com/recording.mp4",
  "duration": 3600,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:30:00Z"
}
```

#### Códigos de Error
- `400` - `MISSING_RECORDING_ID`: recordingId es requerido
- `401` - `UNAUTHORIZED`: Usuario no autenticado
- `500` - `RECORDING_STATUS_ERROR`: Error al obtener el estado

### 4. Listar Grabaciones de Sesión
**GET** `/api/videosdk/recordings/:sessionId`

Lista todas las grabaciones de una sesión específica.

#### Parámetros de URL
- `sessionId`: ID de la sesión

#### Response
```json
{
  "success": true,
  "sessionId": "ses_123456789",
  "recordings": [
    {
      "recordingId": "rec_123456789",
      "status": "stopped",
      "downloadUrl": "https://example.com/recording1.mp4",
      "duration": 3600,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### Códigos de Error
- `400` - `MISSING_SESSION_ID`: sessionId es requerido
- `401` - `UNAUTHORIZED`: Usuario no autenticado
- `500` - `RECORDINGS_LIST_ERROR`: Error al listar las grabaciones

## Autenticación

Todos los endpoints requieren autenticación usando el middleware `authenticateRequest`. El token debe incluirse en el header:

```
Authorization: Bearer <token>
```

## Logs de Auditoría

Todos los eventos de grabación se registran automáticamente en la consola del servidor con el formato:

```
📹 [VIDEO SDK] recording_started: {
  event: 'recording_started',
  sessionId: 'ses_123456789',
  userId: 'user_123',
  timestamp: '2024-01-01T10:00:00.000Z',
  details: { recordingId: 'rec_123456789', status: 'recording' },
  ip: '192.168.1.1'
}
```

## Ejemplos de Uso

### Iniciar Grabación
```bash
curl -X POST http://localhost:3000/api/videosdk/recording/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "ses_123456789"
  }'
```

### Detener Grabación
```bash
curl -X POST http://localhost:3000/api/videosdk/recording/stop \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "ses_123456789",
    "recordingId": "rec_123456789"
  }'
```

### Obtener Estado
```bash
curl -X GET http://localhost:3000/api/videosdk/recording/status/rec_123456789 \
  -H "Authorization: Bearer <token>"
```

### Listar Grabaciones
```bash
curl -X GET http://localhost:3000/api/videosdk/recordings/ses_123456789 \
  -H "Authorization: Bearer <token>"
```

## Integración con Video SDK

Los endpoints se integran con la API oficial del Video SDK en `https://api.videosdk.live`. Las credenciales se configuran a través de variables de entorno.

### Flujo Típico
1. **Iniciar Sesión**: El cliente inicia una sesión de video
2. **Iniciar Grabación**: Llamar al endpoint `/start` con el sessionId
3. **Monitorear Estado**: Usar el endpoint `/status` para verificar el progreso
4. **Detener Grabación**: Llamar al endpoint `/stop` cuando sea necesario
5. **Descargar**: Usar la URL de descarga proporcionada en la respuesta

## Seguridad

- Todos los endpoints requieren autenticación
- Las credenciales del Video SDK se manejan de forma segura
- Los logs de auditoría registran todas las acciones
- Validación de parámetros en todos los endpoints

## Notas de Implementación

- Los endpoints están diseñados para ser stateless
- Se incluye manejo de errores robusto
- Los logs facilitan el debugging y auditoría
- Compatible con la API oficial del Video SDK
- Preparado para integración con base de datos (comentado en el código)

## Estado del Issue

✅ **APR-31 Completado**
- [x] Autenticación con credenciales del Video SDK API
- [x] Endpoints para iniciar/detener grabación
- [x] Logs de auditoría de inicio/fin
- [x] Documentación completa
- [x] Manejo de errores
- [x] Validación de parámetros
