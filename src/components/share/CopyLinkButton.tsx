import { Link } from "lucide-react";
import { useToastContext } from "../../contexts/toast-context";
import { teamShareUrl } from "../../lib/share";
import type { TeamMember } from "../../types/team";

export function CopyLinkButton({ members }: { members: TeamMember[] }) {
  const { showToast } = useToastContext();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        teamShareUrl(members, window.location.origin),
      );
      showToast("Link copied!");
    } catch {
      showToast("Couldn't copy the link.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={members.length === 0}
      className="border-ink bg-accent shadow-sticker-sm flex min-h-11 items-center gap-1.5 rounded-full border-[3px] px-4 font-semibold whitespace-nowrap transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:bg-white/60 disabled:shadow-none"
    >
      <Link className="size-5" aria-hidden />
      Copy link
    </button>
  );
}
