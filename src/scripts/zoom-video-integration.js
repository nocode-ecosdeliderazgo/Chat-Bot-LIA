/**
 * Zoom Video SDK Integration - Fase 2
 * Integración con roles diferenciados según especificación
 */

// console.log('📹 [ZOOM] Script cargando...');

// Configuración global del Zoom Video SDK
const ZoomVideoConfig = {
    // Configuración será pasada desde el servidor
    signature: null,
    meetingNumber: null,
    userName: null,
    userRole: 'participant', // 'host' | 'participant'
    sdkKey: null, // Se obtendrá del servidor
    
    // Estados del SDK
    isInitialized: false,
    isConnected: false,
    isCameraOn: false,
    isMicrophoneOn: false,
    isVideoActive: false,
    isMuted: false,
    volume: 50,
    previousVolume: 50,
    participantCount: 0,
    isScreenSharing: false,
    isRecording: false,
    currentRecordingId: null,
    currentSessionId: null,
    
    // Referencias DOM
    elements: {
        videoContainer: null,
        videoCanvas: null,
        controlsOverlay: null,
        participantCount: null,
        connectionStatus: null,
        cameraToggleBtn: null,
        microphoneToggleBtn: null,
        volumeControlBtn: null,
        fullscreenToggleBtn: null,
        joinButton: null,
        videoBasicControls: null
    }
};

// Cliente Zoom Video SDK
let zoomVideoClient = null;

/**
 * Inicializar la integración de Zoom Video SDK
 */
async function initZoomVideoIntegration() {
    // console.log('🔧 Inicializando Zoom Video SDK Integration...');
    // console.log('🔍 Verificando conflictos con main.js...');
    
    // Verificar si main.js ya configuró los botones
    const mainButton = document.getElementById('liveStreamMainToggleBtn');
    if (mainButton && mainButton._listeners) {
        console.warn('⚠️ main.js ya configuró event listeners - esto podría causar conflictos');
    }
    
    try {
        // Verificar si Zoom Video SDK está disponible
        if (typeof ZoomVideo === 'undefined') {
            console.error('❌ Zoom Video SDK no está disponible. Asegúrate de incluir el script del SDK.');
            showConnectionStatus('SDK no disponible', 'disconnected');
            return false;
        }
        
        // Obtener referencias DOM
        initDOMReferences();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Inicializar estado inicial
        updateUIState();
        
        // console.log('✅ Zoom Video SDK Integration inicializado correctamente');
        ZoomVideoConfig.isInitialized = true;
        
        return true;
        
    } catch (error) {
        console.error('❌ Error inicializando Zoom Video SDK:', error);
        showConnectionStatus('Error de inicialización', 'disconnected');
        return false;
    }
}

/**
 * Obtener referencias a elementos DOM
 */
function initDOMReferences() {
    ZoomVideoConfig.elements = {
        videoContainer: document.getElementById('zoom-video-container'),
        videoCanvas: document.getElementById('zoom-video-canvas'),
        controlsOverlay: document.getElementById('zoomControlsOverlay'),
        participantCount: document.getElementById('participantCount'),
        connectionStatus: document.getElementById('connectionStatus'),
        cameraToggleBtn: document.getElementById('cameraToggleBtn'),
        microphoneToggleBtn: document.getElementById('microphoneToggleBtn'),
        volumeControlBtn: document.getElementById('volumeControlBtn'),
        fullscreenToggleBtn: document.getElementById('fullscreenToggleBtn'),
        screenShareBtn: document.getElementById('screenShareBtn'),
        recordingToggleBtn: document.getElementById('recordingToggleBtn'),
        joinButton: document.getElementById('liveStreamMainToggleBtn'),
        joinButtonLarge: document.getElementById('liveStreamMainConnectBtnLarge'),
        videoBasicControls: document.getElementById('videoBasicControls'),
        roleBadge: document.getElementById('roleBadge'),
        zoomContainer: document.getElementById('zoom-video-container')
    };
    
    // Validar que los elementos existan (al menos uno de los botones debe existir)
    const requiredElements = ['videoContainer', 'videoCanvas'];
    const joinButtonExists = ZoomVideoConfig.elements.joinButton || ZoomVideoConfig.elements.joinButtonLarge;
    for (const elementKey of requiredElements) {
        if (!ZoomVideoConfig.elements[elementKey]) {
            throw new Error(`Elemento DOM requerido no encontrado: ${elementKey}`);
        }
    }
    
    if (!joinButtonExists) {
        throw new Error('No se encontró ningún botón de conexión (pequeño o grande)');
    }
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // console.log('🎛️ Configurando event listeners para Zoom Video SDK...');
    
    // Botón principal de unirse/salir (pequeño)
    if (ZoomVideoConfig.elements.joinButton) {
        ZoomVideoConfig.elements.joinButton.addEventListener('click', handleJoinToggle);
        // console.log('✅ Event listener agregado al botón pequeño');
    } else {
        console.warn('⚠️ Botón pequeño no encontrado');
    }
    
    // Botón principal de unirse/salir (grande)
    if (ZoomVideoConfig.elements.joinButtonLarge) {
        ZoomVideoConfig.elements.joinButtonLarge.addEventListener('click', handleJoinToggle);
        // console.log('✅ Event listener agregado al botón grande');
    } else {
        console.warn('⚠️ Botón grande no encontrado');
    }
    
    // Controles de cámara (solo hosts)
    if (ZoomVideoConfig.elements.cameraToggleBtn) {
        ZoomVideoConfig.elements.cameraToggleBtn.addEventListener('click', handleCameraToggle);
    }
    
    // Controles de micrófono (solo hosts)
    if (ZoomVideoConfig.elements.microphoneToggleBtn) {
        ZoomVideoConfig.elements.microphoneToggleBtn.addEventListener('click', handleMicrophoneToggle);
    }
    
    // Control de volumen (todos)
    if (ZoomVideoConfig.elements.volumeControlBtn) {
        ZoomVideoConfig.elements.volumeControlBtn.addEventListener('click', handleVolumeToggle);
    }
    
    // Pantalla completa (todos)
    if (ZoomVideoConfig.elements.fullscreenToggleBtn) {
        ZoomVideoConfig.elements.fullscreenToggleBtn.addEventListener('click', handleFullscreenToggle);
    }
    
    // Screen sharing (solo hosts)
    if (ZoomVideoConfig.elements.screenShareBtn) {
        ZoomVideoConfig.elements.screenShareBtn.addEventListener('click', handleScreenShare);
    }
    
    // Grabación (solo hosts)
    if (ZoomVideoConfig.elements.recordingToggleBtn) {
        ZoomVideoConfig.elements.recordingToggleBtn.addEventListener('click', handleRecordingToggle);
    }
    
    // Event listeners para cambios de pantalla completa
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
}

/**
 * Manejar clic en botón de unirse/salir
 */
async function handleJoinToggle(event) {
    // console.log('🖱️ Botón de Zoom clickeado!', event.target);
    // console.log('📊 Estado actual:', {
        isConnected: ZoomVideoConfig.isConnected,
        userRole: ZoomVideoConfig.userRole
    });
    
    try {
        if (!ZoomVideoConfig.isConnected) {
            await joinZoomSession();
        } else {
            await leaveZoomSession();
        }
    } catch (error) {
        console.error('❌ Error en join/leave toggle:', error);
        showConnectionStatus('Error de conexión', 'disconnected');
    }
}

/**
 * Unirse a sesión de Zoom
 */
async function joinZoomSession() {
    // console.log('🔗 Intentando unirse a sesión de video...');
    showConnectionStatus('Conectando...', 'connecting');
    
    try {
        // Obtener configuración del servidor
        const sessionConfig = await getSessionConfigFromServer();
        if (!sessionConfig) {
            throw new Error('No se pudo obtener configuración de sesión');
        }
        
        // Inicializar Zoom Video SDK
        zoomVideoClient = ZoomVideo.createClient();
        
        // Configurar eventos del cliente
        setupZoomClientEvents();
        
        // Unirse a la sesión
        await zoomVideoClient.join(
            sessionConfig.topic,
            sessionConfig.signature,
            sessionConfig.meetingNumber,
            sessionConfig.userName,
            sessionConfig.passWord
        );
        
        // console.log('✅ Conectado a sesión de video exitosamente');
        ZoomVideoConfig.isConnected = true;
        updateUIState();
        
        // Iniciar video automáticamente si es host
        const userRole = sessionConfig.userRole || 'participant';
        if (userRole === 'host') {
            await startVideo();
        } else {
            // Los participants solo reciben video, no transmiten
            // console.log('👀 Participant conectado - solo modo recepción');
        }
        
    } catch (error) {
        console.error('❌ Error uniéndose a sesión:', error);
        showConnectionStatus('Error de conexión', 'disconnected');
        ZoomVideoConfig.isConnected = false;
        updateUIState();
    }
}

/**
 * Salir de sesión de Zoom
 */
async function leaveZoomSession() {
    // console.log('🔌 Saliendo de sesión de video...');
    showConnectionStatus('Desconectando...', 'connecting');
    
    try {
        if (zoomVideoClient) {
            await zoomVideoClient.leave();
            zoomVideoClient = null;
        }
        
        ZoomVideoConfig.isConnected = false;
        ZoomVideoConfig.isCameraOn = false;
        ZoomVideoConfig.isVideoActive = false;
        ZoomVideoConfig.participantCount = 0;
        
        // console.log('✅ Sesión de video finalizada');
        updateUIState();
        
    } catch (error) {
        console.error('❌ Error saliendo de sesión:', error);
        showConnectionStatus('Error desconectando', 'disconnected');
    }
}

/**
 * Configurar eventos del cliente Zoom
 */
function setupZoomClientEvents() {
    if (!zoomVideoClient) return;
    
    // Evento: Usuario se unió
    zoomVideoClient.on('user-added', (payload) => {
        // console.log('👤 Usuario se unió:', payload);
        updateParticipantCount();
    });
    
    // Evento: Usuario salió
    zoomVideoClient.on('user-removed', (payload) => {
        // console.log('👤 Usuario salió:', payload);
        updateParticipantCount();
    });
    
    // Evento: Video iniciado
    zoomVideoClient.on('user-video-active', (payload) => {
        // console.log('📹 Video activado:', payload);
        renderVideo(payload.userId);
    });
    
    // Evento: Video detenido
    zoomVideoClient.on('user-video-inactive', (payload) => {
        // console.log('📹 Video desactivado:', payload);
    });
    
    // Evento: Conexión establecida
    zoomVideoClient.on('connection-change', (payload) => {
        // console.log('🔗 Estado de conexión:', payload.state);
        if (payload.state === 'Connected') {
            showConnectionStatus('Conectado', 'connected');
        } else if (payload.state === 'Disconnected') {
            showConnectionStatus('Desconectado', 'disconnected');
        }
    });
}

/**
 * Iniciar video
 */
async function startVideo() {
    try {
        if (!zoomVideoClient) return;
        
        const mediaStream = zoomVideoClient.getMediaStream();
        if (mediaStream) {
            await mediaStream.startVideo({
                videoElement: ZoomVideoConfig.elements.videoCanvas
            });
            ZoomVideoConfig.isCameraOn = true;
            ZoomVideoConfig.isVideoActive = true;
            updateCameraButton();
            // console.log('📹 Video iniciado');
        }
    } catch (error) {
        console.error('❌ Error iniciando video:', error);
    }
}

/**
 * Detener video
 */
async function stopVideo() {
    try {
        if (!zoomVideoClient) return;
        
        const mediaStream = zoomVideoClient.getMediaStream();
        if (mediaStream) {
            await mediaStream.stopVideo();
            ZoomVideoConfig.isCameraOn = false;
            ZoomVideoConfig.isVideoActive = false;
            updateCameraButton();
            // console.log('📹 Video detenido');
        }
    } catch (error) {
        console.error('❌ Error deteniendo video:', error);
    }
}

/**
 * Manejar toggle de cámara (solo hosts)
 */
async function handleCameraToggle() {
    try {
        // Verificar que sea host
        if (ZoomVideoConfig.userRole !== 'host') {
            console.warn('⚠️ Solo los hosts pueden controlar la cámara');
            return;
        }
        
        if (ZoomVideoConfig.isCameraOn) {
            await stopVideo();
        } else {
            await startVideo();
        }
    } catch (error) {
        console.error('❌ Error en toggle de cámara:', error);
    }
}

/**
 * Manejar toggle de micrófono (solo hosts)
 */
async function handleMicrophoneToggle() {
    try {
        // Verificar que sea host
        if (ZoomVideoConfig.userRole !== 'host') {
            console.warn('⚠️ Solo los hosts pueden controlar el micrófono');
            return;
        }
        
        if (!zoomVideoClient) return;
        
        const mediaStream = zoomVideoClient.getMediaStream();
        if (mediaStream) {
            if (ZoomVideoConfig.isMicrophoneOn) {
                await mediaStream.muteAudio();
                ZoomVideoConfig.isMicrophoneOn = false;
                // console.log('🎤 Micrófono silenciado');
            } else {
                await mediaStream.unmuteAudio();
                ZoomVideoConfig.isMicrophoneOn = true;
                // console.log('🎤 Micrófono activado');
            }
            updateMicrophoneButton();
        }
    } catch (error) {
        console.error('❌ Error en toggle de micrófono:', error);
    }
}

/**
 * Manejar control de volumen
 */
function handleVolumeToggle() {
    try {
        if (ZoomVideoConfig.isMuted) {
            ZoomVideoConfig.isMuted = false;
            ZoomVideoConfig.volume = ZoomVideoConfig.previousVolume || 50;
            // console.log('🔊 Audio activado');
        } else {
            ZoomVideoConfig.previousVolume = ZoomVideoConfig.volume;
            ZoomVideoConfig.isMuted = true;
            ZoomVideoConfig.volume = 0;
            // console.log('🔇 Audio silenciado');
        }
        updateVolumeButton();
        
        // TODO: Aplicar cambio de volumen real al stream
        
    } catch (error) {
        console.error('❌ Error en control de volumen:', error);
    }
}

/**
 * Manejar pantalla completa
 */
function handleFullscreenToggle() {
    const videoContainer = ZoomVideoConfig.elements.videoContainer;
    if (!videoContainer) return;
    
    if (!document.fullscreenElement) {
        // Entrar en pantalla completa
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if (videoContainer.webkitRequestFullscreen) {
            videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.mozRequestFullScreen) {
            videoContainer.mozRequestFullScreen();
        } else if (videoContainer.msRequestFullscreen) {
            videoContainer.msRequestFullscreen();
        }
    } else {
        // Salir de pantalla completa
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

/**
 * Renderizar video de un participante
 */
async function renderVideo(userId) {
    try {
        if (!zoomVideoClient) return;
        
        const mediaStream = zoomVideoClient.getMediaStream();
        if (mediaStream) {
            await mediaStream.renderVideo(
                ZoomVideoConfig.elements.videoCanvas,
                userId,
                1920, // Ancho
                1080, // Alto
                0,    // x
                0,    // y
                3     // Calidad (0-3, donde 3 es la más alta)
            );
        }
    } catch (error) {
        console.error('❌ Error renderizando video:', error);
    }
}

/**
 * Obtener configuración de sesión del servidor
 */
async function getSessionConfigFromServer() {
    try {
        // console.log('🔗 Obteniendo configuración de sesión del servidor...');
        
        const response = await fetch('/api/zoom/session-config', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Usuario no autenticado');
            } else if (response.status === 500) {
                throw new Error('Error del servidor');
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        }
        
        const sessionConfig = await response.json();
        // console.log('✅ Configuración de sesión obtenida:', {
            meetingNumber: sessionConfig.meetingNumber,
            userName: sessionConfig.userName,
            userRole: sessionConfig.userRole
        });
        
        // Actualizar configuración global con el rol del usuario
        ZoomVideoConfig.userRole = sessionConfig.userRole || 'participant';
        // console.log(`👤 Rol de usuario configurado: ${ZoomVideoConfig.userRole}`);
        
        // Actualizar controles basados en el rol
        updateRoleBasedControls();
        
        return sessionConfig;
        
    } catch (error) {
        console.error('❌ Error obteniendo configuración del servidor:', error);
        
        // Fallback a configuración mock solo para desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.warn('⚠️ Usando configuración mock para desarrollo local');
            return {
                signature: 'mock_signature_dev',
                meetingNumber: 'dev-meeting-123',
                userName: 'Usuario Desarrollo',
                topic: 'Sesión de Desarrollo',
                passWord: '',
                userRole: 'participant'
            };
        }
        
        return null;
    }
}

/**
 * Actualizar estado de la interfaz
 */
function updateUIState() {
    // Mostrar/ocultar elementos según estado de conexión
    const placeholder = document.getElementById('liveStreamMainPlaceholder');
    const videoContainer = ZoomVideoConfig.elements.videoContainer;
    const videoBasicControls = ZoomVideoConfig.elements.videoBasicControls;
    const panel = document.getElementById('liveStreamMainPanel');
    
    if (ZoomVideoConfig.isConnected) {
        // Mostrar video y controles
        if (placeholder) placeholder.style.display = 'none';
        if (videoContainer) videoContainer.style.display = 'flex';
        if (videoBasicControls) videoBasicControls.style.display = 'flex';
        if (panel) panel.classList.add('zoom-active');
        
        // Actualizar texto del botón
        updateJoinButton('Salir de Sesión', 'bx-log-out');
        
    } else {
        // Mostrar placeholder
        if (placeholder) placeholder.style.display = 'flex';
        if (videoContainer) videoContainer.style.display = 'none';
        if (videoBasicControls) videoBasicControls.style.display = 'none';
        if (panel) panel.classList.remove('zoom-active');
        
        // Actualizar texto del botón
        updateJoinButton('Unirse a Video Sesión', 'bx-video');
        showConnectionStatus('Desconectado', 'disconnected');
    }
    
    // Mostrar/ocultar controles según rol de usuario
    updateControlsVisibility();
    
    updateCameraButton();
    updateMicrophoneButton();
    updateVolumeButton();
    updateParticipantCount();
}

/**
 * Actualizar visibilidad de controles según rol
 */
function updateControlsVisibility() {
    // Obtener rol del usuario de la configuración o del servidor
    const isHost = ZoomVideoConfig.userRole === 'host';
    
    // Controles solo para hosts
    const hostOnlyElements = document.querySelectorAll('.host-only');
    hostOnlyElements.forEach(element => {
        if (isHost) {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    });
    
    // Log para debugging
    // console.log(`🎛️ Controles configurados para rol: ${isHost ? 'HOST' : 'PARTICIPANT'}`);
}

/**
 * Actualizar botón de unirse
 */
function updateJoinButton(title, iconClass) {
    const button = ZoomVideoConfig.elements.joinButton;
    const icon = button?.querySelector('i');
    
    if (button) button.title = title;
    if (icon) {
        icon.className = `bx ${iconClass}`;
    }
}

/**
 * Actualizar botón de cámara
 */
function updateCameraButton() {
    const button = ZoomVideoConfig.elements.cameraToggleBtn;
    const icon = button?.querySelector('i');
    
    if (!button || !icon) return;
    
    if (ZoomVideoConfig.isCameraOn) {
        button.classList.remove('camera-off');
        button.title = 'Apagar Cámara';
        icon.className = 'bx bx-video';
    } else {
        button.classList.add('camera-off');
        button.title = 'Encender Cámara';
        icon.className = 'bx bx-video-off';
    }
}

/**
 * Actualizar botón de micrófono
 */
function updateMicrophoneButton() {
    const button = ZoomVideoConfig.elements.microphoneToggleBtn;
    const icon = button?.querySelector('i');
    
    if (!button || !icon) return;
    
    if (ZoomVideoConfig.isMicrophoneOn) {
        button.classList.remove('microphone-off');
        button.title = 'Silenciar Micrófono';
        icon.className = 'bx bx-microphone';
    } else {
        button.classList.add('microphone-off');
        button.title = 'Activar Micrófono';
        icon.className = 'bx bx-microphone-off';
    }
}

/**
 * Actualizar botón de volumen
 */
function updateVolumeButton() {
    const button = ZoomVideoConfig.elements.volumeControlBtn;
    const icon = button?.querySelector('i');
    
    if (!button || !icon) return;
    
    if (ZoomVideoConfig.isMuted || ZoomVideoConfig.volume === 0) {
        button.classList.add('volume-muted');
        button.title = 'Activar Audio';
        icon.className = 'bx bx-volume-mute';
    } else if (ZoomVideoConfig.volume < 30) {
        button.classList.remove('volume-muted');
        button.title = 'Volumen Bajo';
        icon.className = 'bx bx-volume-low';
    } else if (ZoomVideoConfig.volume < 70) {
        button.classList.remove('volume-muted');
        button.title = 'Volumen Medio';
        icon.className = 'bx bx-volume';
    } else {
        button.classList.remove('volume-muted');
        button.title = 'Silenciar Audio';
        icon.className = 'bx bx-volume-full';
    }
}

/**
 * Actualizar botón de pantalla completa
 */
function updateFullscreenButton() {
    const button = ZoomVideoConfig.elements.fullscreenToggleBtn;
    const icon = button?.querySelector('i');
    
    if (!button || !icon) return;
    
    if (document.fullscreenElement) {
        button.title = 'Salir de Pantalla Completa';
        icon.className = 'bx bx-exit-fullscreen';
    } else {
        button.title = 'Pantalla Completa';
        icon.className = 'bx bx-fullscreen';
    }
}

/**
 * Actualizar contador de participantes
 */
function updateParticipantCount() {
    if (!ZoomVideoConfig.elements.participantCount) return;
    
    let count = 0;
    if (zoomVideoClient) {
        const participants = zoomVideoClient.getAllUser();
        count = participants ? participants.length : 0;
    }
    
    ZoomVideoConfig.participantCount = count;
    ZoomVideoConfig.elements.participantCount.textContent = 
        `${count} participante${count !== 1 ? 's' : ''}`;
}

/**
 * Mostrar estado de conexión
 */
function showConnectionStatus(text, status) {
    const statusElement = ZoomVideoConfig.elements.connectionStatus;
    if (!statusElement) return;
    
    statusElement.textContent = text;
    statusElement.className = `connection-status ${status}`;
}

/**
 * Manejar screen sharing (solo hosts)
 */
async function handleScreenShare() {
    try {
        // Verificar que sea host
        if (ZoomVideoConfig.userRole !== 'host') {
            console.warn('⚠️ Solo los hosts pueden compartir pantalla');
            return;
        }
        
        const button = ZoomVideoConfig.elements.screenShareBtn;
        const icon = button?.querySelector('i');
        
        if (ZoomVideoConfig.isScreenSharing) {
            // Detener screen sharing
            if (zoomVideoClient) {
                const mediaStream = zoomVideoClient.getMediaStream();
                if (mediaStream && mediaStream.stopShareScreen) {
                    await mediaStream.stopShareScreen();
                }
            }
            
            ZoomVideoConfig.isScreenSharing = false;
            if (button) button.classList.remove('screen-sharing');
            if (icon) icon.className = 'bx bx-desktop';
            if (button) button.title = 'Compartir pantalla';
            // console.log('🖥️ Screen sharing detenido');
            
        } else {
            // Iniciar screen sharing
            if (zoomVideoClient) {
                const mediaStream = zoomVideoClient.getMediaStream();
                if (mediaStream && mediaStream.startShareScreen) {
                    await mediaStream.startShareScreen(ZoomVideoConfig.elements.videoCanvas);
                } else {
                    // Mock implementation
                    // console.log('🧪 Mock: Iniciando screen sharing');
                }
            }
            
            ZoomVideoConfig.isScreenSharing = true;
            if (button) button.classList.add('screen-sharing');
            if (icon) icon.className = 'bx bx-desktop bx-tada';
            if (button) button.title = 'Detener pantalla compartida';
            // console.log('🖥️ Screen sharing iniciado');
        }
        
    } catch (error) {
        console.error('❌ Error en screen sharing:', error);
    }
}

/**
 * Manejar grabación (solo hosts)
 */
async function handleRecordingToggle() {
    try {
        // Verificar que sea host
        if (ZoomVideoConfig.userRole !== 'host') {
            console.warn('⚠️ Solo los hosts pueden grabar');
            return;
        }
        
        const button = ZoomVideoConfig.elements.recordingToggleBtn;
        const icon = button?.querySelector('i');
        
        if (ZoomVideoConfig.isRecording) {
            // Detener grabación
            try {
                const response = await fetch('/api/zoom/recording/stop', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ 
                        recordingId: ZoomVideoConfig.currentRecordingId 
                    })
                });
                
                const result = await response.json();
                if (response.ok) {
                    // console.log('🎥 Grabación detenida:', result);
                } else {
                    console.warn('⚠️ Error deteniendo grabación:', result.error);
                }
            } catch (error) {
                console.warn('⚠️ Error en API de grabación:', error.message);
            }
            
            ZoomVideoConfig.isRecording = false;
            ZoomVideoConfig.currentRecordingId = null;
            if (button) button.classList.remove('recording-active');
            if (icon) icon.className = 'bx bx-video-recording';
            if (button) button.title = 'Iniciar grabación';
            // console.log('⏹️ Grabación detenida');
            
        } else {
            // Iniciar grabación
            try {
                const response = await fetch('/api/zoom/recording/start', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ 
                        sessionId: ZoomVideoConfig.currentSessionId || 'mock-session-id'
                    })
                });
                
                const result = await response.json();
                if (response.ok) {
                    ZoomVideoConfig.currentRecordingId = result.recordingId;
                    // console.log('🎥 Grabación iniciada:', result);
                } else {
                    console.warn('⚠️ Error iniciando grabación:', result.error);
                    return;
                }
            } catch (error) {
                console.warn('⚠️ Error en API de grabación:', error.message);
                // Continuar con mock para desarrollo
                ZoomVideoConfig.currentRecordingId = `mock-rec-${Date.now()}`;
            }
            
            ZoomVideoConfig.isRecording = true;
            if (button) button.classList.add('recording-active');
            if (icon) icon.className = 'bx bx-video-recording bx-flashing';
            if (button) button.title = 'Detener grabación';
            // console.log('🔴 Grabación iniciada');
        }
        
    } catch (error) {
        console.error('❌ Error en toggle de grabación:', error);
    }
}

/**
 * Actualizar indicador de rol y controles de host
 */
function updateRoleBasedControls() {
    const isHost = ZoomVideoConfig.userRole === 'host';
    const container = ZoomVideoConfig.elements.zoomContainer;
    const roleBadge = ZoomVideoConfig.elements.roleBadge;
    
    // Agregar/remover clase CSS para mostrar controles de host
    if (container) {
        if (isHost) {
            container.classList.add('zoom-user-host');
        } else {
            container.classList.remove('zoom-user-host');
        }
    }
    
    // Actualizar badge de rol
    if (roleBadge) {
        roleBadge.textContent = isHost ? 'Host' : 'Participant';
        roleBadge.className = `role-badge ${isHost ? 'host-badge' : 'participant-badge'}`;
    }
    
    // console.log(`🎭 Controles configurados para rol: ${isHost ? 'HOST' : 'PARTICIPANT'}`);
}

/**
 * Limpiar recursos al salir
 */
function cleanup() {
    // console.log('🧹 Limpiando recursos de Zoom Video SDK...');
    
    if (zoomVideoClient) {
        zoomVideoClient.leave().catch(console.error);
        zoomVideoClient = null;
    }
    
    // Resetear configuración
    ZoomVideoConfig.isConnected = false;
    ZoomVideoConfig.isCameraOn = false;
    ZoomVideoConfig.isVideoActive = false;
    ZoomVideoConfig.participantCount = 0;
}

// Event listeners globales
document.addEventListener('DOMContentLoaded', function() {
    // console.log('🚀 DOM Content Loaded - Iniciando Zoom Video Integration');
    setTimeout(() => {
        // console.log('🔄 Intentando inicializar Zoom Video Integration con delay...');
        initZoomVideoIntegration();
    }, 500); // Delay para asegurar que main.js termine primero
});

// También intentar inicialización inmediata si el DOM ya está listo
if (document.readyState === 'loading') {
    // console.log('📄 DOM aún cargando, esperando...');
} else {
    // console.log('📄 DOM ya listo, iniciando inmediatamente...');
    setTimeout(() => {
        initZoomVideoIntegration();
    }, 100);
}

window.addEventListener('beforeunload', cleanup);

// Función de debug para DevTools
window.debugZoomButton = function() {
    // console.log('🔍 DEBUG DEL BOTÓN ZOOM:');
    
    const smallButton = document.getElementById('liveStreamMainToggleBtn');
    const largeButton = document.getElementById('liveStreamMainConnectBtnLarge');
    
    // console.log('Botón pequeño:', smallButton);
    // console.log('Botón grande:', largeButton);
    
    if (smallButton) {
        // console.log('👆 Eventos del botón pequeño:', getEventListeners(smallButton));
        // console.log('🎯 Añadiendo click handler de emergencia...');
        smallButton.onclick = function(e) {
            // console.log('🖱️ CLICK MANUAL DETECTADO!', e);
            handleJoinToggle(e);
        };
    }
    
    if (largeButton) {
        // console.log('👆 Eventos del botón grande:', getEventListeners(largeButton));
        // console.log('🎯 Añadiendo click handler de emergencia...');
        largeButton.onclick = function(e) {
            // console.log('🖱️ CLICK MANUAL DETECTADO!', e);
            handleJoinToggle(e);
        };
    }
    
    // console.log('📊 Config Zoom:', ZoomVideoConfig);
};

// Test manual para DevTools
window.testZoomJoin = function() {
    // console.log('🧪 TEST MANUAL: Simulando clic en botón...');
    handleJoinToggle({ target: { id: 'manual-test' } });
};

// Exportar funciones para uso global
window.ZoomVideoIntegration = {
    init: initZoomVideoIntegration,
    join: joinZoomSession,
    leave: leaveZoomSession,
    toggleCamera: handleCameraToggle,
    toggleFullscreen: handleFullscreenToggle,
    cleanup: cleanup,
    getConfig: () => ZoomVideoConfig,
    debug: window.debugZoomButton,
    test: window.testZoomJoin
};

// console.log('📹 Zoom Video Integration módulo cargado');