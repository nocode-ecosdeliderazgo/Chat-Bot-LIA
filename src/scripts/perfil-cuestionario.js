// ===== SISTEMA DE CUESTIONARIO ADAPTATIVO =====

class ProfileQuestionnaire {
    constructor() {
        this.currentStep = 'profile';
        this.profileData = {};
        this.selectedProfile = null;
        this.overrideProfile = null;
        this.finalProfile = null;
        
        this.init();
    }

    init() {
        this.initializeParticles();
        this.bindEvents();
        this.setupAnimations();
        this.guardByUserRole();
    }

    initializeParticles() {
        // Inicializar sistema de partículas si existe
        const particlesContainer = document.querySelector('.particles-container');
        if (particlesContainer && typeof ParticleSystem !== 'undefined') {
            new ParticleSystem(particlesContainer);
        }
    }

    async guardByUserRole() {
        try {
            if (!window.supabase) {
                console.warn('[Guard] Supabase no disponible; no se puede validar type_rol.');
                return;
            }
            const { data: { session }, error: sessErr } = await window.supabase.auth.getSession();
            if (sessErr) { console.warn('[Guard] Error sesión:', sessErr); return; }
            if (!session || !session.user) { return; }

            const userId = session.user.id;
            const { data, error } = await window.supabase
                .from('users')
                .select('type_rol')
                .eq('id', userId)
                .single();

            if (error) { console.warn('[Guard] Error consultando users.type_rol:', error); return; }

            const typeRol = (data && data.type_rol) ? String(data.type_rol).trim() : '';
            if (typeRol) {
                // Ya tiene rol -> redirigir a la página principal de cursos (es/)
                window.location.replace('cursos.html');
            }
        } catch (err) {
            console.warn('[Guard] Excepción:', err);
        }
    }

    bindEvents() {
        // Formulario de perfil
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        }

        // Botón de override
        const toggleOverride = document.getElementById('toggleOverride');
        if (toggleOverride) {
            toggleOverride.addEventListener('click', () => this.toggleOverrideOptions());
        }

        // Opciones de override
        const profileOptions = document.querySelectorAll('.profile-option');
        profileOptions.forEach(option => {
            option.addEventListener('click', (e) => this.selectOverrideProfile(e));
        });

        // Navegación
        const startQuestionnaire = document.getElementById('startQuestionnaire');
        if (startQuestionnaire) {
            startQuestionnaire.addEventListener('click', () => this.startQuestionnaire());
        }

        const backToForm = document.getElementById('backToForm');
        if (backToForm) {
            backToForm.addEventListener('click', () => this.backToForm());
        }
    }

    setupAnimations() {
        // Configurar animaciones de entrada
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    handleProfileSubmit(e) {
        e.preventDefault();
        
        // Recopilar datos del formulario
        const formData = new FormData(e.target);
        this.profileData = {
            cargo: formData.get('cargo'),
            area: formData.get('area'),
            nivel: formData.get('nivel'),
            relacion: formData.get('relacion'),
            sector: formData.get('sector') || '',
            tamano: formData.get('tamano') || ''
        };

        // Calcular perfil seleccionado
        this.selectedProfile = this.calculateProfile(this.profileData);
        
        // Mostrar resumen
        this.showSummary();
    }

    calculateProfile(data) {
        const { cargo, area, nivel, relacion } = data;
        const cargoLower = (cargo || '').toLowerCase();

        // 1) Prioridad por tipo de relación (prioridad absoluta)
        if (relacion === 'Freelancer / Independiente') return 'Freelancer';
        if (relacion === 'Consultor(a) externo') return 'Consultor';

        // 2) Altos mandos por palabras clave en cargo (según PROMPT_CLAUDE.md)
        if (/(ceo|director general|dirección general|fundador|propietari)/.test(cargoLower)) return 'CEO';
        if (/(cto|cio|dir(ector)? de (ti|tecnolog|sistemas)|dir(ector)? tecnolog|dir(ector)? sistemas)/.test(cargoLower)) return 'CTO/CIO';
        if (/(cfo|dir(ector)? de finanzas|daf|dir(ector)? administraci[oó]n)/.test(cargoLower)) return 'Dirección de Finanzas (CFO)';
        if (/(chro|dir(ector)? de (recursos humanos|rrhh)|dir(ector)? capital humano)/.test(cargoLower)) return 'Dirección de RRHH';
        if (/(coo|dir(ector)? de operaciones)/.test(cargoLower)) return 'Dirección de Operaciones';
        if (/(cmo|dir(ector)? de (marketing|mercadotecnia))/.test(cargoLower)) return 'Dirección de Marketing';
        if (/(cso|dir(ector)? de ventas|dirección comercial|dir(ector)? comercial)/.test(cargoLower)) return 'Dirección de Ventas';
        if (/(cpo|dir(ector)? de compras|dir(ector)? abastec|dir(ector)? procure|supply chain|dir(ector)? supply)/.test(cargoLower)) return 'Dirección de Compras / Supply';
        if (/(controller|contralor|jef(e|atura) de contabilidad)/.test(cargoLower)) return 'Dirección/Jefatura de Contabilidad';

        // 3) Nivel + Área (si no calificó en 2)
        if (nivel === 'Dirección de Área') {
            switch (area) {
                case 'Ventas': return 'Dirección de Ventas';
                case 'Marketing': return 'Dirección de Marketing';
                case 'Operaciones': return 'Dirección de Operaciones';
                case 'Finanzas': return 'Dirección de Finanzas (CFO)';
                case 'RRHH': return 'Dirección de RRHH';
                case 'Contabilidad': return 'Dirección/Jefatura de Contabilidad';
                case 'Compras/Supply': return 'Dirección de Compras / Supply';
                case 'Tecnología/TI': return 'CTO/CIO';
            }
        }

        if (nivel === 'Gerencia') return 'Gerencia Media';

        if (nivel === 'Miembro/Colaborador') {
            switch (area) {
                case 'Ventas': return 'Miembros de Ventas';
                case 'Marketing': return 'Miembros de Marketing';
                case 'Operaciones': return 'Miembros de Operaciones';
                case 'Finanzas': return 'Miembros de Finanzas';
                case 'RRHH': return 'Miembros de RRHH';
                case 'Contabilidad': return 'Miembros de Contabilidad';
                case 'Compras/Supply': return 'Miembros de Compras';
            }
        }

        // 4) Fallback: si sigue ambiguo
        return relacion === 'Empleado(a)' ? 'Gerencia Media' : 'Freelancer';
    }

    showSummary() {
        // Ocultar formulario y mostrar resumen
        const stepProfile = document.getElementById('step-profile');
        const stepSummary = document.getElementById('step-summary');
        
        if (stepProfile) stepProfile.classList.remove('active');
        if (stepSummary) stepSummary.classList.add('active');

        // Actualizar contenido del resumen
        this.updateSummaryDisplay();
        
        this.currentStep = 'summary';
    }

    updateSummaryDisplay() {
        const profile = this.overrideProfile || this.selectedProfile;
        this.finalProfile = profile;

        // Actualizar título del perfil
        const selectedProfileEl = document.getElementById('selectedProfile');
        if (selectedProfileEl) {
            selectedProfileEl.textContent = profile;
        }

        // Actualizar descripción
        const profileDescriptionEl = document.getElementById('profileDescription');
        if (profileDescriptionEl) {
            profileDescriptionEl.textContent = this.getProfileDescription(profile);
        }

        // Actualizar detalles
        document.getElementById('summaryCargoValue').textContent = this.profileData.cargo;
        document.getElementById('summaryAreaValue').textContent = this.profileData.area;
        document.getElementById('summaryNivelValue').textContent = this.profileData.nivel;
        document.getElementById('summaryRelacionValue').textContent = this.profileData.relacion;

        // Actualizar estado de override
        const profileOptions = document.querySelectorAll('.profile-option');
        profileOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.profile === this.overrideProfile) {
                option.classList.add('selected');
            }
        });
    }

    getProfileDescription(profile) {
        const descriptions = {
            'CEO': 'Cuestionario enfocado en liderazgo estratégico y transformación organizacional',
            'CTO/CIO': 'Cuestionario especializado en tecnología y transformación digital',
            'Dirección de Ventas': 'Cuestionario para líderes de equipos comerciales y estrategia de ventas',
            'Miembros de Ventas': 'Cuestionario para profesionales en roles de ventas y desarrollo comercial',
            'Dirección de Marketing': 'Cuestionario para líderes de marketing y estrategia de marca',
            'Miembros de Marketing': 'Cuestionario para profesionales en marketing y comunicación',
            'Dirección de Operaciones': 'Cuestionario para líderes operacionales y gestión de procesos',
            'Miembros de Operaciones': 'Cuestionario para profesionales en operaciones y logística',
            'Dirección de Finanzas (CFO)': 'Cuestionario para líderes financieros y gestión económica',
            'Miembros de Finanzas': 'Cuestionario para profesionales en finanzas y análisis económico',
            'Dirección de RRHH': 'Cuestionario para líderes de recursos humanos y gestión del talento',
            'Miembros de RRHH': 'Cuestionario para profesionales en recursos humanos y desarrollo organizacional',
            'Dirección/Jefatura de Contabilidad': 'Cuestionario para líderes contables y gestión fiscal',
            'Miembros de Contabilidad': 'Cuestionario para profesionales en contabilidad y auditoría',
            'Dirección de Compras / Supply': 'Cuestionario para líderes en compras y cadena de suministro',
            'Miembros de Compras': 'Cuestionario para profesionales en compras y procurement',
            'Gerencia Media': 'Cuestionario general para profesionales en roles de gestión',
            'Freelancer': 'Cuestionario especializado para profesionales independientes',
            'Consultor': 'Cuestionario enfocado en consultoría y servicios profesionales'
        };
        
        return descriptions[profile] || 'Cuestionario personalizado según tu perfil profesional';
    }

    toggleOverrideOptions() {
        const overrideOptions = document.getElementById('overrideOptions');
        const toggleButton = document.getElementById('toggleOverride');
        
        if (overrideOptions.style.display === 'none') {
            overrideOptions.style.display = 'block';
            toggleButton.textContent = 'Ocultar opciones manuales';
        } else {
            overrideOptions.style.display = 'none';
            toggleButton.textContent = '¿No es tu perfil? Selecciona manualmente';
            this.overrideProfile = null;
            this.updateSummaryDisplay();
        }
    }

    selectOverrideProfile(e) {
        const selectedProfile = e.target.dataset.profile;
        this.overrideProfile = selectedProfile;

        // Marcar visualmente el botón elegido y desmarcar los demás
        const options = document.querySelectorAll('.profile-option');
        options.forEach(btn => {
            if (btn === e.target) {
                btn.classList.add('selected');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('selected');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        // Actualizar resumen y CTA con el perfil final
        this.updateSummaryDisplay();

        const startBtn = document.getElementById('startQuestionnaire');
        if (startBtn) {
            startBtn.querySelector('span')?.firstChild && (startBtn.querySelector('span').textContent = 'Comenzar Cuestionario');
            startBtn.setAttribute('data-final-profile', this.overrideProfile);
        }
    }

    startQuestionnaire() {
        // Determinar el perfil final priorizando override si existe
        const finalProfile = this.overrideProfile || this.selectedProfile;
        this.finalProfile = finalProfile;

        // Guardar datos de telemetría (ahora con perfilFinal correcto)
        this.saveProfileData();

        const route = this.getProfileRoute(finalProfile);
        window.location.href = route;
    }

    getProfileRoute(profile) {
        // Redirección al formulario genérico pasando el perfil por query string
        const params = new URLSearchParams();
        if (profile) params.set('perfil', profile);
        const area = this.profileData?.area || '';
        if (area) params.set('area', area);
        const qs = params.toString();
        return qs ? `q/form.html?${qs}` : 'q/form.html';
    }

    saveProfileData() {
        // Datos de telemetría mínima
        const telemetryData = {
            perfilSeleccionado: this.selectedProfile,
            overridePerfil: this.overrideProfile,
            perfilFinal: this.finalProfile,
            timestamp: new Date().toISOString(),
            respuestasSeccion1: this.profileData
        };

        // Guardar en localStorage
        localStorage.setItem('profileQuestionnaireData', JSON.stringify(telemetryData));
        
        // Persistir en BD
        this.persistRoleIfMissing().catch(err => console.warn('[PersistRole] Error:', err));
        this.persistQuestionnaireAnswers().catch(err => console.warn('[PersistAnswers] Error:', err));

        console.log('Datos de perfil guardados:', telemetryData);
    }

    async persistRoleIfMissing() {
        if (!window.supabase) return;
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session || !session.user) return;
        const userId = session.user.id;

        // Si ya existe un type_rol no lo sobreescribimos
        const { data, error } = await window.supabase
            .from('users')
            .select('type_rol')
            .eq('id', userId)
            .single();
        if (error) throw error;
        if (data && data.type_rol) return;

        const roleToSave = this.overrideProfile || this.selectedProfile || '';
        if (!roleToSave) return;

        await window.supabase
            .from('users')
            .update({ type_rol: roleToSave })
            .eq('id', userId);
    }

    async persistQuestionnaireAnswers() {
        if (!window.supabase) return;
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session || !session.user) return;
        const userId = session.user.id;

        const payload = {
            user_id: userId,
            nivel: this.profileData.nivel,
            area: this.profileData.area,
            relacion: this.profileData.relacion,
            tamano: this.profileData.tamano || null,
            sector: this.profileData.sector || null
        };

        // Upsert por user_id (1 registro por usuario)
        const { error } = await window.supabase
            .from('user_profile_answers')
            .upsert(payload, { onConflict: 'user_id' });
        if (error) throw error;
    }

    backToForm() {
        // Volver al formulario
        const stepProfile = document.getElementById('step-profile');
        const stepSummary = document.getElementById('step-summary');
        
        if (stepProfile) stepProfile.classList.add('active');
        if (stepSummary) stepSummary.classList.remove('active');
        
        this.currentStep = 'profile';
    }
}

// Estilos movidos a styles/profile.css para evitar conflictos y mejorar mantenibilidad.

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    new ProfileQuestionnaire();
});

// Código del menú de perfil eliminado - no se necesita