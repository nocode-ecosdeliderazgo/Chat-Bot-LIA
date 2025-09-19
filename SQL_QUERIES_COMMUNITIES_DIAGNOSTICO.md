# 🔍 SQL QUERIES - DIAGNÓSTICO COMUNIDADES

## ⚡ SOLUCIÓN 1: VERIFICAR DATOS EN TABLA COMMUNITIES

### CONSULTA SQL DIRECTA en Supabase SQL Editor:

```sql
-- 1. Verificar que hay datos en la tabla
SELECT
    id,
    name,
    description,
    slug,
    is_active,
    member_count,
    created_at
FROM public.communities
ORDER BY created_at DESC;

-- 2. Contar total de registros
SELECT COUNT(*) as total_communities FROM public.communities;

-- 3. Verificar registros activos específicamente
SELECT COUNT(*) as active_communities
FROM public.communities
WHERE is_active = true;

-- 4. Ver todos los campos de una comunidad específica
SELECT * FROM public.communities
WHERE name = 'Profesionales'
LIMIT 1;
```

## ⚡ SOLUCIÓN 2: VERIFICAR Y CORREGIR POLÍTICAS RLS

### CONSULTA SQL para verificar políticas:

```sql
-- 1. Ver todas las políticas en la tabla communities
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'communities';

-- 2. Ver si RLS está habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'communities';
```

### SI NO HAY POLÍTICAS PÚBLICAS, crear una:

```sql
-- Crear política que permite lectura pública
CREATE POLICY "communities_public_read" ON public.communities
FOR SELECT USING (true);

-- O si prefieres solo para usuarios autenticados:
CREATE POLICY "communities_authenticated_read" ON public.communities
FOR SELECT USING (auth.uid() IS NOT NULL);
```

## ⚡ SOLUCIÓN 4: INSERTAR DATOS DE PRUEBA EN SUPABASE (SI LA TABLA ESTÁ VACÍA)

### SQL para insertar las 4 comunidades:

```sql
-- Insertar datos de comunidades si la tabla está vacía
INSERT INTO public.communities (id, name, description, slug, image_url, member_count, is_active, created_at, updated_at)
VALUES
    ('7886aa14-35b9-41da-b099-29ff1ad3516b', 'Profesionales', 'Espacio abierto para perfiles sin cursos activos', 'profesionales', null, 1, true, NOW(), NOW()),
    ('aa5a4c4c-ce64-4a12-b1ef-365aa0d320c8', 'SIF ICAP', 'Comunidad cerrada por invitación.', 'sif-icap', null, 1, true, NOW(), NOW()),
    ('b3b154e1-110e-4aa7-8998-ef208482a159', 'Openminder', 'Comunidad cerrada por invitación.', 'openminder', null, 1, true, NOW(), NOW()),
    ('d2dbebb1-5b57-4da7-9fc6-8b40c732b548', 'Ecos de Liderazgo', 'Comunidad cerrada por invitación.', 'ecos-de-liderazgo', null, 1, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

## 🔍 DIAGNÓSTICO PRIORITARIO

### PASO 1: VERIFICAR DATOS EN TABLA
**EJECUTAR** en Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM public.communities;
```

### PASO 2: VERIFICAR POLÍTICAS RLS
**EJECUTAR** en Supabase SQL Editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'communities';
```

### PASO 3: APLICAR SOLUCIÓN SEGÚN RESULTADO

#### **SI COUNT = 0** (Tabla vacía):
- Ejecutar INSERT de las 4 comunidades

#### **SI COUNT > 0** (Hay datos):
- Crear política pública: `CREATE POLICY "communities_public_read" ON public.communities FOR SELECT USING (true);`

#### **SI HAY POLÍTICAS RESTRICTIVAS**:
- Modificar política existente o crear nueva pública

## ✅ RESULTADO ESPERADO

### Console Log con Comunidades Cargadas:
```
🔍 PRUEBA DIRECTA: Consulta sin restricciones...
📊 PRUEBA DIRECTA - Total registros: 4
📊 PRUEBA DIRECTA - Datos: [4 comunidades]
✅ PRUEBA DIRECTA exitosa - Datos encontrados: 4
🏘️ ULTRATHINK: Comunidades cargadas: [4 comunidades]
📊 ULTRATHINK: Número de comunidades encontradas: 4
```

### Interfaz mostrando:
- ✅ **4 comunidades visibles**: Profesionales, SIF ICAP, Openminder, Ecos de Liderazgo
- ✅ **Usuario autenticado**: fernando.suarez@ecosdeliderazgo.com
- ✅ **Sin mensaje "No tienes comunidades disponibles"**