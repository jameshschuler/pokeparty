import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  loadPlaythroughs,
  savePlaythroughs,
} from "../../lib/playthrough-storage";
import { renderApp } from "../../test/renderApp";
import type { Playthrough } from "../../types/playthrough";

const emerald: Playthrough = {
  id: "p1",
  gameId: "emerald",
  name: "Nuzlocke #2",
  stints: [
    {
      id: "s1",
      pokemonId: 258,
      shiny: false,
      nickname: null,
      joinedLevel: 5,
      joinedStep: 1,
      updates: [],
      leftLevel: null,
      leftStep: null,
    },
  ],
  createdAt: 1,
  updatedAt: 1,
};

describe("playthrough list", () => {
  it("shows an empty state with no playthroughs", async () => {
    renderApp("/playthroughs");

    await expect(
      screen.findByText("No playthroughs yet"),
    ).resolves.toBeInTheDocument();
  });

  it("lists playthroughs, most recently changed first", async () => {
    savePlaythroughs([
      emerald,
      { ...emerald, id: "p2", gameId: "crystal", name: null, updatedAt: 5 },
    ]);
    renderApp("/playthroughs");

    const links = await screen.findAllByRole("link", { name: /^Open / });
    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "Open Crystal",
      "Open Nuzlocke #2",
    ]);
  });

  it("deletes a playthrough after confirming", async () => {
    savePlaythroughs([emerald]);
    const user = userEvent.setup();
    renderApp("/playthroughs");

    const button = await screen.findByRole("button", {
      name: "Delete Nuzlocke #2",
    });
    await user.click(button);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("No playthroughs yet")).toBeInTheDocument();
    expect(loadPlaythroughs()).toEqual([]);
  });

  it("sends an unknown playthrough back to the list", async () => {
    const router = renderApp("/playthroughs/missing");

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/playthroughs"),
    );
  });
});

describe("new playthrough", () => {
  it("can't start until a game is picked", async () => {
    renderApp("/playthroughs/new");

    await expect(
      screen.findByRole("button", { name: "Pick a game to start" }),
    ).resolves.toBeDisabled();
  });

  it("starts a named playthrough and opens it", async () => {
    const user = userEvent.setup();
    const router = renderApp("/playthroughs/new");

    await user.click(await screen.findByRole("button", { name: "Emerald" }));
    await user.type(screen.getByLabelText("Name (optional)"), "Nuzlocke #2");
    await user.click(screen.getByRole("button", { name: "Start" }));

    const [playthrough] = loadPlaythroughs();
    expect(playthrough).toMatchObject({
      gameId: "emerald",
      name: "Nuzlocke #2",
      stints: [],
    });
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        `/playthroughs/${playthrough.id}`,
      ),
    );
    expect(
      screen.getByRole("heading", { name: "Nuzlocke #2" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No team yet/)).toBeInTheDocument();
  });

  it("titles an unnamed playthrough by its game", async () => {
    const user = userEvent.setup();
    renderApp("/playthroughs/new");

    await user.click(await screen.findByRole("button", { name: "Crystal" }));
    await user.click(screen.getByRole("button", { name: "Start" }));

    await expect(
      screen.findByRole("heading", { name: "Crystal" }),
    ).resolves.toBeInTheDocument();
  });
});
