import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadRuns, saveRuns } from "../../lib/leaderboard";
import { NAME_DROP_FINISH_MS } from "../../lib/name-drop";
import { typedName } from "../../lib/pokemon";
import { renderApp } from "../../test/renderApp";

function tapKey(name: string) {
  fireEvent.pointerDown(screen.getByRole("button", { name }));
}

function typeOnPad(text: string) {
  for (const letter of typedName(text)) {
    tapKey(letter.toUpperCase());
  }
}

function fallingNames(): string[] {
  const field = screen.getByRole("region", { name: "Falling Pokémon" });

  return [...field.querySelectorAll("span.rounded-full")].map(
    (name) => name.textContent!,
  );
}

function runFor(ms: number) {
  for (let passed = 0; passed < ms; passed += 100) {
    act(() => vi.advanceTimersByTime(100));
  }
}

async function startGame() {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  renderApp("/name-drop/play");
  const start = await screen.findByRole("button", { name: "Start" });
  fireEvent.click(start);
  act(() => vi.advanceTimersByTime(900));
}

describe("name drop", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is on the hub", async () => {
    renderApp("/");

    await expect(
      screen.findByRole("link", { name: /Name Drop/ }),
    ).resolves.toHaveAttribute("href", "/name-drop");
  });

  it("shows your best and a Play button", async () => {
    saveRuns([{ game: "name-drop", score: 420, cleared: 8, playedAt: 1 }]);
    renderApp("/name-drop");

    await expect(
      screen.findByText("Your best: 420"),
    ).resolves.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play" })).toHaveAttribute(
      "href",
      "/name-drop/play",
    );
  });

  it("waits for Start, then drops a Pokémon with its name", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/name-drop/play");
    await screen.findByRole("button", { name: "Start" });
    act(() => vi.advanceTimersByTime(5_000));

    expect(fallingNames()).toEqual([]);

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => vi.advanceTimersByTime(900));

    expect(fallingNames()).toHaveLength(1);
  });

  it("clears a Pokémon when its name is typed and scores it", async () => {
    await startGame();
    const [name] = fallingNames();

    typeOnPad(name);

    expect(fallingNames()).toEqual([]);
    expect(screen.getByLabelText("Score")).not.toHaveTextContent(/^0$/);
  });

  it("takes letters from a physical keyboard too", async () => {
    await startGame();
    const [name] = fallingNames();

    for (const letter of typedName(name)) {
      fireEvent.keyDown(window, { key: letter });
    }

    expect(fallingNames()).toEqual([]);
  });

  it("erases with a physical Backspace, and keeps erasing while it's held", async () => {
    await startGame();
    const [name] = fallingNames();
    const firstThree = typedName(name).slice(0, 3);

    for (const letter of firstThree) {
      fireEvent.keyDown(window, { key: letter });
    }
    fireEvent.keyDown(window, { key: "Backspace" });
    fireEvent.keyDown(window, { key: "Backspace", repeat: true });

    expect(screen.getByText(firstThree[0])).toBeInTheDocument();
  });

  it("ignores a held-down letter repeating", async () => {
    await startGame();
    const [name] = fallingNames();
    const first = typedName(name)[0];

    fireEvent.keyDown(window, { key: first });
    fireEvent.keyDown(window, { key: first, repeat: true });

    expect(screen.getByText(first)).not.toHaveClass("animate-wrong");
  });

  it("ignores a right-click on the letter pad", async () => {
    await startGame();
    const [name] = fallingNames();

    fireEvent.pointerDown(
      screen.getByRole("button", { name: typedName(name)[0].toUpperCase() }),
      { button: 2 },
    );

    expect(screen.getByText("Start typing…")).toBeInTheDocument();
  });

  it("ignores keyboard shortcuts", async () => {
    await startGame();
    const [name] = fallingNames();

    fireEvent.keyDown(window, { key: typedName(name)[0], metaKey: true });

    expect(screen.getByText("Start typing…")).toBeInTheDocument();
  });

  it("types one letter per tap", async () => {
    await startGame();
    const [name] = fallingNames();
    const key = screen.getByRole("button", {
      name: typedName(name)[0].toUpperCase(),
    });

    fireEvent.pointerDown(key);
    fireEvent.click(key, { detail: 1 });

    expect(screen.getByText(typedName(name)[0])).toBeInTheDocument();
  });

  it("lets a screen reader press a key", async () => {
    await startGame();
    const [name] = fallingNames();
    const first = typedName(name)[0];

    fireEvent.click(screen.getByRole("button", { name: first.toUpperCase() }), {
      detail: 0,
    });

    expect(screen.getByText(first)).toBeInTheDocument();
  });

  it("shows letters as they're typed and undoes them with backspace", async () => {
    await startGame();
    const [name] = fallingNames();
    const firstTwo = typedName(name).slice(0, 2);

    typeOnPad(firstTwo);

    expect(screen.getByText(firstTwo)).toBeInTheDocument();

    tapKey("Backspace");

    expect(screen.getByText(firstTwo[0])).toBeInTheDocument();
  });

  it("loses a life when a Pokémon lands", async () => {
    await startGame();

    runFor(8_000);

    expect(
      screen.getByRole("img", { name: "2 of 3 lives left" }),
    ).toBeInTheDocument();
  });

  it("ends after three landings, saves the score and links to share it", async () => {
    await startGame();
    const [name] = fallingNames();
    typeOnPad(name);

    runFor(30_000);
    runFor(NAME_DROP_FINISH_MS);

    expect(
      screen.getByRole("heading", { name: "Game over!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 Pokémon named")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Share result" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/name-drop\/result\?score=\d+&cleared=1$/),
    );
    expect(loadRuns()).toEqual([
      expect.objectContaining({
        game: "name-drop",
        cleared: 1,
      }),
    ]);
  });

  it("pauses while the tab is hidden", async () => {
    await startGame();
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    act(() => vi.advanceTimersByTime(60_000));
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(
      screen.getByRole("img", { name: "3 of 3 lives left" }),
    ).toBeInTheDocument();
  });

  it("quits back to the Name Drop page without saving", async () => {
    const user = userEvent.setup();
    const router = renderApp("/name-drop/play");

    const quit = await screen.findByRole("button", { name: "Quit" });
    await user.click(quit);
    await user.click(screen.getByRole("link", { name: "Quit" }));

    expect(router.state.location.pathname).toBe("/name-drop");
    expect(loadRuns()).toEqual([]);
  });
});
