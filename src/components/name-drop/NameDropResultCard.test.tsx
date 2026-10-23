import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../test/renderApp";

describe("name drop result page", () => {
  it("shows the shared score", async () => {
    renderApp("/name-drop/result?score=1240&cleared=23");

    await expect(screen.findByText("1240")).resolves.toBeInTheDocument();
    expect(screen.getByText("23 Pokémon named")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Play Name Drop" }),
    ).toHaveAttribute("href", "/name-drop/play");
    expect(screen.getByRole("link", { name: "Main menu" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("explains a broken link", async () => {
    renderApp("/name-drop/result?score=7&cleared=23");

    await expect(
      screen.findByRole("heading", { name: "This link doesn't have a result" }),
    ).resolves.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Play Name Drop" }),
    ).toHaveAttribute("href", "/name-drop/play");
  });
});
