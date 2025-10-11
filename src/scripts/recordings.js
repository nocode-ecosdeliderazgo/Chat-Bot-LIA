/**
 * Recordings Management System
 * Handles listing, filtering, playback, and downloading of video recordings
 */

// Global variables
let recordings = [];
let filteredRecordings = [];
let currentVideo = null;
let currentUser = null;
let playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
let currentSpeedIndex = 2; // Default 1x speed
let currentView = 'cards'; // 'cards' or 'table'
let currentSort = 'date-desc';

// Initialize the recordings page
document.addEventListener('DOMContentLoaded', async function() {
    await initializeRecordingsPage();
});

/**
 * Initialize the recordings page
 */
async function initializeRecordingsPage() {
    try {
        // Initialize user session
        await initializeUserSession();
        
        // Load initial data
        await loadRecordings();
        await loadSessionFilters();
        
        // Initialize video player event listeners
        initializeVideoPlayer();
        
        // Set up periodic refresh for real-time updates
        setInterval(refreshRecordingsData, 30000); // Refresh every 30 seconds
        
        // console.log('📹 Recordings page initialized successfully');
    } catch (error) {
        console.error('Error initializing recordings page:', error);
        showError('Error al inicializar la página de grabaciones');
    }
}

/**
 * Initialize user session and check permissions
 */
async function initializeUserSession() {
    try {
        // Get current user from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'login/new-auth.html';
            return;
        }
        
        currentUser = user;
        
        // Get user profile for permissions
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (profile) {
            currentUser.profile = profile;
        }
        
    } catch (error) {
        console.error('Error initializing user session:', error);
        throw error;
    }
}

/**
 * Load recordings data from the API
 */
async function loadRecordings() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const tableContainer = document.querySelector('.recordings-table-container');
    
    try {
        loadingState.style.display = 'block';
        emptyState.style.display = 'none';
        tableContainer.style.display = 'none';
        
        // Use the Video SDK API with permission-based filtering
        const authToken = await getAuthToken();
        const response = await fetch('/api/videosdk/recordings', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        recordings = data.recordings || [];
        
        // Store user permissions for UI updates
        currentUser.permissions = data.permissions;
        filteredRecordings = [...recordings];
        
        renderRecordings();
        updateStats();
        
        if (recordings.length === 0) {
            showEmptyState();
        } else {
            showContent();
        }
        
    } catch (error) {
        console.error('Error loading recordings:', error);
        showError('Error al cargar las grabaciones');
        showEmptyState();
    } finally {
        loadingState.style.display = 'none';
    }
}

/**
 * Get mock recordings data for development
 */
async function getMockRecordings() {
    return [
        {
            recordingId: 'rec_001',
            sessionId: 'ses_chatbot_101',
            sessionName: 'Sesión Chatbot IA - Módulo 1',
            date: '2024-01-15T14:30:00Z',
            duration: 3600, // 1 hour in seconds
            size: 245760000, // ~234 MB
            status: 'available',
            downloadUrl: 'https://example.com/recordings/rec_001.mp4',
            thumbnailUrl: 'https://example.com/thumbnails/rec_001.jpg',
            canDownload: hasDownloadPermission(),
            canView: hasViewPermission()
        },
        {
            recordingId: 'rec_002',
            sessionId: 'ses_genai_201',
            sessionName: 'GenAI Workshop - Avanzado',
            date: '2024-01-14T10:00:00Z',
            duration: 5400, // 1.5 hours
            size: 367001600, // ~350 MB
            status: 'available',
            downloadUrl: 'https://example.com/recordings/rec_002.mp4',
            thumbnailUrl: 'https://example.com/thumbnails/rec_002.jpg',
            canDownload: hasDownloadPermission(),
            canView: hasViewPermission()
        },
        {
            recordingId: 'rec_003',
            sessionId: 'ses_workshop_301',
            sessionName: 'Taller Práctico IA',
            date: '2024-01-13T16:15:00Z',
            duration: 2700, // 45 minutes
            status: 'processing',
            size: 0,
            downloadUrl: null,
            thumbnailUrl: null,
            canDownload: false,
            canView: false
        },
        {
            recordingId: 'rec_004',
            sessionId: 'ses_chatbot_102',
            sessionName: 'Sesión Chatbot IA - Módulo 2',
            date: '2024-01-12T14:30:00Z',
            duration: 4200, // 1.16 hours
            size: 301989888, // ~288 MB
            status: 'available',
            downloadUrl: 'https://example.com/recordings/rec_004.mp4',
            thumbnailUrl: 'https://example.com/thumbnails/rec_004.jpg',
            canDownload: hasDownloadPermission(),
            canView: hasViewPermission()
        }
    ];
}

/**
 * Check if user has download permission
 */
function hasDownloadPermission() {
    // Use permissions from server response
    return currentUser?.permissions?.canDownload || false;
}

/**
 * Check if user has view permission
 */
function hasViewPermission() {
    // Use permissions from server response
    return currentUser?.permissions?.canView || false;
}

/**
 * Render the recordings table with enhanced features
 */
function renderRecordingsTable() {
    const tableBody = document.getElementById('recordingsTableBody');
    
    if (filteredRecordings.length === 0) {
        showEmptyState();
        return;
    }
    
    const recordingsHTML = filteredRecordings.map(recording => {
        const date = new Date(recording.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const duration = formatDuration(recording.duration);
        const size = recording.size > 0 ? formatFileSize(recording.size) : '-';
        const status = getStatusBadge(recording.status);
        const actions = getActionButtons(recording);
        
        // Enhanced table row with embedded player support
        return `
            <tr data-recording-id="${recording.recordingId}" class="recording-row">
                <td class="date-cell">
                    <div class="date-info">
                        <span class="date-main">${date}</span>
                        <span class="date-time">${new Date(recording.date).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                </td>
                <td class="session-cell">
                    <div class="session-info">
                        <span class="session-name">${recording.sessionName || recording.sessionId}</span>
                        <span class="session-id">ID: ${recording.sessionId}</span>
                    </div>
                </td>
                <td class="duration-cell">
                    <div class="duration-info">
                        <span class="duration-main">${duration}</span>
                        <span class="duration-seconds">${recording.duration || 0}s</span>
                    </div>
                </td>
                <td class="size-cell">
                    <div class="size-info">
                        <span class="size-main">${size}</span>
                        <span class="size-bytes">${recording.size || 0} bytes</span>
                    </div>
                </td>
                <td class="status-cell">${status}</td>
                <td class="actions-cell">${actions}</td>
            </tr>
            <tr class="embedded-player-row" id="embedded-player-${recording.recordingId}" style="display: none;">
                <td colspan="6">
                    <div class="embedded-player-container">
                        <div class="embedded-player-header">
                            <h4>Reproduciendo: ${recording.sessionName || recording.sessionId}</h4>
                            <button class="close-embedded-btn" onclick="closeEmbeddedPlayer('${recording.recordingId}')">
                                <i class='bx bx-x'></i>
                            </button>
                        </div>
                        <div class="embedded-video-wrapper">
                            <video class="embedded-video" id="embedded-video-${recording.recordingId}" controls>
                                <source src="${recording.downloadUrl}" type="video/mp4">
                                Tu navegador no soporta la reproducción de videos.
                            </video>
                        </div>
                        <div class="embedded-controls">
                            <div class="embedded-info">
                                <span><i class='bx bx-calendar'></i> ${date}</span>
                                <span><i class='bx bx-time'></i> ${duration}</span>
                                <span><i class='bx bx-hdd'></i> ${size}</span>
                            </div>
                            <div class="embedded-actions">
                                <button class="embedded-action-btn" onclick="downloadRecording('${recording.recordingId}')" ${!recording.canDownload ? 'disabled' : ''}>
                                    <i class='bx bx-download'></i> Descargar
                                </button>
                                <button class="embedded-action-btn" onclick="openInModal('${recording.recordingId}')">
                                    <i class='bx bx-fullscreen'></i> Pantalla completa
                                </button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = recordingsHTML;
    showTableContent();
}

/**
 * Format duration in seconds to human readable format
 */
function formatDuration(seconds) {
    if (!seconds || seconds === 0) return '-';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

/**
 * Format file size in bytes to human readable format
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const statusConfig = {
        'recording': { text: 'Grabando', icon: 'bx-radio-circle-marked' },
        'available': { text: 'Disponible', icon: 'bx-check-circle' },
        'processing': { text: 'Procesando', icon: 'bx-time-five' },
        'error': { text: 'Error', icon: 'bx-error-circle' }
    };
    
    const config = statusConfig[status] || statusConfig.error;
    
    return `
        <span class="status-badge ${status}">
            <i class='bx ${config.icon}'></i>
            ${config.text}
        </span>
    `;
}

/**
 * Get action buttons HTML with enhanced functionality
 */
function getActionButtons(recording) {
    let buttons = '';
    
    // Play button - Enhanced with embedded player option
    if (recording.canView && recording.status === 'available' && recording.downloadUrl) {
        buttons += `
            <button class="action-btn play" onclick="playRecording('${recording.recordingId}')" title="Reproducir en modal">
                <i class='bx bx-play'></i>
                Ver
            </button>
            <button class="action-btn embedded" onclick="playEmbedded('${recording.recordingId}')" title="Reproducir embebido">
                <i class='bx bx-video'></i>
                Embebido
            </button>
        `;
    } else {
        buttons += `
            <button class="action-btn play" disabled title="No disponible">
                <i class='bx bx-play'></i>
                Ver
            </button>
            <button class="action-btn embedded" disabled title="No disponible">
                <i class='bx bx-video'></i>
                Embebido
            </button>
        `;
    }
    
    // Download button with permission check
    if (recording.canDownload && recording.status === 'available' && recording.downloadUrl) {
        buttons += `
            <button class="action-btn download" onclick="downloadRecording('${recording.recordingId}')" title="Descargar">
                <i class='bx bx-download'></i>
                Descargar
            </button>
        `;
    } else {
        const title = recording.canDownload ? 'No disponible' : 'Sin permisos de descarga';
        buttons += `
            <button class="action-btn download" disabled title="${title}">
                <i class='bx bx-download'></i>
                Descargar
            </button>
        `;
    }
    
    return `<div class="action-buttons">${buttons}</div>`;
}

/**
 * Load session filters
 */
async function loadSessionFilters() {
    const sessionFilter = document.getElementById('session-filter');
    const uniqueSessions = [...new Set(recordings.map(r => r.sessionId))];
    
    uniqueSessions.forEach(sessionId => {
        const option = document.createElement('option');
        option.value = sessionId;
        option.textContent = recordings.find(r => r.sessionId === sessionId)?.sessionName || sessionId;
        sessionFilter.appendChild(option);
    });
}

/**
 * Filter recordings by session
 */
function filterBySession() {
    const sessionFilter = document.getElementById('session-filter');
    const selectedSession = sessionFilter.value;
    
    if (selectedSession) {
        filteredRecordings = recordings.filter(r => r.sessionId === selectedSession);
    } else {
        filteredRecordings = [...recordings];
    }
    
    // Apply other active filters
    applyDateFilter();
    applySearchFilter();
    
    renderRecordingsTable();
}

/**
 * Filter recordings by date
 */
function filterByDate() {
    applyDateFilter();
    renderRecordingsTable();
}

/**
 * Apply date filter to current filtered recordings
 */
function applyDateFilter() {
    const dateFilter = document.getElementById('date-filter');
    const selectedDate = dateFilter.value;
    
    if (selectedDate) {
        const filterDate = new Date(selectedDate);
        filteredRecordings = filteredRecordings.filter(r => {
            const recordingDate = new Date(r.date);
            return recordingDate.toDateString() === filterDate.toDateString();
        });
    }
}

/**
 * Search recordings
 */
function searchRecordings() {
    applySearchFilter();
    renderRecordingsTable();
}

/**
 * Apply search filter to current filtered recordings
 */
function applySearchFilter() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm) {
        filteredRecordings = filteredRecordings.filter(r => 
            (r.sessionName || r.sessionId).toLowerCase().includes(searchTerm) ||
            r.recordingId.toLowerCase().includes(searchTerm)
        );
    }
}

/**
 * Sort table by column
 */
function sortTable(columnIndex) {
    const sortKeys = ['date', 'sessionName', 'duration', 'size'];
    const sortKey = sortKeys[columnIndex];
    
    filteredRecordings.sort((a, b) => {
        let valueA = a[sortKey];
        let valueB = b[sortKey];
        
        // Handle different data types
        if (sortKey === 'date') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        } else if (sortKey === 'sessionName') {
            valueA = (valueA || a.sessionId).toLowerCase();
            valueB = (valueB || b.sessionId).toLowerCase();
        }
        
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
    });
    
    renderRecordingsTable();
}

/**
 * Play recording in enhanced modal
 */
function playRecording(recordingId) {
    const recording = recordings.find(r => r.recordingId === recordingId);
    if (!recording || !recording.downloadUrl) {
        showError('Grabación no disponible para reproducción');
        return;
    }
    
    // Set up enhanced modal
    const modal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalSessionName = document.getElementById('modalSessionName');
    const modalDate = document.getElementById('modalDate');
    const modalDuration = document.getElementById('modalDuration');
    const modalSize = document.getElementById('modalSize');
    const videoSource = document.getElementById('videoSource');
    const videoPlayer = document.getElementById('videoPlayer');
    
    // Set modal content
    modalTitle.textContent = recording.sessionName || recording.sessionId;
    modalSessionName.textContent = recording.sessionId;
    modalDate.textContent = new Date(recording.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    modalDuration.textContent = formatDuration(recording.duration);
    modalSize.textContent = recording.size > 0 ? formatFileSize(recording.size) : '-';
    
    // Set video source
    videoSource.src = recording.downloadUrl;
    videoPlayer.load();
    
    // Update additional info
    document.getElementById('recordingDate').textContent = new Date(recording.date).toLocaleDateString('es-ES');
    document.getElementById('recordingInstructor').textContent = 'Chat LIA';
    document.getElementById('recordingParticipants').textContent = '1 participante';
    
    // Reset player state
    currentVideo = recording;
    currentSpeedIndex = 2; // Reset to 1x speed
    document.getElementById('speedText').textContent = '1x';
    
    // Update download button state
    const downloadBtn = document.getElementById('downloadBtn');
    if (recording.canDownload && recording.status === 'available') {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="bx bx-download"></i> Descargar';
    } else {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="bx bx-download"></i> No disponible';
    }
    
    // Show modal with animation
    modal.classList.add('show');
    
    // Auto-play if user prefers (after short delay for modal animation)
    setTimeout(() => {
        videoPlayer.play().catch(e => // console.log('Auto-play prevented by browser'));
    }, 600);
}

/**
 * Close video modal
 */
function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    
    modal.classList.remove('show');
    currentVideo = null;
}

/**
 * Close modal when clicking outside
 */
function closeModal(event) {
    if (event.target.id === 'videoModal') {
        closeVideoModal();
    }
}

/**
 * Play recording in embedded player within table
 */
function playEmbedded(recordingId) {
    const recording = recordings.find(r => r.recordingId === recordingId);
    if (!recording || !recording.downloadUrl) {
        showError('Grabación no disponible para reproducción');
        return;
    }
    
    // Check permissions
    if (!recording.canView) {
        showError('No tienes permisos para ver esta grabación');
        return;
    }
    
    // Close any other embedded players
    closeAllEmbeddedPlayers();
    
    // Show embedded player
    const embeddedRow = document.getElementById(`embedded-player-${recordingId}`);
    if (embeddedRow) {
        embeddedRow.style.display = 'table-row';
        
        // Initialize embedded video player
        const embeddedVideo = document.getElementById(`embedded-video-${recordingId}`);
        if (embeddedVideo) {
            embeddedVideo.load();
            
            // Auto-play if user prefers
            embeddedVideo.play().catch(e => {
                // console.log('Auto-play prevented by browser for embedded player');
            });
        }
        
        // Scroll to embedded player
        embeddedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Close embedded player
 */
function closeEmbeddedPlayer(recordingId) {
    const embeddedRow = document.getElementById(`embedded-player-${recordingId}`);
    if (embeddedRow) {
        const embeddedVideo = document.getElementById(`embedded-video-${recordingId}`);
        if (embeddedVideo) {
            embeddedVideo.pause();
            embeddedVideo.currentTime = 0;
        }
        embeddedRow.style.display = 'none';
    }
}

/**
 * Close all embedded players
 */
function closeAllEmbeddedPlayers() {
    const embeddedRows = document.querySelectorAll('.embedded-player-row');
    embeddedRows.forEach(row => {
        const recordingId = row.id.replace('embedded-player-', '');
        closeEmbeddedPlayer(recordingId);
    });
}

/**
 * Open recording in modal from embedded player
 */
function openInModal(recordingId) {
    closeEmbeddedPlayer(recordingId);
    playRecording(recordingId);
}

/**
 * Initialize video player event listeners
 */
function initializeVideoPlayer() {
    const videoPlayer = document.getElementById('videoPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const timeDisplay = document.getElementById('timeDisplay');
    
    // Play/pause button update
    videoPlayer.addEventListener('play', () => {
        playPauseBtn.innerHTML = '<i class="bx bx-pause"></i>';
    });
    
    videoPlayer.addEventListener('pause', () => {
        playPauseBtn.innerHTML = '<i class="bx bx-play"></i>';
    });
    
    // Time update
    videoPlayer.addEventListener('timeupdate', () => {
        const current = videoPlayer.currentTime;
        const duration = videoPlayer.duration;
        
        if (!isNaN(duration)) {
            timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
        }
    });
    
    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', () => {
        videoPlayer.volume = volumeSlider.value / 100;
        updateMuteButton();
    });
}

/**
 * Toggle play/pause
 */
function togglePlayPause() {
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (videoPlayer.paused) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }
}

/**
 * Toggle mute
 */
function toggleMute() {
    const videoPlayer = document.getElementById('videoPlayer');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    
    if (videoPlayer.muted) {
        videoPlayer.muted = false;
        volumeSlider.value = videoPlayer.volume * 100;
    } else {
        videoPlayer.muted = true;
        volumeSlider.value = 0;
    }
    
    updateMuteButton();
}

/**
 * Update mute button icon
 */
function updateMuteButton() {
    const videoPlayer = document.getElementById('videoPlayer');
    const muteBtn = document.getElementById('muteBtn');
    
    if (videoPlayer.muted || videoPlayer.volume === 0) {
        muteBtn.innerHTML = '<i class="bx bx-volume-mute"></i>';
    } else if (videoPlayer.volume < 0.5) {
        muteBtn.innerHTML = '<i class="bx bx-volume-low"></i>';
    } else {
        muteBtn.innerHTML = '<i class="bx bx-volume-full"></i>';
    }
}

/**
 * Set volume
 */
function setVolume() {
    const videoPlayer = document.getElementById('videoPlayer');
    const volumeSlider = document.getElementById('volumeSlider');
    
    videoPlayer.volume = volumeSlider.value / 100;
    videoPlayer.muted = volumeSlider.value === '0';
    updateMuteButton();
}

/**
 * Change playback speed
 */
function changePlaybackSpeed() {
    const videoPlayer = document.getElementById('videoPlayer');
    
    currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
    videoPlayer.playbackRate = playbackSpeeds[currentSpeedIndex];
    
    updateSpeedButton();
}

/**
 * Update speed button text
 */
function updateSpeedButton() {
    const speedBtn = document.getElementById('speedBtn');
    speedBtn.textContent = `${playbackSpeeds[currentSpeedIndex]}x`;
}

/**
 * Toggle fullscreen
 */
function toggleFullscreen() {
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (!document.fullscreenElement) {
        videoPlayer.requestFullscreen().catch(err => {
            // console.log('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

/**
 * Download recording with permission verification
 */
async function downloadRecording(recordingId) {
    const recording = recordings.find(r => r.recordingId === recordingId);
    if (!recording || !recording.canDownload) {
        showError('No tienes permisos para descargar esta grabación');
        return;
    }
    
    try {
        // Request download permission and URL from server
        const authToken = await getAuthToken();
        const response = await fetch(`/api/videosdk/recording/${recordingId}/download`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('No tienes permisos para descargar esta grabación');
            } else if (response.status === 404) {
                throw new Error('Grabación no disponible para descarga');
            } else {
                throw new Error('Error al procesar la descarga');
            }
        }
        
        const data = await response.json();
        
        if (!data.downloadUrl) {
            throw new Error('URL de descarga no disponible');
        }
        
        // Create secure download link
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename || `${recording.sessionName || recordingId}.mp4`;
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // console.log(`📥 Download initiated for recording: ${recordingId}`);
        
    } catch (error) {
        console.error('Error downloading recording:', error);
        showError(error.message || 'Error al descargar la grabación');
    }
}

/**
 * Format time in seconds to MM:SS
 */
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Refresh recordings data periodically
 */
async function refreshRecordingsData() {
    try {
        // Only refresh if not currently loading
        const loadingState = document.getElementById('loadingState');
        if (loadingState.style.display !== 'none') return;
        
        await loadRecordings();
        // console.log('📹 Recordings data refreshed');
    } catch (error) {
        console.error('Error refreshing recordings:', error);
    }
}

/**
 * Show table content
 */
function showTableContent() {
    const tableContainer = document.querySelector('.recordings-table-container');
    const emptyState = document.getElementById('emptyState');
    
    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';
}

/**
 * Show empty state
 */
function showEmptyState() {
    const tableContainer = document.querySelector('.recordings-table-container');
    const emptyState = document.getElementById('emptyState');
    
    tableContainer.style.display = 'none';
    emptyState.style.display = 'block';
}

/**
 * Show error message
 */
function showError(message) {
    console.error(message);
    // You can implement a proper error notification system here
    alert(message);
}

/**
 * Get auth token for API requests
 */
async function getAuthToken() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

/**
 * Switch between cards and table view
 */
function switchView(viewType) {
    currentView = viewType;
    
    // Update toggle buttons
    document.querySelectorAll('.view-toggle').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewType);
    });
    
    // Show/hide content
    const cardsView = document.getElementById('recordingsGrid');
    const tableView = document.getElementById('recordingsTableContainer');
    
    if (viewType === 'cards') {
        cardsView.style.display = 'grid';
        tableView.style.display = 'none';
    } else {
        cardsView.style.display = 'none';
        tableView.style.display = 'block';
    }
    
    renderRecordings();
}

/**
 * Update statistics in hero section
 */
function updateStats() {
    const totalRecordings = recordings.length;
    const totalDuration = recordings.reduce((sum, r) => sum + (r.duration || 0), 0);
    const availableDownloads = recordings.filter(r => r.canDownload && r.status === 'available').length;
    
    document.getElementById('totalRecordings').textContent = totalRecordings;
    document.getElementById('totalDuration').textContent = Math.round(totalDuration / 3600 * 10) / 10; // Hours
    document.getElementById('availableDownloads').textContent = availableDownloads;
    
    // Update results count
    document.getElementById('resultsCount').textContent = filteredRecordings.length;
}

/**
 * Render recordings based on current view
 */
function renderRecordings() {
    if (currentView === 'cards') {
        renderCardsView();
    } else {
        renderTableView();
    }
    updateStats();
}

/**
 * Render cards view
 */
function renderCardsView() {
    const cardsContainer = document.getElementById('recordingsGrid');
    
    if (filteredRecordings.length === 0) {
        cardsContainer.innerHTML = '';
        return;
    }
    
    const cardsHTML = filteredRecordings.map(recording => {
        const date = new Date(recording.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const duration = formatDuration(recording.duration);
        const size = recording.size > 0 ? formatFileSize(recording.size) : '-';
        const status = getStatusBadge(recording.status);
        
        return `
            <div class="recording-card" data-recording-id="${recording.recordingId}">
                <div class="card-thumbnail">
                    <i class='bx bx-video'></i>
                    ${recording.canView && recording.status === 'available' ? `
                        <div class="card-play-overlay" onclick="playRecording('${recording.recordingId}')">
                            <i class='bx bx-play'></i>
                        </div>
                    ` : ''}
                    <div class="card-duration">${duration}</div>
                </div>
                
                <div class="card-content">
                    <div class="card-header">
                        <div class="card-session-badge">
                            <i class='bx bx-collection'></i>
                            ${recording.sessionId}
                        </div>
                        <h3 class="card-title">${recording.sessionName || recording.sessionId}</h3>
                        <div class="card-meta">
                            <div class="meta-item">
                                <i class='bx bx-calendar'></i>
                                ${date}
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-stats">
                        <div class="stat-item">
                            <span class="stat-value">${duration}</span>
                            <span class="stat-label">Duración</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${size}</span>
                            <span class="stat-label">Tamaño</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        ${status}
                    </div>
                    
                    <div class="card-actions">
                        ${recording.canView && recording.status === 'available' && recording.downloadUrl ? `
                            <button class="card-btn primary" onclick="playRecording('${recording.recordingId}')">
                                <i class='bx bx-play'></i>
                                Reproducir
                            </button>
                        ` : `
                            <button class="card-btn primary" disabled>
                                <i class='bx bx-play'></i>
                                No disponible
                            </button>
                        `}
                        
                        ${recording.canDownload && recording.status === 'available' && recording.downloadUrl ? `
                            <button class="card-btn secondary" onclick="downloadRecording('${recording.recordingId}')">
                                <i class='bx bx-download'></i>
                                Descargar
                            </button>
                        ` : `
                            <button class="card-btn secondary" disabled>
                                <i class='bx bx-download'></i>
                                ${recording.canDownload ? 'No disponible' : 'Sin permisos'}
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    cardsContainer.innerHTML = cardsHTML;
}

/**
 * Render table view (existing function renamed)
 */
function renderTableView() {
    renderRecordingsTable();
}

/**
 * Filter by status
 */
function filterByStatus() {
    applyAllFilters();
    renderRecordings();
}

/**
 * Apply all active filters
 */
function applyAllFilters() {
    let filtered = [...recordings];
    
    // Session filter
    const sessionFilter = document.getElementById('session-filter');
    if (sessionFilter.value) {
        filtered = filtered.filter(r => r.sessionId === sessionFilter.value);
    }
    
    // Date filter
    const dateFilter = document.getElementById('date-filter');
    if (dateFilter.value) {
        const filterDate = new Date(dateFilter.value);
        filtered = filtered.filter(r => {
            const recordingDate = new Date(r.date);
            return recordingDate.toDateString() === filterDate.toDateString();
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter.value) {
        filtered = filtered.filter(r => r.status === statusFilter.value);
    }
    
    // Search filter
    const searchInput = document.getElementById('search-input');
    if (searchInput.value.trim()) {
        const searchTerm = searchInput.value.toLowerCase().trim();
        filtered = filtered.filter(r => 
            (r.sessionName || r.sessionId).toLowerCase().includes(searchTerm) ||
            r.recordingId.toLowerCase().includes(searchTerm)
        );
        
        // Show clear search button
        document.querySelector('.clear-search').style.display = 'block';
    } else {
        document.querySelector('.clear-search').style.display = 'none';
    }
    
    filteredRecordings = filtered;
}

/**
 * Sort recordings
 */
function sortRecordings() {
    const sortSelect = document.getElementById('sort-select');
    currentSort = sortSelect.value;
    
    const [field, order] = currentSort.split('-');
    
    filteredRecordings.sort((a, b) => {
        let valueA, valueB;
        
        switch (field) {
            case 'date':
                valueA = new Date(a.date);
                valueB = new Date(b.date);
                break;
            case 'duration':
                valueA = a.duration || 0;
                valueB = b.duration || 0;
                break;
            case 'size':
                valueA = a.size || 0;
                valueB = b.size || 0;
                break;
            case 'name':
                valueA = (a.sessionName || a.sessionId).toLowerCase();
                valueB = (b.sessionName || b.sessionId).toLowerCase();
                break;
            default:
                return 0;
        }
        
        if (order === 'asc') {
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
            return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
    });
    
    renderRecordings();
}

/**
 * Clear search input
 */
function clearSearch() {
    document.getElementById('search-input').value = '';
    document.querySelector('.clear-search').style.display = 'none';
    applyAllFilters();
    renderRecordings();
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    document.getElementById('session-filter').value = '';
    document.getElementById('date-filter').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('search-input').value = '';
    document.querySelector('.clear-search').style.display = 'none';
    
    filteredRecordings = [...recordings];
    renderRecordings();
}

/**
 * Enhanced search function
 */
function searchRecordings() {
    applyAllFilters();
    renderRecordings();
}

/**
 * Enhanced filter functions
 */
function filterBySession() {
    applyAllFilters();
    renderRecordings();
}

function filterByDate() {
    applyAllFilters();
    renderRecordings();
}

/**
 * Show content (replaces showTableContent)
 */
function showContent() {
    const cardsView = document.getElementById('recordingsGrid');
    const tableView = document.getElementById('recordingsTableContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (currentView === 'cards') {
        cardsView.style.display = 'grid';
        tableView.style.display = 'none';
    } else {
        cardsView.style.display = 'none';
        tableView.style.display = 'block';
    }
    
    emptyState.style.display = 'none';
}

/**
 * Enhanced video player controls
 */
function skipBackward() {
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 10);
}

function skipForward() {
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + 10);
}

function seekVideo(event) {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (videoPlayer.duration) {
        videoPlayer.currentTime = percentage * videoPlayer.duration;
    }
}

function toggleSpeedMenu() {
    const speedMenu = document.getElementById('speedMenu');
    speedMenu.classList.toggle('show');
    
    // Close menu when clicking outside
    if (speedMenu.classList.contains('show')) {
        setTimeout(() => {
            document.addEventListener('click', function closeSpeedMenu(e) {
                if (!speedMenu.contains(e.target) && !e.target.closest('#speedBtn')) {
                    speedMenu.classList.remove('show');
                    document.removeEventListener('click', closeSpeedMenu);
                }
            });
        }, 100);
    }
}

function setPlaybackSpeed(speed) {
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.playbackRate = speed;
    
    // Update UI
    document.getElementById('speedText').textContent = `${speed}x`;
    
    // Update active option
    document.querySelectorAll('.speed-option').forEach(option => {
        option.classList.toggle('active', parseFloat(option.textContent) === speed);
    });
    
    // Close menu
    document.getElementById('speedMenu').classList.remove('show');
}

function toggleQualityMenu() {
    // Quality selection functionality - implement as needed
    // console.log('Quality menu toggled');
}

function togglePictureInPicture() {
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
        videoPlayer.requestPictureInPicture().catch(error => {
            // console.log('Error entering Picture-in-Picture:', error);
        });
    }
}

function shareRecording() {
    if (currentVideo) {
        const shareData = {
            title: currentVideo.sessionName || 'Grabación',
            text: `Mira esta grabación: ${currentVideo.sessionName || currentVideo.recordingId}`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareData.url).then(() => {
                showNotification('Enlace copiado al portapapeles');
            });
        }
    }
}

function downloadCurrentRecording() {
    if (currentVideo) {
        downloadRecording(currentVideo.recordingId);
    }
}

/**
 * Show notification
 */
function showNotification(message) {
    // Simple notification - could be enhanced with a proper notification system
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Enhanced video player initialization
 */
function initializeVideoPlayer() {
    const videoPlayer = document.getElementById('videoPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const timeCurrent = document.getElementById('timeCurrent');
    const timeTotal = document.getElementById('timeTotal');
    const progressPlayed = document.getElementById('progressPlayed');
    const progressBuffer = document.getElementById('progressBuffer');
    const progressHandle = document.getElementById('progressHandle');
    
    // Play/pause button update
    videoPlayer.addEventListener('play', () => {
        playPauseBtn.innerHTML = '<i class="bx bx-pause"></i>';
        document.querySelector('.play-button-overlay i').className = 'bx bx-pause';
    });
    
    videoPlayer.addEventListener('pause', () => {
        playPauseBtn.innerHTML = '<i class="bx bx-play"></i>';
        document.querySelector('.play-button-overlay i').className = 'bx bx-play';
    });
    
    // Time and progress updates
}

/**
 * Enhanced permission checking functions
 */

/**
 * Check if user can view recording with detailed permission logic
 */
function canViewRecording(recording) {
    // Check user permissions
    if (!currentUser) return false;
    
    // Admin users can view all recordings
    if (currentUser.profile?.role === 'admin') return true;
    
    // Check if user is the owner of the recording
    if (recording.userId === currentUser.id) return true;
    
    // Check if user has explicit view permissions
    if (recording.permissions?.view?.includes(currentUser.id)) return true;
    
    // Check if user is part of the session
    if (recording.sessionParticipants?.includes(currentUser.id)) return true;
    
    // Use permissions from server response as fallback
    return currentUser?.permissions?.canView || false;
}

/**
 * Check if user can download recording with detailed permission logic
 */
function canDownloadRecording(recording) {
    // Check user permissions
    if (!currentUser) return false;
    
    // Admin users can download all recordings
    if (currentUser.profile?.role === 'admin') return true;
    
    // Check if user is the owner of the recording
    if (recording.userId === currentUser.id) return true;
    
    // Check if user has explicit download permissions
    if (recording.permissions?.download?.includes(currentUser.id)) return true;
    
    // Check if user is part of the session and has download rights
    if (recording.sessionParticipants?.includes(currentUser.id) && 
        recording.sessionSettings?.allowDownload) return true;
    
    // Use permissions from server response as fallback
    return currentUser?.permissions?.canDownload || false;
}

/**
 * Check if user can edit recording metadata
 */
function canEditRecording(recording) {
    // Check user permissions
    if (!currentUser) return false;
    
    // Admin users can edit all recordings
    if (currentUser.profile?.role === 'admin') return true;
    
    // Check if user is the owner of the recording
    if (recording.userId === currentUser.id) return true;
    
    // Check if user has explicit edit permissions
    if (recording.permissions?.edit?.includes(currentUser.id)) return true;
    
    return false;
}

/**
 * Get user's recording permissions summary
 */
function getUserRecordingPermissions() {
    if (!currentUser) return {
        canView: false,
        canDownload: false,
        canEdit: false,
        canDelete: false,
        role: 'guest'
    };
    
    const role = currentUser.profile?.role || 'student';
    
    return {
        canView: true, // All authenticated users can view
        canDownload: role === 'admin' || role === 'instructor',
        canEdit: role === 'admin' || role === 'instructor',
        canDelete: role === 'admin',
        role: role
    };
}

/**
 * Validate recording access before playback
 */
function validateRecordingAccess(recording, action = 'view') {
    const permissions = getUserRecordingPermissions();
    
    switch (action) {
        case 'view':
            if (!permissions.canView) {
                showError('No tienes permisos para ver grabaciones');
                return false;
            }
            if (!canViewRecording(recording)) {
                showError('No tienes permisos para ver esta grabación específica');
                return false;
            }
            break;
            
        case 'download':
            if (!permissions.canDownload) {
                showError('No tienes permisos para descargar grabaciones');
                return false;
            }
            if (!canDownloadRecording(recording)) {
                showError('No tienes permisos para descargar esta grabación específica');
                return false;
            }
            break;
            
        case 'edit':
            if (!permissions.canEdit) {
                showError('No tienes permisos para editar grabaciones');
                return false;
            }
            if (!canEditRecording(recording)) {
                showError('No tienes permisos para editar esta grabación específica');
                return false;
            }
            break;
            
        default:
            showError('Acción no válida');
            return false;
    }
    
    return true;
}
    videoPlayer.addEventListener('timeupdate', () => {
        const current = videoPlayer.currentTime;
        const duration = videoPlayer.duration;
        
        if (!isNaN(duration)) {
            timeCurrent.textContent = formatTime(current);
            timeTotal.textContent = formatTime(duration);
            
            // Update progress bar
            const percentage = (current / duration) * 100;
            progressPlayed.style.width = `${percentage}%`;
            progressHandle.style.left = `${percentage}%`;
        }
    });
    
    // Buffer progress
    videoPlayer.addEventListener('progress', () => {
        if (videoPlayer.buffered.length > 0) {
            const buffered = videoPlayer.buffered.end(videoPlayer.buffered.length - 1);
            const duration = videoPlayer.duration;
            if (duration > 0) {
                const percentage = (buffered / duration) * 100;
                progressBuffer.style.width = `${percentage}%`;
            }
        }
    });
    
    // Loading states
    videoPlayer.addEventListener('loadstart', () => {
        document.getElementById('videoLoading').style.display = 'flex';
    });
    
    videoPlayer.addEventListener('canplay', () => {
        document.getElementById('videoLoading').style.display = 'none';
    });
    
    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', () => {
        videoPlayer.volume = volumeSlider.value / 100;
        videoPlayer.muted = volumeSlider.value === '0';
        updateMuteButton();
    });
}