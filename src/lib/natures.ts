export type Stat = "hp" | "atk" | "def" | "spa" | "spd" | "spe";

export const ROLES = [
  "physical",
  "special",
  "mixed",
  "wall",
  "utility",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  physical: "Physical",
  special: "Special",
  mixed: "Mixed",
  wall: "Wall",
  utility: "Utility",
};

export const STAT_LABELS: Record<Stat, string> = {
  hp: "HP",
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe",
};

export const NATURES = {
  Hardy: ["atk", "atk"],
  Lonely: ["atk", "def"],
  Brave: ["atk", "spe"],
  Adamant: ["atk", "spa"],
  Naughty: ["atk", "spd"],
  Bold: ["def", "atk"],
  Docile: ["def", "def"],
  Relaxed: ["def", "spe"],
  Impish: ["def", "spa"],
  Lax: ["def", "spd"],
  Timid: ["spe", "atk"],
  Hasty: ["spe", "def"],
  Serious: ["spe", "spe"],
  Jolly: ["spe", "spa"],
  Naive: ["spe", "spd"],
  Modest: ["spa", "atk"],
  Mild: ["spa", "def"],
  Quiet: ["spa", "spe"],
  Bashful: ["spa", "spa"],
  Rash: ["spa", "spd"],
  Calm: ["spd", "atk"],
  Gentle: ["spd", "def"],
  Sassy: ["spd", "spe"],
  Careful: ["spd", "spa"],
  Quirky: ["spd", "spd"],
} as const satisfies Record<string, readonly [Stat, Stat]>;

export type Nature = keyof typeof NATURES;

export const PICKABLE_NATURES = (Object.keys(NATURES) as Nature[])
  .filter((nature) => NATURES[nature][0] !== NATURES[nature][1])
  .sort();

export function natureFor(up: Stat, down: Stat): Nature {
  const found = (Object.keys(NATURES) as Nature[]).find(
    (nature) => NATURES[nature][0] === up && NATURES[nature][1] === down,
  );

  if (!found) {
    throw new Error(`No nature raises ${up} and lowers ${down}`);
  }

  return found;
}
