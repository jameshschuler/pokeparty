import type { Playthrough, StintUpdate, TeamStint } from "../types/playthrough";
import { isGameId } from "./games";
import { currentTeam, isValidLevel, levelsNeverDrop } from "./playthrough";
import { isValidPokemonId } from "./pokemon";
import { loadStoredList } from "./storage";
import { TEAM_SIZE } from "./team";

export const PLAYTHROUGHS_STORAGE_KEY = "pokeparty:playthroughs";

function isStep(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 1;
}

function isStintUpdate(value: unknown): value is StintUpdate {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const update = value as Record<string, unknown>;

  return (
    isStep(update.step) &&
    typeof update.level === "number" &&
    isValidLevel(update.level) &&
    typeof update.pokemonId === "number" &&
    isValidPokemonId(update.pokemonId)
  );
}

function hasValidShape(value: unknown): value is TeamStint {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const stint = value as Record<string, unknown>;
  const left = stint.leftLevel === null && stint.leftStep === null;

  return (
    typeof stint.id === "string" &&
    typeof stint.pokemonId === "number" &&
    isValidPokemonId(stint.pokemonId) &&
    typeof stint.shiny === "boolean" &&
    (stint.nickname === null || typeof stint.nickname === "string") &&
    (stint.joinedLevel === null ||
      (typeof stint.joinedLevel === "number" &&
        isValidLevel(stint.joinedLevel))) &&
    isStep(stint.joinedStep) &&
    Array.isArray(stint.updates) &&
    stint.updates.every(isStintUpdate) &&
    (left ||
      (typeof stint.leftLevel === "number" &&
        isValidLevel(stint.leftLevel) &&
        isStep(stint.leftStep)))
  );
}

function isTeamStint(value: unknown): value is TeamStint {
  if (!hasValidShape(value)) {
    return false;
  }
  const steps = [
    value.joinedStep,
    ...value.updates.map((update) => update.step),
    ...(value.leftStep === null ? [] : [value.leftStep]),
  ];

  return (
    steps.every((step, index) => index === 0 || step > steps[index - 1]) &&
    levelsNeverDrop(value)
  );
}

function parseStoredPlaythrough(value: unknown): Playthrough | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const playthrough = value as Record<string, unknown>;
  const { stints } = playthrough;

  if (
    typeof playthrough.id !== "string" ||
    !isGameId(playthrough.gameId) ||
    (playthrough.name !== null && typeof playthrough.name !== "string") ||
    typeof playthrough.createdAt !== "number" ||
    typeof playthrough.updatedAt !== "number" ||
    !Array.isArray(stints) ||
    !stints.every(isTeamStint) ||
    currentTeam(stints).length > TEAM_SIZE
  ) {
    return null;
  }

  return {
    id: playthrough.id,
    gameId: playthrough.gameId,
    name: playthrough.name,
    stints,
    createdAt: playthrough.createdAt,
    updatedAt: playthrough.updatedAt,
  };
}

export function loadPlaythroughs(): Playthrough[] {
  return loadStoredList(PLAYTHROUGHS_STORAGE_KEY, parseStoredPlaythrough);
}

export function savePlaythroughs(playthroughs: Playthrough[]): void {
  localStorage.setItem(PLAYTHROUGHS_STORAGE_KEY, JSON.stringify(playthroughs));
}
