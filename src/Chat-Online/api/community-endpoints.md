# API Endpoints para Comunidad - Chat Online

## Resumen
Esta documentación describe los endpoints necesarios para implementar la funcionalidad completa del área de comunidad en el Chat Online, incluyendo preguntas, respuestas, comentarios, votos y marcadores.

## Base URL
```
/api/community
```

## Autenticación
Todos los endpoints requieren autenticación mediante JWT token en el header:
```
Authorization: Bearer <jwt_token>
```

---

## 📝 PREGUNTAS

### 1. Listar Preguntas
```http
GET /api/community/questions
```

**Query Parameters:**
- `course_id` (string, opcional): Filtrar por curso específico
- `module_id` (string, opcional): Filtrar por módulo específico
- `filter` (enum): `all` | `unanswered` | `answered` | `mine` (default: `all`)
- `sort` (enum): `recent` | `votes` | `answers` | `views` (default: `recent`)
- `page` (number, default: 1): Número de página
- `limit` (number, default: 20): Elementos por página
- `search` (string, opcional): Búsqueda en título y contenido

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "course_id": "uuid",
        "module_id": "module_1",
        "title": "¿Cuál es la diferencia entre ML y DL?",
        "content": "Contenido completo de la pregunta...",
        "tags": ["machine-learning", "deep-learning"],
        "votes_count": 15,
        "answers_count": 3,
        "views_count": 127,
        "is_answered": true,
        "is_featured": false,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T14:20:00Z",
        "author": {
          "id": "uuid",
          "full_name": "Carlos Mendez",
          "profile_picture": "/images/avatar.jpg",
          "is_instructor": false
        },
        "user_vote": null // "upvote", "downvote", o null
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 95,
      "items_per_page": 20
    }
  }
}
```

### 2. Crear Pregunta
```http
POST /api/community/questions
```

**Request Body:**
```json
{
  "title": "¿Cuál es la diferencia entre Machine Learning y Deep Learning?",
  "content": "Estoy viendo el video sobre IA pero no me queda claro...",
  "tags": ["machine-learning", "deep-learning", "conceptos-básicos"],
  "course_id": "uuid",
  "module_id": "module_1"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Pregunta creada exitosamente",
  "data": {
    "question_id": "uuid",
    "title": "¿Cuál es la diferencia entre Machine Learning y Deep Learning?",
    "created_at": "2024-01-15T15:30:00Z"
  }
}
```

### 3. Obtener Pregunta Específica
```http
GET /api/community/questions/:id
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "question": {
      "id": "uuid",
      "title": "¿Cuál es la diferencia entre ML y DL?",
      "content": "Contenido completo...",
      "tags": ["machine-learning", "deep-learning"],
      "votes_count": 15,
      "answers_count": 3,
      "views_count": 128,
      "is_answered": true,
      "created_at": "2024-01-15T10:30:00Z",
      "author": {
        "id": "uuid",
        "full_name": "Carlos Mendez",
        "profile_picture": "/images/avatar.jpg",
        "is_instructor": false
      },
      "user_vote": "upvote"
    }
  }
}
```

### 4. Actualizar Pregunta
```http
PUT /api/community/questions/:id
```

**Request Body:**
```json
{
  "title": "Título actualizado",
  "content": "Contenido actualizado...",
  "tags": ["tag1", "tag2"]
}
```

### 5. Eliminar Pregunta
```http
DELETE /api/community/questions/:id
```

---

## 💬 RESPUESTAS

### 1. Listar Respuestas de una Pregunta
```http
GET /api/community/questions/:question_id/answers
```

**Query Parameters:**
- `sort` (enum): `votes` | `recent` | `oldest` (default: `votes`)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "answers": [
      {
        "id": "uuid",
        "question_id": "uuid",
        "user_id": "uuid",
        "content": "La principal diferencia es que...",
        "votes_count": 8,
        "is_accepted": true,
        "is_instructor_answer": false,
        "created_at": "2024-01-15T11:00:00Z",
        "author": {
          "id": "uuid",
          "full_name": "Ana García",
          "profile_picture": "/images/avatar2.jpg",
          "is_instructor": true
        },
        "user_vote": null
      }
    ]
  }
}
```

### 2. Crear Respuesta
```http
POST /api/community/questions/:question_id/answers
```

**Request Body:**
```json
{
  "content": "La principal diferencia entre Machine Learning y Deep Learning es..."
}
```

### 3. Marcar Respuesta como Aceptada
```http
POST /api/community/answers/:id/accept
```

---

## 💭 COMENTARIOS

### 1. Listar Comentarios
```http
GET /api/community/comments
```

**Query Parameters:**
- `parent_type` (enum): `question` | `answer`
- `parent_id` (uuid): ID del elemento padre

### 2. Crear Comentario
```http
POST /api/community/comments
```

**Request Body:**
```json
{
  "parent_type": "question",
  "parent_id": "uuid",
  "content": "Excelente pregunta, me surge la misma duda..."
}
```

---

## 👍 VOTOS

### 1. Votar
```http
POST /api/community/votes
```

**Request Body:**
```json
{
  "target_type": "question",
  "target_id": "uuid",
  "vote_type": "upvote"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Voto registrado",
  "data": {
    "new_vote_count": 16,
    "user_vote": "upvote"
  }
}
```

### 2. Quitar Voto
```http
DELETE /api/community/votes/:target_type/:target_id
```

---

## 🔖 MARCADORES

### 1. Agregar/Quitar Marcador
```http
POST /api/community/bookmarks
```

**Request Body:**
```json
{
  "question_id": "uuid"
}
```

### 2. Listar Marcadores del Usuario
```http
GET /api/community/bookmarks
```

---

## 📊 ESTADÍSTICAS

### 1. Estadísticas de Comunidad
```http
GET /api/community/stats
```

**Query Parameters:**
- `course_id` (string, opcional)
- `module_id` (string, opcional)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "total_questions": 245,
    "answered_questions": 198,
    "total_answers": 456,
    "total_users": 89,
    "most_active_users": [
      {
        "user_id": "uuid",
        "full_name": "Dr. María González",
        "questions_count": 12,
        "answers_count": 34,
        "is_instructor": true
      }
    ],
    "popular_tags": [
      {
        "tag": "machine-learning",
        "count": 45
      },
      {
        "tag": "deep-learning", 
        "count": 32
      }
    ]
  }
}
```

---

## 🏷️ TAGS

### 1. Listar Tags Populares
```http
GET /api/community/tags
```

**Query Parameters:**
- `course_id` (string, opcional)
- `limit` (number, default: 20)

---

## ❌ CÓDIGOS DE ERROR

### Errores Comunes
- `400` - Bad Request: Datos inválidos
- `401` - Unauthorized: Token inválido o expirado
- `403` - Forbidden: Sin permisos para la acción
- `404` - Not Found: Recurso no encontrado
- `422` - Unprocessable Entity: Validación fallida
- `500` - Internal Server Error: Error del servidor

### Formato de Error
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Los datos proporcionados no son válidos",
  "details": {
    "title": ["El título es requerido"],
    "content": ["El contenido debe tener al menos 10 caracteres"]
  }
}
```

---

## 🔧 IMPLEMENTACIÓN EN EL FRONTEND

### Funciones JavaScript a Implementar

```javascript
// Cargar preguntas
async loadQuestions(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/community/questions?${params}`, {
    headers: { 'Authorization': `Bearer ${this.getToken()}` }
  });
  return response.json();
}

// Crear pregunta
async createQuestion(questionData) {
  const response = await fetch('/api/community/questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    },
    body: JSON.stringify(questionData)
  });
  return response.json();
}

// Votar
async vote(targetType, targetId, voteType) {
  const response = await fetch('/api/community/votes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    },
    body: JSON.stringify({ target_type: targetType, target_id: targetId, vote_type: voteType })
  });
  return response.json();
}
```

---

## 📝 NOTAS DE IMPLEMENTACIÓN

1. **Paginación**: Usar cursor-based pagination para mejor performance
2. **Cache**: Implementar cache en Redis para consultas frecuentes
3. **Rate Limiting**: Limitar creación de preguntas (5 por hora por usuario)
4. **Notificaciones**: Enviar notificaciones cuando se responda una pregunta
5. **Moderación**: Sistema de reportes y moderación automática
6. **Búsqueda**: Implementar búsqueda full-text con Elasticsearch
7. **Analytics**: Trackear métricas de engagement de la comunidad

---

## 🚀 PRÓXIMOS PASOS

1. Implementar endpoints básicos (CRUD preguntas)
2. Agregar sistema de votos
3. Implementar comentarios y respuestas
4. Agregar sistema de notificaciones
5. Implementar moderación y reportes
6. Agregar analytics y métricas
7. Optimizar performance y cache
