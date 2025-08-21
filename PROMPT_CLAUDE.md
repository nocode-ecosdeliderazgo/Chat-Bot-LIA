# PROMPT PARA SOLUCIONAR PROBLEMAS DE PERFIL

## Contexto del Problema

El usuario está experimentando varios problemas relacionados con el sistema de perfil en `profile.html`:

1. **Problema de carga/cambio de foto de perfil**: La foto de perfil no se carga correctamente o no se puede cambiar
2. **Problema de carga de CV**: El CV no se carga correctamente
3. **Problema de guardado de enlaces**: La información de los enlaces no se guarda
4. **Problema de vinculación entre cuentas**: Aparece la foto de perfil de una cuenta anterior en la cuenta actual, sugiriendo un problema de vinculación de datos o recuperación incorrecta

## Archivos Relevantes

- `src/profile.html` - Página principal del perfil
- `src/scripts/profile-manager.js` - Gestión del perfil
- `src/scripts/profile-avatar-manager.js` - Gestión específica del avatar
- `src/scripts/supabase-client.js` - Cliente de Supabase para base de datos
- `src/styles/profile.css` - Estilos del perfil

## Análisis Requerido

### 1. Problema de Avatar/Foto de Perfil

**Investigar:**
- Cómo se está cargando la foto de perfil actualmente
- Si hay problemas en la lógica de `profile-avatar-manager.js`
- Si hay conflictos entre localStorage y la base de datos
- Si hay problemas en la función de cambio de avatar
- Si hay problemas de permisos o rutas de archivos

**Verificar:**
- Función `loadUserProfilePicture()` en `profile-avatar-manager.js`
- Función `updateProfilePicture()` en `profile-avatar-manager.js`
- Manejo de eventos de cambio de archivo
- Almacenamiento en localStorage vs base de datos

### 2. Problema de Carga de CV

**Investigar:**
- Cómo se está cargando el CV actualmente
- Si hay problemas en la lógica de carga de archivos
- Si hay problemas de permisos o rutas
- Si hay problemas en la función de guardado del CV

**Verificar:**
- Función de carga de CV en `profile-manager.js`
- Manejo de archivos PDF
- Almacenamiento y recuperación del CV

### 3. Problema de Guardado de Enlaces

**Investigar:**
- Cómo se están guardando los enlaces actualmente
- Si hay problemas en la lógica de guardado
- Si hay problemas en la validación de enlaces
- Si hay problemas en la comunicación con la base de datos

**Verificar:**
- Función `saveProfile()` en `profile-manager.js`
- Validación de enlaces
- Guardado en base de datos vs localStorage

### 4. Problema de Vinculación Entre Cuentas

**Investigar:**
- Cómo se está identificando al usuario actual
- Si hay problemas en la lógica de autenticación
- Si hay problemas en la recuperación de datos específicos del usuario
- Si hay problemas de cache o localStorage compartido

**Verificar:**
- Función de autenticación en `supabase-client.js`
- Identificación única del usuario
- Limpieza de datos al cambiar de cuenta
- Manejo de sesiones

## Soluciones Propuestas

### Para el Avatar:
1. **Verificar identificación única del usuario** antes de cargar/guardar avatar
2. **Implementar limpieza de cache** al cambiar de cuenta
3. **Mejorar manejo de errores** en carga de archivos
4. **Verificar permisos** de archivos y rutas

### Para el CV:
1. **Verificar función de carga** de archivos PDF
2. **Implementar validación** de tipo de archivo
3. **Mejorar manejo de errores** en carga
4. **Verificar almacenamiento** en base de datos

### Para los Enlaces:
1. **Verificar función de guardado** en `saveProfile()`
2. **Implementar validación** de URLs
3. **Verificar comunicación** con base de datos
4. **Mejorar manejo de errores**

### Para la Vinculación Entre Cuentas:
1. **Implementar limpieza de localStorage** al hacer logout
2. **Verificar identificación única** del usuario en todas las operaciones
3. **Implementar validación** de sesión antes de cargar datos
4. **Mejorar manejo de autenticación**

## Código a Revisar

### En profile-manager.js:
```javascript
// Verificar estas funciones:
- loadUserProfile()
- saveProfile()
- loadUserCV()
- saveUserCV()
```

### En profile-avatar-manager.js:
```javascript
// Verificar estas funciones:
- loadUserProfilePicture()
- updateProfilePicture()
- handleFileSelect()
```

### En supabase-client.js:
```javascript
// Verificar estas funciones:
- getCurrentUser()
- getUserProfile()
- updateUserProfile()
```

## Pasos de Implementación

1. **Revisar y corregir** la identificación única del usuario
2. **Implementar limpieza de datos** al cambiar de cuenta
3. **Mejorar manejo de errores** en todas las funciones
4. **Verificar y corregir** la comunicación con la base de datos
5. **Implementar validaciones** adicionales
6. **Probar** con múltiples cuentas para verificar aislamiento

## Resultado Esperado

- La foto de perfil se carga y cambia correctamente para cada usuario
- El CV se carga correctamente
- Los enlaces se guardan y recuperan correctamente
- No hay vinculación de datos entre diferentes cuentas
- Cada usuario ve solo sus propios datos

## Notas Importantes

- **Priorizar la seguridad** de datos entre usuarios
- **Mantener la consistencia** con el sistema de autenticación existente
- **Preservar la funcionalidad** de modo claro/oscuro implementada
- **Documentar cambios** para futuras referencias

Codigos de error en la consola
miwbzotcuaywpdbidpwo…1755817741498.jpg:1 
 Failed to load resource: the server responded with a status of 400 ()
file-upload-manager.js:124 Error subiendo imagen: StorageApiError: mime type image/jpeg is not supported
    at index.js:1:1
handleProfilePictureUpload	@	file-upload-manager.js:124
file-upload-manager.js:179 Subiendo curriculum: 
{fileName: 'cv_9562a449-4ade-4d4b-a3e4-b66dddb7e6f0_1755818022890.pdf', fileType: 'application/pdf', fileSize: 129653, bucket: 'Curriculums'}
index.js:1 

 POST https://miwbzotcuaywpdbidpwo.supabase.co/storage/v1/object/Curriculums/cv_9562a449-4ade-4d4b-a3e4-b66dddb7e6f0_1755818022890.pdf 400 (Bad Request)
file-upload-manager.js:195 Error subiendo curriculum: StorageApiError: new row violates row-level security policy
    at index.js:1:1
handleCurriculumUpload	@	file-upload-manager.js:195
await in handleCurriculumUpload		
(anonymous)	@	file-upload-manager.js:87