# GUÍA DE ACCESO A BASE DE DATOS - Chat-Bot-LIA

**Para nuevos chats/desarrolladores**: Esta guía explica cómo acceder, guardar y mostrar datos de la base de datos PostgreSQL del proyecto Coach Lia IA.

## 📋 Información General del Proyecto

**Stack Tecnológico:**
- **Backend**: Node.js + Express
- **Base de Datos**: PostgreSQL + Supabase
- **Frontend**: Vanilla JavaScript
- **Arquitectura**: API REST

**Configuración de Base de Datos:**
- **Pool de conexiones**: `pg` (PostgreSQL driver)
- **ORM**: Ninguno - Queries SQL nativas
- **Ubicación del servidor**: `server.js`

## 🗄️ Estructura de Conexión

### Pool de Conexiones (server.js)

```javascript
const { Pool } = require('pg');

// Pool configurado automáticamente con DATABASE_URL del .env
let pool = null;

// Configuración automática de pool al inicio del servidor
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
} else if (supabase) {
    // Fallback a Supabase si no hay DATABASE_URL
    console.log('⚠️ DATABASE_URL no encontrada, usando Supabase como fallback');
}
```

### Variables de Entorno Requeridas

```env
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 🎯 Patrón de Endpoints API

### Estructura Estándar de Endpoint

```javascript
app.post('/api/[categoria]/[recurso]', async (req, res) => {
    try {
        console.log('📝 === INICIO OPERACIÓN ===');
        console.log('📋 Body recibido:', req.body);
        
        const { campo1, campo2, campo3 } = req.body;
        
        // 1. VALIDACIÓN DE CAMPOS REQUERIDOS
        if (!campo1 || !campo2) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos obligatorios: campo1, campo2'
            });
        }
        
        // 2. VERIFICAR POOL DE BASE DE DATOS
        if (!pool) {
            return res.status(500).json({
                success: false,
                error: 'Base de datos no disponible'
            });
        }
        
        // 3. EJECUTAR QUERY SQL
        const result = await pool.query(`
            INSERT INTO tabla_ejemplo 
            (campo1, campo2, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            RETURNING *
        `, [campo1, campo2]);
        
        // 4. VERIFICAR RESULTADO
        if (result.rows.length === 0) {
            throw new Error('No se pudo crear el registro');
        }
        
        const record = result.rows[0];
        
        // 5. OBTENER DATOS RELACIONADOS (opcional)
        const userResult = await pool.query(`
            SELECT username, display_name, first_name 
            FROM users WHERE id = $1
        `, [record.user_id]);
        
        // 6. ESTRUCTURAR RESPUESTA
        const responseData = {
            id: record.id,
            campo1: record.campo1,
            campo2: record.campo2,
            created_at: record.created_at,
            user: userResult.rows[0] || {}
        };
        
        console.log(`✅ Operación exitosa: ${record.id}`);
        res.status(201).json({
            success: true,
            data: responseData,
            message: 'Registro creado exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error en operación:', error);
        res.status(500).json({
            success: false,
            error: 'Error en operación',
            details: error.message
        });
    }
});
```

## 📊 Tipos de Operaciones Comunes

### 1. CREAR REGISTROS (INSERT)

**Patrón para INSERT:**
```javascript
const result = await pool.query(`
    INSERT INTO tabla_nombre 
    (campo1, campo2, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *
`, [valor1, valor2]);

const newRecord = result.rows[0];
```

**⚠️ IMPORTANTE - Verificar Estructura de Tabla:**
```javascript
// Antes de escribir queries, verificar si la tabla tiene updated_at:
// ✅ Tablas CON updated_at: community_questions, community_answers, community_comments  
// ❌ Tablas SIN updated_at: community_votes, community_bookmarks, users

// CORRECTO para tabla CON updated_at:
INSERT INTO community_answers (question_id, user_id, content, created_at, updated_at)
VALUES ($1, $2, $3, NOW(), NOW())

// CORRECTO para tabla SIN updated_at:
INSERT INTO community_votes (user_id, target_type, target_id, vote_type, created_at)
VALUES ($1, $2, $3, $4, NOW())
```

### 2. LEER REGISTROS (SELECT)

**Patrón para SELECT con JOINs:**
```javascript
const result = await pool.query(`
    SELECT q.*, u.username, u.display_name, u.first_name, u.profile_picture_url
    FROM community_questions q
    LEFT JOIN users u ON q.user_id = u.id
    WHERE q.id = $1
`, [questionId]);

const records = result.rows;
```

**Patrón para SELECT con filtros:**
```javascript
const result = await pool.query(`
    SELECT * FROM tabla_nombre 
    WHERE campo1 = $1 AND campo2 = $2
    ORDER BY created_at DESC
    LIMIT $3
`, [valor1, valor2, limit]);
```

### 3. ACTUALIZAR REGISTROS (UPDATE)

**Patrón para UPDATE:**
```javascript
const result = await pool.query(`
    UPDATE tabla_nombre 
    SET campo1 = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
`, [nuevoValor, id]);

const updatedRecord = result.rows[0];
```

### 4. ELIMINAR REGISTROS (DELETE)

**Patrón para DELETE:**
```javascript
await pool.query(`
    DELETE FROM tabla_nombre 
    WHERE id = $1
`, [id]);
```

### 5. OPERACIONES DE TOGGLE (Crear/Eliminar)

**Patrón para sistemas de toggle (votos, bookmarks):**
```javascript
// Verificar si existe
const existingResult = await pool.query(`
    SELECT * FROM tabla_toggle 
    WHERE user_id = $1 AND target_id = $2
`, [userId, targetId]);

let action = '';

if (existingResult.rows.length > 0) {
    // Eliminar existente
    await pool.query(`DELETE FROM tabla_toggle WHERE id = $1`, [existingResult.rows[0].id]);
    action = 'removed';
} else {
    // Crear nuevo
    const insertResult = await pool.query(`
        INSERT INTO tabla_toggle (user_id, target_id, created_at)
        VALUES ($1, $2, NOW()) RETURNING *
    `, [userId, targetId]);
    action = 'created';
}
```

## 🎨 Frontend: Conexión con API

### Estructura de Community API (client-side)

**Ubicación:** `src/Chat-Online/api/community-api.js`

**Patrón de uso:**
```javascript
class CommunityAPI {
    constructor() {
        this.baseUrl = '/api/community';
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            ...options
        });
        return await response.json();
    }

    async createRecord(data) {
        return await this.makeRequest('/endpoint', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

// Instancia global disponible
window.communityAPI = new CommunityAPI();
```

### Uso en Frontend JavaScript

```javascript
// En chat-online.js o componentes
async function saveToDatabase() {
    try {
        const response = await window.communityAPI.createRecord({
            campo1: 'valor1',
            campo2: 'valor2',
            user_id: this.obtenerTokenAuth()
        });

        if (response.success) {
            this.showNotification('Guardado exitosamente', 'success');
        } else {
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('Error:', error);
        this.showNotification('Error al guardar', 'error');
    }
}
```

## 📋 Esquema de Tablas Principales

### Tablas de Comunidad

```sql
-- community_questions (CON updated_at)
CREATE TABLE community_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title character varying NOT NULL,
    content text NOT NULL,
    tags text[] DEFAULT '{}',
    course_id uuid,
    module_id uuid,
    user_id uuid REFERENCES users(id),
    votes_count integer DEFAULT 0,
    answers_count integer DEFAULT 0,
    views_count integer DEFAULT 0,
    is_answered boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- community_answers (CON updated_at)
CREATE TABLE community_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid REFERENCES community_questions(id),
    user_id uuid REFERENCES users(id),
    content text NOT NULL,
    votes_count integer DEFAULT 0,
    is_accepted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- community_comments (CON updated_at)
CREATE TABLE community_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_type character varying NOT NULL,
    parent_id uuid NOT NULL,
    user_id uuid REFERENCES users(id),
    content text NOT NULL,
    votes_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- community_votes (SIN updated_at)
CREATE TABLE community_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    target_type character varying(20) NOT NULL,
    target_id uuid NOT NULL,
    vote_type character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    UNIQUE(user_id, target_type, target_id)
);

-- community_bookmarks (SIN updated_at)
CREATE TABLE community_bookmarks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    question_id uuid REFERENCES community_questions(id),
    created_at timestamp without time zone DEFAULT now()
);
```

### Tabla de Usuarios

```sql
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username character varying,
    display_name character varying,
    first_name character varying,
    email character varying,
    profile_picture_url character varying,
    created_at timestamp with time zone DEFAULT now()
);
```

## 🚀 Pasos para Implementar Nueva Funcionalidad

### 1. Planificar la Funcionalidad
```markdown
- ¿Qué datos necesito guardar/obtener?
- ¿Qué tabla(s) están involucradas?
- ¿Necesito JOINs con otras tablas?
- ¿La tabla tiene updated_at?
```

### 2. Crear Endpoint en server.js
```javascript
// Seguir el patrón estándar mostrado arriba
app.post('/api/nueva-categoria/nuevo-recurso', async (req, res) => {
    // Implementar siguiendo la estructura estándar
});
```

### 3. Agregar Método a community-api.js
```javascript
async createNuevoRecurso(data) {
    return await this.makeRequest('/nueva-categoria/nuevo-recurso', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}
```

### 4. Usar en Frontend
```javascript
// En el componente correspondiente
const response = await window.communityAPI.createNuevoRecurso(datos);
```

### 5. Manejar Respuesta
```javascript
if (response.success) {
    // Actualizar UI
    this.showNotification('Éxito', 'success');
} else {
    // Manejar error
    this.showNotification(response.error, 'error');
}
```

## ⚠️ Errores Comunes y Soluciones

### Error: "column 'updated_at' does not exist"
**Causa:** Intentar usar `updated_at` en tabla que no lo tiene.
**Solución:** Verificar estructura de tabla en `supabase.sql` y remover `updated_at` de la query.

### Error: "relation 'table_name' does not exist"  
**Causa:** Nombre de tabla incorrecto o tabla no creada.
**Solución:** Verificar nombre exacto en `supabase.sql`.

### Error: "invalid input syntax for type uuid"
**Causa:** Pasar string no-uuid a campo uuid.
**Solución:** Verificar que los IDs sean UUIDs válidos.

### Error: "null value in column violates not-null constraint"
**Causa:** Campo requerido sin valor.
**Solución:** Agregar validación en endpoint antes de INSERT.

## 🧪 Testing de Endpoints

### Usando curl
```bash
curl -X POST http://localhost:3000/api/community/answers \
-H "Content-Type: application/json" \
-d '{"question_id": "uuid-here", "content": "Mi respuesta", "user_id": "uuid-here"}'
```

### Usando Browser DevTools
```javascript
fetch('/api/community/answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        question_id: 'uuid-here',
        content: 'Mi respuesta',
        user_id: 'uuid-here'
    })
}).then(r => r.json()).then(console.log);
```

## 📝 Logs y Debugging

**Siempre incluir logs descriptivos:**
```javascript
console.log('📝 === INICIO OPERACIÓN ===');
console.log('📋 Body recibido:', req.body);
console.log('🗃️ Pool disponible, ejecutando query...');
console.log('📊 Resultado de query:', result.rowCount);
console.log('✅ Operación exitosa:', record.id);
```

**Niveles de log:**
- `📝` = Inicio de operación
- `📋` = Datos recibidos  
- `🗃️` = Operación de BD
- `📊` = Resultados
- `✅` = Éxito
- `❌` = Error

## 🎯 Ejemplos Reales del Proyecto

### Ejemplo 1: Sistema de Votos
- **Frontend:** `handleVote()` en `chat-online.js`
- **API Client:** `vote()` en `community-api.js`
- **Backend:** `POST /api/community/votes` en `server.js`
- **Tabla:** `community_votes` (SIN updated_at)

### Ejemplo 2: Sistema de Respuestas  
- **Frontend:** `submitAnswer()` en `chat-online.js`
- **API Client:** `createAnswer()` en `community-api.js`
- **Backend:** `POST /api/community/answers` en `server.js`
- **Tabla:** `community_answers` (CON updated_at)

### Ejemplo 3: Sistema de Comentarios
- **Frontend:** `submitComment()` en `chat-online.js`
- **API Client:** `createComment()` en `community-api.js` 
- **Backend:** `POST /api/community/comments` en `server.js`
- **Tabla:** `community_comments` (CON updated_at)

---

**💡 Tip Final:** Siempre revisar `supabase.sql` para verificar la estructura exacta de las tablas antes de escribir queries SQL. ¡Esto evitará el 90% de los errores de base de datos!