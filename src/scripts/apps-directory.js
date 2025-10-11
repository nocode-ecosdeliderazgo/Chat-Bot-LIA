// Apps Directory JavaScript - Nuevo diseño
// console.log('🚀 [SCRIPT] apps-directory.js cargándose...');

// Función para obtener todas las apps
function getAllApps() {
    // console.log('📋 [APPS] Obteniendo todas las apps...');
    try {
        // Verificar si appsData está disponible
        if (typeof appsData !== 'undefined') {
            // console.log('✅ [APPS] appsData encontrado:', appsData.length, 'apps');
            return appsData;
        } else {
            console.error('❌ [APPS] appsData no está definido');
            return [];
        }
    } catch (error) {
        console.error('❌ [APPS] Error al obtener apps:', error);
        return [];
    }
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // console.log('📄 [DOM] DOM completamente cargado');
    
    // Esperar un poco más para asegurar que apps-data.js se haya cargado
    setTimeout(() => {
        // console.log('⏰ [TIMEOUT] Iniciando AppsDirectory después del timeout');
        window.appsDirectory = new AppsDirectory();
    }, 100);
});

// Función de test simple para verificar que el script funciona
window.testAppsScript = function() {
    // console.log('🧪 [TEST] Script de apps funcionando correctamente');
    const btn = document.querySelector('.header-profile');
    const menu = document.getElementById('profileMenu');
    // console.log('🧪 [TEST] Botón perfil:', !!btn);
    // console.log('🧪 [TEST] Menú perfil:', !!menu);
    return { button: !!btn, menu: !!menu };
};

class AppsDirectory {
    constructor() {
        // console.log('🏗️ [APPS] Inicializando AppsDirectory...');
        this.apps = getAllApps();
        this.filteredApps = [...this.apps];
        // console.log('📋 [APPS] Apps cargadas:', this.apps.length);
        this.currentFilters = {
            search: '',
            category: '',
            pricing: [],
            tutorial: null
        };
        
        this.init();
    }

    init() {
        // console.log('🚀 [APPS] Inicializando directorio...');
        this.renderApps();
        this.setupEventListeners();
        this.setupFilterSidebar();
        this.setupModalClose();
        this.hideLoading();
        // console.log('✅ [APPS] Inicialización completa');
    }

    setupEventListeners() {
        // console.log('🔗 [APPS] Configurando event listeners...');
        
        // Usar setTimeout para asegurar que el DOM esté completamente cargado
        setTimeout(() => {
            // Search input
            const searchInput = document.getElementById('searchInput');
            // console.log('🔍 [APPS] Search input encontrado:', !!searchInput);
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.currentFilters.search = e.target.value;
                    this.applyFilters();
                });
            }

            // Category tabs
            const categoryTabs = document.querySelectorAll('.cat-tab');
            // console.log('🏷️ [APPS] Category tabs encontrados:', categoryTabs.length);
            categoryTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    // Remove active class from all tabs
                    categoryTabs.forEach(t => t.classList.remove('active'));
                    // Add active class to clicked tab
                    e.target.classList.add('active');
                    
                    this.currentFilters.category = e.target.dataset.category || '';
                    this.applyFilters();
                });
            });

        }, 100);
    }

    setupFilterSidebar() {
        const filterToggle = document.getElementById('filterToggle');
        const filtersSidebar = document.getElementById('filtersSidebar');
        const filtersOverlay = document.getElementById('filtersOverlay');
        const closeFilters = document.getElementById('closeFilters');

        // Abrir sidebar
        if (filterToggle) {
            filterToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                filtersSidebar.classList.add('active');
                filtersOverlay.classList.add('active');
            });
        }

        // Cerrar sidebar
        const closeSidebar = () => {
            filtersSidebar.classList.remove('active');
            filtersOverlay.classList.remove('active');
        };

        if (closeFilters) {
            closeFilters.addEventListener('click', closeSidebar);
        }

        if (filtersOverlay) {
            filtersOverlay.addEventListener('click', closeSidebar);
        }

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && filtersSidebar.classList.contains('active')) {
                closeSidebar();
            }
        });

        // Evitar que se cierre al hacer clic dentro del sidebar
        if (filtersSidebar) {
            filtersSidebar.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Configurar filtros
        this.setupFilters();
    }

    setupFilters() {
        // Filtros de precio
        const pricingFilters = document.querySelectorAll('.pricing-filter');
        pricingFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                const value = e.target.value;
                const isChecked = e.target.checked;
                
                if (isChecked) {
                    this.currentFilters.pricing.push(value);
                } else {
                    this.currentFilters.pricing = this.currentFilters.pricing.filter(p => p !== value);
                }
                
                // console.log('💰 [FILTERS] Precios:', this.currentFilters.pricing);
                this.applyFilters();
            });
        });

        // Filtro de tutorial
        const tutorialFilter = document.getElementById('withTutorial');
        if (tutorialFilter) {
            tutorialFilter.addEventListener('change', (e) => {
                this.currentFilters.tutorial = e.target.checked ? true : null;
                // console.log('📚 [FILTERS] Tutorial:', this.currentFilters.tutorial);
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        // console.log('🔍 [FILTERS] Aplicando filtros:', this.currentFilters);
        let filtered = [...this.apps];
        // console.log('📱 [FILTERS] Apps totales:', this.apps.length);

        // Apply search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            // console.log('🔍 [FILTERS] Buscando:', searchTerm);
            filtered = filtered.filter(app => 
                app.name.toLowerCase().includes(searchTerm) ||
                app.description.toLowerCase().includes(searchTerm) ||
                app.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
            // console.log('🔍 [FILTERS] Después de búsqueda:', filtered.length);
        }

        // Apply category filter
        if (this.currentFilters.category) {
            // console.log('🏷️ [FILTERS] Filtrando categoría:', this.currentFilters.category);
            filtered = filtered.filter(app => 
                app.category === this.currentFilters.category
            );
            // console.log('🏷️ [FILTERS] Después de categoría:', filtered.length);
        }

        // Apply pricing filters
        if (this.currentFilters.pricing.length > 0) {
            // console.log('💰 [FILTERS] Filtrando precios:', this.currentFilters.pricing);
            filtered = filtered.filter(app => 
                this.currentFilters.pricing.includes(app.pricing)
            );
            // console.log('💰 [FILTERS] Después de precios:', filtered.length);
        }

        // Apply tutorial filter
        if (this.currentFilters.tutorial !== null) {
            // console.log('📚 [FILTERS] Filtrando tutorial:', this.currentFilters.tutorial);
            filtered = filtered.filter(app => app.hasTutorial === this.currentFilters.tutorial);
            // console.log('📚 [FILTERS] Después de tutorial:', filtered.length);
        }

        this.filteredApps = filtered;
        // console.log('✅ [FILTERS] Resultado final:', this.filteredApps.length, 'apps');
        this.renderApps();
    }

    renderApps() {
        const appsGrid = document.getElementById('appsGrid');
        const noResults = document.getElementById('noResults');
        
        if (!appsGrid) return;

        if (this.filteredApps.length === 0) {
            appsGrid.innerHTML = '';
            if (noResults) noResults.style.display = 'flex';
            return;
        }

        if (noResults) noResults.style.display = 'none';

        // Usar la estructura de tarjetas del proyecto
        appsGrid.innerHTML = this.filteredApps.map(app => this.createAppCard(app)).join('');
        
        // Add click event listeners to app cards
        this.setupAppCardListeners();
    }

    createAppCard(app) {
        const categoryName = this.getCategoryDisplayName(app.category);
        const pricingClass = app.pricing.replace(' ', '-').toLowerCase();
        const pricingDisplay = this.getPricingDisplayName(app.pricing);
        
        return `
            <div class="course-card app-card" data-app-id="${app.id}">
                <div class="app-header">
                    <img src="${app.logo}" alt="${app.name}" class="app-logo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzQ0RTVGRiIvPgo8cGF0aCBkPSJNMjQgMTJDMjkuNTIyOCAxMiAzNCAxNi40NzcyIDM0IDIyQzM0IDI3LjUyMjggMjkuNTIyOCAzMiAyNCAzMkMxOC40NzcyIDMyIDE0IDI3LjUyMjggMTQgMjJDMTQgMTYuNDc3MiAxOC40NzcyIDEyIDI0IDEyWiIgZmlsbD0iIzBBMEEwQSIvPgo8L3N2Zz4K'">
                    <span class="app-category">${categoryName}</span>
                </div>
                <div class="app-body">
                    <h3>${app.name}</h3>
                    <p class="app-description">${app.description}</p>
                    <div class="app-tags">
                        <span class="app-pricing ${pricingClass}">${pricingDisplay}</span>
                        <div class="tags-list">
                            ${app.tags.slice(0, 2).map(tag => `<span class="app-tag">${tag}</span>`).join('')}
                            ${app.tags.length > 2 ? `<span class="app-tag">+${app.tags.length - 2}</span>` : ''}
                        </div>
                    </div>
                    <div class="app-footer">
                        <a href="${app.url}" target="_blank" rel="noopener noreferrer" class="discover-btn">
                            Descubrir
                            <i class="bx bx-external-link"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    setupAppCardListeners() {
        const appCards = document.querySelectorAll('.app-card');
        // console.log('🔗 [MODAL] Configurando listeners para', appCards.length, 'tarjetas');
        
        appCards.forEach((card, index) => {
            const appId = card.dataset.appId;
            // console.log(`🔗 [MODAL] Tarjeta ${index + 1} - ID:`, appId);
            
            // Click on the card itself (excluding the discover button)
            card.addEventListener('click', (e) => {
                // console.log('🖱️ [MODAL] Click en tarjeta, target:', e.target);
                // Don't trigger if clicking on the discover button
                if (e.target.closest('.discover-btn')) {
                    // console.log('🖱️ [MODAL] Click en botón descubrir, ignorando click de tarjeta');
                    return;
                }
                
                // console.log('🖱️ [MODAL] Ejecutando showAppDetails desde tarjeta');
                this.showAppDetails(appId);
            });
            
            // Click specifically on the discover button
            const discoverBtn = card.querySelector('.discover-btn');
            if (discoverBtn) {
                // console.log(`🔗 [MODAL] Botón descubrir encontrado en tarjeta ${index + 1}`);
                discoverBtn.addEventListener('click', (e) => {
                    // console.log('🖱️ [MODAL] Click en botón descubrir');
                    e.preventDefault(); // Prevent default link behavior
                    e.stopPropagation(); // Prevent card click
                    
                    // console.log('🖱️ [MODAL] Ejecutando showAppDetails desde botón');
                    this.showAppDetails(appId);
                });
            } else {
                console.warn(`⚠️ [MODAL] Botón descubrir NO encontrado en tarjeta ${index + 1}`);
            }
        });
    }

    showAppDetails(appId) {
        // console.log('🔍 [MODAL] showAppDetails llamado con ID:', appId, 'tipo:', typeof appId);
        // Convertir appId a número para la comparación
        const numericId = parseInt(appId);
        // console.log('🔍 [MODAL] ID convertido a número:', numericId);
        
        const app = this.apps.find(app => app.id === numericId);
        if (!app) {
            console.error('❌ [MODAL] App no encontrada con ID:', numericId);
            // console.log('🔍 [MODAL] Apps disponibles:', this.apps.map(a => ({ id: a.id, name: a.name, tipo: typeof a.id })));
            return;
        }

        // console.log('🔍 [MODAL] Mostrando detalles de:', app.name);
        
        // Show the modal
        const modal = document.getElementById('appModal');
        // console.log('🔍 [MODAL] Modal encontrado:', !!modal);
        if (modal) {
            this.populateModal(app);
            modal.classList.add('active');
            // console.log('✅ [MODAL] Modal activado, clases:', modal.className);
        } else {
            console.error('❌ [MODAL] Modal no encontrado en el DOM');
        }
    }

    populateModal(app) {
        // console.log('📝 [MODAL] Poblando modal con datos de:', app.name);
        
        // Update title
        const titleEl = document.getElementById('modalAppTitle');
        if (titleEl) titleEl.textContent = app.name;
        
        // Update description
        const descEl = document.getElementById('modalAppDescriptionText');
        if (descEl) descEl.textContent = app.description;
        
        // Update TL;DR section
        const tldrEl = document.getElementById('modalAppTldr');
        if (tldrEl && app.detailedInfo) {
            const tldrItems = [
                `${app.pricing === 'freemium' ? 'Plan freemium disponible' : app.pricing === 'gratis' ? 'Completamente gratuito' : 'Plan de pago'}`,
                `${app.hasTutorial ? 'Tutorial incluido' : 'Sin tutorial'}`,
                `${app.features.length} características principales`,
                `${app.detailedInfo.alternatives.length} alternativas disponibles`
            ];
            tldrEl.innerHTML = tldrItems.map(item => `<li>${item}</li>`).join('');
        }
        
        // Update pros
        const prosEl = document.getElementById('modalAppPros');
        if (prosEl && app.detailedInfo) {
            prosEl.innerHTML = app.detailedInfo.pros.map(pro => `<li>${pro}</li>`).join('');
        }
        
        // Update cons
        const consEl = document.getElementById('modalAppCons');
        if (consEl && app.detailedInfo) {
            consEl.innerHTML = app.detailedInfo.cons.map(con => `<li>${con}</li>`).join('');
        }
        
        // Update pricing plans
        const pricingEl = document.getElementById('modalAppPricing');
        if (pricingEl && app.detailedInfo) {
            pricingEl.innerHTML = app.detailedInfo.pricingPlans.map(plan => `
                <div class="pricing-plan ${plan.popular ? 'popular' : ''}">
                    <div class="plan-header">
                        <span class="plan-name">${plan.name}</span>
                        <span class="plan-price">${plan.price}</span>
                    </div>
                    <ul class="plan-features">
                        ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }
        
        // Update use cases
        const useCasesEl = document.getElementById('modalAppUseCases');
        if (useCasesEl && app.detailedInfo) {
            useCasesEl.innerHTML = app.detailedInfo.useCases.map(useCase => `<li>${useCase}</li>`).join('');
        }
        
        // Update alternatives
        const alternativesEl = document.getElementById('modalAppAlternatives');
        if (alternativesEl && app.detailedInfo) {
            alternativesEl.innerHTML = app.detailedInfo.alternatives.map(alt => `<li>${alt}</li>`).join('');
        }
        
        // Update features
        const featuresEl = document.getElementById('modalAppFeatures');
        if (featuresEl) {
            featuresEl.innerHTML = app.features.map(feature => `<li>${feature}</li>`).join('');
        }
        
        // Update CTA button
        const ctaEl = document.getElementById('modalAppCtaButton');
        if (ctaEl) {
            ctaEl.textContent = `Visitar ${app.name}`;
            ctaEl.onclick = () => {
                window.open(app.url, '_blank', 'noopener,noreferrer');
            };
        }
    }

    setupModalClose() {
        const modal = document.getElementById('appModal');
        const closeBtn = modal.querySelector('.modal-close');
        const backdrop = modal.querySelector('.modal-backdrop');

        const closeModal = () => {
            modal.classList.remove('active');
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        if (backdrop) {
            backdrop.addEventListener('click', closeModal);
        }
        
        // También cerrar al hacer clic fuera del contenido del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            'productividad-automatizacion': 'Productividad y Automatización',
            'contenido-escritura': 'Contenido y Escritura',
            'musica-audio': 'Música y Audio',
            'fotografia-imagen': 'Fotografía e Imagen',
            'miscelaneas': 'Misceláneas',
            'desarrollo-programacion': 'Desarrollo y Programación',
            'video': 'Video',
            'arte-ilustracion': 'Arte e Ilustración',
            'negocios-finanzas': 'Negocios y Finanzas',
            'marketing-ventas': 'Marketing y Ventas',
            'contabilidad-finanzas': 'Contabilidad y Finanzas',
            'rrhh-gestion': 'RRHH y Gestión',
            'it-operaciones': 'IT y Operaciones'
        };
        return categoryNames[category] || category;
    }

    getPricingDisplayName(pricing) {
        const pricingNames = {
            'freemium': 'Freemium',
            'gratis': 'Gratis',
            'de-pago': 'De pago',
            'prueba-gratis': 'Prueba gratis'
        };
        return pricingNames[pricing] || pricing;
    }

    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = 'none';
        }
    }
}

// Modal styles (injected dynamically)
const modalStyles = `
<style>
.app-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.app-modal.show {
    opacity: 1;
    visibility: visible;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: relative;
    background: var(--surface);
    border-radius: var(--border-radius);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    transform: translateY(20px);
    transition: transform 0.3s ease;
}

.app-modal.show .modal-content {
    transform: translateY(0);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid var(--glass-border);
}

.modal-app-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.modal-app-logo {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
}

.modal-header h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    font-size: 1.5rem;
}

.modal-category {
    background: var(--primary-gradient);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: var(--transition);
}

.modal-close:hover {
    background: var(--glass-bg);
    color: var(--text-primary);
}

.modal-body {
    padding: 1rem 2rem 2rem;
}

.modal-description {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 2rem;
    font-size: 1rem;
}

.modal-section {
    margin-bottom: 2rem;
}

.modal-section h3 {
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.features-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.features-list li {
    color: var(--text-secondary);
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--glass-border);
    position: relative;
    padding-left: 1.5rem;
}

.features-list li:last-child {
    border-bottom: none;
}

.features-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--primary-color);
    font-weight: bold;
}

.app-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
}

.detail-label {
    color: var(--text-secondary);
    font-weight: 500;
}

.detail-value {
    color: var(--text-primary);
    font-weight: 600;
}

.detail-value.freemium {
    color: #10b981;
}

.detail-value.gratis {
    color: #059669;
}

.detail-value.de-pago {
    color: #f59e0b;
}

.modal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.modal-tag {
    background: var(--glass-bg);
    color: var(--text-secondary);
    padding: 0.375rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
    border: 1px solid var(--glass-border);
}

.modal-footer {
    padding: 1rem 2rem 2rem;
    border-top: 1px solid var(--glass-border);
}

.modal-visit-btn {
    background: var(--primary-gradient);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    justify-content: center;
}

.modal-visit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        max-height: 90vh;
    }
    
    .modal-header {
        padding: 1.5rem 1.5rem 1rem;
    }
    
    .modal-body {
        padding: 1rem 1.5rem 1.5rem;
    }
    
    .modal-footer {
        padding: 1rem 1.5rem 1.5rem;
    }
    
    .modal-app-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    
    .modal-app-logo {
        width: 50px;
        height: 50px;
    }
}
</style>
`;

// Initialize the apps directory when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // console.log('[APPS-DIRECTORY] Inicializando directorio de aplicaciones...');
    
    // Inject modal styles
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    
    // Setup profile menu functionality
    setupProfileMenu();
    
    // Test function to manually open modal
    window.testModal = function() {
        // console.log('🧪 [TEST] Función testModal llamada');
        const modal = document.getElementById('appModal');
        if (modal) {
            modal.classList.add('active');
            // console.log('✅ [TEST] Modal abierto manualmente');
            // console.log('🧪 [TEST] Clases del modal:', modal.className);
            // console.log('🧪 [TEST] Display computed:', window.getComputedStyle(modal).display);
            // console.log('🧪 [TEST] Opacity computed:', window.getComputedStyle(modal).opacity);
            // console.log('🧪 [TEST] Visibility computed:', window.getComputedStyle(modal).visibility);
        } else {
            console.error('❌ [TEST] Modal no encontrado');
        }
    };

    // Función para verificar el estado del modal
    window.checkModal = function() {
        const modal = document.getElementById('appModal');
        if (modal) {
            // console.log('🔍 [DEBUG] Modal encontrado');
            // console.log('🔍 [DEBUG] Clases:', modal.className);
            // console.log('🔍 [DEBUG] Display:', window.getComputedStyle(modal).display);
            // console.log('🔍 [DEBUG] Opacity:', window.getComputedStyle(modal).opacity);
            // console.log('🔍 [DEBUG] Visibility:', window.getComputedStyle(modal).visibility);
            // console.log('🔍 [DEBUG] Z-index:', window.getComputedStyle(modal).zIndex);
            // console.log('🔍 [DEBUG] Position:', window.getComputedStyle(modal).position);
        } else {
            console.error('❌ [DEBUG] Modal no encontrado');
        }
    };
    
    // console.log('[APPS-DIRECTORY] ✅ Inicialización completa');
    // console.log('[APPS-DIRECTORY] 🧪 Función testModal disponible: window.testModal()');
});

// Theme toggle functionality - función global
window.toggleTheme = function() {
    // console.log('[THEME] Toggle de tema ejecutado');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
        }
    }
    // console.log('[THEME] Tema cambiado a:', newTheme);
}

// Close app modal functionality - función global
window.closeAppModal = function() {
    const modal = document.getElementById('appModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Función global de test para el menú de perfil
window.testProfileMenu = function() {
    // console.log('[MANUAL-TEST] Iniciando test manual del menú de perfil...');
    const btn = document.querySelector('.header-profile');
    const menu = document.getElementById('profileMenu');
    
    if (!btn || !menu) {
        console.error('[MANUAL-TEST] Elementos no encontrados');
        return false;
    }
    
    // console.log('[MANUAL-TEST] Simulando clic en botón de perfil...');
    btn.click();
    
    setTimeout(() => {
        const isVisible = menu.classList.contains('show');
        // console.log('[MANUAL-TEST] Menú visible después del clic:', isVisible);
        // console.log('[MANUAL-TEST] Clases del menú:', Array.from(menu.classList));
        // console.log('[MANUAL-TEST] Display computed:', window.getComputedStyle(menu).display);
    }, 100);
    
    return true;
}

// Toggle menú de perfil - funcionalidad igual que cursos.js
function setupProfileMenu() {
    const avatarBtn = document.querySelector('.header-profile');
    const menu = document.getElementById('profileMenu');
    if (!avatarBtn || !menu) {
        console.error('[PROFILE] ❌ Elementos del menú de perfil no encontrados');
        return;
    }
    // console.log('[PROFILE] ✅ Menú de perfil configurado correctamente');
    
    // Rellenar datos del usuario
    try {
        const raw = localStorage.getItem('currentUser');
        if (raw) {
            const user = JSON.parse(raw);
            const nameEl = document.getElementById('pmName');
            const emailEl = document.getElementById('pmEmail');
            if (nameEl) nameEl.textContent = user.display_name || user.username || 'Usuario';
            if (emailEl) emailEl.textContent = user.email || user.user?.email || user.data?.email || '';
            // avatar
            if (user.avatar_url) {
                document.querySelectorAll('.header-profile img, #profileMenu .pm-avatar img').forEach(img => {
                    img.src = user.avatar_url;
                });
            }
        }
    } catch (e) { /* noop */ }

    avatarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        menu.classList.toggle('show');
        // console.log('[PROFILE] 🎯 Menú de perfil', menu.classList.contains('show') ? 'abierto' : 'cerrado');
    });
    
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
            menu.classList.remove('show');
        }
    });
}
