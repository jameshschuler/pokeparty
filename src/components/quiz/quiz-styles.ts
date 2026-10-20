import type { Difficulty } from "./quiz-modes";

export function choiceStyle(
  isAnswer: boolean,
  isPicked: boolean,
  revealed: boolean,
) {
  if (!revealed) {
    return "bg-white shadow-sticker-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";
  }

  if (isAnswer) {
    return "bg-correct text-white";
  }

  return isPicked ? "bg-wrong text-white" : "bg-white opacity-50";
}

export const DIFFICULTY_STYLES: Record<
  Difficulty,
  { text: string; dot: string }
> = {
  beginner: { text: "text-green-700", dot: "bg-green-600" },
  intermediate: { text: "text-orange-700", dot: "bg-orange-500" },
  advanced: { text: "text-red-700", dot: "bg-red-600" },
};
