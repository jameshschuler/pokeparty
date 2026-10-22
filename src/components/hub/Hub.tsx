import { CircleHelp, Grid3x3, ListOrdered, Trophy, Users } from "lucide-react";
import { AppTile } from "./AppTile";

export function Hub() {
  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold">What are we playing?</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <AppTile
            to="/party"
            icon={<Users className="size-7" aria-hidden />}
            title="Party Builder"
            description="Pick 6 Pokémon and share your party."
          />
        </li>
        <li>
          <AppTile
            to="/quiz"
            icon={<CircleHelp className="size-7" aria-hidden />}
            title="Who's That Pokémon?"
            description="Name as many Pokémon as you can before time runs out."
          />
        </li>
        <li>
          <AppTile
            to="/dex-run"
            icon={<ListOrdered className="size-7" aria-hidden />}
            title="Dex Run"
            description="Name every Pokémon in dex order before you run out of lives."
          />
        </li>
        <li>
          <AppTile
            to="/simon"
            icon={<Grid3x3 className="size-7" aria-hidden />}
            title="Simon"
            description="Watch the Pokémon light up, then tap them back in order."
          />
        </li>
        <li>
          <AppTile
            to="/scores"
            icon={<Trophy className="size-7" aria-hidden />}
            title="Your scores"
            description="Your best runs in every game, saved on this device."
          />
        </li>
      </ul>
    </section>
  );
}
