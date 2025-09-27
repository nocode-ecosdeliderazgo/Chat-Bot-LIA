Quiero que refactorices mi proyecto Comunidad para resolver un bug de UI al votar en encuestas.

Contexto del bug

El voto sí se guarda en la base de datos y el backend (server.js) responde correctamente.

El problema está en el frontend: después de votar, desaparecen todos los posts y el contenedor queda vacío hasta que refresco la página.

En los logs se ve:

❌ Post no encontrado para actualizar

⚠️ Variable global posts no encontrada - probablemente usando CommunitySystem puro

🎨 [DEBUG] Limpiando postsContainer y re-renderizando 0 posts

Causa raíz (ya identificada)

En el frontend conviven dos sistemas de render:

Uno global, que usa window.posts y la función window.renderPosts('all').

Otro basado en la clase CommunitySystem, que usa this.posts y this.renderPosts().

Después de votar, algunas ramas de voteInPoll llaman a this.renderPosts() con this.posts vacío → limpia el contenedor y deja la lista en 0.

Hay duplicados de voteInPoll en varios archivos (community.js, community-view.html inline script), con implementaciones diferentes: unas actualizan local/global, otras recargan desde DB, otras llaman al render viejo.

Lo que necesitas hacer

Unificar voteInPoll:

Elimina las múltiples versiones.

Conserva una sola implementación, la que después de registrar el voto hace:

if (typeof window.loadPostsFromDatabase === 'function') {
  await window.loadPostsFromDatabase();   // repuebla window.posts
}
if (typeof window.renderPosts === 'function') {
  window.renderPosts('all');              // re-pinta con window.posts
} else if (window.communitySystem?.loadPosts) {
  await window.communitySystem.loadPosts();
}


Esta es la única que garantiza que los posts se repinten bien tras el voto.

Borra las ramas que llaman a this.renderPosts() directamente después del voto.

Eliminar código muerto/duplicado:

Borra las implementaciones redundantes de voteInPoll.

Asegúrate de que cualquier llamada al voto use la función unificada.

Clarificar responsabilidades:

CommunitySystem se mantiene como manejador de datos y utilidades.

El render principal de comunidad debe ser siempre window.renderPosts('all') con window.posts como fuente de verdad.

Opcional: sincroniza window.communitySystem.posts = [...window.posts] después de cada carga, si quieres mantener ambos en paralelo.

Validar flujo completo:

Crear post con encuesta.

Votar → sin refrescar deben verse los resultados actualizados, y el resto de posts deben permanecer en pantalla.

Revisar que no vuelva a aparecer el log “re-renderizando 0 posts”.

Archivos involucrados

community-view.html

community.js

community-identifier.js

community-auth.js (si tiene lógica de voto)

server.js (ya está bien, solo asegúrate de que responde con JSON correcto)

Entregables

Un diff limpio con los cambios aplicados.

Explicación breve de:

Qué se eliminó (duplicados de voteInPoll).

Qué se centralizó (render → siempre global).

Cómo quedó la nueva versión de voteInPoll.