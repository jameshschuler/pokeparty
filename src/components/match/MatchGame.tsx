import { Link } from "@tanstack/react-router";
import { useMatchContext } from "../../contexts/match-context";
import { QuitRound } from "../game/QuitRound";
import { SECONDARY_BUTTON } from "../shared/button-styles";
import { MatchBoard } from "./MatchBoard";
import { MatchHud } from "./MatchHud";
import { MatchSummary } from "./MatchSummary";

export function MatchGame() {
  const { game, hold, release } = useMatchContext();

  if (game.phase === "done") {
    return <MatchSummary />;
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4">
      <h1 className="sr-only">Pokémon Match</h1>
      <QuitRound
        hold={hold}
        release={release}
        exit={
          <Link to="/match" className={SECONDARY_BUTTON}>
            Quit
          </Link>
        }
      />
      <MatchHud />
      <MatchBoard key={game.startedAt} />
    </section>
  );
}
