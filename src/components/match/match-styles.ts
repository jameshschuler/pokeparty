import type { MatchLevel } from "../../lib/match";

export const MATCH_BOARD_COLUMNS: Record<MatchLevel, string> = {
  easy: "grid-cols-3",
  medium: "grid-cols-4",
  hard: "grid-cols-4",
};

export function matchFaceStyle(matched: boolean, missed: boolean): string {
  if (matched) {
    return "bg-correct/15";
  }

  return missed ? "bg-wrong/15" : "bg-white";
}
