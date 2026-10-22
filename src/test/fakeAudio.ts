import { vi } from "vitest";

export type FakeAudio = {
  fetched: string[];
  played: string[];
  stopped: number;
  state: string;
};

const audio: FakeAudio = {
  fetched: [],
  played: [],
  stopped: 0,
  state: "running",
};

class FakeAudioContext {
  destination = {};

  get state() {
    return audio.state;
  }

  createGain() {
    return { gain: { value: 1 }, connect: () => undefined };
  }

  createBufferSource() {
    const source = {
      buffer: null as string | null,
      connect: () => undefined,
      start: () => audio.played.push(source.buffer!),
      stop: () => {
        audio.stopped += 1;
      },
    };

    return source;
  }

  decodeAudioData(data: string) {
    return Promise.resolve(data);
  }

  resume() {
    audio.state = "running";

    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }
}

export function installFakeAudio(): FakeAudio {
  audio.fetched = [];
  audio.played = [];
  audio.stopped = 0;
  audio.state = "running";
  vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue(
    "probably",
  );
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal("fetch", (url: string) => {
    audio.fetched.push(url);

    return Promise.resolve({ arrayBuffer: () => Promise.resolve(url) });
  });

  return audio;
}
