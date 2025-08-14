// ===== CHAT GENERAL JAVASCRIPT =====

class ChatGeneral {
    constructor() {
        this.currentUser = {
            id: 1,
            name: 'Usuario',
            avatar: 'U',
            role: 'Estudiante'
        };
        
        this.messages = [];
        this.members = [];
        this.topics = [];
        this.searchResults = [];
        this.isTyping = false;
        this.typingTimeout = null;
        this.settings = {
            soundNotifications: true,
            desktopNotifications: true,
            messageDensity: 'normal',
            showTimestamps: true,
            autoScroll: true
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.loadMockData();
        this.renderMessages();
        this.renderMembers();
        this.renderTopics();
        this.updateStats();
        this.autoScrollToBottom();
        
        // Initialize action button state
        this.handleInputChange({ target: { value: '' } });
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = '../Community/community.html';
        });

        // Header buttons
        document.getElementById('searchBtn').addEventListener('click', () => this.toggleSearch());
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettingsModal());
        document.getElementById('membersBtn').addEventListener('click', () => this.toggleSidebar());

        // Search functionality
        document.getElementById('closeSearch').addEventListener('click', () => this.toggleSearch());
        document.getElementById('clearSearch').addEventListener('click', () => this.clearSearch());
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Search filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSearchFilter(e.target.dataset.filter));
        });

        // Message input
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('input', (e) => this.handleInputChange(e));
        messageInput.addEventListener('keyup', (e) => this.handleInputChange(e));
        messageInput.addEventListener('change', (e) => this.handleInputChange(e));
        messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Action button (dual functionality: send when text, voice when empty)
        document.getElementById('actionButton').addEventListener('click', () => this.handleActionButton());

        // Toolbar buttons
        document.getElementById('emojiBtn').addEventListener('click', () => this.showEmojiPicker());
        document.getElementById('formatBtn').addEventListener('click', () => this.showFormatOptions());
        document.getElementById('codeBtn').addEventListener('click', () => this.openCodeModal());
        document.getElementById('linkBtn').addEventListener('click', () => this.insertLink());
        document.getElementById('imageBtn').addEventListener('click', () => this.uploadImage());
        document.getElementById('fileBtn').addEventListener('click', () => this.openFileModal());

        // Plus button and quick actions dropdown
        document.getElementById('plusBtn').addEventListener('click', () => this.toggleQuickActions());
        
        // Quick actions dropdown items
        document.querySelectorAll('.quick-action-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleQuickAction(e.currentTarget.dataset.action));
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('quickActionsDropdown');
            const plusBtn = document.getElementById('plusBtn');
            
            if (!dropdown.contains(e.target) && !plusBtn.contains(e.target)) {
                this.closeQuickActions();
            }
        });

        // Modal events
        this.setupModalEvents();

        // Auto-resize textarea
        messageInput.addEventListener('input', () => this.autoResizeTextarea());
    }

    setupModalEvents() {
        // Code modal
        document.getElementById('closeCodeModal').addEventListener('click', () => this.closeModal('codeModal'));
        document.getElementById('cancelCode').addEventListener('click', () => this.closeModal('codeModal'));
        document.getElementById('insertCode').addEventListener('click', () => this.insertCode());

        // Poll modal
        document.getElementById('closePollModal').addEventListener('click', () => this.closeModal('pollModal'));
        document.getElementById('cancelPoll').addEventListener('click', () => this.closeModal('pollModal'));
        document.getElementById('createPoll').addEventListener('click', () => this.createPoll());
        document.getElementById('addPollOption').addEventListener('click', () => this.addPollOption());

        // Settings modal
        document.getElementById('closeSettingsModal').addEventListener('click', () => this.closeModal('settingsModal'));
        document.getElementById('cancelSettings').addEventListener('click', () => this.closeModal('settingsModal'));
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());

        // File modal
        document.getElementById('closeFileModal').addEventListener('click', () => this.closeModal('fileModal'));
        document.getElementById('cancelFile').addEventListener('click', () => this.closeModal('fileModal'));
        document.getElementById('uploadFiles').addEventListener('click', () => this.uploadFiles());

        // File upload area
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('fileInput');
        
        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        fileUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    loadMockData() {
        // Mock members
        this.members = [
            { id: 1, name: 'Ana García', avatar: 'A', status: 'online', role: 'Estudiante' },
            { id: 2, name: 'Carlos López', avatar: 'C', status: 'online', role: 'Instructor' },
            { id: 3, name: 'María Rodríguez', avatar: 'M', status: 'away', role: 'Estudiante' },
            { id: 4, name: 'Juan Pérez', avatar: 'J', status: 'online', role: 'Estudiante' },
            { id: 5, name: 'Laura Silva', avatar: 'L', status: 'offline', role: 'Estudiante' }
        ];

        // Mock topics
        this.topics = [
            { name: 'Machine Learning', count: 45 },
            { name: 'JavaScript Avanzado', count: 32 },
            { name: 'React y Redux', count: 28 },
            { name: 'Python para IA', count: 23 },
            { name: 'Bases de Datos', count: 19 }
        ];

        // Mock messages
        this.messages = [
            {
                id: 1,
                author: 'Ana García',
                avatar: 'A',
                content: '¡Hola a todos! ¿Alguien está tomando el curso de Machine Learning?',
                timestamp: '10:30',
                type: 'text'
            },
            {
                id: 2,
                author: 'Carlos López',
                avatar: 'C',
                content: '¡Hola Ana! Sí, yo lo estoy tomando. Es muy interesante.',
                timestamp: '10:32',
                type: 'text'
            },
            {
                id: 3,
                author: this.currentUser.name,
                avatar: this.currentUser.avatar,
                content: '¡Hola! Yo también estoy interesado en ese curso.',
                timestamp: '10:35',
                type: 'text',
                isOwn: true
            },
            {
                id: 4,
                author: 'María Rodríguez',
                avatar: 'M',
                content: 'Aquí tienes un ejemplo de código que me ayudó mucho:',
                timestamp: '10:40',
                type: 'text'
            },
            {
                id: 5,
                author: 'María Rodríguez',
                avatar: 'M',
                content: {
                    language: 'python',
                    code: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

# Cargar datos
data = pd.read_csv('dataset.csv')
X = data.drop('target', axis=1)
y = data['target']

# Dividir datos
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

print("Datos cargados exitosamente!")`,
                    description: 'Ejemplo de carga de datos para ML'
                },
                timestamp: '10:41',
                type: 'code'
            },
            {
                id: 6,
                author: 'Juan Pérez',
                avatar: 'J',
                content: '¡Excelente ejemplo! ¿Podrías explicar más sobre el preprocesamiento?',
                timestamp: '10:45',
                type: 'text'
            },
            {
                id: 7,
                author: this.currentUser.name,
                avatar: this.currentUser.avatar,
                content: 'hola',
                timestamp: '23:41',
                type: 'text',
                isOwn: true
            },
            {
                id: 8,
                author: 'Ana García',
                avatar: 'A',
                content: '¡Excelente punto!',
                timestamp: '23:41',
                type: 'text'
            }
        ];
    }

    renderMessages() {
        const messagesWrapper = document.getElementById('messagesWrapper');
        messagesWrapper.innerHTML = '';

        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesWrapper.appendChild(messageElement);
        });

        this.autoScrollToBottom();
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isOwn ? 'own' : ''}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = message.avatar;

        const content = document.createElement('div');
        content.className = 'message-content';

        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = `
            <span class="message-author">${message.author}</span>
            <span class="message-time">${message.timestamp}</span>
        `;

        content.appendChild(header);

        if (message.type === 'text') {
            const text = document.createElement('div');
            text.className = 'message-text';
            text.textContent = message.content;
            content.appendChild(text);
        } else if (message.type === 'code') {
            const codeBlock = this.createCodeBlock(message.content);
            content.appendChild(codeBlock);
        } else if (message.type === 'poll') {
            const pollBlock = this.createPollBlock(message.content);
            content.appendChild(pollBlock);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        return messageDiv;
    }

    createCodeBlock(codeData) {
        const codeDiv = document.createElement('div');
        codeDiv.className = 'message-code';

        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `
            <span class="code-language">${codeData.language}</span>
            <button class="copy-code-btn" title="Copiar código">
                <i class="fas fa-copy"></i>
            </button>
        `;

        const code = document.createElement('pre');
        code.textContent = codeData.code;

        const description = document.createElement('div');
        description.className = 'code-description';
        description.textContent = codeData.description;

        codeDiv.appendChild(header);
        codeDiv.appendChild(code);
        codeDiv.appendChild(description);

        // Add copy functionality
        header.querySelector('.copy-code-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(codeData.code);
            this.showToast('Código copiado al portapapeles', 'success');
        });

        return codeDiv;
    }

    createPollBlock(pollData) {
        const pollDiv = document.createElement('div');
        pollDiv.className = 'message-poll';

        const question = document.createElement('div');
        question.className = 'poll-question';
        question.textContent = pollData.question;

        const options = document.createElement('div');
        options.className = 'poll-options';

        pollData.options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'poll-option';
            optionDiv.innerHTML = `
                <span class="poll-option-text">${option.text}</span>
                <span class="poll-option-votes">${option.votes} votos</span>
            `;
            optionDiv.addEventListener('click', () => this.votePoll(pollData.id, option.id));
            options.appendChild(optionDiv);
        });

        pollDiv.appendChild(question);
        pollDiv.appendChild(options);

        return pollDiv;
    }

    renderMembers() {
        const membersList = document.getElementById('membersList');
        membersList.innerHTML = '';

        this.members.forEach(member => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'member-item';
            memberDiv.innerHTML = `
                <div class="member-avatar">${member.avatar}</div>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-status ${member.status}">${member.status}</div>
                </div>
            `;
            membersList.appendChild(memberDiv);
        });
    }

    renderTopics() {
        const topicsList = document.getElementById('topicsList');
        topicsList.innerHTML = '';

        this.topics.forEach(topic => {
            const topicDiv = document.createElement('div');
            topicDiv.className = 'topic-item';
            topicDiv.innerHTML = `
                <div class="topic-name">${topic.name}</div>
                <div class="topic-count">${topic.count} mensajes</div>
            `;
            topicDiv.addEventListener('click', () => this.searchTopic(topic.name));
            topicsList.appendChild(topicDiv);
        });
    }

    updateStats() {
        const onlineCount = this.members.filter(m => m.status === 'online').length;
        const messageCount = this.messages.length;

        document.getElementById('onlineCount').textContent = onlineCount;
        document.getElementById('messageCount').textContent = messageCount;
    }

    handleInputChange(event) {
        const message = event.target.value.trim();
        const inputContainer = document.getElementById('inputContainer');
        
        // Update action button state based on text presence
        if (message) {
            inputContainer.classList.add('input-has-text');
        } else {
            inputContainer.classList.remove('input-has-text');
        }
    }

    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    handleActionButton() {
        const message = document.getElementById('messageInput').value.trim();
        
        if (message) {
            // If there's text, send the message
            this.sendMessage();
        } else {
            // If no text, toggle voice recording
            this.toggleVoiceRecording();
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message) return;

        const newMessage = {
            id: this.messages.length + 1,
            author: this.currentUser.name,
            avatar: this.currentUser.avatar,
            content: message,
            timestamp: this.getCurrentTime(),
            type: 'text',
            isOwn: true
        };

        this.messages.push(newMessage);
        this.renderMessages();
        messageInput.value = '';
        this.autoResizeTextarea();

        // Reset action button state after sending
        const inputContainer = document.getElementById('inputContainer');
        inputContainer.classList.remove('input-has-text');

        // Simulate response after a delay
        setTimeout(() => this.simulateResponse(), 2000);
    }

    simulateResponse() {
        const responses = [
            '¡Interesante punto!',
            'Gracias por compartir eso.',
            '¿Podrías explicar más sobre eso?',
            '¡Excelente contribución!',
            'Estoy de acuerdo contigo.',
            '¿Alguien más tiene experiencia con esto?'
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const randomMember = this.members[Math.floor(Math.random() * this.members.length)];

        const responseMessage = {
            id: this.messages.length + 1,
            author: randomMember.name,
            avatar: randomMember.avatar,
            content: randomResponse,
            timestamp: this.getCurrentTime(),
            type: 'text'
        };

        this.messages.push(responseMessage);
        this.renderMessages();
        this.updateStats();
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }

    autoResizeTextarea() {
        const textarea = document.getElementById('messageInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }



    autoScrollToBottom() {
        if (this.settings.autoScroll) {
            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    toggleSearch() {
        const searchOverlay = document.getElementById('searchOverlay');
        searchOverlay.classList.toggle('active');
        
        if (searchOverlay.classList.contains('active')) {
            document.getElementById('searchInput').focus();
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.searchResults = [];
            this.renderSearchResults();
            return;
        }

        this.searchResults = this.messages.filter(message => 
            message.content.toLowerCase().includes(query.toLowerCase()) ||
            message.author.toLowerCase().includes(query.toLowerCase())
        );

        this.renderSearchResults();
    }

    handleSearchFilter(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Filter search results based on type
        if (filter === 'all') {
            this.renderSearchResults();
        } else {
            const filtered = this.searchResults.filter(message => message.type === filter);
            this.renderSearchResults(filtered);
        }
    }

    renderSearchResults(results = this.searchResults) {
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No se encontraron resultados</p>';
            return;
        }

        results.forEach(message => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'search-result-item';
            resultDiv.innerHTML = `
                <div class="result-author">${message.author}</div>
                <div class="result-content">${message.content}</div>
                <div class="result-time">${message.timestamp}</div>
            `;
            resultDiv.addEventListener('click', () => this.scrollToMessage(message.id));
            searchResults.appendChild(resultDiv);
        });
    }

    scrollToMessage(messageId) {
        // Implementation for scrolling to specific message
        this.toggleSearch();
        this.showToast('Navegando al mensaje...', 'info');
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.searchResults = [];
        this.renderSearchResults();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('chatSidebar');
        sidebar.classList.toggle('active');
    }

    // Modal functions
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    openCodeModal() {
        this.openModal('codeModal');
    }

    insertCode() {
        const language = document.getElementById('codeLanguage').value;
        const code = document.getElementById('codeContent').value;
        const description = document.getElementById('codeDescription').value;

        if (!code.trim()) {
            this.showToast('Por favor ingresa el código', 'warning');
            return;
        }

        const codeMessage = {
            id: this.messages.length + 1,
            author: this.currentUser.name,
            avatar: this.currentUser.avatar,
            content: {
                language: language,
                code: code,
                description: description
            },
            timestamp: this.getCurrentTime(),
            type: 'code',
            isOwn: true
        };

        this.messages.push(codeMessage);
        this.renderMessages();
        this.closeModal('codeModal');
        this.showToast('Código insertado exitosamente', 'success');

        // Clear form
        document.getElementById('codeContent').value = '';
        document.getElementById('codeDescription').value = '';
    }

    openFileModal() {
        this.openModal('fileModal');
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.addFilesToList(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.style.borderColor = 'var(--primary-color)';
        event.currentTarget.style.background = 'rgba(68, 229, 255, 0.05)';
    }

    handleFileDrop(event) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        this.addFilesToList(files);
        
        // Reset styling
        event.currentTarget.style.borderColor = '';
        event.currentTarget.style.background = '';
    }

    addFilesToList(files) {
        const fileList = document.getElementById('fileList');
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-file"></i>
                <span class="file-item-name">${file.name}</span>
                <button class="remove-file" type="button">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            fileItem.querySelector('.remove-file').addEventListener('click', () => {
                fileItem.remove();
            });
            
            fileList.appendChild(fileItem);
        });
    }

    uploadFiles() {
        const fileItems = document.querySelectorAll('.file-item');
        if (fileItems.length === 0) {
            this.showToast('Por favor selecciona archivos', 'warning');
            return;
        }

        this.showToast('Archivos subidos exitosamente', 'success');
        this.closeModal('fileModal');
        
        // Clear file list
        document.getElementById('fileList').innerHTML = '';
    }

    openSettingsModal() {
        this.openModal('settingsModal');
        this.loadSettingsToForm();
    }

    loadSettingsToForm() {
        document.getElementById('soundNotifications').checked = this.settings.soundNotifications;
        document.getElementById('desktopNotifications').checked = this.settings.desktopNotifications;
        document.getElementById('messageDensity').value = this.settings.messageDensity;
        document.getElementById('showTimestamps').checked = this.settings.showTimestamps;
        document.getElementById('autoScroll').checked = this.settings.autoScroll;
        document.getElementById('showTypingIndicator').checked = this.settings.showTypingIndicator;
    }

    saveSettings() {
        this.settings = {
            soundNotifications: document.getElementById('soundNotifications').checked,
            desktopNotifications: document.getElementById('desktopNotifications').checked,
            messageDensity: document.getElementById('messageDensity').value,
            showTimestamps: document.getElementById('showTimestamps').checked,
            autoScroll: document.getElementById('autoScroll').checked,
            showTypingIndicator: document.getElementById('showTypingIndicator').checked
        };

        localStorage.setItem('chatSettings', JSON.stringify(this.settings));
        this.closeModal('settingsModal');
        this.showToast('Configuración guardada', 'success');
    }

    loadSettings() {
        const saved = localStorage.getItem('chatSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    toggleQuickActions() {
        const dropdown = document.getElementById('quickActionsDropdown');
        const plusBtn = document.getElementById('plusBtn');
        
        if (dropdown.classList.contains('active')) {
            this.closeQuickActions();
        } else {
            this.openQuickActions();
        }
    }

    openQuickActions() {
        const dropdown = document.getElementById('quickActionsDropdown');
        const plusBtn = document.getElementById('plusBtn');
        
        dropdown.classList.add('active');
        plusBtn.classList.add('active');
    }

    closeQuickActions() {
        const dropdown = document.getElementById('quickActionsDropdown');
        const plusBtn = document.getElementById('plusBtn');
        
        dropdown.classList.remove('active');
        plusBtn.classList.remove('active');
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

    openPollModal() {
        this.openModal('pollModal');
    }

    addPollOption() {
        const pollOptions = document.getElementById('pollOptions');
        const optionDiv = document.createElement('div');
        optionDiv.className = 'poll-option';
        optionDiv.innerHTML = `
            <input type="text" placeholder="Nueva opción" class="poll-option-input">
            <button class="remove-option" type="button">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        optionDiv.querySelector('.remove-option').addEventListener('click', () => {
            optionDiv.remove();
        });
        
        pollOptions.appendChild(optionDiv);
    }

    createPoll() {
        const question = document.getElementById('pollQuestion').value;
        const options = Array.from(document.querySelectorAll('.poll-option-input'))
            .map(input => input.value)
            .filter(value => value.trim());

        if (!question.trim() || options.length < 2) {
            this.showToast('Por favor completa la pregunta y al menos 2 opciones', 'warning');
            return;
        }

        const pollMessage = {
            id: this.messages.length + 1,
            author: this.currentUser.name,
            avatar: this.currentUser.avatar,
            content: {
                id: Date.now(),
                question: question,
                options: options.map((option, index) => ({
                    id: index,
                    text: option,
                    votes: 0
                })),
                multiple: document.getElementById('pollMultiple').checked
            },
            timestamp: this.getCurrentTime(),
            type: 'poll',
            isOwn: true
        };

        this.messages.push(pollMessage);
        this.renderMessages();
        this.closeModal('pollModal');
        this.showToast('Encuesta creada exitosamente', 'success');

        // Clear form
        document.getElementById('pollQuestion').value = '';
        document.getElementById('pollOptions').innerHTML = `
            <div class="poll-option">
                <input type="text" placeholder="Opción 1" class="poll-option-input">
                <button class="remove-option" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="poll-option">
                <input type="text" placeholder="Opción 2" class="poll-option-input">
                <button class="remove-option" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    votePoll(pollId, optionId) {
        // Implementation for voting in polls
        this.showToast('Voto registrado', 'success');
    }

    searchTopic(topicName) {
        document.getElementById('searchInput').value = topicName;
        this.handleSearch(topicName);
        this.toggleSearch();
    }

    toggleVoiceRecording() {
        this.showToast('Función de grabación de voz próximamente', 'info');
    }

    showEmojiPicker() {
        this.showToast('Selector de emojis próximamente', 'info');
    }

    showFormatOptions() {
        this.showToast('Opciones de formato próximamente', 'info');
    }

    insertLink() {
        const url = prompt('Ingresa la URL:');
        if (url) {
            const messageInput = document.getElementById('messageInput');
            messageInput.value += ` ${url}`;
            messageInput.focus();
        }
    }

    uploadImage() {
        this.showToast('Función de subida de imágenes próximamente', 'info');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        const container = document.getElementById('toastContainer');
        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);

        // Close button functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatGeneral();
});
