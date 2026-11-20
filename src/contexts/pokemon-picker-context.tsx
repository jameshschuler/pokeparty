import { createContext, useContext, useState, type ReactNode } from "react";
import type { PokemonSummary, PokemonType } from "../types/pokemon";

export type GameLimit = {
  gameName: string;
  pokemon: PokemonSummary[];
};

export type PokemonPickerContextValue = {
  gameLimit: GameLimit | null;
  query: string;
  setQuery: (query: string) => void;
  type: PokemonType | null;
  setType: (type: PokemonType | null) => void;
  shinyMode: boolean;
  setShinyMode: (shinyMode: boolean) => void;
};

const PokemonPickerContext = createContext<PokemonPickerContextValue | null>(
  null,
);

type PokemonPickerProviderProps = {
  gameLimit?: GameLimit;
  children: ReactNode;
};

export function PokemonPickerProvider({
  gameLimit,
  children,
}: PokemonPickerProviderProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PokemonType | null>(null);
  const [shinyMode, setShinyMode] = useState(false);

  return (
    <PokemonPickerContext
      value={{
        gameLimit: gameLimit ?? null,
        query,
        setQuery,
        type,
        setType,
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
