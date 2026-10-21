import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findPokemon } from "../../lib/pokedex";
import { formatPokemonLabel } from "../../lib/pokemon";
import { REGION_LABELS } from "../../lib/regions";
import { FEEDBACK_MS, SPRITE_LOAD_TIMEOUT_MS } from "../../lib/quiz";
import { renderApp } from "../../test/renderApp";

function currentPokemon() {
  const sprite = screen.getByRole("img", { name: "Mystery Pokémon" });
  const id = Number(sprite.getAttribute("src")!.match(/(\d+)\.png$/)![1]);

  return findPokemon(id)!;
}

function currentAnswerLabel() {
  return formatPokemonLabel(currentPokemon());
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

    const ninety = await screen.findByRole("link", { name: /^90s/ });
    await user.click(ninety);

    expect(router.state.location.pathname).toBe("/quiz/play");
    expect(router.state.location.search).toEqual({
      mode: "sprite",
      clock: 90,
    });
    await expect(
      screen.findByRole("timer", { name: "Time left" }),
    ).resolves.toHaveTextContent("90s");
  });

  it.each(["clock=45", "clock=abc", ""])(
    "falls back to 60 seconds for %j",
    async (query) => {
      renderApp(`/quiz/play?${query}`);

      await expect(
        screen.findByRole("timer", { name: "Time left" }),
      ).resolves.toHaveTextContent("60s");
    },
  );
});

describe("time attack", () => {
  it("starts from the setup screen with 30 seconds", async () => {
    const user = userEvent.setup();
    const router = renderApp("/quiz?mode=region");

    const attack = await screen.findByRole("link", { name: /Time attack/ });
    await user.click(attack);

    expect(router.state.location.search).toEqual({
      mode: "region",
      clock: "attack",
    });
    await expect(
      screen.findByRole("timer", { name: "Time left" }),
    ).resolves.toHaveTextContent("30s");
  });

  it("adds time for a right answer", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?clock=attack");
    await showQuestion();
    act(() => vi.advanceTimersByTime(5_000));

    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));

    expect(screen.getByText("+3s")).toBeInTheDocument();
    expect(screen.getByRole("timer", { name: "Time left" })).toHaveTextContent(
      "28s",
    );
  });

  it("names time attack on the summary", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?mode=region&clock=attack");
    await showQuestion();
    act(() => vi.advanceTimersByTime(30_200));

    expect(
      screen.getByText("correct · Region · Time attack"),
    ).toBeInTheDocument();
  });
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
    await user.click(screen.getByRole("link", { name: /^60s/ }));

    expect(router.state.location.pathname).toBe("/quiz/play");
    expect(router.state.location.search).toEqual({
      mode: "silhouette",
      clock: 60,
    });
  });

  it("hides the Pokémon in silhouette mode until it's answered", async () => {
    renderApp("/quiz/play?mode=silhouette&clock=30");
    await showQuestion();
    const sprite = screen.getByRole("img", { name: "Mystery Pokémon" });

    expect(sprite).toHaveClass("brightness-0");

    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));

    expect(sprite).not.toHaveClass("brightness-0");
  });

  it("shows the Pokémon in sprite mode", async () => {
    renderApp("/quiz/play?mode=sprite&clock=30");
    await showQuestion();

    expect(
      screen.getByRole("img", { name: "Mystery Pokémon" }),
    ).not.toHaveClass("brightness-0");
  });

  it("names the mode on the summary and keeps it for the next setup", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const router = renderApp("/quiz/play?mode=silhouette&clock=30");
    await showQuestion();
    act(() => vi.advanceTimersByTime(30_200));

    expect(screen.getByText("correct · Silhouette · 30s")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Change setup" }));

    expect(router.state.location.pathname).toBe("/quiz");
    expect(router.state.location.search).toEqual({ mode: "silhouette" });
  });
});

describe("mode difficulty", () => {
  it.each([
    [/Sprite/, "Beginner"],
    [/Silhouette/, "Beginner"],
    [/Region/, "Intermediate"],
    [/Dex number/, "Advanced"],
  ])("tags %s as %s", async (mode, difficulty) => {
    renderApp("/quiz");

    const card = await screen.findByRole("button", { name: mode });

    expect(card).toHaveTextContent(difficulty);
  });
});

describe("region mode", () => {
  it("can be picked on the setup screen", async () => {
    const user = userEvent.setup();
    const router = renderApp("/quiz");

    await user.click(await screen.findByRole("button", { name: /Region/ }));
    await user.click(screen.getByRole("link", { name: /^30s/ }));

    expect(router.state.location.search).toEqual({
      mode: "region",
      clock: 30,
    });
  });

  it("asks for the region and offers four regions", async () => {
    renderApp("/quiz/play?mode=region&clock=30");
    await showQuestion();
    const regionLabels = Object.values(REGION_LABELS);

    expect(screen.getByText("Which region is it from?")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Mystery Pokémon" }),
    ).not.toHaveClass("brightness-0");

    const labels = choiceButtons().map((button) => button.textContent!);

    expect(labels).toHaveLength(4);
    expect(labels.every((label) => regionLabels.includes(label))).toBe(true);
    expect(labels).toContain(REGION_LABELS[currentPokemon().region]);
  });

  it("scores the right region and names it in the reveal", async () => {
    renderApp("/quiz/play?mode=region&clock=30");
    await showQuestion();
    const pokemon = currentPokemon();
    const region = REGION_LABELS[pokemon.region];

    fireEvent.click(screen.getByRole("button", { name: region }));

    expect(screen.getByRole("group", { name: "Correct" })).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByText(`It's ${formatPokemonLabel(pokemon)}, from ${region}!`),
    ).toBeInTheDocument();
  });
});

describe("dex number mode", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function dexAnswer() {
    const number = screen.getByLabelText("Dex number").textContent!;

    return findPokemon(Number(number.replace("#", "")))!;
  }

  function spriteChoices() {
    return within(screen.getByRole("list")).getAllByRole("button");
  }

  function choiceFor(id: number) {
    return spriteChoices().find((button) =>
      button.querySelector("img")!.getAttribute("src")!.endsWith(`/${id}.png`),
    )!;
  }

  it("shows the number and four unnamed sprite choices", async () => {
    renderApp("/quiz/play?mode=dex&clock=30");

    await screen.findByLabelText("Dex number");

    expect(screen.getByText("Which Pokémon is this?")).toBeInTheDocument();
    expect(
      spriteChoices().map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Choice 1", "Choice 2", "Choice 3", "Choice 4"]);

    for (const button of spriteChoices()) {
      fireEvent.load(button.querySelector("img")!);
    }

    expect(choiceFor(dexAnswer().id)).toBeInTheDocument();
  });

  it("hides the number until the sprites have loaded", async () => {
    renderApp("/quiz/play?mode=dex&clock=30");
    await screen.findByLabelText("Dex number");

    expect(screen.getByLabelText("Dex number")).toHaveTextContent("#????");

    for (const button of spriteChoices()) {
      fireEvent.load(button.querySelector("img")!);
    }

    expect(screen.getByLabelText("Dex number")).not.toHaveTextContent("?");
  });

  it("offers to skip when a sprite never finishes loading", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?mode=dex&clock=30");
    await screen.findByLabelText("Dex number");
    const [first, second, third] = spriteChoices();
    for (const button of [first, second, third]) {
      fireEvent.load(button.querySelector("img")!);
    }

    act(() => vi.advanceTimersByTime(SPRITE_LOAD_TIMEOUT_MS));

    expect(
      screen.getByText("Couldn't load these Pokémon."),
    ).toBeInTheDocument();
    expect(screen.getByRole("timer", { name: "Time left" })).toHaveTextContent(
      "30s",
    );
  });

  it("waits for all four sprites before the clock starts", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?mode=dex&clock=30");
    await screen.findByLabelText("Dex number");

    const [first, ...rest] = spriteChoices();
    fireEvent.load(first.querySelector("img")!);
    act(() => vi.advanceTimersByTime(5_100));
    expect(screen.getByRole("timer", { name: "Time left" })).toHaveTextContent(
      "30s",
    );
    expect(first).toBeDisabled();

    for (const button of rest) {
      fireEvent.load(button.querySelector("img")!);
    }
    act(() => vi.advanceTimersByTime(5_100));

    expect(screen.getByRole("timer", { name: "Time left" })).toHaveTextContent(
      "25s",
    );
    expect(first).toBeEnabled();
  });

  it("scores the right sprite and names every choice in the reveal", async () => {
    renderApp("/quiz/play?mode=dex&clock=30");
    await screen.findByLabelText("Dex number");
    for (const button of spriteChoices()) {
      fireEvent.load(button.querySelector("img")!);
    }
    const pokemon = dexAnswer();

    fireEvent.click(choiceFor(pokemon.id));

    expect(screen.getByRole("group", { name: "Correct" })).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByText(
        `#${String(pokemon.speciesId).padStart(4, "0")} is ${formatPokemonLabel(pokemon)}!`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: formatPokemonLabel(pokemon) }),
    ).toBeInTheDocument();
  });

  it("offers to skip when a choice sprite won't load", async () => {
    renderApp("/quiz/play?mode=dex&clock=30");
    await screen.findByLabelText("Dex number");
    const before = spriteChoices().map((button) =>
      button.querySelector("img")!.getAttribute("src"),
    );

    fireEvent.error(spriteChoices()[2].querySelector("img")!);
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));

    expect(
      spriteChoices().map((button) =>
        button.querySelector("img")!.getAttribute("src"),
      ),
    ).not.toEqual(before);
    expect(screen.getByRole("group", { name: "Correct" })).toHaveTextContent(
      "0",
    );
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
    renderApp("/quiz/play?clock=30");
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
    renderApp("/quiz/play?clock=30");
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
    renderApp("/quiz/play?clock=30");
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
    const router = renderApp("/quiz/play?mode=silhouette&clock=30");
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
    renderApp("/quiz/play?clock=30");
    await showQuestion();

    const labels = choiceButtons().map((button) => button.textContent);

    expect(labels).toHaveLength(4);
    expect(labels).toContain(currentAnswerLabel());
  });

  it("scores a right answer, reveals it, then moves on", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?clock=30");
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
    renderApp("/quiz/play?clock=30");
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
    renderApp("/quiz/play?clock=30");
    await showQuestion();
    const answer = currentAnswerLabel();

    fireEvent.click(
      choiceButtons().find((button) => button.textContent !== answer)!,
    );

    expect(screen.getByText("−2s")).toBeInTheDocument();
  });

  it("shows the reveal before ending a round a wrong answer runs out", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?clock=30");
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
    renderApp("/quiz/play?clock=30");
    await showQuestion();

    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));

    expect(screen.queryByText("−2s")).not.toBeInTheDocument();
  });

  it("counts a wrong answer and doesn't allow a second guess", async () => {
    renderApp("/quiz/play?clock=30");
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

  it("offers to skip when the prompt sprite never finishes loading", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?clock=30");
    await screen.findByRole("img", { name: "Mystery Pokémon" });

    act(() => vi.advanceTimersByTime(SPRITE_LOAD_TIMEOUT_MS));

    expect(screen.getByText("Couldn't load this Pokémon.")).toBeInTheDocument();
    expect(timeLeft()).toHaveTextContent("30s");
  });

  it("waits for the first sprite before the clock starts", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?clock=30");
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
    renderApp("/quiz/play?clock=30");
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
    renderApp("/quiz/play?clock=30");
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

  it("ends the round when the timer fires a moment early", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?clock=30");
    await showQuestion();

    act(() => vi.advanceTimersByTime(30_000 - 1));
    vi.setSystemTime(Date.now() - 5);
    act(() => vi.advanceTimersByTime(1));

    expect(
      screen.getByRole("heading", { name: "Time's up!" }),
    ).toBeInTheDocument();
  });

  it("ignores a guess made after time runs out", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?clock=30");
    await showQuestion();
    act(() => vi.advanceTimersByTime(29_950));

    vi.setSystemTime(Date.now() + 100);
    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));
    act(() => vi.advanceTimersByTime(100));

    expect(
      screen.getByRole("heading", { name: "Time's up!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("correct · Sprite · 30s")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("links the summary to a shareable result", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const router = renderApp("/quiz/play?mode=silhouette&clock=30");
    await showQuestion();
    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));
    act(() => vi.advanceTimersByTime(FEEDBACK_MS));
    await showQuestion();
    act(() => vi.advanceTimersByTime(30_200));

    await user.click(screen.getByRole("link", { name: "Share result" }));

    expect(router.state.location.pathname).toBe("/quiz/result");
    expect(router.state.location.search).toEqual({
      mode: "silhouette",
      clock: 30,
      score: 1,
      wrong: 0,
      streak: 1,
    });
  });

  it("ends the round when time runs out and can start again", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp("/quiz/play?clock=30");
    await showQuestion();
    fireEvent.click(screen.getByRole("button", { name: currentAnswerLabel() }));
    act(() => vi.advanceTimersByTime(FEEDBACK_MS));
    await showQuestion();
    act(() => vi.advanceTimersByTime(30_000 + 200));

    expect(
      screen.getByRole("heading", { name: "Time's up!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("correct · Sprite · 30s")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));

    expect(timeLeft()).toHaveTextContent("30s");
    expect(screen.getByRole("group", { name: "Correct" })).toHaveTextContent(
      "0",
    );
  });
});
