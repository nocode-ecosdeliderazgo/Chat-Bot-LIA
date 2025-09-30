## Prompt para Claude Code - Arreglar Datos Hardcodeados en Modal de Perfil

**PROBLEMA IDENTIFICADO**: Los datos en el modal de perfil están hardcodeados o son aleatorios, no reflejan información real de la base de datos.

**Datos problemáticos identificados**:
- **Actividad en la Comunidad**: 13 Publicaciones, 6 Comentarios, 59 Reacciones (HARDCODEADOS)
- **Puntos**: 254 (ALEATORIO)
- **Rango**: #39 (ALEATORIO)

### 🗄️ **CONTEXTO DE BASE DE DATOS REAL**

**Esquema de tablas disponibles** (basado en el ERD del proyecto):

#### **Tabla `users`** (Información principal del usuario):
```sql
- id: uuid (PK)
- username: text
- email: text
- first_name: text
- last_name: text
- display_name: text
- bio: text
- cargo_rol: text
- type_rol: text
- points: int4 ⭐ (Para puntos reales)
- last_login_at: timestamptz ⭐ (Para última vez visto)
- profile_picture_url: text
- created_at: timestamptz ⭐ (Para "miembro desde")
- updated_at: timestamptz
```

#### **Tabla `community_posts`** (Para contar publicaciones reales):
```sql
- id: uuid (PK)
- community_id: uuid (FK a communities.id)
- user_id: uuid (FK a users.id) ⭐ CLAVE PARA CONTAR POSTS
- title: text
- content: text
- attachment_url: text
- attachment_type: text
- likes_count: int
- comments_count: int
- is_pinned: bool
- is_edited: bool
- edited_at: timestamptz
- created_at: timestamptz
- updated_at: timestamptz
- reaction_count: int
```

#### **Tabla `community_comments`** (Para contar comentarios reales):
```sql
- id: uuid (PK)
- post_id: uuid (FK a community_posts.id)
- community_id: uuid (FK a communities.id)
- user_id: uuid (FK a users.id) ⭐ CLAVE PARA CONTAR COMENTARIOS
- content: text
- parent_comment_id: uuid (FK a community_comments.id)
- is_deleted: bool
- created_at: timestamptz
- updated_at: timestamptz
```

#### **Tabla `community_reactions`** (Para contar reacciones reales):
```sql
- id: uuid (PK)
- user_id: uuid (FK a users.id) ⭐ CLAVE PARA CONTAR REACCIONES
- post_id: uuid (FK a community_posts.id)
- comment_id: uuid (FK a community_comments.id)
- reaction_type: text
- created_at: timestamptz
```

#### **Tabla `community_members`** (Para información de membresía):
```sql
- id: uuid (PK)
- community_id: uuid (FK a communities.id)
- user_id: uuid (FK a users.id)
- role: text
- joined_at: timestamptz
- is_active: bool
```

### 🎯 **OBJETIVO**: Conectar TODOS los datos del modal a la base de datos real

### 📋 **DATOS A CORREGIR**

#### 1. **Actividad en la Comunidad (HARDCODEADA)**

**ACTUAL** (hardcodeado):
```javascript
// En el modal se muestran valores fijos:
// - Publicaciones: 13
// - Comentarios: 6  
// - Reacciones: 59
```

**SOLUCIÓN** - Conectar a base de datos real:

```javascript
// Función para obtener actividad real del usuario
async function getRealUserActivity(userId) {
    try {
        console.log('📊 Obteniendo actividad real para usuario:', userId);

        // 1. Contar publicaciones reales desde community_posts
        const { count: postsCount, error: postsError } = await window.supabase
            .from('community_posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (postsError) {
            console.error('Error contando posts:', postsError);
        }

        // 2. Contar comentarios reales desde community_comments
        const { count: commentsCount, error: commentsError } = await window.supabase
            .from('community_comments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_deleted', false); // Excluir comentarios eliminados

        if (commentsError) {
            console.error('Error contando comentarios:', commentsError);
        }

        // 3. Contar reacciones reales desde community_reactions
        const { count: reactionsCount, error: reactionsError } = await window.supabase
            .from('community_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (reactionsError) {
            console.error('Error contando reacciones:', reactionsError);
        }

        const activity = {
            posts: postsCount || 0,
            comments: commentsCount || 0,
            reactions: reactionsCount || 0
        };

        console.log('📊 Actividad real obtenida:', activity);
        return activity;

    } catch (error) {
        console.error('❌ Error obteniendo actividad del usuario:', error);
        return { posts: 0, comments: 0, reactions: 0 };
    }
}
```

#### 2. **Puntos (ALEATORIO)**

**ACTUAL** (aleatorio):
```javascript
// Los puntos se generan aleatoriamente
points: Math.floor(Math.random() * 1000)
```

**SOLUCIÓN** - Usar puntos reales de la BD:

```javascript
// Obtener puntos reales del usuario
const { data: userData, error } = await window.supabase
    .from('users')
    .select('points')
    .eq('id', userId)
    .single();

const realPoints = userData?.points || 0;
```

#### 3. **Rango (ALEATORIO)**

**ACTUAL** (aleatorio):
```javascript
// El rango se genera aleatoriamente
rank: Math.floor(Math.random() * 100) + 1
```

**SOLUCIÓN** - Calcular ranking real:

```javascript
// Función para obtener ranking real del usuario
async function getRealUserRanking(userId) {
    try {
        console.log('🏆 Calculando ranking real para usuario:', userId);

        // Obtener todos los usuarios ordenados por puntos (descendente)
        const { data: allUsers, error } = await window.supabase
            .from('users')
            .select('id, points, username')
            .not('points', 'is', null) // Excluir usuarios sin puntos
            .order('points', { ascending: false });

        if (error) {
            console.error('Error obteniendo usuarios para ranking:', error);
            throw error;
        }

        // Encontrar la posición del usuario actual
        const userIndex = allUsers.findIndex(user => user.id === userId);
        const userRank = userIndex + 1;
        const totalUsers = allUsers.length;

        const ranking = {
            rank: userRank,
            total: totalUsers
        };

        console.log('🏆 Ranking real calculado:', ranking);
        console.log('🏆 Usuario en posición:', userRank, 'de', totalUsers, 'usuarios');

        return ranking;

    } catch (error) {
        console.error('❌ Error calculando ranking real:', error);
        return { rank: 0, total: 0 };
    }
}
```

### 🔧 **IMPLEMENTACIÓN COMPLETA**

#### 1. **Actualizar función de carga de perfil**

**Archivo**: `src/Community/community-view.html`

**REEMPLAZAR** la función `loadRealUserProfile`:

```javascript
async function loadRealUserProfile(userId) {
    try {
        console.log('🔄 Cargando datos REALES del usuario:', userId);
        
        // 1. Obtener datos básicos del usuario
        const { data: user, error: userError } = await window.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) throw userError;

        // 2. Obtener actividad real del usuario
        const activity = await getRealUserActivity(userId);
        console.log('📊 Actividad real:', activity);

        // 3. Obtener ranking real del usuario
        const ranking = await getRealUserRanking(userId);
        console.log('🏆 Ranking real:', ranking);

        // 4. Calcular liga real basada en puntos
        const realLeague = getRealLeagueFromPoints(user.points);
        console.log('🎯 Liga real:', realLeague);

        // 5. Calcular tiempo transcurrido real
        const realLastSeen = getRealTimeAgo(user.last_login_at);
        console.log('🕐 Última vez visto real:', realLastSeen);

        // 6. Calcular fecha de membresía real
        const realMemberSince = getRealMemberSince(user.created_at);
        console.log('📅 Miembro desde real:', realMemberSince);

        // 7. Actualizar UI con datos REALES
        updateProfileModalWithRealData({
            user,
            activity,
            ranking,
            league: realLeague,
            lastSeen: realLastSeen,
            memberSince: realMemberSince
        });

        console.log('✅ PERFIL ACTUALIZADO CON DATOS REALES');

    } catch (error) {
        console.error('❌ ERROR AL CARGAR PERFIL REAL:', error);
        showProfileError('Error al cargar datos del perfil');
    }
}
```

#### 2. **Función para actualizar UI con datos reales**

```javascript
function updateProfileModalWithRealData(data) {
    const { user, activity, ranking, league, lastSeen, memberSince } = data;

    // 1. Datos básicos del usuario
    document.getElementById('profileName').textContent = user.display_name || user.first_name || 'Usuario';
    document.getElementById('profileUsername').textContent = `@${user.username}`;
    document.getElementById('profileEmail').textContent = user.email || 'No especificado';
    document.getElementById('profileLocation').textContent = user.location || 'No especificado';
    document.getElementById('profileBio').textContent = user.bio || 'Sin biografía disponible';

    // 2. Estadísticas REALES
    document.getElementById('profilePoints').textContent = user.points || 0;
    document.getElementById('profileRank').textContent = `#${ranking.rank} de ${ranking.total}`;
    document.getElementById('profileJoinDate').textContent = memberSince;

    // 3. Actividad REAL en la comunidad
    document.getElementById('profilePosts').textContent = activity.posts;
    document.getElementById('profileComments').textContent = activity.comments;
    document.getElementById('profileReactions').textContent = activity.reactions;

    // 4. Liga real
    document.getElementById('profileLeague').textContent = league;

    // 5. Última vez visto real
    const lastSeenElement = document.getElementById('profileLastSeen');
    if (lastSeenElement) {
        lastSeenElement.textContent = lastSeen;
    }

    console.log('✅ UI ACTUALIZADA CON DATOS REALES:');
    console.log('  - Puntos:', user.points);
    console.log('  - Ranking:', `#${ranking.rank} de ${ranking.total}`);
    console.log('  - Posts:', activity.posts);
    console.log('  - Comentarios:', activity.comments);
    console.log('  - Reacciones:', activity.reactions);
    console.log('  - Liga:', league);
}
```

#### 3. **Función para obtener actividad real**

```javascript
async function getRealUserActivity(userId) {
    try {
        console.log('📊 Obteniendo actividad real para usuario:', userId);

        // Ejecutar todas las consultas en paralelo para mejor rendimiento
        const [postsResult, commentsResult, reactionsResult] = await Promise.allSettled([
            // 1. Contar publicaciones reales desde community_posts
            window.supabase
                .from('community_posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId),
            
            // 2. Contar comentarios reales desde community_comments (excluyendo eliminados)
            window.supabase
                .from('community_comments')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_deleted', false),
            
            // 3. Contar reacciones reales desde community_reactions
            window.supabase
                .from('community_reactions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
        ]);

        // Procesar resultados con manejo de errores
        const posts = postsResult.status === 'fulfilled' ? (postsResult.value.count || 0) : 0;
        const comments = commentsResult.status === 'fulfilled' ? (commentsResult.value.count || 0) : 0;
        const reactions = reactionsResult.status === 'fulfilled' ? (reactionsResult.value.count || 0) : 0;

        const activity = { posts, comments, reactions };

        console.log('📊 Actividad real obtenida:', activity);
        console.log('📊 Detalles:', {
            posts: `${posts} publicaciones`,
            comments: `${comments} comentarios`,
            reactions: `${reactions} reacciones`
        });

        return activity;

    } catch (error) {
        console.error('❌ Error obteniendo actividad real:', error);
        return { posts: 0, comments: 0, reactions: 0 };
    }
}
```

#### 4. **Función para obtener ranking real**

```javascript
async function getRealUserRanking(userId) {
    try {
        console.log('🏆 Calculando ranking real para usuario:', userId);

        // Obtener todos los usuarios ordenados por puntos
        const { data: allUsers, error } = await window.supabase
            .from('users')
            .select('id, points')
            .order('points', { ascending: false });

        if (error) throw error;

        // Encontrar la posición del usuario actual
        const userIndex = allUsers.findIndex(user => user.id === userId);
        const userRank = userIndex + 1;
        const totalUsers = allUsers.length;

        console.log('🏆 Ranking real calculado:', { rank: userRank, total: totalUsers });

        return { rank: userRank, total: totalUsers };

    } catch (error) {
        console.error('❌ Error calculando ranking real:', error);
        return { rank: 0, total: 0 };
    }
}
```

### 🎯 **VERIFICACIÓN OBLIGATORIA**

#### 1. **Logs de verificación**

```javascript
// Añadir al final de updateProfileModalWithRealData
console.log('🔍 VERIFICACIÓN FINAL - DATOS COMPLETAMENTE REALES:');
console.log('  - Usuario ID:', user.id);
console.log('  - Puntos desde BD:', user.points);
console.log('  - Ranking calculado:', `#${ranking.rank} de ${ranking.total}`);
console.log('  - Posts reales:', activity.posts);
console.log('  - Comentarios reales:', activity.comments);
console.log('  - Reacciones reales:', activity.reactions);
console.log('  - Liga calculada:', league);
```

#### 2. **Pruebas requeridas**

- ✅ Abrir modal de diferentes usuarios
- ✅ Verificar que los números cambian según el usuario
- ✅ Confirmar que no hay valores hardcodeados
- ✅ Validar que los cálculos de ranking sean correctos
- ✅ Verificar que la actividad se cuenta correctamente

### 🎯 **CRITERIOS DE ÉXITO**

- ✅ **Puntos**: Muestran el valor real de `users.points` (NO aleatorio)
- ✅ **Rango**: Calculado basado en posición real entre todos los usuarios (NO aleatorio)
- ✅ **Publicaciones**: Contadas desde `community_posts` por `user_id` (NO hardcodeado 13)
- ✅ **Comentarios**: Contados desde `community_comments` por `user_id` excluyendo `is_deleted = true` (NO hardcodeado 6)
- ✅ **Reacciones**: Contadas desde `community_reactions` por `user_id` (NO hardcodeado 59)
- ✅ **Liga**: Calculada basada en puntos reales
- ✅ **Miembro desde**: Calculado desde `users.created_at`
- ✅ **Última vez visto**: Calculado desde `users.last_login_at`

### 🔍 **VERIFICACIÓN ESPECÍFICA DE TABLAS**

**Basado en el ERD del proyecto, verificar que las consultas usen las tablas correctas**:

1. **`community_posts`**: 
   - Campo clave: `user_id` (FK a users.id)
   - Contar: `SELECT COUNT(*) WHERE user_id = ?`

2. **`community_comments`**: 
   - Campo clave: `user_id` (FK a users.id)
   - Contar: `SELECT COUNT(*) WHERE user_id = ? AND is_deleted = false`

3. **`community_reactions`**: 
   - Campo clave: `user_id` (FK a users.id)
   - Contar: `SELECT COUNT(*) WHERE user_id = ?`

4. **`users`**: 
   - Campo clave: `points` (int4)
   - Ranking: `SELECT id, points ORDER BY points DESC`

### 🚨 **PRIORIDAD CRÍTICA**

**ELIMINAR COMPLETAMENTE TODOS LOS VALORES HARDCODEADOS Y ALEATORIOS**

**Archivo a modificar**: `src/Community/community-view.html`

**Función principal**: `loadRealUserProfile(userId)`

**Resultado esperado**: Cuando se abra el modal de perfil de diferentes usuarios, TODOS los datos deben cambiar según la información real de cada usuario en la base de datos.
