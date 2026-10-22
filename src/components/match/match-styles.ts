import type { MatchLevel, MatchStatus } from "../../lib/match";

export const MATCH_STATUS_TONES: Record<MatchStatus["tone"], string> = {
  neutral: "text-ink/70",
  good: "text-correct",
  bad: "text-wrong",
};

export const MATCH_BOARD_COLUMNS: Record<MatchLevel, string> = {
  easy: "grid-cols-3",
  medium: "grid-cols-4",
  hard: "grid-cols-4",
  silhouette: "grid-cols-4",
  evolution: "grid-cols-4",
};

export function matchFaceStyle(matched: boolean, missed: boolean): string {
  if (matched) {
    return "bg-[color-mix(in_oklab,var(--color-correct)_25%,white)]";
  }

  return missed
    ? "bg-[color-mix(in_oklab,var(--color-wrong)_15%,white)]"
    : "bg-white";
}
