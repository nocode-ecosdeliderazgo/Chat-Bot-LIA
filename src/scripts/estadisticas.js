// ===== SISTEMA DE ESTADÍSTICAS Y GRÁFICAS =====

class StatisticsManager {
    constructor() {
        this.userId = null;
        this.userProfile = null;
        this.userArea = null;
        this.questionnaireData = null;
        this.charts = {};
        
        this.init();
    }

    async init() {
        this.initializeParticles();
        this.setupAnimations();
        this.bindEvents();
        await this.loadUserData();
        await this.loadStatistics();
        this.setupCharts();
    }

    initializeParticles() {
        const particlesContainer = document.querySelector('.particles-container');
        if (particlesContainer && typeof ParticleSystem !== 'undefined') {
            new ParticleSystem(particlesContainer);
        }
    }

    setupAnimations() {
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

    bindEvents() {
        // Botón de actualizar
        const refreshBtn = document.getElementById('refreshStats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshStatistics());
        }

        // Botón de exportar
        const exportBtn = document.getElementById('exportStats');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportStatistics());
        }

        // Menú de perfil
        window.toggleProfileMenu = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const menu = document.getElementById('profileMenu');
            menu.style.display = (menu.style.display === 'block' ? 'none' : 'block');
        };

        document.addEventListener('click', (e) => {
            const menu = document.getElementById('profileMenu');
            const btn = document.querySelector('.profile-btn');
            if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
                menu.style.display = 'none';
            }
        });
    }

    async loadUserData() {
        try {
            // Obtener datos del usuario desde Supabase
            if (window.supabase) {
                const { data: { session } } = await window.supabase.auth.getSession();
                if (session && session.user) {
                    this.userId = session.user.id;
                    
                    // Obtener perfil del usuario
                    const { data: userData } = await window.supabase
                        .from('users')
                        .select('type_rol, email')
                        .eq('id', this.userId)
                        .single();
                    
                    if (userData) {
                        this.userProfile = userData.type_rol;
                        this.updateProfileDisplay(userData);
                    }
                }
            }

            // Fallback: obtener desde localStorage
            if (!this.userProfile) {
                const profileData = localStorage.getItem('profileQuestionnaireData');
                if (profileData) {
                    const data = JSON.parse(profileData);
                    this.userProfile = data.perfilFinal;
                    this.userArea = data.respuestasSeccion1?.area;
                }
            }

        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
        }
    }

    updateProfileDisplay(userData) {
        const profileEl = document.getElementById('userProfile');
        const areaEl = document.getElementById('userArea');
        
        if (profileEl) {
            profileEl.textContent = this.userProfile || 'Perfil no disponible';
        }
        
        if (areaEl) {
            areaEl.textContent = this.userArea || 'Área no disponible';
        }
    }

    async loadStatistics() {
        try {
            if (!this.userId) {
                console.warn('No hay usuario autenticado');
                return;
            }

            // Obtener sesión del cuestionario
            const { data: sessionData } = await window.supabase
                .from('user_questionnaire_sessions')
                .select('*')
                .eq('user_id', this.userId)
                .eq('perfil', this.userProfile)
                .order('started_at', { ascending: false })
                .limit(1)
                .single();

            if (sessionData) {
                this.updateSessionInfo(sessionData);
                
                // Obtener respuestas del cuestionario
                const { data: responses } = await window.supabase
                    .from('user_question_responses')
                    .select(`
                        *,
                        questions_catalog (
                            content,
                            qtype,
                            order_num
                        )
                    `)
                    .eq('session_id', sessionData.id)
                    .order('questions_catalog.order_num');

                this.questionnaireData = responses;
                this.calculateMetrics();
            }

        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }

    updateSessionInfo(sessionData) {
        const completionDateEl = document.getElementById('completionDate');
        const completionTimeEl = document.getElementById('completionTime');
        
        if (sessionData.completed_at) {
            const completedDate = new Date(sessionData.completed_at);
            const startedDate = new Date(sessionData.started_at);
            
            if (completionDateEl) {
                completionDateEl.textContent = `Fecha de completado: ${completedDate.toLocaleDateString('es-ES')}`;
            }
            
            if (completionTimeEl) {
                const timeDiff = completedDate - startedDate;
                const minutes = Math.floor(timeDiff / 60000);
                completionTimeEl.textContent = `Tiempo: ${minutes} minutos`;
            }
        }
    }

    calculateMetrics() {
        if (!this.questionnaireData) return;

        const likertResponses = this.questionnaireData.filter(r => r.answer_likert !== null);
        const totalQuestions = this.questionnaireData.length;
        
        // Puntuación promedio
        const avgScore = likertResponses.length > 0 
            ? (likertResponses.reduce((sum, r) => sum + r.answer_likert, 0) / likertResponses.length).toFixed(1)
            : 0;

        // Nivel de experiencia
        const experienceLevel = this.getExperienceLevel(avgScore);

        // Actualizar métricas
        document.getElementById('avgScore').textContent = avgScore;
        document.getElementById('experienceLevel').textContent = experienceLevel;
        document.getElementById('completedQuestions').textContent = totalQuestions;
        document.getElementById('avgTimePerQuestion').textContent = '2.5 min'; // Placeholder

        // Generar recomendaciones
        this.generateRecommendations(avgScore, experienceLevel);
    }

    getExperienceLevel(avgScore) {
        const score = parseFloat(avgScore);
        if (score >= 6) return 'Experto';
        if (score >= 4.5) return 'Avanzado';
        if (score >= 3) return 'Intermedio';
        return 'Principiante';
    }

    generateRecommendations(avgScore, experienceLevel) {
        const coursesContainer = document.getElementById('recommendedCourses');
        const goalsContainer = document.getElementById('developmentGoals');
        
        const score = parseFloat(avgScore);
        
        // Cursos recomendados basados en el nivel
        let recommendedCourses = [];
        if (score < 3) {
            recommendedCourses = [
                'Fundamentos de IA para Negocios',
                'Introducción a Herramientas de IA',
                'Casos de Uso Básicos de IA'
            ];
        } else if (score < 5) {
            recommendedCourses = [
                'IA Avanzada para Profesionales',
                'Automatización con IA',
                'Estrategias de Implementación'
            ];
        } else {
            recommendedCourses = [
                'IA Estratégica para Líderes',
                'Transformación Digital con IA',
                'Innovación y Disrupción Tecnológica'
            ];
        }

        // Objetivos de desarrollo
        let developmentGoals = [];
        if (score < 3) {
            developmentGoals = [
                'Familiarizarse con conceptos básicos de IA',
                'Identificar oportunidades de uso en tu área',
                'Experimentar con herramientas simples'
            ];
        } else if (score < 5) {
            developmentGoals = [
                'Implementar soluciones de IA en proyectos',
                'Optimizar procesos existentes',
                'Desarrollar competencias técnicas'
            ];
        } else {
            developmentGoals = [
                'Liderar iniciativas de transformación digital',
                'Mentorear equipos en adopción de IA',
                'Desarrollar estrategias innovadoras'
            ];
        }

        // Actualizar DOM
        if (coursesContainer) {
            coursesContainer.innerHTML = `<ul>${recommendedCourses.map(course => `<li>${course}</li>`).join('')}</ul>`;
        }
        
        if (goalsContainer) {
            goalsContainer.innerHTML = `<ul>${developmentGoals.map(goal => `<li>${goal}</li>`).join('')}</ul>`;
        }
    }

    setupCharts() {
        this.createLikertChart();
        this.createStrengthChart();
        this.createImprovementChart();
        this.createProgressChart();
    }

    createLikertChart() {
        const ctx = document.getElementById('likertChart');
        if (!ctx) return;

        const likertData = this.getLikertDistribution();
        
        this.charts.likert = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7'],
                datasets: [{
                    label: 'Frecuencia',
                    data: likertData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(68, 229, 255, 0.8)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(68, 229, 255, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    createStrengthChart() {
        const ctx = document.getElementById('strengthChart');
        if (!ctx) return;

        const strengthData = this.getStrengthAreas();
        
        this.charts.strength = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: strengthData.labels,
                datasets: [{
                    data: strengthData.values,
                    backgroundColor: [
                        'rgba(68, 229, 255, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 205, 86, 0.8)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    createImprovementChart() {
        const ctx = document.getElementById('improvementChart');
        if (!ctx) return;

        const improvementData = this.getImprovementAreas();
        
        this.charts.improvement = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: improvementData.labels,
                datasets: [{
                    label: 'Puntuación',
                    data: improvementData.values,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 7,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    createProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        const progressData = this.getProgressData();
        
        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: progressData.labels,
                datasets: [{
                    label: 'Puntuación Promedio',
                    data: progressData.values,
                    borderColor: 'rgba(68, 229, 255, 1)',
                    backgroundColor: 'rgba(68, 229, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 7,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    getLikertDistribution() {
        if (!this.questionnaireData) return [0, 0, 0, 0, 0, 0, 0];
        
        const distribution = [0, 0, 0, 0, 0, 0, 0];
        this.questionnaireData.forEach(response => {
            if (response.answer_likert && response.answer_likert >= 1 && response.answer_likert <= 7) {
                distribution[response.answer_likert - 1]++;
            }
        });
        
        return distribution;
    }

    getStrengthAreas() {
        // Simulación de datos - en producción se obtendría de la BD
        return {
            labels: ['Análisis de Datos', 'Automatización', 'Estrategia', 'Implementación', 'Innovación'],
            values: [6.2, 5.8, 5.5, 4.9, 4.7]
        };
    }

    getImprovementAreas() {
        // Simulación de datos - en producción se obtendría de la BD
        return {
            labels: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
            values: [2.3, 1.8, 3.1, 2.7]
        };
    }

    getProgressData() {
        // Simulación de datos - en producción se obtendría de múltiples sesiones
        return {
            labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
            values: [3.2, 4.1, 4.8, 5.2]
        };
    }

    async refreshStatistics() {
        const refreshBtn = document.getElementById('refreshStats');
        if (refreshBtn) {
            refreshBtn.classList.add('loading');
            refreshBtn.disabled = true;
        }

        try {
            await this.loadStatistics();
            this.updateCharts();
        } catch (error) {
            console.error('Error actualizando estadísticas:', error);
        } finally {
            if (refreshBtn) {
                refreshBtn.classList.remove('loading');
                refreshBtn.disabled = false;
            }
        }
    }

    updateCharts() {
        // Actualizar datos de las gráficas
        if (this.charts.likert) {
            this.charts.likert.data.datasets[0].data = this.getLikertDistribution();
            this.charts.likert.update();
        }
        
        if (this.charts.strength) {
            const strengthData = this.getStrengthAreas();
            this.charts.strength.data.labels = strengthData.labels;
            this.charts.strength.data.datasets[0].data = strengthData.values;
            this.charts.strength.update();
        }
        
        if (this.charts.improvement) {
            const improvementData = this.getImprovementAreas();
            this.charts.improvement.data.labels = improvementData.labels;
            this.charts.improvement.data.datasets[0].data = improvementData.values;
            this.charts.improvement.update();
        }
    }

    exportStatistics() {
        try {
            const exportData = {
                userProfile: this.userProfile,
                userArea: this.userArea,
                questionnaireData: this.questionnaireData,
                metrics: {
                    avgScore: document.getElementById('avgScore').textContent,
                    experienceLevel: document.getElementById('experienceLevel').textContent,
                    completedQuestions: document.getElementById('completedQuestions').textContent
                },
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `estadisticas_${this.userProfile}_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
        } catch (error) {
            console.error('Error exportando estadísticas:', error);
            alert('Error al exportar las estadísticas');
        }
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    new StatisticsManager();
});
