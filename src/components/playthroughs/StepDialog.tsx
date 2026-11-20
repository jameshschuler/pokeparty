import { Sparkles } from "lucide-react";
import { useState, type RefObject } from "react";
import { usePlaythroughContext } from "../../contexts/playthrough-context";
import { usePokemonPickerContext } from "../../contexts/pokemon-picker-context";
import {
  currentLevel,
  parseLevel,
  STINT_ERROR_MESSAGES,
  stintName,
} from "../../lib/playthrough";
import { formatPokemonLabel } from "../../lib/pokemon";
import type { PokemonSummary } from "../../types/pokemon";
import type { TeamStint } from "../../types/playthrough";
import { FormDialog } from "./FormDialog";
import { TextField } from "./TextField";

type StepDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  picked: PokemonSummary | null;
  leaving: TeamStint | null;
  onDone: () => void;
};

function stepTitle(picked: PokemonSummary | null, leaving: TeamStint | null) {
  const name = picked ? formatPokemonLabel(picked) : "a Pokémon";

  return leaving ? `Swap ${stintName(leaving)} for ${name}` : `Add ${name}`;
}

export function StepDialog({
  dialogRef,
  picked,
  leaving,
  onDone,
}: StepDialogProps) {
  const { addMember, swapOut } = usePlaythroughContext();
  const { shinyMode } = usePokemonPickerContext();
  const startLeftLevel = String((leaving && currentLevel(leaving)) ?? "");
  const [leftLevel, setLeftLevel] = useState(startLeftLevel);
  const [joinedLevel, setJoinedLevel] = useState("");
  const [nickname, setNickname] = useState("");
  const [shiny, setShiny] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isShiny = shiny ?? shinyMode;

  function save() {
    const member = picked && {
      pokemonId: picked.id,
      shiny: isShiny,
      nickname,
      level: parseLevel(joinedLevel),
    };
    const result = leaving
      ? swapOut(leaving.id, Number(leftLevel), member)
      : member && addMember(member);

    if (result) {
      setError(STINT_ERROR_MESSAGES[result]);

      return;
    }
    onDone();
  }

  function reset() {
    setLeftLevel(startLeftLevel);
    setJoinedLevel("");
    setNickname("");
    setShiny(null);
    setError(null);
  }

  return (
    <FormDialog
      dialogRef={dialogRef}
      title={stepTitle(picked, leaving)}
      error={error}
      onSubmit={save}
      onClose={reset}
    >
      {leaving && (
        <TextField
          label={`Level ${stintName(leaving)} left at`}
          value={leftLevel}
          onChange={setLeftLevel}
          inputMode="numeric"
          maxLength={3}
          autoFocus
        />
      )}
      {picked && (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <TextField
              label="Level it joined at (optional)"
              value={joinedLevel}
              onChange={setJoinedLevel}
              inputMode="numeric"
              maxLength={3}
              autoFocus={!leaving}
            />
            <button
              type="button"
              onClick={() => setShiny(!isShiny)}
              aria-pressed={isShiny}
              aria-label="Shiny"
              title="Shiny"
              className={`border-ink shadow-sticker-sm flex size-12 items-center justify-center rounded-2xl border-[3px] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                isShiny ? "bg-primary text-white" : "bg-white"
              }`}
            >
              <Sparkles className="size-6" aria-hidden />
            </button>
          </div>
          <TextField
            label="Nickname (optional)"
            value={nickname}
            onChange={setNickname}
            placeholder={formatPokemonLabel(picked)}
            maxLength={12}
          />
        </>
      )}
    </FormDialog>
  );
}
