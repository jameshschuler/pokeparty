import { REGIONS, type PokemonSummary } from "../types/pokemon";
import { formatPokemonLabel } from "./pokemon";
import { confusableRegion, REGION_LABELS } from "./regions";

export const ROUND_SECONDS = [30, 60, 90] as const;

export type RoundSeconds = (typeof ROUND_SECONDS)[number];

export const DEFAULT_ROUND_SECONDS: RoundSeconds = 60;

export const QUIZ_MODES = ["sprite", "silhouette", "region"] as const;

export type QuizMode = (typeof QUIZ_MODES)[number];

export const DEFAULT_QUIZ_MODE: QuizMode = "sprite";

type QuizModeRules = {
  choices: "names" | "regions";
  hidesPokemon: boolean;
  usesRegionalForms: boolean;
};

export const QUIZ_MODE_RULES: Record<QuizMode, QuizModeRules> = {
  sprite: { choices: "names", hidesPokemon: false, usesRegionalForms: false },
  silhouette: {
    choices: "names",
    hidesPokemon: true,
    usesRegionalForms: false,
  },
  region: { choices: "regions", hidesPokemon: false, usesRegionalForms: true },
};

export type QuizSettings = {
  mode: QuizMode;
  seconds: RoundSeconds;
};

export const CHOICE_COUNT = 4;

export const FEEDBACK_MS = 300;

export const WRONG_ANSWER_PENALTY_MS = 2000;

export const CLOCK_TICK_MS = 100;

export type Rng = () => number;

export type QuizChoice = {
  key: string;
  label: string;
};

export type QuizQuestion = {
  answer: PokemonSummary;
  answerKey: string;
  choices: QuizChoice[];
};

export type QuizState = {
  mode: QuizMode;
  pool: PokemonSummary[];
  current: QuizQuestion;
  upcoming: QuizQuestion;
  deck: PokemonSummary[];
  deckIndex: number;
  pickedKey: string | null;
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
  shown: boolean;
  onHold: boolean;
  penaltyMs: number;
};

export function isRoundSeconds(value: number): value is RoundSeconds {
  return ROUND_SECONDS.some((seconds) => seconds === value);
}

export function isQuizMode(value: unknown): value is QuizMode {
  return QUIZ_MODES.some((mode) => mode === value);
}

export function parseQuizMode(value: unknown): QuizMode {
  return isQuizMode(value) ? value : DEFAULT_QUIZ_MODE;
}

export function parseQuizModeSearch(search: Record<string, unknown>): {
  mode: QuizMode;
} {
  return { mode: parseQuizMode(search.mode) };
}

export function isPokemonHidden(state: QuizState): boolean {
  return QUIZ_MODE_RULES[state.mode].hidesPokemon && state.pickedKey === null;
}

export function parseQuizSettings(
  search: Record<string, unknown>,
): QuizSettings {
  const seconds = Number(search.seconds);

  return {
    mode: parseQuizMode(search.mode),
    seconds: isRoundSeconds(seconds) ? seconds : DEFAULT_ROUND_SECONDS,
  };
}

// mulberry32: a small seeded PRNG, so a seed always gives the same sequence.
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

function nameQuestion(
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
  const choices = [answer, ...distractors].map((pokemon) => ({
    key: String(pokemon.id),
    label: formatPokemonLabel(pokemon),
  }));

  return {
    answer,
    answerKey: String(answer.id),
    choices: shuffle(choices, rng),
  };
}

function regionQuestion(answer: PokemonSummary, rng: Rng): QuizQuestion {
  const confusable = confusableRegion(answer.region);
  const others = REGIONS.filter(
    (region) => region !== answer.region && region !== confusable,
  );
  const regions = [answer.region, ...sample(others, CHOICE_COUNT - 1, rng)];
  const choices = regions.map((region) => ({
    key: region,
    label: REGION_LABELS[region],
  }));

  return { answer, answerKey: answer.region, choices: shuffle(choices, rng) };
}

export function buildQuestion(
  mode: QuizMode,
  answer: PokemonSummary,
  pool: PokemonSummary[],
  rng: Rng,
): QuizQuestion {
  return QUIZ_MODE_RULES[mode].choices === "regions"
    ? regionQuestion(answer, rng)
    : nameQuestion(answer, pool, rng);
}

export function startQuiz(
  pool: PokemonSummary[],
  rng: Rng,
  mode: QuizMode,
): QuizState {
  const first = drawAnswer(pool, [], 0, null, rng);
  const second = drawAnswer(
    pool,
    first.deck,
    first.deckIndex,
    first.answer.id,
    rng,
  );

  return {
    mode,
    pool,
    current: buildQuestion(mode, first.answer, pool, rng),
    upcoming: buildQuestion(mode, second.answer, pool, rng),
    deck: second.deck,
    deckIndex: second.deckIndex,
    pickedKey: null,
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
  };
}

export function answerQuestion(state: QuizState, pickedKey: string): QuizState {
  if (state.pickedKey !== null) {
    return state;
  }

  if (pickedKey === state.current.answerKey) {
    const streak = state.streak + 1;

    return {
      ...state,
      pickedKey,
      correct: state.correct + 1,
      streak,
      bestStreak: Math.max(state.bestStreak, streak),
    };
  }

  return { ...state, pickedKey, wrong: state.wrong + 1, streak: 0 };
}

export function advanceQuestion(state: QuizState, rng: Rng): QuizState {
  const next = drawAnswer(
    state.pool,
    state.deck,
    state.deckIndex,
    state.upcoming.answer.id,
    rng,
  );

  return {
    ...state,
    current: state.upcoming,
    upcoming: buildQuestion(state.mode, next.answer, state.pool, rng),
    deck: next.deck,
    deckIndex: next.deckIndex,
    pickedKey: null,
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
  settings: QuizSettings,
  now: number,
): QuizRound {
  return {
    quiz: startQuiz(pool, rng, settings.mode),
    clock: startClock(settings.seconds, now),
    shown: false,
    onHold: false,
    penaltyMs: 0,
  };
}

export function isClockRunning(round: QuizRound): boolean {
  return round.shown && round.quiz.pickedKey === null && !round.onHold;
}

function settleClock(round: QuizRound, now: number): QuizRound {
  const clock = isClockRunning(round)
    ? resumeClock(round.clock, now)
    : pauseClock(round.clock, now);

  return clock === round.clock ? round : { ...round, clock };
}

function canAnswer(round: QuizRound, now: number): boolean {
  return (
    round.shown &&
    !round.onHold &&
    round.quiz.pickedKey === null &&
    remainingMs(round.clock, now) > 0
  );
}

export function answerRound(
  round: QuizRound,
  pickedKey: string,
  now: number,
): QuizRound {
  if (!canAnswer(round, now)) {
    return round;
  }

  const answered = settleClock(
    { ...round, quiz: answerQuestion(round.quiz, pickedKey) },
    now,
  );

  if (pickedKey === round.quiz.current.answerKey) {
    return answered;
  }

  const penaltyMs = Math.min(
    WRONG_ANSWER_PENALTY_MS,
    remainingMs(answered.clock, now),
  );

  return {
    ...answered,
    clock: { ...answered.clock, endsAt: answered.clock.endsAt - penaltyMs },
    penaltyMs,
  };
}

export function isRoundOver(round: QuizRound, now: number): boolean {
  return remainingMs(round.clock, now) === 0 && round.quiz.pickedKey === null;
}

export function describeAnswer(state: QuizState): string {
  const { answer } = state.current;
  const name = formatPokemonLabel(answer);

  return QUIZ_MODE_RULES[state.mode].choices === "regions"
    ? `It's ${name}, from ${REGION_LABELS[answer.region]}!`
    : `It's ${name}!`;
}

export function formatPenalty(penaltyMs: number): string {
  return `−${Number((penaltyMs / 1000).toFixed(1))}s`;
}

export function showQuestion(round: QuizRound, now: number): QuizRound {
  if (round.shown) {
    return round;
  }

  return settleClock({ ...round, shown: true }, now);
}

export function nextQuestion(
  round: QuizRound,
  rng: Rng,
  now: number,
): QuizRound {
  return settleClock(
    {
      ...round,
      quiz: advanceQuestion(round.quiz, rng),
      shown: false,
      penaltyMs: 0,
    },
    now,
  );
}

export function holdRound(round: QuizRound, now: number): QuizRound {
  return round.onHold ? round : settleClock({ ...round, onHold: true }, now);
}

export function releaseRound(round: QuizRound, now: number): QuizRound {
  return round.onHold ? settleClock({ ...round, onHold: false }, now) : round;
}

export function accuracy(correct: number, wrong: number): number {
  const total = correct + wrong;

  return total === 0 ? 0 : Math.round((correct / total) * 100);
}
