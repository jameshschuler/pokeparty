import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { NEW_TEAM_ID } from "../../lib/team";
import { PRIMARY_BUTTON } from "../shared/button-styles";

export function NewTeamButton() {
  return (
    <Link
      to="/team/$teamId"
      params={{ teamId: NEW_TEAM_ID }}
      className={`${PRIMARY_BUTTON} justify-center`}
    >
      <Plus className="size-6" aria-hidden />
      New team
    </Link>
  );
}
