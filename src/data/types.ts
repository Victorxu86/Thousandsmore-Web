export type CategoryId = "dating" | "intimacy" | "party";

export type PromptType = "question" | "truth" | "dare";

export interface Prompt {
  id: string;
  text: string;
  type: PromptType;
}

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  description: string;
  allowedTypes: PromptType[];
}

export interface Category extends CategoryMeta {
  prompts: Prompt[];
}

export function q(id: string, text: string): Prompt {
  return { id, text, type: "question" };
}

export function t(id: string, text: string): Prompt {
  return { id, text, type: "truth" };
}

export function d(id: string, text: string): Prompt {
  return { id, text, type: "dare" };
}


