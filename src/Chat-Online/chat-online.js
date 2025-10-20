// ===== CHAT ONLINE - JAVASCRIPT PRINCIPAL =====
console.log('🚀🚀🚀 ARCHIVO chat-online.js CARGADO CORRECTAMENTE 🚀🚀🚀');

// ===== FUNCIONES GLOBALES INMEDIATAS =====
// Definir funciones globales antes de la clase para que estén disponibles inmediatamente
window.openQuestionModal = function() {
    console.log('🔘 Función global de fallback ejecutada');
    if (window.chatOnline && window.chatOnline.showQuestionModal) {
        window.chatOnline.showQuestionModal();
    } else {
        console.error('❌ ChatOnline no está disponible');
        // Fallback directo
        const modal = document.getElementById('questionModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            console.log('✅ Modal abierto con fallback directo');
        } else {
            console.error('❌ Modal no encontrado');
        }
    }
};

// También definir una función más simple como respaldo
window.showQuestionModal = function() {
    console.log('🔘 Función de respaldo ejecutada');
    const modal = document.getElementById('questionModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal abierto con función de respaldo');
    } else {
        console.error('❌ Modal no encontrado');
    }
};

class ChatOnline {
    constructor() {
        this.currentModule = 1;
        this.currentTab = 'video';
        this.isLiaTyping = false;
        this.notes = [];
        this.isSearchMode = false;
        this.progressManager = null;
        this.courseProgress = null;
        this.loadingQuestions = false;
        this.communityEventListenersSetup = false;
        this.communityQuestionsLoaded = false;
        this.submittingQuestion = false;
        this.answerModalListenersSetup = false;
        this.commentModalListenersSetup = false;
        
        // IDs para la base de datos
        this.currentCourseId = '550e8400-e29b-41d4-a716-446655440001';
        this.currentUser = {
            id: '9562a449-4ade-4d4b-a3e4-b66dddb7e6f0',
            username: 'Estudiante',
            email: 'estudiante@ejemplo.com',
            name: 'Estudiante IA'
        };
        
        // ===== ESTADO DEL QUIZ =====
        this.quizData = this.getQuizData();
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.quizResultsShown = false;
        
        // ===== CRONÓMETRO DEL QUIZ =====
        this.quizTimer = null;
        this.quizTimeLimit = 3 * 60; // 3 minutos en segundos
        this.quizTimeRemaining = this.quizTimeLimit;
        this.quizStartTime = null;
        this.timeUpAlertShown = false; // Control para evitar bucle infinito
        
        // ===== ACCESO GLOBAL INMEDIATO =====
        window.courseManager = this;
        console.log('✅ window.courseManager asignado en constructor');
        
        // Función global de backup para onclick
        window.switchTab = (contentType) => {
            console.log(`🔄 switchTab global llamado: ${contentType}`);
            this.switchContentTab(contentType);
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Chat Online...');
        this.setupEventListeners();
        await this.initializeProgressManager();
        await this.initializeYouTubeTracker();
        await this.initializeCommunitySystem();
        this.loadInitialData();
        this.setupResponsive();
        
        // Asegurar que los botones de notas funcionen
        this.ensureNotesButtonsWork();

        // Cargar notas como backup (con delay para asegurar DOM listo)
        setTimeout(() => {
            console.log('🔄 Ejecutando loadNotesList() de backup desde init()');
            
            // PRIMERO: Limpiar cualquier nota hardcodeada "xs"
            this.removeHardcodedXsNote();
            
            // DESPUÉS: Cargar notas normalmente
            setTimeout(() => {
                this.loadNotesList();
            }, 200);
        }, 500);

        console.log('✅ Chat Online inicializado correctamente');
        console.log('✅ Método openNoteForEditing disponible:', typeof this.openNoteForEditing);
        
        // Exponer funciones de diagnóstico globalmente
        window.debugNotesButton = () => this.debugNotesButton();
        window.debugLeftPanelButtons = () => this.debugLeftPanelButtons();
        
        // Exponer función para eliminar nota hardcodeada
        window.removeXsNote = () => this.removeHardcodedXsNote();
        window.nuclearCleanNotes = () => this.nuclearCleanNotes();
    }
    
    // Función de diagnóstico para el botón de notas
    debugNotesButton() {
        console.log('🔍 DIAGNÓSTICO DEL BOTÓN DE NOTAS');
        console.log('================================');
        
        const addNoteBtn = document.getElementById('addNoteBtn');
        const notesCreator = document.getElementById('notesCreatorSection');
        
        console.log('1. Elementos HTML:');
        console.log('  - addNoteBtn:', !!addNoteBtn);
        console.log('  - notesCreatorSection:', !!notesCreator);
        
        if (addNoteBtn) {
            console.log('  - Botón visible:', addNoteBtn.offsetParent !== null);
            console.log('  - Botón habilitado:', !addNoteBtn.disabled);
            console.log('  - Clases:', addNoteBtn.className);
        }
        
        console.log('2. Funciones:');
        console.log('  - addNewNote:', typeof this.addNewNote);
        console.log('  - showNotesCreator:', typeof this.showNotesCreator);
        console.log('  - setupNotes:', typeof this.setupNotes);
        
        console.log('3. Event Listeners:');
        if (addNoteBtn && getEventListeners) {
            const listeners = getEventListeners(addNoteBtn);
            console.log('  - Click listeners:', listeners.click ? listeners.click.length : 0);
        } else {
            console.log('  - No se puede verificar (DevTools requerido)');
        }
        
        console.log('4. Test manual:');
        if (addNoteBtn) {
            console.log('  - Simulando click...');
            addNoteBtn.click();
            setTimeout(() => {
                const isVisible = notesCreator && notesCreator.style.display !== 'none';
                console.log('  - Creador visible después del click:', isVisible);
            }, 100);
        }
        
        return {
            buttonExists: !!addNoteBtn,
            creatorExists: !!notesCreator,
            functionsExist: {
                addNewNote: typeof this.addNewNote,
                showNotesCreator: typeof this.showNotesCreator
            }
        };
    }
    
    // Función de diagnóstico para todos los botones del panel izquierdo
    debugLeftPanelButtons() {
        console.log('🔍 DIAGNÓSTICO DE BOTONES DEL PANEL IZQUIERDO');
        console.log('============================================');
        
        // Lista de todos los botones del panel izquierdo
        const leftPanelButtons = [
            'collapseLeft',
            'saveNoteBtn',
            'exportPdfBtn', 
            'cancelNoteBtn',
            'boldBtn',
            'italicBtn',
            'underlineBtn',
            'listBtn',
            'linkBtn',
            'fontSizeBtn',
            'collapseMaterialsBtn'
        ];
        
        console.log('1. VERIFICACIÓN DE ELEMENTOS HTML:');
        const buttonStatus = {};
        
        leftPanelButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            buttonStatus[buttonId] = {
                exists: !!button,
                visible: button ? button.offsetParent !== null : false,
                enabled: button ? !button.disabled : false
            };
            
            if (button) {
                console.log(`  ✅ ${buttonId}: existe, visible: ${button.offsetParent !== null}, habilitado: ${!button.disabled}`);
            } else {
                console.log(`  ❌ ${buttonId}: NO encontrado`);
            }
        });
        
        console.log('2. VERIFICACIÓN DE FUNCIONES:');
        const functionsToCheck = [
            'setupNotes',
            'setupNotesEditor', 
            'setupToolbar',
            'setupEditorButtons',
            'setupMaterials',
            'addNewNote',
            'showNotesCreator',
            'saveNote',
            'exportNoteToPDF'
        ];
        
        functionsToCheck.forEach(funcName => {
            const exists = typeof this[funcName] === 'function';
            console.log(`  ${exists ? '✅' : '❌'} ${funcName}: ${exists ? 'existe' : 'NO existe'}`);
        });
        
        console.log('3. VERIFICACIÓN DE EVENT LISTENERS:');
        leftPanelButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button && getEventListeners) {
                const listeners = getEventListeners(button);
                const clickListeners = listeners.click ? listeners.click.length : 0;
                console.log(`  ${buttonId}: ${clickListeners} click listener(s)`);
            } else if (button) {
                console.log(`  ${buttonId}: No se puede verificar (DevTools requerido)`);
            }
        });
        
        console.log('4. TEST MANUAL DE BOTONES PRINCIPALES:');
        
        // Test del botón añadir nota
        const addNoteBtn = document.getElementById('addNoteBtn');
        if (addNoteBtn) {
            console.log('  - Probando botón añadir nota...');
            addNoteBtn.click();
            setTimeout(() => {
                const notesCreator = document.getElementById('notesCreatorSection');
                const isVisible = notesCreator && notesCreator.style.display !== 'none';
                console.log(`  - Creador de notas abierto: ${isVisible}`);
            }, 100);
        }
        
        // Test del botón colapsar materiales
        const collapseMaterialsBtn = document.getElementById('collapseMaterialsBtn');
        if (collapseMaterialsBtn) {
            console.log('  - Probando botón colapsar materiales...');
            collapseMaterialsBtn.click();
        }
        
        return {
            buttonStatus,
            functionsExist: functionsToCheck.reduce((acc, func) => {
                acc[func] = typeof this[func] === 'function';
                return acc;
            }, {})
        };
    }
    
    // Función de fallback para asegurar que los botones de notas funcionen
    ensureNotesButtonsWork() {
        console.log('🔧 Asegurando que los botones de notas funcionen...');
        
        // Reconfigurar botones después de un delay adicional
        setTimeout(() => {
            this.initializeNotesButtons();
        }, 500);
        
        // También configurar un fallback global
        setTimeout(() => {
            const addNoteBtn = document.getElementById('addNoteBtn');
            if (addNoteBtn && !addNoteBtn.hasAttribute('data-listener-added')) {
                console.log('🔄 Configurando fallback para botón añadir nota...');
                addNoteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🖱️ Fallback: Click en botón añadir nota');
                    if (window.chatOnline && typeof window.chatOnline.addNewNote === 'function') {
                        window.chatOnline.addNewNote();
                    } else {
                        console.error('❌ Función addNewNote no disponible');
                    }
                });
                addNoteBtn.setAttribute('data-listener-added', 'true');
                console.log('✅ Fallback configurado');
            }
        }, 1000);
    }
    
    setupEventListeners() {
        // Navegación superior
        this.setupNavigation();
        
        // Módulos del curso
        this.setupModules();
        
        // Chat de LIA
        this.setupLiaChat();
        
        // Sistema de comunidad
        this.setupCommunityEvents();
        
        // Pestañas de contenido
        this.debugTabsImmediately();
        this.setupContentTabs();
        
        // Notas
        console.log('🔧 Ejecutando setupNotes() desde setupEventListeners()');
        this.setupNotes();
        
        // Materiales
        this.setupMaterials();
        
        // Responsive
        this.setupResponsiveListeners();
        
        // Progress Manager Events
        this.setupProgressEvents();
    }
    
    // ===== NAVEGACIÓN SUPERIOR =====
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

    
    goBack() {
        // Redirigir a la página de cursos
        window.location.href = '../cursos.html';
    }
    
    switchTab(tabName) {
        // Remover clase active de todas las pestañas
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Agregar clase active a la pestaña seleccionada
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        this.currentTab = tabName;
        
        // Aquí puedes agregar lógica específica para cada pestaña
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
    
    // ===== MÓDULOS DEL CURSO =====
    setupModules() {
        // Configurar progress dots
        this.setupProgressDots();
        
        // Inicializar el sistema simple de módulos estilo Coursera
        if (typeof window.initializeSimpleModuleSystem === 'function') {
            window.initializeSimpleModuleSystem();
        } else {
            console.warn('⚠️ initializeSimpleModuleSystem no está disponible aún');
        }
        
        // Los eventos se manejan directamente en el HTML con onclick
    }

    // ===== POBLAR MÓDULOS DEL SIDEBAR =====
    populateModulesSidebar() {
        const modulesList = document.querySelector('.modules-list');
        if (!modulesList) return;
        
        const modules = [
            {
                id: 1,
                title: 'Módulo 1: ¿Qué es la IA?',
                description: 'Introducción a los conceptos fundamentales de la Inteligencia Artificial',
                duration: '15:30',
                videos: 2,
                progress: 0,
                status: 'current'
            },
            {
                id: 2,
                title: 'Módulo 2: Historia de la IA',
                description: 'Evolución histórica y hitos importantes en el desarrollo de la IA',
                duration: '22:00',
                videos: 3,
                progress: 0,
                status: 'pending'
            },
            {
                id: 3,
                title: 'Módulo 3: Fundamentos del ML',
                description: 'Conceptos básicos del Machine Learning y sus aplicaciones',
                duration: '18:30',
                videos: 2,
                progress: 0,
                status: 'pending'
            },
            {
                id: 4,
                title: 'Módulo 4: Redes Neuronales',
                description: 'Arquitecturas de redes neuronales y deep learning',
                duration: '25:00',
                videos: 4,
                progress: 0,
                status: 'pending'
            },
            {
                id: 5,
                title: 'Módulo 5: IA en el Futuro',
                description: 'Tendencias futuras y aplicaciones emergentes de la IA',
                duration: '20:00',
                videos: 3,
                progress: 0,
                status: 'pending'
            }
        ];

        // Función getIconSvg eliminada - ya no se usan iconos

        const modulesHTML = modules.map(module => `
            <div class="module-item ${module.status}" data-module="${module.id}">
                <div class="module-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
                <div class="module-info">
                    <h4>${module.title}</h4>
                    <p class="module-description">Vídeo • ${module.duration}</p>
                </div>
                <div class="module-actions">
                    <button class="action-btn module-toggle-btn" data-module="${module.id}" title="Expandir/Contraer Módulo">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6,9 12,15 18,9"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        modulesList.innerHTML = modulesHTML;
        console.log('📚 Módulos del sidebar populados correctamente');
        
        // Agregar event listeners para los botones de expandir/contraer
        this.setupModuleToggleButtons();
    }

    // ===== CONFIGURAR BOTONES DE EXPANDIR/CONTRAR MÓDULOS =====
    setupModuleToggleButtons() {
        const toggleButtons = document.querySelectorAll('.module-toggle-btn');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const moduleId = button.getAttribute('data-module');
                const moduleItem = button.closest('.module-item');
                const icon = button.querySelector('svg');
                
                // Toggle del estado expandido
                const isExpanded = moduleItem.classList.contains('expanded');
                
                if (isExpanded) {
                    // Contraer
                    this.collapseModule(moduleItem, icon, button, moduleId);
                } else {
                    // Expandir
                    this.expandModule(moduleItem, icon, button, moduleId);
                }
            });
        });
    }

    // ===== EXPANDIR MÓDULO =====
    expandModule(moduleItem, icon, button, moduleId) {
        // Agregar clase expanded
        moduleItem.classList.add('expanded');
        
        // Cambiar icono
        icon.innerHTML = '<polyline points="6,15 12,9 18,15"/>';
        button.title = 'Contraer Módulo';
        
        // Crear contenido de videos si no existe
        let videosContent = document.querySelector(`.module-videos-content-${moduleId}`);
        if (!videosContent) {
            videosContent = this.createVideosContent(moduleId);
            // Insertar después del módulo, no dentro
            moduleItem.parentNode.insertBefore(videosContent, moduleItem.nextSibling);
        }
        
        // Mostrar contenido inmediatamente
        videosContent.style.display = 'block';
        videosContent.style.maxHeight = '400px';
        videosContent.style.opacity = '1';
        
        console.log(`📤 Módulo ${moduleId} expandido`);
    }

    // ===== CONTRAR MÓDULO =====
    collapseModule(moduleItem, icon, button, moduleId) {
        // Remover clase expanded
        moduleItem.classList.remove('expanded');
        
        // Cambiar icono
        icon.innerHTML = '<polyline points="6,9 12,15 18,9"/>';
        button.title = 'Expandir Módulo';
        
        // Ocultar contenido inmediatamente
        const videosContent = document.querySelector(`.module-videos-content-${moduleId}`);
        if (videosContent) {
            videosContent.style.display = 'none';
            videosContent.style.maxHeight = '0';
            videosContent.style.opacity = '0';
        }
        
        console.log(`📦 Módulo ${moduleId} contraído`);
    }

    // ===== CREAR CONTENIDO DE VIDEOS =====
    createVideosContent(moduleId) {
        const videosContent = document.createElement('div');
        videosContent.className = `module-videos-content module-videos-content-${moduleId}`;
        
        // Contenido de ejemplo para el módulo 1
        if (moduleId === 'module-1') {
            videosContent.innerHTML = `
                <div class="videos-list">
                    <div class="video-item">
                        <div class="video-thumbnail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="video-info">
                            <h4>Introducción a la IA</h4>
                            <p>Conceptos básicos y fundamentales</p>
                            <span class="video-duration">15:30</span>
                        </div>
                        <div class="video-status">
                            <span class="progress-badge">0%</span>
                        </div>
                    </div>
                    <div class="video-item">
                        <div class="video-thumbnail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="video-info">
                            <h4>Historia de la IA</h4>
                            <p>Evolución y hitos importantes</p>
                            <span class="video-duration">12:45</span>
                        </div>
                        <div class="video-status">
                            <span class="progress-badge">0%</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Contenido para otros módulos
            videosContent.innerHTML = `
                <div class="videos-list">
                    <div class="video-item">
                        <div class="video-thumbnail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="video-info">
                            <h4>Video del Módulo ${moduleId}</h4>
                            <p>Contenido del módulo</p>
                            <span class="video-duration">10:00</span>
                        </div>
                        <div class="video-status">
                            <span class="progress-badge">0%</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return videosContent;
    }

    // ===== PROGRESS DOTS =====
    setupProgressDots() {
        const progressDots = document.querySelectorAll('.progress-dot');
        
        progressDots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                const moduleId = index + 1;
                console.log(`🎯 Seleccionando módulo desde progress dot: ${moduleId}`);
                this.selectModuleFromDot(moduleId, dot);
            });
            
            // Agregar efecto de hover con delay
            dot.addEventListener('mouseenter', () => {
                dot.style.animationDelay = '0s';
            });
            
            dot.addEventListener('mouseleave', () => {
                dot.style.animationDelay = `${index * 0.2}s`;
            });
        });
    }
    
    selectModuleFromDot(moduleId, clickedDot) {
        // Remover selección anterior
        document.querySelectorAll('.progress-dot').forEach(dot => {
            dot.classList.remove('selected');
        });
        
        // Agregar efecto de selección
        clickedDot.classList.add('selected');
        
        // Remover efecto después de la animación
        setTimeout(() => {
            clickedDot.classList.remove('selected');
        }, 600);
        
        // Actualizar módulo actual
        this.selectModule(moduleId);
    }
    
    selectModule(moduleId) {
        // Si hay progress manager, usar el método con progreso
        if (this.progressManager) {
            this.selectModuleWithProgress(moduleId);
            return;
        }
        
        // Fallback sin progress manager
        this.selectModuleBasic(moduleId);
    }
    
    selectModuleBasic(moduleId) {
        // Método original sin progress manager
        document.querySelectorAll('.module-item').forEach(item => {
            item.classList.remove('current');
        });
        
        const selectedModule = document.querySelector(`[data-module="${moduleId}"]`);
        if (selectedModule) {
            selectedModule.classList.add('current');
        }
        
        this.currentModule = moduleId;
        this.changeVideoByModule(moduleId);
        this.updateModuleInfo(moduleId);
        this.loadModuleContent(moduleId);
        
        // ===== ACTUALIZAR CONTEXTO PARA LIA =====
        this.actualizarContextoLIA();
    }
    
    updateModuleInfo(moduleId) {
        const moduleData = this.getModuleData(moduleId);
        if (moduleData) {
            // Actualizar título del video
            const videoTitle = document.querySelector('.video-info h3');
            if (videoTitle) {
                videoTitle.textContent = moduleData.title;
            }
            
            // Actualizar información del módulo actual
            const currentModuleInfo = document.querySelector('.current-module-info');
            if (currentModuleInfo) {
                currentModuleInfo.textContent = moduleData.title;
            }
        }
        
        console.log(`📊 Módulo actualizado: ${moduleData?.title || 'Módulo ' + moduleId}`);
    }
    

    
    getModuleData(moduleId) {
        const modules = {
            1: { title: 'Módulo 1: ¿Qué es la IA?', duration: '15:30', progress: 0 },
            2: { title: 'Módulo 2: Historia de la IA', duration: '22:00', progress: 0 },
            3: { title: 'Módulo 3: Fundamentos del ML', duration: '18:30', progress: 0 },
            4: { title: 'Módulo 4: Redes Neuronales', duration: '25:00', progress: 0 },
            5: { title: 'Módulo 5: IA en el Futuro', duration: '20:00', progress: 0 }
        };
        
        return modules[moduleId];
    }
    
    loadModuleContent(moduleId) {
        // Aquí puedes cargar contenido específico del módulo
        console.log(`📖 Cargando contenido del módulo ${moduleId}...`);
        
        // Simular carga de transcripción
        const transcriptContent = document.querySelector('.transcript-content');
        if (transcriptContent) {
            const transcript = this.getModuleTranscript(moduleId);
            transcriptContent.innerHTML = transcript;
        }
    }
    
    getModuleTranscript(moduleId) {
        const transcripts = {
            1: `
                <p>La Inteligencia Artificial (IA) es una rama de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana.</p>
                <p>Estas tareas incluyen el aprendizaje, el razonamiento, la percepción y la resolución de problemas.</p>
                <p>La IA se puede clasificar en dos tipos principales: IA débil (narrow AI) e IA fuerte (general AI).</p>
            `,
            2: `
                <p>La historia de la IA se remonta a la década de 1950, cuando Alan Turing propuso el Test de Turing.</p>
                <p>En 1956, el término "Inteligencia Artificial" fue acuñado en la Conferencia de Dartmouth.</p>
                <p>Los años 60 y 70 vieron el desarrollo de los primeros sistemas expertos y redes neuronales.</p>
            `,
            3: `
                <p>En este módulo vamos a explorar los conceptos fundamentales de las redes neuronales. Comenzaremos con una introducción a los perceptrones simples...</p>
                <p>Las redes neuronales artificiales están inspiradas en el funcionamiento del cerebro humano. Cada neurona artificial recibe señales de entrada...</p>
                <p>La función de activación es crucial para determinar si una neurona se activa o no. Las funciones más comunes son sigmoid, tanh y ReLU...</p>
            `,
            4: `
                <p>Las redes neuronales profundas son la base del aprendizaje profundo moderno.</p>
                <p>Estas redes pueden tener múltiples capas ocultas que permiten el aprendizaje de características complejas.</p>
                <p>El backpropagation es el algoritmo fundamental para entrenar redes neuronales.</p>
            `,
            5: `
                <p>El futuro de la IA promete avances revolucionarios en todos los campos.</p>
                <p>La IA general (AGI) podría ser el próximo gran hito en la historia de la humanidad.</p>
                <p>Es importante considerar las implicaciones éticas y sociales de estos avances.</p>
            `
        };
        
        return transcripts[moduleId] || transcripts[1];
    }
    
    // ===== CHAT DE LIA =====
    setupLiaChat() {
        const sendBtn = document.getElementById('sendLiaMessage');
        const input = document.getElementById('liaMessageInput');
        const messagesContainer = document.getElementById('liaMessages');
        
        if (sendBtn && input && messagesContainer) {
            // Envío con botón
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendLiaMessage();
            });
            
            // Envío con Enter
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendLiaMessage();
                }
            });
            
            // Auto-resize del input
            input.addEventListener('input', () => {
                this.autoResizeInput(input);
            });
        }
        
        // Configurar botones de acción de LIA
        this.setupLiaActions();
        
        // Configurar editor de notas
        this.setupNotesEditor();
    }
    
    // ===== ACCIONES DE LIA =====
    setupLiaActions() {
        const newChatBtn = document.getElementById('newChatBtn');
        const collapseLiaBtn = document.getElementById('collapseLiaBtn');
        
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                console.log('🆕 Iniciando nuevo chat con LIA...');
                this.startNewChat();
            });
        }
        
        if (collapseLiaBtn) {
            collapseLiaBtn.addEventListener('click', () => {
                console.log('📦 Colapsando chat de LIA...');
                this.toggleLiaCollapse();
            });
        }
    }
    
    startNewChat() {
        const messagesContainer = document.getElementById('liaMessages');
        const input = document.getElementById('liaMessageInput');
        
        // Limpiar mensajes
        messagesContainer.innerHTML = `
            <div class="lia-message">
                <div class="lia-avatar">
                    <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
                </div>
                <div class="message-content">
                    <div class="message-text">
                        ¡Hola! Soy LIA, tu asistente de aprendizaje. Puedo ayudarte con:
                        • Conceptos del video
                        • Ejercicios prácticos
                        • Resúmenes de temas
                        ¿En qué puedo ayudarte?
                    </div>
                    <div class="message-time">ahora</div>
                </div>
            </div>
        `;
        
        // Limpiar input
        if (input) {
            input.value = '';
            this.autoResizeInput(input);
        }
        
        console.log('✅ Nuevo chat iniciado');
    }
    
    toggleLiaCollapse() {
        console.log('🔍 [DEBUG] toggleLiaCollapse() iniciada');
        
        const liaChat = document.querySelector('.lia-chat');
        const liaSection = document.querySelector('.lia-assistant-section');
        const notesSection = document.querySelector('.notes-section');
        const collapseBtn = document.getElementById('collapseLiaBtn');
        
        console.log('🔍 [DEBUG] Elementos encontrados:', {
            liaChat: !!liaChat,
            liaSection: !!liaSection,
            notesSection: !!notesSection,
            collapseBtn: !!collapseBtn
        });
        
        if (!liaChat || !liaSection || !notesSection || !collapseBtn) {
            console.error('❌ [ERROR] Elementos no encontrados:', {
                liaChat: liaChat,
                liaSection: liaSection,
                notesSection: notesSection,
                collapseBtn: collapseBtn
            });
            return;
        }
        
        const icon = collapseBtn.querySelector('svg');
        console.log('🔍 [DEBUG] Icono encontrado:', !!icon);
        
        // Verificar estado actual usando clases CSS
        const isCollapsed = liaSection.classList.contains('lia-collapsed');
        console.log('🔍 [DEBUG] Estado actual:', {
            isCollapsed: isCollapsed,
            liaSectionClasses: liaSection.className,
            notesSectionClasses: notesSection.className,
            liaChatOpacity: liaChat.style.opacity,
            liaChatVisibility: liaChat.style.visibility
        });
        
        if (isCollapsed) {
            console.log('📤 [DEBUG] Expandir LIA...');
            
            // Expandir - Transición suave
            liaChat.style.opacity = '1';
            liaChat.style.visibility = 'visible';
            liaChat.style.display = 'flex';
            
            console.log('🔍 [DEBUG] Removiendo clases de colapso...');
            
            // Remover clases de colapso
            liaSection.classList.remove('lia-collapsed');
            notesSection.classList.remove('notes-expanded');
            
            console.log('🔍 [DEBUG] Clases después de remover:', {
                liaSectionClasses: liaSection.className,
                notesSectionClasses: notesSection.className
            });
            
            icon.innerHTML = '<polyline points="6,9 12,15 18,9"/>';
            collapseBtn.title = 'Colapsar Chat';
            console.log('✅ [SUCCESS] Chat de LIA expandido');
        } else {
            console.log('📦 [DEBUG] Colapsar LIA...');
            
            // Colapsar - Transición suave
            console.log('🔍 [DEBUG] Aplicando clases de colapso...');
            
            // Aplicar clases de colapso
            liaSection.classList.add('lia-collapsed');
            notesSection.classList.add('notes-expanded');
            
            console.log('🔍 [DEBUG] Clases después de agregar:', {
                liaSectionClasses: liaSection.className,
                notesSectionClasses: notesSection.className
            });
            
            // Luego ocultar el chat con transición
            setTimeout(() => {
                console.log('🔍 [DEBUG] Ocultando chat...');
                liaChat.style.opacity = '0';
                liaChat.style.visibility = 'hidden';
            }, 100);
            
            setTimeout(() => {
                console.log('🔍 [DEBUG] Estableciendo display: none...');
                liaChat.style.display = 'none';
            }, 400);
            
            icon.innerHTML = '<polyline points="6,15 12,9 18,15"/>';
            collapseBtn.title = 'Expandir Chat';
            console.log('✅ [SUCCESS] Chat de LIA colapsado - Notas expandidas hacia arriba');
        }
        
        console.log('🔍 [DEBUG] toggleLiaCollapse() completada');
    }
    
    async sendLiaMessage() {
        const input = document.getElementById('liaMessageInput');
        const messagesContainer = document.getElementById('liaMessages');
        const message = input.value.trim();
        const replyArea = document.getElementById('replyArea');
        
        if (!message || this.isLiaTyping) return;
        
        console.log('📤 Enviando mensaje a LIA:', message);

        // Limpiar input
        input.value = '';
        this.autoResizeInput(input);
        
        // Agregar mensaje del usuario (con respuesta si existe)
        this.addUserMessage(message, replyArea.dataset.replyingTo);
        
        // Ocultar área de respuesta
        if (replyArea.style.display === 'block') {
            this.cancelReply();
        }

        // Mostrar indicador de escritura
        this.showTypingIndicator();

        try {
            // Simular respuesta de LIA (aquí puedes integrar con tu API real)
            const response = await this.getLiaResponse(message);
            this.hideTypingIndicator();
            this.addLiaMessage(response);
        } catch (error) {
            console.error('❌ Error al obtener respuesta de LIA:', error);
            this.hideTypingIndicator();
            this.addLiaMessage('Lo siento, no pude procesar tu mensaje. ¿Podrías intentarlo de nuevo?');
        }
    }
    
    addUserMessage(message, replyTo = null) {
        // Guardar mensaje en historial antes de mostrar en UI
        this.guardarMensajeEnHistorial('user', message);
        
        const messagesContainer = document.getElementById('liaMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'lia-message user-message';
        
        let replyHtml = '';
        if (replyTo) {
            replyHtml = `
                <div class="reply-preview">
                    <div class="reply-preview-text">${this.escapeHtml(replyTo.length > 40 ? replyTo.substring(0, 40) + '...' : replyTo)}</div>
                </div>
            `;
        }
        
        messageElement.innerHTML = `
            <div class="message-content user-content">
                ${replyHtml}
                <div class="message-text">${this.escapeHtml(message)}</div>
                <div class="message-time">ahora</div>
                <div class="message-actions">
                    <button class="action-btn-small" onclick="window.chatOnline.copyMessage(this)" title="Copiar mensaje">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                    <button class="action-btn-small" onclick="window.chatOnline.replyToMessage(this)" title="Responder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,11 12,14 22,4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                    </button>
                    <button class="action-btn-small" onclick="window.chatOnline.createNoteFromMessage(this)" title="Crear nota">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom(messagesContainer);
    }
    
    applyInlineFormatting(text) {
        if (!text) {
            return '';
        }

        let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>');
        return formatted;
    }

    formatAssistantMessage(rawMessage) {
        if (!rawMessage) {
            return '';
        }

        const escaped = this.escapeHtml(rawMessage);
        const lines = escaped.split(/\r?\n/);
        const parts = [];
        let listBuffer = [];

        const flushList = () => {
            if (listBuffer.length === 0) {
                return;
            }
            parts.push('<ul>' + listBuffer.join('') + '</ul>');
            listBuffer = [];
        };

        lines.forEach((originalLine) => {
            const trimmed = originalLine.trim();
            if (!trimmed) {
                flushList();
                return;
            }

            if (/^[-*]\s+/.test(trimmed)) {
                const itemText = this.applyInlineFormatting(trimmed.replace(/^[-*]\s+/, ''));
                listBuffer.push('<li>' + itemText + '</li>');
                return;
            }

            flushList();

            if (/^###\s+/.test(trimmed)) {
                const headingText = this.applyInlineFormatting(trimmed.replace(/^###\s+/, ''));
                parts.push('<h3>' + headingText + '</h3>');
                return;
            }

            if (/^##\s+/.test(trimmed)) {
                const headingText = this.applyInlineFormatting(trimmed.replace(/^##\s+/, ''));
                parts.push('<h2>' + headingText + '</h2>');
                return;
            }

            if (/^#\s+/.test(trimmed)) {
                const headingText = this.applyInlineFormatting(trimmed.replace(/^#\s+/, ''));
                parts.push('<h1>' + headingText + '</h1>');
                return;
            }

            const paragraph = this.applyInlineFormatting(trimmed);
            parts.push('<p>' + paragraph + '</p>');
        });

        flushList();

        if (parts.length === 0) {
            return '<p>' + this.applyInlineFormatting(escaped) + '</p>';
        }

        return parts.join('');
    }

    addLiaMessage(message) {
        // Guardar respuesta de LIA en historial antes de mostrar en UI
        this.guardarMensajeEnHistorial('assistant', message);
        
        const messagesContainer = document.getElementById('liaMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'lia-message';
        messageElement.innerHTML = `
            <div class="lia-avatar">
                <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
            </div>
            <div class="message-content">
                <div class="message-text">${this.formatAssistantMessage(message)}</div>
                <div class="message-time">ahora</div>
                <div class="message-actions">
                    <button class="action-btn-small" onclick="window.chatOnline.copyMessage(this)" title="Copiar mensaje">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                    <button class="action-btn-small" onclick="window.chatOnline.replyToMessage(this)" title="Responder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,11 12,14 22,4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                    </button>
                    <button class="action-btn-small" onclick="window.chatOnline.createNoteFromMessage(this)" title="Crear nota">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom(messagesContainer);
    }
    
    showTypingIndicator() {
        this.isLiaTyping = true;
        const messagesContainer = document.getElementById('liaMessages');
        const typingElement = document.createElement('div');
        typingElement.className = 'lia-message typing-indicator';
        typingElement.innerHTML = `
            <div class="lia-avatar">
                <img src="../assets/images/FOTO LIA.png" alt="LIA" class="lia-avatar-img">
            </div>
            <div class="typing-dots-only">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        messagesContainer.appendChild(typingElement);
        this.scrollToBottom(messagesContainer);
    }
    
    hideTypingIndicator() {
        this.isLiaTyping = false;
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    async getLiaResponse(message) {
        try {
            console.log('[LIA] 🚀 Generando respuesta para:', message);
            
            // Obtener información del usuario actual
            const currentUser = this.obtenerUsuarioActual();
            console.log('[LIA] 👤 Usuario actual:', currentUser);
            
            // Obtener contexto del taller actual usando la función hardcodeada
            const context = typeof obtenerContextoCurso === 'function' ? obtenerContextoCurso() : this.obtenerContextoFallback();
            console.log('[LIA] 📚 Contexto del taller:', context);

            // Obtener historial de conversación para contexto dinámico
            const conversationHistory = this.obtenerHistorialConversacion();
            console.log('[LIA] 💬 Historial de conversación:', conversationHistory);

            // Generar contexto personalizado y dinámico
            const personalizedContext = this.generarContextoPersonalizado(message, currentUser, conversationHistory);
            console.log('[LIA] 🎯 Contexto personalizado:', personalizedContext);
            
            // Preparar prompt enriquecido con contexto dinámico
            const prompt = this.construirPromptDinamico(message, context, personalizedContext, conversationHistory);
            console.log('[LIA] 📝 Prompt dinámico preparado:', prompt.substring(0, 200) + '...');
            
            console.log('[LIA] 🔄 Enviando solicitud a API...');
            
            // Determinar URL de API según el entorno
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const currentPort = window.location.port;
            let apiUrl;
            
            if (isLocalhost && (currentPort === '3000' || window.location.href.includes(':3000'))) {
                apiUrl = '/api/openai';
            } else if (isLocalhost && currentPort === '8888') {
                apiUrl = '/.netlify/functions/openai';
            } else if (isLocalhost) {
                apiUrl = '/api/openai';
            } else {
                apiUrl = '/.netlify/functions/openai';
            }
            
            console.log('[LIA] 🎯 URL de API:', apiUrl);
            
            // Llamar a la API de OpenAI
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.obtenerTokenAuth()}`,
                    'X-User-Id': currentUser?.id || 'taller-ia-user'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    context: `Información del usuario: ${JSON.stringify(currentUser || {})}`
                })
            });
            
            console.log('[LIA] 📡 Respuesta del servidor:', response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                console.log('[LIA] ✅ Datos recibidos:', data);
                
                if (data.response) {
                    console.log('[LIA] 🎯 Respuesta de API obtenida exitosamente');
                    return data.response;
                } else {
                    console.log('[LIA] ⚠️ Respuesta vacía de la API');
                    return '❌ Lo siento, hubo un problema técnico. Verifica la configuración de OpenAI.';
                }
            } else {
                const errorText = await response.text();
                console.log('[LIA] ❌ Error de API:', response.status, response.statusText);
                console.log('[LIA] 📄 Texto del error:', errorText);
                
                if (response.status === 404) {
                    return `❌ Error de configuración: No se encuentra la API en ${apiUrl}. Verifica que tu servidor esté corriendo correctamente.`;
                } else if (response.status === 401) {
                    return `🔐 Error de autenticación: Token inválido. Verifica la configuración de autenticación.`;
                } else if (response.status === 500) {
                    return `⚙️ Error del servidor: ${errorText}. Verifica tu configuración de OPENAI_API_KEY.`;
                } else {
                    return `❌ Error HTTP ${response.status}: ${errorText}. Verifica la configuración del servidor.`;
                }
            }
            
        } catch (error) {
            console.error('[LIA] 💥 Error al conectar con API:', error);
            return `❌ Error de conexión: No se pudo conectar con la API. Error: ${error.message}`;
        }
    }
    
    // Función auxiliar para obtener contexto de fallback si la función global no existe
    obtenerContextoFallback() {
        return `
            Taller: Taller de fundamentos de Inteligencia Artificial con tutor personalizado
            Tipo: Taller interactivo  
            Módulo actual: 1 - Fundamentos de Inteligencia Artificial
            Descripción: Conceptos básicos de IA, Machine Learning y aplicaciones prácticas con acompañamiento personalizado
            Tutor: LIA - Tutor Personalizado de IA
            Modalidad: 100% online con tutor personalizado IA
            Documento de apoyo: Doc de apoyo - Fundamentos de IA.pdf
            Objetivos del módulo: Comprender los conceptos fundamentales de IA, Identificar tipos de Machine Learning, Reconocer aplicaciones prácticas de IA, Desarrollar pensamiento crítico sobre IA
        `;
    }
    
    // Función auxiliar para obtener usuario actual
    obtenerUsuarioActual() {
        try {
            // Intentar obtener desde userData (primary)
            const userData = localStorage.getItem('userData');
            if (userData) {
                const parsed = JSON.parse(userData);
                console.log('[LIA] 👤 Usuario desde userData:', parsed);
                return parsed;
            }
            
            // Intentar obtener desde currentUser (compatibility)
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                const parsed = JSON.parse(currentUser);
                console.log('[LIA] 👤 Usuario desde currentUser:', parsed);
                return parsed;
            }
            
            // Si no hay usuario autenticado, devolver null
            console.log('[LIA] ⚠️ No hay usuario autenticado');
            return null;
            
        } catch (error) {
            console.error('[LIA] ❌ Error obteniendo usuario:', error);
            return null;
        }
    }
    
    // Función para actualizar contexto de LIA cuando cambia el video/módulo
    actualizarContextoLIA() {
        try {
            console.log('🔄 [LIA CONTEXT] Actualizando contexto por cambio de video/módulo...');

            // 1. Limpiar cualquier caché de contexto local
            this.contextCache = null;

            // 2. Forzar actualización del contexto global si existe la función
            if (typeof window.actualizarContextoVideo === 'function') {
                window.actualizarContextoVideo();
                console.log('✅ [LIA CONTEXT] Contexto global actualizado');
            } else {
                console.warn('⚠️ [LIA CONTEXT] Función actualizarContextoVideo no disponible');
            }

            // 3. Verificar que el contexto se haya actualizado correctamente
            setTimeout(() => {
                const nuevoContexto = typeof window.obtenerContextoCurso === 'function' ?
                    window.obtenerContextoCurso() :
                    this.obtenerContextoFallback();

                console.log('🎯 [LIA CONTEXT] Nuevo contexto verificado:', nuevoContexto.substring(0, 150) + '...');
            }, 500);

            // 4. Notificar a LIA Chat component si existe
            if (window.LiaChat && window.LiaChat.prototype && window.LiaChat.prototype.updateContext) {
                console.log('🔄 [LIA CONTEXT] Actualizando LiaChat component...');
                // Disparar evento personalizado para actualizar LIA Chat
                const contextUpdateEvent = new CustomEvent('liaContextUpdate', {
                    detail: { timestamp: new Date().toISOString() }
                });
                document.dispatchEvent(contextUpdateEvent);
            }

            console.log('✅ [LIA CONTEXT] Contexto actualizado completamente');

        } catch (error) {
            console.error('❌ [LIA CONTEXT] Error actualizando contexto:', error);
        }
    }
    
    // Función auxiliar para obtener el ID del curso actual
    getCurrentCourseId() {
        try {
            // Intentar obtener desde el progreso del curso
            if (this.courseProgress && this.courseProgress.course_id) {
                console.log('📚 Curso desde courseProgress:', this.courseProgress.course_id);
                return this.courseProgress.course_id;
            }
            
            // Intentar obtener desde localStorage
            const courseData = localStorage.getItem('currentCourse');
            if (courseData) {
                const parsed = JSON.parse(courseData);
                console.log('📚 Curso desde localStorage:', parsed.id);
                return parsed.id;
            }
            
            // Usar el ID por defecto
            console.log('📚 Usando curso por defecto:', this.currentCourseId);
            return this.currentCourseId;
        } catch (error) {
            console.log('📚 Error obteniendo curso:', error);
            return this.currentCourseId;
        }
    }
    
    // Función auxiliar para obtener el ID del módulo actual
    getCurrentModuleId() {
        try {
            // Intentar obtener desde el progreso del curso
            if (this.courseProgress && this.courseProgress.modules) {
                const currentModule = this.courseProgress.modules.find(m => m.module_number === this.currentModule);
                if (currentModule && currentModule.id) {
                    console.log('📖 Módulo desde courseProgress:', currentModule.id);
                    return currentModule.id;
                }
            }
            
            // Intentar obtener desde localStorage
            const moduleData = localStorage.getItem('currentModule');
            if (moduleData) {
                const parsed = JSON.parse(moduleData);
                console.log('📖 Módulo desde localStorage:', parsed.id);
                return parsed.id;
            }
            
            // Usar el formato por defecto
            const defaultModuleId = `module-${this.currentModule}`;
            console.log('📖 Usando módulo por defecto:', defaultModuleId);
            return defaultModuleId;
        } catch (error) {
            console.log('📖 Error obteniendo módulo:', error);
            return `module-${this.currentModule}`;
        }
    }
    
    // Función auxiliar para obtener token de autenticación
    obtenerTokenAuth() {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Token del localStorage encontrado
            return token;
        }
        
        const devToken = 'dev-token-taller-ia-user-' + Date.now();
        console.log('[LIA] 🔧 Usando token de desarrollo:', devToken);
        return devToken;
    }
    
    // ===== PESTAÑAS DE CONTENIDO =====
    
    debugTabsImmediately() {
        console.log('🔍 === DEBUG INMEDIATO DE TABS ===');
        
        // Verificar contenedor de tabs
        const contentTabs = document.querySelector('.content-tabs');
        console.log('📦 .content-tabs encontrado:', !!contentTabs);
        
        // Verificar botones
        const allButtons = document.querySelectorAll('.tab-btn');
        console.log(`🔘 Total .tab-btn encontrados: ${allButtons.length}`);
        
        const tabButtons = document.querySelectorAll('.content-tabs .tab-btn');
        console.log(`🎯 .content-tabs .tab-btn encontrados: ${tabButtons.length}`);
        
        // Listar cada botón
        tabButtons.forEach((btn, i) => {
            console.log(`  ${i}: data-content="${btn.dataset.content}" text="${btn.textContent.trim()}"`);
        });
        
        // Verificar contenidos
        const transcriptContent = document.querySelector('[data-content="transcript"]');
        const summaryContent = document.querySelector('[data-content="summary"]');
        const communityContent = document.querySelector('[data-content="community"]');
        
        console.log('📄 Contenidos encontrados:');
        console.log(`  transcript: ${!!transcriptContent}`);
        console.log(`  summary: ${!!summaryContent}`);
        console.log(`  community: ${!!communityContent}`);
        
        // Verificar acceso a window.courseManager
        console.log('🌍 window.courseManager:', typeof window.courseManager);
        console.log('🔧 switchContentTab disponible:', typeof this.switchContentTab);
    }
    
    setupContentTabs() {
        console.log('🔧 Configurando tabs de contenido...');
        
        // Método 1: Event listeners directos
        this.configureTabButtons();
        
        // Método 2: Event delegation como backup
        this.setupTabDelegation();
        
        // Retry después de un momento si no se encontraron todos los botones
        setTimeout(() => {
            const currentButtons = document.querySelectorAll('.content-tabs .tab-btn');
            if (currentButtons.length < 3) {
                console.log('🔄 Retry: configurando tabs nuevamente...');
                this.configureTabButtons();
            }
        }, 100);
    }
    
    setupTabDelegation() {
        const contentTabs = document.querySelector('.content-tabs');
        if (!contentTabs) {
            console.error('❌ No se encontró .content-tabs para delegation');
            return;
        }
        
        console.log('🎯 Configurando event delegation para tabs...');
        
        contentTabs.addEventListener('click', (e) => {
            // Buscar el botón más cercano
            let button = e.target;
            while (button && !button.classList.contains('tab-btn')) {
                button = button.parentElement;
                if (button === contentTabs) break;
            }
            
            if (button && button.classList.contains('tab-btn')) {
                const contentType = button.dataset.content;
                console.log(`🎯 DELEGATION CLICK: ${contentType}`);
                e.preventDefault();
                e.stopPropagation();
                this.switchContentTab(contentType);
            }
        });
        
        console.log('✅ Event delegation configurado');
    }
    
    configureTabButtons() {
        const tabButtons = document.querySelectorAll('.content-tabs .tab-btn');
        console.log(`📋 Configurando ${tabButtons.length} botones de tabs`);
        
        if (tabButtons.length === 0) {
            console.error('❌ No se encontraron botones de tabs');
            return;
        }
        
        tabButtons.forEach((button, index) => {
            const contentType = button.dataset.content;
            console.log(`🔗 Configurando: ${contentType}`);
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const clickedContentType = e.currentTarget.dataset.content;
                console.log(`🔘 CLICK: ${clickedContentType}`);
                this.switchContentTab(clickedContentType);
            });
        });
        
        console.log('✅ Event listeners configurados');
    }
    
    switchContentTab(contentType) {
        console.log(`🔄 SWITCH TAB: ${contentType}`);
        
        // Remover clase active de todas las pestañas
        document.querySelectorAll('.content-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Agregar clase active a la pestaña seleccionada
        const activeTab = document.querySelector(`.content-tabs .tab-btn[data-content="${contentType}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            console.log(`✅ Tab activado: ${contentType}`);
        } else {
            console.error(`❌ No se encontró tab: ${contentType}`);
        }
        
        // Cambiar contenido
        this.updateContentArea(contentType);
        
        // ===== ACTUALIZAR CONTEXTO PARA LIA AL CAMBIAR DE TAB =====
        setTimeout(() => {
            this.actualizarContextoLIA();
        }, 500); // Pequeño delay para asegurar que el contenido se haya cambiado
    }
    
    updateContentArea(contentType) {
        console.log(`🔄 Cambiando contenido a: ${contentType}`);
        
        // Ocultar todos los contenidos (solo dentro del content-area, no los tabs)
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) {
            console.error('❌ No se encontró .content-area');
            return;
        }
        
        // Primero verificar que el contenido objetivo existe
        const targetContent = contentArea.querySelector(`[data-content="${contentType}"]`);
        if (!targetContent) {
            console.error(`❌ No se encontró contenido para: ${contentType}`);
            return;
        }
        
        // Ocultar todos los contenidos EXCEPTO el objetivo
        contentArea.querySelectorAll('[data-content]').forEach(content => {
            if (content.getAttribute('data-content') !== contentType) {
                content.style.display = 'none';
                console.log(`🔒 Ocultando: ${content.getAttribute('data-content')}`);
            }
        });
        
        // Mostrar el contenido seleccionado
        console.log(`🔍 Buscando contenido: [data-content="${contentType}"]`);
        console.log(`📍 Contenido encontrado:`, targetContent);
        
        if (targetContent) {
            const displayType = contentType === 'community' ? 'flex' : 'block';
            targetContent.style.display = displayType;
            console.log(`✅ Mostrando ${contentType} con display: ${displayType}`);
            
            // Configurar event listeners específicos si es necesario
            if (contentType === 'community') {
                console.log('🏘️ Configurando event listeners de comunidad');
                this.setupCommunityEventListeners();
                
                // Cargar preguntas de la comunidad cuando se accede a la pestaña
                setTimeout(async () => {
                    targetContent.style.display = 'flex';
                    targetContent.style.visibility = 'visible';
                    targetContent.style.opacity = '1';
                    
                    // Siempre cargar preguntas cuando se accede a la pestaña de comunidad
                    // Esto asegura que se muestren las preguntas actualizadas de la base de datos
                    if (!this.communityQuestionsLoaded) {
                        await this.loadCommunityQuestions('tab-switch-initial');
                        this.communityQuestionsLoaded = true;
                        console.log('✅ Comunidad configurada y preguntas cargadas');
                    } else {
                        // Aunque ya se hayan cargado antes, mostrar las preguntas actuales
                        console.log('🔄 Actualizando vista de comunidad con preguntas existentes...');
                        await this.loadCommunityQuestions('tab-switch-refresh');
                    }
                }, 10);
            } else if (contentType === 'activity') {
                console.log('📋 Configurando contenido de actividades');
                
                // Cargar actividades del video actual cuando se accede a la pestaña
                setTimeout(() => {
                    this.loadActivityContent();
                }, 10);
            } else if (contentType === 'summary') {
                console.log('📄 Configurando contenido de resumen');
                
                // Cargar resumen del video actual cuando se accede a la pestaña
                setTimeout(() => {
                    this.loadSummaryContent();
                }, 10);
            }
        } else {
            console.error(`❌ No se encontró contenido para: ${contentType}`);
            
            // Debug adicional: mostrar todos los elementos con data-content
            const allDataContent = contentArea.querySelectorAll('[data-content]');
            console.log('📋 Todos los elementos con data-content:');
            allDataContent.forEach(el => {
                console.log(`  - ${el.getAttribute('data-content')}: ${el.className}`);
            });
        }
        
        console.log(`📄 Contenido cambiado a: ${contentType}`);
    }
    
    // ===== FUNCIONES DE COMUNIDAD =====
    
    debugCommunitySetup() {
        console.log('🔍 Debug: Verificando elementos de comunidad...');
        
        // Verificar botón de hacer pregunta
        const askBtn = document.getElementById('askQuestionBtn');
        console.log('🔍 Botón "Hacer Pregunta":', !!askBtn);
        
        // Verificar modal
        const modal = document.getElementById('questionModal');
        console.log('🔍 Modal de pregunta:', !!modal);
        
        // Verificar formulario
        const form = document.getElementById('questionForm');
        console.log('🔍 Formulario de pregunta:', !!form);
        
        // Verificar inputs
        const titleInput = document.getElementById('questionTitle');
        const contentInput = document.getElementById('questionContent');
        console.log('🔍 Input de título:', !!titleInput);
        console.log('🔍 Input de contenido:', !!contentInput);
        
        // Verificar botón de submit
        const submitBtn = document.getElementById('submitQuestionBtn');
        console.log('🔍 Botón de submit:', !!submitBtn);
        
        // Verificar si window.chatOnline está disponible
        console.log('🔍 window.chatOnline disponible:', !!window.chatOnline);
        console.log('🔍 showQuestionModal disponible:', !!(window.chatOnline && window.chatOnline.showQuestionModal));
    }
    
    setupCommunityEventListeners() {
        // Evitar configurar múltiples veces
        if (this.communityEventListenersSetup) {
            console.log('⚠️ Event listeners de comunidad ya configurados, saltando...');
            return;
        }
        
        // Configurar usuario actual en la API
        if (window.communityAPI) {
            const currentUser = this.obtenerUsuarioActual() || this.currentUser;
            if (currentUser) {
                window.communityAPI.setCurrentUser(currentUser);
                console.log('👤 Usuario configurado en communityAPI al inicializar:', currentUser);
            }
        }
        
        // Botón para hacer pregunta - con múltiples intentos
        this.setupAskQuestionButton();
        
        // Filtros de preguntas - Unified handler with proper event delegation
        this.setupCommunityFilters();
        
        // Selector de ordenamiento
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            // Remover listener existente si existe
            if (sortSelect._communitySortHandler) {
                sortSelect.removeEventListener('change', sortSelect._communitySortHandler);
            }
            
            // Crear nuevo handler
            const handler = (e) => {
                this.sortQuestions(e.target.value);
            };
            
            // Guardar referencia al handler y agregar listener
            sortSelect._communitySortHandler = handler;
            sortSelect.addEventListener('change', handler);
        }
        
        // Modal de pregunta
        this.setupQuestionModal();
        
        // NO cargar preguntas aquí - ya se cargan en updateContentArea
        // this.loadQuestions(); // ELIMINADO para evitar carga múltiple
        
        // Debug: verificar que todo esté configurado correctamente
        this.debugCommunitySetup();
        
        // Marcar como configurado
        this.communityEventListenersSetup = true;
        
        console.log('🔧 Event listeners de comunidad configurados (primera vez)');
    }

    setupAskQuestionButton() {
        // Intentar configurar el botón con retry
        const setupButton = () => {
            const askQuestionBtn = document.getElementById('askQuestionBtn');
            if (askQuestionBtn) {
                // Remover listeners existentes para evitar duplicados
                askQuestionBtn.removeEventListener('click', this.handleAskQuestionClick);
                
                // Agregar nuevo listener
                this.handleAskQuestionClick = () => {
                    console.log('🔘 Botón "Hacer Pregunta" clickeado');
                    this.showQuestionModal();
                };
                
                askQuestionBtn.addEventListener('click', this.handleAskQuestionClick);
                console.log('✅ Event listener del botón "Hacer Pregunta" configurado');
                return true;
            }
            return false;
        };

        // Intentar inmediatamente
        if (!setupButton()) {
            // Si no funciona, intentar después de un delay
            setTimeout(() => {
                if (!setupButton()) {
                    console.warn('⚠️ No se pudo configurar el botón "Hacer Pregunta"');
                }
            }, 100);
        }
    }
    
    setupCommunityFilters() {
        console.log('🔧 Configurando filtros de comunidad...');
        
        // Use event delegation on parent container for better performance
        const communityFilters = document.querySelector('.community-filters');
        if (!communityFilters) {
            console.warn('⚠️ Container de filtros no encontrado');
            return;
        }
        
        // Remove any existing listeners
        if (communityFilters._communityFilterHandler) {
            communityFilters.removeEventListener('click', communityFilters._communityFilterHandler);
        }
        
        // Create unified click handler with event delegation
        const handler = (e) => {
            const filterTab = e.target.closest('.filter-tab');
            if (!filterTab) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Update active state visually
            document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
            filterTab.classList.add('active');
            
            // Get filter type and apply
            const filter = filterTab.getAttribute('data-filter');
            if (filter) {
                console.log(`🔍 Filtro seleccionado: ${filter}`);
                this.filterQuestions(filter);
            }
        };
        
        // Store handler reference and add listener
        communityFilters._communityFilterHandler = handler;
        communityFilters.addEventListener('click', handler);
        
        // Ensure first filter is marked as active
        const firstFilter = document.querySelector('.filter-tab[data-filter="all"]');
        if (firstFilter && !document.querySelector('.filter-tab.active')) {
            firstFilter.classList.add('active');
        }
        
        console.log('✅ Filtros de comunidad configurados correctamente');
    }
    
    showQuestionModal() {
        console.log('🔍 Intentando abrir modal de pregunta...');
        
        const modal = document.getElementById('questionModal');
        console.log('🔍 Modal encontrado:', !!modal);
        
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus en el título
            const titleInput = document.getElementById('questionTitle');
            console.log('🔍 Input de título encontrado:', !!titleInput);
            
            if (titleInput) {
                setTimeout(() => {
                    titleInput.focus();
                    console.log('✅ Focus aplicado al input de título');
                }, 100);
            }
            
            console.log('✅ Modal de pregunta abierto exitosamente');
        } else {
            console.error('❌ No se encontró el modal de pregunta');
        }
    }
    
    hideQuestionModal() {
        const modal = document.getElementById('questionModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Limpiar formulario
            this.clearQuestionForm();
        }
        
        console.log('❌ Modal de pregunta cerrado');
    }
    
    setupQuestionModal() {
        // Cerrar modal
        const closeBtn = document.getElementById('closeQuestionModal');
        const cancelBtn = document.getElementById('cancelQuestionBtn');
        const overlay = document.querySelector('.modal-overlay');
        
        [closeBtn, cancelBtn, overlay].forEach(element => {
            if (element) {
                element.addEventListener('click', () => this.hideQuestionModal());
            }
        });
        
        // Formulario de pregunta
        const questionForm = document.getElementById('questionForm');
        if (questionForm) {
            questionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitQuestion();
            });
        }
        
        // Contador de caracteres
        const titleInput = document.getElementById('questionTitle');
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                const count = titleInput.value.length;
                const counter = document.getElementById('titleCharCount');
                if (counter) {
                    counter.textContent = count;
                }
            });
        }
        
        // Manejo de tags
        const tagsInput = document.getElementById('questionTags');
        if (tagsInput) {
            tagsInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addQuestionTag(tagsInput.value.trim());
                    tagsInput.value = '';
                }
            });
        }
    }
    
    async loadQuestions(filter = 'all', sort = 'recent') {
        // FUNCIÓN DESHABILITADA - Usaba preguntas hardcodeadas
        // Redirigir a la función real que usa la base de datos
        console.log(`📋 Redirigiendo loadQuestions a loadCommunityQuestions - Filtro: ${filter}, Orden: ${sort}`);
        return this.loadCommunityQuestionsWithParams({ filter, sort });
        
        // CÓDIGO ORIGINAL COMENTADO PARA EVITAR PREGUNTAS HARDCODEADAS
        /*
        try {
            console.log(`📋 Cargando preguntas - Filtro: ${filter}, Orden: ${sort}`);
            
            // Mostrar estado de carga
            this.showQuestionsLoading();
            
            // Preguntas de demostración hardcodeadas
            const demoQuestions = [
                {
                    id: 'demo-1',
                    title: '¿Cómo implementar ChatGPT en mi empresa?',
                    content: 'Estoy buscando las mejores prácticas para integrar ChatGPT en los procesos empresariales de mi compañía. ¿Qué herramientas recomiendan y cuáles son los aspectos de seguridad más importantes a considerar?',
                    tags: ['ChatGPT', 'Empresa', 'Implementación'],
                    votes_count: 15,
                    answers_count: 8,
                    views_count: 147,
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
                    users: {
                        name: 'María González',
                        avatar_url: '/assets/images/avatars/maria.jpg'
                    }
                },
                {
                    id: 'demo-2', 
                    title: '¿Cuáles son las diferencias entre GPT-4 y Claude?',
                    content: 'He estado probando diferentes modelos de IA y me gustaría entender las principales diferencias entre GPT-4 y Claude. ¿En qué casos es mejor usar uno u otro?',
                    tags: ['GPT-4', 'Claude', 'Comparación'],
                    votes_count: 23,
                    answers_count: 12,
                    views_count: 289,
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
                    users: {
                        name: 'Carlos Martínez',
                        avatar_url: '/assets/images/avatars/carlos.jpg'
                    }
                },
                {
                    id: 'demo-3',
                    title: 'Automatización de emails con IA - ¿Es ético?',
                    content: 'Quiero implementar IA para automatizar respuestas de email, pero me preocupan las implicaciones éticas. ¿Cómo manejan ustedes la transparencia con los clientes?',
                    tags: ['Ética', 'Email', 'Automatización'],
                    votes_count: 7,
                    answers_count: 5,
                    views_count: 95,
                    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
                    users: {
                        name: 'Ana Rodríguez',
                        avatar_url: '/assets/images/avatars/ana.jpg'
                    }
                }
            ];
            
            let allQuestions = [...demoQuestions];
            
            // Asegurar que el usuario esté configurado en la API
            if (window.communityAPI) {
                const currentUser = this.obtenerUsuarioActual() || this.currentUser;
                if (currentUser) {
                    window.communityAPI.setCurrentUser(currentUser);
                    console.log('👤 Usuario configurado en communityAPI:', currentUser);
                }
            }
            
            // Intentar cargar preguntas reales de la API
            try {
                if (window.communityAPI) {
                    const response = await window.communityAPI.getQuestions({
                        filter,
                        sort,
                        course_id: this.currentCourseId,
                        module_id: this.currentModule
                    });
                    
                    if (response.success && response.data && response.data.length > 0) {
                        console.log(`✅ ${response.data.length} preguntas reales cargadas de la base de datos`);
                        // Agregar preguntas reales al inicio del array
                        allQuestions = [...response.data, ...demoQuestions];
                    } else {
                        console.log('ℹ️ API response:', response);
                    }
                } else {
                    console.warn('⚠️ window.communityAPI no disponible');
                }
            } catch (apiError) {
                console.warn('⚠️ Error al cargar preguntas de la API, usando solo preguntas de demostración:', apiError);
            }
            
            // Aplicar filtrado
            let filteredQuestions = allQuestions;
            if (filter === 'unanswered') {
                filteredQuestions = allQuestions.filter(q => (q.answers_count || 0) === 0);
            } else if (filter === 'answered') {
                filteredQuestions = allQuestions.filter(q => (q.answers_count || 0) > 0);
            }
            
            // Aplicar ordenamiento
            if (sort === 'votes') {
                filteredQuestions.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
            } else if (sort === 'answers') {
                filteredQuestions.sort((a, b) => (b.answers_count || 0) - (a.answers_count || 0));
            } else { // recent
                filteredQuestions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
            
            this.displayQuestions(filteredQuestions);
            console.log(`✅ ${filteredQuestions.length} preguntas mostradas (${allQuestions.length - demoQuestions.length} reales + ${demoQuestions.length} demo)`);
            
        } catch (error) {
            console.error('❌ Error al cargar preguntas:', error);
            this.showNotification('Error al cargar las preguntas', 'error');
            this.showQuestionsError();
        }
        */
    }

    // FUNCIONES ELIMINADAS - Duplicadas más abajo

    showQuestionsLoading() {
        const questionsContainer = document.getElementById('questionsList');
        if (questionsContainer) {
            questionsContainer.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Cargando preguntas...</p>
                </div>
            `;
        }
    }

    showQuestionsError() {
        const questionsContainer = document.getElementById('questionsList');
        if (questionsContainer) {
            questionsContainer.innerHTML = `
                <div class="error-state">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <p>Error al cargar las preguntas</p>
                    <button class="btn-secondary" onclick="window.chatOnline.loadQuestions()">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    displayQuestions(questions) {
        const questionsContainer = document.getElementById('questionsList');
        if (!questionsContainer) return;

        if (questions.length === 0) {
            questionsContainer.innerHTML = `
                <div class="empty-state">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>No hay preguntas aún</h3>
                    <p>Sé el primero en hacer una pregunta sobre este tema</p>
                    <button class="btn-primary" onclick="window.chatOnline.showQuestionModal()">
                        Hacer Primera Pregunta
                    </button>
                </div>
            `;
            return;
        }

        const questionsHTML = questions.map(question => this.createQuestionHTML(question)).join('');
        questionsContainer.innerHTML = questionsHTML;

        // Reconfigurar event listeners para los nuevos elementos
        this.setupQuestionEventListeners();
    }

    createQuestionHTML(question) {
        const timeAgo = this.getTimeAgo(question.created_at);
        const tagsHTML = question.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || '';
        
        return `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-votes">
                    <button class="vote-btn upvote" title="Votar positivamente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="18,15 12,9 6,15"/>
                        </svg>
                    </button>
                    <span class="vote-count">${question.votes_count || 0}</span>
                    <button class="vote-btn downvote" title="Votar negativamente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6,9 12,15 18,9"/>
                        </svg>
                    </button>
                </div>
                
                <div class="question-content">
                    <div class="question-header">
                        <h4 class="question-title">${this.escapeHtml(question.title)}</h4>
                        <div class="question-meta">
                            <span class="question-author">
                                <img src="${question.users?.avatar_url || '/assets/images/default-avatar.svg'}" 
                                     alt="${question.users?.name || 'Usuario'}" class="author-avatar">
                                ${question.users?.name || 'Usuario'}
                            </span>
                            <span class="question-time">${timeAgo}</span>
                        </div>
                    </div>
                    
                    <div class="question-body">
                        <p>${this.escapeHtml(question.content.substring(0, 200))}${question.content.length > 200 ? '...' : ''}</p>
                    </div>
                    
                    <div class="question-footer">
                        <div class="question-tags">
                            ${tagsHTML}
                        </div>
                        <div class="question-stats">
                            <span class="stat">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                ${question.answers_count || 0} respuestas
                            </span>
                            <span class="stat">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                ${question.views_count || 0} vistas
                            </span>
                        </div>
                        <div class="question-actions">
                            <button class="action-btn answer-btn" data-question-id="${question.id}" title="Responder pregunta">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                Responder
                            </button>
                            <button class="action-btn comment-btn" data-question-id="${question.id}" title="Comentar pregunta">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3h18v18l-3-3H3V3z"/>
                                </svg>
                                Comentar
                            </button>
                            <button class="action-btn bookmark-btn" data-question-id="${question.id}" title="Guardar pregunta">
                                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                                </svg>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupQuestionEventListeners() {
        // Votos en preguntas
        document.querySelectorAll('.question-item .vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleVote(e.target.closest('.vote-btn'));
            });
        });

        // Botones de acción - Responder
        document.querySelectorAll('.question-item .answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const questionId = btn.getAttribute('data-question-id');
                this.handleAnswer(questionId, btn);
            });
        });

        // Botones de acción - Comentar
        document.querySelectorAll('.question-item .comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const questionId = btn.getAttribute('data-question-id');
                this.handleComment(questionId, btn);
            });
        });

        // Botones de acción - Guardar/Bookmark
        document.querySelectorAll('.question-item .bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const questionId = btn.getAttribute('data-question-id');
                this.handleBookmark(questionId, btn);
            });
        });

        // Click en pregunta para ver detalles
        document.querySelectorAll('.question-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Solo mostrar detalles si no se hizo clic en ningún botón de acción
                if (!e.target.closest('.vote-btn') && 
                    !e.target.closest('.action-btn')) {
                    const questionId = item.getAttribute('data-question-id');
                    this.showQuestionDetails(questionId);
                }
            });
        });
    }

    async showQuestionDetails(questionId) {
        console.log(`📖 Mostrando detalles de pregunta: ${questionId}`);
        
        try {
            // Buscar la pregunta para toggle de expansión
            const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
            if (!questionElement) {
                console.error('❌ Elemento de pregunta no encontrado');
                return;
            }
            
            // Verificar si ya existe una sección de detalles (buscar como siguiente hermano)
            let detailsSection = questionElement.nextElementSibling;
            if (detailsSection && !detailsSection.classList.contains('question-details')) {
                detailsSection = null; // No es la sección de detalles
            }
            
            if (detailsSection) {
                // Si ya existe, toggle de visibilidad
                const isVisible = detailsSection.style.display !== 'none';
                detailsSection.style.display = isVisible ? 'none' : 'block';
                
                // Actualizar el texto del botón
                const detailsBtn = questionElement.querySelector('.details-btn');
                if (detailsBtn) {
                    detailsBtn.textContent = isVisible ? 'Ver detalles' : 'Ocultar detalles';
                }
                
                if (isVisible) return; // Si se está ocultando, no cargar datos
            } else {
                // Crear sección de detalles si no existe
                detailsSection = document.createElement('div');
                detailsSection.className = 'question-details';
                detailsSection.style.display = 'block';
                detailsSection.innerHTML = `
                    <div class="details-loading">
                        <div class="loading-spinner"></div>
                        Cargando respuestas y comentarios...
                    </div>
                `;
                
                // Insertar DESPUÉS del questionElement (como siguiente hermano)
                questionElement.parentNode.insertBefore(detailsSection, questionElement.nextSibling);
                
                // Actualizar el texto del botón
                const detailsBtn = questionElement.querySelector('.details-btn');
                if (detailsBtn) {
                    detailsBtn.textContent = 'Ocultar detalles';
                }
            }
            
            // Cargar respuestas y comentarios
            console.log('🔄 Cargando respuestas y comentarios...');
            
            const [answersResponse, commentsResponse] = await Promise.all([
                window.communityAPI.getQuestionAnswers(questionId, 'votes'),
                window.communityAPI.getComments('question', questionId)
            ]);
            
            // Verificar respuestas exitosas
            if (!answersResponse.success) {
                throw new Error(answersResponse.error || 'Error cargando respuestas');
            }
            
            if (!commentsResponse.success) {
                throw new Error(commentsResponse.error || 'Error cargando comentarios');
            }
            
            const answers = answersResponse.data || [];
            const comments = commentsResponse.data || [];
            
            console.log(`✅ Cargados: ${answers.length} respuestas, ${comments.length} comentarios`);
            
            // Generar HTML para respuestas y comentarios
            const detailsHTML = this.generateQuestionDetailsHTML(answers, comments);
            detailsSection.innerHTML = detailsHTML;
            
            // Configurar event listeners para votos en respuestas y comentarios
            this.setupDetailsEventListeners(detailsSection);
            
        } catch (error) {
            console.error('❌ Error cargando detalles de pregunta:', error);
            
            // Mostrar error en la sección de detalles si existe (como hermano siguiente)
            const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
            const detailsSection = questionElement ? questionElement.nextElementSibling : null;
            if (detailsSection && detailsSection.classList.contains('question-details')) {
                detailsSection.innerHTML = `
                    <div class="details-error">
                        <p>❌ Error cargando los detalles: ${error.message}</p>
                        <button class="retry-btn" onclick="window.chatOnline.showQuestionDetails('${questionId}')">
                            Reintentar
                        </button>
                    </div>
                `;
            }
            
            this.showNotification('Error cargando detalles de la pregunta', 'error');
        }
    }

    generateQuestionDetailsHTML(answers, comments) {
        const answersHTML = answers.length > 0 ? answers.map(answer => `
            <div class="answer-item" data-answer-id="${answer.id}">
                <div class="answer-header">
                    <div class="answer-author">
                        <img src="${answer.author.avatar_url}" alt="${answer.author.name}" class="author-avatar">
                        <span class="author-name">${this.escapeHtml(answer.author.name)}</span>
                        <span class="answer-time">${this.getTimeAgo(answer.created_at)}</span>
                        ${answer.is_accepted ? '<span class="accepted-badge">✓ Respuesta aceptada</span>' : ''}
                    </div>
                </div>
                <div class="answer-content">
                    <p>${this.escapeHtml(answer.content)}</p>
                </div>
                <div class="answer-actions">
                    <div class="vote-controls">
                        <button class="vote-btn upvote" data-target-type="answer" data-target-id="${answer.id}" title="Voto positivo">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m18 15-6-6-6 6"/>
                            </svg>
                        </button>
                        <span class="vote-count">${answer.votes_count || 0}</span>
                        <button class="vote-btn downvote" data-target-type="answer" data-target-id="${answer.id}" title="Voto negativo">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m6 9 6 6 6-6"/>
                            </svg>
                        </button>
                    </div>
                    <button class="action-btn comment-btn" data-answer-id="${answer.id}" title="Comentar respuesta">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Comentar
                    </button>
                </div>
            </div>
        `).join('') : '<p class="no-answers">No hay respuestas aún. ¡Sé el primero en responder!</p>';
        
        const commentsHTML = comments.length > 0 ? comments.map(comment => `
            <div class="comment-item" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <img src="${comment.author.avatar_url}" alt="${comment.author.name}" class="author-avatar-sm">
                    <span class="author-name">${this.escapeHtml(comment.author.name)}</span>
                    <span class="comment-time">${this.getTimeAgo(comment.created_at)}</span>
                </div>
                <div class="comment-content">
                    <p>${this.escapeHtml(comment.content)}</p>
                </div>
                <div class="comment-actions">
                    <div class="vote-controls-sm">
                        <button class="vote-btn-sm upvote" data-target-type="comment" data-target-id="${comment.id}" title="Voto positivo">
                            <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m18 15-6-6-6 6"/>
                            </svg>
                        </button>
                        <span class="vote-count-sm">${comment.votes_count || 0}</span>
                        <button class="vote-btn-sm downvote" data-target-type="comment" data-target-id="${comment.id}" title="Voto negativo">
                            <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m6 9 6 6 6-6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('') : '<p class="no-comments">No hay comentarios aún.</p>';
        
        return `
            <div class="question-details-content">
                <div class="details-header">
                    <h3 class="details-main-title">Detalles de la Pregunta</h3>
                    <button class="close-details-btn" title="Cerrar detalles">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                
                <div class="details-section answers-section">
                    <h4 class="section-title">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Respuestas (${answers.length})
                        <div class="sort-options">
                            <select class="sort-select" data-section="answers">
                                <option value="votes">Por votos</option>
                                <option value="recent">Más recientes</option>
                                <option value="oldest">Más antiguas</option>
                            </select>
                        </div>
                    </h4>
                    <div class="answers-list">
                        ${answersHTML}
                    </div>
                </div>
                
                <div class="details-section comments-section">
                    <h4 class="section-title">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                        Comentarios (${comments.length})
                    </h4>
                    <div class="comments-list">
                        ${commentsHTML}
                    </div>
                </div>
            </div>
        `;
    }
    
    setupDetailsEventListeners(detailsSection) {
        // Event listener para botón de cerrar detalles
        const closeBtn = detailsSection.querySelector('.close-details-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Colapsar la sección de detalles
                detailsSection.style.display = 'none';
                detailsSection.classList.remove('expanded');
            });
        }
        
        // Event listeners para votos en respuestas
        detailsSection.querySelectorAll('.answer-item .vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleVote(btn);
            });
        });
        
        // Event listeners para votos en comentarios  
        detailsSection.querySelectorAll('.comment-item .vote-btn-sm').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleVote(btn);
            });
        });
        
        // Event listeners para comentar respuestas
        detailsSection.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const answerId = btn.getAttribute('data-answer-id');
                if (answerId) {
                    this.showCommentModal(answerId, 'answer');
                }
            });
        });
        
        // Event listeners para ordenamiento
        detailsSection.querySelectorAll('.sort-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const section = e.target.getAttribute('data-section');
                const sortBy = e.target.value;
                
                // Obtener el question ID del elemento padre
                const questionElement = detailsSection.closest('[data-question-id]');
                const questionId = questionElement?.getAttribute('data-question-id');
                
                if (questionId) {
                    // Recargar la sección con nuevo ordenamiento
                    this.reloadQuestionSection(questionId, section, sortBy);
                }
            });
        });
    }
    
    async reloadQuestionSection(questionId, section, sortBy) {
        console.log(`🔄 Recargando sección ${section} con orden: ${sortBy}`);
        
        try {
            let data = [];
            let containerSelector = '';
            
            if (section === 'answers') {
                const response = await window.communityAPI.getQuestionAnswers(questionId, sortBy);
                if (response.success) {
                    data = response.data || [];
                    containerSelector = '.answers-list';
                }
            } else if (section === 'comments') {
                const response = await window.communityAPI.getComments('question', questionId);
                if (response.success) {
                    data = response.data || [];
                    containerSelector = '.comments-list';
                }
            }
            
            // Actualizar el HTML de la sección específica
            const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
            const container = questionElement.querySelector(containerSelector);
            
            if (container && data) {
                if (section === 'answers') {
                    container.innerHTML = data.length > 0 ? data.map(answer => `
                        <div class="answer-item" data-answer-id="${answer.id}">
                            <!-- HTML de respuesta como arriba -->
                        </div>
                    `).join('') : '<p class="no-answers">No hay respuestas aún.</p>';
                } else if (section === 'comments') {
                    container.innerHTML = data.length > 0 ? data.map(comment => `
                        <div class="comment-item" data-comment-id="${comment.id}">
                            <!-- HTML de comentario como arriba -->
                        </div>
                    `).join('') : '<p class="no-comments">No hay comentarios aún.</p>';
                }
                
                // Reconfigurar event listeners para los nuevos elementos
                const detailsSection = questionElement.querySelector('.question-details');
                this.setupDetailsEventListeners(detailsSection);
            }
            
        } catch (error) {
            console.error('❌ Error recargando sección:', error);
            this.showNotification('Error recargando contenido', 'error');
        }
    }

    // ===== FUNCIONES DE MANEJO DE ACCIONES =====

    // FUNCIÓN ELIMINADA - Usar handleVote async que está más abajo

    handleAnswer(questionId, answerBtn) {
        console.log('💬 Manejando respuesta...');
        console.log(`💬 Responder a pregunta: ${questionId}`);
        
        // Feedback visual
        answerBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            answerBtn.style.transform = '';
        }, 150);
        
        this.showAnswerModal(questionId);
    }

    handleComment(questionId, commentBtn) {
        console.log('💭 Manejando comentario...');
        console.log(`💭 Comentar pregunta: ${questionId}`);
        
        // Feedback visual
        commentBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            commentBtn.style.transform = '';
        }, 150);
        
        this.showCommentModal(questionId);
    }

    async handleBookmark(questionId, bookmarkBtn) {
        console.log('🔖 Manejando bookmark...');
        console.log(`🔖 Guardar/quitar pregunta: ${questionId}`);
        
        const isBookmarked = bookmarkBtn.classList.contains('bookmarked');
        
        try {
            // Deshabilitar botón mientras se procesa
            bookmarkBtn.disabled = true;
            
            // Llamar al backend para toggle bookmark
            const response = await window.communityAPI.toggleBookmark(questionId);
            
            if (response.success) {
                // Actualizar UI basado en la respuesta del backend
                const newIsBookmarked = response.data.action === 'created';
                
                if (newIsBookmarked) {
                    bookmarkBtn.classList.add('bookmarked');
                    bookmarkBtn.innerHTML = `
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                        Guardado
                    `;
                    this.showNotification('Pregunta guardada en favoritos', 'success');
                } else {
                    bookmarkBtn.classList.remove('bookmarked');
                    bookmarkBtn.innerHTML = `
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                        Guardar
                    `;
                    this.showNotification('Pregunta removida de favoritos', 'info');
                }
            } else {
                throw new Error(response.error || 'Error al procesar bookmark');
            }
            
        } catch (error) {
            console.error('❌ Error al manejar bookmark:', error);
            this.showNotification('Error al procesar bookmark. Intenta de nuevo.', 'error');
            
        } finally {
            // Restaurar botón
            bookmarkBtn.disabled = false;
        }
    }

    // ===== FUNCIONES DE MODALES =====

    showAnswerModal(questionId) {
        console.log(`📝 Mostrando modal de respuesta para pregunta: ${questionId}`);
        
        // Buscar la pregunta para mostrar contexto
        const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
        if (!questionElement) {
            this.showNotification('Error: No se pudo encontrar la pregunta', 'error');
            return;
        }

        // Obtener datos de la pregunta
        const title = questionElement.querySelector('.question-title')?.textContent || 'Pregunta';
        const content = this.getQuestionFullContent(questionId) || 'Contenido no disponible';
        const author = questionElement.querySelector('.question-author')?.textContent || 'Usuario';
        const time = questionElement.querySelector('.question-time')?.textContent || 'hace un momento';

        // Configurar contexto en el modal
        const contextElement = document.getElementById('answerQuestionContext');
        contextElement.innerHTML = `
            <h4>${this.escapeHtml(title)}</h4>
            <p>${this.escapeHtml(content)}</p>
            <div class="question-context-meta">
                <span class="question-context-author">
                    <img src="${this.getQuestionAuthorAvatar(questionId)}" alt="Usuario">
                    ${this.escapeHtml(author)}
                </span>
                <span>${time}</span>
            </div>
        `;

        // Mostrar modal
        const modal = document.getElementById('answerModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Limpiar formulario
        document.getElementById('answerContent').value = '';

        // Guardar questionId para usar al enviar
        modal.setAttribute('data-question-id', questionId);

        // Focus en el textarea
        setTimeout(() => {
            document.getElementById('answerContent').focus();
        }, 100);

        // Configurar event listeners si no están configurados
        this.setupAnswerModalListeners();
    }

    showCommentModal(targetId, targetType = 'question') {
        console.log(`💭 Mostrando modal de comentario para ${targetType}: ${targetId}`);
        
        let contextHTML = '';
        let modalTitle = '';
        
        if (targetType === 'question') {
            // Buscar la pregunta para mostrar contexto
            const questionElement = document.querySelector(`[data-question-id="${targetId}"]`);
            if (!questionElement) {
                this.showNotification('Error: No se pudo encontrar la pregunta', 'error');
                return;
            }

            // Obtener datos de la pregunta
            const title = questionElement.querySelector('.question-title')?.textContent || 'Pregunta';
            const content = this.getQuestionFullContent(targetId) || 'Contenido no disponible';
            const author = questionElement.querySelector('.question-author')?.textContent || 'Usuario';
            const time = questionElement.querySelector('.question-time')?.textContent || 'hace un momento';

            modalTitle = 'Comentar Pregunta';
            contextHTML = `
                <h4>${this.escapeHtml(title)}</h4>
                <p>${this.escapeHtml(content)}</p>
                <div class="question-context-meta">
                    <span class="question-context-author">
                        <img src="${this.getQuestionAuthorAvatar(targetId)}" alt="Usuario">
                        ${this.escapeHtml(author)}
                    </span>
                    <span>${time}</span>
                </div>
            `;
        } else if (targetType === 'answer') {
            // Buscar la respuesta para mostrar contexto
            const answerElement = document.querySelector(`[data-answer-id="${targetId}"]`);
            if (!answerElement) {
                this.showNotification('Error: No se pudo encontrar la respuesta', 'error');
                return;
            }

            // Obtener datos de la respuesta
            const content = answerElement.querySelector('.answer-content p')?.textContent || 'Contenido no disponible';
            const author = answerElement.querySelector('.author-name')?.textContent || 'Usuario';
            const time = answerElement.querySelector('.answer-time')?.textContent || 'hace un momento';
            const avatar = answerElement.querySelector('.author-avatar')?.src || '/assets/images/default-avatar.svg';

            modalTitle = 'Comentar Respuesta';
            contextHTML = `
                <h4>Respuesta de ${this.escapeHtml(author)}</h4>
                <p>${this.escapeHtml(content)}</p>
                <div class="question-context-meta">
                    <span class="question-context-author">
                        <img src="${avatar}" alt="Usuario">
                        ${this.escapeHtml(author)}
                    </span>
                    <span>${time}</span>
                </div>
            `;
        }

        // Actualizar el título del modal
        const modalHeader = document.querySelector('#commentModal .modal-header h3');
        if (modalHeader) {
            modalHeader.innerHTML = `
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                ${modalTitle}
            `;
        }

        // Configurar contexto en el modal
        const contextElement = document.getElementById('commentQuestionContext');
        contextElement.innerHTML = contextHTML;

        // Mostrar modal
        const modal = document.getElementById('commentModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Limpiar formulario
        document.getElementById('commentContent').value = '';

        // Guardar datos para usar al enviar
        modal.setAttribute('data-target-id', targetId);
        modal.setAttribute('data-target-type', targetType);

        // Focus en el textarea
        setTimeout(() => {
            document.getElementById('commentContent').focus();
        }, 100);

        // Configurar event listeners si no están configurados
        this.setupCommentModalListeners();
    }

    getQuestionFullContent(questionId) {
        // Buscar en las preguntas cargadas el contenido completo
        // Por ahora usar el contenido parcial visible
        const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
        const preview = questionElement.querySelector('.question-preview, .question-body')?.textContent;
        return preview || 'Contenido no disponible';
    }

    getQuestionAuthorAvatar(questionId) {
        const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
        const avatar = questionElement.querySelector('.author-avatar, .question-author img')?.src;
        return avatar || '../../assets/images/default-avatar.svg';
    }

    setupAnswerModalListeners() {
        if (this.answerModalListenersSetup) return;

        // Botón cerrar
        document.getElementById('closeAnswerModal').addEventListener('click', () => {
            this.hideAnswerModal();
        });

        // Botón cancelar
        document.getElementById('cancelAnswerBtn').addEventListener('click', () => {
            this.hideAnswerModal();
        });

        // Overlay
        document.querySelector('#answerModal .modal-overlay').addEventListener('click', () => {
            this.hideAnswerModal();
        });

        // Formulario
        document.getElementById('answerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAnswer();
        });

        this.answerModalListenersSetup = true;
    }

    setupCommentModalListeners() {
        if (this.commentModalListenersSetup) return;

        // Botón cerrar
        document.getElementById('closeCommentModal').addEventListener('click', () => {
            this.hideCommentModal();
        });

        // Botón cancelar
        document.getElementById('cancelCommentBtn').addEventListener('click', () => {
            this.hideCommentModal();
        });

        // Overlay
        document.querySelector('#commentModal .modal-overlay').addEventListener('click', () => {
            this.hideCommentModal();
        });

        // Formulario
        document.getElementById('commentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });

        this.commentModalListenersSetup = true;
    }

    hideAnswerModal() {
        const modal = document.getElementById('answerModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    hideCommentModal() {
        const modal = document.getElementById('commentModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'hace un momento';
        if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============ FUNCIONES DE MANEJO DE ESTADOS DE COMUNIDAD ============
    
    showCommunityLoading() {
        const questionsList = document.getElementById('questionsList');
        if (questionsList) {
            questionsList.innerHTML = `
                <div class="community-loading">
                    <div class="loading-spinner"></div>
                    <p>Cargando preguntas de la comunidad...</p>
                </div>
            `;
        }
    }

    showCommunityError(message) {
        const questionsList = document.getElementById('questionsList');
        if (questionsList) {
            questionsList.innerHTML = `
                <div class="community-error">
                    <div class="error-icon">⚠️</div>
                    <h3>Error al cargar preguntas</h3>
                    <p>${message}</p>
                    <button onclick="window.chatOnline.loadCommunityQuestions('retry-button')" class="retry-btn">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    showCommunityEmpty() {
        const questionsList = document.getElementById('questionsList');
        if (questionsList) {
            questionsList.innerHTML = `
                <div class="community-empty">
                    <div class="empty-icon">💬</div>
                    <h3>No hay preguntas aún</h3>
                    <p>Sé el primero en hacer una pregunta sobre este módulo</p>
                    <button onclick="window.chatOnline.showAskQuestionForm()" class="ask-question-btn">
                        Hacer Pregunta
                    </button>
                </div>
            `;
        }
    }

    renderCommunityQuestions(questions) {
        const questionsList = document.getElementById('questionsList');
        if (!questionsList) {
            console.error('❌ Elemento questionsList no encontrado');
            return;
        }
        
        if (!questions || questions.length === 0) {
            this.showCommunityEmpty();
            return;
        }
        
        console.log('🎨 Renderizando preguntas:', questions.length);
        
        const questionsHTML = questions.map(question => {
            const author = question.users || { display_name: 'Usuario', username: 'usuario' };
            const timeAgo = this.formatTimeAgo(question.created_at);
            
            return `
                <div class="question-card" data-question-id="${question.id}">
                    <div class="question-header">
                        <div class="question-meta">
                            <span class="question-author">${author.display_name || author.username}</span>
                            <span class="question-time">${timeAgo}</span>
                        </div>
                        <div class="question-stats">
                            <span class="question-answers">${question.answers_count || 0} respuestas</span>
                            <span class="question-views">${question.views_count || 0} vistas</span>
                        </div>
                    </div>
                    <h3 class="question-title">${question.title}</h3>
                    <p class="question-content">${question.content}</p>
                    <div class="question-tags">
                        ${(question.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="question-actions">
                        <button class="action-btn" onclick="window.chatOnline.viewQuestion('${question.id}')">
                            Ver Pregunta
                        </button>
                        <button class="action-btn" onclick="window.chatOnline.bookmarkQuestion('${question.id}')">
                            Guardar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        questionsList.innerHTML = questionsHTML;
        console.log('✅ Preguntas renderizadas correctamente');
    }

    // ============ FUNCIONES DE INTERACCIÓN DE COMUNIDAD ============
    
    showAskQuestionForm() {
        // Mostrar el modal para hacer una pregunta
        if (typeof this.showQuestionModal === 'function') {
            this.showQuestionModal();
        } else {
            // Fallback: buscar el botón en el DOM
            const askBtn = document.querySelector('[onclick*="showQuestionModal"]');
            if (askBtn) {
                askBtn.click();
            } else {
                console.warn('⚠️ Modal de pregunta no encontrado');
                this.showNotification('Formulario de preguntas no disponible', 'warning');
            }
        }
    }

    viewQuestion(questionId) {
        console.log('👁️ Viendo pregunta:', questionId);
        
        // Buscar la pregunta en los datos cargados
        const questionCard = document.querySelector(`[data-question-id="${questionId}"]`);
        if (questionCard) {
            // Expandir la pregunta o mostrar modal detallado
            questionCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            questionCard.style.background = 'rgba(68, 229, 255, 0.1)';
            questionCard.style.borderColor = 'var(--glass-primary)';
            
            // Quitar resaltado después de 2 segundos
            setTimeout(() => {
                questionCard.style.background = '';
                questionCard.style.borderColor = '';
            }, 2000);
            
            // TODO: Implementar modal de vista detallada si es necesario
            this.showNotification('Pregunta resaltada', 'info');
        } else {
            console.warn('⚠️ Pregunta no encontrada:', questionId);
            this.showNotification('Pregunta no encontrada', 'warning');
        }
    }

    bookmarkQuestion(questionId) {
        console.log('🔖 Guardando pregunta:', questionId);
        
        // Obtener bookmarks del localStorage
        let bookmarks = JSON.parse(localStorage.getItem('communityBookmarks') || '[]');
        
        if (bookmarks.includes(questionId)) {
            // Ya está guardada, remover
            bookmarks = bookmarks.filter(id => id !== questionId);
            this.showNotification('Pregunta removida de guardados', 'info');
        } else {
            // Agregar a bookmarks
            bookmarks.push(questionId);
            this.showNotification('Pregunta guardada', 'success');
        }
        
        // Guardar en localStorage
        localStorage.setItem('communityBookmarks', JSON.stringify(bookmarks));
        
        // Actualizar UI del botón si existe
        const questionCard = document.querySelector(`[data-question-id="${questionId}"]`);
        if (questionCard) {
            const bookmarkBtn = questionCard.querySelector('[onclick*="bookmarkQuestion"]');
            if (bookmarkBtn) {
                bookmarkBtn.textContent = bookmarks.includes(questionId) ? '⭐ Guardado' : 'Guardar';
            }
        }
    }

    // Función para mostrar notificaciones (wrapper para la función global)
    showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`📢 [${type.toUpperCase()}] ${message}`);
        }
    }

    // ============ FUNCIONES AUXILIARES PARA NETLIFY ============
    
    isNetlify() {
        // Detectar si estamos en Netlify
        return window.location.hostname.includes('netlify') || 
               window.location.hostname.includes('.app') ||
               (typeof process !== 'undefined' && process?.env?.NETLIFY === 'true');
    }

    async waitForSupabase(maxWaitTime = 5000) {
        console.log(`⏳ Esperando Supabase por ${maxWaitTime}ms...`);
        
        return new Promise((resolve) => {
            let elapsed = 0;
            const interval = 100;
            
            const checkSupabase = setInterval(() => {
                elapsed += interval;
                
                if (window.supabase) {
                    console.log(`✅ Supabase disponible después de ${elapsed}ms`);
                    clearInterval(checkSupabase);
                    resolve(true);
                } else if (elapsed >= maxWaitTime) {
                    console.warn(`⚠️ Timeout esperando Supabase después de ${elapsed}ms`);
                    clearInterval(checkSupabase);
                    resolve(false);
                }
            }, interval);
        });
    }

    setupSupabaseEventListeners() {
        // Escuchar eventos de Supabase
        window.addEventListener('supabaseReady', (event) => {
            console.log('🎉 Supabase listo, recargando preguntas...');
            if (!this.communityQuestionsLoaded) {
                this.loadCommunityQuestions('supabase-ready');
            }
        });

        window.addEventListener('supabaseFallback', (event) => {
            console.log('⚠️ Modo fallback de Supabase activado');
            // Usar otros métodos de carga
            this.loadCommunityQuestionsWithFallback();
        });
    }
    
    async handleVote(voteBtn) {
        if (!voteBtn) return;
        
        const isUpvote = voteBtn.classList.contains('upvote');
        const isSmallBtn = voteBtn.classList.contains('vote-btn-sm');
        
        // Determinar el tipo de elemento y su ID
        let targetType, targetId, voteCountEl;
        
        // Para elementos en detalles (respuestas/comentarios) que usan data attributes
        if (voteBtn.hasAttribute('data-target-type') && voteBtn.hasAttribute('data-target-id')) {
            targetType = voteBtn.getAttribute('data-target-type');
            targetId = voteBtn.getAttribute('data-target-id');
            voteCountEl = voteBtn.parentElement.querySelector(isSmallBtn ? '.vote-count-sm' : '.vote-count');
        } else {
            // Para preguntas principales
            const questionItem = voteBtn.closest('.question-item');
            targetType = 'question';
            targetId = questionItem?.getAttribute('data-question-id');
            voteCountEl = voteBtn.parentElement.querySelector('.vote-count');
        }
        
        if (!targetId) {
            console.error('❌ No se encontró ID del elemento');
            return;
        }
        
        console.log(`🗳️ Votando en ${targetType} ${targetId}`);

        try {
            // Mostrar estado de carga
            voteBtn.disabled = true;
            voteBtn.classList.add('loading');

            // Determinar tipo de voto
            const voteType = isUpvote ? 'upvote' : 'downvote';
            
            // Llamar a la API
            const response = await window.communityAPI.vote(targetType, targetId, voteType);
            
            if (response.success) {
                // Actualizar UI basado en la respuesta
                await this.updateVoteUI(voteBtn, response.data, voteCountEl, targetType, targetId);
                console.log(`✅ Voto ${response.data.action} exitosamente`);
                
                // Mostrar notificación de éxito
                const actionText = response.data.action === 'removed' ? 'removido' : 
                                 response.data.action === 'updated' ? 'actualizado' : 'registrado';
                this.showNotification(`Voto ${actionText}`, 'success');
            }
            
        } catch (error) {
            console.error('❌ Error al votar:', error);
            this.showNotification('Error al procesar el voto', 'error');
        } finally {
            // Restaurar estado del botón
            voteBtn.disabled = false;
            voteBtn.classList.remove('loading');
        }
    }

    async updateVoteUI(voteBtn, voteData, voteCountEl, targetType, targetId) {
        const isUpvote = voteBtn.classList.contains('upvote');
        const isSmallBtn = voteBtn.classList.contains('vote-btn-sm');
        
        // Buscar botón opuesto
        const oppositeBtn = isUpvote ? 
            voteBtn.parentElement.querySelector(isSmallBtn ? '.downvote' : '.downvote') : 
            voteBtn.parentElement.querySelector(isSmallBtn ? '.upvote' : '.upvote');
        
        // Limpiar estados previos de ambos botones
        voteBtn.classList.remove('voted');
        if (oppositeBtn) oppositeBtn.classList.remove('voted');
        
        // Aplicar nuevo estado visual
        if (voteData.action === 'created' || voteData.action === 'updated') {
            voteBtn.classList.add('voted');
        }
        
        // IMPORTANTE: Obtener contador real del servidor en lugar de calcular localmente
        try {
            const realCount = await this.getRealVoteCount(targetType, targetId);
            if (voteCountEl && realCount !== null) {
                voteCountEl.textContent = realCount;
                console.log(`📊 Contador actualizado desde servidor: ${realCount}`);
            }
        } catch (error) {
            console.error('❌ Error obteniendo contador real:', error);
            // Fallback: no actualizar el contador si falla
        }
    }
    
    // Nueva función para obtener el contador real de votos
    async getRealVoteCount(targetType, targetId) {
        try {
            if (targetType === 'question') {
                const response = await fetch(`/api/community/questions/${targetId}`);
                if (response.ok) {
                    const data = await response.json();
                    return data.data?.votes_count || 0;
                }
            } else if (targetType === 'answer' || targetType === 'comment') {
                // Para respuestas y comentarios, recargar la sección de detalles
                // Buscar la pregunta padre para recargar toda la sección
                const detailsSection = document.querySelector('.question-details');
                if (detailsSection) {
                    const questionId = detailsSection.getAttribute('data-question-id');
                    if (questionId) {
                        console.log(`🔄 Recargando detalles de pregunta ${questionId} después de voto en ${targetType}`);
                        // Pequeño delay para dar tiempo a que el servidor actualice
                        setTimeout(() => {
                            this.reloadQuestionSection(questionId, 'votes');
                        }, 500);
                    }
                }
                return null; // No actualizar localmente, se recarga la sección
            }
        } catch (error) {
            console.error('❌ Error obteniendo contador de votos:', error);
        }
        return null;
    }
    
    
    clearQuestionForm() {
        const titleInput = document.getElementById('questionTitle');
        const contentInput = document.getElementById('questionContent');
        const tagsInput = document.getElementById('questionTags');
        const selectedTags = document.getElementById('selectedTags');
        const charCounter = document.getElementById('titleCharCount');
        
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';
        if (tagsInput) tagsInput.value = '';
        if (selectedTags) selectedTags.innerHTML = '';
        if (charCounter) charCounter.textContent = '0';
        
        this.questionTags = [];
    }
    
    addQuestionTag(tag) {
        if (!tag || this.questionTags.includes(tag)) return;
        
        this.questionTags = this.questionTags || [];
        this.questionTags.push(tag);
        
        const tagsContainer = document.getElementById('selectedTags');
        if (tagsContainer) {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag}
                <button class="tag-remove" onclick="window.chatOnline.removeQuestionTag('${tag}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;
            tagsContainer.appendChild(tagElement);
        }
    }
    
    removeQuestionTag(tag) {
        this.questionTags = this.questionTags.filter(t => t !== tag);
        
        // Actualizar UI
        const tagsContainer = document.getElementById('selectedTags');
        if (tagsContainer) {
            const tagElements = tagsContainer.querySelectorAll('.tag-item');
            tagElements.forEach(element => {
                if (element.textContent.trim().startsWith(tag)) {
                    element.remove();
                }
            });
        }
    }
    
    getSelectedTags() {
        return this.questionTags || [];
    }
    
    showNotification(message, type = 'info') {
        // Crear notificación toast
        const notification = document.createElement('div');
        notification.className = `notification toast ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
        
        // Cerrar manualmente
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => notification.remove());
        }
    }

    // ===== NOTAS =====
    setupNotes() {
        console.log('📝 Configurando notas...');

        // Usar setTimeout para asegurar que el DOM esté listo
        setTimeout(() => {
            console.log('🔧 Iniciando configuración de notas después del timeout');
            this.initializeNotesButtons();
            console.log('🔧 Llamando loadNotesList() desde setupNotes()');
            this.loadNotesList(); // Cargar notas existentes al inicializar
        }, 100);
    }
    
    initializeNotesButtons() {
        console.log('🔧 Inicializando botones de notas...');
        
        const addNoteBtn = document.getElementById('addNoteBtn');
        const searchNotesBtn = document.getElementById('searchNotesBtn');
        const collapseNotesBtn = document.getElementById('collapseNotes');
        
        console.log('Botones encontrados:', {
            addNoteBtn: !!addNoteBtn,
            searchNotesBtn: !!searchNotesBtn,
            collapseNotesBtn: !!collapseNotesBtn
        });
        
        if (addNoteBtn) {
            // Remover event listeners existentes para evitar duplicados
            addNoteBtn.removeEventListener('click', this.handleAddNoteClick);
            
            // Crear función bound para poder removerla después
            this.handleAddNoteClick = () => {
                console.log('🖱️ Click en botón añadir nota detectado');
                this.addNewNote();
            };
            
            addNoteBtn.addEventListener('click', this.handleAddNoteClick);
            console.log('✅ Event listener de addNoteBtn configurado');
        } else {
            console.error('❌ Botón addNoteBtn no encontrado');
        }
        
        if (searchNotesBtn) {
            searchNotesBtn.removeEventListener('click', this.handleSearchNotesClick);
            this.handleSearchNotesClick = () => {
                console.log('🔍 Click en botón buscar notas detectado');
                this.searchNotes();
            };
            searchNotesBtn.addEventListener('click', this.handleSearchNotesClick);
            console.log('✅ Event listener de searchNotesBtn configurado');
        } else {
            console.error('❌ Botón searchNotesBtn no encontrado');
        }
        
        if (collapseNotesBtn) {
            collapseNotesBtn.removeEventListener('click', this.handleCollapseNotesClick);
            this.handleCollapseNotesClick = () => {
                console.log('📁 Click en botón colapsar notas detectado');
                this.toggleNotesCollapse();
            };
            collapseNotesBtn.addEventListener('click', this.handleCollapseNotesClick);
            console.log('✅ Event listener de collapseNotesBtn configurado');
        } else {
            console.error('❌ Botón collapseNotesBtn no encontrado');
        }
    }
    
    addNewNote() {
        console.log('📝 Abriendo editor de notas...');
        this.showNotesCreator();
    }
    
    showNotesCreator() {
        console.log('🎨 Mostrando creador de notas...');
        
        const notesCreator = document.getElementById('notesCreatorSection');
        const titleInput = document.getElementById('noteTitleInputCreator');
        const contentEditor = document.getElementById('noteContentEditor');
        const tagsInput = document.getElementById('tagsInput');
        
        // Ocultar el editor overlay existente para evitar superposiciones
        const notePanelOverlay = document.getElementById('notePanelOverlay');
        if (notePanelOverlay) {
            notePanelOverlay.style.display = 'none';
        }
        
        // Verificar que todos los elementos existen
        if (!notesCreator) {
            console.error('❌ Sección notesCreatorSection no encontrada');
            this.showNotification('Error: No se pudo abrir el editor de notas', 'error');
            return;
        }
        
        if (!titleInput) {
            console.error('❌ Input de título no encontrado');
        }
        
        if (!contentEditor) {
            console.error('❌ Editor de contenido no encontrado');
        }
        
        if (!tagsInput) {
            console.error('❌ Input de etiquetas no encontrado');
        }
        
        // Mostrar el editor y agregar clase active
        notesCreator.style.display = 'block';
        notesCreator.classList.add('active');
        
        // Limpiar campos solo si no estamos editando una nota existente
        if (!this.currentEditingNoteId) {
            if (titleInput) titleInput.value = '';
            if (contentEditor) contentEditor.innerHTML = '';
            if (tagsInput) tagsInput.value = '';
            this.clearTags();
        }
        
        // Enfocar el título después de un pequeño delay
        setTimeout(() => {
            if (titleInput) {
                titleInput.focus();
                console.log('✅ Título enfocado');
            }
        }, 100);
        
        // Configurar event listeners del editor si no están configurados
        this.setupNotesEditor();
        
        console.log('✅ Editor de notas abierto correctamente');
    }
    
    hideNotesCreator() {
        const notesCreator = document.getElementById('notesCreatorSection');
        if (notesCreator) {
        notesCreator.style.display = 'none';
        notesCreator.classList.remove('active');
        }
        
        // Limpiar ID de edición
        this.currentEditingNoteId = null;
        
        console.log('❌ Editor de notas cerrado');
    }
    

    
    saveNote() {
        const titleInput = document.getElementById('noteTitleInputCreator');
        const contentEditor = document.getElementById('noteContentEditor');
        
        const title = titleInput.value.trim();
        const content = contentEditor.innerHTML.trim();
        const tags = this.getTags();
        
        if (!title && !content) {
            alert('Por favor, agrega un título o contenido a la nota antes de guardar.');
            return; // No guardar si no hay contenido
        }
        
        // Crear o actualizar nota
        const note = {
            id: this.currentEditingNoteId || Date.now(),
            title: title || 'Nota sin título',
            content: content || '',
            tags: tags,
            createdAt: this.currentEditingNoteId ? this.getNoteById(this.currentEditingNoteId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Guardar en localStorage
        this.saveNoteToStorage(note);
        
        // Actualizar la lista de notas
        this.loadNotesList();
        
        console.log('💾 Nota guardada:', note);
        
        // NO limpiar ID de edición aquí - solo se limpia cuando se cierra el editor
    }
    
    saveNoteToStorage(note) {
        let notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        
        // Buscar si ya existe una nota con el mismo ID
        const existingIndex = notes.findIndex(n => n.id === note.id);
        
        if (existingIndex >= 0) {
            notes[existingIndex] = note;
            console.log(`📝 Actualizando nota existente ID: ${note.id}`);
        } else {
            notes.push(note);
            console.log(`📝 Creando nueva nota ID: ${note.id}`);
        }
        
        localStorage.setItem('lia_notes', JSON.stringify(notes));
    }
    
    getTags() {
        const tagsList = document.getElementById('tagsList');
        const tagItems = tagsList.querySelectorAll('.tag-item');
        return Array.from(tagItems).map(tag => tag.textContent.replace('×', '').trim());
    }
    
    addTag(tagText) {
        if (!tagText.trim()) return;
        
        const tagsList = document.getElementById('tagsList');
        const existingTags = Array.from(tagsList.querySelectorAll('.tag-item'))
            .map(tag => tag.textContent.replace('×', '').trim());
        
        if (existingTags.includes(tagText.trim())) {
            return; // Evitar duplicados
        }
        
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            ${tagText.trim()}
            <button class="tag-remove" onclick="window.chatOnline.removeTag(this)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        
        tagsList.appendChild(tagElement);
    }
    
    removeTag(button) {
        button.closest('.tag-item').remove();
    }
    
    clearTags() {
        const tagsList = document.getElementById('tagsList');
        tagsList.innerHTML = '';
    }
    
    // ===== CONFIGURACIÓN DEL EDITOR DE NOTAS =====
    setupNotesEditor() {
        console.log('🔧 Configurando editor de notas...');
        
        // Usar setTimeout para asegurar que el DOM esté listo
        setTimeout(() => {
            this.initializeNotesEditor();
        }, 100);
    }
    
    initializeNotesEditor() {
        console.log('🎨 Inicializando editor de notas...');
        
        // Configurar barra de herramientas
        this.setupToolbar();
        
        // Configurar input de etiquetas
        this.setupTagsInput();
        
        // Configurar botones del editor
        this.setupEditorButtons();
        
        console.log('✅ Editor de notas inicializado');
    }
    
    setupToolbar() {
        console.log('🛠️ Configurando barra de herramientas...');
        
        const boldBtn = document.getElementById('boldBtn');
        const italicBtn = document.getElementById('italicBtn');
        const underlineBtn = document.getElementById('underlineBtn');
        const listBtn = document.getElementById('listBtn');
        const linkBtn = document.getElementById('linkBtn');
        
        console.log('Botones de toolbar encontrados:', {
            boldBtn: !!boldBtn,
            italicBtn: !!italicBtn,
            underlineBtn: !!underlineBtn,
            listBtn: !!listBtn,
            linkBtn: !!linkBtn
        });
        
        // Negrita
        if (boldBtn) {
            boldBtn.removeEventListener('click', this.handleBoldClick);
            this.handleBoldClick = () => {
                console.log('🔤 Aplicando negrita...');
                document.execCommand('bold', false, null);
                this.updateToolbarState();
            };
            boldBtn.addEventListener('click', this.handleBoldClick);
            console.log('✅ Botón negrita configurado');
        } else {
            console.error('❌ Botón negrita no encontrado');
        }
        
        // Cursiva
        if (italicBtn) {
            italicBtn.removeEventListener('click', this.handleItalicClick);
            this.handleItalicClick = () => {
                console.log('🔤 Aplicando cursiva...');
                document.execCommand('italic', false, null);
                this.updateToolbarState();
            };
            italicBtn.addEventListener('click', this.handleItalicClick);
            console.log('✅ Botón cursiva configurado');
        } else {
            console.error('❌ Botón cursiva no encontrado');
        }
        
        // Subrayado
        if (underlineBtn) {
            underlineBtn.removeEventListener('click', this.handleUnderlineClick);
            this.handleUnderlineClick = () => {
                console.log('🔤 Aplicando subrayado...');
                document.execCommand('underline', false, null);
                this.updateToolbarState();
            };
            underlineBtn.addEventListener('click', this.handleUnderlineClick);
            console.log('✅ Botón subrayado configurado');
        } else {
            console.error('❌ Botón subrayado no encontrado');
        }
        
        // Lista
        if (listBtn) {
            listBtn.removeEventListener('click', this.handleListClick);
            this.handleListClick = () => {
                console.log('📝 Insertando lista...');
                document.execCommand('insertUnorderedList', false, null);
                this.updateToolbarState();
            };
            listBtn.addEventListener('click', this.handleListClick);
            console.log('✅ Botón lista configurado');
        } else {
            console.error('❌ Botón lista no encontrado');
        }
        
        // Enlace
        if (linkBtn) {
            linkBtn.removeEventListener('click', this.handleLinkClick);
            this.handleLinkClick = () => {
                console.log('🔗 Insertando enlace...');
                const url = prompt('Ingresa la URL del enlace:');
                if (url) {
                    document.execCommand('createLink', false, url);
                    this.updateToolbarState();
                }
            };
            linkBtn.addEventListener('click', this.handleLinkClick);
            console.log('✅ Botón enlace configurado');
        } else {
            console.error('❌ Botón enlace no encontrado');
        }
        
        // Actualizar estado de la barra de herramientas cuando se selecciona texto
        const contentEditor = document.getElementById('noteContentEditor');
        if (contentEditor) {
            contentEditor.addEventListener('keyup', () => this.updateToolbarState());
            contentEditor.addEventListener('mouseup', () => this.updateToolbarState());
            contentEditor.addEventListener('input', () => this.updateToolbarState());
            console.log('✅ Event listeners del editor configurados');
        } else {
            console.error('❌ Editor de contenido no encontrado');
        }
    }
    
    updateToolbarState() {
        const boldBtn = document.getElementById('boldBtn');
        const italicBtn = document.getElementById('italicBtn');
        const underlineBtn = document.getElementById('underlineBtn');
        
        // Actualizar estado de los botones
        boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
    }
    
    setupTagsInput() {
        const tagsInput = document.getElementById('tagsInput');
        
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tagText = tagsInput.value.trim();
                if (tagText) {
                    this.addTag(tagText);
                    tagsInput.value = '';
                }
            }
        });
        
        // Permitir agregar etiquetas con coma
        tagsInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.includes(',')) {
                const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                tags.forEach(tag => this.addTag(tag));
                tagsInput.value = '';
            }
        });
    }
    
    setupEditorButtons() {
        console.log('🔘 Configurando botones del editor...');
        
        const saveBtn = document.getElementById('saveNoteBtn');
        const cancelBtn = document.getElementById('cancelNoteBtn');
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        
        console.log('Botones del editor encontrados:', {
            saveBtn: !!saveBtn,
            cancelBtn: !!cancelBtn,
            exportPdfBtn: !!exportPdfBtn
        });
        
        // Guardar nota
        if (saveBtn) {
            saveBtn.removeEventListener('click', this.handleSaveNoteClick);
            this.handleSaveNoteClick = () => {
                console.log('💾 Guardando nota...');
                this.saveNote();
                this.hideNotesCreator();
            };
            saveBtn.addEventListener('click', this.handleSaveNoteClick);
            console.log('✅ Botón guardar configurado');
        } else {
            console.error('❌ Botón guardar no encontrado');
        }
        
        // Cancelar
        if (cancelBtn) {
            cancelBtn.removeEventListener('click', this.handleCancelNoteClick);
            this.handleCancelNoteClick = () => {
                console.log('❌ Cancelando nota...');
                this.hideNotesCreator();
            };
            cancelBtn.addEventListener('click', this.handleCancelNoteClick);
            console.log('✅ Botón cancelar configurado');
        } else {
            console.error('❌ Botón cancelar no encontrado');
        }
        
        // Exportar a PDF
        if (exportPdfBtn) {
            exportPdfBtn.removeEventListener('click', this.handleExportPdfClick);
            this.handleExportPdfClick = () => {
                console.log('📄 Exportando a PDF...');
                this.exportNoteToPDF();
            };
            exportPdfBtn.addEventListener('click', this.handleExportPdfClick);
            console.log('✅ Botón exportar PDF configurado');
        } else {
            console.error('❌ Botón exportar PDF no encontrado');
        }
        
        // Configurar selector de tamaño de fuente
        this.setupFontSizeSelector();
    }
    
    setupFontSizeSelector() {
        const fontSizeBtn = document.getElementById('fontSizeBtn');
        const fontSizeDropdown = document.getElementById('fontSizeDropdown');
        const fontSizeOptions = document.querySelectorAll('.font-size-option');
        const fontSizeText = document.querySelector('.font-size-text');
        const editor = document.getElementById('noteContentEditor');
        
        // Toggle dropdown
        fontSizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Actualizar el tamaño mostrado basado en la selección actual o cursor
            this.updateFontSizeDisplay();
            
            fontSizeDropdown.classList.toggle('show');
        });
        
        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', () => {
            fontSizeDropdown.classList.remove('show');
        });
        
        // Manejar selección de tamaño
        fontSizeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const size = option.dataset.size;
                this.changeFontSize(size);
                
                // No actualizar el display aquí, se hará en changeFontSize si es exitoso
                fontSizeDropdown.classList.remove('show');
            });
        });
        
        // Actualizar display cuando cambie la selección
        editor.addEventListener('mouseup', () => {
            setTimeout(() => this.updateFontSizeDisplay(), 10);
        });
        
        editor.addEventListener('keyup', () => {
            setTimeout(() => this.updateFontSizeDisplay(), 10);
        });
    }
    
    updateFontSizeDisplay() {
        const selection = window.getSelection();
        const fontSizeText = document.querySelector('.font-size-text');
        const fontSizeOptions = document.querySelectorAll('.font-size-option');
        const editor = document.getElementById('noteContentEditor');
        
        let fontSize = 14; // Tamaño por defecto
        
        try {
            if (selection.rangeCount > 0 && !selection.isCollapsed) {
                // Hay texto seleccionado - obtener su tamaño
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
                const computedStyle = window.getComputedStyle(element);
                fontSize = parseInt(computedStyle.fontSize);
            } else {
                // No hay selección - obtener tamaño en la posición del cursor
                const currentFontSize = this.getCurrentCursorFontSize();
                fontSize = currentFontSize || 14;
            }
            
            // Actualizar display
            fontSizeText.textContent = fontSize.toString();
            
            // Actualizar estado activo de las opciones
            fontSizeOptions.forEach(opt => {
                opt.classList.toggle('active', opt.dataset.size === fontSize.toString());
            });
            
        } catch (error) {
            // En caso de error, mostrar tamaño por defecto
            fontSizeText.textContent = '14';
            fontSizeOptions.forEach(opt => opt.classList.remove('active'));
        }
    }
    
    getCurrentCursorFontSize() {
        const selection = window.getSelection();
        const editor = document.getElementById('noteContentEditor');
        
        if (!selection.rangeCount) return 14;
        
        try {
            const range = selection.getRangeAt(0);
            let element = range.startContainer;
            
            // Si es un nodo de texto, obtener su elemento padre
            if (element.nodeType === Node.TEXT_NODE) {
                element = element.parentElement;
            }
            
            // Asegurar que estamos dentro del editor
            if (!editor.contains(element)) {
                element = editor;
            }
            
            // Obtener el tamaño de fuente computado
            const computedStyle = window.getComputedStyle(element);
            return parseInt(computedStyle.fontSize);
            
        } catch (error) {
            return 14;
        }
    }
    
    changeFontSize(size) {
        const editor = document.getElementById('noteContentEditor');
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            // CASO 1: Hay texto seleccionado - cambiar tamaño de la selección
            this.changeFontSizeForSelection(size);
        } else {
            // CASO 2: No hay selección - cambiar tamaño para texto nuevo
            this.setFontSizeForNewText(size);
        }
        
        // Actualizar el display del tamaño
        setTimeout(() => this.updateFontSizeDisplay(), 10);
        
        // Mantener el foco en el editor
        editor.focus();
    }
    
    changeFontSizeForSelection(size) {
        const editor = document.getElementById('noteContentEditor');
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Verificar que la selección está dentro del editor
        if (!editor.contains(range.commonAncestorContainer)) {
            this.showNotification('Selecciona texto dentro del editor de notas', 'warning');
            return;
        }
        
        try {
            // Método más robusto para aplicar tamaño de fuente
            const selectedText = range.extractContents();
            const span = document.createElement('span');
            span.style.fontSize = size + 'px';
            span.style.display = 'inline';
            span.appendChild(selectedText);
            range.insertNode(span);
            
            // Restaurar la selección en el nuevo span
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            console.log(`✅ Tamaño de selección cambiado a ${size}px`);
            this.showNotification(`Tamaño de selección cambiado a ${size}px`, 'success');
            
        } catch (error) {
            console.error('❌ Error al cambiar tamaño de selección:', error);
            
            // Método alternativo usando execCommand
            try {
                const tempSize = Math.floor(Math.random() * 1000) + 1000;
                document.execCommand('fontSize', false, tempSize);
                
                const fontElements = editor.querySelectorAll(`font[size="${tempSize}"]`);
                fontElements.forEach(font => {
                    const span = document.createElement('span');
                    span.style.fontSize = size + 'px';
                    span.style.display = 'inline';
                    span.innerHTML = font.innerHTML;
                    font.parentNode.replaceChild(span, font);
                });
                
                console.log(`✅ Tamaño de selección cambiado a ${size}px (método alternativo)`);
                this.showNotification(`Tamaño de selección cambiado a ${size}px`, 'success');
                
            } catch (fallbackError) {
                console.error('❌ Error en método alternativo:', fallbackError);
                this.showNotification('Error al cambiar el tamaño de fuente', 'error');
            }
        }
    }
    
    setFontSizeForNewText(size) {
        const editor = document.getElementById('noteContentEditor');
        const selection = window.getSelection();
        
        try {
            // Crear un span invisible en la posición del cursor para establecer el tamaño
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : document.createRange();
            
            // Si no hay rango, crear uno al final del editor
            if (!selection.rangeCount) {
                range.selectNodeContents(editor);
                range.collapse(false);
            }
            
            // Insertar un span con el nuevo tamaño de fuente
            const span = document.createElement('span');
            span.style.fontSize = size + 'px';
            span.style.display = 'inline';
            span.appendChild(document.createTextNode('\u200B')); // Carácter de ancho cero
            
            range.insertNode(span);
            
            // Posicionar el cursor después del span
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Configurar el estilo para el próximo texto
            this.setNextTextStyle(size);
            
            console.log(`✅ Tamaño para texto nuevo establecido a ${size}px`);
            this.showNotification(`Tamaño para texto nuevo: ${size}px`, 'success');
            
        } catch (error) {
            console.error('❌ Error al establecer tamaño para texto nuevo:', error);
            this.showNotification('Error al establecer el tamaño de fuente', 'error');
        }
    }
    
    setNextTextStyle(size) {
        const editor = document.getElementById('noteContentEditor');
        
        // Usar execCommand para establecer el tamaño para el próximo texto
        try {
            // Crear un estilo temporal
            const tempSize = '7'; // Tamaño temporal para execCommand
            document.execCommand('fontSize', false, tempSize);
            
            // Buscar y actualizar inmediatamente
            setTimeout(() => {
                const fontElements = editor.querySelectorAll(`font[size="${tempSize}"]`);
                fontElements.forEach(font => {
                    const span = document.createElement('span');
                    span.style.fontSize = size + 'px';
                    span.style.display = 'inline';
                    span.innerHTML = font.innerHTML;
                    font.parentNode.replaceChild(span, font);
                });
            }, 10);
            
        } catch (error) {
            console.error('❌ Error al establecer estilo para próximo texto:', error);
        }
    }
    
    async exportNoteToPDF() {
        const titleInput = document.getElementById('noteTitleInputCreator');
        const contentEditor = document.getElementById('noteContentEditor');
        
        const title = titleInput.value || 'Nota sin título';
        const content = contentEditor.innerHTML;
        
        if (!content.trim()) {
            alert('No hay contenido para exportar');
            return;
        }
        
        try {
            // Crear un elemento temporal para el PDF
            const printContent = document.createElement('div');
            printContent.innerHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #44E5FF; border-bottom: 2px solid #44E5FF; padding-bottom: 10px;">${title}</h1>
                    <div style="margin-top: 20px; line-height: 1.6;">${content}</div>
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
                        <p>Generado por Aprende y Aplica - ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            `;
            
            // Abrir ventana de impresión
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // Esperar un momento y luego mostrar diálogo de impresión
            setTimeout(() => {
                printWindow.print();
            }, 250);
            
            console.log('✅ PDF exportado correctamente');
            
        } catch (error) {
            console.error('❌ Error al exportar PDF:', error);
            alert('Error al exportar a PDF. Por favor, intenta de nuevo.');
        }
    }
    
    searchNotes() {
        console.log('🔍 Activando búsqueda de notas...');
        this.toggleSearchMode();
    }
    
    toggleSearchMode() {
        const notesList = document.getElementById('notesList');
        const searchBtn = document.getElementById('searchNotesBtn');
        
        if (this.isSearchMode) {
            // Desactivar modo búsqueda
            this.isSearchMode = false;
            this.loadNotesList(); // Cargar todas las notas
            searchBtn.title = 'Buscar Notas';
            console.log('🔍 Modo búsqueda desactivado');
        } else {
            // Activar modo búsqueda
            this.isSearchMode = true;
            this.showSearchInput();
            searchBtn.title = 'Cancelar Búsqueda';
            console.log('🔍 Modo búsqueda activado');
        }
    }
    
    showSearchInput() {
        const notesList = document.getElementById('notesList');
        
        // Crear el input de búsqueda
        const searchHTML = `
            <div class="search-container">
                <div class="search-input-wrapper">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input type="text" id="noteSearchInput" placeholder="Buscar en notas..." class="search-input">
                    <button class="search-clear-btn" id="searchClearBtn" style="display: none;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="search-results" id="searchResults"></div>
            </div>
        `;
        
        notesList.innerHTML = searchHTML;
        
        // Configurar el input de búsqueda
        this.setupSearchInput();
    }
    
    setupSearchInput() {
        const searchInput = document.getElementById('noteSearchInput');
        const clearBtn = document.getElementById('searchClearBtn');
        
        // Event listener para búsqueda en tiempo real
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            this.performSearch(query);
            
            // Mostrar/ocultar botón de limpiar
            if (query.length > 0) {
                clearBtn.style.display = 'flex';
            } else {
                clearBtn.style.display = 'none';
            }
        });
        
        // Event listener para botón de limpiar
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            this.performSearch('');
        });
        
        // Enfocar el input
        searchInput.focus();
    }
    
    performSearch(query) {
        const searchResults = document.getElementById('searchResults');
        const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        
        if (!query) {
            // Si no hay query, mostrar todas las notas
            this.displaySearchResults(notes);
            return;
        }
        
        // Filtrar notas que coincidan con la búsqueda
        const filteredNotes = notes.filter(note => {
            const title = note.title.toLowerCase();
            const content = this.stripHTML(note.content).toLowerCase();
            const tags = note.tags.join(' ').toLowerCase();
            
            return title.includes(query) || 
                   content.includes(query) || 
                   tags.includes(query);
        });
        
        this.displaySearchResults(filteredNotes);
        
        console.log(`🔍 Búsqueda: "${query}" - ${filteredNotes.length} resultados`);
    }
    
    displaySearchResults(notes) {
        const searchResults = document.getElementById('searchResults');
        
        if (notes.length === 0) {
            searchResults.innerHTML = `
                <div class="no-search-results">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <p>No se encontraron notas</p>
                    <span>Intenta con otros términos de búsqueda</span>
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha de actualización (más recientes primero)
        const sortedNotes = notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        searchResults.innerHTML = sortedNotes.map(note => this.createNoteHTML(note)).join('');
        
        // Agregar event listeners a las notas encontradas
        this.setupNoteClickListeners();
    }
    
    toggleNotesCollapse() {
        console.log('📁 Toggling notes collapse...');
        
        const notesSection = document.querySelector('.notes-section');
        const collapseBtn = document.getElementById('collapseNotes');
        
        if (!notesSection || !collapseBtn) {
            console.error('❌ Elements not found for notes collapse');
            return;
        }
        
        const isCollapsed = notesSection.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Expandir
            notesSection.classList.remove('collapsed');
            collapseBtn.title = 'Colapsar Notas';
            console.log('📖 Notas expandidas');
        } else {
            // Colapsar
            notesSection.classList.add('collapsed');
            collapseBtn.title = 'Expandir Notas';
            console.log('📦 Notas colapsadas');
        }
        
        // El CSS se encarga de la animación del icono automáticamente
    }
    
    // ===== MATERIALES =====
    setupMaterials() {
        console.log('📦 Configurando materiales...');
        
        // Usar setTimeout para asegurar que el DOM esté listo
        setTimeout(() => {
            this.initializeMaterialsButtons();
        }, 100);
    }
    
    initializeMaterialsButtons() {
        console.log('🔧 Inicializando botones de materiales...');
        
        const collapseMaterialsBtn = document.getElementById('collapseMaterialsBtn');
        
        console.log('Botones de materiales encontrados:', {
            collapseMaterialsBtn: !!collapseMaterialsBtn
        });
        
        if (collapseMaterialsBtn) {
            collapseMaterialsBtn.removeEventListener('click', this.handleCollapseMaterialsClick);
            this.handleCollapseMaterialsClick = () => {
                console.log('📦 Colapsando materiales del curso...');
                this.toggleMaterialsCollapse();
            };
            collapseMaterialsBtn.addEventListener('click', this.handleCollapseMaterialsClick);
            console.log('✅ Botón colapsar materiales configurado');
        } else {
            console.error('❌ Botón colapsar materiales no encontrado');
        }
    }
    
    toggleMaterialsCollapse() {
        const materialsSection = document.querySelector('.course-materials-section');
        const modulesList = document.querySelector('.modules-list');
        const collapseBtn = document.getElementById('collapseMaterialsBtn');
        const icon = collapseBtn.querySelector('svg');
        
        if (materialsSection && modulesList) {
            const isCollapsed = modulesList.style.opacity === '0' || modulesList.style.visibility === 'hidden';
            
            if (isCollapsed) {
                // Expandir
                modulesList.style.opacity = '1';
                modulesList.style.visibility = 'visible';
                modulesList.style.display = 'flex';
                materialsSection.style.flex = '1';
                icon.innerHTML = '<polyline points="6,9 12,15 18,9"/>';
                collapseBtn.title = 'Colapsar Materiales';
                console.log('📤 Materiales expandidos');
        } else {
                // Colapsar
                modulesList.style.opacity = '0';
                modulesList.style.visibility = 'hidden';
                setTimeout(() => {
                    modulesList.style.display = 'none';
                }, 300);
                materialsSection.style.flex = '0 0 auto';
                icon.innerHTML = '<polyline points="6,15 12,9 18,15"/>';
                collapseBtn.title = 'Expandir Materiales';
                console.log('📦 Materiales colapsados');
            }
        }
    }
    
    // ===== RESPONSIVE =====
    setupResponsive() {
        this.checkScreenSize();
    }
    
    setupResponsiveListeners() {
        window.addEventListener('resize', () => {
            this.checkScreenSize();
        });
    }
    
    // ===== PROGRESS MANAGER =====
    async initializeProgressManager() {
        try {
            console.log('📊 Inicializando Progress Manager...');
            
            // Intentar múltiples estrategias para obtener el progress manager
            let manager = null;
            
            // Estrategia 1: Verificar si ya está disponible
            if (window.courseProgressManager && typeof window.courseProgressManager.getCourseProgress === 'function') {
                console.log('✅ CourseProgressManager ya disponible');
                manager = window.courseProgressManager;
            } 
            // Estrategia 2: Esperar con timeout
            else {
                console.log('⏳ Esperando CourseProgressManager...');
                manager = await this.waitForProgressManager();
            }
            
            // Estrategia 3: Si aún no está disponible, crear uno básico
            if (!manager || typeof manager.getCourseProgress !== 'function') {
                console.warn('⚠️ CreatingFallback Progress Manager');
                manager = this.createFallbackProgressManager();
            }
            
            this.progressManager = manager;
            
            // Validar que el manager es funcional antes de usarlo
            if (this.progressManager && typeof this.progressManager.getCourseProgress === 'function') {
                // Obtener progreso inicial
                console.log('📊 Obteniendo progreso inicial...');
                this.courseProgress = await this.progressManager.getCourseProgress();
                console.log('📊 Progreso obtenido:', this.courseProgress);
                
                // Actualizar UI con el progreso actual
                this.updateProgressUI();
                
                console.log('✅ Progress Manager inicializado exitosamente');
            } else {
                throw new Error('Progress Manager no es funcional');
            }
            
        } catch (error) {
            console.error('❌ Error inicializando Progress Manager:', error);
            console.error('📊 Stack trace:', error.stack);
            
            // Crear un manager de fallback que no cause errores
            this.progressManager = this.createFallbackProgressManager();
            this.courseProgress = {
                overall_progress_percentage: 0,
                modules: [],
                status: 'fallback'
            };
            
            console.log('🔄 Usando Progress Manager de fallback');
        }
    }
    
    waitForProgressManager() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 10; // 1 segundo con intervalos de 100ms - reducido para fallback más rápido
            
            const checkInterval = setInterval(() => {
                attempts++;
                
                // Verificar múltiples condiciones
                if (window.courseProgressManager && typeof window.courseProgressManager.getCourseProgress === 'function') {
                    console.log(`✅ Progress Manager encontrado después de ${attempts} intentos`);
                    clearInterval(checkInterval);
                    resolve(window.courseProgressManager);
                    return;
                }
                
                // También escuchar el evento de inicialización
                const onReady = (event) => {
                    console.log('📡 Evento courseProgressManagerReady recibido');
                    window.removeEventListener('courseProgressManagerReady', onReady);
                    clearInterval(checkInterval);
                    resolve(event.detail.manager);
                };
                
                if (attempts === 1) { // Solo agregar el listener una vez
                    window.addEventListener('courseProgressManagerReady', onReady);
                }
                
                // Timeout después de maxAttempts
                if (attempts >= maxAttempts) {
                    console.warn(`⚠️ Timeout esperando CourseProgressManager después de ${attempts} intentos`);
                    clearInterval(checkInterval);
                    window.removeEventListener('courseProgressManagerReady', onReady);
                    resolve(null); // Devolver null para que se cree un fallback
                }
            }, 100);
        });
    }
    
    createFallbackProgressManager() {
        console.log('🔄 Creando Progress Manager de fallback...');
        
        // Crear manager básico que no cause errores
        return {
            getCourseProgress: async (forceRefresh = false) => {
                console.log('📦 Usando progreso de fallback local');
                return {
                    course_progress_id: 'fallback-progress',
                    user_id: 'demo-user',
                    course_identifier: 'intro-to-ai',
                    overall_progress_percentage: 0,
                    status: 'in_progress',
                    started_at: new Date().toISOString(),
                    current_module: 1,
                    modules: [
                        {
                            module_number: 1,
                            module_name: '¿Qué es la IA?',
                            status: 'in_progress',
                            progress_percentage: 0,
                            video_id: null  // Se cargará dinámicamente desde la API
                        },
                        {
                            module_number: 2,
                            module_name: 'Historia de la IA',
                            status: 'locked',
                            progress_percentage: 0,
                            video_id: 'dhsy6epaJGs'
                        },
                        {
                            module_number: 3,
                            module_name: 'Fundamentos del ML',
                            status: 'locked',
                            progress_percentage: 0,
                            video_id: 'DvyOm9HeT-k'
                        },
                        {
                            module_number: 4,
                            module_name: 'Redes Neuronales',
                            status: 'locked',
                            progress_percentage: 0,
                            video_id: 'oiKj0Z_Xnjc'
                        },
                        {
                            module_number: 5,
                            module_name: 'Aplicaciones Prácticas',
                            status: 'locked',
                            progress_percentage: 0,
                            video_id: 'HMoaRIbOaN0'
                        }
                    ],
                    total_modules: 5,
                    completed_modules: 0,
                    current_module: 1,
                    total_time_spent: 0
                };
            },
            
            updateModuleProgress: async (moduleNumber, updates = {}) => {
                console.log(`📝 Fallback: Actualizando módulo ${moduleNumber}`, updates);
                return Promise.resolve({ success: true });
            },
            
            updateVideoProgress: async (moduleNumber, videoUpdates = {}) => {
                console.log(`🎥 Fallback: Actualizando video ${moduleNumber}`, videoUpdates);
                return Promise.resolve({ success: true });
            },
            
            completeModule: async (moduleNumber) => {
                console.log(`🎯 Fallback: Completando módulo ${moduleNumber}`);
                return Promise.resolve({ success: true });
            },
            
            startModule: async (moduleNumber) => {
                console.log(`▶️ Fallback: Iniciando módulo ${moduleNumber}`);
                return Promise.resolve({ success: true });
            },
            
            getModuleProgress: (moduleNumber) => {
                return null;
            },
            
            isModuleCompleted: (moduleNumber) => false,
            isModuleLocked: (moduleNumber) => moduleNumber > 1
        };
    }
    
    // ===== YOUTUBE PROGRESS TRACKER =====
    async initializeYouTubeTracker() {
        try {
            console.log('🎥 Inicializando YouTube Progress Tracker...');
            
            // Esperar a que ambos componentes estén listos
            await this.waitForComponents();
            
            // Verificar si YouTube Progress Tracker está disponible
            if (typeof window.YouTubeProgressTracker === 'undefined') {
                console.warn('⚠️ YouTubeProgressTracker no disponible, saltando inicialización');
                return;
            }
            
            // Usar siempre el CourseProgressManagerV2 global corregido
            const progressManager = window.courseProgressManager || this.progressManager;
            
            if (!progressManager) {
                console.warn('⚠️ No hay progress manager disponible, usando tracker básico');
                this.youtubeTracker = new window.YouTubeProgressTracker(null);
            } else {
                console.log('✅ Usando CourseProgressManagerV2 para YouTube tracker');
                this.youtubeTracker = new window.YouTubeProgressTracker(progressManager);
            }
            
            // Configurar eventos del tracker
            this.setupYouTubeEvents();
            
            // Inicializar con el video actual si hay datos de progreso
            if (this.courseProgress && this.courseProgress.modules && this.courseProgress.current_module) {
                const currentModule = this.courseProgress.modules.find(m => m.module_number === this.courseProgress.current_module);
                if (currentModule && currentModule.video_id) {
                    console.log(`🎥 Inicializando player con video: ${currentModule.video_id} (Módulo ${currentModule.module_number})`);
                    
                    // Esperar un momento para que el DOM esté listo
                    setTimeout(() => {
                        this.youtubeTracker.initializePlayer(
                            'youtubePlayer',
                            currentModule.video_id,
                            currentModule.module_number
                        );
                    }, 1000);
                }
            }
            
            console.log('✅ YouTube Progress Tracker inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando YouTube Progress Tracker:', error);
            this.youtubeTracker = null;
        }
    }

    // =====================================================
    // SISTEMA DE COMUNIDAD
    // =====================================================

    async initializeCommunitySystem() {
        try {
            console.log('🏘️ Inicializando sistema de comunidad...');
            
            // Esperar a que el progress manager esté listo
            if (this.progressManager && this.courseProgress) {
                console.log('📊 Progress manager ya está listo, usando datos reales');
            } else {
                console.log('⏳ Esperando a que el progress manager esté listo...');
                // Esperar un poco más para que el progress manager se inicialice
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Inicializar CommunityDatabase si está disponible
            if (window.CommunityDatabase) {
                this.communityDB = new window.CommunityDatabase();
                await this.communityDB.initialize();
                console.log('✅ CommunityDatabase inicializado');
            } else {
                console.warn('⚠️ CommunityDatabase no disponible, usando API directa');
            }
            
            // Las preguntas se cargarán cuando el usuario acceda a la pestaña de comunidad
            console.log('📝 Sistema de comunidad listo, preguntas se cargarán al acceder a la pestaña');
            
            console.log('✅ Sistema de comunidad inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de comunidad:', error);
            // En caso de error, al menos limpiar las preguntas hardcodeadas
            this.clearHardcodedQuestions();
        }
    }

    setupCommunityEvents() {
        console.log('🔧 Configurando eventos de comunidad...');
        
        // Botón para hacer pregunta
        const askQuestionBtn = document.getElementById('askQuestionBtn');
        if (askQuestionBtn) {
            askQuestionBtn.addEventListener('click', () => {
                this.showQuestionModal();
            });
        }

        // Modal de pregunta
        const questionModal = document.getElementById('questionModal');
        if (questionModal) {
            // Botón cerrar modal
            const closeBtn = document.getElementById('closeQuestionModal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideQuestionModal();
                });
            }

            // Botón cancelar
            const cancelBtn = document.getElementById('cancelQuestionBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.hideQuestionModal();
                });
            }

            // Formulario de pregunta - Ya configurado en setupCommunityEventListeners(), evitar duplicados

            // Contador de caracteres para el título
            const titleInput = document.getElementById('questionTitle');
            const charCount = document.getElementById('titleCharCount');
            if (titleInput && charCount) {
                titleInput.addEventListener('input', () => {
                    charCount.textContent = titleInput.value.length;
                });
            }
        }

        // Filtros de comunidad - Removed duplicate (handled by setupCommunityFilters)

        // Ordenamiento
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortQuestions(sortSelect.value);
            });
        }

        console.log('✅ Eventos de comunidad configurados');
    }

    showQuestionModal() {
        console.log('📝 Mostrando modal de pregunta...');
        const modal = document.getElementById('questionModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Limpiar formulario
            const form = document.getElementById('questionForm');
            if (form) {
                form.reset();
                document.getElementById('titleCharCount').textContent = '0';
            }
            
            console.log('✅ Modal de pregunta mostrado');
        } else {
            console.error('❌ Modal de pregunta no encontrado');
        }
    }

    hideQuestionModal() {
        console.log('❌ Ocultando modal de pregunta...');
        const modal = document.getElementById('questionModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            console.log('✅ Modal de pregunta ocultado');
        }
    }

    async submitQuestion() {
        // Protección contra múltiples envíos simultáneos
        if (this.submittingQuestion) {
            console.log('⏳ Ya se está enviando una pregunta, saltando...');
            return;
        }

            console.log('📤 Enviando pregunta...');
        this.submittingQuestion = true;
        
        let originalText = '';
        const submitBtn = document.getElementById('submitQuestionBtn');
        
        try {
            
            const titleInput = document.getElementById('questionTitle');
            const contentInput = document.getElementById('questionContent');
            const tagsInput = document.getElementById('questionTags');
            
            if (!titleInput || !contentInput) {
                console.error('❌ Campos de formulario no encontrados');
                this.showNotification('Error: Campos de formulario no encontrados', 'error');
                return;
            }
            
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();
            const tags = this.getSelectedTags() || [];
            
            // Validación más específica
            if (!title || title.length < 5) {
                this.showNotification('El título debe tener al menos 5 caracteres', 'error');
                return;
            }
            
            if (!content || content.length < 10) {
                this.showNotification('El contenido debe tener al menos 10 caracteres', 'error');
                return;
            }
            
            // Mostrar indicador de carga
            if (submitBtn) {
                originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loading-spinner"></div> Enviando...';
            submitBtn.disabled = true;
            }
            
            // Obtener datos reales de la sesión
            const currentUser = this.obtenerUsuarioActual();
            const currentCourseId = this.getCurrentCourseId();
            const currentModuleId = this.getCurrentModuleId();
            
            console.log('👤 Usuario actual:', currentUser);
            console.log('📚 Curso actual:', currentCourseId);
            console.log('📖 Módulo actual:', currentModuleId);
            
            // Validar datos críticos
            if (!currentUser || !currentUser.id) {
                throw new Error('Usuario no identificado. Por favor recarga la página.');
            }
            
            if (!currentCourseId) {
                throw new Error('Curso no identificado. Por favor recarga la página.');
            }
            
            // Preparar datos de la pregunta con validación
            const questionData = {
                title: title,
                content: content,
                tags: tags && tags.length > 0 ? tags : [],
                course_id: currentCourseId,
                module_id: currentModuleId || `module-${this.currentModule}`,
                user_id: currentUser.id
            };
            
            console.log('📝 Datos de la pregunta:', questionData);
            
            // Intentar con communityDB primero, con fallback a API
            let result = null;
            
            if (this.communityDB && this.communityDB.createQuestion) {
                try {
                    console.log('💾 Intentando usar communityDB para crear pregunta...');
                    
                    // Asegurar que communityDB tenga el usuario actual
                    if (!this.communityDB.currentUser) {
                        console.log('👤 Sincronizando usuario con communityDB...');
                        this.communityDB.currentUser = currentUser;
                        console.log('✅ Usuario sincronizado:', this.communityDB.currentUser);
                    }
                    
                    result = await this.communityDB.createQuestion(questionData);
                    console.log('✅ Pregunta creada con communityDB');
                    
                } catch (dbError) {
                    console.warn('⚠️ Error con communityDB, usando fallback a API:', dbError.message);
                    result = null;
                }
            }
            
            // Fallback a API si communityDB falló o no está disponible
            if (!result) {
                console.log('🌐 Usando API para crear pregunta...');
                result = await this.createQuestionViaAPI(questionData);
            }
            
            if (result) {
                console.log('✅ Pregunta creada exitosamente:', result);
                console.log('🔄 Iniciando proceso de recarga de preguntas...');
                
                // Limpiar formulario
                this.clearQuestionForm();
                
                // Cerrar modal
                this.hideQuestionModal();
                
                // Esperar un momento para que la base de datos se sincronice
                console.log('⏳ Esperando sincronización de base de datos...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Recargar preguntas inmediatamente sin borrar el contenido existente
                console.log('🔄 Forzando recarga de preguntas...');
                this.communityQuestionsLoaded = false; // Permitir recarga
                await this.loadCommunityQuestions('after-submit-question');
                this.communityQuestionsLoaded = true; // Marcar como cargadas
                console.log('✅ Proceso de recarga completado');
                
                // Mostrar mensaje de éxito
                this.showNotification('Pregunta publicada exitosamente', 'success');
                
            } else {
                throw new Error('No se pudo crear la pregunta');
            }
            
        } catch (error) {
            console.error('❌ Error enviando pregunta:', error);
            const errorMessage = error.message || 'Error al publicar la pregunta. Inténtalo de nuevo.';
            this.showNotification(errorMessage, 'error');
        } finally {
            // Restaurar botón y resetear bandera de envío
            if (submitBtn && originalText) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
            this.submittingQuestion = false;
        }
    }

    async createQuestionViaAPI(questionData) {
        try {
            console.log('🌐 Enviando pregunta vía API...');
            console.log('📊 Datos enviados:', questionData);
            
            const response = await fetch('/api/community/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'X-User-Id': questionData.user_id
                },
                body: JSON.stringify(questionData)
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
            
            // Obtener el texto de la respuesta primero
            const responseText = await response.text();
            console.log('📄 Response text:', responseText);
            
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    // Si no es JSON válido, usar el mensaje HTTP por defecto
                }
                throw new Error(errorMessage);
            }
            
            // Intentar parsear como JSON
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('❌ Error parseando JSON:', e);
                throw new Error('Respuesta del servidor no válida');
            }
            
            console.log('✅ Pregunta creada vía API:', result);
            return result.data || result;
            
        } catch (error) {
            console.error('❌ Error en API:', error);
            throw error;
        }
    }

    async loadCommunityQuestions(source = 'unknown') {
        console.log(`🔍 [${source}] Iniciando loadCommunityQuestions`);
        console.log(`🌐 Entorno detectado: ${this.isNetlify() ? 'Netlify' : 'Local'}`);
        
        // Evitar múltiples cargas simultáneas
        if (this.loadingQuestions) {
            console.log('⏳ Ya se están cargando preguntas, saltando...');
            return;
        }
        
        try {
            this.loadingQuestions = true;
            console.log('📋 Cargando preguntas de la comunidad...');
            
            const questionsList = document.getElementById('questionsList');
            if (!questionsList) {
                console.error('❌ Lista de preguntas no encontrada');
                return;
            }
            
            // Mostrar estado de carga
            this.showCommunityLoading();
            
            // Timeout de 10 segundos según PROMPT_CLAUDE.md
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout: La carga tardó demasiado')), 10000);
            });
            
            // Intentar cargar preguntas con múltiples métodos
            const loadPromise = this.loadQuestionsFromDatabase();
            
            const questions = await Promise.race([loadPromise, timeoutPromise]);
            
            if (questions && questions.length > 0) {
                console.log(`✅ ${questions.length} preguntas cargadas`);
                this.renderCommunityQuestions(questions);
            } else {
                console.log('📭 No hay preguntas disponibles');
                this.showCommunityEmpty();
            }
            
        } catch (error) {
            console.error('❌ Error cargando preguntas:', error);
            this.showCommunityError(error.message);
            
            // Intentar recargar después de 5 segundos
            setTimeout(() => {
                console.log('🔄 Reintentando carga...');
                this.loadingQuestions = false;
                this.loadCommunityQuestions(source + '-retry');
            }, 5000);
        } finally {
            this.loadingQuestions = false;
        }
    }

    // Función principal para cargar desde la base de datos
    async loadQuestionsFromDatabase() {
        console.log('🗄️ Intentando cargar preguntas desde base de datos...');
        
        let questions = [];
        
        // PASO 1: Intentar con Supabase directamente (MEJORADO PARA NETLIFY)
        if (window.supabase) {
            console.log('🔍 Verificando conexión a Supabase...');
            
            try {
                // Usar CommunityDatabase para mejor manejo
                if (!window.communityDB) {
                    window.communityDB = new CommunityDatabase();
                    await window.communityDB.initialize();
                }
                
                // Cargar preguntas usando el método mejorado
                questions = await window.communityDB.getQuestions({
                    limit: 20,
                    sort: 'recent'
                });
                
                if (questions && questions.length > 0) {
                    console.log('✅ Preguntas cargadas desde CommunityDatabase:', questions.length);
                    return questions;
                }
                
            } catch (dbError) {
                console.warn('⚠️ Error con CommunityDatabase, intentando Supabase directo:', dbError);
                
                try {
                    // Fallback a consulta directa de Supabase
                    const { data: supabaseQuestions, error } = await window.supabase
                        .from('community_questions')
                        .select(`
                            *,
                            users:user_id (
                                id,
                                display_name,
                                username,
                                profile_picture_url
                            )
                        `)
                        .order('created_at', { ascending: false })
                        .limit(20);
                        
                    if (error) {
                        console.error('❌ Error cargando preguntas desde Supabase directo:', error);
                    } else {
                        questions = supabaseQuestions || [];
                        console.log('✅ Preguntas cargadas desde Supabase directo:', questions.length);
                        return questions;
                    }
                } catch (supabaseError) {
                    console.error('❌ Error general con Supabase:', supabaseError);
                }
            }
        } else {
            console.warn('⚠️ Supabase no está disponible - esperando inicialización...');
            
            // En Netlify, esperar un poco por si Supabase se está inicializando
            if (this.isNetlify()) {
                console.log('🔄 Esperando inicialización de Supabase en Netlify...');
                await this.waitForSupabase(3000); // Esperar max 3 segundos
                
                if (window.supabase) {
                    console.log('✅ Supabase inicializado después de espera');
                    return this.loadQuestionsFromDatabase();
                } else {
                    console.warn('⚠️ Supabase no se inicializó, continuando con fallbacks...');
                }
            }
        }
        
        // PASO 2: Fallback a API de comunidad si Supabase falló
        if (questions.length === 0) {
            try {
                console.log('🌐 Fallback a API de comunidad...');
                questions = await this.loadQuestionsFromAPI();
                
                if (questions && questions.length > 0) {
                    console.log('✅ Preguntas obtenidas de API:', questions.length);
                    return questions;
                }
            } catch (error) {
                console.warn('⚠️ API fallback falló:', error.message);
            }
        }
        
        // Si no hay preguntas, devolver array vacío
        if (questions.length === 0) {
            console.log('📭 No se encontraron preguntas en ningún método');
        }
        
        return questions;
    }

    // Función de fallback para cargar desde API según PROMPT_CLAUDE.md
    async loadQuestionsFromAPI() {
        console.log('📡 Cargando preguntas desde API...');
        
        const endpoints = [
            '/api/community-public?sort=recent&limit=20',
            '/api/community/questions?public=true&sort=recent&limit=20'
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`🔗 Probando endpoint: ${endpoint}`);
                const response = await fetch(endpoint);
                
                if (!response.ok) {
                    console.warn(`⚠️ Endpoint falló: ${endpoint} - ${response.status}`);
                    continue;
                }
                
                const data = await response.json();
                
                if (data.success && data.data) {
                    console.log(`✅ Preguntas cargadas desde ${endpoint}:`, data.data.length);
                    return data.data;
                } else {
                    console.warn(`⚠️ Respuesta inválida de ${endpoint}:`, data);
                    continue;
                }
                
            } catch (error) {
                console.warn(`⚠️ Error en ${endpoint}:`, error.message);
                continue;
            }
        }
        
        throw new Error('Todos los endpoints de API fallaron');
    }

    // Función de fallback mejorada según PROMPT_CLAUDE.md
    async loadCommunityQuestionsWithFallback() {
        console.log('🔄 Intentando cargar con fallback...');
        
        try {
            // Intentar con Supabase primero
            await this.loadCommunityQuestions('fallback-attempt');
        } catch (error) {
            console.warn('⚠️ Supabase falló, usando CommunityDatabase...', error);
            
            try {
                // Inicializar CommunityDatabase si no existe
                if (!this.communityDB) {
                    this.communityDB = new window.CommunityDatabase();
                    await this.communityDB.initialize();
                }
                
                // Cargar preguntas con CommunityDatabase
                const questions = await this.communityDB.getQuestions({
                    course_id: this.currentCourseId,
                    module_id: `module-${this.currentModule}`
                });
                
                console.log('✅ Preguntas cargadas con CommunityDatabase:', questions.length);
                this.renderCommunityQuestions(questions);
                
            } catch (dbError) {
                console.error('❌ CommunityDatabase también falló:', dbError);
                this.showCommunityError('No se pudieron cargar las preguntas');
            }
        }
    }

    async loadCommunityQuestionsWithParams(params = {}) {
        // Función para cargar preguntas con filtros específicos
        if (this.loadingQuestions) {
            console.log('⏳ Ya se están cargando preguntas con parámetros, saltando...');
            return;
        }
        
        try {
            this.loadingQuestions = true;
            console.log('📋 Cargando preguntas con parámetros:', params);
            
            const questionsList = document.getElementById('questionsList');
            if (!questionsList) {
                console.error('❌ Lista de preguntas no encontrada');
                return;
            }
            
            // Mostrar indicador de carga
            questionsList.innerHTML = '<div class="loading-questions"><div class="loading-spinner"></div><span>Filtrando preguntas...</span></div>';
            
            // Combinar parámetros por defecto con los recibidos
            const queryParams = {
                course_id: this.currentCourseId,
                module_id: `module-${this.currentModule}`,
                ...params
            };
            
            let questions = [];
            
            // Try community API first
            try {
                if (window.communityAPI) {
                    console.log('🌐 Usando Community API con parámetros...');
                    const response = await window.communityAPI.getQuestions(queryParams);
                    
                    if (response.success && response.data) {
                        questions = response.data;
                        console.log('✅ Preguntas filtradas de Community API:', questions.length);
                    }
                }
            } catch (error) {
                console.warn('⚠️ Community API no disponible:', error.message);
            }
            
            // Fallback to community database
            if (questions.length === 0 && this.communityDB) {
                try {
                    console.log('🗄️ Fallback a CommunityDatabase con parámetros...');
                    questions = await this.communityDB.getQuestions(queryParams);
                    console.log('✅ Preguntas filtradas de CommunityDatabase:', questions.length);
                } catch (error) {
                    console.warn('⚠️ CommunityDatabase fallback failed:', error.message);
                }
            }
            
            console.log(`✅ ${questions.length} preguntas cargadas con parámetros`);
            
            // Renderizar preguntas
            this.renderQuestions(questions);
            
        } catch (error) {
            console.error('❌ Error cargando preguntas con parámetros:', error);
            const questionsList = document.getElementById('questionsList');
            if (questionsList) {
                questionsList.innerHTML = `
                    <div class="error-message">
                        <div class="error-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <h3>Error al filtrar las preguntas</h3>
                        <p>No se pudieron cargar las preguntas con los filtros aplicados.</p>
                        <button class="btn-secondary" onclick="window.chatOnline.loadCommunityQuestions('retry-button')">
                            Mostrar Todas
                        </button>
                    </div>
                `;
            }
        } finally {
            this.loadingQuestions = false;
        }
    }

    async getQuestionsViaAPI() {
        try {
            // Preparando consulta a API del servidor
            
            const response = await fetch(`/api/community/questions?course_id=${this.currentCourseId}&module_id=module-${this.currentModule}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            // Respuesta procesada exitosamente
            
            return result.data || [];
            
        } catch (error) {
            console.error('❌ Error obteniendo preguntas vía API:', error);
            return [];
        }
    }

    clearHardcodedQuestions() {
        const questionsList = document.getElementById('questionsList');
        if (questionsList) {
            // Remover todas las preguntas hardcodeadas del HTML
            const hardcodedQuestions = questionsList.querySelectorAll('.question-item:not([data-question-id])');
            hardcodedQuestions.forEach(question => question.remove());
            console.log('🧹 Preguntas hardcodeadas limpiadas');
        }
    }

    renderQuestions(questions) {
        const questionsList = document.getElementById('questionsList');
        if (!questionsList) {
            console.error('❌ Lista de preguntas no encontrada');
            return;
        }
        
        // Limpiar completamente el contenedor para evitar duplicaciones
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
                    <button class="btn-primary" onclick="window.showQuestionModal()">
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
        
        // Filtrar preguntas duplicadas basándose en el ID
        const uniqueQuestions = this.removeDuplicateQuestions(questions);
        
        const questionsHTML = uniqueQuestions.map(question => this.renderQuestionItem(question)).join('');
        questionsList.innerHTML = questionsHTML;
        
        // Configurar event listeners para las preguntas renderizadas
        this.setupQuestionEventListeners();
        
        console.log(`✅ ${uniqueQuestions.length} preguntas únicas renderizadas y event listeners configurados`);
    }

    removeDuplicateQuestions(questions) {
        if (!questions || questions.length === 0) {
            return [];
        }
        
        // Usar Map para eliminar duplicados basándose en el ID
        const questionMap = new Map();
        
        questions.forEach(question => {
            // Usar el ID de la pregunta como clave única
            const key = question.id || question.question_id || `temp-${question.title}-${question.created_at}`;
            if (!questionMap.has(key)) {
                questionMap.set(key, question);
            }
        });
        
        const uniqueQuestions = Array.from(questionMap.values());
        
        // Ordenar por fecha de creación (más recientes primero)
        uniqueQuestions.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });
        
        console.log(`🔄 Filtradas ${questions.length} preguntas → ${uniqueQuestions.length} únicas`);
        return uniqueQuestions;
    }

    renderQuestionItem(question) {
        const timeAgo = this.formatTimeAgo(question.created_at);
        const tags = question.tags || [];
        const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        return `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-votes">
                    <button class="vote-btn upvote" title="Votar positivamente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="18,15 12,9 6,15"/>
                        </svg>
                    </button>
                    <span class="vote-count">${question.votes_count || 0}</span>
                    <button class="vote-btn downvote" title="Votar negativamente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6,9 12,15 18,9"/>
                        </svg>
                    </button>
                </div>
                <div class="question-content">
                    <div class="question-header">
                        <h4 class="question-title">${this.escapeHtml(question.title)}</h4>
                        <div class="question-meta">
                            <span class="question-author">
                                <img src="${question.users?.avatar_url || '../../assets/images/default-avatar.svg'}" alt="Usuario" class="author-avatar">
                                ${this.escapeHtml(question.users?.name || 'Usuario')}
                            </span>
                            <span class="question-time">${timeAgo}</span>
                            <span class="question-module">Módulo ${this.currentModule}</span>
                        </div>
                    </div>
                    <div class="question-preview">
                        <p>${this.escapeHtml(question.content.substring(0, 200))}${question.content.length > 200 ? '...' : ''}</p>
                    </div>
                    <div class="question-tags">
                        ${tagsHTML}
                        <span class="tag module-tag">módulo-${this.currentModule}</span>
                    </div>
                    <div class="question-stats">
                        <span class="stat">
                            <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            ${question.answers_count || 0} respuesta${(question.answers_count || 0) !== 1 ? 's' : ''}
                        </span>
                        <span class="stat">
                            <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            ${question.views_count || 0} vista${(question.views_count || 0) !== 1 ? 's' : ''}
                        </span>
                        ${question.is_answered ? '<span class="stat answered"><svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>Respondida</span>' : ''}
                    </div>
                    <div class="question-actions">
                        <button class="action-btn answer-btn" data-question-id="${question.id}" title="Responder pregunta">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            Responder
                        </button>
                        <button class="action-btn comment-btn" data-question-id="${question.id}" title="Comentar pregunta">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 3h18v18l-3-3H3V3z"/>
                            </svg>
                            Comentar
                        </button>
                        <button class="action-btn bookmark-btn" data-question-id="${question.id}" title="Guardar pregunta">
                            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async voteQuestion(questionId, voteType) {
        try {
            console.log(`🗳️ Votando ${voteType} en pregunta ${questionId}`);
            
            // Buscar el elemento de la pregunta para actualizar la UI
            const questionItem = document.querySelector(`[data-question-id="${questionId}"]`);
            const voteCountEl = questionItem?.querySelector('.vote-count');
            const upvoteBtn = questionItem?.querySelector('.vote-btn.upvote');
            const downvoteBtn = questionItem?.querySelector('.vote-btn.downvote');
            
            const voteData = {
                user_id: this.currentUser?.id || 'demo-user',
                target_type: 'question',
                target_id: questionId,
                vote_type: voteType
            };
            
            const response = await fetch('/api/community/votes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(voteData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ Voto procesado:', result);
            
            // Actualizar la UI inmediatamente
            if (voteCountEl && result.new_vote_count !== undefined) {
                voteCountEl.textContent = result.new_vote_count;
            }
            
            // Actualizar estado visual de los botones
            if (upvoteBtn && downvoteBtn) {
                // Remover estados anteriores
                upvoteBtn.classList.remove('voted', 'upvoted', 'downvoted');
                downvoteBtn.classList.remove('voted', 'upvoted', 'downvoted');
                
                // Aplicar nuevo estado
                if (result.user_vote === 'upvote') {
                    upvoteBtn.classList.add('voted', 'upvoted');
                } else if (result.user_vote === 'downvote') {
                    downvoteBtn.classList.add('voted', 'downvoted');
                }
            }
            
        } catch (error) {
            console.error('❌ Error votando:', error);
            this.showNotification('Error al procesar el voto', 'error');
        }
    }

    async filterQuestions(filter) {
        console.log(`🔍 Filtrando preguntas por: ${filter}`);
        
        // Actualizar botones activos
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
        
        // Cargar preguntas con el filtro aplicado (evitar llamada duplicada)
        await this.loadCommunityQuestionsWithParams({ filter });
    }

    async sortQuestions(sort) {
        console.log(`📊 Ordenando preguntas por: ${sort}`);
        
        // Cargar preguntas con el ordenamiento aplicado (evitar llamada duplicada)
        await this.loadCommunityQuestionsWithParams({ sort });
    }

    formatTimeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'hace un momento';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `hace ${days} día${days > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getAuthToken() {
        // Intentar obtener token real
        const token = localStorage.getItem('authToken');
        if (token && token !== 'null' && token !== 'undefined') {
            // Token encontrado y validado
            return token;
        }
        
        // Obtener usuario actual para generar token consistente
        const currentUser = this.obtenerUsuarioActual();
        const userId = currentUser?.id || 'anonymous';
        
        // Token de desarrollo para testing con ID de usuario
        const devToken = `dev-token-${userId}-${Date.now()}`;
        console.log('🔧 Usando token de desarrollo:', devToken);
        return devToken;
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Agregar estilos si no existen
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    padding: 12px 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    max-width: 400px;
                    animation: slideIn 0.3s ease-out;
                }
                .notification-success { background: #10b981; color: white; }
                .notification-error { background: #ef4444; color: white; }
                .notification-info { background: #3b82f6; color: white; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Esperar a que los componentes estén listos
    async waitForComponents() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100; // Máximo 10 segundos
            
            const checkComponents = () => {
                attempts++;
                
                // Verificar si courseProgressManager está completamente inicializado con sus métodos
                const progressManagerReady = window.courseProgressManager && 
                                           typeof window.courseProgressManager === 'object' &&
                                           typeof window.courseProgressManager.getCourseProgress === 'function';
                const youtubeTrackerReady = typeof window.YouTubeProgressTracker !== 'undefined';
                
                if (youtubeTrackerReady && progressManagerReady) {
                    console.log('✅ Todos los componentes están disponibles y completamente inicializados');
                    resolve();
                    return;
                }
                
                // Si courseProgressManager existe pero no está completamente inicializado, intentar continuidad
                if (youtubeTrackerReady && window.courseProgressManager && typeof window.courseProgressManager === 'object') {
                    console.warn('⚠️ courseProgressManager existe pero no está completamente inicializado');
                    console.warn('🔧 Continuando con funcionalidad básica...');
                    resolve();
                    return;
                }
                
                // Si solo YouTube tracker está listo después de cierto tiempo, continuar
                if (attempts > 20 && youtubeTrackerReady) {
                    console.warn('⚠️ Timeout parcial: solo YouTubeProgressTracker disponible');
                    console.warn('🔧 Continuando con funcionalidad limitada...');
                    resolve();
                    return;
                }
                
                // Timeout para evitar loops infinitos
                if (attempts >= maxAttempts) {
                    console.warn('⚠️ Timeout esperando componentes después de', maxAttempts, 'intentos');
                    console.warn('🔧 Forzando continuidad de la aplicación...');
                    resolve(); // Resolver en lugar de rechazar para permitir que la aplicación continúe
                    return;
                }
                
                console.log('⏳ Esperando componentes...', {
                    YouTubeProgressTracker: typeof window.YouTubeProgressTracker,
                    courseProgressManager: typeof window.courseProgressManager,
                    progressManagerMethods: window.courseProgressManager ? Object.getOwnPropertyNames(window.courseProgressManager) : 'no disponible',
                    progressManagerReady: progressManagerReady,
                    attempt: attempts
                });
                
                setTimeout(checkComponents, 100);
            };
            
            checkComponents();
        });
    }
    
    setupYouTubeEvents() {
        // Escuchar eventos del tracker
        window.addEventListener('moduleCompleted', (event) => {
            console.log('🎯 Módulo completado:', event.detail);
            this.handleModuleCompleted(event.detail.moduleNumber);
        });
        
        window.addEventListener('moduleUnlocked', (event) => {
            console.log('🔓 Módulo desbloqueado:', event.detail);
            this.handleModuleUnlocked(event.detail.unlockedModule);
        });
    }
    
    handleModuleCompleted(moduleNumber) {
        console.log(`🎉 Manejando completación del módulo ${moduleNumber}`);
        
        // Actualizar UI de progreso
        this.updateProgressUI();
        
        // Actualizar estado del módulo en la lista
        this.updateModuleStatus(moduleNumber, 'completed');
        
        // Auto-seleccionar siguiente módulo si está disponible
        const nextModule = moduleNumber + 1;
        if (this.courseProgress && this.courseProgress.modules) {
            const nextModuleData = this.courseProgress.modules.find(m => m.module_number === nextModule);
            if (nextModuleData && nextModuleData.status !== 'locked') {
                setTimeout(() => {
                    console.log(`🔄 Auto-seleccionando módulo ${nextModule}`);
                    this.selectModule(nextModule);
                }, 2000);
            }
        }
    }
    
    handleModuleUnlocked(moduleNumber) {
        console.log(`🔓 Manejando desbloqueo del módulo ${moduleNumber}`);
        
        // Actualizar estado del módulo desbloqueado
        this.updateModuleStatus(moduleNumber, 'not_started');
        
        // Actualizar UI
        this.updateProgressUI();
    }
    
    updateModuleStatus(moduleNumber, status) {
        // Actualizar en los datos locales
        if (this.courseProgress && this.courseProgress.modules) {
            const module = this.courseProgress.modules.find(m => m.module_number === moduleNumber);
            if (module) {
                module.status = status;
                if (status === 'completed') {
                    module.progress_percentage = 100;
                    module.video_completed = true;
                    module.video_progress_percentage = 100;
                }
            }
        }
        
        // Actualizar en la UI
        const moduleElement = document.querySelector(`[data-module="${moduleNumber}"]`);
        if (moduleElement) {
            moduleElement.classList.remove('locked', 'not_started', 'in_progress', 'completed');
            moduleElement.classList.add(status);
            
            // Actualizar el círculo de progreso
            const progressCircle = moduleElement.querySelector('.progress-circle');
            if (progressCircle) {
                if (status === 'completed') {
                    progressCircle.style.background = 'var(--glass-primary)';
                    progressCircle.innerHTML = '<i class="fas fa-check"></i>';
                } else if (status === 'locked') {
                    progressCircle.style.background = 'var(--glass-border)';
                    progressCircle.innerHTML = '<i class="fas fa-lock"></i>';
                } else {
                    progressCircle.style.background = 'var(--glass-secondary)';
                    progressCircle.innerHTML = moduleNumber;
                }
            }
        }
    }
    
    setupProgressEvents() {
        // Escuchar eventos de actualización de progreso
        window.addEventListener('courseProgressUpdated', (event) => {
            console.log('📡 Progreso actualizado:', event.detail);
            this.courseProgress = event.detail.progress;
            this.updateProgressUI();
        });
        
        window.addEventListener('videoProgressUpdated', (event) => {
            console.log('📡 Progreso de video actualizado:', event.detail);
            this.courseProgress = event.detail.progress;
            this.updateProgressUI();
            
            if (event.detail.moduleCompleted) {
                this.showModuleCompletedNotification(event.detail.moduleNumber);
            }
        });
    }
    
    // ===== ACTUALIZAR UI DEL PROGRESO =====
    updateProgressUI() {
        if (!this.courseProgress) return;
        
        console.log('🎨 Actualizando UI del progreso...');
        
        // Actualizar progreso general
        this.updateOverallProgress();
        
        // Actualizar progress dots
        this.updateProgressDots();
        
        // Actualizar estados de módulos
        this.updateModuleStates();
        
        // Actualizar información del módulo actual
        this.updateCurrentModuleInfo();
    }
    
    updateOverallProgress() {
        const progressPercentage = document.querySelector('.progress-percentage');
        const progressFill = document.querySelector('.progress-fill');
        
        const percentage = this.courseProgress.overall_progress_percentage || 0;
        
        if (progressPercentage) {
            progressPercentage.textContent = `${percentage}%`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        console.log(`📊 Progreso general actualizado: ${percentage}%`);
    }
    
    updateProgressDots() {
        const progressDots = document.querySelectorAll('.progress-dot');
        const modules = this.courseProgress.modules || [];
        
        progressDots.forEach((dot, index) => {
            const moduleNumber = index + 1;
            const moduleData = modules.find(m => m.module_number === moduleNumber);
            
            if (moduleData) {
                // Limpiar clases existentes
                dot.classList.remove('completed', 'current', 'pending');
                
                // Aplicar clase según el estado
                if (moduleData.status === 'completed') {
                    dot.classList.add('completed');
                } else if (moduleData.status === 'in_progress') {
                    dot.classList.add('current');
                } else {
                    dot.classList.add('pending');
                }
                
                // Actualizar tooltip
                const statusText = {
                    'completed': 'Completado',
                    'in_progress': 'En Progreso', 
                    'not_started': 'Pendiente',
                    'locked': 'Bloqueado'
                };
                
                dot.title = `Módulo ${moduleNumber} ${statusText[moduleData.status]}`;
            }
        });
        
        console.log('🔵 Progress dots actualizados');
    }
    
    updateModuleStates() {
        const moduleItems = document.querySelectorAll('.module-item');
        const modules = this.courseProgress.modules || [];
        
        moduleItems.forEach(item => {
            const moduleNumber = parseInt(item.dataset.module);
            const moduleData = modules.find(m => m.module_number === moduleNumber);
            
            if (moduleData) {
                // Limpiar clases existentes
                item.classList.remove('completed', 'current', 'pending', 'locked');
                
                // Aplicar clase según el estado
                item.classList.add(moduleData.status === 'in_progress' ? 'current' : moduleData.status);
                
                // Deshabilitar si está bloqueado
                if (moduleData.status === 'locked') {
                    item.style.opacity = '0.5';
                    item.style.pointerEvents = 'none';
                } else {
                    item.style.opacity = '1';
                    item.style.pointerEvents = 'auto';
                }
            }
        });
        
        console.log('📚 Estados de módulos actualizados');
    }
    
    updateCurrentModuleInfo() {
        const currentModuleInfo = document.querySelector('.current-module-info span');
        const currentModule = this.courseProgress.current_module || 1;
        const modules = this.courseProgress.modules || [];
        const moduleData = modules.find(m => m.module_number === currentModule);
        
        if (currentModuleInfo && moduleData) {
            currentModuleInfo.textContent = `Módulo ${currentModule}: ${moduleData.module_name}`;
        }
        
        console.log(`📍 Módulo actual: ${currentModule}`);
    }
    
    // ===== MÉTODOS CON PROGRESO =====
    async selectModuleWithProgress(moduleId) {
        console.log(`📚 Seleccionando módulo ${moduleId} con progreso...`);
        
        // Verificar si el módulo está disponible
        if (this.progressManager && this.progressManager.isModuleLocked(moduleId)) {
            console.warn(`🔒 Módulo ${moduleId} está bloqueado`);
            this.showLockedModuleMessage(moduleId);
            return;
        }
        
        // Ejecutar selección básica (evitar recursión)
        this.selectModuleBasic(moduleId);
        
        // Obtener datos del módulo para el video
        let moduleVideoId = null;
        if (this.courseProgress && this.courseProgress.modules) {
            const moduleData = this.courseProgress.modules.find(m => m.module_number === moduleId);
            if (moduleData && moduleData.video_id) {
                moduleVideoId = moduleData.video_id;
            }
        }
        
        // Si no tenemos el video ID desde progreso, cargar desde la base de datos
        if (!moduleVideoId) {
            moduleVideoId = await this.getFirstVideoIdFromDatabase(moduleId);
        }
        
        // Cambiar video usando YouTube Tracker si está disponible
        if (this.youtubeTracker && moduleVideoId) {
            console.log(`🎥 Cambiando video a: ${moduleVideoId} (Módulo ${moduleId})`);
            this.youtubeTracker.changeVideo(moduleVideoId, moduleId);
        } else {
            // Fallback al método tradicional
            this.changeVideoByModule(moduleId);
        }
        
        // Marcar como iniciado si no ha comenzado
        if (this.progressManager) {
            const moduleData = this.progressManager.getModuleProgress(moduleId);
            
            if (moduleData && moduleData.status === 'not_started') {
                try {
                    await this.progressManager.startModule(moduleId);
                    console.log(`▶️ Módulo ${moduleId} iniciado`);
                } catch (error) {
                    console.error('❌ Error iniciando módulo:', error);
                }
            }
        }
        
        // Emitir evento de cambio de módulo para el tracker
        const event = new CustomEvent('moduleChanged', {
            detail: {
                moduleNumber: moduleId,
                videoId: moduleVideoId,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }
    
    async markVideoSectionCompleted(sectionNumber) {
        if (!this.progressManager) return;
        
        try {
            console.log(`✅ Marcando sección ${sectionNumber} como completada...`);
            
            await this.progressManager.markVideoSectionCompleted(
                this.currentModule,
                sectionNumber,
                0, // start time - se puede mejorar con datos reales del video
                0  // end time - se puede mejorar con datos reales del video
            );
            
        } catch (error) {
            console.error('❌ Error marcando sección completada:', error);
        }
    }
    
    async updateVideoPosition(currentTime, duration, percentageComplete) {
        if (!this.progressManager || !currentTime || !duration) return;
        
        try {
            // Actualizar cada 30 segundos o cada 10% de progreso
            const shouldUpdate = (
                currentTime % 30 < 1 || 
                Math.floor(percentageComplete) % 10 === 0
            );
            
            if (shouldUpdate) {
                await this.progressManager.updateVideoProgress(this.currentModule, {
                    last_video_position: Math.floor(currentTime),
                    video_progress_percentage: Math.floor(percentageComplete),
                    video_completed: percentageComplete >= 95, // Considerar completo al 95%
                    time_watched_seconds: 30 // Asumiendo actualización cada 30 segundos
                });
                
                console.log(`🎥 Posición del video actualizada: ${Math.floor(percentageComplete)}%`);
            }
            
        } catch (error) {
            console.error('❌ Error actualizando posición del video:', error);
        }
    }
    
    showLockedModuleMessage(moduleId) {
        const message = `🔒 El Módulo ${moduleId} está bloqueado. Completa los módulos anteriores para desbloquearlo.`;
        
        // Mostrar notificación temporal
        this.showTemporaryNotification(message, 'warning');
    }
    
    showModuleCompletedNotification(moduleNumber) {
        const message = `🎉 ¡Felicitaciones! Has completado el Módulo ${moduleNumber}`;
        
        // Mostrar notificación de éxito
        this.showTemporaryNotification(message, 'success');
        
        // Si no es el último módulo, sugerir continuar
        if (moduleNumber < 5) {
            setTimeout(() => {
                const continueMessage = `¿Quieres continuar con el Módulo ${moduleNumber + 1}?`;
                this.showTemporaryNotification(continueMessage, 'info');
            }, 3000);
        }
    }
    
    showTemporaryNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `progress-notification progress-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Estilos inline para asegurar visibilidad
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-surface);
            border: var(--glass-border);
            border-radius: 12px;
            padding: 1rem;
            box-shadow: var(--glass-shadow);
            backdrop-filter: blur(10px);
            z-index: 10000;
            max-width: 350px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    checkScreenSize() {
        const width = window.innerWidth;
        
        if (width <= 992) {
            this.enableMobileMode();
        } else {
            this.disableMobileMode();
        }
    }
    
    enableMobileMode() {
        console.log('📱 Modo móvil activado');
        // Aquí puedes agregar lógica específica para móvil
    }
    
    disableMobileMode() {
        console.log('🖥️ Modo desktop activado');
        // Aquí puedes agregar lógica específica para desktop
    }
    
    // ===== FUNCIONES DE MENSAJES =====
    copyMessage(button) {
        const messageElement = button.closest('.message-content');
        const messageText = messageElement.querySelector('.message-text').textContent;
        
        navigator.clipboard.writeText(messageText).then(() => {
            // Mostrar feedback visual
            const originalText = button.title;
            button.title = '¡Copiado!';
            button.style.background = 'var(--glass-success)';
            
        setTimeout(() => {
                button.title = originalText;
                button.style.background = '';
            }, 1500);
            
            console.log('📋 Mensaje copiado al portapapeles');
        }).catch(err => {
            console.error('❌ Error al copiar mensaje:', err);
        });
    }
    
    replyToMessage(button) {
        const messageElement = button.closest('.lia-message');
        const messageText = messageElement.querySelector('.message-text').textContent;
        const isUserMessage = messageElement.classList.contains('user-message');
        
        // Mostrar área de respuesta
        const replyArea = document.getElementById('replyArea');
        const replyText = document.getElementById('replyText');
        const input = document.getElementById('liaMessageInput');
        
        replyText.textContent = messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText;
        replyArea.style.display = 'block';
        replyArea.dataset.replyingTo = messageText;
        replyArea.dataset.isUserMessage = isUserMessage;
        
        // Cambiar placeholder del input
        input.placeholder = 'Escribe tu respuesta...';
        input.focus();
        
        console.log('💬 Respondiendo a mensaje');
    }
    
    cancelReply() {
        const replyArea = document.getElementById('replyArea');
        const input = document.getElementById('liaMessageInput');
        
        replyArea.style.display = 'none';
        replyArea.removeAttribute('data-replying-to');
        replyArea.removeAttribute('data-is-user-message');
        
        input.placeholder = 'Pregunta a LIA...';
        input.focus();
        
        console.log('❌ Respuesta cancelada');
    }
    
    createNoteFromMessage(button) {
        console.log('📝 Creando nota desde mensaje...');
        
        // Obtener el mensaje completo
        const messageElement = button.closest('.lia-message, .user-message');
        const messageText = messageElement.querySelector('.message-text').textContent;
        const isUserMessage = messageElement.classList.contains('user-message');
        
        // Crear título automático para la nota
        const noteTitle = this.generateNoteTitle(messageText, isUserMessage);
        
        // Crear contenido de la nota
        const noteContent = this.formatNoteContent(messageText, isUserMessage);
        
        // Crear la nota usando el sistema existente
        this.createNoteFromMessageData(noteTitle, noteContent);
        
        // Mostrar feedback visual
        this.showNoteCreatedFeedback(button);
    }
    
    generateNoteTitle(messageText, isUserMessage) {
        const prefix = isUserMessage ? 'Pregunta: ' : 'Respuesta de LIA: ';
        const maxLength = 50;
        
        if (messageText.length <= maxLength) {
            return prefix + messageText;
        }
        
        // Truncar y agregar puntos suspensivos
        return prefix + messageText.substring(0, maxLength) + '...';
    }
    
    formatNoteContent(messageText, isUserMessage) {
        const timestamp = new Date().toLocaleString('es-ES');
        const header = isUserMessage ? '💬 Pregunta del Usuario' : '🤖 Respuesta de LIA';
        
        return `
            <div class="note-header">
                <h3>${header}</h3>
                <p class="note-timestamp">📅 ${timestamp}</p>
            </div>
            <div class="note-content">
                <p>${messageText}</p>
            </div>
            <div class="note-footer">
                <p><em>Nota creada automáticamente desde el chat</em></p>
            </div>
        `;
    }
    
    createNoteFromMessageData(title, content) {
        // Crear objeto de nota
        const note = {
            id: Date.now(),
            title: title,
            content: content,
            tags: ['chat', 'automático'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Guardar en localStorage usando el sistema existente
        this.saveNoteToStorage(note);
        
        // Actualizar la lista de notas si está visible
        this.loadNotesList();
        
        console.log('📝 Nota creada automáticamente:', note);
    }
    
    showNoteCreatedFeedback(button) {
        // Cambiar temporalmente el botón para mostrar feedback
        const originalTitle = button.title;
        const originalHTML = button.innerHTML;
        
        button.title = '¡Nota creada!';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
            </svg>
        `;
        button.style.background = 'var(--glass-success)';
        button.style.color = 'white';
        
        // Restaurar después de 2 segundos
        setTimeout(() => {
            button.title = originalTitle;
            button.innerHTML = originalHTML;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
        
        console.log('✅ Nota creada exitosamente');
    }
    
    // ===== UTILIDADES =====
    autoResizeInput(input) {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
    }
    
    scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    stripHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }
    
    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'ahora';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `hace ${minutes} min`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `hace ${hours}h`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `hace ${days}d`;
        }
    }
    
    // Método placeholder - Los datos iniciales se cargan por otros sistemas
    loadInitialData() {
        console.log('📊 loadInitialData() - Los datos se cargan mediante otros sistemas (CourseProgressManager, etc.)');
        // Este método es llamado por compatibilidad, pero los datos ahora se cargan por:
        // - CourseProgressManager para progreso de cursos
        // - Module1VideosLoader para videos del módulo 1  
        // - DynamicVideoLoader para estructura general
    }
    
    cleanDuplicateNotes() {
        const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        const uniqueNotes = [];
        const seenIds = new Set();
        
        // Filtrar notas duplicadas por ID
        notes.forEach(note => {
            if (!seenIds.has(note.id)) {
                seenIds.add(note.id);
                uniqueNotes.push(note);
            }
        });
        
        // Guardar solo las notas únicas
        localStorage.setItem('lia_notes', JSON.stringify(uniqueNotes));
        
        console.log(`🧹 Limpiadas ${notes.length - uniqueNotes.length} notas duplicadas`);
        console.log(`📊 Total de notas únicas: ${uniqueNotes.length}`);
    }
    
    // Función temporal para debuggear - puedes llamarla desde la consola
    debugNotes() {
        const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        console.log('📊 Estado actual de las notas:');
        console.log(`Total de notas: ${notes.length}`);
        console.log('Notas:', notes);
        
        // Verificar duplicados
        const ids = notes.map(note => note.id);
        const uniqueIds = [...new Set(ids)];
        console.log(`IDs únicos: ${uniqueIds.length}`);
        console.log(`Duplicados: ${ids.length - uniqueIds.length}`);
    }
    
    // Función temporal para limpiar todas las notas (solo para emergencias)
    clearAllNotes() {
        if (confirm('¿Estás seguro de que quieres eliminar TODAS las notas? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('lia_notes');
            this.loadNotesList();
            console.log('🗑️ Todas las notas eliminadas');
        }
    }
    
    // Función específica para eliminar la nota "xs" hardcodeada
    removeHardcodedXsNote() {
        console.log('🧹 Eliminando nota hardcodeada "xs"...');
        
        // 1. Limpiar localStorage completamente
        console.log('🗑️ Limpiando localStorage...');
        localStorage.removeItem('lia_notes');
        
        // 2. Limpiar cualquier nota del DOM directamente
        console.log('🗑️ Limpiando DOM...');
        const notesList = document.getElementById('notesList');
        if (notesList) {
            // Buscar y eliminar cualquier nota que contenga "xs"
            const noteItems = notesList.querySelectorAll('.note-item');
            let removedFromDOM = 0;
            
            noteItems.forEach(item => {
                const noteContent = item.textContent || '';
                if (noteContent.includes('xs') || noteContent.trim() === 'xs') {
                    console.log('🗑️ Eliminando del DOM nota que contiene "xs":', noteContent);
                    item.remove();
                    removedFromDOM++;
                }
            });
            
            console.log(`🗑️ Eliminadas ${removedFromDOM} notas del DOM`);
            
            // Si no hay notas, mostrar mensaje vacío
            const remainingNotes = notesList.querySelectorAll('.note-item');
            if (remainingNotes.length === 0) {
                notesList.innerHTML = `
                    <div class="no-notes">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <p>No hay notas aún</p>
                        <span>Crea tu primera nota para comenzar</span>
                    </div>
                `;
            }
        }
        
        // 3. Forzar recarga de la lista
        setTimeout(() => {
            this.loadNotesList();
        }, 100);
        
        console.log('✅ Limpieza completa realizada');
        return true;
    }
    
    // Función nuclear - elimina TODO
    nuclearCleanNotes() {
        console.log('💥 LIMPIEZA NUCLEAR DE NOTAS...');
        
        // Eliminar del localStorage
        localStorage.removeItem('lia_notes');
        localStorage.removeItem('notes'); // Por si acaso hay otra clave
        localStorage.removeItem('userNotes'); // Por si acaso
        
        // Limpiar el DOM completamente
        const notesList = document.getElementById('notesList');
        if (notesList) {
            notesList.innerHTML = `
                <div class="no-notes">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <p>No hay notas aún</p>
                    <span>Todas las notas han sido eliminadas</span>
                </div>
            `;
        }
        
        // Limpiar la propiedad de la clase
        this.notes = [];
        
        console.log('💥 LIMPIEZA NUCLEAR COMPLETADA');
        return true;
    }
    
    updateProgress(percentage) {
        const progressFill = document.querySelector('.progress-fill-modern');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    }
    
    loadSampleNotes() {
        // Cargar notas desde localStorage
        this.loadNotesList();
        console.log('📝 Notas cargadas desde localStorage');
    }
    
    loadNotesList() {
        console.log('🔍 loadNotesList() ejecutándose...');

        const notesList = document.getElementById('notesList');
        console.log('📋 Elemento notesList encontrado:', !!notesList);

        if (!notesList) {
            console.error('❌ No se encontró el elemento notesList');
            return;
        }

        const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        console.log('📝 Notas en localStorage:', notes.length, notes);

        if (notes.length === 0) {
            console.log('📝 No hay notas, mostrando estado vacío');
            notesList.innerHTML = `
                <div class="no-notes">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <p>No hay notas aún</p>
                    <span>Crea tu primera nota para comenzar</span>
                </div>
            `;
            return;
        }

        // Ordenar notas por fecha de actualización (más recientes primero)
        const sortedNotes = notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        console.log('📝 Notas ordenadas:', sortedNotes);

        notesList.innerHTML = sortedNotes.map(note => this.createNoteHTML(note)).join('');
        console.log('✅ Notas cargadas en el DOM');

        // Agregar event listeners a las notas
        this.setupNoteClickListeners();
    }
    
    setupNoteClickListeners() {
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const noteId = parseInt(item.dataset.noteId);
                console.log('📝 Abriendo nota:', noteId);
                this.openNoteForEditing(noteId);
            });
        });
    }
    
    openNoteForEditing(noteId) {
        const note = this.getNoteById(noteId);
        if (!note) {
            console.error('❌ Nota no encontrada:', noteId);
            return;
        }
        
        console.log('📝 Abriendo nota para edición:', note.title);
        
        // Usar la función openNotePanel que configura correctamente las variables (instantáneo)
        if (typeof window.openNotePanel === 'function') {
            console.log('🚀 Abriendo modal overlay usando openNotePanel (instantáneo)...');
            window.openNotePanel(note);
        } else {
            console.error('❌ openNotePanel no está disponible');
            // Fallback: abrir modal directamente (instantáneo)
            const notePanelOverlay = document.getElementById('notePanelOverlay');
            if (notePanelOverlay) {
                console.log('🚀 Abriendo modal overlay como fallback (instantáneo)...');
                
                // Mostrar el modal inmediatamente
                notePanelOverlay.style.display = 'flex';
                notePanelOverlay.classList.add('active');
                
                // Llenar campos inmediatamente
                const titleInput = document.getElementById('noteTitleInput');
                const contentEditor = document.getElementById('noteEditor');
                
                if (titleInput) titleInput.value = note.title || '';
                if (contentEditor) contentEditor.innerHTML = note.content || '';
                
                // Configurar la variable global para el modal overlay
                window.currentEditingNote = note;
                
                // Enfocar el editor inmediatamente
                if (contentEditor) contentEditor.focus();
                
                console.log('🚀 Modal abierto instantáneamente con datos de la nota:', note.title);
            } else {
                console.error('❌ Modal overlay no encontrado, usando editor interno como fallback');
                // Fallback al editor interno si el modal no existe
                this.showNotesCreator();
                
                // Llenar los campos con los datos de la nota
                const titleInput = document.getElementById('noteTitleInputCreator');
                const contentEditor = document.getElementById('noteContentEditor');
                
                if (titleInput) titleInput.value = note.title || '';
                if (contentEditor) contentEditor.innerHTML = note.content || '';
            }
        }
    }
    
    getNoteById(noteId) {
        const notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        return notes.find(note => note.id === noteId);
    }
    
    deleteNote(noteId) {
        let notes = JSON.parse(localStorage.getItem('lia_notes') || '[]');
        
        // Filtrar la nota a eliminar
        notes = notes.filter(note => note.id !== noteId);
        
        // Guardar la lista actualizada
        localStorage.setItem('lia_notes', JSON.stringify(notes));
        
        // Actualizar la lista en la interfaz
        this.loadNotesList();
        
        console.log('🗑️ Nota eliminada:', noteId);
    }
    
    // Función de búsqueda de notas para compatibilidad
    searchNotes() {
        console.log('🔍 Activando búsqueda de notas...');
        
        // Buscar el botón de búsqueda y hacer clic en él
        const searchBtn = document.getElementById('searchNotesBtn');
        if (searchBtn) {
            searchBtn.click();
        } else {
            console.error('❌ Botón de búsqueda no encontrado');
        }
    }
    
    createNoteHTML(note) {
        const tagsHTML = (note.tags && Array.isArray(note.tags) ? note.tags : []).map(tag => `
            <span class="tag">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                </svg>
                ${this.escapeHtml(tag)}
            </span>
        `).join('');
        
        const timeAgo = this.getTimeAgo(note.updatedAt);
        const contentPreview = this.stripHTML(note.content).substring(0, 100);
        
        return `
            <div class="note-item" data-note-id="${note.id}">
                <div class="note-header">
                    <span class="note-title">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        ${this.escapeHtml(note.title)}
                    </span>
                    <span class="note-time">${timeAgo}</span>
                </div>
                <div class="note-content">
                    <p>${this.escapeHtml(contentPreview)}${contentPreview.length >= 100 ? '...' : ''}</p>
                </div>
                <div class="note-tags">
                    ${tagsHTML}
                </div>
                    <div class="note-actions">
                    <button class="note-delete-btn" onclick="(window.chatOnline?.deleteNote || window.deleteNote)?.(${note.id})" title="Eliminar nota">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        </button>
                    </div>
                </div>
        `;
    }
    
    // ===== CONTENIDO DE PESTAÑAS =====
    showVideoContent() {
        console.log('🎥 Mostrando contenido de video');
        
        // Ocultar contenido de materiales y quiz
        this.hideMaterialsContent();
        this.hideQuizContent();
        
        // Asegurar que los resultados del quiz estén ocultos específicamente
        const quizResults = document.querySelector('.quiz-results');
        if (quizResults) {
            quizResults.style.display = 'none';
            quizResults.classList.remove('content-visible');
        }
        
        // NO resetear el estado de resultados del quiz - deben persistir
        // this.quizResultsShown = false; // Comentado para mantener persistencia
        
        // Mostrar contenido de video
        const videoContent = document.querySelector('.main-video-player');
        const contentTabs = document.querySelector('.content-tabs');
        const contentArea = document.querySelector('.content-area');
        
        if (videoContent) videoContent.style.display = 'block';
        if (contentTabs) contentTabs.style.display = 'flex';
        if (contentArea) contentArea.style.display = 'block';
        
        // Agregar clase para animación
        if (videoContent) videoContent.classList.add('content-visible');
    }
    
    showMaterialsContent() {
        console.log('📚 Mostrando materiales');
        
        // Ocultar contenido de video y quiz
        this.hideVideoContent();
        this.hideQuizContent();
        
        // Crear y mostrar contenido de materiales
        this.createMaterialsContent();
        
        // Agregar clase para animación
        const materialsContent = document.querySelector('.materials-content');
        if (materialsContent) materialsContent.classList.add('content-visible');
    }
    
    showQuizContent() {
        console.log('❓ Mostrando quiz');
        
        // Ocultar contenido de video y materiales
        this.hideVideoContent();
        this.hideMaterialsContent();
        
        // Verificar si ya hay resultados mostrados
        const existingResults = document.querySelector('.quiz-results');
        const existingQuiz = document.querySelector('.quiz-content');
        
        if (this.quizResultsShown && existingResults) {
            // Si hay resultados, solo mostrarlos (no crear nuevo quiz)
            console.log('📊 Mostrando resultados existentes del quiz');
            existingResults.style.display = 'block';
            existingResults.classList.add('content-visible');
            
            // Ocultar quiz si existe
            if (existingQuiz) {
                existingQuiz.style.display = 'none';
                existingQuiz.classList.remove('content-visible');
            }
        } else {
            // Si no hay resultados, crear/mostrar el quiz
        this.createQuizContent();
        
        // Agregar clase para animación
        const quizContent = document.querySelector('.quiz-content');
        if (quizContent) {
            quizContent.style.display = 'block';
            quizContent.classList.add('content-visible');
        }
        
            // Asegurar que no hay resultados visibles
            if (existingResults) {
                existingResults.style.display = 'none';
                existingResults.classList.remove('content-visible');
            }
        }
    }
    
    // ===== FUNCIONES DE OCULTAR CONTENIDO =====
    hideVideoContent() {
        const videoContent = document.querySelector('.main-video-player');
        const contentTabs = document.querySelector('.content-tabs');
        const contentArea = document.querySelector('.content-area');
        
        if (videoContent) {
            videoContent.style.display = 'none';
            videoContent.classList.remove('content-visible');
        }
        if (contentTabs) contentTabs.style.display = 'none';
        if (contentArea) contentArea.style.display = 'none';
    }
    
    hideMaterialsContent() {
        const materialsContent = document.querySelector('.materials-content');
        if (materialsContent) {
            materialsContent.style.display = 'none';
            materialsContent.classList.remove('content-visible');
        }
        
        // También ocultar resultados del quiz si están visibles
        const quizResults = document.querySelector('.quiz-results');
        if (quizResults) {
            quizResults.style.display = 'none';
            quizResults.classList.remove('content-visible');
        }
    }
    
    hideQuizContent() {
        const quizContent = document.querySelector('.quiz-content');
        const quizResults = document.querySelector('.quiz-results');
        
        if (quizContent) {
            quizContent.style.display = 'none';
            quizContent.classList.remove('content-visible');
        }
        
        if (quizResults) {
            quizResults.style.display = 'none';
            quizResults.classList.remove('content-visible');
        }
    }
    
    // ===== CREAR CONTENIDO DE MATERIALES =====
    createMaterialsContent() {
        const centerPanel = document.querySelector('.center-panel .course-content');
        if (!centerPanel) return;
        
        // Remover contenido existente de materiales si existe
        const existingMaterials = document.querySelector('.materials-content');
        if (existingMaterials) {
            existingMaterials.remove();
        }
        
        // Crear nuevo contenido de materiales con HTML directo
        const materialsHTML = `
            <div class="materials-content">
                <div class="materials-header">
                    <h2>
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                        </svg>
                        Materiales del Curso
                    </h2>
                    <p>Recursos adicionales para complementar tu aprendizaje</p>
                </div>
                <div class="materials-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                    
                    <!-- Lección 1 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">01</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">Introducción a la IA</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Conceptos fundamentales y aplicaciones de la Inteligencia Artificial</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 15 min</span>
                                <span class="lesson-status completed" style="background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #16A34A;">Completado</span>
                            </div>
                        </div>
                        <button class="play-btn" onclick="window.chatOnline.playLesson(1)" style="width: 48px; height: 48px; background: linear-gradient(135deg, #0066CC, #0052A3); border: 2px solid #0066CC; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Lección 2 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">02</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">Historia de la IA</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Evolución histórica desde los primeros algoritmos hasta la actualidad</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 22 min</span>
                                <span class="lesson-status current" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #D97706;">En Progreso</span>
                            </div>
                        </div>
                        <button class="play-btn" onclick="window.chatOnline.playLesson(2)" style="width: 48px; height: 48px; background: linear-gradient(135deg, #0066CC, #0052A3); border: 2px solid #0066CC; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Lección 3 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">03</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">Machine Learning Básico</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Fundamentos del aprendizaje automático y sus aplicaciones</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 18 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.6); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Lección 4 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">04</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">Redes Neuronales</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Arquitectura y funcionamiento de las redes neuronales artificiales</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 25 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.6); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Lección 5 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">05</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">Procesamiento de Lenguaje Natural</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Cómo las máquinas comprenden y procesan el lenguaje humano</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 20 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.6); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Lección 6 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">06</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">Visión por Computadora</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Tecnologías para el reconocimiento y análisis de imágenes</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 28 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.6); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Lección 7 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">07</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">Ética en IA</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Consideraciones éticas y responsabilidad en el desarrollo de IA</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 16 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.6); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Lección 8 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">08</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">IA Generativa</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Modelos de IA capaces de generar contenido original</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 24 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.6); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Lección 9 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">09</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">Automatización con IA</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Aplicación de IA para automatizar procesos y tareas</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 30 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.6); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Lección 10 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">10</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">Futuro de la IA</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Tendencias y perspectivas futuras en Inteligencia Artificial</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 19 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.6); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Lección 11 -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">11</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.75rem; line-height: 1.3;">Proyecto Final</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem;">Proyecto integrador para aplicar todos los conocimientos adquiridos</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 45 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.6); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                </div>
            </div>
        `;
        
        centerPanel.insertAdjacentHTML('beforeend', materialsHTML);
    }
    
    // ===== CREAR CONTENIDO DE QUIZ =====
    createQuizContent() {
        const centerPanel = document.querySelector('.center-panel .course-content');
        if (!centerPanel) return;
        
        // Remover contenido existente de quiz si existe
        const existingQuiz = document.querySelector('.quiz-content');
        if (existingQuiz) {
            existingQuiz.remove();
        }
        
        // Si hay resultados mostrados, no crear nuevo quiz (mantener resultados)
        if (this.quizResultsShown) {
            console.log('📊 Resultados ya mostrados, no creando nuevo quiz');
            return;
        }
        
        // Crear nuevo contenido de quiz
        const quizHTML = `
            <div class="quiz-content">
                <div class="quiz-header">
                    <h2>
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Quiz del Módulo ${this.currentModule}
                    </h2>
                    <p>Pon a prueba tus conocimientos con estas preguntas</p>
                    
                    <!-- Cronómetro -->
                    <div class="quiz-timer-container">
                        <div class="timer-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                        </div>
                        <div class="timer-display">
                            <span class="timer-text">Tiempo restante:</span>
                            <span class="timer-value" id="quizTimer">3:00</span>
                        </div>
                        <div class="timer-progress">
                            <div class="timer-progress-bar" id="timerProgressBar"></div>
                        </div>
                    </div>
                </div>
                
                <div class="quiz-container">
                    <div class="question-card">
                        <div class="question-header">
                            <span class="question-number">Pregunta 1 de 5</span>
                        </div>
                        
                        <h3 class="question-text">¿Qué es la Inteligencia Artificial?</h3>
                        
                        <div class="answer-options">
                            <label class="answer-option">
                                <input type="radio" name="q1" value="a">
                                <span class="answer-text">A) Una tecnología que permite a las máquinas pensar como humanos</span>
                            </label>
                            
                            <label class="answer-option">
                                <input type="radio" name="q1" value="b">
                                <span class="answer-text">B) Un programa de computadora que puede jugar ajedrez</span>
                            </label>
                            
                            <label class="answer-option">
                                <input type="radio" name="q1" value="c">
                                <span class="answer-text">C) Un sistema que puede realizar tareas que normalmente requieren inteligencia humana</span>
                            </label>
                            
                            <label class="answer-option">
                                <input type="radio" name="q1" value="d">
                                <span class="answer-text">D) Solo robots humanoides</span>
                            </label>
                        </div>
                        
                        <div class="question-actions">
                            <button class="btn-secondary" onclick="window.chatOnline.previousQuestion()">Anterior</button>
                            <button class="btn-primary" onclick="window.chatOnline.nextQuestion()">Siguiente</button>
                        </div>
                    </div>
                    
                    <div class="quiz-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 20%"></div>
                        </div>
                        <span class="progress-text">1 de 5 preguntas</span>
                    </div>
                </div>
            </div>
        `;
        
        centerPanel.insertAdjacentHTML('beforeend', quizHTML);
        
        // Iniciar el cronómetro del quiz
        this.startQuizTimer();
    }
    
    // ===== FUNCIONES AUXILIARES =====
    downloadMaterial(filename) {
        console.log(`📥 Descargando material: ${filename}`);
        // Aquí implementarías la lógica real de descarga
        alert(`Descargando ${filename}...`);
    }
    
    openLinks() {
        console.log('🔗 Abriendo enlaces de referencia');
        // Aquí implementarías la lógica para mostrar enlaces
        alert('Enlaces de referencia:\n• https://example.com/ia-basics\n• https://example.com/ml-intro');
    }
    
    playLesson(lessonNumber) {
        // Definir información de cada lección
        const lessons = {
            1: { 
                title: "Introducción a la IA", 
                duration: "15 min",
                status: "available",
                description: "Conceptos fundamentales y aplicaciones de la Inteligencia Artificial"
            },
            2: { 
                title: "Historia de la IA", 
                duration: "22 min",
                status: "available",
                description: "Evolución histórica desde los primeros algoritmos hasta la actualidad"
            },
            3: { 
                title: "Machine Learning Básico", 
                duration: "18 min",
                status: "locked",
                description: "Fundamentos del aprendizaje automático y sus aplicaciones"
            },
            4: { 
                title: "Redes Neuronales", 
                duration: "25 min",
                status: "locked",
                description: "Arquitectura y funcionamiento de las redes neuronales artificiales"
            },
            5: { 
                title: "Procesamiento de Lenguaje Natural", 
                duration: "20 min",
                status: "locked",
                description: "Cómo las máquinas comprenden y procesan el lenguaje humano"
            },
            6: { 
                title: "Visión por Computadora", 
                duration: "28 min",
                status: "locked",
                description: "Tecnologías para el reconocimiento y análisis de imágenes"
            },
            7: { 
                title: "Ética en IA", 
                duration: "16 min",
                status: "locked",
                description: "Consideraciones éticas y responsabilidad en el desarrollo de IA"
            },
            8: { 
                title: "IA Generativa", 
                duration: "24 min",
                status: "locked",
                description: "Modelos de IA capaces de generar contenido original"
            },
            9: { 
                title: "Automatización con IA", 
                duration: "30 min",
                status: "locked",
                description: "Aplicación de IA para automatizar procesos y tareas"
            },
            10: { 
                title: "Futuro de la IA", 
                duration: "19 min",
                status: "locked",
                description: "Tendencias y perspectivas futuras en Inteligencia Artificial"
            },
            11: { 
                title: "Proyecto Final", 
                duration: "45 min",
                status: "locked",
                description: "Proyecto integrador para aplicar todos los conocimientos adquiridos"
            }
        };

        const lesson = lessons[lessonNumber];
        
        if (!lesson) {
            console.log(`❌ Lección ${lessonNumber} no encontrada`);
            return;
        }

        if (lesson.status === 'locked') {
            console.log(`🔒 Lección ${lessonNumber} bloqueada`);
            alert(`La lección "${lesson.title}" está bloqueada. Complete las lecciones anteriores para desbloquearla.`);
            return;
        }

        console.log(`▶️ Reproduciendo lección ${lessonNumber}: ${lesson.title}`);
        
        // Cambiar a la pestaña de video y cargar la lección específica
        this.showVideoContent();
        
        // Simular carga de video con información específica
        setTimeout(() => {
            const videoPlayer = document.querySelector('.main-video-player');
            if (videoPlayer) {
                videoPlayer.innerHTML = `
                    <div class="video-container" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 2rem; text-align: center; margin: 2rem 0;">
                        <div class="video-header" style="margin-bottom: 2rem;">
                            <div class="lesson-number-large" style="background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin: 0 auto 1rem;">
                                ${String(lessonNumber).padStart(2, '0')}
                            </div>
                            <h2 style="color: #FFFFFF; font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem;">${lesson.title}</h2>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 1.1rem; margin-bottom: 1rem;">${lesson.description}</p>
                            <div class="video-meta" style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 2rem;">
                                <span style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ ${lesson.duration}</span>
                                <span style="background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; border: 1px solid #16A34A;">📚 Lección ${lessonNumber} de 11</span>
                            </div>
                        </div>
                        
                        <div class="video-placeholder" style="background: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 4rem 2rem; margin-bottom: 1.5rem; border: 2px dashed rgba(0, 102, 204, 0.3);">
                            <div class="video-icon" style="margin-bottom: 1rem;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; color: #0066CC; margin: 0 auto; display: block;">
                                    <polygon points="5,3 19,12 5,21"/>
                                </svg>
                            </div>
                            <h3 style="color: #FFFFFF; font-size: 1.3rem; margin-bottom: 1rem;">Video en reproducción</h3>
                            <p style="color: rgba(255, 255, 255, 0.7); font-size: 1rem;">Contenido de la lección "${lesson.title}"</p>
                            <div class="loading-bar" style="width: 100%; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; margin-top: 1.5rem; overflow: hidden;">
                                <div class="loading-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #0066CC, #00A3FF); border-radius: 2px; animation: loading 3s ease-in-out infinite;"></div>
                            </div>
                        </div>
                        
                        <div class="video-controls" style="display: flex; justify-content: center; gap: 1rem;">
                            <button onclick="alert('⏸️ Video pausado')" style="background: linear-gradient(135deg, #0066CC, #0052A3); border: 2px solid #0066CC; border-radius: 8px; color: white; padding: 0.8rem 1.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                ⏸️ Pausar
                            </button>
                            <button onclick="alert('📝 Tomando notas...')" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 8px; color: #0066CC; padding: 0.8rem 1.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                📝 Notas
                            </button>
                            <button onclick="alert('⚡ Aumentando velocidad de reproducción')" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 8px; color: #0066CC; padding: 0.8rem 1.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                ⚡ Velocidad
                            </button>
                        </div>
                    </div>

                    <style>
                        @keyframes loading {
                            0% { width: 0%; }
                            50% { width: 70%; }
                            100% { width: 100%; }
                        }
                        
                        .video-controls button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
                        }
                    </style>
                `;
            }
        }, 300);
    }
    
    previousQuestion() {
        console.log('⬅️ Pregunta anterior');
        // Implementar navegación entre preguntas
    }
    
    nextQuestion() {
        console.log('🚀 nextQuestion() llamado');
        console.log('🔍 Current question index:', this.currentQuestionIndex);
        console.log('🔍 Quiz data length:', this.quizData?.length);
        
        const qData = this.quizData[this.currentQuestionIndex];
        console.log('🔍 Question data:', qData);
        
        let answer;

        switch (qData.type) {
            case 'single':
            case 'boolean':
                const sel = document.querySelector('.answer-options input:checked');
                console.log('🔍 Selected input:', sel);
                if (!sel) { 
                    console.log('❌ No hay respuesta seleccionada');
                    alert('Selecciona una respuesta.'); 
                    return; 
                }
                answer = sel.value;
                console.log('✅ Respuesta capturada:', answer);
                break;
            case 'multiple':
                const checks = Array.from(document.querySelectorAll('.answer-options input[type="checkbox"]:checked'));
                console.log('🔍 Checkboxes seleccionados:', checks);
                if (checks.length === 0) { alert('Selecciona al menos una opción.'); return; }
                answer = checks.map(c => c.value);
                break;
            case 'text':
                const txt = document.querySelector('.answer-textarea').value.trim();
                console.log('🔍 Texto ingresado:', txt);
                if (!txt) { alert('Por favor escribe tu respuesta.'); return; }
                answer = txt;
                break;
            case 'match':
                const selects = Array.from(document.querySelectorAll('.match-select'));
                const pairAns = {};
                let incomplete = false;
                selects.forEach((s, idx)=>{
                    if (!s.value) incomplete = true; else pairAns[idx] = s.value;
                });
                if (incomplete) { alert('Completa todas las correspondencias.'); return; }
                answer = pairAns;
                break;
        }

        this.userAnswers[this.currentQuestionIndex] = answer;
        console.log('✅ Respuesta guardada:', answer);
        console.log('🔍 Todas las respuestas:', this.userAnswers);

        if (this.currentQuestionIndex < this.quizData.length - 1) {
            console.log('➡️ Avanzando a siguiente pregunta');
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
        } else {
            console.log('🏁 Quiz terminado, mostrando resultados');
            this.finishQuiz();
        }
    }
    
    /**
     * Devuelve las preguntas del quiz para el módulo actual.
     */
    getQuizData() {
        return [
            {
                type: 'single',
                question: '¿Cuál de los siguientes elementos del prompt garantiza la fiabilidad de la investigación solicitada a Gemini?',
                options: [
                    { value: 'a', text: 'Incluir casos de uso en finanzas y banca.' },
                    { value: 'b', text: 'Pedir que actúe "como un analista experto en IA generativa".' },
                    { value: 'c', text: 'Exigir la cita numerada de cada dato o afirmación.' },
                    { value: 'd', text: 'Solicitar un resumen de audio al final.' }
                ],
                correct: 'c',
                feedbackCorrect: '¡Exacto! Exigir citas numeradas asegura la trazabilidad y credibilidad de la información.',
                feedbackIncorrect: 'La opción correcta era exigir la cita numerada; esto permite verificar cada afirmación.'
            },
            {
                type: 'multiple',
                question: 'El prompt define un ____ profesional ("analista experto") y proporciona una estructura ____ de puntos numerados, lo que facilita a Gemini generar salidas reutilizables como infografías.',
                options: [
                    { value: 'clara', text: 'Clara' },
                    { value: 'rol', text: 'Rol' },
                    { value: 'fuerte', text: 'Fuerte' },
                    { value: 'lugar', text: 'Lugar' }
                ],
                correct: ['rol', 'clara'],
                feedbackCorrect: 'Correcto: el prompt establece claramente el rol y una estructura clara.',
                feedbackIncorrect: 'La respuesta correcta era "Rol" y "Clara": define quién habla y una estructura legible.'
            },
            {
                type: 'boolean',
                question: 'El flujo de trabajo indica que, después de crear la infografía, el usuario debe cerrar la pestaña de Canvas para volver al proyecto de investigación principal.',
                options: [
                    { value: 'true', text: 'Verdadero' },
                    { value: 'false', text: 'Falso' }
                ],
                correct: 'true',
                feedbackCorrect: '¡Bien! Seguir ese paso asegura volver al flujo principal sin perder contexto.',
                feedbackIncorrect: 'Incorrecto: El paso correcto es cerrar Canvas para regresar al proyecto principal.'
            },
            {
                type: 'text',
                question: 'En 1-2 frases, explica por qué el prompt reserva una sección específica para "Desafíos y consideraciones estratégicas para líderes" en la adopción de IA generativa.',
                options: [],
                correct: null,
                feedbackCorrect: 'Gracias por tu reflexión. Un evaluador revisará tu respuesta.',
                feedbackIncorrect: 'Respuesta registrada. Un evaluador proporcionará comentarios específicos.'
            },
            {
                type: 'match',
                question: 'Relaciona cada salida del flujo de trabajo con su objetivo principal:',
                pairs: {
                    '1. Reporte web interactivo.': ['A', 'B', 'C', 'D'],
                    '2. Infografía visual.': ['A', 'B', 'C', 'D'],
                    '3. Cuestionario': ['A', 'B', 'C', 'D'],
                    '4. Resumen de audio': ['A', 'B', 'C', 'D']
                },
                legend: {
                    A: 'Validar conocimientos adquiridos',
                    B: 'Repaso auditivo en multitarea',
                    C: 'Exploración profunda y compartible',
                    D: 'Impacto rápido y sintético'
                },
                correct: {
                    0: 'C',
                    1: 'D',
                    2: 'A',
                    3: 'B'
                },
                feedbackCorrect: '¡Perfecto! Has emparejado correctamente cada salida con su objetivo.',
                feedbackIncorrect: 'Algunas correspondencias eran distintas. Revisa la leyenda para entender cada objetivo.'
            }
        ];
    }
    
    /**
     * Renderiza la pregunta actual del quiz
     */
    renderCurrentQuestion() {
        console.log('🎨 Renderizando pregunta:', this.currentQuestionIndex);
        const questionData = this.quizData[this.currentQuestionIndex];
        if (!questionData) return;

        const questionCard = document.querySelector('.quiz-container .question-card');
        if (!questionCard) {
            console.error('❌ No se encontró .question-card');
            return;
        }

        // Construir HTML según el tipo
        let inputHTML = '';
        switch (questionData.type) {
            case 'single':
            case 'boolean':
                questionData.options.forEach(opt => {
                    const checked = this.userAnswers[this.currentQuestionIndex] === opt.value;
                    inputHTML += `
                        <label class="answer-option">
                            <input type="radio" name="q${this.currentQuestionIndex}" value="${opt.value}" ${checked ? 'checked' : ''}>
                            <span class="answer-text">${opt.text}</span>
                        </label>`;
                });
                break;
            case 'multiple':
                questionData.options.forEach(opt => {
                    const checked = Array.isArray(this.userAnswers[this.currentQuestionIndex]) && this.userAnswers[this.currentQuestionIndex].includes(opt.value);
                    inputHTML += `
                        <label class="answer-option">
                            <input type="checkbox" name="q${this.currentQuestionIndex}" value="${opt.value}" ${checked ? 'checked' : ''}>
                            <span class="answer-text">${opt.text}</span>
                        </label>`;
                });
                break;
            case 'text':
                const savedText = this.userAnswers[this.currentQuestionIndex] || '';
                inputHTML = `<textarea name="q${this.currentQuestionIndex}" rows="4" class="answer-textarea" placeholder="Escribe tu respuesta aquí...">${savedText}</textarea>`;
                break;
            case 'match':
                // mostrar leyenda
                let legendHTML = '<ul class="match-legend">';
                Object.entries(questionData.legend).forEach(([key, val]) => {
                    legendHTML += `<li><strong>${key}</strong>: ${val}</li>`;
                });
                legendHTML += '</ul>';

                let pairsHTML = '';
                const stored = this.userAnswers[this.currentQuestionIndex] || {};
                Object.keys(questionData.pairs).forEach((key, idx) => {
                    const options = questionData.pairs[key];
                    pairsHTML += `
                        <div class="match-row">
                            <span class="match-prompt">${key}</span>
                            <select name="q${this.currentQuestionIndex}_${idx}" class="match-select">
                                <option value="">---</option>
                                ${options.map(opt => `<option value="${opt}" ${stored[idx]===opt?'selected':''}>${opt}</option>`).join('')}
                            </select>
                        </div>`;
                });
                inputHTML = legendHTML + pairsHTML;
                break;
        }

        questionCard.innerHTML = `
            <div class="question-header">
                <span class="question-number">Pregunta ${this.currentQuestionIndex + 1} de ${this.quizData.length}</span>
            </div>
            <h3 class="question-text">${questionData.question}</h3>
            <div class="answer-options">${inputHTML}</div>
            <div class="question-actions">
                <button class="btn-secondary" ${this.currentQuestionIndex === 0 ? 'disabled' : ''} onclick="window.chatOnline.previousQuestion()">Anterior</button>
                <button class="btn-primary" onclick="window.chatOnline.nextQuestion()">${this.currentQuestionIndex === this.quizData.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
            </div>`;
    }
    
    /**
     * Finaliza el quiz y muestra resultados
     */
    finishQuiz() {
        console.log('🏁 Quiz finalizado');
        
        // Detener el cronómetro si está activo
        this.stopQuizTimer();
        
        let correctCount = 0;
        
        // Calcular respuestas correctas (excluyendo preguntas abiertas)
        this.quizData.forEach((q, idx) => {
            const userAns = this.userAnswers[idx];
            let isCorrect = false;
            
            if (q.type === 'text') {
                // Pregunta abierta - no se evalúa automáticamente
                return;
            } else if (q.type === 'multiple') {
                isCorrect = Array.isArray(userAns) && Array.isArray(q.correct) && 
                           userAns.sort().join(',') === q.correct.sort().join(',');
            } else if (q.type === 'match') {
                isCorrect = JSON.stringify(userAns) === JSON.stringify(q.correct);
            } else {
                isCorrect = userAns === q.correct;
            }
            
            if (isCorrect) correctCount++;
        });

        this.showQuizResults(correctCount);
    }
    
    /**
     * Muestra pantalla de resultados detallados
     */
    showQuizResults(correctCount) {
        const centerPanel = document.querySelector('.center-panel .course-content');
        if (!centerPanel) return;

        // Remover quiz anterior
        centerPanel.querySelectorAll('.quiz-content, .quiz-results').forEach(el => el.remove());
        
        // Marcar que los resultados están mostrados
        this.quizResultsShown = true;

        // Calcular total de preguntas evaluables (excluyendo abiertas)
        const evaluableQuestions = this.quizData.filter(q => q.type !== 'text').length;
        
        let resultsHTML = `
            <div class="quiz-results">
                <h2>Resultados del Quiz</h2>
                <p>Respuestas correctas: <strong>${correctCount}</strong> de ${evaluableQuestions} preguntas evaluables</p>
        `;

        this.quizData.forEach((q, idx) => {
            const userAns = this.userAnswers[idx];
            let isCorrect = false;
            let cardClass = '';
            let feedback = '';
            
            if (q.type === 'text') {
                // Pregunta abierta - sin evaluación automática
                cardClass = 'open-question';
                feedback = q.feedbackCorrect; // Mensaje neutral para pregunta abierta
            } else {
                if (q.type === 'multiple') {
                    isCorrect = Array.isArray(userAns) && Array.isArray(q.correct) && 
                               userAns.sort().join(',') === q.correct.sort().join(',');
                } else if (q.type === 'match') {
                    isCorrect = JSON.stringify(userAns) === JSON.stringify(q.correct);
                } else {
                    isCorrect = userAns === q.correct;
                }
                cardClass = isCorrect ? 'correct' : 'incorrect';
                feedback = isCorrect ? q.feedbackCorrect : q.feedbackIncorrect;
            }

            let iconSVG = '';
            if (q.type === 'text') {
                iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                </svg>`;
            } else if (isCorrect) {
                iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                </svg>`;
            } else {
                iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"/>
                    <path d="M6 6l12 12"/>
                </svg>`;
            }

            resultsHTML += `
                <div class="result-card ${cardClass}">
                    <h3>${iconSVG}Pregunta ${idx + 1}</h3>
                    <p class="question">${q.question}</p>
                    <p><strong>Tu respuesta:</strong> ${this.formatAnswer(q, userAns)}</p>
                    ${q.correct !== null && q.type !== 'text' ? `<p><strong>Respuesta correcta:</strong> ${this.formatAnswer(q, q.correct)}</p>` : ''}
                    <p class="feedback">${feedback}</p>
                </div>`;
        });

        resultsHTML += `
                <div class="quiz-actions">
                    <button class="btn-primary" onclick="window.chatOnline.submitQuizResults()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m22 2-7 20-4-9-9-4Z"/>
                            <path d="M22 2 11 13"/>
                        </svg>
                        Enviar Respuestas
                    </button>
                    <button class="btn-secondary" onclick="window.chatOnline.restartQuiz()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                            <path d="M21 3v5h-5"/>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                            <path d="M3 21v-5h5"/>
                        </svg>
                        Repetir Cuestionario
                    </button>
                </div>
            </div>`;
        centerPanel.insertAdjacentHTML('beforeend', resultsHTML);
    }
    
    /**
     * Formatea respuestas para mostrar
     */
    formatAnswer(question, answer) {
        if (answer === undefined || answer === null) return '-';
        
        switch (question.type) {
            case 'single':
            case 'boolean':
                const opt = question.options.find(o => o.value === answer);
                return opt ? opt.text : answer;
            case 'multiple':
                return answer.map(val => {
                    const o = question.options.find(x => x.value === val);
                    return o ? o.text : val;
                }).join(', ');
            case 'text':
                return answer;
            case 'match':
                return Object.entries(answer).map(([k,v]) => `${parseInt(k)+1}→${v}`).join(', ');
            default:
                return String(answer);
        }
    }
    
    /**
     * Envía las respuestas del quiz al servidor/instructor
     */
    submitQuizResults() {
        console.log('📤 Enviando respuestas del quiz...');
        
        // Preparar datos para enviar
        const quizSubmission = {
            userId: this.getCurrentUserId(), // Implementar según tu sistema de auth
            moduleId: this.currentModule,
            timestamp: new Date().toISOString(),
            answers: this.userAnswers,
            questions: this.quizData,
            score: this.calculateScore()
        };
        
        console.log('Datos del quiz:', quizSubmission);
        
        // Aquí puedes implementar el envío al servidor
        // Por ahora mostraremos confirmación
        alert('✅ Respuestas enviadas correctamente al instructor.\n\nLa pregunta abierta será revisada manualmente.');
        
        // Opcional: deshabilitar el botón después del envío
        const submitBtn = document.querySelector('.quiz-actions .btn-primary');
        if (submitBtn) {
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                </svg>
                Enviado`;
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
        }
    }
    
    /**
     * Reinicia el quiz para repetirlo
     */
    restartQuiz() {
        console.log('🔄 Reiniciando quiz...');
        
        // Confirmar si realmente quiere repetir
        if (confirm('¿Estás seguro de que quieres repetir el cuestionario? Se perderán las respuestas actuales.')) {
            // Detener cronómetro actual si existe
            this.stopQuizTimer();
            
            // Resetear estado del quiz
            this.currentQuestionIndex = 0;
            this.userAnswers = {};
            this.quizTimeRemaining = this.quizTimeLimit;
            
            // Limpiar el contenido actual del panel central (consistente con showQuizResults)
            const centerPanel = document.querySelector('.center-panel .course-content');
            if (centerPanel) {
                // Limpiar específicamente quiz y resultados existentes
                centerPanel.querySelectorAll('.quiz-content, .quiz-results').forEach(el => el.remove());
            }
            
            // Resetear estado de resultados
            this.quizResultsShown = false;
            
            // Resetear estado de alerta de tiempo agotado
            this.timeUpAlertShown = false;
            
            // Mostrar el quiz desde el inicio
            this.createQuizContent();
            
            console.log('✅ Quiz reiniciado');
        }
    }
    
    /**
     * Calcula el puntaje del quiz
     */
    calculateScore() {
        let correctCount = 0;
        let totalEvaluable = 0;
        
        this.quizData.forEach((q, idx) => {
            if (q.type === 'text') return; // Saltar preguntas abiertas
            
            totalEvaluable++;
            const userAns = this.userAnswers[idx];
            let isCorrect = false;
            
            if (q.type === 'multiple') {
                isCorrect = Array.isArray(userAns) && Array.isArray(q.correct) && 
                           userAns.sort().join(',') === q.correct.sort().join(',');
            } else if (q.type === 'match') {
                isCorrect = JSON.stringify(userAns) === JSON.stringify(q.correct);
            } else {
                isCorrect = userAns === q.correct;
            }
            
            if (isCorrect) correctCount++;
        });
        
        return {
            correct: correctCount,
            total: totalEvaluable,
            percentage: Math.round((correctCount / totalEvaluable) * 100)
        };
    }
    
    /**
     * Obtiene el ID del usuario actual (implementar según tu sistema)
     */
    getCurrentUserId() {
        // Implementar según tu sistema de autenticación
        // Por ahora retornamos un placeholder
        return 'user_' + Date.now();
    }
    
    // ===== FUNCIONES DEL CRONÓMETRO =====
    
    /**
     * Inicia el cronómetro del quiz
     */
    startQuizTimer() {
        console.log('⏱️ Iniciando cronómetro del quiz');
        
        // Resetear valores
        this.quizTimeRemaining = this.quizTimeLimit;
        this.quizStartTime = Date.now();
        this.timeUpAlertShown = false; // Resetear estado de alerta
        
        // Actualizar display inicial
        this.updateTimerDisplay();
        
        // Iniciar el intervalo del cronómetro
        this.quizTimer = setInterval(() => {
            this.quizTimeRemaining--;
            this.updateTimerDisplay();
            
            // Verificar advertencias de tiempo
            this.checkTimeWarnings();
            
            // Verificar si se acabó el tiempo
            if (this.quizTimeRemaining <= 0) {
                this.timeUpQuiz();
            }
        }, 1000);
    }
    
    /**
     * Actualiza la visualización del cronómetro
     */
    updateTimerDisplay() {
        const timerElement = document.getElementById('quizTimer');
        const progressBar = document.getElementById('timerProgressBar');
        
        if (!timerElement || !progressBar) return;
        
        // Formatear tiempo
        const minutes = Math.floor(this.quizTimeRemaining / 60);
        const seconds = this.quizTimeRemaining % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        timerElement.textContent = timeString;
        
        // Actualizar barra de progreso
        const progress = ((this.quizTimeLimit - this.quizTimeRemaining) / this.quizTimeLimit) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Cambiar colores según el tiempo restante
        const container = document.querySelector('.quiz-timer-container');
        if (container) {
            container.classList.remove('warning', 'critical');
            
            if (this.quizTimeRemaining <= 60) { // Último minuto
                container.classList.add('critical');
            } else if (this.quizTimeRemaining <= 120) { // Últimos 2 minutos
                container.classList.add('warning');
            }
        }
    }
    
    /**
     * Verifica y muestra advertencias de tiempo
     */
    checkTimeWarnings() {
        if (this.quizTimeRemaining === 120) { // 2 minutos restantes
            this.showTimeWarning('⚠️ Quedan 2 minutos para completar el quiz');
        } else if (this.quizTimeRemaining === 60) { // 1 minuto restante
            this.showTimeWarning('🚨 ¡Último minuto! Termina las preguntas que puedas');
        } else if (this.quizTimeRemaining === 30) { // 30 segundos restantes
            this.showTimeWarning('🚨 ¡Solo quedan 30 segundos!');
        }
    }
    
    /**
     * Muestra advertencia de tiempo
     */
    showTimeWarning(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'quiz-time-warning';
        notification.innerHTML = `
            <div class="warning-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    /**
     * Muestra alerta de tiempo agotado con diseño estético
     */
    showTimeUpAlert() {
        // Verificar si ya existe una alerta para evitar duplicación
        const existingOverlay = document.querySelector('.quiz-time-up-overlay');
        if (existingOverlay) {
            console.log('⏰ Alerta de tiempo agotado ya existe, evitando duplicación');
            return;
        }
        
        // Crear overlay de fondo
        const overlay = document.createElement('div');
        overlay.className = 'quiz-time-up-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 9999;
            backdrop-filter: blur(4px);
            cursor: pointer;
        `;
        
        // Crear alerta principal
        const alert = document.createElement('div');
        alert.className = 'quiz-time-up-alert';
        alert.innerHTML = `
            <div class="time-up-content">
                <div class="time-up-icon">⏰</div>
                <p class="time-up-message">¡Tiempo agotado!<br>El quiz se ha terminado automáticamente con las respuestas que completaste.</p>
                <button class="time-up-button">
                    Aceptar
                </button>
            </div>
        `;
        
        // Agregar event listener para el botón de cerrar
        const closeButton = alert.querySelector('.time-up-button');
        closeButton.addEventListener('click', () => {
            overlay.remove();
        });
        
        // Agregar event listener para cerrar al hacer clic en el overlay (fondo)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        // Agregar al DOM
        overlay.appendChild(alert);
        document.body.appendChild(overlay);
        
        // Auto-remover después de 10 segundos como fallback
        setTimeout(() => {
            if (overlay.parentElement) {
                overlay.remove();
            }
        }, 10000);
    }
    
    /**
     * Termina el quiz cuando se acaba el tiempo
     */
    timeUpQuiz() {
        // Verificar si ya se ha mostrado la alerta para evitar bucle infinito
        if (this.timeUpAlertShown) {
            console.log('⏰ Alerta de tiempo agotado ya mostrada, evitando duplicación');
            return;
        }
        
        console.log('⏰ Tiempo agotado - Terminando quiz automáticamente');
        
        // Marcar que la alerta ya se ha mostrado
        this.timeUpAlertShown = true;
        
        // Detener el cronómetro
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
        }
        
        // Mostrar mensaje de tiempo agotado con diseño estético
        this.showTimeUpAlert();
        
        // Finalizar quiz con respuestas actuales después de un breve delay
        setTimeout(() => {
            this.finishQuiz();
        }, 1000);
    }
    
    /**
     * Detiene el cronómetro (cuando se termina el quiz manualmente)
     */
    stopQuizTimer() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
            console.log('⏱️ Cronómetro detenido');
        }
    }
    
    // ===== YOUTUBE VIDEO PLAYER =====
    
    /**
     * Videos asignados a cada módulo (DEPRECATED - usar Supabase)
     * USAR showModuleVideos() en su lugar para datos de la base de datos
     */
    getModuleVideos() {
        console.warn('⚠️ getModuleVideos() está deprecated. Usar showModuleVideos() para datos de la base de datos');
        return {
            1: {
                id: 'Yy_eZ65jzmo',
                title: '¿Qué es la IA? - Introducción',
                duration: '15:00'
            },
            2: {
                id: 'dhsy6epaJGs', 
                title: 'Historia de la IA - Evolución',
                duration: '22:00'
            },
            3: {
                id: 'DvyOm9HeT-k',
                title: 'Fundamentos del ML - Conceptos básicos',
                duration: '18:00'
            },
            4: {
                id: 'oiKj0Z_Xnjc',
                title: 'Redes Neuronales - Arquitectura',
                duration: '25:00'
            },
            5: {
                id: 'HMoaRIbOaN0',
                title: 'Aplicaciones Prácticas de IA',
                duration: '20:00'
            }
        };
    }
    
    /**
     * Cambia el video de YouTube actual
     * @param {string} videoId - ID del video de YouTube
     * @param {string} title - Título del video
     * @param {string} duration - Duración del video (opcional)
     */
    changeYouTubeVideo(videoId, title, duration = '00:00') {
        console.log(`🎥 Cambiando video: ${title} (${videoId})`);
        console.log(`🕒 DEBUG - Duración recibida: "${duration}" (tipo: ${typeof duration})`);
        
        const iframe = document.getElementById('youtubePlayer');
        const videoTitle = document.querySelector('.video-info h3');
        const videoDuration = document.querySelector('.video-stats span:first-child');
        
        // DEBUG: Verificar elementos disponibles
        const videoStatsElement = document.querySelector('.video-stats');
        console.log('🔍 DEBUG - iframe:', !!iframe);
        console.log('🔍 DEBUG - videoTitle:', !!videoTitle);
        console.log('🔍 DEBUG - .video-stats exists:', !!videoStatsElement);
        console.log('🔍 DEBUG - .video-stats innerHTML:', videoStatsElement ? videoStatsElement.innerHTML : 'null');
        console.log('🔍 DEBUG - .video-stats spans count:', document.querySelectorAll('.video-stats span').length);
        console.log('🔍 DEBUG - All .video-stats spans:', document.querySelectorAll('.video-stats span'));
        console.log('🔍 DEBUG - videoDuration (first-child):', videoDuration);
        
        if (iframe) {
            // Construir URL con parámetros optimizados
            const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`;
            iframe.src = embedUrl;
            iframe.title = title;
        }
        
        if (videoTitle) {
            // Mantener el ícono SVG y actualizar solo el texto
            videoTitle.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="23,7 16,12 23,17"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                ${title}
            `;
        }
        
        console.log('🔍 DEBUG - videoDuration element:', videoDuration);
        console.log('🔍 DEBUG - duration value:', duration);
        console.log('🔍 DEBUG - condition (videoDuration && duration !== "00:00"):', videoDuration && duration !== '00:00');
        
        // Si no existe videoDuration, crear la estructura completa
        if (!videoDuration && videoStatsElement && duration !== '00:00') {
            console.log('🔧 FIXING - Creando estructura video-stats completa');
            videoStatsElement.innerHTML = `
                <span>
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    Duración: ${duration}
                </span>
                <span>
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Cargando información...
                </span>
            `;
            console.log('✅ FIXED - Estructura video-stats creada');
        } else if (videoDuration && duration !== '00:00') {
            const timeIcon = videoDuration.querySelector('svg');
            console.log('🔍 DEBUG - timeIcon found:', !!timeIcon);
            
            if (timeIcon) {
                // Mantener el icono y actualizar solo el texto
                videoDuration.innerHTML = `
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    Duración: ${duration}
                `;
                console.log('✅ DEBUG - videoDuration updated with icon:', videoDuration.innerHTML);
            } else {
                // Si no hay icono, crear uno nuevo
                videoDuration.innerHTML = `
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    Duración: ${duration}
                `;
                console.log('✅ DEBUG - videoDuration updated without icon:', videoDuration.innerHTML);
            }
        } else {
            console.log('❌ DEBUG - videoDuration update skipped:', { videoDuration: !!videoDuration, duration, condition: duration !== '00:00' });
        }

        console.log(`✅ Video actualizado: ${title}`);

        // ===== ACTUALIZAR CONTEXTO PARA LIA DESPUÉS DEL CAMBIO DE VIDEO =====
        setTimeout(() => {
            console.log('[LIA CONTEXT] 🔄 Actualizando contexto después del cambio de video...');
            this.actualizarContextoLIA();
        }, 1500); // Delay más largo para asegurar que el contenido se haya actualizado completamente
    }
    
    /**
     * Cambia el video según el módulo seleccionado
     * @param {number} moduleNumber - Número del módulo (1-5)
     */
    async changeVideoByModule(moduleNumber) {
        try {
            const videoId = await this.getFirstVideoIdFromDatabase(moduleNumber);
            
            if (videoId) {
                console.log(`🎯 Cargando video del Módulo ${moduleNumber} desde BD: ${videoId}`);
                // Usar el videoId de la base de datos
                this.changeYouTubeVideo(videoId, `Módulo ${moduleNumber}`, '0:00');
            
            // Información del módulo actual se actualiza ahora desde Supabase en renderModules()
            
                // ===== ACTUALIZAR CONTEXTO PARA LIA DESPUÉS DEL CAMBIO DE VIDEO =====
                setTimeout(() => {
                    this.actualizarContextoLIA();
                }, 1000); // Pequeño delay para asegurar que el contenido se haya actualizado
            } else {
                console.error(`❌ No se pudo obtener video para el módulo ${moduleNumber} desde la base de datos`);
            }
        } catch (error) {
            console.error(`❌ Error cargando video del módulo ${moduleNumber}:`, error);
        }
    }
    
    /**
     * Extrae el ID de video desde una URL de YouTube
     * @param {string} url - URL completa de YouTube
     * @returns {string|null} - ID del video o null si no es válida
     */
    extractYouTubeId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
            /youtube\.com\/.*[?&]v=([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }
    
    /**
     * Carga un video desde una URL completa de YouTube
     * @param {string} youtubeUrl - URL completa de YouTube
     * @param {string} title - Título del video
     * @param {string} duration - Duración del video
     */
    loadYouTubeVideo(youtubeUrl, title, duration = '00:00') {
        const videoId = this.extractYouTubeId(youtubeUrl);
        if (videoId) {
            this.changeYouTubeVideo(videoId, title, duration);
        } else {
            console.error('❌ URL de YouTube no válida:', youtubeUrl);
            alert('Error: URL de YouTube no válida');
        }
    }
    
    /**
     * Verifica si un video puede ser embebido y muestra mensaje de error si no
     * @param {string} videoId - ID del video de YouTube
     */
    checkVideoAvailability(videoId) {
        const iframe = document.getElementById('youtubePlayer');
        if (iframe) {
            // Agregar listener para detectar errores de embedding
            iframe.addEventListener('load', () => {
                console.log(`✅ Video ${videoId} cargado correctamente`);
            });
            
            iframe.addEventListener('error', (e) => {
                console.error(`❌ Error cargando video ${videoId}:`, e);
                this.showVideoError(videoId);
            });
            
            // Timeout para detectar videos con restricciones
            setTimeout(() => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc) {
                        console.warn(`⚠️ Video ${videoId} puede tener restricciones de embedding`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Video ${videoId} con restricciones detectadas:`, error.message);
                }
            }, 3000);
        }
    }
    
    /**
     * Muestra mensaje de error cuando un video no puede ser embebido
     * @param {string} videoId - ID del video con problema
     */
    showVideoError(videoId) {
        const container = document.querySelector('.youtube-player-wrapper');
        if (container) {
            container.innerHTML = `
                <div class="video-error-message" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: var(--glass-surface-dark);
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    color: var(--glass-text-secondary);
                ">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.6;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <h4 style="color: var(--glass-text-primary); margin-bottom: 0.5rem;">Video no disponible</h4>
                    <p style="margin-bottom: 1.5rem; opacity: 0.8;">Este video tiene restricciones de embedding.</p>
                    <a href="https://www.youtube.com/watch?v=${videoId}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       style="
                        color: var(--glass-primary);
                        text-decoration: none;
                        padding: 0.75rem 1.5rem;
                        background: var(--glass-surface);
                        border-radius: 8px;
                        border: var(--glass-border);
                        transition: all 0.3s ease;
                        display: inline-block;
                       "
                       onmouseover="this.style.background='var(--glass-surface-hover)'; this.style.transform='translateY(-2px)'"
                       onmouseout="this.style.background='var(--glass-surface)'; this.style.transform='translateY(0)'">
                        Ver en YouTube
                    </a>
                </div>
            `;
        }
    }
    
    /**
     * Playlist de videos de ejemplo para testing
     */
    loadTestVideos() {
        const testVideos = [
            {
                id: 'aircAruvnKk',
                title: 'Redes Neuronales - Introducción práctica',
                duration: '19:13'
            },
            {
                id: 'dQw4w9WgXcQ',
                title: 'Rick Astley - Never Gonna Give You Up',
                duration: '3:32'
            },
            {
                id: 'bEQTO7FO_P4',
                title: 'Machine Learning Explained',
                duration: '15:06'
            },
            {
                id: 'QNJL6nfu__Q',
                title: 'Michael Jackson - Billie Jean (con restricciones)',
                duration: '4:54'
            }
        ];
        
        console.log('🎬 Videos de prueba disponibles:', testVideos);
        return testVideos;
    }

    // ===== FUNCIONES DE MODAL DE RESPUESTAS Y COMENTARIOS =====
    
    async submitAnswer() {
        console.log('📝 Enviando respuesta...');
        
        const form = document.getElementById('answerForm');
        const content = document.getElementById('answerContent').value.trim();
        const modal = document.getElementById('answerModal');
        const questionId = modal.getAttribute('data-question-id');
        
        if (!content) {
            this.showNotification('Por favor, escribe tu respuesta', 'warning');
            return;
        }
        
        if (!questionId) {
            this.showNotification('Error: No se encontró la pregunta', 'error');
            return;
        }
        
        try {
            // Mostrar estado de carga
            const submitBtn = document.getElementById('submitAnswerBtn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            // Obtener usuario actual
            const currentUser = this.obtenerUsuarioActual();
            console.log('👤 Usuario para respuesta:', currentUser);
            
            // Verificar que hay un usuario autenticado
            if (!currentUser || !currentUser.id) {
                this.showNotification('Debes iniciar sesión para responder preguntas', 'warning');
                return;
            }
            
            // Crear datos de la respuesta
            const answerData = {
                content: content,
                user_id: currentUser.id
            };
            
            // Llamar a la API de comunidad - pasar questionId como primer parámetro
            const response = await window.communityAPI.createAnswer(questionId, answerData);
            
            if (response.success) {
                this.showNotification('Respuesta publicada exitosamente', 'success');
                
                // Limpiar formulario
                document.getElementById('answerContent').value = '';
                
                // Cerrar modal
                this.hideAnswerModal();
                
                // Esperar un momento para que la base de datos se sincronice
                console.log('⏳ Esperando sincronización para nueva respuesta...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Recargar preguntas para mostrar la nueva respuesta
                console.log('🔄 Recargando preguntas después de nueva respuesta...');
                this.communityQuestionsLoaded = false; // Permitir recarga
                await this.loadCommunityQuestions('after-submit-answer');
                this.communityQuestionsLoaded = true; // Marcar como cargadas
                console.log('✅ Recarga completada después de respuesta');
                
            } else {
                throw new Error(response.error || 'Error al publicar respuesta');
            }
            
        } catch (error) {
            console.error('❌ Error al enviar respuesta:', error);
            this.showNotification('Error al publicar la respuesta. Intenta de nuevo.', 'error');
            
        } finally {
            // Restaurar botón
            const submitBtn = document.getElementById('submitAnswerBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publicar Respuesta';
        }
    }
    
    async submitComment() {
        console.log('💬 Enviando comentario...');
        
        const form = document.getElementById('commentForm');
        const content = document.getElementById('commentContent').value.trim();
        const modal = document.getElementById('commentModal');
        const targetId = modal.getAttribute('data-target-id');
        const targetType = modal.getAttribute('data-target-type') || 'question';
        
        if (!content) {
            this.showNotification('Por favor, escribe tu comentario', 'warning');
            return;
        }
        
        if (!targetId) {
            this.showNotification('Error: No se encontró el elemento a comentar', 'error');
            return;
        }
        
        try {
            // Mostrar estado de carga
            const submitBtn = document.getElementById('submitCommentBtn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            // Obtener usuario actual
            const currentUser = this.obtenerUsuarioActual();
            console.log('👤 Usuario para comentario:', currentUser);
            
            // Verificar que hay un usuario autenticado
            if (!currentUser || !currentUser.id) {
                this.showNotification('Debes iniciar sesión para comentar', 'warning');
                return;
            }
            
            // Crear datos del comentario
            const commentData = {
                parent_type: targetType,
                parent_id: targetId,
                content: content,
                user_id: currentUser.id
            };
            
            // Llamar a la API de comunidad
            const response = await window.communityAPI.createComment(commentData);
            
            if (response.success) {
                this.showNotification('Comentario publicado exitosamente', 'success');
                
                // Limpiar formulario
                document.getElementById('commentContent').value = '';
                
                // Cerrar modal
                this.hideCommentModal();
                
                // Actualizar la vista de preguntas (opcional)
                this.loadCommunityQuestions('edit-question');
                
            } else {
                throw new Error(response.error || 'Error al publicar comentario');
            }
            
        } catch (error) {
            console.error('❌ Error al enviar comentario:', error);
            this.showNotification('Error al publicar el comentario. Intenta de nuevo.', 'error');
            
        } finally {
            // Restaurar botón
            const submitBtn = document.getElementById('submitCommentBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publicar Comentario';
        }
    }
    
    /**
     * FUNCIÓN DE PRUEBA TEMPORAL - Eliminar después de probar
     * Para probar la nueva alerta de tiempo agotado
     */
    testTimeUpAlert() {
        console.log('🧪 Probando nueva alerta de tiempo agotado...');
        this.showTimeUpAlert();
    }
    
    /**
     * FUNCIÓN DE PRUEBA TEMPORAL - Eliminar después de probar
     * Para probar el flujo completo del quiz y verificar que no hay superposición
     */
    testQuizFlow() {
        console.log('🧪 Probando flujo completo del quiz...');
        
        // Simular datos de quiz para prueba
        this.quizData = [
            {
                id: 1,
                question: "¿Cuál es la capital de España?",
                type: "single",
                options: ["Madrid", "Barcelona", "Valencia", "Sevilla"],
                correct: "Madrid",
                feedbackCorrect: "¡Correcto! Madrid es la capital de España.",
                feedbackIncorrect: "Incorrecto. La capital de España es Madrid."
            },
            {
                id: 2,
                question: "¿Qué colores tiene la bandera de España?",
                type: "multiple",
                options: ["Rojo", "Amarillo", "Azul", "Verde"],
                correct: ["Rojo", "Amarillo"],
                feedbackCorrect: "¡Correcto! La bandera tiene rojo y amarillo.",
                feedbackIncorrect: "Incorrecto. La bandera tiene rojo y amarillo."
            }
        ];
        
        this.userAnswers = {
            0: "Madrid",
            1: ["Rojo", "Amarillo"]
        };
        
        // Simular finalización del quiz
        console.log('📊 Mostrando resultados...');
        this.showQuizResults(2);
        
        // Después de 2 segundos, cambiar a materiales
        setTimeout(() => {
            console.log('📚 Cambiando a materiales...');
            this.switchTab('materials');
        }, 2000);
        
        // Después de 4 segundos, cambiar a video
        setTimeout(() => {
            console.log('🎥 Cambiando a video...');
            this.switchTab('video');
        }, 4000);
        
        // Después de 6 segundos, volver a quiz
        setTimeout(() => {
            console.log('❓ Volviendo a quiz...');
            this.switchTab('quiz');
        }, 6000);
        
        // Después de 8 segundos, simular reinicio
        setTimeout(() => {
            console.log('🔄 Reiniciando quiz...');
            this.restartQuiz();
        }, 8000);
    }
    
    // ===== FUNCIÓN PARA CARGAR CONTENIDO DE ACTIVIDADES =====
    
    loadActivityContent() {
        try {
            console.log('📋 Cargando contenido de actividades...');
            
            // Verificar si el Module1VideosLoader está disponible
            if (window.module1VideosLoader && window.module1VideosLoader.videos) {
                console.log('✅ Module1VideosLoader encontrado');
                
                // Obtener el video actual
                const currentVideo = window.module1VideosLoader.videos.find(video => 
                    video.id === window.module1VideosLoader.currentVideoId
                );
                
                if (currentVideo) {
                    console.log('🎬 Video actual encontrado:', currentVideo.video_title);
                    console.log('📝 Descripción de actividad:', currentVideo.descripcion_actividad ? 'EXISTE' : 'NO EXISTE');
                    console.log('💡 Prompts de actividad:', currentVideo.prompts_actividad ? 'EXISTE' : 'NO EXISTE');
                    
                    // Llamar a la función updateActivityContent del Module1VideosLoader
                    window.module1VideosLoader.updateActivityContent(currentVideo);
                    console.log('✅ Contenido de actividades cargado correctamente');
                } else {
                    console.warn('⚠️ No se encontró video actual, usando el primer video disponible');
                    if (window.module1VideosLoader.videos.length > 0) {
                        const firstVideo = window.module1VideosLoader.videos[0];
                        window.module1VideosLoader.updateActivityContent(firstVideo);
                        console.log('✅ Contenido de actividades cargado con el primer video');
                    }
                }
            } else {
                console.warn('⚠️ Module1VideosLoader no está disponible');
                
                // Fallback: mostrar mensaje de que no hay actividades disponibles
                const activityContent = document.querySelector('.activity-content');
                if (activityContent) {
                    const activityDescription = activityContent.querySelector('.activity-description');
                    const activityPrompts = activityContent.querySelector('.activity-prompts');
                    
                    if (activityDescription) {
                        activityDescription.innerHTML = `
                            <p class="no-activity">No hay descripción de actividad disponible para este video.</p>
                        `;
                    }
                    
                    if (activityPrompts) {
                        activityPrompts.innerHTML = `
                            <p class="no-activity">No hay prompts de actividad disponibles para este video.</p>
                        `;
                    }
                    
                    console.log('✅ Mensajes de fallback mostrados');
                }
            }
        } catch (error) {
            console.error('❌ Error cargando contenido de actividades:', error);
        }
    }

    // ===== FUNCIÓN PARA CARGAR CONTENIDO DE RESUMEN =====

    loadSummaryContent() {
        try {
            console.log('📄 Cargando contenido de resumen...');
            
            // Verificar si el Module1VideosLoader está disponible
            if (window.module1VideosLoader && window.module1VideosLoader.videos) {
                console.log('✅ Module1VideosLoader encontrado');
                
                // Obtener el video actual
                const currentVideo = window.module1VideosLoader.videos.find(video => 
                    video.id === window.module1VideosLoader.currentVideoId
                );
                
                if (currentVideo) {
                    console.log('🎬 Video actual encontrado:', currentVideo.video_title);
                    console.log('📄 Resumen:', currentVideo.resumen ? 'EXISTE' : 'NO EXISTE');
                    
                    // Llamar a la función updateSummaryContent del Module1VideosLoader
                    window.module1VideosLoader.updateSummaryContent(currentVideo);
                    console.log('✅ Contenido de resumen cargado correctamente');
                } else {
                    console.warn('⚠️ No se encontró video actual, usando el primer video disponible');
                    if (window.module1VideosLoader.videos.length > 0) {
                        const firstVideo = window.module1VideosLoader.videos[0];
                        window.module1VideosLoader.updateSummaryContent(firstVideo);
                        console.log('✅ Contenido de resumen cargado con el primer video');
                    }
                }
            } else {
                console.warn('⚠️ Module1VideosLoader no está disponible');
                
                // Fallback: mostrar mensaje de que no hay resumen disponible
                const summaryContent = document.querySelector('.summary-content');
                if (summaryContent) {
                    summaryContent.innerHTML = `
                        <p class="no-summary">No hay resumen disponible para este video.</p>
                    `;
                    console.log('✅ Mensaje de fallback mostrado');
                }
            }
        } catch (error) {
            console.error('❌ Error cargando contenido de resumen:', error);
        }
    }

    // ===== SISTEMA DE RESPUESTAS DINÁMICAS PARA LIA =====
    
    /**
     * Obtener historial de conversación desde localStorage
     */
    obtenerHistorialConversacion() {
        try {
            const historial = localStorage.getItem('lia_conversation_history');
            if (historial) {
                const parsed = JSON.parse(historial);
                // Mantener solo los últimos 20 mensajes para optimizar el contexto
                return parsed.slice(-20);
            }
            return [];
        } catch (error) {
            console.error('[LIA] ❌ Error obteniendo historial:', error);
            return [];
        }
    }

    /**
     * Guardar mensaje en historial de conversación
     */
    guardarMensajeEnHistorial(role, mensaje) {
        try {
            const historial = this.obtenerHistorialConversacion();
            const nuevoMensaje = {
                role: role, // 'user' o 'assistant'
                content: mensaje,
                timestamp: new Date().toISOString(),
                context: {
                    module: this.currentModule,
                    courseId: this.getCurrentCourseId(),
                    videoTime: this.getCurrentVideoTime()
                }
            };
            
            historial.push(nuevoMensaje);
            
            // Mantener solo los últimos 50 mensajes en storage
            const historialLimitado = historial.slice(-50);
            localStorage.setItem('lia_conversation_history', JSON.stringify(historialLimitado));
            
            console.log(`[LIA] 💾 Mensaje guardado en historial (${role}):`, mensaje.substring(0, 100) + '...');
        } catch (error) {
            console.error('[LIA] ❌ Error guardando mensaje en historial:', error);
        }
    }

    /**
     * Generar contexto personalizado basado en el mensaje actual y historial
     */
    generarContextoPersonalizado(mensaje, usuario, historial) {
        try {
            // Analizar patrones en el historial
            const patronesUsuario = this.analizarPatronesUsuario(historial);
            
            // Detectar intención del mensaje actual
            const intencion = this.detectarIntencion(mensaje);
            
            // Generar contexto personalizado
            const contextoPersonalizado = {
                usuario: {
                    nombre: usuario?.name || usuario?.username || 'Estudiante',
                    preferencias: patronesUsuario.preferencias,
                    nivelCompresion: patronesUsuario.nivelCompresion,
                    temasInteres: patronesUsuario.temasInteres
                },
                conversacion: {
                    intencionActual: intencion,
                    temaActual: this.extraerTemaPrincipal(mensaje),
                    mensajesRecientes: historial.slice(-5).map(m => ({
                        role: m.role,
                        content: m.content.substring(0, 100),
                        timestamp: m.timestamp
                    }))
                },
                adaptacion: {
                    evitarRepeticion: this.identificarRespuestasRepetitivas(historial),
                    personalizarTono: this.adaptarTonoSegunUsuario(patronesUsuario),
                    sugerirSiguientePaso: this.sugerirProximaAccion(intencion, this.currentModule)
                }
            };

            return contextoPersonalizado;
        } catch (error) {
            console.error('[LIA] ❌ Error generando contexto personalizado:', error);
            return { usuario: {}, conversacion: {}, adaptacion: {} };
        }
    }

    /**
     * Analizar patrones del usuario en conversaciones previas
     */
    analizarPatronesUsuario(historial) {
        const patronesUsuario = {
            preferencias: 'explicaciones_detalladas',
            nivelCompresion: 'medio',
            temasInteres: []
        };

        if (historial.length === 0) return patronesUsuario;

        const mensajesUsuario = historial.filter(m => m.role === 'user');
        
        // Detectar nivel de comprensión preferido
        const preguntasDetalladas = mensajesUsuario.filter(m => 
            m.content.includes('explica') || 
            m.content.includes('detalles') || 
            m.content.includes('paso a paso')
        ).length;
        
        const preguntasSimples = mensajesUsuario.filter(m => 
            m.content.includes('resumen') || 
            m.content.includes('rápido') || 
            m.content.length < 20
        ).length;

        if (preguntasDetalladas > preguntasSimples) {
            patronesUsuario.preferencias = 'explicaciones_detalladas';
            patronesUsuario.nivelCompresion = 'alto';
        } else if (preguntasSimples > preguntasDetalladas) {
            patronesUsuario.preferencias = 'respuestas_concisas';
            patronesUsuario.nivelCompresion = 'bajo';
        }

        // Extraer temas de interés recurrentes
        const temas = ['machine learning', 'redes neuronales', 'algoritmos', 'aplicaciones', 'historia', 'etica'];
        patronesUsuario.temasInteres = temas.filter(tema => 
            mensajesUsuario.some(m => m.content.toLowerCase().includes(tema))
        );

        return patronesUsuario;
    }

    /**
     * Detectar intención del mensaje del usuario
     */
    detectarIntencion(mensaje) {
        const msgLower = mensaje.toLowerCase();
        
        if (msgLower.includes('explica') || msgLower.includes('que es') || msgLower.includes('como funciona')) {
            return 'explicacion';
        } else if (msgLower.includes('ejemplo') || msgLower.includes('muestra')) {
            return 'ejemplo';
        } else if (msgLower.includes('diferencia') || msgLower.includes('comparar')) {
            return 'comparacion';
        } else if (msgLower.includes('ejercicio') || msgLower.includes('practica') || msgLower.includes('actividad')) {
            return 'practica';
        } else if (msgLower.includes('aplicacion') || msgLower.includes('uso real') || msgLower.includes('industria')) {
            return 'aplicacion_practica';
        } else if (msgLower.includes('siguiente') || msgLower.includes('continuar') || msgLower.includes('avanzar')) {
            return 'progresion';
        } else if (msgLower.includes('repetir') || msgLower.includes('no entendi') || msgLower.includes('explicamelo')) {
            return 'clarificacion';
        }
        
        return 'general';
    }

    /**
     * Extraer tema principal del mensaje
     */
    extraerTemaPrincipal(mensaje) {
        const msgLower = mensaje.toLowerCase();
        const temas = {
            'machine learning': ['machine learning', 'ml', 'aprendizaje automatico', 'aprendizaje maquina'],
            'redes neuronales': ['redes neuronales', 'neurona', 'perceptron', 'deep learning'],
            'algoritmos': ['algoritmo', 'modelo', 'entrenamiento'],
            'aplicaciones': ['aplicacion', 'uso', 'ejemplo real', 'industria'],
            'historia': ['historia', 'origen', 'evolucion', 'desarrollo'],
            'conceptos basicos': ['que es', 'concepto', 'definicion', 'fundamento']
        };

        for (const [tema, palabras] of Object.entries(temas)) {
            if (palabras.some(palabra => msgLower.includes(palabra))) {
                return tema;
            }
        }

        return 'general';
    }

    /**
     * Identificar si hay respuestas repetitivas recientes
     */
    identificarRespuestasRepetitivas(historial) {
        const respuestasLIA = historial.filter(m => m.role === 'assistant').slice(-5);
        const respuestasUnicas = new Set(respuestasLIA.map(r => r.content.substring(0, 100)));
        
        if (respuestasLIA.length > 2 && respuestasUnicas.size < respuestasLIA.length * 0.8) {
            return {
                detectado: true,
                sugerencia: 'Varía el enfoque y proporciona perspectivas diferentes'
            };
        }
        
        return { detectado: false };
    }

    /**
     * Adaptar tono según patrones del usuario
     */
    adaptarTonoSegunUsuario(patrones) {
        if (patrones.nivelCompresion === 'alto') {
            return {
                estilo: 'detallado_profesional',
                sugerencia: 'Proporciona explicaciones técnicas completas con ejemplos'
            };
        } else if (patrones.nivelCompresion === 'bajo') {
            return {
                estilo: 'conciso_amigable',
                sugerencia: 'Mantén respuestas breves y claras, enfócate en lo esencial'
            };
        }
        
        return {
            estilo: 'equilibrado',
            sugerencia: 'Balancea entre detalle técnico y claridad'
        };
    }

    /**
     * Sugerir próxima acción basada en intención y progreso
     */
    sugerirProximaAccion(intencion, moduloActual) {
        const sugerencias = {
            'explicacion': 'Ofrece un ejercicio práctico o ejemplo para reforzar la comprensión',
            'ejemplo': 'Sugiere aplicar el concepto en un contexto diferente',
            'practica': 'Proporciona feedback constructivo y el siguiente ejercicio',
            'comparacion': 'Sugiere profundizar en las ventajas/desventajas de cada opción',
            'aplicacion_practica': 'Conecta con ejemplos del módulo actual y siguientes temas',
            'progresion': `Indica que está listo para avanzar en el Módulo ${moduloActual}`,
            'clarificacion': 'Usa una analogía diferente o enfoque alternativo'
        };

        return {
            accion: sugerencias[intencion] || 'Pregunta si hay algo específico que le gustaría explorar más',
            contexto: `Módulo ${moduloActual}`,
            motivacion: 'Mantén el engagement y curiosidad por aprender'
        };
    }

    /**
     * Construir prompt dinámico y contextual
     */
    construirPromptDinamico(mensaje, contextoTaller, contextoPersonalizado, historial) {
        const historialReciente = historial.slice(-6).map(m => `${m.role === 'user' ? 'Estudiante' : 'LIA'}: ${m.content}`).join('\n');
        
        const prompt = `Eres LIA, un tutor personalizado especializado en enseñar fundamentos de Inteligencia Artificial.

CONTEXTO DEL TALLER:
${contextoTaller}

INFORMACIÓN DEL ESTUDIANTE:
- Nombre: ${contextoPersonalizado.usuario?.nombre || 'Estudiante'}
- Nivel de comprensión preferido: ${contextoPersonalizado.conversacion?.intencionActual || 'medio'}
- Temas de interés: ${contextoPersonalizado.usuario?.temasInteres?.join(', ') || 'fundamentos de IA'}
- Estilo de respuesta adaptado: ${contextoPersonalizado.adaptacion?.personalizarTono?.estilo || 'equilibrado'}

CONTEXTO DE LA CONVERSACIÓN:
Tema actual: ${contextoPersonalizado.conversacion?.temaActual || 'general'}
Intención detectada: ${contextoPersonalizado.conversacion?.intencionActual || 'consulta general'}

HISTORIAL RECIENTE (últimos mensajes):
${historialReciente || 'No hay historial previo'}

INSTRUCCIONES ESPECIALES:
${contextoPersonalizado.adaptacion?.evitarRepeticion?.detectado ? 
  '⚠️ IMPORTANTE: Se detectaron respuestas repetitivas. ' + contextoPersonalizado.adaptacion.evitarRepeticion.sugerencia : 
  '✅ Conversación fluida, mantén la calidad y variedad'}

${contextoPersonalizado.adaptacion?.personalizarTono?.sugerencia || ''}

PRÓXIMA ACCIÓN SUGERIDA:
${contextoPersonalizado.adaptacion?.sugerirSiguientePaso?.accion || ''}

MENSAJE ACTUAL DEL ESTUDIANTE:
${mensaje}

RESPONDE COMO LIA:
- Adapta tu respuesta al estilo preferido del estudiante
- Construye sobre la conversación previa
- Varía tu enfoque para evitar repetición
- Incluye la próxima acción sugerida de manera natural
- Mantén el tono educativo, cálido y motivador
- Responde en español`;

        return prompt;
    }

    /**
     * Obtener tiempo actual del video (método auxiliar mejorado)
     */
    getCurrentVideoTime() {
        try {
            // Intentar obtener desde iframe de YouTube
            const iframe = document.getElementById('youtubePlayer');
            if (iframe && iframe.contentWindow && iframe.contentWindow.getCurrentTime) {
                return Math.floor(iframe.contentWindow.getCurrentTime());
            }
            
            // Fallback: intentar desde player directo
            if (window.youtubePlayer && typeof window.youtubePlayer.getCurrentTime === 'function') {
                return Math.floor(window.youtubePlayer.getCurrentTime());
            }
            
            // Si no hay video player, devolver 0
            return 0;
        } catch (error) {
            console.log('[LIA] ⚠️ No se pudo obtener tiempo del video:', error.message);
            return 0;
        }
    }

    /**
     * Limpiar historial de conversación (utilidad para debugging)
     */
    limpiarHistorialConversacion() {
        localStorage.removeItem('lia_conversation_history');
        console.log('[LIA] 🧹 Historial de conversación limpiado');
    }

    /**
     * Exportar conversación con contexto (para análisis y mejoras)
     */
    exportarConversacionCompleta() {
        try {
            const historial = this.obtenerHistorialConversacion();
            const exportData = {
                timestamp: new Date().toISOString(),
                curso: {
                    id: this.getCurrentCourseId(),
                    module: this.currentModule
                },
                usuario: this.obtenerUsuarioActual(),
                conversacion: historial,
                estadisticas: {
                    totalMensajes: historial.length,
                    mensajesUsuario: historial.filter(m => m.role === 'user').length,
                    mensajesLIA: historial.filter(m => m.role === 'assistant').length,
                    duracion: historial.length > 0 ? 
                        new Date(historial[historial.length - 1].timestamp) - new Date(historial[0].timestamp) : 0
                }
            };

            // Crear archivo para descargar
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `lia-conversacion-${new Date().getTime()}.json`;
            link.click();
            
            console.log('[LIA] 📋 Conversación exportada exitosamente');
        } catch (error) {
            console.error('[LIA] ❌ Error exportando conversación:', error);
        }
    }
}


// ===== INICIALIZACIÓN INMEDIATA =====
    console.log('🚀 Iniciando Chat Online...');
    
// Crear instancia de ChatOnline inmediatamente
    window.chatOnline = new ChatOnline();
console.log('✅ Instancia de ChatOnline creada:', !!window.chatOnline);
console.log('✅ Método openNoteForEditing disponible inmediatamente:', typeof window.chatOnline?.openNoteForEditing);

// ===== INICIALIZACIÓN ADICIONAL DESPUÉS DEL DOM =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔗 DOM cargado, configurando elementos adicionales...');
    
    // ===== FUNCIONES GLOBALES YA DEFINIDAS EN HTML =====
    // Las funciones showAnswerModal, voteQuestion y toggleBookmark ya están
    // definidas en el HTML como funciones inmediatas. Solo las actualizamos
    // aquí para que usen la instancia de chatOnline cuando esté disponible
    
    console.log('🔗 Actualizando funciones globales de comunidad con instancia de chatOnline...');
    
    // Configurar listeners de Supabase para Netlify
    window.chatOnline.setupSupabaseEventListeners();
    
    // Agregar método para manejar videos completados
    window.chatOnline.handleVideoCompleted = function(videoData) {
        console.log('🎬 Manejando video completado:', videoData);
        
        // Actualizar el progreso del módulo después de un pequeño delay
        setTimeout(() => {
            this.updateModuleProgressDisplay();
        }, 1000);
    };
    
    // Agregar método para actualizar el display del progreso del módulo
    window.chatOnline.updateModuleProgressDisplay = function() {
        try {
            console.log('📊 Actualizando display del progreso del módulo...');
            
            // Buscar el elemento que muestra el porcentaje en el panel izquierdo
            const progressElement = document.querySelector('.module-progress');
            if (!progressElement) {
                console.warn('⚠️ No se encontró elemento .module-progress');
                return;
            }
            
            // Calcular el progreso usando datos del Module1VideosLoader si está disponible
            if (window.module1VideosLoader && window.module1VideosLoader.videos) {
                const videos = window.module1VideosLoader.videos;
                const completedVideos = videos.filter(video => 
                    video.user_progress && video.user_progress.is_completed
                ).length;
                
                const moduleProgressPercentage = Math.round((completedVideos / videos.length) * 100);
                
                console.log(`📊 Progreso calculado: ${completedVideos}/${videos.length} videos completados (${moduleProgressPercentage}%)`);
                
                // Actualizar el texto del elemento
                progressElement.textContent = `${moduleProgressPercentage}% completado`;
                
                // Agregar animación visual
                progressElement.style.animation = 'progressPulse 0.6s ease-in-out';
                
                // Remover la animación después de que termine
                setTimeout(() => {
                    progressElement.style.animation = '';
                }, 600);
                
                console.log('✅ Elemento del progreso actualizado correctamente');
            } else {
                console.warn('⚠️ No hay datos de videos disponibles para calcular progreso');
            }
            
        } catch (error) {
            console.error('❌ Error actualizando display del progreso:', error);
        }
    };
    
    // Función global para probar la nueva alerta (TEMPORAL)
    window.testTimeUpAlert = function() {
        if (window.chatOnline) {
            window.chatOnline.testTimeUpAlert();
        } else {
            console.error('❌ ChatOnline no está disponible');
        }
    };
    
    // Función global para probar el flujo del quiz (TEMPORAL)
    window.testQuizFlow = function() {
        if (window.chatOnline) {
            window.chatOnline.testQuizFlow();
        } else {
            console.error('❌ ChatOnline no está disponible');
        }
    };
    
    // Configurar tema global
    if (typeof setupGlobalTheme === 'function') {
        setupGlobalTheme();
    }
    
    console.log('✅ Chat Online iniciado correctamente');
});

// ===== FUNCIONES GLOBALES =====
function goBack() {
    if (window.chatOnline) {
        window.chatOnline.goBack();
    }
}

// Funciones globales para control de YouTube
function changeVideo(videoId, title, duration) {
    if (window.chatOnline) {
        window.chatOnline.changeYouTubeVideo(videoId, title, duration);
    }
}

function loadVideo(youtubeUrl, title, duration) {
    if (window.chatOnline) {
        window.chatOnline.loadYouTubeVideo(youtubeUrl, title, duration);
    }
}

// Función de prueba para cambiar videos rápidamente
function testVideos() {
    if (window.chatOnline) {
        const videos = window.chatOnline.loadTestVideos();
        console.log('🎬 Para cambiar videos usa:');
        videos.forEach((video, index) => {
            console.log(`${index + 1}. changeVideo('${video.id}', '${video.title}', '${video.duration}')`);
        });
        return videos;
    }
}

// Función para cambiar a un módulo específico
function selectModule(moduleNumber) {
    if (window.chatOnline) {
        window.chatOnline.selectModule(moduleNumber);
        console.log(`🎯 Módulo ${moduleNumber} seleccionado`);
    }
}

// ===== FUNCIÓN PARA VERIFICAR CONTEXTO DE LIA =====
function verificarContextoLIA() {
    console.log('🔍 === VERIFICANDO CONTEXTO DE LIA ===');

    try {
        // 1. Verificar función obtenerContextoCurso
        if (typeof window.obtenerContextoCurso === 'function') {
            const contexto = window.obtenerContextoCurso();
            console.log('✅ [CONTEXT] Función obtenerContextoCurso disponible');
            console.log('📄 [CONTEXT] Contexto actual:', contexto.substring(0, 300) + '...');
        } else {
            console.log('❌ [CONTEXT] Función obtenerContextoCurso NO disponible');
        }

        // 2. Verificar contenido de transcripción
        const transcriptContent = document.querySelector('[data-content="transcript"]');
        if (transcriptContent) {
            const transcriptText = transcriptContent.textContent || transcriptContent.innerText;
            console.log('📝 [TRANSCRIPT] Contenido de transcripción:', transcriptText.substring(0, 200) + '...');
        } else {
            console.log('❌ [TRANSCRIPT] Elemento de transcripción no encontrado');
        }

        // 3. Verificar título del video actual
        const videoTitle = document.querySelector('.video-info h3');
        if (videoTitle) {
            console.log('🎬 [VIDEO] Título actual:', videoTitle.textContent);
        } else {
            console.log('❌ [VIDEO] Título del video no encontrado');
        }

        // 4. Verificar módulo activo
        const activeModule = document.querySelector('.module-item.active, .module-item.expanded');
        if (activeModule) {
            const moduleTitle = activeModule.querySelector('.module-title');
            console.log('📚 [MODULE] Módulo activo:', moduleTitle ? moduleTitle.textContent : 'Sin título');
        } else {
            console.log('❌ [MODULE] Módulo activo no encontrado');
        }

        console.log('🔍 === FIN VERIFICACIÓN CONTEXTO ===');

    } catch (error) {
        console.error('❌ [CONTEXT] Error verificando contexto:', error);
    }
}

// Función para ver todos los videos de módulos (desde base de datos)
async function showModuleVideos() {
    if (window.chatOnline) {
        try {
            console.log('🔍 Obteniendo videos desde base de datos...');

            const apiBaseUrl = window.chatOnline.getApiBaseUrl();
            const cacheBuster = new Date().getTime();
            
            const response = await fetch(`${apiBaseUrl}/courses/module1-videos?t=${cacheBuster}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.videos && data.videos.length > 0) {
                    console.log('🎬 Videos desde base de datos:');
                    data.videos.sort((a, b) => (a.video_order || 0) - (b.video_order || 0)).forEach(video => {
                        console.log(`Orden ${video.video_order}: ${video.video_title} (${Math.floor(video.duration_seconds / 60)}:${(video.duration_seconds % 60).toString().padStart(2, '0')}) - ID: ${video.youtube_video_id}`);
                    });
                } else {
                    console.error('❌ No se encontraron videos');
                }
            } else {
                console.error(`❌ Error en API: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error obteniendo videos:', error);
        }
        console.log('\n🎯 Para cambiar usa: selectModule(1), selectModule(2), etc.');
    }
}

// ===== FUNCIONES DE PROGRESO PARA TESTING =====

// Obtener progreso del curso
async function getProgress() {
    if (window.courseProgressManager) {
        const progress = await window.courseProgressManager.getCourseProgress(true);
        console.log('📊 Progreso actual:', progress);
        return progress;
    } else {
        console.warn('⚠️ Course Progress Manager no disponible');
    }
}

// Marcar módulo como completado (para testing)
async function completeModule(moduleNumber) {
    if (window.courseProgressManager) {
        try {
            const result = await window.courseProgressManager.completeModule(moduleNumber);
            console.log(`✅ Módulo ${moduleNumber} completado:`, result);
            return result;
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
}

// Iniciar un módulo (para testing)
async function startModule(moduleNumber) {
    if (window.courseProgressManager) {
        try {
            const result = await window.courseProgressManager.startModule(moduleNumber);
            console.log(`▶️ Módulo ${moduleNumber} iniciado:`, result);
            return result;
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
}

// Actualizar progreso del video (para testing)
async function updateVideoProgress(moduleNumber, percentage, position = 0) {
    if (window.courseProgressManager) {
        try {
            const result = await window.courseProgressManager.updateVideoProgress(moduleNumber, {
                video_progress_percentage: percentage,
                last_video_position: position,
                video_completed: percentage >= 95
            });
            console.log(`🎥 Video del módulo ${moduleNumber} actualizado:`, result);
            return result;
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
}

// Reset del progreso (para testing - USAR CON CUIDADO)
async function resetProgress() {
    if (confirm('⚠️ ¿Estás seguro de que quieres resetear el progreso? Esta acción no se puede deshacer.')) {
        console.log('🔄 Resetting progress no implementado por seguridad');
        console.log('Para resetear manualmente, limpia las tablas de progreso en la base de datos');
    }
}

// Mostrar comandos disponibles
function showProgressCommands() {
    console.log('📋 Comandos de progreso disponibles:');
    console.log('• getProgress() - Obtener progreso actual');
    console.log('• startModule(n) - Iniciar módulo n (1-5)');
    console.log('• completeModule(n) - Completar módulo n (1-5)');
    console.log('• updateVideoProgress(module, percentage, position) - Actualizar video');
    console.log('• selectModule(n) - Cambiar a módulo n');
    console.log('• showModuleVideos() - Ver videos disponibles');
    console.log('• resetProgress() - Reset completo (usar con cuidado)');
}

// Auto-mostrar comandos disponibles
console.log('🚀 Course Progress System cargado');
console.log('💡 Escribe showProgressCommands() para ver comandos disponibles');

// Debug del sistema de progreso
async function debugProgressSystem() {
    console.log('🔧 === DEBUG PROGRESS SYSTEM ===');
    
    // 1. Verificar Progress Manager
    console.log('1. Progress Manager:', window.courseProgressManager ? '✅ Disponible' : '❌ No disponible');
    
    if (!window.courseProgressManager) {
        console.log('⚠️ CourseProgressManager no está disponible');
        return;
    }
    
    // 2. Verificar Chat Online
    console.log('2. Chat Online:', window.chatOnline ? '✅ Disponible' : '❌ No disponible');
    
    // 3. Obtener progreso
    try {
        console.log('3. Obteniendo progreso...');
        const progress = await window.courseProgressManager.getCourseProgress(true);
        console.log('✅ Progreso obtenido:', progress);
        
        // 4. Verificar elementos DOM
        console.log('4. Verificando elementos DOM...');
        const progressPercentage = document.querySelector('.progress-percentage');
        const progressFill = document.querySelector('.progress-fill');
        const progressDots = document.querySelectorAll('.progress-dot');
        
        console.log('• Progress percentage element:', progressPercentage ? '✅' : '❌');
        console.log('• Progress fill element:', progressFill ? '✅' : '❌'); 
        console.log('• Progress dots count:', progressDots.length);
        
        // 5. Forzar actualización UI
        if (window.chatOnline) {
            console.log('5. Forzando actualización UI...');
            window.chatOnline.courseProgress = progress;
            window.chatOnline.updateProgressUI();
            console.log('✅ UI actualizada');
        }
        
        // 6. Verificar clases aplicadas
        console.log('6. Verificando clases de progress dots:');
        progressDots.forEach((dot, index) => {
            const classes = Array.from(dot.classList);
            console.log(`• Dot ${index + 1}:`, classes);
        });
        
    } catch (error) {
        console.error('❌ Error en debug:', error);
    }
}

// Función para inicializar manualmente si no funciona automáticamente  
async function forceInitializeProgress() {
    console.log('🚀 Forzando inicialización del progreso...');
    
    if (!window.courseProgressManager) {
        console.error('❌ CourseProgressManager no disponible');
        return;
    }
    
    try {
        // Forzar obtención de progreso
        const progress = await window.courseProgressManager.getCourseProgress(true);
        console.log('✅ Progreso inicializado:', progress);
        
        if (window.chatOnline) {
            window.chatOnline.courseProgress = progress;
            window.chatOnline.updateProgressUI();
            console.log('✅ UI actualizada manualmente');
        }
        
        return progress;
    } catch (error) {
        console.error('❌ Error forzando inicialización:', error);
    }
}

console.log('🔧 Funciones de debug disponibles:');
console.log('• debugProgressSystem() - Debug completo del sistema');
console.log('• forceInitializeProgress() - Forzar inicialización');

// ===== FUNCIÓN GLOBAL INMEDIATA =====
window.switchTab = function(contentType) {
    console.log(`🔄 switchTab global inmediato llamado: ${contentType}`);
    
    if (window.courseManager && typeof window.courseManager.switchContentTab === 'function') {
        window.courseManager.switchContentTab(contentType);
    } else {
        console.log('⏳ courseManager no disponible aún, guardando para después...');
        // Guardar la acción para ejecutar cuando esté disponible
        window.pendingTabSwitch = contentType;
    }
};

console.log('✅ window.switchTab definido globalmente');

// Función para inicializar el sistema simple de módulos estilo Coursera
window.initializeSimpleModuleSystem = function() {
    console.log('📚 Inicializando sistema simple de módulos...');
    
    // Ocultar el spinner de carga y mostrar la lista de módulos simples
    const loadingModules = document.querySelector('.loading-modules');
    const modulesList = document.querySelector('.modules-list');
    
    if (loadingModules && modulesList) {
        setTimeout(() => {
            loadingModules.style.display = 'none';
            
            // Generar la lista simple de módulos
            const simpleModulesHTML = `
                <div class="module-item completed" data-module="1" onclick="selectSimpleModule(1)">
                    <div class="module-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </div>
                    <div class="module-info">
                        <h4>Introducción a Fundamentos de IA</h4>
                        <p class="module-description">Vídeo • 8 min</p>
                    </div>
                </div>
                
                <div class="module-item current" data-module="2" onclick="selectSimpleModule(2)">
                    <div class="module-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                    <div class="module-info">
                        <h4>Historia y Evolución de la IA</h4>
                        <p class="module-description">Vídeo • 12 min</p>
                    </div>
                </div>
                
                <div class="module-item" data-module="3" onclick="selectSimpleModule(3)">
                    <div class="module-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </div>
                    <div class="module-info">
                        <h4>Tipos de Inteligencia Artificial</h4>
                        <p class="module-description">Lectura • 15 min</p>
                    </div>
                </div>
                
                <div class="module-item" data-module="4" onclick="selectSimpleModule(4)">
                    <div class="module-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                    <div class="module-info">
                        <h4>Machine Learning Fundamentals</h4>
                        <p class="module-description">Vídeo • 22 min</p>
                    </div>
                </div>
                
                <div class="module-item" data-module="5" onclick="selectSimpleModule(5)">
                    <div class="module-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                    <div class="module-info">
                        <h4>Redes Neuronales</h4>
                        <p class="module-description">Vídeo • 25 min</p>
                    </div>
                </div>
                
                <div class="module-item" data-module="6" onclick="selectSimpleModule(6)">
                    <div class="module-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <div class="module-info">
                        <h4>Evaluación Final</h4>
                        <p class="module-description">Quiz • 20 min</p>
                    </div>
                </div>
            `;
            
            modulesList.innerHTML = simpleModulesHTML;
            console.log('✅ Sistema simple de módulos inicializado');
        }, 1000); // Simular tiempo de carga
    }
};

// Función para seleccionar un módulo simple
window.selectSimpleModule = function(moduleId) {
    console.log(`📚 Seleccionando módulo simple: ${moduleId}`);
    
    // Remover estado actual de todos los módulos
    document.querySelectorAll('.module-item').forEach(module => {
        module.classList.remove('current');
    });
    
    // Agregar estado actual al módulo seleccionado
    const selectedModule = document.querySelector(`[data-module="${moduleId}"]`);
    if (selectedModule) {
        selectedModule.classList.add('current');
        console.log(`✅ Módulo ${moduleId} seleccionado`);
        
        // Actualizar contenido del video según el módulo
        updateSimpleVideoContent(moduleId);
    } else {
        console.warn(`❌ No se encontró el módulo ${moduleId}`);
    }
};

// Función para actualizar el contenido del video según el módulo simple seleccionado
function updateSimpleVideoContent(moduleId) {
    const moduleData = {
        1: { title: "Introducción a Fundamentos de IA", duration: "8:00" },
        2: { title: "Historia y Evolución de la IA", duration: "12:00" },
        3: { title: "Tipos de Inteligencia Artificial", duration: "15:00" },
        4: { title: "Machine Learning Fundamentals", duration: "22:00" },
        5: { title: "Redes Neuronales", duration: "25:00" },
        6: { title: "Evaluación Final", duration: "20:00" }
    };
    
    const data = moduleData[moduleId];
    if (data) {
        // Actualizar información del módulo actual
        const currentModuleInfo = document.querySelector('.current-module-info span');
        if (currentModuleInfo) {
            currentModuleInfo.textContent = data.title;
        }
        
        console.log(`🎥 Contenido actualizado: ${data.title}`);
    }
}

// Obtener el primer video ID desde la base de datos
async function getFirstVideoIdFromDatabase(moduleNumber) {
        try {
            console.log(`🔍 Cargando primer video para módulo ${moduleNumber} desde base de datos...`);
            
            const apiBaseUrl = window.chatOnline ? window.chatOnline.getApiBaseUrl() : '';
            const cacheBuster = new Date().getTime();
            
            const response = await fetch(`${apiBaseUrl}/courses/module1-videos?t=${cacheBuster}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.videos && data.videos.length > 0) {
                    // Obtener el primer video ordenado por video_order
                    const sortedVideos = data.videos.sort((a, b) => (a.video_order || 0) - (b.video_order || 0));
                    const firstVideo = sortedVideos[0];
                    console.log(`✅ Primer video cargado desde BD: ${firstVideo.youtube_video_id} - ${firstVideo.video_title}`);
                    return firstVideo.youtube_video_id;
                } else {
                    console.error('❌ No se encontraron videos en la respuesta');
                    return null;
                }
            } else {
                console.error(`❌ Error en API: ${response.status}`);
                return null;
            }
        } catch (error) {
            console.error('❌ Error obteniendo primer video desde BD:', error);
            return null;
        }
    }

// Obtener API base URL con detección de entorno
function getApiBaseUrl() {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const currentPort = window.location.port;
        const isNetlify = window.location.hostname.includes('netlify') || 
                          window.location.hostname.includes('app') ||
                          window.location.hostname === 'aprendeyaplica.ai' ||
                          window.location.protocol === 'https:' && !isLocalhost;
        
        if (isLocalhost && currentPort === '8888') {
            return '/.netlify/functions';
        } else if (isLocalhost && (currentPort === '3000' || window.location.href.includes(':3000'))) {
            return '/api';
        } else if (isNetlify) {
            return '/.netlify/functions';
        } else {
            return '/api';
        }
    }

console.log('✅ Funciones del sistema simple de módulos definidas');

// ===== INSTANCIACIÓN AUTOMÁTICA =====
// ELIMINADO: Instanciación duplicada que causaba event listeners duplicados
// La instancia se crea en la línea 5442 como window.chatOnline

// Ejecutar acción pendiente cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, verificando acciones pendientes...');
    
    // Ejecutar acción pendiente si existe
    if (window.pendingTabSwitch) {
        console.log(`🔄 Ejecutando acción pendiente: ${window.pendingTabSwitch}`);
        setTimeout(() => {
            window.switchTab(window.pendingTabSwitch);
            window.pendingTabSwitch = null;
        }, 100);
    }
});

// ===== EXPORTAR PARA USO EXTERNO =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatOnline;
}

