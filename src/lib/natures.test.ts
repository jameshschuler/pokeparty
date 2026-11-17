import { describe, expect, it } from "vitest";
import { natureFor, PICKABLE_NATURES } from "./natures";

describe("natureFor", () => {
  it.each([
    ["atk", "spa", "Adamant"],
    ["spe", "atk", "Timid"],
    ["spd", "def", "Gentle"],
    ["def", "def", "Docile"],
  ] as const)("finds +%s −%s as %s", (up, down, nature) => {
    expect(natureFor(up, down)).toBe(nature);
  });

  it("throws for a stat no nature changes", () => {
    expect(() => natureFor("hp", "atk")).toThrow();
  });
});

describe("PICKABLE_NATURES", () => {
  it("lists the 20 natures that change a stat, in alphabetical order", () => {
    expect(PICKABLE_NATURES).toHaveLength(20);
    expect(PICKABLE_NATURES[0]).toBe("Adamant");
    expect(PICKABLE_NATURES).not.toContain("Hardy");
  });
});
