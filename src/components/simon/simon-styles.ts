import type { SimonLevel, SimonPhase } from "../../lib/simon";

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
    return "bg-accent outline-ink outline-4 outline-offset-2 motion-safe:scale-105";
  }

  return "bg-white";
}

export const SIMON_BANNER_STYLES: Record<SimonPhase, string> = {
  loading: "bg-white",
  ready: "bg-accent",
  watch: "bg-white",
  repeat: "bg-primary text-white",
  over: "bg-wrong text-white",
};

export const SIMON_BOARD_COLUMNS: Record<SimonLevel, string> = {
  easy: "grid-cols-2",
  medium: "grid-cols-3",
  hard: "grid-cols-3",
};
