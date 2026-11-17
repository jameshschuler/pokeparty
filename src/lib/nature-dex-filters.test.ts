import { describe, expect, it } from "vitest";
import { buildNatureDex, DEFAULT_MOVE_RULES } from "./nature-dex";
import { filterNatureDex, parseNatureDexSearch } from "./nature-dex-filters";

const dex = buildNatureDex(DEFAULT_MOVE_RULES);

function names(filters: Parameters<typeof filterNatureDex>[1]): string[] {
  return filterNatureDex(dex, filters).map((pokemon) => pokemon.name);
}

describe("parseNatureDexSearch", () => {
  it("keeps valid filters", () => {
    expect(
      parseNatureDexSearch({
        q: "  pika ",
        region: "johto",
        role: "wall",
        nature: "Adamant",
      }),
    ).toEqual({
      q: "  pika ",
      region: "johto",
      role: "wall",
      nature: "Adamant",
    });
  });

  it.each([
    ["an empty search", { q: "" }],
    ["a region outside Gen 1–3", { region: "sinnoh" }],
    ["an unknown role", { role: "tank" }],
    ["an unknown nature", { nature: "Grumpy" }],
    ["a nature in the wrong case", { nature: "adamant" }],
    ["a neutral nature no Pokémon is picked for", { nature: "Hardy" }],
    ["an inherited key", { nature: "toString" }],
  ])("drops %s", (_, search) => {
    expect(parseNatureDexSearch(search)).toEqual({
      q: undefined,
      region: undefined,
      role: undefined,
      nature: undefined,
    });
  });

  it("reads a dex number typed into the URL as a search", () => {
    expect(parseNatureDexSearch({ q: 25 }).q).toBe("25");
  });
});

describe("filterNatureDex", () => {
  it("returns everything with no filters", () => {
    expect(filterNatureDex(dex, {})).toHaveLength(386);
  });

  it("searches names without caring about case", () => {
    expect(names({ q: "CHU" })).toEqual([
      "Pikachu",
      "Raichu",
      "Pichu",
      "Smoochum",
    ]);
  });

  it("ignores spaces around the search", () => {
    expect(names({ q: "  mr. mime " })).toEqual(["Mr. Mime"]);
  });

  it("returns everything for a search of only spaces", () => {
    expect(filterNatureDex(dex, { q: "   " })).toHaveLength(386);
  });

  it.each(["25", "#25", "025", "#025"])("finds Pikachu by %s", (q) => {
    expect(names({ q })).toContain("Pikachu");
  });

  it("doesn't match every Pokémon on a search of zeros", () => {
    expect(names({ q: "#000" })).toEqual([]);
  });

  it("filters by region", () => {
    const hoenn = filterNatureDex(dex, { region: "hoenn" });

    expect(hoenn).toHaveLength(135);
    expect(hoenn[0].name).toBe("Treecko");
  });

  it("filters by any branch's role", () => {
    expect(names({ role: "wall", q: "eevee" })).toEqual(["Eevee"]);
    expect(names({ role: "utility" })).toEqual(["Ditto", "Smeargle"]);
  });

  it("filters by any branch's picks", () => {
    const pokemon = filterNatureDex(dex, { nature: "Relaxed" });

    expect(pokemon.length).toBeGreaterThan(0);
    for (const { branches } of pokemon) {
      expect(
        branches.some((branch) =>
          branch.picks.some((pick) => pick.nature === "Relaxed"),
        ),
      ).toBe(true);
    }
  });

  it("combines filters", () => {
    expect(names({ region: "kanto", role: "utility" })).toEqual(["Ditto"]);
  });

  it("returns nothing when no Pokémon match", () => {
    expect(names({ q: "agumon" })).toEqual([]);
  });
});
