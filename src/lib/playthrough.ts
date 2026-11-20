import type { Playthrough, StintUpdate, TeamStint } from "../types/playthrough";
import { findGame, type GameId } from "./games";
import { findPokemon } from "./pokedex";
import { formatPokemonLabel } from "./pokemon";
import { TEAM_SIZE } from "./team";

export const MIN_LEVEL = 1;

export const MAX_LEVEL = 100;

export type NewMember = {
  pokemonId: number;
  shiny: boolean;
  nickname: string;
  level: number | null;
};

export type StintError =
  | "team-full"
  | "invalid-level"
  | "level-dropped"
  | "no-change"
  | "not-on-team"
  | "not-found";

export type StintResult =
  { ok: true; stints: TeamStint[] } | { ok: false; error: StintError };

export const STINT_ERROR_MESSAGES: Record<StintError, string> = {
  "team-full": "Your team is full. Swap someone out first.",
  "invalid-level": `Levels go from ${MIN_LEVEL} to ${MAX_LEVEL}.`,
  "level-dropped": "A Pokémon's level can't drop below an earlier level.",
  "no-change": "Change the level or pick an evolution.",
  "not-on-team": "That Pokémon isn't on your team anymore.",
  "not-found": "That step isn't on the timeline anymore.",
};

export type StintChange = {
  stint: TeamStint;
  update: StintUpdate;
  from: number;
};

export type TimelineStep = {
  step: number;
  left: TeamStint[];
  changed: StintChange[];
  joined: TeamStint[];
};

export function isValidLevel(level: number): boolean {
  return Number.isInteger(level) && level >= MIN_LEVEL && level <= MAX_LEVEL;
}

function isValidJoinLevel(level: number | null): boolean {
  return level === null || isValidLevel(level);
}

export function parseLevel(text: string): number | null {
  return text.trim() === "" ? null : Number(text);
}

function cleanName(name: string): string | null {
  return name.trim() || null;
}

export function createPlaythrough(
  gameId: GameId,
  name: string,
  now: number,
): Playthrough {
  return {
    id: crypto.randomUUID(),
    gameId,
    name: cleanName(name),
    stints: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function currentTeam(stints: TeamStint[]): TeamStint[] {
  return stints.filter((stint) => stint.leftStep === null);
}

export function lastStep(stints: TeamStint[]): number {
  return Math.max(
    0,
    ...stints.flatMap((stint) => [
      stint.joinedStep,
      stint.leftStep ?? 0,
      ...stint.updates.map((update) => update.step),
    ]),
  );
}

export function pokemonIdAt(stint: TeamStint, step: number): number {
  return (
    stint.updates.findLast((update) => update.step <= step)?.pokemonId ??
    stint.pokemonId
  );
}

export function currentPokemonId(stint: TeamStint): number {
  return stint.updates.at(-1)?.pokemonId ?? stint.pokemonId;
}

export function currentLevel(stint: TeamStint): number | null {
  return stint.leftLevel ?? stint.updates.at(-1)?.level ?? stint.joinedLevel;
}

export function levelsNeverDrop(stint: TeamStint): boolean {
  const levels = [
    stint.joinedLevel,
    ...stint.updates.map((update) => update.level),
    stint.leftLevel,
  ].filter((level) => level !== null);

  return levels.every(
    (level, index) => index === 0 || level >= levels[index - 1],
  );
}

function newStint(member: NewMember, step: number): TeamStint {
  return {
    id: crypto.randomUUID(),
    pokemonId: member.pokemonId,
    shiny: member.shiny,
    nickname: cleanName(member.nickname),
    joinedLevel: member.level,
    joinedStep: step,
    updates: [],
    leftLevel: null,
    leftStep: null,
  };
}

function replaceStint(stints: TeamStint[], next: TeamStint): StintResult {
  if (!levelsNeverDrop(next)) {
    return { ok: false, error: "level-dropped" };
  }

  return {
    ok: true,
    stints: stints.map((stint) => (stint.id === next.id ? next : stint)),
  };
}

export function addMember(stints: TeamStint[], member: NewMember): StintResult {
  if (currentTeam(stints).length >= TEAM_SIZE) {
    return { ok: false, error: "team-full" };
  }

  if (!isValidJoinLevel(member.level)) {
    return { ok: false, error: "invalid-level" };
  }

  return {
    ok: true,
    stints: [...stints, newStint(member, lastStep(stints) + 1)],
  };
}

export function updateMember(
  stints: TeamStint[],
  stintId: string,
  level: number,
  pokemonId: number,
): StintResult {
  const stint = currentTeam(stints).find((entry) => entry.id === stintId);

  if (!stint) {
    return { ok: false, error: "not-on-team" };
  }

  if (!isValidLevel(level)) {
    return { ok: false, error: "invalid-level" };
  }

  if (level === currentLevel(stint) && pokemonId === currentPokemonId(stint)) {
    return { ok: false, error: "no-change" };
  }
  const update = { step: lastStep(stints) + 1, level, pokemonId };

  return replaceStint(stints, {
    ...stint,
    updates: [...stint.updates, update],
  });
}

export function swapOut(
  stints: TeamStint[],
  stintId: string,
  leftLevel: number,
  replacement: NewMember | null,
): StintResult {
  const leaving = currentTeam(stints).find((stint) => stint.id === stintId);

  if (!leaving) {
    return { ok: false, error: "not-on-team" };
  }

  if (
    !isValidLevel(leftLevel) ||
    (replacement && !isValidJoinLevel(replacement.level))
  ) {
    return { ok: false, error: "invalid-level" };
  }
  const step = lastStep(stints) + 1;
  const result = replaceStint(stints, {
    ...leaving,
    leftLevel,
    leftStep: step,
  });

  if (!result.ok || !replacement) {
    return result;
  }

  return { ok: true, stints: [...result.stints, newStint(replacement, step)] };
}

export function undoLastStep(stints: TeamStint[]): TeamStint[] {
  const step = lastStep(stints);

  return stints
    .filter((stint) => stint.joinedStep !== step)
    .map((stint) => ({
      ...stint,
      updates: stint.updates.filter((update) => update.step !== step),
      ...(stint.leftStep === step && { leftLevel: null, leftStep: null }),
    }));
}

function withLevelAt(
  stint: TeamStint,
  step: number,
  level: number,
): TeamStint | null {
  if (step === stint.joinedStep) {
    return { ...stint, joinedLevel: level };
  }

  if (step === stint.leftStep) {
    return { ...stint, leftLevel: level };
  }

  if (!stint.updates.some((update) => update.step === step)) {
    return null;
  }

  return {
    ...stint,
    updates: stint.updates.map((update) =>
      update.step === step ? { ...update, level } : update,
    ),
  };
}

export function fixLevel(
  stints: TeamStint[],
  stintId: string,
  step: number,
  level: number,
): StintResult {
  const stint = stints.find((entry) => entry.id === stintId);
  const fixed = stint && withLevelAt(stint, step, level);

  if (!fixed) {
    return { ok: false, error: "not-found" };
  }

  if (!isValidLevel(level)) {
    return { ok: false, error: "invalid-level" };
  }

  return replaceStint(stints, fixed);
}

export function timelineSteps(stints: TeamStint[]): TimelineStep[] {
  return Array.from({ length: lastStep(stints) }, (_, index) => {
    const step = index + 1;

    return {
      step,
      left: stints.filter((stint) => stint.leftStep === step),
      changed: stints.flatMap((stint) =>
        stint.updates
          .filter((update) => update.step === step)
          .map((update) => ({
            stint,
            update,
            from: pokemonIdAt(stint, step - 1),
          })),
      ),
      joined: stints.filter((stint) => stint.joinedStep === step),
    };
  });
}

export function playthroughTitle(playthrough: Playthrough): string {
  return playthrough.name ?? findGame(playthrough.gameId).name;
}

export function speciesName(pokemonId: number): string {
  const pokemon = findPokemon(pokemonId);

  return pokemon ? formatPokemonLabel(pokemon) : "Unknown Pokémon";
}

export function stintName(
  stint: TeamStint,
  pokemonId = currentPokemonId(stint),
): string {
  return stint.nickname ?? speciesName(pokemonId);
}
