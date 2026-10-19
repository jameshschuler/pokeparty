import { describe, expect, it } from "vitest";
import { idFromUrl } from "./resource-id";

describe("idFromUrl", () => {
  it.each([
    ["https://pokeapi.co/api/v2/pokemon-species/25/", 25],
    ["https://pokeapi.co/api/v2/pokemon/10034", 10034],
  ])("%s -> %s", (url, expected) => {
    expect(idFromUrl(url)).toBe(expected);
  });

  it("throws when there is no id", () => {
    expect(() => idFromUrl("https://pokeapi.co/api/v2/pokemon/")).toThrow();
  });
});
