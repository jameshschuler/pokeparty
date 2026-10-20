import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { loadTeams, saveTeams } from "../../lib/team-storage";
import { renderApp } from "../../test/renderApp";
import { regularMembers } from "../../test/members";

describe("team builder", () => {
  it("saves a new team on the first pick and moves to its URL", async () => {
    const user = userEvent.setup();
    const router = renderApp("/team/new");

    const button = await screen.findByRole("button", { name: "Add Bulbasaur" });
    await user.click(button);

    const [team] = loadTeams();
    expect(team.members).toEqual(regularMembers(1));
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
    expect(teams[0].members).toEqual(regularMembers(1, 4));
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
      {
        id: "t1",
        members: regularMembers(1, 2, 3, 4, 5, 6),
        createdAt: 1,
        updatedAt: 1,
      },
    ]);
    const user = userEvent.setup();
    renderApp("/team/t1");

    const button = await screen.findByRole("button", { name: "Add Squirtle" });
    await user.click(button);

    expect(screen.getByRole("status")).toHaveTextContent("Party's full!");
    expect(loadTeams()[0].members).toEqual(regularMembers(1, 2, 3, 4, 5, 6));
  });

  it.each([
    ["its card", () => screen.getByRole("list", { name: "Pokémon" })],
    [
      "the tray",
      () => screen.getByRole("complementary", { name: "Your team" }),
    ],
  ])("removes a Pokémon from %s", async (_, getContainer) => {
    saveTeams([
      { id: "t1", members: regularMembers(1, 4), createdAt: 1, updatedAt: 1 },
    ]);
    const user = userEvent.setup();
    renderApp("/team/t1");
    await screen.findByRole("button", { name: "Add Squirtle" });

    await user.click(
      within(getContainer()).getByRole("button", { name: "Remove Charmander" }),
    );

    expect(loadTeams()[0].members).toEqual(regularMembers(1));
  });

  it("makes a team member shiny and back", async () => {
    saveTeams([
      { id: "t1", members: regularMembers(4), createdAt: 1, updatedAt: 1 },
    ]);
    const user = userEvent.setup();
    renderApp("/team/t1");

    const shinyToggle = await screen.findByRole("button", {
      name: "Shiny Charmander",
    });
    await user.click(shinyToggle);

    expect(shinyToggle).toHaveAttribute("aria-pressed", "true");
    expect(loadTeams()[0].members).toEqual([{ pokemonId: 4, shiny: true }]);
    expect(
      screen.getAllByRole("button", { name: "Remove shiny Charmander" }),
    ).toHaveLength(2);

    await user.click(shinyToggle);

    expect(loadTeams()[0].members).toEqual(regularMembers(4));
  });

  it("only offers shiny for Pokémon on the team", async () => {
    saveTeams([
      { id: "t1", members: regularMembers(4), createdAt: 1, updatedAt: 1 },
    ]);
    renderApp("/team/t1");

    await screen.findByRole("button", { name: "Shiny Charmander" });

    expect(
      screen.queryByRole("button", { name: "Shiny Bulbasaur" }),
    ).not.toBeInTheDocument();
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

  function gridLabels() {
    return within(screen.getByRole("list", { name: "Pokémon" }))
      .getAllByRole("button", { pressed: false })
      .map((button) => button.getAttribute("aria-label"));
  }

  it("shows only legendaries with the Legendary chip", async () => {
    const user = userEvent.setup();
    renderApp("/team/new");

    const legendary = await screen.findByRole("button", { name: "Legendary" });
    await user.click(legendary);

    expect(gridLabels().slice(0, 4)).toEqual([
      "Add Articuno",
      "Add Galarian Articuno",
      "Add Zapdos",
      "Add Galarian Zapdos",
    ]);
    expect(
      screen.queryByRole("button", { name: "Add Bulbasaur" }),
    ).not.toBeInTheDocument();
  });

  it("filters by region, counting regional forms in their region", async () => {
    const user = userEvent.setup();
    renderApp("/team/new");

    const searchInput = await screen.findByLabelText("Search Pokémon");
    await user.type(searchInput, "darumaka");
    await user.click(screen.getByRole("button", { name: "galar" }));

    expect(gridLabels()).toEqual(["Add Galarian Darumaka"]);

    await user.click(screen.getByRole("button", { name: "unova" }));

    expect(gridLabels()).toEqual(["Add Darumaka"]);
  });

  it("picks alternate forms like Origin Giratina", async () => {
    const user = userEvent.setup();
    renderApp("/team/new");

    const searchInput = await screen.findByLabelText("Search Pokémon");
    await user.type(searchInput, "giratina");
    await user.click(
      screen.getByRole("button", { name: "Add Giratina (Origin Forme)" }),
    );

    expect(loadTeams()[0].members).toEqual(regularMembers(10007));
  });

  it("adds picks as shiny in shiny mode", async () => {
    const user = userEvent.setup();
    renderApp("/team/new");

    const shinyMode = await screen.findByRole("button", { name: "Shiny mode" });
    await user.click(shinyMode);
    await user.click(
      screen.getByRole("button", { name: "Add shiny Bulbasaur" }),
    );

    expect(shinyMode).toHaveAttribute("aria-pressed", "true");
    expect(loadTeams()[0].members).toEqual([{ pokemonId: 1, shiny: true }]);
  });

  it("keeps existing members' colors when shiny mode changes", async () => {
    saveTeams([
      { id: "t1", members: regularMembers(4), createdAt: 1, updatedAt: 1 },
    ]);
    const user = userEvent.setup();
    renderApp("/team/t1");

    const shinyMode = await screen.findByRole("button", { name: "Shiny mode" });
    await user.click(shinyMode);

    expect(
      screen.getAllByRole("button", { name: "Remove Charmander" }),
    ).toHaveLength(2);
    expect(loadTeams()[0].members).toEqual(regularMembers(4));
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

  it("goes back to My teams with Done", async () => {
    saveTeams([
      { id: "t1", members: regularMembers(4), createdAt: 1, updatedAt: 1 },
    ]);
    const user = userEvent.setup();
    const router = renderApp("/team/t1");

    const done = await screen.findByRole("link", { name: "Done" });
    await user.click(done);

    await waitFor(() => expect(router.state.location.pathname).toBe("/party"));
  });

  it("sends an unknown team id back to My teams", async () => {
    const router = renderApp("/team/missing");

    await waitFor(() => expect(router.state.location.pathname).toBe("/party"));
  });
});
