import { CRY_TYPE, CRY_VOLUME } from "./cries";

type CryAudio = {
  context: AudioContext;
  output: GainNode;
};

let cryAudio: CryAudio | null = null;

export function canPlayCries(): boolean {
  return (
    typeof AudioContext !== "undefined" &&
    new Audio().canPlayType(CRY_TYPE) !== ""
  );
}

export function getCryAudio(): CryAudio {
  if (!cryAudio) {
    const context = new AudioContext();
    const output = context.createGain();
    output.gain.value = CRY_VOLUME;
    output.connect(context.destination);
    cryAudio = { context, output };
  }

  return cryAudio;
}

export function unlockCries(): void {
  if (!canPlayCries()) {
    return;
  }

  const { context } = getCryAudio();

  if (context.state !== "running") {
    void context.resume();
  }
}
