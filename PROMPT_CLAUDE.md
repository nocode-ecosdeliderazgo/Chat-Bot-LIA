
Quiero que fijes el botón de perfil de `src/perfil-cuestionario.html` arriba a la derecha, idéntico al de la página de cursos. Deja el menú de perfil desplegable justo debajo. Elimina cualquier texto/logo del header de esta vista.

Contexto y archivos:
- HTML: `src/perfil-cuestionario.html`
- CSS de esta vista: `styles/profile.css`
- JS de esta vista: `scripts/perfil-cuestionario.js`
- Referencia visual: en “Cursos” el botón usa clase `header-profile` fijo top-right.

Tareas:
1) HTML (src/perfil-cuestionario.html)
- Asegura que exista el botón:
```html
<div class="nav-actions">
  <button class="header-profile" onclick="toggleProfileMenu(event)">
    <img src="assets/images/icono.png" alt="Perfil" />
  </button>
</div>
<div id="profileMenu" class="profile-menu">
  <div class="pm-section">
    <div class="pm-item" onclick="handleLogout()"><i class='bx bx-log-out'></i> Cerrar sesión</div>
  </div>
</div>
```
- Elimina cualquier texto/logo en el header de ESTA página (deja `nav-logo` vacío o elimínalo):
```html
<div class="nav-logo"></div>
```

2) CSS (styles/profile.css)
- Al FINAL del archivo, añade/ajusta estas reglas (deben ganar a cualquier estilo previo):
```css
/* Botón de perfil fijo arriba-derecha (igual que cursos) */
.header-profile {
  position: fixed !important;
  top: 12px !important;
  right: 20px !important;
  left: auto !important;
  bottom: auto !important;
  z-index: 5000 !important;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(68,229,255,.35);
  padding: 0;
  background: rgba(7,17,36,.4);
  cursor: pointer;
  display: inline-flex;
}
.header-profile:hover { filter: brightness(1.05); }
.header-profile img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Menú anclado al botón */
.profile-menu {
  position: fixed;
  top: 72px;
  right: 16px;
  background: rgba(12,14,18,0.96);
  border: 1px solid rgba(68,229,255,0.25);
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.45);
  z-index: 5100;
  min-width: 220px;
  overflow: hidden;
  display: none;
}
.profile-menu.show { display: block; }

/* Ocultar logo/título en esta vista */
.nav-logo { display: none; }
```

3) JS (scripts/perfil-cuestionario.js)
- Usa clase `.show` para abrir/cerrar el menú. Asegura este bloque:
```js
document.addEventListener('DOMContentLoaded', () => {
  window.toggleProfileMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const menu = document.getElementById('profileMenu');
    if (!menu) return;
    menu.classList.toggle('show');
  };

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('profileMenu');
    const btn = document.querySelector('.header-profile');
    if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('show');
    }
  });

  window.handleLogout = () => {
    try { localStorage.clear(); } catch (e) {}
    window.location.href = 'login/new-auth.html';
  };
});
```

Criterios de aceptación:
- El botón `header-profile` queda fijo en la esquina superior derecha (top: 12px, right: 20px), por encima de cualquier layout (verifica `z-index`).
- El menú se despliega debajo del botón (top: 72px, right: 16px) y se cierra al hacer clic fuera.
- En esta página no se muestra texto/logo en el header.
- Funciona igual en desktop y móvil (≤ 480px) sin moverse de la esquina.
- No rompe partículas, fondo ni el formulario.

Notas:
- Si hay estilos de otra hoja que lo sobreescriben, mantén estas reglas al final de `styles/profile.css`. Usa `!important` solo donde sea necesario para garantizar la posición fija.


