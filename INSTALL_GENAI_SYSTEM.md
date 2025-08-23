# INSTALACIÓN DEL SISTEMA GENAI CUESTIONARIOS

Esta guía te ayudará a migrar del sistema de cuestionarios actual al nuevo sistema GenAI basado en el CSV profesional.

## 📋 Resumen de Cambios

**Sistema Actual → Sistema GenAI**
- ✅ 17 perfiles básicos → 10 áreas profesionales especializadas
- ✅ Preguntas genéricas → Preguntas específicas por área (Adopción + Conocimiento)
- ✅ Scoring manual → Scoring automático sofisticado
- ✅ Una dimensión → Radar de 2 dimensiones principales
- ✅ Base LATAM/México con mejores prácticas

## 🚀 Pasos de Instalación

### Paso 1: Ejecutar Migración SQL

```bash
# Conectar a tu base de datos Supabase y ejecutar:
psql "postgresql://[usuario]:[password]@[host]:5432/[database]" -f migration_genai_questionnaire.sql
```

O desde el SQL Editor de Supabase, pegar el contenido de `migration_genai_questionnaire.sql`

### Paso 2: Instalar Dependencias del Importador

```bash
npm install @supabase/supabase-js
# O si no tienes el paquete:
npm install csv-parser
```

### Paso 3: Importar Preguntas desde CSV

```bash
# Primero hacer un dry run para verificar
node scripts/import-genai-questions.js --dry-run --verbose

# Si todo se ve bien, ejecutar la importación real
SUPABASE_URL=https://tu-proyecto.supabase.co \
SUPABASE_SERVICE_KEY=tu-service-key \
node scripts/import-genai-questions.js --clear --verbose
```

### Paso 4: Actualizar Enlaces de Cuestionario

```javascript
// En perfil-cuestionario.js, cambiar la URL de redirección:
// DE:
return 'q/form.html';

// A:
return 'q/genai-form.html?area=' + encodeURIComponent(this.genaiArea);
```

### Paso 5: Verificar Endpoints en Server.js

El nuevo endpoint `/api/genai-radar/:userId` ya está incluido. Verificar que funcione:

```bash
# Probar el endpoint
curl http://localhost:3000/api/genai-radar/test-user
```

### Paso 6: Pruebas del Sistema

1. **Probar Detección de Área:**
   - Ir a `perfil-cuestionario.html`
   - Completar formulario con diferentes perfiles
   - Verificar que se asigne el área GenAI correcta

2. **Probar Cuestionario:**
   - Acceder a `q/genai-form.html?area=CEO/Alta%20Dirección`
   - Completar todas las preguntas
   - Verificar que se calcule el score correctamente

3. **Probar Radar Chart:**
   - Ir a `estadisticas.html`
   - Verificar que aparezca el radar con los datos del cuestionario

## 📊 Estructura de Datos

### Nuevas Tablas Creadas

- `genai_questions` - Preguntas del CSV importadas
- `genai_questionnaire_sessions` - Sesiones de cuestionario
- `genai_user_responses` - Respuestas individuales
- `genai_radar_scores` - Scores para radar chart
- `area_mapping` - Mapeo entre áreas antiguas y nuevas

### Mapeo de Áreas

| Área Actual | Nueva Área GenAI |
|-------------|------------------|
| CEO | CEO/Alta Dirección |
| CTO/CIO | Tecnología/Desarrollo de Software |
| Marketing/Ventas | Marketing y Comunicación |
| Finanzas/Contabilidad | Finanzas/Contabilidad |
| Freelancer | Diseño/Industrias Creativas |
| Consultor | Administración Pública/Gobierno |

## 🎯 Sistema de Scoring

### Preguntas de Adopción (Escala Likert)
- A = 0 puntos (Nunca)
- B = 25 puntos (Rara vez)
- C = 50 puntos (Ocasional)
- D = 75 puntos (Frecuente)
- E = 100 puntos (Muy frecuente)

### Preguntas de Conocimiento
- Respuesta correcta = 100 puntos
- Respuesta incorrecta = 0 puntos

### Clasificación Final
- **0-39**: Básico
- **40-69**: Intermedio
- **70-100**: Avanzado

## 📈 Radar Chart

El radar muestra 5 dimensiones basadas en los 2 scores principales:

1. **Conocimiento** - Score de preguntas de conocimiento
2. **Aplicación** - Score de preguntas de adopción
3. **Productividad** - Proxy basado en adopción
4. **Estrategia** - Score total
5. **Inversión** - Score total limitado a 80%

## 🔍 Testing y Debugging

### URLs de Prueba

```bash
# Cuestionario directo por área
http://localhost:3000/src/q/genai-form.html?area=CEO/Alta%20Dirección

# Estadísticas con datos de prueba
http://localhost:3000/src/estadisticas.html

# Endpoint de prueba
http://localhost:3000/api/genai-radar/dev-user-123
```

### Datos de Desarrollo

El sistema incluye datos de prueba para userIds que contengan `dev-` o sean `test-user`.

### Logs a Monitorear

```bash
# En el navegador (DevTools Console)
🎯 Inicializando cuestionario GenAI...
✅ Cliente Supabase inicializado
👤 Usuario cargado: {userId, originalArea, genaiArea}
🔍 Cargando preguntas para área: CEO/Alta Dirección
✅ 12 preguntas cargadas: {adopcion: 6, conocimiento: 6}

# En el servidor
🎯 Obteniendo datos GenAI radar para userId: dev-user-123
📊 Datos GenAI radar obtenidos: {userId, genaiArea, totalScore, classification}
```

## ⚠️ Problemas Comunes

### 1. Error "tabla genai_questions no existe"
**Solución:** Ejecutar la migración SQL completa

### 2. No se cargan preguntas
**Solución:** Verificar que el importador CSV se ejecutó correctamente

### 3. Radar chart no aparece
**Solución:** 
- Verificar que hay datos de cuestionario completado
- Revisar el endpoint `/api/genai-radar/:userId`
- Verificar la conexión del frontend al puerto 3000

### 4. Área incorrecta detectada
**Solución:** Actualizar el mapeo en `mapToGenAIArea()` en `genai-form.js`

## 🔄 Rollback (Si es necesario)

Para volver al sistema anterior:

```sql
-- Eliminar tablas GenAI
DROP VIEW IF EXISTS public.genai_user_latest_results;
DROP VIEW IF EXISTS public.genai_stats_by_area;
DROP TABLE IF EXISTS public.genai_radar_scores;
DROP TABLE IF EXISTS public.genai_user_responses;
DROP TABLE IF EXISTS public.genai_questionnaire_sessions;
DROP TABLE IF EXISTS public.area_mapping;
DROP TABLE IF EXISTS public.genai_questions;
DROP TYPE IF EXISTS genai_area_enum;
DROP TYPE IF EXISTS question_type_enum;
DROP TYPE IF EXISTS section_enum;
DROP TYPE IF EXISTS block_enum;

-- Restaurar enlaces originales en el frontend
```

## 📚 Documentación Adicional

- `migration_genai_questionnaire.sql` - Script de migración completo
- `scripts/import-genai-questions.js` - Importador de preguntas
- `src/q/genai-form.html` - Nueva interfaz de cuestionario
- `src/q/genai-form.js` - Lógica del cuestionario
- `api/genai-radar.js` - Endpoint independiente (opcional)

## ✅ Verificación Final

Lista de verificación post-instalación:

- [ ] Base de datos migrada correctamente
- [ ] Preguntas importadas (verificar con `SELECT COUNT(*) FROM genai_questions`)
- [ ] Endpoint `/api/genai-radar/:userId` funcionando
- [ ] Formulario de perfil redirige a cuestionario GenAI
- [ ] Cuestionario completa y guarda datos correctamente  
- [ ] Estadísticas muestra radar chart con datos reales
- [ ] Todos los logs son positivos sin errores

## 🎉 ¡Listo!

Una vez completados todos los pasos, tendrás un sistema de cuestionarios profesional nivel empresarial con:

- ✅ 10 áreas profesionales especializadas
- ✅ 12 preguntas por área (6 Adopción + 6 Conocimiento)
- ✅ Scoring automático sofisticado
- ✅ Radar chart interactivo
- ✅ Clasificación inteligente (Básico/Intermedio/Avanzado)
- ✅ Enfoque LATAM/México con mejores prácticas de IA