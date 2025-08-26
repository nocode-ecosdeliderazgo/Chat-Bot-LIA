# PROMPT PARA CLAUDE CODE - REESTRUCTURACIÓN DE CHAT.HTML

## OBJETIVO PRINCIPAL
Reestructurar `chat.html` para optimizar el espacio y agregar nuevas funcionalidades sin afectar la funcionalidad existente del chat en vivo conectado al servidor de Heroku.

## CAMBIOS REQUERIDOS

### 1. REESTRUCTURACIÓN DEL LAYOUT

#### Panel de Estado de Conexión (Actual: "Desconectado/Conectado")
- **Ubicación**: Mantener en la parte superior donde está actualmente
- **Nuevo diseño**: Agregar dos botones de toggle:
  - **Botón "Chat en Vivo"**: Para mostrar el chat en vivo (funcionalidad existente)
  - **Botón "Chat con LIA"**: Para mostrar el chat con el asistente IA
- **Comportamiento**: Solo uno activo a la vez, con indicador visual claro
- **Estilo**: Botones tipo toggle con estados activo/inactivo

#### Chat Principal (Área Central - MODIFICAR)
- **Ubicación**: Área central principal (donde está actualmente el chat)
- **Funcionalidad**: Contenedor que cambia entre dos modos:
  - **Modo "Chat en Vivo"**: Muestra el chat en vivo existente (funcionalidad actual)
  - **Modo "Chat con LIA"**: Muestra el chat con el asistente IA
- **Comportamiento**: El mismo contenedor cambia de contenido según el botón seleccionado
- **Estado**: Por defecto muestra "Chat en Vivo"

#### Panel de Herramientas (Izquierda - MODIFICAR)
- **Ubicación**: Panel lateral izquierdo
- **Nuevo contenido**:
  - **Sección "Chat en Vivo"**: Mantener la funcionalidad existente
  - **Sección "Zoom Session"**: NUEVA - Integración de Zoom dentro del panel de herramientas
- **Estado**: Todas las secciones visibles simultáneamente

#### Panel de Presentación (Derecha - NUEVO)
- **Ubicación**: Panel lateral derecho (donde antes estaba el chat con LIA)
- **Funcionalidad**: Carga y visualización de presentaciones
- **Características**:
  - Botón "Cargar Presentación"
  - Soporte para PDF, PowerPoint, Google Slides
  - Controles de navegación
  - Modo presentador
- **Estado**: Siempre visible

### 2. NUEVAS FUNCIONALIDADES

#### Zoom Session (DENTRO del panel de herramientas)
- **Ubicación**: Dentro del panel lateral izquierdo de herramientas
- **Funcionalidad**: Integración de Zoom Web SDK
- **Características**:
  - Botón "Conectar Zoom"
  - Controles básicos (unirse, salir, audio, video)
  - Estado de conexión
- **Estado**: Siempre visible en el panel de herramientas

#### Presentación (Panel lateral derecho)
- **Ubicación**: Panel lateral derecho (donde antes estaba el chat con LIA)
- **Funcionalidad**: Carga y visualización de presentaciones
- **Características**:
  - Botón "Cargar Presentación"
  - Soporte para PDF, PowerPoint, Google Slides
  - Controles de navegación
  - Modo presentador
- **Estado**: Siempre visible

#### Chat con LIA (DENTRO del contenedor principal)
- **Ubicación**: Mismo contenedor que el chat en vivo
- **Funcionalidad**: Chat completo con el asistente IA
- **Características**:
  - Campo de entrada de texto
  - Historial de mensajes
  - Capacidad de hacer preguntas sobre cualquier tema
  - Integración con la IA existente
- **Estado**: Se muestra cuando se selecciona "Chat con LIA"

### 3. ESPECIFICACIONES TÉCNICAS

#### Estructura HTML
```html
<!-- Panel de Estado -->
<div class="connection-panel">
  <button class="toggle-btn active" data-target="live-chat">Chat en Vivo</button>
  <button class="toggle-btn" data-target="lia-chat">Chat con LIA</button>
</div>

<!-- Panel de Herramientas (Izquierda) -->
<div class="tools-panel">
  <!-- Sección Chat en Vivo (existente) -->
  <div class="live-chat-section">
    <!-- TODO EL CÓDIGO EXISTENTE DEL CHAT EN VIVO SE MANTIENE -->
  </div>
  
  <!-- Sección Zoom Session (NUEVA) -->
  <div class="zoom-section">
    <h3>Zoom Session</h3>
    <button class="zoom-connect-btn">Conectar Zoom</button>
    <!-- Controles de Zoom aquí -->
  </div>
</div>

<!-- Contenedor Principal del Chat (Centro) -->
<div class="main-chat-container">
  <!-- Chat en Vivo (EXISTENTE - se muestra por defecto) -->
  <div class="live-chat-content active">
    <!-- TODO EL CÓDIGO EXISTENTE DEL CHAT EN VIVO SE MANTIENE -->
  </div>
  
  <!-- Chat con LIA (NUEVO - se muestra al cambiar) -->
  <div class="lia-chat-content hidden">
    <!-- Nuevo chat con IA -->
  </div>
</div>

<!-- Panel de Presentación (Derecha) -->
<div class="presentation-panel">
  <h3>Presentación</h3>
  <button class="load-presentation-btn">Cargar Presentación</button>
  <!-- Controles de presentación aquí -->
</div>
```

#### CSS Requerido
- Layout responsive con flexbox/grid
- Transiciones suaves entre modos de chat
- Estados visuales claros para botones toggle
- Diseño que aproveche el espacio disponible
- Estilos para las nuevas secciones de Zoom y Presentación

#### JavaScript Requerido
- Sistema de toggle entre chats (cambia contenido del contenedor principal)
- Integración con Zoom Web SDK
- Sistema de carga de diapositivas
- Mantener toda la funcionalidad existente del chat en vivo

### 4. RESTRICCIONES CRÍTICAS

#### NO TOCAR (FUNCIONALIDAD EXISTENTE)
- **Chat en vivo**: Todo el código relacionado con la conexión al servidor de Heroku
- **WebSocket connections**: Mantener intactas
- **Event listeners**: No modificar los existentes
- **Variables globales**: No cambiar nombres ni estructura
- **Funciones de conexión**: Mantener exactamente como están

#### FUNCIONALIDADES A PRESERVAR
- Conexión automática al servidor
- Envío y recepción de mensajes en tiempo real
- Estados de conexión (conectado/desconectado)
- Historial de mensajes
- Cualquier otra funcionalidad que ya esté funcionando

### 5. IMPLEMENTACIÓN SEGURA

#### Enfoque de Desarrollo
1. **Backup**: Crear copia de seguridad del archivo actual
2. **Modular**: Agregar nuevas funcionalidades sin tocar el código existente
3. **Testing**: Verificar que el chat en vivo sigue funcionando después de cada cambio
4. **Incremental**: Implementar cambios paso a paso

#### Orden de Implementación
1. Crear estructura HTML base sin tocar funcionalidad existente
2. Implementar sistema de toggle entre chats (mismo contenedor)
3. Agregar sección Zoom dentro del panel de herramientas
4. Agregar panel de Presentación en el lateral derecho
5. Integrar chat con LIA en el contenedor principal
6. Testing completo de funcionalidad existente

### 6. CONSIDERACIONES DE UX

#### Navegación Intuitiva
- Botones claros y descriptivos
- Indicadores visuales del estado activo
- Transiciones suaves entre modos de chat
- Feedback visual inmediato

#### Responsive Design
- Funcionar en desktop, tablet y móvil
- Adaptar layout según tamaño de pantalla
- Mantener usabilidad en todos los dispositivos

### 7. TESTING REQUERIDO

#### Funcionalidad Existente
- [ ] Chat en vivo conecta correctamente
- [ ] Mensajes se envían y reciben
- [ ] Estados de conexión funcionan
- [ ] No hay errores en consola

#### Nueva Funcionalidad
- [ ] Toggle entre chats funciona (mismo contenedor)
- [ ] Chat con LIA responde correctamente
- [ ] Sección Zoom se integra en panel de herramientas
- [ ] Panel de Presentación funciona en lateral derecho
- [ ] Layout responsive

## INSTRUCCIONES FINALES

**IMPORTANTE**: Este es un proyecto en producción con funcionalidad crítica. Cualquier cambio debe ser conservador y preservar completamente la funcionalidad existente del chat en vivo.

**PRIORIDAD**: La funcionalidad existente es más importante que las nuevas características. Si hay conflicto, priorizar mantener lo que ya funciona.

**COMUNICACIÓN**: Si encuentras algún problema o conflicto, documentarlo claramente antes de proceder.

---

**ARCHIVO OBJETIVO**: `src/chat.html`
**MANTENER INTACTO**: Todo el código relacionado con WebSocket y conexión al servidor de Heroku
**AGREGAR**: Nuevas funcionalidades de manera modular y segura
**ESTRUCTURA**: Zoom DENTRO del panel de herramientas, Presentación en panel lateral derecho, Chat con LIA DENTRO del contenedor principal del chat
