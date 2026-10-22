import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadRuns, saveRuns } from "../../lib/leaderboard";
import { findPokemon } from "../../lib/pokedex";
import { formatPokemonLabel } from "../../lib/pokemon";
import { SPRITE_LOAD_TIMEOUT_MS } from "../../lib/quiz";
import {
  SIMON_IDLE_MS,
  SIMON_READY_MS,
  SIMON_REVEAL_MS,
  SIMON_TAP_FLASH_MS,
} from "../../lib/simon";
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
    expect(screen.getByText("Round 1")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(SIMON_READY_MS));

    expect(screen.getByText("Watch closely…")).toBeInTheDocument();

    const first = watchSequence();

    expect(first).toHaveLength(1);
    expect(screen.getByText("Tap 1 of 1")).toBeInTheDocument();

    tap(first[0]);
    const second = watchSequence();

    expect(second).toHaveLength(2);
    expect(second[0]).toBe(first[0]);
    expect(screen.getByLabelText("Score")).toHaveTextContent("1");
  });

  it("gives the player time to get ready before the next round", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/simon/play?level=easy");
    await loadBoard();
    const [first] = watchSequence();

    tap(first);

    expect(screen.getByText("Get ready!")).toBeInTheDocument();
    expect(screen.getByText("Round 2")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(SIMON_READY_MS - 100));

    expect(screen.getByText("Get ready!")).toBeInTheDocument();
    expect(litName()).toBe("");

    act(() => vi.advanceTimersByTime(100));

    expect(screen.getByText("Watch closely…")).toBeInTheDocument();
  });

  it("shows a countdown for each tap and hides it while paused", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/simon/play?level=easy");
    await loadBoard();

    expect(document.querySelector("[data-countdown]")).toBeNull();

    watchSequence();

    expect(document.querySelector("[data-countdown]")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Quit" }));

    expect(document.querySelector("[data-countdown]")).toBeNull();
  });

  it("lights a Pokémon briefly when it's tapped", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/simon/play?level=easy");
    await loadBoard();
    const [first] = watchSequence();
    tap(first);
    const sequence = watchSequence();
    const pad = screen.getByRole("button", { name: sequence[0] });

    tap(sequence[0]);

    expect(pad).toHaveClass("bg-accent");

    act(() => vi.advanceTimersByTime(SIMON_TAP_FLASH_MS));

    expect(pad).not.toHaveClass("bg-accent");
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
    expect(screen.getByRole("link", { name: "Main menu" })).toHaveAttribute(
      "href",
      "/",
    );
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

    let stopped: number;
    let contextState: string;

    class FakeAudioContext {
      destination = {};

      get state() {
        return contextState;
      }

      createGain() {
        return { gain: { value: 1 }, connect: () => undefined };
      }

      createBufferSource() {
        const source = {
          buffer: null as string | null,
          connect: () => undefined,
          start: () => played.push(source.buffer!),
          stop: () => {
            stopped += 1;
          },
        };

        return source;
      }

      decodeAudioData(data: string) {
        return Promise.resolve(data);
      }

      resume() {
        contextState = "running";

        return Promise.resolve();
      }

      close() {
        return Promise.resolve();
      }
    }

    beforeEach(() => {
      played = [];
      stopped = 0;
      contextState = "running";
      vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue(
        "probably",
      );
      vi.stubGlobal("AudioContext", FakeAudioContext);
      vi.stubGlobal("fetch", (url: string) =>
        Promise.resolve({ arrayBuffer: () => Promise.resolve(url) }),
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
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

    it("unlocks sound when the player picks a level", async () => {
      contextState = "suspended";
      const user = userEvent.setup();
      renderApp("/simon");

      const easy = await screen.findByRole("link", { name: /^Easy/ });
      await user.click(easy);

      expect(contextState).toBe("running");
    });

    it("unlocks sound again on a tap during the game", async () => {
      renderApp("/simon/play?level=easy");
      await loadBoard();
      contextState = "interrupted";

      fireEvent.click(screen.getByRole("button", { name: "Mute" }));

      expect(contextState).toBe("running");
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
      vi.useFakeTimers({ shouldAdvanceTime: true });
      renderApp("/simon/play?level=easy");
      await loadBoard();
      const [first] = watchSequence();
      stopped = 0;

      fireEvent.click(screen.getByRole("button", { name: "Mute" }));

      expect(stopped).toBe(1);

      fireEvent.click(screen.getByRole("button", { name: "Mute" }));
      tap(first);
      stopped = 0;
      fireEvent.click(screen.getByRole("button", { name: "Quit" }));

      expect(stopped).toBe(1);
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
