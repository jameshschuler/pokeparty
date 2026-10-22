import { Link } from "@tanstack/react-router";
import { useSimonContext } from "../../contexts/simon-context";
import { QuitRound } from "../game/QuitRound";
import { SECONDARY_BUTTON } from "../shared/button-styles";
import { SimonBoard } from "./SimonBoard";
import { SimonMuteButton } from "./SimonMuteButton";
import { SimonStatus } from "./SimonStatus";
import { SimonSummary } from "./SimonSummary";

export function SimonGame() {
  const { game, hold, release } = useSimonContext();

  if (game.finished) {
    return <SimonSummary />;
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4">
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
        <SimonMuteButton />
      </div>
      <SimonStatus />
      <SimonBoard key={game.startedAt} />
    </section>
  );
}
