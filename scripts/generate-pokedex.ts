import { writeFile } from "node:fs/promises";
import { idFromUrl } from "../src/lib/resource-id.ts";
import {
  debutRegion,
  formDisplayName,
  isExcludedForm,
} from "./pokedex-rules.ts";

const API_URL = "https://pokeapi.co/api/v2";
const SPECIES_COUNT = 1025;
const FORM_PAGE_SIZE = 1000;
const CONCURRENCY = 12;
const OUTPUT_PATH = new URL("../src/data/pokedex.json", import.meta.url);

type NamedResource = { name: string; url: string };

type SpeciesDetail = {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
  names: { name: string; language: NamedResource }[];
  varieties: { is_default: boolean; pokemon: NamedResource }[];
};

type PokemonDetail = {
  id: number;
  name: string;
  species: NamedResource;
  forms: NamedResource[];
};

type FormDetail = {
  is_battle_only: boolean;
  is_mega: boolean;
  version_group: NamedResource;
  form_names: { name: string; language: NamedResource }[];
};

type Debut = { pokemon: PokemonDetail; form: FormDetail };

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(
    url.startsWith("http") ? url : `${API_URL}${url}`,
  );
  if (!response.ok) {
    throw new Error(`PokeAPI request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

async function mapLimited<T, R>(
  items: T[],
  map: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await map(items[index]);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results;
}

function englishName(names: { name: string; language: NamedResource }[]) {
  return names.find((entry) => entry.language.name === "en")?.name ?? "";
}

async function loadDebut(pokemonUrl: string): Promise<Debut> {
  const pokemon = await getJson<PokemonDetail>(pokemonUrl);
  const form = await getJson<FormDetail>(pokemon.forms[0].url);
  return { pokemon, form };
}

const speciesList = await getJson<{ results: NamedResource[] }>(
  `/pokemon-species?limit=${SPECIES_COUNT}`,
);
const speciesDetails = await mapLimited(speciesList.results, (entry) =>
  getJson<SpeciesDetail>(entry.url),
);
const speciesDebuts = await mapLimited(speciesDetails, (species) =>
  loadDebut(
    species.varieties.find((variety) => variety.is_default)!.pokemon.url,
  ),
);

const formList = await getJson<{ results: NamedResource[] }>(
  `/pokemon?offset=${SPECIES_COUNT}&limit=${FORM_PAGE_SIZE}`,
);
const formDebuts = (
  await mapLimited(formList.results, (entry) => loadDebut(entry.url))
).filter(
  ({ pokemon, form }) =>
    !isExcludedForm(pokemon.name, {
      isBattleOnly: form.is_battle_only,
      isMega: form.is_mega,
    }),
);

const versionGroupNames = [
  ...new Set(
    [...speciesDebuts, ...formDebuts].map(
      ({ form }) => form.version_group.name,
    ),
  ),
];
const versionGroups = await mapLimited(versionGroupNames, (name) =>
  getJson<{ name: string; generation: NamedResource }>(
    `/version-group/${name}`,
  ),
);
const generations = new Map(
  versionGroups.map((group) => [group.name, group.generation.name]),
);

function regionOf({ form }: Debut) {
  const versionGroup = form.version_group.name;
  return debutRegion(versionGroup, generations.get(versionGroup)!);
}

const speciesNames = new Map(
  speciesDetails.map((species) => [species.id, englishName(species.names)]),
);

const species = speciesDetails.map((detail, index) => ({
  id: detail.id,
  name: detail.name,
  displayName: speciesNames.get(detail.id),
  region: regionOf(speciesDebuts[index]),
  legendary: detail.is_legendary || detail.is_mythical,
}));

const forms = formDebuts.map((debut) => {
  const speciesId = idFromUrl(debut.pokemon.species.url);
  return {
    id: debut.pokemon.id,
    speciesId,
    name: debut.pokemon.name,
    ...formDisplayName(
      speciesNames.get(speciesId)!,
      englishName(debut.form.form_names),
    ),
    region: regionOf(debut),
  };
});

await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify({ species, forms }, null, 2)}\n`,
);
console.log(`Wrote ${species.length} species and ${forms.length} forms.`);
