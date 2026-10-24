import { Link, Outlet } from "@tanstack/react-router";
import { DEFAULT_DEX_RANGE } from "../../lib/dex-run";
import { BOARD_SIZE } from "../../lib/leaderboard";
import { DEFAULT_CLOCK_SETTING, DEFAULT_QUIZ_MODE } from "../../lib/quiz";
import { DEFAULT_MATCH_LEVEL } from "../../lib/match";
import { DEFAULT_SIMON_LEVEL } from "../../lib/simon";
import { BackLink } from "../layout/BackLink";
import { SCORES_TAB } from "./scores-styles";

export function ScoresLayout() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-4">
      <BackLink to="/" label="Back" />
      <div>
        <h1 className="text-3xl font-bold">Your scores</h1>
        <p className="text-ink/70 mt-1">
          Your top {BOARD_SIZE} runs on each board, saved on this device.
        </p>
      </div>
      <nav aria-label="Games" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Link
          to="/scores/quiz"
          search={{ mode: DEFAULT_QUIZ_MODE, clock: DEFAULT_CLOCK_SETTING }}
          {...SCORES_TAB}
        >
          Who's That Pokémon?
        </Link>
        <Link
          to="/scores/dex-run"
          search={{ range: DEFAULT_DEX_RANGE }}
          {...SCORES_TAB}
        >
          Dex Run
        </Link>
        <Link
          to="/scores/simon"
          search={{ level: DEFAULT_SIMON_LEVEL }}
          {...SCORES_TAB}
        >
          Simon
        </Link>
        <Link
          to="/scores/match"
          search={{ level: DEFAULT_MATCH_LEVEL }}
          {...SCORES_TAB}
        >
          Match
        </Link>
        <Link to="/scores/name-drop" {...SCORES_TAB}>
          Name Drop
        </Link>
      </nav>
      <Outlet />
    </section>
  );
}
