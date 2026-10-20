import { Link, useSearch } from "@tanstack/react-router";
import { Timer } from "lucide-react";
import { QUIZ_MODES, ROUND_SECONDS } from "../../lib/quiz";
import { QuizModeOption } from "./QuizModeOption";

export function QuizSetup() {
  const { mode } = useSearch({ from: "/quiz/" });

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold">Who's That Pokémon?</h1>
        <p className="text-ink/70 mt-1">
          Name as many Pokémon as you can before time runs out. One guess each.
        </p>
      </div>
      <h2 className="text-xl font-semibold">Pick a mode</h2>
      <ul className="grid gap-3 sm:grid-cols-2" aria-label="Mode">
        {QUIZ_MODES.map((option) => (
          <li key={option}>
            <QuizModeOption mode={option} selected={option === mode} />
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold">How long?</h2>
      <ul className="grid grid-cols-3 gap-3">
        {ROUND_SECONDS.map((seconds) => (
          <li key={seconds}>
            <Link
              to="/quiz/play"
              search={{ mode, seconds }}
              className="border-ink bg-primary shadow-sticker flex flex-col items-center gap-1 rounded-2xl border-[3px] py-5 text-white transition active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Timer className="size-6" aria-hidden />
              <span className="text-2xl font-bold">{seconds}s</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
