import { Category, CategoryMeta } from "@/data/types";
import { philosophyCore } from "@/data/philosophy/topics/core";

export const philosophyMeta: CategoryMeta = {
  id: "philosophy",
  name: "哲学讨论",
  description: "纯问题，适合深度思辨与价值观碰撞",
  allowedTypes: ["question"],
};

export const philosophyCategory: Category = {
  ...philosophyMeta,
  prompts: [...philosophyCore],
};


