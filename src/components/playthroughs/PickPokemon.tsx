import { Navigate, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { usePlaythroughContext } from "../../contexts/playthrough-context";
import { stintName } from "../../lib/playthrough";
import { TEAM_SIZE } from "../../lib/team";
import type { PokemonSummary } from "../../types/pokemon";
import { BackLink } from "../layout/BackLink";
import { PickerFilters } from "../picker/PickerFilters";
import { PokemonGrid } from "../picker/PokemonGrid";
import { PickCard } from "./PickCard";
import { StepDialog } from "./StepDialog";

export function PickPokemon({ swapId }: { swapId: string | null }) {
  const { playthrough, team } = usePlaythroughContext();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [picked, setPicked] = useState<PokemonSummary | null>(null);
  const leaving = team.find((stint) => stint.id === swapId) ?? null;
  const backTo = {
    to: "/playthroughs/$playthroughId",
    params: { playthroughId: playthrough.id },
  } as const;

  if (swapId ? !leaving : team.length >= TEAM_SIZE) {
    return <Navigate {...backTo} replace />;
  }

  function open(pokemon: PokemonSummary) {
    setPicked(pokemon);
    dialogRef.current?.showModal();
  }

  return (
    <div className="flex flex-col gap-3">
      <BackLink {...backTo} label="Back to the team" />
      <h1 className="min-w-0 truncate text-3xl font-bold">
        {leaving ? `Replace ${stintName(leaving)}` : "Add a Pokémon"}
      </h1>
      <PickerFilters />
      <PokemonGrid
        renderPokemon={(pokemon) => (
          <PickCard key={pokemon.id} pokemon={pokemon} onPick={open} />
        )}
      />
      <StepDialog
        dialogRef={dialogRef}
        picked={picked}
        leaving={leaving}
        onDone={() => navigate({ ...backTo, replace: true })}
      />
    </div>
  );
}
