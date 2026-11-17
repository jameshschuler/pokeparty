import { ImageOff } from "lucide-react";
import { useState } from "react";
import { hnsSpriteUrl } from "../../lib/nature-dex-data";

type HnsSpriteProps = { dexNumber: number; name: string; shiny: boolean };

export function HnsSprite({ dexNumber, name, shiny }: HnsSpriteProps) {
  const src = hnsSpriteUrl(dexNumber, shiny);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const alt = shiny ? `Shiny ${name}` : name;
  const box = `size-16 rounded-xl ${shiny ? "bg-accent/30" : "bg-surface"}`;

  if (failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={alt}
        title="Sprite unavailable"
        className={`${box} text-ink/50 flex items-center justify-center`}
      >
        <ImageOff className="size-5" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={`${box} [image-rendering:pixelated]`}
    />
  );
}
