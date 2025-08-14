// Settings Component
// Handles system configuration and settings management

class Settings {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.settings = {};
        this.currentTab = 'general';
        this.unsavedChanges = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab switching
        this.setupTabSwitching();
        
        // Form change detection
        this.setupChangeDetection();
        
        // Auto-save
        this.setupAutoSave();
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    setupChangeDetection() {
        // Monitor form changes to show unsaved indicator
        document.addEventListener('change', (e) => {
            if (e.target.closest('#settingsContent')) {
                this.markUnsavedChanges();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.closest('#settingsContent')) {
                this.markUnsavedChanges();
            }
        });
    }

    setupAutoSave() {
        // Auto-save every 30 seconds if there are changes
        setInterval(() => {
            if (this.unsavedChanges) {
                this.saveSettings(true); // Silent save
            }
        }, 30000);
    }

    async load() {
        try {
            await this.loadSettings();
            this.renderCurrentTab();
        } catch (error) {
            console.error('Error loading settings:', error);
            this.adminPanel.showToast('Error al cargar las configuraciones', 'error');
        }
    }

    async loadSettings() {
        try {
            const response = await this.adminPanel.apiCall('/api/admin/settings');
            this.settings = response.settings;
        } catch (error) {
            console.error('Error loading settings:', error);
            throw error;
        }
    }

    switchTab(tabName) {
        // Update active tab button
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        this.currentTab = tabName;
        this.renderCurrentTab();
    }

    renderCurrentTab() {
        const container = document.getElementById('settingsContent');
        if (!container) return;

        switch (this.currentTab) {
            case 'general':
                this.renderGeneralSettings(container);
                break;
            case 'chat':
                this.renderChatSettings(container);
                break;
            case 'security':
                this.renderSecuritySettings(container);
                break;
            case 'email':
                this.renderEmailSettings(container);
                break;
            default:
                container.innerHTML = '<p>Sección no encontrada</p>';
        }
    }

    renderGeneralSettings(container) {
        container.innerHTML = `
            <form id="generalSettingsForm" class="settings-form">
                <div class="settings-section">
                    <h3>Información General del Sitio</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Nombre del Sitio *</label>
                        <input type="text" class="form-input" name="siteName" 
                               value="${this.settings.siteName || 'Chat-Bot-LIA'}" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Descripción del Sitio</label>
                        <textarea class="form-textarea" name="siteDescription" rows="3"
                                  placeholder="Descripción que aparecerá en los motores de búsqueda">${this.settings.siteDescription || ''}</textarea>
                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">URL del Sitio</label>
                            <input type="url" class="form-input" name="siteUrl" 
                                   value="${this.settings.siteUrl || ''}" placeholder="https://ejemplo.com">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Zona Horaria</label>
                            <select class="form-select" name="timezone">
                                ${this.generateTimezoneOptions()}
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Logo del Sitio</label>
                        <input type="file" class="form-input" name="siteLogo" accept="image/*">
                        ${this.settings.siteLogo ? `
                            <div class="current-logo">
                                <img src="${this.settings.siteLogo}" alt="Logo actual" style="max-height: 60px;">
                                <button type="button" class="btn btn-small btn-danger" onclick="settings.removeLogo()">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    <div class="form-group">
                        <label class="form-label">Favicon</label>
                        <input type="file" class="form-input" name="favicon" accept=".ico,.png,.svg">
                        ${this.settings.favicon ? `
                            <div class="current-favicon">
                                <img src="${this.settings.favicon}" alt="Favicon actual" style="width: 32px; height: 32px;">
                                <button type="button" class="btn btn-small btn-danger" onclick="settings.removeFavicon()">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Información de Contacto</h3>
                    
                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">Email de Contacto</label>
                            <input type="email" class="form-input" name="contactEmail" 
                                   value="${this.settings.contactEmail || ''}">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Teléfono de Contacto</label>
                            <input type="tel" class="form-input" name="contactPhone" 
                                   value="${this.settings.contactPhone || ''}">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Dirección</label>
                        <textarea class="form-textarea" name="contactAddress" rows="2">${this.settings.contactAddress || ''}</textarea>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Redes Sociales</h3>
                    
                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">Facebook</label>
                            <input type="url" class="form-input" name="socialFacebook" 
                                   value="${this.settings.socialFacebook || ''}" placeholder="https://facebook.com/tupagina">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Twitter</label>
                            <input type="url" class="form-input" name="socialTwitter" 
                                   value="${this.settings.socialTwitter || ''}" placeholder="https://twitter.com/tuusuario">
                        </div>
                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">LinkedIn</label>
                            <input type="url" class="form-input" name="socialLinkedin" 
                                   value="${this.settings.socialLinkedin || ''}" placeholder="https://linkedin.com/company/tuempresa">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Instagram</label>
                            <input type="url" class="form-input" name="socialInstagram" 
                                   value="${this.settings.socialInstagram || ''}" placeholder="https://instagram.com/tuusuario">
                        </div>
                    </div>
                </div>

                <div class="settings-actions">
                    <button type="button" class="btn btn-secondary" onclick="settings.resetSettings()">
                        <i class="fas fa-undo"></i>
                        Restablecer
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        Guardar Cambios
                    </button>
                </div>
            </form>
        `;

        this.setupFormHandler('generalSettingsForm');
    }

    renderChatSettings(container) {
        container.innerHTML = `
            <form id="chatSettingsForm" class="settings-form">
                <div class="settings-section">
                    <h3>Configuración del Chat Bot</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Mensaje de Bienvenida</label>
                        <textarea class="form-textarea" name="chatWelcomeMessage" rows="4"
                                  placeholder="Mensaje que aparecerá cuando los usuarios inicien el chat">${this.settings.chatWelcomeMessage || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Nombre del Asistente</label>
                        <input type="text" class="form-input" name="chatAssistantName" 
                               value="${this.settings.chatAssistantName || 'Asistente IA'}"
                               placeholder="Nombre que mostrará el bot">
                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">Límite de Mensajes por Sesión</label>
                            <input type="number" class="form-input" name="chatMessageLimit" 
                                   value="${this.settings.chatMessageLimit || 50}" min="1" max="1000">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Tiempo de Inactividad (minutos)</label>
                            <input type="number" class="form-input" name="chatInactivityTimeout" 
                                   value="${this.settings.chatInactivityTimeout || 30}" min="1" max="120">
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Configuración de IA</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Modelo de IA</label>
                        <select class="form-select" name="aiModel">
                            <option value="gpt-4" ${this.settings.aiModel === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
                            <option value="gpt-3.5-turbo" ${this.settings.aiModel === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo</option>
                            <option value="claude-3" ${this.settings.aiModel === 'claude-3' ? 'selected' : ''}>Claude 3</option>
                        </select>
                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">Temperatura (Creatividad)</label>
                            <input type="range" class="form-range" name="aiTemperature" 
                                   min="0" max="1" step="0.1" value="${this.settings.aiTemperature || 0.7}">
                            <span class="range-value">${this.settings.aiTemperature || 0.7}</span>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Máximo de Tokens</label>
                            <input type="number" class="form-input" name="aiMaxTokens" 
                                   value="${this.settings.aiMaxTokens || 2000}" min="100" max="4000">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Prompt del Sistema</label>
                        <textarea class="form-textarea" name="aiSystemPrompt" rows="6"
                                  placeholder="Instrucciones que definen el comportamiento del asistente">${this.settings.aiSystemPrompt || ''}</textarea>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Características del Chat</h3>
                    
                    <div class="checkbox-group">
                        <label class="form-label">
                            <input type="checkbox" name="chatEnableVoice" 
                                   ${this.settings.chatEnableVoice ? 'checked' : ''}>
                            Habilitar mensajes de voz
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="chatEnableFileUpload" 
                                   ${this.settings.chatEnableFileUpload ? 'checked' : ''}>
                            Permitir subida de archivos
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="chatEnableHistory" 
                                   ${this.settings.chatEnableHistory !== false ? 'checked' : ''}>
                            Guardar historial de conversaciones
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="chatShowTypingIndicator" 
                                   ${this.settings.chatShowTypingIndicator !== false ? 'checked' : ''}>
                            Mostrar indicador de escritura
                        </label>
                    </div>
                </div>

                <div class="settings-actions">
                    <button type="button" class="btn btn-secondary" onclick="settings.testChatBot()">
                        <i class="fas fa-play"></i>
                        Probar Chat Bot
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        Guardar Cambios
                    </button>
                </div>
            </form>
        `;

        this.setupFormHandler('chatSettingsForm');
        this.setupRangeInputs();
    }

    renderSecuritySettings(container) {
        container.innerHTML = `
            <form id="securitySettingsForm" class="settings-form">
                <div class="settings-section">
                    <h3>Política de Contraseñas</h3>
                    
                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">Longitud Mínima</label>
                            <input type="number" class="form-input" name="passwordMinLength" 
                                   value="${this.settings.passwordMinLength || 8}" min="6" max="32">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Intentos de Login Máximos</label>
                            <input type="number" class="form-input" name="maxLoginAttempts" 
                                   value="${this.settings.maxLoginAttempts || 5}" min="3" max="10">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tiempo de Bloqueo (minutos)</label>
                        <input type="number" class="form-input" name="lockoutDuration" 
                               value="${this.settings.lockoutDuration || 15}" min="5" max="60">
                    </div>

                    <div class="checkbox-group">
                        <label class="form-label">
                            <input type="checkbox" name="passwordRequireUppercase" 
                                   ${this.settings.passwordRequireUppercase ? 'checked' : ''}>
                            Requerir mayúsculas
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="passwordRequireLowercase" 
                                   ${this.settings.passwordRequireLowercase ? 'checked' : ''}>
                            Requerir minúsculas
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="passwordRequireNumbers" 
                                   ${this.settings.passwordRequireNumbers ? 'checked' : ''}>
                            Requerir números
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="passwordRequireSpecial" 
                                   ${this.settings.passwordRequireSpecial ? 'checked' : ''}>
                            Requerir caracteres especiales
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Autenticación de Dos Factores</h3>
                    
                    <div class="checkbox-group">
                        <label class="form-label">
                            <input type="checkbox" name="enable2FA" 
                                   ${this.settings.enable2FA ? 'checked' : ''}>
                            Habilitar autenticación de dos factores
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="require2FAForAdmins" 
                                   ${this.settings.require2FAForAdmins ? 'checked' : ''}>
                            Obligatorio para administradores
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tiempo de Validez del Token (segundos)</label>
                        <input type="number" class="form-input" name="tokenValidityPeriod" 
                               value="${this.settings.tokenValidityPeriod || 300}" min="30" max="600">
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Configuración de Sesiones</h3>
                    
                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">Duración de Sesión (horas)</label>
                            <input type="number" class="form-input" name="sessionDuration" 
                                   value="${this.settings.sessionDuration || 24}" min="1" max="168">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Tiempo de Inactividad (minutos)</label>
                            <input type="number" class="form-input" name="sessionInactivityTimeout" 
                                   value="${this.settings.sessionInactivityTimeout || 60}" min="5" max="240">
                        </div>
                    </div>

                    <div class="checkbox-group">
                        <label class="form-label">
                            <input type="checkbox" name="enableConcurrentSessions" 
                                   ${this.settings.enableConcurrentSessions ? 'checked' : ''}>
                            Permitir sesiones concurrentes
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="logSessionActivity" 
                                   ${this.settings.logSessionActivity !== false ? 'checked' : ''}>
                            Registrar actividad de sesiones
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Configuración de CORS y Seguridad</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Dominios Permitidos (uno por línea)</label>
                        <textarea class="form-textarea" name="allowedOrigins" rows="4"
                                  placeholder="https://ejemplo.com&#10;https://otro-dominio.com">${(this.settings.allowedOrigins || []).join('\n')}</textarea>
                    </div>

                    <div class="checkbox-group">
                        <label class="form-label">
                            <input type="checkbox" name="enableCSRFProtection" 
                                   ${this.settings.enableCSRFProtection !== false ? 'checked' : ''}>
                            Habilitar protección CSRF
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="enableRateLimiting" 
                                   ${this.settings.enableRateLimiting !== false ? 'checked' : ''}>
                            Habilitar limitación de velocidad
                        </label>
                    </div>
                </div>

                <div class="settings-actions">
                    <button type="button" class="btn btn-secondary" onclick="settings.testSecuritySettings()">
                        <i class="fas fa-shield-alt"></i>
                        Probar Configuración
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        Guardar Cambios
                    </button>
                </div>
            </form>
        `;

        this.setupFormHandler('securitySettingsForm');
    }

    renderEmailSettings(container) {
        container.innerHTML = `
            <form id="emailSettingsForm" class="settings-form">
                <div class="settings-section">
                    <h3>Configuración SMTP</h3>
                    
                    <div class="form-row" style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">Servidor SMTP *</label>
                            <input type="text" class="form-input" name="smtpHost" 
                                   value="${this.settings.smtpHost || ''}" placeholder="smtp.gmail.com" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Puerto *</label>
                            <input type="number" class="form-input" name="smtpPort" 
                                   value="${this.settings.smtpPort || 587}" min="1" max="65535" required>
                        </div>
                    </div>

                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">Usuario SMTP *</label>
                            <input type="email" class="form-input" name="smtpUser" 
                                   value="${this.settings.smtpUser || ''}" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Contraseña SMTP *</label>
                            <input type="password" class="form-input" name="smtpPassword" 
                                   value="${this.settings.smtpPassword || ''}" required>
                        </div>
                    </div>

                    <div class="checkbox-group">
                        <label class="form-label">
                            <input type="checkbox" name="smtpSecure" 
                                   ${this.settings.smtpSecure ? 'checked' : ''}>
                            Usar conexión segura (TLS/SSL)
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Configuración de Email</h3>
                    
                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label class="form-label">Email Remitente *</label>
                            <input type="email" class="form-input" name="fromEmail" 
                                   value="${this.settings.fromEmail || ''}" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Nombre Remitente</label>
                            <input type="text" class="form-input" name="fromName" 
                                   value="${this.settings.fromName || 'Chat-Bot-LIA'}">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Email de Respuesta</label>
                        <input type="email" class="form-input" name="replyToEmail" 
                               value="${this.settings.replyToEmail || ''}">
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Plantillas de Email</h3>
                    
                    <div class="template-tabs">
                        <button type="button" class="template-tab active" data-template="welcome">Bienvenida</button>
                        <button type="button" class="template-tab" data-template="passwordReset">Reseteo de Contraseña</button>
                        <button type="button" class="template-tab" data-template="notification">Notificación</button>
                    </div>

                    <div class="template-editor" id="emailTemplateEditor">
                        <div class="form-group">
                            <label class="form-label">Asunto</label>
                            <input type="text" class="form-input" name="emailSubject" 
                                   value="${this.settings.emailTemplates?.welcome?.subject || 'Bienvenido a Chat-Bot-LIA'}">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Contenido HTML</label>
                            <textarea class="form-textarea" name="emailContent" rows="10"
                                      placeholder="Contenido del email en HTML">${this.settings.emailTemplates?.welcome?.content || ''}</textarea>
                        </div>

                        <div class="template-variables">
                            <h5>Variables disponibles:</h5>
                            <div class="variables-list">
                                <span class="variable">{{userName}}</span>
                                <span class="variable">{{userEmail}}</span>
                                <span class="variable">{{siteName}}</span>
                                <span class="variable">{{siteUrl}}</span>
                                <span class="variable">{{resetLink}}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Notificaciones Automáticas</h3>
                    
                    <div class="checkbox-group">
                        <label class="form-label">
                            <input type="checkbox" name="sendWelcomeEmail" 
                                   ${this.settings.sendWelcomeEmail !== false ? 'checked' : ''}>
                            Enviar email de bienvenida a nuevos usuarios
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="sendPasswordResetEmail" 
                                   ${this.settings.sendPasswordResetEmail !== false ? 'checked' : ''}>
                            Enviar email de restablecimiento de contraseña
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="sendNotificationEmails" 
                                   ${this.settings.sendNotificationEmails !== false ? 'checked' : ''}>
                            Enviar emails de notificación
                        </label>
                        <label class="form-label">
                            <input type="checkbox" name="sendAdminAlerts" 
                                   ${this.settings.sendAdminAlerts ? 'checked' : ''}>
                            Enviar alertas a administradores
                        </label>
                    </div>
                </div>

                <div class="settings-actions">
                    <button type="button" class="btn btn-secondary" onclick="settings.testEmailConfiguration()">
                        <i class="fas fa-envelope"></i>
                        Probar Configuración
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        Guardar Cambios
                    </button>
                </div>
            </form>
        `;

        this.setupFormHandler('emailSettingsForm');
        this.setupEmailTemplateEditor();
    }

    setupFormHandler(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }
    }

    setupRangeInputs() {
        const ranges = document.querySelectorAll('.form-range');
        ranges.forEach(range => {
            const valueSpan = range.nextElementSibling;
            range.addEventListener('input', (e) => {
                if (valueSpan && valueSpan.classList.contains('range-value')) {
                    valueSpan.textContent = e.target.value;
                }
            });
        });
    }

    setupEmailTemplateEditor() {
        const tabs = document.querySelectorAll('.template-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const templateType = tab.dataset.template;
                this.switchEmailTemplate(templateType);
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    switchEmailTemplate(templateType) {
        const editor = document.getElementById('emailTemplateEditor');
        const template = this.settings.emailTemplates?.[templateType] || {};
        
        const subjectInput = editor.querySelector('[name="emailSubject"]');
        const contentTextarea = editor.querySelector('[name="emailContent"]');
        
        if (subjectInput) {
            subjectInput.value = template.subject || '';
        }
        
        if (contentTextarea) {
            contentTextarea.value = template.content || '';
        }
    }

    generateTimezoneOptions() {
        const timezones = [
            'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
            'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
            'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Mumbai', 'Australia/Sydney'
        ];
        
        return timezones.map(tz => 
            `<option value="${tz}" ${this.settings.timezone === tz ? 'selected' : ''}>${tz}</option>`
        ).join('');
    }

    markUnsavedChanges() {
        this.unsavedChanges = true;
        
        // Update save button
        const saveButtons = document.querySelectorAll('.settings-actions .btn-primary');
        saveButtons.forEach(button => {
            button.classList.add('has-changes');
            if (!button.textContent.includes('*')) {
                button.innerHTML = button.innerHTML + ' *';
            }
        });
    }

    clearUnsavedChanges() {
        this.unsavedChanges = false;
        
        // Update save buttons
        const saveButtons = document.querySelectorAll('.settings-actions .btn-primary');
        saveButtons.forEach(button => {
            button.classList.remove('has-changes');
            button.innerHTML = button.innerHTML.replace(' *', '');
        });
    }

    async saveSettings(silent = false) {
        try {
            if (!silent) {
                this.adminPanel.showLoading('Guardando configuraciones...');
            }

            const form = document.querySelector('.settings-form');
            const formData = new FormData(form);
            const settings = {};

            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                // Handle checkboxes
                if (form.querySelector(`[name="${key}"]`).type === 'checkbox') {
                    settings[key] = true;
                } else {
                    settings[key] = value;
                }
            }

            // Handle unchecked checkboxes
            const checkboxes = form.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    settings[checkbox.name] = false;
                }
            });

            // Handle special cases
            if (settings.allowedOrigins) {
                settings.allowedOrigins = settings.allowedOrigins.split('\n').filter(origin => origin.trim());
            }

            await this.adminPanel.apiCall('/api/admin/settings', {
                method: 'PUT',
                body: JSON.stringify({ settings })
            });

            this.settings = { ...this.settings, ...settings };
            
            if (!silent) {
                this.adminPanel.hideLoading();
                this.adminPanel.showToast('Configuraciones guardadas exitosamente', 'success');
            }
            
            this.clearUnsavedChanges();

        } catch (error) {
            console.error('Error saving settings:', error);
            if (!silent) {
                this.adminPanel.hideLoading();
                this.adminPanel.showToast('Error al guardar las configuraciones', 'error');
            }
        }
    }

    async resetSettings() {
        this.adminPanel.showConfirmModal(
            '¿Estás seguro de que deseas restablecer todas las configuraciones? Se perderán los cambios no guardados.',
            async () => {
                try {
                    this.adminPanel.showLoading('Restableciendo configuraciones...');
                    
                    await this.adminPanel.apiCall('/api/admin/settings/reset', {
                        method: 'POST'
                    });
                    
                    await this.loadSettings();
                    this.renderCurrentTab();
                    
                    this.adminPanel.hideLoading();
                    this.adminPanel.showToast('Configuraciones restablecidas', 'success');
                    
                } catch (error) {
                    console.error('Error resetting settings:', error);
                    this.adminPanel.hideLoading();
                    this.adminPanel.showToast('Error al restablecer las configuraciones', 'error');
                }
            }
        );
    }

    async testChatBot() {
        try {
            this.adminPanel.showLoading('Probando configuración del chat bot...');
            
            const response = await this.adminPanel.apiCall('/api/admin/settings/test-chat', {
                method: 'POST'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Chat bot funcionando correctamente', 'success');
            
        } catch (error) {
            console.error('Error testing chat bot:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error en la configuración del chat bot', 'error');
        }
    }

    async testSecuritySettings() {
        try {
            this.adminPanel.showLoading('Probando configuración de seguridad...');
            
            const response = await this.adminPanel.apiCall('/api/admin/settings/test-security', {
                method: 'POST'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Configuración de seguridad válida', 'success');
            
        } catch (error) {
            console.error('Error testing security settings:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error en la configuración de seguridad', 'error');
        }
    }

    async testEmailConfiguration() {
        try {
            this.adminPanel.showLoading('Probando configuración de email...');
            
            const response = await this.adminPanel.apiCall('/api/admin/settings/test-email', {
                method: 'POST'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Email de prueba enviado correctamente', 'success');
            
        } catch (error) {
            console.error('Error testing email configuration:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error en la configuración de email', 'error');
        }
    }

    async removeLogo() {
        try {
            await this.adminPanel.apiCall('/api/admin/settings/remove-logo', {
                method: 'DELETE'
            });
            
            delete this.settings.siteLogo;
            this.renderCurrentTab();
            this.adminPanel.showToast('Logo eliminado', 'success');
            
        } catch (error) {
            console.error('Error removing logo:', error);
            this.adminPanel.showToast('Error al eliminar el logo', 'error');
        }
    }

    async removeFavicon() {
        try {
            await this.adminPanel.apiCall('/api/admin/settings/remove-favicon', {
                method: 'DELETE'
            });
            
            delete this.settings.favicon;
            this.renderCurrentTab();
            this.adminPanel.showToast('Favicon eliminado', 'success');
            
        } catch (error) {
            console.error('Error removing favicon:', error);
            this.adminPanel.showToast('Error al eliminar el favicon', 'error');
        }
    }

    handleSearchResults(results) {
        // Settings search is not implemented as it's more configuration-based
        this.adminPanel.showToast('Búsqueda no disponible en configuraciones', 'info');
    }

    destroy() {
        // Cleanup
        this.settings = {};
        this.unsavedChanges = false;
    }
}

export default Settings;