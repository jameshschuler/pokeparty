import { useThemeContext } from "../../contexts/theme-context";
import { THEME_LABELS, THEMES } from "../../lib/theme";
import { BallIcon } from "./BallIcon";

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeContext();

  return (
    <div role="group" aria-label="Theme" className="flex gap-0.5">
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === theme}
          aria-label={THEME_LABELS[option]}
          title={THEME_LABELS[option]}
          onClick={() => setTheme(option)}
          className={`flex size-10 items-center justify-center rounded-full transition active:scale-90 ${
            option === theme ? "bg-white/30" : "opacity-60 hover:opacity-100"
          }`}
        >
          <BallIcon theme={option} className="size-7" />
        </button>
      ))}
    </div>
  );
}
