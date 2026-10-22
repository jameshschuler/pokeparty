import { Link } from "@tanstack/react-router";
import { useSimonContext } from "../../contexts/simon-context";
import { completedLength } from "../../lib/simon";
import { QuitRound } from "../game/QuitRound";
import { SECONDARY_BUTTON } from "../shared/button-styles";
import { SimonBanner } from "./SimonBanner";
import { SimonBoard } from "./SimonBoard";
import { SimonMuteButton } from "./SimonMuteButton";
import { SimonSummary } from "./SimonSummary";

export function SimonGame() {
  const { game, sound, hold, release } = useSimonContext();

  if (game.finished) {
    return <SimonSummary />;
  }

  return (
    <section
      className="mx-auto flex max-w-md flex-col gap-4"
      onClick={sound.unlock}
      onTouchEnd={sound.unlock}
    >
      <h1 className="sr-only">Simon</h1>
      <div className="flex items-center justify-between gap-3">
        <QuitRound
          hold={hold}
          release={release}
          exit={
            <Link to="/simon" className={SECONDARY_BUTTON}>
              Quit
            </Link>
          }
        />
        <p className="text-lg font-bold">
          Score{" "}
          <span aria-label="Score" className="tabular-nums">
            {completedLength(game)}
          </span>
        </p>
        <SimonMuteButton />
      </div>
      <SimonBanner />
      <SimonBoard key={game.startedAt} />
    </section>
  );
}
