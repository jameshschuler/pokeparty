import type { ReactNode } from "react";

export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4">
      <div className="flex w-max gap-2 py-1">{children}</div>
    </div>
  );
}
