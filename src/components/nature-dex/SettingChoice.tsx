import { ChipList } from "../shared/ChipList";
import { FilterChip } from "../shared/FilterChip";

type SettingChoiceProps<T extends string> = {
  label: string;
  hint: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
};

export function SettingChoice<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: SettingChoiceProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{label}</span>
        <ChipList label={label}>
          {options.map(([option, text]) => (
            <li key={option}>
              <FilterChip
                selected={option === value}
                selectedClassName="bg-primary text-white"
                onClick={() => onChange(option)}
              >
                {text}
              </FilterChip>
            </li>
          ))}
        </ChipList>
      </div>
      <p className="text-ink/70 text-sm">{hint}</p>
    </div>
  );
}
