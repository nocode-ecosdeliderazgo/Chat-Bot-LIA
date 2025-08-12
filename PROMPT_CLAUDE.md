Eres un ingeniero full‑stack senior (frontend JS vanilla + Node/Express + Socket.IO). Tras el último merge entre la rama `fer2` y la de Gael, el chat quedó roto: los botones aparecen desactivados y no se puede enviar mensajes ni interactuar. Debes corregir el chat sin romper nada que ya funciona (login, endpoints del servidor, CSP, etc.). Haz ediciones mínimas, seguras y enfocadas en regresiones de merge.

## Objetivo general
- Recuperar la interactividad completa del chat (entrada, envío, menús y livestream) en `src/chat.html` + `src/scripts/main.js`, manteniendo intactos login y demás flujos.

## Síntomas reportados
- Botones “desactivados” o sin respuesta en la UI del chat.
- No se envían mensajes al presionar Enter o al hacer click en el botón de acción.
- Después del merge, “todo se descompuso” en la vista de chat.

## Ámbito y restricciones
- No tocar autenticación ni vistas en `src/login/` ni endpoints/seguridad en `server.js` (login y API deben quedar iguales).
- No modificar CSP, ni `helmet` ni rutas del servidor salvo que detectes un bug evidente que afecte EXCLUSIVAMENTE al chat.
- Mantener IDs/clases actuales del DOM. Evitar renombrar selectores públicos.
- Minimizar diffs y no eliminar funcionalidades existentes (audio, livestream, menús), solo arreglar wiring/estados rotos.

## Puntos de referencia en el código (para verificar wiring)
- `src/chat.html` (elementos críticos):
  - `#messageInput`, `#actionButton`, `#sessionMenuButton`, `#globalMenu`.
  - Bloque de livestream: `#livestreamMessageInput`, `#livestreamSendBtn`, `#livestreamChatMessages`, `#livestreamUsersCount`, `#livestreamConnectionStatus`, `#livestreamToggle`.
- `src/styles/main.css`:
  - La clase `.loading` aplica `pointer-events: none;` y `opacity: 0.6;`. Asegúrate de que no quede aplicada al contenedor del chat tras la inicialización (puede “congelar” la UI).
- `src/scripts/main.js` (eventos y posibles conflictos de merge):
  - Selectores y listeners del chat: `messageInput`, `actionButton`, `sessionMenuButton` y su lógica de `updateActionState` para alternar mic/enviar.
  - Envío por Enter: listeners sobre `messageInput` para keypress Enter.
  - Inicialización de audio: `initializeAudio()`, `toggleAudio()`, `playWelcomeAudio()`.
  - Socket.IO del livestream: hay inicialización duplicada del bloque de livestream (dos secciones similares con `livestreamSocket = io({...})` y comentarios “Inicializar chat del livestream…”). Debe existir UNA sola inicialización.
  - Múltiples `DOMContentLoaded`: hay varias instancias; consolidar para evitar doble wiring.

## Correcciones requeridas (prioridad y detalle)
1) Rehabilitar envío de mensajes y estado del botón de acción
   - Asegúrate de que `updateActionState()` se ejecute en `input/keyup/change` de `#messageInput` y que añada/quite la clase `input-has-text` en `#inputContainer` para mostrar el ícono de enviar.
   - `#actionButton` debe:
     - Con texto en `#messageInput` → enviar mensaje al click/Enter.
     - Sin texto → comportarse como botón de “hablar” solo si el modo audio está activo. Evita estados intermedios que deshabiliten el click.
   - Valida que ningún `preventDefault()` o `return` temprano esté bloqueando el flujo de envío cuando hay texto.

2) Quitar estados globales que bloquean interacción
   - Verifica que no quede aplicada `.loading` en contenedores del chat al finalizar la init. Si existe, remuévela explícitamente.
   - Revisa overlays o paneles con `pointer-events: none` aplicados al contenedor principal por error después del merge.

3) Unificar inicialización del livestream (Socket.IO)
   - El bloque de livestream aparece duplicado en `src/scripts/main.js` (dos veces se observa `livestreamSocket = io({...})` y handlers `on('connect')/on('disconnect')/...`). Conserva UNA versión funcional.
   - Al conectar: habilita `#livestreamSendBtn` y actualiza `#livestreamConnectionStatus` a online; al desconectar: deshabilita el botón y marca offline.
   - Mantén la lógica de “pendientes” (mensajes en cola) pero sin duplicación/condiciones contradictorias.

4) Consolidar la inicialización (DOMContentLoaded)
   - Reduce a una sola rutina `init()` llamada en un único `document.addEventListener('DOMContentLoaded', ...)`.
   - Dentro de `init()`: enlaza todos los listeners (chat básico, global menu, audio opcional y livestream). No anidar múltiples `DOMContentLoaded` que se pisan.
   - Añade guardas null‑safe: si un selector no existe, no rompas la init del resto.

5) Manejo robusto de errores y ausencia de Socket.IO
   - Si `/socket.io/socket.io.js` no carga, el chat básico debe seguir funcionando (no errores que aborten listeners del chat). Envuelve el acceso a `io` con comprobación y logs claros.

6) No tocar login, seguridad ni base de datos
   - No modificar nada en `src/login/`, ni autenticación en `server.js`, ni endpoints `/api/*` ajenos al chat/livestream. Solo arregla JS del cliente.

## Checklist de edición por archivo
- `src/scripts/main.js`:
  - [ ] Consolidar a un único `DOMContentLoaded` con `init()`.
  - [ ] Restaurar wiring de `#messageInput` (input/keyup/change), Enter para enviar y click en `#actionButton` respetando estado mic/enviar.
  - [ ] Eliminar el bloque duplicado de livestream (dejar una sola sección con `livestreamSocket = io({...})`).
  - [ ] Asegurar habilitado/deshabilitado de `#livestreamSendBtn` en función de conexión.
  - [ ] Quitar clases `.loading` sobrantes al completar init.
  - [ ] Envoltorios null‑safe para que la falta de algún nodo no rompa el resto de listeners.
- `src/chat.html`:
  - [ ] Verifica que los IDs usados por JS existen: `messageInput`, `actionButton`, `sessionMenuButton`, `globalMenu`, y los del livestream.
  - [ ] Sin cambios estructurales mayores (no renombrar IDs/clases públicas).
- `src/styles/main.css`:
  - [ ] Revisa `.loading` y cualquier selector que deje `pointer-events: none` activo tras la carga. No tocar otros estilos.

## Pruebas de aceptación (manuales)
- Chat básico:
  - [ ] Escribir texto activa el modo “enviar” (ícono de enviar visible). Enter/Click envía y el mensaje aparece en `#chatMessages`.
  - [ ] Sin texto, el botón no bloquea clicks ni queda “muerto” (si audio desactivado, no hace nada; si activado, inicia flujo de hablar sin colgar la UI).
- Menú global:
  - [ ] `#sessionMenuButton` abre/cierra `#globalMenu` y permite interactuar (sin overlays que bloqueen).
- Livestream:
  - [ ] Conexión establece estado “online”, habilita `#livestreamSendBtn` y recibe/emite `new-livestream-message`.
  - [ ] Desconexión muestra “offline”, deshabilita el botón y conserva mensajes pendientes.
- No regresiones:
  - [ ] Login en `src/login/` sigue funcionando.
  - [ ] `/api/health` responde y `server.js` no tuvo cambios funcionales.
  - [ ] Sin errores uncaught en consola; no hay listeners duplicados.

## Notas de implementación
- Prefiere early‑returns y guardas para evitar que un fallo en livestream rompa el chat básico.
- Evita variables globales duplicadas (`let livestreamSocket` aparece dos veces tras el merge). Deja una sola definición.
- Añade logs claros con prefijo, por ejemplo: `[CHAT_INIT]`, `[LIVESTREAM]`, para depurar.

## Entregables
- Commits pequeños con mensajes claros, por ejemplo:
  - `fix(chat): restaurar wiring de input/acción y envío por Enter`
  - `fix(livestream): unificar init de socket y habilitar botón correctamente`
  - `chore(init): consolidar DOMContentLoaded en init()`

## Criterio de done
- El chat vuelve a ser usable end‑to‑end, los botones responden, y no se introducen regresiones en login u otras áreas. Sin warnings/errores en consola durante uso normal.


