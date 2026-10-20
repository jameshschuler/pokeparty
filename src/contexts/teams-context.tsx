import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useStoredList } from "../hooks/useStoredList";
import { createTeam } from "../lib/team";
import { loadTeams, saveTeams, TEAMS_STORAGE_KEY } from "../lib/team-storage";
import type { Team, TeamMember } from "../types/team";

export type TeamsContextValue = {
  teams: Team[];
  createTeam: (members: TeamMember[]) => Team;
  updateTeam: (teamId: string, members: TeamMember[]) => void;
  deleteTeam: (teamId: string) => void;
};

const TeamsContext = createContext<TeamsContextValue | null>(null);

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, commit] = useStoredList({
    key: TEAMS_STORAGE_KEY,
    load: loadTeams,
    save: saveTeams,
    saveErrorMessage: "Couldn't save. Your browser storage is full or blocked.",
  });

  const value = useMemo<TeamsContextValue>(() => {
    return {
      teams,
      createTeam: (members) => {
        const team = createTeam(members, Date.now());
        commit([team, ...teams]);

        return team;
      },
      updateTeam: (teamId, members) => {
        commit(
          teams.map((team) =>
            team.id === teamId
              ? { ...team, members, updatedAt: Date.now() }
              : team,
          ),
        );
      },
      deleteTeam: (teamId) => {
        commit(teams.filter((team) => team.id !== teamId));
      },
    };
  }, [teams, commit]);

  return <TeamsContext value={value}>{children}</TeamsContext>;
}

export function useTeamsContext(): TeamsContextValue {
  const context = useContext(TeamsContext);

  if (!context) {
    throw new Error("useTeamsContext must be used inside TeamsProvider");
  }

  return context;
}
