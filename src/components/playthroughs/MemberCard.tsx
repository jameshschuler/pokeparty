import { Link } from "@tanstack/react-router";
import { Repeat, TrendingUp, X } from "lucide-react";
import { useRef } from "react";
import { usePlaythroughContext } from "../../contexts/playthrough-context";
import {
  currentLevel,
  currentPokemonId,
  speciesName,
  stintName,
} from "../../lib/playthrough";
import type { TeamStint } from "../../types/playthrough";
import { PokemonSprite } from "../pokemon/PokemonSprite";
import { ShinyBadge } from "../pokemon/ShinyBadge";
import { LeaveDialog } from "./LeaveDialog";
import { CARD_BUTTON } from "./playthrough-styles";
import { UpdateMemberDialog } from "./UpdateMemberDialog";

export function MemberCard({ stint }: { stint: TeamStint }) {
  const { playthrough } = usePlaythroughContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const leaveRef = useRef<HTMLDialogElement>(null);
  const pokemonId = currentPokemonId(stint);
  const level = currentLevel(stint);
  const name = stintName(stint);

  return (
    <li className="border-ink shadow-sticker-sm relative flex min-w-0 flex-col items-center gap-2 rounded-2xl border-[3px] bg-white p-3 text-center">
      <button
        type="button"
        onClick={() => leaveRef.current?.showModal()}
        aria-label={`Remove ${name}`}
        title="Remove from the team"
        className="border-ink absolute top-2 right-2 flex size-8 items-center justify-center rounded-full border-2 bg-white transition active:scale-90"
      >
        <X className="size-4" strokeWidth={3} aria-hidden />
      </button>
      <div className="relative w-20">
        <PokemonSprite id={pokemonId} shiny={stint.shiny} alt="" />
        {stint.shiny && <ShinyBadge className="right-0 bottom-0 size-5" />}
      </div>
      <div className="flex w-full min-w-0 flex-col">
        <span className="truncate font-bold">{name}</span>
        {stint.nickname && (
          <span className="text-ink/70 truncate text-sm">
            {speciesName(pokemonId)}
          </span>
        )}
        {level !== null && (
          <span className="text-sm font-semibold">Lv {level}</span>
        )}
      </div>
      <div className="flex w-full flex-col gap-1.5">
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          aria-label={`Update ${name}`}
          className={CARD_BUTTON}
        >
          <TrendingUp className="size-4" aria-hidden />
          Update
        </button>
        <Link
          to="/playthroughs/$playthroughId/pick"
          params={{ playthroughId: playthrough.id }}
          search={{ swap: stint.id }}
          aria-label={`Swap out ${name}`}
          className={CARD_BUTTON}
        >
          <Repeat className="size-4" aria-hidden />
          Swap out
        </Link>
      </div>
      <LeaveDialog key={level} dialogRef={leaveRef} stint={stint} />
      <UpdateMemberDialog
        key={`${pokemonId}-${level}`}
        dialogRef={dialogRef}
        stint={stint}
      />
    </li>
  );
}
