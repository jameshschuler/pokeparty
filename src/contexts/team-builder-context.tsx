import { useNavigate } from "@tanstack/react-router";
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  addPokemon,
  hasPokemon,
  isTeamFull,
  NEW_TEAM_ID,
  removePokemon,
  toggleShiny,
} from "../lib/team";
import type { PokemonType, Region } from "../types/pokemon";
import type { TeamMember } from "../types/team";
import { useTeamsContext } from "./teams-context";
import { useToastContext } from "./toast-context";

export type TeamBuilderContextValue = {
  members: TeamMember[];
  togglePokemon: (pokemonId: number) => void;
  toggleShinyPokemon: (pokemonId: number) => void;
  query: string;
  setQuery: (query: string) => void;
  type: PokemonType | null;
  setType: (type: PokemonType | null) => void;
  region: Region | null;
  setRegion: (region: Region | null) => void;
  legendaryOnly: boolean;
  setLegendaryOnly: (legendaryOnly: boolean) => void;
  shinyMode: boolean;
  setShinyMode: (shinyMode: boolean) => void;
};

const TeamBuilderContext = createContext<TeamBuilderContextValue | null>(null);

type TeamBuilderProviderProps = {
  teamId: string;
  children: ReactNode;
};

export function TeamBuilderProvider({
  teamId,
  children,
}: TeamBuilderProviderProps) {
  const { teams, createTeam, updateTeam } = useTeamsContext();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PokemonType | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [legendaryOnly, setLegendaryOnly] = useState(false);
  const [shinyMode, setShinyMode] = useState(false);
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null);
  const activeTeamId = teamId === NEW_TEAM_ID ? createdTeamId : teamId;
  const team = teams.find((entry) => entry.id === activeTeamId);
  const members = team?.members ?? [];

  function saveTeam(nextMembers: TeamMember[]) {
    if (team) {
      updateTeam(team.id, nextMembers);

      return;
    }
    const created = createTeam(nextMembers);
    setCreatedTeamId(created.id);
    navigate({
      to: "/team/$teamId",
      params: { teamId: created.id },
      replace: true,
    });
  }

  function togglePokemon(pokemonId: number) {
    if (hasPokemon(members, pokemonId)) {
      saveTeam(removePokemon(members, pokemonId));

      return;
    }

    if (isTeamFull(members)) {
      showToast("Party's full! Remove one first.");

      return;
    }
    saveTeam(addPokemon(members, pokemonId, shinyMode));
  }

  function toggleShinyPokemon(pokemonId: number) {
    saveTeam(toggleShiny(members, pokemonId));
  }

  return (
    <TeamBuilderContext
      value={{
        members,
        togglePokemon,
        toggleShinyPokemon,
        query,
        setQuery,
        type,
        setType,
        region,
        setRegion,
        legendaryOnly,
        setLegendaryOnly,
        shinyMode,
        setShinyMode,
      }}
    >
      {children}
    </TeamBuilderContext>
  );
}

export function useTeamBuilderContext(): TeamBuilderContextValue {
  const context = useContext(TeamBuilderContext);

  if (!context) {
    throw new Error(
      "useTeamBuilderContext must be used inside TeamBuilderProvider",
    );
  }

  return context;
}
