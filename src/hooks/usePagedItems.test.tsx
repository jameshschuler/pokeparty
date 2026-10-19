import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePagedItems } from "./usePagedItems";

let reveal: () => void = () => {};

class RevealingObserver {
  constructor(callback: IntersectionObserverCallback) {
    reveal = () =>
      callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
  }
  observe() {}
  disconnect() {}
}

function range(length: number, offset = 0) {
  return Array.from({ length }, (_, index) => index + offset);
}

function PagedList({ items }: { items: number[] }) {
  const { visibleItems, sentinelRef } = usePagedItems(items);
  return (
    <>
      <p data-testid="count">{visibleItems.length}</p>
      <p data-testid="first">{visibleItems[0]}</p>
      <div ref={sentinelRef} />
    </>
  );
}

describe("usePagedItems", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", RevealingObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the first page", () => {
    render(<PagedList items={range(100)} />);

    expect(screen.getByTestId("count")).toHaveTextContent("48");
  });

  it("adds a page when the sentinel comes into view", () => {
    render(<PagedList items={range(100)} />);

    act(() => reveal());

    expect(screen.getByTestId("count")).toHaveTextContent("96");
  });

  it("goes back to the first page when the items change", () => {
    const { rerender } = render(<PagedList items={range(100)} />);
    act(() => reveal());

    rerender(<PagedList items={range(100, 1000)} />);

    expect(screen.getByTestId("count")).toHaveTextContent("48");
    expect(screen.getByTestId("first")).toHaveTextContent("1000");
  });
});
