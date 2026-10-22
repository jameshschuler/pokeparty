import { describe, expect, it } from "vitest";
import { parseCount } from "./parse";

describe("parseCount", () => {
  it.each([
    [0, 0],
    [7, 7],
    ["7", 7],
    [10, 10],
    [11, null],
    [-1, null],
    [2.5, null],
    ["", null],
    ["seven", null],
    [null, null],
    [true, null],
  ])("%j -> %j (max 10)", (value, expected) => {
    expect(parseCount(value, 10)).toBe(expected);
  });
});
