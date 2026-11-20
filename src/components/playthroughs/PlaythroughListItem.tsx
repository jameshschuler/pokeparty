import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { usePlaythroughsContext } from "../../contexts/playthroughs-context";
import { formatDate } from "../../lib/dates";
import { findGame } from "../../lib/games";
import {
  currentPokemonId,
  currentTeam,
  playthroughTitle,
} from "../../lib/playthrough";
import type { Playthrough } from "../../types/playthrough";
import { TeamSlots } from "../pokemon/TeamSlots";
import { DeleteConfirm } from "../shared/DeleteConfirm";

export function PlaythroughListItem({
  playthrough,
}: {
  playthrough: Playthrough;
}) {
  const { deletePlaythrough } = usePlaythroughsContext();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const title = playthroughTitle(playthrough);

  return (
    <li className="border-ink shadow-sticker flex min-w-0 flex-col gap-3 rounded-2xl border-[3px] bg-white p-3">
      <Link
        to="/playthroughs/$playthroughId"
        params={{ playthroughId: playthrough.id }}
        aria-label={`Open ${title}`}
        className="flex flex-col gap-3"
      >
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-xl font-bold">{title}</span>
          <span className="text-ink/70 truncate">
            {findGame(playthrough.gameId).name} · Updated{" "}
            {formatDate(playthrough.updatedAt)}
          </span>
        </span>
        <TeamSlots
          members={currentTeam(playthrough.stints).map((stint) => ({
            pokemonId: currentPokemonId(stint),
            shiny: stint.shiny,
          }))}
        />
      </Link>
      {confirmingDelete ? (
        <DeleteConfirm
          question="Delete this playthrough?"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => deletePlaythrough(playthrough.id)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label={`Delete ${title}`}
          className="border-ink flex size-11 items-center justify-center self-end rounded-full border-[3px] bg-white transition active:scale-95"
        >
          <Trash2 className="size-5" aria-hidden />
        </button>
      )}
    </li>
  );
}
