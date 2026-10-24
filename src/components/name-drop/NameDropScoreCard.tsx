import type { NameDropResult } from "../../lib/name-drop-result";

export function NameDropScoreCard({ result }: { result: NameDropResult }) {
  return (
    <>
      <p>
        <span className="text-primary block text-6xl font-bold">
          {result.score}
        </span>
        points
      </p>
      <p className="bg-surface rounded-2xl px-4 py-2 font-semibold">
        {result.cleared} Pokémon named
      </p>
    </>
  );
}
