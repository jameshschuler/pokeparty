import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEX_RUN_ANSWER_MS, DEX_RUN_MISS_REVEAL_MS } from "../../lib/dex-run";
import { loadRuns, saveRuns } from "../../lib/leaderboard";
import { FEEDBACK_MS } from "../../lib/quiz";
import { renderApp } from "../../test/renderApp";

function choiceButtons() {
  return within(screen.getByRole("list")).getAllByRole("button");
}

function spriteId(button: HTMLElement) {
  return button
    .querySelector("img")!
    .getAttribute("src")!
    .match(/(\d+)\.png$/)![1];
}

async function showQuestion() {
  await screen.findByRole("list");
  for (const button of choiceButtons()) {
    fireEvent.load(button.querySelector("img")!);
  }
}

function answer(right: boolean) {
  const number = Number(
    screen.getByLabelText("Dex number").textContent!.replace("#", ""),
  );
  const button = choiceButtons().find(
    (choice) => (Number(spriteId(choice)) === number) === right,
  )!;
  fireEvent.click(button);
}

describe("dex run", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is on the hub", async () => {
    renderApp("/");

    await expect(
      screen.findByRole("link", { name: /Dex Run/ }),
    ).resolves.toHaveAttribute("href", "/dex-run");
  });

  it("offers the National Dex and every generation, with your best", async () => {
    saveRuns([
      {
        game: "dex-run",
        range: 1,
        score: 42,
        wrong: 3,
        reached: 45,
        playedAt: 1,
      },
    ]);
    renderApp("/dex-run");

    const list = await screen.findByRole("list", { name: "Dex" });
    const options = within(list).getAllByRole("link");

    expect(options).toHaveLength(10);
    expect(options[0]).toHaveTextContent("National Dex");
    expect(options[1]).toHaveTextContent("Gen 1 · Kanto");
    expect(options[1]).toHaveTextContent("Best 42");
    expect(options[1]).toHaveAttribute("href", "/dex-run/play?range=1");
  });

  it("hides the number until the sprites load, then starts at the range's first", async () => {
    renderApp("/dex-run/play?range=2");
    await screen.findByRole("list");

    expect(screen.getByLabelText("Dex number")).toHaveTextContent("#????");

    await showQuestion();

    expect(screen.getByLabelText("Dex number")).toHaveTextContent("#0152");
    expect(screen.getByLabelText("Progress")).toHaveTextContent("1 / 100");
  });

  it("moves to the next number after a right answer", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/dex-run/play?range=1");
    await showQuestion();

    answer(true);
    act(() => vi.advanceTimersByTime(FEEDBACK_MS));
    await showQuestion();

    expect(screen.getByLabelText("Dex number")).toHaveTextContent("#0002");
    expect(
      screen.getByRole("img", { name: "3 of 3 lives left" }),
    ).toBeInTheDocument();
  });

  it("takes a life for a wrong answer and shows the right one", async () => {
    renderApp("/dex-run/play?range=1");
    await showQuestion();

    answer(false);

    expect(
      screen.getByRole("img", { name: "2 of 3 lives left" }),
    ).toBeInTheDocument();
    expect(screen.getByText("#0001 is Bulbasaur!")).toBeInTheDocument();
  });

  it("takes a life when time runs out", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/dex-run/play?range=1");
    await showQuestion();

    act(() => vi.advanceTimersByTime(DEX_RUN_ANSWER_MS));

    expect(
      screen.getByText("Too slow! #0001 is Bulbasaur!"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "2 of 3 lives left" }),
    ).toBeInTheDocument();
  });

  it("still times out when the timer fires a moment early", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/dex-run/play?range=1");
    await showQuestion();

    act(() => vi.advanceTimersByTime(DEX_RUN_ANSWER_MS - 1));
    vi.setSystemTime(Date.now() - 5);
    act(() => vi.advanceTimersByTime(1));

    expect(
      screen.getByText("Too slow! #0001 is Bulbasaur!"),
    ).toBeInTheDocument();
  });

  it("ends after three misses, saves the score and can start again", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/dex-run/play?range=1");
    await showQuestion();
    answer(true);
    act(() => vi.advanceTimersByTime(FEEDBACK_MS));

    for (let miss = 0; miss < 3; miss++) {
      await showQuestion();
      answer(false);
      act(() => vi.advanceTimersByTime(DEX_RUN_MISS_REVEAL_MS));
    }

    expect(
      screen.getByRole("heading", { name: "Out of lives!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("named · Gen 1 · Kanto")).toBeInTheDocument();
    expect(screen.getByText("Reached #0004 of #0151")).toBeInTheDocument();
    expect(screen.getByText("New best!")).toBeInTheDocument();
    expect(loadRuns()).toEqual([
      expect.objectContaining({ game: "dex-run", range: 1, score: 1 }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    await showQuestion();

    expect(screen.getByLabelText("Dex number")).toHaveTextContent("#0001");
  });

  it("quits back to the dex picker", async () => {
    const user = userEvent.setup();
    const router = renderApp("/dex-run/play?range=1");

    const quit = await screen.findByRole("button", { name: "Quit" });
    await user.click(quit);
    await user.click(screen.getByRole("link", { name: "Quit" }));

    expect(router.state.location.pathname).toBe("/dex-run");
    expect(loadRuns()).toEqual([]);
  });
});
