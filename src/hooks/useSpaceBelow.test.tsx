import { act, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSpaceBelow } from "./useSpaceBelow";

function Field({ margin = 16 }: { margin?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const height = useSpaceBelow(ref, margin);

  return (
    <div ref={ref} data-testid="field">
      {height}
    </div>
  );
}

function shownHeight() {
  return Number(screen.getByTestId("field").textContent);
}

function placeField(top: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    top,
  } as DOMRect);
}

describe("useSpaceBelow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("fills the space between the element and the bottom of the screen", () => {
    vi.useFakeTimers();
    placeField(200);
    window.innerHeight = 900;
    render(<Field />);

    act(() => vi.advanceTimersByTime(20));

    expect(shownHeight()).toBe(900 - 200 - 16);
  });

  it("never goes below a playable minimum", () => {
    vi.useFakeTimers();
    placeField(700);
    window.innerHeight = 800;
    render(<Field />);

    act(() => vi.advanceTimersByTime(20));

    expect(shownHeight()).toBe(280);
  });

  it("measures again on resize, but not on scroll, so it can't grow itself", () => {
    vi.useFakeTimers();
    placeField(200);
    window.innerHeight = 900;
    render(<Field />);
    act(() => vi.advanceTimersByTime(20));

    placeField(100);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(20);
    });

    expect(shownHeight()).toBe(900 - 200 - 16);

    window.innerHeight = 600;
    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.advanceTimersByTime(20);
    });

    expect(shownHeight()).toBe(600 - 100 - 16);
  });
});
