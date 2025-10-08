import type { Prompt } from "@/data/types";

export function getRandomPrompt(
  prompts: Prompt[],
  excludeIds: Set<string> | undefined
): Prompt | null {
  if (prompts.length === 0) return null;
  const pool = excludeIds && excludeIds.size > 0
    ? prompts.filter((p) => !excludeIds.has(p.id))
    : prompts;
  if (pool.length === 0) return prompts[Math.floor(Math.random() * prompts.length)];
  return pool[Math.floor(Math.random() * pool.length)];
}


