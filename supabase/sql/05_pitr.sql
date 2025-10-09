-- PITR/Backup guidance (execute in Supabase Dashboard -> Project Settings)
-- Note: Supabase PITR is configured at project level, not via SQL alone.
-- Steps (documentation reference):
-- 1) Supabase Dashboard → Database → Backups → Enable PITR. Choose retention (e.g. 7-30 days).
-- 2) Verify daily snapshots are enabled. Set retention per needs and budget.
-- 3) For large tables, consider logical replication or export for offsite backups.

-- For completeness, ensure critical tables have created_at for audit and recovery windows.
alter table if exists public.entitlements add column if not exists created_at timestamptz not null default now();
alter table if exists public.purchases add column if not exists created_at timestamptz not null default now();

-- Add helpful indexes for time-range queries during recovery investigations
create index if not exists entitlements_created_at_idx on public.entitlements(created_at desc);
create index if not exists purchases_created_at_idx on public.purchases(created_at desc);


