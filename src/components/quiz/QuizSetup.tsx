import { Link, useSearch } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { DEFAULT_CLOCK_SETTING, QUIZ_MODES } from "../../lib/quiz";
import { BackLink } from "../layout/BackLink";
import { PILL_BUTTON } from "../shared/button-styles";
import { QuizClockOptions } from "./QuizClockOptions";
import { QuizModeOption } from "./QuizModeOption";

export function QuizSetup() {
  const { mode } = useSearch({ from: "/quiz/" });

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <BackLink to="/" label="Back" />
        <Link
          to="/quiz/leaderboard"
          search={{ mode, clock: DEFAULT_CLOCK_SETTING }}
          className={PILL_BUTTON}
        >
          <Trophy className="size-5" aria-hidden />
          Your scores
        </Link>
      </div>
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
      <QuizClockOptions mode={mode} />
    </section>
  );
}
