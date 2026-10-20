import { spriteUrl } from "../../lib/pokemon";

type PokemonSpriteProps = {
  id: number;
  shiny: boolean;
  alt: string;
  className?: string;
  eager?: boolean;
  onLoad?: () => void;
  onError?: () => void;
};

export function PokemonSprite({
  id,
  shiny,
  alt,
  className = "",
  eager = false,
  onLoad,
  onError,
}: PokemonSpriteProps) {
  return (
    <img
      src={spriteUrl(id, shiny)}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      width={475}
      height={475}
      onLoad={onLoad}
      onError={onError}
      className={`aspect-square h-auto object-contain ${className}`}
    />
  );
}
