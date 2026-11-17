import hnsData from "../data/hns.json";
import type { PokemonType } from "../types/pokemon";

export type MoveCategory = "physical" | "special" | "status";

export type HnsMove = {
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number;
  accuracy: string;
  machine: string;
};

export type LevelUpMove = { level: number; moveId: number };

export type CatchLocation = { place: string; details: string[] };

export type HnsSpecies = {
  name: string;
  dexNumber: number;
  types: PokemonType[];
  baseStats: [
    hp: number,
    atk: number,
    def: number,
    spa: number,
    spd: number,
    spe: number,
  ];
  abilities: string[];
  hiddenAbilities: string[];
  evolutions: { into: string; how: string }[];
  levelUp: LevelUpMove[];
  levelUpGen3: LevelUpMove[] | null;
  tmMoves: number[];
  tutorMoves: number[];
  eggMoves: number[];
  eggMovesGen3: number[] | null;
  locations: CatchLocation[];
};

type RawPlace = string[];

type RawSpecies = {
  name: string;
  num: number;
  types: string[];
  s: number[];
  ab: string[];
  ha: string[];
  evos: string[][];
  lv: number[][];
  lv3?: number[][];
  tm: number[];
  tutor: number[];
  egg: number[];
  egg3?: number[];
  wild: RawPlace[];
  gifts: RawPlace[];
};

type RawData = {
  species: RawSpecies[];
  moves: (string | number)[][];
};

const RAW_CATEGORIES: Record<string, MoveCategory> = {
  P: "physical",
  S: "special",
  X: "status",
};

const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald";

function toType(name: string): PokemonType {
  return name.toLowerCase() as PokemonType;
}

function toLevelUp(moves: number[][]): LevelUpMove[] {
  return moves.map(([level, moveId]) => ({ level, moveId }));
}

function toLocation([place, ...details]: RawPlace): CatchLocation {
  return { place, details };
}

function toSpecies(raw: RawSpecies): HnsSpecies {
  return {
    name: raw.name.replace(/ Normal$/, ""),
    dexNumber: raw.num,
    types: raw.types.map(toType),
    baseStats: raw.s as HnsSpecies["baseStats"],
    abilities: raw.ab,
    hiddenAbilities: raw.ha,
    evolutions: raw.evos.map(([into, how]) => ({
      into: into.replace(/ Normal$/, ""),
      how,
    })),
    levelUp: toLevelUp(raw.lv),
    levelUpGen3: raw.lv3 ? toLevelUp(raw.lv3) : null,
    tmMoves: raw.tm,
    tutorMoves: raw.tutor,
    eggMoves: raw.egg,
    eggMovesGen3: raw.egg3 ?? null,
    locations: [...raw.wild, ...raw.gifts].map(toLocation),
  };
}

function toMove([name, type, category, power, accuracy, machine]: (
  string | number
)[]): HnsMove {
  return {
    name: String(name),
    type: toType(String(type)),
    category: RAW_CATEGORIES[String(category)],
    power: Number(power),
    accuracy: String(accuracy),
    machine: String(machine),
  };
}

const data = hnsData as RawData;

export const HNS_SPECIES: HnsSpecies[] = data.species.map(toSpecies);

export const HNS_MOVES: HnsMove[] = data.moves.map(toMove);

export const HNS_SPECIES_BY_NAME = new Map(
  HNS_SPECIES.map((species) => [species.name, species]),
);

export function hnsSpriteUrl(dexNumber: number, shiny: boolean): string {
  return `${SPRITE_BASE_URL}${shiny ? "/shiny" : ""}/${dexNumber}.png`;
}
