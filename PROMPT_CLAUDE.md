# PROMPT COMPLETO: Panel de Maestros/Instructores - Chat-Bot-LIA

## 🎯 OBJETIVO PRINCIPAL
Crear una página web exclusiva para maestros/instructores de cursos que permita gestionar completamente los cursos sin necesidad de hardcodear código, siguiendo el diseño y estructura del proyecto Chat-Bot-LIA. La página debe permitir crear, editar y administrar cursos utilizando la base de datos proporcionada, manteniendo total coherencia con el sistema de diseño existente.

## 🎨 SISTEMA DE DISEÑO ACTUAL (OBLIGATORIO RESPETAR)

### Colores Principales (de Courses.css):
```css
--course-primary: #44E5FF      /* Turquesa IA - Accent principal (Uso: CTA, iconos, links) */
--course-secondary: #0077A6    /* Azul Oscuro - Secundario (Uso: Hover links, badges) */
--course-success: #22C55E      /* Verde Éxito */
--course-warning: #F59E0B      /* Amarillo Advertencia */
--course-error: #EF4444        /* Rojo Error */
--course-dark: #0A0A0A         /* Carbón Digital - Neutro Oscuro (Uso: Texto headlines, fondos hero) */
--course-light: #F2F2F2        /* Gris Neblina - Neutro Claro (Uso: Secciones de respiro) */
--course-white: #FFFFFF        /* Blanco Puro - Contraste (Uso: Texto sobre oscuro) */
--course-bg-gradient-start: #0a0f19
--course-bg-gradient-end: #1a2332
```

### Tipografías:
- **Títulos (H1, H2)**: Montserrat ExtraBold / Bold
- **Cuerpo de Texto**: Inter Regular / Medium
- **Fallback**: Arial, Helvetica, sans-serif

### Iconografía & Ilustraciones:
- **Íconos**: Outline en Turquesa IA (#44E5FF) o Carbón Digital (#0A0A0A)
- **Ilustraciones**: Isométricas con patrón molecular (círculos conectados) para fondos hero

### Gradientes Existentes:
```css
--gradient-primary: linear-gradient(135deg, #44E5FF 0%, #0077A6 100%);
--gradient-dark: linear-gradient(135deg, #0a0f19 0%, #1a2332 50%, #0a0f19 100%);
--gradient-glass: linear-gradient(135deg, rgba(68, 229, 255, 0.1) 0%, rgba(0, 119, 166, 0.1) 100%);
```

## 🚀 REQUISITOS DE DISEÑO COMPLETOS

### 1. ESTRUCTURA HTML SEMÁNTICA

#### Header del Panel de Maestros:
```html
<header class="instructor-header">
    <!-- Fondo con partículas animadas -->
    <div class="header-background">
        <div class="particles-container"></div>
        <div class="gradient-overlay"></div>
    </div>
    
    <!-- Navegación -->
    <nav class="instructor-nav">
        <div class="nav-logo">
            <svg class="logo-icon">...</svg>
            <span class="logo-text">Panel de Maestros</span>
        </div>
        <div class="nav-actions">
            <button class="btn-secondary" id="profileBtn">
                <svg class="btn-icon">👤</svg>
                <span>Perfil</span>
            </button>
            <button class="btn-primary" id="logoutBtn">
                <svg class="btn-icon">🚪</svg>
                <span>Cerrar Sesión</span>
            </button>
        </div>
    </nav>
    
    <!-- Contenido Principal -->
    <div class="header-content">
        <div class="header-badge">
            <svg class="instructor-icon">🎓</svg>
            <span>Gestión de Cursos</span>
        </div>
        <h1 class="header-title">Panel de Maestros - Chat-Bot-LIA</h1>
        <p class="header-description">
            Crea, edita y administra tus cursos de manera profesional. 
            Gestiona contenido, módulos, actividades y recursos multimedia sin necesidad de programar.
        </p>
        <div class="header-actions">
            <button class="btn-primary btn-large" id="createCourseBtn">
                <span>Crear Nuevo Curso</span>
                <svg class="btn-icon">+</svg>
            </button>
            <button class="btn-secondary btn-large" id="viewCoursesBtn">
                <span>Ver Mis Cursos</span>
                <svg class="btn-icon">📚</svg>
            </button>
        </div>
    </div>
</header>
```

#### Sección Principal del Panel:
```html
<main class="instructor-main">
    <div class="container">
        <!-- El contenido principal se cargará dinámicamente aquí -->
        <div id="mainContent">
            <!-- Contenido principal sin animaciones no deseadas -->
        </div>
    </div>
</main>
```

        <!-- Formulario de Creación/Edición de Curso -->
        <section class="course-form-section" id="courseFormSection" style="display: none;">
            <div class="form-container">
                <div class="form-header">
                    <h2 id="formTitle">Crear Nuevo Curso</h2>
                    <button class="btn-secondary" id="closeFormBtn">
                        <svg class="btn-icon">✕</svg>
                    </button>
                </div>
                
                <form id="courseForm" class="course-form">
                    <!-- Información Básica del Curso -->
                    <div class="form-section">
                        <h3>Información Básica</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="courseName">Nombre del Curso *</label>
                                <input type="text" id="courseName" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="coursePrice">Precio *</label>
                                <input type="number" id="coursePrice" name="price" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label for="courseCurrency">Moneda</label>
                                <select id="courseCurrency" name="currency">
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="MXN">MXN</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="courseModality">Modalidad *</label>
                                <select id="courseModality" name="modality" required>
                                    <option value="async">Asíncrona (Solo videos/documentos)</option>
                                    <option value="sync">Síncrona (Sesiones en vivo)</option>
                                    <option value="mixed">Mixta (Videos + sesiones en vivo)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="courseShortDescription">Descripción Corta *</label>
                            <textarea id="courseShortDescription" name="short_description" rows="3" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="courseLongDescription">Descripción Larga *</label>
                            <textarea id="courseLongDescription" name="long_description" rows="6" required></textarea>
                        </div>
                    </div>

                    <!-- Configuración del Curso -->
                    <div class="form-section">
                        <h3>Configuración</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="courseSessions">Número de Sesiones</label>
                                <input type="number" id="courseSessions" name="session_count" min="1" max="75">
                            </div>
                            <div class="form-group">
                                <label for="courseDuration">Duración Total (minutos)</label>
                                <input type="number" id="courseDuration" name="total_duration">
                            </div>
                            <div class="form-group">
                                <label for="courseSeries">Serie (opcional)</label>
                                <select id="courseSeries" name="series_id">
                                    <option value="">Sin serie</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="courseStatus">Estado</label>
                                <select id="courseStatus" name="status">
                                    <option value="draft">Borrador</option>
                                    <option value="published">Publicado</option>
                                    <option value="archived">Archivado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- URLs y Enlaces -->
                    <div class="form-section">
                        <h3>Enlaces y URLs</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="coursePurchaseUrl">URL de Compra *</label>
                                <input type="url" id="coursePurchaseUrl" name="purchase_url" required>
                            </div>
                            <div class="form-group">
                                <label for="courseUrl">URL del Curso</label>
                                <input type="url" id="courseUrl" name="course_url">
                            </div>
                            <div class="form-group">
                                <label for="courseTemarioUrl">URL del Temario</label>
                                <input type="url" id="courseTemarioUrl" name="temario_url">
                            </div>
                        </div>
                    </div>

                    <!-- Bonos y Documentos -->
                    <div class="form-section">
                        <h3>Bonos y Documentos</h3>
                        <div class="form-group">
                            <label for="courseBonuses">Bonos (JSON)</label>
                            <textarea id="courseBonuses" name="bonuses" rows="4" placeholder='[{"title": "Bono 1", "description": "Descripción del bono"}]'></textarea>
                        </div>
                        <div class="form-group">
                            <label for="courseInfoDocs">Documentos Informativos (JSON)</label>
                            <textarea id="courseInfoDocs" name="info_docs" rows="4" placeholder='[{"title": "Documento 1", "url": "https://..."}]'></textarea>
                        </div>
                    </div>

                    <!-- Feedback de IA -->
                    <div class="form-section">
                        <h3>Feedback de IA</h3>
                        <div class="form-group">
                            <label for="courseAiFeedback">Comentarios de IA</label>
                            <textarea id="courseAiFeedback" name="ai_feedback" rows="3"></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancelCourseBtn">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar Curso</button>
                    </div>
                </form>
            </div>
        </section>

        <!-- Gestión de Módulos -->
        <section class="modules-section" id="modulesSection" style="display: none;">
            <div class="modules-container">
                <div class="modules-header">
                    <h2>Gestión de Módulos - <span id="currentCourseName"></span></h2>
                    <button class="btn-primary" id="addModuleBtn">
                        <svg class="btn-icon">+</svg>
                        <span>Agregar Módulo</span>
                    </button>
                </div>
                
                <div class="modules-list" id="modulesList">
                    <!-- Los módulos se cargarán dinámicamente aquí -->
                </div>
            </div>
        </section>

        <!-- Gestión de Actividades -->
        <section class="activities-section" id="activitiesSection" style="display: none;">
            <div class="activities-container">
                <div class="activities-header">
                    <h2>Actividades del Módulo - <span id="currentModuleName"></span></h2>
                    <button class="btn-primary" id="addActivityBtn">
                        <svg class="btn-icon">+</svg>
                        <span>Agregar Actividad</span>
                    </button>
                </div>
                
                <div class="activities-list" id="activitiesList">
                    <!-- Las actividades se cargarán dinámicamente aquí -->
                </div>
            </div>
        </section>
    </div>
</main>
```

#### Layout de Chat (Similar a chat.html):
```html
<!-- Layout de Chat - Solo se muestra para cursos síncronos o mixtos -->
<div class="chat-layout" id="chatLayout" style="display: none;">
    <div class="chat-container">
        <!-- Panel Izquierdo -->
        <div class="chat-sidebar">
            <div class="sidebar-header">
                <h3>Panel de Control</h3>
            </div>
            
            <div class="sidebar-content">
                <div class="sidebar-section">
                    <h4>Información del Curso</h4>
                    <div class="course-info" id="courseInfo">
                        <!-- Información del curso actual -->
                    </div>
                </div>
                
                <div class="sidebar-section">
                    <h4>Estadísticas</h4>
                    <div class="stats-info">
                        <div class="stat-item">
                            <span class="stat-label">Módulos</span>
                            <span class="stat-value" id="modulesCount">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Actividades</span>
                            <span class="stat-value" id="activitiesCount">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Recursos</span>
                            <span class="stat-value" id="resourcesCount">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-section">
                    <h4>Acciones Rápidas</h4>
                    <div class="quick-actions">
                        <button class="btn-secondary" id="previewCourseBtn">
                            <svg class="btn-icon">👁️</svg>
                            <span>Vista Previa</span>
                        </button>
                        <button class="btn-secondary" id="exportCourseBtn">
                            <svg class="btn-icon">📤</svg>
                            <span>Exportar</span>
                        </button>
                        <button class="btn-secondary" id="duplicateCourseBtn">
                            <svg class="btn-icon">📋</svg>
                            <span>Duplicar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Panel Central -->
        <div class="chat-main">
            <div class="chat-header">
                <div class="header-left">
                    <button class="btn-secondary" id="backToDashboardBtn">
                        <svg class="btn-icon">←</svg>
                        <span>Volver al Dashboard</span>
                    </button>
                </div>
                <div class="header-center">
                    <h2 id="currentCourseTitle">Nombre del Curso</h2>
                    <span class="course-status" id="courseStatus">Borrador</span>
                </div>
                <div class="header-right">
                    <button class="btn-primary" id="saveAllBtn">
                        <svg class="btn-icon">💾</svg>
                        <span>Guardar Todo</span>
                    </button>
                </div>
            </div>
            
            <div class="chat-content">
                <!-- Contenido principal del curso se cargará aquí -->
                <div id="courseContent">
                    <!-- Secciones del curso -->
                </div>
            </div>
        </div>

        <!-- Panel Derecho - Chat IA -->
        <div class="chat-ia">
            <div class="ia-header">
                <h3>Asistente IA</h3>
                <button class="btn-secondary" id="toggleIaBtn">
                    <svg class="btn-icon">🤖</svg>
                </button>
            </div>
            
            <div class="ia-content">
                <div class="ia-messages" id="iaMessages">
                    <div class="ia-message">
                        <div class="message-content">
                            <p>¡Hola! Soy tu asistente IA para la creación de cursos. ¿En qué puedo ayudarte hoy?</p>
                        </div>
                    </div>
                </div>
                
                <div class="ia-input">
                    <textarea id="iaInput" placeholder="Escribe tu pregunta..."></textarea>
                    <button class="btn-primary" id="sendIaBtn">
                        <svg class="btn-icon">→</svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
```

#### Footer del Panel:
```html
<footer class="instructor-footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-brand">
                <div class="footer-logo">
                    <svg class="logo-icon">...</svg>
                    <span>Panel de Maestros - Chat-Bot-LIA</span>
                </div>
                <p>Gestiona tus cursos de manera profesional y eficiente</p>
            </div>
            <div class="footer-links">
                <div class="link-group">
                    <h4>Recursos</h4>
                    <ul>
                        <li><a href="#" id="helpLink">Ayuda</a></li>
                        <li><a href="#" id="docsLink">Documentación</a></li>
                        <li><a href="#" id="supportLink">Soporte</a></li>
                    </ul>
                </div>
                <div class="link-group">
                    <h4>Acciones</h4>
                    <ul>
                        <li><a href="#" id="backupLink">Respaldo</a></li>
                        <li><a href="#" id="exportLink">Exportar</a></li>
                        <li><a href="#" id="settingsLink">Configuración</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 Chat-Bot-LIA. Panel de Maestros. Todos los derechos reservados.</p>
        </div>
    </div>
</footer>
```

## 🗄️ ESTRUCTURA DE BASE DE DATOS UTILIZADA

### Tablas Principales (IGNORAR tablas de usuarios):
```sql
-- Tabla principal de cursos
CREATE TABLE public.ai_courses (
  id_ai_courses uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL,
  purchase_url character varying NOT NULL,
  long_description character varying NOT NULL,
  short_description character varying NOT NULL,
  price character varying NOT NULL,
  currency character varying NOT NULL,
  session_count smallint,
  total_duration bigint,
  course_url character varying,
  status character varying,
  roi character varying,
  modality character varying,
  series_id uuid,
  temario_url text,
  bonuses jsonb,
  info_docs jsonb,
  ai_feedback text
);

-- Tabla de series de cursos
CREATE TABLE public.course_series (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de módulos del curso
CREATE TABLE public.course_module (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  session_id smallint,
  title text NOT NULL,
  description text,
  position smallint DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  ai_feedback text
);

-- Tabla de actividades de módulos
CREATE TABLE public.module_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL,
  type text CHECK (type = ANY (ARRAY['individual'::text, 'colaborativa'::text])),
  content_type text CHECK (content_type = ANY (ARRAY['texto'::text, 'documento'::text, 'video'::text, 'cuestionario'::text])),
  resource_url text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  ai_feedback text
);

-- Tabla de recursos multimedia
CREATE TABLE public.media_resource (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_type text CHECK (owner_type = ANY (ARRAY['curso'::text, 'modulo'::text, 'actividad'::text, 'comunidad'::text, 'noticia'::text])),
  owner_id uuid NOT NULL,
  type text CHECK (type = ANY (ARRAY['video'::text, 'documento'::text, 'audio'::text, 'imagen'::text])),
  source text CHECK (source = ANY (ARRAY['interno'::text, 'externo'::text])),
  url text NOT NULL,
  format text,
  size bigint,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla de cuestionarios
CREATE TABLE public.quiz (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  title text NOT NULL,
  description text
);

-- Tabla de preguntas de cuestionarios
CREATE TABLE public.quiz_question (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL,
  question_text text NOT NULL,
  options jsonb,
  correct_answer text
);
```

### 2. FUNCIONALIDADES PRINCIPALES

#### Gestión de Cursos:
- **Crear nuevo curso** con toda la información básica
- **Editar cursos existentes** con formulario completo
- **Eliminar cursos** con confirmación
- **Duplicar cursos** para crear variaciones
- **Cambiar estado** (borrador, publicado, archivado)
- **Vista previa** del curso antes de publicar
- **SIN animaciones no deseadas** en la interfaz

#### Gestión de Módulos:
- **Agregar módulos** a cada curso
- **Editar información** de módulos (título, descripción, posición)
- **Reordenar módulos** con drag & drop
- **Eliminar módulos** con confirmación
- **Asignar sesiones** a módulos

#### Gestión de Actividades:
- **Crear actividades** individuales o colaborativas
- **Tipos de contenido**: texto, documento, video, cuestionario
- **Subir archivos multimedia** (videos, documentos, imágenes)
- **Integrar recursos externos** (YouTube, Vimeo, etc.)
- **Configurar metadatos** para cada actividad

#### Recursos Multimedia:
- **Subir archivos** con drag & drop
- **Previsualización** de videos e imágenes
- **Organización** por tipo y curso
- **Gestión de URLs** externas
- **Compresión automática** de archivos grandes

#### Chat IA Integrado:
- **Asistente inteligente** para crear contenido
- **Sugerencias automáticas** para títulos y descripciones
- **Validación de contenido** antes de guardar
- **Ayuda contextual** según el tipo de actividad
- **Generación de metadatos** automática

#### Efectos Hover Avanzados:
```css
/* Glow Effect */
.glow-hover {
    transition: all 0.3s ease;
    position: relative;
}

.glow-hover::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, var(--course-primary), var(--course-secondary));
    border-radius: inherit;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.glow-hover:hover::before {
    opacity: 1;
}

/* Lift Effect */
.lift-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.lift-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(68, 229, 255, 0.3);
}

/* Magnetic Effect */
.magnetic {
    transition: transform 0.3s ease;
}

.magnetic:hover {
    transform: scale(1.05);
}
```

#### Animaciones Continuas:
```css
/* Floating Animation */
@keyframes float {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-20px);
    }
}

.floating {
    animation: float 6s ease-in-out infinite;
}

/* Pulse Animation */
@keyframes pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(68, 229, 255, 0.7);
    }
    70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(68, 229, 255, 0);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(68, 229, 255, 0);
    }
}

.pulse {
    animation: pulse 2s infinite;
}

/* Gradient Animation */
@keyframes gradientShift {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

.animated-gradient {
    background: linear-gradient(-45deg, var(--course-primary), var(--course-secondary), var(--course-success), var(--course-primary));
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
}
```

### 3. SISTEMA DE PARTÍCULAS

#### JavaScript para Partículas:
```javascript
class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    createParticles() {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    animate() {
        this.particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = this.mouse.x - centerX;
            const deltaY = this.mouse.y - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.style.transform = `translate(${deltaX * force * 0.1}px, ${deltaY * force * 0.1}px)`;
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}
```

#### CSS para Partículas:
```css
.particles-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
}

.particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--course-primary);
    border-radius: 50%;
    opacity: 0.6;
    animation: particleFloat 15s linear infinite;
}

@keyframes particleFloat {
    0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 0.6;
    }
    90% {
        opacity: 0.6;
    }
    100% {
        transform: translateY(-100px) rotate(360deg);
        opacity: 0;
    }
}
```

### 4. EFECTOS GLASSMORPHISM

```css
.glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-button {
    background: rgba(68, 229, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(68, 229, 255, 0.3);
    color: var(--course-primary);
    transition: all 0.3s ease;
}

.glass-button:hover {
    background: rgba(68, 229, 255, 0.2);
    border-color: var(--course-primary);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(68, 229, 255, 0.3);
}
```

### 5. BOTONES AVANZADOS

```css
.btn-primary {
    background: var(--gradient-primary);
    border: none;
    border-radius: 50px;
    padding: 15px 30px;
    color: white;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.btn-primary:hover::before {
    left: 100%;
}

.btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(68, 229, 255, 0.4);
}

.btn-large {
    padding: 18px 40px;
    font-size: 18px;
}

.btn-icon {
    margin-left: 10px;
    transition: transform 0.3s ease;
}

.btn-primary:hover .btn-icon {
    transform: translateX(5px);
}
```

### 6. RESPONSIVE DESIGN

```css
/* Mobile First */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        padding: 0 40px;
    }
    
    .features-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .features-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 40px;
    }
    
    .stats-grid {
        grid-template-columns: repeat(4, 1fr);
    }
    
    .hero-content {
        grid-template-columns: 1fr 1fr;
        gap: 60px;
    }
}

/* Large Desktop */
@media (min-width: 1440px) {
    .container {
        max-width: 1400px;
    }
}
```

### 7. SCROLL ANIMATIONS

```javascript
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, this.observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            this.observer.observe(el);
        });
    }
}
```

```css
.animate-on-scroll {
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s ease;
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}

/* Stagger animations */
.stagger-container .animate-on-scroll:nth-child(1) { transition-delay: 0.1s; }
.stagger-container .animate-on-scroll:nth-child(2) { transition-delay: 0.2s; }
.stagger-container .animate-on-scroll:nth-child(3) { transition-delay: 0.3s; }
.stagger-container .animate-on-scroll:nth-child(4) { transition-delay: 0.4s; }
```

### 8. CONTADORES ANIMADOS

```javascript
class AnimatedCounters {
    constructor() {
        this.counters = document.querySelectorAll('[data-target]');
        this.init();
    }

    init() {
        this.counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter);
        });
    }
}
```

### 9. JAVASCRIPT PARA GESTIÓN DE CURSOS

#### Clase Principal de Gestión:
```javascript
class CourseManager {
    constructor() {
        this.currentCourse = null;
        this.currentModule = null;
        this.courses = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCourses();
        this.initChatIA();
    }

    bindEvents() {
        // Botones principales
        document.getElementById('createCourseBtn').addEventListener('click', () => this.showCourseForm());
        document.getElementById('closeFormBtn').addEventListener('click', () => this.hideCourseForm());
        
        // Formulario de curso
        document.getElementById('courseForm').addEventListener('submit', (e) => this.saveCourse(e));
        document.getElementById('cancelCourseBtn').addEventListener('click', () => this.hideCourseForm());
        
        // Chat IA
        document.getElementById('sendIaBtn').addEventListener('click', () => this.sendIAMessage());
        document.getElementById('iaInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendIAMessage();
        });
    }

    async loadCourses() {
        try {
            const response = await fetch('/api/courses');
            this.courses = await response.json();
            // Los cursos se cargarán cuando sea necesario, sin renderizar automáticamente
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showNotification('Error al cargar cursos', 'error');
        }
    }

    createCourseCard(course) {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${course.name}</h3>
                <span class="status-badge ${course.status}">${course.status}</span>
            </div>
            <div class="card-content">
                <p>${course.short_description}</p>
                <div class="course-meta">
                    <span class="price">${course.currency} ${course.price}</span>
                    <span class="sessions">${course.session_count || 0} sesiones</span>
                    <span class="modality">${course.modality}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-secondary" onclick="courseManager.editCourse('${course.id_ai_courses}')">
                    <svg class="btn-icon">✏️</svg>
                    <span>Editar</span>
                </button>
                <button class="btn-secondary" onclick="courseManager.manageModules('${course.id_ai_courses}')">
                    <svg class="btn-icon">📚</svg>
                    <span>Módulos</span>
                </button>
                <button class="btn-secondary" onclick="courseManager.previewCourse('${course.id_ai_courses}')">
                    <svg class="btn-icon">👁️</svg>
                    <span>Vista Previa</span>
                </button>
                <button class="btn-secondary" onclick="courseManager.duplicateCourse('${course.id_ai_courses}')">
                    <svg class="btn-icon">📋</svg>
                    <span>Duplicar</span>
                </button>
                <button class="btn-error" onclick="courseManager.deleteCourse('${course.id_ai_courses}')">
                    <svg class="btn-icon">🗑️</svg>
                    <span>Eliminar</span>
                </button>
            </div>
        `;
        return card;
    }

    showCourseForm(courseId = null) {
        const formSection = document.getElementById('courseFormSection');
        const formTitle = document.getElementById('formTitle');
        
        if (courseId) {
            this.currentCourse = this.courses.find(c => c.id_ai_courses === courseId);
            formTitle.textContent = 'Editar Curso';
            this.populateForm(this.currentCourse);
        } else {
            this.currentCourse = null;
            formTitle.textContent = 'Crear Nuevo Curso';
            this.clearForm();
        }
        
        formSection.style.display = 'block';
        document.getElementById('courseName').focus();
    }

    hideCourseForm() {
        document.getElementById('courseFormSection').style.display = 'none';
        this.currentCourse = null;
    }

    async saveCourse(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const courseData = Object.fromEntries(formData.entries());
        
        try {
            const url = this.currentCourse 
                ? `/api/courses/${this.currentCourse.id_ai_courses}`
                : '/api/courses';
            
            const method = this.currentCourse ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData)
            });
            
            if (response.ok) {
                this.showNotification('Curso guardado exitosamente', 'success');
                this.hideCourseForm();
                this.loadCourses();
            } else {
                throw new Error('Error al guardar el curso');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            this.showNotification('Error al guardar el curso', 'error');
        }
    }

    async deleteCourse(courseId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.showNotification('Curso eliminado exitosamente', 'success');
                this.loadCourses();
            } else {
                throw new Error('Error al eliminar el curso');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            this.showNotification('Error al eliminar el curso', 'error');
        }
    }

    // Función de búsqueda eliminada para evitar animaciones no deseadas

    showNotification(message, type = 'info') {
        // Implementar sistema de notificaciones
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    initChatIA() {
        // Inicializar chat IA
        console.log('Chat IA initialized');
    }

    async sendIAMessage() {
        const input = document.getElementById('iaInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Agregar mensaje del usuario
        this.addIAMessage(message, 'user');
        input.value = '';
        
        try {
            // Simular respuesta de IA
            const response = await this.getIAResponse(message);
            this.addIAMessage(response, 'ai');
        } catch (error) {
            this.addIAMessage('Lo siento, no pude procesar tu mensaje.', 'ai');
        }
    }

    addIAMessage(message, sender) {
        const messagesContainer = document.getElementById('iaMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ia-message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async getIAResponse(message) {
        // Simular respuesta de IA
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('Gracias por tu mensaje. Te ayudo con la gestión de cursos.');
            }, 1000);
        });
    }
}
```

### 10. PERFORMANCE Y OPTIMIZACIÓN

```css
/* Optimizaciones de performance */
* {
    box-sizing: border-box;
}

/* Usar transform y opacity para animaciones */
.optimized-animation {
    will-change: transform, opacity;
}

/* Lazy loading para imágenes */
.lazy-image {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.lazy-image.loaded {
    opacity: 1;
}

/* Preload critical resources */
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="hero-image.jpg" as="image">
```

## 🎯 IMPLEMENTACIÓN COMPLETA

### Estructura de Archivos:
```
index.html          # Página principal
styles/
├── main.css        # Estilos principales
├── animations.css  # Animaciones y efectos
├── components.css  # Componentes específicos
└── responsive.css  # Media queries
scripts/
├── main.js         # JavaScript principal
├── particles.js    # Sistema de partículas
├── animations.js   # Animaciones de scroll
└── carousel.js     # Carrusel de testimonios
```

### Inicialización:
```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de partículas
    new ParticleSystem(document.querySelector('.particles-container'));
    
    // Inicializar animaciones de scroll
    new ScrollAnimations();
    
    // Inicializar contadores animados
    new AnimatedCounters();
    
    // Inicializar carrusel de testimonios
    new TestimonialsCarousel();
});
```

## 📋 CHECKLIST DE ENTREGA

### ✅ Estructura HTML:
- [ ] HTML semántico y accesible
- [ ] Meta tags optimizados
- [ ] Estructura de secciones completa
- [ ] Formularios funcionales

### ✅ Estilos CSS:
- [ ] Variables CSS organizadas
- [ ] Sistema de grid responsive
- [ ] Efectos glassmorphism
- [ ] Animaciones fluidas
- [ ] Gradientes animados

### ✅ JavaScript:
- [ ] Sistema de partículas
- [ ] Animaciones de scroll
- [ ] Contadores animados
- [ ] Carrusel de testimonios
- [ ] Efectos de interacción

### ✅ Performance:
- [ ] CSS optimizado
- [ ] JavaScript modular
- [ ] Lazy loading
- [ ] Core Web Vitals optimizados

### ✅ Accesibilidad:
- [ ] Navegación por teclado
- [ ] ARIA labels
- [ ] Contraste de colores
- [ ] Screen reader friendly

## 🎯 RESULTADO FINAL ESPERADO

Un panel de maestros completamente funcional que:

1. **Interfaz limpia y profesional** sin animaciones no deseadas
2. **Gestión completa de cursos** sin necesidad de programar
3. **Formularios intuitivos** para crear y editar contenido
4. **Mantiene coherencia total** con el sistema de diseño existente
5. **Es completamente responsive** y funciona en todos los dispositivos
6. **Tiene performance optimizada** y carga rápidamente
7. **Es accesible** para todos los usuarios
8. **SIN sección "Mis Cursos"** ni elementos que se deslicen hacia arriba

## 📝 NOTAS IMPORTANTES

- **OBLIGATORIO**: Usar exactamente los colores del sistema existente
- **OBLIGATORIO**: Mantener la identidad visual del proyecto
- **OBLIGATORIO**: Código limpio, comentado y bien estructurado
- **OBLIGATORIO**: Responsive design mobile-first
- **OBLIGATORIO**: Performance optimizada y accesibilidad completa
- **OBLIGATORIO**: NO incluir la sección "Mis Cursos" ni sus animaciones
- **OBLIGATORIO**: NO incluir elementos que se deslicen hacia arriba

## ⚠️ CARACTERÍSTICAS ESPECÍFICAS DEL PANEL

### Funcionalidades Clave:
1. **Gestión completa de cursos** sin necesidad de programar
2. **Chat IA integrado** para asistencia en la creación
3. **Layout de chat** solo para cursos síncronos/mixtos
4. **Sistema de módulos y actividades** completo
5. **Subida de archivos multimedia** con drag & drop
6. **SIN sección "Mis Cursos"** ni animaciones no deseadas
7. **Interfaz limpia** sin elementos que se deslicen hacia arriba

### Validaciones Importantes:
- **Modalidad del curso** determina si se muestra el chat
- **Campos obligatorios** en formularios
- **Confirmaciones** para acciones destructivas
- **Validación de archivos** antes de subir
- **NO incluir animaciones** que hagan que elementos se deslicen hacia arriba
- **Eliminar completamente** la sección "Mis Cursos" y sus elementos relacionados

### Integración con Base de Datos:
- **API REST** para todas las operaciones CRUD
- **Manejo de errores** robusto
- **Actualización en tiempo real** de la interfaz
- **Persistencia** de datos en PostgreSQL

**ENTREGA**: Proporcionar todos los archivos HTML, CSS y JavaScript necesarios para implementar completamente el panel de maestros/instructores con todas las funcionalidades de gestión de cursos especificadas.
