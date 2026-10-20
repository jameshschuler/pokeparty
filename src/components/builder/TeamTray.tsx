import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";
import { TEAM_SIZE } from "../../lib/team";
import { ShareActions } from "../share/ShareActions";
import { TraySlot } from "./TraySlot";

export function TeamTray() {
  const { members } = useTeamBuilderContext();

  return (
    <aside
      aria-label="Your team"
      className="border-ink bg-primary fixed inset-x-0 bottom-0 z-20 border-t-[3px] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3">
        <ul className="grid grid-cols-6 gap-2">
          {Array.from({ length: TEAM_SIZE }, (_, index) => {
            const member = members[index];

            return (
              <li key={member?.pokemonId ?? `empty-${index}`}>
                {member === undefined ? (
                  <div className="aspect-square w-full rounded-full border-[3px] border-dashed border-white/70" />
                ) : (
                  <TraySlot member={member} />
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-white [text-shadow:1px_1px_0_var(--color-ink)]">
            {members.length}/{TEAM_SIZE}
          </span>
          <div className="flex items-center gap-2">
            <ShareActions members={members} />
            <Link
              to="/party"
              className="border-ink shadow-sticker-sm flex min-h-11 items-center gap-1.5 rounded-full border-[3px] bg-white px-4 font-semibold transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Check className="size-5" aria-hidden />
              Done
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
