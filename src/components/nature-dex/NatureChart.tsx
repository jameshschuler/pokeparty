import { useNatureDexContext } from "../../contexts/nature-dex-context";
import { natureFor, STAT_LABELS, type Stat } from "../../lib/natures";
import { SHEET, SHEET_HEADING } from "./nature-dex-styles";

const CHART_STATS: Stat[] = ["atk", "def", "spa", "spd", "spe"];

const CELL = "border-ink/15 border-2 px-1.5 py-1 text-center";

const HEADER_CELL = `${CELL} bg-surface text-xs font-bold`;

export function NatureChart() {
  const { updateFilters } = useNatureDexContext();

  function pick(up: Stat, down: Stat) {
    updateFilters({ nature: natureFor(up, down) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className={SHEET}>
      <h2 className={SHEET_HEADING}>Nature chart</h2>
      <p className="text-ink/70 text-sm">
        Rows raise a stat by 10%, columns lower one by 10%. The diagonal is
        neutral. Tap a nature to see who wants it.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-md border-collapse text-xs">
          <thead>
            <tr>
              <td className={HEADER_CELL} />
              {CHART_STATS.map((down) => (
                <th key={down} scope="col" className={HEADER_CELL}>
                  <span className="text-wrong">−{STAT_LABELS[down]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHART_STATS.map((up) => (
              <tr key={up}>
                <th scope="row" className={HEADER_CELL}>
                  <span className="text-correct">+{STAT_LABELS[up]}</span>
                </th>
                {CHART_STATS.map((down) => (
                  <td key={down} className={CELL}>
                    {up === down ? (
                      <span className="text-ink/50 italic">
                        {natureFor(up, down)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => pick(up, down)}
                        className="hover:bg-accent/40 rounded-md px-1 py-0.5 font-semibold"
                      >
                        {natureFor(up, down)}
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
