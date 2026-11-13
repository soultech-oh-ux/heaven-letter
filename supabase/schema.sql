-- Heaven Letter: Supabase PostgreSQL schema v1
create extension if not exists pgcrypto;

create table if not exists public.workshops (
 id text primary key check (id in ('A','B')),
 name text not null,
 site_url text not null,
 cover_image_url text,
 created_at timestamptz not null default now()
);
insert into public.workshops(id,name,site_url) values
 ('A','예수 묵상 편지공방 A','https://heaven-letter-one.vercel.app'),
 ('B','예수 묵상 편지공방 B','https://heaven-letter-nov09.vercel.app')
on conflict (id) do nothing;

create table if not exists public.letters (
 id uuid primary key default gen_random_uuid(),
 workshop_id text not null references public.workshops(id),
 slug text not null,
 title text not null default '예수 묵상 편지',
 letter_date date null,
 author_name text not null default '오경근목사',
 meditation text not null default '',
 devotional_text text not null default '',
 devotional_author text not null default '',
 speak_s text not null default '',
 speak_p text not null default '',
 speak_e text not null default '',
 speak_a text not null default '',
 speak_k text not null default '',
 praise_url text not null default '',
 share_description text not null default '',
 status text not null default 'draft' check(status in ('draft','published','archived')),
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(workshop_id,slug),
 unique(id,workshop_id)
);
create index if not exists letters_workshop_published_idx
 on public.letters(workshop_id,published_at desc) where status='published';
create index if not exists letters_workshop_date_idx
 on public.letters(workshop_id,letter_date desc);

create table if not exists public.scripture_passages (
 id uuid primary key default gen_random_uuid(),
 letter_id uuid not null references public.letters(id) on delete cascade,
 position smallint not null check(position between 1 and 4),
 reference text not null,
 passage_text text not null default '',
 unique(letter_id,position)
);

create table if not exists public.letter_revisions (
 id uuid primary key default gen_random_uuid(),
 letter_id uuid not null references public.letters(id) on delete cascade,
 revision_number integer not null check(revision_number > 0),
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 unique(letter_id,revision_number)
);

create or replace function public.touch_letter_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;
drop trigger if exists trg_touch_letter on public.letters;
create trigger trg_touch_letter before update on public.letters
for each row execute function public.touch_letter_updated_at();

-- One latest published letter per workshop is determined by published_at and id.
-- All browser-accessible tables deny direct access by default.
alter table public.workshops enable row level security;
alter table public.letters enable row level security;
alter table public.scripture_passages enable row level security;
alter table public.letter_revisions enable row level security;
-- No anon/authenticated policies: only trusted server-side service role may access.
-- NEVER expose SUPABASE_SERVICE_ROLE_KEY in client-side code.
