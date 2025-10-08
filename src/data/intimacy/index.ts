import { Category, CategoryMeta } from "@/data/types";
import { intimacyCore } from "@/data/intimacy/topics/core";

export const intimacyMeta: CategoryMeta = {
  id: "intimacy",
  name: "亲密刺激",
  description: "成人相关（真心话/大冒险），请在合规前提下使用",
  allowedTypes: ["truth", "dare"],
};

export const intimacyCategory: Category = {
  ...intimacyMeta,
  prompts: [...intimacyCore],
};


