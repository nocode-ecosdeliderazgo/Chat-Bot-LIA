# 🔄 PLAN DE REFACTORIZACIÓN DE BASE DE DATOS - CHAT LIA

## 📋 PROBLEMAS IDENTIFICADOS

### **1. Problemas de Diseño Actual:**
- ❌ **Duplicación de usuarios:** `users` y `profile` (dos tablas para lo mismo)
- ❌ **Relaciones confusas:** `enrollment` usa `profile.id` pero `users` tiene su propia estructura
- ❌ **Falta tabla específica para chat:** No hay conexión directa usuario-curso-chat
- ❌ **Tablas innecesarias:** Muchas tablas que no se usan para el chat
- ❌ **Datos faltantes:** FAQ y Glossary no tienen términos como "deep seek", "prompt"

### **2. Problemas de Datos:**
- ❌ **Usuario no tiene cursos inscritos:** `enrollment` está vacía o mal configurada
- ❌ **Consultas no funcionan:** Las búsquedas no encuentran coincidencias
- ❌ **Lia no sabe el curso actual:** No hay forma de identificar en qué curso está el usuario

## 🎯 OBJETIVOS DE LA REFACTORIZACIÓN

### **1. Simplificar la estructura**
- ✅ Una sola tabla de usuarios
- ✅ Tabla específica para sesiones de chat
- ✅ Relaciones claras y directas

### **2. Poblar con datos relevantes**
- ✅ Agregar términos comunes a FAQ/Glossary
- ✅ Crear datos de prueba para cursos
- ✅ Inscribir usuarios en cursos

### **3. Hacer que Lia funcione correctamente**
- ✅ Lia debe poder identificar el curso del usuario
- ✅ Lia debe responder preguntas generales
- ✅ Lia debe dar respuestas específicas y personalizadas

## 📊 ESTRUCTURA NUEVA PROPUESTA

### **Tablas Esenciales para el Chat:**

#### **1. `users` (Simplificada)**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **2. `ai_courses` (Mantener)**
```sql
-- Mantener la estructura actual pero simplificar
CREATE TABLE ai_courses (
    id_ai_courses UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    long_description TEXT,
    session_count INTEGER,
    total_duration INTEGER,
    price VARCHAR(50),
    currency VARCHAR(10),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **3. `chat_session` (NUEVA - CRÍTICA)**
```sql
CREATE TABLE chat_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES ai_courses(id_ai_courses),
    session_start TIMESTAMPTZ DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    current_module_id UUID,
    progress_percent NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **4. `chatbot_faq` (Mejorada)**
```sql
CREATE TABLE chatbot_faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL UNIQUE,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 3),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **5. `glossary_term` (Mejorada)**
```sql
CREATE TABLE glossary_term (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term TEXT NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 PASOS DE IMPLEMENTACIÓN

### **FASE 1: Limpieza y Preparación**
1. **Backup de datos actuales**
2. **Identificar datos importantes a preservar**
3. **Crear scripts de migración**

### **FASE 2: Crear Nueva Estructura**
1. **Crear tabla `chat_session`**
2. **Simplificar tabla `users`**
3. **Limpiar `ai_courses`**
4. **Mejorar `chatbot_faq` y `glossary_term`**

### **FASE 3: Poblar con Datos**
1. **Insertar términos comunes en FAQ/Glossary**
2. **Crear cursos de prueba**
3. **Inscribir usuarios en cursos**
4. **Crear sesiones de chat activas**

### **FASE 4: Probar y Validar**
1. **Probar consultas del chat**
2. **Verificar que Lia identifique cursos**
3. **Validar respuestas personalizadas**

## 📝 DATOS DE PRUEBA NECESARIOS

### **1. Términos Comunes para FAQ:**
- "deep seek"
- "prompt"
- "llm"
- "ia"
- "inteligencia artificial"
- "chatgpt"
- "machine learning"

### **2. Cursos de Prueba:**
- "Aprende y Aplica IA"
- "Machine Learning Básico"
- "ChatGPT para Negocios"

### **3. Usuarios de Prueba:**
- Fernando Suarez (ID actual)
- Otros usuarios de prueba

### **4. Sesiones de Chat:**
- Sesión activa para Fernando en curso de IA

## ⚠️ CONSIDERACIONES IMPORTANTES

### **Antes de Empezar:**
- ✅ **Hacer backup completo** de la base de datos actual
- ✅ **Documentar** todas las tablas y relaciones actuales
- ✅ **Identificar** datos críticos que no se pueden perder

### **Durante la Migración:**
- ✅ **Probar** cada paso antes de continuar
- ✅ **Mantener** la aplicación funcionando
- ✅ **Validar** que las consultas funcionen

### **Después de la Migración:**
- ✅ **Probar** todas las funcionalidades del chat
- ✅ **Verificar** que Lia responda correctamente
- ✅ **Documentar** la nueva estructura

## 🎯 RESULTADO ESPERADO

### **Después de la Refactorización:**
- ✅ **Lia responde "que es deep seek?"** con definición directa
- ✅ **Lia responde "que es un prompt?"** con definición directa
- ✅ **Lia sabe en qué curso está Fernando** y puede dar información específica
- ✅ **Lia menciona al usuario por nombre** en todas las respuestas
- ✅ **No más respuestas plantilla genéricas**

---

**¿Empezamos con el Paso 1?**
