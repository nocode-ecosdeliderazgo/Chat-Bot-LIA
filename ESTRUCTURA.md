# Estructura del Proyecto Chat-Bot-LIA

## Índice
- [Visión General](#visión-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Estructura de Directorios](#estructura-de-directorios)
- [Tecnologías y Herramientas](#tecnologías-y-herramientas)
- [Flujos de la Aplicación](#flujos-de-la-aplicación)
- [Componentes Clave](#componentes-clave)
- [Configuración y Variables](#configuración-y-variables)
- [Seguridad](#seguridad)
- [Desarrollo y Despliegue](#desarrollo-y-despliegue)

## Visión General

Chat-Bot-LIA es una aplicación educativa full-stack diseñada como asistente de inteligencia artificial para cursos de IA. Combina un chatbot principal con IA conversacional y un sistema de chat en tiempo real para transmisiones en vivo.

### Características Principales
- 🤖 Chatbot educativo con integración OpenAI GPT-4
- 💬 Chat en tiempo real para livestreams
- 🔐 Sistema de autenticación JWT con seguridad avanzada
- 📚 Gestión de contenido educativo con PostgreSQL
- 🎥 Integración de videos y contenido multimedia
- 📱 Diseño responsive y accesible

## Arquitectura del Sistema

```mermaid
graph TB
    subgraph "Frontend"
        A[chat.html] --> B[main.js]
        B --> C[main.css]
        D[login.html] --> E[login.js]
        E --> F[login.css]
    end
    
    subgraph "Backend"
        G[server.js] --> H[Express Server]
        H --> I[Socket.IO]
        H --> J[Authentication]
        H --> K[OpenAI API]
        H --> L[PostgreSQL]
    end
    
    subgraph "External APIs"
        M[OpenAI GPT-4]
        N[PostgreSQL DB]
        O[Socket.IO Clients]
    end
    
    B --> H
    I --> O
    K --> M
    L --> N
```

### Flujo de Datos
1. **Cliente** se conecta a través del navegador
2. **Frontend** maneja la interfaz y interacciones
3. **Backend** procesa requests y maneja lógica de negocio
4. **APIs externas** proporcionan IA y almacenamiento
5. **Socket.IO** maneja comunicación en tiempo real

## Estructura de Directorios

```
Chat-Bot-LIA/
├── 📁 src/                          # Código fuente frontend
│   ├── 📁 assets/                   # Recursos estáticos
│   │   ├── 📁 audio/               # Archivos de audio
│   │   ├── 📁 images/              # Imágenes y avatares
│   │   └── favicon.ico             # Icono de la aplicación
│   ├── 📁 data/                    # Datos estáticos (JSON)
│   ├── 📁 login/                   # Sistema de autenticación
│   │   ├── login.html              # Página de login
│   │   ├── login.js                # Lógica de autenticación
│   │   ├── login.css               # Estilos del login
│   │   └── test-credentials.html   # Pruebas de credenciales
│   ├── 📁 scripts/                 # JavaScript principal
│   │   └── main.js                 # Lógica principal de la app
│   ├── 📁 styles/                  # Estilos CSS
│   │   └── main.css                # Estilos principales
│   ├── 📁 utils/                   # Utilidades JavaScript
│   │   └── helpers.js              # Funciones auxiliares
│   ├── chat.html                   # Interfaz principal del chat
│   ├── index.html                  # Página de inicio
│   ├── welcome.html                # Página de bienvenida
│   └── welcome-new.html            # Nueva página de bienvenida
├── 📁 docs/                        # Documentación
│   ├── AUDIO_FEATURES.md          # Características de audio
│   ├── CHANGELOG.md               # Historial de cambios
│   ├── CONTRIBUTING.md            # Guía de contribución
│   ├── DATABASE_INTEGRATION.md    # Integración con BD
│   ├── DATABASE_STRUCTURE.md      # Estructura de la BD
│   ├── SECURITY.md                # Documentación de seguridad
│   └── USAGE_INSTRUCTIONS.md      # Instrucciones de uso
├── 📁 prompts/                     # Prompts del sistema
│   ├── examples.es.md             # Ejemplos en español
│   ├── safety.es.md               # Prompts de seguridad
│   ├── style.es.md                # Guía de estilo
│   ├── system.es.md               # Prompts del sistema
│   ├── tools.es.md                # Herramientas disponibles
│   └── use_cases.es.md            # Casos de uso
├── 📁 scripts/                     # Scripts de utilidades
│   ├── kill-port-3000.cjs         # Script para liberar puerto
│   └── setup.js                   # Script de configuración
├── 📁 tests/                       # Pruebas automatizadas
│   ├── main.test.js               # Pruebas principales
│   └── setup.js                   # Configuración de tests
├── 📁 uploads/                     # Archivos subidos (dinámico)
├── 📁 tmp/                         # Archivos temporales
├── server.js                      # Servidor backend principal
├── package.json                   # Dependencias y scripts
├── jest.config.js                 # Configuración de Jest
├── webpack.config.js              # Configuración de Webpack
├── .env.example                   # Variables de entorno ejemplo
├── .eslintrc.json                 # Configuración ESLint
├── .prettierrc                    # Configuración Prettier
├── .gitignore                     # Archivos ignorados por Git
├── CLAUDE.md                      # Instrucciones para Claude
├── ESTRUCTURA.md                  # Este archivo
└── README.md                      # Documentación principal
```

## Tecnologías y Herramientas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Socket.IO** - Comunicación en tiempo real
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **Helmet** - Middlewares de seguridad
- **CORS** - Control de acceso entre dominios
- **Multer** - Manejo de archivos subidos
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **Vanilla JavaScript (ES6+)** - Lógica del cliente
- **HTML5** - Estructura semántica
- **CSS3** - Estilos y responsive design
- **Socket.IO Client** - Cliente para tiempo real
- **Boxicons** - Iconografía
- **Google Fonts** - Tipografías (Inter, Montserrat)

### APIs Externas
- **OpenAI GPT-4** - Inteligencia artificial conversacional
- **YouTube/Vimeo** - Integración de videos educativos

### Herramientas de Desarrollo
- **Jest** - Framework de testing
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Nodemon** - Recarga automática en desarrollo
- **Webpack** - Bundling de assets

## Flujos de la Aplicación

### 1. Flujo de Autenticación
```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant S as Server
    participant DB as Database
    
    U->>F: Accede a la aplicación
    F->>F: Verifica token local
    alt Token válido
        F->>S: Valida token
        S->>F: Token confirmado
        F->>F: Redirige a chat
    else Sin token/inválido
        F->>F: Muestra login
        U->>F: Ingresa credenciales
        F->>S: POST /api/login
        S->>DB: Verifica credenciales
        DB->>S: Usuario validado
        S->>F: Retorna JWT token
        F->>F: Almacena token
        F->>F: Redirige a chat
    end
```

### 2. Flujo del Chatbot Principal
```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant S as Server
    participant AI as OpenAI API
    participant DB as Database
    
    U->>F: Escribe mensaje
    F->>F: Valida entrada
    F->>S: POST /api/chat
    S->>S: Autentica request
    S->>DB: Obtiene contexto del curso
    DB->>S: Retorna contenido relevante
    S->>AI: Envía prompt + contexto
    AI->>S: Retorna respuesta IA
    S->>DB: Guarda conversación
    S->>F: Retorna respuesta
    F->>F: Simula typing
    F->>U: Muestra respuesta
```

### 3. Flujo del Chat en Tiempo Real
```mermaid
sequenceDiagram
    participant U1 as Usuario 1
    participant U2 as Usuario 2
    participant F1 as Frontend 1
    participant F2 as Frontend 2
    participant S as Server (Socket.IO)
    
    U1->>F1: Abre livestream
    F1->>S: Conecta Socket.IO
    S->>F1: Confirma conexión
    F1->>S: join-livestream-chat
    S->>S: Registra usuario
    
    U2->>F2: Abre livestream
    F2->>S: Conecta Socket.IO
    S->>F2: Confirma conexión
    F2->>S: join-livestream-chat
    S->>S: Registra usuario
    S->>F1: user-joined (Usuario 2)
    S->>F2: users-list
    S->>F1: users-list
    
    U1->>F1: Escribe mensaje
    F1->>S: livestream-message
    S->>F1: new-livestream-message
    S->>F2: new-livestream-message
    F2->>U2: Muestra mensaje de Usuario 1
```

### 4. Flujo de Gestión de Contenido
```mermaid
sequenceDiagram
    participant A as Admin
    participant S as Server
    participant DB as Database
    participant F as Files
    
    A->>S: Sube contenido educativo
    S->>F: Almacena archivos
    S->>DB: Guarda metadatos
    S->>A: Confirma subida
    
    Note over S,DB: Contenido disponible para IA
    
    S->>DB: Consulta contexto por tema
    DB->>S: Retorna contenido relevante
    S->>S: Integra en prompt IA
```

## Componentes Clave

### 1. Sistema de Autenticación (`src/login/`)
- **login.html**: Interfaz de inicio de sesión
- **login.js**: Validación de credenciales y manejo de JWT
- **login.css**: Estilos del formulario de login

### 2. Chatbot Principal (`src/scripts/main.js`)
```javascript
// Configuración principal
const CHATBOT_CONFIG = {
    name: 'Lia IA',
    typingSpeed: 50,
    responseDelay: 1000,
    audioEnabled: true,
    openai: {
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.7
    }
};

// Funciones principales
- sendMessage()          // Envía mensaje a la IA
- addBotMessage()        // Añade respuesta del bot
- simulateTyping()       // Efecto de escritura
- playWelcomeAudio()     // Audio de bienvenida
```

### 3. Chat en Tiempo Real
```javascript
// Cliente Socket.IO
const livestreamSocket = io();

// Eventos principales
- 'connect'              // Conexión establecida
- 'new-livestream-message' // Nuevo mensaje
- 'user-joined'          // Usuario se une
- 'user-left'            // Usuario se va
- 'users-list'           // Lista de usuarios
```

### 4. Servidor Backend (`server.js`)
```javascript
// Middlewares principales
- helmet()               // Seguridad HTTP
- cors()                 // Control de acceso
- rateLimit()            // Límite de requests
- authenticateRequest    // Validación JWT
- requireUserSession     // Sesión de usuario

// Endpoints principales
- POST /api/login        // Autenticación
- POST /api/chat         // Chat con IA
- POST /api/database     // Consultas BD
- GET /api/config        // Configuración
```

### 5. Gestión de Sesiones
```javascript
const sessionManager = {
    sessions: Map(),
    createSession(),     // Nueva sesión
    switchToSession(),   // Cambiar sesión
    archiveSession(),    // Archivar sesión
    getCurrentSession()  // Obtener sesión activa
};
```

## Configuración y Variables

### Variables de Entorno (`.env`)
```bash
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/chatbot_db

# OpenAI
OPENAI_API_KEY=sk-...

# Autenticación
USER_JWT_SECRET=secret_key
API_SECRET_KEY=api_secret

# Chatbot
CHATBOT_MODEL=gpt-4o-mini
CHATBOT_MAX_TOKENS=900
CHATBOT_TEMPERATURE=0.5
```

### Scripts NPM
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest",
  "lint": "eslint src/",
  "format": "prettier --write src/",
  "security-check": "npm audit && npm audit fix",
  "setup": "npm install && npm run security-check"
}
```

## Seguridad

### Medidas Implementadas
1. **Helmet.js** - Headers de seguridad HTTP
2. **CORS** - Control de acceso entre dominios
3. **Rate Limiting** - Prevención de ataques de fuerza bruta
4. **JWT** - Tokens con expiración y fingerprinting
5. **Input Validation** - Sanitización de entradas
6. **Parameterized Queries** - Prevención de SQL injection
7. **CSP** - Content Security Policy
8. **Environment Variables** - Credenciales seguras

### Flujo de Seguridad
```mermaid
graph LR
    A[Request] --> B[Rate Limiting]
    B --> C[CORS Check]
    C --> D[Helmet Headers]
    D --> E[JWT Validation]
    E --> F[Input Sanitization]
    F --> G[Process Request]
    G --> H[Secure Response]
```

## Desarrollo y Despliegue

### Configuración de Desarrollo
1. **Clonar repositorio**
2. **Instalar dependencias**: `npm install`
3. **Configurar variables de entorno**: Copiar `.env.example` a `.env`
4. **Inicializar base de datos**: Crear esquemas según `docs/DATABASE_STRUCTURE.md`
5. **Ejecutar en desarrollo**: `npm run dev`

### Estructura de Testing
```javascript
// Jest configuration (jest.config.js)
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ]
};
```

### Flujo de CI/CD Sugerido
1. **Lint y Format**: `npm run lint && npm run format`
2. **Tests**: `npm test`
3. **Security Check**: `npm run security-check`
4. **Build**: Preparar assets estáticos
5. **Deploy**: Despliegue a servidor de producción

### Monitoreo y Logs
- Console logs estructurados con emojis
- Tracking de conexiones Socket.IO
- Monitoreo de requests y respuestas
- Logs de errores con stack traces
- Métricas de uso de OpenAI API

---

Este documento proporciona una visión completa de la estructura del proyecto Chat-Bot-LIA, desde la arquitectura técnica hasta los flujos de funcionamiento y configuración de desarrollo.