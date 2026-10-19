import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { NEW_TEAM_ID } from "../../lib/team";

export function NewTeamButton() {
  return (
    <Link
      to="/team/$teamId"
      params={{ teamId: NEW_TEAM_ID }}
      className="border-ink bg-primary shadow-sticker flex min-h-12 items-center justify-center gap-2 rounded-2xl border-[3px] px-5 text-lg font-semibold text-white transition active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      <Plus className="size-6" aria-hidden />
      New team
    </Link>
  );
}
