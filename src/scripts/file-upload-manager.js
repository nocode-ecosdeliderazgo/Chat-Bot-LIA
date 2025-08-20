/* ===== GESTOR DE SUBIDA DE ARCHIVOS CON SUPABASE STORAGE ===== */

class FileUploadManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            await this.initializeSupabase();
            await this.loadCurrentUser();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error inicializando FileUploadManager:', error);
            this.showError('Error al inicializar el gestor de archivos');
        }
    }

    async initializeSupabase() {
        try {
            // Obtener credenciales de Supabase desde meta tags o localStorage
            const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content || 
                               localStorage.getItem('supabaseUrl');
            const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.content || 
                               localStorage.getItem('supabaseAnonKey');

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Credenciales de Supabase no encontradas');
            }

            // Importar Supabase dinámicamente
            if (typeof window.supabase === 'undefined') {
                const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                this.supabase = createClient(supabaseUrl, supabaseKey);
            } else {
                this.supabase = window.supabase;
            }

            console.log('Supabase inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando Supabase:', error);
            throw error;
        }
    }

    async loadCurrentUser() {
        try {
            const raw = localStorage.getItem('currentUser');
            if (!raw) {
                throw new Error('Usuario no autenticado');
            }
            this.currentUser = JSON.parse(raw);
            console.log('Usuario cargado:', this.currentUser);
        } catch (error) {
            console.error('Error cargando usuario:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Event listener para cambio de foto de perfil
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        const profilePictureInput = document.getElementById('profilePicture');
        
        if (changeAvatarBtn && profilePictureInput) {
            changeAvatarBtn.addEventListener('click', () => {
                profilePictureInput.click();
            });

            profilePictureInput.addEventListener('change', (e) => {
                this.handleProfilePictureUpload(e.target.files[0]);
            });
        }

        // Event listener para subida de curriculum
        const curriculumBtn = document.getElementById('curriculumBtn');
        const curriculumInput = document.getElementById('curriculum');
        
        if (curriculumBtn && curriculumInput) {
            curriculumBtn.addEventListener('click', () => {
                curriculumInput.click();
            });

            curriculumInput.addEventListener('change', (e) => {
                this.handleCurriculumUpload(e.target.files[0]);
            });
        }
    }

    async handleProfilePictureUpload(file) {
        if (!file) return;

        try {
            this.showLoading('Subiendo foto de perfil...');

            // Validar archivo
            if (!this.validateImageFile(file)) {
                this.showError('Por favor selecciona una imagen válida (JPG, PNG, GIF)');
                return;
            }

            // Generar nombre único para el archivo
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileName = `avatar_${this.currentUser.id || this.currentUser.username}_${Date.now()}.${fileExtension}`;

            console.log('Subiendo imagen:', {
                fileName,
                fileType: file.type,
                fileSize: file.size,
                bucket: 'avatars'
            });

            // Subir archivo a Supabase Storage
            const { data, error } = await this.supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error('Error subiendo imagen:', error);
                
                // Manejar errores específicos
                if (error.message.includes('mime type')) {
                    this.showError('Tipo de archivo no soportado. Configura los tipos MIME en Supabase Storage.');
                } else if (error.message.includes('row-level security')) {
                    this.showError('Error de permisos. Verifica las políticas de Storage en Supabase.');
                } else {
                    this.showError('Error al subir la imagen: ' + error.message);
                }
                return;
            }

            // Obtener URL pública
            const { data: urlData } = this.supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            if (!urlData.publicUrl) {
                this.showError('Error al obtener la URL de la imagen');
                return;
            }

            // Actualizar la base de datos
            await this.updateUserProfilePicture(urlData.publicUrl);

            // Actualizar la interfaz
            this.updateAvatarDisplay(urlData.publicUrl);

            this.showSuccess('Foto de perfil actualizada correctamente');

        } catch (error) {
            console.error('Error en handleProfilePictureUpload:', error);
            this.showError('Error al subir la foto de perfil');
        } finally {
            this.hideLoading();
        }
    }

    async handleCurriculumUpload(file) {
        if (!file) return;

        try {
            this.showLoading('Subiendo curriculum...');

            // Validar archivo
            if (!this.validateDocumentFile(file)) {
                this.showError('Por favor selecciona un documento válido (PDF, DOC, DOCX)');
                return;
            }

            // Generar nombre único para el archivo
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileName = `cv_${this.currentUser.id || this.currentUser.username}_${Date.now()}.${fileExtension}`;

            console.log('Subiendo curriculum:', {
                fileName,
                fileType: file.type,
                fileSize: file.size,
                bucket: 'Curriculums'
            });

            // Subir archivo a Supabase Storage
            const { data, error } = await this.supabase.storage
                .from('Curriculums')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error('Error subiendo curriculum:', error);
                
                // Manejar errores específicos
                if (error.message.includes('mime type')) {
                    this.showError('Tipo de archivo no soportado. Configura los tipos MIME en Supabase Storage.');
                } else if (error.message.includes('row-level security')) {
                    this.showError('Error de permisos. Verifica las políticas de Storage en Supabase.');
                } else {
                    this.showError('Error al subir el curriculum: ' + error.message);
                }
                return;
            }

            // Obtener URL pública
            const { data: urlData } = this.supabase.storage
                .from('Curriculums')
                .getPublicUrl(fileName);

            if (!urlData.publicUrl) {
                this.showError('Error al obtener la URL del curriculum');
                return;
            }

            // Actualizar la base de datos
            await this.updateUserCurriculum(urlData.publicUrl);

            // Actualizar la interfaz
            this.updateCurriculumDisplay(file.name, urlData.publicUrl);

            this.showSuccess('Curriculum subido correctamente');

        } catch (error) {
            console.error('Error en handleCurriculumUpload:', error);
            this.showError('Error al subir el curriculum');
        } finally {
            this.hideLoading();
        }
    }

    validateImageFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            this.showError('Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG y GIF');
            return false;
        }

        if (file.size > maxSize) {
            this.showError('El archivo es demasiado grande. Máximo 5MB');
            return false;
        }

        return true;
    }

    validateDocumentFile(file) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            this.showError('Tipo de archivo no permitido. Solo se permiten PDF, DOC y DOCX');
            return false;
        }

        if (file.size > maxSize) {
            this.showError('El archivo es demasiado grande. Máximo 10MB');
            return false;
        }

        return true;
    }

    async updateUserProfilePicture(imageUrl) {
        try {
            // Actualizar en la base de datos
            const { error } = await this.supabase
                .from('users')
                .update({ profile_picture_url: imageUrl })
                .eq('id', this.currentUser.id);

            if (error) {
                console.error('Error actualizando profile_picture_url:', error);
                throw error;
            }

            // Actualizar en localStorage
            const updatedUser = { ...this.currentUser, profile_picture_url: imageUrl };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;

            console.log('Profile picture URL actualizada en BD y localStorage');
        } catch (error) {
            console.error('Error actualizando profile picture en BD:', error);
            throw error;
        }
    }

    async updateUserCurriculum(curriculumUrl) {
        try {
            // Actualizar en la base de datos
            const { error } = await this.supabase
                .from('users')
                .update({ curriculum_url: curriculumUrl })
                .eq('id', this.currentUser.id);

            if (error) {
                console.error('Error actualizando curriculum_url:', error);
                throw error;
            }

            // Actualizar en localStorage
            const updatedUser = { ...this.currentUser, curriculum_url: curriculumUrl };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;

            console.log('Curriculum URL actualizada en BD y localStorage');
        } catch (error) {
            console.error('Error actualizando curriculum en BD:', error);
            throw error;
        }
    }

    updateAvatarDisplay(imageUrl) {
        const avatarImage = document.getElementById('avatarImage');
        if (avatarImage) {
            avatarImage.src = imageUrl;
            avatarImage.style.display = 'block';
        }

        // Actualizar también en el header si existe
        const headerAvatars = document.querySelectorAll('.header-profile img, .pm-avatar img');
        headerAvatars.forEach(img => {
            img.src = imageUrl;
        });
    }

    updateCurriculumDisplay(fileName, fileUrl) {
        const curriculumName = document.getElementById('curriculumName');
        if (curriculumName) {
            curriculumName.textContent = fileName;
            curriculumName.style.color = 'var(--color-primary)';
        }

        // Agregar link para descargar
        const curriculumBtn = document.getElementById('curriculumBtn');
        if (curriculumBtn) {
            curriculumBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Descargar CV</span>
            `;
            curriculumBtn.onclick = () => window.open(fileUrl, '_blank');
        }
    }

    showLoading(message) {
        // Crear overlay de carga
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        const loadingContent = loadingOverlay.querySelector('.loading-content');
        loadingContent.style.cssText = `
            text-align: center;
            color: white;
        `;

        const spinner = loadingOverlay.querySelector('.spinner');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        `;

        document.body.appendChild(loadingOverlay);

        // Agregar estilos de animación si no existen
        if (!document.querySelector('#loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Remover notificación anterior si existe
        const existingNotification = document.querySelector('.file-upload-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `file-upload-notification file-upload-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Estilos de la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--color-primary)' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            font-size: 0.9rem;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
        `;

        const notificationContent = notification.querySelector('.notification-content');
        notificationContent.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0;
            line-height: 1;
        `;

        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Agregar estilos de animación si no existen
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.fileUploadManager = new FileUploadManager();
});

// Exportar para uso global
window.FileUploadManager = FileUploadManager;
