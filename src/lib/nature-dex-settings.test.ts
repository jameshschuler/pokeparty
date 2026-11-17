import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_NATURE_DEX_SETTINGS,
  loadNatureDexSettings,
  NATURE_DEX_STORAGE_KEY,
  saveNatureDexSettings,
} from "./nature-dex-settings";

describe("nature dex settings", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to H&S learnsets, the split on and normal sprites", () => {
    expect(loadNatureDexSettings()).toEqual({
      learnset: "hns",
      split: true,
      shiny: false,
    });
  });

  it("round-trips saved settings", () => {
    const settings = { learnset: "gen3", split: false, shiny: true } as const;
    saveNatureDexSettings(settings);

    expect(loadNatureDexSettings()).toEqual(settings);
  });

  it("replaces only the values that are stale or wrong", () => {
    localStorage.setItem(
      NATURE_DEX_STORAGE_KEY,
      JSON.stringify({ learnset: "gen9", split: "off", shiny: true }),
    );

    expect(loadNatureDexSettings()).toEqual({
      ...DEFAULT_NATURE_DEX_SETTINGS,
      shiny: true,
    });
  });

  it.each(["not json", "null", "[]", '"hns"'])(
    "falls back to the defaults for %s",
    (raw) => {
      localStorage.setItem(NATURE_DEX_STORAGE_KEY, raw);

      expect(loadNatureDexSettings()).toEqual(DEFAULT_NATURE_DEX_SETTINGS);
    },
  );

  it("falls back to the defaults when storage can't be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    expect(loadNatureDexSettings()).toEqual(DEFAULT_NATURE_DEX_SETTINGS);
  });

  it("doesn't throw when storage can't be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(() =>
      saveNatureDexSettings(DEFAULT_NATURE_DEX_SETTINGS),
    ).not.toThrow();
  });
});
