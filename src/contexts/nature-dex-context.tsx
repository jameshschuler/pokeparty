import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  createContext,
  useContext,
  useDeferredValue,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildNatureDex, type DexEntry, type MoveTab } from "../lib/nature-dex";
import {
  filterNatureDex,
  type NatureDexFilters,
} from "../lib/nature-dex-filters";
import {
  loadNatureDexSettings,
  saveNatureDexSettings,
  type NatureDexSettings,
} from "../lib/nature-dex-settings";

export type NatureDexContextValue = {
  settings: NatureDexSettings;
  updateSettings: (change: Partial<NatureDexSettings>) => void;
  query: string;
  setQuery: (query: string) => void;
  filters: NatureDexFilters;
  updateFilters: (change: Partial<NatureDexFilters>) => void;
  clearFilters: () => void;
  entries: DexEntry[];
  total: number;
  openTabs: ReadonlyMap<number, MoveTab>;
  setOpenTab: (dexNumber: number, tab: MoveTab | null) => void;
};

const NatureDexContext = createContext<NatureDexContextValue | null>(null);

export function NatureDexProvider({ children }: { children: ReactNode }) {
  const filters = useSearch({ from: "/nature-dex" });
  const navigate = useNavigate({ from: "/nature-dex" });
  const [settings, setSettings] = useState(loadNatureDexSettings);
  const [query, setQueryState] = useState(filters.q ?? "");
  const deferredQuery = useDeferredValue(query);
  const [openTabs, setOpenTabs] = useState<ReadonlyMap<number, MoveTab>>(
    () => new Map(),
  );
  const { learnset, split } = settings;
  const dex = useMemo(
    () => buildNatureDex({ learnset, split }),
    [learnset, split],
  );
  const entries = useMemo(
    () => filterNatureDex(dex, { ...filters, q: deferredQuery }),
    [dex, filters, deferredQuery],
  );

  function updateSettings(change: Partial<NatureDexSettings>) {
    const next = { ...settings, ...change };
    setSettings(next);
    saveNatureDexSettings(next);
  }

  function updateFilters(change: Partial<NatureDexFilters>) {
    navigate({ search: { ...filters, ...change }, replace: true });
  }

  function setQuery(next: string) {
    setQueryState(next);
    updateFilters({ q: next || undefined });
  }

  function clearFilters() {
    setQueryState("");
    navigate({ search: {}, replace: true });
  }

  function setOpenTab(dexNumber: number, tab: MoveTab | null) {
    setOpenTabs((current) => {
      const next = new Map(current);

      if (tab) {
        next.set(dexNumber, tab);
      } else {
        next.delete(dexNumber);
      }

      return next;
    });
  }

  return (
    <NatureDexContext
      value={{
        settings,
        updateSettings,
        query,
        setQuery,
        filters,
        updateFilters,
        clearFilters,
        entries,
        total: dex.length,
        openTabs,
        setOpenTab,
      }}
    >
      {children}
    </NatureDexContext>
  );
}

export function useNatureDexContext(): NatureDexContextValue {
  const context = useContext(NatureDexContext);

  if (!context) {
    throw new Error(
      "useNatureDexContext must be used inside NatureDexProvider",
    );
  }

  return context;
}
