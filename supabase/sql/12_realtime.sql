-- Enable Postgres → Realtime publication for chat tables (required for .on('postgres_changes'))
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.chat_rooms;


