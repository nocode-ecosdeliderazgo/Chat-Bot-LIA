# Sistema de Mensajes Explicativos Personalizados

## 📋 Descripción General

Este sistema permite almacenar y gestionar mensajes explicativos personalizados para las estadísticas de IA desde la base de datos, reemplazando los mensajes hardcodeados en el código JavaScript.

## 🚀 Implementación Completada

### ✅ Componentes Implementados

1. **Tabla de Base de Datos** (`create_analysis_messages.sql`)
2. **Endpoint de API** (`server.js` - `/api/analysis-messages`)
3. **Frontend Integrado** (`estadisticas.js`)
4. **Sistema de Templates** con variables dinámicas
5. **Sistema de Fallback** para compatibilidad

## 📊 Estructura de la Tabla

```sql
CREATE TABLE analysis_messages (
    id uuid PRIMARY KEY,
    message_type text, -- 'adoption_explanation', 'knowledge_explanation', 'recommendation'
    score_range_min integer, -- Score mínimo (0-100)
    score_range_max integer, -- Score máximo (0-100)
    target_area text, -- Área profesional o 'general'
    priority_level text, -- 'high', 'medium', 'low' (para recomendaciones)
    title text, -- Título del mensaje
    message_template text, -- Template con variables {variable_name}
    variables jsonb, -- Metadatos adicionales
    is_active boolean -- Activo/inactivo
);
```

## 🎯 Tipos de Mensajes

### 1. **Adopción de IA** (`adoption_explanation`)
- **Score Range**: 0-100 puntos de adopción
- **Variables Soportadas**:
  - `{score}` - Score numérico
  - `{tools_used}` - Lista de herramientas detectadas
  - `{tools_context}` - Contexto específico de herramientas
  - `{level}` - Nivel calculado (Bajo/Medio/Alto)
  - `{user_area}` - Área profesional

### 2. **Conocimiento de IA** (`knowledge_explanation`)
- **Score Range**: 0-100 porcentaje de respuestas correctas
- **Variables Soportadas**:
  - `{correct_answers}` - Respuestas correctas
  - `{total_questions}` - Total de preguntas
  - `{percentage}` - Porcentaje de aciertos
  - `{topic_details}` - Desglose por temas
  - `{level}` - Nivel de conocimiento

### 3. **Recomendaciones** (`recommendation`)
- **Score Range**: Basado en adoption/knowledge scores
- **Priority Level**: high, medium, low
- **Variables Soportadas**:
  - Todas las anteriores según contexto

## 🔧 Uso del Sistema

### Frontend (Automático)
El sistema se integra automáticamente. Cuando un usuario ve sus estadísticas:

1. Se consulta la BD por mensajes según score y área profesional
2. Se procesan las variables dinámicas en los templates
3. Si no hay mensaje en BD, usa fallback hardcodeado
4. Se muestra el mensaje personalizado al usuario

### API Endpoint
```javascript
GET /api/analysis-messages?messageType=adoption_explanation&score=75&area=Marketing y Comunicación

Response:
{
    "success": true,
    "message": {
        "id": "uuid",
        "title": "Marketing del Futuro",
        "message_template": "Tu score de {score} puntos te posiciona como...",
        // ... otros campos
    },
    "source": "database"
}
```

## 📝 Variables Dinámicas

### Variables Básicas
- `{score}` - Score numérico del usuario
- `{user_area}` - Área profesional
- `{level}` - Nivel calculado

### Variables de Adopción
- `{tools_used}` - "ChatGPT, Claude, GitHub Copilot"
- `{tools_context}` - Contexto específico según herramientas

### Variables de Conocimiento
- `{correct_answers}` - "8"
- `{total_questions}` - "12"
- `{percentage}` - "67"
- `{topic_details}` - " Desglose por temas: Prompting: 3/4 (75%), Ética: 2/3 (67%)"

## 🎨 Áreas Profesionales Soportadas

1. **CEO/Alta Dirección**
2. **Marketing y Comunicación**
3. **Finanzas/Contabilidad**
4. **Tecnología/Desarrollo de Software**
5. **Salud/Bienestar**
6. **Administración Pública/Gobierno**
7. **Diseño/Industrias Creativas**
8. **general** (fallback para todas las áreas)

## 🔍 Mapeo de Perfiles

El sistema mapea automáticamente perfiles del cuestionario a áreas GenAI:

```javascript
'CEO' → 'CEO/Alta Dirección'
'Dirección de Marketing' → 'Marketing y Comunicación'
'CTO/CIO' → 'Tecnología/Desarrollo de Software'
'Freelancer' → 'Diseño/Industrias Creativas'
// ... etc
```

## 📊 Ejemplo de Mensajes

### Adopción - Nivel Alto - Marketing
```
"Tu score de 85 puntos te posiciona como un profesional de marketing de vanguardia.
Tu uso diversificado de herramientas de IA muestra una adopción integral.
Estás aprovechando plenamente la IA para crear experiencias personalizadas y campañas altamente efectivas."
```

### Conocimiento - Nivel Medio - Tecnología
```
"Buen nivel técnico con 7/10 respuestas correctas (70%).
Tienes las bases para implementar soluciones de IA efectivas.
Considera profundizar en áreas especializadas como MLOps, ética de IA o arquitecturas avanzadas."
```

## 🛠️ Administración

### Agregar Nuevos Mensajes
```sql
INSERT INTO analysis_messages (
    message_type, score_range_min, score_range_max,
    target_area, title, message_template
) VALUES (
    'adoption_explanation', 80, 100,
    'Finanzas/Contabilidad',
    'Finanzas Inteligentes Avanzadas',
    'Con {score} puntos, dominas la IA financiera. {tools_context} Tu siguiente nivel incluye modelos financieros predictivos sofisticados.'
);
```

### Modificar Mensajes Existentes
```sql
UPDATE analysis_messages
SET message_template = 'Nuevo template con {score} puntos y {tools_used}'
WHERE message_type = 'adoption_explanation'
AND score_range_min = 70
AND target_area = 'Marketing y Comunicación';
```

### Desactivar Mensajes
```sql
UPDATE analysis_messages SET is_active = false WHERE id = 'uuid';
```

## 🔄 Sistema de Fallback

Si falla la consulta a la BD, el sistema automáticamente:

1. Usa los métodos `getFallbackAdoptionExplanation()` y `getFallbackKnowledgeExplanation()`
2. Mantiene funcionalidad completa con mensajes predeterminados
3. Registra warnings en consola para debugging

## 🚀 Instalación

1. **Ejecutar SQL**:
   ```bash
   psql -d tu_database -f database/create_analysis_messages.sql
   ```

2. **Reiniciar servidor** para cargar nuevo endpoint

3. **Verificar funcionamiento** en página de estadísticas

## 📈 Beneficios

✅ **Personalización**: Mensajes específicos por área y nivel
✅ **Escalabilidad**: Fácil agregar nuevos mensajes
✅ **Mantenibilidad**: Contenido editable desde BD
✅ **Flexibilidad**: Sistema de templates con variables
✅ **Robustez**: Fallbacks automáticos garantizados
✅ **Performance**: Consultas optimizadas con índices

## 🐛 Troubleshooting

### Error: "Supabase no configurado"
- Verificar variables de entorno `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`

### Error: "No se encontró mensaje"
- Verificar que existan mensajes en BD para el score/área específicos
- El sistema usará fallback automáticamente

### Variables no reemplazadas
- Verificar nombres de variables en template: `{variable_name}`
- Revisar que se pasen las variables correctas en `additionalData`

### Logs de Debug
```javascript
// En consola del navegador
🔍 Consultando BD: adoption_explanation, score=75, área=Marketing y Comunicación
✅ Mensaje encontrado en BD: Marketing del Futuro
```