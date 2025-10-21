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
            openNotebookLMPanel();
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

    // COMENTADO: El botón #collapseNotes ahora es manejado por el sistema de menús divididos
    // Este botón ahora cierra TODO el menú de notas y vuelve a los botones colapsados
    // NO debe ser manejado por fix-buttons.js
    /*
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
    */
    console.log('ℹ️ [FIX-BUTTONS] collapseNotes omitido - manejado por sistema de menús divididos');

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

            // Mostrar feedback visual de que las preguntas se actualizaron
            showNotification(`🔄 ${questions.length} preguntas actualizadas`, 'info');

        } else if (response && Array.isArray(response)) {
            // Algunas APIs devuelven directamente el array
            const questions = response;
            console.log(`✅ ${questions.length} preguntas obtenidas directamente (array directo)`);
            renderQuestionsDirectly(questions);

            // Mostrar feedback visual
            showNotification(`🔄 ${questions.length} preguntas actualizadas`, 'info');

        } else {
            console.warn('⚠️ Respuesta de API inesperada:', response);

            // Fallback: intentar usar las funciones existentes
            if (window.chatOnline && typeof window.chatOnline.loadCommunityQuestions === 'function') {
                console.log('🔄 Intentando fallback con loadCommunityQuestions...');
                window.chatOnline.communityQuestionsLoaded = false;
                window.chatOnline.loadingQuestions = false;
                await window.chatOnline.loadCommunityQuestions('direct-refresh-fallback');
                showNotification('🔄 Preguntas actualizadas (fallback)', 'info');
            }
        }

    } catch (error) {
        console.error('❌ Error recargando preguntas directamente:', error);

        // Fallback final
        if (window.chatOnline && typeof window.chatOnline.loadCommunityQuestions === 'function') {
            try {
                console.log('🔄 Usando fallback final...');
                window.chatOnline.communityQuestionsLoaded = false;
                window.chatOnline.loadingQuestions = false;
                await window.chatOnline.loadCommunityQuestions('direct-refresh-error-fallback');
                console.log('✅ Fallback exitoso');
                showNotification('🔄 Preguntas actualizadas', 'info');
            } catch (fallbackError) {
                console.error('❌ Fallback también falló:', fallbackError);
                showNotification('⚠️ Error actualizando preguntas', 'warning');
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

    // Intentar usar las funciones de renderizado existentes del sistema principal
    let questionsHTML = '';

    if (window.renderQuestionsFromAPI && typeof window.renderQuestionsFromAPI === 'function') {
        // Usar la función principal de renderizado
        console.log('✅ Usando función principal renderQuestionsFromAPI');
        try {
            window.renderQuestionsFromAPI(questions);
            console.log('✅ Preguntas renderizadas con función principal');
            return;
        } catch (error) {
            console.warn('⚠️ Error con renderQuestionsFromAPI, usando fallback:', error);
        }
    }

    if (window.chatOnline && typeof window.chatOnline.createQuestionHTML === 'function') {
        // Usar la función existente del sistema
        console.log('✅ Usando función del sistema chatOnline.createQuestionHTML');
        questionsHTML = questions.map(question => window.chatOnline.createQuestionHTML(question)).join('');
    } else {
        // Fallback: generar HTML básico pero compatible
        console.log('⚠️ Usando fallback createBasicQuestionHTML');
        questionsHTML = questions.map(question => createBasicQuestionHTML(question)).join('');
    }

    // Actualizar DOM directamente (patrón de transcripciones/resúmenes)
    questionsList.innerHTML = questionsHTML;

    // Scroll para mostrar las nuevas preguntas
    const questionsContainer = questionsList.closest('.questions-container, .community-content');
    if (questionsContainer) {
        questionsContainer.scrollTop = 0; // Scroll al top para ver la pregunta recién creada
    }

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
                showNotification('✅ ¡Pregunta enviada exitosamente!', 'success');

                // Recargar preguntas inmediatamente - Sin delay
                console.log('🔄 Recargando preguntas después de envío exitoso...');

                // ESTRATEGIA DE FUERZA BRUTA: Actualización agresiva e inmediata
                console.log('🔄 Iniciando estrategia de fuerza bruta para actualización inmediata...');

                // 1. Forzar limpieza completa de cache y estado
                if (window.chatOnline) {
                    window.chatOnline.communityQuestionsLoaded = false;
                    window.chatOnline.loadingQuestions = false;
                    console.log('🧹 Estado de chatOnline limpiado');
                }

                // 2. Limpiar cualquier cache de communityAPI
                if (window.communityAPI && window.communityAPI.clearCache) {
                    window.communityAPI.clearCache();
                    console.log('🧹 Cache de communityAPI limpiado');
                }

                // 3. Ejecutar múltiples estrategias de forma secuencial para garantizar éxito
                const strategies = [
                    {
                        name: 'Recarga Directa Inmediata',
                        fn: () => refreshQuestionsDirectly()
                    },
                    {
                        name: 'Fuerza Bruta communityAPI',
                        fn: () => forceBruteAPIReload()
                    },
                    {
                        name: 'loadCommunityQuestions Forzado',
                        fn: () => {
                            if (typeof loadCommunityQuestions === 'function') {
                                return loadCommunityQuestions();
                            }
                        }
                    },
                    {
                        name: 'DOM Injection Manual',
                        fn: () => forceManualDOMUpdate()
                    }
                ];

                // Ejecutar estrategias secuencialmente hasta que una funcione
                for (const strategy of strategies) {
                    try {
                        console.log(`🔄 Ejecutando estrategia: ${strategy.name}`);
                        await strategy.fn();
                        console.log(`✅ Estrategia exitosa: ${strategy.name}`);

                        // Verificar si realmente se actualizó el DOM
                        await new Promise(resolve => setTimeout(resolve, 500));
                        if (await verifyQuestionWasAdded()) {
                            console.log('✅ Pregunta confirmada en DOM - Deteniendo estrategias');
                            break;
                        }
                    } catch (error) {
                        console.warn(`⚠️ Estrategia falló: ${strategy.name}`, error);
                    }
                }

                console.log('✅ Proceso de actualización de preguntas completado');
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
    console.log('🔍 [FIX-BUTTONS] toggleLiaSection() iniciada');
    
    const liaChat = document.querySelector('.lia-chat');
    const liaSection = document.querySelector('.lia-assistant-section');
    const notesSection = document.querySelector('.notes-section');
    const collapseBtn = document.getElementById('collapseLiaBtn');
    
    console.log('🔍 [FIX-BUTTONS] Elementos encontrados:', {
        liaChat: !!liaChat,
        liaSection: !!liaSection,
        notesSection: !!notesSection,
        collapseBtn: !!collapseBtn
    });
    
    if (!liaChat || !liaSection || !notesSection || !collapseBtn) {
        console.error('❌ [FIX-BUTTONS] Elementos no encontrados');
        return;
    }
    
    const icon = collapseBtn.querySelector('svg');
    console.log('🔍 [FIX-BUTTONS] Icono encontrado:', !!icon);
    
    // Verificar estado actual usando clases CSS
    const isCollapsed = liaSection.classList.contains('lia-collapsed');
    console.log('🔍 [FIX-BUTTONS] Estado actual:', {
        isCollapsed: isCollapsed,
        liaSectionClasses: liaSection.className,
        notesSectionClasses: notesSection.className
    });
    
    if (isCollapsed) {
        console.log('📤 [FIX-BUTTONS] Expandir LIA...');
        
        // Expandir - Transición suave
        liaChat.style.opacity = '1';
        liaChat.style.visibility = 'visible';
        liaChat.style.display = 'flex';
        
        // Remover clases de colapso
        liaSection.classList.remove('lia-collapsed');
        notesSection.classList.remove('notes-expanded');
        
        icon.innerHTML = '<polyline points="6,9 12,15 18,9"/>';
        collapseBtn.title = 'Colapsar Chat';
        console.log('✅ [FIX-BUTTONS] Chat de LIA expandido');
    } else {
        console.log('📦 [FIX-BUTTONS] Colapsar LIA...');
        
        // Colapsar - Transición suave
        // Aplicar clases de colapso
        liaSection.classList.add('lia-collapsed');
        notesSection.classList.add('notes-expanded');
        
        // Luego ocultar el chat con transición
        setTimeout(() => {
            liaChat.style.opacity = '0';
            liaChat.style.visibility = 'hidden';
        }, 100);
        
        setTimeout(() => {
            liaChat.style.display = 'none';
        }, 400);
        
        icon.innerHTML = '<polyline points="6,15 12,9 18,15"/>';
        collapseBtn.title = 'Expandir Chat';
        console.log('✅ [FIX-BUTTONS] Chat de LIA colapsado - Notas expandidas hacia arriba');
    }
    
    console.log('🔍 [FIX-BUTTONS] toggleLiaSection() completada');
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
    // Obtener información del usuario actual
    const currentUser = obtenerUsuarioActual();
    const userName = currentUser?.username || localStorage.getItem('userName') || 'Usuario';
    const userPhoto = currentUser?.profile_picture_url || currentUser?.avatar_url || null;
    
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    
    // Crear avatar con foto del usuario o inicial
    let avatarHTML;
    if (userPhoto) {
        avatarHTML = `<img src="${userPhoto}" alt="${userName}" class="user-avatar-img">`;
    } else {
        const avatarLetter = userName.charAt(0).toUpperCase();
        avatarHTML = `<div class="user-avatar-circle">${avatarLetter}</div>`;
    }
    
    userMessage.innerHTML = `
        <div class="message-content">
            <div class="message-text">${mensaje}</div>
            <div class="message-time">ahora</div>
        </div>
        <div class="user-avatar">
            ${avatarHTML}
        </div>
    `;
    
    messagesContainer.appendChild(userMessage);
    
    // Limpiar input
    input.value = '';
    
    // Usar el sistema OpenAI de LIA (handleChatWithLIA)
    if (typeof handleChatWithLIA === 'function') {
        console.log('🤖 Usando sistema OpenAI de LIA (handleChatWithLIA)');
        handleChatWithLIA(mensaje);
        return;
    } else if (typeof window.handleChatWithLIA === 'function') {
        console.log('🤖 Usando sistema OpenAI de LIA (window.handleChatWithLIA)');
        window.handleChatWithLIA(mensaje);
        return;
    } else {
        console.error('❌ handleChatWithLIA no está disponible');
        // Mostrar mensaje de error en la interfaz
        const errorMessage = document.createElement('div');
        errorMessage.className = 'lia-message error';
        errorMessage.innerHTML = `
            <div class="lia-avatar">
                <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
            </div>
            <div class="message-content">
                <div class="message-text">❌ Lo siento, el sistema de LIA no está disponible en este momento. Por favor, recarga la página.</div>
                <div class="message-time">ahora</div>
            </div>
        `;
        messagesContainer.appendChild(errorMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return;
    }
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Función para abrir el panel de notas estilo NotebookLM
function openNotebookLMPanel() {
    console.log('📝 [FIX-BUTTONS] Abriendo panel de notas NotebookLM...');
    
    // Verificar si el sistema de notas NotebookLM está disponible
    if (typeof initializeNotebookLMNotes === 'function') {
        console.log('✅ [FIX-BUTTONS] Sistema NotebookLM disponible, abriendo panel...');
        
    // Buscar el panel de notas overlay
    const notePanelOverlay = document.getElementById('notePanelOverlay');
    if (notePanelOverlay) {
        // Verificar si el nuevo editor está activo
        const notesCreator = document.getElementById('notesCreatorSection');
        if (notesCreator && notesCreator.style.display !== 'none') {
            console.log('⚠️ [FIX-BUTTONS] El nuevo editor ya está activo, no abriendo overlay');
            return;
        }
        
        // Mostrar panel de notas como overlay
        notePanelOverlay.style.display = 'flex';
            
            // Activar animación
            setTimeout(() => {
                notePanelOverlay.classList.add('active');
            }, 10);
            
            // Configurar para nueva nota
            const noteTitleInput = document.getElementById('noteTitleInput');
            const noteEditor = document.getElementById('noteEditor');
            
            if (noteTitleInput) noteTitleInput.value = 'Nueva nota';
            if (noteEditor) noteEditor.innerHTML = '';
            
            // Enfocar el editor
            setTimeout(() => {
                if (noteEditor) {
                    noteEditor.focus();
                }
            }, 300);
            
            console.log('✅ [FIX-BUTTONS] Panel de notas NotebookLM abierto');
        } else {
            console.error('❌ [FIX-BUTTONS] Panel de notas NotebookLM no encontrado');
            showNotification('❌ Panel de notas no disponible', 'error');
        }
    } else {
        console.error('❌ [FIX-BUTTONS] Sistema de notas NotebookLM no está disponible');
        showNotification('❌ Sistema de notas no disponible', 'error');
    }
}

// Función legacy para compatibilidad (ahora redirige al nuevo sistema)
function showNotesCreator() {
    console.log('📝 [FIX-BUTTONS] showNotesCreator() llamada - redirigiendo a NotebookLM...');
    openNotebookLMPanel();
}

function hideNotesCreator() {
    console.log('❌ [FIX-BUTTONS] hideNotesCreator() llamada - cerrando panel NotebookLM...');
    
    // Buscar el panel de notas overlay
    const notePanelOverlay = document.getElementById('notePanelOverlay');
    if (notePanelOverlay) {
        // Desactivar animación
        notePanelOverlay.classList.remove('active');
        
        // Esperar a que termine la animación y ocultar
        setTimeout(() => {
            notePanelOverlay.style.display = 'none';
            console.log('✅ [FIX-BUTTONS] Panel de notas NotebookLM cerrado');
        }, 300);
    } else {
        console.warn('⚠️ [FIX-BUTTONS] Panel de notas NotebookLM no encontrado para cerrar');
    }
}

function saveCurrentNote() {
    console.log('💾 [FIX-BUTTONS] saveCurrentNote() llamada...');
    
    // Buscar elementos del nuevo sistema
    const titleInput = document.getElementById('noteTitleInput');
    const noteEditor = document.getElementById('noteEditor');
    
    if (!titleInput || !noteEditor) {
        console.error('❌ [FIX-BUTTONS] Campos de nota no encontrados');
        return;
    }

    const title = titleInput.value.trim() || 'Sin título';
    const content = noteEditor.innerHTML || '';
    
    if (!content) {
        alert('Por favor agrega contenido a la nota');
        return;
    }

    const note = {
        id: Date.now().toString(),
        title: title,
        content: content,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Guardar en localStorage
    const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
    notes.push(note);
    localStorage.setItem('lia_notes', JSON.stringify(notes));

    console.log('💾 [FIX-BUTTONS] Nota guardada:', note);
    
    // Cerrar editor
    hideNotesCreator();
    
    // Notificación
    showNotification('✅ Nota guardada correctamente', 'success');
    
    // Actualizar lista de notas si existe la función
    if (typeof updateNotesList === 'function') {
        updateNotesList();
    }
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
    console.log('🔍 Toggle búsqueda de notas');
    
    // Verificar si existe el objeto chatOnline con la función de búsqueda
    if (window.chatOnline && typeof window.chatOnline.searchNotes === 'function') {
        console.log('✅ Usando función de búsqueda de chatOnline');
        window.chatOnline.searchNotes();
    } 
    // Fallback: verificar si existe la función global
    else if (typeof window.searchNotes === 'function') {
        console.log('✅ Usando función global de búsqueda');
        window.searchNotes();
    }
    else {
        console.warn('⚠️ No se encontró la función de búsqueda');
        showNotification('🔍 Sistema de búsqueda no disponible', 'warning');
    }
}

function toggleNotesSection() {
    console.log('🔧 Toggling notes section...');
    
    // Verificar si existe chatOnline con la función de colapsar
    if (window.chatOnline && typeof window.chatOnline.toggleNotesCollapse === 'function') {
        console.log('✅ Usando función de colapsar de chatOnline');
        window.chatOnline.toggleNotesCollapse();
        return;
    }
    
    // Fallback: implementación propia
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
        
        // El CSS se encarga de la animación del icono automáticamente
    } else {
        console.error('❌ No se encontraron elementos para colapsar notas');
        showNotification('❌ Error al colapsar notas', 'error');
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
// FUNCIONES DE FUERZA BRUTA PARA ACTUALIZACIÓN INMEDIATA
// =====================================================

// Función para forzar la recarga de la API sin importar cache o estado
async function forceBruteAPIReload() {
    console.log('🔨 Iniciando recarga de fuerza bruta de la API...');

    if (!window.communityAPI) {
        console.error('❌ communityAPI no disponible para fuerza bruta');
        return;
    }

    try {
        // Forzar una nueva llamada a la API con parámetros únicos para evitar cache
        const timestamp = Date.now();
        const response = await window.communityAPI.getQuestions({
            filter: 'all',
            sort: 'recent',
            _t: timestamp, // Cache buster
            _force: true
        });

        console.log('🔨 Respuesta de fuerza bruta:', response);

        // Procesar respuesta sin importar la estructura
        let questions = null;

        if (response && response.data && Array.isArray(response.data)) {
            questions = response.data;
        } else if (response && Array.isArray(response)) {
            questions = response;
        } else if (response && response.questions) {
            questions = response.questions;
        }

        if (questions && questions.length > 0) {
            console.log(`🔨 ${questions.length} preguntas obtenidas por fuerza bruta`);
            await forceRenderQuestions(questions);
            return true;
        } else {
            console.warn('🔨 Fuerza bruta no obtuvo preguntas válidas');
            return false;
        }

    } catch (error) {
        console.error('❌ Error en fuerza bruta API:', error);
        return false;
    }
}

// Función para forzar el renderizado de preguntas directamente en el DOM
async function forceRenderQuestions(questions) {
    console.log('🔨 Forzando renderizado directo de preguntas...');

    const questionsList = document.getElementById('questionsList');
    if (!questionsList) {
        console.error('❌ No se encontró questionsList para fuerza bruta');
        return;
    }

    // Limpiar completamente
    questionsList.innerHTML = '';

    // Crear HTML directamente sin depender de funciones externas
    const questionsHTML = questions.map(question => {
        const timeAgo = getTimeAgo(question.created_at || question.created_at || new Date().toISOString());
        const userName = question.users?.name || question.users?.email || question.author_name || 'Usuario';
        const userAvatar = question.users?.profile_picture_url || question.users?.avatar_url || '';

        return `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-content">
                    <div class="question-header">
                        <h4 class="question-title">${question.title}</h4>
                        <div class="question-meta">
                            <span class="question-author">
                                ${userAvatar ?
                                    `<img src="${userAvatar}" alt="Usuario" class="author-avatar">` :
                                    `<div class="user-avatar-circle">${userName.charAt(0).toUpperCase()}</div>`
                                }
                                ${userName}
                            </span>
                            <span class="question-time">${timeAgo}</span>
                            <span class="question-module">${question.module_name || 'General'}</span>
                        </div>
                    </div>
                    <div class="question-preview">
                        <p>${question.content.length > 200 ? question.content.substring(0, 200) + '...' : question.content}</p>
                    </div>
                    <div class="question-footer">
                        <div class="question-actions">
                            <div class="question-votes">
                                <button class="vote-btn upvote" type="button" title="Votar positivamente" onclick="voteQuestion('${question.id}', 'up')">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                </button>
                                <span class="vote-count">${question.votes_count || 0}</span>
                                <button class="vote-btn downvote" type="button" title="Votar negativamente" onclick="voteQuestion('${question.id}', 'down')">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                </button>
                            </div>
                            <button class="action-btn answer-btn" title="Responder pregunta" onclick="showAnswerModal('${question.id}', '${question.title}', '${question.content}')">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                            </button>
                            <button class="action-btn bookmark-btn" title="Guardar pregunta" onclick="toggleBookmark('${question.id}')">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="question-stats">
                            <span class="stat-item question-answers clickable" onclick="showQuestionAnswers('${question.id}')" title="Ver respuestas" style="cursor: pointer;">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                ${question.answers_count || 0} respuestas
                            </span>
                            <span class="stat-item">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                ${question.views_count || 0} vistas
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Insertar HTML directamente
    questionsList.innerHTML = questionsHTML;

    // Hacer scroll al top para mostrar la nueva pregunta
    const questionsContainer = questionsList.closest('.questions-container, .community-content');
    if (questionsContainer) {
        questionsContainer.scrollTop = 0;
    }

    console.log('🔨 Preguntas renderizadas por fuerza bruta');
}

// Función para actualizar manualmente el DOM agregando la pregunta sin recargar todo
async function forceManualDOMUpdate() {
    console.log('🔨 Intentando actualización manual del DOM...');

    // Esta función intentará agregar manualmente la pregunta más reciente al DOM
    // sin depender de las funciones de recarga

    try {
        if (!window.communityAPI) {
            console.error('❌ No hay communityAPI para actualización manual');
            return;
        }

        // Obtener solo la pregunta más reciente
        const response = await window.communityAPI.getQuestions({
            filter: 'all',
            sort: 'recent',
            limit: 1
        });

        let latestQuestion = null;
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
            latestQuestion = response.data[0];
        } else if (response && Array.isArray(response) && response.length > 0) {
            latestQuestion = response[0];
        }

        if (latestQuestion) {
            console.log('🔨 Pregunta más reciente encontrada:', latestQuestion);

            // Verificar si ya existe en el DOM
            const existingQuestion = document.querySelector(`[data-question-id="${latestQuestion.id}"]`);
            if (existingQuestion) {
                console.log('🔨 La pregunta ya existe en DOM - actualizando posición');
                // Mover al principio
                const questionsList = document.getElementById('questionsList');
                if (questionsList) {
                    questionsList.insertBefore(existingQuestion, questionsList.firstChild);
                }
                return;
            }

            // Crear y agregar la nueva pregunta al principio
            const questionsList = document.getElementById('questionsList');
            if (questionsList) {
                const questionHTML = createDetailedQuestionHTML(latestQuestion);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = questionHTML;
                const questionElement = tempDiv.firstElementChild;

                // Agregar al principio de la lista
                questionsList.insertBefore(questionElement, questionsList.firstChild);

                // Highlight temporal para mostrar que es nueva
                questionElement.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                setTimeout(() => {
                    questionElement.style.backgroundColor = '';
                }, 2000);

                console.log('🔨 Nueva pregunta agregada manualmente al DOM');
                showNotification('✅ Nueva pregunta agregada', 'success');
            }
        }

    } catch (error) {
        console.error('❌ Error en actualización manual del DOM:', error);
    }
}

// Función auxiliar para crear HTML detallado de una pregunta
function createDetailedQuestionHTML(question) {
    const timeAgo = getTimeAgo(question.created_at || new Date().toISOString());
    const userName = question.users?.name || question.users?.email || question.author_name || 'Usuario';
    const userAvatar = question.users?.profile_picture_url || question.users?.avatar_url || '';

    return `
        <div class="question-item" data-question-id="${question.id}">
            <div class="question-content">
                <div class="question-header">
                    <h4 class="question-title">${question.title}</h4>
                    <div class="question-meta">
                        <span class="question-author">
                            ${userAvatar ?
                                `<img src="${userAvatar}" alt="Usuario" class="author-avatar">` :
                                `<div class="user-avatar-circle">${userName.charAt(0).toUpperCase()}</div>`
                            }
                            ${userName}
                        </span>
                        <span class="question-time">${timeAgo}</span>
                        <span class="question-module">${question.module_name || 'General'}</span>
                    </div>
                </div>
                <div class="question-preview">
                    <p>${question.content.length > 200 ? question.content.substring(0, 200) + '...' : question.content}</p>
                </div>
                <div class="question-footer">
                    <div class="question-actions">
                        <div class="question-votes">
                            <button class="vote-btn upvote" type="button" title="Votar positivamente" onclick="voteQuestion('${question.id}', 'up')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                            <span class="vote-count">${question.votes_count || 0}</span>
                        </div>
                        <button class="action-btn answer-btn" title="Responder pregunta" onclick="showAnswerModal('${question.id}', '${question.title}', '${question.content}')">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="question-stats">
                        <span class="stat-item question-answers clickable" onclick="showQuestionAnswers('${question.id}')" title="Ver respuestas" style="cursor: pointer;">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            ${question.answers_count || 0} respuestas
                        </span>
                        <span class="stat-item">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            ${question.views_count || 0} vistas
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función para verificar si la pregunta fue realmente agregada al DOM
async function verifyQuestionWasAdded() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return false;

    const questionItems = questionsList.querySelectorAll('.question-item');
    const previousCount = parseInt(localStorage.getItem('previousQuestionCount') || '0');
    const currentCount = questionItems.length;

    console.log(`🔍 Verificando preguntas: Anterior: ${previousCount}, Actual: ${currentCount}`);

    if (currentCount > previousCount) {
        localStorage.setItem('previousQuestionCount', currentCount.toString());
        return true;
    }

    return false;
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
window.openNotebookLMPanel = openNotebookLMPanel;

// Exponer funciones de debugging para troubleshooting
window.debugCommunitySystem = function() {
    console.log('🔧 === DEBUG: SISTEMA DE COMUNIDAD ===');
    console.log('🔧 communityAPI disponible:', !!window.communityAPI);
    console.log('🔧 loadCommunityQuestions disponible:', typeof loadCommunityQuestions);
    console.log('🔧 questionsList elemento:', !!document.getElementById('questionsList'));

    if (window.communityAPI) {
        console.log('🔧 communityAPI métodos:', Object.getOwnPropertyNames(window.communityAPI));
    }

    const questionsList = document.getElementById('questionsList');
    if (questionsList) {
        const currentQuestions = questionsList.querySelectorAll('.question-item');
        console.log('🔧 Preguntas actuales en DOM:', currentQuestions.length);
        currentQuestions.forEach((q, i) => {
            console.log(`🔧 Pregunta ${i+1}:`, q.dataset.questionId, q.querySelector('.question-title')?.textContent);
        });
    }

    console.log('🔧 === FIN DEBUG ===');
};

window.testQuestionRefresh = async function() {
    console.log('🧪 === TEST: ACTUALIZACIÓN DE PREGUNTAS ===');

    try {
        console.log('🧪 Ejecutando refreshQuestionsDirectly...');
        await refreshQuestionsDirectly();
        console.log('🧪 refreshQuestionsDirectly completado');

        console.log('🧪 Ejecutando forceBruteAPIReload...');
        await forceBruteAPIReload();
        console.log('🧪 forceBruteAPIReload completado');

        console.log('🧪 Ejecutando forceManualDOMUpdate...');
        await forceManualDOMUpdate();
        console.log('🧪 forceManualDOMUpdate completado');

        showNotification('🧪 Test de actualización completado', 'info');
    } catch (error) {
        console.error('🧪 Error en test:', error);
        showNotification('🧪 Error en test: ' + error.message, 'error');
    }

    console.log('🧪 === FIN TEST ===');
};

console.log('🔧 Funciones de debugging disponibles:');
console.log('🔧 - debugCommunitySystem() - Ver estado del sistema');
console.log('🔧 - testQuestionRefresh() - Probar actualización de preguntas');

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