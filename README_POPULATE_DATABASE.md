# 🗄️ SCRIPT PARA POBLAR LA BASE DE DATOS DEL CUESTIONARIO

## 📋 Descripción

Este conjunto de archivos SQL está diseñado para poblar completamente la base de datos del cuestionario de Gen-AI Multi-Área para México y LATAM. Los scripts están basados en el archivo CSV `Cuestionario_GenAI_MultiArea_MX_LATAM (1).csv` y el esquema de base de datos proporcionado.

## 📁 Archivos Incluidos

### ⭐ **SCRIPT RECOMENDADO**:
1. **`clean_and_populate_database.sql`** - **Script único que limpia y puebla todo** (Recomendado para evitar errores)

### Scripts Separados (si prefieres ejecutar por partes):
2. **`populate_database.sql`** - Script principal con tablas de configuración
3. **`populate_questions_continued.sql`** - Continuación de preguntas (áreas 2-4)
4. **`populate_questions_final.sql`** - Preguntas de áreas 5-7
5. **`populate_questions_complete.sql`** - Preguntas finales (áreas 8-11)

## 🚀 Instrucciones de Ejecución

### ⭐ **Opción Recomendada: Script Único**
```sql
-- Copiar y pegar TODO el contenido de clean_and_populate_database.sql
-- en tu terminal de Supabase SQL Editor
-- Este script limpia automáticamente las tablas y luego las puebla
```

### Opción 2: Scripts Separados
```sql
-- 1. Ejecutar populate_database.sql
-- 2. Ejecutar populate_questions_continued.sql
-- 3. Ejecutar populate_questions_final.sql
-- 4. Ejecutar populate_questions_complete.sql
```

## 🛠️ Solución de Problemas

### ❌ **Error: "duplicate key value violates unique constraint"**
**Síntoma**: `ERROR: 23505: duplicate key value violates unique constraint "areas_pkey" DETAIL: Key (id)=(1) already exists.`

**Causa**: Ya existen registros en las tablas con los mismos IDs.

**✅ Solución**:
1. **Usar el script recomendado**: `clean_and_populate_database.sql` que incluye comandos TRUNCATE automáticamente
2. **O limpiar manualmente** antes de ejecutar los scripts:
```sql
-- Limpiar tablas en orden correcto (por dependencias)
TRUNCATE TABLE respuestas CASCADE;
TRUNCATE TABLE preguntas CASCADE;
TRUNCATE TABLE role_synonyms CASCADE;
TRUNCATE TABLE user_perfil CASCADE;
TRUNCATE TABLE areas CASCADE;
TRUNCATE TABLE roles CASCADE;
TRUNCATE TABLE tamanos_empresa CASCADE;
TRUNCATE TABLE niveles CASCADE;
TRUNCATE TABLE sectores CASCADE;
TRUNCATE TABLE relaciones CASCADE;
```

## 📊 Datos Incluidos

### Tablas de Configuración
- **areas** (11 áreas): Todas, CEO/Alta Dirección, Tecnología, Marketing, etc.
- **roles** (10 roles): Correspondientes a cada área profesional
- **role_synonyms** (24 sinónimos): Alias y variaciones de nombres de roles
- **tamanos_empresa** (5 tamaños): Startup, Pequeña, Mediana, Grande, Corporación
- **niveles** (7 niveles): Junior, Mid-level, Senior, Lead, Manager, Director, C-Level
- **sectores** (10 sectores): Tecnología, Salud, Finanzas, Educación, Gobierno, etc.
- **relaciones** (6 tipos): Empleado, Contratista, Consultor, Estudiante, Investigador, Emprendedor

### Preguntas del Cuestionario
- **138 preguntas** en total
- **6 preguntas de metadatos** (perfil del usuario)
- **132 preguntas del cuestionario** divididas en:
  - **66 preguntas de Adopción** (escala Likert A-E)
  - **66 preguntas de Impacto** (escala Likert A-E)

### Áreas Cubiertas
1. **Metadatos** (Perfil del usuario)
2. **CEO/Alta Dirección**
3. **Tecnología/Desarrollo de Software**
4. **Marketing y Comunicación**
5. **Salud/Medicina**
6. **Derecho/Sector Legal**
7. **Finanzas/Contabilidad**
8. **Administración Pública/Gobierno**
9. **Academia/Investigación**
10. **Educación/Docentes**
11. **Diseño/Industrias Creativas**

## ⚠️ Consideraciones Importantes

### Antes de Ejecutar
- **Hacer backup** de tu base de datos actual
- **Verificar** que las tablas existan y tengan la estructura correcta
- **Revisar** las restricciones de clave foránea

### Estructura de Datos
- **IDs secuenciales**: Los scripts usan IDs específicos para mantener relaciones
- **JSONB**: Las opciones, escalas y scoring se almacenan como JSONB
- **Timestamps**: Todas las preguntas incluyen `created_at` con `NOW()`
- **Locale**: Todas las preguntas están configuradas para 'MX/LATAM'

### Peso y Scoring
- **Peso**: 8.333333 para todas las preguntas del cuestionario (100/12)
- **Escala Likert**: A=0, B=25, C=50, D=75, E=100
- **Scoring**: Correcta=100, Incorrecta=0 para preguntas de conocimiento

## 🔧 Personalización

### Modificar Peso de Preguntas
```sql
-- Ejemplo: Cambiar peso de preguntas de CEO
UPDATE preguntas 
SET peso = 10.0 
WHERE area_id = 2 AND section = 'Cuestionario';
```

### Agregar Nuevas Áreas
```sql
-- Ejemplo: Agregar nueva área
INSERT INTO areas (id, slug, nombre) VALUES (12, 'nueva-area', 'Nueva Área');
INSERT INTO roles (id, nombre, descripcion) VALUES (11, 'Nuevo Rol', 'Descripción del nuevo rol');
```

## 📈 Verificación Post-Ejecución

```sql
-- Verificar conteo de registros
SELECT 'areas' as tabla, COUNT(*) as total FROM areas
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'preguntas', COUNT(*) FROM preguntas
UNION ALL
SELECT 'role_synonyms', COUNT(*) FROM role_synonyms;

-- Verificar preguntas por área
SELECT a.nombre as area, COUNT(p.id) as preguntas
FROM areas a
LEFT JOIN preguntas p ON a.id = p.area_id
GROUP BY a.id, a.nombre
ORDER BY a.id;
```

## 📞 Soporte

Si encuentras algún problema durante la ejecución:
1. **Usa el script `clean_and_populate_database.sql`** para evitar conflictos
2. Verifica que tu esquema de base de datos coincida con el esperado
3. Revisa los logs de error en Supabase
4. Asegúrate de ejecutar los scripts en el orden correcto

---

**¡Listo! Tu base de datos estará completamente poblada con todos los datos del cuestionario de Gen-AI Multi-Área para México y LATAM.**
