export type PickSearch = {
  swap?: string;
};

export function parsePickSearch(search: Record<string, unknown>): PickSearch {
  return typeof search.swap === "string" && search.swap
    ? { swap: search.swap }
    : {};
}
