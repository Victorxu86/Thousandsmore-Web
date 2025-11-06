import { Category, CategoryMeta } from "@/data/types";
import { partyCore } from "@/data/party/topics/core";

export const partyMeta: CategoryMeta = {
  id: "party",
  name: "派对",
  description: "真心话 / 大冒险，轻松破冰与热场",
  allowedTypes: ["truth", "dare"],
};

export const partyCategory: Category = {
  ...partyMeta,
  prompts: [...partyCore],
};


