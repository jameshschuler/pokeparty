import type { Region } from "../src/types/pokemon.ts";

const GENERATION_REGIONS: Record<string, Region> = {
  "generation-i": "kanto",
  "generation-ii": "johto",
  "generation-iii": "hoenn",
  "generation-iv": "sinnoh",
  "generation-v": "unova",
  "generation-vi": "kalos",
  "generation-vii": "alola",
  "generation-viii": "galar",
  "generation-ix": "paldea",
};

const VERSION_GROUP_REGIONS: Record<string, Region> = {
  "legends-arceus": "hisui",
  "lets-go-pikachu-lets-go-eevee": "kanto",
  "legends-za": "kalos",
  "mega-dimension": "kalos",
};

const EXCLUDED_FORM_PATTERNS = [
  /^pikachu-/,
  /^eevee-starter$/,
  /^greninja-battle-bond$/,
  /^rockruff-own-tempo$/,
  /-power-construct$/,
  /^minior-/,
  /^eternatus-eternamax$/,
  /^koraidon-/,
  /^miraidon-/,
  /-totem/,
  /-gmax$/,
];

const REGIONAL_FORM_NAME =
  /^(Alolan|Galarian|Hisuian|Paldean) Form(?: \((.+)\))?$/;

export type FormFlags = {
  isBattleOnly: boolean;
  isMega: boolean;
};

export type DisplayName = {
  displayName: string;
  variant: string | null;
  regional: boolean;
};

export function debutRegion(versionGroup: string, generation: string): Region {
  const region =
    VERSION_GROUP_REGIONS[versionGroup] ?? GENERATION_REGIONS[generation];

  if (!region) {
    throw new Error(`No region for ${versionGroup} (${generation})`);
  }

  return region;
}

export function isExcludedForm(name: string, flags: FormFlags): boolean {
  return (
    flags.isBattleOnly ||
    flags.isMega ||
    EXCLUDED_FORM_PATTERNS.some((pattern) => pattern.test(name))
  );
}

export function formDisplayName(
  speciesName: string,
  formName: string,
): DisplayName {
  const regional = formName.match(REGIONAL_FORM_NAME);

  if (regional) {
    return {
      displayName: `${regional[1]} ${speciesName}`,
      variant: regional[2] ?? null,
      regional: true,
    };
  }

  return formName.includes(speciesName)
    ? { displayName: formName, variant: null, regional: false }
    : { displayName: speciesName, variant: formName, regional: false };
}
