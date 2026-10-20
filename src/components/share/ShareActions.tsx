import { teamShareUrl } from "../../lib/share";
import type { TeamMember } from "../../types/team";
import { CopyLinkButton } from "./CopyLinkButton";
import { ShareButton } from "./ShareButton";

export function ShareActions({ members }: { members: TeamMember[] }) {
  const url = teamShareUrl(members, window.location.origin);
  const empty = members.length === 0;

  return (
    <>
      <CopyLinkButton url={url} disabled={empty} />
      <ShareButton url={url} title="My PokeParty team" disabled={empty} />
    </>
  );
}
