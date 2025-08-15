// ===== CHAT GENERAL JAVASCRIPT =====

class ChatGeneral {
    constructor() {
        this.messages = [];
        this.currentUser = {
            id: 1,
            name: 'Usuario',
            avatar: '../assets/images/icono.png'
        };
        this.settings = this.loadSettings();
        this.applySettings();
        this.init();
    }

    // Cargar configuración guardada
    loadSettings() {
        const defaultSettings = {
            soundNotifications: true,
            desktopNotifications: true,
            chatBackground: 'default',
            customBackgroundUrl: '',
            messageDensity: 'normal',
            showTimestamps: true,
            showAvatars: true,
            showMessageBorders: false,
            autoScroll: true,
            enterToSend: false,
            showTypingIndicator: true,
            colorTheme: 'cybernetic'
        };

        try {
            const savedSettings = localStorage.getItem('chatSettings');
            return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    }

    // Guardar configuración
    saveSettings() {
        try {
            localStorage.setItem('chatSettings', JSON.stringify(this.settings));
            this.applySettings();
            this.showToast('Configuración guardada exitosamente', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Error al guardar la configuración', 'error');
        }
    }

    // Aplicar configuración al chat
    applySettings() {
        const body = document.body;
        const messagesContainer = document.getElementById('messagesContainer');
        
        // Aplicar fondo al contenedor de mensajes
        body.className = body.className.replace(/bg-\w+/g, ''); // Remover clases de fondo existentes
        body.classList.add(`bg-${this.settings.chatBackground}`);
        
        // SOLUCIÓN DEFINITIVA - Limpiar cualquier imagen de fondo y asegurar gradiente
        if (messagesContainer) {
            // Eliminar cualquier imagen de fondo que pueda estar aplicada
            messagesContainer.style.backgroundImage = '';
            // Asegurar que el gradiente de CSS se aplique
            messagesContainer.style.background = '';
            // Eliminar cualquier otra propiedad de background que pueda interferir
            messagesContainer.style.backgroundSize = '';
            messagesContainer.style.backgroundPosition = '';
            messagesContainer.style.backgroundRepeat = '';
            messagesContainer.style.backgroundAttachment = '';
        }
        
        if (this.settings.chatBackground === 'custom' && this.settings.customBackgroundUrl) {
            if (messagesContainer) {
                messagesContainer.style.backgroundImage = `url(${this.settings.customBackgroundUrl})`;
            }
        }

        // Aplicar tema de color
        body.className = body.className.replace(/theme-\w+/g, ''); // Remover clases de tema existentes
        body.classList.add(`theme-${this.settings.colorTheme}`);

        // Aplicar densidad de mensajes
        body.className = body.className.replace(/density-\w+/g, ''); // Remover clases de densidad existentes
        body.classList.add(`density-${this.settings.messageDensity}`);

        // Aplicar visibilidad de elementos
        if (!this.settings.showTimestamps) body.classList.add('hide-timestamps');
        if (!this.settings.showAvatars) body.classList.add('hide-avatars');
        if (this.settings.showMessageBorders) body.classList.add('show-message-borders');

        // Aplicar configuración de Enter para enviar
        this.setupEnterToSend();
    }

    // Configurar Enter para enviar
    setupEnterToSend() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        messageInput.removeEventListener('keydown', this.handleKeyDown);
        messageInput.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        if (this.settings.enterToSend) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.sendMessage();
            }
        } else {
            if (event.key === 'Enter' && event.shiftKey) {
                event.preventDefault();
                this.sendMessage();
            }
        }
    }

    init() {
        this.loadMessages();
        this.setupEventListeners();
        this.setupSettingsModal();
        this.updateStats();
        this.hideLoading();
    }

    setupSettingsModal() {
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsModal = document.getElementById('closeSettingsModal');
        const cancelSettings = document.getElementById('cancelSettings');
        const saveSettings = document.getElementById('saveSettings');
        const chatBackground = document.getElementById('chatBackground');
        const customBackgroundContainer = document.getElementById('customBackgroundContainer');
        const customBackgroundUrl = document.getElementById('customBackgroundUrl');

        // Cargar configuración actual en el modal
        this.loadSettingsToModal();

        // Mostrar/ocultar campo de URL personalizada
        chatBackground.addEventListener('change', () => {
            if (chatBackground.value === 'custom') {
                customBackgroundContainer.style.display = 'block';
            } else {
                customBackgroundContainer.style.display = 'none';
            }
        });

        // Cerrar modal
        closeSettingsModal.addEventListener('click', () => this.closeModal(settingsModal));
        cancelSettings.addEventListener('click', () => this.closeModal(settingsModal));

        // Guardar configuración
        saveSettings.addEventListener('click', () => {
            this.saveSettingsFromModal();
            this.closeModal(settingsModal);
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
                this.closeModal(settingsModal);
            }
        });
    }

    // Cargar configuración actual en el modal
    loadSettingsToModal() {
        const elements = {
            soundNotifications: document.getElementById('soundNotifications'),
            desktopNotifications: document.getElementById('desktopNotifications'),
            chatBackground: document.getElementById('chatBackground'),
            customBackgroundUrl: document.getElementById('customBackgroundUrl'),
            messageDensity: document.getElementById('messageDensity'),
            showTimestamps: document.getElementById('showTimestamps'),
            showAvatars: document.getElementById('showAvatars'),
            showMessageBorders: document.getElementById('showMessageBorders'),
            autoScroll: document.getElementById('autoScroll'),
            enterToSend: document.getElementById('enterToSend'),
            showTypingIndicator: document.getElementById('showTypingIndicator'),
            colorTheme: document.getElementById('colorTheme')
        };

        // Aplicar valores guardados
        Object.keys(this.settings).forEach(key => {
            if (elements[key]) {
                if (elements[key].type === 'checkbox') {
                    elements[key].checked = this.settings[key];
                } else {
                    elements[key].value = this.settings[key];
                }
            }
        });

        // Mostrar/ocultar campo de URL personalizada
        const customBackgroundContainer = document.getElementById('customBackgroundContainer');
        if (this.settings.chatBackground === 'custom') {
            customBackgroundContainer.style.display = 'block';
        }
    }

    // Guardar configuración desde el modal
    saveSettingsFromModal() {
        const elements = {
            soundNotifications: document.getElementById('soundNotifications'),
            desktopNotifications: document.getElementById('desktopNotifications'),
            chatBackground: document.getElementById('chatBackground'),
            customBackgroundUrl: document.getElementById('customBackgroundUrl'),
            messageDensity: document.getElementById('messageDensity'),
            showTimestamps: document.getElementById('showTimestamps'),
            showAvatars: document.getElementById('showAvatars'),
            showMessageBorders: document.getElementById('showMessageBorders'),
            autoScroll: document.getElementById('autoScroll'),
            enterToSend: document.getElementById('enterToSend'),
            showTypingIndicator: document.getElementById('showTypingIndicator'),
            colorTheme: document.getElementById('colorTheme')
        };

        // Recopilar valores del modal
        Object.keys(this.settings).forEach(key => {
            if (elements[key]) {
                if (elements[key].type === 'checkbox') {
                    this.settings[key] = elements[key].checked;
                } else {
                    this.settings[key] = elements[key].value;
                }
            }
        });

        // Guardar configuración
        this.saveSettings();
    }

    setupEventListeners() {
        // Header buttons
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = '../community/community.html';
        });

        document.getElementById('searchBtn').addEventListener('click', () => this.openSearchOverlay());
        document.getElementById('menuBtn').addEventListener('click', () => this.toggleHeaderMenu());

        // Header menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleMenuAction(action);
            });
        });

        // Sidebar buttons
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewChat());
        document.getElementById('sidebarMenuBtn').addEventListener('click', () => this.toggleSidebarMenu());

        // Conversation items
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const chatId = e.currentTarget.dataset.chatId;
                this.switchConversation(chatId);
            });
        });

        // Sidebar search
        const sidebarSearchInput = document.querySelector('.sidebar-search-input');
        if (sidebarSearchInput) {
            sidebarSearchInput.addEventListener('input', (e) => {
                this.filterConversations(e.target.value);
            });
        }

        // Message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', (e) => this.handleInputChange(e));
            messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }

        // Action button
        const actionButton = document.getElementById('actionButton');
        if (actionButton) {
            actionButton.addEventListener('click', () => this.handleActionButton());
        }

        // Plus button and quick actions
        const plusBtn = document.getElementById('plusBtn');
        const quickActionsDropdown = document.getElementById('quickActionsDropdown');
        
        if (plusBtn) {
            plusBtn.addEventListener('click', () => this.toggleQuickActions());
        }

        if (quickActionsDropdown) {
            quickActionsDropdown.addEventListener('click', (e) => {
                const actionItem = e.target.closest('.quick-action-item');
                if (actionItem) {
                    const action = actionItem.dataset.action;
                    this.handleQuickAction(action);
                }
            });
        }

        // Close quick actions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.input-container') && !e.target.closest('.quick-actions-dropdown')) {
                this.closeQuickActions();
            }
        });

        // Search overlay
        document.getElementById('closeSearch').addEventListener('click', () => this.closeSearchOverlay());
        document.getElementById('clearSearch').addEventListener('click', () => this.clearSearch());
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Search filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterSearchResults(e.target.dataset.filter);
            });
        });

        // Toolbar buttons
        document.getElementById('emojiBtn').addEventListener('click', () => this.showEmojiPicker());
        document.getElementById('formatBtn').addEventListener('click', () => this.toggleFormatToolbar());
        document.getElementById('codeBtn').addEventListener('click', () => this.openCodeModal());
        document.getElementById('linkBtn').addEventListener('click', () => this.insertLink());
        document.getElementById('imageBtn').addEventListener('click', () => this.uploadImage());
        document.getElementById('fileBtn').addEventListener('click', () => this.openFileModal());

        // Modals
        document.getElementById('closeCodeModal').addEventListener('click', () => this.closeModal('codeModal'));
        document.getElementById('cancelCode').addEventListener('click', () => this.closeModal('codeModal'));
        document.getElementById('insertCode').addEventListener('click', () => this.insertCode());

        document.getElementById('closePollModal').addEventListener('click', () => this.closeModal('pollModal'));
        document.getElementById('cancelPoll').addEventListener('click', () => this.closeModal('pollModal'));
        document.getElementById('createPoll').addEventListener('click', () => this.createPoll());
        document.getElementById('addPollOption').addEventListener('click', () => this.addPollOption());

        document.getElementById('closeFileModal').addEventListener('click', () => this.closeModal('fileModal'));
        document.getElementById('cancelFile').addEventListener('click', () => this.closeModal('fileModal'));
        document.getElementById('uploadFiles').addEventListener('click', () => this.uploadFiles());

        // File upload
        const fileInput = document.getElementById('fileInput');
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        if (fileInput) {
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

        if (fileUploadArea) {
            fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            fileUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
            fileUploadArea.addEventListener('click', () => fileInput.click());
        }

        // Close modals with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    loadMessages() {
        // Simular carga de mensajes
        this.messages = [
            {
                id: 1,
                author: 'Sistema',
                content: '¡Bienvenido al Chat General! Aquí puedes conversar con otros miembros de la comunidad.',
                timestamp: new Date(Date.now() - 3600000),
                type: 'system'
            },
            {
                id: 2,
                author: 'Ana García',
                content: '¡Hola a todos! ¿Cómo están?',
                timestamp: new Date(Date.now() - 1800000),
                type: 'text'
            },
            {
                id: 3,
                author: 'Carlos López',
                content: '¡Hola Ana! Todo bien, gracias. ¿Alguien está trabajando en algún proyecto interesante?',
                timestamp: new Date(Date.now() - 900000),
                type: 'text'
            }
        ];
        
        this.renderMessages();
        this.autoScrollToBottom();
    }

    renderMessages() {
        const messagesWrapper = document.getElementById('messagesWrapper');
        if (!messagesWrapper) return;

        messagesWrapper.innerHTML = this.messages.map(message => this.createMessageHTML(message)).join('');
    }

    createMessageHTML(message) {
        const isOwn = message.author === this.currentUser.name;
        const timeString = this.formatTime(message.timestamp);
        
        let messageClass = `message ${isOwn ? 'own' : ''}`;
        if (message.type === 'system') messageClass += ' system';
        
        return `
            <div class="${messageClass}" data-message-id="${message.id}">
                <div class="message-content">
                    ${message.type !== 'system' ? `
                        <div class="message-header">
            <span class="message-author">${message.author}</span>
                            ${this.settings.showTimestamps ? `<span class="message-time">${timeString}</span>` : ''}
                        </div>
                    ` : ''}
                    <div class="message-text">${message.content}</div>
                </div>
                </div>
            `;
    }

    formatTime(date) {
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();

        if (!content) return;

        const message = {
            id: Date.now(),
            author: this.currentUser.name,
            content: content,
            timestamp: new Date(),
            type: 'text'
        };

        this.messages.push(message);
        this.renderMessages();
        
        if (this.settings.autoScroll) {
            this.autoScrollToBottom();
        }

        messageInput.value = '';
        this.handleInputChange({ target: { value: '' } });

        // Simular respuesta del sistema
        setTimeout(() => {
            const response = {
                id: Date.now() + 1,
                author: 'Sistema',
                content: 'Mensaje recibido correctamente.',
                timestamp: new Date(),
                type: 'system'
            };
            this.messages.push(response);
            this.renderMessages();
            if (this.settings.autoScroll) {
                this.autoScrollToBottom();
            }
        }, 1000);
    }

    autoScrollToBottom() {
            const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    handleInputChange(event) {
        const inputContainer = document.getElementById('inputContainer');
        const actionButton = document.getElementById('actionButton');
        const hasText = event.target.value.trim().length > 0;
        
        if (hasText) {
            inputContainer.classList.add('input-has-text');
            actionButton.classList.add('has-text');
        } else {
            inputContainer.classList.remove('input-has-text');
            actionButton.classList.remove('has-text');
        }
    }

    handleActionButton() {
        const messageInput = document.getElementById('messageInput');
        const hasText = messageInput.value.trim().length > 0;
        
        if (hasText) {
            this.sendMessage();
        } else {
            // Activar micrófono
            this.startVoiceRecording();
        }
    }

    startVoiceRecording() {
        this.showToast('Grabación de voz iniciada...', 'info');
        // Aquí iría la lógica de grabación de voz
    }

    toggleQuickActions() {
        const dropdown = document.getElementById('quickActionsDropdown');
        dropdown.classList.toggle('active');
    }

    closeQuickActions() {
        const dropdown = document.getElementById('quickActionsDropdown');
        dropdown.classList.remove('active');
    }

    handleQuickAction(action) {
        this.closeQuickActions();
        
        switch (action) {
            case 'code':
                this.openCodeModal();
                break;
            case 'image':
                this.uploadImage();
                break;
            case 'file':
                this.openFileModal();
                break;
            case 'poll':
                this.openPollModal();
                break;
        }
    }

    toggleHeaderMenu() {
        const dropdown = document.getElementById('headerMenuDropdown');
        dropdown.classList.toggle('active');
    }

    handleMenuAction(action) {
        this.toggleHeaderMenu();
        
        switch (action) {
            case 'settings':
                this.openSettingsModal();
                break;
            case 'members':
                this.toggleSidebar();
                break;
            case 'info':
                this.showChatInfo();
                break;
            case 'export':
                this.exportChat();
                break;
            case 'clear':
                this.clearChat();
                break;
        }
    }

    openSettingsModal() {
        this.openModal('settingsModal');
        this.loadSettingsToModal();
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    updateStats() {
        const onlineCountElement = document.getElementById('onlineCount');
        const messageCountElement = document.getElementById('messageCount');
        
        if (onlineCountElement) {
            onlineCountElement.textContent = Math.floor(Math.random() * 10) + 1;
        }
        
        if (messageCountElement) {
            messageCountElement.textContent = this.messages.length;
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
        setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    // Funciones placeholder para funcionalidades futuras
    openSearchOverlay() { this.showToast('Búsqueda en desarrollo', 'info'); }
    closeSearchOverlay() { this.showToast('Cerrar búsqueda', 'info'); }
    clearSearch() { this.showToast('Limpiar búsqueda', 'info'); }
    handleSearch(query) { this.showToast(`Buscando: ${query}`, 'info'); }
    filterSearchResults(filter) { this.showToast(`Filtrando por: ${filter}`, 'info'); }
    showEmojiPicker() { this.showToast('Selector de emojis en desarrollo', 'info'); }
    toggleFormatToolbar() { this.showToast('Barra de formato en desarrollo', 'info'); }
    openCodeModal() { this.openModal('codeModal'); }
    closeCodeModal() { this.closeModal('codeModal'); }
    insertCode() { this.showToast('Código insertado', 'success'); this.closeModal('codeModal'); }
    insertLink() { this.showToast('Insertar enlace en desarrollo', 'info'); }
    uploadImage() { this.showToast('Subir imagen en desarrollo', 'info'); }
    openFileModal() { this.openModal('fileModal'); }
    closeFileModal() { this.closeModal('fileModal'); }
    uploadFiles() { this.showToast('Archivos subidos', 'success'); this.closeModal('fileModal'); }
    handleFileSelect(event) { this.showToast(`${event.target.files.length} archivo(s) seleccionado(s)`, 'info'); }
    handleDragOver(event) { event.preventDefault(); }
    handleFileDrop(event) { event.preventDefault(); this.showToast('Archivos soltados', 'info'); }
    openPollModal() { this.openModal('pollModal'); }
    closePollModal() { this.closeModal('pollModal'); }
    createPoll() { this.showToast('Encuesta creada', 'success'); this.closeModal('pollModal'); }
    addPollOption() { this.showToast('Opción agregada', 'info'); }
    createNewChat() { this.showToast('Nuevo chat en desarrollo', 'info'); }
    toggleSidebarMenu() { this.showToast('Menú del sidebar en desarrollo', 'info'); }
    switchConversation(chatId) { this.showToast(`Cambiando a chat: ${chatId}`, 'info'); }
    filterConversations(searchTerm) { this.showToast(`Filtrando conversaciones: ${searchTerm}`, 'info'); }
    toggleSidebar() { this.showToast('Mostrar miembros en desarrollo', 'info'); }
    showChatInfo() { this.showToast('Información del chat en desarrollo', 'info'); }
    exportChat() { this.showToast('Exportar chat en desarrollo', 'info'); }
    clearChat() { 
        if (confirm('¿Estás seguro de que quieres limpiar el chat? Esta acción no se puede deshacer.')) {
            this.messages = [];
            this.renderMessages();
            this.showToast('Chat limpiado', 'success');
        }
    }
}

// Inicializar el chat cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ChatGeneral();
});
