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
    expect(router.state.location.search).toEqual({
      mode: "sprite",
      seconds: 90,
    });
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

describe("quiz modes", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to Sprite and switches to Silhouette before starting", async () => {
    const user = userEvent.setup();
    const router = renderApp("/quiz");

    const sprite = await screen.findByRole("button", { name: /Sprite/ });
    expect(sprite).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /Silhouette/ }));
    expect(screen.getByRole("button", { name: /Silhouette/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Sprite/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await user.click(screen.getByRole("link", { name: /60s/ }));

    expect(router.state.location.pathname).toBe("/quiz/play");
    expect(router.state.location.search).toEqual({
      mode: "silhouette",
      seconds: 60,
    });
  });

  it("hides the Pokémon in silhouette mode until it's answered", async () => {
    renderApp("/quiz/play?mode=silhouette&seconds=30");
    await showQuestion();
    const sprite = screen.getByRole("img", { name: "Mystery Pokémon" });

    expect(sprite).toHaveClass("brightness-0");

    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));

    expect(sprite).not.toHaveClass("brightness-0");
  });

  it("shows the Pokémon in sprite mode", async () => {
    renderApp("/quiz/play?mode=sprite&seconds=30");
    await showQuestion();

    expect(
      screen.getByRole("img", { name: "Mystery Pokémon" }),
    ).not.toHaveClass("brightness-0");
  });

  it("names the mode on the summary and keeps it for the next setup", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const router = renderApp("/quiz/play?mode=silhouette&seconds=30");
    await showQuestion();
    act(() => vi.advanceTimersByTime(30_200));

    expect(
      screen.getByText("correct in 30 seconds · Silhouette"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Change setup" }));

    expect(router.state.location.pathname).toBe("/quiz");
    expect(router.state.location.search).toEqual({ mode: "silhouette" });
  });
});

describe("quiz navigation", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("goes back to the hub from setup", async () => {
    const user = userEvent.setup();
    const router = renderApp("/quiz");

    await user.click(await screen.findByRole("link", { name: "Back" }));

    expect(router.state.location.pathname).toBe("/");
  });

  function quitDialog() {
    return screen.getByRole("dialog", { name: "Quit this round?" });
  }

  it("asks before quitting and pauses the clock meanwhile", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    await showQuestion();
    act(() => vi.advanceTimersByTime(5_100));

    fireEvent.click(screen.getByRole("button", { name: "Quit" }));

    expect(quitDialog()).toHaveAttribute("open");
    const frozen = screen.getByRole("timer", {
      hidden: true,
      name: "Time left",
    }).textContent;
    act(() => vi.advanceTimersByTime(10_000));
    expect(
      screen.getByRole("timer", { hidden: true, name: "Time left" }),
    ).toHaveTextContent(frozen!);

    fireEvent.click(screen.getByRole("button", { name: "Keep playing" }));

    expect(
      screen.queryByRole("dialog", { name: "Quit this round?" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("timer", { name: "Time left" })).toHaveTextContent(
      frozen!,
    );
    act(() => vi.advanceTimersByTime(5_100));
    expect(
      screen.getByRole("timer", { name: "Time left" }),
    ).not.toHaveTextContent(frozen!);
  });

  it("keeps the sprite loaded, so the clock resumes right away", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    await showQuestion();
    const sprite = screen.getByRole("img", { name: "Mystery Pokémon" });

    fireEvent.click(screen.getByRole("button", { name: "Quit" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep playing" }));
    act(() => vi.advanceTimersByTime(5_100));

    expect(screen.getByRole("img", { name: "Mystery Pokémon" })).toBe(sprite);
    expect(screen.getByRole("timer", { name: "Time left" })).toHaveTextContent(
      "25s",
    );
  });

  it("doesn't skip the answer reveal when quitting right after a guess", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    await showQuestion();
    const answer = currentAnswerLabel();
    fireEvent.click(screen.getByRole("button", { name: answer }));

    fireEvent.click(screen.getByRole("button", { name: "Quit" }));
    act(() => vi.advanceTimersByTime(2_000));
    fireEvent.click(screen.getByRole("button", { name: "Keep playing" }));

    expect(screen.getByText(`It's ${answer}!`)).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(FEEDBACK_MS));

    expect(currentAnswerLabel()).not.toBe(answer);
  });

  it("quits back to setup, keeping the mode", async () => {
    const user = userEvent.setup();
    const router = renderApp("/quiz/play?mode=silhouette&seconds=30");
    await showQuestion();

    await user.click(screen.getByRole("button", { name: "Quit" }));
    await user.click(within(quitDialog()).getByRole("link", { name: "Quit" }));

    expect(router.state.location.pathname).toBe("/quiz");
    expect(router.state.location.search).toEqual({ mode: "silhouette" });
  });
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

  it("drains the clock when wrong answers are spammed", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    await showQuestion();

    for (let guess = 0; guess < 5; guess++) {
      const answer = currentAnswerLabel();
      const wrong = choiceButtons().find(
        (button) => button.textContent !== answer,
      )!;
      fireEvent.click(wrong);
      act(() => vi.advanceTimersByTime(FEEDBACK_MS));
      await showQuestion();
    }
    act(() => vi.advanceTimersByTime(100));
    const secondsLeft = Number(
      screen
        .getByRole("timer", { name: "Time left" })
        .textContent!.replace("s", ""),
    );

    expect(secondsLeft).toBeLessThanOrEqual(20);
    expect(secondsLeft).toBeGreaterThanOrEqual(18);
  });

  it("shows the time lost after a wrong answer only", async () => {
    renderApp("/quiz/play?seconds=30");
    await showQuestion();
    const answer = currentAnswerLabel();

    fireEvent.click(
      choiceButtons().find((button) => button.textContent !== answer)!,
    );

    expect(screen.getByText("−2s")).toBeInTheDocument();
  });

  it("shows the reveal before ending a round a wrong answer runs out", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?seconds=30");
    await showQuestion();
    act(() => vi.advanceTimersByTime(28_500));
    const answer = currentAnswerLabel();

    fireEvent.click(
      choiceButtons().find((button) => button.textContent !== answer)!,
    );

    expect(screen.getByText(`It's ${answer}!`)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Time's up!" }),
    ).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(FEEDBACK_MS));

    expect(
      screen.getByRole("heading", { name: "Time's up!" }),
    ).toBeInTheDocument();
  });

  it("doesn't show a time loss after a right answer", async () => {
    renderApp("/quiz/play?seconds=30");
    await showQuestion();

    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));

    expect(screen.queryByText("−2s")).not.toBeInTheDocument();
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
    expect(
      screen.getByText("correct in 30 seconds · Sprite"),
    ).toBeInTheDocument();
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
    expect(
      screen.getByText("correct in 30 seconds · Sprite"),
    ).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));

    expect(timeLeft()).toHaveTextContent("30s");
    expect(screen.getByRole("group", { name: "Correct" })).toHaveTextContent(
      "0",
    );
  });
});
