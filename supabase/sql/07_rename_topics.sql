-- Topic key remap to match new display taxonomy
-- 注意：建议保留英文 key 作为稳定的机器键，前端做中文显示映射即可。
-- 若你确需在数据库层改动 key，本脚本提供等价替换（幂等：重复执行不会产生额外变化）。

-- Deeptalk (dating): warmup→了解, connection→升温, deep→哲学
update public.prompts set topic = '了解' where category_id = 'dating' and topic = 'warmup';
update public.prompts set topic = '升温' where category_id = 'dating' and topic = 'connection';
update public.prompts set topic = '哲学' where category_id = 'dating' and topic = 'deep';

-- Party: icebreaker→破冰, truth_chat→八卦, dare_fun→找乐子
update public.prompts set topic = '破冰' where category_id = 'party' and topic = 'icebreaker';
update public.prompts set topic = '八卦' where category_id = 'party' and topic = 'truth_chat';
update public.prompts set topic = '找乐子' where category_id = 'party' and topic = 'dare_fun';

-- Intimacy: truth_basic→轻松, dare_soft→热情, boundaries→极限
update public.prompts set topic = '轻松' where category_id = 'intimacy' and topic = 'truth_basic';
update public.prompts set topic = '热情' where category_id = 'intimacy' and topic = 'dare_soft';
update public.prompts set topic = '极限' where category_id = 'intimacy' and topic = 'boundaries';

-- 索引不变（topic 为 text），但若你频繁使用中文 key 做过滤，请确保编码一致且正确建立索引。

