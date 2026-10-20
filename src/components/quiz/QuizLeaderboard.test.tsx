import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadRuns, saveRuns, type QuizRun } from "../../lib/leaderboard";
import { findPokemon } from "../../lib/pokedex";
import { formatPokemonLabel } from "../../lib/pokemon";
import { FEEDBACK_MS } from "../../lib/quiz";
import { renderApp } from "../../test/renderApp";

function run(score: number, wrong: number, playedAt: number): QuizRun {
  return { mode: "sprite", clock: 60, score, wrong, streak: 0, playedAt };
}

async function showQuestion() {
  const sprite = await screen.findByRole("img", { name: "Mystery Pokémon" });
  fireEvent.load(sprite);

  return sprite;
}

async function playRound(seconds: number, rightAnswers: number) {
  for (let answered = 0; answered < rightAnswers; answered++) {
    const sprite = await showQuestion();
    const id = Number(sprite.getAttribute("src")!.match(/(\d+)\.png$/)![1]);
    const name = formatPokemonLabel(findPokemon(id)!);
    fireEvent.click(screen.getByRole("button", { name }));
    act(() => vi.advanceTimersByTime(FEEDBACK_MS));
  }
  await showQuestion();
  act(() => vi.advanceTimersByTime(seconds * 1000 + 200));
}

describe("personal leaderboard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("says when a board has no runs yet", async () => {
    renderApp("/quiz/leaderboard?mode=dex&clock=attack");

    await expect(screen.findByText("No runs yet")).resolves.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Play Dex number · Time attack" }),
    ).toHaveAttribute("href", "/quiz/play?mode=dex&clock=attack");
  });

  it("lists the board's runs best first", async () => {
    saveRuns([run(4, 0, 1), run(9, 3, 2), { ...run(20, 0, 3), clock: 30 }]);
    renderApp("/quiz/leaderboard?mode=sprite&clock=60");

    const list = await screen.findByRole("list", { name: "Top runs" });
    const rows = within(list).getAllByRole("listitem");

    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringMatching(/^#19/),
      expect.stringMatching(/^#24/),
    ]);
  });

  it("switches boards with the mode and clock chips", async () => {
    const user = userEvent.setup();
    const router = renderApp("/quiz/leaderboard?mode=sprite&clock=60");

    const region = await screen.findByRole("button", { name: "Region" });
    await user.click(region);
    await user.click(screen.getByRole("button", { name: "Time attack" }));

    expect(router.state.location.search).toEqual({
      mode: "region",
      clock: "attack",
    });
    expect(screen.getByRole("button", { name: "Time attack" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows your best under each clock on the setup screen", async () => {
    saveRuns([run(4, 0, 1), run(9, 3, 2), { ...run(7, 0, 3), mode: "dex" }]);
    renderApp("/quiz?mode=sprite");

    await expect(
      screen.findByRole("link", { name: /^60s/ }),
    ).resolves.toHaveTextContent("Best 9");
    expect(screen.getByRole("link", { name: /^30s/ })).toHaveTextContent(
      "Best –",
    );
  });

  it("picks up runs saved in another tab", async () => {
    renderApp("/quiz?mode=sprite");
    const sixty = await screen.findByRole("link", { name: /^60s/ });

    saveRuns([run(12, 0, 1)]);
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "pokeparty:quiz-runs" }),
      );
    });

    expect(sixty).toHaveTextContent("Best 12");
  });

  it("saves each finished round once and says where it landed", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?mode=sprite&clock=30");

    await playRound(30, 2);

    expect(screen.getByText("New best!")).toBeInTheDocument();
    expect(loadRuns()).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    await playRound(30, 1);

    expect(screen.getByText("#2 on your board")).toBeInTheDocument();
    expect(loadRuns()).toHaveLength(2);
  });

  it("doesn't save or rank a round with no right answers", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?mode=sprite&clock=30");

    await playRound(30, 0);

    expect(
      screen.getByRole("heading", { name: "Time's up!" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("New best!")).not.toBeInTheDocument();
    expect(loadRuns()).toEqual([]);
  });

  it("doesn't save again when another tab changes the board", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?mode=sprite&clock=30");
    await playRound(30, 1);

    localStorage.clear();
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: null }));
    });

    expect(loadRuns()).toEqual([]);
  });

  it("doesn't save a round you quit", async () => {
    const user = userEvent.setup();
    renderApp("/quiz/play?mode=sprite&clock=30");

    const quit = await screen.findByRole("button", { name: "Quit" });
    await user.click(quit);
    await user.click(screen.getByRole("link", { name: "Quit" }));

    expect(loadRuns()).toEqual([]);
  });
});
