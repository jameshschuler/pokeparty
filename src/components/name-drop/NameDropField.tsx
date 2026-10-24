import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useNameDropContext } from "../../contexts/name-drop-context";
import { playTime, progress } from "../../lib/name-drop";
import { FallingPokemon } from "./FallingPokemon";

type Falling = {
  element: HTMLElement;
  size: number;
};

export function NameDropField({ children }: { children: ReactNode }) {
  const { game } = useNameDropContext();
  const fieldRef = useRef<HTMLDivElement>(null);
  const falling = useRef(new Map<number, Falling>());
  const gameRef = useRef(game);
  const running = game.phase === "playing" && game.runningSince !== null;

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    if (!running) {
      return;
    }

    let frame = 0;

    function render() {
      const current = gameRef.current;
      const height = fieldRef.current?.clientHeight ?? 0;
      const at = playTime(current, Date.now());

      for (const drop of current.drops) {
        const entry = falling.current.get(drop.id);

        if (entry) {
          const travel = height - entry.size;
          entry.element.style.transform = `translateY(${progress(drop, at) * travel}px)`;
        }
      }
      frame = requestAnimationFrame(render);
    }
    frame = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frame);
  }, [running]);

  const register = useCallback((id: number, element: HTMLElement | null) => {
    if (!element) {
      falling.current.delete(id);
    } else if (!falling.current.has(id)) {
      falling.current.set(id, { element, size: element.offsetHeight });
    }
  }, []);

  return (
    <div
      ref={fieldRef}
      aria-label="Falling Pokémon"
      role="region"
      className="border-ink bg-surface relative min-h-36 flex-1 overflow-hidden rounded-3xl border-[3px]"
    >
      {game.drops.map((drop) => (
        <FallingPokemon
          key={drop.id}
          drop={drop}
          typedCount={drop.id === game.lockedId ? game.typed.length : 0}
          register={register}
        />
      ))}
      {children}
    </div>
  );
}
