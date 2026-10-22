import type { SimonLevel } from "../../lib/simon";

type PadState = {
  lit: boolean;
  expected: boolean;
  missed: boolean;
};

export function simonPadStyle({ lit, expected, missed }: PadState): string {
  if (missed) {
    return "bg-wrong text-white";
  }

  if (expected) {
    return "bg-correct text-white";
  }

  if (lit) {
    return "bg-accent shadow-sticker outline-ink outline-4 outline-offset-2 motion-safe:scale-105";
  }

  return "bg-white shadow-sticker-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";
}

export const SIMON_BOARD_COLUMNS: Record<SimonLevel, string> = {
  easy: "grid-cols-2",
  medium: "grid-cols-3",
  hard: "grid-cols-3",
};
