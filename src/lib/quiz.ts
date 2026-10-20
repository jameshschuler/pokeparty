import type { PokemonSummary } from "../types/pokemon";

export const ROUND_SECONDS = [30, 60, 90] as const;

export type RoundSeconds = (typeof ROUND_SECONDS)[number];

export const DEFAULT_ROUND_SECONDS: RoundSeconds = 60;

export const CHOICE_COUNT = 4;

export const FEEDBACK_MS = 300;

export const CLOCK_TICK_MS = 100;

export type Rng = () => number;

export type QuizQuestion = {
  answer: PokemonSummary;
  choices: PokemonSummary[];
};

export type QuizState = {
  current: QuizQuestion;
  upcoming: QuizQuestion;
  deck: PokemonSummary[];
  deckIndex: number;
  pickedId: number | null;
  correct: number;
  wrong: number;
  streak: number;
  bestStreak: number;
};

export type RoundClock = {
  endsAt: number;
  pausedAt: number | null;
};

export type QuizRound = {
  quiz: QuizState;
  clock: RoundClock;
};

export function isRoundSeconds(value: number): value is RoundSeconds {
  return ROUND_SECONDS.some((seconds) => seconds === value);
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sample<T>(items: T[], count: number, rng: Rng): T[] {
  const picked = new Set<number>();
  while (picked.size < Math.min(count, items.length)) {
    picked.add(Math.floor(rng() * items.length));
  }

  return [...picked].map((index) => items[index]);
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swap = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }

  return shuffled;
}

type Draw = {
  answer: PokemonSummary;
  deck: PokemonSummary[];
  deckIndex: number;
};

export function drawAnswer(
  pool: PokemonSummary[],
  deck: PokemonSummary[],
  deckIndex: number,
  lastId: number | null,
  rng: Rng,
): Draw {
  if (deckIndex < deck.length) {
    return { answer: deck[deckIndex], deck, deckIndex: deckIndex + 1 };
  }

  const fresh = shuffle(pool, rng);

  if (fresh.length > 1 && fresh[0].id === lastId) {
    [fresh[0], fresh[fresh.length - 1]] = [fresh[fresh.length - 1], fresh[0]];
  }

  return { answer: fresh[0], deck: fresh, deckIndex: 1 };
}

export function buildQuestion(
  answer: PokemonSummary,
  pool: PokemonSummary[],
  rng: Rng,
): QuizQuestion {
  const others = pool.filter((pokemon) => pokemon.id !== answer.id);
  const sameRegion = others.filter(
    (pokemon) => pokemon.region === answer.region,
  );
  const distractorPool =
    sameRegion.length >= CHOICE_COUNT - 1 ? sameRegion : others;
  const distractors = sample(distractorPool, CHOICE_COUNT - 1, rng);

  return { answer, choices: shuffle([answer, ...distractors], rng) };
}

export function startQuiz(pool: PokemonSummary[], rng: Rng): QuizState {
  const first = drawAnswer(pool, [], 0, null, rng);
  const second = drawAnswer(
    pool,
    first.deck,
    first.deckIndex,
    first.answer.id,
    rng,
  );

  return {
    current: buildQuestion(first.answer, pool, rng),
    upcoming: buildQuestion(second.answer, pool, rng),
    deck: second.deck,
    deckIndex: second.deckIndex,
    pickedId: null,
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
  };
}

export function answerQuestion(state: QuizState, pickedId: number): QuizState {
  if (state.pickedId !== null) {
    return state;
  }

  if (pickedId === state.current.answer.id) {
    const streak = state.streak + 1;

    return {
      ...state,
      pickedId,
      correct: state.correct + 1,
      streak,
      bestStreak: Math.max(state.bestStreak, streak),
    };
  }

  return { ...state, pickedId, wrong: state.wrong + 1, streak: 0 };
}

export function advanceQuestion(
  state: QuizState,
  pool: PokemonSummary[],
  rng: Rng,
): QuizState {
  const next = drawAnswer(
    pool,
    state.deck,
    state.deckIndex,
    state.upcoming.answer.id,
    rng,
  );

  return {
    ...state,
    current: state.upcoming,
    upcoming: buildQuestion(next.answer, pool, rng),
    deck: next.deck,
    deckIndex: next.deckIndex,
    pickedId: null,
  };
}

export function startClock(seconds: RoundSeconds, now: number): RoundClock {
  return { endsAt: now + seconds * 1000, pausedAt: now };
}

export function pauseClock(clock: RoundClock, now: number): RoundClock {
  return clock.pausedAt === null ? { ...clock, pausedAt: now } : clock;
}

export function resumeClock(clock: RoundClock, now: number): RoundClock {
  if (clock.pausedAt === null) {
    return clock;
  }

  return { endsAt: clock.endsAt + (now - clock.pausedAt), pausedAt: null };
}

export function remainingMs(clock: RoundClock, now: number): number {
  return Math.max(0, clock.endsAt - (clock.pausedAt ?? now));
}

export function startRound(
  pool: PokemonSummary[],
  rng: Rng,
  seconds: RoundSeconds,
  now: number,
): QuizRound {
  return { quiz: startQuiz(pool, rng), clock: startClock(seconds, now) };
}

export function isWaitingForQuestion(round: QuizRound): boolean {
  return round.clock.pausedAt !== null && round.quiz.pickedId === null;
}

export function answerRound(
  round: QuizRound,
  pickedId: number,
  now: number,
): QuizRound {
  if (
    isWaitingForQuestion(round) ||
    round.quiz.pickedId !== null ||
    remainingMs(round.clock, now) === 0
  ) {
    return round;
  }

  return {
    quiz: answerQuestion(round.quiz, pickedId),
    clock: pauseClock(round.clock, now),
  };
}

export function showQuestion(round: QuizRound, now: number): QuizRound {
  if (!isWaitingForQuestion(round)) {
    return round;
  }

  return { ...round, clock: resumeClock(round.clock, now) };
}

export function nextQuestion(
  round: QuizRound,
  pool: PokemonSummary[],
  rng: Rng,
): QuizRound {
  return { ...round, quiz: advanceQuestion(round.quiz, pool, rng) };
}

export function accuracy(correct: number, wrong: number): number {
  const total = correct + wrong;

  return total === 0 ? 0 : Math.round((correct / total) * 100);
}
