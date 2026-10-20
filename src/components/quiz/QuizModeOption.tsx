import { useNavigate } from "@tanstack/react-router";
import type { QuizMode } from "../../lib/quiz";
import { QUIZ_MODE_DETAILS } from "./quiz-modes";

type QuizModeOptionProps = {
  mode: QuizMode;
  selected: boolean;
};

export function QuizModeOption({ mode, selected }: QuizModeOptionProps) {
  const navigate = useNavigate();
  const { label, description } = QUIZ_MODE_DETAILS[mode];

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => navigate({ to: "/quiz", search: { mode }, replace: true })}
      className={`border-ink flex w-full flex-col rounded-2xl border-[3px] p-4 text-left transition ${
        selected ? "bg-accent shadow-sticker" : "shadow-sticker-sm bg-white"
      }`}
    >
      <span className="text-lg font-bold">{label}</span>
      <span className="text-ink/70">{description}</span>
    </button>
  );
}
