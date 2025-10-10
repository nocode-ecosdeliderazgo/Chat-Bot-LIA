# 🔐 Guía de Persistencia de Credenciales - Función "Recordarme"

## 📋 Issue: ECOS-377

### ✅ **Implementación Completada**

Se ha mejorado la funcionalidad del checkbox "Recordarme" para que persista tanto el **usuario/email** como la **contraseña** del usuario.

---

## 🎯 **Funcionalidades Implementadas**

### 1. **Ofuscación de Contraseñas**
- ✅ Uso de XOR + Base64 para ofuscar la contraseña
- ✅ Clave de ofuscación: `AyA-2024-SecureKey-`
- ⚠️ **NOTA**: Esto es ofuscación básica, NO encriptación verdadera

### 2. **Guardado Automático**
Cuando el usuario marca "Recordarme" y hace login exitoso:
- ✅ Se guarda el email/username
- ✅ Se guarda la contraseña (ofuscada)
- ✅ Se guarda el timestamp

### 3. **Carga Automática**
Al abrir la página de login:
- ✅ Se cargan automáticamente el email/username
- ✅ Se carga automáticamente la contraseña
- ✅ El checkbox "Recordarme" aparece marcado

### 4. **Limpieza Automática**
- ✅ Si el usuario desmarca "Recordarme", se limpian las credenciales inmediatamente
- ✅ Si pasan más de 30 días, se limpian automáticamente
- ✅ Si hay error al desofuscar, se limpia la contraseña guardada

---

## 🔧 **Funciones Principales**

### `obfuscateString(str)`
Ofusca una cadena de texto usando XOR y Base64.
```javascript
const passwordEncoded = obfuscateString('miPassword123');
// Resultado: Cadena ofuscada en Base64
```

### `deobfuscateString(str)`
Recupera la cadena original desde la versión ofuscada.
```javascript
const originalPassword = deobfuscateString(passwordEncoded);
// Resultado: 'miPassword123'
```

### `clearRememberedCredentials()`
Limpia todas las credenciales guardadas del localStorage.
```javascript
clearRememberedCredentials();
// Elimina: rememberedEmailOrUsername, rememberedPassword, rememberedTime
```

### `loadRememberedCredentials()`
Carga automáticamente las credenciales guardadas al iniciar.
- Verifica que no hayan pasado más de 30 días
- Carga el email/username
- Desofusca y carga la contraseña
- Marca el checkbox "Recordarme"

### `setupRememberMeCheckbox()`
Configura el listener del checkbox.
- Si se desmarca → limpia credenciales inmediatamente

---

## 📊 **Datos Guardados en localStorage**

| Clave | Contenido | Formato |
|-------|-----------|---------|
| `rememberedEmailOrUsername` | Email o username | Texto plano |
| `rememberedPassword` | Contraseña | Base64 (ofuscada con XOR) |
| `rememberedTime` | Timestamp de guardado | Número (milisegundos) |

---

## 🧪 **Cómo Probar**

### **Prueba 1: Guardar Credenciales**
1. Abre `src/login/new-auth.html`
2. Ingresa tu email y contraseña
3. ✅ **Marca** el checkbox "Recordarme"
4. Haz clic en "Ingresar"
5. Cierra el navegador completamente
6. Abre nuevamente `src/login/new-auth.html`
7. **Resultado esperado**: 
   - Email y contraseña ya están llenos
   - Checkbox está marcado
   - Puedes hacer login directamente

### **Prueba 2: Desmarcar Recordarme**
1. Con credenciales guardadas, abre la página de login
2. Verás que email y contraseña están llenos
3. ✅ **Desmarca** el checkbox "Recordarme"
4. Recarga la página
5. **Resultado esperado**: 
   - Los campos están vacíos
   - Checkbox no está marcado

### **Prueba 3: Expiración (30 días)**
1. Abre la consola del navegador (F12)
2. Ejecuta:
```javascript
// Simular que pasaron 31 días
const oldTime = Date.now() - (31 * 24 * 60 * 60 * 1000);
localStorage.setItem('rememberedTime', oldTime.toString());
```
3. Recarga la página
4. **Resultado esperado**: 
   - Credenciales se limpiaron automáticamente
   - Campos vacíos

### **Prueba 4: Verificar Ofuscación**
1. Abre la consola del navegador (F12)
2. Ejecuta:
```javascript
// Ver la contraseña ofuscada
console.log(localStorage.getItem('rememberedPassword'));
// Resultado: String en Base64, NO la contraseña en texto plano
```

---

## 🔍 **Debugging**

### Ver logs en consola:
```javascript
// Los siguientes mensajes aparecerán en la consola:
"Credenciales guardadas para recordar (Supabase)"
"Credenciales guardadas para recordar (Backend)"
"Credenciales recordadas cargadas correctamente"
"Checkbox desmarcado - credenciales eliminadas"
"Credenciales recordadas eliminadas"
```

### Inspeccionar localStorage:
```javascript
// En la consola del navegador
localStorage.getItem('rememberedEmailOrUsername')
localStorage.getItem('rememberedPassword')
localStorage.getItem('rememberedTime')
```

### Limpiar manualmente:
```javascript
// En la consola del navegador
localStorage.removeItem('rememberedEmailOrUsername');
localStorage.removeItem('rememberedPassword');
localStorage.removeItem('rememberedTime');
```

---

## ⚠️ **Consideraciones de Seguridad**

### ⚠️ **Importante**:
1. **Ofuscación ≠ Encriptación**: La contraseña está ofuscada, no encriptada verdaderamente.
2. **Acceso físico**: Si alguien tiene acceso físico al navegador, puede recuperar la contraseña.
3. **XSS**: Scripts maliciosos pueden acceder al localStorage.
4. **Navegadores públicos**: NO usar "Recordarme" en computadoras públicas.

### 🛡️ **Medidas de Seguridad Implementadas**:
- ✅ XOR con clave personalizada
- ✅ Codificación Base64
- ✅ Expiración automática (30 días)
- ✅ Limpieza al desmarcar
- ✅ Manejo de errores al desofuscar

### 📝 **Recomendaciones Adicionales**:
Para mayor seguridad en producción:
- Considerar usar Web Crypto API para encriptación real
- Implementar fingerprinting del navegador
- Usar cookies HTTPOnly en lugar de localStorage
- Implementar 2FA (autenticación de dos factores)

---

## 📱 **Compatibilidad**

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Navegadores móviles

---

## 🐛 **Problemas Conocidos**

### Problema: Contraseña no se carga
**Solución**:
1. Verifica que el id del input sea `loginPassword`
2. Revisa la consola por errores de desofuscación
3. Limpia el localStorage y vuelve a guardar

### Problema: Credenciales no expiran
**Solución**:
1. Verifica que `rememberedTime` esté guardado correctamente
2. La comparación es en días: `(Date.now() - storedTime) / (1000 * 60 * 60 * 24)`

---

## 📝 **Archivos Modificados**

### `src/login/new-auth.js`
- ✅ Agregadas funciones `obfuscateString()` y `deobfuscateString()`
- ✅ Agregada función `clearRememberedCredentials()`
- ✅ Modificada función `loadRememberedCredentials()`
- ✅ Modificada función `handleLogin()` (3 lugares: Supabase, Backend, Dev)
- ✅ Agregada función `setupRememberMeCheckbox()`
- ✅ Modificada función `setupEventListeners()`

---

## ✅ **Checklist de Verificación**

- [x] Funciones de ofuscación creadas
- [x] handleLogin guarda contraseña en 3 flujos diferentes
- [x] loadRememberedCredentials carga contraseña
- [x] Checkbox limpia credenciales al desmarcarse
- [x] Expiración de 30 días funciona
- [x] Manejo de errores implementado
- [x] Logging para debugging
- [x] Sin errores de linting

---

## 🚀 **Próximos Pasos Sugeridos**

1. **Testing de Usuario**: Realizar pruebas con usuarios reales
2. **Monitoreo**: Implementar analytics para ver cuántos usan "Recordarme"
3. **Encriptación Real**: Migrar a Web Crypto API en producción
4. **Documentación de Usuario**: Crear tooltips explicando la funcionalidad

---

## 📞 **Soporte**

Para más información o problemas:
- Revisar logs en consola del navegador (F12)
- Verificar localStorage
- Consultar este documento

---

**Fecha de Implementación**: 2024  
**Issue**: ECOS-377  
**Estado**: ✅ Completado

