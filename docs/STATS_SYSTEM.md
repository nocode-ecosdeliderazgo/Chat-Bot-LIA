# Sistema de Estadísticas en Tiempo Real

## Descripción

Este sistema calcula automáticamente las estadísticas mostradas en la página principal (`index.html`) consultando datos reales de la base de datos Supabase.

## Contadores Implementados

### 1. Estudiantes Activos
**Estrategias de cálculo (en orden de prioridad):**
- Total de usuarios registrados (`users`) - **Datos reales: 13 usuarios**
- Usuarios con sesiones activas no revocadas (`user_session`)
- Usuarios con actividad reciente en cursos (`progress_tracking`)
- Usuarios con logins recientes (`users.last_login_at`)
- Usuarios con visitas recientes a cursos (`course_visit`)

### 2. Proyectos Completados
**Estrategias de cálculo (en orden de prioridad):**
- Cursos disponibles (`ai_courses`) - **Datos reales: 1 curso**
- Certificados emitidos (`certificate`)
- Módulos completados al 100% (`progress_tracking`)
- Sesiones de cuestionario completadas (`user_questionnaire_sessions`)
- Quiz con puntaje alto (≥80%) (`quiz_response`)

### 3. Horas de Contenido
**Estrategias de cálculo (en orden de prioridad):**
- Duración total de cursos AI (`ai_courses.total_duration`) - **Fuente principal**
- Duración de sesiones de estudio (`study_session.duration_minutes`) - **Fallback**
- Valor por defecto: 24 horas

### 4. Porcentaje de Satisfacción
**Estrategias de cálculo (en orden de prioridad):**
- Respuestas Likert ≥4 (`user_question_responses.answer_likert`)
- Quiz con puntaje ≥80% (`quiz_response.score`)
- Progreso de módulos ≥80% (`progress_tracking.progress_percent`)
- Valor por defecto: 95%

## Configuración

### 1. Configurar Supabase
Crear un archivo `.env` en la raíz del proyecto con:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

### 2. Ejecutar Script de Configuración
```bash
node scripts/extract-supabase-config.js
```

Este script actualizará automáticamente las meta tags en:
- `src/index.html`
- `src/login/new-auth.html`
- `src/q/form.html`
- `src/perfil-cuestionario.html`

## Archivos del Sistema

### Scripts Principales
- `src/scripts/supabase-client.js` - Cliente de Supabase
- `src/scripts/stats-calculator.js` - Calculadora de estadísticas
- `scripts/extract-supabase-config.js` - Configurador de Supabase

### HTML
- `src/index.html` - Página principal con contadores

## Funcionamiento

1. **Inicialización**: Al cargar la página, se inicializa el cliente de Supabase
2. **Cálculo**: Se ejecutan consultas paralelas a todas las tablas relevantes
3. **Fallback**: Si no hay datos o hay errores, se usan valores por defecto
4. **Animación**: Los contadores se animan desde 0 hasta el valor calculado

## Logs de Debug

El sistema incluye logs detallados en la consola del navegador:
- Estrategia utilizada para cada contador
- Valores calculados
- Errores de conexión o consulta

## Manejo de Errores

- **Sin conexión a Supabase**: Usa valores por defecto
- **Tablas vacías**: Usa valores por defecto
- **Errores de consulta**: Continúa con la siguiente estrategia
- **Todos los valores en 0**: Usa valores por defecto

## Valores por Defecto

```javascript
{
    activeStudents: 13, // Basado en los datos reales de la tabla users
    completedProjects: 1, // Basado en el curso disponible en ai_courses
    contentHours: 24,
    satisfactionPercentage: 95
}
```

## Personalización

### Modificar Estrategias
Editar `src/scripts/stats-calculator.js` y modificar los métodos:
- `calculateActiveStudents()`
- `calculateCompletedProjects()`
- `calculateContentHours()`
- `calculateSatisfactionPercentage()`

### Agregar Nuevas Fuentes de Datos
1. Agregar nueva consulta en el método correspondiente
2. Implementar lógica de cálculo
3. Agregar logs para debug

### Cambiar Valores por Defecto
Modificar el método `getDefaultStats()` en `StatsCalculator`.

## Troubleshooting

### Problemas Comunes

1. **Contadores no se actualizan**
   - Verificar configuración de Supabase en `.env`
   - Revisar consola del navegador para errores
   - Ejecutar `extract-supabase-config.js`

2. **Valores siempre en 0**
   - Verificar que las tablas tengan datos
   - Revisar permisos de Supabase
   - Verificar nombres de columnas

3. **Errores de conexión**
   - Verificar URL y clave de Supabase
   - Revisar configuración de CORS
   - Verificar conectividad de red

### Debug
Abrir la consola del navegador (F12) para ver logs detallados del proceso de cálculo.
