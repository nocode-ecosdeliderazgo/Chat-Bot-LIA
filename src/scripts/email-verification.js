/**
 * Script para manejo de verificación de email con OTP
 */

class EmailVerification {
    constructor() {
        this.userId = null;
        this.userEmail = null;
        this.isLoading = false;
        this.countdownInterval = null;
        this.countdownTime = 0;
        
        this.init();
    }

    /**
     * Inicializa la página de verificación
     */
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.setupOTPInputs();
        this.startCountdown();
    }

    /**
     * Carga los datos del usuario desde la URL o localStorage
     */
    loadUserData() {
        try {
            // Intentar obtener datos desde URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            this.userId = urlParams.get('userId') || urlParams.get('user_id');
            this.userEmail = urlParams.get('email');

            // Si no están en URL, intentar desde localStorage
            if (!this.userId || !this.userEmail) {
                const userData = localStorage.getItem('pendingVerification');
                if (userData) {
                    const data = JSON.parse(userData);
                    this.userId = data.userId;
                    this.userEmail = data.email;
                }
            }

            // Si aún no hay datos, mostrar error
            if (!this.userId || !this.userEmail) {
                this.showNotification('Error: Datos de verificación no encontrados', 'error');
                setTimeout(() => {
                    window.location.href = 'login/new-auth.html';
                }, 3000);
                return;
            }

            // Mostrar email del usuario
            const emailElement = document.getElementById('userEmail');
            if (emailElement) {
                emailElement.textContent = this.userEmail;
            }

            console.log('📧 Datos de verificación cargados:', {
                userId: this.userId,
                email: this.userEmail
            });

        } catch (error) {
            console.error('❌ Error cargando datos de verificación:', error);
            this.showNotification('Error cargando datos de verificación', 'error');
        }
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Formulario de verificación
        const form = document.getElementById('verificationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleVerification(e));
        }

        // Botón de reenvío
        const resendBtn = document.getElementById('resendBtn');
        if (resendBtn) {
            resendBtn.addEventListener('click', () => this.handleResend());
        }
    }

    /**
     * Configura los inputs de OTP
     */
    setupOTPInputs() {
        const inputs = document.querySelectorAll('.otp-input');
        
        inputs.forEach((input, index) => {
            // Solo permitir números
            input.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
                
                if (value) {
                    input.classList.add('filled');
                    input.classList.remove('error');
                    
                    // Mover al siguiente input
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                } else {
                    input.classList.remove('filled');
                }
            });

            // Manejar backspace
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });

            // Pegar código completo
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text');
                const numbers = pastedData.replace(/\D/g, '').slice(0, 6);
                
                if (numbers.length === 6) {
                    inputs.forEach((input, i) => {
                        input.value = numbers[i] || '';
                        if (numbers[i]) {
                            input.classList.add('filled');
                        }
                    });
                    inputs[inputs.length - 1].focus();
                }
            });
        });
    }

    /**
     * Maneja la verificación del código OTP
     */
    async handleVerification(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const otp = this.getOTPCode();
        
        if (!otp || otp.length !== 6) {
            this.showNotification('Por favor ingresa el código de 6 dígitos', 'warning');
            this.shakeInputs();
            return;
        }

        this.setLoading(true);

        try {
            const response = await fetch('/api/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    otp: otp
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showNotification('¡Email verificado exitosamente!', 'success');
                
                // Limpiar datos de verificación pendiente
                localStorage.removeItem('pendingVerification');
                
                // Redirigir después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'login/new-auth.html?verified=true';
                }, 2000);
                
            } else {
                this.showNotification(result.error || 'Error verificando código', 'error');
                this.shakeInputs();
                this.clearOTPInputs();
            }

        } catch (error) {
            console.error('❌ Error en verificación:', error);
            this.showNotification('Error de conexión. Inténtalo de nuevo.', 'error');
            this.shakeInputs();
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Maneja el reenvío del código
     */
    async handleResend() {
        if (this.isLoading || this.countdownTime > 0) return;

        this.setLoading(true);

        try {
            const response = await fetch('/api/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    email: this.userEmail
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showNotification('Código reenviado. Revisa tu email.', 'success');
                this.startCountdown();
                this.clearOTPInputs();
            } else {
                this.showNotification(result.error || 'Error reenviando código', 'error');
            }

        } catch (error) {
            console.error('❌ Error reenviando código:', error);
            this.showNotification('Error de conexión. Inténtalo de nuevo.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Obtiene el código OTP de los inputs
     */
    getOTPCode() {
        const inputs = document.querySelectorAll('.otp-input');
        return Array.from(inputs).map(input => input.value).join('');
    }

    /**
     * Limpia los inputs de OTP
     */
    clearOTPInputs() {
        const inputs = document.querySelectorAll('.otp-input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled', 'error');
        });
        inputs[0].focus();
    }

    /**
     * Aplica efecto de shake a los inputs
     */
    shakeInputs() {
        const inputs = document.querySelectorAll('.otp-input');
        inputs.forEach(input => {
            input.classList.add('error');
            input.classList.remove('filled');
        });
    }

    /**
     * Establece el estado de carga
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        const verifyBtn = document.getElementById('verifyBtn');
        const resendBtn = document.getElementById('resendBtn');
        const inputs = document.querySelectorAll('.otp-input');
        const btnText = verifyBtn?.querySelector('.btn-text');
        const spinner = verifyBtn?.querySelector('.loading-spinner');
        
        if (verifyBtn) {
            verifyBtn.disabled = loading;
        }
        
        if (btnText) {
            btnText.style.display = loading ? 'none' : 'inline';
        }
        
        if (spinner) {
            spinner.style.display = loading ? 'inline-block' : 'none';
        }
        
        if (resendBtn) {
            resendBtn.disabled = loading || this.countdownTime > 0;
        }
        
        inputs.forEach(input => {
            input.disabled = loading;
        });
    }

    /**
     * Inicia el countdown para reenvío
     */
    startCountdown() {
        this.countdownTime = 60; // 60 segundos
        this.updateCountdownDisplay();
        
        this.countdownInterval = setInterval(() => {
            this.countdownTime--;
            this.updateCountdownDisplay();
            
            if (this.countdownTime <= 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.hideCountdown();
            }
        }, 1000);
    }

    /**
     * Actualiza la visualización del countdown
     */
    updateCountdownDisplay() {
        const countdownElement = document.getElementById('countdown');
        const timerElement = document.getElementById('countdownTimer');
        const resendBtn = document.getElementById('resendBtn');
        
        if (countdownElement && timerElement) {
            const minutes = Math.floor(this.countdownTime / 60);
            const seconds = this.countdownTime % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            countdownElement.style.display = 'block';
        }
        
        if (resendBtn) {
            resendBtn.disabled = this.countdownTime > 0 || this.isLoading;
        }
    }

    /**
     * Oculta el countdown
     */
    hideCountdown() {
        const countdownElement = document.getElementById('countdown');
        const resendBtn = document.getElementById('resendBtn');
        
        if (countdownElement) {
            countdownElement.style.display = 'none';
        }
        
        if (resendBtn) {
            resendBtn.disabled = this.isLoading;
        }
    }

    /**
     * Muestra una notificación
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
        `;

        container.appendChild(notification);

        // Mostrar la notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new EmailVerification();
});

// También ejecutar inmediatamente para páginas que ya están cargadas
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new EmailVerification();
    });
} else {
    new EmailVerification();
}
