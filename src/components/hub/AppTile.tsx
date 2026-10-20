import type { ReactNode } from "react";

type AppTileProps = {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
};

export function AppTile({ icon, title, description, badge }: AppTileProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="border-ink bg-accent flex size-14 shrink-0 items-center justify-center rounded-2xl border-[3px]">
        {icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="flex items-center gap-2 text-xl font-bold">
          {title}
          {badge && (
            <span className="border-ink bg-surface rounded-full border-2 px-2 text-xs font-semibold">
              {badge}
            </span>
          )}
        </span>
        <span className="text-ink/70">{description}</span>
      </span>
    </div>
  );
}
