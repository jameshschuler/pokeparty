export type Rng = () => number;

export type RngStep = {
  value: number;
  state: number;
};

// mulberry32: a small seeded PRNG, so a seed always gives the same sequence.
export function stepRng(state: number): RngStep {
  const next = (state + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, state: next };
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  return () => {
    const step = stepRng(state);
    state = step.state;

    return step.value;
  };
}

export function sample<T>(items: T[], count: number, rng: Rng): T[] {
  const picked = new Set<number>();
  while (picked.size < Math.min(count, items.length)) {
    picked.add(Math.floor(rng() * items.length));
  }

  return [...picked].map((index) => items[index]);
}

export function shuffle<T>(items: T[], rng: Rng): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swap = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }

  return shuffled;
}
