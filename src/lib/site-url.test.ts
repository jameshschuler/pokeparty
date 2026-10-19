import { describe, expect, it } from "vitest";
import { validateSiteUrl } from "./site-url";

describe("validateSiteUrl", () => {
  it.each([
    "https://pokeparty-sd5l.onrender.com",
    "http://localhost:5173",
    "https://example.com/pokeparty",
  ])("accepts %s", (value) => {
    expect(validateSiteUrl(value)).toBe(value);
  });

  it.each([
    undefined,
    "",
    "pokeparty.app",
    "/og-image.png",
    "ftp://pokeparty.app",
    "https://pokeparty.app/",
    "https://pokeparty.app/path/",
    "https:// pokeparty.app",
  ])("rejects %j", (value) => {
    expect(() => validateSiteUrl(value)).toThrow("VITE_SITE_URL");
  });
});
