import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadRuns, saveRuns } from "../../lib/leaderboard";
import { cryUrl } from "../../lib/cries";
import { MATCH_FINISH_MS, MATCH_MISS_MS } from "../../lib/match";
import { EVOLUTION_FAMILIES } from "../../lib/pokedex";
import { installFakeAudio } from "../../test/fakeAudio";
import { renderApp } from "../../test/renderApp";

function cards(): HTMLElement[] {
  return within(screen.getByRole("list", { name: "Cards" })).getAllByRole(
    "button",
  );
}

function spriteId(card: HTMLElement): string {
  return card.querySelector("img")!.getAttribute("src")!;
}

function idFromSrc(src: string): number {
  return Number(src.match(/(\d+)\.png$/)![1]);
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
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("is on the hub", async () => {
    renderApp("/");

    await expect(
      screen.findByRole("link", { name: /Pokémon Match/ }),
    ).resolves.toHaveAttribute("href", "/match");
  });

  it("offers five levels with your best", async () => {
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
      "Silhouette · 8 pairsMatch each Pokémon to its silhouette.Best –",
      "Evolution · 8 pairsMatch each Pokémon to what it evolves into.Best –",
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

  it("pairs each Pokémon with its silhouette on the Silhouette level", async () => {
    renderApp("/match/play?level=silhouette");
    await loadBoard();
    const pairs = pairIndexes();

    expect(pairs).toHaveLength(8);
    for (const [first, second] of pairs) {
      const shaded = [first, second].filter((index) =>
        cards()[index].querySelector("img")!.classList.contains("brightness-0"),
      );
      expect(shaded).toHaveLength(1);
    }

    const [[first, second]] = pairs;
    flip(first);
    flip(second);

    expect(
      cards()
        .map((card) => card.querySelector("img")!)
        .filter((img) => img.classList.contains("brightness-0")),
    ).toHaveLength(7);
  });

  it("pairs each Pokémon with its evolution on the Evolution level", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/match/play?level=evolution");
    await loadBoard();
    const ids = cards().map((card) => idFromSrc(spriteId(card)));
    const pairs = EVOLUTION_FAMILIES.flat().flatMap((link) => {
      const from = ids.indexOf(link.from.id);
      const to = ids.indexOf(link.to.id);

      return from >= 0 && to >= 0 ? [[from, to]] : [];
    });

    expect(new Set(pairs.flat()).size).toBe(16);

    for (const [from, to] of pairs) {
      flip(from);
      flip(to);
    }
    act(() => vi.advanceTimersByTime(MATCH_FINISH_MS));

    expect(
      screen.getByRole("heading", { name: "All pairs found!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("flips · Evolution · 8 pairs")).toBeInTheDocument();
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

  it("celebrates a match by name and says when it's a miss", async () => {
    renderApp("/match/play?level=easy");
    await loadBoard();
    const [[a, aTwin], [b]] = pairIndexes();
    expect(screen.getByText("Find the pairs")).toBeInTheDocument();

    flip(a);
    const name = cards()[a].getAttribute("aria-label");

    expect(screen.getByText("Now find its pair")).toBeInTheDocument();

    flip(aTwin);

    expect(screen.getByText(`Match! ${name}`)).toBeInTheDocument();

    const [[c]] = pairIndexes().filter(([first]) => first !== a && first !== b);
    flip(b);
    flip(c);

    expect(screen.getByText("Not a match")).toBeInTheDocument();
  });

  it("plays the Pokémon's cry when a pair is found", async () => {
    const audio = installFakeAudio();
    renderApp("/match/play?level=easy");
    await loadBoard();
    const [[first, second]] = pairIndexes();
    const id = idFromSrc(spriteId(cards()[first]));

    flip(first);

    expect(audio.played).toEqual([]);

    flip(second);

    expect(audio.played).toEqual([cryUrl(id)]);
  });

  it("downloads each Pokémon's cry once, not once per card", async () => {
    const audio = installFakeAudio();
    renderApp("/match/play?level=easy");
    await loadBoard();

    expect(audio.fetched).toHaveLength(6);
    expect(new Set(audio.fetched).size).toBe(6);
  });

  it("stays quiet when muted", async () => {
    const audio = installFakeAudio();
    renderApp("/match/play?level=easy");
    await loadBoard();
    const [[first, second]] = pairIndexes();

    fireEvent.click(screen.getByRole("button", { name: "Mute" }));
    flip(first);
    flip(second);

    expect(audio.played).toEqual([]);
  });

  it("stops a playing cry when Quit is opened", async () => {
    const audio = installFakeAudio();
    renderApp("/match/play?level=easy");
    await loadBoard();
    const [[first, second]] = pairIndexes();
    flip(first);
    flip(second);
    audio.stopped = 0;

    fireEvent.click(screen.getByRole("button", { name: "Quit" }));

    expect(audio.stopped).toBe(1);
  });

  it("stays on the finished board while Quit is open", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/match/play?level=easy");
    await loadBoard();
    playPerfectGame();

    fireEvent.click(screen.getByRole("button", { name: "Quit" }));
    act(() => vi.advanceTimersByTime(MATCH_FINISH_MS * 3));

    expect(
      screen.queryByRole("heading", { name: "All pairs found!" }),
    ).toBeNull();
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
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/match/play?level=easy");
    await loadBoard();

    playPerfectGame();

    expect(screen.getByText("All pairs found!")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "All pairs found!" }),
    ).toBeNull();

    act(() => vi.advanceTimersByTime(MATCH_FINISH_MS));

    expect(
      screen.getByRole("heading", { name: "All pairs found!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("New best!")).toBeInTheDocument();
    expect(screen.getByText("flips · Easy · 6 pairs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Main menu" })).toHaveAttribute(
      "href",
      "/",
    );
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
