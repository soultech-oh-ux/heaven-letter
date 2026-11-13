-- Run once in Supabase SQL Editor before deploying the Supabase API.
alter table public.letters add column if not exists editor_fields jsonb not null default '{}'::jsonb;
alter table public.letters add column if not exists is_current boolean not null default false;
create unique index if not exists letters_one_current_per_workshop
 on public.letters(workshop_id) where is_current;
