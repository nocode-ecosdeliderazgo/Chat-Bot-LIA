# PROMPT: ESTRUCTURA DE BASE DE DATOS PARA CURSOS WEB - Chat-Bot-LIA

## 🎯 OBJETIVO PRINCIPAL
Definir la estructura completa de base de datos para gestionar cursos web en la plataforma Chat-Bot-LIA, incluyendo todas las entidades, relaciones y campos necesarios para un sistema robusto de gestión de cursos online.

## 📋 INFORMACIÓN PROPORCIONADA

### Requisitos Identificados:
1. **Tabla principal de cursos** con nombre del curso
2. **Sistema de series** para cursos relacionados
3. **Sesiones** (máximo 75 por curso)
4. **Módulos** por sesión
5. **Actividades** (individuales/colaborativas) con diferentes tipos de contenido
6. **Temario** del curso
7. **Documentos informativos**
8. **Bonos** del curso
9. **Instructores** del curso
10. **Modalidad** (asíncrona/síncrona/mixta)
11. **Costo** del curso

## ❓ INFORMACIÓN FALTANTE (NECESITA DETALLARSE):

### 1. **GESTIÓN DE USUARIOS Y MATRÍCULAS:**
- ¿Se necesita una tabla para usuarios/estudiantes?
- ¿Cómo se manejan las matrículas a cursos?
- ¿Se necesita tracking de progreso del estudiante?
- ¿Se requieren certificados de finalización?

### 2. **SISTEMA DE PAGOS:**
- ¿Qué métodos de pago se van a implementar?
- ¿Se necesita historial de transacciones?
- ¿Se requieren descuentos o cupones?
- ¿Se manejan suscripciones o pagos únicos?

### 3. **CONTENIDO MULTIMEDIA:**
- ¿Dónde se almacenarán los videos/documentos?
- ¿Se necesita integración con servicios externos (YouTube, Vimeo, etc.)?
- ¿Qué formatos de archivo se soportarán?
- ¿Se necesita compresión automática de videos?

### 4. **SISTEMA DE EVALUACIÓN:**
- ¿Cómo se calificarán los cuestionarios?
- ¿Se necesita sistema de calificaciones?
- ¿Se requieren encuestas de satisfacción?
- ¿Se necesita feedback de instructores?

### 5. **COMUNICACIÓN Y SOPORTE:**
- ¿Se necesita sistema de mensajería entre estudiantes e instructores?
- ¿Se requieren foros de discusión por curso?
- ¿Se necesita sistema de tickets de soporte?

### 6. **CONFIGURACIÓN TÉCNICA:**
- ¿Qué tipo de base de datos prefieres (MySQL, PostgreSQL, MongoDB)?
- ¿Se necesita sistema de caché?
- ¿Se requieren backups automáticos?
- ¿Se necesita versionado de contenido?

## 🗄️ ESTRUCTURA PROPUESTA DE BASE DE DATOS

### 1. **TABLA PRINCIPAL: COURSES**
```sql
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    series_id INT NULL, -- FK a course_series
    total_sessions INT NOT NULL CHECK (total_sessions <= 75),
    modality ENUM('async', 'sync', 'mixed') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES course_series(id)
);
```

### 2. **TABLA: COURSE_SERIES**
```sql
CREATE TABLE course_series (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. **TABLA: SESSIONS**
```sql
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### 4. **TABLA: MODULES**
```sql
CREATE TABLE modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
```

### 5. **TABLA: ACTIVITIES**
```sql
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('individual', 'collaborative') NOT NULL,
    content_type ENUM('text', 'document', 'video', 'quiz') NOT NULL,
    content_url VARCHAR(500),
    content_text LONGTEXT,
    duration_minutes INT,
    order_index INT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);
```

### 6. **TABLA: INSTRUCTORS**
```sql
CREATE TABLE instructors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    expertise TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. **TABLA: COURSE_INSTRUCTORS**
```sql
CREATE TABLE course_instructors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    instructor_id INT NOT NULL,
    role ENUM('main', 'assistant', 'guest') DEFAULT 'main',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_instructor (course_id, instructor_id)
);
```

### 8. **TABLA: COURSE_MATERIALS**
```sql
CREATE TABLE course_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    type ENUM('syllabus', 'document', 'bonus', 'resource') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500),
    file_size INT,
    file_type VARCHAR(50),
    order_index INT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### 9. **TABLA: COURSE_TOPICS**
```sql
CREATE TABLE course_topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

## 🔄 RELACIONES Y CONSTRAINTS

### Índices Recomendados:
```sql
-- Índices para optimizar consultas
CREATE INDEX idx_courses_series ON courses(series_id);
CREATE INDEX idx_sessions_course ON sessions(course_id, order_index);
CREATE INDEX idx_modules_session ON modules(session_id, order_index);
CREATE INDEX idx_activities_module ON activities(module_id, order_index);
CREATE INDEX idx_course_instructors_course ON course_instructors(course_id);
CREATE INDEX idx_course_materials_course ON course_materials(course_id, type);
```

### Constraints Adicionales:
```sql
-- Asegurar que no haya más de 75 sesiones por curso
ALTER TABLE sessions ADD CONSTRAINT check_session_limit 
CHECK ((SELECT COUNT(*) FROM sessions s2 WHERE s2.course_id = sessions.course_id) <= 75);

-- Asegurar que el precio sea positivo
ALTER TABLE courses ADD CONSTRAINT check_positive_price CHECK (price >= 0);
```

## 📊 CONSULTAS ÚTILES

### Obtener curso completo con toda su estructura:
```sql
SELECT 
    c.*,
    s.title as session_title,
    m.title as module_title,
    a.title as activity_title,
    a.type as activity_type,
    a.content_type
FROM courses c
LEFT JOIN sessions s ON c.id = s.course_id
LEFT JOIN modules m ON s.id = m.session_id
LEFT JOIN activities a ON m.id = a.module_id
WHERE c.id = ?
ORDER BY s.order_index, m.order_index, a.order_index;
```

### Obtener instructores de un curso:
```sql
SELECT i.*, ci.role
FROM instructors i
JOIN course_instructors ci ON i.id = ci.instructor_id
WHERE ci.course_id = ?
ORDER BY ci.role;
```

## 🚀 FUNCIONALIDADES ADICIONALES SUGERIDAS

### 1. **Sistema de Progreso del Estudiante:**
```sql
CREATE TABLE student_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    session_id INT NOT NULL,
    module_id INT NOT NULL,
    activity_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    completed_at TIMESTAMP NULL,
    score DECIMAL(5,2) NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (module_id) REFERENCES modules(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id)
);
```

### 2. **Sistema de Matrículas:**
```sql
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    completion_date TIMESTAMP NULL,
    certificate_url VARCHAR(500) NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

## 📝 NOTAS IMPORTANTES

### Consideraciones de Escalabilidad:
- **Particionamiento**: Para cursos con muchos estudiantes, considerar particionar tablas de progreso
- **Caché**: Implementar Redis para datos frecuentemente consultados
- **CDN**: Para almacenamiento de archivos multimedia
- **Backup**: Backup automático diario de la base de datos

### Seguridad:
- **Encriptación**: Encriptar datos sensibles de estudiantes
- **Auditoría**: Log de cambios en contenido de cursos
- **Permisos**: Sistema de roles para instructores y administradores

### Performance:
- **Índices**: Mantener índices optimizados para consultas frecuentes
- **Paginación**: Implementar paginación para listas largas
- **Lazy Loading**: Cargar contenido multimedia bajo demanda

## 🎯 PRÓXIMOS PASOS

1. **Confirmar información faltante** marcada arriba
2. **Definir tipos de datos específicos** para cada campo
3. **Crear diagrama ER** de la base de datos
4. **Implementar migraciones** para crear las tablas
5. **Crear API endpoints** para cada entidad
6. **Implementar validaciones** a nivel de aplicación
7. **Crear documentación** de la API

**¿Necesitas que detalle algún aspecto específico o que agregue alguna funcionalidad adicional?**
