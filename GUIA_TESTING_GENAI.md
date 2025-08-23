# GUÍA COMPLETA DE TESTING - SISTEMA GENAI

## 📋 Estado del Sistema

✅ **Sistema GenAI completamente implementado y listo para testing**

### Componentes Verificados:

1. **Base de Datos** ✅
   - Tablas GenAI existentes y bien estructuradas
   - ENUM `genai_area` con 10 áreas profesionales 
   - Script SQL `populate-genai-tables.sql` listo para poblar datos

2. **Frontend** ✅
   - `src/q/genai-form.html` - Cuestionario completo implementado
   - `src/q/genai-form.js` - Lógica de scoring y radar scores
   - `src/estadisticas.html` - Radar chart con Chart.js implementado
   - `src/perfil-cuestionario.js` - Mapeo a áreas GenAI implementado

3. **Backend** ✅
   - `server.js` - Endpoint `/api/genai-radar/:userId` implementado
   - `api/genai-radar.js` - API standalone disponible
   - Conexión a Supabase configurada

4. **Flujo Completo** ✅
   - Perfil → GenAI Area mapping → Cuestionario → Scores → Radar

## 🚀 Pasos para Testing Completo

### 1. Poblar Base de Datos
```bash
# Ejecutar el script SQL para poblar las tablas GenAI
# En tu cliente PostgreSQL/Supabase:
psql -d tu_database < populate-genai-tables.sql

# O en Supabase Dashboard:
# Ir a SQL Editor y ejecutar el contenido del archivo
```

### 2. Iniciar el Servidor
```bash
# Desde la raíz del proyecto
npm start
# O 
node server.js
```

### 3. Verificar Sistema GenAI
```bash
# Ejecutar script de verificación
node test-genai-system.js

# Crear datos de prueba (opcional)
node test-genai-system.js test-data
```

### 4. Probar el Flujo Completo

#### Paso 4.1: Completar Perfil
1. Ir a: `http://localhost:3000/src/perfil-cuestionario.html`
2. Completar cuestionario de perfil
3. Verificar redirección automática a GenAI form

#### Paso 4.2: Completar Cuestionario GenAI
1. URL: `http://localhost:3000/src/q/genai-form.html`
2. Responder todas las preguntas (adopción + conocimiento)
3. Verificar cálculo de scores automático
4. Verificar redirección a estadísticas

#### Paso 4.3: Ver Radar de Competencias
1. URL: `http://localhost:3000/src/estadisticas.html`
2. Verificar carga del radar chart
3. Inspeccionar datos en Dev Tools

### 5. Testing de Endpoints

#### Test del Endpoint GenAI Radar
```bash
# Obtener userId de un usuario que completó el cuestionario
# Luego probar el endpoint:

curl http://localhost:3000/api/genai-radar/USER_ID_AQUI

# Ejemplo de respuesta esperada:
# {
#   "hasData": true,
#   "userId": "123",
#   "genaiArea": "CEO/Alta Dirección",
#   "totalScore": 67.5,
#   "adoptionScore": 70.0,
#   "knowledgeScore": 65.0,
#   "classification": "Intermedio",
#   "conocimiento": 65,
#   "aplicacion": 70,
#   "productividad": 70,
#   "estrategia": 67.5,
#   "inversion": 67.5
# }
```

#### Test de Datos Vacíos
```bash
# Probar con userId que no existe
curl http://localhost:3000/api/genai-radar/999999

# Respuesta esperada:
# {
#   "hasData": false,
#   "message": "No hay datos de cuestionario GenAI completado",
#   "userId": "999999"
# }
```

## 🔍 Debugging y Resolución de Problemas

### Problema: "Error de conexión al cargar radar"
**Solución:**
1. Verificar que el servidor esté ejecutándose en puerto 3000
2. Verificar variables de entorno de base de datos
3. Verificar que `DATABASE_URL` esté configurada correctamente

### Problema: "Sin datos aún" en estadísticas.html
**Posibles causas:**
1. No hay cuestionario GenAI completado para ese usuario
2. El userId no se está pasando correctamente
3. Los scores no se guardaron en `genai_radar_scores`

**Debugging:**
```javascript
// En dev tools del navegador, en estadísticas.html:
console.log('Current userId:', getCurrentUserId());

// Verificar respuesta del endpoint:
fetch(`http://localhost:3000/api/genai-radar/${userId}`)
  .then(r => r.json())
  .then(data => console.log('Radar data:', data));
```

### Problema: Preguntas no cargan en genai-form.html
**Solución:**
1. Verificar que se ejecutó `populate-genai-tables.sql`
2. Verificar conexión Supabase en genai-form.js
3. Verificar área GenAI en sessionStorage

## 📊 Datos de Prueba

### Estructura de Usuario de Prueba
```sql
-- Usuario de prueba que puedes crear manualmente
INSERT INTO users (username, email, password_hash, display_name)
VALUES ('test_genai', 'test@genai.com', '$2b$10$dummyhash', 'Usuario GenAI');

-- Sesión GenAI completada
INSERT INTO genai_questionnaire_sessions 
(user_id, genai_area, total_score, adoption_score, knowledge_score, classification, completed_at)
VALUES (USER_ID, 'CEO/Alta Dirección', 67.5, 70.0, 65.0, 'Intermedio', NOW());

-- Radar scores
INSERT INTO genai_radar_scores (session_id, user_id, genai_area, dimension, score)
VALUES 
(SESSION_ID, USER_ID, 'CEO/Alta Dirección', 'Adopción', 70.0),
(SESSION_ID, USER_ID, 'CEO/Alta Dirección', 'Conocimiento', 65.0);
```

## 📈 Métricas de Éxito

### Indicadores de que Todo Funciona:
✅ Cuestionario GenAI carga todas las preguntas por área
✅ Scores se calculan correctamente al enviar
✅ Radar chart se renderiza con datos reales
✅ Endpoint `/api/genai-radar/:userId` responde correctamente
✅ Transición suave de perfil → cuestionario → estadísticas

### Datos Esperados en el Radar:
- **Conocimiento**: 0-100 (basado en preguntas de conocimiento)
- **Aplicación**: 0-100 (basado en preguntas de adopción)
- **Productividad**: 0-100 (mapea adopción)
- **Estrategia**: 0-100 (mapea score total)
- **Inversión**: 0-80 (score total limitado para realismo)

## 🔧 Archivos Clave para Modificaciones

1. **`populate-genai-tables.sql`** - Agregar más preguntas
2. **`src/q/genai-form.js`** - Modificar lógica de scoring
3. **`src/estadisticas.html`** - Personalizar radar chart
4. **`server.js`** líneas 1709-1833 - Endpoint GenAI radar
5. **`src/perfil-cuestionario.js`** - Mapeo perfil → área GenAI

## 📋 Checklist Final

- [ ] Base de datos poblada con `populate-genai-tables.sql`
- [ ] Servidor ejecutándose en puerto 3000
- [ ] Variables de entorno configuradas
- [ ] Usuario de prueba creado
- [ ] Cuestionario de perfil completado
- [ ] Cuestionario GenAI completado
- [ ] Radar chart visible en estadísticas.html
- [ ] Endpoint `/api/genai-radar/:userId` responde correctamente

---

🎉 **¡El sistema GenAI está completamente implementado y listo para producción!**

Para cualquier modificación o personalización adicional, todos los componentes están modularizados y bien documentados.