import { Link } from "@tanstack/react-router";
import { useDexRunContext } from "../../contexts/dex-run-context";
import { useRoundContext } from "../../contexts/round-context";
import { ChoiceGrid } from "../game/ChoiceGrid";
import { QuitRound } from "../game/QuitRound";
import { SECONDARY_BUTTON } from "../shared/button-styles";
import { DexRunHud } from "./DexRunHud";
import { DexRunPrompt } from "./DexRunPrompt";
import { DexRunSummary } from "./DexRunSummary";

export function DexRunGame() {
  const { run } = useDexRunContext();
  const { hold, release } = useRoundContext();

  if (run.finished) {
    return <DexRunSummary />;
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4">
      <h1 className="sr-only">Dex Run</h1>
      <QuitRound
        hold={hold}
        release={release}
        exit={
          <Link to="/dex-run" className={SECONDARY_BUTTON}>
            Quit
          </Link>
        }
      />
      <DexRunHud />
      <DexRunPrompt />
      <ChoiceGrid key={`choices-${run.index}`} />
    </section>
  );
}
