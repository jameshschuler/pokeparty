import {
  CircleHelp,
  Grid2x2,
  Grid3x3,
  History,
  Keyboard,
  Leaf,
  ListOrdered,
  Trophy,
  Users,
} from "lucide-react";
import { AppTile } from "./AppTile";
import { HubSection } from "./HubSection";

export function Hub() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">PokeParty</h1>
      <HubSection title="Games">
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
            to="/match"
            icon={<Grid2x2 className="size-7" aria-hidden />}
            title="Pokémon Match"
            description="Flip two cards at a time to find every pair."
          />
        </li>
        <li>
          <AppTile
            to="/name-drop"
            icon={<Keyboard className="size-7" aria-hidden />}
            title="Name Drop"
            description="Type each Pokémon's name before it lands."
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
      </HubSection>
      <HubSection title="Tools">
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
            to="/nature-dex"
            icon={<Leaf className="size-7" aria-hidden />}
            title="Nature Dex"
            description="Best natures, moves and catch spots for Heart & Soul."
          />
        </li>
        <li>
          <AppTile
            to="/playthroughs"
            icon={<History className="size-7" aria-hidden />}
            title="Playthrough Timeline"
            description="Log who joins and leaves your team, and at what level."
          />
        </li>
      </HubSection>
    </div>
  );
}
