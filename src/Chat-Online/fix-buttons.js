// =====================================================
// FIX BUTTONS - SCRIPT DE CORRECCIÓN PARA BOTONES DEL PANEL DERECHO
// =====================================================

/**
 * Script de emergencia para arreglar los botones del panel derecho
 * que no funcionan correctamente en chat-online.html
 */

console.log('🔧 [FIX-BUTTONS] Iniciando script de corrección...');

// Función principal para arreglar todos los botones
function fixRightPanelButtons() {
    console.log('🔧 [FIX-BUTTONS] Arreglando botones del panel derecho...');

    // ===== BOTONES DE LIA =====
    fixLiaButtons();
    
    // ===== BOTONES DE NOTAS =====
    fixNotesButtons();
    
    // ===== BOTONES DE COLAPSO =====
    fixCollapseButtons();
    
    // ===== OTROS BOTONES =====
    fixOtherButtons();

    // ===== BOTONES DE COMUNIDAD =====
    fixCommunityButtons();

    console.log('✅ [FIX-BUTTONS] Corrección completada');
}

// Arreglar botones de LIA
function fixLiaButtons() {
    console.log('💬 [FIX-BUTTONS] Arreglando botones de LIA...');

    // Botón Nuevo Chat
    const newChatBtn = document.getElementById('newChatBtn');
    if (newChatBtn) {
        // Remover listeners existentes
        const newBtn = newChatBtn.cloneNode(true);
        newChatBtn.parentNode.replaceChild(newBtn, newChatBtn);
        
        // Agregar nuevo listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🆕 [FIX-BUTTONS] Nuevo chat con LIA');
            startNewLiaChat();
        });
        console.log('✅ [FIX-BUTTONS] newChatBtn arreglado');
    } else {
        console.warn('⚠️ [FIX-BUTTONS] newChatBtn no encontrado');
    }

    // Botón Colapsar LIA
    const collapseLiaBtn = document.getElementById('collapseLiaBtn');
    if (collapseLiaBtn) {
        // Remover listeners existentes
        const newBtn = collapseLiaBtn.cloneNode(true);
        collapseLiaBtn.parentNode.replaceChild(newBtn, collapseLiaBtn);
        
        // Agregar nuevo listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📦 [FIX-BUTTONS] Colapsando LIA');
            toggleLiaSection();
        });
        console.log('✅ [FIX-BUTTONS] collapseLiaBtn arreglado');
    } else {
        console.warn('⚠️ [FIX-BUTTONS] collapseLiaBtn no encontrado');
    }

    // Botón Enviar Mensaje
    const sendLiaMessage = document.getElementById('sendLiaMessage');
    const liaMessageInput = document.getElementById('liaMessageInput');
    
    if (sendLiaMessage) {
        // Remover listeners existentes
        const newBtn = sendLiaMessage.cloneNode(true);
        sendLiaMessage.parentNode.replaceChild(newBtn, sendLiaMessage);
        
        // Agregar nuevo listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📤 [FIX-BUTTONS] Enviando mensaje a LIA');
            sendMessageToLia();
        });
        console.log('✅ [FIX-BUTTONS] sendLiaMessage arreglado');
    }

    // Input de LIA - Enter para enviar
    if (liaMessageInput) {
        liaMessageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('⌨️ [FIX-BUTTONS] Enter en input de LIA');
                sendMessageToLia();
            }
        });
        console.log('✅ [FIX-BUTTONS] liaMessageInput listener agregado');
    }
}

// Arreglar botones de notas
function fixNotesButtons() {
    console.log('📝 [FIX-BUTTONS] Arreglando botones de notas...');

    // Botón Agregar Nota
    const addNoteBtn = document.getElementById('addNoteBtn');
    if (addNoteBtn) {
        // Remover listeners existentes
        const newBtn = addNoteBtn.cloneNode(true);
        addNoteBtn.parentNode.replaceChild(newBtn, addNoteBtn);
        
        // Agregar nuevo listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('➕ [FIX-BUTTONS] Agregar nueva nota');
            showNotesCreator();
        });
        console.log('✅ [FIX-BUTTONS] addNoteBtn arreglado');
    } else {
        console.warn('⚠️ [FIX-BUTTONS] addNoteBtn no encontrado');
    }

    // Botón Buscar Notas
    const searchNotesBtn = document.getElementById('searchNotesBtn');
    if (searchNotesBtn) {
        // Remover listeners existentes
        const newBtn = searchNotesBtn.cloneNode(true);
        searchNotesBtn.parentNode.replaceChild(newBtn, searchNotesBtn);
        
        // Agregar nuevo listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔍 [FIX-BUTTONS] Buscar notas');
            toggleNotesSearch();
        });
        console.log('✅ [FIX-BUTTONS] searchNotesBtn arreglado');
    } else {
        console.warn('⚠️ [FIX-BUTTONS] searchNotesBtn no encontrado');
    }

    // Botón Colapsar Notas
    const collapseNotes = document.getElementById('collapseNotes');
    if (collapseNotes) {
        // Remover listeners existentes
        const newBtn = collapseNotes.cloneNode(true);
        collapseNotes.parentNode.replaceChild(newBtn, collapseNotes);
        
        // Agregar nuevo listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📦 [FIX-BUTTONS] Colapsar sección de notas');
            toggleNotesSection();
        });
        console.log('✅ [FIX-BUTTONS] collapseNotes arreglado');
    } else {
        console.warn('⚠️ [FIX-BUTTONS] collapseNotes no encontrado');
    }

    // Botones del editor de notas
    fixNotesEditorButtons();
}

// Arreglar botones del editor de notas
function fixNotesEditorButtons() {
    console.log('✏️ [FIX-BUTTONS] Arreglando botones del editor...');

    // Botón Guardar Nota
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    if (saveNoteBtn) {
        const newBtn = saveNoteBtn.cloneNode(true);
        saveNoteBtn.parentNode.replaceChild(newBtn, saveNoteBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('💾 [FIX-BUTTONS] Guardar nota');
            saveCurrentNote();
        });
        console.log('✅ [FIX-BUTTONS] saveNoteBtn arreglado');
    }

    // Botón Exportar PDF
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        const newBtn = exportPdfBtn.cloneNode(true);
        exportPdfBtn.parentNode.replaceChild(newBtn, exportPdfBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📄 [FIX-BUTTONS] Exportar a PDF');
            exportNoteToPDF();
        });
        console.log('✅ [FIX-BUTTONS] exportPdfBtn arreglado');
    }

    // Botón Cancelar
    const cancelNoteBtn = document.getElementById('cancelNoteBtn');
    if (cancelNoteBtn) {
        const newBtn = cancelNoteBtn.cloneNode(true);
        cancelNoteBtn.parentNode.replaceChild(newBtn, cancelNoteBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('❌ [FIX-BUTTONS] Cancelar edición');
            hideNotesCreator();
        });
        console.log('✅ [FIX-BUTTONS] cancelNoteBtn arreglado');
    }
}

// Arreglar botones de colapso
function fixCollapseButtons() {
    console.log('📦 [FIX-BUTTONS] Arreglando botones de colapso...');

    // Botón Colapsar Materiales
    const collapseMaterialsBtn = document.getElementById('collapseMaterialsBtn');
    if (collapseMaterialsBtn) {
        const newBtn = collapseMaterialsBtn.cloneNode(true);
        collapseMaterialsBtn.parentNode.replaceChild(newBtn, collapseMaterialsBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📚 [FIX-BUTTONS] Colapsar materiales');
            toggleMaterialsSection();
        });
        console.log('✅ [FIX-BUTTONS] collapseMaterialsBtn arreglado');
    }
}

// Arreglar otros botones
function fixOtherButtons() {
    console.log('🔧 [FIX-BUTTONS] Arreglando otros botones...');

    // Cualquier otro botón que necesite arreglo...
}

// =====================================================
// FUNCIONES DE FUNCIONALIDAD
// =====================================================

// ===== ARREGLO DE BOTONES DE COMUNIDAD =====
function fixCommunityButtons() {
    console.log('🔧 Arreglando botones de comunidad...');
    
    // Arreglar botón "Hacer Pregunta"
    const askQuestionBtn = document.getElementById('askQuestionBtn');
    if (askQuestionBtn) {
        // Crear nuevo botón con evento limpio
        const newAskBtn = askQuestionBtn.cloneNode(true);
        newAskBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔘 Botón "Hacer Pregunta" clickeado - nuevo event listener');
            showQuestionModal();
        });
        askQuestionBtn.parentNode.replaceChild(newAskBtn, askQuestionBtn);
        console.log('✅ Botón "Hacer Pregunta" arreglado');
    }

    // Arreglar botón "Enviar Pregunta"
    const submitQuestionBtn = document.getElementById('submitQuestionBtn');
    if (submitQuestionBtn) {
        const newSubmitBtn = submitQuestionBtn.cloneNode(true);
        newSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔘 Botón "Enviar Pregunta" clickeado - nuevo event listener');
            submitQuestion();
        });
        submitQuestionBtn.parentNode.replaceChild(newSubmitBtn, submitQuestionBtn);
        console.log('✅ Botón "Enviar Pregunta" arreglado');
    }

    // Arreglar botón "Cerrar Modal"
    const closeQuestionModal = document.getElementById('closeQuestionModal');
    if (closeQuestionModal) {
        const newCloseBtn = closeQuestionModal.cloneNode(true);
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔘 Botón "Cerrar Modal" clickeado - nuevo event listener');
            closeQuestionModalFunc();
        });
        closeQuestionModal.parentNode.replaceChild(newCloseBtn, closeQuestionModal);
        console.log('✅ Botón "Cerrar Modal" arreglado');
    }

    // Arreglar botón "Cancelar" en modal
    const cancelQuestionBtn = document.getElementById('cancelQuestionBtn');
    if (cancelQuestionBtn) {
        const newCancelBtn = cancelQuestionBtn.cloneNode(true);
        newCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔘 Botón "Cancelar" clickeado - nuevo event listener');
            closeQuestionModalFunc();
        });
        cancelQuestionBtn.parentNode.replaceChild(newCancelBtn, cancelQuestionBtn);
        console.log('✅ Botón "Cancelar" arreglado');
    }
}

// Función para mostrar modal de pregunta preservando la funcionalidad de BD
function showQuestionModal() {
    console.log('📝 Mostrando modal de pregunta...');
    const modal = document.getElementById('questionModal');
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal) {
        modal.style.display = 'block';
        if (overlay) {
            overlay.style.display = 'block';
        }
        
        // Limpiar formulario
        const titleInput = document.getElementById('questionTitle');
        const contentInput = document.getElementById('questionContent');
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';
        
        // Focus en el primer campo
        setTimeout(() => {
            if (titleInput) titleInput.focus();
        }, 100);
        
        console.log('✅ Modal de pregunta mostrado');
    } else {
        console.error('❌ No se encontró el modal de pregunta');
    }
}

// Función para cerrar modal preservando la funcionalidad
function closeQuestionModalFunc() {
    console.log('❌ Cerrando modal de pregunta...');
    const modal = document.getElementById('questionModal');
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal) {
        modal.style.display = 'none';
        if (overlay) {
            overlay.style.display = 'none';
        }
        console.log('✅ Modal cerrado');
    }
}

// Función para obtener usuario actual
function obtenerUsuarioActual() {
    try {
        // Intentar obtener desde userData (primary)
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            console.log('👤 Usuario desde userData:', parsed);
            return parsed;
        }
        
        // Intentar obtener desde currentUser (compatibility)
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const parsed = JSON.parse(currentUser);
            console.log('👤 Usuario desde currentUser:', parsed);
            return parsed;
        }
        
        // Intentar obtener desde Supabase Auth
        if (window.supabase && window.supabase.auth) {
            const session = window.supabase.auth.getSession();
            if (session?.data?.session?.user) {
                console.log('👤 Usuario desde Supabase:', session.data.session.user);
                return session.data.session.user;
            }
        }
        
        // Si no hay usuario autenticado, generar ID temporal
        console.warn('⚠️ No hay usuario autenticado, usando ID temporal');
        return {
            id: `temp_user_${Date.now()}`,
            email: 'usuario@temporal.com',
            name: 'Usuario Temporal'
        };
        
    } catch (error) {
        console.error('❌ Error obteniendo usuario actual:', error);
        return {
            id: `error_user_${Date.now()}`,
            email: 'error@usuario.com',
            name: 'Usuario Error'
        };
    }
}

// Función para obtener curso actual
function getCurrentCourseId() {
    // Intentar obtener desde variables globales
    if (window.chatOnline && window.chatOnline.getCurrentCourseId) {
        return window.chatOnline.getCurrentCourseId();
    }
    
    // Fallback a valores por defecto o detectar desde URL/contexto
    return '550e8400-e29b-41d4-a716-446655440001';
}

// Función para obtener módulo actual
function getCurrentModuleId() {
    // Intentar obtener desde variables globales
    if (window.chatOnline && window.chatOnline.getCurrentModuleId) {
        return window.chatOnline.getCurrentModuleId();
    }
    
    // Fallback a módulo por defecto
    return 'module-1';
}

// Función para recargar preguntas directamente (patrón de transcripciones/resúmenes)
async function refreshQuestionsDirectly() {
    try {
        console.log('📋 Obteniendo preguntas directamente de la API...');
        
        // Usar la misma API que usa loadCommunityQuestions
        if (!window.communityAPI) {
            console.error('❌ communityAPI no está disponible');
            return;
        }
        
        // Obtener preguntas con el mismo patrón de la función original
        const response = await window.communityAPI.getQuestions({
            filter: 'all',
            sort: 'recent'
        });
        
        console.log('📋 Respuesta de la API:', response);
        
        if (response && response.data && Array.isArray(response.data)) {
            const questions = response.data;
            console.log(`✅ ${questions.length} preguntas obtenidas directamente`);
            
            // Renderizar directamente en el DOM (patrón de transcripciones/resúmenes)
            renderQuestionsDirectly(questions);
        } else if (response && Array.isArray(response)) {
            // Algunas APIs devuelven directamente el array
            const questions = response;
            console.log(`✅ ${questions.length} preguntas obtenidas directamente (array directo)`);
            renderQuestionsDirectly(questions);
        } else {
            console.warn('⚠️ Respuesta de API inesperada:', response);
            
            // Fallback: intentar usar las funciones existentes
            if (window.chatOnline && typeof window.chatOnline.loadCommunityQuestions === 'function') {
                window.chatOnline.communityQuestionsLoaded = false;
                window.chatOnline.loadingQuestions = false;
                await window.chatOnline.loadCommunityQuestions('direct-refresh-fallback');
            }
        }
        
    } catch (error) {
        console.error('❌ Error recargando preguntas directamente:', error);
        
        // Fallback final
        if (window.chatOnline && typeof window.chatOnline.loadCommunityQuestions === 'function') {
            try {
                window.chatOnline.communityQuestionsLoaded = false;
                window.chatOnline.loadingQuestions = false;
                await window.chatOnline.loadCommunityQuestions('direct-refresh-error-fallback');
                console.log('✅ Fallback exitoso');
            } catch (fallbackError) {
                console.error('❌ Fallback también falló:', fallbackError);
            }
        }
    }
}

// Función para renderizar preguntas directamente en el DOM
function renderQuestionsDirectly(questions) {
    console.log('🎨 Renderizando preguntas directamente en DOM...');
    
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) {
        console.error('❌ Lista de preguntas no encontrada');
        return;
    }
    
    // Limpiar completamente el contenedor (patrón de transcripciones)
    questionsList.innerHTML = '';
    
    if (!questions || questions.length === 0) {
        questionsList.innerHTML = `
            <div class="empty-questions">
                <div class="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <h3>No hay preguntas aún</h3>
                <p>Sé el primero en hacer una pregunta sobre este módulo</p>
                <button class="btn-primary" onclick="showQuestionModal()">
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Hacer Primera Pregunta
                </button>
            </div>
        `;
        return;
    }
    
    // Generar HTML para cada pregunta (usar función existente si está disponible)
    let questionsHTML = '';
    
    if (window.chatOnline && typeof window.chatOnline.createQuestionHTML === 'function') {
        // Usar la función existente del sistema
        questionsHTML = questions.map(question => window.chatOnline.createQuestionHTML(question)).join('');
    } else {
        // Fallback: generar HTML básico
        questionsHTML = questions.map(question => createBasicQuestionHTML(question)).join('');
    }
    
    // Actualizar DOM directamente (patrón de transcripciones/resúmenes)
    questionsList.innerHTML = questionsHTML;
    
    // Reconfigurar event listeners si la función existe
    if (window.chatOnline && typeof window.chatOnline.setupQuestionEventListeners === 'function') {
        window.chatOnline.setupQuestionEventListeners();
    }
    
    console.log('✅ Preguntas renderizadas directamente en DOM');
}

// Función básica para generar HTML de pregunta (fallback)
function createBasicQuestionHTML(question) {
    const timeAgo = getTimeAgo(question.created_at);
    const userName = question.users?.name || question.users?.email || 'Usuario';
    
    return `
        <div class="question-card" data-question-id="${question.id}">
            <div class="question-header">
                <div class="question-user">
                    <div class="user-avatar">
                        <span>${userName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="user-info">
                        <span class="user-name">${userName}</span>
                        <span class="question-time">${timeAgo}</span>
                    </div>
                </div>
            </div>
            
            <div class="question-content">
                <h3 class="question-title">${question.title}</h3>
                <p class="question-text">${question.content}</p>
            </div>
            
            <div class="question-actions">
                <button class="action-btn vote-btn" data-question-id="${question.id}">
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="7,10 12,5 17,10"/>
                    </svg>
                    <span>${question.vote_count || 0}</span>
                </button>
                <button class="action-btn answer-btn" data-question-id="${question.id}">
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3h18v18l-3-3H3V3z"/>
                    </svg>
                    Responder
                </button>
            </div>
        </div>
    `;
}

// Función auxiliar para tiempo transcurrido
function getTimeAgo(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'ahora';
        if (diffMins < 60) return `hace ${diffMins}m`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `hace ${diffHours}h`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `hace ${diffDays}d`;
    } catch (error) {
        return 'hace poco';
    }
}

// Función para enviar pregunta preservando la conexión a BD
async function submitQuestion() {
    console.log('📤 Enviando pregunta...');
    
    const titleInput = document.getElementById('questionTitle');
    const contentInput = document.getElementById('questionContent');
    
    if (!titleInput || !contentInput) {
        console.error('❌ No se encontraron los campos del formulario');
        return;
    }
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('Por favor, completa todos los campos');
        return;
    }
    
    // Obtener usuario actual
    const currentUser = obtenerUsuarioActual();
    if (!currentUser || !currentUser.id) {
        alert('Error: No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
        return;
    }
    
    // Obtener datos del curso y módulo
    const currentCourseId = getCurrentCourseId();
    const currentModuleId = getCurrentModuleId();
    
    console.log('👤 Usuario actual:', currentUser);
    console.log('📚 Curso actual:', currentCourseId);
    console.log('📖 Módulo actual:', currentModuleId);
    
    try {
        // Usar la API de comunidad existente si está disponible
        if (window.communityAPI) {
            console.log('🔗 Usando communityAPI para enviar pregunta...');
            
            // Asegurar que communityAPI tenga configurado el usuario
            window.communityAPI.setUserId(currentUser.id);
            
            const questionData = {
                title: title,
                content: content,
                user_id: currentUser.id,
                course_id: currentCourseId,
                module_id: currentModuleId,
                tags: [] // Tags vacíos por defecto
            };
            
            console.log('📝 Datos de la pregunta:', questionData);
            
            const response = await window.communityAPI.createQuestion(questionData);
            
            if (response && response.success !== false) {
                console.log('✅ Pregunta enviada exitosamente');
                closeQuestionModalFunc();
                
                // Mostrar mensaje de éxito
                alert('¡Pregunta enviada exitosamente!');
                
                // Recargar preguntas inmediatamente
                console.log('🔄 Recargando preguntas después de envío exitoso...');
                
                // Esperar un momento para sincronización de BD
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Recargar preguntas usando el patrón directo de actualización DOM
                console.log('🔄 Recargando preguntas con patrón directo...');
                await refreshQuestionsDirectly();
            } else {
                throw new Error(response?.error || 'Error al enviar pregunta');
            }
        } else if (window.chatOnline && typeof window.chatOnline.submitQuestion === 'function') {
            // Fallback a la función original
            console.log('🔗 Usando función original submitQuestion...');
            await window.chatOnline.submitQuestion();
        } else {
            throw new Error('No se encontró método para enviar pregunta');
        }
    } catch (error) {
        console.error('❌ Error al enviar pregunta:', error);
        alert('Error al enviar pregunta: ' + error.message);
    }
}

// Función para generar respuestas inteligentes de LIA
function generarRespuestaInteligente(mensaje) {
    const mensajeLower = mensaje.toLowerCase();
    
    // Metáfora del fuego aplicada a la IA
    if (mensajeLower.includes('fuego') && (mensajeLower.includes('ia') || mensajeLower.includes('inteligencia artificial'))) {
        return `🔥 **La Metáfora del Fuego y la IA** 🔥

Excelente pregunta. La metáfora del fuego es muy poderosa para entender la IA:

**1. El Fuego como Herramienta Transformadora:**
• Como el fuego, la IA puede ser una herramienta increíblemente poderosa que transforma todo lo que toca
• Puede cocinar alimentos (automatizar procesos), proporcionar calor (eficiencia), e iluminar la oscuridad (insights)

**2. Control y Responsabilidad:**
• El fuego controlado es útil (chimenea, cocina), pero descontrolado es destructivo
• La IA debe desarrollarse con ética y supervisión humana

**3. Evolución Progresiva:**
• Como el fuego pasó de antorchas a motores, la IA evoluciona de algoritmos simples a sistemas complejos
• Cada "combustible" nuevo (datos, compute) hace que la llama sea más brillante

**4. Democratización:**
• Así como el fuego se extendió por la humanidad, la IA debe ser accesible, no solo para unos pocos

La clave está en ser "guardianes del fuego" - usar la IA para iluminar y calentar, no para quemar. 🤖✨

¿Te gustaría explorar algún aspecto específico de esta metáfora?`;
    }
    
    // Respuestas sobre IA en general
    if (mensajeLower.includes('ia') || mensajeLower.includes('inteligencia artificial')) {
        return `🤖 **Sobre Inteligencia Artificial**

La IA es el campo de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana.

**Aspectos clave:**
• **Machine Learning**: Sistemas que aprenden de datos
• **Deep Learning**: Redes neuronales profundas
• **Procesamiento de Lenguaje Natural**: Como esta conversación
• **Visión Computacional**: Análisis de imágenes
• **Automatización Inteligente**: Decisiones autónomas

¿Hay algún aspecto específico que te interese explorar más? 🧠✨`;
    }
    
    // Respuestas sobre machine learning
    if (mensajeLower.includes('machine learning') || mensajeLower.includes('aprendizaje')) {
        return `📚 **Machine Learning**

Es la capacidad de las máquinas de aprender y mejorar automáticamente a través de la experiencia.

**Tipos principales:**
• **Supervisado**: Aprendizaje con ejemplos etiquetados
• **No supervisado**: Descubrimiento de patrones ocultos  
• **Por refuerzo**: Aprendizaje por recompensas/castigos

**Proceso típico:**
1. Recolección de datos
2. Preprocesamiento
3. Entrenamiento del modelo
4. Evaluación y mejora

¿Te gustaría ver un ejemplo práctico de algún tipo? 🎯`;
    }
    
    // Respuestas sobre redes neuronales
    if (mensajeLower.includes('redes neuronales') || mensajeLower.includes('neuronal')) {
        return `🧠 **Redes Neuronales**

Sistemas inspirados en el cerebro humano, compuestos por neuronas artificiales interconectadas.

**Componentes:**
• **Neuronas**: Procesan información
• **Capas**: Entrada, ocultas, salida
• **Pesos**: Conexiones entre neuronas
• **Funciones de activación**: Determinan si una neurona se "activa"

**Tipos comunes:**
• **Perceptrón**: La más simple
• **Feedforward**: Información fluye en una dirección
• **Recurrentes**: Para secuencias de datos
• **Convolucionales**: Ideales para imágenes

¿Quieres que profundice en algún tipo específico? 🔗`;
    }
    
    // Respuestas sobre aplicaciones
    if (mensajeLower.includes('aplicaciones') || mensajeLower.includes('ejemplos')) {
        return `🚀 **Aplicaciones de la IA**

La IA está transformando múltiples sectores:

**Salud:**
• Diagnóstico médico por imágenes
• Descubrimiento de medicamentos
• Cirugía asistida

**Tecnología:**
• Asistentes virtuales (Siri, Alexa)
• Recomendaciones (Netflix, Spotify)
• Traducción automática

**Transporte:**
• Vehículos autónomos
• Optimización de rutas
• Mantenimiento predictivo

**Finanzas:**
• Detección de fraude
• Trading algorítmico
• Análisis de riesgo

¿Te interesa algún sector en particular? 💼`;
    }
    
    // Respuesta genérica inteligente
    return `🤖 Interesante pregunta sobre "${mensaje}". 

Como tu tutora LIA, puedo ayudarte con:
• **Conceptos fundamentales de IA**
• **Machine Learning y Deep Learning**
• **Aplicaciones prácticas de IA**
• **Redes neuronales y algoritmos**
• **Casos de estudio reales**
• **Ejercicios y ejemplos**

¿Podrías ser más específico sobre qué aspecto de la IA te gustaría explorar? Así podré darte una respuesta más detallada y útil. 

¡Estoy aquí para hacer tu aprendizaje en IA más claro y emocionante! ✨`;
}

function startNewLiaChat() {
    const messagesContainer = document.getElementById('liaMessages');
    const input = document.getElementById('liaMessageInput');
    
    if (messagesContainer) {
        // Limpiar mensajes y mostrar mensaje inicial
        messagesContainer.innerHTML = `
            <div class="lia-message">
                <div class="lia-avatar">
                    <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
                </div>
                <div class="message-content">
                    <div class="message-text">
                        ¡Hola! Soy LIA, tu tutora personalizada. ¿En qué puedo ayudarte hoy? 🤖✨
                    </div>
                    <div class="message-time">ahora</div>
                </div>
            </div>
        `;
        console.log('✅ Nuevo chat iniciado');
    }
    
    if (input) {
        input.value = '';
        input.focus();
    }
}

function toggleLiaSection() {
    const liaChat = document.querySelector('.lia-chat');
    const liaSection = document.querySelector('.lia-assistant-section');
    const collapseBtn = document.getElementById('collapseLiaBtn');
    
    if (liaChat && liaSection && collapseBtn) {
        const isCollapsed = liaChat.style.display === 'none' || liaChat.style.visibility === 'hidden';
        
        if (isCollapsed) {
            // Expandir
            liaChat.style.display = 'flex';
            liaChat.style.visibility = 'visible';
            liaChat.style.opacity = '1';
            collapseBtn.title = 'Colapsar Chat';
            console.log('📖 LIA expandido');
        } else {
            // Colapsar
            liaChat.style.display = 'none';
            liaChat.style.visibility = 'hidden';
            liaChat.style.opacity = '0';
            collapseBtn.title = 'Expandir Chat';
            console.log('📦 LIA colapsado');
        }
    }
}

function sendMessageToLia() {
    const input = document.getElementById('liaMessageInput');
    const messagesContainer = document.getElementById('liaMessages');
    
    if (!input || !messagesContainer) {
        console.error('❌ Elementos de chat no encontrados');
        return;
    }
    
    const mensaje = input.value.trim();
    if (!mensaje) {
        console.warn('⚠️ Mensaje vacío');
        return;
    }

    console.log('💬 Enviando mensaje a LIA:', mensaje);

    // Agregar mensaje del usuario
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `
        <div class="message-content">
            <div class="message-text">${mensaje}</div>
            <div class="message-time">ahora</div>
        </div>
        <div class="user-avatar">
            <span>👤</span>
        </div>
    `;
    
    messagesContainer.appendChild(userMessage);
    
    // Limpiar input
    input.value = '';
    
    // Intentar usar el sistema original de LIA si está disponible
    if (window.chatOnline && typeof window.chatOnline.sendLiaMessage === 'function') {
        console.log('🤖 Usando sistema original de LIA');
        // No agregar mensaje duplicado del usuario ya que el sistema original lo hace
        // Restaurar el input para que el sistema original lo procese
        input.value = mensaje;
        window.chatOnline.sendLiaMessage();
        return;
    }
    
    // Fallback: Generar respuesta inteligente basada en el mensaje
    setTimeout(() => {
        const respuesta = generarRespuestaInteligente(mensaje);
        const liaMessage = document.createElement('div');
        liaMessage.className = 'lia-message';
        liaMessage.innerHTML = `
            <div class="lia-avatar">
                <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
            </div>
            <div class="message-content">
                <div class="message-text">${respuesta}</div>
                <div class="message-time">ahora</div>
            </div>
        `;
        
        messagesContainer.appendChild(liaMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1500);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showNotesCreator() {
    const notesCreator = document.getElementById('notesCreatorSection');
    const titleInput = document.getElementById('noteTitleInput');
    
    if (notesCreator) {
        notesCreator.style.display = 'block';
        notesCreator.classList.add('active');
        console.log('📝 Editor de notas abierto');
        
        // Enfocar el campo de título
        setTimeout(() => {
            if (titleInput) {
                titleInput.focus();
            }
        }, 100);
    } else {
        console.error('❌ Editor de notas no encontrado');
    }
}

function hideNotesCreator() {
    const notesCreator = document.getElementById('notesCreatorSection');
    const titleInput = document.getElementById('noteTitleInput');
    const contentEditor = document.getElementById('noteContentEditor');
    
    if (notesCreator) {
        notesCreator.style.display = 'none';
        notesCreator.classList.remove('active');
        console.log('❌ Editor de notas cerrado');
        
        // Limpiar campos
        if (titleInput) titleInput.value = '';
        if (contentEditor) contentEditor.textContent = '';
    }
}

function saveCurrentNote() {
    const titleInput = document.getElementById('noteTitleInput');
    const contentEditor = document.getElementById('noteContentEditor');
    
    if (!titleInput || !contentEditor) {
        console.error('❌ Campos de nota no encontrados');
        return;
    }

    const title = titleInput.value.trim();
    const content = contentEditor.textContent.trim();
    
    if (!title || !content) {
        alert('Por favor completa el título y contenido de la nota');
        return;
    }

    const note = {
        id: Date.now(),
        title: title,
        content: content,
        timestamp: new Date().toISOString(),
        module: 'Módulo Actual'
    };

    // Guardar en localStorage
    const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
    notes.unshift(note);
    localStorage.setItem('lia_notes', JSON.stringify(notes));

    console.log('💾 Nota guardada:', note);
    
    // Mostrar en la lista
    displayNoteInList(note);
    
    // Cerrar editor
    hideNotesCreator();
    
    // Notificación
    showNotification('✅ Nota guardada correctamente', 'success');
}

function displayNoteInList(note) {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;

    // Si hay un mensaje de "sin notas", eliminarlo
    const emptyState = notesList.querySelector('.empty-notes');
    if (emptyState) {
        emptyState.remove();
    }

    const noteElement = document.createElement('div');
    noteElement.className = 'note-item';
    noteElement.innerHTML = `
        <div class="note-header">
            <span class="note-title">${note.title}</span>
            <span class="note-time">ahora</span>
        </div>
        <div class="note-content">
            <p>${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
        </div>
        <div class="note-actions">
            <button class="note-delete-btn" onclick="deleteNote(${note.id})" title="Eliminar nota">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </div>
    `;

    notesList.insertBefore(noteElement, notesList.firstChild);
}

function exportNoteToPDF() {
    const titleInput = document.getElementById('noteTitleInput');
    const contentEditor = document.getElementById('noteContentEditor');
    
    if (!titleInput || !contentEditor) {
        console.error('❌ No hay contenido para exportar');
        return;
    }

    const title = titleInput.value.trim() || 'Nota sin título';
    const content = contentEditor.textContent.trim() || 'Sin contenido';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #0066CC; border-bottom: 2px solid #44e5ff; padding-bottom: 10px; }
                .content { margin-top: 20px; }
                .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <div class="content">
                <p>${content}</p>
            </div>
            <div class="footer">
                <p>Generado desde Coach LIA IA - ${new Date().toLocaleDateString()}</p>
            </div>
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('📄 Nota exportada como HTML');
    showNotification('✅ Nota exportada correctamente', 'success');
}

function toggleNotesSearch() {
    console.log('🔍 Toggle búsqueda de notas - Funcionalidad pendiente');
    showNotification('🔍 Función de búsqueda en desarrollo', 'info');
}

function toggleNotesSection() {
    const notesSection = document.querySelector('.notes-section');
    const collapseBtn = document.getElementById('collapseNotes');
    
    if (notesSection && collapseBtn) {
        const isCollapsed = notesSection.classList.contains('collapsed');
        
        if (isCollapsed) {
            notesSection.classList.remove('collapsed');
            collapseBtn.title = 'Colapsar Notas';
            console.log('📖 Sección de notas expandida');
        } else {
            notesSection.classList.add('collapsed');
            collapseBtn.title = 'Expandir Notas';
            console.log('📦 Sección de notas colapsada');
        }
    }
}

function toggleMaterialsSection() {
    const materialsSection = document.querySelector('.course-materials-section');
    const collapseBtn = document.getElementById('collapseMaterialsBtn');
    
    if (materialsSection && collapseBtn) {
        const isCollapsed = materialsSection.classList.contains('collapsed');
        
        if (isCollapsed) {
            materialsSection.classList.remove('collapsed');
            collapseBtn.classList.remove('collapsed');
            collapseBtn.title = 'Colapsar Materiales';
            console.log('📖 Sección de materiales expandida');
        } else {
            materialsSection.classList.add('collapsed');
            collapseBtn.classList.add('collapsed');
            collapseBtn.title = 'Expandir Materiales';
            console.log('📦 Sección de materiales colapsada');
        }
    }
}

// Función para eliminar notas (global)
function deleteNote(noteId) {
    console.log('🗑️ Eliminando nota:', noteId);
    
    let notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
    notes = notes.filter(note => note.id !== noteId);
    localStorage.setItem('lia_notes', JSON.stringify(notes));
    
    // Remover de la UI
    const noteElement = document.querySelector(`[onclick="deleteNote(${noteId})"]`)?.closest('.note-item');
    if (noteElement) {
        noteElement.remove();
    }
    
    // Verificar si no quedan notas
    const notesList = document.getElementById('notesList');
    if (notesList && notesList.children.length === 0) {
        notesList.innerHTML = '<div class="empty-notes"><p>No hay notas aún. ¡Agrega tu primera nota!</p></div>';
    }
    
    showNotification('🗑️ Nota eliminada', 'info');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Colores según el tipo
    switch(type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        case 'warning':
            notification.style.background = '#f59e0b';
            break;
        default:
            notification.style.background = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

// Exponer funciones globalmente
window.deleteNote = deleteNote;
window.showNotification = showNotification;
window.startNewLiaChat = startNewLiaChat;
window.toggleLiaSection = toggleLiaSection;
window.sendMessageToLia = sendMessageToLia;
window.showNotesCreator = showNotesCreator;
window.hideNotesCreator = hideNotesCreator;
window.saveCurrentNote = saveCurrentNote;
window.exportNoteToPDF = exportNoteToPDF;
window.showQuestionModal = showQuestionModal;
window.closeQuestionModalFunc = closeQuestionModalFunc;
window.submitQuestion = submitQuestion;

// Función para inicializar cuando el DOM esté listo
function initializeFixButtons() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixRightPanelButtons);
    } else {
        fixRightPanelButtons();
    }
}

// Inicializar múltiples veces para asegurar que funcione
initializeFixButtons();

// También ejecutar después de un delay para asegurar que todos los elementos estén listos
setTimeout(fixRightPanelButtons, 1000);
setTimeout(fixRightPanelButtons, 3000);

console.log('🔧 [FIX-BUTTONS] Script cargado y listo');