# Selector de Tipo de Mensaje - Chat del Livestream

## Descripción
Implementación de un selector de tipo de mensaje para el chat en vivo del livestream, que permite a los usuarios decidir si su mensaje es para LIA (el chatbot) o para otros usuarios del chat.

## Características Implementadas

### ✅ Funcionalidades Actuales
- **Selector de Tipo de Mensaje**: Botón único para LIA (se eliminó el botón "Usuarios")
- **Estado por Defecto**: El botón LIA NO está seleccionado por defecto
- **Activación Explícita**: LIA solo responde cuando el usuario presiona explícitamente el botón LIA
- **Placeholder Dinámico**: El input muestra diferentes textos según el estado de selección
- **Validación**: No se pueden enviar mensajes sin seleccionar un tipo
- **Diferenciación Visual**: Los mensajes se muestran con diferentes estilos según su tipo
- **Estados de LIA**: Indicadores de "pensando", respuesta y error
- **Responsive Design**: Adaptado para dispositivos móviles

### 🔄 Cambios Recientes
- **Eliminación del botón "Usuarios"**: Ya no está disponible la opción de enviar mensajes a otros usuarios
- **Estado por defecto modificado**: El botón LIA no está activo por defecto
- **Activación manual requerida**: El usuario debe presionar explícitamente el botón LIA para activarlo
- **Validación mejorada**: Se verifica que se haya seleccionado un tipo antes de enviar mensajes

## Implementación Técnica

### Archivos Modificados

#### 1. `src/chat.html`
```html
<div class="livestream-chat-input">
    <div class="message-type-selector" id="messageTypeSelector">
        <button class="type-btn" data-type="lia" title="Enviar a LIA (Chatbot)">
            <i class='bx bx-brain'></i>
            <span>LIA</span>
        </button>
    </div>
    <div class="input-wrapper">
        <input 
            type="text" 
            id="livestreamMessageInput" 
            placeholder="Selecciona LIA para preguntar..."
            maxlength="200"
        >
        <button id="livestreamSendBtn" class="livestream-send-btn" disabled title="Enviar mensaje">
            <i class='bx bx-send'></i>
        </button>
    </div>
</div>
```

#### 2. `src/scripts/main.js`

**Estado del Chat:**
```javascript
let livestreamChatState = {
    isConnected: false,
    username: '',
    messageType: null, // Sin tipo por defecto - el usuario debe seleccionar
    messages: [],
    connectedUsers: [],
    pendingMessages: []
};
```

**Función de Placeholder:**
```javascript
function updateInputPlaceholder() {
    if (!messageInput) return;
    
    const placeholders = {
        'lia': 'Pregunta algo a LIA...'
    };
    
    messageInput.placeholder = livestreamChatState.messageType 
        ? placeholders[livestreamChatState.messageType] 
        : 'Selecciona LIA para preguntar...';
}
```

**Función de Envío con Validación:**
```javascript
function sendLivestreamMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Verificar que se haya seleccionado un tipo de mensaje
    if (!livestreamChatState.messageType) {
        console.log('[LIVESTREAM] No se ha seleccionado tipo de mensaje');
        return;
    }

    const messageType = livestreamChatState.messageType;
    // ... resto de la lógica
}
```

#### 3. `src/styles/chat.css`
```css
/* Selector de tipo de mensaje */
.message-type-selector {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 8px;
}

.type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.type-btn:hover {
    background: rgba(68, 229, 255, 0.1);
    color: var(--text-on-dark);
}

.type-btn.active {
    background: var(--color-primary);
    color: var(--color-bg-1);
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(68, 229, 255, 0.3);
}
```

#### 4. `src/styles/chat-responsive.css`
```css
/* Responsive para móviles */
@media (max-width: 768px) {
    .livestream-chat-input {
        flex-direction: column;
        gap: 8px;
    }
    
    .message-type-selector {
        justify-content: center;
        gap: 6px;
    }
    
    .type-btn {
        padding: 6px 10px;
        font-size: 0.8rem;
    }
}
```

### Funciones Principales

#### `initializeMessageTypeSelector()`
- Inicializa los eventos de click en los botones del selector
- No establece ningún tipo por defecto
- Actualiza el placeholder del input

#### `updateInputPlaceholder()`
- Cambia dinámicamente el placeholder del input según el tipo seleccionado
- Muestra "Selecciona LIA para preguntar..." cuando no hay tipo seleccionado

#### `sendLivestreamMessage()`
- Valida que se haya seleccionado un tipo de mensaje antes de enviar
- Enruta el mensaje a LIA si el tipo es 'lia'
- Previene el envío si no hay tipo seleccionado

#### `sendMessageToLIA(message, clientMessageId)`
- Maneja la comunicación con LIA
- Muestra indicador de "pensando"
- Procesa la respuesta usando `getGeneralAnswer()`
- Maneja errores y estados

## Flujo de Usuario

### 1. Estado Inicial
- El botón LIA no está seleccionado (sin clase `active`)
- El placeholder dice "Selecciona LIA para preguntar..."
- El botón de envío está deshabilitado

### 2. Selección de Tipo
- El usuario hace click en el botón LIA
- El botón se activa visualmente (clase `active`)
- El placeholder cambia a "Pregunta algo a LIA..."
- El botón de envío se habilita (si hay texto en el input)

### 3. Envío de Mensaje
- El usuario escribe un mensaje
- Presiona Enter o el botón de envío
- Se valida que haya un tipo seleccionado
- El mensaje se envía a LIA
- Se muestra la respuesta de LIA

### 4. Estados de LIA
- **Pensando**: Indicador visual mientras LIA procesa
- **Respuesta**: Mensaje de LIA con estilo diferenciado
- **Error**: Mensaje de error si algo falla

## Estilos Visuales

### Tipos de Mensaje
- **LIA**: Borde azul, badge azul, fondo azul claro
- **Error**: Borde rojo, badge rojo, fondo rojo claro

### Estados del Botón
- **Inactivo**: Fondo gris, texto gris
- **Hover**: Fondo azul claro, texto blanco
- **Activo**: Fondo azul, texto negro, sombra azul

## Testing

### Archivo de Prueba
Se incluye `test-livestream-chat-updated.html` para probar la funcionalidad de forma aislada.

### Casos de Prueba
1. **Estado inicial**: Verificar que no hay tipo seleccionado
2. **Selección de LIA**: Verificar que el botón se activa
3. **Envío sin selección**: Verificar que no se envía el mensaje
4. **Envío con selección**: Verificar que se envía correctamente
5. **Cambio de placeholder**: Verificar que cambia según el estado

## Mejoras Futuras

### Posibles Extensiones
- **Reintroducción del chat entre usuarios**: Si se requiere en el futuro
- **Múltiples tipos de chatbot**: Diferentes asistentes especializados
- **Historial de conversaciones**: Guardar conversaciones con LIA
- **Configuración de usuario**: Preferencias de tipo de mensaje por defecto

### Optimizaciones
- **Debounce en el input**: Para mejorar el rendimiento
- **Cache de respuestas**: Para respuestas frecuentes
- **Indicadores de estado**: Más detallados para el usuario

## Notas de Implementación

### Consideraciones de UX
- El usuario debe ser consciente de que debe seleccionar LIA explícitamente
- El placeholder guía al usuario sobre qué hacer
- La validación previene envíos accidentales

### Compatibilidad
- Funciona con el sistema de Socket.IO existente
- Compatible con el sistema de autenticación
- Responsive para todos los dispositivos

### Seguridad
- Validación en el frontend y backend
- Sanitización de mensajes
- Control de acceso por roles
