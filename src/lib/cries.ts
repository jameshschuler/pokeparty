const CRY_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest";

export const CRY_TYPE = 'audio/ogg; codecs="vorbis"';

export const CRY_VOLUME = 0.4;

export const MUTED_STORAGE_KEY = "pokeparty:muted";

export function cryUrl(speciesId: number): string {
  return `${CRY_BASE_URL}/${speciesId}.ogg`;
}

export function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTED_STORAGE_KEY, String(muted));
  } catch {
    return;
  }
}
