export { categories, getCategoryById, getPromptsByType } from "@/data";
export type { CategoryId, PromptType, Prompt, Category } from "@/data/types";
export { FREE_LIMIT_PER_CATEGORY } from "@/data/config";
export function getRandomPrompt(
  prompts: import("@/data/types").Prompt[],
  excludeIds: Set<string> | undefined
) {
  if (prompts.length === 0) return null;
  const pool = excludeIds && excludeIds.size > 0
    ? prompts.filter((p) => !excludeIds.has(p.id))
    : prompts;
  if (pool.length === 0) return prompts[Math.floor(Math.random() * prompts.length)];
  return pool[Math.floor(Math.random() * pool.length)];
}


