export function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) {
    return null;
  }

  return (
    <p className="bg-accent border-ink rounded-full border-2 px-3 font-bold">
      {rank === 1 ? "New best!" : `#${rank} on your board`}
    </p>
  );
}
