# PROMPT: Sistema de Comunidades Dinámico con Enrutamiento por Parámetros URL

## Contexto del Proyecto

**IMPORTANTE:** La página principal `community.html` y sus estilos en `community.css` YA FUNCIONAN CORRECTAMENTE y NO deben ser modificados. El problema está únicamente en el sistema de enrutamiento de comunidades específicas.

**Problema actual:** Todas las comunidades redirigen a la misma vista general en `community-view.html` sin diferenciación.

**Solución requerida:** Implementar **Opción 1: Sistema de Parámetros URL** donde cada comunidad tenga su propia vista diferenciada usando una sola página (`community-view.html`) que se adapte dinámicamente según los parámetros de la URL.

**URLs objetivo:**
```
community-view.html?id=123&slug=sif-icap
community-view.html?id=124&slug=profesionales  
community-view.html?id=125&slug=openminder
community-view.html?id=126&slug=ecos-de-liderazgo
```

## Especificaciones Técnicas

Eres un ingeniero full-stack. Tienes que implementar la interfaz de Comunidades sobre una base de datos en Supabase con Row Level Security (RLS) ya configurado. Debes producir archivos completos (HTML/CSS/JS) listos para usar en un proyecto estático sin frameworks. No uses mocks; conéctate a Supabase con JS v2 (ESM). RLS controla el acceso; no repliques lógica de permisos en el frontend.

### Contexto de Negocio

Existen 4 comunidades con estos slugs:

- **profesionales** → visible sólo a usuarios que no tienen cursos activos y no pertenecen a comunidades cerradas.
- **openminder** → cerrada por invitación (membresía).
- **sif-icap** → cerrada por invitación (membresía).
- **ecos-de-liderazgo** → cerrada por invitación (membresía).

**IMPORTANTE:** La comunidad con slug "general" debe ser **FILTRADA** y NO aparecer en la lista pública de comunidades.

Usuario especial con acceso total por membresía: `8365d552-f342-4cd7-ae6b-dff8063a1377`.

### Esquema de Base de Datos

#### Tablas relevantes:

```sql
-- Tabla principal de comunidades
public.communities (
    id uuid PK, 
    name text, 
    description text, 
    slug text UNIQUE, 
    is_active boolean,
    community_type text, -- 'public', 'invite_only', 'course_based'
    theme_color text,    -- Color principal para personalización
    banner_image text,   -- URL de imagen de banner
    settings jsonb       -- Configuraciones específicas
)

-- Miembros de comunidades
public.community_members (
    id uuid PK, 
    community_id uuid FK, 
    user_id uuid FK, 
    role text,           -- 'member', 'admin', 'moderator'
    is_active boolean, 
    joined_at timestamptz
)

-- Posts de comunidades
public.community_posts (
    id uuid PK, 
    community_id uuid FK, 
    user_id uuid FK, 
    title text, 
    content text, 
    post_type text,      -- 'text', 'image', 'link', 'poll'
    attachment_url text,
    created_at timestamptz, 
    updated_at timestamptz,
    is_pinned boolean,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0
)

-- Reacciones a posts
public.community_reactions (
    id uuid PK, 
    user_id uuid FK, 
    post_id uuid FK, 
    reaction_type text,  -- 'like', 'love', 'laugh', 'angry', 'sad'
    created_at timestamptz
)

-- Comentarios en posts
public.community_comments (
    id uuid PK,
    post_id uuid FK,
    user_id uuid FK,
    content text,
    created_at timestamptz,
    updated_at timestamptz
)

-- Usuarios
public.users (
    id uuid PK, 
    email text, 
    display_name text, 
    first_name text,
    username text,
    profile_picture_url text,
    type_rol text,
    points integer DEFAULT 0
)

-- Progreso de cursos (para validar acceso)
public.course_progress (
    id uuid PK, 
    user_id uuid FK, 
    course_id uuid FK, 
    status text,
    completed_at timestamptz
)
```

### Seguridad (RLS) - Estado Actual

RLS está habilitado en: communities, community_posts, community_reactions, community_comments. Policies activas:

**communities:**
- `communities_profesionales_select`: muestra slug='profesionales' solo si el usuario no tiene filas en course_progress y no es miembro activo de openminder, sif-icap, ecos-de-liderazgo.
- `communities_invite_only_select`: muestra openminder, sif-icap, ecos-de-liderazgo solo a miembros activos en community_members.
- `communities_profesionales_member_select`: si un usuario es miembro activo de profesionales, puede verla.

**community_posts:**
- `posts_select_if_community_visible`: leer posts si la comunidad es visible por RLS.
- `posts_insert_if_allowed`: insertar si la comunidad es visible y user_id = auth.uid().
- `posts_update_own / posts_delete_own`: actualizar/eliminar sólo el autor.

**community_reactions:**
- `reactions_select_if_post_visible`: leer si el post es visible.
- `reactions_insert_if_allowed`: insertar si el post es visible y user_id = auth.uid().

## Estructura de Archivos Requerida

**ARCHIVOS QUE NO DEBES MODIFICAR:**
- `community.html` - YA FUNCIONA CORRECTAMENTE
- `community.css` - YA FUNCIONA CORRECTAMENTE  
- `community.js` - YA FUNCIONA CORRECTAMENTE

**ARCHIVOS A CREAR/MODIFICAR:**
```
/src/Community/
  community-view.html      # MODIFICAR: Vista dinámica de comunidad específica
  403.html                # CREAR: Acceso denegado
  404.html                # CREAR: Comunidad no encontrada
  community-view.css      # CREAR: Estilos específicos para vista de comunidad
  community-view.js       # CREAR/MODIFICAR: Lógica de vista específica con parámetros URL
```

## Requisitos de Implementación

### 1. Modificación en community.js (Solo Enlaces)

**ÚNICA MODIFICACIÓN REQUERIDA en el archivo existente:**
- Cambiar los enlaces de las tarjetas de comunidad para que redirijan a:
```javascript
`/src/Community/community-view.html?id=${community.id}&slug=${community.slug}`
```

**NO MODIFICAR nada más en community.html, community.css o la funcionalidad principal de community.js**

### 2. community-view.html (MODIFICAR: Vista Dinámica por Comunidad)

**REQUISITO PRINCIPAL - Sistema de Parámetros URL:**

1. **Extracción de parámetros:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const communityId = urlParams.get('id');
const communitySlug = urlParams.get('slug');

// Validaciones:
if (!communityId || !communitySlug) → redirect to '/src/Community/404.html'
```

2. **Carga de datos específicos de comunidad:**
```javascript
// Cargar comunidad específica
const { data: community } = await supabase
  .from('communities')
  .select('*')
  .eq('id', communityId)
  .eq('slug', communitySlug)
  .single();

if (!community) → redirect to '/src/Community/403.html'
```

3. **Personalización dinámica por comunidad:**

**Para SIF ICAP (slug: 'sif-icap'):**
- Color tema: Dorado (#FFD700)
- Banner específico
- Secciones: Posts, Recursos, Eventos
- Funcionalidad de documentos compartidos

**Para Profesionales (slug: 'profesionales'):**
- Color tema: Azul (#4A90E2)
- Enfoque en networking
- Secciones: Posts, Miembros, Oportunidades

**Para OpenMinder (slug: 'openminder'):**
- Color tema: Verde (#28A745)
- Enfoque en innovación
- Secciones: Posts, Ideas, Colaboraciones

**Para Ecos de Liderazgo (slug: 'ecos-de-liderazgo'):**
- Color tema: Púrpura (#6F42C1)
- Enfoque en liderazgo
- Secciones: Posts, Mentorías, Recursos

4. **Funcionalidades específicas por comunidad:**

**Sistema de pestañas dinámicas:**
```javascript
const tabs = getCommunityTabs(community.slug);
// Retorna diferentes pestañas según la comunidad
```

**Carga de posts filtrados:**
```javascript
from('community_posts')
.select(`
  id, title, content, created_at, updated_at, 
  post_type, attachment_url, is_pinned,
  likes_count, comments_count,
  users!community_posts_user_id_fkey(display_name, username, profile_picture_url)
`)
.eq('community_id', communityId)
.order('is_pinned', { ascending: false })
.order('created_at', { ascending: false })
```

**Composer de posts dinámico:**
- Campos diferentes según el tipo de comunidad
- Validaciones específicas
- Tipos de post permitidos por comunidad

### 3. community-view.css (CREAR: Personalización Visual Dinámica)

**Crear archivo separado community-view.css con:**
```css
/* Variables CSS dinámicas por comunidad */
:root {
  --community-primary: #0066CC;
  --community-secondary: #0052A3;
  --community-accent: #3388DD;
}

[data-community="sif-icap"] {
  --community-primary: #FFD700;
  --community-secondary: #FFA500;
  --community-accent: #FF8C00;
}

[data-community="profesionales"] {
  --community-primary: #4A90E2;
  --community-secondary: #357ABD;
  --community-accent: #2E6DA4;
}

[data-community="openminder"] {
  --community-primary: #28A745;
  --community-secondary: #20C997;
  --community-accent: #17A2B8;
}

[data-community="ecos-de-liderazgo"] {
  --community-primary: #6F42C1;
  --community-secondary: #6610F2;
  --community-accent: #E83E8C;
}

/* Estilos específicos para community-view que usen las variables */
.community-header {
  background: linear-gradient(135deg, var(--community-primary), var(--community-secondary));
}

.community-accent-elements {
  color: var(--community-accent);
}
```

**Aplicación dinámica en JavaScript:**
```javascript
document.body.setAttribute('data-community', community.slug);
document.documentElement.style.setProperty('--community-primary', community.theme_color);
```

### 4. Sistema de Estados y Navegación

**Manejo de errores:**
- RLS bloquea → 0 filas → redirect a `403.html`
- Comunidad no existe → redirect a `404.html`
- Error de conexión → mostrar mensaje y retry

**Navegación:**
- Breadcrumbs: Inicio > Comunidades > [Nombre Comunidad]
- Botón "Volver a Comunidades"
- Enlaces internos mantienen parámetros

### 5. Funcionalidades Avanzadas por Comunidad

**Sistema de roles:**
```javascript
const userRole = await getUserRoleInCommunity(communityId, userId);
// Mostrar funciones según el rol: member, moderator, admin
```

**Miembros (solo comunidades cerradas):**
```javascript
if (community.community_type === 'invite_only') {
  // Cargar y mostrar lista de miembros
  const members = await loadCommunityMembers(communityId);
}
```

**Recursos específicos:**
```javascript
// Para SIF ICAP: documentos y enlaces
// Para Profesionales: oportunidades de trabajo
// Para OpenMinder: herramientas de innovación
// Para Ecos de Liderazgo: recursos de liderazgo
```

## Configuración Técnica

### config.js
```javascript
window.SUPABASE_URL = '<<SUPABASE_URL>>'
window.SUPABASE_ANON_KEY = '<<SUPABASE_ANON_KEY>>'

// Configuraciones por comunidad
window.COMMUNITY_CONFIGS = {
  'sif-icap': {
    theme: 'gold',
    features: ['documents', 'events', 'certifications'],
    layout: 'corporate'
  },
  'profesionales': {
    theme: 'blue', 
    features: ['networking', 'jobs', 'mentoring'],
    layout: 'professional'
  },
  'openminder': {
    theme: 'green',
    features: ['innovation', 'collaboration', 'ideas'],
    layout: 'creative'
  },
  'ecos-de-liderazgo': {
    theme: 'purple',
    features: ['leadership', 'mentoring', 'resources'],
    layout: 'executive'
  }
};
```

## Criterios de Aceptación

### Funcionales:
1. **Enrutamiento dinámico:** URLs con parámetros funcionan correctamente
2. **Filtrado:** Comunidad "general" no aparece en listado público
3. **Personalización:** Cada comunidad se ve diferente (colores, layout, funciones)
4. **Seguridad:** RLS respetado, redirecciones correctas en caso de acceso denegado
5. **Responsive:** Funciona en móvil, tablet y desktop
6. **Performance:** Carga rápida, lazy loading de imágenes

### Técnicos:
1. **Sin frameworks:** Vanilla JS con ESM
2. **Accesibilidad:** WCAG 2.1 AA compliant
3. **SEO:** Meta tags dinámicos por comunidad
4. **PWA ready:** Service worker compatible
5. **Error handling:** Manejo robusto de errores de red y permisos

## Entregables

**SOLO 6 archivos (NO MODIFICAR community.html, community.css):**

1. **community.js** - SOLO modificar los enlaces para incluir parámetros URL
2. **community-view.html** - MODIFICAR: Vista dinámica con parámetros URL  
3. **community-view.css** - CREAR: Estilos específicos para vista de comunidad
4. **community-view.js** - CREAR: Lógica de vista específica con personalización
5. **403.html** - CREAR: Página de acceso denegado
6. **404.html** - CREAR: Página de comunidad no encontrada

**Requisitos de entrega:**
- Código completo sin TODOs
- Comentarios explicativos en funciones clave
- Manejo de errores robusto
- Sanitización de contenido (prevención XSS)
- Compatible con todos los navegadores modernos
- Optimizado para rendimiento

**Placeholders permitidos:**
- `<<SUPABASE_URL>>`
- `<<SUPABASE_ANON_KEY>>`

---

**NOTAS IMPORTANTES:**

1. **NO MODIFICAR:** `community.html`, `community.css` - Estos archivos YA FUNCIONAN CORRECTAMENTE
2. **SOLO MODIFICAR:** Los enlaces en `community.js` para incluir parámetros URL
3. **ENFOQUE:** El sistema debe funcionar como una SPA donde `community-view.html` es una sola página que se transforma completamente según la comunidad usando los parámetros `id` y `slug` de la URL
4. **PRESERVAR:** Toda la funcionalidad existente de la página principal de comunidades
5. **FILTRAR:** La comunidad "general" NO debe aparecer en el listado público
