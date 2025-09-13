// Script de debug y fix para el chat de Lia
console.log('🔧 Chat Debug Fix iniciando...');

// Función para verificar elementos del DOM
function verificarElementosChat() {
    console.log('🔍 Verificando elementos del chat...');
    
    const sendBtn = document.getElementById('sendLiaMessage');
    const input = document.getElementById('liaMessageInput');
    const messagesContainer = document.getElementById('liaMessages');
    
    console.log('- Botón enviar:', sendBtn ? '✅' : '❌');
    console.log('- Input mensaje:', input ? '✅' : '❌');
    console.log('- Contenedor mensajes:', messagesContainer ? '✅' : '❌');
    
    return { sendBtn, input, messagesContainer };
}

// Función para agregar mensaje del usuario
function agregarMensajeUsuario(mensaje) {
    console.log('👤 Agregando mensaje del usuario:', mensaje);
    
    const messagesContainer = document.getElementById('liaMessages');
    if (!messagesContainer) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'user-message';
    userMsg.innerHTML = `
        <div class="message-content">
            <div class="message-text">${mensaje}</div>
            <div class="message-time">ahora</div>
        </div>
    `;

    messagesContainer.appendChild(userMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Función para agregar mensaje de Lia
function agregarMensajeLia(mensaje) {
    console.log('🤖 Agregando mensaje de Lia:', mensaje.substring(0, 50) + '...');
    
    const messagesContainer = document.getElementById('liaMessages');
    if (!messagesContainer) return;

    const liaMsg = document.createElement('div');
    liaMsg.className = 'lia-message';
    liaMsg.innerHTML = `
        <div class="lia-avatar">
            <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
        </div>
        <div class="message-content">
            <div class="message-text">${mensaje}</div>
            <div class="message-time">ahora</div>
        </div>
    `;

    messagesContainer.appendChild(liaMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Función para mostrar typing indicator
function mostrarTyping(mostrar) {
    console.log('⏳ Typing indicator:', mostrar ? 'mostrar' : 'ocultar');
    
    const messagesContainer = document.getElementById('liaMessages');
    if (!messagesContainer) return;
    
    // Buscar indicator existente
    let typingIndicator = document.getElementById('liaTypingIndicator');
    
    if (mostrar && !typingIndicator) {
        typingIndicator = document.createElement('div');
        typingIndicator.id = 'liaTypingIndicator';
        typingIndicator.className = 'lia-message typing';
        typingIndicator.innerHTML = `
            <div class="lia-avatar">
                <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
            </div>
            <div class="message-content">
                <div class="message-text">Lia está escribiendo...</div>
            </div>
        `;
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else if (!mostrar && typingIndicator) {
        typingIndicator.remove();
    }
}

// Función para obtener contexto completo del curso
async function obtenerContextoCompleto(mensaje) {
    console.log('🧠 Generando contexto ENRIQUECIDO...');
    
    try {
        // Obtener datos del curso actual
        const response = await fetch('/api/courses/introduccion-ia/current-module/9562a449-4ade-4d4b-a3e4-b66dddb7e6f0');
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.current_video) {
                // Contexto enriquecido con estructura completa
                const contexto = `CONTEXTO EDUCATIVO COMPLETO:

=== INFORMACIÓN DEL CURSO ===
- Curso: ${data.current_module?.courses?.title || 'Introducción a la Inteligencia Artificial'}
- Descripción del Curso: ${data.current_module?.courses?.description || 'Curso completo de introducción a la IA con aplicaciones prácticas'}
- Instructor: ${data.current_module?.courses?.instructor_name || 'Coach LIA'}
- Nivel: ${data.current_module?.courses?.difficulty_level || 'Intermedio'}
- Duración Total: ${data.current_module?.courses?.estimated_hours || 'Variable'} horas
- Categoría: ${data.current_module?.courses?.category || 'Tecnología'}

=== CONTEXTO DEL MÓDULO ACTUAL ===
- Módulo: ${data.current_module?.title || 'Módulo actual'}
- Descripción: ${data.current_module?.description || 'Descripción no disponible'}

=== VIDEO ACTUAL ===
- Video: ${data.current_video.video_title}
- Descripción: ${data.current_video.description || 'Descripción no disponible'}
- Duración: ${data.current_video.duration_minutes || Math.round(data.current_video.duration_seconds / 60)} minutos
- Resumen: ${data.current_video.summary || 'Sin resumen disponible'}
- Conceptos clave: ${data.current_video.key_concepts?.length || 0} conceptos disponibles

=== TRANSCRIPCIÓN DEL VIDEO (para referencia) ===
${data.current_video.transcript_text?.substring(0, 1500) || 'Sin transcripción disponible'}${data.current_video.transcript_text?.length > 1500 ? '...' : ''}

PREGUNTA DEL USUARIO: ${mensaje}`;
                
                console.log('✅ Contexto ENRIQUECIDO generado');
                return contexto;
            }
        }
    } catch (error) {
        console.warn('⚠️ No se pudo obtener contexto completo:', error.message);
    }
    
    // Fallback a contexto enriquecido básico
    const contextoBasico = `CONTEXTO EDUCATIVO COMPLETO:

=== INFORMACIÓN DEL CURSO ===
- Curso: Introducción a la Inteligencia Artificial
- Descripción del Curso: Curso completo de introducción a la IA con aplicaciones prácticas
- Instructor: Coach LIA
- Nivel: Intermedio

=== VIDEO ACTUAL ===
- Información del video no disponible en este momento

=== PREGUNTA DEL USUARIO ===
${mensaje}`;
    console.log('📝 Usando contexto enriquecido básico');
    return contextoBasico;
}

// Función principal para enviar mensaje
async function enviarMensajeALia(mensaje) {
    console.log('🚀 Enviando mensaje a Lia:', mensaje);
    
    if (!mensaje.trim()) {
        console.warn('⚠️ Mensaje vacío');
        return;
    }
    
    try {
        // Agregar mensaje del usuario
        agregarMensajeUsuario(mensaje);
        
        // Mostrar typing
        mostrarTyping(true);
        
        // Generar contexto completo
        const context = await obtenerContextoCompleto(mensaje);
        
        console.log('📡 Haciendo petición a API...');
        
        const response = await fetch('/api/openai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NTYyYTQ0OS00YWRlLTRkNGItYTNlNC1iNjZkZGRiN2U2ZjAiLCJ1c2VybmFtZSI6ImRldi11c2VyIiwiaWF0IjoxNzM2NDY4NDQzfQ.fake-signature-for-dev-testing-only',
                'X-User-Id': '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0'
            },
            body: JSON.stringify({
                prompt: mensaje,
                context: context
            })
        });
        
        console.log('📊 Respuesta API status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error API: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Respuesta recibida');
        
        // Ocultar typing
        mostrarTyping(false);
        
        // Agregar respuesta de Lia
        agregarMensajeLia(data.response || 'No se pudo generar respuesta');
        
    } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        mostrarTyping(false);
        agregarMensajeLia(`❌ Error: ${error.message}. Por favor intenta de nuevo.`);
    }
}

// Función para configurar eventos del chat
function configurarEventosChat() {
    console.log('🔧 Configurando eventos del chat...');
    
    const elementos = verificarElementosChat();
    
    if (!elementos.sendBtn || !elementos.input) {
        console.error('❌ No se pudieron encontrar elementos del chat');
        return false;
    }
    
    // Remover eventos existentes (por si acaso)
    elementos.sendBtn.replaceWith(elementos.sendBtn.cloneNode(true));
    elementos.input.replaceWith(elementos.input.cloneNode(true));
    
    // Obtener referencias nuevas
    const sendBtn = document.getElementById('sendLiaMessage');
    const input = document.getElementById('liaMessageInput');
    
    // Configurar evento del botón
    sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const mensaje = input.value.trim();
        if (mensaje) {
            input.value = '';
            enviarMensajeALia(mensaje);
        }
    });
    
    // Configurar evento del input (Enter)
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const mensaje = input.value.trim();
            if (mensaje) {
                input.value = '';
                enviarMensajeALia(mensaje);
            }
        }
    });
    
    console.log('✅ Eventos del chat configurados');
    return true;
}

// Función de prueba del chat
function probarChat() {
    console.log('🧪 Probando el chat...');
    enviarMensajeALia('Hola Lia, ¿puedes ayudarme con el curso?');
}

// Inicialización
function inicializarChatFix() {
    console.log('🚀 Inicializando Chat Fix...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const configurado = configurarEventosChat();
                if (configurado) {
                    console.log('✅ Chat Fix inicializado correctamente');
                    // Agregar función global para testing
                    window.probarChat = probarChat;
                    window.enviarMensajeALia = enviarMensajeALia;
                }
            }, 1000); // Esperar 1 segundo para que otros scripts se carguen
        });
    } else {
        setTimeout(() => {
            const configurado = configurarEventosChat();
            if (configurado) {
                console.log('✅ Chat Fix inicializado correctamente');
                window.probarChat = probarChat;
                window.enviarMensajeALia = enviarMensajeALia;
            }
        }, 1000);
    }
}

// Inicializar
inicializarChatFix();

console.log('📝 Para probar el chat manualmente, ejecuta: probarChat()');