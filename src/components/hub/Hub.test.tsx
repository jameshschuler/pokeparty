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

  it("shows the guessing game as coming soon, not as a link", async () => {
    renderApp("/");

    await screen.findByText("Who's That Pokémon?");

    expect(
      screen.queryByRole("link", { name: /Who's That Pokémon/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Soon")).toBeInTheDocument();
  });
});
