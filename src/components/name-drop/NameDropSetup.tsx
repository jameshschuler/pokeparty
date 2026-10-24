import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useLeaderboardContext } from "../../contexts/leaderboard-context";
import { bestScore } from "../../lib/leaderboard";
import { NAME_DROP_LIVES } from "../../lib/name-drop";
import { BackLink } from "../layout/BackLink";
import { PRIMARY_BUTTON } from "../shared/button-styles";

export function NameDropSetup() {
  const { runs } = useLeaderboardContext();
  const best = bestScore(runs, { game: "name-drop" });

  return (
    <section className="flex flex-col gap-5">
      <BackLink to="/" label="Back" />
      <div>
        <h1 className="text-3xl font-bold">Name Drop</h1>
        <p className="text-ink/70 mt-1">
          Pokémon fall from the top. Type each name before it lands. Letters and
          numbers only: "Mr. Mime" is mrmime and Porygon2 is porygon2. You have{" "}
          {NAME_DROP_LIVES} lives, and clearing names in a row builds a combo.
        </p>
      </div>
      <p className="font-semibold">Your best: {best ?? "–"}</p>
      <Link to="/name-drop/play" className={`${PRIMARY_BUTTON} self-start`}>
        <Play className="size-5" aria-hidden />
        Play
      </Link>
    </section>
  );
}
