// Catálogo de cursos: data mínima simulada (podrás reemplazar por API)
const CATALOG = [
  {id: 'chatgpt_gemini', title: 'Introducción a la IA', instructor:'Ernesto Hernandez', rating: 4.9, price: 2990, cat:'ia', level:'Intermedio', img:'assets/images/brain-icon.jpg'}
];

// Ocultar todos los cursos (toggle)
const HIDE_ALL_COURSES = false;

// Cursos a excluir del catálogo visible (IDs)
const EXCLUDED_IDS = [];

const grid = document.querySelector('.courses-grid');
const tabs = document.querySelectorAll('.cat-tab');
const search = document.getElementById('catalogSearch');

// ===== SISTEMA DE FAVORITOS =====
let userFavorites = new Set(); // IDs de cursos favoritos
let currentUserId = null;
let supabaseClient = null;

function formatPrice(mx){ return `MX$${mx}`; }

function normalizeText(text){
  return (text || '').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function renderCards(list, grouped=false){
  // Render con el diseño de "Todos" (course-card) para uniformidad
  grid.innerHTML = list.map(c => {
    const isFavorite = userFavorites.has(c.id);
    const heartIcon = isFavorite ? 'bxs-heart' : 'bx-heart';
    const heartClass = isFavorite ? 'active' : '';
    
    return `
    <article class="course-card" data-cat="${c.cat}" data-course-id="${c.id}">
      <div class="course-thumb">
        <img src="${c.img}" alt="${c.title}" />
        ${c.badge ? `<span class="badge">${c.badge}</span>` : ''}
      </div>
      <div class="course-body">
        <div class="course-title">${c.title}</div>
        <div class="instructor">${c.instructor}</div>
        <div class="meta"><span>⭐ ${c.rating.toFixed(1)}</span><span class="price">${formatPrice(c.price)}</span></div>
        <div class="cta">
          <button class="enroll acquired" onclick="location.href='Chat-Online/chat-online.html'">Adquirido</button>
          <button class="wishlist ${heartClass}" onclick="toggleFavorite('${c.id}', this)">
            <i class='bx ${heartIcon}'></i>
          </button>
        </div>
      </div>
    </article>
  `;
  }).join('');
}

function filter(cat, term=''){
  if (HIDE_ALL_COURSES) {
    renderCards([], cat==='todos');
    return;
  }
  const t = normalizeText(term.trim());
  let source = CATALOG.filter(c => !EXCLUDED_IDS.includes(c.id));
  
  // Filtro especial para favoritos
  if (cat === 'favoritos') {
    source = source.filter(c => userFavorites.has(c.id));
  }
  
  const filtered = source.filter(c => {
    const inCat = (cat==='todos' || cat==='favoritos' || c.cat===cat);
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

// ===== FUNCIONES DE FAVORITOS =====

// Inicializar Supabase
async function initSupabase() {
  try {
    // Esperar a que Supabase esté disponible
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      // Obtener credenciales desde meta tags o localStorage
      const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content || 
                         window.SUPABASE_URL || 
                         localStorage.getItem('supabaseUrl');
      const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.content || 
                         window.SUPABASE_ANON_KEY || 
                         localStorage.getItem('supabaseAnonKey');
      
      if (supabaseUrl && supabaseKey) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase inicializado para favoritos');
        return true;
      }
    }
    console.warn('⚠️ No se pudo inicializar Supabase para favoritos');
    return false;
  } catch (error) {
    console.error('❌ Error inicializando Supabase:', error);
    return false;
  }
}

// Obtener usuario actual
function getCurrentUser() {
  try {
    // Intentar desde localStorage
    const sources = ['currentUser', 'userData', 'user'];
    for (const source of sources) {
      const raw = localStorage.getItem(source);
      if (raw) {
        const user = JSON.parse(raw);
        if (user.id) {
          return user;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    return null;
  }
}

// Cargar favoritos del usuario desde Supabase
async function loadUserFavorites() {
  try {
    const user = getCurrentUser();
    if (!user || !user.id) {
      console.log('⚠️ No hay usuario autenticado, usando favoritos locales');
      loadLocalFavorites();
      return;
    }
    
    currentUserId = user.id;
    
    if (!supabaseClient) {
      const initialized = await initSupabase();
      if (!initialized) {
        loadLocalFavorites();
        return;
      }
    }
    
    console.log('🔄 Cargando favoritos del usuario:', currentUserId);
    
    const { data, error } = await supabaseClient
      .from('course_favorites')
      .select('course_id')
      .eq('user_id', currentUserId);
    
    if (error) {
      console.error('❌ Error cargando favoritos:', error);
      loadLocalFavorites();
      return;
    }
    
    userFavorites = new Set(data.map(f => f.course_id));
    console.log('✅ Favoritos cargados:', userFavorites.size);
    
    // Sincronizar con localStorage
    saveLocalFavorites();
    
  } catch (error) {
    console.error('❌ Error en loadUserFavorites:', error);
    loadLocalFavorites();
  }
}

// Cargar favoritos desde localStorage (fallback)
function loadLocalFavorites() {
  try {
    const saved = localStorage.getItem('courseFavorites');
    if (saved) {
      userFavorites = new Set(JSON.parse(saved));
      console.log('✅ Favoritos cargados desde localStorage:', userFavorites.size);
    }
  } catch (error) {
    console.error('❌ Error cargando favoritos locales:', error);
  }
}

// Guardar favoritos en localStorage
function saveLocalFavorites() {
  try {
    localStorage.setItem('courseFavorites', JSON.stringify([...userFavorites]));
  } catch (error) {
    console.error('❌ Error guardando favoritos locales:', error);
  }
}

// Toggle favorito (agregar o quitar)
async function toggleFavorite(courseId, buttonElement) {
  try {
    const isFavorite = userFavorites.has(courseId);
    const icon = buttonElement.querySelector('i');
    
    if (isFavorite) {
      // Quitar de favoritos
      userFavorites.delete(courseId);
      icon.classList.remove('bxs-heart');
      icon.classList.add('bx-heart');
      buttonElement.classList.remove('active');
      
      // Eliminar de Supabase
      if (supabaseClient && currentUserId) {
        await supabaseClient
          .from('course_favorites')
          .delete()
          .eq('user_id', currentUserId)
          .eq('course_id', courseId);
      }
      
      console.log('💔 Curso eliminado de favoritos:', courseId);
    } else {
      // Agregar a favoritos
      userFavorites.add(courseId);
      icon.classList.remove('bx-heart');
      icon.classList.add('bxs-heart');
      buttonElement.classList.add('active');
      
      // Guardar en Supabase
      if (supabaseClient && currentUserId) {
        await supabaseClient
          .from('course_favorites')
          .insert({
            user_id: currentUserId,
            course_id: courseId
          });
      }
      
      console.log('❤️ Curso agregado a favoritos:', courseId);
    }
    
    // Guardar en localStorage
    saveLocalFavorites();
    
    // Si estamos en la vista de favoritos, actualizar
    const activeTab = document.querySelector('.cat-tab.active');
    if (activeTab && activeTab.dataset.cat === 'favoritos') {
      filter('favoritos', search.value || '');
    }
    
  } catch (error) {
    console.error('❌ Error al toggle favorito:', error);
  }
}

// Exponer función globalmente
window.toggleFavorite = toggleFavorite;

// Init con carga de favoritos
async function initCursos() {
  await loadUserFavorites();
  filter('todos');
}

initCursos();

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


