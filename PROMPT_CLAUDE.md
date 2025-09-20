Contexto

En la vista de comunidad se agregaron flujos de “Solicitar acceso” para comunidades invite_only.

En runtime, la consola muestra:

Auth session missing! y Session no encontrada o inválida provenientes de community-auth.js.

POST .../rest/v1/community_access_requests 401 (Unauthorized) y, acto seguido, 42501 new row violates row-level security policy for table "community_access_requests".

Hay un usuario en localStorage (currentUser) pero no hay sesión de Supabase; por eso la llamada al REST va sin Authorization: Bearer <access_token> y falla RLS.

Archivos relevantes

src/Community/community-view.html (meta con supabase-url/key, botones “Solicitar acceso / pendiente”). 

community-view

src/Community/community.js (clase CommunityPage, métodos init, loadCommunityData, getLastRequest, isMember, requestAccess, etc.). 

community

src/Community/community.css (estilos y clases usadas en la vista, incl. banner y acciones). 

community

src/Community/community-auth.js (clase CommunityAuth con métodos supabaseGetSession, supabaseGetUser, getCurrentUserId, etc.). 

community-auth

src/Community/community.html (Discover + wiring general y meta supabase). 

community

Objetivo

No depender de localStorage.currentUser para acciones protegidas.

Requerir sesión real de Supabase antes de leer estado (isMember/getLastRequest) o insertar solicitudes.

Usar RPC rpc_request_access(p_community_id uuid) para crear la solicitud (seguridad por auth.uid()), no acceso directo a tabla.

Manejar estados de UI:

Sin sesión → mostrar CTA “Inicia sesión para solicitar acceso” (modal o toast) y bloquear botones.

Con sesión → permitir Solicitar acceso y reflejar “pendiente / rechazada / aprobada”.

Tareas concretas (por archivo)

1) community-auth.js

Añade hasSupabaseSession() y requireSupabaseSession():

hasSupabaseSession() devuelve true si await supabase.auth.getSession() trae data.session con user.

requireSupabaseSession() comprueba sesión; si no hay, emite un evento global community:auth-required o llama a un callback para abrir modal/login.

Ajusta logs para no confundir: cuando se usa localStorageCurrentUser, no marcarlo como autenticación válida; úsalo solo para UI (nombre/avatar), no para permisos.

Exporta helpers:

window.hasCommunitySession = () => window.CommunityAuth.hasSupabaseSession();
window.requireCommunitySession = () => window.CommunityAuth.requireSupabaseSession();


Mantén debugAuthState() pero deja claro en consola cuándo no existe sesión y que el localStorage no habilita RLS. 

community-auth

2) community.js

En init():

Tras ensureSupabaseClient(), llama a await window.hasCommunitySession().

Si no hay sesión, deshabilita acciones protegidas (descubrir puede cargar, pero no debe consultar isMember/getLastRequest ni mostrar botón “Solicitar acceso” como activo).

En openAccessRequestModal, isMember, getLastRequest, y especialmente requestAccess:

Primer paso: if (!(await window.hasCommunitySession())) { await window.requireCommunitySession(); showToast("Inicia sesión para continuar", "warning"); return; }

Reemplaza el insert directo a la tabla community_access_requests por una llamada a RPC:

await supabase.rpc('rpc_request_access', { p_community_id: communityId });


Esto evita tener que mandar requester_id desde el cliente y hace que RLS pase usando auth.uid().

Donde se chequea estado de solicitud (getLastRequest) o membresía (isMember), omite las llamadas si no hay sesión (retorna null/false y UI en modo lectura).

Si recibes 401 en cualquier operación Supabase, muestra un toast claro y bloquea el botón por unos segundos para evitar spam. 

community

3) community-view.html y community.html

Asegura que los botones de banner (“Solicitar acceso / Solicitud pendiente”) existan y se muestren solo si hay sesión y visibility='invite_only'. Si no hay sesión, muestra botón “Inicia sesión”.

Verifica que el cliente de Supabase se inicializa una sola vez con persistSession: true, autoRefreshToken: true. (La página ya tiene las metas supabase-url y supabase-key; respétalas).

4) Manejo de estados de UI

Estados de botón en banner y Discover:

no-session: botón “Inicia sesión” → llama a requireCommunitySession()

invite_only + !member + no request: “Solicitar acceso”

invite_only + request pending: “Solicitud pendiente” (disabled)

invite_only + request rejected: “Volver a solicitar” (opcional, reintento crea nueva solicitud si la anterior no está pending)

Si la comunidad es public, nunca mostrar “Solicitar acceso”.

5) Errores actuales y su causa — y cómo se corrigen

401 Unauthorized al POST /rest/v1/community_access_requests: el cliente no lleva Authorization: Bearer <access_token> porque no hay sesión. Solución: requerir sesión antes y usar RPC en lugar de from('community_access_requests').insert(...).

42501 new row violates row-level security policy: con anon o sin auth.uid() la política RLS bloquea el INSERT. Con RPC + sesión, pasa.

Logs “Session no encontrada” y “Auth session missing!”: son correctos; hay que degradar UI cuando no hay sesión en lugar de seguir con llamadas protegidas. 

community-auth

Cambios de código sugeridos (extractos)

En community-auth.js:

async hasSupabaseSession() {
  if (!window.supabase?.auth?.getSession) return false;
  const { data, error } = await window.supabase.auth.getSession();
  return !!(data?.session?.user?.id) && !error;
}
async requireSupabaseSession() {
  const has = await this.hasSupabaseSession();
  if (has) return true;
  // dispara evento para que UI muestre login modal / redireccione
  window.dispatchEvent(new CustomEvent('community:auth-required'));
  this.warn('Se requiere autenticación para continuar');
  return false;
}


En community.js (dentro de requestAccess(communityId)):

if (!(await window.hasCommunitySession())) {
  await window.requireCommunitySession();
  this.showToast('Inicia sesión para solicitar acceso', 'warning');
  return;
}
try {
  console.log('[ACCESS] 🚀 Solicitando acceso vía RPC…');
  const { error } = await window.supabase.rpc('rpc_request_access', { p_community_id: communityId });
  if (error) throw error;
  this.showToast('Solicitud enviada', 'success');
  // refrescar estado: getLastRequest / UI
} catch (e) {
  if (e?.status === 401) {
    this.showToast('Tu sesión expiró. Inicia sesión e inténtalo de nuevo.', 'error');
  } else {
    this.showToast('No se pudo enviar la solicitud. Inténtalo más tarde.', 'error');
  }
  console.error('[ACCESS] ❌ Error solicitando acceso:', e);
}


En renderizado del banner (páginas view/discover): si !hasSession, pinta botón “Inicia sesión”; si hasSession y comunidad invite_only & !member, pinta “Solicitar acceso”; si pending, “Solicitud pendiente” (disabled).

Asegurarte de que existe el RPC en BD
(Gael ya lo ejecutó / lo ejecutará en Supabase)

create or replace function public.rpc_request_access(p_community_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  insert into public.community_access_requests (community_id, requester_id)
  values (p_community_id, auth.uid());
end; $$;
grant execute on function public.rpc_request_access(uuid) to authenticated;


Criterios de aceptación

Sin sesión:

supabase.auth.getSession() devuelve null → botones protegidos deshabilitados o “Inicia sesión”.

No se intenta getLastRequest/isMember ni se hace insert; no aparecen 401/42501.

Con sesión válida:

rpc_request_access crea la solicitud sin enviar requester_id desde el cliente.

UI actualiza a “Solicitud pendiente”.

No hay 401; no hay 42501.

Regresión: comunidades públicas siguen funcionando sin fricción.

Pruebas manuales

Abrir Discover sin sesión → ver CTA “Inicia sesión para solicitar acceso”.

Iniciar sesión (con Supabase Auth) → Discover muestra “Solicitar acceso” en invite_only.

Click “Solicitar acceso” → RPC OK, UI pasa a “Solicitud pendiente”.

Cerrar sesión → volver a ver CTA de login y sin llamadas protegidas.

Aprobar en BD → al recargar, el usuario ya es miembro y puede publicar (composer habilitado).

Notas

No elimines la info de localStorage.currentUser, pero úsala solo para UI (nombre/avatar). Nunca como prueba de autenticación.

Asegura en la inicialización del cliente Supabase persistSession: true y autoRefreshToken: true.

Evita llamadas duplicadas a initializeSupabaseClient(); ya hay ensureSupabaseClient() en community.js. 

community