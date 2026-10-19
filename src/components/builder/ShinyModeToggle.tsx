import { Sparkles } from "lucide-react";
import { useTeamBuilderContext } from "../../contexts/team-builder-context";

export function ShinyModeToggle() {
  const { shinyMode, setShinyMode } = useTeamBuilderContext();

  return (
    <button
      type="button"
      onClick={() => setShinyMode(!shinyMode)}
      aria-pressed={shinyMode}
      aria-label="Shiny mode"
      title="Shiny mode"
      className={`border-ink shadow-sticker-sm flex size-12 shrink-0 items-center justify-center rounded-2xl border-[3px] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
        shinyMode ? "bg-primary text-white" : "bg-white"
      }`}
    >
      <Sparkles className="size-6" aria-hidden />
    </button>
  );
}
