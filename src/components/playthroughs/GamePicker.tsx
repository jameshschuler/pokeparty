import { GAME_GROUPS, type GameId } from "../../lib/games";
import { FilterChip } from "../shared/FilterChip";

type GamePickerProps = {
  value: GameId | null;
  onChange: (gameId: GameId) => void;
};

export function GamePicker({ value, onChange }: GamePickerProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-lg font-semibold">Game</legend>
      {GAME_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1.5">
          <span className="text-ink/70 text-sm font-semibold">
            {group.label}
          </span>
          <ul aria-label={group.label} className="flex flex-wrap gap-2">
            {group.games.map((game) => (
              <li key={game.id} className="min-w-0">
                <FilterChip
                  selected={game.id === value}
                  selectedClassName="bg-primary text-white"
                  onClick={() => onChange(game.id)}
                >
                  {game.name}
                </FilterChip>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </fieldset>
  );
}
