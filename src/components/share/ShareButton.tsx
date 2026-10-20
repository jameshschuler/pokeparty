import { Share2 } from "lucide-react";
import { useToastContext } from "../../contexts/toast-context";

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
      className="border-ink shadow-sticker-sm flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] bg-white transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:bg-white/60 disabled:shadow-none"
    >
      <Share2 className="size-5" aria-hidden />
    </button>
  );
}
