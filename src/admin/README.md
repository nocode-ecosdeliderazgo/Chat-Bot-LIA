# Panel de Administración - Lia IA

## 🎯 Descripción
Panel de administración completo para gestionar usuarios, cursos, comunidad y analíticas del chatbot educativo Lia IA.

## 🚀 Acceso
- URL: `/admin` o `/admin/admin.html`
- Requiere autenticación con token JWT de administrador

## ✨ Características

### 1. Dashboard
- Estadísticas en tiempo real de usuarios, cursos y actividad
- Gráfico de distribución de usuarios por rol
- Actividad reciente del sistema

### 2. Gestión de Usuarios
- ✅ Listado completo de usuarios con datos reales de PostgreSQL
- ✅ Búsqueda y filtrado por rol/estado
- ✅ Crear nuevos usuarios
- ✅ Editar información de usuarios
- ✅ Eliminar usuarios
- ✅ Gestión de roles (usuario/instructor/administrador)

### 3. Gestión de Cursos
- ✅ Visualización de cursos desde la tabla `course_content`
- ✅ Información de categorías y niveles de dificultad
- Estadísticas de inscripciones

### 4. Comunidad
- Gestión de posts y comentarios (placeholder para futura implementación)
- Moderación de contenido

### 5. Analíticas
- Gráficos de actividad de usuarios
- Progreso promedio en cursos
- Selector de rango de fechas

### 6. Configuración
- Estado de conexión a base de datos
- Configuración general del sistema

## 🔧 Endpoints API

### Usuarios
- `GET /api/admin/users` - Obtener todos los usuarios
- `POST /api/admin/users` - Crear nuevo usuario
- `PUT /api/admin/users/:id` - Actualizar usuario
- `DELETE /api/admin/users/:id` - Eliminar usuario

### Dashboard
- `GET /api/admin/dashboard/stats` - Estadísticas generales
- `GET /api/admin/activity` - Actividad reciente

### Cursos
- `GET /api/admin/courses` - Obtener todos los cursos

### Comunidad
- `GET /api/admin/community/posts` - Obtener posts
- `GET /api/admin/community/comments` - Obtener comentarios

### Analíticas
- `GET /api/admin/analytics` - Datos de analíticas

### Sistema
- `POST /api/admin/test-db` - Probar conexión a base de datos

## 🔐 Seguridad
- Autenticación JWT requerida
- Verificación de API key
- Middleware de autorización admin

## 💡 Notas de Implementación
- El panel usa PostgreSQL, no Supabase
- Los roles se determinan dinámicamente (admin = 'administrador')
- El estado activo/inactivo se basa en la última actividad (7 días)
- Las tablas de comunidad están preparadas para futura implementación

## 🎨 Tecnologías
- HTML5 + Bootstrap 5
- JavaScript vanilla (ES6+)
- Chart.js para gráficos
- CSS3 con diseño responsive

## 📱 Responsive
- Diseño adaptativo para móviles
- Sidebar colapsable en pantallas pequeñas
- Tablas responsive con scroll horizontal