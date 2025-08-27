# 🎯 Sistema de Personalización de Grafana

Documentación completa para el sistema de gráficas personalizadas basadas en datos de cuestionarios de usuarios.

## 📋 Resumen

El sistema permite mostrar gráficas de Grafana personalizadas para cada usuario basadas en sus respuestas del cuestionario almacenadas en la base de datos. Cada usuario ve únicamente sus propios datos y análisis.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **Base de Datos**:
   - `user_questionnaire_sessions` - Sesiones de cuestionarios por usuario
   - `user_question_responses` - Respuestas específicas de cada sesión
   - `questions_catalog` - Catálogo de preguntas con dimensiones

2. **Backend Endpoints**:
   - `/api/user/session` - Obtiene session_id del usuario autenticado
   - `/grafana/panel/{panelId}.png` - Sirve gráficas personalizadas

3. **Netlify Functions** (Producción):
   - `get-user-session.js` - Endpoint serverless para obtener sesión
   - `grafana-panel.js` - Función serverless para gráficas personalizadas

## 🔗 Flujo de Funcionamiento

### 1. Obtener Session ID del Usuario

```javascript
// Frontend: Obtener session_id del usuario autenticado
const response = await fetch('/api/user/session?user_id=USER_UUID');
const sessionData = await response.json();

if (sessionData.grafana_ready) {
    // Usuario tiene datos completos para mostrar gráficas
    const sessionId = sessionData.session_id;
} else {
    // Usuario necesita completar el cuestionario
    console.log(sessionData.suggestion);
}
```

### 2. Cargar Gráficas Personalizadas

```javascript
// Usar session_id para cargar gráficas personalizadas
const imageUrl = `/grafana/panel/1.png?session_id=${sessionId}`;

// La gráfica mostrará solo los datos del usuario específico
<img src={imageUrl} alt="Gráfica personalizada" />
```

## 📊 Estructura de Datos

### Respuesta del Endpoint `/api/user/session`

```json
{
  "session_id": "uuid-de-la-sesion",
  "user_id": "uuid-del-usuario", 
  "perfil": "tipo-de-perfil",
  "area": "area-de-interes",
  "started_at": "2025-01-15T10:30:00Z",
  "completed_at": "2025-01-15T11:45:00Z",
  "is_completed": true,
  "responses_count": 25,
  "has_data": true,
  "grafana_ready": true,
  "debug": {
    "query_executed": true,
    "timestamp": "2025-01-15T12:00:00Z"
  }
}
```

### Estados del Usuario

- **`grafana_ready: true`**: Usuario completó cuestionario, gráficas disponibles
- **`grafana_ready: false`**: Usuario debe completar cuestionario primero
- **Error 404**: Usuario no tiene cuestionario iniciado

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas

```env
# Grafana
GRAFANA_SA_TOKEN=token_de_grafana
GRAFANA_URL=https://nocode1.grafana.net

# Base de Datos
DATABASE_URL=postgresql://user:pass@host:port/database
```

### URLs de Grafana Generadas

**Formato Base**:
```
https://nocode1.grafana.net/render/d-solo/057abaf9-2e0f-4aa4-99b0-3b0e2990c5aa/cuestionario-ia2?
orgId=1&
panelId={PANEL_ID}&
from=now-30d&
to=now&
theme=dark&
width=800&
height=400&
var-session_id={SESSION_ID}
```

**Ejemplo con Session ID**:
```
/grafana/panel/1.png?session_id=550e8400-e29b-41d4-a716-446655440000
```

## 🧪 Testing y Validación

### Archivo de Test

Usa `test-grafana-personalized.html` para probar el sistema:

1. **Configurar entorno** (Local/Producción)
2. **Proporcionar User ID** válido
3. **Obtener Session ID** del usuario
4. **Cargar paneles personalizados** con el session_id

### Comandos de Prueba

```bash
# Test local - endpoint de sesión
curl "http://localhost:3002/api/user/session?user_id=USER_UUID"

# Test local - panel personalizado
curl "http://localhost:3002/grafana/panel/1.png?session_id=SESSION_UUID"

# Test producción - endpoint de sesión  
curl "https://tu-dominio.com/api/user/session?user_id=USER_UUID"

# Test producción - panel personalizado
curl "https://tu-dominio.com/grafana/panel/1.png?session_id=SESSION_UUID"
```

## 🔒 Seguridad y Cache

### Sistema de Cache Inteligente

- **Cache por Usuario**: Cada `session_id` tiene su propio cache
- **Duración**: 5 minutos por defecto
- **Clave de Cache**: `panel_{panelId}_{sessionId || 'general'}`
- **Limpieza Automática**: Mantiene solo las últimas 10 entradas

### Consideraciones de Seguridad

1. **Validación de User ID**: Verificar que el usuario autenticado puede acceder a sus datos
2. **Session ID Privado**: No exponer session_ids de otros usuarios
3. **Rate Limiting**: Implementar límites de requests por usuario
4. **Logs de Acceso**: Registrar accesos para auditoría

## 🚀 Implementación en Frontend

### React Example

```jsx
import { useState, useEffect } from 'react';

function PersonalizedDashboard({ userId }) {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserSession() {
      try {
        const response = await fetch(`/api/user/session?user_id=${userId}`);
        const data = await response.json();
        
        if (data.grafana_ready) {
          setSessionData(data);
        } else {
          // Redirigir a cuestionario
          window.location.href = '/cuestionario';
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserSession();
  }, [userId]);

  if (loading) return <div>Cargando...</div>;
  if (!sessionData) return <div>Complete el cuestionario primero</div>;

  return (
    <div className="dashboard">
      <h2>Dashboard Personalizado - {sessionData.perfil}</h2>
      <div className="panels">
        {[1, 2, 3, 4, 5].map(panelId => (
          <img 
            key={panelId}
            src={`/grafana/panel/${panelId}.png?session_id=${sessionData.session_id}`}
            alt={`Panel ${panelId}`}
            className="panel-image"
          />
        ))}
      </div>
    </div>
  );
}
```

### Vanilla JavaScript Example

```javascript
class PersonalizedGrafana {
  constructor(userId, containerSelector) {
    this.userId = userId;
    this.container = document.querySelector(containerSelector);
    this.sessionData = null;
  }

  async init() {
    await this.loadUserSession();
    if (this.sessionData?.grafana_ready) {
      this.renderPanels();
    } else {
      this.showQuestionnairePrompt();
    }
  }

  async loadUserSession() {
    try {
      const response = await fetch(`/api/user/session?user_id=${this.userId}`);
      this.sessionData = await response.json();
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }

  renderPanels() {
    const panelIds = [1, 2, 3, 4, 5];
    const panelsHtml = panelIds.map(panelId => 
      `<img src="/grafana/panel/${panelId}.png?session_id=${this.sessionData.session_id}" 
            alt="Panel ${panelId}" class="panel-image">`
    ).join('');

    this.container.innerHTML = `
      <h2>Dashboard - ${this.sessionData.perfil}</h2>
      <div class="panels">${panelsHtml}</div>
    `;
  }

  showQuestionnairePrompt() {
    this.container.innerHTML = `
      <div class="questionnaire-prompt">
        <h3>Complete el cuestionario para ver sus gráficas personalizadas</h3>
        <button onclick="window.location.href='/cuestionario'">Ir al Cuestionario</button>
      </div>
    `;
  }
}

// Uso
const dashboard = new PersonalizedGrafana('user-uuid', '#dashboard-container');
dashboard.init();
```

## 📈 Configuración de Grafana

### Variables Requeridas en Grafana

1. **session_id**: Variable de template que recibe el UUID de la sesión
2. **Queries Dinámicas**: Las consultas deben filtrar por `session_id`

### Ejemplo de Query Grafana

```sql
SELECT 
  dimension,
  valor,
  timestamp
FROM user_question_responses uqr
JOIN questions_catalog qc ON uqr.question_id = qc.id
WHERE uqr.session_id = '$session_id'
  AND qc.dimension = 'productividad'
ORDER BY timestamp
```

## 🔧 Solución de Problemas

### Errores Comunes

1. **Error 404 en session**: Usuario no tiene cuestionario
   - **Solución**: Redirigir a página de cuestionario

2. **Error 500 en Grafana**: Panel ID no existe o configuración incorrecta
   - **Solución**: Verificar panel IDs válidos en Grafana

3. **Cache no funciona**: Session ID cambiando entre requests
   - **Solución**: Verificar que el session_id sea consistente

4. **Gráficas vacías**: Usuario completó cuestionario pero no hay datos
   - **Solución**: Verificar que las respuestas se guardaron correctamente

### Debugging

```bash
# Verificar logs del servidor
tail -f logs/server.log | grep "session_id"

# Test directo a Grafana
curl "https://nocode1.grafana.net/render/d-solo/DASH_UID/DASH_SLUG?panelId=1&var-session_id=SESSION_ID" \
  -H "Authorization: Bearer GRAFANA_TOKEN"

# Verificar datos en base de datos
psql $DATABASE_URL -c "SELECT id, user_id, completed_at FROM user_questionnaire_sessions WHERE user_id = 'USER_UUID';"
```

## 🎯 Próximos Pasos

1. **Dashboard Analytics**: Métricas de uso por usuario
2. **A/B Testing**: Diferentes versiones de gráficas
3. **Exportar Datos**: Permitir descargar datos personalizados
4. **Comparativas**: Mostrar datos vs promedios del grupo
5. **Alertas**: Notificaciones basadas en cambios en datos

---

✅ **Sistema Completamente Implementado y Funcional**

El sistema de personalización de Grafana está listo para producción con cache inteligente, validación de datos y soporte completo para desarrollo local y despliegue en Netlify.