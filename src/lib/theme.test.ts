import { afterEach, describe, expect, it, vi } from "vitest";
import indexHtml from "../../index.html?raw";
import { loadTheme, saveTheme, THEME_STORAGE_KEY } from "./theme";

describe("theme storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to the Master Ball theme", () => {
    expect(loadTheme()).toBe("master");
  });

  it.each(["poke", "great", "ultra", "master"] as const)(
    "round-trips %s",
    (theme) => {
      saveTheme(theme);

      expect(loadTheme()).toBe(theme);
    },
  );

  it("ignores an unknown stored value", () => {
    localStorage.setItem("pokeparty:theme", "dusk");

    expect(loadTheme()).toBe("master");
  });

  it("falls back to the default when storage can't be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    expect(loadTheme()).toBe("master");
  });

  it("doesn't throw when storage can't be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(() => saveTheme("ultra")).not.toThrow();
  });
});

describe("index.html", () => {
  it("applies the saved theme before the app loads, using the same key", () => {
    expect(indexHtml).toContain(`localStorage.getItem("${THEME_STORAGE_KEY}")`);
  });
});
