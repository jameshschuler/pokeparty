import { describe, expect, it } from "vitest";
import {
  attackCategory,
  buildNatureDex,
  DEFAULT_MOVE_RULES,
  describeBestMoves,
  moveList,
  sharedRole,
  eggMoves,
  levelUpMoves,
  moveCategory,
  recommend,
  type DexEntry,
} from "./nature-dex";
import { HNS_MOVES, HNS_SPECIES_BY_NAME } from "./nature-dex-data";

const dex = buildNatureDex(DEFAULT_MOVE_RULES);

function entry(name: string): DexEntry {
  const found = dex.find((pokemon) => pokemon.name === name);

  if (!found) {
    throw new Error(`${name} isn't in the dex`);
  }

  return found;
}

function move(name: string) {
  const found = HNS_MOVES.find((candidate) => candidate.name === name);

  if (!found) {
    throw new Error(`${name} isn't a move`);
  }

  return found;
}

function species(name: string) {
  const found = HNS_SPECIES_BY_NAME.get(name);

  if (!found) {
    throw new Error(`${name} isn't a species`);
  }

  return found;
}

describe("buildNatureDex", () => {
  it("lists the 386 Pokémon from Kanto, Johto and Hoenn in dex order", () => {
    expect(dex).toHaveLength(386);
    expect(dex.map((pokemon) => pokemon.dexNumber)).toEqual(
      Array.from({ length: 386 }, (_, index) => index + 1),
    );
  });

  it.each([
    ["Bulbasaur", "kanto"],
    ["Mew", "kanto"],
    ["Chikorita", "johto"],
    ["Celebi", "johto"],
    ["Treecko", "hoenn"],
    ["Deoxys", "hoenn"],
  ])("puts %s in %s", (name, region) => {
    expect(entry(name).region).toBe(region);
  });

  it("drops the form suffix from Castform and Deoxys", () => {
    expect(dex.map((pokemon) => pokemon.name)).toEqual(
      expect.arrayContaining(["Castform", "Deoxys"]),
    );
  });

  it.each([
    ["Alakazam", "special", "Timid"],
    ["Machamp", "physical", "Adamant"],
    ["Nidoqueen", "mixed", "Naive"],
    ["Shuckle", "wall", "Impish"],
    ["Ditto", "utility", undefined],
  ])("ranks %s as %s with %s first", (name, role, firstNature) => {
    const [branch] = entry(name).branches;

    expect(branch.role).toBe(role);
    expect(branch.picks[0]?.nature).toBe(firstNature);
  });

  it.each(["Skarmory", "Blissey"])("uses the hand-set picks for %s", (name) => {
    const natures = entry(name).branches[0].picks.map((pick) => pick.nature);

    expect(natures).toEqual(
      name === "Skarmory"
        ? ["Impish", "Careful", "Relaxed", "Adamant"]
        : ["Bold", "Calm", "Modest"],
    );
  });

  it("explains Ditto instead of picking natures", () => {
    const [branch] = entry("Ditto").branches;

    expect(branch.picks).toEqual([]);
    expect(branch.note).toMatch(/Everstone/);
  });

  it("gives Eevee one branch per evolution", () => {
    expect(entry("Eevee").branches.map((branch) => branch.final.name)).toEqual([
      "Jolteon",
      "Vaporeon",
      "Flareon",
      "Sylveon",
      "Leafeon",
      "Glaceon",
      "Espeon",
      "Umbreon",
    ]);
  });

  it("follows a split evolution to each final form", () => {
    expect(
      entry("Wurmple").branches.map((branch) => branch.final.name),
    ).toEqual(["Beautifly", "Dustox"]);
  });

  it("gives a pre-evolution its final form's picks", () => {
    expect(entry("Abra").branches).toEqual(entry("Alakazam").branches);
    expect(entry("Chansey").branches[0].final.name).toBe("Blissey");
  });

  it("never picks more than five natures or the same one twice", () => {
    for (const pokemon of dex) {
      for (const branch of pokemon.branches) {
        const natures = branch.picks.map((pick) => pick.nature);

        expect(natures.length).toBeLessThanOrEqual(5);
        expect(new Set(natures).size).toBe(natures.length);
      }
    }
  });
});

describe("moveCategory", () => {
  it.each([
    ["Shadow Claw", true, "physical"],
    ["Shadow Claw", false, "special"],
    ["Dark Pulse", true, "special"],
    ["Dark Pulse", false, "physical"],
    ["Crunch", false, "physical"],
    ["Swords Dance", false, "status"],
  ])("puts %s (split %s) in %s", (name, split, category) => {
    expect(moveCategory(move(name), { learnset: "hns", split })).toBe(category);
  });

  it("turns Nidoqueen from mixed to physical when the split is off", () => {
    const nidoqueen = species("Nidoqueen");

    expect(recommend(nidoqueen, { learnset: "hns", split: true }).role).toBe(
      "mixed",
    );
    expect(recommend(nidoqueen, { learnset: "hns", split: false }).role).toBe(
      "physical",
    );
  });
});

describe("learnsets", () => {
  const venusaur = species("Venusaur");

  it("uses the Gen 3 lists when asked", () => {
    const gen3 = { learnset: "gen3", split: true } as const;

    expect(levelUpMoves(venusaur, gen3)).toBe(venusaur.levelUpGen3);
    expect(levelUpMoves(venusaur, DEFAULT_MOVE_RULES)).toBe(venusaur.levelUp);
    expect(eggMoves(venusaur, gen3)).toBe(
      venusaur.eggMovesGen3 ?? venusaur.eggMoves,
    );
  });

  it("falls back to the H&S lists when there's no Gen 3 list", () => {
    const deoxys = {
      ...species("Deoxys"),
      levelUpGen3: null,
      eggMovesGen3: null,
    };
    const gen3 = { learnset: "gen3", split: true } as const;

    expect(levelUpMoves(deoxys, gen3)).toBe(deoxys.levelUp);
    expect(eggMoves(deoxys, gen3)).toBe(deoxys.eggMoves);
  });

  it("changes the best moves with the learnset", () => {
    const hns = recommend(venusaur, DEFAULT_MOVE_RULES).best;
    const gen3 = recommend(venusaur, { learnset: "gen3", split: true }).best;

    expect([hns.physical?.move.name, hns.special?.move.name]).toEqual([
      "Petal Blizzard",
      "Petal Dance",
    ]);
    expect([gen3.physical?.move.name, gen3.special?.move.name]).toEqual([
      "Poison Jab",
      "Sludge Wave",
    ]);
  });

  it("skips unreliable moves like Hyper Beam when picking the best", () => {
    for (const pokemon of dex) {
      for (const { best } of pokemon.branches) {
        expect(best.physical?.move.name).not.toBe("Giga Impact");
        expect(best.special?.move.name).not.toBe("Hyper Beam");
      }
    }
  });
});

describe("attackCategory", () => {
  it.each([
    ["physical", "physical"],
    ["special", "special"],
    ["mixed", null],
    ["wall", null],
    ["utility", null],
  ] as const)("gives %s attackers %s", (role, category) => {
    expect(attackCategory(role)).toBe(category);
  });
});

describe("describeBestMoves", () => {
  it("lists both best moves", () => {
    expect(describeBestMoves(entry("Venusaur").branches[0].best)).toBe(
      "Best physical: Petal Blizzard · Best special: Petal Dance",
    );
  });

  it("is empty when there are none", () => {
    expect(describeBestMoves({ physical: null, special: null })).toBe("");
  });
});

describe("moveList", () => {
  const pikachu = species("Pikachu");

  it("labels level-up moves, with evolution moves as Evo", () => {
    const moves = moveList(species("Raichu"), "level", DEFAULT_MOVE_RULES);

    expect(moves[0].label).toBe("Evo");
    expect(moves.slice(1).every(({ label }) => /^Lv \d+$/.test(label))).toBe(
      true,
    );
  });

  it("sorts TMs by machine number", () => {
    const labels = moveList(pikachu, "tm", DEFAULT_MOVE_RULES).map(
      ({ label }) => label,
    );

    expect(labels).toEqual([...labels].sort());
    expect(labels[0]).toMatch(/^(HM|TM)\d{2}$/);
  });

  it("lists tutor and egg moves without labels", () => {
    for (const tab of ["tutor", "egg"] as const) {
      const moves = moveList(species("Pichu"), tab, DEFAULT_MOVE_RULES);

      expect(moves.length).toBeGreaterThan(0);
      expect(moves.every(({ label }) => label === "")).toBe(true);
    }
  });

  it("is empty for a Pokémon with no egg moves", () => {
    expect(moveList(species("Ditto"), "egg", DEFAULT_MOVE_RULES)).toEqual([]);
  });
});

describe("sharedRole", () => {
  it("returns the role every branch shares", () => {
    expect(sharedRole(entry("Tyrogue").branches)).toBe("physical");
  });

  it("returns null when branches disagree", () => {
    expect(sharedRole(entry("Eevee").branches)).toBeNull();
  });
});
