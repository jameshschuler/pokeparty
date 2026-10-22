import { Share2 } from "lucide-react";
import { useToastContext } from "../../contexts/toast-context";
import { ICON_BUTTON } from "../shared/button-styles";

type ShareButtonProps = {
  url: string;
  title: string;
  disabled?: boolean;
};

export function ShareButton({ url, title, disabled }: ShareButtonProps) {
  const { showToast } = useToastContext();

  if (typeof navigator.share !== "function") {
    return null;
  }

  async function handleShare() {
    try {
      await navigator.share({ title, url });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      showToast("Couldn't share that link.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={disabled}
      aria-label="Share"
      className={ICON_BUTTON}
    >
      <Share2 className="size-5" aria-hidden />
    </button>
  );
}
