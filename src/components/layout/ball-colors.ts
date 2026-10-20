import type { Theme } from "../../lib/theme";

export const BALL_COLORS: Record<Theme, { top: string; detail?: string }> = {
  poke: { top: "var(--ball-poke)" },
  great: { top: "var(--ball-great)", detail: "var(--ball-great-stripe)" },
  ultra: { top: "var(--ball-ultra)", detail: "var(--ball-ultra-band)" },
  master: { top: "var(--ball-master)", detail: "var(--ball-master-spot)" },
};
