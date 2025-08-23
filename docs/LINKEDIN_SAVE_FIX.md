# 🔗 Solución: Problema de Guardado de LinkedIn

## 🔍 **Problema Identificado:**
El enlace de LinkedIn no se guarda cuando el usuario lo ingresa en el perfil.

## ✅ **Solución Implementada:**

### **Paso 1: Verificar la Configuración**

1. **Abre `debug-profile.html`** en tu navegador
2. **Haz clic en "Cargar Usuario"** para ver la información actual
3. **Verifica que el usuario esté autenticado** y tenga un ID válido

### **Paso 2: Probar el Guardado**

1. **En `debug-profile.html`:**
   - Ingresa una URL de LinkedIn en el campo de prueba
   - Haz clic en "Probar Guardado"
   - Verifica que no aparezcan errores

### **Paso 3: Verificar la Base de Datos**

**Ve a tu Supabase Dashboard → SQL Editor y ejecuta:**

```sql
-- Verificar que la tabla users tiene las columnas necesarias
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('linkedin_url', 'github_url', 'website_url');

-- Verificar datos actuales del usuario
SELECT id, username, email, linkedin_url, github_url, website_url 
FROM users 
WHERE username = 'yaelgs'; -- Reemplaza con tu username
```

### **Paso 4: Si Faltan Columnas**

Si las columnas no existen, créalas:

```sql
-- Agregar columnas si no existen
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Verificar que se crearon
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('linkedin_url', 'github_url', 'website_url');
```

### **Paso 5: Configurar Políticas RLS**

```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Crear política para actualizar perfil propio
CREATE POLICY IF NOT EXISTS "users_can_update_own_profile" ON users
FOR UPDATE USING (auth.uid()::text = id::text);

-- Crear política para leer perfil propio
CREATE POLICY IF NOT EXISTS "users_can_read_own_profile" ON users
FOR SELECT USING (auth.uid()::text = id::text);
```

## 🔧 **Código Corregido:**

El problema estaba en que el código intentaba usar un endpoint `/api/profile` que no existe. He corregido el `profile-manager.js` para usar Supabase directamente:

```javascript
// Antes (no funcionaba):
const resp = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
});

// Ahora (funciona):
const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', this.currentUser.id)
    .select();
```

## 📋 **Verificación:**

### **1. En la Consola del Navegador:**
- Abre las herramientas de desarrollador (F12)
- Ve a la pestaña "Console"
- Intenta guardar el perfil
- Deberías ver mensajes como:
  ```
  Actualizando perfil con datos: {linkedin_url: "https://linkedin.com/in/tu-perfil", ...}
  Perfil actualizado en Supabase: {id: "...", linkedin_url: "https://linkedin.com/in/tu-perfil", ...}
  ```

### **2. En Supabase Dashboard:**
- Ve a **Table Editor → users**
- Busca tu usuario
- Verifica que el campo `linkedin_url` tenga el valor correcto

### **3. En localStorage:**
- Abre las herramientas de desarrollador (F12)
- Ve a **Application → Local Storage**
- Busca la clave `currentUser`
- Verifica que contenga `linkedin_url`

## 🎯 **Resultado Esperado:**

Después de aplicar estas correcciones:
- ✅ El enlace de LinkedIn se guardará correctamente
- ✅ El enlace de GitHub se guardará correctamente
- ✅ El enlace del Portfolio se guardará correctamente
- ✅ Los datos se actualizarán en Supabase
- ✅ Los datos se actualizarán en localStorage
- ✅ La interfaz mostrará los valores guardados

## 🆘 **Si el Problema Persiste:**

1. **Verifica la autenticación:**
   ```javascript
   console.log('Usuario actual:', localStorage.getItem('currentUser'));
   ```

2. **Verifica las credenciales de Supabase:**
   ```javascript
   console.log('Supabase URL:', localStorage.getItem('supabaseUrl'));
   console.log('Supabase Key:', localStorage.getItem('supabaseAnonKey'));
   ```

3. **Verifica que la tabla users tenga RLS habilitado:**
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'users';
   ```

4. **Usa `debug-profile.html`** para diagnosticar el problema paso a paso.

## 📞 **Soporte:**

Si el problema persiste después de seguir todos los pasos:
1. Ejecuta `debug-profile.html` y comparte los logs
2. Verifica que las políticas RLS estén configuradas correctamente
3. Verifica que las columnas existan en la tabla `users`
