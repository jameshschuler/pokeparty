import { describe, expect, it } from "vitest";
import { formatDate } from "./dates";

describe("formatDate", () => {
  it("shows the day, month and year", () => {
    const timestamp = new Date(2026, 9, 20, 15, 30).getTime();

    expect(formatDate(timestamp)).toMatch(/Oct.*20.*2026/);
  });
});
