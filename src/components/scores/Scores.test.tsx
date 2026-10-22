import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadRuns, saveRuns, type QuizRun } from "../../lib/leaderboard";
import { findPokemon } from "../../lib/pokedex";
import { formatPokemonLabel } from "../../lib/pokemon";
import { FEEDBACK_MS } from "../../lib/quiz";
import { renderApp } from "../../test/renderApp";

function run(score: number, wrong: number, playedAt: number): QuizRun {
  return {
    game: "quiz",
    mode: "sprite",
    clock: 60,
    score,
    wrong,
    streak: 0,
    playedAt,
  };
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

describe("your scores", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("says when a board has no runs yet", async () => {
    renderApp("/scores/quiz?mode=dex&clock=attack");

    await expect(screen.findByText("No runs yet")).resolves.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Play Dex number · Time attack" }),
    ).toHaveAttribute("href", "/quiz/play?mode=dex&clock=attack");
  });

  it("lists the board's runs best first", async () => {
    saveRuns([run(4, 0, 1), run(9, 3, 2), { ...run(20, 0, 3), clock: 30 }]);
    renderApp("/scores/quiz?mode=sprite&clock=60");

    const list = await screen.findByRole("list", { name: "Top runs" });
    const rows = within(list).getAllByRole("listitem");

    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringMatching(/^#19/),
      expect.stringMatching(/^#24/),
    ]);
  });

  it("switches boards with the mode and clock chips", async () => {
    const user = userEvent.setup();
    const router = renderApp("/scores/quiz?mode=sprite&clock=60");

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

  it("is a tile on the hub that opens the quiz board", async () => {
    const user = userEvent.setup();
    const router = renderApp("/");

    const tile = await screen.findByRole("link", { name: /Your scores/ });
    await user.click(tile);

    expect(router.state.location.pathname).toBe("/scores/quiz");
    expect(router.state.location.search).toEqual({ mode: "sprite", clock: 60 });
    expect(
      screen.getByRole("link", { name: "Who's That Pokémon?" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("switches to the Dex Run boards", async () => {
    saveRuns([
      {
        game: "dex-run",
        range: 1,
        score: 42,
        wrong: 3,
        reached: 45,
        playedAt: 1,
      },
      {
        game: "dex-run",
        range: "national",
        score: 9,
        wrong: 3,
        reached: 12,
        playedAt: 2,
      },
    ]);
    const user = userEvent.setup();
    const router = renderApp("/scores/quiz?mode=sprite&clock=60");

    const tab = await screen.findByRole("link", { name: "Dex Run" });
    await user.click(tab);
    const kanto = await screen.findByRole("button", { name: "Gen 1 · Kanto" });
    await user.click(kanto);

    expect(router.state.location.search).toEqual({ range: 1 });
    const rows = within(
      screen.getByRole("list", { name: "Top runs" }),
    ).getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Reached #0045 · 3 missed");
  });

  it("has a Simon tab with a board per level", async () => {
    saveRuns([
      { game: "simon", level: "hard", score: 9, playedAt: 1 },
      { game: "simon", level: "easy", score: 4, playedAt: 2 },
    ]);
    const user = userEvent.setup();
    renderApp("/scores/quiz?mode=sprite&clock=60");

    const tab = await screen.findByRole("link", { name: "Simon" });
    await user.click(tab);
    const hard = await screen.findByRole("button", {
      name: "Hard · 9 Pokémon",
    });
    await user.click(hard);

    const rows = within(
      screen.getByRole("list", { name: "Top runs" }),
    ).getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent(/^#19in a row/);
  });

  it("has a Match tab ranked by fewest flips", async () => {
    saveRuns([
      { game: "match", level: "easy", flips: 18, timeMs: 20_000, playedAt: 1 },
      { game: "match", level: "easy", flips: 14, timeMs: 65_000, playedAt: 2 },
    ]);
    const user = userEvent.setup();
    renderApp("/scores/quiz?mode=sprite&clock=60");

    const tab = await screen.findByRole("link", { name: "Match" });
    await user.click(tab);

    const list = await screen.findByRole("list", { name: "Top runs" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringMatching(/^#114flips · 1:05/),
      expect.stringMatching(/^#218flips · 0:20/),
    ]);
  });

  it("links an empty Dex Run board to that dex", async () => {
    renderApp("/scores/dex-run?range=4");

    await expect(
      screen.findByRole("link", { name: "Play Gen 4 · Sinnoh" }),
    ).resolves.toHaveAttribute("href", "/dex-run/play?range=4");
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
