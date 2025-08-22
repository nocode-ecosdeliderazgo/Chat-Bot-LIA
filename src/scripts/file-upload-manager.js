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

            // Intentar subir a Supabase Storage primero
            const imageUrl = await this.uploadToStorage(file, 'profile');
            
            if (imageUrl) {
                // Si funciona Storage, usar URL de Supabase
                await this.updateUserProfilePicture(imageUrl);
                this.updateAvatarDisplay(imageUrl);
                this.showSuccess('Foto de perfil actualizada correctamente');
            } else {
                // Si falla Storage, usar base64 como fallback
                console.log('Storage falló, usando fallback base64');
                const base64Url = await this.convertToBase64(file);
                await this.updateUserProfilePictureLocal(base64Url);
                this.updateAvatarDisplay(base64Url);
                this.showSuccess('Foto de perfil actualizada (modo local)');
            }

        } catch (error) {
            console.error('Error en handleProfilePictureUpload:', error);
            
            // Último fallback: usar base64
            try {
                const base64Url = await this.convertToBase64(file);
                await this.updateUserProfilePictureLocal(base64Url);
                this.updateAvatarDisplay(base64Url);
                this.showSuccess('Foto de perfil actualizada (modo local)');
            } catch (fallbackError) {
                console.error('Error en fallback:', fallbackError);
                this.showError('Error al procesar la imagen');
            }
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

            // Intentar subir a Supabase Storage primero
            const fileUrl = await this.uploadToStorage(file, 'curriculum');
            
            if (fileUrl) {
                // Si funciona Storage, usar URL de Supabase
                await this.updateUserCurriculum(fileUrl);
                this.updateCurriculumDisplay(file.name, fileUrl);
                this.showSuccess('Curriculum subido correctamente');
            } else {
                // Si falla Storage, guardar información del archivo localmente
                console.log('Storage falló, guardando información local del CV');
                await this.updateUserCurriculumLocal(file.name);
                this.updateCurriculumDisplayLocal(file.name);
                this.showSuccess('Información del curriculum guardada (modo local)');
            }

        } catch (error) {
            console.error('Error en handleCurriculumUpload:', error);
            
            // Fallback: guardar solo el nombre del archivo
            try {
                await this.updateUserCurriculumLocal(file.name);
                this.updateCurriculumDisplayLocal(file.name);
                this.showSuccess('Información del curriculum guardada (modo local)');
            } catch (fallbackError) {
                console.error('Error en fallback:', fallbackError);
                this.showError('Error al procesar el curriculum');
            }
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

    // Nueva función para intentar subir a Storage con manejo robusto
    async uploadToStorage(file, type) {
        try {
            if (!this.supabase) {
                console.log('Supabase no inicializado, usando fallback');
                return null;
            }

            // Determinar bucket y configuración según tipo
            const config = type === 'profile' ? {
                bucket: 'avatars',
                prefix: 'avatar',
                allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'] // Incluir image/jpeg
            } : {
                bucket: 'curriculums',
                prefix: 'cv', 
                allowedTypes: [
                    'application/pdf',
                    'application/msword', // .doc
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
                ]
            };

            // Generar nombre único para el archivo
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileName = `${config.prefix}_${this.currentUser.id || this.currentUser.username}_${Date.now()}.${fileExtension}`;

            // Verificar si el tipo de archivo es soportado por Storage
            if (!config.allowedTypes.includes(file.type)) {
                console.log('Tipo MIME no soportado por Storage:', file.type);
                return null;
            }

            console.log('Intentando subir a Storage:', {
                fileName,
                fileType: file.type,
                fileSize: file.size,
                bucket: config.bucket
            });

            // Intentar subir archivo
            const { data, error } = await this.supabase.storage
                .from(config.bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.log('Error de Storage:', error.message);
                
                // Log específico para diferentes tipos de error
                if (error.message.includes('mime type')) {
                    console.log('Error de MIME type - usando fallback');
                } else if (error.message.includes('row-level security')) {
                    console.log('Error de RLS - usando fallback');
                } else if (error.message.includes('bucket')) {
                    console.log('Error de bucket - usando fallback');
                }
                
                return null;
            }

            // Obtener URL pública
            const { data: urlData } = this.supabase.storage
                .from(config.bucket)
                .getPublicUrl(fileName);

            if (urlData?.publicUrl) {
                console.log('Upload exitoso a Storage:', urlData.publicUrl);
                return urlData.publicUrl;
            } else {
                console.log('Error obteniendo URL pública');
                return null;
            }

        } catch (error) {
            console.log('Exception en uploadToStorage:', error.message);
            return null;
        }
    }

    // Función para convertir archivo a base64
    async convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Actualizar imagen de perfil en localStorage (fallback)
    async updateUserProfilePictureLocal(base64Url) {
        try {
            // Actualizar en localStorage
            const updatedUser = { ...this.currentUser, profile_picture_url: base64Url };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;

            console.log('Profile picture actualizada en localStorage');
        } catch (error) {
            console.error('Error actualizando profile picture local:', error);
            throw error;
        }
    }

    // Actualizar curriculum en localStorage (fallback)
    async updateUserCurriculumLocal(fileName) {
        try {
            // Actualizar en localStorage
            const updatedUser = { ...this.currentUser, curriculum_name: fileName };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;

            console.log('Curriculum info actualizada en localStorage');
        } catch (error) {
            console.error('Error actualizando curriculum local:', error);
            throw error;
        }
    }

    // Mostrar curriculum en modo local
    updateCurriculumDisplayLocal(fileName) {
        const curriculumName = document.getElementById('curriculumName');
        if (curriculumName) {
            curriculumName.textContent = fileName;
            curriculumName.style.color = 'var(--color-primary)';
        }

        // Cambiar botón para mostrar que está en modo local
        const curriculumBtn = document.getElementById('curriculumBtn');
        if (curriculumBtn) {
            curriculumBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>${fileName} (Local)</span>
            `;
        }
    }

    async updateUserProfilePicture(imageUrl) {
        try {
            // IDENTIFICACIÓN ROBUSTA: usar ID válido, username o email
            let query = this.supabase.from('users').update({ profile_picture_url: imageUrl });
            
            if (this.currentUser.id && 
                !String(this.currentUser.id).startsWith('dev-') && 
                !String(this.currentUser.id).includes('test')) {
                // Usar ID si es válido y real de BD
                query = query.eq('id', this.currentUser.id);
                console.log('Actualizando profile_picture_url por ID:', this.currentUser.id);
            } else if (this.currentUser.username) {
                // Usar username como fallback
                query = query.eq('username', this.currentUser.username);
                console.log('Actualizando profile_picture_url por username:', this.currentUser.username);
            } else if (this.currentUser.email) {
                // Usar email como último recurso
                query = query.eq('email', this.currentUser.email);
                console.log('Actualizando profile_picture_url por email:', this.currentUser.email);
            } else {
                throw new Error('No se puede identificar al usuario para actualizar avatar');
            }
            
            const { error } = await query;

            if (error) {
                console.error('Error actualizando profile_picture_url en BD:', error);
                throw error;
            }

            // Actualizar en localStorage
            const updatedUser = { ...this.currentUser, profile_picture_url: imageUrl };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;

            console.log('✅ Profile picture URL actualizada en BD y localStorage');
        } catch (error) {
            console.error('❌ Error actualizando profile picture en BD:', error);
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
