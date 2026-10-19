import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadTeams, saveTeams } from "../../lib/team-storage";
import { renderApp } from "../../test/renderApp";
import { regularMembers } from "../../test/members";

describe("my teams", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an empty state with no saved teams", async () => {
    renderApp("/");

    await expect(
      screen.findByText("No teams yet"),
    ).resolves.toBeInTheDocument();
  });

  it("shows the empty state when storage can't be read", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    renderApp("/");

    await expect(
      screen.findByText("No teams yet"),
    ).resolves.toBeInTheDocument();
  });

  it("keeps working and warns when storage can't be written", async () => {
    saveTeams([
      { id: "t1", members: regularMembers(1), createdAt: 1, updatedAt: 1 },
    ]);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    const user = userEvent.setup();
    renderApp("/");

    const button = await screen.findByRole("button", { name: "Delete team" });
    await user.click(button);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("No teams yet")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't save");
  });

  it("picks up teams saved in another tab", async () => {
    renderApp("/");
    await screen.findByText("No teams yet");

    saveTeams([
      { id: "t1", members: regularMembers(1), createdAt: 1, updatedAt: 1 },
    ]);
    window.dispatchEvent(
      new StorageEvent("storage", { key: "pokeparty:teams" }),
    );

    await expect(
      screen.findByRole("link", { name: /Edit team/ }),
    ).resolves.toBeInTheDocument();
  });

  it("lists saved teams, most recently edited first", async () => {
    saveTeams([
      { id: "old", members: regularMembers(1), createdAt: 1, updatedAt: 1 },
      {
        id: "new",
        members: regularMembers(1, 4, 7),
        createdAt: 2,
        updatedAt: 5,
      },
    ]);
    renderApp("/");

    const links = await screen.findAllByRole("link", { name: /Edit team/ });
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/team/new",
      "/team/old",
    ]);
  });

  it("deletes a team after confirming", async () => {
    saveTeams([
      { id: "t1", members: regularMembers(1), createdAt: 1, updatedAt: 1 },
    ]);
    const user = userEvent.setup();
    renderApp("/");

    const button = await screen.findByRole("button", { name: "Delete team" });
    await user.click(button);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await expect(
      screen.findByText("No teams yet"),
    ).resolves.toBeInTheDocument();
    expect(loadTeams()).toEqual([]);
  });

  it("keeps the team when delete is cancelled", async () => {
    saveTeams([
      { id: "t1", members: regularMembers(1), createdAt: 1, updatedAt: 1 },
    ]);
    const user = userEvent.setup();
    renderApp("/");

    const button = await screen.findByRole("button", { name: "Delete team" });
    await user.click(button);
    await user.click(screen.getByRole("button", { name: "Keep" }));

    expect(
      screen.getByRole("button", { name: "Delete team" }),
    ).toBeInTheDocument();

    expect(loadTeams()).toHaveLength(1);
  });

  it("copies the share link", async () => {
    saveTeams([
      { id: "t1", members: regularMembers(25, 6), createdAt: 1, updatedAt: 1 },
    ]);
    const user = userEvent.setup();
    renderApp("/");

    const button = await screen.findByRole("button", { name: "Copy link" });
    await user.click(button);

    await expect(navigator.clipboard.readText()).resolves.toBe(
      `${window.location.origin}/share?team=25,6`,
    );
    await expect(screen.findByRole("status")).resolves.toHaveTextContent(
      "Link copied!",
    );
  });

  it("marks shiny members in the copied link", async () => {
    saveTeams([
      {
        id: "t1",
        members: [
          { pokemonId: 25, shiny: true },
          { pokemonId: 6, shiny: false },
        ],
        createdAt: 1,
        updatedAt: 1,
      },
    ]);
    const user = userEvent.setup();
    renderApp("/");

    const button = await screen.findByRole("button", { name: "Copy link" });
    await user.click(button);

    await expect(navigator.clipboard.readText()).resolves.toBe(
      `${window.location.origin}/share?team=25s,6`,
    );
  });

  it("hides the native share button when the browser has none", async () => {
    saveTeams([
      { id: "t1", members: regularMembers(25), createdAt: 1, updatedAt: 1 },
    ]);
    renderApp("/");

    await screen.findByRole("button", { name: "Copy link" });

    expect(
      screen.queryByRole("button", { name: "Share" }),
    ).not.toBeInTheDocument();
  });

  describe("with native share", () => {
    const share = vi.fn();

    beforeEach(() => {
      share.mockReset();
      Object.defineProperty(navigator, "share", {
        value: share,
        configurable: true,
      });
    });

    afterEach(() => {
      Reflect.deleteProperty(navigator, "share");
    });

    it("opens the share sheet with the team link", async () => {
      share.mockResolvedValue(undefined);
      saveTeams([
        {
          id: "t1",
          members: regularMembers(25, 6),
          createdAt: 1,
          updatedAt: 1,
        },
      ]);
      const user = userEvent.setup();
      renderApp("/");

      const button = await screen.findByRole("button", { name: "Share" });
      await user.click(button);

      expect(share).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${window.location.origin}/share?team=25,6`,
        }),
      );
    });

    it("stays quiet when the user cancels the share sheet", async () => {
      share.mockRejectedValue(new DOMException("cancelled", "AbortError"));
      saveTeams([
        { id: "t1", members: regularMembers(25), createdAt: 1, updatedAt: 1 },
      ]);
      const user = userEvent.setup();
      renderApp("/");

      const button = await screen.findByRole("button", { name: "Share" });
      await user.click(button);

      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });
  });
});
