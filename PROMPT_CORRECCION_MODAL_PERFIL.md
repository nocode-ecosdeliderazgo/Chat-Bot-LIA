# PROMPT: Corrección de Modal de Perfil de Usuario

## 🚨 **Problemas Identificados**

1. **Modal se cierra automáticamente** a los 2 segundos sin importar las acciones del usuario
2. **No se carga la información del usuario** en el modal
3. **Console logs excesivos** que afectan el rendimiento
4. **Lógica existente no debe modificarse** - solo agregar lo necesario

## 🎯 **Objetivo**
Corregir los problemas del modal de perfil **SIN DESTRUIR** la lógica existente del backend y frontend. Solo agregar las correcciones necesarias.

---

## 🔧 **Correcciones Requeridas**

### 1. **Problema: Modal se cierra automáticamente**

#### **Causa Probable**
- Event listeners duplicados o conflictivos
- Timeout automático no controlado
- Event bubbling no manejado correctamente

#### **Solución**
```javascript
// AGREGAR: Función para limpiar event listeners duplicados
function cleanupModalEventListeners() {
    // Remover todos los event listeners existentes del modal
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.replaceWith(modal.cloneNode(true));
    }
}

// AGREGAR: Event listener seguro para cerrar modal
function setupModalCloseListeners() {
    const modal = document.getElementById('userProfileModal');
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('closeProfileModal');
    
    if (!modal) return;
    
    // Cerrar con botón X
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeUserProfile();
        };
    }
    
    // Cerrar con click en overlay
    if (overlay) {
        overlay.onclick = (e) => {
            e.stopPropagation();
            closeUserProfile();
        };
    }
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            e.stopPropagation();
            closeUserProfile();
        }
    });
    
    // Prevenir cierre automático - REMOVER cualquier setTimeout
    const existingTimeouts = window.modalTimeouts || [];
    existingTimeouts.forEach(timeout => clearTimeout(timeout));
    window.modalTimeouts = [];
}
```

### 2. **Problema: No se carga información del usuario**

#### **Causa Probable**
- IDs de elementos HTML no coinciden
- Datos no se están obteniendo correctamente
- Error en la función de población del modal

#### **Solución**
```javascript
// CORREGIR: Función para poblar modal con validación
function populateProfileModal(userData) {
    if (!userData) {
        console.error('No hay datos de usuario para mostrar');
        showProfileError('No se pudieron cargar los datos del usuario');
        return;
    }
    
    try {
        // Validar que los elementos existen antes de actualizarlos
        const updateElement = (id, value, fallback = '') => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || fallback;
                element.style.display = value ? 'block' : 'none';
            } else {
                console.warn(`Elemento con ID '${id}' no encontrado`);
            }
        };
        
        // Información básica con fallbacks
        const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        const displayName = fullName || userData.display_name || userData.username || 'Usuario';
        
        updateElement('profileName', displayName);
        updateElement('profileUsername', `@${userData.username}`);
        updateElement('profileRole', userData.cargo_rol);
        updateElement('profileBio', userData.bio);
        
        // Foto de perfil
        const avatarImg = document.getElementById('profileAvatar');
        if (avatarImg) {
            if (userData.profile_picture_url) {
                avatarImg.src = userData.profile_picture_url;
                avatarImg.style.display = 'block';
            } else {
                avatarImg.style.display = 'none';
            }
        }
        
        // Enlaces profesionales
        updateProfileLinks(userData);
        
        // Estadísticas
        updateProfileStats(userData);
        
        // Mostrar modal
        const modal = document.getElementById('userProfileModal');
        if (modal) {
            modal.classList.add('active');
        }
        
    } catch (error) {
        console.error('Error poblando modal:', error);
        showProfileError('Error mostrando información del usuario');
    }
}

// CORREGIR: Función para obtener datos del usuario
async function getUserData(userId) {
    if (!userId) {
        console.error('ID de usuario no proporcionado');
        return null;
    }
    
    try {
        // Verificar que Supabase está disponible
        if (!window.supabase) {
            console.error('Supabase no está disponible');
            return null;
        }
        
        const { data: userData, error } = await window.supabase
            .from('users')
            .select(`
                id,
                username,
                email,
                first_name,
                last_name,
                display_name,
                cargo_rol,
                type_rol,
                bio,
                location,
                phone,
                profile_picture_url,
                curriculum_url,
                linkedin_url,
                github_url,
                website_url,
                points,
                created_at,
                updated_at,
                last_login_at,
                email_verified
            `)
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error obteniendo datos del usuario:', error);
            return null;
        }
        
        console.log('Datos del usuario obtenidos:', userData);
        return userData;
        
    } catch (error) {
        console.error('Error en getUserData:', error);
        return null;
    }
}
```

### 3. **Problema: Console logs excesivos**

#### **Solución**
```javascript
// AGREGAR: Sistema de logging controlado
const DEBUG_PROFILE = false; // Cambiar a true solo para debug

function profileLog(message, data = null) {
    if (DEBUG_PROFILE) {
        console.log(`[PROFILE] ${message}`, data);
    }
}

function profileError(message, error = null) {
    console.error(`[PROFILE ERROR] ${message}`, error);
}

// Reemplazar todos los console.log en funciones de perfil con profileLog()
```

### 4. **Problema: Event listeners en tarjetas de miembros**

#### **Solución**
```javascript
// AGREGAR: Función para agregar click listeners a tarjetas de miembros
function setupMemberCardListeners() {
    // Remover listeners existentes para evitar duplicados
    document.querySelectorAll('.member-card').forEach(card => {
        card.removeEventListener('click', handleMemberCardClick);
    });
    
    // Agregar nuevos listeners
    document.querySelectorAll('.member-card').forEach(card => {
        card.addEventListener('click', handleMemberCardClick);
    });
}

// AGREGAR: Handler para click en tarjeta de miembro
function handleMemberCardClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const userId = this.dataset.userId;
    if (!userId) {
        profileError('ID de usuario no encontrado en la tarjeta');
        return;
    }
    
    profileLog('Abriendo perfil de usuario:', userId);
    openUserProfile(userId);
}

// AGREGAR: Función principal para abrir perfil
async function openUserProfile(userId) {
    if (!userId) {
        profileError('ID de usuario no proporcionado');
        return;
    }
    
    try {
        // Limpiar event listeners previos
        cleanupModalEventListeners();
        
        // Mostrar modal con skeleton
        showProfileModalSkeleton();
        
        // Configurar listeners de cierre
        setupModalCloseListeners();
        
        // Obtener datos del usuario
        const userData = await getUserData(userId);
        
        if (!userData) {
            showProfileError('No se pudieron cargar los datos del usuario');
            return;
        }
        
        // Poblar modal
        populateProfileModal(userData);
        
    } catch (error) {
        profileError('Error abriendo perfil:', error);
        showProfileError('Error cargando el perfil');
    }
}
```

---

## 📋 **Implementación Paso a Paso**

### **Paso 1: Verificar HTML del Modal**
```html
<!-- VERIFICAR que existe este modal en community-view.html -->
<div class="user-profile-modal" id="userProfileModal" style="display: none;">
    <div class="modal-overlay" id="modalOverlay"></div>
    <div class="profile-card">
        <button class="close-btn" id="closeProfileModal">×</button>
        
        <!-- Header del Perfil -->
        <div class="profile-header">
            <div class="profile-avatar">
                <img src="" alt="Usuario" id="profileAvatar" class="avatar-img" style="display: none;">
                <div class="online-status" id="onlineStatus"></div>
            </div>
            <div class="profile-info">
                <h2 class="profile-name" id="profileName">Cargando...</h2>
                <p class="profile-username" id="profileUsername">@username</p>
                <div class="profile-badges">
                    <span class="role-badge" id="profileRole" style="display: none;">Admin</span>
                </div>
            </div>
        </div>

        <!-- Información Personal -->
        <div class="profile-section">
            <h3>Información Personal</h3>
            <div class="bio-section" id="bioSection" style="display: none;">
                <h4>Biografía</h4>
                <p id="profileBio">Descripción del usuario...</p>
            </div>
        </div>

        <!-- Estadísticas del Juego -->
        <div class="profile-section">
            <h3>Estadísticas</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-info">
                        <span class="stat-label">Liga</span>
                        <span class="stat-value" id="profileLeague">-</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <span class="stat-label">Puntos</span>
                        <span class="stat-value" id="profilePoints">0</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

### **Paso 2: Verificar Tarjetas de Miembros**
```html
<!-- VERIFICAR que las tarjetas tienen data-user-id -->
<div class="member-card" data-user-id="${m.id || m.user_id}" style="cursor: pointer;">
    <!-- contenido existente -->
</div>
```

### **Paso 3: Agregar JavaScript de Corrección**
```javascript
// AGREGAR al final de community-view.html, antes del </body>

<script>
// Sistema de logging controlado
const DEBUG_PROFILE = false;

function profileLog(message, data = null) {
    if (DEBUG_PROFILE) {
        console.log(`[PROFILE] ${message}`, data);
    }
}

function profileError(message, error = null) {
    console.error(`[PROFILE ERROR] ${message}`, error);
}

// Limpiar event listeners duplicados
function cleanupModalEventListeners() {
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.replaceWith(modal.cloneNode(true));
    }
}

// Configurar listeners de cierre del modal
function setupModalCloseListeners() {
    const modal = document.getElementById('userProfileModal');
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('closeProfileModal');
    
    if (!modal) return;
    
    // Cerrar con botón X
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeUserProfile();
        };
    }
    
    // Cerrar con click en overlay
    if (overlay) {
        overlay.onclick = (e) => {
            e.stopPropagation();
            closeUserProfile();
        };
    }
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            e.stopPropagation();
            closeUserProfile();
        }
    });
}

// Obtener datos del usuario
async function getUserData(userId) {
    if (!userId) {
        profileError('ID de usuario no proporcionado');
        return null;
    }
    
    try {
        if (!window.supabase) {
            profileError('Supabase no está disponible');
            return null;
        }
        
        const { data: userData, error } = await window.supabase
            .from('users')
            .select(`
                id, username, email, first_name, last_name, display_name,
                cargo_rol, type_rol, bio, location, phone, profile_picture_url,
                curriculum_url, linkedin_url, github_url, website_url,
                points, created_at, updated_at, last_login_at, email_verified
            `)
            .eq('id', userId)
            .single();

        if (error) {
            profileError('Error obteniendo datos del usuario:', error);
            return null;
        }
        
        profileLog('Datos del usuario obtenidos:', userData);
        return userData;
        
    } catch (error) {
        profileError('Error en getUserData:', error);
        return null;
    }
}

// Poblar modal con datos
function populateProfileModal(userData) {
    if (!userData) {
        profileError('No hay datos de usuario para mostrar');
        showProfileError('No se pudieron cargar los datos del usuario');
        return;
    }
    
    try {
        // Función helper para actualizar elementos
        const updateElement = (id, value, fallback = '') => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || fallback;
                element.style.display = value ? 'block' : 'none';
            } else {
                profileError(`Elemento con ID '${id}' no encontrado`);
            }
        };
        
        // Información básica
        const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        const displayName = fullName || userData.display_name || userData.username || 'Usuario';
        
        updateElement('profileName', displayName);
        updateElement('profileUsername', `@${userData.username}`);
        updateElement('profileRole', userData.cargo_rol);
        updateElement('profileBio', userData.bio);
        
        // Foto de perfil
        const avatarImg = document.getElementById('profileAvatar');
        if (avatarImg) {
            if (userData.profile_picture_url) {
                avatarImg.src = userData.profile_picture_url;
                avatarImg.style.display = 'block';
            } else {
                avatarImg.style.display = 'none';
            }
        }
        
        // Estadísticas básicas
        updateElement('profilePoints', userData.points || 0);
        
        // Calcular liga desde puntos
        const points = userData.points || 0;
        let leagueName = 'Liga Oro';
        if (points >= 1000) leagueName = 'Liga Diamante';
        else if (points >= 500) leagueName = 'Liga Platino';
        
        updateElement('profileLeague', leagueName);
        
        // Mostrar modal
        const modal = document.getElementById('userProfileModal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
        
    } catch (error) {
        profileError('Error poblando modal:', error);
        showProfileError('Error mostrando información del usuario');
    }
}

// Abrir perfil de usuario
async function openUserProfile(userId) {
    if (!userId) {
        profileError('ID de usuario no proporcionado');
        return;
    }
    
    try {
        // Limpiar listeners previos
        cleanupModalEventListeners();
        
        // Configurar listeners de cierre
        setupModalCloseListeners();
        
        // Obtener datos
        const userData = await getUserData(userId);
        
        if (!userData) {
            showProfileError('No se pudieron cargar los datos del usuario');
            return;
        }
        
        // Poblar modal
        populateProfileModal(userData);
        
    } catch (error) {
        profileError('Error abriendo perfil:', error);
        showProfileError('Error cargando el perfil');
    }
}

// Cerrar perfil
function closeUserProfile() {
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Mostrar skeleton loader
function showProfileModalSkeleton() {
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

// Mostrar error
function showProfileError(message) {
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.classList.remove('loading');
        // Aquí puedes agregar UI de error si es necesario
    }
    profileError(message);
}

// Configurar listeners para tarjetas de miembros
function setupMemberCardListeners() {
    document.querySelectorAll('.member-card').forEach(card => {
        card.removeEventListener('click', handleMemberCardClick);
        card.addEventListener('click', handleMemberCardClick);
    });
}

// Handler para click en tarjeta
function handleMemberCardClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const userId = this.dataset.userId;
    if (!userId) {
        profileError('ID de usuario no encontrado en la tarjeta');
        return;
    }
    
    profileLog('Abriendo perfil de usuario:', userId);
    openUserProfile(userId);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que se carguen las tarjetas de miembros
    setTimeout(() => {
        setupMemberCardListeners();
    }, 1000);
});

// También inicializar cuando se rendericen nuevos miembros
// Esto se puede llamar desde la función renderMembers existente
window.setupMemberCardListeners = setupMemberCardListeners;
</script>
```

---

## ✅ **Checklist de Corrección**

- [ ] Verificar que el modal HTML existe con los IDs correctos
- [ ] Verificar que las tarjetas de miembros tienen `data-user-id`
- [ ] Agregar el JavaScript de corrección al final del archivo
- [ ] Probar que el modal no se cierre automáticamente
- [ ] Probar que se carga la información del usuario
- [ ] Verificar que no hay console logs excesivos
- [ ] Probar en diferentes navegadores
- [ ] Verificar que la lógica existente sigue funcionando

---

## 🚨 **IMPORTANTE**

- **NO MODIFICAR** la lógica existente del backend
- **NO ELIMINAR** funciones existentes
- **SOLO AGREGAR** las correcciones necesarias
- **MANTENER** toda la funcionalidad actual
- **PROBAR** que todo sigue funcionando después de los cambios

El objetivo es **SOLO CORREGIR** los problemas identificados sin afectar el resto del sistema.
