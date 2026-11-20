import type { GameId } from "../lib/games";

export type StintUpdate = {
  step: number;
  level: number;
  pokemonId: number;
};

export type TeamStint = {
  id: string;
  pokemonId: number;
  shiny: boolean;
  nickname: string | null;
  joinedLevel: number | null;
  joinedStep: number;
  updates: StintUpdate[];
  leftLevel: number | null;
  leftStep: number | null;
};

export type Playthrough = {
  id: string;
  gameId: GameId;
  name: string | null;
  stints: TeamStint[];
  createdAt: number;
  updatedAt: number;
};
