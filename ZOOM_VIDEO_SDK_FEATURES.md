# Zoom Video SDK - Especificación Detallada de Implementación

## Ubicación de Implementación
**Panel Central**: `live-stream-main-panel` en `src/chat.html:264-275`

```html
<!-- Panel de Live Stream (Centro - Arriba) -->
<div class="live-stream-main-panel" id="liveStreamMainPanel">
    <div class="live-stream-main-header">
        <h3>
            <i class='bx bx-broadcast'></i>
            Live Stream
        </h3>
    </div>
    <!-- Zoom Video SDK Container -->
    <div id="zoom-video-container" class="zoom-video-wrapper"></div>
    <!-- Controles específicos según rol de usuario -->
    <div id="zoom-controls" class="zoom-controls-panel"></div>
</div>
```

## 1. Video Conferencing Core (Especificación Detallada)

### Funcionalidades Base
- ✅ **Video streaming UNIDIRECCIONAL**: Solo hosts pueden transmitir video (host → participants)
- ✅ **Audio streaming UNIDIRECCIONAL**: Solo hosts pueden transmitir audio (host → participants)
- 🔒 **Screen sharing**: **SOLO para usuarios con `role_zoom = 'host'`**
- ✅ **Video layout**: **Vista del orador únicamente** (speaker view - siempre muestra al host)

### Implementación Técnica
```javascript
// Inicialización básica del Zoom SDK
const ZoomVideo = {
    init: async (signature, meetingNumber, userName, userRole) => {
        // userRole determinado por BD: users.role_zoom
        const config = {
            videoConfig: { 
                enable: true, 
                quality: userRole === 'host' ? 'HD' : 'SD' 
            },
            audioConfig: { enable: true },
            layout: 'speaker' // Vista del orador únicamente
        }
    }
}
```

## 2. Controles de Usuario (Diferenciados por Rol)

### SOLO para usuarios con role_zoom = 'host' (TRANSMITEN)
- 🔒 **Camera toggle** (encender/apagar cámara para transmisión)
- 🔒 **Microphone toggle** (silenciar/activar micrófono para transmisión)
- 🔒 **Video quality selection** (HD, SD, auto para su transmisión)
- 🔒 **Speaker controls** (volumen, cambio de dispositivo)

### Para usuarios con role_zoom = 'participant' (SOLO RECIBEN)
- ✅ **Full-screen toggle** (pantalla completa para ver al host)
- ✅ **Volume control** (control de volumen para recepción)
- ❌ **NO camera/microphone controls** (no pueden transmitir)

### Validación de Rol
```javascript
// Verificar rol desde base de datos
const checkUserRole = async (userId) => {
    const userQuery = 'SELECT role_zoom FROM users WHERE id = $1';
    const result = await pool.query(userQuery, [userId]);
    return result.rows[0]?.role_zoom || 'participant';
}
```

## 3. Gestión de Participantes (Solo Hosts)

### Administración de Sesión - SOLO role_zoom = 'host'
- 🔒 **Participant list** con roles (host/attendee)
- 🔒 **Waiting room** control
- 🔒 **Admission controls** (permitir/denegar entrada)
- 🔒 **Remove participants** (expulsar participantes)

## 4. Características Avanzadas (Limitadas)

### Funciones Implementadas
- 🔒 **Recording capabilities LOCAL**: **SOLO para role_zoom = 'host'**
- ✅ **Bandwidth optimization** automática para todos

### NO Implementadas (Fase Futura)
- ❌ Breakout rooms
- ❌ Virtual backgrounds
- ❌ Cloud recording

## 5. Integración con Base de Datos

### Tabla Users - Campo role_zoom
```sql
-- Verificar estructura existente de tabla users
-- Campo requerido: role_zoom VARCHAR(20) DEFAULT 'participant'
-- Valores: 'host' | 'participant'
```

### Autenticación y Roles
- ✅ **Authentication sync**: Verificar con sistema actual de autenticación
- ✅ **Role verification**: Consultar `users.role_zoom` para permisos
- ✅ **Custom branding**: Mantener colores y tema de Coach LIA

## 6. Responsive Design (Simplificado)

### Adaptación Básica
- ✅ **Full-screen toggle** para mejor experiencia
- ✅ **Responsive video container** que se adapte al panel central

### Consideraciones de UI/UX
- ✅ Mantener coherencia con tema actual (dark/light)
- ✅ Integrar con sistema de colapso de paneles laterales
- ✅ Preservar navegación móvil existente

## 7. Arquitectura Técnica (Integración con Stack Actual)

### Frontend Integration
- **Framework**: Vanilla JavaScript (coherente con proyecto actual)
- **Location**: `src/chat.html` panel central existente
- **Styling**: Extensión de `src/styles/chat.css`

### Backend Requirements
- **Server**: Express.js existente en `server.js`
- **Database**: PostgreSQL pool existente
- **Authentication**: Sistema OTP/JWT actual

## 8. APIs y Endpoints Necesarios

### Endpoints de Autenticación Zoom
```javascript
// Generar JWT signature para Zoom SDK
app.post('/api/zoom/signature', authenticateUser, async (req, res) => {
    const { meetingNumber, role } = req.body;
    const userId = req.user.id;
    
    // Verificar rol del usuario
    const userRole = await checkUserRole(userId);
    const zoomRole = userRole === 'host' ? 1 : 0; // 1=host, 0=participant
    
    const signature = generateZoomSignature(meetingNumber, zoomRole);
    res.json({ signature, role: zoomRole });
});

// Verificar permisos de usuario
app.get('/api/zoom/user-permissions/:userId', authenticateUser, async (req, res) => {
    const { userId } = req.params;
    const userRole = await checkUserRole(userId);
    
    res.json({
        canRecord: userRole === 'host',
        canMuteOthers: userRole === 'host',
        canScreenShare: userRole === 'host',
        canManageParticipants: userRole === 'host'
    });
});
```

### Endpoints de Gestión de Sesiones
```javascript
// Crear nueva sesión de video
app.post('/api/zoom/session', authenticateUser, async (req, res) => {
    const { title, description, startTime } = req.body;
    const hostId = req.user.id;
    
    // Verificar que el usuario sea host
    const userRole = await checkUserRole(hostId);
    if (userRole !== 'host') {
        return res.status(403).json({ error: 'Solo los hosts pueden crear sesiones' });
    }
    
    const sessionId = generateMeetingNumber();
    // Guardar sesión en BD
    const result = await pool.query(`
        INSERT INTO zoom_sessions (session_id, host_id, title, description, start_time, status)
        VALUES ($1, $2, $3, $4, $5, 'scheduled') RETURNING *
    `, [sessionId, hostId, title, description, startTime]);
    
    res.json(result.rows[0]);
});

// Unirse a sesión existente
app.post('/api/zoom/join/:sessionId', authenticateUser, async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    // Verificar que la sesión exista y esté activa
    const session = await pool.query('SELECT * FROM zoom_sessions WHERE session_id = $1', [sessionId]);
    if (session.rows.length === 0) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    // Registrar participación
    await pool.query(`
        INSERT INTO zoom_participants (session_id, user_id, join_time)
        VALUES ($1, $2, NOW()) ON CONFLICT (session_id, user_id) DO NOTHING
    `, [sessionId, userId]);
    
    res.json({ message: 'Unido a la sesión', sessionId });
});
```

### Endpoints de Grabación (Solo Hosts)
```javascript
// Iniciar grabación local
app.post('/api/zoom/recording/start', authenticateUser, async (req, res) => {
    const { sessionId } = req.body;
    const userId = req.user.id;
    
    // Verificar permisos de host
    const userRole = await checkUserRole(userId);
    if (userRole !== 'host') {
        return res.status(403).json({ error: 'Solo los hosts pueden grabar' });
    }
    
    // Iniciar grabación local
    const recordingId = `rec_${sessionId}_${Date.now()}`;
    await pool.query(`
        INSERT INTO zoom_recordings (recording_id, session_id, host_id, start_time, status)
        VALUES ($1, $2, $3, NOW(), 'recording')
    `, [recordingId, sessionId, userId]);
    
    res.json({ recordingId, status: 'recording_started' });
});

// Detener grabación
app.post('/api/zoom/recording/stop', authenticateUser, async (req, res) => {
    const { recordingId } = req.body;
    const userId = req.user.id;
    
    // Actualizar estado de grabación
    await pool.query(`
        UPDATE zoom_recordings 
        SET end_time = NOW(), status = 'completed' 
        WHERE recording_id = $1 AND host_id = $2
    `, [recordingId, userId]);
    
    res.json({ recordingId, status: 'recording_stopped' });
});
```

### Estructura de Base de Datos Requerida
```sql
-- Agregar campo role_zoom a tabla users existente
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_zoom VARCHAR(20) DEFAULT 'participant';
UPDATE users SET role_zoom = 'participant' WHERE role_zoom IS NULL;

-- Tabla para sesiones de video
CREATE TABLE IF NOT EXISTS zoom_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    host_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para participantes
CREATE TABLE IF NOT EXISTS zoom_participants (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(50) REFERENCES zoom_sessions(session_id),
    user_id INTEGER REFERENCES users(id),
    join_time TIMESTAMP DEFAULT NOW(),
    leave_time TIMESTAMP,
    UNIQUE(session_id, user_id)
);

-- Tabla para grabaciones
CREATE TABLE IF NOT EXISTS zoom_recordings (
    id SERIAL PRIMARY KEY,
    recording_id VARCHAR(100) UNIQUE NOT NULL,
    session_id VARCHAR(50) REFERENCES zoom_sessions(session_id),
    host_id INTEGER REFERENCES users(id),
    file_path VARCHAR(500),
    file_size BIGINT,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'recording'
);
```

## 9. Fases de Implementación (Ajustadas)

### Fase 1: Integración Básica (Semana 1-2)
✅ **Video streaming bidireccional**
- Implementar Zoom SDK básico en `live-stream-main-panel`
- Configurar video/audio para todos los usuarios
- Vista del orador únicamente
- Controles básicos: camera toggle para todos

### Fase 2: Diferenciación por Roles (Semana 3)
🔒 **Implementar sistema de roles**
- Agregar campo `role_zoom` a tabla users
- API endpoints para verificación de permisos
- Controles diferenciados: microphone/speaker solo para hosts
- Screen sharing solo para hosts

### Fase 3: Gestión Avanzada (Semana 4)
🔒 **Funcionalidades de host**
- Gestión de participantes (solo hosts)
- Sistema de grabación local (solo hosts)
- Bandwidth optimization automática
- Full-screen toggle

### Fase 4: Pulimiento y Optimización (Semana 5)
✅ **Integración final**
- Responsive design completo
- Coherencia con tema actual (dark/light)
- Testing y optimizaciones de rendimiento
- Documentación final
- **Webinars educativos** con LIA como host
- **Talleres interactivos** con participación grupal
- **Sesiones 1-on-1** para coaching personalizado
- **Eventos masivos** con cientos de participantes

### Integración con Cursos
- Iniciar sesiones directamente desde `cursos.html`
- Vincular grabaciones con contenido del curso
- Seguimiento de asistencia por módulo

## 10. Consideraciones de Implementación

### Fases de Desarrollo
1. **Fase 1**: Integración básica (video + audio)
2. **Fase 2**: Controles avanzados y chat integrado
3. **Fase 3**: Características premium (recording, breakouts)
4. **Fase 4**: Analytics y optimizaciones

### Requisitos Técnicos
- Zoom Video SDK license key
- HTTPS obligatorio para funcionalidades de video
- Bandwidth mínimo recomendado
- Browser compatibility testing

## 11. Beneficios para la Plataforma

### Valor Agregado
- **Experiencia inmersiva** de aprendizaje
- **Interacción en tiempo real** instructor-estudiante
- **Escalabilidad** para eventos grandes
- **Grabaciones** para contenido asíncrono

### Diferenciación Competitiva
- Plataforma todo-en-uno (chat + video + cursos)
- AI coach integrado con video sesiones
- Analytics avanzados de engagement
- Experiencia móvil optimizada