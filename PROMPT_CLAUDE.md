Quiero que conectes los comentarios y reacciones de los posts de comunidades a Supabase. El proyecto ya tiene:

src/Community/community.js con carga de comunidades, stats, listados y utilidades DB (clase CommunityPage). 

community

src/Community/community-view.html con postsList, botón “Publicar”, modal de post y campo #modalCommentInput para comentar (agrega listeners reales). También existen contadores de Posts/Comentarios/Reacciones en el banner. 

community-view

src/Community/community-auth.js con CommunityAuth y helpers para obtener userId/sesión de Supabase; úsalo para requerir sesión antes de comentar/reaccionar. 

community-auth

src/Community/community-identifier.js para obtener communityId o slug de la comunidad actual. 

community-identifier

src/Community/community.css ya estiliza banner, contadores y cards; reutiliza estilos y clases existentes al renderizar comentarios debajo de cada post. 

community

src/Community/community.html (discover) ya muestra tarjetas; no cambies Discover. 

community

Objetivo

Comentar posts y ver el hilo de comentarios.

Reaccionar (like/🔥) con toggle y conteo.

Mantener y actualizar puntos de ligas (+10 publicar, +5 comentar, +2 reaccionar) de manera idéntica a como se hacía antes (si hay utilidades de puntos, reutilízalas; si no, deja un TODO: bien marcado).

Respetar RLS: toda escritura debe ir autenticada con supabase.auth, usando los RPC:

rpc_add_comment(p_post_id uuid, p_content text)

rpc_toggle_reaction(p_post_id uuid, p_reaction text default 'like')

Yo ya ejecuté en Supabase el DDL y RPCs necesarios.

Entregables exactos

CommunityDatabase (si ya existe dentro del bundle, extiéndelo; si no, crea un módulo DB separado y úsalo desde community.js):

async addComment(postId: string, content: string)

Llama supabase.rpc('rpc_add_comment', { p_post_id: postId, p_content: content }).

Devuelve el comentario insertado y actualiza el contador comment_count en el modelo local.

async listComments(postId: string)

from('community_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true }).

async toggleReaction(postId: string, reaction = 'like')

rpc_toggle_reaction y devuelve { reacted, total_reactions }.

async getReactions(postId: string) (opcional, para hidratar lista inicial).

Asegúrate de inicializar el cliente de Supabase una sola vez usando las <meta name="supabase-url|key"> que ya están en los HTML. (Se usa en los archivos actuales).

UI/DOM en community-view.html + community.js:

En el render de cada post dentro de #postsList, añade:

Botón de reacción (icono 🔥 o ❤️) con contador y estado activo si el usuario ya reaccionó.

Botón/CTA “Comentar” que abre el post modal (#postModal ya existe) precargando el contenido del post en #modalPostBody y enfocando #modalCommentInput. 

community-view

Al abrir el modal, carga listComments(postId) y pinta el hilo (nombre, fecha relativa, contenido).

Enviar comentario: al click de #modalSendComment o Enter en #modalCommentInput, valida no vacío, llama addComment, agrega el comentario al DOM, limpia input, y actualiza:

Contador #totalComments del banner si corresponde a la comunidad visible,

Contador del post en la tarjeta,

Puntos del usuario (+5) usando el mecanismo ya existente para publicar (+10). Si no hay utilidades, deja TODO(points): comentado con la llamada prevista.

Reacción: toggleReaction deberá:

Cambiar estado del botón (activo/inactivo),

Actualizar contador del post (y #totalReactions de la cabecera si aplica),

Sumar puntos (+2) al reaccionar; nada al quitar.

Autenticación

Antes de addComment o toggleReaction, exige sesión: usa CommunityAuth.requireSupabaseSession(); si no hay sesión, dispara el evento community:auth-required (ya gestionado en los módulos actuales) y muestra un toast. 

community-auth

Resiliencia / DX

Maneja errores con logs [COMMENTS] y [REACTIONS] (+ toast de UI).

Deshabilita botones mientras hay petición en curso.

Evita dobles envíos con un inFlight por post.

Accesibilidad/UX

Enter para enviar comentario, Esc para cerrar modal.

Scroll al último comentario tras enviar.

Estado vacío: “Sé el primero en comentar”.

Puntos de integración (para que ubiques hooks existentes)

La página ya renderiza banner y contadores (#totalPosts, #totalComments, #totalReactions) en la cabecera de la comunidad. Actualízalos cuando modifiques datos. 

community-view

CommunityIdentifier provee communityId/slug de la comunidad actual; úsalo si necesitas validar que el post pertenece a la comunidad visible. 

community-identifier

CommunityAuth ya implementa varios métodos de obtención de userId y validación de sesión; no repliques lógica, consúmela. 

community-auth

Aceptación (QA rápido)

Puedo abrir community-view.html?slug=<slug> y:

Publicar un post (ya funciona), luego comentar ese post y ver el comentario al instante y persistente tras recargar.

Reaccionar (toggle) y ver el contador cambiar.

Ver errores manejados si quito RLS o revoco sesión.

RLS: si no estoy en la comunidad privada, no puedo comentar/reaccionar (pruébalo en incógnito).

Los puntos del perfil reflejan +5 / +2