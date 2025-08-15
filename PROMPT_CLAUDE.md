Necesito que termines de conectar y hacer funcionar mi nueva pantalla de autenticación (login/registro) con Supabase y/o mi API. La UI ya está lista, pero los botones “Crear cuenta” e “Ingresar” no terminan el flujo aunque los formularios sean válidos. Debes corregir el código para que:

1) Priorice Supabase (auth + tabla public.users) y, si no existe, use mi API (compat con login anterior). Si tampoco hay backend, puedes dejar modo dev.

2) Corrijas los errores de consola y de validación que están bloqueando el submit. Este es el log real que obtengo al pulsar “Crear cuenta”:

- Uncaught SyntaxError: Unexpected token 'export'
- new-auth.js:161 [DEBUG] setupFormSubmissions called
- new-auth.js:162 [DEBUG] loginForm found: true
- new-auth.js:163 [DEBUG] registerForm found: true
- new-auth.js:164 [DEBUG] registerBtn found: true
- new-auth.js:168 [DEBUG] Login form submit listener added
- new-auth.js:173 [DEBUG] Register form submit listener added
- new-auth.js:199 [DEBUG] Register button click listener added
- new-auth.js:178 [DEBUG] Register button clicked!
- new-auth.js:179 [DEBUG] Auth state loading: false
- new-auth.js:180 [DEBUG] Form validity: true
- new-auth.js:195 [DEBUG] Calling handleRegister directly
- new-auth.js:627 [DEBUG] handleRegister called
- new-auth.js:635 [DEBUG] Creating FormData from target: <form id="registerFormElement" class="form">…</form>
- new-auth.js:640 [DEBUG] FormData - first_name: …
- …
- new-auth.js:824 [DEBUG] validateRegisterForm called with: …
- new-auth.js:411 Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'borderColor')
    at validateEmail (new-auth.js:411:29)
    at validateRegisterForm (new-auth.js:852:10)
    at handleRegister (new-auth.js:657:10)
    at HTMLButtonElement.<anonymous> (new-auth.js:197:17)

El error de “Cannot set properties of undefined (setting 'borderColor')” indica que está llamándose a validateEmail pasándole un objeto simulado { value } sin ser un input real, y luego se hace input.style.borderColor, lo que rompe. Corrige validateEmail para aceptar tanto un input DOM como un string y no tocar estilos si no es un elemento. Ejemplo: si recibe string → validar y devolver boolean sin tocar estilos.

3) Implementa el flujo Supabase real:
- Login:
  - Permitir email o username. Si se escribe username, resolver email: select email from public.users where username = <username> single.
  - Luego auth.signInWithPassword({ email, password }).
  - Guardar currentUser (supabase.auth.getUser()) y “recordarme” (emailOrUsername y timestamp) en localStorage.
  - Redirigir a ../courses.html.

- Registro:
  - auth.signUp({ email, password, options: { data: { first_name, last_name, username, phone } } }).
  - Si hay sesión, upsert en public.users (id=auth.user.id) con: first_name, last_name, username, email, phone, cargo_rol='Usuario', type_rol='usuario', updated_at = now().
  - Cambiar a login y prellenar email. 

4) Backend alternativo (si no hay Supabase):
- POST /api/auth/login: { identifier, password, remember } → { success, token?, user? }
- POST /api/auth/register: { firstName, lastName, username, email, phone, password } → { success, user? }
- En éxito, guarda token y user y redirige.

5) Robustecer los listeners:
- Asegura que el submit del formulario y el click del botón lleven al mismo flujo (sin doble envío).
- Si el form es inválido, usar form.reportValidity().
- En tabs, habilita click y Enter/Espacio para accesibilidad; deep-link ?mode=register o #register.

6) No toques el diseño. Solo corrige JS y la integración. Carga de Supabase:
- src/login/new-auth.html tiene meta:
  - <meta name="supabase-url" content="https://TU-PROYECTO.supabase.co">
  - <meta name="supabase-key" content="TU_ANON_PUBLIC">
- scripts/supabase-client.js debe leer estas metas y exportar window.supabase (sin usar “export” en archivos que se cargan como script no-module; usa UMD o asignación a window para evitar “Unexpected token 'export'”).

7) Entregables:
- src/login/new-auth.js: corregido, sin errores, con validaciones y flujos descritos, logs de error/éxito claros.
- scripts/supabase-client.js: sin “export” ESModule si se usa como <script> clásico; asegurar que no dispare “Unexpected token 'export'” en entornos no module.
- Confirmar que “Crear cuenta” y “Ingresar” funcionan, registran y loguean realmente en Supabase (public.users) y redirigen a ../courses.html.

Criterios de aceptación:
- El error “Unexpected token 'export'” desaparece.
- El error de validateEmail (borderColor) desaparece.
- Se puede registrar y loguear; en login con username se resuelve email y funciona.
- En localStorage se guarda currentUser y recordarme (si corresponde).
- Redirección a ../courses.html tras éxito.


LOG COMPLETO
supabase-client.js:25 Uncaught SyntaxError: Unexpected token 'export'
new-auth.js:161 [DEBUG] setupFormSubmissions called
new-auth.js:162 [DEBUG] loginForm found: true
new-auth.js:163 [DEBUG] registerForm found: true
new-auth.js:164 [DEBUG] registerBtn found: true
new-auth.js:168 [DEBUG] Login form submit listener added
new-auth.js:173 [DEBUG] Register form submit listener added
new-auth.js:199 [DEBUG] Register button click listener added
new-auth.js:178 [DEBUG] Register button clicked!
new-auth.js:179 [DEBUG] Auth state loading: false
new-auth.js:180 [DEBUG] Form validity: true
new-auth.js:195 [DEBUG] Calling handleRegister directly
new-auth.js:627 [DEBUG] handleRegister called
new-auth.js:635 [DEBUG] Creating FormData from target: <form id=​"registerFormElement" class=​"form">​…​</form>​
new-auth.js:640 [DEBUG] FormData - first_name: Fernando
new-auth.js:640 [DEBUG] FormData - last_name: Suarez
new-auth.js:640 [DEBUG] FormData - username: FernandoSG
new-auth.js:640 [DEBUG] FormData - phone: +52 55 1234 5678
new-auth.js:640 [DEBUG] FormData - email: fernando.suarez@ecosdeliderazgo.com
new-auth.js:640 [DEBUG] FormData - password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - confirm_password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - accept_terms: on
new-auth.js:640 [DEBUG] FormData - accept_privacy: on
new-auth.js:654 [DEBUG] Parsed userData: Object
new-auth.js:824 [DEBUG] validateRegisterForm called with: Object
new-auth.js:411 Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'borderColor')
    at validateEmail (new-auth.js:411:29)
    at validateRegisterForm (new-auth.js:852:10)
    at handleRegister (new-auth.js:657:10)
    at HTMLButtonElement.<anonymous> (new-auth.js:197:17)
new-auth.js:178 [DEBUG] Register button clicked!
new-auth.js:179 [DEBUG] Auth state loading: false
new-auth.js:180 [DEBUG] Form validity: true
new-auth.js:195 [DEBUG] Calling handleRegister directly
new-auth.js:627 [DEBUG] handleRegister called
new-auth.js:635 [DEBUG] Creating FormData from target: <form id=​"registerFormElement" class=​"form">​…​</form>​
new-auth.js:640 [DEBUG] FormData - first_name: Fernando
new-auth.js:640 [DEBUG] FormData - last_name: Suarez
new-auth.js:640 [DEBUG] FormData - username: FernandoSG
new-auth.js:640 [DEBUG] FormData - phone: +52 55 1234 5678
new-auth.js:640 [DEBUG] FormData - email: fernando.suarez@ecosdeliderazgo.com
new-auth.js:640 [DEBUG] FormData - password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - confirm_password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - accept_terms: on
new-auth.js:640 [DEBUG] FormData - accept_privacy: on
new-auth.js:654 [DEBUG] Parsed userData: Object
new-auth.js:824 [DEBUG] validateRegisterForm called with: Object
new-auth.js:411 Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'borderColor')
    at validateEmail (new-auth.js:411:29)
    at validateRegisterForm (new-auth.js:852:10)
    at handleRegister (new-auth.js:657:10)
    at HTMLButtonElement.<anonymous> (new-auth.js:197:17)
new-auth.js:178 [DEBUG] Register button clicked!
new-auth.js:179 [DEBUG] Auth state loading: false
new-auth.js:180 [DEBUG] Form validity: true
new-auth.js:195 [DEBUG] Calling handleRegister directly
new-auth.js:627 [DEBUG] handleRegister called
new-auth.js:635 [DEBUG] Creating FormData from target: <form id=​"registerFormElement" class=​"form">​…​</form>​
new-auth.js:640 [DEBUG] FormData - first_name: Fernando
new-auth.js:640 [DEBUG] FormData - last_name: Suarez
new-auth.js:640 [DEBUG] FormData - username: FernandoSG
new-auth.js:640 [DEBUG] FormData - phone: +52 55 1234 5678
new-auth.js:640 [DEBUG] FormData - email: fernando.suarez@ecosdeliderazgo.com
new-auth.js:640 [DEBUG] FormData - password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - confirm_password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - accept_terms: on
new-auth.js:640 [DEBUG] FormData - accept_privacy: on
new-auth.js:654 [DEBUG] Parsed userData: {first_name: 'Fernando', last_name: 'Suarez', username: 'fernandosg', phone: '+52 55 1234 5678', email: 'fernando.suarez@ecosdeliderazgo.com', …}
new-auth.js:824 [DEBUG] validateRegisterForm called with: {first_name: 'Fernando', last_name: 'Suarez', username: 'fernandosg', phone: '+52 55 1234 5678', email: 'fernando.suarez@ecosdeliderazgo.com', …}
new-auth.js:411 Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'borderColor')
    at validateEmail (new-auth.js:411:29)
    at validateRegisterForm (new-auth.js:852:10)
    at handleRegister (new-auth.js:657:10)
    at HTMLButtonElement.<anonymous> (new-auth.js:197:17)
validateEmail @ new-auth.js:411
validateRegisterForm @ new-auth.js:852
handleRegister @ new-auth.js:657
(anonymous) @ new-auth.js:197
new-auth.js:178 [DEBUG] Register button clicked!
new-auth.js:179 [DEBUG] Auth state loading: false
new-auth.js:180 [DEBUG] Form validity: true
new-auth.js:195 [DEBUG] Calling handleRegister directly
new-auth.js:627 [DEBUG] handleRegister called
new-auth.js:635 [DEBUG] Creating FormData from target: <form id=​"registerFormElement" class=​"form">​…​</form>​
new-auth.js:640 [DEBUG] FormData - first_name: Fernando
new-auth.js:640 [DEBUG] FormData - last_name: Suarez
new-auth.js:640 [DEBUG] FormData - username: FernandoSG
new-auth.js:640 [DEBUG] FormData - phone: +52 55 1234 5678
new-auth.js:640 [DEBUG] FormData - email: fernando.suarez@ecosdeliderazgo.com
new-auth.js:640 [DEBUG] FormData - password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - confirm_password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - accept_terms: on
new-auth.js:640 [DEBUG] FormData - accept_privacy: on
new-auth.js:654 [DEBUG] Parsed userData: {first_name: 'Fernando', last_name: 'Suarez', username: 'fernandosg', phone: '+52 55 1234 5678', email: 'fernando.suarez@ecosdeliderazgo.com', …}
new-auth.js:824 [DEBUG] validateRegisterForm called with: {first_name: 'Fernando', last_name: 'Suarez', username: 'fernandosg', phone: '+52 55 1234 5678', email: 'fernando.suarez@ecosdeliderazgo.com', …}
new-auth.js:411 Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'borderColor')
    at validateEmail (new-auth.js:411:29)
    at validateRegisterForm (new-auth.js:852:10)
    at handleRegister (new-auth.js:657:10)
    at HTMLButtonElement.<anonymous> (new-auth.js:197:17)
validateEmail @ new-auth.js:411
validateRegisterForm @ new-auth.js:852
handleRegister @ new-auth.js:657
(anonymous) @ new-auth.js:197
new-auth.js:178 [DEBUG] Register button clicked!
new-auth.js:179 [DEBUG] Auth state loading: false
new-auth.js:180 [DEBUG] Form validity: true
new-auth.js:195 [DEBUG] Calling handleRegister directly
new-auth.js:627 [DEBUG] handleRegister called
new-auth.js:635 [DEBUG] Creating FormData from target: <form id=​"registerFormElement" class=​"form">​…​</form>​
new-auth.js:640 [DEBUG] FormData - first_name: Fernando
new-auth.js:640 [DEBUG] FormData - last_name: Suarez
new-auth.js:640 [DEBUG] FormData - username: FernandoSG
new-auth.js:640 [DEBUG] FormData - phone: +52 55 1234 5678
new-auth.js:640 [DEBUG] FormData - email: fernando.suarez@ecosdeliderazgo.com
new-auth.js:640 [DEBUG] FormData - password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - confirm_password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - accept_terms: on
new-auth.js:640 [DEBUG] FormData - accept_privacy: on
new-auth.js:654 [DEBUG] Parsed userData: {first_name: 'Fernando', last_name: 'Suarez', username: 'fernandosg', phone: '+52 55 1234 5678', email: 'fernando.suarez@ecosdeliderazgo.com', …}
new-auth.js:824 [DEBUG] validateRegisterForm called with: {first_name: 'Fernando', last_name: 'Suarez', username: 'fernandosg', phone: '+52 55 1234 5678', email: 'fernando.suarez@ecosdeliderazgo.com', …}
new-auth.js:411 Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'borderColor')
    at validateEmail (new-auth.js:411:29)
    at validateRegisterForm (new-auth.js:852:10)
    at handleRegister (new-auth.js:657:10)
    at HTMLButtonElement.<anonymous> (new-auth.js:197:17)
validateEmail @ new-auth.js:411
validateRegisterForm @ new-auth.js:852
handleRegister @ new-auth.js:657
(anonymous) @ new-auth.js:197
new-auth.js:178 [DEBUG] Register button clicked!
new-auth.js:179 [DEBUG] Auth state loading: false
new-auth.js:180 [DEBUG] Form validity: true
new-auth.js:195 [DEBUG] Calling handleRegister directly
new-auth.js:627 [DEBUG] handleRegister called
new-auth.js:635 [DEBUG] Creating FormData from target: <form id=​"registerFormElement" class=​"form">​…​</form>​
new-auth.js:640 [DEBUG] FormData - first_name: Fernando
new-auth.js:640 [DEBUG] FormData - last_name: Suarez
new-auth.js:640 [DEBUG] FormData - username: FernandoSG
new-auth.js:640 [DEBUG] FormData - phone: +52 55 1234 5678
new-auth.js:640 [DEBUG] FormData - email: fernando.suarez@ecosdeliderazgo.com
new-auth.js:640 [DEBUG] FormData - password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - confirm_password: 9Re*@7Eq1kJaJPu5!m!u
new-auth.js:640 [DEBUG] FormData - accept_terms: on
new-auth.js:640 [DEBUG] FormData - accept_privacy: on
new-auth.js:654 [DEBUG] Parsed userData: {first_name: 'Fernando', last_name: 'Suarez', username: 'fernandosg', phone: '+52 55 1234 5678', email: 'fernando.suarez@ecosdeliderazgo.com', …}
new-auth.js:824 [DEBUG] validateRegisterForm called with: {first_name: 'Fernando', last_name: 'Suarez', username: 'fernandosg', phone: '+52 55 1234 5678', email: 'fernando.suarez@ecosdeliderazgo.com', …}
new-auth.js:411 Uncaught (in promise) TypeError: Cannot set properties of undefined (setting 'borderColor')
    at validateEmail (new-auth.js:411:29)
    at validateRegisterForm (new-auth.js:852:10)
    at handleRegister (new-auth.js:657:10)
    at HTMLButtonElement.<anonymous> (new-auth.js:197:17)
validateEmail @ new-auth.js:411
validateRegisterForm @ new-auth.js:852
handleRegister @ new-auth.js:657
(anonymous) @ new-auth.js:197
