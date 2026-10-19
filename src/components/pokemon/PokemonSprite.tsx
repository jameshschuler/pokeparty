import { spriteUrl } from "../../lib/pokemon";

type PokemonSpriteProps = {
  id: number;
  shiny: boolean;
  alt: string;
  className?: string;
};

export function PokemonSprite({
  id,
  shiny,
  alt,
  className = "",
}: PokemonSpriteProps) {
  return (
    <img
      src={spriteUrl(id, shiny)}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={475}
      height={475}
      className={`aspect-square h-auto object-contain ${className}`}
    />
  );
}
