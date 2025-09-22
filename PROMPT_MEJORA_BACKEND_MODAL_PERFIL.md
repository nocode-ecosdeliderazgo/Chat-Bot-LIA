# PROMPT: Corrección Completa del Backend del Modal de Perfil de Usuario

## 🚨 PROBLEMA CRÍTICO IDENTIFICADO

**TODA LA INFORMACIÓN DEL MODAL ESTÁ HARDCODEADA Y NO SE CONECTA CON LA BASE DE DATOS REAL**

### ❌ **Elementos Completamente Hardcodeados (NO FUNCIONAN):**
- **Liga Inferior**: Muestra "Oro" hardcodeado (NO es la liga real del usuario)
- **Ranking**: Muestra "#15 de 150" hardcodeado (NO es el ranking real)
- **Última vez visto**: Muestra "hace 2 horas" hardcodeado (NO es el tiempo real)
- **Posts realizados**: Muestra "5 posts realizados" hardcodeado (NO es el conteo real)
- **Miembro desde**: Muestra "Marzo 2024" hardcodeado (NO es la fecha real de `created_at`)
- **Biografía**: NO se muestra (debería mostrar campo `bio` de la BD)
- **Cargo en la empresa**: NO se muestra (debería mostrar campo `cargo_rol` de la BD)

### ⚠️ **VERIFICACIÓN REQUERIDA:**
- **Puntos**: Verificar si realmente está conectado a `users.points`
- **Liga Superior**: Verificar si realmente está conectado a `users.type_rol`
- **Imagen de perfil**: Verificar si está conectada a `users.profile_picture_url`

## Estructura de Base de Datos Disponible

### Tabla `users` (Información Principal del Usuario)
```sql
- id: uuid (PK)
- username: citext
- email: citext
- first_name: text
- last_name: text
- display_name: text
- bio: text ⭐ (Para biografía)
- cargo_rol: text ⭐ (Para cargo en la empresa)
- type_rol: text ⭐ (Para liga superior)
- points: int4 ⭐ (Para puntos)
- last_login_at: timestamptz ⭐ (Para última vez visto)
- profile_picture_url: text
- created_at: timestamptz
- updated_at: timestamptz
```

### Tabla `community_posts` (Para Posts Realizados)
```sql
- id: uuid (PK)
- user_id: uuid (FK a users.id)
- title: text
- content: text
- created_at: timestamptz
- updated_at: timestamptz
```

### Tabla `community_members` (Para Información de Comunidad)
```sql
- id: uuid (PK)
- user_id: uuid (FK a users.id)
- community_id: uuid (FK a communities.id)
- role: text ⭐ (Para cargo específico en comunidad)
- joined_at: timestamptz
- is_active: bool
```

## 🔧 REQUERIMIENTOS CRÍTICOS DE IMPLEMENTACIÓN

### 1. **🚨 VERIFICACIÓN COMPLETA DE CONEXIÓN A BD**
**ANTES DE CUALQUIER IMPLEMENTACIÓN, VERIFICAR QUE TODOS LOS DATOS SEAN REALES:**

```javascript
// FUNCIÓN DE VERIFICACIÓN OBLIGATORIA
async function verifyUserData(userId) {
  const user = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  console.log('🔍 DATOS REALES DEL USUARIO:', user.data);
  return user.data;
}
```

### 2. **📝 Biografía del Usuario (FALTANTE)**
- **Fuente**: Campo `bio` de la tabla `users`
- **Implementación**: Agregar sección en "Información Personal"
- **Verificación**: `console.log(user.bio)` para confirmar que se obtiene
- **Fallback**: Si está vacío, mostrar "No hay biografía disponible"

### 3. **💼 Cargo dentro de la Empresa (FALTANTE)**
- **Fuente**: Campo `cargo_rol` de la tabla `users`
- **Implementación**: Agregar en "Información Personal"
- **Verificación**: `console.log(user.cargo_rol)` para confirmar que se obtiene
- **Fallback**: Si está vacío, mostrar "Cargo no especificado"

### 4. **🏆 Liga Inferior (HARDCODEADA - CORREGIR)**
- **Problema**: Muestra "Oro" hardcodeado
- **Solución**: Calcular liga real basada en puntos del usuario
- **Implementación OBLIGATORIA**:
  ```javascript
  function getRealLeagueFromPoints(points) {
    console.log('🎯 PUNTOS REALES DEL USUARIO:', points);
    if (points >= 2000) return "Diamante";
    if (points >= 1500) return "Platino";
    if (points >= 1000) return "Oro";
    if (points >= 500) return "Plata";
    return "Bronce";
  }
  ```

### 5. **📊 Ranking del Usuario (HARDCODEADO - CORREGIR)**
- **Problema**: Muestra "#15 de 150" hardcodeado
- **Solución**: Calcular ranking real basado en puntos de TODOS los usuarios
- **Implementación OBLIGATORIA**:
  ```sql
  -- Query para obtener ranking REAL del usuario
  WITH user_ranking AS (
    SELECT 
      id,
      points,
      RANK() OVER (ORDER BY points DESC) as user_rank,
      COUNT(*) OVER() as total_users
    FROM users
    WHERE points IS NOT NULL
  )
  SELECT user_rank, total_users
  FROM user_ranking
  WHERE id = $1;
  ```

### 6. **⏰ Última Vez Visto (HARDCODEADO - CORREGIR)**
- **Problema**: Muestra "hace 2 horas" hardcodeado
- **Fuente**: Campo `last_login_at` de la tabla `users`
- **Implementación OBLIGATORIA**:
  ```javascript
  function getRealTimeAgo(lastLoginAt) {
    console.log('🕐 ÚLTIMO LOGIN REAL:', lastLoginAt);
    if (!lastLoginAt) return "Nunca ha iniciado sesión";
    
    const now = new Date();
    const lastSeen = new Date(lastLoginAt);
    const diffInHours = Math.floor((now - lastSeen) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "hace menos de 1 hora";
    if (diffInHours < 24) return `hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays} días`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `hace ${diffInWeeks} semanas`;
  }
  ```

### 7. **📝 Posts Realizados (HARDCODEADO - CORREGIR)**
- **Problema**: Muestra "5 posts realizados" hardcodeado
- **Fuente**: Contar registros REALES en `community_posts` por `user_id`
- **Implementación OBLIGATORIA**:
  ```sql
  SELECT COUNT(*) as real_post_count
  FROM community_posts
  WHERE user_id = $1;
  ```

### 8. **📅 Miembro Desde (HARDCODEADO - CORREGIR)**
- **Problema**: Muestra "Marzo 2024" hardcodeado
- **Fuente**: Campo `created_at` de la tabla `users`
- **Implementación OBLIGATORIA**:
  ```javascript
  function getRealMemberSince(createdAt) {
    console.log('📅 FECHA REAL DE REGISTRO:', createdAt);
    const date = new Date(createdAt);
    const month = date.toLocaleString('es-ES', { month: 'long' });
    const year = date.getFullYear();
    return `Miembro desde ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  }
  ```

## 🚨 ENDPOINT CRÍTICO - VERIFICACIÓN COMPLETA

### **GET /api/user/profile/{userId} - ENDPOINT PRINCIPAL**
**ESTE ENDPOINT DEBE RETORNAR TODOS LOS DATOS REALES DE LA BD:**

```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "display_name": "string",
    "bio": "string", // ⭐ OBLIGATORIO - Campo bio de la BD
    "cargo_rol": "string", // ⭐ OBLIGATORIO - Campo cargo_rol de la BD
    "type_rol": "string", // ⭐ OBLIGATORIO - Para liga superior
    "points": "number", // ⭐ OBLIGATORIO - Campo points de la BD
    "last_login_at": "timestamp", // ⭐ OBLIGATORIO - Para última vez visto
    "profile_picture_url": "string",
    "created_at": "timestamp" // ⭐ OBLIGATORIO - Para "miembro desde"
  },
  "stats": {
    "league": "string", // ⭐ CALCULADO - Liga real basada en puntos
    "ranking": {
      "position": "number", // ⭐ CALCULADO - Ranking real
      "total_users": "number" // ⭐ CALCULADO - Total de usuarios
    },
    "posts_count": "number", // ⭐ CALCULADO - Conteo real de posts
    "last_seen": "string", // ⭐ CALCULADO - Tiempo real desde last_login_at
    "member_since": "string" // ⭐ CALCULADO - Fecha real desde created_at
  }
}
```

### **IMPLEMENTACIÓN OBLIGATORIA DEL ENDPOINT:**

```javascript
// Backend - Endpoint completo
app.get('/api/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 1. Obtener datos del usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
    // 2. Obtener conteo real de posts
    const { count: postsCount, error: postsError } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (postsError) throw postsError;
    
    // 3. Obtener ranking real
    const { data: rankingData, error: rankingError } = await supabase
      .rpc('get_user_ranking', { user_id: userId });
      
    if (rankingError) throw rankingError;
    
    // 4. Calcular liga real
    const realLeague = getRealLeagueFromPoints(user.points);
    
    // 5. Calcular tiempo transcurrido
    const realLastSeen = getRealTimeAgo(user.last_login_at);
    
    // 6. Calcular fecha de membresía
    const realMemberSince = getRealMemberSince(user.created_at);
    
    // 7. Retornar datos REALES
    res.json({
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        bio: user.bio, // ⭐ DATO REAL
        cargo_rol: user.cargo_rol, // ⭐ DATO REAL
        type_rol: user.type_rol,
        points: user.points, // ⭐ DATO REAL
        last_login_at: user.last_login_at, // ⭐ DATO REAL
        profile_picture_url: user.profile_picture_url,
        created_at: user.created_at // ⭐ DATO REAL
      },
      stats: {
        league: realLeague, // ⭐ CALCULADO REAL
        ranking: {
          position: rankingData.user_rank, // ⭐ CALCULADO REAL
          total_users: rankingData.total_users // ⭐ CALCULADO REAL
        },
        posts_count: postsCount, // ⭐ CALCULADO REAL
        last_seen: realLastSeen, // ⭐ CALCULADO REAL
        member_since: realMemberSince // ⭐ CALCULADO REAL
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR EN ENDPOINT:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
});
```

## 🎯 IMPLEMENTACIÓN FRONTEND - ELIMINAR HARDCODE

### 1. **🚨 ACTUALIZAR MODAL DE PERFIL - ELIMINAR TODOS LOS HARDCODES**

```javascript
// FUNCIÓN PRINCIPAL PARA CARGAR DATOS REALES
async function loadRealUserProfile(userId) {
  try {
    console.log('🔄 Cargando datos REALES del usuario:', userId);
    
    const response = await fetch(`/api/user/profile/${userId}`);
    const data = await response.json();
    
    console.log('✅ DATOS REALES OBTENIDOS:', data);
    
    // Actualizar TODOS los elementos con datos reales
    updateProfileModal(data);
    
  } catch (error) {
    console.error('❌ ERROR AL CARGAR PERFIL:', error);
  }
}

// FUNCIÓN PARA ACTUALIZAR EL MODAL CON DATOS REALES
function updateProfileModal(data) {
  const { user, stats } = data;
  
  // 1. ⭐ BIOGRAFÍA (FALTANTE - AGREGAR)
  const bioElement = document.getElementById('user-bio');
  if (bioElement) {
    bioElement.textContent = user.bio || 'No hay biografía disponible';
  }
  
  // 2. ⭐ CARGO EN LA EMPRESA (FALTANTE - AGREGAR)
  const cargoElement = document.getElementById('user-cargo');
  if (cargoElement) {
    cargoElement.textContent = user.cargo_rol || 'Cargo no especificado';
  }
  
  // 3. ⭐ LIGA INFERIOR (HARDCODEADA - CORREGIR)
  const leagueElement = document.getElementById('user-league');
  if (leagueElement) {
    leagueElement.textContent = stats.league; // ⭐ DATO REAL
  }
  
  // 4. ⭐ RANKING (HARDCODEADO - CORREGIR)
  const rankingElement = document.getElementById('user-ranking');
  if (rankingElement) {
    rankingElement.textContent = `#${stats.ranking.position} de ${stats.ranking.total_users}`; // ⭐ DATO REAL
  }
  
  // 5. ⭐ ÚLTIMA VEZ VISTO (HARDCODEADO - CORREGIR)
  const lastSeenElement = document.getElementById('user-last-seen');
  if (lastSeenElement) {
    lastSeenElement.textContent = stats.last_seen; // ⭐ DATO REAL
  }
  
  // 6. ⭐ POSTS REALIZADOS (HARDCODEADO - CORREGIR)
  const postsElement = document.getElementById('user-posts');
  if (postsElement) {
    postsElement.textContent = `${stats.posts_count} posts realizados`; // ⭐ DATO REAL
  }
  
  // 7. ⭐ MIEMBRO DESDE (HARDCODEADO - CORREGIR)
  const memberSinceElement = document.getElementById('user-member-since');
  if (memberSinceElement) {
    memberSinceElement.textContent = stats.member_since; // ⭐ DATO REAL
  }
  
  // 8. ⭐ PUNTOS (VERIFICAR SI ESTÁ CONECTADO)
  const pointsElement = document.getElementById('user-points');
  if (pointsElement) {
    pointsElement.textContent = user.points; // ⭐ DATO REAL
  }
  
  // 9. ⭐ LIGA SUPERIOR (VERIFICAR SI ESTÁ CONECTADO)
  const topLeagueElement = document.getElementById('user-top-league');
  if (topLeagueElement) {
    topLeagueElement.textContent = user.type_rol; // ⭐ DATO REAL
  }
}
```

### 2. **🔧 FUNCIONES DE UTILIDAD - VERSIÓN CORREGIDA**

```javascript
// ⭐ FUNCIÓN CORREGIDA - Calcular tiempo transcurrido REAL
function getRealTimeAgo(lastLoginAt) {
  console.log('🕐 ÚLTIMO LOGIN REAL:', lastLoginAt);
  
  if (!lastLoginAt) return "Nunca ha iniciado sesión";
  
  const now = new Date();
  const lastSeen = new Date(lastLoginAt);
  const diffInHours = Math.floor((now - lastSeen) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "hace menos de 1 hora";
  if (diffInHours < 24) return `hace ${diffInHours} horas`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `hace ${diffInDays} días`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `hace ${diffInWeeks} semanas`;
}

// ⭐ FUNCIÓN CORREGIDA - Determinar liga REAL basada en puntos
function getRealLeagueFromPoints(points) {
  console.log('🎯 PUNTOS REALES DEL USUARIO:', points);
  
  if (points >= 2000) return "Diamante";
  if (points >= 1500) return "Platino";
  if (points >= 1000) return "Oro";
  if (points >= 500) return "Plata";
  return "Bronce";
}

// ⭐ FUNCIÓN CORREGIDA - Calcular fecha de membresía REAL
function getRealMemberSince(createdAt) {
  console.log('📅 FECHA REAL DE REGISTRO:', createdAt);
  
  const date = new Date(createdAt);
  const month = date.toLocaleString('es-ES', { month: 'long' });
  const year = date.getFullYear();
  return `Miembro desde ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}
```

### 3. **🚨 VERIFICACIÓN OBLIGATORIA EN CONSOLA**

```javascript
// FUNCIÓN DE VERIFICACIÓN - EJECUTAR AL CARGAR EL MODAL
function verifyRealData(userId) {
  console.log('🔍 VERIFICANDO DATOS REALES PARA USUARIO:', userId);
  
  // Verificar que se están obteniendo datos reales
  loadRealUserProfile(userId).then(() => {
    console.log('✅ VERIFICACIÓN COMPLETADA - TODOS LOS DATOS SON REALES');
  }).catch((error) => {
    console.error('❌ ERROR EN VERIFICACIÓN:', error);
  });
}
```

## Validaciones y Manejo de Errores

### 1. **Datos Faltantes**
- Manejar casos donde `bio` o `cargo_rol` estén vacíos
- Mostrar mensajes apropiados para datos no disponibles
- Implementar fallbacks visuales

### 2. **Errores de API**
- Manejar errores de conexión
- Mostrar estados de carga
- Implementar retry logic

### 3. **Validación de Datos**
- Verificar que los timestamps sean válidos
- Validar que los conteos sean números positivos
- Sanitizar texto de biografía y cargo

## Consideraciones de Performance

### 1. **Optimización de Queries**
- Usar índices en `user_id` y `points`
- Implementar caché para rankings
- Paginar resultados si es necesario

### 2. **Caché**
- Cachear datos de perfil por 5-10 minutos
- Invalidar caché cuando se actualicen puntos
- Usar Redis o similar para rankings

## Testing

### 1. **Casos de Prueba**
- Usuario con todos los datos completos
- Usuario con datos faltantes
- Usuario nuevo sin posts
- Usuario con muchos posts
- Usuario con ranking alto/bajo

### 2. **Validaciones**
- Verificar que los cálculos de ranking sean correctos
- Confirmar que las ligas se asignen correctamente
- Validar formatos de tiempo transcurrido

## 🚨 PRIORIDADES CRÍTICAS DE IMPLEMENTACIÓN

### **FASE 1 - ELIMINAR HARDCODES (CRÍTICO - INMEDIATO)**
1. **🚨 CORREGIR LIGA INFERIOR**: Eliminar "Oro" hardcodeado, calcular liga real basada en puntos
2. **🚨 CORREGIR RANKING**: Eliminar "#15 de 150" hardcodeado, calcular ranking real
3. **🚨 CORREGIR POSTS REALIZADOS**: Eliminar "5 posts realizados" hardcodeado, contar posts reales
4. **🚨 CORREGIR ÚLTIMA VEZ VISTO**: Eliminar "hace 2 horas" hardcodeado, calcular desde `last_login_at`
5. **🚨 CORREGIR MIEMBRO DESDE**: Eliminar "Marzo 2024" hardcodeado, usar `created_at` real

### **FASE 2 - AGREGAR DATOS FALTANTES (IMPORTANTE)**
1. **📝 AGREGAR BIOGRAFÍA**: Mostrar campo `bio` de la tabla `users`
2. **💼 AGREGAR CARGO**: Mostrar campo `cargo_rol` de la tabla `users`
3. **🔍 VERIFICAR PUNTOS**: Confirmar que `points` esté realmente conectado
4. **🔍 VERIFICAR LIGA SUPERIOR**: Confirmar que `type_rol` esté realmente conectado

### **FASE 3 - OPTIMIZACIONES (MEJORAS)**
1. Implementar caché para rankings
2. Optimizar queries de base de datos
3. Mejorar UX con loading states
4. Implementar logging para debugging

## 🚨 VERIFICACIÓN OBLIGATORIA

### **ANTES DE IMPLEMENTAR CUALQUIER CAMBIO:**
1. **Verificar en consola** que se están obteniendo datos reales de la BD
2. **Confirmar** que no hay valores hardcodeados en el código
3. **Probar** con diferentes usuarios para validar que los datos cambian
4. **Validar** que los cálculos de ranking y liga sean correctos

### **LOGS DE VERIFICACIÓN OBLIGATORIOS:**
```javascript
console.log('🔍 DATOS REALES DEL USUARIO:', userData);
console.log('🎯 PUNTOS REALES:', userData.points);
console.log('📅 FECHA REAL DE REGISTRO:', userData.created_at);
console.log('🕐 ÚLTIMO LOGIN REAL:', userData.last_login_at);
console.log('📝 POSTS REALES:', realPostsCount);
console.log('📊 RANKING REAL:', realRanking);
```

## 🎯 OBJETIVO FINAL

**ELIMINAR COMPLETAMENTE TODOS LOS VALORES HARDCODEADOS Y CONECTAR TODA LA INFORMACIÓN DEL MODAL A LA BASE DE DATOS REAL**

### **Resultado Esperado:**
- ✅ Biografía del usuario visible
- ✅ Cargo en la empresa visible  
- ✅ Liga inferior calculada basada en puntos reales
- ✅ Ranking real calculado desde la BD
- ✅ Última vez visto calculado desde `last_login_at`
- ✅ Posts realizados contados desde `community_posts`
- ✅ Miembro desde calculado desde `created_at`
- ✅ Puntos conectados a la BD
- ✅ Liga superior conectada a la BD

### **🚨 CRITERIO DE ÉXITO:**
**Cuando se abra el modal de perfil de diferentes usuarios, TODOS los datos deben cambiar según la información real de cada usuario en la base de datos. NO debe haber ningún valor hardcodeado visible.**
