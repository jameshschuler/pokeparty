import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../test/renderApp";

const RESULT_PATH = "/dex-run/result?range=1&score=42&wrong=3&reached=43";

describe("dex run result page", () => {
  it("shows the shared run", async () => {
    renderApp(RESULT_PATH);

    await expect(
      screen.findByText("named · Gen 1 · Kanto"),
    ).resolves.toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Reached #0043 of #0151")).toBeInTheDocument();
  });

  it("says when the shared run cleared the dex", async () => {
    renderApp("/dex-run/result?range=1&score=150&wrong=1&reached=151");

    await expect(
      screen.findByText("Cleared all 151!"),
    ).resolves.toBeInTheDocument();
  });

  it("copies the result link", async () => {
    const user = userEvent.setup();
    renderApp(RESULT_PATH);

    const copy = await screen.findByRole("button", { name: "Copy link" });
    await user.click(copy);

    await expect(navigator.clipboard.readText()).resolves.toBe(
      `${window.location.origin}${RESULT_PATH}`,
    );
  });

  it("starts a run on the same dex", async () => {
    const user = userEvent.setup();
    const router = renderApp(RESULT_PATH);

    const play = await screen.findByRole("link", { name: "Play this dex" });
    await user.click(play);

    expect(router.state.location.pathname).toBe("/dex-run/play");
    expect(router.state.location.search).toEqual({ range: 1 });
  });

  it.each([
    "/dex-run/result",
    "/dex-run/result?range=1&score=50&wrong=3&reached=43",
    "/dex-run/result?range=1&score=5&wrong=0&reached=43",
  ])("explains a broken link: %s", async (path) => {
    renderApp(path);

    await expect(
      screen.findByRole("heading", { name: "This link doesn't have a result" }),
    ).resolves.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play Dex Run" })).toHaveAttribute(
      "href",
      "/dex-run",
    );
  });
});
