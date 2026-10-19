import { useEffect, useRef, useState } from "react";

const PAGE_SIZE = 48;

export function usePagedItems<T>(items: T[]) {
  const [count, setCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = count < items.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCount((current) => current + PAGE_SIZE);
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [count, hasMore]);

  return { visibleItems: items.slice(0, count), sentinelRef };
}
