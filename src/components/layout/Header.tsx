import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="border-ink bg-primary border-b-[3px]">
      <div className="mx-auto flex max-w-5xl items-center px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-white">
          <img src="/favicon.svg" alt="" className="size-8" />
          <span className="text-2xl font-bold tracking-wide [text-shadow:2px_2px_0_var(--color-ink)]">
            PokeParty
          </span>
        </Link>
      </div>
    </header>
  );
}
