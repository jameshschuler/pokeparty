import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PokemonPickerProvider } from "../../contexts/pokemon-picker-context";
import { PickerFilters } from "./PickerFilters";
import { PokemonGrid } from "./PokemonGrid";

function renderPicker() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PokemonPickerProvider>
        <PickerFilters />
        <PokemonGrid
          renderPokemon={(pokemon) => <li key={pokemon.id}>{pokemon.name}</li>}
        />
      </PokemonPickerProvider>
    </QueryClientProvider>,
  );
}

function shownNames() {
  const grid = screen.getByRole("list", { name: "Pokémon" });

  return within(grid)
    .getAllByRole("listitem")
    .map((item) => item.textContent);
}

describe("pokemon picker", () => {
  it("renders each Pokémon with the given renderer", () => {
    renderPicker();

    expect(shownNames().slice(0, 3)).toEqual([
      "bulbasaur",
      "ivysaur",
      "venusaur",
    ]);
  });

  it("narrows the grid as you search", async () => {
    const user = userEvent.setup();
    renderPicker();

    await user.type(screen.getByLabelText("Search Pokémon"), "pikachu");

    expect(shownNames()).toContain("pikachu");
    expect(shownNames()).not.toContain("bulbasaur");
  });

  it("combines the region and legendary filters", async () => {
    const user = userEvent.setup();
    renderPicker();

    await user.click(screen.getByRole("button", { name: "Kanto" }));
    await user.click(screen.getByRole("button", { name: "Legendary" }));

    expect(shownNames()).toEqual(
      expect.arrayContaining(["articuno", "zapdos", "moltres", "mewtwo"]),
    );
    expect(shownNames()).not.toContain("lugia");
  });

  it("says so when nothing matches", async () => {
    const user = userEvent.setup();
    renderPicker();

    await user.type(screen.getByLabelText("Search Pokémon"), "agumon");

    expect(
      screen.getByText("No Pokémon match that search."),
    ).toBeInTheDocument();
  });
});
