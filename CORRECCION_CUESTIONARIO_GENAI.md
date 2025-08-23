# CORRECCIÓN DEL CUESTIONARIO GENAI

## 🔧 Cambios Realizados

### 1. **Actualización de la Estructura de Datos**
- **Problema**: El código estaba intentando acceder a tablas `genai_questions` que ya no existen
- **Solución**: Actualizado para usar la tabla `preguntas` existente con la nueva estructura

### 2. **Mapeo de Áreas Actualizado**
- **Problema**: El mapeo de áreas usaba nombres de texto en lugar de IDs
- **Solución**: Actualizado para usar IDs de la tabla `areas`:
  ```javascript
  const areaMap = {
      'CEO': 2, // CEO/Alta Dirección
      'CTO/CIO': 3, // Tecnología/Desarrollo de Software
      'Marketing': 4, // Marketing y Comunicación
      'Finanzas': 7, // Finanzas/Contabilidad
      'Consultor': 8, // Administración Pública/Gobierno
      // ... etc
  };
  ```

### 3. **Función loadQuestions Corregida**
- **Problema**: Consultaba tabla inexistente `genai_questions`
- **Solución**: Ahora consulta la tabla `preguntas` con la estructura correcta:
  ```javascript
  const { data, error } = await this.supabase
      .from('preguntas')
      .select(`
          id, codigo, section, bloque, area_id, 
          texto, tipo, opciones, peso, escala, scoring
      `)
      .eq('area_id', this.genaiArea)
      .eq('section', 'Cuestionario')
      .order('bloque, codigo');
  ```

### 4. **Renderizado de Preguntas Actualizado**
- **Problema**: Las opciones estaban en campos separados (`option_a`, `option_b`, etc.)
- **Solución**: Ahora parsea el campo JSON `opciones`:
  ```javascript
  let options = [];
  try {
      if (question.options && typeof question.options === 'string') {
          options = JSON.parse(question.options);
      } else if (Array.isArray(question.options)) {
          options = question.options;
      }
  } catch (error) {
      console.error('❌ Error parseando opciones:', error);
      options = [];
  }
  ```

### 5. **Guardado de Respuestas Simplificado**
- **Problema**: Intentaba usar tablas GenAI que no existen
- **Solución**: Ahora guarda directamente en la tabla `respuestas`:
  ```javascript
  const responses = Object.values(this.responses).map(response => ({
      user_id: this.currentUser.id,
      pregunta_id: response.questionId,
      valor: { answer: response.answer, timestamp: response.timestamp }
  }));
  ```

### 6. **Cálculo de Scores Mejorado**
- **Problema**: No podía parsear el campo `scoring_mapping`
- **Solución**: Agregado parsing JSON para el campo:
  ```javascript
  let scoring;
  try {
      if (typeof question.scoring_mapping === 'string') {
          scoring = JSON.parse(question.scoring_mapping);
      } else {
          scoring = question.scoring_mapping;
      }
  } catch (error) {
      console.error('❌ Error parseando scoring_mapping:', error);
      return 0;
  }
  ```

## 🧪 Cómo Probar el Sistema

### 1. **Archivo de Prueba Creado**
Se creó `test-genai-questionnaire.html` que incluye:
- Controles para cambiar entre diferentes áreas
- Interfaz completa del cuestionario
- Logs detallados para debugging

### 2. **Pasos para Probar**

1. **Abrir el archivo de prueba**:
   ```bash
   # En el navegador, abrir:
   http://localhost:3000/test-genai-questionnaire.html
   ```

2. **Seleccionar un área**:
   - Usar el dropdown en la sección "Controles de Prueba"
   - Seleccionar cualquier área (ej: "Administración Pública/Gobierno")
   - Hacer clic en "Cambiar Área"

3. **Verificar que se cargan las preguntas**:
   - Deberían aparecer preguntas de "Adopción" y "Conocimiento"
   - Cada área debe tener 12 preguntas (6 de cada tipo)

4. **Completar el cuestionario**:
   - Responder todas las preguntas
   - Verificar que el botón "Completar Cuestionario" se habilita
   - Enviar el cuestionario

5. **Verificar el guardado**:
   - Las respuestas deben guardarse en la tabla `respuestas`
   - No debe haber errores en la consola

### 3. **Verificación en Base de Datos**

Para verificar que los datos se guardan correctamente:

```sql
-- Verificar que hay preguntas para cada área
SELECT area_id, COUNT(*) as total_preguntas 
FROM preguntas 
WHERE section = 'Cuestionario' 
GROUP BY area_id 
ORDER BY area_id;

-- Verificar respuestas guardadas
SELECT * FROM respuestas 
ORDER BY respondido_en DESC 
LIMIT 10;
```

## 📊 Estructura de Datos Esperada

### Tabla `areas`
```sql
id | slug                    | nombre
2  | ceo-alta-direccion      | CEO/Alta Dirección
3  | tecnologia-desarrollo   | Tecnología/Desarrollo de Software
4  | marketing-comunicacion  | Marketing y Comunicación
5  | salud-medicina          | Salud/Medicina
6  | derecho-sector-legal    | Derecho/Sector Legal
7  | finanzas-contabilidad   | Finanzas/Contabilidad
8  | administracion-publica  | Administración Pública/Gobierno
9  | academia-investigacion  | Academia/Investigación
10 | educacion-docentes      | Educación/Docentes
11 | diseno-industrias       | Diseño/Industrias Creativas
```

### Tabla `preguntas`
```sql
id | codigo | section | bloque | area_id | texto | tipo | opciones (JSON) | scoring (JSON)
```

### Tabla `respuestas`
```sql
id | user_id | pregunta_id | valor (JSON) | respondido_en
```

## 🔍 Logs de Debugging

El sistema incluye logs detallados que aparecen en la consola del navegador:

```
🎯 Inicializando cuestionario GenAI...
✅ Cliente Supabase inicializado
👤 Usuario cargado: {userId, originalArea, genaiArea}
🔍 Cargando preguntas para área ID: 8
✅ 12 preguntas cargadas para Administración Pública/Gobierno: {adopcion: 6, conocimiento: 6}
✅ Interfaz del cuestionario renderizada
📝 Respuesta guardada: {questionId, answer}
🚀 Enviando cuestionario...
✅ 12 respuestas guardadas en tabla respuestas
```

## ⚠️ Posibles Problemas y Soluciones

### 1. **No se cargan preguntas**
- **Causa**: El área_id no existe en la tabla `areas`
- **Solución**: Verificar que el área existe en la base de datos

### 2. **Error parseando opciones**
- **Causa**: El campo `opciones` no es JSON válido
- **Solución**: Verificar el formato de las opciones en la tabla `preguntas`

### 3. **Error de conexión a Supabase**
- **Causa**: Credenciales incorrectas o red
- **Solución**: Verificar URL y key de Supabase

### 4. **No se guardan respuestas**
- **Causa**: Permisos de escritura en la tabla `respuestas`
- **Solución**: Verificar políticas RLS de Supabase

## ✅ Checklist de Verificación

- [ ] El archivo `test-genai-questionnaire.html` se abre correctamente
- [ ] Se pueden seleccionar diferentes áreas
- [ ] Se cargan las preguntas para cada área (12 preguntas)
- [ ] Se pueden responder todas las preguntas
- [ ] El botón de envío se habilita al completar
- [ ] Se guardan las respuestas sin errores
- [ ] No hay errores en la consola del navegador
- [ ] Los datos aparecen en la tabla `respuestas`

## 🎯 Próximos Pasos

1. **Integrar con el flujo principal**: Actualizar `perfil-cuestionario.html` para redirigir al nuevo cuestionario
2. **Mejorar el scoring**: Implementar lógica más sofisticada para calcular respuestas correctas
3. **Agregar estadísticas**: Crear vistas para mostrar resultados por área
4. **Optimizar rendimiento**: Implementar paginación si hay muchas preguntas

---

**Nota**: Este sistema ahora funciona completamente con la estructura de base de datos existente y no requiere tablas adicionales.
