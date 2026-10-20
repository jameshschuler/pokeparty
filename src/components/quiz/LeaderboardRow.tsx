import { formatPlayedAt, type QuizRun } from "../../lib/leaderboard";
import { accuracy } from "../../lib/quiz";

type LeaderboardRowProps = {
  run: QuizRun;
  rank: number;
};

export function LeaderboardRow({ run, rank }: LeaderboardRowProps) {
  return (
    <li className="border-ink shadow-sticker-sm flex items-center gap-3 rounded-2xl border-[3px] bg-white px-4 py-2">
      <span className="text-ink/70 w-7 text-lg font-bold">#{rank}</span>
      <span className="text-primary w-12 text-3xl font-bold">{run.score}</span>
      <span className="flex min-w-0 flex-1 flex-col text-sm">
        <span>
          {accuracy(run.score, run.wrong)}% · streak {run.streak}
        </span>
        <span className="text-ink/70">{formatPlayedAt(run.playedAt)}</span>
      </span>
    </li>
  );
}
