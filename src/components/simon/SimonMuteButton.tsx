import { Volume2, VolumeX } from "lucide-react";
import { useSimonContext } from "../../contexts/simon-context";
import { ICON_BUTTON } from "../shared/button-styles";

export function SimonMuteButton() {
  const { sound } = useSimonContext();

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
