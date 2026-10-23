import { useNameDropContext } from "../../contexts/name-drop-context";

export function NameDropAnnouncer() {
  const { game } = useNameDropContext();
  const { lastSpawn, lastClear } = game;

  return (
    <div className="sr-only">
      <p aria-live="polite">
        {lastSpawn && <span key={lastSpawn.id}>{lastSpawn.name}</span>}
      </p>
      <p aria-live="polite">
        {lastClear && (
          <span key={lastClear.id}>
            Cleared {lastClear.name}, {lastClear.points} points
          </span>
        )}
      </p>
    </div>
  );
}
