import type { Category, CategoryId, Prompt, PromptType } from "@/data/types";
import { philosophy } from "@/data/prompts/philosophy";
import { dating } from "@/data/prompts/dating";
import { intimacy } from "@/data/prompts/intimacy";
import { party } from "@/data/prompts/party";

export const categories: Record<CategoryId, Category> = {
  philosophy,
  dating,
  intimacy,
  party,
};

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

export const FREE_LIMIT_PER_CATEGORY = 15;


