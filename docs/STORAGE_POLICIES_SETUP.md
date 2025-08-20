# Configuración de Políticas de Supabase Storage

## 🔧 **Configuración Requerida para Subida de Archivos**

### **Problema Identificado:**
Según las imágenes de tu configuración de Supabase Storage, el bucket `Curriculums` tiene **"No policies created yet"**, lo que impide la subida de archivos.

### **Solución: Configurar Políticas de Storage**

#### **1. Políticas para Bucket "avatars" (Ya configurado ✅)**
Tu bucket `avatars` ya tiene las políticas correctas:
- `upload_own_files` - INSERT
- `read_own_files` - SELECT  
- `update_own_files` - UPDATE
- `delete_own_files` - DELETE

#### **2. Políticas para Bucket "Curriculums" (Necesita configuración ⚠️)**

**Paso 1: Ir a Supabase Dashboard**
1. Ve a tu proyecto en Supabase
2. Navega a **Storage** → **Policies**
3. Selecciona el bucket **"Curriculums"**

**Paso 2: Crear Políticas**

Crea las siguientes políticas para el bucket `Curriculums`:

##### **Política 1: upload_own_cv (INSERT)**
```sql
CREATE POLICY "upload_own_cv" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'Curriculums' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

##### **Política 2: read_own_cv (SELECT)**
```sql
CREATE POLICY "read_own_cv" ON storage.objects
FOR SELECT USING (
  bucket_id = 'Curriculums' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

##### **Política 3: update_own_cv (UPDATE)**
```sql
CREATE POLICY "update_own_cv" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'Curriculums' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

##### **Política 4: delete_own_cv (DELETE)**
```sql
CREATE POLICY "delete_own_cv" ON storage.objects
FOR DELETE USING (
  bucket_id = 'Curriculums' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### **3. Configuración Alternativa (Más Simple)**

Si las políticas anteriores son complejas, puedes usar estas políticas más simples:

#### **Política Simple para INSERT:**
```sql
CREATE POLICY "enable_insert_for_authenticated_users" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);
```

#### **Política Simple para SELECT:**
```sql
CREATE POLICY "enable_select_for_authenticated_users" ON storage.objects
FOR SELECT USING (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);
```

#### **Política Simple para UPDATE:**
```sql
CREATE POLICY "enable_update_for_authenticated_users" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);
```

#### **Política Simple para DELETE:**
```sql
CREATE POLICY "enable_delete_for_authenticated_users" ON storage.objects
FOR DELETE USING (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);
```

### **4. Verificación de Configuración**

Después de configurar las políticas:

1. **Verifica en Supabase Dashboard:**
   - Ve a Storage → Policies
   - El bucket `Curriculums` debe mostrar 4 políticas activas
   - Ya no debe mostrar "No policies created yet"

2. **Prueba la funcionalidad:**
   - Ve a tu página de perfil
   - Intenta subir un documento
   - Verifica que no aparezcan errores en la consola

### **5. Troubleshooting**

#### **Error: "new row violates row-level security policy"**
- **Causa:** Políticas de RLS no configuradas correctamente
- **Solución:** Verificar que las políticas estén activas y correctas

#### **Error: "bucket not found"**
- **Causa:** El bucket no existe o el nombre es incorrecto
- **Solución:** Verificar que el bucket se llame exactamente `Curriculums`

#### **Error: "insufficient privileges"**
- **Causa:** El usuario no tiene permisos para acceder al bucket
- **Solución:** Verificar que el usuario esté autenticado y las políticas permitan acceso

### **6. Configuración de RLS en Tabla `users`**

También asegúrate de que la tabla `users` tenga RLS habilitado y las políticas correctas:

```sql
-- Habilitar RLS en la tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "users_can_update_own_profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- Política para que los usuarios puedan leer su propio perfil
CREATE POLICY "users_can_read_own_profile" ON users
FOR SELECT USING (auth.uid() = id);
```

### **7. Comandos SQL Completos**

Ejecuta estos comandos en el SQL Editor de Supabase:

```sql
-- Configurar políticas para bucket Curriculums
CREATE POLICY "enable_insert_for_authenticated_users" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "enable_select_for_authenticated_users" ON storage.objects
FOR SELECT USING (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "enable_update_for_authenticated_users" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "enable_delete_for_authenticated_users" ON storage.objects
FOR DELETE USING (
  bucket_id = 'Curriculums' AND
  auth.role() = 'authenticated'
);
```

### **8. Verificación Final**

Después de aplicar todas las configuraciones:

1. ✅ Bucket `avatars` tiene políticas configuradas
2. ✅ Bucket `Curriculums` tiene políticas configuradas  
3. ✅ Tabla `users` tiene RLS habilitado
4. ✅ Políticas de `users` permiten actualización de perfil
5. ✅ El código JavaScript está integrado correctamente

**¡Con esto deberías poder subir fotos de perfil y documentos sin problemas!**
