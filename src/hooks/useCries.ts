import { useCallback, useEffect, useRef, useState } from "react";
import { canPlayCries, getCryAudio, unlockCries } from "../lib/audio";
import { cryUrl, loadMuted, saveMuted } from "../lib/cries";

export type Cries = {
  supported: boolean;
  muted: boolean;
  toggleMuted: () => void;
  play: (index: number) => void;
  stop: () => void;
  unlock: () => void;
};

async function loadCry(
  context: AudioContext,
  speciesId: number,
  signal: AbortSignal,
): Promise<AudioBuffer> {
  const response = await fetch(cryUrl(speciesId), { signal });
  const data = await response.arrayBuffer();

  return context.decodeAudioData(data);
}

export function useCries(speciesIds: number[]): Cries {
  const [supported] = useState(canPlayCries);
  const [muted, setMuted] = useState(loadMuted);
  const mutedRef = useRef(muted);
  const buffersRef = useRef<(AudioBuffer | null)[]>([]);
  const playingRef = useRef<AudioBufferSourceNode | null>(null);
  const idsKey = speciesIds.join(",");

  useEffect(() => {
    if (!supported) {
      return;
    }

    const { context } = getCryAudio();
    const ids = idsKey.split(",").map(Number);
    const abort = new AbortController();
    const buffers: (AudioBuffer | null)[] = ids.map(() => null);
    buffersRef.current = buffers;

    ids.forEach((id, index) => {
      loadCry(context, id, abort.signal)
        .then((buffer) => {
          buffers[index] = buffer;
        })
        .catch(() => undefined);
    });

    return () => abort.abort();
  }, [supported, idsKey]);

  const stop = useCallback(() => {
    playingRef.current?.stop();
    playingRef.current = null;
  }, []);

  const play = useCallback(
    (index: number) => {
      const buffer = buffersRef.current[index];

      if (mutedRef.current || !buffer) {
        return;
      }

      stop();
      const { context, output } = getCryAudio();
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(output);
      source.start();
      playingRef.current = source;
    },
    [stop],
  );

  function toggleMuted() {
    const next = !muted;
    mutedRef.current = next;
    setMuted(next);
    saveMuted(next);

    if (next) {
      stop();
    }
  }

  return { supported, muted, toggleMuted, play, stop, unlock: unlockCries };
}
