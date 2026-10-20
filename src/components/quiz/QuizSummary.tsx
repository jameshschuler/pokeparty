import { Link } from "@tanstack/react-router";
import { RotateCcw, Timer } from "lucide-react";
import { useQuizContext } from "../../contexts/quiz-context";
import { accuracy } from "../../lib/quiz";
import { QUIZ_MODE_DETAILS } from "./quiz-modes";

export function QuizSummary() {
  const { round, mode, seconds, playAgain } = useQuizContext();
  const { quiz } = round;
  const stats = [
    { label: "Wrong", value: quiz.wrong },
    { label: "Accuracy", value: `${accuracy(quiz.correct, quiz.wrong)}%` },
    { label: "Best streak", value: quiz.bestStreak },
  ];

  return (
    <section className="border-ink shadow-sticker flex flex-col items-center gap-4 rounded-3xl border-[3px] bg-white p-6 text-center">
      <h1 className="text-3xl font-bold">Time's up!</h1>
      <p>
        <span className="text-primary block text-6xl font-bold">
          {quiz.correct}
        </span>
        correct in {seconds} seconds · {QUIZ_MODE_DETAILS[mode].label}
      </p>
      <dl className="grid w-full grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface rounded-2xl p-2">
            <dt className="text-ink/70 text-sm">{stat.label}</dt>
            <dd className="text-xl font-bold">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={playAgain}
          className="border-ink bg-primary shadow-sticker flex min-h-12 items-center gap-2 rounded-2xl border-[3px] px-5 text-lg font-semibold text-white transition active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <RotateCcw className="size-5" aria-hidden />
          Play again
        </button>
        <Link
          to="/quiz"
          search={{ mode }}
          className="border-ink shadow-sticker-sm flex min-h-12 items-center gap-2 rounded-2xl border-[3px] bg-white px-5 text-lg font-semibold"
        >
          <Timer className="size-5" aria-hidden />
          Change setup
        </Link>
      </div>
    </section>
  );
}
