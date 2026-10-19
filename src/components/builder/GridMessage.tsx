import type { ReactNode } from "react";

export function GridMessage({ children }: { children: ReactNode }) {
  return (
    <p className="border-ink rounded-2xl border-[3px] border-dashed bg-white/70 px-6 py-10 text-center text-lg font-medium">
      {children}
    </p>
  );
}
