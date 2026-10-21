import { formatPlayedAt } from "../../lib/leaderboard";

type ScoreRowProps = {
  rank: number;
  score: number;
  detail: string;
  playedAt: number;
};

export function ScoreRow({ rank, score, detail, playedAt }: ScoreRowProps) {
  return (
    <li className="border-ink shadow-sticker-sm flex items-center gap-3 rounded-2xl border-[3px] bg-white px-4 py-2">
      <span className="text-ink/70 w-7 text-lg font-bold">#{rank}</span>
      <span className="text-primary w-14 text-3xl font-bold">{score}</span>
      <span className="flex min-w-0 flex-1 flex-col text-sm">
        <span>{detail}</span>
        <span className="text-ink/70">{formatPlayedAt(playedAt)}</span>
      </span>
    </li>
  );
}
