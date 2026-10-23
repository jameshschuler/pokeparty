import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadRuns, saveRuns } from "../../lib/leaderboard";
import { NAME_DROP_FINISH_MS } from "../../lib/name-drop";
import { renderApp } from "../../test/renderApp";

function input(): HTMLInputElement {
  return screen.getByLabelText("Type the Pokémon's name");
}

function typeInto(text: string) {
  const field = input();
  field.value = ` ${text}`;
  fireEvent.input(field);
}

function pressBackspace() {
  const field = input();
  field.value = "";
  act(() => {
    field.dispatchEvent(
      new InputEvent("input", {
        inputType: "deleteContentBackward",
        bubbles: true,
      }),
    );
  });
}

function compose(text: string) {
  const field = input();
  field.value = ` ${text}`;
  act(() => {
    field.dispatchEvent(
      new InputEvent("input", { isComposing: true, bubbles: true }),
    );
  });
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
  const start = await screen.findByRole("button", { name: "Tap to start" });
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

  it("waits for a tap to start, then drops a Pokémon with its name", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/name-drop/play");
    await screen.findByRole("button", { name: "Tap to start" });
    act(() => vi.advanceTimersByTime(5_000));

    expect(fallingNames()).toEqual([]);

    fireEvent.click(screen.getByRole("button", { name: "Tap to start" }));

    expect(input()).toHaveFocus();

    act(() => vi.advanceTimersByTime(900));

    expect(fallingNames()).toHaveLength(1);
  });

  it("clears a Pokémon when its name is typed and scores it", async () => {
    await startGame();
    const [name] = fallingNames();

    typeInto(name);

    expect(fallingNames()).toEqual([]);
    expect(screen.getByLabelText("Score")).not.toHaveTextContent(/^0$/);
    expect(input().value).toBe(" ");
  });

  it("shows letters as they're typed and undoes them with backspace", async () => {
    await startGame();
    const [name] = fallingNames();
    const firstTwo = name.toLowerCase().slice(0, 2);

    typeInto(firstTwo);

    expect(screen.getByText(firstTwo)).toBeInTheDocument();

    pressBackspace();

    expect(screen.getByText(firstTwo[0])).toBeInTheDocument();
  });

  it("reads letters from an Android-style composing keyboard without doubling them", async () => {
    await startGame();
    const [name] = fallingNames();
    const word = name.toLowerCase().replace(/[^a-z0-9]/g, "");

    compose(word.slice(0, 1));
    compose(word.slice(0, 2));
    compose(word.slice(0, 1));

    expect(screen.getByText(word.slice(0, 1))).toBeInTheDocument();

    compose(word);
    fireEvent.compositionEnd(input());

    expect(fallingNames()).toEqual([]);
    expect(input().value).toBe(" ");
  });

  it("keeps the text cursor at the end so the next letter isn't misread", async () => {
    await startGame();
    const field = input();
    field.setSelectionRange(0, 0);

    fireEvent.select(field);

    expect(field.selectionStart).toBe(field.value.length);
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
    typeInto(name);

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
