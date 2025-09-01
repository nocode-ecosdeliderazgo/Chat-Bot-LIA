/* ===== GESTOR DE PERFIL DE USUARIO ===== */
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.profileData = null;
        this.isLoading = false;
        this.hasChanges = false;
        this.init();
    }

    async init() {
        try {
            await this.loadCurrentUser();
            await this.loadProfileData();
            this.populateForm();
            this.updateStats();
            this.setupEventListeners();
            this.setupAutoSave();
        } catch (error) {
            console.error('Error inicializando ProfileManager:', error);
            this.showError('Error al cargar el perfil');
        }
    }

    async loadCurrentUser() {
        try {
            // Leer sesión guardada por new-auth
            const raw = localStorage.getItem('currentUser');
            if (!raw) {
                this.showError('Inicia sesión para ver tu perfil');
                window.location.href = 'index.html';
                return;
            }
            const sessionUser = JSON.parse(raw);

            // Obtener perfil desde backend por username o email
            const tryFetch = async () => {
                const attempts = [];
                if (sessionUser.id && !String(sessionUser.id).startsWith('dev-')) attempts.push(`userId=${encodeURIComponent(sessionUser.id)}`);
                if (sessionUser.username) attempts.push(`username=${encodeURIComponent(sessionUser.username)}`);
                if (sessionUser.email) attempts.push(`email=${encodeURIComponent(sessionUser.email)}`);
                for (const q of attempts) {
                    try {
                        const r = await fetch(`/api/profile?${q}`);
                        if (r.ok) return r.json();
                    } catch(_) {}
                }
                // Fallback: construir perfil básico desde localStorage si backend falla
                return {
                    user: {
                        id: sessionUser.id || null,
                        username: sessionUser.username || 'usuario',
                        email: sessionUser.email || '',
                        display_name: sessionUser.display_name || sessionUser.username || '',
                        first_name: '',
                        last_name: '',
                        cargo_rol: 'Usuario',
                        type_rol: 'usuario'
                    }
                };
            };
            const { user: data } = await tryFetch();

            this.currentUser = {
                id: data.id,
                full_name: data.display_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username,
                username: data.username,
                email: data.email,
                cargo_rol: data.cargo_rol || 'Usuario',
                type_rol: data.type_rol || 'usuario',
                profile_picture_url: data.profile_picture_url || null,
                curriculum_url: data.curriculum_url || null,
                created_at: data.created_at,
                last_login_at: data.last_login_at
            };
            this.profileData = {
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                display_name: data.display_name || '',
                phone: data.phone || '',
                bio: data.bio || '',
                location: data.location || ''
            };
            this.updateCurrentProfileDisplay();
        } catch (error) {
            console.error('Error cargando usuario actual:', error);
            throw error;
        }
    }

    async loadProfileData() { /* ya poblado desde loadCurrentUser */ }

    updateCurrentProfileDisplay() {
        if (!this.currentUser) return;

        // Actualizar información del perfil actual
        const fullNameElement = document.getElementById('currentFullName');
        const emailElement = document.getElementById('currentEmail');
        const cargoRolElement = document.getElementById('currentCargoRol');
        const typeRolElement = document.getElementById('currentTypeRol');

        if (fullNameElement) fullNameElement.textContent = this.currentUser.full_name;
        if (emailElement) emailElement.textContent = this.currentUser.email;
        if (cargoRolElement) cargoRolElement.textContent = this.currentUser.cargo_rol;
        if (typeRolElement) typeRolElement.textContent = this.currentUser.type_rol;

        // Actualizar avatar si existe
        if (this.currentUser.profile_picture_url) {
            const avatarImage = document.getElementById('avatarImage');
            if (avatarImage) {
                avatarImage.src = this.currentUser.profile_picture_url;
            }
        }

        // Actualizar curriculum si existe
        if (this.currentUser.curriculum_url) {
            this.updateCurriculumDisplay('Curriculum cargado', this.currentUser.curriculum_url);
        }

        // Mostrar panel de administración si el usuario es administrador
        this.updateAdminPanel();
    }

    updateAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) return;

        // Verificar si el usuario es administrador
        const isAdmin = this.currentUser && 
            (this.currentUser.cargo_rol === 'Administrador' || 
             this.currentUser.cargo_rol === 'administrador' ||
             this.currentUser.type_rol === 'administrador');

        if (isAdmin) {
            console.log('Usuario es administrador, mostrando panel de administración');
            adminPanel.style.display = 'block';
        } else {
            console.log('Usuario no es administrador, ocultando panel de administración');
            adminPanel.style.display = 'none';
        }
    }

    populateForm() {
        if (!this.currentUser || !this.profileData) return;

        // Información básica
        this.setFormValue('username', this.currentUser.username);
        this.setFormValue('email', this.currentUser.email);
        this.setFormValue('typeRol', this.currentUser.type_rol.toLowerCase());

        // Información del perfil
        this.setFormValue('firstName', this.profileData.first_name);
        this.setFormValue('lastName', this.profileData.last_name);
        this.setFormValue('displayName', this.profileData.display_name);
        this.setFormValue('phone', this.profileData.phone);
        this.setFormValue('bio', this.profileData.bio);
        this.setFormValue('location', this.profileData.location);
        this.setFormValue('linkedinUrl', this.currentUser.linkedin_url || '');
        this.setFormValue('githubUrl', this.currentUser.github_url || '');
        this.setFormValue('portfolioUrl', this.currentUser.website_url || '');
    }

    setFormValue(fieldId, value) {
        const element = document.getElementById(fieldId);
        if (element && value) {
            element.value = value;
        }
    }

    async updateStats() {
        const coursesElement = document.getElementById('coursesCount');
        const progressElement = document.getElementById('progressValue');
        const streakElement = document.getElementById('streakValue');

        // Inicial por defecto
        if (coursesElement) coursesElement.textContent = '0';
        if (progressElement) progressElement.textContent = '0%';
        if (streakElement) streakElement.textContent = '0';

        try {
            const supabaseUrl = localStorage.getItem('supabaseUrl');
            const supabaseKey = localStorage.getItem('supabaseAnonKey');
            const userId = this.currentUser?.id;
            if (!supabaseUrl || !supabaseKey || !userId) return;

            // 1) Minutos de la semana actual (lunes-domingo)
            const monday = new Date();
            const day = monday.getDay();
            const diff = (day === 0 ? -6 : 1) - day; // ir al lunes
            monday.setDate(monday.getDate() + diff);
            const from = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());

            const minutesResp = await fetch(`${supabaseUrl}/rest/v1/study_session?user_id=eq.${userId}&started_at=gte.${from.toISOString()}&select=duration_minutes`, {
                headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
            });
            let minutes = 0;
            if (minutesResp.ok) {
                const rows = await minutesResp.json();
                minutes = rows.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
            }

            // 2) Visitas del día (para racha diaria)
            const today = new Date().toISOString().slice(0,10);
            const visitResp = await fetch(`${supabaseUrl}/rest/v1/course_visit?user_id=eq.${userId}&visited_on=eq.${today}&select=visits`, {
                headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
            });
            let todayVisits = 0;
            if (visitResp.ok) {
                const rows = await visitResp.json();
                todayVisits = rows.reduce((sum, r) => sum + (r.visits || 0), 0);
            }

            // 3) Racha: contar días consecutivos hacia atrás con al menos 1 minuto o 1 visita
            let streak = 0;
            for (let i = 0; i < 30; i++) { // mirar hasta 30 días hacia atrás
                const d = new Date(); d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().slice(0,10);

                const dayVisitsResp = await fetch(`${supabaseUrl}/rest/v1/course_visit?user_id=eq.${userId}&visited_on=eq.${dateStr}&select=visits`, {
                    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
                });
                const dayMinutesResp = await fetch(`${supabaseUrl}/rest/v1/study_session?user_id=eq.${userId}&started_at=gte.${dateStr}T00:00:00Z&started_at=lte.${dateStr}T23:59:59Z&select=duration_minutes`, {
                    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
                });
                const v = dayVisitsResp.ok ? (await dayVisitsResp.json()).reduce((s,r)=>s+(r.visits||0),0) : 0;
                const m = dayMinutesResp.ok ? (await dayMinutesResp.json()).reduce((s,r)=>s+(r.duration_minutes||0),0) : 0;
                if (v > 0 || m > 0) streak += 1; else break;
            }

            // 4) Cursos (placeholder: si tienes tabla de inscripciones, cámbialo a real)
            const courses = 2;

            if (coursesElement) coursesElement.textContent = String(courses);
            if (progressElement) progressElement.textContent = `${Math.min(100, Math.round((minutes/30)*100))}%`;
            if (streakElement) streakElement.textContent = String(streak);
        } catch (err) {
            console.warn('[PROFILE] No se pudieron cargar estadísticas reales', err);
        }
    }

    setupEventListeners() {
        // Botón de volver
        const backBtn = document.getElementById('backToCoursesBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'cursos.html';
            });
        }

        // Botón de guardar
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.showConfirmModal();
            });
        }

        // Cambiar foto de perfil - Manejo centralizado para evitar duplicados
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        const avatar = document.getElementById('currentAvatar');
        const profilePictureInput = document.getElementById('profilePicture');
        
        if (profilePictureInput) {
            // Función reutilizable para abrir el file chooser
            const openFileChooser = (event) => {
                // Prevenir propagación para evitar eventos duplicados
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                
                // Verificar que no hay diálogos abiertos
                if (document.querySelector('.password-required-notification') || 
                    document.querySelector('.email-not-confirmed-notification')) {
                    console.log('⚠️ Hay un diálogo abierto, cancelando file chooser');
                    return;
                }
                
                console.log('📸 Abriendo selector de imagen de perfil...');
                profilePictureInput.click();
            };
            
            // Botón "Cambiar foto"
            if (changeAvatarBtn) {
                // Remover listeners previos para evitar duplicados
                const newBtn = changeAvatarBtn.cloneNode(true);
                changeAvatarBtn.parentNode.replaceChild(newBtn, changeAvatarBtn);
                
                newBtn.addEventListener('click', openFileChooser);
            }
            
            // Avatar clickeable
            if (avatar) {
                // Remover listeners previos para evitar duplicados
                const newAvatar = avatar.cloneNode(true);
                avatar.parentNode.replaceChild(newAvatar, avatar);
                
                newAvatar.addEventListener('click', openFileChooser);
            }
        }

        // Subida de archivos
        this.setupFileUploads();

        // Formulario
        const form = document.getElementById('profileForm');
        if (form) {
            form.addEventListener('input', () => {
                this.hasChanges = true;
            });
        }

        // Modal de confirmación
        this.setupModalEvents();
    }

    setupFileUploads() {
        // NOTA: La foto de perfil ahora es manejada completamente por file-upload-manager.js
        // Esto evita duplicación de event listeners y conflictos
        console.log('📝 ProfileManager: file-upload-manager.js se encarga del upload de imágenes');

        // Curriculum
        const curriculumInput = document.getElementById('curriculum');
        const curriculumBtn = document.getElementById('curriculumBtn');
        const curriculumName = document.getElementById('curriculumName');

        if (curriculumInput && curriculumBtn) {
            // Prevenir clics duplicados con flag de protección
            let cvClickInProgress = false;
            
            // Remover listeners previos clonando el elemento
            const newCvBtn = curriculumBtn.cloneNode(true);
            curriculumBtn.parentNode.replaceChild(newCvBtn, curriculumBtn);
            
            newCvBtn.addEventListener('click', (event) => {
                // Prevenir clics duplicados
                if (cvClickInProgress) {
                    console.log('⚠️ Click ya en progreso, ignorando...');
                    event.preventDefault();
                    return;
                }
                
                // VERIFICAR QUE ES UNA ACTIVACIÓN DEL USUARIO
                if (!event.isTrusted) {
                    console.error('❌ Error: File chooser requiere activación del usuario');
                    return;
                }
                
                // Prevenir propagación de eventos
                event.preventDefault();
                event.stopPropagation();
                
                // Verificar que no haya otros diálogos abiertos
                if (document.querySelector('.password-required-notification') || 
                    document.querySelector('.email-not-confirmed-notification')) {
                    console.log('⚠️ Diálogo de notificación abierto, esperando...');
                    return;
                }
                
                cvClickInProgress = true;
                
                try {
                    console.log('📝 Abriendo selector de archivos para CV...');
                    
                    // Usar setTimeout para asegurar que se ejecute en el contexto correcto
                    setTimeout(() => {
                        try {
                            curriculumInput.click();
                        } catch (error) {
                            console.error('❌ Error en setTimeout click:', error);
                        } finally {
                            // Resetear flag después de un tiempo
                            setTimeout(() => {
                                cvClickInProgress = false;
                            }, 1000);
                        }
                    }, 0);
                    
                } catch (error) {
                    console.error('❌ Error abriendo file chooser:', error);
                    cvClickInProgress = false;
                    // No mostrar alert inmediatamente, puede interferir
                    setTimeout(() => {
                        alert('Error al abrir el selector de archivos. Por favor, intenta de nuevo.');
                    }, 100);
                }
            });

            curriculumInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (!this.validateFile(file, 'curriculum')) return;
                if (curriculumName) curriculumName.textContent = file.name;
                try {
                    const url = await this.uploadToServer(file);
                    if (url) {
                        await this.persistPartial({ curriculum_url: url });
                    }
                } catch (err) {
                    this.showError('No se pudo subir el CV');
                }
            });
        }
    }

    async uploadToServer(file) {
        const form = new FormData();
        form.append('file', file);
        const resp = await fetch('/api/profile/upload', { method: 'POST', body: form });
        if (!resp.ok) throw new Error('Upload failed');
        const { url } = await resp.json();
        return url;
    }

    async persistPartial(updates) {
        const body = { ...updates };
        if (this.currentUser?.id) body.id = this.currentUser.id; else body.username = this.currentUser.username;
        try {
            const resp = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!resp.ok) throw new Error('Persist failed');
            const { user } = await resp.json();
            Object.assign(this.currentUser, user);
        } catch (e) {
            // Fallback local: guardar en localStorage cuando el backend no está disponible
            try {
                const KEY = 'user_profile_local';
                const store = JSON.parse(localStorage.getItem(KEY) || '{}');
                const key = this.currentUser?.username || 'usuario';
                store[key] = { ...(store[key] || {}), ...body };
                localStorage.setItem(KEY, JSON.stringify(store));
                Object.assign(this.currentUser, body);
            } catch (_) { /* ignore */ }
        }
    }

    validateFile(file, type) {
        const maxSize = type === 'profile_picture' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB para imagen, 10MB para CV
        const allowedTypes = type === 'profile_picture' 
            ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (file.size > maxSize) {
            this.showError(`El archivo es demasiado grande. Máximo ${type === 'profile_picture' ? '5MB' : '10MB'}`);
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            this.showError(`Tipo de archivo no permitido. ${type === 'profile_picture' ? 'Solo imágenes' : 'Solo PDF y Word'}`);
            return false;
        }

        return true;
    }

    showImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarImage = document.getElementById('avatarImage');
            if (avatarImage) {
                avatarImage.src = e.target.result;
            }
            
            // Actualizar avatares en otras páginas inmediatamente
            if (window.updateProfileAvatars) {
                window.updateProfileAvatars();
            }
        };
        reader.readAsDataURL(file);
    }

    setupModalEvents() {
        const modal = document.getElementById('confirmModal');
        const closeBtn = document.getElementById('closeConfirmModal');
        const cancelBtn = document.getElementById('cancelConfirmBtn');
        const confirmBtn = document.getElementById('confirmSaveBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideConfirmModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideConfirmModal();
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }

        // Cerrar modal al hacer clic fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideConfirmModal();
                }
            });
        }
    }

    showConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async saveProfile() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.hideConfirmModal();

            // Validar formulario
            if (!this.validateForm()) {
                return;
            }

            // Recopilar datos del formulario
            const formData = this.collectFormData();

            // Subir archivos si existen
            await this.uploadFilesAndPersist(formData);

            this.hasChanges = false;
            this.showSuccess('Perfil actualizado correctamente');

        } catch (error) {
            console.error('Error guardando perfil:', error);
            this.showError('Error al guardar el perfil');
        } finally {
            this.isLoading = false;
        }
    }

    validateForm() {
        // Campos presentes en el formulario
        const requiredFields = ['firstName', 'lastName', 'username', 'email'];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field) continue; // si no existe, lo omitimos
            if (!String(field.value || '').trim()) {
                const label = (document.querySelector(`label[for="${fieldId}"]`)?.textContent || fieldId).replace('*','').trim();
                this.showError(`El campo ${label} es obligatorio`);
                field.focus();
                return false;
            }
        }

        // Validar email
        const emailEl = document.getElementById('email');
        if (emailEl) {
            const email = emailEl.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                this.showError('El formato del email no es válido');
                emailEl.focus();
                return false;
            }
        }

        return true;
    }

    collectFormData() {
        const formData = new FormData();
        const getVal = (id) => (document.getElementById(id) ? document.getElementById(id).value : '');
        
        // Información básica
        formData.append('username', getVal('username'));
        formData.append('email', getVal('email'));
        
        // Información del perfil
        formData.append('first_name', getVal('firstName'));
        formData.append('last_name', getVal('lastName'));
        formData.append('display_name', getVal('displayName'));
        formData.append('phone', getVal('phone'));
        formData.append('bio', getVal('bio'));
        formData.append('location', getVal('location'));

        // Archivos (opcionales)
        const profilePictureEl = document.getElementById('profilePicture');
        const curriculumEl = document.getElementById('curriculum');
        const profilePicture = profilePictureEl ? profilePictureEl.files[0] : null;
        const curriculum = curriculumEl ? curriculumEl.files[0] : null;
        if (profilePicture) formData.append('profile_picture', profilePicture);
        if (curriculum) formData.append('curriculum', curriculum);

        return formData;
    }

    async uploadFilesAndPersist(formData) {
        // Construir payload de actualización
        const updates = {
            username: formData.get('username'),
            email: formData.get('email'),
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            display_name: formData.get('display_name') || `${formData.get('first_name') || ''} ${formData.get('last_name') || ''}`.trim(),
            phone: formData.get('phone'),
            bio: formData.get('bio'),
            location: formData.get('location'),
            linkedin_url: document.getElementById('linkedinUrl')?.value || null,
            github_url: document.getElementById('githubUrl')?.value || null,
            website_url: document.getElementById('portfolioUrl')?.value || null
        };

        console.log('Actualizando perfil con datos:', updates);

        let user;
        try {
            // Usar Supabase directamente
            const supabaseUrl = localStorage.getItem('supabaseUrl');
            const supabaseKey = localStorage.getItem('supabaseAnonKey');
            
            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Credenciales de Supabase no encontradas');
            }

            // Importar Supabase si no está disponible
            let supabase;
            if (typeof window.supabase === 'undefined') {
                const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                supabase = createClient(supabaseUrl, supabaseKey);
            } else {
                supabase = window.supabase;
            }

            // Actualizar en Supabase con identificación robusta
            let query = supabase.from('users').update(updates);
            
            // CRUCIAL: Usar identificación robusta para evitar mezclar cuentas
            if (this.currentUser.id && 
                !String(this.currentUser.id).startsWith('dev-') && 
                !String(this.currentUser.id).includes('test')) {
                // Usar ID si es válido y real de BD
                query = query.eq('id', this.currentUser.id);
            } else if (this.currentUser.username) {
                // Usar username como fallback
                query = query.eq('username', this.currentUser.username);
            } else if (this.currentUser.email) {
                // Usar email como último recurso
                query = query.eq('email', this.currentUser.email);
            } else {
                throw new Error('No se puede identificar al usuario actual');
            }
            
            const { data, error } = await query.select();

            if (error) {
                throw error;
            }

            user = data[0];
            console.log('Perfil actualizado en Supabase:', user);

        } catch (err) {
            console.error('Error actualizando en Supabase:', err);
            
            // Fallback local: persistir en localStorage
            const KEY = 'user_profile_local';
            try {
                const store = JSON.parse(localStorage.getItem(KEY) || '{}');
                const key = this.currentUser?.username || updates.username || 'usuario';
                store[key] = { ...(store[key] || {}), ...updates };
                localStorage.setItem(KEY, JSON.stringify(store));
                user = { ...store[key] };
                console.log('Perfil guardado localmente:', user);
            } catch (localErr) {
                console.error('Error guardando localmente:', localErr);
                throw err; // si no podemos guardar localmente, re-lanzamos el error original
            }
        }

        // Refrescar datos locales y UI
        Object.assign(this.profileData, {
            first_name: user.first_name || updates.first_name,
            last_name: user.last_name || updates.last_name,
            display_name: user.display_name || updates.display_name,
            phone: user.phone || updates.phone,
            bio: user.bio || updates.bio,
            location: user.location || updates.location
        });
        
        this.currentUser.email = user.email || updates.email;
        this.currentUser.username = user.username || updates.username;
        if (user.profile_picture_url) this.currentUser.profile_picture_url = user.profile_picture_url;
        if (user.curriculum_url) this.currentUser.curriculum_url = user.curriculum_url;
        this.currentUser.full_name = user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || updates.display_name;
        this.currentUser.linkedin_url = user.linkedin_url || updates.linkedin_url;
        this.currentUser.github_url = user.github_url || updates.github_url;
        this.currentUser.website_url = user.website_url || updates.website_url;
        
        // Actualizar localStorage con los nuevos datos
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        this.updateCurrentProfileDisplay();
        
        // Actualizar avatares en otras páginas si existe la función
        if (window.updateProfileAvatars) {
            window.updateProfileAvatars();
        }
    }

    setupAutoSave() {
        // Auto-guardado deshabilitado para evitar logs repetitivos
        // Los usuarios deben guardar manualmente usando el botón "Guardar"
        console.log('ℹ️ Auto-guardado deshabilitado - usar botón "Guardar" para persistir cambios');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos de la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            background: type === 'success' ? '#10B981' : '#EF4444'
        });

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
    
    // Función global de debug disponible en consola
    window.debugProfile = () => {
        if (window.profileManager) {
            console.log('=== DEBUG PROFILE STATE ===');
            console.log('Current User:', window.profileManager.currentUser);
            console.log('Profile Data:', window.profileManager.profileData);
            console.log('LocalStorage currentUser:', localStorage.getItem('currentUser'));
            
            // Mostrar todas las claves de perfil en localStorage
            const profileKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('profile_')) {
                    profileKeys.push(key);
                }
            }
            console.log('Profile keys in localStorage:', profileKeys);
            console.log('=== END DEBUG ===');
        } else {
            console.log('ProfileManager no está inicializado');
        }
    };
});

// ===== FUNCIONES UTILITARIAS =====

// Función para formatear números
function formatNumber(num) {
    return new Intl.NumberFormat('es-ES').format(num);
}

// Función para formatear fechas
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para validar teléfono
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}
