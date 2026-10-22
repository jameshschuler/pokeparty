import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../test/renderApp";

const RESULT_PATH = "/match/result?level=hard&flips=30&timeMs=95000";

describe("match result page", () => {
  it("shows the shared flips and time", async () => {
    renderApp(RESULT_PATH);

    await expect(
      screen.findByText("flips · Hard · 12 pairs"),
    ).resolves.toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("Time 1:35")).toBeInTheDocument();
  });

  it("starts a game on the same level", async () => {
    const user = userEvent.setup();
    const router = renderApp(RESULT_PATH);

    const play = await screen.findByRole("link", { name: "Play this level" });
    await user.click(play);

    expect(router.state.location.pathname).toBe("/match/play");
    expect(router.state.location.search).toEqual({ level: "hard" });
  });

  it("explains a broken link", async () => {
    renderApp("/match/result?level=hard&flips=3&timeMs=1000");

    await expect(
      screen.findByRole("heading", { name: "This link doesn't have a result" }),
    ).resolves.toBeInTheDocument();
  });
});
