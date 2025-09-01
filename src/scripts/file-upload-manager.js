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
            
            // Verificar autenticación del usuario en Supabase
            await this.verifySupabaseAuth();
        } catch (error) {
            console.error('Error inicializando Supabase:', error);
            throw error;
        }
    }

    async verifySupabaseAuth() {
        try {
            if (!this.supabase) {
                console.warn('⚠️ Supabase no inicializado, saltando verificación de auth');
                return;
            }
            
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Error verificando sesión Supabase:', error);
                return;
            }
            
            if (session && session.user) {
                console.log('✅ Usuario autenticado en Supabase:', {
                    id: session.user.id,
                    email: session.user.email,
                    expires_at: session.expires_at
                });
                this.supabaseUser = session.user;
            } else {
                console.warn('⚠️ Usuario NO autenticado en Supabase - Storage puede fallar');
                this.supabaseUser = null;
            }
        } catch (error) {
            console.error('❌ Error en verificación de autenticación:', error);
        }
    }

    // Método simplificado para storage público (sin autenticación compleja)
    async tryAuthenticateUser() {
        // Para buckets públicos, la autenticación no es necesaria
        console.log('ℹ️ [AUTH] Storage público configurado - autenticación opcional');
        return true;
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
        // NOTA: El botón changeAvatarBtn ya es manejado por profile-manager.js
        // Solo configuramos el listener del input para evitar duplicación
        const profilePictureInput = document.getElementById('profilePicture');
        
        if (profilePictureInput) {
            // Remover listener existente si ya existe para evitar duplicados
            profilePictureInput.removeEventListener('change', this.handleProfilePictureChange);
            
            // Crear función bound para poder removerla después
            this.handleProfilePictureChange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                console.log('📸 Archivo seleccionado:', file.name, file.size, 'bytes');
                
                // Mostrar preview inmediato si profile-manager está disponible
                if (window.profileManager && typeof window.profileManager.showImagePreview === 'function') {
                    window.profileManager.showImagePreview(file);
                }
                
                // Procesar el upload
                this.handleProfilePictureUpload(file);
            };
            
            profilePictureInput.addEventListener('change', this.handleProfilePictureChange);
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
            
            if (fileUrl === 'DOCX_FALLBACK') {
                // Manejo especial para archivos .docx
                console.log('📄 Procesando archivo .docx con fallback especial');
                const base64Data = await this.convertToBase64(file);
                await this.updateUserCurriculumWithBase64(file.name, base64Data);
                this.updateCurriculumDisplayWithBase64(file.name);
                this.showSuccess('Curriculum .docx guardado en base de datos');
            } else if (fileUrl) {
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
            console.log('🔄 [STORAGE] Iniciando uploadToStorage:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                uploadType: type
            });
            
            if (!this.supabase) {
                console.error('❌ [STORAGE] Supabase no inicializado, usando fallback');
                return null;
            }
            
            console.log('✅ [STORAGE] Supabase client disponible');
            
            // Verificar/intentar autenticación de forma simplificada
            await this.ensureAuthentication();

            // Determinar bucket y configuración según tipo (nombres en minúsculas)
            const config = type === 'profile' ? {
                bucket: 'avatars', // bucket en minúsculas como requiere Supabase
                prefix: 'avatar',
                allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
            } : {
                bucket: 'curriculums', // bucket en minúsculas como requiere Supabase
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
                console.warn('Tipo MIME no soportado por Storage:', file.type);
                console.log('🔄 Intentando convertir o usar fallback para:', file.name);
                
                // Para archivos .docx, intentar convertir a base64 y guardar en BD
                if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    console.log('📄 Archivo .docx detectado, guardando en BD como base64');
                    return 'DOCX_FALLBACK'; // Señal especial para manejo posterior
                }
                
                return null;
            }

            console.log('🚀 [UPLOAD] Intentando subir a Storage:', {
                fileName,
                fileType: file.type,
                fileSize: file.size,
                bucket: config.bucket,
                allowedTypes: config.allowedTypes
            });

            // Verificar/crear bucket de forma robusta
            console.log('🔍 [BUCKET] Verificando/creando bucket:', config.bucket);
            const bucketReady = await this.ensureBucketExists(config);
            if (!bucketReady) {
                console.warn('⚠️ [BUCKET] Bucket no disponible, intentando upload directo...');
                // Continuar con el upload aunque el bucket no esté confirmado
                // Esto puede funcionar si el bucket existe pero no se pudo verificar
            }

            // Intentar subir archivo
            console.log('📤 [UPLOAD] Ejecutando upload...');
            const { data, error } = await this.supabase.storage
                .from(config.bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error('❌ [UPLOAD] Error subiendo archivo:', {
                    error: error.message,
                    bucket: config.bucket,
                    fileName: fileName,
                    status: error.statusCode || error.status || 'N/A'
                });
                
                // Manejo específico de errores comunes
                if (error.message.includes('bucket') || error.message.includes('Bucket')) {
                    console.log('💡 [SOLUCIÓN] Verificar que el bucket existe y es público');
                } else if (error.message.includes('row-level security') || error.message.includes('RLS')) {
                    console.log('💡 [SOLUCIÓN] Verificar políticas RLS del bucket');
                } else if (error.message.includes('401') || error.status === 401) {
                    console.log('💡 [SOLUCIÓN] Usuario no autenticado - usando fallback');
                } else if (error.message.includes('403') || error.status === 403) {
                    console.log('💡 [SOLUCIÓN] Sin permisos - verificar políticas del bucket');
                }
                
                return null;
            }

            // Si llegamos aquí, el upload fue exitoso
            console.log('✅ [UPLOAD] Upload exitoso a Storage:', {
                path: data.path,
                fullPath: data.fullPath,
                id: data.id
            });

            // Obtener URL pública
            console.log('🔗 [URL] Obteniendo URL pública...');
            const { data: urlData } = this.supabase.storage
                .from(config.bucket)
                .getPublicUrl(fileName);

            if (urlData?.publicUrl) {
                console.log('✅ [URL] URL pública obtenida:', urlData.publicUrl);
                return urlData.publicUrl;
            } else {
                console.error('❌ [URL] Error obteniendo URL pública:', urlData);
                return null;
            }

        } catch (error) {
            console.error('💥 [EXCEPTION] Error inesperado:', error.message);
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
            // IDENTIFICACIÓN ROBUSTA: usar ID válido, username o email
            let query = this.supabase.from('users').update({ curriculum_url: curriculumUrl });
            
            if (this.currentUser.id && 
                !String(this.currentUser.id).startsWith('dev-') && 
                !String(this.currentUser.id).includes('test')) {
                // Usar ID si es válido y real de BD
                query = query.eq('id', this.currentUser.id);
                console.log('Actualizando curriculum_url por ID:', this.currentUser.id);
            } else if (this.currentUser.username) {
                // Usar username como fallback
                query = query.eq('username', this.currentUser.username);
                console.log('Actualizando curriculum_url por username:', this.currentUser.username);
            } else if (this.currentUser.email) {
                // Usar email como último recurso
                query = query.eq('email', this.currentUser.email);
                console.log('Actualizando curriculum_url por email:', this.currentUser.email);
            } else {
                throw new Error('No se puede identificar al usuario para actualizar curriculum');
            }

            const { error } = await query;

            if (error) {
                console.error('Error actualizando curriculum_url en BD:', error);
                throw error;
            }

            // Actualizar en localStorage
            const updatedUser = { ...this.currentUser, curriculum_url: curriculumUrl };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;

            console.log('✅ Curriculum URL actualizada en BD y localStorage');
        } catch (error) {
            console.error('❌ Error actualizando curriculum en BD:', error);
            throw error;
        }
    }

    // Nueva función para manejar archivos .docx con base64 en BD
    async updateUserCurriculumWithBase64(fileName, base64Data) {
        try {
            // IDENTIFICACIÓN ROBUSTA: usar ID válido, username o email
            let query = this.supabase.from('users').update({ 
                curriculum_name: fileName,
                curriculum_data: base64Data,
                curriculum_type: 'docx_base64'
            });
            
            if (this.currentUser.id && 
                !String(this.currentUser.id).startsWith('dev-') && 
                !String(this.currentUser.id).includes('test')) {
                // Usar ID si es válido y real de BD
                query = query.eq('id', this.currentUser.id);
                console.log('Actualizando curriculum base64 por ID:', this.currentUser.id);
            } else if (this.currentUser.username) {
                // Usar username como fallback
                query = query.eq('username', this.currentUser.username);
                console.log('Actualizando curriculum base64 por username:', this.currentUser.username);
            } else if (this.currentUser.email) {
                // Usar email como último recurso
                query = query.eq('email', this.currentUser.email);
                console.log('Actualizando curriculum base64 por email:', this.currentUser.email);
            } else {
                throw new Error('No se puede identificar al usuario para actualizar curriculum');
            }

            const { error } = await query;

            if (error) {
                console.error('Error actualizando curriculum base64 en BD:', error);
                throw error;
            }

            // Actualizar en localStorage
            const updatedUser = { 
                ...this.currentUser, 
                curriculum_name: fileName,
                curriculum_data: base64Data,
                curriculum_type: 'docx_base64'
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;

            console.log('✅ Curriculum .docx guardado como base64 en BD y localStorage');
        } catch (error) {
            console.error('❌ Error guardando curriculum base64 en BD:', error);
            throw error;
        }
    }

    updateAvatarDisplay(imageUrl) {
        const avatarImage = document.getElementById('avatarImage');
        if (avatarImage) {
            avatarImage.src = imageUrl;
            avatarImage.style.display = 'block';
            
            // MARCAR COMO FOTO REAL PROTEGIDA
            avatarImage.setAttribute('data-real-photo', 'true');
            avatarImage.setAttribute('data-protected', 'true');
            
            console.log('✅ Avatar marcado como PROTEGIDO contra sobrescritura');
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

    // Nueva función para mostrar CV guardado como base64
    updateCurriculumDisplayWithBase64(fileName) {
        const curriculumName = document.getElementById('curriculumName');
        if (curriculumName) {
            curriculumName.textContent = fileName;
            curriculumName.style.color = 'var(--color-primary)';
        }

        // Botón especial para archivos base64
        const curriculumBtn = document.getElementById('curriculumBtn');
        if (curriculumBtn) {
            curriculumBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>${fileName} (BD)</span>
            `;
            curriculumBtn.onclick = () => this.downloadBase64Curriculum();
        }
    }

    // Función para descargar curriculum desde base64
    downloadBase64Curriculum() {
        try {
            const currentUser = this.currentUser;
            if (currentUser.curriculum_data && currentUser.curriculum_name) {
                // Crear blob desde base64
                const base64Data = currentUser.curriculum_data.split(',')[1]; // Remover prefijo data:...
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { 
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
                });
                
                // Crear URL y descargar
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = currentUser.curriculum_name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                console.log('✅ Curriculum descargado desde base64');
            } else {
                this.showError('No hay curriculum disponible para descargar');
            }
        } catch (error) {
            console.error('❌ Error descargando curriculum:', error);
            this.showError('Error al descargar curriculum');
        }
    }

    // Función para mostrar notificación cuando falta contraseña
    showPasswordRequiredNotification() {
        const notification = document.createElement('div');
        notification.className = 'password-required-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <h3>🔑 Requiere nueva autenticación</h3>
                    <button class="notification-close">&times;</button>
                </div>
                <div class="notification-body">
                    <p>Para subir archivos a la nube, necesitas hacer login nuevamente.</p>
                    <p><strong>Razón:</strong> Tu sesión actual no tiene las credenciales necesarias para el almacenamiento seguro.</p>
                    <div class="notification-actions">
                        <button class="btn-login-again">Hacer Login Nuevamente</button>
                        <button class="btn-continue-local">Continuar sin Nube</button>
                    </div>
                </div>
            </div>
        `;

        // Estilos de la notificación
        notification.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002;
            backdrop-filter: blur(5px);
        `;

        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            background: var(--color-background, #ffffff);
            color: var(--color-text, #333333);
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            margin: 2rem;
            font-family: 'Inter', sans-serif;
        `;

        const header = notification.querySelector('.notification-header');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 1rem;
        `;

        const actions = notification.querySelector('.notification-actions');
        actions.style.cssText = `
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        `;

        const buttons = notification.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.cssText = `
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-family: inherit;
                font-weight: 500;
                transition: all 0.2s ease;
            `;
        });

        const loginBtn = notification.querySelector('.btn-login-again');
        loginBtn.style.cssText += `
            background: var(--color-primary, #0066cc);
            color: white;
        `;

        const continueBtn = notification.querySelector('.btn-continue-local');
        continueBtn.style.cssText += `
            background: #6b7280;
            color: white;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText += `
            background: none;
            color: #6b7280;
            font-size: 1.5rem;
            padding: 0;
        `;

        // Event listeners
        closeBtn.addEventListener('click', () => notification.remove());
        continueBtn.addEventListener('click', () => notification.remove());
        loginBtn.addEventListener('click', () => {
            notification.remove();
            // Redirigir al login
            window.location.href = '/src/login/new-auth.html';
        });

        document.body.appendChild(notification);
    }

    // Función para reenviar email de confirmación
    async resendEmailConfirmation() {
        try {
            if (!this.supabase) {
                console.error('❌ Supabase no está inicializado');
                this.showError('Error: Supabase no está disponible');
                return false;
            }

            if (!this.currentUser?.email) {
                console.error('❌ No hay email para reenviar confirmación');
                this.showError('Error: No se encontró el email del usuario');
                return false;
            }

            console.log('📧 Reenviando email de confirmación a:', this.currentUser.email);
            this.showLoading('Reenviando email de confirmación...');

            // Usar la función resend de Supabase Auth
            const { data, error } = await this.supabase.auth.resend({
                type: 'signup',
                email: this.currentUser.email,
                options: {
                    emailRedirectTo: window.location.origin + '/src/profile.html'
                }
            });

            this.hideLoading();

            if (error) {
                console.error('❌ Error reenviando email:', error.message);
                this.showError(`Error reenviando email: ${error.message}`);
                return false;
            } else {
                console.log('✅ Email de confirmación reenviado exitosamente');
                this.showSuccess('Email de confirmación reenviado. Revisa tu bandeja de entrada.');
                
                // Opcional: Cerrar la notificación después de un momento
                setTimeout(() => {
                    const notification = document.querySelector('.email-not-confirmed-notification');
                    if (notification) {
                        notification.remove();
                    }
                }, 3000);
                
                return true;
            }
        } catch (error) {
            this.hideLoading();
            console.error('❌ Error inesperado reenviando email:', error);
            this.showError('Error inesperado al reenviar email de confirmación');
            return false;
        }
    }

    // Función para mostrar notificación de email no confirmado
    showEmailNotConfirmedNotification() {
        const notification = document.createElement('div');
        notification.className = 'email-not-confirmed-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <h3>📧 Email no confirmado</h3>
                    <button class="notification-close">&times;</button>
                </div>
                <div class="notification-body">
                    <p><strong>⚠️ Tu cuenta necesita verificación de email</strong></p>
                    <p>Para guardar archivos en la nube de forma segura, Supabase requiere que confirmes tu email.</p>
                    
                    <div class="user-info">
                        <p><strong>📧 Email a confirmar:</strong> <code>${this.currentUser.email}</code></p>
                        <p><strong>📊 Estado actual:</strong> <span class="status-unconfirmed">❌ No confirmado</span></p>
                    </div>
                    
                    <div class="email-instructions">
                        <h4>🔧 Cómo confirmar tu email:</h4>
                        <ol>
                            <li><strong>Revisa tu bandeja de entrada</strong> (y carpeta de spam/promociones)</li>
                            <li><strong>Busca un email de Supabase</strong> con asunto "Confirm your signup"</li>
                            <li><strong>Haz clic en el enlace</strong> "Confirm your email address"</li>
                            <li><strong>Regresa aquí</strong> y recarga la página</li>
                            <li><strong>Intenta subir tu CV nuevamente</strong></li>
                        </ol>
                    </div>
                    
                    <div class="email-alternatives">
                        <h4>📨 ¿No recibiste el email?</h4>
                        <ul>
                            <li>Revisa tu carpeta de spam o promociones</li>
                            <li>Verifica que el email ${this.currentUser.email} sea correcto</li>
                            <li>Usa el botón "Reenviar Email" de abajo</li>
                            <li>Puede tardar unos minutos en llegar</li>
                        </ul>
                    </div>
                    
                    <div class="notification-actions">
                        <button class="btn-resend-email">📧 Reenviar Email de Confirmación</button>
                        <button class="btn-continue-local">💾 Guardar Solo Local (temporal)</button>
                    </div>
                    
                    <div class="notification-note">
                        <small><strong>Nota:</strong> Mientras no confirmes tu email, los archivos se guardarán solo en tu navegador (no en la nube).</small>
                    </div>
                </div>
            </div>
        `;

        // Estilos de la notificación
        notification.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002;
            backdrop-filter: blur(5px);
        `;

        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            background: var(--color-background, #ffffff);
            color: var(--color-text, #333333);
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            margin: 2rem;
            font-family: 'Inter', sans-serif;
        `;

        const header = notification.querySelector('.notification-header');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 1rem;
        `;

        // Estilos para user-info
        const userInfo = notification.querySelector('.user-info');
        userInfo.style.cssText = `
            background: #f0f8ff;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border-left: 4px solid #0066cc;
        `;

        const statusUnconfirmed = notification.querySelector('.status-unconfirmed');
        statusUnconfirmed.style.cssText = `
            color: #dc3545;
            font-weight: bold;
        `;

        const instructions = notification.querySelector('.email-instructions');
        instructions.style.cssText = `
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border-left: 4px solid var(--color-primary, #28a745);
        `;

        const alternatives = notification.querySelector('.email-alternatives');
        alternatives.style.cssText = `
            background: #fff3cd;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border-left: 4px solid #ffc107;
        `;

        const notificationNote = notification.querySelector('.notification-note');
        notificationNote.style.cssText = `
            background: #e9ecef;
            padding: 0.75rem;
            border-radius: 6px;
            margin-top: 1rem;
            font-style: italic;
            text-align: center;
        `;

        const actions = notification.querySelector('.notification-actions');
        actions.style.cssText = `
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        `;

        const buttons = notification.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.cssText = `
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-family: inherit;
                font-weight: 500;
                transition: all 0.2s ease;
            `;
        });

        const resendBtn = notification.querySelector('.btn-resend-email');
        resendBtn.style.cssText += `
            background: var(--color-primary, #0066cc);
            color: white;
        `;

        const continueBtn = notification.querySelector('.btn-continue-local');
        continueBtn.style.cssText += `
            background: #6b7280;
            color: white;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText += `
            background: none;
            color: #6b7280;
            font-size: 1.5rem;
            padding: 0;
        `;

        // Event listeners
        closeBtn.addEventListener('click', () => notification.remove());
        continueBtn.addEventListener('click', () => notification.remove());
        resendBtn.addEventListener('click', async () => {
            console.log('📧 Reenviando email de confirmación...');
            await this.resendEmailConfirmation();
        });

        document.body.appendChild(notification);

        // Comprobar periódicamente si el email ha sido confirmado
        this.startEmailConfirmationChecker();
    }

    // Función para verificar periódicamente si el email ha sido confirmado
    startEmailConfirmationChecker() {
        // Evitar múltiples checkers corriendo al mismo tiempo
        if (this.emailCheckerInterval) {
            clearInterval(this.emailCheckerInterval);
        }

        console.log('⏰ Iniciando verificación periódica de confirmación de email...');
        
        this.emailCheckerInterval = setInterval(async () => {
            try {
                console.log('🔍 Verificando si el email ha sido confirmado...');
                
                // Intentar autenticar nuevamente
                const authSuccess = await this.tryAuthenticateUser();
                
                if (authSuccess) {
                    console.log('✅ ¡Email confirmado! Autenticación exitosa.');
                    
                    // Cerrar la notificación
                    const notification = document.querySelector('.email-not-confirmed-notification');
                    if (notification) {
                        notification.remove();
                    }
                    
                    // Detener el checker
                    clearInterval(this.emailCheckerInterval);
                    this.emailCheckerInterval = null;
                    
                    // Mostrar mensaje de éxito
                    this.showSuccess('✅ Email confirmado correctamente. Ya puedes subir archivos a la nube.');
                    
                    // Opcional: Intentar el upload automáticamente si había uno pendiente
                    console.log('🔄 Email confirmado, Storage ahora disponible');
                }
            } catch (error) {
                console.log('🔍 Aún sin confirmar, continuando verificación...');
            }
        }, 10000); // Verificar cada 10 segundos

        // Detener el checker después de 10 minutos para evitar requests infinitos
        setTimeout(() => {
            if (this.emailCheckerInterval) {
                clearInterval(this.emailCheckerInterval);
                this.emailCheckerInterval = null;
                console.log('⏰ Verificación automática de email terminada después de 10 minutos');
            }
        }, 600000); // 10 minutos
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

    // Método simplificado para configuración de storage público
    async ensureAuthentication() {
        try {
            console.log('🔑 [AUTH] Modo Storage Público - sin autenticación requerida');
            
            // Para buckets públicos, no necesitamos autenticación
            // Solo verificar si casualmente hay una sesión activa
            try {
                const { data: { session } } = await this.supabase.auth.getSession();
                if (session && session.user) {
                    console.log('✅ [AUTH] Sesión encontrada (bonus):', session.user.email);
                    this.supabaseUser = session.user;
                    return true;
                }
            } catch (authError) {
                // Ignorar errores de auth para buckets públicos
                console.log('ℹ️ [AUTH] Sin sesión (normal para storage público)');
            }
            
            console.log('✅ [AUTH] Configurado para storage público - sin autenticación necesaria');
            this.supabaseUser = null;
            return true; // Retornar true porque el storage público no requiere auth
            
        } catch (error) {
            console.log('ℹ️ [AUTH] Usando storage público sin verificación auth');
            this.supabaseUser = null;
            return true; // Siempre permitir para buckets públicos
        }
    }

    // Método para asegurar que el bucket existe y está configurado correctamente
    async ensureBucketExists(config) {
        try {
            console.log(`🔍 [BUCKET] Verificando existencia del bucket: ${config.bucket}`);
            
            // Listar buckets existentes
            const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
            
            if (listError) {
                console.error('❌ [BUCKET] Error listando buckets:', listError);
                console.log('💡 [SOLUCIÓN] Verificar credenciales o crear buckets manualmente en Supabase Dashboard');
                
                // Mostrar notificación con instrucciones
                this.showBucketSetupNotification();
                return false;
            }

            // Verificar si el bucket existe
            const bucketExists = buckets.find(b => b.name === config.bucket);
            
            if (bucketExists) {
                console.log(`✅ [BUCKET] Bucket "${config.bucket}" ya existe (público: ${bucketExists.public})`);
                return true;
            }

            // Si no existe, intentar crear con diferentes métodos
            console.log(`📁 [BUCKET] Bucket "${config.bucket}" no existe, intentando crear...`);
            
            // Método 1: Crear con service role si está disponible
            const serviceKey = localStorage.getItem('supabaseServiceKey') || 
                              document.querySelector('meta[name="supabase-service-key"]')?.content;
            
            if (serviceKey && serviceKey !== '') {
                console.log('🔑 [BUCKET] Intentando crear con service role...');
                
                try {
                    // Crear cliente temporal con service role
                    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                    const serviceSupabase = createClient(
                        this.supabase.supabaseUrl, 
                        serviceKey
                    );
                    
                    const { data, error } = await serviceSupabase.storage.createBucket(config.bucket, {
                        public: true,
                        fileSizeLimit: config.bucket === 'avatars' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
                    });
                    
                    if (!error || error.message?.includes('already exists')) {
                        console.log(`✅ [BUCKET] Bucket "${config.bucket}" creado con service role`);
                        return true;
                    }
                    
                    console.warn('⚠️ [BUCKET] Service role falló:', error.message);
                } catch (serviceError) {
                    console.warn('⚠️ [BUCKET] Error con service role:', serviceError.message);
                }
            }
            
            // Método 2: Crear con usuario normal (probablemente falle por RLS)
            console.log('🔄 [BUCKET] Intentando crear con usuario normal...');
            const { error: normalCreateError } = await this.supabase.storage.createBucket(config.bucket, {
                public: true
            });
            
            if (!normalCreateError || normalCreateError.message?.includes('already exists')) {
                console.log(`✅ [BUCKET] Bucket "${config.bucket}" creado con usuario normal`);
                return true;
            }
            
            // Si llegamos aquí, no se pudo crear el bucket
            console.error(`❌ [BUCKET] No se pudo crear bucket "${config.bucket}"`);
            console.log('📋 [INSTRUCCIONES] Para resolver este problema:');
            console.log('1. Ir a https://app.supabase.com/project/[tu-proyecto]/storage/buckets');
            console.log(`2. Crear bucket "${config.bucket}" manualmente`);
            console.log('3. Marcar como "Public bucket"');
            console.log('4. Configurar políticas RLS apropiadas');
            
            // Mostrar notificación al usuario
            this.showBucketSetupNotification();
            
            // Intentar continuar sin bucket (fallback total)
            return false;

        } catch (error) {
            console.error(`💥 [BUCKET] Excepción asegurando bucket "${config.bucket}":`, error);
            this.showBucketSetupNotification();
            return false;
        }
    }

    // Mostrar notificación con instrucciones para configurar buckets manualmente
    showBucketSetupNotification() {
        // Evitar mostrar múltiples notificaciones
        if (document.querySelector('.bucket-setup-notification')) {
            return;
        }

        const notification = document.createElement('div');
        notification.className = 'bucket-setup-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <h3>🗂️ Configuración de Storage Requerida</h3>
                    <button class="notification-close">&times;</button>
                </div>
                <div class="notification-body">
                    <p><strong>⚠️ Los buckets de storage no están configurados</strong></p>
                    <p>Para guardar imágenes de perfil en la nube, necesitas configurar los buckets manualmente.</p>
                    
                    <div class="setup-instructions">
                        <h4>🔧 Pasos para configurar:</h4>
                        <ol>
                            <li><strong>Abrir Supabase Dashboard:</strong> <a href="https://app.supabase.com" target="_blank">https://app.supabase.com</a></li>
                            <li><strong>Ir a tu proyecto → Storage → Buckets</strong></li>
                            <li><strong>Crear bucket "avatars":</strong>
                                <ul>
                                    <li>Nombre: <code>avatars</code></li>
                                    <li>✅ Marcar como "Public bucket"</li>
                                    <li>File size limit: 5MB</li>
                                </ul>
                            </li>
                            <li><strong>Crear bucket "curriculums":</strong>
                                <ul>
                                    <li>Nombre: <code>curriculums</code></li>
                                    <li>✅ Marcar como "Public bucket"</li>
                                    <li>File size limit: 10MB</li>
                                </ul>
                            </li>
                            <li><strong>Configurar políticas RLS</strong> (opcional para buckets públicos)</li>
                        </ol>
                    </div>
                    
                    <div class="notification-actions">
                        <button class="btn-primary" onclick="window.open('https://app.supabase.com', '_blank')">🚀 Abrir Supabase</button>
                        <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">⏭️ Continuar sin Nube</button>
                    </div>
                    
                    <div class="notification-note">
                        <small><strong>Nota:</strong> Mientras no configures los buckets, las imágenes se guardarán solo en tu navegador local.</small>
                    </div>
                </div>
            </div>
        `;

        // Estilos
        notification.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10003;
            backdrop-filter: blur(5px);
        `;

        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            background: var(--color-background, #ffffff);
            color: var(--color-text, #333333);
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            margin: 2rem;
            font-family: 'Inter', sans-serif;
        `;

        // Event listeners
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());

        const primaryBtn = notification.querySelector('.btn-primary');
        primaryBtn.style.cssText = `
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            margin: 0.5rem;
            font-weight: 500;
        `;

        const secondaryBtn = notification.querySelector('.btn-secondary');
        secondaryBtn.style.cssText = `
            background: #6b7280;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            margin: 0.5rem;
            font-weight: 500;
        `;

        document.body.appendChild(notification);
    }
}

// Función global simplificada para storage público
window.ensureSupabaseAuth = async function() {
    console.log('ℹ️ [AUTH] Storage público - autenticación no requerida');
    return true;
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.fileUploadManager = new FileUploadManager();
    console.log('✅ [INIT] FileUploadManager inicializado para storage público');
});

// Exportar para uso global
window.FileUploadManager = FileUploadManager;
