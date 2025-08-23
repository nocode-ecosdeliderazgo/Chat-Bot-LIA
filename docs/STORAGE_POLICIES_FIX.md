# 🔧 Solución a Errores de Subida de Archivos

## 🚨 **Errores Identificados:**

### **Error 1: MIME Type no soportado**
```
StorageApiError: mime type image/jpeg is not supported
```

### **Error 2: Violación de políticas RLS**
```
StorageApiError: new row violates row-level security policy
```

## ✅ **Solución Completa:**

### **Paso 1: Configurar Bucket "avatars"**

Ve a tu Supabase Dashboard → Storage → Buckets → "avatars" → Settings

**Habilita estos tipos de archivo:**
- `image/jpeg`
- `image/jpg` 
- `image/png`
- `image/gif`
- `image/webp`

### **Paso 2: Configurar Bucket "Curriculums"**

Ve a tu Supabase Dashboard → Storage → Buckets → "Curriculums" → Settings

**Habilita estos tipos de archivo:**
- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### **Paso 3: Ejecutar Comandos SQL**

Ve a SQL Editor y ejecuta estos comandos:

```sql
-- 1. Configurar políticas para bucket "avatars"
CREATE POLICY "enable_insert_for_avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "enable_select_for_avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "enable_update_for_avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "enable_delete_for_avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- 2. Configurar políticas para bucket "Curriculums"
CREATE POLICY "enable_insert_for_curriculums" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "enable_select_for_curriculums" ON storage.objects
FOR SELECT USING (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "enable_update_for_curriculums" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "enable_delete_for_curriculums" ON storage.objects
FOR DELETE USING (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);

-- 3. Configurar políticas para tabla "users"
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_update_own_profile" ON users
FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "users_can_read_own_profile" ON users
FOR SELECT USING (auth.uid()::text = id::text);
```

### **Paso 4: Verificar Configuración**

1. **Ve a Storage → Policies**
2. **Verifica que ambos buckets tengan 4 políticas cada uno**
3. **Verifica que la tabla "users" tenga RLS habilitado**

### **Paso 5: Probar la Funcionalidad**

1. **Ve a tu página de perfil**
2. **Intenta subir una imagen**
3. **Intenta subir un documento**
4. **Verifica que no aparezcan errores en la consola**

## 🔍 **Troubleshooting Adicional:**

### **Si sigues teniendo problemas:**

1. **Verifica que estés autenticado:**
   ```javascript
   console.log('Usuario actual:', localStorage.getItem('currentUser'));
   ```

2. **Verifica las credenciales de Supabase:**
   ```javascript
   console.log('Supabase URL:', localStorage.getItem('supabaseUrl'));
   console.log('Supabase Key:', localStorage.getItem('supabaseAnonKey'));
   ```

3. **Verifica que los buckets existan:**
   - Ve a Storage → Buckets
   - Debe haber un bucket llamado exactamente "avatars"
   - Debe haber un bucket llamado exactamente "Curriculums"

### **Comandos de Verificación:**

```sql
-- Verificar políticas existentes
SELECT * FROM storage.policies WHERE bucket_id IN ('avatars', 'Curriculums');

-- Verificar buckets
SELECT * FROM storage.buckets WHERE name IN ('avatars', 'Curriculums');

-- Verificar RLS en tabla users
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
```

## 🎯 **Resultado Esperado:**

Después de aplicar estas configuraciones:
- ✅ Las imágenes se subirán correctamente al bucket "avatars"
- ✅ Los documentos se subirán correctamente al bucket "Curriculums"
- ✅ No aparecerán errores de MIME type
- ✅ No aparecerán errores de políticas RLS
- ✅ Los archivos se actualizarán en la base de datos
- ✅ La interfaz se actualizará correctamente
