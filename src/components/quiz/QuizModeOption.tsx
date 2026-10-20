import { useNavigate } from "@tanstack/react-router";
import type { QuizMode } from "../../lib/quiz";
import { DIFFICULTY_LABELS, QUIZ_MODE_DETAILS } from "./quiz-modes";
import { DIFFICULTY_STYLES } from "./quiz-styles";

type QuizModeOptionProps = {
  mode: QuizMode;
  selected: boolean;
};

export function QuizModeOption({ mode, selected }: QuizModeOptionProps) {
  const navigate = useNavigate();
  const { label, description, difficulty } = QUIZ_MODE_DETAILS[mode];

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => navigate({ to: "/quiz", search: { mode }, replace: true })}
      className={`border-ink flex w-full flex-col rounded-2xl border-[3px] p-4 text-left transition ${
        selected ? "bg-accent shadow-sticker" : "shadow-sticker-sm bg-white"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-lg font-bold">{label}</span>
        <span
          className={`border-ink flex items-center gap-1.5 rounded-full border-2 bg-white px-2.5 text-sm font-bold ${DIFFICULTY_STYLES[difficulty].text}`}
        >
          <span
            aria-hidden
            className={`size-2.5 rounded-full ${DIFFICULTY_STYLES[difficulty].dot}`}
          />
          {DIFFICULTY_LABELS[difficulty]}
        </span>
      </span>
      <span className="text-ink/70">{description}</span>
    </button>
  );
}
