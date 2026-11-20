import { describe, expect, it } from "vitest";
import { parsePickSearch } from "./playthrough-search";

describe("parsePickSearch", () => {
  it("keeps the member being swapped out", () => {
    expect(parsePickSearch({ swap: "abc" })).toEqual({ swap: "abc" });
  });

  it.each([{}, { swap: "" }, { swap: 7 }, { swap: null }])(
    "drops a missing or bad swap in %j",
    (search) => {
      expect(parsePickSearch(search)).toEqual({});
    },
  );
});
