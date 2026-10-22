import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../test/renderApp";

const RESULT_PATH = "/simon/result?level=hard&score=12";

describe("simon result page", () => {
  it("shows the shared score", async () => {
    renderApp(RESULT_PATH);

    await expect(
      screen.findByText("in a row · Hard · 9 Pokémon"),
    ).resolves.toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("starts a game on the same level", async () => {
    const user = userEvent.setup();
    const router = renderApp(RESULT_PATH);

    const play = await screen.findByRole("link", { name: "Play this level" });
    await user.click(play);

    expect(router.state.location.pathname).toBe("/simon/play");
    expect(router.state.location.search).toEqual({ level: "hard" });
  });

  it("explains a broken link", async () => {
    renderApp("/simon/result?level=expert&score=3");

    await expect(
      screen.findByRole("heading", { name: "This link doesn't have a result" }),
    ).resolves.toBeInTheDocument();
  });
});
