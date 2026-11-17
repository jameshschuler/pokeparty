import type { PokemonType } from "../types/pokemon";
import {
  HNS_MOVES,
  HNS_SPECIES,
  HNS_SPECIES_BY_NAME,
  type HnsMove,
  type HnsSpecies,
  type LevelUpMove,
  type MoveCategory,
} from "./nature-dex-data";
import type { HnsRegion } from "./nature-dex-filters";
import type { Nature, Role, Stat } from "./natures";

export type Learnset = "hns" | "gen3";

export type MoveRules = { learnset: Learnset; split: boolean };

export const DEFAULT_MOVE_RULES: MoveRules = { learnset: "hns", split: true };

export const MOVE_CATEGORY_LABELS: Record<MoveCategory, string> = {
  physical: "Physical",
  special: "Special",
  status: "Status",
};

export type NaturePick = { nature: Nature; reason: string };

export type BestMove = { move: HnsMove; value: number };

export type BestMoves = {
  physical: BestMove | null;
  special: BestMove | null;
};

export type Branch = {
  final: HnsSpecies;
  role: Role;
  picks: NaturePick[];
  note: string | null;
  best: BestMoves;
};

export type DexEntry = HnsSpecies & { region: HnsRegion; branches: Branch[] };

type Attacker = "physical" | "special";

type ScaledStats = Record<Stat, number>;

const SPLIT_OFF_CATEGORIES: Record<PokemonType, Attacker> = {
  normal: "physical",
  fighting: "physical",
  flying: "physical",
  poison: "physical",
  ground: "physical",
  rock: "physical",
  bug: "physical",
  steel: "physical",
  dark: "physical",
  ghost: "special",
  fire: "special",
  water: "special",
  grass: "special",
  electric: "special",
  psychic: "special",
  ice: "special",
  dragon: "special",
  fairy: "special",
};

const UNRELIABLE_MOVES = new Set([
  "Explosion",
  "Self-Destruct",
  "Hyper Beam",
  "Giga Impact",
  "Blast Burn",
  "Hydro Cannon",
  "Frenzy Plant",
  "Rock Wrecker",
  "Focus Punch",
  "Dream Eater",
  "Last Resort",
  "Sky Attack",
  "Future Sight",
  "Doom Desire",
  "Fake Out",
  "Belch",
  "Steel Beam",
  "Mind Blown",
  "Synchronoise",
  "Solar Beam",
  "Solar Blade",
  "Skull Bash",
  "Razor Wind",
  "Sky Drop",
]);

const OVERRIDES: Record<
  string,
  { role: Role; picks: NaturePick[]; note?: string }
> = {
  Ditto: {
    role: "utility",
    note: "Nature doesn't matter in battle because Transform copies the target's stats. For breeding, a Ditto holding an Everstone always passes its nature, so catch one with a nature you want to breed.",
    picks: [],
  },
  Smeargle: {
    role: "utility",
    picks: [
      { nature: "Jolly", reason: "Fast Spore lead" },
      { nature: "Timid", reason: "Fast, special moves" },
      { nature: "Impish", reason: "Bulkier support" },
    ],
  },
  Shedinja: {
    role: "physical",
    picks: [
      { nature: "Adamant", reason: "Max damage" },
      { nature: "Jolly", reason: "Outspeed more threats" },
      { nature: "Brave", reason: "Slow, max power" },
    ],
  },
  Skarmory: {
    role: "wall",
    picks: [
      { nature: "Impish", reason: "Classic physical wall" },
      { nature: "Careful", reason: "Patch weaker SpD" },
      { nature: "Relaxed", reason: "Slow Def wall" },
      { nature: "Adamant", reason: "Offensive set" },
    ],
  },
  Wobbuffet: {
    role: "wall",
    picks: [
      { nature: "Bold", reason: "Survive physical hits" },
      { nature: "Calm", reason: "Survive special hits" },
      { nature: "Impish", reason: "Physical bulk" },
      { nature: "Careful", reason: "Special bulk" },
    ],
  },
  Blissey: {
    role: "wall",
    picks: [
      { nature: "Bold", reason: "Patch its tiny Def" },
      { nature: "Calm", reason: "Max special wall" },
      { nature: "Modest", reason: "Offensive special" },
    ],
  },
};

const MAX_PICKS = 5;

export const HNS_DEX_SIZE = 386;

export function moveCategory(move: HnsMove, rules: MoveRules): MoveCategory {
  if (move.category === "status" || rules.split) {
    return move.category;
  }

  return SPLIT_OFF_CATEGORIES[move.type];
}

export function levelUpMoves(
  species: HnsSpecies,
  rules: MoveRules,
): LevelUpMove[] {
  return rules.learnset === "gen3" && species.levelUpGen3
    ? species.levelUpGen3
    : species.levelUp;
}

export function eggMoves(species: HnsSpecies, rules: MoveRules): number[] {
  return rules.learnset === "gen3" && species.eggMovesGen3
    ? species.eggMovesGen3
    : species.eggMoves;
}

function finalForms(species: HnsSpecies, seen: Set<string>): HnsSpecies[] {
  seen.add(species.name);
  const next = species.evolutions
    .map(({ into }) => HNS_SPECIES_BY_NAME.get(into))
    .filter((form): form is HnsSpecies => !!form && !seen.has(form.name));

  if (next.length === 0) {
    return [species];
  }

  return [...new Set(next.flatMap((form) => finalForms(form, seen)))];
}

export function bestMoves(species: HnsSpecies, rules: MoveRules): BestMoves {
  const moveIds = new Set([
    ...levelUpMoves(species, rules).map(({ moveId }) => moveId),
    ...species.tmMoves,
    ...species.tutorMoves,
    ...eggMoves(species, rules),
  ]);
  const best: BestMoves = { physical: null, special: null };

  for (const moveId of moveIds) {
    const move = HNS_MOVES[moveId];
    const category = moveCategory(move, rules);

    if (
      category === "status" ||
      move.power < 40 ||
      UNRELIABLE_MOVES.has(move.name)
    ) {
      continue;
    }
    const accuracy = parseInt(move.accuracy, 10);
    const stab = species.types.includes(move.type) ? 1.5 : 1;
    const value = move.power * stab * (accuracy > 0 ? accuracy / 100 : 1);
    const current = best[category];

    if (!current || value > current.value) {
      best[category] = { move, value };
    }
  }

  return best;
}

export function describeBestMoves(best: BestMoves): string {
  return [
    best.physical && `Best physical: ${best.physical.move.name}`,
    best.special && `Best special: ${best.special.move.name}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function classify(stats: ScaledStats): Role {
  const offense = Math.max(stats.atk, stats.spa);
  const defense = (stats.def + stats.spd) / 2;

  if (
    (defense >= offense + 25 && offense < 95) ||
    (stats.hp >= 150 && offense < 90)
  ) {
    return "wall";
  }
  // Mixed natures lower a defense, so bulky Pokémon stay on their stronger side.
  const bulky = stats.def >= 100 || stats.spd >= 100;

  if (
    !bulky &&
    Math.abs(stats.atk - stats.spa) < 20 &&
    Math.min(stats.atk, stats.spa) >= 70
  ) {
    return "mixed";
  }

  return stats.atk >= stats.spa ? "physical" : "special";
}

function attackerPicks(
  stats: ScaledStats,
  attacker: Attacker,
  add: (nature: Nature, reason: string) => void,
): void {
  const physical = attacker === "physical";
  const power = physical ? "Adamant" : "Modest";
  const speed = physical ? "Jolly" : "Timid";
  const slowPower = physical ? "Brave" : "Quiet";
  const defNature = physical ? "Impish" : "Bold";
  const spdNature = physical ? "Careful" : "Calm";
  const weakerDef = stats.def <= stats.spd;
  const slow = stats.spe <= 50;

  if (stats.spe >= 85) {
    add(speed, "Fast sweeper");
    add(power, "Max damage");
  } else if (slow) {
    add(power, "Max damage");
    add(slowPower, "Too slow to need Spe");
  } else {
    add(power, "Max damage");
    add(speed, "Win speed ties");
  }

  if (stats.hp >= 100 || stats.def >= 100 || stats.spd >= 100) {
    const bulk: [Nature, string][] = [
      [defNature, "Bulkier, physical"],
      [spdNature, "Bulkier, special"],
    ];
    for (const [nature, reason] of weakerDef ? bulk : bulk.reverse()) {
      add(nature, reason);
    }

    return;
  }

  if (!slow) {
    add(weakerDef ? "Hasty" : "Naive", "Fast, mixed moves");
  }
  const mixed = physical
    ? weakerDef
      ? "Lonely"
      : "Naughty"
    : weakerDef
      ? "Mild"
      : "Rash";
  add(mixed, "Strong, mixed moves");
}

function mixedPicks(
  stats: ScaledStats,
  add: (nature: Nature, reason: string) => void,
): void {
  const atkLead = stats.atk >= stats.spa;
  const dropDef = stats.def < stats.spd;
  const atkLeaning: NaturePick = {
    nature: dropDef ? "Lonely" : "Naughty",
    reason: "Mixed, Atk-leaning",
  };
  const spaLeaning: NaturePick = {
    nature: dropDef ? "Mild" : "Rash",
    reason: "Mixed, SpA-leaning",
  };

  if (stats.spe >= 70) {
    add(dropDef ? "Hasty" : "Naive", "Fast mixed attacker");
  }
  for (const pick of atkLead
    ? [atkLeaning, spaLeaning]
    : [spaLeaning, atkLeaning]) {
    add(pick.nature, pick.reason);
  }
  add(
    atkLead ? "Adamant" : "Modest",
    atkLead ? "Pure physical" : "Pure special",
  );
  add(
    atkLead ? "Modest" : "Adamant",
    atkLead ? "Pure special" : "Pure physical",
  );
}

function wallPicks(
  stats: ScaledStats,
  add: (nature: Nature, reason: string) => void,
): void {
  const physical = stats.atk >= stats.spa;
  const defNature = physical ? "Impish" : "Bold";
  const spdNature = physical ? "Careful" : "Calm";
  const weakerDef = stats.def <= stats.spd;

  if (weakerDef) {
    add(defNature, "Patch weaker Def");
    add(spdNature, "Special wall");
  } else {
    add(spdNature, "Patch weaker SpD");
    add(defNature, "Physical wall");
  }

  if (stats.spe <= 50) {
    add(weakerDef ? "Relaxed" : "Sassy", "Slow anyway, max bulk");
  }
  add(physical ? "Adamant" : "Modest", "Hit harder");
}

function pickNatures(stats: ScaledStats, role: Role): NaturePick[] {
  const picks: NaturePick[] = [];

  function add(nature: Nature, reason: string): void {
    if (!picks.some((pick) => pick.nature === nature)) {
      picks.push({ nature, reason });
    }
  }

  if (role === "physical" || role === "special") {
    attackerPicks(stats, role, add);
  } else if (role === "mixed") {
    mixedPicks(stats, add);
  } else {
    wallPicks(stats, add);
  }

  return picks.slice(0, MAX_PICKS);
}

// 135 is a 90-power STAB move: anything that strong keeps the stat at full weight.
function moveScale(best: BestMove | null): number {
  return best ? Math.min(1, best.value / 135) : 0.45;
}

export function recommend(final: HnsSpecies, rules: MoveRules): Branch {
  const best = bestMoves(final, rules);
  const override = OVERRIDES[final.name];

  if (override) {
    return {
      final,
      best,
      role: override.role,
      picks: override.picks,
      note: override.note ?? null,
    };
  }
  const [hp, atk, def, spa, spd, spe] = final.baseStats;
  const stats: ScaledStats = {
    hp,
    def,
    spd,
    spe,
    atk: atk * moveScale(best.physical),
    spa: spa * moveScale(best.special),
  };
  const role = classify(stats);

  return { final, best, role, picks: pickNatures(stats, role), note: null };
}

export function sharedRole(branches: Branch[]): Role | null {
  const [first, ...rest] = branches;

  return rest.every((branch) => branch.role === first.role) ? first.role : null;
}

export function attackCategory(role: Role): Attacker | null {
  return role === "physical" || role === "special" ? role : null;
}

export const MOVE_TABS = ["level", "tm", "tutor", "egg", "where"] as const;

export type MoveTab = (typeof MOVE_TABS)[number];

export type MoveListTab = Exclude<MoveTab, "where">;

export type MoveListItem = { label: string; moveId: number };

export function moveList(
  species: HnsSpecies,
  tab: MoveListTab,
  rules: MoveRules,
): MoveListItem[] {
  if (tab === "level") {
    return levelUpMoves(species, rules).map(({ level, moveId }) => ({
      label: level === 0 ? "Evo" : `Lv ${level}`,
      moveId,
    }));
  }

  if (tab === "tm") {
    return species.tmMoves
      .map((moveId) => ({ label: HNS_MOVES[moveId].machine, moveId }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  const moveIds =
    tab === "tutor" ? species.tutorMoves : eggMoves(species, rules);

  return moveIds.map((moveId) => ({ label: "", moveId }));
}

function regionOf(dexNumber: number): HnsRegion {
  if (dexNumber <= 151) {
    return "kanto";
  }

  return dexNumber <= 251 ? "johto" : "hoenn";
}

export function buildNatureDex(rules: MoveRules): DexEntry[] {
  const branches = new Map<string, Branch>();

  function branchFor(final: HnsSpecies): Branch {
    const cached = branches.get(final.name);

    if (cached) {
      return cached;
    }
    const branch = recommend(final, rules);
    branches.set(final.name, branch);

    return branch;
  }

  return HNS_SPECIES.filter(
    ({ dexNumber }) => dexNumber >= 1 && dexNumber <= HNS_DEX_SIZE,
  ).map((species) => ({
    ...species,
    region: regionOf(species.dexNumber),
    branches: finalForms(species, new Set()).map(branchFor),
  }));
}
