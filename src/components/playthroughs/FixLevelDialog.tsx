import { useState, type RefObject } from "react";
import { usePlaythroughContext } from "../../contexts/playthrough-context";
import { STINT_ERROR_MESSAGES } from "../../lib/playthrough";
import { FormDialog } from "./FormDialog";
import { TextField } from "./TextField";

type FixLevelDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  stintId: string;
  step: number;
  level: number | null;
  label: string;
};

export function FixLevelDialog({
  dialogRef,
  stintId,
  step,
  level,
  label,
}: FixLevelDialogProps) {
  const { fixLevel } = usePlaythroughContext();
  const [value, setValue] = useState(String(level ?? ""));
  const [error, setError] = useState<string | null>(null);

  function save() {
    const result = fixLevel(stintId, step, Number(value));

    if (result) {
      setError(STINT_ERROR_MESSAGES[result]);

      return;
    }
    dialogRef.current?.close();
  }

  function reset() {
    setValue(String(level ?? ""));
    setError(null);
  }

  return (
    <FormDialog
      dialogRef={dialogRef}
      title={`${label}…`}
      error={error}
      onSubmit={save}
      onClose={reset}
    >
      <TextField
        label="Level"
        value={value}
        onChange={setValue}
        inputMode="numeric"
        maxLength={3}
        autoFocus
      />
    </FormDialog>
  );
}
