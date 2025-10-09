-- Additional indexes for stability and common query patterns

-- Prompts: lookup by id (already PK), but add btree on created_at for ordering
create index if not exists prompts_created_at_idx on public.prompts(created_at desc);

-- Prompts: frequent filters
create index if not exists prompts_is_published_idx on public.prompts(is_published);
create index if not exists prompts_is_trial_idx on public.prompts(is_trial);
create index if not exists prompts_topic_idx on public.prompts(topic);

-- Optional: partial index for published prompts per category to speed up category pages
create index if not exists prompts_cat_published_partial_idx
on public.prompts(category_id, topic)
where is_published = true;

-- Optional: partial index for trial prompts per category for free users
create index if not exists prompts_cat_trial_partial_idx
on public.prompts(category_id, topic)
where is_trial = true and is_published = true;


