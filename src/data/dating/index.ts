import { Category, CategoryMeta } from "@/data/types";
import { datingCore } from "@/data/dating/topics/core";

export const datingMeta: CategoryMeta = {
  id: "dating",
  name: "约会期话题",
  description: "纯问题，帮助两人更快建立连接",
  allowedTypes: ["question"],
};

export const datingCategory: Category = {
  ...datingMeta,
  prompts: [...datingCore],
};


