import type { Region } from "../types/pokemon";

export const REGION_LABELS: Record<Region, string> = {
  kanto: "Kanto",
  johto: "Johto",
  hoenn: "Hoenn",
  sinnoh: "Sinnoh",
  unova: "Unova",
  kalos: "Kalos",
  alola: "Alola",
  galar: "Galar",
  hisui: "Hisui",
  paldea: "Paldea",
};

const CONFUSABLE_REGIONS: Partial<Record<Region, Region>> = {
  sinnoh: "hisui",
  hisui: "sinnoh",
};

export function confusableRegion(region: Region): Region | undefined {
  return CONFUSABLE_REGIONS[region];
}
