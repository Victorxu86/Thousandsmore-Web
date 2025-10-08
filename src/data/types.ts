export type CategoryId = "philosophy" | "dating" | "intimacy" | "party";

export type PromptType = "question" | "truth" | "dare";

export interface Prompt {
  id: string;
  text: string;
  type: PromptType;
  topic?: string; // 可选：子主题，便于筛选
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  allowedTypes: PromptType[];
  prompts: Prompt[];
}


