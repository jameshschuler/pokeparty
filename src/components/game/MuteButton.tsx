import { Volume2, VolumeX } from "lucide-react";
import type { Cries } from "../../hooks/useCries";
import { ICON_BUTTON } from "../shared/button-styles";

type MuteButtonProps = {
  sound: Pick<Cries, "supported" | "muted" | "toggleMuted">;
};

export function MuteButton({ sound }: MuteButtonProps) {
  if (!sound.supported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={sound.toggleMuted}
      aria-pressed={sound.muted}
      aria-label="Mute"
      className={ICON_BUTTON}
    >
      {sound.muted ? (
        <VolumeX className="size-5" aria-hidden />
      ) : (
        <Volume2 className="size-5" aria-hidden />
      )}
    </button>
  );
}
