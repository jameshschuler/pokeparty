import { accuracy, formatClockSetting } from "../../lib/quiz";
import type { QuizResult } from "../../lib/quiz-result";
import { QUIZ_MODE_DETAILS } from "./quiz-modes";

export function QuizScore({ result }: { result: QuizResult }) {
  const stats = [
    { label: "Wrong", value: result.wrong },
    { label: "Accuracy", value: `${accuracy(result.score, result.wrong)}%` },
    { label: "Best streak", value: result.streak },
  ];

  return (
    <>
      <p>
        <span className="text-primary block text-6xl font-bold">
          {result.score}
        </span>
        correct · {QUIZ_MODE_DETAILS[result.mode].label} ·{" "}
        {formatClockSetting(result.clock)}
      </p>
      <dl className="grid w-full grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface rounded-2xl p-2">
            <dt className="text-ink/70 text-sm">{stat.label}</dt>
            <dd className="text-xl font-bold">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
