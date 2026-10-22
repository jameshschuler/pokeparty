import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadRuns, saveRuns } from "../../lib/leaderboard";
import { MATCH_MISS_MS } from "../../lib/match";
import { renderApp } from "../../test/renderApp";

function cards(): HTMLElement[] {
  return within(screen.getByRole("list", { name: "Cards" })).getAllByRole(
    "button",
  );
}

function spriteId(card: HTMLElement): string {
  return card.querySelector("img")!.getAttribute("src")!;
}

async function loadBoard() {
  await screen.findByRole("list", { name: "Cards" });
  for (const card of cards()) {
    fireEvent.load(card.querySelector("img")!);
  }
}

function pairIndexes(): number[][] {
  const byId = new Map<string, number[]>();
  cards().forEach((card, index) => {
    byId.set(spriteId(card), [...(byId.get(spriteId(card)) ?? []), index]);
  });

  return [...byId.values()];
}

function setHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", {
    value: hidden,
    configurable: true,
  });
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

function flip(index: number) {
  fireEvent.click(cards()[index]);
}

function playPerfectGame() {
  for (const [first, second] of pairIndexes()) {
    flip(first);
    flip(second);
  }
}

describe("pokémon match", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is on the hub", async () => {
    renderApp("/");

    await expect(
      screen.findByRole("link", { name: /Pokémon Match/ }),
    ).resolves.toHaveAttribute("href", "/match");
  });

  it("offers three levels with your best", async () => {
    saveRuns([
      {
        game: "match",
        level: "medium",
        flips: 20,
        timeMs: 30_000,
        playedAt: 1,
      },
    ]);
    renderApp("/match");

    const list = await screen.findByRole("list", { name: "Level" });
    const options = within(list).getAllByRole("link");

    expect(options.map((option) => option.textContent)).toEqual([
      "Easy · 6 pairsBest –",
      "Medium · 8 pairsBest 20 flips",
      "Hard · 12 pairsBest –",
    ]);
  });

  it.each([
    ["easy", 12],
    ["medium", 16],
    ["hard", 24],
  ])("deals a %s board of %s face-down cards", async (level, count) => {
    renderApp(`/match/play?level=${level}`);
    await loadBoard();

    expect(cards()).toHaveLength(count);
    expect(cards()[0]).toHaveAccessibleName("Card 1");
  });

  it("doesn't let cards be flipped before the sprites load", async () => {
    renderApp("/match/play?level=easy");
    await screen.findByRole("list", { name: "Cards" });

    expect(cards().every((card) => card.hasAttribute("disabled"))).toBe(true);
  });

  it("keeps a matched pair face up", async () => {
    renderApp("/match/play?level=easy");
    await loadBoard();
    const [[first, second]] = pairIndexes();

    flip(first);
    flip(second);

    expect(cards()[first]).toHaveAccessibleName(/, matched$/);
    expect(cards()[second]).toBeDisabled();
    expect(screen.getByText("1/6")).toBeInTheDocument();
  });

  it("turns a miss back over after a moment", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/match/play?level=easy");
    await loadBoard();
    const [[a], [b]] = pairIndexes();

    flip(a);
    flip(b);

    expect(cards()[a]).not.toHaveAccessibleName("Card " + (a + 1));

    act(() => vi.advanceTimersByTime(MATCH_MISS_MS));

    expect(cards()[a]).toHaveAccessibleName(`Card ${a + 1}`);
    expect(cards()[b]).toHaveAccessibleName(`Card ${b + 1}`);
  });

  it("finishes a perfect game, saves it and links to share it", async () => {
    renderApp("/match/play?level=easy");
    await loadBoard();

    playPerfectGame();

    expect(
      screen.getByRole("heading", { name: "All pairs found!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("New best!")).toBeInTheDocument();
    expect(screen.getByText("flips · Easy · 6 pairs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Share result" })).toHaveAttribute(
      "href",
      expect.stringMatching(
        /^\/match\/result\?level=easy&flips=12&timeMs=\d+$/,
      ),
    );
    expect(loadRuns()).toEqual([
      expect.objectContaining({ game: "match", level: "easy", flips: 12 }),
    ]);
  });

  it("lets a missed card be tapped again during the miss", async () => {
    renderApp("/match/play?level=easy");
    await loadBoard();
    const [[a, aTwin], [b]] = pairIndexes();
    flip(a);
    flip(b);

    flip(a);
    flip(aTwin);

    expect(cards()[a]).toHaveAccessibleName(/, matched$/);
  });

  it("pauses the clock while the tab is hidden", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/match/play?level=easy");
    await loadBoard();
    flip(0);
    act(() => vi.advanceTimersByTime(2_000));

    setHidden(true);
    act(() => vi.advanceTimersByTime(120_000));
    setHidden(false);
    act(() => vi.advanceTimersByTime(1_000));

    expect(screen.getByRole("timer")).toHaveTextContent("0:03");
  });

  it("offers other Pokémon when a sprite won't load", async () => {
    renderApp("/match/play?level=easy");
    await screen.findByRole("list", { name: "Cards" });

    fireEvent.error(cards()[0].querySelector("img")!);
    fireEvent.click(screen.getByRole("button", { name: "Try other Pokémon" }));

    await expect(
      screen.findByRole("list", { name: "Cards" }),
    ).resolves.toBeInTheDocument();
  });

  it("quits back to the level picker without saving", async () => {
    const user = userEvent.setup();
    const router = renderApp("/match/play?level=easy");

    const quit = await screen.findByRole("button", { name: "Quit" });
    await user.click(quit);
    await user.click(screen.getByRole("link", { name: "Quit" }));

    expect(router.state.location.pathname).toBe("/match");
    expect(loadRuns()).toEqual([]);
  });
});
