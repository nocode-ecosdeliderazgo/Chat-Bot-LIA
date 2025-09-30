# PROMPT: Solución de Error PGRST116 - Usuario No Encontrado

## 🚨 **Problema Identificado**

```
Error: PGRST116 - Cannot coerce the result to a single JSON object
Details: The result contains 0 rows
```

**Causa**: La consulta a la tabla `users` no encuentra el usuario con el ID proporcionado.

## 🔍 **Análisis del Error**

### **Logs del Error:**
```
🔥 Click detectado en tarjeta! null
[PROFILE] UserId obtenido: 390e28e4-fae6-4202-8faa-2fda82d05017
[PROFILE] Abriendo perfil de usuario: 390e28e4-fae6-4202-8faa-2fda82d05017
GET https://miwbzotcuaywpdbidpwo.supabase.co/rest/v1/users?select=...&id=eq.390e28e4-fae6-4202-8faa-2fda82d05017 406 (Not Acceptable)
[PROFILE ERROR] Error obteniendo datos del usuario: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'Cannot coerce the result to a single JSON object'}
```

### **Problemas Identificados:**
1. **Usuario no existe** en la tabla `users` con ese ID
2. **ID incorrecto** - posiblemente el ID de la tarjeta no coincide con el ID real del usuario
3. **Problema de mapeo** entre `community_members` y `users`

---

## 🎯 **Objetivo**
Corregir la consulta para obtener correctamente los datos del usuario desde la base de datos.

---

## 🔧 **Soluciones Requeridas**

### **Solución 1: Verificar y Corregir el Mapeo de IDs**

#### **Problema Actual:**
```javascript
// PROBLEMA: El ID de la tarjeta puede no ser el ID del usuario
const userId = this.dataset.userId; // Puede ser user_id de community_members
```

#### **Solución:**
```javascript
// CORREGIR: Función para obtener el ID correcto del usuario
async function getCorrectUserId(memberId) {
    try {
        // Primero intentar obtener desde community_members
        const { data: memberData, error: memberError } = await window.supabase
            .from('community_members')
            .select('user_id, id')
            .eq('id', memberId)
            .single();

        if (memberError) {
            console.error('Error obteniendo miembro:', memberError);
            return null;
        }

        // Retornar el user_id real
        return memberData.user_id;
        
    } catch (error) {
        console.error('Error en getCorrectUserId:', error);
        return null;
    }
}

// CORREGIR: Función principal para obtener datos del usuario
async function getUserData(memberId) {
    if (!memberId) {
        profileError('ID de miembro no proporcionado');
        return null;
    }
    
    try {
        // Obtener el ID correcto del usuario
        const userId = await getCorrectUserId(memberId);
        
        if (!userId) {
            profileError('No se pudo obtener el ID del usuario');
            return null;
        }
        
        profileLog('ID del usuario obtenido:', userId);
        
        // Ahora consultar la tabla users con el ID correcto
        const { data: userData, error } = await window.supabase
            .from('users')
            .select(`
                id, username, email, first_name, last_name, display_name,
                cargo_rol, type_rol, bio, location, phone, profile_picture_url,
                curriculum_url, linkedin_url, github_url, website_url,
                points, created_at, updated_at, last_login_at, email_verified
            `)
            .eq('id', userId)
            .single();

        if (error) {
            profileError('Error obteniendo datos del usuario:', error);
            return null;
        }
        
        profileLog('Datos del usuario obtenidos:', userData);
        return userData;
        
    } catch (error) {
        profileError('Error en getUserData:', error);
        return null;
    }
}
```

### **Solución 2: Consulta Alternativa con JOIN**

#### **Si la Solución 1 no funciona:**
```javascript
// ALTERNATIVA: Consulta con JOIN para obtener datos del usuario
async function getUserDataWithJoin(memberId) {
    try {
        const { data: userData, error } = await window.supabase
            .from('community_members')
            .select(`
                user_id,
                users!inner(
                    id, username, email, first_name, last_name, display_name,
                    cargo_rol, type_rol, bio, location, phone, profile_picture_url,
                    curriculum_url, linkedin_url, github_url, website_url,
                    points, created_at, updated_at, last_login_at, email_verified
                )
            `)
            .eq('id', memberId)
            .single();

        if (error) {
            profileError('Error en consulta con JOIN:', error);
            return null;
        }
        
        // Retornar solo los datos del usuario
        return userData.users;
        
    } catch (error) {
        profileError('Error en getUserDataWithJoin:', error);
        return null;
    }
}
```

### **Solución 3: Validación y Fallback**

#### **Sistema de Validación Robusto:**
```javascript
// AGREGAR: Función de validación de datos
function validateUserData(userData) {
    if (!userData) return false;
    
    // Verificar campos mínimos requeridos
    const requiredFields = ['id', 'username'];
    const hasRequiredFields = requiredFields.every(field => userData[field]);
    
    if (!hasRequiredFields) {
        profileError('Datos de usuario incompletos:', userData);
        return false;
    }
    
    return true;
}

// AGREGAR: Función con múltiples estrategias
async function getUserDataRobust(memberId) {
    if (!memberId) {
        profileError('ID de miembro no proporcionado');
        return null;
    }
    
    try {
        // Estrategia 1: Obtener user_id desde community_members
        const userId = await getCorrectUserId(memberId);
        if (userId) {
            const userData = await getUserDataDirect(userId);
            if (userData && validateUserData(userData)) {
                return userData;
            }
        }
        
        // Estrategia 2: Consulta con JOIN
        const userDataJoin = await getUserDataWithJoin(memberId);
        if (userDataJoin && validateUserData(userDataJoin)) {
            return userDataJoin;
        }
        
        // Estrategia 3: Consulta directa con el ID original
        const userDataDirect = await getUserDataDirect(memberId);
        if (userDataDirect && validateUserData(userDataDirect)) {
            return userDataDirect;
        }
        
        profileError('No se pudieron obtener datos del usuario con ninguna estrategia');
        return null;
        
    } catch (error) {
        profileError('Error en getUserDataRobust:', error);
        return null;
    }
}

// AGREGAR: Función de consulta directa
async function getUserDataDirect(userId) {
    try {
        const { data: userData, error } = await window.supabase
            .from('users')
            .select(`
                id, username, email, first_name, last_name, display_name,
                cargo_rol, type_rol, bio, location, phone, profile_picture_url,
                curriculum_url, linkedin_url, github_url, website_url,
                points, created_at, updated_at, last_login_at, email_verified
            `)
            .eq('id', userId)
            .single();

        if (error) {
            profileError('Error en consulta directa:', error);
            return null;
        }
        
        return userData;
        
    } catch (error) {
        profileError('Error en getUserDataDirect:', error);
        return null;
    }
}
```

---

## 📋 **Implementación Paso a Paso**

### **Paso 1: Reemplazar la función getUserData existente**

```javascript
// REEMPLAZAR: La función getUserData actual con esta versión corregida
async function getUserData(memberId) {
    if (!memberId) {
        profileError('ID de miembro no proporcionado');
        return null;
    }
    
    try {
        // Obtener el ID correcto del usuario
        const userId = await getCorrectUserId(memberId);
        
        if (!userId) {
            profileError('No se pudo obtener el ID del usuario');
            return null;
        }
        
        profileLog('ID del usuario obtenido:', userId);
        
        // Consultar la tabla users con el ID correcto
        const { data: userData, error } = await window.supabase
            .from('users')
            .select(`
                id, username, email, first_name, last_name, display_name,
                cargo_rol, type_rol, bio, location, phone, profile_picture_url,
                curriculum_url, linkedin_url, github_url, website_url,
                points, created_at, updated_at, last_login_at, email_verified
            `)
            .eq('id', userId)
            .single();

        if (error) {
            profileError('Error obteniendo datos del usuario:', error);
            return null;
        }
        
        profileLog('Datos del usuario obtenidos:', userData);
        return userData;
        
    } catch (error) {
        profileError('Error en getUserData:', error);
        return null;
    }
}

// AGREGAR: Función helper para obtener el ID correcto
async function getCorrectUserId(memberId) {
    try {
        // Obtener desde community_members
        const { data: memberData, error: memberError } = await window.supabase
            .from('community_members')
            .select('user_id, id')
            .eq('id', memberId)
            .single();

        if (memberError) {
            profileError('Error obteniendo miembro:', memberError);
            return null;
        }

        profileLog('Datos del miembro obtenidos:', memberData);
        return memberData.user_id;
        
    } catch (error) {
        profileError('Error en getCorrectUserId:', error);
        return null;
    }
}
```

### **Paso 2: Agregar logging adicional para debug**

```javascript
// AGREGAR: Logging detallado para debug
function debugMemberCard(memberId) {
    console.log('🔍 DEBUG - ID de miembro recibido:', memberId);
    console.log('🔍 DEBUG - Tipo de ID:', typeof memberId);
    console.log('🔍 DEBUG - Elemento de tarjeta:', document.querySelector(`[data-user-id="${memberId}"]`));
}
```

### **Paso 3: Verificar el HTML de las tarjetas**

```html
<!-- VERIFICAR: Que las tarjetas tengan el ID correcto -->
<div class="member-card" data-user-id="${m.id}" style="cursor: pointer;">
    <!-- contenido existente -->
</div>

<!-- O si el ID correcto es user_id: -->
<div class="member-card" data-user-id="${m.user_id}" style="cursor: pointer;">
    <!-- contenido existente -->
</div>
```

---

## 🔍 **Diagnóstico Adicional**

### **Verificar en la consola del navegador:**
```javascript
// EJECUTAR: Para verificar la estructura de datos
console.log('Estructura de miembros:', members);
console.log('Primer miembro:', members[0]);
console.log('IDs disponibles:', members.map(m => ({ id: m.id, user_id: m.user_id })));
```

### **Verificar en Supabase:**
```sql
-- EJECUTAR: Para verificar que el usuario existe
SELECT id, username, email FROM users WHERE id = '390e28e4-fae6-4202-8faa-2fda82d05017';

-- EJECUTAR: Para verificar la relación con community_members
SELECT cm.id, cm.user_id, u.username 
FROM community_members cm 
JOIN users u ON cm.user_id = u.id 
WHERE cm.id = '390e28e4-fae6-4202-8faa-2fda82d05017';
```

---

## ✅ **Checklist de Corrección**

- [ ] Reemplazar función `getUserData` con la versión corregida
- [ ] Agregar función `getCorrectUserId`
- [ ] Verificar que las tarjetas tienen el ID correcto
- [ ] Agregar logging adicional para debug
- [ ] Probar que se obtienen los datos del usuario
- [ ] Verificar que no hay más errores PGRST116
- [ ] Probar en diferentes usuarios

---

## 🚨 **IMPORTANTE**

- **NO ELIMINAR** la lógica existente
- **SOLO REEMPLAZAR** la función `getUserData`
- **AGREGAR** las funciones helper necesarias
- **MANTENER** toda la funcionalidad actual
- **PROBAR** que todo funciona después de los cambios

El problema principal es que estamos consultando la tabla `users` con un ID que pertenece a `community_members`, necesitamos hacer la consulta correcta para obtener el `user_id` real.
