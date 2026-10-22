import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { dexRunResultUrl, type DexRunResult } from "../../lib/dex-run-result";
import { MissingResult } from "../share/MissingResult";
import { ResultCard } from "../share/ResultCard";
import { PRIMARY_BUTTON, TEXT_LINK } from "../shared/button-styles";
import { DexRunScoreCard } from "./DexRunScoreCard";

export function DexRunResultCard({ result }: { result: DexRunResult | null }) {
  if (!result) {
    return (
      <MissingResult
        playLink={
          <Link to="/dex-run" className={TEXT_LINK}>
            Play Dex Run
          </Link>
        }
      />
    );
  }

  return (
    <ResultCard
      title="Dex Run"
      url={dexRunResultUrl(result, window.location.origin)}
      shareTitle="Can you beat my Dex Run?"
      playLink={
        <Link
          to="/dex-run/play"
          search={{ range: result.range }}
          className={PRIMARY_BUTTON}
        >
          <Play className="size-5" aria-hidden />
          Play this dex
        </Link>
      }
    >
      <DexRunScoreCard result={result} />
    </ResultCard>
  );
}
