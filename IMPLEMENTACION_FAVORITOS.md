# 🌟 Implementación de Favoritos para Cursos

## 📋 Resumen

Se ha implementado un sistema completo de favoritos para los cursos en la plataforma, permitiendo a los usuarios marcar cursos como favoritos y filtrarlos fácilmente.

## ✅ Componentes Implementados

### 1. Base de Datos (Supabase)

**Tabla: `course_favorites`**
```sql
CREATE TABLE course_favorites (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    course_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
)
```

**Características:**
- ✅ Índices optimizados para búsqueda rápida
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de seguridad para SELECT, INSERT y DELETE
- ✅ Restricción UNIQUE para evitar duplicados (user_id, course_id)

### 2. Frontend (JavaScript)

**Archivo modificado: `src/scripts/cursos.js`**

**Funciones implementadas:**
- `initSupabase()` - Inicializa el cliente de Supabase
- `getCurrentUser()` - Obtiene el usuario actual autenticado
- `loadUserFavorites()` - Carga favoritos desde Supabase
- `loadLocalFavorites()` - Carga favoritos desde localStorage (fallback)
- `saveLocalFavorites()` - Guarda favoritos en localStorage
- `toggleFavorite(courseId, buttonElement)` - Agrega/quita favoritos
- `renderCards()` - Renderiza cursos con estado de favorito
- `filter()` - Filtro mejorado que soporta categoría "favoritos"

**Características:**
- ✅ Sincronización con Supabase
- ✅ Fallback a localStorage si Supabase no está disponible
- ✅ Actualización en tiempo real del UI
- ✅ Animación de corazón al marcar favorito
- ✅ Persistencia entre sesiones

### 3. Estilos (CSS)

**Archivo modificado: `src/styles/cursos.css`**

**Estilos agregados:**
```css
.cta .wishlist.active {
    background: linear-gradient(135deg, #ff006e, #d90052);
    border-color: #ff006e;
    color: #fff;
    box-shadow: 0 4px 16px rgba(255,0,110,.4);
}

@keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.3); }
    50% { transform: scale(1.1); }
}
```

**Características:**
- ✅ Botón de favoritos con gradiente rosa cuando está activo
- ✅ Animación de "latido" al marcar como favorito
- ✅ Efectos de hover mejorados
- ✅ Soporte para modo claro y oscuro

### 4. Migración SQL

**Archivo: `supabase/migrations/20250101_create_course_favorites.sql`**

Contiene todas las sentencias SQL necesarias para crear la tabla, índices y políticas de seguridad.

### 5. Script de Migración

**Archivo: `scripts/create-favorites-table.js`**

Script Node.js para ejecutar la migración automáticamente:

```bash
node scripts/create-favorites-table.js
```

## 🚀 Cómo Usar

### Para Usuarios

1. **Marcar como favorito:**
   - Hacer clic en el botón de corazón (❤️) en cualquier curso
   - El corazón se llenará y cambiará a color rosa

2. **Quitar de favoritos:**
   - Hacer clic nuevamente en el botón de corazón lleno
   - El corazón volverá a estar vacío

3. **Ver solo favoritos:**
   - Hacer clic en el botón "Favoritos" en la barra de categorías
   - Se mostrarán solo los cursos marcados como favoritos

### Para Desarrolladores

#### 1. Ejecutar la Migración

**Opción A: Script automático (recomendado)**
```bash
node scripts/create-favorites-table.js
```

**Opción B: Manual en Supabase Dashboard**
1. Ir a Supabase Dashboard → SQL Editor
2. Copiar el contenido de `supabase/migrations/20250101_create_course_favorites.sql`
3. Ejecutar la consulta

#### 2. Verificar la Instalación

En la consola del navegador, deberías ver:
```
✅ Supabase inicializado para favoritos
✅ Favoritos cargados: 0
```

#### 3. Probar la Funcionalidad

1. Abrir `cursos.html` en el navegador
2. Hacer clic en el botón de favoritos de un curso
3. Verificar en la consola:
   ```
   ❤️ Curso agregado a favoritos: chatgpt_gemini
   ```
4. Hacer clic en el filtro "Favoritos"
5. Verificar que solo se muestre el curso marcado

## 🔧 Configuración Técnica

### Variables de Entorno Necesarias

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_ANON_KEY=tu_anon_key
```

### Dependencias

- `@supabase/supabase-js` - Cliente de Supabase
- Boxicons - Para el icono de corazón

## 🎨 Personalización

### Cambiar el Color del Botón de Favoritos

Editar en `src/styles/cursos.css`:

```css
.cta .wishlist.active { 
    background: linear-gradient(135deg, #tu-color-1, #tu-color-2);
    border-color: #tu-color-1;
}
```

### Agregar Más Categorías de Filtro

Editar en `src/cursos.html`:

```html
<button class="cat-tab" data-cat="tu-categoria">Tu Categoría</button>
```

## 🐛 Solución de Problemas

### El botón de favoritos no hace nada

1. Verificar que Supabase esté inicializado correctamente
2. Revisar la consola del navegador para errores
3. Verificar que el usuario esté autenticado
4. Confirmar que la tabla `course_favorites` existe

### Los favoritos no persisten

1. Verificar que las políticas RLS estén configuradas correctamente
2. Confirmar que el `user_id` coincida con el usuario autenticado
3. Revisar que no haya errores en la consola de Supabase

### El filtro de favoritos no muestra nada

1. Verificar que hay cursos marcados como favoritos
2. Confirmar que el `course_id` coincida con los IDs del catálogo
3. Revisar la función `filter()` en `cursos.js`

## 📊 Rendimiento

- **Consultas optimizadas**: Índices en `user_id` y `course_id`
- **Caché local**: Los favoritos se guardan en `localStorage` como fallback
- **Sincronización eficiente**: Solo se actualiza cuando cambian los favoritos

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Los usuarios solo ven sus propios favoritos
- ✅ No se pueden modificar favoritos de otros usuarios
- ✅ Validación en frontend y backend

## 📈 Mejoras Futuras

- [ ] Contador de favoritos por curso
- [ ] Notificación cuando se marque como favorito
- [ ] Sincronización en tiempo real entre dispositivos
- [ ] Compartir lista de favoritos
- [ ] Categorías personalizadas de favoritos

## 🎉 ¡Listo!

El sistema de favoritos está completamente funcional y listo para usar. Los usuarios pueden ahora marcar sus cursos favoritos y acceder rápidamente a ellos a través del filtro.

---

**Fecha de implementación:** 2025-01-01  
**Versión:** 1.0.0  
**Desarrollado por:** Chat-Bot-LIA Team

