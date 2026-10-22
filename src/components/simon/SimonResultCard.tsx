import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { simonResultUrl, type SimonResult } from "../../lib/simon-result";
import { MissingResult } from "../share/MissingResult";
import { ResultCard } from "../share/ResultCard";
import { PRIMARY_BUTTON, TEXT_LINK } from "../shared/button-styles";
import { SimonScoreCard } from "./SimonScoreCard";

export function SimonResultCard({ result }: { result: SimonResult | null }) {
  if (!result) {
    return (
      <MissingResult
        playLink={
          <Link to="/simon" className={TEXT_LINK}>
            Play Simon
          </Link>
        }
      />
    );
  }

  return (
    <ResultCard
      title="Simon"
      url={simonResultUrl(result, window.location.origin)}
      shareTitle="Can you beat my Simon score?"
      playLink={
        <Link
          to="/simon/play"
          search={{ level: result.level }}
          className={PRIMARY_BUTTON}
        >
          <Play className="size-5" aria-hidden />
          Play this level
        </Link>
      }
    >
      <SimonScoreCard result={result} />
    </ResultCard>
  );
}
