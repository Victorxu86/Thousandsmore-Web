import type { Category } from "@/data/types";

function t(id: string, text: string, topic?: string) {
  return { id, text, type: "truth" as const, topic };
}
function d(id: string, text: string, topic?: string) {
  return { id, text, type: "dare" as const, topic };
}

export const party: Category = {
  id: "party",
  name: "酒桌派对",
  description: "真心话 / 大冒险，轻松破冰与热场",
  allowedTypes: ["truth", "dare"],
  prompts: [
    t("pt-1", "说出你这周最尴尬的一件小事。", "尴尬"),
    t("pt-2", "你手机里最近的一张自拍，讲述背后的故事。", "分享"),
    d("pt-3", "给左手边的人一个夸张的赞美。", "破冰"),
    d("pt-4", "模仿一种动物走路10秒。", "搞怪"),
    t("pt-5", "你最离谱的一次网购是什么？", "趣事"),
    t("pt-6", "坦白一个你不合群的小癖好。", "坦白"),
    d("pt-7", "和右手边的人击掌并说出对方一个优点。", "互动"),
    d("pt-8", "把名字倒着念三次。", "小游戏"),
    t("pt-9", "第一次印象与现在对某人的看法差别？", "认知"),
    d("pt-10", "用方言夸别人一句。", "夸赞"),
    t("pt-11", "分享一个你私藏的快乐BGM。", "音乐"),
    d("pt-12", "把杯子举过头顶说“我超棒”然后喝一口。", "轻松"),
    t("pt-13", "你曾经最无聊但开心的一次聚会经历？", "聚会"),
    d("pt-14", "表演一个5秒钟的即兴舞步。", "舞动"),
    t("pt-15", "如果现在立刻来个旅行，你想去哪？", "旅行"),
  ],
};


