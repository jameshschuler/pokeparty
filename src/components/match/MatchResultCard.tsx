import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { matchResultUrl, type MatchResult } from "../../lib/match-result";
import { MissingResult } from "../share/MissingResult";
import { ResultCard } from "../share/ResultCard";
import { PRIMARY_BUTTON } from "../shared/button-styles";
import { MatchScoreCard } from "./MatchScoreCard";

export function MatchResultCard({ result }: { result: MatchResult | null }) {
  if (!result) {
    return (
      <MissingResult
        playLink={
          <Link to="/match" className={PRIMARY_BUTTON}>
            Play Pokémon Match
          </Link>
        }
      />
    );
  }

  return (
    <ResultCard
      title="Pokémon Match"
      url={matchResultUrl(result, window.location.origin)}
      shareTitle="Can you match them in fewer flips?"
      playLink={
        <Link
          to="/match/play"
          search={{ level: result.level }}
          className={PRIMARY_BUTTON}
        >
          <Play className="size-5" aria-hidden />
          Play this level
        </Link>
      }
    >
      <MatchScoreCard result={result} />
    </ResultCard>
  );
}
