import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/app/api/admin/_utils";

type SeedRow = {
  id: string;
  category_id: "intimacy";
  type: "truth";
  text: string;
  text_en: string;
  is_published: boolean;
  is_trial: boolean;
  topic: string;
};

const ITEMS: SeedRow[] = [
  { id: "in-ex-tr-001", category_id: "intimacy", type: "truth", text: "你有没有在公共场合尝试过露出游戏，如果有，描述最刺激的那次？", text_en: "Have you ever tried exhibitionism in public? If so, describe your most thrilling experience.", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-002", category_id: "intimacy", type: "truth", text: "你最极端的性癖是什么？", text_en: "What’s your most extreme fetish?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-003", category_id: "intimacy", type: "truth", text: "你最想尝试的SM道具是什么？", text_en: "What SM prop are you most eager to try?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-004", category_id: "intimacy", type: "truth", text: "描述你最疯狂的角色扮演情节，包括所有细节。", text_en: "Describe your wildest role-play scenario, including all details.", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-005", category_id: "intimacy", type: "truth", text: "你对恋足癖的兴趣程度如何？", text_en: "How interested are you in foot fetishism?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-006", category_id: "intimacy", type: "truth", text: "你有没有在做爱时用过蜡烛或冰块？", text_en: "Have you ever used candles or ice during sex?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-007", category_id: "intimacy", type: "truth", text: "你的极限BDSM场景会包括什么元素？", text_en: "What elements would your ultimate BDSM scene include?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-008", category_id: "intimacy", type: "truth", text: "你有没有在工作中偷偷自慰过？", text_en: "Have you ever masturbated secretly at work?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-009", category_id: "intimacy", type: "truth", text: "体液会让你感到性兴奋吗？", text_en: "Do bodily fluids turn you on?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-010", category_id: "intimacy", type: "truth", text: "你有没有尝试过尿道扩张？", text_en: "Have you ever tried urethral sounding?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-011", category_id: "intimacy", type: "truth", text: "描述你对后门的最深度探索。", text_en: "Describe your deepest exploration of anal play.", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-012", category_id: "intimacy", type: "truth", text: "你有没有参与过公开羞辱的性活动？", text_en: "Have you ever engaged in public humiliation during sex?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-013", category_id: "intimacy", type: "truth", text: "你的宠物扮演幻想中，你更喜欢当主人还是宠物？", text_en: "In pet play fantasies, do you prefer being the master or the pet?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-014", category_id: "intimacy", type: "truth", text: "尝试电击玩具会让你感到很兴奋吗？", text_en: "Does the idea of using electric shock toys excite you?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-015", category_id: "intimacy", type: "truth", text: "你有没有在陌生人面前裸体过？", text_en: "Have you ever been naked in front of strangers?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-016", category_id: "intimacy", type: "truth", text: "你的最极端性幻想涉及什么情节？", text_en: "What’s the plot of your most extreme sexual fantasy?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-017", category_id: "intimacy", type: "truth", text: "你对针刺或自我伤害类的性爱游戏的看法和经历？", text_en: "What are your thoughts or experiences with needle play or self-harm in sex?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-018", category_id: "intimacy", type: "truth", text: "你有尝试过在性爱过程中把食物当作道具增加情趣吗？", text_en: "Have you ever used food as a prop to enhance sex?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-019", category_id: "intimacy", type: "truth", text: "描述你对窒息游戏的兴趣和想法。", text_en: "Describe your interest in breath play and your thoughts on it.", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-020", category_id: "intimacy", type: "truth", text: "你最想尝试的露出地点是哪里，为什么？", text_en: "Where’s the most daring place you’d want to try exhibitionism, and why?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-021", category_id: "intimacy", type: "truth", text: "你的小众性癖中，最不寻常的是什么？", text_en: "What’s the most unusual of your niche fetishes?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-022", category_id: "intimacy", type: "truth", text: "你对鞭打或打屁股的兴趣是多少？", text_en: "How interested are you in whipping or spanking?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-023", category_id: "intimacy", type: "truth", text: "你有没有在性爱中使用过药物增强效果？", text_en: "Have you ever used drugs to enhance sexual experiences?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-024", category_id: "intimacy", type: "truth", text: "描述你对乳胶或皮革服装的痴迷。", text_en: "Describe your obsession with latex or leather clothing.", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-025", category_id: "intimacy", type: "truth", text: "你有没有尝试过拳交？", text_en: "Have you ever tried fisting?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-026", category_id: "intimacy", type: "truth", text: "你的最刺激偷窥经历是什么？", text_en: "What’s your most thrilling voyeuristic experience?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-027", category_id: "intimacy", type: "truth", text: "你对年龄扮演游戏的幻想包括什么？", text_en: "What does your age-play fantasy involve?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-028", category_id: "intimacy", type: "truth", text: "你有没有在公共交通上玩过性游戏？", text_en: "Have you ever played sexual games on public transport?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-029", category_id: "intimacy", type: "truth", text: "描述你对疼痛与快感的结合的最爱方式。", text_en: "Describe your favorite way to combine pain and pleasure.", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-030", category_id: "intimacy", type: "truth", text: "你最想探索的动物扮演细节是什么？", text_en: "What details of animal role-play do you most want to explore?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-031", category_id: "intimacy", type: "truth", text: "你有没有用镜子或录像增强过性体验？", text_en: "Have you ever used mirrors or recordings to enhance a sexual experience?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-032", category_id: "intimacy", type: "truth", text: "极限束缚的性爱场景会让你兴奋吗？", text_en: "Does the idea of extreme bondage excite you?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-033", category_id: "intimacy", type: "truth", text: "你对体臭或汗味的性吸引如何？", text_en: "How do body odors or sweat sexually attract you?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-034", category_id: "intimacy", type: "truth", text: "你有没有参与过线上的性相关游戏？", text_en: "Have you ever participated in online sex-related games?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-035", category_id: "intimacy", type: "truth", text: "描述你对医疗扮演的最深度幻想。", text_en: "Describe your deepest medical role-play fantasy.", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-036", category_id: "intimacy", type: "truth", text: "你最喜欢的感官剥夺方式是什么？", text_en: "What’s your favorite form of sensory deprivation?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-037", category_id: "intimacy", type: "truth", text: "你有没有在户外尝试过野战，地点是哪里？", text_en: "Have you ever had outdoor sex? If so, where?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-038", category_id: "intimacy", type: "truth", text: "你的最极端口交幻想涉及什么？", text_en: "What’s your most extreme oral sex fantasy?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-039", category_id: "intimacy", type: "truth", text: "你对纹身或刺青作为性标记的看法？", text_en: "What’s your view on tattoos or piercings as sexual markers?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-040", category_id: "intimacy", type: "truth", text: "你有没有用玩具模拟双重插入？", text_en: "Have you ever used toys to simulate double penetration?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-041", category_id: "intimacy", type: "truth", text: "描述你对催眠性游戏的兴趣。", text_en: "Describe your interest in hypnotic sex games.", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-042", category_id: "intimacy", type: "truth", text: "你最想尝试的公开自慰地点是哪里？", text_en: "Where’s the most daring place you’d want to try public masturbation?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-043", category_id: "intimacy", type: "truth", text: "你有没有参与过跨性别角色扮演？", text_en: "Have you ever engaged in transgender role-play?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-044", category_id: "intimacy", type: "truth", text: "刺激的偷情会让你感到兴奋吗？", text_en: "Does the thrill of an affair excite you?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-045", category_id: "intimacy", type: "truth", text: "你对电击乳头或生殖器的想法？", text_en: "What’s your take on electric stimulation of nipples or genitals?", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-046", category_id: "intimacy", type: "truth", text: "描述你对长期禁欲后释放的幻想。", text_en: "Describe your fantasy of release after long-term abstinence.", is_published: true, is_trial: false, topic: "极限" },
  { id: "in-ex-tr-047", category_id: "intimacy", type: "truth", text: "你最极端的小众癖好是如何在生活中实践的？", text_en: "How do you practice your most extreme niche fetish in real life?", is_published: true, is_trial: false, topic: "极限" }
];

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("prompts").upsert(ITEMS, { onConflict: "id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: ITEMS.length });
}


