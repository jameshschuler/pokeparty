import type { TeamMember } from "../../types/team";
import { CopyLinkButton } from "./CopyLinkButton";
import { ShareButton } from "./ShareButton";

export function ShareActions({ members }: { members: TeamMember[] }) {
  return (
    <>
      <CopyLinkButton members={members} />
      <ShareButton members={members} />
    </>
  );
}
