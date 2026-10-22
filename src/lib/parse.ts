export function parseCount(value: unknown, max: number): number | null {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const count = value === "" ? NaN : Number(value);

  return Number.isInteger(count) && count >= 0 && count <= max ? count : null;
}
