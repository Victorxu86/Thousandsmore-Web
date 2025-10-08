-- Schema: categories + prompts + RLS
create table if not exists public.categories (
  id text primary key,
  name text not null,
  description text,
  allowed_types text[] not null default array['question']::text[]
);

create table if not exists public.prompts (
  id text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  type text not null check (type in ('question','truth','dare')),
  text text not null,
  is_published boolean not null default true,
  is_trial boolean not null default false,
  topic text,
  created_at timestamptz not null default now()
);

alter table public.prompts enable row level security;
drop policy if exists "read published prompts" on public.prompts;
create policy "read published prompts"
on public.prompts for select
using (is_published = true);

create index if not exists prompts_cat_pub_trial_topic_idx on public.prompts(category_id, is_published, is_trial, topic);
create index if not exists prompts_cat_pub_topic_idx on public.prompts(category_id, is_published, topic);


