import type { Category } from "@/data/types";

function t(id: string, text: string, topic?: string) {
  return { id, text, type: "truth" as const, topic };
}
function d(id: string, text: string, topic?: string) {
  return { id, text, type: "dare" as const, topic };
}

export const intimacy: Category = {
  id: "intimacy",
  name: "亲密刺激",
  description: "成人相关（真心话/大冒险），请在合规前提下使用",
  allowedTypes: ["truth", "dare"],
  prompts: [
    t("in-1", "描述一个你私下最容易被点燃的情境。", "偏好"),
    t("in-2", "有哪件在亲密中想尝试但还没尝试的事？", "尝试"),
    t("in-3", "你更在意过程中的亲密感还是结果的强度？", "取向"),
    t("in-4", "一件你希望对方知道但没说出口的渴望？", "沟通"),
    d("in-5", "和对方对视30秒，只用眼神沟通彼此需求。", "连接"),
    d("in-6", "闭眼描述触感，让对方猜测被触碰部位（安全边界内）。", "触感"),
    d("in-7", "在同意前提下，用一句话提出一个轻度新玩法。", "同意"),
    t("in-8", "分享一件让你“出戏”的小细节，并讨论改进。", "雷点"),
    d("in-9", "用赞美的口吻描述对方身体你最喜欢的一个部分。", "欣赏"),
    t("in-10", "你对安全词或停手信号的偏好是什么？", "安全"),
    t("in-11", "哪种氛围最让你安心探索？", "氛围"),
    d("in-12", "共同列一份“只今天”的尝试清单（至少3项）。", "清单"),
    t("in-13", "亲密中的“边界雷区”有哪些？", "边界"),
    d("in-14", "和对方各自说出一个赞美并拥抱10秒。", "连接"),
    t("in-15", "你最在意被尊重的一个具体点是什么？", "尊重"),
  ],
};


