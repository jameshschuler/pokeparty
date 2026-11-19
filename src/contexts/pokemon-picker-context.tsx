import { createContext, useContext, useState, type ReactNode } from "react";
import type { PokemonType, Region } from "../types/pokemon";

export type PokemonPickerContextValue = {
  query: string;
  setQuery: (query: string) => void;
  type: PokemonType | null;
  setType: (type: PokemonType | null) => void;
  region: Region | null;
  setRegion: (region: Region | null) => void;
  legendaryOnly: boolean;
  setLegendaryOnly: (legendaryOnly: boolean) => void;
  shinyMode: boolean;
  setShinyMode: (shinyMode: boolean) => void;
};

const PokemonPickerContext = createContext<PokemonPickerContextValue | null>(
  null,
);

export function PokemonPickerProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PokemonType | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [legendaryOnly, setLegendaryOnly] = useState(false);
  const [shinyMode, setShinyMode] = useState(false);

  return (
    <PokemonPickerContext
      value={{
        query,
        setQuery,
        type,
        setType,
        region,
        setRegion,
        legendaryOnly,
        setLegendaryOnly,
        shinyMode,
        setShinyMode,
      }}
    >
      {children}
    </PokemonPickerContext>
  );
}

export function usePokemonPickerContext(): PokemonPickerContextValue {
  const context = useContext(PokemonPickerContext);

  if (!context) {
    throw new Error(
      "usePokemonPickerContext must be used inside PokemonPickerProvider",
    );
  }

  return context;
}
