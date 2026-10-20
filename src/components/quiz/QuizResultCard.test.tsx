import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../test/renderApp";

const RESULT_PATH =
  "/quiz/result?mode=silhouette&clock=attack&score=23&wrong=4&streak=11";

describe("quiz result page", () => {
  it("shows the shared score", async () => {
    renderApp(RESULT_PATH);

    await expect(
      screen.findByText("correct · Silhouette · Time attack"),
    ).resolves.toBeInTheDocument();
    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
  });

  it("copies the result link", async () => {
    const user = userEvent.setup();
    renderApp(RESULT_PATH);

    await user.click(await screen.findByRole("button", { name: "Copy link" }));

    await expect(navigator.clipboard.readText()).resolves.toBe(
      `${window.location.origin}${RESULT_PATH}`,
    );
  });

  it("starts a round with the same mode and clock", async () => {
    const user = userEvent.setup();
    const router = renderApp(RESULT_PATH);

    await user.click(
      await screen.findByRole("link", { name: "Play this mode" }),
    );

    expect(router.state.location.pathname).toBe("/quiz/play");
    expect(router.state.location.search).toEqual({
      mode: "silhouette",
      clock: "attack",
    });
  });

  it.each([
    "/quiz/result",
    "/quiz/result?mode=sprite&clock=60&score=5&wrong=0&streak=9",
    "/quiz/result?mode=shadow&clock=60&score=5&wrong=0&streak=1",
  ])("explains a broken link: %s", async (path) => {
    renderApp(path);

    await expect(
      screen.findByRole("heading", { name: "This link doesn't have a result" }),
    ).resolves.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Play Who's That Pokémon?" }),
    ).toHaveAttribute("href", "/quiz?mode=sprite");
  });
});
