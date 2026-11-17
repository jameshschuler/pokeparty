import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NATURE_DEX_STORAGE_KEY } from "../../lib/nature-dex-settings";
import { renderApp } from "../../test/renderApp";

function rowNames(): string[] {
  const list = screen.getByRole("list", { name: "Pokémon" });

  return within(list)
    .getAllByRole("article")
    .map((row) => row.getAttribute("aria-label") ?? "");
}

describe("nature dex", () => {
  it("opens filtered from the URL", async () => {
    renderApp("/nature-dex?q=chu&region=kanto");

    await screen.findByRole("heading", { name: "Nature Dex" });

    expect(rowNames()).toEqual(["Pikachu", "Raichu"]);
    expect(screen.getByText("2 of 386 shown")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kanto" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("ignores a bad filter in the URL", async () => {
    renderApp("/nature-dex?q=machamp&role=tank");

    await screen.findByRole("heading", { name: "Nature Dex" });

    expect(rowNames()).toEqual(["Machamp"]);
  });

  it("puts the search in the URL as you type", async () => {
    const user = userEvent.setup();
    const router = renderApp("/nature-dex?region=johto");

    const search = await screen.findByRole("searchbox", {
      name: "Search Pokémon",
    });
    await user.type(search, "Mr. M");

    await waitFor(() =>
      expect(router.state.location.search).toEqual({
        q: "Mr. M",
        region: "johto",
      }),
    );
    expect(screen.getByRole("searchbox")).toHaveValue("Mr. M");
  });

  it("filters by role from its chip", async () => {
    const user = userEvent.setup();
    const router = renderApp("/nature-dex?region=kanto");

    await user.click(await screen.findByRole("button", { name: "Utility" }));

    expect(rowNames()).toEqual(["Ditto"]);
    expect(router.state.location.search).toEqual({
      region: "kanto",
      role: "utility",
    });
  });

  it(
    "shows an empty state that clears the filters",
    { timeout: 15_000 },
    async () => {
      const user = userEvent.setup();
      const router = renderApp("/nature-dex?q=agumon");

      const clear = await screen.findByRole("button", {
        name: "Clear filters",
      });
      expect(
        screen.getByText("No Pokémon match these filters."),
      ).toBeInTheDocument();

      await user.click(clear);

      await waitFor(() => expect(router.state.location.search).toEqual({}));
      expect(screen.getByText("386 of 386 shown")).toBeInTheDocument();
    },
  );

  it("filters by a nature tapped in the chart", async () => {
    const user = userEvent.setup();
    const router = renderApp("/nature-dex?q=gengar");

    const chart = await screen.findByRole("table");
    await user.click(within(chart).getByRole("button", { name: "Lonely" }));

    expect(router.state.location.search).toEqual({
      q: "gengar",
      nature: "Lonely",
    });
    expect(
      screen.getByText("No Pokémon match these filters."),
    ).toBeInTheDocument();
  });

  it("only colors move categories when every evolution shares a role", async () => {
    const user = userEvent.setup();
    renderApp("/nature-dex?q=eevee");

    await user.click(await screen.findByRole("button", { name: /Moves/ }));

    expect(screen.queryByText(/Green categories/)).not.toBeInTheDocument();
  });

  it("opens a row's moves and switches to where to find it", async () => {
    const user = userEvent.setup();
    renderApp("/nature-dex?q=pikachu");

    await user.click(await screen.findByRole("button", { name: /Moves/ }));

    expect(screen.getByRole("tab", { name: /Level up/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("cell", { name: "Thunder Shock" })).toBeVisible();

    await user.click(screen.getByRole("tab", { name: /Where to find/ }));

    expect(screen.getByText("Viridian Forest")).toBeInTheDocument();
  });

  it("uses the learnset and sprites saved in settings", async () => {
    localStorage.setItem(
      NATURE_DEX_STORAGE_KEY,
      JSON.stringify({ learnset: "gen3", split: true, shiny: true }),
    );
    renderApp("/nature-dex?q=venusaur");

    await screen.findByRole("heading", { name: "Nature Dex" });

    expect(screen.getByText(/Best physical: Poison Jab/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Shiny Venusaur" })).toBeVisible();
  });

  it("saves a setting changed in the dialog", async () => {
    const user = userEvent.setup();
    renderApp("/nature-dex?q=venusaur");

    await user.click(await screen.findByRole("button", { name: "Settings" }));
    const learnsets = screen.getByRole("list", { name: "Learnsets" });
    await user.click(within(learnsets).getByRole("button", { name: "Gen 3" }));

    expect(screen.getByText(/Best physical: Poison Jab/)).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem(NATURE_DEX_STORAGE_KEY) ?? "{}"),
    ).toMatchObject({ learnset: "gen3" });
  });

  it("shows a placeholder when a sprite fails to load", async () => {
    renderApp("/nature-dex?q=bulbasaur");

    const sprite = await screen.findByRole("img", { name: "Bulbasaur" });
    fireEvent.error(sprite);

    expect(screen.getByRole("img", { name: "Bulbasaur" })).toHaveAttribute(
      "title",
      "Sprite unavailable",
    );
  });
});
