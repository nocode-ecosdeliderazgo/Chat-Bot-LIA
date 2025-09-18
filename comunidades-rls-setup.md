
# Comunidades con RLS — Guía de implementación (Supabase + Frontend)

Este README documenta cómo configuramos **comunidades** con control de acceso usando **Row Level Security (RLS)** en Supabase y un **frontend** con una sola vista (`community-view.html`) que cambia por `slug`. Está listo para ser analizado por Codex.

---

## 📌 Objetivo

- **Comunidades por invitación** (visibles y utilizables **solo** por sus miembros):
  - `openminder`
  - `sif-icap`
  - `ecos-de-liderazgo`
- **Comunidad “profesionales”** (antes *general*): visible **solo** para usuarios que **no** tienen cursos activos **y** **no** pertenecen a ninguna comunidad cerrada.
- Todo con **una sola vista** (`community-view.html?slug=...`) + **RLS** para seguridad real.

---

## 🧱 1) Seed de comunidades y un miembro de prueba (opcional)

> Ejecutar en SQL. No usa placeholders.

```sql
-- Crea/actualiza comunidades
insert into public.communities (name, slug, description, is_active)
values
  ('Profesionales', 'profesionales', 'Espacio abierto para perfiles sin cursos activos.', true),
  ('Openminder', 'openminder', 'Comunidad cerrada por invitación.', true),
  ('SIF ICAP', 'sif-icap', 'Comunidad cerrada por invitación.', true),
  ('Ecos de Liderazgo', 'ecos-de-liderazgo', 'Comunidad cerrada por invitación.', true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    is_active = excluded.is_active;

-- Agrega (si existe al menos un usuario) un miembro de prueba a Openminder sin duplicar
with comm as (
  select id as community_id from public.communities where slug = 'openminder'
),
usr as (
  select id as user_id
  from public.users
  order by created_at asc nulls last
  limit 1
)
insert into public.community_members (community_id, user_id, role, is_active)
select comm.community_id, usr.user_id, 'member', true
from comm, usr
where not exists (
  select 1 from public.community_members m
  where m.community_id = comm.community_id
    and m.user_id = usr.user_id
);
```

---

## 🔒 2) Políticas RLS (seguridad)

> Postgres **no** soporta `CREATE POLICY IF NOT EXISTS`. Por eso usamos bloques `DO $$` verificando en `pg_policies.policyname`.

```sql
-- Activar RLS
alter table public.communities          enable row level security;
alter table public.community_posts      enable row level security;
alter table public.community_reactions  enable row level security;

-- ============================================
-- COMMUNITIES: communities_profesionales_select
-- ============================================
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'communities'
      and policyname = 'communities_profesionales_select'
  ) then
    create policy communities_profesionales_select
    on public.communities
    for select
    to authenticated
    using (
      slug = 'profesionales'
      and not exists (
        select 1 from public.course_progress cp
        where cp.user_id = auth.uid()
      )
      and not exists (
        select 1
        from public.community_members m
        join public.communities c2 on c2.id = m.community_id
        where m.user_id = auth.uid()
          and coalesce(m.is_active, true)
          and c2.slug in ('openminder','sif-icap','ecos-de-liderazgo')
      )
    );
  end if;
end $$ language plpgsql;

-- ============================================
-- COMMUNITIES: communities_invite_only_select
-- ============================================
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'communities'
      and policyname = 'communities_invite_only_select'
  ) then
    create policy communities_invite_only_select
    on public.communities
    for select
    to authenticated
    using (
      slug in ('openminder','sif-icap','ecos-de-liderazgo')
      and exists (
        select 1
        from public.community_members m
        where m.community_id = communities.id
          and m.user_id = auth.uid()
          and coalesce(m.is_active, true)
      )
    );
  end if;
end $$ language plpgsql;

-- ============================================
-- COMMUNITY_POSTS: posts_select_if_community_visible
-- ============================================
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'community_posts'
      and policyname = 'posts_select_if_community_visible'
  ) then
    create policy posts_select_if_community_visible
    on public.community_posts
    for select
    to authenticated
    using (
      exists (
        select 1 from public.communities c
        where c.id = community_posts.community_id
      )
    );
  end if;
end $$ language plpgsql;

-- ============================================
-- COMMUNITY_POSTS: posts_insert_if_allowed
-- ============================================
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'community_posts'
      and policyname = 'posts_insert_if_allowed'
  ) then
    create policy posts_insert_if_allowed
    on public.community_posts
    for insert
    to authenticated
    with check (
      community_posts.user_id = auth.uid()
      and exists (
        select 1 from public.communities c
        where c.id = community_posts.community_id
      )
    );
  end if;
end $$ language plpgsql;

-- ============================================
-- COMMUNITY_POSTS: posts_update_own / posts_delete_own
-- ============================================
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'community_posts'
      and policyname = 'posts_update_own'
  ) then
    create policy posts_update_own
    on public.community_posts
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;
end $$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'community_posts'
      and policyname = 'posts_delete_own'
  ) then
    create policy posts_delete_own
    on public.community_posts
    for delete
    to authenticated
    using (user_id = auth.uid());
  end if;
end $$ language plpgsql;

-- ============================================
-- COMMUNITY_REACTIONS: reactions_select_if_post_visible
-- ============================================
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'community_reactions'
      and policyname = 'reactions_select_if_post_visible'
  ) then
    create policy reactions_select_if_post_visible
    on public.community_reactions
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.community_posts p
        join public.communities c on c.id = p.community_id
        where p.id = community_reactions.post_id
      )
    );
  end if;
end $$ language plpgsql;

-- ============================================
-- COMMUNITY_REACTIONS: reactions_insert_if_allowed
-- ============================================
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'community_reactions'
      and policyname = 'reactions_insert_if_allowed'
  ) then
    create policy reactions_insert_if_allowed
    on public.community_reactions
    for insert
    to authenticated
    with check (
      community_reactions.user_id = auth.uid()
      and exists (
        select 1
        from public.community_posts p
        join public.communities c on c.id = p.community_id
        where p.id = community_reactions.post_id
      )
    );
  end if;
end $$ language plpgsql;
```

---

## 🖥️ 3) Frontend

### `community.html` (listado)

```html
<script type="module">
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)

async function loadCommunities() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { location.href = '/login.html'; return }

  const { data, error } = await supabase
    .from('communities')
    .select('id,name,slug,description')
    .order('name')

  const container = document.querySelector('#communities-list')
  if (error) { container.innerHTML = '<p>Error cargando comunidades.</p>'; return }
  if (!data?.length) { container.innerHTML = '<p>No tienes comunidades disponibles todavía.</p>'; return }

  container.innerHTML = data.map(c => `
    <div class="community-card">
      <a href="/Community/community-view.html?slug=${encodeURIComponent(c.slug)}">
        <h3>${c.name}</h3>
        <p>${c.description ?? ''}</p>
      </a>
    </div>
  `).join('')
}
loadCommunities()
</script>
```

### `community-view.html` (por `slug`)

```html
<script type="module">
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
const q = k => new URL(location.href).searchParams.get(k)

async function loadCommunity() {
  const slug = q('slug')
  if (!slug) { location.href = '/404.html'; return }

  const { data: community } = await supabase
    .from('communities')
    .select('id,name,slug,description')
    .eq('slug', slug)
    .maybeSingle()

  if (!community) { location.href = '/403.html'; return }

  document.querySelector('#community-title').textContent = community.name
  document.querySelector('#community-desc').textContent   = community.description ?? ''

  const { data: posts } = await supabase
    .from('community_posts')
    .select('id,title,content,created_at,user_id')
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })

  renderPosts(posts || [])

  const form = document.querySelector('#new-post-form')
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const title   = document.querySelector('#post-title')?.value?.trim() || null
      const content = document.querySelector('#post-content')?.value?.trim() || ''

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { location.href = '/login.html'; return }

      const { error } = await supabase
        .from('community_posts')
        .insert([{ community_id: community.id, user_id: user.id, title, content }])

      if (error) {
        const msg = (error.message?.toLowerCase().includes('row-level security') || error.code === '42501')
          ? 'No tienes permisos para publicar en esta comunidad.'
          : 'No se pudo publicar. Intenta de nuevo.'
        alert(msg)
        return
      }

      const { data: newPosts } = await supabase
        .from('community_posts')
        .select('id,title,content,created_at,user_id')
        .eq('community_id', community.id)
        .order('created_at', { ascending: false })
      renderPosts(newPosts || [])
      form.reset()
    })
  }
}

function renderPosts(rows) {
  const cont = document.querySelector('#posts')
  cont.innerHTML = rows.length
    ? rows.map(p => `
        <article class="card">
          <h4>${p.title ?? '(sin título)'}</h4>
          <p>${p.content ? p.content.replace(/</g,'&lt;') : ''}</p>
          <small>${new Date(p.created_at).toLocaleString()}</small>
        </article>
      `).join('')
    : '<p>Aún no hay publicaciones.</p>'
}
loadCommunity()
</script>
```

### Páginas auxiliares

```html
<!-- /403.html -->
<!doctype html><meta charset="utf-8">
<title>403</title>
<div style="padding:2rem">
  <h2>Acceso denegado</h2>
  <p>No tienes permisos para ver esta comunidad.</p>
  <a href="/Community/community.html">Volver</a>
</div>
```

```html
<!-- /404.html -->
<!doctype html><meta charset="utf-8">
<title>404</title>
<div style="padding:2rem">
  <h2>No encontrado</h2>
  <p>La comunidad no existe o el enlace es inválido.</p>
  <a href="/Community/community.html">Volver</a>
</div>
```

---

## 🧪 4) Pruebas rápidas

1. Usuario **sin cursos** y **sin membresías** → ve **solo** `profesionales`.  
2. Usuario **miembro** de `openminder`/`sif-icap`/`ecos-de-liderazgo` → ve **solo** sus comunidades; **no** ve `profesionales`.  
3. Usuario **con curso**, **sin membresías** → listado vacío; si fuerza `?slug=profesionales` → **403**.  
4. Intento de publicar sin permiso → alerta “No tienes permisos…” (error RLS).

---

## 🛠️ 5) Operación diaria

- **Agregar miembro** (sin duplicar):
  ```sql
  insert into public.community_members (community_id, user_id, role, is_active)
  values ('<COMMUNITY_UUID>', '<USER_UUID>', 'member', true)
  on conflict do nothing;
  ```

- **Revocar acceso** (soft remove):
  ```sql
  update public.community_members
  set is_active = false
  where community_id = '<COMMUNITY_UUID>' and user_id = '<USER_UUID>';
  ```

- **Ver miembros por `slug`**:
  ```sql
  select m.user_id, u.email, m.role, m.is_active
  from public.community_members m
  join public.communities c on c.id = m.community_id
  left join public.users u on u.id = m.user_id
  where c.slug = 'openminder'
  order by m.joined_at desc nulls last;
  ```

> Nota: Reemplaza los UUID reales; para Codex puedes parametrizar estos valores en scripts o seeds.

---

## 🧯 6) Troubleshooting

- **`invalid input syntax for type uuid`** → Estás pasando un string literal (p. ej. `'<user_id>'`) en una columna `uuid`. Usa un UUID real de `public.users.id`.
- **`CREATE POLICY IF NOT EXISTS`** → No existe en Postgres. Usa el patrón `DO $$ ... if not exists in pg_policies ... $$;` como arriba.
- **Columna en `pg_policies`** → La columna correcta es `policyname` (no `polname`).

---

## ✅ 7) Razón de diseño

- Una sola vista por `slug` evita duplicación y mantiene el UI simple.
- RLS garantiza que **no se pueden leer ni escribir** datos de comunidades sin permiso aunque alguien fuerce la URL.
- Las reglas de pertenencia y “no cliente” se reflejan en tiempo real con `community_members` y `course_progress`.

---

## 📎 Anexos

- Tablas clave: `communities`, `community_members`, `community_posts`, `community_reactions`, `users`, `course_progress`.
- Slugs usados: `profesionales`, `openminder`, `sif-icap`, `ecos-de-liderazgo`.

---

**Fin del README.**
