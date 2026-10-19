import { CopyLinkButton } from "./CopyLinkButton";
import { ShareButton } from "./ShareButton";

export function ShareActions({ pokemonIds }: { pokemonIds: number[] }) {
  return (
    <>
      <CopyLinkButton pokemonIds={pokemonIds} />
      <ShareButton pokemonIds={pokemonIds} />
    </>
  );
}
