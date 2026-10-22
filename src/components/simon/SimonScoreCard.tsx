import { formatSimonLevel, SIMON_SCORE_LABEL } from "../../lib/simon";
import type { SimonResult } from "../../lib/simon-result";

export function SimonScoreCard({ result }: { result: SimonResult }) {
  return (
    <p>
      <span className="text-primary block text-6xl font-bold">
        {result.score}
      </span>
      {SIMON_SCORE_LABEL} · {formatSimonLevel(result.level)}
    </p>
  );
}
