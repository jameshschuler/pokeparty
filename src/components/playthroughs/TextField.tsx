type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric";
  autoFocus?: boolean;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  inputMode = "text",
  autoFocus = false,
}: TextFieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="font-semibold">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        autoFocus={autoFocus}
        className="border-ink shadow-sticker-sm placeholder:text-ink/50 focus:ring-accent min-h-12 w-full min-w-0 rounded-2xl border-[3px] bg-white px-3 text-lg outline-none focus:ring-4"
      />
    </label>
  );
}
