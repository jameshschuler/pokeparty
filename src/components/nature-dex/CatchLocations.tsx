import type { CatchLocation } from "../../lib/nature-dex-data";

export function CatchLocations({ locations }: { locations: CatchLocation[] }) {
  if (locations.length === 0) {
    return (
      <p className="text-ink/70 text-sm">
        Not found in the wild. Get it by evolving or breeding an earlier form.
      </p>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]">
      {locations.map(({ place, details }, index) => (
        <li
          key={`${place}-${index}`}
          className="bg-surface min-w-0 rounded-xl px-3 py-2"
        >
          <b className="block text-sm font-bold">{place}</b>
          {details.map((detail, detailIndex) => (
            <span key={detailIndex} className="text-ink/70 block text-xs">
              {detail}
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}
