import { Link } from "@tanstack/react-router";
import { CircleHelp, Users } from "lucide-react";
import { AppTile } from "./AppTile";

export function Hub() {
  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold">What are we playing?</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            to="/party"
            className="border-ink shadow-sticker block rounded-2xl border-[3px] bg-white p-4 transition active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <AppTile
              icon={<Users className="size-7" aria-hidden />}
              title="Party Builder"
              description="Pick 6 Pokémon and share your party."
            />
          </Link>
        </li>
        <li className="border-ink rounded-2xl border-[3px] border-dashed bg-white/60 p-4">
          <AppTile
            icon={<CircleHelp className="size-7" aria-hidden />}
            title="Who's That Pokémon?"
            description="A timed guessing game."
            badge="Soon"
          />
        </li>
      </ul>
    </section>
  );
}
