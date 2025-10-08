# PROMPT: Implementar Tarjeta de Perfil de Usuario Desplegable

## Contexto
Necesito implementar una funcionalidad donde al hacer clic en cualquier miembro de la comunidad, se despliegue una tarjeta modal con información completa del usuario.

## Estructura de la Tarjeta de Perfil

### 1. **Diseño Visual**
- **Modal overlay**: Fondo oscuro semi-transparente que cubre toda la pantalla
- **Tarjeta central**: Modal glassmorphism centrado en la pantalla
- **Animación de entrada**: Efecto de fade-in y scale-up suave
- **Botón de cierre**: X en la esquina superior derecha
- **Responsive**: Se adapta a móviles y tablets

### 2. **Información a Mostrar**

#### **Header del Perfil**
- **Foto de perfil**: Circular, grande (120px), con borde elegante
- **Nombre completo**: Nombre + Apellido en tipografía grande
- **Username**: @username en color secundario
- **Cargo/Rol**: Badge distintivo (Admin, Moderador, Miembro, etc.)
- **Estado online**: Indicador verde con animación pulse si está en línea

#### **Sección de Información Personal**
- **Biografía**: Texto descriptivo del usuario (máximo 200 caracteres)
- **CV/Experiencia**: Información profesional o académica
- **Fecha de registro**: "Miembro desde [fecha]"
- **Ubicación**: Si está disponible

#### **Sección de Estadísticas del Juego**
- **Liga actual**: Badge con el nombre de la liga y su color distintivo
- **Puntos totales**: Número grande y prominente
- **Ranking**: Posición en la comunidad (ej: "#15 de 150 miembros")
- **Actividad**: Última vez visto, posts realizados, etc.

### 3. **Funcionalidades Interactivas**

#### **Botones de Acción**
- **Enviar mensaje**: Botón primario azul
- **Ver posts**: Botón secundario
- **Seguir/Dejar de seguir**: Si aplica
- **Reportar usuario**: Botón de emergencia (solo si es necesario)

#### **Navegación**
- **Cerrar con ESC**: Tecla Escape cierra el modal
- **Cerrar con click fuera**: Click en el overlay cierra el modal
- **Scroll interno**: Si el contenido es muy largo, scroll dentro del modal

### 4. **Estructura HTML Sugerida**

```html
<!-- Modal de Perfil de Usuario -->
<div class="user-profile-modal" id="userProfileModal">
    <div class="modal-overlay" id="modalOverlay"></div>
    <div class="profile-card">
        <button class="close-btn" id="closeProfileModal">×</button>
        
        <!-- Header del Perfil -->
        <div class="profile-header">
            <div class="profile-avatar">
                <img src="avatar-url" alt="Usuario" class="avatar-img">
                <div class="online-status"></div>
            </div>
            <div class="profile-info">
                <h2 class="profile-name">Nombre Completo</h2>
                <p class="profile-username">@username</p>
                <div class="profile-badges">
                    <span class="role-badge admin">Admin</span>
                    <span class="league-badge">Liga Diamante</span>
                </div>
            </div>
        </div>

        <!-- Información Personal -->
        <div class="profile-section">
            <h3>Información Personal</h3>
            <div class="info-grid">
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>Miembro desde Marzo 2024</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Ciudad, País</span>
                </div>
            </div>
            <div class="bio-section">
                <h4>Biografía</h4>
                <p>Descripción del usuario...</p>
            </div>
            <div class="cv-section">
                <h4>Experiencia</h4>
                <p>Información profesional...</p>
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
                        <span class="stat-value">Diamante</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <span class="stat-label">Puntos</span>
                        <span class="stat-value">1,250</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <span class="stat-label">Ranking</span>
                        <span class="stat-value">#15 de 150</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Botones de Acción -->
        <div class="profile-actions">
            <button class="btn-primary">Enviar Mensaje</button>
            <button class="btn-secondary">Ver Posts</button>
        </div>
    </div>
</div>
```

### 5. **Estilos CSS Requeridos**

#### **Modal Base**
- Fondo overlay: `rgba(0, 0, 0, 0.8)` con `backdrop-filter: blur(10px)`
- Tarjeta centrada: `max-width: 600px`, `margin: auto`, `border-radius: 20px`
- Animación de entrada: `transform: scale(0.9) → scale(1)` con `opacity: 0 → 1`

#### **Glassmorphism**
- Fondo de la tarjeta: `rgba(255, 255, 255, 0.1)` con `backdrop-filter: blur(20px)`
- Bordes: `1px solid rgba(255, 255, 255, 0.2)`
- Sombras: `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3)`

#### **Elementos Específicos**
- Avatar: `120px`, circular, con `border: 3px solid rgba(68, 229, 255, 0.5)`
- Badges: Gradientes según el tipo (Admin: azul, Liga: dorado, etc.)
- Botones: Estilo consistente con el resto de la aplicación

### 6. **JavaScript Requerido**

#### **Funcionalidades Básicas**
```javascript
// Abrir modal al hacer clic en un miembro
document.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('click', (e) => {
        const userId = card.dataset.userId;
        openUserProfile(userId);
    });
});

// Obtener datos completos del usuario desde Supabase
async function getUserData(userId) {
    try {
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

        return userData;
    } catch (error) {
        console.error('Error en getUserData:', error);
        return null;
    }
}

// Abrir modal con datos del usuario
async function openUserProfile(userId) {
    // Mostrar modal con skeleton loader
    showProfileModalSkeleton();
    
    try {
        // Obtener datos del usuario
        const userData = await getUserData(userId);
        
        if (!userData) {
            showProfileError('No se pudieron cargar los datos del usuario');
            return;
        }
        
        // Poblar el modal con los datos
        populateProfileModal(userData);
        
    } catch (error) {
        console.error('Error abriendo perfil:', error);
        showProfileError('Error cargando el perfil');
    }
}

// Poblar modal con datos del usuario
function populateProfileModal(userData) {
    // Información básica
    document.getElementById('profileName').textContent = 
        `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 
        userData.display_name || userData.username;
    
    document.getElementById('profileUsername').textContent = `@${userData.username}`;
    
    // Foto de perfil
    const avatarImg = document.getElementById('profileAvatar');
    if (userData.profile_picture_url) {
        avatarImg.src = userData.profile_picture_url;
        avatarImg.style.display = 'block';
    } else {
        avatarImg.style.display = 'none';
    }
    
    // Información profesional
    if (userData.cargo_rol) {
        document.getElementById('profileRole').textContent = userData.cargo_rol;
        document.getElementById('profileRole').style.display = 'block';
    }
    
    // Biografía
    if (userData.bio) {
        document.getElementById('profileBio').textContent = userData.bio;
        document.getElementById('bioSection').style.display = 'block';
    }
    
    // Enlaces profesionales
    updateProfileLinks(userData);
    
    // Estadísticas de liga
    updateProfileStats(userData);
    
    // Mostrar modal
    const modal = document.getElementById('userProfileModal');
    modal.classList.add('active');
}

// Actualizar enlaces profesionales
function updateProfileLinks(userData) {
    const links = [
        { key: 'curriculum_url', element: 'cvLink', icon: 'fas fa-file-pdf', text: 'Ver CV' },
        { key: 'linkedin_url', element: 'linkedinLink', icon: 'fab fa-linkedin', text: 'LinkedIn' },
        { key: 'github_url', element: 'githubLink', icon: 'fab fa-github', text: 'GitHub' },
        { key: 'website_url', element: 'websiteLink', icon: 'fas fa-globe', text: 'Sitio Web' }
    ];
    
    links.forEach(link => {
        const element = document.getElementById(link.element);
        if (userData[link.key] && element) {
            element.href = userData[link.key];
            element.style.display = 'flex';
        } else if (element) {
            element.style.display = 'none';
        }
    });
}

// Actualizar estadísticas y liga
function updateProfileStats(userData) {
    const points = userData.points || 0;
    const league = getUserLeague(points);
    
    // Actualizar puntos
    document.getElementById('profilePoints').textContent = points.toLocaleString();
    
    // Actualizar liga
    document.getElementById('profileLeague').textContent = league.name;
    document.getElementById('profileLeague').style.color = league.color;
    
    // Calcular ranking (esto requeriría una consulta adicional)
    // Por ahora usar un placeholder
    document.getElementById('profileRanking').textContent = '#-- de --';
    
    // Fecha de registro
    if (userData.created_at) {
        const joinDate = new Date(userData.created_at);
        document.getElementById('profileJoinDate').textContent = 
            `Miembro desde ${joinDate.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long' 
            })}`;
    }
    
    // Última actividad
    if (userData.last_login_at) {
        const lastLogin = new Date(userData.last_login_at);
        const now = new Date();
        const diffMs = now - lastLogin;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        let lastSeenText;
        if (diffMinutes < 60) {
            lastSeenText = `Visto hace ${diffMinutes} min`;
        } else if (diffMinutes < 1440) {
            lastSeenText = `Visto hace ${Math.floor(diffMinutes / 60)} horas`;
        } else {
            lastSeenText = `Visto hace ${Math.floor(diffMinutes / 1440)} días`;
        }
        
        document.getElementById('profileLastSeen').textContent = lastSeenText;
    }
}

// Cerrar modal
function closeUserProfile() {
    const modal = document.getElementById('userProfileModal');
    modal.classList.remove('active');
}

// Mostrar skeleton loader
function showProfileModalSkeleton() {
    const modal = document.getElementById('userProfileModal');
    modal.classList.add('active', 'loading');
}

// Mostrar error
function showProfileError(message) {
    const modal = document.getElementById('userProfileModal');
    modal.classList.remove('loading');
    // Implementar UI de error
}
```

#### **Obtener Datos del Usuario**
- **Desde la lista actual**: Si el usuario ya está en la lista de miembros
- **Desde la base de datos**: Consulta adicional para obtener información completa
- **Datos requeridos**: nombre, apellido, username, cargo, biografía, CV, liga, puntos

### 7. **Responsive Design**

#### **Desktop (1200px+)**
- Modal: `max-width: 600px`
- Grid de 2 columnas para estadísticas
- Avatar grande (120px)

#### **Tablet (768px - 1199px)**
- Modal: `max-width: 90%`
- Grid de 2 columnas
- Avatar mediano (100px)

#### **Móvil (< 768px)**
- Modal: `width: 95%`, `height: 90vh`
- Grid de 1 columna
- Avatar pequeño (80px)
- Scroll interno si es necesario

### 8. **Estructura de la Base de Datos**

#### **Tabla `users` - Campos Disponibles**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | Identificador único del usuario (PRIMARY KEY) |
| `username` | text | Nombre de usuario único |
| `email` | text | Correo electrónico del usuario |
| `password_hash` | text | Hash de la contraseña (no mostrar) |
| `created_at` | timestamptz | Fecha y hora de registro |
| `updated_at` | timestamptz | Última actualización del perfil |
| `last_login_at` | timestamptz | Último inicio de sesión |
| `cargo_rol` | text | Cargo o rol del usuario en la organización |
| `type_rol` | text | Tipo de rol (admin, moderator, member, etc.) |
| `first_name` | text | Nombre(s) del usuario |
| `last_name` | text | Apellido(s) del usuario |
| `display_name` | text | Nombre para mostrar públicamente |
| `phone` | varchar | Número de teléfono |
| `bio` | text | Biografía personal del usuario |
| `location` | text | Ubicación geográfica |
| `profile_picture_url` | text | URL de la foto de perfil |
| `curriculum_url` | text | URL del CV o currículum |
| `linkedin_url` | text | URL del perfil de LinkedIn |
| `github_url` | text | URL del perfil de GitHub |
| `website_url` | text | URL del sitio web personal |
| `email_verified` | bool | Si el email está verificado |
| `email_verified_at` | timestamptz | Fecha de verificación del email |
| `role_zoom` | text | Rol específico para Zoom |
| `points` | int4 | Puntos acumulados en el sistema de gamificación |

#### **Campos Clave para el Modal de Perfil**

**Información Personal:**
- `first_name` + `last_name` → Nombre completo
- `display_name` → Nombre para mostrar (fallback)
- `username` → @username
- `email` → Correo (solo si es público)
- `bio` → Biografía personal
- `location` → Ubicación
- `phone` → Teléfono (si es público)

**Información Profesional:**
- `cargo_rol` → Cargo que desempeña
- `type_rol` → Tipo de rol (Admin, Moderador, etc.)
- `curriculum_url` → CV/Currículum
- `linkedin_url` → Perfil de LinkedIn
- `github_url` → Perfil de GitHub
- `website_url` → Sitio web personal

**Estadísticas y Actividad:**
- `points` → Puntos totales para calcular liga
- `created_at` → "Miembro desde [fecha]"
- `last_login_at` → "Última vez visto"
- `updated_at` → Última actividad

**Visual:**
- `profile_picture_url` → Foto de perfil

#### **Cálculo de Liga desde Puntos**
```javascript
function getUserLeague(points) {
    if (points >= 1000) return { name: 'Liga Diamante', color: '#B9F2FF', icon: '💎' };
    if (points >= 500) return { name: 'Liga Platino', color: '#E5E4E2', icon: '🥈' };
    return { name: 'Liga Oro', color: '#FFD700', icon: '🥇' };
}
```

### 9. **Integración con Sistema Existente**

#### **Consulta SQL para Obtener Datos del Usuario**
```sql
SELECT 
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
FROM users 
WHERE id = $1;
```

#### **Ejemplo de Datos del Usuario**
```javascript
const exampleUserData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    username: "fernando_suarez",
    email: "fernando@example.com",
    first_name: "Fernando",
    last_name: "Suárez",
    display_name: "Fernando SSuarez",
    cargo_rol: "Desarrollador Senior",
    type_rol: "admin",
    bio: "Desarrollador full-stack con 5 años de experiencia en React y Node.js. Apasionado por la IA y las tecnologías emergentes.",
    location: "Madrid, España",
    phone: "+34 600 123 456",
    profile_picture_url: "https://example.com/avatar.jpg",
    curriculum_url: "https://example.com/cv.pdf",
    linkedin_url: "https://linkedin.com/in/fernando-suarez",
    github_url: "https://github.com/fernando-suarez",
    website_url: "https://fernando-dev.com",
    points: 1250,
    created_at: "2024-03-15T10:30:00Z",
    updated_at: "2024-09-20T15:45:00Z",
    last_login_at: "2024-09-20T14:20:00Z",
    email_verified: true
};
```

#### **Datos de Miembros**
- Usar la estructura de la tabla `users` de Supabase
- Los datos ya están disponibles en el sistema
- Mantener compatibilidad con el sistema de puntos y ligas

#### **Estilos Consistentes**
- Usar las mismas variables CSS del proyecto
- Mantener el color azul principal (#0066CC)
- Aplicar el mismo sistema de glassmorphism

#### **Funcionalidades Existentes**
- Integrar con el sistema de mensajes si existe
- Conectar con el sistema de ligas y puntos
- Mantener la funcionalidad de búsqueda

### 9. **Consideraciones de UX**

#### **Carga de Datos**
- Mostrar skeleton loader mientras se cargan los datos
- Manejar errores de carga gracefully
- Cache de perfiles visitados recientemente

#### **Accesibilidad**
- Navegación por teclado (Tab, Enter, Escape)
- ARIA labels para lectores de pantalla
- Contraste adecuado en todos los elementos

#### **Performance**
- Lazy loading de imágenes de perfil
- Debounce en eventos de clic
- Limpieza de event listeners al cerrar modal

### 10. **Modificaciones al HTML Existente**

#### **Agregar data-user-id a las Tarjetas de Miembros**

**Ubicación**: Líneas ~2779 y ~4377 en `community-view.html`

**Cambio requerido**:
```html
<!-- ANTES -->
<div class="member-card">

<!-- DESPUÉS -->
<div class="member-card" data-user-id="${m.id || m.user_id}" style="cursor: pointer;">
```

**Ejemplo completo**:
```html
<div class="member-card" data-user-id="${m.id || m.user_id}" style="cursor: pointer;">
    <div class="member-avatar">
        ${m.avatar && m.avatar !== 'fas fa-user' && m.avatar.startsWith('http') ?
            `<img src="${m.avatar}" alt="${m.name}" class="member-avatar-img">` :
            `<i class="fas fa-user"></i>`
        }
        ${m.online ? '<span class="member-status"></span>' : ''}
    </div>
    <div class="member-info">
        <div class="member-name">
            ${m.name} 
            ${m.admin ? '<span class="member-badge admin">Admin</span>':''}
            ${m.online ? '<span class="member-badge online">En línea</span>':''}
        </div>
        <div class="member-meta">
            <!-- Resto del contenido... -->
        </div>
    </div>
</div>
```

### 11. **Archivos a Modificar/Crear**

#### **Archivos Existentes a Modificar**
- `src/Community/community-view.html`: 
  - Agregar modal HTML al final del body
  - Agregar `data-user-id` a tarjetas de miembros
  - Agregar JavaScript del modal
- `src/Community/community.css`: 
  - Agregar estilos del modal
  - Agregar estilos para cursor pointer en tarjetas

#### **Nuevos Archivos (Opcional)**
- `src/Community/user-profile-modal.js`: JavaScript específico del modal
- `src/Community/user-profile.css`: Estilos específicos del modal

### 11. **Testing y Validación**

#### **Casos de Prueba**
- Abrir modal con diferentes tipos de usuarios
- Verificar responsive en diferentes dispositivos
- Probar navegación por teclado
- Validar carga de datos desde diferentes fuentes

#### **Datos de Prueba**
- Usuarios con información completa
- Usuarios con información parcial
- Usuarios con diferentes roles y ligas
- Usuarios online y offline

---

## Instrucciones de Implementación

1. **Crear la estructura HTML** del modal en `community-view.html`
2. **Agregar los estilos CSS** necesarios en `community.css`
3. **Implementar el JavaScript** para abrir/cerrar modal y cargar datos
4. **Agregar event listeners** a las tarjetas de miembros existentes
5. **Probar responsive** en diferentes dispositivos
6. **Integrar con datos** del sistema de puntos y ligas existente

El modal debe mantener la estética glassmorphism y el color azul principal del proyecto, proporcionando una experiencia de usuario fluida y profesional.

---

## 🎯 **Consideraciones Importantes**

### **Privacidad y Seguridad**
- **Información pública**: Solo mostrar datos que el usuario ha marcado como públicos
- **Campos sensibles**: No mostrar email, teléfono o información privada sin permisos
- **Validación**: Verificar permisos antes de mostrar información sensible

### **Performance**
- **Cache**: Guardar perfiles visitados recientemente en localStorage
- **Lazy loading**: Cargar imágenes solo cuando sea necesario
- **Debounce**: Evitar múltiples clicks rápidos

### **UX/UI**
- **Loading states**: Mostrar skeleton mientras se cargan los datos
- **Error handling**: Manejar errores de red gracefully
- **Feedback visual**: Indicar claramente que las tarjetas son clickeables

### **Accesibilidad**
- **Keyboard navigation**: Tab, Enter, Escape
- **Screen readers**: ARIA labels apropiados
- **Focus management**: Manejar el foco correctamente

---

## 📋 **Checklist de Implementación**

- [ ] Crear estructura HTML del modal
- [ ] Agregar estilos CSS glassmorphism
- [ ] Implementar JavaScript para abrir/cerrar modal
- [ ] Agregar data-user-id a tarjetas existentes
- [ ] Conectar con base de datos Supabase
- [ ] Implementar cálculo de liga desde puntos
- [ ] Agregar skeleton loader
- [ ] Implementar manejo de errores
- [ ] Probar responsive design
- [ ] Validar accesibilidad
- [ ] Optimizar performance
- [ ] Testing en diferentes navegadores

---

## 🚀 **Resultado Esperado**

Al completar esta implementación, los usuarios podrán:

1. **Hacer clic** en cualquier miembro de la comunidad
2. **Ver un modal elegante** con información completa del usuario
3. **Navegar fácilmente** por la información (biografía, CV, estadísticas)
4. **Interactuar** con enlaces profesionales (LinkedIn, GitHub, etc.)
5. **Ver estadísticas de gamificación** (liga, puntos, ranking)
6. **Cerrar el modal** de múltiples formas (ESC, click fuera, botón X)

La funcionalidad será completamente responsive y mantendrá la estética glassmorphism del proyecto.
