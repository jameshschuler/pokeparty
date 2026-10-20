import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadStoredList } from "./storage";

const KEY = "test:list";

function parseNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

describe("loadStoredList", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an empty list when nothing is stored", () => {
    expect(loadStoredList(KEY, parseNumber)).toEqual([]);
  });

  it("keeps the items that parse and drops the rest", () => {
    localStorage.setItem(KEY, JSON.stringify([1, "two", 3, null]));

    expect(loadStoredList(KEY, parseNumber)).toEqual([1, 3]);
  });

  it.each([
    ["invalid JSON", "{nope"],
    ["a non-array", JSON.stringify({ items: [1] })],
    ["null", "null"],
  ])("returns an empty list for %s", (_, raw) => {
    localStorage.setItem(KEY, raw);

    expect(loadStoredList(KEY, parseNumber)).toEqual([]);
  });

  it("returns an empty list when storage can't be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    expect(loadStoredList(KEY, parseNumber)).toEqual([]);
  });
});
