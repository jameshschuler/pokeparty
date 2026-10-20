import type { ReactNode } from "react";

type FilterChipProps = {
  selected: boolean;
  selectedClassName: string;
  onClick: () => void;
  children: ReactNode;
};

export function FilterChip({
  selected,
  selectedClassName,
  onClick,
  children,
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`border-ink flex min-h-9 items-center gap-1 rounded-full border-2 px-3 text-sm font-semibold whitespace-nowrap transition ${
        selected ? `${selectedClassName} shadow-sticker-sm` : "bg-white"
      }`}
    >
      {children}
    </button>
  );
}
