import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNow } from "./useNow";

function Clock() {
  return <p data-testid="now">{useNow(100)}</p>;
}

function shownNow() {
  return Number(screen.getByTestId("now").textContent);
}

describe("useNow", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 1_000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts at the current time", () => {
    render(<Clock />);

    expect(shownNow()).toBe(1_000);
  });

  it("updates on each interval", () => {
    render(<Clock />);

    act(() => vi.advanceTimersByTime(350));

    expect(shownNow()).toBe(1_300);
  });

  it("stops ticking once unmounted", () => {
    const { unmount } = render(<Clock />);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
