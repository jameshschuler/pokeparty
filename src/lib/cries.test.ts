import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cryUrl, loadMuted, saveMuted } from "./cries";

describe("cryUrl", () => {
  it("points at the PokeAPI cry for the species", () => {
    expect(cryUrl(25)).toBe(
      "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg",
    );
  });
});

describe("muted setting", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts unmuted and remembers a change", () => {
    expect(loadMuted()).toBe(false);

    saveMuted(true);

    expect(loadMuted()).toBe(true);
  });

  it("stays unmuted when storage can't be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    expect(loadMuted()).toBe(false);
  });

  it("ignores storage that can't be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(() => saveMuted(true)).not.toThrow();
  });
});
