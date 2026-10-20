export const THEMES = ["poke", "great", "ultra", "master"] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "master";

export const THEME_LABELS: Record<Theme, string> = {
  master: "Master Ball",
  poke: "Poké Ball",
  great: "Great Ball",
  ultra: "Ultra Ball",
};

export const THEME_STORAGE_KEY = "pokeparty:theme";

function isTheme(value: string | null): value is Theme {
  return THEMES.some((theme) => theme === value);
}

export function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}
