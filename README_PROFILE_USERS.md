# 👤 Página de Edición de Perfil - Usuarios

## 🎯 Descripción

Esta página permite a los **usuarios normales (estudiantes)** editar su información personal, foto de perfil y curriculum vitae. Está ubicada en el navbar principal junto a "Mis cursos", "Noticias" y "Comunidad".

## 📁 Estructura de Archivos

```
src/
├── profile.html              # Página principal de perfil
├── styles/
│   └── profile.css           # Estilos específicos para perfil
├── scripts/
│   └── profile-manager.js    # Lógica JavaScript
└── courses.html              # Página principal con botón de perfil
```

## 🚀 Características Implementadas

### ✅ **Funcionalidades Principales**
- **Edición de información personal**: Nombre, usuario, email, tipo de usuario
- **Información del perfil**: Nombre, apellido, nombre de exhibición, teléfono, biografía, ubicación
- **Cambio de contraseña**: Con validación de contraseña actual
- **Subida de archivos**: Foto de perfil (imágenes) y curriculum (PDF, DOC, DOCX)
- **Validaciones**: Campos requeridos, formato de email, tamaños de archivo
- **Auto-guardado**: Cada 30 segundos si hay cambios
- **Confirmación**: Modal antes de guardar cambios

### ✅ **Interfaz de Usuario**
- **Diseño moderno**: Glassmorphism con gradientes cibernéticos
- **Animaciones**: Flotación de tarjeta, transiciones suaves
- **Responsive**: Adaptable a móviles y tablets
- **Estados visuales**: Loading, errores, éxito, advertencias
- **Preview de imagen**: Vista previa inmediata de foto de perfil

### ✅ **Experiencia de Usuario**
- **Navegación intuitiva**: Botón de regreso a Mis Cursos
- **Feedback visual**: Mensajes de estado con iconos
- **Validación en tiempo real**: Errores se muestran inmediatamente
- **Prevención de pérdida de datos**: Confirmación antes de descartar cambios

## 🎨 Diseño y Estética

### 🌙 **Tema Oscuro Consistente**
- Paleta de colores coherente con el sistema existente
- Gradientes y efectos de cristal (glassmorphism)
- Bordes con efecto neón azul cian
- Tipografía Inter y Montserrat

### ✨ **Animaciones y Efectos**
- **Entrada de página**: Elementos aparecen escalonados
- **Hover effects**: Transformaciones sutiles en cards
- **Transiciones suaves**: Todos los elementos tienen transiciones fluidas
- **Efectos de partículas**: Fondo dinámico con partículas

## 🔧 Implementación de Conexión a Base de Datos

### 1. **API Endpoints Requeridos**

```javascript
// GET /api/profile - Obtener datos del perfil
GET /api/profile/:userId

// PUT /api/profile - Actualizar perfil
PUT /api/profile/:userId

// POST /api/upload/profile-picture - Subir foto de perfil
POST /api/upload/profile-picture

// POST /api/upload/curriculum - Subir curriculum
POST /api/upload/curriculum
```

### 2. **Estructura de Datos**

#### Usuario (users table):
```javascript
{
  id: "uuid",
  full_name: "string",
  username: "string", 
  email: "string",
  cargo_rol: "string", // NO EDITABLE
  type_rol: "string", // EDITABLE
  profile_picture_url: "string|null",
  curriculum_url: "string|null",
  created_at: "timestamp",
  updated_at: "timestamp",
  last_login_at: "timestamp"
}
```

#### Perfil (profile table):
```javascript
{
  id: "uuid",
  user_id: "uuid",
  first_name: "string",
  last_name: "string", 
  display_name: "string",
  email: "string",
  phone: "string|null",
  bio: "text|null",
  location: "string|null",
  created_at: "timestamp"
}
```

### 3. **Reemplazar Simulación por API Real**

En `profile-manager.js`, reemplazar las funciones de simulación:

```javascript
// Reemplazar loadCurrentUser()
async loadCurrentUser() {
    try {
        const response = await fetch('/api/user/current', {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        
        if (!response.ok) throw new Error('Error cargando usuario');
        
        this.currentUser = await response.json();
        this.updateCurrentProfileDisplay();
    } catch (error) {
        console.error('Error cargando usuario:', error);
        this.showStatusMessage('Error al cargar datos del usuario', 'error');
    }
}

// Reemplazar loadProfileData()
async loadProfileData() {
    try {
        const response = await fetch(`/api/profile/${this.currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        
        if (!response.ok) throw new Error('Error cargando perfil');
        
        this.profileData = await response.json();
        this.populateForm();
        this.updateStats();
    } catch (error) {
        console.error('Error cargando perfil:', error);
        this.showStatusMessage('Error al cargar datos del perfil', 'error');
    }
}

// Reemplazar simulateApiCall()
async saveProfileToAPI(data) {
    const formData = new FormData();
    
    // Agregar datos del formulario
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    
    const response = await fetch(`/api/profile/${this.currentUser.id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error guardando perfil');
    }
    
    return await response.json();
}
```

## 🗄️ Modificaciones Requeridas en la Base de Datos

### Tabla `users` - Agregar campos:
```sql
-- Agregar campos para foto de perfil y curriculum
ALTER TABLE users ADD COLUMN profile_picture_url TEXT;
ALTER TABLE users ADD COLUMN curriculum_url TEXT;
```

### Tabla `profile` - Agregar campos:
```sql
-- Agregar campos adicionales al perfil
ALTER TABLE profile ADD COLUMN bio TEXT;
ALTER TABLE profile ADD COLUMN phone TEXT;
ALTER TABLE profile ADD COLUMN location TEXT;
```

## 🎯 Diferencias con Panel de Maestros

### **Usuarios Normales (Esta implementación)**
- **Ubicación**: `src/profile.html`
- **Acceso**: Botón en navbar principal (Mis cursos, Noticias, Comunidad, **Perfil**)
- **Tipo de usuario**: Estudiante, Profesional, Empresario, Instructor
- **Estadísticas**: Cursos, Progreso, Racha
- **Navegación**: Regresa a `courses.html`

### **Panel de Maestros**
- **Ubicación**: `src/instructors/index.html`
- **Acceso**: Panel administrativo separado
- **Tipo de usuario**: Profesor, Instructor, Tutor, Mentor, Especialista
- **Estadísticas**: Cursos, Estudiantes, Calificación
- **Navegación**: Regresa al dashboard de instructores

## 🔒 Seguridad

### **Validaciones Implementadas**
- **Campos requeridos**: Nombre completo, usuario, email
- **Formato de email**: Validación con regex
- **Tamaños de archivo**: 5MB para imágenes, 10MB para CV
- **Tipos de archivo**: Solo imágenes y documentos permitidos
- **Contraseñas**: Mínimo 8 caracteres, confirmación requerida

### **Consideraciones de Seguridad**
- **Autenticación**: Verificar token en cada request
- **Autorización**: Solo el usuario puede editar su propio perfil
- **Sanitización**: Limpiar datos de entrada
- **Validación del lado del servidor**: Doble validación
- **HTTPS**: Usar conexiones seguras para subida de archivos

## 📱 Responsive Design

### **Breakpoints**
- **Desktop**: > 1024px - Layout de 2 columnas
- **Tablet**: 768px - 1024px - Layout de 1 columna
- **Mobile**: < 768px - Layout optimizado para móviles

### **Características Responsive**
- **Navbar**: Scroll horizontal en móviles
- **Formulario**: Campos apilados en pantallas pequeñas
- **Modal**: Ajuste automático de tamaño
- **Estadísticas**: Layout adaptativo según pantalla

## 🧪 Testing

### **Funcionalidades a Probar**
1. **Carga de datos**: Verificar que se cargan correctamente
2. **Validaciones**: Probar todos los casos de error
3. **Subida de archivos**: Probar diferentes tipos y tamaños
4. **Auto-guardado**: Verificar que funciona correctamente
5. **Responsive**: Probar en diferentes dispositivos
6. **Navegación**: Verificar enlaces y botones

### **Casos de Prueba**
- ✅ Usuario válido con todos los campos
- ✅ Usuario con campos mínimos
- ✅ Validación de email inválido
- ✅ Contraseña muy corta
- ✅ Archivo de imagen muy grande
- ✅ Tipo de archivo no permitido
- ✅ Conexión de red lenta
- ✅ Error del servidor

## 🚀 Próximos Pasos

### **Mejoras Futuras**
1. **Integración con API real**: Conectar con backend
2. **Notificaciones push**: Alertas de cambios guardados
3. **Historial de cambios**: Ver modificaciones anteriores
4. **Exportar datos**: Descargar información del perfil
5. **Temas personalizables**: Diferentes estilos visuales
6. **Integración social**: Conectar con redes sociales

### **Optimizaciones**
1. **Lazy loading**: Cargar imágenes bajo demanda
2. **Compresión de imágenes**: Optimizar antes de subir
3. **Cache**: Almacenar datos localmente
4. **Offline mode**: Funcionalidad sin conexión
5. **Performance**: Optimizar animaciones y transiciones

---

## 📞 Soporte

Para cualquier pregunta o problema con la implementación, revisar:
1. **Console del navegador**: Para errores JavaScript
2. **Network tab**: Para problemas de API
3. **Responsive mode**: Para problemas de diseño
4. **Documentación**: Este archivo README
