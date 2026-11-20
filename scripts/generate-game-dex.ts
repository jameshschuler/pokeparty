import { writeFile } from "node:fs/promises";
import type { GameId } from "../src/lib/games.ts";
import { idFromUrl } from "../src/lib/resource-id.ts";

const API_URL = "https://pokeapi.co/api/v2";
const HEART_SOUL_SPECIES = 386;
const OUTPUT_PATH = new URL("../src/data/game-dex.json", import.meta.url);

const VERSION_GROUPS: Record<Exclude<GameId, "heart-soul">, string[]> = {
  "red-blue": ["red-blue"],
  yellow: ["yellow"],
  "gold-silver": ["gold-silver"],
  crystal: ["crystal"],
  "ruby-sapphire": ["ruby-sapphire"],
  "firered-leafgreen": ["firered-leafgreen"],
  emerald: ["emerald"],
  "diamond-pearl": ["diamond-pearl"],
  platinum: ["platinum"],
  "heartgold-soulsilver": ["heartgold-soulsilver"],
  "black-white": ["black-white"],
  "black2-white2": ["black-2-white-2"],
  "x-y": ["x-y"],
  "omega-ruby-alpha-sapphire": ["omega-ruby-alpha-sapphire"],
  "sun-moon": ["sun-moon"],
  "ultra-sun-ultra-moon": ["ultra-sun-ultra-moon"],
  "lets-go": ["lets-go-pikachu-lets-go-eevee"],
  "sword-shield": ["sword-shield"],
  "brilliant-diamond-shining-pearl": ["brilliant-diamond-shining-pearl"],
  "legends-arceus": ["legends-arceus"],
  "scarlet-violet": ["scarlet-violet"],
  "legends-z-a": ["legends-za", "mega-dimension"],
};

type NamedResource = { name: string; url: string };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`PokeAPI request failed (${response.status}): ${path}`);
  }

  return (await response.json()) as T;
}

async function pokedexSpecies(name: string): Promise<number[]> {
  const pokedex = await getJson<{
    pokemon_entries: { entry_number: number; pokemon_species: NamedResource }[];
  }>(`/pokedex/${name}`);

  return pokedex.pokemon_entries
    .toSorted((a, b) => a.entry_number - b.entry_number)
    .map((entry) => idFromUrl(entry.pokemon_species.url));
}

async function gameSpecies(versionGroups: string[]): Promise<number[]> {
  const groups = await Promise.all(
    versionGroups.map((name) =>
      getJson<{ pokedexes: NamedResource[] }>(`/version-group/${name}`),
    ),
  );
  const names = new Set(
    groups.flatMap((group) => group.pokedexes.map((pokedex) => pokedex.name)),
  );
  const species = await Promise.all([...names].map(pokedexSpecies));

  return [...new Set(species.flat())];
}

const gameEntries = await Promise.all(
  Object.entries(VERSION_GROUPS).map(async ([gameId, versionGroups]) => {
    const species = await gameSpecies(versionGroups);

    return [gameId, species] as const;
  }),
);
const gameDex = Object.fromEntries([
  ...gameEntries,
  [
    "heart-soul",
    Array.from({ length: HEART_SOUL_SPECIES }, (_, index) => index + 1),
  ],
]);
await writeFile(OUTPUT_PATH, `${JSON.stringify(gameDex)}\n`);
for (const [gameId, species] of Object.entries(gameDex)) {
  console.log(`${gameId}: ${species.length} species`);
}
