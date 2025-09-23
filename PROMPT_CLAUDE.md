# Prompt para Claude: Gestión de Solicitudes de Acceso a Comunidades

## Contexto del Proyecto
Necesito que agregues una nueva funcionalidad al panel de administración de Chat-Bot-LIA para gestionar las solicitudes de acceso a comunidades. Esta funcionalidad debe permitir a los administradores aprobar o rechazar solicitudes de usuarios que quieren unirse a diferentes comunidades.

## Estructura de Base de Datos

### Tabla: community_access_requests
```sql
create table public.community_access_requests (
  id uuid not null default gen_random_uuid (),
  community_id uuid not null,
  requester_id uuid not null default auth.uid (),
  status text not null default 'pending'::text,
  note text null,
  reviewed_by uuid null,
  created_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone null,
  constraint community_access_requests_pkey primary key (id),
  constraint community_access_requests_community_id_fkey foreign KEY (community_id) references communities (id) on delete CASCADE,
  constraint community_access_requests_requester_id_fkey foreign KEY (requester_id) references users (id) on delete CASCADE,
  constraint community_access_requests_reviewed_by_fkey foreign KEY (reviewed_by) references users (id),
  constraint community_access_requests_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;
```

### Proceso de Aprobación (Ejemplo)
```sql
BEGIN;

-- 1) Aprobar la solicitud (idempotente: solo si sigue 'pending')
UPDATE public.community_access_requests
SET status      = 'approved',
    reviewed_at = now(),
    reviewed_by = COALESCE(reviewed_by, auth.uid())
WHERE id     = 'eb8294f1-0aad-4010-9e66-e4c4bb7bd8c0'::uuid
  AND status = 'pending';

-- 2) Conceder/activar la membresía en la comunidad (sin duplicar filas)
INSERT INTO public.community_members (community_id, user_id, role, is_active)
SELECT 'b3b154e1-110e-4aa7-8998-ef208482a159'::uuid,
       '1b5270b3-d1f1-4418-8804-205aa6d63b0b'::uuid,
       'member',
       true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.community_members m
  WHERE m.community_id = 'b3b154e1-110e-4aa7-8998-ef208482a159'::uuid
    AND m.user_id      = '1b5270b3-d1f1-4418-8804-205aa6d63b0b'::uuid
);

-- 2b) Si ya existía la fila, asegúrate de re-activarla
UPDATE public.community_members
SET is_active = true
WHERE community_id = 'b3b154e1-110e-4aa7-8998-ef208482a159'::uuid
  AND user_id      = '1b5270b3-d1f1-4418-8804-205aa6d63b0b'::uuid;

COMMIT;
```

## Requerimientos Específicos

### 1. Nueva Sección en el Menú Lateral
Agrega una nueva opción en el menú lateral del panel de administración (`src/admin/admin.html`) con:
- **Icono**: `fas fa-user-check` (Font Awesome)
- **Texto**: "Solicitudes de Comunidad"
- **Data-section**: "community-requests"
- **Posición**: Después de la sección "Comunidad" existente

### 2. Nueva Sección de Contenido
Crea una nueva sección de contenido (`communityRequestsContent`) que incluya:

#### 2.1 Header de Sección
- Título: "Gestión de Solicitudes de Comunidad"
- Subtítulo: "Aprobar o rechazar solicitudes de acceso a comunidades"
- Botón de actualización: "Actualizar Lista"

#### 2.2 Filtros
- **Búsqueda por texto**: Campo de búsqueda para filtrar por nombre de usuario, email o nombre de comunidad
- **Filtro por estado**: Dropdown con opciones (Todas, Pendientes, Aprobadas, Rechazadas)
- **Filtro por comunidad**: Dropdown con lista de comunidades disponibles
- **Filtro por fecha**: Rango de fechas para filtrar solicitudes

#### 2.3 Tabla de Solicitudes
Tabla responsiva con las siguientes columnas:
- **Usuario**: Avatar, nombre completo y email
- **Comunidad**: Nombre de la comunidad solicitada
- **Estado**: Badge con colores (Pendiente: amarillo, Aprobada: verde, Rechazada: rojo)
- **Fecha de Solicitud**: Fecha y hora formateada
- **Nota**: Nota opcional del solicitante (truncada con tooltip)
- **Acciones**: Botones para Aprobar, Rechazar y Ver Detalles

#### 2.4 Estadísticas
Tarjetas de estadísticas mostrando:
- Total de solicitudes pendientes
- Solicitudes aprobadas este mes
- Solicitudes rechazadas este mes
- Tiempo promedio de respuesta

### 3. Funcionalidad JavaScript

#### 3.1 Carga de Datos
- Función `loadCommunityRequestsData()` que obtenga las solicitudes desde `/api/admin/community-requests`
- Manejo de estados de carga y errores
- Actualización automática cada 30 segundos

#### 3.2 Filtrado
- Función `filterCommunityRequests()` que filtre en tiempo real
- Combinación de filtros múltiples
- Persistencia de filtros en localStorage

#### 3.3 Acciones de Aprobación/Rechazo
- Modal de confirmación para aprobar solicitud
- Modal de confirmación para rechazar (con campo de motivo opcional)
- Función `approveRequest(requestId)` que llame a `/api/admin/community-requests/{id}/approve`
- Función `rejectRequest(requestId, reason)` que llame a `/api/admin/community-requests/{id}/reject`
- Actualización automática de la tabla después de cada acción

#### 3.4 Modal de Detalles
- Modal que muestre información completa de la solicitud
- Historial de la solicitud
- Información del usuario y comunidad
- Botones de acción dentro del modal

### 4. Estilos CSS
- Mantener consistencia con el diseño existente
- Usar las variables CSS definidas en `admin.css`
- Estados hover y focus apropiados
- Responsive design para móviles
- Animaciones suaves para transiciones

### 5. Integración con Sistema Existente
- Agregar la nueva sección al método `navigateToSection()` en `admin.js`
- Agregar título de sección en `getSectionTitle()`
- Agregar carga de datos en `loadSectionData()`
- Mantener el patrón de autenticación existente con `makeAuthenticatedRequest()`

### 6. Endpoints de API Requeridos
La funcionalidad debe integrarse con estos endpoints (que deben ser implementados en el backend):
- `GET /api/admin/community-requests` - Obtener lista de solicitudes
- `PUT /api/admin/community-requests/{id}/approve` - Aprobar solicitud
- `PUT /api/admin/community-requests/{id}/reject` - Rechazar solicitud
- `GET /api/admin/communities` - Obtener lista de comunidades para filtros

### 7. Consideraciones de UX
- Notificaciones toast para acciones exitosas/fallidas
- Confirmaciones antes de acciones destructivas
- Estados de carga claros
- Mensajes informativos cuando no hay datos
- Accesibilidad (ARIA labels, navegación por teclado)

### 8. Validaciones
- Verificar permisos de administrador antes de mostrar la sección
- Validar que las solicitudes existan antes de procesarlas
- Manejo de errores de red y timeouts
- Prevención de doble-click en botones de acción

## Archivos a Modificar
1. `src/admin/admin.html` - Agregar nueva sección al menú y contenido
2. `src/admin/admin.js` - Agregar funcionalidad JavaScript
3. `src/admin/admin.css` - Agregar estilos específicos (si es necesario)

## Notas Adicionales
- Mantener la consistencia visual con el resto del panel
- Usar los iconos de Font Awesome ya incluidos
- Seguir el patrón de código existente
- Asegurar que la funcionalidad sea completamente responsive
- Implementar manejo de errores robusto
- Agregar logs de consola para debugging

Por favor, implementa esta funcionalidad siguiendo exactamente estos requerimientos y manteniendo la consistencia con el código existente.