import { Category, CategoryMeta } from "@/data/types";
import { datingCore } from "@/data/dating/topics/core";

export const datingMeta: CategoryMeta = {
  id: "dating",
  name: "朋友",
  description: "",
  allowedTypes: ["truth"],
};

export const datingCategory: Category = {
  ...datingMeta,
  prompts: [...datingCore],
};


