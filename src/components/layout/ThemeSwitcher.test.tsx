import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderApp } from "../../test/renderApp";

describe("theme switcher", () => {
  let style: HTMLStyleElement;
  let meta: HTMLMetaElement;

  beforeEach(() => {
    style = document.createElement("style");
    style.textContent =
      ':root { --color-primary: #6a2fbd; } :root[data-theme="ultra"] { --color-primary: #2b2b2b; }';
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(style, meta);
  });

  afterEach(() => {
    style.remove();
    meta.remove();
    delete document.documentElement.dataset.theme;
  });

  it("lists the balls in order: Poké, Great, Ultra, Master", async () => {
    renderApp("/");

    const group = await screen.findByRole("group", { name: "Theme" });
    const labels = [...group.querySelectorAll("button")].map((button) =>
      button.getAttribute("aria-label"),
    );

    expect(labels).toEqual([
      "Poké Ball",
      "Great Ball",
      "Ultra Ball",
      "Master Ball",
    ]);
  });

  it("starts on the Master Ball theme", async () => {
    renderApp("/");

    const master = await screen.findByRole("button", { name: "Master Ball" });

    expect(master).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.theme).toBe("master");
  });

  it("switches and remembers the theme", async () => {
    const user = userEvent.setup();
    renderApp("/");

    const ultra = await screen.findByRole("button", { name: "Ultra Ball" });
    await user.click(ultra);

    expect(ultra).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.theme).toBe("ultra");
    expect(localStorage.getItem("pokeparty:theme")).toBe("ultra");
  });

  it("updates the browser bar color to the theme's primary color", async () => {
    const user = userEvent.setup();
    renderApp("/");

    const ultra = await screen.findByRole("button", { name: "Ultra Ball" });
    await user.click(ultra);

    expect(meta.content).toBe("#2b2b2b");
  });

  it("starts on the saved theme", async () => {
    localStorage.setItem("pokeparty:theme", "great");
    renderApp("/");

    const great = await screen.findByRole("button", { name: "Great Ball" });

    expect(great).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.theme).toBe("great");
  });

  it("follows a theme change made in another tab", async () => {
    renderApp("/");
    await screen.findByRole("button", { name: "Poké Ball" });

    localStorage.setItem("pokeparty:theme", "poke");
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "pokeparty:theme" }),
      );
    });

    expect(screen.getByRole("button", { name: "Poké Ball" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.documentElement.dataset.theme).toBe("poke");
  });
});
