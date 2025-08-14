# PROMPT PARA PANEL DE ADMINISTRADOR CON VALIDACIÓN DE BASE DE DATOS

Eres un desarrollador full-stack senior especializado en crear interfaces de administración modernas y funcionales. Debes crear un panel de administrador completo para el proyecto Chat-Bot-LIA que incluya validación de base de datos específica para controlar el acceso.

## Objetivo General
Crear un panel de administrador completo con las siguientes funcionalidades:
- Gestión de cursos (crear, editar, eliminar, publicar/despublicar)
- Gestión de noticias (crear, editar, eliminar, programar)
- Administración de comunidades (usuarios, roles, permisos)
- Gestión de información general del sitio
- Sistema de permisos y roles
- Dashboard con estadísticas y métricas
- Gestión de contenido multimedia
- Configuraciones del sistema

## VALIDACIÓN CRÍTICA DE ACCESO - BASE DE DATOS

### Estructura de la tabla `users`:
```sql
CREATE TABLE users (
    id uuid PRIMARY KEY,
    full_name text NOT NULL,
    username citext UNIQUE NOT NULL,
    email citext UNIQUE NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    last_login_at timestamptz,
    cargo_rol text,           -- Campo CRÍTICO para validación
    type_rol text
);
```

### Validación de Acceso al Panel Admin:
- **Solo usuarios con `cargo_rol = 'Administrador'` pueden acceder al panel**
- **Validación obligatoria en cada endpoint del panel admin**
- **Middleware de autenticación que verifique el `cargo_rol` en la base de datos**
- **Redirección automática si el usuario no es administrador**

### Implementación de la Validación:
```javascript
// Middleware de validación de admin
const validateAdminAccess = async (req, res, next) => {
    try {
        // Verificar que el usuario esté autenticado
        if (!req.session.userId) {
            return res.redirect('/login');
        }
        
        // Consultar la base de datos para verificar cargo_rol
        const user = await db.query(
            'SELECT cargo_rol FROM users WHERE id = $1',
            [req.session.userId]
        );
        
        // Validar que el cargo_rol sea 'Administrador'
        if (!user.rows[0] || user.rows[0].cargo_rol !== 'Administrador') {
            return res.status(403).json({
                error: 'Acceso denegado. Se requieren permisos de administrador.'
            });
        }
        
        next();
    } catch (error) {
        console.error('Error validando acceso de admin:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};
```

## Especificaciones Técnicas

### Tecnologías a utilizar:
- **Frontend**: HTML5, CSS3, JavaScript vanilla (sin frameworks)
- **Backend**: Node.js con Express (integrar con el servidor existente)
- **Base de datos**: PostgreSQL con la tabla `users` existente
- **Autenticación**: Integrar con el sistema de login existente + validación de `cargo_rol`

### Estructura de archivos a crear:
```
src/admin/
├── admin.html          # Página principal del panel
├── admin.css           # Estilos del panel
├── admin.js            # Lógica principal
├── components/
│   ├── dashboard.js    # Componente del dashboard
│   ├── courses.js      # Gestión de cursos
│   ├── news.js         # Gestión de noticias
│   ├── users.js        # Gestión de usuarios
│   ├── permissions.js  # Sistema de permisos
│   └── settings.js     # Configuraciones
└── assets/
    ├── icons/          # Iconos del panel
    └── images/         # Imágenes específicas
```

## Diseño y UX

### Paleta de colores (mantener consistencia con el proyecto):
- **Primario**: #44E5FF (Turquesa IA)
- **Fondo oscuro**: #0A0A0A (Carbón Digital)
- **Fondo claro**: #F2F2F2 (Gris Neblina)
- **Contraste**: #FFFFFF (Blanco Puro)
- **Acento**: #0077A6 (Azul Profundo)

### Tipografías:
- **Títulos**: Montserrat (ExtraBold 800)
- **Cuerpo**: Inter (Regular 400, Medium 500)

### Características de diseño:
- **Layout**: Sidebar fijo + contenido principal responsive
- **Navegación**: Menú lateral con iconos y texto
- **Cards**: Diseño tipo dashboard con sombras sutiles
- **Botones**: Estilo consistente con el proyecto
- **Formularios**: Diseño moderno con validaciones
- **Tablas**: Responsive con paginación
- **Modales**: Para confirmaciones y formularios complejos

## Funcionalidades Detalladas

### 1. Dashboard Principal
- **Estadísticas en tiempo real**:
  - Usuarios activos
  - Cursos publicados
  - Noticias activas
  - Mensajes del chat
- **Gráficos interactivos**:
  - Actividad de usuarios
  - Cursos más populares
  - Tendencias de uso
- **Notificaciones**:
  - Alertas del sistema
  - Mensajes pendientes
  - Actualizaciones requeridas

### 2. Gestión de Cursos
- **CRUD completo**:
  - Crear nuevo curso con editor rico
  - Editar cursos existentes
  - Eliminar cursos (con confirmación)
  - Duplicar cursos
- **Campos del curso**:
  - Título y descripción
  - Imagen de portada
  - Categoría y tags
  - Duración estimada
  - Nivel de dificultad
  - Contenido (módulos y sesiones)
  - Estado (borrador/publicado/archivado)
- **Funcionalidades adicionales**:
  - Vista previa del curso
  - Estadísticas de participación
  - Gestión de materiales adjuntos
  - Programación de publicación

### 3. Gestión de Noticias
- **CRUD completo**:
  - Crear noticias con editor rico
  - Editar y actualizar
  - Eliminar con confirmación
- **Campos de noticia**:
  - Título y contenido
  - Imagen destacada
  - Categoría
  - Tags
  - Autor
  - Fecha de publicación
  - Estado (borrador/publicado)
- **Funcionalidades**:
  - Programación de publicación
  - Vista previa
  - SEO (meta descripción, keywords)
  - Compartir en redes sociales

### 4. Administración de Comunidades
- **Gestión de usuarios**:
  - Lista de usuarios con filtros
  - Perfiles detallados
  - Historial de actividad
  - Estado de cuenta (activo/suspendido)
  - **Modificación de `cargo_rol`** (solo para administradores)
- **Sistema de roles basado en `cargo_rol`**:
  - Administrador (acceso total al panel)
  - Usuario (acceso limitado)
- **Permisos granulares**:
  - Acceso a cursos
  - Creación de contenido
  - Moderación de comentarios
  - Acceso al panel de admin

### 5. Sistema de Permisos
- **Roles basados en `cargo_rol`**:
  - Administrador (`cargo_rol = 'Administrador'`)
  - Usuario (`cargo_rol = 'Usuario'`)
- **Permisos personalizables**:
  - Crear/editar/eliminar cursos
  - Gestionar noticias
  - Moderar usuarios
  - Ver estadísticas
  - Configurar sistema
- **Gestión de acceso**:
  - Asignar/remover roles
  - Permisos temporales
  - Log de cambios

### 6. Configuraciones del Sistema
- **Configuración general**:
  - Nombre del sitio
  - Logo y favicon
  - Información de contacto
  - Redes sociales
- **Configuración del chat**:
  - Mensaje de bienvenida
  - Configuración de IA
  - Límites de uso
- **Configuración de seguridad**:
  - Política de contraseñas
  - Autenticación de dos factores
  - Límites de intentos de login
- **Configuración de email**:
  - SMTP settings
  - Plantillas de email
  - Notificaciones automáticas

### 7. Funcionalidades Adicionales
- **Gestión de contenido multimedia**:
  - Subida de imágenes
  - Gestión de archivos
  - Optimización automática
- **Backup y mantenimiento**:
  - Exportar/importar datos
  - Limpieza de base de datos
  - Logs del sistema
- **Integración con APIs**:
  - Analytics
  - Redes sociales
  - Servicios externos

## Especificaciones de Implementación

### HTML (admin.html)
- **Estructura semántica** con header, nav, main, footer
- **Sidebar responsive** con navegación principal
- **Área de contenido** con breadcrumbs
- **Modales** para formularios y confirmaciones
- **Accesibilidad** completa (ARIA labels, navegación por teclado)

### CSS (admin.css)
- **Grid y Flexbox** para layouts responsive
- **Variables CSS** para consistencia de colores
- **Animaciones suaves** para transiciones
- **Media queries** para dispositivos móviles
- **Estilos para componentes** (cards, botones, formularios, tablas)

### JavaScript (admin.js)
- **Arquitectura modular** con ES6 modules
- **Gestión de estado** centralizada
- **Validación de formularios** en tiempo real
- **Manejo de errores** robusto
- **Integración con APIs** del servidor
- **LocalStorage** para preferencias del usuario

### Componentes JavaScript
- **Dashboard**: Gráficos y estadísticas
- **Courses**: CRUD de cursos con editor rico
- **News**: Gestión de noticias
- **Users**: Administración de usuarios
- **Permissions**: Sistema de roles y permisos
- **Settings**: Configuraciones del sistema

## Integración con el Proyecto Existente

### Servidor (server.js)
- **Nuevas rutas** para el panel de admin:
  - `/admin` - Página principal (con validación de `cargo_rol`)
  - `/api/admin/courses` - CRUD de cursos
  - `/api/admin/news` - CRUD de noticias
  - `/api/admin/users` - Gestión de usuarios
  - `/api/admin/permissions` - Sistema de permisos
  - `/api/admin/stats` - Estadísticas del dashboard
- **Middleware de autenticación** para rutas de admin
- **Validación de `cargo_rol`** en cada endpoint

### Base de Datos
- **Usar la tabla `users` existente** con el campo `cargo_rol`
- **Nuevas colecciones/tablas**:
  - `courses` - Cursos del sistema
  - `news` - Noticias y artículos
  - `admin_logs` - Logs de administración
- **Consultas de validación**:
  ```sql
  -- Verificar si usuario es administrador
  SELECT cargo_rol FROM users WHERE id = $1 AND cargo_rol = 'Administrador';
  
  -- Obtener usuarios con sus roles
  SELECT id, full_name, username, email, cargo_rol, created_at 
  FROM users ORDER BY created_at DESC;
  ```

### Autenticación
- **Integración** con el sistema de login existente
- **Middleware** para verificar `cargo_rol = 'Administrador'`
- **Sesiones seguras** con JWT o similar
- **Logout automático** por inactividad

## Características de Seguridad

### Autenticación y Autorización
- **Verificación de `cargo_rol`** en cada acción de admin
- **Tokens de sesión** seguros
- **Rate limiting** para APIs
- **Validación de entrada** en todos los formularios

### Protección de Datos
- **Sanitización** de datos de entrada
- **Escape** de datos de salida
- **CSRF protection** en formularios
- **Logs de auditoría** para acciones críticas

## Responsive Design

### Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

### Adaptaciones
- **Sidebar colapsable** en móviles
- **Tablas scrollables** horizontalmente
- **Formularios optimizados** para touch
- **Navegación adaptativa** según dispositivo

## Animaciones y Microinteracciones

### Transiciones
- **Fade in/out** para modales
- **Slide** para sidebar
- **Scale** para botones hover
- **Loading spinners** para operaciones

### Feedback Visual
- **Toast notifications** para acciones
- **Progress bars** para uploads
- **Skeleton loading** para contenido
- **Hover effects** en elementos interactivos

## Testing y Validación

### Funcionalidades a probar
- **CRUD operations** para todas las entidades
- **Validación de formularios** en frontend y backend
- **Sistema de permisos** con diferentes `cargo_rol`
- **Responsive design** en diferentes dispositivos
- **Integración** con el sistema existente

### Casos de uso
- **Flujo completo** de creación de curso
- **Gestión de usuarios** con diferentes `cargo_rol`
- **Configuración del sistema** y persistencia
- **Dashboard** con datos reales

## Entregables Esperados

### Archivos HTML
- `src/admin/admin.html` - Página principal del panel

### Archivos CSS
- `src/admin/admin.css` - Estilos principales
- `src/admin/components/*.css` - Estilos de componentes (opcional)

### Archivos JavaScript
- `src/admin/admin.js` - Lógica principal
- `src/admin/components/dashboard.js` - Dashboard
- `src/admin/components/courses.js` - Gestión de cursos
- `src/admin/components/news.js` - Gestión de noticias
- `src/admin/components/users.js` - Gestión de usuarios
- `src/admin/components/permissions.js` - Sistema de permisos
- `src/admin/components/settings.js` - Configuraciones

### Modificaciones al servidor
- Nuevas rutas en `server.js`
- Middleware de autenticación con validación de `cargo_rol`
- Endpoints de API

### Documentación
- README específico para el panel de admin
- Guía de uso para administradores
- Documentación técnica de la API

## Criterios de Aceptación

### Funcionalidad
- ✅ Todas las funcionalidades CRUD implementadas
- ✅ Sistema de permisos funcionando con `cargo_rol`
- ✅ Dashboard con estadísticas reales
- ✅ Integración completa con el sistema existente
- ✅ Validación de acceso basada en `cargo_rol = 'Administrador'`

### Diseño
- ✅ Consistencia visual con el proyecto
- ✅ Responsive design en todos los dispositivos
- ✅ Animaciones suaves y profesionales
- ✅ UX intuitiva y accesible

### Seguridad
- ✅ Autenticación y autorización robustas
- ✅ Validación de `cargo_rol` en base de datos
- ✅ Validación de datos en frontend y backend
- ✅ Protección contra ataques comunes
- ✅ Logs de auditoría implementados

### Performance
- ✅ Carga rápida de páginas
- ✅ Optimización de imágenes y assets
- ✅ Lazy loading donde sea apropiado
- ✅ Caching eficiente

## Notas de Implementación

### Prioridades
1. **Validación de `cargo_rol`** en el middleware de autenticación
2. **Estructura básica** del panel (HTML, CSS, navegación)
3. **Sistema de autenticación** y permisos
4. **CRUD de cursos** (funcionalidad principal)
5. **Dashboard** con estadísticas
6. **Funcionalidades adicionales** (noticias, usuarios, etc.)

### Consideraciones
- **Mantener compatibilidad** con el código existente
- **Seguir las convenciones** de nomenclatura del proyecto
- **Documentar** todas las nuevas funcionalidades
- **Probar** exhaustivamente antes de integrar
- **Validar siempre** el `cargo_rol` en cada operación de admin

### Extensibilidad
- **Arquitectura modular** para fácil mantenimiento
- **APIs bien documentadas** para futuras integraciones
- **Sistema de plugins** para funcionalidades adicionales
- **Configuración flexible** para diferentes entornos

---

**IMPORTANTE**: Este panel debe integrarse perfectamente con el sistema existente, manteniendo la consistencia visual y funcional del proyecto Chat-Bot-LIA. La validación del `cargo_rol = 'Administrador'` es CRÍTICA y debe implementarse en todos los endpoints del panel de administrador. Todas las nuevas funcionalidades deben seguir las mejores prácticas de seguridad y UX establecidas en el proyecto.
