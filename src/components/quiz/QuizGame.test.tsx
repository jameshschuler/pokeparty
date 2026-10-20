import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findPokemon } from "../../lib/pokedex";
import { formatPokemonLabel } from "../../lib/pokemon";
import { FEEDBACK_MS } from "../../lib/quiz";
import { renderApp } from "../../test/renderApp";

function currentAnswerLabel() {
  const sprite = screen.getByRole("img", { name: "Mystery Pokémon" });
  const id = Number(sprite.getAttribute("src")!.match(/(\d+)\.png$/)![1]);

  return formatPokemonLabel(findPokemon(id)!);
}

async function showQuestion() {
  const sprite = await screen.findByRole("img", { name: "Mystery Pokémon" });
  fireEvent.load(sprite);
}

function choiceButtons() {
  return within(screen.getByRole("list")).getAllByRole("button");
}

describe("quiz setup", () => {
  it("starts a round of the chosen length", async () => {
    const user = userEvent.setup();
    const router = renderApp("/quiz");

    const ninety = await screen.findByRole("link", { name: /90s/ });
    await user.click(ninety);

    expect(router.state.location.pathname).toBe("/quiz/play");
    expect(router.state.location.search).toEqual({ seconds: 90 });
    await expect(
      screen.findByRole("timer", { name: "Time left" }),
    ).resolves.toHaveTextContent("90s");
  });

  it.each(["seconds=45", "seconds=abc", ""])(
    "falls back to 60 seconds for %j",
    async (query) => {
      renderApp(`/quiz/play?${query}`);

      await expect(
        screen.findByRole("timer", { name: "Time left" }),
      ).resolves.toHaveTextContent("60s");
    },
  );
});

describe("quiz game", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("offers four name choices including the answer", async () => {
    renderApp("/quiz/play?seconds=30");
    await showQuestion();

    const labels = choiceButtons().map((button) => button.textContent);

    expect(labels).toHaveLength(4);
    expect(labels).toContain(currentAnswerLabel());
  });

  it("scores a right answer, reveals it, then moves on", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    await showQuestion();
    const answer = currentAnswerLabel();

    fireEvent.click(screen.getByRole("button", { name: answer }));

    expect(screen.getByRole("group", { name: "Correct" })).toHaveTextContent(
      "1",
    );
    expect(screen.getByRole("group", { name: "Streak" })).toHaveTextContent(
      "1",
    );
    expect(screen.getByText(`It's ${answer}!`)).toBeInTheDocument();
    expect(
      choiceButtons().every((button) => button.hasAttribute("disabled")),
    ).toBe(true);

    act(() => vi.advanceTimersByTime(FEEDBACK_MS));

    expect(currentAnswerLabel()).not.toBe(answer);
    expect(
      choiceButtons().every((button) => button.hasAttribute("disabled")),
    ).toBe(true);

    await showQuestion();

    expect(
      choiceButtons().some((button) => button.hasAttribute("disabled")),
    ).toBe(false);
  });

  it("counts a wrong answer and doesn't allow a second guess", async () => {
    renderApp("/quiz/play?seconds=30");
    await showQuestion();
    const answer = currentAnswerLabel();
    const wrong = choiceButtons().find(
      (button) => button.textContent !== answer,
    )!;

    fireEvent.click(wrong);
    fireEvent.click(screen.getByRole("button", { name: answer }));

    expect(screen.getByRole("group", { name: "Correct" })).toHaveTextContent(
      "0",
    );
    expect(screen.getByRole("group", { name: "Streak" })).toHaveTextContent(
      "0",
    );
  });

  function timeLeft() {
    return screen.getByRole("timer", { name: "Time left" });
  }

  it("waits for the first sprite before the clock starts", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    await screen.findByRole("img", { name: "Mystery Pokémon" });

    act(() => vi.advanceTimersByTime(5_000));
    expect(timeLeft()).toHaveTextContent("30s");
    expect(
      choiceButtons().every((button) => button.hasAttribute("disabled")),
    ).toBe(true);

    await showQuestion();
    act(() => vi.advanceTimersByTime(5_100));

    expect(timeLeft()).toHaveTextContent("25s");
  });

  it("pauses the clock while the answer is shown and the next sprite loads", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    await showQuestion();
    act(() => vi.advanceTimersByTime(5_000));

    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));
    act(() => vi.advanceTimersByTime(FEEDBACK_MS + 2_000));

    expect(timeLeft()).toHaveTextContent("25s");

    await showQuestion();
    act(() => vi.advanceTimersByTime(5_100));

    expect(timeLeft()).toHaveTextContent("20s");
  });

  it("offers to skip a Pokémon whose picture won't load", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    const sprite = await screen.findByRole("img", { name: "Mystery Pokémon" });
    const brokenAnswer = currentAnswerLabel();

    fireEvent.error(sprite);
    expect(screen.getByText("Couldn't load this Pokémon.")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5_000));
    expect(timeLeft()).toHaveTextContent("30s");

    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    await showQuestion();

    expect(currentAnswerLabel()).not.toBe(brokenAnswer);
    expect(screen.getByRole("group", { name: "Correct" })).toHaveTextContent(
      "0",
    );
  });

  it("ignores a guess made after time runs out", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    await showQuestion();
    act(() => vi.advanceTimersByTime(29_950));

    vi.setSystemTime(Date.now() + 100);
    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));
    act(() => vi.advanceTimersByTime(100));

    expect(
      screen.getByRole("heading", { name: "Time's up!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("correct in 30 seconds")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("ends the round when time runs out and can start again", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    await showQuestion();
    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));
    act(() => vi.advanceTimersByTime(FEEDBACK_MS));
    await showQuestion();
    act(() => vi.advanceTimersByTime(30_000 + 200));

    expect(
      screen.getByRole("heading", { name: "Time's up!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("correct in 30 seconds")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));

    expect(timeLeft()).toHaveTextContent("30s");
    expect(screen.getByRole("group", { name: "Correct" })).toHaveTextContent(
      "0",
    );
  });
});
