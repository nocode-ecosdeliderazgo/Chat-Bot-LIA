# 🔐 PROMPT - DETECTAR USUARIO AUTENTICADO EN COMUNIDADES

## 🔴 PROBLEMA ESPECÍFICO IDENTIFICADO

### SITUACIÓN ACTUAL:
- ✅ **Usuario autenticado**: Se detecta correctamente en el **menú de perfil**
- ❌ **Comunidades no detectan usuario**: `session: null` en `community.html`
- ❌ **AuthSessionMissingError**: La página de comunidades no puede acceder a la sesión
- ❌ **Comunidades vacías**: `[]` porque RLS requiere autenticación

### DIAGNÓSTICO DEL LOG:
```
📊 DIAGNÓSTICO Session completa: null
📊 DIAGNÓSTICO Session error: null
⚠️ DIAGNÓSTICO: No hay sesión activa o usuario en sesión
👤 Usuario actual: No autenticado
```

**PERO** el menú de perfil SÍ funciona:
```
[PROFILE] ✅ Menú de perfil configurado correctamente
```

## 🎯 PROBLEMA RAÍZ

**Desincronización de autenticación**: El sistema de autenticación funciona en el menú de perfil pero no se comparte correctamente con el sistema de comunidades.

## 🛠️ SOLUCIONES ESPECÍFICAS

### ⚡ SOLUCIÓN 1: SINCRONIZAR AUTENTICACIÓN CON LOCALSTORAGE

**Archivo**: `src/scripts/community-database.js`

**MODIFICAR** el método `getCurrentUser()` para usar múltiples fuentes de autenticación:

```javascript
async getCurrentUser() {
    console.log('🔍 Obteniendo usuario actual...');
    
    try {
        // MÉTODO 1: Intentar desde Supabase auth
        if (this.supabase && this.supabase.auth) {
            console.log('✅ Supabase auth disponible');
            
            try {
                const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
                
                if (session?.user && !sessionError) {
                    console.log('✅ Usuario desde Supabase session:', session.user.email);
                    this.currentUser = session.user;
                    return session.user;
                }
            } catch (authError) {
                console.warn('⚠️ Error Supabase auth:', authError.message);
            }
        }
        
        // MÉTODO 2: Obtener desde localStorage (donde funciona el menú de perfil)
        console.log('🔄 Intentando obtener usuario desde localStorage...');
        
        const authSources = [
            'userData',
            'currentUser', 
            'user',
            'authUser',
            'userSession',
            'profile'
        ];
        
        for (const source of authSources) {
            try {
                const userData = localStorage.getItem(source);
                if (userData && userData !== 'null' && userData !== '') {
                    console.log(`✅ Usuario encontrado en localStorage.${source}:`, userData);
                    
                    const user = JSON.parse(userData);
                    if (user && (user.id || user.user_id || user.email)) {
                        console.log('✅ Usuario válido desde localStorage:', user);
                        
                        // Crear objeto de usuario compatible con Supabase
                        const supabaseUser = {
                            id: user.id || user.user_id || user.uid,
                            email: user.email,
                            user_metadata: user.user_metadata || {},
                            app_metadata: user.app_metadata || {},
                            created_at: user.created_at || new Date().toISOString()
                        };
                        
                        this.currentUser = supabaseUser;
                        
                        // IMPORTANTE: Sincronizar con Supabase auth
                        await this.syncUserWithSupabase(supabaseUser);
                        
                        return supabaseUser;
                    }
                }
            } catch (parseError) {
                console.warn(`⚠️ Error parseando ${source}:`, parseError);
                continue;
            }
        }
        
        // MÉTODO 3: Obtener desde sessionStorage
        console.log('🔄 Intentando obtener usuario desde sessionStorage...');
        
        for (const source of authSources) {
            try {
                const userData = sessionStorage.getItem(source);
                if (userData && userData !== 'null' && userData !== '') {
                    const user = JSON.parse(userData);
                    if (user && (user.id || user.email)) {
                        console.log('✅ Usuario encontrado en sessionStorage:', user);
                        this.currentUser = user;
                        return user;
                    }
                }
            } catch (parseError) {
                continue;
            }
        }
        
        // MÉTODO 4: Verificar variables globales
        console.log('🔄 Verificando variables globales de usuario...');
        
        const globalSources = [
            'window.currentUser',
            'window.user',
            'window.authUser',
            'window.userData'
        ];
        
        for (const source of globalSources) {
            try {
                const user = eval(source);
                if (user && (user.id || user.email)) {
                    console.log(`✅ Usuario encontrado en ${source}:`, user);
                    this.currentUser = user;
                    return user;
                }
            } catch (evalError) {
                continue;
            }
        }
        
        // MÉTODO 5: Crear endpoint para obtener sesión actual
        console.log('🔄 Intentando obtener usuario desde endpoint...');
        try {
            const response = await fetch('/api/user/session', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const sessionData = await response.json();
                if (sessionData.success && sessionData.user) {
                    console.log('✅ Usuario obtenido desde endpoint:', sessionData.user);
                    this.currentUser = sessionData.user;
                    
                    // Guardar en localStorage para futuras consultas
                    localStorage.setItem('userData', JSON.stringify(sessionData.user));
                    
                    return sessionData.user;
                }
            }
        } catch (endpointError) {
            console.warn('⚠️ Error obteniendo usuario desde endpoint:', endpointError);
        }
        
        console.log('❌ No se pudo obtener usuario por ningún método');
        this.currentUser = null;
        return null;
        
    } catch (error) {
        console.error('❌ Error crítico obteniendo usuario:', error);
        this.currentUser = null;
        return null;
    }
}

// NUEVA función para sincronizar usuario con Supabase
async syncUserWithSupabase(user) {
    try {
        console.log('🔄 Sincronizando usuario con Supabase auth...');
        
        if (!this.supabase || !this.supabase.auth) {
            console.warn('⚠️ Supabase auth no disponible para sincronización');
            return;
        }
        
        // Intentar establecer sesión en Supabase si tenemos token
        const authToken = localStorage.getItem('authToken') || 
                         localStorage.getItem('access_token') ||
                         localStorage.getItem('supabase.auth.token');
        
        if (authToken) {
            console.log('🔑 Intentando establecer sesión con token...');
            
            try {
                const { data, error } = await this.supabase.auth.setSession({
                    access_token: authToken,
                    refresh_token: localStorage.getItem('refresh_token') || authToken
                });
                
                if (data.session && !error) {
                    console.log('✅ Sesión establecida en Supabase:', data.session.user.email);
                    return data.session.user;
                }
            } catch (setSessionError) {
                console.warn('⚠️ Error estableciendo sesión:', setSessionError);
            }
        }
        
        console.log('ℹ️ Continuando sin sincronización de sesión Supabase');
        
    } catch (error) {
        console.error('❌ Error sincronizando con Supabase:', error);
    }
}
```

### ⚡ SOLUCIÓN 2: CREAR ENDPOINT PARA OBTENER SESIÓN ACTUAL

**Archivo**: `netlify/functions/get-user-session.js`

**VERIFICAR** que este endpoint existe y funciona correctamente:

```javascript
// Este endpoint debería devolver el usuario actual autenticado
exports.handler = async (event, context) => {
    try {
        // Obtener headers de autenticación
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const cookies = event.headers.cookie;
        
        console.log('🔍 Verificando autenticación del usuario...');
        
        // Verificar token en header
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            // Verificar token con Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);
            
            if (user && !error) {
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: true,
                        user: user,
                        authenticated: true
                    })
                };
            }
        }
        
        // Verificar cookies de sesión
        if (cookies) {
            // Buscar cookie de sesión de Supabase
            const sessionCookie = cookies.split(';')
                .find(cookie => cookie.trim().startsWith('sb-') || cookie.trim().startsWith('supabase-auth-token'));
            
            if (sessionCookie) {
                // Procesar cookie de sesión
                // ... lógica para verificar cookie
            }
        }
        
        // No hay usuario autenticado
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                user: null,
                authenticated: false,
                message: 'No authenticated user found'
            })
        };
        
    } catch (error) {
        console.error('Error verificando sesión:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
```

### ⚡ SOLUCIÓN 3: VERIFICAR DATOS DE USUARIO EN LOCALSTORAGE

**Archivo**: `src/Community/community.js`

**AGREGAR** función de debug para verificar datos de usuario:

```javascript
// AGREGAR esta función para debugging
debugUserAuthentication() {
    console.log('🔍 === DEBUG AUTENTICACIÓN DE USUARIO ===');
    
    // Verificar localStorage
    console.log('📊 LocalStorage:');
    const localStorageKeys = ['userData', 'currentUser', 'user', 'authToken', 'userSession'];
    localStorageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`  ${key}:`, value ? 'Presente' : 'Ausente', value?.substring(0, 50) + '...');
    });
    
    // Verificar sessionStorage
    console.log('📊 SessionStorage:');
    localStorageKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        console.log(`  ${key}:`, value ? 'Presente' : 'Ausente');
    });
    
    // Verificar variables globales
    console.log('📊 Variables globales:');
    console.log('  window.currentUser:', window.currentUser);
    console.log('  window.user:', window.user);
    console.log('  window.userData:', window.userData);
    
    // Verificar estado de Supabase
    console.log('📊 Estado Supabase:');
    console.log('  window.supabase:', !!window.supabase);
    console.log('  window.supabaseInitialized:', window.supabaseInitialized);
    
    if (window.supabase && window.supabase.auth) {
        window.supabase.auth.getSession().then(({ data: { session }, error }) => {
            console.log('  Supabase session:', session);
            console.log('  Supabase session error:', error);
        });
    }
    
    console.log('🔍 === FIN DEBUG AUTENTICACIÓN ===');
}
```

**LLAMAR** esta función al inicio de `init()`:

```javascript
async init() {
    try {
        console.log('[COMMUNITY] 🚀 Iniciando sistema de comunidades...');
        
        // AGREGAR: Debug de autenticación
        this.debugUserAuthentication();
        
        // Resto del código...
```

### ⚡ SOLUCIÓN 4: CREAR FUNCIÓN PARA OBTENER USUARIO DESDE MÚLTIPLES FUENTES

**Archivo**: `src/utils/auth-utils.js` (crear si no existe)

```javascript
// Utilidad para obtener usuario autenticado desde múltiples fuentes
class AuthUtils {
    
    static async getCurrentAuthenticatedUser() {
        console.log('🔍 AuthUtils: Buscando usuario autenticado...');
        
        // 1. Verificar localStorage
        const localUser = this.getUserFromLocalStorage();
        if (localUser) {
            console.log('✅ Usuario encontrado en localStorage:', localUser.email);
            return localUser;
        }
        
        // 2. Verificar sessionStorage
        const sessionUser = this.getUserFromSessionStorage();
        if (sessionUser) {
            console.log('✅ Usuario encontrado en sessionStorage:', sessionUser.email);
            return sessionUser;
        }
        
        // 3. Verificar endpoint de sesión
        const endpointUser = await this.getUserFromEndpoint();
        if (endpointUser) {
            console.log('✅ Usuario encontrado desde endpoint:', endpointUser.email);
            return endpointUser;
        }
        
        // 4. Verificar Supabase directamente
        const supabaseUser = await this.getUserFromSupabase();
        if (supabaseUser) {
            console.log('✅ Usuario encontrado en Supabase:', supabaseUser.email);
            return supabaseUser;
        }
        
        console.log('❌ No se encontró usuario autenticado por ningún método');
        return null;
    }
    
    static getUserFromLocalStorage() {
        const sources = ['userData', 'currentUser', 'user', 'authUser', 'userProfile'];
        
        for (const source of sources) {
            try {
                const data = localStorage.getItem(source);
                if (data && data !== 'null') {
                    const user = JSON.parse(data);
                    if (user && (user.id || user.email)) {
                        return user;
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        return null;
    }
    
    static getUserFromSessionStorage() {
        const sources = ['userData', 'currentUser', 'user'];
        
        for (const source of sources) {
            try {
                const data = sessionStorage.getItem(source);
                if (data && data !== 'null') {
                    const user = JSON.parse(data);
                    if (user && (user.id || user.email)) {
                        return user;
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        return null;
    }
    
    static async getUserFromEndpoint() {
        try {
            const response = await fetch('/api/user/session', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.user : null;
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo usuario desde endpoint:', error);
        }
        
        return null;
    }
    
    static async getUserFromSupabase() {
        try {
            if (window.supabase && window.supabase.auth) {
                const { data: { user }, error } = await window.supabase.auth.getUser();
                return user && !error ? user : null;
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo usuario desde Supabase:', error);
        }
        
        return null;
    }
}

// Hacer disponible globalmente
window.AuthUtils = AuthUtils;
```

### ⚡ SOLUCIÓN 5: USAR AUTHUTILS EN COMMUNITY-DATABASE

**Archivo**: `src/scripts/community-database.js`

**REEMPLAZAR** el método `getCurrentUser()` con:

```javascript
async getCurrentUser() {
    console.log('🔍 Obteniendo usuario actual...');
    
    try {
        // Usar AuthUtils si está disponible
        if (window.AuthUtils) {
            const user = await window.AuthUtils.getCurrentAuthenticatedUser();
            if (user) {
                console.log('✅ Usuario obtenido via AuthUtils:', user.email);
                this.currentUser = user;
                return user;
            }
        }
        
        // Fallback al método original
        // ... resto del código actual ...
        
    } catch (error) {
        console.error('❌ Error obteniendo usuario:', error);
        this.currentUser = null;
        return null;
    }
}
```

### ⚡ SOLUCIÓN 6: CARGAR AUTH-UTILS EN COMMUNITY.HTML

**Archivo**: `src/Community/community.html`

**AGREGAR** antes de `community-database.js`:

```html
<!-- Auth Utils - Sistema de autenticación unificado -->
<script src="../utils/auth-utils.js"></script>
<script src="../scripts/community-database.js"></script>
```

### ⚡ SOLUCIÓN 7: VERIFICAR TABLA USERS EN SUPABASE

**CONSULTA SQL** para verificar estructura de tabla `users`:

```sql
-- Verificar estructura de tabla users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- Verificar datos de usuarios
SELECT id, email, created_at, updated_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar políticas RLS en tabla users
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## 🔍 ORDEN DE EJECUCIÓN RECOMENDADO

1. **PRIMERO**: Agregar función de debug para ver qué datos de usuario existen
2. **SEGUNDO**: Crear AuthUtils para unificar obtención de usuario
3. **TERCERO**: Modificar community-database.js para usar AuthUtils
4. **CUARTO**: Verificar endpoint /api/user/session
5. **QUINTO**: Probar carga de comunidades con usuario detectado

## ✅ RESULTADO ESPERADO

### Console Log con Usuario Detectado:
```
🔍 Obteniendo usuario actual...
✅ Usuario encontrado en localStorage.userData: {"id":"...","email":"user@example.com"}
✅ Usuario válido desde localStorage: {id: "...", email: "user@example.com"}
✅ Usuario obtenido via AuthUtils: user@example.com
👤 Usuario actual: user@example.com
🏘️ Comunidades cargadas: [4 comunidades]
```

### Interfaz mostrando:
- ✅ **Usuario detectado** en sistema de comunidades
- ✅ **4 comunidades cargadas** desde base de datos
- ✅ **Sin AuthSessionMissingError**
- ✅ **Sincronización completa** entre menú y comunidades

## 🗄️ TABLA USERS REFERENCIADA

**Tabla**: `public.users`
**Campos esperados**:
- `id` (uuid) - Primary key
- `email` (text) - Email del usuario
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- Otros campos según tu estructura

---

**🔑 NOTA CLAVE**: El problema es que el menú de perfil y la página de comunidades usan diferentes métodos para obtener el usuario. La solución unifica ambos sistemas usando AuthUtils.
