create table public.communities (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  slug text not null,
  image_url text null,
  member_count integer null default 0,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  visibility text not null default 'public'::text,
  access_type public.access_type_enum not null,
  constraint communities_pkey primary key (id),
  constraint communities_slug_key unique (slug),
  constraint communities_visibility_check check (
    (
      visibility = any (array['public'::text, 'invite_only'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_communities_slug on public.communities using btree (slug) TABLESPACE pg_default;