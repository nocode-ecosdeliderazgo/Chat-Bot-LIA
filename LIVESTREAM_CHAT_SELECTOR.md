# 🎯 Selector de Tipo de Mensaje - Chat en Vivo

## 📋 Descripción

Se ha implementado una nueva funcionalidad en el chat en vivo que permite a los usuarios elegir si su mensaje es para el **chatbot LIA** o para los **demás usuarios** del chat en vivo.

## ✨ Características Implementadas

### 🎛️ Selector Visual
- **Botón LIA**: Envía mensajes al chatbot para obtener respuestas
- **Botón Usuarios**: Envía mensajes al chat en vivo con otros participantes
- **Indicadores visuales**: Iconos y colores distintivos para cada tipo
- **Estado activo**: El botón seleccionado se resalta visualmente

### 🎨 Diferenciación Visual de Mensajes
- **Badges de tipo**: Cada mensaje muestra un badge indicando su destino
  - 🔵 **LIA**: Mensajes enviados al chatbot
  - 🟢 **Usuarios**: Mensajes enviados al chat en vivo
  - 🔴 **Error**: Mensajes de error del sistema
- **Colores distintivos**: Bordes de diferentes colores según el tipo
- **Estados especiales**: 
  - "Pensando..." con animación para respuestas de LIA
  - Respuestas de LIA con fondo especial
  - Mensajes de error con estilo distintivo

### 🔄 Placeholders Dinámicos
- **LIA**: "Pregunta algo a LIA..."
- **Usuarios**: "Escribe un mensaje para los usuarios..."

## 🛠️ Implementación Técnica

### 📁 Archivos Modificados

#### `src/chat.html`
```html
<!-- Selector de tipo de mensaje -->
<div class="message-type-selector" id="messageTypeSelector">
    <button class="type-btn active" data-type="lia" title="Enviar a LIA (Chatbot)">
        <i class='bx bx-brain'></i>
        <span>LIA</span>
    </button>
    <button class="type-btn" data-type="users" title="Enviar a usuarios">
        <i class='bx bx-group'></i>
        <span>Usuarios</span>
    </button>
</div>
```

#### `src/scripts/main.js`
- **`initializeMessageTypeSelector()`**: Inicializa el selector y maneja eventos
- **`updateInputPlaceholder()`**: Actualiza el placeholder según el tipo seleccionado
- **`sendMessageToLIA()`**: Maneja el envío de mensajes al chatbot
- **`sendLivestreamMessage()`**: Modificada para manejar ambos tipos de mensaje
- **`addLivestreamMessage()`**: Mejorada para mostrar diferentes estilos según el tipo

#### `src/styles/chat.css` y `src/styles/chat-responsive.css`
- Estilos para el selector de tipo de mensaje
- Estilos para badges de tipo de mensaje
- Estilos para diferentes tipos de mensajes (LIA, usuarios, errores)
- Animaciones y estados visuales

### 🔧 Funcionalidades Clave

#### 1. Selección de Tipo de Mensaje
```javascript
function initializeMessageTypeSelector() {
    const typeBtns = typeSelector.querySelectorAll('.type-btn');
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Cambiar tipo activo
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Actualizar estado
            livestreamChatState.messageType = btn.dataset.type;
            updateInputPlaceholder();
        });
    });
}
```

#### 2. Envío Inteligente de Mensajes
```javascript
function sendLivestreamMessage() {
    const messageType = livestreamChatState.messageType || 'lia';
    
    if (messageType === 'lia') {
        // Enviar a LIA (chatbot)
        sendMessageToLIA(message, clientMessageId);
    } else {
        // Enviar a usuarios del chat
        livestreamSocket.emit('livestream-message', { 
            message, 
            clientMessageId,
            messageType 
        });
    }
}
```

#### 3. Integración con Chatbot LIA
```javascript
async function sendMessageToLIA(message, clientMessageId) {
    // Mostrar indicador de "pensando"
    addLivestreamMessage({
        username: 'LIA',
        message: 'Pensando...',
        type: 'lia-thinking'
    });

    // Obtener respuesta usando la función existente
    const response = await getGeneralAnswer(message);
    
    // Mostrar respuesta
    addLivestreamMessage({
        username: 'LIA',
        message: response,
        type: 'lia-response'
    });
}
```

## 🎨 Estilos Visuales

### Selector de Tipo
```css
.message-type-selector {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: rgba(68, 229, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(68, 229, 255, 0.1);
}

.type-btn.active {
    background: var(--color-primary);
    color: var(--color-bg-1);
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(68, 229, 255, 0.3);
}
```

### Badges de Tipo
```css
.message-type-badge.lia {
    background: rgba(68, 229, 255, 0.2);
    color: #44e5ff;
    border: 1px solid rgba(68, 229, 255, 0.3);
}

.message-type-badge.users {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
}
```

## 📱 Responsive Design

- **Desktop**: Selector horizontal con iconos y texto
- **Móvil**: Selector optimizado con tamaños reducidos
- **Touch-friendly**: Botones con tamaño mínimo de 44px para móviles

## 🧪 Testing

### Archivo de Prueba: `test-livestream-chat.html`
- Simula la funcionalidad completa del selector
- Permite probar la interfaz sin necesidad del backend
- Incluye instrucciones de uso

### Casos de Prueba
1. ✅ Cambio entre tipos de mensaje
2. ✅ Actualización de placeholders
3. ✅ Estilos visuales correctos
4. ✅ Responsive design
5. ✅ Integración con chatbot LIA
6. ✅ Manejo de errores

## 🚀 Uso

### Para Usuarios
1. **Seleccionar tipo**: Hacer clic en "LIA" o "Usuarios"
2. **Escribir mensaje**: El placeholder indica el destino
3. **Enviar**: Presionar Enter o hacer clic en el botón de envío
4. **Ver resultado**: Los mensajes se muestran con badges distintivos

### Para Desarrolladores
1. **Configurar**: El selector se inicializa automáticamente
2. **Personalizar**: Modificar estilos en `chat.css`
3. **Extender**: Agregar nuevos tipos de mensaje si es necesario
4. **Integrar**: Conectar con diferentes servicios de chatbot

## 🔮 Próximas Mejoras

- [ ] **Atajos de teclado**: Ctrl+L para LIA, Ctrl+U para usuarios
- [ ] **Historial de tipos**: Recordar la última selección del usuario
- [ ] **Más tipos**: Agregar soporte para otros destinos (moderador, instructor)
- [ ] **Analytics**: Seguimiento de uso de cada tipo de mensaje
- [ ] **Notificaciones**: Alertas cuando hay respuestas de LIA

## 📊 Métricas de Uso

La funcionalidad permite:
- **Separación clara** entre preguntas al chatbot y conversación social
- **Mejor experiencia** al evitar confusión sobre el destino de los mensajes
- **Análisis de uso** para entender patrones de comunicación
- **Escalabilidad** para agregar más tipos de mensaje en el futuro

---

**Estado**: ✅ **Implementado y Funcional**
**Versión**: 1.0.0
**Fecha**: Diciembre 2024
