import type { DexEntry } from "./nature-dex";
import { PICKABLE_NATURES, ROLES, type Nature, type Role } from "./natures";

export const HNS_REGIONS = ["kanto", "johto", "hoenn"] as const;

export type HnsRegion = (typeof HNS_REGIONS)[number];

export type NatureDexFilters = {
  q?: string;
  region?: HnsRegion;
  role?: Role;
  nature?: Nature;
};

function oneOf<T extends string>(
  options: readonly T[],
  value: unknown,
): T | undefined {
  return options.find((option) => option === value);
}

function parseQuery(value: unknown): string | undefined {
  if (typeof value === "number") {
    return String(value);
  }

  return typeof value === "string" && value !== "" ? value : undefined;
}

export function parseNatureDexSearch(
  search: Record<string, unknown>,
): NatureDexFilters {
  return {
    q: parseQuery(search.q),
    region: oneOf(HNS_REGIONS, search.region),
    role: oneOf(ROLES, search.role),
    nature: oneOf(PICKABLE_NATURES, search.nature),
  };
}

function matchesQuery(entry: DexEntry, query: string): boolean {
  const number = query.replace(/^#?0*/, "");

  return (
    entry.name.toLowerCase().includes(query) ||
    (number !== "" && String(entry.dexNumber) === number)
  );
}

export function filterNatureDex(
  dex: DexEntry[],
  filters: NatureDexFilters,
): DexEntry[] {
  const query = filters.q?.trim().toLowerCase();

  return dex.filter(
    (entry) =>
      (!query || matchesQuery(entry, query)) &&
      (!filters.region || entry.region === filters.region) &&
      (!filters.role ||
        entry.branches.some((branch) => branch.role === filters.role)) &&
      (!filters.nature ||
        entry.branches.some((branch) =>
          branch.picks.some((pick) => pick.nature === filters.nature),
        )),
  );
}
