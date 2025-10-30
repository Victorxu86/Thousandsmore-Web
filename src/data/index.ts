import { Category, CategoryId, Prompt, PromptType } from "@/data/types";
import { datingCategory } from "@/data/dating";
import { intimacyCategory } from "@/data/intimacy";
import { partyCategory } from "@/data/party";

export const categories: Record<CategoryId, Category> = {
  dating: datingCategory,
  intimacy: intimacyCategory,
  party: partyCategory,
};

export function getCategoryById(categoryId: string): Category | null {
  const alias = categoryId === "deeptalk" ? "dating" : categoryId;
  const key = alias as CategoryId;
  return categories[key] ?? null;
}

export function getPromptsByType(category: Category, type: PromptType | "all"): Prompt[] {
  if (type === "all") return category.prompts;
  return category.prompts.filter((p) => p.type === type);
}


