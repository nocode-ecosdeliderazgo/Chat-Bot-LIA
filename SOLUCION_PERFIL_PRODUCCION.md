# Solución: Perfil no carga datos en producción (Netlify)

## 📋 Problema Identificado

El perfil de usuario no mostraba la información correctamente en producción (Netlify) pero sí funcionaba en local. El problema tenía las siguientes causas:

### Causa Principal
- **`get-profile.js` usaba PostgreSQL directo** (variable `DATABASE_URL`) que no estaba configurada en Netlify
- Netlify tiene configuradas las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, pero el código intentaba usar PostgreSQL directamente

### Causas Secundarias
- **Timing de carga de credenciales**: Las credenciales de Supabase se cargaban de forma asíncrona pero `profile-manager.js` no esperaba a que estuvieran disponibles
- **Falta de logging detallado**: Era difícil diagnosticar el problema en producción

---

## ✅ Cambios Realizados

### 1. **Actualización de `netlify/functions/get-profile.js`**

**Cambio principal**: Migración de PostgreSQL directo a Supabase

```javascript
// ❌ ANTES (usaba PostgreSQL directo)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ AHORA (usa Supabase)
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

**Beneficios**:
- ✅ Usa las variables de entorno ya configuradas en Netlify
- ✅ Mayor consistencia con el resto del proyecto
- ✅ Mejor manejo de errores
- ✅ Código más limpio y mantenible

### 2. **Mejora de timing en `src/profile.html`**

**Cambio**: Credenciales se cargan como promesa global

```javascript
// ✅ AHORA
window.supabaseCredentialsLoaded = false;
window.supabaseCredentialsPromise = (async function loadSupabaseCredentials() {
    // ... código de carga
    return true/false;
})();
```

**Beneficios**:
- ✅ Otros scripts pueden esperar a que las credenciales estén disponibles
- ✅ Mejor control del flujo de inicialización
- ✅ Fallback a localStorage si falla la API

### 3. **Mejora de `src/scripts/profile-manager.js`**

**Cambios principales**:
1. Espera explícita a credenciales
2. Logging detallado para debugging
3. Mejor manejo de errores

```javascript
async init() {
    // Esperar credenciales primero
    if (window.supabaseCredentialsPromise) {
        await window.supabaseCredentialsPromise;
    }
    
    // Luego esperar a Supabase
    await this.waitForSupabase();
    
    // Finalmente cargar perfil con logging detallado
    await this.loadCurrentUser();
    // ...
}
```

**Beneficios**:
- ✅ Orden de inicialización predecible
- ✅ Logs detallados para debugging
- ✅ Mejor visibilidad de errores

---

## 🧪 Cómo Probar Localmente

### 1. **Verificar las variables de entorno locales**

Asegúrate de tener un archivo `.env` en la raíz con:

```env
SUPABASE_URL=https://miwbzotcuaywpdbidpwo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 2. **Instalar dependencias (si no lo has hecho)**

```bash
npm install
```

### 3. **Ejecutar Netlify Dev localmente**

```bash
npx netlify dev
```

Esto ejecutará las funciones de Netlify localmente en `http://localhost:8888`

### 4. **Probar el perfil**

1. Abre `http://localhost:8888/profile.html`
2. **Abre la consola del navegador** (F12)
3. Busca estos logs:
   ```
   ✅ Credenciales de Supabase cargadas desde API
   ✅ ProfileManager: Supabase está listo, cargando perfil...
   ✅ Perfil obtenido exitosamente desde API
   ```

### 5. **Verificar que se muestran los datos**

Deberías ver:
- ✅ Nombre y apellido
- ✅ Teléfono
- ✅ Ubicación
- ✅ Biografía
- ✅ URLs de redes sociales

---

## 🚀 Desplegar a Producción (Netlify)

### 1. **Verificar variables de entorno en Netlify**

Asegúrate de que están configuradas en:
`Site Settings > Environment Variables`

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
```

### 2. **Commit y Push**

```bash
git add .
git commit -m "fix: Corregir carga de perfil en producción usando Supabase"
git push origin Fer-Deploy
```

### 3. **Esperar el deploy automático**

Netlify detectará el push y desplegará automáticamente.

### 4. **Verificar en producción**

1. Ve a `https://aprendeyaplica.ai/profile.html`
2. **Abre la consola** (F12)
3. Busca los mismos logs de éxito
4. Verifica que se muestran los datos correctamente

---

## 🔍 Debugging en Producción

Si el problema persiste en producción, sigue estos pasos:

### 1. **Ver logs de Netlify Functions**

En Netlify Dashboard:
- Ve a `Functions` tab
- Busca `get-profile`
- Revisa los logs

### 2. **Ver logs del navegador**

Abre la consola y busca:
- ❌ Errores rojos
- ⚠️ Warnings amarillos
- Los logs específicos que agregamos:
  ```
  🔄 Intento 1/3: /api/profile?userId=...
  📡 Respuesta del servidor: 200 OK
  📊 Datos recibidos: {...}
  ```

### 3. **Probar el endpoint directamente**

En la consola del navegador:

```javascript
// Obtener tu userId
const userData = JSON.parse(localStorage.getItem('currentUser'));
console.log('Tu userId:', userData.id);

// Probar el endpoint
fetch(`/api/profile?userId=${userData.id}`)
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### 4. **Verificar credenciales de Supabase**

```javascript
// En la consola del navegador
console.log('Supabase URL:', localStorage.getItem('supabaseUrl'));
console.log('Tiene Anon Key:', !!localStorage.getItem('supabaseAnonKey'));
```

---

## 📊 Checklist de Verificación

Antes de marcar como resuelto, verifica:

### En Local:
- [ ] `npx netlify dev` funciona sin errores
- [ ] La página de perfil carga todos los datos
- [ ] Se ven logs de éxito en consola
- [ ] No hay errores 500 o 404

### En Producción:
- [ ] Variables de entorno configuradas en Netlify
- [ ] Deploy exitoso (sin errores de build)
- [ ] `/api/profile` responde 200 OK
- [ ] La página de perfil muestra todos los datos
- [ ] No hay errores en la consola del navegador

---

## 🆘 Solución de Problemas Comunes

### Error: "Base de datos no configurada"

**Causa**: Faltan variables de entorno en Netlify  
**Solución**: Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` están configuradas

### Error 404: "Usuario no encontrado"

**Causa**: El usuario no existe en la tabla `users` de Supabase  
**Solución**: 
1. Verifica que el usuario está registrado
2. Verifica el `userId` en localStorage
3. Si el problema persiste, ejecuta el sync:
   ```javascript
   // En consola del navegador
   window.profileManager.syncUserToDatabase(JSON.parse(localStorage.getItem('currentUser')))
   ```

### Los datos no se muestran pero no hay errores

**Causa**: Problema de timing o campos vacíos en BD  
**Solución**: 
1. Abre la consola y busca el log `📊 Datos recibidos:`
2. Verifica que los campos tienen valores
3. Si están vacíos, actualiza manualmente en Supabase

### Error: "window.supabase is not defined"

**Causa**: Script de Supabase no se cargó correctamente  
**Solución**:
1. Limpia caché del navegador (Ctrl+Shift+Del)
2. Recarga la página (Ctrl+F5)
3. Verifica que el script de Supabase está en el HTML

---

## 📝 Notas Técnicas

### Por qué usamos Supabase en lugar de PostgreSQL directo

1. **Consistencia**: Todo el proyecto usa Supabase
2. **Seguridad**: Service Role Key ya está configurada
3. **Mantenibilidad**: Más fácil de mantener
4. **Features**: Acceso a features de Supabase (RLS, Auth, etc.)

### Variables de entorno necesarias

```
SUPABASE_URL=https://[proyecto].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service role key)
SUPABASE_ANON_KEY=eyJ... (anon key)
```

**IMPORTANTE**: 
- `SERVICE_ROLE_KEY` se usa en el backend (bypasses RLS)
- `ANON_KEY` se usa en el frontend (respects RLS)

---

## 📚 Referencias

- [Documentación de Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

## ✅ Conclusión

Con estos cambios, el perfil debería cargar correctamente tanto en local como en producción. Los cambios principales fueron:

1. ✅ Migrar de PostgreSQL directo a Supabase
2. ✅ Mejorar el timing de carga de credenciales
3. ✅ Agregar logging detallado para debugging

Si encuentras algún problema, revisa la sección de "Debugging en Producción" o contacta al equipo de desarrollo.

