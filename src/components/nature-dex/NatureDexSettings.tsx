import { Settings2, X } from "lucide-react";
import { useRef } from "react";
import { useNatureDexContext } from "../../contexts/nature-dex-context";
import { ICON_BUTTON } from "../shared/button-styles";
import { SettingChoice } from "./SettingChoice";

export function NatureDexSettings() {
  const { settings, updateSettings } = useNatureDexContext();
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Settings"
        title="Settings"
        className="border-ink shadow-sticker-sm flex size-12 shrink-0 items-center justify-center rounded-2xl border-[3px] bg-white transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <Settings2 className="size-6" aria-hidden />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="nature-dex-settings-title"
        className="border-ink text-ink shadow-sticker backdrop:bg-ink/40 m-auto w-[min(28rem,calc(100%-2rem))] rounded-3xl border-[3px] bg-white p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="nature-dex-settings-title" className="text-2xl font-bold">
            Settings
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close settings"
            className={ICON_BUTTON}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <SettingChoice
            label="Learnsets"
            hint="H&S uses the Gen 7 lists. Gen 3 shows the older level-up and egg moves where the docs include them."
            value={settings.learnset}
            options={[
              ["hns", "Gen 7 (H&S)"],
              ["gen3", "Gen 3"],
            ]}
            onChange={(learnset) => updateSettings({ learnset })}
          />
          <SettingChoice
            label="Physical/special split"
            hint="Off uses the Gen 3 rule, where a move's type decides its category. This changes the best moves and nature picks."
            value={settings.split ? "on" : "off"}
            options={[
              ["on", "On"],
              ["off", "Off"],
            ]}
            onChange={(split) => updateSettings({ split: split === "on" })}
          />
          <SettingChoice
            label="Sprites"
            hint="You can still flip any one Pokémon with its sparkles button."
            value={settings.shiny ? "shiny" : "normal"}
            options={[
              ["normal", "Normal"],
              ["shiny", "Shiny"],
            ]}
            onChange={(sprite) => updateSettings({ shiny: sprite === "shiny" })}
          />
        </div>
      </dialog>
    </>
  );
}
