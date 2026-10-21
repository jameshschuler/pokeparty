import { useSearch } from "@tanstack/react-router";
import { QUIZ_MODES } from "../../lib/quiz";
import { BackLink } from "../layout/BackLink";
import { QuizClockOptions } from "./QuizClockOptions";
import { QuizModeOption } from "./QuizModeOption";

export function QuizSetup() {
  const { mode } = useSearch({ from: "/quiz/" });

  return (
    <section className="flex flex-col gap-5">
      <BackLink to="/" label="Back" />
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
