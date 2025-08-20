// Catálogo de cursos: data mínima simulada (podrás reemplazar por API)
const CATALOG = [
  {id: 'chatgpt_gemini', title: 'Dominando ChatGPT y Gemini para la Productividad', instructor:'Ernesto', rating: 4.9, price: 2990, cat:'ia', level:'Intermedio', img:'assets/images/brain-icon.jpg'}
];

// Ocultar todos los cursos (toggle)
const HIDE_ALL_COURSES = false;

// Cursos a excluir del catálogo visible (IDs)
const EXCLUDED_IDS = [];

const grid = document.querySelector('.courses-grid');
const tabs = document.querySelectorAll('.cat-tab');
const search = document.getElementById('catalogSearch');

function formatPrice(mx){ return `MX$${mx}`; }

function normalizeText(text){
  return (text || '').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function renderCards(list, grouped=false){
  // Render con el diseño de "Todos" (course-card) para uniformidad
  grid.innerHTML = list.map(c => `
    <article class="course-card" data-cat="${c.cat}">
      <div class="course-thumb">
        <img src="${c.img}" alt="${c.title}" />
        ${c.badge ? `<span class="badge">${c.badge}</span>` : ''}
      </div>
      <div class="course-body">
        <div class="course-title">${c.title}</div>
        <div class="instructor">${c.instructor}</div>
        <div class="meta"><span>⭐ ${c.rating.toFixed(1)}</span><span class="price">${formatPrice(c.price)}</span></div>
        <div class="cta">
          <button class="enroll acquired" onclick="location.href='cursos.html'">Adquirido</button>
          <button class="wishlist"><i class='bx bx-heart'></i></button>
        </div>
      </div>
    </article>
  `).join('');
}

function filter(cat, term=''){
  if (HIDE_ALL_COURSES) {
    renderCards([], cat==='todos');
    return;
  }
  const t = normalizeText(term.trim());
  const source = CATALOG.filter(c => !EXCLUDED_IDS.includes(c.id));
  const filtered = source.filter(c => {
    const inCat = (cat==='todos' || c.cat===cat);
    const target = `${c.title} ${c.instructor} ${c.cat}`;
    const haystack = normalizeText(target);
    const synonyms = t.replace(/\bai\b/g,'ia');
    return inCat && haystack.includes(synonyms);
  });
  renderCards(filtered, false);
}

tabs.forEach(b => b.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  filter(b.dataset.cat, search.value || '');
}));

search?.addEventListener('input', () => {
  const term = search.value || '';
  const todosBtn = document.querySelector('.cat-tab[data-cat="todos"]');
  if (term.trim().length > 0 && todosBtn){
    document.querySelectorAll('.cat-tab').forEach(x => x.classList.remove('active'));
    todosBtn.classList.add('active');
  }
  filter('todos', term);
});

search?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    filter('todos', search.value || '');
  }
});

// Init
filter('todos');

// Toggle menú de perfil
(() => {
  const avatarBtn = document.querySelector('.header-profile');
  const menu = document.getElementById('profileMenu');
  if (!avatarBtn || !menu) return;
  // Rellenar datos del usuario
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const user = JSON.parse(raw);
      const nameEl = document.getElementById('pmName');
      const emailEl = document.getElementById('pmEmail');
      if (nameEl) nameEl.textContent = user.display_name || user.username || 'Usuario';
      if (emailEl) emailEl.textContent = user.email || user.user?.email || user.data?.email || '';
      // avatar
      if (user.avatar_url) {
        document.querySelectorAll('.header-profile img, #profileMenu .pm-avatar img').forEach(img => {
          img.src = user.avatar_url;
        });
      }
    }
  } catch (e) { /* noop */ }

  avatarBtn.addEventListener('click', (e) => {
    e.preventDefault();
    menu.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !avatarBtn.contains(e.target)) {
      menu.classList.remove('show');
    }
  });
})();


