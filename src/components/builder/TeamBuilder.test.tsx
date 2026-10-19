import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { loadTeams, saveTeams } from "../../lib/team-storage";
import { mockPokemonList, renderApp } from "../../test/renderApp";

describe("team builder", () => {
  beforeEach(() => {
    mockPokemonList();
  });

  it("saves a new team on the first pick and moves to its URL", async () => {
    const user = userEvent.setup();
    const router = renderApp("/team/new");

    const button = await screen.findByRole("button", { name: "Add Bulbasaur" });
    await user.click(button);

    const [team] = loadTeams();
    expect(team.pokemonIds).toEqual([1]);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/team/${team.id}`),
    );
  });

  it("keeps quick picks on a new team in one team", async () => {
    renderApp("/team/new");

    const bulbasaur = await screen.findByRole("button", {
      name: "Add Bulbasaur",
    });
    fireEvent.click(bulbasaur);
    fireEvent.click(screen.getByRole("button", { name: "Add Charmander" }));

    const teams = loadTeams();
    expect(teams).toHaveLength(1);
    expect(teams[0].pokemonIds).toEqual([1, 4]);
  });

  it("keeps the search and type filter after the first pick", async () => {
    const user = userEvent.setup();
    const router = renderApp("/team/new");

    const searchInput = await screen.findByLabelText("Search Pokémon");
    await user.type(searchInput, "char");
    await user.click(screen.getByRole("button", { name: "Add Charmander" }));
    await waitFor(() =>
      expect(router.state.location.pathname).not.toBe("/team/new"),
    );

    expect(screen.getByLabelText("Search Pokémon")).toHaveValue("char");
    expect(
      screen.queryByRole("button", { name: "Add Bulbasaur" }),
    ).not.toBeInTheDocument();
  });

  it("shows a toast instead of adding a seventh Pokémon", async () => {
    saveTeams([
      { id: "t1", pokemonIds: [1, 2, 3, 4, 5, 6], createdAt: 1, updatedAt: 1 },
    ]);
    const user = userEvent.setup();
    renderApp("/team/t1");

    const button = await screen.findByRole("button", { name: "Add Squirtle" });
    await user.click(button);

    expect(screen.getByRole("status")).toHaveTextContent("Party's full!");
    expect(loadTeams()[0].pokemonIds).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it.each([
    ["its card", () => screen.getByRole("list", { name: "Pokémon" })],
    [
      "the tray",
      () => screen.getByRole("complementary", { name: "Your team" }),
    ],
  ])("removes a Pokémon from %s", async (_, getContainer) => {
    saveTeams([{ id: "t1", pokemonIds: [1, 4], createdAt: 1, updatedAt: 1 }]);
    const user = userEvent.setup();
    renderApp("/team/t1");
    await screen.findByRole("button", { name: "Add Squirtle" });

    await user.click(
      within(getContainer()).getByRole("button", { name: "Remove Charmander" }),
    );

    expect(loadTeams()[0].pokemonIds).toEqual([1]);
  });

  it("lists a regional form right after its species", async () => {
    const user = userEvent.setup();
    renderApp("/team/new");

    const searchInput = await screen.findByLabelText("Search Pokémon");
    await user.type(searchInput, "554");

    const cards = within(screen.getByRole("list", { name: "Pokémon" }))
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label"));
    expect(cards).toEqual(["Add Darumaka", "Add Galarian Darumaka"]);
  });

  it("filters the grid by search", async () => {
    const user = userEvent.setup();
    renderApp("/team/new");

    const searchInput = await screen.findByLabelText("Search Pokémon");
    await user.type(searchInput, "char");

    expect(
      screen.getByRole("button", { name: "Add Charizard" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add Bulbasaur" }),
    ).not.toBeInTheDocument();
  });

  it("sends an unknown team id back to My teams", async () => {
    const router = renderApp("/team/missing");

    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
  });
});
