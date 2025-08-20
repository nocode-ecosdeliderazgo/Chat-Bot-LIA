# 🚨 SOLUCIÓN RÁPIDA - Error de Storage

## 🔍 **Problema Identificado:**
```
StorageApiError: new row violates row-level security policy
```

## ✅ **Solución Paso a Paso:**

### **Paso 1: Verificar Autenticación**
1. Abre `debug-auth.html` en tu navegador
2. Verifica que el usuario esté autenticado
3. Si no está autenticado, inicia sesión primero

### **Paso 2: Configurar Políticas en Supabase**

**Ve a tu Supabase Dashboard → SQL Editor y ejecuta esto:**

```sql
-- 1. Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "enable_insert_for_curriculums" ON storage.objects;
DROP POLICY IF EXISTS "enable_select_for_curriculums" ON storage.objects;
DROP POLICY IF EXISTS "enable_update_for_curriculums" ON storage.objects;
DROP POLICY IF EXISTS "enable_delete_for_curriculums" ON storage.objects;

-- 2. Crear políticas nuevas
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

-- 3. Verificar que se crearon
SELECT * FROM storage.policies WHERE bucket_id = 'Curriculums';
```

### **Paso 3: Configurar Tipos MIME**

1. Ve a **Storage → Buckets → "Curriculums" → Settings**
2. En **"Allowed MIME Types"** agrega:
   - `application/pdf`
   - `application/msword`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### **Paso 4: Verificar Configuración**

1. Abre `test-storage-config.html`
2. Haz clic en "Verificar Políticas"
3. Haz clic en "Test Subida Documento"

### **Paso 5: Probar la Funcionalidad**

1. Ve a tu página de perfil
2. Intenta subir un documento
3. Verifica que no aparezcan errores

## 🔧 **Si el Problema Persiste:**

### **Opción A: Políticas Más Permisivas**
```sql
-- Políticas más simples (menos seguras pero funcionales)
CREATE POLICY "allow_all_for_curriculums" ON storage.objects
FOR ALL USING (bucket_id = 'Curriculums');
```

### **Opción B: Verificar Bucket**
```sql
-- Verificar que el bucket existe
SELECT * FROM storage.buckets WHERE name = 'Curriculums';

-- Si no existe, créalo
INSERT INTO storage.buckets (id, name, public) 
VALUES ('curriculums', 'Curriculums', false);
```

### **Opción C: Verificar RLS**
```sql
-- Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

## 🎯 **Comandos de Verificación:**

```sql
-- Verificar políticas
SELECT * FROM storage.policies WHERE bucket_id = 'Curriculums';

-- Verificar buckets
SELECT * FROM storage.buckets WHERE name = 'Curriculums';

-- Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

## 📋 **Checklist de Verificación:**

- [ ] Usuario autenticado en Supabase
- [ ] Políticas creadas para bucket "Curriculums"
- [ ] Tipos MIME configurados
- [ ] RLS habilitado en storage.objects
- [ ] Bucket "Curriculums" existe
- [ ] Test de subida exitoso

## 🆘 **Si Nada Funciona:**

1. **Reinicia el navegador**
2. **Limpia localStorage:**
   ```javascript
   localStorage.clear();
   ```
3. **Vuelve a iniciar sesión**
4. **Prueba con un archivo diferente**

## 📞 **Soporte:**

Si el problema persiste después de seguir todos los pasos:
1. Ejecuta `debug-auth.html` y comparte los logs
2. Ejecuta `test-storage-config.html` y comparte los resultados
3. Verifica que las políticas se crearon correctamente en Supabase Dashboard
