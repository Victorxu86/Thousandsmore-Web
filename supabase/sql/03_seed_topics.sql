-- Dating topics
update public.prompts set topic='warmup' where id in ('dt-1','dt-2','dt-3','dt-4','dt-5');
update public.prompts set topic='connection' where id in ('dt-6','dt-7','dt-8','dt-9','dt-10');
update public.prompts set topic='deep' where id in ('dt-11','dt-12','dt-13','dt-14','dt-15');

-- Intimacy topics
update public.prompts set topic='truth_basic' where id in ('in-1','in-2','in-3','in-4','in-8','in-10','in-11','in-13','in-15');
update public.prompts set topic='dare_soft' where id in ('in-5','in-6','in-7','in-9','in-12','in-14');

-- Party topics
update public.prompts set topic='icebreaker' where id in ('pt-1','pt-3','pt-4','pt-8','pt-10');
update public.prompts set topic='dare_fun' where id in ('pt-7','pt-12','pt-14');
update public.prompts set topic='truth_chat' where id in ('pt-2','pt-5','pt-6','pt-9','pt-11','pt-13','pt-15');


