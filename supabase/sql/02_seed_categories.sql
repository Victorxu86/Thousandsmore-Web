insert into public.categories (id, name, description, allowed_types) values
('dating','约会期话题','纯问题，帮助两人更快建立连接', array['question']),
('intimacy','亲密刺激','成人相关（真心话/大冒险），请在合规前提下使用', array['truth','dare']),
('party','酒桌派对','真心话 / 大冒险，轻松破冰与热场', array['truth','dare'])
on conflict (id) do nothing;


