import { describe, expect, it } from "vitest";
import indexHtml from "../index.html?raw";

const head = new DOMParser().parseFromString(indexHtml, "text/html").head;

function metaContent(attribute: "property" | "name", key: string) {
  return head
    .querySelector(`meta[${attribute}="${key}"]`)
    ?.getAttribute("content");
}

describe("link preview tags", () => {
  it.each([
    ["property", "og:title"],
    ["property", "og:description"],
    ["property", "og:image:alt"],
    ["name", "description"],
  ] as const)("sets %s %s", (attribute, key) => {
    expect(metaContent(attribute, key)).toBeTruthy();
  });

  it.each([
    "Party Builder",
    "Who's That Pokémon?",
    "Dex Run",
    "Simon",
    "Pokémon Match",
  ])("names %s in the image text", (game) => {
    expect(metaContent("property", "og:image:alt")).toContain(game);
  });

  it("uses the same description for search results and previews", () => {
    expect(metaContent("name", "description")).toBe(
      metaContent("property", "og:description"),
    );
  });

  it("builds og:image from the site URL", () => {
    expect(metaContent("property", "og:image")).toBe(
      "%VITE_SITE_URL%/og-games.png?v=2",
    );
  });

  it("declares a large 1200x630 image card", () => {
    expect(metaContent("property", "og:image:width")).toBe("1200");
    expect(metaContent("property", "og:image:height")).toBe("630");
    expect(metaContent("name", "twitter:card")).toBe("summary_large_image");
  });
});
