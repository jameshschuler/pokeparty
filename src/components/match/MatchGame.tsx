import { Link } from "@tanstack/react-router";
import { useMatchContext } from "../../contexts/match-context";
import { MuteButton } from "../game/MuteButton";
import { QuitRound } from "../game/QuitRound";
import { SECONDARY_BUTTON } from "../shared/button-styles";
import { MatchBoard } from "./MatchBoard";
import { MatchHud } from "./MatchHud";
import { MatchStatus } from "./MatchStatus";
import { MatchSummary } from "./MatchSummary";

export function MatchGame() {
  const { game, sound, hold, release } = useMatchContext();

  if (game.finished) {
    return <MatchSummary />;
  }

  return (
    <section
      className="mx-auto flex max-w-md flex-col gap-4"
      onClick={sound.unlock}
      onTouchEnd={sound.unlock}
    >
      <h1 className="sr-only">Pokémon Match</h1>
      <div className="flex items-center justify-between gap-3">
        <QuitRound
          hold={hold}
          release={release}
          exit={
            <Link to="/match" className={SECONDARY_BUTTON}>
              Quit
            </Link>
          }
        />
        <MuteButton sound={sound} />
      </div>
      <MatchHud />
      <MatchStatus />
      <MatchBoard key={game.startedAt} />
    </section>
  );
}
