# 📖 Documentación Completa - Coach Lia IA

## 🌟 Descripción del Proyecto

**Coach Lia IA** es una plataforma educativa avanzada de inteligencia artificial que combina un chatbot inteligente con un sistema completo de gestión de cursos. La aplicación ofrece experiencias de aprendizaje personalizadas a través de integración con OpenAI, gestión de usuarios con Supabase y una arquitectura moderna fullstack.

### 🎯 Misión del Proyecto
Democratizar el acceso a la educación en inteligencia artificial a través de una plataforma interactiva y personalizada que combina contenido estructurado con asistencia AI inteligente.

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js v18+** - Entorno de ejecución JavaScript
- **Express.js v4.18.2** - Framework web para APIs REST
- **PostgreSQL** - Base de datos principal relacional
- **Supabase v2.56.0** - Backend-as-a-Service para funcionalidades extendidas
- **Socket.IO v4.8.1** - Comunicación en tiempo real
- **JWT (jsonwebtoken v9.0.2)** - Autenticación y autorización
- **Helmet v7.1.0** - Seguridad y CSP (Content Security Policy)
- **Express Rate Limit v7.1.5** - Limitación de velocidad de peticiones

### Frontend
- **HTML5 + CSS3** - Estructura y estilos modernos
- **Vanilla JavaScript (ES6+)** - Sin frameworks, código nativo
- **CSS Grid + Flexbox** - Layout responsivo
- **CSS Custom Properties** - Sistema de themes dinámico
- **Intersection Observer API** - Animaciones por scroll
- **Fetch API** - Comunicaciones con backend

### Inteligencia Artificial
- **OpenAI API** - GPT para conversaciones inteligentes
- **Prompts Estructurados** - Sistema modular de prompts en español
- **Context Awareness** - Mantiene contexto de conversación
- **Course Knowledge** - Conocimiento específico del curso integrado

### Servicios en la Nube
- **Netlify** - Hosting y funciones serverless
- **Heroku** - Deployment alternativo para backend
- **Supabase** - Autenticación, base de datos y storage
- **Google Fonts** - Tipografías web optimizadas

### Herramientas de Desarrollo
- **Jest v29.7.0** - Testing framework
- **ESLint v8.55.0** - Linting de código JavaScript
- **Prettier v3.1.1** - Formateo automático de código
- **Nodemon v3.0.2** - Hot-reload en desarrollo
- **Supertest v6.3.3** - Testing de APIs

---

## 📁 Arquitectura del Proyecto

### Estructura de Directorios
```
Chat-Bot-LIA/
├── 📁 src/                          # Frontend aplicación
│   ├── 📁 assets/                   # Recursos estáticos
│   │   ├── 📁 images/              # Imágenes y logos
│   │   ├── 📁 icons/               # Iconos SVG
│   │   └── 📁 audio/               # Archivos de audio
│   ├── 📁 styles/                   # Hojas de estilo CSS
│   │   ├── main.css                # Estilos principales
│   │   ├── chat.css                # Estilos del chat
│   │   ├── responsive.css          # Diseño responsivo
│   │   └── animations.css          # Animaciones CSS
│   ├── 📁 scripts/                  # JavaScript frontend
│   │   ├── main.js                 # Script principal
│   │   ├── theme-manager.js        # Gestión de temas
│   │   ├── particles.js            # Sistema de partículas
│   │   └── animations.js           # Animaciones JavaScript
│   ├── 📁 login/                    # Sistema de autenticación
│   │   ├── new-auth.html           # Página de login/registro
│   │   ├── new-auth.css            # Estilos de autenticación
│   │   └── new-auth.js             # Lógica de autenticación
│   ├── 📁 data/                     # Datos del curso
│   │   └── course-data.js          # Información estructurada del curso
│   ├── 📁 utils/                    # Utilidades frontend
│   │   ├── auth-guard.js           # Protección de rutas
│   │   ├── helpers.js              # Funciones auxiliares
│   │   └── email-service.js        # Servicio de email
│   ├── index.html                  # Página principal
│   ├── chat.html                   # Interfaz de chat principal
│   ├── courses.html                # Catálogo de cursos
│   └── profile.html                # Perfil de usuario
├── 📁 netlify/functions/            # Funciones serverless
│   ├── openai.js                   # Integración con OpenAI
│   ├── login.js                    # Autenticación
│   ├── register.js                 # Registro de usuarios
│   └── cors-utils.js               # Utilidades CORS
├── 📁 prompts/                      # Sistema de prompts IA
│   ├── system.es.md                # Prompt principal del sistema
│   ├── style.es.md                 # Guía de estilo
│   ├── safety.es.md                # Medidas de seguridad
│   └── examples.es.md              # Ejemplos de uso
├── 📁 scripts/                      # Scripts de utilidad
│   ├── setup.js                    # Configuración inicial
│   └── extract-supabase-config.js  # Extracción configuración
├── server.js                       # Servidor Express principal
├── package.json                    # Dependencias y scripts
├── netlify.toml                    # Configuración Netlify
├── Procfile                        # Configuración Heroku
└── supabase.sql                    # Schema base de datos
```

### Arquitectura de Componentes

#### 🎨 Frontend (MPA - Multi-Page Application)
- **Patrón Modular**: Cada página es independiente pero comparte componentes
- **Sistema de Temas**: Dark/Light mode con detección de preferencias del sistema
- **Diseño Responsivo**: Mobile-first con breakpoints adaptativos
- **Animaciones Fluidas**: CSS animations + JavaScript intersection observers
- **Estado Persistente**: LocalStorage + SessionStorage para datos del usuario

#### 🔧 Backend (Express.js + Microservicios)
- **API RESTful**: Endpoints organizados por funcionalidad
- **Middleware Stack**: Seguridad (Helmet), CORS, Rate Limiting
- **Connection Pooling**: Optimización de conexiones PostgreSQL
- **Error Handling**: Manejo centralizado de errores con logging
- **Authentication**: JWT + Session management

#### 🧠 Sistema de IA
- **Prompt Engineering**: Sistema modular de prompts especializados
- **Context Management**: Mantiene contexto de conversación
- **Course Integration**: Conocimiento específico del curso embebido
- **Safety Measures**: Filtros y validaciones para respuestas seguras

---

## 🚀 Funcionalidades Principales

### 💬 Sistema de Chat Inteligente
- **Integración OpenAI GPT**: Conversaciones naturales y contextuales
- **LIA (Learning Intelligence Assistant)**: Asistente especializado en educación IA
- **Memoria de Conversación**: Mantiene contexto entre sesiones
- **Respuestas Personalizadas**: Adaptadas al nivel del usuario
- **Soporte Multimodal**: Texto, enlaces y recursos multimedia

### 👤 Sistema de Autenticación y Usuarios
- **Registro/Login Seguro**: Email + verificación OTP
- **Gestión de Sesiones**: JWT + refresh tokens
- **Perfiles de Usuario**: Información personalizada y progreso
- **Protección de Rutas**: Auth guards en páginas protegidas
- **OAuth Integration**: Preparado para Google OAuth

### 📚 Gestión de Cursos
- **Catálogo Dinámico**: Cursos cargados desde base de datos
- **Contenido Estructurado**: Sesiones, objetivos y materiales
- **Progreso de Usuario**: Tracking de avance por curso
- **Recursos Descargables**: PDFs, videos y materiales complementarios
- **Sistema de Series**: Agrupación de cursos relacionados

### 🎨 Interfaz de Usuario Avanzada
- **Diseño Responsivo**: Adaptado para todos los dispositivos
- **Sistema de Temas**: Dark/Light mode con transiciones suaves
- **Animaciones Interactivas**: Partículas, scroll animations y micro-interacciones
- **Accesibilidad**: ARIA labels y navegación por teclado
- **Performance Optimizada**: Lazy loading y resource preloading

### 📊 Analytics y Tracking
- **Visitas a Cursos**: Seguimiento de interacción con contenido
- **Métricas de Usuario**: Tiempo en plataforma y engagement
- **Progreso Educativo**: Avance por módulos y sesiones
- **Datos de Conversación**: Análisis de interacciones con IA

---

## 🗄️ Base de Datos

### Esquema Principal (PostgreSQL)

#### Tabla `users`
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (TEXT)
- full_name (VARCHAR)
- profile_picture (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Tabla `curso`
```sql
- id (UUID, PK)
- nombre (VARCHAR)
- descripcion (TEXT)
- area (VARCHAR) -- 'ia', 'marketing', etc.
- identificador_curso (VARCHAR, UNIQUE)
- temario_url (TEXT)
- instructor_id (UUID, FK)
- estado (VARCHAR) -- 'activo', 'inactivo', etc.
```

#### Tabla `course_visit`
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- course_id (TEXT)
- visited_on (DATE)
- visits (INTEGER)
```

#### Tabla `chat_sessions`
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- session_start (TIMESTAMP)
- session_end (TIMESTAMP)
- message_count (INTEGER)
```

### Integración Supabase
- **Autenticación**: Auth providers y user management
- **Real-time**: Subscripciones a cambios en tiempo real
- **Storage**: Almacenamiento de archivos y multimedia
- **Edge Functions**: Funciones serverless adicionales

### Sistema de Puntos y Ligas (Gamificación)

#### Tabla `users` (Actualizada)
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (TEXT)
- full_name (VARCHAR)
- profile_picture (TEXT)
- points (INTEGER, DEFAULT 0)  -- NUEVO: Sistema de puntos
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Tablas de Comunidad
```sql
-- Tabla de comunidades
CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de publicaciones
CREATE TABLE public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.communities(id),
    user_id UUID REFERENCES public.users(id),
    content TEXT NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de comentarios
CREATE TABLE public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de reacciones
CREATE TABLE public.community_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    reaction_type VARCHAR(50) NOT NULL, -- 'like', 'love', 'laugh', etc.
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, user_id, reaction_type)
);

-- Tabla de miembros de comunidad
CREATE TABLE public.community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.communities(id),
    user_id UUID REFERENCES public.users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);
```

#### Sistema de Ligas
```javascript
// Ligas disponibles (estilo Clash Royale)
const LEAGUES = [
    { name: 'Liga Novato', minPoints: 0, maxPoints: 99, color: '#6C757D' },
    { name: 'Liga Cobre', minPoints: 100, maxPoints: 199, color: '#B87333' },
    { name: 'Liga Hierro', minPoints: 200, maxPoints: 399, color: '#A19D94' },
    { name: 'Liga Bronce', minPoints: 400, maxPoints: 799, color: '#CD7F32' },
    { name: 'Liga Plateada', minPoints: 800, maxPoints: 1499, color: '#C0C0C0' },
    { name: 'Liga Dorada', minPoints: 1500, maxPoints: 2999, color: '#FFD700' },
    { name: 'Liga Élite', minPoints: 3000, maxPoints: 4999, color: '#C0C0C0' },
    { name: 'Liga Legendaria', minPoints: 5000, maxPoints: Infinity, color: '#FFD700' }
];

// Puntos por acción
const POINTS_SYSTEM = {
    publish: 10,    // Publicar contenido
    comment: 5,     // Comentar
    react: 2,       // Reaccionar
    popularPost: 15 // Post popular (bonus)
};
```

#### Funcionalidades del Sistema
- **Persistencia en Supabase**: Todos los puntos se guardan en la base de datos
- **Sincronización Automática**: Los puntos se actualizan en tiempo real
- **Display de Ligas**: Interfaz visual con progreso hacia la siguiente liga
- **Sistema de Recompensas**: Puntos por diferentes acciones en la comunidad
- **Fallback a localStorage**: Sistema de respaldo para casos de error

---

## 🛡️ Seguridad

### Content Security Policy (CSP)
```javascript
// Configuración Helmet.js
contentSecurityPolicy: {
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        frameSrc: ["https://www.youtube.com", "https://docs.google.com"],
        connectSrc: ["'self'", "https://api.openai.com", "*.supabase.co"]
    }
}
```

### Medidas de Seguridad Implementadas
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS Configurado**: Orígenes permitidos específicos
- **JWT Validation**: Tokens firmados y verificación de expiración
- **Input Sanitization**: Validación y limpieza de datos de entrada
- **HTTPS Enforcement**: Redirección automática a HTTPS en producción
- **XSS Protection**: Headers de seguridad y sanitización

### Autenticación y Autorización
- **Bcrypt**: Hashing seguro de contraseñas
- **JWT Tokens**: Autenticación sin estado
- **Session Management**: Gestión segura de sesiones
- **Email Verification**: Verificación OTP por email
- **Password Policies**: Requisitos de seguridad para contraseñas

---

## 🎨 Sistema de Diseño

### Paleta de Colores
```css
/* Tema Claro */
--primary-color: #667eea;
--secondary-color: #764ba2;
--background: #ffffff;
--surface: #f8fafc;
--text-primary: #1a202c;

/* Tema Oscuro */
--primary-color: #667eea;
--secondary-color: #764ba2;
--background: #0a0e1a;
--surface: #1a202c;
--text-primary: #f7fafc;
```

### Tipografía
- **Montserrat**: Títulos y headers (700, 800 weight)
- **Inter**: Texto body y UI (400, 500 weight)
- **Fallbacks**: System fonts para performance

### Componentes de UI
- **Buttons**: Estados hover, focus y disabled
- **Cards**: Elevación y sombras consistentes
- **Forms**: Validación visual en tiempo real
- **Modals**: Overlay y animaciones de entrada/salida
- **Toast Notifications**: Feedback de acciones

### Animaciones y Efectos
- **Partículas de Fondo**: Sistema CSS animado
- **Scroll Animations**: Intersection Observer API
- **Micro-interacciones**: Hover effects y transiciones
- **Loading States**: Skeletons y spinners

---

## 🤖 Sistema de Inteligencia Artificial

### Configuración OpenAI
- **Modelo**: GPT-4 / GPT-3.5-turbo (configurable)
- **Temperature**: 0.7 (balance creatividad/precisión)
- **Max Tokens**: 1000-2000 (según contexto)
- **Context Window**: Optimizado para conversaciones largas

### Arquitectura de Prompts
```
📁 prompts/
├── system.es.md        # Personalidad y comportamiento base
├── style.es.md         # Guía de estilo de respuestas
├── safety.es.md        # Medidas de seguridad y restricciones
├── tools.es.md         # Herramientas y recursos disponibles
├── examples.es.md      # Ejemplos de interacciones ideales
└── use_cases.es.md     # Casos de uso específicos
```

### Funcionalidades de IA
- **LIA Assistant**: Personalidad educativa especializada
- **Context Awareness**: Memoria de conversaciones previas
- **Course Integration**: Acceso a información específica del curso
- **Multi-language**: Optimizado para español con soporte multiidioma
- **Safety Filters**: Prevención de contenido inapropiado

---

## 🌐 Deployment y DevOps

### Netlify (Producción)
```toml
# netlify.toml
[build]
  node_version = "18"
  
[functions]
  directory = "netlify/functions"

# Redirects para SPA
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Heroku (Alternativo)
```
# Procfile
web: node server.js
```

### Variables de Entorno Requeridas
```env
# Base de Datos


# Autenticación
JWT_SECRET=your-jwt-secret
USER_JWT_SECRET=your-user-jwt-secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Email (OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Configuración
NODE_ENV=production
PORT=3000
```

### CI/CD Pipeline
- **Git Hooks**: Pre-commit linting y tests
- **Netlify Build**: Optimización automática de assets
- **Environment Management**: Variables separadas por entorno
- **Database Migrations**: Scripts SQL versionados

---

## 🧪 Testing

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/tests/**'
  ]
};
```

### Tipos de Tests
- **Unit Tests**: Funciones individuales y componentes
- **Integration Tests**: APIs y flujos completos
- **E2E Tests**: Simulación de usuario real
- **Performance Tests**: Métricas de rendimiento

### Scripts de Testing
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # End-to-end tests
```

---

## 📚 Guías de Desarrollo

### Comandos Principales
```bash
# Desarrollo
npm start             # Servidor producción
npm run dev           # Servidor desarrollo con nodemon
npm run dev:force     # Forzar desarrollo (mata puerto 3000)

# Testing y Calidad
npm test              # Ejecutar tests
npm run lint          # Linting ESLint
npm run format        # Formateo Prettier
npm run security-check # Auditoría de seguridad

# Utilidades
npm run port:kill     # Matar proceso puerto 3000
npm run setup         # Configuración inicial completa

# Sistema de Puntos y Ligas
# Archivos de prueba disponibles:
# - test-league-display.html
# - test-initial-points.html  
# - test-refresh-points.html
```

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización documentación
style: cambios de estilo/formato
refactor: refactorización de código
test: agregado o actualización de tests
chore: tareas de mantenimiento
```

### Flujo de Desarrollo
1. **Clone & Setup**: `git clone` → `npm install` → configurar `.env`
2. **Feature Branch**: `git checkout -b feature/nueva-funcionalidad`
3. **Development**: Desarrollar con `npm run dev`
4. **Testing**: `npm test` y `npm run lint`
5. **Commit**: Commits semánticos
6. **Pull Request**: Code review antes de merge
7. **Deploy**: Automático en merge a main

---

## 🔧 Configuración de Desarrollo

### Requisitos del Sistema
- **Node.js**: v16+ (recomendado v18+)
- **npm**: v8+
- **PostgreSQL**: v12+
- **Git**: Última versión

### Setup Inicial
```bash
# 1. Clonar repositorio
git clone <repository-url>
cd Chat-Bot-LIA

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Setup base de datos
# Ejecutar supabase.sql en tu instancia PostgreSQL
# Incluye tablas para sistema de puntos y comunidad

# 5. Configurar sistema de puntos
# Verificar que la columna 'points' existe en tabla 'users'
# Si no existe: ALTER TABLE public.users ADD COLUMN points INTEGER DEFAULT 0;

# 6. Ejecutar en desarrollo
npm run dev
```

### Configuración del Sistema de Puntos

#### 1. Base de Datos
```sql
-- Agregar columna de puntos si no existe
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Crear tablas de comunidad (incluidas en supabase.sql)
-- Ejecutar el archivo supabase.sql completo
```

#### 2. Variables de Entorno
```env
# Supabase (requerido para sistema de puntos)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 3. Archivos de Configuración
- **`scripts/extract-supabase-config.js`**: Extrae credenciales de `.env` a meta tags
- **`src/scripts/supabase-client.js`**: Cliente de Supabase para el frontend
- **`src/scripts/community-database.js`**: Operaciones CRUD para comunidad

### Extensiones VS Code Recomendadas
- **ESLint**: Linting JavaScript
- **Prettier**: Formateo automático
- **Thunder Client**: Testing de APIs
- **Git Lens**: Enhanced Git integration
- **Auto Rename Tag**: HTML/CSS productivity

---

## 🏆 Sistema de Puntos y Ligas - Implementación y Solución de Problemas

### 📋 Resumen de Implementación

El sistema de puntos y ligas fue implementado como una funcionalidad de gamificación completa que integra con la comunidad de usuarios. El sistema incluye:

#### ✅ Funcionalidades Implementadas
1. **Sistema de Puntos Persistente**: Los puntos se guardan en la columna `points` de la tabla `users` en Supabase
2. **Sistema de Ligas**: 8 ligas diferentes con colores y rangos de puntos específicos
3. **Comunidad Interactiva**: Publicaciones, comentarios y reacciones que generan puntos
4. **Display Visual**: Interfaz que muestra la liga actual, progreso y puntos del usuario
5. **Sincronización Automática**: Los puntos se actualizan en tiempo real

#### 🔧 Problemas Resueltos

##### 1. **Problema: Puntos no se mostraban al cargar la página**
**Síntomas**: Los puntos aparecían como 0 hasta que se hacía una acción
**Causa**: El sistema no obtenía los puntos desde la base de datos al inicializar
**Solución**:
```javascript
// En getCurrentUser() - Obtener puntos desde la base de datos
const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, username, display_name, first_name, email, points')
    .eq('id', user.id)
    .single();

if (!userError && userData) {
    this.currentUser = {
        id: userData.id,
        name: userData.display_name || userData.first_name || userData.username || userData.email || 'Usuario',
        points: userData.points || 0, // Puntos desde la base de datos
        // ... otros campos
    };
}
```

##### 2. **Problema: Puntos se perdían después del refresh**
**Síntomas**: Al hacer refresh de la página, los puntos volvían a 0
**Causa**: `this.currentUser` no se asignaba correctamente desde la base de datos
**Solución**:
```javascript
// Asignar correctamente this.currentUser en todos los casos
this.currentUser = localUser; // En getCurrentUser()
this.currentUser = userInfo;  // En fallback localStorage
this.currentUser = user;      // En fallback genérico
```

##### 3. **Problema: Display no se actualizaba automáticamente**
**Síntomas**: Los cambios en puntos no se reflejaban en la interfaz
**Causa**: Faltaban llamadas a `updateLeagueDisplay()` en momentos clave
**Solución**:
```javascript
// Agregar actualización automática en varios puntos
async init() {
    await this.getCurrentUser();
    this.updateLeagueDisplay(); // Actualizar display al inicializar
}

// Actualización periódica cada 30 segundos
setInterval(async () => {
    if (window.pointsSystem) {
        await window.pointsSystem.getCurrentUser();
        await window.pointsSystem.refreshPointsFromDatabase();
        window.pointsSystem.updateLeagueDisplay();
    }
}, 30000);
```

#### 🛠️ Funciones Clave Implementadas

##### `refreshPointsFromDatabase()`
```javascript
async refreshPointsFromDatabase() {
    if (this.currentUser && this.currentUser.id) {
        const { data: userData, error } = await supabase
            .from('users')
            .select('points')
            .eq('id', this.currentUser.id)
            .single();
        
        if (!error && userData) {
            this.currentUser.points = userData.points || 0;
            this.updateLeagueDisplay();
            return true;
        }
    }
    return false;
}
```

##### `updateLeagueDisplay()`
```javascript
updateLeagueDisplay() {
    if (!this.currentUser) return;
    
    const league = this.getLeague(this.currentUser.points);
    const progress = this.getProgressToNextLeague(this.currentUser.points);
    
    // Actualizar elementos DOM con IDs correctos
    document.getElementById('currentUserLeague').textContent = league.name;
    document.getElementById('currentUserPoints').textContent = this.currentUser.points;
    document.getElementById('leagueProgressFill').style.width = `${progress.progress}%`;
    // ... más actualizaciones
}
```

#### 📊 Estructura de Base de Datos

##### Tabla `users` (Actualizada)
```sql
ALTER TABLE public.users ADD COLUMN points INTEGER DEFAULT 0;
```

##### Tablas de Comunidad
```sql
-- Ejecutar supabase.sql completo para crear todas las tablas
-- Incluye: communities, community_posts, community_comments, 
-- community_reactions, community_members
```

#### 🧪 Archivos de Prueba Creados

1. **`test-league-display.html`**: Prueba del display de ligas
2. **`test-initial-points.html`**: Prueba de carga inicial de puntos
3. **`test-refresh-points.html`**: Prueba de persistencia después del refresh

#### 🔄 Flujo de Sincronización

1. **Al cargar la página**:
   - `getCurrentUser()` obtiene usuario autenticado
   - Consulta puntos desde `users.points` en Supabase
   - Asigna a `this.currentUser`
   - Llama a `updateLeagueDisplay()`

2. **Al hacer una acción** (publicar, comentar, reaccionar):
   - `addPoints()` suma puntos localmente
   - Actualiza `users.points` en Supabase
   - Llama a `updateLeagueDisplay()`

3. **Al cambiar a pestaña de ligas**:
   - `refreshPointsFromDatabase()` obtiene puntos actualizados
   - `updateLeagueDisplay()` actualiza la interfaz

4. **Cada 30 segundos**:
   - Sincronización automática de puntos
   - Actualización del display

#### 🎯 Puntos por Acción

| Acción | Puntos | Descripción |
|--------|--------|-------------|
| Publicar | +10 | Crear una nueva publicación |
| Comentar | +5 | Agregar comentario a publicación |
| Reaccionar | +2 | Dar like, love, laugh, etc. |
| Post Popular | +15 | Bonus por publicación viral |

#### 🏅 Sistema de Ligas

| Liga | Rango de Puntos | Color | Progreso |
|------|-----------------|-------|----------|
| Novato | 0-99 | Gris | Base |
| Cobre | 100-199 | Marrón | 100 puntos |
| Hierro | 200-399 | Plateado | 200 puntos |
| Bronce | 400-799 | Bronce | 400 puntos |
| Plateada | 800-1499 | Plateado | 800 puntos |
| Dorada | 1500-2999 | Dorado | 1500 puntos |
| Élite | 3000-4999 | Plateado | 3000 puntos |
| Legendaria | 5000+ | Dorado | Máxima |

---

## 🚨 Troubleshooting

### Problemas Comunes

#### Sistema de Puntos y Ligas

##### ❌ Puntos no se muestran al cargar la página
**Síntomas**: Los puntos aparecen como 0 hasta hacer una acción
**Solución**:
1. Verificar que la columna `points` existe en la tabla `users`
2. Ejecutar: `ALTER TABLE public.users ADD COLUMN points INTEGER DEFAULT 0;`
3. Verificar que `getCurrentUser()` obtiene datos desde Supabase
4. Revisar logs de consola para errores de conexión

##### ❌ Puntos se pierden después del refresh
**Síntomas**: Al hacer refresh, los puntos vuelven a 0
**Solución**:
1. Verificar que `this.currentUser` se asigna correctamente
2. Asegurar que `refreshPointsFromDatabase()` se llama
3. Verificar que el usuario está autenticado en Supabase
4. Revisar que `updateLeagueDisplay()` se ejecuta

##### ❌ Display de ligas no se actualiza
**Síntomas**: Los cambios en puntos no se reflejan en la interfaz
**Solución**:
1. Verificar IDs de elementos DOM en `updateLeagueDisplay()`
2. Asegurar que `refreshPointsFromDatabase()` funciona
3. Verificar que `setInterval` está activo
4. Revisar logs de consola para errores

##### ❌ Error de conexión a Supabase
**Síntomas**: Errores en consola sobre Supabase
**Solución**:
1. Verificar credenciales en `.env`
2. Asegurar que `extract-supabase-config.js` se ejecuta
3. Verificar que las credenciales están en meta tags del HTML
4. Revisar que Supabase está disponible

#### Puerto 3000 en uso
```bash
npm run port:kill
# o usar port:kill:3001 para puerto 3001
```

#### Error de conexión a base de datos
- Verificar `DATABASE_URL` en `.env`
- Confirmar que PostgreSQL está corriendo
- Revisar credenciales y permisos

#### OpenAI API errors
- Validar `OPENAI_API_KEY` en `.env`
- Verificar saldo de cuenta OpenAI
- Revisar límites de rate limiting

#### Problemas de CORS
- Verificar configuración en `server.js`
- Revisar orígenes permitidos en producción
- Confirmar headers CORS en requests

### Logs y Debugging
```bash
# Logs del servidor
npm run dev          # Logs en tiempo real

# Logs de Netlify Functions
netlify dev --live   # Desarrollo local con functions

# Database debugging
# Usar herramientas como pgAdmin o DBeaver
```

---

## 📈 Performance y Optimización

### Métricas Objetivo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

### Optimizaciones Implementadas
- **Resource Preloading**: CSS y fonts críticos
- **Image Optimization**: Formato WebP y lazy loading
- **Code Splitting**: Carga dinámica de componentes
- **Caching Strategy**: Headers apropiados para assets
- **Database Indexing**: Índices optimizados para queries frecuentes

### Monitoring
- **Core Web Vitals**: Lighthouse CI
- **Error Tracking**: Console logs y error boundaries
- **Performance Budget**: Límites de bundle size
- **Database Performance**: Query optimization

---

## 🤝 Contribución

### Guidelines de Código
- **Estilo**: Prettier + ESLint configurado
- **Nomenclatura**: camelCase para JavaScript, kebab-case para CSS
- **Comentarios**: JSDoc para funciones públicas
- **Tests**: Cobertura mínima 80%

### Process de Review
1. **Self Review**: Revisar antes de crear PR
2. **Automated Checks**: Tests y linting automático
3. **Peer Review**: Al menos una aprobación
4. **Testing**: Validar en ambiente de staging

---

## 📝 Changelog y Versioning

### Semantic Versioning
- **MAJOR**: Cambios incompatibles (v2.0.0)
- **MINOR**: Nueva funcionalidad compatible (v1.1.0)
- **PATCH**: Bug fixes y mejoras menores (v1.0.1)

### Funcionalidades Implementadas
- **Sistema de Puntos y Ligas**: Gamificación completa con persistencia en Supabase
- **Comunidad Interactiva**: Publicaciones, comentarios y reacciones
- **Sistema de Autenticación**: Login/registro con verificación OTP
- **Chat Inteligente**: Integración con OpenAI GPT
- **Gestión de Cursos**: Catálogo dinámico con progreso de usuario

### Próximas Funcionalidades
- **Mobile App**: React Native/Flutter
- **Advanced Analytics**: Dashboard instructores
- **Multi-tenancy**: Soporte para múltiples organizaciones
- **AI Voice**: Integración con síntesis de voz
- **Notificaciones Push**: Sistema de alertas en tiempo real

---

## 🔗 Links y Recursos

### Documentación Técnica
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)

### Herramientas Externas
- **Design**: Figma, Adobe XD
- **Testing**: Postman, Thunder Client
- **Database**: pgAdmin, DBeaver
- **Monitoring**: Google Analytics, Grafana

---

## 👥 Equipo y Contacto

### Roles del Proyecto
- **Full Stack Developer**: Desarrollo completo
- **UI/UX Designer**: Diseño de interfaz
- **Content Creator**: Material educativo
- **DevOps Engineer**: Deployment y infraestructura

### Soporte y Contacto
- **Email**: support@aprendeaplica.com
- **GitHub Issues**: Para bugs y feature requests
- **Documentation**: Esta documentación (actualizada regularmente)

---

*Documentación generada automáticamente - Última actualización: 2024*