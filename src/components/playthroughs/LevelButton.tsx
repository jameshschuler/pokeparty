import { useRef } from "react";
import { FixLevelDialog } from "./FixLevelDialog";

type LevelButtonProps = {
  stintId: string;
  step: number;
  level: number | null;
  label: string;
};

export function LevelButton({ stintId, step, level, label }: LevelButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={`Fix the level: ${label} ${level === null ? "no level" : `Lv ${level}`}`}
        className="border-ink shrink-0 rounded-full border-2 bg-white px-2.5 py-0.5 text-sm font-bold transition active:scale-95"
      >
        Lv {level ?? "?"}
      </button>
      <FixLevelDialog
        key={level}
        dialogRef={dialogRef}
        stintId={stintId}
        step={step}
        level={level}
        label={label}
      />
    </>
  );
}
