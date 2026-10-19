import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { loadTeams } from "../../lib/team-storage";
import { renderApp } from "../../test/renderApp";
import { regularMembers } from "../../test/members";

describe("shared team", () => {
  it("shows the Pokémon from the link", async () => {
    renderApp("/share?team=1,4");

    await expect(screen.findByText("Bulbasaur")).resolves.toBeInTheDocument();
    expect(screen.getByText("Charmander")).toBeInTheDocument();
  });

  it("saves a remix as a new team and opens it", async () => {
    const user = userEvent.setup();
    const router = renderApp("/share?team=1,4");

    const button = await screen.findByRole("button", {
      name: "Remix this team",
    });
    await user.click(button);

    const [team] = loadTeams();
    expect(team.members).toEqual(regularMembers(1, 4));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/team/${team.id}`),
    );
  });

  it.each(["/share", "/share?team=abc", "/share?team=0,9999"])(
    "explains when %s has no valid team",
    async (path) => {
      renderApp(path);

      await expect(
        screen.findByText("This link doesn't have a team"),
      ).resolves.toBeInTheDocument();
    },
  );

  it("shows a regional form with its species number", async () => {
    renderApp("/share?team=10176");

    await expect(
      screen.findByText("Galarian Darumaka"),
    ).resolves.toBeInTheDocument();
    expect(screen.getByText("#0554")).toBeInTheDocument();
  });

  it("drops ids that aren't in the Pokédex", async () => {
    const user = userEvent.setup();
    renderApp("/share?team=1,10178,9999");

    const button = await screen.findByRole("button", {
      name: "Remix this team",
    });
    await user.click(button);

    expect(loadTeams()[0].members).toEqual(regularMembers(1));
  });

  it("shows and remixes shiny members", async () => {
    const user = userEvent.setup();
    const router = renderApp("/share?team=1s,4");

    const remix = await screen.findByRole("button", {
      name: "Remix this team",
    });
    expect(screen.getAllByText("Shiny")).toHaveLength(1);
    await user.click(remix);

    const [team] = loadTeams();
    expect(team.members).toEqual([
      { pokemonId: 1, shiny: true },
      { pokemonId: 4, shiny: false },
    ]);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/team/${team.id}`),
    );
  });

  it("reads a single-Pokémon link", async () => {
    renderApp("/share?team=7");

    await expect(screen.findByText("Squirtle")).resolves.toBeInTheDocument();
  });
});
