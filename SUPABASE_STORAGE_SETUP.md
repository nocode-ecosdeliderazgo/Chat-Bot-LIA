# 🗂️ Guía de Configuración: Supabase Storage para Imágenes de Perfil

## ❌ Problema Identificado

El error `new row violates row-level security policy` indica que **las políticas RLS de Supabase están bloqueando la creación automática de buckets**. Esto es común y se soluciona configurando los buckets manualmente.

## ✅ Solución Paso a Paso

### **Opción 1: Script Automático (Recomendado)**

1. **Abrir la consola del navegador** en cualquier página de la aplicación (F12)
2. **Cargar y ejecutar el script** `setup-supabase-buckets.js`:
   ```javascript
   // Copiar y pegar el contenido completo del archivo setup-supabase-buckets.js
   ```
3. **Seguir las instrucciones** que aparecen en la consola

### **Opción 2: Configuración Manual en Supabase Dashboard**

#### **Paso 1: Acceder a Supabase Dashboard**
1. Ir a https://app.supabase.com
2. Seleccionar tu proyecto
3. Ir a **Storage → Buckets**

#### **Paso 2: Crear Bucket "avatars"**
```
Nombre: avatars
✅ Public bucket: SÍ (IMPORTANTE)
File size limit: 5MB
Allowed MIME types: image/png, image/jpeg, image/jpg, image/gif
```

#### **Paso 3: Crear Bucket "curriculums"**
```
Nombre: curriculums  
✅ Public bucket: SÍ (IMPORTANTE)
File size limit: 10MB
Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

#### **Paso 4: Configurar Políticas RLS (Opcional)**
Si quieres buckets completamente públicos, puedes agregar estas políticas SQL:

```sql
-- Política para permitir uploads públicos en avatars
CREATE POLICY "Allow public uploads to avatars" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Política para permitir acceso público a avatars  
CREATE POLICY "Allow public access to avatars" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

-- Política para permitir uploads públicos en curriculums
CREATE POLICY "Allow public uploads to curriculums" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'curriculums');

-- Política para permitir acceso público a curriculums
CREATE POLICY "Allow public access to curriculums" ON storage.objects 
FOR SELECT USING (bucket_id = 'curriculums');
```

### **Opción 3: Usar Service Role Key (Avanzado)**

Si tienes acceso a la **service_role key**:

1. **Agregar la service key** al localStorage o como meta tag:
   ```javascript
   localStorage.setItem('supabaseServiceKey', 'tu_service_role_key_aqui');
   ```

2. **O agregar como meta tag** en profile.html:
   ```html
   <meta name="supabase-service-key" content="tu_service_role_key_aqui">
   ```

3. **Recargar la página** - El sistema intentará crear buckets automáticamente con permisos de servicio.

## 🧪 Verificar que Funciona

### **Test Rápido en Consola:**
```javascript
// Verificar buckets
window.supabase.storage.listBuckets().then(({data, error}) => {
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Buckets:', data.map(b => `${b.name} (${b.public ? 'público' : 'privado'})`));
    }
});

// Test de acceso
Promise.all([
    window.supabase.storage.from('avatars').list('', { limit: 1 }),
    window.supabase.storage.from('curriculums').list('', { limit: 1 })
]).then(([avatars, curriculums]) => {
    console.log('Acceso avatars:', avatars.error ? '❌' : '✅');
    console.log('Acceso curriculums:', curriculums.error ? '❌' : '✅');
});
```

### **Test de Upload:**
1. **Ir a profile.html**
2. **Seleccionar una imagen** para el avatar
3. **Verificar en consola** que no aparezcan errores de bucket
4. **Confirmar** que la imagen se sube correctamente

## 📊 Estados Posibles

| Estado | Descripción | Acción |
|--------|------------|--------|
| ✅ **Buckets existen y son públicos** | Todo funciona | Ninguna acción necesaria |
| ⚠️ **Buckets existen pero son privados** | Upload puede fallar | Marcar como públicos en Dashboard |
| ❌ **Buckets no existen** | Upload definitivamente falla | Crear buckets según instrucciones |
| 🔒 **Error de RLS** | Políticas muy restrictivas | Configurar políticas RLS o usar service role |

## 🛠️ Troubleshooting

### **Error: "Bucket not found"**
- **Causa:** El bucket no existe
- **Solución:** Crear bucket según instrucciones

### **Error: "row-level security policy"**  
- **Causa:** Políticas RLS muy restrictivas
- **Solución:** Marcar bucket como público O configurar políticas apropiadas

### **Error: "Forbidden"**
- **Causa:** Usuario sin permisos
- **Solución:** Usar buckets públicos O autenticarse correctamente

### **Error: "Invalid MIME type"**
- **Causa:** Tipo de archivo no permitido
- **Solución:** Verificar que el bucket acepta el tipo de imagen

## 📝 Notas Importantes

1. **Los buckets DEBEN ser públicos** para que funcionen sin autenticación compleja
2. **Los nombres deben ser exactamente** `avatars` y `curriculums` (minúsculas)
3. **Si cambias los nombres**, también debes actualizar `file-upload-manager.js`
4. **El sistema tiene fallback** a base64 local si Storage falla
5. **Las políticas RLS son opcionales** para buckets públicos

## 🔄 Después de la Configuración

Una vez configurados los buckets:
1. **Recargar** la página de perfil
2. **Probar** subir una imagen
3. **Verificar** que no aparezcan errores en consola
4. **Confirmar** que la imagen se muestra correctamente

---

**¿Necesitas ayuda adicional?** Abre la consola del navegador y ejecuta el script de configuración automática, o sigue las instrucciones manuales paso a paso.