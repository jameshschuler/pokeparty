import { useNatureDexContext } from "../../contexts/nature-dex-context";
import {
  MOVE_TABS,
  moveList,
  type DexEntry,
  type MoveTab,
} from "../../lib/nature-dex";

const TAB_LABELS: Record<MoveTab, string> = {
  level: "Level up",
  tm: "TM / HM",
  tutor: "Tutor",
  egg: "Egg",
  where: "Where to find",
};

type MoveTabsProps = { entry: DexEntry; tab: MoveTab };

export function MoveTabs({ entry, tab }: MoveTabsProps) {
  const { settings, setOpenTab } = useNatureDexContext();

  function count(option: MoveTab): number {
    return option === "where"
      ? entry.locations.length
      : moveList(entry, option, settings).length;
  }

  return (
    <div
      role="tablist"
      aria-label={`${entry.name} moves`}
      className="flex flex-wrap gap-1.5"
    >
      {MOVE_TABS.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={option === tab}
          onClick={() => setOpenTab(entry.dexNumber, option)}
          className={`border-ink flex min-h-9 items-center gap-1 rounded-full border-2 px-3 text-sm font-semibold whitespace-nowrap transition ${
            option === tab ? "bg-ink text-white" : "bg-white"
          }`}
        >
          {TAB_LABELS[option]}
          <span className="text-xs tabular-nums opacity-70">
            {count(option)}
          </span>
        </button>
      ))}
    </div>
  );
}
