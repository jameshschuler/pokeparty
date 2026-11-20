import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  loadPlaythroughs,
  savePlaythroughs,
} from "../../lib/playthrough-storage";
import type { GameId } from "../../lib/games";
import { renderApp } from "../../test/renderApp";
import type { Playthrough, TeamStint } from "../../types/playthrough";

function stint(id: string, pokemonId: number, step: number): TeamStint {
  return {
    id,
    pokemonId,
    shiny: false,
    nickname: null,
    joinedLevel: 20,
    joinedStep: step,
    updates: [],
    leftLevel: null,
    leftStep: null,
  };
}

function seed(stints: TeamStint[], gameId: GameId = "red-blue") {
  const playthrough: Playthrough = {
    id: "p1",
    gameId,
    name: null,
    stints,
    createdAt: 1,
    updatedAt: 1,
  };
  savePlaythroughs([playthrough]);
}

function storedStints() {
  return loadPlaythroughs()[0].stints;
}

async function pick(user: ReturnType<typeof userEvent.setup>, name: string) {
  const search = await screen.findByLabelText("Search Pokémon");
  await user.type(search, name);
  await user.click(screen.getByRole("button", { name: `Pick ${name}` }));

  return screen.getByRole("dialog");
}

describe("playthrough", () => {
  it("adds the first Pokémon with a nickname", async () => {
    seed([]);
    const user = userEvent.setup();
    const router = renderApp("/playthroughs/p1");

    await user.click(await screen.findByRole("link", { name: "Add Pokémon" }));
    const dialog = await pick(user, "Squirtle");
    await user.type(
      within(dialog).getByLabelText("Level it joined at (optional)"),
      "5",
    );
    await user.type(
      within(dialog).getByLabelText("Nickname (optional)"),
      "Shellby",
    );
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/playthroughs/p1"),
    );
    expect(storedStints()).toEqual([
      expect.objectContaining({
        pokemonId: 7,
        nickname: "Shellby",
        joinedLevel: 5,
        joinedStep: 1,
      }),
    ]);
    expect(
      screen.getByRole("link", { name: "Swap out Shellby" }),
    ).toBeInTheDocument();

    router.history.back();
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/playthroughs/p1"),
    );
  });

  it("adds a Pokémon without a level and fills it in later", async () => {
    seed([]);
    const user = userEvent.setup();
    renderApp("/playthroughs/p1/pick");

    const dialog = await pick(user, "Squirtle");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    const fix = await screen.findByRole("button", {
      name: "Fix the level: Squirtle joined at no level",
    });
    expect(fix).toHaveTextContent("Lv ?");
    expect(storedStints()[0].joinedLevel).toBeNull();

    await user.click(fix);
    const fixDialog = screen.getByRole("dialog", {
      name: "Squirtle joined at…",
    });
    await user.type(within(fixDialog).getByLabelText("Level"), "8");
    await user.click(within(fixDialog).getByRole("button", { name: "Save" }));

    expect(storedStints()[0].joinedLevel).toBe(8);
  });

  it("keeps the dialog open and explains a bad level", async () => {
    seed([]);
    const user = userEvent.setup();
    renderApp("/playthroughs/p1/pick");

    const dialog = await pick(user, "Squirtle");
    await user.type(
      within(dialog).getByLabelText("Level it joined at (optional)"),
      "101",
    );
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Levels go from 1 to 100.",
    );
    expect(storedStints()).toEqual([]);
  });

  it("records a swap as one step", async () => {
    seed([stint("rat", 20, 1)]);
    const user = userEvent.setup();
    const router = renderApp("/playthroughs/p1");

    await user.click(
      await screen.findByRole("link", { name: "Swap out Raticate" }),
    );
    const dialog = await pick(user, "Growlithe");
    const leftLevel = within(dialog).getByLabelText("Level Raticate left at");
    expect(leftLevel).toHaveValue("20");
    await user.clear(leftLevel);
    await user.type(leftLevel, "32");
    await user.type(
      within(dialog).getByLabelText("Level it joined at (optional)"),
      "30",
    );
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/playthroughs/p1"),
    );
    expect(storedStints()).toEqual([
      expect.objectContaining({ pokemonId: 20, leftLevel: 32, leftStep: 2 }),
      expect.objectContaining({
        pokemonId: 58,
        joinedLevel: 30,
        joinedStep: 2,
      }),
    ]);
    expect(
      screen.getByRole("button", { name: "Undo step 2" }),
    ).toBeInTheDocument();
  });

  it("removes a member at its current level", async () => {
    seed([stint("rat", 20, 1)]);
    const user = userEvent.setup();
    renderApp("/playthroughs/p1");

    await user.click(
      await screen.findByRole("button", { name: "Remove Raticate" }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Remove Raticate from the team",
    });
    const level = within(dialog).getByLabelText("Level Raticate left at");
    expect(level).toHaveValue("20");
    await user.clear(level);
    await user.type(level, "25");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(screen.getByText(/Everyone has left the team/)).toBeInTheDocument();
    expect(storedStints()[0]).toMatchObject({ leftLevel: 25, leftStep: 2 });
    expect(
      screen.getByRole("button", {
        name: "Fix the level: Raticate left at Lv 25",
      }),
    ).toBeInTheDocument();
  });

  it("won't remove a member below its join level", async () => {
    seed([stint("rat", 20, 1)]);
    const user = userEvent.setup();
    renderApp("/playthroughs/p1");

    await user.click(
      await screen.findByRole("button", { name: "Remove Raticate" }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Remove Raticate from the team",
    });
    const level = within(dialog).getByLabelText("Level Raticate left at");
    await user.clear(level);
    await user.type(level, "12");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "can't drop below an earlier level",
    );
    expect(storedStints()[0].leftStep).toBeNull();
  });

  it("undoes the latest step", async () => {
    seed([stint("a", 1, 1), stint("b", 4, 2)]);
    const user = userEvent.setup();
    renderApp("/playthroughs/p1");

    await user.click(
      await screen.findByRole("button", { name: "Undo step 2" }),
    );

    expect(storedStints()).toEqual([stint("a", 1, 1)]);
    expect(
      screen.getByRole("button", { name: "Undo step 1" }),
    ).toBeInTheDocument();
  });

  it("fixes a level from the timeline", async () => {
    seed([stint("a", 1, 1)]);
    const user = userEvent.setup();
    renderApp("/playthroughs/p1");

    await user.click(
      await screen.findByRole("button", {
        name: "Fix the level: Bulbasaur joined at Lv 20",
      }),
    );
    const dialog = screen.getByRole("dialog", { name: "Bulbasaur joined at…" });
    const input = within(dialog).getByLabelText("Level");
    await user.clear(input);
    await user.type(input, "18");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(storedStints()[0].joinedLevel).toBe(18);
    expect(
      screen.getByRole("button", {
        name: "Fix the level: Bulbasaur joined at Lv 18",
      }),
    ).toBeInTheDocument();
  });

  it("records an evolution and shows the new form", async () => {
    seed([{ ...stint("zap", 239, 1), joinedLevel: 12 }], "gold-silver");
    const user = userEvent.setup();
    renderApp("/playthroughs/p1");

    await user.click(
      await screen.findByRole("button", { name: "Update Elekid" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Update Elekid" });
    const level = within(dialog).getByLabelText("Level now");
    await user.clear(level);
    await user.type(level, "30");
    await user.click(
      within(dialog).getByRole("button", { name: "Electabuzz" }),
    );
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(storedStints()[0].updates).toEqual([
      { step: 2, level: 30, pokemonId: 125 },
    ]);
    expect(
      screen.getByRole("button", { name: "Update Electabuzz" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Fix the level: Elekid evolved at Lv 30",
      }),
    ).toBeInTheDocument();
  });

  it("only offers evolutions the game has", async () => {
    seed([stint("buzz", 125, 1)], "gold-silver");
    const user = userEvent.setup();
    renderApp("/playthroughs/p1");

    await user.click(
      await screen.findByRole("button", { name: "Update Electabuzz" }),
    );

    expect(
      within(screen.getByRole("dialog")).getByText(
        "Electabuzz doesn't evolve any further.",
      ),
    ).toBeInTheDocument();
  });

  it("asks for a change before saving an update", async () => {
    seed([stint("zap", 239, 1)]);
    const user = userEvent.setup();
    renderApp("/playthroughs/p1");

    await user.click(
      await screen.findByRole("button", { name: "Update Elekid" }),
    );
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Change the level or pick an evolution.",
    );
  });

  it("lists the chosen game's Pokémon in its Pokédex order", async () => {
    seed([], "crystal");
    renderApp("/playthroughs/p1/pick");

    const grid = await screen.findByRole("list", { name: "Pokémon" });
    const first = within(grid).getAllByRole("button")[0];

    expect(first).toHaveAccessibleName("Pick Chikorita");
  });

  it("shows only the chosen game's Pokémon", async () => {
    seed([], "emerald");
    const user = userEvent.setup();
    renderApp("/playthroughs/p1/pick");

    const search = await screen.findByLabelText("Search Pokémon");
    await user.type(search, "Bulbasaur");

    expect(
      screen.getByText("No Pokémon in Emerald match that search."),
    ).toBeInTheDocument();
  });

  it("blocks adding a seventh member", async () => {
    seed(
      [1, 4, 7, 25, 133, 143].map((id, index) =>
        stint(`s${id}`, id, index + 1),
      ),
    );
    const router = renderApp("/playthroughs/p1");

    await expect(
      screen.findByText("Swap someone out first."),
    ).resolves.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Add Pokémon" }),
    ).not.toBeInTheDocument();

    await router.navigate({
      to: "/playthroughs/$playthroughId/pick",
      params: { playthroughId: "p1" },
    });
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/playthroughs/p1"),
    );
  });
});
