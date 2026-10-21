import type { Difficulty } from "./quiz-modes";

export const DIFFICULTY_STYLES: Record<
  Difficulty,
  { text: string; dot: string }
> = {
  beginner: { text: "text-green-700", dot: "bg-green-600" },
  intermediate: { text: "text-orange-700", dot: "bg-orange-500" },
  advanced: { text: "text-red-700", dot: "bg-red-600" },
};
