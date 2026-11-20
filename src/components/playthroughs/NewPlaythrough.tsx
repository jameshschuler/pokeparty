import { useNavigate } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useState, type FormEvent } from "react";
import { usePlaythroughsContext } from "../../contexts/playthroughs-context";
import type { GameId } from "../../lib/games";
import { BackLink } from "../layout/BackLink";
import { PRIMARY_BUTTON } from "../shared/button-styles";
import { GamePicker } from "./GamePicker";
import { TextField } from "./TextField";

export function NewPlaythrough() {
  const { createPlaythrough } = usePlaythroughsContext();
  const navigate = useNavigate();
  const [gameId, setGameId] = useState<GameId | null>(null);
  const [name, setName] = useState("");

  function start(event: FormEvent) {
    event.preventDefault();

    if (!gameId) {
      return;
    }
    const playthrough = createPlaythrough(gameId, name);
    navigate({
      to: "/playthroughs/$playthroughId",
      params: { playthroughId: playthrough.id },
      replace: true,
    });
  }

  return (
    <section className="flex flex-col gap-5">
      <BackLink to="/playthroughs" label="Playthroughs" />
      <h1 className="text-3xl font-bold">New playthrough</h1>
      <form onSubmit={start} className="flex flex-col gap-5">
        <GamePicker value={gameId} onChange={setGameId} />
        <TextField
          label="Name (optional)"
          value={name}
          onChange={setName}
          placeholder="Nuzlocke #2"
          maxLength={40}
        />
        <button
          type="submit"
          disabled={!gameId}
          className={`${PRIMARY_BUTTON} w-fit disabled:opacity-50 disabled:shadow-none`}
        >
          <Play className="size-5" aria-hidden />
          {gameId ? "Start" : "Pick a game to start"}
        </button>
      </form>
    </section>
  );
}
