import { useThemeContext } from "../../contexts/theme-context";
import type { Theme } from "../../lib/theme";
import { BALL_COLORS } from "./ball-colors";

type BallIconProps = {
  theme?: Theme;
  className: string;
};

export function BallIcon({ theme: ballTheme, className }: BallIconProps) {
  const { theme: currentTheme } = useThemeContext();
  const theme = ballTheme ?? currentTheme;
  const colors = BALL_COLORS[theme];

  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="#fff"
        stroke="var(--color-ink)"
        strokeWidth="3"
      />
      <path
        d="M2 16a14 14 0 0 1 28 0z"
        fill={colors.top}
        stroke="var(--color-ink)"
        strokeWidth="3"
      />
      {theme === "master" && (
        <>
          <circle cx="8.5" cy="10.5" r="2.6" fill={colors.detail} />
          <circle cx="23.5" cy="10.5" r="2.6" fill={colors.detail} />
          <path
            d="M12.6 12.4V6.6l3.4 3.6 3.4-3.6v5.8"
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      )}
      {theme === "great" && (
        <path
          d="M6.5 13.5a10 10 0 0 1 4-6.5M25.5 13.5a10 10 0 0 0-4-6.5"
          fill="none"
          stroke={colors.detail}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
      {theme === "ultra" && (
        <path
          d="M10 5.5v8.5M22 5.5v8.5"
          fill="none"
          stroke={colors.detail}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
      <circle
        cx="16"
        cy="16"
        r="4.5"
        fill="#fff"
        stroke="var(--color-ink)"
        strokeWidth="3"
      />
    </svg>
  );
}
