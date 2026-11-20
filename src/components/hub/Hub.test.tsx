import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../test/renderApp";

describe("hub", () => {
  it("groups the games and the tools under their own headings", async () => {
    renderApp("/");

    const games = await screen.findByRole("region", { name: "Games" });
    const tools = screen.getByRole("region", { name: "Tools" });

    expect(
      within(games).getByRole("link", { name: /Name Drop/ }),
    ).toBeInTheDocument();
    expect(
      within(tools).getByRole("link", { name: /Party Builder/ }),
    ).toBeInTheDocument();
    expect(
      within(games).getByRole("link", { name: /Your scores/ }),
    ).toBeInTheDocument();
    expect(
      within(games).queryByRole("link", { name: /Party Builder/ }),
    ).not.toBeInTheDocument();
  });

  it("opens the Nature Dex from its tile", async () => {
    const user = userEvent.setup();
    const router = renderApp("/");

    const tile = await screen.findByRole("link", { name: /Nature Dex/ });
    await user.click(tile);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/nature-dex"),
    );
  });

  it("opens the Playthrough Timeline from its tile", async () => {
    const user = userEvent.setup();
    const router = renderApp("/");

    const tile = await screen.findByRole("link", {
      name: /Playthrough Timeline/,
    });
    await user.click(tile);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/playthroughs"),
    );
  });

  it("opens Party Builder from its tile", async () => {
    const user = userEvent.setup();
    const router = renderApp("/");

    const tile = await screen.findByRole("link", { name: /Party Builder/ });
    await user.click(tile);

    await waitFor(() => expect(router.state.location.pathname).toBe("/party"));
  });

  it("opens the guessing game from its tile", async () => {
    const user = userEvent.setup();
    const router = renderApp("/");

    const tile = await screen.findByRole("link", {
      name: /Who's That Pokémon/,
    });
    await user.click(tile);

    await waitFor(() => expect(router.state.location.pathname).toBe("/quiz"));
  });
});
