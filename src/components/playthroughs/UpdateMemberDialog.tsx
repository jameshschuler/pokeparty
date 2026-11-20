import { useState, type RefObject } from "react";
import { usePlaythroughContext } from "../../contexts/playthrough-context";
import { evolutionOptions } from "../../lib/evolutions";
import { gameGeneration } from "../../lib/games";
import {
  currentLevel,
  currentPokemonId,
  STINT_ERROR_MESSAGES,
  stintName,
} from "../../lib/playthrough";
import type { TeamStint } from "../../types/playthrough";
import { EvolutionChoice } from "./EvolutionChoice";
import { FormDialog } from "./FormDialog";
import { TextField } from "./TextField";

type UpdateMemberDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  stint: TeamStint;
};

export function UpdateMemberDialog({
  dialogRef,
  stint,
}: UpdateMemberDialogProps) {
  const { playthrough, updateMember } = usePlaythroughContext();
  const startId = currentPokemonId(stint);
  const startLevel = String(currentLevel(stint) ?? "");
  const [level, setLevel] = useState(startLevel);
  const [pokemonId, setPokemonId] = useState(startId);
  const [error, setError] = useState<string | null>(null);
  const evolutions = evolutionOptions(
    startId,
    gameGeneration(playthrough.gameId),
  );
  const name = stintName(stint);

  function save() {
    const result = updateMember(stint.id, Number(level), pokemonId);

    if (result) {
      setError(STINT_ERROR_MESSAGES[result]);

      return;
    }
    dialogRef.current?.close();
  }

  function reset() {
    setLevel(startLevel);
    setPokemonId(startId);
    setError(null);
  }

  return (
    <FormDialog
      dialogRef={dialogRef}
      title={`Update ${name}`}
      error={error}
      onSubmit={save}
      onClose={reset}
    >
      <TextField
        label="Level now"
        value={level}
        onChange={setLevel}
        inputMode="numeric"
        maxLength={3}
        autoFocus
      />
      {evolutions.length > 0 ? (
        <EvolutionChoice
          currentId={startId}
          evolutions={evolutions}
          value={pokemonId}
          onChange={setPokemonId}
        />
      ) : (
        <p className="text-ink/70">{name} doesn't evolve any further.</p>
      )}
    </FormDialog>
  );
}
