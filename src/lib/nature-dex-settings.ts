import { DEFAULT_MOVE_RULES, type MoveRules } from "./nature-dex";

export type NatureDexSettings = MoveRules & { shiny: boolean };

export const DEFAULT_NATURE_DEX_SETTINGS: NatureDexSettings = {
  ...DEFAULT_MOVE_RULES,
  shiny: false,
};

export const NATURE_DEX_STORAGE_KEY = "pokeparty:nature-dex";

function parseSettings(value: unknown): NatureDexSettings {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_NATURE_DEX_SETTINGS;
  }
  const { learnset, split, shiny } = value as Record<string, unknown>;

  return {
    learnset:
      learnset === "hns" || learnset === "gen3"
        ? learnset
        : DEFAULT_NATURE_DEX_SETTINGS.learnset,
    split:
      typeof split === "boolean" ? split : DEFAULT_NATURE_DEX_SETTINGS.split,
    shiny:
      typeof shiny === "boolean" ? shiny : DEFAULT_NATURE_DEX_SETTINGS.shiny,
  };
}

export function loadNatureDexSettings(): NatureDexSettings {
  try {
    const raw = localStorage.getItem(NATURE_DEX_STORAGE_KEY);

    return raw ? parseSettings(JSON.parse(raw)) : DEFAULT_NATURE_DEX_SETTINGS;
  } catch {
    return DEFAULT_NATURE_DEX_SETTINGS;
  }
}

export function saveNatureDexSettings(settings: NatureDexSettings): void {
  try {
    localStorage.setItem(NATURE_DEX_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}
