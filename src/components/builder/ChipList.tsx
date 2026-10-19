import type { ReactNode } from "react";

export function ChipList({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <ul className="flex gap-2" aria-label={label}>
      {children}
    </ul>
  );
}
