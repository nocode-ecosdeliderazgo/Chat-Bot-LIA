// ===== COMMUNITY PAGE JAVASCRIPT =====

class CommunityPage {
    constructor() {
        this.currentChat = null;
        this.currentUser = {
            id: 1,
            name: 'Usuario',
            role: 'Estudiante',
            avatar: 'fas fa-user'
        };
        this.chatData = {
            general: {
                title: 'Chat General',
                subtitle: 'Discusiones generales sobre IA y tecnología',
                messages: [],
                onlineUsers: 0
            },
            role: {
                title: 'Chat por Rol',
                subtitle: 'Conversaciones específicas por rol',
                messages: [],
                onlineUsers: 0
            },
            courses: {
                title: 'Chat de Cursos',
                subtitle: 'Discusiones sobre cursos específicos',
                messages: [],
                onlineUsers: 0
            }
        };
        this.activityData = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCommunityData();
        this.updateStats();
        this.setupAnimations();
        this.fillUserHeader();
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Navigation bar functionality
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleTabClick(btn);
            });
        });

        // Chat room buttons
        const joinChatBtns = document.querySelectorAll('.join-chat-btn');
        joinChatBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chatType = btn.dataset.chat;
                if (chatType === 'general') {
                    window.location.href = '../ChatGeneral/chat-general.html';
                } else {
                    this.openChat(chatType);
                }
            });
        });

        // Chat modal functionality
        const closeChatBtn = document.getElementById('closeChatBtn');
        const chatModal = document.getElementById('chatModal');
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        const chatInput = document.getElementById('chatInput');

        if (closeChatBtn) {
            closeChatBtn.addEventListener('click', () => {
                this.closeChat();
            });
        }

        if (chatModal) {
            chatModal.addEventListener('click', (e) => {
                if (e.target === chatModal) {
                    this.closeChat();
                }
            });
        }

        if (sendMessageBtn && chatInput) {
            sendMessageBtn.addEventListener('click', () => {
                this.sendMessage();
            });

            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Load more activity button
        const loadMoreActivityBtn = document.getElementById('loadMoreActivity');
        if (loadMoreActivityBtn) {
            loadMoreActivityBtn.addEventListener('click', () => {
                this.loadMoreActivity();
            });
        }

        // Chat room card clicks
        const chatRoomCards = document.querySelectorAll('.chat-room-card');
        chatRoomCards.forEach(card => {
            card.addEventListener('click', () => {
                const chatType = card.dataset.chat;
                if (chatType === 'general') {
                    window.location.href = '../ChatGeneral/chat-general.html';
                } else {
                    this.openChat(chatType);
                }
            });
        });
    }

    fillUserHeader(){
        try{
            const raw = localStorage.getItem('currentUser');
            if(raw) {
                const user = JSON.parse(raw);
                const nameEl = document.getElementById('pmName');
                const emailEl = document.getElementById('pmEmail');
                if(nameEl && user.display_name) nameEl.textContent = user.display_name;
                if(emailEl && user.email) emailEl.textContent = user.email;
                if(user.avatar_url){
                    document.querySelectorAll('.header-profile img, #profileMenu .pm-avatar img').forEach(img=>{img.src=user.avatar_url;});
                }
            }
        }catch(e){
            console.log('Error loading user data:', e);
        }
        
        // Setup profile menu functionality
        this.setupProfileMenu();
    }

    setupProfileMenu() {
        // Intentar varias veces para asegurar que los elementos existan
        let attempts = 0;
        const maxAttempts = 10;
        
        const trySetup = () => {
            const avatarBtn = document.querySelector('.header-profile');
            const menu = document.getElementById('profileMenu');
            
            if(avatarBtn && menu) {
                console.log('Setting up profile menu');
                
                // Remover listeners previos para evitar duplicados
                avatarBtn.removeEventListener('click', this.handleProfileClick);
                
                // Crear función bound para poder removerla después
                this.handleProfileClick = (e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    console.log('Profile button clicked');
                    menu.classList.toggle('show');
                };
                
                avatarBtn.addEventListener('click', this.handleProfileClick);
                
                // Click fuera para cerrar
                document.addEventListener('click', (e) => { 
                    if(!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
                        menu.classList.remove('show');
                    }
                });
                
                return true;
            } else {
                attempts++;
                console.log(`Profile elements not found, attempt ${attempts}/${maxAttempts}`);
                if(attempts < maxAttempts) {
                    setTimeout(trySetup, 100);
                }
                return false;
            }
        };
        
        trySetup();
    }

    // ===== NAVIGATION HANDLING =====
    handleTabClick(clickedBtn) {
        // Get the tab from data attribute
        const tab = clickedBtn.dataset.tab;
        
        // Handle different tabs
        switch(tab) {
            case 'mis-cursos':
                // Navegar a la versión ES de cursos
                window.location.href = '../cursos.html';
                break;
            case 'noticias':
                // Navigate directly to news page without showing toast
                window.location.href = '../Notices/notices.html';
                break;
            case 'comunidad':
                // Already on community page, just update active state
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                clickedBtn.classList.add('active');
                break;
            default:
                this.showToast('Sección no disponible', 'warning');
        }
    }

    // ===== DATA LOADING =====
    loadCommunityData() {
        this.showLoading();
        
        // Simulate API call delay
        setTimeout(() => {
            this.loadMockData();
            this.renderActivityFeed();
            this.hideLoading();
        }, 1000);
    }

    loadMockData() {
        // Mock community statistics
        this.communityStats = {
            totalMembers: 1247,
            activeChats: 3,
            totalMessages: 8923
        };

        // Mock chat data
        this.chatData.general.messages = [
            {
                id: 1,
                user: 'Ana Martínez',
                avatar: 'fas fa-user',
                message: '¡Hola a todos! ¿Alguien está tomando el curso de Machine Learning?',
                time: '10:30',
                isOwn: false
            },
            {
                id: 2,
                user: 'Carlos López',
                avatar: 'fas fa-user',
                message: '¡Hola Ana! Sí, yo lo estoy tomando. Es muy interesante.',
                time: '10:32',
                isOwn: false
            },
            {
                id: 3,
                user: this.currentUser.name,
                avatar: this.currentUser.avatar,
                message: '¡Hola! Yo también estoy interesado en ese curso.',
                time: '10:35',
                isOwn: true
            }
        ];

        this.chatData.role.messages = [
            {
                id: 1,
                user: 'María González',
                avatar: 'fas fa-user',
                message: '¿Alguien más es estudiante de ingeniería?',
                time: '09:15',
                isOwn: false
            }
        ];

        this.chatData.courses.messages = [
            {
                id: 1,
                user: 'Roberto Silva',
                avatar: 'fas fa-user',
                message: '¿Cómo va el progreso del curso de ChatGPT?',
                time: '11:20',
                isOwn: false
            }
        ];

        // Mock activity data
        this.activityData = [
            {
                id: 1,
                user: 'Ana Martínez',
                avatar: 'fas fa-user',
                action: 'se unió al chat general',
                time: 'Hace 5 minutos'
            },
            {
                id: 2,
                user: 'Carlos López',
                avatar: 'fas fa-user',
                action: 'completó el módulo 3 del curso de IA',
                time: 'Hace 15 minutos'
            },
            {
                id: 3,
                user: 'María González',
                avatar: 'fas fa-user',
                action: 'inició una nueva discusión sobre Machine Learning',
                time: 'Hace 1 hora'
            },
            {
                id: 4,
                user: 'Roberto Silva',
                avatar: 'fas fa-user',
                action: 'compartió un recurso útil en el chat de cursos',
                time: 'Hace 2 horas'
            }
        ];

        // Update online users
        this.chatData.general.onlineUsers = 15;
        this.chatData.role.onlineUsers = 8;
        this.chatData.courses.onlineUsers = 12;
    }

    // ===== CHAT FUNCTIONALITY =====
    openChat(chatType) {
        this.currentChat = chatType;
        const chatData = this.chatData[chatType];
        
        if (!chatData) return;

        // Update modal content
        document.getElementById('modalChatTitle').textContent = chatData.title;
        document.getElementById('modalChatSubtitle').textContent = `${chatData.onlineUsers} miembros en línea`;
        
        // Render messages
        this.renderChatMessages(chatType);
        
        // Show modal
        document.getElementById('chatModal').classList.add('active');
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 100);

        this.showToast(`Te has unido al ${chatData.title}`, 'success');
    }

    closeChat() {
        document.getElementById('chatModal').classList.remove('active');
        this.currentChat = null;
        
        // Clear input
        document.getElementById('chatInput').value = '';
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message || !this.currentChat) return;

        // Create new message
        const newMessage = {
            id: Date.now(),
            user: this.currentUser.name,
            avatar: this.currentUser.avatar,
            message: message,
            time: new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            isOwn: true
        };

        // Add to chat data
        this.chatData[this.currentChat].messages.push(newMessage);
        
        // Render new message
        this.renderChatMessages(this.currentChat);
        
        // Clear input
        chatInput.value = '';
        
        // Simulate response after 2 seconds
        setTimeout(() => {
            this.simulateResponse();
        }, 2000);
    }

    simulateResponse() {
        if (!this.currentChat) return;

        const responses = [
            '¡Excelente punto!',
            'Gracias por compartir eso.',
            'Estoy de acuerdo contigo.',
            '¿Podrías explicar más sobre eso?',
            '¡Muy interesante!'
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const randomUsers = ['Ana Martínez', 'Carlos López', 'María González', 'Roberto Silva'];
        const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];

        const responseMessage = {
            id: Date.now(),
            user: randomUser,
            avatar: 'fas fa-user',
            message: randomResponse,
            time: new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            isOwn: false
        };

        this.chatData[this.currentChat].messages.push(responseMessage);
        this.renderChatMessages(this.currentChat);
    }

    renderChatMessages(chatType) {
        const chatMessages = document.getElementById('chatMessages');
        const messages = this.chatData[chatType].messages;
        
        chatMessages.innerHTML = messages.map(msg => `
            <div class="message ${msg.isOwn ? 'own' : ''}">
                <div class="message-avatar">
                    <i class="${msg.avatar}"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${msg.message}</div>
                    <div class="message-time">${msg.time}</div>
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ===== ACTIVITY FEED =====
    renderActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        
        activityFeed.innerHTML = this.activityData.map(activity => `
            <div class="activity-item">
                <div class="activity-avatar">
                    <i class="${activity.avatar}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${activity.user}</strong> ${activity.action}
                    </div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    loadMoreActivity() {
        // Simulate loading more activity
        this.showToast('Cargando más actividad...', 'info');
        
        setTimeout(() => {
            // Add more mock activity
            const newActivity = [
                {
                    id: this.activityData.length + 1,
                    user: 'Laura Fernández',
                    avatar: 'fas fa-user',
                    action: 'completó el curso de ChatGPT',
                    time: 'Hace 3 horas'
                },
                {
                    id: this.activityData.length + 2,
                    user: 'Diego Ramírez',
                    avatar: 'fas fa-user',
                    action: 'se unió a la comunidad',
                    time: 'Hace 4 horas'
                }
            ];

            this.activityData.push(...newActivity);
            this.renderActivityFeed();
            this.showToast('Actividad actualizada', 'success');
        }, 1000);
    }

    // ===== STATISTICS =====
    updateStats() {
        // Update hero statistics
        const totalMembersElement = document.getElementById('totalMembers');
        const totalMessagesElement = document.getElementById('totalMessages');
        
        if (totalMembersElement) {
            this.animateNumber(totalMembersElement, 0, this.communityStats.totalMembers, 2000);
        }
        
        if (totalMessagesElement) {
            this.animateNumber(totalMessagesElement, 0, this.communityStats.totalMessages, 2000);
        }

        // Update chat room statistics
        this.updateChatStats();
    }

    updateChatStats() {
        // Update online users and message counts for each chat
        Object.keys(this.chatData).forEach(chatType => {
            const chatData = this.chatData[chatType];
            const onlineElement = document.getElementById(`${chatType}Online`);
            const messagesElement = document.getElementById(`${chatType}Messages`);
            
            if (onlineElement) {
                onlineElement.textContent = chatData.onlineUsers;
            }
            
            if (messagesElement) {
                messagesElement.textContent = chatData.messages.length;
            }
        });
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easeOutCubic);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        requestAnimationFrame(updateNumber);
    }

    // ===== ANIMATIONS =====
    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.chat-room-card, .guideline-card, .activity-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ===== UTILITIES =====
    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// ===== INITIALIZATION =====
let communityPage;

document.addEventListener('DOMContentLoaded', () => {
    communityPage = new CommunityPage();
    
    // Configuración adicional del perfil como backup
    setTimeout(() => {
        setupProfileMenuDirect();
    }, 500);
});

// Función directa para configurar el menú de perfil
function setupProfileMenuDirect() {
    const avatarBtn = document.querySelector('.header-profile');
    const menu = document.getElementById('profileMenu');
    
    if(avatarBtn && menu) {
        console.log('Direct profile menu setup');
        
        avatarBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Direct profile click handler');
            menu.classList.toggle('show');
        };
        
        document.onclick = function(e) {
            if(!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
                menu.classList.remove('show');
            }
        };
    } else {
        console.log('Profile elements still not found in direct setup');
    }
}

// Función global para toggle del menú (inline handler)
function toggleProfileMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Inline toggle profile menu');
    const menu = document.getElementById('profileMenu');
    if(menu) {
        menu.classList.toggle('show');
    }
}

// Click fuera para cerrar (configurar una sola vez)
document.addEventListener('click', function(e) {
    const menu = document.getElementById('profileMenu');
    const avatarBtn = document.querySelector('.header-profile');
    if(menu && avatarBtn && !menu.contains(e.target) && !avatarBtn.contains(e.target)) {
        menu.classList.remove('show');
    }
});

// ===== GLOBAL FUNCTIONS =====
window.communityPage = communityPage;
window.setupProfileMenuDirect = setupProfileMenuDirect;
window.toggleProfileMenu = toggleProfileMenu;
