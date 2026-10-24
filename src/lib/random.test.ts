import { describe, expect, it } from "vitest";
import { createRng, sample, shuffle, stepRng } from "./random";

describe("createRng", () => {
  it("repeats the same sequence for the same seed", () => {
    const first = createRng(42);
    const second = createRng(42);

    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it("returns numbers in [0, 1)", () => {
    const rng = createRng(7);
    const values = Array.from({ length: 1000 }, rng);

    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });
});

describe("stepRng", () => {
  it("matches createRng step for step, so state can be stored", () => {
    const rng = createRng(42);
    const first = stepRng(42);
    const second = stepRng(first.state);

    expect([first.value, second.value]).toEqual([rng(), rng()]);
  });
});

describe("sample", () => {
  it("picks distinct items, no more than there are", () => {
    const items = [1, 2, 3, 4, 5];

    expect(new Set(sample(items, 3, createRng(1))).size).toBe(3);
    expect(sample(items, 9, createRng(1)).sort()).toEqual(items);
    expect(sample([], 2, createRng(1))).toEqual([]);
  });
});

describe("shuffle", () => {
  it("keeps every item and leaves the original alone", () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = shuffle(items, createRng(3));

    expect([...shuffled].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });
});
