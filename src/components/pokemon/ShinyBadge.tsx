import { Sparkles } from "lucide-react";

export function ShinyBadge({ className }: { className: string }) {
  return (
    <span
      className={`border-ink bg-accent absolute flex items-center justify-center rounded-full border-2 text-white ${className}`}
    >
      <Sparkles className="size-3/5" strokeWidth={2.5} aria-hidden />
    </span>
  );
}
