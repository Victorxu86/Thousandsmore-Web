-- Rename category display names without changing IDs (safer for code references)

-- 朋友 → Deeptalk（仅改显示名）
update public.categories set name = 'Deeptalk'
where id = 'dating';

-- 其他分类名称如需调整，可在此扩展；当前保持原有中文名：
-- party（酒桌）、intimacy（激情）维持不变

-- 说明：
-- 1) 我们保留 category_id 不变（dating/party/intimacy），以避免前端与数据的耦合破坏。
-- 2) topics 字段目前沿用既有英文键（warmup/connection/deep 等），前端已通过映射改为“了解/升温/哲学”等新文案；
--    若后续需要将 DB 中的 topic 值也改为中文，请另开迁移，并同步更新前端默认 topics 预置与 API 过滤逻辑。


