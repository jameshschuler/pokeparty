import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import {
  nameDropResultUrl,
  type NameDropResult,
} from "../../lib/name-drop-result";
import { MissingResult } from "../share/MissingResult";
import { ResultCard } from "../share/ResultCard";
import { PRIMARY_BUTTON } from "../shared/button-styles";
import { NameDropScoreCard } from "./NameDropScoreCard";

export function NameDropResultCard({
  result,
}: {
  result: NameDropResult | null;
}) {
  if (!result) {
    return (
      <MissingResult
        playLink={
          <Link to="/name-drop/play" className={PRIMARY_BUTTON}>
            <Play className="size-5" aria-hidden />
            Play Name Drop
          </Link>
        }
      />
    );
  }

  return (
    <ResultCard
      title="Name Drop"
      url={nameDropResultUrl(result, window.location.origin)}
      shareTitle="Can you type faster than me?"
      playLink={
        <Link to="/name-drop/play" className={PRIMARY_BUTTON}>
          <Play className="size-5" aria-hidden />
          Play Name Drop
        </Link>
      }
    >
      <NameDropScoreCard result={result} />
    </ResultCard>
  );
}
