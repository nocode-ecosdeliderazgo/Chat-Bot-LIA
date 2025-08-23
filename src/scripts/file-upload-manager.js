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

    async tryAuthenticateUser() {
        try {
            if (!this.supabase || !this.currentUser) {
                return false;
            }
            
            console.log('🔑 Intentando autenticar usuario en Supabase...');
            
            // 1. Verificar si hay un token guardado
            const tokenKeys = [
                'supabase.auth.token',
                'sb-lia.auth.token', // storageKey configurado
                'sb-lia-auth-token'
            ];
            
            let tokenFound = false;
            for (const key of tokenKeys) {
                const token = localStorage.getItem(key);
                if (token) {
                    console.log('🔑 Token encontrado en:', key);
                    tokenFound = true;
                    break;
                }
            }
            
            if (tokenFound) {
                console.log('🔑 Intentando restaurar sesión con token existente...');
                
                // Intentar refrescar la sesión
                const { data, error } = await this.supabase.auth.refreshSession();
                
                if (!error && data.session) {
                    console.log('✅ Sesión restaurada exitosamente');
                    this.supabaseUser = data.session.user;
                    return true;
                } else {
                    console.log('⚠️ Token expirado o inválido, intentando nuevo login...');
                }
            }
            
            // 2. Si no hay token válido, intentar autenticar con credenciales
            if (this.currentUser.email) {
                console.log('🔑 Intentando autenticar con email:', this.currentUser.email);
                
                // Intentar login primero
                if (this.currentUser.password) {
                    const { data, error } = await this.supabase.auth.signInWithPassword({
                        email: this.currentUser.email,
                        password: this.currentUser.password
                    });
                    
                    if (!error && data.session) {
                        console.log('✅ Autenticación exitosa con credenciales existentes');
                        this.supabaseUser = data.session.user;
                        return true;
                    } else {
                        console.warn('⚠️ Login falló:', error?.message);
                        
                        // MANEJO DETALLADO DE ERRORES DE SUPABASE
                        const errorMessage = error?.message || '';
                        
                        // ERROR 1: EMAIL NOT CONFIRMED
                        if (errorMessage.includes('Email not confirmed')) {
                            console.error('❌ EMAIL NO CONFIRMADO en Supabase');
                            console.log('📧 El usuario debe confirmar su email antes de usar Storage');
                            console.log('🔧 SOLUCIÓN: Reenviar email de confirmación o confirmar manualmente');
                            
                            // Mostrar notificación específica con opciones de solución
                            this.showEmailNotConfirmedNotification();
                            return false;
                        }
                        
                        // ERROR 2: INVALID LOGIN CREDENTIALS  
                        if (errorMessage.includes('Invalid login credentials')) {
                            console.error('❌ CREDENCIALES INVÁLIDAS en Supabase');
                            console.log('🔧 POSIBLES CAUSAS:');
                            console.log('   - Contraseña incorrecta');
                            console.log('   - Usuario no registrado en Supabase');
                            console.log('   - Email incorrecto');
                            console.log('🔧 SOLUCIÓN: Verificar credenciales o crear usuario nuevo');
                        }
                        
                        // ERROR 3: TOO MANY REQUESTS
                        if (errorMessage.includes('Too many requests') || errorMessage.includes('rate limit')) {
                            console.error('❌ DEMASIADAS SOLICITUDES en Supabase');
                            console.log('🔧 SOLUCIÓN: Esperar unos minutos antes de intentar nuevamente');
                            this.showError('Demasiadas solicitudes. Espera unos minutos e intenta de nuevo.');
                            return false;
                        }
                        
                        // ERROR 4: SIGNUP DISABLED
                        if (errorMessage.includes('Signups not allowed')) {
                            console.error('❌ REGISTRO DESHABILITADO en Supabase');
                            console.log('🔧 SOLUCIÓN: El administrador debe habilitar registros en Supabase');
                            this.showError('Los registros están deshabilitados. Contacta al administrador.');
                            return false;
                        }
                        
                        // Si el usuario no existe, intentar crearlo
                        if (errorMessage.includes('Invalid login credentials') || 
                            errorMessage.includes('User not found')) {
                            
                            console.log('🔑 Usuario no existe, intentando crear en Supabase...');
                            
                            const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
                                email: this.currentUser.email,
                                password: this.currentUser.password || 'defaultPassword123!',
                                options: {
                                    data: {
                                        username: this.currentUser.username || 'user',
                                        full_name: this.currentUser.display_name || this.currentUser.full_name || 'Usuario'
                                    }
                                }
                            });
                            
                            if (!signUpError && signUpData.session) {
                                console.log('✅ Usuario creado y autenticado exitosamente');
                                this.supabaseUser = signUpData.session.user;
                                return true;
                            } else if (!signUpError && signUpData.user && !signUpData.session) {
                                console.log('✅ Usuario creado - Email de confirmación enviado');
                                console.log('📧 El usuario debe confirmar su email para completar el registro');
                                this.showEmailNotConfirmedNotification();
                                return false;
                            } else {
                                console.error('❌ Error creando usuario:', signUpError?.message);
                                
                                // MANEJO DETALLADO DE ERRORES DE SIGNUP
                                const signUpErrorMessage = signUpError?.message || '';
                                
                                if (signUpErrorMessage.includes('User already registered')) {
                                    console.log('🔧 CAUSA: Usuario ya existe pero con credenciales diferentes');
                                    console.log('🔧 SOLUCIÓN: Verificar email y contraseña correctos');
                                    this.showError('Usuario ya registrado. Verifica tus credenciales.');
                                } else if (signUpErrorMessage.includes('Password should be at least')) {
                                    console.log('🔧 CAUSA: Contraseña muy corta');
                                    console.log('🔧 SOLUCIÓN: Usar contraseña más larga');
                                    this.showError('La contraseña debe tener al menos 6 caracteres.');
                                } else if (signUpErrorMessage.includes('Signups not allowed')) {
                                    console.log('🔧 CAUSA: Registros deshabilitados en Supabase');
                                    console.log('🔧 SOLUCIÓN: Contactar administrador');
                                    this.showError('Los registros están deshabilitados. Contacta al administrador.');
                                } else if (signUpErrorMessage.includes('Invalid email')) {
                                    console.log('🔧 CAUSA: Email inválido');
                                    console.log('🔧 SOLUCIÓN: Verificar formato de email');
                                    this.showError('El formato del email es inválido.');
                                } else if (signUpErrorMessage) {
                                    this.showError(`Error al crear usuario: ${signUpErrorMessage}`);
                                }
                            }
                        }
                    }
                }
            }
            
            // 3. Si no tiene email, usar autenticación alternativa
            if (!this.currentUser.email && this.currentUser.username) {
                console.log('🔑 Usuario sin email, creando email temporal para Supabase...');
                
                // Crear email temporal basado en username
                const tempEmail = `${this.currentUser.username}@tempuser.local`;
                const tempPassword = 'TempPassword123!';
                
                console.log('🔑 Intentando crear usuario temporal:', tempEmail);
                
                const { data: tempData, error: tempError } = await this.supabase.auth.signUp({
                    email: tempEmail,
                    password: tempPassword,
                    options: {
                        data: {
                            username: this.currentUser.username,
                            full_name: this.currentUser.display_name || this.currentUser.username,
                            is_temp_user: true
                        }
                    }
                });
                
                if (!tempError && tempData.session) {
                    console.log('✅ Usuario temporal creado exitosamente');
                    this.supabaseUser = tempData.session.user;
                    return true;
                }
            }
            
            console.error('❌ No se pudo autenticar en Supabase de ninguna forma');
            console.log('📝 Estado del usuario local:', {
                hasEmail: !!this.currentUser.email,
                email: this.currentUser.email || 'NO EMAIL',
                hasPassword: !!this.currentUser.password,
                hasUsername: !!this.currentUser.username,
                username: this.currentUser.username || 'NO USERNAME'
            });
            console.log('🚨 SOLUCIÓN PRINCIPAL: El usuario debe confirmar su email en Supabase');
            console.log('🔧 PASOS PARA SOLUCIONAR:');
            console.log('   1. Revisar bandeja de entrada del email:', this.currentUser.email);
            console.log('   2. Buscar email de Supabase con asunto "Confirm your signup"');
            console.log('   3. Hacer clic en el enlace de confirmación');
            console.log('   4. O usar el botón "Reenviar Email" cuando aparezca la notificación');
            console.log('   5. Una vez confirmado, recargar la página e intentar subir el CV nuevamente');
            
            return false;
            
        } catch (error) {
            console.error('❌ Error intentando autenticar:', error);
            return false;
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
            if (!this.supabase) {
                console.log('Supabase no inicializado, usando fallback');
                return null;
            }
            
            // VERIFICAR AUTENTICACIÓN ANTES DE SUBIR
            await this.verifySupabaseAuth();
            
            if (!this.supabaseUser) {
                console.error('❌ Usuario no autenticado en Supabase - Storage fallará');
                
                // VERIFICAR SI TIENE CONTRASEÑA ANTES DE INTENTAR AUTENTICAR
                if (!this.currentUser.password) {
                    console.error('❌ PROBLEMA: Usuario sin contraseña guardada');
                    console.log('📝 Estado del usuario:', {
                        hasEmail: !!this.currentUser.email,
                        email: this.currentUser.email || 'NO EMAIL',
                        hasPassword: !!this.currentUser.password,
                        hasUsername: !!this.currentUser.username,
                        username: this.currentUser.username || 'NO USERNAME'
                    });
                    console.log('🚨 SOLUCIÓN: El usuario debe hacer login nuevamente para guardar la contraseña');
                    
                    // Mostrar notificación al usuario
                    this.showPasswordRequiredNotification();
                    
                    return null;
                }
                
                console.log('🔄 Intentando autenticar con token local...');
                
                // Intentar autenticar con datos locales si están disponibles
                if (this.currentUser && this.currentUser.email) {
                    console.log('🔑 Usuario local encontrado con contraseña, intentando autenticar en Supabase...');
                    await this.tryAuthenticateUser();
                    
                    // Verificar de nuevo después del intento de autenticación
                    if (!this.supabaseUser) {
                        console.warn('⚠️ No se pudo autenticar en Supabase - usando fallback');
                        return null;
                    }
                } else {
                    // Continuar con fallback
                    return null;
                }
            }
            
            console.log('✅ Usuario autenticado, procediendo con Storage');

            // Determinar bucket y configuración según tipo (NOMBRES EN MAYÚSCULAS)
            const config = type === 'profile' ? {
                bucket: 'AVATARS', // bucket correcto en MAYÚSCULAS
                prefix: 'avatar',
                allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
            } : {
                bucket: 'CURRICULUMS', // bucket correcto en MAYÚSCULAS
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
                console.error('❌ Error de Storage:', error.message);
                console.error('❌ Error completo:', error);
                
                // DIAGNÓSTICO DETALLADO
                console.error('🔍 DIAGNÓSTICO COMPLETO:', {
                    bucket: config.bucket,
                    fileName: fileName,
                    fileType: file.type,
                    fileSize: file.size,
                    error: error.message,
                    statusCode: error.statusCode || error.status || 'N/A',
                    supabaseUserAuth: !!this.supabaseUser,
                    localUserAuth: !!this.currentUser
                });
                
                // Log específico para diferentes tipos de error
                if (error.message.includes('mime type')) {
                    console.log('🗺 Error de MIME type - usando fallback');
                } else if (error.message.includes('row-level security') || error.message.includes('RLS')) {
                    console.log('🔒 Error de RLS - posible problema de autenticación');
                    console.log('🔑 Usuario Supabase:', this.supabaseUser ? 'Autenticado' : 'NO autenticado');
                } else if (error.message.includes('bucket') || error.message.includes('Bucket')) {
                    console.error('🚨 ERROR DE BUCKET:', {
                        bucket: config.bucket,
                        fileName: fileName,
                        error: error.message,
                        statusCode: error.statusCode || 'N/A',
                        suggestion: 'Verificar que el bucket existe y tiene permisos correctos'
                    });
                    console.log('🚨 Bucket "' + config.bucket + '" no encontrado o sin permisos');
                } else if (error.message.includes('400') || error.status === 400) {
                    console.error('🚨 ERROR 400 BAD REQUEST - Posible problema de autenticación o permisos:', {
                        bucket: config.bucket,
                        fileName: fileName,
                        fileType: file.type,
                        error: error.message,
                        authStatus: this.supabaseUser ? 'Autenticado' : 'NO autenticado'
                    });
                } else if (error.message.includes('401') || error.status === 401) {
                    console.error('🔑 ERROR 401 UNAUTHORIZED - Usuario no autenticado correctamente');
                } else if (error.message.includes('403') || error.status === 403) {
                    console.error('🚫 ERROR 403 FORBIDDEN - Sin permisos para este bucket');
                } else if (error.message.includes('404') || error.status === 404) {
                    console.error('🔍 ERROR 404 NOT FOUND - Bucket no existe o URL incorrecta');
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
}

// Función global para asegurar autenticación en Supabase
window.ensureSupabaseAuth = async function() {
    try {
        if (window.fileUploadManager) {
            await window.fileUploadManager.verifySupabaseAuth();
            
            if (!window.fileUploadManager.supabaseUser) {
                console.log('🔑 Usuario no autenticado, intentando autenticar...');
                const success = await window.fileUploadManager.tryAuthenticateUser();
                
                if (success) {
                    console.log('✅ Autenticación automática exitosa');
                    return true;
                } else {
                    console.warn('⚠️ No se pudo autenticar automáticamente');
                    return false;
                }
            } else {
                console.log('✅ Usuario ya autenticado en Supabase');
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('❌ Error en ensureSupabaseAuth:', error);
        return false;
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.fileUploadManager = new FileUploadManager();
    
    // Intentar autenticación automática después de un breve retraso
    setTimeout(async () => {
        console.log('🔑 Verificando autenticación automática en Supabase...');
        await window.ensureSupabaseAuth();
    }, 2000);
    
    // Escuchar cambios en localStorage para autenticar cuando el usuario haga login
    window.addEventListener('storage', async (e) => {
        if (e.key === 'currentUser' && e.newValue) {
            console.log('🔑 Nuevo login detectado, autenticando en Supabase...');
            await window.ensureSupabaseAuth();
        }
    });
    
    // También verificar periódicamente la autenticación
    setInterval(async () => {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser && window.fileUploadManager && !window.fileUploadManager.supabaseUser) {
            console.log('🔑 Verificación periódica - reintentando autenticación...');
            await window.ensureSupabaseAuth();
        }
    }, 30000); // Cada 30 segundos
});

// Exportar para uso global
window.FileUploadManager = FileUploadManager;
