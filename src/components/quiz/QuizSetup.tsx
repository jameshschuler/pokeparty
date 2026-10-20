import { Link, useSearch } from "@tanstack/react-router";
import { Timer, Zap } from "lucide-react";
import {
  QUIZ_MODES,
  ROUND_SECONDS,
  TIME_ATTACK_BONUS_MS,
  TIME_ATTACK_START_MS,
} from "../../lib/quiz";
import { BackLink } from "../layout/BackLink";
import { PRIMARY_SURFACE } from "../shared/button-styles";
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
      <ul className="grid grid-cols-3 gap-3">
        {ROUND_SECONDS.map((seconds) => (
          <li key={seconds}>
            <Link
              to="/quiz/play"
              search={{ mode, clock: seconds }}
              className={`${PRIMARY_SURFACE} flex-col gap-1 py-5`}
            >
              <Timer className="size-6" aria-hidden />
              <span className="text-2xl font-bold">{seconds}s</span>
            </Link>
          </li>
        ))}
        <li className="col-span-3">
          <Link
            to="/quiz/play"
            search={{ mode, clock: "attack" }}
            className={`${PRIMARY_SURFACE} gap-3 px-4 py-4`}
          >
            <Zap className="size-6 shrink-0" aria-hidden />
            <span className="flex flex-col text-left">
              <span className="text-2xl font-bold">Time attack</span>
              <span>
                Start with {TIME_ATTACK_START_MS / 1000}s. Right answers add{" "}
                {TIME_ATTACK_BONUS_MS / 1000}s.
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
