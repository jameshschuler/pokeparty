import { useEffect, useState, type RefObject } from "react";

const MIN_HEIGHT = 280;

export function useSpaceBelow(
  ref: RefObject<HTMLElement | null>,
  margin: number,
): number {
  const [height, setHeight] = useState(MIN_HEIGHT);

  useEffect(() => {
    const viewport = window.visualViewport;
    let frame = 0;

    function measure() {
      const element = ref.current;

      if (!element) {
        return;
      }

      const pageTop = element.getBoundingClientRect().top + window.scrollY;
      const visibleHeight = viewport?.height ?? window.innerHeight;
      setHeight(
        Math.max(MIN_HEIGHT, Math.floor(visibleHeight - pageTop - margin)),
      );
    }

    function scheduleMeasure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    scheduleMeasure();
    viewport?.addEventListener("resize", scheduleMeasure);
    window.addEventListener("resize", scheduleMeasure);

    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [ref, margin]);

  return height;
}
