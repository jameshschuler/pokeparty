import { describe, expect, it } from "vitest";
import { regionGeneration } from "./regions";

describe("regionGeneration", () => {
  it.each([
    ["kanto", 1],
    ["alola", 7],
    ["galar", 8],
    ["hisui", 8],
    ["paldea", 9],
  ] as const)("puts %s in generation %s", (region, generation) => {
    expect(regionGeneration(region)).toBe(generation);
  });
});
