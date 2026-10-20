import { Link } from "@tanstack/react-router";
import { BallIcon } from "./BallIcon";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Header() {
  return (
    <header className="border-ink bg-primary border-b-[3px]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2">
        <Link to="/" className="flex items-center gap-2 text-white">
          <BallIcon className="size-8" />
          <span className="text-2xl font-bold tracking-wide [text-shadow:2px_2px_0_var(--color-ink)]">
            PokeParty
          </span>
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
