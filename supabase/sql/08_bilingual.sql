-- Bilingual support: add English columns (idempotent)

-- prompts: add text_en for English content
alter table if exists public.prompts
  add column if not exists text_en text;

-- categories: add name_en for English display name
alter table if exists public.categories
  add column if not exists name_en text;

-- Optional: update indexes not required (text_en is projected, not filtered)


