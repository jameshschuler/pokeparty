import { useState, type RefObject } from "react";
import { usePlaythroughContext } from "../../contexts/playthrough-context";
import {
  currentLevel,
  STINT_ERROR_MESSAGES,
  stintName,
} from "../../lib/playthrough";
import type { TeamStint } from "../../types/playthrough";
import { FormDialog } from "./FormDialog";
import { TextField } from "./TextField";

type LeaveDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  stint: TeamStint;
};

export function LeaveDialog({ dialogRef, stint }: LeaveDialogProps) {
  const { swapOut } = usePlaythroughContext();
  const startLevel = String(currentLevel(stint) ?? "");
  const [level, setLevel] = useState(startLevel);
  const [error, setError] = useState<string | null>(null);
  const name = stintName(stint);

  function save() {
    const result = swapOut(stint.id, Number(level), null);

    if (result) {
      setError(STINT_ERROR_MESSAGES[result]);

      return;
    }
    dialogRef.current?.close();
  }

  function reset() {
    setLevel(startLevel);
    setError(null);
  }

  return (
    <FormDialog
      dialogRef={dialogRef}
      title={`Remove ${name} from the team`}
      error={error}
      onSubmit={save}
      onClose={reset}
    >
      <p className="text-ink/70">
        It stays on the timeline as leaving at this level.
      </p>
      <TextField
        label={`Level ${name} left at`}
        value={level}
        onChange={setLevel}
        inputMode="numeric"
        maxLength={3}
        autoFocus
      />
    </FormDialog>
  );
}
