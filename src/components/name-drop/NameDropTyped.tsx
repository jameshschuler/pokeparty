import { useNameDropContext } from "../../contexts/name-drop-context";

export function NameDropTyped() {
  const { game } = useNameDropContext();

  return (
    <p
      key={game.wrongLetters}
      aria-hidden
      className={`border-ink flex min-h-11 shrink-0 items-center rounded-2xl border-[3px] bg-white px-4 font-mono text-lg font-bold ${game.wrongLetters > 0 ? "animate-wrong" : ""}`}
    >
      {game.typed || <span className="text-ink/40">Start typing…</span>}
    </p>
  );
}
