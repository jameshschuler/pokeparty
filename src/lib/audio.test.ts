import { afterEach, describe, expect, it, vi } from "vitest";
import { canPlayCries, getCryAudio, unlockCries } from "./audio";

describe("cry audio", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("can't play cries without Web Audio", () => {
    vi.stubGlobal("AudioContext", undefined);

    expect(canPlayCries()).toBe(false);
  });

  it("can't play cries when the browser can't play Ogg Vorbis", () => {
    vi.stubGlobal("AudioContext", class {});
    vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue("");

    expect(canPlayCries()).toBe(false);
  });

  it("does nothing when unlocking without cry support", () => {
    vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue("");

    expect(() => unlockCries()).not.toThrow();
  });

  it("shares one context and resumes it when it isn't running", () => {
    const resume = vi.fn(() => Promise.resolve());
    vi.stubGlobal(
      "AudioContext",
      class {
        state = "suspended";
        destination = {};
        resume = resume;
        createGain() {
          return { gain: { value: 1 }, connect: () => undefined };
        }
      },
    );
    vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue(
      "probably",
    );

    unlockCries();
    unlockCries();

    expect(getCryAudio()).toBe(getCryAudio());
    expect(resume).toHaveBeenCalledTimes(2);
  });
});
