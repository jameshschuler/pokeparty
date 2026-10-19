import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTeamsContext } from "../../contexts/teams-context";
import { TEAM_SIZE } from "../../lib/team";
import type { Team } from "../../types/team";
import { TeamSlots } from "../pokemon/TeamSlots";
import { ShareActions } from "../share/ShareActions";
import { DeleteTeamConfirm } from "./DeleteTeamConfirm";

export function TeamListItem({ team }: { team: Team }) {
  const { deleteTeam } = useTeamsContext();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <li className="border-ink shadow-sticker rounded-2xl border-[3px] bg-white p-3">
      <Link
        to="/team/$teamId"
        params={{ teamId: team.id }}
        aria-label={`Edit team with ${team.members.length} Pokémon`}
        className="block"
      >
        <TeamSlots members={team.members} />
      </Link>
      <div className="mt-3">
        {confirmingDelete ? (
          <DeleteTeamConfirm
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={() => deleteTeam(team.id)}
          />
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">
              {team.members.length}/{TEAM_SIZE}
            </span>
            <div className="flex items-center gap-2">
              <ShareActions members={team.members} />
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Delete team"
                className="border-ink flex size-11 items-center justify-center rounded-full border-[3px] bg-white transition active:scale-95"
              >
                <Trash2 className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
