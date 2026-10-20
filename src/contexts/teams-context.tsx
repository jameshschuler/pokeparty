import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createTeam } from "../lib/team";
import { loadTeams, saveTeams, TEAMS_STORAGE_KEY } from "../lib/team-storage";
import type { Team, TeamMember } from "../types/team";
import { useToastContext } from "./toast-context";

export type TeamsContextValue = {
  teams: Team[];
  createTeam: (members: TeamMember[]) => Team;
  updateTeam: (teamId: string, members: TeamMember[]) => void;
  deleteTeam: (teamId: string) => void;
};

const TeamsContext = createContext<TeamsContextValue | null>(null);

export function TeamsProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToastContext();
  const [teams, setTeams] = useState<Team[]>(loadTeams);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === TEAMS_STORAGE_KEY || event.key === null) {
        setTeams(loadTeams());
      }
    }
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo<TeamsContextValue>(() => {
    function commit(nextTeams: Team[]) {
      setTeams(nextTeams);
      try {
        saveTeams(nextTeams);
      } catch {
        showToast("Couldn't save. Your browser storage is full or blocked.");
      }
    }

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
  }, [teams, showToast]);

  return <TeamsContext value={value}>{children}</TeamsContext>;
}

export function useTeamsContext(): TeamsContextValue {
  const context = useContext(TeamsContext);

  if (!context) {
    throw new Error("useTeamsContext must be used inside TeamsProvider");
  }

  return context;
}
