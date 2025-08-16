# CLAUDE.md

Este archivo proporciona contexto a Claude Code para trabajar eficientemente con este repositorio.

## Resumen del Proyecto

**Aplicación Chatbot Educativo Web** - Sistema full-stack con interfaz de chat interactivo, autenticación segura, integración OpenAI y funcionalidades de chat en tiempo real.

## Comandos Comunes

### Desarrollo
- `npm start` - Inicia el servidor (ejecuta server.js)
- `npm run dev` - Inicia servidor de desarrollo con nodemon
- `npm test` - Ejecuta tests con Jest
- `npm run lint` - Linter para archivos JavaScript en src/
- `npm run format` - Formatea código con Prettier
- `npm run security-check` - Ejecuta npm audit y corrige vulnerabilidades
- `npm run setup` - Instala dependencias y ejecuta check de seguridad

### Testing
- Tests configurados con Jest usando entorno jsdom
- Archivos de test: `**/__tests__/**/*.js` or `**/?(*.)+(spec|test).js`
- Reportes de cobertura generados en directorio `coverage/`
- Archivo de configuración: `tests/setup.js`

## Arquitectura del Proyecto

### Estructura de la Aplicación
Aplicación chatbot educativo full-stack con:

**Backend (server.js):**
- Servidor Express.js con middleware de seguridad completo
- Autenticación JWT con fingerprinting de sesión
- Integración PostgreSQL para contenido de cursos y datos de usuario
- Integración API OpenAI para respuestas de IA
- Rate limiting, CORS, y headers de seguridad Helmet
- Soporte de carga de archivos con Multer
- Integración Socket.IO para funcionalidad de chat en tiempo real

**Frontend:**
- JavaScript vanilla (ES6+) en `src/scripts/main.js`
- CSS moderno con diseño responsivo en `src/styles/main.css`
- Sistema de login en `src/login/`
- Interfaz principal de chat en `src/chat.html`
- Interfaz de chat en tiempo real integrada en sidebar

### Componentes Clave

**Sistema de Chat (`src/scripts/main.js`):**
- Configuración chatbot con integración OpenAI GPT-4
- Simulación de escritura en tiempo real y manejo de mensajes
- Funciones de audio con sonidos de bienvenida
- Historia de conversación y gestión de estado
- Carga dinámica de API key desde backend
- Chat en tiempo real con integración cliente Socket.IO

**Funcionalidades Chat en Tiempo Real:**
- Mensajería en tiempo real entre todos los usuarios conectados
- Generación automática de nombres de usuario
- Indicadores de estado de conexión
- Mostrar número de usuarios
- Historia de mensajes (últimos 50 mensajes)
- Diseño responsivo con scrollbars personalizadas
- Notificaciones del sistema para eventos de entrada/salida de usuarios

**Implementación de Seguridad:**
- Variables de entorno para datos sensibles (API keys, URLs de base de datos)
- Tokens JWT con fingerprinting de sesión
- Autenticación API key para todos los endpoints
- Content Security Policy y headers de seguridad
- Queries SQL parametrizadas para prevenir inyección

**Esquema de Base de Datos:**
- PostgreSQL con tablas para contenido de cursos, usuarios, conversaciones y sesiones
- Categorización de contenido por dificultad y tema
- Seguimiento de progreso de usuario e historial de conversación

### Archivos de Configuración
- `jest.config.js` - Configuración testing Jest con entorno jsdom
- `package.json` - Dependencias y scripts npm (incluye Socket.IO)
- Variables de entorno esperadas en archivo `.env` (ver docs/SECURITY.md)

### Notas Importantes
- La aplicación usa un enfoque security-first con múltiples capas de protección
- Conexiones de base de datos y API keys de OpenAI se cargan dinámicamente desde variables de entorno
- Frontend no almacena credenciales sensibles - todas las llamadas API van a través de endpoints backend autenticados
- El chatbot está configurado como "Asistente de Aprende y Aplica IA"
- Funciones de audio están integradas pero son opcionales para usuarios
- Funcionalidad de chat en tiempo real usa Socket.IO con CORS configurado para desarrollo
- Chat en tiempo real es accesible en la sección plegable livestream del sidebar
- Mensajes de chat están limitados a 200 caracteres e historial de 50 mensajes

### Flujo de Desarrollo
1. Configurar variables de entorno (ver docs/SECURITY.md para variables requeridas)
2. Ejecutar `npm run setup` para instalar dependencias y verificar seguridad
3. Usar `npm run dev` para desarrollo con auto-restart
4. Ejecutar `npm test` para correr la suite de tests
5. Usar `npm run lint` y `npm run format` para mantener calidad de código

### Documentación
- Documentación de seguridad completa en `docs/SECURITY.md`
- Estructura de base de datos definida en `docs/DATABASE_STRUCTURE.md`
- Instrucciones de setup en `PROJECT_SETUP.md`
- Detalles de implementación de login en `LOGIN_IMPLEMENTATION.md`