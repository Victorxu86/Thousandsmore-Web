export type CategoryId = "philosophy" | "dating" | "intimacy" | "party";

export type PromptType = "question" | "truth" | "dare";

export interface Prompt {
  id: string;
  text: string;
  type: PromptType;
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  allowedTypes: PromptType[];
  prompts: Prompt[];
}

function q(id: string, text: string): Prompt {
  return { id, text, type: "question" };
}

function t(id: string, text: string): Prompt {
  return { id, text, type: "truth" };
}

function d(id: string, text: string): Prompt {
  return { id, text, type: "dare" };
}

export const categories: Record<CategoryId, Category> = {
  philosophy: {
    id: "philosophy",
    name: "哲学讨论",
    description: "纯问题，适合深度思辨与价值观碰撞",
    allowedTypes: ["question"],
    prompts: [
      q("ph-1", "什么是你此刻最珍视的价值？为什么不是别的？"),
      q("ph-2", "如果痛苦能带来意义，你愿意选择多少痛苦？"),
      q("ph-3", "你认为自由更像是能力还是边界？"),
      q("ph-4", "你何时第一次意识到自己会死亡？那改变了什么？"),
      q("ph-5", "如果记忆可以被修改，你想删去或重写哪一段？"),
      q("ph-6", "善良与诚实冲突时，你倾向选哪一个？"),
      q("ph-7", "你对“灵魂伴侣”概念的最大质疑是什么？"),
      q("ph-8", "“幸福”对你是状态、目标还是过程？"),
      q("ph-9", "人类的进步是否必然伴随某种失去？"),
      q("ph-10", "如果所有人都诚实，社会会更好吗？"),
      q("ph-11", "你最怕被误解成什么样的人？"),
      q("ph-12", "你的人生更像是自我书写还是被动展开？"),
      q("ph-13", "“原谅”应该是义务、选择还是礼物？"),
      q("ph-14", "如果爱只剩行动没有感觉，它还算爱吗？"),
      q("ph-15", "你想把哪条人生规则写进宪法？"),
    ],
  },
  dating: {
    id: "dating",
    name: "约会期话题",
    description: "纯问题，帮助两人更快建立连接",
    allowedTypes: ["question"],
    prompts: [
      q("dt-1", "你最近一次感到被真正理解是什么时候？"),
      q("dt-2", "什么小事最能让你的一天发光？"),
      q("dt-3", "和朋友或前任相处中你学到的最重要一课？"),
      q("dt-4", "你理想的一次周末约会长什么样？"),
      q("dt-5", "在一段关系里，你最看重哪三件事？"),
      q("dt-6", "别人常误会你的一个点是什么？"),
      q("dt-7", "你目前在练习或改变的一个习惯？"),
      q("dt-8", "童年哪段记忆最塑造现在的你？"),
      q("dt-9", "爱与喜欢对你有什么不同？"),
      q("dt-10", "如果产生分歧，你更偏好怎么沟通？"),
      q("dt-11", "你的爱之语更偏向哪种表达？"),
      q("dt-12", "你对长期关系里“惊喜”的看法？"),
      q("dt-13", "什么会让你在约会中感到安全？"),
      q("dt-14", "你最欣赏对方的哪类边界感？"),
      q("dt-15", "什么瞬间会让你怦然心动？"),
    ],
  },
  intimacy: {
    id: "intimacy",
    name: "亲密刺激",
    description: "成人相关（真心话/大冒险），请在合规前提下使用",
    allowedTypes: ["truth", "dare"],
    prompts: [
      t("in-1", "描述一个你私下最容易被点燃的情境。"),
      t("in-2", "有哪件在亲密中想尝试但还没尝试的事？"),
      t("in-3", "你更在意过程中的亲密感还是结果的强度？"),
      t("in-4", "一件你希望对方知道但没说出口的渴望？"),
      d("in-5", "和对方对视30秒，只用眼神沟通彼此需求。"),
      d("in-6", "闭眼描述触感，让对方猜测被触碰部位（安全边界内）。"),
      d("in-7", "在同意前提下，用一句话提出一个轻度新玩法。"),
      t("in-8", "分享一件让你“出戏”的小细节，并讨论改进。"),
      d("in-9", "用赞美的口吻描述对方身体你最喜欢的一个部分。"),
      t("in-10", "你对安全词或停手信号的偏好是什么？"),
      t("in-11", "哪种氛围最让你安心探索？"),
      d("in-12", "共同列一份“只今天”的尝试清单（至少3项）。"),
      t("in-13", "亲密中的“边界雷区”有哪些？"),
      d("in-14", "和对方各自说出一个赞美并拥抱10秒。"),
      t("in-15", "你最在意被尊重的一个具体点是什么？"),
    ],
  },
  party: {
    id: "party",
    name: "酒桌派对",
    description: "真心话 / 大冒险，轻松破冰与热场",
    allowedTypes: ["truth", "dare"],
    prompts: [
      t("pt-1", "说出你这周最尴尬的一件小事。"),
      t("pt-2", "你手机里最近的一张自拍，讲述背后的故事。"),
      d("pt-3", "给左手边的人一个夸张的赞美。"),
      d("pt-4", "模仿一种动物走路10秒。"),
      t("pt-5", "你最离谱的一次网购是什么？"),
      t("pt-6", "坦白一个你不合群的小癖好。"),
      d("pt-7", "和右手边的人击掌并说出对方一个优点。"),
      d("pt-8", "把名字倒着念三次。"),
      t("pt-9", "第一次印象与现在对某人的看法差别？"),
      d("pt-10", "用方言夸别人一句。"),
      t("pt-11", "分享一个你私藏的快乐BGM。"),
      d("pt-12", "把杯子举过头顶说“我超棒”然后喝一口。"),
      t("pt-13", "你曾经最无聊但开心的一次聚会经历？"),
      d("pt-14", "表演一个5秒钟的即兴舞步。"),
      t("pt-15", "如果现在立刻来个旅行，你想去哪？"),
    ],
  },
};

export const FREE_LIMIT_PER_CATEGORY = 15;

export function getCategoryById(categoryId: string): Category | null {
  const key = categoryId as CategoryId;
  return categories[key] ?? null;
}

export function getPromptsByType(
  category: Category,
  type: PromptType | "all"
): Prompt[] {
  if (type === "all") return category.prompts;
  return category.prompts.filter((p) => p.type === type);
}

export function getRandomPrompt(
  prompts: Prompt[],
  excludeIds: Set<string> | undefined
): Prompt | null {
  if (prompts.length === 0) return null;
  const pool = excludeIds && excludeIds.size > 0
    ? prompts.filter((p) => !excludeIds.has(p.id))
    : prompts;
  if (pool.length === 0) return prompts[Math.floor(Math.random() * prompts.length)];
  return pool[Math.floor(Math.random() * pool.length)];
}


