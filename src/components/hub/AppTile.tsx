import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

type AppTileProps = {
  to: LinkProps["to"];
  icon: ReactNode;
  title: string;
  description: string;
};

export function AppTile({ to, icon, title, description }: AppTileProps) {
  return (
    <Link
      to={to}
      className="border-ink shadow-sticker flex items-center gap-4 rounded-2xl border-[3px] bg-white p-4 transition active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      <span className="border-ink bg-accent flex size-14 shrink-0 items-center justify-center rounded-2xl border-[3px]">
        {icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-xl font-bold">{title}</span>
        <span className="text-ink/70">{description}</span>
      </span>
    </Link>
  );
}
