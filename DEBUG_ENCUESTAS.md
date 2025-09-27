# 🔍 DEBUG - Encuestas No Funcionan

## ✅ **Estado Actual**
- ✅ Migración de base de datos ejecutada correctamente
- ✅ Columna `attachment_data` existe
- ✅ Constraint permite tipo `'poll'`
- ✅ Funciones SQL creadas
- ❓ Problema: No se guardan las encuestas ni se puede votar

## 🧪 **Pasos para Diagnosticar**

### **Paso 1: Verificar que la migración funcionó**
1. Abrir `test-poll-database.html` en el navegador
2. Hacer clic en "Probar Conexión"
3. Hacer clic en "Verificar Tabla"
4. Hacer clic en "Verificar Constraints"
5. Hacer clic en "Verificar Funciones"

**Resultado esperado**: Todos deben mostrar ✅

### **Paso 2: Probar creación manual de encuesta**
1. Abrir `test-poll-creation.html` en el navegador
2. Hacer clic en "Configurar Test"
3. Llenar pregunta y opciones
4. Hacer clic en "Crear Encuesta de Prueba"
5. Hacer clic en "Verificar en Base de Datos"
6. Hacer clic en "Probar Votación"

**Resultado esperado**: Debe crear y permitir votar exitosamente

### **Paso 3: Probar en la interfaz real de la comunidad**
1. Ir a la página de comunidad
2. Abrir Developer Tools (F12) → Console
3. Intentar crear una encuesta:
   - Hacer clic en crear post
   - Hacer clic en ícono de encuesta
   - Llenar datos
   - Publicar
4. **Observar los logs de debug** en la consola

**Logs a buscar:**
```
🔍 [DEBUG] pendingAttachments: [...]
🔍 [DEBUG] firstAttachment: {...}
🗳️ [DEBUG] Procesando encuesta...
📊 [DEBUG] attachmentData creado: {...}
🎯 [DEBUG] Datos finales: {...}
🚀 [DEBUG] Llamando db.createPost con: {...}
[DEBUG] Parametros recibidos: {...}
[DEBUG] postData preparado: {...}
```

## 🔍 **Posibles Problemas y Soluciones**

### **Problema 1: `pendingAttachments` está vacío**
**Síntoma**: Log muestra `⚠️ [DEBUG] No hay pendingAttachments`

**Causas posibles:**
- Modal de encuesta no funciona
- Función `addPreviewPoll` falla
- JavaScript tiene errores

**Solución:**
1. Verificar que no hay errores en la consola
2. Verificar que el modal de encuesta se abre
3. Verificar que los datos se llenan correctamente

### **Problema 2: `attachmentData` es null o undefined**
**Síntoma**: Los logs muestran datos pero `attachmentData` es null

**Causas posibles:**
- Error en la lógica de procesamiento
- `firstAttachment.type` no es 'poll'
- Falta alguna propiedad en el objeto

**Solución:**
1. Verificar que `firstAttachment.type === 'poll'`
2. Verificar que `firstAttachment.options` existe
3. Verificar que `firstAttachment.question` existe

### **Problema 3: Error en la base de datos**
**Síntoma**: Los datos llegan a `createPost` pero falla al insertar

**Causas posibles:**
- Permisos de Supabase
- Constraint de base de datos
- Tipo de dato incorrecto

**Solución:**
1. Verificar permisos RLS en Supabase
2. Verificar que el constraint permite 'poll'
3. Verificar que `attachment_data` acepta JSON

### **Problema 4: Usuario no autenticado**
**Síntoma**: Error "No hay usuario actual"

**Causas posibles:**
- Usuario no logueado
- Sesión expirada
- Problema con autenticación

**Solución:**
1. Verificar que el usuario está logueado
2. Refrescar la página
3. Volver a iniciar sesión

## 🛠️ **Comandos de Debug Manual**

### **Verificar en consola del navegador:**
```javascript
// Verificar que Supabase está disponible
console.log('Supabase:', window.supabase);

// Verificar usuario actual
window.supabase.auth.getSession().then(({data: {session}}) => {
    console.log('Usuario:', session?.user);
});

// Probar inserción manual
const testData = {
    community_id: 'TU_COMMUNITY_ID',
    user_id: 'TU_USER_ID',
    content: 'Test encuesta',
    attachment_type: 'poll',
    attachment_data: {
        question: 'Test?',
        options: ['A', 'B'],
        votes: {'0': [], '1': []}
    }
};

window.supabase.from('community_posts').insert(testData).then(console.log);
```

### **Verificar funciones SQL:**
```javascript
// Probar función de votación
window.supabase.rpc('cast_poll_vote', {
    post_id_param: 'POST_ID',
    user_id_param: 'USER_ID',
    option_index_param: 0
}).then(console.log);
```

## 📞 **Qué Reportar**

Si algo no funciona, reporta:

1. **Screenshot** de la consola con los logs
2. **Resultado** de los tests en `test-poll-database.html`
3. **Resultado** de los tests en `test-poll-creation.html`
4. **Errores específicos** que aparezcan

## 🚨 **Acciones Inmediatas**

1. **Probar primero** `test-poll-creation.html` para verificar que la base de datos funciona
2. **Si eso funciona**, el problema está en el frontend
3. **Si eso falla**, el problema está en la base de datos o permisos

**¡Vamos a encontrar dónde está el problema! 🕵️**