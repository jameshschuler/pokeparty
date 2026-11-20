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

const REGION_GENERATIONS: Record<Region, number> = {
  kanto: 1,
  johto: 2,
  hoenn: 3,
  sinnoh: 4,
  unova: 5,
  kalos: 6,
  alola: 7,
  galar: 8,
  hisui: 8,
  paldea: 9,
};

export function regionGeneration(region: Region): number {
  return REGION_GENERATIONS[region];
}

const CONFUSABLE_REGIONS: Partial<Record<Region, Region>> = {
  sinnoh: "hisui",
  hisui: "sinnoh",
};

export function confusableRegion(region: Region): Region | undefined {
  return CONFUSABLE_REGIONS[region];
}
