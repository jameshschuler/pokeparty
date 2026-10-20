import { describe, expect, it } from "vitest";
import {
  debutRegion,
  formDisplayName,
  isExcludedForm,
} from "./pokedex-rules.ts";

describe("debutRegion", () => {
  it.each([
    ["red-blue", "generation-i", "kanto"],
    ["platinum", "generation-iv", "sinnoh"],
    ["sword-shield", "generation-viii", "galar"],
    ["the-crown-tundra", "generation-viii", "galar"],
    ["legends-arceus", "generation-viii", "hisui"],
    ["the-teal-mask", "generation-ix", "paldea"],
    ["legends-za", "generation-ix", "kalos"],
    ["lets-go-pikachu-lets-go-eevee", "generation-vii", "kanto"],
  ])("%s (%s) -> %s", (versionGroup, generation, region) => {
    expect(debutRegion(versionGroup, generation)).toBe(region);
  });

  it("throws for an unknown generation", () => {
    expect(() => debutRegion("future-game", "generation-x")).toThrow(
      "future-game",
    );
  });
});

describe("isExcludedForm", () => {
  const plain = { isBattleOnly: false, isMega: false };

  it.each([
    "giratina-origin",
    "rotom-heat",
    "darumaka-galar",
    "meowstic-female",
    "zygarde-10",
    "ursaluna-bloodmoon",
  ])("keeps %s", (name) => {
    expect(isExcludedForm(name, plain)).toBe(false);
  });

  it.each([
    "pikachu-alola-cap",
    "pikachu-cosplay",
    "eevee-starter",
    "raticate-totem-alola",
    "charizard-gmax",
    "minior-red",
    "koraidon-limited-build",
    "zygarde-50-power-construct",
    "eternatus-eternamax",
  ])("drops %s", (name) => {
    expect(isExcludedForm(name, plain)).toBe(true);
  });

  it.each([
    [{ isBattleOnly: true, isMega: false }],
    [{ isBattleOnly: false, isMega: true }],
  ])("drops battle-only and mega forms %o", (flags) => {
    expect(isExcludedForm("darmanitan-galar-zen", flags)).toBe(true);
  });
});

describe("formDisplayName", () => {
  it.each([
    ["Darumaka", "Galarian Form", "Galarian Darumaka", null],
    ["Mr. Mime", "Galarian Form", "Galarian Mr. Mime", null],
    ["Tauros", "Paldean Form (Aqua Breed)", "Paldean Tauros", "Aqua Breed"],
    ["Giratina", "Origin Forme", "Giratina", "Origin Forme"],
    ["Meowstic", "Female", "Meowstic", "Female"],
    ["Rotom", "Heat Rotom", "Heat Rotom", null],
    ["Kyurem", "Black Kyurem", "Black Kyurem", null],
    ["Hoopa", "Hoopa Unbound", "Hoopa Unbound", null],
  ])("%s + %s -> %s / %s", (species, form, displayName, variant) => {
    expect(formDisplayName(species, form)).toMatchObject({
      displayName,
      variant,
    });
  });
});

describe("formDisplayName regional flag", () => {
  it.each([
    ["Ponyta", "Galarian Form", true],
    ["Tauros", "Paldean Form (Aqua Breed)", true],
    ["Dialga", "Origin Forme", false],
    ["Basculin", "White-Striped Form", false],
    ["Rotom", "Heat Rotom", false],
  ])("%s + %s -> %s", (species, form, regional) => {
    expect(formDisplayName(species, form).regional).toBe(regional);
  });
});
