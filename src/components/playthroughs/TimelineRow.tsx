import type { ReactNode } from "react";

type TimelineRowProps = {
  step: number;
  icon: ReactNode;
  badgeClassName: string;
  dimmed?: boolean;
  children: ReactNode;
};

export function TimelineRow({
  step,
  icon,
  badgeClassName,
  dimmed = false,
  children,
}: TimelineRowProps) {
  return (
    <li className="relative flex items-center gap-3 py-1.5">
      <span
        className={`border-ink z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 ${badgeClassName}`}
      >
        {icon}
      </span>
      <div
        className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 ${
          dimmed ? "text-ink/60" : ""
        }`}
      >
        {children}
      </div>
      <span className="text-ink/40 hidden shrink-0 text-xs font-semibold sm:block">
        #{step}
      </span>
    </li>
  );
}
