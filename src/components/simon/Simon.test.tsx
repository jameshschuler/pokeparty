import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadRuns, saveRuns } from "../../lib/leaderboard";
import { findPokemon } from "../../lib/pokedex";
import { formatPokemonLabel } from "../../lib/pokemon";
import { SPRITE_LOAD_TIMEOUT_MS } from "../../lib/quiz";
import { SIMON_IDLE_MS, SIMON_REVEAL_MS } from "../../lib/simon";
import { renderApp } from "../../test/renderApp";

async function loadBoard() {
  const board = await screen.findByRole("list", { name: "Board" });
  for (const sprite of board.querySelectorAll("img")) {
    fireEvent.load(sprite);
  }
}

function litName(): string {
  return document
    .querySelector('[aria-live="assertive"]')!
    .textContent!.replace(/^\d+: /, "");
}

function watchSequence(): string[] {
  const names: string[] = [];
  let last = "";
  while (!screen.queryByText(/^Your turn/)) {
    act(() => vi.advanceTimersByTime(50));
    const lit = litName();

    if (lit && lit !== last) {
      names.push(lit);
    }
    last = lit;
  }

  return names;
}

function tap(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}

function wrongName(right: string): string {
  const pads = within(screen.getByRole("list", { name: "Board" })).getAllByRole(
    "button",
  );

  return pads.find((pad) => pad.textContent !== right)!.textContent!;
}

describe("simon", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("is on the hub", async () => {
    renderApp("/");

    await expect(
      screen.findByRole("link", { name: /^Simon/ }),
    ).resolves.toHaveAttribute("href", "/simon");
  });

  it("offers three levels with your best", async () => {
    saveRuns([{ game: "simon", level: "medium", score: 7, playedAt: 1 }]);
    renderApp("/simon");

    const list = await screen.findByRole("list", { name: "Level" });
    const options = within(list).getAllByRole("link");

    expect(options.map((option) => option.textContent)).toEqual([
      "Easy · 4 PokémonBest –",
      "Medium · 6 PokémonBest 7",
      "Hard · 9 PokémonBest –",
    ]);
    expect(options[2]).toHaveAttribute("href", "/simon/play?level=hard");
  });

  it.each([
    ["easy", 4],
    ["medium", 6],
    ["hard", 9],
  ])("deals a %s board of %s Pokémon", async (level, size) => {
    renderApp(`/simon/play?level=${level}`);

    const board = await screen.findByRole("list", { name: "Board" });

    expect(within(board).getAllByRole("button")).toHaveLength(size);
  });

  it("waits for the sprites, plays the sequence, then takes taps", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/simon/play?level=easy");

    await screen.findByText("Getting the Pokémon ready…");
    await loadBoard();
    expect(screen.getByText("Watch closely…")).toBeInTheDocument();

    const first = watchSequence();

    expect(first).toHaveLength(1);
    expect(screen.getByText("Your turn: 1 of 1")).toBeInTheDocument();

    tap(first[0]);
    const second = watchSequence();

    expect(second).toHaveLength(2);
    expect(second[0]).toBe(first[0]);
    expect(screen.getByLabelText("Score")).toHaveTextContent("1");
  });

  it("ends on a wrong tap, saves the score and links to share it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/simon/play?level=easy");
    await loadBoard();
    const [first] = watchSequence();
    tap(first);
    const sequence = watchSequence();

    tap(wrongName(sequence[0]));

    expect(screen.getByText("Not that one!")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(SIMON_REVEAL_MS));

    expect(
      screen.getByRole("heading", { name: "Game over!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("New best!")).toBeInTheDocument();
    expect(screen.getByText("in a row · Easy · 4 Pokémon")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Share result" })).toHaveAttribute(
      "href",
      "/simon/result?level=easy&score=1",
    );
    expect(loadRuns()).toEqual([
      expect.objectContaining({ game: "simon", level: "easy", score: 1 }),
    ]);
  });

  it("ends when the player stops tapping", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/simon/play?level=easy");
    await loadBoard();
    watchSequence();

    act(() => vi.advanceTimersByTime(SIMON_IDLE_MS));

    expect(screen.getByText("Too slow!")).toBeInTheDocument();
  });

  it("doesn't take taps while the sequence plays", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/simon/play?level=easy");
    await loadBoard();

    const pads = within(
      screen.getByRole("list", { name: "Board" }),
    ).getAllByRole("button");

    expect(pads.every((pad) => pad.hasAttribute("disabled"))).toBe(true);
  });

  it("waits on the quit dialog instead of finishing behind it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/simon/play?level=easy");
    await loadBoard();
    const [first] = watchSequence();
    tap(wrongName(first));

    fireEvent.click(screen.getByRole("button", { name: "Quit" }));
    act(() => vi.advanceTimersByTime(SIMON_REVEAL_MS * 2));

    expect(screen.queryByRole("heading", { name: "Game over!" })).toBeNull();
    expect(loadRuns()).toEqual([]);
  });

  it("doesn't call a slow load a failure while the quit dialog is open", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/simon/play?level=easy");

    const quit = await screen.findByRole("button", { name: "Quit" });
    fireEvent.click(quit);
    act(() => vi.advanceTimersByTime(SPRITE_LOAD_TIMEOUT_MS * 2));

    expect(screen.queryByText("Couldn't load these Pokémon.")).toBeNull();
  });

  it("has no mute button where the browser can't play the cries", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue("");
    renderApp("/simon/play?level=easy");
    await screen.findByRole("list", { name: "Board" });

    expect(screen.queryByRole("button", { name: "Mute" })).toBeNull();
  });

  describe("with sound", () => {
    let played: string[];

    beforeEach(() => {
      played = [];
      vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue(
        "probably",
      );
      vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
        () => undefined,
      );
      vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(
        () => undefined,
      );
      vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
        this: HTMLMediaElement,
      ) {
        played.push(this.src);

        return Promise.resolve();
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    function playedNames() {
      return played.map((src) => {
        const id = Number(src.match(/(\d+)\.ogg$/)![1]);

        return formatPokemonLabel(findPokemon(id)!);
      });
    }

    it("plays each Pokémon's cry when it lights up and when it's tapped", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      renderApp("/simon/play?level=easy");
      await loadBoard();

      const [first] = watchSequence();

      expect(playedNames()).toEqual([first]);

      tap(first);

      expect(playedNames()).toEqual([first, first]);
    });

    it("starts muted when the player muted before", async () => {
      localStorage.setItem("pokeparty:muted", "true");
      vi.useFakeTimers({ shouldAdvanceTime: true });
      renderApp("/simon/play?level=easy");
      await loadBoard();

      watchSequence();

      expect(screen.getByRole("button", { name: "Mute" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(played).toEqual([]);
    });

    it("stops the playing cry when muted or paused", async () => {
      const pause = vi.mocked(HTMLMediaElement.prototype.pause);
      vi.useFakeTimers({ shouldAdvanceTime: true });
      renderApp("/simon/play?level=easy");
      await loadBoard();
      watchSequence();
      pause.mockClear();

      fireEvent.click(screen.getByRole("button", { name: "Mute" }));

      expect(pause).toHaveBeenCalled();

      pause.mockClear();
      fireEvent.click(screen.getByRole("button", { name: "Quit" }));

      expect(pause).toHaveBeenCalled();
    });

    it("stays quiet when muted, and remembers it", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      renderApp("/simon/play?level=easy");
      await loadBoard();

      const mute = screen.getByRole("button", { name: "Mute" });
      fireEvent.click(mute);
      const [first] = watchSequence();
      tap(first);

      expect(mute).toHaveAttribute("aria-pressed", "true");
      expect(played).toEqual([]);
      expect(localStorage.getItem("pokeparty:muted")).toBe("true");
    });
  });

  it("quits back to the level picker without saving", async () => {
    const user = userEvent.setup();
    const router = renderApp("/simon/play?level=easy");

    const quit = await screen.findByRole("button", { name: "Quit" });
    await user.click(quit);
    await user.click(screen.getByRole("link", { name: "Quit" }));

    expect(router.state.location.pathname).toBe("/simon");
    expect(loadRuns()).toEqual([]);
  });
});
