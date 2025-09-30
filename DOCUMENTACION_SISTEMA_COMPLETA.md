# 📚 DOCUMENTACIÓN COMPLETA DEL SISTEMA
## Chat-Bot-LIA - Plataforma de Aprendizaje con IA

---

## 📋 ÍNDICE GENERAL

1. [Información General del Proyecto](#información-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Frontend - Componentes y Páginas](#frontend)
4. [Backend - APIs y Funciones](#backend)
5. [Base de Datos y Almacenamiento](#base-de-datos)
6. [Seguridad](#seguridad)
7. [Integraciones Externas](#integraciones-externas)
8. [Variables de Entorno](#variables-de-entorno)
9. [Reglas de Negocio](#reglas-de-negocio)
10. [Requerimientos Funcionales](#requerimientos-funcionales)
11. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
12. [Endpoints y APIs](#endpoints-y-apis)
13. [Flujos de Usuario](#flujos-de-usuario)
14. [Configuración y Despliegue](#configuración-y-despliegue)

---

## 📖 INFORMACIÓN GENERAL {#información-general}

### Descripción del Proyecto
**Chat-Bot-LIA** es una plataforma educativa de inteligencia artificial que ofrece cursos especializados en IA generativa, específicamente enfocada en el curso "Experto en IA para Profesionales: Dominando ChatGPT y Gemini para la Productividad".

### Tecnologías Principales
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Particles.js
- **Backend**: Node.js, Express.js, Netlify Functions
- **Base de Datos**: PostgreSQL (Supabase)
- **IA**: OpenAI GPT-4, Gemini
- **Autenticación**: JWT, Supabase Auth, Google OAuth
- **Despliegue**: Netlify
- **Email**: Nodemailer con SMTP

### Versión y Estado
- **Versión**: 1.0.0
- **Estado**: Producción
- **Última Actualización**: Enero 2025

---

## 🏗️ ARQUITECTURA DEL SISTEMA {#arquitectura-del-sistema}

### Arquitectura General
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Base de       │
│   (Netlify)     │◄──►│   (Netlify      │◄──►│   Datos         │
│                 │    │   Functions)    │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OpenAI API    │    │   Email Service │    │   Storage       │
│   Gemini API    │    │   (SMTP)        │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Estructura de Directorios
```
Chat-Bot-LIA/
├── src/                          # Frontend principal
│   ├── index.html               # Página principal
│   ├── chat.html                # Chat con IA
│   ├── courses.html             # Lista de cursos
│   ├── profile.html             # Perfil de usuario
│   ├── Community/               # Sistema de comunidad
│   ├── login/                   # Autenticación
│   ├── scripts/                 # JavaScript del frontend
│   ├── styles/                  # Estilos CSS
│   └── utils/                   # Utilidades
├── netlify/functions/           # Backend (Netlify Functions)
├── prompts/                     # Prompts para IA
├── scripts/                     # Scripts de configuración
└── docs/                        # Documentación
```

---

## 🎨 FRONTEND {#frontend}

### Páginas Principales

#### 1. Página Principal (`index.html`)
**Propósito**: Landing page con información del curso y call-to-action
**Características**:
- Hero section con animaciones
- Sección de características
- Estadísticas dinámicas
- Testimonios
- Sistema de partículas animadas

**Scripts asociados**:
- `scripts/welcome.js` - Lógica principal
- `scripts/animations.js` - Animaciones
- `scripts/carousel.js` - Carrusel de testimonios
- `scripts/index-particles.js` - Partículas de fondo

#### 2. Sistema de Chat (`chat.html`)
**Propósito**: Interfaz principal para interactuar con LIA (el asistente IA)
**Características**:
- Chat en tiempo real con IA
- Sistema de avatares
- Soporte para audio
- Historial de conversaciones
- Integración con OpenAI y Gemini

**Scripts asociados**:
- `Chat-Online/chat-online.js` - Lógica del chat
- `Chat-Online/chat-online.css` - Estilos específicos
- `scripts/supabase-client.js` - Cliente de base de datos

#### 3. Gestión de Cursos (`courses.html`)
**Propósito**: Panel de control de cursos del usuario
**Características**:
- Lista de cursos disponibles
- Progreso de aprendizaje
- Racha de aprendizaje
- Búsqueda de contenido
- Estadísticas personales

**Scripts asociados**:
- `scripts/courses.js` - Gestión de cursos
- `scripts/course-progress-manager.js` - Seguimiento de progreso
- `scripts/stats-calculator.js` - Cálculo de estadísticas

#### 4. Perfil de Usuario (`profile.html`)
**Propósito**: Gestión de información personal del usuario
**Características**:
- Edición de perfil
- Subida de avatar
- Configuración de seguridad
- Gestión de documentos
- Estadísticas personales

**Scripts asociados**:
- `scripts/profile-manager.js` - Gestión de perfil
- `scripts/profile-avatar-manager.js` - Gestión de avatares
- `scripts/file-upload-manager.js` - Subida de archivos

#### 5. Sistema de Comunidad (`Community/community.html`)
**Propósito**: Plataforma de interacción entre usuarios
**Características**:
- Preguntas y respuestas
- Sistema de votos
- Categorización de contenido
- Búsqueda y filtros
- Normas de comunidad

**Scripts asociados**:
- `Community/community.js` - Lógica de comunidad
- `scripts/community-database.js` - Operaciones de BD
- `scripts/community-api.js` - API calls

### Componentes Reutilizables

#### Sistema de Autenticación
- **Auth Guard** (`utils/auth-guard.js`): Protección de rutas
- **Auth Utils** (`utils/auth-utils.js`): Utilidades de autenticación
- **Supabase Client** (`scripts/supabase-client.js`): Cliente de base de datos

#### Sistema de Temas
- **Theme Manager** (`scripts/theme-manager.js`): Gestión de temas claro/oscuro
- **Theme Toggle** (`scripts/theme-toggle.js`): Alternador de temas
- **Auto Theme** (`scripts/auto-theme.js`): Detección automática de tema

#### Sistema de Partículas
- **Particles.js** (`scripts/particles.js`): Sistema de partículas animadas
- **Particles Direct** (`scripts/courses-particles-direct.js`): Implementación específica

---

## ⚙️ BACKEND {#backend}

### Netlify Functions

#### Funciones de Autenticación

##### `login.js`
**Propósito**: Autenticación de usuarios
**Endpoints**:
- `POST /api/login` - Login tradicional
- `POST /api/login` (con googleId) - Login con Google

**Funcionalidades**:
- Validación de credenciales
- Generación de JWT
- Actualización de último login
- Soporte para múltiples proveedores de auth

##### `register-with-email.js`
**Propósito**: Registro de nuevos usuarios
**Endpoints**:
- `POST /api/register` - Registro con email

**Funcionalidades**:
- Validación de datos
- Hash de contraseñas
- Envío de email de verificación
- Generación de OTP
- Integración con SMTP

##### `verify-email.js`
**Propósito**: Verificación de email
**Endpoints**:
- `POST /api/verify-email` - Verificación de OTP

#### Funciones de IA

##### `openai.js`
**Propósito**: Integración con OpenAI GPT-4
**Endpoints**:
- `POST /api/openai` - Chat con IA

**Funcionalidades**:
- Verificación de usuario
- Carga de prompts desde archivos
- Integración con OpenAI API
- Manejo de contexto de conversación
- Soporte para desarrollo y producción

#### Funciones de Cursos

##### `course-data.js`
**Propósito**: Gestión de datos de cursos
**Endpoints**:
- `GET /api/courses/{courseId}/full-structure` - Estructura completa
- `GET /api/courses/{courseId}/current-module/{userId}` - Módulo actual
- `GET /api/modules/{moduleId}/video-data` - Datos de video
- `GET /api/modules/{moduleId}/videos` - Lista de videos

##### `user-progress.js`
**Propósito**: Seguimiento de progreso del usuario
**Endpoints**:
- `GET /api/users/{userId}/progress/{courseId}` - Progreso del curso
- `POST /api/users/{userId}/video-progress` - Actualizar progreso de video
- `POST /api/users/{userId}/switch-module` - Cambiar módulo
- `POST /api/users/{userId}/switch-video` - Cambiar video

#### Funciones de Comunidad

##### `community.js`
**Propósito**: Gestión del sistema de comunidad
**Endpoints**:
- `GET /api/community/questions` - Obtener preguntas
- `POST /api/community/questions` - Crear pregunta
- `GET /api/community/questions/{id}/answers` - Obtener respuestas
- `POST /api/community/questions/{id}/answers` - Crear respuesta

##### `community-vote.js`
**Propósito**: Sistema de votos
**Endpoints**:
- `POST /api/community/questions/{id}/vote` - Votar pregunta
- `POST /api/community/answers/{id}/vote` - Votar respuesta

#### Funciones de Perfil

##### `profile-upload.js`
**Propósito**: Subida de archivos de perfil
**Endpoints**:
- `POST /api/profile/upload` - Subir avatar

##### `update-profile.js`
**Propósito**: Actualización de perfil
**Endpoints**:
- `PUT /api/update-profile` - Actualizar datos de perfil

### Servidor Principal (`server.js`)

#### Configuración
- **Puerto**: 3000 (desarrollo), variable PORT (producción)
- **CORS**: Configurado para múltiples orígenes
- **Helmet**: Headers de seguridad
- **Rate Limiting**: Protección contra spam

#### Middleware
- **CORS**: Manejo de cross-origin requests
- **Helmet**: Headers de seguridad
- **Rate Limiting**: Límite de requests por IP
- **Body Parser**: Parsing de JSON y form data

---

## 🗄️ BASE DE DATOS {#base-de-datos}

### Supabase (PostgreSQL)

#### Tablas Principales

##### `users`
**Propósito**: Información de usuarios
**Campos**:
- `id` (UUID, PK)
- `username` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `display_name` (VARCHAR)
- `profile_picture_url` (VARCHAR)
- `created_at` (TIMESTAMP)
- `last_login_at` (TIMESTAMP)
- `cargo_rol` (VARCHAR)
- `type_rol` (VARCHAR)
- `google_id` (VARCHAR)
- `auth_provider` (VARCHAR)

##### `courses`
**Propósito**: Información de cursos
**Campos**:
- `id` (UUID, PK)
- `title` (VARCHAR)
- `description` (TEXT)
- `slug` (VARCHAR, UNIQUE)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)

##### `modules`
**Propósito**: Módulos de cursos
**Campos**:
- `id` (UUID, PK)
- `course_id` (UUID, FK)
- `title` (VARCHAR)
- `description` (TEXT)
- `order_index` (INTEGER)
- `is_active` (BOOLEAN)

##### `videos`
**Propósito**: Videos de módulos
**Campos**:
- `id` (UUID, PK)
- `module_id` (UUID, FK)
- `title` (VARCHAR)
- `description` (TEXT)
- `youtube_id` (VARCHAR)
- `duration` (INTEGER)
- `order_index` (INTEGER)
- `transcription` (TEXT)

##### `user_progress`
**Propósito**: Progreso de usuarios
**Campos**:
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `course_id` (UUID, FK)
- `current_module_id` (UUID, FK)
- `current_video_id` (UUID, FK)
- `progress_percentage` (DECIMAL)
- `updated_at` (TIMESTAMP)

##### `community_questions`
**Propósito**: Preguntas de la comunidad
**Campos**:
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `title` (VARCHAR)
- `content` (TEXT)
- `course_id` (UUID, FK)
- `module_id` (UUID, FK)
- `votes_count` (INTEGER)
- `answers_count` (INTEGER)
- `views_count` (INTEGER)
- `is_answered` (BOOLEAN)
- `is_featured` (BOOLEAN)
- `created_at` (TIMESTAMP)

##### `community_answers`
**Propósito**: Respuestas a preguntas
**Campos**:
- `id` (UUID, PK)
- `question_id` (UUID, FK)
- `user_id` (UUID, FK)
- `content` (TEXT)
- `votes_count` (INTEGER)
- `is_accepted` (BOOLEAN)
- `created_at` (TIMESTAMP)

#### Relaciones
- `users` → `user_progress` (1:N)
- `courses` → `modules` (1:N)
- `modules` → `videos` (1:N)
- `users` → `community_questions` (1:N)
- `users` → `community_answers` (1:N)
- `community_questions` → `community_answers` (1:N)

---

## 🔒 SEGURIDAD {#seguridad}

### Autenticación y Autorización

#### JWT (JSON Web Tokens)
- **Algoritmo**: HS256
- **Duración**: 24 horas (configurable)
- **Refresh**: Automático con Supabase
- **Secret**: Variable de entorno `JWT_SECRET`

#### Supabase Auth
- **Proveedores**: Email/Password, Google OAuth
- **RLS**: Row Level Security habilitado
- **Sessions**: Persistencia automática

#### Auth Guard (Frontend)
**Archivo**: `src/utils/auth-guard.js`
**Funcionalidades**:
- Protección de rutas
- Verificación de tokens
- Redirección automática
- Limpieza de sesiones expiradas

### Headers de Seguridad

#### Content Security Policy (CSP)
```html
Content-Security-Policy: default-src 'self'; 
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://*.supabase.co; 
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
frame-src 'self' https://www.youtube.com;
```

#### Otros Headers
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Validación de Datos

#### Frontend
- Validación de formularios con HTML5
- Sanitización de inputs
- Validación de tipos de archivo

#### Backend
- Validación con `express-validator`
- Sanitización de datos
- Rate limiting por IP
- Validación de JWT en cada request

### Cifrado

#### Contraseñas
- **Algoritmo**: bcryptjs
- **Salt Rounds**: 12
- **Hash**: Generado automáticamente

#### Datos Sensibles
- Variables de entorno para secretos
- Cifrado de tokens
- HTTPS obligatorio en producción

---

## 🔌 INTEGRACIONES EXTERNAS {#integraciones-externas}

### APIs de IA

#### OpenAI
**Endpoint**: `https://api.openai.com/v1/chat/completions`
**Modelo**: GPT-4 (configurable)
**Uso**: Chat principal con LIA
**Autenticación**: API Key en header `Authorization`

#### Google Gemini
**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models`
**Modelo**: Gemini Pro
**Uso**: Chat alternativo y actividades específicas
**Autenticación**: API Key en query parameter

### Servicios de Email

#### SMTP (Nodemailer)
**Configuración**:
- Host: Variable `SMTP_HOST`
- Puerto: Variable `SMTP_PORT` (587)
- Usuario: Variable `SMTP_USER`
- Contraseña: Variable `SMTP_PASS`
- Seguridad: TLS

**Uso**:
- Verificación de email
- Notificaciones de sistema
- Recuperación de contraseña

### Servicios de Almacenamiento

#### Supabase Storage
**Uso**: Almacenamiento de avatares y archivos
**Buckets**:
- `avatars` - Imágenes de perfil
- `documents` - CVs y documentos
- `community` - Archivos de comunidad

### OAuth Providers

#### Google OAuth
**Endpoint**: `https://accounts.google.com/oauth2/v2/auth`
**Scopes**: `email`, `profile`
**Uso**: Login social
**Configuración**: Variables de entorno de Google

---

## 🌍 VARIABLES DE ENTORNO {#variables-de-entorno}

### Base de Datos
```bash
DATABASE_URL=postgresql://user:pass@host:port/database
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Autenticación
```bash
JWT_SECRET=your-jwt-secret-key
USER_JWT_SECRET=your-user-jwt-secret
API_SECRET_KEY=your-api-secret-key
```

### APIs de IA
```bash
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...
CHATBOT_MODEL=gpt-4o-mini
```

### Email
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Google OAuth
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Configuración General
```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://aprendeyaplica.ai
ALLOWED_ORIGINS=https://aprendeyaplica.ai,https://www.aprendeyaplica.ai
```

---

## 📋 REGLAS DE NEGOCIO {#reglas-de-negocio}

### Usuarios

#### Registro
1. Email único en el sistema
2. Validación de formato de email
3. Contraseña mínima 8 caracteres
4. Verificación de email obligatoria
5. Términos y condiciones aceptados

#### Autenticación
1. Token JWT válido por 24 horas
2. Refresh automático con Supabase
3. Logout invalida token inmediatamente
4. Sesiones persistentes entre dispositivos

#### Perfil
1. Username único
2. Avatar opcional (imagen válida)
3. Información personal editable
4. Documentos en formato PDF/DOC

### Cursos

#### Acceso
1. Usuario autenticado requerido
2. Progreso guardado automáticamente
3. Videos accesibles en orden secuencial
4. Módulos desbloqueados progresivamente

#### Progreso
1. Porcentaje calculado por videos completados
2. Video marcado como visto al 80% de reproducción
3. Progreso sincronizado entre dispositivos
4. Historial de progreso inmutable

### Comunidad

#### Preguntas
1. Usuario autenticado puede preguntar
2. Contenido debe ser relevante al curso
3. Título mínimo 10 caracteres
4. Descripción mínima 50 caracteres
5. Categorización obligatoria

#### Respuestas
1. Usuario autenticado puede responder
2. Una respuesta aceptada por pregunta
3. Votos positivos/negativos
4. Contenido moderado automáticamente

#### Moderación
1. Reportes de contenido inapropiado
2. Bloqueo temporal de usuarios
3. Eliminación de contenido ofensivo
4. Normas de comunidad aplicadas

### IA (LIA)

#### Contexto
1. Respuestas basadas en transcripciones de video
2. No inventar información no disponible
3. Mantener contexto del curso actual
4. Sugerir revisar otros materiales si necesario

#### Límites
1. Máximo 1000 tokens por respuesta
2. Temperatura 0.5 para consistencia
3. Historial de conversación limitado
4. Rate limiting por usuario

---

## ⚡ REQUERIMIENTOS FUNCIONALES {#requerimientos-funcionales}

### RF001 - Autenticación de Usuario
**Descripción**: El sistema debe permitir a los usuarios registrarse e iniciar sesión
**Criterios de Aceptación**:
- Usuario puede registrarse con email y contraseña
- Usuario puede iniciar sesión con credenciales válidas
- Usuario puede iniciar sesión con Google OAuth
- Sistema valida formato de email
- Sistema encripta contraseñas con bcrypt

### RF002 - Gestión de Perfil
**Descripción**: Los usuarios pueden gestionar su información personal
**Criterios de Aceptación**:
- Usuario puede editar información personal
- Usuario puede subir foto de perfil
- Usuario puede cambiar contraseña
- Usuario puede descargar documentos
- Sistema valida tipos de archivo

### RF003 - Navegación de Cursos
**Descripción**: Los usuarios pueden acceder y navegar por los cursos
**Criterios de Aceptación**:
- Usuario puede ver lista de cursos disponibles
- Usuario puede acceder a contenido del curso
- Usuario puede ver progreso de aprendizaje
- Sistema muestra módulos en orden secuencial
- Sistema bloquea contenido no disponible

### RF004 - Sistema de Chat con IA
**Descripción**: Los usuarios pueden interactuar con LIA (asistente IA)
**Criterios de Aceptación**:
- Usuario puede enviar mensajes al chat
- Sistema responde con información del curso
- Sistema mantiene contexto de conversación
- Sistema muestra avatar del usuario
- Sistema soporta audio (opcional)

### RF005 - Seguimiento de Progreso
**Descripción**: El sistema rastrea el progreso del usuario
**Criterios de Aceptación**:
- Sistema registra videos vistos
- Sistema calcula porcentaje de progreso
- Sistema sincroniza entre dispositivos
- Sistema muestra estadísticas de aprendizaje
- Sistema mantiene historial de progreso

### RF006 - Sistema de Comunidad
**Descripción**: Los usuarios pueden interactuar en la comunidad
**Criterios de Aceptación**:
- Usuario puede hacer preguntas
- Usuario puede responder preguntas
- Usuario puede votar contenido
- Sistema categoriza preguntas
- Sistema permite búsqueda y filtros

### RF007 - Notificaciones por Email
**Descripción**: El sistema envía notificaciones por email
**Criterios de Aceptación**:
- Sistema envía email de verificación
- Sistema envía notificaciones de progreso
- Sistema envía recordatorios de aprendizaje
- Usuario puede configurar preferencias
- Sistema maneja errores de envío

---

## 🎯 REQUERIMIENTOS NO FUNCIONALES {#requerimientos-no-funcionales}

### RNF001 - Rendimiento
**Descripción**: El sistema debe responder en tiempos aceptables
**Criterios**:
- Tiempo de carga de página < 3 segundos
- Respuesta de API < 1 segundo
- Chat con IA < 5 segundos
- Soporte para 1000 usuarios concurrentes

### RNF002 - Disponibilidad
**Descripción**: El sistema debe estar disponible la mayor parte del tiempo
**Criterios**:
- Uptime > 99.5%
- Tiempo de recuperación < 5 minutos
- Backup automático diario
- Monitoreo 24/7

### RNF003 - Escalabilidad
**Descripción**: El sistema debe soportar crecimiento de usuarios
**Criterios**:
- Arquitectura serverless (Netlify Functions)
- Base de datos escalable (Supabase)
- CDN para assets estáticos
- Auto-scaling de recursos

### RNF004 - Seguridad
**Descripción**: El sistema debe proteger datos de usuarios
**Criterios**:
- HTTPS obligatorio
- Encriptación de datos sensibles
- Autenticación JWT
- Validación de entrada
- Headers de seguridad

### RNF005 - Usabilidad
**Descripción**: El sistema debe ser fácil de usar
**Criterios**:
- Interfaz intuitiva
- Responsive design
- Accesibilidad WCAG 2.1 AA
- Soporte para temas claro/oscuro
- Navegación consistente

### RNF006 - Compatibilidad
**Descripción**: El sistema debe funcionar en múltiples dispositivos
**Criterios**:
- Compatible con Chrome, Firefox, Safari, Edge
- Responsive en móviles y tablets
- Funciona sin JavaScript (básico)
- Soporte para lectores de pantalla

### RNF007 - Mantenibilidad
**Descripción**: El código debe ser fácil de mantener
**Criterios**:
- Código documentado
- Estructura modular
- Tests automatizados
- Versionado con Git
- CI/CD pipeline

---

## 🔗 ENDPOINTS Y APIs {#endpoints-y-apis}

### Autenticación

#### POST `/api/login`
**Descripción**: Iniciar sesión de usuario
**Parámetros**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Respuesta**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "display_name": "string"
  },
  "token": "jwt-token"
}
```

#### POST `/api/register`
**Descripción**: Registrar nuevo usuario
**Parámetros**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "display_name": "string"
}
```
**Respuesta**:
```json
{
  "success": true,
  "message": "Usuario registrado. Verifica tu email."
}
```

#### POST `/api/verify-email`
**Descripción**: Verificar email con OTP
**Parámetros**:
```json
{
  "email": "string",
  "otp": "string"
}
```

### Cursos

#### GET `/api/courses/{courseId}/full-structure`
**Descripción**: Obtener estructura completa del curso
**Headers**: `Authorization: Bearer {token}`
**Respuesta**:
```json
{
  "success": true,
  "course": {
    "id": "uuid",
    "title": "string",
    "modules": [
      {
        "id": "uuid",
        "title": "string",
        "videos": [
          {
            "id": "uuid",
            "title": "string",
            "youtube_id": "string",
            "transcription": "string"
          }
        ]
      }
    ]
  }
}
```

#### GET `/api/users/{userId}/progress/{courseId}`
**Descripción**: Obtener progreso del usuario en curso
**Headers**: `Authorization: Bearer {token}`
**Respuesta**:
```json
{
  "success": true,
  "progress": {
    "course_id": "uuid",
    "current_module_id": "uuid",
    "current_video_id": "uuid",
    "progress_percentage": 45.5,
    "modules_completed": 2,
    "videos_completed": 8
  }
}
```

### Chat con IA

#### POST `/api/openai`
**Descripción**: Enviar mensaje al chat con IA
**Headers**: `Authorization: Bearer {token}`
**Parámetros**:
```json
{
  "message": "string",
  "context": {
    "course_id": "uuid",
    "module_id": "uuid",
    "video_id": "uuid"
  }
}
```
**Respuesta**:
```json
{
  "success": true,
  "response": "string",
  "context_used": "video_transcription"
}
```

### Comunidad

#### GET `/api/community/questions`
**Descripción**: Obtener preguntas de la comunidad
**Query Parameters**:
- `course_id` (opcional)
- `module_id` (opcional)
- `filter` (all, unanswered, answered, featured)
- `sort` (recent, votes, answers, views)
- `page` (número de página)
- `limit` (elementos por página)

#### POST `/api/community/questions`
**Descripción**: Crear nueva pregunta
**Headers**: `Authorization: Bearer {token}`
**Parámetros**:
```json
{
  "title": "string",
  "content": "string",
  "course_id": "uuid",
  "module_id": "uuid"
}
```

### Perfil

#### GET `/api/profile`
**Descripción**: Obtener perfil del usuario
**Headers**: `Authorization: Bearer {token}`
**Respuesta**:
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "display_name": "string",
    "profile_picture_url": "string",
    "cargo_rol": "string",
    "created_at": "timestamp"
  }
}
```

#### PUT `/api/update-profile`
**Descripción**: Actualizar perfil del usuario
**Headers**: `Authorization: Bearer {token}`
**Parámetros**:
```json
{
  "display_name": "string",
  "cargo_rol": "string",
  "phone": "string",
  "location": "string",
  "bio": "string"
}
```

---

## 🔄 FLUJOS DE USUARIO {#flujos-de-usuario}

### Flujo de Registro
1. Usuario accede a página de registro
2. Completa formulario con datos personales
3. Sistema valida información
4. Sistema crea usuario en base de datos
5. Sistema envía email de verificación
6. Usuario recibe email con código OTP
7. Usuario ingresa código OTP
8. Sistema verifica código y activa cuenta
9. Usuario es redirigido al dashboard

### Flujo de Login
1. Usuario accede a página de login
2. Ingresa credenciales (email/password o Google)
3. Sistema valida credenciales
4. Sistema genera JWT token
5. Sistema actualiza último login
6. Usuario es redirigido al dashboard
7. Sistema carga datos de usuario

### Flujo de Aprendizaje
1. Usuario accede a lista de cursos
2. Selecciona curso disponible
3. Sistema carga estructura del curso
4. Usuario navega por módulos y videos
5. Sistema reproduce video de YouTube
6. Usuario interactúa con chat IA (opcional)
7. Sistema registra progreso automáticamente
8. Usuario completa módulo
9. Sistema desbloquea siguiente contenido

### Flujo de Chat con IA
1. Usuario accede a chat desde curso
2. Sistema carga contexto del video actual
3. Usuario escribe pregunta
4. Sistema envía mensaje a OpenAI API
5. IA procesa pregunta con contexto
6. Sistema recibe respuesta de IA
7. Sistema muestra respuesta en chat
8. Sistema guarda conversación en historial

### Flujo de Comunidad
1. Usuario accede a sección de comunidad
2. Ve lista de preguntas categorizadas
3. Puede filtrar por curso/módulo
4. Hace nueva pregunta o responde existente
5. Otros usuarios votan contenido
6. Sistema ordena por popularidad
7. Moderadores revisan contenido reportado

---

## 🚀 CONFIGURACIÓN Y DESPLIEGUE {#configuración-y-despliegue}

### Configuración de Desarrollo

#### Requisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git
- Cuenta de Supabase
- API Keys de OpenAI y Gemini

#### Instalación
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/chatbot-educativo-ia.git
cd chatbot-educativo-ia

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Inicializar base de datos
npm run init:database

# Ejecutar en desarrollo
npm run dev
```

#### Scripts Disponibles
```bash
npm start              # Ejecutar en producción
npm run dev            # Ejecutar en desarrollo
npm run dev:force      # Forzar reinicio en puerto 3000
npm run init:database  # Inicializar base de datos
npm test              # Ejecutar tests
npm run lint          # Linter de código
npm run format        # Formatear código
npm run security-check # Verificar vulnerabilidades
```

### Configuración de Producción

#### Netlify
**Archivo**: `netlify.toml`
```toml
[build]
  base = "."
  publish = "src"
  node_version = "18"

[build.environment]
  NODE_ENV = "production"

[functions]
  directory = "netlify/functions"
```

#### Variables de Entorno en Netlify
1. Ir a Netlify Dashboard
2. Seleccionar proyecto
3. Site settings > Environment variables
4. Agregar todas las variables necesarias

#### Dominio Personalizado
1. Configurar DNS en proveedor
2. Agregar dominio en Netlify
3. Configurar SSL automático
4. Actualizar variables de entorno

### Monitoreo y Logs

#### Netlify Analytics
- Métricas de visitantes
- Tiempo de carga
- Errores de función
- Uso de bandwidth

#### Logs de Función
```bash
# Ver logs en tiempo real
netlify functions:log

# Logs específicos de función
netlify functions:log openai
```

### Backup y Recuperación

#### Base de Datos (Supabase)
- Backup automático diario
- Punto de restauración por 7 días
- Export manual disponible
- Migración entre proyectos

#### Archivos Estáticos
- Versionado en Git
- CDN global con Netlify
- Cache automático
- Invalidación manual

### Actualizaciones

#### Proceso de Deploy
1. Desarrollar en branch feature
2. Merge a main branch
3. Netlify detecta cambios automáticamente
4. Build y deploy automático
5. Verificación en staging
6. Deploy a producción

#### Rollback
1. Ir a Netlify Dashboard
2. Deploy history
3. Seleccionar versión anterior
4. Restore deployment

---

## 📞 SOPORTE Y MANTENIMIENTO

### Contacto de Soporte
- **Email**: soporte@aprendeyaplica.ai
- **Documentación**: [docs.aprendeyaplica.ai](https://docs.aprendeyaplica.ai)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/chatbot-educativo-ia/issues)

### Mantenimiento Programado
- **Backup de BD**: Diario a las 2:00 AM
- **Actualización de dependencias**: Mensual
- **Revisión de seguridad**: Trimestral
- **Optimización de performance**: Semestral

### Métricas de Salud
- **Uptime**: > 99.5%
- **Tiempo de respuesta**: < 1 segundo
- **Errores**: < 0.1%
- **Usuarios activos**: Monitoreo continuo

---

*Documentación actualizada el: Enero 2025*
*Versión del sistema: 1.0.0*
*Autor: Equipo de Desarrollo Aprende y Aplica IA*
