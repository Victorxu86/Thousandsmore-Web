-- Chat schema: rooms + messages
create table if not exists public.chat_rooms (
  id text primary key,
  category_id text not null default 'dating',
  owner_email text,
  join_token text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_rooms_owner_idx on public.chat_rooms(owner_email);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.chat_rooms(id) on delete cascade,
  user_id text not null,
  nickname text,
  prompt_id text,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_room_created_idx on public.chat_messages(room_id, created_at desc);

-- RLS (可后续细化；目前先关闭以便由服务端 API 控制)
alter table public.chat_rooms disable row level security;
alter table public.chat_messages disable row level security;

-- 增量列：最近活跃与结束时间（幂等）
alter table public.chat_rooms add column if not exists last_active_at timestamptz default now();
alter table public.chat_rooms add column if not exists ended_at timestamptz;
alter table public.chat_rooms add column if not exists current_prompt_id text;


