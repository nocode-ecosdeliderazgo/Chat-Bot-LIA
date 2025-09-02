// =====================================================
// CHAT ONLINE V2 - SISTEMA DINÁMICO INTEGRADO
// Versión completamente dinámica sin datos hardcodeados
// =====================================================

class ChatOnlineV2 {
    constructor() {
        this.currentModule = null;
        this.currentVideo = null;
        this.currentTab = 'video';
        this.isLiaTyping = false;
        this.notes = [];
        this.isSearchMode = false;
        this.courseData = null;
        this.isInitialized = false;
        
        console.log('🚀 ChatOnline V2 creado');
    }

    async init() {
        try {
            console.log('🚀 Inicializando Chat Online V2...');

            // Esperar a que dynamic video loader esté listo
            await this.waitForDynamicVideoLoader();

            // Configurar event listeners básicos
            this.setupEventListeners();

            // Configurar integración con sistema dinámico
            this.setupDynamicIntegration();

            // Configurar chat de LIA
            this.setupLiaChat();

            // Configurar notas y UI
            this.setupNotesAndUI();

            this.isInitialized = true;
            console.log('✅ Chat Online V2 inicializado correctamente');

        } catch (error) {
            console.error('💥 Error inicializando Chat Online V2:', error);
        }
    }

    async waitForDynamicVideoLoader() {
        return new Promise((resolve) => {
            const checkLoader = () => {
                if (window.dynamicVideoLoader && window.dynamicVideoLoader.courseData) {
                    console.log('✅ Dynamic Video Loader está listo');
                    this.courseData = window.dynamicVideoLoader.courseData;
                    this.currentModule = window.dynamicVideoLoader.currentModule;
                    this.currentVideo = window.dynamicVideoLoader.currentVideo;
                    resolve();
                } else {
                    console.log('⏳ Esperando a Dynamic Video Loader...');
                    setTimeout(checkLoader, 500);
                }
            };
            checkLoader();
        });
    }

    // =====================================================
    // CONFIGURACIÓN DE EVENT LISTENERS
    // =====================================================

    setupEventListeners() {
        console.log('🔧 Configurando event listeners básicos...');

        // Navegación superior
        this.setupNavigation();
        
        // Pestañas de contenido
        this.setupContentTabs();
        
        // Responsive
        this.setupResponsiveListeners();
    }

    setupNavigation() {
        const backBtn = document.querySelector('.back-btn');
        const navTabs = document.querySelectorAll('.nav-tab');
        
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('🔙 Navegando hacia atrás...');
                this.goBack();
            });
        }

        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                console.log(`📑 Cambiando a pestaña: ${tabName}`);
                this.switchTab(tabName);
            });
        });
    }

    setupContentTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contentType = e.currentTarget.dataset.content;
                this.switchContentTab(contentType);
            });
        });
    }

    setupResponsiveListeners() {
        // Event listeners para diseño responsivo
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Toggle de paneles en móvil
        this.setupMobileToggles();
    }

    setupMobileToggles() {
        const toggleButtons = document.querySelectorAll('[data-toggle]');
        
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.toggle;
                this.togglePanel(target);
            });
        });
    }

    // =====================================================
    // INTEGRACIÓN CON SISTEMA DINÁMICO
    // =====================================================

    setupDynamicIntegration() {
        console.log('🔗 Configurando integración con sistema dinámico...');

        // Escuchar eventos de progreso
        window.addEventListener('progressUpdated', (event) => {
            this.handleProgressUpdate(event.detail);
        });

        // Escuchar cambios de módulo/video
        window.addEventListener('moduleChanged', (event) => {
            this.handleModuleChange(event.detail);
        });

        // Escuchar cuando se actualiza la estructura del curso
        window.addEventListener('courseStructureLoaded', (event) => {
            this.handleCourseStructureLoaded(event.detail);
        });
    }

    handleProgressUpdate(progressData) {
        console.log('📊 Actualizando UI con progreso:', progressData);
        
        // Actualizar indicadores visuales de progreso
        this.updateProgressIndicators(progressData);
        
        // Actualizar dots de progreso del video
        this.updateVideoProgressDots(progressData);
    }

    handleModuleChange(moduleData) {
        console.log('🔄 Módulo cambiado:', moduleData);
        
        this.currentModule = moduleData.module;
        this.currentVideo = moduleData.current_video;
        
        // Actualizar UI para reflejar el cambio
        this.updateModuleUI();
        
        // Reiniciar chat context si es necesario
        this.updateLiaChatContext();
    }

    handleCourseStructureLoaded(courseData) {
        console.log('📚 Estructura del curso cargada:', courseData);
        
        this.courseData = courseData;
        
        // Actualizar información del curso en la UI
        this.updateCourseInfo(courseData.course);
    }

    // =====================================================
    // ACTUALIZACIÓN DE UI
    // =====================================================

    updateProgressIndicators(progressData) {
        // Esta lógica ya está en dynamic-video-loader.js
        // Aquí solo agregamos actualizaciones adicionales si es necesario
        
        const progressPercentage = progressData.video_progress?.completion_percentage || 0;
        
        // Actualizar cualquier indicador adicional específico de chat-online
        this.updateVideoProgressUI(progressPercentage);
    }

    updateVideoProgressDots(progressData) {
        const progressDots = document.querySelector('.video-progress-dots');
        if (!progressDots) return;

        // Esta funcionalidad ya está en dynamic-video-loader.js
        // Mantener por compatibilidad
    }

    updateModuleUI() {
        if (!this.currentModule) return;

        // Actualizar información del módulo actual en elementos específicos
        const moduleTitle = document.querySelector('.current-module-info span');
        if (moduleTitle) {
            moduleTitle.textContent = `Módulo ${this.currentModule.module_number}: ${this.currentModule.title}`;
        }

        // Actualizar transcripción si está disponible
        this.updateTranscription();
    }

    updateTranscription() {
        if (!this.currentVideo) return;

        const transcriptContent = document.querySelector('.transcript-content');
        if (transcriptContent && this.currentVideo.transcript_text) {
            transcriptContent.innerHTML = `<p>${this.currentVideo.transcript_text}</p>`;
        }
    }

    updateCourseInfo(courseInfo) {
        // Actualizar título del curso si hay elementos adicionales
        const additionalTitles = document.querySelectorAll('.additional-course-title');
        additionalTitles.forEach(title => {
            title.textContent = courseInfo.title;
        });
    }

    updateVideoProgressUI(percentage) {
        // Actualizar elementos de progreso específicos de chat-online
        const customProgressBars = document.querySelectorAll('.custom-progress-bar');
        customProgressBars.forEach(bar => {
            bar.style.width = `${percentage}%`;
        });
    }

    // =====================================================
    // CONFIGURACIÓN DEL CHAT DE LIA
    // =====================================================

    setupLiaChat() {
        console.log('💬 Configurando chat de LIA...');

        const sendBtn = document.getElementById('sendLiaMessage');
        const input = document.getElementById('liaMessageInput');
        const messagesContainer = document.getElementById('liaMessages');

        if (!sendBtn || !input || !messagesContainer) {
            console.warn('⚠️ Elementos del chat de LIA no encontrados');
            return;
        }

        // Event listener para enviar mensaje
        sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.sendLiaMessage();
        });

        // Event listener para Enter
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendLiaMessage();
            }
        });

        console.log('✅ Chat de LIA configurado');
    }

    async sendLiaMessage() {
        const input = document.getElementById('liaMessageInput');
        const messagesContainer = document.getElementById('liaMessages');

        if (!input || !messagesContainer) return;

        const mensaje = input.value.trim();
        if (!mensaje) return;

        console.log('💬 Enviando mensaje a LIA:', mensaje);

        // Limpiar input
        input.value = '';

        // Agregar mensaje del usuario
        this.addUserMessage(mensaje);

        // Mostrar typing indicator
        this.showLiaTyping(true);

        try {
            // Generar contexto dinámico
            const context = this.generateLiaContext();
            
            // Llamar a API de OpenAI
            const response = await this.callLiaAPI(mensaje, context);
            
            // Mostrar respuesta de LIA
            this.addLiaMessage(response);
            
        } catch (error) {
            console.error('❌ Error en chat de LIA:', error);
            this.addLiaMessage('❌ Disculpa, hubo un error. Por favor intenta de nuevo.');
        } finally {
            this.showLiaTyping(false);
        }
    }

    generateLiaContext() {
        const context = {
            course: this.courseData?.course?.title || 'Introducción a la IA',
            currentModule: this.currentModule?.title || 'Módulo actual',
            currentVideo: this.currentVideo?.video_title || 'Video actual',
            videoTime: this.getCurrentVideoTime(),
            transcript: this.currentVideo?.transcript_text || 'Sin transcripción disponible'
        };

        console.log('🧠 Contexto generado para LIA:', context);
        return context;
    }

    async callLiaAPI(message, context) {
        const apiUrl = this.getApiUrl('/openai');
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`,
                'X-User-Id': this.getCurrentUserId()
            },
            body: JSON.stringify({
                prompt: message,
                context: `Usuario está en: ${context.course} - ${context.currentModule}. Video actual: ${context.currentVideo}. Tiempo del video: ${context.videoTime}s. ${context.transcript.substring(0, 500)}`
            })
        });

        if (!response.ok) {
            throw new Error(`Error API: ${response.status}`);
        }

        const data = await response.json();
        return data.response || 'No se pudo generar respuesta';
    }

    addUserMessage(message) {
        const messagesContainer = document.getElementById('liaMessages');
        if (!messagesContainer) return;

        const userMsg = document.createElement('div');
        userMsg.className = 'user-message';
        userMsg.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">ahora</div>
            </div>
        `;

        messagesContainer.appendChild(userMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addLiaMessage(message) {
        const messagesContainer = document.getElementById('liaMessages');
        if (!messagesContainer) return;

        const liaMsg = document.createElement('div');
        liaMsg.className = 'lia-message';
        liaMsg.innerHTML = `
            <div class="lia-avatar">
                <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
            </div>
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">ahora</div>
            </div>
        `;

        messagesContainer.appendChild(liaMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showLiaTyping(show) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = show ? 'flex' : 'none';
        }
        this.isLiaTyping = show;
    }

    updateLiaChatContext() {
        // Actualizar contexto del chat cuando cambia el módulo/video
        if (this.currentVideo && this.currentModule) {
            console.log('🔄 Actualizando contexto de LIA para nuevo contenido');
        }
    }

    // =====================================================
    // CONFIGURACIÓN DE NOTAS Y UI ADICIONAL
    // =====================================================

    setupNotesAndUI() {
        console.log('📝 Configurando notas y UI adicional...');

        // Configurar sistema de notas
        this.setupNotes();
        
        // Configurar materiales
        this.setupMaterials();
        
        // Configurar acciones adicionales
        this.setupAdditionalActions();
    }

    setupNotes() {
        const addNoteBtn = document.getElementById('addNoteBtn');
        const saveNoteBtn = document.getElementById('saveNoteBtn');
        const cancelNoteBtn = document.getElementById('cancelNoteBtn');

        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => {
                this.showNoteCreator();
            });
        }

        if (saveNoteBtn) {
            saveNoteBtn.addEventListener('click', () => {
                this.saveNote();
            });
        }

        if (cancelNoteBtn) {
            cancelNoteBtn.addEventListener('click', () => {
                this.hideNoteCreator();
            });
        }
    }

    setupMaterials() {
        const collapseMaterialsBtn = document.getElementById('collapseMaterialsBtn');
        
        if (collapseMaterialsBtn) {
            collapseMaterialsBtn.addEventListener('click', () => {
                this.toggleMaterials();
            });
        }
    }

    setupAdditionalActions() {
        // Configurar acciones adicionales como colapsar paneles, etc.
        const collapseButtons = document.querySelectorAll('[id*="collapse"]');
        
        collapseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetPanel = this.getTargetPanel(e.currentTarget.id);
                if (targetPanel) {
                    this.togglePanel(targetPanel);
                }
            });
        });
    }

    // =====================================================
    // MÉTODOS DE UI
    // =====================================================

    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '../index.html';
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        this.currentTab = tabName;
        this.handleTabChange(tabName);
    }

    switchContentTab(contentType) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-content="${contentType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.showContentType(contentType);
    }

    handleTabChange(tabName) {
        switch(tabName) {
            case 'video':
                this.showVideoContent();
                break;
            case 'materials':
                this.showMaterialsContent();
                break;
            case 'quiz':
                this.showQuizContent();
                break;
        }
    }

    showContentType(contentType) {
        // Mostrar contenido específico (transcript, summary, etc.)
        const contentAreas = document.querySelectorAll('.content-area > div');
        contentAreas.forEach(area => area.style.display = 'none');

        const targetContent = document.querySelector(`.${contentType}-content`);
        if (targetContent) {
            targetContent.style.display = 'block';
        }
    }

    showVideoContent() {
        // Lógica específica para mostrar contenido de video
        console.log('📹 Mostrando contenido de video');
    }

    showMaterialsContent() {
        console.log('📚 Mostrando contenido de materiales');
    }

    showQuizContent() {
        console.log('❓ Mostrando contenido de quiz');
    }

    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.toggle('collapsed');
        }
    }

    handleResize() {
        // Manejar cambios de tamaño de ventana
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile-view', isMobile);
    }

    // =====================================================
    // NOTAS
    // =====================================================

    showNoteCreator() {
        const noteCreator = document.getElementById('notesCreatorSection');
        if (noteCreator) {
            noteCreator.style.display = 'block';
        }
    }

    hideNoteCreator() {
        const noteCreator = document.getElementById('notesCreatorSection');
        if (noteCreator) {
            noteCreator.style.display = 'none';
        }
        this.clearNoteForm();
    }

    saveNote() {
        const titleInput = document.getElementById('noteTitleInput');
        const contentEditor = document.getElementById('noteContentEditor');
        
        if (!titleInput || !contentEditor) return;

        const title = titleInput.value.trim();
        const content = contentEditor.textContent.trim();

        if (!title || !content) {
            alert('Por favor completa el título y contenido de la nota');
            return;
        }

        const note = {
            id: Date.now(),
            title,
            content,
            module: this.currentModule?.title,
            video: this.currentVideo?.video_title,
            timestamp: new Date().toISOString(),
            videoTime: this.getCurrentVideoTime()
        };

        this.saveNoteToStorage(note);
        this.displayNote(note);
        this.hideNoteCreator();

        console.log('📝 Nota guardada:', note);
    }

    clearNoteForm() {
        const titleInput = document.getElementById('noteTitleInput');
        const contentEditor = document.getElementById('noteContentEditor');
        
        if (titleInput) titleInput.value = '';
        if (contentEditor) contentEditor.textContent = '';
    }

    saveNoteToStorage(note) {
        const notes = JSON.parse(localStorage.getItem('userNotes') || '[]');
        notes.unshift(note);
        localStorage.setItem('userNotes', JSON.stringify(notes));
    }

    displayNote(note) {
        // Agregar nota a la lista visual
        const notesList = document.getElementById('notesList');
        if (!notesList) return;

        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.innerHTML = `
            <div class="note-header">
                <span class="note-title">${note.title}</span>
                <span class="note-time">ahora</span>
            </div>
            <div class="note-content">
                <p>${note.content.substring(0, 100)}...</p>
            </div>
        `;

        notesList.insertBefore(noteElement, notesList.firstChild);
    }

    toggleMaterials() {
        const materialsSection = document.querySelector('.course-materials-section');
        if (materialsSection) {
            materialsSection.classList.toggle('collapsed');
        }
    }

    // =====================================================
    // UTILIDADES
    // =====================================================

    getCurrentVideoTime() {
        // Obtener tiempo del video desde YouTube API o estimación
        if (window.courseProgressManager) {
            return window.courseProgressManager.lastVideoTime || 0;
        }
        return 0;
    }

    getCurrentUserId() {
        return localStorage.getItem('demoUserId') || 'demo-user-123';
    }

    getAuthToken() {
        return localStorage.getItem('authToken') || `dev-token-${Date.now()}`;
    }

    getApiUrl(endpoint) {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const currentPort = window.location.port;

        let baseUrl;
        if (isLocalhost && (currentPort === '3000' || window.location.href.includes(':3000'))) {
            baseUrl = '/api';
        } else if (isLocalhost && currentPort === '8888') {
            baseUrl = '/.netlify/functions';
        } else {
            baseUrl = '/.netlify/functions';
        }

        return `${baseUrl}${endpoint}`;
    }

    getTargetPanel(buttonId) {
        const panelMap = {
            'collapseMaterialsBtn': 'materialsPanel',
            'collapseLiaBtn': 'liaPanel',
            'collapseNotes': 'notesPanel'
        };
        return panelMap[buttonId];
    }
}

// =====================================================
// INICIALIZACIÓN GLOBAL
// =====================================================

window.chatOnline = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('💬 Inicializando Chat Online V2...');
    
    window.chatOnline = new ChatOnlineV2();
    
    // Inicializar después de que otros componentes estén listos
    setTimeout(() => {
        window.chatOnline.init();
    }, 2000); // Esperar a que dynamic video loader se inicialice
});

// Limpiar al cerrar
window.addEventListener('beforeunload', () => {
    if (window.chatOnline && window.chatOnline.isInitialized) {
        console.log('🧹 Limpiando Chat Online V2...');
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatOnlineV2;
}