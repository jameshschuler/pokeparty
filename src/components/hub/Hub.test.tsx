import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../test/renderApp";

describe("hub", () => {
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
