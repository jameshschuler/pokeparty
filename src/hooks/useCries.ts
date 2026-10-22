import { useCallback, useEffect, useRef, useState } from "react";
import {
  CRY_TYPE,
  CRY_VOLUME,
  cryUrl,
  loadMuted,
  saveMuted,
} from "../lib/cries";

export type Cries = {
  supported: boolean;
  muted: boolean;
  toggleMuted: () => void;
  play: (index: number) => void;
  stop: () => void;
};

function stopAll(audios: HTMLAudioElement[]) {
  for (const audio of audios) {
    audio.pause();
  }
}

export function useCries(speciesIds: number[]): Cries {
  const [supported] = useState(() => new Audio().canPlayType(CRY_TYPE) !== "");
  const [muted, setMuted] = useState(loadMuted);
  const mutedRef = useRef(muted);
  const audiosRef = useRef<HTMLAudioElement[]>([]);
  const idsKey = speciesIds.join(",");

  useEffect(() => {
    if (!supported) {
      return;
    }

    const audios = idsKey.split(",").map((id) => {
      const audio = new Audio(cryUrl(Number(id)));
      audio.preload = "auto";
      audio.volume = CRY_VOLUME;

      return audio;
    });
    audiosRef.current = audios;

    return () => {
      for (const audio of audios) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      audiosRef.current = [];
    };
  }, [supported, idsKey]);

  const play = useCallback((index: number) => {
    const audio = audiosRef.current[index];

    if (mutedRef.current || !audio) {
      return;
    }

    stopAll(audiosRef.current);
    audio.currentTime = 0;
    audio.play().catch(() => undefined);
  }, []);

  const stop = useCallback(() => stopAll(audiosRef.current), []);

  function toggleMuted() {
    const next = !muted;
    mutedRef.current = next;
    setMuted(next);
    saveMuted(next);

    if (next) {
      stop();
    }
  }

  return { supported, muted, toggleMuted, play, stop };
}
