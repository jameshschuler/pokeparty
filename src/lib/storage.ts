export function loadStoredList<T>(
  key: string,
  parseItem: (value: unknown) => T | null,
): T[] {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.flatMap((entry) => parseItem(entry) ?? [])
      : [];
  } catch {
    return [];
  }
}
