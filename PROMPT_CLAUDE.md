# PROMPT CLAUDE: Análisis y Solución del Sistema de Noticias

## CONTEXTO DEL PROBLEMA

El sistema de noticias de Chat-Bot-LIA tiene una noticia en la base de datos que no se muestra en el frontend. Necesitamos analizar y solucionar este problema paso a paso.

## ANÁLISIS REALIZADO

### 1. ESTRUCTURA DE LA BASE DE DATOS
- **Tabla `news`** existe en la BD con la siguiente estructura:
```sql
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  language text DEFAULT 'es'::text,
  hero_image_url text,
  tldr jsonb DEFAULT '[]'::jsonb,
  intro text,
  sections jsonb DEFAULT '[]'::jsonb,
  metrics jsonb DEFAULT '[]'::jsonb,
  links jsonb DEFAULT '[]'::jsonb,
  cta jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'published'::text,
  published_at timestamp with time zone DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT news_pkey PRIMARY KEY (id)
);
```

### 2. PROBLEMA IDENTIFICADO EN EL FRONTEND
En `src/Notices/notices.js`, línea 311-320:
```javascript
loadNewsData() {
    this.showLoading();
    
    // TODO: Implementar carga desde BD
    // Por ahora, inicializar con arrays vacíos
    this.allNews = [];
    this.filteredNews = [];
    this.renderNews();
    this.hideLoading();
}
```

**PROBLEMA CRÍTICO**: La función `loadNewsData()` está hardcodeada para inicializar arrays vacíos y no conecta con la base de datos.

### 3. INFRAESTRUCTURA DISPONIBLE
- **Supabase**: El sistema ya tiene configuración de Supabase funcionando
- **API Endpoints**: Existe infraestructura de API en `server.js`
- **Patrones existentes**: Otros módulos (Community, Chat) ya cargan datos desde BD exitosamente

### 4. ESTRUCTURA DEL FRONTEND
- **HTML**: `src/Notices/notices.html` - Estructura completa con modales, filtros, etc.
- **CSS**: `src/Notices/notices.css` - Estilos completos para todas las vistas
- **JS**: `src/Notices/notices.js` - Lógica completa pero sin conexión a BD

## TAREAS A REALIZAR

### PASO 1: Crear API Endpoint para Noticias
**Archivo**: `server.js`
**Acción**: Agregar endpoint `/api/news` que:
- Consulte la tabla `news` de Supabase
- Filtre por `status = 'published'`
- Ordene por `published_at DESC`
- Retorne datos en formato JSON compatible con el frontend

### PASO 2: Implementar Carga de Datos en Frontend
**Archivo**: `src/Notices/notices.js`
**Acción**: Reemplazar la función `loadNewsData()` para:
- Hacer fetch al endpoint `/api/news`
- Mapear datos de BD al formato esperado por el frontend
- Manejar errores y estados de carga
- Implementar fallback si falla la conexión

### PASO 3: Mapeo de Datos
**Transformación necesaria**:
```javascript
// De BD (Supabase) a Frontend
{
  id: news.id,
  title: news.title,
  excerpt: news.subtitle || news.intro,
  category: 'tecnologia', // Mapear desde sections o crear campo
  categoryLabel: 'Tecnología',
  author: 'Sistema', // O desde created_by
  date: news.published_at,
  views: 0, // O desde metrics
  comments: 0,
  image: 'fas fa-newspaper', // O desde hero_image_url
  featured: false, // Lógica para determinar
  hasDetailedView: true,
  detailedData: {
    tldr: news.tldr,
    suggestedSteps: news.sections?.steps || [],
    risks: news.sections?.risks || [],
    resources: news.links || [],
    whyMatters: news.sections?.whyMatters || [],
    whatChanged: news.sections?.whatChanged || [],
    impact: news.sections?.impact || [],
    cta: news.cta?.text || 'Leer más'
  }
}
```

### PASO 4: Verificar Conexión Supabase
**Archivo**: `src/Notices/notices.html`
**Acción**: Asegurar que se incluyan los scripts de Supabase:
```html
<script src="../scripts/supabase-client.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### PASO 5: Testing y Validación
**Acciones**:
1. Verificar que la noticia en BD tenga `status = 'published'`
2. Probar el endpoint `/api/news` directamente
3. Verificar que el frontend cargue y muestre la noticia
4. Probar funcionalidades: filtros, búsqueda, modal detallado

## ARCHIVOS A MODIFICAR

1. **`server.js`** - Agregar endpoint `/api/news`
2. **`src/Notices/notices.js`** - Implementar `loadNewsData()` real
3. **`src/Notices/notices.html`** - Verificar scripts de Supabase (si es necesario)

## PATRONES A SEGUIR

**Usar como referencia**:
- `src/Chat-Online/chat-online.js` líneas 4898-4994 (carga desde BD)
- `src/Community/community-view.html` líneas 1854-1883 (inicialización de datos)
- `server.js` líneas 2082-2088 (consulta a tabla news)

## RESULTADO ESPERADO

Después de implementar estos cambios:
1. La noticia existente en la BD se mostrará en el frontend
2. El sistema estará preparado para agregar más noticias
3. Todas las funcionalidades (filtros, búsqueda, modal) funcionarán con datos reales
4. El sistema será escalable para futuras noticias

## PRIORIDAD

**ALTA** - Este es un problema crítico que impide que el sistema de noticias funcione correctamente, a pesar de tener toda la infraestructura y UI implementada.

---

**INSTRUCCIONES PARA CLAUDE**: Implementa estos cambios paso a paso, comenzando por el endpoint de API y luego la integración en el frontend. Usa los patrones existentes en el código para mantener consistencia.
